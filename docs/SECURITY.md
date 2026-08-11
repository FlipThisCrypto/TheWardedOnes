# Security notes

## Client-side app

This project is a browser TCG client. There is no privileged server API in-repo.

## Hardening applied

- `poweredByHeader: false` and security headers in `next.config.mjs`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - restrictive `Permissions-Policy`
- Deck persistence validates deck lists before write
- JSON import paths use safe parse fallbacks
- No `dangerouslySetInnerHTML` in engine/UI paths
- No secrets in source; env not required for local play

## Remaining risks

- AI and match state live client-side — treat online multiplayer as untrusted until a server authority exists
- localStorage can be modified by the user (expected for single-player)

## Reporting

Prefer private reports to the repository owner for security issues.
