import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadSavedDecks,
  saveDeckList,
  deleteSavedDeck,
  createDeckList,
} from './deckPersistence';
import { generateDefaultDeck } from './deckUtils';

// Minimal localStorage mock for node tests
function installMemoryStorage() {
  const store = new Map<string, string>();
  // @ts-expect-error test mock
  globalThis.window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
  };
  return store;
}

describe('deckPersistence', () => {
  beforeEach(() => {
    installMemoryStorage();
  });

  it('saves and loads a valid deck', () => {
    const cards = generateDefaultDeck('Battlemage');
    const deck = createDeckList('My Deck', 'Battlemage', cards);
    const result = saveDeckList(deck);
    expect(result.ok).toBe(true);
    const loaded = loadSavedDecks();
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('My Deck');
    expect(loaded[0].cards).toEqual(cards);
  });

  it('rejects invalid deck size', () => {
    const deck = createDeckList('Bad', 'Warrior', ['mage_battlemage']);
    const result = saveDeckList(deck);
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('deletes by id', () => {
    const cards = generateDefaultDeck('Priest');
    const deck = createDeckList('X', 'Priest', cards);
    saveDeckList(deck);
    deleteSavedDeck(deck.id);
    expect(loadSavedDecks()).toHaveLength(0);
  });
});
