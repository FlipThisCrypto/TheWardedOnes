import { describe, it, expect } from 'vitest';
import { UndoStack } from './undoStack';
import { createGameState } from './gameEngine';
import { generateDefaultDeck } from './deckUtils';

describe('undoStack', () => {
  it('undoes to previous snapshot', () => {
    const stack = new UndoStack();
    const a = createGameState(
      'ai', 'A', 'Battlemage', generateDefaultDeck('Battlemage'),
      'B', 'Warrior', generateDefaultDeck('Warrior'), 1
    );
    const b = structuredClone(a);
    b.turn = 2;
    stack.push(a);
    const undone = stack.undo(b);
    expect(undone?.turn).toBe(1);
    expect(stack.canRedo()).toBe(true);
    const redone = stack.redo(undone!);
    expect(redone?.turn).toBe(2);
  });
});
