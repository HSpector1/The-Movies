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
- New: `tests/p05a-w1-scenery-truth.test.ts` — 15 tests at the seal, 21 after the review
  correction wave (classifier five-way, Clear legality incl. forged and withheld,
  exactly-once settlement at the call and at the exact remaining-one boundary, tick-sink vs
  action-sink event chronology, save round-trip classification stability, in-transit
  presence, journey transit/arrival/grandfather guidance, theater arrival weeks).
  `ui/src/test/contracts/p05a-w1-scenery-alignment.contract.test.ts` — 4 pair tests at the
  seal, 8 after the correction wave (command AND sentence agreement across board card,
  decision selector, action legality, lot attention, and the studio calendar for all four
  truths).
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

### W1 correction wave — independent range review findings (REJECT → remedied)

A fresh read-only reviewer REJECTED the W1 range with nine findings; every one was accepted
and fixed at root in the owning wave:

- **F1 (HIGH)** `adapter.ts::operationsAttention` re-derived decision-hood from
  `blocker !== null` and painted `DECISION REQUIRED` over no-decision transit states. Fixed:
  `decision-required` iff the card carries a command; a blocker without a command is
  `warning` (waiting information). Pair-tested for all four scenery truths.
- **F2 (MED-HIGH)** `src/core/studioCalendar.ts` classified the scenery blocker independently
  (`decision-required` + retired copy). Folded onto `sceneryLoadInDecision` with the four
  closed outcomes; pair-tested.
- **F3 (MED)** the next-boundary law made the Week Theater's arrival beats unreachable.
  Fixed: a bounded arrival subject is read off the engine's own `sceneryArrived` row,
  gated by the settlement's direct product (a take still `ready`). Window: exactly one
  week for a tick-settled arrival; a bounded TWO weeks for an action-settled arrival whose
  take stays unscheduled (final-disposition residual R1, accepted and recorded — the two
  sink stamps are indistinguishable from state one week on; cosmetic, deterministic,
  Class A). Scheduling the take ends the cue immediately; tested for both settlement
  paths including the unscheduled-advance replay bound.
- **F4 (MED)** the founding-lot journey walk kept a dead clear-branch; the grandfathered
  `LOAD-IN BLOCKED` journey (reserved-facility naming law) had lost all coverage. Fixed:
  dead branch is now a loud settlement-regression trap; a dedicated grandfathered-journey
  test pins the exact label, beat, headline, and site.
- **F5 (MED)** the new journey transit guidance had zero coverage. Fixed: transit and
  arrived-pending journey tests pin copy, `untilWeek`, and the advance-week path.
- **F6 (LOW-MED, recorded)** withheld provenance is a permanent absorbing state (no clear,
  no settlement). Unreachable from valid saves (the save boundary rejects non-boolean
  provenance; founding bodies are authored; placement ids are unique) — fail-closed by
  design, and now recorded as such: a withheld picture can never finish.
- **F7 (LOW)** the in-code grandfather comment claimed the migrator is the only `false`
  producer; corrected — the live engine lawfully mints `false` for a no-set-demand world
  (`deriveBindings`: `state.nextSetId > 0`).
- **F8 (LOW)** this document's W1 test count was wrong (19 ≠ 15+4 double-count); corrected
  above.
- **F9 (LOW)** seven walk fixtures became silently permissive; each now throws loudly if a
  just-assigned founding-lot take is still blocked (due-at-call settlement regression trap).

Also recorded from the review's clean list: the tick-settled arrival stamp is one week
before the derived due week (evaluation moved to `currentTick+1`, the stamp stays
`currentTick` per the accepted chronology law); nothing joins the two today.

**W1 final disposition: ACCEPT** (same reviewer, against exact commit `3a67885`, all floors
re-run on the archived commit tree; three remedies mutation-verified — reverting each kills
3/3/2 tests). Two low residuals closed at `1de6d76`: the action-settled arrival cue's honest
two-week bound (stated in code + evidence, pinned by an unscheduled-advance walk) and exact
test counts.

## W2 — closed Production projection + generated bridge — commits `93895b7` (TS) + `6aacb79` (Unity)

**The closed row (recon §5.3/§5.4).** `ProductionOperationsState` gains the fourteen closed
operational states with TS-authored state/milestone copy, state-appropriate weeks, the
worksite model (`worksiteResolution` exact|none|withheld; owned/primary/related/locate
targets carrying exact world bodies, with Locate withheld on any ambiguous join), live
Stage facility/world/Set identity proven by reservation+binding agreement (historical Sets
never populate the current Set; explicit grandfather keeps lawful null), full blocker
anatomy (effect→cause→consequence→holders→projected timing→remedy ROUTES, composed verbatim
from `studioQueueView`; queued-intent cancellation deliberately not routed — queue authority
owns it), and Wrap receipts beside — never instead of — current occupancy. One bounded
composition module `ui/src/engine/productionOperationsProjection.ts` owns the derivation;
the adapter merges and sorts managed rows ascending by exact productionId unconditionally.
Legacy rows carry honest `status-unavailable` defaults so the wire can REQUIRE every field.

**The Stage-local collection (recon §5.5).** One row per soundstage keyed by exact
`facilityId`: exact current holder (a same-week handoff paints the NEW holder with the
receipt beside — proven on the release-law walk), closed presentation state, holder copy,
exact-ID theater-subject and presence joins (owner AND facility must both match), the
structured load-in logistics cue, duplicate-holder withholding that corrupts no other row.

**All-active intents (recon §6.2).** `bridge/session.ts` publishes one digest-bound
`resolveProductionBlocker` intent per deciding production, ascending; `selectJourneyIntent`
selects the guided picture's from the same family. Proven: simultaneous two-production
decisions, non-guided dispatch isolation, settle-and-drop, journey agreement.

**Projection v12 generation transaction.** Wire additions: closed row fields (REQUIRED —
absence fails closed at the bridge boundary), seven new definitions
(`StudioProductionTargetSnapshot`, `StudioBlockerHolderSnapshot`,
`StudioProductionRemedyRouteSnapshot`, `StudioProductionBlockerAnatomySnapshot`,
`StudioWrapReceiptSnapshot`, `StudioStageLogisticsCueSnapshot`,
`StudioStageProductionSnapshot` — all registered in the definitions map),
`stageProductions` on the snapshot + productions projection, and the exact `'rehearsal'`
journey beat (closing the W1 deferral: `PHASE_BEAT.rehearsal` now says what the phase is,
core + browser mirror + strict next-event boundary widened in lockstep). Versions: schema
`sha256:a481d14f3810ffbafcba2bbf509db7340263f3f0fd665a059507a1567d98923d`, projection **12**,
protocol 4 unchanged, save 15 unchanged (no saved byte changed). Regenerated ONLY through
the canonical commands; generated C# SHA-256
`4c6ea8adf58fd90f726a07bed28f78cb99e6690767c93eb2285034ec408cdbae`; union fixtures
regenerated byte-identical (no quote/command union changed). The outgoing v11 identity is
appended to `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` per the schema-bump law, and its
ten-identity literal pin updated consciously. Every version pin (schema tests, generator
fixture hashes F10/F11 → `320b547e…`, snapshot-version, beat vocabularies) updated
red→green through the bump.

**Exact-consumer lock.** Unity commit `6aacb79` adopts the byte-identical pair (DTO changed,
fixtures byte-identical). `verify-bridge-contract-consumer --verify-only` bound to the exact
committed pair: **PASS**, both repositories at generated blob `1e7992ad364d2b3cd80174cfd49629579c7bd673`,
seal mode.

**Floors.** Full `npm test` 352 files / 4834 passed / 5 skipped / 0 failed; `typecheck` +
`typecheck:bridge` clean; `check:bridge-contract` + `check:bridge-contract:fixtures` PASS.
New suites: `ui/src/test/contracts/p05a-w2-closed-production.contract.test.ts` (10 —
all-active order invariance, same-title isolation, closed-state lifecycle walk, holder
precedence over Wrap on a same-week handoff, worksite exact/none, presence joins) and
`tests/bridge-p05a-w2-intents.test.ts` (4). Unity EditMode floor against `6aacb79` runs as
the W3 entry gate.

**Shape freeze.** The closed row, the Stage-local collection, the v12 wire identities, and
the all-active intent family are frozen; W3+ consume them and may not re-derive.

## W2 CORRECTION — range review REJECT remediated (findings F1–F8)

The independent read-only W2 range review returned **REJECT** with eight findings. All are
fixed at root in the owning wave; final disposition was requested from the same reviewer.
The v12 identities recorded in the W2 section above are **superseded** by this correction.

**F1 (HIGH) — `rehearsal` lit the wrong guidance chapter.** `journeyChapter` in
`LotPictureGuidanceCard.tsx` has a load-bearing `default` (the screenplay beats), so the
new beat fell through to Script while the headline read REHEARSAL — wrong rail highlight
and wrong `aria-current` for screen readers. Fixed with an explicit `case 'rehearsal'` →
Prep, and closed as a class: a 15-row table test now maps EVERY member of the frozen beat
vocabulary to its chapter through the rendered rail's own `is-current`/`aria-current`
marks (`LotPictureGuidanceCard.test.tsx`).

**F2 (MEDIUM-HIGH) — canonical `$id` URN left at projection-11.** Bumped to
`urn:project-studio:bridge:protocol-4:projection-12` and regenerated through the
transaction. **Corrected frozen v12 identities:** schema id
`sha256:a6f374596e956800f9547ad538fdd859c01bda3460aac8b877279c67686c6f4b`, generated C#
sha256 `97628f3d4565801549c27a76b30827f193cb13a8c37e954fee7fd0362fbc0a0b` (git blob
`253f01029fa384b474ee33e8b2c423becafb5bf7`), `generatorSourceSha256`
`7d65bf78723e0376efa2a2ae29a8c9c9b9add4469b28e428c7e273009a7eeccf` (bridge-schema.ts is a
bundle member; nothing else changed). Protocol 4 / save 15 unchanged. Per the schema-bump
law the outgoing WIP-intermediate identity `sha256:a481d14f…` was appended to
`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (now eleven, literal pin updated) — it never
shipped in any campaign branch or player build, but W2–W4 dev/proof checkpoints carry it.
The stale-URN pins the review called out (`bridge-schema.test.ts`,
`bridge-contract-consumer-lock.test.ts`) now assert projection-12.

**F3 (MEDIUM) — raw enum identifiers in the capacity cause line.** The
`PRODUCTION_PHASE_LABEL`/`FACILITY_CAPABILITY_LABEL` display maps moved from the adapter
into `productionOperationsProjection.ts` (exported; the adapter imports them back), and
the blocker anatomy's detail line now speaks them. Pinned exactly: the walk test asserts
`"No Post Building slot was available for the transition to Post-production."` and sweeps
every closed copy surface (anatomy, remedies, targets, holder copy) for raw identifiers.

**F4 (MEDIUM) — five surviving mutations.** New suite
`ui/src/test/contracts/p05a-w2-invariant-kills.contract.test.ts` (7 tests). Mutation
verification re-ran all five review mutations plus the F1/F3 reverts in a fresh isolated
copy: **eight of eight KILLED.** Two honesty notes the verification surfaced, now
recorded: (a) the ≥3-production regime really is the only one where the W2 sort acts, and
the new test walks it; (b) three of the five guards protect states the ENGINE's own
invariant sweep (`assertStudioOperationsInvariants`/`assertPropertyInvariants`, asserted
by `studioCalendar` inside every composition path, including `composeClosedProduction`'s
own `studioQueueView` call) rejects loudly on every path — they are defense-in-depth, so
their laws are proven by direct unit call on the exported `liveStageOf` /
`facilityBuildingIdOf`, with the unreachability itself documented in the suite. The
duplicate-holder law is proven END-TO-END via an engine-lawful capacity-2 stage collision
— the exact future (bigger stages) the law exists for.

**F5 (LOW) — vacuous stage-row guard removed** (both arms returned the same value and its
condition could not fire).

**F6 (LOW) — orphaned pin re-pointed.** The Movie-#2 walk now asserts
`resolveProductionBlocker` intents carry the exact `productionId` (the family's new
binding) instead of silently short-circuiting on the always-null `projectId`.

**F7 (LOW) — blocker totality guard.** `closedOperationalState` now switches exhaustively
over the `ProductionBlocker` union with a compile-time `never` arm that fails typecheck on
a fourth blocker kind and fails CLOSED (`status-unavailable`, never a working state) at
runtime.

**F8 (LOW) — superseded field marked.** `ProductionOperationsState.locationBuildingId` is
documented as superseded for placement by the closed worksite model; no new consumer may
read it (it still answers the PHASE's home building, which recon §6.1 forbids as a
"where is the work" answer).

Non-blocking review note recorded: `resolveAvailableIntents` speculatively executes
`runProductionCommand` once per deciding production per call — accepted for W2 (bounded by
the deciding-card count); candidate for a future fold if profiling warrants.

**FINAL DISPOSITION (same reviewer): ACCEPT** at TS `91e90af` / Unity `f450123`. The reviewer
independently re-ran all eight mutations in an isolated copy (8/8 KILLED, each killing exactly one
test), re-verified the byte-exact regeneration and both stale pins, re-ran the full floors (353
files / 4857 passed / 0 failed; all typechecks; both contract checks), and confirmed the
engine-invariant unreachability claims by driving each contradictory state through the full
pipeline. Carry-forward advisories recorded for later waves: (1) if a future wave relaxes the
operations/placement invariants, the liveStageOf/facilityBuildingIdOf unit proofs stop covering the
end-to-end path — the wave touching those invariants owes the walk; (2) F8 remains documentation,
not enforcement — a grep gate or removal of `locationBuildingId` would be stronger (W3+ concern);
(3) `projection-v12-stale-urn` in the prior-identity map never shipped outside the WIP branch —
labelled so a reader does not mistake it for a released projection.

## W3 — exact-ID N-Stage presentation registry — commit `830fe07` (Unity)

**Scope.** `StudioStagePresentationRegistry` in `Studio.Runtime.Infrastructure` (the assembly
EditMode tests can reference): presenters register by exact `stageBuildingIdentity`; `Apply`
routes each closed v12 `stageProductions` row to ITS registered presenter only. Fail-closed law
throughout — duplicate registration refuses loudly; a row with no presenter and a presenter with
no row both resolve to withheld presentation, never a guess, never a neighbour; a diagnostic
event reports every refusal. `StudioStageProductionPresentation` implements the presenter on both
stage bodies (serialized identity `stage-a`/`stage-b`), with the enum member `Rehearsal` APPENDED
(serialized ints stable) and the pure `MapPresentationState` law (dark→Dark, rehearsal→Rehearsal,
load-in→LoadIn, blocked→Waiting, shooting→Shooting, wrap→Clearing, else Withheld) public for
direct test. `StudioBridgePresentation` registers at cache time and applies per snapshot.

**Consumption seam.** The registry consumes `StudioProductionsProjection.stageProductions`
verbatim; nothing re-derives stage state from productions, copy, or history.

**EditMode: 598/598** (13 new registry tests: registration/duplicate/unregister law, exact-ID
routing, withheld fallbacks both directions, two-Stage isolation — a row for one stage never
touches the other's presenter — plus the reflection-proven mapping law).

## W4 — world presentation, presence & activity — commit `a71b067` (Unity)

**Scope.** The one truthful stage nameplate (`StudioStagePlacardContracts`, pure, Infrastructure):
facility label + holder copy for occupied, AVAILABLE for dark, WRAPPED · STAGE RELEASED for the
bounded release cue, NOTHING for withheld — placards are billboarded colliderless TextMesh bodies
(the P03A placard idiom), keyed by exact building id, destroyed with their row.
`ApplyStageAndSetStates` rebuilt row-driven: the closed row is the ONLY stage status speaker —
this kills Stage B's baked "SHOOTING · Legend of the Smuggler" lie at the root (the old apply
preserved any non-empty authored string; the authoring source is corrected for future regens; the
sealed scene is untouched because runtime now overwrites every snapshot). The legacy Stage-A-only
truth overwrite (`ApplyStageTruthToSelectable`) is retired. `StageActivityEffects` treats
Rehearsal as occupied-low (warm work light, beacon off). Decorative shooting-day/door-crew counts
gained serialized [0..1] presentation budgets — zero is lawful and changes no simulation, named
presence, blocker, or legibility law.

**Deliberate bounded deviations (recorded, not silent):** stage door geometry/animation deferred
(no door assets exist; state distinctness is carried by placard + beacon/interior/indicator
channels and the W6 camera poses viewing the signal-bearing facade the sealed stage camera never
saw); the delivery vehicle keeps its sealed legacy Stage-7 Resolve truth pending a per-stage
refit; the identity test's stage-status arm was consciously rewritten to the new row-driven law
it now proves.

**EditMode: 602/602** (4 new placard/status/budget tests + the rewritten identity law).

## W5 — retained Production workspace — commit `ca0cba0` (Unity)

**Scope.** See the commit body for the full inventory: `StudioProductionWorkspace` (all-active
wire-ordered list + exact detail: state rail, ONE operation, blocker anatomy with read-only
remedies, activation-revalidated Locate, company, current Stage/Set vs wrap history, read-only
Wrap→Post handoff), `StudioProductionWorkspaceContracts` (every control decided by one pure
function — queueable distinction disabled-with-exact-reason, duplicate publication withheld,
stale/settling reasons, selection stationarity, no raw-id copy), `StudioProductionEntryCard`
(Stage selection → closed-row truth + [OPEN PRODUCTION] for the exact holder only), and the
host's production route (same UIDocument/scrim/input/Esc/menu/Locate seams; casting-only dossier
peel; draft-free close; board-empty keeps the all-active workspace open honestly).

**EditMode: 625/625** (23 new — 13 pure contract laws, 8 controller/entry reflection laws
including single-flight dispatch and honest removal, 2 source laws). The remaining W5 charter
proofs (Esc order end-to-end, Save/Load/Quit coexistence, memo-hidden operability, responsive
hierarchy at runtime) are Level-4 packaged-journey obligations and land in W7 on the final build.
