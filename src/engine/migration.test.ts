import { describe, it, expect } from 'vitest';
import { migrateToCurrent, currentSchemaVersion } from './migration';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

describe('migration', () => {
  it('fills missing rng and events on partial state', () => {
    const full = createGameState(
      'ai',
      'A',
      'Battlemage',
      generateDefaultDeck('Battlemage'),
      'B',
      'Warrior',
      generateDefaultDeck('Warrior'),
      1
    );
    const partial = structuredClone(full) as any;
    delete partial.rng;
    delete partial.events;
    const migrated = migrateToCurrent({ schemaVersion: 1, state: partial });
    expect(migrated.rng).toBeTruthy();
    expect(migrated.events).toEqual([]);
    expect(currentSchemaVersion()).toBeGreaterThan(0);
  });
});
