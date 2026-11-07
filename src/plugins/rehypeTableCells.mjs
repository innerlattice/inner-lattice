import { visit } from 'unist-util-visit';

// Wraps the content of every table cell in <div class="table-cell-content">.
// Browsers ignore a maximum width on a table cell, but honour one on a block
// inside it, so the wrapper is what lets a long cell wrap instead of
// stretching its column. The mobile card layout uses the same wrapper to keep
// mixed text and math together in one grid cell.
export default function rehypeTableCells() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'td' && node.tagName !== 'th') return;
      if (node.children.length === 0) return;
      node.children = [
        {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-cell-content'] },
          children: node.children,
        },
      ];
    });
  };
}
