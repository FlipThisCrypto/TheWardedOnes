import { describe, it, expect } from 'vitest';
import { createValidatedMatch } from './matchFactory';
import { generateDefaultDeck } from './deckUtils';

describe('matchFactory', () => {
  it('creates session for valid decks', () => {
    const r = createValidatedMatch({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: generateDefaultDeck('Battlemage'),
      p2Deck: generateDefaultDeck('Warrior'),
      seed: 1,
    });
    expect(r.ok).toBe(true);
  });

  it('rejects invalid decks', () => {
    const r = createValidatedMatch({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: ['x'],
      p2Deck: generateDefaultDeck('Warrior'),
    });
    expect(r.ok).toBe(false);
  });
});
