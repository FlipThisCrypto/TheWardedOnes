/**
 * State-based actions (SBAs): run until stable after resolutions.
 * v1: destroy units at HP <= 0, check life win condition.
 */

import { GameState, PlayerState, CardInstance } from './types';
import { getCardById } from '../data/cards';

export interface SbaResult {
  state: GameState;
  deaths: { playerIndex: 0 | 1; instance: CardInstance; name: string }[];
  winnerSet: boolean;
}

function collectBattlefield(player: PlayerState): { card: CardInstance; clear: () => void }[] {
  const entries: { card: CardInstance; clear: () => void }[] = [];
  if (player.battlefield.mage.card) {
    const c = player.battlefield.mage.card;
    entries.push({ card: c, clear: () => { player.battlefield.mage.card = null; } });
  }
  for (const slot of player.battlefield.fighters) {
    if (slot.card) {
      const s = slot;
      const c = slot.card;
      entries.push({ card: c, clear: () => { s.card = null; } });
    }
  }
  for (const slot of player.battlefield.beasts) {
    if (slot.card) {
      const s = slot;
      const c = slot.card;
      entries.push({ card: c, clear: () => { s.card = null; } });
    }
  }
  for (const slot of player.battlefield.totems) {
    if (slot.card) {
      const s = slot;
      const c = slot.card;
      entries.push({ card: c, clear: () => { s.card = null; } });
    }
  }
  return entries;
}

/**
 * Apply SBAs on a mutable GameState clone. Safe to call repeatedly.
 */
export function applyStateBasedActions(state: GameState): SbaResult {
  const deaths: SbaResult['deaths'] = [];
  let changed = true;
  let safety = 0;

  while (changed && safety < 32) {
    safety++;
    changed = false;

    for (const pi of [0, 1] as const) {
      const player = state.players[pi];
      for (const entry of collectBattlefield(player)) {
        if (entry.card.currentHp <= 0) {
          const def = getCardById(entry.card.definitionId);
          const name = def?.name ?? entry.card.definitionId;
          entry.clear();
          player.graveyard.push(entry.card);
          deaths.push({ playerIndex: pi, instance: entry.card, name });
          changed = true;
        }
      }
    }
  }

  let winnerSet = false;
  if (!state.gameOver) {
    const p0Dead = state.players[0].life <= 0;
    const p1Dead = state.players[1].life <= 0;
    if (p0Dead || p1Dead) {
      state.gameOver = true;
      winnerSet = true;
      if (p0Dead && p1Dead) {
        // Active player loses on simultaneous death (simple rule)
        state.winner = state.currentPlayer === 0 ? 1 : 0;
      } else if (p0Dead) {
        state.winner = 1;
      } else {
        state.winner = 0;
      }
    }
  }

  return { state, deaths, winnerSet };
}
