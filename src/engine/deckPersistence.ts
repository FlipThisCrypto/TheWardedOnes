/**
 * Local deck list persistence (browser localStorage).
 * Server-safe: no-ops when window is undefined.
 */

import type { CardClass, DeckList } from './types';
import { validateDeck } from './deckUtils';

const STORAGE_KEY = 'warded_ones_saved_decks_v1';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadSavedDecks(): DeckList[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DeckList[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(d => d && typeof d.id === 'string' && Array.isArray(d.cards));
  } catch {
    return [];
  }
}

export function saveDeckList(deck: DeckList): { ok: boolean; error?: string } {
  if (!canUseStorage()) return { ok: false, error: 'Storage unavailable' };
  const validation = validateDeck(deck.cards);
  if (!validation.valid) {
    return { ok: false, error: validation.errors.join('; ') };
  }
  try {
    const existing = loadSavedDecks().filter(d => d.id !== deck.id);
    existing.push(deck);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to write storage' };
  }
}

export function deleteSavedDeck(id: string): void {
  if (!canUseStorage()) return;
  const next = loadSavedDecks().filter(d => d.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function createDeckList(
  name: string,
  playerClass: CardClass,
  cards: string[]
): DeckList {
  return {
    id: `deck_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6)}`,
    name,
    playerClass,
    cards: [...cards],
  };
}
