/**
 * Echo keyword queue — half-strength effects at start of next turn.
 */

import type { EffectScript } from './effectIr';
import type { EffectOp, ValueExpr } from './effectIr';

export interface EchoEntry {
  id: string;
  controllerIndex: 0 | 1;
  script: EffectScript;
  chosenTargetId?: string;
  sourceInstanceId: string;
  resolveOnTurn: number;
}

export interface EchoQueue {
  entries: EchoEntry[];
}

export function createEchoQueue(): EchoQueue {
  return { entries: [] };
}

function halfValue(expr: ValueExpr): ValueExpr {
  return { kind: 'half', of: expr };
}

function halfOps(ops: EffectOp[]): EffectOp[] {
  return ops.map(op => {
    if (op.op === 'damage') return { ...op, amount: halfValue(op.amount) };
    if (op.op === 'heal') return { ...op, amount: halfValue(op.amount) };
    if (op.op === 'draw') return { ...op, count: halfValue(op.count) };
    if (op.op === 'gain_resource') return { ...op, amount: halfValue(op.amount) };
    if (op.op === 'buff_stat') return { ...op, amount: halfValue(op.amount) };
    return op;
  });
}

export function enqueueEcho(
  queue: EchoQueue,
  entry: Omit<EchoEntry, 'id' | 'script'> & { script: EffectScript },
  nextId: string
): EchoQueue {
  const halved: EffectScript = {
    ...entry.script,
    id: `${entry.script.id}_echo`,
    name: `${entry.script.name} (Echo)`,
    ops: halfOps(entry.script.ops),
  };
  return {
    entries: [
      ...queue.entries,
      {
        ...entry,
        id: nextId,
        script: halved,
      },
    ],
  };
}

export function drainEchoForTurn(
  queue: EchoQueue,
  turn: number,
  controllerIndex: 0 | 1
): { queue: EchoQueue; due: EchoEntry[] } {
  const due = queue.entries.filter(
    e => e.resolveOnTurn === turn && e.controllerIndex === controllerIndex
  );
  const remaining = queue.entries.filter(
    e => !(e.resolveOnTurn === turn && e.controllerIndex === controllerIndex)
  );
  return { queue: { entries: remaining }, due };
}
