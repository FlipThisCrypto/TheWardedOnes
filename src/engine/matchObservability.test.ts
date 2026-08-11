import { describe, it, expect } from 'vitest';
import { collectMatchMetrics, formatMatchSnapshot } from './matchObservability';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

describe('matchObservability', () => {
  it('collects per-player metrics', () => {
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
    const m = collectMatchMetrics(state);
    expect(m.p0.life).toBe(30);
    expect(m.p0.handSize).toBe(5);
    expect(m.p1.handSize).toBe(5);
    expect(m.phase).toBe('mulligan');
    expect(formatMatchSnapshot(state)).toContain('P0 life=30');
  });
});
