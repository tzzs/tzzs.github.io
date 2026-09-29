import { describe, expect, it } from 'vitest';
import {
	accumulateAscent,
	computeDistanceSeries,
	computeElevationSeries,
	computeStats,
	haversineMeters,
} from './stats';
import { activity, linePoints, point } from './test-helpers';

/** 0.001° 纬度差 ≈ 111.195 米，是下面这些期望值的来源 */
const STEP_M = 111.195;

describe('computeDistanceSeries', () => {
	it('等距点列的累计里程与 haversine 手算一致', () => {
		const series = computeDistanceSeries(linePoints(10));
		expect(series.source).toBe('gps');
		expect(series.values[series.values.length - 1]).toBeCloseTo(9 * STEP_M, 1);
	});

	it('静止抖动（小于死区）不累加里程', () => {
		const jitter = [point({ lat: 30, lon: 102 }), point({ lat: 30, lon: 102 }), point({ lat: 30, lon: 102 })];
		expect(computeDistanceSeries(jitter).values[2]).toBe(0);
	});

	// 真实回归：慢速徒步每秒位移约 0.6 米，逐段丢弃死区以下的位移会把 9764 米算成 86.6 米
	it('每步都小于死区的缓慢移动仍然累加出真实里程', () => {
		// 0.0000054° 纬度约 0.6 米，20 个点合计约 11.4 米
		const slow = Array.from({ length: 20 }, (_, i) => point({ lat: 30 + i * 0.0000054, lon: 102 }));
		const total = computeDistanceSeries(slow).values[19] as number;
		expect(total).toBeGreaterThan(8);
		expect(total).toBeLessThan(15);
	});

	it('往复抖动不被累计成里程（锚点不动）', () => {
		const wobble = Array.from({ length: 30 }, (_, i) => point({ lat: 30 + (i % 2 === 0 ? 0 : 0.000009), lon: 102 }));
		expect(computeDistanceSeries(wobble).values[29]).toBeLessThan(15);
	});

	it('缺坐标的点被跳过并计数', () => {
		const points = [point({ lat: 30, lon: 102 }), point({ lat: null, lon: null }), point({ lat: 30.001, lon: 102 })];
		const series = computeDistanceSeries(points);
		expect(series.pointsWithoutCoords).toBe(1);
		// 里程不会因为中间缺点而变成 NaN，锚点保持不动，之后照常累加
		expect(series.values[1]).toBe(series.values[0]);
		expect(series.values[2]).toBeCloseTo(STEP_M, 1);
	});

	it('distance 字段覆盖足够时优先用它（室内骑行台只有里程没有坐标）', () => {
		const points = Array.from({ length: 20 }, (_, i) => point({ lat: null, lon: null, distance: i * 100 }));
		const series = computeDistanceSeries(points);
		expect(series.source).toBe('field');
		expect(series.values[19]).toBe(1900);
	});

	// 实测那份 Strava 文件 15510 个点里只有 1 个点带 distance，没有门槛就会拿一个点的值当全程
	it('distance 字段覆盖率不足时被拒绝，退回坐标累加', () => {
		const sparse = Array.from({ length: 20 }, (_, i) => point({ lat: 30 + i * 0.001, lon: 102, distance: i === 3 ? 9999 : null }));
		const series = computeDistanceSeries(sparse);
		expect(series.source).toBe('gps');
		expect(series.values[19]).toBeLessThan(9999);
	});

	it('distance 字段非单调时不被采用', () => {
		const backwards = Array.from({ length: 20 }, (_, i) => point({ lat: null, lon: null, distance: i === 19 ? 0 : i * 100 }));
		expect(computeDistanceSeries(backwards).source).toBe('gps');
	});
});

describe('haversineMeters', () => {
	it('任一点缺坐标返回 null', () => {
		expect(haversineMeters(point({ lat: null, lon: null }), point())).toBeNull();
	});
});

describe('computeElevationSeries', () => {
	it('相邻高差过大的漂移值被丢弃并计数', () => {
		const points = [1000, 1000, 1000, 1200, 1000, 1000].map((ele) => point({ ele }));
		const series = computeElevationSeries(points);
		expect(series.anomaliesDropped).toBe(1);
		expect(series.values[3]).toBeNull();
	});

	it('没有海拔时整列 null，且不谎报丢弃数', () => {
		const series = computeElevationSeries([point(), point(), point(), point(), point()]);
		expect(series.values.every((v) => v === null)).toBe(true);
		expect(series.anomaliesDropped).toBe(0);
	});
});

describe('accumulateAscent', () => {
	it('稳定上坡按实际差值累计', () => {
		const values = [1000, 1010, 1020, 1030, 1040];
		expect(accumulateAscent(values, 0, values.length)).toEqual({ ascentM: 40, descentM: 0 });
	});

	// 小于最小变化量的往复抖动不算升降，这是「电梯被算成 200 米爬升」的解药
	it('小幅往复抖动累计为 0', () => {
		const values = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 1000 : 1002));
		expect(accumulateAscent(values, 0, values.length)).toEqual({ ascentM: 0, descentM: 0 });
	});

	it('先上后下分别累计', () => {
		const values = [1000, 1050, 1000];
		const result = accumulateAscent(values, 0, values.length);
		expect(result.ascentM).toBe(50);
		expect(result.descentM).toBe(50);
	});

	it('一个高程都没有时返回 null 而不是 0', () => {
		expect(accumulateAscent([null, null, null], 0, 3)).toEqual({ ascentM: null, descentM: null });
	});

	it('下标区间是左闭右开，分段表按段取用', () => {
		const values = [1000, 1050, 1000, 1200];
		expect(accumulateAscent(values, 0, 2).ascentM).toBe(50);
		expect(accumulateAscent(values, 2, 4).ascentM).toBe(200);
	});
});

describe('computeStats', () => {
	it('总距离优先取设备自报值', () => {
		const act = activity(linePoints(10), { declaredTotals: { distanceM: 9764.31, timerTimeS: null, ascentM: null } });
		expect(computeStats(act).stats.distanceM).toBe(9764.31);
	});

	it('没有自报值时用点重建的结果', () => {
		const act = activity(linePoints(10));
		expect(computeStats(act).stats.distanceM).toBeCloseTo(9 * STEP_M, 1);
	});

	// 面板显示设备值、分段表用点重建值，两者不是一套算法就会「各段加起来不等于总距离」
	it('逐点里程序列被按比例对齐到设备自报总距离', () => {
		const act = activity(linePoints(10), { declaredTotals: { distanceM: 2000, timerTimeS: null, ascentM: null } });
		const computed = computeStats(act);
		expect(computed.stats.distanceM).toBe(2000);
		expect(computed.distance.values[9]).toBeCloseTo(2000, 6);
		// 中间的累计值同步缩放（点距等距，所以就是线性插值），剖面图 X 轴才是同一个基准
		expect(computed.distance.values[5]).toBeCloseTo((5 / 9) * 2000, 1);
	});

	it('时长优先设备自报，其次起止时间差', () => {
		const declared = activity(linePoints(3), { declaredTotals: { distanceM: null, timerTimeS: 15505.16, ascentM: null } });
		expect(computeStats(declared).stats.durationS).toBe(15505.16);

		const derived = activity(linePoints(3));
		expect(computeStats(derived).stats.durationS).toBe(2);
	});

	it('爬升：自报值缺失时用滤波后的重建值', () => {
		const points = [1000, 1010, 1020, 1030, 1040].map((ele) => point({ ele, lat: 30, lon: 102 }));
		expect(computeStats(activity(points)).stats.ascentM).toBe(40);

		const declared = activity(points, { declaredTotals: { distanceM: null, timerTimeS: null, ascentM: 999 } });
		expect(computeStats(declared).stats.ascentM).toBe(999);
	});

	it('心率/步频/功率的平均与最大；文件里没有就全是 null', () => {
		const points = [point({ hr: 100, cadence: 80, power: 150 }), point({ hr: 200, cadence: 120, power: 250 })];
		const stats = computeStats(activity(points)).stats;
		expect(stats.avgHr).toBe(150);
		expect(stats.maxHr).toBe(200);
		expect(stats.avgCadence).toBe(100);
		expect(stats.avgPower).toBe(200);

		const bare = computeStats(activity([point(), point()])).stats;
		expect(bare.avgHr).toBeNull();
		expect(bare.maxCadence).toBeNull();
		expect(bare.avgPower).toBeNull();
	});

	// 单点文件：距离为 0，配速的分母不成立，必须一路传 null 而不是 0 或 Infinity
	it('单点文件所有派生量为 null', () => {
		const stats = computeStats(activity([point()])).stats;
		expect(stats.distanceM).toBeNull();
		expect(stats.durationS).toBeNull();
		expect(stats.ascentM).toBeNull();
	});

	// 解析层已保证数字要么有限、要么 null，所以这里构造真实可达的残缺输入：
	// 部分点缺时间、部分点缺坐标。「绝不把 NaN 显示出去」由 format 层兜底测试
	it('时间戳残缺时不崩溃，时长取能算出的部分', () => {
		const act = activity([
			point({ lat: 30, lon: 102, time: 0 }),
			point({ lat: 30.001, lon: 102, time: null }),
			point({ lat: 30.002, lon: 102, time: 20000 }),
		]);
		const stats = computeStats(act).stats;
		expect(stats.durationS).toBe(20);
		expect(stats.distanceM).toBeCloseTo(2 * STEP_M, 1);
	});
});
