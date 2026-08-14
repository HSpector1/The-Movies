# World-First Scenery Load-In V1 Contract

Status: **FROZEN AUTONOMOUS-MARATHON IMPLEMENTATION CONTRACT**

Date: 2026-08-14

Branch: `operation-hollywood-autonomous-marathon`

Contract parent: `933d074dd3c3d775f2f16f6c53de6d47e6924993`

Protected refs at contract freeze:

- primary `main`: `33eb33ae307904aa3f00db20bc695e40bf46d1e4`;
- accepted D-17B branch: `35d42687a410a621becf1df35c75986657f8c44e`; and
- accepted Operation Hollywood bridge: `623b8b2a80e9c6b85304eaa2a338b6045e8f6b21`.

Authority base:

- Owner world-first product-direction ruling and canonical Lesson DB;
- accepted D-17B bounded-repair ruling `35d4268` and every still-open macroeconomy residual;
- Operation Hollywood bridge `623b8b2`, current runtime district/Role Atlas authority, and accepted
  world-first product doctrine;
- Production Operations V1's existing shooting-task, blocker, reservation, command, save, and
  deterministic processing law;
- World-First Soundstage Intervention V1 contract `001c692`, implementation `c48f8ac`, and closure
  `6419452`;
- World-First Live Week Advance V1 contract `3391528`, implementation `621e7e1`, and closure
  `a9be116`; and
- World-First Annex Construction Interaction V1 contract `6cab9c9`, implementation `7a370fd`, and
  closure `933d074`.

## Purpose and bounded ruling

Close the next observed break in the Owner's critical world-first experience. A real managed
production at Soundstage 7 can already reach the authoritative `scenery-load-in` blocker, and the
lot inspector can already dispatch `clearSceneryLoadIn`. But the physical **Scenery & Service**
yard currently behaves as a generic place while scenery work exists only as inspector text. The
player does not yet see the source-to-stage relationship, select the visible service problem, or
continue the shooting command chain from that world location.

This contract makes the existing blocker spatially playable without inventing a delivery system:

```text
SOUNDSTAGE 7 SHOWS AN ENGINE LOAD-IN HOLD
→ SCENERY & SERVICE SHOWS THE EXACT BLOCKED FILM / DESTINATION
→ SELECT THE PHYSICAL YARD OR SEMANTIC SERVICE PROBLEM
→ EXACT SAME-LOT LOAD-IN CONTEXT
→ DISPATCH THE EXISTING CLEAR COMMAND ONCE
→ ENGINE CHANGES BLOCKED → READY
→ WORLD ACKNOWLEDGES SCENERY DELIVERED
→ FRESH SCHEDULE-TAKE COMMAND RECEIVES FOCUS
→ CONTINUE AT SOUNDSTAGE 7 ON THE SAME LIVE LOT
```

This is a world-interaction and presentation repair. It is not a new production phase, scenery
facility, truck simulation, worker assignment, route planner, delivery timer, resource inventory,
construction system, or economy law. The Engine remains the sole owner of whether load-in is
blocked or clear.

## Historical compatibility and prospective ownership

The Soundstage Intervention contract and closure remain accurate evidence of their checkpoints.
Their generic Stage 7 inspector path stays supported. This contract adds a narrower physical owner
for the scenery beat:

- a scenery blocker may now be entered from **Scenery & Service** as well as Stage 7;
- the same projected command and App-owned dispatcher serve both surfaces;
- generic service-yard selection remains unchanged when no exact Stage 7 scenery context exists;
- after accepted clear, the dedicated service context survives long enough to expose the fresh
  `scheduleShootingTake` command; and
- accepted schedule returns selection to exact Stage 7 rather than leaving stale service work.

No historical frozen document is edited to make this prospective extension appear retroactive.
Production Board and the existing generic Studio Desk remain complete deep-management paths.

## Exact Engine authority and measured transition

The existing public action is the only load-in authority:

```ts
runProductionCommand(state, {
  kind: 'clearSceneryLoadIn',
  productionId: 'prod-0026',
  label: 'Clear scenery load-in'
})
```

For the governed Week-30 blocked fixture, accepted clear changes exactly two serialized paths:

```text
state.operations.workflows[prod-0026].shootingTask.status
  "blocked" → "ready"

state.operations.workflows[prod-0026].blocker
  {"kind":"scenery-load-in","taskId":"shooting:prod-0026"} → null
```

It does not change week, cash, RNG, ledger, production countdown, people, reservations, facilities,
construction, contracts, publicity, releases, or broadcast state. The Soundstage 7 and Scenery
Shop reservations remain claimed. The stage remains occupied and not recording.

The fresh adapter projection truthfully changes:

| Projected field | Before accepted clear | After accepted clear |
| --- | --- | --- |
| `taskStatus` | `blocked` | `ready` |
| `statusLabel` | `Production hold` | `Decision required` |
| blocker kind | `scenery-load-in` | `take-scheduling` |
| current command | `clearSceneryLoadIn` | `scheduleShootingTake` |
| attention | `decision-required` | `decision-required` |

The serialized workflow blocker is null after clear; the adapter's fresh `take-scheduling` blocker
is a derived player decision. These facts may not be conflated or asserted as one stored field.

No animation, scene event, marker, announcement, elapsed time, or arrival may cause or complete
this transition.

## One shared exact scenery selector

The scene and React host must use one pure selector over `StudioLotSnapshot`. It fails closed unless
all of the following are true:

1. `snapshot.operationsMode === 'managed'`;
2. `snapshot.stageAssignmentAuthority === 'engine'`;
3. exactly one operation has `locationBuildingId === 'stage-a'`; zero or duplicate Stage 7 records
   are invalid for this interaction;
4. the exact operation has `phase === 'shooting'`; and
5. the operation matches one of these complete states:

```text
BLOCKED SERVICE STATE
taskStatus === 'blocked'
blocker.kind === 'scenery-load-in'
currentCommand.kind === 'clearSceneryLoadIn'
currentCommand.productionId === operation.productionId

READY SERVICE STATE
taskStatus === 'ready'
blocker.kind === 'take-scheduling'
currentCommand.kind === 'scheduleShootingTake'
currentCommand.productionId === operation.productionId
```

The selector returns only the exact operation and the discriminated `blocked | ready` presentation
state. It never selects `productionOperations[0]`, parses a facility label, infers a task from a
person, borrows Stage 12, retains a prior operation, or substitutes a different film after snapshot
replacement. Stable production identity, not array order or title text, owns the interaction.

The ready state is included only to preserve same-context continuity through the accepted clear and
expose the authoritative successor command. Scheduled, completed, unassigned, facility-capacity,
legacy, presentation-authority, absent, malformed, relocated, duplicate-Stage-7, or mismatched
command states return no service interaction.

## Frozen runtime district identity

The physical source is the current accepted runtime place, matched by both literal IDs:

```text
place.id === 'service-yard'
place.buildingId === 'post'
place.label === 'Scenery & Service'
place.anchors.truck === [271, 626]
place.anchors.sceneryRack === [112, 404]
place.anchors.loadIn === [390, 584]
place.affordances === ['delivery', 'supply-scenery', 'load-in']
```

The exact destination is:

```text
place.id === 'stage-7'
place.buildingId === 'stage-a'
place.label === 'Stage 7'
place.anchors.entry === [586, 383]
place.anchors.crewCall === [662, 472]
place.anchors.camera === [558, 527]
place.anchors.service === [500, 500]
place.affordances === ['enter-stage', 'shoot', 'load-in']
```

The accepted Annex identity that regeneration must not erase is:

```text
place.id === 'annex-parcel'
place.buildingId === 'expansion'
place.label === 'Development & Casting Annex'
place.anchors.site === [640, 790]
place.affordances === ['develop-studio', 'construct-annex']
```

`service-yard` has the coarse existing `BuildingId` `post`; that is runtime hotspot identity, not a
claim that Post Production is the Scenery Shop. This interaction must not select the Post building,
dispatch `BUILDING_ACTION.post`, route to a Post screen, rename a BuildingId, or manufacture a
facility identity from the place.

The district manifest is consumption-only for V1. The authored source is stale relative to the
accepted runtime manifest, including its missing Annex and earlier hotspot geometry. Therefore V1
must not edit or regenerate the source manifest, runtime manifest, district plate, exporter, or
district assets.

The following exact provenance is frozen through implementation and closure:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `art/hollywood/district-manifest.source.json` | 4,052 | `5af27d7a97739724990ec08ef1fe5888eeb069bccc8e81b351271c2268914889` |
| `ui/public/lot/hollywood/district-manifest.json` | 6,761 | `23bf9451b3a62099ed724b0f3a4082839b8246862ac5e61f3b72233dc5430d92` |
| clean temporary exporter manifest | 5,787 | `56057b6bdfd7d2e7f31b6ae839121d3996f83fc75e1eb2e5955939d862846ab7` |
| source plate `moonshot-studio-chronicle-concept.png` | 2,804,229 | `a6279762ab7db8b5a16ea71627e63ae918b74c2db8e0874731c34c09947e7c34` |
| `tools/hollywood/export_district.py` | 3,218 | `405cb831d7d0cf4daaefe2259b0b27160157cbd65cb86c056814059c37b488fe` |
| district base PNG | 2,750,802 | `a920e651d9b48b81dbcd6b2923f3c558326692705ea7b6a8fcb854055d009978` |
| truck occluder PNG | 245,021 | `c559cce2a06bb35da5aeda6fd237ed2a2abfdcc1f85954b898fe84cd6da6c4a1` |
| camera-dolly occluder PNG | 106,780 | `c190166b8e8b7efa5c4c37e30f59b0c6684aff15deaabb774b9e55e3f22c2dc5` |
| gate foreground PNG | 852,735 | `c91b9b831efd9a58ad6047013f300228663dc5ddd410d94188436327c054179a` |

A clean temporary exporter run already proved all four generated PNGs byte-identical while the
manifest alone diverged. The runtime manifest contains the accepted Annex and adjusted Stage 7,
publicity, service-yard, and gate geometry; blindly exporting would remove or move accepted world
identity.

Implementation must pin the hashes above and assert exact unique runtime identities, anchors, and
affordances for `service-yard`, `stage-7`, and `annex-parcel`. If implementation requires any
manifest or district-art change, stop this V1 and open a separate source/runtime reconciliation
milestone before regeneration.

The static truck occluder is part of the authored plate composition. It is not an authoritative
vehicle and must not be moved. The existing `street-to-stage-7` route is director travel and must
not be relabelled or reused as scenery delivery.

## Identity-only Hollywood event

Generic `place` is insufficient for the production beat: it carries no production ID, so a delayed
yard event could incorrectly substitute whichever film is blocked when React receives it. Add one
narrow event arm:

```ts
export type HollywoodSceneryLoadInSelection = {
  productionId: string
  locationBuildingId: 'stage-a'
  placeId: 'service-yard'
}

export type HollywoodEvent =
  // existing arms remain unchanged
  | { type: 'scenery-load-in'; sceneryLoadIn: HollywoodSceneryLoadInSelection }
```

The event carries identity only. It carries no GameState, mutable task, blocker result, command,
facility reservation, route, truck, worker, timer, clock, cash, or random result.

At pointer time, the exact `service-yard` polygon calls the shared selector against the latest scene
snapshot:

- blocked or ready emits the exact production/service identity and selects the yard outline;
- no exact selector result preserves the existing generic `place` event and place inspection; and
- no other polygon may emit the event.

The physical polygon and any visible scenery marker share one scene selection method. A host-only
selection method accepts the exact production ID, revalidates the same current selector and
canonical runtime place, paints the same outline, and emits no event. `StudioLotView` forwards the
event and host selection without widening it or importing a command.

## Same-lot context and multi-production law

React owns a dedicated service-yard context keyed by exact production ID. It is not generic
`hollywoodPlace`, not a selected Post building, and not an overloaded Stage 7 selection.

On physical or semantic entry, the host revalidates all event literals and the shared selector
against its latest snapshot. Exact entry:

- clears named-person, generic-place, Annex, and prior production-command context;
- records no fake selected BuildingId;
- retains the live lot, active production card, people, camera, pan, zoom, and week;
- requests the exact service-yard outline when a live canonical renderer is available;
- exposes `SELECTED LOAD-IN` / `Scenery & Service`, exact film, Soundstage 7 destination, task status,
  blocker, status, and the field-exact current command; and
- focuses that native command, or the persistent service status if no command can be focused.

Accepted `blocked → ready` retains this dedicated context. The fresh snapshot must replace all
blocker/status/command copy and focus the exact `scheduleShootingTake` successor. Accepted schedule
ends service context, selects exact Stage 7, and focuses its persistent scheduled status. It may not
recreate the renderer, change camera, navigate, or wait for presentation motion.

Rejection retains the exact service context and command, invokes no retry, focuses the command or
error status, and announces the adapter/core error. A stale clear must expose:

```text
applyActions: clearSceneryLoadIn rejected — productionId "…" has no active scenery-load-in blocker
```

A stale schedule must expose the core's exact `shooting task is not ready` rejection, retain the
ready service context, and must not select Stage 7 as though schedule had been accepted.

The App owner is called once and authoritative state remains byte-identical.

Snapshot replacement that removes, relocates, duplicates, schedules, completes, or otherwise
invalidates the selected service operation clears pending focus and fails empty. It never falls
through to another production. Selecting a person, place, Annex, or production explicitly exits
service context.

With simultaneous Stage 12 and Stage 7 work:

- reversed array order still selects the exact unique Stage 7 operation;
- a prior hostile Stage 12 selection is replaced by the exact Stage 7 service context;
- Stage 12 alone, even with a scenery blocker, paints/emits no service-yard production affordance;
- Stage 12 retains its truthful inspector/deep-management command path; and
- Stage 12 never borrows the Stage 7 marker, event, outline, destination, or presentation sweep.

## One existing App-owned command path

The lot continues dispatching only the field-exact
`ProductionOperationsState.currentCommand` through the existing callback:

```ts
onProductionCommand(currentCommand)
```

App already invokes `runProductionCommand(currentState, command)` once, replaces GameState only on
success, and returns the `ActionOutcome`. That owner remains unchanged. The scene imports neither
adapter nor core command code.

The interaction law is:

- selection never dispatches;
- the host performs a synchronous pending-action guard and revalidates the latest exact selector,
  production ID, presentation state, and command fields before dispatch;
- one accepted pointer, `Enter`, or `Space` activation calls the owner at most once;
- the lot supplies no stage, facility, task, blocker, destination, duration, worker, route, cash,
  or result beyond the exact projected command object;
- accepted state replacement precedes presentation acknowledgement and successor focus;
- rejection replaces no state and owns no second alert system; and
- from one pre-state, service-yard, Stage 7 inspector, Production Board, and direct adapter paths
  yield byte-identical GameState, RNG, ledger, and SaveFileV11 output.

## World presentation and acknowledgement law

Add one bounded scene projection using existing runtime anchors:

```text
source endpoint: service-yard.loadIn [390, 584]
destination endpoint: stage-7.service [500, 500]
```

One separate reusable `Graphics` object may paint:

- **blocked** — an amber source/destination relationship, waiting scenery/flat shapes, and a clear
  problem marker at Scenery & Service;
- **ready** — a green delivered relationship/check at Stage 7; and
- **scheduled, completed, absent, malformed, legacy, or Stage 12-only** — no scenery-service
  projection.

On a live accepted transition for the same exact production from blocked to ready, a canonical live
renderer in normal-motion mode must run one bounded presentation-only scenery-flat/crate sweep from
source endpoint to destination endpoint for at most 1,200 ms, followed by the persistent ready
marker and one activity announcement. It is a diagrammatic acknowledgement between authored
endpoints, not a claim that a truck or person took a simulated route. It uses no existing director
route.

The sweep begins only after a fresh accepted Engine snapshot. Its progress never gates the fresh
Schedule command, never mutates state, never consumes RNG, and never changes the production clock.
If schedule is accepted while it is moving, scheduled Engine truth cancels it immediately. Reduced
motion snaps directly to the ready marker and identical command availability. A directly loaded
blocked or ready save paints static truth without replaying the transition sweep or success
announcement.

V1 authorizes at most one additional Phaser display object, zero textures, zero decoded texture
bytes, zero actors, zero route records, and no asset or manifest mutation. Status must use text,
shape, and contrast rather than colour alone.

## Semantic, renderer-failure, input, and focus law

Canvas remains the primary visual pointer surface and stays `aria-hidden`; native DOM remains the
complete semantic and keyboard-equivalent surface.

When the shared selector returns blocked or ready, a native **Scenery & Service** problem control
enters the identical dedicated context. The left production blocker may become a service-yard
problem button only for the exact Stage 7 scenery blocker. Other Stage 7 blockers retain Stage 7
semantics, and Stage 12 blocker copy remains non-spatial for this district.

The semantic control must survive delayed renderer import, renderer construction rejection,
missing/malformed runtime manifest, and reduced motion while Operation Hollywood remains enabled.
Failure to paint the physical outline or marker cannot remove, relabel, disable, or substitute the
host's exact command path. A manifest failure never licenses an invented place identity.

The explicit Operation Hollywood content rollback remains its existing separate procedural/legacy
mode and is not an acceptance surface for this Hollywood-only slice. V1 neither removes that
rollback nor widens it into a second production-operations UI.

Every changed over-canvas surface contains `pointerdown`, `mousedown`, and `touchstart`; Phaser
independently rejects native events whose target is not its canvas. Native command activation by
pointer, `Enter`, or `Space` dispatches exactly once. Focus after accepted clear moves only when the
fresh ready snapshot and exact successor command exist. Focus after accepted schedule lands on
truthful persistent Stage 7 status. Reload reconstructs truth without stealing focus or replaying
ceremony.

All copy and controls remain reachable at 1280×720, 1366×768, 1440×900, 1920×1080, 1536×864 as the
125%-equivalent compact viewport, the additional 960×540 stress viewport, and actual maximum
in-world camera zoom. The living studio remains visible behind the context.

## Deterministic public-authority fixtures

Do not alter the frozen Live Week Advance generator, its fixture manifest, or its scheduled
Week-30 fixture. Create a separate public generator and directory:

```text
scripts/gen-world-first-scenery-load-in-fixtures.mts
ui/e2e/world-first-scenery-load-in-v1/
```

That directory contains exactly:

```text
manifest.json
week-30-nights-of-watchtower-stage-7-blocked.save.json
week-30-nights-of-watchtower-stage-7-ready.save.json
```

The new manifest records the exact bytes, SHA-256, schema/import mode, production/task identity, and
public-action derivation for those two files. The unassigned state is asserted in memory and not
written. The scheduled successor is asserted in memory and compared byte-for-byte directly with
the existing frozen
`ui/e2e/live-week-advance-v1/week-30-nights-of-watchtower-stage-7-scheduled.save.json`; it is not
duplicated into the new directory.

The generator replays only public Engine/adapter actions:

1. `newGame('marathon-annex-play')`;
2. sign the first 8 actor, 2 director, 3 writer, and 2 craft applicants for 104 weeks;
3. found the studio and activate managed operations;
4. advance 26 weeks;
5. select Week-26 freelancer Estelle Delgado, `t-dir-01`;
6. greenlight concept `c-01`, *Nights of Watchtower*, with writer `t-wri-03`, director `t-dir-01`,
   cast `t-act-13 / t-act-04 / t-act-16`, craft `t-cra-01`, shape
   `slowSetup / reversal / bittersweet`, `[-.4,.4]` on all axes, negative `$2,700,505.71`, and
   marketing `$400,000`;
7. advance four weeks to Week 30;
8. assert and run exact projected `assignShootingDirector` once; and
9. stop at the blocked state.

The exact public replay anchors are:

| State | Bytes | SHA-256 |
| --- | ---: | --- |
| Week-30 unassigned | 227,430 | `2b352e3ef1be5ab9d5e0ba0abfbeb6c0a717f5334afe7d6a60ff5a81cef584ca` |
| Week-30 blocked | 227,479 | `7534518e4db3970bb4ca988b0b0fa78975f5053ee67fd42377f69b80ebe711dc` |
| Week-30 ready | 227,425 | `6760b72739608e930da84726067685c515d87817cb3793f9d9d37fa9f2063f92` |
| Week-30 scheduled | 227,429 | `e922f9b7e957388bed7c7674be8c17596245823200e478371dc7ff970458f46b` |

The blocked fixture has Week 30, cash `$11,160,898.29`, RNG words
`859994619,1336761036,2793876205,1849893007`, 62 ledger rows, production `prod-0026`, task
`shooting:prod-0026`, five ticks remaining, Soundstage 7 reservation
`facility-soundstage-07 / slot 0`, Scenery Shop reservation `facility-scenery-shop / slot 0`, exact
scenery blocker, `stage-a` location, and exact clear command.

The generator must verify native SaveFileV11 import with `converted === false` and byte-identical
export/import for both emitted files, the in-memory unassigned hash before dispatch, the exact ready
hash after clear, and the exact scheduled hash after the successor command. Its reconstructed
scheduled bytes must equal the frozen Live Week Advance fixture. No fixture may be reverse-hand-edited,
and no state may be copied from legacy generic e2e saves.

## Compatibility and non-regression boundary

This slice changes no:

- core action, workflow transition, production phase, reservation, facility, capacity, processing
  order, countdown, or release result;
- App command owner, adapter command projection, navigation map, or deep-screen ownership;
- GameState or SaveFileV1–V11 schema, serialization, migration, validation, or persistence law;
- D-17B publicity, awareness/reach, marketing, discoverability, economy, ledger, reception, or
  balance classification;
- construction parcel, Annex project, cash, facility, capacity, clock, or progress;
- person identity, job, workload, relationship, contract, stress, fatigue, or career state;
- district manifest, source art, exporter, occluder, Role Atlas, actor pool, texture, or route;
- weekly clock, random draw, camera model, pan, zoom, or renderer authority; or
- Production Board, Stage 7 inspector, Stage 12 inspector, Dashboard, Assembly, Calendar, Roster,
  Hiring, Finance, Film Autopsy, save/import, or release-result behavior.

No new feature flag is introduced. Generic service-yard inspection remains available only when the
exact service selector is absent. Existing deep screens remain valuable supporting infrastructure.

## Authorized implementation surface

Expected source scope is narrowly:

- one shared pure snapshot selector;
- `HollywoodScene` event/selection and scenery projection;
- `StudioLotView` event forwarding and host-selection parity;
- `StudioLotScreen` dedicated context, semantic control, latest-state revalidation, focus, and exact
  command outcome handling; and
- minimal lot styling plus focused tests/evidence.

No production implementation change is authorized in `src/core`, adapter command projection,
`App.tsx`, save schema/migrations, navigation, district manifest/art/exporter, or economy systems.
If a discovered defect makes one of those changes necessary, stop and amend this contract with
measured evidence before widening scope.

## Required automated proof

At minimum, tests must prove:

1. the shared selector accepts only exact managed + Engine + unique Stage 7 Shooting blocked/ready
   states and returns production identity independent of array order;
2. zero or duplicate Stage 7, Stage 12-only, legacy, presentation authority, wrong phase, wrong
   blocker, wrong task status, wrong command kind, and mismatched command production ID fail closed;
3. the exact physical `service-yard` polygon emits the identity-only scenery event in blocked and
   ready states;
4. the same polygon preserves ordinary generic place selection when the selector is absent;
5. no other place emits the event, and Stage 12 never borrows Stage 7 selection or projection;
6. the visible marker and polygon use one scene selection method;
7. a host selection validates exact production and canonical place, paints the yard outline, and
   emits no feedback event;
8. `StudioLotView` forwards the exact event and returns truthful host-selection success/failure;
9. React revalidates all literals and the latest selector, rejects stale/mismatched events, and
   never substitutes a new production;
10. reversed `[Stage12, Stage7]` selects Stage 7, a prior Stage 12 context is replaced, and duplicate
    Stage 7 fails empty;
11. physical and semantic entry clear person/place/Annex context, retain lot/camera, and expose
    field-exact film, Stage 7, blocker, task status, status label, and command;
12. semantic pointer, `Enter`, and `Space` entry produce the same context without dispatch;
13. pointer, `Enter`, and `Space` command activation each call the owner exactly once;
14. a rapid duplicate or stale post-render command calls the owner no more than once and cannot
    accept twice;
15. accepted clear produces the exact two-path serialized delta and byte-identical result across
    service-yard, Stage 7, Production Board, and direct adapter surfaces;
16. accepted clear retains service context, renders the fresh `take-scheduling` projection, focuses
    `scheduleShootingTake`, and does not wait for presentation motion;
17. accepted schedule exits service context, selects Stage 7, and focuses truthful scheduled status;
18. rejected clear and rejected schedule each report the exact error, retain the respective
    blocked/ready service context and focus, perform no retry, and leave all authoritative bytes
    unchanged; schedule rejection specifically does not select Stage 7;
19. selection and accepted clear preserve week, cash, RNG, ledger, production countdown, people,
    reservations, facilities, construction, contracts, publicity, releases, and camera;
20. blocked and ready saves paint their exact static state directly without replaying a transition;
21. a canonical live renderer in normal-motion mode starts the bounded presentation sweep and one
    activity announcement only for a live same-production blocked→ready snapshot;
22. the sweep cannot mutate state, consume RNG, hide/focus/gate the Schedule command, or survive a
    fresh scheduled/absent/mismatched state;
23. reduced motion resolves directly to identical ready truth and command availability;
24. renderer import pending followed by accepted clear initializes from the latest ready state;
25. renderer import/construction rejection and absent/malformed manifest retain the complete
    semantic inspect/clear/schedule path without inventing an outline;
26. source/runtime/plate/exporter/PNG hashes and exact unique service-yard, Stage 7, and Annex
    runtime identities remain unchanged;
27. deterministic generator replay writes only the exact blocked/ready files and manifest, proves
    their native V11 roundtrips, asserts unassigned in memory, and proves the in-memory scheduled
    result byte-identical to the existing frozen scheduled fixture;
28. existing Soundstage, Production Board, Annex, weekly advance, deep-screen, save, and governed
    D-16/D-17 tests remain green;
29. all changed overlays contain every down-event family and cannot trigger an underlying canvas
    action;
30. governed responsive viewports and actual maximum camera zoom retain reachable controls, living
    world context, and no overlap, clipping, or horizontal page overflow;
31. production build adds at most one display object, no texture bytes, no actors, no route record,
    and no second renderer draw; and
32. focused tests, complete repository suite, both TypeScript projects, production build, governed
    D-16/D-17 harness, fixture replay, `git diff --check`, and protected-ref checks pass.

No implementation or closure checkpoint is permitted with an unresolved P1–P3 authority,
interaction, accessibility, save, accounting, renderer, or player-experience finding.

## Required live acceptance

Use ordinary-player browser sessions and the generated blocked SaveFileV11 fixture:

1. regenerate the fixture and prove every exact public hash;
2. import the blocked Week-30 save and open the Hollywood lot;
3. record the same mounted lot, camera, week, cash, *Nights of Watchtower*, Estelle Delgado,
   Soundstage 7 reservation, Scenery Shop reservation, blocked task status, and service-yard marker;
4. click the physical **Scenery & Service** yard/marker and verify the exact film, Soundstage 7,
   blocker, task status, and `Clear scenery load-in` command without navigation;
5. activate clear once and verify the Engine-ready projection, visual acknowledgement, fresh
   `Schedule the shooting take` focus, and unchanged week/cash/RNG/ledger/countdown/people/
   reservations/camera;
6. schedule while the required normal-motion acknowledgement is still moving and prove motion was
   not a legality gate;
7. verify scheduled truth cancels the service projection, selects Stage 7, and paints the existing
   scheduled/take-in-progress state only after Engine acceptance;
8. restore blocked bytes, enter through the native semantic **Scenery & Service** control, and
   activate clear through the keyboard path;
9. import blocked and ready bytes separately and verify direct truthful paint with no replayed
   success ceremony;
10. repeat under reduced motion;
11. repeat the complete semantic entry/clear/schedule path in an isolated renderer-import rejection
    session, then remove the temporary rule;
12. verify generic service-yard place inspection still works when no exact scenery context exists;
13. inspect 1280×720, 1366×768, 1440×900, 1920×1080, 1536×864, the additional 960×540 stress
    case, and actual maximum in-world camera zoom with zero product errors, warnings, failed
    requests, unreachable controls, overlap, clipping, or page-level horizontal overflow; and
14. at 1920×1080, remeasure 240 raw post-warm-up frames: average FPS ≥50, 1%-low FPS ≥30,
    p99/worst sampled frame ≤33.4 ms, no more than 34 display objects, 15 actors, one draw, and
    exactly 11,096,896 decoded texture bytes.

Reversed Stage 12/Stage 7 order, Stage 12-only, and duplicate-Stage-7 malformed cases remain
mandatory deterministic synthetic automated proof. They are not relabelled as ordinary-player
SaveFileV11 fixtures because this contract authorizes no public generator for malformed authority.

Live keyboard evidence must be labelled honestly. Controller focus without synthesized native
activation is not a physical keyboard pass and cannot be relabelled as one; automated native
keyboard parity remains required but distinct.

## Keep / kill gate

Keep only if an ordinary player can see the Stage 7 scenery problem embodied at Scenery & Service,
click the physical yard, clear the exact Engine blocker once, see scenery reach the stage, receive
the fresh shooting decision, schedule it, and continue on the same living lot with no authoritative
truth owned by the renderer.

Kill or revise if:

- the yard remains a generic/decorative menu launcher while the blocker lives only in text;
- a yard event can substitute whichever production happens to be current;
- Stage 12 borrows a Stage 7 identity, marker, or route;
- animation, elapsed time, a truck, a person, or React state clears or gates the Engine task;
- direct reload requires a ceremony before truth appears;
- accepted clear loses context or hides the successor Schedule command;
- the command routes away, resets camera, or recreates the renderer;
- renderer/manifest failure removes the semantic action;
- the implementation regenerates or mutates accepted district authority; or
- the slice introduces unsupported production, facility, people, delivery, construction, or
  economy behavior.

## Explicitly outside V1

- authoritative trucks, drivers, loaders, scenery crews, assigned workers, autonomous people, or
  pathfinding;
- an authored delivery route, travel time, ETA, queue, loading bay, dock capacity, or collision;
- scenery inventory, flats, set ownership, reuse, purchase, storage, wear, quality, or logistics;
- a new Scenery Shop or service-yard facility, slot, reservation, task, phase, resource, or clock;
- production-time, budget, cash, ledger, relationship, fatigue, stress, career, or contract effects;
- manifest/source reconciliation, asset re-export, truck movement, or new district art;
- Stage 12 district art, route, marker, or fabricated physical location;
- general building placement, roads, paths, construction, upgrades, maintenance, repairs, or
  utilities;
- persistent lot mounting across every deep screen or default startup/load routing;
- a generalized queue/bottleneck framework, parallel-production visualization, or Sims autonomy;
- any new macroeconomic tuning, fourth slot, facility candidate, size-scaling sink, or roster-wall
  repair; and
- financing, loans, bailouts, restructuring, bankruptcy, or a failure ladder.

The governing economic status remains exactly:

> **D-17B ACCEPTED — BOUNDED REPAIR, MACROECONOMY RESIDUALS REMAIN OPEN**

Cash runaway, top-studio economic immortality, the week-208 synchronized roster wall, P5 dominance,
world-led variance, cheap-film purpose, premium-film purpose, remaining menu breadth, and formal G12
timing remain open. No arbitrary cash sink or macroeconomic certification is authorized by this
contract.
