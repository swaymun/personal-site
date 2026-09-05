import { clamp, rect, text, circle, hero, hud, Edge, random } from "./core.ts";
import type { Game, Status } from "./core.ts";
import type { InputState } from "../lib/input";
export class Fishing implements Game {
  width = 480;
  height = 320;
  status: Status = "playing";
  message = "";
  score = 0;
  x = 175;
  y = 160;
  caught = 0;
  misses = 0;
  phase: "ready" | "waiting" | "bite" | "caught" = "ready";
  timer = 0;
  time = 0;
  notice = "Walk to the shore. A to cast.";
  private action = new Edge();
  private rng = random(4);
  update(dt: number, input: InputState) {
    if (this.status !== "playing") return;
    this.time += dt;
    const action = this.action.pressed(input.has("action"));
    if (this.phase === "ready" || this.phase === "caught") {
      this.x = clamp(this.x + input.x * 90 * dt, 62, 255);
      this.y = clamp(this.y + input.y * 90 * dt, 93, 239);
      if (action) {
        this.phase = "waiting";
        this.timer = 1.8 + this.rng() * 2;
        this.notice = "A little patience…";
      }
    } else if (this.phase === "waiting") {
      this.timer -= dt;
      if (action) {
        this.phase = "ready";
        this.notice = "Too early. Cast again when you’re ready.";
      } else if (this.timer <= 0) {
        this.phase = "bite";
        this.timer = 1.1;
        this.notice = "BITE! Press A!";
      }
    } else if (this.phase === "bite") {
      this.timer -= dt;
      if (action) {
        this.caught++;
        this.score += 100 + Math.round(this.timer * 50);
        this.phase = "caught";
        this.notice = [
          "A silver minnow!",
          "A little bluegill!",
          "A striped perch!",
          "A sunset snapper!",
          "A golden carp!",
        ][this.caught - 1];
        if (this.caught === 5) {
          this.status = "won";
          this.message = "Five fish, one lovely afternoon. Time to head home.";
        }
      } else if (this.timer <= 0) {
        this.misses++;
        this.phase = "ready";
        this.notice = "It got away. A to cast again.";
        if (this.misses === 3) {
          this.status = "lost";
          this.message =
            "The fish have gone for the day. Try a fresh afternoon?";
        }
      }
    }
  }
  draw(c: CanvasRenderingContext2D) {
    rect(c, 0, 0, 480, 320, "#80c7ca");
    for (let y = 40; y < 320; y += 24)
      for (let x = 0; x < 480; x += 48) {
        const xx = x + Math.sin(this.time + y) * 4;
        rect(c, xx, y, 16, 2, "#b2ded5");
      }
    c.fillStyle = "#f0dfb0";
    c.beginPath();
    c.ellipse(120, 174, 176, 139, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#b5d28a";
    c.beginPath();
    c.ellipse(107, 163, 158, 120, 0, 0, Math.PI * 2);
    c.fill();
    for (const [x, y] of [
      [55, 81],
      [104, 66],
      [40, 209],
    ]) {
      rect(c, x - 4, y, 8, 31, "#a88b63");
      circle(c, x, y - 9, 22, "#72ab78");
      circle(c, x + 9, y - 15, 15, "#8dbd80");
      circle(c, x - 10, y - 19, 13, "#a3ca85");
    }
    for (let i = 0; i < 10; i++) {
      const x = 55 + ((i * 41) % 180),
        y = 110 + ((i * 29) % 120);
      rect(c, x, y, 2, 5, "#7fa871");
      rect(c, x - 2, y + 1, 2, 2, "#7fa871");
    }
    hero(c, this.x, this.y, "#f1cf85");
    if (this.phase === "waiting" || this.phase === "bite") {
      const bx = 336,
        by = this.y + 24 + Math.sin(this.time * 3) * 2;
      c.strokeStyle = "#f8f1ce";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(this.x + 7, this.y - 22);
      c.quadraticCurveTo(275, this.y - 65, bx, by);
      c.stroke();
      circle(c, bx, by, 4, "#e87862");
      if (this.phase === "bite") {
        text(c, "!", bx, by - 14, 22, "#8b352c", "center");
        c.strokeStyle = "#eaf9e6";
        c.beginPath();
        c.ellipse(bx, by + 2, 17, 6, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
    hud(c, `TIDEPOOL  FISH ${this.caught}/5`, `MISSED ${this.misses}/3`);
    rect(c, 40, 283, 400, 28, "#f5ecd0");
    text(c, this.notice, 240, 302, 11, "#3d5b50", "center");
  }
}
export const createGame = () => new Fishing();
