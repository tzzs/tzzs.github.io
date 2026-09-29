// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { parseGpx } from './gpx';
import { TrackParseError } from './types';

/**
 * GPX 解析测试。
 *
 * 需要 DOM：`DOMParser` 是浏览器内建、Node 里没有，所以这个文件单独跑在 happy-dom 环境。
 * 正因如此 gpx.ts 只用最朴素的 localName 遍历 + getAttribute，避免「测试里绿、浏览器里错」。
 */

function gpx(inner: string): string {
	return `<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="测试设备" xmlns="http://www.topografix.com/GPX/1/1">${inner}</gpx>`;
}

const TRK = `<trk><name>晨跑</name><type>running</type><trkseg>
	<trkpt lat="30.877" lon="102.900"><ele>3334</ele><time>2025-08-03T08:00:00Z</time></trkpt>
	<trkpt lat="30.878" lon="102.901"><ele>3340</ele><time>2025-08-03T08:00:10Z</time></trkpt>
</trkseg></trk>`;

describe('parseGpx', () => {
	it('解析出坐标、海拔与时间', () => {
		const activity = parseGpx(gpx(TRK));
		expect(activity.source).toBe('gpx');
		expect(activity.points).toHaveLength(2);
		expect(activity.points[0]).toMatchObject({ lat: 30.877, lon: 102.9, ele: 3334, hr: null, cadence: null, power: null });
		expect(activity.points[0].time).toBe(Date.parse('2025-08-03T08:00:00Z'));
	});

	it('取到活动名、运动类型与设备', () => {
		const activity = parseGpx(gpx(TRK));
		expect(activity.name).toBe('晨跑');
		expect(activity.sport).toBe('running');
		expect(activity.device).toBe('测试设备');
	});

	it('起止时间取点里的最小/最大时间', () => {
		const activity = parseGpx(gpx(TRK));
		expect(activity.startTime).toBe(Date.parse('2025-08-03T08:00:00Z'));
		expect(activity.endTime).toBe(Date.parse('2025-08-03T08:00:10Z'));
	});

	it('多个 trkseg 首尾相接（设备中途暂停/重启的常见写法）', () => {
		const twoSegs = `<trk><trkseg><trkpt lat="1" lon="1"/></trkseg><trkseg><trkpt lat="2" lon="2"/></trkseg></trk>`;
		expect(parseGpx(gpx(twoSegs)).points).toHaveLength(2);
	});

	it('extensions 里带前缀的心率/步频/功率按 localName 命中', () => {
		// 命名空间声明必须挂在父元素上：只写在某个子元素上对它后面的兄弟节点不生效，
		// 那种写法本身就不是合法 XML，浏览器与 happy-dom 都会报错
		const withExt = `<trk><trkseg><trkpt lat="1" lon="2"><extensions xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1">
			<gpxtpx:hr>132</gpxtpx:hr>
			<gpxtpx:cad>88</gpxtpx:cad>
			<power>187</power>
		</extensions></trkpt></trkseg></trk>`;
		const point = parseGpx(gpx(withExt)).points[0];
		expect(point.hr).toBe(132);
		expect(point.cadence).toBe(88);
		expect(point.power).toBe(187);
	});

	it('没有海拔与心率时保持 null，不补 0', () => {
		const bare = `<trk><trkseg><trkpt lat="1" lon="2"/></trkseg></trk>`;
		const point = parseGpx(gpx(bare)).points[0];
		expect(point.ele).toBeNull();
		expect(point.hr).toBeNull();
		expect(point.time).toBeNull();
	});

	it('坏数字属性当缺失处理，而不是 NaN', () => {
		const broken = `<trk><trkseg><trkpt lat="abc" lon="2"><ele>x12</ele></trkpt></trkseg></trk>`;
		const point = parseGpx(gpx(broken)).points[0];
		expect(point.lat).toBeNull();
		expect(point.ele).toBeNull();
	});

	// 路线规划文件没有 trkpt，但 rtept 结构一致，退而当作轨迹渲染（设计稿 §10）
	it('只有 <rte> 时用路线点渲染', () => {
		const route = `<rte><name> planned </name><rtept lat="30.1" lon="103.2"/><rtept lat="30.2" lon="103.3"/></rte>`;
		const activity = parseGpx(gpx(route));
		expect(activity.points).toHaveLength(2);
		expect(activity.points[0].lat).toBe(30.1);
		expect(activity.name).toBe('planned');
	});

	it('只有航点 <wpt> 时报 waypointsOnly', () => {
		const waypoints = `<wpt lat="30.1" lon="103.2"/>`;
		expect(() => parseGpx(gpx(waypoints))).toThrow(TrackParseError);
		try {
			parseGpx(gpx(waypoints));
		} catch (error) {
			expect((error as TrackParseError).code).toBe('waypointsOnly');
		}
	});

	it('有 <trk> 但一个点都没有时报 noTrackPoints', () => {
		expect(() => parseGpx(gpx('<trk><trkseg></trkseg></trk>'))).toThrow(/noTrackPoints/);
	});

	it('根元素不是 gpx（比如其实是 TCX）时报 unknownFormat', () => {
		const tcx = `<?xml version="1.0"?><TrainingCenterDatabase><Training><Lap><Trackpoint><Time>2025-01-01T00:00:00Z</Time></Trackpoint></Lap></Training></TrainingCenterDatabase>`;
		let caught: TrackParseError | null = null;
		try {
			parseGpx(tcx);
		} catch (error) {
			caught = error as TrackParseError;
		}
		expect(caught?.code).toBe('unknownFormat');
	});

	it('时间戳倒序不重排序，只记一次 nonMonotonicTime 警告', () => {
		const backwards = `<trk><trkseg>
			<trkpt lat="1" lon="1"><time>2025-08-03T08:01:00Z</time></trkpt>
			<trkpt lat="2" lon="2"><time>2025-08-03T08:00:00Z</time></trkpt>
		</trkseg></trk>`;
		const activity = parseGpx(gpx(backwards));
		expect(activity.warnings).toEqual(['nonMonotonicTime']);
		// 顺序仍是文件顺序
		expect(activity.points[0].lat).toBe(1);
	});
});
