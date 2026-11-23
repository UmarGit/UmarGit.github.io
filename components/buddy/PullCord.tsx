"use client";

import { useEffect, useRef, useState } from "react";
import { currentTheme, toggleTheme, type Theme } from "@/lib/theme";
import { toPath, type Px } from "./pixels";

/** A pixel light bulb on a string. Pull it (or click it) to switch the lights. */

// Hangs from its base, like a lamp.
const BASE: Px[] = [
  [1, 0], [2, 0], [3, 0],
  [1, 1], [2, 1], [3, 1],
];
const GLASS: Px[] = [
  [1, 2], [2, 2], [3, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3],
  [0, 4], [1, 4], [2, 4], [3, 4], [4, 4],
  [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
  [1, 6], [2, 6], [3, 6],
];
const SHINE: Px[] = [[1, 3], [1, 4]];

/** One-cell outline around the whole lamp so it reads on a white page. */
const OUTLINE: Px[] = (() => {
  const all = new Set([...BASE, ...GLASS].map(([x, y]) => `${x},${y}`));
  const out = new Map<string, Px>();
  for (const k of all) {
    const [x, y] = k.split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = `${x + dx},${y + dy}`;
      if (!all.has(n) && y + dy >= 0) out.set(n, [x + dx, y + dy]);
    }
  }
  return [...out.values()];
})();

const REST = 40; // string length at rest, px
const MAX_PULL = 56;
const TRIGGER = 16;

export default function PullCord() {
  const [theme, setTheme] = useState<Theme>("light");
  const [pull, setPull] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ id: number; y0: number; moved: boolean } | null>(null);

  useEffect(() => setTheme(currentTheme()), []);

  const flip = () => setTheme(toggleTheme());

  const onDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, y0: e.clientY, moved: false };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dy = Math.max(0, e.clientY - d.y0);
    if (dy > 3) d.moved = true;
    // Rubber band: the further you pull, the harder it gets.
    setPull(MAX_PULL * (1 - Math.exp(-dy / MAX_PULL)));
  };
  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (!d.moved || pull > TRIGGER) flip();
    setPull(0); // springs back (CSS transition)
  };

  const lit = theme === "dark";

  return (
    <div className="pullcord">
      <div className={`pullcord-sway ${dragging ? "is-dragging" : ""}`}>
        <div
          className="pullcord-string"
          style={{
            height: REST + pull,
            transition: dragging ? "none" : "height 520ms cubic-bezier(.3,1.9,.5,1)",
          }}
        />
        <button
          type="button"
          className={`pullcord-bulb ${lit ? "is-lit" : ""}`}
          aria-label={lit ? "Turn the lights on (light mode)" : "Turn the lights off (dark mode)"}
          aria-pressed={lit}
          title="pull me"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={(e) => {
            // Keyboard activation (Enter/Space) has detail 0; pointer
            // presses are handled in onPointerUp.
            if (e.detail === 0) flip();
          }}
        >
          <svg width="21" height="24" viewBox="-1 0 7 8" shapeRendering="crispEdges" aria-hidden>
            <path d={toPath(OUTLINE)} fill="#2b2638" />
            <path d={toPath(GLASS)} fill={lit ? "#f2c46b" : "#fbf9f4"} />
            <path d={toPath(SHINE)} fill="#ffffff" opacity={lit ? 0.9 : 0.7} />
            <path d={toPath(BASE)} fill={lit ? "#9a8fa6" : "#7d7287"} />
          </svg>
        </button>
      </div>
    </div>
  );
}
