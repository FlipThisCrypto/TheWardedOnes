import { describe, it, expect } from 'vitest';
import {
  createReplayTape,
  appendAction,
  playTape,
  serializeTape,
  deserializeTape,
} from './replay';
import { generateDefaultDeck } from './deckUtils';

describe('replay', () => {
  it('replays mulligan and end turn deterministically', () => {
    const d1 = generateDefaultDeck('Battlemage');
    const d2 = generateDefaultDeck('Warrior');
    let tape = createReplayTape({
      version: 1,
      seed: 99,
      mode: 'ai',
      p1Name: 'A',
      p1Class: 'Battlemage',
      p1Deck: d1,
      p2Name: 'B',
      p2Class: 'Warrior',
      p2Deck: d2,
    });
    tape = appendAction(tape, { type: 'MULLIGAN', cardIndices: [] });
    tape = appendAction(tape, { type: 'MULLIGAN', cardIndices: [] });
    tape = appendAction(tape, { type: 'END_TURN' });

    const a = playTape(tape);
    const b = playTape(deserializeTape(serializeTape(tape))!);
    expect(a.failures).toHaveLength(0);
    expect(a.state.currentPlayer).toBe(b.state.currentPlayer);
    expect(a.state.phase).toBe(b.state.phase);
    expect(a.state.players[0].hand.map(c => c.definitionId)).toEqual(
      b.state.players[0].hand.map(c => c.definitionId)
    );
  });
});
