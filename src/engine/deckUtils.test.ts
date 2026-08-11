import { describe, it, expect } from 'vitest';
import {
  validateDeck,
  generateDefaultDeck,
  DECK_SIZE,
  MAX_MAGES,
} from './deckUtils';
import { ALL_CARDS } from '../data/cards';
import type { CardClass } from './types';

describe('validateDeck', () => {
  it('rejects empty deck', () => {
    const v = validateDeck([]);
    expect(v.valid).toBe(false);
    expect(v.errors.some(e => e.includes(`${DECK_SIZE}`))).toBe(true);
  });

  it('rejects missing mage', () => {
    const fighters = ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, DECK_SIZE).map(c => c.id);
    // pad if needed
    while (fighters.length < DECK_SIZE) fighters.push(fighters[0]);
    const v = validateDeck(fighters.slice(0, DECK_SIZE));
    expect(v.valid).toBe(false);
    expect(v.errors.some(e => e.toLowerCase().includes('mage'))).toBe(true);
  });

  it('accepts a generateDefaultDeck for Battlemage', () => {
    const deck = generateDefaultDeck('Battlemage');
    expect(deck).toHaveLength(DECK_SIZE);
    const v = validateDeck(deck);
    expect(v.valid).toBe(true);
    expect(v.counts.mages).toBeLessThanOrEqual(MAX_MAGES);
    expect(v.counts.mages).toBe(1);
  });

  it('generateDefaultDeck works for all classes', () => {
    const classes: CardClass[] = [
      'Battlemage', 'Elementalist', 'Chronomancer', 'Warlock', 'Priest',
      'Beastmaster', 'Trickster', 'Jester', 'Guardian', 'Warrior',
    ];
    for (const cls of classes) {
      const deck = generateDefaultDeck(cls);
      expect(deck.length).toBe(DECK_SIZE);
      const v = validateDeck(deck);
      expect(v.valid, `${cls}: ${v.errors.join('; ')}`).toBe(true);
    }
  });

  it('counts match card types', () => {
    const deck = generateDefaultDeck('Priest');
    const v = validateDeck(deck);
    expect(v.counts.total).toBe(DECK_SIZE);
    expect(
      v.counts.mages + v.counts.fighters + v.counts.beasts +
      v.counts.relics + v.counts.totems + v.counts.utility
    ).toBe(v.counts.total);
  });
});
