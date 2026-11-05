// Give each section heading a link to itself. The link holds only an icon, so
// heading text that Astro collects for the table of contents stays unchanged.
// The script in Base.astro copies the link when it is clicked.
//
// The heading's last word and the icon share a no-wrap span, so the icon never
// sits alone on a line.

const LEVELS = new Set(['h2', 'h3', 'h4']);

const icon = {
  type: 'element',
  tagName: 'svg',
  properties: { viewBox: '0 0 24 24', ariaHidden: 'true', focusable: 'false' },
  children: [
    {
      type: 'element',
      tagName: 'path',
      properties: {
        d: 'M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1.2 1.2M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2',
      },
      children: [],
    },
  ],
};

function headingText(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(headingText).join('');
}

function link(id, text) {
  return {
    type: 'element',
    tagName: 'a',
    properties: {
      className: ['heading-link'],
      href: `#${id}`,
      ariaLabel: `Copy link to “${text.trim()}”`,
    },
    children: [structuredClone(icon)],
  };
}

function walk(node) {
  for (const child of node.children ?? []) {
    if (child.type !== 'element') continue;

    const id = child.properties?.id;
    if (!LEVELS.has(child.tagName) || typeof id !== 'string') {
      walk(child);
      continue;
    }

    const anchor = link(id, headingText(child));
    const last = child.children.at(-1);
    const match = last?.type === 'text' ? /^([\s\S]*?)(\S+)(\s*)$/.exec(last.value) : null;

    if (!match) {
      child.children.push(anchor);
      continue;
    }

    const [, before, word] = match;
    child.children.splice(
      -1,
      1,
      ...(before ? [{ type: 'text', value: before }] : []),
      {
        type: 'element',
        tagName: 'span',
        properties: { className: ['heading-tail'] },
        children: [{ type: 'text', value: word }, anchor],
      },
    );
  }
}

export default function rehypeHeadingLinks() {
  return (tree) => walk(tree);
}
