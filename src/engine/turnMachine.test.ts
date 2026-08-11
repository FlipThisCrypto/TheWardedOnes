import { describe, it, expect } from 'vitest';
import {
  getNextPhase,
  getPhaseCapabilities,
  isActionLegalInPhase,
  validatePhaseTransition,
  advanceTurnMachine,
  runStartOfTurn,
  ACTIVE_TURN_PHASES,
} from './turnMachine';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

function match(seed = 1) {
  const d1 = generateDefaultDeck('Battlemage');
  const d2 = generateDefaultDeck('Warrior');
  return createGameState('ai', 'P1', 'Battlemage', d1, 'P2', 'Warrior', d2, seed);
}

describe('turnMachine', () => {
  it('defines sequential next phases for active turn', () => {
    expect(getNextPhase('draw')).toBe('resource');
    expect(getNextPhase('resource')).toBe('main');
    expect(getNextPhase('main')).toBe('combat');
    expect(getNextPhase('combat')).toBe('end');
    expect(getNextPhase('end')).toBe('draw');
    expect(ACTIVE_TURN_PHASES).toEqual(['draw', 'resource', 'main', 'combat', 'end']);
  });

  it('gates actions by phase capabilities', () => {
    expect(isActionLegalInPhase('main', 'PLAY_CARD')).toBe(true);
    expect(isActionLegalInPhase('main', 'DECLARE_ATTACK')).toBe(false);
    expect(isActionLegalInPhase('combat', 'DECLARE_ATTACK')).toBe(true);
    expect(isActionLegalInPhase('combat', 'PLAY_CARD')).toBe(false);
    expect(isActionLegalInPhase('mulligan', 'MULLIGAN')).toBe(true);
    expect(isActionLegalInPhase('draw', 'PLAY_CARD')).toBe(false);
    expect(getPhaseCapabilities('main').canActivateAbilities).toBe(true);
  });

  it('rejects illegal transitions', () => {
    const state = match();
    state.phase = 'main';
    const bad = validatePhaseTransition(state, 'draw');
    expect(bad.ok).toBe(false);
    const good = validatePhaseTransition(state, 'combat');
    expect(good.ok).toBe(true);
  });

  it('mulligan requires both players complete', () => {
    const state = match();
    expect(state.phase).toBe('mulligan');
    expect(validatePhaseTransition(state, 'draw').ok).toBe(false);
    state.mulliganComplete = [true, true];
    expect(validatePhaseTransition(state, 'draw').ok).toBe(true);
  });

  it('advanceTurnMachine walks main → combat → end → next player draw', () => {
    let state = match(7);
    state.mulliganComplete = [true, true];
    state.phase = 'draw';
    let r = advanceTurnMachine(state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.phase).toBe('resource');
    r = advanceTurnMachine(r.state);
    expect(r.ok && r.state.phase).toBe('main');
    if (!r.ok) return;
    r = advanceTurnMachine(r.state);
    expect(r.ok && r.state.phase).toBe('combat');
    if (!r.ok) return;
    r = advanceTurnMachine(r.state);
    expect(r.ok && r.state.phase).toBe('end');
    if (!r.ok) return;
    const playerBefore = r.state.currentPlayer;
    r = advanceTurnMachine(r.state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.currentPlayer).not.toBe(playerBefore);
    expect(r.state.phase).toBe('draw');
  });

  it('runStartOfTurn executes draw+resource into main', () => {
    let state = match(3);
    state.mulliganComplete = [true, true];
    state.phase = 'draw';
    const r = runStartOfTurn(state);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.phase).toBe('main');
    expect(r.state.players[0].maxResources).toBeGreaterThanOrEqual(1);
  });
});
