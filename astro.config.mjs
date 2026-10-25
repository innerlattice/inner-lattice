import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkInlineSvg from './src/plugins/remarkInlineSvg.mjs';
import remarkListBlockMath from './src/plugins/remarkListBlockMath.mjs';

export default defineConfig({
  site: 'https://innerlattice.com',
  output: 'static',
  // Posts build to /slug/index.html, so the slash form is the canonical URL.
  trailingSlash: 'always',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'rose-pine-dawn',
    },
    remarkPlugins: [[remarkMath, { singleDollarTextMath: true }], remarkListBlockMath, remarkInlineSvg],
    rehypePlugins: [rehypeKatex],
  },
});
