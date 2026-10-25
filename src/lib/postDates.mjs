import { readdirSync, readFileSync } from 'node:fs';

// YAML turns any timestamp into a Date, so the time-of-day requirement is
// checked against the raw front matter before Astro parses it.
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

function readField(frontmatter, name) {
  const value = frontmatter
    .match(new RegExp(`^${name}:[ \\t]*(.*)$`, 'm'))?.[1]
    .trim()
    .replace(/^(["'])(.*)\1$/, '$2');
  return value || undefined;
}

function parseTimestamp(file, name, value) {
  if (!TIMESTAMP.test(value)) {
    throw new Error(
      `${file}: \`${name}\` must be a full timestamp with an offset, such as 2026-10-17T01:51:40-04:00 (found "${value}")`
    );
  }
  return new Date(value);
}

/** Reads `date` and optional `updated` from every post, keyed by slug. */
export function readPostDates(postsDir) {
  const dates = new Map();

  for (const file of readdirSync(postsDir).filter((name) => name.endsWith('.md'))) {
    const source = readFileSync(new URL(file, postsDir), 'utf8');
    const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    const date = readField(frontmatter, 'date');
    const updated = readField(frontmatter, 'updated');

    if (!date) throw new Error(`${file}: \`date\` is required`);

    const published = parseTimestamp(file, 'date', date);
    const modified = updated ? parseTimestamp(file, 'updated', updated) : undefined;

    if (modified && modified < published) {
      throw new Error(`${file}: \`updated\` is earlier than \`date\``);
    }

    dates.set(file.replace(/\.md$/, ''), { published, updated: modified });
  }

  return dates;
}
