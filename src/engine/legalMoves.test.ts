import { describe, it, expect } from 'vitest';
import { listLegalActions } from './legalMoves';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { runStartOfTurn } from './turnMachine';

describe('legalMoves', () => {
  it('lists play and end options on main', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 5);
    state.mulliganComplete = [true, true];
    state.phase = 'draw';
    const start = runStartOfTurn(state);
    state = start.ok ? start.state : state;
    const actions = listLegalActions(state);
    expect(actions.some(a => a.type === 'END_TURN')).toBe(true);
    expect(actions.some(a => a.type === 'ADVANCE_PHASE')).toBe(true);
    expect(actions.some(a => a.type === 'CONCEDE')).toBe(true);
  });

  it('lists mulligan only in mulligan phase', () => {
    const state = createGameState(
      'ai',
      'P1',
      'Battlemage',
      generateDefaultDeck('Battlemage'),
      'P2',
      'Warrior',
      generateDefaultDeck('Warrior'),
      1
    );
    const actions = listLegalActions(state);
    expect(actions.some(a => a.type === 'MULLIGAN')).toBe(true);
    expect(actions.some(a => a.type === 'PLAY_CARD')).toBe(false);
  });
});
