import type { Ability } from "./types";

/**
 * Tokens. Qubi's mouth becomes a blinking text cursor and it "generates"
 * a short sequence, one token at a time, shown as tokenizer chips.
 */
const SEQUENCES = [
  ["pizza", " 1", " extra", " cheese"],
  ["hello", ",", " world", "!"],
  ["tiny", " models", " can", " be", " honest"],
  ["no", " onions", " please"],
  ["?"],
];

export const token: Ability = {
  id: "token",
  topics: ["llm", "semantic parsing", "fine-tuning", "webassembly", "machine learning"],
  async run(ctx) {
    const seq = SEQUENCES[Math.floor(Math.random() * SEQUENCES.length)];
    ctx.fx({ expression: "cursor" });
    for (let i = 1; i <= seq.length; i++) {
      ctx.fx({ expression: "cursor", tokens: seq.slice(0, i) });
      await ctx.wait(260 + Math.random() * 160);
    }
    await ctx.wait(1600);
    ctx.fx({ expression: "happy" });
    await ctx.wait(500);
  },
};
