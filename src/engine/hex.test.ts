import { describe, it, expect } from 'vitest';
import { applyHex, clearHex, isHexed } from './hex';
import { hasKeyword } from './keywords';
import { createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('hex', () => {
  it('suppresses Ward while hexed', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.keywords = [{ keyword: 'Ward', value: 4 }, { keyword: 'Taunt' }];
    expect(hasKeyword(unit.keywords, 'Ward')).toBe(true);
    applyHex(unit);
    expect(isHexed(unit)).toBe(true);
    expect(hasKeyword(unit.keywords, 'Ward')).toBe(false);
    expect(hasKeyword(unit.keywords, 'Taunt')).toBe(false);
    expect(hasKeyword(unit.keywords, 'Hex')).toBe(true);
    clearHex(unit);
    expect(hasKeyword(unit.keywords, 'Ward')).toBe(true);
  });
});
