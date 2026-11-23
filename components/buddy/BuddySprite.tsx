import { memo } from "react";
import { GRID, sprite, type Expression, type Pose } from "./creature";

interface Props {
  /** CSS px per grid cell. */
  cell: number;
  pose: Pose;
  expression: Expression;
  look: { x: number; y: number };
  glitch?: number;
  cursorOn?: boolean;
}

/** Pure render of Qubi: one <path> per colour, later cells win. */
export const BuddySprite = memo(function BuddySprite({
  cell,
  pose,
  expression,
  look,
  glitch = 0,
  cursorOn = true,
}: Props) {
  const last = new Map<string, string>();
  for (const [x, y, c] of sprite(pose, expression, { look, glitch, cursorOn })) last.set(`${x},${y}`, c);
  const byColor = new Map<string, string[]>();
  for (const [k, c] of last) {
    const [x, y] = k.split(",");
    if (!byColor.has(c)) byColor.set(c, []);
    byColor.get(c)!.push(`M${x} ${y}h1v1h-1z`);
  }
  return (
    <svg
      width={GRID.w * cell}
      height={GRID.h * cell}
      viewBox={`0 0 ${GRID.w} ${GRID.h}`}
      shapeRendering="crispEdges"
      style={{ display: "block", overflow: "visible" }}
    >
      {[...byColor].map(([c, d]) => (
        <path key={c} d={d.join("")} fill={c} />
      ))}
    </svg>
  );
});
