import { describe, it, expect } from 'vitest';
import { hasEmptySlot, putOnBattlefield, removeFromHand, moveToGraveyard } from './zones';
import { createGameState, createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

function p0() {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const deck = [mage.id, ...ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id)];
  return createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck, 21).players[0];
}

describe('zones', () => {
  it('hasEmptySlot true for open fighter row', () => {
    const player = p0();
    expect(hasEmptySlot(player, 'Fighter')).toBe(true);
    expect(hasEmptySlot(player, 'Relic')).toBe(false);
  });

  it('putOnBattlefield places fighter', () => {
    const player = p0();
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const card = createCardInstance(f);
    expect(putOnBattlefield(player, card)).toBe(true);
    expect(player.battlefield.fighters.some(s => s.card?.instanceId === card.instanceId)).toBe(true);
  });

  it('removeFromHand and moveToGraveyard', () => {
    const player = p0();
    const card = player.hand[0];
    const removed = removeFromHand(player, card.instanceId);
    expect(removed?.instanceId).toBe(card.instanceId);
    moveToGraveyard(player, removed!);
    expect(player.graveyard.some(c => c.instanceId === card.instanceId)).toBe(true);
  });
});
