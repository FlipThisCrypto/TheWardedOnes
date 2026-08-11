import { describe, it, expect } from 'vitest';
import { createValidatedMatch } from './matchFactory';
import { sessionDispatch, sessionInvariants } from './matchSession';
import { generateDefaultDeck } from './deckUtils';
import { runPolicyTurn } from './aiPolicy';
import { collectMatchMetrics } from './matchObservability';

describe('integration: full logic turn loop', () => {
  it('plays several policy turns without invariant failures', () => {
    const created = createValidatedMatch({
      mode: 'ai',
      p1Class: 'Battlemage',
      p2Class: 'Warrior',
      p1Deck: generateDefaultDeck('Battlemage'),
      p2Deck: generateDefaultDeck('Warrior'),
      seed: 2026,
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    let s = created.session;
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
    let state = s.state;
    for (let i = 0; i < 6; i++) {
      state = runPolicyTurn(state, i % 2 === 0 ? 'aggro' : 'control', 8);
      expect(sessionInvariants({ ...s, state })).toEqual([]);
    }
    const metrics = collectMatchMetrics(state);
    expect(metrics.turn).toBeGreaterThanOrEqual(1);
    expect(metrics.p0.life).toBeLessThanOrEqual(30);
  });
});
