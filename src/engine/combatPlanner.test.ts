import { describe, it, expect } from 'vitest';
import { planAttackLines, bestAttackLine } from './combatPlanner';
import { createMatchSession, sessionDispatch } from './matchSession';
import { createCardInstance } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { ALL_CARDS } from '../data/cards';
import { applyPlayerAction } from './actions';

describe('combatPlanner', () => {
  it('suggests face attack when legal', () => {
    let s = createMatchSession({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: generateDefaultDeck('Battlemage'),
      p2Deck: generateDefaultDeck('Warrior'),
      seed: 3,
    });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    // force combat with an attacker
    let state = s.state;
    state.phase = 'combat';
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.canAttack = true;
    unit.hasAttacked = false;
    state.players[0].battlefield.fighters[0].card = unit;
    const lines = planAttackLines(state);
    expect(lines.length).toBeGreaterThan(0);
    expect(bestAttackLine(state)?.targetId).toBe('player');
  });
});
