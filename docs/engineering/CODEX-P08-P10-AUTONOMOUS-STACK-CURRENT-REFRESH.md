# Project: Studio — P08–P10 Autonomous Stack: Current Refresh (coding-agent read-only preflight)

**Authorization:** `OPS-P08P10-20260905-01` (delta: `docs/operations/OPS-P08P10-20260905-01-CURRENT-OPS-DELTA.md`)
**Mode:** changed-path-only reconciliation of the planning package against the actual accepted source. No production edit precedes this document.
**Planning limit resolved:** SOURCE INSPECTION NOT AVAILABLE TO FUTURE OPS — REQUIRES CODING-AGENT READ-ONLY PREFLIGHT → **PERFORMED LOCALLY (this document).**

## 1. Repositories, refs, and equality (verified 2026-09-05)

| Item | Exact value |
|---|---|
| TypeScript repository | `HSpector1/The-Movies`, remote name `hspector-github` (not `origin`) |
| TS accepted campaign `campaign/living-lot-ts` | `2753e18ba8fb5f65b936c22cde9531646fecc6cd` — local == remote-tracking == advertised |
| TS `main` (frozen, untouched) | `c902a704eb948cc576083d0973c8c23e59937dc1` |
| TS docs publication `docs/p08-p10-autonomous-stack-launch-01` | `72ca8e797e5185a5dec13ac4c4311e391b8e96e3` (parent = accepted base; 35 docs byte-identical to the reviewed ZIP; `git apply --check` PASS; pushed; local == upstream == advertised) = `FINAL_DOCS_SHA` |
| TS WIP `wip/p08-p10-autonomous-stack-01-ts` | created at the accepted base, pushed empty and verified, then fast-forwarded to `FINAL_DOCS_SHA`; order + delta commit `5e01714866134552eb28ad6fb7753b598f5df123` pushed |
| TS worktree (one editing owner) | `/Users/bruce/The Movies - P08-P10 Stack TS` (worktree of the repository whose main worktree is `/Users/bruce/The Movies - Github Push Test`) |
| Unity repository | `HSpector1/project-studio-unity-visual-spike`, remote name `origin` |
| Unity accepted campaign `campaign/living-lot-client` | `c4c65db464ef9abcf3bdcc088f5c8a47cc9081b6` — local == remote-tracking == advertised |
| Unity WIP `wip/p08-p10-autonomous-stack-01-client` | created at the accepted base, pushed empty, local == upstream == advertised |
| Unity worktree (one editing owner) | `/Users/bruce/The Movies - P08-P10 Stack Unity` (worktree of the repository whose main worktree is `/Users/bruce/Project Studio - Unity Visual Spike`) |
| Unity Editor | `6000.3.22f1` installed at `/Applications/Unity/Hub/Editor/6000.3.22f1` (project `ProjectVersion.txt` matches) |
| Node / npm | `v24.16.0` / `11.13.0` (`/Users/bruce/.local/bin/node`) |
| Generated DTO at both bases | SHA-256 `045fccce1ae318cbd338779fd52bd805302c1b8ad5ed033cb24d08eab590047f`, Git blob `84d9c9a814ad4cc92d8a882205baa2f484ff8527` — identical in TS `generated/unity/StudioBridgeDtos.Generated.cs` and Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` |
| Contract manifest | schema `sha256:ddce1c399ac4ff58327b296a0600428ac3f3346b84f3639e66e48e53a65fbe99`; protocol `4`; projection `15`; `CURRENT_ACCEPTED_SAVE_VERSION = 16` (`scripts/bridge-contract-consumer-lock.ts`) |
| Accepted player build | `/Users/bruce/The Movies - P07A Unity/Builds/macOS/…` manifest exe `c3372eb5…`, Assembly-CSharp `52229807…`, engine `b92dc8e6…`, TS `d0953e52…`, Unity `c4c65db4…`, dirty=false |
| Accepted candidate | `/Users/bruce/Desktop/P07A-Owner-Candidate-a6f4f82-c4c65db/` (untouched) |
| Owner durable profile (READ-ONLY to automation) | `/Users/bruce/Library/Application Support/Project Studio/bridge-runtime/bridge-runtime-v1.json` SHA-256 `d949003e1874406170bfd3e7c8f4c6dc2dc92d24bb125376c435cdf21eec8b4b` == baseline copy `/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json` (save V15, week 8, cash $74,470, 8 contracts, 0 films, endowed plant: development-casting, post-building, scenery-shop, soundstage-07, soundstage-12) |
| Other sessions | one unrelated `caffeinate -i -t 300` (PID 74131) owned by another session — not touched. No Unity editor, player, engine, bridge, or proof process running at preflight. |

## 2. Baseline floors captured at the WIP tip (before any production edit)

| Floor | Result |
|---|---|
| `npm run typecheck` (core + ui) | clean |
| `npm run typecheck:bridge` | clean |
| `vitest run` (all projects) | **363 files, 4926 passed / 5 skipped** (== accepted seal) |
| Unity EditMode (`-runTests -testPlatform EditMode`, fresh worktree import) | **784/784** (== accepted seal) |

## 3. Harness and command inventory (actual, not assumed)

- TS engine bundle: `npm run build:studio` → `dist/studio/engine.mjs` + `studio.mjs` (esbuild, node24, sha256 printed).
- Contract: `npm run generate:bridge-contract` / `check:bridge-contract` (+ `:fixtures`); cross-repo attestation `npm run verify:bridge-contract-consumer -- --typescript-root … --unity-root … --save-version N …` (`scripts/verify-bridge-contract-consumer.ts`; the lock pins `CURRENT_ACCEPTED_SAVE_VERSION`).
- Unity build: `Unity -batchmode -projectPath <worktree> -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS -logFile … -quit` → `Builds/macOS/Project Studio Visual Spike.app` (BuildMacOS requires + validates the committed canonical scene `Assets/Studio/Scenes/StudioLot.unity`; it does not re-bake). Then `tools/p04a1-build-manifest.sh` (env `CLIENT_REPO`, `TS_REPO`, `APP`) writes `build-manifest.json`.
- Unity EditMode: `Unity -batchmode -projectPath <worktree> -runTests -testPlatform EditMode -testResults <xml> -logFile <log>`.
- Visual Oracle: `tools/p07-run-visual-oracle.sh <scenarioId>` (env `P07_TS_REPO`, `P07_ORACLE_WIDTH/HEIGHT/FULLSCREEN`, fixtures `ui/e2e/p07-visual-oracle-v1/s<n>-<id>.checkpoint.json` generated by `scripts/gen-p07-visual-oracle-fixtures.mts`); runner `StudioPostReleaseOracleRunner` in-player; CF-02 bindings (manifest exe sha, stale-source refusal, evidence collision refusal).
- Real HID: `tools/p04a1-proof-launch.sh` + journey drivers (`tools/p0*-proof-journey.mjs`), `tools/ownerinput/ownerinput` (accessibility-trusted), `tools/p04a1-proof-teardown.sh`; element map via `-studioUiElementMap -studioUiElementMapPath`.
- Real-profile journey: `node_modules/.bin/vite-node scripts/p07-real-profile-journey.mts` (in-memory copy of the read-only baseline; re-checks baseline sha).
- Candidate packaging: `~/Desktop/<pkg>-…-<ts>-<unity>/` with `player/`, `launcher/launch.sh` + `engine.mjs` + `demos/*.checkpoint.json`, `PRODUCT-IDENTITY.json`, `docs/`, `evidence/`, `proof/` (P07 pattern).
- Engine boot: `PROJECT_STUDIO_BRIDGE_RUNTIME_DIR/bridge-runtime-v1.json` checkpoint → `BridgeSession.fromRuntimeCheckpoint`; absent → `BridgeSession.createRuntime()` = `newGame('current-game-unity-adoption-v2')` = `generateWorld` + `beginFounding` (the Gate founding path). Routes: `/health /contract /session /snapshot /command /quote /save /load`.

## 4. Current seams (verified) and classification

Legend: **REUSE** (consume as-is), **EXTEND** (add additive members), **NEW** (create), **RAP** (replace after parity), **DNT** (do not touch).

### 4.1 Save / migration / identity
| Seam | Fact | Class |
|---|---|---|
| `src/core/types.ts` `GameStateV16 = GameStateV15 & { releaseAuthority }`; `GameState = GameStateV16` | roots V2..V16 enumerated (founding, contracts, ledger, freeAgents, theatricalRuns, careerEvents, economyEngagedEver, publicity, operations, scriptDevelopment, castingSessions, construction, placement, property, sets/nextSetId/productionQueue/originalScreenplays/studioEvents, releaseAuthority) | EXTEND (add `GameStateV17`, `GameStateV18`) |
| `src/core/save.ts` `validateSaveV16` (strip-and-delegate discipline), `convertV15ToV16`, `migrateToV16`, `validateSave` dispatch, downgrade guards | frozen validators V1–V15; V16 validated by stripping the new root and delegating | EXTEND (add `validateSaveV17/18`, `convertV16ToV17`, `convertV17ToV18`, `migrateToV17/18`, downgrade guards) |
| `ui/src/engine/adapter.ts` `importSaveJson` → `migrateToV16(save).state`; legacy V1/V2 import chains end in `convertV15ToV16` | EXTEND (chain through V17/V18) |
| `bridge/session.ts` `importSaveJsonV16` | EXTEND |
| `scripts/bridge-contract-consumer-lock.ts` `CURRENT_ACCEPTED_SAVE_VERSION = 16` | EXTEND (17 → 18 at the package boundaries) |
| `src/core/studioEvents.ts` `StudioEventLog` Tier D/W, `persistedProductionIds` reservation via `studioEventProductionIds` | DNT for compaction/identity law; REUSE as a source of exact facts |
| `src/core/productionIdentity.ts` | DNT |

### 4.2 Standing (P08)
| Seam | Fact | Class |
|---|---|---|
| `src/core/standing.ts::updateStanding` (D-6 formulas; `StandingContext` = castFames, actualNegative, requiredNegative, baseMarketValue, marketing, salaries, engaged) | pure | DNT (formulas); REUSE |
| Mutation site 1: `src/core/tick.ts` step 4 (`records` in ascending production id; `updateStanding` per released film) | before/after per film available in-loop | EXTEND (emit receipts) |
| Mutation site 2: `src/core/tick.ts` step 5.5 awareness drift (engaged only; `AWARENESS_DRIFT_RATE/ANCHOR`) | EXTEND (emit receipt only when the value actually changes) |
| Mutation site 3: `src/core/actions.ts::applyPublicity` (line ~2777; `publicityLiftAt`, ledger `publicity`) | EXTEND (emit receipt) |
| `worldgen.ts` `INITIAL_STANDING` (40/40/50) | initial value, not a mutation | DNT |
| `ui/src/engine/adapter.ts::standingChannels` (labels + meanings) | REUSE (drivers copy) |
| No other write site exists (grep of every `standing` assignment across `src/core`, `ui/src/engine/adapter.ts`, `bridge/`) | inventory complete | — |

### 4.3 History sources (P08)
| Source fact | Owner | Class |
|---|---|---|
| Release result: `state.studio.releasedFilms[]` (`FilmResult.productionId`, `releaseTick`, `criticScore`, `boxOffice`), `theatricalRuns[]` (`status` active/completed/legacyCompleted) | P07 | REUSE (exact IDs) |
| Studio events Tier D: `wrapped`, `premiere(filmId)`, `releaseCommitted`, `constructionCompleted(placementId)`, `setBuilt`, `setRetired` | C2a/P06 | REUSE (source references) |
| Career events `state.careerEvents[]` (`TalentCareerEvent.eventId = filmId:talentId`, frozen before/after) and `FilmResult.participants` (optional) | D-14 | REUSE |
| Placement: `state.placement.facilities[]` (id, blueprintId, facilityId, projectId, status, placedWeek, completesWeek); `placement.ts::completeDuePlacements` returns `completed[]`; `demolishFacility`/`moveFacility` | C1 | REUSE + EXTEND (P09 emits exact milestones) |
| Founding: `beginFounding`, `applyFoundStudio`, `applyActivateStudioOperations` (endowed `INITIAL_STUDIO_FACILITIES` + `endowedHouseSets()`), `economyEngagedEver` | D-11/C2a | EXTEND (regime branch; founding fact) |

### 4.4 Bridge / projection
| Seam | Fact | Class |
|---|---|---|
| `bridge/schema/bridge-schema.ts` (`PROJECTION_VERSION = 15`, `PROTOCOL_VERSION = 4`; `studioLotSnapshotProperties` master; `StudioProjectionBundle` sections lot/productions/people/construction/journeyNotices/releaseResults/development/casting/release; `AVAILABLE_INTENT_KINDS` closed enum; quote families `quoteCommission`/`quoteCasting` with digest-bound opaque `intentId`) | EXTEND: new sections `history` (P08), `build`/placement quote family (P09), `people` profile/roster projection (P10); projection 16/17/18; protocol stays 4 unless a command semantic cannot remain additive |
| Wire validator (Unity `StudioBridgeWireValidator`) enforces `additionalProperties=false` | every added field must be in schema + regenerated DTOs | — |
| `bridge/session.ts` (intent options, `quote()`, `pendingQuotes`, `createManagedBridgeState`, `BridgeSession.createRuntime`) | EXTEND (history section; `quotePlacement`/`quoteContract` families; bare-lot fresh session) |
| `generated/unity/*` + Unity `Assets/Studio/Runtime/Data/Generated/*` | regenerate, never hand-edit; byte-identical sync | EXTEND |
| Version pins to update per bump: `tests/bridge-schema.test.ts` (×4 incl. `$id`), generated C# `ProjectionVersion`, `bridge/schema/project-studio-bridge.schema.json` | EXTEND |
| `ui/src/lot/snapshot/StudioLotSnapshot.ts` (`LotPlacementProjection` incl. `catalog: LotBlueprintState[]`, `LotPropertyProjection.buildings[]` with roles landmark/founding/parcel/placed, `LotPersonState`, `LotPresencePerson`) | placement catalogue, parcels, placements and property bodies are ALREADY on the wire | REUSE |

### 4.5 Placement / property / construction (P09)
| Seam | Fact | Class |
|---|---|---|
| `src/core/lot.ts` `INITIAL_PROPERTY` (28×26; roads; parcels incl. `expansion`; 8 structures gate/admin/theater/writers/casting/stage-a/stage-b/post), `initialProperty()`, `propertyOf()` | DNT (`INITIAL_PROPERTY` immutable); NEW `BARE_LOT_PROPERTY` |
| `src/core/placement.ts` (`queryPlacement`/`quoteForBlueprint` 12 ordered rejections; `commitPlacement` charges `quote.cost`, derives facilityId/projectId; `completeDuePlacements`; move/demolish refusals; `studioPlacementView`) | REUSE |
| `src/core/tuning.ts` `FACILITY_BLUEPRINTS`: `development-casting-annex` ($780K/13w/$3.5K/+1), `development-casting-hall`, `development-office-2/3`, `craft-annex`, `stage-standard` ($2.4M/16w/$9K/+1), `post-building` ($1.15M/14w/$5K/+2), `scenery-shop` ($850K/11w/$4K/+2), `development-casting-office` ($1.5M/14w/$5.5K/+2 — the B6 prototype envelope, already authored) | REUSE (no new blueprint invented) |
| `src/core/sets.ts` (`commissionSetRefusal`: managed, stage exists, no mounted set, free scenery capacity, affordable; `SET_BLUEPRINTS`, `HOUSE_SET_BLUEPRINT_ID`, `endowedHouseSets`) | REUSE; a bridge quote family is NEW (no bridge intent exists today for Sets) |
| `src/core/operations.ts` `INITIAL_STUDIO_FACILITIES`, `initialManagedStudioOperations` | EXTEND (bare-lot branch: empty facilities) |
| `tick.ts` step 1.6 placement completion → `constructionCompleted` event | REUSE as P09 producer |
| Unity `StudioBridgePresentation.ApplyConstruction` binds exactly ONE authored construction body (`placed-1`, the legacy Annex parcel pad at world (−57,0,34)); placed facilities are otherwise not rendered as bodies; there is NO grid→world mapping in Unity; the authored lot is hand-placed (`StudioLotArchitectureAuthoring`: gate (2,−51.8), admin (−55,−23.5), casting (−14,−17.5), theater (29,−25), writers (58,−45), stage-a (47,34), stage-b (66,−23), post (−11,35)); camera clamp x∈[−88,88], z∈[−60,66] | NEW: property-driven grid presenter (`StudioLotGridMap`, parcels/roads/sites/placed bodies), regime-aware founding-body visibility; see §6 |

### 4.6 People (P10)
| Seam | Fact | Class |
|---|---|---|
| `src/core/types.ts::Talent` (perceived/actual skills, `ceilings` hidden, `fame` = Star Power, `workEthic`, `genreExperience{actual,perceived}`, `workHistory`) | REUSE; hidden fields never projected |
| `src/core/talentSummary.ts` `roleOVR` (perceived), `roleTier`, `expectedPotentialRange/Tier` (noisy estimate), `workEthicLabel`, `careerIdentity`, `genreExperience(…,'perceived')` | REUSE |
| `src/core/employment.ts` `employmentStatus` (5 states), `activeContract`, `renewalWindowOpen`, `terminationCost`, `contractOffer(Options)`, `hiringMarketIds`, `freelancerMarketIds`, `busyTalentIds` | REUSE |
| `src/core/presence.ts` `studioPresence` (engagement/credit/site/slot/beats/blockedReason) | REUSE |
| `ui/src/engine/adapter.ts` `talentProfile`/`toTalentProfile` (`TalentProfile`, `DisciplineSummary`), `employmentInfo`, `renewOfferTruths`, `rosterCards`, `talentAssignmentContext`, `filmRecordView` | REUSE (compose into one player-safe wire projection) |
| Wire today: `StudioPersonSnapshot` (id/name/role/authority/productionId/title), `StudioPresencePersonSnapshot` | EXTEND (new `people.profiles[]`/roster projection) |
| Unity `StudioPeopleRailHud` + `StudioPeopleRailContracts` (5-row compact strip from `presence.people[]`, footer → Casting building Locate) — the accepted "People strip" lives on the LEFT edge below the movie rail / living-time band | EXTEND (row → world person select / Profile route); layout preserved (§5.5) |
| Unity authoritative person bodies: `StudioBridgePresentation.ApplyPeople` slots (`TryGetAuthoritativePersonStableId(talentId)`), `SelectableEntity.Kind == Person` | REUSE |

### 4.7 Unity lot shell, host, routes, menu, focus
| Seam | Fact | Class |
|---|---|---|
| `StudioWorkspaceHost` (UI Toolkit; `OpenCasting/OpenProduction/OpenReleaseResult`, `CloseWorkspace`, `RequestCloseWorkspace`, static `TryConsumeCancel` one-layer Esc peel, `SuspendForLocate` + `NavigationOriginRestored` reopen, `SetPanelInputSuppressed`, inspector cards evaluated per selection) | EXTEND: `OpenStudioHistory(tab, subjectId)`, `OpenPersonProfile(talentId)`, `OpenRoster()`, `OpenBuild()`; new inspector cards for `admin` (History) and person; Back grammar reused |
| Building card pattern: `StudioCastingInspectorCard` (shown when `Selected.StableId == "casting"`), `StudioProductionEntryCard` (stage row) | REUSE pattern (NEW `StudioHistoryInspectorCard` for `admin`) |
| Read-only workspace template: `StudioReleaseResultWorkspace` + `StudioReleaseResultContracts` (pure) + shared `ps-production-*` USS | REUSE pattern |
| `StudioSelectionManager.Select` (focus → inspection profile or camera focus with origin push), `StudioCameraDirector` (inspection profiles: StageSeven, Administration) | REUSE; Administration already has an authored inspection profile and `StudioInspectionTarget` |
| `StudioHud` legacy IMGUI selection receipt; `StudioSystemMenuHud` (Resume/Save/Load/Quit; confirmation owner) | REUSE |
| `StudioBridgeClient` (`SubmitIntent(option)`, `RequestCommissionQuote/RequestCastingQuote` single-flight `/quote`, `QuoteAccepted/Rejected/Unresolved` events) | EXTEND (`RequestPlacementQuote`, `RequestContractQuote`) |
| Element map: `StudioUiElementRegistry` (UITK names are auto-published) + legacy rects (`rail-details-*`) | REUSE |
| Collision-prone shared files (one editing owner): TS `types.ts`, `save.ts`, `tick.ts`, `actions.ts`, `index.ts`, `adapter.ts`, `bridge-schema.ts`, `session.ts`, generated; Unity `StudioWorkspaceHost.cs`, `StudioBridgePresentation.cs`, `StudioBridgeClient.cs`, `StudioBridgeProtocol.cs`, shared USS, canonical scene | — |

## 5. Final P07 changed paths (for cross-check)
`src/core/receptionVerdict.ts`, `src/core/newspaper.ts`, `src/core/studioRunRecap.ts`, `ui/src/engine/adapter.ts` (`filmResultView`, `filmResultSnapshot`), `ui/src/lot/snapshot/StudioLotSnapshot.ts` (`FilmResultCard`), `bridge/schema/bridge-schema.ts` (`StudioFilmResultSnapshot`, `results`), `bridge/session.ts`, generated contract, Unity `StudioMovieRailContracts`, `StudioMovieSlateContracts`, `StudioReleaseResultContracts`, `StudioReleaseResultWorkspace`, `StudioWorkspaceHost.OpenReleaseResult`, `StudioProductionRailHud`.

## 6. Engineering decisions resolved by this preflight (routine choices per docket §C)

1. **P08 persistence:** NEW additive root `studioHistory: StudioHistoryState { recordingStartedWeek, nextEventId, rows[] }` in `GameStateV17` (save V17, projection 16). `StudioEvent` union is not widened. Rows are appended exactly once inside the same `tick`/`applyActions` boundaries that produce the source fact, in deterministic order (release order = ascending production id; drift after broadcast; publicity at action time). Standing receipts freeze before/after/deltas/source kind/source ids/week/formula version/public driver facts. No `seen` state in GameState. Retention: history rows are permanent and sparse by construction (only significant families are recorded; routine ticks never append). A 6,240-week growth measurement is a P08 gate.
2. **P08 world route:** the authored `admin` body (Administration; already has a `StudioInspectionTarget` profile and marker) opens a new retained `StudioHistoryWorkspace` (Overview / Standing / Timeline / Films / People; Records tab only when a fact-backed record exists). No new building.
3. **P09 founding regime:** NEW `foundingRegime: 'endowed' | 'bare-lot'` root in `GameStateV18` (save V18, projection 17). `convertV17ToV18` writes `endowed` for every existing save (no other change). `generateWorld(seed, { regime })` writes the regime at creation; `applyActivateStudioOperations` branches on it (bare-lot: empty facilities, no endowed sets, `nextSetId 0`, sparse property from NEW `BARE_LOT_PROPERTY`). `INITIAL_PROPERTY` untouched. Engine fresh-session regime comes from the runtime environment (`PROJECT_STUDIO_NEW_GAME_REGIME`) so the candidate launcher can start a bare-lot campaign without mutating any existing profile.
4. **P09 bridge:** NEW quote family `quotePlacement` (draft = blueprintId + origin | move placementId+origin | demolish placementId) returning the full `PlacementQuote` (cells, per-cell legality, cost, opex, weeks, completion week, capability, capacity delta, ordered rejections, primary reason, unmet requirements, instance count/limit) and minting the digest-bound commit intent; NEW `quoteSet` (commission/repair/strike) mirroring the same law. Commit revalidates at submit (existing `pendingQuotes` digest law). Cancel = no request.
5. **P09 Unity world:** NEW property-driven presenter: `StudioLotGridMap` (cell size + origin anchored on the authored Gate/Administration bodies), procedural ground/road/parcel dressing for the bare-lot regime, footprint/legality overlay in Build mode (per-cell verdicts from the TS quote, non-color reason text), persistent N construction sites and class-based procedural placed bodies sized to their footprints, all keyed by exact placement id. In the bare-lot regime the authored founding art (writers/casting/stage-a/stage-b/post/placed-1 pad) is hidden because the property publishes no such structures; Gate and Administration art stay where they are and the grid is anchored to them. **Known limitation to disclose:** on the ENDOWED lot the authored founding art bodies do not stand on their engine grid footprints (the authored lot predates the grid); the Build overlay shows the engine's exact cells and legality remains TypeScript-authoritative, but the art bodies are visually offset. The accepted endowed layout is deliberately not re-authored (§5.5; regression risk to accepted P06/P07 proofs).
6. **P10:** save-neutral (no missing authoritative fact found); projection 18 adds `people.profiles[]` (player-safe projection composed from `toTalentProfile`, `employmentInfo`, `studioPresence`, `talentAssignmentContext`, career events) with an explicit visibility table (written before the contract change, per §26A). Hidden fields (`actual`, `ceilings`, actual genre experience, RNG) are excluded by construction and guarded by schema-negative tests.
7. **Left People strip:** the accepted implementation keeps the People strip on the LEFT edge (below the movie rail/living-time band) and the movie rail on the RIGHT; no panel is relocated (§5.5).

## 7. Stop-condition check
- Private Unity checkout verified equal to the accepted SHA: **PASS**.
- Current owners mapped: **PASS** (§4).
- Save lineage identified exactly (V1–V16 chain, `migrateToV16`, `validateSaveV16`): **PASS**.
- No unresolved authority conflict found. No other session holds a lock on either worktree.

**Verdict: PREFLIGHT PASS — proceed to P08 Wave 0.**
