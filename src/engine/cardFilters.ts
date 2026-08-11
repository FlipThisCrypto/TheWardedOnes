/**
 * Composable card filters for targeting and deck search.
 */

import type { CardDefinition, CardInstance, CardType, Element } from './types';
import { getCardById } from '../data/cards';
import { hasKeyword, type Keyword } from './keywords';

export type CardPredicate = (card: CardInstance, def: CardDefinition) => boolean;

export function and(...preds: CardPredicate[]): CardPredicate {
  return (c, d) => preds.every(p => p(c, d));
}

export function or(...preds: CardPredicate[]): CardPredicate {
  return (c, d) => preds.some(p => p(c, d));
}

export function not(pred: CardPredicate): CardPredicate {
  return (c, d) => !pred(c, d);
}

export const isType = (type: CardType): CardPredicate => (_c, d) => d.type === type;
export const hasElement = (el: Element): CardPredicate => (_c, d) => d.elements.includes(el);
export const costAtMost = (n: number): CardPredicate => (_c, d) => d.cost <= n;
export const isInjured: CardPredicate = (c, d) => c.currentHp < d.hp;
export const hasKw = (kw: Keyword): CardPredicate => (c) => hasKeyword(c.keywords, kw);

export function filterCards(cards: CardInstance[], pred: CardPredicate): CardInstance[] {
  return cards.filter(c => {
    const d = getCardById(c.definitionId);
    return d ? pred(c, d) : false;
  });
}
