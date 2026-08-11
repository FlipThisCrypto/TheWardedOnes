import { describe, it, expect } from 'vitest';
import { safeJsonParse, safeJsonStringify } from './safeJson';

describe('safeJson', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('{nope', { ok: false })).toEqual({ ok: false });
  });

  it('stringifies objects', () => {
    expect(safeJsonStringify({ x: 2 })).toBe('{"x":2}');
  });
});
