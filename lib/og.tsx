import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { GRID, sprite } from "@/components/buddy/creature";
import { pixelIconSvg } from "@/components/pixel-icon";

/** Share cards (Open Graph / Twitter), rendered at build time. */
export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#1e1b24";
const MUTED = "#7b7582";
const RULE = "#cdc9d4";

const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

function qubiSvg(): string {
  const last = new Map<string, string>();
  for (const [x, y, c] of sprite("wave", "happy")) last.set(`${x},${y}`, c);
  const rects = [...last].map(([k, c]) => {
    const [x, y] = k.split(",");
    return `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c}"/>`;
  });
  // The floating bit above its head.
  rects.push(`<rect x="7" y="-2.5" width="2" height="2" fill="#b3abdd" stroke="#2b2638" stroke-width="0.3"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -3 ${GRID.w} ${GRID.h + 3}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [serif, mono] = await Promise.all([
    readFile(join(dir, "Newsreader-Medium.ttf")),
    readFile(join(dir, "JetBrainsMono-Medium.ttf")),
  ]);
  return [
    { name: "Newsreader", data: serif, weight: 500 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

export async function shareCard(opts: { kicker: string; title: string; meta?: string; tags?: string[] }) {
  const long = opts.title.length > 70;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#ffffff",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontFamily: "JetBrains Mono", fontSize: 24, color: MUTED }}>
          <span style={{ color: INK }}>umar ahmed</span>
          <span style={{ marginLeft: 12 }}>/ lab notebook</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", fontFamily: "JetBrains Mono", fontSize: 24, color: MUTED }}>
            {opts.tags && <img src={dataUri(pixelIconSvg(opts.tags, INK))} width={30} height={30} style={{ marginRight: 16 }} />}
            {opts.kicker}
          </div>
          <div
            style={{
              marginTop: 24,
              maxWidth: 900,
              fontFamily: "Newsreader",
              fontSize: long ? 60 : 72,
              lineHeight: 1.08,
              letterSpacing: -1,
            }}
          >
            {opts.title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            borderTop: `3px dashed ${RULE}`,
            paddingTop: 28,
          }}
        >
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 22, color: MUTED }}>{opts.meta ?? ""}</span>
          <img src={dataUri(qubiSvg())} width={128} height={152} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() }
  );
}
