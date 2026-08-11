/**
 * In-memory undo stack of GameState snapshots (single-player convenience).
 */

import type { GameState } from './types';

export class UndoStack {
  private past: GameState[] = [];
  private future: GameState[] = [];
  constructor(private limit = 30) {}

  push(state: GameState): void {
    this.past.push(structuredClone(state));
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  undo(current: GameState): GameState | null {
    const prev = this.past.pop();
    if (!prev) return null;
    this.future.push(structuredClone(current));
    return prev;
  }

  redo(current: GameState): GameState | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(structuredClone(current));
    return next;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }
}
