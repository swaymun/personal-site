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
  for (const page of ["work", "movies", "music", "games", "writing", "links"]) {
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
  assert.equal((s.match(/name="film"/g) || []).length, 4);
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

test("annotation cleanup preserves only requested collection content", () => {
  const s = html("");
  for (const copy of [
    "Mini Crosswords",
    "Four favorites from",
    "Open a spine",
    "Choose a spine",
    "Pick a case",
    "Here are some games inspired",
  ])
    assert.ok(!s.includes(copy));
  assert.match(s, /href="#links">Elsewhere/);
  assert.ok(s.includes('href="https://www.psu.edu/"'));
  assert.equal((s.match(/spines\/[^" ]+\.webp/g) || []).length, 28);
});
test("each device preloads exactly its own hashed hardware image", () => {
  assert.doesNotMatch(html(""), /rel="preload" as="image"/);
  for (const id of ["gba", "psp", "ipod", "3ds", "switch"]) {
    const s = html(id),
      preload = s.match(/rel="preload" as="image" href="([^"]+)"/);
    assert.ok(preload);
    assert.ok(preload[1].startsWith(`/_astro/${id}.`));
    assert.ok(s.includes(`class="hardware-art" src="${preload[1]}"`));
  }
  assert.doesNotMatch(html("ipod"), /content-phone|data-app="phone"/);
  assert.match(html("ipod"), /content-messages/);
});

test("Home warms hardware after load without loading games or sound", () => {
  const s = html("");
  assert.ok(s.includes("requestIdleCallback"));
  assert.ok(s.includes("scheduleWarmup"));
  for (const id of ["gba", "psp", "ipod", "3ds", "switch"])
    assert.ok(s.includes(`/_astro/${id}.`));
  assert.doesNotMatch(s, /<script[^>]+src=|\/video\/|\/audio\//);
});
