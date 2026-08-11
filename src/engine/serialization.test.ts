import { describe, it, expect } from 'vitest';
import { serializeMatch, deserializeMatch } from './serialization';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

describe('serialization', () => {
  it('round-trips a match snapshot', () => {
    const state = createGameState(
      'ai',
      'A',
      'Battlemage',
      generateDefaultDeck('Battlemage'),
      'B',
      'Warrior',
      generateDefaultDeck('Warrior'),
      9
    );
    const raw = serializeMatch(state);
    const result = deserializeMatch(raw);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.players[0].life).toBe(30);
      expect(result.state.rng.seed).toBe(9);
    }
  });

  it('rejects garbage', () => {
    expect(deserializeMatch('nope').ok).toBe(false);
  });
});
