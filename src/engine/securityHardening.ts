/**
 * Logic-layer security hardening helpers for untrusted action payloads.
 */

import type { PlayerAction } from './actions';
import { validateActionPayload } from './actionValidation';

const MAX_STRING = 128;
const MAX_INDICES = 20;

export function sanitizeAction(action: PlayerAction): PlayerAction | null {
  // Normalize first, then validate cleaned payload
  let normalized: PlayerAction = action;
  switch (action.type) {
    case 'MULLIGAN': {
      const idxs = (action.cardIndices ?? [])
        .filter(i => Number.isInteger(i) && i >= 0 && i < 100)
        .slice(0, MAX_INDICES);
      normalized = { type: 'MULLIGAN', cardIndices: idxs };
      break;
    }
    default:
      break;
  }

  const v = validateActionPayload(normalized);
  if (!v.ok) return null;

  switch (normalized.type) {
    case 'MULLIGAN':
      return normalized;
    case 'PLAY_CARD':
      if (normalized.instanceId.length > MAX_STRING) return null;
      if (normalized.attachTargetId && normalized.attachTargetId.length > MAX_STRING) return null;
      return normalized;
    case 'ACTIVATE_ABILITY':
      if (normalized.casterId.length > MAX_STRING || normalized.abilityId.length > MAX_STRING) return null;
      return normalized;
    case 'DECLARE_ATTACK':
      if (normalized.attackerId.length > MAX_STRING) return null;
      if (typeof normalized.targetId === 'string' && normalized.targetId.length > MAX_STRING) return null;
      return normalized;
    default:
      return normalized;
  }
}

export function isSafeInstanceId(id: string): boolean {
  return /^[a-zA-Z0-9_.:-]{1,128}$/.test(id);
}
