/**
 * Higher-level match factory with validated decks and config.
 */

import type { CardClass, GameMode } from './types';
import { validateDeck } from './deckUtils';
import { createMatchSession, type MatchSession } from './matchSession';
import { mergeMatchConfig, validateMatchConfig, type MatchConfig } from './matchConfig';

export interface CreateMatchRequest {
  mode: GameMode;
  p1Class: CardClass;
  p2Class: CardClass;
  p1Deck: string[];
  p2Deck: string[];
  seed?: number;
  config?: Partial<MatchConfig>;
}

export type CreateMatchResult =
  | { ok: true; session: MatchSession }
  | { ok: false; errors: string[] };

export function createValidatedMatch(req: CreateMatchRequest): CreateMatchResult {
  const errors: string[] = [];
  const v1 = validateDeck(req.p1Deck);
  const v2 = validateDeck(req.p2Deck);
  if (!v1.valid) errors.push(...v1.errors.map(e => `P1: ${e}`));
  if (!v2.valid) errors.push(...v2.errors.map(e => `P2: ${e}`));
  const cfg = mergeMatchConfig(req.config ?? {});
  errors.push(...validateMatchConfig(cfg));
  if (errors.length) return { ok: false, errors };
  const session = createMatchSession({
    mode: req.mode,
    p1Class: req.p1Class,
    p2Class: req.p2Class,
    p1Deck: req.p1Deck,
    p2Deck: req.p2Deck,
    seed: req.seed,
    config: cfg,
  });
  return { ok: true, session };
}
