# ADR-0011: Security baseline for a client-only game

- Status: Proposed
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

The game runs entirely in the player's browser: runtime dependencies are exactly
`react` + `react-dom`, there is no server, no auth, no telemetry, and no
`localStorage`. Audited 2026-08-19: the only untrusted input is pasted save JSON,
which already flows through strict validation (`importSave` → `validateSave`, loud
rejection, fixed-key rebuilds — no prototype-pollution path); the app contains no
`eval`/`dangerouslySetInnerHTML`/`innerHTML` sinks outside one test fixture; and
`npm audit` showed 6 advisories (1 critical) — all in dev tooling, most resolved by a
plain `npm audit fix` with 591/591 tests still green, leaving one moderate advisory
nested inside vitest's bundled esbuild.

The risk profile is therefore *not* the usual web-app one. What can actually go wrong:
a supply-chain compromise rides a dev/build dependency into the bundle; a future
feature quietly widens the input surface (URL params, fetch, storage); a secret lands
in the repo via a session's evidence dump; or the dev server gets exposed beyond
localhost (the esbuild advisory class).

## Decision

1. **Keep the surface this small on purpose.** New network I/O, storage, URL-derived
   state, or dynamic code loading requires an ADR first — the absence of these is the
   game's main security property, so changing it is an architecture decision.
2. **All untrusted input crosses one validated boundary.** Anything player-supplied
   enters through the save/import path's validate-then-rebuild pattern (ADR-0004);
   nothing untrusted is merged into live objects or rendered as markup.
3. **Supply chain**: Dependabot weekly for npm + GitHub Actions; CI fails on
   high/critical advisories in *runtime* deps (`npm audit --omit=dev`); dev-tooling
   advisories are handled by Dependabot PRs, not CI failure. CI workflow permissions
   are `contents: read`; no repo secrets exist or get added.
4. **Repo hygiene as security**: CI forbids `Math.random` below the harness boundary
   (determinism is also an integrity property — a save must not be forgeable into
   impossible states by replay divergence) and forbids files >2 MB (ADR-0006 —
   evidence dumps are where stray secrets would hide).
5. **Dev server stays local**: no `--host` on untrusted networks; documented in
   SECURITY.md.

## Options considered

1. **Full web-app hardening** (CSP headers, SRI, sandboxing) — most of it has no
   server to attach to; adopt CSP at the point a hosted build actually exists.
2. **Ignore security entirely** ("it's a local game") — rejected: the two real vectors
   (supply chain, input surface creep) exist today and are cheap to gate now.
3. **Minimal baseline matched to the actual threat model (chosen).**

## Consequences

- SECURITY.md, `.github/dependabot.yml`, and `.github/workflows/ci.yml` land with this
  ADR; the CI gates double as the enforcement for ADR-0002 and ADR-0006.
- A future "share your studio online" feature triggers rule 1 and gets a real threat
  model before code, instead of after.

## Revisit when

The game gains any server component, hosted deployment, or player-to-player data
exchange — that obsoletes this baseline and requires a successor ADR.
