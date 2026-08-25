# Project: Studio — P04A Implementation Reconnaissance

Casting / Auditions / Greenlight<br>
Read-only codebase integration study

## 1. Executive implementation recommendation

P04A should be implemented as a new TypeScript-owned Casting/package projection and player-choice quoting seam over existing simulation law, followed by one retained Unity workspace that consumes those facts and submits opaque intents. It should not create a second Casting simulation, Fit model, availability model, finance model, clock, or Greenlight transaction in Unity.

The core finding is favorable: the current TypeScript engine already owns almost the entire approved Package 04 law. It already supports a Ready screenplay; optional Camera Tests; exactly six role-specific reads; one shared Development & Casting slot for one week; persisted noisy evidence; no fee, hold, assignment, or winner; current candidate availability; package assessment; queue admission; and an atomic Greenlight-to-production transition. The missing implementation seam is:

```text
authoritative revision + exact player-selected IDs and budget
  -> TypeScript validates the draft and projects consequences/blockers
  -> TypeScript mints a fresh, revision-bound opaque intent
  -> Unity shows a deliberate confirmation sheet
  -> Unity submits that exact intent once
  -> TypeScript revalidates and atomically forms or queues the production
```

The current bridge is an automation/bootstrap surface, not an interactive Package 04 surface. It auto-selects an audition slate and auto-builds a minimum Greenlight package. Unity must not reproduce or depend on those choices. The safest path is to extend the existing closed projection, refusal, revision, digest, idempotency, and reconnect system with player-authored choice validation rather than rewrite the protocol.

Implementation should wait at the shared projection/workspace seam until P03A seals. P03A is expected to establish the same kind of TypeScript choice/quote mechanism and retained Unity workspace/origin stack. P04A should extend that mechanism, not create a Casting-specific parallel.

## 2. Inspected baseline

| Item | Inspected value | Notes |
|---|---|---|
| Canonical documentation baseline | `c902a704eb948cc576083d0973c8c23e59937dc1` | Parent of the approved Package 04 documentation commit. |
| Package 04 | `ddc4976cd7c947ba513917e6311a697ad4ea6934` | Contains `CODEX-CASTING-AUDITIONS-PACKAGE-04.md` and Builder Annex. |
| TypeScript campaign baseline | `campaign/living-lot-ts` at `1b3c5271d7314cbd20d0cd28b9481fa3003553b4` | Inspected in a clean stable worktree. |
| Unity campaign baseline | `campaign/living-lot-client` at `2e192269504226a2f9b7a2a3082f4a4678968587` | Inspected in a clean stable worktree. |
| Package 02 inputs | Approved world-interaction core and Builder Annex | Used for selection, retained context, Back, camera, attention, and world-presence law. |
| Package 03 inputs | Approved design only at the Development -> Casting boundary | P03A production work was deliberately not inspected or touched. |

This is a pre-P03A reconnaissance. Paths and symbols below refer to the exact campaign SHAs above. Line numbers are intentionally not used as stable identifiers; symbols and test names are the durable handoff.

No TypeScript, Unity, browser production code, tests, assets, saves, dependencies, or tuning were changed for this study.

## 3. Package 04 design-to-code mapping

| Journey step | Existing authority / projection / mutation | Existing browser / Unity / proof | Missing and smallest safe extension | Do not rebuild / P03 collision |
|---|---|---|---|---|
| Ready screenplay | `acceptScriptProject` in `src/core/scriptDevelopment.ts`; `ReadyScriptPackageView`, `readyPackage`, and `packageAvailability` in `src/core/scriptReadModel.ts`; `readyToPackageView` in `src/core/firstFilmJourney.ts` | Browser lot journey already routes Ready work to Casting. Unity only receives the narrow journey notice and generic building state. `tests/first-film-journey.test.ts` proves the chain. | Publish the exact Ready screenplay/package identity in the bridge Casting projection. | Do not create a Unity screenplay state. Recheck this boundary after P03A changes Ready fields, actions, or writer release. |
| Casting requests attention | Core journey site is `casting`; browser `managedCastingLotCue` and `ui/src/lot/buildingInspector.ts` derive review/running/queued/planning cues | Unity `StudioBridgePresentation.ApplyBuildingStates` consumes TypeScript `attention`/`attentionReason`; authored building ID is `casting`. Ambient Casting extras already stand up only for qualifying authority state. | Extend the TypeScript building/Casting projection so direct-Package and blocked-ready states get exact attention and primary action. | Do not infer urgency from bodies, labels, or available opaque intents. P03A may change shared inspector/attention precedence. |
| Select/open Casting | `FirstFilmJourneyNext.site = 'casting'`; browser uses deep Casting routes and retained lot workspaces | Unity `SelectableEntity`, `StudioSelectionManager`, `StudioHud`, `StudioCameraDirector` already own place selection and focus. No Casting workspace exists. | Add/extend the accepted retained workspace host for exact selected building/project and origin restoration. | Do not add another selection system or force a camera move on screenplay acceptance. Reuse P03A's origin stack if it lands. |
| Role-first workspace | Writer lock and required roles exist in the screenplay/package payload; fixed actor slots are `lead`, `antagonist`, `support` | Browser `Assembly` has a local reversible draft and `TalentPicker`; it is a wizard, not the approved target. Unity has CP10A dossier/card patterns, not Casting. | Add a TS Casting/package projection and a Unity role-first retained workspace. Keep the draft transient and identity-based. | Do not copy the browser page architecture or persist a package draft as a hold. |
| Inspect candidates | `roleOVR`, `projectFit`, `expectedPerformance`, `genreExperience`, employment and fee helpers exist | Browser `assignmentCard`/`TalentPicker` expose most required facts. Unity CP10A shows OVR, genre, economics, and portrait patterns for founding applicants. | Publish safe, role-specific candidate rows for Director, each actor role, and Craft Lead. Generalize the existing dossier visual pattern without coupling to founding. | Do not calculate or decompose Fit in Unity. Do not expose hidden persona/actual values. |
| Compare candidates | Same TS facts can be aligned by role; `packageDelta` supports before/after package effects | Browser has card sorting and package delta, but no real side-by-side comparison component. Unity has no comparison UI. | Add presentation-only compare selection over already-published candidate rows; any consequences remain TS-projected. | Do not claim an existing comparison implementation. Do not invent a new comparison score. |
| Optional Camera Tests | `startCastingSession`, `completeDueCastingSessions`, `acknowledgeCastingSession`; `castingSessionsReadModel` | Browser planner/review panels implement the exact slate and evidence behavior. Unity bridge currently offers only an auto-authored slate intent. Core/action/save/calendar tests are extensive. | Add player-authored six-read choice validation and an opaque start intent; publish session/evidence fields to Unity. | Do not rebuild the law, RNG, clock, fee, hold, or winner behavior. P03A may provide the reusable choice/quote seam. |
| Understand OVR/Fit/evidence/Star Power/availability/cost | Authority exists across `talentSummary.ts`, `employment.ts`, `filmPackage.ts`, and adapter selectors | Browser presents these separately. Unity does not currently receive them. | Promote/extract safe selectors into a shared Core/bridge projection with explicit disclosure that Fit contains undisclosed role-read information. | Do not label Fit fully perceived or expose an exhaustive driver formula. |
| Reversible package choices | Core accepts a complete `GreenlightScriptProjectPayload`; no authoritative provisional draft exists | Browser `Assembly` holds local `Draft`, keeps it on refusal, and avoids duplicate gesture submit. | Keep a Unity local draft keyed by project ID and source revision; refresh facts and revalidate before preview/commit. | Do not treat a draft as an assignment, option, hold, expense, or save-game fact. |
| Preview Greenlight | `packageFit`, `executionConfidence`, `forecastProfitRange`, fee and commitment helpers already exist | Browser `FilmPackageSummary`, budget review, and `commitmentPreview` are the behavioral oracle. Bridge publishes none of it. | Add a pure exact-draft quote/assessment projection returning costs, cash effect, queue outcome, blockers, and opaque intent when legal. | Do not port adapter arithmetic into C#. Richer future finance fields are Package 11 integration points. |
| Explicit Greenlight | `applyGreenlightScriptProject` / `applyGreenlightScriptProjectNow` call the single `applyGreenlight` transition | Browser preserves draft on refusal and validates exact before/after formation. Unity has exact opaque submission, pending-post, revision, and refusal handling. | Put the minted intent behind an armed, deliberate confirmation sheet; submit once through `StudioBridgeClient`. | Do not send multiple assignment/charge commands or infer acceptance from button press. |
| Production forms atomically | `applyGreenlight` creates the immutable production, cash/ledger, workflow/reservation/events, and screenplay link in one immutable transition; capacity-only admission queues the untouched payload | Browser `acceptedGreenlightFormationReceipt` validates one exact new production and related joins. Unity stage/company presentation consumes authoritative production/company projections after refresh. | Add an exact accepted-vs-queued receipt selector on the Unity side over before/after authority snapshots; fail neutral on ambiguity. | Do not predict production IDs, pre-spawn an authoritative company, debit cash locally, or reserve a Stage. |

## 4. TypeScript reuse map

### Screenplay and role authority

| Concern | Exact path and symbol | Current truth | P04A action |
|---|---|---|---|
| Ready-to-package state | `src/core/scriptDevelopment.ts` — `acceptScriptProject`; `src/core/scriptReadModel.ts` — `STATUS_LABEL`, `projectCard`, `readyPackage` | Acceptance changes the project from `review` to `ready`. The project retains its exact concept, locked shape/promise, assessment, required sets, and writer. | REUSE; publish the exact view to Unity. |
| Locked Writer | `ScreenplayProject.writerId` and `ReadyScriptPackageView` in `src/core/types.ts` / `src/core/scriptReadModel.ts` | Writer is fixed by the accepted screenplay and is not a package choice. | REUSE; render as locked. Recheck contributor-vs-credit representation after P03A. |
| Director / actor / Craft Lead slots | `GreenlightScriptProjectPayload` in `src/core/types.ts`; `CastSlot` and `CastingSlate` | Package mutation accepts Director, Lead, Antagonist, Support, and `craftIds`; engaged economy requires exactly one Craft assignment. | REUSE the final payload and validation. Publish role-first candidate pools. |
| Role eligibility | `requireRole` and uniqueness checks inside `applyGreenlight` in `src/core/actions.ts`; primary-role pooling in read models/adapter | Final Core check is discipline-capability, while current discovery surfaces primary-role pools. Tests deliberately allow cross-primary-discipline assignments. | Preserve the existing primary-role V1 UI pools and always run final Core validation. Do not widen the Unity pool independently. |

### Casting lifecycle and Camera Tests

| Concern | Exact path and symbol | Current truth | P04A action |
|---|---|---|---|
| Persisted lifecycle | `src/core/types.ts` — `CastingSession`, `CastingSessions`, `CastingSessionStatus` | One append-only session per screenplay; `auditioning -> review -> complete`; slate and observations persist. | REUSE. |
| Slate law | `src/core/castingSessions.ts` — `assertCastingSlateLaw` | Two distinct readers for each of Lead/Antagonist/Support and at least three unique Actors overall. | REUSE; project validation results, do not duplicate legality in C#. |
| Candidate eligibility | `assertCastingSlateEligibility` | Primary Actor, not locked Writer, not busy, and currently contracted or in freelancer market. | REUSE. |
| Shared capacity | `allocateCastingReservation`, `castingOccupiedFacilitySlots`; `src/core/scriptDevelopment.ts` — `developmentCastingOccupancy`, `availableDevelopmentCastingSlots` | Casting, script work, and production Development share the same authoritative facility pool. | REUSE. |
| Week advancement | `src/core/tick.ts` — `tick`; `completeDueCastingSessions` | One week. Due casting completes and releases its reservation before later allocation in the authoritative tick. | REUSE; Unity advances only through the existing week intent. |
| Evidence RNG | `auditionObservation`; `src/core/rng.ts` — `stream`; tuning constants in `src/core/tuning.ts` | Keyed deterministic `casting-v1` Gaussian observation around actual role execution, stored as estimate and fixed range. It does not advance `state.rngState`. | REUSE; publish stored results only. |
| Acknowledgement | `acknowledgeCastingSession` | Review acknowledgement opens ordinary package work; it assigns nobody. | REUSE. |
| Queue | `src/core/productionQueue.ts` — `queueStartCastingSession`, `hasQueuedCastingSession`, `commitQueuedIntent` | Only capacity refusal queues. Waiting commits no session, person, cash, or slot and revalidates on admission. | REUSE. |

### Candidate information authority

| Required fact | Existing authority | Current publication gap | Smallest safe extension |
|---|---|---|---|
| Generic OVR | `src/core/talentSummary.ts` — `roleOVR` | Browser adapter only; not in Casting bridge projection. | Publish the role-appropriate perceived OVR. |
| Exact-role Fit | `projectFit`; actor execution uses `castSlotExecution` | `CastingCandidateView` publishes Fit only for actor roles; Director/Craft package candidates are absent. | Publish authoritative Fit per exact slot for all package candidates. |
| Fit drivers | `projectFit`, perceived skill/experience helpers; safe display reasons in `ui/src/engine/adapter.ts` — `shapeFitReasons` | Existing reasons are not a shared Core contract and are not exhaustive. | Add structured public signals plus a fixed disclosure; keep the actual score opaque. |
| Genre experience | `genreExperience` | Browser only. | Publish perceived genre label/count/tier needed by P04. |
| Star Power | perceived fame read by `assignmentCard` and package assessment | Browser only. | Publish separately from OVR and Fit. |
| Expected performance / uncertainty | `expectedPerformance`, `executionConfidence` | Browser only. | Publish band/uncertainty, not hidden inputs. |
| Employment and conflicts | `src/core/employment.ts` — `activeContract`, `isContracted`, `busyTalentIds`, `employmentStatus`, `assignableForFilm`, `freelancerMarketIds` | Casting read model exposes only boolean/label. | Publish authoritative employment badge, current work/conflict, and reason. |
| Exact candidate cost | `freelancerFee`, active contract; browser `assignmentProjectCost` | Amount assembly is currently adapter-side, not in a shared bridge view. | Move/extract an exact project-cost selector to shared TS projection code. |
| Camera-test evidence | persisted `CastingResults`; `AuditionEvidenceView` | Est/range exists, but tested week/source/freshness semantics are not explicit. | Publish exact session/week/slot provenance and current-availability separation. |
| Portrait identity | No Core portrait asset/token is currently part of Talent or Casting read models | Unity can render a body only when a matching body is physically present. | ADD a presentation-safe portrait/body token only if the accepted P03/Unity character identity seam requires one; do not derive it from array index or name. |

Important information-boundary caveat: `projectFit` uses perceived ability and experience, but actor role Fit reads actual persona through `actorRoleFit`; writer/director temperament reads actual temperament through `temperamentMatch`. Therefore P04A may show the authoritative Fit and public supporting signals, but must not claim that the supporting signals fully explain the score. A safe disclosure is: “Fit includes public evidence and an undisclosed role-read component.” `teamDirectionPreview` / `teamDirectionGuidance` in the browser adapter directly read hidden actual persona and must not cross the bridge.

### Package and Greenlight authority

| Concern | Exact path and symbol | Reuse judgment |
|---|---|---|
| Per-assignment package Fit | `src/core/filmPackage.ts` — `packageFit` | REUSE; overall is secondary, not a magic quality score. |
| Confidence / forecast | `executionConfidence`, `forecastProfitRange` | REUSE through a draft quote. |
| Reversible change consequence | `packageDelta` | REUSE where the UI compares a replacement against the current draft. |
| Creative cohesion | `creativeCohesion` | REUSE only as brief coherence; never present it as cast chemistry. |
| Greenlight legality and commit | `src/core/actions.ts` — `applyGreenlight`, `applyGreenlightScriptProject`, `applyGreenlightScriptProjectNow` | REUSE unchanged as the one final transaction. |
| Greenlight queue | `src/core/productionQueue.ts` — `QueueableCapacityRefusal`, `queueGreenlightScriptProject`, `hasQueuedGreenlightScriptProject` | REUSE. A queued package holds and commits nothing. |
| Set demand | `ReadyScriptPackageView.requiredSets` | REUSE as information. It is not a Greenlight gate or Stage reservation. |

`greenlightAssessment` is a locked, post-commit production assessment/autopsy. It is not a draft quote. A new quote should call the same lower-level package, forecast, availability, fee, and commitment functions over an exact proposed payload; it should not fake a committed Production.

## 5. Bridge/protocol reuse map

Current contract is protocol v4, projection v8, schema ID `sha256:0285e92f32c27cd2960df802b3f7ea156a15372f05001ad1f4964c2f25db55b5` at the inspected baseline.

| Seam | Current path/symbol | Decision | P04A use |
|---|---|---|---|
| Projection bundle | `bridge/schema/bridge-schema.ts` — `StudioProjectionBundleSchema`; generated JSON in `bridge/schema/project-studio-bridge.schema.json` | EXTEND | Add a closed Casting/package view. Current bundle has lot, productions, people, construction, journey notices, and releases only. |
| Runtime validation | `bridge/schema/runtime.ts`, `bridge/schema/canonical.ts` | REUSE / EXTEND generated contract | Keep recursive closed validation and schema fingerprinting. |
| Intent option | `bridge/schema/bridge-schema.ts` — `StudioBridgeIntentOption` | EXTEND only if needed | Keep opaque identity. Current visible fields are `intentId`, `kind`, `label`, `detail`, `projectId`, `castingSessionId`, `productionId`. Do not stuff a simulation payload into the option. |
| Submit command | `bridge/schema/bridge-schema.ts` — `StudioBridgeIntentRequest`; `BridgeSession.command` | REUSE | Continue submitting one opaque intent with current session, command ID, and expected revision. |
| Choice/quote request | None | ADD | Accept exact selected IDs/budget plus session/revision, validate them in TS, and return closed consequences/blockers plus a newly minted opaque intent when legal. Prefer the P03A mechanism if one exists after seal. |
| Available intent resolution | `bridge/session.ts` — `resolveAvailableIntents`, `availableIntents`, `applyAvailableIntent` | EXTEND | Register the quoted, exact hidden action in the current revision. Preserve recomputation/invalidation. |
| Opaque identity | `opaqueIntentId` | REUSE | Bind the exact action and authoritative digest; changing any role, candidate, budget, marketing choice, or revision must invalidate it. |
| Revision/digest | `authoritativeDigest`; `BridgeSession.command` | REUSE | Quote against current revision and refuse stale submit. |
| Idempotency | `priorResponse` and command journal | REUSE | Same command ID + exact envelope replays byte-identically; same ID + different envelope refuses. |
| Refusals | `rejectionFacts` and rejected response schema | REUSE / EXTEND projection blockers | Keep transport/authority refusal structure. Publish candidate/package blockers before commit instead of parsing `ENGINE_REJECTED` text. |
| Reconnect | `bridge/runtime-checkpoint.ts`, `bridge/runtime/*` | REUSE | Keep durable current state, revision, and command journal across process restart. Fresh logical sessions invalidate old intents. |

Current submit shape:

```ts
type StudioBridgeIntentRequest = {
  protocolVersion: 4
  schemaId: string
  sessionId: string
  commandId: string
  expectedStateRevision: number
  type: 'submitIntent'
  payload: { intentId: string }
}
```

Current accepted command response carries the exact successor snapshot, `stateRevision`, `stateDigest`, `commandId`, week, and available intents. Current rejected response carries `reasonCode`, diagnostic `message`, current revision/week/digest, and:

```ts
type RejectionFacts = {
  category: string
  blocker: string
  currentHolder: string | null
  remedy: string
}
```

Existing refusal codes are `INVALID_JSON`, `INVALID_COMMAND`, `INVALID_CONTROL`, `PROTOCOL_MISMATCH`, `SCHEMA_MISMATCH`, `SESSION_MISMATCH`, `STALE_REVISION`, `COMMAND_ID_REUSE`, `INTENT_NOT_AVAILABLE`, `ENGINE_REJECTED`, `NO_SAVE`, and `SAVE_REJECTED`. Reuse them. Exact draft illegality should ordinarily be a successful quote carrying structured blockers; a commit-time race should retain the current authority refusal envelope.

The current bootstrap behavior must not become the player UX:

- `resolveAvailableIntents` auto-constructs Camera Tests from the first three available Actors.
- It emits a fixed `[0,1] / [0,2] / [1,2]` six-read slate.
- Greenlight currently requires reviewed audition candidates, selects the first available primary Director and Craft, uses the required minimum negative, and sets marketing to zero.
- Therefore the bridge cannot express a direct package without tests, a player-chosen test slate, a player-chosen Director/Craft Lead, untested legal Actors, or player budget/marketing choices.

Retain those paths only as deterministic journey/proof automation. Add a player choice-to-quote seam; do not rewrite command submission, revision, replay, or reconnect.

## 6. Browser oracle map

| Exact path / component | Copy as behavior | Do not copy |
|---|---|---|
| `ui/src/screens/CastingRoom.tsx` — `CastingRoom`, `CastingEvidence`, `ProjectCard`, `CapacityPanel` | Optional direct Package route, lifecycle sections, due week, current availability distinct from historical evidence, blockers/remedies, evidence beside Fit, blank package after acknowledgement. | Full-screen portfolio as the normal lot host, compact card wall, or generic styling. |
| `ui/src/screens/CastingSlatePlanner.tsx` — `CastingSlatePlanner` | Exact two-per-role/min-three counts, local reversible slate, availability recheck, consequence text, explicit submit. | Three-column planner as the final role-first workspace. |
| `ui/src/lot/LotAuditionWorkspace.tsx` — `LotAuditionWorkspace` | Retained mounted lot, exact project identity, local scroll, one-layer Escape, accepted/committed transition. | React ownership or DOM layout architecture. |
| `ui/src/lot/snapshot/auditionPlanning.ts` | Strict closed project/candidate/slate selectors, ID-based joins, same-name safety, exact six-read accepted receipt. | Any title/name-based identity routing. |
| `ui/src/lot/LotCastingReviewPanel.tsx` — `LotCastingReviewPanel` | Six role-bound evidence rows, input-tail deduplication, current-boundary invalidation, blocker retention, exact handoff to Package. | Treating this review panel as the whole P04 workspace. |
| `ui/src/lot/snapshot/castingReview.ts` | Fail-closed canonical session/result/context validation. | Client inference when a join is ambiguous. |
| `ui/src/presentation/auditionEvidence.ts` — `auditionReadsForPackage`, `auditionReadSentence`, `notAuditionedSentence`, `auditionGroupingNote` | Tested-for-this-role provenance and “evidence, not choice” semantics; tested candidates may sort first but are never preselected or declared winners. | A universal talent ranking. |
| `ui/src/screens/Assembly.tsx` — `Assembly`, local `Draft`, `buildPackage`, `TalentStep`, `BudgetStep`, `ReviewStep`, `handleGreenlight` | Locked Writer, local reversible draft, uniqueness exclusions, role pools, evidence carry-through, financial preview, refusal retention, explicit review, synchronous duplicate-gesture gate. | Page/wizard architecture, browser-local calculations as new authority, or `TeamDirectionPanel`. |
| `ui/src/components/TalentPicker.tsx` | Candidate information hierarchy, Fit-first sorting, explicit select, disabled conflict reason, profile affordance, fee/payroll distinction. | Treating a picker card as a selected dossier or aligned comparison. |
| `ui/src/components/FilmPackageSummary.tsx` | Strongest/weakest/severe mismatch, per-assignment Fit/EP, uncertainty, range, screenplay/set facts, financial disclosures. | Elevating overall Fit to the answer or presenting creative cohesion as chemistry. |
| `ui/src/lot/LotPackageWorkspace.tsx` | Retained lot composition and distinct accepted, queued, rejected, and neutral receipts. | Claiming a queued package committed cash, cast, identity, or a room. |
| `ui/src/lot/snapshot/productionFormation.ts` — `acceptedGreenlightFormationReceipt`, `productionFormationContext` | Exact before/after set difference; exactly one production/workflow/reservation/ledger/script link; exact person/operation joins. | Guessing a production ID or routing by title. |
| `ui/src/lot/buildingInspector.ts` | Shared facility occupancy, due commitments, authoritative presence, and journey-derived Plan/Open Package actions. | Inferring the full Casting state from presence or generic building attention. |
| `ui/src/engine/adapter.ts` — `assignmentCard`, `assessPackageFit`, `assessExecutionConfidence`, `assessProfitRange`, `assessPackageDelta`, `assignmentProjectCost`, `totalCommittedCost`, `commitmentPreview`, `managedCastingLotCue` | Existing selector vocabulary and distinctions. Extract/promote safe logic to a shared TS projection. | Copying formulas into bridge glue or C#; exposing `teamDirectionPreview` / `teamDirectionGuidance`. |

There is no existing browser side-by-side comparison implementation. Comparison layout is new presentation work. Its facts, ordering, evidence, and package consequences are reusable; its score must not be invented.

## 7. Unity reuse map

### Existing accepted infrastructure

| Exact path / class | Current behavior | P04A reuse |
|---|---|---|
| `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | Closed generated protocol v4/projection v8 DTOs. It has journey stage/beat vocab for Ready/Auditions/Greenlit but no Casting/package projection. | REGENERATE from the extended TS schema; do not hand-maintain a parallel DTO model. |
| `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`, `StudioBridgeWireValidator.cs` | Strict parse, closed compatibility, exact command serialization. | REUSE; extend through generated contract. |
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` | Polls authority, retains exact current snapshot, submits opaque intents, saves/loads, emits snapshot/accepted/rejected events, pauses actions during refresh. | REUSE. Add a typed quote call only through the same transport/pending lifecycle; do not bypass it. |
| `StudioBridgePendingPost.cs`, `StudioBridgeRuntimeContinuity.cs` | Retries identical immutable bytes after ambiguous transport loss and joins responses against exact session/revision. | REUSE for quote/commit as applicable. |
| `StudioSnapshotStateCache.cs` / projection store | Applies complete snapshots atomically across polls and session epochs. | REUSE. Casting draft remains separate presentation state. |
| `StudioRejectionRetention.cs` | Keeps TS-owned refusal facts only beside the exact session/revision/digest that produced them. | REUSE in the workspace. |
| `Assets/Studio/Runtime/Presentation/SelectableEntity.cs` | Stable authority ID, display/status, place/person/vehicle semantic kind, selection visuals, optional focus. | REUSE for Casting building and physically present candidates. |
| `StudioSelectionManager.cs` | Semantic person-first picking, single selection, double-activation focus/inspection, Escape clear. | REUSE. Do not add workspace-specific raycasts. |
| `StudioHud.cs` | Right-edge selection receipt with safe-area/workflow-panel avoidance. | COPY PATTERN or extend its accepted host relationship; avoid overlapping retained workspace. |
| `StudioInspectionTarget.cs`, `StudioCameraDirector.cs`, `TycoonCameraController.cs` | Management vs inspection cameras, input ownership, Back control, restoration of prior workflow-panel visibility. | REUSE. Opening Casting must not automatically enter inspection or change the camera. |
| `StudioBridgePresentation.cs` | Exact building/property joins, authoritative person placement, zone routing, ambient presentation, production/world refresh. | EXTEND the existing projection application; do not build a parallel presentation binder. |
| `StudioLocationBinding.cs` | Exact building ID to physical body join. | REUSE building ID `casting`. |
| `StudioPersonPresentationSlot.cs`, `PurposefulAgent.cs` | Separates authoritative from ambient bodies; routes authoritative activity without simulation. | REUSE for Camera Test physical presence. |
| `StudioStageProductionPresentation.cs`, `StudioProductionRolePresentation.cs` | Consumes authoritative production company/role facts after Greenlight. | REUSE after accepted formation; P04A should not pre-stage authoritative company members. |
| `StudioLivingTime.cs` / controller and HUD | Presentation cadence and existing Advance Week client seam; does not own simulation time. | REUSE; Camera Test due time remains TS-owned. |

### Current Casting world surface

- The authored place is `casting`, displayed as “Casting & Talent,” created by `StudioLotArchitectureAuthoring.BuildCasting` and bound in `Assets/Studio/Scenes/StudioLot.unity` through `StudioLocationBinding.buildingId = casting` and `SelectableEntity.stableId = casting`.
- There is no `BuildDevelopment` or separate live Development body at this Unity baseline. A `writers` record in `Assets/StreamingAssets/studio-lot-1948.json` is a visual fixture, not live authority. P03A is expected to settle the physical Development body and shared-office presentation; P04A must not pre-empt it.
- TypeScript facilities use `facility-development-casting` and annex/hall variants. `StudioBridgePresentation.ResolveZoneId` already maps baseline and annex facility IDs to the physical `casting` zone.
- That resolver does not yet map every newer office/hall facility ID. After P03A, extend the exact authoritative facility-to-building join rather than adding another guessed hard-coded alias.
- `StudioBridgePresentation.ApplyBuildingStates` already puts authoritative `attentionReason`, construction progress, or availability on the selected building.
- `ApplyAmbientPeople` uses `TryResolveBuildingAmbient(lot, "casting", true, ...)`: authored casting extras become visible for active/positive/warning/decision-required attention.
- `StudioLotActivityAuthoring.BuildServiceAndCastingEvidence` authors a check-in table, three decorative applicants, and a decorative casting clerk. These are presentation identities only and must never be joined to candidate IDs.
- `ApplyPeople` already binds authoritative `StudioPersonSnapshot` + `StudioPresencePersonSnapshot` to physical bodies and routes `facility-development-casting*` presence into the Casting zone.

No Unity Casting screen, candidate card, role assignment workspace, comparison surface, Fit explanation, Greenlight preview, or exact Casting building inspector exists at this baseline. The current `StudioBridgeClient` memo can list auto-generated Greenlight intent buttons and a generic “choose cast” heading, but it does not contain the data or interaction model approved for P04A.

The baseline has no Unity `.prefab`, `.uxml`, or `.uss` presentation assets for this surface; its accepted presentation stack is scene/authoring plus IMGUI components. `StudioCameraInput.IsPointerOverUi` is the existing pointer-ownership seam, so the retained workspace must join it rather than intercept input independently. There is also no generic building beacon: current Casting spectacle is world ambient visibility plus selected-building status.

### Back and context restoration

Current camera Back is exact for inspection: `StudioCameraDirector.ExitInspection(false)` restores management input and the previous workflow-panel visibility. Current selection Escape clears selection. CP10A `StudioFoundingCardHud.BackToCompact` reverses one dossier/confirmation layer. These are useful laws, but there is no general retained-workspace origin stack in the inspected Unity baseline. P04A should reuse P03A's accepted stack if it lands; otherwise add one shared presentation-level origin model with:

```text
origin = selected building ID + selected project ID + workspace layer + local scroll/compare state
Back = pop exactly one presentation layer
Locate = explicit camera action only
authority refresh = retain origin if all exact IDs still join; otherwise fail neutral to Casting root
```

Do not wire Back to `SnapHome`, change selection, or refocus the camera unless the player explicitly requests Locate/Focus.

`TycoonCameraController.FocusOn` changes management pivot/distance and exposes no complete pose capture/restore API. Therefore it cannot, by itself, satisfy Package 02 exact Back restoration. `StudioSelectionManager` also lacks a selection-change event, exact-stable-ID select method, and exact Locate/Focus API. These are shared presentation gaps for P03A/P04A, not reasons to add Casting-local camera or selection state.

## 8. Candidate/Profile reuse

Package 10 is not a P04A dependency. Its Unity applicant dossier is still the best current visual/readability reference.

### COPY COMPONENT

- `StudioApplicantPortraitCamera`: reuse its live `RenderTexture`, isolated portrait layer, framing, cleanup, and `ShowPortrait` / `HidePortrait` lifecycle for an exact current body. Generalize naming/API only if needed; maintain the exclusion of applicant furniture/decorative marks.
- `StudioRejectionRetention`: reuse unchanged for exact-authority refusal display.
- `SelectableEntity` and `StudioSelectionManager`: reuse unchanged for physically present people.

The portrait component can only render a body that exists. The current Casting projection does not provide persistent visual identity, and not every package candidate is physically present. For absent candidates, P04A needs an approved neutral portrait/presentation token or an honest unavailable portrait state from TypeScript/presentation identity; it must not silently borrow the body of an unrelated applicant.

### COPY PATTERN

- `StudioFoundingCardContracts`: readable typography floors, safe-area-aware width growth, height tiers, right-edge receipt anchoring, and fail-closed confirmation-sheet sizing.
- `StudioFoundingCardHud`: profile -> review -> explicit confirmation layering, local retained state, refusal text, commit-arm law, and no commit on selection/double-click.
- `StudioApplicantPortraitTests` and `StudioFoundingPresentationTests`: live portrait isolation, readability, responsive card bounds, commit-under-cursor prevention, and pointer shielding patterns.
- CP10A dossier hierarchy: portrait, role/OVR, genre signal, strengths/concern, employment economics, and explicit next action.

### DO NOT COUPLE

- Do not make Casting depend on `StudioFoundingCardHud`, `StudioFoundingGatePresentation`, `StudioFoundingArrivalSnapshot`, `StudioFoundingGateContracts.ApplicantStableId`, gate pad bodies, founding readiness, or founding offer intents.
- Do not copy founding-only annual salary/signing bonus/term economics into film package cost. P04A must use current contract-vs-freelancer film cost authority.
- Do not turn the CP10A card into a generic domain model. Extract a presentation-neutral dossier/card shell or follow its layout laws.
- Do not implement Package 10's future human-information spine, relationship discovery, or profile persistence.

## 9. Casting workspace engineering anatomy

The minimum viable anatomy is one retained role-first workspace with a stable screenplay header, vertical role rail, candidate list, selected dossier/compare area, and package consequence/commit area. All numerical and legal facts originate in TypeScript.

| Region / field | Current data source | Publication status and required extension |
|---|---|---|
| Screenplay identity | `ReadyScriptPackageView`: `projectId`, concept/title/genre, locked shape/promise/assessment, required sets | Existing in TS/browser; ADD to bridge Casting projection. |
| Locked Writer | screenplay project `writerId` plus Talent name/card facts | Existing; ADD exact locked assignment row. No choice control. |
| Director slot | `GreenlightScriptProjectPayload.directorId`; primary Director pool via browser adapter/employment filters | Candidate pool not in Casting read model; ADD projected Director candidates. |
| Lead / Antagonist / Support | `CastSlot`, `candidatePools`, final Greenlight cast | Actor candidates exist narrowly; EXTEND with full safe card facts and keep pools role-specific. |
| Production/Craft Lead | `craftIds`, engaged-economy exactly-one check | Candidate pool not in Casting read model; ADD projected Craft candidates and exact role label. |
| Candidate list | `assignmentCard` inputs, `CastingCandidateView`, employment selectors | Promote/extract to shared projection. Use exact talent IDs; names are display only. |
| Selected candidate | Transient client draft keyed by slot and talent ID | ADD Unity presentation state. It is not authoritative and creates no hold. |
| Comparison | Same projected candidate rows aligned for current role | ADD Unity layout/state only. No new score. |
| Fit | `projectFit(state, talent, shape, role/slot)` | Existing authority; ADD exact-slot value and non-exhaustive disclosure. |
| OVR | `roleOVR` | Existing authority; ADD role-appropriate value. |
| Star Power | perceived fame / adapter `assignmentCard.starPower` | Existing authority; ADD distinct field. |
| Availability | `busyTalentIds`, contract/freelancer market, `assignableForFilm` | Existing authority; ADD status, current holder/work, and blocker/remedy. Revalidate after every revision. |
| Contract/package cost | `activeContract`, `freelancerFee`, adapter `assignmentProjectCost` | Existing authority but not shared projection; ADD exact current amount and cost basis. |
| Evidence | `CastingSession.results`, `AuditionEvidenceView` | Existing; EXTEND with session ID, tested week, tested role, and historical/current separation. |
| Fit evidence/signals | `shapeFitReasons` plus safe perceived fields | Not a Core contract; ADD structured public signals and fixed disclosure. |
| Blocker | `ScriptPackageAvailabilityView.blockers`, exact quote blockers, rejection facts | Generic blockers exist; ADD exact-draft blockers. |
| Package readiness | `knownGatesClear`, `canSubmitGreenlightIntent`, exact draft validation | Generic only; ADD exact proposed-package completeness/legality. |
| Consequence preview | `packageFit`, confidence, forecast, fees, `commitmentPreview`, queue state | Browser only; ADD pure authoritative quote. |

Suggested projection sketch, not a required protocol design:

```ts
type CastingWorkspaceView = {
  project: ReadyPackageIdentity
  sourceRevision: number
  slots: {
    writer: LockedAssignmentView
    director: RoleCandidatePoolView
    lead: RoleCandidatePoolView
    antagonist: RoleCandidatePoolView
    support: RoleCandidatePoolView
    craftLead: RoleCandidatePoolView
  }
  cameraTest: CameraTestWorkspaceView
  packageAvailability: GenericPackageAvailabilityView
}

type PackageDraftQuote = {
  projectId: string
  sourceRevision: number
  normalizedDraft: ExactPackageDraft
  assignments: AssignmentAssessmentView[]
  consequences: GreenlightConsequenceView
  blockers: PackageBlockerView[]
  intent: StudioBridgeIntentOption | null
}
```

The quote response should normalize exact IDs, not names; identify current revision; distinguish “commits now” from “joins queue with no commitment”; and return `intent = null` whenever the exact draft is incomplete or illegal.

## 10. Camera Test engineering anatomy

### Existing law and exact functions

1. `assertCastingSlateLaw` validates six role reads: two different Actors for each of Lead, Antagonist, and Support; at least three unique Actors overall.
2. `assertCastingSlateEligibility` validates exact project Writer exclusion, primary Actor role, current employment/market eligibility, and ordinary busy conflicts.
3. `allocateCastingReservation` takes one free slot from the same union used by screenplay and production Development.
4. `startCastingSession` creates an immutable session at current week with `dueWeek = week + 1`, no results, and one reservation.
5. `tick` calls `completeDueCastingSessions` at the authoritative week boundary.
6. `auditionObservation` evaluates exact-role actual execution plus a deterministic keyed noisy observation, producing `estimate`, `low`, and `high`.
7. `completeDueCastingSessions` persists all six results, changes the session to `review`, and releases capacity.
8. `acknowledgeCastingSession` changes `review` to `complete`; it does not pick or assign talent.
9. `assertCastingSessionsInvariants` and save validation protect lifecycle, slate/result equality, IDs, cross-references, and reservation collisions.

### Match to Package 04

| Package 04 rule | Current code | Delta |
|---|---|---|
| Optional evidence | Direct Package stays legal before a session in `castingSessionsReadModel` / script read model | Domain matches. Current bridge incorrectly makes reviewed auditions a Greenlight prerequisite. |
| Six reads, two per actor role | `assertCastingSlateLaw` | Exact match. |
| At least three unique Actors | `assertCastingSlateLaw` | Exact match. |
| One week | tuning + `startCastingSession` / tick | Exact match. |
| One shared slot | `allocateCastingReservation` over union capacity | Exact match. |
| No automatic winner | Results only; acknowledgement opens a blank package | Exact match. |
| No assignment, hold, or fee | Session owns only slate/reservation/results | Exact match. |
| Deterministic uncertain evidence | keyed `casting-v1` Gaussian and stored Est/range | Exact match. |
| Evidence survives later unavailability | candidate/read-model behavior and save | Exact match. Add explicit freshness/provenance fields. |

### Required P04A seam

Current bridge start-auditions intent is auto-authored. Add a player-authored slate quote/intent that:

- receives exactly six talent IDs grouped by role and the exact project ID;
- validates against the current revision and current candidate facts in TypeScript;
- publishes the one-week/no-fee/no-hold/shared-slot consequences and queue outcome;
- returns candidate-specific blockers without mutating state;
- mints an opaque start intent only when non-capacity law is legal;
- submits through the existing command and queue path;
- invalidates when any selected ID or authoritative revision changes.

### Presence and spectacle

`src/core/presence.ts` already projects the exact auditioning slate as `engagement: 'casting'`, `credit: 'auditionee'`, at the Development & Casting facility. It explicitly invents no casting staff. `StudioBridgePresentation.ApplyPeople` already routes that authority presence to the Casting zone. Extend this route for a clear Camera Test tableau if presentation quality needs it, but keep the participant identities and active week exact. Decorative casting applicants/clerk may support atmosphere only; they are not the six reads.

There is no result-time physical winner, assignment, or post-test presence law. When the session reaches review, the authoritative auditionee engagement ends; the stored evidence remains in the workspace/save.

## 11. Greenlight transaction anatomy

### Existing single transaction

The safest implementation path is to preserve the existing one-transition Greenlight:

```text
local transient draft
  -> TS exact-draft quote at revision R
  -> projected assignment/package/finance/capacity consequences
  -> player opens deliberate confirmation
  -> opaque intent submitted with expected revision R
  -> BridgeSession re-resolves the exact current intent
  -> applyGreenlightScriptProject
       -> applyGreenlight
       -> addManagedProductionWorkflow
       -> assertNoDoubleBookedResourceSlots
  -> either one successor state or no successor state
  -> accepted successor projection identifies queued or formed outcome
```

`src/core/actions.ts` owns `applyGreenlight`, `applyGreenlightScriptProject`, `applyGreenlightScriptProjectNow`, `admitOrQueue`, and queue admission through `commitQueuedIntent`. `src/core/operations.ts` owns `addManagedProductionWorkflow`.

Before returning a successor state, the path revalidates:

- an exact managed Ready screenplay and its locked concept, Writer, shape, promise, and assessment;
- a completed/acknowledged Casting session if one exists (an active or review session blocks);
- studio founding;
- exact role/discipline capability and all-assignment uniqueness;
- current production and screenplay busy conflicts;
- exact one Production/Craft Lead in the engaged economy;
- contract or current freelancer-market eligibility;
- current freelancer fees and immediate solvency;
- collision-safe production identity;
- Development & Casting capacity.

On success the same immutable transition creates:

- the Production with exact Writer, Director, Lead, Antagonist, Support, Craft Lead, budget, start tick, remaining ticks, and locked forecast/participant snapshot;
- cash debit and ledger attribution;
- the managed production workflow and its initial Development reservation;
- studio events;
- the screenplay-to-production link.

Although intermediate objects are calculated locally inside `applyGreenlight`, no partial state is observable. A throw returns no successor; `BridgeSession.command` commits session state/revision/journal only after successful application and successor snapshot construction. `applyActions` finishes with `assertNoDoubleBookedResourceSlots`. P04A must not split this into “assign cast,” “charge cash,” “reserve room,” and “create production” client operations.

### Queue outcome

Only `QueueableCapacityRefusal` is admitted to the queue. `queueGreenlightScriptProject` stores the exact payload but creates no Production ID, charge, ledger entry, assignment/hold, or reservation. `commitQueuedIntent` later runs the same authoritative Greenlight against then-current state:

- capacity still unavailable -> remain waiting;
- capacity available and package still legal -> atomically form;
- any non-capacity illegality -> expire/refuse with the engine reason.

The preview must distinguish:

```text
COMMITS NOW
  exact immediate commitment and production formation

JOINS QUEUE
  commits nothing now; every package fact will be revalidated on admission
```

### Exact preview seam

`ScriptPackageAvailabilityView` and `ReadyScriptPackageView` are supply-level advisory views. They do not validate a chosen exact draft. The new pure quote should reuse the final transaction's validation inputs and lower-level assessment/economy functions. It should return:

- exact normalized assignments and costs;
- cash before, immediate commitment, cash after if admitted now;
- queue-now versus form-now outcome;
- per-assignment Fit/EP, strongest/weakest, uncertainty, and forecast range;
- required-set demand as information, not a gate;
- exact blockers/remedies;
- one revision-bound opaque `greenlightPicture` intent only when legal or capacity-queueable.

The quote is advisory until commit. The final command always revalidates. Do not use post-commit `greenlightAssessment` as the quote and do not predict the Production ID in Unity.

### Formation receipt

Reuse the browser's fail-closed method from `ui/src/lot/snapshot/productionFormation.ts`: compare exact before/after authoritative snapshots and require one unambiguous new Production plus the expected screenplay link, workflow/reservation, ledger consequence, and person/operation joins. Implement the equivalent selector against generated Unity DTOs/store after the schema exposes the needed identity facts. If the result is queued or any join is ambiguous, show a queued/neutral receipt rather than guessing formation.

## 12. Financial integration points

P04A should expose only existing V1 economic law.

| Value | Existing source | P04A treatment |
|---|---|---|
| Negative / production budget | Ready screenplay `requiredNegative`, Greenlight payload budget, browser `marketingMenu` / budget step | Publish the permitted current choices and exact selected amount from TS. Do not define new budget law. |
| Marketing commitment | `GreenlightScriptProjectPayload.budget.marketing` and existing browser menu | Publish current V1 choice/amount. Any richer marketing planning is PACKAGE 11 INTEGRATION POINT. |
| Contracted assignment cost | `activeContract`; engaged Greenlight charges no new film fee for contracted staff | Label honestly as contracted/current payroll, with zero immediate package fee. Do not convert annual/payroll facts into a new film fee. |
| Freelancer assignment cost | `freelancerFee`; browser `assignmentProjectCost` | Publish the exact one-film fee per assignment and total from shared TypeScript. |
| Immediate package commitment | negative + marketing + current freelancer fees in engaged economy | Publish exact breakdown and total from the quote. Do not use legacy salary-sum logic in managed mode. |
| Cash | `state.studio.cash`; `src/core/economyView.ts` — `commitmentPreview` | Publish cash before/after and affordability/refusal. |
| Known commitments / weekly burn / runway | `commitmentPreview` and treasury projection | Use only the existing values already defined. Portfolio-wide future refinements are PACKAGE 11 INTEGRATION POINT. |
| Fit/confidence/forecast and break-even | `filmPackage.ts` assessment functions and browser summary | Publish existing ranges/disclosures; do not promise a deterministic result. Richer executive finance synthesis is PACKAGE 11 INTEGRATION POINT. |
| Queue effect | production queue law | Explicitly show zero immediate charge/hold/identity while waiting. |

The immediate-cost assembly currently lives partly in `ui/src/engine/adapter.ts`. It should be extracted/promoted to a shared TypeScript projection helper so Core quote, browser, bridge, and tests use the same mode-aware result. Unity must not sum fees, payroll, negative, marketing, or commitments.

Missing future financing, debt, distribution, portfolio exposure, or executive forecast fields are **PACKAGE 11 INTEGRATION POINT**. They do not block the Package 04 V1 package/Greenlight flow.

## 13. World-presentation integration

### Casting belongs to the lot already

- Reuse the authored `casting` building and its six activity-zone points from `StudioLotArchitectureAuthoring.BuildCasting`.
- Reuse its `StudioLocationBinding`, `SelectableEntity`, selection ring/collider, and `StudioBridgePresentation.ApplyBuildingStates` exact property join.
- Extend TypeScript building attention so Ready/direct-package, Camera Test running, results ready, package blocked, and package-ready-to-commit have explicit authoritative states and primary actions.
- Reuse `TryResolveBuildingAmbient` / `ApplyAmbientDepartment` to make Casting visibly active without inventing staff.
- Copy the restrained attention patterns from `StudioFoundingBeaconHud` and the founding pennant only if an off-screen/world beacon is required. Build a neutral shared attention component; do not couple to founding or auto-focus the camera.

### Exact people/body joins

`src/core/presence.ts` already carries exact authority participation. Its precedence is production > script > casting > roster; auditioning sessions project slate members as auditionees; no casting director exists in state and none is invented. Unity `StudioBridgePresentation.ApplyPeople` joins canonical person IDs to `StudioPresencePersonSnapshot`, resolves the facility/zone, and uses authoritative presentation slots. Reuse that path.

P04A may need narrow presentation APIs from `StudioBridgePresentation` to resolve/select/Locate an exact current talent ID. Add those to the existing identity binder; do not create a candidate body dictionary in the workspace.

### Decorative extras

`presentation-applicant-01`, `presentation-applicant-02`, `presentation-applicant-03`, and `presentation-casting-clerk` are synthetic ambience authored by `StudioLotActivityAuthoring.BuildPeople`. The check-in table, sheets, and coffee urn from `BuildServiceAndCastingEvidence` are also decoration. They may make Casting read as active, but:

- they are never candidate identities;
- they never satisfy a slate or presence count;
- the clerk is not a modelled Casting employee;
- they cannot be selected into a Camera Test or package;
- their animation cannot imply an authoritative result.

### Camera Test spectacle

Use exact auditionee presence during the one authoritative active week. A bounded presentation controller may arrange the current bodies around existing Casting marks, using the fail-closed identity and decorative-only patterns of `StudioShootingDayLotPresentation` / `StudioStageProductionPresentation`. The spectacle must be driven by an explicit current session/presence projection, remain cosmetic, and disappear when authority leaves `auditioning`.

### Post-Greenlight presentation

After atomic formation, reuse `StudioStageProductionPresentation`, `StudioProductionRolePresentation`, company member projections, and ordinary `StudioBridgePresentation` refresh. Do not spawn a separate P04 production-company visual layer. Required sets remain informational until downstream production law places/reserves work.

## 14. Save/reconnect implications

### Core save

`src/core/save.ts` currently writes and validates `SaveFileV14` through `makeSaveV14`, `makeSave`, `loadSave`, and `exportSave`, with closed V1-V14 migrations. Casting entered persistence at V10; V14 already contains:

- Casting mode and canonical session IDs;
- exact project/slate;
- lifecycle status and dates;
- active reservation when auditioning;
- exact six persisted results when complete;
- production queue entries, including queued Camera Test and Greenlight payloads.

`tests/casting-sessions-save-v10.test.ts` proves exact lifecycle bytes and rejects malformed evidence, IDs, cross-references, lifecycle disagreement, and slot collisions. A projection-only P04A plus transient package draft needs no save-version bump. If implementation proposes persistent draft state, stop: that is a product/save-law expansion not approved by Package 04.

### Explicit save versus runtime continuity

- `BridgeSession.save` creates/updates the explicit game save and does not advance state revision.
- `BridgeSession.load` applies the explicit save and advances revision.
- `BridgeSession.exportRuntimeCheckpoint` / `fromRuntimeCheckpoint` preserve the live current state, explicit save slot, logical session ID, revision, and complete command journal across process restart.
- The exact same command envelope replays its byte-identical stored response after restart.
- `fromSaveJson` and `rolloverRuntime` establish a new logical session and do not preserve the old command journal; old envelopes must fail `SESSION_MISMATCH`.
- Unity `StudioBridgePendingPost` retains exact immutable POST bytes through ambiguous transport loss; it never fabricates a replacement command.

### Draft behavior

The package draft should be presentation state only. Key it by exact project ID and the authority revision from which its options were built. On poll/reconnect/load:

1. keep selected IDs only while the same logical session/project still exists;
2. join every selected ID against the fresh candidate projection;
3. visibly mark changed availability/cost/evidence;
4. discard any old opaque quote/intent;
5. require a fresh TS quote before confirmation;
6. on a new logical session, reopen from authoritative projection rather than replay an old draft command.

Do not claim that every accepted mutation is explicitly saved. Runtime continuity and the player's explicit save slot are distinct.

## 15. Test map

### TypeScript Core — extend existing tests

| Path | Existing test names / behavior | Recommendation |
|---|---|---|
| `tests/casting-sessions-domain.test.ts` | `enforces exact pairs and the three-person Hall matching guard`; `starts one immutable one-week/no-hold session in the first shared free slot`; `checks primary-role, market/contract, ordinary busy, and writer eligibility atomically`; `completes from isolated keyed streams, persists exact bands, and acknowledges without RNG`; capacity/repeat/three-owner collisions | EXTEND EXISTING TEST for player-authored slate quote parity and candidate going stale before submit. |
| `tests/casting-sessions-actions.test.ts` | optional week/results/review/no hold; Greenlight blocked through Review then blank Package; capacity queue; two-way shared slots; duplicate queued project; direct Package before tests; historical evidence after availability changes | EXTEND EXISTING TEST for direct/no-test bridge path and exact outcome projection. |
| `tests/casting-sessions-save-v10.test.ts` | exact lifecycle round-trip; V9 migration; malformed/extra evidence; IDs/cross-references; lifecycle/result/collision rejection | EXTEND only if authoritative state changes. Projection/transient draft should require no changes except an explicit absence assertion. |
| `tests/film-package-truthfulness.test.ts` | per-assignment/weakest/severe Fit; skill -> Fit/EP; uncertainty; exact delta; OVR invariant/Fit project-specific; sim/UI parity; locked assessment; hidden actual values absent | EXTEND EXISTING TEST for structured public Fit signals, mandatory non-exhaustive disclosure, and quote/commit parity. |
| `tests/actions.test.ts` | exact production/forecast/debit; no RNG/input mutation; identity/distinct/exclusivity; no global cap; max one Greenlight per call | EXTEND EXISTING TEST only for any new validation helper parity; keep final transaction tests intact. |
| `tests/d11-employment.test.ts` | contracted Greenlight has no new salary; exactly one Craft Lead; noncontract/nonmarket refusal; freelancer one-film fee | EXTEND EXISTING TEST for projected candidate economics/quote totals. |
| `tests/d12-economy.test.ts` | immediate commitment above cash is rejected | EXTEND EXISTING TEST for preview/refusal parity. |
| `tests/c2a-m4-queue-admission.test.ts` | Greenlight cash only when granted; duplicate exact screenplay; auditions wait; only capacity queues; illegal-at-dequeue expires; deterministic order | EXTEND EXISTING TEST for quoted “forms now” becoming queued/stale and no partial commitment. |
| `tests/script-projects-actions.test.ts` | Draft -> Rewrite -> Ready -> linked Production -> Produced; collision-safe re-Greenlight identity/ledger | EXTEND EXISTING TEST for exact locked Writer/project identity in quote. |
| `tests/script-read-model.test.ts` | Ready package staffing/capacity blockers and exact-project queued Greenlight suppression | EXTEND EXISTING TEST for the P04 exact candidate/package projection or add a focused new projection test file. |
| `tests/first-film-journey.test.ts` | full audition/package/production chain; blocked and queued routes; concurrent second picture; pure deterministic guidance | EXTEND EXISTING TEST for exact P03 handoff and direct Package attention. |
| `tests/presence-projection.test.ts` | exact audition slate physical presence; production outranks Casting overlap | EXTEND EXISTING TEST for session-specific world spectacle and multi-production isolation. |
| `tests/studio-calendar.test.ts` | shared three-owner capacity; exact due ticks; canonical lowest review ID | EXTEND only if P04 projection adds decision/calendar facts. |

### Bridge, save, reconnect — extend existing tests

| Path | Existing proof | Recommendation |
|---|---|---|
| `tests/bridge.test.ts` | protocol/schema fingerprint; distinct evidenced cast; stale/forged/wrong-session/reused IDs unchanged; all rejection codes; opaque identity invalidation; save/load/reconnect; polling save-neutral; queued auditions; queued Greenlight with no commitment | EXTEND EXISTING TEST first: player-authored slate, direct Package, exact draft quote, every choice invalidates intent, duplicate submit byte replay, two simultaneous projects. |
| `tests/bridge-schema.test.ts` | recursively closed schema, real envelope validation, extra-property rejection, refusal shape, generated C# parity | EXTEND EXISTING TEST for closed Casting/package DTOs and choice/quote request/response. |
| `tests/bridge-runtime-session.test.ts` | untouched authority/revision/digest restore; accepted command byte replay; command/save/load journal | EXTEND EXISTING TEST for quoted intent replay/invalidation; draft itself remains absent. |
| `tests/bridge-runtime-checkpoint.test.ts` | canonical closed checkpoint, route-specific journal identity, revision ordering, accepted save validation | EXTEND only if a new quote route participates in the durable journal. |
| `tests/bridge-process-restart.test.ts` | exact HTTP replay after SIGKILL, post-commit marker, exact-vs-semantic replay | EXTEND for one ambiguous Greenlight submit after a quote. |
| `tests/save.test.ts` | export/import/export byte identity, valid load, version/seed/cache refusals | EXTEND with “no transient package draft serialized” only if useful. |

### Browser oracle tests — preserve as behavioral proof

- `ui/src/screens/casting-sessions-ui.test.tsx`: direct Package optionality; exact slate/no-fee/no-hold; capacity/availability changes; Est beside Fit; blank Package; historical evidence.
- `ui/src/screens/audition-payoff.test.tsx`: role-bound evidence, auditioned-first ordering without preselection/commitment.
- `ui/src/lot/LotAuditionWorkspace.test.tsx`: retained planner, focus/Escape/scroll/scrim, rejection/edit, committed receipt.
- `ui/src/lot/snapshot/auditionPlanning.test.ts`: strict current context and exact six-read payload/receipt/stale rejection/save replay.
- `ui/src/lot/LotCastingReviewPanel.test.tsx`: six rows, package truth, duplicate input, boundary invalidation, refusals.
- `ui/src/lot/snapshot/castingReview.test.ts`: canonical rows/blockers/successor/stale action.
- `ui/src/lot/WorldFirstLotRetainedAuditionPlanningAppAuthority.test.tsx`: one mounted lot, exact-once submit, rejection retry only after revised slate, stale closure containment.
- `ui/src/lot/WorldFirstLotNativeCastingReviewAppAuthority.test.tsx`: review -> Package, queued Greenlight, accepted formation, refusal retry/autosave host behavior.
- `ui/src/lot/WorldFirstGreenlightProductionFormation.test.tsx`: exact formation identity, same-title/second-picture isolation, no replay/guess.
- `ui/src/screens/AssemblySurface.test.tsx`, `AssemblyFormationReceipt.test.tsx`, `assembly-legality.test.tsx`: local draft, deliberate Greenlight, formation receipt, legality/rejection retention.
- `ui/src/screens/film-package.test.tsx`: hidden-data non-leak, Fit-over-fame ordering, candidate filters, exact package delta.
- `ui/src/lot/LotRetainedWorkspace.test.tsx`: retained lot/workspace behavior.
- `ui/src/lot/buildingInspector.test.ts`: shared Development/Casting occupancy and current Casting actions.

These browser tests remain oracle tests. P04A should not make Unity depend on React components.

### Unity — extend existing or add focused tests

| Path / exact current test | Recommendation |
|---|---|
| `StudioBridgeProtocolTests.cs` — `CommandSerialization_EchoesOpaqueIntentAndNeverStatePatches`, `ProjectionStore_AppliesAtomicallyAcrossPollsConflictsAndSessionEpochs`, `StableIdCache_CreatesUpdatesAndRemovesWithoutIndexIdentity` | EXTEND EXISTING TEST for generated Casting DTO/store identity and atomic refresh. |
| `StudioBridgePresentationIdentityTests.cs` — `BuildingAndStageStates_KeepExactPropertyLabelAndUsefulLiveStatus`, `ZoneResolution_JoinsStageAndPlacementIdentityAndWithholdsUnknowns`, `AuthoritativePeople_UseRoleFamilySlotsAndRequireAVisiblePhysicalZone` | EXTEND EXISTING TEST for exact Casting attention/presence and post-P03 facility routing. |
| `StudioBridgePendingPostTests.cs` — `Lifecycle_ReusesTheSameEnvelopeAcrossRepeatedTransportLoss`, `ResponseJoin_FailsClosedOnContradictoryAuthority` | EXTEND EXISTING TEST for Camera Test/Greenlight opaque submission. There should still be one commit operation, not assign/unassign mutations. |
| `StudioRejectionRetentionTests.cs` — `SameSessionPollsRetainNoticeButOnlyExactAuthorityStateCanRenderIt`, `AuthorityGuidanceIsStoredVerbatimWithoutClientInference` | EXTEND EXISTING TEST for workspace quote/commit refusal. |
| `StudioBridgePlayerWorkflowTests.cs` — `CastChoiceHeading_RequiresReviewedAuditionsAndMultipleDistinctGreenlights` | Replace/retire only the raw memo presentation assertion when the workspace supersedes it; retain opaque workflow evidence coverage. |
| `StudioApplicantPortraitTests.cs` — `PortraitApi_IsTheExactSeamTheCardCalls`, `PortraitSource_RendersLiveAndTouchesNothingElse` | EXTEND EXISTING TEST after genericizing portrait service. |
| `StudioFoundingPresentationTests.cs` — `ProfileCard_IsThePlayerCardTheOwnerRuledFor`, `CardRect_StacksAboveTheReceiptOrDoesNotExist`, `CommitSheets_NeverVanishAtAnySupportedHeight`, `Beacon_StandsDownForAnySelectionAndShieldsTheDoubleClick` | COPY TEST PATTERN into new Casting workspace tests; do not couple founding tests to P04. |
| `StudioSelectionSemanticsTests.cs` — person-first and occlusion proofs | EXTEND EXISTING TEST for canonical Casting bodies and exact-ID Locate. |
| `StudioCameraPresentationTests.cs` — `Director_ChangesOnlyCinemachinePriorityAndManagementInputMode`, receipt/back geometry | ADD NEW TEST for exact origin/context Back, explicit Locate, no camera hijack, and responsive workspace avoidance. |
| `StudioLivingTimeTests.cs` — `ControllerSource_SchedulesOnlyThroughTheClientSeamAndStartsPaused`, `Classify_RollsOnlyOnAdvanceWeekAndFailsClosed` | EXTEND EXISTING TEST for Camera Test decision/pause behavior; no local Camera Test timer. |
| `StudioShootingDayLotPresentationTests.cs` — decorative-only/bootstrap-once proof | COPY TEST PATTERN into a new Camera Test spectacle test. |
| `StudioSceneContractTests.cs` — canonical marker/authoring proof | EXTEND after P03A seals the Development/Casting physical contract. |

ADD NEW UNITY TESTS for the retained role-first workspace, responsive candidate dossier/comparison, exact draft preservation/revalidation, armed Greenlight confirmation, queued-vs-formed receipt, and multi-project isolation. No current Unity test proves those behaviors.

## 16. Suggested implementation waves

These waves deliberately front-load authority/protocol work. A Unity workspace cannot be implemented safely from the current projection.

### Wave 0 — P03A seam adoption and delta refresh

- **Likely files inspected/touched:** only P03A-changed read model, bridge schema/session/generated DTO, and Unity shared workspace/selection/camera files listed in section 20.
- **Dependencies:** sealed P03A SHAs and clean campaign baselines.
- **Tests:** P03 boundary, schema parity, retained origin/Back.
- **Risk:** HIGH collision if P04 starts a parallel quote/workspace mechanism.
- **Stop condition:** exact P03 reusable choice/quote, inspector/workspace, and origin APIs are recorded; unchanged P04 findings are not reworked.

### Wave 1 — TypeScript Casting/package projection and exact-draft quote

- **Likely files:** `src/core/castingReadModel.ts`; `src/core/scriptReadModel.ts`; `src/core/filmPackage.ts` only for safe selector extraction; `src/core/economyView.ts`; likely one new focused Casting/package projection module; projection tests.
- **Dependencies:** P03 quote/refusal shape if present; Package 04 disclosure language.
- **Tests:** casting domain/actions, film-package truthfulness, employment/economy, script read model, hidden-info negative tests.
- **Risk:** HIGH hidden-information leak or duplicate cost/Fit logic.
- **Stop condition:** one pure closed view publishes every workspace field and one exact draft quote matches final validation/cost consequences without mutation.

### Wave 2 — Bridge choice-to-opaque-intent extension

- **Likely files:** `bridge/schema/bridge-schema.ts`, `bridge/schema/project-studio-bridge.schema.json`, `bridge/schema/runtime.ts`, `bridge/session.ts`, `scripts/generate-bridge-contract.ts` outputs; bridge/schema/runtime tests.
- **Dependencies:** Wave 1; P03-selected request mechanism.
- **Tests:** player-authored slate/direct package, choice invalidation, stale revision, duplicate command replay, closed schema, reconnect.
- **Risk:** HIGH if automation auto-choice becomes UI authority or quote identity is not bound to every choice/revision.
- **Stop condition:** exact player slate/package produces a fresh opaque intent; any changed choice/state invalidates it; existing submission/replay/refusal behavior remains green.

### Wave 3 — Casting building inspector, attention, and retained workspace shell

- **Likely files:** generated Unity DTOs; `StudioSnapshotStateCache.cs`; `StudioBridgePresentation.cs`; `StudioBridgeBootstrap.cs`; P03 shared workspace/inspector; `StudioCameraInput.cs`; `StudioSelectionManager.cs`; attention component/tests.
- **Dependencies:** Waves 1-2 and P03 retained host/origin stack.
- **Tests:** generated contract/store, exact building state, pointer capture, one mounted workspace, exact Back/no camera move.
- **Risk:** HIGH P03 collision and camera/context regression.
- **Stop condition:** selecting `casting` opens one retained workspace on exact project truth; Back restores one layer/context; attention selects but never hijacks camera.

### Wave 4 — Role-first candidate dossier, assignment, and comparison

- **Likely files:** new Casting workspace/dossier presentation classes; generalized portrait service; shared layout contracts; projection-store selectors; Unity tests.
- **Dependencies:** full candidate view and exact stable IDs.
- **Tests:** responsive widths/heights, duplicate names, role-specific Fit/evidence, unavailable candidate, comparison alignment, local draft persistence across harmless refresh.
- **Risk:** HIGH duplicate Fit/availability calculation or candidate identity mismatch.
- **Stop condition:** every role is inspectable/assignable from projected facts; comparison invents no score; incomplete/revised drafts never submit.

### Wave 5 — Player-authored Camera Tests and world presence

- **Likely files:** Casting workspace test-planning/review layers; quote client seam; `StudioBridgePresentation.cs` exact person resolver; optional bounded Camera Test spectacle; bootstrap/tests.
- **Dependencies:** Wave 2 slate intent; presence projection; existing week controller.
- **Tests:** exact six reads, min unique, one submit, one shared slot/week, queue, no hold/fee/winner, saved evidence, exact bodies only, decision pause.
- **Risk:** HIGH accidental client simulation or ambient/authority identity collision.
- **Stop condition:** exact selected slate starts/queues authoritatively, active bodies match authority, results persist and return to the same role-first workspace without selecting a winner.

### Wave 6 — Greenlight consequence preview and atomic commit

- **Likely files:** workspace preview/confirmation/receipt; `StudioBridgeClient` typed quote transport if needed; projection selectors; no new Core commit path.
- **Dependencies:** Wave 1 exact quote, Wave 2 intent, current `applyGreenlightScriptProject`.
- **Tests:** preview/commit parity, current vs queued copy, stale draft, affordability, duplicate gesture/retry, late refusal no partial effects, exact formation receipt.
- **Risk:** HIGH non-atomic client choreography or accidental commit.
- **Stop condition:** only an armed explicit confirmation submits one opaque intent; accepted state is exactly queued or exactly formed; refusal retains draft and authoritative remedy.

### Wave 7 — Production handoff and restrained world spectacle

- **Likely files:** existing production/presence presentation only where a new exact join is required; no simulation files.
- **Dependencies:** accepted formation projection and exact company IDs.
- **Tests:** exact production/company/stage join, same-title/multi-production isolation, decorative-only spectacle.
- **Risk:** MEDIUM early/guessed company presentation.
- **Stop condition:** accepted formation flows through existing production presentation; queued/rejected outcomes spawn nothing authoritative.

### Wave 8 — responsive, save/reconnect, and regression seal

- **Likely files:** Casting layout/tests, bridge/runtime tests, possibly proof runner; no save schema unless authority actually changed.
- **Dependencies:** all prior waves.
- **Tests:** supported aspect/safe-area bands, pointer shielding, Back/scroll retention, process restart, explicit save/load, stale session, duplicate submit, two projects/titles, all relevant TS/browser/Unity suites.
- **Risk:** MEDIUM layout/input regressions and false autosave/reconnect assumptions.
- **Stop condition:** responsive and continuity tests pass; tracked worktree contains only intended P04 production/test changes in Fable's implementation lane.

## 17. Risk register

| Rank | Risk | Concrete failure | Mitigation |
|---|---|---|---|
| HIGH | Parallel simulation in Unity | C# decides eligibility, time, capacity, cost, or formation and diverges from Core. | Generated projection only; opaque intent submit; no C# law or state patch payload. |
| HIGH | Duplicate/misleading Fit | Unity or bridge recreates `projectFit`, or UI claims public signals fully explain a score containing undisclosed role-read inputs. | Project authoritative Fit and safe non-exhaustive signals; fixed disclosure; hidden-value negative tests. |
| HIGH | Hidden-information leak | `talent.actual`, actual persona, `teamDirectionPreview`, or inferred ceilings cross the wire. | Closed explicit view types; serialize-negative tests scanning fixtures/JSON; no generic Talent serialization. |
| HIGH | Stale package draft | Actor becomes busy or leaves freelancer market, fee/cash/capacity changes, but old preview commits. | Tag draft/quote with revision; rejoin current IDs; invalidate opaque intent on every state/choice change; final Core revalidation. |
| HIGH | Greenlight non-atomicity | Client separately assigns, charges, reserves, or spawns company before final success. | One existing `applyGreenlightScriptProject` intent only; exact before/after receipt; no optimistic authoritative world mutation. |
| HIGH | P03A collision | P04 creates a second projection quote route, workspace host, inspector, or origin stack. | Wave 0 narrow delta refresh; adopt P03 seam; isolate P04-specific view/content. |
| HIGH | Candidate identity mismatch | Same names, list reorder, body reuse, or applicant-prefixed IDs select the wrong person. | Canonical talent/project/session IDs everywhere; closed set-difference joins; names display-only; no array-index identity. |
| MEDIUM | Incorrect availability | Camera Test slate is treated as a hold; historical evidence is treated as current eligibility. | Publish historical evidence and current availability separately; revalidate at quote, submit, and queue admission. |
| MEDIUM | Primary-role/Core discipline mismatch | Unity widens or narrows candidate pools inconsistently with current V1 read models/final Core. | Reuse TS-published primary pools; final Core validation remains authoritative; pin with tests. |
| MEDIUM | Accidental or duplicate commit | Double-click/repaint or retry issues two different Greenlight commands. | Separate review/armed confirmation geometry; one pending post; exact immutable retry; command-id replay tests. |
| MEDIUM | Camera hijack / broken Back | Opening Casting or accepting Greenlight focuses, snaps Home, or loses previous lot context. | No automatic focus; explicit Locate; shared origin stack; never call `ExitInspection(true)`; camera regression tests. |
| MEDIUM | Browser/Unity divergence | Unity copies React adapter formulas/wording and drifts. | Promote selectors to shared TS projection; browser stays behavioral oracle; both clients consume same view where practical. |
| MEDIUM | Save migration creep | Transient draft is added to GameState, or explicit save is confused with runtime continuity. | Keep draft presentation-only; no save bump for projection; add absence/reconnect tests and accurate copy. |
| MEDIUM | Queue shown as commitment | Player sees cast hired, cash spent, or production formed while waiting. | Quote/receipt explicitly says no commitment; world presentation remains unchanged until authoritative formation. |
| MEDIUM | Presence/ambient identity collision | Decorative applicants or reused founding bodies appear as selected candidates. | Maintain authority/ambient separation; canonical person presence only; fail closed on ambiguous joins. |
| LOW | Stage/set over-gating | Preview blocks Greenlight because a required set/Stage is not ready. | Publish demand as downstream information; reuse current legality; tests assert no invented Stage reservation. |

## 18. Likely files touched

This is a forecast, not an instruction to touch every file.

### TypeScript/Core

- `src/core/castingReadModel.ts` — extend candidate/evidence/workspace publication.
- `src/core/scriptReadModel.ts` — expose exact Ready package identity/generic availability to the shared view.
- `src/core/filmPackage.ts` — only if safe reusable assessment selectors need extraction/export; do not change law casually.
- `src/core/economyView.ts` and/or a shared cost helper — exact immediate commitment projection.
- likely one new focused module such as `src/core/castingPackageReadModel.ts` — exact role pools and draft quote, if P03A has not established the natural shared home.
- `src/core/firstFilmJourney.ts` — only attention/next-action boundary changes not already landed by P03A.
- `src/core/presence.ts` — only if an explicit Camera Test spectacle fact is needed beyond existing auditionee presence.

Core files that should normally remain reused, not redesigned: `castingSessions.ts`, `employment.ts`, `actions.ts`, `operations.ts`, `productionQueue.ts`, `tick.ts`, `save.ts`, `rng.ts`, and tuning.

### Bridge/schema

- `bridge/schema/bridge-schema.ts`
- `bridge/schema/project-studio-bridge.schema.json` through the generator
- `bridge/schema/runtime.ts`
- `bridge/session.ts`
- possibly `bridge/protocol.ts` / `bridge/server.ts` only for an accepted quote route
- `scripts/generate-bridge-contract.ts` outputs, not hand-written duplicate DTOs
- relevant `tests/bridge*.test.ts`

### Browser

No browser production work is required for Unity P04A unless Fable deliberately extracts shared safe selectors from `ui/src/engine/adapter.ts` into Core and updates browser imports. Oracle components should otherwise remain unchanged.

### Unity

- `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs`
- `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs` / `StudioBridgeWireValidator.cs` only as generated/contract needs require
- `Assets/Studio/Runtime/Infrastructure/StudioSnapshotStateCache.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` for typed quote transport/workspace events, while retaining opaque commit
- `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs`
- P03A's shared retained workspace/inspector/origin classes
- `StudioCameraInput.cs`, `StudioSelectionManager.cs`, and camera classes only for missing shared pointer/Locate/origin APIs
- `StudioApplicantPortraitCamera.cs` if generalized
- likely new Casting-specific workspace, card, comparison, confirmation, attention, and optional spectacle presentation classes
- related EditMode tests; scene/authoring only if P03A leaves a genuine physical presentation gap

Do not author a second Casting building. Do not add a parallel UI framework: this baseline uses scene/authoring plus IMGUI components, and P03A may establish the accepted shared retained host.

## 19. Do-not-rebuild list

Fable should absolutely not rebuild:

- Ready screenplay authority or locked Writer facts;
- Casting session IDs/lifecycle and one-session-per-project invariant;
- six-read slate law or primary Actor/current-market eligibility;
- Camera Test RNG, evidence ranges, persistence, week timing, or acknowledgement;
- shared Development & Casting capacity, reservations, or queue admission;
- employment, busy conflicts, freelancer rotation, or fees;
- OVR, exact-role Fit, expected performance, genre experience, Star Power, package Fit, confidence, forecast, or delta formulas;
- Greenlight legality, uniqueness, solvency, ID creation, forecast lock, ledger/cash effects, workflow/reservation creation, screenplay linkage, or transaction atomicity;
- save migrations for existing Casting state;
- bridge revision/digest, opaque intent, idempotency journal, stale-state refusal, reconnect, pending-post, or rejection retention;
- Unity selection, semantic person picking, camera management/inspection, exact building/person presentation binder, living-time controller, or production/stage presentation;
- a new Casting building, candidate body pool, bridge client, polling loop, refusal model, timer, or UI framework;
- browser `Assembly`/React page structure, hidden `TeamDirectionPanel`, or adapter arithmetic in C#;
- Package 10's future human-information spine or Package 11's future finance law.

## 20. P03A collision/delta-refresh list

### High-probability collision surfaces

TypeScript/browser/bridge:

- `src/core/scriptReadModel.ts`
- `src/core/firstFilmJourney.ts`
- `bridge/schema/bridge-schema.ts`
- `bridge/schema/project-studio-bridge.schema.json`
- `bridge/schema/runtime.ts`
- `bridge/session.ts`
- projection version/schema ID and generated DTO workflow
- any P03 TypeScript-owned choice/quote/refusal seam
- browser lot inspector/retained workspace/origin behavior used as oracle

Unity:

- `StudioLotArchitectureAuthoring.cs`, `StudioLotAuthoring.cs`, and `StudioLot.unity`
- `StudioBridgeDtos.Generated.cs`, `StudioBridgeProtocol.cs`, `StudioLotSnapshot.cs`, `StudioSnapshotStateCache.cs`
- `StudioBridgePresentation.cs` and its `facility-development-casting* -> casting` routing
- `StudioBridgeBootstrap.cs`
- `StudioHud.cs`, `StudioCameraInput.cs`, `StudioSelectionManager.cs`
- `TycoonCameraController.cs`, `StudioCameraDirector.cs`, `StudioInspectionTarget.cs`
- shared inspector/retained workspace/origin tests

### Narrow refresh after P03A seal

Do **not** restart this reconnaissance. Diff the newly sealed P03A TS and Unity SHAs against the inspected baselines and update only these seams when they actually changed:

1. Record the new sealed SHAs and changed-path set.
2. Recheck Ready screenplay projection, locked Writer/contributor facts, writer release timing, and exact Accept receipt.
3. Recheck `Ready -> Casting` journey action/site, decision priority, attention, and no-automatic-camera behavior.
4. Adopt P03A's choice/quote/opaque-intent mechanism and refusal vocabulary; remove any P04 recommendation for a parallel route.
5. Adopt P03A's retained workspace, inspector, pointer-capture, selected-project origin, Back, Locate, and person-profile component boundaries.
6. Confirm stable physical IDs for Development (`writers` if sealed) and Casting (`casting`) and re-evaluate `facility-development-casting`, annex, office, and hall zone routing.
7. Rebase protocol/projection/schema versions, generated DTOs, projection store/cache anatomy, and relevant tests.
8. Re-run only affected responsive/camera/selection assumptions and update line/symbol references that moved.

Everything outside that changed-path/seam set remains valid unless a failing test or direct dependency proves otherwise.

## 21. Fable handoff summary

## START HERE

Extend P03A's TypeScript choice/quote seam with a closed Casting workspace view and exact-draft quote; keep Unity presentation-only.

## REUSE THESE

`castingSessions.ts`, `castingReadModel.ts`, employment/talent/package functions, the single Greenlight transaction/queue, bridge revision/replay/refusals, Unity bridge/selection/presence/time/production presentation.

## EXTEND THESE

Casting/package projections, generated bridge DTO/store, Casting building attention/inspector, retained workspace, dossier/compare presentation, exact formation receipt.

## LIKELY NEW SEAMS

Player-selected slate/package -> TS quote -> revision-bound opaque intent; safe non-exhaustive Fit signals; transient exact-ID package draft.

## DO NOT REBUILD

Camera Test law/RNG/time, Fit/OVR/cost/availability, queue, atomic Greenlight, save/reconnect, selection/camera, person or production presentation.

## TEST THESE FIRST

Hidden-info boundary, exact quote/commit parity, stale choice invalidation, duplicate submit replay, direct Package, six chosen reads, queued-vs-formed atomicity.

## WATCH THESE RISKS

P03 collision, hidden Fit inputs, stale drafts, identity mismatch, client-side Greenlight choreography, camera/context loss.

## P03A DELTA TO RECHECK AFTER SEAL

Ready/Casting boundary, shared quote route, retained workspace/origin stack, Development/Casting physical IDs and presence routing, schema/DTO/store versions.
