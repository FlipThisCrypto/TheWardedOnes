/**
 * Action idempotency keys — prevent double-submit of the same command.
 */

export interface IdempotencyRecord {
  key: string;
  resultHash: string;
  at: number;
}

export class IdempotencyGuard {
  private seen = new Map<string, IdempotencyRecord>();
  constructor(private maxEntries = 256) {}

  /** Returns previous resultHash if key already used. */
  check(key: string): IdempotencyRecord | null {
    return this.seen.get(key) ?? null;
  }

  remember(key: string, resultHash: string): void {
    if (this.seen.size >= this.maxEntries) {
      const first = this.seen.keys().next().value;
      if (first !== undefined) this.seen.delete(first);
    }
    this.seen.set(key, { key, resultHash, at: Date.now() });
  }

  clear(): void {
    this.seen.clear();
  }

  size(): number {
    return this.seen.size;
  }
}

export function hashActionPayload(payload: unknown): string {
  // Simple deterministic string hash (not crypto)
  const s = JSON.stringify(payload);
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}
