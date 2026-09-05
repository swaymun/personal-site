export type Action =
  | "up"
  | "down"
  | "left"
  | "right"
  | "action"
  | "back"
  | "secondary"
  | "extra"
  | "start"
  | "select"
  | "home"
  | "l"
  | "r"
  | "power"
  | "sound";
export const keyMap: Record<string, Action> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  z: "action",
  Enter: "action",
  " ": "action",
  x: "back",
  Escape: "back",
  c: "secondary",
  v: "extra",
  p: "start",
  h: "home",
  q: "l",
  e: "r",
};
export class InputState {
  sources = new Map<string, Action>();
  press(source: string, action: Action) {
    this.sources.set(source, action);
  }
  release(source: string) {
    this.sources.delete(source);
  }
  has(action: Action) {
    return [...this.sources.values()].includes(action);
  }
  clear() {
    this.sources.clear();
  }
  get x() {
    return Number(this.has("right")) - Number(this.has("left"));
  }
  get y() {
    return Number(this.has("down")) - Number(this.has("up"));
  }
}
export function nextSelection(
  index: number,
  action: Action,
  count: number,
  columns: number,
): number {
  const step =
    action === "left" || action === "l"
      ? -1
      : action === "right" || action === "r"
        ? 1
        : action === "up"
          ? -columns
          : action === "down"
            ? columns
            : 0;
  return (index + step + count) % count;
}

/** Circular travel limit and a neutral zone shared by physical stick caps. */
export function analogPosition(x: number, y: number) {
  const distance = Math.max(1, Math.hypot(x, y));
  x /= distance;
  y /= distance;
  return {
    x,
    y,
    horizontal:
      Math.abs(x) > 0.25 ? ((x < 0 ? "left" : "right") as Action) : null,
    vertical: Math.abs(y) > 0.25 ? ((y < 0 ? "up" : "down") as Action) : null,
  };
}
