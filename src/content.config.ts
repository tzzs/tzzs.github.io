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
	}),
});

const apps = defineCollection({
	// Load Markdown files in the `src/content/apps/` directory.
	loader: glob({ base: './src/content/apps', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		pubDate: z.coerce.date().optional(),
		order: z.number().optional(),
	}),
});

export const collections = { blog, apps };
