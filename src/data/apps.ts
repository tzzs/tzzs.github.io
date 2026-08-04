/**
 * 应用数据（`src/data/apps.ts`）
 *
 * 应用列表页由本文件驱动，应用详情页由 `src/content/apps/<slug>/*.md` 提供内容。
 *
 * 新增应用 = 两步：
 *   1. 在下方 `apps` 数组中追加一条记录；
 *   2. 在 `src/content/apps/` 下创建与 `slug` 同名的目录，
 *      放入 index.md（产品介绍）/ changelog.md（更新日志）/ privacy.md（隐私政策）。
 * 页面会自动生成，无需额外注册。
 */

/** 应用开发状态 */
export type AppStatus = 'development' | 'beta' | 'released';

/** 应用元数据 */
export interface App {
  /** 唯一标识，同时用作路由 `/apps/<slug>` 与内容目录名 */
  slug: string;
  /** 应用名称 */
  name: string;
  /** 一句话简介 */
  description: string;
  /** 开发状态：development（开发中）/ beta（测试）/ released（已发布） */
  status: AppStatus;
  /** 支持平台 */
  platforms: string[];
  /** 下载/官网链接，暂未填写，后续补充（如 appStore / googlePlay / web） */
  links?: Record<string, string>;
}

/** 全部应用，顺序即列表页展示顺序 */
export const apps: App[] = [
  {
    slug: 'ai-diary',
    name: 'AI Diary',
    description: '轻量、跨平台、AI 原生的日记应用',
    status: 'development',
    platforms: ['iOS', 'Android', 'macOS', 'Windows'],
    // links: 待补充（App Store / Google Play 等下载链接）
  },
  {
    slug: 'lut-studio',
    name: 'LUT Studio',
    description: '面向视频创作者的 LUT 调色工具',
    status: 'development',
    platforms: ['macOS', 'Windows'],
    // links: 待补充（官网下载 / 产品页链接）
  },
  {
    slug: 'markdown-editor',
    name: 'Markdown Editor',
    description: '极简、专注的跨平台 Markdown 编辑器',
    status: 'development',
    platforms: ['Web', 'macOS', 'Windows'],
    // links: 待补充（在线版 / 安装包下载链接）
  },
];
