import { describe, it, expect } from 'vitest';
import {
  getElementModifier,
  STRONG_MODIFIER,
  WEAK_MODIFIER,
  ELEMENT_STRENGTHS,
} from './elements';
import type { Element } from './types';

describe('getElementModifier', () => {
  it('applies strength bonus when attacker is strong against defender', () => {
    // Fire strong vs Nature
    expect(getElementModifier(['Fire'], ['Nature'])).toBe(STRONG_MODIFIER);
  });

  it('applies weakness penalty when defender is strong against attacker', () => {
    // Water is strong vs Fire → Fire attacking Water gets WEAK_MODIFIER
    expect(getElementModifier(['Fire'], ['Water'])).toBe(WEAK_MODIFIER);
  });

  it('returns 0 for neutral matchups', () => {
    expect(getElementModifier(['Fire'], ['Ice'])).toBe(0);
  });

  it('sums modifiers across multi-element cards', () => {
    // Fire vs Nature +3, Fire vs Water -2 (Water strong vs Fire), Lightning vs Water +3
    const mod = getElementModifier(['Fire', 'Lightning'], ['Nature', 'Water']);
    expect(mod).toBe(STRONG_MODIFIER + WEAK_MODIFIER + STRONG_MODIFIER);
  });

  it('covers every element strength pair without throwing', () => {
    const elements = Object.keys(ELEMENT_STRENGTHS) as Element[];
    for (const a of elements) {
      for (const d of elements) {
        expect(typeof getElementModifier([a], [d])).toBe('number');
      }
    }
  });
});
