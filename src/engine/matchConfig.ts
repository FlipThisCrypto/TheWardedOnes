/**
 * Match rules configuration — tunables without hardcoding in engine paths.
 */

export interface MatchConfig {
  startingLife: number;
  startingHand: number;
  maxHandSize: number;
  maxResources: number;
  deckSize: number;
  slots: {
    mage: number;
    fighters: number;
    beasts: number;
    totems: number;
  };
  minCombatDamage: number;
  fatigueEnabled: boolean;
  stackEnabled: boolean;
  allowResponses: boolean;
}

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  startingLife: 30,
  startingHand: 5,
  maxHandSize: 10,
  maxResources: 10,
  deckSize: 40,
  slots: { mage: 1, fighters: 4, beasts: 3, totems: 2 },
  minCombatDamage: 1,
  fatigueEnabled: true,
  stackEnabled: true,
  allowResponses: false,
};

export function validateMatchConfig(cfg: MatchConfig): string[] {
  const errors: string[] = [];
  if (cfg.startingLife < 1) errors.push('startingLife must be >= 1');
  if (cfg.startingHand < 0) errors.push('startingHand must be >= 0');
  if (cfg.maxHandSize < cfg.startingHand) errors.push('maxHandSize < startingHand');
  if (cfg.maxResources < 1) errors.push('maxResources must be >= 1');
  if (cfg.deckSize < 1) errors.push('deckSize must be >= 1');
  return errors;
}

export function mergeMatchConfig(partial: Partial<MatchConfig>): MatchConfig {
  return {
    ...DEFAULT_MATCH_CONFIG,
    ...partial,
    slots: { ...DEFAULT_MATCH_CONFIG.slots, ...partial.slots },
  };
}
