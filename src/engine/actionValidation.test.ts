import { describe, it, expect } from 'vitest';
import { validateActionPayload } from './actionValidation';

describe('actionValidation', () => {
  it('accepts end turn', () => {
    expect(validateActionPayload({ type: 'END_TURN' }).ok).toBe(true);
  });

  it('rejects empty play card', () => {
    const r = validateActionPayload({ type: 'PLAY_CARD', instanceId: '' });
    expect(r.ok).toBe(false);
  });

  it('rejects bad mulligan indices', () => {
    const r = validateActionPayload({ type: 'MULLIGAN', cardIndices: [-1] });
    expect(r.ok).toBe(false);
  });
});
