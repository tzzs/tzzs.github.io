# TAN'S BLOG

个人开发者主页：应用展示 + 技术博客。

基于 **Astro + TypeScript + Content Collections** 构建，部署于 **GitHub Pages**（GitHub Actions 自动构建发布）。

## 技术栈

- [Astro](https://astro.build/)（含 @astrojs/sitemap、@astrojs/rss）
- TypeScript（Strict）
- Markdown / MDX（remark-math + rehype-katex 支持数学公式）
- GitHub Pages + GitHub Actions

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（http://localhost:4321）
npm run build      # 构建到 dist/
npm run preview    # 预览构建产物
```

## 目录结构

```
src/
├── content/
│   ├── blog/          # 博客文章（Markdown，front matter 见下）
│   └── apps/<slug>/   # 应用详情内容（index.md / changelog.md / privacy.md）
├── data/
│   └── apps.ts        # 应用元数据（驱动 /apps 页面）
├── pages/             # 页面路由
├── layouts/           # 布局（可随主题更换）
├── components/        # 组件（可随主题更换）
├── styles/            # 全局样式（可随主题更换）
├── lib/               # 共享逻辑（如分页）
└── content.config.ts  # 内容集合 schema
public/                # 静态资源（robots.txt、验证文件等）
url-checklist.txt      # 旧站 URL 清单（构建旧链接重定向页用）
```

## 新增内容

### 新增文章

在 `src/content/blog/` 下创建 `.md` 文件：

```markdown
---
title: 文章标题
description: 一句话摘要
pubDate: 2026-08-05
tags: [astro, deploy]
categories: [教程]
---

正文内容
```

- `draft: true` 标记草稿（不会发布）
- 文件名即 URL slug：`/blog/文件名/`

### 新增应用

1. 在 `src/data/apps.ts` 的 `apps` 数组中追加一条记录（slug/name/description/status/platforms/links）
2. 在 `src/content/apps/<slug>/` 下创建 `index.md`（产品介绍）、`changelog.md`（更新日志）、`privacy.md`（隐私政策）

页面 `/apps/<slug>/` 自动生成。

## 部署

推送 `main` 分支自动触发 GitHub Actions（`.github/workflows/deploy.yml`）构建并发布到 GitHub Pages，无需手动操作。

## 旧站链接兼容

旧站（Hexo）文章 URL 形如 `/2018/11/16/hello-world/`。新站为 `/blog/hello-world/`，构建时会为全部 61 条旧 URL 自动生成重定向页，旧链接可正常跳转。
