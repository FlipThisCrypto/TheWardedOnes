import { describe, it, expect } from 'vitest';
import {
  getAllBattlefieldCards,
  findCardOnBattlefield,
  findCardAnywhere,
  countEmptySlots,
  getBoardPower,
  describeCard,
} from './queries';
import { createGameState, createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

function setup() {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const deck = [mage.id, ...ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id)];
  return createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck, 5);
}

describe('queries', () => {
  it('findCardAnywhere locates hand cards', () => {
    const state = setup();
    const card = state.players[0].hand[0];
    const found = findCardAnywhere(state, card.instanceId);
    expect(found?.zone).toBe('hand');
    expect(found?.playerIndex).toBe(0);
  });

  it('countEmptySlots reports full open board', () => {
    const state = setup();
    const slots = countEmptySlots(state.players[0]);
    expect(slots.mageOpen).toBe(true);
    expect(slots.fighters).toBe(4);
    expect(slots.beasts).toBe(3);
    expect(slots.totems).toBe(2);
  });

  it('getBoardPower sums attack and hp', () => {
    const state = setup();
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.currentAttack = 4;
    unit.currentHp = 6;
    state.players[0].battlefield.fighters[0].card = unit;
    expect(getBoardPower(state.players[0])).toBe(10);
    expect(describeCard(unit)).toBe(f.name);
    expect(findCardOnBattlefield(state.players[0], unit.instanceId)?.instanceId).toBe(unit.instanceId);
    expect(getAllBattlefieldCards(state.players[0])).toHaveLength(1);
  });
});
