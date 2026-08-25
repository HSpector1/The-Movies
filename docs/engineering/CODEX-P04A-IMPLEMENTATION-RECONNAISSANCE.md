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

The current bridge is an automation/bootstrap surface, not an interactive Package 04 surface. It auto-selects an audition slate and auto-builds a minimum Greenlight package. Unity must not reproduce or depend on those choices. P03A is now sealed and supplies the missing mutation-free `POST /quote` transport, digest-bound ephemeral intent registry, and retained top-anchored card precedent. P04A must extend those exact seams—not create another quote route, intent registry, command path, or Casting-local simulation.

The remaining implementation work is additive and bounded. P03A intentionally ended at `Development work is complete — continue at Casting.` and implemented no P04 behavior. It did not supply a generic origin/Locate stack or a contained scroll owner. Those are real presentation seams for P04A, not reasons to fork authority or UI architecture.

## POST-P03A DELTA / FINAL PRE-IMPLEMENTATION HARDENING

This section is the controlling delta over the still-valid reconnaissance below. Where older wording conflicts with this section, this section supersedes it.

### Sealed authority and changed paths

| Authority | Exact inspected seal |
|---|---|
| Package 04 design | `ddc4976cd7c947ba513917e6311a697ad4ea6934` |
| P03A TypeScript documentation tip | `4423fe03664701df68e1f44de42b8c15dbe8632c` |
| P03A TypeScript production-code tip | `2ddf080` |
| P03A Unity client | `432c39d4caeacc33bdcd1c60ec5f4ec0a30e6321` |
| Previous P04 TypeScript inspection | `1b3c5271d7314cbd20d0cd28b9481fa3003553b4` |
| Previous P04 Unity inspection | `2e192269504226a2f9b7a2a3082f4a4678968587` |
| Package 09 future-growth authority | `32818e37216892c898486d1741e40fc5987564a6` |
| Package 11 finance authority | `d6c38546d19fbb23533af496e0f62b9c340b7ce5` |

TypeScript changed paths, old inspection → sealed production (`1b3c527` → `2ddf080`):

- added `bridge/development.ts` and `tests/bridge-development.test.ts`;
- changed `bridge/protocol.ts`, `bridge/runtime-checkpoint.ts`, `bridge/runtime/runtime-coordinator.ts`, `bridge/schema/bridge-schema.ts`, `bridge/schema/project-studio-bridge.schema.json`, `bridge/schema/runtime.ts`, `bridge/server.ts`, `bridge/session.ts`, and `generated/unity/StudioBridgeDtos.Generated.cs`;
- changed `src/core/index.ts`, `src/core/scriptReadModel.ts`, `tests/bridge-schema.test.ts`, and `tests/bridge.test.ts`.

The only production-tip → documentation-tip change (`2ddf080` → `4423fe`) is `docs/campaigns/LIVING-LOT.md`, the P03A seal ledger. No additional production behavior hides under the documentation tip.

Unity changed paths, old inspection → seal (`2e192269` → `432c39d`):

- authoring/scene: `StudioLotArchitectureAuthoring.cs`, `StudioLotLandAuthoring.cs`, `StudioSceneValidation.cs`, `StudioLotNavMesh.asset`, and `StudioLot.unity`;
- bridge/data: generated `StudioBridgeDtos.Generated.cs`, `StudioBridgeProtocol.cs`, `StudioLotSnapshot.cs`, and `StudioBridgeClient.cs`;
- presentation/input: `StudioBridgeBootstrap.cs`, `StudioBridgePresentation.cs`, `StudioCameraInput.cs`, and `StudioStageVisualProofRunner.cs`;
- new Development surface: `StudioDevelopmentCardHud.cs`, `StudioDevelopmentJourneyProofRunner.cs`, and `StudioDevelopmentPresentation.cs` with their `.meta` files;
- tests/proof: `StudioBridgeProtocolTests.cs`, new `StudioDevelopmentCardTests.cs`, new `StudioDevelopmentPresentationTests.cs`, and `Tools/p03a-run-development-proof.sh`.

### Unchanged, changed, and superseded findings

Unchanged: Core Casting lifecycle and six-read law; deterministic `casting-v1` evidence; one-week/shared-capacity/no-fee/no-hold semantics; candidate employment/availability; OVR/Fit/package assessment; Greenlight front door, queue, transaction atomicity, save V14 Casting state, browser oracle, and existing Unity selection/presence/production presentation all remain as mapped below.

Changed by P03A: projection is now version 9; Development has a physical `writers` bungalow, named-writer presence, TypeScript-authored board/copy, `/quote`, generated quote DTOs, a top-anchored retained card, pointer shielding, and the shared 0.7-second arm. `Ready to package · <title>` now ends with the exact Casting boundary line.

Superseded:

- “add/prefer a P03 quote route if it lands” → extend the sealed `POST /quote` route;
- “key the local draft to its source revision” → revision invalidates the quote, not the exact-ID player draft;
- “P03 may provide an origin/Locate stack” → it did not; only explicit card-layer Back and same-camera containment landed;
- “projection v8” → protocol v4, projection v9, sealed schema `sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47`, derived by `bridge/protocol.ts::SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`;
- “richer finance is merely a Package 11 integration point” → Package 11 now controls the shared consequence vocabulary and exposes a known recurring-cost truth prerequisite;
- literal `casting` as permanent owner law → `casting` is the current authored presentation target, while semantic capability/placed-facility routing must remain replaceable.

### Exact sealed P03 quote seam to reuse

| Concern | Exact sealed path/symbol | Current fact | P04A decision |
|---|---|---|---|
| Request | `bridge/schema/bridge-schema.ts::StudioBridgeQuoteRequest` / `BridgeQuoteRequest` | `{protocolVersion:4,schemaId,sessionId,commandId,expectedStateRevision,type:'quoteCommission',draft:StudioCommissionDraftPayload}` | EXTEND the request union on the same route. |
| Response | `StudioBridgeQuoteResponse` / `BridgeQuoteResponse` | Accepted response echoes correlation, unchanged revision/week/digest, a typed quote, and `processingMs`. | EXTEND the typed quote union; retain correlation. |
| P03 draft | `StudioCommissionDraftPayload` | Player sends only source/premise or genre/writer, closed creative enum IDs, segment IDs, and promise center indices. | COPY the presentation-choice-only rule. |
| Conversion | `bridge/development.ts::draftToEngine` | Rejoins the live Development board and invokes Core front doors; C# never builds an engine payload. | Add P04 TypeScript converters beside it, not in Unity. |
| Consequence | `commissionQuoteSnapshot` | Derived from a discarded authoritative successor. | Reuse the discarded-preflight pattern, with the stronger purity tests below. |
| Opaque ID | `bridge/session.ts::opaqueIntentId` | Deterministic digest + exact draft derivation; no engine payload crosses the wire. | REUSE, binding every selected ID and budget input. |
| Lifetime | `BridgeSession.pendingQuotes: Map<string, PendingCommissionQuote>` | Session-memory only; capped at 16; absent from save, command journal, and runtime checkpoint. | Widen to one discriminated pending-quote registry. Do not add another registry. |
| Commit lookup | `BridgeSession.quotedIntentFor` | Rechecks current digest and reconverts the stored draft through current authority. | Widen by quote kind; final Core front door still decides. |
| Invalidation | `BridgeSession.command`, `BridgeSession.load` | Every accepted command and load clears all pending quotes. Runtime checkpoint restoration/rollover has none. Rejected commands do not move authority. | Preserve exactly. A save alone does not change authority/revision and need not clear quotes. |
| Route | `bridge/server.ts` `POST /quote` | Calls `runtime.read(session.quote(...))`, not mutation dispatch; success 200, authority refusal 409. | REUSE this only route. |
| Validation/refusal | `bridge/protocol.ts::validateQuote`; existing rejected response | Closed-schema/malformed requests fail `INVALID_COMMAND`; stale/session/schema/protocol and Core illegality use current refusal codes/facts. | REUSE refusal envelope; publish structured P04 blockers in quote projections. |
| Generation | `bridge/schema/project-studio-bridge.schema.json`; `generated/unity/StudioBridgeDtos.Generated.cs`; Unity generated copy | Closed schema and DTOs are generated from the TS contract. | Increment projection/schema normally and regenerate; never hand-edit generated DTOs. |
| Unity transport | `StudioBridgeClient.RequestCommissionQuote`, `PostQuote`, `QuoteAccepted`, `QuoteRejected`, `QuoteUnresolved`, `QuoteInFlight` | Posts `/quote`; deliberately bypasses `StudioBridgePendingPost`; ambiguous failure safely re-asks because quote is pure. | Generalize request/typed events. A quote is not a pending mutation. |
| Unity lifecycle | `StudioDevelopmentCardHud.MaintainQuote`, `CurrentDraft`, `CommitCommission` | Draft edits/revision change drop the quote; current quote becomes an ordinary opaque `SubmitIntent`. | COPY PATTERN, but join P04 quotes by session + revision + digest, not revision alone. |
| Proof | `tests/bridge-development.test.ts` and `StudioDevelopmentCardTests.cs` | Tests quote/commit, stale/malformed/no mutation, hidden-data exclusion, original quote clock, opaque armed dispatch, and quote transport isolation. | EXTEND these generic laws and add focused P04 suites. |

The P03 test names are `quotes, mints, and commits a market commission draft through the quote seam`, `rejects stale and malformed drafts without mutation`, `publishes a leak-free Development board and an exact rewrite preview at review`, and `quotes an original screenplay draft with the engine's own clock`; Unity pins `CardSource_DispatchesOnlyOpaqueIntentsBehindTheSharedArm` and `QuotePlumbing_IsAValidatedReadBesideTheMutationLifecycle`.

Minimum interface direction—illustrative types, not production code:

```ts
type CastingQuoteDraft =
  | {
      kind: 'screenTest'
      projectId: string
      slate: {
        lead: readonly [string, string]
        antagonist: readonly [string, string]
        support: readonly [string, string]
      }
    }
  | {
      kind: 'greenlightPackage'
      projectId: string
      directorId: string
      cast: { lead: string; antagonist: string; support: string }
      craftLeadId: string
      budget: { negative: number; marketing: number }
    }

type StudioBridgeCastingQuoteRequest = {
  protocolVersion: 4
  schemaId: string
  sessionId: string
  commandId: string
  expectedStateRevision: number
  type: 'quoteCasting'
  draft: CastingQuoteDraft
}
```

Add this discriminator to the existing quote request union and process it in `BridgeSession.quote`; do not add `/casting/quote`. The server reconstructs locked screenplay writer/concept/shape/promise from `projectId`. It must reject any client attempt to submit those authoritative facts as truth.

The current `pendingQuotes` value becomes a discriminated `PendingQuote` (`commission`, `screenTest`, `greenlightPackage`) holding the exact validated player draft and mint digest. `quotedIntentFor` branches to TypeScript converters, then returns the existing `IntentApplication`. `/command` remains the only commit route.

### Draft identity, quote freshness, and continuity law

```text
draft identity = projectId + stable selected talent IDs + current local presentation choices
quote freshness = sessionId + lastValidatedRevision + stateDigest + current server-side quote authority
```

A revision change invalidates the quote, not the player's draft. Another project advancing, cash/evidence/availability/fees/capacity or unrelated lot truth changing must keep the exact IDs visible, rejoin them against fresh projection facts, mark what changed, and require a fresh quote. If a selected person becomes illegal, retain that person's identity as `Unavailable now`, show the exact authoritative reason, and block quote/commit until the player replaces or removes them. Never silently clear the package.

The local player draft may survive refresh and transport reconnect while the project and exact IDs still join. The quote/opaque intent does not survive any reconnect boundary, restart/checkpoint restoration, load, accepted command, or logical-session change. Presentation memory is never authority: discard the old quote, rejoin the draft, and request a fresh quote. If an old intent reaches `/command`, `INTENT_NOT_AVAILABLE`, `STALE_REVISION`, or `SESSION_MISMATCH` is safe invalidation; the normal mutation pending-post lifecycle separately resolves any commit whose transport outcome is genuinely ambiguous.

Required focused tests:

- unrelated accepted command changes revision: exact draft IDs remain; quote/intent disappears; fresh facts and quote are required;
- selected talent becomes busy/leaves market or a fee changes: identity remains visible with exact blocker; no quote/commit until repaired;
- cash/evidence/capacity changes: choices remain; consequence changes only after a fresh quote;
- transport reconnect, runtime checkpoint restart, explicit load, and session rollover: draft rejoins, old quote is never replayed, fresh quote required;
- ambiguous `/quote` POST simply re-asks; ambiguous `/command` uses existing immutable-byte reconciliation;
- same-name people and reordered candidate arrays never alter stable-ID choices.

### Quote purity acceptance law

For identical authoritative state/revision plus an identical exact draft, a quote:

- mutates no `GameState`, exported save, explicit save slot, revision, week, simulation RNG, ledger, queue, reservation, contract/hold, cash, Production, workflow, or durable simulation ID;
- creates only bounded ephemeral quote authority in `BridgeSession.pendingQuotes` and no command/save journal row;
- returns deterministic consequence facts; repeated quotes are semantically identical except transport correlation/timing, and the established deterministic digest+draft mechanism may reuse the same opaque `intentId`;
- never substitutes for final validation: `/command` reconverts and calls the existing authoritative mutation path.

Extend `tests/bridge-development.test.ts` for route-generic purity and add P04 cases comparing deep `GameState`, `exportSave`, RNG, IDs/ledger/queue/reservations/contracts/cash, revision/digest, and command-journal state before/after repeated Screen Test and Greenlight quotes.

### P03 retained-workspace/origin/Back reuse classification

| P03 mechanism | Exact path/symbol | P04 classification | Reason |
|---|---|---|---|
| Top-anchored/fail-closed geometry | `StudioDevelopmentCardContracts.WorkspaceRect`, `WorkspaceHeightFor`, `LayerHeight`, `LayerAllowsHeightClamp` | REUSE + HARDEN | Prevents commit-under-cursor; P04 density requires a contained body rather than row dropping. |
| Shared 0.7-second arm | `StudioFoundingCardContracts.CommitArmed`; `StudioDevelopmentCardHud.CommitCommission` | REUSE AS-IS | One arm clock, rechecked in commit method. |
| TypeScript-authored copy/facts | Development DTOs + `StudioDevelopmentContracts.WorldStatus/PennantText` | REUSE AS-IS | Unity renders authority; it does not compose law/copy. |
| Pointer shielding | `StudioDevelopmentCardHud.ContainsScreenPoint`; `StudioCameraInput` Development-card check | REUSE + HARDEN | Generalize to all Casting layers and the contained scroll viewport. |
| Same live lot/camera | card IMGUI over the mounted lot; source tests forbid Focus/selection calls | REUSE AS-IS | Selecting/opening does not hijack camera. |
| Explicit layer Back | `StudioDevelopmentCardHud.BackToDepartment` and Back controls | REUSE + HARDEN | P04 needs dossier → candidate → compare/review → root stack with exact project/role/scroll restoration. |
| ESC behavior | current ESC clears the whole selection | DO NOT PROPAGATE | Dense nested Casting requires containment-safe Back; do not equate ESC with destructive draft clearing. |
| Band growth + optional-row dropping | 620/600 sheets, cap 780/660, tier-based omission | DO NOT PROPAGATE | P04 candidate list/comparison/dossier requires one real contained scroll owner. |
| Score/band hierarchy | tall P03 card makes score dominant and band subordinate | DO NOT PROPAGATE | Package 04 prioritizes evidence/role-read context; preserve approved hierarchy. |
| Evidence density | P03 `whyThisEstimate` can be thin | REUSE + HARDEN | P04 must meet its approved evidence floor without inventing facts. |
| Generic origin/Locate service | none landed | ADD SHARED PRESENTATION SEAM | P03 has a retained card and explicit Back, not a general origin stack or exact Locate API. |
| Proof metadata | Development proof reports do not stamp Git SHA | REUSE + HARDEN | P04 proof reports must stamp TS/Unity SHAs and schema/projection versions. |

P04 presentation law is framework-agnostic above the final renderer: exact-ID draft state, projection joins, quote/refusal/receipt state machine, Back/origin model, scroll ownership, pointer containment, and arm behavior remain required whether the accepted implementation is IMGUI or UI Toolkit. `StudioDevelopmentCardHud` is an IMGUI precedent, not a mandate to migrate or remain. The separate Unity Production Architecture Audit is not accepted authority in this reconnaissance; UI-technology selection remains pending it. Do not independently introduce UI Toolkit, URP, or a parallel framework here.

### Exact Development → Casting boundary after seal

`bridge/development.ts::developmentProjection` publishes `Ready to package · <title>` and the constant `CASTING_BOUNDARY_LINE = 'Development work is complete — continue at Casting.'`. `StudioDevelopmentPresentation` applies this board verbatim to the physical `writers` bungalow. The wire-accessible screenplay memo verbs remain automation/fallback, not player-facing buttons. There is no Casting workspace, package draft, Camera Test planning UI, Greenlight preview, or P04 command authored by P03A. P04 begins by selecting the semantic Casting capability/project from that exact Ready identity.

### Projection/schema/generated DTO position

The sealed contract is protocol v4 and projection v9 (`bridge/schema/bridge-schema.ts::PROTOCOL_VERSION`, `PROJECTION_VERSION`) with schema identity `sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47`. `SCHEMA_ID` is content-derived, not a constant to preserve after change. Development is a required member of `StudioProjectionBundle`. P04A should increment the projection/schema contract once for the closed Casting projection and quote/receipt union, regenerate `bridge/schema/project-studio-bridge.schema.json`, root `generated/unity/StudioBridgeDtos.Generated.cs`, and Unity's generated DTO copy through the existing generator workflow, then update `StudioBridgeProtocol`, `StudioLotSnapshot`, projection-store/cache, and schema parity tests together.

### Package 09 physical-owner future-proofing

Today, Core presence at `facility-development-casting` or its annex resolves through `StudioBridgePresentation.ResolveZoneId` to authored world zone `casting`; placed facilities already route by exact placement `facilityId` → `StudioPlacedFacilitySnapshot.id` → `StudioPropertyBuildingSnapshot.placedFacilityId` → authored building ID via `ResolvePlacedBuildingId`. P03 separately redirects only `engagement === 'script'` from that shared casting zone to the authored `writers` foot approach.

Treat `casting` as today's authored presentation ID, not a permanent domain or capability identifier. Do not spread the string through new Casting DTOs, draft models, workspaces, attention code, or profile routes. Extend/extract the existing facility-to-world-owner resolver so a semantic Casting owner can resolve today's `casting` and a future Package 09 placed Development & Casting facility without rewriting Casting UI. Exact `projectId`, `facilityId`, placement ID, and resolved selected-building ID remain separate. P04A does not implement Package 09 sparse-lot construction.

### Package 11 finance reconciliation

Package 11 supersedes any Casting-specific finance-preview design. Reuse its shared consequence vocabulary and the TypeScript selectors below; Unity calculates none of it.

| P04 financial field | Classification and exact source/seam |
|---|---|
| Immediate Production/negative commitment | EXISTING: `Budget.negative`, `Production.budget`, `applyGreenlight`; publish through a shared consequence projection. |
| Marketing | EXISTING: `Budget.marketing`; immediate Greenlight debit, not a future release duplicate. |
| Freelancer fees | EXISTING: `freelancerFee` and Greenlight ledger rows; contracted talent remains existing payroll. |
| Cash before / after | EXISTING: `economyView.ts::commitmentPreview`; reuse/extend, never subtract in Unity. |
| Current recurring studio cost | EXISTING BUT INCOMPLETE HEADLINE: `weeklyBurn()` currently covers payroll + ordinary overhead but omits charged facility Opex. Reuse only after common truth repair or label/omit the incomplete value explicitly. |
| Recurring delta caused by Greenlight | EXISTING LAW: normally zero; current direct production/marketing/freelancer costs are one-time and contracted payroll is already committed. Omit if not applicable rather than decorative zero. |
| Current-pacing runway | EXISTING RULE / INCOMPLETE INPUT: `runway()`/`runwayOf()` and `commitmentPreview().postRunway`; expose only after facility-Opex repair, otherwise omit or explicitly qualify. |
| Obligations | EXISTING components: `offerObligation`, contracts, production direct commitments, and ledger; Greenlight creates no new contracted guarantee unless a separate contract action does. |
| Forecast / uncertain return | EXISTING player-safe assessment: `forecastProfitRange`/execution projection; separate from cash/receivable, with uncertainty and exclusions. |
| Queue effect | EXISTING: queued Greenlight holds/debits/creates nothing; publish as operational consequence, not finance movement. |

The exact shared selectors to reuse/repair are `src/core/economyView.ts::commitmentPreview`, `weeklyBurn`, `weeklyOverhead`, `runway`, `runwayOf`, and `expectedWeeklyRunRevenue`, plus `src/core/placement.ts::weeklyPlacementOperatingCost` for the already-charged missing component. Package 11's proposed `FinancialConsequencePreview` envelope—subject/action, quote/revision/week, legality/refusal, immediate movement, cash before/after, recurring delta/effective week, operating cost/net pace/runway after, obligations, operational consequence, uncertainty/exclusions—is the common P04 projection shape. Do not create `CastingFinancePreview` arithmetic. The facility-Opex truth repair belongs in shared TypeScript selectors; until available, omission or explicit qualification is preferable to false precision.

### Screen Test no-hold/presence concurrency contract

Current Core law is exact: `castingSessions.ts::assertCastingSlateEligibility` checks legality at start; `startCastingSession` creates one one-week session/reservation but no fee, employment assignment, or person hold; `completeDueCastingSessions` resolves by current session law; evidence persists through `CastingResults`. A candidate is not “busy” merely because a test is active.

`src/core/presence.ts::TIER_RANK` is `{ production: 0, script: 1, casting: 2 }`; `studioPresence.addClaim` keeps the higher-precedence claim and emits at most one `PersonPresence` per talent ID. Unity `StudioBridgePresentation.ApplyPeople` builds `presenceById` with one record per person, calls `ResolveZoneId`, and allocates at most one pooled body. Therefore a stronger engagement preempts the auditionee body without ending or falsifying the Casting session.

Add one hostile Core/bridge/Unity contract:

1. Start legal Screen Tests containing candidate A.
2. While the session remains `auditioning`, use a second Ready project and available shared slot to Greenlight A through the normal `applyGreenlightScriptProject` front door (the session created no busy/hold fact).
3. Assert `studioPresence` contains A once, at production; no duplicate world place/body exists.
4. Assert Casting session/project/one-week due state remains active and the Casting building/session projection still carries activity when A's body is preempted.
5. Advance through normal Core order; session resolves under existing law and stores A's role evidence as history.
6. Assert no contract, hold, busy flag, fee, reservation beyond the one shared Casting slot, or retroactive assignment was invented.

Extend `tests/presence-projection.test.ts` from `claims each person exactly once even when tiers overlap (production outranks casting)`, plus Casting domain/tick/save tests; add a Unity `ApplyPeople`/Casting-session presentation test proving one authoritative body and building-level fallback activity.

### Queued Greenlight expiry identity and recovery

Existing queue law is strong: `ProductionQueueEntry` persists the entire `GreenlightScriptProjectPayload` and `scriptProjectId`; `commitQueuedIntent` calls the same `applyGreenlightScriptProject`; `admitQueuedIntents` retains capacity waits and expires every other refusal with the engine message. No holds or partial commitments occur.

The current expiry witness is insufficient for player recovery. `StudioEvent` / `StudioEventDraft` `queueIntentExpired` carries only `{entryKind, ordinal, reason}`. `queueEntrySubjectId(entry)` can derive the exact screenplay project while the entry still exists, but `queueAdmission.ts` does not persist it and no bridge projection publishes a recoverable expiry notification. Title-only matching is forbidden.

Smallest safe extension:

- add a stable `subjectId` (for `greenlightScriptProject`, exact `projectId`) to `queueIntentExpired` at both cancellation and dequeue, sourced from existing `queueEntrySubjectId(entry)` before removal;
- update `types.ts`, `studioEvents.ts`, `queueAdmission.ts`, `actions.ts` cancel path, exact save codec/migration and queue-event tests; use the next available save version rather than silently widening V14;
- add a closed Casting expiry projection `{eventSeq, queueOrdinal, projectId, title, reason, reviewAction}` by joining current authoritative screenplay identity; `title` is display only;
- Unity dedupes by event sequence/session cursor, routes `[Review package]` by exact `projectId`, and displays `<Title> could not begin production` plus the exact authoritative reason. Missing join fails closed to project ID/context, never generic unexplained expiry.

### Proposed P04 field classification

| Proposed field | Classification | Authority / note |
|---|---|---|
| screenplay/project ID, title, genre, accepted assessment, locked Writer ID/name | EXISTING | `ScriptProject` + `scriptReadModel`; title/name are display joins. |
| role-slot vocabulary and required slots | EXISTING | `GreenlightScriptProjectPayload`, Casting types, engaged Craft invariant. |
| selected role, expanded dossier, pins, sort/filter, scroll offsets, opener/origin | PRESENTATION ONLY | Local UI state; never GameState or quote law. |
| exact-ID package draft and Screen Test slate | PRESENTATION ONLY until quoted | Player choices only; server rejoins and validates. |
| candidate rows for Director/Lead/Antagonist/Support/Craft | NEW PROJECTION | Compose current TS selectors and current authority; no Unity calculations. |
| OVR, exact-role Fit, public/non-exhaustive Fit signals, genre experience, Star Power | NEW PROJECTION from EXISTING selectors | Score may cross; hidden decomposition may not. |
| current availability/conflict/employment/fee | NEW PROJECTION from EXISTING authority | Recomputed per revision; historical evidence is separate. |
| Camera Test lifecycle/slate/results/tested week | NEW PROJECTION from EXISTING persisted state | Results persist as evidence, not availability or winner. |
| structured package blockers/readiness/queue result | NEW PROJECTION | Derived through current Core front doors. |
| quote session/revision/digest/intent, consequence, commit label | NEW PROJECTION over EXISTING P03 seam | Ephemeral and non-journaled. |
| typed formed/queued/expired receipt | NEW PROJECTION/RESPONSE | Exact IDs and no-commitment queue law. |
| finance fields | NEW SHARED CONSEQUENCE PROJECTION | Package 11 vocabulary; current selectors as above. |
| portrait/body token | PRESENTATION ONLY if the existing exact talent/body join supplies it | Do not make visual token talent authority. |
| `Talent.actual`, hidden ceilings, actual persona/temperament decomposition, hidden RNG seeds/streams, formula coefficients, private scoring components, `teamDirectionPreview`, `teamDirectionGuidance` | FORBIDDEN HIDDEN DATA | Must never cross schema/DTO/display. |

### Requirement → authority → seam → test traceability

| Requirement | Existing authority | P04 implementation seam | Existing proof | Required P04 proof |
|---|---|---|---|---|
| Ready handoff | `scriptReadModel`, `firstFilmJourney`, `developmentProjection` | Casting projection keyed by exact project | P03 Development bridge/proof | Ready project opens exact Casting draft; no auto-focus. |
| Six reads/2 per role/3 actors | `assertCastingSlateLaw` | `quoteCasting` Screen Test draft converter | `casting-sessions-domain.test.ts` | Exact chosen slate quote/commit parity and structured refusal. |
| One week/shared slot | `startCastingSession`, allocation, tick completion | project session/queue projection | Casting action/capacity/tick suites | Started/queued consequence and due-week parity. |
| No fee/hold/assignment/winner | Casting Core law | quote/result copy + negative DTO keys | domain/save/read-model tests | State/save/ledger/contracts/busy unchanged; no winner field. |
| Presence precedence | `studioPresence`, `TIER_RANK` | building-level activity + single person join | `presence-projection.test.ts` overlap test | hostile mid-session stronger-engagement case. |
| Candidate truth | employment/talent/package selectors | role-specific candidate projection | film-package/employment tests | hidden-data scan; exact availability/fee/role parity. |
| Draft continuity | stable IDs + fresh projections | local exact-ID draft independent of quote | P03 card revision invalidation | retain choices across changes/reconnect; block stale selection. |
| Pure quote | P03 `BridgeSession.quote` | discriminated quote registry/converters | P03 quote tests | deep GameState/save/RNG/journal/ID neutrality and repeat semantics. |
| Exact Greenlight preview | package/economy/queue front doors | package quote + shared consequence view | D11/D12/film-package tests | quote/commit or quote/queue parity; no incomplete runway claim. |
| Atomic Greenlight | `applyGreenlightScriptProject/Now`, `applyGreenlight` | opaque `/command` only + typed receipt | actions/bridge formation tests | one formed or one queued outcome; refusal changes nothing. |
| Queue expiry recovery | persisted queue + engine refusal | identity-bearing event + Casting notice | `c2a-m4-queue-admission.test.ts` | exact project/title/reason/Review after save/reconnect. |
| Stale/refusal/idempotency | `BridgeSession.command`, journal, pending post | reuse existing envelope/lifecycle | bridge runtime/process tests | stale quote, same-byte retry, changed-command-ID refusal. |
| Back/context/scroll | P03 card + Package 02 laws | shared origin model + contained Casting scroll | Development card geometry tests | nested Back restores project/role/scroll/camera; pointer shield. |
| Save/reconnect | Save V14 Casting + runtime checkpoint | draft local, quote ephemeral, expiry identity persisted | save/runtime tests | restart/load/session cases and no stale quote replay. |

### Exact implementation waves, ownership, and delegation

Section 16 below is the definitive post-delta wave map. Fable remains the sole lead/integrator. Mechanical schema/DTO/test inventory work is appropriate for Haiku/equivalent; bounded TypeScript or Unity component work for Sonnet/equivalent; cross-system projection/transaction/interface decisions and final integration remain Opus/Fable lead work. No second Fable-level agent is recommended.

### Exact do-not-touch/no-go boundary

Unity/player-facing P04 must never receive `Talent.actual`, ceilings, actual persona or temperament decomposition, `teamDirectionPreview`, `teamDirectionGuidance`, hidden RNG seeds/stream keys/state, formula coefficients, or any private scoring component not explicitly approved. Never encode a server payload in display text and parse it back in Unity.

Unity must not reimplement `roleOVR`, `projectFit`, `actorRoleFit`, `temperamentMatch`, `expectedPerformance`, `genreExperience`, `packageFit`, `executionConfidence`, `forecastProfitRange`, `packageDelta`, `busyTalentIds`, `assignableForFilm`, `freelancerFee`, `commitmentPreview`, `assertCastingSlateLaw`, `assertCastingSlateEligibility`, `startCastingSession`, `completeDueCastingSessions`, `queueStartCastingSession`, `commitQueuedIntent`, `applyGreenlightScriptProject`, `applyGreenlight`, `studioPresence`, `tick`, `stream`, `opaqueIntentId`, `authoritativeDigest`, or command-journal/replay/refusal logic.

### Governance and remaining blockers

Package 04 is the accepted design authority for this implementation handoff. Its main report still contains stale proposal-era governance at `## Owner decision status`: “No additional Owner decision is required to begin P04A **after the Owner accepts this Package 04 ruling**.” Do not edit that research report in this pass. The smallest later reconciliation is a status note: accepted design authority; implementation remains subject to current campaign authorization and sealed dependency contracts. Fable must not treat the old conditional wording as an unresolved product decision.

There are no product-law blockers to beginning P04A. The true implementation prerequisites are: (1) decide the accepted Unity renderer with the separate architecture audit without changing framework-agnostic law; (2) repair or qualify/omit facility-Opex-dependent burn/runway before presenting them as complete; (3) add the expiry subject identity if recoverable queued-Greenlight UX ships in the same slice; and (4) implement a shared origin/Locate model plus one contained scroll owner for the dense workspace. These are implementation seams, not reasons to redesign Package 04.

## 2. Inspected baseline

| Item | Inspected value | Notes |
|---|---|---|
| Canonical documentation baseline | `c902a704eb948cc576083d0973c8c23e59937dc1` | Parent of the approved Package 04 documentation commit. |
| Package 04 | `ddc4976cd7c947ba513917e6311a697ad4ea6934` | Contains `CODEX-CASTING-AUDITIONS-PACKAGE-04.md` and Builder Annex. |
| Reconnaissance starting revision | `579a81de58a308db36a0e0b96d78de50a77809c9` | Existing P04 recon updated in place by this hardening pass. |
| TypeScript campaign baseline | `campaign/living-lot-ts` at `1b3c5271d7314cbd20d0cd28b9481fa3003553b4` | Inspected in a clean stable worktree. |
| Unity campaign baseline | `campaign/living-lot-client` at `2e192269504226a2f9b7a2a3082f4a4678968587` | Inspected in a clean stable worktree. |
| Package 02 inputs | Approved world-interaction core and Builder Annex | Used for selection, retained context, Back, camera, attention, and world-presence law. |
| Package 03 sealed inputs | TS `4423fe03664701df68e1f44de42b8c15dbe8632c` (production `2ddf080`); Unity `432c39d4caeacc33bdcd1c60ec5f4ec0a30e6321` | Narrow delta inspected directly; no P03 files changed. |
| Package 09 input | `32818e37216892c898486d1741e40fc5987564a6` | Architecture-only future-proofing; not implemented by P04A. |
| Package 11 input | `d6c38546d19fbb23533af496e0f62b9c340b7ce5` | Shared consequence vocabulary and recurring-cost truth prerequisite. |

This is the post-P03A hardened reconnaissance. Unchanged archaeology below still refers to the original baselines; every changed or superseded seam is resolved in the controlling delta above against the sealed SHAs. Line numbers are intentionally not used as stable identifiers; symbols and test names are the durable handoff.

No TypeScript, Unity, browser production code, tests, assets, saves, dependencies, or tuning were changed for this study.

## 3. Package 04 design-to-code mapping

| Journey step | Existing authority / projection / mutation | Existing browser / Unity / proof | Missing and smallest safe extension | Do not rebuild / P03 collision |
|---|---|---|---|---|
| Ready screenplay | `acceptScriptProject` in `src/core/scriptDevelopment.ts`; `ReadyScriptPackageView`, `readyPackage`, and `packageAvailability` in `src/core/scriptReadModel.ts`; `readyToPackageView` in `src/core/firstFilmJourney.ts`; `bridge/development.ts::CASTING_BOUNDARY_LINE` | Browser lot journey routes Ready work to Casting. Sealed Unity renders `Ready to package · <title>` and `Development work is complete — continue at Casting.` at `writers`; P03 implements no P04 behavior. | Publish the exact Ready screenplay/package identity in the bridge Casting projection. | Do not create Unity screenplay state or extend Development past its sealed boundary. |
| Casting requests attention | Core journey site is semantic `casting`; browser `managedCastingLotCue` and `ui/src/lot/buildingInspector.ts` derive review/running/queued/planning cues | Unity `StudioBridgePresentation.ApplyBuildingStates` consumes TypeScript `attention`/`attentionReason`; current authored owner is `casting`. Ambient Casting extras already stand up only for qualifying authority state. | Extend TypeScript Casting projection and semantic owner routing for direct-Package/blocked-ready attention. | Do not infer urgency from bodies/labels/intents or make the literal current owner permanent law. |
| Select/open Casting | `FirstFilmJourneyNext.site = 'casting'`; browser uses deep Casting routes and retained lot workspaces | Unity selection/camera owns place. P03 supplies `StudioDevelopmentCardHud` as a retained same-camera card but no generic origin/Locate stack. | Add the Casting workspace using P03 card safety and one shared origin/Locate seam for exact building/project restoration. | Do not add another selection/camera system or claim P03 landed a generic navigation stack. |
| Role-first workspace | Writer lock and required roles exist in the screenplay/package payload; fixed actor slots are `lead`, `antagonist`, `support` | Browser `Assembly` has a local reversible draft and `TalentPicker`; it is a wizard, not the approved target. Unity has CP10A dossier/card patterns, not Casting. | Add a TS Casting/package projection and a Unity role-first retained workspace. Keep the draft transient and identity-based. | Do not copy the browser page architecture or persist a package draft as a hold. |
| Inspect candidates | `roleOVR`, `projectFit`, `expectedPerformance`, `genreExperience`, employment and fee helpers exist | Browser `assignmentCard`/`TalentPicker` expose most required facts. Unity CP10A shows OVR, genre, economics, and portrait patterns for founding applicants. | Publish safe, role-specific candidate rows for Director, each actor role, and Craft Lead. Generalize the existing dossier visual pattern without coupling to founding. | Do not calculate or decompose Fit in Unity. Do not expose hidden persona/actual values. |
| Compare candidates | Same TS facts can be aligned by role; `packageDelta` supports before/after package effects | Browser has card sorting and package delta, but no real side-by-side comparison component. Unity has no comparison UI. | Add presentation-only compare selection over already-published candidate rows; any consequences remain TS-projected. | Do not claim an existing comparison implementation. Do not invent a new comparison score. |
| Optional Camera Tests | `startCastingSession`, `completeDueCastingSessions`, `acknowledgeCastingSession`; `castingSessionsReadModel` | Browser planner/review panels implement exact behavior. Unity bridge currently offers only an auto-authored slate intent. | Extend sealed `/quote` with the player-authored six-read draft; publish session/evidence fields. | Do not rebuild law/RNG/clock/fee/hold/winner or create another quote route. |
| Understand OVR/Fit/evidence/Star Power/availability/cost | Authority exists across `talentSummary.ts`, `employment.ts`, `filmPackage.ts`, and adapter selectors | Browser presents these separately. Unity does not currently receive them. | Promote/extract safe selectors into a shared Core/bridge projection with explicit disclosure that Fit contains undisclosed role-read information. | Do not label Fit fully perceived or expose an exhaustive driver formula. |
| Reversible package choices | Core accepts a complete `GreenlightScriptProjectPayload`; no authoritative provisional draft exists | Browser `Assembly` holds local `Draft`, keeps it on refusal, and avoids duplicate gesture submit. | Keep a Unity local draft keyed by project ID + stable talent IDs + local choices; revision tracks quote freshness only. | Do not clear choices on revision change or treat a draft as assignment/hold/expense/save truth. |
| Preview Greenlight | `packageFit`, `executionConfidence`, `forecastProfitRange`, fee helpers, and `commitmentPreview` exist | Browser `FilmPackageSummary`/budget review is oracle; bridge publishes none. | Extend `/quote` with exact package draft and Package 11-compatible shared consequence projection. | No C# arithmetic or Casting-specific finance model; qualify/omit burn/runway until facility Opex is included. |
| Explicit Greenlight | `applyGreenlightScriptProject` / `applyGreenlightScriptProjectNow` call the single `applyGreenlight` transition | Browser preserves draft on refusal and validates exact before/after formation. Unity has exact opaque submission, pending-post, revision, and refusal handling. | Put the minted intent behind an armed, deliberate confirmation sheet; submit once through `StudioBridgeClient`. | Do not send multiple assignment/charge commands or infer acceptance from button press. |
| Production forms atomically | `applyGreenlight` creates the immutable production, cash/ledger, workflow/reservation/events, and screenplay link in one immutable transition; capacity-only admission queues the untouched payload | Browser `acceptedGreenlightFormationReceipt` validates one exact new production and related joins. Unity stage/company presentation consumes authoritative production/company projections after refresh. | Add an exact accepted-vs-queued receipt selector on the Unity side over before/after authority snapshots; fail neutral on ambiguity. | Do not predict production IDs, pre-spawn an authoritative company, debit cash locally, or reserve a Stage. |

## 4. TypeScript reuse map

### Screenplay and role authority

| Concern | Exact path and symbol | Current truth | P04A action |
|---|---|---|---|
| Ready-to-package state | `src/core/scriptDevelopment.ts` — `acceptScriptProject`; `src/core/scriptReadModel.ts` — `STATUS_LABEL`, `projectCard`, `readyPackage` | Acceptance changes the project from `review` to `ready`. The project retains its exact concept, locked shape/promise, assessment, required sets, and writer. | REUSE; publish the exact view to Unity. |
| Locked Writer | `ScriptProject.writerId` and `ReadyScriptPackageView` in `src/core/types.ts` / `src/core/scriptReadModel.ts`; sealed Development board identity | Writer is fixed by the accepted screenplay and is not a package choice; P03 preserves/releases it through current Core lifecycle. | REUSE; render as locked and reconstruct from `projectId`, never client-submitted package truth. |
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

The sealed contract is protocol v4, projection v9, schema `sha256:80f2f0fcd14d1b25e713c2624286a6c05a98c53ea5cfcb2b47612f8c030f5e47`. `SCHEMA_ID` is the content fingerprint produced by `bridge/protocol.ts::schemaIdentity(BRIDGE_SCHEMA)` and changes when the closed contract changes.

| Seam | Current path/symbol | Decision | P04A use |
|---|---|---|---|
| Projection bundle | `bridge/schema/bridge-schema.ts` — `StudioProjectionBundleSchema`; generated JSON in `bridge/schema/project-studio-bridge.schema.json` | EXTEND | Add a closed Casting/package/expiry view beside sealed Development. |
| Runtime validation | `bridge/schema/runtime.ts`, `bridge/schema/canonical.ts` | REUSE / EXTEND generated contract | Keep recursive closed validation and schema fingerprinting. |
| Quote route | `bridge/server.ts` `POST /quote`; `bridge/protocol.ts::validateQuote` | REUSE AS-IS | Add a discriminated P04 request/response to this route; never add another quote endpoint. |
| Quote request/response | `StudioBridgeQuoteRequest`, `StudioBridgeQuoteResponse`, `BridgeQuoteRequest`, `BridgeQuoteResponse` | EXTEND | Preserve correlation/session/revision/digest; add Screen Test and package draft unions. |
| Quote registry | `BridgeSession.pendingQuotes`, `quote`, `quotedIntentFor` | EXTEND | One discriminated ephemeral registry for commission/Screen Test/package. Never checkpoint or journal it. |
| Intent option | `StudioBridgeIntentOption` | REUSE | Keep opaque identity. Do not stuff a simulation payload into the option or display text. |
| Submit command | `StudioBridgeIntentRequest`; `BridgeSession.command` | REUSE AS-IS | `/command` remains the one commit path for one opaque intent. |
| Opaque identity | `opaqueIntentId` | REUSE | Bind exact player draft and authoritative digest; a revision change kills quote authority, not local choices. |
| Revision/digest | `authoritativeDigest`; `BridgeSession.quote/command/load` | REUSE + HARDEN CLIENT JOIN | Quote against current authority; Unity accepts only matching session/revision/digest and current request. |
| Idempotency | `priorResponse` and command journal | REUSE AS-IS | Same command ID + exact envelope replays byte-identically; same ID + different envelope refuses. Quotes do not enter this journal. |
| Refusals | `rejectionFacts` and rejected response schema | REUSE / EXTEND projection blockers | Keep authority refusal structure. Publish exact structured draft blockers before commit; never parse diagnostic copy into law. |
| Reconnect | `bridge/runtime-checkpoint.ts`, `bridge/runtime/*`, Unity pending-post | REUSE WITH SPLIT LAW | Durable commands reconcile; ephemeral quotes are discarded/re-asked; local exact-ID draft may rejoin. |

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

P04 adds typed current blockers to the Casting projection without replacing that envelope:

```ts
type CastingDraftBlocker = {
  code: string
  projectId: string
  role: 'screenTest' | 'director' | 'lead' | 'antagonist' | 'support' | 'craftLead' | 'budget'
  talentId: string | null
  message: string
  currentHolderId: string | null
  remedy: string
}

type OpaqueCastingIntent = {
  intentId: string
  kind: 'startAuditions' | 'greenlightPicture'
  label: string
  detail: string
  projectId: string
}
```

`code` and exact IDs are authority; copy is display. Unity submits only `OpaqueCastingIntent.intentId` in the existing `StudioBridgeIntentRequest`. It never reconstructs the stored Screen Test or Greenlight payload.

Existing refusal codes are `INVALID_JSON`, `INVALID_COMMAND`, `INVALID_CONTROL`, `PROTOCOL_MISMATCH`, `SCHEMA_MISMATCH`, `SESSION_MISMATCH`, `STALE_REVISION`, `COMMAND_ID_REUSE`, `INTENT_NOT_AVAILABLE`, `ENGINE_REJECTED`, `NO_SAVE`, and `SAVE_REJECTED`. Reuse them. A legal quote returns consequences plus an intent; an illegal quote uses the current rejection envelope and a fresh Casting projection supplies structured current blockers. A commit-time race retains the same authority refusal envelope and the local draft.

The current bootstrap behavior must not become the player UX:

- `resolveAvailableIntents` auto-constructs Camera Tests from the first three available Actors.
- It emits a fixed `[0,1] / [0,2] / [1,2]` six-read slate.
- Greenlight currently requires reviewed audition candidates, selects the first available primary Director and Craft, uses the required minimum negative, and sets marketing to zero.
- Therefore the bridge cannot express a direct package without tests, a player-chosen test slate, a player-chosen Director/Craft Lead, untested legal Actors, or player budget/marketing choices.

Retain those paths only as deterministic journey/proof automation. Extend the sealed player choice-to-quote seam; do not rewrite command submission, revision, replay, or reconnect.

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
| `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` | Closed generated protocol v4/projection v9 DTOs, including Development quote/board, but no player-authored Casting/package projection. | REGENERATE from the extended TS schema; do not hand-maintain a parallel DTO model. |
| `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`, `StudioBridgeWireValidator.cs` | Strict parse, closed compatibility, exact command serialization. | REUSE; extend through generated contract. |
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` | Polls authority, submits opaque commands, and now owns `RequestCommissionQuote`/`PostQuote` plus typed quote events. | REUSE/GENERALIZE. Quotes use the pure re-ask lifecycle; commits use ordinary pending-post. |
| `StudioBridgePendingPost.cs`, `StudioBridgeRuntimeContinuity.cs` | Retries identical immutable mutation bytes after ambiguous transport loss and joins responses against exact session/revision. | REUSE for `/command` only. A quote is deliberately not a pending mutation. |
| `StudioSnapshotStateCache.cs` / projection store | Applies complete snapshots atomically across polls and session epochs. | REUSE. Casting draft remains separate presentation state. |
| `StudioRejectionRetention.cs` | Keeps TS-owned refusal facts only beside the exact session/revision/digest that produced them. | REUSE in the workspace. |
| `Assets/Studio/Runtime/Presentation/SelectableEntity.cs` | Stable authority ID, display/status, place/person/vehicle semantic kind, selection visuals, optional focus. | REUSE for Casting building and physically present candidates. |
| `StudioSelectionManager.cs` | Semantic person-first picking, single selection, double-activation focus/inspection, Escape clear. | REUSE. Do not add workspace-specific raycasts. |
| `StudioHud.cs` | Right-edge selection receipt with safe-area/workflow-panel avoidance. | COPY PATTERN or extend its accepted host relationship; avoid overlapping retained workspace. |
| `StudioInspectionTarget.cs`, `StudioCameraDirector.cs`, `TycoonCameraController.cs` | Management vs inspection cameras, input ownership, Back control, restoration of prior workflow-panel visibility. | REUSE. Opening Casting must not automatically enter inspection or change the camera. |
| `StudioBridgePresentation.cs` | Exact building/property joins, authoritative person placement, zone routing, ambient presentation, production/world refresh. | EXTEND the existing projection application; do not build a parallel presentation binder. |
| `StudioLocationBinding.cs` | Exact authored building ID to physical body join. | REUSE at the presentation edge; resolve semantic Casting owner first. |
| `StudioPersonPresentationSlot.cs`, `PurposefulAgent.cs` | Separates authoritative from ambient bodies; routes authoritative activity without simulation. | REUSE for Camera Test physical presence. |
| `StudioStageProductionPresentation.cs`, `StudioProductionRolePresentation.cs` | Consumes authoritative production company/role facts after Greenlight. | REUSE after accepted formation; P04A should not pre-stage authoritative company members. |
| `StudioLivingTime.cs` / controller and HUD | Presentation cadence and existing Advance Week client seam; does not own simulation time. | REUSE; Camera Test due time remains TS-owned. |

### Current Casting world surface

- The current authored Casting place is `casting`, displayed as “Casting & Talent,” created by `StudioLotArchitectureAuthoring.BuildCasting` and bound in `StudioLot.unity`; treat this as current presentation identity only.
- P03 added `StudioLotArchitectureAuthoring.BuildDevelopment`, a live selectable `writers` bungalow labelled “Development,” plus `StudioDevelopmentPresentation` status/pennant. Leave it and its sealed boundary intact.
- TypeScript facilities use `facility-development-casting` and annex/hall variants. `StudioBridgePresentation.ResolveZoneId` already maps baseline and annex facility IDs to the physical `casting` zone.
- `ResolveZoneId` already prefers exact stages and placed-facility/property-building joins before legacy facility aliases. Extract/extend that authoritative-identity-to-authored-owner path rather than adding guessed aliases in P04 UI.
- `StudioBridgePresentation.ApplyBuildingStates` already puts authoritative `attentionReason`, construction progress, or availability on the selected building.
- `ApplyAmbientPeople` uses `TryResolveBuildingAmbient(lot, "casting", true, ...)`: authored casting extras become visible for active/positive/warning/decision-required attention.
- `StudioLotActivityAuthoring.BuildServiceAndCastingEvidence` authors a check-in table, three decorative applicants, and a decorative casting clerk. These are presentation identities only and must never be joined to candidate IDs.
- `ApplyPeople` already binds authoritative `StudioPersonSnapshot` + `StudioPresencePersonSnapshot` to physical bodies and routes `facility-development-casting*` presence into the Casting zone.

No Unity Casting screen, candidate card, role assignment workspace, comparison surface, Fit explanation, Greenlight preview, or exact Casting building inspector exists at this baseline. The current `StudioBridgeClient` memo can list auto-generated Greenlight intent buttons and a generic “choose cast” heading, but it does not contain the data or interaction model approved for P04A.

The sealed P03 surface is IMGUI/scene-authoring and has no P04 `.prefab`, `.uxml`, or `.uss`. This is evidence, not an architecture ruling. `StudioCameraInput.IsPointerOverUi` is the current pointer-ownership seam; preserve its contract under whichever renderer the separate audit accepts. There is no generic building beacon: current Casting spectacle is ambient visibility plus selected-building status.

### Back and context restoration

Current camera Back is exact for inspection: `StudioCameraDirector.ExitInspection(false)` restores management input and previous workflow-panel visibility. Current selection Escape clears selection. CP10A `StudioFoundingCardHud.BackToCompact` and sealed P03 `StudioDevelopmentCardHud.BackToDepartment` reverse explicit presentation layers. P03 did not land a general retained-workspace origin/Locate stack. P04A therefore adds one shared presentation-level origin model while reusing the existing selection/camera authority:

```text
origin = selected building ID + selected project ID + workspace layer + local scroll/compare state
Back = pop exactly one presentation layer
Locate = explicit camera action only
authority refresh = retain origin if all exact IDs still join; otherwise fail neutral to Casting root
```

Do not wire Back to `SnapHome`, change selection, or refocus the camera unless the player explicitly requests Locate/Focus.

`TycoonCameraController.FocusOn` changes management pivot/distance and exposes no complete pose capture/restore API. Therefore it cannot, by itself, satisfy Package 02 exact Back restoration. `StudioSelectionManager` also lacks a selection-change event, exact-stable-ID select method, and exact Locate/Focus API. These remain shared presentation gaps after P03A, not reasons to add Casting-local camera or selection state.

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
  authority: { sessionId: string; stateRevision: number; stateDigest: string }
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
  lastValidatedRevision: number
  normalizedDraft: ExactPackageDraft
  assignments: AssignmentAssessmentView[]
  consequences: FinancialConsequencePreview & GreenlightConsequenceView
  outcome: 'forms-now' | 'queues-without-commitment'
  intent: StudioBridgeIntentOption
}
```

The workspace projection publishes current blockers for incomplete/illegal drafts; the existing quote path returns the ordinary structured authority rejection when exact validation fails. An accepted quote normalizes exact IDs, never names, identifies current revision/digest, distinguishes “forms now” from “joins queue with no commitment,” and always carries one ephemeral intent. The local draft object itself carries no immutable source revision.

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
- invalidates the quote when any selected ID or authoritative revision changes while retaining/rejoining the selected-ID draft.

### Presence and spectacle

`src/core/presence.ts` already projects the exact auditioning slate as `engagement: 'casting'`, `credit: 'auditionee'`, at the Development & Casting facility. It explicitly invents no casting staff. Its `TIER_RANK` is production > script > casting, so stronger work preempts the auditionee claim. `StudioBridgePresentation.ApplyPeople` consumes that one collapsed record and routes it through `ResolveZoneId`; the Casting session/building projection must remain the activity witness when a body is preempted. Decorative casting applicants/clerk may support atmosphere only; they are not the six reads.

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

Minimum typed accepted receipt sketch:

```ts
type GreenlightCommitReceipt =
  | {
      outcome: 'formed'
      projectId: string
      productionId: string
      title: string // display only
      committedAmount: number
      stateRevision: number
    }
  | {
      outcome: 'queued'
      projectId: string
      queueOrdinal: number
      title: string // display only
      holds: false
      immediateCommitment: 0
      stateRevision: number
    }
```

This may be an action-specific member of the accepted command response or an exact before/after selector over sufficiently rich projections; it must be closed, correlated to the submitted project/command, and never inferred from title. The queued receipt is not a Production receipt. Later expiry uses the persisted queue ordinal + exact project subject ID and engine reason described above.

## 12. Financial integration points

P04A exposes existing V1 economic law through Package 11's shared consequence language. It must not create Casting-specific calculation code.

| Value | Existing source | P04A treatment |
|---|---|---|
| Negative / production budget | Ready screenplay `requiredNegative`, Greenlight payload budget, browser `marketingMenu` / budget step | Publish the permitted current choices and exact selected amount from TS. Do not define new budget law. |
| Marketing commitment | `GreenlightScriptProjectPayload.budget.marketing` and existing browser menu | Publish current V1 choice/amount as immediate Greenlight commitment; do not debit it again later. |
| Contracted assignment cost | `activeContract`; engaged Greenlight charges no new film fee for contracted staff | Label honestly as contracted/current payroll, with zero immediate package fee. Do not convert annual/payroll facts into a new film fee. |
| Freelancer assignment cost | `freelancerFee`; browser `assignmentProjectCost` | Publish the exact one-film fee per assignment and total from shared TypeScript. |
| Immediate package commitment | negative + marketing + current freelancer fees in engaged economy | Publish exact breakdown and total from the quote. Do not use legacy salary-sum logic in managed mode. |
| Cash | `state.studio.cash`; `src/core/economyView.ts` — `commitmentPreview` | Publish cash before/after and affordability/refusal. |
| Current recurring cost / recurring delta | `weeklyBurn`, `weeklyOverhead`, `weeklyPlacementOperatingCost`; Greenlight current law | Do not call current incomplete `weeklyBurn` complete until facility Opex joins. Greenlight recurring delta is normally absent/zero because direct costs are one-time. |
| Current-pacing runway | `runway`, `runwayOf`, `commitmentPreview.postRunway` | Reuse only after complete recurring inputs; otherwise omit or explicitly qualify. |
| Obligations | contracts, `offerObligation`, direct production ledger | Show known facts separately; Greenlight creates no new contracted guarantee. |
| Fit/confidence/forecast and break-even | `filmPackage.ts` assessment functions and browser summary | Publish existing ranges/disclosures separately from cash; uncertain return is not a receivable. |
| Queue effect | production queue law | Explicitly show zero immediate charge/hold/identity while waiting. |

The immediate-cost assembly currently lives partly in `ui/src/engine/adapter.ts`. Extract/promote it into a shared TypeScript consequence projection so quote, browser, bridge, and tests use one mode-aware result. Compose it with `commitmentPreview` and the repaired common recurring basis. Unity must not sum fees, payroll, negative, marketing, recurring cost, runway, or obligations. Financing, debt, distribution, portfolio exposure, or invented return law remain absent and do not block the truthful V1 preview.

## 13. World-presentation integration

### Casting belongs to the lot already

- Resolve the semantic current Casting owner to today's authored `casting` building and reuse its six activity-zone points from `StudioLotArchitectureAuthoring.BuildCasting`; keep the literal ID at the routing edge.
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

`src/core/save.ts` at the sealed TS tip writes and validates `SaveFileV14` through `makeSaveV14`, `makeSave`, `loadSave`, and `exportSave`, with closed V1-V14 migrations. Casting entered persistence at V10; V14 already contains:

- Casting mode and canonical session IDs;
- exact project/slate;
- lifecycle status and dates;
- active reservation when auditioning;
- exact six persisted results when complete;
- production queue entries, including queued Camera Test and Greenlight payloads.

`tests/casting-sessions-save-v10.test.ts` proves exact lifecycle bytes and rejects malformed evidence, IDs, cross-references, lifecycle disagreement, and slot collisions. A projection-only P04A plus transient package draft needs no save-version bump. The identity-bearing `queueIntentExpired` repair is the one documented exception: because current save validation is exact, persist it through the next available save version/migration rather than silently widening V14. If implementation proposes persistent package-draft state, stop: that is an unapproved product/save-law expansion.

### Explicit save versus runtime continuity

- `BridgeSession.save` creates/updates the explicit game save and does not advance state revision.
- `BridgeSession.load` applies the explicit save and advances revision.
- `BridgeSession.exportRuntimeCheckpoint` / `fromRuntimeCheckpoint` preserve live state, explicit save slot, logical session ID, revision, and complete command journal across process restart; they deliberately do not preserve `pendingQuotes`.
- The exact same command envelope replays its byte-identical stored response after restart.
- `fromSaveJson` and `rolloverRuntime` establish a new logical session and do not preserve the old command journal; old envelopes must fail `SESSION_MISMATCH`.
- Unity `StudioBridgePendingPost` retains exact immutable POST bytes through ambiguous transport loss; it never fabricates a replacement command.

### Draft behavior

The package draft should be presentation state only. Its identity is the exact project ID, stable selected talent IDs, and current local presentation choices. Track the last validated revision/digest separately. On poll/reconnect/load:

1. keep selected IDs while the exact project and people still join, even when revision/cash/evidence/availability/fees/capacity changed;
2. join every selected ID against the fresh candidate projection;
3. visibly mark changed availability/cost/evidence;
4. discard any old opaque quote/intent on authority change, reconnect, restart, load, or session change;
5. require a fresh TS quote before confirmation;
6. on a new logical session, rejoin the local presentation draft against authority and never replay an old quote or draft command.

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
| `tests/c2a-m4-queue-admission.test.ts` | Greenlight cash only when granted; duplicate exact screenplay; auditions wait; only capacity queues; illegal-at-dequeue expires; deterministic order | EXTEND EXISTING TEST for quote→queue parity and identity-bearing expiry `{subjectId, reason}` with no partial commitment. |
| `tests/script-projects-actions.test.ts` | Draft -> Rewrite -> Ready -> linked Production -> Produced; collision-safe re-Greenlight identity/ledger | EXTEND EXISTING TEST for exact locked Writer/project identity in quote. |
| `tests/script-read-model.test.ts` | Ready package staffing/capacity blockers and exact-project queued Greenlight suppression | EXTEND EXISTING TEST for the P04 exact candidate/package projection or add a focused new projection test file. |
| `tests/first-film-journey.test.ts` | full audition/package/production chain; blocked and queued routes; concurrent second picture; pure deterministic guidance | EXTEND EXISTING TEST for exact P03 handoff and direct Package attention. |
| `tests/presence-projection.test.ts` | exact audition slate physical presence; `claims each person exactly once even when tiers overlap (production outranks casting)` | EXTEND EXISTING TEST with the hostile legal-start/stronger-mid-session contract, stored evidence, and no invented hold. |
| `tests/studio-calendar.test.ts` | shared three-owner capacity; exact due ticks; canonical lowest review ID | EXTEND only if P04 projection adds decision/calendar facts. |

### Bridge, save, reconnect — extend existing tests

| Path | Existing proof | Recommendation |
|---|---|---|
| `tests/bridge.test.ts` | protocol/schema fingerprint; distinct evidenced cast; stale/forged/wrong-session/reused IDs unchanged; all rejection codes; opaque identity invalidation; save/load/reconnect; polling save-neutral; queued auditions; queued Greenlight with no commitment | EXTEND EXISTING TEST first: player-authored slate, direct Package, exact draft quote, every choice invalidates intent, duplicate submit byte replay, two simultaneous projects. |
| `tests/bridge-development.test.ts` | sealed `/quote` mint/commit, stale/malformed/no-mutation, leak-free board, original clock | EXTEND generic quote-purity coverage; add P04 focused quote suite rather than overloading Development behavior. |
| `tests/bridge-schema.test.ts` | recursively closed schema, real envelope validation, extra-property rejection, refusal shape, generated C# parity | EXTEND EXISTING TEST for closed Casting/package DTOs and choice/quote request/response. |
| `tests/bridge-runtime-session.test.ts` | untouched authority/revision/digest restore; accepted command byte replay; command/save/load journal | EXTEND EXISTING TEST for quoted intent replay/invalidation; draft itself remains absent. |
| `tests/bridge-runtime-checkpoint.test.ts` | canonical closed checkpoint, route-specific command journal identity, revision ordering, accepted save validation | EXTEND to prove no P04 quote authority is checkpointed and restored session safely requires re-quote. Quotes must never enter the durable journal. |
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
| `StudioDevelopmentPresentationTests.cs` — `Contracts_NameTheFixtureIdentityAndTheirOwnPennantObject`, `DevelopmentSource_SpeaksButNeverSelectsMovesOrComposesCopy`; `StudioSceneContractTests.cs` | PRESERVE sealed Development; EXTEND only semantic Casting-owner/current-`casting`/future placed-facility routing tests. |

ADD NEW UNITY TESTS for the retained role-first workspace, responsive candidate dossier/comparison, exact draft preservation/revalidation, armed Greenlight confirmation, queued-vs-formed receipt, and multi-project isolation. No current Unity test proves those behaviors.

## 16. Suggested implementation waves

These are the definitive post-delta waves. Fable owns architecture, integration, reviews, and the final merge throughout.

### Wave 1 — TypeScript Casting workspace and safe candidate truth

- **Purpose:** publish one exact project/role/candidate/evidence/readiness model with the field classifications above.
- **Likely files/symbols:** extend `src/core/castingReadModel.ts`, `src/core/scriptReadModel.ts`, and exports in `src/core/index.ts`; add focused `src/core/castingPackageReadModel.ts` if composition would otherwise pollute lifecycle code; reuse/export from `talentSummary.ts`, `employment.ts`, and `filmPackage.ts` without changing formulas.
- **Ownership:** TypeScript/Core; Fable approves all disclosure and cross-module boundaries.
- **Dependencies:** sealed Ready identity and Package 04 hidden-information law.
- **Tests:** add focused `tests/casting-package-read-model.test.ts`; extend `script-read-model.test.ts`, `film-package-truthfulness.test.ts`, and `d11-employment.test.ts`; add projection JSON key scan forbidding every no-go symbol.
- **Risk:** HIGH—hidden data or duplicated Fit/cost law.
- **Stop condition:** every role-first region has an exact TypeScript source; no candidate ranking/winner/private decomposition crosses the view.
- **Cheapest capable worker:** Sonnet/equivalent for bounded selector composition; Haiku/equivalent may inventory fields/tests only; Fable reviews the disclosure boundary.

### Wave 2 — Shared consequences and pure P04 quote extension

- **Purpose:** extend P03 `/quote` for exact six-read and Greenlight drafts, with one registry and Package 11 vocabulary.
- **Likely files/symbols:** `bridge/development.ts` only as pattern; add a focused `bridge/casting.ts`; extend `BridgeSession.pendingQuotes`, `quote`, `quotedIntentFor` in `bridge/session.ts`; reuse `opaqueIntentId`; compose `economyView.ts::commitmentPreview`; repair common recurring-cost selectors with `placement.ts::weeklyPlacementOperatingCost` if complete burn/runway is included.
- **Ownership:** TypeScript/bridge architecture; no Unity work yet.
- **Dependencies:** Wave 1; finance truth repair or an explicit decision to omit/qualify burn/runway.
- **Tests:** extend `bridge-development.test.ts` purity; add `bridge-casting.test.ts` for exact slate/package, repeated purity, quote/commit parity, quote/queue parity, invalid IDs, changed availability/cash/fee/capacity, and no durable ID/RNG/save/journal changes; retain D12 parity tests.
- **Risk:** HIGH—parallel registry/front door or false financial precision.
- **Stop condition:** identical state+draft is semantically deterministic and mutation-free; `/command` reconverts and returns exactly formed/queued/refused authority.
- **Cheapest capable worker:** Opus/Fable lead for the transaction/consequence design; Sonnet/equivalent may implement bounded converters after interfaces are fixed.

### Wave 3 — Closed bridge contract, generated DTOs, and typed receipts

- **Purpose:** publish Casting view/quote/refusal/formed-or-queued receipt/expiry notice through one versioned contract.
- **Likely files/symbols:** `bridge/schema/bridge-schema.ts`, `project-studio-bridge.schema.json`, `bridge/schema/runtime.ts`, `bridge/protocol.ts`, `bridge/server.ts` only to widen existing `/quote` validation/dispatch, root and Unity generated DTOs, `StudioBridgeProtocol.cs`, `StudioLotSnapshot.cs`, projection store/cache.
- **Ownership:** bridge/schema + mechanical generated Unity data.
- **Dependencies:** Waves 1–2 interface freeze.
- **Tests:** `bridge-schema.test.ts`, `bridge.test.ts`, `StudioBridgeProtocolTests.cs`; recursively closed unions, extra-key refusals, generated parity, session/revision/digest joins, typed formed/queued receipt.
- **Risk:** HIGH—hand-edited/generated drift or a second quote route.
- **Stop condition:** protocol v4 successor/projection successor validates end-to-end; `/quote` remains non-journaled and `/command` the sole commit path.
- **Cheapest capable worker:** Haiku/equivalent for schema regeneration and parity fixtures; Sonnet/equivalent for bounded protocol/store changes; Fable reviews envelope semantics.

### Wave 4 — Retained Casting shell, semantic owner, origin/Back, and scroll

- **Purpose:** open one dense role-first workspace from the semantic Casting owner while retaining lot/camera/context.
- **Likely files/symbols:** new Casting workspace/contracts classes; reuse `StudioDevelopmentCardContracts`/`StudioDevelopmentCardHud` patterns; extend `StudioCameraInput` pointer shielding, `StudioBridgeBootstrap`, `StudioSelectionManager` only for a shared exact-ID/origin/Locate seam, and extract/extend `StudioBridgePresentation.ResolveZoneId`/`ResolvePlacedBuildingId` rather than hard-coding `casting` in the workspace.
- **Ownership:** Unity presentation; framework choice pending the accepted architecture audit.
- **Dependencies:** Wave 3 DTO/store; exact semantic owner projection.
- **Tests:** copy P03 geometry/arm source laws; add one contained scroll-owner test, nested Back/origin/project/role/scroll restore, pointer shielding, no Focus/selection calls on open, current `casting` and placed-facility routing fixtures.
- **Risk:** HIGH—camera hijack, context loss, hard-coded future owner, inherited P03 density limits.
- **Stop condition:** root/open/Back/Locate are exact; candidate body can scroll without moving the lot; no commit control appears under the opening pointer.
- **Cheapest capable worker:** Sonnet/equivalent for bounded Unity UI/navigation; Fable integrates with shared selection/camera and architecture-audit outcome.

### Wave 5 — Candidate dossier, comparison, and durable local choices

- **Purpose:** render role-first candidate inspection/comparison using exact IDs and safe projected facts.
- **Likely files/symbols:** new Casting candidate/dossier/comparison presentation; reuse/generalize `StudioApplicantPortraitCamera` only where an exact body exists; reuse `StudioRejectionRetention`; local draft state separate from quote state.
- **Ownership:** Unity presentation only.
- **Dependencies:** Waves 1, 3, 4.
- **Tests:** duplicate names/reordered arrays, exact-role Fit/evidence, absent portrait fail-neutral state, changed availability/fee/cash, draft survives revision/reconnect while quote dies, incomplete/illegal package cannot quote/commit.
- **Risk:** HIGH—identity mismatch, hidden inference, or silent draft clearing.
- **Stop condition:** comparison invents no aggregate/winner; illegal selected identity remains visible with exact reason; every quote uses current exact IDs.
- **Cheapest capable worker:** Sonnet/equivalent; Haiku/equivalent can add mechanical layout/identity test cases after contracts are fixed.

### Wave 6 — Screen Tests, no-hold presence, and result return

- **Purpose:** plan/quote/commit six reads, show authoritative session activity, advance through existing Living Time, and return stored evidence to the same role context.
- **Likely files/symbols:** Casting Screen Test layers; generalized `StudioBridgeClient` quote events; `StudioBridgePresentation.ApplyPeople` only for tested routing/fallback; existing Living Time controller; no Core lifecycle rewrite.
- **Ownership:** bridge client + Unity presentation; Core only projection/tests unless a discovered gap proves otherwise.
- **Dependencies:** Waves 2–5.
- **Tests:** exact six/two-per-role/three-person, queue vs start, one week/slot, no fee/hold/assignment/winner, save/load evidence, hostile stronger-engagement presence precedence, building-level active fallback, decision pause/acknowledge.
- **Risk:** HIGH—client timer/simulation or two-place person presentation.
- **Stop condition:** authoritative session stays truthful with or without auditionee bodies; evidence persists and no candidate is preselected.
- **Cheapest capable worker:** Sonnet/equivalent for bounded UI/presence integration; Fable reviews the hostile concurrency seam.

### Wave 7 — Greenlight consequence, commit/queue receipt, and expiry recovery

- **Purpose:** deliberate preview/arm/commit, exact formed-or-queued receipt, and recoverable identity-bearing expiry.
- **Likely files/symbols:** Casting package review/confirmation; `StudioBridgeClient` ordinary `SubmitIntent` and existing pending-post; `queueAdmission.ts`, `productionQueue.ts::queueEntrySubjectId`, `studioEvents.ts`, `types.ts`, `actions.ts` cancel path, `save.ts` next-version migration, Casting expiry projection; reuse `applyGreenlightScriptProject/Now` and `applyGreenlight` unchanged.
- **Ownership:** Core event/save identity + bridge projection + Unity confirmation/notice.
- **Dependencies:** Waves 2–5; common finance truth decision.
- **Tests:** exact preview/formed parity, preview/queued no-commitment parity, same-byte ambiguous command replay, stale/late refusal no effects, `queueIntentExpired` exact project/reason after save/reconnect, `[Review package]` reopens retained choices by project ID.
- **Risk:** HIGH—non-atomic choreography, unexplained expiry, save-version collision.
- **Stop condition:** one armed `/command` yields exactly one formed or queued result; expiry names the exact recoverable project and never relies on title authority.
- **Cheapest capable worker:** Opus/Fable lead for transaction/save integration; Sonnet/equivalent for bounded Unity receipt/notice; Haiku/equivalent for migration fixtures after version choice.

### Wave 8 — World response, responsive proof, and regression seal

- **Purpose:** reuse existing production/company presentation and prove all continuity/layout/multi-project laws without expanding simulation.
- **Likely files/symbols:** `StudioBridgePresentation`, `StudioBridgeBootstrap`, existing production/stage presentation; Casting proof runner and focused EditMode tests; no new production law.
- **Ownership:** Unity integration/proof plus complete TS/bridge regression.
- **Dependencies:** all prior waves and accepted UI architecture choice.
- **Tests:** three supported viewport bands/safe areas, contained scroll, pointer/arm, nested Back/camera, process restart/load/session rollover, duplicate submit, exact expiry recovery, same-title/multi-production isolation, no stale quote replay, full relevant Core/bridge/EditMode/browser-oracle regression.
- **Risk:** MEDIUM—presentation divergence or proof that does not identify its source.
- **Stop condition:** proof artifacts stamp TS SHA, Unity SHA, protocol/projection/schema identity; tracked implementation worktree contains only intended P04 changes and all acceptance suites are green.
- **Cheapest capable worker:** Haiku/equivalent for proof inventory/report collation; Sonnet/equivalent for bounded responsive fixes; Fable performs final cross-system review and seal.

## 17. Risk register

| Rank | Risk | Concrete failure | Mitigation |
|---|---|---|---|
| HIGH | Parallel simulation in Unity | C# decides eligibility, time, capacity, cost, or formation and diverges from Core. | Generated projection only; opaque intent submit; no C# law or state patch payload. |
| HIGH | Duplicate/misleading Fit | Unity or bridge recreates `projectFit`, or UI claims public signals fully explain a score containing undisclosed role-read inputs. | Project authoritative Fit and safe non-exhaustive signals; fixed disclosure; hidden-value negative tests. |
| HIGH | Hidden-information leak | `talent.actual`, actual persona, `teamDirectionPreview`, or inferred ceilings cross the wire. | Closed explicit view types; serialize-negative tests scanning fixtures/JSON; no generic Talent serialization. |
| HIGH | Stale quote confused with durable draft | A revision change clears player choices, or presentation replays an old intent after reconnect. | Draft identity is exact IDs/choices; quote freshness is session/revision/digest/server registry. Preserve and rejoin draft, discard/requote authority, final Core revalidation. |
| HIGH | Greenlight non-atomicity | Client separately assigns, charges, reserves, or spawns company before final success. | One existing `applyGreenlightScriptProject` intent only; exact before/after receipt; no optimistic authoritative world mutation. |
| HIGH | P03 seam collision | P04 creates `/casting/quote`, another pending-intent registry, or a parallel command path. | Extend sealed `/quote`, `pendingQuotes`, `quotedIntentFor`, `/command`, and refusal/journal systems only. |
| HIGH | Incomplete finance presented as complete | `weeklyBurn`/runway omit charged facility Opex but Unity labels them total operating cost. | Repair common TypeScript selectors with `weeklyPlacementOperatingCost`, or omit/qualify; use Package 11 consequence envelope; no Unity math. |
| HIGH | Unrecoverable queued expiry | Queue event drops project identity and player sees generic failure or wrong same-title picture. | Persist `queueEntrySubjectId` in expiry event, project exact notice, route Review by project ID, save/reconnect test. |
| HIGH | Candidate identity mismatch | Same names, list reorder, body reuse, or applicant-prefixed IDs select the wrong person. | Canonical talent/project/session IDs everywhere; closed set-difference joins; names display-only; no array-index identity. |
| MEDIUM | Incorrect availability | Camera Test slate is treated as a hold; historical evidence is treated as current eligibility. | Publish historical evidence and current availability separately; revalidate at quote, submit, and queue admission. |
| MEDIUM | Primary-role/Core discipline mismatch | Unity widens or narrows candidate pools inconsistently with current V1 read models/final Core. | Reuse TS-published primary pools; final Core validation remains authoritative; pin with tests. |
| MEDIUM | Accidental or duplicate commit | Double-click/repaint or retry issues two different Greenlight commands. | Separate review/armed confirmation geometry; one pending post; exact immutable retry; command-id replay tests. |
| MEDIUM | Camera hijack / broken Back | Opening Casting or accepting Greenlight focuses, snaps Home, or loses previous lot context. | No automatic focus; explicit Locate; shared origin stack; never call `ExitInspection(true)`; camera regression tests. |
| MEDIUM | Dense P03 layout inherited blindly | Candidate/comparison content grows past 780f, drops facts, or has no usable scroll owner. | Reuse top anchor/arm/pointer laws but add one contained scroll owner and preserve approved evidence hierarchy. |
| MEDIUM | Physical owner hard-coded | New P04 classes assume `casting` forever and cannot open a future placed Development & Casting facility. | Route semantic Casting capability through `ResolveZoneId`/placed-building identity; keep current authored ID at the edge. |
| MEDIUM | UI audit overreach | Recon prematurely mandates IMGUI/UI Toolkit/URP and entangles authority with renderer choice. | Keep projection/draft/quote/navigation contracts framework-agnostic; Fable adopts only an accepted audit result. |
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
- `src/core/economyView.ts` plus `src/core/placement.ts::weeklyPlacementOperatingCost` — shared immediate/recurring consequence truth; no Casting-specific arithmetic.
- likely new `src/core/castingPackageReadModel.ts` — exact role pools and package view, keeping lifecycle code focused.
- `src/core/firstFilmJourney.ts` — only exact Casting attention/next-action/expiry recovery joins beyond sealed Development.
- normally no `src/core/presence.ts` change: current precedence is sufficient; extend tests/projection first.
- `src/core/types.ts`, `studioEvents.ts`, `queueAdmission.ts`, `productionQueue.ts::queueEntrySubjectId`, `actions.ts` cancel path, and `save.ts` — only for identity-bearing queued-expiry recovery.

Core symbols that remain reused, not redesigned: Casting lifecycle/eligibility functions, employment/Fit/forecast math, `applyGreenlight*`, queue commit/admission law, `tick`, RNG streams, and tuning. The narrow expiry-event/save identity extension does not authorize redesigning those systems.

### Bridge/schema

- `bridge/schema/bridge-schema.ts`
- `bridge/schema/project-studio-bridge.schema.json` through the generator
- `bridge/schema/runtime.ts`
- `bridge/session.ts`
- likely new `bridge/casting.ts` beside `bridge/development.ts`
- `bridge/protocol.ts` / `bridge/server.ts` only to widen the existing `/quote` union/dispatch; no new route
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
- `StudioDevelopmentCardHud.cs` / `StudioDevelopmentPresentation.cs` as behavior patterns, not Casting base classes
- `StudioCameraInput.cs`, `StudioSelectionManager.cs`, and camera classes only for the still-missing shared pointer/Locate/origin APIs
- `StudioApplicantPortraitCamera.cs` if generalized
- likely new Casting-specific workspace, card, comparison, confirmation, attention, and optional spectacle presentation classes
- related EditMode tests; scene/authoring only if P04's current Casting session state cannot be truthfully shown through the sealed authored owner and existing ambient points

Do not author a second Casting building. Do not spread `casting` as domain law. Do not choose or migrate UI technology in this package unless the separate architecture audit is accepted; the authority/identity/quote contracts remain renderer-independent.

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
- Package 10's future human-information spine or Package 11's broader Finance workspace/forecast scope.

Exact source/symbol no-go list:

- never serialize `Talent.actual`, talent ceilings, actual persona/temperament decomposition, `teamDirectionPreview`, `teamDirectionGuidance`, RNG state/seed/stream keys, formula coefficients, or unapproved private scoring components;
- never make Unity implement `roleOVR`, `projectFit`, `actorRoleFit`, `temperamentMatch`, `expectedPerformance`, `genreExperience`, `packageFit`, `executionConfidence`, `forecastProfitRange`, `packageDelta`, `busyTalentIds`, `assignableForFilm`, `freelancerFee`, `commitmentPreview`, or `weeklyBurn/runway`;
- never make Unity implement `assertCastingSlateLaw`, `assertCastingSlateEligibility`, `startCastingSession`, `completeDueCastingSessions`, `acknowledgeCastingSession`, queue admission/revalidation, `studioPresence`, `tick`, or RNG `stream`;
- never bypass `BridgeSession.quote`, `pendingQuotes`, `quotedIntentFor`, `BridgeSession.command`, `opaqueIntentId`, `authoritativeDigest`, `priorResponse`, or the command journal/pending-post/refusal lifecycle;
- never split or reproduce `applyGreenlightScriptProject`, `applyGreenlightScriptProjectNow`, or `applyGreenlight` in client choreography;
- never encode the full server-side action payload in ordinary display copy and parse it back in Unity;
- never hand-edit either generated `StudioBridgeDtos.Generated.cs` as the source of contract truth.

## 20. P03A collision/delta-refresh resolution

The narrow refresh is complete; do not rerun it during P04A implementation. Exact resolution:

| Former conditional seam | Sealed result | P04 action |
|---|---|---|
| Development choice/quote | `/quote` landed in `bridge/server.ts`, schema, `BridgeSession.quote`, and Unity client | Extend this route/registry only. |
| Opaque exact commit | digest+draft `opaqueIntentId`; `/command` consumes through `quotedIntentFor` | Reuse for Screen Test/package. |
| Quote journal/reconnect | quotes are ephemeral, never journaled/checkpointed; commands remain durable/replayable | Preserve local draft, discard/requote authority. |
| Projection | protocol 4 / projection 9 with required Development member | Increment closed contract once for P04. |
| Ready handoff | exact board line at physical `writers`; nothing after Casting boundary | Start P04 from exact Ready project ID. |
| Retained workspace | top-anchored `StudioDevelopmentCardHud`, 0.7s arm, pointer shield, same camera | Reuse safety laws and harden density/scroll. |
| Origin/Locate | no generic stack/API landed; explicit Back only | Add one shared presentation seam, not Casting-local camera state. |
| Physical Development | authored `writers` bungalow plus script-presence redirect | Leave unchanged. |
| Casting owner | current `ResolveZoneId` maps shared facility to `casting`; placed-building join already exists | Extract/extend semantic owner routing; do not hard-code future law. |
| Responsive behavior | fail-closed/grow/drop rows; no inner scroll; hierarchy/evidence limits recorded | Do not propagate unsafe limits into P04 density. |
| Proof provenance | P03 artifacts do not stamp Git SHA | P04 proof must stamp both SHAs and contract versions. |

P03 files that P04 may extend but should not rewrite casually: `bridge/development.ts` as a converter/quote pattern; quote unions in `bridge/schema/bridge-schema.ts`; `BridgeSession.pendingQuotes`, `quote`, `quotedIntentFor`, `command`, and `load`; `StudioBridgeClient.RequestCommissionQuote/PostQuote`; `StudioDevelopmentCardContracts`/`StudioDevelopmentCardHud` safety laws; `StudioDevelopmentContracts` TypeScript-copy pass-through; `StudioCameraInput` pointer shielding; `StudioBridgePresentation.ResolveZoneId`/`ResolvePlacedBuildingId` facility-world join.

P03 sealed symbols P04 must leave behaviorally intact: commission draft/range conversion in `draftToEngine`; `CASTING_BOUNDARY_LINE`; Development board copy; named writer `engagement === 'script'` routing to `writers`; memo demotion; accepted-command/load quote invalidation; non-journaled quote read path; 0.7-second commit arm; no automatic camera/selection change.

## 21. Fable handoff summary

## START HERE

Wave 1: publish the closed TypeScript Casting/package view. Wave 2: extend sealed `POST /quote` and its single ephemeral `pendingQuotes` registry for exact six-read and Greenlight drafts. `/command` remains the sole commit path; Unity remains presentation/input only.

## REUSE THESE

`castingSessions.ts` lifecycle/law/RNG, `castingReadModel.ts`, employment/talent/film-package selectors, `commitmentPreview`, `applyGreenlightScriptProject/Now` + `applyGreenlight`, production queue/revalidation, P03 `/quote` + opaque intent, bridge journal/refusals/pending-post, P03 card arm/top-anchor/pointer laws, Unity selection/camera/presence/production presentation.

## EXTEND THESE

Casting/package/candidate/expiry projections; the existing quote request/response union and `BridgeSession.pendingQuotes/quotedIntentFor`; generated bridge DTO/store; semantic Casting owner resolver; one shared origin/Locate seam; contained-scroll retained workspace; typed formed/queued receipt; identity-bearing queue expiry.

## LIKELY NEW SEAMS

Transient exact-ID player draft independent of quote revision; `bridge/casting.ts` converter/read-model composition; Package 11 shared consequence envelope; persistent expiry `subjectId`; nested workspace origin/Back/scroll state; building-level Screen Test activity when person presence is preempted.

## DO NOT REBUILD

Do not rebuild Camera Test law/RNG/time, Fit/OVR/cost/availability/finance, presence precedence, queue, atomic Greenlight, save/reconnect, command journal, selection/camera, people/production presentation, or a second quote/command route. Never cross hidden `Talent.actual`, ceilings/persona/temperament decomposition, `teamDirection*`, hidden RNG/formulas, or parse server payloads from display text.

## TEST THESE FIRST

Quote purity and `/quote` non-journaling; exact six-read quote/commit; draft survives revision/reconnect while quote dies; hostile production-over-Casting presence; Package 11 finance basis; exact Greenlight quote→formed/queued parity; expiry project/reason/Review recovery across save; duplicate `/command` replay; hidden-data schema scan.

## WATCH THESE RISKS

Parallel P03 quote/registry, hidden-data leak, stale quote replay or silent draft clearing, incomplete facility-Opex burn/runway, queue expiry without project identity, literal `casting` hard-code, no contained scroll owner, camera/context loss, and UI-architecture decisions leaking into authority.

## P03A DELTA TO RECHECK AFTER SEAL

No conditional P03 seam remains at the sealed SHAs. Recheck only if those SHAs move: `/quote` request/response/registry invalidation; projection/schema/DTO versions; `CASTING_BOUNDARY_LINE`; `StudioDevelopmentCardHud` geometry/arm/Back; `StudioBridgePresentation.ResolveZoneId` and script→`writers` presence; any newly accepted generic origin/Locate or UI-architecture audit result.
