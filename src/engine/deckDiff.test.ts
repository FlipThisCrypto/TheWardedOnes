import { describe, it, expect } from 'vitest';
import { diffDecks, manaCurve, averageCost } from './deckDiff';

describe('deckDiff', () => {
  it('diffs multisets', () => {
    const d = diffDecks(['a', 'a', 'b'], ['a', 'c']);
    expect(d.shared).toEqual(['a']);
    expect(d.onlyA.sort()).toEqual(['a', 'b']);
    expect(d.onlyB).toEqual(['c']);
  });

  it('mana curve buckets', () => {
    expect(manaCurve([1, 1, 3, 10])[1]).toBe(2);
    expect(manaCurve([10])[7]).toBe(1);
    expect(averageCost([2, 4])).toBe(3);
  });
});
