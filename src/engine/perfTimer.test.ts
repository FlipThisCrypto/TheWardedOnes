import { describe, it, expect } from 'vitest';
import { PerfTimer } from './perfTimer';

describe('perfTimer', () => {
  it('records marks', () => {
    const t = new PerfTimer();
    const v = t.time('add', () => 1 + 1);
    expect(v).toBe(2);
    expect(t.getMarks()[0].name).toBe('add');
    expect(t.totalMs()).toBeGreaterThanOrEqual(0);
  });
});
