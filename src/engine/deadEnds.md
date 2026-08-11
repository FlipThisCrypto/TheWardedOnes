# Dead Ends (Round 2 Logic Loop)

## Approaches rejected

1. **Full MtG-style layer system for continuous effects** — too heavy for current card set; used simple layered targeted modifiers instead (`continuousEffects.ts`).
2. **Coupling UI gameStore directly to every engine helper** — increases dual paths; introduced `matchSession` + `actions` reducer as the intended single write path; store migration deferred (still calls legacy phase helpers).
3. **Instant responses on stack** — priority module exists but `allowResponses: false` in match config; enabling requires UI pass buttons and network authority.
4. **Migrating all abilities off `special` strings in one step** — high risk; IR + interpreter landed with samples only; legacy `abilities.ts` remains authoritative for play path.
5. **Crypto-grade hashing for idempotency** — unnecessary client-side; used FNV-like string hash.

## Workarounds

- `getAllBattlefieldCards` imported from both `queries` and re-exported via `gameEngine` — dual import paths retained for compatibility.
- Effect interpreter re-binds source by instanceId after `structuredClone` when possible; falls back to original reference if unit left play.
