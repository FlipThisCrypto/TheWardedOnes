/**
 * Resolution stack for abilities/spells.
 * v1: LIFO resolve; no opponent responses yet (auto-pass both).
 */

import type { GameState } from './types';
import type { EffectScript } from './effectIr';
import { interpretEffect, type InterpretContext } from './effectInterpreter';
import { addLog } from './gameEngine';
import { applyStateBasedActions } from './stateBasedActions';

export interface StackObject {
  id: string;
  name: string;
  controllerIndex: 0 | 1;
  script: EffectScript;
  ctx: InterpretContext;
  sourceInstanceId: string;
}

export interface StackState {
  objects: StackObject[];
}

let stackSeq = 0;

export function createEmptyStack(): StackState {
  return { objects: [] };
}

export function pushStack(
  stack: StackState,
  item: Omit<StackObject, 'id'>
): StackState {
  stackSeq += 1;
  return {
    objects: [...stack.objects, { ...item, id: `stack_${stackSeq}` }],
  };
}

export function resolveTop(
  state: GameState,
  stack: StackState
): { state: GameState; stack: StackState; resolved: StackObject | null } {
  if (stack.objects.length === 0) {
    return { state, stack, resolved: null };
  }
  const objects = [...stack.objects];
  const top = objects.pop()!;
  const result = interpretEffect(state, top.script, top.ctx);
  let next = result.state;
  addLog(next, `Resolved ${top.name} from stack.`, 'ability');
  const sba = applyStateBasedActions(next);
  return { state: sba.state, stack: { objects }, resolved: top };
}

export function resolveFully(
  state: GameState,
  stack: StackState
): { state: GameState; stack: StackState; resolvedCount: number } {
  let s = state;
  let st = stack;
  let count = 0;
  while (st.objects.length > 0) {
    const r = resolveTop(s, st);
    s = r.state;
    st = r.stack;
    count += 1;
    if (count > 64) break; // safety
  }
  return { state: s, stack: st, resolvedCount: count };
}
