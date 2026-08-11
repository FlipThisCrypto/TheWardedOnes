/**
 * Deck list diff / analytics for builder intelligence.
 */

export interface DeckDiff {
  onlyA: string[];
  onlyB: string[];
  shared: string[];
}

export function diffDecks(a: string[], b: string[]): DeckDiff {
  const setA = new Map<string, number>();
  const setB = new Map<string, number>();
  for (const id of a) setA.set(id, (setA.get(id) ?? 0) + 1);
  for (const id of b) setB.set(id, (setB.get(id) ?? 0) + 1);
  const onlyA: string[] = [];
  const onlyB: string[] = [];
  const shared: string[] = [];
  const keys = Array.from(new Set([...Array.from(setA.keys()), ...Array.from(setB.keys())]));
  for (const k of keys) {
    const ca = setA.get(k) ?? 0;
    const cb = setB.get(k) ?? 0;
    const common = Math.min(ca, cb);
    for (let i = 0; i < common; i++) shared.push(k);
    for (let i = 0; i < ca - common; i++) onlyA.push(k);
    for (let i = 0; i < cb - common; i++) onlyB.push(k);
  }
  return { onlyA, onlyB, shared };
}

export function manaCurve(cardCosts: number[]): Record<number, number> {
  const curve: Record<number, number> = {};
  for (const c of cardCosts) {
    const bucket = Math.min(7, Math.max(0, c));
    curve[bucket] = (curve[bucket] ?? 0) + 1;
  }
  return curve;
}

export function averageCost(cardCosts: number[]): number {
  if (cardCosts.length === 0) return 0;
  return cardCosts.reduce((a, b) => a + b, 0) / cardCosts.length;
}
