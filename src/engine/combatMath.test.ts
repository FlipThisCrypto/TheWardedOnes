import { describe, it, expect } from 'vitest';
import { computeCombatRawDamage, wouldLethalIgnoringWard } from './combatMath';
import { STRONG_MODIFIER } from './elements';

describe('combatMath', () => {
  it('subtracts defense from attack', () => {
    const r = computeCombatRawDamage({
      attack: 8,
      defense: 3,
      attackerElements: ['Fire'],
      defenderElements: ['Ice'],
      pierce: false,
    });
    expect(r.raw).toBe(5);
    expect(r.defenseUsed).toBe(3);
  });

  it('pierce zeros defense', () => {
    const r = computeCombatRawDamage({
      attack: 5,
      defense: 99,
      attackerElements: ['Fire'],
      defenderElements: ['Ice'],
      pierce: true,
    });
    expect(r.raw).toBe(5);
    expect(r.defenseUsed).toBe(0);
  });

  it('includes element strength', () => {
    const r = computeCombatRawDamage({
      attack: 5,
      defense: 0,
      attackerElements: ['Fire'],
      defenderElements: ['Nature'],
      pierce: false,
    });
    expect(r.elementMod).toBe(STRONG_MODIFIER);
    expect(r.raw).toBe(5 + STRONG_MODIFIER);
  });

  it('wouldLethalIgnoringWard respects fortify', () => {
    const input = {
      attack: 5,
      defense: 0,
      attackerElements: ['Fire'] as const,
      defenderElements: ['Ice'] as const,
      pierce: false,
    };
    expect(wouldLethalIgnoringWard({ ...input, attackerElements: ['Fire'], defenderElements: ['Ice'] }, 5, false)).toBe(true);
    expect(wouldLethalIgnoringWard({ ...input, attackerElements: ['Fire'], defenderElements: ['Ice'] }, 5, true)).toBe(false);
  });
});
