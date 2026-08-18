# C2 LANE 2 — CONCURRENCY CAP & QUEUE ARCHAEOLOGY

> Planning artifact for **C2 — Sets, Stages & Production Throughput + Founding Flip**.
> Worktree `/Users/bruce/The Movies - C2 Planning`, branch `c2-sets-throughput-plan`,
> base = sealed C1 `main` @ `f294077`. **Planning only** — nothing in this lane touched
> code, tests, or any file outside this report.
>
> Every claim is tagged **[CODE]** (observed in this worktree's source), **[DOC]**
> (governing document in `docs/` or repo root), **[CORPUS]** (read-only evidence at
> `/Users/bruce/Desktop/Big Swing Art/`), or **[PROPOSAL]** (this lane's design
> recommendation — not observation, not ratified).

---

## 0. Headline

**The `MAX_CONCURRENT_PRODUCTIONS = 2` ceiling is a thin, easily removed scalar. The
hard part is already built — and it is already correct.** The engine has a working,
deterministic, per-phase capacity admission system with atomic all-or-nothing
acquisition, an authoritative hold state, a fixed-order retry, and a three-domain
occupancy union. Capacity-derived concurrency is mostly a matter of *deleting the
scalar gate* and *fixing what breaks downstream in the UI*, not of inventing a queue.

Three findings dominate:

1. **The cap is enforced in exactly two engine places** (`actions.ts:333`,
   `agents.ts:62`) plus two read-model mirrors. Removing it is a small diff.
   [CODE]
2. **The UI world is hard-wired to exactly two soundstages and will THROW** if a
   production is ever located on a third (`ui/src/engine/adapter.ts:5343-5346`,
   `:5540-5545`, `:6339-6344`). This — not the engine — is the real blocker for owner
   law 4 ("stages are player-built production capacity"). [CODE]
3. **The current system is provably deadlock-free only by accident of the pipeline's
   resource order.** Add Sets acquired *earlier* than the stage and you get a textbook
   circular wait. §5 enumerates the cycles and the discipline that prevents them.
   [CODE] + [PROPOSAL]

---

## 1. Every site that enforces or assumes `MAX_CONCURRENT_PRODUCTIONS`

### 1.1 Authoritative enforcement (engine)

| # | Site | What it does | What breaks if concurrency becomes capacity-derived |
| --- | --- | --- | --- |
| E1 | `src/core/tuning.ts:50` — `MAX_CONCURRENT_PRODUCTIONS: 2,` | The constant. | Nothing by itself. But it is **pinned by a test at its literal value** (see T1) and named in six governing docs. Deleting it is a contract change, not a tuning change. [CODE] |
| E2 | `src/core/actions.ts:332-337` — `if (state.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) throw` | **The one authoritative greenlight refusal.** Runs *before* concept/role/exclusivity validation (`actions.ts:339`+) and *after* the founding-draft gate (`actions.ts:328`). | This is the HARD FORBID owner law 2 targets. Removing it makes greenlight legality depend entirely on E3. See §3.1. [CODE] |
| E3 | `src/core/operations.ts:186-222` — `addManagedProductionWorkflow` | The **real, physical** greenlight gate: allocates the new workflow's `development` phase requirement (one `development-casting` slot) and **throws** if none is free (`operations.ts:216-221`). | This is *already* capacity-derived. Once E2 is gone, this becomes the sole greenlight constraint — and it is a hard throw, not a queue. See §3.2. [CODE] |
| E4 | `src/core/actions.ts:12` (header comment) — `activeProductions.length < MAX_CONCURRENT_PRODUCTIONS` | Documents M16.6/B3 as module law. | Comment-only; must be rewritten or it becomes a lie about the module's contract. [CODE] |

### 1.2 Agent / harness enforcement

| # | Site | What it does | What breaks |
| --- | --- | --- | --- |
| A1 | `src/core/agents.ts:62` — `canGreenlight()` | Both `RandomAgent` (`agents.ts:68`) and `OracleAgent` (`agents.ts:83`) return `[]` at the cap. Documented as "ruling #4" at `agents.ts:7` and `agents.ts:24`. | The M0A corpus agents would greenlight unboundedly. **Every headless balance study's slate size becomes emergent**, which silently invalidates comparison against the frozen M0A/D-12/D-16/D-17 corpora. This is the single largest *measurement* risk of the change. [CODE] |
| A2 | `src/harness/d16/policies.ts:334` | D-16 policy `canGreenlight` mirror. | Same as A1 for the governed D-16 harness. [CODE] |
| A3 | `src/harness/d16/driver.ts:443`, `:399` (`maxConcurrent:` manifest field), `:457` (dedup key includes `activeProductions.length`) | Driver-level cap + it is a *recorded manifest fact* and part of a state-dedup key. | Manifest identity changes ⇒ D-16 corpus rows are not comparable across the boundary. [CODE] |
| A4 | `src/harness/d16/experiment.ts:146` — `key: 'MAX_CONCURRENT_PRODUCTIONS'` | Declares the constant as a swept experiment knob. | The sweep axis stops being a scalar. [CODE] |
| A5 | `src/harness/run-final-balance.ts:222-224,:277`; `run-writer-bottleneck-study.ts:202-205,:302`; `run-integrated-balance.ts:143-144`; `run-roster-balance-study.ts:214`; `run-economy-balance-study.ts:43`; `run-owner-calibration-study.ts:187,:273,:576`; `run-microbudget-dominance-audit.ts:466`; `d16/publicity.test.ts:48`; `d16/packages.test.ts:69`; `d16/isolation.test.ts:64`; `d16/run-d16-corpus.ts:612` | Fill-every-slot loops and **`slotIdleWeeks` / `slotUtilPct` metrics whose denominator is `weeks × MAX_CONCURRENT_PRODUCTIONS`**. | `slotUtilPct` becomes meaningless (denominator is no longer a constant). Every "slot idle" study needs a new capacity-time denominator. [CODE] |
| A6 | `src/harness/facilities/index.ts:2876` — `maxConcurrentProductions: TUNING.MAX_CONCURRENT_PRODUCTIONS` | Recorded in the facilities-observatory manifest. | Observatory manifest identity changes. [CODE] |

### 1.3 Read models and UI (mirrors of the engine rule)

| # | Site | What it does | What breaks |
| --- | --- | --- | --- |
| U1 | `src/core/scriptReadModel.ts:624-633` | `production-capacity` blocker: headline **"The production slate is full"**, detail **"The studio already has N of 2 productions active."**, remedy **"Wait for a production to release or cancel one before greenlight."** Sets `productionSlotAvailable` (`scriptReadModel.ts:150`, `:650`). | The whole blocker kind disappears or changes meaning. It is a **closed union member** (`scriptReadModel.ts:44`) validated by two hostile-input snapshot guards (U6, U7). [CODE] |
| U2 | `ui/src/engine/adapter.ts:1286-1288` — `canGreenlightMore(state)` | Exported UI predicate mirroring E2. | Consumed by U3. [CODE] |
| U3 | `ui/src/screens/Dashboard.tsx:113`, `:234`, `:271-275` | Disables **Assemble a film** and renders the hint **"At the production cap (N). Advance weeks until a film releases before starting another."** | Direct owner-law-2 violation surface: a magical forbid with no queue. See §3.1. [CODE] |
| U4 | `ui/src/screens/FoundingScreen.tsx:145-156` | Founding intro prose: *"Your studio can run **up to two productions at once**…"* — with an explicit code comment at `:145` calling the two-production capacity a thing that "is easy to miss otherwise". | **Hardcoded English prose**, not derived from TUNING. It is asserted by `ui/src/screens/d12-owner-ux.test.tsx:369-374` (`toMatch(/two productions/i)`). Must be rewritten to teach capacity-derived throughput. [CODE] |
| U5 | `ui/src/lot/LotCastingReviewPanel.tsx:468` | Renders `Production slot: Available / Blocked`. | Binary "slot" language becomes wrong once concurrency is a capacity union. [CODE] |
| U6 | `ui/src/lot/snapshot/scriptReview.ts:176` | `'production-capacity'` in the closed `BLOCKER_KINDS` set (hostile-input guard, law 17). | Removing/renaming the kind fails the exact-key guard. [CODE] |
| U7 | `ui/src/lot/snapshot/castingReview.ts:34`, `:138`, `:191`, `:202`, `:375`, `:392`, `:399` | Carries `productionSlotAvailable: boolean` **and cross-checks it** at `:392`: `value.productionSlotAvailable !== !blockerKinds.has('production-capacity')` ⇒ reject. | This is a *structural pin* between a boolean and a blocker kind. Both must change together or the snapshot is rejected atomically. [CODE] |
| U8 | `ui/src/lot/snapshot/auditionPlanning.ts:131` | `'productionSlotAvailable'` in an exact-own-key list. | Same guard family as U7. [CODE] |

### 1.4 Sites that assume a *two*-production world without reading the constant

These are the dangerous ones: they encode "two" structurally, so a cap change does not
even produce a type error.

| # | Site | Assumption | What breaks |
| --- | --- | --- | --- |
| W1 | `ui/src/engine/adapter.ts:5343-5346` — `LOT_STAGE_BY_SOUNDSTAGE_ID = { 'facility-soundstage-07': 'stage-a', 'facility-soundstage-12': 'stage-b' }` | A **closed two-entry map** from engine soundstage id to world place id. | `managedWorkflowLocation` **THROWS** at `adapter.ts:5540-5545`: *"managed productionId … uses unmapped soundstage"*. **A third soundstage crashes the lot snapshot.** This is the hard blocker for owner law 4. [CODE] |
| W2 | `ui/src/engine/adapter.ts:6233` — `const STAGE_IDS: ('stage-a'\|'stage-b')[] = ['stage-a','stage-b']` | Two display stages. Used at `:6277` (legacy fallback `STAGE_IDS[index] ?? 'post'`), `:6327-6328` (`prods.slice(0, STAGE_IDS.length)`), `:6401` (people projection slice). | Legacy-mode productions beyond the second are **silently dropped from the world** (`slice`). Not a crash — a silent omission, which is worse. [CODE] |
| W3 | `ui/src/engine/adapter.ts:6339-6344` | Managed rehearsal/shooting production whose `locationBuildingId` is not `stage-a`/`stage-b` ⇒ **throw** *"is not located on a soundstage"*. | Second crash site for a third stage. [CODE] |
| W4 | `ui/src/lot/snapshot/stageAssignment.ts:36-40` — `STAGE_SLOTS = ['stage-a','stage-b']` | Presentation stage-slot memory is a **two-element array**. `:79` comments: *"The snapshot never carries more productions than slots (the adapter slices to STAGE_IDS.length). If that ever changes, fall back to the adapter's own choice"* — an explicitly recorded, unhandled assumption. | Legacy stage memory silently degrades past two productions. [CODE] |
| W5 | `ui/src/lot/snapshot/StudioLotSnapshot.ts:788` (`ALL_BUILDING_IDS = FOUNDING_BUILDING_IDS`) and `:795-805` (`BUILDING_ACTION` — nine fixed keys incl. exactly `stage-a`, `stage-b`) | The world has a **fixed nine-place vocabulary** with exactly two stages. | Player-built stages have no world identity. C1 delivered placement for *catalog* facilities; the founding nine remain a closed enum. [CODE] |
| W6 | `ui/src/lot/navigation.ts:60-70` — `BUILDING_BLURBS` with `'stage-a': 'Soundstage A.'`, `'stage-b': 'Soundstage B.'` | Authored per-stage copy. | Needs to become generated per built stage. [CODE] |
| W7 | `ui/src/screens/Assembly.tsx:1325`, `:1334-1335` | `cycleInclusiveBreakEvenGross(state, committed, { concurrency: 2 })`, rendered as **"… if a second film shares those 14 weeks."** | Hardcoded literal `2` and singular "a second film". [CODE] |
| W8 | `src/core/economyView.ts:198-223` (`CycleFixedCost.concurrency`) + `ui/src/engine/adapter.ts:2178-2181` | Comment law: *"`concurrency: 2` is the ONLY other value any surface may pass, and it must be rendered as a NAMED second line."* | The two-value law (1 or 2) is a documented restriction on the fixed-cost attribution surface. Capacity-derived concurrency needs an N-aware rule or an explicit owner ruling to keep the binary. [CODE] |
| W9 | `src/core/operations.ts:21-32` — `INITIAL_STUDIO_FACILITIES` (Dev&Casting 2, Post 2, Scenery 2, Soundstage 7 ×1, Soundstage 12 ×1) | Capacities **sized exactly to a two-production slate**. `DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:56-57` states this in as many words: *"soundstage, scenery, and post capacity already match the two-production ceiling."* | Removing the cap makes soundstage (2 total) the *de facto* binding constraint, and `development-casting` (2, or 3 with the Annex) the greenlight-admission constraint. [CODE] + [DOC] |
| W10 | `src/core/studioCalendar.ts:190-195` — `CAPABILITY_LABEL` maps `set-scenery → 'Scenery Shop'`, `post → 'Post Building'` (mirrored at `ui/src/engine/adapter.ts:624`) | Capability labels are **the name of the single facility that provides it**. | Once a second scenery/post facility exists, the hold copy "No scenery shop slot was available" names a building rather than a capability. [CODE] |
| W11 | `ui/src/lot/StudioLotScreen.tsx:809`, `:1694`, `:1739`, `:2153`, `:2237`, `:2252`, `:2475`, `:2740`, `:4577`, `:5787`, `:5952`, `:8716` | Twelve+ direct `'stage-a'` / `'stage-b'` literal comparisons in the lot screen (selection, detail eligibility, Hollywood district gating, `target.location === 'stage-7' ? 'stage-a' : 'stage-b'` at `:2740`). | The lot screen's stage handling is per-literal, not per-collection. Largest single mechanical refactor in the UI. [CODE] |

### 1.5 Tests that pin the cap

| # | Site | Assertion |
| --- | --- | --- |
| T1 | `tests/tuning.test.ts:54` | `MAX_CONCURRENT_PRODUCTIONS: 2` asserted by exact value against `rev4-open-questions.md §4`. [CODE] |
| T2 | `tests/actions.test.ts:448-472` | *"greenlight throws when activeProductions.length === MAX_CONCURRENT_PRODUCTIONS"*, and `expect(TUNING.MAX_CONCURRENT_PRODUCTIONS).toBe(2)` at `:472`. [CODE] |
| T3 | `tests/agents.test.ts:157-214` | *"§13 both agents return [] when active === MAX_CONCURRENT_PRODUCTIONS (2)"*. [CODE] |
| T4 | `tests/presence-scenario.test.ts:201` | Comment: *"MAX_CONCURRENT_PRODUCTIONS is 2 and every capability ships two slots, so …"* — the presence scenario's reasoning depends on it. [CODE] |
| T5 | `tests/d17a-fixed-cost-allocation.test.ts:250` | `greenlight(s, 1) // FORCED 2-SLOT OVERLAP (MAX_CONCURRENT_PRODUCTIONS = 2)`. [CODE] |
| T6 | `tests/d12-p2-calibration.test.ts:159`, `tests/tick.test.ts:282`, `:327` | Fill-to-cap loops. [CODE] |
| T7 | `ui/src/screens/d12-owner-ux.test.tsx:369-374` | Asserts the founding copy matches `/two productions/i`. [CODE] |
| T8 | `ui/e2e/lot.spec.ts:221-229` (`'3. two productions occupy Stage A and Stage B independently'`), `ui/src/lot/studio-lot-snapshot.test.ts:239`, `ui/src/lot/snapshot/stageAssignment.test.ts:216`, `ui/src/lot/StudioLotScreen.test.tsx:1112` | Structural pins on the two-stage world. [CODE] |

### 1.6 Documents that state the ceiling as law

`docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md:43,:144` (*"`MAX_CONCURRENT_PRODUCTIONS = 2` × `PRODUCTION_TICKS = 8` ⇒ at most one …"*);
`docs/FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:186,:252` (raising the cap is listed as an **out-of-scope change requiring a new contract**);
`docs/FACILITIES-CONSTRUCTION-RESEARCH-EVIDENCE.md:58`;
`docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-CONTRACT.md:121`;
`docs/HANDOFF.md:1475`; `docs/rev4-open-questions.md:297,:663`;
`docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538` (*"raising the two-production ceiling, future scheduling, priority controls, or reservation queues"* is **explicitly open after V1**);
`docs/PRODUCTION-OPERATIONS-V1-CONTRACT.md:139` (*"manual scheduling and priority between productions"* explicitly open). [DOC]

---

## 2. Inventory of every queue-like / slot-like structure that already exists

The engine has **one** capacity model with **three** independent admitters and **one**
holder. Operational law 22 (`docs/SHIFT-OPERATIONAL-LAWS.md:51-53`) names it: *"Capacity/
occupancy is ONE union at every boundary (production + script + casting + any new
placement/assignment) consumed by actions, invariants, tick, read models."* [DOC]

### 2.1 The shared resource: `StudioFacility` slots

- **Shape** — `src/core/types.ts:530-535`: `{ id, name, capability, capacity }`.
  `FacilityCapability` is a **closed four-member union** (`types.ts:524-529`):
  `development-casting | soundstage | set-scenery | post`. [CODE]
- **Slot identity** — the string `` `${facilityId}:${slot}` `` (`src/core/scriptDevelopment.ts:71-73`,
  `facilitySlotKey`). This is the *only* occupancy key in the system; all three admitters
  and the calendar use it. [CODE]
- **Initial capacity** — `src/core/operations.ts:21-32`. Player-extendable only through
  `development-casting` today (§2.6). [CODE]
- **Registry population** — `src/core/placement.ts:774-778`: only a blueprint with
  `capacity > 0` is appended to `operations.facilities`. Effect-only buildings
  (Development Office II/III, Craft Annex) are operational but contribute no slot. [CODE]

### 2.2 Production workflow slots — *admit at phase entry, hold on failure, release on phase change*

| Aspect | Behavior | Citation |
| --- | --- | --- |
| **Requirement table** | development → `[development-casting]`; preProduction → `[development-casting]`; rehearsal → `[soundstage]`; shooting → `[soundstage, set-scenery]`; postProduction → `[post]`; releaseReady → `[]` | `src/core/operations.ts:77-91` [CODE] |
| **Admission** | `allocateForPhase` builds the occupancy union (own reservations excluded), iterates facilities **ascending by id**, then slots **ascending 0..capacity-1**, first fit. All-or-nothing: a single unsatisfiable capability returns `{ok:false, blocker}` and **no partial reservation is written**. | `src/core/operations.ts:116-172` [CODE] |
| **Retention** | **Soundstage only.** `capability === 'soundstage'` reuses the existing reservation across Rehearsal→Shooting so the physical stage does not jump. Every other capability re-allocates from scratch. | `src/core/operations.ts:133-143` [CODE] |
| **Hold** | On failure, `enterPhase` writes `blocker: {kind:'facility-capacity', capability, targetPhase}` onto the workflow, **keeps the current-phase reservations**, and does **not** decrement `remainingTicks`. The production is queued in place. | `src/core/operations.ts:568-574` [CODE] |
| **Retry** | Every weekly tick, in the same ascending-id sweep. No separate queue object; the blocker *is* the queue entry. | `src/core/operations.ts:631-682` [CODE] |
| **Release** | Phase change replaces the reservation array wholesale (`operations.ts:589-596`); `remainingTicks → 0` removes the whole workflow (`operations.ts:664-667`); cancel removes it (`src/core/actions.ts:647`). `releaseReady` holds nothing. | [CODE] |
| **Legality of a hold** | Invariant restricts capacity blockers to exactly three reachable states: `remainingTicks 7 → (soundstage, rehearsal)`, `6 → (set-scenery, shooting)`, `4 → (post, postProduction)`. Anything else throws. | `src/core/operations.ts:531-548` [CODE] |
| **Greenlight admission** | `addManagedProductionWorkflow` allocates the `development` phase immediately and **throws** if it cannot. There is no "queued, not yet started" production state. | `src/core/operations.ts:186-222` [CODE] |

### 2.3 Development & Casting screenplay slots — *admit at commission/rewrite, hold never, release at due week*

- **Admit** — `allocateScriptReservation` (`src/core/scriptDevelopment.ts:173-200`): same
  ascending facility-id / ascending-slot first-fit, over the union of production
  reservations + other script reservations + an `externallyOccupiedSlots` set passed in by
  the caller. Returns `null` on failure. [CODE]
- **Refuse** — commission throws *"no Development & Casting slot is available"*
  (`scriptDevelopment.ts:270-274`); rewrite throws the same (`:497-501`). **There is no
  queued screenplay.** [CODE]
- **Hold** — none. A screenplay project either holds a reservation (`drafting`/`rewriting`)
  or holds none; any other status with a reservation is an invariant violation
  (`scriptDevelopment.ts:923`, `:929`, `:952`). [CODE]
- **Release** — `completeDueScriptWork` at tick step 0.5 (`src/core/tick.ts:169-183`),
  *before* production allocation, so a finished draft's slot is available to productions
  in the same visible week. [CODE]

### 2.4 Casting session slots — *admit at start, hold never, release at due week*

- **Admit** — `allocateCastingReservation` (`src/core/castingSessions.ts:228-255`), same
  law, union includes production + script + other casting reservations
  (`castingSessions.ts:165-196`). [CODE]
- **Refuse** — `castingError('start rejected — no Development & Casting slot is available')`
  (`castingSessions.ts:301-303`). **No queued session.** [CODE]
- **Release** — `completeDueCastingSessions` at tick step 0.6 (`src/core/tick.ts:186-199`),
  after screenplays and before production allocation. Session reservation set to `null`
  on completion (`castingSessions.ts:388`). [CODE]

### 2.5 The union, enforced

- `src/core/actions.ts:603-610` — greenlight passes
  `new Set([...scriptOccupiedFacilitySlots(...), ...castingOccupiedFacilitySlots(...)])`
  into the production allocator. [CODE]
- `src/core/tick.ts:206-213` — the weekly production advance passes the same union. [CODE]
- `src/core/actions.ts:1546-1551` — commission passes the casting union. [CODE]
- `src/core/scriptDevelopment.ts:818-819` and `src/core/studioCalendar.ts:279-283` —
  double-booking is an invariant error at both the domain and calendar boundary
  (*"facility slot … is overbooked across scripts/productions"* / *"facility slot … is
  occupied twice"*). [CODE]

### 2.6 Construction pipelines — *two of them, both single-project-shaped*

| Pipeline | Admission | Hold | Release |
| --- | --- | --- | --- |
| **V11 Annex** (`src/core/construction.ts`) | One action `startDevelopmentCastingAnnex`, one fixed parcel `expansion`, one fixed project id. Invariant: `construction.projects.length <= 1` (`construction.ts:204`). $780,000 committed in full at start, 13 weekly advances (`docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:67-76`). | None — no queue, no concurrent projects. `DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:534` lists *"queues, concurrent projects"* as explicitly open. | `completeDueConstruction` at tick step 1.5 (`src/core/tick.ts:215-225`) — **after** that advance's script/casting/production allocation, so a completing facility contributes zero capacity during its completing week. [CODE] + [DOC] |
| **V12/C1 placement** (`src/core/placement.ts`) | `commitPlacement` (`placement.ts:681`) — full catalog, arbitrary parcels, **multiple concurrent sites allowed**; rejection order at `placement.ts:162-181`. | None. A site occupies land and contributes zero capacity until it flips. | `completeDuePlacements` at tick step 1.6 (`src/core/tick.ts:227-241`), same position, completions applied **ascending by numeric placement id** (`placement.ts:748`). Only `blueprint.capacity > 0` joins the slot registry (`placement.ts:774-778`). [CODE] |

**The buildable-capacity gap.** `FACILITY_BLUEPRINTS` (`src/core/tuning.ts:748-754`) has
five entries. Only two provide slots, and **both are `development-casting`**:
Annex (capacity 1) and Development & Casting Hall (capacity 2, `tuning.ts:701-717`). The
other three are effect-only (`capacity: 0`). **There is no buildable soundstage,
set-scenery, or post facility anywhere in the C1 catalog.** Owner law 4 ("stages are
player-built production capacity") has no code path today. [CODE]

### 2.7 `studioCalendar` — *scheduling projection, not a scheduler*

`src/core/studioCalendar.ts:1-3` states it plainly: *"One deterministic, read-only
projection over authoritative studio state. This module creates no schedule,
reservation, command, or second clock."* [CODE]

- **Occupancy board** — `facilityViews` (`studioCalendar.ts:257-385`) walks every
  production reservation, script reservation, and casting reservation and produces
  per-slot `{ facilityId, facilityName, capability, slot, occupant: {owner, ownerId,
  title, activity} | null }`, plus per-facility `{capacity, occupied, available}`. **This is
  the "what occupies it" surface owner law 2 asks for, and it already exists.** [CODE]
- **Commitments** — ordered by `week`, then a fixed `COMMITMENT_KIND_ORDER`
  (script due → casting due → construction completion → theatrical receipt → contract
  renewal → contract expiry, `studioCalendar.ts:267-274`), then numeric placement id,
  then owner id, then occurrence index (`studioCalendar.ts:520-526`). Note the
  **numeric-id tiebreak was added specifically because string project ids sort
  `…-10` before `…-2`** (`studioCalendar.ts:387-393`). [CODE]
- **Hold status** — `productionBlocker` (`studioCalendar.ts:529-605`) renders
  `status: 'held'`, `statusLabel: 'Held for facility capacity'`, headline
  `"{Phase} held for {Capability}"`, detail *"No {capability} slot was available when the
  transition to {Phase} was attempted. It will retry next week."*, consequence
  *"The production countdown will hold while payroll and studio overhead continue each
  week."* (`studioCalendar.ts:209-210`). Mirrored verbatim in
  `ui/src/engine/adapter.ts:765-775`. [CODE]

### 2.8 Presence — *the queue is already visible as a beat*

`src/core/presence.ts:26-34` records a **known truth gap**, verbatim:

> *"A `facility-capacity` blocker carries only {capability, targetPhase} — it names NO
> specific full facility, and in general every facility of that capability is full, so
> 'the full facility' does not exist as a single authoritative id. The waiting rule is
> therefore downgraded: the company waits AT THE SITE IT ACTUALLY HOLDS (its
> current-phase reservation), and `blockedReason` names the capability and phase it is
> queued for. That is the honest queue truth available today."*

There is a `'waiting'` presence beat (`presence.ts:64`). **The simulation theater for a
queue (owner law 8) is already half-built.** [CODE]

### 2.9 Harness instrumentation for holds already exists

`src/harness/facilities/index.ts:223` types a `boundaryKind: 'action-rejection' |
'production-hold'`; `:1767-1862` records per-hold evidence including
`reason: "Production held entering {targetPhase}: no {capability} capacity"` (`:1859`)
and a per-hold **delay exposure** in payroll/overhead/active-run-receipts/net-committed-burn;
`:2268-2305` aggregates studio-wide `holdDelayExposure` once per week. C2 can measure
queue cost with the instrument that already shipped. [CODE]

---

## 3. Every current HARD FORBID a player hits when capacity is unavailable

Owner law 2: *"When capacity is unavailable: QUEUE, DON'T MAGICALLY FORBID. The player
must know what is waiting, what it needs, what occupies it, and how to relieve the
bottleneck."* [DOC — brief §"Owner laws" 2]

| # | Refusal | Site | Copy | Converts to a queue under law 2? |
| --- | --- | --- | --- | --- |
| **F1** | Greenlight at the concurrency cap | `src/core/actions.ts:333-337` | `applyActions: greenlight rejected — activeProductions at capacity (2/2)` | **YES — this is the canonical target.** The cap is transitional by owner law 1. It should not become a queue; it should simply **cease to exist**, leaving F2 as the only admission gate. [PROPOSAL] |
| **F1-ui** | Same, player-facing | `src/core/scriptReadModel.ts:626-633`; `ui/src/screens/Dashboard.tsx:271-275` | "The production slate is full" / "The studio already has N of 2 productions active." / remedy "Wait for a production to release or cancel one before greenlight." / "At the production cap (N). Advance weeks until a film releases before starting another." | **YES.** Note the remedy already gestures at a queue ("wait"), but there is no queued object, no ETA, and no named occupant. [CODE] |
| **F2** | Greenlight with no free `development-casting` slot | `src/core/operations.ts:216-221` | `applyActions: managed greenlight rejected — no development-casting capacity for productionId "prod-XXXX"` | **YES — the most important conversion.** This is a *physical* capacity refusal, exactly the class owner law 2 governs. Today a fully-packaged, fully-funded, fully-staffed film is thrown away because a room is busy. §4 proposes admitting it as `queued`. [PROPOSAL] |
| **F2-ui** | Same, player-facing | `src/core/scriptReadModel.ts:634-642` | "Development & Casting is full" / "Greenlight needs one Development & Casting slot for the production workflow." / remedy "Wait for a named screenplay, casting, or production task to release a slot." | **YES.** [CODE] |
| **F3** | Commission a screenplay with no free slot | `src/core/scriptDevelopment.ts:270-274` | `script development: commission rejected — no Development & Casting slot is available` | **YES** — a commissioned screenplay is a natural queue entry (nothing about it is time-critical). [PROPOSAL] |
| **F3-ui** | Same | `src/core/scriptReadModel.ts:536-547` (`facility-capacity` blocker); `ui/src/engine/adapter.ts:5698-5703` | "Development & Casting is full" / "Every Development & Casting slot is occupied by screenplay, casting, or production work." / remedy "Wait for a named task to release a slot." — and, on the lot, "Development & Casting is full — auditions are waiting for a slot" | The adapter copy already **says "waiting for a slot"** while the engine actually refuses. Copy already promises a queue the engine does not implement. [CODE] |
| **F4** | Request a rewrite with no free slot | `src/core/scriptDevelopment.ts:497-501` | `script development: rewrite rejected — no Development & Casting slot is available` | **YES**, same shape as F3. [PROPOSAL] |
| **F5** | Start a casting session with no free slot | `src/core/castingSessions.ts:301-303` | `casting sessions: start rejected — no Development & Casting slot is available` | **YES**, same shape as F3. [PROPOSAL] |
| **F6** | Phase transition with no free slot | `src/core/operations.ts:568-574` | *(not a refusal)* — writes `blocker: {facility-capacity}` and holds | **ALREADY A QUEUE.** This is the model the other five should adopt. Its only law-2 deficits are informational (§3.1). [CODE] |
| **F7** | Greenlight during the founding draft | `src/core/actions.ts:328-330` | `greenlight rejected — the studio is still in its founding draft (D-11)` | **NO** — a lifecycle gate, not a capacity gate. Law 2 does not reach it. [PROPOSAL] |
| **F8** | Greenlight with no legal complete team | `src/core/actions.ts:430-435` (exclusivity), `src/core/scriptReadModel.ts:601-615` (`package-staffing`) | "The remaining package cannot be staffed" / "…wait for current assignments to finish, or wait for the freelancer market to rotate." | **BORDERLINE — owner ruling needed.** Owner law 1 names *"writers, stars, … crew"* as capacity. If talent is capacity, a film short a Lead is *waiting for a person*, which law 2 says should queue. If talent is a *package decision*, refusing is right. See §7 D-3. [PROPOSAL] |
| **F9** | Greenlight that would leave cash negative | `src/core/actions.ts:527-530` | `greenlight rejected — {reason} (D-12 solvency gate)` | **NO** — money, not capacity. Queuing an unaffordable film would be a hidden loan. [PROPOSAL] |
| **F10** | Annex construction unaffordable / parcel taken | `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:254-266` | exact owning reason, byte-identical state on rejection | **NO** — capital commitment, not a work queue. [DOC] |
| **F11** | Placement rejections (11 kinds) | `src/core/placement.ts:162-181` | `unknownBlueprint, offLot, notOwned, terrainUnbuildable, groundReserved, occupied, clearanceRing, noRoadAccess, seversLot, requirementsUnmet, instanceLimit, insufficientFunds` | **NO** — geometry/ownership/money. Out of law-2 scope. [CODE] |

### 3.1 What F6 (the existing queue) still owes owner law 2

| Law-2 requirement | Status today | Evidence |
| --- | --- | --- |
| *what is waiting* | **MET** — Production Board card + Calendar production view, `status: 'held'` | `src/core/studioCalendar.ts:546-556`; `ui/src/engine/adapter.ts:765-776` [CODE] |
| *what it needs* | **MET** — `{capability, targetPhase}` rendered as "{Phase} held for {Capability}" | same [CODE] |
| *what occupies it* | **NOT MET at the blocker.** The occupancy board exists separately (`studioCalendar.ts:257-385` with `occupant.title`) but is never joined to the blocker. `presence.ts:26-32` records this as a deliberate, honest downgrade. | [CODE] |
| *how to relieve it* | **NOT MET.** The detail says only *"It will retry next week."* No ETA, no "Soundstage 7 frees in 2 weeks", no "build a stage", no cancel-the-blocker affordance. Contrast the script blockers, which do carry a `remedy` field (`scriptReadModel.ts:114-121` shape, `:546`, `:641`). `ProductionBoardBlockerView` has no `remedy`. | [CODE] |

---

## 4. Admission-model options for capacity-derived concurrency

### 4.1 The four questions, answered from evidence

**Where does a production wait?** Today: only at phase entry (F6), never at greenlight
(F1/F2 throw). The corpus says the original waited at the *shoot* step:

> *"A built, undamaged, unoccupied Set matching the script's genre/requirements. Info
> bubbles list required sets in red if unavailable (in disrepair, not yet owned, or
> already booked by another production)"* — Bible §7 pipeline table, row "7. Shoot It"
> (line 519, `[OFFICIAL p.12]`) [CORPUS]
>
> *"Hard blocks (production cannot start/continue): … required set not owned, in disrepair
> ('in red'), or already occupied by a concurrent shoot"* — Bible line 1069 [CORPUS]

So the original's model is **wait-at-the-gate-you-reached, with a red visual marker naming
the missing resource** — structurally identical to the existing `facility-capacity`
blocker plus the informational join we are missing. The original did *not* refuse the
project; it stalled it and said why. [CORPUS]

**What does it wait for?** Today: `development-casting`, `soundstage`, `set-scenery`,
`post` (`types.ts:524-529`). C2 adds at minimum **Sets** (owner law 3) and **Stages** as a
*variable-count* capability (owner law 4), and owner law 1 additionally names
*writers, stars, crew, support, layout/travel*.

**How is priority ordered deterministically (law 23)?** Today: `[...productions].sort(compareId)`
(`operations.ts:629`) — plain string ascending on `prod-NNNN[-k]`. Since the tick is
zero-padded to 4 digits (`actions.ts:162`), **ascending id == FIFO by greenlight week** up to
week 9999. Same-week greenlights order by the `-k` suffix, i.e. order of greenlight within
the week (`actions.ts:161-167`). No timestamps, no races. Two caveats:
- `-10` sorts before `-2` (lexical), so ≥10 same-week greenlights order wrongly. The
  calendar already hit and fixed this exact class of bug for construction ids
  (`studioCalendar.ts:387-393`). [CODE]
- Priority is **FIFO-by-greenlight, not FIFO-by-queue-arrival.** A production that has
  been held for five weeks loses its slot to a lower-id production arriving fresh at the
  same gate this week, because the sweep is id-ordered and takes first-fit. [CODE]

**How does the player read the queue?** Pieces exist and are unjoined (§3.1). Presence
already puts held crew in a `'waiting'` beat at the site the production holds
(`presence.ts:26-34`, `:63`). [CODE]

### 4.2 Candidate A — **Gate-Only Admission** (queue at greenlight; keep phase holds)

Greenlight always succeeds if the *package* is legal, affordable, and staffable. A
production enters `queued` and holds **no** facility. Each week, in ascending-id order,
queued productions attempt to acquire the `development` bundle; the first that can, starts.
Phase holds continue exactly as today.

- **Pros.** Smallest engine delta: one new production state, one new sweep step, delete
  F1/F2. Owner law 2 satisfied at the loudest refusal. Preserves the whole existing
  reservation machine untouched. The player sees a literal slate: *"3 in production, 2
  waiting for Development & Casting."*
- **Cons.** Money is committed at greenlight today (`actions.ts:527-545`) — a queued film
  would be paying nothing while waiting, or paying while doing nothing; either needs an
  owner ruling. Talent exclusivity (`actions.ts:415-436`) would lock a cast to a film that
  has not started, which is a real strategic trap the player cannot see coming.
- **Deadlock risk.** None added: queued productions hold nothing (no hold-and-wait).

### 4.3 Candidate B — **Phase-Gate Admission** (no greenlight queue; every gate is a hold)

Delete F1 and convert F2 into a hold: greenlight *always* creates a workflow, and the
workflow may be born already `held` for `development-casting`. Every phase boundary is a
hold, including the first. Extend the same treatment to F3/F4/F5 (screenplays and casting
sessions become `queued` rather than refused).

- **Pros.** **One mechanism everywhere.** The `blocker` field already exists, the retry
  loop already exists, the calendar already renders it, presence already has a `waiting`
  beat, and the harness already measures it (`facilities/index.ts:1767-1862`). Perfectly
  uniform player mental model: *work exists, work waits, work is relieved.* Maps exactly
  onto the original's red-flag stall [CORPUS Bible:519, :1069].
- **Cons.** The invariant at `operations.ts:531-548` currently *forbids* a blocker at
  `remainingTicks === 8`; it must gain a fourth reachable state. Screenplay/casting queue
  entries need a persisted `queuedWeek`/`reservation: null` shape, which is a save-format
  change (V14+). Un-started work accumulating invisibly is a legibility risk if the queue
  view is weak.
- **Deadlock risk.** Unchanged from today for the existing four capabilities, because
  hold-and-wait still follows the pipeline resource order (§5). Adding Sets breaks that —
  see §5.3.

### 4.4 Candidate C — **Banker's Admission** (whole-film resource reservation at greenlight)

At greenlight, compute the film's *entire* forward resource bundle (dev-casting weeks,
stage-weeks, set-weeks, post-weeks) and admit it only if the studio can schedule the whole
run without deadlock — i.e. a safe-state check. Reservations are made against a forward
calendar, not just "now".

- **Pros.** Provably deadlock-free and starvation-free by construction. Gives the Studio
  Calendar a genuine forward schedule, which is a strong fit for owner law 8 (visible
  activity corresponds to authoritative work) and for the Time Model docket.
- **Cons.** **Far the largest build.** Requires a forward-time reservation model the engine
  does not have (`studioCalendar.ts:1-3` explicitly disclaims being a scheduler). It makes
  early-game admission *stricter* than today, which reads as more forbidding, not less —
  the opposite of owner law 2's felt intent. It also fights the discrete weekly tick: any
  hold anywhere invalidates the whole forward plan.
- **Deadlock risk.** Zero, by design.

### 4.5 Recommendation — **B, with A's queued-greenlight as an explicit later option** [PROPOSAL]

Adopt **Candidate B (Phase-Gate Admission)** for C2, with these disciplines:

1. **Delete `MAX_CONCURRENT_PRODUCTIONS` entirely** rather than raising it. A raised
   number is still a magic forbid; owner law 1 says concurrency *emerges*. Keep a named
   constant only if the owner wants a safety ceiling — and then it must be documented as a
   guard rail, not a design number.
2. **Every capacity refusal becomes a hold.** F2/F3/F4/F5 → queued state with the same
   `{kind:'facility-capacity', capability, targetPhase|targetActivity}` blocker shape
   already in `types.ts:562-572`. F7/F9/F10/F11 stay refusals (they are not capacity).
3. **Priority = FIFO by admission, deterministic, no timestamps.** Introduce an explicit
   integer `queueOrdinal` assigned at greenlight/commission from a monotonic counter
   persisted in state — **not** derived from the id string, which has the `-10 < -2`
   lexical hazard (`studioCalendar.ts:387-393` is the precedent for why). Ordering =
   ascending `queueOrdinal`, ties impossible by construction. This satisfies law 23
   (fixed-order iteration, no timestamp races) *and* fixes the two id-ordering caveats in
   §4.1.
4. **Aging over pure FIFO-by-greenlight.** A production that has been held N weeks should
   outrank one arriving fresh at the same gate. Concretely: sort candidates for a gate by
   `(descending weeksHeld, ascending queueOrdinal)`. Both terms are integers in state; no
   clock, no RNG. This closes the starvation hole in §5.4 and is what makes a queue feel
   like a queue rather than a lottery.
5. **The blocker gains `occupants` and `remedy`.** `ProductionBlocker` becomes
   `{kind, capability, targetPhase, occupiedBy: readonly {facilityId, slot, ownerId,
   title, activity, freesInWeeks|null}[], remedies: readonly Remedy[]}`. Every field is
   already computable from `studioCalendar.ts:257-385` plus `remainingTicks`. This is the
   single change that converts §3.1's two unmet law-2 requirements into met ones.
6. **One queue surface, three consumers.** Core owns `studioQueueView(state)` beside
   `studioCalendarView`; Dashboard, Calendar, and the Lot all read it. Never two queue
   readings (law 22's shape, applied to the queue instead of the occupancy union).

Candidate A remains the right answer *if* the owner rules that talent exclusivity and cash
commitment should not attach until a film physically starts. That is an economy question,
not a throughput question, and it is listed in §8.

---

## 5. Deadlock & starvation analysis

### 5.1 The wait-for graph today

Resource classes: **D** = `development-casting`, **S** = `soundstage`,
**C** = `set-scenery`, **P** = `post`.

| Held state | Holds | Waits for | Citation |
| --- | --- | --- | --- |
| preProduction held entering rehearsal (`remainingTicks 7`) | D | S | `operations.ts:534-537` |
| rehearsal held entering shooting (`remainingTicks 6`) | S | C | `operations.ts:537-539` (S is *retained*, `operations.ts:133-143`) |
| shooting held entering post (`remainingTicks 4`) | S, C | P | `operations.ts:539-541` |
| postProduction → releaseReady | P | *(nothing — `requirementsForPhase('releaseReady') === []`)* | `operations.ts:88-89` |

**Yes, production A can hold a stage while waiting for scenery held by B** — that is
exactly the `remainingTicks 6` row, and it is reachable today (Soundstage capacity is
1+1, Scenery is 2, so with two productions it is not, but with capacity-derived
concurrency it immediately is). [CODE]

**But there is no cycle today.** Define the rank D < S < C < P. Every held state waits
*strictly forward* in that rank, and the terminal holder (P) waits for nothing. The
wait-for graph is therefore a DAG and **circular wait is impossible**. This is *ordered
resource acquisition*, achieved accidentally by the pipeline's linear shape — it is not
stated anywhere in code or contract as a law, and nothing enforces it. [CODE]

Three Coffman conditions hold today (mutual exclusion, hold-and-wait, no preemption);
only circular wait is absent, and only by accident.

### 5.2 Enumerated circular-wait risks C2 introduces

| # | Cycle | Mechanism | Severity |
| --- | --- | --- | --- |
| **X1** | **Set ↔ Stage** | If a Set is reserved *before* the stage (e.g. reserved at greenlight or pre-production so it can be dressed) while another production reserves the stage first, then A holds Set→waits Stage and B holds Stage→waits Set. **Direct 2-cycle, permanent.** | **CRITICAL.** This is the single most likely C2 deadlock and it follows naturally from "Sets are reservable" (owner law 3) if reservation timing is not pinned. [PROPOSAL] |
| **X2** | **Set ↔ Set (multi-set film)** | The original's films used many sets — the Bible cites a *"250-scene movie shot entirely on one perfect-novelty set"* as a notable case (line 732), implying multi-set is normal. If a film acquires set-1 then waits for set-2 while another holds set-2 and waits set-1: **classic dining-philosophers**. | **CRITICAL** if multi-set films ship. [CORPUS] + [PROPOSAL] |
| **X3** | **Stage ↔ Scenery-shop** | Already latent (§5.1 `remainingTicks 6` row). Becomes a cycle only if scenery work ever needs a stage. If C2 models set *construction* as occupying the stage it will stand on, this closes into a cycle. | HIGH. [PROPOSAL] |
| **X4** | **Post ↔ Stage (reshoots)** | If post-production can demand a reshoot that needs a stage, a post-holder waits for a stage while a stage-holder waits for post. `PRODUCTION-OPERATIONS-V1-CONTRACT.md:141` lists *"reshoots"* as explicitly open — i.e. a live C2/C3 candidate. | HIGH if reshoots land. [DOC] + [PROPOSAL] |
| **X5** | **Crew/talent ↔ facility** | Owner law 1 names crew and stars as capacity. A film holding a stage while waiting for a crew member who is on another film's stage-held shoot is a cycle across two *different resource kinds*. Note talent exclusivity is already a whole-film lock at greenlight (`actions.ts:415-436`), which today prevents it — the moment crew become per-phase, it does not. | HIGH. [CODE] + [PROPOSAL] |
| **X6** | **Travel/layout** | Owner law 1 names *layout/travel*; the Bible states buildings placed far apart *"extends production time and adds to cost"* (line 136, `[OFFICIAL manual p.4]`). If travel is modelled as a resource (a route, a truck) rather than a duration, it joins the cycle graph. | MEDIUM — avoidable by modelling travel as **duration only**, never as a held resource. [CORPUS] + [PROPOSAL] |

### 5.3 The discipline that provably avoids them [PROPOSAL]

Four rules. The first two alone are sufficient; the last two are belt-and-braces and
buy legibility.

1. **DECLARED TOTAL RESOURCE ORDER (mandatory).** Every capability gets an explicit
   integer `acquisitionRank` declared in one table beside `FacilityCapability`
   (`types.ts:524-529`). A workflow may only *wait for* a resource of strictly higher rank
   than every resource it currently holds. Enforce it as an invariant in
   `assertStudioOperationsInvariants` (`operations.ts:334`+), in the same style as the
   existing reachable-blocker check (`operations.ts:531-548`). **This converts today's
   accidental DAG into a stated, tested law**, and it kills X1–X5 outright:
   `sets` must rank *after* `soundstage`, so a Set can never be held while a Stage is awaited.
2. **ATOMIC PER-GATE ACQUISITION (already true — keep it).** `allocateForPhase`
   (`operations.ts:116-172`) is already all-or-nothing: it returns a complete reservation
   set or writes nothing. Preserve this exactly when Sets join the bundle — never let a
   production acquire "the stage now, the set later". A partial acquisition *is* the
   hold-and-wait that rule 1 then has to police.
3. **NO PREEMPTION, EVER (keep it).** Nothing in the engine revokes a held reservation
   (`operations.ts` has no preemption path). Preemption would break the "engine state owns
   reservations" law and make the world lie (a crew mid-shoot evicted). Rule 1 makes it
   unnecessary.
4. **RANK-SAFE RETENTION.** The one retention exception (`operations.ts:133-143`,
   soundstage across Rehearsal→Shooting) is safe *because* it retains a resource whose rank
   is below the one being awaited. Any new retention (a Set retained across Rehearsal→
   Shooting, which owner law 3 arguably wants — the Bible notes sets are *"usable off-shoot
   for Star/Director rehearsal"*, line 695 [CORPUS]) must satisfy the same test and be
   asserted by the same invariant.

**Verification gate [PROPOSAL]:** a headless property test that, over N seeded runs with
capacity-derived concurrency, asserts (a) the wait-for graph is acyclic every week,
(b) no production's held-weeks exceed a stated bound, (c) `acquisitionRank` monotonicity
holds for every workflow. The harness already produces per-hold rows
(`src/harness/facilities/index.ts:1767-1862`) to feed it.

### 5.4 Starvation (distinct from deadlock — and the real live risk)

Deadlock is preventable by rule 1. **Starvation is present today and gets worse.**

| # | Mechanism | Evidence |
| --- | --- | --- |
| **S1** | **Priority is FIFO-by-greenlight, not by waiting time.** The sweep is ascending id (`operations.ts:629`) and each production takes first-fit. A production held 5 weeks at the stage gate loses to a lower-id production arriving fresh at the same gate this week. With 2 productions this is invisible; with 8 it is a permanent loser. | [CODE] |
| **S2** | **Within-week freed capacity flows only *downstream* in id order.** Resources are freed *inside* the same ascending-id loop: shooting→post frees S and C (`operations.ts:589-596`), post→releaseReady frees P, `remainingTicks→0` removes the workflow (`operations.ts:664-667`). A **lower-id** production already processed this week cannot see capacity freed later in the same sweep by a **higher-id** production wrapping. It waits an extra full week. Deterministic, but arbitrary and player-invisible. | [CODE] |
| **S3** | **Lexical id ordering past 9 same-week greenlights.** `prod-0012-10` sorts before `prod-0012-2` (`actions.ts:161-167`). Unreachable at cap 2; reachable at capacity-derived concurrency. The identical bug was found and fixed for construction ids (`studioCalendar.ts:387-393`). | [CODE] |
| **S4** | **Non-sticky `development-casting` reservations.** Retention is soundstage-only (`operations.ts:135-138`). A production sitting on the Annex (`facility-development-casting-annex`) that transitions Development→Pre-production will **migrate to `facility-development-casting` slot 0** if that lower-id slot freed at tick step 0.5, because allocation is first-fit ascending-by-id and the workflow's own slot is excluded from the occupancy set. The lot renders this as a *physical relocation* (`ui/src/engine/adapter.ts:5521-5531` maps an Annex reservation to the `expansion` place, otherwise `writers`/`casting`). Under owner law 8 this is a person visibly teleporting between buildings for no authoritative reason. **See §7 R-1 — this appears to contradict a frozen contract.** | [CODE] |

**Mitigation [PROPOSAL]:** the aging rule in §4.5 item 4 (`sort by descending weeksHeld,
then ascending queueOrdinal`) fixes S1 and bounds worst-case wait. S2 is fixed by a
**two-pass sweep**: pass 1 releases every resource due for release this week, pass 2
allocates — which also makes "wrap frees the stage" a legible single moment (and is the
natural home for the authoritative **wrap** transition the PF1 charter routes to C2).
S3 is fixed by the explicit integer `queueOrdinal`. S4 needs an owner/contract ruling.

---

## 6. What C2 must build, ranked by blocking-ness [PROPOSAL]

1. **Dynamic soundstage identity in the world.** W1/W2/W3/W4/W5/W6/W11. Until
   `LOT_STAGE_BY_SOUNDSTAGE_ID` (`adapter.ts:5343-5346`) is a derived map rather than a
   two-entry literal, owner law 4 cannot ship — the lot throws.
2. **Buildable soundstage / set-scenery / post blueprints.** `FACILITY_BLUEPRINTS`
   (`tuning.ts:748-754`) has no production-capacity blueprint outside `development-casting`.
3. **Sets as a capability + `acquisitionRank` table.** §5.3 rule 1.
4. **Queue state + `queueOrdinal` + aging.** §4.5.
5. **`occupiedBy` + `remedy` on the capacity blocker.** §3.1 — the law-2 completion.
6. **Two-pass release/allocate sweep and the authoritative wrap.** §5.4 S2.
7. **New capacity-time denominators for every `slotUtilPct` study.** §1.2 A5.

---

## 7. Risks, gaps, and contradictions — reported loudly, not resolved

**R-1 — [CODE] vs [DOC] CONTRADICTION: "no reservation migration".**
`docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:494-495` requires evidence that
*"Development-to-Pre-production **retains the production's existing slot**"*, and `:500`
requires *"no reservation migration"*. `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:243-244`
adds *"existing reservations never move merely because another facility became available."*
But `src/core/operations.ts:135-138` retains **only** `soundstage`; every other capability
is re-allocated first-fit ascending-by-facility-id. Since
`facility-development-casting` < `facility-development-casting-annex` lexically, a
production holding the Annex at Development will move to the base facility at
Pre-production whenever a base slot freed. **Either the contract's wording is loose
("retains *a* slot") or the code violates it.** I am not resolving this. It is materially
important for C2 because the lot renders the two facilities as different physical places
(`ui/src/engine/adapter.ts:5521-5531`). Verify empirically before designing on it.

**R-2 — [DOC] vs [DOC]/[CODE] AMBIGUITY: the "wrap" transition.** The brief
(`00-C2-PLANNING-BRIEF.md:66`) routes to C2 *"the authoritative **wrap** transition
(shooting → post does not exist today)"*. A shooting→post *state* transition demonstrably
does exist: `operations.ts:670-681` calls `enterPhase(postProduction)` at
`remainingTicks 4 → 3`, `PRODUCTION-OPERATIONS-V1-CONTRACT.md:38-44` tables it, and
`operations.ts:517-520` invariants it. The most plausible reading is that the *event/emission*
does not exist (the brief at `:64-65` states the engine emits no events today). Reported,
not resolved.

**R-3 — [DOC] GAP: the concurrency specifics were never ruled.**
`THE-MOVIES-PARITY-MASTER-PLAN.md:569-573` lists as **"Still required from the Owner"**:
*"Concurrency/capacity specifics — before C2 freeze … target concurrent-production range at
mature build-out, and which constraint should bind first (stages, sets, casting/development
slots, crew, talent)."* The 2026-08-18 owner laws supply the *principle* (law 1) and the
*queue rule* (law 2) but **not the target range and not the binding constraint.** C2 cannot
tune throughput without both. See §8 D-1/D-2.

**R-4 — [DOC] CONTRACT BOUNDARY: raising the ceiling is out of scope by two frozen contracts.**
`docs/FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:252` names *"raising
`MAX_CONCURRENT_PRODUCTIONS` or changing phase durations/allocation order"* as an excluded
change; `docs/DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538` lists *"raising the
two-production ceiling, future scheduling, priority controls, or reservation queues"* as
explicitly open after V1. C2's charter must **explicitly supersede** both, in writing, or
implementation will be blocked by its own governance.

**R-5 — [CODE] MEASUREMENT DISCONTINUITY.** Every frozen balance corpus (M0A, D-12, D-16,
D-17A/B) was generated with agents that stop at the cap (`agents.ts:62`,
`harness/d16/policies.ts:334`, `harness/d16/driver.ts:443`) and with utilization metrics
denominated in `weeks × 2` (`run-final-balance.ts:277`, `run-writer-bottleneck-study.ts:302`).
**Post-C2 numbers are not comparable to any pre-C2 number without a re-baseline.** This is
the biggest silent-invalidation risk in the campaign.

**R-6 — [CODE] SILENT DROP, NOT A CRASH.** `adapter.ts:6327` and `:6401` use
`prods.slice(0, STAGE_IDS.length)` on the legacy path. More than two legacy productions are
**silently omitted from the world** with no error. Under owner law 8 ("visible activity must
correspond to authoritative work") a silent omission is worse than a throw.

**R-7 — [CODE] COPY ALREADY PROMISES A QUEUE THE ENGINE DOES NOT HAVE.**
`ui/src/engine/adapter.ts:5702` renders *"Development & Casting is full — auditions are
waiting for a slot"*, but `castingSessions.ts:301-303` **refuses** the start outright.
Nothing is waiting. Similarly `ui/src/lot/LotCastingReviewPanel.test.tsx:160-168` asserts a
fixture headline *"No production slot is available"* / remedy *"Wait for a current picture
to release its production slot."* which does not exist in any non-test source — a lookalike
string that will silently outlive the copy it mirrors.

**R-8 — [CODE] `FacilityCapability` is a closed union with a `Record`-typed label map.**
`types.ts:524-529` plus `studioCalendar.ts:190-195` and `adapter.ts:624-630`
(`Record<FacilityCapability, string>`) means adding a `sets` capability is compile-guarded
in the good sense (every switch must be updated) — but the **capability→facility-name
labels** (`set-scenery → 'Scenery Shop'`) will read as building names, not capabilities,
the moment a second facility of a kind exists.

**R-9 — [CORPUS] NOT A QUEUE IN THE ORIGINAL.** The original game had **no reservation
queue**. It had a hard block with a red visual marker (Bible lines 519, 540, 1026, 1069).
Owner law 2 is therefore a **deliberate modernization beyond the corpus**, not a parity
restoration. The corpus supplies the *legibility* shape (name the missing resource on the
object that needs it) but not the queue mechanics. Also unresolved in the corpus itself:
Bible line 1095/3962 records that no capture exists of the actual refusal feedback
(*"Need 15-20s clip of a set flagged 'in red' … to see the game's actual rejection/blocking
feedback (tooltip text, sound, or refusal animation)"*).

**R-10 — [CORPUS] SET GENRE WEIGHTS ARE SCHEMA-CONFIRMED, VALUES ARE NOT.**
`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/set_definition_schema.csv` row `TECH-SET-008`
confirms sets carry per-genre numeric weights and a `priority1` genre field, but explicitly
states it *"Does NOT yet establish whether stock vanilla sets used multiple non-zero weights
in practice, or what those weights were."* `set_catalog.csv` has 39 data rows and many
`$?` / `n/a` cells with `claim_status = INCOMPLETE`. Genre-weighted set matching (owner law 3)
must be designed from the *shape*, with our own numbers — consistent with master plan §11
("original numeric values are evidence, not spec").

**R-11 — [CODE] PF1 ROBUSTNESS.** PF1 is ui-only and does not touch `src/core`
(brief `:56-58`), so nothing in this lane's engine findings depends on PF1 landing. But
every UI site in §1.3/§1.4 lives in files PF1 is actively editing
(`ui/src/screens/Dashboard.tsx`, `ui/src/engine/adapter.ts`, `ui/src/lot/*`). **Merge
contention is near-certain**; C2 should sequence UI work after PF1 seals, or accept
rebasing. If a PF1 milestone is KILLED, none of §1–§5 changes.

**R-12 — [CODE] SAVE FORMAT.** Current save = **V13** (brief `:53`; `src/core/save.ts:267`
`SaveFileV13`). Any queue state (`queued` productions, `queueOrdinal`, `queuedWeek`,
Set reservations) is new persisted authority ⇒ **V14**, with the full frozen-projection /
exact-key / migration discipline of laws 18–21. PF1 explicitly ships no V14 (brief `:58`),
so C2 owns the version bump alone.

---

## 8. Owner decisions this lane cannot make

- **D-1 — Target concurrent-production range at mature build-out.** Named as required
  before C2 freeze (`THE-MOVIES-PARITY-MASTER-PLAN.md:570-572`); still unanswered.
- **D-2 — Which constraint binds first** (stages / sets / dev-casting / crew / talent).
  Same citation. §4.5 cannot be tuned without it.
- **D-3 — Is talent capacity or a package decision?** Owner law 1 lists writers/stars/crew
  as capacity. If capacity, F8 (`actions.ts:415-436`, `scriptReadModel.ts:601-615`) must
  become a queue and greenlight-time whole-film exclusivity must break into per-phase
  claims — a large economy change. If a package decision, F8 stays a refusal.
- **D-4 — Does a queued production commit cash and lock talent at greenlight?**
  Today greenlight debits negative+marketing+freelancer fees (`actions.ts:527-545`) and
  locks talent exclusively (`actions.ts:415-436`). Candidate A is only viable if the answer
  is "no".
- **D-5 — Delete `MAX_CONCURRENT_PRODUCTIONS`, or keep it as a guard rail?**
  §4.5 item 1. Deleting it invalidates T1/T2/T3 and six governing docs (§1.6).
- **D-6 — R-1: does `operations.ts:135-138` violate the Annex contract's
  "no reservation migration"?** Contract amendment or code fix — owner's call.
- **D-7 — Re-baseline policy for the frozen corpora (R-5).** Regenerate, or freeze the old
  numbers as historical-only?
- **D-8 — Does C2's charter explicitly supersede `FACILITIES-CONSTRUCTION-RESEARCH-CONTRACT.md:252`
  and `DEVELOPMENT-CASTING-ANNEX-V1-CONTRACT.md:538`?** (R-4.)
- **D-9 — Aging vs strict FIFO for queue priority** (§4.5 item 4 / §5.4 S1). Aging is
  fairer and bounds wait; strict FIFO is simpler to explain. Both are deterministic.

---

*Lane 2 complete. No file outside this report was created or modified.*
