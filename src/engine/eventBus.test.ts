import { describe, it, expect } from 'vitest';
import { EventBus, type EngineBusEvents } from './eventBus';

describe('eventBus', () => {
  it('delivers events to subscribers', () => {
    const bus = new EventBus<EngineBusEvents>();
    const seen: string[] = [];
    const off = bus.on('phase_changed', p => seen.push(`${p.from}->${p.to}`));
    bus.emit('phase_changed', { from: 'main', to: 'combat' });
    expect(seen).toEqual(['main->combat']);
    off();
    bus.emit('phase_changed', { from: 'combat', to: 'end' });
    expect(seen).toHaveLength(1);
  });
});
