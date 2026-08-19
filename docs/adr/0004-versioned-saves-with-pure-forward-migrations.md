# ADR-0004: Versioned save files with pure, forward-only migrations

- Status: Accepted (backfill — records the scheme in force since D-9; writer at V13)
- Date: 2026-08-19
- Owners: repo owner (HSpector1)

## Context

Saves are exported/imported as JSON (the entry screen's "Continue from a save"), and
the world model has changed shape repeatedly — the writer is at `SaveFileV13` while
imports still accept V1. The scheme that evolved (documented in `src/core/save.ts`
headers and the D-9 owner ruling) has held up and should be recorded as policy.

## Decision

- Every save carries an integer `saveVersion`. The writer always emits the newest
  version; import accepts **every prior version** back to V1.
- Old version schemas are **frozen types** — `SaveFileV1` describes the pre-D-9 world
  forever; new fields never leak into old types.
- Migration is a chain of **pure functions** V(n) → V(n+1) that never mutate their
  input. Where a migration must invent data (e.g. D-9.15 talent conversion), it draws
  from the derived RNG stream `migrate` keyed by stable entity ids — so migrating the
  same old save twice yields identical results (ADR-0002).
- The save is the *replayable* state: stateful `rngState` is stored; derived streams
  are not (recomputable from seed + purpose + key).

## Options considered

1. **Best-effort parsing with defaults** — silently fills gaps; two players migrating
   the same save could diverge. Rejected.
2. **Drop old-save support at each release** — acceptable for a private prototype, but
   the project treats long-running studios as the core artifact; losing them voids
   playtests. Rejected.
3. **Frozen versions + pure seeded migration chain (chosen).**

## Consequences

- Cost: 13 versions of frozen types and 12 migration steps live in `src/core/save.ts`,
  which has grown to ~190 KB — the largest file in the repo. The scheme is right; the
  *packaging* needs ADR-0007 (one module per version/migration).
- Every schema change is forced to be explicit: add V(n+1), write the migration, test
  the round-trip. A vitest that imports a fixture of each historical version and
  asserts a stable digest would make regressions impossible to miss.
- `DECISIONS.md` briefly claimed the writer was V11 when V13 had shipped — with this
  ADR, the authoritative statement is "writer = newest version in `save.ts`", and no
  doc should restate the number.

## Revisit when

Migration chain length makes import cost or maintenance real (e.g. >25 versions), at
which point a consolidation release (re-freeze at V(n), keep a legacy importer) is the
likely move.
