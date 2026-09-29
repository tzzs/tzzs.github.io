import { describe, expect, it } from 'vitest';
import { percentile, rollingPace } from './pace';
import { point } from './test-helpers';

/** 匀速直线：每秒一个点，速度 metersPerSecond，累计里程数组与之一致 */
function steady(count: number, metersPerSecond: number) {
	const points = Array.from({ length: count }, (_, i) => point({ time: i * 1000 }));
	const distance = points.map((_, i) => i * metersPerSecond);
	return { points, distance };
}

describe('rollingPace', () => {
	// 真实回归：那场 0.63 米/秒的下山徒步，窗口条件写成「先到即停」后只有最快的 2% 能上画
	it('慢速匀速活动的配速值正确，且绝大多数点都算得出来', () => {
		const { points, distance } = steady(600, 0.63);
		const pace = rollingPace(points, distance);
		// 0.63 m/s → 1587 秒/公里 ≈ 26:27
		expect(pace[300]).toBeCloseTo(1587, -1);
		const usable = pace.filter((v) => v !== null).length;
		expect(usable / points.length).toBeGreaterThan(0.8);
	});

	it('快速匀速活动按窗口时长收口，配速约 3:20/公里', () => {
		const { points, distance } = steady(600, 3);
		const pace = rollingPace(points, distance);
		expect(pace[100]).toBeGreaterThan(300);
		expect(pace[100]).toBeLessThan(360);
	});

	// 站着不动不该产出一个「几万秒每公里」的配速把坐标轴撑爆
	it('原地不动时全部为 null，不产出极端值', () => {
		const points = Array.from({ length: 600 }, (_, i) => point({ time: i * 1000 }));
		const distance = points.map(() => 0);
		expect(rollingPace(points, distance).every((v) => v === null)).toBe(true);
	});

	it('前段快后段慢时，配速值随之变大', () => {
		const points = Array.from({ length: 400 }, (_, i) => point({ time: i * 1000 }));
		const distance: number[] = [];
		let total = 0;
		for (let i = 0; i < points.length; i++) {
			distance.push(total);
			total += i < 200 ? 3 : 0.6;
		}
		const pace = rollingPace(points, distance);
		expect((pace[50] as number)).toBeLessThan((pace[300] as number));
	});

	it('点数不足两个时不越界、不抛异常', () => {
		expect(rollingPace([point({ time: 0 })], [0])).toEqual([null]);
		expect(rollingPace([], [])).toEqual([]);
	});

	it('缺时间戳的点被跳过，不影响其余点', () => {
		const { points, distance } = steady(300, 0.63);
		points[10].time = null;
		const pace = rollingPace(points, distance);
		expect(pace[10]).toBeNull();
		expect(pace[200]).not.toBeNull();
	});

	it('时间戳倒序不会产生负配速', () => {
		const points = [point({ time: 0 }), point({ time: 60_000 }), point({ time: 30_000 }), point({ time: 120_000 })];
		const distance = [0, 40, 60, 100];
		expect(rollingPace(points, distance).every((v) => v === null || v >= 0)).toBe(true);
	});
});

describe('percentile', () => {
	it('取两端与中位', () => {
		const sorted = Array.from({ length: 101 }, (_, i) => i);
		expect(percentile(sorted, 0)).toBe(0);
		expect(percentile(sorted, 0.5)).toBe(50);
		expect(percentile(sorted, 1)).toBe(100);
	});

	it('空数组返回 0 而不是 NaN', () => {
		expect(percentile([], 0.5)).toBe(0);
	});
});
