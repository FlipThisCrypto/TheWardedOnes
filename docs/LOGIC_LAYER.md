# Logic Layer Architecture (Round 2)

## Control plane

| Module | Role |
|--------|------|
| `turnMachine.ts` | Phase transitions + action legality gates |
| `actions.ts` | Closed `PlayerAction` reducer |
| `matchSession.ts` | Session façade (stack, priority, idempotency, metrics) |
| `legalMoves.ts` | Enumerate legal actions |
| `priority.ts` | Priority / pass foundation |
| `stack.ts` | LIFO effect resolution |

## Effects

| Module | Role |
|--------|------|
| `effectIr.ts` | Effect instruction types + value exprs |
| `effectInterpreter.ts` | Apply IR to `GameState` |
| `triggers.ts` | Trigger registry |
| `echoQueue.ts` | Echo delayed half-strength scripts |
| `replacementEffects.ts` | Event replacement pipeline |
| `continuousEffects.ts` | Stat layering |
| `costPayment.ts` | Transactional costs |

## Intelligence / ops

| Module | Role |
|--------|------|
| `aiPolicy.ts` | Rules-driven AI over legal moves |
| `combatPlanner.ts` | Attack line scoring |
| `mulliganStrategy.ts` | Mulligan advice |
| `matchObservability.ts` | Metrics snapshot |
| `replay.ts` | Action tape replay |
| `serialization.ts` | Save/resume |
| `assertInvariants.ts` | Integrity checks |
| `healthCheck.ts` | Boot health |
| `auditLog.ts` / `rateLimit.ts` / `idempotency.ts` | Safety |

UI should prefer `matchSession` + `applyPlayerAction` over calling `gameEngine` phase helpers directly.
