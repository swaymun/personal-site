import {
  clamp,
  distance,
  rect,
  text,
  circle,
  hero,
  hud,
  Edge,
} from "./core.ts";
import type { Game, Status } from "./core.ts";
import type { InputState } from "../lib/input";
export class Adventure implements Game {
  width = 480;
  height = 320;
  status: Status = "playing";
  message = "";
  score = 0;
  x = 55;
  y = 175;
  room = 0;
  hp = 5;
  key = false;
  attack = 0;
  invincible = 0;
  enemies: { x: number; y: number; hp: number; hit: number }[] = [];
  private swing = new Edge();
  constructor() {
    this.spawn();
  }
  spawn() {
    this.enemies = Array.from({ length: this.room + 1 }, (_, i) => ({
      x: 240 + i * 58,
      y: 100 + i * 65,
      hp: 2,
      hit: 0,
    }));
  }
  update(dt: number, input: InputState) {
    if (this.status !== "playing") return;
    this.attack = Math.max(0, this.attack - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    const attack = this.swing.pressed(input.has("action"));
    const n = Math.hypot(input.x, input.y) || 1;
    this.x = clamp(this.x + (input.x / n) * 130 * dt, 33, 458);
    this.y = clamp(this.y + (input.y / n) * 130 * dt, 66, 280);
    if (attack && this.attack === 0) {
      this.attack = 0.2;
      for (const e of this.enemies)
        if (distance(this, e) < 53) {
          e.hp--;
          e.hit = 0.3;
          const dx = e.x - this.x,
            dy = e.y - this.y,
            d = Math.hypot(dx, dy) || 1;
          e.x = clamp(e.x + (dx / d) * 22, 38, 440);
          e.y = clamp(e.y + (dy / d) * 22, 68, 280);
        }
    }
    for (const e of this.enemies) {
      e.hit = Math.max(0, e.hit - dt);
      const d = distance(this, e) || 1;
      if (e.hp > 0 && e.hit === 0) {
        e.x += ((this.x - e.x) / d) * 31 * dt;
        e.y += ((this.y - e.y) / d) * 31 * dt;
      }
      if (e.hp > 0 && d < 18 && this.invincible === 0) {
        this.hp--;
        this.invincible = 1;
      }
    }
    this.score += this.enemies.filter((e) => e.hp <= 0).length * 50;
    this.enemies = this.enemies.filter((e) => e.hp > 0);
    if (
      !this.enemies.length &&
      this.room === 1 &&
      Math.hypot(this.x - 310, this.y - 170) < 27 &&
      !this.key
    ) {
      this.key = true;
      this.score += 100;
    }
    if (this.x > 444 && Math.abs(this.y - 175) < 32 && !this.enemies.length) {
      if (this.room === 2 && this.key) {
        this.status = "won";
        this.score += 200;
        this.message =
          "The old door opens. You found your way through the ruins.";
      } else if (this.room < 2 && (this.room === 0 || this.key)) {
        this.room++;
        this.x = 50;
        this.y = 175;
        this.hp = Math.min(5, this.hp + 1);
        this.spawn();
      }
    }
    if (this.hp <= 0) {
      this.status = "lost";
      this.message = "The ruins keep their secret. Try again?";
    }
  }
  draw(c: CanvasRenderingContext2D) {
    rect(c, 0, 0, 480, 320, ["#485d50", "#4c5868", "#665645"][this.room]);
    rect(c, 23, 49, 434, 244, ["#8d9c76", "#939d9c", "#aca080"][this.room]);
    for (let y = 50; y < 290; y += 30)
      for (let x = 24; x < 455; x += 32) {
        c.strokeStyle = "#586b5740";
        c.strokeRect(x, y, 30, 28);
      }
    for (const x of [26, 438])
      for (let y = 51; y < 293; y += 30) rect(c, x, y, 15, 26, "#566657");
    for (let x = 26; x < 450; x += 32) {
      rect(c, x, 49, 28, 15, "#65745e");
      rect(c, x, 279, 28, 15, "#65745e");
    }
    rect(c, 440, 144, 28, 60, this.enemies.length ? "#655344" : "#283c37");
    if (this.enemies.length) {
      for (let x = 443; x < 467; x += 7) rect(c, x, 145, 3, 57, "#ac966f");
    }
    text(c, this.room === 2 ? "EXIT" : "→", 452, 178, 11, "#e8db9d", "center");
    for (const x of [100, 375])
      for (const y of [88, 256]) {
        rect(c, x - 8, y - 8, 16, 16, "#738464");
        rect(c, x - 6, y - 10, 12, 4, "#bec599");
      }
    if (this.room === 1 && !this.enemies.length && !this.key) {
      circle(c, 310, 165, 6, "#f2d76d");
      rect(c, 308, 169, 4, 17, "#f2d76d");
      rect(c, 310, 178, 8, 4, "#f2d76d");
      text(c, "KEY", 310, 207, 10, "#243e3b", "center");
    }
    for (const e of this.enemies) {
      circle(c, e.x, e.y - 7, 12, e.hit ? "#f6efd1" : "#677f9b");
      rect(c, e.x - 7, e.y - 10, 4, 3, "#ecdb8c");
      rect(c, e.x + 3, e.y - 10, 4, 3, "#ecdb8c");
    }
    if (this.attack > 0) {
      c.strokeStyle = "#f4e4a2";
      c.lineWidth = 4;
      c.beginPath();
      c.arc(this.x, this.y - 10, 38, -1, 4);
      c.stroke();
    }
    if (this.invincible === 0 || Math.floor(this.invincible * 12) % 2)
      hero(c, this.x, this.y, "#536c41");
    hud(
      c,
      `ROOM ${this.room + 1}/3  HEARTS ${this.hp}`,
      this.key ? "KEY ✓" : `${this.score}`,
    );
    text(
      c,
      this.enemies.length
        ? "CLEAR THE ROOM"
        : this.room === 1 && !this.key
          ? "COLLECT THE KEY"
          : "THE RIGHT DOOR IS OPEN",
      240,
      313,
      10,
      "#f4ebca",
      "center",
    );
  }
}
export const createGame = () => new Adventure();
