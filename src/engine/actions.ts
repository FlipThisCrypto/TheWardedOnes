/**
 * Single player-action reducer — closed command set for match mutations.
 */

import type { GameState, PlayerActionKind } from './types';
import {
  playCard,
  executeAttack,
  useAbility,
  performMulligan,
  checkGameOver,
  addLog,
} from './gameEngine';
import { advanceTurnMachine, isActionLegalInPhase, runStartOfTurn } from './turnMachine';
import { applyStateBasedActions } from './stateBasedActions';

export type PlayerAction =
  | { type: 'MULLIGAN'; cardIndices: number[] }
  | { type: 'PLAY_CARD'; instanceId: string; attachTargetId?: string }
  | { type: 'ACTIVATE_ABILITY'; casterId: string; abilityId: string; targetId?: string }
  | { type: 'DECLARE_ATTACK'; attackerId: string; targetId: string | 'player' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'END_TURN' }
  | { type: 'CONCEDE' };

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; state: GameState; error: string; code: 'ILLEGAL_PHASE' | 'ILLEGAL_ACTION' | 'GAME_OVER' | 'ENGINE' };

function deny(state: GameState, error: string, code: ActionResult extends { ok: false } ? never : never): ActionResult;
function deny(state: GameState, error: string, code: 'ILLEGAL_PHASE' | 'ILLEGAL_ACTION' | 'GAME_OVER' | 'ENGINE'): ActionResult {
  const s = structuredClone(state);
  addLog(s, `Action rejected: ${error}`, 'illegal_action');
  return { ok: false, state: s, error, code };
}

export function applyPlayerAction(state: GameState, action: PlayerAction): ActionResult {
  if (state.gameOver && action.type !== 'CONCEDE') {
    return deny(state, 'Game is over', 'GAME_OVER');
  }

  const kind = action.type as PlayerActionKind;
  if (!isActionLegalInPhase(state.phase, kind) && action.type !== 'CONCEDE' && action.type !== 'END_TURN') {
    // END_TURN allowed from main/combat via machine
    if (action.type === 'ADVANCE_PHASE' && !isActionLegalInPhase(state.phase, 'ADVANCE_PHASE')) {
      return deny(state, `Cannot advance during ${state.phase}`, 'ILLEGAL_PHASE');
    }
    if (action.type !== 'ADVANCE_PHASE' && action.type !== 'END_TURN') {
      return deny(state, `${action.type} illegal in phase ${state.phase}`, 'ILLEGAL_PHASE');
    }
  }

  switch (action.type) {
    case 'MULLIGAN': {
      if (!isActionLegalInPhase(state.phase, 'MULLIGAN')) {
        return deny(state, 'Not in mulligan phase', 'ILLEGAL_PHASE');
      }
      let next = performMulligan(state, action.cardIndices);
      if (next.phase === 'draw') {
        const start = runStartOfTurn(next);
        if (start.ok) next = start.state;
      }
      return { ok: true, state: next };
    }
    case 'PLAY_CARD': {
      if (!isActionLegalInPhase(state.phase, 'PLAY_CARD')) {
        return deny(state, 'Cannot play cards now', 'ILLEGAL_PHASE');
      }
      const next = playCard(state, action.instanceId, undefined, action.attachTargetId);
      return { ok: true, state: next };
    }
    case 'ACTIVATE_ABILITY': {
      if (!isActionLegalInPhase(state.phase, 'ACTIVATE_ABILITY')) {
        return deny(state, 'Cannot activate abilities now', 'ILLEGAL_PHASE');
      }
      const next = useAbility(state, action.casterId, action.abilityId, action.targetId);
      return { ok: true, state: next };
    }
    case 'DECLARE_ATTACK': {
      if (!isActionLegalInPhase(state.phase, 'DECLARE_ATTACK')) {
        return deny(state, 'Cannot attack now', 'ILLEGAL_PHASE');
      }
      let next = executeAttack(state, action.attackerId, action.targetId);
      next = checkGameOver(next);
      return { ok: true, state: next };
    }
    case 'ADVANCE_PHASE': {
      const advanced = advanceTurnMachine(state);
      if (!advanced.ok) {
        return deny(state, advanced.error, 'ENGINE');
      }
      return { ok: true, state: advanced.state };
    }
    case 'END_TURN': {
      // From main or combat, jump through remaining phases to hand off
      if (state.phase !== 'main' && state.phase !== 'combat' && state.phase !== 'end') {
        return deny(state, 'Cannot end turn now', 'ILLEGAL_PHASE');
      }
      let s = state;
      // advance until player switches or we leave end
      const startPlayer = s.currentPlayer;
      // main → combat → end → draw (other player)
      for (let i = 0; i < 6; i++) {
        if (s.phase === 'main' || s.phase === 'combat' || s.phase === 'end') {
          const adv = advanceTurnMachine(s);
          if (!adv.ok) return deny(s, adv.error, 'ENGINE');
          s = adv.state;
          if (s.currentPlayer !== startPlayer && s.phase === 'draw') {
            const start = runStartOfTurn(s);
            if (start.ok) s = start.state;
            break;
          }
        } else if (s.phase === 'draw' || s.phase === 'resource') {
          const adv = advanceTurnMachine(s);
          if (!adv.ok) return deny(s, adv.error, 'ENGINE');
          s = adv.state;
        } else break;
      }
      const sba = applyStateBasedActions(structuredClone(s));
      return { ok: true, state: sba.state };
    }
    case 'CONCEDE': {
      const next = structuredClone(state);
      next.gameOver = true;
      next.winner = next.currentPlayer === 0 ? 1 : 0;
      addLog(next, `${next.players[next.currentPlayer].name} concedes.`, 'win');
      return { ok: true, state: next };
    }
    default:
      return deny(state, 'Unknown action', 'ILLEGAL_ACTION');
  }
}
