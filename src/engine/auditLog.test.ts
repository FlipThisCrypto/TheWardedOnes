import { describe, it, expect } from 'vitest';
import { AuditLog } from './auditLog';

describe('auditLog', () => {
  it('records and filters entries', () => {
    const log = new AuditLog();
    log.record('p1', 'CONCEDE');
    log.record('p2', 'PLAY_CARD', 'mage');
    expect(log.list()).toHaveLength(2);
    expect(log.filterByActor('p1')).toHaveLength(1);
  });
});
