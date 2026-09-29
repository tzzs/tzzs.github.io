import type { Activity, TrackPoint, TrackWarningCode } from './types';
import { TrackParseError } from './types';
import { SEMICIRCLES_TO_DEGREES } from './constants';

/**
 * FIT（Garmin 二进制）解析。
 *
 * 切成两段是为了让故障可定位：`readFitMessages` 是第三方 SDK 的封装（不写单测，
 * 它就是被测过的那个东西），`mapFitMessages` 是本站的字段映射（纯函数，手工构造消息对象即可测）。
 * 「SDK 解不出这个文件」和「我的映射写错了」必须能分开看出来（设计稿 §5.3）。
 *
 * 三条只有拿真实文件才看得见的规则，都落在 `mapFitMessages` 里：
 * 1. SDK 输出 camelCase 字段名，不是 FIT 规范文档里的 snake_case；
 * 2. positionLat / positionLong 是 semicircles，不换算的话地图会画到几内亚湾去；
 * 3. timestamp / startTime 已是 Date 对象（convertDateTimesToDates 默认开启）。
 */

export interface FitRecordMesg {
	timestamp?: Date;
	positionLat?: number;
	positionLong?: number;
	enhancedAltitude?: number;
	altitude?: number;
	enhancedSpeed?: number;
	speed?: number;
	heartRate?: number;
	cadence?: number;
	power?: number;
	distance?: number;
}

export interface FitSessionMesg {
	sport?: string;
	subSport?: string;
	startTime?: Date;
	endTime?: Date;
	totalDistance?: number;
	totalTimerTime?: number;
	totalElapsedTime?: number;
	totalAscent?: number;
	avgHeartRate?: number;
	maxHeartRate?: number;
}

export interface FitFileIdMesg {
	manufacturer?: string | number;
	product?: string | number;
	productName?: string;
	timeCreated?: Date;
}

/** 只声明本层用到的那部分消息，其余（developer field、lap、event）首版按 §3.3 忽略 */
export interface FitMessages {
	recordMesgs?: FitRecordMesg[];
	sessionMesgs?: FitSessionMesg[];
	fileIdMesgs?: FitFileIdMesg[];
}

function finiteOrNull(value: number | undefined): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function epochOrNull(value: Date | undefined): number | null {
	return value instanceof Date && !Number.isNaN(value.getTime()) ? value.getTime() : null;
}

/** semicircles → 十进制度；非有限值一律当「这个点没有坐标」 */
function semicirclesToDegrees(value: number | undefined): number | null {
	const raw = finiteOrNull(value);
	return raw === null ? null : raw * SEMICIRCLES_TO_DEGREES;
}

function toTrackPoint(mesg: FitRecordMesg): TrackPoint {
	return {
		time: epochOrNull(mesg.timestamp),
		lat: semicirclesToDegrees(mesg.positionLat),
		lon: semicirclesToDegrees(mesg.positionLong),
		// enhanced_* 分辨率更高，优先用它（海拔单位米、速度 m/s，SDK 已按 profile 比例换算）
		ele: finiteOrNull(mesg.enhancedAltitude) ?? finiteOrNull(mesg.altitude),
		speed: finiteOrNull(mesg.enhancedSpeed) ?? finiteOrNull(mesg.speed),
		hr: finiteOrNull(mesg.heartRate),
		cadence: finiteOrNull(mesg.cadence),
		power: finiteOrNull(mesg.power),
		distance: finiteOrNull(mesg.distance),
	};
}

function deviceLabel(fileId: FitFileIdMesg | undefined): string | null {
	if (!fileId) return null;
	if (fileId.productName) return String(fileId.productName);
	const parts = [fileId.manufacturer, fileId.product].filter((p) => p !== undefined).map(String);
	return parts.length > 0 ? parts.join(' ') : null;
}

export function mapFitMessages(messages: FitMessages): Activity {
	const records = messages.recordMesgs ?? [];
	if (records.length === 0) throw new TrackParseError('noTrackPoints');

	const session = messages.sessionMesgs?.[0];
	const points = records.map(toTrackPoint);

	const warnings: TrackWarningCode[] = [];
	let previous = -Infinity;
	for (const point of points) {
		if (point.time === null) continue;
		if (point.time < previous) {
			warnings.push('nonMonotonicTime');
			break;
		}
		previous = point.time;
	}

	const times = points.map((p) => p.time).filter((t): t is number => t !== null);
	let minTime: number | null = null;
	let maxTime: number | null = null;
	for (const time of times) {
		if (minTime === null || time < minTime) minTime = time;
		if (maxTime === null || time > maxTime) maxTime = time;
	}

	return {
		source: 'fit',
		name: null,
		sport: session?.sport ?? null,
		startTime: epochOrNull(session?.startTime) ?? minTime,
		endTime: epochOrNull(session?.endTime) ?? maxTime,
		points,
		// 逐字段可空：实测 Strava 文件有 totalDistance/totalTimerTime 但没有 totalAscent
		declaredTotals: {
			distanceM: finiteOrNull(session?.totalDistance),
			timerTimeS: finiteOrNull(session?.totalTimerTime) ?? finiteOrNull(session?.totalElapsedTime),
			ascentM: finiteOrNull(session?.totalAscent),
		},
		device: deviceLabel(messages.fileIdMesgs?.[0]),
		warnings,
	};
}

/**
 * 二进制 → 消息分组。
 * SDK 只在真正收到 FIT 文件时才在这里被动态 import，因此不会进入口 chunk（设计稿 §8.3）。
 */
export async function readFitMessages(bytes: Uint8Array): Promise<FitMessages> {
	const { Decoder, Stream } = await import('@garmin/fitsdk');

	const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
	const stream = new Stream(buffer);
	const decoder = new Decoder(stream);

	try {
		if (!Decoder.isFIT(stream)) throw new TrackParseError('unknownFormat');
		if (!decoder.checkIntegrity()) throw new TrackParseError('decodeFailed', 'CRC 校验不通过，文件可能已截断');
		const { messages } = decoder.read();
		return messages as unknown as FitMessages;
	} catch (error) {
		if (error instanceof TrackParseError) throw error;
		throw new TrackParseError('decodeFailed', error instanceof Error ? error.message : String(error));
	}
}
