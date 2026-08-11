/**
 * Priority / passing system (foundation for responses).
 * When allowResponses is false, both players auto-pass after each stack push.
 */

import type { GameState } from './types';

export interface PriorityState {
  holder: 0 | 1 | null;
  passesInRow: number;
  emptyStackPassesNeeded: number;
}

export function createPriority(activePlayer: 0 | 1): PriorityState {
  return {
    holder: activePlayer,
    passesInRow: 0,
    emptyStackPassesNeeded: 2,
  };
}

export function passPriority(
  p: PriorityState,
  stackDepth: number
): { priority: PriorityState; bothPassed: boolean } {
  if (p.holder === null) {
    return { priority: p, bothPassed: true };
  }
  const nextHolder = p.holder === 0 ? 1 : 0;
  const passesInRow = p.passesInRow + 1;
  const need = stackDepth === 0 ? p.emptyStackPassesNeeded : 2;
  const bothPassed = passesInRow >= need;
  return {
    priority: {
      ...p,
      holder: bothPassed ? null : (nextHolder as 0 | 1),
      passesInRow: bothPassed ? 0 : passesInRow,
    },
    bothPassed,
  };
}

export function resetPriorityOnStackPush(p: PriorityState, activePlayer: 0 | 1): PriorityState {
  return { ...p, holder: activePlayer, passesInRow: 0 };
}

export function activePlayerHasPriority(state: GameState, p: PriorityState): boolean {
  return p.holder === state.currentPlayer;
}
