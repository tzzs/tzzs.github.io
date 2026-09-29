// 站点全局元信息
// 可在任意页面/组件中通过 `import { SITE_TITLE } from '../consts'` 引用。
// 站名中英文页面共用同一个英文名（Navbar/Footer 的 Logo、og:site_name、JSON-LD、RSS 都取这里）。

export const SITE_TITLE = "TZZ'S STUDIO";
export const SITE_DESCRIPTION = 'TZZ 的独立开发者工作室：分享产品开发与技术实践，记录工程路上的踩坑与思考，欢迎查看项目与博客文章。';
export const SITE_AUTHOR = 'TZZ';
/** 站点根 URL（与 astro.config.mjs 的 site 保持一致） */
export const SITE_URL = 'https://tzzs.github.io';
/** 版权占位，后续可替换为真实署名 */
export const COPYRIGHT_HOLDER = 'TZZ';
/** GitHub 主页链接，Footer 与结构化数据（Person.sameAs）共用同一数据源 */
export const SITE_GITHUB = 'https://github.com/tzzs';
