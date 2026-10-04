#!/usr/bin/env node
// Reports lists of three or more items whose last item is joined without a
// serial (Oxford) comma, such as "records, functions and choices".
//
// Usage: node scripts/check-oxford-commas.mjs [files...]
// With no files, checks every post in src/content/posts.
//
// The check is a heuristic: a clause containing "X, Y and Z" is flagged when
// at most five words separate the last comma from "and" or "or". Phrases such
// as "With experience, bidders bid later and ..." are false positives; list
// them, one per line, in scripts/oxford-comma-allow.txt to silence them.
// Exits with status 1 when any unlisted candidate remains.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const allowPath = join(here, 'oxford-comma-allow.txt');
const allow = existsSync(allowPath)
  ? readFileSync(allowPath, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'))
  : [];

const postsDir = join(here, '..', 'src', 'content', 'posts');
const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync(postsDir).filter((f) => f.endsWith('.md')).map((f) => join(postsDir, f));

const MAX_WORDS_BEFORE_CONJUNCTION = 5;

// Replaces non-prose spans with spaces so line numbers stay correct.
function blank(text, pattern) {
  return text.replace(pattern, (m) => m.replace(/[^\n]/g, ' '));
}

function prose(source) {
  let text = source;
  // Front matter: keep only title and description values.
  text = text.replace(/^---\n[\s\S]*?\n---\n/, (fm) =>
    fm.split('\n').map((line) => (/^(title|description):/.test(line) ? line.replace(/^\w+:\s*/, '') : line.replace(/[^\n]/g, ' '))).join('\n'),
  );
  text = blank(text, /```[\s\S]*?```/g);
  text = blank(text, /\$\$[\s\S]*?\$\$/g);
  text = blank(text, /\$[^$\n]+\$/g);
  text = blank(text, /`[^`\n]+`/g);
  text = blank(text, /<!--[\s\S]*?-->/g);
  text = blank(text, /\]\([^)\s]*/g); // link and image URLs, keeping titles
  return text;
}

const conjunction = /^(and|or)$/i;
let failures = 0;

for (const file of files) {
  const lines = prose(readFileSync(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    // Clauses end at sentence punctuation, semicolons, colons, dashes and table cells.
    for (const clause of line.split(/[.;:!?|()—]\s|[|]/)) {
      const parts = clause.split(/,\s+/);
      if (parts.length < 2) continue;
      for (let i = 1; i < parts.length; i++) {
        const words = parts[i].trim().split(/\s+/);
        if (conjunction.test(words[0] ?? '')) continue;
        const at = words.findIndex((w) => conjunction.test(w));
        if (at < 1 || at > MAX_WORDS_BEFORE_CONJUNCTION) continue;
        const snippet = `${parts[i - 1].trim().split(/\s+/).slice(-3).join(' ')}, ${words.slice(0, at + 2).join(' ')}`;
        if (allow.some((a) => clause.includes(a) || snippet.includes(a))) continue;
        failures++;
        console.log(`${file}:${index + 1}: ${snippet}`);
      }
    }
  });
}

if (failures) {
  console.log(`\n${failures} possible missing serial comma(s).`);
  process.exit(1);
}
console.log('No missing serial commas found.');
