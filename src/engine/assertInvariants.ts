/**
 * Runtime invariant checks for match integrity (debug / tests / soft assert).
 */

import type { GameState } from './types';
import { getAllBattlefieldCards } from './queries';
import { getCardById } from '../data/cards';

export interface InvariantViolation {
  code: string;
  message: string;
}

export function checkMatchInvariants(state: GameState): InvariantViolation[] {
  const v: InvariantViolation[] = [];
  if (state.players.length !== 2) {
    v.push({ code: 'PLAYERS', message: 'Expected 2 players' });
  }
  for (const pi of [0, 1] as const) {
    const p = state.players[pi];
    if (p.life > 999) v.push({ code: 'LIFE_HIGH', message: `P${pi} life absurd` });
    if (p.resources < 0) v.push({ code: 'RES_NEG', message: `P${pi} negative resources` });
    if (p.hand.length > 20) v.push({ code: 'HAND_HUGE', message: `P${pi} hand oversized` });

    const mageCount = p.battlefield.mage.card ? 1 : 0;
    if (mageCount > 1) v.push({ code: 'MAGE_SLOT', message: 'Multiple mages' });

    const fighters = p.battlefield.fighters.filter(s => s.card).length;
    if (fighters > 4) v.push({ code: 'FIGHTER_SLOTS', message: 'Too many fighters' });

    for (const c of getAllBattlefieldCards(p)) {
      if (!getCardById(c.definitionId)) {
        v.push({ code: 'UNKNOWN_DEF', message: `Unknown def ${c.definitionId}` });
      }
      if (c.currentHp > 500) {
        v.push({ code: 'HP_ABSURD', message: c.instanceId });
      }
    }

    const ids = new Set<string>();
    const all = [...p.hand, ...p.deck, ...p.graveyard, ...getAllBattlefieldCards(p)];
    for (const c of all) {
      if (ids.has(c.instanceId)) {
        v.push({ code: 'DUP_INSTANCE', message: c.instanceId });
      }
      ids.add(c.instanceId);
    }
  }
  if (state.gameOver && state.winner === null) {
    v.push({ code: 'WINNER', message: 'gameOver without winner' });
  }
  return v;
}

export function assertInvariants(state: GameState): void {
  const v = checkMatchInvariants(state);
  if (v.length > 0) {
    throw new Error(`Invariant violations: ${v.map(x => x.code).join(', ')}`);
  }
}
