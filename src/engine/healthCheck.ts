/**
 * Engine health check — verifies catalog + critical modules load.
 */

import { isCatalogValid, validateCardCatalog } from '../data/cardCatalog';
import { ALL_CARDS } from '../data/cards';
import { ABILITIES } from './abilities';
import { KEYWORD_REGISTRY } from './keywords';
import { DEFAULT_MATCH_CONFIG, validateMatchConfig } from './matchConfig';

export interface HealthReport {
  ok: boolean;
  checks: { name: string; ok: boolean; detail?: string }[];
}

export function runEngineHealthCheck(): HealthReport {
  const checks: HealthReport['checks'] = [];

  const catalogOk = isCatalogValid();
  checks.push({
    name: 'card_catalog',
    ok: catalogOk,
    detail: catalogOk ? `${ALL_CARDS.length} cards` : validateCardCatalog()[0]?.message,
  });

  const abilityCount = Object.keys(ABILITIES).length;
  checks.push({
    name: 'abilities',
    ok: abilityCount > 0,
    detail: `${abilityCount} abilities`,
  });

  checks.push({
    name: 'keywords',
    ok: Object.keys(KEYWORD_REGISTRY).length >= 8,
    detail: Object.keys(KEYWORD_REGISTRY).join(','),
  });

  const cfgErrors = validateMatchConfig(DEFAULT_MATCH_CONFIG);
  checks.push({
    name: 'match_config',
    ok: cfgErrors.length === 0,
    detail: cfgErrors.join(';') || 'default ok',
  });

  return { ok: checks.every(c => c.ok), checks };
}
