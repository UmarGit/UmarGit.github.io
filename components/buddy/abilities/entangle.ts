import type { Ability } from "./types";

/**
 * Entanglement. A teal partner appears beside Qubi, linked by a dotted
 * line, and mirrors everything it does. Measuring one fixes the other.
 */
export const entangle: Ability = {
  id: "entangle",
  topics: ["quantum computing", "qiskit", "pytorch", "qrnn"],
  async run(ctx) {
    ctx.fx({ partner: true, expression: "surprised" });
    ctx.say("entangled! |00⟩ + |11⟩", 2200);
    await ctx.wait(700);
    ctx.fx({ partner: true });
    await ctx.wait(1200);
    // Blink in perfect sync.
    ctx.fx({ partner: true, expression: "blink" });
    await ctx.wait(140);
    ctx.fx({ partner: true });
    await ctx.wait(900);
    ctx.fx({ partner: true, expression: "happy" });
    ctx.sparkle("spark", 3);
    ctx.say("spooky action at a distance ✦", 1800);
    await ctx.wait(1900);
  },
};
