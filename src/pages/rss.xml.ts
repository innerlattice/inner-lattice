import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { getArticleDescription } from '../lib/descriptions.mjs';
import { feedContent } from '../lib/feedContent.mjs';
import { siteDescription, siteTitle } from '../lib/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  return rss({
    title: siteTitle,
    description: siteDescription,
    site: context.site!,
    trailingSlash: false,
    items: posts.map((post) => {
      const url = new URL(`/${post.id}`, context.site).href;
      return {
        title: post.data.title,
        link: url,
        pubDate: post.data.date,
        description: getArticleDescription(post.data.description, post.body),
        // Full text, with diagrams turned into links back to the essay.
        content: feedContent(post.rendered?.html ?? '', url),
        categories: post.data.tags,
      };
    }),
    customData: '<language>en</language>',
  });
}
