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

**W0 addendum — independent range review (commit `d2fcfac`).** A fresh read-only reviewer returned
**ACCEPT** on the range `7811377..ca8978b` with decisive evidence: A/B lockstep differential
(baseline vs W0 in one process, 5 seeds, 240 accepted commands, saves, checkpoints, journals,
loads, rollovers, quotes, 7 error surfaces) — zero differences, `payloadBytes` byte-identical;
a deep-frozen GameState driven through a full movie (19 engine steps) with no mutation throw;
served-envelope vs memoized-fact object-identity intersection = 0 (234 vs 262 objects); and
mutation tests (memoization removed → 4/12 fail; intents-served-by-reference and lot-alias
mutants killed by the vandalism guard). One genuine finding — the founding-branch envelope
isolation was unguarded (a memoized-founding mutant survived) — fixed at `d2fcfac` with a
founding vandalism test that kills that mutant, plus leaf-deep vandalism (numbers/booleans),
a `payloadBytes` stability assertion, and a genuinely cross-derived intent-identity check.
Informational notes recorded: `metrics.serializationMs` is the one served field that changes
(timing, intended); per-state fact retention adds ~one save + three projections of RSS per live
session state (bounded by WeakMap ephemeron semantics — revisit before using the pattern on
harness corpora that hold many states).

## W1 — TypeScript Production truth + scenery correction — commits `fb3caa3` + `cc2d514`

**Change.** `src/core/sceneryLoadIn.ts` gains the single scenery legality classifier
(`sceneryLoadInDecision`: `none` / `in-transit` / `arrived-pending` / `manual-clear` /
`withheld`). Grandfather narrows to exact `false` (minted by the V14 migrator AND the legacy
`greenlight` path — both are real provenances); absent bindings → `no-bindings`, non-boolean flag
→ `malformed-provenance`, both withheld and never clickable. Consumers folded onto the one answer:
tick step 0.7 (next-boundary evaluation at `currentTick + 1`), `applyAssignShootingDirector`
(due-at-call settlement in the same transaction via the shared `arriveDueScenery` transition —
one `sceneryArrived` row, action-week stamp), `applyClearSceneryLoadIn` (grandfather-only, loud
exact-reason refusals), `nextProductionOperationsDecision` (command only for the grandfather),
`firstFilmJourney` (REHEARSAL copy corrected; honest transit/arrival waiting guidance),
`ui/src/engine/adapter.ts::managedProductionBoardCard` (four-way truth with paired sentences).

**Deliberate deviations, recorded.**
- The wire `beat` enum keeps `'load-in'` for Rehearsal until W2's governed schema transaction
  adds an exact `rehearsal` member — schema bytes may not change in W1 (contract check green:
  byte-identical schema/DTOs).
- Withheld-provenance productions publish no command and no settlement; W2's closed operational
  state 14 (`STATUS UNAVAILABLE`) owns the richer surface.
- The browser strict world selector (`ui/src/lot/snapshot/sceneryLoadIn.ts`) fails closed (no
  world affordance) for current transit; its no-command transit branch is W2 projection work per
  the recon's EXTEND list.

**Sibling-consumer sweep (charter law 10 / L-15).** Enumerated and dispositioned:
tick 0.7 (folded), assign action (folded), clear action (folded), decision selector (folded),
journey (folded), adapter card (folded), `studioWeekTheater` scenery subject (withholding path
unchanged — new classifications flow the same `withhold()` arm), browser strict selector
(fails closed; W2), browser `HollywoodScene` cosmetic director route (spawns only on a real
`unassigned → blocked` window, i.e. genuine transit; engine-driven test updated, synthetic
blocked fixtures retain route/sweep coverage), presence canon (unchanged; in-transit presence
pinned as work-not-waiting in the new suite).

**Focused evidence.**
- New: `tests/p05a-w1-scenery-truth.test.ts` — 19 tests (classifier five-way, Clear legality
  incl. forged and withheld, exactly-once settlement at the call and at the exact
  remaining-one boundary, tick-sink vs action-sink event chronology, save round-trip
  classification stability, in-transit presence). `ui/src/test/contracts/
  p05a-w1-scenery-alignment.contract.test.ts` — 4 pair tests (command AND sentence agree
  across board card, decision selector, and action legality for all four truths).
- Governed fixture updates across 24 existing files (commit `cc2d514`): every scripted
  assign→clear→schedule walk now follows the engine's own task status; T9 builds its
  scenery-blocked cell on the explicitly grandfathered arm; bridge journey pins move from three
  resolve commands to two and assert `scenery-load-in` never reaches a polled snapshot on the
  founding lot. No assertion was weakened: replaced pins assert the strictly newer law
  (settled-ready truth, refusal messages, exactly-once arrival rows).
- Full floor: **350 files / 4809 passed / 5 skipped / 0 failed**; `typecheck` and
  `typecheck:bridge` clean; `check:bridge-contract` and `check:bridge-contract:fixtures` PASS
  (wire bytes unchanged, as W1 requires).

**Truth freeze.** `sceneryLoadInDecision` and the settlement boundaries are frozen; W2 builds the
closed projection on top of them and may not re-derive scenery legality anywhere else.
