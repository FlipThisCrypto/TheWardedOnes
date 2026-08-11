/**
 * Failure injection hooks for resilience testing (logic layer only).
 */

export type FailureMode =
  | 'none'
  | 'reject_all_actions'
  | 'corrupt_rng'
  | 'force_sba_loop';

export interface FailureInjector {
  mode: FailureMode;
  trips: number;
}

export function createInjector(mode: FailureMode = 'none'): FailureInjector {
  return { mode, trips: 0 };
}

export function shouldRejectAction(inj: FailureInjector): boolean {
  if (inj.mode === 'reject_all_actions') {
    inj.trips += 1;
    return true;
  }
  return false;
}

export function maybeCorruptRng(inj: FailureInjector, state: number): number {
  if (inj.mode === 'corrupt_rng') {
    inj.trips += 1;
    return state ^ 0xdeadbeef;
  }
  return state;
}
