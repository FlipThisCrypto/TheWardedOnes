import { describe, it, expect } from 'vitest';
import { applyDamageToUnit, applyDamageToPlayer } from './damage';
import type { CardInstance } from './types';

function makeUnit(overrides: Partial<CardInstance> = {}): CardInstance {
  return {
    instanceId: 'u1',
    definitionId: 'test',
    currentHp: 10,
    currentAttack: 5,
    currentDefense: 2,
    currentSpeed: 3,
    attachedRelics: [],
    keywords: [],
    statusEffects: [],
    canAttack: true,
    hasAttacked: false,
    turnsInPlay: 1,
    abilitiesUsedThisTurn: [],
    ...overrides,
  };
}

describe('applyDamageToUnit', () => {
  it('applies full damage when no mitigation', () => {
    const u = makeUnit({ currentHp: 10 });
    const r = applyDamageToUnit(u, { amount: 4 });
    expect(r.hpDamage).toBe(4);
    expect(u.currentHp).toBe(6);
    expect(r.killed).toBe(false);
  });

  it('Ward absorbs damage before HP', () => {
    const u = makeUnit({
      currentHp: 10,
      keywords: [{ keyword: 'Ward', value: 3 }],
    });
    const r = applyDamageToUnit(u, { amount: 5 });
    expect(r.wardAbsorbed).toBe(3);
    expect(r.hpDamage).toBe(2);
    expect(u.currentHp).toBe(8);
    expect(u.keywords?.some(k => k.keyword === 'Ward')).toBe(false);
  });

  it('Ward fully absorbs when value >= damage', () => {
    const u = makeUnit({
      currentHp: 10,
      keywords: [{ keyword: 'Ward', value: 5 }],
    });
    const r = applyDamageToUnit(u, { amount: 3 });
    expect(r.hpDamage).toBe(0);
    expect(u.currentHp).toBe(10);
    expect(u.keywords?.find(k => k.keyword === 'Ward')?.value).toBe(2);
  });

  it('Pierce skips Ward', () => {
    const u = makeUnit({
      currentHp: 10,
      keywords: [{ keyword: 'Ward', value: 99 }],
    });
    const r = applyDamageToUnit(u, { amount: 4, pierceWards: true });
    expect(r.hpDamage).toBe(4);
    expect(u.currentHp).toBe(6);
    expect(u.keywords?.find(k => k.keyword === 'Ward')?.value).toBe(99);
  });

  it('Fortify reduces damage by 1 (min 1)', () => {
    const u = makeUnit({
      currentHp: 10,
      keywords: [{ keyword: 'Fortify' }],
    });
    const r = applyDamageToUnit(u, { amount: 1, minimumOne: true });
    expect(r.hpDamage).toBe(1);
    expect(u.currentHp).toBe(9);
  });

  it('marks killed when HP reaches 0', () => {
    const u = makeUnit({ currentHp: 3 });
    const r = applyDamageToUnit(u, { amount: 10 });
    expect(r.killed).toBe(true);
    expect(u.currentHp).toBeLessThanOrEqual(0);
  });
});

describe('applyDamageToPlayer', () => {
  it('deals at least 1 damage', () => {
    const r = applyDamageToPlayer(30, 0);
    expect(r.damage).toBe(1);
    expect(r.life).toBe(29);
  });
});
