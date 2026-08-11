import { describe, it, expect } from 'vitest';
import { suggestMulligan } from './mulliganStrategy';
import { createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('mulliganStrategy', () => {
  it('flags high cost cards', () => {
    const expensive = ALL_CARDS.find(c => c.cost >= 5)!;
    const cheap = ALL_CARDS.find(c => c.cost <= 2)!;
    const hand = [createCardInstance(expensive), createCardInstance(cheap)];
    const advice = suggestMulligan(hand);
    expect(advice.replaceIndices).toContain(0);
    expect(advice.reasons.length).toBeGreaterThan(0);
  });
});
