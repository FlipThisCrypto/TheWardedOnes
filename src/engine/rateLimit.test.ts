import { describe, it, expect } from 'vitest';
import { TokenBucket } from './rateLimit';

describe('rateLimit', () => {
  it('allows up to capacity then blocks', () => {
    const b = new TokenBucket(2, 0);
    expect(b.tryTake()).toBe(true);
    expect(b.tryTake()).toBe(true);
    expect(b.tryTake()).toBe(false);
  });
});
