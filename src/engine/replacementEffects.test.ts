import { describe, it, expect } from 'vitest';
import { applyReplacements, preventNextDamage } from './replacementEffects';

describe('replacementEffects', () => {
  it('reduces damage once then expires', () => {
    let effects = [preventNextDamage('u1', 'r1')];
    let r = applyReplacements({ type: 'damage', amount: 5, targetId: 'u1' }, effects);
    expect(r.event && r.event.type === 'damage' && r.event.amount).toBe(4);
    expect(r.effects).toHaveLength(0);
    r = applyReplacements({ type: 'damage', amount: 5, targetId: 'u1' }, r.effects);
    expect(r.event && r.event.type === 'damage' && r.event.amount).toBe(5);
  });
});
