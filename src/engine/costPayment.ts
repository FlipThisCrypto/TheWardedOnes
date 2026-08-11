/**
 * Transactional cost payment — validate then pay, or reject without partial side effects.
 */

import type { PlayerState } from './types';

export type Cost =
  | { type: 'resource'; amount: number }
  | { type: 'life'; amount: number }
  | { type: 'discard'; count: number }
  | { type: 'and'; costs: Cost[] };

export interface CostCheck {
  payable: boolean;
  reason?: string;
}

export function canPayCost(player: PlayerState, cost: Cost): CostCheck {
  switch (cost.type) {
    case 'resource':
      if (player.resources < cost.amount) {
        return { payable: false, reason: `Need ${cost.amount} resources, have ${player.resources}` };
      }
      return { payable: true };
    case 'life':
      if (player.life <= cost.amount) {
        return { payable: false, reason: 'Insufficient life' };
      }
      return { payable: true };
    case 'discard':
      if (player.hand.length < cost.count) {
        return { payable: false, reason: 'Not enough cards to discard' };
      }
      return { payable: true };
    case 'and': {
      for (const c of cost.costs) {
        const r = canPayCost(player, c);
        if (!r.payable) return r;
      }
      return { payable: true };
    }
    default:
      return { payable: false, reason: 'Unknown cost' };
  }
}

/** Mutates a player clone; caller must pass a mutable copy. */
export function payCost(player: PlayerState, cost: Cost): CostCheck {
  const check = canPayCost(player, cost);
  if (!check.payable) return check;
  switch (cost.type) {
    case 'resource':
      player.resources -= cost.amount;
      break;
    case 'life':
      player.life -= cost.amount;
      break;
    case 'discard':
      for (let i = 0; i < cost.count; i++) {
        const c = player.hand.pop();
        if (c) player.graveyard.push(c);
      }
      break;
    case 'and':
      for (const c of cost.costs) {
        const r = payCost(player, c);
        if (!r.payable) return r;
      }
      break;
  }
  return { payable: true };
}
