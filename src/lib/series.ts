import { getCollection, type CollectionEntry } from 'astro:content';

export interface SeriesPart {
  number: number;
  title: string;
  post?: CollectionEntry<'posts'>;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  parts: SeriesPart[];
}

let cache: Promise<Series[]> | undefined;

async function load(): Promise<Series[]> {
  const posts = new Map((await getCollection('posts')).map((post) => [post.id, post]));
  const entries = await getCollection('series');
  const seen = new Map<string, string>();

  return entries.map((entry) => ({
    id: entry.id,
    title: entry.data.title,
    description: entry.data.description,
    parts: entry.data.parts.map((part, index) => {
      if ('planned' in part) return { number: index + 1, title: part.planned };

      const post = posts.get(part.post);
      if (!post) throw new Error(`Series "${entry.id}" lists "${part.post}", which is not a post.`);
      const other = seen.get(part.post);
      if (other) throw new Error(`"${part.post}" is in two series: "${other}" and "${entry.id}".`);
      seen.set(part.post, entry.id);
      return { number: index + 1, title: post.data.title, post };
    }),
  }));
}

export function getAllSeries(): Promise<Series[]> {
  cache ??= load();
  return cache;
}

/** The series a post belongs to, with its own part and its published neighbours. */
export async function getSeriesForPost(postId: string) {
  for (const series of await getAllSeries()) {
    const index = series.parts.findIndex((part) => part.post?.id === postId);
    if (index === -1) continue;

    const published = series.parts.filter((part) => part.post);
    const position = published.findIndex((part) => part.post?.id === postId);
    return {
      series,
      part: series.parts[index],
      previous: published[position - 1],
      next: published[position + 1],
    };
  }
}
