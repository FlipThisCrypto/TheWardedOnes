/**
 * Read-only board queries — shared by UI, AI, and rules.
 */

import type { CardInstance, GameState, PlayerState, BattlefieldSlot } from './types';
import { getCardById } from '../data/cards';

export function getAllBattlefieldCards(player: PlayerState): CardInstance[] {
  const cards: CardInstance[] = [];
  if (player.battlefield.mage.card) cards.push(player.battlefield.mage.card);
  player.battlefield.fighters.forEach(s => { if (s.card) cards.push(s.card); });
  player.battlefield.beasts.forEach(s => { if (s.card) cards.push(s.card); });
  player.battlefield.totems.forEach(s => { if (s.card) cards.push(s.card); });
  return cards;
}

export function findCardOnBattlefield(player: PlayerState, instanceId: string): CardInstance | null {
  if (player.battlefield.mage.card?.instanceId === instanceId) return player.battlefield.mage.card;
  for (const s of player.battlefield.fighters) {
    if (s.card?.instanceId === instanceId) return s.card;
  }
  for (const s of player.battlefield.beasts) {
    if (s.card?.instanceId === instanceId) return s.card;
  }
  for (const s of player.battlefield.totems) {
    if (s.card?.instanceId === instanceId) return s.card;
  }
  return null;
}

export function findCardAnywhere(state: GameState, instanceId: string): {
  playerIndex: 0 | 1;
  zone: 'battlefield' | 'hand' | 'graveyard' | 'deck';
  card: CardInstance;
} | null {
  for (const pi of [0, 1] as const) {
    const p = state.players[pi];
    const bf = findCardOnBattlefield(p, instanceId);
    if (bf) return { playerIndex: pi, zone: 'battlefield', card: bf };
    const hand = p.hand.find(c => c.instanceId === instanceId);
    if (hand) return { playerIndex: pi, zone: 'hand', card: hand };
    const gy = p.graveyard.find(c => c.instanceId === instanceId);
    if (gy) return { playerIndex: pi, zone: 'graveyard', card: gy };
    const deck = p.deck.find(c => c.instanceId === instanceId);
    if (deck) return { playerIndex: pi, zone: 'deck', card: deck };
  }
  return null;
}

export function countEmptySlots(player: PlayerState): {
  fighters: number;
  beasts: number;
  totems: number;
  mageOpen: boolean;
} {
  return {
    fighters: player.battlefield.fighters.filter(s => !s.card).length,
    beasts: player.battlefield.beasts.filter(s => !s.card).length,
    totems: player.battlefield.totems.filter(s => !s.card).length,
    mageOpen: player.battlefield.mage.card === null,
  };
}

export function getBoardPower(player: PlayerState): number {
  return getAllBattlefieldCards(player).reduce((sum, c) => sum + c.currentAttack + c.currentHp, 0);
}

export function describeCard(instance: CardInstance): string {
  return getCardById(instance.definitionId)?.name ?? instance.definitionId;
}

export function allSlots(player: PlayerState): BattlefieldSlot[] {
  return [
    player.battlefield.mage,
    ...player.battlefield.fighters,
    ...player.battlefield.beasts,
    ...player.battlefield.totems,
  ];
}
