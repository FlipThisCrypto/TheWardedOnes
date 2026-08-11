/**
 * Structured game events for UI, logs, and future replay.
 */

import type { GamePhase } from './types';

export type GameEventType =
  | 'phase_change'
  | 'draw'
  | 'resource'
  | 'play_card'
  | 'attack'
  | 'damage'
  | 'heal'
  | 'death'
  | 'ability'
  | 'mulligan'
  | 'win'
  | 'illegal_action'
  | 'status'
  | 'message';

export interface GameEvent {
  id: string;
  type: GameEventType;
  turn: number;
  player: 0 | 1;
  phase: GamePhase;
  message: string;
  timestamp: number;
  payload?: Record<string, string | number | boolean | null>;
}

let eventCounter = 0;

export function createGameEvent(
  partial: Omit<GameEvent, 'id' | 'timestamp'> & { timestamp?: number }
): GameEvent {
  eventCounter += 1;
  return {
    id: `evt_${eventCounter}`,
    timestamp: partial.timestamp ?? Date.now(),
    type: partial.type,
    turn: partial.turn,
    player: partial.player,
    phase: partial.phase,
    message: partial.message,
    payload: partial.payload,
  };
}

export function resetEventCounter(): void {
  eventCounter = 0;
}
