/**
 * Card catalog integrity checks — ensures ALL_CARDS is a valid playable set.
 */

import { ALL_CARDS, getCardById } from './cards';
import { ABILITIES } from '../engine/abilities';
import type { CardDefinition, CardType } from '../engine/types';
import { KEYWORD_REGISTRY, type Keyword } from '../engine/keywords';

export interface CatalogIssue {
  cardId: string;
  message: string;
}

const UNIT_TYPES: CardType[] = ['Mage', 'Fighter', 'Beast', 'Totem'];

export function validateCardDefinition(card: CardDefinition): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const id = card.id || '(missing id)';

  if (!card.id || !/^[a-z0-9_]+$/.test(card.id)) {
    issues.push({ cardId: id, message: 'id must match ^[a-z0-9_]+$' });
  }
  if (!card.name?.trim()) {
    issues.push({ cardId: id, message: 'name is required' });
  }
  if (card.cost < 0 || card.cost > 10) {
    issues.push({ cardId: id, message: `cost ${card.cost} out of range 0-10` });
  }
  if (card.level < 1 || card.level > 3) {
    issues.push({ cardId: id, message: `level ${card.level} invalid` });
  }
  if (!card.elements || card.elements.length === 0) {
    issues.push({ cardId: id, message: 'at least one element required' });
  }
  if (UNIT_TYPES.includes(card.type)) {
    if (card.hp < 1) {
      issues.push({ cardId: id, message: 'unit/totem hp must be >= 1' });
    }
  }
  for (const abilityId of card.abilities ?? []) {
    if (!ABILITIES[abilityId]) {
      issues.push({ cardId: id, message: `unknown ability "${abilityId}"` });
    }
  }
  for (const kw of card.keywords ?? []) {
    if (!(kw.keyword in KEYWORD_REGISTRY)) {
      issues.push({ cardId: id, message: `unknown keyword "${kw.keyword}"` });
    } else if (kw.keyword === 'Ward' && (kw.value === undefined || kw.value < 0)) {
      issues.push({ cardId: id, message: 'Ward requires non-negative value' });
    }
    void (kw.keyword as Keyword);
  }
  if (card.evolvesFrom && !getCardById(card.evolvesFrom) && !ALL_CARDS.some(c => c.id === card.evolvesFrom)) {
    // evolvesFrom may reference cards in same set; check ALL_CARDS
    if (!ALL_CARDS.some(c => c.id === card.evolvesFrom)) {
      issues.push({ cardId: id, message: `evolvesFrom "${card.evolvesFrom}" not found` });
    }
  }

  return issues;
}

export function validateCardCatalog(cards: CardDefinition[] = ALL_CARDS): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  const seen = new Set<string>();

  for (const card of cards) {
    if (seen.has(card.id)) {
      issues.push({ cardId: card.id, message: 'duplicate id' });
    }
    seen.add(card.id);
    issues.push(...validateCardDefinition(card));
  }

  return issues;
}

export function isCatalogValid(cards: CardDefinition[] = ALL_CARDS): boolean {
  return validateCardCatalog(cards).length === 0;
}
