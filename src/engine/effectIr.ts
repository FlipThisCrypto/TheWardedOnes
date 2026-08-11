/**
 * Effect Intermediate Representation — data-driven ability ops.
 * Round 2 foundation: small closed op set + interpreter.
 */

import type { Element } from './types';

export type ValueExpr =
  | { kind: 'const'; value: number }
  | { kind: 'source_stat'; stat: 'attack' | 'defense' | 'hp' | 'speed' }
  | { kind: 'half'; of: ValueExpr };

export type DurationExpr =
  | { kind: 'turns'; n: number }
  | { kind: 'permanent' }
  | { kind: 'end_of_turn' };

export type EffectTargetRef =
  | { kind: 'self' }
  | { kind: 'controller' }
  | { kind: 'opponent' }
  | { kind: 'chosen' }
  | { kind: 'all_enemies' }
  | { kind: 'all_allies' };

export type EffectOp =
  | { op: 'damage'; amount: ValueExpr; element?: Element; pierce?: boolean; target: EffectTargetRef }
  | { op: 'heal'; amount: ValueExpr; target: EffectTargetRef }
  | { op: 'draw'; count: ValueExpr }
  | { op: 'gain_resource'; amount: ValueExpr }
  | { op: 'buff_stat'; stat: 'attack' | 'defense' | 'speed'; amount: ValueExpr; duration: DurationExpr; target: EffectTargetRef }
  | { op: 'apply_keyword'; keyword: string; value?: number; target: EffectTargetRef }
  | { op: 'log'; message: string };

export interface EffectScript {
  id: string;
  name: string;
  ops: EffectOp[];
}

export function evalValue(
  expr: ValueExpr,
  ctx: { sourceAttack: number; sourceDefense: number; sourceHp: number; sourceSpeed: number }
): number {
  switch (expr.kind) {
    case 'const':
      return expr.value;
    case 'source_stat':
      if (expr.stat === 'attack') return ctx.sourceAttack;
      if (expr.stat === 'defense') return ctx.sourceDefense;
      if (expr.stat === 'hp') return ctx.sourceHp;
      return ctx.sourceSpeed;
    case 'half':
      return Math.floor(evalValue(expr.of, ctx) / 2);
    default:
      return 0;
  }
}

/** Built-in sample scripts for migration path from flat abilities. */
export const SAMPLE_SCRIPTS: Record<string, EffectScript> = {
  fireball: {
    id: 'fireball',
    name: 'Fireball',
    ops: [
      { op: 'damage', amount: { kind: 'const', value: 6 }, element: 'Fire', target: { kind: 'chosen' } },
      { op: 'log', message: 'Fireball strikes.' },
    ],
  },
  arcane_insight: {
    id: 'arcane_insight',
    name: 'Arcane Insight',
    ops: [
      { op: 'draw', count: { kind: 'const', value: 2 } },
      { op: 'log', message: 'Draw 2.' },
    ],
  },
  echo_half_damage: {
    id: 'echo_half_damage',
    name: 'Echo Half',
    ops: [
      {
        op: 'damage',
        amount: { kind: 'half', of: { kind: 'const', value: 6 } },
        target: { kind: 'chosen' },
      },
    ],
  },
};
