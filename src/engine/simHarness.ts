/**
 * Lightweight simulation harness: apply a sequence of actions and assert.
 */

import type { CardClass, GameState } from './types';
import {
  createGameState,
  executeDrawPhase,
  executeResourcePhase,
  executeEndPhase,
  playCard,
  executeAttack,
  performMulligan,
  checkGameOver,
} from './gameEngine';

export type SimAction =
  | { op: 'mulligan'; indices: number[] }
  | { op: 'draw' }
  | { op: 'resource' }
  | { op: 'play'; instanceId: string; attachTargetId?: string }
  | { op: 'attack'; attackerId: string; targetId: string | 'player' }
  | { op: 'end' }
  | { op: 'check_over' };

export interface SimExpect {
  p0Life?: number;
  p1Life?: number;
  phase?: string;
  gameOver?: boolean;
  winner?: 0 | 1 | null;
  logIncludes?: string;
  p0BoardMin?: number;
  p1BoardMin?: number;
}

export interface SimResult {
  state: GameState;
  ok: boolean;
  failures: string[];
}

export function createSimMatch(
  p1Deck: string[],
  p2Deck: string[],
  seed = 1,
  p1Class: CardClass = 'Battlemage',
  p2Class: CardClass = 'Warrior'
): GameState {
  return createGameState('ai', 'P1', p1Class, p1Deck, 'P2', p2Class, p2Deck, seed);
}

export function applySimActions(state: GameState, actions: SimAction[]): GameState {
  let s = state;
  for (const a of actions) {
    switch (a.op) {
      case 'mulligan':
        s = performMulligan(s, a.indices);
        break;
      case 'draw':
        s = executeDrawPhase(s);
        break;
      case 'resource':
        s = executeResourcePhase(s);
        break;
      case 'play':
        s = playCard(s, a.instanceId, undefined, a.attachTargetId);
        break;
      case 'attack':
        s = executeAttack(s, a.attackerId, a.targetId);
        break;
      case 'end':
        s = executeEndPhase(s);
        break;
      case 'check_over':
        s = checkGameOver(s);
        break;
    }
  }
  return s;
}

export function assertSim(state: GameState, expect: SimExpect): SimResult {
  const failures: string[] = [];
  if (expect.p0Life !== undefined && state.players[0].life !== expect.p0Life) {
    failures.push(`p0Life expected ${expect.p0Life} got ${state.players[0].life}`);
  }
  if (expect.p1Life !== undefined && state.players[1].life !== expect.p1Life) {
    failures.push(`p1Life expected ${expect.p1Life} got ${state.players[1].life}`);
  }
  if (expect.phase !== undefined && state.phase !== expect.phase) {
    failures.push(`phase expected ${expect.phase} got ${state.phase}`);
  }
  if (expect.gameOver !== undefined && state.gameOver !== expect.gameOver) {
    failures.push(`gameOver expected ${expect.gameOver} got ${state.gameOver}`);
  }
  if (expect.winner !== undefined && state.winner !== expect.winner) {
    failures.push(`winner expected ${expect.winner} got ${state.winner}`);
  }
  if (expect.logIncludes && !state.log.some(e => e.message.includes(expect.logIncludes!))) {
    failures.push(`log missing "${expect.logIncludes}"`);
  }
  return { state, ok: failures.length === 0, failures };
}

export function runScript(
  decks: [string[], string[]],
  actions: SimAction[],
  expect: SimExpect,
  seed = 1
): SimResult {
  const state = applySimActions(createSimMatch(decks[0], decks[1], seed), actions);
  return assertSim(state, expect);
}
