/**
 * 工具列表数据（`src/data/tools.ts`）
 *
 * 与 `src/data/projects.ts` 同样的分工：本文件驱动 /tools/ 列表页，
 * 每个工具的实际界面是 `src/pages/tools/<slug>.astro`（英文版长在 `src/pages/en/tools/` 下）。
 * 名称与简介的英文译文按 `tool.<slug>.name` / `tool.<slug>.description` 建 key，
 * 与项目列表页走同一套查表逻辑。
 */
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/strings';

export interface Tool {
	/** 同时用作路由 `/tools/<slug>` */
	slug: string;
	name: string;
	description: string;
	/** 输入格式，列表页以小标签展示 */
	formats: string[];
}

export const tools: Tool[] = [
	{
		slug: 'track-viewer',
		name: '轨迹预览',
		description: '在浏览器里预览 GPX / FIT 运动文件：轨迹地图、海拔与配速剖面、分段时间表与心率区间，文件不会上传。',
		formats: ['GPX', 'FIT'],
	},
];

/** 工具详情页的 URL：中英文各自走自己的 locale 前缀 */
export function toolHref(locale: Locale, slug: string): string {
	return getRelativeLocaleUrl(locale, `tools/${slug}`);
}
