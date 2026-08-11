import { describe, it, expect } from 'vitest';
import { runMatchBenchmark } from './simBenchmark';

describe('simBenchmark', () => {
  it('runs a small batch of matches', () => {
    const r = runMatchBenchmark(3, 500);
    expect(r.matches).toBe(3);
    expect(r.totalMs).toBeGreaterThanOrEqual(0);
    expect(r.avgMsPerMatch).toBeGreaterThanOrEqual(0);
  });
});
