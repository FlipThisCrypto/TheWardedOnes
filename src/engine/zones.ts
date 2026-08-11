/**
 * Zone movement helpers with clear legality.
 */

import type { CardInstance, CardType, PlayerState, BattlefieldSlot } from './types';
import { getCardById } from '../data/cards';

export type ZoneName = 'hand' | 'deck' | 'graveyard' | 'battlefield';

export function getSlotsForType(player: PlayerState, type: CardType): BattlefieldSlot[] | null {
  switch (type) {
    case 'Mage':
      return [player.battlefield.mage];
    case 'Fighter':
      return player.battlefield.fighters;
    case 'Beast':
      return player.battlefield.beasts;
    case 'Totem':
      return player.battlefield.totems;
    default:
      return null;
  }
}

export function hasEmptySlot(player: PlayerState, type: CardType): boolean {
  const slots = getSlotsForType(player, type);
  if (!slots) return false;
  return slots.some(s => s.card === null);
}

export function moveToGraveyard(player: PlayerState, card: CardInstance): void {
  player.graveyard.push(card);
}

export function removeFromHand(player: PlayerState, instanceId: string): CardInstance | null {
  const idx = player.hand.findIndex(c => c.instanceId === instanceId);
  if (idx === -1) return null;
  return player.hand.splice(idx, 1)[0];
}

export function putOnBattlefield(
  player: PlayerState,
  card: CardInstance,
  preferIndex?: number
): boolean {
  const def = getCardById(card.definitionId);
  if (!def) return false;
  const slots = getSlotsForType(player, def.type);
  if (!slots) return false;
  if (preferIndex !== undefined && slots[preferIndex] && !slots[preferIndex].card) {
    slots[preferIndex].card = card;
    return true;
  }
  const empty = slots.find(s => s.card === null);
  if (!empty) return false;
  empty.card = card;
  return true;
}
