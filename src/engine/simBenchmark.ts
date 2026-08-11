/**
 * Simple simulation benchmark for engine throughput (logic-only).
 */

import { createMatchSession, sessionDispatch } from './matchSession';
import { generateDefaultDeck } from './deckUtils';
import { runPolicyTurn } from './aiPolicy';
import { PerfTimer } from './perfTimer';

export interface BenchmarkResult {
  matches: number;
  totalMs: number;
  avgMsPerMatch: number;
  marks: { name: string; ms: number }[];
}

export function runMatchBenchmark(matches = 10, seedBase = 1000): BenchmarkResult {
  const timer = new PerfTimer();
  timer.time('benchmark', () => {
    for (let i = 0; i < matches; i++) {
      let s = createMatchSession({
        mode: 'ai',
        p1Class: 'Battlemage',
        p2Class: 'Warrior',
        p1Deck: generateDefaultDeck('Battlemage'),
        p2Deck: generateDefaultDeck('Warrior'),
        seed: seedBase + i,
      });
      s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
      s = sessionDispatch(s, { type: 'MULLIGAN', cardIndices: [] });
      let state = s.state;
      for (let t = 0; t < 4; t++) {
        state = runPolicyTurn(state, 'balanced', 6);
      }
    }
  });
  const totalMs = timer.totalMs();
  return {
    matches,
    totalMs,
    avgMsPerMatch: totalMs / matches,
    marks: [...timer.getMarks()],
  };
}
