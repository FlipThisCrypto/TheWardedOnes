import { describe, it, expect } from 'vitest';
import { createMatchClock, startClock, tickClock, switchClock, isFlagged } from './matchClock';

describe('matchClock', () => {
  it('decrements active player time', () => {
    let c = createMatchClock(10_000);
    c = startClock(c, 0, 1000);
    c = tickClock(c, 2500);
    expect(c.p0Ms).toBe(8500);
    expect(c.p1Ms).toBe(10_000);
  });

  it('flags when time expires', () => {
    let c = createMatchClock(100);
    c = startClock(c, 1, 0);
    c = tickClock(c, 200);
    expect(isFlagged(c)).toBe(1);
  });

  it('switchClock changes active', () => {
    let c = createMatchClock(5000);
    c = startClock(c, 0, 0);
    c = switchClock(c, 1, 100);
    expect(c.active).toBe(1);
  });
});
