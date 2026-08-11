import { describe, it, expect } from 'vitest';
import { ABILITIES, getAbility } from './abilities';
import { ALL_CARDS } from '../data/cards';

describe('ability library', () => {
  it('every ability has required fields', () => {
    for (const [id, ability] of Object.entries(ABILITIES)) {
      expect(ability.id).toBe(id);
      expect(ability.name.length).toBeGreaterThan(0);
      expect(ability.description.length).toBeGreaterThan(0);
      expect(ability.targetType).toBeTruthy();
    }
  });

  it('getAbility returns undefined for unknown', () => {
    expect(getAbility('not_real_ability_xyz')).toBeUndefined();
  });

  it('every card ability id resolves', () => {
    for (const card of ALL_CARDS) {
      for (const aid of card.abilities) {
        expect(getAbility(aid), `${card.id} -> ${aid}`).toBeDefined();
      }
    }
  });
});
