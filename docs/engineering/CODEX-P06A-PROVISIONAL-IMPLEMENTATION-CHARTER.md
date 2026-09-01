# Project: Studio — P06A Provisional Implementation Charter

**Revision: P06A-IMPLEMENTATION-CHARTER-r1-PROVISIONAL**
**State: PRE-P05 OWNER ACCEPTANCE — NO-GO**

> # NOT AUTHORIZED FOR IMPLEMENTATION
>
> This charter is a documentation-only future-work envelope. P05 is not Owner-accepted, its final
> architecture is unknown, and no P06 production, generated-contract, Unity, asset, scene, proof or
> runtime work may begin from this revision.

The package becomes eligible for final reconciliation only after the exact post-P05 refresh in the
last section. Even a final charter does not replace explicit Owner authorization to implement P06.

---

## 1. Unresolved final-P05 placeholders

Every placeholder below is intentionally loud. Accepted P04 values and P05 WIP observations must
not be substituted for final P05 truth.

| Required placeholder | Current value |
|---|---|
| `FINAL_P05_TS_SHA` | **UNRESOLVED — P05 NOT OWNER-ACCEPTED** |
| `FINAL_P05_UNITY_SHA` | **UNRESOLVED — P05 NOT OWNER-ACCEPTED** |
| `FINAL_P05_SCHEMA_ID` | **UNRESOLVED — DO NOT COPY P04/WIP SCHEMA** |
| `FINAL_P05_PROTOCOL_VERSION` | **UNRESOLVED — DO NOT COPY P04/WIP PROTOCOL** |
| `FINAL_P05_PROJECTION_VERSION` | **UNRESOLVED — DO NOT COPY P04/WIP PROJECTION** |
| `FINAL_P05_SAVE_VERSION` | **UNRESOLVED — DO NOT COPY P04 SAVE V15** |
| `FINAL_P05_WRAP_HANDOFF` | **UNRESOLVED — exact condition/event/resource-release/current-owner symbols required** |
| `FINAL_P05_POST_FACILITY_SEAM` | **UNRESOLVED — exact facility/slot/body registry and missing-body policy required** |
| `FINAL_P05_VISUAL_ORACLE_SEAM` | **UNRESOLVED — exact manifest/writer/runner/artifact status required** |

Required companion inputs, also unresolved:

- `FINAL_P05_TS_BRANCH`
- `FINAL_P05_UNITY_BRANCH`
- `FINAL_P05_TS_CHANGED_PATHS`
- `FINAL_P05_UNITY_CHANGED_PATHS`
- `FINAL_P05_GENERATED_CONSUMER_HASH`
- `FINAL_P05_CONTRACT_MANIFEST_ID`
- `FINAL_P05_TEST_COUNTS_AND_SEALING_ARTIFACTS`
- `FINAL_P05_OWNER_ACCEPTANCE_RECORD`
- `FINAL_P05_PRODUCTION_RAIL_AND_WORKSPACE_SEAM`
- `FINAL_P05_PERSON_BODY_REGISTRY_SEAM`
- `FINAL_P05_SNAPSHOT_BUILD_CONTEXT_SEAM`
- `FINAL_P05_LIVING_TIME_AND_NEXT_EVENT_SEAM`

All discoverable P05 WIP is **UNSEALED FORWARD EVIDENCE**. It may identify collisions, never fill a
placeholder.

---

## 2. Entry gate

### 2.1 Mandatory preconditions

W0 may enter once items 1–8 below are supplied after P05 Owner acceptance. No implementation wave
W1–W8 may enter until all twelve items are true. W0 is the documentation-only activity that
produces items 9–10; it never authorizes W1.

1. P05 is technically sealed and Owner-accepted.
2. The final TS/Unity branches, full SHAs, exact changed paths and local/remote equality are supplied.
3. Worktrees and the tested manifest are clean and bind the accepted bytes.
4. Final schema/protocol/projection/save versions and exact generated-consumer hashes are supplied.
5. The generated-contract gate is accepted, including sound union generation and exact Unity
   consumer verification.
6. Exact Wrap condition, Stage/Set/scenery/task release and post-Wrap owner are pinned.
7. Exact Post facility/waiting/slot/body facts and safe missing-body policy are pinned.
8. Final N-Stage registry, person/body index, presence routing, Production Rail/workspace, shared
   host, input/menu/Back/Locate, Living Time/Next Event, snapshot-builder and evidence-manifest
   seams are pinned.
9. The r2 readiness gate says GO and the r2 recon has no unresolved P05-dependent item.
10. This charter is restamped FINAL after changed-path-only reconciliation.
11. The Owner explicitly authorizes P06 implementation.
12. Clean isolated implementation worktrees and one-owner file reservations exist.

Until then, the only permitted activity is the final documentation refresh.

### 2.2 Package goal and stopping boundary

Future authorized P06A implements exactly:

> wrap → exact Production / Post owner → autonomous active Post → Release Ready held uncommitted →
> explicit exact-ID `Commit <title> to Release` → persisted committed state → one dispatch
> acknowledgment → Save/Load → **STOP before P07 result interpretation**

P06 may mechanically prove committed-only next-week batch admission and exact `FilmResult` append
headlessly. It may not present or interpret the result in the P06 journey.

### 2.3 Product laws carried into every wave

- TypeScript owns state, time, capacity, legality, commitment, save, RNG, result and economy.
- Unity owns presentation, selection, input, camera, local workspace state and dispatch of current
  opaque intents.
- One exact `productionId` crosses world, projection, intent, receipt, save and batch.
- Production / Post works from the world without Production Rail priming.
- Selection/open/Back/Hold mutate nothing; only the final title-bearing action commits.
- Release Ready holds at tick 1 until committed.
- Commit advances no time and produces no result/run/RNG/debit.
- The next week releases committed ready pictures only in the existing ID-sorted batch.
- Both managed and legacy production arms obey the same hold/admission law; legacy hold invents no
  workflow.
- Explicit manual Advance Week remains legal while TypeScript separately blocks automatic Living
  Time and Advance to Next Event at an unresolved Release Ready decision.
- Waiting, active, ready, committed, released and in-theaters remain distinct.
- One pure `ReleaseDecisionState` owns all decision copy and enable/pending/stale terms.
- Every enabled visible action acts or gives a reason; every disabled action names cause and remedy.
- Poll/request state cannot latch a control disabled.
- Exact ID beats first/title/position/proximity/array order everywhere.
- Exact Director + craft attend active Post; cast do not edit; ready/committed have no Post presence.
- Lot remains dominant; mockups are directional, not pixel contracts.
- World, machine, visual, HID and Owner proof remain separate.
- Technical KEEP remains pending until Owner acceptance.

---

## 3. Provisional release-state freeze for wave planning

Subject to W0 final comparison, the preferred persisted shape is one exact-ID release-authority
root:

```text
GameState.releaseAuthority.commitments[]
  productionId
  commitmentId
  committedAtWeek
```

Absence means uncommitted. Rows serialize in canonical production-ID order; array/insertion/click
order has no semantic effect. A row exists only for an exact active `releaseReady` tick-1
Production. It is removed atomically when the Production releases; current studio events and
`FilmResult` remain durable history.

Provisionally, `commitmentId` is deterministic from the never-reused production ID plus a frozen
authority namespace. Minting it consumes no simulation RNG, wall clock, event sequence, insertion
position or click order. One commitment transition/event and one accepted-command receipt may
truthfully retain each production's command history; those histories never order the release batch.

A required Production leaf is the documented fallback if final P05 makes it materially smaller and
safer. Workflow storage, bridge-journal-only storage and a new committed workflow phase are rejected.

The weekly transaction derives exact admitted release IDs from the pre-advance root, applies the
same gate to managed and legacy production arms, asserts exact equality with zero-tick IDs before
reception/RNG, and prunes exactly released rows only in the final returned state. Its admission
witness is ephemeral and never becomes another persisted authority.

The intended command path is the existing digest-bound available intent through `/command`, with
exact `productionId`, `expectedStateRevision`, opaque `intentId` and `commandId`. A new `/quote`
family is not provisionally justified because Release has no variable user draft, debit, date or
campaign choice.

A save-version bump relative to `FINAL_P05_SAVE_VERSION` is provisionally mandatory. Migration of
a pre-P06 envelope creates an empty release-authority root, so every Release Ready picture imported
from a pre-P06 save is uncommitted. Current-version P06 imports preserve and validate commitments.

---

## 4. File-owner and collision doctrine

The table gives concern-level reservations. W0 must replace provisional paths with exact final P05
paths before implementation.

| Lane | Single editing owner | Likely owned paths | Never co-owned |
|---|---|---|---|
| Core Release + live-save cutover | **Core Release owner** | `src/core/types.ts`, focused release module, `productionPhases.ts`, `operations.ts`, `tick.ts`, `actions.ts`, `save.ts`, `index.ts`, identity/decision modules, `ui/src/engine/adapter.ts` live import seams, `bridge/runtime-checkpoint.ts` live-save arms, and `bridge/session.ts` live-save arms in W1 | No contract/Unity/proof editor touches these during W1/W6; bridge files transfer only after W1 seals |
| Projection/contract | **Contract owner** | final snapshot-build context, `bridge/schema/bridge-schema.ts`, JSON schema, `bridge/session.ts` projection/intent arms and `bridge/runtime-checkpoint.ts` prior-schema registration in W2, generator invocation/output, exact-consumer manifest, contract tests | Generated files are never hand-edited; W1 current-schema/save ownership must be closed before W2 begins |
| Unity facility registry/world | **Unity World owner** | final P05 registry, new Post registry/presenter, exact person/body consumer, focused EditMode tests | No workspace/proof owner edits shared registries |
| Unity workspace/time consumer | **Unity Workspace owner** | final Production/Post inspector, Post workspace, Release Review, UXML/USS, pure decision state, `StudioLivingTime.cs`, `StudioLivingTimeHud.cs` and focused tests | No new host/input/menu/camera/bridge store; no client-side stop ladder or hidden manual-time owner |
| Proof/Oracle | **Proof owner** | final evidence manifest/writer extension, exact fixtures, P06 runner/sidecars/reports | Does not edit product behavior or weaken assertions |
| Integration | **Lead integrator** | final `StudioBridgePresentation`, bootstrap, bridge client routing, shared workspace router, system menu/input/camera shared paths, scene/authoring registration | Feature owners stop before integration; one checkout/file owner |
| Hostile review | **Fresh read-only reviewer** | no editing ownership | Findings return to the relevant single owner; reviewer does not silently patch |

Any shared file discovered outside these lanes stops the affected wave until one owner is named.

---

## 5. Provisional implementation waves

Every wave below is future work only. “Runtime requirement” states what a later authorized wave may
need; it records no activity performed during this documentation package.

### W0 — Final P05 delta and contract freeze

**Dependencies**

- items 1–8 of §2.1, but not the W0-produced r2/final stamps or final P06 authorization;
- final accepted P05 TS/Unity SHAs and changed paths;
- exact P05 Owner acceptance and test/proof record.

**Likely files**

- these three P06A documents;
- exact final P05 changed paths, inspected read-only;
- final schema/manifest/generated consumer, inspected read-only;
- no P06 production file.

**Single owner**

- P06 lead/recon owner; no delegated editor on these three documents.

**Permitted work**

- inspect only the P05 delta and final current seams;
- replace all placeholders;
- settle separate-root versus Production-leaf storage with a written invariant/diff comparison;
- freeze decision priority, save version, intent name, projection root, Post body policy, exact
  manual-versus-automatic time-control split, shared owners and test counts;
- refresh collision reservations and stamp the three FINAL document revisions.

**Forbidden work**

- production/generated/Unity edits;
- comparative research restart, broad historical archaeology or P05 redesign;
- assuming any WIP path survived;
- starting W1 before explicit Owner authorization.

**Tests / evidence**

- static path/SHA/version/manifest parity checks only;
- baseline test counts are recorded from final P05 artifacts, not rerun unless the final refresh
  contract separately requires a check-only command;
- document lint/placeholder/scene-count/boundary validation.

**Runtime requirement**

- none: no Unity, player, bridge, supervisor, HID or screen control.

**Stop condition**

- stop on a missing SHA/path/version/cleanliness fact, unresolved same-level product conflict,
  generated-consumer drift or unowned shared path.

**Rollback**

- documentation-only revert to r1; leave all production repositories and accepted branches
  untouched.

### W1 — TypeScript Release Ready/commit state and migration

**Dependencies**

- W0 final/frozen and explicit Owner implementation authorization;
- clean isolated TS worktree at `FINAL_P05_TS_SHA`;
- one Core Release owner and exact tests reserved.

**Likely files**

- `src/core/types.ts`;
- a focused new `src/core/releaseAuthority.ts` or final W0 equivalent;
- `src/core/operations.ts`, `src/core/tick.ts`, `src/core/actions.ts`;
- `src/core/save.ts`, `src/core/index.ts`, `src/core/productionIdentity.ts`;
- `src/core/scriptReadModel.ts`, `src/core/firstFilmJourney.ts`;
- `ui/src/engine/adapter.ts` live import/export and decision-selector seams;
- `bridge/session.ts` live-save/import/load/rollover arms and `bridge/runtime-checkpoint.ts`;
- focused release/migration/checkpoint/next-event/identity tests.

**Single owner**

- Core Release owner is the sole editing owner for every W1 path. W2 Contract ownership of
  `bridge/session.ts` starts only after W1 seals.

**Permitted work**

- persisted uncommitted/committed authority;
- exact-ID commit application with deterministic production-derived commitment identity and no
  time/RNG/wall-clock/order/debit/result input;
- managed and legacy uncommitted hold at tick 1 without inventing a legacy workflow;
- pre-advance exact-ID admission witness, committed-only terminal admission, pre-RNG equality check
  and exact final commitment pruning;
- current decision selector, manual Advance legality and separate automatic-roll/Next-Event stop;
- coordinated live save/type/export/import/checkpoint migration across Core, adapter and bridge;
- final-P05 **current-schema** checkpoint/journal/rollover preservation; do not place its current
  schema ID in a prior-schema map during W1;
- exact busy-for-assignment hold consequence that remains distinct from Post presence.

**Forbidden work**

- reception, critic/audience/box-office, standing, theatrical-run or economy retune;
- new Post phase/subphase, cancel commitment, release fee/date/marketing;
- Unity or user-facing browser presentation work; the bounded adapter engine/save seams above are
  permitted;
- preserving old auto-release semantics for ready pictures imported from pre-P06 saves.

**Tests / evidence**

- transition/invariant truth table;
- migrate all supported pre-P06 save versions and the ready-at-final-P05 fixture to uncommitted;
  round-trip a current-version committed fixture without loss;
- managed and migrated-legacy Hold + Advance Week; Commit; direct exact-ID Core duplicate returns
  `ALREADY_COMMITTED`; exact-ID/same-title isolation;
- malformed zero/uncommitted, duplicate/orphan commitment and admission-witness/pruning mutation
  tests before reception/RNG;
- reverse click order and uncommitted exclusion, comparing admitted IDs and ID-sorted
  FilmResult/RNG/economy/premiere order rather than causally different commitment/receipt history;
- batch/RNG/economy/premiere golden comparison against final P05 law; validate save invariants
  without requiring different command histories to serialize byte-identically;
- compile every live save consumer; final-P05 current-schema checkpoint and journal rollover retain
  session/idempotency state; save/load/export/import and mutation-check each new guard.

**Runtime requirement**

- Node/TypeScript only; no Unity or live bridge.

**Stop condition**

- any canonical batch/RNG/economy drift, optional-field migration shortcut, hidden auto-release,
  stale V15/current-save consumer, checkpoint/journal loss, P07 result change or enforcing-layer
  disagreement.

**Rollback**

- revert the isolated W1 commit as a unit; restore final P05 byte behavior and discard migrated
  fixtures created only for W1.

### W2 — Post/Release projection and generated consumer

**Dependencies**

- W1 Core state/test seal;
- final P05 snapshot-build context and generated-contract gate;
- one Contract owner; Unity consumer path pinned.

**Likely files**

- final snapshot projection builder (currently rooted through `ui/src/engine/adapter.ts` and
  `bridge/session.ts`);
- `bridge/schema/bridge-schema.ts`;
- `bridge/schema/runtime.ts` strict consumer;
- `bridge/schema/project-studio-bridge.schema.json` (generated);
- `bridge/session.ts`, focused projection/intent tests;
- `bridge/runtime-checkpoint.ts` prior-schema registration/migration after the new P06 identity is
  minted;
- `generated/unity/StudioBridgeDtos.Generated.cs` (generated);
- Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` (generated consumer);
- final contract manifest/verifier paths from P05.

**Single owner**

- Contract owner; only this owner runs generation and transfers the generated consumer.

**Permitted work**

- closed waiting/active/ready/committed Post rows;
- exact facility/slot/capacity/person/outlook/hold facts;
- current exact Release intent with required non-empty production ID and accepted/rejected receipt
  state;
- TypeScript-authored explicit-manual, automatic-roll and Next-Event eligibility in the projection;
- after minting the P06 schema/protocol, register final P05 as prior using the same-protocol map or
  W0-approved generalized migration; retain P06-current journal/session identity;
- version/schema bump where required;
- regenerate once and bind the exact Unity consumer.

**Forbidden work**

- hand-edit generated JSON/C#;
- copy parsing in Unity;
- actual result fields in Release Review;
- new `/quote` route absent a W0-authorized necessity finding;
- bridge-side simulation or cached legality.

**Tests / evidence**

- schema parse/required-nullability/unsafe-union tests;
- exact intent for each production, no kind-only ambiguity, and null/empty/wrong production-ID
  refusal;
- held-ready projection keeps manual Advance available while automatic-roll/Next-Event eligibility
  is stopped;
- P05-prior checkpoint takes the governed migration/reset-discard path, while P06-current checkpoint
  retains journal/session/idempotency state;
- stale/rejection/current-state envelopes;
- duplicate bridge matrix: exact same command journal replay; old revision `STALE_REVISION`;
  current revision plus obsolete opaque ID `INTENT_NOT_AVAILABLE`; after a current poll, the
  retained selector shows committed without reverse-correlating the stale intent;
- source/JSON/TS-repository-generated-C#/Unity-generated-C# hash parity;
- exact-consumer verifier and focused Unity DTO compile/deserialize tests.

**Runtime requirement**

- Node generation/checks; one focused Unity batch compile/EditMode consumer pass only if explicitly
  Owner-authorized for W2 and permitted by the final W0 contract. No player, screen control or live
  bridge.

**Stop condition**

- schema drift, unsafe union, stale exact consumer, ambiguous intent, duplicated snapshot owner,
  or any result/P07 field entering the P06 view.

**Rollback**

- revert source-schema/session and all generated outputs/manifest together; never leave a partial
  generated state or manually restore one copy.

### W3 — Production / Post exact world owner

**Dependencies**

- W2 exact DTO;
- final P05 N-Stage/general facility registry, selection and inspector ownership;
- `FINAL_P05_POST_FACILITY_SEAM` resolved.

**Likely files**

- final P05 facility/body registry (exact path unresolved);
- new focused Post registry/inspector owner;
- `StudioBridgePresentation.cs` is not edited in W3; any required shared registration is deferred
  to W8 lead integration;
- `StudioLocationBinding.cs`, `SelectableEntity.cs`, `StudioSelectionManager.cs` only if final W0
  proves a surgical extension is needed;
- focused building/chooser/identity EditMode tests.

**Single owner**

- Unity World owner is the sole editing owner for W3. If shared presenter/bootstrap registration
  is required, W3 stops and returns that integration finding to the W8 lead integrator.

**Permitted work**

- click Production / Post from a fresh lot with no rail context;
- zero/one/many exact-picture rows;
- exact facility/body mapping and safe missing/duplicate mapping;
- distinct engaged-demolition refusal, legal idle-facility removal/capacity wait, and
  authoritative-facility/missing-Unity-body contract error;
- exact `Open picture`/`Review Release` route;
- stale/disappearing selection behavior and visible Locate failure.

**Forbidden work**

- first facility/title/intent/proximity/array match;
- rail priming, automatic camera move, material action on selection;
- second selection manager, inspector framework, camera or simulation store;
- assuming the founding `post` body equals every facility ID.

**Tests / evidence**

- rail-free route; zero/one/several; same title; reversed DTO order;
- missing/duplicate building/facility mapping; waiting without a placed body;
- engaged Post facility demolition is byte-neutral; legal idle Post demolition removes only its
  exact mapping and yields authoritative capacity wait; missing Unity body mutates no Core state;
- multiple Post facilities; stale selected row; released row removal without substitution;
- no enabled action without an exact ID.

**Runtime requirement**

- Unity EditMode only; no packaged player yet.

**Stop condition**

- any action depends on rail/global selection, any lookup is non-exact, missing Unity body mutates
  authority, demolition refusal/removal is conflated, or the final P05 registry cannot represent
  the required Post mapping without redesign.

**Rollback**

- remove the focused Post registration/presenter and restore final P05 registry behavior; shared
  selection/camera/host remains untouched.

### W4 — Post world presentation and people

**Dependencies**

- W3 world owner/registry;
- exact W2 Post/presence projection;
- final P05 person/body registry and visual-state infrastructure.

**Likely files**

- new focused Post world presenter;
- final person/body registry consumer;
- bounded authoring/profile roots for Production / Post;
- `StudioLotLifePresentation.cs` only if final W0 names it as the shared ambient extension seam;
- focused presenter/person/management-distance EditMode tests.

**Single owner**

- Unity World owner.

**Permitted work**

- idle, waiting, active, ready and committed state roots;
- exact Director/craft attendance only in active Post;
- bounded era-neutral light/activity and deduplicated ready/dispatch cues;
- text+shape+color-independent state distinction;
- zero-safe decorative ambience without identities/headcount.

**Forbidden work**

- cast editing; inferred/nearby people; cloned talent bodies;
- film reels/workstations/music rooms as semantic state;
- quality/final-cut implication; fake subphase/percentage;
- Theater/now-showing/review/box-office cue before actual release;
- Stage/shooting presenter reuse as Post law.

**Tests / evidence**

- exact body isolation across two productions/facilities;
- active-to-ready clears people/activity and frees capacity;
- reconnect/load paints settled state without replay;
- reduced motion, decoration-zero and colorless state assertions;
- current title/status owner agrees across marker/inspector/workspace.

**Runtime requirement**

- Unity EditMode; targeted static capture only later in W7.

**Stop condition**

- any visual claims unsupported work/quality/result, person identity is ambiguous, or one title/state
  has multiple competing owners.

**Rollback**

- disable/remove P06-specific presentation roots and return to truthful neutral Production / Post;
  do not roll back accepted P05 registries.

### W5 — Retained Post workspace and Release Review

**Dependencies**

- W2 decision projection/intent;
- W3 exact world route;
- final P05 Production workspace/rail and shared host/input/menu/Back/Locate seams.

**Likely files**

- final shared `UI/StudioWorkspaceHost.cs` router/integration seam is inspected but not edited in
  W5; any required shared edit is deferred to W8 lead integration;
- new Post workspace controller/context and UXML/USS;
- final Production Rail extension;
- pure `ReleaseDecisionState`;
- `Assets/Studio/Runtime/Presentation/StudioLivingTime.cs`,
  `Assets/Studio/Runtime/Presentation/StudioLivingTimeHud.cs` and
  `Assets/Studio/Tests/EditMode/StudioLivingTimeTests.cs`;
- `StudioBridgeClient.cs` time-option ceding is inspected/tested but not edited in W5; any required
  cede-path change stops W5 and returns to W8 lead integration;
- `StudioPresentationInputContext`, `StudioSystemMenu*`, `StudioLocateAction`, camera/Back shared
  paths are inspected but not edited in W5; any required shared edit is deferred to W8;
- focused workspace/accessibility/EditMode tests.

**Single owner**

- Unity Workspace owner is the sole editing owner for W5. If a shared host/router/input/menu path
  or bridge-client cede path must change, W5 stops and returns that integration finding to the W8
  lead integrator.

**Permitted work**

- stable exact waiting/active/ready/committed rail;
- retained picture/outlook/known/unknown/hold layout;
- title-bearing inert confirmation then exact opaque-intent dispatch;
- Hold/Back/Locate/context/focus restoration;
- pending/stale/refusal/current refresh and one dispatch acknowledgment;
- consume projected automatic-roll eligibility so Living Time pauses at held ready while explicit
  manual Advance remains available; do not rebuild decision priority in C#;
- at wide viewport, one HUD `Advance one week` single-shot owns the manual intent and advances
  exactly once; at narrow viewport where the HUD is suppressed, the unceded memo intent is the
  deliberate fallback;
- narrow/200% text/controller/keyboard/reduced-motion structure.

**Forbidden work**

- second `UIDocument` host, input context, menu, bridge store or Back stack;
- mutation on open/close/Hold; inline one-click release;
- Unity-computed forecast/legality/hold consequence;
- using presence of the manual `advanceWeek` intent as automatic-roll permission;
- treating Pause/1×/2×/4× as the explicit one-week action or ceding the memo without a visible HUD
  single-shot;
- generic `FindFirstIntent(kind)` for Release;
- result/reception/history interpretation or duplicate publicity/marketing action.

**Tests / evidence**

- one pure decision-state truth table;
- visible action effect/reason for every state;
- poll/request jitter cannot latch disabled; one press dispatches once;
- stale/duplicate/absent intent; exact refusal/remedy/focus;
- null/empty/wrong production-ID Release intent refuses visibly;
- Living Time pauses at unresolved ready, manual Advance succeeds once, and Next Event remains a
  zero-week TypeScript stop;
- wide and narrow ownership/focus/layout: auto remains paused, one explicit press advances exactly
  once, the held picture remains tick 1 and no duplicate manual owner is visible;
- Back/Locate round trip restores exact picture/tab/scroll/focus;
- building route without rail and rail alternate route;
- released row removal clears selection without selecting the next.

**Runtime requirement**

- Unity EditMode only; no player until W7.

**Stop condition**

- silent no-op, latching control, no visible manual-week owner, double time owner, identity guess,
  lost origin/focus, duplicated framework or P07 information appears.

**Rollback**

- remove the P06 workspace route and Living Time single-shot/eligibility consumer together, restore
  final P05 host/rail/HUD ceding exactly, and leave persisted Core commitment work isolated and
  inspectable.

### W6 — Persistence, reconnect and batch-order proof

**Dependencies**

- W1–W5 integrated on exact generated contract;
- final runtime-checkpoint/journal seam;
- deterministic two-ready/one-uncommitted fixtures.

**Likely files**

- `bridge/runtime-checkpoint.ts`, `bridge/proof.ts`, `bridge/session.ts` focused continuity code;
- save/replay/bridge/batch proof tests;
- Unity `StudioBridgeClient.cs`, `StudioLivingTime.cs` and projection store are tested/inspected but
  not edited in W6; any required client change returns to W8 integration;
- focused EditMode reconnect/pending-state tests.

**Single owner**

- Core/Bridge Continuity owner is the sole editing owner for W6. If a Unity client change is
  required, W6 stops and returns that finding to the W8 lead integrator; W6 may run the focused
  consumer tests without editing the client.

**Permitted work**

- save/load before and after commitment;
- pending command reconciliation through current journal;
- P06-current and final-P05-prior checkpoint import plus journal rollover against deterministic
  fixtures and a private byte-copy of the Owner profile;
- exact event/receipt cue deduplication;
- committed-only batch and reverse-click-order equivalence scoped to admission and release-stage
  ID/RNG/economy/premiere order;
- pre-P06 imported-ready migration, current commitment preservation and exact-ID isolation;
- reconnect preserves the projected manual/automatic/Next-Event split without client inference;
- compare canonical final P05 release math/order byte-for-byte where applicable.

**Forbidden work**

- blind retry after reconnect;
- presentation memory as authority;
- sorting by commitment/event/receipt/click order;
- changing reception/RNG/economy/result law to make proof easier;
- crossing the player journey into result interpretation.

**Tests / evidence**

- save/load uncommitted; save/load committed; reconnect pending accepted/rejected;
- P06-current checkpoint, final-P05 prior-schema checkpoint and journal rollover on a private
  Owner-profile copy; preserve current commitment/current journal idempotency and verify governed
  prior-journal reset/discard semantics;
- same command replay/different-envelope command-ID reuse;
- two commits in both orders plus one held picture: same admitted IDs and ID-sorted
  FilmResult/RNG/economy/premiere law, without comparing truthful pre-tick command history bytes;
- managed and legacy admission-witness equality, malformed zero/uncommitted refusal, orphan-row
  refusal and exact released-row pruning;
- exactly one commitment transition/event and accepted-command receipt per committed production;
  later exactly one `FilmResult` per admitted production, with no duplicate cue;
- mutation-check the admission filter and identity guards.

**Runtime requirement**

- Node/TypeScript plus focused Unity EditMode; no packaged player or HID.

**Stop condition**

- commitment is lost/replayed, uncommitted releases, a prior checkpoint cannot migrate, current
  journal idempotency changes, click order changes release admission or ID-sorted
  result/RNG/economy/premiere law, result pipeline changes, or any proof requires weakening a final
  P05 invariant.

**Rollback**

- revert continuity/integration commits to the last W5-compatible checkpoint; preserve failed
  artifacts and diagnosis separately.

### W7 — Six-scene Visual Oracle and real-profile journey

**Dependencies**

- W1–W6 machine/contract/EditMode green;
- `FINAL_P05_VISUAL_ORACLE_SEAM` extended, not replaced;
- exact clean candidate binary and private Owner-profile copy protocol;
- one Proof owner and named sealing scenarios.

**Likely files**

- final P05 evidence writer/manifest/runner paths;
- focused P06 fixture/runner/sidecar/report files;
- no product file unless a failed proof returns a finding to its single product owner.

**Single owner**

- Proof owner. Product remedies are made in separate worktrees by the owning wave lane, followed by
  a new bound build/proof run.

**Permitted work**

- exactly six canonical scenes:
  1. Idle Production / Post
  2. Wrapped / Waiting for Post
  3. Active finishing
  4. Release Ready
  5. Committed to Release
  6. Multi-picture contention and exact-ID isolation
- bind exact binary/PID/window/viewport/camera/schema/fixtures/image hashes;
- one coherent private-profile-copy journey through Hold, return, Commit, dispatch and Save/Load;
- bounded future HID segment only if the final accepted proof contract requires it, with normalized
  and recorded modifiers.

**Forbidden work**

- seventh result scene; critic/audience/box-office/theatrical interpretation;
- mutating the Owner's real profile;
- screen-driving before exact evidence binding;
- deleting failures, relying on a glob, inflating sleeps or weakening assertions;
- identical rerun without a new hypothesis.

**Tests / evidence**

- per-scene machine assertions and visual question;
- readable/stale/unreadable/absent artifact states;
- clean-tree/executable/PID/window/viewport binding;
- sealed fixture plus private-profile copy;
- owner-like rail-free route, normal input and exact stop before P07.

**Runtime requirement**

- one bounded packaged-player matrix only after final authorization; HID only if the final proof
  contract explicitly requires it. No activity of this kind occurred for r1.

**Stop condition**

- evidence cannot bind exact bytes/context, any scene implies result/quality, state is unreadable at
  management distance, modifiers remain latched, or the journey crosses into P07 result
  interpretation.

**Rollback**

- invalidate the candidate manifest and return the finding to the owning product lane; never relabel
  stale evidence as current. Last accepted P05 remains the safe baseline.

### W8 — Hostile review, integration, seal and Owner playtest

**Dependencies**

- all lower levels green with named artifacts;
- clean integration pair, exact contract manifest and complete collision log;
- fresh hostile reviewer and Owner journey script.

**Likely files**

- lead-only shared integration paths frozen in W0;
- focused seal/manifest/report/ledger documents;
- no P07 production path.

**Single owner**

- Lead integrator edits. Fresh reviewer is read-only; the Owner plays the sealed candidate normally.

**Permitted work**

- integrate one-owner wave commits;
- run full bounded regression and exact sealing proof set;
- hostile review of code, remedies, comments, reports, tests and artifacts;
- seal/push candidate, verify remote/local SHAs;
- Owner plays the representative journey and gives an explicit verdict.

**Forbidden work**

- reviewer-shopping; marking technical KEEP as accepted;
- fixing review findings inside the reviewer's checkout;
- hiding non-blockers/failures or citing an unmeasured disclosure;
- P07 branch/worktree/result UI before Owner acceptance;
- scope additions from the hard-exclusion list.

**Tests / evidence**

- final TypeScript/contract/EditMode/Oracle/private-profile layers;
- sibling-site `ActionsEnabled`/input audit;
- mutation checks and exact sealing artifact list;
- clean local/remote equality and manifest-to-bytes binding;
- Owner journey: Wrap → Post → Ready → Hold → Advance/Remain Ready → Return → Commit → Dispatch →
  Save/Load → STOP.

**Runtime requirement**

- bounded final packaged matrix and one Owner playtest only after all lower gates; no P07 result
  interpretation.

**Stop condition**

- any hostile blocker, evidence drift, dirty tree, remote mismatch, Owner rejection or missing
  separation between mechanical result proof and player-visible result interpretation.

**Rollback**

- reject the P06 candidate and restore the final accepted P05 pair as product baseline. Retain
  failed candidate branches/evidence for diagnosis; do not delete or call them accepted.

---

## 6. Proof pyramid and acceptance ledger

| Level | Owner | Required completion signal | Cannot prove |
|---|---|---|---|
| 1 — TypeScript | Core Release owner | state/migration/hold/commit/stale/batch/order/identity/save tests green | contract consumption, world readability, human usability |
| 2 — Contract | Contract owner | schema/generator/exact consumer/intent projection parity green | workspace behavior or visuals |
| 3 — Unity EditMode | World + Workspace owners in separate files | exact route/chooser/state/Back/Locate/poll/responsive/focus tests green | packaged pixels/HID or Owner comprehension |
| 4 — Six-scene Oracle | Proof owner | six named scenes and manifests valid | Owner acceptance or P07 result law |
| 5 — Owner journey | Owner | explicit verdict on sealed candidate | P07 acceptance |

No level inherits another level's claim. A technically green Level 1–4 candidate remains a KEEP
candidate until Level 5.

---

## 7. P07 handoff gate

W8 may mark P06 accepted only with a machine-readable handoff that records:

- final P06 TS/Unity SHAs and schema/protocol/projection/save versions;
- exact production, commitment, event and receipt identities;
- committed-only membership, uncommitted hold and ID-sort/RNG/economy preservation proofs;
- exact one `FilmResult` append proof from a headless next-week fixture;
- `false`/forbidden for P06 critic, audience, box-office, theatrical-run, awards, franchise and
  learning/autopsy presentation; and
- explicit P06 Owner acceptance.

P07 cannot start from a technical KEEP candidate or from a P06 checkpoint whose Owner journey has
not been accepted.

---

## 8. Hard exclusions

No wave may recommend, implement, test-drive as product, or leave a hook requiring:

- manual movie editing;
- scene timeline;
- sound/VFX/editing subphases;
- final-cut score or fake quality improvement;
- duplicate release marketing or an unauthorized release fee;
- release date picker or genre-season calendar;
- manual archive or movie export;
- P07 result UI or box-office redesign;
- awards, franchise consequences or IP/library economy;
- creator mode;
- renderer migration, HDRP, DOTS or a global UI reskin.

A test fixture may carry existing result fields only to prove mechanical append/order; no P06
player-facing surface may interpret them.

---

## 9. Provisional completion and authorization checklist

This r1 documentation charter is complete only if:

- all final P05 placeholders remain obvious and unresolved;
- the state says `NOT AUTHORIZED FOR IMPLEMENTATION`;
- waves W0–W8 each name dependencies, likely files, single owner, permitted/forbidden work, tests,
  runtime requirement, stop condition and rollback;
- only three documentation files were added on this branch;
- no production/generated/Unity file changed and no Unity/player/bridge/supervisor/HID ran;
- every P05 WIP fact is unsealed forward evidence;
- the Oracle has six scenes, not seven;
- the Owner journey stops before P07 interpretation;
- no hard exclusion entered a wave; and
- Package 06 product law is unchanged.

Passing this checklist means the launch documentation is **PROVISIONAL READY**. It does not make
P06 implementation ready or authorized.

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
