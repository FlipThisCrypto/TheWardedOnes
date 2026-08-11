import { describe, it, expect } from 'vitest';
import { DecisionTrace } from './decisionTrace';

describe('decisionTrace', () => {
  it('records steps', () => {
    const t = new DecisionTrace();
    t.add('PLAY_CARD', 4.5, 'curve');
    t.add('END_TURN', 0.1);
    expect(t.list()).toHaveLength(2);
    expect(t.summary()).toContain('PLAY_CARD');
  });
});
