# C2 Planning — Lane 1: Stage / Set / Reservation Engine Archaeology

> **Report status:** planning evidence for the C2 charter. Read-only archaeology of
> the sealed C1 `main` (`f294077`) as checked out in worktree
> `/Users/bruce/The Movies - C2 Planning` on branch `c2-sets-throughput-plan`.
> **No implementation. No code, test, or non-report file was modified.**
>
> **Claim tags used throughout:** `[CODE]` = observed in source at the cited
> `file:line`. `[DOC]` = stated in a repo governing document. `[CORPUS]` = read
> from the read-only evidence corpus at `/Users/bruce/Desktop/Big Swing Art/`.
> `[PROPOSAL]` = my recommendation, not an observation. Nothing tagged `[CODE]`
> is inference; where I infer, the sentence says so and carries `[PROPOSAL]`.

**Headline:** the engine has exactly **one** capacity primitive — a
`(facilityId, slot)` string held on a per-owner reservation record — and it is
*correct*, *fail-closed*, and *leak-free* under the paths I could walk. But it is
also **hard-wired to a fixed five-facility founding registry and to exactly two
soundstage identities**, and its "one union" (operational law 22) exists as a
*discipline* re-implemented in **six independent walks**, not as a single named
producer. There is **no Set entity at any layer**, and **no wrap transition**: a
stage is released as an incidental side effect of the shooting→post allocation
replacement. Generalising to N stages is *medium* engine work and *hard* renderer
work; adding Sets as first-class reservable entities is *hard* and touches the
save schema, every occupancy walk, and three duplicated copies of the
phase→capability law.

---

## 1. The two soundstages, as represented today

### 1.1 They exist as FOUR separate, independently-authored facts

The soundstages are not one object. They are four aligned facts in four modules,
kept in agreement by convention and by test, not by a shared authority.

| Layer | Identity | Where |
|---|---|---|
| Engine capacity | `facility-soundstage-07`, `facility-soundstage-12` — `capability: 'soundstage'`, `capacity: 1` each | `src/core/operations.ts:30-31` `[CODE]` |
| Engine geometry (property) | `PropertyStructure` `stage-a` @ `{gx:17,gy:2}` 4×4; `stage-b` @ `{gx:17,gy:9}` 4×4, both `role: 'founding'` | `src/core/lot.ts:239-254` `[CODE]` |
| Body↔capacity link | `providesFacilityIds: ['facility-soundstage-07']` / `['facility-soundstage-12']` | `src/core/lot.ts:245`, `src/core/lot.ts:253` `[CODE]` |
| Presentation identity | `BuildingId` `'stage-a'` / `'stage-b'`; signs `STAGE 7` / `STAGE 12` | `ui/src/lot/tycoon/world.ts:137-140` `[CODE]` |

**BuildingIds.** `stage-a` and `stage-b` are members of the *closed* nine-entry
`FoundingBuildingId` union (`ui/src/lot/snapshot/StudioLotSnapshot.ts:24-32`)
`[CODE]`, enumerated in `FOUNDING_BUILDING_IDS`
(`ui/src/lot/snapshot/StudioLotSnapshot.ts:769-779`) `[CODE]`. The wider
`BuildingId` type is deliberately **open** (`= string`,
`StudioLotSnapshot.ts:36-48`) `[CODE]` precisely so C1's placed facilities could
be addressed as `placed-<placementId>` (`StudioLotSnapshot.ts:626-630`) `[CODE]`.
So the *type* already admits an N-stage world; the *vocabularies keyed on the
closed nine* do not.

### 1.2 Founding-placement identity after C1 — the honest reading

The brief's baseline line "nine fixed buildings → founding placements, IDs
preserved" `[DOC]` (`docs/c2-planning/00-C2-PLANNING-BRIEF.md:51-54`) is
**directionally right but technically loose**, and the distinction matters
enormously for the Founding Flip:

- A founding building is a **`PropertyStructure`**, held in `state.property.structures`
  (`src/core/types.ts:1173-1183`) `[CODE]`. It has **no placement record, no
  blueprint, no capex row, no `completesWeek`, and no `status`.**
- A player-built building is a **`PlacedFacility`**, held in
  `state.placement.facilities` (`src/core/types.ts:945-961`) `[CODE]`, carrying
  `blueprintId`, `projectId`, `placedWeek`, `completesWeek`, `status`.
- The engine says so explicitly: *"Founding structures never count toward
  [`maxInstances`]. A structure is PROPERTY — authored ground the studio starts
  with — not a placement, and the two are deliberately different things (C1-M1a)."*
  (`src/core/types.ts:929-940`) `[CODE]`
- Both verbs of Move & Demolish V1 take a `placementId`, so a structure "need[s]
  no check here: they are property and own no placement record, so no placementId
  can name one" (`src/core/placement.ts:884-886`) `[CODE]`.

**Therefore: the Stage 7 and Stage 12 bodies today cannot be moved, demolished,
costed, or reasoned about as buildings. They are terrain that happens to be
labelled.** `[CODE]`

Two hard constraints follow, and both are load-bearing for C2:

1. **`providesFacilityIds` may only name an entry of `INITIAL_STUDIO_FACILITIES`.**
   The property invariant builds `knownFacilityIds` from that frozen array and
   throws on anything else (`src/core/placement.ts:1300`, enforced at
   `src/core/placement.ts:1333-1337`) `[CODE]`. A founding "Stage 3" cannot be
   added as data alone.
2. **A facility has exactly one home.** `providedBy` rejects two structures
   claiming one facility id (`src/core/placement.ts:1338-1344`) `[CODE]`.

### 1.3 Snapshot / renderer exposure path

`GameState` → `studioLotSnapshot(state)` (`ui/src/engine/adapter.ts`) → `StudioLotSnapshot`
→ `StudioLotScreen` / `TycoonScene`. The stage-specific hops:

- **`LOT_STAGE_BY_SOUNDSTAGE_ID`** — a *closed two-entry* record mapping facility
  id → stage BuildingId (`ui/src/engine/adapter.ts:5343-5346`) `[CODE]`.
- **`managedWorkflowLocation(workflow)`** — derives a production's physical
  location from its reservations; for `rehearsal`/`shooting` it looks up the
  soundstage reservation and **throws** `"uses unmapped soundstage"` on any
  facility id outside those two (`ui/src/engine/adapter.ts:5532-5546`) `[CODE]`.
- A second **throw** guards the production card: a managed rehearsal/shooting
  production whose `locationBuildingId` is not `stage-a`/`stage-b` raises
  `"is not located on a soundstage"` (`ui/src/engine/adapter.ts:6337-6343`) `[CODE]`.
- `ProductionCard.stageId` is typed `'stage-a' | 'stage-b'`
  (`ui/src/lot/snapshot/StudioLotSnapshot.ts:193`) `[CODE]`.
- `StageAssignment` / `StageSlotId` is a two-slot presentation resolver, bypassed
  entirely when `stageAssignmentAuthority === 'engine'`
  (`ui/src/lot/snapshot/stageAssignment.ts:37-43`, `:96-100`) `[CODE]`.
- Presence placement: `PRESENCE_FACILITY_PLACE` — another closed six-entry
  facility→place map (`ui/src/lot/tycoon/presence.ts:57-64`) `[CODE]`.
- Inspector: `BUILDING_FACILITY_IDS` and `BUILDING_PRESENCE_FACILITY_IDS` —
  two more closed maps (`ui/src/lot/buildingInspector.ts:189-195`, `:206-212`) `[CODE]`.
- World bodies: `AUTHORED_PLACES` entries for `stage-a`/`stage-b` with hand-surveyed
  anchors (`entry`, `crewCall`, `camera`, `service`, `lamp`, `work`, `wait`)
  (`ui/src/lot/tycoon/world.ts:207-232`, `:233-...`) `[CODE]`.
- Journey guidance: `JOURNEY_STAGE_BUILDING_IDS = ['stage-a','stage-b']`
  (`ui/src/lot/snapshot/firstFilmJourney.ts:95`) `[CODE]`.
- Scenery load-in and Stage-7 selectors filter on the literal `'stage-a'`
  (`ui/src/lot/snapshot/sceneryLoadIn.ts:36`, `ui/src/lot/snapshot/stage7Production.ts:103`,
  `:119`, `:154`) `[CODE]`.

**Note the asymmetry (a real C1 seam):** `stage-b`/Stage 12 has *engine capacity
and a body*, but the accepted Hollywood district has no Stage 12 place —
`docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-NO-GO.md` exists and the brief
records operational law 27a as a standing **NO-GO** on butting a new plate against
the Stage 7 painting `[DOC]` (`docs/c2-planning/00-C2-PLANNING-BRIEF.md:74-78`).
The world module says so in its own words: *"the second engine stage (`stage-b`)
has never had a body"* — meaning in the Hollywood district
(`ui/src/lot/tycoon/world.ts:132-135`) `[CODE]`. The tycoon world does paint both.

---

## 2. The complete reservation / occupancy model (operational law 22 audit)

**Operational law 22** `[DOC]`: *"Capacity/occupancy is ONE union at every boundary
(production + script + casting + any new placement/assignment) consumed by actions,
invariants, tick, read models."* (`docs/SHIFT-OPERATIONAL-LAWS.md:82-84`).

### 2.1 The primitive

One string key, defined once and re-defined three more times:

```ts
export function facilitySlotKey(facilityId: string, slot: number): string {
  return `${facilityId}:${String(slot)}`
}
```
`src/core/scriptDevelopment.ts:71-73` `[CODE]` — the canonical one.

Re-declarations of the identical key format:
- `src/core/operations.ts:108` (inline template, same shape) `[CODE]`
- `src/core/studioCalendar.ts:232-234` (private duplicate) `[CODE]`
- `src/core/save.ts:2376` (`` `${facilityId} ${slot}` `` — **different separator**,
  same semantics, import-boundary only) `[CODE]`

A slot is an *integer index* `[0, facility.capacity)`. There is **no slot object,
no slot identity, no slot record**. Capacity is a scalar on `StudioFacility`
(`src/core/types.ts:530-535`) `[CODE]`.

### 2.2 The complete membership of the union — every member

There are **five persisted holders** of a `StudioFacility.id`. The single place
the engine states this exhaustively is the Move & Demolish module header
(`src/core/placement.ts:52-80`) `[CODE]`, and the predicate that walks all five
is `facilityEngagements(state, facilityId)` (`src/core/placement.ts:806-869`) `[CODE]`:

| # | Member | State path | Slot-bearing? | Duration |
|---|---|---|---|---|
| 1 | Production phase reservation | `state.operations.workflows[].reservations[]` | **yes** (`.facilityId`, `.slot`) | **open-ended** — no `dueWeek`; a capacity-blocked production keeps it indefinitely `[CODE]` `placement.ts:56-59` |
| 2 | Shooting-task soundstage copy | `state.operations.workflows[].shootingTask.soundstageFacilityId` | no (denormalised id only) | duration of Shooting |
| 3 | Screenplay reservation | `state.scriptDevelopment.projects[].reservation` | **yes** | one week; released by tick step 0.5 |
| 4 | Casting-session reservation | `state.castingSessions.sessions[].reservation` | **yes** | one week; released by tick step 0.6 |
| 5 | Legacy V11 construction project | `state.construction.projects[].facilityId` | no | provably empty under V12+ `[CODE]` `placement.ts:170-173` |

Member 2 is deliberately walked independently of member 1 even though an invariant
ties them: *"a guard that trusted the invariant would leave this field dangling the
day the two diverge"* (`src/core/placement.ts:60-64`) `[CODE]`.

**Explicitly NOT engagements:** `state.operations.facilities` (the registry itself)
and the placement's own record (`src/core/placement.ts:75-80`) `[CODE]`.

### 2.3 Every producer (who writes a reservation)

| Producer | Entry point | Union it consults |
|---|---|---|
| Greenlight | `addManagedProductionWorkflow` `src/core/operations.ts:188-223` `[CODE]` | own workflows + `externallyOccupiedSlots` (script ∪ casting) passed from `src/core/actions.ts:600-612` `[CODE]` |
| Phase transition | `enterPhase` → `allocateForPhase` `src/core/operations.ts:556-602`, `:118-174` `[CODE]` | own workflows + external set passed from `src/core/tick.ts:206-213` `[CODE]` |
| Screenplay commission | `commissionScriptProject` → `allocateScriptReservation` `src/core/scriptDevelopment.ts:232-286`, `:173-199` `[CODE]` | production ∪ script (internal) + casting (passed, `src/core/actions.ts:1546-1553`) `[CODE]` |
| Screenplay rewrite | `requestScriptRewrite` → `allocateScriptReservation` `src/core/scriptDevelopment.ts:462-500` `[CODE]` | same, from `src/core/actions.ts:1580-1588` `[CODE]` |
| Casting session open | `allocateCastingReservation` `src/core/castingSessions.ts:227-253`, called `:301` `[CODE]` | production ∪ script ∪ casting (all internal) |

**Allocation policy (all producers):** facilities sorted ascending by id
(`operations.ts:130`, `scriptDevelopment.ts:184-187`, `castingSessions.ts:240-243`)
`[CODE]`, then first free slot ascending. Deterministic, no RNG. Productions are
processed in ascending production id (`src/core/operations.ts:629`) `[CODE]`.

### 2.4 Every consumer (who reads the union)

**Actions** — `src/core/actions.ts:600-612` (greenlight), `:1546-1553`
(commission), `:1580-1588` (rewrite) `[CODE]`.

**Tick** — `src/core/tick.ts:206-213`: the union assembled *after* script (step
0.5, `tick.ts:172-183`) and casting (step 0.6, `tick.ts:190-200`) have released
their slots, so freed capacity is visible to production allocation in the same
visible week `[CODE]`.

**Invariants (four independent walks, each rebuilding the union):**
- `assertStudioOperationsInvariants` — production-only overbook check,
  `src/core/operations.ts:485-487` `[CODE]`
- `assertScriptDevelopmentInvariants` — seeds from productions
  (`src/core/scriptDevelopment.ts:865`), then adds scripts
  (`:818-820`) `[CODE]`
- `assertCastingSessionsInvariants` — seeds from productions ∪ scripts
  (`src/core/castingSessions.ts:506-525`), then adds casting (`:501-503`) `[CODE]`
  — this is the canonical three-owner collision proof
- `facilityMutationEligibility` → `facilityEngagements` — the five-member walk,
  fail-closed (`src/core/placement.ts:869-902`) `[CODE]`

**Read models:**
- `studioCalendar.facilityViews` — its own three-owner walk producing per-slot
  occupant views (`src/core/studioCalendar.ts:257-388`) `[CODE]`; the summary
  `occupiedSlots`/`availableSlots` at `:736-751` `[CODE]`
- `developmentCastingOccupancy` (`src/core/scriptDevelopment.ts:100-156`) and
  `castingDevelopmentCastingOccupancy` (`src/core/castingSessions.ts:196-222`) `[CODE]`
- `availableDevelopmentCastingSlots` (`src/core/scriptDevelopment.ts:158-171`) `[CODE]`
- `scriptReadModel` capacity view (`src/core/scriptReadModel.ts:376`, `:390`) `[CODE]`
- `productionBoard` card facilities/blocker/command (`ui/src/engine/adapter.ts:727-845`) `[CODE]`
- `studioPresence` — projects people onto the reservation their phase holds
  (`src/core/presence.ts:120-198`) `[CODE]`

**Save boundary** — `checkOperationsState` re-validates every reservation,
capability↔facility agreement, slot bound, and global slot uniqueness on import
(`src/core/save.ts:2181-2400`, uniqueness at `:2376-2385`) `[CODE]`.

### 2.5 Lifecycle: created when, held how, released when

**Phase → required capability table** (`requirementsForPhase`,
`src/core/operations.ts:79-93`) `[CODE]`:

| `remainingTicks` | Phase | Capabilities held |
|---|---|---|
| 8 | `development` | `development-casting` |
| 7 | `preProduction` | `development-casting` |
| 6 | `rehearsal` | **`soundstage`** |
| 5, 4 | `shooting` | **`soundstage`** + `set-scenery` |
| 3, 2 | `postProduction` | `post` |
| 1 | `releaseReady` | *(none)* |

**Created.** At greenlight, `addManagedProductionWorkflow` inserts a draft workflow
with empty reservations, allocates for the derived phase, and **throws** if
allocation fails (`src/core/operations.ts:200-222`) `[CODE]`.

**Held.** Reservations are a plain array on the workflow
(`src/core/types.ts:573-579`) `[CODE]`, serialised verbatim into the save.

**Transitioned.** Every phase change calls `enterPhase`, which **replaces the
whole reservation array** with the target phase's allocation
(`src/core/operations.ts:590-596`) `[CODE]`. There is no explicit "release" call.
Release is the *absence* of a capability from the new allocation.

**Retained (the one exception).** Rehearsal → Shooting explicitly re-uses the same
physical soundstage rather than reallocating (`src/core/operations.ts:133-143`) `[CODE]`.

**Held on failure (the anti-queue).** If `allocateForPhase` fails, `enterPhase`
returns the workflow with a `facility-capacity` blocker and **the previous phase's
reservations intact**; the production does not advance
(`src/core/operations.ts:569-575`) `[CODE]`. A production blocked at
shooting→post therefore keeps **both** the soundstage and the scenery slot
indefinitely.

**Held on player inaction.** At `remainingTicks === 5` the tick refuses to advance
unless the shooting task is `scheduled`; it `continue`s, burning the week with the
stage held (`src/core/operations.ts:651-661`) `[CODE]`.

**Released — the complete list of paths:**

| Path | Mechanism | Citation |
|---|---|---|
| Ordinary phase advance | new allocation replaces the array | `src/core/operations.ts:590-596` `[CODE]` |
| Reaching `releaseReady` | `requirementsForPhase('releaseReady') === []` → empty array | `src/core/operations.ts:90-91` `[CODE]` |
| Release (`remainingTicks → 0`) | `removeManagedProductionWorkflow` | `src/core/operations.ts:664-667` `[CODE]` |
| **Cancel** | `removeManagedProductionWorkflow(state.operations, action.productionId)` | `src/core/actions.ts:647` `[CODE]` |
| Screenplay completion | project rebuilt with `reservation: null` | `src/core/scriptDevelopment.ts:451` (in `completeDueScriptWork`, `:408`) `[CODE]` |
| Casting completion | session rebuilt with `reservation: null` | `src/core/castingSessions.ts:388` `[CODE]` |
| Demolition | facility filtered out of `operations.facilities` — only reachable when `facilityEngagements` is empty | `src/core/placement.ts:1036-1043`, guarded `:893-902` `[CODE]` |

**Cancel is byte-clean:** it removes the workflow (releasing every reservation)
*and* returns the screenplay to `ready` with `productionId: null`
(`src/core/actions.ts:640-652`, `src/core/scriptDevelopment.ts:554-572`) `[CODE]`.
It deliberately keeps the sunk greenlight ledger rows, which is why
`persistedProductionIds` must sweep the ledger too
(`src/core/productionIdentity.ts:1-38`) `[CODE]`.

### 2.6 Does anything leak? — audit result

**No leak found on any path I walked.** `[CODE]` The specific reasons:

1. **One-to-one is an invariant, not a habit.** `workflows.length === productions.length`,
   plus both directions of membership (`src/core/operations.ts:445-448`, `:551-553`) `[CODE]`.
   A workflow surviving its production, or vice versa, throws at the next tick,
   action, calendar read, or save.
2. **Overbooking is checked in four places** (§2.4) and again at import
   (`src/core/save.ts:2376-2385`) `[CODE]`.
3. **Reservation set is exact-per-phase**, compared by sorted-capability equality
   (`src/core/operations.ts:463-468`) `[CODE]` — a stale extra reservation throws.
4. **Destructive verbs are fail-closed with no override**
   (`src/core/placement.ts:44-49`, `:893-902`) `[CODE]`; an
   `underConstruction` site is asked anyway rather than special-cased
   (`src/core/placement.ts:889-892`) `[CODE]`.
5. **Failed greenlight throws before returning state**, so `applyActions` rejects
   the whole action rather than half-applying (`src/core/operations.ts:217-221`) `[CODE]`.

**Two things that are not leaks but behave like one, and are C2 problems:**

- **(L1) Blocked productions hoard capacity.** §2.5 "Held on failure". With
  `MAX_CONCURRENT_PRODUCTIONS: 2` and one post facility of capacity 2 this is
  invisible; with N stages and real queueing it becomes the dominant failure mode.
  `[CODE]` `src/core/operations.ts:569-575`
- **(L2) Greenlight rejects rather than queues.** `addManagedProductionWorkflow`
  throws on capacity failure (`src/core/operations.ts:217-221`) `[CODE]`. This is
  reachable today: development phase needs a `development-casting` slot, and the
  founding facility has capacity 2 shared with screenplays and casting sessions
  (`src/core/operations.ts:26`) `[CODE]`. **This directly contradicts owner law 2
  ("QUEUE, DON'T MAGICALLY FORBID")** `[DOC]`
  (`docs/c2-planning/00-C2-PLANNING-BRIEF.md:23-26`).

### 2.7 The honest verdict on "ONE union"

The law's *intent* holds: every boundary answers the same question with the same
key, and the invariants cross-check each other. But **there is no function named
`occupiedFacilitySlots(state)`.** The union is assembled ad hoc at
each site, from three near-identical private helpers:

- `productionOccupiedFacilitySlots` appears **twice**, byte-for-byte equivalent:
  `src/core/scriptDevelopment.ts:75-85` and `src/core/castingSessions.ts:166-174` `[CODE]`
- `scriptOccupiedFacilitySlots` appears **twice**: exported at
  `src/core/scriptDevelopment.ts:88-99`, private copy at
  `src/core/castingSessions.ts:176-183` `[CODE]`
- Plus `studioCalendar.facilityViews` (`:257-388`), the three invariant walks, and
  `facilityEngagements` — **six independent traversals of the same roots.**

**Consequence for C2:** adding *one* new reservable kind (a Set) means editing
every one of those traversals, and the compiler will help with **none** of them
because they all key on `string`. `[PROPOSAL]` This is the single highest-leverage
refactor available to C2, and it should land *before* Sets, not with them.

---

## 3. Scenery Load-In V1 — what it actually is

**Documents read:** `docs/WORLD-FIRST-SCENERY-LOAD-IN-V1-CONTRACT.md`,
`-CLOSURE.md`, `-EVIDENCE.md` (evidence file present; closure verified at
`CLOSURE.md:1-80`).

### 3.1 It is a UI milestone. The engine gained nothing.

The contract is explicit: *"No production implementation change is authorized in
`src/core`, adapter command projection, `App.tsx`, save schema/migrations,
navigation, district manifest/art/exporter, or economy systems."*
`[DOC]` (`CONTRACT.md:490-494`). The closure confirms: *"This milestone adds no
core action, save schema, migration, App route, production task, facility,
reservation, accounting entry, cash movement, clock, random draw, inventory,
worker, pathfinding, queue, truck, or district-manifest mutation."*
`[DOC]` (`CLOSURE.md:50-53`).

The blocker it makes spatially playable **predates it** — it belongs to
Production Operations V1 `[DOC]` (`CONTRACT.md:22-24`).

### 3.2 The states that exist

**Engine (`ShootingTaskStatus`, `src/core/types.ts:553`)** `[CODE]`:
`unassigned → blocked → ready → scheduled → completed`

**Engine (`ProductionBlocker`, `src/core/types.ts:562-571`)** `[CODE]`:
- `{ kind: 'facility-capacity', capability, targetPhase }`
- `{ kind: 'scenery-load-in', taskId }`

**Derived, presentation-only (`ProductionBoardBlockerView.kind`,
`ui/src/engine/adapter.ts:642`)** `[CODE]`: adds `'director-dispatch'` and
`'take-scheduling'`. The contract flags this trap directly: *"The serialized
workflow blocker is null after clear; the adapter's fresh `take-scheduling`
blocker is a derived player decision. These facts may not be conflated or asserted
as one stored field."* `[DOC]` (`CONTRACT.md:112-113`).

### 3.3 The transition chain, with its authorities

| Step | Trigger | Engine effect | Citation |
|---|---|---|---|
| Enter Shooting | tick, `remainingTicks 6→5` | task created `status: 'unassigned'`, `blocker: null` | `src/core/operations.ts:577-596` `[CODE]` |
| Director call | action `assignShootingDirector` | `unassigned → blocked`; **engine sets the scenery blocker itself** | `src/core/operations.ts:253-280` `[CODE]` |
| Clear load-in | action `clearSceneryLoadIn` | `blocked → ready`, `blocker → null` | `src/core/operations.ts:282-304` `[CODE]` |
| Schedule take | action `scheduleShootingTake` | `ready → scheduled` | `src/core/operations.ts:306-326` `[CODE]` |
| Take completes | tick, `remainingTicks 5→4` | `scheduled → completed`; requires `status === 'scheduled'` and `blocker === null` | `src/core/operations.ts:651-661` `[CODE]` |

Note the **inversion**: the blocker is *created by the director-dispatch action*,
not by a scenery system. Nothing about the world produces it.

### 3.4 What blocks camera

**Nothing physical.** `blocker.kind === 'scenery-load-in'` is a boolean gate on a
workflow, cleared by one player click. Enforcement:

- The tick will not advance a `remainingTicks === 5` production unless the task is
  `scheduled` and `blocker === null` (`src/core/operations.ts:651-653`) `[CODE]`.
- `clearSceneryLoadIn` throws unless phase is `shooting`, task is `blocked`, and
  the blocker's `taskId` matches (`src/core/operations.ts:288-298`) `[CODE]`.
- The invariant requires a blocked task to own its scenery blocker and forbids the
  blocker outside Shooting (`src/core/operations.ts:515-528`) `[CODE]`.
- The save re-proves both directions of the blocked↔blocker biconditional
  (`src/core/save.ts:2510-2525`) `[CODE]`.
- `studioPresence` deliberately treats the load-in hold as *people working on
  site*, never `waiting`: *"A `scenery-load-in` blocker is NOT a capacity queue —
  those people are on site, working"* (`src/core/presence.ts:143-146`) `[CODE]`.

### 3.5 "How load-in weeks work" — **there are none**

**Load-in has zero duration.** `[CODE]` It is a within-week, action-gated flag.
There is no `dueWeek`, no elapsed counter, no truck, no delivery record, no
inventory. The `set-scenery` reservation on `facility-scenery-shop` is held for
the **whole Shooting phase** (both weeks) purely because
`requirementsForPhase('shooting')` names it (`src/core/operations.ts:87`) `[CODE]`
— it is not consumed *by* load-in.

The contract lists as explicitly outside V1: *"an authored delivery route, travel
time, ETA, queue, loading bay, dock capacity"*, *"scenery inventory, flats, set
ownership, reuse, purchase, storage, wear, quality, or logistics"*, *"a new
Scenery Shop or service-yard facility, slot, reservation, task, phase, resource,
or clock"* `[DOC]` (`CONTRACT.md:623-628`).

### 3.6 TUNING constants governing it

**None.** `[CODE]` `grep -in "scenery|load.in"` across `src/core/tuning.ts` returns
exactly one hit — `capability: 'set-scenery'` inside the Craft Services Annex
blueprint (`src/core/tuning.ts:731`) `[CODE]`. The only *presentation* numbers are
in the contract's prose: a ≤1,200 ms acknowledgement sweep and fixed anchor
coordinates `[DOC]` (`CONTRACT.md:338-356`), and those live in scene code, not TUNING.

**The one number that does govern scenery capacity today:** `facility-scenery-shop`,
`capability: 'set-scenery'`, `capacity: 2` (`src/core/operations.ts:29`) `[CODE]`.
It is an `INITIAL_STUDIO_FACILITIES` literal, **not** a TUNING constant — which is
itself a violation of the project's own "constants live in TUNING" convention
`[DOC]` (`CLAUDE.md`, Conventions).

---

## 4. How a production binds to a stage, and what releases it

### 4.1 The binding is written twice, deliberately

1. **`FacilityReservation`** with `capability: 'soundstage'` on
   `workflow.reservations` — the authority (`src/core/types.ts:545-551`) `[CODE]`.
2. **`ShootingTask.soundstageFacilityId`** — a denormalised copy, set at Shooting
   entry from the reservation that was just allocated
   (`src/core/operations.ts:583-586`) `[CODE]`.

Tied by invariant: `task.soundstageFacilityId === stage.facilityId` where `stage`
is the workflow's soundstage reservation (`src/core/operations.ts:496-503`) `[CODE]`,
re-proved at import (`src/core/save.ts:2432-2440`) `[CODE]`, and walked
independently by `facilityEngagements` anyway (`src/core/placement.ts:823-831`) `[CODE]`.

### 4.2 `productionIdentity.ts` — what it does and does not do

`persistedProductionIds(state)` (`src/core/productionIdentity.ts:8-38`) `[CODE]`
is an **id-collision authority**, not a stage authority. It sweeps eight roots for
anything that could be a production id — active productions, released films,
theatrical runs, ledger, career events, broadcast items, coverage contexts,
workflows **and their reservations** (`:31`), and script projects — so a new
production id can never collide with a persisted consumer. Its header states the
rule: *"Any allocator or cross-domain reservation gate must therefore collide
against every persisted consumer, not merely the active/released production
arrays."* `[CODE]`

**It contains no stage logic.** For C2 it matters as the *pattern* a Set-id
allocator must follow, not as a stage surface. `[PROPOSAL]`

### 4.3 `tick.ts` order (the whole capacity-relevant sequence)

`[CODE]` — from `src/core/tick.ts`:

| Step | What | Line |
|---|---|---|
| — | `assertStudioPlacementInvariants` (whole placement/construction/accounting boundary) | `:162-164` |
| 0.5 | `completeDueScriptWork` — releases screenplay slots | `:169-186` |
| 0.6 | `completeDueCastingSessions` — releases casting slots | `:187-200` |
| **1** | **`advanceManagedProductions`** with union = script ∪ casting | `:202-213` |
| 1.5 | `completeDueConstruction` (legacy V11 root) | `:217-224` |
| 1.6 | `completeDuePlacements` — a placed facility joins `operations.facilities` **after** this week's allocation | `:227-240` |
| 2 | Collect `remainingTicks === 0` releasing productions | `:243-246` |
| 3 | Reception / release | `:249+` |

The 1.6 placement of construction completion is load-bearing: *"a placed facility
occupies land and contributes ZERO capacity until it flips here, and no existing
work is reallocated during the completing advance"* (`src/core/tick.ts:228-234`) `[CODE]`.

### 4.4 What releases the stage — **confirmed: there is no wrap**

`[CODE]` The stage is released at the `shooting → postProduction` transition
(`remainingTicks 4 → 3`), and the mechanism is **allocation replacement, not an
event**: `enterPhase` calls `allocateForPhase(operations, workflow, 'postProduction', …)`,
which returns reservations for `['post']` only, and the workflow's reservation
array is overwritten (`src/core/operations.ts:563-596`) `[CODE]`. The soundstage
and set-scenery reservations simply cease to exist. `shootingTask` is set to
`null` in the same replacement (`src/core/operations.ts:577-588`, `:593`) `[CODE]`.

**This corroborates the PF1 recon finding** recorded in the brief: *"the
authoritative **wrap** transition (shooting → post does not exist today)"* `[DOC]`
(`docs/c2-planning/00-C2-PLANNING-BRIEF.md:63-64`).

Consequences that matter for C2's "simulation theater" law (owner law 8) `[DOC]`:
- **No engine moment marks the end of shooting.** There is nothing to animate,
  nothing to announce, and nothing to which a "strike the set" beat could attach.
- **A stage is never explicitly freed**, so nothing can *observe* it being freed
  — no read model can say "Stage 7 becomes available next Tuesday" without
  re-deriving the whole phase table.
- If post capacity is unavailable, the stage is **not** released (§2.6 L1).

Other release paths for the stage specifically: cancel
(`src/core/actions.ts:647`) `[CODE]`; and nothing else. A production cannot be
paused, suspended, moved between stages, or have its stage swapped. `[CODE]`

---

## 5. C1 facility catalog machinery — how much of "buildable Soundstage" is data?

### 5.1 The three modules

**`facilityEffects.ts` (149 lines)** — *"every mechanical effect a facility has is
read from THIS module, and this module reads it from OPERATIONAL PLACEMENTS at
evaluation time"* (`src/core/facilityEffects.ts:1-13`) `[CODE]`. Three rules:
operational-only, pure/deterministic, neutral-when-absent (`:15-27`) `[CODE]`.

Critically, **effects are NOT declared on the blueprint.** A blueprint carries
`effectSummary` — *player copy* (`src/core/types.ts:906-921`) `[CODE]` — and the
effect itself is a **hand-written function** in `facilityEffects.ts`
(`developmentOfficeEstUplift` `:94-102`, `freelancerFeeMultiplier` `:144-149`,
`supersedingOperationalBlueprintId` `:119-133`) `[CODE]`, called from the
subsystem that owns the number.

**The exception that makes "buildable Soundstage" cheap:** *capacity is the one
effect that IS pure data.* `blueprint.capacity > 0` is the entire mechanism by
which a completed placement joins the shared registry
(`src/core/placement.ts:355-365`, `src/core/placement.ts:771-776`) `[CODE]`.

**`construction.ts` (481 lines)** — despite the name, this is now the **retired
V11 Annex root**. Under V12+ it asserts `construction.projects.length === 0` and
`parcel.projectId === null` (`src/core/construction.ts:164-181`) `[CODE]`. It
survives as the shape validator and as the delegating checker for cash
reconciliation and the shared script/casting law (`src/core/tick.ts:150-160`) `[CODE]`.
**Real construction lives in `placement.ts`.**

**`placement.ts` (2130 lines)** — the placement engine: catalog lookup
(`:238-243`), footprint cells (`:263-270`), occupancy indices (`:273-306`),
derived `StudioFacility` (`:308-325`), legality quote (`queryPlacement`, `:456+`),
commit (`:681-724`), weekly completion (`:738-786`), Move & Demolish (`:794-1056`),
and all invariants (`:1060+`) `[CODE]`.

### 5.2 The blueprint schema — what a new class must declare

`FacilityBlueprint` (`src/core/types.ts:886-940`) `[CODE]`, 17 fields:

```
id · name · capability · capacity · footprint{width,depth} · clearanceRing
requiresRoadAccess · buildWeeks · capex · weeklyOperatingCost
facilityIdBase · projectIdBase · ledgerNote · effectSummary
requires[] · maxInstances?
```

Current catalog: **five entries** (`FACILITY_BLUEPRINTS`,
`src/core/tuning.ts:748-754`) `[CODE]` — Annex, Development & Casting Hall,
Development Office II/III, Craft Services Annex. Of these, only Annex (cap 1) and
Hall (cap 2) provide slots; the offices and Craft Annex are `capacity: 0`
effect-only buildings (`src/core/tuning.ts:732`) `[CODE]`.

Requirement kinds (`BlueprintRequirement`): `date`, `facility`, `structure` are
**live**; `rank`, `certificate`, `award`, `research`, `landZone` are declared,
evaluatable, and honestly unmet (`src/core/blueprintRequirements.ts:49-67`,
`:151-159`) `[CODE]`. The module names itself the C3/C4 activation checklist
(`:46-48`) `[CODE]`.

### 5.3 Construction lifecycle, end to end

`[CODE]` `commitPlacement` (`src/core/placement.ts:681-724`) →
derive `facilityId`/`projectId` from `*Base` + placement id (`:691-692`) →
`PlacedFacility{status:'underConstruction', completesWeek}` (`:694-707`) →
`constructionCapex` ledger row, cash debited by the *quoted* cost (`:708-714`) →
weekly `completeDuePlacements` at `arrivalWeek` (`:738-786`) → flip to
`operational`, and **iff `blueprint.capacity > 0`** append
`placedStudioFacility(placed)` to `operations.facilities` (`:770-776`) `[CODE]`.

Order is `ascending completesWeek, then ascending placement id`
(`operationalPlacedFacilities`, `src/core/placement.ts:328-334`) `[CODE]`, and the
invariant compares `operations.facilities` against
`INITIAL_STUDIO_FACILITIES ++ capacityProvidingPlacedFacilities` index-for-index
(`src/core/operations.ts:413-437`, fed from `src/core/placement.ts:1812-1813`) `[CODE]`.

### 5.4 **How much of "buildable Soundstage class" is pure data?**

**Verdict: the engine half is ~90% data. The world half is ~0% data.** `[CODE]`

**Pure data — one new `FacilityBlueprint` literal in `tuning.ts` + one array entry:**
- `capability: 'soundstage'` — the capability already exists
  (`src/core/types.ts:524-528`) `[CODE]`
- `capacity: 1` — already the mechanism that joins the registry
- footprint 4×4, clearance ring, road access, buildWeeks, capex, opex — all data
- `requires: [...]` — `date`, `facility`, `structure` all evaluate today
- `maxInstances` — optional
- allocation, invariants, calendar, presence-by-capability, demolition,
  move, opex, refund, catalog UI — **all work unchanged**, because every one of
  them is capability-driven, not id-driven `[CODE]`

**NOT data — code that must change:**
1. `LOT_STAGE_BY_SOUNDSTAGE_ID` and `managedWorkflowLocation` — closed map + throw
   (`ui/src/engine/adapter.ts:5343-5346`, `:5532-5546`) `[CODE]`
2. `ProductionCard.stageId: 'stage-a'|'stage-b'` (`StudioLotSnapshot.ts:193`) `[CODE]`
3. The second location throw (`ui/src/engine/adapter.ts:6337-6343`) `[CODE]`
4. `PRESENCE_FACILITY_PLACE` (`ui/src/lot/tycoon/presence.ts:57-64`) `[CODE]`
5. `BUILDING_FACILITY_IDS` / `BUILDING_PRESENCE_FACILITY_IDS`
   (`ui/src/lot/buildingInspector.ts:189-212`) `[CODE]`
6. `STAGE_SLOTS` / `StageSlotId` (`ui/src/lot/snapshot/stageAssignment.ts:37-43`) `[CODE]`
7. `JOURNEY_STAGE_BUILDING_IDS` (`ui/src/lot/snapshot/firstFilmJourney.ts:95`) `[CODE]`
8. The `'stage-a'`-literal selectors (`sceneryLoadIn.ts:36`, `stage7Production.ts:103/119/154`) `[CODE]`
9. Renderer body/anchor authoring for each new stage
   (`ui/src/lot/tycoon/world.ts:207-232` pattern) `[CODE]` — and the C1 world
   already has *no* Hollywood-district body for `stage-b`, under a standing NO-GO
   (`docs/WORLD-FIRST-SOUNDSTAGE-12-WORLD-PRESENCE-V1-NO-GO.md`) `[DOC]`

**A blueprint added without (1)–(3) would produce a state the adapter throws on the
moment that production reached Rehearsal — a hard, screen-killing crash, not a
degradation.** `[CODE]`

---

## 6. DELTA-TO-C2 INVENTORY

Ratings: **easy** = data or ≤1 file, no schema change. **medium** = several files,
mechanical, compiler-assisted or invariant-caught. **hard** = new persisted state,
new save version, or a rule that must be *designed* before it can be written.

### 6.A — N stages, N buildable

| # | Surface | Change | Rating |
|---|---|---|---|
| A1 | `tuning.ts` `FACILITY_BLUEPRINTS` | add Soundstage blueprint(s) | **easy** `[CODE]` `tuning.ts:748` |
| A2 | Allocation / invariants / calendar / presence / demolition | **none** — all capability-driven | **easy (zero)** `[CODE]` `operations.ts:132-171` |
| A3 | `LOT_STAGE_BY_SOUNDSTAGE_ID` + `managedWorkflowLocation` | replace closed map with a derivation over `operations.facilities` / `property.structures` / placements | **medium** `[CODE]` `adapter.ts:5343,5532` |
| A4 | `ProductionCard.stageId` | widen to `BuildingId` | **medium** (typed fan-out) `[CODE]` `StudioLotSnapshot.ts:193` |
| A5 | `StageAssignment` legacy resolver | generalise `STAGE_SLOTS`, or delete if C2 makes engine authority universal | **medium** `[CODE]` `stageAssignment.ts:37-43` |
| A6 | `PRESENCE_FACILITY_PLACE`, `BUILDING_*_FACILITY_IDS`, `JOURNEY_STAGE_BUILDING_IDS` | derive from `providesFacilityIds` + placements instead of literals | **medium** `[CODE]` `presence.ts:57`, `buildingInspector.ts:189/206`, `firstFilmJourney.ts:95` |
| A7 | `'stage-a'`-literal selectors (scenery, Stage 7 handoff) | re-key on production id + reservation, not on a stage literal | **medium** `[CODE]` `sceneryLoadIn.ts:36`, `stage7Production.ts:103` |
| A8 | Renderer bodies/anchors/textures per stage | authored art + anchors per instance; the placed-facility body path exists (`placed-<id>`) but stage-scale bodies do not | **hard** `[CODE]` `world.ts:207-232`; `[DOC]` NO-GO 27a |
| A9 | `INITIAL_STUDIO_FACILITIES` closed-list invariant | `providesFacilityIds` may only name that frozen array — blocks a *founding* Stage 3 | **medium** `[CODE]` `placement.ts:1300,1333` |
| A10 | `MAX_CONCURRENT_PRODUCTIONS: 2` | delete the ceiling; throughput from capacity | **easy to delete, hard to survive** `[CODE]` `tuning.ts:50`, `actions.ts:333` |
| A11 | Greenlight hard-throw on capacity (L2) | convert to a queued/pending production | **hard** — new persisted state `[CODE]` `operations.ts:217-221` |
| A12 | Blocked-production capacity hoarding (L1) | decide whether a blocked production releases its stage | **hard** — product ruling, not code `[CODE]` `operations.ts:569-575` |

### 6.B — Sets as first-class reservable entities

There is **no Set anywhere in the engine today**: no type, no state root, no
action, no save field, no TUNING constant. `[CODE]` `set-scenery` is a *capability
of the Scenery Shop*, not a set.

| # | Surface | Change | Rating |
|---|---|---|---|
| B1 | `types.ts` | new `SetDefinition` (catalog) + `PlacedSet`/`StudioSets` (state) | **hard** `[CODE]` new root |
| B2 | `save.ts` (5,266 lines) | new save version, exact-keys validator, migration, historical-boundary rejection per law 19 | **hard** `[CODE]` `save.ts:498-517` pattern |
| B3 | The occupancy union (all six walks) | a Set reservation is a new member of every one | **hard** `[CODE]` §2.7 |
| B4 | `FacilityEngagementKind` | new `'set'` arm + `facilityEngagements` (or a parallel `setEngagements`) | **medium** `[CODE]` `types.ts:966-976`, `placement.ts:806` |
| B5 | Phase→requirement table — **three copies** | `requirementsForPhase` (`operations.ts:79-93`), `REQUIRED_CAPABILITIES` (`save.ts:2153-2162`), and the reachable-blocker table (`operations.ts:532-548`) must change **in lockstep** or import breaks | **hard** `[CODE]` |
| B6 | `ProductionBlocker` union | new arm (e.g. `set-unavailable`) → engine + save validator + adapter view | **medium** `[CODE]` `types.ts:562-571`, `save.ts:2461-2510` |
| B7 | Placement engine | sets are placeable bodies on stage ground → either reuse `PlacedFacility` or a parallel placement kind; `groundOccupiedCellKeys` must include them | **hard** `[CODE]` `placement.ts:298-306` |
| B8 | Genre weighting / quality / decay | new reception inputs — sets carry per-genre weights, quality and a boredom decay in the original | **hard**; shapes recoverable `[CORPUS]` `set_definition_schema.csv` TECH-SET-002/003/008 |
| B9 | Unlock gating | reuse `BlueprintRequirement` verbatim — the original used the *same* mechanism for sets and facilities | **easy** `[CORPUS]` TECH-SET-007; `[CODE]` `blueprintRequirements.ts:170-190` |
| B10 | Set↔stage binding | a Set standing *on* a stage is a two-level reservation (stage ∪ set) with a "does this set fit / suit this script" rule | **hard** — design first `[PROPOSAL]` |
| B11 | Read models (calendar, board, presence, journey, inspector) | sets must appear as occupancy, as a blocker cause, and as a place people stand | **medium** `[CODE]` `studioCalendar.ts:257`, `presence.ts:120-198` |
| B12 | Scenery load-in | today a zero-duration flag; with Sets it becomes a real "dress the stage" duration and the flag must either grow a clock or be replaced | **hard** `[CODE]` §3.5 |

**Corpus grounding for the Set entity** `[CORPUS]`
(`THE-MOVIES-2005-TECHNICAL-ARTIFACTS/set_definition_schema.csv`, 8 rows, all
`schema_confidence: VERY HIGH`): a set definition carries `dated` (availability
year, TECH-SET-001), `boredom` (0–1 decay field, TECH-SET-002), `quality`
(0–1 float, almost certainly Prima's 1–100 hidden Quality ×100, TECH-SET-003),
`backdrop` texture linkage (TECH-SET-004), a numeric `setid` distinct from display
name (TECH-SET-005), per-set weather flags (TECH-SET-006), a
`[blueprint] path / requires` block — *the same category-path and date-gated
unlock mechanism as facilities* (TECH-SET-007) — and **per-genre numeric weights
plus a `priority1` genre field, not a binary flag** (TECH-SET-008).
`THE-MOVIES-2005-ORIGINAL-DATA/set_catalog.csv` holds 39 set rows with
`hidden_quality_1_100`, `cost`, `attractiveness_effect`, `practice_genre`,
`unlock_condition`, `boredom_factor` — many `$?`/`n/a`, `claim_status` mixing
`SETTLED` and `INCOMPLETE`. **Numeric values are evidence, not spec** `[DOC]`
(brief, "Evidence corpus"); **the schema shape is the recoverable truth.**

### 6.C — Set / stage reservations (the joint model)

| # | Surface | Change | Rating |
|---|---|---|---|
| C1 | **Named union producer** — one `occupiedSlots(state)` replacing six walks | prerequisite for everything in 6.B; pure refactor, invariant-guarded | **medium** `[PROPOSAL]` |
| C2 | Reservation key `facilityId:slot` | must become resource-kind-qualified (e.g. `stage:facility-…:0`, `set:set-…`) or Sets and facilities will collide in one namespace | **medium** `[CODE]` `scriptDevelopment.ts:71-73` |
| C3 | Reservation *duration* | today reservations are open-ended with no `dueWeek` (`placement.ts:56-59`); a queue that can answer "when does this free up?" needs one | **hard** — new persisted field, new save version `[CODE]` |
| C4 | Queue state | owner law 2 requires a visible waiting list with cause; nothing persists a queue today | **hard** `[DOC]` brief:23-26 |
| C5 | The **wrap** transition | must be introduced as an authoritative moment before "wrap releases resources" (owner law 8) can be true | **hard** `[DOC]` brief:38-43; `[CODE]` §4.4 |
| C6 | Event model | engine emits no events; UI diffs state — C2 must rule persisted ledger vs transient emission before wrap/queue/premiere can be observed | **hard** `[DOC]` brief:61-64 |
| C7 | `studioCalendar` capacity summary | `facilityCapacity`/`occupiedSlots`/`availableSlots` sum over `operations.facilities` only; sets would be invisible | **medium** `[CODE]` `studioCalendar.ts:735-751` |
| C8 | Determinism | every new allocator must sort by id and consume zero RNG (law 23) | **easy but mandatory** `[DOC]` laws:85-89 |

---

## 7. RISKS, GAPS, AND CONTRADICTIONS (reported loudly, not resolved)

**R1 — Owner law 2 vs. the code, today.** *"When capacity is unavailable: QUEUE,
DON'T MAGICALLY FORBID"* `[DOC]` (brief:23-26) is contradicted by
`addManagedProductionWorkflow`, which **throws** when the development-casting slot
is unavailable at greenlight `[CODE]` (`src/core/operations.ts:217-221`). This is
reachable in normal play. C2 must rule whether greenlight becomes a queued
intent (new persisted state, new save version) or whether the UI pre-gates it.
**Not resolved here.**

**R2 — Owner law 8 vs. the absence of wrap.** *"wrap releases resources"*
`[DOC]` (brief:38-43) presumes a moment that does not exist `[CODE]` (§4.4). PF1's
recon already routed the wrap transition to C2 `[DOC]` (brief:63-64). Every
"simulation theater" beat around end-of-shooting is blocked on this.

**R3 — Blocked productions hoard stages.** `[CODE]` (`operations.ts:569-575`) A
production held at shooting→post keeps its stage *and* its scenery slot with no
time limit. Under N stages with real contention this is the dominant deadlock
shape. **Product ruling required**, not a code fix.

**R4 — "ONE union" is a discipline, not an authority.** `[CODE]` (§2.7) Six
independent traversals, three duplicated private helpers, and a `string` key the
compiler cannot check. Every C2 resource addition multiplies the edit surface.
`[PROPOSAL]` Land the named-union refactor (C1 above) as a standalone, behaviour-
neutral milestone *before* Sets.

**R5 — The phase→capability law exists in three places.** `[CODE]`
`requirementsForPhase` (`operations.ts:79-93`), `REQUIRED_CAPABILITIES`
(`save.ts:2153-2162`), and the reachable-blocker table (`operations.ts:532-548`).
Changing shooting's requirements to include a Set without changing all three
produces saves that export fine and **fail to re-import**.

**R6 — Brief wording vs. code on "founding placements".** The brief says C1
shipped *"nine fixed buildings → founding placements, IDs preserved"* `[DOC]`
(brief:51-54). In code they are **`PropertyStructure`s, explicitly NOT placements**
`[CODE]` (`types.ts:929-940`, `placement.ts:884-886`). This is not a trivial
wording issue: the Founding Flip depends on which one they are. If the Flip
requires founding bodies to be demolishable/relocatable/rebuildable, they must
*become* placements — a migration of `state.property.structures` into
`state.placement.facilities` with blueprint back-fill, which is a save-version
change and a change to `providesFacilityIds` law (`placement.ts:1300`). **I am
flagging this as a contradiction between the brief's summary and the code; I have
not resolved it.**

**R7 — Stage 12 has capacity but (in Hollywood) no body.** `[CODE]`
(`world.ts:132-135`) + `[DOC]` (NO-GO doc; law 27a). C2's "physically watch it
manufacture multiple movies" target requires a second visible stage. The existing
NO-GO forbids the obvious approach. **Art/world decision required before C2
scheduling.**

**R8 — Scenery capacity lives outside TUNING.** `facility-scenery-shop
capacity: 2` and both soundstage capacities are object literals in
`operations.ts:29-31`, not TUNING constants `[CODE]`, contrary to the project's
own convention *"Constants live in TUNING… Never inline a magic number that has a
name in the contract"* `[DOC]` (`CLAUDE.md`). Any C2 rebalance of stage/scenery
capacity edits engine source, not tuning.

**R9 — Corpus completeness.** `set_catalog.csv` has 39 rows but many `$?` costs
and `n/a` boredom factors, with `claim_status` including `INCOMPLETE`
`[CORPUS]`. The *schema* (`set_definition_schema.csv`, 8/8 VERY HIGH) is far more
reliable than the *values*. Consistent with master-plan §11 `[DOC]`. Any C2 set
catalog must be authored in our own economy, citing the corpus only for shape.

**R10 — Load-in is a click, not a system.** `[CODE]` (§3.5) If C2 makes scenery
load-in a real duration driven by Sets, the existing `scenery-load-in` blocker
arm, its save biconditional (`save.ts:2510-2525`), its presence ruling
(`presence.ts:143-146`), the whole accepted Scenery Load-In V1 UI contract, and
its four frozen Week-30 fixtures with pinned SHA-256s `[DOC]`
(`CONTRACT.md:441-446`) all move together. **The V1 contract's Keep gate would
need re-proving.**

**R11 — PF1 robustness.** PF1 is `src/core`-untouched, no V14 `[DOC]`
(brief:55-59). Nothing in this lane's findings depends on any PF1 milestone
surviving. If a PF1 milestone is KILLED, **none** of §1–§5 changes. `[PROPOSAL]`

---

## 8. What I did NOT find (stated so nobody re-searches)

- No `Set`, `set`, `sceneryInventory`, `stageDressing`, or `props` type, state
  root, action, or save field anywhere in `src/core`. `[CODE]`
- No queue, waiting list, pending-production, or deferred-greenlight state. `[CODE]`
- No `wrap`, `strike`, or `endOfShooting` transition, action, or event. `[CODE]`
- No reservation `dueWeek`, `expiresWeek`, or duration field on
  `FacilityReservation`. `[CODE]` (`types.ts:545-551`)
- No TUNING constant governing scenery, load-in, stage count, or stage capacity. `[CODE]`
- No engine event emission of any kind (consistent with the brief's event-model
  docket, brief:61-64). `[CODE]` `[DOC]`

---

*End of Lane 1 report.*
