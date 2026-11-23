/** Small helpers shared by the site's pixel art. */
export type Px = readonly [number, number];

/** Cells → one SVG path ("M x y h1 v1 h-1 z" per cell). */
export const toPath = (cells: readonly Px[]) =>
  cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("");

/** Parse an ASCII map into cells per character (ignores "."). */
export function grid(rows: readonly string[]): Map<string, Px[]> {
  const out = new Map<string, Px[]>();
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === ".") return;
      if (!out.has(ch)) out.set(ch, []);
      out.get(ch)!.push([x, y]);
    })
  );
  return out;
}

/** Pixel heart for floating particles (5×4). */
export const HEART: Px[] = [
  [1, 0], [3, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1],
  [1, 2], [2, 2], [3, 2],
  [2, 3],
];
