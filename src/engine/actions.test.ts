import { describe, it, expect } from 'vitest';
import { applyPlayerAction } from './actions';
import { createGameState, createCardInstance } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';
import { ALL_CARDS } from '../data/cards';
import { runStartOfTurn } from './turnMachine';

function readyMain(seed = 11) {
  const d1 = generateDefaultDeck('Battlemage');
  const d2 = generateDefaultDeck('Warrior');
  let state = createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, seed);
  state.mulliganComplete = [true, true];
  state.phase = 'draw';
  const start = runStartOfTurn(state);
  expect(start.ok).toBe(true);
  return start.ok ? start.state : state;
}

describe('applyPlayerAction', () => {
  it('rejects play card outside main', () => {
    let state = readyMain();
    state.phase = 'combat';
    const handId = state.players[0].hand[0]?.instanceId;
    expect(handId).toBeTruthy();
    const r = applyPlayerAction(state, { type: 'PLAY_CARD', instanceId: handId! });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.code).toBe('ILLEGAL_PHASE');
  });

  it('allows advance main to combat', () => {
    const state = readyMain();
    expect(state.phase).toBe('main');
    const r = applyPlayerAction(state, { type: 'ADVANCE_PHASE' });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state.phase).toBe('combat');
  });

  it('end turn hands off to opponent main', () => {
    const state = readyMain(22);
    const p = state.currentPlayer;
    const r = applyPlayerAction(state, { type: 'END_TURN' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.currentPlayer).not.toBe(p);
    expect(r.state.phase).toBe('main');
  });

  it('concede ends the game', () => {
    const state = readyMain();
    const r = applyPlayerAction(state, { type: 'CONCEDE' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.gameOver).toBe(true);
    expect(r.state.winner).toBe(1);
  });

  it('declare attack illegal in main', () => {
    const state = readyMain();
    const f = ALL_CARDS.find(c => c.type === 'Fighter')!;
    const unit = createCardInstance(f);
    unit.canAttack = true;
    state.players[0].battlefield.fighters[0].card = unit;
    const r = applyPlayerAction(state, {
      type: 'DECLARE_ATTACK',
      attackerId: unit.instanceId,
      targetId: 'player',
    });
    expect(r.ok).toBe(false);
  });
});
