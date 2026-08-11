/**
 * Enumerate legal moves for AI / UI highlighting from current state.
 */

import type { GameState } from './types';
import type { PlayerAction } from './actions';
import { getPhaseCapabilities } from './turnMachine';
import { canPlayCard, getAllBattlefieldCards } from './gameEngine';
import { isLegalAttackTarget } from './targeting';
import { getCardById } from '../data/cards';

export function listLegalActions(state: GameState): PlayerAction[] {
  if (state.gameOver) return [{ type: 'CONCEDE' }];
  const actions: PlayerAction[] = [];
  const caps = getPhaseCapabilities(state.phase);
  const player = state.players[state.currentPlayer];

  if (caps.canMulligan) {
    actions.push({ type: 'MULLIGAN', cardIndices: [] });
  }

  if (caps.canAdvancePhase) {
    actions.push({ type: 'ADVANCE_PHASE' });
  }
  if (caps.canEndTurn) {
    actions.push({ type: 'END_TURN' });
  }

  if (caps.canPlayCards) {
    for (const card of player.hand) {
      if (canPlayCard(player, card)) {
        const def = getCardById(card.definitionId);
        if (def?.type === 'Relic') {
          for (const host of getAllBattlefieldCards(player)) {
            const hDef = getCardById(host.definitionId);
            if (hDef && (hDef.type === 'Fighter' || hDef.type === 'Beast' || hDef.type === 'Mage')) {
              actions.push({
                type: 'PLAY_CARD',
                instanceId: card.instanceId,
                attachTargetId: host.instanceId,
              });
            }
          }
        } else {
          actions.push({ type: 'PLAY_CARD', instanceId: card.instanceId });
        }
      }
    }
  }

  if (caps.canAttack) {
    const attackers = getAllBattlefieldCards(player).filter(
      c => c.canAttack && !c.hasAttacked && c.currentAttack > 0
    );
    for (const atk of attackers) {
      if (isLegalAttackTarget(state, 'player')) {
        actions.push({ type: 'DECLARE_ATTACK', attackerId: atk.instanceId, targetId: 'player' });
      }
      const opp = state.players[state.currentPlayer === 0 ? 1 : 0];
      for (const enemy of getAllBattlefieldCards(opp)) {
        if (isLegalAttackTarget(state, enemy.instanceId)) {
          actions.push({
            type: 'DECLARE_ATTACK',
            attackerId: atk.instanceId,
            targetId: enemy.instanceId,
          });
        }
      }
    }
  }

  if (caps.canActivateAbilities) {
    for (const unit of getAllBattlefieldCards(player)) {
      const def = getCardById(unit.definitionId);
      if (!def) continue;
      for (const abilityId of def.abilities) {
        if (unit.abilitiesUsedThisTurn?.includes(abilityId)) continue;
        actions.push({
          type: 'ACTIVATE_ABILITY',
          casterId: unit.instanceId,
          abilityId,
        });
      }
    }
  }

  actions.push({ type: 'CONCEDE' });
  return actions;
}
