import { describe, it, expect } from 'vitest';
import { checkMatchInvariants, assertInvariants } from './assertInvariants';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

describe('assertInvariants', () => {
  it('fresh match has no violations', () => {
    const state = createGameState(
      'ai',
      'A',
      'Battlemage',
      generateDefaultDeck('Battlemage'),
      'B',
      'Warrior',
      generateDefaultDeck('Warrior'),
      1
    );
    expect(checkMatchInvariants(state)).toEqual([]);
    expect(() => assertInvariants(state)).not.toThrow();
  });

  it('detects negative resources', () => {
    const state = createGameState(
      'ai',
      'A',
      'Battlemage',
      generateDefaultDeck('Battlemage'),
      'B',
      'Warrior',
      generateDefaultDeck('Warrior'),
      1
    );
    state.players[0].resources = -1;
    expect(checkMatchInvariants(state).some(v => v.code === 'RES_NEG')).toBe(true);
  });
});
