/**
 * Qubi: the site's resident. A soft violet square (16×16, 1:1) with a single
 * floating "bit" above its head. Its abilities (qubit, token, glitch) are
 * effects layered on this one body by <Buddy/>.
 *
 * Legend:  O outline · V body · h highlight · s shade · b blush
 */

export type Pose = "idle" | "hang" | "wave";
export type Expression =
  | "open"
  | "blink"
  | "happy"
  | "love"
  | "sleep"
  | "surprised"
  | "dizzy"
  | "focus"
  | "cursor";
export type Cell = readonly [x: number, y: number, color: string];

export const GRID = { w: 16, h: 16 } as const;

export const PALETTE: Record<string, string> = {
  O: "#2a1f4d",
  V: "#7c5cff",
  h: "#ab97ff",
  s: "#6145e6",
  b: "#ff8fc8",
  E: "#1b1433",
  W: "#ffffff",
  M: "#1b1433",
};

const BODY = [
  "................",
  "................",
  "..OOOOOOOOOOOO..",
  ".OVVVVVVVVVVVVO.",
  ".OVhhVVVVVVVVVO.",
  ".OVhVVVVVVVVVVO.",
  ".OVVVVVVVVVVVVO.",
  ".OVVVVVVVVVVVVO.",
  ".OVVVVVVVVVVVVO.",
  ".ObbVVVVVVVVbbO.",
  ".OVVVVVVVVVVVVO.",
  ".OVVVVVVVVVVVVO.",
  ".OssssssssssssO.",
  "..OOOOOOOOOOOO..",
  "...OOO....OOO...",
  "................",
];

function parse(rows: string[]): Cell[] {
  const out: Cell[] = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== ".") out.push([x, y, PALETTE[ch]]);
    })
  );
  return out;
}

const BASE = parse(BODY);
const O = PALETTE.O;
const V = PALETTE.V;
// Little nub arms. Raised: gripping something overhead.
const ARMS_UP: Cell[] = [
  [2, 1, O], [2, 0, O], [3, 1, V], [3, 0, O], [4, 1, O],
  [13, 1, O], [13, 0, O], [12, 1, V], [12, 0, O], [11, 1, O],
];
const WAVE: Cell[] = [
  [14, 4, O], [15, 3, O], [15, 2, O], [14, 2, V], [14, 1, O], [13, 1, O], [15, 4, O],
];

const EYE_L = 4;
const EYE_R = 10;

function eyes(expr: Expression, look: { x: number; y: number }): Cell[] {
  const E = PALETTE.E;
  const W = PALETTE.W;
  const dx = Math.max(-1, Math.min(1, Math.round(look.x)));
  const dy = look.y < -0.5 ? -1 : 0;
  const both = (f: (x0: number) => Cell[]) => [...f(EYE_L), ...f(EYE_R)];
  switch (expr) {
    case "open":
    case "cursor":
      return both((x) => {
        const x0 = x + dx;
        const y0 = 6 + dy;
        return [
          [x0, y0, W], [x0 + 1, y0, E],
          [x0, y0 + 1, E], [x0 + 1, y0 + 1, E],
          [x0, y0 + 2, E], [x0 + 1, y0 + 2, E],
        ];
      });
    case "focus":
      return both((x) => [[x, 7, E], [x + 1, 7, E], [x, 8, E], [x + 1, 8, E]]);
    case "surprised":
      return both((x) => [
        [x, 5, W], [x + 1, 5, E],
        [x, 6, E], [x + 1, 6, E],
        [x, 7, E], [x + 1, 7, E],
        [x, 8, E], [x + 1, 8, E],
      ]);
    case "blink":
      return both((x) => [[x, 8, E], [x + 1, 8, E]]);
    case "sleep":
      return both((x) => [[x - 1, 8, E], [x, 8, E], [x + 1, 8, E], [x + 2, 8, E]]);
    case "happy":
      return both((x) => [[x, 6, E], [x + 1, 6, E], [x - 1, 7, E], [x + 2, 7, E]]);
    case "love":
      return both((x) => [
        [x - 1, 6, PALETTE.b], [x + 2, 6, PALETTE.b],
        [x - 1, 7, PALETTE.b], [x, 7, PALETTE.b], [x + 1, 7, PALETTE.b], [x + 2, 7, PALETTE.b],
        [x, 8, PALETTE.b], [x + 1, 8, PALETTE.b],
      ]);
    case "dizzy":
      return both((x) => [[x - 1, 6, E], [x + 2, 6, E], [x, 7, E], [x + 1, 7, E], [x - 1, 8, E], [x + 2, 8, E]]);
  }
}

function mouth(expr: Expression, cursorOn: boolean): Cell[] {
  const M = PALETTE.M;
  switch (expr) {
    case "happy":
    case "love":
      return [[6, 10, M], [7, 10, M], [8, 10, M], [9, 10, M], [7, 11, M], [8, 11, M]];
    case "surprised":
    case "dizzy":
      return [[7, 10, M], [8, 10, M], [7, 11, M], [8, 11, M]];
    case "sleep":
      return [[7, 11, M], [8, 11, M]];
    case "cursor":
      // A blinking text cursor where the mouth goes: it is "typing".
      return cursorOn ? [[7, 10, PALETTE.W], [7, 11, PALETTE.W]] : [];
    default:
      return [[6, 10, M], [7, 11, M], [8, 11, M], [9, 10, M]];
  }
}

export interface SpriteOpts {
  look?: { x: number; y: number };
  /** Glitch: shift rows 5–8 sideways by this many cells. */
  glitch?: number;
  cursorOn?: boolean;
}

export function sprite(pose: Pose, expr: Expression, opts: SpriteOpts = {}): Cell[] {
  let cells: Cell[] = [...BASE];
  if (pose === "hang") cells.push(...ARMS_UP);
  if (pose === "wave") cells.push(...WAVE);
  cells.push(...eyes(expr, opts.look ?? { x: 0, y: 0 }), ...mouth(expr, opts.cursorOn ?? true));
  const g = opts.glitch ?? 0;
  if (g) cells = cells.map(([x, y, c]) => (y >= 5 && y <= 8 ? ([x + g, y, c] as Cell) : [x, y, c]));
  return cells;
}

/** Anchors in cell-edge coordinates. */
export const FEET = { x: 8, y: 15 } as const;
export const HANDS = { x: 8, y: 0 } as const;
