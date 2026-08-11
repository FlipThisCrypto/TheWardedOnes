/**
 * Replacement effects — intercept events before they apply (e.g. prevent damage once).
 */

export type ReplaceableEvent =
  | { type: 'damage'; amount: number; targetId: string }
  | { type: 'draw'; count: number; playerIndex: 0 | 1 }
  | { type: 'destroy'; targetId: string };

export interface ReplacementEffect {
  id: string;
  /** Return modified event or null to cancel entirely */
  replace: (event: ReplaceableEvent) => ReplaceableEvent | null;
  usesRemaining: number;
}

export function applyReplacements(
  event: ReplaceableEvent,
  effects: ReplacementEffect[]
): { event: ReplaceableEvent | null; effects: ReplacementEffect[] } {
  let current: ReplaceableEvent | null = event;
  const nextEffects: ReplacementEffect[] = [];
  for (const eff of effects) {
    if (!current || eff.usesRemaining <= 0) {
      nextEffects.push(eff);
      continue;
    }
    const replaced = eff.replace(current);
    if (replaced !== current) {
      current = replaced;
      nextEffects.push({ ...eff, usesRemaining: eff.usesRemaining - 1 });
    } else {
      nextEffects.push(eff);
    }
  }
  return { event: current, effects: nextEffects.filter(e => e.usesRemaining > 0) };
}

/** Built-in: prevent next 1 damage to a unit (simple ward-like replacement for face/effects). */
export function preventNextDamage(targetId: string, id: string): ReplacementEffect {
  return {
    id,
    usesRemaining: 1,
    replace: (event) => {
      if (event.type === 'damage' && event.targetId === targetId && event.amount > 0) {
        return { ...event, amount: Math.max(0, event.amount - 1) };
      }
      return event;
    },
  };
}
