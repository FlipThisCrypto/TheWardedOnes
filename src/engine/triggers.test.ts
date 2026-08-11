import { describe, it, expect } from 'vitest';
import {
  createTriggerBus,
  registerTrigger,
  collectTriggers,
  markFired,
  unregisterSource,
  eventToTriggerWhen,
} from './triggers';
import { SAMPLE_SCRIPTS } from './effectIr';

describe('triggers', () => {
  it('registers and collects by when', () => {
    let bus = createTriggerBus();
    bus = registerTrigger(bus, {
      id: 't1',
      when: 'on_death',
      sourceInstanceId: 'u1',
      controllerIndex: 0,
      script: SAMPLE_SCRIPTS.fireball,
    });
    expect(collectTriggers(bus, 'on_death')).toHaveLength(1);
    expect(collectTriggers(bus, 'on_play')).toHaveLength(0);
  });

  it('once triggers mark fired', () => {
    let bus = createTriggerBus();
    bus = registerTrigger(bus, {
      id: 't1',
      when: 'start_of_turn',
      sourceInstanceId: 'u1',
      controllerIndex: 0,
      script: SAMPLE_SCRIPTS.arcane_insight,
      once: true,
    });
    bus = markFired(bus, 't1');
    expect(collectTriggers(bus, 'start_of_turn')).toHaveLength(0);
  });

  it('unregisterSource removes all for instance', () => {
    let bus = createTriggerBus();
    bus = registerTrigger(bus, {
      id: 't1',
      when: 'on_enter',
      sourceInstanceId: 'gone',
      controllerIndex: 0,
      script: SAMPLE_SCRIPTS.fireball,
    });
    bus = unregisterSource(bus, 'gone');
    expect(bus.triggers).toHaveLength(0);
    expect(eventToTriggerWhen('death')).toBe('on_death');
  });
});
