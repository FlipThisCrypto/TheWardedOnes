/**
 * MatchSession — orchestrates config, actions, stack, priority, metrics.
 * Higher-level façade over engine modules for UI/AI.
 */

import type { CardClass, GameMode, GameState } from './types';
import { createGameState } from './gameEngine';
import { applyPlayerAction, type PlayerAction } from './actions';
import { DEFAULT_MATCH_CONFIG, type MatchConfig, mergeMatchConfig } from './matchConfig';
import { createEmptyStack, type StackState } from './stack';
import { createPriority, type PriorityState } from './priority';
import { createTriggerBus, type TriggerBus } from './triggers';
import { createEchoQueue, type EchoQueue } from './echoQueue';
import { collectMatchMetrics, type MatchMetrics } from './matchObservability';
import { checkMatchInvariants } from './assertInvariants';
import { IdempotencyGuard, hashActionPayload } from './idempotency';
import { listLegalActions } from './legalMoves';

export interface MatchSession {
  state: GameState;
  config: MatchConfig;
  stack: StackState;
  priority: PriorityState;
  triggers: TriggerBus;
  echo: EchoQueue;
  idempotency: IdempotencyGuard;
  lastError: string | null;
}

export function createMatchSession(opts: {
  mode: GameMode;
  p1Class: CardClass;
  p2Class: CardClass;
  p1Deck: string[];
  p2Deck: string[];
  seed?: number;
  config?: Partial<MatchConfig>;
}): MatchSession {
  const config = mergeMatchConfig(opts.config ?? {});
  const state = createGameState(
    opts.mode,
    opts.mode === 'pvp' ? 'Player 1' : 'Player',
    opts.p1Class,
    opts.p1Deck,
    opts.mode === 'pvp' ? 'Player 2' : 'AI Opponent',
    opts.p2Class,
    opts.p2Deck,
    opts.seed
  );
  return {
    state,
    config,
    stack: createEmptyStack(),
    priority: createPriority(0),
    triggers: createTriggerBus(),
    echo: createEchoQueue(),
    idempotency: new IdempotencyGuard(),
    lastError: null,
  };
}

export function sessionDispatch(
  session: MatchSession,
  action: PlayerAction,
  idempotencyKey?: string
): MatchSession {
  if (idempotencyKey) {
    const prev = session.idempotency.check(idempotencyKey);
    if (prev) {
      return { ...session, lastError: `Duplicate action ${idempotencyKey}` };
    }
  }
  const result = applyPlayerAction(session.state, action);
  if (idempotencyKey) {
    session.idempotency.remember(idempotencyKey, hashActionPayload({ action, ok: result.ok }));
  }
  if (!result.ok) {
    return { ...session, state: result.state, lastError: result.error };
  }
  return { ...session, state: result.state, lastError: null };
}

export function sessionMetrics(session: MatchSession): MatchMetrics {
  return collectMatchMetrics(session.state);
}

export function sessionLegalActions(session: MatchSession): PlayerAction[] {
  return listLegalActions(session.state);
}

export function sessionInvariants(session: MatchSession) {
  return checkMatchInvariants(session.state);
}
