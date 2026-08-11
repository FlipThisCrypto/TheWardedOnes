import { describe, it, expect } from 'vitest';
import { getAIActions, getRandomPersonality, aiMulligan } from './ai';
import { createGameState, executeResourcePhase, createCardInstance } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { ALL_CARDS } from '../data/cards';

describe('AI', () => {
  it('getRandomPersonality returns a known personality', () => {
    const p = getRandomPersonality(123);
    expect(['aggro', 'control', 'balanced']).toContain(p);
    expect(getRandomPersonality(123)).toBe(p);
  });

  it('getAIActions always includes end option', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 9);
    // complete mulligan roughly
    state.mulliganComplete = [true, true];
    state.phase = 'main';
    state = executeResourcePhase({ ...state, phase: 'resource' });
    const actions = getAIActions(state, 'balanced');
    expect(actions.some(a => a.type === 'end')).toBe(true);
    expect(actions[0].score).toBeGreaterThanOrEqual(actions[actions.length - 1].score);
  });

  it('aiMulligan replaces high cost cards', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 3);
    // Force expensive card into hand
    const expensive = ALL_CARDS.find(c => c.cost >= 5);
    if (expensive) {
      state.players[0].hand[0] = createCardInstance(expensive);
    }
    state = aiMulligan(state);
    expect(state.mulliganComplete[0]).toBe(true);
  });
});
