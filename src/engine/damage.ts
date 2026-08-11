/**
 * Unified damage pipeline for combat and effect damage.
 *
 * Order:
 * 1. Start from raw amount (already includes element mods for combat)
 * 2. Pierce: ignore defense (caller sets defenseUsed=0) and skip Ward if pierceWards
 * 3. Fortify: −1 incoming (min 1 before ward, unless amount already 0)
 * 4. Ward X: absorb, reduce ward value, strip when depleted
 * 5. Apply remaining to HP
 * 6. Caller handles lifesteal / death / logs using result
 */

import { CardInstance } from './types';
import { hasKeyword, removeKeyword } from './keywords';

export interface DamageRequest {
  amount: number;
  /** When true, Ward does not absorb (Pierce keyword on source). */
  pierceWards?: boolean;
  /** Combat path enforces minimum 1 after fortify; pure effect can set false. */
  minimumOne?: boolean;
}

export interface DamageResult {
  /** HP lost after ward absorption */
  hpDamage: number;
  /** Total prevented by ward */
  wardAbsorbed: number;
  /** Amount after fortify, before ward */
  postMitigation: number;
  killed: boolean;
  logParts: string[];
}

/**
 * Apply damage to a unit instance in place. Mutates target keywords/hp.
 */
export function applyDamageToUnit(target: CardInstance, req: DamageRequest): DamageResult {
  const logParts: string[] = [];
  let amount = req.amount;
  const minOne = req.minimumOne !== false;

  if (hasKeyword(target.keywords, 'Fortify') && amount > 0) {
    amount = amount - 1;
    if (minOne) amount = Math.max(1, amount);
    else amount = Math.max(0, amount);
    logParts.push('Fortify reduces damage by 1');
  } else if (minOne) {
    amount = Math.max(1, amount);
  } else {
    amount = Math.max(0, amount);
  }

  const postMitigation = amount;
  let wardAbsorbed = 0;
  let hpDamage = amount;

  if (!req.pierceWards && hasKeyword(target.keywords, 'Ward') && target.keywords) {
    const wardIdx = target.keywords.findIndex(k => k.keyword === 'Ward');
    if (wardIdx !== -1) {
      const wardValue = target.keywords[wardIdx].value ?? 0;
      if (wardValue > 0 && hpDamage > 0) {
        if (hpDamage <= wardValue) {
          wardAbsorbed = hpDamage;
          target.keywords[wardIdx].value = wardValue - hpDamage;
          logParts.push(`Ward absorbs ${hpDamage} (remaining ${wardValue - hpDamage})`);
          hpDamage = 0;
        } else {
          wardAbsorbed = wardValue;
          hpDamage -= wardValue;
          target.keywords[wardIdx].value = 0;
          logParts.push(`Ward absorbs ${wardValue} and breaks`);
        }
        if ((target.keywords[wardIdx].value ?? 0) <= 0) {
          target.keywords = removeKeyword(target.keywords, 'Ward');
        }
      }
    }
  }

  target.currentHp -= hpDamage;
  const killed = target.currentHp <= 0;

  return { hpDamage, wardAbsorbed, postMitigation, killed, logParts };
}

/**
 * Face damage to player life (no ward/fortify on player in v1).
 */
export function applyDamageToPlayer(life: number, amount: number): { life: number; damage: number } {
  const damage = Math.max(1, amount);
  return { life: life - damage, damage };
}
