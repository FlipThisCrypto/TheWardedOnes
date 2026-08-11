/**
 * Safe JSON parse helpers — never throw to callers.
 */

export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeJsonStringify(value: unknown, fallback = 'null'): string {
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
}
