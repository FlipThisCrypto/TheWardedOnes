/**
 * Interprets EffectScript ops against a GameState (logic layer).
 */

import type { GameState, CardInstance, PlayerState } from './types';
import type { EffectOp, EffectScript, EffectTargetRef, ValueExpr } from './effectIr';
import { evalValue } from './effectIr';
import { applyDamageToUnit } from './damage';
import { getAllBattlefieldCards, findCardOnBattlefield } from './queries';
import { getCardById } from '../data/cards';
import { addLog } from './gameEngine';
import { applyStateBasedActions } from './stateBasedActions';
import { MAX_HAND_SIZE } from './gameEngine';

export interface InterpretContext {
  source: CardInstance;
  controllerIndex: 0 | 1;
  chosenTargetId?: string;
}

export interface InterpretResult {
  state: GameState;
  logs: string[];
}

function resolveTargets(
  state: GameState,
  ref: EffectTargetRef,
  ctx: InterpretContext
): { units: CardInstance[]; players: PlayerState[] } {
  const controller = state.players[ctx.controllerIndex];
  const opponent = state.players[ctx.controllerIndex === 0 ? 1 : 0];
  switch (ref.kind) {
    case 'self':
      return { units: [ctx.source], players: [] };
    case 'controller':
      return { units: [], players: [controller] };
    case 'opponent':
      return { units: [], players: [opponent] };
    case 'chosen': {
      if (!ctx.chosenTargetId) return { units: [], players: [] };
      const u =
        findCardOnBattlefield(opponent, ctx.chosenTargetId) ||
        findCardOnBattlefield(controller, ctx.chosenTargetId);
      return u ? { units: [u], players: [] } : { units: [], players: [] };
    }
    case 'all_enemies':
      return { units: getAllBattlefieldCards(opponent), players: [] };
    case 'all_allies':
      return { units: getAllBattlefieldCards(controller), players: [] };
    default:
      return { units: [], players: [] };
  }
}

function valueOf(expr: ValueExpr, source: CardInstance): number {
  return evalValue(expr, {
    sourceAttack: source.currentAttack,
    sourceDefense: source.currentDefense,
    sourceHp: source.currentHp,
    sourceSpeed: source.currentSpeed,
  });
}

function applyOp(state: GameState, op: EffectOp, ctx: InterpretContext, logs: string[]): void {
  const controller = state.players[ctx.controllerIndex];
  switch (op.op) {
    case 'damage': {
      const amount = valueOf(op.amount, ctx.source);
      const targets = resolveTargets(state, op.target, ctx);
      for (const unit of targets.units) {
        const r = applyDamageToUnit(unit, {
          amount,
          pierceWards: !!op.pierce,
          minimumOne: true,
        });
        logs.push(`damage ${r.hpDamage} to ${unit.instanceId}`);
      }
      break;
    }
    case 'heal': {
      const amount = valueOf(op.amount, ctx.source);
      const targets = resolveTargets(state, op.target, ctx);
      for (const unit of targets.units) {
        const def = getCardById(unit.definitionId);
        const max = def?.hp ?? unit.currentHp;
        unit.currentHp = Math.min(unit.currentHp + amount, max);
        logs.push(`heal ${amount} on ${unit.instanceId}`);
      }
      break;
    }
    case 'draw': {
      const n = valueOf(op.count, ctx.source);
      for (let i = 0; i < n; i++) {
        if (controller.deck.length === 0) break;
        const card = controller.deck.shift()!;
        if (controller.hand.length >= MAX_HAND_SIZE) {
          controller.graveyard.push(card);
        } else {
          controller.hand.push(card);
        }
      }
      logs.push(`draw ${n}`);
      break;
    }
    case 'gain_resource': {
      const n = valueOf(op.amount, ctx.source);
      controller.resources += n;
      logs.push(`gain_resource ${n}`);
      break;
    }
    case 'buff_stat': {
      const n = valueOf(op.amount, ctx.source);
      const targets = resolveTargets(state, op.target, ctx);
      for (const unit of targets.units) {
        if (op.stat === 'attack') unit.currentAttack += n;
        if (op.stat === 'defense') unit.currentDefense += n;
        if (op.stat === 'speed') unit.currentSpeed += n;
        logs.push(`buff ${op.stat}+${n} on ${unit.instanceId}`);
      }
      break;
    }
    case 'apply_keyword': {
      const targets = resolveTargets(state, op.target, ctx);
      for (const unit of targets.units) {
        if (!unit.keywords) unit.keywords = [];
        unit.keywords.push({ keyword: op.keyword as never, value: op.value });
        logs.push(`keyword ${op.keyword} on ${unit.instanceId}`);
      }
      break;
    }
    case 'log':
      logs.push(op.message);
      addLog(state, op.message, 'ability');
      break;
  }
}

export function interpretEffect(
  state: GameState,
  script: EffectScript,
  ctx: InterpretContext
): InterpretResult {
  const next = structuredClone(state);
  // re-bind source to cloned board if possible
  const ctrl = next.players[ctx.controllerIndex];
  const found = findCardOnBattlefield(ctrl, ctx.source.instanceId) || ctx.source;
  const localCtx: InterpretContext = { ...ctx, source: found };
  const logs: string[] = [];
  for (const op of script.ops) {
    applyOp(next, op, localCtx, logs);
  }
  applyStateBasedActions(next);
  return { state: next, logs };
}
