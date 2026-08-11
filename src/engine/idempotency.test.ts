import { describe, it, expect } from 'vitest';
import { IdempotencyGuard, hashActionPayload } from './idempotency';

describe('idempotency', () => {
  it('detects duplicate keys', () => {
    const g = new IdempotencyGuard();
    expect(g.check('a1')).toBeNull();
    g.remember('a1', 'deadbeef');
    expect(g.check('a1')?.resultHash).toBe('deadbeef');
  });

  it('hashes payloads stably', () => {
    const h1 = hashActionPayload({ type: 'END_TURN' });
    const h2 = hashActionPayload({ type: 'END_TURN' });
    expect(h1).toBe(h2);
    expect(hashActionPayload({ type: 'CONCEDE' })).not.toBe(h1);
  });
});
