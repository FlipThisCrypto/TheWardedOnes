/**
 * Schema / save version negotiation for forward compatibility.
 */

export const ENGINE_SCHEMA_VERSION = 2;

export interface VersionedEnvelope<T> {
  schemaVersion: number;
  payload: T;
}

export function wrapVersioned<T>(payload: T, version = ENGINE_SCHEMA_VERSION): VersionedEnvelope<T> {
  return { schemaVersion: version, payload };
}

export function unwrapVersioned<T>(
  data: VersionedEnvelope<T>,
  supported: number[] = [ENGINE_SCHEMA_VERSION, 1]
): { ok: true; payload: T; version: number } | { ok: false; error: string } {
  if (!data || typeof data.schemaVersion !== 'number') {
    return { ok: false, error: 'Missing schemaVersion' };
  }
  if (!supported.includes(data.schemaVersion)) {
    return { ok: false, error: `Unsupported schemaVersion ${data.schemaVersion}` };
  }
  return { ok: true, payload: data.payload, version: data.schemaVersion };
}
