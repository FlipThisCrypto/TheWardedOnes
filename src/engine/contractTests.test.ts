import { describe, it, expect } from 'vitest';
import { DEFAULT_MATCH_CONFIG } from './matchConfig';
import { ENGINE_SCHEMA_VERSION } from './schemaVersion';
import { SAMPLE_SCRIPTS } from './effectIr';
import { KEYWORD_REGISTRY } from './keywords';
describe('logic contracts', () => {
  it('match config constants are bible-aligned', () => {
    expect(DEFAULT_MATCH_CONFIG.startingLife).toBe(30);
    expect(DEFAULT_MATCH_CONFIG.maxResources).toBe(10);
    expect(DEFAULT_MATCH_CONFIG.slots.fighters).toBe(4);
  });

  it('schema version is positive', () => {
    expect(ENGINE_SCHEMA_VERSION).toBeGreaterThan(0);
  });

  it('sample scripts use closed op set', () => {
    const ops = Array.from(
      new Set(Object.values(SAMPLE_SCRIPTS).flatMap(s => s.ops.map(o => o.op)))
    );
    for (const op of ops) {
      expect([
        'damage', 'heal', 'draw', 'gain_resource', 'buff_stat', 'apply_keyword', 'log',
      ]).toContain(op);
    }
  });

  it('keyword registry has frozen core set', () => {
    for (const k of ['Ward', 'Pierce', 'Hex', 'Echo', 'Taunt', 'Haste', 'Lifesteal', 'Fortify']) {
      expect(KEYWORD_REGISTRY[k as keyof typeof KEYWORD_REGISTRY]).toBeTruthy();
    }
  });
});
