import { describe, expect, it } from 'vitest';
import { hasCoordinates, resampleForRender } from './resample';
import { point } from './test-helpers';

function line(count: number): ReturnType<typeof point>[] {
	return Array.from({ length: count }, (_, i) => point({ lat: 30 + i * 0.0001, lon: 102, time: i * 1000 }));
}

describe('resampleForRender', () => {
	it('点数在上限内时原样返回', () => {
		expect(resampleForRender(line(100), 200)).toHaveLength(100);
	});

	it('抽稀后保留原始下标，剖面图才能与地图用同一个主键联动', () => {
		const out = resampleForRender(line(10), 5);
		expect(out).toHaveLength(5);
		expect(out.map((p) => p.index)).toEqual([0, 2, 5, 7, 9]);
	});

	it('首点与末点必定保留，否则轨迹会凭空短掉一截', () => {
		const out = resampleForRender(line(1000), 50);
		expect(out[0].index).toBe(0);
		expect(out[out.length - 1].index).toBe(999);
	});

	it('下标严格递增', () => {
		const out = resampleForRender(line(500), 20);
		for (let i = 1; i < out.length; i++) expect(out[i].index).toBeGreaterThan(out[i - 1].index);
	});

	it('跳过没有坐标的点，但下标仍指向原数组', () => {
		const points = [
			point({ lat: 30, lon: 102 }),
			point({ lat: null, lon: null }),
			point({ lat: 31, lon: 103 }),
		];
		const out = resampleForRender(points, 100);
		expect(out).toHaveLength(2);
		expect(out.map((p) => p.index)).toEqual([0, 2]);
	});

	it('全部点都没有坐标时返回空数组', () => {
		expect(resampleForRender([point({ lat: null, lon: null })], 100)).toEqual([]);
	});

	it('hasCoordinates 用于决定地图块是否整块隐藏', () => {
		expect(hasCoordinates([point({ lat: null, lon: null }), point({ lat: 30, lon: 102 })])).toBe(true);
		expect(hasCoordinates([point({ lat: null, lon: null })])).toBe(false);
	});
});
