---
name: Saimun Shahee
description: A plain personal text site with detailed, playable handhelds.
colors:
  link: "#1856a5"
  focus: "#246bc1"
  text: "#242424"
  paper: "#fff"
  muted: "#606060"
  app-paper: "#fafbf8"
  app-toolbar: "#e5e9e8"
  app-action: "#245d89"
  note-paper: "#fff4c4"
typography:
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  nav:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  device-label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
rounded:
  app-action: "3px"
  touch-control: "6px"
spacing:
  page-inset: "24px"
  paragraph-after: "22px"
components:
  text-link:
    textColor: "{colors.link}"
  app-action:
    backgroundColor: "{colors.app-action}"
    textColor: "{colors.paper}"
    rounded: "{rounded.app-action}"
    padding: "2cqw 4cqw"
  notes-field:
    backgroundColor: "{colors.note-paper}"
    padding: "3cqw"
---

# Design System: Saimun Shahee

## Overview

A plain personal page with a collection of playable handhelds. The outer site is quiet and direct: white space, system Arial, underlined blue links, and centered navigation. Detailed hardware and era-specific menus carry the visual personality.

The pinned references are Nat.org and knarfeel.com. This is a code-led system: preserve the actual SVG silhouettes and working layouts rather than introducing generated comps.

Key characteristics: readable text, generous page margins, modest headings, tactile handheld controls, and distinct menus for each device.

## Colors

The outer palette is white, dark text, muted secondary copy, and blue links. Focus blue identifies keyboard interaction. App paper and toolbar neutrals keep content readable inside device screens; app action blue and note paper yellow are local interface treatments.

Device colors belong to their hardware and menus: cobalt GBA SP, black PSP-3000, black and silver iPod touch 4, midnight-purple original 3DS, and mint/blue Animal Crossing Switch. Preserve their SVG gradients in `src/components/Hardware.astro`; these are illustrations, not page-wide palette tokens.

## Typography

Arial with Helvetica and sans-serif fallbacks governs the site. The frontmatter records the desktop text hierarchy; secondary descriptions and handheld tools use the smaller label treatment. GBA menus use Courier New with monospace fallback.

Inside screens, container-relative units scale typography with the device. Expanded content uses clamped sizes: body (14–19px), main heading (22–30px), and toolbar (14–18px). Keep outer text pages independently readable.

## Layout

Navigation is a centered wrapping row with a gap of (12px 27px). Text pages have a maximum width of (650px), including horizontal page padding, and begin (78px) below the header area. Paragraph spacing and the restrained heading scale provide hierarchy without cards or section panels.

Handheld pages center one device within a maximum-width (1150px) region. Preserve each device's aspect ratio and percentage-positioned screen and controls. GBA, iPod, and 3DS are capped at (310px), (280px), and (450px); wide hardware scales to its configured width and available space.

At widths up to (600px), navigation uses (13px) text and tighter gaps; text starts after (52px), handhelds after (42px), and handheld horizontal padding becomes (12px). GBA and iPod caps become (290px) and (260px). At (800px) and above, PSP and Switch receive more space above the device.

Expanded view hides hardware and presents the screen directly, capped at (850px), or (400px) for iPod. In short landscape viewports, controls sit beside the screen. Preserve screen clipping while allowing app bodies and horizontal launchers to scroll within their own regions.

## Elevation & Depth

The text site is flat. Hardware uses SVG gradients, seams, bezels, and a soft cast shadow; its buttons depress by (1px) when pressed. iPod icons retain gloss and inset highlights, 3DS tiles use a light shadow, and PSP uses a luminous blue wave. These effects stay within their respective device worlds. Expanded view removes the hardware shadow.

## Shapes

The outer site uses ordinary text and links without decorative containers. Hardware silhouettes are device-specific SVG geometry. App action buttons have small corners, touch controls have slightly rounder corners, and physical buttons remain circular, pill-shaped, or directional as appropriate. iPod icons are rounded glossy squares; Switch app tiles are square and utilities circular.

## Components

- **Navigation:** Home, GBA SP, PSP, iPod, 3DS, Switch. Current page is dark, bold, and un-underlined; other entries retain link styling. It wraps on small screens.
- **Links and tools:** blue underlined text with a (3px) underline offset. Device utilities use semantic buttons styled as text links. The base stylesheet adds no separate hover animation.
- **Focus:** visible outlines on links, buttons, fields, and focusable screens. Keep focus visible without letting screen clipping move its contents.
- **Hardware:** decorative SVG underneath actual accessible buttons and analog hit areas. Pressed controls darken and depress; expanded touch buttons are at least (46px) square.
- **Launchers:** GBA uses a three-column cartridge grid; PSP uses a horizontal XMB category row with a vertical item list; iPod uses four columns and a dock; 3DS uses a lower tile grid with an upper preview; Switch uses a horizontal tile strip and circular utilities. Selection styling and keyboard movement must match each layout.
- **App content:** a toolbar above a scrolling text body and pager. Notes use a yellow textarea. Games use a pixel-rendered canvas, pause control, and centered overlay; expanded overlays use clamped, readable text.
- **Accessibility:** keep the skip link, text fallback, reduced-motion overrides, and readable expanded view. Do not rely on device color or tiny hardware labels as the only way to operate the content.

## Do's and Don'ts

- Do keep the outer page white, centered, and typographically restrained.
- Do reuse `Content.astro` for content across text and device views.
- Do preserve the five distinct hardware proportions and menu idioms.
- Do check narrow portrait, desktop, expanded, and short landscape layouts after changing device menus or overlays.
- Don't replace the text site with dashboard cards, promotional heroes, or a decorative background.
- Don't apply one universal launcher style to every device.
- Don't let selection rings, app labels, or game overlay focus disappear behind screen edges.

Source of truth: `src/styles/global.css`, `src/layouts/Site.astro`, `src/components/Handheld.astro`, and `src/components/Hardware.astro`. Companion extensions live in `.impeccable/design.json`.
