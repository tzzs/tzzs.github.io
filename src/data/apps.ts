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
  /** 应用图标路径（public 下相对路径，如 /images/apps/<slug>/icon.png） */
  icon?: string;
  /** 下载/官网链接（如 marketplace / openVsx / github） */
  links?: Record<string, string>;
}

/** 全部应用，顺序即列表页展示顺序 */
export const apps: App[] = [
  {
    slug: 'comment-doc-lens',
    name: 'Comment Doc Lens',
    description: '在 VS Code 引用处以内联提示展示定义注释与符号文档',
    status: 'released',
    platforms: ['VS Code'],
    icon: '/images/apps/comment-doc-lens/icon.png',
    links: {
      marketplace: 'https://marketplace.visualstudio.com/items?itemName=tanzz.comment-doc-lens',
      github: 'https://github.com/tzzs/comment-doc-lens',
    },
  },
  {
    slug: 'thrift-support',
    name: 'Thrift Support',
    description: 'Apache Thrift IDL 语言智能支持：语法高亮、格式化、诊断与代码导航',
    status: 'released',
    platforms: ['VS Code'],
    icon: '/images/apps/vsce-thrift-support/icon.png',
    links: {
      marketplace: 'https://marketplace.visualstudio.com/items?itemName=tanzz.thrift-support',
      openVsx: 'https://open-vsx.org/extension/tanzz/thrift-support',
      github: 'https://github.com/tzzs/vsce-thrift-support',
    },
  },
  {
    slug: 'peri-pilot',
    name: '外设助手（PeriPilot）',
    description: 'Windows 托盘应用：通过 2.4G 接收器读取鼠标/键盘电量，提供低电量与充满电提醒',
    status: 'released',
    platforms: ['Windows'],
    icon: '/images/apps/peri-pilot/icon.png',
    links: {
      github: 'https://github.com/tzzs/peri-pilot',
    },
  },
];
