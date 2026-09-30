import { describe, expect, it } from 'vitest';
import { mapFitMessages, type FitMessages } from './fit';
import { TrackParseError } from './types';

/**
 * 只测 mapFitMessages（消息 → Activity 的映射）。
 *
 * 二进制解码是 SDK 的职责，不写单测——构造一份合法的定义报文 + 数据报文 + CRC 的成本
 * 远超收益，而且它坏掉的话整页坏掉，属于「跑一次就知道」的故障（设计稿 §5.3、§12.3）。
 */

/** 实测自真实文件：四川巴郎山某点的 positionLat，单位是 semicircles */
const SEMICIRCLES_LAT = 368303180;
const SEMICIRCLES_LON = 1228231654;

function messages(overrides: Partial<FitMessages> = {}): FitMessages {
	return {
		recordMesgs: [
			{
				timestamp: new Date('2025-08-03T08:11:06.000Z'),
				positionLat: SEMICIRCLES_LAT,
				positionLong: SEMICIRCLES_LON,
				enhancedAltitude: 3334,
				enhancedSpeed: 0.598,
				heartRate: 142,
				cadence: 96,
				power: 187,
				distance: 1234.5,
			},
		],
		...overrides,
	};
}

describe('mapFitMessages', () => {
	it('semicircles 换算成十进制度', () => {
		const point = mapFitMessages(messages()).points[0];
		// 漏掉换算的话这里会是 3.68 亿，坐标被当度数用的话轨迹会画到几内亚湾
		expect(point.lat).toBeCloseTo(30.87, 2);
		expect(point.lon).toBeCloseTo(102.95, 2);
		expect(point.lat).toBeLessThan(90);
	});

	it('camelCase 字段读得到，snake_case 不再被误用', () => {
		const point = mapFitMessages(messages()).points[0];
		expect(point.ele).toBe(3334);
		expect(point.speed).toBe(0.598);
		expect(point.hr).toBe(142);
		expect(point.cadence).toBe(96);
		expect(point.power).toBe(187);
		expect(point.distance).toBe(1234.5);
	});

	it('timestamp 是 Date，转成 epoch ms', () => {
		expect(mapFitMessages(messages()).points[0].time).toBe(Date.parse('2025-08-03T08:11:06.000Z'));
	});

	it('enhanced_* 缺失时退回普通字段', () => {
		const fallback = { recordMesgs: [{ altitude: 1200, speed: 2.5 }] };
		const point = mapFitMessages(fallback).points[0];
		expect(point.ele).toBe(1200);
		expect(point.speed).toBe(2.5);
		expect(point.lat).toBeNull();
	});

	it('declaredTotals 逐字段可用：有里程无爬升的真实 Strava 导出正是这样', () => {
		const activity = mapFitMessages(
			messages({ sessionMesgs: [{ totalDistance: 9764.31, totalTimerTime: 15505.16, sport: 'hiking' }] }),
		);
		expect(activity.declaredTotals.distanceM).toBe(9764.31);
		expect(activity.declaredTotals.timerTimeS).toBe(15505.16);
		expect(activity.declaredTotals.ascentM).toBeNull();
		expect(activity.sport).toBe('hiking');
	});

	it('没有 totalTimerTime 时退回 totalElapsedTime', () => {
		const activity = mapFitMessages(messages({ sessionMesgs: [{ totalElapsedTime: 90 }] }));
		expect(activity.declaredTotals.timerTimeS).toBe(90);
	});

	it('session 完全缺席时起止时间从点推', () => {
		const activity = mapFitMessages(messages());
		expect(activity.startTime).toBe(Date.parse('2025-08-03T08:11:06.000Z'));
		expect(activity.endTime).toBe(Date.parse('2025-08-03T08:11:06.000Z'));
	});

	it('设备名取 productName，否则 manufacturer + product', () => {
		expect(mapFitMessages(messages({ fileIdMesgs: [{ productName: 'Forerunner 265' }] })).device).toBe('Forerunner 265');
		expect(mapFitMessages(messages({ fileIdMesgs: [{ manufacturer: 'strava', product: 1161 }] })).device).toBe('strava 1161');
	});

	// 实测样本就带了 developer field，映射层不能因此崩掉
	it('忽略不认识的字段（developer field 等）', () => {
		const withDev = { recordMesgs: [{ timestamp: new Date(0), developerFields: { foo: 1 }, someFutureField: 7 }] };
		const activity = mapFitMessages(withDev);
		expect(activity.points).toHaveLength(1);
		expect(activity.points[0].hr).toBeNull();
	});

	it('没有 record 时报 noTrackPoints', () => {
		let caught: TrackParseError | null = null;
		try {
			mapFitMessages({ recordMesgs: [] });
		} catch (error) {
			caught = error as TrackParseError;
		}
		expect(caught?.code).toBe('noTrackPoints');
	});

	it('时间戳倒序记 nonMonotonicTime，且不重排序', () => {
		const backwards = {
			recordMesgs: [
				{ timestamp: new Date('2025-08-03T08:02:00Z') },
				{ timestamp: new Date('2025-08-03T08:01:00Z') },
			],
		};
		const activity = mapFitMessages(backwards);
		expect(activity.warnings).toEqual(['nonMonotonicTime']);
		expect(activity.points[0].time).toBe(Date.parse('2025-08-03T08:02:00Z'));
	});

	it('坏数值（NaN/Infinity）当缺失，不泄漏到下游', () => {
		const broken = { recordMesgs: [{ heartRate: Number.NaN, enhancedAltitude: Number.POSITIVE_INFINITY }] };
		const point = mapFitMessages(broken).points[0];
		expect(point.hr).toBeNull();
		expect(point.ele).toBeNull();
	});
});
