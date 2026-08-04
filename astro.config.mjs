import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkTocMarker from './src/plugins/remark-toc-marker.mjs';
export default defineConfig({
  site: 'https://tzzs.github.io',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkMath, [remarkTocMarker, { maxDepth: 3 }]],
    rehypePlugins: [rehypeKatex],
  },
});
