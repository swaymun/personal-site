import test from "node:test";
import assert from "node:assert/strict";
import { InputState, nextSelection } from "../src/lib/input.ts";
import { readValue, writeValue } from "../src/lib/storage.ts";
import { Platformer } from "../src/games/platformer.ts";
import { Arena } from "../src/games/arena.ts";
import { Jumper } from "../src/games/jumper.ts";
import { Adventure } from "../src/games/adventure.ts";
import { Fishing } from "../src/games/fishing.ts";
const dt = 1 / 60;
function press(game: any, input: InputState, key: any) {
  input.press("test", key);
  game.update(dt, input);
  input.release("test");
  game.update(dt, input);
}
test("menu wraps and supports grid navigation and shoulders", () => {
  assert.equal(nextSelection(0, "left", 9, 3), 8);
  assert.equal(nextSelection(0, "up", 9, 3), 6);
  assert.equal(nextSelection(8, "r", 9, 3), 0);
});
test("independent touch and keyboard inputs survive another source release", () => {
  const i = new InputState();
  i.press("key", "left");
  i.press("finger", "left");
  i.press("button", "action");
  i.release("finger");
  assert.equal(i.x, -1);
  assert.ok(i.has("action"));
  i.clear();
  assert.equal(i.x, 0);
  assert.equal(i.has("action"), false);
});
test("unavailable storage fails safely", () => {
  const broken = {
    getItem() {
      throw new Error("denied");
    },
    setItem() {
      throw new Error("quota");
    },
    removeItem() {
      throw new Error("denied");
    },
  };
  assert.equal(readValue("notes", "fallback", broken), "fallback");
  assert.equal(writeValue("notes", "hi", broken), false);
});
test("platformer lands on platforms, collects coins and respawns at checkpoint", () => {
  const g = new Platformer(),
    i = new InputState();
  g.y = 220;
  g.vy = 100;
  for (let n = 0; n < 60; n++) g.update(dt, i);
  assert.equal(g.y, 270);
  g.x = 110;
  g.y = 245;
  g.update(dt, i);
  assert.equal(g.score, 10);
  g.x = 735;
  g.update(dt, i);
  assert.ok(g.checkpoint);
  g.y = 400;
  g.update(dt, i);
  assert.equal(g.x, 735);
  assert.equal(g.lives, 3);
});
test("platformer can complete all three stages using normal movement and jump inputs", () => {
  const g = new Platformer(),
    i = new InputState();
  i.press("right", "right");
  let jumpTimer = 0;
  for (let n = 0; n < 6000 && g.status === "playing"; n++) {
    const nearDanger =
      g.hazards().some((x) => x - g.x > 0 && x - g.x < 57) ||
      [330, 650, 950].some((x) => x - g.x > 0 && x - g.x < 47);
    if (g.grounded && nearDanger) {
      i.press("jump", "action");
      jumpTimer = 2;
    } else if (--jumpTimer <= 0) i.release("jump");
    g.update(dt, i);
  }
  assert.equal(g.status, "won", `stage=${g.stage}, x=${g.x}, lives=${g.lives}`);
  assert.ok(g.score >= 300);
});
test("platformer loss and restart create fresh state", () => {
  const g = new Platformer(),
    i = new InputState();
  for (let n = 0; n < 4; n++) {
    g.y = 400;
    g.update(dt, i);
  }
  assert.equal(g.status, "lost");
  assert.equal(new Platformer().lives, 4);
});
test("arena attacks have range; dodge grants temporary protection", () => {
  const g = new Arena(),
    i = new InputState();
  g.enemies = [{ x: 245, y: 190, hp: 3, boss: false, hit: 0 }];
  press(g, i, "action");
  assert.equal(g.enemies[0].hp, 2);
  press(g, i, "back");
  assert.ok(g.invincible > 0);
  assert.ok(g.dodge > 0);
});
test("arena progresses through three waves and guardian", () => {
  const g = new Arena(),
    i = new InputState();
  for (let n = 0; n < 10000 && g.status === "playing"; n++) {
    const e = g.enemies[0];
    const dist = Math.hypot(g.x - e.x, g.y - e.y);
    i.clear();
    if (dist > 45) {
      if (Math.abs(e.x - g.x) > 5) i.press("x", e.x > g.x ? "right" : "left");
      if (Math.abs(e.y - g.y) > 5) i.press("y", e.y > g.y ? "down" : "up");
    } else if (dist < 30) {
      i.press("x", e.x > g.x ? "left" : "right");
      i.press("y", e.y > g.y ? "up" : "down");
    }
    if (n % 15 === 0) i.press("attack", "action");
    if (n % 50 === 0) i.press("dodge", "back");
    g.update(dt, i);
  }
  assert.equal(g.status, "won", `wave=${g.wave}, hp=${g.hp}`);
});
test("jumper bounces, records height, wraps and eventually loses without steering", () => {
  const g = new Jumper(),
    i = new InputState();
  g.y = 420;
  g.vy = 100;
  g.update(0.1, i);
  assert.ok(g.vy < 0);
  g.x = -11;
  g.update(dt, i);
  assert.equal(g.x, 330);
  for (let n = 0; n < 1000 && g.status === "playing"; n++) g.update(dt, i);
  assert.ok(g.score > 0);
  assert.equal(g.status, "lost");
});
test("adventure door stays locked with enemies or missing key", () => {
  const g = new Adventure(),
    i = new InputState();
  g.x = 451;
  g.y = 175;
  g.update(dt, i);
  assert.equal(g.room, 0);
  g.enemies = [];
  g.update(dt, i);
  assert.equal(g.room, 1);
  g.enemies = [];
  g.x = 451;
  g.update(dt, i);
  assert.equal(g.room, 1);
  g.x = 310;
  g.y = 170;
  g.update(dt, i);
  assert.equal(g.key, true);
  g.x = 451;
  g.update(dt, i);
  assert.equal(g.room, 2);
  g.enemies = [];
  g.x = 451;
  g.update(dt, i);
  assert.equal(g.status, "won");
});
test("adventure can be completed with movement and attack inputs", () => {
  const g = new Adventure(),
    i = new InputState();
  for (let n = 0; n < 10000 && g.status === "playing"; n++) {
    const e = g.enemies[0];
    const target =
      e ?? (g.room === 1 && !g.key ? { x: 310, y: 170 } : { x: 453, y: 175 });
    const d = Math.hypot(g.x - target.x, g.y - target.y);
    i.clear();
    if (e && d < 23) {
      i.press("x", e.x > g.x ? "left" : "right");
    } else if (!e || d > 39) {
      if (Math.abs(target.x - g.x) > 4)
        i.press("x", target.x > g.x ? "right" : "left");
      if (Math.abs(target.y - g.y) > 4)
        i.press("y", target.y > g.y ? "down" : "up");
    }
    if (n % 16 === 0) i.press("attack", "action");
    g.update(dt, i);
  }
  assert.equal(g.status, "won", `room=${g.room},hp=${g.hp},key=${g.key}`);
});
test("fishing requires a timed bite, completes five catches and supports loss", () => {
  const g = new Fishing(),
    i = new InputState();
  for (let count = 0; count < 5; count++) {
    press(g, i, "action");
    assert.equal(g.phase, "waiting");
    while (g.phase === "waiting") g.update(dt, i);
    press(g, i, "action");
  }
  assert.equal(g.status, "won");
  assert.equal(g.caught, 5);
  const lost = new Fishing();
  for (let n = 0; n < 3; n++) {
    press(lost, i, "action");
    while (lost.phase === "waiting" || lost.phase === "bite")
      lost.update(dt, i);
  }
  assert.equal(lost.status, "lost");
});

test("iPod grid uses four-column vertical navigation", () => {
  assert.equal(nextSelection(0, "down", 9, 4), 4);
  assert.equal(nextSelection(4, "up", 9, 4), 0);
});
