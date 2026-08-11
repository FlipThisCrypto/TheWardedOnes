import { describe, it, expect } from 'vitest';
import { sanitizeAction, isSafeInstanceId } from './securityHardening';

describe('securityHardening', () => {
  it('sanitizes mulligan indices', () => {
    const a = sanitizeAction({ type: 'MULLIGAN', cardIndices: [0, -1, 2] });
    expect(a && a.type === 'MULLIGAN' && a.cardIndices).toEqual([0, 2]);
  });

  it('rejects oversized instance ids', () => {
    expect(sanitizeAction({ type: 'PLAY_CARD', instanceId: 'x'.repeat(200) })).toBeNull();
  });

  it('validates instance id charset', () => {
    expect(isSafeInstanceId('inst_1')).toBe(true);
    expect(isSafeInstanceId('bad id!')).toBe(false);
  });
});
