import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkInlineSvg from './src/plugins/remarkInlineSvg.mjs';
import remarkListBlockMath from './src/plugins/remarkListBlockMath.mjs';

export default defineConfig({
  site: 'https://innerlattice.com',
  output: 'static',
  markdown: {
    shikiConfig: {
      theme: 'rose-pine-dawn',
    },
    remarkPlugins: [[remarkMath, { singleDollarTextMath: true }], remarkListBlockMath, remarkInlineSvg],
    rehypePlugins: [rehypeKatex],
  },
});
