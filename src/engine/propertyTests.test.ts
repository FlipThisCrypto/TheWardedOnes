import { describe, it, expect } from 'vitest';
import { createMatchSession, sessionDispatch } from './matchSession';
import { generateDefaultDeck } from './deckUtils';
import { checkMatchInvariants } from './assertInvariants';
import { listLegalActions } from './legalMoves';
import { applyPlayerAction } from './actions';

describe('property-style match fuzz (deterministic seeds)', () => {
  it('random legal actions preserve invariants for many seeds', () => {
    for (let seed = 1; seed <= 15; seed++) {
      let s = createMatchSession({
        mode: 'ai',
        p1Class: 'Battlemage',
        p2Class: 'Warrior',
        p1Deck: generateDefaultDeck('Battlemage'),
        p2Deck: generateDefaultDeck('Warrior'),
        seed,
      });
      s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
      s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
      let state = s.state;
      for (let step = 0; step < 20; step++) {
        const legal = listLegalActions(state).filter(a => a.type !== 'CONCEDE');
        if (legal.length === 0) break;
        const pick = legal[step % legal.length];
        const r = applyPlayerAction(state, pick);
        state = r.state;
        const violations = checkMatchInvariants(state);
        expect(violations, `seed ${seed} step ${step}`).toEqual([]);
        if (state.gameOver) break;
      }
    }
  });
});
