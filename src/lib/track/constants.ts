/**
 * 解析与统计用到的全部阈值（设计稿 §7）
 *
 * 集中一处，是为了让「为什么是这个值」只写一遍，也方便按真实文件校准。
 * 每个常量的理由直接写在它头上，改的人至少看得见当初踩过什么坑。
 */

/**
 * 文件大小上限。3 小时 1 秒采样的 GPX 约 1 万点、几百 KB，50MB 已是极端文件；
 * 超过它继续解析只会让主线程长时间冻结，收益为零。
 */
export const MAX_FILE_BYTES = 50 * 1024 * 1024;

/**
 * 地图 polyline 的渲染点数上限。统计与分段仍用全量点，只有画线时抽稀——
 * Leaflet 的矢量层在两万点以上拖动会明显发涩。
 */
export const MAX_RENDER_POINTS = 20000;

/**
 * 两点间位移小于此值不计入累距。静止时 GPS 抖动通常落在 1–3 米，
 * 不过滤会把「站着不动的十分钟」算成跑了几百米。
 */
export const DIST_DEAD_ZONE_M = 1.5;

/** 海拔中值滤波窗口，必须为奇数（取中心值） */
export const ELE_FILTER_WINDOW = 5;

/**
 * 高程锚点最小变化量。累加爬升时只有相对「上一个已确认高程」变化超过 3 米才算一次真实升降，
 * 否则电梯、GPS 漂移造成的往复抖动会被累计成几百米爬升——这是轨迹工具的标志性 bug。
 */
export const ELE_MIN_DELTA_M = 3.0;

/** 相邻点高差超过此值判为漂移直接丢弃（3 秒内爬升 150 米不是人能干的事） */
export const ELE_ANOMALY_DROP_M = 150;

/**
 * 采用 FIT 的 distance 字段算全程的覆盖率门槛。
 * 实测那份 Strava 文件 15510 个点里只有 1 个点带 distance，没有门槛就会拿一个点的值当全程里程。
 */
export const DISTANCE_FIELD_MIN_COVERAGE = 0.95;

/** 分段表的最大行数，超过则按 [1,2,5,10] 逐级放大段长 */
export const MAX_SPLITS = 200;

/** 英制一段的长度，米（正好 1 英里） */
export const MILE_IN_METERS = 1609.344;

/** FIT 的 semicircles 转十进制度：实测 positionLat 368303180 → 30.877°N */
export const SEMICIRCLES_TO_DEGREES = 180 / 2 ** 31;

/**
 * 心率区间加权时，单个间隔最多只归给前一个点这么多秒。
 * 不设上限的话，「只在开头和结尾各记了一次心率」的文件会被算成整段活动都有心率覆盖，
 * 覆盖率与区间占比都会失真。超出的部分按「无数据」处理，不计入任何区间。
 */
export const HR_MAX_GAP_S = 60;

/** 心率区间边界（占文件内观测到的最大心率的比列），设计稿 §7.6 */
export const HR_ZONE_RATIOS: ReadonlyArray<readonly [number, number]> = [
	[0.5, 0.6],
	[0.6, 0.7],
	[0.7, 0.8],
	[0.8, 0.9],
	[0.9, 1.000001],
];
