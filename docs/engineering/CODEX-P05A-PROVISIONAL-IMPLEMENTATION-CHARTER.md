# Project: Studio — P05A Provisional Implementation Charter

Revision: P05A-IMPLEMENTATION-CHARTER-r1-PROVISIONAL

Date: 2026-08-29

> **NOT AUTHORIZED FOR IMPLEMENTATION**
>
> This charter is provisional documentation. No P05 production branch, code, schema, generated
> DTO, Unity asset, test, scene, player, bridge, or proof run is authorized by it.

This charter cannot become final until all of these exist and are verified:

- final Owner-accepted P04A.3 TypeScript SHA;
- final Owner-accepted P04A.3 Unity SHA;
- static contract gate final TypeScript SHA;
- static contract gate final Unity SHA;
- P05A-RECON-r2-FINAL;
- clean committed and pushed worktree proof.

## 1. Provisional entry contract

Every placeholder below is deliberately loud and blocking:

| Required fact | Provisional value |
|---|---|
| Owner-accepted P04A.3 TypeScript | FINAL_P04A3_TS_SHA |
| Owner-accepted P04A.3 Unity | FINAL_P04A3_UNITY_SHA |
| Sealed static contract gate TypeScript | FINAL_CONTRACT_GATE_TS_SHA |
| Sealed static contract gate Unity | FINAL_CONTRACT_GATE_UNITY_SHA |
| Schema identity | FINAL_SCHEMA_ID |
| Protocol version | FINAL_PROTOCOL_VERSION |
| Projection version | FINAL_PROJECTION_VERSION |
| Save version | FINAL_SAVE_VERSION |

The charter may not be marked final, implementation branches may not be created, and no wave may
enter while any placeholder remains.

Accepted TypeScript f71369e8 currently validates save version 15. That observation is provisional
context only and does not fill FINAL_SAVE_VERSION after P04A.3 and the contract gate.

### Entry gate — all conditions mandatory

- P04A.3 is technically sealed at immutable pushed commits.
- The Owner explicitly accepts P04.
- CF-08 sound union generation is complete.
- CF-09 exact actual-Unity-consumer lock and post-commit attestation are complete.
- P05A-RECON-r2-FINAL has performed only the required changed-path refresh.
- Final schema/protocol/projection/save identities are pinned.
- Starting campaign branches, exact SHAs, remotes, and collision ownership are pinned.
- TypeScript and Unity implementation worktrees are isolated and clean, including untracked files.
- No active P04A.3 worktree is borrowed, changed, switched, merged, or moved.

Failure of one condition is a no-go, not a request to infer a value.

## 2. Authority and provisionality

### 2.1 Controlling precedence

1. Owner rulings.
2. Package 05 main design.
3. Package 05 Builder Annex.
4. P05A-RECON-r2-FINAL after the required refresh.
5. Accepted Unity architecture audit.
6. Final Owner-accepted P04 implementation.
7. Current accepted code.
8. Static-audit recommendations as risk evidence only.

### 2.2 Exact authorities inspected for this charter

| Authority | Commit | Path |
|---|---|---|
| Package 05 main design | d5653327c17709daea5e17ba00ce164678b9ad43 | docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05.md |
| Package 05 Builder Annex | d5653327c17709daea5e17ba00ce164678b9ad43 | docs/design/CODEX-PRODUCTION-SHOOTING-PACKAGE-05-BUILDER-ANNEX.md |
| P05 provisional reconnaissance | 9b72981205a90bcac52ff2ab1bb248e9d16edd72 | docs/engineering/CODEX-P05A-IMPLEMENTATION-RECONNAISSANCE.md |
| P05 readiness gate | 94285559a0a11466ee036104cf52e56a9f2893ed | docs/engineering/CODEX-P05A-READINESS-GATE-00.md |
| Current forward static audit | ee522834bd134280469eeb3878765e9f575018cf | docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md |
| Accepted Unity architecture audit and annex | 8110820d96ddf2089df582bc0a0a92d3d4cf17d9 | docs/engineering/CODEX-UNITY-PRODUCTION-ARCHITECTURE-AUDIT-01.md and Builder Annex |
| P04A reconnaissance | 44b0c8d0440fd683910d1ecd5a6365eaa49d82fc | docs/engineering/CODEX-P04A-IMPLEMENTATION-RECONNAISSANCE.md |
| GitHub-published P03A.3 UX North Star | 39cdef7b14044b11d7f0561b01c27638712e18da | docs/ux/P03A3_UX_ACCEPTANCE_AND_UI_NORTH_STAR.md |
| Current campaign ledger | f71369e8d39e7a5d0e93a2ed69b917a97ba046e4 | docs/campaigns/LIVING-LOT.md |
| Accepted TypeScript baseline inspected | f71369e8d39e7a5d0e93a2ed69b917a97ba046e4 | HSpector1/The-Movies |
| Accepted Unity baseline inspected | 3ed7510ac6917eaa3376690a2fe72703d6e944ee | HSpector1/project-studio-unity-visual-spike |

The P03A.3 UX source is the GitHub-published document, not an Owner-local Downloads path.

### 2.3 Unsealed P04A.3 evidence

At this pass, local TypeScript branch wip/p04a3-real-campaign-greenlight-ts-20260829 was observed
clean at f71369e8 and local Unity branch
wip/p04a3-real-campaign-greenlight-client-20260829 was observed clean at 3ed7510a. They had zero
discoverable changed paths at that instant.

Both branches and all subsequent contents are UNSEALED FORWARD EVIDENCE. Zero observed delta does
not mean P04A.3 will touch no file. P04A.3 is changing or validating Greenlight readiness,
completed-Writer credit semantics, Casting Office world entry, durable-profile behavior, and
possibly bridge projection or Unity routing. The final refresh must replace the provisional
reservation map with the exact accepted diff.

## 3. P05 product goal

At normal management distance, the player should immediately understand:

- that a movie is being made;
- where it is being made;
- what phase it is in;
- who is involved;
- whether it is blocked;
- what, if anything, the player needs to do.

Production must become alive, legible, autonomous, locatable, multi-project safe, exact-ID driven,
and visually understandable before it becomes cinematic.

Visible meaningful activity at management distance matters more than elaborate close-up
filmmaking animation. Watching detailed filmmaking is not the primary P05 scope. Unity presents
TypeScript-authored truth; it does not calculate lifecycle, progress, staffing, blockers, remedies,
identity, or outcomes.

### 3.1 Product laws carried into every wave

- Production, Stage, Set, facility, building, company, project, person, task, and intent identities
  are distinct and exact.
- All active Productions are present, ordered deterministically by exact ID.
- Current ownership beats historical Wrap evidence.
- No Stage A, Stage 7, first-controller, first-title, nearest-body, or array-index singleton rule.
- No generic progress01 presentation or invented percentage.
- No fabricated worksite when TypeScript has no current owned site.
- Blockers include exact effect, cause, consequence, and authorized remedy.
- A blocked Production never looks hot/active; an active one never borrows another blocker.
- Selection, Details, Locate, and Back remain distinct. Selection does not move the camera.
- Retained workspaces extend the accepted host/input/context system; they do not create a parallel
  document/router/back stack.
- Decorative people/logistics never carry authoritative person or lifecycle identity.
- No P06 Post/Release gameplay, Watch Shoot, cinematic capture, or film-result scope.

## 4. Provisional P05 wave map

The numbering below supersedes older provisional reconnaissance wave labels. Every wave has one
integration owner. Worker lanes may prepare bounded non-collision diffs, but workers never merge
among themselves.

### ENTRY GATE

- Dependency: all conditions in section 1.
- Exact likely files: this charter, final P05 reconnaissance, static-gate attestation, and
  docs/campaigns/LIVING-LOT.md for read-only authority inventory.
- Single owner / tier: Opus lead only.
- Interface freeze: final P04 TypeScript/Unity authority boundary, schema/DTO identity, accepted
  host/navigation/input/memo seams, starting branches, collision owners.
- Tests: read-only SHA/ref/remote/status, accepted baseline check-only suites.
- Runtime need: none; no Unity/player.
- Stop condition: any placeholder, unaccepted WIP, dirty tree, missing attestation, or contract
  mismatch.
- Rollback: none. Do not create implementation branches.

### WAVE 0 — Shared snapshot-build context

- Dependency: Entry Gate.
- Exact likely files: bridge/session.ts; only if proven clearer, new
  bridge/snapshot-build-context.ts; tests/bridge.test.ts,
  tests/bridge-runtime-session.test.ts, and tests/bridge-process-restart.test.ts.
- Single owner / tier: Opus lead — bridge/session.ts is ONE OWNER ONLY.
- Interface freeze: one response-local validated context owns state, revision, session, digest,
  projection, available intents, serialization, and payload size for one response; no global
  mutable cache or cross-response reuse; no wire/schema/version delta.
- Tests: spy/instrument validation, authoritativeDigest, studioLotSnapshot, intent resolution, and
  serialization so each occurs exactly once per snapshot/quote response; byte-equivalence to the
  accepted output; stale revision, session rollover, and restart.
- Runtime need: TypeScript/Node only.
- Stop condition: global cache, output byte/order change, weakened revalidation, lifecycle
  authority move, or collision with sealed P04 quote/session work.
- Rollback: revert only the Wave-0 commit; the accepted independent-call path remains.

### WAVE 1 — TypeScript Production truth repair

- Dependency: W0 green and final P04 intent/session surface frozen.
- Exact likely scenery files: src/core/sceneryLoadIn.ts, src/core/operations.ts,
  src/core/actions.ts, src/core/tick.ts, src/core/scriptReadModel.ts,
  src/core/firstFilmJourney.ts; focused operations/actions/scenery/journey/determinism/migration
  tests.
- Exact likely projection files: ui/src/lot/snapshot/StudioLotSnapshot.ts; optional new
  ui/src/lot/snapshot/productionOperations.ts and test; projection-only portions of
  ui/src/engine/adapter.ts and adapter.test.ts; existing stage7Production.ts as parameterized
  fail-closed precedent, not a second root.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: one bounded Sonnet scenery lane completes first, then one bounded Sonnet Production
  projection lane. Opus alone integrates protected actions.ts, scriptReadModel.ts, and adapter.ts.
  Those collision files are never edited concurrently.
- Interface freeze: productionPhases, allocator, queue, presence, save canon, and accepted P04
  Greenlight law; present bindings plus explicit requiresSetBinding:false is the sole grandfather.
- Required behavior: due-at-call and next-boundary scenery settle once; malformed/missing
  provenance fails closed; closed Production/Stage/Set/worksite/no-site/withheld rows; all-active
  exact-ID order; current holder over historical Wrap; exact blockers/remedies/intents; extend
  exact-ID body/person index inputs; progress01 not consumed.
- Tests: scenery geometry/timing/provenance/grandfather, save/reload/determinism; all-active,
  same-title, reversed allocation, Stage/Set/holder/person uniqueness; Wrap/current-holder;
  withheld/no fabricated worksite; exact intent isolation and copy.
- Runtime need: TypeScript/Node only.
- Stop condition: Unity workaround, new persistent authority/migration, second projection root,
  client lifecycle calculation, broad phase/allocator refactor, or schema work before shape freeze.
- Rollback: scenery and projection commits are independently revertible; never leave a selector
  patched around an unfixed root defect.

### WAVE 2 — Bridge schema and generated consumer

- Dependency: W1 closed shape and sealed CF-08/CF-09 implementation.
- Exact likely TypeScript files: bridge/schema/bridge-schema.ts,
  bridge/schema/project-studio-bridge.schema.json, bridge/schema/runtime.ts,
  bridge/schema/canonical.ts only as required; bridge/session.ts for lead-owned all-active intent
  integration; scripts/generate-bridge-contract.ts and pure generator/verifier modules;
  generated/unity/StudioBridgeDtos.Generated.cs and deterministic manifest;
  tests/bridge-schema.test.ts, tests/bridge.test.ts, runtime/restart tests.
- Exact likely Unity files:
  Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs;
  Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs;
  Assets/Studio/Runtime/Data/StudioBridgeWireValidator.cs;
  Assets/Studio/Runtime/Infrastructure/StudioSnapshotStateCache.cs only if validated shape requires
  it; Assets/Studio/Tests/EditMode/StudioBridgeProtocolTests.cs and
  Assets/Studio/Tests/EditMode/StudioBridgePlayerWorkflowTests.cs.
- Single accountable wave owner: Opus lead/integrator — ONE OWNER ONLY.
- Worker tier: Haiku may run fixture/hash/check matrices and collate results but edits no collision
  file.
- Interface freeze: accepted sound generator; no handwritten DTO; CF-09 actual-consumer lock; one
  existing snapshot/store; one current remedy intent per productionId; no duplicate first-film
  intent.
- Tests: closed schema missing/duplicate/unknown failures; CF-08 fixtures; generated DTO round
  trips; two active productions ordered by ID; A intent cannot mutate B; restart/session rollover
  and stale-intent; committed consumer hashes.
- Runtime need: TypeScript plus one authorized Unity batch compile/EditMode pass after the generated
  consumer changes; no packaged player or HID.
- Stop condition: manifest/parity/union/version failure, manual DTO request, unsupported schema
  union, dirty tree, or schema change before TypeScript truth freezes.
- Rollback: revert TypeScript schema/output and Unity consumer commits together to the last
  attested contract.

### WAVE 3 — N-Stage Unity registry

- Dependency: attested W2 consumer.
- Exact likely files: new
  Assets/Studio/Runtime/Presentation/StudioStagePresentationRegistry.cs;
  new Assets/Studio/Tests/EditMode/StudioStagePresentationRegistryTests.cs;
  Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs; new
  Assets/Studio/Runtime/Presentation/StudioStageProductionTruth.cs only if a full-truth binding
  type is necessary; lead-only
  Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs integration. Exact authoring
  paths are listed in section 6 and remain closed unless a runtime seam proves them necessary.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: Sonnet owns the bounded registry/controller patch; Opus alone owns
  BridgePresentation and any authoring/scene final cut.
- Interface freeze: exact building/facility keys, full snapshot replace/clear, current ownership
  precedence, project isolation; no singleton/index/title/Transform identity; no scene regeneration
  by default.
- Tests: zero/one/N controllers; duplicate/missing keys; swapped registration order; two current
  holders; same title; Waiting reason replacement; identity change with same enum; removal/session
  reset; same-tick reuse; historical Wrap cannot override current holder.
- Runtime need: Unity compile/EditMode only.
- Stop condition: Stage inference by index/title/nearest Transform, lifecycle calculated in C#,
  first-controller fallback, or broad scene rewrite.
- Rollback: revert registry/controller/integration commits. A partial registry never ships.

### WAVE 4 — Production world presentation

- Dependency: W3 registry and closed TypeScript truth.
- Exact likely files:
  Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs;
  Assets/Studio/Runtime/Presentation/StageActivityEffects.cs;
  Assets/Studio/Runtime/Presentation/StudioProductionRolePresentation.cs;
  Assets/Studio/Runtime/Presentation/StudioPersonPresentationSlot.cs;
  Assets/Studio/Runtime/Presentation/StudioWriterPresencePresentation.cs;
  new Assets/Studio/Runtime/Presentation/StudioPersonBodyRegistry.cs;
  Assets/Studio/Runtime/Presentation/StudioStageDoorCrewPresentation.cs;
  Assets/Studio/Runtime/Presentation/StudioShootingDayLotPresentation.cs;
  Assets/Studio/Runtime/Presentation/StudioLotDeliveryContracts.cs;
  Assets/Studio/Runtime/Presentation/StudioVehicleRoute.cs; and lead-only
  Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs application.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: bounded Sonnet Stage/world and presence lanes use nonoverlapping files; Opus alone
  integrates the shared application seam.
- Interface freeze: Idle, Rehearsal, Load-In, Blocked/Waiting, Shooting, Wrap; TypeScript owns
  lifecycle/copy/blocker; Unity owns bounded decoration only; neutral art fallback; one body per
  talentId; exact productionId/projectId/companyId agreement; Locate targets only the exact current
  Stage/worksite and fails closed when no stable current target exists.
- Tests: exact-ID body uniqueness; one person in two projects withholds duplicate placement;
  missing/wrong body; wrong Stage/Set; current-holder presence; decoration 0/low/high cannot alter
  truth; logistics cosmetic only; all six state bindings and management semantic roots; exact
  project/company/world agreement; Locate exact target, no-target, stale-target, and Back-origin
  restoration.
- Runtime need: Unity EditMode. No visual acceptance claim yet.
- Stop condition: Unity phase inference, decorative authority IDs, per-frame global scans, role
  hard-codes, cross-Stage borrowing, or forced cinematic/P06 scope.
- Rollback: revert each presentation component independently; retain neutral/dark fail-safe.

### WAVE 5 — Retained Production workspace

- Dependency: final P04 host/context/Back/memo shape and W4 truth.
- Exact likely files: new
  Assets/Studio/Runtime/Presentation/UI/StudioProductionWorkspaceController.cs;
  new Assets/Studio/UI/Resources/StudioProductionWorkspace.uxml;
  new Assets/Studio/UI/Resources/StudioProductionWorkspace.uss;
  new Assets/Studio/Tests/EditMode/StudioProductionWorkspaceTests.cs; lead-only
  Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs;
  Assets/Studio/Runtime/Presentation/UI/StudioPresentationInputContext.cs;
  Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs;
  Assets/Studio/Runtime/Presentation/StudioSystemMenuContracts.cs;
  Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs; and
  Assets/Studio/UI/Resources/StudioUiTokens.uss.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: Sonnet owns only the new P05 content patch; Opus alone owns
  host/router/context/memo/bridge collision seams.
- Interface freeze: TypeScript-authored facts and actions; all-active rows; exact project/company/
  worksite/Stage/Set/blocker/remedy; selection never moves camera; explicit Locate; exact
  camera-origin Back/context; no P06 controls.
- Tests: same-title/project isolation; row/detail synchronization; stale target disabled;
  Locate/Back/context/scroll/focus restore; UI-first Esc; controller/keyboard/mouse; one scroll
  owner; 16/14px text and 44-by-44 target floors; 200 percent text; responsive modes; byte agreement
  with world; no Unity lifecycle calculation.
- Runtime need: Unity EditMode; screenshots wait for W6.
- Stop condition: parallel UIDocument/host/input/Back/memo system, local intent minting, display-text
  parsing, generic progress, or workspace/world contradiction.
- Rollback: remove the Production route/content commit and leave the accepted P04 host intact.

### WAVE 6 — Visual Oracle V1

- Dependency: W1–W5 structurally green and exact build/contract identities pinned.
- Exact likely files:
  Assets/Studio/Runtime/Evidence/StudioRuntimeEvidenceReport.cs;
  new Assets/Studio/Runtime/Evidence/StudioEvidenceArtifactWriter.cs;
  new Assets/Studio/Tests/EditMode/StudioEvidenceArtifactWriterTests.cs; new
  Assets/Studio/Runtime/Presentation/StudioProductionManagementDistanceProofRunner.cs;
  new Assets/Studio/Tests/EditMode/StudioProductionManagementDistanceProofRunnerTests.cs;
  new tests/fixtures/p05-production-visual-oracle.ts;
  new Tools/p05-production-visual-oracle.mjs; immutable external sidecars/artifacts.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: Sonnet implements the bounded primitive/runner; Haiku executes and checks the
  hash/matrix mechanics; Opus performs every visual judgment.
- Interface freeze: exactly six scenarios; fixed viewport/camera; exact build/run/provenance;
  atomic evidence write; the reviewing agent must open and inspect each image before any claim.
- Tests: path containment, symlink rejection, hash/bytes/dimensions, atomic publication and partial
  failure first; then one bounded six-scene matrix with semantic automation only.
- Runtime need: one bounded packaged visual matrix after explicit wave authorization; no HID. This
  future runtime authorization is not granted by this provisional charter.
- Stop condition: wrong binary/process/commit/schema, stale/partial/missing sidecar, screenshot and
  semantics disagree, uninspected image, or proof-platform rewrite.
- Rollback: invalidate only the affected evidence set, fix the owning wave, and recapture only
  invalidated scenarios.

### WAVE 7 — Full regression and hostile review

- Dependency: valid six-scene evidence.
- Exact likely files: no product edit is permitted in W7. It reads the exact W0–W6 paths and writes
  only external test/proof/review records. Any upheld product finding reopens its owning earlier
  wave and exact file.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: a separate fresh-context Opus performs hostile review; Haiku executes/collates
  suites; a bounded Sonnet owner fixes only its previously assigned lane.
- Interface freeze: all cross-system interfaces.
- Tests: canonical TypeScript/bridge/browser; generated contract/actual consumer; full Unity
  EditMode; same-title, reversed allocation, duplicate authority, missing body, save/reconnect,
  stale Locate, zero decoration, 200 percent text, controller permutations; only affected Oracle
  recaptures.
- Runtime need: headless/EditMode; packaged only for an invalidated Oracle scene.
- Stop condition: any unanswered hostile question, stale provenance, reopened interface, or
  reviewer blocker.
- Rollback: revert the offending wave commit rather than broad campaign changes.

### WAVE 8 — Integration, seal, and Owner playtest

- Dependency: W7 clean; hostile findings disposed; immutable commits/attestation; all placeholders
  filled.
- Exact likely files: lead-only integration, if not already frozen, is limited to
  Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs;
  Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs;
  Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs;
  Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs; the exact five authoring files in
  section 6 and one already-identified scene/prefab only if W3 proved the need; immutable proof
  attestations; docs/campaigns/LIVING-LOT.md.
- Single accountable wave owner: Opus lead/integrator.
- Worker tier: Haiku performs clean-tree/hash/proof collation only; no worker integration or seal
  decision.
- Acceptance authority: the Owner alone accepts the product.
- Interface freeze: exact TS/Unity commits, schema/protocol/projection/save, build and evidence;
  P06 excluded.
- Tests: final clean-tree TypeScript/contract/Unity floor; one coherent Owner
  Greenlight-to-Production-to-Wrap/Post-handoff journey with Locate/Back, a two-picture checkpoint,
  and one Save/Load.
- Runtime need: packaged player only for the Owner journey and the already bounded Oracle; HID only
  if separately authorized by the final proof plan, never inferred here.
- Stop condition: dirty/unpushed SHA, unbound evidence, P06 control, failed proof, or no Owner
  acceptance.
- Rollback: do not merge or seal. Retain accepted campaign tips and open one scoped defect lane.

## 5. Current seam ledger

This is accepted-code archaeology, not an instruction to edit before the entry gate.

### 5.1 TypeScript seams

| File / symbol | Current fact to preserve or repair provisionally |
|---|---|
| src/core/sceneryLoadIn.ts: SceneryLoadInWithholding, sceneryLoadInFor, isSceneryLoadIn | Pure geometry/duration derivation exists; missing bindings or any requiresSetBinding other than true currently fail open as grandfather |
| src/core/tick.ts: tick scenery settlement step | Evaluates arrival at currentTick instead of the next boundary |
| src/core/operations.ts: allocateForPhase | Existing atomic Stage/standing-Set acquisition is reused; no allocator redesign |
| src/core/operations.ts: clearSceneryLoadIn, arriveDueScenery | Two settlement paths need one exact once-only root law |
| src/core/operations.ts: releaseCompletedPhase, enterPhase | Existing Wrap/release/Post handoff order remains core authority |
| src/core/actions.ts: applyAssignShootingDirector, applyClearSceneryLoadIn | Due-at-call settlement is absent; malformed provenance can reach manual Clear |
| src/core/scriptReadModel.ts: nextProductionOperationsDecision | Currently offers Clear for blocked scenery instead of exact current law |
| src/core/firstFilmJourney.ts | Rehearsal/load-in and Clear guidance must agree with root settlement; no Post misroute |
| ui/src/engine/adapter.ts: managedProductionBoardCard, productionDecision | Independently manufactures current Clear behavior |
| ui/src/engine/adapter.ts: managedWorkflowLocation | Singular/fallback location semantics are unsafe for P05 |
| ui/src/engine/adapter.ts: studioLotSnapshot | Existing projection root must be extended, never duplicated |
| ui/src/lot/snapshot/StudioLotSnapshot.ts: ProductionOperationsState | Current row exposes progress01 and singular locationBuildingId |
| ui/src/lot/snapshot/stage7Production.ts: stageProductionDetailContext | Parameterized exact-project precedent; not a new projection root |
| bridge/session.ts: resolveAvailableIntents, snapshotFor | Repeats validation/digest/projection/intent/serialization work; only first-film operation intents exist |
| bridge/schema/bridge-schema.ts: StudioProductionOperationsSnapshot, StudioProductionsProjectionSchema | Closed schema extension point after TS shape freezes |
| src/core/studioQueueView.ts: studioQueueView | Existing capacity/Set wait join owner |
| src/core/presence.ts: studioPresence | Named-person presentation authority |
| src/core/studioWeekTheater.ts: studioWeekTheater | Current-week plant/activity presentation authority |

### 5.2 Unity seams

| File / symbol | Current fact to preserve or repair provisionally |
|---|---|
| Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs | Hardcodes stage-a, collapses full truth to enum, lets historical Wrap precede live holder, maps Rehearsal to Waiting, and hardcodes Soundstage 7 copy |
| Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs | Has one Stage-controller resolver; exact-ID person slot seam exists, but production binding is not reliably cleared and holder matching is incomplete |
| Assets/Studio/Runtime/Presentation/StudioWriterPresencePresentation.cs | Performs a global SelectableEntity scan on cache miss during Update |
| Assets/Studio/Runtime/Presentation/StudioProductionRolePresentation.cs | Contains hard-coded stable-ID role lookup and enum-only state event |
| Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs | Accepted retained UIDocument/PanelSettings/input context and one-layer Back seam; no Production route exists |
| Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs | Development-only rail; do not mutate it into P05 |
| Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs | Accepted bounded memo booleans/hashset and generated DTO consumption; do not invent a generic registry |
| Assets/Studio/Runtime/Presentation/UI/StudioPresentationInputContext.cs | Accepted input-context law; extend minimally rather than implementing an imagined parallel action architecture |

## 6. P05 file ownership and collision map

ONE OWNER ONLY means no simultaneous edits, no shared patch queue, and no worker-side merge. The
Opus integrator may take ownership for the final cut after the bounded worker stops.

| Surface | Exact likely paths | Owner / tier | Collision ruling |
|---|---|---|---|
| Tick boundary | src/core/tick.ts and focused tick/scenery tests | TS scenery Sonnet | ONE OWNER ONLY with scenery settlement |
| Scenery truth | src/core/sceneryLoadIn.ts | TS scenery Sonnet | ONE OWNER ONLY |
| Operations truth | src/core/operations.ts | TS scenery Sonnet, integrated by Opus | ONE OWNER ONLY; no phase/allocator/save refactor |
| Action/selector integration | src/core/actions.ts, src/core/scriptReadModel.ts, src/core/firstFilmJourney.ts | Opus integrates bounded scenery patch | ONE OWNER ONLY; likely P04 collision |
| Production read model types | ui/src/lot/snapshot/StudioLotSnapshot.ts; optional productionOperations.ts and test | TS projection Sonnet | One projection root only |
| Browser/lot composition | ui/src/engine/adapter.ts and test | Opus final integration | ONE OWNER ONLY; never shared with scenery or P04 |
| Queue/presence/theater inputs | src/core/studioQueueView.ts, presence.ts, studioWeekTheater.ts | Existing authorities, projection owner consumes | Do not edit unless root evidence proves necessary |
| Shared snapshot context | bridge/session.ts; optional bridge/snapshot-build-context.ts | Opus lead | ONE OWNER ONLY across W0–W2 |
| Bridge schema | bridge/schema/bridge-schema.ts, runtime.ts, canonical.ts, generated schema JSON | Opus lead | ONE OWNER ONLY after TS shape freeze |
| Generator/verifier | scripts/generate-bridge-contract.ts, bridge-contract-csharp.ts, consumer-lock/verifier CLI, package.json, CI workflow | Opus lead | ONE OWNER ONLY; CF-08/CF-09 frozen |
| TS generated contract | generated/unity/StudioBridgeDtos.Generated.cs and manifest | Generator only under Opus | Never hand-edit |
| Unity generated consumer | Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs | Opus integration | Exact generated bytes only; ONE OWNER ONLY |
| Unity bridge client | Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs | Opus lead | ONE OWNER ONLY; P04/schema/workspace collision |
| Unity bridge application | Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs; Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs | Opus lead | ONE OWNER ONLY |
| N-Stage registry | new Assets/Studio/Runtime/Presentation/StudioStagePresentationRegistry.cs; new Assets/Studio/Tests/EditMode/StudioStagePresentationRegistryTests.cs; Assets/Studio/Runtime/Presentation/StudioStageProductionPresentation.cs | Unity Stage Sonnet | Registry/controller owned together; bridge hookup excluded |
| Stage presentation | Assets/Studio/Runtime/Presentation/StageActivityEffects.cs; StudioStageDoorCrewPresentation.cs; StudioShootingDayLotPresentation.cs; StudioLotDeliveryContracts.cs; StudioVehicleRoute.cs in that same directory | Unity world Sonnet | Bounded Stage-local files; no lifecycle authority |
| Exact-ID body registry | new Assets/Studio/Runtime/Presentation/StudioPersonBodyRegistry.cs; Assets/Studio/Runtime/Presentation/StudioWriterPresencePresentation.cs; StudioPersonPresentationSlot.cs; StudioProductionRolePresentation.cs in that directory | Unity body Sonnet | One body per talentId; bridge hookup lead-only |
| Workspace host/router | Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs; StudioPresentationInputContext.cs in that directory; Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs; StudioSystemMenuContracts.cs; Assets/Studio/UI/Resources/StudioUiTokens.uss | Opus lead | ONE OWNER ONLY; accepted P04 context/Back seam |
| Production workspace | new Assets/Studio/Runtime/Presentation/UI/StudioProductionWorkspaceController.cs; new Assets/Studio/UI/Resources/StudioProductionWorkspace.uxml and .uss; new Assets/Studio/Tests/EditMode/StudioProductionWorkspaceTests.cs | Workspace Sonnet | Content only; host integration excluded |
| Proof runners | new Assets/Studio/Runtime/Presentation/StudioProductionManagementDistanceProofRunner.cs; deterministic TS fixture; new Tools/p05-production-visual-oracle.mjs | Visual Oracle Sonnet | Proof code cannot repair product law |
| Test/proof execution | exact commands, hashes, manifests, XML/log/image collation | Haiku | No production/collision edits or visual judgment |
| Authoring/scene/prefab | Assets/Studio/Editor/Authoring/StudioLotContext.cs; StudioLotActivityAuthoring.cs; StudioLotLandAuthoring.cs; StudioLotArchitectureAuthoring.cs; StudioLotAuthoring.cs in that directory, plus an exact scene/prefab only if proven | Opus lead | ONE OWNER ONLY; no scene regeneration by default |
| Campaign ledger | docs/campaigns/LIVING-LOT.md | Opus lead/integrator | ONE OWNER ONLY at seal |

Additional exact lead-only navigation/input collision paths are:

- Assets/Studio/Runtime/Presentation/TycoonCameraController.cs;
- Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs;
- Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs;
- Assets/InputSystem_Actions.inputactions.

### 6.1 P04A.3 protected reservation

At the inspection instant, the P04A.3 WIP changed-path set was empty. Until final P04A.3 seals,
every active P04 worktree is forbidden, and these likely overlaps are reserved:

TypeScript:

- src/core/actions.ts;
- src/core/scriptReadModel.ts;
- src/core/presence.ts;
- ui/src/engine/adapter.ts;
- ui/src/engine/adapter.test.ts;
- ui/src/engine/writer-credit-not-assignment.test.ts;
- ui/src/lot/snapshot/productionCompany.ts;
- ui/src/lot/snapshot/productionCompany.test.ts;
- bridge/session.ts;
- bridge/schema/bridge-schema.ts;
- bridge/schema/runtime.ts;
- bridge/schema/canonical.ts;
- bridge/schema/project-studio-bridge.schema.json;
- generated/unity/StudioBridgeDtos.Generated.cs.

Unity:

- Assets/Studio/Runtime/Presentation/StudioCastingJourneyProofRunner.cs;
- Assets/Studio/Runtime/Presentation/StudioLivingTime.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspaceContext.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioPresentationInputContext.cs;
- Assets/Studio/Tests/EditMode/StudioCastingGreenlightTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingJourneyProofRunnerTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingScreenTestTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A2Tests.cs;
- Assets/Studio/Tests/EditMode/StudioLivingTimeTests.cs;
- Assets/Studio/UI/Resources/StudioCastingWorkspace.uss;
- P04A2-RESUME.md;
- Tools/p04a2-proof-journey.mjs;
- Tools/ownerinput/ownerinput.swift;
- Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs;
- Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs;
- Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs.

The accepted P04A.2 paths called out by the readiness authority are also protected until the exact
P04A.3 diff supersedes this list:

- src/core/actions.ts;
- src/core/candidates.ts;
- src/core/castingPackageReadModel.ts;
- src/core/employment.ts;
- src/core/index.ts;
- src/core/presence.ts;
- src/core/scriptDevelopment.ts;
- src/core/scriptReadModel.ts;
- src/core/studioRunRecap.ts;
- tests/_p04a2WriterCreditFixtures.ts;
- tests/actions.test.ts;
- tests/bridge-p04a2-writer-credit-law.test.ts;
- tests/p04a2-writer-credit-law.test.ts;
- tests/presence-scenario.test.ts;
- tests/script-read-model.test.ts;
- ui/src/engine/adapter.test.ts;
- ui/src/engine/adapter.ts;
- ui/src/engine/writer-credit-not-assignment.test.ts;
- ui/src/lot/NamedPersonWorkCareerInspectorV1.test.tsx;
- ui/src/lot/snapshot/personWork.ts;
- ui/src/lot/snapshot/productionCompany.test.ts;
- ui/src/lot/snapshot/productionCompany.ts;
- ui/src/lot/studio-lot-snapshot.test.ts;
- ui/src/screens/assembly-legality.test.tsx;
- ui/src/screens/script-projects-edge-ui.test.tsx;
- Assets/Studio/Runtime/Presentation/StudioCastingJourneyProofRunner.cs;
- Assets/Studio/Runtime/Presentation/StudioLivingTime.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspaceContext.cs;
- Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs;
- Assets/Studio/Tests/EditMode/StudioCastingGreenlightTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingJourneyProofRunnerTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingScreenTestTests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A2Tests.cs;
- Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A2Tests.cs.meta;
- Assets/Studio/Tests/EditMode/StudioLivingTimeTests.cs;
- Assets/Studio/UI/Resources/StudioCastingWorkspace.uss;
- P04A2-RESUME.md;
- Tools/p04a2-proof-journey.mjs.

This is a conservative reservation, not a claim that all listed files will change. The final
changed-path-only refresh replaces it with the exact accepted P04A.3 paths and symbols.

## 7. Minimal proof pyramid

The pyramid limits reruns to the changed authority boundary.

### LEVEL 1 — TypeScript/static

- phase/task/blocker invariants and deterministic transitions;
- due-at-call and next-boundary scenery settlement, once-only event, exact grandfather;
- Stage/Set/current-holder ownership and historical Wrap precedence;
- exact production/project/company/facility/building/Set/person/task/intent IDs;
- queue admission/waits and all-active deterministic order;
- save/load/replay/determinism;
- closed Production read model and bridge projections/intents;
- no generic progress, fabricated worksite, duplicate remedy, or first-project shortcut.

Run focused tests per changed rule and the full canonical TypeScript/bridge suite only at wave
exits and final seal.

### LEVEL 2 — Generated contract

- CF-08 schema/generator F01–F12 and full current-schema golden;
- CF-09 actual Unity consumer at immutable committed SHAs;
- generated DTO serializer/deserializer round trips;
- schema/protocol/projection and manifest consistency;
- wrong-root/repository/path/commit, dirty/stale/drift/symlink negative corpus.

### LEVEL 3 — Unity EditMode

- zero/one/N Stage registry and full replace/clear;
- state/identity binding and current ownership precedence;
- exact-ID project/person/Stage/Set isolation;
- responsive retained workspace and one scroll owner;
- selection versus Locate, exact camera-origin Back/context/focus;
- explicit proof that Unity performs no lifecycle, blocker, remedy, staffing, progress, or outcome
  calculation.

### LEVEL 4 — Visual Oracle

Exactly six canonical scenarios:

1. Idle Stage.
2. Rehearsal.
3. Scenery Load-In.
4. Blocked / Waiting.
5. Shooting, including the required two-Stage isolation variant.
6. Wrap.

The two-Stage Shooting variant is VO-5B inside scenario 5. It is not a seventh scenario.

### LEVEL 5 — Owner playtest

One coherent Production journey only: Greenlight into visible autonomous Production, exact
Locate/Back and blocker remedy, two-picture isolation checkpoint, Wrap/Post handoff, and one
Save/Load. The Owner journey occurs only in W8.

### 7.1 Local invalidation law

- A TypeScript truth-rule change reruns its focused Level 1 proof, dependent bridge/contract proof,
  and only downstream Unity/Oracle states whose bytes or semantics changed.
- A visual-only Unity change reruns its focused EditMode proof and affected Oracle scene.
- A proof-tool change invalidates and recaptures only evidence produced by that tool.
- A build, executable, process, schema, camera, viewport, scene, or fixture identity change
  invalidates artifacts bound to that identity.
- It does not justify replaying the full campaign after every change.

## 8. Visual Oracle V1 — exactly six scenarios

### 8.1 Shared exact-ID ledger

| Entity | Exact fixture ID |
|---|---|
| Production A | prod-0000 |
| Production B | prod-0001 |
| Load-in Production | prod-0016 |
| Stage A building / facility / Set | stage-a / facility-soundstage-07 / set-0 |
| Stage B building / facility / Set | stage-b / facility-soundstage-12 / set-1 |
| Scenery source type | facility-scenery-shop |
| Load-in placed Stage facility/body | facility-stage-1 / placed-1 |
| Load-in placed Scenery facility/body | facility-scenery-shop-2 / placed-2 |
| Load-in exact reserved resource | facility-scenery-shop-2:0 |
| A Writer credit | t-p05-writer-a |
| A Director / Lead / Antagonist / Support / Craft | t-p05-director-a / t-p05-lead-a / t-p05-antagonist-a / t-p05-support-a / t-p05-craft-a |
| B Director / Lead / Antagonist / Support / Craft | t-p05-director-b / t-p05-lead-b / t-p05-antagonist-b / t-p05-support-b / t-p05-craft-b |

Opaque intent IDs are fixture outputs bound to the exact session/revision/digest. The sidecar
records the emitted ID and asserts its kind plus productionId. Unity never constructs or hardcodes
it.

### 8.2 Camera and screenshot contract

A camera pose is never a prose label. The deterministic fixture stores and compares:

~~~text
poseId
position x/y/z
pivot x/y/z
yawDegrees
pitchDegrees
distance
projection
fieldOfView or orthographicSize
viewport width/height and scale
~~~

CAM-MGMT-AB-V1 is one frozen ordinary management pose and viewport shared byte-for-byte by VO-1,
VO-2, VO-4, VO-5, and VO-6. It must show both Stage sites without automatic selection framing.
CAM-MGMT-LOADIN-V1 is a frozen management pose that includes the exact source/destination context
for VO-3. CAM-MEDIUM-LOADIN-V1 is its frozen medium source-to-destination evidence pose.
CAM-MEDIUM-A-V1 and CAM-MEDIUM-B-V1 are frozen Stage-centered poses. CAM-CLOSE-A-V1 is used only
where a close view answers a stated question.

W6 fixture freeze must pin the full numeric tuples from the accepted camera/proof seam before any
capture; this charter does not invent unverified scene coordinates. A changed tuple invalidates
every image bound to that pose. Selection cannot mutate it. Locate must be recorded as a distinct
action/pose transition and exact Back must restore the origin tuple.

Every requested screenshot is separate:

- management — primary acceptance evidence;
- medium — confirms Stage-local activity/identity;
- close — only when useful, never sole proof;
- workspace — exact retained row/detail/blocker/identity agreement.

### 8.3 Six-scenario matrix

| Scenario | Production / Stage / Set | Phase / week / blocker | Camera and screenshots | Core machine assertion |
|---|---|---|---|---|
| VO-1 Idle Stage | no holder / stage-a / optional standing set-0 | Idle / week 20 / none | CAM-MGMT-AB-V1 management + CAM-MEDIUM-A-V1 + workspace/Stage inspector; no close | Dark/Idle, selectable, no holder/title/company/operation/activity |
| VO-2 Rehearsal | prod-0000 / stage-a / set-0 | Rehearsal / week 19 / none | shared management + CAM-MEDIUM-A-V1 + workspace; no close | Occupied-low preparation, exact director/cast, no Writer/craft/Shooting/load-in |
| VO-3 Scenery Load-In | prod-0016 / stage-a / set-0 | Shooting / Load-In operational substate / week 20 / scenery-load-in | CAM-MGMT-LOADIN-V1 + CAM-MEDIUM-LOADIN-V1 + workspace; close optional | Exact source/destination/math, remaining 1, no current Clear, no Shooting effects |
| VO-4 Blocked / Waiting | prod-0000 / stage-a / set-0 | Shooting / week 20 / exact Director-dispatch blocker | shared management + CAM-MEDIUM-A-V1 + workspace blocker; no close | Waiting treatment, exact cause/consequence/Call Director, hot effects off |
| VO-5 Shooting with VO-5B isolation variant | A prod-0000/stage-a/set-0 scheduled; B prod-0001/stage-b/set-1 unassigned hold | Shooting / week 20 / A none, B director-dispatch | shared two-Stage management + A/B medium + A useful close + A/B workspace | A unmistakably hot; B exact held tuple remains isolated when A applies/clears |
| VO-6 Wrap | prod-0000 released / stage-a / no current Set holder | Wrap receipt / week 21 / none | shared matched before/after management + A medium + workspace; close only if cue requires | restrained release, resources/people/current op cleared, no P06 control |

VO-5B is a required variant inside VO-5. It is not scenario seven.

### VO-1 — Idle Stage

- Deterministic fixture: valid operational Stage A at week 20, no current reservation/holder.
  set-0 may stand, but a Set does not imply Production occupancy.
- Exact identities: productionId null; stage-a; facility-soundstage-07; optional set-0.
- Phase/week/blocker: Idle / 20 / none.
- Screens: CAM-MGMT-AB-V1 management; CAM-MEDIUM-A-V1 quiet apron/Stage; Stage A
  workspace/inspector. Close is omitted because it adds no acceptance fact.
- Machine assertions: Dark/Idle semantic root; null holder; no title/company/operation/beacon/
  freight/authoritative people; exact Stage is selectable.
- Expected visible state: quiet and available, not broken and not falsely busy.
- Agent review questions: Can an unfamiliar viewer distinguish available from failed/blocked? Is
  any crew or activity invented? Is the state legible before opening the inspector?

### VO-2 — Rehearsal

- Deterministic fixture: prod-0000 owns facility-soundstage-07 and live set-0. Holder-matched
  presence contains t-p05-director-a, t-p05-lead-a, t-p05-antagonist-a, and t-p05-support-a.
  Writer credit t-p05-writer-a does not place a body. Craft remains off Stage.
- Exact identities: prod-0000 / stage-a / facility-soundstage-07 / set-0 and the four Stage people.
- Phase/week/blocker: Rehearsal / 19 / none.
- Screens: shared management; CAM-MEDIUM-A-V1; Production workspace/Stage inspector. No close.
- Machine assertions: REHEARSAL/PREPARING occupied-low; exact title/Set/presence; no load-in,
  Shooting beacon/take, Writer, or craft at Stage.
- Expected visible state: autonomous preparation, distinct from Idle, Waiting, and Shooting.
- Agent review questions: Is meaningful work legible from management distance without overstating
  filming? Are the exact people/company/project consistent between world and workspace?

### VO-3 — Scenery Load-In

- Deterministic fixture: placed Stage facility-stage-1/placed-1 and placed Scenery
  facility-scenery-shop-2/placed-2. Source footprint centre is grid (1,11); destination stage-a
  centre is grid (18,3); Manhattan distance is 25. prod-0016 is held since week 18; current week 20;
  total duration 3, elapsed 2, remaining 1, arrived false. Task shooting:prod-0016 is blocked.
  Director/cast are Stage-bound and t-p05-craft-a is at the exact scenery source.
- Exact identities: prod-0016 / shooting:prod-0016 / stage-a /
  facility-soundstage-07 / set-0 / facility-scenery-shop-2 / placed-2 /
  facility-scenery-shop-2:0.
- Phase/week/blocker: Shooting / Load-In operational substate / 20 / scenery-load-in. Load-In is
  not a persisted phase and is never labeled Rehearsal.
- Screens: CAM-MGMT-LOADIN-V1; CAM-MEDIUM-LOADIN-V1 including source/destination context;
  workspace/inspector. A close cue is optional and cannot be sole evidence.
- Machine assertions: LOAD-IN; exact from/to and 25/3/2/1 math; no current V14 Clear intent; no
  Shooting effects; cosmetic route changes never change truth.
- Expected visible state: an understandable spatial logistics consequence.
- Agent review questions: Can the player see where scenery comes from and where it is going? Does
  any vehicle path falsely imply simulation authority? Does workspace copy match exact timing?

### VO-4 — Blocked / Waiting

- Deterministic fixture: prod-0000 owns Stage A/set-0 in Shooting; shooting task is unassigned;
  Director t-p05-director-a is locked. TypeScript emits the final exact Director-dispatch blocker
  code/copy and one revision/digest-bound remedy.
- Exact identities: prod-0000 / stage-a / facility-soundstage-07 / set-0 /
  t-p05-director-a / exact emitted operation and intent.
- Phase/week/blocker: Shooting / 20 / final TS Director-dispatch-required blocker.
- Screens: shared management; CAM-MEDIUM-A-V1 blocked Stage; workspace/inspector blocker/remedy.
  No close because it adds no blocker fact.
- Machine assertions: WAITING/DECISION REQUIRED; exact effect/cause/consequence/Call Director;
  occupied-low only; beacon/equipment off; no substitute, generic Fix, or second action.
- Expected visible state: held but occupied, with one understandable player action.
- Agent review questions: Is who/where/why/action clear without a memo? Does it look blocked rather
  than actively shooting? Is any other project’s operation visible?

### VO-5 — Shooting, including two-Stage isolation variant

- Deterministic base: at week 20, prod-0000 owns Stage A/set-0 with exact current Shooting task
  status scheduled. A Director and three cast bodies are at A; craft remains at A's exact Scenery
  site. No scheduling operation remains current.
- Required VO-5B variant in the same scenario/capture set: at that same week, prod-0001 owns Stage
  B/set-1 in a non-advancing Shooting hold. Task shooting:prod-0001 is unassigned; locked Director
  is t-p05-director-b; blocker is exact director-dispatch; the one current operation/remedy and
  opaque intent are bound to prod-0001. B company membership is exactly t-p05-director-b,
  t-p05-lead-b, t-p05-antagonist-b, t-p05-support-b, and t-p05-craft-b. Exact holder-matched
  presence puts the B Director and three B cast IDs at facility-soundstage-12 and t-p05-craft-b at
  facility-scenery-shop. No B person, Set, operation, blocker, intent, or effect is shared with A.
- Exact identities: A prod-0000/stage-a/facility-soundstage-07/set-0 plus A people; B
  prod-0001/stage-b/facility-soundstage-12/set-1 plus B people.
- Phase/week/blocker: A Shooting scheduled / 20 / none; B Shooting unassigned hold / 20 /
  director-dispatch.
- Screens: common CAM-MGMT-AB-V1 two-Stage view; CAM-MEDIUM-A-V1 and CAM-MEDIUM-B-V1;
  CAM-CLOSE-A-V1 because a Shooting still must remain coherent closer; A and B
  workspace/inspectors.
- Machine assertions: A hot Shooting semantic roots; exact company; decorative bodies have no
  authority IDs and may be zero; no repeat action/percent/hidden quality/craft-at-Stage. Applying,
  replacing, or clearing A leaves B’s exact unassigned task, director-dispatch blocker/remedy/
  intent, identity, company, presence/worksites, Set, and Stage tuple byte-identical except lawful
  shared revision metadata.
- Expected visible state: unmistakable filmmaking at management distance, with B obviously a
  distinct current project at its exact location.
- Agent review questions: Can the viewer identify both pictures, locations, states, and companies?
  Is there any title, Set, person, activity, logistics, or blocker leakage? Does Shooting remain
  obvious without depending on close animation?

### VO-6 — Wrap

- Deterministic fixture: one transition moves prod-0000 from current Shooting to Wrap at week 21.
  Stage A current holder, set/resource/task/current operation, and authoritative people are
  released. A compatible current-week Wrap receipt remains. Post is next but P05 emits no Post
  action.
- Exact identities: prod-0000 historical receipt; stage-a current holder null; set-0 no longer
  current.
- Phase/week/blocker: Wrap / 21 / none.
- Screens: matched CAM-MGMT-AB-V1 immediately before/after; CAM-MEDIUM-A-V1; workspace/inspector.
  Close only if a bounded release cue needs proof.
- Machine assertions: restrained Wrap/release event; no former company/beacon/current resource/
  operation/people; exact receipt; no Post gameplay. A machine-only companion proves any new
  current holder overrides history; it is not another Oracle scene.
- Expected visible state: bounded closure and released capacity, not continued Shooting or a dead
  Stage.
- Agent review questions: Is Wrap clear and restrained? Are resources and people visibly cleared?
  Does any P06 scope appear? Would a new current holder correctly replace the history cue?

### 8.4 Per-scene sidecar

Every scene sidecar includes:

~~~text
manifestVersion
runId
scenarioId and variantId when VO-5B
final TypeScript and Unity commits/trees
build, executable, process, assembly and generated-contract hashes
Unity editor/player version and operating-system/runtime identity
scene path, scene GUID, scene dependency hash
every authoritative prefab/addressable GUID and dependency hash used by the fixture
deterministic fixture ID, fixture schema/version, canonical fixture bytes and SHA-256
fixture-builder source path/version/SHA-256
proof-runner type, source path/version/SHA-256 and compiled assembly hash
orchestration tool path/version/SHA-256 and exact argv
CF-09 attestation identity/hash
schema, protocol, projection and save versions
authority sessionId, revision, digest and gameWeek
exact production, project, company, Stage, facility, building, Set, person,
task, operation and intent IDs
phase, closed state, blocker, remedy and expected copy
complete camera tuple and viewport
requested/omitted screenshots with reason
semantic roots and machine assertion results
artifact relative paths, SHA-256, bytes, media type, width and height
agent reviewer identity, image-inspected flag, questions and dispositions
~~~

No visual claim is valid until the agent has opened and inspected the actual image bytes.

## 9. Smallest reusable evidence primitive

This is a bounded manifest/atomic-write seam, not a general proof-platform rewrite.

### Artifact record

~~~text
relativePath
sha256
bytes
mediaType
width and height for images
~~~

### Atomic publication

1. Resolve a test-owned evidence root and reject absolute, dot-dot, escaping, or symlinked paths.
2. Write each artifact to a unique same-directory temporary regular file.
3. Flush and close; fsync only where the accepted Evidence assembly already supports it.
4. Atomically rename without following symlinks.
5. Reread the final file and verify containment, regular-file mode, bytes, SHA-256, and image
   dimensions.
6. Publish the closed sidecar last by the same process.
7. Never overwrite an immutable accepted run. An incomplete run has no final sidecar.

generatedUtc is omitted when deterministic output is required. If wall-clock provenance is needed,
it belongs in an external artifact envelope and is not part of scenario identity.

The primitive reuses existing Evidence assembly/conventions. It does not introduce a general
database, queue, capture service, dashboard, or proof registry.

## 10. Delegation plan

| Lane | Scope | Tier | Hard boundary |
|---|---|---|---|
| TS scenery | settlement/provenance/timing/selectors and focused tests | Sonnet | No phase/allocator/save/schema redesign |
| TS Production projection | one closed all-active composition and tests | Sonnet | adapter.ts final integration belongs to Opus |
| TS snapshot context | response-local context, exact once-only tests | Opus lead | bridge/session.ts ONE OWNER ONLY |
| Bridge schema/generator | schema cut, sound generator, manifest, actual consumer lock | Opus lead | No handwritten DTO; all collision paths one owner |
| Unity Stage registry | exact keyed N-Stage registry/controllers/tests | Sonnet | BridgePresentation/scene integration excluded |
| Unity exact-ID body registry | one lot-wide body index and Stage-local consumers | Sonnet | No duplicate authoritative body or per-frame global scan |
| Unity world presentation | bounded state/activity/logistics rendering | Sonnet | No lifecycle/blocker/progress calculation |
| Retained workspace | new Production content/UXML/USS/tests | Sonnet | Host/router/input/Back/memo integration excluded |
| Visual Oracle | bounded atomic primitive, fixtures, runner | Sonnet | Cannot repair product law or approve visuals |
| Test/proof execution | exact commands, clean checks, hash/dimension/test-result collation | Haiku | No collision edits, architecture, merge, or visual judgment |

Haiku may inventory fixtures, update expected mechanical snapshots under an owner’s instruction,
run deterministic commands, verify hashes/manifests/status, and collate XML/log/image metadata.

Sonnet receives one frozen input/output contract and owns bounded modules plus focused tests. It
does not edit lead-only collision files or integrate another lane.

The Opus lead retains:

- architecture and interface freeze;
- collision ownership;
- TypeScript/Unity authority boundary;
- bridge/session/schema/generator and actual-consumer cut;
- adapter, BridgePresentation, BridgeClient, WorkspaceHost and authoring integration;
- scene/prefab decision;
- integration and campaign branches;
- every visual judgment;
- hostile-review disposition;
- attestation, seal, and Owner handoff.

Workers never merge or move campaign branches.

## 11. Hostile-review questions

1. Does any Unity code infer, advance, or repair Production phase/task/blocker instead of rendering
   closed TypeScript truth?
2. Does any path still assume stage-a, Stage A, Stage 7, first controller, nearest Transform, title,
   or array position?
3. Can concurrent or same-title projects leak titles, Sets, people, operations, effects, logistics,
   blockers, remedies, or workspace selection across exact IDs?
4. Can stale historical Wrap paint over a new current holder or same-tick Stage reuse?
5. Are due-at-call, next-boundary, arrived, malformed, missing-provenance, and explicit-grandfather
   scenery cases each exact and settled once?
6. Is a worksite ever fabricated from phase, history, first facility, or fallback when no current
   owned site exists?
7. Does any P05 surface consume progress01 or show a generic percent instead of exact
   phase/week/task/blocker facts?
8. Can a wrong actor or company body be chosen by title, name, role, first body, or Transform
   proximity?
9. If one person occurs in two project rows, is duplicate physical placement withheld/fail-closed
   rather than cloned?
10. Are productionId, projectId, companyId, Stage facility ID, world building ID, and Set ID exact
    and mutually validated?
11. Can a blocked picture show hot Shooting effects, or an active picture show another project’s
    blocker/remedy?
12. At normal management distance, can a stranger see that a movie is being made, where, its
    phase, people, blocker, and required action?
13. Can the retained workspace contradict the world, survive a stale revision, parse display copy,
    or mint an action locally?
14. Are screenshots/sidecars stale, partial, wrong-camera, wrong-viewport, or bound to the wrong
    schema/build/commit?
15. Is the claimed binary/process actually the attested one, with clean committed TypeScript and
    Unity trees?
16. Does any P05 route expose Post/Release gameplay, Watch Shoot, cinematic timeline/capture, film
    outcome, or other P06 scope?
17. Do Locate, Back, and Esc preserve the accepted camera-origin/context stack without moving the
    camera on selection or refresh?
18. Can decorative/high-budget activity masquerade as exact staffing, identity, authority,
    progress, blocker resolution, or outcome?
19. Does the workspace list every active Production and preserve exact isolation when rows reorder,
    titles match, one project wraps, or a stale selection disappears?
20. Did any proof pass only because it compared the TypeScript generated file with itself instead
    of the actual sealed Unity consumer?

An upheld finding returns to its single owning wave. A fresh reviewer does not implement fixes,
shop for another reviewer, or expand static-audit advice into an unrelated refactor.

## 12. Provisional completion checklist

- [ ] Every required entry placeholder is filled.
- [ ] Owner-accepted P04A.3 exact SHAs and changed paths are recorded.
- [ ] CF-08/CF-09 exact commits and immutable attestation are recorded.
- [ ] P05A-RECON-r2-FINAL exists.
- [ ] Starting branches and all collision owners are exact.
- [ ] Wave ordering remains W0 truth-build efficiency, W1 TS truth, W2 wire, W3 registry, W4 world,
  W5 workspace, W6 Oracle, W7 regression/review, W8 seal/Owner.
- [ ] Proof pyramid has five levels and exactly six Oracle scenarios.
- [ ] VO-5B is a Shooting variant, not a seventh scenario.
- [ ] Final DTO shape and actual consumer path/hash are recorded.
- [ ] Evidence primitive remains bounded.
- [ ] No P06 scope has entered.
- [ ] Both implementation trees are clean and pushed.
- [ ] READY FOR IMPLEMENTATION is stamped only after all prerequisites verify.

Until every box is satisfied, the controlling status remains:

> **NOT AUTHORIZED FOR IMPLEMENTATION**

## 13. POST-P04A.3 / POST-CONTRACT-GATE CHANGED-PATH REFRESH REQUIRED

The eventual refresh must:

- fill FINAL_P04A3_TS_SHA;
- fill FINAL_P04A3_UNITY_SHA;
- fill FINAL_CONTRACT_GATE_TS_SHA;
- fill FINAL_CONTRACT_GATE_UNITY_SHA;
- fill FINAL_SCHEMA_ID;
- fill FINAL_PROTOCOL_VERSION;
- fill FINAL_PROJECTION_VERSION;
- fill FINAL_SAVE_VERSION;
- diff only accepted P04A.3 changes and static contract-gate changes;
- update exact files and symbols;
- resolve superseded assumptions;
- update the collision and protected-path maps;
- update real test counts and exact commands;
- update the generated DTO shape and actual Unity consumer;
- update evidence tooling, camera fixtures, manifest, and attestation seams;
- update exact P05 starting branches;
- verify Owner P04 acceptance, gate seal, immutable pushed commits, and clean worktrees;
- stamp READY FOR IMPLEMENTATION only after every prerequisite is verified.

Do not restart comparative research or broad historical archaeology.
