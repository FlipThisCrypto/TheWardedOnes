import { describe, it, expect } from 'vitest';
import { createEchoQueue, enqueueEcho, drainEchoForTurn } from './echoQueue';
import { SAMPLE_SCRIPTS, evalValue } from './effectIr';

describe('echoQueue', () => {
  it('halves damage amounts on enqueue', () => {
    let q = createEchoQueue();
    q = enqueueEcho(
      q,
      {
        controllerIndex: 0,
        script: SAMPLE_SCRIPTS.fireball,
        sourceInstanceId: 's1',
        resolveOnTurn: 2,
      },
      'e1'
    );
    const dmg = q.entries[0].script.ops.find(o => o.op === 'damage');
    expect(dmg && dmg.op === 'damage').toBe(true);
    if (dmg && dmg.op === 'damage') {
      const ctx = { sourceAttack: 0, sourceDefense: 0, sourceHp: 0, sourceSpeed: 0 };
      expect(evalValue(dmg.amount, ctx)).toBe(3);
    }
  });

  it('drains due entries for controller turn', () => {
    let q = createEchoQueue();
    q = enqueueEcho(
      q,
      {
        controllerIndex: 0,
        script: SAMPLE_SCRIPTS.arcane_insight,
        sourceInstanceId: 's1',
        resolveOnTurn: 3,
      },
      'e1'
    );
    const { due, queue } = drainEchoForTurn(q, 3, 0);
    expect(due).toHaveLength(1);
    expect(queue.entries).toHaveLength(0);
  });
});
