/**
 * Evolution rules: L2 requires evolvesFrom on board; L3 requires L2 chain.
 */

import type { CardDefinition, CardInstance, PlayerState } from './types';
import { getCardById } from '../data/cards';
import { getAllBattlefieldCards } from './queries';

export function findEvolutionBase(
  player: PlayerState,
  evolutionDef: CardDefinition
): CardInstance | null {
  if (!evolutionDef.evolvesFrom) return null;
  return (
    getAllBattlefieldCards(player).find(c => c.definitionId === evolutionDef.evolvesFrom) ?? null
  );
}

export function canEvolve(player: PlayerState, evolutionDef: CardDefinition): boolean {
  if (evolutionDef.level < 2) return true;
  return findEvolutionBase(player, evolutionDef) !== null;
}

/**
 * Replace base with evo instance; transfer relics; preserve relative damage.
 * Returns false if base not found.
 */
export function applyEvolution(
  player: PlayerState,
  evoCard: CardInstance,
  evolutionDef: CardDefinition
): boolean {
  const base = findEvolutionBase(player, evolutionDef);
  if (!base) return false;

  const baseDef = getCardById(base.definitionId);
  evoCard.attachedRelics = [...base.attachedRelics];
  // Preserve damage: keep missing HP ratio approximately via absolute missing HP
  if (baseDef) {
    const missing = Math.max(0, baseDef.hp - base.currentHp);
    evoCard.currentHp = Math.max(1, evolutionDef.hp - missing);
  }
  evoCard.canAttack = true;
  evoCard.hasAttacked = false;

  // Place evo in base slot and send base to GY without death trigger path
  const slots = [
    player.battlefield.mage,
    ...player.battlefield.fighters,
    ...player.battlefield.beasts,
    ...player.battlefield.totems,
  ];
  for (const slot of slots) {
    if (slot.card?.instanceId === base.instanceId) {
      player.graveyard.push(base);
      slot.card = evoCard;
      return true;
    }
  }
  return false;
}
