import type { Activity, Split, TrackPoint, Unit } from './types';
import type { ComputedActivity } from './stats';
import { accumulateAscent } from './stats';
import { MAX_SPLITS, MILE_IN_METERS } from './constants';

/**
 * 每公里 / 每英里分段。
 *
 * 里程来源与总距离共用 `computeDistanceSeries`，这样「各段相加」与「总距离」不会来自两套算法。
 * 采样点几乎不会正好落在整公里上，所以段的边界时间靠线性插值求得（设计稿 §7.5）。
 */

/** 一个完整段长的米数 */
export function segmentLengthMeters(unit: Unit): number {
	return unit === 'metric' ? 1000 : MILE_IN_METERS;
}

/**
 * 段数超过 MAX_SPLITS 时按 [1,2,5,10] 逐级放大段长。
 * 马拉松 42 行属正常，一次 400 公里越野才需要降级。
 */
export function chooseSegmentMeters(unit: Unit, totalDistanceM: number): number {
	const base = segmentLengthMeters(unit);
	for (const multiple of [1, 2, 5, 10]) {
		if (Math.ceil(totalDistanceM / (base * multiple)) <= MAX_SPLITS) return base * multiple;
	}
	return base * 10;
}

/**
 * 点时间可能缺失（GPX 允许无 <time>），向后/向前沿用最近一个已知时间，
 * 否则分段耗时会因为个别缺时间而整段变成 null。
 */
function effectiveTimes(points: TrackPoint[]): number[] {
	const times: number[] = new Array(points.length).fill(NaN);
	let previous: number | null = null;
	for (let i = 0; i < points.length; i++) {
		const time = points[i].time;
		if (time !== null) previous = time;
		if (previous !== null) times[i] = previous;
	}
	// 开头缺时间的点补第一个已知时间，避免出现负耗时
	const firstKnown = times.find((t) => !Number.isNaN(t));
	if (firstKnown !== undefined) {
		for (let i = 0; i < times.length; i++) if (Number.isNaN(times[i])) times[i] = firstKnown;
	}
	return times;
}

/** 里程序列里出现 null 时（理论上只在 field 来源的首点之前）沿用上一个值 */
function filled(values: (number | null)[]): number[] {
	const out: number[] = [];
	let carried = 0;
	for (const value of values) {
		if (value !== null) carried = value;
		out.push(carried);
	}
	return out;
}

export function computeSplits(activity: Activity, computed: ComputedActivity, unit: Unit): Split[] {
	const distances = filled(computed.distance.values);
	if (distances.length < 2) return [];

	const total = distances[distances.length - 1];
	if (!(total > 0)) return [];

	const segmentMeters = chooseSegmentMeters(unit, total);
	const times = effectiveTimes(activity.points);
	const elevation = computed.elevation.values;

	/** 里程第一次达到 target 的位置：返回插值后的时间与该点的下标 */
	const crossAt = (target: number, fromIndex: number) => {
		let i = fromIndex;
		while (i < distances.length - 1 && distances[i] < target) i++;
		const prevIndex = Math.max(0, i - 1);
		const prevDistance = distances[prevIndex];
		const distanceSpan = distances[i] - prevDistance;
		const ratio = distanceSpan > 0 ? (target - prevDistance) / distanceSpan : 0;
		const time = times[prevIndex] + Math.max(0, times[i] - times[prevIndex]) * Math.min(1, Math.max(0, ratio));
		return { time, index: i };
	};

	const splits: Split[] = [];
	let boundary = 0;
	let cursorIndex = 0;
	let previousTime = times[0];

	while (boundary + segmentMeters <= total) {
		boundary += segmentMeters;
		const cross = crossAt(boundary, cursorIndex);
		splits.push(buildSplit(splits.length + 1, segmentMeters, previousTime, cross, cursorIndex, cross.index, activity, elevation));
		previousTime = cross.time;
		cursorIndex = cross.index;
	}

	const remaining = total - boundary;
	// 末段哪怕很短也出一行，访客需要知道总距离由哪些段构成（设计稿 §7.5）
	if (remaining > 0) {
		const endIndex = distances.length - 1;
		splits.push(buildSplit(splits.length + 1, remaining, previousTime, { time: times[endIndex], index: endIndex }, cursorIndex, endIndex, activity, elevation, true));
	}

	return splits;
}

function buildSplit(
	index: number,
	distanceM: number,
	startTime: number,
	end: { time: number; index: number },
	startIndex: number,
	endIndex: number,
	activity: Activity,
	elevation: (number | null)[],
	partial = false,
): Split {
	// 段耗时同样非负：时间戳非单调的文件里后一点可能早于前一点（设计稿 §5.4）
	const durationS = Math.max(0, (end.time - startTime) / 1000);
	const ascent = accumulateAscent(elevation, startIndex, endIndex + 1);

	const hrs: number[] = [];
	for (let i = startIndex; i <= endIndex && i < activity.points.length; i++) {
		const hr = activity.points[i].hr;
		if (hr !== null) hrs.push(hr);
	}

	return {
		index,
		distanceM,
		durationS: Number.isFinite(durationS) ? durationS : null,
		ascentM: ascent.ascentM,
		avgHr: hrs.length > 0 ? hrs.reduce((sum, v) => sum + v, 0) / hrs.length : null,
		partial,
	};
}
