import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import astroConfig from '../astro.config.mjs';
import { getArticleDescription } from '../src/lib/descriptions.mjs';
import { readPostDates } from '../src/lib/postDates.mjs';

const siteUrl = new URL(astroConfig.site);
const siteDescription =
  'Long-form, first-principles essays on consciousness, AI agents, ontology, and the structure of organizations and software.';
const explicitDescription =
  'How the possibilities you can take seriously shape feeling stuck—and how experience, relationships, and reflection can expand that consideration space.';
const fallbackDescription =
  'A comprehensive nutrient ontology: a structured map of macronutrients, micronutrients, conditionally essential compounds, plant bioactives, microbiota-associated modulators, and water.';

async function readPage(path) {
  return readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
}

function getMetaContent(html, attribute, value) {
  const tag = html
    .match(/<meta\b[^>]*>/g)
    ?.find((candidate) => candidate.includes(`${attribute}="${value}"`));
  assert.ok(tag, `Expected a meta tag with ${attribute}="${value}"`);

  const content = tag.match(/\bcontent="([^"]*)"/)?.[1];
  assert.notEqual(content, undefined, `Expected ${attribute}="${value}" to have content`);
  return content;
}

test('description extraction skips non-text blocks and removes inline Markdown', () => {
  const body = `## Heading

![Decorative image](/image.png)

The **first** meaningful [paragraph](https://example.com)
continues here.`;

  assert.equal(
    getArticleDescription(undefined, body),
    'The first meaningful paragraph continues here.'
  );
});

test('non-article pages retain the site description and website Open Graph type', async () => {
  const html = await readPage('');

  assert.equal(getMetaContent(html, 'name', 'description'), siteDescription);
  assert.equal(getMetaContent(html, 'property', 'og:description'), siteDescription);
  assert.equal(getMetaContent(html, 'property', 'og:type'), 'website');
  assert.match(html, /<title>inner lattice \| essays on consciousness, AI, and systems<\/title>/);
});

test('an article front matter description wins over its first paragraph', async () => {
  const html = await readPage('consideration-space');

  assert.equal(getMetaContent(html, 'name', 'description'), explicitDescription);
  assert.equal(getMetaContent(html, 'property', 'og:description'), explicitDescription);
  assert.equal(getMetaContent(html, 'property', 'og:type'), 'article');
  assert.equal(
    getMetaContent(html, 'property', 'og:url'),
    new URL('/consideration-space', siteUrl).href
  );
});

test('an article without a description uses its first meaningful body paragraph', async () => {
  const html = await readPage('ontology-of-nutrients');

  assert.equal(getMetaContent(html, 'name', 'description'), fallbackDescription);
  assert.equal(getMetaContent(html, 'property', 'og:description'), fallbackDescription);
  assert.notEqual(getMetaContent(html, 'property', 'og:description'), siteDescription);
  assert.equal(getMetaContent(html, 'property', 'og:type'), 'article');
});

test('every published article has matching, article-specific description metadata', async () => {
  const posts = await readdir(new URL('../src/content/posts/', import.meta.url));

  for (const post of posts.filter((file) => file.endsWith('.md'))) {
    const slug = post.replace(/\.md$/, '');
    const html = await readPage(slug);
    const description = getMetaContent(html, 'property', 'og:description');

    assert.ok(description, `${slug} should have an Open Graph description`);
    assert.notEqual(description, siteDescription, `${slug} should not use the site description`);
    assert.equal(getMetaContent(html, 'name', 'description'), description);
    assert.equal(getMetaContent(html, 'property', 'og:type'), 'article');
  }
});

test('home, tag and article pages expose crawlable social images and large cards', async () => {
  for (const path of ['', 'tags/future', 'exocentric-latent-cartography']) {
    const html = await readPage(path);
    assert.equal(getMetaContent(html, 'property', 'og:image:width'), '1200');
    assert.equal(getMetaContent(html, 'property', 'og:image:height'), '630');
    assert.equal(getMetaContent(html, 'property', 'og:image:type'), 'image/jpeg');
    assert.equal(getMetaContent(html, 'name', 'twitter:card'), 'summary_large_image');
    assert.equal(getMetaContent(html, 'name', 'twitter:description'), getMetaContent(html, 'property', 'og:description'));
    assert.ok(getMetaContent(html, 'property', 'og:image:alt'));
    assert.ok(getMetaContent(html, 'name', 'twitter:image:alt'));
    for (const [attribute, name] of [['property', 'og:image'], ['name', 'twitter:image']]) {
      const url = new URL(getMetaContent(html, attribute, name));
      assert.equal(url.origin, siteUrl.origin);
      assert.equal(url.protocol, 'https:');
      const bytes = await readFile(new URL(`../dist${url.pathname}`, import.meta.url));
      assert.equal(bytes.subarray(0, 3).toString('hex'), 'ffd8ff', 'Image must be a real JPEG');
      assert.ok(bytes.length < 300_000, 'Keep preview downloads lightweight');
    }
  }
});

test('every article declares its slashless URL as canonical and appears in the sitemap with its date', async () => {
  const posts = await readdir(new URL('../src/content/posts/', import.meta.url));
  const sitemap = await readFile(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
  const robots = await readFile(new URL('../dist/robots.txt', import.meta.url), 'utf8');

  assert.match(robots, new RegExp(`Sitemap: ${new URL('/sitemap-index.xml', siteUrl).href}`));

  for (const post of posts.filter((file) => file.endsWith('.md'))) {
    const slug = post.replace(/\.md$/, '');
    const html = await readPage(slug);
    const url = new URL(`/${slug}`, siteUrl).href;

    assert.ok(html.includes(`<link rel="canonical" href="${url}">`), `${slug} should declare ${url} as canonical`);
    assert.equal(getMetaContent(html, 'property', 'og:url'), url);
    assert.ok(getMetaContent(html, 'property', 'article:published_time'));
    assert.match(sitemap, new RegExp(`<loc>${url}</loc><lastmod>[^<]+</lastmod>`), `${slug} should be in the sitemap with a lastmod`);
  }
});

test('internal links point at canonical slashless URLs', async () => {
  for (const path of ['', 'tags/ontology', 'universal-runtime-for-interactive-software']) {
    const html = await readPage(path);
    const links = [...html.matchAll(/<a\b[^>]*\bhref="(\/[^"#]*)/g)].map((match) => match[1]);

    for (const link of links) {
      assert.ok(link === '/' || !link.endsWith('/'), `${path || 'home'} links to ${link} with a trailing slash`);
    }
  }
});

async function postsDirWith(frontmatter) {
  const dir = await mkdtemp(join(tmpdir(), 'posts-'));
  await writeFile(join(dir, 'post.md'), `---\ntitle: "Post"\n${frontmatter}\n---\n\nBody.\n`);
  return pathToFileURL(`${dir}/`);
}

test('post dates must be full timestamps, and updated cannot precede date', async () => {
  await assert.rejects(async () => readPostDates(await postsDirWith('')), /`date` is required/);
  await assert.rejects(async () => readPostDates(await postsDirWith('date: 2026-01-16')), /full timestamp/);
  await assert.rejects(
    async () => readPostDates(await postsDirWith('date: 2026-01-16T12:00:00-05:00\nupdated: 2026-01-15T12:00:00-05:00')),
    /earlier than/
  );

  const dates = readPostDates(await postsDirWith('date: 2026-01-16T12:00:00-05:00\nupdated: "2026-02-01T09:00:00-05:00"'));
  assert.equal(dates.get('post').published.toISOString(), '2026-01-16T17:00:00.000Z');
  assert.equal(dates.get('post').updated.toISOString(), '2026-02-01T14:00:00.000Z');
});

test('the updated time feeds page metadata but is never displayed', async (t) => {
  const dates = readPostDates(new URL('../src/content/posts/', import.meta.url));
  const revised = [...dates].find(([, value]) => value.updated);
  if (!revised) return t.skip('no post sets `updated` yet');

  const [slug, { updated }] = revised;

  const html = await readPage(slug);
  assert.equal(getMetaContent(html, 'property', 'article:modified_time'), updated.toISOString());
  assert.ok(html.includes(`"dateModified":"${updated.toISOString()}"`));
  assert.equal(html.match(/<time\b/g).length, 1, 'Only the publish date is shown');
});

test('tag pages describe their own essays', async () => {
  const html = await readPage('tags/future');
  const description = getMetaContent(html, 'name', 'description');

  assert.match(description, /^\d+ essays? tagged “future” on inner lattice: /);
  assert.equal(getMetaContent(html, 'property', 'og:description'), description);
});

test('listing text keeps words apart when markup is stripped', async () => {
  for (const path of ['', 'tags/ontology', 'turn-inward']) {
    const html = await readPage(path);
    assert.doesNotMatch(html, /<\/a><a class="tag"/, `${path || 'home'} runs tag links together`);
    assert.doesNotMatch(html, /<\/time><span class="tags">/, `${path || 'home'} runs the date into the tags`);
    assert.doesNotMatch(html, /class="post-title">[^<]*<\/a><span/, `${path || 'home'} runs the title into the date`);
  }
});

test('every page advertises the RSS feed, which lists every essay at its canonical URL', async () => {
  const feedUrl = new URL('/rss.xml', siteUrl).href;
  for (const path of ['', 'tags/future', 'turn-inward']) {
    const html = await readPage(path);
    assert.ok(
      html.includes(`<link rel="alternate" type="application/rss+xml" title="inner lattice" href="${feedUrl}">`),
      `${path || 'home'} should link to the feed`
    );
  }

  const feed = await readFile(new URL('../dist/rss.xml', import.meta.url), 'utf8');
  const posts = (await readdir(new URL('../src/content/posts/', import.meta.url))).filter((file) => file.endsWith('.md'));
  assert.equal(feed.match(/<item>/g).length, posts.length);
  for (const post of posts) {
    const url = new URL(`/${post.replace(/\.md$/, '')}`, siteUrl).href;
    assert.ok(feed.includes(`<link>${url}</link>`), `${url} should be in the feed`);
  }
});

test('feed items carry the full essay, with diagrams and section icons turned into plain links', async () => {
  const feed = await readFile(new URL('../dist/rss.xml', import.meta.url), 'utf8');
  const items = feed.match(/<item>[\s\S]*?<\/item>/g);

  for (const item of items) assert.match(item, /<content:encoded>/);
  assert.doesNotMatch(feed, /&lt;svg|<svg/, 'readers drop inline SVG, so the feed links to it instead');
  assert.doesNotMatch(feed, /Copy link to/);
  assert.doesNotMatch(feed, /(&lt;|<)[a-z][^>]*\b(class|style)=/);
  assert.match(feed, /View it in the essay\./);
});

test('long essays get a table of contents and every section heading links to itself', async () => {
  const long = await readPage('universal-theory-of-interactive-software');
  const short = await readPage('welcome');

  assert.match(long, /<nav class="toc"/);
  assert.doesNotMatch(short, /<nav class="toc"/);

  for (const [, id] of long.matchAll(/<h[23] id="([^"]+)"/g)) {
    assert.ok(long.includes(`<a class="heading-link" href="#${id}"`), `heading ${id} should link to itself`);
    assert.ok(
      [2, 3].some((depth) => long.includes(`<li class="toc-item toc-depth-${depth}"><a href="#${id}">`)),
      `heading ${id} should be in the table of contents`
    );
  }
});

test('a series post names its part and links its neighbours; planned parts show as forthcoming', async () => {
  const html = await readPage('universal-languages-for-interactive-software');
  const series = await readPage('series/universal-interactive-software');

  assert.match(html, /<p class="post-series">/);
  assert.match(html, /aria-current="page"[^>]*>Toward a universal set of languages/);
  assert.match(html, /class="series-next" href="\/universal-runtime-for-interactive-software"/);
  assert.match(series, /forthcoming/);
});

test('the not-found page uses the site layout', async () => {
  const html = await readFile(new URL('../dist/404.html', import.meta.url), 'utf8');
  assert.match(html, /<title>not found \| inner lattice<\/title>/);
  assert.match(html, /href="\/"/);
});
