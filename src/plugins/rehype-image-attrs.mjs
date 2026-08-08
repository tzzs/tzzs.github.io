/**
 * 正文图片属性增强（rehype 插件）
 *
 * markdown 正文里直接引用的站内图片（如 `/images/...`）不走 astro:assets 的
 * `<Image>` 组件，输出为裸 `<img>`：
 *   1. 没有 loading/decoding —— Lighthouse 报 "Unoptimized loading attribute"；
 *   2. 没有 width/height —— 图片加载撑开会造成 CLS。
 *
 * 本插件为所有渲染出的 `<img>` 补上 `loading="lazy"` + `decoding="async"`，
 * 并读取 public 下源图片的宽高写入 width/height（首屏外的正文图均在折叠区，
 * 统一 lazy；站外 URL / 缺失文件静默跳过）。
 */
import sharp from 'sharp';
import path from 'node:path';

/** 递归收集树中所有 img 节点 */
function collectImgs(node, out = []) {
  if (node.type === 'element' && node.tagName === 'img') out.push(node);
  if (node.children) for (const child of node.children) collectImgs(child, out);
  return out;
}

/** 读取 public 下图片的真实宽高（构建时 cwd 为项目根，与重定向插件同一约定） */
async function attachSize(node, src) {
  try {
    const meta = await sharp(path.join(process.cwd(), 'public', src)).metadata();
    if (meta.width && meta.height) {
      node.properties.width = meta.width;
      node.properties.height = meta.height;
    }
  } catch {
    // 图片缺失或格式不支持：跳过宽高，仅保留 lazy/decoding
  }
}

export default function rehypeImageAttrs() {
  return async (tree) => {
    const jobs = [];
    for (const node of collectImgs(tree)) {
      node.properties.loading = 'lazy';
      node.properties.decoding = 'async';
      const src = node.properties.src;
      if (typeof src === 'string' && src.startsWith('/')) {
        jobs.push(attachSize(node, src));
      }
    }
    await Promise.all(jobs);
  };
}
