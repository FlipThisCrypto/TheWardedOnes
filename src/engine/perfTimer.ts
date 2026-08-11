/**
 * Lightweight performance marks for engine hotspots.
 */

export interface PerfMark {
  name: string;
  ms: number;
}

export class PerfTimer {
  private marks: PerfMark[] = [];

  time<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      this.marks.push({ name, ms: performance.now() - start });
    }
  }

  getMarks(): readonly PerfMark[] {
    return this.marks;
  }

  totalMs(): number {
    return this.marks.reduce((s, m) => s + m.ms, 0);
  }

  clear(): void {
    this.marks = [];
  }
}
