import { describe, it, expect } from 'vitest';
import { createPriority, passPriority, resetPriorityOnStackPush } from './priority';

describe('priority', () => {
  it('two passes on empty stack clear priority', () => {
    let p = createPriority(0);
    let r = passPriority(p, 0);
    expect(r.bothPassed).toBe(false);
    p = r.priority;
    r = passPriority(p, 0);
    expect(r.bothPassed).toBe(true);
    expect(r.priority.holder).toBeNull();
  });

  it('stack push resets passes', () => {
    let p = createPriority(0);
    p = passPriority(p, 0).priority;
    p = resetPriorityOnStackPush(p, 0);
    expect(p.passesInRow).toBe(0);
    expect(p.holder).toBe(0);
  });
});
