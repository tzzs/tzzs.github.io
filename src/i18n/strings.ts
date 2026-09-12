/**
 * 界面级中英文切换 —— 英文译文字典（构建期查表，配合 Astro 原生 i18n 路由使用）
 *
 * 中文文案就是各组件/页面调用处已经写好的字面文本，这里只维护英文译文。
 * key 命名按「区域.用途」分组，非强制规范，纯为方便查找。
 * 使用方式见下方 `t()`：中文页面直接传入原文，英文页面传入原文 + key，
 * 查不到对应 key 时原样回退为中文——效果等同未翻译，不会报错。
 *
 * 双语范围仅覆盖外壳页 + 项目详情页（首页/关于/联系/项目列表&详情/博客列表&分页/全部标签/时间轴），
 * 博客正文、更新日志、隐私政策、标签页/分类页的动态标题（内容本身是不翻译的中文长文或用户自定义词条）
 * 不在范围内，对应页面没有 `src/pages/en/` 版本，也不接入这里的翻译逻辑。
 */

export type Locale = 'zh' | 'en';
export const DEFAULT_LOCALE: Locale = 'zh';

/** 把 Astro.currentLocale（string | undefined）收窄成站内实际使用的 Locale 联合类型 */
export function resolveLocale(currentLocale: string | undefined): Locale {
	return currentLocale === 'en' ? 'en' : DEFAULT_LOCALE;
}

/**
 * 构建期翻译查表：中文直接返回调用处传入的原文；英文查字典，查不到就退回原文
 *（等价于旧客户端方案里「找不到 key 就保留中文」的行为）。
 */
export function t(locale: Locale, key: string, zhText: string): string {
	return locale === DEFAULT_LOCALE ? zhText : (STRINGS[key] ?? zhText);
}

export const STRINGS: Record<string, string> = {
	// 导航栏 / 页脚（共用同一套 key）
	'nav.home': 'Home',
	'nav.projects': 'Projects',
	'nav.blog': 'Blog',
	'nav.about': 'About',
	'nav.contact': 'Contact',
	'nav.themeToggle': 'Switch theme',
	'nav.menuToggle': 'Toggle navigation menu',
	'footer.rights': 'All rights reserved',

	// 分页组件（Pagination.astro，博客列表 /blog/、/blog/page/N/ 共用）
	'pagination.prev': 'Previous',
	'pagination.next': 'Next',
	'pagination.nav': 'Pagination',
	'pagination.jumpLabel': 'Go to page',
	'pagination.jumpSubmit': 'Go',
	'pagination.jumpAriaLabel': 'Jump to page',

	// 博客列表页（PageHeader 大标题；与 nav.blog 分开维护，两处用途不同，只是英文译文恰好相同）
	'blog.title': 'Blog',
	'blog.descPrefix': "TZZ's technical blog —",
	'blog.descSuffix': 'posts, documenting debugging war stories and engineering practice.',

	// 博客「文章时间轴」横幅（/blog/ 页内醒目入口）
	'blog.timelineBannerTitle': 'Article Timeline',
	'blog.timelineBannerDesc': 'Browse all posts along a timeline',
	'blog.timelineBannerCta': 'View Timeline',

	// 时间轴页（/blog/timeline/）：大标题 + 描述 + 「返回博客」横幅
	// 注：页内的标签/分类筛选侧栏与月份分组不在双语范围内，是更大的独立任务
	'blog.timelineTitle': 'Timeline',
	'blog.timelineDescPrefix': 'A total of',
	'blog.timelineDescSuffix': 'posts, browse them along a timeline.',
	'blog.backBannerTitle': 'Back to Blog',
	'blog.backBannerDesc': 'Browse the full post list',
	'blog.backBannerCta': 'Go to Blog',

	// 全部标签页（/blog/tags/）：大标题 + 描述；标签本身是内容标签，不翻译
	'blog.tagsTitle': 'Tags',
	'blog.tagsDescPrefix': 'A total of',
	'blog.tagsDescSuffix': 'tags, sorted by post count.',
	'blog.tagsEmpty': 'No tags yet.',

	// 文章卡片（PostCard.astro，/blog/ 列表与首页最近文章共用组件）
	'postCard.readMore': 'Read more →',

	// 首页
	'home.heroTagline': "TZZ's independent developer homepage: app development and technical practice.",
	'home.independentDeveloper': 'Independent Developer',
	'home.ctaViewProjects': 'View Projects',
	'home.ctaReadBlog': 'Read Blog',
	'home.projectsHeading': 'Ongoing Projects',
	'home.projectsDescPrefix': 'Currently maintaining',
	'home.projectsDescSuffix':
		'projects, covering VS Code extensions, desktop tools, Agent tools and Skills, with more in development.',
	'home.emptyProjects': 'No projects yet, stay tuned.',
	'home.viewAllProjects': 'View all projects',
	'home.blogHeading': 'Recent Posts',
	'home.blogDesc': 'Notes from the road of programming: lessons learned, design and engineering practice.',
	'home.emptyBlog': 'No posts yet, stay tuned.',
	'home.viewAllPosts': 'View all posts',
	'home.aboutHeading': "Hi, I'm TZZ",
	'home.aboutDesc':
		'Independent developer focused on VS Code extensions and Windows desktop tools, also writing about engineering lessons on the blog.',
	'home.statBlogPosts': 'Blog Posts',
	'home.statProjects': 'Projects',
	'home.learnMore': 'Learn more →',

	// 关于页（标题类文案原本是「色块+纯文本」两段拼接，英文按同样结构拆成 Prefix/Suffix）
	// 中文相邻元素之间不需要空格，但英文单词之间需要——Astro 编译时会整行去掉纯换行的空白，
	// 元素之间又没有别的字符可以留住这个空格，所以空格要写进英文译文本身（前缀补尾空格/后缀补头空格）。
	'about.titlePrefix': 'About ',
	'about.titleSuffix': 'Me',
	'about.introPrefix': "Hi, I'm",
	'about.introSuffix': ' — an independent developer who builds dev tools and writes technical posts.',
	'about.selfIntroPrefix': 'Self ',
	'about.selfIntroSuffix': 'Introduction',
	'about.selfIntroBodyPrefix':
		'A developer passionate about technology. The products I\'m building can be found below in "My Projects", or head over to the',
	'about.selfIntroBodySuffix': ' to see them.',
	'about.techStackPrefix': 'Tech ',
	'about.techStackSuffix': 'Stack',
	'about.myProjectsPrefix': 'My ',
	'about.myProjectsSuffix': 'Projects',
	'about.myProjectsBodyPrefix': "Here are the projects I'm working on — follow the ",
	'about.myProjectsBodySuffix': ' for the latest progress:',
	'about.projectsListLink': 'projects page',
	'about.openSourcePrefix': 'Open ',
	'about.openSourceSuffix': 'Source',
	'about.openSourceBody': 'My open-source projects are hosted on GitHub: ',
	'about.visitGithub': 'Visit GitHub Profile',

	// 联系页
	'contact.titlePrefix': 'Contact ',
	'contact.titleSuffix': 'Me',
	'contact.intro': 'Feel free to reach out with any questions, suggestions, or collaboration ideas.',
	'contact.issuesBodyPrefix': 'Found a bug on this site or in one of my projects, or have a feature request? Feel free to open an ',
	'contact.issuesLinkText': 'issue on the repo',
	'contact.issuesBodySuffix': " and I'll follow up as soon as I can.",
	'contact.openSourceTitle': 'Open Source Profile',
	'contact.openSourceBodyPrefix': 'My open-source projects and code repositories: ',
	'contact.noteTitle': 'Note',
	'contact.noteBody':
		'Replies usually take 1-3 business days; please describe reproduction steps and environment when reporting issues to help me look into it faster.',

	// 404 页
	'404.title': 'Page Not Found',
	'404.desc': "The page you're looking for may have been removed, renamed, or the URL may be incorrect.",
	'404.ctaHome': 'Back to Home',
	'404.ctaProjects': 'Browse Projects',

	// 项目分类 / 状态标签（与 src/data/projects.ts 的 CATEGORY_LABELS / statusLabels 一一对应）
	'category.app': 'App',
	'category.extension': 'VS Code Extension',
	'category.agent-tool': 'Agent Tool',
	'category.skill': 'Skill',
	'status.development': 'In Development',
	'status.beta': 'Beta',
	'status.released': 'Released',

	// 项目列表页
	'projectsPage.title': 'Projects',
	'projectsPage.description':
		'Projects I have built, spanning apps, VS Code extensions, Agent tools and Skills — feel free to use them or follow along.',

	// 项目名称 / 简介（按 src/data/projects.ts 的 slug 建 key；名称本身已是英文的项目不需要 name 条目，
	// 找不到 key 时脚本会原样保留中文，效果等同未翻译）
	'project.thrift-support.description':
		'Intelligent language support for Apache Thrift IDL: syntax highlighting, formatting, diagnostics and code navigation.',
	'project.comment-doc-lens.description':
		'Shows definition comments and symbol docs as inline hints at reference sites in VS Code.',
	'project.remote-pulse.description':
		'Quietly tracks a Remote-SSH host\'s CPU/memory/disk/network/GPU/Docker status right in the status bar.',
	'project.peri-pilot.name': 'PeriPilot',
	'project.peri-pilot.description':
		'Windows tray app that reads mouse/keyboard battery levels via a 2.4G receiver, with low-battery and fully-charged alerts.',
	'project.agentx.description':
		'A local API adapter that lets Claude Code / Codex switch flexibly between LLM providers such as OpenCode, DeepSeek and OpenRouter.',
	'project.storops.description':
		'A Claude Agent Skill / cross-platform CLI that helps AI coding agents safely diagnose, clean up and migrate local disk space.',

	// 项目详情页
	'project.introHeading': 'Project Overview',
	'project.introPlaceholder': 'The project overview is coming soon, stay tuned.',
	'project.linksHeading': 'How to Get It',
	'project.linksPlaceholder': 'Coming soon',
	'project.changelogTitle': 'Changelog',
	'project.changelogDesc': 'Release history and changes',
	'project.privacyTitle': 'Privacy Policy',
	'project.privacyDesc': 'Data collection and usage',

	// changelog / privacy 子页
	'changelog.lastUpdatedPrefix': 'Last updated: ',
	'changelog.emptyPlaceholder': 'Changelog not published yet, stay tuned.',
	'privacy.emptyPlaceholder': 'Privacy policy not published yet, stay tuned.',

	// 项目详情页「获取方式」链接标签（对应 [slug]/index.astro 的 linkLabels；已是英文的 key 如
	// appStore/googlePlay/openVsx 不需要条目，找不到 key 时脚本会原样保留，效果一样）
	'link.web': 'Web',
	'link.online': 'Online',
	'link.windows': 'Windows',
	'link.macos': 'macOS',
	'link.ios': 'iOS',
	'link.android': 'Android',
	'link.github': 'GitHub Repository',
	'link.npm': 'npm Package',
	'link.download': 'Download Installer',
	'link.official': 'Official Site',
	'link.marketplace': 'VS Code Marketplace',
};
