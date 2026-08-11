import { describe, it, expect } from 'vitest';
import { applyHotTicks, applyDotTicks, tickStatusDurations } from './statusEffects';
import { createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('statusEffects', () => {
  it('applyHotTicks heals up to max hp', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.currentHp = 1;
    unit.statusEffects.push({
      id: 'h1',
      name: 'Regrowth',
      type: 'hot',
      turnsRemaining: 2,
      value: 3,
    });
    const healed = applyHotTicks(unit);
    expect(healed).toBeGreaterThan(0);
    expect(unit.currentHp).toBeLessThanOrEqual(f.hp);
  });

  it('applyDotTicks reduces hp', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.currentHp = 10;
    unit.statusEffects.push({
      id: 'd1',
      name: 'Burn',
      type: 'dot',
      turnsRemaining: 2,
      value: 2,
    });
    expect(applyDotTicks(unit)).toBe(2);
    expect(unit.currentHp).toBe(8);
  });

  it('tickStatusDurations expires buffs and reverts defense', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.currentDefense = 5;
    unit.statusEffects.push({
      id: 'b1',
      name: 'Barrier',
      type: 'buff',
      turnsRemaining: 1,
      value: 2,
      stat: 'defense',
    });
    tickStatusDurations(unit);
    expect(unit.statusEffects).toHaveLength(0);
    expect(unit.currentDefense).toBe(3);
  });
});
