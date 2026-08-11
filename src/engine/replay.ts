/**
 * Match replay: record actions + seed for deterministic re-simulation.
 */

import type { GameState } from './types';
import type { PlayerAction } from './actions';
import { applyPlayerAction } from './actions';
import { createGameState } from './gameEngine';
import type { CardClass, GameMode } from './types';

export interface ReplayHeader {
  version: 1;
  seed: number;
  mode: GameMode;
  p1Name: string;
  p1Class: CardClass;
  p1Deck: string[];
  p2Name: string;
  p2Class: CardClass;
  p2Deck: string[];
}

export interface ReplayTape {
  header: ReplayHeader;
  actions: PlayerAction[];
}

export function createReplayTape(header: ReplayHeader): ReplayTape {
  return { header, actions: [] };
}

export function appendAction(tape: ReplayTape, action: PlayerAction): ReplayTape {
  return { ...tape, actions: [...tape.actions, action] };
}

export function playTape(tape: ReplayTape): {
  state: GameState;
  failures: { index: number; error: string }[];
} {
  let state = createGameState(
    tape.header.mode,
    tape.header.p1Name,
    tape.header.p1Class,
    tape.header.p1Deck,
    tape.header.p2Name,
    tape.header.p2Class,
    tape.header.p2Deck,
    tape.header.seed
  );
  const failures: { index: number; error: string }[] = [];
  tape.actions.forEach((action, index) => {
    const result = applyPlayerAction(state, action);
    if (!result.ok) {
      failures.push({ index, error: result.error });
      // continue with logged rejection state when available
      state = result.state;
    } else {
      state = result.state;
    }
  });
  return { state, failures };
}

export function serializeTape(tape: ReplayTape): string {
  return JSON.stringify(tape);
}

export function deserializeTape(raw: string): ReplayTape | null {
  try {
    const t = JSON.parse(raw) as ReplayTape;
    if (!t?.header || !Array.isArray(t.actions)) return null;
    return t;
  } catch {
    return null;
  }
}
