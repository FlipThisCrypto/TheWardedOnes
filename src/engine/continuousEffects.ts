/**
 * Continuous effect layers — recompute derived stats from printed + modifiers.
 */

import type { CardInstance } from './types';
import { getCardById } from '../data/cards';

export interface StatModifier {
  id: string;
  sourceId: string;
  stat: 'attack' | 'defense' | 'speed' | 'hp';
  amount: number;
  /** Lower applies first; default 50 */
  layer?: number;
}

export interface ContinuousBoard {
  modifiers: StatModifier[];
}

export function createContinuousBoard(): ContinuousBoard {
  return { modifiers: [] };
}

export function addModifier(board: ContinuousBoard, mod: StatModifier): ContinuousBoard {
  return { modifiers: [...board.modifiers, mod] };
}

export function removeModifiersFromSource(board: ContinuousBoard, sourceId: string): ContinuousBoard {
  return { modifiers: board.modifiers.filter(m => m.sourceId !== sourceId) };
}

/**
 * Returns effective stats without mutating the instance.
 */
export function computeEffectiveStats(
  instance: CardInstance,
  board: ContinuousBoard
): { attack: number; defense: number; speed: number; maxHp: number } {
  const def = getCardById(instance.definitionId);
  const baseAtk = def?.attack ?? instance.currentAttack;
  const baseDef = def?.defense ?? instance.currentDefense;
  const baseSpd = def?.speed ?? instance.currentSpeed;
  const baseHp = def?.hp ?? instance.currentHp;

  // Start from current runtime (includes permanent buffs already applied)
  // Continuous layers add on top of printed for display/rules clarity
  let attack = baseAtk;
  let defense = baseDef;
  let speed = baseSpd;
  let maxHp = baseHp;

  const mods = [...board.modifiers]
    .filter(m => m.sourceId === instance.instanceId || true)
    .sort((a, b) => (a.layer ?? 50) - (b.layer ?? 50));

  // Only mods targeting this unit: we use sourceId as target id convention
  for (const m of mods) {
    if (m.sourceId !== instance.instanceId && m.id.indexOf(instance.instanceId) === -1) {
      // Prefer explicit target encoded in id: `tgt:<instanceId>:...`
      if (!m.id.startsWith(`tgt:${instance.instanceId}:`)) continue;
    } else if (m.sourceId !== instance.instanceId && !m.id.startsWith(`tgt:${instance.instanceId}:`)) {
      continue;
    }
    if (m.stat === 'attack') attack += m.amount;
    if (m.stat === 'defense') defense += m.amount;
    if (m.stat === 'speed') speed += m.amount;
    if (m.stat === 'hp') maxHp += m.amount;
  }

  return {
    attack: Math.max(0, attack),
    defense: Math.max(0, defense),
    speed: Math.max(0, speed),
    maxHp: Math.max(1, maxHp),
  };
}

/** Cleaner API: modifiers carry targetInstanceId */
export interface TargetedModifier {
  id: string;
  targetInstanceId: string;
  sourceId: string;
  stat: 'attack' | 'defense' | 'speed' | 'hp';
  amount: number;
  layer?: number;
}

export function computeStatsWithTargets(
  instance: CardInstance,
  mods: TargetedModifier[]
): { attack: number; defense: number; speed: number; maxHp: number } {
  const def = getCardById(instance.definitionId);
  let attack = def?.attack ?? 0;
  let defense = def?.defense ?? 0;
  let speed = def?.speed ?? 0;
  let maxHp = def?.hp ?? 1;
  const sorted = [...mods]
    .filter(m => m.targetInstanceId === instance.instanceId)
    .sort((a, b) => (a.layer ?? 50) - (b.layer ?? 50));
  for (const m of sorted) {
    if (m.stat === 'attack') attack += m.amount;
    if (m.stat === 'defense') defense += m.amount;
    if (m.stat === 'speed') speed += m.amount;
    if (m.stat === 'hp') maxHp += m.amount;
  }
  return {
    attack: Math.max(0, attack),
    defense: Math.max(0, defense),
    speed: Math.max(0, speed),
    maxHp: Math.max(1, maxHp),
  };
}
