import { describe, it, expect } from 'vitest';
import { computeStatsWithTargets } from './continuousEffects';
import { createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('continuousEffects', () => {
  it('applies layered attack buffs on printed stats', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    const stats = computeStatsWithTargets(unit, [
      {
        id: 'm1',
        targetInstanceId: unit.instanceId,
        sourceId: 'totem',
        stat: 'attack',
        amount: 2,
        layer: 10,
      },
      {
        id: 'm2',
        targetInstanceId: unit.instanceId,
        sourceId: 'aura',
        stat: 'attack',
        amount: 1,
        layer: 20,
      },
    ]);
    expect(stats.attack).toBe(f.attack + 3);
  });

  it('ignores mods for other targets', () => {
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    const stats = computeStatsWithTargets(unit, [
      {
        id: 'x',
        targetInstanceId: 'other',
        sourceId: 's',
        stat: 'attack',
        amount: 99,
      },
    ]);
    expect(stats.attack).toBe(f.attack);
  });
});
