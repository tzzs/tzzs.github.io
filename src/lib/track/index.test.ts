// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { parseTrack } from './index';
import { TrackParseError } from './types';
import { MAX_FILE_BYTES } from './constants';
import { fakeSource } from './test-helpers';

const GPX_TEXT = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="测试设备"><trk><name>晨跑</name><trkseg>
<trkpt lat="30.877" lon="102.900"><ele>3334</ele><time>2025-08-03T08:00:00Z</time></trkpt>
<trkpt lat="30.878" lon="102.901"><ele>3340</ele><time>2025-08-03T08:01:00Z</time></trkpt>
</trkseg></trk></gpx>`;

function bytesOf(text: string): Uint8Array {
	return new TextEncoder().encode(text);
}

function fitMagicBytes(): Uint8Array {
	const bytes = new Uint8Array(64);
	bytes[0] = 14;
	bytes[8] = 0x2e;
	bytes[9] = 0x46;
	bytes[10] = 0x49;
	bytes[11] = 0x54;
	return bytes;
}

async function codeOf(promise: Promise<unknown>): Promise<string | null> {
	try {
		await promise;
		return null;
	} catch (error) {
		return error instanceof TrackParseError ? error.code : `unexpected:${String(error)}`;
	}
}

describe('parseTrack', () => {
	it('GPX 全链路走通，产出可以直接渲染的 Activity', async () => {
		const activity = await parseTrack(fakeSource(bytesOf(GPX_TEXT), 'run.gpx'));
		expect(activity.source).toBe('gpx');
		expect(activity.name).toBe('晨跑');
		expect(activity.points).toHaveLength(2);
		expect(activity.points[0].ele).toBe(3334);
	});

	// 访客把 .txt / .csv / 别的应用的导出文件改名上传，是最常见的一次失败
	it('内容是 XML 就按内容处理，与文件名无关', async () => {
		const activity = await parseTrack(fakeSource(bytesOf(GPX_TEXT), '假装是fit.fit'));
		expect(activity.source).toBe('gpx');
	});

	it('超过上限的文件直接拒绝，不进入解析', async () => {
		const code = await codeOf(parseTrack({ name: 'big.gpx', size: MAX_FILE_BYTES + 1, arrayBuffer: async () => new ArrayBuffer(1) }));
		expect(code).toBe('tooLarge');
	});

	it('传进来的东西不是文件时报 notAFile', async () => {
		const code = await codeOf(parseTrack({ name: 'x', size: 1 } as unknown as Parameters<typeof parseTrack>[0]));
		expect(code).toBe('notAFile');
	});

	it('魔数对不上的二进制报 unknownFormat，并带上文件头便于排查', async () => {
		const code = await codeOf(parseTrack(fakeSource(new Uint8Array(Array.from({ length: 64 }, (_, i) => i)), 'junk.bin')));
		expect(code).toBe('unknownFormat');
	});

	it('空文件不会越界读，报 unknownFormat', async () => {
		expect(await codeOf(parseTrack(fakeSource(new Uint8Array(0))))) .toBe('unknownFormat');
	});

	// 有 .FIT 魔数但内容是垃圾：必须落成带原因码的失败，而不是把 SDK 的裸异常抛给 UI
	it('坏 FIT 文件干净失败', async () => {
		const code = await codeOf(parseTrack(fakeSource(fitMagicBytes(), 'broken.fit')));
		expect(['decodeFailed', 'unknownFormat', 'noTrackPoints']).toContain(code);
	});

	it('GPX 声明了但一个轨迹点都没有，报 noTrackPoints', async () => {
		const empty = `<?xml version="1.0"?><gpx version="1.1"><trk><trkseg></trkseg></trk></gpx>`;
		expect(await codeOf(parseTrack(fakeSource(bytesOf(empty))))).toBe('noTrackPoints');
	});
});
