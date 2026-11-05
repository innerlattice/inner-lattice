import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeHeadingLinks from './src/plugins/rehypeHeadingLinks.mjs';
import remarkInlineSvg from './src/plugins/remarkInlineSvg.mjs';
import remarkListBlockMath from './src/plugins/remarkListBlockMath.mjs';
import { readPostDates } from './src/lib/postDates.mjs';

// Reading the dates here also fails the build on a post without a full timestamp.
const postDates = readPostDates(new URL('./src/content/posts/', import.meta.url));

export default defineConfig({
  site: 'https://innerlattice.com',
  output: 'static',
  trailingSlash: 'never',
  integrations: [
    sitemap({
      serialize(item) {
        const dates = postDates.get(new URL(item.url).pathname.slice(1));
        if (dates) item.lastmod = (dates.updated ?? dates.published).toISOString();
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      // Both themes ship as CSS variables; global.css picks one per colour scheme.
      themes: { light: 'rose-pine-dawn', dark: 'rose-pine-moon' },
      defaultColor: false,
    },
    remarkPlugins: [[remarkMath, { singleDollarTextMath: true }], remarkListBlockMath, remarkInlineSvg],
    // Heading ids must exist before the heading links can point at them.
    rehypePlugins: [rehypeKatex, rehypeHeadingIds, rehypeHeadingLinks],
  },
});
