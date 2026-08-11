import { CardClass, DeckList, CardDefinition } from './types';
import { ALL_CARDS } from '../data/cards';

export const DECK_SIZE = 40;
export const MAX_MAGES = 1;
export const MAX_FIGHTERS = 6;
export const MAX_BEASTS = 10;
export const MAX_RELICS = 10;
export const MAX_TOTEMS = 5;
export const MAX_UTILITY = 8;

export interface DeckValidation {
  valid: boolean;
  errors: string[];
  counts: {
    total: number;
    mages: number;
    fighters: number;
    beasts: number;
    relics: number;
    totems: number;
    utility: number;
  };
}

export function validateDeck(cardIds: string[]): DeckValidation {
  const errors: string[] = [];
  const cards = cardIds.map(id => ALL_CARDS.find(c => c.id === id)).filter(Boolean) as CardDefinition[];
  
  const counts = {
    total: cards.length,
    mages: cards.filter(c => c.type === 'Mage').length,
    fighters: cards.filter(c => c.type === 'Fighter').length,
    beasts: cards.filter(c => c.type === 'Beast').length,
    relics: cards.filter(c => c.type === 'Relic').length,
    totems: cards.filter(c => c.type === 'Totem').length,
    utility: cards.filter(c => c.type === 'Utility').length,
  };
  
  if (counts.total !== DECK_SIZE) {
    errors.push(`Deck must have exactly ${DECK_SIZE} cards (currently ${counts.total}).`);
  }
  if (counts.mages > MAX_MAGES) {
    errors.push(`Maximum ${MAX_MAGES} Mage allowed (currently ${counts.mages}).`);
  }
  if (counts.mages === 0) {
    errors.push('Deck must include 1 Mage.');
  }
  if (counts.fighters > MAX_FIGHTERS) {
    errors.push(`Maximum ${MAX_FIGHTERS} Fighters allowed (currently ${counts.fighters}).`);
  }
  if (counts.beasts > MAX_BEASTS) {
    errors.push(`Maximum ${MAX_BEASTS} Beasts allowed (currently ${counts.beasts}).`);
  }
  if (counts.relics > MAX_RELICS) {
    errors.push(`Maximum ${MAX_RELICS} Relics allowed (currently ${counts.relics}).`);
  }
  if (counts.totems > MAX_TOTEMS) {
    errors.push(`Maximum ${MAX_TOTEMS} Totems allowed (currently ${counts.totems}).`);
  }
  if (counts.utility > MAX_UTILITY) {
    errors.push(`Maximum ${MAX_UTILITY} Utility cards allowed (currently ${counts.utility}).`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    counts,
  };
}

export function generateDefaultDeck(playerClass: CardClass): string[] {
  const classCards = ALL_CARDS.filter(c => c.cardClass === playerClass);
  const allCards = ALL_CARDS;
  
  const deck: string[] = [];
  
  // 1 Mage
  const mage = classCards.find(c => c.type === 'Mage');
  if (mage) deck.push(mage.id);
  
  // Fill fighters (prefer class, then others)
  const classFighters = classCards.filter(c => c.type === 'Fighter');
  const otherFighters = allCards.filter(c => c.type === 'Fighter' && c.cardClass !== playerClass);
  const fighters = [...classFighters, ...otherFighters];
  for (let i = 0; i < 6 && i < fighters.length; i++) {
    deck.push(fighters[i].id);
  }
  
  // Fill beasts
  const classBeasts = classCards.filter(c => c.type === 'Beast');
  const otherBeasts = allCards.filter(c => c.type === 'Beast' && c.cardClass !== playerClass);
  const beasts = [...classBeasts, ...otherBeasts];
  for (let i = 0; i < 10 && i < beasts.length; i++) {
    deck.push(beasts[i].id);
  }
  
  // Fill relics
  const classRelics = classCards.filter(c => c.type === 'Relic');
  const otherRelics = allCards.filter(c => c.type === 'Relic' && c.cardClass !== playerClass);
  const relics = [...classRelics, ...otherRelics];
  for (let i = 0; i < 10 && i < relics.length; i++) {
    deck.push(relics[i].id);
  }
  
  // Fill totems
  const classTotems = classCards.filter(c => c.type === 'Totem');
  const otherTotems = allCards.filter(c => c.type === 'Totem' && c.cardClass !== playerClass);
  const totems = [...classTotems, ...otherTotems];
  for (let i = 0; i < 5 && i < totems.length; i++) {
    deck.push(totems[i].id);
  }
  
  // Fill utility
  const classUtility = classCards.filter(c => c.type === 'Utility');
  const otherUtility = allCards.filter(c => c.type === 'Utility' && c.cardClass !== playerClass);
  const utility = [...classUtility, ...otherUtility];
  for (let i = 0; i < 8 && i < utility.length; i++) {
    deck.push(utility[i].id);
  }
  
  return deck;
}

export interface SaveDeckResult {
  ok: boolean;
  error?: string;
}

/** Persist deck only if it passes validateDeck. */
export function saveDeckToStorage(deck: DeckList): SaveDeckResult {
  if (typeof window === 'undefined') {
    return { ok: false, error: 'Storage unavailable' };
  }
  const validation = validateDeck(deck.cards);
  if (!validation.valid) {
    return { ok: false, error: validation.errors.join('; ') };
  }
  try {
    const decks = loadDecksFromStorage();
    const existing = decks.findIndex(d => d.id === deck.id);
    if (existing >= 0) {
      decks[existing] = deck;
    } else {
      decks.push(deck);
    }
    window.localStorage.setItem('warded-ones-decks', JSON.stringify(decks));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to write storage' };
  }
}

export function loadDecksFromStorage(): DeckList[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = window.localStorage.getItem('warded-ones-decks');
    if (!data) return [];
    const parsed = JSON.parse(data) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (d): d is DeckList =>
        !!d &&
        typeof d === 'object' &&
        typeof (d as DeckList).id === 'string' &&
        Array.isArray((d as DeckList).cards)
    );
  } catch {
    return [];
  }
}

export function deleteDeckFromStorage(deckId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const decks = loadDecksFromStorage().filter(d => d.id !== deckId);
    window.localStorage.setItem('warded-ones-decks', JSON.stringify(decks));
  } catch {
    // ignore
  }
}
