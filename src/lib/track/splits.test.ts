import { describe, expect, it } from 'vitest';
import { chooseSegmentMeters, computeSplits, segmentLengthMeters } from './splits';
import { computeStats } from './stats';
import { activity, linePoints, point } from './test-helpers';
import type { Unit } from './types';

function splitsOf(points: ReturnType<typeof linePoints>, unit: Unit = 'metric') {
	const act = activity(points);
	const computed = computeStats(act);
	return computeSplits(act, computed, unit);
}

describe('segmentLengthMeters / chooseSegmentMeters', () => {
	it('公制一段一公里，英制一段一英里', () => {
		expect(segmentLengthMeters('metric')).toBe(1000);
		expect(segmentLengthMeters('imperial')).toBe(1609.344);
	});

	it('段数不超过 200 时保持 1 公里粒度', () => {
		expect(chooseSegmentMeters('metric', 42_000)).toBe(1000);
	});

	// 一次 500 公里的超长文件不该产出 500 行表格
	it('超长活动时按 1→2→5→10 放大粒度', () => {
		expect(chooseSegmentMeters('metric', 300_000)).toBe(2000);
		expect(chooseSegmentMeters('metric', 500_000)).toBe(5000);
		expect(chooseSegmentMeters('metric', 5_000_000)).toBe(10_000);
	});
});

describe('computeSplits', () => {
	// 10 个点、每点间隔 0.001° 纬度（约 111.195 米）与 1 秒，总长约 1000.75 米
	it('段边界的时间由线性插值求得，而不是取最近的点', () => {
		const splits = splitsOf(linePoints(10));
		expect(splits).toHaveLength(2);

		expect(splits[0].distanceM).toBe(1000);
		// 第 9 个点在 889.56 米 / 8 秒，第 10 个点在 1000.75 米 / 9 秒，
		// 1000 米落在这两点之间约 99.3% 处 → 约 8.99 秒
		expect(splits[0].durationS).toBeCloseTo(8.99, 2);
	});

	it('末段不足一个完整段长时单独成行并标注', () => {
		const splits = splitsOf(linePoints(10));
		expect(splits[1].partial).toBe(true);
		expect(splits[1].distanceM).toBeCloseTo(0.75, 1);
	});

	it('各段距离相加等于总距离', () => {
		const splits = splitsOf(linePoints(30));
		const total = splits.reduce((sum, s) => sum + s.distanceM, 0);
		expect(total).toBeCloseTo(29 * 111.195, 1);
	});

	// 这是真实样本踩出来的坑：设备自报 9764 米、点重建 8395 米，
	// 面板与分段表各用一边就会出现「9 段加起来不等于总距离」
	it('存在设备自报总距离时，各段之和与它一致', () => {
		const act = activity(linePoints(30), { declaredTotals: { distanceM: 5000, timerTimeS: null, ascentM: null } });
		const computed = computeStats(act);
		const splits = computeSplits(act, computed, 'metric');
		expect(splits.reduce((sum, s) => sum + s.distanceM, 0)).toBeCloseTo(5000, 6);
		expect(computed.stats.distanceM).toBe(5000);
	});

	it('段平均心率只统计该段内有心率的点', () => {
		const points = linePoints(10).map((p, i) => point({ ...p, hr: i < 5 ? 100 : null }));
		const splits = splitsOf(points);
		expect(splits[0].avgHr).toBe(100);
	});

	it('没有心率也没有海拔的段落，两个字段都是 null', () => {
		const splits = splitsOf(linePoints(10));
		expect(splits[0].avgHr).toBeNull();
		expect(splits[0].ascentM).toBeNull();
	});

	it('段内爬升按该段自己的高程变化算', () => {
		const points = linePoints(4).map((p, i) => point({ ...p, ele: 1000 + i * 50 }));
		const act = activity(points);
		const computed = computeStats(act);
		// 4 个点约 333 米，不足一公里 → 单个 partial 段，爬升 150 米
		const splits = computeSplits(act, computed, 'metric');
		expect(splits).toHaveLength(1);
		expect(splits[0].ascentM).toBe(150);
	});

	it('点数不足两个时没有分段', () => {
		expect(splitsOf([point()])).toEqual([]);
	});

	it('总距离为 0（全程静止/坐标全缺）时没有分段', () => {
		expect(splitsOf(linePoints(10, 0))).toEqual([]);
		expect(splitsOf([point({ lat: null, lon: null }), point({ lat: null, lon: null })])).toEqual([]);
	});

	it('英制下不足一英里时只出一个不足段', () => {
		const splits = splitsOf(linePoints(10), 'imperial');
		expect(splits).toHaveLength(1);
		expect(splits[0].partial).toBe(true);
	});

	// 时间戳残缺是真实文件里会出现的情况（部分导出器省略末尾几个点的 time）
	it('点缺时间时沿用前一个已知时间，不产生负耗时', () => {
		const points = [
			point({ lat: 30, lon: 102, time: 0 }),
			point({ lat: 30.01, lon: 102, time: 10_000 }),
			point({ lat: 30.02, lon: 102, time: null }),
			point({ lat: 30.03, lon: 102, time: 30_000 }),
		];
		for (const split of splitsOf(points)) {
			expect(split.durationS === null || split.durationS >= 0).toBe(true);
		}
	});
});
