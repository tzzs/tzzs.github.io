import type { Activity, HrZone, HrZoneResult } from './types';
import { HR_MAX_GAP_S, HR_ZONE_RATIOS } from './constants';

/**
 * 心率区间分布。
 *
 * 基准是「文件内观测到的最大心率」，不是年龄公式估算值——后者要采集访客的个人信息，
 * 与这页「什么都不上传」的定位冲突。代价是短间歇训练里观测最大值偏低，区间整体偏高，
 * 这条局限要在 UI 上用一行小字说明（设计稿 §7.6）。
 */

/** 全文件没有任何心率时返回 null，视图据此整块隐藏，而不是画一张空图（设计稿 §6.1） */
export function computeHrZones(activity: Activity, durationS: number | null): HrZoneResult | null {
	const points = activity.points;
	const withHr = points.filter((p) => p.hr !== null);
	if (withHr.length === 0) return null;

	const maxHr = withHr.reduce((m, p) => Math.max(m, p.hr as number), 0);
	if (!(maxHr > 0)) return null;

	const buckets = HR_ZONE_RATIOS.map(() => 0);
	let belowZ1S = 0;

	// 时长按「相邻两个有心率的点之间」计，夹在中间那些没有心率的点的时长归给前一个点
	let previousIndex: number | null = null;
	for (let i = 0; i < points.length; i++) {
		if (points[i].hr === null) continue;
		if (previousIndex !== null) {
			const previousTime = points[previousIndex].time;
			const currentTime = points[i].time;
			if (previousTime !== null && currentTime !== null) {
				const seconds = Math.max(0, (currentTime - previousTime) / 1000);
				// 只把有限长的间隔归给前一个点：更长的空档是真缺数据，不能算成「那个心率维持了很久」
				const attributed = Math.min(seconds, HR_MAX_GAP_S);
				// 归给前一个点的心率值
				const ratio = (points[previousIndex].hr as number) / maxHr;
				const slot = HR_ZONE_RATIOS.findIndex(([from, to]) => ratio >= from && ratio < to);
				if (slot >= 0) buckets[slot] += attributed;
				else if (ratio < HR_ZONE_RATIOS[0][0]) belowZ1S += attributed;
			}
		}
		previousIndex = i;
	}

	const coveredS = buckets.reduce((sum, s) => sum + s, 0) + belowZ1S;
	// 一个可加权的时长都凑不出来（只有单点心率，或点里根本没有时间戳）时整块隐藏：
	// 按 §6.1 的原则，算不出来的东西不显示，也不用「每点记 1 秒」这种编造的权重凑出一张图
	if (coveredS <= 0) return null;

	const total = buckets.reduce((sum, s) => sum + s, 0) + belowZ1S;
	if (total <= 0) return null;

	const zones: HrZone[] = HR_ZONE_RATIOS.map(([from, to], i) => ({
		index: i + 1,
		fromRatio: from,
		toRatio: to,
		seconds: buckets[i],
		// 分母只算有心率数据覆盖的时长：用活动总时长会把「数据缺失」显示成「没进过这个区间」
		pct: (buckets[i] / total) * 100,
	}));

	return {
		zones,
		maxHr,
		coveredS: total,
		belowZ1S,
		coveragePct: durationS && durationS > 0 ? Math.min(100, (total / durationS) * 100) : 100,
	};
}
