import type { Ability } from "./types";
import { glitch } from "./glitch";
import { qubit } from "./qubit";
import { token } from "./token";

/** Qubi's abilities. New research, new trick: add a file and list it here. */
export const ABILITIES: Ability[] = [qubit, token, glitch];

/** Pick an ability, favouring ones whose topics match the page. */
export function pickAbility(topics: string[]): Ability {
  const t = new Set(topics.map((s) => s.toLowerCase()));
  const weights = ABILITIES.map((a) => (a.topics.some((x) => t.has(x)) ? 4 : 1));
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < ABILITIES.length; i++) {
    r -= weights[i];
    if (r <= 0) return ABILITIES[i];
  }
  return ABILITIES[0];
}

export type { Ability, AbilityContext, Fx } from "./types";
