import { rect, circle, hud, random } from "./core.ts";
import type { Game, Status } from "./core.ts";
import type { InputState } from "../lib/input";
export class Jumper implements Game {
  width = 320;
  height = 480;
  status: Status = "playing";
  message = "";
  score = 0;
  x = 160;
  y = 395;
  vy = -370;
  camera = 0;
  platforms: { x: number; y: number; w: number }[] = [];
  private rng = random(24);
  constructor() {
    this.platforms = [{ x: 115, y: 425, w: 90 }];
    for (let i = 1; i < 12; i++)
      this.platforms.push({ x: 45 + this.rng() * 170, y: 425 - i * 64, w: 68 });
  }
  update(dt: number, input: InputState) {
    if (this.status !== "playing") return;
    this.x += input.x * 200 * dt;
    if (this.x < -10) this.x = 330;
    if (this.x > 330) this.x = -10;
    const old = this.y;
    this.vy += 720 * dt;
    this.y += this.vy * dt;
    if (this.vy > 0)
      for (const p of this.platforms)
        if (
          old <= p.y &&
          this.y >= p.y &&
          this.x + 10 > p.x &&
          this.x - 10 < p.x + p.w
        ) {
          this.y = p.y;
          this.vy = -370;
          break;
        }
    this.camera = Math.min(this.camera, this.y - 200);
    this.score = Math.max(this.score, Math.floor((395 - this.y) / 5));
    while (Math.min(...this.platforms.map((p) => p.y)) > this.camera - 120) {
      const top = Math.min(...this.platforms.map((p) => p.y));
      this.platforms.push({ x: 35 + this.rng() * 190, y: top - 64, w: 68 });
    }
    this.platforms = this.platforms.filter((p) => p.y < this.camera + 520);
    if (this.y > this.camera + 500) {
      this.status = "lost";
      this.message = `A good climb. ${this.score} meters of margin explored.`;
    }
  }
  draw(c: CanvasRenderingContext2D) {
    rect(c, 0, 0, 320, 480, "#faf4df");
    for (let y = (30 - this.camera * 0.3) % 24; y < 480; y += 24)
      rect(c, 0, y, 320, 1, "#d6e1d6");
    rect(c, 30, 0, 1, 480, "#e8bcad");
    c.save();
    c.translate(0, -this.camera);
    for (const p of this.platforms) {
      rect(c, p.x, p.y, p.w, 9, "#789c63");
      rect(c, p.x + 2, p.y, p.w - 4, 3, "#b9ce90");
      rect(c, p.x + 4, p.y + 9, p.w - 8, 2, "#58774f");
    }
    circle(c, this.x, this.y - 17, 14, "#c2c96e");
    rect(c, this.x - 12, this.y - 17, 24, 15, "#c2c96e");
    rect(c, this.x + 7, this.y - 21, 14, 7, "#a5b35b");
    circle(c, this.x + 5, this.y - 23, 2, "#34432d");
    rect(c, this.x - 8, this.y - 3, 5, 5, "#4f6542");
    rect(c, this.x + 3, this.y - 3, 5, 5, "#4f6542");
    c.restore();
    hud(c, "MARGIN HOPPER", `${this.score}m`, 320);
  }
}
export const createGame = () => new Jumper();
