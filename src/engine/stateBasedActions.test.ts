import { describe, it, expect } from 'vitest';
import { applyStateBasedActions } from './stateBasedActions';
import { createGameState, createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

function baseState() {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const fighters = ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id);
  const deck = [mage.id, ...fighters];
  return createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck, 1);
}

describe('applyStateBasedActions', () => {
  it('moves zero-HP units to graveyard', () => {
    const state = baseState();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(fighter);
    unit.currentHp = 0;
    state.players[0].battlefield.fighters[0].card = unit;

    const { deaths } = applyStateBasedActions(state);
    expect(deaths).toHaveLength(1);
    expect(state.players[0].battlefield.fighters[0].card).toBeNull();
    expect(state.players[0].graveyard.some(c => c.instanceId === unit.instanceId)).toBe(true);
  });

  it('sets winner when a player life is 0', () => {
    const state = baseState();
    state.players[1].life = 0;
    const { winnerSet } = applyStateBasedActions(state);
    expect(winnerSet).toBe(true);
    expect(state.gameOver).toBe(true);
    expect(state.winner).toBe(0);
  });

  it('is stable when nothing is dead', () => {
    const state = baseState();
    const { deaths, winnerSet } = applyStateBasedActions(state);
    expect(deaths).toHaveLength(0);
    expect(winnerSet).toBe(false);
    expect(state.gameOver).toBe(false);
  });
});
