import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = (page: string) =>
  readFileSync(`dist/${page ? `${page}/` : ""}index.html`, "utf8");
test("built Home preserves the name, biography and text navigation", () => {
  const s = html("");
  assert.match(s, /<h1>Saimun Shahee<\/h1>/);
  assert.ok(s.includes("software engineer based in New York"));
  for (const page of ["work", "movies", "music", "games", "writing", "links"])
    assert.ok(s.includes(`href="#${page}"`));
});
test("Work preserves project and education; every text page has a heading and no script", () => {
  const s = html("work");
  assert.ok(s.includes("https://github.com/swaymun/system-design-excalidraws"));
  assert.ok(s.includes("Penn State"));
  for (const page of [
    "",
    "work",
    "movies",
    "music",
    "games",
    "writing",
    "links",
  ]) {
    assert.match(html(page), /<h1>/);
    assert.doesNotMatch(html(page), /<script/);
  }
});
test("device routes load their controller but do not preload games or audio", () => {
  for (const page of ["gba", "psp", "ipod", "3ds", "switch"]) {
    const s = html(page);
    assert.match(s, /<script/);
    assert.doesNotMatch(s, /<(?:audio|video)[^>]*src=/);
    assert.doesNotMatch(s, /<link[^>]*modulepreload/);
  }
});

test("Home contains corrected dates, projects and native movie shelf", () => {
  const s = html("");
  assert.ok(s.includes("May 2026"));
  assert.ok(s.includes("Stagehand Animation Studio"));
  assert.equal((s.match(/name="favorite-film"/g) || []).length, 4);
  assert.equal((s.match(/<h1>/g) || []).length, 1);
});

test("collections include the clarified favorites and omit songs", () => {
  const s = html("");
  for (const title of [
    "Bonito Generation",
    "underscores",
    "Number 1 Angel",
    "Temple Run",
    "Shin Budokai",
  ])
    assert.ok(s.includes(title));
  assert.equal((s.match(/class="record-choice sr-only"/g) || []).length, 16);
  assert.doesNotMatch(s, /Top 10 songs|Blonde/);
});
