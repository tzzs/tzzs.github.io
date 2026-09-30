import type { Activity, TrackPoint } from './types';

/**
 * 单测用的构造器。不是产品代码，`*.test.ts` 的匹配规则不会把它当测试文件收。
 *
 * 默认值是「一个字段齐全的普通点」，各用例只覆盖自己关心的那一项，
 * 这样测试读起来说得出「这个用例喂的是什么」（设计稿 §12.3）。
 */

export function point(overrides: Partial<TrackPoint> = {}): TrackPoint {
	return {
		time: 0,
		lat: 0,
		lon: 0,
		ele: null,
		hr: null,
		cadence: null,
		power: null,
		speed: null,
		distance: null,
		...overrides,
	};
}

/**
 * 沿纬度方向排布的等距点：0.001° 纬度约 111.19 米，
 * 想要「正好 1 公里」的段就用 9 个点（下标 0..8 累计约 889.5 米），
 * 具体数值由测试自己按 step 算，不在这里做四舍五入的魔法。
 */
export function linePoints(count: number, stepDegrees = 0.001, startEpochMs = 0, intervalMs = 1000): TrackPoint[] {
	return Array.from({ length: count }, (_, i) =>
		point({ lat: i * stepDegrees, lon: 0, time: startEpochMs + i * intervalMs }),
	);
}

export function activity(points: TrackPoint[], overrides: Partial<Activity> = {}): Activity {
	return {
		source: 'gpx',
		name: null,
		sport: null,
		startTime: points[0]?.time ?? null,
		endTime: points[points.length - 1]?.time ?? null,
		points,
		declaredTotals: { distanceM: null, timerTimeS: null, ascentM: null },
		device: null,
		warnings: [],
		...overrides,
	};
}

/** 造一个满足 TrackSource 结构的假文件，解析层因此完全不依赖浏览器 File API */
export function fakeSource(bytes: Uint8Array, name = 'sample.bin', size = bytes.byteLength) {
	return {
		name,
		size,
		arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer,
	};
}
