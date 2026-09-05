# Handheld website implementation

The user approved a plain white personal site and five detailed SVG handhelds. This pinned direction overrides alternate visual concepts. Text is readable independently of the interactive devices. Static Astro output; no backend, no accounts, no client framework, no 3D runtime.

Build workflow: code first, inspect desktop/mobile renders, then verify fixes. All hardware SVGs, app icons, game art and game logic are original code. Device form and menu references include Apple iPod touch 4 manuals, Sony PSP-3000 Quick Reference, Nintendo 3DS manuals, and Nintendo Switch HOME menu documentation. The project now replaces the old Xbox presentation entirely.

Shared content: src/data/site.ts and Content.astro. Add posts as Markdown under src/pages/writing with title, ISO date, and layout ../../layouts/Post.astro. Rankings are intentionally blank. Letterboxd favorites were read directly on September 5, 2026 from https://letterboxd.com/swaymun/.

Routes: /; /work/, /movies/, /music/, /games/, /writing/, /links/; /gba/, /psp/, /ipod/, /3ds/, /switch/. Device app links use ?app=work (or another app identifier). Game chunks are dynamically imported only when launched. Notes, sound preference and scores use localStorage keys prefixed handheld: and degrade safely when storage is unavailable.

Delivery update: the user subsequently authorized direct main commits, GitHub pushes, and automatic production deployment on each commit.
