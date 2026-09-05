import { clamp, rect, hero, hud, Edge } from "./core.ts";
import type { Game, Status } from "./core.ts";
import type { InputState } from "../lib/input";
export class Platformer implements Game {
  width = 480;
  height = 320;
  status: Status = "playing";
  message = "";
  score = 0;
  stage = 0;
  x = 36;
  y = 270;
  vy = 0;
  grounded = true;
  checkpoint = false;
  lives = 4;
  facing = 1;
  camera = 0;
  coins = new Set<number>();
  private jump = new Edge();
  readonly length = 1350;
  platforms() {
    return [
      { x: 0, y: 270, w: 330 },
      { x: 370, y: 270, w: 280 },
      { x: 690, y: 270, w: 260 },
      { x: 995, y: 270, w: 400 },
      { x: 160, y: 217, w: 80 },
      { x: 475, y: 206, w: 85 },
      { x: 750, y: 217, w: 70 },
      { x: 1120, y: 215, w: 75 },
    ];
  }
  hazards() {
    return [120 + this.stage * 8, 490, 830, 1150];
  }
  update(dt: number, input: InputState) {
    if (this.status !== "playing") return;
    const press = this.jump.pressed(input.has("action"));
    if (press && this.grounded) {
      this.vy = -365;
      this.grounded = false;
    }
    if (input.x) this.facing = input.x;
    this.x = clamp(this.x + input.x * 155 * dt, 9, this.length - 10);
    const oldY = this.y;
    this.vy += 850 * dt;
    this.y += this.vy * dt;
    this.grounded = false;
    for (const p of this.platforms())
      if (
        this.x + 6 > p.x &&
        this.x - 6 < p.x + p.w &&
        oldY <= p.y + 0.1 &&
        this.y >= p.y &&
        this.vy >= 0
      ) {
        this.y = p.y;
        this.vy = 0;
        this.grounded = true;
      }
    if (this.x > 720 && !this.checkpoint) {
      this.checkpoint = true;
      this.score += 25;
    }
    for (let i = 0; i < 12; i++) {
      const cx = 110 + i * 100,
        cy = i % 3 === 1 ? 180 : 231;
      if (
        !this.coins.has(i) &&
        Math.hypot(this.x - cx, this.y - 15 - cy) < 23
      ) {
        this.coins.add(i);
        this.score += 10;
      }
    }
    if (
      this.y > 360 ||
      this.hazards().some((x) => Math.abs(this.x - x) < 13 && this.y > 253)
    ) {
      this.lives--;
      if (!this.lives) {
        this.status = "lost";
        this.message = "Out of hearts. Another little adventure?";
        return;
      }
      this.x = this.checkpoint ? 735 : 36;
      this.y = 210;
      this.vy = 0;
    }
    if (this.x > 1305) {
      this.score += 100;
      if (this.stage === 2) {
        this.status = "won";
        this.message = "All three islands crossed. Home before sunset.";
      } else {
        this.stage++;
        this.x = 36;
        this.y = 240;
        this.vy = 0;
        this.checkpoint = false;
        this.coins.clear();
      }
    }
    this.camera = clamp(this.x - 150, 0, this.length - this.width);
  }
  draw(c: CanvasRenderingContext2D) {
    rect(c, 0, 0, 480, 320, ["#9dd7dc", "#d3badb", "#efc497"][this.stage]);
    for (let i = 0; i < 7; i++) {
      const x = ((((i * 125 - this.camera * 0.25) % 750) + 750) % 750) - 90;
      rect(c, x, 65 + (i % 3) * 24, 59, 13, "#f3f2de");
      rect(c, x + 13, 57 + (i % 3) * 24, 32, 12, "#f3f2de");
    }
    for (let i = 0; i < 10; i++) {
      const x = i * 120 - this.camera * 0.5;
      c.fillStyle = ["#75babb", "#ad93be", "#d2a179"][this.stage];
      c.beginPath();
      c.moveTo(x - 90, 310);
      c.lineTo(x + 10, 150 + (i % 3) * 22);
      c.lineTo(x + 115, 310);
      c.fill();
    }
    c.save();
    c.translate(-Math.round(this.camera), 0);
    for (const p of this.platforms()) {
      rect(c, p.x, p.y, p.w, 70, "#897458");
      rect(c, p.x, p.y, p.w, 8, "#558965");
      rect(c, p.x, p.y + 8, p.w, 4, "#adc284");
      for (let x = p.x + 10; x < p.x + p.w; x += 28)
        rect(c, x, p.y + 24, 9, 5, "#746448");
    }
    for (const x of this.hazards()) {
      c.fillStyle = "#c15450";
      c.beginPath();
      c.moveTo(x - 12, 270);
      c.lineTo(x, 252);
      c.lineTo(x + 12, 270);
      c.fill();
    }
    for (let i = 0; i < 12; i++)
      if (!this.coins.has(i)) {
        const x = 110 + i * 100,
          y = i % 3 === 1 ? 180 : 231;
        c.fillStyle = "#ffe17d";
        c.beginPath();
        c.moveTo(x, y - 6);
        c.lineTo(x + 5, y);
        c.lineTo(x, y + 6);
        c.lineTo(x - 5, y);
        c.fill();
      }
    for (const x of [725, 1315]) {
      rect(c, x, 205, 3, 65, "#3c5860");
      rect(
        c,
        x + 3,
        205,
        25,
        17,
        x === 725 && this.checkpoint ? "#e7bc51" : "#edf1d7",
      );
    }
    hero(c, this.x, this.y);
    c.restore();
    hud(c, `ISLAND ${this.stage + 1}/3  HEARTS ${this.lives}`, `${this.score}`);
  }
}
export const createGame = () => new Platformer();
