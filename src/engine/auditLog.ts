/**
 * Append-only audit trail for security-sensitive match actions.
 */

export interface AuditEntry {
  id: string;
  at: number;
  actor: string;
  action: string;
  detail?: string;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private seq = 0;

  record(actor: string, action: string, detail?: string): AuditEntry {
    this.seq += 1;
    const entry: AuditEntry = {
      id: `audit_${this.seq}`,
      at: Date.now(),
      actor,
      action,
      detail,
    };
    this.entries.push(entry);
    return entry;
  }

  list(): readonly AuditEntry[] {
    return this.entries;
  }

  filterByActor(actor: string): AuditEntry[] {
    return this.entries.filter(e => e.actor === actor);
  }

  clear(): void {
    this.entries = [];
  }
}
