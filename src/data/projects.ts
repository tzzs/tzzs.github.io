/**
 * 项目数据（`src/data/projects.ts`）
 *
 * 项目列表页由本文件驱动，项目详情页由 `src/content/projects/<slug>/*.md` 提供内容。
 *
 * 新增项目 = 两步：
 *   1. 在下方 `projects` 数组中追加一条记录；
 *   2. 在 `src/content/projects/` 下创建与 `slug` 同名的目录，
 *      放入 index.md（项目介绍）/ changelog.md（更新日志）/ privacy.md（隐私政策）。
 * changelog / privacy 仅 `app`、`extension` 分类的详情页会生成对应子页导航，
 * `agent-tool`、`skill` 分类的开源项目更新日志与隐私说明以 GitHub 仓库为准，不在站内重复维护。
 * 页面会自动生成，无需额外注册。
 */

import type { ImageMetadata } from 'astro';
import thriftSupportIcon from '../assets/projects/vsce-thrift-support/icon.png';
import commentDocLensIcon from '../assets/projects/comment-doc-lens/icon.png';
import periPilotIcon from '../assets/projects/peri-pilot/icon.png';

/** 项目开发状态 */
export type ProjectStatus = 'development' | 'beta' | 'released';

/** 项目分类：应用（含桌面应用）/ VS Code 插件 / Agent 工具 / Skill */
export type ProjectCategory = 'app' | 'extension' | 'agent-tool' | 'skill';

/** 分类展示文案，中文分类用中文，Skill 沿用英文并按类目惯例复数 */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  app: '应用',
  extension: 'VS Code 插件',
  'agent-tool': 'Agent 工具',
  skill: 'Skills',
};

/** 列表页分组顺序、详情页分类文案的展示顺序 */
export const CATEGORY_ORDER: ProjectCategory[] = ['app', 'extension', 'agent-tool', 'skill'];

/** 项目元数据 */
export interface Project {
  /** 唯一标识，同时用作路由 `/projects/<slug>` 与内容目录名 */
  slug: string;
  /** 项目名称 */
  name: string;
  /** 一句话简介 */
  description: string;
  /** 开发状态：development（开发中）/ beta（测试）/ released（已发布） */
  status: ProjectStatus;
  /** 项目分类，决定列表页分组与是否生成 changelog/privacy 子页 */
  category: ProjectCategory;
  /** 运行平台/环境 */
  platforms: string[];
  /** 项目图标（Astro Image 元数据，经 Image 组件渲染以获得优化尺寸与格式） */
  icon?: ImageMetadata;
  /** 下载/安装/官网链接（如 marketplace / openVsx / npm / github），首个 entry 作为详情页主 CTA */
  links?: Record<string, string>;
}

/** 全部项目，同分类内的顺序即列表页展示顺序 */
export const projects: Project[] = [
  {
    slug: 'thrift-support',
    name: 'Thrift Support',
    description: 'Apache Thrift IDL 语言智能支持：语法高亮、格式化、诊断与代码导航',
    status: 'released',
    category: 'extension',
    platforms: ['VS Code'],
    icon: thriftSupportIcon,
    links: {
      marketplace: 'https://marketplace.visualstudio.com/items?itemName=tanzz.thrift-support',
      openVsx: 'https://open-vsx.org/extension/tanzz/thrift-support',
      github: 'https://github.com/tzzs/vsce-thrift-support',
    },
  },
  {
    slug: 'comment-doc-lens',
    name: 'Comment Doc Lens',
    description: '在 VS Code 引用处以内联提示展示定义注释与符号文档',
    status: 'released',
    category: 'extension',
    platforms: ['VS Code'],
    icon: commentDocLensIcon,
    links: {
      marketplace: 'https://marketplace.visualstudio.com/items?itemName=tanzz.comment-doc-lens',
      github: 'https://github.com/tzzs/comment-doc-lens',
    },
  },
  {
    slug: 'peri-pilot',
    name: '外设助手（PeriPilot）',
    description: 'Windows 托盘应用：通过 2.4G 接收器读取鼠标/键盘电量，提供低电量与充满电提醒',
    status: 'released',
    category: 'app',
    platforms: ['Windows'],
    icon: periPilotIcon,
    links: {
      github: 'https://github.com/tzzs/peri-pilot',
    },
  },
  {
    slug: 'agentx',
    name: 'AgentX',
    description: '本地 API 适配器，让 Claude Code / Codex 灵活切换 OpenCode、DeepSeek、OpenRouter 等多个 LLM 提供商',
    status: 'released',
    category: 'agent-tool',
    platforms: ['Node.js'],
    links: {
      npm: 'https://www.npmjs.com/package/@tanzz/agentx',
      github: 'https://github.com/tzzs/agentx',
    },
  },
  {
    slug: 'storops',
    name: 'StorOps',
    description: '帮助 AI 编码代理安全诊断、清理与迁移本地磁盘空间的 Claude Agent Skill / 跨平台 CLI',
    status: 'released',
    category: 'skill',
    platforms: ['Windows', 'macOS', 'Linux'],
    links: {
      github: 'https://github.com/tzzs/storops',
    },
  },
];
