/**
 * 自定义 remark 插件：将正文中的 `[TOC]` 标记段替换为文章目录列表。
 *
 * 背景：remark-toc v8+ 只认「标题型」目录标记（如 `## Table of contents`），
 * 不再处理 `[TOC]` 段落标记（旧版行为已移除），直接用它会导致 `[TOC]`
 * 原样渲染成文字。本插件恢复该行为，专用于本站文章的 `[TOC]` 标记。
 *
 * 实现：
 * - 在 markdown AST 中找到内容仅为 `[TOC]`（不区分大小写）的顶层段落；
 * - 调用 mdast-util-toc 的 toc() 生成目录嵌套列表，替换该标记段；
 * - mdast-util-toc 内部使用 github-slugger 按文档顺序为全部标题（含非顶层）
 *   生成 slug，与 Astro 的 rehypeHeadingIds（同样是 github-slugger、
 *   按文档顺序、每文档新建实例）结果一致，因此目录链接 href 与渲染后
 *   正文标题的 id 一一对应。
 *
 * @param {{ maxDepth?: number }} [options]
 *   maxDepth：目录包含的标题最大层级（默认 3，即 h1-h3）。
 */
import { toc } from 'mdast-util-toc';
import { toString } from 'mdast-util-to-string';

const TOC_MARKER = /^\s*\[toc\]\s*$/i;

export default function remarkTocMarker(options = {}) {
	const maxDepth = options.maxDepth ?? 3;

	return function transformer(tree) {
		// 1. 定位 [TOC] 标记段（仅顶层、纯标记的段落）
		let markerIndex = -1;
		for (let i = 0; i < tree.children.length; i++) {
			const child = tree.children[i];
			if (
				child.type === 'paragraph' &&
				TOC_MARKER.test(toString(child).trim())
			) {
				markerIndex = i;
				break;
			}
		}
		if (markerIndex === -1) return;

		// 2. 生成目录列表（全部顶层 h1-h3 标题），替换标记段
		const result = toc(tree, { maxDepth, tight: true });
		if (result.map) {
			// 给目录列表加 class，便于页面样式定制（hProperties 会被
			// mdast-util-to-hast 合并到渲染出的 <ul> 属性上）
			result.map.data = { hProperties: { className: ['article-toc'] } };
			tree.children.splice(markerIndex, 1, result.map);
		} else {
			// 没有任何可提取标题时，至少移除标记，避免渲染出文字
			tree.children.splice(markerIndex, 1);
		}
	};
}
