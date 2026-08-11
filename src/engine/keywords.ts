/**
 * Frozen keyword semantics (engine contract).
 *
 * Ward X     — Prevents the next X damage to the unit (absorbed before HP).
 *              Depleted ward is removed. Pierce ignores Ward.
 * Fortify    — Incoming damage reduced by 1 (minimum 1 on combat/effect minOne paths).
 * Pierce     — Source ignores target Defense and skips Ward absorption.
 * Lifesteal  — Controller gains life equal to HP damage actually dealt.
 * Haste      — Unit may attack the turn it enters play (no summoning sickness).
 * Taunt      — Opponent cannot attack the player while any Taunt unit is alive.
 * Hex        — While present: unit's other keywords are suppressed (disabled).
 * Echo       — On play/resolve: queue a half-strength repeat at start of controller's next turn.
 */

export type Keyword =
  | 'Ward'
  | 'Fortify'
  | 'Pierce'
  | 'Lifesteal'
  | 'Haste'
  | 'Taunt'
  | 'Hex'
  | 'Echo';

export interface KeywordData {
  keyword: Keyword;
  value?: number; // e.g., Ward 3 = absorbs 3 damage
}

export interface KeywordDefinition {
  id: Keyword;
  hasValue: boolean;
  summary: string;
}

/** Canonical registry — single source of truth for rules UI and engine docs. */
export const KEYWORD_REGISTRY: Record<Keyword, KeywordDefinition> = {
  Ward: {
    id: 'Ward',
    hasValue: true,
    summary: 'Prevents the next X damage to this unit. Pierce ignores Ward.',
  },
  Fortify: {
    id: 'Fortify',
    hasValue: false,
    summary: 'Reduce incoming damage by 1 (minimum 1).',
  },
  Pierce: {
    id: 'Pierce',
    hasValue: false,
    summary: 'Ignore target Defense and Ward when dealing damage.',
  },
  Lifesteal: {
    id: 'Lifesteal',
    hasValue: false,
    summary: 'Gain life equal to HP damage dealt.',
  },
  Haste: {
    id: 'Haste',
    hasValue: false,
    summary: 'Can attack the turn it enters play.',
  },
  Taunt: {
    id: 'Taunt',
    hasValue: false,
    summary: 'Enemy must attack this unit before the player (while alive).',
  },
  Hex: {
    id: 'Hex',
    hasValue: false,
    summary: 'Suppresses other keywords on this unit while Hex remains.',
  },
  Echo: {
    id: 'Echo',
    hasValue: false,
    summary: 'At the start of your next turn, repeat this effect at half strength (rounded down).',
  },
};

export function hasKeyword(keywords: KeywordData[] | undefined, keyword: Keyword): boolean {
  if (!keywords?.some(k => k.keyword === keyword)) return false;
  // Hex suppresses all keywords except Hex itself
  if (keyword !== 'Hex' && keywords.some(k => k.keyword === 'Hex')) {
    return false;
  }
  return true;
}

/** Raw presence check that ignores Hex suppression (for UI / debugging). */
export function hasKeywordRaw(keywords: KeywordData[] | undefined, keyword: Keyword): boolean {
  return !!keywords?.some(k => k.keyword === keyword);
}

export function getKeywordValue(keywords: KeywordData[] | undefined, keyword: Keyword): number {
  if (!hasKeyword(keywords, keyword)) return 0;
  const kw = keywords?.find(k => k.keyword === keyword);
  return kw?.value ?? 0;
}

export function removeKeyword(keywords: KeywordData[], keyword: Keyword): KeywordData[] {
  return keywords.filter(k => k.keyword !== keyword);
}

export function getKeywordDescription(kw: KeywordData): string {
  const def = KEYWORD_REGISTRY[kw.keyword];
  if (kw.keyword === 'Ward') {
    return `Ward ${kw.value ?? 0}: Absorbs ${kw.value ?? 0} damage before HP. Pierce ignores Ward.`;
  }
  return def ? `${def.id}: ${def.summary}` : kw.keyword;
}

export function listKeywordDefinitions(): KeywordDefinition[] {
  return Object.values(KEYWORD_REGISTRY);
}
