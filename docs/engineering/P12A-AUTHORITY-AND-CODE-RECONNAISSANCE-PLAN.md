# P12A Authority and Code Reconnaissance Plan

**Status:** P12A PRE-READINESS

**Disposition:** PROVISIONAL READY FOR CURRENT OPS REVIEW

**Dependencies:** ACTIVE P08–P10 DEPENDENCIES · P11 IMPLEMENTATION PENDING · POST-P11 CHANGED-PATH REFRESH REQUIRED

**Implementation authorization:** NOT AUTHORIZED FOR IMPLEMENTATION

**Mode:** documentation, read-only reconnaissance, and dependency mapping only

**Current Ops authorization observed:** `OPS-P08P10-20260905-01` applies to the active P08–P10 team, not to P12

**WIP evidence label:** UNSEALED FORWARD EVIDENCE

This document is a compact activation/reconciliation layer around the accepted Package 12 design and Builder Annex. It does not replace either source, authorize P12, create an execution order, or direct the active P08–P10 implementation. No production TypeScript, Unity source or assets, generated DTOs, schema, save format, active implementation branch, campaign branch, or `main` was changed during this reconnaissance.

## 1. Authority boundary and exact sources

### 1.1 Accepted campaign baseline

| Authority | Exact identity | Governing fact |
|---|---|---|
| Documentation-inclusive TypeScript base | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` | P06/P07 accepted campaign base; this planning branch is based here |
| Accepted Unity product/campaign | `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` | accepted private Unity product authority |
| Accepted protocol / projection / save | `4 / 15 / V16` | do not silently replace with WIP values |
| Accepted schema | `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99` | projection-15 contract identity |
| P06/P07 status | OWNER ACCEPTED — KEEP — CLOSED | no reinterpretation and no replay requested |

The following accepted-base documents were read as authority:

- `docs/engineering/P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`;
- `docs/engineering/P06-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`;
- `docs/engineering/P07-IMPLEMENTATION-AND-OWNER-PLAYTEST-LESSONS-LEARNED.md`;
- `docs/campaigns/P07-OWNER-ACCEPTANCE-RECEIPT.md`;
- `CURRENT-BEST.md`.

Controlling accepted facts include exact `productionId` film identity, three separate Critics/Audience/Business result channels, TypeScript-owned result semantics, commitment distinct from release, durable exact-ID film results, honest absence for facts not recorded in old saves, and Unity presentation without a second simulation authority. The accepted handoff explicitly says P07 contains no rival results and authorizes no P08 implementation (`P07-TO-P08-FINAL-AUTHORITY-HANDOFF.md`, especially lines 3–11, 50–86, 88–115, 140–188, and 190–207 at the accepted base).

### 1.2 Existing P12 product authority

| Source | Exact source identity | Status |
|---|---|---|
| Package 12 design | `codex/rival-studios-hollywood-ecosystem-research-12@a0739055c30f80fcf756340d0e0e962865aec6a4:docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12.md` | OWNER-ACCEPTED PRODUCT DIRECTION · DOCUMENTATION ONLY |
| Package 12 Builder Annex | `codex/rival-studios-hollywood-ecosystem-research-12@a0739055c30f80fcf756340d0e0e962865aec6a4:docs/design/CODEX-RIVAL-STUDIOS-HOLLYWOOD-ECOSYSTEM-PACKAGE-12-BUILDER-ANNEX.md` | OWNER-ACCEPTED PRODUCT DIRECTION · DOCUMENTATION ONLY |
| Horizon ruling | `docs/OWNER-RULINGS-HOLLYWOOD-HORIZON.md` at the Package 12 source lineage/current accepted location | preserve unsuperseded Owner law |
| Future-proofing scout | `docs/HOLLYWOOD-ECOSYSTEM-FUTURE-PROOFING.md` at the Package 12 source lineage/current accepted location | historical architecture evidence; dated code/version statements require refresh |
| Success Blueprint | `PROJECT-STUDIO-SUCCESS-BLUEPRINT.md` at the Package 12 source lineage/current accepted location | preserves Pillar 11 fantasy and success test |

Package 12 source lines 38–48 establish the accepted boundary and core recommendations. Lines 53–60 and 420–425 contain the dated code claims revalidated in §4. The Builder Annex reuse map and archaeology findings remain source history; only their code/version snapshot is refreshed here.

### 1.3 P11 planning input

`/Users/bruce/Downloads/project-studio-p11a-launch-package-01-rev02.zip` was found and independently verified at SHA-256 `216e5501cd3a40779fc0ca4d5fe7bd663c1d5f9a55de501930304cdbf00d226f`. Its archive integrity, safe-path checks, and manifest payload hashes passed. Its status is **PROVISIONAL FUTURE OPS P11 AUTHORITY · READY FOR CURRENT OPS PM REVIEW · NOT AUTHORIZED FOR IMPLEMENTATION**, pending Current Ops review, final P08–P10 refresh, implementation, and Owner acceptance.

P11 planning recommends extending the existing finance authority rather than introducing a second Finance persistence root. It supplies no final P11 code SHAs or final owner paths. All `FINAL_P11_*` values therefore remain placeholders and P12 must inspect the actual Owner-accepted P11 changed paths before choosing a rival financial model.

## 2. Active P08–P10 snapshot

### 2.1 Exact ref equality

Final ref/status refresh captured read-only on `2026-09-05T11:04:08Z` (`2026-09-05T13:04:08+02:00`). These values are evidence of that instant, not final stack identities.

| Package/ref | Local ref | Tracking ref | Advertised remote ref | Worktree state at capture |
|---|---|---|---|---|
| TS `wip/p08-p10-autonomous-stack-01-ts` | `364079fffccf23270eddc0ce1edf66b7ca345e0d` | `hspector-github/wip/p08-p10-autonomous-stack-01-ts` = `364079fffccf23270eddc0ce1edf66b7ca345e0d` | `364079fffccf23270eddc0ce1edf66b7ca345e0d` | clean tracked and untracked status; ahead/behind `+0/-0` |
| Unity `wip/p08-p10-autonomous-stack-01-client` | `4afd6e829a4eb92bca8a76dee188e1301c591574` | `origin/wip/p08-p10-autonomous-stack-01-client` = `4afd6e829a4eb92bca8a76dee188e1301c591574` | `4afd6e829a4eb92bca8a76dee188e1301c591574` | **dirty after the commit**: untracked `Assets/Studio/Runtime/Presentation/StudioLotGridMap.cs`; ahead/behind `+0/-0`; uncommitted bytes excluded |
| Planning `docs/p08-p10-autonomous-stack-launch-01` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` | `hspector-github/docs/p08-p10-autonomous-stack-launch-01` = `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` | clean tracked and untracked status; ahead/behind `+0/-0` |

The TS WIP merge-base with the accepted TS base is exactly `2753e18ba8fb5f65b936c22cde9531646fecc6cd`. The planning commit's parent and merge-base are that same accepted base. The Unity WIP merge-base with the accepted Unity product is exactly `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6`.

Dirty-state qualification: only committed objects at the exact SHAs above were used as code evidence. A live worktree can become dirty or advance after capture; neither uncommitted bytes nor a later tip are incorporated implicitly. Current Ops must repeat local/tracking/advertised equality and status immediately before any final reconciliation.

### 2.2 WIP contract identity at the captured pair

| Identity | Accepted P07 | Captured WIP | Classification |
|---|---|---|---|
| Save | V16 | V18 | UNSEALED FORWARD EVIDENCE |
| Protocol | 4 | 4 | same numeric protocol, but the WIP pair is not accepted |
| Projection | 15 | 17 | UNSEALED FORWARD EVIDENCE |
| Schema | `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99` | `sha256:eb95add0fc06a54d19998c4707dd0b0ba861a22cfee6d8e6631499beeea18e25` | UNSEALED FORWARD EVIDENCE |
| Generated DTO SHA-256 | `045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f` | `9e2c3e84d0f07679c8124e5310e1eaf0772c1be850d514cb76720f8a886adf65` in both manifests/copies | UNSEALED FORWARD EVIDENCE |

Evidence: accepted and WIP `generated/unity/project-studio-bridge.contract-manifest.json`; WIP `bridge/schema/bridge-schema.ts:18–31`; Unity generated DTO constants at captured commit lines 17–20.

### 2.3 Package status

| Package | Current classification | Exact evidence and qualification | What must not be claimed |
|---|---|---|---|
| P08 | **TECHNICALLY PROVEN** for P08 core at TS `8a23cb3b3c8e9d4780417ca44c60312b1bfd12bc` × Unity `64dab80e4dfd80fc4c0a559bc1a4034c44b5cc9e`; **REQUIRES FINAL REFRESH** | `docs/campaigns/P08-TECHNICAL-CHECKPOINT.md` says `P08 CORE TECHNICAL KEEP — OWNER ACCEPTANCE PENDING`; V17/projection-16 history spine, machine proof, and bounded 6,240-week measurement are recorded. R1–R4 remain unbuilt or dependency-gated. | P08 is not OWNER ACCEPTED; the later branch tips do not extend the older technical seal automatically |
| P09 | **OBSERVED ON WIP**; **REQUIRES FINAL REFRESH** | C4 records W0/W1 complete at TS `71a879be7359b6d446b5c68406144f22f6a9ad8f`; captured TS tip `364079f…` adds the accepted-world bare-lot grid after the road/property-driven lot-body work at `33a362d6…`, and captured Unity tip `4afd6e8…` syncs the `33a362d6…` contract. No complete P09 technical checkpoint or Owner acceptance exists at capture. | Do not call P09 TECHNICALLY PROVEN or shipped |
| P10 | **PLANNED** and implementation **MISSING** at the captured tips; **REQUIRES FINAL REFRESH** | no P10 implementation commit appears in the captured TS/Unity ladders; the P08 history union contains a typed future `careerMilestone` arm but its own checkpoint says no P10 producer exists | Do not confuse existing Talent/contracts/presence with the P10 Profile/Roster delivery |

All three packages remain **UNSEALED FORWARD EVIDENCE** for P12 planning. None is OWNER ACCEPTED at this capture.

## 3. Accepted, WIP, and planned facts must stay separate

| Fact | ACCEPTED at P07 | OBSERVED ON WIP | PLANNED / unresolved |
|---|---|---|---|
| Studio model | one singleton player `Studio` with cash, Standing, active productions, and released films; no `studioId` or authored name | still singleton; P08/P09 add `studioHistory` and `foundingRegime` roots, not a registry | P12 common player/rival `StudioIdentity`/registry and ownership links |
| Film identity/result | `productionId` is immutable identity; exact result/lifecycle facts and three-channel presentation | P08 player history records exact player production IDs | P12 rival project/film identity and studio ownership, while reusing shared result law where lawful |
| History | durable player film results and StudioEvent sources; no generalized Studio History root | P08 V17 player `studioHistory`, recording boundary, significance, Standing receipts, player film rows, Unity History route | architecture choice between generalized multi-studio history and player history plus industry ledger; decide only after final P08 |
| Founding/property | endowed player lot and existing property/placement/construction roots | P09 V18 immutable `foundingRegime`, bare-lot property, quote projection, property/road presentation work | final P09 capacity vocabulary; P12 rival abstract capacity without rival 3D lots |
| People/employment | persistent `talentId`; player-relative contracts and presence/career facts | no employer authority added through captured tips | P10 public Profile/Roster/employer-facing projection; P12 contract identity and one authoritative cross-studio employer |
| Finance | singleton player cash/ledger/economy facts | P09 consumes player cash for construction; no rival account | final P11 finance handoff, then minimum conserved rival money/obligations without exposing private cash |
| Competition | `competingSlate` exists but starts empty; `competitionFactor` is `1.0` | unchanged | no penalty may be invented in P12A; future shared-market authority belongs later |
| Property/franchise/cross-media ownership | no P12 authority creates a Story Property, continuation/franchise relationship, or television operation | no such authority added through captured tips | P12 preserves immutable source-work identities only; P16 later establishes each exact `StoryProperty`, Film Library, origin-work, chain-of-title, rights/license/restoration/reissue, and ownership authority without inferring it from a P12 work or presentation; P17 consumes exact P16 identities/rights for continuation, explicit parent/child continuation-work lineage, franchise state keyed to P16 property identity, Story DNA, crossover, and shared-universe behavior; P18 retains television/streaming/cross-media and platform/distribution behavior, including television/platform licensing and production workflows under exact P16 grants |
| Unity | player lot, rails, workspaces, exact-ID film result route | P08 History workspace and P09 contract/property vocabulary | P10 people routes, then P12 inspect-only Industry route; TypeScript remains truth owner |

## 4. Old Package 12 code claims revalidated

Classification applies to the precise old finding, not to an adjacent enabling substrate. An adjacent WIP improvement is called out without laundering it into a fix.

| Old finding | Accepted P07 evidence | Captured WIP evidence | Classification |
|---|---|---|---|
| No persistent player `studioId` | `src/core/types.ts:291–296` has only `cash`, `standing`, `activeProductions`, `releasedFilms`; no gameplay `studioId` in the root | same `Studio` shape; `GameStateV17/V18` only add `studioHistory` and `foundingRegime` (`types.ts:1666–1689`) | **STILL PRESENT** |
| No player-authored `studioName` | presentation substitutes the product brand | `ui/src/engine/adapter.ts:6017–6024,7870–7872` and `ui/src/shell/saveCard.ts:1–30` explicitly use `PROJECT: STUDIO` because GameState has no per-studio name | **STILL PRESENT** |
| `beginFounding()` reprices/correlates the world concept pool | accepted `src/core/employment.ts` owns the deterministic rank blend | captured `employment.ts:438–480` still calls `correlateConceptCost(state.concepts)` and returns the replaced concept array; `tuning.ts:517–524` retains weight `0.4` | **STILL PRESENT** |
| Contracts are player-relative, not industry employer authority | `types.ts:318–343` says state is studio-relative; `Contract` has `talentId` and terms but no contract ID or employer ID; `employment.ts:85–100` searches singleton `state.contracts` | same shapes and lookup at captured tip; no `employerId` or employment interval authority | **STILL PRESENT** |
| `competingSlate` is empty or inactive | `MarketState.competingSlate` exists, but `worldgen.ts` creates `[]` | captured `types.ts:273–282`, `worldgen.ts:628–639`; no authoritative population/consumption path found | **STILL PRESENT** |
| No active competition factor | accepted reception law hard-codes a no-op | captured `src/core/reception.ts:596,638,678–704` still sets `competitionFactor = 1.0` and multiplies by it | **STILL PRESENT** |
| No rival project lifecycle | no rival root, projects, roster, or policy | exact scoped search at captured TS tip finds only the legacy comment that no rival behavior is simulated; P08/P09 changes remain player-studio work | **STILL PRESENT** |
| No rival financial authority | only singleton player studio cash/ledger/economy | no rival cash, obligations, capacity account, or ledger at captured tip; P11 is planning only | **STILL PRESENT** |
| No rival history | no rival history | P08 adds a player-only `studioHistory` root and Unity Studio History route; rows have no `studioId` and the world still has one studio | **STILL PRESENT**; adjacent P08 substrate is **ACTIVE WIP ONLY** |
| No rival release receipts | P07 explicitly disclaims rival results | P08 `filmReleased` history rows carry player `productionId`, `conceptId`, and frozen title but no owner `studioId`; no rival releases exist | **STILL PRESENT**; adjacent player receipt is **ACTIVE WIP ONLY** |
| No rival Unity presentation | accepted client has player-only lot/result surfaces | exact scoped search of captured Unity `Assets/Studio` finds no rival, `studioId`, employer, Industry workspace, Hollywood Ecosystem, or Power Ranking surface; P08 History is player-only | **STILL PRESENT** |
| Old save-version assumptions | Package 12's 2026-08-25 snapshot corrected V13 to then-current V14 | accepted P07 is V16; captured unsealed WIP is V18, with V17 `studioHistory` and V18 `foundingRegime` | **SUPERSEDED** |

Summary: **11 STILL PRESENT**, **0 FIXED**, **0 PARTLY FIXED**, **1 SUPERSEDED**, **2 adjacent ACTIVE WIP ONLY substrates** (not separate old findings), and **0 NOT VERIFIABLE** within the inspected scopes. This summary must be recomputed after final P08–P10 and P11 rather than copied forward.

## 5. Current authoritative seams

### 5.1 TypeScript simulation and persistence

| Concern | Exact current owner(s) | P12 reconnaissance law |
|---|---|---|
| Root types and identity-bearing records | `src/core/types.ts` | high-collision one-owner file; inspect every frozen old-version leaf before adding a root; do not add studio ownership to an old frozen leaf casually |
| Save validators, migrations, downgrade guards | `src/core/save.ts` | preserve strip-and-delegate version discipline, deterministic migration, exact-key validation, and no invented history |
| Initial world/singleton player studio | `src/core/worldgen.ts` | current source of the single Studio and empty `competingSlate`; P12 registry/allocation must be deterministic and must not use names or array positions as identity |
| Contract and hiring authority | `src/core/employment.ts`; signing action in `src/core/actions.ts` | inspect final P10 before generalizing; person, employment, credit, presence, and availability remain separate facts |
| Weekly state transition and release settlement | `src/core/tick.ts`; `src/core/releaseAuthority.ts` | rival transitions must produce facts inside TypeScript authority; never let a view or timer create a film/result |
| Film/result identity preservation | `src/core/productionIdentity.ts`; `src/core/reception.ts`; `src/core/receptionVerdict.ts` | reuse exact IDs and shared result laws; extend all ID-reservation walkers; keep `competitionFactor` unchanged until a separately authorized shared-market law exists |
| Standing | `src/core/standing.ts`; its mutation sites in `src/core/tick.ts` and `src/core/actions.ts` | three channels remain separate; any cross-studio application must use one TypeScript formula authority |
| Player history | WIP `src/core/studioHistory.ts`; history types in `src/core/types.ts`; producers in `tick.ts`/`actions.ts` | consume final P08 shape; do not duplicate significance, fabricate pre-boundary events, or assume rows are already multi-studio |
| Property/capacity/construction | `src/core/lot.ts`; `src/core/placement.ts`; `src/core/construction.ts`; `src/core/operations.ts`; `src/core/sets.ts`; `src/core/blueprintRequirements.ts` | consume final P09 capability vocabulary; rivals may use lower physical detail but must conserve required capacity |
| Person facts | `src/core/talentSummary.ts`; `src/core/presence.ts`; `src/core/employment.ts`; `src/core/types.ts::Talent` | consume final P10 public/perceived projection and exact employer route; never project hidden actual skills/ceilings |
| Public exports | `src/core/index.ts` | one owner integrates additive public contracts after underlying modules stabilize |

The existing player lifecycle rules most likely reusable as shared law are stable project/person IDs, deterministic ordering, explicit commitment boundaries, elapsed authoritative weeks, result creation in the tick, separated result channels, exact credits, and permanent release records. Player-only physical walking, authored lot body occupancy, room queues, detailed Set dressing, and camera/animation are lower-detail or absent for rivals. Money, staffing, time, required capacity, project identity, release identity, and history consequences cannot be abstracted away.

### 5.2 Bridge, browser adapter, and generated contract

| Concern | Exact current owner(s) | Collision rule |
|---|---|---|
| Schema/version/closed DTO definitions | `bridge/schema/bridge-schema.ts`; emitted `bridge/schema/project-studio-bridge.schema.json` | one schema owner; additive design first; schema ID always follows actual emitted bytes |
| Session/query/intent routing | `bridge/session.ts`; `bridge/server.ts`; `bridge/runtime-checkpoint.ts`; `bridge/schema/runtime.ts`; `bridge/snapshot-build-context.ts` | one routing owner; a future Industry query must not make Unity a simulator or repeatedly manufacture full-state truth |
| Current P08 history projection | WIP `bridge/history.ts` | consume final P08; do not fork another significance or result calculation |
| Current P09 placement quote | WIP `bridge/placement.ts` | player-lot construction seam only; not a rival capacity model |
| TS-to-lot projection | `ui/src/engine/adapter.ts`; `ui/src/lot/snapshot/StudioLotSnapshot.ts` | high-collision adapter/snapshot owners; studio brand fallback is presentation, not identity |
| Generated C# producer copy and manifest | `generated/unity/StudioBridgeDtos.Generated.cs`; `generated/unity/project-studio-bridge.contract-manifest.json` | generated output only; never hand-edit |

Likely P12-specific TypeScript modules such as an industry registry, rival policy, rival project lifecycle, employment interval authority, and Industry projection are **PLANNED NAMES/RESPONSIBILITIES ONLY**. Their final filenames must be selected after `FINAL_P12_CHANGED_PATHS` is produced. No `src/core/industry.ts`, `src/core/rivals.ts`, or `bridge/industry.ts` is claimed to exist today.

### 5.3 Exact private Unity owners safely inspected

The following paths exist at Unity WIP commit `4afd6e829a4eb92bca8a76dee188e1301c591574`; presence here is not acceptance:

| Responsibility | Exact owner path(s) |
|---|---|
| Retained-workspace routing, Back/Esc, focus restoration | `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` |
| P08 Administration/History world entry | `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` |
| P08 retained History UI | `Assets/Studio/Runtime/Presentation/UI/StudioHistoryWorkspace.cs`; `StudioHistoryWorkspaceContracts.cs`; `StudioHistoryWorkspaceContext.cs` |
| Wire client and intent/quote plumbing | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` |
| Protocol validation and generated DTOs | `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`; `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` |
| Snapshot normalization | `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs` |
| Applying authoritative property/people/building facts to the lot | `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs` |
| Person rail | `Assets/Studio/Runtime/Presentation/StudioPeopleRailHud.cs`; `Assets/Studio/Runtime/Infrastructure/StudioPeopleRailContracts.cs` |
| Selection and camera | `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`; `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs` |
| Menu/cancel ownership | `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs`; `StudioSystemMenuContracts.cs` |
| Element-map publication | `Assets/Studio/Runtime/Presentation/UI/StudioUiElementRegistry.cs` |

A future inspect-only Industry surface would most likely extend `StudioWorkspaceHost.cs`, reuse the Administration entry in `StudioFoundingCardHud.cs`, consume `StudioBridgeClient.cs`/`StudioLotSnapshot.cs`, and add an isolated workspace trio following the History pattern. Names such as `StudioIndustryWorkspace.cs`, `StudioIndustryWorkspaceContracts.cs`, and `StudioIndustryWorkspaceContext.cs` are **provisional planned filenames only**; they do not exist at the captured commit and are not an implementation instruction.

### 5.4 Static and style owners

| Static concern | Exact existing path | P12 boundary |
|---|---|---|
| Canonical lot scene | `Assets/Studio/Scenes/StudioLot.unity` | one owner; P12A should reuse an authorized executive entrance and should not add a rival-lot scene or building |
| Shared tokens | `Assets/Studio/UI/Resources/StudioUiTokens.uss` | one style-system owner; reuse tokens |
| Existing retained-workspace styles | `Assets/Studio/UI/Resources/StudioHistoryWorkspace.uss`; `StudioProductionWorkspace.uss`; `StudioCastingWorkspace.uss` | inspect specificity/order before adding a workspace stylesheet |
| Proposed Industry style | likely `Assets/Studio/UI/Resources/StudioIndustryWorkspace.uss` | **PLANNED NAME ONLY**, additive if final Unity architecture still uses this pattern |

The captured Unity diff from the accepted product adds the three History workspace source files and `StudioHistoryWorkspace.uss` and modifies the host, Administration card, bridge client/protocol/snapshot, generated DTO, and oracle runner. No rival presentation path exists. Opening Unity or running it against the active worktree was neither needed nor performed for this inspection.

## 6. History architecture alternatives after final P08

P12 must not choose an architecture from the unsealed V17 shape alone.

| Alternative | Strength | Risk |
|---|---|---|
| A. Generalize one shared history root for all studios | one ordering/significance vocabulary and direct studio linkage | may destabilize P08's player-only accepted semantics, migration, or long-horizon compaction |
| B. Keep player `studioHistory` and add a separate industry-event ledger | smallest disturbance to P08 and clearer public-visibility boundary | requires exact cross-ledger links and a single source for a fact to prevent duplicates |
| C. Common immutable event store with derived player/industry views | strongest long-term identity model | largest migration and collision surface; unjustified until final P08/P11 shapes are known |

**Provisional recommendation:** prefer B unless the final P08 root was explicitly designed and proven for multi-studio ownership. P12's industry ledger would own only cross-studio/public factual events and link by immutable `studioId`, `projectId`, `filmId`, `personId`, and source receipt IDs. It must not reconstruct player history, copy a FilmResult as a second result authority, or invent events before an explicit industry `recordingStartedWeek` equivalent.

**Refresh trigger:** resolve this recommendation only after `FINAL_P08_P10_TS_SHA`, `FINAL_P08_P10_SAVE_VERSION`, `FINAL_P08_P10_OWNER_RULINGS`, and final P08 changed paths are known; repeat it after final P11 if finance events alter the event/receipt topology.

## 7. Collision and one-owner map

One lead owns every high-collision file at a time. Generated outputs have one generator owner and no hand editor. New domain files may be delegated only when their contracts are fixed and they do not overlap a shared owner.

| Collision domain | Likely one-owner paths | Why it collides |
|---|---|---|
| GameState and shared types | `src/core/types.ts` | studio/contract/project/event types, versioned leaves, public contracts |
| Save lineage | `src/core/save.ts` | validators, conversions, dispatch, downgrade refusal, migration truth |
| World/bootstrap/allocation | `src/core/worldgen.ts`; `src/core/employment.ts` | registry creation, player/rival allocation, concept/talent ownership, founding behavior |
| Weekly simulation | `src/core/tick.ts`; `src/core/actions.ts` | project transitions, finance/capacity consumption, release/history receipts |
| ID reservation and release/result law | `src/core/productionIdentity.ts`; `src/core/releaseAuthority.ts`; `src/core/reception.ts`; `src/core/receptionVerdict.ts` | duplicate prevention and one canonical result per film |
| Public core surface | `src/core/index.ts` | export integration across every new authority |
| Wire/schema | `bridge/schema/bridge-schema.ts`; `bridge/session.ts`; `bridge/runtime-checkpoint.ts`; generated schema/DTO/manifest | closed DTOs, version pins, query/intent semantics, exact consumer sync |
| Browser/lot projection | `ui/src/engine/adapter.ts`; `ui/src/lot/snapshot/StudioLotSnapshot.ts` | composes identity, people, history, property, result, and navigation facts |
| Unity wire consumer | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`; `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`; `Assets/Studio/Runtime/Data/StudioLotSnapshot.cs`; generated DTO | handshake, validation, normalization, query/intent state |
| Unity world projection | `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs` | current bodies, selection identities, lot/property application |
| Unity retained routes | `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs`; `Assets/Studio/Runtime/Presentation/StudioFoundingCardHud.cs` | Administration entry, route stack, Back/Esc/focus restoration |
| Unity static composition | `Assets/Studio/Scenes/StudioLot.unity`; shared `.uss` tokens/styles | serialized scene conflicts and global style leakage |

Required ordering at implementation reconnaissance—not authorization—is: settle common identities and migration law; settle employer/contract ownership; settle conserved rival lifecycle/finance/capacity facts; then expose a bounded projection; then add Unity presentation. A UI skeleton must not force the authoritative data shape.

## 8. Future changed-path reconnaissance plan

### Gate A — final P08–P10

Do not begin until Current Ops provides the exact final P08–P10 technical and Owner-accepted pair. Then:

1. Resolve local, tracking, and advertised remote refs independently for TS and Unity; require exact equality or record the mismatch.
2. Record worktree status, but inspect committed objects at exact SHAs only. Do not switch, clean, stash, reset, merge, or run Unity in an active worktree.
3. Prove ancestry from the accepted P07 pair and collect `git log --name-status` plus `git diff --name-status` for accepted-to-final and each P08/P09/P10 checkpoint.
4. Re-read final handoffs, technical evidence, Owner rulings, and changed-path inventories. Technical KEEP is not Owner acceptance.
5. Rebuild the root/version map from `types.ts`, `save.ts`, adapter/session imports, runtime checkpoint, schema, manifest, and both generated DTO copies.
6. Locate every final producer/consumer for history, facility/capacity, person/Profile, contract, employer, availability, current work, career credit, and exact navigation.
7. Re-run all §4 code claims and publish a new classification table. Search for semantic equivalents, not only old symbol names.
8. Resolve the P08 history alternative, P09 abstract-capacity vocabulary, P10 employer seam, exact Unity route owners, and any new scene/style collision.
9. Populate `FINAL_P08_P10_*`, `FINAL_P08_P10_OWNER_RULINGS`, and the P08–P10 portion of `FINAL_P12_CHANGED_PATHS`.

### Gate B — final P11

Do not begin until P11 has implementation and explicit Owner acceptance. Then:

1. Resolve the final TS/Unity refs and verify exact ancestry/equality.
2. Diff the final P08–P10 pair to final P11 and inspect every finance/accounting/ledger/save/projection/Unity summary path actually changed.
3. Identify the exact owner of cash, signed ledger provenance, payroll, ordinary overhead, facility Opex, obligations, construction consequences, film direct commitment, Studio Revenue, Film Contribution, and old-save accounting boundaries.
4. Separate internal rival financial authority from player-visible rival financial information. Exact rival cash remains hidden unless explicitly authorized.
5. Prove how rival films and staffing cannot be free, how throughput is bounded, and how any later distress/recovery state obtains a causal financial basis.
6. Populate every `FINAL_P11_*` value and the P11 portion of `FINAL_P12_CHANGED_PATHS`.

### Gate C — P12 implementation-readiness reconciliation

Only after Gates A and B may Current Ops decide whether a P12 implementation charter/order should exist. The final reconnaissance must:

- identify the one canonical `studioId`, `projectId`, `filmId`, `personId`, `contractId`, employment interval, event/receipt identity, and complete ID-reservation walkers;
- prove deterministic migration and collision safety for same-name studios, same-name people, and same-title films;
- confirm one-employer exclusivity before founding/hiring/assignment views are opened;
- map shared versus lower-detail lifecycle rules and every conserved resource;
- keep rival cash/policies/private forecasts/hidden skills/RNG state out of the public projection;
- preserve the P16 `StoryProperty`/library/rights/license/ownership authority, the P17 explicit
  parent/child continuation-work lineage and franchise/Story DNA/shared-universe consumer boundary,
  and the P18 television/streaming/cross-media and platform/distribution boundary; require P17
  franchise state to key to exact P16 property identity; reject property or ownership inference
  from titles, genres, casts, release order, studio association, similar concepts, presentation
  copy, or array position; and prevent P17/P18 from duplicating P16 legal rights/license records;
- measure 6,240-week tick cost, projection cost, save growth, history growth, indexes, migration time, and Industry filtering before sealing;
- verify Unity consumes TypeScript truth, exact drill-down/Back/Save/Load/reconnect work, and no rival lot or fake market penalty appears;
- produce `FINAL_P12_CHANGED_PATHS` and a final collision/one-owner assignment before any edit.

## 9. Required unresolved placeholders

These tokens are deliberately unresolved. A planning or WIP SHA must never be substituted for a final accepted identity.

```text
FINAL_P08_P10_TS_SHA
FINAL_P08_P10_UNITY_SHA
FINAL_P08_P10_SCHEMA_ID
FINAL_P08_P10_PROTOCOL_VERSION
FINAL_P08_P10_PROJECTION_VERSION
FINAL_P08_P10_SAVE_VERSION
FINAL_P08_P10_OWNER_RULINGS

FINAL_P11_TS_SHA
FINAL_P11_UNITY_SHA
FINAL_P11_SCHEMA_ID
FINAL_P11_PROTOCOL_VERSION
FINAL_P11_PROJECTION_VERSION
FINAL_P11_SAVE_VERSION
FINAL_P11_FINANCE_HANDOFF

FINAL_P12_CHANGED_PATHS
```

## 10. Stop conditions and non-authorization

Stop and return to Current Ops if final refs disagree, ancestry is not a clean continuation of the accepted pair, a supposedly final worktree contains uncommitted evidence, generated consumer bytes disagree, migration would invent history/ownership, the P10 employer source is ambiguous, P11 finance provenance is not accepted, or two packages claim the same authority.

This plan authorizes no code, schema, save, tuning, asset, scene, generated output, branch movement, build, runtime, proof run, P12 execution prompt, or P12 implementation. It records where a future authorized team must look after the dependencies close. The active P08–P10 team remains under Current Ops and is not redirected by this document.

POST-P11 OWNER-ACCEPTED CHANGED-PATH REFRESH REQUIRED
