/**
 * Hard phase guards used by reducer / session — fail closed.
 */

import type { GamePhase } from './types';
import type { PlayerAction } from './actions';
import { isActionLegalInPhase } from './turnMachine';

export class PhaseGuardError extends Error {
  constructor(
    public phase: GamePhase,
    public actionType: string,
    message?: string
  ) {
    super(message ?? `Action ${actionType} illegal in phase ${phase}`);
    this.name = 'PhaseGuardError';
  }
}

export function assertActionPhase(phase: GamePhase, action: PlayerAction): void {
  const kind = action.type;
  if (kind === 'CONCEDE') return;
  if (!isActionLegalInPhase(phase, kind)) {
    // END_TURN special-cased in actions reducer; allow soft check here
    if (kind === 'END_TURN' && (phase === 'main' || phase === 'combat' || phase === 'end')) {
      return;
    }
    if (kind === 'ADVANCE_PHASE' && isActionLegalInPhase(phase, 'ADVANCE_PHASE')) {
      return;
    }
    if (kind === 'END_TURN') return; // handled by reducer
    throw new PhaseGuardError(phase, kind);
  }
}
