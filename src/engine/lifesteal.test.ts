import { describe, it, expect } from 'vitest';
import { applyLifesteal } from './lifesteal';
import { createCardInstance, createInitialPlayerState } from './gameEngine';
import { ALL_CARDS } from '../data/cards';
import { createRng } from './rng';

describe('lifesteal', () => {
  it('heals controller for hp damage when keyword present', () => {
    const player = createInitialPlayerState('p', 'P', 'Warrior', [], createRng(1));
    player.life = 20;
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.keywords = [{ keyword: 'Lifesteal' }];
    expect(applyLifesteal(player, unit, 5)).toBe(5);
    expect(player.life).toBe(25);
  });

  it('no-ops without keyword or zero damage', () => {
    const player = createInitialPlayerState('p', 'P', 'Warrior', [], createRng(1));
    player.life = 20;
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    expect(applyLifesteal(player, unit, 5)).toBe(0);
    unit.keywords = [{ keyword: 'Lifesteal' }];
    expect(applyLifesteal(player, unit, 0)).toBe(0);
    expect(player.life).toBe(20);
  });
});
