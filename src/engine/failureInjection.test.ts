import { describe, it, expect } from 'vitest';
import { createInjector, shouldRejectAction, maybeCorruptRng } from './failureInjection';

describe('failureInjection', () => {
  it('rejects when mode enabled', () => {
    const inj = createInjector('reject_all_actions');
    expect(shouldRejectAction(inj)).toBe(true);
    expect(inj.trips).toBe(1);
  });

  it('corrupts rng state', () => {
    const inj = createInjector('corrupt_rng');
    expect(maybeCorruptRng(inj, 1)).not.toBe(1);
  });
});
