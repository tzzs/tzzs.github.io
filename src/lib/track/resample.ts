import type { TrackPoint } from './types';
import { MAX_RENDER_POINTS } from './constants';

/**
 * 地图渲染用的抽稀。
 *
 * 返回的是**原始下标 + 坐标**，不是坐标数组：整页把 points 的下标当唯一主键，
 * 剖面图 hover 到某点时靠同一个下标在地图上高亮它（设计稿 §9.1）。抽稀若把下标丢掉，
 * 这条联动就得再维护一套映射。
 *
 * 等距抽样而不是 Douglas–Peucker：轨迹点本来就按时间等距采样，等距抽样在这类数据上
 * 形状损失可接受，代码量少一半，也不用为一条折线引入几何库。
 */

export interface RenderPoint {
	lat: number;
	lon: number;
	/** 在 Activity.points 中的下标，用于与剖面图联动 */
	index: number;
}

export function resampleForRender(points: TrackPoint[], limit = MAX_RENDER_POINTS): RenderPoint[] {
	const withCoords: RenderPoint[] = [];
	for (let i = 0; i < points.length; i++) {
		const { lat, lon } = points[i];
		if (lat !== null && lon !== null) withCoords.push({ lat, lon, index: i });
	}

	if (withCoords.length <= limit) return withCoords;

	const out: RenderPoint[] = [];
	const step = (withCoords.length - 1) / (limit - 1);
	for (let k = 0; k < limit; k++) {
		// Math.round 保证首点与末点必定入选，否则轨迹会凭空短掉一截
		out.push(withCoords[Math.round(k * step)]);
	}
	return out;
}

/** 是否有可绘制的坐标；全缺时地图整块隐藏（设计稿 §6.2） */
export function hasCoordinates(points: TrackPoint[]): boolean {
	return points.some((p) => p.lat !== null && p.lon !== null);
}
