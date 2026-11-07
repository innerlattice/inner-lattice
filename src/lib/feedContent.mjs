import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { SKIP, visit } from 'unist-util-visit';

// Feed readers drop scripts and site styles, and most drop inline SVG. This
// rewrites an essay's HTML so that what a reader cannot show turns into a link
// back to that place in the essay:
//
// - Mermaid code and inline SVG diagrams become a line that links to the
//   section holding the diagram.
// - KaTeX keeps only its MathML, which current browsers and readers render.
// - Section-link icons, classes, inline styles and data attributes go.
// - Site-relative links become absolute.

const element = (tagName, properties, children) => ({ type: 'element', tagName, properties, children });
const text = (value) => ({ type: 'text', value });

const hasClass = (node, name) => node.properties?.className?.includes?.(name) ?? false;

function placeholder(label, href) {
  return element('p', {}, [
    element('em', {}, [text(`${label} `), element('a', { href }, [text('View it in the essay.')])]),
  ]);
}

function diagramLabel(figure) {
  let label;
  visit(figure, 'element', (node) => {
    if (label) return SKIP;
    if (node.tagName === 'figcaption') label = toText(node);
    else if (node.tagName === 'svg' && node.properties?.ariaLabel) label = node.properties.ariaLabel;
    else if (node.tagName === 'title') label = toText(node);
  });
  return label ? `Diagram: ${label.trim().replace(/\.$/, '')}.` : 'A diagram appears here.';
}

function toText(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(toText).join('');
}

function mathOf(node, display) {
  let math;
  visit(node, 'element', (child) => {
    if (child.tagName === 'math') {
      math = child;
      return SKIP;
    }
  });
  if (math && display) math.properties = { ...math.properties, display: 'block' };
  return math;
}

export function feedContent(html, pageUrl) {
  const tree = fromHtml(html, { fragment: true });
  let section = '';

  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined) return;
    const replace = (...nodes) => {
      parent.children.splice(index, 1, ...nodes);
      return [SKIP, index + nodes.length];
    };

    if (/^h[2-6]$/.test(node.tagName) && typeof node.properties?.id === 'string') {
      section = `#${node.properties.id}`;
    }

    if (hasClass(node, 'heading-link')) return replace();
    if (hasClass(node, 'heading-tail') || hasClass(node, 'table-cell-content')) {
      // Unwrap, then visit the unwrapped children so anything inside them,
      // such as a heading's icon link, is handled too.
      parent.children.splice(index, 1, ...node.children);
      return index;
    }

    if (node.tagName === 'pre' && node.properties?.dataLanguage === 'mermaid') {
      return replace(placeholder('A diagram appears here.', `${pageUrl}${section}`));
    }
    if (node.tagName === 'figure' && hasClass(node, 'diagram')) {
      return replace(placeholder(diagramLabel(node), `${pageUrl}${section}`));
    }

    if (hasClass(node, 'katex-display') || hasClass(node, 'katex')) {
      const math = mathOf(node, hasClass(node, 'katex-display'));
      return math ? replace(math) : undefined;
    }
  });

  visit(tree, 'element', (node) => {
    const properties = node.properties ?? {};
    for (const key of Object.keys(properties)) {
      if (key === 'className' || key === 'style' || key === 'tabIndex' || key.startsWith('data')) {
        delete properties[key];
      }
    }
    for (const key of ['href', 'src']) {
      const value = properties[key];
      if (typeof value !== 'string') continue;
      if (value.startsWith('#')) properties[key] = `${pageUrl}${value}`;
      else if (value.startsWith('/')) properties[key] = new URL(value, pageUrl).href;
    }
  });

  return toHtml(tree);
}
