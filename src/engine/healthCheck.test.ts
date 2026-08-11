import { describe, it, expect } from 'vitest';
import { runEngineHealthCheck } from './healthCheck';

describe('healthCheck', () => {
  it('engine health is green', () => {
    const report = runEngineHealthCheck();
    expect(report.ok).toBe(true);
    expect(report.checks.length).toBeGreaterThan(0);
  });
});
