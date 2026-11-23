import type { Ability } from "./types";

/**
 * Linear regression. A little scatter plot appears and Qubi fits a line to
 * it with a few steps of real gradient descent, then reports the loss.
 */
const mse = (pts: [number, number][], m: number, b: number) =>
  pts.reduce((s, [x, y]) => s + (m * x + b - y) ** 2, 0) / pts.length;

export const fit: Ability = {
  id: "fit",
  topics: ["linear regression", "python", "matplotlib", "data science"],
  async run(ctx) {
    const trueM = 0.4 + Math.random() * 0.4;
    const trueB = 0.1 + Math.random() * 0.2;
    const points: [number, number][] = Array.from({ length: 9 }, (_, i) => {
      const x = 0.06 + (i / 8) * 0.88;
      return [x, Math.min(0.95, Math.max(0.05, trueM * x + trueB + (Math.random() - 0.5) * 0.18))];
    });
    let m = -0.3;
    let b = 0.7;
    const l0 = mse(points, m, b);
    ctx.fx({ plot: { points, slope: m, intercept: b }, expression: "focus" });
    ctx.say("fitting a line… ✎", 1600);
    await ctx.wait(500);
    // Step size well under 2/λmax of the MSE Hessian for x in [0, 1] (~2.6),
    // so descent converges instead of oscillating off to infinity.
    for (let step = 0; step < 30; step++) {
      let gm = 0;
      let gb = 0;
      for (const [x, y] of points) {
        const e = m * x + b - y;
        gm += (2 * e * x) / points.length;
        gb += (2 * e) / points.length;
      }
      m -= 0.55 * gm;
      b -= 0.55 * gb;
      ctx.fx({ plot: { points, slope: m, intercept: b }, expression: "focus" });
      await ctx.wait(60);
    }
    ctx.fx({ plot: { points, slope: m, intercept: b }, expression: "happy" });
    ctx.say(`loss ${l0.toFixed(2)} → ${mse(points, m, b).toFixed(3)} ✓`, 2000);
    await ctx.wait(2200);
  },
};
