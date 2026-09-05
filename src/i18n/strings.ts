/**
 * 界面级中英文切换 —— 英文译文字典
 *
 * 中文文案就是各组件/页面里已经写好的字面文本，这里只维护英文译文。
 * key 命名按「区域.用途」分组，非强制规范，纯为方便查找。
 * 使用方式见 `src/components/Navbar.astro` 的 `applyLocale`：
 *   - `data-i18n-key="xxx"` 标记文本节点可翻译，客户端按当前 locale 替换 textContent
 *   - `data-i18n-attr="aria-label"` 表示这个 key 翻译的是属性值而不是文本
 * zh 模式下什么都不用做（保留元素原文），en 模式下查不到的 key 原样跳过，不报错。
 */

export type Locale = 'zh' | 'en';
export const DEFAULT_LOCALE: Locale = 'zh';
export const LOCALE_STORAGE_KEY = 'lang';

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
	'projectsPage.description':
		'Projects I have built, spanning apps, VS Code extensions, Agent tools and Skills — feel free to use them or follow along.',

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
