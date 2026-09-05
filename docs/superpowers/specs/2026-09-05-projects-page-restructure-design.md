# 「应用」tab 重构为「项目」tab 设计稿

> 状态：**已确认，待实施** | 创建日期：2026-09-05 | 分支：`claude/refactor-app-tab-dev-page-34f101`

## 1. 背景与目标

当前站点导航「应用」下只装 VS Code 插件（Thrift Support、Comment Doc Lens）和一个 Windows 桌面应用（PeriPilot），数据模型（`src/data/apps.ts` + `src/content/apps/`）和路由（`/apps/**`）都以"应用"为中心命名。

现在要把两个新项目纳入站点：

- **agentx**（<https://github.com/tzzs/agentx>）：TypeScript/Node CLI，本地 API 适配器，让 Claude Code / Codex 切换 OpenCode、DeepSeek、OpenRouter 等 LLM 提供商，已发布 npm 包 `@tanzz/agentx`（registry 已验证存在，最新版本 3.2.0）。
- **storops**（<https://github.com/tzzs/storops>）：Python，Claude Agent Skill + 跨平台 CLI，帮 AI 编码代理安全诊断/清理/迁移本地磁盘空间。

这两个都不是传统意义的"应用"，继续塞进「应用」tab 会让分类名不副实。因此本次调整目标：

1. 将「应用」重命名为更通用的「项目」，覆盖应用 / VS Code 插件 / Agent 工具 / Skills 四类。
2. 新增 agentx、storops 两条项目记录及详情页内容。
3. 调整首页、关于页、404 页中对旧「应用」概念的引用。
4. 保留旧 `/apps/*` URL 的可访问性（重定向），不产生死链。

## 2. 关键决策摘要

| 决策项 | 结论 |
|---|---|
| 导航文案 | 「应用」→「项目」 |
| 路由前缀 | `/apps/` → `/projects/`，旧路径重定向 |
| 分类体系 | 四分类：`app`（应用）/ `extension`（VS Code 插件）/ `agent-tool`（Agent 工具）/ `skill`（Skills） |
| 列表页呈现 | 按分类分组，每组独立小标题 + 网格，非空分类才渲染 |
| agentx / storops 子页 | 不生成「更新日志」「隐私政策」路由，详情页突出 GitHub / npm 链接 |
| agentx status | `released` |
| storops status | `released` |

## 3. 数据模型

`src/data/apps.ts` 整体迁移为 `src/data/projects.ts`：

```ts
export type ProjectStatus = 'development' | 'beta' | 'released';
export type ProjectCategory = 'app' | 'extension' | 'agent-tool' | 'skill';

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  app: '应用',
  extension: 'VS Code 插件',
  'agent-tool': 'Agent 工具',
  skill: 'Skills',
};

/** 列表页分组顺序、详情页展示顺序 */
export const CATEGORY_ORDER: ProjectCategory[] = ['app', 'extension', 'agent-tool', 'skill'];

export interface Project {
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  /** 新增：项目分类，驱动列表页分组与卡片分类标签 */
  category: ProjectCategory;
  /** 运行平台/环境，语义不变（原「支持平台」） */
  platforms: string[];
  icon?: ImageMetadata;
  links?: Record<string, string>;
}

export const projects: Project[] = [ /* 见下表 */ ];
```

五条记录：

| slug | name | category | status | platforms | links | 备注 |
|---|---|---|---|---|---|---|
| `thrift-support` | Thrift Support | `extension` | `released` | `['VS Code']` | marketplace / openVsx / github（不变） | 现有数据原样迁移 |
| `comment-doc-lens` | Comment Doc Lens | `extension` | `released` | `['VS Code']` | marketplace / github（不变） | 现有数据原样迁移 |
| `peri-pilot` | 外设助手（PeriPilot） | `app` | `released` | `['Windows']` | github（不变） | 现有数据原样迁移 |
| `agentx` | AgentX | `agent-tool` | `released` | `['Node.js']` | `{ npm: 'https://www.npmjs.com/package/@tanzz/agentx', github: 'https://github.com/tzzs/agentx' }` | 新增。npm 排第一作为主 CTA，GitHub 为次 CTA |
| `storops` | StorOps | `skill` | `released` | `['Windows', 'macOS', 'Linux']` | `{ github: 'https://github.com/tzzs/storops' }` | 新增。仅 GitHub 链接，自动作为唯一/主 CTA |

`description` 文案（一句话简介，中文）：

- agentx：`本地 API 适配器，让 Claude Code / Codex 灵活切换 OpenCode、DeepSeek、OpenRouter 等多个 LLM 提供商`
- storops：`帮助 AI 编码代理安全诊断、清理与迁移本地磁盘空间的 Claude Agent Skill / 跨平台 CLI`

`icon` 字段两者均省略（无品牌图标资源），复用现有「无 icon 时不渲染图标」的降级逻辑，不新增占位图标。

`src/assets/apps/` → `src/assets/projects/`（内部资源路径同步改名，构建期哈希，不影响任何外部 URL）。

## 4. 内容层（Content Collection）

`src/content.config.ts`：collection key `apps` → `projects`，schema 不变（`title` / `pubDate?` / `order?`；`order` 字段目前全仓库未被任何页面读取，是历史遗留的未消费字段，本次不清理、按现有约定继续填充，避免无关改动）。

`src/content/apps/` → `src/content/projects/`：

```
src/content/projects/
├── thrift-support/{index,changelog,privacy}.md   # 原样迁移
├── comment-doc-lens/{index,changelog,privacy}.md  # 原样迁移
├── peri-pilot/{index,privacy}.md                  # 原样迁移（本来就没有 changelog.md）
├── agentx/index.md                                # 新增，无 changelog/privacy
└── storops/index.md                               # 新增，无 changelog/privacy
```

`agentx/index.md`、`storops/index.md` 内容风格对齐现有 `peri-pilot/index.md`（H1 与项目名一致 + 简介段 + 分节功能列表），依据各自 GitHub README 用中文撰写，frontmatter 沿用 `title` + `pubDate`（用今天日期）+ `order: 1`。

## 5. 路由与重定向

`src/pages/apps/**` 整体迁移为 `src/pages/projects/**`：

```
src/pages/projects/
├── index.astro              # 列表页，按分类分组
└── [slug]/
    ├── index.astro           # 详情页
    ├── changelog.astro        # getStaticPaths 仅生成 category ∈ {app, extension} 的 slug
    └── privacy.astro          # 同上
```

旧 `/apps/*` 不手写重定向页，改用 Astro 原生 `redirects` 配置（静态构建下自动生成与现有 Hexo 重定向页同款的 meta-refresh 页面，支持动态路由参数）：

```js
// astro.config.mjs
redirects: {
  '/apps': '/projects',
  '/apps/[slug]': '/projects/[slug]',
  '/apps/[slug]/changelog': '/projects/[slug]/changelog',
  '/apps/[slug]/privacy': '/projects/[slug]/privacy',
}
```

覆盖全部历史 URL：`/apps/`、`/apps/{thrift-support,comment-doc-lens,peri-pilot}/`、以及三者的 `/changelog/`、`/privacy/`（`peri-pilot/changelog/` 当前虽无 `changelog.md` 但路由本身存在，重定向后落到新地址的同款占位页，行为不变）。

`getStaticPaths` 泛化重定向不校验 slug 是否真实存在——访问不存在的旧 slug 会被重定向到 `/projects/<slug>/` 再 404，等价于现状（直接 404），不算回归。

## 6. 页面改动

### 导航 / 页脚

`Navbar.astro`、`Footer.astro` 的 `navItems`/`navLinks`：`{ href: '/apps/', label: '应用' }` → `{ href: '/projects/', label: '项目' }`。

### 列表页 `/projects/index.astro`

按 `CATEGORY_ORDER` 遍历，每个非空分类渲染一个 `<section>`：`<h2>{CATEGORY_LABELS[category]}</h2>` + 该分类下项目的网格。网格列数沿用现有「优先选能整除项目数的列数」逻辑，按分类分别计算（不再对全量项目统一算列数）。`PageHeader` 沿用现有组件，`title="项目"` `badge="Projects"`。

### 详情页 `[slug]/index.astro`

- Hero 区状态徽章后追加一行纯文本：`{CATEGORY_LABELS[category]} · {platforms.join(' / ')}`（不引入新徽章样式，复用现有 `text-faint` 文本样式）。
- 「产品介绍与功能」标题改为「项目介绍」（四个分类通用，不再局限于"产品"表述）。
- 「下载」标题改为「获取方式」（覆盖 npm/GitHub 场景，不再局限于"下载"语义）；下方链接渲染逻辑不变。
- 「子页导航」区块（更新日志/隐私政策卡片）仅当 `category === 'app' || category === 'extension'` 时渲染。
- 主/次 CTA 逻辑不变（`links` 第一个 entry 为主 CTA，`github` 若不是主 CTA 则追加为次 CTA）——agentx 因 `npm` 排首位，主 CTA 是 npm、次 CTA 是 GitHub；storops 只有 `github`，直接作为唯一主 CTA，天然满足"突出 GitHub 链接"。

### 子页 `changelog.astro` / `privacy.astro`

`getStaticPaths` 从 `projects.filter(p => p.category === 'app' || p.category === 'extension')` 生成，其余逻辑不变。

### `ProjectCard`（原 `AppCard.astro`，同目录改名）

新增可选 prop `showCategory?: boolean`（默认 `false`）。为 `true` 时在平台标签行**首位**插入 `CATEGORY_LABELS[category]`，复用现有 `.tag-pill` 样式（不新增配色变体）。

调用方：

- `/projects/` 列表页：不传（分类已由分组标题体现）。
- 首页、关于页：传 `showCategory`（平铺网格里没有分组标题，需要标签区分类型）。

### 首页 `index.astro`

- import 从 `../data/apps` 改为 `../data/projects`，变量 `apps` → `projects`。
- 「应用区」标题「正在发布的应用」→「正在进行的项目」；描述文案更新为提及四种类型（如"目前维护 5 个项目，覆盖 VS Code 插件、桌面工具、Agent 工具与 Skills"，数量从 `projects.length` 取，类型描述手写，因为分类种类变化频率低）。
- 关于区统计 `dt`「已发布应用」→「项目」，`dd` 计数 `apps.length` → `projects.length`。
- CTA「查看应用」→「查看项目」，`href="/apps/"` → `href="/projects/"`；Hero CTA 同步。
- 网格保持平铺（不分组），`ProjectCard` 传 `showCategory`。

### 关于页 `about.astro`

「正在开发的应用」小节标题 → 「我的项目」；正文提到的「应用列表页」链接文案/href 同步为「项目列表页」/`/projects/`；网格保持平铺，`ProjectCard` 传 `showCategory`。

### 404 页

按钮「浏览应用」→「浏览项目」，`href="/apps/"` → `href="/projects/"`。

### `PageHeader.astro`

仅顶部注释提到 `/apps/`，同步改为 `/projects/`，组件本身无 apps 相关逻辑，不用改代码。

## 7. 文档同步

`CLAUDE.md` 「应用模块」章节改写为「项目模块」，内容更新为：

- 四分类体系（`ProjectCategory`）及各自含义。
- 新路径：`src/data/projects.ts`、`src/content/projects/<slug>/`、`/projects/<slug>[/changelog|/privacy]`。
- changelog/privacy 子页仅 `app`/`extension` 分类生成的规则。
- `/apps/*` → `/projects/*` 的 `astro.config.mjs` `redirects` 重定向机制（与旧站 Hexo URL 重定向机制的关系：两者并存，来源不同——一个是框架原生配置，一个是数据驱动的手写 catch-all）。

`MIGRATION_PLAN.md` 是已完成迁移的历史存档（文档开头标注状态"已完成"），不做修改。

## 8. 范围之外（本次不做）

- 不引入分类筛选/切换 UI（客户端 JS 过滤），当前 5 个项目用静态分组小节足够，未来数量明显增长再考虑。
- 不为 agentx/storops 制作品牌图标。
- 不改动 `platforms` 字段既有语义或渲染方式（详情页纯文本、卡片 tag-pill）。
- 不清理 content collection schema 里未使用的 `order` 字段。
- 不追溯性地给 thrift-support/comment-doc-lens/peri-pilot 补充或修改描述文案、图标、链接（除 slug 相关路径外，数据原样迁移）。

## 9. 验证清单

- [ ] `npx astro check` 通过（类型检查，`Project`/`ProjectCategory` 等类型正确）
- [ ] `npm run build` 成功
- [ ] `npm run dev` 本地核对：
  - [ ] `/projects/` 四个分类分组正确展示，非空分类才出现
  - [ ] `/projects/agentx/`、`/projects/storops/` 详情页正常渲染，无「子页导航」区块，主 CTA 分别指向 npm / GitHub
  - [ ] `/projects/thrift-support/changelog/`、`/privacy/` 等原有子页仍正常
  - [ ] 旧 `/apps/`、`/apps/peri-pilot/`、`/apps/thrift-support/changelog/` 等路径能重定向到对应新地址
  - [ ] 首页「项目」区块数量/文案更新，卡片带分类标签
  - [ ] 关于页「我的项目」小节更新
  - [ ] 404 页按钮更新
  - [ ] 导航栏、页脚「项目」高亮逻辑正常（`isActive` 判断基于新 `/projects/` 前缀）
- [ ] `CLAUDE.md` 「项目模块」章节内容与实际结构一致
