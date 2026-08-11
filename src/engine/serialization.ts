/**
 * GameState serialization for save/resume (logic-layer snapshot).
 */

import type { GameState } from './types';
import { safeJsonParse, safeJsonStringify } from '../lib/safeJson';
import { checkMatchInvariants } from './assertInvariants';

export interface SerializedMatch {
  version: 1;
  savedAt: number;
  state: GameState;
}

export function serializeMatch(state: GameState): string {
  const payload: SerializedMatch = {
    version: 1,
    savedAt: Date.now(),
    state,
  };
  return safeJsonStringify(payload);
}

export function deserializeMatch(raw: string): { ok: true; state: GameState } | { ok: false; error: string } {
  const parsed = safeJsonParse<SerializedMatch | null>(raw, null);
  if (!parsed || parsed.version !== 1 || !parsed.state) {
    return { ok: false, error: 'Invalid snapshot' };
  }
  const violations = checkMatchInvariants(parsed.state);
  if (violations.length > 0) {
    return { ok: false, error: `Snapshot invariants failed: ${violations[0].code}` };
  }
  return { ok: true, state: parsed.state };
}
