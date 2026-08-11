/**
 * Pure combat math helpers (no state mutation).
 */

import type { Element } from './types';
import { getElementModifier } from './elements';

export interface CombatDamageInput {
  attack: number;
  defense: number;
  attackerElements: Element[];
  defenderElements: Element[];
  pierce: boolean;
}

/**
 * Raw damage before Ward/Fortify: Attack - Defense (+ element), min handled by damage pipeline.
 * Pierce sets defense contribution to 0.
 */
export function computeCombatRawDamage(input: CombatDamageInput): {
  raw: number;
  elementMod: number;
  defenseUsed: number;
} {
  const elementMod = getElementModifier(input.attackerElements, input.defenderElements);
  const defenseUsed = input.pierce ? 0 : input.defense;
  const raw = input.attack - defenseUsed + elementMod;
  return { raw, elementMod, defenseUsed };
}

/** Would this hit kill the target ignoring ward (optimistic)? */
export function wouldLethalIgnoringWard(
  input: CombatDamageInput,
  targetHp: number,
  fortify: boolean
): boolean {
  let amount = computeCombatRawDamage(input).raw;
  if (fortify) amount = Math.max(1, amount - 1);
  else amount = Math.max(1, amount);
  return amount >= targetHp;
}
