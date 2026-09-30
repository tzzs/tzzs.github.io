import type { Activity, Stats, TrackPoint } from './types';
import {
	DISTANCE_FIELD_MIN_COVERAGE,
	DIST_DEAD_ZONE_M,
	ELE_ANOMALY_DROP_M,
	ELE_FILTER_WINDOW,
	ELE_MIN_DELTA_M,
} from './constants';

/**
 * 统计层。距离、爬升、时长、心率/步频/功率的汇总都在这里算，视图只负责显示。
 *
 * `computeDistanceSeries` 与 `computeElevationSeries` 之所以对外可见：分段表要用同一套
 * 里程与高程序列，否则「总距离」和「各段相加」会来自两种算法，那是最难解释给用户的不一致。
 */

/** 地球半径（米），haversine 用 */
const EARTH_RADIUS_M = 6371008.8;

function toRadians(degrees: number): number {
	return (degrees * Math.PI) / 180;
}

export function haversineMeters(a: TrackPoint, b: TrackPoint): number | null {
	if (a.lat === null || a.lon === null || b.lat === null || b.lon === null) return null;
	const dLat = toRadians(b.lat - a.lat);
	const dLon = toRadians(b.lon - a.lon);
	const lat1 = toRadians(a.lat);
	const lat2 = toRadians(b.lat);
	const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
	return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface DistanceSeries {
	/** 与 points 等长的累计里程（米）；无法确定的位置为 null */
	values: (number | null)[];
	/** 采用哪种来源，决定总距离是否可信到可以省掉设备自报值 */
	source: 'field' | 'gps';
	/** 因缺坐标而被跳过的点数，用于 pointSkippedNoCoord 警告 */
	pointsWithoutCoords: number;
}

/** FIT 的 distance 是累计值，但真实文件里常常只有零星几个点带它，所以要用覆盖率门槛把关 */
function fieldSeriesUsable(points: TrackPoint[]): boolean {
	const present = points.filter((p) => p.distance !== null);
	if (present.length === 0) return false;
	if (present.length / points.length < DISTANCE_FIELD_MIN_COVERAGE) return false;

	const first = present[0].distance as number;
	const last = present[present.length - 1].distance as number;
	if (!(last > first)) return false;

	for (let i = 1; i < present.length; i++) {
		if ((present[i].distance as number) < (present[i - 1].distance as number)) return false;
	}
	return true;
}

export function computeDistanceSeries(points: TrackPoint[]): DistanceSeries {
	if (points.length > 0 && fieldSeriesUsable(points)) {
		let carried: number | null = null;
		const values = points.map((point) => {
			carried = point.distance ?? carried;
			return carried;
		});
		return { values, source: 'field', pointsWithoutCoords: 0 };
	}

	// 锚点式累计：位移不足死区时**不动锚点**，让后续的缓慢移动在这个点上继续累加。
	// 逐段丢弃是错的——实测那份 Strava 徒步文件每秒位移约 0.6 米，全部小于 1.5 米死区，
	// 逐段丢弃把 9764 米算成了 86.6 米，连带把分段表压成了一个残段。
	const values: (number | null)[] = [];
	let total = 0;
	let missingCoords = 0;
	let anchor: TrackPoint | null = null;
	for (const point of points) {
		if (point.lat === null || point.lon === null) {
			missingCoords++;
			values.push(total);
			continue;
		}
		if (anchor === null) {
			anchor = point;
			values.push(total);
			continue;
		}
		const delta = haversineMeters(anchor, point);
		if (delta !== null && delta >= DIST_DEAD_ZONE_M) {
			total += delta;
			anchor = point;
		}
		values.push(total);
	}
	return { values, source: 'gps', pointsWithoutCoords: missingCoords };
}

export interface ElevationSeries {
	values: (number | null)[];
	/** 被判为漂移而丢弃的高程值个数，用于 eleAnomalyDropped 警告 */
	anomaliesDropped: number;
}

/**
 * 先去漂移、再中值滤波。
 *
 * 不做这一步的话「停在电梯里」会被累计成几十米爬升，一次 5 公里跑能算出 200 米上升幅度——
 * 这是轨迹工具的标志性 bug（设计稿 §7.3）。
 */
export function computeElevationSeries(points: TrackPoint[]): ElevationSeries {
	const raw = points.map((p) => p.ele);

	const deDrifted: (number | null)[] = [];
	let lastAccepted: number | null = null;
	let dropped = 0;
	for (const value of raw) {
		if (value === null) {
			deDrifted.push(null);
			continue;
		}
		if (lastAccepted !== null && Math.abs(value - lastAccepted) > ELE_ANOMALY_DROP_M) {
			dropped++;
			deDrifted.push(null);
			continue;
		}
		lastAccepted = value;
		deDrifted.push(value);
	}

	const half = Math.floor(ELE_FILTER_WINDOW / 2);
	const values = deDrifted.map((center, i) => {
		if (center === null) return null;
		const window: number[] = [];
		for (let k = i - half; k <= i + half; k++) {
			const candidate = deDrifted[k];
			if (typeof candidate === 'number') window.push(candidate);
		}
		// 序列开头/结尾凑不满一个完整窗口时不滤波：此时取到的「中值」其实是邻域中位数，
		// 会把一段真实的上坡抹平成同一个高度。长序列里这只影响首尾各两个点，可以接受。
		if (window.length < ELE_FILTER_WINDOW) return center;
		window.sort((a, b) => a - b);
		return window[Math.floor(window.length / 2)];
	});

	return { values, anomaliesDropped: dropped };
}

export interface AscentDescent {
	ascentM: number | null;
	descentM: number | null;
}

/**
 * 锚点式累计：只有相对「上一个已确认高程」变化超过 ELE_MIN_DELTA_M 才算一次真实升降。
 * from / to 是 [from, to) 的下标区间，分段表按段调用它，段内锚点独立起算。
 */
export function accumulateAscent(elevation: (number | null)[], from: number, to: number): AscentDescent {
	let anchor: number | null = null;
	let ascent = 0;
	let descent = 0;
	let touched = 0;

	for (let i = from; i < to; i++) {
		const value = elevation[i];
		if (typeof value !== 'number') continue;
		touched++;
		if (anchor === null) {
			anchor = value;
			continue;
		}
		const delta = value - anchor;
		if (Math.abs(delta) < ELE_MIN_DELTA_M) continue;
		if (delta > 0) ascent += delta;
		else descent += -delta;
		anchor = value;
	}

	// 一个高程值都没有时返回 null（「不知道」），而不是 0 米（「确实是平的」）
	return touched === 0 ? { ascentM: null, descentM: null } : { ascentM: ascent, descentM: descent };
}

function meanOf(values: number[]): number | null {
	if (values.length === 0) return null;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function maxOf(values: number[]): number | null {
	if (values.length === 0) return null;
	return values.reduce((m, v) => (v > m ? v : m), values[0]);
}

export interface ComputedActivity {
	stats: Stats;
	distance: DistanceSeries;
	elevation: ElevationSeries;
}

/**
 * 把逐点累计里程按比例对齐到设备自报的总距离。
 *
 * 不做这件事，统计面板显示的是设备值（实测样本 9764 米），而分段表与剖面图 X 轴来自点重建
 * （同一个文件只有 8395 米），访客一眼就能看到「各段加起来不等于总距离」。设备值通常更可信
 * （导出方自己做过滤波），所以选择信设备值，同时让序列整体缩放保持一致，而不是两边各用各的。
 */
function alignToDeclared(distance: DistanceSeries, declaredM: number | null): DistanceSeries {
	if (declaredM === null || declaredM <= 0) return distance;
	const last = distance.values[distance.values.length - 1];
	if (last === null || last <= 0 || Math.abs(last - declaredM) < 0.5) return distance;

	const factor = declaredM / last;
	return { ...distance, values: distance.values.map((v) => (v === null ? null : v * factor)) };
}

export function computeStats(activity: Activity): ComputedActivity {
	const distance = alignToDeclared(computeDistanceSeries(activity.points), activity.declaredTotals.distanceM);
	const elevation = computeElevationSeries(activity.points);

	const declaredDistance = activity.declaredTotals.distanceM;
	const lastDistance = distance.values[distance.values.length - 1] ?? null;
	const distanceM = declaredDistance ?? lastDistance;

	let durationS = activity.declaredTotals.timerTimeS;
	if (durationS === null && activity.startTime !== null && activity.endTime !== null) {
		durationS = Math.max(0, (activity.endTime - activity.startTime) / 1000);
	}

	const declaredAscent = activity.declaredTotals.ascentM;
	const computed = accumulateAscent(elevation.values, 0, elevation.values.length);

	const hrs = activity.points.map((p) => p.hr).filter((v): v is number => v !== null);
	const cadences = activity.points.map((p) => p.cadence).filter((v): v is number => v !== null);
	const powers = activity.points.map((p) => p.power).filter((v): v is number => v !== null);

	return {
		stats: {
			distanceM: distanceM !== null && distanceM > 0 ? distanceM : null,
			durationS: durationS !== null && durationS > 0 ? durationS : null,
			ascentM: declaredAscent ?? computed.ascentM,
			descentM: computed.descentM,
			avgHr: meanOf(hrs),
			maxHr: maxOf(hrs),
			avgCadence: meanOf(cadences),
			maxCadence: maxOf(cadences),
			avgPower: meanOf(powers),
		},
		distance,
		elevation,
	};
}
