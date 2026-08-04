#!/usr/bin/env node
/**
 * 迁移脚本：把 source/_posts 与 source/draft 下的 Hexo 文章迁移到 src/content/blog 集合。
 * - 解析 Hexo front matter（js-yaml，CORE_SCHEMA 避免时间戳自动转 Date 的时区偏移）
 * - 字段映射：title/date→pubDate/update(updated)→updated/categories→平铺(tags 同规则)/cover/description(正文提取)
 * - 正文一字不改
 * - 扫描 [TOC] 与 katex 特征，输出到 docs/
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC_DIRS = [
  { dir: join(ROOT, 'source', '_posts'), draft: false },
  { dir: join(ROOT, 'source', 'draft'), draft: true },
];
const OUT_DIR = join(ROOT, 'src', 'content', 'blog');
const DOCS_DIR = join(ROOT, 'docs');
const DESC_MAX = 150;

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DOCS_DIR, { recursive: true });

const stats = { migrated: 0, failed: [], skipped: [] };
const anomalies = [];
const tocFiles = [];
const katexFiles = [];

/* ---------- 工具函数 ---------- */

/** 规范化日期 -> YYYY-MM-DD */
function normDate(v) {
  if (v == null) return null;
  if (v instanceof Date) {
    const p = (n) => String(n).padStart(2, '0');
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  if (typeof v === 'string') {
    const m = v.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    return v.trim() ? v.trim() : null;
  }
  return null;
}

/** 展平嵌套列表：[- [父, 子]] -> ["父/子"]；字符串原样保留 */
function flattenList(v) {
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  const out = [];
  for (const item of arr) {
    if (Array.isArray(item)) out.push(flattenList(item).join('/'));
    else if (item != null && String(item).trim()) out.push(String(item).trim());
  }
  return out;
}

/** 去掉段落中的 markdown 标记 */
function stripMarkdown(text) {
  let s = text;
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ''); // 图片
  s = s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1'); // 链接 -> 文字
  s = s.replace(/<[^>]+>/g, ''); // HTML 标签
  s = s.replace(/`{1,3}/g, ''); // 行内代码
  s = s.replace(/^(#{1,6})\s*/, ''); // 标题 #
  s = s.replace(/^>\s?/, ''); // 引用
  s = s.replace(/\*\*|__|~~/g, ''); // 粗体/删除线
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** 从正文提取第一个非空段落作为 description */
function extractDescription(body) {
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^```/.test(line) || /^~~~/.test(line)) continue; // 代码围栏
    if (line === '[TOC]') continue;
    const para = [lines[i]];
    let j = i + 1;
    while (j < lines.length && lines[j].trim() !== '') {
      para.push(lines[j]);
      j++;
    }
    const desc = stripMarkdown(para.join('\n'));
    if (desc) return desc.slice(0, DESC_MAX);
  }
  return null;
}

/** 拆分 front matter 与正文 */
function splitFrontMatter(text) {
  text = text.replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== '---') return { fmText: null, body: text };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return { fmText: null, body: text };
  return { fmText: lines.slice(1, end).join('\n'), body: lines.slice(end + 1).join('\n') };
}

/** 检测 katex 特征：$$ 块、\(...\)、\[...\]、单个 $ 行内公式（$ 后紧跟非空白字符）。
 *  先剔除代码围栏与行内代码，避免 shell 提示符/环境变量误报。 */
function hasKatex(body) {
  let s = body
    .replace(/```[^]*?```/g, '')   // 代码围栏
    .replace(/`[^`\n]*`/g, '');    // 行内代码
  if (s.includes('$$')) return true;
  if (/\\\(|\\\)|\\\[|\\\]/.test(s)) return true;
  return /\$[^\s$][^$\n]*\$/.test(s);
}

/* ---------- 转换 ---------- */

function convertFile(filePath, isDraft) {
  const name = basename(filePath);
  const raw = readFileSync(filePath, 'utf8');
  const { fmText, body } = splitFrontMatter(raw);

  let fm = {};
  if (fmText) {
    try {
      fm = yaml.load(fmText, { schema: yaml.CORE_SCHEMA }) || {};
    } catch (e) {
      throw new Error(`front matter YAML 解析失败: ${e.message}`);
    }
  }

  // title：缺失时回退到文件名
  const title = typeof fm.title === 'string' && fm.title.trim() ? fm.title.trim() : name.replace(/\.md$/i, '');

  // pubDate：date -> YYYY-MM-DD；缺失回退文件 mtime
  let pubDate = normDate(fm.date);
  if (!pubDate) {
    pubDate = normDate(statSync(filePath).mtime);
    anomalies.push(`${name}: date 缺失或无效，回退到文件修改时间 ${pubDate}`);
  }

  // updated：兼容 update / updated 两种键名
  let updated = null;
  const updRaw = fm.update ?? fm.updated;
  if (updRaw != null) {
    updated = normDate(updRaw);
    if (!updated) anomalies.push(`${name}: update 值为空已省略`);
  }

  const tags = flattenList(fm.tags);
  const categories = flattenList(fm.categories);
  const cover = typeof fm.cover === 'string' && fm.cover.trim() ? fm.cover.trim() : null;
  const description = extractDescription(body);

  // 字段顺序：title/description/pubDate/updated/tags/categories/cover/draft
  const fmOut = { title };
  if (description) fmOut.description = description;
  fmOut.pubDate = pubDate;
  if (updated) fmOut.updated = updated;
  if (tags.length) fmOut.tags = tags;
  if (categories.length) fmOut.categories = categories;
  if (cover) fmOut.cover = cover;
  if (isDraft) fmOut.draft = true;

  const yml = yaml.dump(fmOut, { lineWidth: -1, noRefs: true, noCompatMode: true });
  const outContent = `---\n${yml}---\n${body}`;
  writeFileSync(join(OUT_DIR, name), outContent);

  // 扫描标记
  if (body.includes('[TOC]')) tocFiles.push(name);
  if (hasKatex(body)) katexFiles.push(name);

  return { name, description: !!description, updated: !!updated, tags: tags.length, categories: categories.length };
}

/* ---------- 主流程 ---------- */

for (const { dir, draft } of SRC_DIRS) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch (e) {
    stats.failed.push({ file: dir, reason: `目录不可读: ${e.message}` });
    continue;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (!st.isFile()) {
      stats.skipped.push(`${entry}（目录/非文件，跳过）`);
      continue;
    }
    if (!entry.toLowerCase().endsWith('.md')) {
      stats.skipped.push(`${entry}（非 .md 文件，跳过）`);
      continue;
    }
    try {
      const info = convertFile(full, draft);
      stats.migrated++;
      console.log(`[ok] ${entry}${info.description ? '  (desc)' : '  (无desc)'}${info.updated ? ' (updated)' : ''}`);
    } catch (e) {
      stats.failed.push({ file: entry, reason: e.message });
    }
  }
}

/* ---------- 输出 ---------- */

if (tocFiles.length) writeFileSync(join(DOCS_DIR, 'toc-posts.txt'), tocFiles.join('\n') + '\n');
else writeFileSync(join(DOCS_DIR, 'toc-posts.txt'), '');
if (katexFiles.length) writeFileSync(join(DOCS_DIR, 'katex-posts.txt'), katexFiles.join('\n') + '\n');
else writeFileSync(join(DOCS_DIR, 'katex-posts.txt'), '');

console.log('\n========== 迁移统计 ==========');
console.log(`迁移成功: ${stats.migrated}`);
console.log(`迁移失败: ${stats.failed.length}`);
for (const f of stats.failed) console.log(`  FAIL ${f.file}: ${f.reason}`);
console.log(`跳过: ${stats.skipped.length}`);
for (const s of stats.skipped) console.log(`  SKIP ${s}`);
console.log(`异常说明: ${anomalies.length}`);
for (const a of anomalies) console.log(`  NOTE ${a}`);
console.log('\n========== 标记扫描 ==========');
console.log(`[TOC] 文章 (${tocFiles.length}):`);
for (const t of tocFiles) console.log(`  ${t}`);
console.log(`katex 文章 (${katexFiles.length}):`);
for (const k of katexFiles) console.log(`  ${k}`);
