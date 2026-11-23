import type { Ability } from "./types";

/** Apple Silicon. Qubi "compiles for Metal" and zooms off with motion trails. */
export const metal: Ability = {
  id: "metal",
  topics: ["mlx", "apple silicon"],
  async run(ctx) {
    ctx.fx({ expression: "focus" });
    ctx.say("compiling for Metal…", 1100);
    await ctx.wait(1000);
    ctx.fx({ speed: true, expression: "surprised" });
    await ctx.wait(750);
    ctx.fx({ expression: "happy" });
    ctx.sparkle("spark", 3);
    ctx.say("250× faster ⚡", 1800);
    await ctx.wait(1700);
  },
};
