# The Warded Ones TCG

Dark fantasy trading card game — web client + rules engine.

## Play online

**GitHub Pages:** [https://flipthiscrypto.github.io/TheWardedOnes/](https://flipthiscrypto.github.io/TheWardedOnes/)

(Deployed automatically from `main` via GitHub Actions.)

## Quick start (local)

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
| `npm run build` | Static export build |
| `npm run build:pages` | Static export with GitHub Pages base path |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Architecture

See [docs/SYSTEMS.md](./docs/SYSTEMS.md) for the systems layer (schema, keywords, damage pipeline, simulation harness).

- **Engine**: `src/engine/*` — pure rules, deterministic RNG, SBAs
- **Data**: `src/data/cards.ts` + catalog validation
- **UI**: `src/app/*`, `src/components/*`

## Contributing notes

- Prefer data-driven abilities/keywords over ad-hoc switches.
- Add a Vitest case when changing combat, targeting, or deck validation.
- Card definitions must pass `validateCardCatalog()`.
