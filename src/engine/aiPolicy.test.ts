import { describe, it, expect } from 'vitest';
import { choosePolicyAction, runPolicyTurn, boardThreat } from './aiPolicy';
import { createMatchSession, sessionDispatch } from './matchSession';
import { generateDefaultDeck } from './deckUtils';

function mainState() {
  let s = createMatchSession({
    mode: 'ai',
    p1Class: 'Battlemage',
    p2Class: 'Warrior',
    p1Deck: generateDefaultDeck('Battlemage'),
    p2Deck: generateDefaultDeck('Warrior'),
    seed: 77,
  });
  s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
  s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
  return s.state;
}

describe('aiPolicy', () => {
  it('chooses a legal non-concede action', () => {
    const state = mainState();
    const action = choosePolicyAction(state, 'balanced');
    expect(action.type).not.toBe('CONCEDE');
  });

  it('runPolicyTurn progresses without throwing', () => {
    const state = mainState();
    const next = runPolicyTurn(state, 'aggro', 8);
    expect(next).toBeTruthy();
    expect(boardThreat(next, 0)).toBeGreaterThanOrEqual(0);
  });
});
