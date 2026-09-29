import type { Activity, TrackPoint, TrackWarningCode } from './types';
import { TrackParseError } from './types';

/**
 * GPX（XML）解析。
 *
 * 只用最朴素的 DOM API：按 `localName` 遍历子节点、属性一律 `getAttribute`。
 * 不碰 `querySelector` 和 `getElementsByTagNameNS`——各 DOM 实现对 XML 命名空间选择器的
 * 支持并不一致，而这套 API 在浏览器与测试用的 happy-dom 里行为相同（设计稿 §12.1）。
 *
 * 扩展字段（心率/步频/功率）在 GPX 1.1 里挂在 <extensions> 下，前缀各家不同
 * （gpxtpx:hr、garmin:hr…），所以按 localName 在全子树里找，不猜前缀。
 */

function childByName(el: Element, localName: string): Element | undefined {
	for (const child of Array.from(el.children)) {
		if (child.localName === localName) return child;
	}
	return undefined;
}

function childrenByName(el: Element, localName: string): Element[] {
	return Array.from(el.children).filter((child) => child.localName === localName);
}

/** 深度优先找第一个同名后代，用于 extensions 里的字段 */
function descendantByName(el: Element, localName: string): Element | undefined {
	for (const child of Array.from(el.children)) {
		if (child.localName === localName) return child;
		const found = descendantByName(child, localName);
		if (found) return found;
	}
	return undefined;
}

function textOf(el: Element | undefined): string | null {
	const value = el?.textContent?.trim();
	return value ? value : null;
}

/** 数字字段：非有限数（NaN/Infinity）一律当没有，不接受「0 表示缺失」的暗示 */
function numberOf(el: Element | string | null | undefined): number | null {
	const raw = typeof el === 'string' ? el : textOf(el ?? undefined);
	if (raw === null) return null;
	const value = Number.parseFloat(raw);
	return Number.isFinite(value) ? value : null;
}

function attrNumber(el: Element, name: string): number | null {
	return numberOf(el.getAttribute(name));
}

function epochOf(el: Element | undefined): number | null {
	const raw = textOf(el);
	if (raw === null) return null;
	const value = Date.parse(raw);
	return Number.isNaN(value) ? null : value;
}

/** 收集 <trk> 下所有轨迹段里的 trkpt */
function collectTrackPoints(root: Element): Element[] {
	const points: Element[] = [];
	for (const trk of childrenByName(root, 'trk')) {
		// 一个 trk 可以有多个 trkseg（设备中途暂停/重启），按出现顺序首尾相接
		for (const seg of childrenByName(trk, 'trkseg')) {
			points.push(...childrenByName(seg, 'trkpt'));
		}
		points.push(...childrenByName(trk, 'trkpt'));
	}
	return points;
}

function toPoint(el: Element): TrackPoint {
	return {
		lat: attrNumber(el, 'lat'),
		lon: attrNumber(el, 'lon'),
		ele: numberOf(childByName(el, 'ele')),
		time: epochOf(childByName(el, 'time')),
		hr: numberOf(descendantByName(el, 'hr')),
		cadence: numberOf(descendantByName(el, 'cad')),
		power: numberOf(descendantByName(el, 'power')),
		speed: null,
		distance: null,
	};
}

export function parseGpx(text: string): Activity {
	const doc = new DOMParser().parseFromString(text, 'application/xml');
	const root = doc.documentElement;
	// XML 解析失败时浏览器把 documentElement 换成 <parsererror>，与「不是 GPX」归为同一类
	if (!root || root.localName !== 'gpx') throw new TrackParseError('unknownFormat');

	// 多个 <trk> 表示文件里塞了多段活动，首版只取第一段（预览用途，不做多活动拼接）
	let pointEls = collectTrackPoints(root);
	if (pointEls.length === 0) {
		// 路线规划文件用 <rte>，其 rtept 的结构与 trkpt 一致，退而当作轨迹渲染（设计稿 §10）
		pointEls = childrenByName(root, 'rte').flatMap((rte) => childrenByName(rte, 'rtept'));
	}
	if (pointEls.length === 0) {
		throw new TrackParseError(childrenByName(root, 'wpt').length > 0 ? 'waypointsOnly' : 'noTrackPoints');
	}

	const points = pointEls.map(toPoint);
	const metadata = childByName(root, 'metadata');
	const trk = childByName(root, 'trk');
	const rte = childByName(root, 'rte');
	const author = metadata ? childByName(metadata, 'author') : undefined;
	const creatorName = author ? childByName(author, 'name') : undefined;

	const times = points.map((p) => p.time).filter((t): t is number => t !== null);
	const warnings: TrackWarningCode[] = [];
	// 时间戳非单调（GPS 单元重启、时钟跳变）不重排序，只记一次警告，见设计稿 §5.4
	let previous = -Infinity;
	for (const time of times) {
		if (time < previous) {
			warnings.push('nonMonotonicTime');
			break;
		}
		previous = time;
	}

	// 万点级文件不能用 Math.min(...times)，展开实参会顶穿调用栈
	let minTime: number | null = null;
	let maxTime: number | null = null;
	for (const time of times) {
		if (minTime === null || time < minTime) minTime = time;
		if (maxTime === null || time > maxTime) maxTime = time;
	}

	return {
		source: 'gpx',
		// 路线文件没有 <trk>，名字写在 <rte> 上；两处都查一遍，否则这类文件会显示成无名活动
		name:
			textOf(trk ? childByName(trk, 'name') : undefined) ??
			textOf(rte ? childByName(rte, 'name') : undefined) ??
			textOf(metadata ? childByName(metadata, 'name') : undefined),
		sport: textOf(trk ? childByName(trk, 'type') : undefined) ?? textOf(metadata ? childByName(metadata, 'type') : undefined),
		startTime: minTime ?? epochOf(metadata ? childByName(metadata, 'time') : undefined),
		endTime: maxTime,
		points,
		declaredTotals: { distanceM: null, timerTimeS: null, ascentM: null },
		device: textOf(creatorName) ?? root.getAttribute('creator'),
		warnings,
	};
}
