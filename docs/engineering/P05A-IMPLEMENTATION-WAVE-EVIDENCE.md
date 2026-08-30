# P05A Implementation — Running Wave Evidence

Charter: `docs/engineering/CODEX-P05A-IMPLEMENTATION-CHARTER.md@b1d506d`. One section per wave,
appended at wave exit. Exact commits, test results, and measurements only; no provisional claims.

## ENTRY — sealed

Record: `docs/engineering/P05A-IMPLEMENTATION-ENTRY-RECORD.md` @ `4dcbf00`. Starting pair
TS `7811377` / Unity `29aea89` verified local==remote, clean; WIP branches pushed before any edit.

## W0 — shared snapshot-build context (CF-07 folding) — commit `ca8978b`

**Change.** New `bridge/snapshot-build-context.ts`: one lazily-computed fact context per
authoritative `GameState` object (canonical save JSON, digest, lot selector, development/casting
projections), WeakMap-keyed. `bridge/session.ts` consumers folded onto it: `snapshotFor`,
`resolveAvailableIntents`, `save`, `fromSaveJson`, `exportRuntimeCheckpoint`, `rolloverRuntime`,
`prepareEntry`, rejection digests, `playNextMovieThroughAvailableIntents`.

**Sharing/alias law.** Facts either stay read-only (strings; `firstFilmJourney` read) or are
deep-copied before serving (`projectStudioProjectionBundle` builds fresh objects — verified in
`bridge/schema/runtime.ts::project`, which constructs new records/arrays at every level). Founding
projections and resolved intents are served by reference in envelopes, so they are deliberately
NOT memoized. Invalidation is state-object identity; the pure sim core replaces the state object
on every accepted command/load/rollover.

**Semantic preservation.** Digest law, revision law, command legality, save law, error surface
unchanged: identical pure functions, identical call order, throws never memoized, schema bytes
untouched (contract + fixture checks green).

**Focused evidence.**

- New tests: `tests/bridge-snapshot-build-context.test.ts` — 12/12. Families: fact equivalence
  vs direct calls; once-per-state compute counters across repeated polls (managed and founding
  states); successor-state exactly-once recomputation after an accepted command; save-route fold
  (0 extra exports after warm-up); envelope vandalism isolation (deep-mutating a served envelope
  leaves the next poll byte-identical and command legality intact); cross-session determinism;
  load restoration digest equality.
- Bridge floor: `npm run test:bridge` — contract check PASS, fixture check PASS, 282/282 tests
  across 18 files. `typecheck:bridge` clean.
- Measured (managed state, 50 warm polls, same machine, vite-node):
  - baseline `7811377`: cold first snapshot 32.486 ms; warm poll mean 12.845 ms / median 12.632 / p95 14.25.
  - W0 `ca8978b`: cold 24.946 ms; warm poll mean 2.637 ms / median 2.584 / p95 3.513.
  - Warm-poll duplication removed: −79% mean. Remaining warm cost is the per-call bundle
    projection walk + envelope assembly, kept per-call deliberately for alias isolation.

**Interface freeze.** `SnapshotBuildContext` (`state`, `saveJson()`, `stateDigest()`,
`lotSnapshot()`, `development()`, `casting()`) and `snapshotBuildContextFor(state)` are frozen for
downstream waves. W2's session hookup may consume, not reshape, this interface.
