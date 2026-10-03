import { readFileSync } from 'node:fs';
import path from 'node:path';

// Inline a local SVG that stands alone in a paragraph, so the diagram can use
// the page fonts and the diagram styles in global.css:
//
//   ![Alt text](../../assets/diagrams/name.svg "Caption")
//
// Astro caches rendered Markdown by the Markdown file's digest. After editing
// only an SVG, touch the post or delete node_modules/.astro to see the change.

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function isLocalSvg(url) {
  return url.endsWith('.svg') && !URL.canParse(url) && !url.startsWith('/');
}

function soleImage(paragraph) {
  const children = paragraph.children.filter(
    (child) => !(child.type === 'text' && /^\s*$/.test(child.value)),
  );
  if (children.length !== 1 || children[0].type !== 'image') return null;
  return isLocalSvg(children[0].url) ? children[0] : null;
}

// Several diagrams share one document, so their ids need distinct prefixes.
function prefixIds(svg, prefix) {
  const ids = new Set(Array.from(svg.matchAll(/\bid="([^"]+)"/g), (match) => match[1]));
  if (ids.size === 0) return svg;

  const rename = (id) => (ids.has(id) ? `${prefix}-${id}` : id);
  return svg
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${rename(id)}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${rename(id)})`)
    .replace(/\bhref="#([^"]+)"/g, (_, id) => `href="#${rename(id)}"`)
    .replace(
      /\baria-(labelledby|describedby)="([^"]+)"/g,
      (_, kind, refs) => `aria-${kind}="${refs.split(/\s+/).map(rename).join(' ')}"`,
    );
}

function readSvg(file, prefix) {
  const source = readFileSync(file, 'utf8')
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (!source.startsWith('<svg')) {
    throw new Error(`${file} does not start with an <svg> element.`);
  }
  return prefixIds(source, prefix);
}

function figure(image, directory, usedPrefixes) {
  const file = path.resolve(directory, decodeURI(image.url));
  const name = path.basename(file, '.svg');
  const count = (usedPrefixes.get(name) ?? 0) + 1;
  usedPrefixes.set(name, count);

  let svg = readSvg(file, count === 1 ? `dg-${name}` : `dg-${name}-${count}`);
  // An SVG without its own <title> takes the Markdown alt text as its name.
  if (!svg.includes('<title') && image.alt) {
    svg = svg.replace('<svg', `<svg role="img" aria-label="${escapeHtml(image.alt)}"`);
  }
  const caption = image.title ? `<figcaption>${escapeHtml(image.title)}</figcaption>` : '';
  return {
    type: 'html',
    value: `<figure class="diagram"><div class="diagram-frame">${svg}</div>${caption}</figure>`,
  };
}

function visit(node, directory, usedPrefixes) {
  if (!node || !Array.isArray(node.children)) return;

  node.children.forEach((child, index) => {
    const image = child.type === 'paragraph' ? soleImage(child) : null;
    if (image) node.children[index] = figure(image, directory, usedPrefixes);
    else visit(child, directory, usedPrefixes);
  });
}

export default function remarkInlineSvg() {
  return (tree, file) => {
    const source = file.path ?? file.history?.[0];
    if (typeof source !== 'string') return;
    visit(tree, path.dirname(source), new Map());
  };
}
