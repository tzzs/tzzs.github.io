import { describe, expect, it } from 'vitest';
import {
	MISSING,
	formatAscent,
	formatCount,
	formatDateTime,
	formatDistance,
	formatDuration,
	formatPercent,
	formatPace,
	paceUnitSuffix,
	unitLabels,
} from './format';

/**
 * format 层是「绝不把 NaN / Infinity / 0 冒充未知」这条规则的最后一道防线，
 * 所以这里允许直接传非法数值——它面对的输入不该假设上游干净。
 */

describe('formatDistance', () => {
	it('双语单位', () => {
		expect(formatDistance(9764.31, 'metric', 'zh')).toBe('9.76 公里');
		expect(formatDistance(9764.31, 'metric', 'en')).toBe('9.76 km');
		expect(formatDistance(9764.31, 'imperial', 'en')).toBe('6.07 mi');
	});

	it('大于 10 时收到一位小数，避免 42.15 公里的宽度抖动', () => {
		expect(formatDistance(12_345, 'metric', 'zh')).toBe('12.3 公里');
	});

	it('null 与非法值都是「—」', () => {
		expect(formatDistance(null, 'metric', 'zh')).toBe(MISSING);
		expect(formatDistance(Number.NaN, 'metric', 'zh')).toBe(MISSING);
		expect(formatDistance(Number.POSITIVE_INFINITY, 'metric', 'zh')).toBe(MISSING);
	});
});

describe('formatDuration', () => {
	it('超过一小时带小时位', () => {
		// 15505.16 秒 = 4 小时 18 分 25 秒（真实样本的 totalElapsedTime）
		expect(formatDuration(15_505.16)).toBe('4:18:25');
	});

	it('一小时以内只显示分秒', () => {
		expect(formatDuration(750)).toBe('12:30');
		expect(formatDuration(0)).toBe('0:00');
	});

	it('null、负数、非法值都是「—」', () => {
		expect(formatDuration(null)).toBe(MISSING);
		expect(formatDuration(-5)).toBe(MISSING);
		expect(formatDuration(Number.NaN)).toBe(MISSING);
	});
});

describe('formatPace', () => {
	// 分母为 0 时最容易出现 Infinity 直接印到页面上，这条是回归防线
	it('距离为 0 或缺失时返回「—」而不是 Infinity', () => {
		expect(formatPace(3000, 0, 'metric')).toBe(MISSING);
		expect(formatPace(3000, null, 'metric')).toBe(MISSING);
		expect(formatPace(null, 1000, 'metric')).toBe(MISSING);
	});

	it('5 公里 25 分钟是 5:00 每公里', () => {
		expect(formatPace(1500, 5000, 'metric')).toBe('5:00');
	});

	it('一英里比一公里慢，配速数字更大', () => {
		const seconds = 1500;
		const meters = 5000;
		expect(formatPace(seconds, meters, 'imperial')).toBe('8:03');
	});

	it('单位后缀双语', () => {
		expect(paceUnitSuffix('metric', 'zh')).toBe('/公里');
		expect(paceUnitSuffix('imperial', 'en')).toBe('/mi');
	});
});

describe('其余格式化', () => {
	it('爬升取整并带单位', () => {
		expect(formatAscent(1234.56, 'zh')).toBe('1235 米');
		expect(formatAscent(null, 'en')).toBe(MISSING);
	});

	it('计数值缺失时是「—」，不是「0 bpm」', () => {
		expect(formatCount(null, 'bpm')).toBe(MISSING);
		expect(formatCount(142.4, 'bpm')).toBe('142 bpm');
	});

	it('百分比夹在 0–100', () => {
		expect(formatPercent(120)).toBe('100%');
		expect(formatPercent(-3)).toBe('0%');
		expect(formatPercent(null)).toBe(MISSING);
	});

	it('日期时间按 locale 输出', () => {
		const text = formatDateTime(Date.parse('2025-08-03T08:11:06Z'), 'zh');
		expect(text).toContain('2025');
		expect(formatDateTime(null, 'zh')).toBe(MISSING);
	});

	it('单位标签两套语言都齐', () => {
		expect(unitLabels('metric', 'zh').distance).toBe('公里');
		expect(unitLabels('imperial', 'en').distance).toBe('mi');
	});
});
