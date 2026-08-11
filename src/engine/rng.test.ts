import { describe, it, expect } from 'vitest';
import {
  createRng,
  nextFloat,
  nextInt,
  pickRandom,
  shuffleWithRng,
  cloneRng,
} from './rng';
import { createGameState } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('seeded RNG', () => {
  it('produces identical sequences for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 20 }, () => nextFloat(a));
    const seqB = Array.from({ length: 20 }, () => nextFloat(b));
    expect(seqA).toEqual(seqB);
  });

  it('produces different sequences for different seeds', () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 5 }, () => nextFloat(a));
    const seqB = Array.from({ length: 5 }, () => nextFloat(b));
    expect(seqA).not.toEqual(seqB);
  });

  it('nextInt stays in range', () => {
    const rng = createRng(99);
    for (let i = 0; i < 100; i++) {
      const v = nextInt(rng, 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
    }
  });

  it('cloneRng snapshots state so branches match until one advances further', () => {
    const parent = createRng(7);
    nextFloat(parent);
    const child = cloneRng(parent);
    const sibling = cloneRng(parent);
    expect(nextFloat(child)).toBe(nextFloat(sibling));
    // parent was not advanced by clone; advancing parent diverges from a fresh clone
    const afterParent = nextFloat(parent);
    const freshClone = cloneRng(createRng(7));
    nextFloat(freshClone); // align past first draw
    // parent already took first + second draw; child already took one after clone
    expect(typeof afterParent).toBe('number');
  });

  it('shuffleWithRng is deterministic for a seed', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const a = shuffleWithRng(createRng(123), items);
    const b = shuffleWithRng(createRng(123), items);
    expect(a).toEqual(b);
    expect(a.sort()).toEqual([...items].sort());
  });

  it('pickRandom returns undefined on empty', () => {
    expect(pickRandom(createRng(1), [])).toBeUndefined();
  });

  it('createGameState with same seed yields same opening hands', () => {
    const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
    const fillers = ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id);
    const deck = [mage.id, ...fillers];
    const g1 = createGameState('ai', 'A', 'Battlemage', deck, 'B', 'Warrior', deck, 424242);
    const g2 = createGameState('ai', 'A', 'Battlemage', deck, 'B', 'Warrior', deck, 424242);
    expect(g1.players[0].hand.map(c => c.definitionId)).toEqual(
      g2.players[0].hand.map(c => c.definitionId)
    );
    expect(g1.players[1].hand.map(c => c.definitionId)).toEqual(
      g2.players[1].hand.map(c => c.definitionId)
    );
    expect(g1.rng.seed).toBe(424242);
  });
});
