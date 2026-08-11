# Warded Ones TCG — Systems Layer

This document describes the canonical rules/engine contracts implemented under `src/engine` and `src/data`.

## Modules

| Module | Role |
|--------|------|
| `types.ts` | Domain types: cards, players, phases, game state |
| `rng.ts` | Seeded Mulberry32 PRNG (`GameState.rng`) |
| `keywords.ts` | Frozen keyword registry + Hex suppression |
| `damage.ts` | Unified Ward / Fortify / Pierce damage pipeline |
| `stateBasedActions.ts` | Death + win checks |
| `targeting.ts` | Legal targets, Taunt-aware attacks |
| `queries.ts` | Read-only board/zone lookups |
| `events.ts` | Structured event log |
| `simHarness.ts` | Scripted match runner for tests |
| `gameEngine.ts` | Phases, play, combat, abilities |
| `abilities.ts` | Ability definition table |
| `elements.ts` | Element strength matrix |
| `deckUtils.ts` | Deck size/composition validation |
| `ai.ts` | Seeded AI scoring |
| `data/cardCatalog.ts` | Catalog integrity validation |
| `data/card.schema.json` | JSON Schema for card definitions |

## Resolution order (v1)

1. Draw (hand cap 10 → mill; empty deck → scaling fatigue)
2. Resource (max +1 to 10, refill)
3. Main (play / attach / activate)
4. Combat (legal targets → damage pipeline → counter → deaths)
5. End (totems, status ticks, SBAs, switch player)

## Keywords (frozen)

See `KEYWORD_REGISTRY` in `keywords.ts`. Rules UI reads the same registry.

## Determinism

Pass `seed` to `createGameState`. All match randomness (shuffle, AI jitter, random effects) uses `state.rng`.

## Tests

```bash
npm test
npm run build
```
