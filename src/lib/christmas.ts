// 圣诞彩蛋共享常量与纯逻辑：Navbar.astro（触发入口）与 ChristmasEasterEgg.astro（覆盖层）共用

/** 打开彩蛋覆盖层的全局自定义事件名，任意触发源 dispatch 此事件即可 */
export const CHRISTMAS_OPEN_EVENT = 'christmas:open';

/** sessionStorage key：标记本次会话彩蛋是否已展示过（手动/自动触发都会置位，每会话只自动弹出一次） */
export const CHRISTMAS_SESSION_KEY = 'christmas-shown';

/** 手动触发：连续点击 Logo 达到该次数即视为彩蛋触发 */
export const CHRISTMAS_CLICK_THRESHOLD = 3;

/** 手动触发：点击计数的滚动时间窗口（毫秒） */
export const CHRISTMAS_CLICK_WINDOW_MS = 1500;

/** 手动触发：未达到点击阈值时，延迟多久后当作普通单击真正跳转首页 */
export const CHRISTMAS_NAV_DEBOUNCE_MS = 400;

/** 自动触发：页面 load 后延迟多久再判断是否自动弹出（避免抢占首屏渲染） */
export const CHRISTMAS_AUTO_OPEN_DELAY_MS = 1200;

/** 自动触发的季节窗口：按访客本地时间判断是否落在 12 月 11 日 - 次年 1 月 7 日之间 */
export function isWithinChristmasWindow(date: Date): boolean {
	const month = date.getMonth(); // 0-11，11 = 12 月，0 = 1 月
	const day = date.getDate();
	if (month === 11) return day >= 11;
	if (month === 0) return day <= 7;
	return false;
}
