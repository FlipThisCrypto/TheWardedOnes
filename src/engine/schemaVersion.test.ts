import { describe, it, expect } from 'vitest';
import { wrapVersioned, unwrapVersioned, ENGINE_SCHEMA_VERSION } from './schemaVersion';

describe('schemaVersion', () => {
  it('wraps and unwraps current version', () => {
    const env = wrapVersioned({ a: 1 });
    expect(env.schemaVersion).toBe(ENGINE_SCHEMA_VERSION);
    const r = unwrapVersioned(env);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.payload).toEqual({ a: 1 });
  });

  it('rejects unknown versions', () => {
    const r = unwrapVersioned({ schemaVersion: 99, payload: {} });
    expect(r.ok).toBe(false);
  });
});
