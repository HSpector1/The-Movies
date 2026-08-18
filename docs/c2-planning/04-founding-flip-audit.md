# LANE 4 — FOUNDING FLIP DEPENDENCY AUDIT

> C2 advance planning, 2026-08-18. Branch `c2-sets-throughput-plan`, worktree
> `/Users/bruce/The Movies - C2 Planning`, base = sealed C1 `main` @ `f294077`.
> **PLANNING ONLY.** Every claim below is tagged `[CODE]` (observed in this
> worktree's source, with `file:line`), `[DOC]` (a governing document in this
> repo, with file + section), `[CORPUS]` (the read-only evidence corpus at
> `/Users/bruce/Desktop/Big Swing Art/`, with file + row), or `[PROPOSAL]`
> (this lane's recommendation — not observed anywhere).
>
> The Flip is RATIFIED (brief law 6). This report does **not** re-litigate it. It
> answers exactly one question: *what must be true before C2 can perform it once,
> safely, without breaking the sealed First Movie Journey or any migrated save.*

---

## 0. Headline

**The Founding Flip is blocked on FOUR buildable-from-scratch blueprints that C1 did
not ship, and on ONE hard engine invariant that makes a building-less managed studio
structurally illegal today.**

`assertStudioOperationsInvariants` requires a managed studio to hold at least one
facility of each of `development-casting`, `soundstage`, `set-scenery`, and `post`
— unconditionally, before any facility policy branch runs
(`src/core/operations.ts:364-371` `[CODE]`). A post-Flip studio spawning on bare
land has none of them. That invariant is the single hardest structural pin in the
Flip's path, and it fires at the exact moment the player founds
(`applyActivateStudioOperations`, `src/core/actions.ts:1225-1277` `[CODE]`, reached
from the real player boundary `foundManagedStudioAction`,
`ui/src/engine/adapter.ts:3147-3159` `[CODE]`).

Secondary but equally load-bearing: **the ground under the buildings that the Flip
removes belongs to no parcel**, so freeing it does not make it buildable — it makes
it `notOwned` (§3.4 below). The Flip is therefore also a property re-authoring job,
not only a "delete the structures" job.

---

## 1. What a fresh studio spawns TODAY

### 1.1 `generateWorld` — the headless world

`generateWorld(seed)` (`src/core/worldgen.ts:613-684` `[CODE]`) is deliberately
**employment-free, economy-disengaged, and system-legacy**. It produces:

| Root | Value at spawn | Cite |
|---|---|---|
| `studio.cash` | `TUNING.INITIAL_CASH` = **$20,000,000** | `worldgen.ts:624`, `tuning.ts:51` `[CODE]` |
| `studio.standing` | `{...INITIAL_STANDING}` | `worldgen.ts:625` `[CODE]` |
| `studio.activeProductions` / `releasedFilms` | `[]` / `[]` | `worldgen.ts:626-627` `[CODE]` |
| `founding` | `null` — no draft is open | `worldgen.ts:645` `[CODE]` |
| `contracts` / `freeAgents` / `ledger` | `[]` | `worldgen.ts:646-649` `[CODE]` |
| `economyEngagedEver` | `false` (the ONLY place it is ever set false) | `worldgen.ts:658` `[CODE]` |
| `operations` | `emptyStudioOperations()` → `{mode:'legacy', facilities:[], workflows:[]}` | `worldgen.ts:665`, `operations.ts:44-46` `[CODE]` |
| `scriptDevelopment` / `castingSessions` / `construction` / `placement` | all `mode:'legacy'`, empty | `worldgen.ts:668-677` `[CODE]` |
| `property` | `initialProperty()` — a deep **copy** of `INITIAL_PROPERTY` | `worldgen.ts:682`, `lot.ts:304-306` `[CODE]` |
| talent | 12 writers + 10 directors + 28 actors + 10 craft = **60** | `worldgen.ts:138-143` `[CODE]` |
| concepts | `WORLD_CONFIG.conceptCount` | `worldgen.ts:547` `[CODE]` |

**Note the asymmetry that matters to the Flip:** every world — headless, migrated, or
player — carries a full `property` with all eight buildings on it, from the first
byte. Buildings are NOT gated behind founding. `worldgen.ts:679-682` states this
explicitly: *"every world — headless, migrated, or player — carries its own property."*

### 1.2 The founding draft — `beginFounding`

`beginFounding(state)` (`src/core/employment.ts:403-425` `[CODE]`) is the pure entry
point a PLAYER game calls (never `generateWorld`). It:

- draws an applicant pool per role from the `hiring` stream: 11 actors, 4 directors,
  6 writers, 3 craft (`tuning.ts:344-347` `[CODE]`),
- seeds `founding.budget = TUNING.HIRING_FOUNDING_BUDGET` = **$6,000,000**
  (`tuning.ts:352` `[CODE]`) — explicitly a **recruitment fund (signing-bonus pool),
  NOT cash** (`employment.ts:412-416`; `types.ts:445-446` `[CODE]`),
- flips `economyEngagedEver` to `true`, monotonically forever (`employment.ts:423`
  `[CODE]`),
- correlates concept negative-cost with baseline strength (`employment.ts:410`
  `[CODE]`).

Founding minimums to close the draft: 3 actors, 1 director, 1 writer, 1 craft
(`tuning.ts:348-351` `[CODE]`), enforced at `applyFoundStudio`
(`src/core/actions.ts:1211-1223` `[CODE]`).

### 1.3 The nine buildings — and why the code says eight

`INITIAL_PROPERTY_STRUCTURES` (`src/core/lot.ts:194-263` `[CODE]`) holds **EIGHT**
`PropertyStructure` records. The renderer's `FoundingBuildingId` union holds **NINE**
ids (`ui/src/lot/snapshot/StudioLotSnapshot.ts:24-33`, `769-779` `[CODE]`) — the
eight structures plus `expansion`, which in the engine is a **parcel**
(`LEGACY_EXPANSION_PARCEL_ID`, `lot.ts:55`, `112-117` `[CODE]`), not a structure.

That is the whole reconciliation of "nine" vs "eight". `lot.ts:170` says out loud:
*"the eight physical bodies the studio starts with."*

| # | Structure id | Label | `role` | Origin (gx,gy) | Footprint (w×d) | `providesFacilityIds` | Master plan §6 verdict `[DOC]` |
|---|---|---|---|---|---|---|---|
| 1 | `gate` | Studio Gate | `landmark` | 8,23 | 3×1 | `[]` | **PERMANENT LANDMARK** |
| 2 | `admin` | Administration | `landmark` | 9,2 | 3×3 | `[]` | **PERMANENT LANDMARK** |
| 3 | `theater` | Theater | `landmark` | 3,16 | 3×2 | `[]` | **LANDMARK (lean)** — final call at the Flip review |
| 4 | `writers` | Development | `founding` | 3,2 | 3×2 | `['facility-development-casting']` | **CONVERT** → buildable tiered Development Office |
| 5 | `casting` | Casting / Talent | `founding` | 3,9 | 3×2 | **`[]`** | **CONVERT** → buildable Casting Office |
| 6 | `stage-a` | Stage A | `founding` | 17,2 | 4×4 | `['facility-soundstage-07']` | **CONVERT** → buildable Soundstage (C2) |
| 7 | `stage-b` | Stage B | `founding` | 17,9 | 4×4 | `['facility-soundstage-12']` | **CONVERT** → buildable Soundstage (C2) |
| 8 | `post` | Production / Post | `founding` | 18,18 | 3×2 | `['facility-post-building','facility-scenery-shop']` | **CONVERT** → buildable Production/Post |
| (9) | `expansion` | (Annex Expansion Parcel) | *parcel, not structure* | rect 7,15–10,18 | 4×4 cells | reserved for `development-casting-annex` | already the placed-facility pattern |

All eight footprints are **half-open** from the origin (`lot.ts:29-33`, `374-382`
`[CODE]`), whereas parcels and roads are **inclusive** rects. The two conventions are
deliberately different and are never mixed — a Flip that re-authors the parcel map
must respect this.

**Accepted C1 anomaly, load-bearing for the Flip:** `casting` provides **nothing**
(`lot.ts:230-238` `[CODE]`). The engine models ONE shared `Development & Casting`
facility and its body stands at `writers`. The Casting / Talent building is a real
body on real ground with no separate engine capacity behind it. `[CODE]`
`tests/property-state-v13.test.ts:186-189` asserts this exact fact as a pin.

### 1.4 The engine capacity the buildings house

`INITIAL_STUDIO_FACILITIES` (`src/core/operations.ts:21-32` `[CODE]`) — five frozen
records, installed wholesale by `initialManagedStudioOperations()`
(`operations.ts:48-54` `[CODE]`):

| Facility id | Name | Capability | Capacity | Housed in |
|---|---|---|---|---|
| `facility-development-casting` | Development & Casting | `development-casting` | 2 | `writers` |
| `facility-post-building` | Post Building | `post` | 2 | `post` |
| `facility-scenery-shop` | Scenery Shop | `set-scenery` | 2 | `post` |
| `facility-soundstage-07` | Soundstage 7 | `soundstage` | 1 | `stage-a` |
| `facility-soundstage-12` | Soundstage 12 | `soundstage` | 1 | `stage-b` |

Total slots at founding: **8** (2 D&C + 2 post + 2 scenery + 1 + 1 stage).

### 1.5 How "founding placement" was ACTUALLY implemented in C1 — a divergence from §6

Master plan §6 staging says: *"today's nine become **founding placements** in data
with their BuildingIds preserved verbatim (the exact grandfathering pattern the Annex
blueprint already uses — `facilityIdBase` carries the V11 identity)"* `[DOC]`
(`THE-MOVIES-PARITY-MASTER-PLAN.md:240-248`).

**What C1 actually shipped is a different representation.** The eight bodies are
`PropertyStructure` records on `state.property.structures`
(`types.ts:1173-1184`, `1197-1203` `[CODE]`) — a **new state root with a new type** —
NOT `PlacedFacility` records in `state.placement.facilities`
(`types.ts:945-961` `[CODE]`). They carry **no** `blueprintId`, no `placementId`, no
`projectId`, no `capex`, no `status`, no `completesWeek`, and no ledger row. They are
property, not placements.

`placement.ts:85-88` states this explicitly `[CODE]`:
> *"Founding STRUCTURES are excluded by construction — both verbs take a placementId,
> and a structure is property with no placement record at all — and that is asserted
> rather than assumed."*

**This is the single most consequential fact in this audit.** The Flip cannot be
implemented as "let the player build the same records the founding studio already
had", because a founding structure and a player-built facility are *different types
living in different state roots with different lifecycles*. C2 must decide, and the
decision is an Owner-visible architectural call (§7 / decisions list):

- **(A) Structures become placements at the Flip.** A fresh studio has zero
  structures except `gate`/`admin`; everything else is a `PlacedFacility`. Migrated
  saves keep their structures. Two representations coexist forever.
- **(B) Structures stay the representation; the Flip merely spawns fewer of them.**
  Then "buildable from scratch" must produce a *structure*, which placement.ts
  cannot do today (its commit path only writes `PlacedFacility`).
- **(C) Unify: placements gain a `founding` flag, structures are retired.** Largest
  blast radius; cleanest end state; would need a V14 conversion for every migrated
  save.

`[PROPOSAL]` (A) is the lowest-risk path and the one master plan §6 item 3 already
implies ("migrated saves … simply own their founding placements"). It is recommended,
but it is not what the code does today and must be named in the charter, not assumed.

---

## 2. The ENTIRE first-movie chain, stage by stage, mapped to facility

`firstFilmJourney(state)` (`src/core/firstFilmJourney.ts:777-824` `[CODE]`) is a
pure, save-neutral, RNG-free projection over authoritative state. Its frozen stage
union is eight members (`firstFilmJourney.ts:73-85` `[CODE]`):
`no-picture | drafting | script-review | ready-to-package | auditioning |
audition-review | in-production | released`.

Below, each stage is joined to (a) the action or tick step that advances it, (b) the
**facility capability** the engine actually reserves, and (c) what happens on a
post-Flip lot that lacks that facility.

### 2.1 The definitive stage → facility table

| # | FMJ stage | Journey `site` | Advancing action / tick step | **Capability reserved** | Facility (today) | Behaviour with facility ABSENT |
|---|---|---|---|---|---|---|
| 0 | *(pre-journey)* founding | — | `foundStudio` + `activateStudioOperations` | — (but see §3.1) | — | **HARD THROW** — invariant `operations.ts:364-371` |
| 1 | `no-picture` | `development` | `commissionScript` | **`development-casting`** ×1 | `facility-development-casting` | `scriptReadModel.ts:536-547` `[CODE]` blocker `facility-capacity`; copy at `scriptReadModel.ts:866-877` already says *"No Development & Casting facility is available."* |
| 2 | `drafting` (also `rewriting`) | `null` (advance-week) | tick script step | holds the D&C reservation for the week | `facility-development-casting` | n/a — reservation already held |
| 3 | `script-review` | `development` | `acceptScript` / `requestScriptRewrite` | none new (accept is free — `scriptReadModel.ts:680`) | — | none |
| 4 | `ready-to-package` | `casting` | `startCastingSession` **or** open package | **`development-casting`** ×1 | `facility-development-casting` | `castingSessions.ts:240-252` `[CODE]` finds no D&C facility → no session can start |
| 5 | `auditioning` | `null` | tick casting step | holds D&C for 1 week (`CASTING_SESSION_WEEKS: 1`, `tuning.ts:837`) | `facility-development-casting` | n/a |
| 6 | `audition-review` | `casting` | `acknowledgeCastingSession` | none | — | none |
| 7 | → greenlight | (from `ready-to-package`) | `greenlightScriptProject` | **`development-casting`** ×1 (workflow at phase `development`) | `facility-development-casting` | `addManagedProductionWorkflow` **THROWS**: *"no development-casting capacity"* (`operations.ts:216-220` `[CODE]`) |
| 8 | `in-production` — `development` (rt 8) | `stage`/`post` | tick | `development-casting` | `facility-development-casting` | held |
| 9 | `in-production` — `preProduction` (rt 7) | `stage` | tick | `development-casting` | `facility-development-casting` | **stalls** (blocker, not throw) — `enterPhase`, `operations.ts:556-575` `[CODE]` |
| 10 | `in-production` — `rehearsal` (rt 6) | `stage` | tick | **`soundstage`** | `facility-soundstage-07/12` | **stalls forever** — no copy exists for "you have no soundstage" |
| 11 | `in-production` — `shooting` (rt 5→4) | `stage` | `scheduleShootingTake`, `assignShootingDirector`, `clearSceneryLoadIn` | **`soundstage` + `set-scenery`** | soundstage + `facility-scenery-shop` | **stalls forever** |
| 12 | `in-production` — `postProduction` (rt 3,2) | `post` | tick | **`post`** | `facility-post-building` | **stalls forever** |
| 13 | `in-production` — `releaseReady` (rt 1) | `null` | tick | **none** (`operations.ts:90-91`) | — | none |
| 14 | `released` | `development` (next picture) | tick release step | none | (`theater` shows presence, provides nothing) | none |

Phase→capability authority: `requirementsForPhase` (`src/core/operations.ts:79-93`
`[CODE]`). Phase→remainingTicks authority: `productionPhaseForRemainingTicks`
(`operations.ts:56-77` `[CODE]`), range [1,8], `PRODUCTION_TICKS: 8`
(`tuning.ts:49`).

### 2.2 THE DEFINITIVE REQUIRED-FACILITY LIST for "found → first release"

Reading the table as a set, a studio needs — **at minimum, one slot each** — exactly
four capabilities to carry one picture from commission to release:

| Required capability | Min slots for ONE picture | First stage that needs it | Today's home |
|---|---|---|---|
| `development-casting` | **1** | commission (stage 1) | `writers` |
| `soundstage` | **1** | rehearsal (stage 10) | `stage-a` / `stage-b` |
| `set-scenery` | **1** | shooting (stage 11) | `post` (Scenery Shop) |
| `post` | **1** | post-production (stage 12) | `post` (Post Building) |

Nothing else in the chain reserves a facility. The `admin` and `theater` landmarks,
and the `gate`, are reserved by **nothing** — they provide no capacity at all
(`lot.ts:203`, `211`, `219` `[CODE]`).

**Two schedule facts the Flip must respect:**

1. `development-casting` is needed at week 0 of the picture; `soundstage` not until
   the picture is 6 weeks from release; `set-scenery` at 5; `post` at 3. On the C1
   8-week schedule that is **≥2 weeks of slack** between greenlight and needing a
   stage, and **≥5 weeks** before needing post. `[PROPOSAL]` The Flip can therefore
   legitimately let the player *start* a picture before the stage is finished, which
   is a strong opening-act shape: commission while the stage is under construction.
2. `set-scenery` is currently housed in the SAME body as `post`
   (`lot.ts:256-262` `[CODE]`). A buildable-from-scratch "Production/Post" blueprint
   that provides both capabilities preserves that fact; two separate blueprints
   changes it. This is a design fork the charter must name.

### 2.3 Concurrency ceiling — an independent gate, unaffected by the Flip

`greenlight` refuses above `MAX_CONCURRENT_PRODUCTIONS: 2` regardless of physical
capacity (`tuning.ts:50`; enforced `src/core/actions.ts:333` `[CODE]`, surfaced
`scriptReadModel.ts:624-633` `[CODE]`).

**Nit / brief correction:** the brief cites `src/core/actions.ts:332`; the actual
enforcement line at `f294077` is `actions.ts:333` (the `if` opens at 333, the message
at 335). Recorded so a later reader is not sent one line short.

---

## 3. Build-path gap: what C1 shipped vs what the Flip needs

### 3.1 What FACILITY_BLUEPRINTS actually contains after C1

`FACILITY_BLUEPRINTS` (`src/core/tuning.ts:748-754` `[CODE]`) — **exactly five
entries**, all defined in `tuning.ts`, all read through `blueprintById`
(`placement.ts:238`):

| Blueprint id | Name | `capability` | `capacity` | capex | build weeks | weekly opex | footprint | `requires` | `maxInstances` | Cite |
|---|---|---|---|---|---|---|---|---|---|---|
| `development-casting-annex` | Development & Casting Annex | `development-casting` | **1** | $780,000 | 13 | $3,500 | 3×2 | `[]` | ∞ | `tuning.ts:598-623` |
| `development-casting-hall` | Development & Casting Hall | `development-casting` | **2** | $1,400,000 | 20 | $6,000 | 4×3 | `[]` | ∞ | `tuning.ts:701-718` |
| `development-office-2` | Development Office II | `development-casting` | **0** | $600,000 | 8 | $2,500 | 3×2 | `[]` | 1 | `tuning.ts:649-667` |
| `development-office-3` | Development Office III | `development-casting` | **0** | $1,200,000 | 12 | $4,000 | 3×2 | facility `development-office-2` | 1 | `tuning.ts:675-693` |
| `craft-annex` | Craft Services Annex | `set-scenery` | **0** | $400,000 | 6 | $2,000 | 3×2 | `[]` | 1 | `tuning.ts:728-746` |

`facilityEffects.ts` (`src/core/facilityEffects.ts:1-149` `[CODE]`) is the one effects
authority: `developmentOfficeEstUplift` (+4 / +9 EST, highest tier wins, never
stacks) and `freelancerFeeMultiplier` (−15%). **No effect in that module is a
capability grant.** Effects are quality/price levers, not capacity.

### 3.2 THE BUILD-PATH GAP LIST — what C2 must close

Measured against the §2.2 required-facility list:

| Required capability | Buildable-from-scratch blueprint exists after C1? | What exists instead | **GAP** |
|---|---|---|---|
| `development-casting` | **PARTIAL** | `development-casting-annex` (cap 1) and `development-casting-hall` (cap 2) both provide the capability from zero, unconditionally (`requires: []`) | **NO HARD GAP for the capability itself.** But both are named and priced as *additions to an existing plant* ("Adds one shared Development & Casting slot", `tuning.ts:616-617`), and neither carries the `writers` identity. C2 needs a **baseline Development Office / Casting Office** blueprint pair whose copy and price are "the studio's first", plus a decision on whether the Casting body gets its own capability (see §3.3). |
| `soundstage` | **NO — TOTAL GAP** | nothing. `capability: 'soundstage'` appears in zero blueprints. `grep` over `tuning.ts` finds it only in `INITIAL_STUDIO_FACILITIES` (`operations.ts:30-31`) and `requirementsForPhase` (`operations.ts:85-87`). | **Buildable Soundstage blueprint required.** C2's own subject matter (master plan §6 staging `[DOC]`, §7.2). |
| `set-scenery` | **NO — TOTAL GAP for capacity** | `craft-annex` has `capability: 'set-scenery'` but **`capacity: 0`** (`tuning.ts:732`). A capacity-0 placement never enters the shared-capacity registry (`placement.ts:360-364`, `775-779` `[CODE]`). It cannot satisfy a shooting-phase reservation. | **Buildable Scenery/Set blueprint with capacity ≥ 1 required.** |
| `post` | **NO — TOTAL GAP** | nothing. `capability: 'post'` appears in zero blueprints. | **Buildable Production/Post blueprint required.** |

**Master plan §6 said C2 would deliver: "Development, Casting, and Production/Post
gain buildable-from-scratch blueprints" and "Sets and Soundstages become buildable
classes"** `[DOC]` (`THE-MOVIES-PARITY-MASTER-PLAN.md:249-255`).

**Verified against C1 as shipped:** none of the four were delivered in C1, and C1
never claimed them — master plan §9 explicitly excludes them: *"Explicitly NOT in C1:
soundstages and Sets (C2, per §6)"* `[DOC]` (`:407-409`). The C1 campaign log's M4
ruling records 4 of 6 catalog entries shipped, with `scenery-annex` **STOPPED** on
merits (*"extra set-scenery capacity is provably a no-op at the two-production
ceiling"*) and `publicity-wing` STOPPED on an authority conflict
`[DOC]` (`LOT-CONTENT-EXPANSION-LOG.md:222-251`).

So: **the plan and the code agree. The gap is exactly the four rows above, and it is
100% C2's to close.** No C1 slippage to reconcile here.

### 3.3 Four secondary blueprint-schema gaps the Flip surfaces

1. **`FacilityBlueprint` has no way to provide TWO capabilities.** `capability` is
   singular (`tuning.ts:601`, `types.ts` blueprint shape; every blueprint sets one).
   Today `post` the *structure* houses both `facility-post-building` (post) and
   `facility-scenery-shop` (set-scenery) via `providesFacilityIds` — a **list**
   (`lot.ts:261` `[CODE]`). A single buildable "Production / Post" blueprint cannot
   reproduce that. `[PROPOSAL]` Either widen `FacilityBlueprint` to a capability
   list, or split Post and Scenery into two blueprints and accept that the Flip
   changes the founding plant's shape.
2. **The Casting body has no capability of its own** (§1.3). If C2 ships a "Casting
   Office" blueprint, it either (a) also provides `development-casting` — making the
   split cosmetic — or (b) introduces a **new capability** (`casting`), which is a
   change to `requirementsForPhase`, to `scriptReadModel`'s capacity view
   (`scriptReadModel.ts:384-464` `[CODE]`), to `castingSessions.ts:240-252`, and to
   the four-capability invariant at `operations.ts:364-371`. That is a real
   throughput-model decision and belongs in the concurrency ruling, not in the Flip.
3. **`blueprintInstanceCount` does not count founding structures**
   (`blueprintRequirements.ts:191-201` `[CODE]`, comment: *"Founding structures are
   deliberately not counted"*). Post-Flip that is correct. **Pre-Flip (migrated
   saves) it is a live double-count risk**: a migrated studio with the `writers`
   structure could also build a "Development Office I" blueprint and end up with two
   baseline offices, one of which the instance limit never saw.
4. **The `structure` requirement kind is LIVE** (`blueprintRequirements.ts:50-53`,
   `142-147` `[CODE]`): `blueprintRequirementMet` for `kind:'structure'` tests
   `propertyOf(state).structures.some(s => s.id === requirement.structureId)`. Any
   future blueprint that requires `structureId: 'writers'` would be **permanently
   unbuildable on a post-Flip studio** and buildable on every migrated one. No such
   blueprint exists today (`requires` is `[]` on four of five, and the fifth requires
   a *facility*), so this is a trap, not a bug — but it must be written into the
   charter as a rule: **post-Flip blueprints may only require `gate`/`admin`
   structures, or nothing.**

### 3.4 The ground problem — the Flip is a property re-authoring job

`lot.ts:91-94` states the authored fact plainly `[CODE]`:
> *"NO PARCEL OVERLAPS ANY STRUCTURE FOOTPRINT."*

`parcelAt` returns `null` for any cell outside every parcel rect (`lot.ts:400-406`
`[CODE]`), and placement rejects such a cell as `notOwned`
(`types.ts` `PlacementRejection` union; `notOwned` is rejection #3 in binding order).

**Consequence:** if the Flip removes `writers`, `casting`, `stage-a`, `stage-b`,
`post`, and possibly `theater`, the ~56 cells they vacate become ground that belongs
to no parcel — i.e. **unbuildable**, not "freed". The Flip must therefore ship a
re-authored `LOT_PARCELS` (or a migration that grows parcels over the vacated
footprints).

Buildable ground on the initial property today, computed from `LOT_PARCELS`
(`lot.ts:96-167` `[CODE]`; rects are inclusive):

| Parcel | Terrain | Rect | Cells | Road frontage? |
|---|---|---|---|---|
| `backlot-apron` | buildable | 23,20–26,24 | 20 | yes (back-lot road 14,21–22,22) |
| `courtyard` | **blocked** | 7,10–11,14 | 25 | — |
| `expansion` | buildable | 7,15–10,18 | 16 | yes — but **RESERVED** to `development-casting-annex` only (`placement.ts:221-228` `[CODE]`) |
| `north-back-lot` | buildable | 21,0–27,5 | 42 | **NO** (`lot.ts:87-89` — deliberately unserved) |
| `north-court` | buildable | 6,2–8,6 | 15 | yes |
| `north-lawn` | buildable | 0,2–2,6 | 15 | yes |
| `service-yard` | **blocked** | 21,16–26,18 | 18 | — |
| `south-lawn` | buildable | 3,19–8,22 | 24 | yes |
| `stage-south` | buildable | 15,16–17,20 | 15 | yes |
| `west-lawn` | buildable | 0,9–2,14 | 18 | yes |

**Road-served, unreserved buildable ground today: 20 + 15 + 15 + 24 + 15 + 18 = 107
cells**, spread across six disjoint parcels, the largest of which is 24 cells
(`south-lawn`, 6×4).

A soundstage sized like `stage-a` is 4×4 = 16 cells **plus a clearance ring of 1**
(`clearanceRing`, applied *between placements only* — `placement.ts:18-27` `[CODE]`),
which in practice needs a 6×6 = 36-cell envelope. **No single existing buildable
parcel can hold two such stages with clearance.** `south-lawn` (6×4) cannot even hold
one 4×4 with a full ring.

**This is a hard, concrete Flip finding:** at C1's parcel map, a post-Flip studio
literally cannot build the plant it would have been given. The Flip must ship
re-authored parcels, and probably a relaxed or re-scoped clearance rule for the
founding core. Note also `placement.ts:18-27` records that extending clearance to
authored structures would newly reject 311 origins — the reverse operation (turning
structures into placements) makes clearance *bind* where it never did.

---

## 4. The journey projection: extending it upstream

### 4.1 How `firstFilmJourney` speaks semantic sites (law 12)

`JourneySite = 'development' | 'casting' | 'stage' | 'post' | 'admin'`
(`src/core/firstFilmJourney.ts:96` `[CODE]`). `SITE_PLACE`
(`firstFilmJourney.ts:124-130` `[CODE]`) is *"the ONLY place a site becomes a spoken
place name, and it stays deliberately generic: it names the studio function, not a
renderer building instance."* The module header (`firstFilmJourney.ts:44-47`) cites
operational law 12 by name: *"Renderer building names are NEVER invented here
(operational law 12) — `next.site` is a semantic site and the renderer maps it to
whatever building it actually has."*

Operational law 12 verbatim `[DOC]` (`docs/SHIFT-OPERATIONAL-LAWS.md:29-30`):
> *"Never invent physical world from a semantic destination; unauthored facilities
> get an honest semantic fallback."*

The one place the engine *does* speak a concrete name is
`reservedFacilityLabel` (`firstFilmJourney.ts:647-661` `[CODE]`) — and it reads
`state.operations.facilities[].name`, which is **engine-owned vocabulary**
("Soundstage 7", "Scenery Shop"), NOT a renderer building id. It returns `null`
rather than half-naming. That is the correct pattern for the Flip's new stages to
copy.

### 4.2 The UI side is where law 12 is currently violated in spirit

`JOURNEY_SITE_BUILDING` (`ui/src/lot/snapshot/firstFilmJourney.ts:103-108` `[CODE]`)
is a **TOTAL** map from semantic site to a hard-coded `BuildingId`:

```
development: 'writers',  casting: 'casting',  post: 'post',  admin: 'admin'
```
plus `JOURNEY_STAGE_BUILDING_IDS = ['stage-a','stage-b']`
(`ui/src/lot/snapshot/firstFilmJourney.ts:95`), with
`journeyTargetBuildingId` falling back to `JOURNEY_STAGE_BUILDING_IDS[0]` when
ambiguous (`:158-161` `[CODE]`).

`BuildingId` is `string` (`ui/src/lot/snapshot/StudioLotSnapshot.ts:48` `[CODE]`), so
this compiles fine — and on a post-Flip lot it would **point the guidance marker at a
building that does not exist**. There is no "no such building" arm.

Blast radius, non-test references to the hard-coded founding ids in `ui/src`
(measured at `f294077`): `casting` 90, `stage-a` 91, `stage-b` 60, `gate` 37,
`writers` 35, `admin` 26, `post` 24, `theater` 23. Total **386** non-test call sites.
`[CODE]` (`grep -rn "'<id>'" ui/src --include='*.ts' --include='*.tsx' | grep -v
'\.test\.'`).

`[PROPOSAL]` The Flip's UI work is **larger than its engine work**. The charter should
size it as its own milestone: `JOURNEY_SITE_BUILDING` becomes a *lookup over the
studio's actual bodies*, returning `null` when the studio owns none — and every
consumer needs a "you have not built this yet" arm.

### 4.3 What adding CONSTRUCTION stages upstream of "Commission a screenplay" entails

Today `noPictureView` (`firstFilmJourney.ts:380-411` `[CODE]`) is terminal on the
upstream side: with no picture, the stage is `no-picture`, `next` is always
`commissionNext()` (`:363-369`), and `blocked` carries whatever the screenplay board
already published (`commissionBlocked`, `:371-378`). The blockers it can relay come
from `scriptProjectsReadModel(state).commission.blockers` — a closed union
(`ScriptPlayerBlocker.kind`), whose relevant members today are `operations-mode`,
`studio-founding`, `facility-capacity`, `no-concepts`, `no-writers`
(`scriptReadModel.ts:519-565` `[CODE]`).

Master plan §6 item 2 claims this *"adds entries to an existing mapping instead of
rewriting one"* `[DOC]` (`:266-268`). **That is true for `JourneySite`, and false for
everything else.** The concrete work:

1. **New stage members.** `FirstFilmJourneyStage` gains at least
   `no-development-office` (and probably `no-stage`, `no-post`). It is a **frozen
   public shape** (`firstFilmJourney.ts:71` *"frozen public shape"*), consumed by a
   UI mirror (`ui/src/lot/snapshot/firstFilmJourney.ts`) with its own closed
   validator (`JOURNEY_STAGES`, `JOURNEY_SITES` arrays, `:84-90`) that **rejects
   unknown members as malformed** (`firstFilmJourney.test.ts:282-322` `[CODE]`
   asserts absent ≠ malformed ≠ view). Adding a stage is a coordinated engine+UI
   change, not additive on one side.
2. **New target kind.** `JourneyTargetKind` gains something like `'build-facility'`
   (`firstFilmJourney.ts:87-95`). Same frozen-shape consideration.
3. **`JourneySite` needs no new member** — `development`, `casting`, `stage`, `post`
   already name exactly the four capabilities of §2.2. This is the one place §6's
   optimism is fully earned. `[CODE]` The union at `firstFilmJourney.ts:96` maps 1:1
   onto `FacilityCapability` (`development-casting` → `development`+`casting`,
   `soundstage` → `stage`, `post` → `post`; `set-scenery` currently has no site).
   **Gap: `set-scenery` has no `JourneySite`.** If the Flip makes Scenery buildable,
   it needs either a site or to be folded into `stage`.
4. **The precedence rule must change.** `currentPicture`
   (`firstFilmJourney.ts:260-289` `[CODE]`) has a documented frozen precedence
   (decision → production → most-advanced script → nothing). A construction stage
   sits *above* all of them when the studio has no development office, because
   nothing else is possible. `[PROPOSAL]` Add a step 0: "the studio cannot start a
   picture at all" precedes everything.
5. **A new blocker source.** The construction stages' `blocked` copy must come from
   the placement authority (`queryPlacement` rejections, `blueprintRequirements`
   reasons) rather than the screenplay board. Today `firstFilmJourney` imports
   nothing from `placement.ts` — a genuinely new dependency edge in a module that has
   held itself to read-models only.

### 4.4 The pre-Flip fixture as a permanent regression suite

Master plan §6 item 3 `[DOC]` (`:269-272`): *"the pre-Flip fixture (studio founded
with buildings, i.e. every migrated save) is retained as a permanent regression
suite."*

**The fixture already exists, in code, and is well shaped for this.**
`tests/first-film-journey.test.ts:42-66` `[CODE]`:

```
richFoundedStudio(seed) = beginFounding(generateWorld(seed))
                        → signContract ×(6 actors, 2 directors, 3 writers, 2 craft)
                        → foundStudio
managedStudio(seed)     = richFoundedStudio
                        → activateStudioOperations
                        → activateScriptDevelopment
                        → activateCastingSessions
```

The header states the discipline this suite must keep `[CODE]`
(`first-film-journey.test.ts:1-4`): *"Every assertion below drives a REAL GameState
through the real engine actions and tick. Nothing is hand-shaped: the chain is
exactly the one a player walks."*

**Scope of the pre-Flip suite, measured:** 21 test files call
`activateStudioOperations` `[CODE]` — `placement-lifecycle`, `construction-core`,
`_presenceFixtures`, `studio-decision`, `script-projects-actions`,
`production-operations-save-v8`, `cash-ledger-checkpoint-v11`, `property-state-v13`,
`first-film-journey`, `facility-move-demolish`, `blueprint-requirements`,
`casting-sessions-actions`, `facility-effects`, `construction-save-v11`,
`construction-accounting-calendar`, `script-read-model`, `studio-calendar`,
`placement-save-v12`, `legacy-parcel-ground`, `operations`, `placement-core`.
Every one of them assumes the five founding facilities exist the instant the studio
is founded.

Plus the two sealed e2e journeys named by §6 item 1 as C1 acceptance gates:
`ui/e2e/first-movie-golden-path-v1.spec.ts` and
`ui/e2e/lot-founded-audition-path-v1.spec.ts` `[CODE]`.

`[PROPOSAL]` The charter should require, as a Flip acceptance gate:
- `managedStudio(seed)` is **renamed and frozen** as `preFlipFoundedStudio(seed)` and
  keeps producing the exact 8-structure / 5-facility world (it is what a migrated save
  is), while a new `flippedFoundedStudio(seed)` produces the bare-land world;
- every one of the 21 files runs **unmodified** against the pre-Flip fixture;
- both e2e journeys run unmodified against a **migrated** save, and a new e2e journey
  ("bare lot → build core → FIRST FILM GREENLIT") runs against a flipped one;
- the two are compared: **the pre-Flip world's behaviour must be byte-identical to
  C1's** — that is the whole safety claim.

---

## 5. Migrated-save law: what distinguishes "founding mode" today, and what V14 needs

### 5.1 Current save state

Current version is **V13** (`src/core/save.ts:268` `saveVersion: 13`,
`makeSaveV13` at `:4375-4378`, `migrateToV13` at `:5263` `[CODE]`) — confirming the
brief and confirming that `docs/SHIFT-OPERATIONAL-LAWS.md`'s "Current save = V11"
trailer is stale (the brief already flags this).

`convertV12ToV13` (`save.ts:5076-5086` `[CODE]`) synthesizes `property:
clonePropertyState(INITIAL_PROPERTY)` for every migrated world, with the stated
rationale: *"V12 had a property; it just had no way to say so… every V12 world in
existence stands on exactly one property: the initial authored one… synthesizing it
here reconstructs a fact rather than inventing a default."*

### 5.2 What actually distinguishes the modes today

Exhaustive list of state facts that carry mode/lifecycle meaning `[CODE]`:

| Fact | Type | Set where | What it means |
|---|---|---|---|
| `state.founding` | `FoundingState \| null` | `beginFounding` sets; `foundStudio` clears (`actions.ts:1222`) | **`null` is ambiguous**: it means both "never started founding" (headless) and "founding is finished" (player). Disambiguated only by `economyEngagedEver`. |
| `state.economyEngagedEver` | `boolean`, monotonic | false ONLY at `worldgen.ts:658`; true at `beginFounding` (`employment.ts:423`) / first `signContract` | "this is a player studio, ever" |
| `state.operations.mode` | `'legacy' \| 'managed'` | `activateStudioOperations` (`actions.ts:1274`) | whether the facility registry is authoritative |
| `state.placement.mode` | `'legacy' \| 'managed'` | same action (`actions.ts:1277`) | whether Build Mode is live |
| `state.construction.mode` | `'legacy' \| 'managed'` | same action (`actions.ts:1276`) | parcel registry |
| `state.scriptDevelopment.mode` | `'legacy' \| 'managed'` | `activateScriptDevelopment` | screenplay projects vs direct greenlight |
| `state.castingSessions.mode` | `'legacy' \| 'managed'` | `activateCastingSessions` | audition sessions |
| `state.property.structures` | `PropertyStructure[]` | `worldgen` / `convertV12ToV13`; **never mutated by any action** | the bodies on the ground |

**THE FINDING: there is no fact anywhere in the state that records "this studio was
founded with buildings."** The closest proxy is `state.property.structures.length >
0`, which is:

- **not durable** — the Flip's own C2 work (Move & Demolish extended to founding
  bodies, per master plan §6 item 4's *"until the Flip"* wording) will make a
  pre-Flip studio able to demolish `writers`, at which point the proxy lies;
- **not distinguishing** — a flipped studio still has `gate` and `admin`, so
  `.length > 0` is true for both;
- **not sufficient for the invariant** — the four-capability invariant
  (`operations.ts:364-371`) keys off `operations.facilities`, not off structures, and
  the two would drift the moment either can change.

`placementRegimeReady` (`placement.ts:383-390` `[CODE]`) is the closest thing to a
regime predicate and it deliberately answers a *different* question (managed +
founded + engaged), not "which founding shape".

### 5.3 What V14 must record

`[PROPOSAL]` V14 adds exactly one durable, monotonic, never-recomputed fact to the
state root, alongside the existing `economyEngagedEver` pattern (which is the proven
in-repo precedent for "a fact the world can never re-derive"):

```
foundingRegime: 'endowed' | 'bare-lot'
```

- **`'endowed'`** — the studio was founded with the eight authored bodies. Every
  V13 and earlier save migrates to this, unconditionally, by the same reasoning
  `convertV12ToV13` uses: it reconstructs a fact, it does not invent a default.
  Written once at migration; never written again.
- **`'bare-lot'`** — the studio was founded after the Flip. Written once by
  `beginFounding`/`foundStudio` on a post-Flip build; never written again.

Why a discriminated field and not a derivation:
1. It survives demolition of every building (the proxy does not).
2. It is what the four-capability invariant must branch on
   (`operations.ts:364-371` becomes: *endowed* → all four required; *bare-lot* →
   none required, the read models already carry the copy for zero capacity —
   `scriptReadModel.ts:866-877` `[CODE]`).
3. It is what the regression suite splits on (§4.4).
4. It obeys operational law 20 `[DOC]` (`SHIFT-OPERATIONAL-LAWS.md:41-43`): *"Temporal
   claims need an immutable event witness, not an editable timestamp."*

V14 mechanics to copy verbatim, per operational law 19 `[DOC]`
(`SHIFT-OPERATIONAL-LAWS.md:39-41`): the historical-boundary guard pattern at
`save.ts:502-505` (which refuses `state.property` at any pre-V13 boundary) and the
downgrade refusal at `migrateToV11`. `V13_STATE_KEYS` at `save.ts:3530` becomes
`V14_STATE_KEYS = [...V13_STATE_KEYS, 'foundingRegime']`.

**The migrated-save law, stated for the charter** `[PROPOSAL]`:
> A save founded before the Flip keeps its founding placements forever and is never
> retroactively flipped. `foundingRegime: 'endowed'` is written once at V13→V14 and
> is never re-derived, never recomputed from `property.structures`, and never
> changed by any action. A flipped studio is a **new game**, never a migration.

### 5.4 One migration hazard worth naming now

Because `blueprintInstanceCount` ignores structures (§3.3 item 3), a migrated
`'endowed'` studio that gains access to C2's new "Development Office I" blueprint
would be able to build a second baseline office that the instance limit never saw.
`[PROPOSAL]` Either the new baseline blueprints carry `maxInstances` **evaluated
against structures + placements** (a change to `blueprintRequirements.ts:191-201`),
or they carry a `requires: [{kind:'structure'…}]`-style *negative* gate, which the
schema does not currently have. Naming this now avoids discovering it in playtest.

---

## 6. Starting-cash and cost implications at the Flip

### 6.1 What we can price from C1, and what we cannot

Measured C1 prices, from the engine, not the tuning table `[DOC]`
(`docs/economy/C1-ECONOMY-SNAPSHOT.md` §1, generated by
`scripts/measure-c1-economy.mts` at HEAD `c1e7cb0`):

| Blueprint | Capital charged | Weeks to open | Weekly opex | Refund | Shared slots |
|---|---|---|---|---|---|
| Development & Casting Annex | $780,000 | 13 | $3,500 | $390,000 (50%) | +1 |
| Development & Casting Hall | $1,400,000 | 20 | $6,000 | $700,000 (50%) | +2 |
| Development Office II | $600,000 | 8 | $2,500 | $300,000 (50%) | — |
| Development Office III | $1,200,000 | 12 | $4,000 | $600,000 (50%) | — |
| Craft Services Annex | $400,000 | 6 | $2,000 | $200,000 (50%) | — |

A studio that builds **every** C1 blueprint within its instance limits commits
**$4,380,000** of capital, pays **$18,000/week** opex, and finishes in **Week 20**,
ending with **$13,545,857** of the $20,000,000 bank `[DOC]`
(`C1-ECONOMY-SNAPSHOT.md` §2).

**There is no measured price for a soundstage, a post house, or a set/scenery
building, because those blueprints do not exist** (§3.2). Everything below is
therefore an explicitly-labelled `[PROPOSAL]` envelope for the charter's TUNING list,
not a balance claim.

### 6.2 The core build-out envelope at the Flip

Two ways to size the minimum path (dev office + casting + stage + post):

**Method A — per-slot rate from the Annex.** The Annex buys 1 shared slot for
$780,000 / 13 weeks. The founding plant is 8 slots. Buying all 8 at Annex rates ≈
**$6.24M**. Buying the *first-picture minimum* (1 D&C + 1 stage + 1 scenery + 1 post
= 4 slots) ≈ **$3.12M**.

**Method B — per-cell rate, which is what a soundstage's size argues for.** C1
blueprints price at $100k–$130k per occupied cell ($780k/6, $600k/6, $400k/6,
$1.4M/12, $1.2M/6). At `stage-a`'s 4×4 = 16 cells, a soundstage lands at
**$1.6M–$2.1M**. Post + Scenery at `post`'s 3×2 = 6 cells each ≈ **$600k–$780k
each**. Dev office at 3×2 ≈ **$600k–$780k**.

**`[PROPOSAL]` charter envelope for the minimum first-picture core:**

| Building | Cells | Capital envelope | Weeks envelope | Weekly opex envelope |
|---|---|---|---|---|
| Development Office (baseline, cap ≥1 D&C) | 6 | $600k – $800k | 8 – 13 | $2,500 – $3,500 |
| Casting Office (see §3.3 item 2) | 6 | $500k – $780k | 6 – 13 | $2,000 – $3,500 |
| Soundstage (1 slot) | 16 | $1.6M – $2.1M | 16 – 26 | $6,000 – $9,000 |
| Production / Post (post + set-scenery) | 6 – 12 | $700k – $1.4M | 10 – 20 | $3,000 – $6,000 |
| **Minimum core total** | **34 – 40** | **$3.4M – $5.1M** | **40 – 72 sequential / 16 – 26 parallel** | **$13.5k – $22k/wk** |

Against **$20,000,000** starting cash that is **17%–26% of the bank** — comfortable
on capital, and *that is the problem*: capital is not the binding constraint. The
binding constraint is **time and dead burn**.

### 6.3 The dead-burn problem — the real tuning risk

A founded studio pays weekly overhead + payroll from week 0 with **zero revenue
until its first release**. Measured at Week 20 on a real founded studio `[DOC]`
(`C1-ECONOMY-SNAPSHOT.md` §2, roster 4 actors / 1 director / 2 writers / 1 craft):

- `overhead` $27,000/wk (= `OVERHEAD_BASE` 15,000 + 8 × `OVERHEAD_PER_EMPLOYEE`
  1,500 — `tuning.ts:400-401` `[CODE]`)
- `payroll` $66,983/wk
- **total ≈ $94,000/wk before any facility opex.**

`[PROPOSAL]` If the Flip's core build-out takes **40 sequential weeks**, that is
**≈$3.76M of dead burn** on top of **$3.4M–$5.1M of capital** — **$7.2M–$8.9M, 36%–45%
of the bank, before the first frame is shot.** Then the picture itself needs a
negative (`baseNegativeCost` draws $2.0M–$9.0M, `worldgen.ts:552` `[CODE]`) plus
marketing. **On the pessimistic branch the Flip is unwinnable at $20M.**

**Three tuning surfaces the charter must list (numbers for the TUNING list, NOT
balance decisions here):**

1. `INITIAL_CASH` (`tuning.ts:51`) — may need to rise, OR
2. build weeks must be short enough that the core stands in **≤16–20 weeks with
   parallel construction** (there is no construction-slot cap today — placements
   complete independently, `placement.ts:750-790` `[CODE]` — so parallelism is
   already available and is the cheapest lever), OR
3. the founding roster minimum falls / hiring is deferred so payroll does not run
   during the build-out (`HIRING_MIN_*`, `tuning.ts:348-351`) — note the recruitment
   fund is already separate from cash (`types.ts:445`), so only *salaries* burn.

`[PROPOSAL]` A fourth, product-shaped lever the charter should consider: **let the
player commission a screenplay while the stage is still under construction** (§2.2
fact 1 — the picture does not need a soundstage until 6 weeks before release). That
converts dead burn into an overlapped opening act rather than a waiting room, and it
is the single highest-leverage design answer to this whole section.

### 6.4 Reference numbers from the corpus (evidence, not spec)

Master plan §11 `[DOC]`: *"Original numeric values are evidence, not spec."* Recorded
for shape only — the original's own core-loop facilities, from
`THE-MOVIES-2005-ORIGINAL-DATA/facility_catalog.csv` `[CORPUS]`:

| Row | Facility | Cost | Note |
|---|---|---|---|
| 27 | Stage School | $5,000 | *"built by player as step 2 of the core loop, NOT pre-built"* — **corrected this pass** in the corpus itself |
| 4 | Casting Office | $5,000 | "Casting/production hub" |
| 5 | Production Office | $6,000 | "Release, Finance, Archive, Movie Player rooms" |
| 13 | Script Office: Basic | $6,000 | "1-star script quality ceiling" |
| 8 | Crew Facility | $4,000 | "Hires Film Crew" |
| 10 | Post Production | $39,000 | "does NOT affect the calculated Movie Rating in standard play" |
| 28 | Staff Office | n/a | **"Pre-built at game start"** |

**The shape that matters:** the original's *entire* buildable core cost ~$26,000 while
its Post Production house alone cost $39,000 — i.e. **the core was cheap and the
specialist buildings were expensive.** Our C1 catalog has the opposite curve (the
cheapest entry, Craft Annex at $400k, is an effect-only building). `[PROPOSAL]` The
Flip is the moment to correct that curve: **make the core cheap and fast, make the
tiers expensive.**

---

## 7. Theater disposition — the evidence, laid out for a one-paragraph Owner call

### 7.1 What the code says today

- `theater` is `role: 'landmark'`, `providesFacilityIds: []`, 3×2 at (3,16)
  (`src/core/lot.ts:214-220` `[CODE]`). It provides **zero engine capacity** and is
  reserved by **nothing** in the production chain (§2.1).
- It is nonetheless a **real presentation surface**: `buildingInspector.ts:982-996`
  `[CODE]` renders `snapshot.releasePresence`, `latestReleaseTitle`, and
  `theatricalReceipt` calendar commitments there — *"Now showing: X"* / *"The marquee
  is empty."* `LotScene.ts:717` `[CODE]` raises a positive attention state on it
  whenever `releasePresence !== 'none'`. It also owns a camera preset
  (`LotScene.ts:106`, `1376`; `world.ts:1282` `[CODE]`).
- 23 non-test references in `ui/src` `[CODE]`.
- It is pinned as a landmark by test (`tests/property-state-v13.test.ts:166-169`
  `[CODE]`: `byRole('landmark')` toEqual `['admin','gate','theater']`).

### 7.2 What the corpus says

- **`facility_catalog.csv` has NO cinema/theater row.** 29 rows; the buildable
  catalog is Bar, Restaurant, Casting Office, Production Office, Laboratory, Rehab,
  Crew Facility, Cosmetic Surgery, Post Production, Publicity Office, Custom
  Scriptwriting, four Script Office tiers, Snack Van, three Restrooms, Star & Script
  Selling, five Trailers, Stage School, Staff Office, Makeover Department. `[CORPUS]`
- **`facility_candidates.csv` row 30, `TECH-FAC-029`:** *"Cinema (unidentified, likely
  debug/unused)", `facility_cinema.ini`, purchasecost 0, `mesh=p_debug12.msh`,
  `given=0` (the ONLY facility in this set with given=0)*, classification **"DORMANT
  OR UNCONFIRMED"**. `[CORPUS]`
- **`dormant_or_unconfirmed_fields.csv` row `TECH-DORMANT-001`:** *"given=0 strongly
  suggests this facility is excluded from the normal catalog; the debug-named mesh
  further suggests placeholder/test content, not a shipped player-facing building.
  **Do not conclude a 'Cinema' facility was ever player-accessible.**"* `[CORPUS]`
- By contrast the Gate/Staff Office analog (`facility_gatehouse.ini`,
  `TECH-FAC-028`) is `purchasecost=0, Demolishable=0, Moveable=0` — *"exactly the
  profile expected for a pre-built starting facility"* `[CORPUS]`, and
  `facility_catalog.csv` row 28 Staff Office reads *"Pre-built at game start."*
  These corroborate `gate` and `admin` as permanent landmarks with high confidence.

### 7.3 What the plan says

Master plan §6 table `[DOC]` (`:225`): theater = **"LANDMARK (lean)"** —
*"Exhibition is the town's, not studio construction; the original never made cinemas
buildable… **Final call at the Founding Flip design review — an explicit open
decision, not silently settled.**"*
Master plan §10 "Still required from the Owner" item 2 `[DOC]` (`:574-577`) assigns
the Theater call to C2 planning explicitly.

### 7.4 The options, with what each costs

| Option | What it means | Evidence FOR | Evidence AGAINST | C2 cost |
|---|---|---|---|---|
| **T1 — Permanent landmark** (spawns with Gate + Admin at the Flip) | Theater is company identity and the release surface, like the Gate | Corpus: no buildable cinema, ever `[CORPUS]`; code: it already houses `releasePresence` + `theatricalReceipt` and a camera preset `[CODE]`; PF1 routes **Premiere Night V1** to C2 `[DOC]` (brief law 7) and Premiere Night needs a venue on day one | It is *not* in the master plan's own "minimum starting lot" sentence (`:232-236` names only Gate, Admin, road, vacant parcels) `[DOC]` | **Lowest.** Zero engine work. `role:'landmark'` already. The 23 UI refs keep working. |
| **T2 — Landmark, but not at founding** (spawns later, e.g. on first release) | Bare lot is barer; the marquee arrives when there is something to show | Strongest "I built this from nothing" fantasy | Needs a new mechanism (structures are never added by any action today — §5.2). Premiere Night V1 would have no venue for picture #1. | **Medium.** New "structure appears" path; nothing in the engine does this. |
| **T3 — Buildable class** | Theater becomes a `FacilityBlueprint` | Consistent with "everything except Gate+Admin is player-built" | Corpus refutes it: the ONLY cinema artifact is `given=0` debug content, and the register says in terms *do not conclude it was player-accessible* `[CORPUS]`. It also has no capability to provide — a capacity-0 blueprint would violate the C1 "no decorative blueprints" law `[DOC]` (`tuning.ts:625-638` `[CODE]`, `LOT-CONTENT-EXPANSION-LOG.md:222`). | **Highest**, and the only option with corpus evidence *against* it. |

`[PROPOSAL]` **Recommend T1.** It is the only option where the corpus, the code, the
master plan's lean, and PF1's Premiere Night routing all point the same way, and it is
the only option that costs zero engine work. The Owner's paragraph is then simply:
*"Theater is a permanent landmark. It spawns with Gate and Administration. It is never
buildable and never demolishable."*

---

## 8. RISKS, GAPS, AND CONTRADICTIONS (loud, per brief rule 5)

### 8.1 Sources contradicting each other

1. **"Nine buildings" vs eight vs ten.**
   - Master plan §6 `[DOC]` (`:214`, `:218`, `:245`): *"nine permanent buildings"*,
     *"today's nine become founding placements"*, *"a fresh studio still spawns all
     nine."*
   - Code `[CODE]` (`lot.ts:170`): *"the **eight** physical bodies the studio starts
     with"*; `INITIAL_PROPERTY_STRUCTURES` has 8 entries.
   - UI `[CODE]` (`StudioLotSnapshot.ts:24-33`, `769-779`): `FoundingBuildingId` has
     **nine** members — the eight plus `expansion`, which is a parcel in the engine.
   - Bible comparative register `[CORPUS]`
     (`THE-MOVIES-2005-COMPLETE-MECHANICS-BIBLE.md:3359`, `:4100`): *"**Ten** named,
     addressable buildings (Administration, Writers/Development, Casting, Stage 7,
     Stage 12, Post, Theater, Gate, **Scenery Shop**, Annex)"* — counts Scenery Shop,
     which is a *facility* housed inside the `post` body, not a separate structure.
   - **Resolution required, not resolved here.** The charter must state one count and
     one vocabulary. `[PROPOSAL]` "eight authored structures + one reserved parcel;
     nine addressable places."

2. **§6 says "founding placements"; C1 shipped "property structures."** Detailed in
   §1.5. This is the largest plan-vs-code divergence in this lane. It changes what
   "convert to buildable" means mechanically and it is not a wording quibble: the two
   are different types in different state roots with different lifecycles. **Do not
   let the charter inherit §6's phrasing unexamined.**

3. **Master plan §6 says stages "CONVERT → buildable Soundstage class"; the corpus
   says the original had no soundstage building type at all.** Bible `[CORPUS]`
   (`:691`): *"Unlike a generic 'soundstage' that hosts interchangeable dressing, each
   Set in The Movies is its own placeable, fully modeled lot structure/environment —
   **there is no separate 'Soundstage' building type distinct from Sets**"* (manual
   p.20 quoted in support). `facility_catalog.csv` and `facility_candidates.csv`
   contain **no** soundstage row `[CORPUS]`.
   This does not make §6 wrong — our engine genuinely has a `soundstage` capability
   that Sets do not model — but it means **"buildable soundstage" is a Project Studio
   invention, not a parity restoration**, and Lane 4 cannot tell whether C2 wants
   (a) a Soundstage blueprint that Sets are placed inside, or (b) Sets that *are* the
   shooting location and the `soundstage` capability retires. **That fork is upstream
   of everything in §3.2 and belongs to the Sets lane, not this one — but the Flip
   cannot be specified until it is answered.**

4. **Brief cites `src/core/actions.ts:332` for the concurrency ceiling; the actual
   line at `f294077` is `actions.ts:333`.** Trivial, recorded for accuracy.

5. **`docs/SHIFT-OPERATIONAL-LAWS.md` trailer says "Current save = V11"; the code is
   V13** (`save.ts:268`, `:4375-4378` `[CODE]`). Already flagged by the brief; PF1-M2
   corrects the doc. Recorded again because §5's V14 work reads that document.

### 8.2 Hard blockers C2 must clear (ranked by how badly they bite)

| # | Blocker | Cite | Why it bites |
|---|---|---|---|
| **B1** | Four-capability invariant makes a bare-lot managed studio illegal | `operations.ts:364-371` `[CODE]` | Throws at the exact founding action. Nothing in the Flip works until this branches on `foundingRegime`. |
| **B2** | Three of four required capabilities have **zero** buildable blueprints | `tuning.ts:748-754` `[CODE]` | soundstage, post, set-scenery-with-capacity. §3.2. |
| **B3** | Vacated building ground belongs to no parcel → `notOwned` | `lot.ts:91-94`, `400-406` `[CODE]` | Removing buildings does not free land. The Flip is a parcel re-authoring job. |
| **B4** | No buildable parcel can hold a 4×4 soundstage with its clearance ring | computed from `lot.ts:96-167` + `placement.ts:18-27` `[CODE]` | Largest buildable parcel is 24 cells (6×4). |
| **B5** | `JOURNEY_SITE_BUILDING` is a total map to hard-coded ids; 386 non-test refs to founding ids in `ui/src` | `ui/src/lot/snapshot/firstFilmJourney.ts:103-108` `[CODE]`; measured grep | The UI work is bigger than the engine work. |
| **B6** | `FirstFilmJourneyStage` / `JourneyTargetKind` are frozen public shapes with a closed UI validator | `firstFilmJourney.ts:71-95` `[CODE]`; `ui/.../firstFilmJourney.ts:84-90` | Adding construction stages is a coordinated engine+UI change, not additive. |
| **B7** | No state fact records "founded with buildings" | §5.2 `[CODE]` | V14 must add one; the `property.structures` proxy is not durable. |
| **B8** | `FacilityBlueprint.capability` is singular; the `post` body houses two capabilities | `tuning.ts:601` etc.; `lot.ts:261` `[CODE]` | A faithful Production/Post blueprint cannot be expressed today. |
| **B9** | Dead burn ≈$94k/wk during a 40-week sequential build-out vs $20M bank | `C1-ECONOMY-SNAPSHOT.md` §2 `[DOC]`; `tuning.ts:51`, `:400-401` `[CODE]` | On the pessimistic branch, the Flip is unwinnable without a tuning change or the overlap design of §6.3. |
| **B10** | 21 test files + 2 sealed e2e journeys assume the five founding facilities at founding | measured `[CODE]` | The regression-suite split of §4.4 is mandatory, not optional. |

### 8.3 Genuine gaps this lane could not close (out of lane, or no evidence)

- **Does C2 want a Soundstage class at all, or do Sets replace it?** (§8.1 item 3.)
  Belongs to the Sets/Stages lane. **The Flip's blueprint list cannot be frozen until
  this is answered.**
- **Does the Casting body get its own capability?** (§3.3 item 2.) Belongs to the
  concurrency ruling, which the master plan §10 lists as still-required from the
  Owner.
- **What does the post-Flip parcel map look like?** Requires a design pass over the
  28×26 property that is a world/art job, not an audit job. `[PROPOSAL]` The charter
  should schedule it explicitly, with `docs/SHIFT-OPERATIONAL-LAWS.md:63-77` law 25
  (structural pins) and law 27a (the Soundstage-12 adjacent-plate NO-GO — *never butt
  new plates against the Stage 7 painting*) as binding constraints on where new
  buildable ground may be authored.
- **PF1's charter is not present in this worktree** (`find` for `*professional-floor*`
  / `*PF1*` returns nothing). This lane assumed the brief's summary of it (ui-only,
  `src/core` untouched, no V14). If PF1 in fact touches `src/core`, §5's V14 plan
  needs re-checking. Flagged, not assumed away.
- **Number of construction slots.** There is no cap on concurrent construction today
  (`placement.ts:750-790` `[CODE]` completes every due placement independently), so
  parallel build-out is free. Whether the Flip *wants* it free is a design decision
  with large economy consequences (§6.3 lever 2) and is unrecorded anywhere.

---

## 9. Owner decisions this lane surfaces

1. **Theater: landmark, deferred landmark, or buildable?** (§7.) `[PROPOSAL]` T1 —
   permanent landmark, spawns with Gate + Admin. One paragraph.
2. **Representation: do founding bodies become placements at the Flip (A), stay
   structures (B), or unify (C)?** (§1.5.) `[PROPOSAL]` (A).
3. **Soundstage vs Sets:** does the `soundstage` capability survive C2, or do Sets
   become the shooting location? (§8.3.) Upstream of the whole blueprint list.
4. **Casting capability:** does a Casting Office provide `development-casting`, or a
   new `casting` capability? (§3.3 item 2.) Part of the concurrency ruling.
5. **Post + Scenery: one building or two?** (§3.3 item 1 / B8.)
6. **Opening-act tuning:** raise `INITIAL_CASH`, shorten build weeks, defer hiring, or
   overlap commission-with-construction? (§6.3.) `[PROPOSAL]` the overlap, first.
7. **C2a/C2b split:** brief law 6 offers it. `[PROPOSAL]` Given B1–B10 — ten distinct
   blockers, of which B3/B4 are a world re-authoring job and B5/B6 are a UI campaign
   — **recommend the split**: C2a ships Sets/Stages/Throughput (which delivers the
   soundstage and set blueprints B2 needs anyway), C2b performs the Flip on top of a
   catalog that already exists. This is a recommendation on evidence, not a
   preference.

---

*End of Lane 4 report. No file outside this one was created or modified.*
