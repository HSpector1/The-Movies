# Project: Studio — P05A Implementation Reconnaissance

**Revision:** `P05A-RECON-r2-FINAL`
**State:** `READY FOR IMPLEMENTATION`
**Authorization qualifier:** This state means the implementation boundary is resolved; it does not authorize work before the Owner approves the final charter.
**Refresh method:** Changed-path-only reconciliation after Owner-accepted P04 and `P05A-STATIC-CONTRACT-GATE-01`

## 1. Final implementation recommendation

Implement Package 05 by extending the existing TypeScript Production truth, existing bridge projection, and accepted Unity presentation/navigation hosts. Do not create a parallel lifecycle, snapshot root, command registry, camera stack, Stage identity, or save model.

The final starting boundary is:

- TypeScript campaign `7811377cea1c1b9ddca2c17c626879504b23ed4e`;
- Unity campaign `29aea89a706a7f0961f5a460afc5bdb4d38d8395`;
- current schema `sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e`;
- protocol `4`, projection `11`, save `15`;
- generator/product identity beneath the TypeScript campaign tip `56e170a8590e18f0d56a494d8bffb413f2d10924`.

All prior P04-dependent reservations are resolved. P04 is Owner-accepted and closed at product pair `71521efed5dd113a3911c85410d0729eab13918f` / `5076af43fcd6a279f26e15a46a8389689b69db74`; the TypeScript closeout documentation tip is `4ddb58a38235067e3741a43905e3fc25f414ea0c`. The contract gate is integrated. There is no open product-law decision blocking implementation.

## 2. Authority and precedence

Where two sources overlap, implementation follows:

1. Owner rulings and accepted P04 behavior;
2. Package 05 main design at `d5653327c17709daea5e17ba00ce164678b9ad43`;
3. Package 05 Builder Annex at the same commit;
4. this final reconnaissance;
5. final readiness gate;
6. final implementation charter;
7. `docs/design/PROJECT-STUDIO-VISUAL-DIRECTION-PACKAGE-01.md`, its Builder Annex, and the four `docs/design/mockups/visual-direction-01/*.svg` sources at `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`, for presentation decisions only;
8. accepted Unity architecture audit;
9. current code;
10. static-audit recommendations as risk evidence only.

The Visual Direction Package may govern visual hierarchy, material cues, and management-distance legibility. It may not invent or override simulation state, phase precedence, blocker legality, identity, or commands.

## 3. Final P04 semantics P05 must preserve

### 3.1 Greenlight and Writer credit

The accepted P04A.3 boundary is explicit:

- `src/core/scriptReadModel.ts::{writerBlockers,packageAvailability}` publishes no Writer-credit-as-assignment blocker for the package Greenlight path.
- `src/core/castingPackageReadModel.ts` excludes the permanent credited Writer from seat/work availability.
- `src/core/employment.ts::{activeProductionCompanyTalentIds,activeWritingAssignmentIds,creditedWriterIds}` keeps company membership, active drafting, and permanent credit as separate sets.
- `src/core/actions.ts::applyGreenlight` excludes `writerId` from active Production-company occupancy while still forbidding the same person from doubling into a cast/craft seat on that picture.
- `src/core/actions.ts::applyGreenlightScriptProject` no longer imposes a second contracted-Writer gate. It queues through the same eventual commit path when capacity is unavailable.
- `ui/src/engine/adapter.ts::salarySum` preserves the displayed package-cost law without turning Writer credit into a current employment gate.
- A credited Writer is not a writing assignment, Production presence, Production company seat, cross-picture exclusivity claim, or fee merely by being credited.
- The Writer remains a film credit and quality contributor. Active drafting remains a separate exclusive writing assignment.
- The browser Lot company projection still contains a known display-only cross-picture credit/seat hazard. P05 must not expand it into engine authority; if a P05 consumer touches that shared mechanism, the worker must audit and correct sibling consumers under the charter, not silently copy it.

Greenlight outcomes are semantically distinct:

- `READY NOW` — legal and immediately grantable;
- `READY TO QUEUE` — legal, capacity unavailable, action remains actionable and truthfully promises waiting;
- `BLOCKED` — illegal until the adjacent exact reason is remedied.

These states may never be collapsed into one disabled boolean.

### 3.2 Exact-ID Casting Office entry

`StudioCastingInspectorCard.Evaluate`, `SelectProject`, and `HandleOpenClicked` route an explicit `projectId`; `StudioWorkspaceHost.OpenCasting` retains that ID and `FindProject` rebinds only the exact project. A building with several actionable screenplays requires an explicit exact-ID choice. The world Casting Office works without Production Rail priming. P05 inherits the law: every world anchor must independently lead to its local card and primary action, and no enabled control may silently return.

`StudioCastingWorkspace.DecideGreenlight` owns Greenlight headline, detail, and allowed action. `RefreshGreenlightCommitGate` re-applies transport-sensitive gate terms per frame. P05 material actions require the same single pure decision-owner pattern; transient polling must never latch a durable control.

### 3.3 Retained workspace, system menu, and input

Reuse rather than replace:

- `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` for the retained `UIDocument`, panel, context, open/close lifecycle, element-map evidence, and Back coordination;
- `StudioPresentationInputContext.SuspendForWorkspace` / `RestoreForWorkspace` for world-versus-workspace input ownership;
- `StudioSystemMenuHud.cs` and `StudioSystemMenuContracts.cs` for Resume, Save Game, Load Game, and Quit to Desktop, including armed Save/Load dispatch and exact disabled reasons;
- `StudioBridgeClient.cs` for revision/digest-bound commands, pending POST recovery, atomic snapshot application, save/load, and semantic memo-owner behavior;
- `TycoonCameraController.PushNavigationOrigin` / `TryRestoreNavigationOrigin`, `StudioCameraDirector`, and `StudioSelectionManager.NextCancelStep` for exact origin/Back behavior.

Production selection changes information only. Only an explicit fresh Locate/Focus command may move the camera. Home remains overview and clears origin history; it is not Back. Workspace context may retain Production ID, subview, scroll/focus, modal, opener, and memo owner, but never camera pose.

## 4. Current Production authority

### 4.1 Lifecycle

`src/core/productionPhases.ts` remains the phase/capability authority.

| Remaining ticks | Persisted phase | Current law |
| ---: | --- | --- |
| 8 | `development` | Development/Casting reservation |
| 7 | `preProduction` | Development/Casting retained |
| 6 | `rehearsal` | atomic live Soundstage plus standing Set for current-binding workflows |
| 5 | `shooting` | Stage/Set retained, scenery required, first Shooting work week |
| 4 | `shooting` | scheduled/completed second Shooting week, then Wrap/Post attempt |
| 3–2 | `postProduction` | Post reservation; P05 read-only handoff only |
| 1 | `releaseReady` | no P05 workplace |
| 0 | downstream release | outside P05 |

Load-In, Director Required, Ready to Schedule, Blocked/Waiting, Shooting, Wrap, and clearing are operational/presentation states, not new persisted phases.

Routine time advancement remains autonomous. `assignShootingDirector` and `scheduleShootingTake` remain current player operations. A blocked transition holds that Production while other studio time and systems continue. Raw phase alone never proves a current worksite.

### 4.2 Identity and ownership

`Production != Stage != Set` is absolute.

| Entity | Exact key | Authority |
| --- | --- | --- |
| Production | `Production.id` | Production, workflow, queue, events, commands, workspace |
| Workflow | `ProductionWorkflow.productionId` | exact Production only |
| Stage resource | Soundstage `facilityId` | reservation/allocation authority |
| Stage world body | exact `buildingId` | Unity registry and Locate |
| Set | `StudioSet.id` | mounted Stage, binding, scenery source |
| Reservation | `productionId + facilityId + capability + slot + phase` | sole live resource claim |
| Binding | `stageFacilityId`, `setId`, locks, `heldSinceWeek`, provenance | current mirror plus qualified history |

Titles are presentation copy and may repeat. They are prohibited join keys.

`src/core/operations.ts::allocateForPhase` already performs atomic Stage/standing-Set acquisition for current-binding workflows. P05 reuses it. A migrated workflow with present bindings and explicit `requiresSetBinding:false` may retain a live Stage and null Set; that compatibility arm must not be misclassified as corrupt or silently broadened.

At Wrap, live reservations and shooting task are released before Post acquisition. Historical `bindings.setId`, locked novelty, and locked uplift may survive as film history but never prove current Stage/Set ownership. A new current Stage holder always outranks historical Wrap receipt.

### 4.3 Current Shooting task

| State transition | Current owner | Required P05 interpretation |
| --- | --- | --- |
| Shooting entry creates `shooting:<productionId>` / `unassigned` | `operations.ts::enterPhase` | exact Director call operation |
| Assign locked Director, task becomes blocked on scenery | `assignShootingDirector`; `actions.ts::applyAssignShootingDirector` | publish exact consequence, no inferred choice |
| Scenery settles, task becomes `ready` | shared operations transition | ready to schedule, exactly once |
| Schedule take, task becomes `scheduled` | `scheduleShootingTake` | current opaque command |
| first Shooting tick completes task | `advanceManagedProductions` | visible Shooting work |
| completion releases Stage and attempts Post | `releaseCompletedPhase` / `enterPhase` | Wrap receipt, no P05 Post controls |

P05 must not redesign these one-option operations into a broad polymorphic command framework.

## 5. Required TypeScript correction and closed projection

### 5.1 Scenery-load-in root correction

The implementation must correct one defect class across all enforcing/consuming layers:

- `src/core/sceneryLoadIn.ts::sceneryLoadInFor` must distinguish current derivation, explicit grandfather (`requiresSetBinding:false`), absent bindings, and invalid provenance; only exact `false` is grandfathered.
- `src/core/operations.ts::{clearSceneryLoadIn,arriveDueScenery}` must share one idempotent blocked-to-ready settlement law and append exactly one `sceneryArrived` event.
- `src/core/actions.ts::applyAssignShootingDirector` must derive from the newly assigned intermediate state and settle an already-due current load-in in that action.
- `src/core/tick.ts::tick` must evaluate natural arrival at the authoritative next-week boundary before Production advance while retaining accepted event timestamp law.
- `src/core/scriptReadModel.ts::nextProductionOperationsDecision`, `src/core/firstFilmJourney.ts`, and `ui/src/engine/adapter.ts::{managedProductionBoardCard,productionDecision,studioLotSnapshot}` must agree: current transit and current already-arrived states never offer manual Clear; only explicit grandfather does.
- `applyClearSceneryLoadIn` must reject current, arrived-current, absent, malformed, or forged Clear requests.

Do not add roads, inventory, traffic, vehicles, persistence, or a save migration. Freight/vehicle movement in Unity is a visual expression of exact source, destination, distance, and timing, never new logistics authority.

### 5.2 Existing projection root

Extend this path only:

```text
GameState
  -> ui/src/engine/adapter.ts::studioLotSnapshot
  -> ui/src/lot/snapshot/StudioLotSnapshot.ts::ProductionOperationsState
  -> bridge/session.ts::BridgeSession.snapshotFor
  -> bridge/schema/bridge-schema.ts
  -> bridge/schema/project-studio-bridge.schema.json
  -> generated/unity/StudioBridgeDtos.Generated.cs
  -> Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs
  -> StudioBridgeProtocol / StudioProjectionStore
  -> StudioBridgePresentation and retained workspace
```

Do not create a second snapshot root or handwritten bridge DTO.

The final pre-P05 generated representation now uses explicit abstract union bases, sealed member DTOs, and dedicated fail-closed converters for supported closed discriminators. Nullable primitives/objects keep nullability; compatible objects merge only under structural proof. Unsupported or incompatible unions fail generation with exact schema paths. Member order cannot change generated output. Any P05 schema extension must regenerate through the accepted command, update the actual Unity consumer, run the exact-consumer lock, and explain any schema/projection/version change. Save remains `15` unless saved bytes change.

The actual v11 generated union surface is:

- abstract `StudioBridgeQuoteRequest` with sealed `StudioQuoteCastingRequest` and `StudioQuoteCommissionRequest`;
- abstract `StudioQuoteSnapshot` with sealed `StudioCastingQuoteSnapshot` and `StudioCommissionQuoteSnapshot`;
- abstract `StudioProductionCommandSnapshot` with sealed `StudioAssignShootingDirectorCommand`, `StudioClearSceneryLoadInCommand`, and `StudioScheduleShootingTakeCommand`;
- dedicated `StudioBridgeQuoteRequestJsonConverter`, `StudioQuoteSnapshotJsonConverter`, and `StudioProductionCommandSnapshotJsonConverter`.

Common fields remain on abstract bases and member-only fields remain on exact subtypes. The protocol validates the runtime subtype and converters reject missing, duplicate, unknown, or cross-member discriminators. Optional nonnullable arrays omitted from JSON may be absent on raw DTO construction and are normalized to empty collections at the protocol boundary; required arrays retain generated initialization. P05 consumers must use these exact semantics rather than null/array workarounds.

### 5.3 Closed Production row

Extend `ProductionOperationsState` and generated `StudioProductionOperationsSnapshot`. Each active row, ordered by exact `productionId`, must carry:

- identity: Production ID, title, and existing concept ID;
- lifecycle: raw phase, phase label, closed operational state, state label;
- time: current week, state-appropriate weeks, next milestone;
- worksite resolution, exact owned worksites, policy-defined primary target, related and Locate targets;
- live Stage facility/world IDs and nullable current Set ID;
- exact company IDs/roles joined to TypeScript presence;
- typed blocker with effect, cause, consequence, holders, projected timing, and remedies;
- exact current semantic operation or null, with the opaque executable intent still in `availableIntents`;
- TypeScript-authored attention/copy;
- current-week/permanent Wrap receipt separately from current occupancy.

`progress01` remains compatibility-only and is **not consumed in P05 player UI**. Do not delete it solely for cleanup. P05 communicates phase, current operational state, authoritative weeks, and next milestone.

### 5.4 Closed operational states

The TypeScript projection owns these meanings:

1. Development working;
2. Pre-production working;
3. Rehearsal working;
4. Director required;
5. Scenery in transit / `LOAD-IN`;
6. scenery settlement pending after load/reconnect, with no manual Clear;
7. explicit legacy load-in acknowledgment;
8. ready to schedule take;
9. Shooting working;
10. resource wait;
11. wrapped waiting for Post;
12. Post handoff, read-only in P05;
13. Release Ready;
14. withheld / `STATUS UNAVAILABLE` on contradictory authority.

Unity must not reconstruct these laws from raw strings.

### 5.5 Stage-local projection invariants

Add a Stage-local collection keyed by exact Stage `facilityId`, carrying world `buildingId`, facility label, current holder ID, live Set ID, closed presentation state, holder copy, theater references, exact named presence references, structured logistics cue, optional historical Wrap receipt, and optional semantic presentation hint.

Enforce:

- one active row per Production ID;
- one holder per live Stage slot;
- one Production current on at most one Stage;
- one live Set on at most one Stage;
- one named person in at most one current Stage presence;
- native Stage/Set tuple only when reservation, binding, and mounted Set agree;
- explicit-grandfather live Stage may have null current Set;
- historical Set alone never populates current Set;
- current holder takes precedence over Wrap history;
- ambiguous world body withholds Locate/presentation for that identity without corrupting unrelated rows.

## 6. Worksite, blocker, queue, command, and presence laws

### 6.1 Worksites and Locate

Replace P05 reliance on singular `managedWorkflowLocation` / `locationBuildingId` with:

```text
currentWorksiteResolution: exact | none | withheld
ownedWorksites[]
primaryWorkTarget: exact target | null
relatedTargets[]
locateTargets[]
```

Every target carries relationship, resource kind, stable resource ID, capability when relevant, label, exact world target if uniquely resolvable, locatability, and safe reason. Selection changes information only. On activation, re-resolve by `productionId` against the newest atomic snapshot; stale or ambiguous targets retain context and do not move the camera. Never fall back to former Stage, Stage 7, first array member, nearest Transform, title, visually obvious holder, Post building while merely waiting for Post, or Theater at Release Ready.

### 6.2 Queue and remedies

`src/core/studioQueueView.ts::studioQueueView` remains the capacity/Set wait join owner. Compose its exact waiter, need, holder, resource, projected-release, and remedy facts. Projected timing is labeled projected/expected, not guaranteed.

Current accepted bridge intents cover Production operations, not a generic facility/Set remedy language. A P05 remedy therefore opens/navigates to the canonical Queue/Facility/Set owner with exact context unless that owner already publishes an exact opaque intent. Do not reconstruct an action from label text, array position, or local C# state. Cancel queued intent remains queue authority and is not active-Production cancel.

`bridge/session.ts::{resolveAvailableIntents,availableIntents,applyAvailableIntent}` remains the one command path. Extend it from first-journey Production selection to all active exact-ID Production decisions. A workspace submits exactly one fresh option matching semantic kind plus `productionId`, using its published `intentId`, revision, and digest.

P05 has no proven parameterized material draft requiring a new quote family. Do not add `/productionQuote`, a Production DSL, or a second intent registry.

### 6.3 Presence and theater

`src/core/presence.ts::studioPresence` remains named-person authority, with exact IDs, deterministic output, no simulation RNG, and at most one current site per person. P04's credited Writer is not Production presence. Current canon:

- Development/Pre-production: Writer and Director at Development/Casting where they have actual current assignments under authority;
- Rehearsal: Director plus Lead, Antagonist, and Support at the exact Stage;
- Shooting: Director and cast at Stage; named craft at Scenery;
- Post: Director and craft at Post;
- Release Ready: no Production presence;
- wrapped waiting for Post: no owned workplace.

The Stage projection filters by exact `ownerId` and current `productionId` before Unity. Unity validates those IDs and never borrows a body from another Production.

`src/core/studioWeekTheater.ts::studioWeekTheater` remains plant/activity authority. Compose existing `scenery-in-transit`, `stage-hot`, `stage-dark`, `set-mounting`, `set-struck`, `wrap-clearing`, `company-waiting`, `queue-waiting`, and `construction-progressing` subjects; do not overread them into lifecycle authority. Full performed-week playback is outside P05A.

Anonymous decorative crew are nonselectable, nonpersisted, stripped of authoritative identity and gameplay effect, scoped to one exact Stage, and configurable down to zero. The zero-budget proof must preserve simulation, named presence, blocker truth, and legibility.

## 7. Unity architecture and current collision map

### 7.1 Exact-ID N-Stage presenter

Replace the accepted singleton assumptions with one registry keyed by exact Stage facility/world identity. The registry must support any projected Stage count, duplicate/missing/unknown body withholding, stable registration/unregistration, and independent per-Stage presentation. It does not allocate Stages or decide phase.

Current seams to extend or replace narrowly:

- `StudioStageProductionPresentation.cs` — remove `stage-a`, Soundstage 7, historical-Wrap-first, Rehearsal-as-Waiting, and enum-only authority assumptions;
- `StudioBridgePresentation.cs` and `StudioBridgeBootstrap.cs` — lead-owned exact-ID bridge application and registry hookup;
- `StudioProductionRolePresentation.cs`, `StudioWriterPresencePresentation.cs`, and `StudioPersonPresentationSlot.cs` — use an exact-ID body registry, with one body per `talentId`; no scene-wide Update search;
- `StageActivityEffects.cs`, `StudioStageDoorCrewPresentation.cs`, `StudioShootingDayLotPresentation.cs`, `StudioLotDeliveryContracts.cs`, and `StudioVehicleRoute.cs` — bounded Stage-local visual consumers only.

Stage B must never display Stage A's project, people, blocker, nameplate, light state, or Wrap. One truthful nameplate names the exact Stage/project holder; when authority is withheld, show neutral/withheld state rather than false permanence.

### 7.2 Visual presentation contract

Against Visual Direction Package `728781dcfdcf32a13d3d3978cdc333b8c9a5e8a7`:

- Idle, Rehearsal, Load-In, Blocked/Waiting, Shooting, and Wrap must be visibly distinct;
- Blocked must read at management distance;
- Load-In shows freight/equipment movement tied to projected source/destination;
- Shooting is unmistakable through restrained beacon/door-light/closed-door/activity cues;
- Wrap is a one-shot/current-week receipt and cannot override a new current holder;
- the lot remains visually dominant;
- mockups are directional hierarchy references, not pixel-coordinate contracts;
- no global reskin, HDRP/DOTS/renderer migration, new renderer architecture, or art-package rewrite is allowed.

### 7.3 Retained Production workspace

Add a Production route/content controller under the accepted `StudioWorkspaceHost`. The workspace contains exact Production identity, state rail, worksites/Locate, company and presence, live Stage/Set versus historical facts, blocker cause/effect/consequence/timing/remedies, current one-option operation, and read-only Wrap/Post handoff.

It does not expose generic percentage, hidden quality, client priority, shot/scene counts, reshoot systems, Post editing, release controls, or cinematic playback. UI Toolkit owns layout, wide/narrow/controller/200%-text behavior, focus, and semantic copy consumption. Production content must not turn `StudioProductionRailHud` into the workspace.

### 7.4 System menu, input, Back, and memo collisions

Lead-only integration owns:

- `StudioWorkspaceHost.cs`;
- `StudioPresentationInputContext.cs`;
- `StudioSystemMenuHud.cs` and `StudioSystemMenuContracts.cs`;
- `StudioBridgeClient.cs`;
- `TycoonCameraController.cs`, `StudioCameraDirector.cs`, `StudioSelectionManager.cs`;
- `Assets/InputSystem_Actions.inputactions` only if evidence proves a required seam.

The Production owner cedes matching generic memo verbs only while it can render and execute the exact current operation in the active viewport/input context. If it is absent, failed, disabled, or unavailable, the exact memo action remains safe fallback. No per-frame poll may duplicate an operation or permanently latch a control. P05 must remain operable with the generic memo hidden, proving the new owner is complete.

## 8. One-owner implementation lanes

The table names the active editor for each path. Where work crosses a wave boundary, the outgoing owner commits and pushes a coherent range, records focused results, leaves the checkout clean, and stops; only then may the lead assign an incoming owner. Review/integration authority does not imply permission to edit a file assigned to another row.

| Lane | Exclusive paths/surface | Stop condition |
| --- | --- | --- |
| TS scenery | `sceneryLoadIn.ts`, `tick.ts`, bounded operations/tests | stop at settled truth + focused tests; no schema/UI |
| TS lead integration | `operations.ts`, `actions.ts`, `scriptReadModel.ts`, `firstFilmJourney.ts`, `adapter.ts` | one owner across collision files; no broad refactor |
| TS Production projection | `StudioLotSnapshot.ts`, optional bounded Production read-model module/tests | freeze semantic shape before schema |
| Bridge-session owner | `bridge/session.ts`, optional `bridge/snapshot-build-context.ts`, focused bridge-session tests | sole editor through W0 and W2 hookup; no schema/generator edits |
| Generated-contract owner | bridge schema/canonical/runtime, accepted generator command/tooling, manifest, TypeScript generated C#/fixtures, and exact Unity generated C#/fixtures | one atomic generation owner; generator/verifier frozen absent proved defect; no hand edit or recopy |
| Unity Stage | new registry plus Stage controller/local presentation files | no bridge/bootstrap/body/workspace edit |
| Unity body | exact-ID body registry and bounded person presenters | no Stage/bridge authority |
| Unity workspace | new Production workspace UXML/USS/controller/tests | host/input/menu integration excluded |
| Unity lead | bridge/bootstrap/client, protocol/loader/cache, host/input/menu/navigation and scene/authoring cut | consume/review frozen generated bytes but never edit them; integrate only after clean owner handoff |
| Visual Oracle | deterministic fixture, proof runner, evidence tool | proof cannot repair product law |
| Evidence operator | commands, hashes, manifests, XML/log/image collation | no production edit or visual judgment |
| Documentation/ledger | final report and campaign ledger at seal | integrator only |

One editing owner per checkout and collision-prone file is mandatory. Workers stop with coherent commits and evidence; the lead integrates through reviewed commits, not joint file editing. No shared patch queue and no parallel edits to `adapter.ts`, `bridge/session.ts`, schema/generated files, `StudioBridgePresentation.cs`, `StudioBridgeClient.cs`, or `StudioWorkspaceHost.cs`. A required regeneration returns schema and both repositories' generated outputs to the Generated-contract owner and invalidates every downstream consumer proof.

## 9. Tests and proof obligations

### 9.1 TypeScript/static

Required focused families include:

- due-at-call, next-boundary arrival, already-arrived reconnect, explicit grandfather, malformed/absent provenance, forged Clear, idempotence, and event timestamp;
- one active row per Production, duplicate Production/Stage/Set/person withholding, explicit-grandfather null Set, current holder before Wrap, same-title isolation, deterministic ordering;
- exact worksite/primary/related/Locate resolution and stale activation;
- all closed operational states and TypeScript-owned copy;
- queue holder/remedy composition and opaque-intent exact-ID selection;
- writer credit versus assignment/presence/exclusivity/fee, including out-of-contract credit and real queueability;
- save/migration compatibility, determinism, bridge schema, generated contract, hygiene, builds, and packaged graph.

### 9.2 Unity EditMode

Test registry duplicate/missing/unknown identity; two-Stage isolation; Stage holder/Set/nameplate precedence; neutral fallback; person-body one-to-one routing; no cross-Stage leak; lifecycle visual mapping; Wrap/new-holder precedence; workspace binding, stale snapshot/intent, decision-owned control state, exact disabled reason, menu/input/Back/origin coexistence, memo fallback, atomic snapshot mutation boundary, generated serializer rejection, and responsive hierarchy.

### 9.3 Runtime/evidence

Use the five separate proof layers defined by the charter. Synthetic fixtures, migration/compatibility fixture, and a private byte-copy of the Owner's real profile are separate obligations. Never mutate the real profile. Machine, visual, HID, and Owner proof remain separate; a lower layer cannot claim a higher-layer verdict.

Evidence must bind exact binary hash, process ID, window identity, repository commits, schema/protocol/projection/save, fixture, scenario, camera ID/pose, screenshot, sidecar, and result. Unreadable, stale, and absent evidence are distinct states. Evidence publication is atomic.

## 10. Save, migration, and package boundary

No P05-specific save migration is currently required. Production, workflow, phase, reservations, bindings, Sets, task, blocker, queue, events, and wrapped history already persist. P05 views and Unity presentation state are derived/non-authoritative. Add a save version only if implementation introduces a real saved-byte change and the authority chain explicitly permits it.

P05 ends at Production Wrap and read-only Post handoff. It must not add Post workspace, editing, release, marketing, performed-week movie making, stunt decisions, reshoots, client work, or Advanced Movie Maker. Those remain P06/later.

## 11. Final collision disposition

The P04-era reservation list is retired and replaced by the current one-owner map above. The accepted P04 files are reusable seams, not forbidden unknowns. The contract-gate files are frozen infrastructure:

- `scripts/generate-bridge-contract.ts` and `scripts/bridge-contract-csharp.ts`;
- `scripts/verify-bridge-contract-consumer.ts` and consumer-lock library/tests;
- generated DTO/fixture/manifest paths in both repositories;
- `.github/workflows/bridge-contract.yml`.

Touch them only for a P05 schema regeneration through accepted commands or a newly proven contract-gate defect. Do not combine P05 work with general generator rewrite, CI redesign, assembly restructuring, scenery maintenance beyond the named root correction, or other static-audit items.

## 12. Resolved dependency ledger

| Former provisional dependency | Final resolution |
| --- | --- |
| P04 acceptance | Owner `ACCEPTED — KEEP — CLOSED` at exact product pair |
| P04A.3 world entry | exact-ID Casting Office route works without rail priming |
| P04A.3 Greenlight | one decision owns copy/gate; per-frame transport refresh; ready-now/queue/blocked semantics preserved |
| Writer credit | separated from assignment, presence, company seat, exclusivity, and fee under accepted engine law |
| retained workspace host | accepted UI Toolkit host/context/input/Back seams identified |
| system menu | accepted Resume/Save/Load/Quit owner identified |
| memo ownership | accepted semantic owner/fallback behavior identified |
| contract union generation | CF-08 PASS at immutable generator/product commit |
| actual Unity consumer lock | CF-09 PASS at immutable committed pair |
| generated DTO shape | sound discriminator representation, serializer/deserializer and invalid-combination rejection proved |
| Unity project version | unchanged at `6000.3.22f1` |
| Visual Direction | exact commit reconciled as presentation authority only |
| six-scene Oracle | exactly six scenarios; two-Stage isolation nested under Shooting |
| Post boundary | P05 read-only handoff only; no P06 scope |

No unresolved product-law decision remains. Any new ambiguity discovered during implementation is a stop condition for the affected wave; the builder must not invent an Owner ruling.

## 13. Implementation entry

The code boundary is builder-ready, but work starts only after Owner authorization of `CODEX-P05A-IMPLEMENTATION-CHARTER.md`. On authorization, create isolated WIP branches/worktrees from the exact final campaign pair, push them before editing, assign one owner per checkout/file, and begin at the charter's entry gate. Do not treat this document's `READY FOR IMPLEMENTATION` state as authorization by itself.
