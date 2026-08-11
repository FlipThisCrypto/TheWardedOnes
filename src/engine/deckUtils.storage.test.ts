import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveDeckToStorage,
  loadDecksFromStorage,
  deleteDeckFromStorage,
  generateDefaultDeck,
} from './deckUtils';

function installMemoryStorage() {
  const store = new Map<string, string>();
  const localStorage: Storage = {
    get length() { return store.size; },
    clear: () => { store.clear(); },
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    key: (i: number) => Array.from(store.keys())[i] ?? null,
  };
  (globalThis as unknown as { window: Window }).window = {
    localStorage,
  } as Window;
}

describe('deckUtils storage', () => {
  beforeEach(() => installMemoryStorage());

  it('refuses invalid decks', () => {
    const result = saveDeckToStorage({
      id: 'x',
      name: 'bad',
      playerClass: 'Warrior',
      cards: [],
    });
    expect(result.ok).toBe(false);
    expect(loadDecksFromStorage()).toHaveLength(0);
  });

  it('saves valid decks and deletes them', () => {
    const cards = generateDefaultDeck('Guardian');
    const result = saveDeckToStorage({
      id: 'g1',
      name: 'Guard',
      playerClass: 'Guardian',
      cards,
    });
    expect(result.ok).toBe(true);
    expect(loadDecksFromStorage()).toHaveLength(1);
    deleteDeckFromStorage('g1');
    expect(loadDecksFromStorage()).toHaveLength(0);
  });

  it('ignores corrupt storage JSON', () => {
    window.localStorage.setItem('warded-ones-decks', '{not json');
    expect(loadDecksFromStorage()).toEqual([]);
  });
});
