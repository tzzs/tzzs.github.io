import type { Activity, TrackSource } from './types';
import { TrackParseError } from './types';
import { MAX_FILE_BYTES } from './constants';
import { detectFormat, describeFileHead } from './detect';
import { parseGpx } from './gpx';
import { mapFitMessages, readFitMessages } from './fit';

/**
 * 轨迹工具唯一的对外入口（设计稿 §4.1）。
 *
 * 页面只需要这一个函数加 types.ts：内部怎么判格式、FIT 用哪个 SDK、阈值是多少，
 * 全在这一层消化。将来把它整体搬进 Web Worker，消费方一行都不用改。
 *
 * 校验集中在此，因为「访客拖进来的文件」是这页唯一的真边界；边界之内的纯函数层不重复设防。
 */

function decodeText(bytes: Uint8Array): string {
	// fatal:false 让坏字节变成替换字符而不是抛错，坏 XML 随后会因根元素不是 <gpx> 归入 unknownFormat
	return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

export async function parseTrack(source: TrackSource): Promise<Activity> {
	if (typeof source?.arrayBuffer !== 'function') throw new TrackParseError('notAFile');

	// 两个上限都查：File.size 在某些来源上可能是 0 或过期值，实际字节数才算数
	if (source.size > MAX_FILE_BYTES) throw new TrackParseError('tooLarge', String(source.size));

	const bytes = new Uint8Array(await source.arrayBuffer());
	if (bytes.byteLength === 0) throw new TrackParseError('unknownFormat', 'empty file');
	if (bytes.byteLength > MAX_FILE_BYTES) throw new TrackParseError('tooLarge', String(bytes.byteLength));

	const format = detectFormat(bytes);
	if (format === 'unknown') throw new TrackParseError('unknownFormat', describeFileHead(bytes));

	const activity =
		format === 'gpx' ? parseGpx(decodeText(bytes)) : mapFitMessages(await readFitMessages(bytes));

	if (activity.points.length === 0) throw new TrackParseError('emptyPoints');

	return activity;
}

export * from './types';
export { computeStats } from './stats';
export { computeSplits, chooseSegmentMeters, segmentLengthMeters } from './splits';
export { computeHrZones } from './hrZones';
export { rollingPace, percentile } from './pace';
export { resampleForRender, hasCoordinates } from './resample';
export * as trackFormat from './format';
