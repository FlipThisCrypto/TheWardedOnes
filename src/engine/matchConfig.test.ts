import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MATCH_CONFIG,
  validateMatchConfig,
  mergeMatchConfig,
} from './matchConfig';

describe('matchConfig', () => {
  it('default config is valid', () => {
    expect(validateMatchConfig(DEFAULT_MATCH_CONFIG)).toEqual([]);
  });

  it('rejects invalid life', () => {
    expect(validateMatchConfig(mergeMatchConfig({ startingLife: 0 })).length).toBeGreaterThan(0);
  });

  it('merges partial slots', () => {
    const cfg = mergeMatchConfig({ maxResources: 12, slots: { fighters: 5 } });
    expect(cfg.maxResources).toBe(12);
    expect(cfg.slots.fighters).toBe(5);
    expect(cfg.slots.mage).toBe(1);
  });
});
