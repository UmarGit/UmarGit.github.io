import type { Expression } from "../creature";

/** Visual effects an ability can put on Qubi. Anything unset is "off". */
export interface Fx {
  /** Shift the middle slice of the body sideways (cells). */
  glitch?: number;
  /** Superposition: show two ghost copies (|0⟩ teal, |1⟩ violet). */
  ghosts?: boolean;
  /** Collapsed into the |0⟩ state: tint the body teal. */
  tint?: "teal";
  /** Override the face. */
  expression?: Expression;
  /** Override where the eyes look (-1…1). */
  look?: { x: number; y: number };
  /** Token chips shown in the speech bubble. */
  tokens?: string[];
}

export interface AbilityContext {
  /** Replace the current effects. */
  fx(next: Fx): void;
  say(text: string, ms?: number): void;
  sparkle(kind: "spark" | "heart" | "note", n?: number): void;
  /** Resolves after `ms`, or rejects early if the ability is interrupted. */
  wait(ms: number): Promise<void>;
  /** Is the visitor's cursor within `px` of Qubi's face? */
  pointerNear(px: number): boolean;
}

/**
 * One of Qubi's tricks. To add a new one for new research:
 *   1. create a file in this folder exporting an `Ability`,
 *   2. add it to the list in ./index.ts.
 * `topics` are post tags (lowercase). On a post with a matching tag, the
 * ability is picked more often.
 */
export interface Ability {
  id: string;
  topics: string[];
  run(ctx: AbilityContext): Promise<void>;
}
