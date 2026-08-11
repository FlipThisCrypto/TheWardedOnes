import { describe, it, expect } from 'vitest';
import { and, isType, costAtMost, filterCards, isInjured } from './cardFilters';
import { createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('cardFilters', () => {
  it('filters fighters at cost <= 3', () => {
    const cards = ALL_CARDS.filter(c => c.type === 'Fighter')
      .slice(0, 5)
      .map(c => createCardInstance(c));
    const result = filterCards(cards, and(isType('Fighter'), costAtMost(3)));
    expect(result.every(c => {
      const d = ALL_CARDS.find(x => x.id === c.definitionId)!;
      return d.cost <= 3;
    })).toBe(true);
  });

  it('detects injured', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const u = createCardInstance(f);
    u.currentHp = 1;
    expect(filterCards([u], isInjured)).toHaveLength(1);
  });
});
