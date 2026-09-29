import type { Locale } from '../../i18n/strings';
import type { Unit } from './types';
import { MILE_IN_METERS } from './constants';

/**
 * 展示层格式化。集中在这里的原因：中英双站、公制英制的组合容易在各视图里各写一套，
 * 于是同一个「总距离」在统计面板和小地图标签上长得不一样。
 *
 * 一条硬规则贯穿全部函数：**算不出来的值返回 MISSING，绝不返回 NaN / Infinity**。
 * 距离为 0 时的配速、缺海拔时的爬升，访客看到的应该是「—」而不是 `Infinity'00"`。
 */

export const MISSING = '—';

const EN_UNIT = { metric: { distance: 'km', long: 'km', paceUnit: '/km' }, imperial: { distance: 'mi', long: 'mi', paceUnit: '/mi' } };
const ZH_UNIT = { metric: { distance: '公里', long: '公里', paceUnit: '/公里' }, imperial: { distance: '英里', long: '英里', paceUnit: '/英里' } };

export function unitLabels(unit: Unit, locale: Locale) {
	return locale === 'zh' ? ZH_UNIT[unit] : EN_UNIT[unit];
}

/** 一个段长的米数，与 splits 保持同一来源 */
function unitMeters(unit: Unit): number {
	return unit === 'metric' ? 1000 : MILE_IN_METERS;
}

function isUsable(value: number | null | undefined): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function decimal(value: number, digits: number): string {
	return value.toFixed(digits);
}

/** 按数值大小决定小数位：5.00 公里比 5.0032 好读，0.42 公里比 0.4 准 */
export function formatDistance(meters: number | null, unit: Unit, locale: Locale): string {
	if (!isUsable(meters)) return MISSING;
	const value = meters / unitMeters(unit);
	const digits = value >= 10 ? 1 : 2;
	return `${decimal(value, digits)} ${unitLabels(unit, locale).distance}`;
}

/** 秒 → 「4:11:45」或「12:30」；不超过约一小时的时长不带小时位 */
export function formatDuration(seconds: number | null): string {
	if (!isUsable(seconds) || seconds < 0) return MISSING;
	const total = Math.round(seconds);
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** 配速 = 时长 / 距离，返回「5:12」这样的分秒；分母不成立时 MISSING */
export function formatPace(durationS: number | null, distanceM: number | null, unit: Unit): string {
	if (!isUsable(durationS) || !isUsable(distanceM) || distanceM <= 0 || durationS <= 0) return MISSING;
	const secondsPerUnit = (durationS * unitMeters(unit)) / distanceM;
	if (!Number.isFinite(secondsPerUnit)) return MISSING;
	const rounded = Math.round(secondsPerUnit);
	const m = Math.floor(rounded / 60);
	const s = rounded % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

export function paceUnitSuffix(unit: Unit, locale: Locale): string {
	return unitLabels(unit, locale).paceUnit;
}

export function formatAscent(meters: number | null, locale: Locale): string {
	if (!isUsable(meters)) return MISSING;
	return `${decimal(meters, 0)} ${locale === 'zh' ? '米' : 'm'}`;
}

/** 心率、步频、功率这类计数值没有单位换算，只有「有没有」 */
export function formatCount(value: number | null, unit: string): string {
	if (!isUsable(value)) return MISSING;
	return `${decimal(value, 0)} ${unit}`;
}

export function formatPercent(value: number | null): string {
	if (!isUsable(value)) return MISSING;
	return `${decimal(Math.min(100, Math.max(0, value)), 0)}%`;
}

/** 活动起始时间；日期时间本身没有中英差异，交给浏览器按 locale 呈现 */
export function formatDateTime(epochMs: number | null, locale: Locale): string {
	if (!isUsable(epochMs)) return MISSING;
	return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(new Date(epochMs));
}
