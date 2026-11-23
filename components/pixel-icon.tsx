import { grid } from "@/components/buddy/pixels";

/**
 * 9×9 pixel topic icons, picked from a post's tags. "x" is drawn in the
 * current text colour so it follows light/dark mode; the rest are accents.
 */
const ICONS: Record<string, { rows: string[]; colors: Record<string, string> }> = {
  qubit: {
    rows: [
      "....a....",
      "...aaa...",
      "..xxaxx..",
      ".x..a..x.",
      "x...a...x",
      "x.x.x.x.x",
      "x.......x",
      ".x.....x.",
      "..xxxxx..",
    ],
    colors: { a: "#7c6cff" },
  },
  pizza: {
    rows: [
      "ccccccccc",
      ".yyryyyy.",
      ".yyyyyry.",
      "..ryyyy..",
      "..yyyry..",
      "...yyy...",
      "...yry...",
      "....y....",
      ".........",
    ],
    colors: { c: "#c98d4f", y: "#ffcf5a", r: "#e8505b" },
  },
  web: {
    rows: [
      "xxxxxxxxx",
      "xrxyxgxxx",
      "xxxxxxxxx",
      "x.......x",
      "x.aaa...x",
      "x.......x",
      "x.aaaaa.x",
      "x.......x",
      "xxxxxxxxx",
    ],
    colors: { r: "#ff6f6f", y: "#ffcf5a", g: "#57c27a", a: "#6b8cff" },
  },
  chip: {
    rows: [
      "..x.x.x..",
      ".xxxxxxx.",
      "xxaaaaaxx",
      ".xa...ax.",
      "xxa.g.axx",
      ".xa...ax.",
      "xxaaaaaxx",
      ".xxxxxxx.",
      "..x.x.x..",
    ],
    colors: { a: "#9aa3b5", g: "#57c27a" },
  },
  chart: {
    rows: [
      "x........",
      "x......d.",
      "x.....a..",
      "x...da...",
      "x..a.....",
      "x.ad.....",
      "xa.......",
      "xd.......",
      "xxxxxxxxx",
    ],
    colors: { a: "#6b8cff", d: "#e8505b" },
  },
  notebook: {
    rows: [
      ".xxxxxxx.",
      "xx.....x.",
      ".x.aaa.x.",
      "xx.....x.",
      ".x.aaaax.",
      "xx.....x.",
      ".x.aa..x.",
      "xx.....x.",
      ".xxxxxxx.",
    ],
    colors: { a: "#6b8cff" },
  },
};

export function iconFor(tags: string[]): keyof typeof ICONS {
  const t = tags.map((s) => s.toLowerCase());
  if (t.includes("mlx") || t.includes("apple silicon")) return "chip";
  if (t.includes("webassembly") || t.includes("web")) return "web";
  if (t.includes("semantic parsing")) return "pizza";
  if (t.includes("quantum computing")) return "qubit";
  if (t.includes("linear regression")) return "chart";
  return "notebook";
}

export default function PixelIcon({
  tags,
  size = 18,
  className = "",
}: {
  tags: string[];
  size?: number;
  className?: string;
}) {
  const icon = ICONS[iconFor(tags)];
  const cells = grid(icon.rows);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 9 9"
      shapeRendering="crispEdges"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      {[...cells].map(([ch, px]) => (
        <path
          key={ch}
          d={px.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("")}
          fill={ch === "x" ? "currentColor" : icon.colors[ch]}
        />
      ))}
    </svg>
  );
}
