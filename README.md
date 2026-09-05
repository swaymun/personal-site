# Saimun's personal site

A static Astro personal website with five interactive SVG handhelds and original Canvas mini-games.

## Run locally

```sh
npm install
npm run dev
```

Production verification:

```sh
npm run build
npm test
npm run preview -- --host 127.0.0.1 --port 4321
```

Use Node 22.6+ for the built-in TypeScript test runner. Build before testing: content regression checks inspect the generated HTML.

## Edit content

- `src/data/site.ts`: biography, work history, movies, links, and device/game descriptions.
- `src/components/Content.astro`: shared content layout and currently empty top-ten lists.
- `src/pages/writing/*.md`: posts, using `layout: ../../layouts/Post.astro`, `title`, and an ISO `date` in frontmatter.
- `public/audio/sources.json`: recording provenance, crop times, and verification limitations.

All device apps use the same content. Unknown album, song, and game rankings are explicitly blank. The Notes app stores visitor notes only in that visitor's browser. Game records and sound preference also stay local.

## Architecture

Astro renders all text pages without JavaScript. Handheld routes load a small TypeScript controller. Each game's module is imported only on launch. There is no framework runtime, emulator, backend, or account system. SVG hardware and game art are authored locally.

`npm test` covers menu movement, multiple input sources, storage failures, collisions, checkpoints, enemy waves, key-gated progression, fishing timing, full input-driven game completions, and static content integrity.

The existing Vercel integration deploys pushes to `main` at https://www.swagman67.com.
