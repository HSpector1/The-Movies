# ADR-0002: Pure, seed-deterministic simulation core

- Status: Accepted (backfill — records a decision already in force since M0A)
- Date: 2026-08-19 (decision original to build-contract rev. 4, 2026-07)
- Owners: repo owner (HSpector1)

## Context

The game is a studio-management sim whose central promise is a *reproducible world*:
the same seed must always produce the same talent pool, market, and outcomes, and a
save must replay exactly. The engine is also exercised by two consumers with different
needs — a statistical harness (`src/harness/`) that runs thousands of simulated weeks
headlessly, and a React UI (`ui/`) that renders one interactive studio.

## Decision

The simulation core (`src/core/`) is a pure state machine:

- `applyActions(state, actions) => state` and `tick(state) => state` are pure
  functions. No React, no DOM, no async, no I/O below the harness boundary
  (build-contract §"Two harnesses over one engine").
- **All randomness is seeded.** `Math.random()` is banned everywhere, including tests.
  The PRNG is sfc32 seeded via a splitmix32 finalizer (`src/core/rng.ts`), with two
  stream kinds:
  - a stateful `RngStream` serialized into `GameState.rngState`, and
  - stateless **derived streams** `stream(seed, purpose, key)` for `candidates`,
    `agent`, `forecast`, `worldgen`, `migrate`, `develop` — recomputable on demand, so
    they never need to be saved and replays stay exact (§15.7).
- Determinism is *seed-determinism, not variance-free* (§5.6): sampled variance is part
  of the model and must be exposed in the autopsy breakdown, never stripped to make
  outcomes "clean".
- Tunable constants live in `TUNING`; no inline magic numbers for contracted values.

## Options considered

1. **Ambient randomness + snapshot saves** — simpler to write, but replay-exactness and
   the harness's statistical reproducibility both die. Rejected by contract.
2. **Stateful streams for everything** — every stream would have to be serialized;
   derived streams avoid growing the save for per-entity randomness.
3. **Pure core with seeded/derived RNG (chosen).**

## Consequences

- The engine is trivially testable and the harness can grind thousands of runs
  reproducibly — this is what made the M0A tuning loop possible.
- Any PR introducing `Math.random`, `Date.now`, async, or DOM types below the harness
  boundary is wrong by definition; a lint rule or grep gate in CI would make this
  self-enforcing (none exists today).
- Adding a new randomness consumer means choosing: stateful (advances `rngState`,
  affects replay ordering) vs derived (needs a stable `purpose`+`key`). New derived
  purposes are additive and must be documented in `rng.ts` as `migrate`/`develop` were.

## Revisit when

A feature genuinely requires wall-clock time, external I/O, or non-reproducible input
inside the core — that is a boundary redesign, not an exception to sneak in.
