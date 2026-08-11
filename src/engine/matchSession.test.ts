import { describe, it, expect } from 'vitest';
import {
  createMatchSession,
  sessionDispatch,
  sessionLegalActions,
  sessionInvariants,
  sessionMetrics,
} from './matchSession';
import { generateDefaultDeck } from './deckUtils';

describe('matchSession', () => {
  it('runs mulligan into main via dispatch', () => {
    let s = createMatchSession({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: generateDefaultDeck('Battlemage'),
      p2Deck: generateDefaultDeck('Warrior'),
      seed: 42,
    });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    expect(s.state.phase).toBe('main');
    expect(sessionInvariants(s)).toEqual([]);
    expect(sessionLegalActions(s).some(a => a.type === 'END_TURN')).toBe(true);
    expect(sessionMetrics(s).p0.life).toBe(30);
  });

  it('idempotency blocks duplicate key', () => {
    let s = createMatchSession({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: generateDefaultDeck('Battlemage'),
      p2Deck: generateDefaultDeck('Warrior'),
      seed: 1,
    });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] }, 'k1');
    const again = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] }, 'k1');
    expect(again.lastError).toMatch(/Duplicate/);
  });
});
