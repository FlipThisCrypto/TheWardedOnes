/**
 * Triggered ability registry — event → pending scripts.
 */

import type { GameState } from './types';
import type { EffectScript } from './effectIr';
import type { GameEventType } from './events';

export type TriggerWhen =
  | 'on_enter'
  | 'on_death'
  | 'on_damage_dealt'
  | 'start_of_turn'
  | 'end_of_turn'
  | 'on_play';

export interface TriggerDef {
  id: string;
  when: TriggerWhen;
  sourceInstanceId: string;
  controllerIndex: 0 | 1;
  script: EffectScript;
  once?: boolean;
  fired?: boolean;
}

export interface TriggerBus {
  triggers: TriggerDef[];
}

export function createTriggerBus(): TriggerBus {
  return { triggers: [] };
}

export function registerTrigger(bus: TriggerBus, def: TriggerDef): TriggerBus {
  return { triggers: [...bus.triggers, def] };
}

export function unregisterSource(bus: TriggerBus, instanceId: string): TriggerBus {
  return { triggers: bus.triggers.filter(t => t.sourceInstanceId !== instanceId) };
}

export function collectTriggers(
  bus: TriggerBus,
  when: TriggerWhen
): TriggerDef[] {
  return bus.triggers.filter(t => t.when === when && !t.fired);
}

export function markFired(bus: TriggerBus, id: string): TriggerBus {
  return {
    triggers: bus.triggers.map(t =>
      t.id === id ? { ...t, fired: t.once ? true : t.fired } : t
    ),
  };
}

/** Map game event types to trigger buckets (subset). */
export function eventToTriggerWhen(type: GameEventType): TriggerWhen | null {
  switch (type) {
    case 'play_card':
      return 'on_play';
    case 'death':
      return 'on_death';
    case 'damage':
      return 'on_damage_dealt';
    default:
      return null;
  }
}

export function attachTriggerBus(state: GameState, bus: TriggerBus): GameState & { triggerBus: TriggerBus } {
  return { ...state, triggerBus: bus };
}
