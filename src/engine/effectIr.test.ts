import { describe, it, expect } from 'vitest';
import { evalValue, SAMPLE_SCRIPTS } from './effectIr';

describe('effectIr', () => {
  const ctx = { sourceAttack: 8, sourceDefense: 3, sourceHp: 10, sourceSpeed: 5 };

  it('evaluates const and source_stat', () => {
    expect(evalValue({ kind: 'const', value: 4 }, ctx)).toBe(4);
    expect(evalValue({ kind: 'source_stat', stat: 'attack' }, ctx)).toBe(8);
  });

  it('evaluates half for Echo-style effects', () => {
    expect(evalValue({ kind: 'half', of: { kind: 'const', value: 7 } }, ctx)).toBe(3);
  });

  it('sample scripts have ordered ops', () => {
    expect(SAMPLE_SCRIPTS.fireball.ops[0].op).toBe('damage');
    expect(SAMPLE_SCRIPTS.arcane_insight.ops.some(o => o.op === 'draw')).toBe(true);
  });
});
