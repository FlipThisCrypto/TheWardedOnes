/**
 * Decision traces for AI / planner explainability.
 */

export interface DecisionStep {
  step: number;
  actionType: string;
  score: number;
  note?: string;
}

export class DecisionTrace {
  private steps: DecisionStep[] = [];

  add(actionType: string, score: number, note?: string): void {
    this.steps.push({ step: this.steps.length + 1, actionType, score, note });
  }

  list(): readonly DecisionStep[] {
    return this.steps;
  }

  summary(): string {
    return this.steps.map(s => `${s.step}:${s.actionType}(${s.score.toFixed(2)})`).join(' | ');
  }

  clear(): void {
    this.steps = [];
  }
}
