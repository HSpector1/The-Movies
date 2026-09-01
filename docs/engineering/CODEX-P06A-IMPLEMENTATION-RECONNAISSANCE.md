# Project: Studio — P06A Implementation Reconnaissance

**Revision: P06A-RECON-r1-PROVISIONAL**

**State: PRE-P05-ACCEPTED REFRESH**
**Implementation authority: none**

This document maps the accepted P04 implementation and the smallest discoverable P05 forward
delta so Package 06 can be prepared without assuming P05's final architecture. It is not a P06
implementation plan, it authorizes no production change, and every seam that P05 may change is
explicitly classified **P05-DEPENDENT — REFRESH REQUIRED**.

The existing Package 06 design and Builder Annex at
`codex/post-release-research-06` @ `8ccd8acc253901aadaa2175656c1e0f7d1a2df23` remain product-law
authority. This recon does not rewrite that research.

---

## 1. Exact inspection frame

### 1.1 Accepted authority

| Repository / concern | Exact accepted reference | Inspection rule |
|---|---|---|
| TypeScript product | `71521efed5dd113a3911c85410d0729eab13918f`; documentation-inclusive closeout/base `4ddb58a38235067e3741a43905e3fc25f414ea0c` | Current accepted P04 code |
| Unity client | repository `HSpector1/project-studio-unity-visual-spike`, accepted SHA `5076af43fcd6a279f26e15a46a8389689b69db74` | Current accepted P04 architecture; clean read-only worktree observed |
| P04 lessons / ledger | `docs/engineering/P04-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md` and `docs/campaigns/LIVING-LOT.md` @ `4ddb58a…` | Permanent requirements |
| P06 product law | Package 06 design + Builder Annex @ `8ccd8acc…` | Unchanged |

At this accepted P04 point the code records save version `15`, protocol `4`, projection `11`, and
schema ID `sha256:01f15efc8fc33fd810b051242857385ca23b5e1c775b357db1bfe5a70e907e1e`.
These are accepted P04 facts, **not final P05 values**.

### 1.2 P05 inputs and WIP disposition

The named Package 05 design, annex, provisional recon, readiness gate, launch package and final
Visual Direction Package were inspected. Their product/design rulings inform the dependency map;
their P05 implementation claims remain provisional until Owner acceptance.

Discoverable TypeScript contract-gate WIP:

- `wip/p05a-static-contract-gate-01-ts` @
  `7811377cea1c1b9ddca2c17c626879504b23ed4e` (local and remote tip observed equal on
  2026-08-30); this is an unsealed attestation commit over inspected source tip `56e170a…`, which
  descends from `52a0a03…` and adds deterministic discriminated-union case ordering, regenerated
  contract/fixture bytes and generator tests;
- bounded helper/hardening tips `3eb2498…`, `b49cc70…`, `3d3646d…`, `f531b9f…`.

Discoverable Unity contract-gate WIP:

- `wip/p05a-static-contract-gate-01-client` @
  `29aea89a706a7f0961f5a460afc5bdb4d38d8395` (local and remote tip observed equal on
  2026-08-30); this descends from inspected tip `249f291…` and synchronizes the generated DTO and
  fixture union ordering;
- helper tip `a1f5aa72afb048b42e5cfca97a4c76a94bf9dd64`.

These changed generator/contract-consumer code and tests; the latest bounded deltas did not change
core gameplay, session projection or source-schema semantics. No discoverable P05 product
implementation supplies the planned N-Stage registry, person/body registry, Production workspace,
Post seam or reusable evidence writer.

> **Every P05 WIP fact in this document is UNSEALED FORWARD EVIDENCE.** It is a collision warning,
> never accepted authority and never a final baseline.

### 1.3 Classification vocabulary

| Classification | Meaning here |
|---|---|
| **REUSE** | Accepted behavior/owner remains the intended foundation. |
| **EXTEND** | Preserve its existing law and add one bounded P06 surface or arm. |
| **NEW** | No accepted owner exists; add one only after authorization and final P05 freeze. |
| **REPLACE** | A known accepted presentation/default is incompatible with Package 06 and must be surgically superseded. |
| **DO NOT TOUCH** | Outside P06 or already the correct downstream owner. |
| **P05-DEPENDENT — REFRESH REQUIRED** | Exact final owner/path/symbol cannot be frozen until P05 Owner acceptance and changed-path inspection. |

---

## 2. Accepted TypeScript lifecycle: the seam P06 must change

The accepted core has one `Production` identity and one managed `ProductionWorkflow` through the
eight-week lifecycle. `productionPhases.ts` maps remaining ticks `3` and `2` to
`postProduction`, tick `1` to `releaseReady`, and tick `0` to no phase. `postProduction` requires
the `post` capability; `releaseReady` requires none. The accepted founding Post facility instance
is `facility-post-building`; that ID is a historical P04 fact, not permission to assume P05's final
facility/body registry.

`advanceManagedProductions()` in `operations.ts` currently decrements every eligible
`releaseReady` production from `1` to `0`, removes its workflow, and hands it to `tick.ts`.
`tick.ts` then:

1. collects all productions with `remainingTicks === 0`;
2. sorts them by plain-string ascending production ID;
3. resolves reception in that order from one start-of-tick standing basis;
4. consumes the canonical critic RNG order;
5. appends `FilmResult`, updates standing/broadcast/development, opens/pays theatrical runs under
   current economy law, records events and serializes the state.

Therefore accepted P04 has **Release Ready but no Release commitment**. A Unity confirmation alone
would be false: the next week would still auto-release an uncommitted picture. The P06 authority
change must occur before the zero-tick collector, while preserving the collector's canonical
ID-sorted batch and all downstream math.

There is also a current wrap/wait truth trap. Wrap releases the Stage, Set and scenery before the
Post allocation attempt, but a failed allocation can retain the prior shooting-derived phase while
the workflow waits for `post`. P05 must seal the authoritative wrapped-wait state; P06 must not
paper over that seam with UI copy.

---

## 3. TypeScript seam map

Every requested path was inspected at the accepted P04 base.

| Path / exact seam | Accepted behavior | Classification | P06 boundary |
|---|---|---|---|
| `src/core/types.ts` — `Production` | Stable active-picture identity, concept/package/company/budget/start/countdown/frozen forecast/participants; no release-commitment authority. | **EXTEND** | Add one persisted exact-ID release-authority root after the final P05 type/save freeze; a Production leaf remains only a W0 design fallback. Do not add result or Post-edit attributes. |
| `src/core/types.ts` — `FilmResult`, `Studio.releasedFilms`, `TheatricalRun` | Durable post-release identity, result and run truth. | **DO NOT TOUCH** | P06 only hands committed pictures into this existing resolver. It must not interpret these values. |
| `src/core/types.ts` — `ProductionPhase`, `ProductionBlocker`, `ShootingTask`, `WorkflowBindings`, `StudioOperations` | Closed accepted lifecycle, blocker, reservation and binding roots. | **REUSE** | Do not add fake Post subphases. Release commitment is decision authority, not editorial/sound/VFX phase law. |
| `src/core/types.ts` — `Action` | Exact core commands; no release commitment action. | **EXTEND** | Add one exact-production Release action or focused release authority module; action shape never names a title as identity. |
| `src/core/types.ts` — `StudioEvent` / `StudioEventLog` | Durable sequence-based studio history includes Wrap/premiere and other governed events. | **EXTEND** | A release-commit event is a candidate deduplication/presentation witness; it cannot replace persisted commitment state. Final event shape is P05-dependent. |
| `src/core/productionPhases.ts` — `PHASE_BY_REMAINING_TICKS`, `requirementsForPhase`, `nextProductionPhase` | `postProduction` at 3/2 with exact `post`; `releaseReady` at 1 with no facility; current comment says ready has no successor because it releases. | **EXTEND** | Preserve phase map/capabilities; document/gate the release boundary without inventing a new workflow phase. |
| `src/core/operations.ts` — `releaseCompletedPhase`, `enterPhase` | Clears completed Stage/scenery reservations and shooting task before attempting Post; `WorkflowBindings.setId` and locked novelty/uplift deliberately survive as release-math provenance that holds no resource. | **REUSE** | Final P05 must seal the exact handoff and distinguish claims from provenance. P06 does not rebuild it. |
| `src/core/operations.ts` — `advanceManagedProductions`, managed arm | Fixed-point deterministic sweep; ready `1→0` removes its workflow today. | **EXTEND** | Read pre-advance release authority. Uncommitted ready stays at `1` and preserves its workflow; committed ready alone reaches `0` and returns its exact ID as an admission witness. Malformed zero/uncommitted state fails closed. |
| `src/core/operations.ts` — `advanceManagedProductions`, `operations.mode !== 'managed'` legacy arm | Every started Production is currently decremented blindly; legacy states have no workflow row to preserve. | **EXTEND** | Apply the same pre-advance committed-only gate. Uncommitted legacy ready stays at `1` without inventing a workflow; committed legacy ready alone reaches `0` and returns an exact admission witness. W0 may retire this arm only with a complete explicit migration ruling. |
| `src/core/operations.ts` — `productionsInSweepOrder` | Longest-waiting-first allocation order with ordinal tie-break. | **DO NOT TOUCH** | This is capacity allocation order, not release-batch order. Release commitment must not conflate them. |
| `src/core/tick.ts` — `tick`, `ReleaseRecord`, `releasing`/`stillActive` | Zero-tick collection then plain-string ID sort; canonical shared-basis release/RNG/economy/event order; release bindings are read from the pre-advance operations root. | **EXTEND** | Before reception/RNG, require exact equality between zero-tick IDs and the pre-advance commitment-derived admission witness. Preserve the batch/order/math, then prune exactly released commitment rows in the final atomic state. Do not sort by commitment/click time. |
| `src/core/actions.ts` — `applyActions` and exact action applicators | Sole core mutation boundary for `Action`; collision-safe production IDs and strict command rejection. | **EXTEND** | One exact-ID commit application revalidates current state, persists once, advances no time and never releases directly. |
| `src/core/save.ts` — frozen V1–V15 envelopes, `validateSaveV15`, `makeSaveV15`, migrations/import/export | Live save is V15; every prior envelope remains frozen; current release-ready saves contain no commitment. | **EXTEND** | A mandatory next-version migration is provisionally required. Ready pictures migrated from pre-P06 envelopes become uncommitted; current-version P06 imports preserve valid commitments. Never add an optional leaf merely to dodge a version bump. |
| `src/core/index.ts` — live save/type/function re-exports | Public surface is hard-wired to V15 names and `migrateToV15`. | **EXTEND** | Cut over the live save exports in the same W1 commit as the required GameState root; retain frozen prior-version exports. |
| `src/core/presence.ts` — `attendanceForPhase`, `studioPresence` | Active Post assigns Director + craft to exact Post reservation; Release Ready has no reservation and projects nobody at Post. | **REUSE** | Preserve exact attendance. Busy-for-assignment is not physical presence; cast never appear editing. Final P05 presence changes require refresh. |
| `src/core/firstFilmJourney.ts` — phase/beat/status copy and `firstFilmJourney` | Pure save-neutral projection; today Release Ready copy points toward release/advance and maps semantic Post to fixed site `post`. | **REPLACE** | Replace auto-release/“final cut” guidance with Review/Hold/Commit/committed guidance. Keep it a guided journey, not multi-picture portfolio authority. |
| `src/core/productionIdentity.ts` — `persistedProductionIds`, `persistedConceptIds` | Enforces stable IDs across active productions, workflows, events, results, runs and related roots. | **REUSE** | Extend invariant coverage to any commitment/event leaf. Never use title for correlation. |
| `src/core/studioQueueView.ts` — `studioQueueView`, `StudioQueueNeedView`, occupants/waiters/remedies | Structured exact capability, holder, estimate and remedy projection; labels Post and Release Ready. | **REUSE** | Feed waiting-for-Post facts and holder/capacity explanation. Do not turn an automatic wait into an acknowledgment decision. |
| `src/core/studioCalendar.ts` — `studioCalendar`, production/facility/decision views | Stable capacity/commitment calendar projection and `nextStudioDecision` attachment; current release timing is automatic from remaining ticks. | **EXTEND** | Add ready/committed semantics and an exact decision stop only if this remains the final P05 calendar seam. An uncommitted ready picture has no truthful release week; a committed ready picture belongs to the next authoritative week. |
| `src/core/occupancy.ts` — `resourceClaims`, slot keys, double-booking invariants | Exact facility/set/mount ownership and slot derivation. | **REUSE** | Project Post capacity/holder truth from it; do not create a second Unity occupancy model. |
| `src/core/reception.ts` — `resolveReception`, `buildFilmResult` | Actual critic/audience/box-office result law. | **DO NOT TOUCH** | P06 cannot preview, reinterpret or retune it. It runs only on the next authoritative week for committed members. |
| `src/core/publicity.ts` — `publicityOffer(s)`, awareness lift | Studio-wide paid action with price/cooldown/legality. | **DO NOT TOUCH** | Optional read-only context/reversible route only; never film-bound or duplicated in Post. |
| `src/core/employment.ts` — `activeProductionCompanyTalentIds`, `activeWritingAssignmentIds`, `creditedWriterIds`, `busyTalentIds`, payroll | Director, cast and craft in every active Production remain busy for assignment through Release, including an indefinitely held ready picture. A credited writer is explicitly excluded unless doing a current writing assignment. Payroll/economy advance with the one clock. This differs from `presence.ts`, which assigns nobody to Post at Release Ready. | **EXTEND** | Reuse exact availability law and add an exact hold-consequence read model. Never report a credited-only writer as busy or any busy person as physically at Post. Final P05 must confirm whether it changed this seam. |
| `src/core/scriptReadModel.ts` — `nextStudioDecision`, `nextProductionOperationsDecision` | One deterministic stop selector: script review → casting review → production operation, with ascending exact IDs. | **EXTEND** | Integrate uncommitted Release Ready as a governed decision stop without reimplementing the ladder in UI. Exact ordering is frozen during W0. |
| `ui/src/engine/adapter.ts` — `productionBoard`, `studioDecision`, `simStopDetailFor`, `advanceWeek`, `advanceToNextEvent` | Rich production card; one exported stop ladder; current release has highest post-tick result priority; an existing decision returns zero weeks before simulation. | **EXTEND** | Attach the pure release decision/current state. Explicit manual Advance Week may knowingly advance while held; Next Event and projected automatic-roll eligibility stop at the unresolved decision. No client rebuilds this ladder. |
| `ui/src/engine/adapter.ts` — `importSaveJson`, `exportSaveJson` and legacy affordances | Live import/export is hard-wired to V15 and `migrateToV15`; some explicit legacy conversion chains terminate at older frozen envelopes. | **EXTEND** | Update every live-returning import/export path in the coordinated W1 save cutover; frozen compatibility entry points either reach the new live migrator or are explicitly proven not to return `GameState` directly. |

### 3.1 P05-dependent TypeScript seams

P05 is expected to change Production projection, Wrap/current-worksite facts, registry-facing IDs,
snapshot composition and possibly test structure. Until the final changed paths arrive, exact P06
line numbers, new helper-module placement and final decision ordering are
**P05-DEPENDENT — REFRESH REQUIRED**. The accepted functions above are current anchors, not promises
that P05 leaves them untouched.

---

## 4. Bridge and generated-contract map

| Path / symbol | Accepted behavior | Classification | P06 boundary |
|---|---|---|---|
| `bridge/schema/bridge-schema.ts` — `PROTOCOL_VERSION`, `PROJECTION_VERSION` | Accepted P04 values `4` / `11`. | **P05-DEPENDENT — REFRESH REQUIRED** | Final P05 versions and schema ID must replace these historical observations before P06 starts. |
| `bridge/schema/bridge-schema.ts` — `StudioProductionOperationsSnapshot` | Production ID/title/phase/weeks/progress/location label/company/task/blocker/attention/current command. It lacks exact Post reservation/capacity, Release decision, safe outlook and hold consequences. | **EXTEND** | Prefer focused Post/Release Review records over prose parsing; close exact required/nullable fields. |
| `StudioProductionsProjectionSchema` / `StudioPeopleProjectionSchema` | Active productions + operation rows; people + optional presence. | **EXTEND** | Publish exact waiting/active/ready/committed Post rows and exact people/facility joins. |
| `StudioReleaseResultsProjectionSchema` | Released-film summaries only. | **DO NOT TOUCH** | Result summaries remain downstream/P07; pre-release review does not live here. |
| `StudioProjectionBundleSchema` | One strict bundle over lot, productions, people, construction, notices, release results, development and casting. | **EXTEND** | Add the smallest release-review projection through the final P05 snapshot-build context; no second snapshot store. |
| `AVAILABLE_INTENT_KINDS`, `StudioBridgeIntentOption` | Opaque available intents; option currently carries `productionId: nullable(text())`, so null and empty string are schema-valid; no Release kind exists. | **EXTEND** | Add one closed Release arm whose `productionId` is required and non-empty. Client selection binds `(kind, productionId)` or exact projected intent ID, never kind alone; reject null, empty and wrong-ID Release intents. |
| `REJECTION_CODES` / rejected response projection | Current closed codes already distinguish stale revision, command-ID reuse, intent unavailable and engine refusal. The opaque command payload carries no production ID; a rejection returns current revision/digest, not a full snapshot. | **REUSE** | Do not widen the payload merely to correlate an obsolete intent. Core exact-ID action/selector may name `ALREADY_COMMITTED`; normal bridge redelivery remains journal replay, `STALE_REVISION` or `INTENT_NOT_AVAILABLE`, followed by a current poll/snapshot rebind. |
| `bridge/schema/project-studio-bridge.schema.json` | Generated canonical JSON schema. | **EXTEND** | Generator-only output: regenerate from the source schema under the sealed generator; never hand edit. |
| `bridge/schema/runtime.ts` — strict response parsing | Runtime validation rejects contract drift before the client consumes a snapshot. | **EXTEND** | Add the final release projection/intent through the generated source schema and preserve strict parsing; never bypass it with an ad hoc payload. |
| `generated/unity/StudioBridgeDtos.Generated.cs` | C# contract artifact generated in the TypeScript repository. | **EXTEND** | Generator-only output: never hand edit; regenerate and verify the exact Unity consumer. |
| Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | Actual accepted generated consumer. | **EXTEND** | Generator-only output: update only through the generated-contract wave after the final P05 gate. |
| `bridge/session.ts` — `snapshotFor`, `resolveAvailableIntents`, `option`, `opaqueIntentId` | One authoritative projection+intent envelope; intent IDs are digest-bound; snapshot revision/digest are current. The manual `advanceWeek` intent currently doubles as Unity Living Time's auto-roll predicate. | **EXTEND** | Publish exact Release intent/current decision and a separate TypeScript-authored automatic-roll/Next-Event eligibility fact while keeping explicit manual Advance Week available. Commit uses `/command`; no quote route is provisionally needed. |
| `bridge/session.ts` — `command`, `priorResponse`, rejection path | Checks session, revision, command-ID reuse, available intent and engine application; accepted commands journal once. | **REUSE** | Stale/duplicate Release uses this boundary; no automatic retry. Accepted commit returns committed state, not a result. |
| `bridge/session.ts` — `importSaveJsonV15`, `fromSaveJson`, `fromRuntimeCheckpoint`, `rolloverRuntime`, `load` | Every live bridge import path currently terminates at `migrateToV15`; rollover exports and re-imports that same live envelope. | **EXTEND** | Update these compile/runtime boundaries in W1 with the live save type, before W2 edits this file for projection/intent. Current P06 commitments survive load/rollover; pre-P06 ready saves migrate uncommitted. |
| `bridge/session.ts` — quote cache and `/quote` families | Needed for Commission/Casting drafts with user-selected payloads. | **DO NOT TOUCH** | Release has no variable draft under current law; do not add a route without a final W0 necessity finding. |
| `bridge/runtime-checkpoint.ts` — `SaveFileV15` types, `migrateToV15`, `importPriorSaveViaCanonicalChain`, `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`, checkpoint/journal hydrate | Current checkpoint state/cache/import types and canonical prior-save chain are hard-wired to V15; closed prior protocol-4 schema identities are explicitly enumerated and prior journal bodies are discarded during schema migration. | **EXTEND** | W1 cuts over only live save/checkpoint types and proves the still-current P05 schema preserves journal/session identity. After W2 mints the P06 schema/protocol, W2 registers P05 as prior in the same-protocol map or approved generalized migration; only that prior path discards old journal bodies/resets as current law requires. |
| `bridge/proof.ts` | Captures current journey beats including Post and release, but not held/committed isolation. | **EXTEND** | Add hold, commit, stale/duplicate, committed-only batch, reverse-click-order and reconnect proof after authorization. |

### 4.1 `/command` versus `/quote` ruling

The current Release choice has no user-authored budget, date, campaign or parameter. TypeScript can
project the complete exact decision and one digest-bound `commitPictureToRelease` intent. Unity can
open an inert confirmation, then submit that opaque `intentId` through the existing `/command`
route with `expectedStateRevision` and `commandId`.

**Provisional recommendation:** use the existing available-intent + `/command` path. A new
`/quote` family would add protocol/generator/consumer/migration surface without representing a
choice. W0 must recheck this against final P05; it may reverse only if P05 introduces an
authoritative variable Release draft, which current Package 06 law does not authorize.

No production-ID field is needed in the submit payload. Exact correlation exists while the intent
is current; after it is obsolete, the existing revision/intent refusals plus the fresh exact-ID
selector are the truthful interface. Do not add reverse lookup from stale opaque IDs.

---

## 5. Accepted Unity architecture map

Accepted Unity provenance: `HSpector1/project-studio-unity-visual-spike` @
`5076af43fcd6a279f26e15a46a8389689b69db74`. No Unity activity was performed; files were inspected
statically.

| Ownership seam | Accepted exact owner | Classification | P06 disposition |
|---|---|---|---|
| Production / Post world body | `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs` — `BuildProductionSupport`, root `09_Production_And_Post`, selectable stable ID `post`, label `Production & Post`; `StudioLotAuthoring.BuildSceneMarkers` adds the `ProductionPost` marker. | **REUSE** | Reuse physical founding body. Its static “Editorial and music…” copy/reel decoration is not state authority and must not claim active work. Final label/body registry remains P05-dependent. |
| Exact selectable/body identity | `StudioLocationBinding.BuildingId`, `SelectableEntity.StableId`, `StudioBridgePresentation.BuildLocationSelectableIndex` | **REUSE** | Preserve blank/duplicate/mismatch refusal and exact stable IDs. |
| Stage/facility registry | Accepted `StudioStageProductionPresentation` is singleton and hard-codes `stage-a`; `StudioBridgePresentation.CacheSceneObjects` accepts one. Planned P05 `StudioStagePresentationRegistry.cs` is absent. | **REPLACE** | Final P05 must replace singleton with N-Stage truth. P06 extends the accepted final registry pattern to Post; never copies singleton/first-match behavior. **P05-DEPENDENT — REFRESH REQUIRED.** |
| Exact Post facility/body registry | None. Current per-apply building-ID dictionary is not an N-facility Post registry. | **NEW** | Freeze the contract in P06 W0 and implement it in W3 only after the final P05 registry freeze; permit an explicit founding-body-only fallback with separately displayed facility ID. |
| Post state presenter | None. | **NEW** | DTO-driven idle/waiting/active/ready/committed presenter; no simulation or result interpretation. |
| Central snapshot presenter | `StudioBridgePresentation.Apply`, `ApplyBuildingStates`, `ApplyStageAndSetStates`, `ApplyPeople` | **EXTEND** | Integration owner only; delegate Post logic to focused presenter/registry. **P05-DEPENDENT — REFRESH REQUIRED.** |
| Person/body mapping | `StudioBridgePresentation.personSlots` / `TryGetAuthoritativePersonStableId`; `StudioPersonPresentationSlot`; `StudioWriterPresencePresentation.ResolveBody` | **P05-DEPENDENT — REFRESH REQUIRED** | Reuse exact-ID/declaration principles; final P05 is expected to create one standalone lot-wide body registry. Do not scene-search or clone people per facility. |
| Stage production roles | `StudioProductionRolePresentation` and existing Stage-specific ambient departments | **DO NOT TOUCH** | Not Post authority. Add a narrow Post attendance policy consuming exact projected presence; no cast. |
| Production Rail | `StudioProductionRailHud`, `StudioProductionRailContracts`; currently Development-oriented and capped, with exact project navigation. | **P05-DEPENDENT — REFRESH REQUIRED** | Extend final P05 rail with waiting/active/ready/committed rows. It remains optional and cannot seed local world context. |
| Retained workspace host | `UI/StudioWorkspaceHost` — one `UIDocument`/`PanelSettings`, scrim/input owner, current Casting route/context/suspend-for-Locate. | **P05-DEPENDENT — REFRESH REQUIRED** | Reuse/extend the one final shared host/router. Never create a second host or modal stack. |
| System menu | `StudioSystemMenuHud`, `StudioSystemMenuContracts` | **REUSE** | Preserve Save/Load/Quit and modal/input ownership; sweep shared `ActionsEnabled` and pending-state consumers. |
| Input contexts | `UI/StudioPresentationInputContext`; `StudioCameraInput` / `StudioCameraInputFrame` | **REUSE** | Extend final workspace layer through existing suspension/restoration. Future HID harness must normalize/record modifiers; no HID was used here. |
| Back | `StudioSelectionManager.HandleCancel`, `StudioCameraDirector.TryEnterInspection`/`ExitInspection`, `TycoonCameraController` origin trail and `NavigationOriginRestored` | **REUSE** | Back restores exact building/picture/tab/scroll/focus; state changes never substitute another picture. |
| Locate | `StudioLocateAction.Locate(stableId, focus)`; `StudioWorkspaceHost.SuspendForLocate` | **EXTEND** | Exact stable ID only. Current host can ignore a `false` return; P06 visible Locate must expose exact cause/remedy and never silently no-op. |
| Bridge client | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` — `Current`, `Store`, `SnapshotApplied`, accepted/rejected events, `ActionsEnabled`, reconnect/poll, `SubmitIntent` | **EXTEND** | Reuse transport. Release gate derives pending/stale from current client state and refreshes so polling cannot latch disabled. |
| Living Time / manual and automatic week control | `Assets/Studio/Runtime/Presentation/StudioLivingTime.cs` — `StudioLivingTimeController.Update`, `StudioLivingTimeContracts.Classify`; `StudioLivingTimeHud.cs` — Pause/1×/2×/4× and `SetWorldTimeOwnerPresent`; `StudioBridgeClient.PlayerIsTimeOption` / `PlayerIsCededOption` | **EXTEND** | Today the HUD exposes no single-week button and presence of `advanceWeek` is auto-roll permission while the wide HUD cedes the memo fallback. Add one HUD-owned `Advance one week` control calling a provisional `AdvanceOneWeek()` single-shot over the current manual intent; it pauses rolling, dispatches at most once and surfaces failure. Consume separate TypeScript auto-roll eligibility. At narrow widths where the HUD is absent, deliberately unceded memo time remains the fallback. No C# stop ladder. |
| Intent lookup | `StudioBridgeClient.FindFirstIntent(kind)` | **REPLACE** | Unsafe with several ready pictures. Release uses exact `(kind, productionId)`/intent ID lookup and refuses absent/duplicate matches. |
| Projection store/normalization | `Infrastructure/StudioSnapshotStateCache.cs` — `StudioProjectionStore`; `StudioBridgeProtocol`; `StudioBridgeWireValidator` | **REUSE** | Consume final generated contract; never cache legality separately. |
| Generated consumer | `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | **EXTEND** | Generator-only; exact-consumer manifest required and no hand edits. |
| Release-result presentation | `StudioBridgeClient.PlayerReleaseReceptionLabel` / `PlayerReleaseReceptionSummary` | **DO NOT TOUCH** | FLOP/MIXED/HIT/SMASH interpretation is beyond P06 and remains a P07-facing downstream surface. |
| Existing evidence | `Runtime/Evidence/StudioRuntimeEvidenceReport`, `StudioRuntimeEvidenceBootstrap`, `Infrastructure/StudioCaptureMarker`, `Editor/Automation/StudioCanonicalCapture`, proof runners and `StudioUiElementRegistry` | **P05-DEPENDENT — REFRESH REQUIRED** | Precedent only. Accepted P04 record lacks the full binary/PID/window/viewport/image-hash atomic manifest. Extend final P05 infrastructure; do not repurpose four old A–D captures. |

### 5.1 Planned-but-absent P05 seams

P05 planning names `StudioStagePresentationRegistry.cs`, `StudioPersonBodyRegistry.cs`,
`UI/StudioProductionWorkspaceController.cs`, Production workspace UXML/USS,
`Evidence/StudioEvidenceArtifactWriter.cs`, and a Production management-distance runner. None is
present in discoverable P05 WIP. Their names are **not** current files and cannot be chartered as
final until the changed-path refresh.

---

## 6. Release authority interface sketch

This section defines interfaces and invariants, not production code. Exact final names and file
locations are subject to the final P05 changed-path refresh.

### 6.1 Storage-shape comparison

| Shape | Sketch | Strengths | Costs / risks | Provisional ruling |
|---|---|---|---|---|
| **Leaf on `Production`** | Required `releaseCommitment: null` or `{ commitmentId, committedAtWeek }` on the exact active picture | Identity-local; easy invariant with `remainingTicks`; batch member already carries it | Widens every Production constructor/fixture; mixes a release-governance decision into the long-lived package record; receipt/event correlation still needs another owner | Viable fallback |
| **Leaf on operations workflow** | Commitment on the exact `ProductionWorkflow` | Close to `advanceManagedProductions`; workflow already reaches Release Ready | Couples an irreversible release decision to facility/workflow machinery; legacy/managed split; workflow removal and future refactors risk losing it; cross-root Production invariant still needed | Do not prefer |
| **Separate exact-ID root** | `releaseAuthority.commitments[]` keyed by `productionId`; absence means uncommitted | Dedicated current authority; exact ID/week/commitment identity in one place; does not overload phase/workflow/package; migration of a pre-P06 envelope to an empty root makes its ready pictures explicitly uncommitted | New GameState root/save envelope and strict orphan/duplicate/phase invariants; the array must have canonical order and cannot make insertion/click order semantic | **Recommend provisionally** |
| **Derived from event or bridge journal only** | Treat accepted command/event as commitment | No Production shape change | Not sufficient state authority; compaction/session rollover/save import can lose meaning; tick cannot safely gate from presentation receipt | **Reject** |
| **New production phase** | `releaseCommitted` phase | Visible in phase union | Violates Package 06 law: committed remains Release Ready with no facility and releases next week; creates invented phase/migration/projection churn | **Reject** |

Provisional shape:

```text
GameState.releaseAuthority
  commitments[]  # canonical production-ID order; absence = uncommitted
    productionId: exact active Production ID
    commitmentId: exact stable commitment identity
    committedAtWeek: authoritative studio week
```

The exact root/type/identifier names are intentionally unfrozen. Identity must be collision-safe and
produced by TypeScript. Provisionally, `commitmentId` is deterministically derived from the exact
never-reused `productionId` plus a frozen authority namespace; minting consumes no simulation RNG,
wall clock, event sequence, insertion position or click order. The root is current release
authority, not permanent film history; the row is removed atomically when that exact Production
leaves the active slate, while the existing event and `FilmResult` roots retain durable history.
Final P05 may reveal that a Production leaf produces a smaller safe delta; W0 may choose that
fallback only with a written invariant/test comparison.

### 6.2 State and invariant contract

| State | Required authority | Legal transition | Time / resource law |
|---|---|---|---|
| `WAITING FOR POST` | Wrapped exact production, Post-capacity blocker, no Stage/Set/scenery/Post reservation | allocator may enter active Post automatically | One studio clock; no manual acknowledgment |
| `ACTIVE POST` | `postProduction`, exact Post reservation, Director/craft presence, ticks 3/2 | authoritative week completes Post | Post occupied; no creative command |
| `RELEASE READY` | `releaseReady`, tick 1, commitment null, no reservation/presence | Hold/no mutation; exact Commit action | Manual Advance may advance other systems while picture remains at 1 |
| `COMMITTED TO RELEASE` | `releaseReady`, tick 1, exact persisted commitment, no reservation/presence | next authoritative week admits it to existing release batch | Commit itself advances no time and creates no result/run/RNG/debit |
| `RELEASED` | exact `FilmResult`, active Production gone | downstream result/history | Not Post; no active row |
| `IN THEATERS` | exact active `TheatricalRun` | existing run law | Not synonymous with Released |

Mandatory invariants:

- at persisted/public state boundaries, a commitment row exists only for an exact active Production
  at `releaseReady` tick 1;
- an uncommitted ready picture cannot reach tick 0;
- a committed ready picture can reach tick 0 only through the normal weekly production sweep;
- commitment cannot be withdrawn in P06A;
- only one commitment exists for an exact production;
- commit changes no cash, RNG, `FilmResult`, run, presence, reservation or week;
- commitment identity is stable for the production and consumes no RNG/wall-clock/order source;
- batch membership is the set of committed pictures reaching zero, never commit insertion order;
- released ID/history uniqueness remains governed by `productionIdentity.ts` and current invariants.

The weekly tick may carry an ephemeral exact-ID admission witness while a committed picture moves
from tick 1 to tick 0. That witness is derived from the pre-advance persisted root and is not a
second authority or a serializable state. The final returned state removes the Production and its
commitment row together, restoring the public invariant atomically.

### 6.3 Pure current-state selector

One pure core TypeScript selector should publish an exact `ReleaseDecisionView` for each retained
or ready picture:

```text
productionId / title / genre
authorityState: ready | committed | released | absent
theatricalRunState: inTheaters | notInTheaters | notApplicable
commitment identity when committed
legalCommit: boolean
blocker/refusal: exact structured reason or null
frozen Greenlight outlook and provenance
already-paid production and marketing commitment
release-time debit: none under current law
hold consequences from current economy/availability facts
unknown-after-commit list
```

`released` means an exact `FilmResult` exists; `inTheaters` is an independent active-run fact, not
a synonym. `absent` means the exact ID is neither active nor present in released history. P06 uses
these downstream facts only to retire a stale row and preserve exact handoff context; it does not
show or interpret result values.

The bridge wraps that core view rather than contaminating it with transport state:

```text
stateRevision / stateDigest
releaseDecision: exact core ReleaseDecisionView
availableReleaseIntent: { opaque intentId, non-empty productionId } | null
automaticWeekRollEligible: boolean          # TypeScript stop-selector result
advanceToNextEventStop: exact reason | null # TypeScript stop-selector result
```

Unity then derives one pure presentation `ReleaseDecisionState` from the projected core view plus
bridge pending/rejection/current-revision inputs. It contains exactly:

- headline;
- detail;
- primary label;
- enabled state;
- pending state;
- stale/refusal state; and
- remedy/focus target when disabled.

No sibling view reconstructs these terms. Transport pending state may temporarily disable the
button, but a fresh poll/request completion must recompute and re-enable it.

### 6.4 Exact intent, stale and duplicate behavior

The available intent carries a required non-empty exact `productionId`; its opaque ID is bound to
the current state digest/revision. Confirmation repeats the title but identity remains the ID.

- stale `expectedStateRevision`: return `STALE_REVISION` with current revision/digest; no retry;
  request/await the current snapshot before enabling again;
- intent no longer available: `INTENT_NOT_AVAILABLE`, then rebind the retained exact picture from
  the current polled selector for cause/remedy;
- same `commandId` + same envelope: return the journaled prior response/idempotent result;
- same `commandId` + different envelope: `COMMAND_ID_REUSE`;
- a direct exact-ID Core action evaluated after current state is committed: refuse
  `ALREADY_COMMITTED` and expose the existing commitment identity through the current selector;
- a normal bridge redelivery after commitment follows the existing opaque contract exactly: same
  command is journal replay; old revision is `STALE_REVISION`; current revision plus an obsolete
  opaque intent ID is `INTENT_NOT_AVAILABLE`. Because the payload has no production ID, that
  rejection does not pretend to correlate the obsolete ID; a current poll/snapshot lets the
  retained exact picture rebind to `COMMITTED`;
- missing/duplicate `(kind, productionId)` client lookup: disable visibly with exact contract error,
  never fall back to `FindFirstIntent`.
- null, empty or wrong `productionId` in the Release intent arm: reject at schema/runtime validation
  or disable with a contract-incompatible remedy; never dispatch.

Event identity and receipt identity remain distinct:

- exactly one core commitment transition/event per committed production proves the studio state
  change and deduplicates world cues; its log sequence truthfully records command order;
- bridge `commandId`/opaque `intentId` proves the submitted request and its response;
- presentation remembers the last consumed authoritative event/receipt ID, never “has rendered
  committed once.” Save/load/reconnect paints current state without replaying the dispatch cue.

### 6.5 Save migration

A save-version bump is **provisionally mandatory** because the persisted live shape changes and
V15 is frozen. After final P05, the next version number is `FINAL_P05_SAVE_VERSION + 1`, not
necessarily `16`.

Migration law:

- every pre-P06 save migrated into the new envelope receives an explicit empty release-authority
  root; a current-version P06 import preserves and validates its existing root;
- therefore every active Production imported from a pre-P06 envelope, including every Release
  Ready picture, is uncommitted;
- no legacy save is interpreted as implicitly committed merely because old behavior would have
  auto-released next week;
- validation rejects commitment on a non-ready/missing/duplicate production;
- make/validate/load/export/reconnect round-trip both uncommitted and committed state;
- migration itself creates no event, receipt, week, RNG movement or dispatch cue.

This is one compile-safe W1 save cutover, not a Core-only change followed by a later repair. It
updates the live save envelope and exports in `src/core/save.ts` / `src/core/index.ts`, adapter
`importSaveJson`/export paths, bridge `importSaveJsonV15`/load/rollover paths, and runtime-checkpoint
live types together. W1 must keep the final P05 schema on the **current** decode path and prove its
journal/session survives; adding that current ID to `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` would
wrongly invoke prior-schema reset/discard behavior. Only after W2 mints the P06 schema/protocol may
W2 register final P05 as prior (or use the approved generalized equivalent). W6 covers both paths
and journal rollover on a private Owner-profile byte-copy.

### 6.6 Weekly admission and click-order independence

Recommended control point:

1. At tick entry, validate the persisted release-authority root against the pre-advance active
   slate; reject orphan/duplicate/non-ready commitment rows and any pre-existing zero/uncommitted
   Production.
2. Pass the pre-advance exact commitment set into `advanceManagedProductions` (or a focused wrapper)
   and return exact `admittedReleaseIds` derived from that set.
3. In the managed arm, uncommitted ready remains at tick 1 with its workflow; committed ready moves
   `1→0`, retires the workflow and enters the witness.
4. In the legacy arm, uncommitted ready remains at tick 1 without inventing a workflow; committed
   ready alone moves `1→0` and enters the same witness.
5. Before reception or any RNG/economy/result work, compare the collected zero-tick ID set with the
   admission witness for exact equality and fail closed on any mismatch.
6. Keep the existing plain-string production-ID sort as the only release-batch order. Continue to
   read Set/locked-uplift provenance from the pre-advance operations root; it is not occupancy.
7. Preserve reception/RNG/standing/broadcast/development/run/payment/economy/event/save order.
8. In the one final returned state, prune exactly the released commitment rows while removing those
   Productions; preserve every non-released row and validate the public invariants again.

Committing D then C in one week produces the same admitted ID set, ID-sorted `FilmResult`/premiere
order, reception RNG consumption and release economy as committing C then D. The causally distinct
pre-tick commitment-event and command-receipt histories are not expected to be byte-identical; they
truthfully record the player's command order and never drive batch order. An uncommitted E is not
collected and remains Release Ready at tick 1.

### 6.7 Advance Week and Advance to Next Event

- **Advance Week:** remains a knowingly available one-clock action. It advances other authoritative
  systems once; an uncommitted ready picture holds at tick 1, continues exact economy/availability
  exposure, holds no Post capacity and has no Post attendance. At wide viewport the exact visible
  owner is a Living Time HUD `Advance one week` control calling a single-shot controller arm over
  the current `advanceWeek` intent; it pauses continuous roll and never turns a speed press into the
  manual action. Where the HUD is lawfully hidden, the deliberately unceded memo intent is the
  narrow fallback. Enabled/disabled state names transport/intent cause and remedy before dispatch.
- **Advance to Next Event:** an already-uncommitted ready picture is the current decision, so the
  command returns zero weeks and opens/routes to exact Review. It cannot spin past, auto-commit or
  reveal a result.
- **Automatic Living Time:** receives a separate TypeScript-authored
  `automaticWeekRollEligible=false` while any unresolved Release Ready decision is the governing
  stop. The explicit manual `advanceWeek` intent and owner above remain available. Unity consumes
  the projected fact and must not infer auto-roll permission from intent presence or rebuild the
  stop ladder.
- **Committed picture:** no unresolved release decision remains for that exact picture. The next
  chosen authoritative week releases it through the canonical batch and crosses into downstream
  result authority.

Exact cross-system decision priority and stop-reason naming are
**P05-DEPENDENT — REFRESH REQUIRED** and must be frozen in W0.

---

## 7. World-owner contract

The intended primary interaction is frozen:

> Click Production / Post → local inspector independently lists exact waiting/active/ready/
> committed pictures → select one exact picture → `Open picture` / `Review Release` → retained
> workspace → explicit title-bearing commitment.

The Production Rail may select/locate/open the same exact record. It may never be required to seed
project context.

### 7.1 State/edge behavior

| Case | Required behavior |
|---|---|
| **Zero pictures** | Building reads `AVAILABLE`/idle; exact capacity if projected; `No picture is waiting, active, ready or committed.` No Release control. Scenery facts remain a separate subsection if the shared building owns them. |
| **One picture** | The sole exact ID may be selected deterministically because no choice is guessed. The local primary action carries that ID; missing ID disables with `Picture identity unavailable — refresh the authoritative snapshot.` |
| **Several pictures** | Stable exact-ID rows, grouped/status-labeled without reordering under pointer. Preserve a valid pinned selection; otherwise require an explicit row choice. An action is not enabled merely because a list is nonempty. |
| **Stale retained picture** | Keep the stale title/ID as context, mark `STATE CHANGED`, disable commitment, show exact fresh state/remedy, and never select the next row automatically. |
| **Picture changes state while workspace is open** | Rebind by exact ID. Active→Ready opens no layer automatically; Ready→Committed replaces the decision with receipt/current state; removal clears the picture selection but keeps building/origin context. |
| **Exact row disappears after next-week release** | Remove only that `productionId`; keep Production / Post selected; show one deduplicated handoff receipt/history route; do not select the next row. |
| **Engaged authoritative Post facility demolition attempted** | TypeScript `facilityDemolitionRefusal` keeps the engaged facility and state byte-neutral. Show the exact holder/cause and remedy; do not paint it destroyed or clear its body. |
| **Idle authoritative Post facility legally demolished** | Remove only that exact placement/facility/body mapping. Any affected wrapped picture is then a TypeScript-owned capacity waiter; the aggregate Production / Post inspector remains available and shows the exact missing-capacity remedy. Never substitute another facility/body. |
| **Authoritative facility exists but Unity body is missing** | Treat this as a presentation-registry/contract error, not demolition. Mutate no Core state; retain exact facility/picture context, disable `Locate` with `Body mapping unavailable — refresh/rebuild the bound presentation`, and keep machine/evidence failure distinct from world law. |
| **Post waiting without a placed body** | Founding Production / Post aggregate inspector can list the exact waiter and required capability. `Locate facility` is unavailable with reason. Build-capacity appears only if authority publishes a legal intent. |
| **Multiple Post facilities** | Each active row names exact facility ID/name/slot and exact body when mapped. Aggregate Production / Post remains the terminal portfolio owner; exact-facility routes are explicit. Missing or duplicate mapping fails visibly. |
| **Committed picture before next week** | Settled `COMMITTED TO RELEASE · NEXT STUDIO WEEK`; no Post work/presence/reservation, no second Commit and no Theater/result cue. |
| **Released but not in theaters** | `RELEASED` derives from `FilmResult`; do not claim `IN THEATERS` without an active run. |

No visible enabled button may return because a project ID is absent. The decision state prevents the
button from enabling and states the exact remedy before the handler is reached.

---

## 8. Visual-direction reconciliation

Use Package 06's inspector/workspace anatomy with Visual Direction Package 01's hierarchy, shared
dark surface language, text+shape+color state grammar, readable type scale, one primary action and
lot-dominant retained-workspace allocation. Mockups are directional references, not pixel contracts.

At management distance the following must remain distinguishable in a colorless still:

| State | World cue | Text/shape owner | Prohibited implication |
|---|---|---|---|
| **Idle** | Baseline building, no hero activity | `AVAILABLE` / neutral shape | Broken/empty department |
| **Waiting** | Quiet queue/arrival marker, no finishing for waiter | `WAITING FOR POST` / queue shape | Still shooting or occupying Stage |
| **Active finishing** | Occupied light/activity + exact Director/craft presence | `POST — <title> · N weeks` / active shape | Cast editing, quality gain, a literal technology phase |
| **Release Ready** | Positive non-urgent ready cue; active work stops | `RELEASE READY` / ready shape | Committed, released or now showing |
| **Committed** | One short deduplicated dispatch cue, then settled state | `COMMITTED · NEXT STUDIO WEEK` / distinct committed shape | Theater cue, review or revenue |

Binding visual rules:

- one truthful title/status owner feeds world marker, inspector and workspace;
- exact Director/craft presence appears only during active Post;
- cast are not shown editing;
- film reels, music rooms, workstations or future devices are decoration, never semantic authority;
- finishing animation never implies final quality or improvement;
- Theater/now-showing cues appear only after actual next-week release authority;
- the lot remains dominant; retained workspace preserves a visible lot edge where viewport permits;
- no global reskin, renderer migration or second visual-research campaign is part of P06.

---

## 9. Bounded P06 proof pyramid

The layers prove different claims. No layer substitutes for the next.

### LEVEL 1 — TYPESCRIPT

Required proofs:

- release state machine and exact invariants;
- migration of every supported pre-P06 Release Ready save to uncommitted, with current-version
  commitments preserved;
- managed and legacy uncommitted hold across one/many Advance Weeks;
- commit advances no time and persists once;
- stale/duplicate/refused intents have no side effects;
- Advance to Next Event stops at unresolved ready decision;
- automatic Living Time pauses at that decision while explicit manual Advance remains legal;
- next week admits committed ready pictures only;
- pre-advance admission witness, malformed zero/uncommitted refusal, orphan-row refusal and exact
  final pruning;
- reverse click order yields identical admitted IDs and ID-sorted release/RNG/economy/premiere law,
  excluding the truthful pre-tick commitment-event/receipt order;
- exact-ID isolation across same-title and multiple facilities;
- save/load/export/import and reconnect/replay.

### LEVEL 2 — CONTRACT

Required proofs:

- closed waiting/active/ready/committed Post projection;
- closed Release Review/decision/hold-consequence projection;
- exact available Release intent with required non-empty production ID plus null/empty/wrong-ID
  refusal;
- distinct manual-Advance, automatic-roll and Next-Event eligibility from the TypeScript selector;
- source schema ↔ JSON schema ↔ TS-repository generated C# artifact ↔ exact generated Unity
  consumer parity;
- the exact Unity consumer selects intent by production ID, not kind only;
- incompatible union/required-nullability fixtures fail closed under the sealed generator.

### LEVEL 3 — UNITY EDITMODE

Required proofs:

- rail-free Production / Post building route;
- zero/one/multi-picture chooser and no selection substitution;
- pure `ReleaseDecisionState` across ready/pending/stale/refused/committed/absent;
- retained workspace, exact Back and Locate/unavailable remedy;
- no visible enabled action silently no-ops;
- poll/request refresh cannot latch disabled;
- wide Living Time HUD owns one explicit single-week action; narrow memo fallback owns it when the
  HUD is hidden; auto-roll remains paused and one press advances exactly once;
- engaged-facility demolition refusal, legal idle demolition/capacity wait and missing Unity body
  mapping error remain three distinct world/machine cases;
- state-responsive Post presenter, exact people and facility/body isolation;
- narrow/200% text, focus order, controller/keyboard and reduced-motion structure.

### LEVEL 4 — SIX-SCENE VISUAL ORACLE

Exactly these six canonical scenes:

1. **Idle Production / Post**
2. **Wrapped / Waiting for Post**
3. **Active finishing**
4. **Release Ready**
5. **Committed to Release**
6. **Multi-picture contention and exact-ID isolation**

Each scene binds exact fixture IDs, schema/projection, binary hash, PID, window, viewport, camera,
image hash and machine assertions. Critic, audience, box-office and theatrical interpretation are
absent. Variants such as stale, missing body, reduced motion and narrow viewport are targeted proofs,
not a seventh canonical scene.

### LEVEL 5 — OWNER JOURNEY

One coherent journey on the sealed candidate, after lower layers are green:

> Wrap → Production / Post → active Post → Release Ready → Hold → knowingly advance and remain
> ready → return → Commit Release → dispatch acknowledgment → Save/Load → **STOP before P07 result
> interpretation**

Run against deterministic fixtures plus a private byte-copy of the Owner profile; never mutate the
real profile. Technical KEEP remains pending until the Owner accepts this journey.

---

## 10. P07 boundary contract

P06 may prove mechanically that the next authoritative week:

- releases committed ready films only;
- appends exactly one exact `FilmResult` per admitted production;
- preserves canonical production-ID-sorted batch/RNG/economy/event/save law; and
- leaves uncommitted ready films held.

P06 may not interpret or prominently reveal:

- critic result;
- audience result;
- box office or theatrical-run performance;
- awards;
- franchise consequences; or
- final learning/autopsy.

Current downstream result fields may exist in the snapshot after that week. Their existence is not
permission for a P06 presenter to render or interpret them.

### 10.1 Machine-readable handoff checklist

```yaml
p06_to_p07_handoff:
  contract_version: p06-to-p07-v1
  p06_owner_accepted: false  # must become true before handoff
  required_authority:
    final_p06_typescript_sha: UNRESOLVED
    final_p06_unity_sha: UNRESOLVED
    schema_id: UNRESOLVED
    protocol_version: UNRESOLVED
    projection_version: UNRESOLVED
    save_version: UNRESOLVED
  required_exact_identity:
    production_id: UNRESOLVED
    commitment_id: UNRESOLVED
    commitment_event_id: UNRESOLVED
    command_receipt_id: UNRESOLVED
    release_event_id: UNRESOLVED
  p06_stop_boundary:
    state: committed_to_release
    receipt: exact_dispatch_acknowledgment
    time_advanced_by_commit: false
    film_result_created_by_commit: false
  mechanical_next_week_proof:
    committed_ready_only: required
    uncommitted_ready_holds: required
    one_film_result_per_admitted_id: required
    production_id_sort_preserved: required
    rng_order_preserved: required
    economy_and_event_order_preserved: required
  p07_owned_interpretation:
    critic: forbidden_in_p06
    audience: forbidden_in_p06
    box_office: forbidden_in_p06
    theatrical_run_performance_presentation: forbidden_in_p06
    awards: forbidden_in_p06
    franchise_consequences: forbidden_in_p06
    learning_autopsy: forbidden_in_p06
  gate:
    p07_may_start: false  # true only after P06 Owner acceptance and sealed handoff
```

This checklist freezes ownership, not P07 result law. P06 does not design how P07 presents or
interprets the existing outcomes.

---

## 11. Reuse / extension summary and collision ownership

| Concern | Final provisional classification | One future editing owner | Collision rule |
|---|---|---|---|
| Release state/migration/tick gate | **EXTEND** | Core Release owner | Owns Core live types/operations/tick/save/index, adapter live-import/decision seams, bridge live-save/checkpoint arms and focused tests during W1; no concurrent editor. Session ownership transfers only after W1 seals. |
| Release projection/intent/schema | **EXTEND** | Contract owner | Owns source schema, session projection/intent, generated pipeline and exact-consumer manifest. Generated files never hand edited. |
| Manual Advance / Living Time / Next Event | **EXTEND / P05-DEPENDENT — REFRESH REQUIRED** | Core Release owner for selector, then Contract owner for projection, then Unity Workspace owner for focused C# consumer | Sequential ownership only. Manual intent presence is never reused as automatic-roll permission; no Unity stop ladder. |
| Post facility/body registry | **NEW / P05-DEPENDENT — REFRESH REQUIRED** | Unity Registry owner | Extends final P05 registry; no scene-wide search or shared integration-file edits. |
| Post world presenter/people | **NEW / P05-DEPENDENT — REFRESH REQUIRED** | Unity World owner | Consumes exact DTO/registries; does not edit Core law or Stage presenter. |
| Production/Post inspector/workspace | **EXTEND / P05-DEPENDENT — REFRESH REQUIRED** | Unity Workspace owner | Extends final shared host; no parallel host/input/menu/Back stack. |
| `StudioBridgePresentation`, bootstrap, client, host router, system menu/input/camera shared paths | **EXTEND** | Lead integrator only | Touched only during integration windows after feature owners stop. |
| Evidence/Oracle | **EXTEND / P05-DEPENDENT — REFRESH REQUIRED** | Proof owner | Owns manifest/fixtures/runner; cannot weaken product assertions or edit product files. |
| Reception/result/run/history owners | **DO NOT TOUCH** | None in P06 | P07/downstream only. |

The final P05 changed-path refresh must replace these concern-level reservations with exact paths
and final symbols.

---

## 12. Hard exclusions and recon conclusion

Do not use any seam above to recommend or implement manual editing, scene timeline, sound/VFX/edit
subphases, final-cut score, fake quality improvement, duplicate release marketing, unsupported fee/date
picker/genre calendar, manual archive, movie export, P07 result UI, box-office redesign, awards,
IP/library economy, creator mode, renderer migration, HDRP, DOTS or a global reskin.

The accepted architecture is sufficient to justify a bounded provisional design:

- exact TypeScript identity and canonical release batch are reusable;
- a persisted commitment and migration are genuinely new authority work;
- current opaque `/command` can carry the exact commit without a new quote route;
- accepted Unity provides exact selection/navigation/bridge, one workspace host and a physical
  Production / Post body;
- accepted Unity does not provide a Post presenter, exact Post facility/body registry, multi-picture
  chooser or Release workspace;
- final P05 is expected to reshape every shared registry/rail/workspace/evidence seam, so P06
  implementation remains **NO-GO** until the bounded refresh.

---

## POST-P05 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED

After P05 Owner acceptance, Codex must:

1. receive final P05 TS and Unity SHAs;
2. receive exact changed paths;
3. receive final schema/protocol/projection/save versions;
4. inspect only the P05 delta and final current seams;
5. resolve every P05-dependent placeholder;
6. update exact files and symbols;
7. refresh collision ownership;
8. update test counts;
9. reconcile final visual/Visual Oracle infrastructure;
10. stamp:
    - `P06A-READINESS-GATE-00-r2-FINAL`
    - `P06A-RECON-r2-FINAL`
    - `P06A-IMPLEMENTATION-CHARTER-r1-FINAL`

Do not restart comparative research.
