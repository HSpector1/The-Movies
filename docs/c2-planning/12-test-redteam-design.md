# LANE 12 — TEST GATES & RED-TEAM DESIGN FOR C2

> C2 advance planning, 2026-08-18. Worktree `/Users/bruce/The Movies - C2 Planning`,
> branch `c2-sets-throughput-plan`, base = sealed C1 `main` @ `f294077`.
> **Planning only.** Nothing below is implemented. Every claim is tagged
> `[CODE]` (read in this worktree at this base), `[CORPUS]` (read-only evidence at
> `/Users/bruce/Desktop/Big Swing Art/`), `[DOC]` (a governing document in the repo),
> or `[PROPOSAL]` (this lane's design, not an observation).

## 0. What this lane delivers, and what it could not verify

**Delivers.** (1) A digest of the standing test law that C2 inherits, with the exact
numbers and the exact mechanisms that produce them. (2) A per-subject C2 test-gate
design, `G1`–`G14`, each with a named pass criterion. (3) A red-team target list,
`R1`–`R34`, grouped by attack family, each with the seam it attacks. (4) Acceptance
criteria for the four inherited seams that PF1 routes to C2. (5) An Owner playtest
script in the house style of master plan §9.

**Could not verify, honestly stated.**

- **No gate was re-run.** This worktree has **no `node_modules`** — `npx vitest list`
  fails with `Cannot find package 'vitest'`. Every numeric floor below is quoted from
  the C1 seal record or derived by file arithmetic, never by executing a suite here.
  C2's first act must be to re-run the floor at HEAD before touching anything
  (`docs/SHIFT-OPERATIONAL-LAWS.md:91` law 27(d), "stale balance certifications — re-run
  gates at HEAD"). [CODE]
- **The PF1 charter is not readable from my permitted scope.** The brief cites
  "PF1 charter §9" as the recorded owner of the four inherited seams
  (`00-C2-PLANNING-BRIEF.md:61-68`), but the charter lives in
  `/Users/bruce/The Movies - Professional Floor`, which my lane instructions forbid me
  to touch. Everything I say about seam ownership is therefore sourced from the brief
  plus the **C1/FMJ records that ARE in this worktree**, and the §9 routing itself is
  taken on the brief's word. Flagged in §6. [DOC]

---

## 1. THE STANDING TEST LAW C2 INHERITS

### 1.1 The C1 regression floor, as sealed

`LOT-CONTENT-EXPANSION-LOG.md:577-583` — "SEAL GATES — independently verified by the PM
at HEAD `9d8b0b4`, tree clean: root tsc exit 0 · ui tsc exit 0 · full vitest **241 files
/ 3,318 tests** exit 0 (+1 file/+21 tests over pre-wave, none removed) · new refusal spec
2/2 + golden path 1/1 in isolation exit 0. Implementer's FULL serialized Playwright at
this exact HEAD: **211 collected / 207 passed / 4 env-gated skips / 0 failed**, exit 0
(16.0m), collection arithmetic exact (209 + 2)." [DOC]

The floor C2 must not go below, restated as five numbers and one rule:

| Gate | C1 seal value | Source |
|---|---|---|
| root `tsc` | exit 0 | `LOT-CONTENT-EXPANSION-LOG.md:578` [DOC] |
| ui `tsc` | exit 0 | `LOT-CONTENT-EXPANSION-LOG.md:578` [DOC] |
| vitest | 241 files / 3,318 tests / 0 failed | `LOT-CONTENT-EXPANSION-LOG.md:578` [DOC] |
| Playwright (full, serialized, both origins) | 211 collected / 207 passed / 4 env-gated skips / 0 failed | `LOT-CONTENT-EXPANSION-LOG.md:580-582` [DOC] |
| FMJ specs | pass **unmodified** | `LOT-CONTENT-EXPANSION-LOG.md:14`, `:589-591` [DOC] |

**The rule:** "no test deleted or weakened all campaign"
(`LOT-CONTENT-EXPANSION-LOG.md:590`), restating law 28 — "never weaken/delete a failing
test to go green" (`docs/SHIFT-OPERATIONAL-LAWS.md:94`). [DOC]

### 1.2 What "241 files" is actually made of — and the ten files it is NOT

`vitest.workspace.ts` defines two projects and **is what `npm test` runs**
(`package.json:8`, `"test": "vitest run"`): [CODE]

- project `core` — `include: ['tests/**/*.test.ts']`, environment `node`
  (`vitest.workspace.ts:20`)
- project `ui` — `include: ['ui/**/*.test.{ts,tsx}']`, environment `jsdom`
  (`vitest.workspace.ts:30`)

File arithmetic in this worktree at `f294077`: `tests/**/*.test.ts` = **103**;
`ui/**/*.test.{ts,tsx}` = **138**. **103 + 138 = 241 — exactly the sealed figure.** [CODE]

**FINDING (test-law gap, C2 should rule on it).** `vitest.config.ts:5` declares
`include: ['src/**/*.test.ts', 'tests/**/*.test.ts']`, but the workspace file supersedes
it, and the workspace `core` project includes only `tests/**`. Ten test files under
`src/harness/d16/` (`publicity`, `isolation`, `production-agreement`, `experiment`,
`packages`, `states`, `luck`, `driver`, `counterflow`, `stats`) are therefore **not in
the 241 and not in the 3,318** — the D-16 economy-harness suite is outside the regression
floor. [CODE] This is not a defect C2 created, but C2 is the campaign that will move
economy numbers (throughput changes the marginal-slot economics the C1 snapshot measured
— `LOT-CONTENT-EXPANSION-LOG.md:414-416`), so C2 is the campaign that most needs that
suite green. See `G13`.

### 1.3 Playwright law: two origins, serialized, no retries

`ui/playwright.config.ts` — the browser law C2 inherits verbatim: [CODE]

- `fullyParallel: false`, `workers: 1`, `retries: 0` (config lines 32-34). Contended runs
  are invalid — `docs/SHIFT-OPERATIONAL-LAWS.md:62` law 24, and the recorded FMJ lesson
  in master plan §9 test gates (`THE-MOVIES-PARITY-MASTER-PLAN.md:516-517`). [DOC]
- **Two webServers.** Port **5178** = the retained Operation Hollywood *plate* world
  (`VITE_TYCOON_WORLD: '0'` — an explicit quarantine, not a product rollback);
  port **5179** = the **shipped default grid world** (`VITE_TYCOON_WORLD: ''`).
  "the product has two worlds." [CODE]
- `testIgnore: /.*current-break-audit\.spec\.ts$/` — one frozen historical audit,
  deliberately not re-measured (`ui/playwright.config.ts:31`; law 25 note at
  `docs/SHIFT-OPERATIONAL-LAWS.md:74-76`). [CODE]
- Viewport 1280×900, `screenshot: 'off'` with explicit captures at named steps. [CODE]
- Fixtures are built by **calling adapter actions in-spec with a named seed**, injected
  via `page.addInitScript` into `localStorage['project-studio.active-session.v4']`;
  **never hand-edit cash or roster in a fixture** (`docs/SHIFT-OPERATIONAL-LAWS.md:60-62`
  law 24). [DOC]
- 38 `*.spec.ts` files live in `ui/e2e/` at the seal. [CODE]

### 1.4 FMJ is load-bearing

`LOT-CONTENT-EXPANSION-LOG.md:14` — "FMJ is load-bearing: existing FMJ tests pass
**without weakening**." The sealed FMJ artifacts C2 must not touch:
`tests/first-film-journey.test.ts`, `ui/e2e/first-movie-golden-path-v1.spec.ts`,
`ui/e2e/lot-founded-audition-path-v1.spec.ts`,
`ui/e2e/lot-second-picture-audition-path-v1.spec.ts`. [CODE]/[DOC]

The engineering reason FMJ survives structural change is in master plan §6:
"the journey projection already speaks **semantic sites** (engine never names renderer
buildings — sealed law 12); extending it upstream with construction stages at the Flip
adds entries to an existing mapping instead of rewriting one"
(`THE-MOVIES-PARITY-MASTER-PLAN.md:266-268`). [DOC] Verified in code: `JourneySite` is a
five-member closed union `'development' | 'casting' | 'stage' | 'post' | 'admin'`
(`src/core/firstFilmJourney.ts:96`) and `SITE_PLACE` at `:124-129` is "the ONLY place a
site becomes a spoken place name". [CODE] `FirstFilmJourneyStage` is an eight-member
closed union `no-picture | drafting | script-review | ready-to-package | auditioning |
audition-review | in-production | released` (`src/core/firstFilmJourney.ts:73-85`) — the
Flip adds construction stages **upstream of `no-picture`**, which is an additive widening
of both unions. [CODE]

### 1.5 Law 25 — structural pins

`docs/SHIFT-OPERATIONAL-LAWS.md:63-76`: "always name the fixture; compare across
independent fresh windows over byte-identical saves; absolute FPS only behind
`PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1`." Live tuples are tabulated in the M1 quarantine
note in `ui/playwright.config.ts` [CODE]:

| Fixture | objects / actors / decoded bytes / draws | World |
|---|---|---|
| commission-workspace managed idle (6 contracts, 0 pictures) | 42 / 19 / 11,096,896 / 1 | plate (5178) |
| operational-annex script Working (8 contracts, 0 pictures) | 46 / 21 / 11,096,896 / 1 | plate |
| governed Week-30 blocked (15 contracts, 1 picture) | 62 / 29 / 11,096,896 / 1 | plate |
| …with a Gate visitor selected | 63 / 30 / 11,096,896 / 1 | plate |
| greenlight two-picture formation (15 contracts, 2 pictures) | 64 / 30 / 11,096,896 / 1 | plate |
| build-mode "grid managed-idle", Week 0 | 231 / 14 / 8,806,568 / 6 | grid (5179) |
| presence "grid presence", Week 0 | 231 / 14 / 8,807,528 / 6 | grid |
| presence "grid presence greenlit", Week 0 and 1 | 231 / 14 / 8,807,528 / 6 | grid |

The C1-M6 re-pin is the template for how a C2 re-pin must be written: *every row moved
together, for three named measured reasons* (+57 authored dressing objects; +260,848
decoded bytes identical on two different rosters, which is what proves it is world art
and not people; draws 4→6 from texture-unit batch overflow) with "Dynamic actors are 14
in every grid row, before and after… the pass touched no person" as the control.
`ui/playwright.config.ts`, C1-M6 RE-PIN block. [CODE] The config also records **two
doc-drift repairs** where the table printed a figure the owning specs no longer asserted
— C2 must not add a third. [CODE]

### 1.6 Law 23 — determinism

`docs/SHIFT-OPERATIONAL-LAWS.md:54-56`: "zero Math.random (hygiene test scans literal
string in src/ and tests/); fixed-order iteration; derived RNG streams keyed by domain;
presentation consumes zero RNG; assert byte-identical state/save after
rejection/repaint." [DOC]

Mechanisms in code: [CODE]

- `tests/hygiene.test.ts` scans **`src/` and `tests/` only** for the literal
  `"Math.random"`.
- `ui/src/hygiene.test.tsx:50` and `:69` scan `ui/src/**` — two checks, one for any
  *executable* reference, one (strictest) for any *invocation*. **Neither scans
  `ui/e2e/`.**
- Presentation randomness is a **separate seeded generator**, `ui/src/lot/scene/rng.ts`
  (mulberry32 over cyrb53), seeded from `snapshot.sceneSeed` — e.g.
  `ui/src/lot/tycoon/TycoonScene.ts:2250`, `new Rng(\`${this.snapshot.sceneSeed}:person-home:${personId}\`)`,
  documented as "PRESENTATION ONLY… never Math.random, never a simulation stream".
  This is the pattern C2's theater must reuse and the reason theater can be byte-neutral.
- Engine ordering is explicitly fixed: facilities sorted by id
  (`src/core/operations.ts:130` `compareId`), slots ascending (`:148`), productions
  advanced in ascending-id order (`:629`, with the comment at `:687-688` "Preserve the
  caller's production-array order; allocation order alone is the governed ascending-id
  order").
- Byte-identity is asserted via `stableStringify` on `makeSave(...)` — the idiom in
  `tests/presence-determinism.test.ts` ("same state ⇒ same bytes, calling it leaves the
  state (and its save) untouched, and a tick is byte-identical whether or not presence
  was projected first") and `tests/replay.test.ts` (§15.7: "Same seed + same actions →
  byte-identical state and Broadcast copy").

### 1.7 Contract-first test discipline

`CLAUDE.md` (project): "**Every bounded term in the contract gets a unit test asserting
its stated range.**" · "Constants live in `TUNING` (section 16). Never inline a magic
number that has a name in the contract." · "Run the tests. Report actual output. Never
assert tests pass without running them." [DOC]

The live expression of this in C1 is `assertBlueprintCatalogInvariants()`
(`src/core/placement.ts:1106-1200`), which asserts ranges rather than trusting review,
with the stated reason: "the cost of a typo in a price or a footprint is a save that
validates and a game that is quietly wrong, so the ranges are asserted rather than
trusted to review" (`:1146-1148`). Its headline invariant is the anti-exploit one:

```
FACILITY_DEMOLITION_REFUND_FRACTION >= 0 && FACILITY_DEMOLITION_REFUND_FRACTION < 1
  — 'the demolition refund fraction must be at least 0 and strictly below 1'
```
(`src/core/placement.ts:1113-1118`; the constant is `0.5` at `src/core/tuning.ts:786`).
The comment names the threat model exactly: "so no future tuning pass can turn
build-and-demolish into an income stream by editing one number." [CODE] **This is the
model for every C2 economic constant.**

Also `tests/tuning.test.ts:1-7` — "Every expected value here is derived from
docs/build-contract.md §16… No value is copied from implementation." A C2 bounded-term
test must be derived from the C2 charter, not read off `tuning.ts`. [CODE]

### 1.8 What a C2-grade red team looks like — the M7/M8 anatomy

`LOT-CONTENT-EXPANSION-LOG.md:507-540` is the standard. Five properties C2 must
reproduce: [DOC]

1. **Independent, adversarial, at a named commit, on named seeds.** "at `c351086`, seeds
   `studio-red-01..05`" (`:509`).
2. **It found a BLOCKER nothing else could.** F1, the legacy Annex parcel one-way door —
   "the shipped move flow carried a bought building onto it with the world's own blessing
   … whereupon the adapter dropped it from the composed world: no body, no verbs, no
   explanation, $2,500/week forever … one-way, save-persistent, **zero errors**"
   (`:510-516`). The post-mortem is the transferable lesson: "The inverse test (a
   building ON the pad refuses both verbs) had existed since M3a; **nothing ever probed
   the door from outside**, and every fixture deliberately routed around the parcel — a
   textbook closed-world blind spot" (`:515-518`).
3. **A HELD LIST, not silence.** `:530-540` records everything that was attacked and
   *held*: refund farming lossy across 5 seeds × every cycle shape incl. mid-construction;
   two-way ledger correlation and forged-refund guards; historical opex reconciliation
   across demolished history; the quote→cash-drop→commit race; engagement-guard
   exhaustiveness audited **against every `facilityId` field in `types.ts`**; save
   round-trip byte-identity after every mutation kind; V12→V13 mid-journey migration then
   immediate mutation; four hostile property roots failing closed with named errors;
   capacity blueprints inert over 50 idle weeks; a 60-week × 5-seed soak. **Evidence, not
   silence** is the phrase; a C2 red team that reports only findings has under-reported.
4. **Findings are dispositioned, not all fixed.** F2/F3/F4 were "recorded as Owner/C2
   items rather than late code changes (the campaign's law is measured evidence, not gut
   tuning)" (`:519-520`).
5. **Adopted probes become permanent specs.** "The red-team's browser probe adopted as
   `tycoon-legacy-parcel-refusal-v1.spec.ts`… Engine variants distilled into
   `tests/legacy-parcel-ground.test.ts` (14 tests incl. the swept invariant and the forged-
   save trio)… Red-team probes not adopted were deleted; tree seals clean" (`:554-559`,
   `:570-571`). [DOC]

Also inherited: the **FLAKE WATCH** discipline. `LOT-CONTENT-EXPANSION-LOG.md:425-463` —
a hard trigger on the third distinct flaking file, a *reproduce-first* rule (4 of 6
repeats failed pre-fix, every failure the exact diagnosed pair), and a fix proven by
12/12 repeats, "No assertion weakened — the test now measures what it always meant to
measure." C2 adds physical queues and animation, which is a flake-rich surface; the watch
carries forward as-is. [DOC]

---

## 2. C2 TEST GATES, BY SUBJECT

All of §2 is `[PROPOSAL]` unless a claim inside it carries another tag. Gate IDs are
stable so the charter and the red team can reference them.

### G1 — Reservation lifecycle invariants

**What exists today** (so C2 extends rather than reinvents). `FacilityReservation` =
`{productionId, facilityId, capability, slot, phase}` (`src/core/types.ts:545-551`);
`StudioOperations = {mode, facilities, workflows}` (`:581-585`);
`FacilityCapability` is a four-member closed union
`'development-casting' | 'soundstage' | 'set-scenery' | 'post'` (`:524-528`). [CODE]
No-double-booking is asserted today at `src/core/operations.ts:485-487`:

```
const key = `${facility.id}:${String(reservation.slot)}`
invariant(!occupied.has(key), `facility slot "${key}" is overbooked`)
```

but **only across production workflows** — the invariant walks `operations.workflows`
alone (`:453`). Script and casting reservations are unioned into allocation via the
`externallyOccupiedSlots` parameter (`operations.ts:102/122/191/613`) and are separately
asserted in `castingSessions.ts:512-521`, and `presence.ts:354-396` builds the full
three-owner union for projection. **The single-union law is honoured by three
cooperating sites, not by one.** [CODE]

**G1 gates (each a unit test in `tests/`):**

- **G1.1 No double-booking, across ALL owners, in ONE assertion.** C2 must add a
  cross-owner overbooking invariant that walks production workflows **and** script
  reservations **and** casting reservations **and** every new C2 holder (set
  reservations, stage occupancy, scenery/load-in claims, queue holds) in one pass, and
  fails with a named error. Pass = a hand-forged state that double-books a slot across
  *two different owner kinds* is rejected at `validateSave`, at `applyActions`, and at
  `tick` — three boundaries, one error string. Today a cross-kind double-book is
  detected only as a *projection withholding* (`presence.ts:392-394` "claimed by more
  than one owner"), which fails soft, not closed. [CODE]/[PROPOSAL]
- **G1.2 Release on EVERY termination path.** Enumerate the termination paths and pin
  one test each: (a) natural completion — `advanceManagedProductions` at
  `operations.ts:664-667` removes the workflow when `nextRemaining === 0`;
  (b) `releaseReady` — `requirementsForPhase('releaseReady')` returns `[]`
  (`operations.ts:90-91`) so entering it drops every reservation; (c) **cancel** —
  `applyCancel` calls `removeManagedProductionWorkflow` (`actions.ts:647`); (d) demolish
  of the facility itself; (e) C2's new paths: abandon-in-queue, set demolished under a
  reservation, stage demolished under a reservation, wrap, premiere. Pass = for each
  path, `assertStudioOperationsInvariants` holds immediately after, **and** a
  `stableStringify(makeSave(state))` comparison shows the reservation gone from every
  root — no orphan in `operations`, none in the new set/stage roots, none in the queue.
  [CODE]/[PROPOSAL]
- **G1.3 Law 22 single union preserved.** `docs/SHIFT-OPERATIONAL-LAWS.md:51-53`:
  "Capacity/occupancy is ONE union at every boundary (production + script + casting +
  **any new placement/assignment**) consumed by actions, invariants, tick, read models."
  Pass = a **sweep test** that enumerates every persisted reservation-bearing root by
  reflection over the save shape and asserts each is consumed by all four consumers.
  The C1 precedent for a sweep of exactly this kind: the red team "audited [the
  engagement guard] against every `facilityId` field in `types.ts`"
  (`LOT-CONTENT-EXPANSION-LOG.md:534-535`). Make the audit a test, not a review. [DOC]/[PROPOSAL]
- **G1.4 `facilityEngagements` exhaustiveness.** `src/core/placement.ts:806-869` is "THE
  predicate" — it walks five holder kinds (production reservation, shooting task,
  screenplay, casting session, legacy V11 construction root) and its header states
  "anything that can hold a facility must be added to both [the predicate and the module
  header]" (`:801-804`). Every C2 holder must be added. Pass = a test that fails if a new
  reservation-bearing type exists in `types.ts` that `facilityEngagements` does not walk
  (assert the holder-kind union is exactly the set of persisted holder roots). [CODE]/[PROPOSAL]
- **G1.5 Reservations survive a save round-trip byte-identically**, including a reservation
  held across a save/load boundary mid-phase. Reuses the C1 idiom
  (`tests/placement-lifecycle.test.ts`, `tests/property-state-v13.test.ts`). [CODE]/[PROPOSAL]

### G2 — Queue determinism

**Threat model.** Owner law 2 (`00-C2-PLANNING-BRIEF.md:23-26`) makes the queue
player-visible, which makes queue **order** a player-facing fact and therefore a
determinism obligation. [DOC]

- **G2.1 Same seed + same actions → identical queue order.** Extend the §15.7 replay
  test (`tests/replay.test.ts:1-18`, "Same seed + same actions → byte-identical state and
  Broadcast copy") so the serialized queue is inside the byte comparison. Pass =
  `stableStringify(makeSave(A)) === stableStringify(makeSave(B))` over two independent
  runs, with the queue root non-empty in both (a vacuously empty queue must fail the
  test's own precondition assertion). [CODE]/[PROPOSAL]
- **G2.2 No timestamp authority.** Law 20 (`docs/SHIFT-OPERATIONAL-LAWS.md:46-48`):
  "Temporal claims need an immutable event witness, not an editable timestamp." Pass =
  a hygiene-class test that the queue's ordering key is derived from persisted
  monotonic ids and the tick counter only, and a runtime test that mutating any
  wall-clock source changes nothing. Concretely: the queue's comparator must be provably
  total and provably independent of `Date.now`, `performance.now`, insertion iteration
  order of a `Map` built from an unordered source, and of the renderer.
  [DOC]/[PROPOSAL]
- **G2.3 Contended allocation order is pinned and named.** Today contention is broken by
  ascending production id (`operations.ts:629` `[...productions].sort(compareId)`) over
  facilities sorted by id (`:130`) and slots ascending (`:148`). [CODE] C2 must either
  keep that rule or replace it, and either way **write the rule down in the charter and
  pin it with a test that constructs a genuine tie** (two productions, one free
  soundstage) and asserts *which* one wins and *why*. Pass = the tie-break rule is
  stated in the test's own header as contract text, not read off the implementation
  (`tests/tuning.test.ts:1-7` discipline). [CODE]/[PROPOSAL]
- **G2.4 Queue order is stable under presentation.** A tick is byte-identical whether or
  not the queue read model / theater was projected first — the exact shape of
  `tests/presence-determinism.test.ts`. [CODE]/[PROPOSAL]
- **G2.5 Re-entrancy.** Projecting the queue twice in a row returns identical bytes and
  leaves state untouched. [PROPOSAL]

### G3 — Bounded-term unit tests for every new TUNING constant

CLAUDE.md convention, applied to C2's constant families. Pass criterion for the whole
gate: **`TUNING` gains no C2 key without a range assertion derived from the C2 charter,
and no magic number with a charter name appears inline anywhere in `src/`.** [DOC]

Expected C2 constant families and the range each needs [PROPOSAL]:

| Family | Bound to assert | Why (threat if unbounded) |
|---|---|---|
| Set build capex / build weeks | `capex` positive integer; `buildWeeks` ≥ 1 integer | mirrors `placement.ts:1141-1156`; a $0 set is free capacity |
| Set decay / boredom per use | in `[0,1)`, and **strictly** decaying so reuse is never free | corpus: `boredom` and `quality` are real 0–1 float fields on the set definition [CORPUS] `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:687` |
| Set genre weights | each weight in `[0,1]`, at least one non-zero, and a named `priority` genre present | corpus: the `[genre]` block carries a float weight per genre plus an explicit `priority1` field [CORPUS] Bible `:687` |
| Set refurbish / repair cost | > 0, and **strictly greater** than the value it restores per unit | else refurbish-farming |
| Stage capex / capacity | capacity a positive integer (a capacity-0 *stage* is a contradiction — see `R11`) | `types.ts:534`, `operations.ts:357-360` |
| Demolition refund fraction (extended to sets/stages) | `>= 0 && < 1` | verbatim reuse of `placement.ts:1113-1118` [CODE] |
| Queue wait / priority weights | finite, ordering total, no ties left unresolved | non-total comparator = non-determinism |
| Travel/layout cost or time terms | ≥ 0, monotone in distance, bounded above | corpus: "buildings placed far apart forced cast and crew to physically commute, which the manual states directly *extends production time and adds to cost*" [CORPUS] Bible `:39`, `:136` |
| Premiere Night terms | every score/standing delta bounded, and the null-premiere case exactly neutral | law: bounded terms |
| Concurrency ceiling removal | `MAX_CONCURRENT_PRODUCTIONS` (`src/core/tuning.ts:50`, enforced `src/core/actions.ts:332-337`) must be **deleted or made non-binding**, not merely raised — Owner law 1 [DOC] `00-C2-PLANNING-BRIEF.md:21-24` |

**G3.1** A test asserting the C1 §16 values are *unchanged* by C2 (`tests/tuning.test.ts`
extended, not edited — every existing expectation stays). [CODE]/[PROPOSAL]
**G3.2** A catalog invariant for the Set catalog modelled line-for-line on
`assertBlueprintCatalogInvariants` (`placement.ts:1106`), **including the
`effectSummary`-must-be-a-complete-sentence rule** (`:1184-1192`) — the mechanism that
enforces "no decorative blueprints" at authoring time. Sets get the same rule: a set that
cannot say what it does for the player is a decorative set. [CODE]/[PROPOSAL]

### G4 — V13 → V14 migration, including mid-production saves

**Today.** Current save is **V13** (`src/core/save.ts:3648-3662`, `validateSaveV13`,
`expected saveVersion 13`); `migrateToV13` at `:5263-5266`; the version dispatcher at
`:3712` (`if (s.saveVersion === 13) return validateSaveV13(save)`). [CODE]
The historical-boundary guard pattern is explicit: `save.ts:495-517` rejects
`state.property` and the V13-only `facilityDemolitionRefund` ledger kind at any earlier
boundary, with named errors. Law 19 (`docs/SHIFT-OPERATIONAL-LAWS.md:43-45`) says to
**copy that pattern verbatim for new roots**. [CODE]/[DOC]

**G4 gates** [PROPOSAL]:

- **G4.1** `validateSaveV14` exists; `saveVersion === 14` is strict; every historical
  boundary (V8–V13) rejects each new C2 root (sets, stages-as-facilities, queue,
  premiere, theater prefs if persisted) with a **named** error, copying `save.ts:495-517`
  verbatim in shape. Pass = one rejection test per (new root × historical boundary) pair
  — a matrix, not a sample.
- **G4.2** `migrateToV14(V13)` synthesizes the new roots deterministically; migrating the
  same V13 save twice produces byte-identical V14.
- **G4.3 Representation neutrality (the C1-M1a proof, repeated).** "a migrated V12 world
  simulated N weeks equals the V13 world on all cash/ledger/production outputs"
  (`LOT-CONTENT-EXPANSION-LOG.md:74-76`). C2's analogue: a migrated V13 world simulated N
  weeks must equal the pre-migration world on **cash, ledger, and released-film outputs**,
  for a save that owns no sets and no built stages. If C2 cannot make that true, the
  charter must say so out loud and the Owner must rule.
- **G4.4 Mid-production saves — the hard case, one test per phase.** A V13 save is
  migrated at each of the six `ProductionPhase` values (`types.ts:537-543`:
  `development`, `preProduction`, `rehearsal`, `shooting`, `postProduction`,
  `releaseReady`), then **immediately mutated** (advance one tick, then take a player
  action) and validated. The C1 red team held exactly this shape:
  "V12→V13 mid-journey migration then immediate mutation clean"
  (`LOT-CONTENT-EXPANSION-LOG.md:536-537`). [DOC] Two sub-cases C2 must add, because they
  are new: (a) migration **during `shooting` with a `shootingTask` in each of its five
  statuses** (`ShootingTaskStatus` = `unassigned|blocked|ready|scheduled|completed`,
  `types.ts:553`) — the invariant at `operations.ts:504-509` binds task status to
  `remainingTicks` 5 vs 4, so a migration that mis-synthesizes either side fails loudly;
  (b) migration of a save whose production is **capacity-blocked**
  (`workflow.blocker.kind === 'facility-capacity'`), where `operations.ts:531-548`
  permits a blocker only at `remainingTicks` 7, 6 or 4 with an exactly-matching
  capability/targetPhase pair.
- **G4.5 Downgrade refusal.** Copy the `migrateToV11` downgrade-refusal precedent
  (`save.ts:4240-4253` per law 19). A V14 save must never silently load as V13. [DOC]
- **G4.6 Forged-save trio.** The C1 pattern (`tests/legacy-parcel-ground.test.ts`
  contains "the swept invariant and the forged-save trio",
  `LOT-CONTENT-EXPANSION-LOG.md:558-559`) applied to each new root: hostile-but-schema-valid
  input fails closed with a named error (law 17: "closed-shape, exact-own-key
  (`Reflect.ownKeys` incl. symbols); present-but-malformed ≠ absent; never
  `if (!value) legacyFallback()`", `docs/SHIFT-OPERATIONAL-LAWS.md:39-41`). [DOC]

### G5 — The Flip golden path AND the pre-Flip fixture as permanent regression

Master plan §6 states both halves as one obligation: "At the Flip, the golden path
*extends* — 'bare lot → build core → FIRST FILM GREENLIT' — and the pre-Flip fixture
(studio founded with buildings, i.e. every migrated save) is **retained as a permanent
regression suite**. Migrated saves never experience the Flip retroactively; they simply
own their founding placements." (`THE-MOVIES-PARITY-MASTER-PLAN.md:269-272`) [DOC]

- **G5.1 The Flip golden path e2e** — one spec, one continuous browser session on shipped
  defaults, **no reload**, on the grid origin (5179). The C1 golden path
  (`ui/e2e/c1-golden-path-v1.spec.ts`) is the template and its ruling record
  (`LOT-CONTENT-EXPANSION-LOG.md:383-395`) sets the bar: engine truth asserted against
  *the engine's own counterfactual assessor, not copy*; a real refusal proven
  byte-neutral; a cancel-and-re-enter in the middle. C2's path:
  **found on a bare lot → the journey says "the studio has no development office — build
  one" → build the development core → commission → build a stage → build a set → the
  script requires that set by name → greenlight → watch the stage become occupied →
  wrap → premiere.** Pass = every step asserted against engine state, at least one
  genuine refusal proven byte-neutral, and the whole thing in one session.
  [DOC]/[CODE]/[PROPOSAL]
- **G5.2 The pre-Flip fixture, permanent.** A named fixture representing "every migrated
  save" — a studio founded **with** the nine buildings — kept forever and run as
  regression. Pass = both fixtures green in the same suite run; a change that fixes one
  and breaks the other is a FAIL, not a trade.
- **G5.3 Founding-mode distinctness is a state fact, not a UI mode.** Pass = a unit test
  that a migrated (pre-Flip) save and a freshly founded (post-Flip) save are
  distinguishable **only** by their placement/property contents, and that no code branch
  keys behaviour on "was this save migrated". See `R24`.
- **G5.4 FMJ specs unmodified.** The four specs in §1.4 pass with **zero diff**. The
  mechanism that makes this achievable is the semantic-site indirection
  (`firstFilmJourney.ts:96,124-129`) — if a C2 change requires editing `SITE_PLACE` or
  widening `JourneySite` in a way that changes an existing member's meaning, that is a
  charter-level finding, not an implementation detail. [CODE]/[PROPOSAL]

### G6 — Scenery / rehearsal / wrap transitions

**Today's phase machinery.** `productionPhaseForRemainingTicks`
(`operations.ts:56-77`) maps `8→development, 7→preProduction, 6→rehearsal, 5|4→shooting,
3|2→postProduction, 1→releaseReady`. `requirementsForPhase` (`:79-93`) maps
`development|preProduction→['development-casting']`, `rehearsal→['soundstage']`,
`shooting→['soundstage','set-scenery']`, `postProduction→['post']`,
`releaseReady→[]`. The soundstage is **retained** across rehearsal→shooting by an explicit
carry-forward (`:133-143`). The scenery blocker is `{kind:'scenery-load-in', taskId}`
(`types.ts:568-571`), cleared by `clearSceneryLoadIn` (`operations.ts:282-304`) which
demands the exact blocked state; `scheduleShootingTake` (`:306-326`) demands `ready` and
no blocker; the advancing tick completes the take (`:651-661`). [CODE]

- **G6.1 Transition table pinned as a table.** One test that asserts the full
  `phase → required capabilities` map and the full `remainingTicks → phase` map as data,
  so any C2 change to either is a *visible diff in a table*, not a behaviour change
  discovered in a playtest. [CODE]/[PROPOSAL]
- **G6.2 The stage is retained, the set is not (or is — state it).** Today the soundstage
  survives rehearsal→shooting; `set-scenery` is allocated fresh at shooting entry. C2
  adds real Sets; the charter must state whether a Set is held across
  rehearsal→shooting→wrap or re-acquired, and G6.2 pins the answer with a test that
  contends the same Set between two productions across the boundary. [CODE]/[PROPOSAL]
- **G6.3 Wrap.** See §6 risk W1 — the brief says the "authoritative wrap transition
  (shooting → post) does not exist today" (`00-C2-PLANNING-BRIEF.md:65-66`) while the
  code does perform a shooting→postProduction reallocation at
  `operations.ts:663-684`. Whatever the charter decides "wrap" is, G6.3 pins:
  (a) at wrap, the soundstage and set-scenery reservations are **released in the same
  atomic transition** that acquires `post`; (b) if `post` is unavailable, the production
  **blocks holding the stage** (today's behaviour — `enterPhase` returns
  `advanced:false` with the blocker and keeps the current reservations,
  `operations.ts:569-575`) or **releases and queues** (a C2 ruling) — and whichever it is,
  the test asserts it and the copy says it. This is the single highest-value
  starvation/deadlock gate in C2 (see `R14`, `R15`). [CODE]/[PROPOSAL]
- **G6.4 Rehearsal is physically real.** Corpus: "Practice Genre" is a per-set field and
  "an actor practicing on a set gains proficiency in that set's associated genre"
  [CORPUS] `THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:756`. If C2 adopts the shape,
  the gate is: rehearsal on a set with practice-genre G moves a bounded, asserted term,
  and rehearsal on a set without one moves nothing (byte-identical).
- **G6.5 Scenery load-in stays authoritative.** `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-*`
  and `tests/world-first-scenery-load-in-provenance.test.ts` exist and must pass
  unmodified or be extended with named reasons. [CODE]

### G7 — Premiere Night V1

**Today: nothing.** `grep -i premiere` over `src/` returns **zero** hits; the only
matches in `ui/src` are authored art dressing (`ui/src/lot/scene/assets.ts:990`
"vertical hanging premiere banner", `ui/src/lot/scene/layout.ts:259-264` "premiere
banners flanking the boulevard approach"). Premiere Night is greenfield. [CODE]

- **G7.1 Premiere is engine state, not animation.** Owner law 5 / standing laws 1-3
  (`docs/SHIFT-OPERATIONAL-LAWS.md:6-11`): "Animation may acknowledge a command, never
  complete one. No route timer, arrival, tween, or update() tick advances tasks/work/
  queues." Pass = a headless test drives a premiere to completion with **no renderer
  mounted**, and the resulting save is byte-identical to the same premiere driven with
  the renderer mounted. [DOC]/[PROPOSAL]
- **G7.2 Bounded outcome.** Every premiere-derived delta (standing, awareness, publicity,
  reception input) is range-asserted, and the *no-premiere* control path is exactly
  neutral (byte-identical save).
- **G7.3 Premiere cannot double-fire.** One release → at most one premiere; a save/load
  across the premiere week does not re-fire it. Law 20 identity discipline. [DOC]
- **G7.4 Premiere interacts correctly with the releaseTick seam.** See `S4` — the
  premiere's own week must be derived from the same authority the "released N weeks ago"
  copy uses, or C2 ships two disagreeing week authorities.
- **G7.5 The Theater question is upstream of this gate.** Master plan §6 leaves the
  Theater's landmark-vs-buildable call open, to be made "at the Founding Flip design
  review" (`THE-MOVIES-PARITY-MASTER-PLAN.md:225`, `:574-576`). If the Theater is where
  Premiere Night happens and the Theater is not present on a bare Flip lot, G5.1's golden
  path and G7 collide. Flagged in §6 as an Owner decision. [DOC]

### G8 — Theater byte-parity (PF1's proof obligation, extended)

**The obligation.** Owner law 8 (`00-C2-PLANNING-BRIEF.md:39-43`): "Visible activity must
correspond to authoritative work… No decorative screensaver population." Owner law 5:
"Engine state owns reservations and outcomes. **Animation is evidence only.**" [DOC]

- **G8.1 Theater on/off → identical saves.** For a named fixture and a named seed, run N
  weeks with simulation theater enabled and N weeks with it disabled; assert
  `stableStringify(makeSave(a)) === stableStringify(makeSave(b))`. This is the
  presence-determinism idiom (`tests/presence-determinism.test.ts`) applied to a much
  larger surface. Pass = byte-identical, plus a precondition assertion that the theater
  actually produced visible activity in the enabled arm (otherwise the test passes
  vacuously). [CODE]/[PROPOSAL]
- **G8.2 Theater consumes zero simulation RNG.** Law 23: "presentation consumes zero
  RNG." Pass = `state.rngState` is byte-identical across the on/off arms, and the theater's
  own variation is drawn **only** from the scene-seeded generator
  (`ui/src/lot/scene/rng.ts`), following the `personHome` precedent
  (`ui/src/lot/tycoon/TycoonScene.ts:2236-2255`). [DOC]/[CODE]/[PROPOSAL]
- **G8.3 Extend the Math.random hygiene scan to `ui/e2e/`.** Today
  `tests/hygiene.test.ts` covers `src/` + `tests/`, and `ui/src/hygiene.test.tsx` covers
  `ui/src/**`; **`ui/e2e/` is covered by neither**. C2's theater will be exercised mostly
  from e2e, and a `Math.random` in a spec is a flake generator. [CODE]/[PROPOSAL]
- **G8.4 Truth-divergence assertions.** For each theater vocabulary item, a test that the
  animation is *present iff* the engine fact is: a traveling person iff a reservation
  claims them at a destination; scenery arriving iff a production needs it; a stage
  occupied iff a reservation holds it; a queue body iff a queue entry exists; bodies
  leaving at wrap iff reservations were released. Pass = each is a two-way iff, not a
  one-way implication. See `R28`–`R31`. [PROPOSAL]

### G9 — Structural re-pins with named reasons

Law 25. Pass criterion, copying the C1-M6 template exactly
(`ui/playwright.config.ts` C1-M6 RE-PIN block) [CODE]/[PROPOSAL]:

- **G9.1** Every moved tuple is re-measured *from a real run of the owning specs*, at
  HEAD, and the config table and the specs carry the **same** numbers (two doc-drift
  repairs are already on the record; a third is a process failure).
- **G9.2** Each delta is attributed to a named mechanism with a control that proves the
  attribution — the C1-M6 control was "identical decoded-byte delta on two different
  rosters proves it is world art and not people", and "dynamic actors are 14 in every
  grid row, before and after". C2's theater will move `dynamicActors`; the control must
  then be the reverse: *actors move, authored objects do not*.
- **G9.3** New C2 fixtures are **named** (law 25 "always name the fixture") and compared
  across independent fresh windows over byte-identical saves.
- **G9.4** The plate origin (5178) tuples must **not** move. C2 is grid-world work; a
  plate tuple moving is an unintended coupling and a finding.
- **G9.5** Absolute FPS claims only behind `PROJECT_STUDIO_PERFORMANCE_EVIDENCE=1`
  (the 4 env-gated skips in the 211/207/4/0 count are exactly these). [DOC]

### G10 — Concurrency-ceiling removal proof

Owner law 1 says the `MAX_CONCURRENT_PRODUCTIONS: 2` ceiling
(`src/core/tuning.ts:50`, enforced `src/core/actions.ts:332-337`) is transitional and
throughput must emerge from physical capacity. [DOC]/[CODE] The C1 economy snapshot
measured that at today's ceiling, **shared slots are inert**: "shared slots at the
2-production ceiling are MEASURABLY INERT (4 of 5 seeds byte-identical outcomes with
+1/+2 slots; mean marginal slot −$323,532 before the building is paid for)"
(`LOT-CONTENT-EXPANSION-LOG.md:403-406`). [DOC]

- **G10.1** With the ceiling removed, the **same measurement re-run must show slots are
  no longer inert** — the marginal slot must change outcomes on ≥ 4 of 5 seeds. This is
  the acceptance test for the whole "throughput emerges from capacity" law: if slots stay
  inert after removal, C2 did not deliver its headline. [PROPOSAL]
- **G10.2** No hard-coded arithmetic around "2" survives: a hygiene-class scan for the
  literal in production-count contexts. The C1 law was "don't raise it, don't hard-code
  around it being permanent" (`LOT-CONTENT-EXPANSION-LOG.md:22-23`). [DOC]/[PROPOSAL]
- **G10.3** The refusal that C1 threw (`actions.ts:334-337`,
  "activeProductions at capacity (n/2)") becomes a **queue**, not a throw — and the
  message the player reads names what is waiting, what it needs, what occupies it, and
  how to relieve it (Owner law 2). Pass = the old throw path is unreachable and a
  named test asserts the four facts appear in the queue read model. [CODE]/[DOC]/[PROPOSAL]

### G11 — Economy re-measurement as a gate, not a report

`scripts/measure-c1-economy.mts → docs/economy/C1-ECONOMY-SNAPSHOT.md` is "deterministic
and byte-reproducible (PM re-ran: identical numbers, only the provenance HEAD line
moves)" (`LOT-CONTENT-EXPANSION-LOG.md:397-399`). [DOC] C2 must produce a C2 snapshot the
same way. **Gate**: the script reproduces byte-identically on two runs at the same HEAD;
the two C1 standing flags (Office III worst-value office; the Hall cannot pay back at the
current ceiling) are **re-answered at the new ceiling**, since the snapshot itself says
"concurrency-from-capacity will move these numbers; tune after that ruling, not before"
(`:414-416`). [DOC]/[PROPOSAL]

### G12 — Copy / quote-grammar gate

C1's one PM-playtest finding was a copy defect, not a behaviour defect: the move flow
reused the build template and promised "CONSTRUCTION CLOCK 6 weeks · completes Week 16"
for an instant move — "Behavior was honest; the copy was not (quote-grammar law)"
(`LOT-CONTENT-EXPANSION-LOG.md:497-502`). The red team was then pointed at that finding's
**family** and found "a six-item copy family" (`:530`). [DOC] C2 adds many new quote
contexts (build a stage, build a set, refurbish a set, reserve a set, join a queue,
premiere). **Gate**: every quote context is unit-pinned with its own facts; no template
line asserts a fact the context does not have. [PROPOSAL]

### G13 — Reinstate the D-16 harness suite in the floor

Per §1.2, `src/harness/d16/*.test.ts` (10 files) is outside the 241. **Gate**: either
add `src/**/*.test.ts` to the workspace `core` project and re-baseline the file/test
count with a named reason, or record in the charter that the D-16 harness is
deliberately out of the floor and say who runs it. Do not leave it ambiguous while C2
moves the economy. [CODE]/[PROPOSAL]

### G14 — Flake watch, carried forward

The hard trigger (third distinct flaking file), the reproduce-first rule, and the
"no assertion weakened" fix standard (`LOT-CONTENT-EXPANSION-LOG.md:425-463`) carry into
C2 unchanged. [DOC] C2-specific pre-emptive rule [PROPOSAL]: **any e2e assertion about a
moving body must wait on an engine-state predicate, never on an animation frame or a
timeout** — this is the C1 zoom-leg mechanism ("measures immediately after
`setViewportSize` … with no wait for Phaser's Scale Manager to settle") generalized to
theater. The sibling test's own comment is the house idiom: *"Waiting for it matters."*

---

## 3. RED-TEAM TARGET LIST

All `[PROPOSAL]`; the seam each attacks is cited. Run independently, adversarially, at a
named commit, on ≥ 5 named seeds, following §1.8. Deliver a **held list** as well as
findings.

### 3.1 Reservation exploits

- **R1 — Reserve-and-cancel churn.** `applyCancel` (`src/core/actions.ts:625-649`) is
  documented as "No refund (cash unchanged), no standing effect" — it is also **no
  penalty and no cost**. [CODE] Attack: greenlight → cancel → greenlight in a loop to
  hold, drop, and re-take the best stage/set every week, denying a competitor production
  (or a queued one) the resource forever at zero cost. Acceptance: either cancel carries
  a stated cost/cooldown, or the queue is provably immune to it (`R6`).
- **R2 — Demolish-under-reservation.** The guard is `facilityEngagements`
  (`placement.ts:806-869`) → `facilityMutationEligibility` (`:875-909`), which fails
  closed and asks even the "impossible" underConstruction case
  (`:893-896` "'it cannot happen' is exactly the assumption that stops being true
  without anyone noticing"). [CODE] Attack: every new C2 holder kind — a set reserved for
  a future phase, a stage held by a queued (not yet started) production, a scenery
  claim, a premiere booking — probed for a holder the predicate does not walk.
- **R3 — The F3 demolish-for-refund timing seam, now in C2 scope.** Recorded at
  `LOT-CONTENT-EXPANSION-LOG.md:523-525`: "(F3) Office II is demolishable the week
  Office III breaks ground for +$330,000 and zero downside — **requirements bind at quote
  time only**." [DOC] Verified: `DEVELOPMENT_OFFICE_3_BLUEPRINT.requires =
  [{kind:'facility', blueprintId:'development-office-2'}]` (`src/core/tuning.ts:690`),
  and the requirement predicate tests `placed.status === 'operational'`
  (`src/core/blueprintRequirements.ts:88`) — evaluated at query time, never re-checked
  after commit. [CODE] Attack in C2's larger catalog: build a prerequisite, break ground
  on the dependent, demolish the prerequisite for 50% (`FACILITY_DEMOLITION_REFUND_FRACTION
  = 0.5`, `tuning.ts:786`), and repeat down a longer C2 dependency chain (stage tiers, set
  tiers). Acceptance: `S3` below.
- **R4 — Queue-jumping via cancel/resubmit.** If queue position is derived from entry
  order, cancel-and-resubmit is a no-op; if it is derived from anything else (need,
  priority, readiness), cancel-and-resubmit is a lever. Attack both. Related: today's
  contention rule is **ascending production id** (`operations.ts:629`), which means a
  studio can manufacture priority by controlling id generation order.
- **R5 — Holding a stage with a zero-progress production.** Today a production **holds its
  reservations while blocked**: `enterPhase` on allocation failure returns
  `{advanced:false}` and only sets a blocker (`operations.ts:569-575`), leaving the
  current-phase reservations in place. [CODE] Attack: park a production in `shooting`
  forever by never scheduling the take (`scheduleShootingTake` is a **player action** —
  `operations.ts:306-326`, and `advanceManagedProductions` at `:651-653` explicitly does
  **not** advance at `remainingTicks === 5` unless the task is `scheduled`). That is a
  **player-controlled indefinite hold on a soundstage**, today, in C1 code. In C2, with
  contention real and stages scarce, it becomes a denial-of-service on your own studio —
  and, if any rival/queue logic exists, on the queue.
- **R6 — Reserve the scarce thing to deny it, not to use it.** Generalization of R1/R5:
  is there any state in which holding a resource costs nothing while it is held? If yes,
  optimal play is to hold everything.
- **R7 — Double-book across owner kinds.** Forge/drive a state where a production
  reservation and a script reservation name the same `facilityId:slot`. Today this is
  caught by `castingSessions.ts:512-521` for the casting/production pair and by
  `presence.ts:389-396` as a **soft projection withholding**, but
  `assertStudioOperationsInvariants` walks workflows only (`operations.ts:453`). [CODE]
  Attack every pair, including the new C2 kinds. Acceptance: `G1.1`.
- **R8 — Slot index out of range after a capacity change.** `assertStudioOperationsInvariants`
  bounds `slot < facility.capacity` (`operations.ts:481-484`). Attack: shrink a facility's
  capacity (a C2 downgrade/damage/decay path?) while slot `capacity-1` is reserved.
- **R9 — Identity reuse.** `nextPlacementId` is deliberately never rolled back on
  demolition (`placement.ts:1007-1009`, `:1053`). Attack the C2 analogues: set ids, stage
  ids, queue-entry ids, premiere ids — after demolish, after cancel, after migration.
  Law 20: "New IDs reserve against the longest-lived identity authority (productions,
  ledger, careers, tasks, **reservations**, canceled traces)"
  (`docs/SHIFT-OPERATIONAL-LAWS.md:46-48`). [DOC]
- **R10 — Move a stage/set out from under a queue.** Move is $0 and instant
  (`LOT-CONTENT-EXPANSION-LOG.md:482-483`). If layout affects travel cost/time (master
  plan §8.2, "layout visibly affects cost/schedule",
  `THE-MOVIES-PARITY-MASTER-PLAN.md:355`), then free instant moves are a free
  optimization loop: move everything adjacent for the shoot, move it back. Attack the
  arbitrage.
- **R11 — Capacity-0 stages and sets (the F2 shape, generalized).** See `S1`. Attack: any
  C2 entity that provides an *effect* but no *slot* is structurally unengageable and
  therefore always demolishable and always free to churn.

### 3.2 Deadlock, starvation, priority inversion

- **R12 — Circular wait.** Production A holds a soundstage and waits for a set; B holds
  the set and waits for a soundstage. Today's allocator is **all-or-nothing per phase
  entry** with retention of the soundstage across rehearsal→shooting
  (`operations.ts:132-171`), so A can genuinely hold a stage while blocked on
  `set-scenery` (the `remainingTicks === 6` blocker case is explicitly reachable —
  `operations.ts:535-537`). With Sets as scarce contended entities, this is a **real
  deadlock**, not a theoretical one. Acceptance: a test that constructs the cycle and
  asserts the system's ruled response (timeout? preemption? release-and-requeue?
  refuse-to-enter?) — and that the response is stated in the charter.
- **R13 — Starvation by id.** Contention resolves in ascending production id
  (`operations.ts:629`). A studio that keeps greenlighting new productions (which get
  later ids) is fine; but any *fixed* low-id production wins every tie forever, and a
  high-id one can starve indefinitely if contention is chronic. Attack with a long soak.
- **R14 — Priority inversion at wrap.** A production that has finished shooting but
  cannot get `post` **keeps holding the soundstage** (`operations.ts:569-575` — blocker
  set, reservations retained). One post bottleneck therefore freezes every stage. Attack:
  N productions, 1 post slot, and measure stage utilization. This is `G6.3`'s ruling in
  adversarial form and is, in my judgement, C2's most likely shipped deadlock.
- **R15 — The queue never drains.** Construct a state where the queue's head can never be
  satisfied while later entries could be — head-of-line blocking. Ruling required: does
  C2's queue skip, or block?
- **R16 — Soak.** The C1 red team ran "a 60-week × 5-seed soak"
  (`LOT-CONTENT-EXPANSION-LOG.md:539`). [DOC] C2's must be longer and must assert
  **liveness**, not just absence of crash: every greenlit production eventually releases,
  or the queue explains why not, for every seed.
- **R17 — Blocked-forever is legible.** For every blocked state reachable in the soak,
  the player-facing text names what is waiting, what it needs, what occupies it, and how
  to relieve it (Owner law 2, `00-C2-PLANNING-BRIEF.md:23-26`). A blocked state with no
  such sentence is a finding. [DOC]

### 3.3 Economy exploits

- **R18 — Queue-parking to dodge opex.** If a queued production pays no crew/talent/
  facility carrying cost, parking is free storage; if a *facility* can be mothballed into
  a queue-only state, opex is dodgeable. Note the existing opex derivation is history-
  exact across demolished buildings (`placement.ts:1370-1376`,
  `demolishedFacilityHistory` at `:1391-1414`) and the C1 red team held "historical opex
  reconciliation exact across demolished history"
  (`LOT-CONTENT-EXPANSION-LOG.md:532-533`) — C2 must hold the same across queue and set
  lifecycles. [CODE]/[DOC]
- **R19 — Premiere farming.** If a premiere confers standing/awareness, attack repeat
  premieres, re-premieres of the same film, premiering a cancelled/withdrawn film,
  premiering on a save/load boundary (`G7.3`), and premiering the cheapest possible film
  in a loop.
- **R20 — Set-refurbish arbitrage.** If sets decay and refurbish restores value, then
  refurbish cost must strictly exceed restored value per unit or "decay it, refurbish it"
  is an income stream. Direct analogue of the `FACILITY_DEMOLITION_REFUND_FRACTION < 1`
  invariant (`placement.ts:1113-1118`). [CODE]
- **R21 — Build-consume-demolish on Sets.** The F2 finding in set form: build a set for
  one shoot, demolish it for 50%, so the effective price of a set is half its catalog
  price. Whether that is a bug or a legitimate strategic option is an **Owner call**; the
  red team's job is to price it across 5 seeds and report. C1's precedent: refund farming
  was held "strictly lossy across 5 seeds × every cycle shape incl. mid-construction"
  (`LOT-CONTENT-EXPANSION-LOG.md:531-532`). [DOC]
- **R22 — Travel/layout gaming.** If layout affects cost/time, find the degenerate
  layout (everything jammed into one corner) and report whether it dominates. Corpus says
  the original made this a real mechanical variable [CORPUS] Bible `:39`, `:136`, `:209`.
- **R23 — Free-move arbitrage into the economy.** `FACILITY_MOVE_COST` is bounded
  `>= 0` and is currently $0 (`placement.ts:1119-1121`,
  `LOT-CONTENT-EXPANSION-LOG.md:482-483`). Combined with layout-affects-cost, a $0 move
  is a free optimizer. Report, do not fix.

### 3.4 Flip exploits

- **R24 — Migrated-save distinctions.** Master plan §6: "Migrated saves never experience
  the Flip retroactively; they simply own their founding placements"
  (`THE-MOVIES-PARITY-MASTER-PLAN.md:271-272`). [DOC] Attack: find any behavioural
  difference between a migrated pre-Flip studio and a post-Flip studio that has built the
  same buildings — different opex, different demolishability, different unlock state,
  different journey copy, different queue priority. Any difference that is not *ownership
  of a founding placement* is a finding. Note today's real difference: founding
  placements are excluded from move/demolish via
  `LEGACY_EXPANSION_PARCEL_ID`/`foundingPlacement` refusal
  (`placement.ts:884-891`) — C2's Flip changes exactly this, so it is the first place to
  look. [CODE]
- **R25 — Founding-mode abuse.** Can a player reach the Flip's "bare lot" starting
  conditions **after** founding (demolish everything) and get the Flip's starting cash /
  unlock treatment twice? Can a bare-lot studio be saved, migrated, and re-founded?
- **R26 — The reserved-ground law under the Flip.** `RESERVED_PARCEL_BLUEPRINTS`
  (`placement.ts:221-227`) and the `groundReserved` rejection (`:170`, `:580`) were F1's
  fix, ordered "after terrainUnbuildable and before occupied (a reservation is a permanent
  fact about ground; occupancy is one week's)"
  (`LOT-CONTENT-EXPANSION-LOG.md:546-548`). [DOC] The Flip makes founding buildings
  buildable; attack whether the reserved-parcel law survives, and whether the C1-accepted
  seam still stands: "`lotParcelInspectorContext(placement,'expansion')` still answers
  `canBuild:true` on a surface no route reaches… making the parcel projection
  reservation-aware moves a pinned shape and **belongs to the campaign that next touches
  that surface**" (`:571-575`) — **that campaign is C2.** [DOC]
- **R27 — Journey upstream stages.** With construction stages added upstream of
  `no-picture`, attack: demolish the development office mid-`drafting`; found, build,
  demolish, rebuild; a save taken between "no development office" and "office under
  construction". The C1 defect family is explicitly "overly strict closed-world
  predicates, duplicate-name assumptions, one-shot-per-studio workflows, re-entry after
  cancellation, stale identity assumptions, orphaned guidance references after building
  mutation" (`LOT-CONTENT-EXPANSION-LOG.md:15-18`) — all six apply here. [DOC]

### 3.5 Determinism attacks

- **R28 — Contended-reservation ordering.** Construct genuine ties (equal-priority
  productions, equal-quality sets, simultaneous queue entries) and prove the winner is
  the same across runs, machines, and save/load. Attack the ordering *inputs*: object key
  order, `Map` iteration order built from an unordered source, array order that depends
  on a UI list rather than a sorted id.
- **R29 — Save/load changes an outcome.** Take a save at each phase boundary, reload,
  continue; compare to the uninterrupted run byte-for-byte.
- **R30 — Presentation leaks into simulation.** Run N weeks headless vs. with the
  renderer; compare `state.rngState` and the full save. Any divergence violates law 23
  and Owner law 5. [DOC]
- **R31 — Two browser windows, one save.** Law 25's "compare across independent fresh
  windows over byte-identical saves" (`docs/SHIFT-OPERATIONAL-LAWS.md:63-65`) applied to
  the theater. [DOC]

### 3.6 Theater / truth divergence (Owner law 5 + law 8)

- **R32 — Animation showing work that isn't happening.** For each theater vocabulary
  item, construct the state where the *fact* is absent and assert the *animation* is
  absent: a person traveling to a stage with no reservation; scenery arriving for a
  production that is blocked; a stage lit while its reservation is released; a queue body
  standing for a queue entry that drained; bodies still on the lot after wrap. The C1
  precedent for the honest fallback is law 12: "Never invent physical world from a
  semantic destination; unauthored facilities get an honest semantic fallback"
  (`docs/SHIFT-OPERATIONAL-LAWS.md:29-30`). [DOC]
- **R33 — Animation completing work.** Law 2: "Animation may acknowledge a command, never
  complete one. No route timer, arrival, tween, or `update()` tick advances tasks/work/
  queues" (`docs/SHIFT-OPERATIONAL-LAWS.md:8-9`). [DOC] Attack: pause the renderer,
  throttle it, hide the tab, kill the canvas — the simulation must produce identical
  results. (The C1 log records a related false alarm: a "legacy renders black" diagnosis
  that "did not reproduce — it was the hidden-tab pause artifact",
  `TYCOON-WORLD-CONVERSION-LOG.md:419-421`. Hidden-tab behaviour is a known live
  variable.) [DOC]
- **R34 — Renderer failure gating legality.** Law 5: "Renderer failure ≠ illegal action.
  Never gate legality on renderer readiness" (`docs/SHIFT-OPERATIONAL-LAWS.md:13-14`).
  [DOC] Attack: with the theater failed/absent, every C2 verb must still be legal and
  every refusal must still be the engine's.

---

## 4. INHERITED-SEAM VERIFICATION

The brief routes four recorded C1 seams to C2 (`00-C2-PLANNING-BRIEF.md:64-68`), and
names PF1 charter §9 as the owner. **I could not read the PF1 charter** (§0). Below, each
seam's **C1-M8 / FMJ record** is pulled from documents in this worktree, its live code
site is verified, and a C2 acceptance criterion is proposed.

### S1 — F2: unengageable effect buildings

**Record.** `LOT-CONTENT-EXPANSION-LOG.md:520-523`: "(F2) effect buildings are
structurally unengageable (capacity 0 → no reservation can name them), so a timed
build→consume→demolish pays ~50% of catalog price — **the economy snapshot's paybacks
model a price no rational player pays**." [DOC]

**Verified in code.** Three of the five blueprints carry `capacity: 0` —
`DEVELOPMENT_OFFICE_2_BLUEPRINT` (`src/core/tuning.ts:653`),
`DEVELOPMENT_OFFICE_3_BLUEPRINT` (`:679`), `CRAFT_ANNEX_BLUEPRINT` (`:732`) — under a
header that states the design intent: "Effect-only buildings carry `capacity: 0`. They
are real buildings… but they provide no SHARED SLOT, so they never enter the capacity
registry the allocator scans" (`:633-638`). [CODE] Because `facilityEngagements` finds
holders only through reservations (`placement.ts:806-869`), a capacity-0 facility has
**no possible holder**, so `facilityMutationEligibility` (`:875-909`) never refuses it.
[CODE] Refund is exactly 50% (`FACILITY_DEMOLITION_REFUND_FRACTION = 0.5`,
`src/core/tuning.ts:786`; `facilityDemolitionRefund` at `placement.ts:987-989`). [CODE]

**C2 acceptance criterion** [PROPOSAL]. C2 must rule the seam one of three ways and pin
the ruling with a test:
1. **Engagement without capacity** — an effect building becomes engageable while its
   effect is being *consumed* (e.g. Office II is held while a screenplay it upgraded is
   drafting), so `facilityEngagements` returns a holder and demolition is refused. Pass =
   a test that demolishing Office II mid-draft is refused with a named reason, and that
   the same demolition **after** the draft completes succeeds.
2. **Priced churn** — the seam is accepted as strategy, and the economy snapshot is
   re-derived at the *effective* (churned) price rather than catalog price. Pass = the C2
   snapshot prints both prices and names which one the payback tables use.
3. **Cooldown/commitment** — an effect building carries a minimum standing term.
   Pass = bounded-term test on the term.

Whichever is chosen, the **standing acceptance criterion** is: `G3` bounded-term coverage
for any new constant, plus a red-team measurement (`R21`) of build→consume→demolish
across 5 seeds proving the ruled outcome is what actually happens.

### S2 — F4: whole-board-idle commission eject

**Record (twice).** M7 handoff: "the in-world commissioning workspace opens only when
`lotAttention` is idle, so a second screenplay cannot be commissioned FROM THE WORLD
while the first sits `readyToPackage` — the player is ejected to the full-screen Writers
Room. Not a defect against any accepted contract (the engine's shared slots allow it; the
world UI gates it), but under the hybrid interaction law it is **a casual eject for a
core action**, and it is the same SHAPE as the twice-found family. Belongs to C2's
concurrency ruling" (`LOT-CONTENT-EXPANSION-LOG.md:439-445`). M8 red team, sharpened:
"(F4) the in-world commission verb demands the WHOLE screenplay board idle (active-work /
review-required / ready-script, **at three seams**), so the Annex's and Hall's advertised
slots are unrealizable from the primary surface — this generalises the M7 handoff item
and is C2-concurrency scope" (`:525-528`). [DOC]

**Felt in the M8 playtest, and honestly communicated:** "with a screenplay
`readyToPackage`, the Development inspector does NOT dangle a dead commission verb — it
says 'Commissioning opens here again once it moves on,' a reason and a reopening promise
in the blocked-state grammar. The parallel-development limit stands (C2 concurrency
scope, already queued), but it is honestly communicated in-world; no silent eject on this
surface" (`:485-489`). [DOC]

**Why it is squarely C2's.** The advertised slots are real engine capacity —
`DEVELOPMENT_CASTING_HALL_BLUEPRINT` has `capacity: 2` (`src/core/tuning.ts:705`) and its
`effectSummary` promises "Adds two shared Development & Casting slots, so two more
screenplays or auditions can run at a time" (`:715-716`). [CODE] The engine will allocate
them (`allocateScriptReservation`, `src/core/scriptDevelopment.ts:173-198`); the world UI
will not let the player ask. That is a **product lie in an `effectSummary`**, which the
no-decorative-blueprints invariant (`placement.ts:1184-1192`) cannot catch because the
sentence is true of the engine.

**C2 acceptance criterion** [PROPOSAL]:
1. From the **world surface**, with one screenplay in each of `drafting`, `review`, and
   `ready` (the three seams named in the record), the commission verb is **available** so
   long as a Development & Casting slot is free, and the player is **not ejected** to a
   full-screen room.
2. A named e2e on the grid origin (5179) proves it in one continuous session: build the
   Hall → commission screenplay #2 from the world while #1 sits `ready` → both progress.
3. A unit test asserts the availability predicate is a function of **free slots**, not of
   board idleness — and that the predicate is the same one the engine uses
   (`availableDevelopmentCastingSlots`, `src/core/scriptDevelopment.ts:158-171`), not a
   re-derivation. [CODE]
4. The blocked-state grammar survives for the genuinely-blocked case (no free slot): the
   sentence must name the occupying work and the relief (Owner law 2).

### S3 — F3: demolish-for-refund timing

**Record.** `LOT-CONTENT-EXPANSION-LOG.md:523-525`: "(F3) Office II is demolishable the
week Office III breaks ground for +$330,000 and zero downside — **requirements bind at
quote time only**." [DOC] (The brief assigns this seam to C2 explicitly:
`00-C2-PLANNING-BRIEF.md` names F3 among the recorded C1 seams routed to C2, `:66-67`.)

**Verified in code.** `blueprintRequirementMet` for `kind: 'facility'` resolves via a
predicate on `placed.blueprintId === blueprintId && placed.status === 'operational'`
(`src/core/blueprintRequirements.ts:88`), evaluated inside `evaluateBlueprintRequirements`
(`:170`) at **query** time. Nothing re-evaluates it after commit, and
`facilityEngagements` does not treat "is a prerequisite of an in-flight construction
project" as a holder (`placement.ts:806-869`). [CODE] Refund = 50% of $600,000 = $300,000
for Office II (`tuning.ts:658` capex `600_000`; `:786` fraction `0.5`) — the record's
"$330,000" presumably includes avoided opex; **I could not reproduce the exact $330,000
from constants alone and flag it in §6 as an unreconciled figure.**

**C2 acceptance criterion** [PROPOSAL]:
1. A prerequisite facility is a **holder** of any construction project that requires it,
   for as long as that project is `underConstruction`. Pass = `facilityEngagements`
   returns a `constructionPrerequisite` holder kind, demolition is refused with a named
   reason in the blocked-state grammar, and the refusal is byte-neutral.
2. Alternatively, requirements are **re-checked at completion**, and a dependent project
   whose prerequisite vanished fails with a stated, non-silent outcome (refund? stall?
   the charter must say). Pass = a test per outcome branch.
3. Either way: a red-team measurement (`R3`) across 5 seeds proving the chain
   build-A → break-ground-B → demolish-A is **strictly lossy or refused**, extended down
   C2's longer stage/set tiers.
4. The C1 anti-farming invariant is extended to every new refundable C2 entity
   (`placement.ts:1113-1118` pattern). [CODE]

### S4 — `FilmResult.releaseTick` off-by-one-week copy

**Record.** `FIRST-MOVIE-JOURNEY-HANDOFF.md:72-74`: "(pre-existing) `FilmResult.releaseTick`
reads one week behind in-hand week in 'released N weeks ago' copy". [DOC]

**Verified in code.** `releaseTick` is stamped with the tick that is *being resolved*:
`buildFilmResult(result, { productionId: prod.id, releaseTick: currentTick, … })`
(`src/core/tick.ts:330-333`). The read-side derives
`weeksAgo: Math.max(0, week - f.releaseTick)` (`ui/src/engine/adapter.ts:6476`, and
`latestWeeksAgo` at `:6477`), where `week` is the post-tick visible week. The renderer
then prints it: `buildingInspector.ts:640-645` — `weeksAgo === 0` gets one phrasing,
otherwise "`released ${weeksAgo} week(s) ago`". Because the tick that releases the film
advances the visible week, a film released *this* week reads as released **1 week ago**.
The same value drives behaviour, not just copy: `vignettes.ts:289-290` filters
`f.weeksAgo <= REACT_RECENT_WEEKS` to choose which film the world reacts to. [CODE]

**Why C2 owns it.** Premiere Night (`G7`) introduces a second week-authority for the same
event. Shipping Premiere Night on top of an already-off-by-one release week guarantees
two disagreeing "when did this film come out" answers on the same screen.

**C2 acceptance criterion** [PROPOSAL]:
1. One named week authority for a release. Pass = a unit test that, for a film released
   in visible week W, **every** surface — inspector copy, vignette recency filter,
   `StudioRunRecap`, `Autopsy`/`ReleaseResult` "Studio standing change for Week X"
   (`ui/src/screens/Autopsy.tsx:609`, `ReleaseResult.tsx:164`), `FilmPoster` "Released
   Week N" (`ui/src/components/FilmPoster.tsx:186`), and Premiere Night — prints W.
   [CODE]
2. `weeksAgo === 0` on the week of release, asserted on the golden path in the browser,
   not only in a unit test.
3. **Byte-neutrality of the fix.** If the fix moves `releaseTick` itself, every save
   round-trip and the §15.7 replay test must be re-derived and the change must be
   declared a save-shape change (V14 concern). If instead the fix moves the *read-side*
   arithmetic, `state` bytes must be unchanged — assert it.

### S5 — 480×270 / DSF2 below-fold placement

**Record.** `TYCOON-WORLD-CONVERSION-LOG.md:430-432`: "P3-4 480×270/DSF2
world-below-fold (**pre-existing, byte-identical on plate**) — recorded, not this shift's
regressions, next-leverage candidates."
`TYCOON-WORLD-CONVERSION-HANDOFF.md:87-89`: "Pre-existing (proven on the plate too, not
this shift's regressions): … 480×270/DSF2 places the world **below the fold**".
`FIRST-MOVIE-JOURNEY-HANDOFF.md:73-74` lists it among carried pre-existing items. [DOC]

**Verified in code.** The 480×270/DSF2 legs are real and asserted today, but they assert
*overlay/workspace* reachability rather than world visibility:
`ui/e2e/lot-retained-audition-planning-v1.spec.ts:597` asserts
`{layoutWidth: 960, visualWidth: 480, visualHeight: 270}` and `:617-618` runs a whole
describe at that viewport with `deviceScaleFactor: 2`;
`lot-retained-commission-workspace-v1.spec.ts:472,482-484` does the same, titled
"480x270 CSS pixels at DSF2 retain one bounded reachable workspace and the same canvas";
`greenlight-production-formation-v1.spec.ts:1167-1168` likewise. [CODE] Law 26 requires
verification at "960×540, 1280×720, **480×270/DSF2**, effective 200%, grayscale, forced
colors with real pointer hits + screenshot review"
(`docs/SHIFT-OPERATIONAL-LAWS.md:81-83`). [DOC]

**Why C2 owns it.** C2's headline player feeling is "I can **physically watch** it
manufacture multiple movies" (`00-C2-PLANNING-BRIEF.md:17-18`). A configuration where the
world is below the fold is a configuration where the campaign's headline is unreachable.
C1 could defer it because C1's value was legible in DOM chrome; C2's is not.

**C2 acceptance criterion** [PROPOSAL]:
1. At 480×270 CSS px / DSF2, the world canvas is **at least partially in the initial
   viewport without scrolling**, and the queue/occupancy read model is reachable — proven
   by a real pointer hit plus a screenshot at that viewport, following law 26.
2. If the Owner rules the configuration out of support, that is a **recorded scope
   decision** and the existing 480×270 legs stay as workspace-reachability tests with the
   world exclusion stated in the spec. Do not leave it as an unowned carry for a third
   campaign.
3. Either way: the plate-origin (5178) legs must not move (`G9.4`).

---

## 5. OWNER PLAYTEST SCRIPT — C2 [PROPOSAL]

House style: master plan §9's C1 script (`THE-MOVIES-PARITY-MASTER-PLAN.md:532-538`) —
a sequence of imperatives, a one-sentence PASS, a one-sentence FAIL. Target 15–20 minutes,
by hand and by eye, in Chrome, on shipped defaults, on a **virgin named seed**, at a
named HEAD, with no fixture injection (the C1-M8 precedent:
`LOT-CONTENT-EXPANSION-LOG.md:465-495`, "Fresh studio in Chrome at HEAD `c351086`, virgin
seed `ochre-gate-08`, dev server, by hand and by eye"). [DOC]

**Owner playtest script (15–20 min).**

> Found a fresh studio on a **bare lot** — Gate, Administration, a road, and grass →
> read what the studio tells you to do first, and do it: **build a development office**
> → while it goes up, look at the empty ground and decide where the stages go →
> **build a soundstage**, and **build a set** on it, choosing one whose genre you mean to
> make → commission a screenplay → notice the script **names the set it needs**, by name
> → greenlight → **watch the lot go to work**: people leave the offices, scenery arrives
> at the stage because *that* picture needs it, the stage reads as occupied → greenlight a
> **second** picture and watch it **queue** — read what it is waiting for, what is holding
> the thing it wants, and what you would have to build to relieve it → **build the second
> stage** and watch the queue drain → advance to **wrap** and see the stage empty and the
> crew leave → carry the first picture to **Premiere Night** and watch it → finally, look
> at the whole lot with two pictures in flight and ask whether you built this.
>
> **Pass = "I built this studio, and I can physically watch it manufacture multiple
> movies — the second picture waited for a reason I could see, and I fixed it by
> building."**
>
> **Fail = "the queue is a number in a panel"**, or **"the animation is a screensaver —
> things moved that had nothing to do with my pictures."**

**Named sub-checks the Owner should be able to answer YES to, in order** (each maps to a
gate or a law, so a NO is traceable):

| # | Question the Owner answers by playing | Traces to |
|---|---|---|
| 1 | On the bare lot, did the studio tell me what to build first, in its own voice? | `G5.1`, master plan §6 line 253-255 [DOC] |
| 2 | Did I choose where the stages went, and did the choice feel like it mattered? | §8.2 "layout visibly affects cost/schedule" [DOC] |
| 3 | Did the screenplay name the set by name? | §8.2 "a script requires the set by name" [DOC] |
| 4 | When work started, did the *right* people go to the *right* buildings? | Owner law 8, `G8.4`, `R32` |
| 5 | Did the second picture **queue** rather than be **forbidden**? | Owner law 2, `G10.3` |
| 6 | Could I read, in-world, what it was waiting for and what would relieve it? | Owner law 2, `R17` |
| 7 | Did building the second stage actually drain the queue, that week? | `G10.1`, `R15` |
| 8 | At wrap, did the stage empty and the resources come back? | `G6.3`, `R14` |
| 9 | Was Premiere Night worth stopping to watch, with no movie footage? | Owner law 7, `G7` |
| 10 | Did anything move on screen that I could not explain by something my studio was doing? | Owner law 5/8, `R32` — **a single YES here is a FAIL of the campaign's central law** |

**Blocked-state honesty check** (the C1-M8 playtest's sharpest moment was a *refusal* that
felt right — "genuine parcel pressure, discovered by play, felt like a tycoon decision",
`LOT-CONTENT-EXPANSION-LOG.md:478-482`) [DOC]: at least one refusal or block must occur
naturally during the script, and it must state a reason and a way forward. A script that
never hits a wall has not tested the campaign's second Owner law.

---

## 6. RISKS, GAPS, AND CONTRADICTIONS (loud, unresolved)

**W1 — The brief and the code disagree about whether "wrap" exists.** The brief says C2
inherits "the authoritative **wrap** transition (shooting → post **does not exist
today**)" (`00-C2-PLANNING-BRIEF.md:65-66`) [DOC]. The code performs a
shooting→postProduction phase transition today: `productionPhaseForRemainingTicks` maps
`3|2 → postProduction` (`src/core/operations.ts:67-69`), `requirementsForPhase` maps
`postProduction → ['post']` (`:88-89`), and `enterPhase` reallocates at that boundary,
which releases the soundstage and set-scenery reservations
(`src/core/operations.ts:663-684`, `:590-596`). `grep -i '\bwrap\b' src/core/*.ts`
returns **zero** hits. [CODE] Both statements can be true if "wrap" means an
*authoritative event/emission* rather than a *state transition* — which is consistent
with the brief's own event-model docket ("engine emits no events today — UI diffs state",
`:63-64`). **I am not resolving this.** The C2 charter must define "wrap" precisely,
because `G6.3`, `R14`, `G8.4` and the playtest's question 8 all hang on it.

**W2 — The PF1 charter was not readable from my scope.** My lane forbids touching
`/Users/bruce/The Movies - Professional Floor`. Every "PF1 charter §9 assigns this seam
to C2" statement in §4 rests on the brief (`00-C2-PLANNING-BRIEF.md:61-68`) plus the C1
records, not on the charter. If the charter's §9 says anything different about seam
ownership or about the theater's proof obligation, §4 and `G8` must be reconciled against
it before the charter freezes.

**W3 — The regression floor cannot be re-run in this worktree.** No `node_modules`;
`npx vitest list` fails to resolve `vitest/config`. Every number in §1 is quoted or
derived, none executed. C2-M0's first act must be to reproduce `241/3,318` and
`211/207/4/0` at HEAD. Law 27(d): "stale balance certifications — re-run gates at HEAD"
(`docs/SHIFT-OPERATIONAL-LAWS.md:91`). [CODE]/[DOC]

**W4 — Ten test files sit outside the sealed floor.** `vitest.workspace.ts`
(`core` → `tests/**` only) supersedes `vitest.config.ts` (`src/**` + `tests/**`), so
`src/harness/d16/*.test.ts` × 10 is not in the 241. Arithmetic confirms:
`103 (tests) + 138 (ui) = 241`. [CODE] This is a floor definition ambiguity in the
campaign that is about to move the economy. See `G13`.

**W5 — `SHIFT-OPERATIONAL-LAWS.md`'s trailer is stale, and the brief already knows.**
Its planning note says "Current save = V11 (`save.ts:218`, `makeSave` → V11 at
`save.ts:3516`)" (`docs/SHIFT-OPERATIONAL-LAWS.md:99-101`), while the live version is
**V13** (`src/core/save.ts:3648-3662`). [CODE] The brief flags this and says PF1-M2
corrects the doc (`00-C2-PLANNING-BRIEF.md:78-79`) [DOC]. **Risk:** if PF1-M2 is KILLED,
C2 inherits a governing document whose stated save version is two versions behind while
C2 is writing a V13→V14 migration. C2 must re-verify the correction landed before relying
on law 18/19's line references.

**W6 — Law 25's own tuples are labelled pre-M1.5 history in one document and live in
another.** `docs/SHIFT-OPERATIONAL-LAWS.md:64-76` says "The 30/13, 34/15, 42/19 and 54/25
plate tuples quoted here are **PRE-M1.5 history**" and points to
`ui/playwright.config.ts` for live values; the config itself records **two prior
doc-drift repairs** where its own table disagreed with the specs. [CODE]/[DOC] C2 will
move grid tuples (theater adds dynamic actors). **Risk:** a third drift. `G9.1` exists
specifically to prevent it, and the charter should name **one** owner for the tuple table.

**W7 — The F3 figure "$330,000" does not reconcile to the constants I can see.** The
record says demolishing Office II the week Office III breaks ground yields "+$330,000"
(`LOT-CONTENT-EXPANSION-LOG.md:523-524`) [DOC], but `capex 600_000`
(`src/core/tuning.ts:658`) × `FACILITY_DEMOLITION_REFUND_FRACTION 0.5` (`:786`) =
**$300,000** [CODE]. The $30,000 gap is presumably avoided weekly opex ($2,500/wk ×
12 weeks of Office III's build = $30,000 — `tuning.ts:659` `weeklyOperatingCost: 2_500`,
`:683` `buildWeeks: 12`), which fits exactly, but the record does not say so. I am
**not** resolving it: the C2 red team should re-derive the number and state its
composition, because `S3`'s acceptance criterion is priced against it.

**W8 — A player-controlled indefinite soundstage hold exists in C1 code, today.**
`advanceManagedProductions` does not advance a production at `remainingTicks === 5`
unless its shooting task is `scheduled` (`src/core/operations.ts:651-653`), and
`scheduleShootingTake` is a player action (`:306-326`). A production parked in `shooting`
holds its soundstage and set-scenery reservations indefinitely. [CODE] Under C1's
2-production ceiling and 2 founding stages this is harmless; under C2's contention it is
`R5`/`R14`. This was **not** on the C1 red team's held list and I found no record of it
being probed — treat as an unexamined seam, not a known-held one.

**W9 — Cross-owner double-booking currently fails *soft*, not closed.** The union is
enforced by three cooperating sites (`operations.ts:485-487` for workflows;
`castingSessions.ts:512-521` for the casting/production pair; `presence.ts:389-396` which
merely **withholds a person from the projection** when a slot is "claimed by more than one
owner"). [CODE] Law 22 asks for ONE union at every boundary
(`docs/SHIFT-OPERATIONAL-LAWS.md:51-53`) [DOC]. C2 multiplies the owner kinds; without
`G1.1` the failure mode of a C2 double-book is *a person quietly disappearing from the
lot*, which is precisely the class of silent one-way defect F1 was.

**W10 — The Theater's landmark-vs-buildable call is still open, and Premiere Night
depends on it.** Master plan §6 marks the Theater "LANDMARK (lean)" with "Final call at
the Founding Flip design review — an explicit open decision, not silently settled"
(`THE-MOVIES-PARITY-MASTER-PLAN.md:225`) and §10 lists it as still-required Owner input
(`:574-576`). [DOC] Owner law 7 puts Premiere Night V1 in C2
(`00-C2-PLANNING-BRIEF.md:38`) [DOC]. If premieres happen at the Theater and the Theater
is not on a bare Flip lot, `G5.1` and `G7` conflict. Needs an Owner ruling before the
charter freezes.

**W11 — The `expansion` parcel projection seam was explicitly deferred to "the campaign
that next touches that surface" — which is C2.** `LOT-CONTENT-EXPANSION-LOG.md:571-575`:
"`lotParcelInspectorContext(placement,'expansion')` still answers `canBuild:true` on a
surface no route reaches (no hotspot, no rail row) with the engine refusing regardless —
making the parcel projection reservation-aware moves a pinned shape and belongs to the
campaign that next touches that surface." [DOC] C2's Flip touches exactly that surface.
Carried into `R26`.

**W12 — The 480×270/DSF2 seam has now been carried by three campaigns.** It is recorded
as pre-existing in the tycoon conversion (`TYCOON-WORLD-CONVERSION-LOG.md:430-432`), in
that shift's handoff (`:87-89`), and in the FMJ handoff
(`FIRST-MOVIE-JOURNEY-HANDOFF.md:73-74`). [DOC] A third carry with no owner is how a
"known limit" becomes a permanent one. `S5` proposes forcing the decision in C2 — support
it or scope it out, but stop carrying it.

---

## 7. OWNER DECISIONS THIS LANE NEEDS

1. **What "wrap" is** — an event, a transition, or both (W1). Everything in `G6.3`,
   `R14`, `G8.4` and playtest question 8 depends on the answer.
2. **The blocked-at-wrap rule** — does a production that cannot get `post` keep holding
   the soundstage (today's behaviour, `operations.ts:569-575`) or release and requeue?
   This is the single most likely shipped deadlock in C2 (`R14`).
3. **The contention tie-break rule** — keep ascending-production-id
   (`operations.ts:629`) or replace it, and state it in the charter so `G2.3` can pin it.
4. **The F2 ruling** (`S1`): engagement-without-capacity, priced churn, or commitment term.
5. **The Theater's landmark-vs-buildable call**, because Premiere Night depends on it
   (W10).
6. **480×270/DSF2**: supported, or explicitly out of scope (W12, `S5`).
7. **Is the D-16 harness suite in the regression floor?** (W4, `G13`).
8. **Cancel's price.** Free cancellation (`actions.ts:625-627`) is the enabling condition
   for `R1`, `R4` and `R6`. Under C1's ceiling it cost nothing; under C2's contention it
   is a lever.

---

*Lane 12 report. Planning only. No file outside this one was created or modified.*
