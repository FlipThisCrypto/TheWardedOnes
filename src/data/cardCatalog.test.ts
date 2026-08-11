import { describe, it, expect } from 'vitest';
import { ALL_CARDS } from './cards';
import { validateCardCatalog, isCatalogValid, validateCardDefinition } from './cardCatalog';
import type { CardDefinition } from '../engine/types';

describe('card catalog integrity', () => {
  it('ALL_CARDS has no integrity issues', () => {
    const issues = validateCardCatalog(ALL_CARDS);
    if (issues.length > 0) {
      // fail with readable dump
      expect(issues).toEqual([]);
    }
    expect(isCatalogValid()).toBe(true);
  });

  it('ALL_CARDS has unique ids', () => {
    const ids = ALL_CARDS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card is retrievable by getCardById', async () => {
    const { getCardById } = await import('./cards');
    for (const c of ALL_CARDS) {
      expect(getCardById(c.id)?.name).toBe(c.name);
    }
  });

  it('flags unknown ability ids', () => {
    const bad: CardDefinition = {
      id: 'bad_card',
      name: 'Bad',
      cardClass: 'Warrior',
      elements: ['Fire'],
      type: 'Fighter',
      level: 1,
      cost: 1,
      hp: 5,
      attack: 2,
      defense: 1,
      speed: 3,
      abilities: ['not_a_real_ability'],
      flavorText: 'x',
    };
    const issues = validateCardDefinition(bad);
    expect(issues.some(i => i.message.includes('unknown ability'))).toBe(true);
  });
});
