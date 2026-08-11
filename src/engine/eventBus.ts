/**
 * Typed in-process event bus for engine modules (decoupled subscribers).
 */

export type BusHandler<T> = (payload: T) => void;

export class EventBus<Events extends Record<string, unknown>> {
  private handlers = new Map<keyof Events, Set<BusHandler<any>>>();

  on<K extends keyof Events>(event: K, handler: BusHandler<Events[K]>): () => void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    return () => this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    Array.from(set).forEach(h => h(payload));
  }

  clear(): void {
    this.handlers.clear();
  }
}

export type EngineBusEvents = {
  phase_changed: { from: string; to: string };
  action_applied: { type: string; ok: boolean };
  invariant_failed: { code: string };
};
