# Project: Studio — P06A Implementation Reconnaissance

**Revision: P06A-RECON-r2-FINAL**

**State: POST-P05-ACCEPTED — final changed-path refresh complete**
**Implementation authority: Owner five-day campaign order, 2026-09-01**

This r2 replaces every `P05-DEPENDENT — REFRESH REQUIRED` reservation in the r1
provisional recon (imported verbatim at `1f5c459`, authored at `c74cf79…`) with
facts verified against the final Owner-accepted P05 pair:

- TypeScript `a994de38e8f87b8680f5ab4bd6fb62e7b594c5db` (campaign tip `18ab9b6…`, code-identical)
- Unity `784f2d52e2459f2cf7a12cbde49319f2bb81df6c`

Verification method: a five-lane parallel read-only recon over both sealed
checkouts (2026-09-01), with the two highest-collision seams
(`operations.ts` advance arms; `tick.ts` release collector) re-read line-by-line by
the lead. Line numbers below are anchors at the seal, not promises.

Package 06 design + Builder Annex @ `8ccd8acc…` remain product law. The r1
sections whose content was purely design-law restatement are not repeated here;
this document records what the CODE is, and where P06 must cut.

---

## 1. The seam P06 must change — verified core truth

### 1.1 Phase law (`src/core/productionPhases.ts`, unchanged since P04)

`PHASE_BY_REMAINING_TICKS` (≈36): 8=development, 7=preProduction, 6=rehearsal,
5&4=shooting, 3&2=postProduction, **1=releaseReady**. `releaseReady` is the only
phase requiring a frozen empty capability array; `NEXT_PHASE_BY_PHASE` has no
successor for it.

### 1.2 Wrap (`src/core/operations.ts`, unchanged since P04)

`enterPhase()` (≈1099) calls `releaseCompletedPhase()` (≈1059) unconditionally
before allocation. Shooting→postProduction with released resources emits the ONE
`wrapped` event (≈1153) and applies set wear. A wrapped waiter's shape — phase
stays `'shooting'`, `reservations=[]`, `shootingTask=null`,
`blocker={kind:'facility-capacity', capability:'post',
targetPhase:'postProduction'}`, `remainingTicks` held at 4 — is guaranteed by
the producing path (`enterPhase`/`allocateForPhase`); the invariant at ≈908–928
checks only a non-null blocker passing `isNextPhaseBlocker` (facility-capacity
OR set-unavailable, capability/targetPhase unpinned). P06 laws that need the
exact shape must rely on the producing path or add their own assertion, not on
this invariant's strength.

### 1.3 The unconditional release edge — the surgical site

`advanceManagedProductions()` (≈1312) has **two arms, and both blow through
releaseReady today**:

- **Legacy arm** (≈1322–1330, `operations.mode !== 'managed'`): maps every
  started production to `remainingTicks - 1`, unconditionally — including 1→0.
  Legacy mode carries no workflows (invariant: `legacy.workflows.length===0`).
  *The r1 annex was right about this arm; one campaign recon lane initially
  reported it absent and was corrected by direct read. The P06 gate MUST cover
  it: uncommitted legacy ready holds at 1 (inventing no workflow); committed
  legacy ready decrements.*
- **Managed arm** `nextRemaining===0` branch (≈1401–1417): sets ticks 0, calls
  `recordReservationTransition(events, workflow, [])` (deliberately written as a
  transition — the in-code comment anticipates a phase one day holding something
  at release), `removeManagedProductionWorkflow`, `progressed=true`. There is no
  blocked/waiting branch; the transition always succeeds.

A per-production phase/ticks agreement invariant (throws on disagreement) runs
each sweep — a held picture (ticks pinned at 1, workflow phase `releaseReady`)
satisfies it. **The clean lever is preventing the 1→0 decrement for uncommitted
ready pictures in BOTH arms**, so `tick.ts`'s collector never sees them; do not
intercept post-decrement.

The release gate is NOT a `FacilityCapability` blocker: `releaseReady` requires
nothing, the `nextRemaining===0` branch never calls `enterPhase`/allocator, and
the closed `ProductionBlocker` union + `assertStudioOperationsInvariants`
hard-code the existing three blocker kinds. The hold is expressed by the new
release-authority root plus the unchanged phase (`releaseReady` at ticks 1), not
by a new blocker kind.

### 1.4 The weekly batch (`src/core/tick.ts`)

Step 2 (≈421–427): `releasing = advanced.filter(p => p.remainingTicks === 0)`,
sorted ascending by plain-string id compare (N5, not localeCompare). Step 3
RECEPTION consumes the single sim-stream critic gaussian per release in that
order and reads set-uplift provenance from the **pre-advance** operations root
(≈474–476). Full verified step order: 0.5 script-dev, 0.6 casting, 0.7 scenery,
1 production advance (contains the 1→0 edge), 1.05 queue admission, 1.5
construction, 1.6 placement, 1.7 sets, 2 RELEASE, 3 RECEPTION, 3.5 weekly
theatrical revenue, 4 STANDING, 5 BROADCAST, 5.5 awareness drift, 6 development,
7 payroll, 7.5 overhead, 7.6 placed-facility opex, 8 contract expiration.
Steps 1.05/1.6/1.7/0.7/5.5 were insertions into this order, never reorderings
(their own comments date them to C2a, V12 and D-17B — several predate P05).

### 1.5 Decision ladder (`src/core/scriptReadModel.ts`)

`nextStudioDecision` (≈1268): 1) script review, 2) casting review, 3)
`nextProductionOperationsDecision` (≈1194) — which only inspects
`workflow.phase==='shooting'` with a non-null task. **A releaseReady picture is
invisible to the ladder; no decision stop exists for it.** P06 adds a fourth
tier (uncommitted ready, ascending id) with a new `StudioDecisionView` member.
`ProductionOperationsCommand` is a closed 3-member `Extract<Action,…>`;
`firstFilmJourney.commandGuidance` is exhaustive over it — adding a member
forces both files together (a useful compile-time completeness check, and a
single-owner file-lock point).

### 1.6 Journey guidance (`src/core/firstFilmJourney.ts`)

`releaseReady` guidance falls to the generic tail (≈1089–1118): headline
`RELEASE READY`, milestone "The final cut is complete.", and `next =
{kind:'advance-week', … site: null}` — literally "advance the week and the
picture releases itself." This copy is chartered REPLACE (Review/Hold/Commit and
site `'post'`).

### 1.7 Presence and availability (unchanged since P04)

`presence.ts` `attendanceForPhase`: `postProduction` → Director + craft(post);
`releaseReady` → nobody, unconditionally. `employment.ts` `busyTalentIds` =
production company ∪ active writing assignments, with **no phase awareness**: a
held ready picture keeps its whole company exclusivity-locked each held week —
exactly the talent-opportunity hold consequence Package 06 §13.3 requires the
Release Review to explain (this is the law, not a bug; the hold-consequence read
model derives from it).

### 1.8 Calendar copy (`src/core/studioCalendar.ts`)

`conditionalReleaseWeek = currentWeek + remainingTicks (+1 if not started)` and
`CONDITIONAL_RELEASE_ASSUMPTION` promise release conditional only on commands and
facility allocation. Once the gate exists this reads false for uncommitted ready
pictures — chartered read-model touch in W1 (an uncommitted ready picture has no
truthful release week; a committed one belongs to the next week).

### 1.9 Save law (`src/core/save.ts` + `src/core/index.ts`, unchanged since P04)

Live version **V15**; `GameStateV15 = GameStateV14` (no new roots since V14).
Precedent: each capability milestone minted its new top-level GameState root(s)
with its own version (V12 placement, V13 property, V14 several roots landing
together). **V16 mints exactly one: `releaseAuthority`** — a TypeScript storage
decision the design (§13.2) explicitly grants.
A V16 bump touches: `SaveFileV16` + union (≈338–343), `GameStateV16` in
types.ts, `validateSaveV16`/`makeSaveV16`/`migrateToV16`, the generic
dispatchers, `index.ts` re-export blocks (≈1091–1176), adapter
`importSaveJson`/`exportSaveJson` (live-wired to V15), bridge
`importSaveJsonV15` (session.ts ≈102–110 — bridge-owned, distinct from the
adapter's), `runtime-checkpoint.ts` live types, and
`bridge-contract-consumer-lock.ts` `CURRENT_ACCEPTED_SAVE_VERSION=15`. One
coordinated W1 cutover; only one wave owns the V16 mint.

---

## 2. Bridge/projection map — FINAL

| Seam | Final verified truth | P06 cut |
|---|---|---|
| `bridge/snapshot-build-context.ts` | `snapshotBuildContextFor(state)`: WeakMap-memoized lazy facts (saveJson/stateDigest/lotSnapshot/development/casting). | Add a `release()` lazy fact; fold into `projectStudioProjectionBundle` exactly as casting is. |
| `bridge/schema/bridge-schema.ts` | `PROTOCOL_VERSION=4`, `PROJECTION_VERSION=13`. `StudioProductionOperationsSnapshot` (≈295–382) carries `phase` AND the closed 14-member `operationalState` whose members 11–13 are `wrapped-waiting-for-post` / `post-handoff` / `release-ready` (literal final member: `status-unavailable`). `AVAILABLE_INTENT_KINDS` (13 members) includes `signContract`; `StudioBridgeIntentOption` already carries nullable `productionId` (how `resolveProductionBlocker` keys per-production commands). `REJECTION_CODES`: 12 members incl. STALE_REVISION / COMMAND_ID_REUSE / INTENT_NOT_AVAILABLE / ENGINE_REJECTED. | Add `release-committed` as the 15th `operationalState` member; add intent kind `commitPictureToRelease` (productionId REQUIRED non-empty for this arm); add the smallest closed release-review projection (§4 of the charter); bump `PROJECTION_VERSION` → 14. |
| `bridge/protocol.ts` | `SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`; currently `sha256:0474ceaf…`. | New id mints automatically from the schema change. |
| `bridge/session.ts` | `resolveAvailableIntents` (≈609–953): founding priority, then per-project intents; every managed production with a board command emits `resolveProductionBlocker` in ascending id; **`advanceWeek` is published only when `studioDecision(state)===null`** — no separate auto-roll fact exists. `command()` (≈1227–1287): session → idempotent replay → revision → availability → apply; accepted commands clear `pendingQuotes` (digest-bound) and journal once. Quote cache: one shared cap-16 map, kinds incl. casting `signContract`. `rolloverRuntime` re-imports via `importSaveJsonV15` + fresh sessionId, discards journal. | Release uses available-intent + `/command` — **no quote family** (nothing variable to draft; r1 §4.1 ruling confirmed). Publish the release decision + `automaticWeekRollEligible:false` + keep manual `advanceWeek` published when the only unresolved decision is release-review (the one deliberate change to the `studioDecision===null` gate). |
| `bridge/runtime-checkpoint.ts` | `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`: 12 entries (v4-early, v4, v5, v6, v7, v8, v9-early, v9, v10, v11, v12-stale-urn, v12); **current `0474ceaf…` NOT among them** (it is live). Prior-schema migration treats the old journal as opaque discarded history: revision→0, journal→[], re-imports the two save slots via the canonical chain; fails closed mid-founding. | Same change that bumps the schema appends `0474ceaf…` → `'projection-v13'`. W1 keeps the P05 schema on the CURRENT decode path (journal preserved); only after W2 mints the P06 id does P05 become prior (journal-discard semantics are the law for prior schemas). |
| `ui/src/engine/adapter.ts` | `advanceWeek` (≈2430) = tick + released detection + `simStopDetailFor`; `advanceToNextEvent` (≈2776) stops at first decision/stop-ladder event. `managedProductionBoardCard.currentFacility` for releaseReady = `'Theater / release desk (no facility reservation)'` (≈847); `managedWorkflowLocation` case `'releaseReady'` → `'theater'` (≈6108). | REPLACE both mappings: ready AND committed → `'post'` / Production & Post copy. Add the release decision to the ladder + a `releaseReview` stop. |
| `ui/src/engine/productionOperationsProjection.ts` | `closedOperationalState` (≈151–213) derives the 14 states; `wrapped-waiting-for-post` from the shooting+facility-capacity(post) blocker; `postProduction`→`post-handoff`; `releaseReady`→`release-ready`. `STATE_LABEL`/`NEXT_MILESTONE` cover all 14. Nothing models committed/released. | Extend the same closed enum with `release-committed`; labels/milestones for ready (uncommitted, "Next: release decision") and committed ("Releases next studio week"). |
| Contract pipeline | `npm run generate:bridge-contract` (writes schema.json + generated C# + manifest, `--check` mode), `generate:bridge-contract:fixtures`, `verify:bridge-contract-consumer` (real two-repo pinned-consumer verification + attestation modes; CF-09), CF-08 deterministic union ordering + generator tests sealed at the static gate. `test:bridge` runs checks + bridge tests. | Run the full pipeline on every wire change; regenerate, never hand-edit; keep generator tests green; re-verify the exact Unity consumer. |
| `bridge/casting.ts` | Three-part pattern: `castingProjection` (pure read models) / `castingDraftToEngine` (draft→engine payload, legality deferred to engine) / `castingQuoteSnapshot` (consequence from a discarded preflight successor). | Template for the release projection (projection part only — no draft/quote parts needed). |

## 3. Player-journey / talent surfaces (for the Living Studio Command Layer)

Verified: a P06 movie-rail row (title / phase / department / waiting state /
action-required / blocked / Locate) is derivable **entirely from existing wire
truth** — `ProductionOperationsState.operationalState` + `stateLabel` +
`blockerAnatomy` (effect/cause/consequence/holders/projectedWeeks/remedies) +
`worksiteResolution`/`locateTargets` on `StudioLotSnapshot`. Facts that matter:

- `studioQueueView` is the single need/holder/estimate/remedy authority;
  `CAPABILITY_LABEL.post='Post Building'`; waiting-for-Post copy sources here.
- Casting liveness is end-to-end wired: `castingPackageReadModel.returnWeek`
  (the week the seat frees at RELEASE — `market.tick + remainingTicks`; the
  code comment's "wrap week" label is wrong, since `busyTalentIds` is
  phase-blind and holds the company through release — or script dueWeek),
  busy-but-visible pool rows, `package-staffing` shortage with exact counts;
  `bridge/casting.ts` copies `returnWeek/availabilityLabel/currentWorkLabel`
  verbatim; `hiringCandidateSnapshot` is the separate market row.
  **Hold-law truth seam (hostile-review F4):** once W1 pins an uncommitted
  ready picture at tick 1, `week + remainingTicks` would promise "returns next
  week" every held week, forever — a standing false availability claim on the
  wire. `returnWeek` (and its wire copies/labels) is therefore part of W1's
  truthful-release-week sweep alongside `studioCalendar`: a held uncommitted
  picture's company has NO truthful return week (publish the held-for-release
  fact, not a week); a committed picture's returns next week. With that sweep,
  the P06 talent entry point renders existing truth; no other new engine truth.
- `publicityOffers` ride the snapshot field-for-field (`LotPublicityOffer`);
  `marketingLevelsFor`/`Production.budget.marketing` single-source the
  Release-Review marketing rows. Render-only.
- Wrap identity exists in three windowed representations (studioWeekTheater
  `wrap-clearing`; snapshot `weekEvents` `wrapped`; nextEvent target `wrap`) —
  P06 consumes, never unifies-by-guess.
- **No premiere/release beat, stop reason, or theater subject exists anywhere**
  (`EXACT_STOP_REASON_LIST` excludes release; `TheaterSubjectKind` has no
  premiere). The committed-dispatch cue and the `releaseReview` stop are new,
  chartered work — not derivable reads.
- Optionality trap: `operationalState`/`stateLabel`/`blockerAnatomy` etc. are
  OPTIONAL on the TS type for fixture back-compat but always emitted in managed
  mode — consumers gate on `operationsMode==='managed'`, never on field
  presence alone.
- `JOURNEY_SITE_BUILDING` already maps semantic site `post` → building `post`.

## 4. Unity architecture map — FINAL

| Seam | Final verified truth | P06 cut |
|---|---|---|
| `Infrastructure/StudioStagePresentationRegistry.cs` | Register/Unregister keyed by presenter `StageBuildingIdentity` (blank refused, diagnostic-only); `Apply` iterates in ordinal key order; duplicate identity ⇒ withhold ALL claimants; per-presenter try/catch; static `ResolveRowByBuildingId` = the one exact-ID resolver. | Copy the shape verbatim as `StudioPostPresentationRegistry` + `IStudioPostPresenter` (W3). |
| `Presentation/StudioBridgePresentation.cs` | `CacheSceneObjects` (one Awake discovery pass) builds `personSlots` (the lot-wide talentId→body index; stale-evicted per ApplyPeople) and registers stage presenters. `Apply` order: ApplyBuildingStates (generic, ALL buildings incl. post/theater — **no post/theater-specific code exists anywhere in this file**) → stages/sets → placards → production → vehicle → construction → people. | Integration-owner file (W8/lead only): register the Post presenter/registry in CacheSceneObjects + add ApplyPost states hook. Person mapping: reuse `TryGetAuthoritativePersonStableId`; no second registry. |
| `Editor/Authoring/StudioLotArchitectureAuthoring.cs` | `BuildProductionSupport` (≈848): group `09_Production_And_Post`, `AddSelectable(root,"post","Production & Post","Editorial and music departments working",…)` — static copy, no presenter. `BuildTheater` (≈209): selectable `theater`, static copy. Untouched by P05. | W4 attaches the Post presenter component + state roots; the static status string is replaced by DTO-driven truth. Theater untouched (post-release owner only). |
| `UI/StudioWorkspaceHost.cs` | Exactly two mutually-exclusive routes: Casting (retained draft, discard prompt) and Production (stateless, `OpenProduction(productionId)`, no draft) toggled by `productionRouteOpen`; per-frame `MaintainOperationGate`/`MaintainLocateGates` gated on that bool; `TryConsumeCancel` route-aware; `SuspendForLocate`/`OnNavigationOriginRestored` preserves the open route. | W5+W8: refactor the two-bool toggle into a route enum BEFORE adding the Post/Release route (named collision risk); new route follows the Production stateless/no-draft model; new pending command id + accepted/rejected branches; per-frame Maintain* for the new route in its own guarded block. |
| `UI/StudioProductionWorkspace.cs` + `Infrastructure/StudioProductionWorkspaceContracts.cs` | Pure decision layer: `DecideOperation` requires exact `row.currentCommand.productionId===row.productionId`, scans published intents for exact kind+productionId (duplicate ⇒ `ReasonAmbiguousPublication`; none ⇒ `ReasonNotPublished`; `!actionsEnabled` ⇒ `ReasonSettling`); `SelectionAfterRebind` pins by exact id; `NowSentence`/`ActionRequiredBanner` switch over the generated `operationalState` values (PostHandoff/ReleaseReady/WrappedWaitingForPost cases already exist). Controller: `Configure` wires 5 outward funcs; `ExecuteOperation` re-decides at activation, single-flight per productionId. | The exact template for `ReleaseDecisionState` (one pure static Decide + reason constants + per-frame re-gate + exact-id intent match). Extend `NowSentence` vocabulary with the committed state. |
| `Infrastructure/StudioCastingShortageContracts.cs` + `UI/StudioCastingWorkspace.cs` | `Decide()`: one pure static function, fixed 10-state precedence, ONE decision object rendered and clicked from the same instance; `RequiredDistinctActors=3`; talent-market lane through the shared single-flight `/quote` channel. | Preserve untouched (P05 regression floor). Pattern reference for any P06 banner decision. LSCL talent entry point binds the same market facts read-only. |
| `Infrastructure/StudioBridgeClient.cs` | `ActionsEnabled` = live ∧ !inFlight ∧ !pendingPost ∧ continuity-match. `FindFirstIntent(kind)` (first-match) backs advanceWeek/startConstruction only; casting used exact scans + quote channel. Cede-ownership: `presentIntentOwners` HashSet; `SetWorldTimeOwnerPresent` (advanceWeek), `SetCastingOwnerPresent` (3 casting kinds); **no Post/Release membership exists**. | W5: `SetReleaseOwnerPresent` mirroring casting (OnEnable/OnDisable exactly once); Release lookup is exact kind+productionId — never FindFirstIntent. Audit ActionsEnabled sibling consumers (menu/time/workspaces) at seal. |
| `Presentation/StudioLivingTime.cs` + Hud | Byte-unchanged since P04A.2. `RollVerdict.Classify(client.FindFirstIntent("advanceWeek"))`: Roll iff present — intent presence IS auto-roll permission; HUD has pause/resume + speed multipliers, **no single-week button**. | W5: consume the projected `automaticWeekRollEligible` fact for auto-roll; add the HUD-owned `Advance one week` single-shot over the manual intent; narrow fallback stays the unceded memo. No C# stop ladder. |
| `Presentation/StudioProductionRailHud.cs` | Untouched since P04A.1; carries every published board row + overflow voice. | LSCL: extend rows with lifecycle vocabulary/attention from `operationalState`; remains a shortcut, never seeds world context. |
| Evidence/proof | See §5. | — |

## 5. Evidence/proof infrastructure — FINAL

- **Fixtures:** `scripts/gen-p05-visual-oracle-fixtures.mts` (vite-node) builds
  all scenario GameStates through public actions from a shared base, performs one
  recorded exact-token id normalization, emits save+checkpoint pairs
  (sessionId=`p05-oracle-<id>`, revision 0, journal []) + a self-verifying
  manifest (sha256 per artifact, publicActionDerivation, machineAssertions).
  P06's six scenes follow this format exactly (new generator
  `gen-p06-visual-oracle-fixtures.mts`, sessionId=`p06-oracle-<id>`).
- **Runners:** `StudioProductionOracleRunner.cs` — scenario table keyed by id;
  boot gates on Live + ActionsEnabled + exact sessionId + week; frozen camera
  tuples through the player rig; atomic staging-PNG + decode-verify + refusal if
  revision/digest moved during capture; one atomic sidecar per scene (full
  identity + machine assertions + visual questions + artifact hashes). P06 adds
  its scenes to this pattern (own runner or extended table — W7 decision).
  `StudioProductionJourneyProofRunner.cs` (4M, UI Toolkit queries + reflection,
  bounded retry, Esc grammar) is the machine-journey pattern.
- **Launchers:** `Tools/p05-run-visual-oracle.sh` / `-machine-journey.sh` /
  `-hid-journey.sh` / `p05a3-run-acquisition-journey.sh` — the CF-02 binding
  family: exe-sha vs build-manifest, stale-Assets refusal (`find -newer`),
  evidence-collision refusal, mktemp runtime seeded with the checkpoint,
  capability-scoped env, health poll, cursor-park before boot, 3s reactivation
  cadence, post-run exe re-verification, scrubbed logs, `run-binding.json`
  (checkpoint sha, exe sha, both commits, runner-source sha, PID, viewport,
  exit). P06 launchers are copy-adapts with fresh ports. In-use across Tools/:
  43200/43210/43217/43219 (p03a/p04a/cp9 scripts) and 43230/43261/43251/43253/
  43254/43298 (P05 family).
- **HID driver:** `Tools/p05-proof-journey.mjs` + `p05a3-acquisition-journey.mjs`
  — real CGEventPost via `Tools/ownerinput`; element-map + contentRect/backing-
  scale coordinate model (calibrated — copy, never re-derive); per-step
  `screencapture -l <windowId>`; report JSON with failures count.
- **Build:** Editor `StudioAutomation.BuildMacOS` (canonical scene validation +
  BuildPipeline) then `Tools/p04a1-build-manifest.sh` (env CLIENT_REPO/TS_REPO —
  defaults are stale, always override) → `build-manifest.json` (exe sha,
  Assembly-CSharp sha, engine-bundle sha, both commits + dirty flags).
- **Owner profile:** durable original at `~/Library/Application Support/Project
  Studio/bridge-runtime/bridge-runtime-v1.json`. Campaign baseline byte-copy
  (post-P05-acceptance state, sha256 `d949003e…`) at `/Users/bruce/Project
  Studio Owner Profile Baselines/P06-campaign-start-20260901/`, chmod 400.
  Journey launchers clone a copy-of-copy into their mktemp runtime; the P05A3
  `P05A3_PROFILE` default path points into a dead session scratchpad — P06
  scripts must point at the campaign baseline instead.
- **Persistence probe:** `p05a3-persistence-probe.sh` boots a second engine on
  the journey's durable runtime dir and writes `persistence-verdict.json`; the
  orchestration glue that co-locates it with journey evidence is manual — P06
  wires it explicitly in its launcher.
- **Honest gap:** no `valid/stale/unreadable/absent` artifact-status vocabulary
  exists in code. P06 W7 authors it fresh (per readiness gate row).

## 6. Release authority — FINAL frozen design (W0)

### 6.1 Persisted shape (separate exact-ID root; V16)

```text
GameStateV16 = GameStateV15 + releaseAuthority: StudioReleaseAuthority

StudioReleaseAuthority = { commitments: readonly ReleaseCommitment[] }   // canonical ascending productionId order
ReleaseCommitment      = { productionId: string,                          // exact active Production id
                           commitmentId: string,                          // `release-commitment-${productionId}` — deterministic, no RNG/clock/order input
                           committedAtWeek: number }                      // authoritative studio week at acceptance
```

Absence = uncommitted. Rows exist only for an active `releaseReady` tick-1
production (validated at save boundaries and tick entry; orphan/duplicate/
non-ready ⇒ fail closed). Removed atomically when the production releases.
Production-leaf and workflow-leaf storage remain rejected (r1 §6.1 comparison
stands; the root-per-version precedent V12–V14 confirms the pattern).

### 6.2 Action, intent, events

- Core action `commitPictureToRelease { kind, productionId }` — added to the
  `Action` union + `applyActions` switch (exhaustiveness-forced). Validates
  active production, ticks===1, managed workflow at `releaseReady` (or legacy
  equivalent), no existing row (duplicate ⇒ refusal naming the existing
  commitment). Appends the row in canonical order; appends exactly ONE permanent
  `releaseCommitted { productionId }` studio event (the deduplication witness
  for world cues); touches no cash/RNG/time/reservations/presence.
- Bridge intent kind `commitPictureToRelease`, option `productionId` REQUIRED
  non-empty for this arm; published per uncommitted ready picture in ascending
  id; digest-bound; dispatched via existing `/command` (no quote family).
  Duplicate/stale behavior is the unchanged session law (journal replay /
  STALE_REVISION / INTENT_NOT_AVAILABLE); the core refusal for a direct
  duplicate action names the existing commitment.

### 6.3 The gate (both arms) and the admission witness

`advanceManagedProductions` gains the pre-advance committed set (derived from
`state.releaseAuthority` by the tick, after entry validation):

- managed `nextRemaining===0` branch: uncommitted ⇒ settle at ticks 1, keep
  workflow, no event; committed ⇒ existing behavior (decrement, transition
  record, workflow removal) + id into the admission witness.
- legacy map: `remainingTicks===1 && !committed` ⇒ hold at 1 (no workflow
  invented); committed ⇒ decrement + witness.

`tick.ts`: before RECEPTION, assert exact set equality between the zero-tick
collection and the admission witness; fail closed on mismatch. Batch order stays
the untouched plain-string id sort; commitment/click/insertion order is never
consulted. Final returned state prunes exactly the released rows and re-validates
invariants. Committing C then D equals committing D then C in admitted ids,
FilmResult/RNG/economy/premiere order — command history alone truthfully
differs.

### 6.4 Decision ladder / time control

- `nextStudioDecision` tier 4: first uncommitted ready production (ascending id)
  ⇒ new `StudioDecisionView` member `{kind:'release-review', productionId}`.
- Bridge publishes `automaticWeekRollEligible:false` while any decision stop is
  live, AND keeps publishing the manual `advanceWeek` intent when the ONLY
  unresolved decision is release-review (the one deliberate change to the
  `studioDecision===null` intent gate — manual advance stays legal during a
  hold; other decision kinds keep today's suppression).
- Adapter `advanceToNextEvent` stops at the release decision with a new
  `releaseReview` stop reason (closed unions in `nextEvent.ts` + stop ladder
  extended together).
- Unity Living Time consumes `automaticWeekRollEligible` (W5) — intent presence
  stops being auto-roll permission; the HUD gains the one `Advance one week`
  single-shot.

### 6.5 Save migration law

Unchanged from r1 §6.5, now with concrete versions: V15→V16 migration creates an
empty `releaseAuthority`; every pre-P06 ready save imports uncommitted; V16
imports validate + preserve rows; migration mints no event/receipt/week/RNG.
The W1 cutover updates every live consumer enumerated in §1.9 in one compile-safe
change. W1 keeps schema `0474ceaf…` current (journal preserved); W2's schema
mint moves it to prior (governed journal-discard).

### 6.6 Projection (W2)

Smallest closed extension: `operationalState` gains `release-committed`;
production operations rows gain the release-decision facts (committed state +
commitmentId + committedAtWeek where committed); one release-review projection
per uncommitted/committed ready picture (title/genre/id, authority state, legal
commit + structured refusal, frozen outlook + provenance, already-paid
production/marketing, hold consequences [busy identities + economy-gated weekly
exposure], unknown-after-commit list); plus `automaticWeekRollEligible` and the
next-event stop reason. `StudioReleaseResultsProjectionSchema` untouched (P07).
PROJECTION_VERSION 13→14; full generate/verify pipeline; prior-schema append.

## 7. World-owner contract

r1 §7 stands (zero/one/several/stale/disappear/demolition/missing-body rows)
with the founding-body scope ruling from the readiness gate: the `post` body is
the world anchor; exact core facility ids label rows; placed facilities without
bodies are honest `Locate unavailable` cases; never first-match.

## 8. Visual direction reconciliation

r1 §8 stands. Campaign research adds (bounded delta, sources in
`docs/research/P06-LIVING-STUDIO-REFERENCE-DELTA.md`): the original game had no
distance-visible building state cues (new design surface — restrained shaped
badges are additive, not parity); original movie cards used stage-icon + status
string, never a percentage (confirms the no-progress-bar law); comparator
patterns (badge→pre-filtered flow routing, cause-list + remedy-button tooltips,
inline consequence deltas at the commit button, worst-first badge culling) map
directly onto the chartered surfaces; UI Toolkit facts (ListView identity via
userData, no world-space production readiness → TMP billboards, batchmode
capture unreliability → interactive capture, no screen-reader support — scope
accessibility claims to focus/keyboard/text-scale honestly).

## 9. Proof pyramid

r1 §9 stands with these bindings: Level-1 additions run under `npm test` /
focused vitest; Level 2 = the §2 contract pipeline; Level 3 = Unity EditMode
(699 green baseline); Level 4 = exactly six P06 scenes (Idle Post / Wrapped-
waiting / Active finishing / Release Ready / Committed / Multi-picture
contention) via the §5 fixture+runner+launcher patterns; Level 5 = Owner journey
on the campaign baseline profile copy. The real profile currently holds THREE
in-flight productions (ticks 5/6/8) — the multi-picture Post contention scene
occurs naturally on the real-profile journey.

## 10. P07 boundary

r1 §10 + the machine-readable handoff checklist stand unchanged.

## 11. Collision ownership — FINAL

| Concern | Owner | Exact locked paths |
|---|---|---|
| Core release + V16 cutover (W1) | Core Release owner | `src/core/types.ts`, new `src/core/releaseAuthority.ts`, `operations.ts` (both arms), `tick.ts`, `actions.ts`, `save.ts`, `index.ts`, `productionIdentity.ts`, `scriptReadModel.ts`, `firstFilmJourney.ts`, `studioCalendar.ts`, `castingPackageReadModel.ts` (`returnWeek` truth sweep), `ui/src/engine/adapter.ts` (save + ladder seams), `bridge/session.ts` live-save arms + the one-line manual-advance intent-gate carve-out (charter W1/F7), `bridge/runtime-checkpoint.ts` live-save arms, `bridge/casting.ts` returnWeek wire labels, focused tests |
| Projection/contract (W2) | Contract owner | `bridge-schema.ts`, `snapshot-build-context.ts` (release fact), `session.ts` projection/intent arms (EXCLUDING the W1-owned manual-advance carve-out line), generated outputs + manifest, `productionOperationsProjection.ts`, `StudioLotSnapshot.ts` extensions, contract tests |
| Unity registry/world (W3/W4) | Unity World owner | new `StudioPostPresentationRegistry.cs`, new Post presenter, authoring additions, focused EditMode tests |
| Unity workspace/time (W5) | Unity Workspace owner | new Release workspace + contracts + UXML/USS, `StudioLivingTime*.cs`, rail extension, focused tests |
| Continuity/proof (W6/W7) | Proof owner | `bridge/proof.ts`, fixtures generator, runners/launchers/sidecars |
| Shared integration | Lead only (W8) | `StudioBridgePresentation.cs`, `StudioWorkspaceHost.cs` route refactor, `StudioBridgeClient.cs` cede additions, bootstrap/scene |

Single-file lock points called out to every lane: the `Action` union +
`applyActions` switch; `ProductionOperationsCommand` + `commandGuidance`;
`operations.ts` ≈1322–1417; `tick.ts` step 2; the V16 mint (exactly one owner).

## 12. Hard exclusions

Unchanged from r1 §12.
