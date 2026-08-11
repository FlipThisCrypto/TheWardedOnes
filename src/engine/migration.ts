/**
 * Migrate older serialized match payloads toward current schema.
 */

import type { GameState } from './types';
import { createRng } from './rng';
import { ENGINE_SCHEMA_VERSION } from './schemaVersion';

export interface LegacySnapshotV1 {
  schemaVersion?: 1;
  state: Partial<GameState> & {
    players: GameState['players'];
    phase: GameState['phase'];
  };
}

export function migrateToCurrent(
  raw: LegacySnapshotV1 | { schemaVersion: number; state: GameState }
): GameState {
  const state = structuredClone(raw.state) as GameState;
  if (!state.rng) {
    state.rng = createRng(1);
  }
  if (!state.events) {
    state.events = [];
  }
  for (const p of state.players) {
    if (p.fatigueCounter === undefined) p.fatigueCounter = 0;
    const all = [
      p.battlefield.mage.card,
      ...p.battlefield.fighters.map(s => s.card),
      ...p.battlefield.beasts.map(s => s.card),
      ...p.battlefield.totems.map(s => s.card),
      ...p.hand,
      ...p.deck,
      ...p.graveyard,
    ].filter(Boolean);
    for (const c of all) {
      if (c && !c.abilitiesUsedThisTurn) c.abilitiesUsedThisTurn = [];
    }
  }
  return state;
}

export function currentSchemaVersion(): number {
  return ENGINE_SCHEMA_VERSION;
}
