import { describe, it, expect } from 'vitest';
import {
  listLegalAttackTargets,
  isLegalAttackTarget,
  listLegalUnitTargets,
} from './targeting';
import { createGameState, createCardInstance } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

function setup() {
  const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
  const fillers = ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id);
  const deck = [mage.id, ...fillers];
  return createGameState('ai', 'P1', 'Battlemage', deck, 'P2', 'Warrior', deck, 99);
}

describe('targeting', () => {
  it('allows face when no taunt', () => {
    const state = setup();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    state.players[1].battlefield.fighters[0].card = createCardInstance(fighter);
    const legal = listLegalAttackTargets(state);
    expect(legal.canAttackPlayer).toBe(true);
    expect(isLegalAttackTarget(state, 'player')).toBe(true);
  });

  it('blocks face and restricts units when Taunt present', () => {
    const state = setup();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const taunt = createCardInstance(fighter);
    taunt.keywords = [{ keyword: 'Taunt' }];
    const normal = createCardInstance(fighter);
    state.players[1].battlefield.fighters[0].card = taunt;
    state.players[1].battlefield.fighters[1].card = normal;
    const legal = listLegalAttackTargets(state);
    expect(legal.canAttackPlayer).toBe(false);
    expect(legal.units).toHaveLength(1);
    expect(legal.units[0].instanceId).toBe(taunt.instanceId);
    expect(isLegalAttackTarget(state, 'player')).toBe(false);
    expect(isLegalAttackTarget(state, taunt.instanceId)).toBe(true);
    expect(isLegalAttackTarget(state, normal.instanceId)).toBe(false);
  });

  it('listLegalUnitTargets filters by controller and type', () => {
    const state = setup();
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const beast = ALL_CARDS.find(c => c.type === 'Beast')!;
    state.players[0].battlefield.fighters[0].card = createCardInstance(fighter);
    state.players[0].battlefield.beasts[0].card = createCardInstance(beast);
    const onlyBeasts = listLegalUnitTargets(state, {
      controller: 'self',
      types: ['Beast'],
    });
    expect(onlyBeasts).toHaveLength(1);
    expect(onlyBeasts[0].definitionId).toBe(beast.id);
  });
});
