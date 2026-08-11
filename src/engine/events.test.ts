import { describe, it, expect } from 'vitest';
import { createGameEvent, resetEventCounter } from './events';
import { createGameState, addLog, executeDrawPhase } from './gameEngine';
import { ALL_CARDS } from '../data/cards';

describe('structured events', () => {
  it('createGameEvent assigns unique ids', () => {
    resetEventCounter();
    const a = createGameEvent({
      type: 'message',
      turn: 1,
      player: 0,
      phase: 'main',
      message: 'a',
    });
    const b = createGameEvent({
      type: 'message',
      turn: 1,
      player: 0,
      phase: 'main',
      message: 'b',
    });
    expect(a.id).not.toBe(b.id);
  });

  it('addLog appends both log and events arrays', () => {
    const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
    const deck = [mage.id, ...ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id)];
    const state = createGameState('ai', 'A', 'Battlemage', deck, 'B', 'Warrior', deck, 1);
    expect(state.events).toEqual([]);
    addLog(state, 'test message', 'status');
    expect(state.log).toHaveLength(1);
    expect(state.events).toHaveLength(1);
    expect(state.events[0].type).toBe('status');
    expect(state.events[0].message).toBe('test message');
  });

  it('draw phase records structured events via addLog', () => {
    const mage = ALL_CARDS.find(c => c.type === 'Mage')!;
    const deck = [mage.id, ...ALL_CARDS.filter(c => c.type === 'Fighter').slice(0, 11).map(c => c.id)];
    let state = createGameState('ai', 'A', 'Battlemage', deck, 'B', 'Warrior', deck, 2);
    state.phase = 'draw';
    state = executeDrawPhase(state);
    expect(state.events.length).toBeGreaterThan(0);
    expect(state.log.length).toBe(state.events.length);
  });
});
