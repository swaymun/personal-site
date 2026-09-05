# Verification — September 5, 2026

## Automated checks

- Astro check and production build pass with zero errors, warnings, or hints from source diagnostics.
- 16 Node tests pass. These include input-driven full completion of Cloudstep's three stages, Ash & Bronze's waves and boss, Pocket Ruins' three rooms, and Tidepool's five catches. Margin Hopper is endless; its tests cover bouncing, height scoring, wrapping, and loss.
- Content regression tests ensure Home retains the bio, Work retains education and project link, every text page has a heading, text pages have no scripts, and handheld HTML does not preload game chunks or audio.

| Text route | Lighthouse performance | Accessibility |
| --- | --- | --- |
| Home | 100 | 100 |
| Work | 100 | 100 |
| Movies | 100 | 100 |
| Music | 100 | 100 |
| Games | 100 | 100 |
| Writing | 100 | 100 |
| Links | 100 | 100 |

These are local production-build Lighthouse mobile audits, not measurements from every visitor device. Raw reports are kept locally under `.cache/lighthouse-*.json`.

## Browser evidence

- All 45 combinations of five handhelds and nine apps render through their real routes. GBA app navigation was additionally exercised through clicks.
- Home and all five hardware layouts have no page-width overflow at 360, 390, 768, and 1440 pixels.
- Each game was launched and visually inspected. PSP, iPod, 3DS, and Switch pause/restart/exit were directly exercised. GBA uses the same lifecycle and was inspected running.
- Notes written through the iPod app appeared in GBA Notes; the test note was cleared afterward.
- Back restored a previously selected movie app and restored Games after leaving active gameplay for Home.
- iPod ArrowDown from Home selects Games below it in the four-column grid.
- Compact game bounds remain aligned after focus changes; expanded portrait and landscape were inspected. Landscape controls sit beside the screen.
- Console error log was empty in the final local browser pass.
- Focus rings, semantic buttons, text alternatives, storage-failure handling, and reduced-motion rules are implemented. Browser pointer interaction and the multi-source input model were tested; this was not an exhaustive physical-device or screen-reader certification.

Screenshots are local in `.impeccable/review/`, including all six main pages at 360/1440 and expanded portrait/landscape gameplay. The independent finish review scored the reported keyboard, clipping, and expanded-layout fixes resolved.

## Audio and remaining content

Five source recordings were downloaded, cropped, loudness-normalized, and decoded successfully; provenance and exact crop times are in `public/audio/sources.json`. They are opt-in and fetched only when used. Short select/action effects are synthesized and not represented as authentic recordings. Perceptual listening could not be verified through the available audio input tool; source authenticity and crop quality remain for a human listening pass. The 3DS clip is a HOME Menu music excerpt, not a startup jingle.

Still needed from Saimun: top ten albums, top ten songs, top ten games, any blog posts, and any updates to the reused bio/work history. No personal rankings or articles were fabricated.
