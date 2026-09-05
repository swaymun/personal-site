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

## Hardware and OS fidelity revision — September 5, 2026

- Replaced all five SVG hardware drawings with local WebP cutouts. The GBA source was restored/upscaled with ImageGen after explicit user authorization, then its screen and controls were recalibrated. Other devices use sourced product artwork. `/credits/` and `/hardware/sources.json` retain creators, source URLs, and transformations.
- PSP category selection now moves the horizontal axis while the selected category stays aligned with its vertical entries. Clicking a category selects it; the entry, hardware confirm, or Enter opens it.
- iOS uses original icon exports, the original ripple wallpaper, a four-column grid and dock, and period app chrome. 3DS uses separate preview/software screens plus four original system icons. Switch uses a software strip, selected title and utility row. Original mini-games and personal content remain intact.
- All 20 combinations of five devices and 360/390/768/1440 widths had no page overflow or broken images in the browser. Desktop and mobile captures are under `.impeccable/review/fidelity-*.png` (local review evidence).
- All 45 device/app combinations rendered with a nonempty, visible content region. Physical PSP Right then × opened Work. All five games launched, paused, and exited successfully through visible controls. Expanded iOS Notes was inspected. The existing 16 tests still pass, and Astro check/build pass.
- No new runtime dependencies. Images are fetched only on the relevant device page. iOS icon exports were converted losslessly to WebP to reduce their transfer size. No new Lighthouse score is claimed for this visual revision; the earlier text-page audit remains the prior baseline.
- Fidelity is a browser adaptation: personal app names, content and mini-games are original, not firmware emulation. PSP wave artwork and several menu icons remain authored vectors. Source authenticity is documented separately from visual recreation.
