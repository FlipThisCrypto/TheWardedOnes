import { describe, it, expect } from 'vitest';
import { exportDeckToJson, importDeckFromJson } from './deckExport';
import { generateDefaultDeck } from './deckUtils';

describe('deckExport', () => {
  it('round-trips a valid deck', () => {
    const cards = generateDefaultDeck('Battlemage');
    const deck = {
      id: 'd1',
      name: 'Test',
      playerClass: 'Battlemage' as const,
      cards,
    };
    const json = exportDeckToJson(deck);
    const result = importDeckFromJson(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.deck.cards).toEqual(cards);
      expect(result.deck.name).toBe('Test');
    }
  });

  it('rejects invalid payload', () => {
    expect(importDeckFromJson('not-json').ok).toBe(false);
    expect(importDeckFromJson('{"name":"x"}').ok).toBe(false);
    expect(importDeckFromJson(JSON.stringify({
      name: 'x',
      playerClass: 'Warrior',
      cards: ['only_one'],
    })).ok).toBe(false);
  });
});
