# 从 Hexo 博客迁移至 Astro 开发者门户

> 状态：待执行 | 创建日期：2026-08-05 | 当前分支：`hexo`
> 定位：不是单纯博客迁移，而是将 `tzzs.github.io` 重建为「个人开发者主页 + 应用展示 + 博客」的产品门户

## 1. 目标

基于 Astro 搭建静态网站，作为个人开发者主页：

- 首页展示个人理念 + **正在开发的应用**（产品入口门户，而非博客首页）
- 每个应用拥有独立介绍页面（产品介绍 / 功能 / 更新日志 / 隐私政策 / 下载入口）
- 博客子模块：技术文章、产品更新、开发记录
- 架构清晰、内容和 UI 解耦、易维护、可扩展
- **未来可方便切换 Astro 主题**（AstroWind、Astroship 等）

第一阶段不追求复杂设计，优先保证：架构清晰、内容与 UI 解耦、易维护、可扩展。

## 2. 技术栈

**使用：** Astro · TypeScript (Strict) · Markdown / MDX · Astro Content Collections · GitHub Pages · GitHub Actions

**暂不引入：** React · Vue · Tailwind · UI 组件库 · CMS · 数据库（第一版保持轻量，后续按需升级）

**初始化方式：**

```bash
npm create astro@latest -- --template blog
# TypeScript: Strict / Install deps: Yes / Git repo: Yes
```

## 3. 现状盘点（迁移输入）

| 分支 | 内容 | 处置 |
|---|---|---|
| `hexo` | Hexo 源码：63 篇 Markdown、cactus 主题、`_config*.yml`、旧 workflow | → **重命名为 `main`**，废弃 `hexo` 分支名（见 §6） |
| `master` | 构建产物（`/2018/11/16/hello-world/` 结构） | 新架构不再需要，保留为历史快照 |

需迁移的内容：

- 63 篇文章（约 288K），front matter：`title/date/update/categories/tags/cover`，categories 为嵌套数组
- 图片全部外链（腾讯云 COS），本地无图片资源目录 → `public/images` 用于新站自己的图片
- 4 篇含 `[TOC]` 标签；部分文章 HTML 混排
- 草稿 2 篇（`source/draft/`）
- 页面：about、categories、tags、link（友链）、movies（豆瓣，**已确认去掉**）
- 百度 / Google 验证文件、robots.txt、Google Analytics + 百度统计
- 旧产物：sitemap.xml、atom.xml、search.xml

**旧站 URL 结构**：`/2018/11/16/hello-world/`（中文 slug 原样保留），已被搜索引擎收录 → 见 §7 URL 策略。

## 4. 已确认决策

| 决策项 | 结论 |
|---|---|
| 网站定位 | 开发者主页门户（首页 = Hero + Apps + Blog 预览 + About + Footer） |
| 框架 | Astro 官方 blog starter 起步，TypeScript Strict |
| 应用模块 | `src/data/apps.ts` 数据配置化 + `src/content/apps` 详情内容，页面自动生成 |
| 博客 | Content Collections：`src/content/blog`，支持 Markdown、标签、分类、RSS、SEO |
| 豆瓣页面 | 去掉 |
| 分支结构 | **源码主分支切换为 `main`**；废弃 Hexo 时代的 `hexo` + `master` 产物双分支结构，不再使用 |
| 部署 | 仅 GitHub Pages，采用 **GitHub Actions 官方部署模式**（`withastro/action@v3` + `actions/deploy-pages@v4`） |
| 依赖 | 不引入 React / Vue / Tailwind / UI 库 / CMS / 数据库 |

## 5. 目标信息架构

```
/
├── 首页（门户：Hero → Apps → Blog Preview → About → Footer）
├── /apps                          # 应用列表
│   ├── /apps/ai-diary             # 产品介绍 / 功能 / 更新日志 / 隐私政策 / 下载入口
│   ├── /apps/ai-diary/changelog
│   ├── /apps/ai-diary/privacy
│   ├── /apps/lut-studio           # 同上
│   ├── /apps/lut-studio/changelog
│   ├── /apps/lut-studio/privacy
│   └── /apps/markdown-editor      # 同上
├── /blog                          # 博客列表
│   └── /blog/[slug]               # 文章详情
├── /about
├── /contact
└── /404
```

**目标仓库结构（单仓库）：**

```
repository
├── src
│   ├── components          # 可替换（主题层）
│   ├── layouts             # 可替换（主题层）
│   ├── pages               # 可替换（主题层）
│   ├── content
│   │   ├── blog            # 63 篇迁移文章 + 新文章
│   │   └── apps            # 每应用一个目录：index.md / changelog.md / privacy.md
│   ├── data
│   │   └── apps.ts         # 应用元数据（slug/name/description/status/platforms/links）
│   └── styles              # 可替换（主题层）
├── public
│   ├── images
│   ├── favicon.svg
│   ├── robots.txt
│   ├── baidu_verify_code-*.html
│   └── google*.html
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── package.json
└── README.md
```

**可替换 / 不可替换分层（主题切换原则）：**

| 层 | 内容 | 主题切换时 |
|---|---|---|
| 数据层 | `src/content`、`src/data`、`public/images` | **保留** |
| 主题层 | `src/components`、`src/layouts`、`src/styles`、`src/pages` | **替换** |

## 6. 分支与部署策略

**最终形态：单一源码主分支 `main` + GitHub Actions 官方部署。** 不再存在 `hexo` 分支，不再存在 `hexo` + `master` 产物双分支结构。

### 分支重构步骤（顺序执行）

1. `git branch -m hexo main`（本地立即重命名）
2. 开发全程在 `main` 上进行（注：旧 workflow 触发条件为 `branches: [hexo]`，push `main` 不会触发旧 CI，安全）
3. 全部代码与 `deploy.yml` 就绪、本地构建验证通过后：
   - `git push -u origin main`（创建远程 `main`）
   - GitHub 设置手动操作：Settings → Branches → 默认分支改为 `main`
   - `git push origin :hexo`（**删除远程 `hexo` 分支**，需默认分支已是 `main` 才允许）
4. **GitHub Pages 设置切换**（手动步骤）：Settings → Pages → Source 改为 `GitHub Actions`
5. push `main` 触发新 workflow 部署上线
6. `master` 产物分支**保留为历史快照，不删除**（新站稳定前可随时回退；稳定后可归档）
7. 旧内容在迁移期间原样保留在 master 分支的产物中，直到新站验证通过

### 部署 workflow（`deploy.yml`）

```yaml
name: Deploy Astro Site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

`astro.config.mjs`（`username.github.io` 仓库，无 base）：

```js
export default defineConfig({
  site: "https://tzzs.github.io",
})
```

## 7. 博客 URL 策略（SEO 兼容）

**决策**：新站博客采用 Content Collections 默认结构 `/blog/[slug]`，slug = 文件名（中文保留）。
旧站 `/YYYY/MM/DD/slug/` 结构不再延续。

**兼容措施**：迁移脚本同时生成旧 URL 的重定向页，**逐条保留旧链接**：

```
旧: /2018/11/16/hello-world/  →  生成 2018/11/16/hello-world/index.html
    （meta refresh / JS redirect 跳转到 /blog/hello-world/）
```

- 63 个旧 URL 全部生成重定向页（静态托管无法 301，用 meta refresh 实现同等效果，对搜索引擎可识别）
- 旧站点地图、旧页面（`/archives`、`/categories`、`/tags`）在新站生成对应页或跳转，无法对应的返回自定义 404
- Google Search Console / 百度站长上线后重新提交 sitemap

## 8. 数据模型设计

### 应用数据（`src/data/apps.ts`）

```ts
export const apps = [
  {
    slug: "ai-diary",
    name: "AI Diary",
    description: "轻量、跨平台、AI 原生的日记应用",
    status: "development",           // development | beta | released
    platforms: ["iOS", "Android", "macOS", "Windows"],
    links: {                         // 下载入口（可选）
      appStore: "...",
      googlePlay: "...",
    },
  },
  // lut-studio / markdown-editor ...
]
```

### 应用详情内容（`src/content/apps/`）

每应用一个目录，页面由 `apps.ts` 元数据 + collection 内容拼接渲染：

```
src/content/apps/ai-diary/
├── index.md        # 产品介绍 + 核心功能 + 使用场景
├── changelog.md    # 更新日志
└── privacy.md      # 隐私政策
```

路由：`/apps/[slug]`、`/apps/[slug]/changelog`、`/apps/[slug]/privacy`

### 博客集合（`src/content/blog`）

```md
---
title: Astro 部署实践
description: 使用 Astro 和 GitHub Pages 搭建网站
pubDate: 2026-08-05
tags: [astro, deploy]
categories: [教程]
---

正文
```

旧文章 front matter 转换映射：

| Hexo 旧字段 | Astro 新字段 | 说明 |
|---|---|---|
| `title` | `title` | 原样 |
| `date` | `pubDate` | 格式兼容解析 |
| `update` | `updated` | 可选，空值丢弃 |
| `categories`（嵌套数组） | `categories` | 平铺 |
| `tags` | `tags` | 原样 |
| `cover` | `cover` | 可选保留，列表页可用 |

slug = 原文件名（中文保留），使重定向映射唯一。

### 功能对照表

| Hexo 能力 | Astro 替代 | 备注 |
|---|---|---|
| hexo-generator-sitemap | `@astrojs/sitemap` | sitemap.xml |
| hexo-generator-feed | `@astrojs/rss` | atom.xml，订阅地址变化（旧地址可跳转） |
| markdown-it-katex | `remark-math` + `rehype-katex` | 4 篇旧文章使用 |
| hexo-generator-search | Pagefind | **第二阶段**，第一阶段不做 |
| 归档 / 分类 / 标签 | Content Collections 派生 | |
| Google Analytics / 百度统计 | BaseLayout 脚本注入 | 脚本原样保留 |
| 豆瓣 / Coding Pages / 双主题构建 | — | 已确认去掉 |

## 9. 迁移步骤

### 阶段 0：准备与备份

- [ ] 记录旧站关键状态：`git log` 保留、master 产物分支不动（天然备份）
- [ ] 从 `master` 导出 63 条旧 URL 清单 → `url-checklist.txt`（重定向页生成与验证的依据）
- [ ] 确认本地 Node ≥ 18

### 阶段 1：初始化 Astro 骨架

- [ ] `npm create astro@latest -- --template blog`（TS Strict、装依赖、git 初始化）
- [ ] 确认生成结构：`src/content/blog`、`src/layouts`、`src/components`、`src/styles`、`public`
- [ ] `astro.config.mjs`：site、sitemap、rss 集成、markdown 管线（math + MDX）
- [ ] `src/content.config.ts`：定义 `blog` 与 `apps` 两个集合的 schema
- [ ] `public/` 放入：robots.txt、百度/Google 验证文件

### 阶段 2：数据层

- [ ] `src/data/apps.ts`：写入 3 个示例应用（AI Diary / LUT Studio / Markdown Editor）
- [ ] `src/content/apps/`：3 个应用的示例内容（index / changelog / privacy 的 MDX 骨架）
- [ ] 博客迁移脚本：`source/_posts/*.md` → `src/content/blog/`（front matter 映射、嵌套分类平铺、空字段清理）
- [ ] 草稿 2 篇 → `draft: true`
- [ ] 示例文章 2~3 篇（如「Astro 部署实践」）

### 阶段 3：页面（主题层）

- [ ] `BaseLayout`：head、SEO metadata、统计脚本（GA + 百度）
- [ ] 首页门户：Hero（理念 + CTA）→ Apps 列表 → Blog 预览 → About 片段 → Footer
- [ ] `/apps` 列表页 + `/apps/[slug]` 详情页（含 changelog / privacy 子页）
- [ ] `/blog` 列表页（分页、标签、分类）+ `/blog/[slug]` 详情页（TOC、katex 支持）
- [ ] `/about`、`/contact`、404 页
- [ ] **重定向页生成**：63 个旧 URL → meta refresh 跳转新文章页（脚本生成）

### 阶段 4：旧内容特殊处理

- [ ] 4 篇 `[TOC]` 文章：替换为 Astro TOC 组件 / remark-toc
- [ ] 抽检 katex、HTML 混排、代码块渲染
- [ ] 友链（`source/_data/link.yml`）：并入 about 或单独页面（可选）

### 阶段 5：分支重构 + CI/CD

- [ ] 提交 `.github/workflows/deploy.yml`（此时仍在本地 `main`，push 不触发旧 CI）
- [ ] 按 §6 执行分支重构：push main → 远程默认分支改 `main` → 删除远程 `hexo` → Pages Source 切换 `GitHub Actions`
- [ ] push `main` 触发新 workflow，确认部署成功

### 阶段 6：验证与上线

- [ ] 本地 `astro build` + `astro preview` 全量检查
- [ ] 抽查旧 URL：`/2018/11/16/hello-world/` 等 → 正确跳转到 `/blog/hello-world/`
- [ ] 功能核对：sitemap.xml、atom.xml、katex、统计脚本、404
- [ ] 线上验证：`https://tzzs.github.io` 首页门户、3 个应用页、博客页
- [ ] Google Search Console / 百度站长重新提交 sitemap

### 阶段 7：清理

- [ ] 删除旧 Hexo 文件：`themes/`、`scaffolds/`、`_config*.yml`、`deploy.sh`、旧 package.json 依赖
- [ ] 删除旧 workflow（hexo.yml）、旧重定向目标页维护清单（保留生成脚本）
- [ ] 更新 README（新架构说明）
- [ ] 确认新站稳定后：master 产物分支保留（可归档，不删）
- [ ] 删除开发分支

## 10. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| 博客 URL 结构变化（`/YYYY/MM/DD/slug/` → `/blog/slug/`） | SEO 权重流失 | 63 个旧 URL 全部生成 meta refresh 重定向页 |
| 中文 slug 编码差异 | 链接 404 | slug 沿用文件名 + 重定向映射校验 |
| `[TOC]` / katex 特有关键词语法 | 排版损坏 | remark 插件替换，4 篇重点抽检 |
| 分支重构（hexo→main）+ Pages 设置切换出错 | 站点中断 | 顺序执行：先本地验证 → 再改分支 → 最后切 Pages Source；master 保留可回退 |
| Pages 部署失败 | 站点不可访问 | `workflow_dispatch` 可手动重跑；本地 preview 先行验证 |
| 旧 CI 误触发 | 旧产物覆盖 | 旧 workflow 只监听 `hexo` 分支，删除远程 `hexo` 后自然失效；push `main` 全程安全 |
| 数据与 UI 耦合 | 后续换主题困难 | 严格遵循 §5 分层：数据层与主题层分离 |

## 11. 第一阶段交付清单

- [ ] Astro 项目初始化（TS Strict）
- [ ] GitHub Actions 自动部署 + GitHub Pages 可访问
- [ ] 首页门户（Hero / Apps / Blog Preview / About / Footer）
- [ ] 应用列表页 + 应用详情页模板（含 changelog / privacy 子页）
- [ ] 博客列表页 + 详情页
- [ ] About / Contact 页面
- [ ] 3 个示例应用数据（AI Diary / LUT Studio / Markdown Editor）
- [ ] 2~3 篇示例文章
- [ ] 63 篇旧文章迁移 + 旧 URL 重定向

## 12. 验证清单（上线前逐项打勾）

- [ ] 首页门户结构完整（Hero / Apps / Blog / About / Footer）
- [ ] `/apps` 及 3 个应用详情页（含 changelog、privacy）正常
- [ ] `/blog` 列表、分页、标签、分类正常
- [ ] 63 篇旧文章全部迁移（数量核对 = 63，不含草稿）
- [ ] 抽查旧 URL 重定向生效
- [ ] sitemap.xml、atom.xml 可访问
- [ ] 4 篇 katex 文章公式渲染正常；4 篇 TOC 文章目录正常
- [ ] GA / 百度统计代码加载
- [ ] robots.txt、验证文件可访问
- [ ] 404 页面；移动端布局正常
- [ ] GitHub Actions 构建部署成功，Pages 域名可访问
