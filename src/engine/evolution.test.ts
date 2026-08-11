import { describe, it, expect } from 'vitest';
import { canEvolve, applyEvolution, findEvolutionBase } from './evolution';
import { createGameState, createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

function playerWith() {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const deck = [mage.id, ...ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id)];
  const state = createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck, 11);
  return state.players[0];
}

describe('evolution', () => {
  it('canEvolve requires base on board for L2+', () => {
    const player = playerWith();
    const evo = ALL_CARDS.find(c => c.level >= 2 && c.evolvesFrom);
    if (!evo) {
      // catalog may not include evolution chains yet — still exercise L1 path
      const l1 = ALL_CARDS.find(c => c.level === 1)!;
      expect(canEvolve(player, l1)).toBe(true);
      return;
    }
    expect(canEvolve(player, evo)).toBe(false);
    const base = createCardInstance(ALL_CARDS.find(c => c.id === evo.evolvesFrom)!);
    player.battlefield.fighters[0].card = base;
    expect(canEvolve(player, evo)).toBe(true);
    expect(findEvolutionBase(player, evo)?.instanceId).toBe(base.instanceId);
  });

  it('applyEvolution transfers relics and preserves missing HP', () => {
    const player = playerWith();
    // Synthetic chain using two fighters
    const baseDef = ALL_CARDS.find(c => c.type === 'Fighter' && c.level === 1)!;
    const evoDef = {
      ...baseDef,
      id: 'test_evo',
      level: 2 as const,
      hp: baseDef.hp + 5,
      evolvesFrom: baseDef.id,
    };
    const base = createCardInstance(baseDef);
    base.currentHp = Math.max(1, baseDef.hp - 3);
    base.attachedRelics = ['relic_inst_1'];
    player.battlefield.fighters[0].card = base;
    const evo = createCardInstance(evoDef);
    expect(applyEvolution(player, evo, evoDef)).toBe(true);
    expect(player.battlefield.fighters[0].card?.instanceId).toBe(evo.instanceId);
    expect(evo.attachedRelics).toEqual(['relic_inst_1']);
    expect(evo.currentHp).toBe(evoDef.hp - 3);
    expect(player.graveyard.some(c => c.instanceId === base.instanceId)).toBe(true);
  });
});
