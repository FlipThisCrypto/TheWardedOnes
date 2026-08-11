/**
 * Deep validation of PlayerAction payloads before dispatch.
 */

import type { PlayerAction } from './actions';

export interface PayloadValidation {
  ok: boolean;
  errors: string[];
}

export function validateActionPayload(action: PlayerAction): PayloadValidation {
  const errors: string[] = [];
  switch (action.type) {
    case 'MULLIGAN':
      if (!Array.isArray(action.cardIndices)) errors.push('cardIndices required');
      if (action.cardIndices?.some(i => i < 0 || !Number.isInteger(i))) {
        errors.push('cardIndices must be non-negative integers');
      }
      break;
    case 'PLAY_CARD':
      if (!action.instanceId) errors.push('instanceId required');
      break;
    case 'ACTIVATE_ABILITY':
      if (!action.casterId) errors.push('casterId required');
      if (!action.abilityId) errors.push('abilityId required');
      break;
    case 'DECLARE_ATTACK':
      if (!action.attackerId) errors.push('attackerId required');
      if (!action.targetId) errors.push('targetId required');
      break;
    case 'ADVANCE_PHASE':
    case 'END_TURN':
    case 'CONCEDE':
      break;
    default:
      errors.push('unknown action type');
  }
  return { ok: errors.length === 0, errors };
}
