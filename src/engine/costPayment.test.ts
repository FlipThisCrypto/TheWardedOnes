import { describe, it, expect } from 'vitest';
import { canPayCost, payCost } from './costPayment';
import { createInitialPlayerState, createCardInstance } from './gameEngine';
import { createRng } from './rng';
import { ALL_CARDS } from '../data/cards';

describe('costPayment', () => {
  it('resource cost gate', () => {
    const p = createInitialPlayerState('p', 'P', 'Warrior', [], createRng(1));
    p.resources = 2;
    expect(canPayCost(p, { type: 'resource', amount: 3 }).payable).toBe(false);
    expect(canPayCost(p, { type: 'resource', amount: 2 }).payable).toBe(true);
    payCost(p, { type: 'resource', amount: 2 });
    expect(p.resources).toBe(0);
  });

  it('and costs require all', () => {
    const p = createInitialPlayerState('p', 'P', 'Warrior', [], createRng(1));
    p.resources = 1;
    p.life = 30;
    const cost = {
      type: 'and' as const,
      costs: [
        { type: 'resource' as const, amount: 1 },
        { type: 'life' as const, amount: 3 },
      ],
    };
    expect(canPayCost(p, cost).payable).toBe(true);
    payCost(p, cost);
    expect(p.resources).toBe(0);
    expect(p.life).toBe(27);
  });

  it('discard cost moves cards to gy', () => {
    const p = createInitialPlayerState('p', 'P', 'Warrior', [], createRng(1));
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    p.hand = [createCardInstance(f), createCardInstance(f)];
    payCost(p, { type: 'discard', count: 1 });
    expect(p.hand).toHaveLength(1);
    expect(p.graveyard).toHaveLength(1);
  });
});
