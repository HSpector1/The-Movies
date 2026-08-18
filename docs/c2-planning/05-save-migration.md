# C2 ADVANCE PLANNING — LANE 5: SAVE / SCHEMA & MIGRATION ANALYSIS

> Planning artifact. **No implementation.** Base = sealed C1 `main` @ `f294077`, read in the
> worktree `/Users/bruce/The Movies - C2 Planning` (branch `c2-sets-throughput-plan`).
> Every load-bearing claim below is tagged **[CODE]** (observed in this tree at this commit),
> **[CORPUS]** (the read-only evidence corpus at `/Users/bruce/Desktop/Big Swing Art/`),
> **[DOC]** (a governing document in this repo or the shared brief), or **[PROPOSAL]**
> (this lane's recommendation — not yet law, and never presented as observation).
>
> All line numbers are as of `f294077`. Repo paths contain spaces.

---

## 0. Headline

**[PROPOSAL]** C2 needs **one** save version bump if C2 ships whole (**V14**), or **two** if the
Owner takes the C2a/C2b split (**V14 = Sets/Stages/Throughput**, **V15 = Founding Flip**). The
schema work is not the hard part. The hard part is that **three engine invariants that C1 sealed
are incompatible with the Founding Flip as written**, and they are invariants the *save validator
itself* runs — so a flipped studio is not merely unrepresented, it is **unloadable**:

1. **[CODE]** `assertStudioOperationsInvariants` requires a managed studio to own at least one
   facility of each of the four capabilities `development-casting`, `soundstage`, `set-scenery`,
   `post` (`src/core/operations.ts:364-371`). A Gate + Admin bare lot owns none of them.
2. **[CODE]** The `placement-v12` facility policy requires the operations facility list to be
   *exactly* `[...INITIAL_STUDIO_FACILITIES, ...operational placements]`, positionally
   (`src/core/operations.ts:413-437`, with `INITIAL_STUDIO_FACILITIES` at
   `src/core/operations.ts:21-32`). A flipped studio has an empty prefix.
3. **[CODE]** `activateStudioOperations` installs all five initial facilities wholesale and has no
   other arm (`src/core/actions.ts:1273-1279` → `initialManagedStudioOperations`,
   `src/core/operations.ts:48-54`).

These are reached from the save path: `validateSaveV13` → recursive frozen validators →
`checkOperationsState` (`src/core/save.ts:2178`, `3666-3680`). **So the founding-mode marker is
not a UI flag or a cosmetic root — it is a validation-policy discriminant that the operations
invariant must consult.** That is the single most consequential finding in this lane and it is
covered in §2.6 and §7-R1.

---

## 1. SaveFileV13 as it stands

### 1.1 The envelope and the version union

**[CODE]** A save is a four-key envelope, identical in shape for every version:

```
{ saveVersion, seed, state, broadcastCache }
```

- `SaveFileV13` — `src/core/save.ts:267-272`. `state: GameStateV13`.
- The `SaveFile` union spans V1..V13 — `src/core/save.ts:275-288`.
- `GameStateV13 = GameStateV12 & { property: PropertyState }` — `src/core/types.ts:1208-1210`;
  `GameState = GameStateV13` — `src/core/types.ts:1212`.

**[CODE]** Three version-agnostic divergence rules are enforced for *every* version by
`checkEnvelope` (`src/core/save.ts:360-390`):

1. `typeof envelope.seed === 'string'` and `state.seed === envelope.seed`;
2. `broadcastCache` and `state.broadcastItems` are both arrays;
3. `deepEqual(broadcastCache, state.broadcastItems)` — the mirror must be exact.

**[CODE]** `stableStringify` (`src/core/save.ts:296-329`) is the byte-identity primitive:
lexicographic key sort, array order preserved, JSON-representable subset only. `exportSave`
validates *then* stringifies (`src/core/save.ts:4402-4405`); `importSave` parses then validates
(`src/core/save.ts:4409-4417`).

### 1.2 The V13 root inventory

**[CODE]** `V13_STATE_KEYS = [...V12_STATE_KEYS, 'property']` (`src/core/save.ts:3530`), built by
accretion from `V8_STATE_KEYS` (`src/core/save.ts:745-763`) through
`V9_STATE_KEYS` (`:2597`), `V10_STATE_KEYS` (`:2870`), `V11_STATE_KEYS` (`:3093`),
`V12_STATE_KEYS` (`:3338`). The complete live root set, with the version that owns each:

| Root | Owner version | Type site | Notes |
|---|---|---|---|
| `seed`, `rngState`, `market`, `era`, `studio`, `talent`, `concepts`, `broadcastItems`, `coverageContexts` | V1/V2 | `types.ts:451-465` | `studio.activeProductions` / `studio.releasedFilms` live here |
| `founding`, `contracts`, `ledger`, `freeAgents` | V3 | `types.ts:466-474` | `founding: FoundingState \| null` |
| `theatricalRuns` | V4 | `types.ts:475-482` | |
| `careerEvents` | V5 | `types.ts:483-495` | |
| `economyEngagedEver` | V6 | `types.ts:496-517` | the ONE field re-validated by type at V6 (`save.ts:619-628`) |
| `publicity` | V7 | `types.ts:518-520` | |
| `operations` | V8 | `types.ts:581-591` | mode / facilities / workflows |
| `scriptDevelopment` | V9 | `types.ts:636-…` | |
| `castingSessions` | V10 | `types.ts:730-732` | |
| `construction` (+ optional `cashLedgerCheckpoint`) | V11 | `types.ts:759-782` | the only OPTIONAL root, `save.ts:3094` |
| `placement` | V12 | `types.ts:1019-1023, 1115-1118` | + widened `ledger` |
| `property` | V13 | `types.ts:1197-1210` | bounds / roads / parcels / structures |

**[CODE]** Ledger kinds accrete the same way — `LEDGER_KINDS` (9 base) →
`V11_LEDGER_KINDS` (+`constructionCapex`) → `V12_LEDGER_KINDS` (+`facilityOpex`) →
`V13_LEDGER_KINDS` (+`facilityDemolitionRefund`) at `src/core/save.ts:802-818`; type side at
`src/core/types.ts:352-384` and `LedgerEntryV10/V11/LedgerEntry` at `:368-410`.

### 1.3 Strict-current / permissive-historical

**[DOC]** Operational law 18 (`docs/SHIFT-OPERATIONAL-LAWS.md:41-42`): *"V12/V13 saves: positive
projection (enumerate owned roots, no clone-then-delete); strict current version, permissive
historical repair."* Sourced to `LL BY (2072)` and `LL BP (1956)`.

**[DOC]** `LL BP` (`docs/LESSONS-LEARNED.md:1956-1968`): a shared normalization path repaired
malformed forecast segments *in a claimed current save*. Resolution: *"permissive historical
reader, strict current writer contract"*; anti-pattern: *"one forgiving parser for every declared
version."*

**[CODE]** How that lands in the code, precisely — this is the pattern C2 must copy:

- **V1-V7 validators are deliberately loose.** They check the envelope only and do *not* close
  the state key set: `validateSaveV1` (`save.ts:526-541`) through `validateSaveV7` (`:695-712`)
  call `checkEnvelope` plus the three historical-boundary guards, then cast. The comment at
  `save.ts:392-395` states the intent: *"V1–V7 intentionally retain their historical tolerance for
  unrelated additive fields."*
- **V8 onward is exhaustively structural.** `checkV8LiveState` (`:1975`), `checkOperationsState`
  (`:2178`), `checkScriptDevelopmentShape` (`:2715`), `checkCastingSessionsShape` (`:2952`),
  `checkConstructionShape` (`:3161`), `checkPlacementShape` (`:3391`), `checkPropertyShape`
  (`:3555`).
- **Exact-own-key closure.** `v12ExactKeys(value, required, label, optional = [])`
  (`save.ts:3350-3367`) rejects *missing required* and *unknown present* keys. This is the
  code-side of law 17 / `LL FM` (`docs/LESSONS-LEARNED.md:3447-3455`) — *"exact keys + exact
  values for closed presentation receipts/read models."* **[GAP]** It iterates `Object.keys`, not
  `Reflect.ownKeys`, so symbol keys are not enumerated here; symbol keys cannot survive JSON, so
  the save boundary is safe, but a C2 read-model boundary must use `Reflect.ownKeys` per LL FM.
- **The current validator is recursive-by-peeling.** `validateSaveV13` (`save.ts:3648-3689`)
  strips `property`, re-wraps the remainder as a synthetic V12 envelope, and calls
  `validateSaveV12WithPolicy(…, 'property-v13')` (`:3667-3675`), then checks the property shape,
  then runs **one** domain authority over the whole state:
  `assertStudioPlacementInvariants(state)` (`:3684`).
- **The policy thread is how a live admission is prevented from leaking backwards.**
  `LiveStateValidationPolicy` (`save.ts:823-832`) has four arms; `'property-v13'` differs from
  `'placement-v12'` *in exactly one way* — it admits `facilityDemolitionRefund` ledger rows — and
  `validateSaveV12WithPolicy` only skips `rejectV13AuthorityAtHistoricalBoundary` and the
  placement re-proof when the policy is the live one (`save.ts:3487-3489`, `:3510-3519`). A
  genuine V12 file is still validated under `'placement-v12'` and still refuses the row.

### 1.4 Historical-boundary guards (law 19)

**[DOC]** Law 19 (`docs/SHIFT-OPERATIONAL-LAWS.md:43-45`): *"Copy the historical-boundary guard
pattern verbatim for new roots (see `save.ts:351–378` construction rejection at pre-V11;
`migrateToV11` downgrade refusal `save.ts:4240–4253`). `LL CO (2290)`, `LL CS (2336)`."*

> **[DOC][RISK] The two line pointers in law 19 are STALE at `f294077`.** The construction
> rejection is now `src/core/save.ts:396-434`; `migrateToV11` is now `src/core/save.ts:5235-5243`.
> `save.ts:351-378` is currently the tail of `deepEqual` and the head of `checkEnvelope`. See §7-R9.

**[CODE]** Three guards exist, each a verbatim copy of the prior one one version on:

| Guard | Lines | What it refuses at a pre-version boundary |
|---|---|---|
| `rejectV11AuthorityAtHistoricalBoundary` | `save.ts:396-434` | own key `construction`; own key `cashLedgerCheckpoint`; any ledger row with `kind === 'constructionCapex'` **or** an own `constructionProjectId`; any `operations.facilities[]` entry whose `id === ANNEX_FACILITY_ID` |
| `rejectV12AuthorityAtHistoricalBoundary` | `save.ts:441-486` | own key `placement`; any `facilityOpex` ledger row; any `constructionCapex` row whose `constructionProjectId !== ANNEX_PROJECT_ID`; any facility id starting with a catalog blueprint's `facilityIdBase` |
| `rejectV13AuthorityAtHistoricalBoundary` | `save.ts:498-521` | own key `property`; any `facilityDemolitionRefund` ledger row |

**[CODE]** Each of `validateSaveV1..V7` calls **all three** (e.g. `save.ts:537-539`). V8-V10 call
them inside their policy wrappers; V11/V12 close their key set exactly, so a grafted `property`
root is refused by `v12ExactKeys` before the guard is even reached — proven at
`tests/property-state-v13.test.ts:851-873`, which asserts BOTH failure modes explicitly:
`/state\.property belongs only to SaveFileV13/` for V1-V7 and `/state has unknown field "property"/`
for V11/V12.

**[CODE]** The three-part signature of a well-formed guard, which C2 must reproduce:
1. **the root key itself** (always);
2. **every new ledger kind** the version owns (V11: `constructionCapex`; V12: `facilityOpex`;
   V13: `facilityDemolitionRefund`);
3. **every new identity the version can mint** that leaves a trace outside its own root (V11: the
   Annex facility id inside `operations.facilities`; V12: any catalog `facilityIdBase` prefix).

The V13 guard's own comment (`save.ts:494-497`) says why it has only two parts: *"V13 adds no new
ledger kind and no new facility identity: a property leaves no trace anywhere else in the state,
so there is no second place a historical boundary could leak it."* **[PROPOSAL]** C2's roots do
NOT have that property (Sets mint facility-like ids and reservations correlate to ledger rows), so
C2's guard is a three-part guard, closer to V12's than to V13's.

### 1.5 `migrateToVn` downgrade refusal

**[CODE]** Every retained historical migrator refuses to *downgrade*:

- `migrateToV4/5/6/7` use `save.saveVersion > n` (`save.ts:5113-5117`, `:5134-5138`,
  `:5150-5154`, `:5167-5171`).
- `migrateToV8/9/10/11/12` enumerate the newer versions explicitly (`save.ts:5180-5190`,
  `:5199-5208`, `:5217-5225`, `:5236-5240`, `:5250-5254`). **[RISK]** The enumerated form must be
  edited in five places for every new version; the `>` form would not. This is a real,
  repeated-by-hand maintenance surface — see §7-R10.
- `migrateToV13` (`save.ts:5263-5266`) is the live load-to-play entry: V13 passes through by
  identity, everything else crosses the whole frozen chain.

**[CODE]** `migrateToV11`'s refusal message is the canonical wording law 19 points at:
`"migrateToV11: cannot downgrade SaveFileV${n} or discard placement and property state"`
(`save.ts:5237-5239`).

### 1.6 Positive projection on export (law 18)

**[DOC]** `LL BY` (`docs/LESSONS-LEARNED.md:2072-2080`): *"spreading current state and deleting
today's newest field lets tomorrow's unknown root leak into a historical schema … versioned
positive allowlists. Anti-pattern: clone-all-then-delete-known-new-fields."*

**[CODE]** Every frozen builder enumerates its roots positively:
`projectStateV1` (`save.ts:3726-3738`) … `projectStateV11` (`:3902-3929`),
`projectStateV12` (`:3941-3969`), `projectStateV13` (`:3973-3978`). `projectStateV12`'s comment
(`:3938-3940`) records the second half of the rule: it is *"deliberately NOT built on
projectStateV11, whose ledger narrowing exists to refuse V12 rows at a historical boundary."*

**[CODE]** Projection is guarded in two directions:

- **Runtime ledger narrowing.** `historicalLedgerProjection` (`save.ts:3754-3780`) throws rather
  than silently drop a `constructionCapex` / `facilityOpex` / `facilityDemolitionRefund` row.
  `historicalConstructionLedgerProjection` (`:3868-3892`) is the V11-level variant: capex
  survives only while it still names `ANNEX_PROJECT_ID`.
- **Pre-projection downgrade refusal.** `assertFrozenBuilderCanProjectV11State`
  (`save.ts:3980-…`), `…V12State` (`:4079-…`), `…V13State` (`:4136-4157`). The V13 one is the
  cleanest template: refuse if any `facilityDemolitionRefund` row exists, and refuse if
  `state.property` is present and `!deepEqual(candidate.property, INITIAL_PROPERTY)`.
  Comment at `:4130-4135`: *"A property that has grown … has no home in any historical format and
  may never be silently dropped to write one."*
- **The optional-root hardening** (`LL CS`, `docs/LESSONS-LEARNED.md:2336-2352`).
  `assertFrozenBuilderCanProjectV11State` proves `cashLedgerCheckpoint` is canonical, still at the
  ledger end, and reconcilable, refusing three separate laundering routes
  (`save.ts:4000-4044`). Any C2 optional root inherits this obligation.

**[CODE]** `makeSaveV13` (`save.ts:4375-4384`) is the current writer; `makeSave = makeSaveV13`
(`:4388-4390`); the UI writes through `exportSaveJson` (`ui/src/engine/adapter.ts:3076-3078`) and
reads through `importSaveJson` → `migrateToV13` (`:3087-3095`). Autosave uses
`ACTIVE_SESSION_KEY = 'project-studio.active-session.v4'`
(`ui/src/engine/session.ts:20`) and — per its own header comment (`:9-12`) — **the storage key is
deliberately NOT bumped when the save version is**, because an older payload is a valid older
envelope and migrates forward. C2 must not bump it either.

### 1.7 What V13 does NOT have (the negative space C2 must fill)

**[CODE]** These are observations, and they are the whole reason C2 is a schema campaign:

1. **Reservations have no identity.** `FacilityReservation` (`types.ts:545-551`) is
   `{ productionId, facilityId, capability, slot, phase }` — a value, not an entity. It is keyed
   only by `${facilityId}:${slot}` (`scriptDevelopment.ts:71-73`).
2. **Reservations are current-phase-only and are REPLACED wholesale on every phase entry.**
   `enterPhase` writes `reservations: allocation.reservations` (`operations.ts:590-596`), and
   `assertStudioOperationsInvariants` requires the reservation capability multiset to equal
   `requirementsForPhase(workflow.phase)` exactly (`operations.ts:463-468`). **Nothing survives a
   phase transition except the deliberately retained soundstage** (`operations.ts:133-143`).
3. **There is no queue.** A production that cannot be greenlit is *forbidden*, not queued:
   `applyGreenlight` throws at `MAX_CONCURRENT_PRODUCTIONS` (`actions.ts:332-337`;
   `TUNING.MAX_CONCURRENT_PRODUCTIONS: 2` at `tuning.ts:50`). A production that cannot advance a
   phase gets a `ProductionBlocker` (`types.ts:562-571`) and simply does not decrement
   `remainingTicks` (`operations.ts:569-575`) — waiting is representable *within* a phase, but
   only at three exact clock positions (see 4 below).
4. **Blocking is hard-coded to the 8-tick clock.** `productionPhaseForRemainingTicks`
   (`operations.ts:56-77`) is a `switch` over `remainingTicks ∈ [1,8]`, and
   `assertStudioOperationsInvariants` will only accept a `facility-capacity` blocker at
   `remainingTicks` 7, 6, or 4, with a hard-coded expected capability/targetPhase pair
   (`operations.ts:531-549`).
5. **There is no wrap.** The shooting→post *phase change* does exist (`operations.ts:670-684`,
   `requirementsForPhase` `:88-89`), and it does release the stage and scenery slots by
   replacement. What does not exist is any **persisted record or authoritative act** of wrap.
   See §7-R8 for a wording contradiction with the brief on this point.
6. **There are no events.** `SimStopReason` (`ui/src/engine/adapter.ts:2213-2223`) is a
   **UI-side, transient** value derived by diffing pre/post states inside `advanceToNextEvent`
   (`adapter.ts:2343-2442`). Nothing is persisted. `constructionCompletion` is already the
   co-event exception (`adapter.ts:2236-2240`, pattern recorded as `LL CP`,
   `docs/LESSONS-LEARNED.md:2266-…`).
7. **There are no Sets.** `set-scenery` is a *capability* satisfied by one founding facility,
   `facility-scenery-shop` capacity 2 (`operations.ts:29`). Sets as entities do not exist anywhere
   in `src/core`.
8. **There is no founding-mode marker.** `worldgen.ts:645-682` seeds every fresh state
   identically; `activateStudioOperations` has exactly one arm (`actions.ts:1273-1279`).

---

## 2. Derived V14 (/V15) schema requirement list

**[PROPOSAL]** Each item below states: the state it needs, whether it **extends an existing root**
or is a **new root**, and the **historical-boundary guard** it requires. This list is derived from
the other lanes' subject matter as stated in the shared brief (owner laws 1-9,
`docs/c2-planning/00-C2-PLANNING-BRIEF.md:21-46`) and the master plan §7.2
(`THE-MOVIES-PARITY-MASTER-PLAN.md:289-297`). It is a *requirement* list, not a design: exact
field names and tuning belong to the implementing milestone.

### 2.1 Sets as entities — **NEW ROOT** `state.sets`

**[CORPUS]** The recoverable shape (values are evidence, not spec — master plan §11):

| Field family | Corpus evidence |
|---|---|
| numeric catalog id distinct from display name | `set_definition_schema.csv` row `TECH-SET-005` (`[scene] setid`) |
| 0-1 float `quality` | `TECH-SET-003` — *"strongly suggests Prima's documented '1-100 hidden Quality' scale is this same field displayed ×100"* |
| 0-1 float `boredom` | `TECH-SET-002` — the Bible's "Boredom Factor" is a real engine field on the set definition |
| per-genre float weights + explicit `priority1` | `TECH-SET-008` — *"the set format supports per-genre numeric weights and a priority-genre field, not a binary flag"*; the same row's own **correction (18 Aug 2026)** warns this closes the **schema-level** question only, not what vanilla content actually used |
| date-gated `[blueprint/requires]` + category `path` | `TECH-SET-007` — *"Sets use the same category-path and date-gated unlock-requirement mechanism as facilities"* |
| weather support flags | `TECH-SET-006` |
| three-file separation: asset / placement / catalog registration | `prop_blueprint_schema.csv` rows `TECH-PROP-001/002/003` — *"DEFINITIVELY confirms the engine separates physical asset / placement-definition / catalog-registration into three independent files per object"* |
| catalog rows | `set_catalog.csv` — 39 data rows; columns `set_name, hidden_quality_1_100, cost, attractiveness_effect, practice_genre, unlock_condition, boredom_factor, …` |

**[CORPUS] The single most schema-relevant mechanic — NOVELTY IS LOCKED PER FILM.**
`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:729-732` and `:933`: *"a movie's novelty score
derived from its sets is locked to the set's novelty value **at the moment production began**, not
decremented scene-by-scene within that same shoot … the set's novelty for FUTURE movies will have
depleted after this movie's release."* Restated at `:1144` and `:1052`. Confidence is
**PLAYER DOCUMENTED / medium, single contemporary source, no Prima corroboration** — the Bible
flags it as such at `:732` and again in the open-questions checklist at `:3183`.

**[CODE][PROPOSAL] Why that forces a specific schema decision.** A locked-at-start value **cannot
live on a `FacilityReservation`**, because reservations are rebuilt wholesale at every phase entry
(`operations.ts:590-596`) and their capability multiset is invariant-checked against the current
phase (`operations.ts:463-468`). A novelty snapshot stored there would be silently destroyed at
rehearsal→shooting→post. It must live **on the Production** (extending `types.ts:225-239`, beside
the existing `forecastSnapshot` and the `participants?` precedent at `:238`) or on a per-production
Set-binding record inside the new root. **[PROPOSAL]** Put it on the production-phase resource
binding (§2.3), because that record is the thing that survives phase changes and is also what a
wrap must release.

**Root decision — [PROPOSAL]:** `state.sets` is a **new root**, not an extension of
`state.placement`. Rationale from code, not taste:
- `PlacedFacility` (`types.ts:945-961`) is closed and its every field is invariant-bound to a
  `FacilityBlueprint` (`placement.ts:1531-1574`): `completesWeek === placedWeek + buildWeeks`,
  `facilityId ∈ {base, base-id}`, `projectId ∈ {base, base-id}`. Adding decaying, genre-weighted,
  novelty-carrying state to it would widen a record that eleven invariants read.
- A Set is a *different kind of thing* from a capacity-bearing facility: it has quality/novelty/
  condition, it is genre-weighted, and it is consumed by a script requirement — none of which
  `StudioFacility` (`types.ts:530-535`, four fields) can express.
- **[CORPUS]** The original itself kept them in separate catalogs: manual/Bible
  `:695` — *"**Sets** (Build > Sets) are functional … **Landscape and Ornaments** … are purely
  decorative"*, and `:209` — one Build icon opening *Facilities / Sets / Landscape & Ornaments*
  sub-menus.

**Guard required:** three-part (§1.4). (a) own key `sets`; (b) any new ledger kind the root mints
(`setCapex`, `setMaintenance`/`setRepair`, `setDemolitionRefund` — whichever land); (c) any Set
identity that leaks into another root — specifically into `operations.facilities[]` if a Set is
ever registered as a capability-bearing facility, and into `placement.facilities[]` if Sets share
the placement grid. **[PROPOSAL]** Prefer the design where a Set is **never** written into
`operations.facilities`, precisely so leg (c) stays small — but if Sets do occupy lot cells, the
occupancy union in `assertStudioPlacementInvariants` (`placement.ts:1584-1596`, structure overlap)
must gain Sets, and then leg (c) must also refuse a V13-tagged save whose placement cells collide
with a Set.

**Condition/repair.** **[CORPUS]** Sets decay and become unusable until repaired — manual p.20 via
Bible `:665`, `:695`, `:1565` (*"If a studio item falls into disrepair, it's no longer able to be
used … A building cannot be used again until it's fully repaired"*), and the "in red" blocking
rule at `:709` / `:1052` (unbuilt **or** in disrepair **or** already booked). **[PROPOSAL]** That
is three distinct persisted facts on a Set — existence/build status, condition, and current
booking — and the third is a *derived* fact that must NOT be persisted twice (see §3.3).

### 2.2 Stage / Set reservations and queue state — **EXTENDS** `state.operations` **+ NEW ROOT** for the queue

**[CODE]** Reservation extension is the smaller half. `FacilityReservation` (`types.ts:545-551`)
needs to be able to name a **Set** as well as a facility, or a parallel `SetReservation` needs to
exist. Either way `assertStudioOperationsInvariants`'s exact-capability-multiset check
(`operations.ts:463-468`) and the one-union overbooking check (`operations.ts:485-487`) must be
extended in lockstep — **[DOC]** law 22 (`docs/SHIFT-OPERATIONAL-LAWS.md:51-53`): *"Capacity/
occupancy is ONE union at every boundary (production + script + casting + any new placement/
assignment) consumed by actions, invariants, tick, read models."* `LL CC`
(`docs/LESSONS-LEARNED.md:2126-2135`): *"one resource ledger, many projections. Anti-pattern: each
feature subtracting the owners it happens to know about."*

**[CODE]** The union today has **five** declared holders, enumerated in the `placement.ts` module
header at `:52-79` and walked by `facilityEngagements` (`placement.ts:806-869`):
`operations.workflows[].reservations[].facilityId`;
`operations.workflows[].shootingTask.soundstageFacilityId` (a denormalized second copy, walked
independently *on purpose*); `scriptDevelopment.projects[].reservation.facilityId`;
`castingSessions.sessions[].reservation.facilityId`; `construction.projects[].facilityId`.
The header states the obligation verbatim: *"Anything added to this engine that can hold a
facility MUST be added here."* **[PROPOSAL]** C2 adds holders 6 and 7 (a Set reservation, and a
queue entry's *pending* claim if pending claims hold anything) and must edit both the header list
and the predicate, or `demolishFacility` will silently permit destroying an engaged resource.

**Queue state — [PROPOSAL] a NEW ROOT** (`state.productionQueue` or equivalent). Reasons, all
from code:
- It cannot extend `operations.workflows`: a workflow is invariant-bound 1:1 to an *active*
  production (`operations.ts:445-448`, `:551-553`) and its phase is derived from
  `remainingTicks` (`:458-461`). A queued production has not started; it has no `remainingTicks`
  and no `Production` record at all.
- It cannot extend `studio.activeProductions`: that array *is* the concurrency counter
  (`actions.ts:332-337`) and is walked by `persistedProductionIds` (`productionIdentity.ts:14`).
- **[DOC]** Owner law 2 (`00-C2-PLANNING-BRIEF.md:24-26`): *"The player must know what is waiting,
  what it needs, what occupies it, and how to relieve the bottleneck."* That is four facts per
  queue entry, at least one of which (*what occupies it*) is derived and must not be stored.

**Guard required:** own key for the queue root; own key for any Set-reservation container; and —
because a queue entry names a production identity — **leg (c) must refuse a pre-V14 save carrying
a queued production id in any V13-era trace**. See §3.

### 2.3 Production-phase resource bindings — **EXTENDS** `state.operations.workflows[]`

**[PROPOSAL]** The thing that today does not exist and that both Sets and wrap need: a per-
production record of *which physical resources this film is bound to for its whole life*, distinct
from the *current-phase* reservation set. Concretely it must carry at least: the bound Set id(s),
the novelty value **locked at production start** (§2.1), and the stage id (which today survives
only because `allocateForPhase` deliberately re-finds and re-stamps it, `operations.ts:133-143`).

**[CODE]** Why it must be its own field rather than reuse `reservations`: the invariant at
`operations.ts:463-468` asserts the reservation set is *exactly* the current phase's requirement
multiset. A long-lived binding stored in that array fails that invariant on the first phase where
its capability is not required. **[PROPOSAL]** Add a sibling field on `ProductionWorkflow`
(`types.ts:573-579`), e.g. `bindings`, with its own invariant clause, and leave `reservations` as
the strictly-current-phase concept it is.

**Guard required:** none of its own if it lives inside `operations` — but the V14 guard's leg (c)
must refuse a pre-V14 save whose `operations.workflows[]` carries the new field, exactly as
`rejectV11AuthorityAtHistoricalBoundary` refuses the Annex facility inside
`operations.facilities` (`save.ts:424-433`). **This is the exact precedent to copy.**

### 2.4 Wrap / event-model — **CONDITIONAL NEW ROOT** `state.events` (only if the docket rules "persisted ledger")

**[DOC]** The brief routes the choice to C2: *"the event-model docket (engine emits no events
today — UI diffs state; C2 decides ONE model: persisted ledger vs transient emission)"*
(`00-C2-PLANNING-BRIEF.md:63-65`).

**[CODE]** Today's answer is transient (`ui/src/engine/adapter.ts:2213-2223`, `:2343-2442`).
Adopting a persisted ledger is the largest single schema addition C2 could make, and it carries
consequences this lane must state plainly:

- **Determinism.** A persisted event ledger is part of the save, so it is part of byte-identity.
  Two runs with the same seed and actions must produce byte-identical event ledgers
  (`docs/SHIFT-OPERATIONAL-LAWS.md:54-56`; `tests/replay.test.ts:78-97`). Any event carrying a
  timestamp, a UI-derived field, or an iteration-order-dependent id breaks this.
- **Identity.** Every event needs an id, and per law 20 that id reserves against the longest-lived
  authority (§3).
- **Unbounded growth.** `careerEvents`, `ledger`, `theatricalRuns`, and `broadcastItems` are all
  already append-only histories that never shrink (`productionIdentity.ts:14-29` walks four of
  them). A fifth is a real save-size decision, not a free one.
- **[DOC]** `LL CM` (`docs/LESSONS-LEARNED.md:2265-2276`) is directly on point and *argues for*
  a ledger: *"Temporal authorization needs an immutable event witness … state transition time is
  proved by its immutable event record. Anti-pattern: treating one editable timestamp as
  causality."* The Annex reservation had to reconcile to *"exactly one authoritative production
  debit at the same greenlight week"* because a mutable start clock was forgeable.

**[PROPOSAL]** Wrap specifically. If wrap becomes an authoritative act (owner law 8: *"wrap
releases resources"*, `00-C2-PLANNING-BRIEF.md:41-43`), it needs an **immutable witness** so that
a forged save cannot claim a stage was released while a production still holds it. The cheapest
witness that satisfies `LL CM` without a new root is a **ledger row** — the ledger already exists,
already correlates by `productionId` (`types.ts:368-377`), already has a kind discriminant, and
already has a working historical-boundary guard pattern for new kinds. **A `wrap` ledger row of
amount 0 is not free of cost** (it pollutes an accounting ledger with a non-financial fact, which
`LL CQ`, `docs/LESSONS-LEARNED.md:2312-…`, explicitly warns about: *"every compile-guarded ledger
classifier names construction explicitly"* — a zero-amount non-economic kind would have to be
excluded from every classifier). **[PROPOSAL] Recommend: transient emission for presentation +
one durable non-ledger witness field on the workflow/binding record for wrap** (e.g. `wrappedWeek`
reconciled against the stage reservation's release), rather than a general persisted event root.
Full ruling belongs to the event-docket lane; this lane records the schema cost of each arm.

**Guard required (if a root lands):** own key `events`; refuse any event row at every pre-V14
boundary; **and** refuse any V13-era root that carries the event id, because event ids are exactly
the kind of cross-domain string `LL CL` (`docs/LESSONS-LEARNED.md:2253-2263`) warns about.

### 2.5 Premiere Night V1 — **[PROPOSAL] NO new root; extends existing**

**[DOC]** Owner law 7: *"Premiere Night V1 belongs to C2. No movie footage yet."*
(`00-C2-PLANNING-BRIEF.md:38`).

**[CODE]** A premiere is an event *at* a release, and release state already exists and is already
durable: `FilmResult` (`types.ts:241-264`, including the already-optional `participants?` and
`forecast?` fields — the precedent for additive optional per-film history),
`TheatricalRun` (`types.ts:304-316`, with `releaseTick`, `weekIndex`, `status`), and the
`publicity` root (V7). **[PROPOSAL]** If Premiere Night persists anything at all, it should be an
**additive optional field on `FilmResult`** following the `participants?` pattern exactly — absent
on every legacy film, present only on films released after C2 — so migration invents nothing.
**[PROPOSAL]** If Premiere Night is purely presentational (a scheduled scene the UI plays at
`releaseTick`), it persists **nothing** and does not touch the schema. That is the preferred arm.

**[DOC][GAP]** The brief also records a C1 seam: *"the `FilmResult.releaseTick` off-by-one-week
copy"* (`00-C2-PLANNING-BRIEF.md:68`). Premiere Night reads `releaseTick`. **C2 must resolve that
seam before building a premiere on top of it**, or the premiere will inherit the off-by-one.

### 2.6 Founding-mode marker for the Flip — **NEW ROOT or NEW FIELD, and it is a VALIDATION DISCRIMINANT**

**[DOC]** Owner law 6 (`00-C2-PLANNING-BRIEF.md:33-37`) ratifies the Flip. Master plan §6
(`THE-MOVIES-PARITY-MASTER-PLAN.md:255-276`) states the survival requirement:
*"Migrated saves never experience the Flip retroactively; they simply own their founding
placements"* (`:274`), and *"the pre-Flip fixture (studio founded with buildings, i.e. every
migrated save) is retained as a permanent regression suite"* (`:272-273`).

**[CODE] Why a marker is unavoidable, and why it cannot be UI-only.** Three save-reachable
invariants hard-code the founding plant:

1. `assertStudioOperationsInvariants`, managed arm, requires one facility of **each** of the four
   capabilities (`operations.ts:364-371`). A Gate+Admin lot has none.
2. The `'placement-v12'` facility policy requires the operations facility list to equal
   `[...INITIAL_STUDIO_FACILITIES, ...placedFacilities]` **positionally, by id/name/capability/
   capacity** (`operations.ts:413-437`).
3. `assertStudioConstructionInvariants` takes the same policy and the same expected-facility list
   (`construction.ts:95-110`).

All three are reached from `validateSaveV13` via the recursive frozen validators
(`save.ts:3666-3680` → `checkOperationsState`, `save.ts:2178`). **A flipped save is therefore not
merely un-modelled: it fails validation.** The marker must be a field the *invariant* reads to
select its arm — precisely how `facilityPolicy` already selects between `initial-v1`, `annex-v1`,
`configured`, and `placement-v12` (`operations.ts:338`, `:373`), and precisely how
`LiveStateValidationPolicy` (`save.ts:823-832`) already threads a live-vs-frozen distinction
through the validator chain.

**[PROPOSAL] Shape.** A small closed enum on state — e.g.
`state.foundingMode: 'inheritedPlant' | 'bareLot'` — is preferable to inferring the mode from the
property or the facility list, for the reason `LL FL` gives
(`docs/LESSONS-LEARNED.md:3435-3444`): *"absence may mean compatibility; a present invalid claim
means invalid. Anti-pattern: `if (!value) legacyFallback()` at an authority boundary."* Inferring
"bare lot" from "no soundstage" is exactly that anti-pattern — it would also silently reclassify a
migrated studio that demolished its way down.

**[PROPOSAL] It should be a top-level root, not a field inside `property`.** `PropertyState`
(`types.ts:1197-1202`) is closed at four keys and is validated by `checkPropertyShape`
(`save.ts:3555-3639`) with `v12ExactKeys`; adding a fifth key there means every V12→V13
migration fixture and the `INITIAL_PROPERTY` deep-equality guard
(`save.ts:4150-4156`) changes shape. A separate root leaves `property` byte-stable.

**Guard required:** own key `foundingMode` refused at every pre-V14/V15 boundary. **Plus** the
V13 `assertFrozenBuilderCanProject…` analogue: a frozen builder may cross the boundary only when
`foundingMode === 'inheritedPlant'` (the value every ≤V13 save implicitly carries), exactly as
`assertFrozenBuilderCanProjectV13State` (`save.ts:4136-4157`) permits the crossing only when the
property still deep-equals `INITIAL_PROPERTY`. **This is the closest existing template and should
be copied verbatim.**

### 2.7 Summary table

| # | Requirement | Root decision | New ledger kind(s)? | Guard legs needed |
|---|---|---|---|---|
| 1 | Sets as entities (identity, quality, novelty, boredom, condition, genre weights) | **NEW** `state.sets` | likely `setCapex`, `setMaintenance`, `setDemolitionRefund` | key + ledger kinds + identity leak into `operations.facilities` / `placement` cells |
| 2a | Stage/Set reservations | **EXTENDS** `operations.workflows[].reservations[]` (or sibling `setReservations`) | no | identity leak leg only (a reservation inside a V13-tagged `operations`) |
| 2b | Queue state | **NEW** `state.productionQueue` | no | key + queued-production-id leak |
| 3 | Production-phase resource bindings (incl. locked novelty) | **EXTENDS** `operations.workflows[]` (new sibling field) | no | identity leak leg (new field inside V13-tagged `operations`) |
| 4 | Wrap / event ledger | **CONDITIONAL NEW** `state.events` — recommend NOT | recommend no | key + event-id leak (only if root lands) |
| 5 | Premiere Night | recommend **none**; else optional field on `FilmResult` | no | none if optional-and-absent-on-legacy |
| 6 | Founding-mode marker | **NEW** `state.foundingMode` | no | key + frozen-builder refusal unless `'inheritedPlant'` |

**[PROPOSAL] C2a/C2b split mapping.** If the Owner takes the split (brief law 6,
`00-C2-PLANNING-BRIEF.md:36-37`): **V14 = items 1, 2a, 2b, 3, (4)**; **V15 = item 6** alone,
plus whatever bare-lot blueprint identities the Flip mints. Item 5 rides whichever ships first.
The split is *cheap on the schema side and expensive on the boilerplate side*: every one of
`validateSaveV1..V13` gains one more `reject…AtHistoricalBoundary` call per version (today three
each, e.g. `save.ts:537-539`), five `migrateToVn` enumerations gain a case each
(`save.ts:5180-5190`, `:5199-5208`, `:5217-5225`, `:5236-5240`, `:5250-5254`), and every
`makeSaveVn` gains one more `assertFrozenBuilderCanProject…` call (today up to three, e.g.
`save.ts:4162-4164`). Two bumps ≈ **~90 mechanical edit sites**; one bump ≈ ~45.

---

## 3. ID / identity law (law 20) for reservations and queue entries

**[DOC]** Law 20 (`docs/SHIFT-OPERATIONAL-LAWS.md:46-48`): *"New IDs reserve against the
longest-lived identity authority (productions, ledger, careers, tasks, reservations, canceled
traces). Temporal claims need an immutable event witness, not an editable timestamp.
`LL CL/BX/CM`."*

**[DOC]** `LL BX` (`docs/LESSONS-LEARNED.md:2060-2070`): *"allocating a production ID from active
and released films alone allowed a same-week cancellation and re-greenlight to reuse the old ID
while ledger and career history still retained it, merging two films' accounting identities …
allocation reserves every ID present in any durable historical or operational trace: films, runs,
ledger, careers, broadcasts, workflows, tasks, reservations, and script links … identity follows
the longest-lived reference."*

**[DOC]** `LL CL` (`docs/LESSONS-LEARNED.md:2253-2263`): *"a valid historical film identity could
be renamed to the future construction project ID … identity uniqueness spans every durable
consumer. Anti-pattern: checking only the collection the new feature is about to append."*

### 3.1 The four identity strategies that coexist today — [CODE]

| Strategy | Where | Reuse safety |
|---|---|---|
| **Collision-avoiding time-derived** — `prod-${tick}` with smallest-free `-k` suffix, checked against a full persisted set | `actions.ts:161-167`, exposed as `predictProductionId` `:176-178` | safe **because** it consults `persistedProductionIds` |
| **Monotonic reserved counter, never rolled back** | `StudioPlacement.nextPlacementId` (`types.ts:1021`, allocation `placement.ts:688`, `:720`), explicitly *not* rolled back on failure (`placement.ts:1007`, `:1053`), invariant `placed.id < nextPlacementId` (`placement.ts:1486`) | safe |
| **Positional / append-only index** — `script-0000`, `casting-0000` | `scriptDevelopment.ts:40-49`, `castingSessions.ts:69-78`, invariant-bound to array index (`scriptDevelopment.ts:870-872`, `castingSessions.ts:564-566`) | safe **only while the array is never compacted** |
| **Content-derived canonical** — `shooting:${productionId}` | `operations.ts:580`, invariant `operations.ts:493` | safe; derived, not allocated |

### 3.2 The longest-lived identity authority reservations must reserve against — [CODE] + [PROPOSAL]

**[CODE]** The authority is `persistedProductionIds(state)` (`src/core/productionIdentity.ts:8-38`).
Its own header states the law: *"A production identity remains authoritative after the live
Production disappears. Cancellation deliberately keeps sunk greenlight entries in the ledger …
Any allocator or cross-domain reservation gate must therefore collide against every persisted
consumer, not merely the active/released production arrays."*

It walks **nine** durable traces: `studio.activeProductions`, `studio.releasedFilms`,
`theatricalRuns`, `ledger` (`entry.productionId`), `careerEvents` (`event.filmId`),
`broadcastItems` (`facts.filmId`, plus release `subjectId` and `facts.subjectId`),
`coverageContexts` (`subjectId`, conservatively), `operations.workflows` (`productionId`, each
reservation's `productionId`, and `shootingTask?.productionId`), and
`scriptDevelopment.projects` (`productionId`).

**[CODE] It is consulted in three places, and only ever in ONE direction:**
- `actions.ts:177` — the greenlight allocator consults it before minting a production id.
- `construction.ts:44-47` (`annexCanonicalProductionIdCollision`) — the three Annex canonical ids
  (`ANNEX_RESERVED_IDS`, `construction.ts:34-38`) are checked *against* production identity.
- `placement.ts:1561-1570` — every placement's `parcelId`, `projectId`, `facilityId` is checked
  *against* production identity, with the comment *"Law 20: a placement's identities are reserved
  against the longest-lived identity authority."*

**[CODE][RISK] `persistedProductionIds` does NOT walk `castingSessions`, `placement.facilities[]`,
or `construction.projects[]`.** The asymmetry is deliberate and currently sound — placement and
construction identities collide *into* production identity, not the reverse — but it means the
authority is **one-directional**. `LL BX`'s own resolution text names *"tasks, reservations"* as
things allocation must reserve against; today no id is allocated from reservations, because
reservations have no ids (§1.7-1).

**[PROPOSAL] The C2 rule.** Reservations and queue entries **must not mint free-form string ids**.
Two admissible shapes, in preference order:

1. **Derive, do not allocate** (preferred — the `shooting:${productionId}` precedent,
   `operations.ts:580`). A stage reservation is `stage:${productionId}`; a set reservation is
   `set:${setId}:${productionId}`; a queue entry is `queued:${productionId}`. Derived ids are
   automatically collision-free **iff** their components already are, they need no counter in the
   save, and they add nothing to `nextPlacementId`-style rollback questions.
2. **Monotonic counter in the owning root** (the `nextPlacementId` precedent,
   `types.ts:1021`, `placement.ts:1007`, `:1053`) — required for **Set entity ids**, because a Set
   is a long-lived thing that outlives any one production and must survive demolition-and-rebuild
   without id reuse. `nextSetId` must never be rolled back on a refused build, exactly as
   `nextPlacementId` is not.

**[PROPOSAL] The reservation direction.** Because C2 mints a genuinely new *domain* of ids (Set
ids), and because `LL CL`'s failure was *"a valid historical film identity … renamed to the future
construction project ID"*, the C2 invariant must run **both ways**:
- Set ids and queue-entry ids are checked against `persistedProductionIds` (copy
  `placement.ts:1561-1570` verbatim); **and**
- `persistedProductionIds` is **extended** to walk the new queue root, so a future allocator
  cannot reuse a production id that only a queue entry (or a *canceled* queue entry's trace) still
  holds. **This edit is mandatory the moment queue entries name productions.**

### 3.3 Canceled / completed reservations — what trace they leave

**[CODE]** Today the answer is stark: **completed and canceled reservations leave NO trace.**
- `enterPhase` replaces the whole reservation array (`operations.ts:590-596`). The old phase's
  reservations are gone.
- `removeManagedProductionWorkflow` filters the workflow out entirely at `remainingTicks → 0`
  (`operations.ts:225-234`, called at `:666`). Everything the workflow knew is dropped.
- A canceled production is removed from `activeProductions`, and the ONLY durable trace is the
  sunk greenlight ledger row — which is exactly the trace `LL BX` was written about
  (`docs/LESSONS-LEARNED.md:2060-2065`).
- Contrast: `placement.nextPlacementId` **is** the trace of a completed/removed placement
  (`placement.ts:1007`, `:1053`), and `theatricalRuns` keeps `status: 'completed'` history rather
  than deleting (`types.ts:303-316`).

**[PROPOSAL] The C2 rule, stated as a decision the architect must ratify:**

- **Reservations remain traceless-by-replacement.** Do not persist a reservation history. The
  save is already reconcilable — a production's *current* claims are fully derivable from its
  phase, and the invariant proves it (`operations.ts:463-468`). Persisting released reservations
  creates a second source of truth for occupancy, which is exactly the law-22 violation `LL CC`
  records.
- **Set usage DOES leave a trace, and it must, because novelty decay depends on it.**
  **[CORPUS]** *"New sets start at 100% and degrade with use"* (Bible `:1144`); the decay is
  **per released movie**, not per scene (`:729-732`, `:933`). **[PROPOSAL]** Therefore the trace
  lives on the **Set**, as accumulated state (a novelty value, and whatever counter drives it),
  not as a reservation log. A canceled production must be decided explicitly: does a film that
  never releases still burn novelty? **[CORPUS]** says decay happens *"after this movie's
  release"* (`:732`) — so **[PROPOSAL] cancellation burns nothing**, and that fact must be
  asserted by a test, not assumed.
- **Queue entries leave a trace only through the id authority.** A canceled queue entry is
  removed, but its production id must remain reserved (§3.2). **[PROPOSAL]** The cheapest correct
  implementation is that a queue entry never mints a production id at all: the id is minted at
  greenlight, exactly as today (`actions.ts:177`), and a queue entry names a *script project*
  (`script-NNNN`, `scriptDevelopment.ts:40-45`) which is already permanent and append-only. **This
  removes the entire canceled-queue-entry identity problem.** Strongly recommended.

**[DOC]** `LL CM` (`docs/LESSONS-LEARNED.md:2265-2276`) applies to any queue ordering key: *"a
forged save [could] move both a reservation and its mutable start clock forward … state transition
time is proved by its immutable event record."* **[PROPOSAL]** A queue's order must therefore be
proved by something immutable — the script project's `commissionedWeek`
(`types.ts:627`) or its positional index, never a mutable `queuedAt` the player's save could edit.

---

## 4. Migration compatibility rules for C2

**[DOC]** The governing precedent, `convertV12ToV13` (`save.ts:5063-5086`): *"V12 had a property;
it just had no way to say so … `INITIAL_PROPERTY` IS those constants, so synthesizing it here
reconstructs a fact rather than inventing a default … Nothing else moves: no cash, no week, no
ledger row, no placement, no reservation, and rngState is byte-identical."*

And `convertV11ToV12` (`save.ts:4997-5061`), the harder one: the V11 Annex project **moves** onto
the parcel map as exactly one `PlacedFacility` *"with the same weeks, the same status, the same
facility id, and the same construction-capex correlation — so every reservation and every ledger
row it already owns keeps pointing at the same thing."*

### 4.1 The exact V13 state of a film shooting on Stage 7 — [CODE]

This is the state a C2 migration must round-trip without behavior change. Reconstructed from
`operations.ts`:

- `state.studio.activeProductions[i]`: `remainingTicks ∈ {5, 4}` (`operations.ts:507`),
  `startTick`, `directorId`, `id = prod-NNNN[-k]` (`actions.ts:161-167`).
- `state.operations.workflows[j]` with `productionId` matching, `phase: 'shooting'`
  (`operations.ts:64-66`).
- `workflow.reservations` = **exactly two** rows, because
  `requirementsForPhase('shooting') === ['soundstage', 'set-scenery']` (`operations.ts:87`):
  - `{ productionId, facilityId: 'facility-soundstage-07', capability: 'soundstage', slot: 0,
    phase: 'shooting' }` — Stage 7 rather than Stage 12 because `allocateForPhase` sorts
    facilities by id ascending (`operations.ts:130`, `compareId` `:95-97`) and
    `'facility-soundstage-07' < 'facility-soundstage-12'`; and because the **rehearsal soundstage
    is deliberately RETAINED into shooting** (`operations.ts:133-143`), the id is whatever
    rehearsal picked.
  - `{ …, facilityId: 'facility-scenery-shop', capability: 'set-scenery', slot ∈ {0,1},
    phase: 'shooting' }` (`operations.ts:29`, capacity 2).
- `workflow.shootingTask` = `{ id: 'shooting:'+productionId, productionId, directorId,
  soundstageFacilityId: <the stage above>, status }` (`operations.ts:577-588`), where `status ∈
  {'unassigned','blocked','ready','scheduled'}` at `remainingTicks===5` and `'completed'` at
  `remainingTicks===4` (`operations.ts:504-509`).
- `workflow.blocker` = `null`, or `{ kind: 'scenery-load-in', taskId: 'shooting:'+productionId }`
  when the task is `'blocked'` (`operations.ts:274-279`, invariant `:510-514`), or
  `{ kind: 'facility-capacity', capability: 'post', targetPhase: 'postProduction' }` when the take
  is completed and post is full (`operations.ts:515-519`, `:537-539`).
- `state.placement.facilities[]` may additionally hold placed catalog buildings; Stage 7 itself is
  a **property structure**, not a placement (`types.ts:1173-1183`,
  `INITIAL_STUDIO_FACILITIES` `operations.ts:30`, linked via `providesFacilityIds`
  `types.ts:1181-1182`).

### 4.2 The migration derivation — [PROPOSAL], stated precisely enough to implement

**Rule M0 — the invariant to preserve.** `convertV13ToV14` must satisfy the same three properties
`convertV12ToV13` satisfies and that `tests/property-state-v13.test.ts:344-420` asserts of it:
(a) `rngState` byte-identical; (b) no cash, week, ledger row, placement, or reservation moves;
(c) a migrated world and a natively-created world of the same seed play byte-identically for 30+
weeks.

**Rule M1 — Sets: a migrated world owns ZERO Sets.**
`state.sets = { mode: 'legacy' | equivalent, nextSetId: 1, sets: [] }`.
There is no fact to reconstruct: Sets never existed, so unlike `INITIAL_PROPERTY` there is no
authored constant that *was* the implicit value. **Synthesizing starter Sets would be inventing a
default, which is exactly what `convertV12ToV13`'s comment forbids** (`save.ts:5065-5073`).
The empty/legacy arm is the truthful one, and it mirrors `convertV10ToV11`'s choice
(`save.ts:4978-4995`), which selects `emptyStudioConstruction()` vs
`initialManagedStudioConstruction()` **from the state's own validated operations mode** rather
than from a guess.

**Rule M2 — the in-flight `set-scenery` reservation is NOT converted into a Set reservation.**
It continues to name `facility-scenery-shop`, unchanged, byte-for-byte. Justification, from code:
the Scenery Shop is a founding capability-bearing facility (`operations.ts:29`) linked to a
property structure (`types.ts:1181`); it is not a Set and never was. Converting it would (a)
invent a Set that was never built and never paid for, (b) change
`facilityEngagements`' answer for `facility-scenery-shop` (`placement.ts:806-869`), and (c) break
the exact-capability-multiset invariant (`operations.ts:463-468`) unless `set-scenery` is
simultaneously removed from `requirementsForPhase`.

> **[PROPOSAL] The load-bearing consequence:** C2 must keep `set-scenery` as a capability
> satisfied by the Scenery Shop **for productions already in flight**, and introduce the Set
> requirement **as a greenlight-time gate on NEW productions only**. That is the only derivation
> that is simultaneously (i) behavior-neutral for migrated saves, (ii) truthful (invents nothing),
> and (iii) compatible with the sealed invariants. If C2 instead makes `set-scenery` require a
> built Set unconditionally, **every migrated mid-shoot save becomes invalid at load**, because
> its workflow's reservation would reference a resource class that does not exist in that world.

**Rule M3 — production-phase bindings are derived, never invented.** For each workflow in
`phase === 'shooting'`, the migration derives:
- `boundStageFacilityId := workflow.shootingTask.soundstageFacilityId` (already denormalized and
  invariant-tied to the reservation at `operations.ts:500-503` — so it is a *fact*, not a guess).
- `boundSetIds := []` (Rule M1).
- `lockedNovelty := null` / absent — **not a number**. A migrated film shot on no Set has no
  locked novelty, and fabricating `1.0` would be inventing history. Presence-vs-absence must be
  distinguished per `LL FL` (`docs/LESSONS-LEARNED.md:3435-3444`): absence means "pre-C2 film",
  and every downstream consumer must treat that as *compatibility*, not as zero.
- For workflows **not** in `shooting`, bindings are empty; the stage binding is minted at
  rehearsal entry, which is where `allocateForPhase` first takes a soundstage
  (`operations.ts:85-86`).

**Rule M4 — the queue starts empty.** `state.productionQueue = []` (or the legacy/managed pair,
selected from `operations.mode` exactly as `convertV10ToV11` does at `save.ts:4981-4984`). No
migrated production is retroactively queued; the concurrency cap was enforced at greenlight
(`actions.ts:332-337`), so by construction nothing was ever waiting.

**Rule M5 — `foundingMode := 'inheritedPlant'` for every migrated save.** This is the
`INITIAL_PROPERTY` move exactly: every ≤V13 world in existence was founded with the nine buildings,
so the value is *reconstructed, not invented*, and master plan §6 states the requirement directly
(`THE-MOVIES-PARITY-MASTER-PLAN.md:274`: *"Migrated saves never experience the Flip
retroactively"*). The reciprocal frozen-builder guard: a V14/V15 state may be projected to a
historical format only when `foundingMode === 'inheritedPlant'` — copy
`assertFrozenBuilderCanProjectV13State` (`save.ts:4136-4157`) verbatim.

**Rule M6 — no RNG.** `convertV12ToV13` draws none (`save.ts:5076-5086`). The only migration in
the codebase that draws is the V1→V2 talent conversion, and it does so through a *derived,
domain-keyed* stream — `migrateStream(seed, oldId, field)` → `stream(seed, 'migrate', …)`
(`save.ts:4432-4435`), documented at `save.ts:13-20` as idempotent and leaving `rngState`
untouched. **[PROPOSAL]** C2's migration should draw nothing at all. If it must (it should not),
it uses `stream(seed, 'migrate-c2', …)` and never touches `rngState`.

**Rule M7 — chain and idempotence.** `migrateToV14(save)`: V14 passes through **by identity**
(`save.saveVersion === 14 → return save`, the `migrateToV13` pattern at `save.ts:5264`); everything
else is `convertV13ToV14(migrateToV13(save))`. `migrateToV13` becomes a retained historical
boundary and gains the downgrade refusal (`if (save.saveVersion === 14) throw`), worded from
`migrateToV12` (`save.ts:5250-5254`).

---

## 5. Determinism / replay constraints and the invariant tests C2 must ship

**[DOC]** Law 23 (`docs/SHIFT-OPERATIONAL-LAWS.md:54-56`): *"Determinism: zero Math.random
(hygiene test scans literal string in src/ and tests/); fixed-order iteration; derived RNG streams
keyed by domain; presentation consumes zero RNG; assert byte-identical state/save after
rejection/repaint."*

**[CODE]** The existing machinery C2 inherits:
- Hygiene scan for the literal `Math.random` across `src/` and `tests/` —
  `tests/hygiene.test.ts:32-33`.
- Full-run byte-identical replay — `tests/replay.test.ts:78-97` (`exportSave` equality),
  `:167-193` (development-on), `:196-236` (resumed from a converted V2).
- Byte-neutral refusal — `tests/placement-core.test.ts:198`, `:386`, `:550`, `:612` all assert
  `stableStringify(state) === before` after a rejected/queried operation;
  `tests/facility-move-demolish.test.ts:436` asserts a refused in-place move is a *different
  object* but a *byte-identical value*. The engine-side contract for this is stated at
  `actions.ts:1282-1290`: `queryPlacement` reports, the pure `commitPlacement` returns state
  **by reference** when the quote is not ok, and only the action layer throws.
- Fixed-order iteration in allocation — `operations.ts:130` (facilities sorted by id),
  `operations.ts:629` (productions sorted by id before allocation), with `:687-692` restoring the
  caller's array order afterwards so allocation order and storage order are separate concerns.
- **[DOC]** PF1 is stated by the brief to add a byte-parity gate
  (`00-C2-PLANNING-BRIEF.md`, lane instruction). **[GAP]** No PF1 artifact exists in this
  worktree — `grep -rl "PF1\|Professional Floor" docs/ *.md` returns only the brief itself — and
  the PF1 worktree is out of bounds. **This lane cannot verify the PF1 gate's shape; C2 must
  re-read it at implementation time.**

### 5.1 The invariant test list C2's schema work must ship — [PROPOSAL]

Modelled directly on the V13 suite (`tests/property-state-v13.test.ts`,
`tests/frozen-save-builder-projection.test.ts`, `tests/migration.test.ts`,
`tests/cash-ledger-checkpoint-v11.test.ts`). Each row names the C1 test that is its template.

| # | Test | Template |
|---|---|---|
| T1 | New games write V14; every lifecycle state round-trips byte-identically through `exportSave`/`importSave` | `property-state-v13.test.ts:621` |
| T2 | The new root(s) project **positively**: an unknown future field added to live state is dropped by every `makeSaveVn`, n < 14 | `property-state-v13.test.ts:645`; `frozen-save-builder-projection.test.ts:52` |
| T3 | Malformed new root rejected **structurally, before any domain rule** — one field at a time: null, primitive, missing key, extra key, wrong type, wrong enum | `property-state-v13.test.ts:655`; law 17 / `LL EQ` |
| T4 | Semantically forged new root rejected (valid shape, illegal domain: a Set reserved by two productions; a queue entry naming a nonexistent script; a novelty outside its stated bound) | `property-state-v13.test.ts:738` |
| T5 | **Law 19** — the new root is refused at EVERY historical boundary, with the guard message for V1-V7 and the closed-key message for V8+ | `property-state-v13.test.ts:851-873` |
| T6 | The unknown-version boundary moves 13 → 14 (assert the literal message text) | `property-state-v13.test.ts:876-880` |
| T7 | `migrateToV13` refuses to downgrade a V14 save; each of `migrateToV4..V12` still refuses 14 | `save.ts:5250-5254` pattern; `migration.test.ts` |
| T8 | Every historical version V1..V13 lifts through the whole frozen chain to V14, and `migrateToV14` is **idempotent by identity** on a V14 input | `property-state-v13.test.ts:843-849`, `:838` |
| T9 | **The headline migration proof.** A V13 save mid-shoot on Stage 7 (each of the five shootingTask statuses × both blocker kinds) migrates and then plays **byte-identically to the same world advanced under V13 semantics** for ≥30 weeks | `property-state-v13.test.ts:344-420` |
| T10 | Frozen-builder downgrade refusal: a V14 state with any Set, any queue entry, any new ledger row, or `foundingMode !== 'inheritedPlant'` cannot be written to ANY historical format | `property-state-v13.test.ts:604`; `save.ts:4136-4157` |
| T11 | **Law 22** — one capacity union: occupy a Set/stage from each owner direction (production, script, casting, queue) and assert both rejection and the *same named owner* in every surface | `LL CC`; `facility-move-demolish.test.ts` engagement suite |
| T12 | **Law 20** — mint a Set id / queue entry, cancel, re-mint in the same week without advancing time; require distinct ids and disjoint ledger groups | `LL BX`'s own fastest diagnostic |
| T13 | **Law 20 cross-domain** — a Set id colliding with a persisted production id (including a *canceled* film's durable ledger row only) is rejected at action AND save | `LL CL`; `placement.ts:1561-1570`; `construction.ts:44-47` |
| T14 | **Byte-neutral refusal** — a refused Set build, a refused reservation, a refused queue join all leave `stableStringify(state)` unchanged | `placement-core.test.ts:198` |
| T15 | **Replay** — two full runs, same seed, same actions, with Sets built/decayed/repaired and a contended queue, produce byte-identical `exportSave` | `replay.test.ts:83` |
| T16 | **Zero RNG in migration** — `convertV13ToV14` leaves `rngState` byte-identical and is idempotent under `stableStringify` | `save.ts:13-20`; `replay.test.ts:237` |
| T17 | **Novelty lock** — a production started on a Set at novelty N still scores N after that Set's novelty decays mid-shoot; a *later* production sees the decayed value | `[CORPUS]` Bible `:729-732`, `:933`; new |
| T18 | **Bounded terms** — every new bounded value (quality, novelty, boredom, condition) has a unit test asserting its stated range | project law, `CLAUDE.md` §Conventions |
| T19 | If `foundingMode: 'bareLot'` ships: a bare-lot state validates, and an `'inheritedPlant'` state still validates under the **unchanged** `placement-v12`/initial-five policy | `operations.ts:364-371`, `:413-437` |
| T20 | Optional-root hardening, **if any new root is optional**: prove it is canonical, at its collection's end, and representable by the target — reject anchor/boundary/row tampering | `cash-ledger-checkpoint-v11.test.ts`; `save.ts:4000-4044`; `LL CS` |

---

## 6. Failure families the C1/FMJ record shows for schema work — what C2 must copy verbatim

**[DOC]** All six are drawn from the LL entries laws 17-21 cite. Each row states the failure, and
the code artifact C2 copies rather than re-derives.

| Family | LL entry | The failure | Copy verbatim |
|---|---|---|---|
| **F1 — one forgiving parser** | `BP` (`LESSONS-LEARNED.md:1956-1968`) | a shared normalization path repaired malformed data *in a claimed current save*, letting bad current files pass under compatibility logic | the V1-V7-loose / V8+-exhaustive split (`save.ts:392-395` vs `:1975`, `:3391`, `:3555`) and the `LiveStateValidationPolicy` thread (`save.ts:823-832`, used at `:3487-3489`, `:3510-3519`) |
| **F2 — clone-then-delete projection** | `BY` (`:2072-2080`) | spreading current state and deleting today's newest field lets *tomorrow's* unknown root leak into a historical schema | the positive allowlist projectors (`save.ts:3726-3978`) plus the runtime ledger narrowers (`:3754-3780`, `:3868-3892`) — and `projectStateV12`'s refusal to build on `projectStateV11` (`:3938-3940`) |
| **F3 — narrowing a shared historical type** | `CO` (`:2290-2300`) | retroactively narrowing a historical `StudioOperations` type would break a committed research instrument; leaving boundaries implicit would leak the new Annex | keep old types broad; exclude new authority **statically** in the frozen state aliases (`types.ts:778-782`, `:1115-1118`) and **at runtime** in the exact validators and positive projectors |
| **F4 — a stronger invariant with no historical escape** | `CS` (`:2336-2352`) | V11's universal `INITIAL_CASH + Σ ledger` check rejected authentic played V1/V2 saves; the fix was **one optional migration-only checkpoint**, hardened against three laundering routes | `cashLedgerCheckpoint` (`types.ts:770-773`), `historicalCashLedgerCheckpoint` (`construction.ts:71-82`), `V11_OPTIONAL_STATE_KEYS` (`save.ts:3094`), and the projection hardening at `save.ts:4000-4044`. **Do not fabricate a balancing row; do not weaken a frozen validator.** |
| **F5 — identity allocated from the live collection only** | `BX` (`:2060-2070`), `CL` (`:2253-2263`) | a same-week cancel + re-greenlight reused an id the ledger and careers still held; a film id could be renamed to a future construction project id | `persistedProductionIds` (`productionIdentity.ts:8-38`) and its three consumers (`actions.ts:177`, `construction.ts:44-47`, `placement.ts:1561-1570`) — **and extend the walk when a new root holds production ids** |
| **F6 — schema validity mistaken for domain legality** | `FJ` (`:3398-3412`) | *"the current SaveFileV11 envelope validates references and shapes but does not independently re-prove every one of those action-time conditions"*; a read model assumed a loadable production obeyed the two-picture cap and assignment exclusivity | the two-tier split: `checkPropertyShape`/`checkPlacementShape` do **shape only** (their comments say so, `save.ts:3388-3390`, `:3551-3554`) and one domain authority proves the whole state (`assertStudioPlacementInvariants`, called at `save.ts:3684`). Read models collect the **complete raw set** and omit the expanded projection **atomically** on failure |

**Also mandatory, from law 17:** `EQ` (`:3138-3149`) — validate every discriminant, required
scalar, nested collection, identity cardinality, and permitted variant *before property access*;
`FL` (`:3435-3444`) — absence, own-undefined, and present-but-malformed are **three** states, and
`if (!value) legacyFallback()` at an authority boundary is the anti-pattern; `FM` (`:3447-3455`) —
exact own-key validation via `Reflect.ownKeys` **including symbols** for closed read-model objects.

---

## 7. Risks, gaps, and contradictions

Reported loudly, not resolved (planning-agent rule 5, `00-C2-PLANNING-BRIEF.md:120-123`).

**R1 — [BLOCKER] The Founding Flip breaks three sealed engine invariants that the save validator
runs.** `operations.ts:364-371` (one facility of each of four capabilities),
`operations.ts:413-437` (facility list must equal `[...INITIAL_STUDIO_FACILITIES, ...placed]`
positionally), `actions.ts:1273-1279` (activation installs all five wholesale). A Gate+Admin studio
fails all three, and they are reached from `validateSaveV13` (`save.ts:3666-3680` →
`checkOperationsState` `:2178`). **This is not a UI problem and it is not solvable by a marker the
UI reads.** The marker must be a validation-policy discriminant, and the Flip must ship a fourth
facility policy arm alongside `initial-v1 / annex-v1 / configured / placement-v12`. **[PROPOSAL]**
This alone is a credible reason to take the C2a/C2b split.

**R2 — [BLOCKER-adjacent] Making `set-scenery` require a built Set unconditionally invalidates
every migrated mid-shoot save.** See Rule M2 (§4.2). The reservation in a V13 save names
`facility-scenery-shop` (`operations.ts:29`) and the exact-multiset invariant
(`operations.ts:463-468`) will reject any state whose reservations do not match the phase
requirement. C2 must decide explicitly: grandfather in-flight productions, or accept that migrated
saves cannot load. **The former is the only choice compatible with owner law 5 and master plan §6.**

**R3 — The 8-tick production clock is hard-coded into the blocker invariant, and owner law 2
("queue, don't forbid") stresses it.** `productionPhaseForRemainingTicks` is a `switch` over
`[1,8]` that **throws** outside the range (`operations.ts:56-77`), and
`assertStudioOperationsInvariants` permits a `facility-capacity` blocker **only** at
`remainingTicks` 7, 6, 4, with the exact capability/targetPhase pair hard-coded
(`operations.ts:531-549`). Indefinite waiting is representable *within* a phase (because
`enterPhase` returns `advanced: false` without decrementing, `:569-575`) but only at those three
clock positions. **If C2's queue lets a production wait at any other point, this invariant must be
rewritten — and law 28 (`SHIFT-OPERATIONAL-LAWS.md:92-96`) forbids rewriting audited systems
without a failing test or explicit instruction.** Get the instruction.

**R4 — Novelty's "locked at production start" has nowhere to live under the current reservation
model.** `enterPhase` replaces `reservations` wholesale (`operations.ts:590-596`), so a snapshot
stored on a reservation is destroyed at every phase transition. This forces the
production-phase-binding record of §2.3. **[CORPUS confidence caveat]** The novelty-lock claim is
PLAYER DOCUMENTED, single source, medium confidence, explicitly uncorroborated by Prima
(Bible `:732`, restated in the open-questions checklist `:3183`). **C2 is free to rule
differently — but it must rule, not drift.**

**R5 — `persistedProductionIds` is one-directional and does not walk `castingSessions`,
`placement.facilities`, or `construction.projects`** (`productionIdentity.ts:8-38`). Sound today
because those domains collide *into* production identity (`placement.ts:1561-1570`,
`construction.ts:44-47`). **The moment a C2 root holds a production id (a queue entry, a Set
booking, a wrap witness), that root must be added to the walk**, or `LL BX`'s exact failure —
same-week cancel + re-greenlight reusing a still-held id — reopens.

**R6 — `v12ExactKeys` uses `Object.keys`, not `Reflect.ownKeys`** (`save.ts:3362`). Safe at the
save boundary (symbols cannot survive JSON) but **not** at a read-model boundary, where `LL FM`
(`LESSONS-LEARNED.md:3447-3455`) requires symbol-inclusive own-key validation. C2's Set/queue read
models must not copy `v12ExactKeys` into presentation code without upgrading it.

**R7 — The V13 guard is the WRONG template for C2's guard.** `rejectV13AuthorityAtHistoricalBoundary`
has only two legs because *"a property leaves no trace anywhere else in the state"*
(`save.ts:494-497`). Sets, reservations, and queue entries **do** leave traces elsewhere. C2 must
copy the **V12** guard (`save.ts:441-486`) — key + ledger kind + identity-prefix scan — not the
V13 one. This is the single easiest mistake to make, because V13 is the most recent and therefore
the most likely to be copied.

**R8 — [CONTRADICTION] The brief and the code disagree about "wrap".** The brief says C2 owns
*"the authoritative **wrap** transition (shooting → post does not exist today)"*
(`00-C2-PLANNING-BRIEF.md:65-66`). **[CODE]** The shooting→postProduction *phase transition* does
exist and does release the stage and scenery slots by replacement (`operations.ts:670-684`,
`requirementsForPhase` `:88-89`, `enterPhase` `:590-596`); `postProduction` is a declared
`ProductionPhase` (`types.ts:542`). What does not exist is any **authoritative wrap ACT or
persisted witness**. Read literally, the brief's sentence is false against the code; read as
intended, it is true. **C2 must not implement a duplicate phase on the strength of the literal
reading.** Flagged for the architect to re-word.

**R9 — [CONTRADICTION] `docs/SHIFT-OPERATIONAL-LAWS.md` law 19's line pointers are stale.** It
cites *"`save.ts:351–378` construction rejection at pre-V11"* and *"`migrateToV11` downgrade
refusal `save.ts:4240–4253`"* (`:43-45`). At `f294077` those are `save.ts:396-434` and
`save.ts:5235-5243`; `save.ts:351-378` is now the tail of `deepEqual` plus the head of
`checkEnvelope`. The brief already flags the trailer's *"Current save = V11"* staleness
(`00-C2-PLANNING-BRIEF.md:78-79`) — **it does not flag this second drift, and the trailer's
`save.ts:218` / `save.ts:3516` pointers are also wrong** (V13 is at `save.ts:267`, `makeSave` at
`:4388`). An agent following law 19 literally will read the wrong code.

**R10 — The migrator downgrade refusals are enumerated by hand in five places**
(`save.ts:5180-5190`, `:5199-5208`, `:5217-5225`, `:5236-5240`, `:5250-5254`) rather than using
the `saveVersion > n` form the V4-V7 migrators use (`:5113-5117` etc.). Adding V14 (and V15)
requires five (ten) hand edits, each of which silently *passes* if forgotten — a forgotten case
means a **silent downgrade that discards authority**, which is the exact class of bug law 19
exists to prevent. **[PROPOSAL]** C2 should add a test that parameterizes every `migrateToVn` over
every higher version and asserts rejection, so the omission cannot be silent.

**R11 — Save-size growth is unbudgeted.** `ledger`, `careerEvents`, `theatricalRuns`,
`broadcastItems`, `scriptDevelopment.projects`, and `castingSessions.sessions` are all
append-only-forever (the latter two are *positionally* id-bound —
`scriptDevelopment.ts:870-872`, `castingSessions.ts:564-566` — so they can never be compacted
without renumbering every id). The autosave writes the whole thing to `localStorage` on every
authoritative transition (`ui/src/engine/session.ts:35-43`) with a bare `catch` on quota failure
(`:40-42`) — i.e. **quota exhaustion is currently a silent no-op**. A persisted event ledger
(§2.4) plus per-Set history would accelerate this. Not a schema correctness issue; a real product
risk C2 should size.

**R12 — [GAP] The PF1 byte-parity gate is unverifiable from this lane.** The brief asserts it
exists; no PF1 artifact is present in this worktree and the PF1 worktree/branches are out of
bounds by hard rule. C2 implementation must re-read the PF1 charter at GO time and confirm the
gate's exact shape before writing T15/T16 (§5.1).

**R13 — [GAP] Set catalog values are incomplete in the corpus, by the corpus's own admission.**
`set_catalog.csv` carries 39 rows but many have `$?` / `-?` / `n/a` in `cost`,
`attractiveness_effect`, `practice_genre`, and `boredom_factor` (e.g. row `SET_RURAL_FIELD`), and
`claim_status` is `INCOMPLETE` for those. Bible `:725` says so explicitly: *"costs, Attractiveness,
Practice Genre, unlocks, and Boredom values remain incomplete for many rows."* Per master plan
§11 this is fine (*"Original numeric values are evidence, not spec"*) — but **the schema must not
be shaped around fields whose vanilla values were never recovered**, and the `TECH-SET-008`
correction (18 Aug 2026) explicitly warns that per-genre multi-weight usage is a *schema*-level
finding only, unresolved at the vanilla-content level.

---

## 8. What this lane recommends the architect decide

**[PROPOSAL]** Five decisions, in dependency order:

1. **Split or not.** R1 is the strongest argument for C2a (V14, Sets/Stages/Throughput) then C2b
   (V15, the Flip): the Flip's invariant surgery is independent of Sets and is the riskier half.
2. **Event model.** Persisted ledger vs transient emission (§2.4). This lane recommends
   **transient emission + one durable non-ledger wrap witness**, on determinism, save-size, and
   `LL CQ` classifier-pollution grounds — but the ruling is the event-docket lane's.
3. **Grandfathering rule for `set-scenery`** (R2 / Rule M2). Without an explicit ruling, migrated
   mid-shoot saves break.
4. **Where locked novelty lives** (R4 / §2.3), and whether cancellation burns novelty (§3.3).
5. **Queue identity** (§3.2): this lane recommends queue entries name **script projects**
   (`script-NNNN`, already permanent and append-only), never minting a production id before
   greenlight — which removes the canceled-queue-entry identity problem entirely.
