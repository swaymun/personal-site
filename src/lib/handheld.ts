import {
  apps,
  titles,
  devices,
  bio,
  experience,
  projects,
  movies,
} from "../data/site";
import type { AppId, DeviceId } from "../data/site";
import { InputState, keyMap, nextSelection } from "./input";
import type { Action } from "./input";
import { readValue, writeValue, readScore, saveScore } from "./storage";
import { DeviceAudio } from "./audio";
import type { Game } from "../games/core";
const root = document.querySelector<HTMLElement>("[data-device]")!;
const id = root.dataset.device as DeviceId;
const device = devices.find((d) => d.id === id)!;
const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
  root.querySelector<T>(selector)!;
const screen = $(".screen"),
  launcher = $("#launcher"),
  view = $("#app-view"),
  body = $("#app-body"),
  gameView = $("#game-view"),
  overlay = $("#game-overlay"),
  boot = $("#boot");
const input = new InputState(),
  audio = new DeviceAudio(id);
let subSelected = 0;
let selected = 0,
  currentApp: AppId | null = null,
  game: Game | null = null,
  createGame: (() => Game) | null = null,
  paused = true,
  frame = 0,
  last = 0,
  bootTimer = 0,
  loadToken = 0;
const gameImports = {
  gba: () => import("../games/platformer"),
  psp: () => import("../games/arena"),
  ipod: () => import("../games/jumper"),
  "3ds": () => import("../games/adventure"),
  switch: () => import("../games/fishing"),
};
const canvas = $<HTMLCanvasElement>("#game-canvas"),
  ctx = canvas.getContext("2d")!;
function updateClock() {
  root.querySelectorAll(".clock").forEach(
    (el) =>
      (el.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })),
  );
}
updateClock();
let clockTimer = setInterval(updateClock, 60000);
function setSound(on: boolean) {
  audio.setEnabled(on);
  const button = $("#sound-toggle");
  button.textContent = on ? "Sound on" : "Sound off";
  button.setAttribute("aria-pressed", String(on));
  const checkbox = $<HTMLInputElement>("#settings-sound");
  if (checkbox) checkbox.checked = on;
}
setSound(audio.enabled);
function clearInput() {
  input.clear();
  root
    .querySelectorAll(".pressed")
    .forEach((el) => el.classList.remove("pressed"));
  root
    .querySelectorAll<HTMLElement>("[data-analog] span")
    .forEach((el) => (el.style.transform = ""));
}
const xmbLabels: Record<AppId, string[]> = {
  home: ["About Saimun"],
  work: ["Experience", "Education", "Projects"],
  movies: ["Favorite films"],
  music: ["Top albums", "Top songs"],
  games: [device.game, "Favorite games"],
  writing: ["Posts"],
  links: ["Find me online"],
  notes: ["Your notebook"],
  settings: ["Sound & controls"],
};
function updateXmbPreview() {
  const app = apps[selected];
  const descriptions: Record<AppId, string[]> = {
    home: [bio],
    work: [
      experience.map(([c, , p, t]) => `${c} · ${t} (${p})`).join("\n"),
      "Penn State University · BS Computer Science + Statistics · 2016–2020",
      projects.map((p) => p.title).join("\n"),
    ],
    movies: [movies.map(([title]) => title).join("\n")],
    music: [
      "My ten favorite albums. List still to come.",
      "My ten favorite songs. List still to come.",
    ],
    games: [
      device.genre + " Move with the D-pad. × attacks; ○ dodges.",
      "My ten favorite games. List still to come.",
    ],
    writing: ["Nothing published yet."],
    links: ["Email · GitHub · LinkedIn · X · Letterboxd"],
    notes: ["A private notebook saved in this browser."],
    settings: ["Sound, controls, and local game records."],
  };
  let preview = root.querySelector<HTMLElement>(".xmb-preview");
  if (!preview) {
    preview = document.createElement("aside");
    preview.className = "xmb-preview";
    preview.setAttribute("aria-live", "polite");
    $("#launcher").append(preview);
  }
  const heading = document.createElement("strong");
  heading.textContent = xmbLabels[app][subSelected];
  const text = document.createElement("p");
  text.textContent = descriptions[app][subSelected];
  preview.replaceChildren(heading, text);
  $(".xmb-items")
    .querySelectorAll("button")
    .forEach((b, i) => b.classList.toggle("selected", i === subSelected));
}
function renderXmb() {
  if (id !== "psp") return;
  const list = $(".xmb-items");
  list.replaceChildren();
  xmbLabels[apps[selected]].forEach((label, i) => {
    const b = document.createElement("button");
    const icon = document.createElement("span");
    icon.className = "xmb-item-icon";
    const source = root.querySelector(
      `[data-app="${apps[selected]}"] .app-icon`,
    );
    if (source)
      icon.append(...[...source.childNodes].map((n) => n.cloneNode(true)));
    const text = document.createElement("span");
    text.textContent = label;
    b.append(icon, text);
    b.classList.toggle("selected", i === subSelected);
    const highlight = () => {
      subSelected = i;
      updateXmbPreview();
    };
    b.addEventListener("pointerenter", highlight);
    b.addEventListener("focus", highlight);
    b.addEventListener("click", () => openXmb(i));
    list.append(b);
  });
  updateXmbPreview();
}
function openXmb(index: number) {
  const app = apps[selected];
  openApp(app, true, app === "games" && index > 0);
  if (
    (app === "work" && index > 0) ||
    (app === "music" && index > 0) ||
    (app === "games" && index > 0)
  ) {
    requestAnimationFrame(() => {
      const heading = [...body.querySelectorAll("h2")].find(
        (h) =>
          h.textContent ===
          (app === "work"
            ? index === 1
              ? "Education"
              : "Projects"
            : app === "music"
              ? "Top 10 songs"
              : "Top 10 games"),
      );
      if (heading)
        body.scrollTop = (heading as HTMLElement).offsetTop - body.offsetTop;
      updatePage();
    });
  }
}
function choose(index: number, focus = false) {
  if (index !== selected) subSelected = 0;
  selected = index;
  renderXmb();
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-app]")];
  buttons.forEach((b, i) => {
    b.classList.toggle("selected", i === index);
    b.setAttribute("aria-pressed", String(i === index));
  });
  const chosen = buttons[index];
  if (chosen) {
    const grid = chosen.parentElement!;
    if (id === "psp") grid.style.setProperty("--selected-index", String(index));
    if (id !== "psp" && grid.scrollWidth > grid.clientWidth)
      grid.scrollLeft =
        chosen.offsetLeft -
        grid.offsetLeft -
        grid.clientWidth / 2 +
        chosen.clientWidth / 2;
    if (focus) chosen.focus({ preventScroll: true });
  }
  const upper = $("#upper-title");
  if (upper) {
    upper.textContent = titles[apps[index]];
    const icon = chosen?.querySelector(".app-icon");
    if (icon)
      $(".upper-icon").replaceChildren(
        ...[...icon.childNodes].map((n) => n.cloneNode(true)),
      );
  }
  if (id === "switch") $(".launcher-heading").textContent = titles[apps[index]];
}
function setUrl(app: AppId | null, favorites = false) {
  const url = new URL(location.href);
  if (app) url.searchParams.set("app", app);
  else url.searchParams.delete("app");
  if (favorites) url.searchParams.set("view", "favorites");
  else url.searchParams.delete("view");
  if (url.href !== location.href) history.pushState({ app }, "", url);
}
function stopGame() {
  loadToken++;
  cancelAnimationFrame(frame);
  frame = 0;
  paused = true;
  game = null;
  audio.stop();
  clearInput();
  gameView.hidden = true;
  root.classList.remove("is-playing");
}
function menu(historyUpdate = true) {
  stopGame();
  currentApp = null;
  root.removeAttribute("data-current-app");
  view.hidden = true;
  launcher.hidden = false;
  boot.hidden = true;
  clearTimeout(bootTimer);
  $("#text-link").setAttribute("href", "/");
  if (historyUpdate) setUrl(null);
  choose(selected);
}
function updatePage() {
  const pages = Math.max(
    1,
    Math.ceil(body.scrollHeight / Math.max(1, body.clientHeight)),
  );
  const current = Math.min(
    pages,
    Math.floor(body.scrollTop / Math.max(1, body.clientHeight)) + 1,
  );
  $("#page-position").textContent =
    pages > 1 ? `${current} / ${pages}` : "End of page";
  $<HTMLButtonElement>("#page-prev").disabled = body.scrollTop < 2;
  $<HTMLButtonElement>("#page-next").disabled =
    body.scrollTop + body.clientHeight >= body.scrollHeight - 3;
}
function openApp(app: AppId, historyUpdate = true, favorites = false) {
  if (app === "games" && !favorites) {
    currentApp = app;
    root.dataset.currentApp = app;
    selected = apps.indexOf(app);
    $("#text-link").setAttribute("href", "/games/");
    if (historyUpdate) setUrl(app);
    void launchGame();
    return;
  }
  stopGame();
  currentApp = app;
  root.dataset.currentApp = app;
  selected = apps.indexOf(app);
  choose(selected);
  launcher.hidden = true;
  view.hidden = false;
  $("#app-title").textContent = titles[app];
  body.replaceChildren(
    $<HTMLTemplateElement>(`#content-${app}`).content.cloneNode(true),
  );
  body.scrollTop = 0;
  $("#text-link").setAttribute(
    "href",
    ["notes", "settings"].includes(app)
      ? "/"
      : app === "home"
        ? "/"
        : `/${app}/`,
  );
  if (app === "notes") {
    const notes = $<HTMLTextAreaElement>("#notes-text");
    notes.value = readValue("notes");
    notes.addEventListener("input", () => {
      $("#notes-status").textContent = writeValue("notes", notes.value)
        ? "Saved in this browser."
        : "Browser storage is unavailable. Keep this page open and copy your note before leaving.";
    });
  }
  if (app === "settings") {
    $<HTMLInputElement>("#settings-sound").checked = audio.enabled;
    $<HTMLInputElement>("#settings-sound").addEventListener("change", (e) =>
      setSound((e.target as HTMLInputElement).checked),
    );
    $("#reset-scores").addEventListener("click", () => {
      const success = devices
        .map((d) => writeValue(`score:${d.id}`, "0"))
        .every(Boolean);
      $("#settings-status").textContent = success
        ? "Game records reset. Your notes are unchanged."
        : "Storage is unavailable; records could not be reset.";
    });
  }
  if (app === "games") {
    const entry = $(".game-entry");
    body.prepend(entry);
    const best = $(".best-record");
    best.textContent = `Best on this browser: ${readScore(id)}`;
    $("[data-launch-game]").addEventListener("click", launchGame);
  }
  if (historyUpdate) setUrl(app, favorites);
  requestAnimationFrame(updatePage);
  body.focus({ preventScroll: true });
  void audio.play("action");
}
body.addEventListener("scroll", updatePage, { passive: true });
new ResizeObserver(updatePage).observe(body);
function scrollPage(direction: number) {
  body.scrollBy({
    top: direction * Math.max(40, body.clientHeight * 0.82),
    behavior: "auto",
  });
  requestAnimationFrame(updatePage);
}
$("#page-prev").addEventListener("click", () => scrollPage(-1));
$("#page-next").addEventListener("click", () => scrollPage(1));
$("#back-menu").addEventListener("click", () => {
  menu();
  screen.focus({ preventScroll: true });
});
root
  .querySelectorAll<HTMLButtonElement>("[data-open]")
  .forEach((b) =>
    b.addEventListener("click", () => openApp(b.dataset.open as AppId)),
  );
root.querySelectorAll<HTMLButtonElement>("[data-app]").forEach((button, i) => {
  button.addEventListener("click", () => {
    choose(i);
    if (id !== "psp") openApp(apps[i]);
  });
  button.addEventListener("keydown", (event) => {
    if (id === "psp" && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openXmb(subSelected);
    }
  });
  button.addEventListener("focus", () => choose(i));
});
function setOverlay(title: string, message: string, resumeLabel: string) {
  overlay.hidden = false;
  $("#game-heading").textContent = title;
  $("#game-message").textContent = message;
  $("#game-resume").textContent = resumeLabel;
  $<HTMLButtonElement>("#game-resume").disabled = false;
  $("#game-live").textContent = `${title}. ${message}`;
}
async function launchGame() {
  stopGame();
  const token = ++loadToken;
  view.hidden = true;
  launcher.hidden = true;
  gameView.hidden = false;
  root.classList.add("is-playing");
  setOverlay(device.game, "Loading…", "Loading…");
  $<HTMLButtonElement>("#game-resume").disabled = true;
  $("#game-restart").hidden = true;
  try {
    const module = await gameImports[id]();
    if (token !== loadToken) return;
    createGame = module.createGame;
    game = createGame();
    canvas.width = game.width;
    canvas.height = game.height;
    game.draw(ctx);
    $("#game-live").textContent = device.instructions;
    resume();
  } catch {
    if (token !== loadToken) return;
    setOverlay(
      "Could not load the game",
      "Check your connection, then exit and try again.",
      "Retry",
    );
    createGame = null;
    game = null;
  }
}
function renderLoop(time: number) {
  if (!game || paused) return;
  const dt = Math.min((time - last) / 1000, 1 / 30);
  last = time;
  game.update(dt, input);
  game.draw(ctx);
  if (game.status !== "playing") {
    paused = true;
    clearInput();
    const saved = saveScore(id, game.score);
    setOverlay(
      game.status === "won" ? "You did it!" : "Good game",
      `${game.message} Score: ${game.score}.${saved ? "" : " Score could not be saved in this browser."}`,
      "Play again",
    );
    $("#game-restart").hidden = true;
    $("#game-resume").focus({ preventScroll: true });
    return;
  }
  frame = requestAnimationFrame(renderLoop);
}
function resume() {
  if (!game) {
    void launchGame();
    return;
  }
  if (game.status !== "playing" && createGame) game = createGame();
  paused = false;
  overlay.hidden = true;
  clearInput();
  last = performance.now();
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(renderLoop);
  screen.focus({ preventScroll: true });
}
function pause() {
  if (!game || paused) return;
  paused = true;
  cancelAnimationFrame(frame);
  clearInput();
  audio.stop();
  setOverlay("Paused", "Take your time. Your game is right here.", "Resume");
  $("#game-restart").hidden = false;
}
$("#game-resume").addEventListener("click", resume);
$("#game-restart").addEventListener("click", () => {
  if (createGame) {
    game = createGame();
    resume();
  }
});
$("#game-exit").addEventListener("click", () => menu());
$("#game-pause").addEventListener("click", () => {
  pause();
  $("#game-resume").focus({ preventScroll: true });
});
function startup() {
  menu(false);
  setUrl(null);
  boot.hidden = false;
  void audio.play("boot");
  bootTimer = window.setTimeout(() => {
    boot.hidden = true;
  }, 1600);
}
$("#skip-boot").addEventListener("click", () => {
  clearTimeout(bootTimer);
  boot.hidden = true;
  audio.stop();
});
$("#power").addEventListener("click", startup);
$("#sound-toggle").addEventListener("click", () => {
  setSound(!audio.enabled);
  if (audio.enabled) void audio.play("boot");
});
$("#expand").addEventListener("click", () => {
  root.classList.toggle("expanded");
  $("#expand").textContent = root.classList.contains("expanded")
    ? "Show handheld"
    : "Expand screen";
  clearInput();
  requestAnimationFrame(updatePage);
});
function dispatch(action: Action) {
  if (action === "sound") {
    setSound(!audio.enabled);
    return;
  }
  if (action === "power") {
    startup();
    return;
  }
  if (action === "home") {
    menu();
    return;
  }
  if (!boot.hidden) {
    boot.hidden = true;
    clearTimeout(bootTimer);
    audio.stop();
    return;
  }
  if (game) {
    if (action === "start" || action === "select") {
      paused ? resume() : pause();
    } else if (paused && action === "action") resume();
    return;
  }
  if (currentApp) {
    if (action === "back") {
      menu();
      return;
    }
    if (["up", "l", "left"].includes(action)) scrollPage(-1);
    if (["down", "r", "right"].includes(action)) scrollPage(1);
    if (action === "action" && currentApp === "games") void launchGame();
    return;
  }
  if (action === "action") {
    id === "psp" ? openXmb(subSelected) : openApp(apps[selected]);
    return;
  }
  if (id === "psp" && (action === "up" || action === "down")) {
    subSelected =
      (subSelected +
        (action === "up" ? -1 : 1) +
        xmbLabels[apps[selected]].length) %
      xmbLabels[apps[selected]].length;
    renderXmb();
    void audio.play();
    return;
  }
  if (["up", "down", "left", "right", "l", "r"].includes(action)) {
    choose(
      nextSelection(
        selected,
        action,
        apps.length,
        id === "psp" || id === "switch" ? 1 : id === "ipod" ? 4 : 3,
      ),
    );
    void audio.play();
  }
}
root.querySelectorAll<HTMLButtonElement>("[data-input]").forEach((button) => {
  const action = button.dataset.input as Action;
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    button.classList.add("pressed");
    dispatch(action);
    input.press(`pointer:${e.pointerId}`, action);
  });
  const release = (e: PointerEvent) => {
    input.release(`pointer:${e.pointerId}`);
    button.classList.remove("pressed");
  };
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
  button.addEventListener("click", (e) => {
    if (e.detail === 0) dispatch(action);
  });
});
root.querySelectorAll<HTMLElement>("[data-analog]").forEach((stick) => {
  const knob = stick.querySelector<HTMLElement>("span")!;
  function move(e: PointerEvent) {
    const box = stick.getBoundingClientRect();
    const x = (e.clientX - box.left - box.width / 2) / (box.width / 2),
      y = (e.clientY - box.top - box.height / 2) / (box.height / 2);
    for (const axis of ["x", "y"])
      input.release(`analog:${e.pointerId}:${axis}`);
    if (Math.abs(x) > 0.25)
      input.press(`analog:${e.pointerId}:x`, x < 0 ? "left" : "right");
    if (Math.abs(y) > 0.25)
      input.press(`analog:${e.pointerId}:y`, y < 0 ? "up" : "down");
    knob.style.transform = `translate(${Math.max(-14, Math.min(14, x * 14))}%,${Math.max(-14, Math.min(14, y * 14))}%)`;
  }
  stick.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    stick.setPointerCapture(e.pointerId);
    move(e);
    if (!game)
      dispatch(
        Math.abs(input.x) >= Math.abs(input.y)
          ? input.x < 0
            ? "left"
            : "right"
          : input.y < 0
            ? "up"
            : "down",
      );
  });
  stick.addEventListener("pointermove", (e) => {
    if (stick.hasPointerCapture(e.pointerId)) move(e);
  });
  const end = (e: PointerEvent) => {
    input.release(`analog:${e.pointerId}:x`);
    input.release(`analog:${e.pointerId}:y`);
    knob.style.transform = "";
  };
  stick.addEventListener("pointerup", end);
  stick.addEventListener("pointercancel", end);
  stick.addEventListener("lostpointercapture", end);
});
if (id === "ipod") {
  const steer = (e: PointerEvent) => {
    if (!game || paused) return;
    const rect = canvas.getBoundingClientRect();
    input.press(
      `screen:${e.pointerId}`,
      e.clientX < rect.left + rect.width / 2 ? "left" : "right",
    );
  };
  canvas.addEventListener("pointerdown", (e) => {
    if (!game || paused) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    steer(e);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (canvas.hasPointerCapture(e.pointerId)) steer(e);
  });
  for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
    canvas.addEventListener(event, (e) =>
      input.release(`screen:${(e as PointerEvent).pointerId}`),
    );
}
function editing(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(target.closest("input,textarea,select,[contenteditable=true]"))
  );
}
document.addEventListener("keydown", (e) => {
  if (editing(e.target)) return;
  const action = keyMap[e.key] ?? keyMap[e.key.toLowerCase()];
  if (!action) return;
  // Let focused native links and buttons keep their expected Enter/Space activation.
  if (
    (e.key === "Enter" || e.key === " ") &&
    e.target instanceof HTMLElement &&
    e.target.closest("button,a")
  )
    return;
  if (e.key === "Escape" && game && !paused) {
    e.preventDefault();
    pause();
    return;
  }
  e.preventDefault();
  if (!e.repeat) dispatch(action);
  input.press(`key:${e.code}`, action);
});
document.addEventListener("keyup", (e) => input.release(`key:${e.code}`));
window.addEventListener("blur", () => {
  clearInput();
  pause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInput();
    pause();
    audio.stop();
  }
});
window.addEventListener("pagehide", () => {
  stopGame();
  clearInterval(clockTimer);
  clearTimeout(bootTimer);
});
function restoreUrl() {
  const app = new URL(location.href).searchParams.get("app");
  if (app && apps.includes(app as AppId))
    openApp(
      app as AppId,
      false,
      new URL(location.href).searchParams.get("view") === "favorites",
    );
  else menu(false);
}
window.addEventListener("popstate", restoreUrl);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    restoreUrl();
    updateClock();
    clearInterval(clockTimer);
    clockTimer = setInterval(updateClock, 60000);
  }
});
restoreUrl();
