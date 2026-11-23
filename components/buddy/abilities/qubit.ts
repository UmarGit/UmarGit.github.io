import type { Ability } from "./types";

/**
 * Superposition. Qubi splits into two ghosts, |0⟩ (teal) and |1⟩ (violet),
 * and shimmers until it is observed: bring the cursor close and it collapses
 * into one state at random.
 */
export const qubit: Ability = {
  id: "qubit",
  topics: ["quantum computing", "qiskit", "mlx", "qrnn", "pytorch"],
  async run(ctx) {
    ctx.fx({ ghosts: true });
    ctx.say("|ψ⟩ = α|0⟩ + β|1⟩ …", 2600);
    // Stay in superposition for a moment, then wait to be observed
    // (or give up after a while: decoherence).
    await ctx.wait(1500);
    for (let t = 0; t < 6000 && !ctx.pointerNear(150); t += 100) await ctx.wait(100);
    const state = Math.random() < 0.5 ? 0 : 1;
    ctx.fx({ tint: state === 0 ? "teal" : undefined, expression: "surprised" });
    ctx.sparkle("spark", 4);
    ctx.say(`measured: |${state}⟩`, 1800);
    await ctx.wait(450);
    ctx.fx({ tint: state === 0 ? "teal" : undefined, expression: "happy" });
    await ctx.wait(2600);
  },
};
