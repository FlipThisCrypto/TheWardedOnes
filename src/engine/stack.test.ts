import { describe, it, expect } from 'vitest';
import { createEmptyStack, pushStack, resolveFully, resolveTop } from './stack';
import { SAMPLE_SCRIPTS } from './effectIr';
import { createGameState, createCardInstance } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { ALL_CARDS } from '../data/cards';

describe('resolution stack', () => {
  it('resolves LIFO order', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, 4);
    const mage = createCardInstance(ALL_CARDS.find(c => c.type === 'Mage')!);
    state.players[0].battlefield.mage.card = mage;
    const beforeHand = state.players[0].hand.length;

    let stack = createEmptyStack();
    stack = pushStack(stack, {
      name: 'First',
      controllerIndex: 0,
      script: SAMPLE_SCRIPTS.arcane_insight,
      ctx: { source: mage, controllerIndex: 0 },
      sourceInstanceId: mage.instanceId,
    });
    stack = pushStack(stack, {
      name: 'Second',
      controllerIndex: 0,
      script: SAMPLE_SCRIPTS.arcane_insight,
      ctx: { source: mage, controllerIndex: 0 },
      sourceInstanceId: mage.instanceId,
    });
    expect(stack.objects).toHaveLength(2);
    const top = resolveTop(state, stack);
    expect(top.resolved?.name).toBe('Second');
    const all = resolveFully(top.state, top.stack);
    expect(all.resolvedCount).toBe(1);
    expect(all.state.players[0].hand.length).toBe(beforeHand + 4);
  });
});
