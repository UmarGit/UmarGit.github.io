"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BuddySprite } from "./BuddySprite";
import { HEART, toPath } from "./pixels";
import { FEET, GRID, HANDS, type Expression, type Pose } from "./creature";
import { ABILITIES, pickAbility, type Ability, type Fx } from "./abilities";

/**
 * Qubi lives on the page.
 *
 * - Home: stands beside your name ([data-buddy-home]), waves hello, and hops
 *   onto whichever post shelf you hover ([data-buddy-perch]). If its perch
 *   scrolls away, it falls.
 * - Posts: hangs from the reading-progress bar ([data-buddy-bar]) and swings
 *   like a pendulum as the bar moves. At the end it lets go and celebrates.
 * - Everywhere: eyes follow the cursor, click to say hi, double-click for a
 *   trick, drag to throw, falls asleep when you're idle.
 * - Every so often it uses one of its abilities (./abilities), favouring the
 *   ones that match the topics of what you're looking at.
 *
 * One rAF loop moves a single DOM node; React only re-renders on face changes.
 */

const G = 2400; // gravity, px/s²
const SLEEP_AFTER_MS = 25_000;
const FLOOR_GAP = 6;
const PENDULUM_L = 70;
const FIRST_TRICK_MS = 7_000;
const GIGGLES = ["hehe!", "hey!", "that tickles!", "hi hi ♪", "♡", "boop!"];
const MUSINGS = ["ooh!", "interesting…", "hmm, hmm", "fascinating!", "for science ✦"];
const INTRO = "hi, I'm Qubi! welcome to Umar's lab notebook ✎";

type Surface = { kind: "el"; el: Element } | { kind: "floor" } | { kind: "hang" };
type Mode = "stand" | "hang" | "air" | "drag";
type Pt = { x: number; y: number };
type Particle = "heart" | "z" | "note" | "spark";

interface Hop {
  to: Surface;
  t: number; // starts negative: the crouch before take-off
  T: number;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  tx0: number;
  ty0: number;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const same = (a: Surface | null, b: Surface) =>
  !!a && a.kind === b.kind && (a.kind !== "el" || (b.kind === "el" && a.el === b.el));

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
}

function visible(el: Element) {
  if (!el.isConnected) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.top > 48 && r.top < window.innerHeight - 24;
}

class Interrupted extends Error {}

export default function Buddy() {
  const pathname = usePathname();
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const [cell, setCell] = useState(3.2);
  const [expr, setExpr] = useState<Expression>("open");
  const [pose, setPose] = useState<Pose>("idle");
  const [look, setLook] = useState<Pt>({ x: 0, y: 0 });
  const [fx, setFx] = useState<Fx>({});
  const [cursorOn, setCursorOn] = useState(true);
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null);
  const [bubbleLeft, setBubbleLeft] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [ready, setReady] = useState(false);

  const st = useRef({
    mode: "air" as Mode,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    surface: null as Surface | null,
    hop: null as Hop | null,
    theta: 0,
    omega: 0,
    pivotV: 0,
    sy: 1,
    sv: 0,
    cell: 3.2,
    reduced: false,
    started: false,
    greet: true,
    hovered: null as Element | null,
    pointer: { x: -9999, y: -9999 },
    lastActivity: 0,
    sleeping: false,
    nextZ: 0,
    flash: null as { expr: Expression; until: number } | null,
    blinkUntil: 0,
    nextBlink: 0,
    landedAt: 0,
    holdUntil: 0,
    celebrateOnLand: false,
    clicks: [] as number[],
    drag: null as null | {
      id: number;
      sx: number;
      sy: number;
      ox: number;
      oy: number;
      moving: boolean;
      lx: number;
      ly: number;
      lt: number;
      vx: number;
      vy: number;
    },
    expr: "open" as Expression,
    pose: "idle" as Pose,
    waveUntil: 0,
    look: { x: 0, y: 0 },
    bubbleLeft: false,
    bubbleSeq: 0,
    fx: {} as Fx,
    ability: null as null | { a: Ability; abort: () => void },
    nextTrick: 0,
    lastTrick: "",
  });

  // ---- helpers --------------------------------------------------------------

  const say = (text: string, ms = 2200) => {
    const s = st.current;
    const id = ++s.bubbleSeq;
    setBubble({ id, text });
    window.setTimeout(() => setBubble((b) => (b?.id === id ? null : b)), ms);
  };

  const flash = (e: Expression, ms: number) => {
    st.current.flash = { expr: e, until: performance.now() + ms };
  };

  const applyFx = (next: Fx) => {
    st.current.fx = next;
    setFx(next);
  };

  const half = () => FEET.x * st.current.cell;

  /** Feet position for el/floor surfaces, pivot (hands) position for hang. */
  const pointOf = (s: Surface): Pt => {
    const hw = half();
    const W = window.innerWidth;
    if (s.kind === "hang") {
      const bar = document.querySelector("[data-buddy-bar]");
      const r = bar?.getBoundingClientRect();
      const x = r ? r.left + scrollProgress() * r.width : 0;
      return { x: clamp(x, 28, W - 72), y: r ? r.bottom : 4 };
    }
    if (s.kind === "el") {
      const r = s.el.getBoundingClientRect();
      if (s.el.hasAttribute("data-buddy-home")) {
        // Beside the name's last line (it wraps on phones), on its baseline.
        const lines = s.el.getClientRects();
        const l = lines.length ? lines[lines.length - 1] : r;
        return { x: clamp(l.right + hw + 12, hw + 4, W - hw - 4), y: l.bottom - l.height * 0.16 };
      }
      return { x: clamp(r.right - 30, hw + 4, W - hw - 4), y: r.top };
    }
    return { x: clamp(st.current.x, hw + 8, W - hw - 8), y: window.innerHeight - FLOOR_GAP };
  };

  const desired = (): Surface => {
    const s = st.current;
    if (document.querySelector("[data-buddy-bar]")) {
      // Lets go at 98.5% (in the loop); climbs back up below 96%.
      return scrollProgress() >= 0.96 ? { kind: "floor" } : { kind: "hang" };
    }
    const el = s.hovered ?? document.querySelector("[data-buddy-home]");
    if (el && visible(el)) return { kind: "el", el };
    return { kind: "floor" };
  };

  const pivotToFeet = (p: Pt): Pt => {
    const c = st.current.cell;
    return { x: p.x + (FEET.x - HANDS.x) * c, y: p.y + (FEET.y - HANDS.y) * c };
  };
  const feet = (): Pt => {
    const s = st.current;
    return s.mode === "hang" ? pivotToFeet(s) : { x: s.x, y: s.y };
  };
  /** Centre of the face, in viewport px. */
  const face = (): Pt => {
    const f = feet();
    return { x: f.x, y: f.y - (FEET.y - 7) * st.current.cell };
  };

  const spawn = (kind: Particle, n = 1) => {
    const layer = layerRef.current;
    if (!layer) return;
    const f = feet();
    const top = f.y - FEET.y * st.current.cell;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("span");
      el.className = `buddy-particle buddy-${kind}`;
      el.style.left = `${f.x + (Math.random() - 0.5) * 34}px`;
      el.style.top = `${top + (Math.random() - 0.5) * 10}px`;
      el.style.setProperty("--dx", `${(Math.random() - 0.5) * 50}px`);
      el.style.animationDelay = `${i * 90}ms`;
      if (kind === "heart") {
        el.innerHTML = `<svg width="15" height="12" viewBox="0 0 5 4" shape-rendering="crispEdges"><path d="${toPath(
          HEART
        )}" fill="#ff6f91"/></svg>`;
      } else {
        el.textContent = kind === "z" ? "z" : kind === "spark" ? "✦" : "♪";
      }
      el.addEventListener("animationend", () => el.remove());
      layer.appendChild(el);
    }
  };

  // ---- abilities ------------------------------------------------------------

  const topicsHere = (): string[] => {
    const s = st.current;
    const src =
      (s.surface?.kind === "el" && s.surface.el.getAttribute("data-buddy-topics")) ||
      document.querySelector("[data-buddy-topics]")?.getAttribute("data-buddy-topics") ||
      "";
    return src ? src.split("|") : [];
  };

  const stopAbility = () => {
    const s = st.current;
    s.ability?.abort();
    s.ability = null;
    applyFx({});
  };

  const runAbility = (a: Ability) => {
    const s = st.current;
    if (s.ability) return;
    let cancelled = false;
    const timers = new Set<number>();
    const rejecters = new Set<(e: Error) => void>();
    const abort = () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      rejecters.forEach((r) => r(new Interrupted()));
    };
    s.ability = { a, abort };
    s.sleeping = false;
    const ctx = {
      fx: (next: Fx) => {
        if (!cancelled) applyFx(next);
      },
      say: (text: string, ms?: number) => {
        if (!cancelled) say(text, ms);
      },
      sparkle: (kind: "spark" | "heart" | "note", n?: number) => {
        if (!cancelled) spawn(kind, n);
      },
      wait: (ms: number) =>
        new Promise<void>((resolve, reject) => {
          if (cancelled) return reject(new Interrupted());
          rejecters.add(reject);
          const t = window.setTimeout(() => {
            timers.delete(t);
            rejecters.delete(reject);
            resolve();
          }, ms);
          timers.add(t);
        }),
      pointerNear: (px: number) => {
        const f = face();
        return Math.hypot(s.pointer.x - f.x, s.pointer.y - f.y) < px;
      },
    };
    a.run(ctx)
      .catch((e) => {
        if (!(e instanceof Interrupted)) console.error(e);
      })
      .finally(() => {
        if (s.ability?.a === a) {
          s.ability = null;
          applyFx({});
          s.nextTrick = performance.now() + 16_000 + Math.random() * 16_000;
        }
      });
  };

  // ---- state transitions ----------------------------------------------------

  const land = (to: Surface, impact: number) => {
    const s = st.current;
    const p = pointOf(to);
    s.hop = null;
    s.surface = to;
    s.landedAt = performance.now();
    if (to.kind === "hang") {
      s.mode = "hang";
      s.x = p.x;
      s.y = p.y;
      s.theta = clamp(s.vx / 900, -0.8, 0.8);
      s.omega = 0;
      s.pivotV = 0;
    } else {
      s.mode = "stand";
      s.x = p.x; // for the floor, pointOf() keeps the current x
      s.y = p.y;
    }
    s.vx = 0;
    s.vy = 0;
    s.sy = 1 - clamp(impact / 3200, 0.08, 0.32);
    s.sv = 0;
    if (impact > 1500) {
      flash("dizzy", 1300);
      say("@_@");
    }
    if (s.celebrateOnLand) {
      s.celebrateOnLand = false;
      flash("happy", 2200);
      s.waveUntil = performance.now() + 2200;
      spawn("spark", 5);
      say("eureka! thanks for reading ✦", 3200);
    } else if (s.greet) {
      s.greet = false;
      s.waveUntil = performance.now() + 2600;
      say(INTRO, 3800);
    } else if (to.kind === "el" && to.el.hasAttribute("data-buddy-perch") && Math.random() < 0.35) {
      say(MUSINGS[Math.floor(Math.random() * MUSINGS.length)], 1500);
    }
  };

  const startHop = (to: Surface) => {
    const s = st.current;
    const from = feet();
    const target = to.kind === "hang" ? pivotToFeet(pointOf(to)) : pointOf(to);
    if (s.reduced) {
      s.x = from.x;
      land(to, 0);
      return;
    }
    const dist = Math.hypot(target.x - from.x, target.y - from.y);
    const T = clamp(0.38 + dist / 2200, 0.38, 0.85);
    s.mode = "air";
    s.surface = null;
    s.x = from.x;
    s.y = from.y;
    s.hop = {
      to,
      t: -0.09,
      T,
      x0: from.x,
      y0: from.y,
      vx: (target.x - from.x) / T,
      vy: (target.y - from.y - 0.5 * G * T * T) / T,
      tx0: target.x,
      ty0: target.y,
    };
    s.sy = 0.8; // crouch
    s.sv = 0;
  };

  const release = (vx: number, vy: number) => {
    const s = st.current;
    const f = feet();
    s.mode = "air";
    s.surface = null;
    s.hop = null;
    s.x = f.x;
    s.y = f.y;
    s.vx = vx;
    s.vy = vy;
  };

  const pet = () => {
    const s = st.current;
    const now = performance.now();
    s.clicks = [...s.clicks.filter((t) => now - t < 2000), now];
    if (s.clicks.length >= 6) {
      s.clicks = [];
      flash("dizzy", 1500);
      say("too much! @_@");
      return;
    }
    flash(Math.random() < 0.5 ? "love" : "happy", 1100);
    s.waveUntil = now + 900;
    say(GIGGLES[Math.floor(Math.random() * GIGGLES.length)], 1400);
    spawn("heart", 3);
    s.sy = 0.72;
    s.sv = 0;
    if (s.mode === "hang") s.omega += (Math.random() < 0.5 ? -1 : 1) * 4;
    else if (s.mode === "stand" && !s.reduced && !s.ability) {
      // A happy little jump in place; it lands back on the same surface.
      const back = s.surface!;
      s.hop = { to: back, t: -0.05, T: 0.34, x0: s.x, y0: s.y, vx: 0, vy: -0.5 * G * 0.34, tx0: s.x, ty0: s.y };
      s.mode = "air";
      s.surface = null;
    }
  };

  // ---- main loop ------------------------------------------------------------

  useEffect(() => {
    const s = st.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    s.reduced = mq.matches;
    const onMq = () => (s.reduced = mq.matches);
    mq.addEventListener("change", onMq);

    const sizeUp = () => {
      const c = window.innerWidth < 640 ? 2.6 : 3.2;
      s.cell = c;
      setCell(c);
      setNarrow(window.innerWidth < 640);
    };
    sizeUp();
    window.addEventListener("resize", sizeUp);

    const t0 = performance.now();
    s.lastActivity = t0;
    s.nextBlink = t0 + 2500;
    s.nextTrick = t0 + FIRST_TRICK_MS;

    // The token cursor blinks.
    const cursorTimer = window.setInterval(() => setCursorOn((v) => !v), 420);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const c = s.cell;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const floorY = H - FLOOR_GAP;
      const hw = half();

      // Entrance: swing in on posts, pop up beside your name at home.
      if (!s.started) {
        s.started = true;
        const d = desired();
        if (d.kind === "hang") {
          const p = pointOf(d);
          Object.assign(s, { mode: "hang", surface: d, x: p.x, y: p.y, theta: s.reduced ? 0 : 1.1, omega: 0 });
          s.greet = false;
          window.setTimeout(() => say("hi! reading along ♪", 1800), 500);
        } else if (d.kind === "el") {
          s.x = pointOf(d).x;
          land(d, 0);
          s.sy = 0.4;
          s.sv = 0;
        } else {
          Object.assign(s, { mode: "air", x: W - 60, y: -40, vx: 0, vy: 0 });
          if (s.reduced) land(d, 0);
        }
        setReady(true);
      }

      // -- physics per mode --
      if (s.mode === "stand") {
        const surf = s.surface!;
        if (surf.kind === "el" && !visible(surf.el)) {
          release(0, 0); // perch scrolled away: fall
        } else {
          const p = pointOf(surf);
          s.x = surf.kind === "el" ? p.x : clamp(s.x, hw + 8, W - hw - 8);
          s.y = p.y;
          if (!s.drag && now > s.holdUntil && now - s.landedAt > 380) {
            const d = desired();
            if (!same(surf, d)) startHop(d);
          }
        }
      } else if (s.mode === "hang") {
        if (!document.querySelector("[data-buddy-bar]")) {
          release(0, 0);
        } else if (scrollProgress() >= 0.985) {
          s.celebrateOnLand = true;
          release(s.pivotV * 0.4, -260);
        } else {
          const p = pointOf({ kind: "hang" });
          const nx = s.x + (p.x - s.x) * (1 - Math.exp(-dt * 10));
          const v = dt > 0 ? (nx - s.x) / dt : 0;
          const ax = clamp(dt > 0 ? (v - s.pivotV) / dt : 0, -9000, 9000);
          s.pivotV = v;
          s.x = nx;
          s.y = p.y;
          if (s.reduced) {
            s.theta = 0;
          } else {
            const alpha =
              -(G / PENDULUM_L) * Math.sin(s.theta) - (ax / PENDULUM_L) * Math.cos(s.theta) - 1.7 * s.omega;
            s.omega += alpha * dt;
            s.theta = clamp(s.theta + s.omega * dt, -1.3, 1.3);
          }
        }
      } else if (s.mode === "air") {
        if (s.hop) {
          const h = s.hop;
          h.t += dt;
          if (h.t >= 0) {
            if (h.t - dt < 0) {
              s.sy = 1.16; // stretch on take-off
              s.sv = 0;
            }
            const cur = h.to.kind === "hang" ? pivotToFeet(pointOf(h.to)) : pointOf(h.to);
            const k = Math.min(1, h.t / h.T);
            s.x = h.x0 + h.vx * h.t + (cur.x - h.tx0) * k;
            s.y = h.y0 + h.vy * h.t + 0.5 * G * h.t * h.t + (cur.y - h.ty0) * k;
            if (h.t >= h.T) {
              s.vx = h.vx;
              // A planned hop is never a crash landing: cap the squash, no dizzies.
              land(h.to, Math.min(1100, Math.abs(h.vy + G * h.T)));
            }
          }
        } else if (s.reduced) {
          land(desired(), 0);
        } else {
          const prevY = s.y;
          s.vy += G * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.x < hw) {
            s.x = hw;
            s.vx = Math.abs(s.vx) * 0.5;
          } else if (s.x > W - hw) {
            s.x = W - hw;
            s.vx = -Math.abs(s.vx) * 0.5;
          }
          // Bonk on the top of the screen instead of flying off it.
          const ceiling = FEET.y * c + 2;
          if (s.y < ceiling && s.vy < 0) {
            s.y = ceiling;
            s.vy = -s.vy * 0.3;
            s.sy = 1.25;
            s.sv = 0;
            if (Math.abs(s.vx) + Math.abs(s.vy) > 600) say("bonk!", 900);
          }
          // Land on any post shelf we fall onto.
          let landed = false;
          if (s.vy > 0) {
            for (const el of document.querySelectorAll("[data-buddy-perch]")) {
              const r = el.getBoundingClientRect();
              if (r.top > 48 && prevY <= r.top + 1 && s.y >= r.top && s.x > r.left + 12 && s.x < r.right - 12) {
                const impact = s.vy;
                s.y = r.top;
                land({ kind: "el", el }, impact);
                landed = true;
                break;
              }
            }
          }
          if (!landed && s.y >= floorY) {
            s.y = floorY;
            if (s.vy > 900) {
              s.vy = -s.vy * 0.32; // bounce
              s.vx *= 0.6;
              s.sy = 0.7;
              s.sv = 0;
            } else {
              land({ kind: "floor" }, s.vy);
            }
          }
        }
      }

      if (s.mode !== "hang") {
        s.theta *= Math.exp(-dt * 10);
        s.omega = 0;
      }

      // Squash & stretch spring.
      s.sv += (-(s.sy - 1) * 520 - s.sv * 13) * dt;
      s.sy += s.sv * dt;

      // -- mood --
      const settled = s.mode === "stand" || s.mode === "hang";
      if (!s.sleeping && !s.ability && now - s.lastActivity > SLEEP_AFTER_MS && settled) {
        s.sleeping = true;
        s.nextZ = now;
      }
      if (s.sleeping && now >= s.nextZ) {
        spawn("z");
        s.nextZ = now + 1600;
      }
      if (now >= s.nextBlink) {
        s.blinkUntil = now + 130;
        s.nextBlink = now + 2200 + Math.random() * 3800;
        if (Math.random() < 0.2) s.nextBlink = now + 260; // double blink
      }
      if (!s.ability && !s.sleeping && !s.drag && settled && now >= s.nextTrick && now - s.landedAt > 800) {
        runAbility(pickAbility(topicsHere()));
      }

      const f = s.fx;
      let e: Expression = "open";
      if (s.flash && now < s.flash.until) e = s.flash.expr;
      else if (f.expression) e = f.expression;
      else if (s.mode === "drag") e = "surprised";
      else if (s.mode === "air" && !s.hop && Math.hypot(s.vx, s.vy) > 1000) e = "surprised";
      else if (s.sleeping) e = "sleep";
      else if (now < s.blinkUntil) e = "blink";

      let p: Pose = "idle";
      const onPerch = s.mode === "stand" && s.surface?.kind === "el" && s.surface.el.hasAttribute("data-buddy-perch");
      if (s.mode === "hang" || s.mode === "drag" || s.mode === "air") p = "hang";
      else if (now < s.waveUntil) p = "wave";
      if (onPerch && e === "open") e = "focus";
      if (p !== s.pose) {
        s.pose = p;
        setPose(p);
      }
      if (e !== s.expr) {
        s.expr = e;
        setExpr(e);
      }

      const fc = face();
      const rl = f.look ?? {
        x: Math.round(clamp((s.pointer.x - fc.x) / 160, -1, 1)),
        y: Math.round(clamp((s.pointer.y - fc.y) / 160, -1, 1)),
      };
      if (rl.x !== s.look.x || rl.y !== s.look.y) {
        s.look = rl;
        setLook(rl);
      }
      const bl = fc.x > W - 260;
      if (bl !== s.bubbleLeft) {
        s.bubbleLeft = bl;
        setBubbleLeft(bl);
      }

      // -- draw --
      const outer = outerRef.current;
      const inner = innerRef.current;
      if (outer && inner) {
        const hanging = s.mode === "hang";
        const ax = hanging ? HANDS.x : FEET.x;
        const ay = hanging ? HANDS.y : FEET.y;
        outer.style.transform = `translate3d(${s.x - ax * c}px, ${s.y - ay * c}px, 0)`;
        const breathe = s.reduced || s.mode === "air" ? 0 : Math.sin(now / 420) * 0.025;
        const sy = s.sy + breathe;
        const sx = 1 + (1 - s.sy) * 0.85;
        inner.style.transformOrigin = `${ax * c}px ${ay * c}px`;
        // Phones: the bubble sits above Qubi, centred but kept on screen.
        const bub = bubbleRef.current;
        if (bub && W < 640) {
          const left = s.x - ax * c;
          const bw = bub.offsetWidth;
          const want = (GRID.w * c - bw) / 2;
          bub.style.left = `${clamp(want, 12 - left, W - 12 - bw - left)}px`;
          bub.style.right = "auto";
        }
        inner.style.transform = `rotate(${(s.theta * 180) / Math.PI}deg) scale(${sx}, ${sy})`;
      }
    };
    raf = requestAnimationFrame(frame);

    // -- page events --
    const wake = () => {
      s.lastActivity = performance.now();
      if (s.sleeping) {
        s.sleeping = false;
        flash("surprised", 600);
        say("oh! hi ♪", 1400);
      }
    };
    const onMove = (e: PointerEvent) => {
      s.pointer = { x: e.clientX, y: e.clientY };
      wake();
      const d = s.drag;
      if (!d || e.pointerId !== d.id) return;
      if (!d.moving && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 5) {
        d.moving = true;
        stopAbility();
        s.theta = 0;
        s.mode = "drag"; // anchor is now the feet, even if we were hanging
        s.hop = null;
        s.surface = null;
        s.sleeping = false;
      }
      if (d.moving) {
        const t = performance.now();
        const ddt = Math.max(1, t - d.lt) / 1000;
        d.vx = d.vx * 0.6 + ((e.clientX - d.lx) / ddt) * 0.4;
        d.vy = d.vy * 0.6 + ((e.clientY - d.ly) / ddt) * 0.4;
        d.lx = e.clientX;
        d.ly = e.clientY;
        d.lt = t;
        s.x = e.clientX + d.ox;
        s.y = e.clientY + d.oy;
      }
    };
    const onUp = (e: PointerEvent) => {
      const d = s.drag;
      if (!d || e.pointerId !== d.id) return;
      s.drag = null;
      if (d.moving) {
        release(clamp(d.vx, -2600, 2600), clamp(d.vy, -2600, 2600));
        s.holdUntil = performance.now() + 2600; // stay where thrown for a bit
        if (Math.hypot(d.vx, d.vy) > 900) say("wheee!", 1200);
      } else if (petTimer) {
        // Second click: it's a double-click, which runs a trick instead.
        window.clearTimeout(petTimer);
        petTimer = 0;
      } else {
        petTimer = window.setTimeout(() => {
          petTimer = 0;
          pet();
        }, 240);
      }
    };
    let petTimer = 0;
    let leaveTimer = 0;
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element | null)?.closest?.("[data-buddy-perch]") ?? null;
      if (el) {
        window.clearTimeout(leaveTimer);
        s.hovered = el;
      } else if (s.hovered) {
        window.clearTimeout(leaveTimer);
        leaveTimer = window.setTimeout(() => (s.hovered = null), 700);
      }
    };
    const onCopy = () => {
      flash("happy", 1200);
      say("copied! ✓", 1400);
    };
    let savedTitle = "";
    const onVis = () => {
      if (document.hidden) {
        savedTitle = document.title;
        document.title = "come back? (｡•́︿•̀｡)";
      } else {
        if (savedTitle) document.title = savedTitle;
        flash("happy", 1400);
        say("yay, you're back!", 1800);
        s.lastActivity = performance.now();
        s.sleeping = false;
      }
    };
    const onTheme = (e: Event) => {
      const dark = (e as CustomEvent<string>).detail === "dark";
      flash(dark ? "sleep" : "surprised", 900);
      say(dark ? "lights off… ☾" : "so bright! ☀", 1600);
      s.lastActivity = performance.now();
      s.sleeping = false;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("keydown", wake);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("copy", onCopy);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("buddy:theme", onTheme);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(cursorTimer);
      st.current.ability?.abort();
      mq.removeEventListener("change", onMq);
      window.removeEventListener("resize", sizeUp);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("buddy:theme", onTheme);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(petTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // New page: forget hover and any running trick. The loop notices a vanished
  // perch or a new progress bar on its own and moves Qubi there.
  useEffect(() => {
    st.current.hovered = null;
    stopAbility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const s = st.current;
    const f = feet();
    s.drag = {
      id: e.pointerId,
      sx: e.clientX,
      sy: e.clientY,
      ox: f.x - e.clientX,
      oy: f.y - e.clientY,
      moving: false,
      lx: e.clientX,
      ly: e.clientY,
      lt: performance.now(),
      vx: 0,
      vy: 0,
    };
  };

  const onDoubleClick = () => {
    const s = st.current;
    if (s.ability) return;
    // Cycle through tricks so a curious visitor sees them all.
    const i = (ABILITIES.findIndex((a) => a.id === s.lastTrick) + 1) % ABILITIES.length;
    s.lastTrick = ABILITIES[i].id;
    runAbility(ABILITIES[i]);
  };

  const sprite = (extra?: { glitch?: number }) => (
    <BuddySprite
      cell={cell}
      pose={pose}
      expression={expr}
      look={look}
      glitch={extra?.glitch ?? fx.glitch ?? 0}
      cursorOn={cursorOn}
    />
  );

  return (
    <div aria-hidden className="buddy-root">
      <div ref={layerRef} className="buddy-layer" />
      <div ref={outerRef} className="buddy-outer" style={{ opacity: ready ? 1 : 0 }}>
        <div
          ref={innerRef}
          className={`buddy-inner ${fx.glitch ? "is-glitch" : ""} ${fx.tint === "teal" ? "is-teal" : ""}`}
          onPointerDown={onPointerDown}
          onDoubleClick={onDoubleClick}
          title="Qubi (click to say hi, double-click for a trick, drag to throw)"
        >
          {fx.ghosts && (
            <>
              <div className="buddy-ghost buddy-ghost-0" style={{ "--off": `${-5 * cell}px` } as React.CSSProperties}>
                {sprite()}
              </div>
              <div className="buddy-ghost buddy-ghost-1" style={{ "--off": `${5 * cell}px` } as React.CSSProperties}>
                {sprite()}
              </div>
            </>
          )}
          <div className={fx.ghosts ? "buddy-body is-superposed" : "buddy-body"}>{sprite()}</div>
          {pose !== "hang" && (
            <span
              className="buddy-bit"
              style={{ left: 7 * cell, top: -2.5 * cell, width: 2 * cell, height: 2 * cell }}
            />
          )}
        </div>
        {(bubble || fx.tokens) && (
          <div
            key={fx.tokens ? "tokens" : bubble!.id}
            ref={bubbleRef}
            className={`buddy-bubble ${bubbleLeft ? "buddy-bubble-left" : ""} ${narrow ? "buddy-bubble-above" : ""}`}
            style={
              narrow
                ? undefined // phones: above Qubi; horizontal position is set in the loop
                : bubbleLeft
                  ? { right: `${(GRID.w - 1) * cell}px` }
                  : { left: `${(GRID.w - 1) * cell}px` }
            }
          >
            {fx.tokens ? (
              <span className="buddy-tokens">
                {fx.tokens.map((t, i) => (
                  <span key={i} className={`buddy-token buddy-token-${i % 4}`}>
                    {t.replace(/ /g, "␣")}
                  </span>
                ))}
              </span>
            ) : (
              bubble!.text
            )}
          </div>
        )}
      </div>
    </div>
  );
}
