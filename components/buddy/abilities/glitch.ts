import type { Ability } from "./types";

/**
 * A silent error. A slice of Qubi jumps sideways for a few frames, snaps
 * back, and Qubi checks whether anyone noticed.
 */
const LINES = ["…nothing happened. ✓", "parsed ✓ plausible ✓ …wrong?", "did you see that?", "all systems nominal."];

export const glitch: Ability = {
  id: "glitch",
  topics: ["semantic parsing", "llm", "research", "webassembly"],
  async run(ctx) {
    for (const g of [2, -1, 1, -2]) {
      ctx.fx({ glitch: g });
      await ctx.wait(70 + Math.random() * 60);
      ctx.fx({});
      await ctx.wait(90 + Math.random() * 120);
    }
    ctx.fx({ expression: "surprised" });
    await ctx.wait(350);
    ctx.fx({ look: { x: -1, y: 0 } });
    await ctx.wait(450);
    ctx.fx({ look: { x: 1, y: 0 } });
    await ctx.wait(450);
    ctx.fx({});
    ctx.say(LINES[Math.floor(Math.random() * LINES.length)], 2000);
    await ctx.wait(1200);
  },
};
