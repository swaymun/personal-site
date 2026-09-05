# Saimun's personal site

A static Astro personal website with five interactive photographic handhelds and original Canvas mini-games.

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
- `public/audio/sources.json` and `public/video/sources.json`: recording provenance, crop times, and verification limitations.
- `public/hardware/sources.json`: hardware, stick caps, closed states, and generated icon provenance.

Home collects the personal sections on one scrollable page. Every handheld has separate Favorites and playable-game apps. iPod adds a fictional phone and sandboxed browser; its dock has no duplicate apps. GBA and PSP play short, skippable boot videos. GBA/3DS can close, the 3DS has simulated depth, and analog caps move with pointer input.

All device apps use the same content. Unknown album, song, and game rankings are explicitly blank. The Notes app stores visitor notes only in that visitor's browser. Game records and sound preference also stay local.

## Architecture

Astro renders all text pages without JavaScript. Handheld routes load a small TypeScript controller. Each game's module is imported only on launch. There is no framework runtime, emulator, backend, or account system. Hardware uses locally optimized product cutouts and restored artwork with interactive controls. Game covers and Switch app covers are generated illustrations; gameplay uses original Canvas graphics.

`npm test` covers menu movement, multiple input sources, storage failures, collisions, checkpoints, enemy waves, key-gated progression, fishing timing, full input-driven game completions, and static content integrity.

The existing Vercel integration deploys pushes to `main` at https://www.swagman67.com.
