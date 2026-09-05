// Deterministic, original spine designs using the collection's sourced cover art.
// Not reproductions of retail spines. Rebuild: node --experimental-strip-types scripts/build-spines.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { albums, favoriteGames } from "../src/data/collection.ts";
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const palettes = {
  "the-college-dropout": ["#614023", "#f4dfaa", "Georgia", true],
  "birds-in-the-trap-sing-mcknight": ["#17181c", "#d7d4d1", "Georgia", false],
  "songs-in-the-key-of-life": ["#b95824", "#ffd34e", "Georgia", true],
  "yellow-dancer": ["#f8ce38", "#232522", "Arial", true],
  "flower-boy": ["#f5a343", "#533a25", "Georgia", true],
  trapsoul: ["#411a1c", "#eee0d3", "Arial", true],
  "the-wizrd": ["#122022", "#d0d9be", "Georgia", true],
  thriller: ["#f1eadd", "#28231f", "Georgia", false],
  "good-kid-m-a-a-d-city": ["#68828a", "#f4efe2", "Arial", false],
  "care-package": ["#222c29", "#eee9d9", "Georgia", false],
  "bonito-generation": ["#6dbde1", "#243632", "Arial", true],
  ctrl: ["#536947", "#e9ebd8", "Arial", false],
  "the-life-of-pablo": ["#ed905a", "#151515", "Arial", true],
  sweetener: ["#ccb9a8", "#41372f", "Georgia", false],
  "number-1-angel": ["#e1d9cf", "#a21621", "Arial", true],
  u: ["#dfe3d6", "#273c4b", "Arial", false],
  "sly-cooper": ["#152237", "#efd26b", "Georgia", true],
  "mario-3d-land": ["#f5f4e8", "#255a9d", "Arial", true],
  "shin-budokai": ["#f0e9d4", "#ba2823", "Arial", true],
  "ace-attorney": ["#d61e2e", "#ffffff", "Georgia", true],
  "mario-kart": ["#323874", "#ffffff", "Arial", true],
  "kid-icarus": ["#f0e9d4", "#795d25", "Georgia", true],
  "ghost-of-sparta": ["#dfdbcf", "#702a23", "Georgia", true],
  "temple-run": ["#292919", "#ecd273", "Georgia", true],
};
for (const [folder, items] of [
  ["music", albums],
  ["games", favoriteGames],
]) {
  mkdirSync(`public/${folder}/spines`, { recursive: true });
  for (const a of items) {
    const [bg, ink, font, caps] = palettes[a.id];
    const art = execFileSync("magick", [
      `public/${folder}/${a.id}.webp`,
      "-resize",
      "96x96^",
      "-gravity",
      "center",
      "-extent",
      "96x96",
      "-quality",
      "80",
      "webp:-",
    ]).toString("base64");
    const title = caps ? a.title.toUpperCase() : a.title;
    const subtitle = a.artist || a.platform;
    const thickness = 64;
    const length = Math.round(
      folder === "games" ? (thickness * a.height) / a.spine : 1067,
    );
    // Extend the canvas to the case ratio; lay out type at its natural proportions.
    const titleSize = Math.min(40, (length - 180) / (title.length * 0.68));
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${thickness}" height="${length}" viewBox="0 0 ${thickness} ${length}"><title>${esc(a.title)} — ${esc(subtitle)}</title><g transform="translate(64 0) rotate(90)"><rect width="${length}" height="64" fill="${bg}"/><image href="data:image/webp;base64,${art}" width="${length}" height="64" preserveAspectRatio="xMidYMid slice" opacity=".12"/><rect width="${length}" height="64" fill="${bg}" opacity=".55"/><image href="data:image/webp;base64,${art}" x="7" y="7" width="50" height="50"/><path d="M68 8v48M${length - 42} 8v48" stroke="${ink}" opacity=".4"/><text x="82" y="35" fill="${ink}" font-family="${font}" font-size="${titleSize}" font-weight="${caps ? 700 : 400}">${esc(title)}</text><text x="82" y="53" fill="${ink}" font-family="Arial" font-size="9" letter-spacing=".6">${esc(subtitle.toUpperCase())}</text><path d="M${length - 29} 15v34m5-34v34m3-34v34m7-34v34m3-34v34" stroke="${ink}" opacity=".5"/><path d="M0 1h${length}M0 63h${length}" stroke="${ink}" opacity=".25"/></g></svg>`;
    writeFileSync(`public/${folder}/spines/${a.id}.svg`, svg);
  }
}
