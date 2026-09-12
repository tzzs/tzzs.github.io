import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkTocMarker from './src/plugins/remark-toc-marker.mjs';
import rehypeImageAttrs from './src/plugins/rehype-image-attrs.mjs';
export default defineConfig({
  site: 'https://tzzs.github.io',
  // 原生 i18n 路由：中文（默认语言）保持现有无前缀 URL 不变，英文页面额外长在 src/pages/en/ 下。
  // 只做「外壳页 + 项目详情页」的双语，博客正文/更新日志/隐私政策/标签分类动态页不在范围内，
  // 见 src/i18n/strings.ts 顶部注释。
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
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
      // 双语页面互相标注 hreflang alternate；只在某路径确实同时存在两种语言版本时才会输出，
      // 范围外的中文单语页面（博客正文等）不受影响
      i18n: {
        defaultLocale: 'zh',
        locales: { zh: 'zh-CN', en: 'en-US' },
      },
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
