/**
 * 轨迹解析层的唯一数据契约（设计稿 §5）
 *
 * 视图层只认这里的类型，不认识 GPX 也不认识 FIT：两种格式的差异在解析层内部消化完，
 * 出去的是同一份 Activity。八个测量字段全部可空是刻意的——真实文件里缺什么是常态，
 * 实测那份 Strava FIT 只有 18% 的点带心率（设计稿 §3.2），视图层不允许假设任何字段存在。
 */

/** 支持的轨迹文件格式 */
export type TrackFormat = 'gpx' | 'fit';

/** 距离单位，决定分段长度与所有展示文案 */
export type Unit = 'metric' | 'imperial';

/** 单个采样点。缺什么就是 null，不补零、不用 0 表示「没有」 */
export interface TrackPoint {
	/** epoch ms */
	time: number | null;
	/** 纬度，十进制度（FIT 的 semicircles 已在解析层换算完） */
	lat: number | null;
	lon: number | null;
	/** 海拔，米 */
	ele: number | null;
	/** 心率 bpm */
	hr: number | null;
	/** 步频 spm */
	cadence: number | null;
	/** 功率 W */
	power: number | null;
	/** 瞬时速度 m/s；仅 FIT 直接给，GPX 为 null */
	speed: number | null;
	/** 累计里程，米；仅 FIT 的 distance 字段有，GPX 为 null */
	distance: number | null;
}

/**
 * 设备/导出方自报的总量。逐字段可空：实测那份 Strava 文件有 totalDistance 与
 * totalTimerTime，但没有 total_ascent，也没有任何心率汇总（设计稿 §3.2 第 3 条）。
 */
export interface DeclaredTotals {
	distanceM: number | null;
	timerTimeS: number | null;
	ascentM: number | null;
}

/** 解析期发现的非致命问题，机器码；文案由 UI 侧按 locale 翻译 */
export type TrackWarningCode = 'nonMonotonicTime' | 'pointSkippedNoCoord' | 'eleAnomalyDropped';

/** 致命失败的原因码，对应设计稿 §10 的错误表 */
export type TrackErrorCode =
	| 'notAFile'
	| 'tooLarge'
	| 'unknownFormat'
	| 'noTrackPoints'
	| 'waypointsOnly'
	| 'emptyPoints'
	| 'decodeFailed';

/**
 * 解析入口接受的输入。刻意取 `File` 的结构化子集而不是 `File` 本身：
 * 页面直接传 File 就满足，单测传普通对象即可，解析层因此不需要任何浏览器文件 API 就能跑。
 */
export interface TrackSource {
	readonly name: string;
	readonly size: number;
	arrayBuffer(): Promise<ArrayBuffer>;
}

/** 带原因码的解析失败，UI 只需按 code 查文案，不必解析 message */
export class TrackParseError extends Error {
	readonly code: TrackErrorCode;
	/** 面向排查的附加信息（如实际读到的文件头字节、SDK 原始报错摘要），不直接展示给访客 */
	readonly detail: string | null;

	constructor(code: TrackErrorCode, detail: string | null = null) {
		super(detail ? `${code}: ${detail}` : code);
		this.name = 'TrackParseError';
		this.code = code;
		this.detail = detail;
	}
}

/** 一次完整活动的解析结果 */
export interface Activity {
	source: TrackFormat;
	name: string | null;
	sport: string | null;
	startTime: number | null;
	endTime: number | null;
	/** 顺序即文件中的出现顺序，解析层不做重排序（设计稿 §5.4） */
	points: TrackPoint[];
	declaredTotals: DeclaredTotals;
	device: string | null;
	warnings: TrackWarningCode[];
}

/** 汇总统计。不含配速——配速由 format 层从距离与时长现算，避免出现第二个事实来源 */
export interface Stats {
	distanceM: number | null;
	durationS: number | null;
	ascentM: number | null;
	descentM: number | null;
	avgHr: number | null;
	maxHr: number | null;
	avgCadence: number | null;
	maxCadence: number | null;
	avgPower: number | null;
}

/** 一个分段（每公里 / 每英里） */
export interface Split {
	/** 从 1 开始 */
	index: number;
	/** 本段实际长度，末段可能不足一个段长 */
	distanceM: number;
	durationS: number | null;
	ascentM: number | null;
	avgHr: number | null;
	/** 末段不足一个完整段长 */
	partial: boolean;
}

/** 心率区间的一项。label 由 UI 侧给，这里只放边界与结果 */
export interface HrZone {
	index: number;
	fromRatio: number;
	toRatio: number;
	seconds: number;
	/** 占「有心率数据覆盖的时长」的百分比，0–100 */
	pct: number;
}

export interface HrZoneResult {
	zones: HrZone[];
	/** 分母基准：文件内观测到的最大心率 */
	maxHr: number;
	coveredS: number;
	/** 区间之外（低于 50% maxHr）的时间 */
	belowZ1S: number;
	/** 有心率数据的时长占活动总时长的比例，0–100 */
	coveragePct: number;
}
