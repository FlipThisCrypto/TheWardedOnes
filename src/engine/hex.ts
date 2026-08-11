/**
 * Hex keyword application helpers.
 */

import type { CardInstance } from './types';
import { hasKeywordRaw } from './keywords';

/** Apply Hex status keyword to a unit (suppresses other keywords via hasKeyword). */
export function applyHex(target: CardInstance): void {
  if (!target.keywords) target.keywords = [];
  if (!hasKeywordRaw(target.keywords, 'Hex')) {
    target.keywords.push({ keyword: 'Hex' });
  }
}

export function clearHex(target: CardInstance): void {
  if (!target.keywords) return;
  target.keywords = target.keywords.filter(k => k.keyword !== 'Hex');
}

export function isHexed(target: CardInstance): boolean {
  return hasKeywordRaw(target.keywords, 'Hex');
}
