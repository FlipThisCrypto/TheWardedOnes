export type Keyword = 'Ward' | 'Fortify' | 'Pierce' | 'Lifesteal' | 'Haste' | 'Taunt' | 'Hex' | 'Echo';

export interface KeywordData {
  keyword: Keyword;
  value?: number; // e.g., Ward 3 = absorbs 3 damage
}

export function hasKeyword(keywords: KeywordData[] | undefined, keyword: Keyword): boolean {
  return !!keywords?.some(k => k.keyword === keyword);
}

export function getKeywordValue(keywords: KeywordData[] | undefined, keyword: Keyword): number {
  const kw = keywords?.find(k => k.keyword === keyword);
  return kw?.value ?? 0;
}

export function removeKeyword(keywords: KeywordData[], keyword: Keyword): KeywordData[] {
  return keywords.filter(k => k.keyword !== keyword);
}

export function getKeywordDescription(kw: KeywordData): string {
  switch (kw.keyword) {
    case 'Ward': return `Ward ${kw.value ?? 0}: Absorbs ${kw.value ?? 0} damage before HP`;
    case 'Fortify': return 'Fortify: Reduces incoming damage by 1';
    case 'Pierce': return 'Pierce: Ignores target defense';
    case 'Lifesteal': return 'Lifesteal: Heals controller for damage dealt';
    case 'Haste': return 'Haste: Can attack immediately';
    case 'Taunt': return 'Taunt: Must be attacked before player';
    case 'Hex': return 'Hex: Disables target keywords';
    case 'Echo': return 'Echo: Triggers ability twice';
    default: return kw.keyword;
  }
}
