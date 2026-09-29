import { describe, expect, it } from 'vitest';
import { computeHrZones } from './hrZones';
import { activity, point } from './test-helpers';

function hrActivity(entries: Array<[timeMs: number, hr: number | null]>) {
	return activity(entries.map(([time, hr]) => point({ time, hr })));
}

describe('computeHrZones', () => {
	it('按时间加权，把时长归给区间起点的心率', () => {
		// 观测最大 200 → Z1 边界 100–120；100 bpm 覆盖 0→120 秒
		const act = hrActivity([
			[0, 100],
			[60_000, 100],
			[120_000, 200],
		]);
		const result = computeHrZones(act, null);
		expect(result).not.toBeNull();
		expect(result!.maxHr).toBe(200);
		expect(result!.zones[0].seconds).toBe(120);
		expect(result!.zones[0].pct).toBeCloseTo(100, 1);
		// 最后一点没有后继，不产生时长
		expect(result!.zones[4].seconds).toBe(0);
	});

	// 实测那份 Strava 文件只有 18% 的点带心率：分母若用活动总时长，
	// 访客会看到「Z1 只占 4%」并以为自己从没进过轻松区，其实那 82% 是数据缺失
	it('分母是「有心率数据覆盖的时长」，不是活动总时长', () => {
		// 3600 秒的活动里只有前 60 秒有心率，之后全是缺数据
		const act = hrActivity([
			[0, 150],
			[60_000, 150],
			[3_600_000, null],
		]);
		const result = computeHrZones(act, 3600);
		expect(result).not.toBeNull();
		expect(result!.coveredS).toBe(60);
		expect(result!.zones.reduce((sum, z) => sum + z.pct, 0)).toBeCloseTo(100, 1);
		// 60 / 3600 ≈ 1.67% 的覆盖率；若拿总时长当分母，会显示成「几乎没进过任何区间」
		expect(result!.coveragePct).toBeCloseTo(1.667, 2);
	});

	it('低于 50% 最大心率的时间单列，不塞进 Z1', () => {
		const act = hrActivity([
			[0, 60],
			[1000, 100],
			[2000, 100],
		]);
		const result = computeHrZones(act, null);
		expect(result).not.toBeNull();
		// 60/100 = 0.6 落在 Z2 的下界（Z1 是 0.5 ≤ ratio < 0.6），所以 belowZ1 为 0
		expect(result!.belowZ1S).toBe(0);

		const warmup = hrActivity([
			[0, 40],
			[1000, 100],
			[2000, 100],
		]);
		const below = computeHrZones(warmup, null)!;
		expect(below.belowZ1S).toBe(1);
		expect(below.zones[0].seconds).toBe(0);
	});

	it('夹在两个有心率的点之间的无心率点，其时长归给前一个点', () => {
		const act = activity([
			point({ time: 0, hr: 120 }),
			point({ time: 10_000, hr: null }),
			point({ time: 20_000, hr: 120 }),
		]);
		const result = computeHrZones(act, null)!;
		// 120 / 120 = 1.0 → 落在 Z5（上界含）
		expect(result.coveredS).toBe(20);
	});

	it('完全没有心率时返回 null，视图整块隐藏', () => {
		expect(computeHrZones(hrActivity([[0, null], [1000, null]]), 1)).toBeNull();
	});

	it('只有一个心率点、凑不出任何时长时返回 null，而不是编造权重', () => {
		expect(computeHrZones(hrActivity([[0, 130]]), 10)).toBeNull();
	});

	it('五个区间的边界是 50/60/70/80/90/100%', () => {
		const result = computeHrZones(hrActivity([[0, 100], [1000, 100]]), null)!;
		expect(result.zones.map((z) => z.fromRatio)).toEqual([0.5, 0.6, 0.7, 0.8, 0.9]);
		expect(result.zones.map((z) => z.index)).toEqual([1, 2, 3, 4, 5]);
	});

	it('时间戳倒序不产生负时长；凑不出正向时长就整块不显示', () => {
		const act = hrActivity([
			[2000, 100],
			[0, 100],
		]);
		// 两点间隔被 Math.max(0, …) 夹成 0 → coveredS 为 0 → 按 §6.1 返回 null 而不是画一张 0% 的图
		expect(computeHrZones(act, null)).toBeNull();
	});

	// 只在开头和结尾各记了一次心率的残缺文件，不能让两个点撑起四小时的覆盖率
	it('单个间隔有上限，超长的空档按缺数据处理', () => {
		const fourHours = 4 * 3600 * 1000;
		const act = hrActivity([
			[0, 120],
			[fourHours, 120],
		]);
		const result = computeHrZones(act, 4 * 3600);
		expect(result).not.toBeNull();
		expect(result!.coveredS).toBe(60);
		expect(result!.coveragePct).toBeCloseTo(0.4167, 3);
	});
});
