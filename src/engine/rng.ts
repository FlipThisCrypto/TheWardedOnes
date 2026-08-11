/**
 * Seeded PRNG for deterministic match simulation and tests.
 * Mulberry32 — small, fast, good enough for game-logic randomness.
 */

export interface RngState {
  seed: number;
  state: number;
}

export function createRng(seed: number = Date.now() >>> 0): RngState {
  const s = seed >>> 0;
  return { seed: s, state: s || 1 };
}

/** Clone RNG so branches can fork without sharing mutation. */
export function cloneRng(rng: RngState): RngState {
  return { seed: rng.seed, state: rng.state };
}

/** Next float in [0, 1). Advances state. */
export function nextFloat(rng: RngState): number {
  let t = (rng.state += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Integer in [0, max) */
export function nextInt(rng: RngState, max: number): number {
  if (max <= 0) return 0;
  return Math.floor(nextFloat(rng) * max);
}

/** Inclusive range [min, max] */
export function nextIntInclusive(rng: RngState, min: number, max: number): number {
  if (max < min) return min;
  return min + nextInt(rng, max - min + 1);
}

/** Pick random element; returns undefined if empty. */
export function pickRandom<T>(rng: RngState, items: readonly T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[nextInt(rng, items.length)];
}

/** Fisher–Yates shuffle using seeded RNG (mutates copy). */
export function shuffleWithRng<T>(rng: RngState, arr: readonly T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
