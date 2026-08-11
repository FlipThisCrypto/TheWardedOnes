/**
 * Deck list import/export (JSON text).
 */

import type { DeckList } from './types';
import { validateDeck } from './deckUtils';
import { safeJsonParse } from '../lib/safeJson';

export function exportDeckToJson(deck: DeckList): string {
  return JSON.stringify(
    {
      id: deck.id,
      name: deck.name,
      playerClass: deck.playerClass,
      cards: deck.cards,
      formatVersion: 1,
    },
    null,
    2
  );
}

export function importDeckFromJson(raw: string): { ok: true; deck: DeckList } | { ok: false; error: string } {
  const parsed = safeJsonParse<Partial<DeckList> & { formatVersion?: number }>(raw, {});
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Invalid JSON' };
  }
  if (typeof parsed.name !== 'string' || !Array.isArray(parsed.cards)) {
    return { ok: false, error: 'Missing name or cards' };
  }
  if (typeof parsed.playerClass !== 'string') {
    return { ok: false, error: 'Missing playerClass' };
  }
  const cards = parsed.cards.filter((c): c is string => typeof c === 'string');
  const validation = validateDeck(cards);
  if (!validation.valid) {
    return { ok: false, error: validation.errors.join('; ') };
  }
  return {
    ok: true,
    deck: {
      id: typeof parsed.id === 'string' ? parsed.id : `deck_import_${Date.now()}`,
      name: parsed.name,
      playerClass: parsed.playerClass as DeckList['playerClass'],
      cards,
    },
  };
}
