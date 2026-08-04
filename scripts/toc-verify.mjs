// 临时验证脚本：用 Astro 的 markdown 处理器 + 自定义 remark-toc-marker 渲染含 [TOC] 的两篇文章
// 验证：(1) [TOC] 文字不再出现 (2) TOC 链接 href（解码后）与正文标题 id 一一对应
import { readFileSync } from 'node:fs';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkTocMarker from '../src/plugins/remark-toc-marker.mjs';

const files = ['SM4-国密算法.md', 'Smart-Light-Strip.md'];

const processor = await createMarkdownProcessor({
  remarkPlugins: [remarkMath, [remarkTocMarker, { maxDepth: 3 }]],
  rehypePlugins: [rehypeKatex],
});

// 从 <ul class="article-toc"> 开始，按 <ul>/</ul> 配对截取整个目录块
function extractTocBlock(code) {
  const startTag = '<ul class="article-toc">';
  const start = code.indexOf(startTag);
  if (start === -1) return null;
  let depth = 0;
  let i = start;
  for (; i < code.length; i++) {
    if (code.startsWith('<ul', i)) {
      depth++;
      i += 2;
    } else if (code.startsWith('</ul>', i)) {
      depth--;
      i += 4;
      if (depth === 0) break;
    }
  }
  return code.slice(start, i + 1);
}

let ok = true;
for (const f of files) {
  const src = readFileSync(`E:/blog/tzzs.github.io/src/content/blog/${f}`, 'utf8');
  const body = src.replace(/^---\n[\s\S]*?\n---\n/, '');
  const { code, metadata } = await processor.render(body, {
    fileURL: `file:///E:/blog/tzzs.github.io/src/content/blog/${f}`,
  });
  const headings = metadata.headings ?? [];
  const tocLeft = /\[TOC\]/.test(code);
  const tocBlock = extractTocBlock(code);
  const tocLinks = tocBlock
    ? [...tocBlock.matchAll(/<a href="#([^"]+)"/g)].map((m) => decodeURIComponent(m[1]))
    : [];
  const ids = new Set([...code.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const missing = tocLinks.filter((s) => !ids.has(s));
  // 期望：h1-h3 的顶层标题数量
  const expected = headings.filter((h) => h.depth <= 3).length;
  console.log('===', f, '===');
  console.log('headings:', headings.map((h) => `${h.depth}:${h.slug}`).join(' | '));
  console.log('[TOC] remaining:', tocLeft);
  console.log('toc links:', tocLinks.length, '(expected', expected + ')', '| missing anchors:', JSON.stringify(missing));
  if (tocLeft || missing.length > 0 || !tocBlock || tocLinks.length !== expected) ok = false;
}
console.log(ok ? '\nALL CHECKS PASSED' : '\nCHECKS FAILED');
