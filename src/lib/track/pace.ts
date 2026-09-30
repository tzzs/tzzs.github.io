import type { TrackPoint } from './types';

/**
 * 滚动配速（秒/公里）。
 *
 * ms/m 与 s/km 是同一个量纲（分子分母同时 ×1000），所以时间差除以里程差就是配速本身。
 *
 * 窗口要「满 TARGET_MS 且 满 TARGET_M」才收口，不是先到即停。先到即停在慢速活动里会在
 * 30 秒处切断，跨度只有十几米、达不到 MIN_SPAN_M 而被整段丢弃 —— 结果只剩走得最快的那
 * 2% 上画，曲线看着漂亮，讲的却是假故事（实测那场 0.63 米/秒的徒步真实踩过）。
 */

/** 窗口的最短时长与最小位移：两个条件都满足才收口 */
export const PACE_WINDOW_MS = 30_000;
export const PACE_WINDOW_M = 100;
/** 时长上限：再慢也到此为止，剩下的交给 MIN_SPAN_M 判定为「没在动」 */
export const PACE_MAX_WINDOW_MS = 120_000;
/** 窗口拉满仍推进不足这个距离，就是原地停着，不该算出一个「配速」 */
export const PACE_MIN_SPAN_M = 30;

export function rollingPace(
	points: TrackPoint[],
	distance: number[],
	limits = { windowMs: PACE_WINDOW_MS, windowM: PACE_WINDOW_M, maxWindowMs: PACE_MAX_WINDOW_MS, minSpanM: PACE_MIN_SPAN_M },
): (number | null)[] {
	const out: (number | null)[] = new Array(points.length).fill(null);
	let end = 0;

	for (let i = 0; i < points.length; i++) {
		const start = points[i].time;
		if (start === null) continue;

		if (end < i + 1) end = i + 1;
		// 走到最后一个点时凑不出任何窗口；不先判越界，points[end] 会是 undefined
		if (end >= points.length) break;

		while (end + 1 < points.length) {
			const next = points[end + 1].time;
			if (next === null) break;
			const elapsed = next - start;
			if (elapsed >= limits.maxWindowMs) break;
			if (elapsed >= limits.windowMs && distance[end + 1] - distance[i] >= limits.windowM) break;
			end++;
		}

		const finish = points[end].time;
		if (finish === null || finish <= start) continue;
		const span = distance[end] - distance[i];
		if (span >= limits.minSpanM) out[i] = (finish - start) / span;
	}

	return out;
}

/** 分位数（输入需已升序）：配速轴用它定范围，个别极端窗口不该压平整条曲线 */
export function percentile(sorted: number[], ratio: number): number {
	if (sorted.length === 0) return 0;
	const index = Math.min(sorted.length - 1, Math.max(0, Math.round(ratio * (sorted.length - 1))));
	return sorted[index];
}
