# Social preview artwork

A light, open glass lattice catching pearlescent pink, lavender and cyan light on an off-white background. Generated with the built-in image-generation tool, then center-cropped and compressed as JPEG using Sharp. No text is embedded, so the same composition survives small thumbnails and square crops; each page supplies its own title and description.

- `inner-lattice-v3.jpg`: 1200 × 630 (1.905:1), default Open Graph image.
- `inner-lattice-x-v3.jpg`: 1200 × 600 (2:1), X large-image card.
- `inner-lattice-square-v3.jpg`: 1080 × 1080 (1:1), standalone square export; not advertised as a competing Open Graph image.

The shared Astro layout emits absolute HTTPS image URLs, dimensions, MIME type and alt text in server-rendered HTML. Open Graph supports link previews in clients including Facebook, Discord, WhatsApp, Telegram and Bluesky; the actual layout and refresh timing belong to each client. X has separate Twitter Card metadata. This is link-preview configuration, not a promise that every client will select the same crop. No messages or social posts were sent for testing.

Version filenames when replacing artwork so image caches can refresh. Existing shared links may also retain cached page metadata.

References: [Open Graph image properties](https://ogp.me/), [Bluesky website-card embeds](https://docs.bsky.app/blog/create-post), [Apple rich link previews](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages/).

## Generation prompt (v3)

A single refined editorial artwork for inner lattice, a neo-minimalist philosophy journal about consciousness, cosmology and interconnected systems. Wide landscape composition approximately 1.91:1. A luminous, airy curved lattice of slender translucent glass filaments floats on a very light warm off-white background. The lattice is OPEN AND SPARSE, with generously spaced crossings, only a few layers, gently sweeping like a section of an undulating mathematical surface, not a closed torus or knot. Its filaments catch exquisite thin-film interference light: delicate iridescent pastel cyan, lavender, blush pink, pale gold and pearl, like light on a soap film or dichroic glass. Bright high-key lighting from all directions, luminous white highlights, very little contrast, almost no cast shadow. IMPORTANT: absolutely no black, charcoal, dark gray shading, dark mesh, dense overlapping wire, opaque metallic threads, deep recesses, holes in a solid surface, clustered dots, pores, granular textures, cellular or biological forms. The spaces between the few fine glass lines are simply the open off-white background. Overall impression is light, radiant, translucent and spacious. Iridescence should be visibly present but sophisticated and restrained, no saturated neon or rainbow background. A few broad nearly invisible translucent film ribbons may cross through the luminous sparse lattice to make the optical colors legible. Compose the essential form inside the central half of the width, allowing wide and centered square crops. No lettering, logo, text, borders or mockup. Tactile optical-material photography, museum-quality contemporary editorial art, peaceful and exceptionally minimal.
