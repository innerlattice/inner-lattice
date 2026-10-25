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
