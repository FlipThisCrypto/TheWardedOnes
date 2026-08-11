import { describe, it, expect } from 'vitest';
import {
  hasKeyword,
  getKeywordValue,
  removeKeyword,
  getKeywordDescription,
  KeywordData,
} from './keywords';

describe('keywords helpers', () => {
  const sample: KeywordData[] = [
    { keyword: 'Ward', value: 3 },
    { keyword: 'Pierce' },
    { keyword: 'Fortify' },
  ];

  it('hasKeyword finds present and missing keywords', () => {
    expect(hasKeyword(sample, 'Ward')).toBe(true);
    expect(hasKeyword(sample, 'Haste')).toBe(false);
    expect(hasKeyword(undefined, 'Ward')).toBe(false);
  });

  it('Hex suppresses other keywords but not Hex itself', () => {
    const hexed: KeywordData[] = [
      { keyword: 'Hex' },
      { keyword: 'Ward', value: 5 },
      { keyword: 'Taunt' },
    ];
    expect(hasKeyword(hexed, 'Hex')).toBe(true);
    expect(hasKeyword(hexed, 'Ward')).toBe(false);
    expect(hasKeyword(hexed, 'Taunt')).toBe(false);
  });

  it('getKeywordValue returns value or 0', () => {
    expect(getKeywordValue(sample, 'Ward')).toBe(3);
    expect(getKeywordValue(sample, 'Pierce')).toBe(0);
    expect(getKeywordValue(undefined, 'Ward')).toBe(0);
  });

  it('removeKeyword drops matching entries only', () => {
    const next = removeKeyword(sample, 'Ward');
    expect(hasKeyword(next, 'Ward')).toBe(false);
    expect(hasKeyword(next, 'Pierce')).toBe(true);
    expect(next).toHaveLength(2);
  });

  it('getKeywordDescription covers every keyword id', () => {
    const keywords: KeywordData[] = [
      { keyword: 'Ward', value: 2 },
      { keyword: 'Fortify' },
      { keyword: 'Pierce' },
      { keyword: 'Lifesteal' },
      { keyword: 'Haste' },
      { keyword: 'Taunt' },
      { keyword: 'Hex' },
      { keyword: 'Echo' },
    ];
    for (const kw of keywords) {
      const desc = getKeywordDescription(kw);
      expect(desc.length).toBeGreaterThan(0);
      expect(desc).toContain(kw.keyword === 'Ward' ? 'Ward' : kw.keyword);
    }
  });
});
