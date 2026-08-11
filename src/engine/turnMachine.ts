/**
 * Formal turn / phase state machine for The Warded Ones TCG.
 *
 * Single source of truth for legal phase transitions and which player
 * actions are allowed in each phase. UI and AI should consult this module
 * rather than ad-hoc phase string checks.
 */

import type { GamePhase, GameState, PlayerActionKind } from './types';
import {
  executeDrawPhase,
  executeResourcePhase,
  executeEndPhase,
  addLog,
} from './gameEngine';

/** Ordered active-turn phases after mulligan completes. */
export const ACTIVE_TURN_PHASES: readonly GamePhase[] = [
  'draw',
  'resource',
  'main',
  'combat',
  'end',
] as const;

export type PhaseTransition =
  | { ok: true; from: GamePhase; to: GamePhase; reason: string }
  | { ok: false; from: GamePhase; reason: string };

export interface PhaseCapabilities {
  phase: GamePhase;
  canPlayCards: boolean;
  canAttack: boolean;
  canActivateAbilities: boolean;
  canMulligan: boolean;
  canEndTurn: boolean;
  canAdvancePhase: boolean;
  description: string;
}

/** Legal next phase from current phase (same player unless noted). */
export function getNextPhase(phase: GamePhase): GamePhase | null {
  switch (phase) {
    case 'mulligan':
      return 'draw';
    case 'draw':
      return 'resource';
    case 'resource':
      return 'main';
    case 'main':
      return 'combat';
    case 'combat':
      return 'end';
    case 'end':
      // End of turn hands off; next phase for the new player is draw
      return 'draw';
    default:
      return null;
  }
}

export function getPhaseCapabilities(phase: GamePhase): PhaseCapabilities {
  switch (phase) {
    case 'mulligan':
      return {
        phase,
        canPlayCards: false,
        canAttack: false,
        canActivateAbilities: false,
        canMulligan: true,
        canEndTurn: false,
        canAdvancePhase: false,
        description: 'Replace opening hand cards; both players must finish.',
      };
    case 'draw':
      return {
        phase,
        canPlayCards: false,
        canAttack: false,
        canActivateAbilities: false,
        canMulligan: false,
        canEndTurn: false,
        canAdvancePhase: true,
        description: 'Automatic draw (or fatigue).',
      };
    case 'resource':
      return {
        phase,
        canPlayCards: false,
        canAttack: false,
        canActivateAbilities: false,
        canMulligan: false,
        canEndTurn: false,
        canAdvancePhase: true,
        description: 'Automatic resource growth and refill.',
      };
    case 'main':
      return {
        phase,
        canPlayCards: true,
        canAttack: false,
        canActivateAbilities: true,
        canMulligan: false,
        canEndTurn: true,
        canAdvancePhase: true,
        description: 'Play cards, attach relics, activate abilities.',
      };
    case 'combat':
      return {
        phase,
        canPlayCards: false,
        canAttack: true,
        canActivateAbilities: false,
        canMulligan: false,
        canEndTurn: true,
        canAdvancePhase: true,
        description: 'Declare attacks with ready units.',
      };
    case 'end':
      return {
        phase,
        canPlayCards: false,
        canAttack: false,
        canActivateAbilities: false,
        canMulligan: false,
        canEndTurn: false,
        canAdvancePhase: true,
        description: 'Totems, status ticks, SBAs, then pass turn.',
      };
    default:
      return {
        phase,
        canPlayCards: false,
        canAttack: false,
        canActivateAbilities: false,
        canMulligan: false,
        canEndTurn: false,
        canAdvancePhase: false,
        description: 'Unknown phase',
      };
  }
}

export function isActionLegalInPhase(phase: GamePhase, action: PlayerActionKind): boolean {
  const caps = getPhaseCapabilities(phase);
  switch (action) {
    case 'MULLIGAN':
      return caps.canMulligan;
    case 'PLAY_CARD':
    case 'ATTACH_RELIC':
    case 'EVOLVE':
      return caps.canPlayCards;
    case 'ACTIVATE_ABILITY':
      return caps.canActivateAbilities;
    case 'DECLARE_ATTACK':
      return caps.canAttack;
    case 'ADVANCE_PHASE':
      return caps.canAdvancePhase;
    case 'END_TURN':
      return caps.canEndTurn;
    case 'CONCEDE':
      return true;
    default:
      return false;
  }
}

/**
 * Validate a requested transition. Does not mutate state.
 */
export function validatePhaseTransition(
  state: GameState,
  to: GamePhase
): PhaseTransition {
  if (state.gameOver) {
    return { ok: false, from: state.phase, reason: 'Game is over' };
  }
  const from = state.phase;
  if (from === 'mulligan') {
    if (to !== 'draw') {
      return { ok: false, from, reason: 'Mulligan only transitions to draw' };
    }
    if (!state.mulliganComplete[0] || !state.mulliganComplete[1]) {
      return { ok: false, from, reason: 'Both players must complete mulligan' };
    }
    return { ok: true, from, to, reason: 'Mulligan complete' };
  }
  const expected = getNextPhase(from);
  if (expected !== to) {
    return {
      ok: false,
      from,
      reason: `Illegal transition ${from} → ${to} (expected ${expected})`,
    };
  }
  return { ok: true, from, to, reason: 'Sequential phase advance' };
}

export type AdvancePhaseResult =
  | { ok: true; state: GameState }
  | { ok: false; state: GameState; error: string };

/**
 * Advance one step in the turn machine.
 * - draw/resource: auto-execute
 * - main → combat: phase only
 * - combat → end: phase only
 * - end: executeEndPhase (switches player, sets draw)
 */
export function advanceTurnMachine(state: GameState): AdvancePhaseResult {
  if (state.gameOver) {
    return { ok: false, state, error: 'Game is over' };
  }

  const from = state.phase;

  if (from === 'mulligan') {
    return { ok: false, state, error: 'Complete mulligan before advancing turn machine' };
  }

  if (from === 'draw') {
    let next = executeDrawPhase(state);
    // executeDrawPhase already sets phase to resource
    return { ok: true, state: next };
  }

  if (from === 'resource') {
    let next = executeResourcePhase(state);
    // sets phase to main
    return { ok: true, state: next };
  }

  if (from === 'main') {
    const next = structuredClone(state);
    next.phase = 'combat';
    addLog(next, 'Entering combat phase.', 'phase_change');
    return { ok: true, state: next };
  }

  if (from === 'combat') {
    const next = structuredClone(state);
    next.phase = 'end';
    addLog(next, 'Entering end phase.', 'phase_change');
    return { ok: true, state: next };
  }

  if (from === 'end') {
    const next = executeEndPhase(state);
    return { ok: true, state: next };
  }

  return { ok: false, state, error: `No advance path from phase ${from}` };
}

/**
 * Auto-run draw+resource as a convenience used after mulligan / turn start.
 */
export function runStartOfTurn(state: GameState): AdvancePhaseResult {
  if (state.gameOver) return { ok: false, state, error: 'Game is over' };
  if (state.phase !== 'draw' && state.phase !== 'mulligan') {
    // Force into draw if somehow misaligned at turn start
    const s = structuredClone(state);
    if (s.phase === 'mulligan') {
      return { ok: false, state: s, error: 'Still in mulligan' };
    }
  }
  let s = state;
  if (s.phase === 'draw') {
    const d = advanceTurnMachine(s);
    if (!d.ok) return d;
    s = d.state;
  }
  if (s.phase === 'resource') {
    return advanceTurnMachine(s);
  }
  return { ok: true, state: s };
}
