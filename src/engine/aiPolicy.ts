/**
 * AI policy that chooses from legal moves (rules-driven) instead of ad-hoc scoring only.
 */

import type { GameState } from './types';
import type { PlayerAction } from './actions';
import { listLegalActions } from './legalMoves';
import { applyPlayerAction } from './actions';
import { nextFloat } from './rng';
import { getCardById } from '../data/cards';
import { getAllBattlefieldCards } from './queries';

export type PolicyPersonality = 'aggro' | 'control' | 'balanced';

function scoreAction(state: GameState, action: PlayerAction, personality: PolicyPersonality): number {
  let score = 0;
  switch (action.type) {
    case 'PLAY_CARD': {
      const card = state.players[state.currentPlayer].hand.find(c => c.instanceId === action.instanceId);
      const def = card ? getCardById(card.definitionId) : undefined;
      score = (def?.cost ?? 0) + (def?.attack ?? 0);
      if (personality === 'control' && def?.type === 'Utility') score += 2;
      if (personality === 'aggro' && (def?.type === 'Fighter' || def?.type === 'Beast')) score += 3;
      break;
    }
    case 'DECLARE_ATTACK': {
      if (action.targetId === 'player') {
        score = 10 + (personality === 'aggro' ? 5 : 0);
      } else {
        score = 8;
      }
      break;
    }
    case 'ACTIVATE_ABILITY':
      score = 6;
      break;
    case 'END_TURN':
      score = 0.1;
      break;
    case 'ADVANCE_PHASE':
      score = 0.5;
      break;
    case 'CONCEDE':
      score = -1000;
      break;
    default:
      score = 1;
  }
  score += nextFloat(state.rng) * 0.5;
  return score;
}

export function choosePolicyAction(
  state: GameState,
  personality: PolicyPersonality = 'balanced'
): PlayerAction {
  const actions = listLegalActions(state).filter(a => a.type !== 'CONCEDE');
  if (actions.length === 0) return { type: 'END_TURN' };
  let best = actions[0];
  let bestScore = -Infinity;
  for (const a of actions) {
    const s = scoreAction(state, a, personality);
    if (s > bestScore) {
      bestScore = s;
      best = a;
    }
  }
  return best;
}

/** Execute up to maxSteps policy actions or until END_TURN / phase leaves main|combat. */
export function runPolicyTurn(
  state: GameState,
  personality: PolicyPersonality = 'balanced',
  maxSteps = 12
): GameState {
  let s = state;
  for (let i = 0; i < maxSteps; i++) {
    if (s.gameOver) break;
    const action = choosePolicyAction(s, personality);
    if (action.type === 'END_TURN') {
      const r = applyPlayerAction(s, action);
      s = r.state;
      break;
    }
    const r = applyPlayerAction(s, action);
    s = r.state;
    if (!r.ok && action.type !== 'ADVANCE_PHASE') {
      // force end if stuck
      const end = applyPlayerAction(s, { type: 'END_TURN' });
      s = end.state;
      break;
    }
  }
  return s;
}

export function boardThreat(state: GameState, playerIndex: 0 | 1): number {
  return getAllBattlefieldCards(state.players[playerIndex]).reduce(
    (sum, c) => sum + c.currentAttack,
    0
  );
}
