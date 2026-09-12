// 博客分页共享逻辑：blog/index.astro（第 1 页）与 blog/page/[...page].astro（第 2+ 页），
// 中英文两个语言的版本都共用这里的逻辑，避免分页数学在多个文件里各写一份、容易失同步
import { getCollection, type CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';
import type { Locale } from '../i18n/strings';

export const PAGE_SIZE = 10;

/** 全部非草稿文章，按 pubDate 降序 */
export async function getBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 第 n 页在指定语言下的 URL：第 1 页即 /blog/（或 /en/blog/），其余为 /blog/page/{n}/ */
export function pageUrl(n: number, locale: Locale): string {
	return n === 1
		? getRelativeLocaleUrl(locale, 'blog')
		: getRelativeLocaleUrl(locale, `blog/page/${n}`);
}

/** 构造与 Astro paginate() 兼容的单页数据（Page 结构） */
export function buildPageData(posts: CollectionEntry<'blog'>[], pageNum: number, locale: Locale) {
	const lastPage = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
	const start = (pageNum - 1) * PAGE_SIZE;
	const end = Math.min(start + PAGE_SIZE, posts.length);
	return {
		data: posts.slice(start, end),
		start,
		end: end - 1,
		size: PAGE_SIZE,
		total: posts.length,
		currentPage: pageNum,
		lastPage,
		url: {
			current: pageUrl(pageNum, locale),
			prev: pageNum > 1 ? pageUrl(pageNum - 1, locale) : undefined,
			next: pageNum < lastPage ? pageUrl(pageNum + 1, locale) : undefined,
			first: pageNum === 1 ? undefined : pageUrl(1, locale),
			last: pageNum === lastPage ? undefined : pageUrl(lastPage, locale),
		},
	};
}

/** blog/page/[...page].astro 中英文两个文件共用的 getStaticPaths：生成第 2..N 页的参数 */
export async function getBlogPageStaticPaths(locale: Locale) {
	const posts = await getBlogPosts();
	const lastPage = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
	return Array.from({ length: lastPage - 1 }, (_, i) => ({
		params: { page: String(i + 2) },
		props: { page: buildPageData(posts, i + 2, locale) },
	}));
}
