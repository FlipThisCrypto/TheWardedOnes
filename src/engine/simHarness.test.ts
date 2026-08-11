import { describe, it, expect } from 'vitest';
import { runScript, applySimActions, createSimMatch, assertSim } from './simHarness';
import { generateDefaultDeck } from './deckUtils';
import { getAllBattlefieldCards } from './queries';

describe('simHarness', () => {
  it('runs resource phases and ends turn deterministically', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    const result = runScript(
      [d1, d2],
      [
        { op: 'mulligan', indices: [] },
        { op: 'mulligan', indices: [] },
        { op: 'draw' },
        { op: 'resource' },
        { op: 'end' },
      ],
      { phase: 'draw' },
      42
    );
    expect(result.ok, result.failures.join('; ')).toBe(true);
    expect(result.state.turn).toBe(1);
    expect(result.state.currentPlayer).toBe(1);
  });

  it('assertSim fails on wrong life', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let state = createSimMatch(d1, d2, 1);
    state = applySimActions(state, [
      { op: 'mulligan', indices: [] },
      { op: 'mulligan', indices: [] },
    ]);
    const bad = assertSim(state, { p0Life: 1 });
    expect(bad.ok).toBe(false);
    expect(bad.failures[0]).toMatch(/p0Life/);
  });

  it('same seed same opening resources after script', () => {
    const d1 = generateDefaultDeck('Priest');
    const d2 = generateDefaultDeck('Warlock');
    const a = runScript([d1, d2], [
      { op: 'mulligan', indices: [] },
      { op: 'mulligan', indices: [] },
      { op: 'draw' },
      { op: 'resource' },
    ], {}, 7);
    const b = runScript([d1, d2], [
      { op: 'mulligan', indices: [] },
      { op: 'mulligan', indices: [] },
      { op: 'draw' },
      { op: 'resource' },
    ], {}, 7);
    expect(a.state.players[0].resources).toBe(b.state.players[0].resources);
    expect(a.state.players[0].hand.map(c => c.definitionId)).toEqual(
      b.state.players[0].hand.map(c => c.definitionId)
    );
    expect(getAllBattlefieldCards(a.state.players[0]).length).toBe(0);
  });
});
