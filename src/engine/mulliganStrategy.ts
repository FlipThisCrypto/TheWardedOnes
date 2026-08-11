/**
 * Shared mulligan heuristics for human suggestions and AI.
 */

import type { CardInstance } from './types';
import { getCardById } from '../data/cards';

export interface MulliganAdvice {
  replaceIndices: number[];
  reasons: string[];
}

/**
 * Suggest replacing expensive openers (cost >= threshold) and duplicate high-cost cards.
 */
export function suggestMulligan(
  hand: CardInstance[],
  opts: { costThreshold?: number; keepCurveMax?: number } = {}
): MulliganAdvice {
  const threshold = opts.costThreshold ?? 5;
  const replaceIndices: number[] = [];
  const reasons: string[] = [];
  const costs = hand.map(c => getCardById(c.definitionId)?.cost ?? 0);

  hand.forEach((card, idx) => {
    const def = getCardById(card.definitionId);
    if (!def) return;
    if (def.cost >= threshold) {
      replaceIndices.push(idx);
      reasons.push(`${def.name} costs ${def.cost} (>= ${threshold})`);
    }
  });

  // If no 1-2 drops and hand is all mid, flag highest cost extra
  const hasEarly = costs.some(c => c <= 2);
  if (!hasEarly && replaceIndices.length === 0 && hand.length > 0) {
    let maxIdx = 0;
    for (let i = 1; i < costs.length; i++) {
      if (costs[i] > costs[maxIdx]) maxIdx = i;
    }
    replaceIndices.push(maxIdx);
    reasons.push('No early play — ship highest cost card');
  }

  return { replaceIndices: Array.from(new Set(replaceIndices)).sort((a, b) => a - b), reasons };
}
