import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { analogPosition, InputState } from "../src/lib/input.ts";
import { browserUrl } from "../src/lib/browser-url.ts";
import { appsForDevice } from "../src/data/site.ts";
test("stick has neutral center, diagonal travel limit, and independent release", () => {
  assert.equal(analogPosition(0.1, -0.1).horizontal, null);
  const p = analogPosition(5, -5);
  assert.ok(Math.hypot(p.x, p.y) <= 1.000001);
  assert.equal(p.horizontal, "right");
  assert.equal(p.vertical, "up");
  const input = new InputState();
  input.press("analog:1:x", p.horizontal!);
  input.press("key:Space", "action");
  input.release("analog:1:x");
  assert.equal(input.x, 0);
  assert.ok(input.has("action"));
  input.clear();
  assert.equal(input.sources.size, 0);
});
test("browser rejects executable URLs and resolves normal addresses", () => {
  assert.equal(
    browserUrl("example.com", "https://site.test"),
    "https://example.com/",
  );
  assert.equal(
    browserUrl("/browser-start/", "https://site.test"),
    "https://site.test/browser-start/",
  );
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "file:///tmp/a",
    "",
  ])
    assert.throws(() => browserUrl(value, "https://site.test"));
});
test("each device separates favorites from play; iPod apps are unique", () => {
  for (const id of ["gba", "psp", "3ds", "ipod", "switch"] as const) {
    const apps = appsForDevice(id);
    assert.ok(apps.includes("games") && apps.includes("play"));
    assert.equal(new Set(apps).size, apps.length);
  }
  const html = readFileSync("dist/ipod/index.html", "utf8");
  assert.equal((html.match(/data-app="messages"/g) || []).length, 1);
  assert.equal((html.match(/data-app="music"/g) || []).length, 1);
  assert.doesNotMatch(html, /id="expand"|id="text-link"|ios-page-dots|tel:/);
});
