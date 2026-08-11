/**
 * Targeting filters and legal-target resolution.
 */

import { CardInstance, CardType, PlayerState, GameState } from './types';
import { getCardById } from '../data/cards';
import { hasKeyword } from './keywords';
import { getAllBattlefieldCards } from './queries';

export type TargetKind = 'unit' | 'player' | 'any';

export interface TargetFilter {
  controller: 'self' | 'opponent' | 'any';
  types?: CardType[];
  requireKeyword?: string;
  excludeTotems?: boolean;
  canTargetPlayer?: boolean;
  injuredOnly?: boolean;
}

export type TargetRef =
  | { kind: 'player'; playerId: 0 | 1 }
  | { kind: 'unit'; instanceId: string };

export function getPlayerIndex(state: GameState, who: 'self' | 'opponent'): 0 | 1 {
  if (who === 'self') return state.currentPlayer;
  return state.currentPlayer === 0 ? 1 : 0;
}

export function findUnit(state: GameState, instanceId: string): {
  playerIndex: 0 | 1;
  card: CardInstance;
} | null {
  for (const pi of [0, 1] as const) {
    const cards = getAllBattlefieldCards(state.players[pi]);
    const card = cards.find(c => c.instanceId === instanceId);
    if (card) return { playerIndex: pi, card };
  }
  return null;
}

export function listLegalUnitTargets(
  state: GameState,
  filter: TargetFilter
): CardInstance[] {
  const players: PlayerState[] = [];
  if (filter.controller === 'self' || filter.controller === 'any') {
    players.push(state.players[state.currentPlayer]);
  }
  if (filter.controller === 'opponent' || filter.controller === 'any') {
    players.push(state.players[state.currentPlayer === 0 ? 1 : 0]);
  }

  const results: CardInstance[] = [];
  for (const player of players) {
    for (const card of getAllBattlefieldCards(player)) {
      const def = getCardById(card.definitionId);
      if (!def) continue;
      if (filter.types && !filter.types.includes(def.type)) continue;
      if (filter.excludeTotems && def.type === 'Totem') continue;
      if (filter.requireKeyword && !hasKeyword(card.keywords, filter.requireKeyword as never)) continue;
      if (filter.injuredOnly && card.currentHp >= def.hp) continue;
      results.push(card);
    }
  }
  return results;
}

/** Combat: if opponent has Taunt units, only those are legal unit targets for attacks. */
export function listLegalAttackTargets(state: GameState): {
  units: CardInstance[];
  canAttackPlayer: boolean;
} {
  const opponent = state.players[state.currentPlayer === 0 ? 1 : 0];
  const enemies = getAllBattlefieldCards(opponent).filter(c => c.currentHp > 0);
  const taunts = enemies.filter(c => hasKeyword(c.keywords, 'Taunt'));
  if (taunts.length > 0) {
    return { units: taunts, canAttackPlayer: false };
  }
  return { units: enemies, canAttackPlayer: true };
}

export function isLegalAttackTarget(
  state: GameState,
  targetId: string | 'player'
): boolean {
  const legal = listLegalAttackTargets(state);
  if (targetId === 'player') return legal.canAttackPlayer;
  return legal.units.some(u => u.instanceId === targetId);
}
