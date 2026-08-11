/**
 * Status effect ticking and cleanup helpers.
 */

import type { CardInstance, StatusEffect } from './types';
import { getCardById } from '../data/cards';

export function applyHotTicks(card: CardInstance): number {
  let healed = 0;
  const def = getCardById(card.definitionId);
  const maxHp = def?.hp ?? card.currentHp;
  for (const hot of card.statusEffects.filter(e => e.type === 'hot')) {
    const before = card.currentHp;
    card.currentHp = Math.min(card.currentHp + hot.value, maxHp);
    healed += card.currentHp - before;
  }
  return healed;
}

export function applyDotTicks(card: CardInstance): number {
  let damage = 0;
  for (const dot of card.statusEffects.filter(e => e.type === 'dot')) {
    card.currentHp -= dot.value;
    damage += dot.value;
  }
  return damage;
}

/**
 * Decrement durations; remove expired; reverse temporary defense buffs.
 */
export function tickStatusDurations(card: CardInstance): StatusEffect[] {
  card.statusEffects = card.statusEffects.filter(e => {
    if (e.turnsRemaining === -1) return true;
    e.turnsRemaining -= 1;
    if (e.turnsRemaining <= 0) {
      if (e.stat === 'defense' && e.type === 'buff') {
        card.currentDefense -= e.value;
      }
      if (e.stat === 'attack' && e.type === 'buff') {
        card.currentAttack -= e.value;
      }
      if (e.stat === 'attack' && e.type === 'debuff') {
        card.currentAttack += Math.abs(e.value);
      }
      return false;
    }
    return true;
  });
  return card.statusEffects;
}
