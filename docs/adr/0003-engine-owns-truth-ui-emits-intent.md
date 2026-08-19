# ADR-0003: Engine owns truth; UI renders truth and emits intent

- Status: Accepted (backfill — records the doctrine already ruled in DECISIONS.md)
- Date: 2026-08-19 (doctrine ruled during Operation Hollywood, 2026-08)
- Owners: repo owner (HSpector1)

## Context

Phase 5 added a browser UI, and the Hollywood/lot work added a rendered world. That
created a live risk: two places that could each claim to know the game state — the
engine, and whatever the renderer is animating. The marathon-era ruling in
`DECISIONS.md` settled it:

> Engine/GameState owns legality, results, clock, reservations, facilities, economy,
> and RNG. The world renders that truth and emits intent; renderer motion is never
> simulation authority.

The mechanism exists in code: the UI talks to the core only through an adapter
(`ui/src/engine/adapter.ts`); the core exports pure `applyActions`/`tick`.

## Decision

- The engine (`src/core/`) is the **single authority** for legality, outcomes, the
  clock, and RNG. The UI never computes an outcome, never advances time itself, and
  never holds derived state the engine could contradict.
- The UI's only write path is **emitting `Action`s** through the adapter; its only read
  path is the engine's state (and read-model projections computed from it).
- Rendered motion, interpolation, and presentation-level animation carry zero
  simulation meaning. One skipped-week engine batch exposes one final state; the UI
  must not fabricate "what happened in between" as if it were watched.
- Related product doctrine (recorded here for the record, decided by Owner ruling): the
  studio lot is the primary game surface; management panels support it.

## Options considered

1. **UI-side simulation for responsiveness** (optimistic outcomes, renderer-driven
   timers) — rejected: two authorities guarantee drift, and replay-exactness (ADR-0002)
   becomes unverifiable.
2. **Engine embedded in the UI layer** — rejected: kills the headless harness and the
   purity boundary.
3. **Adapter boundary, intent-only writes (chosen).**

## Consequences

- Every new screen costs an adapter surface, not just a component — that is the price
  of one authority.
- UI tests can run against the real engine deterministically (same seeds, same world).
- Any feature whose spec says "the world shows X happening" must first answer "where
  does the engine state X" — if the engine doesn't, the feature starts in the core.

## Revisit when

A real-time presentation need (e.g. continuous ambient animation with gameplay
consequences) can't be expressed as engine state + presentation-only motion. That
would need an explicit new tier, not a quiet exception.
