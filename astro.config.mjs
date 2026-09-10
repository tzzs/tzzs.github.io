import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkTocMarker from './src/plugins/remark-toc-marker.mjs';
import rehypeImageAttrs from './src/plugins/rehype-image-attrs.mjs';
export default defineConfig({
  site: 'https://tzzs.github.io',
  // 「应用」tab 泛化为「项目」后，旧 /apps/* 路径重定向到 /projects/*（静态构建下 Astro 自动生成 meta refresh 页面）
  redirects: {
    '/apps': '/projects',
    '/apps/[slug]': '/projects/[slug]',
    '/apps/[slug]/changelog': '/projects/[slug]/changelog',
    '/apps/[slug]/privacy': '/projects/[slug]/privacy',
  },
  integrations: [
    sitemap({
      // 排除旧站 Hexo 时间路径的 meta refresh 跳转页（[...path].astro 生成），
      // sitemap 只收录真实内容页，跳转页不应作为可收录 URL 提交给搜索引擎
      filter: (page) => !/\/\d{4}\/\d{2}\/\d{2}\//.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath, [remarkTocMarker, { maxDepth: 3 }]],
    rehypePlugins: [rehypeKatex, rehypeImageAttrs],
  },
});
