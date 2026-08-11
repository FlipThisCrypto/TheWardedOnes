# The Warded Ones TCG

Dark fantasy trading card game — web client + rules engine.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server |
| `npm test` | Vitest unit/integration tests |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Architecture

See [docs/SYSTEMS.md](./docs/SYSTEMS.md) for the systems layer (schema, keywords, damage pipeline, simulation harness).

- **Engine**: `src/engine/*` — pure rules, deterministic RNG, SBAs
- **Data**: `src/data/cards.ts` + catalog validation
- **UI**: `src/app/*`, `src/components/*`

## Contributing notes

- Prefer data-driven abilities/keywords over ad-hoc switches.
- Add a Vitest case when changing combat, targeting, or deck validation.
- Card definitions must pass `validateCardCatalog()`.
