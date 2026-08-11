import { describe, it, expect } from 'vitest';
import { interpretEffect } from './effectInterpreter';
import { SAMPLE_SCRIPTS } from './effectIr';
import { createGameState, createCardInstance } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { ALL_CARDS } from '../data/cards';

describe('effectInterpreter', () => {
  it('fireball deals damage to chosen enemy', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 1);
    const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
    const fighter = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const source = createCardInstance(mage);
    const target = createCardInstance(fighter);
    target.currentHp = 10;
    target.currentDefense = 0;
    target.keywords = [];
    state.players[0].battlefield.mage.card = source;
    state.players[1].battlefield.fighters[0].card = target;

    const result = interpretEffect(state, SAMPLE_SCRIPTS.fireball, {
      source,
      controllerIndex: 0,
      chosenTargetId: target.instanceId,
    });
    const after = result.state.players[1].battlefield.fighters[0].card;
    expect(after === null || after.currentHp < 10).toBe(true);
    expect(result.logs.some(l => l.includes('damage'))).toBe(true);
  });

  it('draw script increases hand size', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 2);
    const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
    const source = createCardInstance(mage);
    state.players[0].battlefield.mage.card = source;
    const before = state.players[0].hand.length;
    const result = interpretEffect(state, SAMPLE_SCRIPTS.arcane_insight, {
      source,
      controllerIndex: 0,
    });
    expect(result.state.players[0].hand.length).toBe(before + 2);
  });
});
