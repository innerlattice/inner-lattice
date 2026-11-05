# inner lattice

Personal site for publishing markdown content about consciousness and cosmology.

## Posting Workflow

1. Create a new markdown file in `src/content/posts/`
2. Add frontmatter at the top of the file
3. Commit and push to trigger auto-deploy

### Frontmatter Schema

```yaml
---
title: "Your Post Title"                # required
description: "Embed summary"            # optional; defaults to the first body paragraph
date: 2026-01-16T20:10:00-05:00         # required; full timestamp with offset, shown as a date only
updated: 2026-02-01T09:00:00-05:00      # optional; set after a real revision, never shown
tags: ["consciousness"]                 # optional, defaults to ["note"]
---
```

### Series

A series lives in `src/content/series/<slug>.yaml` and lists its parts in reading order. A part is either `post: <slug>` or `planned: <working title>`. Planned parts appear as forthcoming on each post in the series and on `/series/<slug>`. To publish one, write the post and replace its `planned:` line with `post: <slug>` in the same position; the earlier parts gain a "next" link on the next build.

```yaml
title: universal interactive software
description: One or two sentences for the series page.
parts:
  - post: universal-theory-of-interactive-software
  - planned: Interface theory
```

### Example Post

```markdown
---
title: "On the Nature of Awareness"
date: 2026-01-18T14:30:00-05:00
tags: ["consciousness", "phenomenology"]
---

Your content here. Standard markdown supported.

## Subheadings work

- Lists work
- Links work

> Blockquotes work too
```

## Local Development

```bash
npm install
npm run dev      # Start dev server at localhost:4321
npm run build    # Build for production
npm run preview  # Preview production build
```

## Deployment

Configured for Coolify auto-deploy on git push to main.

URLs have no trailing slash. Pages still build to `slug/index.html`, and each page names its slashless URL as canonical.

The RSS feed is at `/rss.xml`. Every page links to it from `<head>` for feed readers and from the footer for people. Each item carries the post's description and its full text. Feed readers cannot show Mermaid or inline SVG diagrams, so the feed replaces each one with a link to its section of the essay, and math keeps only its MathML (see `src/lib/feedContent.mjs`).
