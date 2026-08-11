/**
 * Optional match chess-clock (logic only; UI not required).
 */

export interface MatchClock {
  p0Ms: number;
  p1Ms: number;
  active: 0 | 1 | null;
  running: boolean;
  lastTick: number;
}

export function createMatchClock(initialMs = 300_000): MatchClock {
  return {
    p0Ms: initialMs,
    p1Ms: initialMs,
    active: 0,
    running: false,
    lastTick: Date.now(),
  };
}

export function startClock(clock: MatchClock, player: 0 | 1, now = Date.now()): MatchClock {
  return { ...clock, active: player, running: true, lastTick: now };
}

export function tickClock(clock: MatchClock, now = Date.now()): MatchClock {
  if (!clock.running || clock.active === null) return clock;
  const delta = Math.max(0, now - clock.lastTick);
  const next = { ...clock, lastTick: now };
  if (clock.active === 0) next.p0Ms = Math.max(0, clock.p0Ms - delta);
  else next.p1Ms = Math.max(0, clock.p1Ms - delta);
  return next;
}

export function switchClock(clock: MatchClock, player: 0 | 1, now = Date.now()): MatchClock {
  const ticked = tickClock(clock, now);
  return { ...ticked, active: player, lastTick: now };
}

export function isFlagged(clock: MatchClock): 0 | 1 | null {
  if (clock.p0Ms <= 0) return 0;
  if (clock.p1Ms <= 0) return 1;
  return null;
}
