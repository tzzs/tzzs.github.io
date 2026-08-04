// 博客分页共享逻辑：blog/index.astro（第 1 页）与 blog/page/[...page].astro（第 2+ 页）共用
import { getCollection, type CollectionEntry } from 'astro:content';

export const PAGE_SIZE = 10;

/** 全部非草稿文章，按 pubDate 降序 */
export async function getBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
	const posts = await getCollection('blog', ({ data }) => !data.draft);
	return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 第 n 页的 URL：第 1 页即 /blog/，其余为 /blog/page/{n}/ */
export function pageUrl(n: number): string {
	return n === 1 ? '/blog/' : `/blog/page/${n}/`;
}

/** 构造与 Astro paginate() 兼容的单页数据（Page 结构） */
export function buildPageData(posts: CollectionEntry<'blog'>[], pageNum: number) {
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
			current: pageUrl(pageNum),
			prev: pageNum > 1 ? pageUrl(pageNum - 1) : undefined,
			next: pageNum < lastPage ? pageUrl(pageNum + 1) : undefined,
			first: pageNum === 1 ? undefined : pageUrl(1),
			last: pageNum === lastPage ? undefined : pageUrl(lastPage),
		},
	};
}
