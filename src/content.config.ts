import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updated: z.coerce.date().optional(),
		tags: z.array(z.string()).default([]),
		categories: z.array(z.string()).default([]),
		cover: z.string().optional(),
		draft: z.boolean().default(false),
		// Positivus 主题扩展字段（可选，向后兼容）
		author: z.string().optional().default('TZZ'),
		authImage: z.string().optional(),
		image: z.string().optional(),
		summary: z.string().optional(),
		type: z.string().optional(),
	}),
});

const projects = defineCollection({
	// Load Markdown files in the `src/content/projects/` directory.
	loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date().optional(),
		order: z.number().optional(),
	}),
});

export const collections = { blog, projects };
