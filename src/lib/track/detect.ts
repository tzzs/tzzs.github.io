import type { TrackFormat } from './types';

/**
 * 按字节判定格式，不信扩展名（设计稿 §3.3）。
 *
 * 这一层刻意不 import FIT SDK：SDK 要等确认是 FIT 之后才动态加载，
 * 若在模块顶层被这里静态引到，Vite 会把它拉进入口 chunk，整站体积基线当场翻倍。
 * 权威校验（`Decoder.isFIT` / CRC）在 `fit.ts` 里加载 SDK 之后再补一次。
 */

const FIT_HEADER_SIZES = new Set([12, 14]);
/** 实测：ASCII ".FIT" 位于文件头偏移 8–11 */
const FIT_SIGNATURE = [0x2e, 0x46, 0x49, 0x54];

function isFitBytes(bytes: Uint8Array): boolean {
	if (bytes.length < 12) return false;
	if (!FIT_HEADER_SIZES.has(bytes[0])) return false;
	return FIT_SIGNATURE.every((code, i) => bytes[8 + i] === code);
}

export function detectFormat(bytes: Uint8Array): TrackFormat | 'unknown' {
	if (isFitBytes(bytes)) return 'fit';

	// GPX 是 XML，只看文件头够定位根元素了；声明与注释都可能在前头，所以找 <gpx 而不是比对开头
	const head = new TextDecoder('utf-8', { fatal: false }).decode(bytes.subarray(0, Math.min(bytes.length, 4096)));
	if (/<gpx[\s/>]/.test(head)) return 'gpx';

	return 'unknown';
}

/** 供错误提示与排查使用：把实际读到的文件头回显成可读形式 */
export function describeFileHead(bytes: Uint8Array, length = 8): string {
	const slice = bytes.subarray(0, Math.min(bytes.length, length));
	const hex = Array.from(slice, (b) => b.toString(16).padStart(2, '0')).join(' ');
	const text = new TextDecoder('utf-8', { fatal: false })
		.decode(slice)
		.replace(/[^\x20-\x7e]/g, '·');
	return `${hex}  |  ${text}`;
}
