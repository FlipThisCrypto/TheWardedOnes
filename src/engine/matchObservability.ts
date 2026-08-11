/**
 * Match observability — structured metrics for diagnostics and future telemetry.
 */

import type { GameState } from './types';
import { getAllBattlefieldCards } from './queries';

export interface MatchMetrics {
  turn: number;
  phase: string;
  currentPlayer: 0 | 1;
  gameOver: boolean;
  p0: PlayerMetrics;
  p1: PlayerMetrics;
  eventCount: number;
  logCount: number;
  rngState: number;
}

export interface PlayerMetrics {
  life: number;
  resources: number;
  maxResources: number;
  handSize: number;
  deckSize: number;
  gySize: number;
  boardCount: number;
  boardAttackSum: number;
  fatigueCounter: number;
}

function playerMetrics(state: GameState, i: 0 | 1): PlayerMetrics {
  const p = state.players[i];
  const board = getAllBattlefieldCards(p);
  return {
    life: p.life,
    resources: p.resources,
    maxResources: p.maxResources,
    handSize: p.hand.length,
    deckSize: p.deck.length,
    gySize: p.graveyard.length,
    boardCount: board.length,
    boardAttackSum: board.reduce((s, c) => s + c.currentAttack, 0),
    fatigueCounter: p.fatigueCounter ?? 0,
  };
}

export function collectMatchMetrics(state: GameState): MatchMetrics {
  return {
    turn: state.turn,
    phase: state.phase,
    currentPlayer: state.currentPlayer,
    gameOver: state.gameOver,
    p0: playerMetrics(state, 0),
    p1: playerMetrics(state, 1),
    eventCount: state.events?.length ?? 0,
    logCount: state.log.length,
    rngState: state.rng?.state ?? 0,
  };
}

export function formatMatchSnapshot(state: GameState): string {
  const m = collectMatchMetrics(state);
  return [
    `T${m.turn} ${m.phase} P${m.currentPlayer}${m.gameOver ? ' GAME_OVER' : ''}`,
    `P0 life=${m.p0.life} res=${m.p0.resources}/${m.p0.maxResources} hand=${m.p0.handSize} board=${m.p0.boardCount}`,
    `P1 life=${m.p1.life} res=${m.p1.resources}/${m.p1.maxResources} hand=${m.p1.handSize} board=${m.p1.boardCount}`,
    `events=${m.eventCount} log=${m.logCount}`,
  ].join('\n');
}
