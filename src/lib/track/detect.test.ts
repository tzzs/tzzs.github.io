import { describe, expect, it } from 'vitest';
import { detectFormat, describeFileHead } from './detect';

function fitBytes(headerSize = 14): Uint8Array {
	const bytes = new Uint8Array(32);
	bytes[0] = headerSize;
	// 实测：ASCII ".FIT" 位于偏移 8–11
	bytes[8] = 0x2e;
	bytes[9] = 0x46;
	bytes[10] = 0x49;
	bytes[11] = 0x54;
	return bytes;
}

function gpxBytes(body = '<gpx version="1.1"><trk><trkseg><trkpt lat="1" lon="2"/></trkseg></trk></gpx>'): Uint8Array {
	return new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>\n${body}`);
}

describe('detectFormat', () => {
	it('认得出 14 字节头与 12 字节头两种 FIT', () => {
		expect(detectFormat(fitBytes(14))).toBe('fit');
		expect(detectFormat(fitBytes(12))).toBe('fit');
	});

	it('带 XML 声明的 GPX 判为 gpx', () => {
		expect(detectFormat(gpxBytes())).toBe('gpx');
	});

	it('没有 XML 声明、直接以 <gpx 开头也认', () => {
		expect(detectFormat(new TextEncoder().encode('<gpx version="1.0"><trk/></gpx>'))).toBe('gpx');
	});

	// 访客把 .txt 改名成 .fit、或把 TCX 当 GPX 上传，是这个工具最常遇到的误用
	it('不信扩展名：内容是 XML 就按 XML 处理', () => {
		const nameWasFit = gpxBytes();
		expect(detectFormat(nameWasFit)).toBe('gpx');
	});

	it('头长字段不是 12/14 的 .FIT 内容不算 FIT', () => {
		const bytes = fitBytes(13);
		expect(detectFormat(bytes)).toBe('unknown');
	});

	it('空文件与随机字节判为 unknown', () => {
		expect(detectFormat(new Uint8Array(0))).toBe('unknown');
		expect(detectFormat(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]))).toBe('unknown');
	});

	it('小于头长的残文件不越界，判 unknown', () => {
		expect(detectFormat(new Uint8Array([14, 32]))).toBe('unknown');
	});

	it('文件头回显同时给出十六进制与可见字符', () => {
		const text = describeFileHead(gpxBytes('<gpx/>'), 5);
		expect(text).toContain('|');
		expect(text.toLowerCase()).toContain('3c 3f 78 6d 6c');
	});
});
