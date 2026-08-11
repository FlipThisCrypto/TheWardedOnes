import { describe, it, expect } from 'vitest';
import { assertActionPhase, PhaseGuardError } from './phaseGuards';

describe('phaseGuards', () => {
  it('throws on illegal play in combat', () => {
    expect(() =>
      assertActionPhase('combat', { type: 'PLAY_CARD', instanceId: 'x' })
    ).toThrow(PhaseGuardError);
  });

  it('allows attack in combat', () => {
    expect(() =>
      assertActionPhase('combat', {
        type: 'DECLARE_ATTACK',
        attackerId: 'a',
        targetId: 'player',
      })
    ).not.toThrow();
  });
});
