# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

TZZ'S STUDIO：个人开发者门户（首页 = Hero + 项目展示 + 博客预览，关于页 = 简介 + 技术栈 + 项目 + 联系方式），基于 **Astro 7 + TypeScript Strict + Content Collections**，部署于 GitHub Pages（GitHub Actions 自动构建）。全站代码注释、提交信息、内容均为中文。

**Node.js ≥ 24**（`package.json` engines 与部署 workflow 均要求）。

## 常用命令

```bash
npm install          # 安装依赖（Node ≥ 24）
npm run dev          # 本地开发 http://localhost:4321
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
npm test             # 单元测试（vitest run，只收 src/lib/track/**/*.test.ts）
npm run test:watch   # 单元测试 watch 模式
npm run check        # 类型检查（@astrojs/check）
```

`src/lib/track/`（GPX/FIT 轨迹解析层）有 vitest 单测，其余部分没有测试与 linter；全站代码质量的兜底手段仍是 `astro check` + 构建通过。新增测试放在被测模块旁边，命名 `*.test.ts`；需要 `DOMParser` 的测试（如 `gpx.test.ts`）在文件顶部用 `// @vitest-environment happy-dom` 单独声明环境，其余跑 Node。

## 架构

### 分层原则（主题可切换）

参考 `MIGRATION_PLAN.md` §5，数据层与主题层严格分离，未来换 Astro 主题时只替换主题层：

| 层 | 目录 | 主题切换时 |
|---|---|---|
| 数据层 | `src/content/`、`src/data/`、`public/images/` | **保留** |
| 主题层 | `src/components/`、`src/layouts/`、`src/styles/`、`src/pages/` | 替换 |

站点级常量（站名、描述、URL）在 `src/consts.ts`，SEO 元信息与 GA4/百度统计脚本在 `src/layouts/BaseLayout.astro` 内联。

### 项目模块（数据驱动，页面自动生成）

- **元数据**：`src/data/projects.ts` 的 `projects` 数组（slug/name/description/status/category/platforms/icon/links），同分类内顺序即展示顺序。
- **分类**：`category` 字段区分 `app`（应用）/ `extension`（VS Code 插件）/ `agent-tool`（Agent 工具）/ `skill`（Skills，展示文案见 `CATEGORY_LABELS`），`CATEGORY_ORDER` 定义列表页分组顺序。
- **详情内容**：`src/content/projects/<slug>/` 下的 `index.md`（项目介绍）/ `changelog.md` / `privacy.md`。**changelog / privacy 仅 `app`、`extension` 分类生成**（`[slug]/changelog.astro`、`privacy.astro` 的 `getStaticPaths` 按 `category` 过滤），`agent-tool`、`skill` 类开源项目的更新日志与隐私说明以 GitHub 仓库为准，不在站内重复维护，详情页直接突出 GitHub/npm 链接。
- **新增项目 = 两步**：`projects.ts` 追加记录 + 创建同名内容目录，路由 `/projects/<slug>[/changelog|/privacy]` 自动生成，无需注册。
- 项目详情页（`src/pages/projects/[slug]/index.astro`）用 `getCollection('projects')` 查找 `entry.id === project.slug`（Astro 7 glob loader 会把 `index.md` 的 id 归一为目录名）；正文自带 H1 会被 CSS 隐藏避免与 Hero 重复。
- **旧 `/apps/*` 重定向**：该模块前身是「应用」tab，`astro.config.mjs` 的 `redirects`（Astro 原生配置，支持 `[slug]` 动态参数）把旧 `/apps`、`/apps/[slug]`、`/apps/[slug]/changelog`、`/apps/[slug]/privacy` 重定向到 `/projects/...`；与下方"旧站 URL 重定向"是两套独立机制（前者是框架原生配置，后者是数据驱动的手写 catch-all），互不依赖。

### 博客模块

- **schema**：`src/content.config.ts`（`blog` + `projects` 两个 zod schema，Astro 7 glob loader）。
- **文章页**：`src/pages/blog/[...slug].astro`，`getStaticPaths` 仅生成非草稿文章；`draft: true` 的文章不生成页面（访问 404）。
- **分页**：`src/lib/paginate.ts` 手写分页逻辑（`PAGE_SIZE = 10`），与 Astro `paginate()` 的 Page 结构兼容；第 1 页 = `/blog/`，其余 = `/blog/page/N/`。`blog/index.astro` 与 `blog/page/[...page].astro` 共用。
- **目录（TOC）**：正文中的 `[TOC]` 标记由自定义插件 `src/plugins/remark-toc-marker.mjs` 替换为 h1–h3 目录列表（class `article-toc`，样式在 `global.css`）。原因：remark-toc v8+ 不再处理 `[TOC]` 段落标记。
- **数学公式**：`remark-math` + `rehype-katex`（astro.config.mjs），katex 样式已引入 global.css。
- **RSS**：`src/pages/rss.xml.js` 生成 atom.xml。

### 工具模块（数据驱动，页面自动生成）

- **元数据**：`src/data/tools.ts` 的 `tools` 数组（slug/name/description/formats），驱动 `/tools/` 列表页；工具名与简介的英文译文按 `tool.<slug>.name` / `tool.<slug>.description` 建 key。
- **页面**：每个工具是 `src/pages/tools/<slug>.astro`（薄壳）+ `src/components/tools/<Name>.astro`（全部 UI 与逻辑），英文版在 `src/pages/en/tools/<slug>.astro` 复用同一组件、只换 `locale`。
- **轨迹预览**（`/tools/track-viewer/`）：解析与统计全在 `src/lib/track/`（纯函数、不碰 DOM、不发请求，因此与主题层无关，换主题时保留）；`@garmin/fitsdk` 与 `leaflet` **只能在解析成功后动态 `import`**——静态引入会把它们拉进入口 chunk，破坏"其它页面 JS 零增长"这条约束（构建产物已按此校验过）。
- 设计决策与实测结论记录在 `docs/superpowers/specs/2026-09-30-track-viewer-tool-page-design.md`。

### 旧站 URL 重定向（关键机制）

`src/pages/[...path].astro` 是根级 catch-all，为 `url-checklist.txt`（仓库根，61 条 Hexo 旧 URL）逐条生成 meta refresh 重定向页，跳转到 `/blog/<slug>/`。

注意两个坑（文件内注释有详细说明）：

- `getStaticPaths` 会被 Astro 抽取到独立模块执行，**不能引用 frontmatter 顶层变量，且 `import.meta.url` 指向打包产物**，因此清单路径用 `process.cwd()`（构建时 cwd 为项目根）。
- 旧路径最后一段不能直接当 slug 用：Astro 会对文件名做 slugify（小写、去标点），重定向页里的 `normalize()` 必须与之对齐，否则中文/标点文件名的文章会 404。

## 部署

推送 `main` 分支自动触发 `.github/workflows/deploy.yml`（`withastro/action@v6` + `deploy-pages@v5`，Node 24）。站点无 base 路径（`site: https://tzzs.github.io`）。

## 其他

- `scripts/` 下是一次性迁移/校验工具（`migrate-posts.mjs` 需旧站 `source/_posts` 目录，迁移已完成，该目录已不存在；`toc-verify.mjs` 校验 TOC 渲染）。
- `docs/` 存有含 katex / [TOC] 的文章清单，改渲染管线时按此抽查回归。
- 博客文章 front matter：`title` / `description` / `pubDate`（必填）、`updated` / `tags` / `categories` / `cover` / `draft` / `author`（默认 TZZ）。文件名即 URL slug（中文保留）。
