# Project: Studio — Current Forward Codebase Static Audit 01

## 1. Executive judgment

The current forward codebase is structurally sound enough to continue, but it is not equally safe at every boundary. The strongest parts are the fail-closed TypeScript authority model, deterministic command surface, atomic checkpoint store, exact generated-contract parity at the three audited revisions, and the Unity presentation code's general respect for authority-owned state. Those should be reused, not simplified away.

This audit accepts 20 findings: five P1 and fifteen P2/P3 findings. No P0 was found. Two findings are current P04A.1 WIP defects that should be resolved by the active lead before seal: one physical Esc press can peel both the system menu and the hidden inspection mode, and the current proof launcher can attribute a journey to the wrong player process or a stale build. These are WIP-specific; they are not findings against the accepted Unity baseline.

Six narrow architecture/correctness items should be completed before P05 starts. They are stronger theatrical-run save invariants, one bridge snapshot-build context, a sound union-to-C# generator, an integration check against the real Unity consumer, a typed Unity presentation test boundary, and removal of the repeated writer-body scene search. None requires a platform rewrite.

The principal maintenance pattern is repeated derivation without an explicit context: bridge snapshots repeatedly validate, serialize, hash, and project the same revision; casting builds the same availability and script facts multiple times; placement repeatedly walks the ledger. The recommended response is small immutable per-operation or per-revision contexts, not mutable global caches.

The audit deliberately rejects broad migrations and cosmetic splitting campaigns. In particular, it does not recommend moving simulation authority into Unity, weakening fail-closed validation, replacing deterministic hit resolution with first-hit raycasts, mechanically splitting frozen save migrations, or turning P04A.1 into a generalized UI rewrite.

## 2. Exact audited authorities

| Authority | Repository/worktree inspected | Supplied authority branch | Exact audited SHA | Treatment |
|---|---|---|---|---|
| TypeScript forward authority | `/tmp/studio-static-audit-01.fgSbvd/typescript` (isolated worktree from `/Users/bruce/The Movies - Unity Production Convergence 80H`) | `campaign/living-lot-ts` (output branch `codex/current-forward-codebase-static-audit-01` was created at this SHA) | `b870a712758b7d1689b0cc4110c8fe64a0702234` | Current accepted TypeScript implementation |
| Unity accepted baseline | `/tmp/studio-static-audit-01.fgSbvd/unity-accepted` (isolated worktree from `/Users/bruce/Project Studio - Unity Production Convergence 80H`) | Detached from `campaign/living-lot-client` | `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` | Accepted production baseline |
| Unity active WIP | `/tmp/studio-static-audit-01.fgSbvd/unity-wip` (isolated worktree from the same Unity repository) | Detached from `wip/p04a1-owner-input-remedy-resume-20260827` | `edff346781bb61a78a2097691993d494bff1fc19` | Separately classified, unsealed delta only |

The only implementation comparison across revisions was `d0c42d7089a25eb496bcfc0e69433c3dc786bc35..edff346781bb61a78a2097691993d494bff1fc19`. Literal `main`, old campaign branches, Golden histories, experiments, and pre-baseline implementation history were not inspected.

The following prior documents were consulted at their supplied commits solely to avoid duplication:

- Unity production architecture audit and Builder Annex at `8110820d96ddf2089df582bc0a0a92d3d4cf17d9`.
- P04A implementation reconnaissance at `44b0c8d0440fd683910d1ecd5a6365eaa49d82fc`.
- P05A provisional implementation reconnaissance at `9b72981205a90bcac52ff2ab1bb248e9d16edd72`.
- Repository hygiene audit at `e374e503f24ae5fc908d43823695fce3f6b75ff4`.
- Relevant dependency triage/reconnaissance documents referenced by those authorities.
- `P04A1-OWNER-INPUT-REMEDY-RESUME.md` as present at the exact WIP SHA.

## 3. Scope and exclusions

This was a static, documentation-only audit. It covered current TypeScript domain and runtime code, protocol generation, saves/checkpoints/journals, bridge projections, current Unity runtime/presentation/input source, exact WIP changes, test/proof infrastructure, build scripts, and high-confidence static performance and durability risks.

Explicit exclusions were Unity execution or compilation through the Editor, packaged-player execution, batchmode, supervisor or bridge startup, `npm run play`, P05 startup, GUI automation, CGEventPost, screenshots, durable-profile access, production edits, broad branch archaeology, product-law revision, and speculative platform migration. The Owner's active working directories were observed only through non-mutating Git/source reads needed to create isolated worktrees; no branch was switched and no file there was changed.

### Static validation record

All commands below ran in disposable worktrees. No dependency version was changed.

| Command/check | Result | Qualification |
|---|---|---|
| Exact `git rev-parse HEAD` and `git status --short` at all three isolated worktrees | PASS | Revisions matched the full SHAs above before inspection. |
| `npm ci` | PASS | Node `v26.3.1`, npm `11.16.0`; npm reported five known dependency advisories. Existing dependency policy owns their disposition, so this report does not duplicate it. |
| `npm run check:bridge-contract` | PASS | The TypeScript schema and repository-generated C# contract matched. |
| `npm run typecheck:bridge` | PASS | Headless TypeScript only. |
| `npm run typecheck` | PASS | Headless TypeScript only. |
| `npm run test:core -- --exclude 'tests/bridge*.test.ts'` | PASS, 1,850/1,850 | Bridge/supervisor integration suites were intentionally excluded because they can start prohibited processes. Separate bounded pure bridge suites passed 100/100 and focused core suites passed 214/214. |
| `npm run test:ui` (final isolated run) | PASS, 2,596 passed and 5 skipped | A first concurrent run had one five-second timeout followed by four same-file DOM-contamination failures; the file then passed 28/28 alone and the full suite passed alone. This is recorded as a concurrency sensitivity, not a reproducible product defect. |
| `npm run build` | PASS | Vite emitted its generic greater-than-500 kB chunk warning. No performance conclusion is drawn without runtime measurement. |
| `npm run build:studio && npm run audit:studio-packaged` | PASS | Built and statically audited the package; it was never executed. |
| `shasum -a 256` over TypeScript `generated/unity/StudioBridgeDtos.Generated.cs` and both Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` copies | PASS | All three had SHA-256 `97dd666de7f8fe447ed24e0fe28e6ba7aa30701cf8bc45e13d60e453d8b9a32f`. |
| `node --check` for every changed WIP `.mjs`; `bash -n`/`zsh -n` for changed shell scripts | PASS | Syntax only; no runner was started. |
| `git diff --check d0c42d7..edff346` | PASS | Exact bounded WIP delta. |
| `swiftc -typecheck` for the added owner-input helper | PASS with a macOS 14 deprecation warning | Typecheck only; the helper was not run and no input was posted. |

Literal command ledger (run from the indicated disposable worktree; the package was built but never executed):

```sh
# TypeScript worktree
git rev-parse HEAD
git status --short
npm ci
npm run check:bridge-contract
npm run typecheck:bridge
npm run typecheck
npm run test:core -- --exclude 'tests/bridge*.test.ts'
npx vitest run --project core tests/bridge-schema.test.ts tests/bridge-runtime-checkpoint.test.ts tests/bridge-runtime-coordinator.test.ts tests/bridge.test.ts tests/bridge-casting.test.ts tests/bridge-development.test.ts
npm run test:ui
npm run build
npm run build:studio && npm run audit:studio-packaged
shasum -a 256 generated/unity/StudioBridgeDtos.Generated.cs /tmp/studio-static-audit-01.fgSbvd/unity-accepted/Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs /tmp/studio-static-audit-01.fgSbvd/unity-wip/Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs

# Unity WIP worktree; syntax/type checks only
git diff --name-only d0c42d7089a25eb496bcfc0e69433c3dc786bc35..edff346781bb61a78a2097691993d494bff1fc19 -- '*.mjs' | while IFS= read -r audit_file; do node --check "$audit_file"; done
git diff --name-only d0c42d7089a25eb496bcfc0e69433c3dc786bc35..edff346781bb61a78a2097691993d494bff1fc19 -- '*.sh' | while IFS= read -r audit_file; do bash -n "$audit_file"; zsh -n "$audit_file"; done
swiftc -typecheck Tools/ownerinput/ownerinput.swift
git diff --check d0c42d7089a25eb496bcfc0e69433c3dc786bc35..edff346781bb61a78a2097691993d494bff1fc19

# TypeScript worktree; final audit-document structure and whitespace
audit_doc='docs/engineering/CODEX-CURRENT-FORWARD-CODEBASE-STATIC-AUDIT-01.md'
git diff --check
test "$(rg -c '^# ' "$audit_doc")" -eq 1
test "$(rg -c '^## [0-9]+\. ' "$audit_doc")" -eq 20
test "$(rg -c '^### CF-[0-9]{2} ' "$audit_doc")" -eq 20
test "$(rg '^### CF-[0-9]{2} ' "$audit_doc" | sort -u | wc -l | tr -d ' ')" -eq 20
test "$(rg -c '^\| Classification \|' "$audit_doc")" -eq 20
test "$(rg -c '^\| Repository / SHA \|' "$audit_doc")" -eq 20
test "$(rg -c '^\| Exact file and symbol \|' "$audit_doc")" -eq 20
test "$(rg -c '^\*\*Tests/proofs required\.\*\*' "$audit_doc")" -eq 20
test "$(rg -c '^\*\*Effort / change risk\.\*\*' "$audit_doc")" -eq 20
test "$(rg -c '^\*\*Dependency, collision, timing\.\*\*' "$audit_doc")" -eq 20
! rg -n '[[:blank:]]+$' "$audit_doc"
! rg -n $'\t' "$audit_doc"
```

The CF-03/04/05/20 reproductions were one-shot in-memory Node probes against the built modules; their snippets were not retained as repository artifacts. Each finding therefore requires a committed regression fixture before a fix. Unity C# was not compiled because the permitted workflow did not provide a non-Unity compiler boundary; inability to compile it statically is not treated as a defect.

The accepted Unity runtime contains approximately 39,449 C# lines and 16,500 test lines; the WIP contains approximately 41,333 runtime lines and 18,092 test lines. The accepted test suite has 67 `File.ReadAllText` uses across 22 test files and 1,089 reflection references across 32 test files. WIP rises to 73 source reads across 24 files and 1,257 reflection references across 35 files. These counts are context for CF-10, not proof that every use is wrong.

## 4. Existing findings intentionally not repeated

This report does not re-argue settled architecture or previously recorded checkpoint reconnaissance:

- TypeScript remains simulation and command authority; Unity remains presentation/input.
- HDRP migration, DOTS conversion, and Addressables adoption are not current checkpoint prerequisites.
- UI Toolkit remains the forward direction for retained workspaces; current IMGUI coexistence is not itself a new defect.
- Old Git binary-history rewriting remains deferred.
- Existing P05 N-Stage, scenery, Stage A, and production singleton findings remain owned by the P05 reconnaissance.
- Existing dependency findings and their pinning/remediation policy are not reissued from `npm audit` output.
- Existing exact-ID, fail-closed bridge, journal, schema-version, and checkpoint-law recommendations remain in force unless sharpened by a current-code-specific finding below.

## 5. Top findings ranked by severity and leverage

| Rank | Finding | Severity | Classification | Why it ranks here |
|---:|---|---|---|---|
| 1 | CF-01 — Esc can peel two navigation layers in one frame | P1 | A. FIX BEFORE P04A.1 SEAL | Current WIP input correctness defect on the checkpoint's central interaction. |
| 2 | CF-02 — Proof launcher does not bind evidence to the launched binary | P1 | A. FIX BEFORE P04A.1 SEAL | A green journey can be attributed to another process or stale build. |
| 3 | CF-03 — Theatrical-run invariants permit duplicate settlement | P1 | B. FIX BEFORE P05 STARTS | An accepted save can pay and display the same production twice. |
| 4 | CF-04 — Contract rows can encode contradictory employment | P1 | C. STANDALONE MAINTENANCE CHECKPOINT | Crafted or migrated accepted state can double payroll and disagree across views. |
| 5 | CF-05 — Authored-talent allocation can create an immediately unsavable state | P1 | C. STANDALONE MAINTENANCE CHECKPOINT | A valid imported ID can collide with the next creator-generated ID. |
| 6 | CF-06 — WIP proof proxy persists the raw runtime capability | P2 | C. STANDALONE MAINTENANCE CHECKPOINT | Local proof artifacts retain a bearer-equivalent value and cleanup is inconsistent. |
| 7 | CF-07 — Each bridge poll repeats full validation, serialization, hashing, and projection | P2 | B. FIX BEFORE P05 STARTS | Poll frequency multiplies authority work and obscures real wire cost. |
| 8 | CF-10 — Presentation tests lack a typed assembly boundary | P2 | B. FIX BEFORE P05 STARTS | Reflection/source pins miss interaction faults and freeze incidental signatures. |
| 9 | CF-08 — Union-to-C# generation silently takes the first object member | P2 | B. FIX BEFORE P05 STARTS | A valid schema extension can silently generate an incomplete aggregate DTO. |
| 10 | CF-09 — Default contract verification does not bind the real Unity consumer | P2 | B. FIX BEFORE P05 STARTS | Current parity is manual; the routine gate can remain green while the consumer drifts. |

There are no P0 findings. CF-01 and CF-02 are the only seal blockers. CF-06 concerns WIP proof tooling, but it is classified as a coordinated standalone maintenance item because changing active validation tooling mid-proof can itself invalidate evidence; if that tool must be used again for retained evidence, apply its narrow safeguards first.

## 6. TypeScript Core findings

### CF-03 — Theatrical-run validation permits duplicate and incoherent settlement rows

| Field | Assessment |
|---|---|
| Severity / confidence | **P1 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `src/core/save.ts`: `v8TheatricalRun`, `checkV8LiveState`, `validateSaveV15`; `src/core/tick.ts`: `tick`; `src/core/economyView.ts`: `expectedWeeklyRunRevenue`; `src/core/studioRunRecap.ts`: `studioRunRecap` |

**Concrete evidence.** `v8TheatricalRun` validates row shape (`save.ts:1993-2051`), and the V8 validation loop validates rows independently (`save.ts:2248-2255`). V15 inherits that validation chain (`save.ts:4628-4688`). It does not require a unique production ID, correlate the run with the release row, or validate cumulative/index/status relationships. `tick.ts:669-685` pays every active row, `economyView.ts:93-100` sums every row, while `studioRunRecap.ts:591-605` collapses rows through a `Map` keyed by production. A bounded in-memory probe duplicated an active run for `prod-0000`; the state was accepted, and the next tick emitted two `studioRevenue` credits of `1,051,891.3754115484` for that production.

**Why it matters / consequence.** The same accepted state produces double cash and revenue in authority logic while a production-keyed UI can show only one recap row. That is a player-visible state lie and a save-durability hazard, especially before P05 adds more stage/release projection consumers.

**Recommended change — EXTEND.** Extend the existing row validator with a model-aware cross-row invariant pass rather than replacing it. Build `Map<string, TheatricalRun>` and `Map<string, FilmResult>` once, reject duplicate run production IDs, require exact run/release correlation, require non-negative and bounded financial values, and validate status/index/cumulative-gross relations. Preserve explicit compatibility behavior for legacy model-0 rows.

```ts
validateTheatricalRunSet({ runs, releases, modelVersion }): void
// unique productionId; release correspondence; model-specific index/status law;
// cumulativeGross >= 0; studioShare within the model's admissible range
```

**Tests/proofs required.** Mutation tests for every supported V8–V15 fixture; duplicate-production and mismatched-release rejection; model-0 compatibility fixtures; a tick/economy/recap parity assertion proving one accepted production maps to one settlement stream.

**Effort / change risk.** 4–8 hours / Medium. Tighter validation can reject previously accepted malformed saves, so compatibility fixtures and an explicit migration/error message are required.

**Dependency, collision, timing.** No Unity WIP collision. Complete before P05 introduces more production/release consumers.

### CF-04 — Contract validation allows contradictory employment and double payroll

| Field | Assessment |
|---|---|
| Severity / confidence | **P1 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `src/core/save.ts`: `v8Contract`, `checkV8LiveState`; `src/core/employment.ts`: `activeContract`, `weeklyPayroll`; `src/core/tick.ts`: `tick`; `src/core/actions.ts`: `applySignContract`, `applyRenewContract`; `src/core/types.ts`: `Contract` |

**Concrete evidence.** `v8Contract` (`save.ts:1785-1812`) checks row shape, and the containing loop (`save.ts:2238-2242`) checks rows independently. It does not enforce unique talent ownership, non-negative financials, the canonical `endWeekExclusive === startWeek + termWeeks` relation, or consistency between a current contract and free-agent state. The canonical type and creation path encode stronger assumptions (`types.ts:336-342`; `actions.ts:2513-2520`, `2587-2593`). `activeContract` returns the first matching active row (`employment.ts:88-95`), `weeklyPayroll` sums all active rows (`employment.ts:139-145`), and `tick.ts:856` uses the raw stored `state.contracts.length` for overhead before expired rows are pruned at `tick.ts:884-898`. A bounded probe duplicated one accepted contract for `t-act-07`; validation still passed and weekly payroll rose from 46,909 to 49,458.

**Why it matters / consequence.** Different consumers resolve the same contradictory state differently: one contract for employment display, two for money and overhead. A malformed import or migration can therefore create persistent financial divergence without failing closed.

**Recommended change — EXTEND.** Add a current-state contract-set validator after row validation. Index by talent ID, require at most one retained contract per talent, require every retained row to be active at `market.tick`, validate monetary/week arithmetic, and verify contract/free-agent coherence.

```ts
validateContractSet(contracts, talent, currentWeek): void
// row arithmetic, unique/ non-overlapping active ownership, roster coherence
```

**Tests/proofs required.** Duplicate-active, overlapping-range, negative-pay, term/end mismatch, and active/free-agent contradiction fixtures; round-trip tests for every valid legacy fixture; payroll/employment parity tests.

**Effort / change risk.** 2–4 hours / Medium. The change is local, but it deliberately narrows accepted imported state.

**Dependency, collision, timing.** No WIP collision. Schedule as a small save-integrity checkpoint before broad migration work; it need not block current P04A.1.

### CF-05 — Authored-talent allocation can collide with a valid reserved ID

| Field | Assessment |
|---|---|
| Severity / confidence | **P1 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `src/core/actions.ts`: `authoredTalentId`, `applyCreateTalent`, `applyCreateCustomTalent`, `applyCreateBalancedTalent`, `withCreatedTalent`; `src/core/save.ts`: talent-ID uniqueness validation in `checkV8LiveState` |

**Concrete evidence.** `authoredTalentId` derives the next ID from the count of authored rows (`actions.ts:296-305`), and creator paths use it at `actions.ts:965`, `1097`, and `1309`. `withCreatedTalent` appends without a collision check (`actions.ts:975-986`). Save validation correctly requires unique talent IDs (`save.ts:1396-1431`, `2172-2177`). A valid state containing a non-authored talent whose stable ID is `authored-0000` passes validation; the next creator action also emits `authored-0000`, after which `makeSave` rejects the state.

**Why it matters / consequence.** A valid imported or future expanded roster can pass the boundary and then become unsavable through an ordinary action. The failure appears after mutation, not at the allocator boundary.

**Recommended change — REUSE.** Reuse the collision-skipping allocator pattern already present for production IDs in `actions.ts:215-226`. Build a set of all talent IDs, advance the sequence until unused, and keep the current deterministic prefix/ordering.

```ts
nextAuthoredTalentId(allTalentIds: ReadonlySet<TalentId>): TalentId
```

**Tests/proofs required.** Reserved-prefix collision, multiple gaps, deterministic replay, and immediate `makeSave` round-trip after each creator action.

**Effort / change risk.** 1–2 hours / Low. It changes only collision behavior that currently produces invalid state.

**Dependency, collision, timing.** No WIP collision. Ideal quick standalone fix.

### CF-16 — Placement validation repeatedly scans the full ledger

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `src/core/placement.ts`: `assertStudioPlacementInvariants`, `expectedWeeklyOperatingCostAt`, `demolishedFacilityHistory`; `src/core/productionIdentity.ts`: `persistedProductionIds`; `src/core/tick.ts`: `tick` |

**Concrete evidence.** `tick` invokes `assertStudioPlacementInvariants` at `tick.ts:160-177`. Placement validation begins at `placement.ts:1464`, derives ledger state around `:1497-1498`, and calls `persistedProductionIds(state)` three times per placed facility at `:1598-1605` (`productionIdentity.ts:9-58`). Each facility-opex row calls `expectedWeeklyOperatingCostAt` (`placement.ts:1755-1768`); that calls `demolishedFacilityHistory` at `:1407`, whose work walks the ledger twice at `:1428-1454`. The view path repeats cost derivation (`:1918-1927`). The static shape is O(opex rows × ledger rows), plus three repeated persisted-identity walks per placed facility, with identical immutable inputs within one validation.

**Why it matters / consequence.** Larger lots and longer histories increase command/tick validation cost even when no placement changes. Because validation is deliberately fail-closed and frequent, this is a meaningful scale risk rather than a reason to validate less.

**Recommended change — REFACTOR.** Introduce a per-invocation immutable `PlacementAccountingIndex` containing persisted production IDs, current assets by placement, demolished-cost totals, and expected operating costs. Preserve current diagnostic ordering and do not make it global.

**Tests/proofs required.** Byte-for-byte/error-order parity over fixtures, shuffled-ledger determinism, operation-count instrumentation showing one history pass, and scale benchmarks.

**Effort / change risk.** 0.5–1.5 days / Medium. Index construction must preserve legacy ordering and exact failure messages where tests rely on them.

**Dependency, collision, timing.** Independent of Unity WIP. Suitable maintenance checkpoint after the save-integrity fixes.

### CF-19 — Two runtime import cycles reverse intended ownership

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `src/core/save.ts`: `assertStudioPlacementInvariants`; `src/core/placement.ts`: `canAfford`, `economyEngaged`; `src/core/employment.ts`: `salaryCurve`; `src/core/worldgen.ts`: `emptyPublicityState`; `src/core/studioRunRecap.ts`: `financeTotals`, `weeklyOverhead`, `weeklyBurn`, `runway`, `expectedWeeklyRunRevenue`, `commitmentPreview`, `regimeStudioShare`; `src/core/economyView.ts`: `affordabilityOf`, `cheapestPackage`, `contractedRosterCanField`, `packageAllIn`, `recentTypicalCommitment`, `standardPackage` |

**Concrete evidence.** Static import-graph inspection found exactly two non-trivial runtime SCCs in the audited source. The first is `save -> placement -> employment -> worldgen -> save`: `save.ts:116-121` imports `assertStudioPlacementInvariants`; `placement.ts:102` imports `canAfford`/`economyEngaged`; `employment.ts:26` imports `salaryCurve`; and `worldgen.ts:76` imports `emptyPublicityState`. The second is `studioRunRecap <-> economyView`: `studioRunRecap.ts:43-51` imports `financeTotals`, `weeklyOverhead`, `weeklyBurn`, `runway`, `expectedWeeklyRunRevenue`, `commitmentPreview`, and `regimeStudioShare`; `economyView.ts:18-32` imports `affordabilityOf`, `cheapestPackage`, `contractedRosterCanField`, `packageAllIn`, `recentTypicalCommitment`, and `standardPackage`. A comment at `economyView.ts:21-22` acknowledges the coupling.

**Why it matters / consequence.** Initialization order and test isolation depend on bundler behavior, while low-level domain modules import higher-level construction or view modules. Future extraction of bridge/headless code becomes harder and accidental side effects become less visible.

**Recommended change — REFACTOR.** Move `emptyPublicityState` into a neutral state-defaults module, compensation curves into a neutral talent-compensation module, and shared prospective-package/read-model builders into a neutral projection module. Do not create a generic utility bucket.

**Tests/proofs required.** Import-SCC check in CI, current save/worldgen fixture parity, recap/economy snapshot parity, and browser/headless bundle smoke builds.

**Effort / change risk.** 0.5–1 day / Medium. Mostly dependency movement, but import initialization makes it deserving of focused tests.

**Dependency, collision, timing.** No current Unity collision. Coordinate CF-19's view-module move with CF-17/CF-18 to avoid moving the same helpers twice.

## 7. Bridge / save / runtime findings

### CF-07 — A bridge poll repeats full authority derivation and under-reports wire cost

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `bridge/session.ts`: `authoritativeDigest`, `snapshotFor`, `resolveAvailableIntents`; `ui/src/engine/adapter.ts`: `exportSaveJson`; `src/core/save.ts`: `makeSaveV15`, `makeSave`, `exportSave`; `bridge/server.ts`: `createHttpServer` `/health` and `/session` handlers |

**Concrete evidence.** `authoritativeDigest` exports authoritative state (`session.ts:261-263`). `snapshotFor` (`:1172-1204`) constructs the lot projection and digest, then intent resolution (`:606` onward) repeats lot/digest work. `ui/src/engine/adapter.ts:3473-3475` calls `exportSave(makeSave(...))`; `makeSaveV15` validates at `src/core/save.ts:5639-5647`, `makeSave` delegates at `:5655-5657`, and `exportSave` validates again at `:5667-5672`. A normal non-founding snapshot therefore traverses recursive validation four times, canonical serialization/hashing twice, and lot projection twice. `bridge/server.ts:259-299` makes `/health` and `/session` build full snapshots rather than a cheap authority head. `serializationMs` stops before final `JSON.stringify` (`session.ts:1203`), and reported payload bytes omit the metrics field/final canonical wire, so the metrics do not describe the work they appear to describe.

**Why it matters / consequence.** Poll frequency, not authority revision frequency, drives heavy deterministic work. P05 will add richer projection data, increasing latency and obscuring where time is spent. Removing validation would be the wrong fix.

**Recommended change — EXTEND.** First pass a single validated `SnapshotBuildContext` through digest, intent, and projection helpers. Then optionally keep an immutable view cached by accepted authority revision/session epoch and invalidate it only on accepted command, load, or rollover—not on quote, save, or poll. Add a cheap `authorityHead()` for health. Keep arbitrary export/load validation fail-closed.

```ts
type SnapshotBuildContext = Readonly<{
  revision: number;
  validatedSave: SaveFileV15;
  canonicalSaveJson: string;
  digest: string;
  projection: BridgeStudioProjectionBundle;
}>;
```

Rename metrics to distinguish build time from wire-serialization time and measure actual encoded content length.

**Tests/proofs required.** Snapshot-byte and intent-ID parity, validation/projection invocation counts per poll, cheap-health-path assertions, and actual response-byte assertions. If cross-poll caching is later enabled, add the full command/load/rollover invalidation matrix and prove save/quote retain the view safely.

**Effort / change risk.** 1–2 focused days / Medium. Mutable or under-keyed caching would be worse than current duplication, so the revision boundary must be explicit.

**Dependency, collision, timing.** The Unity WIP polls the bridge and changes `StudioBridgeClient.cs`; avoid that file until seal. The TypeScript work can be designed now but should land before P05 projection expansion.

### CF-08 — C# generation silently selects the first member of object unions

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234`; Unity accepted baseline / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `scripts/generate-bridge-contract.ts`: `objectShape`; `bridge/schema/bridge-schema.ts`: `StudioBridgeQuoteRequest` and `StudioQuoteSnapshot`; `generated/unity/StudioBridgeDtos.Generated.cs`: aggregate request and quote-kind vocabulary; Unity `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`: quote serialization/validation; `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`: casting request; `Assets/Studio/Tests/EditMode/StudioBridgePlayerWorkflowTests.cs`: workaround assertion |

**Concrete evidence.** `objectShape` resolves references and, for union/object alternatives, accepts the first recognized property for a name (`scripts/generate-bridge-contract.ts:98-138`, especially `:125-130`). The quote schemas are real unions (`bridge/schema/bridge-schema.ts:1027-1110`). The generated aggregate request consequently exposes commission-draft fields (`generated/unity/StudioBridgeDtos.Generated.cs:1020-1042`) while the generated quote-kind vocabulary contains only the selected commission member (`:715-719`). Accepted Unity serializes commission through aggregate `StudioBridgeQuoteRequest` (`Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs:558-572`) but casting through standalone `StudioQuoteCastingRequest` (`Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs:461-476`). Response validation likewise avoids the incomplete aggregate vocabulary by comparing the member-specific commission and casting kind sets (`StudioBridgeProtocol.cs:141-180`). `Assets/Studio/Tests/EditMode/StudioBridgePlayerWorkflowTests.cs:361-365` pins the casting-request workaround. These workarounds explain why the unsound aggregate has not caused a current failure.

**Why it matters / consequence.** A valid new union member can pass TypeScript schema checks while silently disappearing or receiving the wrong C# type. That is a protocol evolution trap, not merely generated-code style.

**Recommended change — REFACTOR.** Make generation fail closed when same-named properties across union members have incompatible types, or emit an explicit discriminated wrapper per member. Compatible enum/string vocabularies may be merged deliberately; incompatible object shapes must never be first-member-wins.

```text
union member scan -> property/type matrix
  compatible optional field: merge
  discriminant: union vocabulary
  incompatible field: generator error with member paths
```

**Tests/proofs required.** Negative generator fixtures for conflicting member types, complete discriminant-vocabulary fixtures, strict Newtonsoft round-trips for every quote member, and current generated-file equality.

**Effort / change risk.** 1–2 days / Medium–High. The generator and consumers are a protocol boundary; regenerate once and review the full diff.

**Dependency, collision, timing.** Do not regenerate or edit Unity DTO/bridge consumers while P04A.1 is unsealed. Complete immediately post-seal and before P05 adds contract surface.

### CF-09 — Default contract verification does not bind the actual Unity consumer

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234`; Unity accepted / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35`; Unity WIP / `edff346781bb61a78a2097691993d494bff1fc19` |
| Exact file and symbol | `scripts/generate-bridge-contract.ts`: target-path selection/output; `package.json`: contract-check scripts; `.github/workflows/bridge-contract.yml`: contract check; TypeScript `generated/unity/StudioBridgeDtos.Generated.cs`; Unity `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs` |

**Concrete evidence.** Target options are selected at `scripts/generate-bridge-contract.ts:13-31` and written at `:291-318`. The default package/workflow check compares the TypeScript schema with the generated copy inside the TypeScript repository; `.github/workflows/bridge-contract.yml:42-45` invokes that default. The actual Unity project is checked only when an optional path is provided, and the target root is not proven to be the canonical Unity repository. This audit manually compared all three exact authoritative copies and they are currently identical, SHA-256 `97dd666de7f8fe447ed24e0fe28e6ba7aa30701cf8bc45e13d60e453d8b9a32f`; therefore this is a proof-gap finding, not a claim of current drift.

**Why it matters / consequence.** CI can be green while the separately consumed Unity DTO is stale, or while a caller points the optional check at the wrong checkout. Protocol confidence currently depends on an operator selecting the right second repository.

**Recommended change — EXTEND.** Emit a small contract manifest containing protocol/projection versions, schema identity, and generated C# SHA-256. Add a two-repository integration check that requires an explicit pinned Unity root, verifies `ProjectSettings/ProjectVersion.txt`, enforces output containment, records `git rev-parse HEAD` and dirty-state policy, requires the expected consumer SHA, and compares the manifest/hash. Keep the repository-local check for fast feedback.

**Tests/proofs required.** Correct-root pass, wrong-root fail, stale-C# fail, path-containment fail, and exact accepted/WIP hash capture in checkpoint evidence.

**Effort / change risk.** 0.5–1 day / Low–Medium.

**Dependency, collision, timing.** Add after P04A.1 seal so the WIP consumer is stable; make it a prerequisite for P05 contract changes.

### CF-15 — Living-lot tooling can chmod an arbitrary path and orphan the engine

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `scripts/living-lot-profile.mjs`: profile-directory validation, child spawn, readiness sequence, cleanup; `bridge/supervisor/lease.ts`: `ensurePrivateDirectory` |

**Concrete evidence.** The launcher accepts any absolute profile path (`scripts/living-lot-profile.mjs:46-48`), then creates and `chmod`s that path (`:55-56`) without verifying a dedicated marker, symlink resolution, home/root exclusion, or repository containment. It spawns the engine at `:58-67`, but the cleanup `try/finally` starts only around `:155`; readiness, session, and snapshot failures before then can orphan the child. Engine output is accumulated without a bound at `:69-83`. The production lease code already has a stronger private-directory seam in `bridge/supervisor/lease.ts:127-171`.

**Why it matters / consequence.** A typo or hostile symlink can change permissions on an unrelated directory. An early failure can leave a background process and growing log buffer, producing cross-run interference.

**Recommended change — REUSE.** Reuse/extract `ensurePrivateDirectory`; require a dedicated directory marker, reject filesystem root/home/repository roots after realpath, enter cleanup immediately after spawn, escalate bounded TERM-to-KILL, and cap retained stdout/stderr.

**Tests/proofs required.** Temporary-directory tests for symlink, home/root, pre-existing unmarked directory, permissions, early readiness failure, child termination, and log truncation using a fake child only.

**Effort / change risk.** 2–4 hours / Low–Medium.

**Dependency, collision, timing.** No Unity runtime collision. Do not run the real launcher for proof; test helpers with fake subprocesses.

### CF-17 — Casting projection rebuilds availability and script facts repeatedly

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `bridge/casting.ts`: `castingProjection`, `projectSnapshot`, `poolCandidates`, `requirePackageProject`, `greenlightConversion`, `greenlightQuoteSnapshot`; `src/core/castingReadModel.ts`: `currentAvailability`, `candidatePools`, `packageForProject`, `projectView`, `castingSessionsReadModel`; `src/core/castingPackageReadModel.ts`: `poolAvailability`, `buildCandidate`, `buildPool`, `castingPackageReadModel` |

**Concrete evidence.** `bridge/casting.ts:299-304` composes the two read models. In `src/core/castingReadModel.ts`, `currentAvailability` (`:134-151`) is called while constructing candidate/evidence views and again while filtering pools (`candidatePools`, `:240-263`); `packageForProject` calls `scriptProjectsReadModel` per project (`:281-288`), and `projectView` performs more package/capacity work (`:309-333`). `src/core/castingPackageReadModel.ts` implements a second availability calculation in `poolAvailability` (`:228-254`), builds each candidate at `:360-409` and each role pool at `:412-465`, then calls `scriptProjectsReadModel` again in `castingPackageReadModel` (`:538-547`).

**Why it matters / consequence.** Snapshot construction cost grows with projects × talent × pools while duplicated rules can drift. P05's richer production projection will make this seam more expensive and harder to reason about.

**Recommended change — REFACTOR.** Build a pure per-snapshot `CastingProjectionContext` containing script facts, normalized availability, package summaries, and stable-ID indexes. Pass it to existing output builders; do not retain it across revisions unless CF-07 supplies the owning revision context.

**Tests/proofs required.** Current JSON parity, shuffled-input determinism, multi-project fixtures, exact-ID joins, and operation-count tests showing facts are derived once per context.

**Effort / change risk.** 1–2 days / Medium.

**Dependency, collision, timing.** Coordinate with CF-07 and CF-19. Unity WIP changes `CastingWorkspace.cs`; keep the TypeScript output shape byte-compatible until seal.

### CF-18 — The production bridge depends on the 7,522-line browser adapter

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `bridge/session.ts`: `BridgeSession.snapshotFor`, `resolveAvailableIntents`, `authoritativeDigest`; `bridge/runtime-checkpoint.ts`: `exportSaveJson`; `bridge/development.ts`: `commissionScriptAction`, `developmentOfficeUplift`; `bridge/casting.ts`: `assessPackageFit`, `assessProfitRange`, `productionDemandView`, `startCastingSessionAction`; `ui/src/engine/adapter.ts`; `scripts/audit-studio-packaged.mjs`: `FIRST_PARTY_PREFIXES` |

**Concrete evidence.** `bridge/session.ts:4-41`, `bridge/runtime-checkpoint.ts:9`, and `bridge/development.ts:43-53` / `bridge/casting.ts:43-53` import authority/projection helpers through `ui/src/engine/adapter.ts`, which is 7,522 lines and also owns browser-facing adaptation. `scripts/audit-studio-packaged.mjs:1-4` describes a headless boundary but its allowlist at `:25` permits `ui/src`, so it cannot prove that the bridge bundle is browser-adapter independent.

**Why it matters / consequence.** Headless runtime ownership is obscured, bridge bundle reachability can expand when browser UI changes, and pure projection testing requires importing a UI aggregation module.

**Recommended change — REFACTOR.** Extract the exact bridge-used authority/application/projection functions into a headless module with no DOM imports; have the browser adapter re-export or consume that seam. Tighten the metafile audit to reject `ui/src` from the production bridge bundle.

**Tests/proofs required.** Browser and bridge snapshot byte parity, bundle metafile assertion with zero `ui/src` modules, typecheck/build, and current command behavior tests.

**Effort / change risk.** 2–3 days / High. This is a boundary move, not a rewrite.

**Dependency, collision, timing.** Existing P05 reconnaissance expects work near the adapter. Schedule as a standalone checkpoint only after P05 ownership/collision is clear; do not smuggle it into a feature branch.

### CF-20 — Re-quoting the oldest intent can immediately evict the fresh quote

| Field | Assessment |
|---|---|
| Severity / confidence | **P3 / High** |
| Classification | **D. FIX WHEN TOUCHING THIS AREA** |
| Repository / SHA | TypeScript / `b870a712758b7d1689b0cc4110c8fe64a0702234` |
| Exact file and symbol | `bridge/session.ts`: `opaqueIntentId`, `BridgeSession.quote`, `capPendingQuotes`, `quotedIntentFor`, `BridgeSession.command` |

**Concrete evidence.** `opaqueIntentId` is deterministic (`session.ts:265-270`). `BridgeSession.quote` inserts with `Map.set` (`:1387-1395`, `:1415-1423`), while `capPendingQuotes` deletes the first map key at the 16-entry cap (`:1324-1330`). `Map.set` on an existing key updates the value without refreshing insertion position. Existing repeated-quote tests prove the same request yields the same ID. In a bounded probe with 16 entries, re-quoting the oldest and then adding one new quote evicted the just-refreshed intent; `quotedIntentFor` returned `undefined` (`:1276-1279`), which `BridgeSession.command` converted to `INTENT_NOT_AVAILABLE` (`:1224-1236`).

**Why it matters / consequence.** A user can receive a fresh quote that is uncommittable immediately after another quote arrives. The behavior is deterministic but violates recency semantics.

**Recommended change — EXTEND.** Centralize insertion as `rememberPendingQuote`: delete an existing key before `set`, then evict from the front while over capacity.

**Tests/proofs required.** Exactly-16-entry test, oldest refresh, new insertion, successful refreshed commit, deterministic ID, and cap enforcement.

**Effort / change risk.** 30–60 minutes / Low.

**Dependency, collision, timing.** Local TypeScript change; fix with the next bridge-session touch or pull into a small quick-win checkpoint.

## 8. Unity runtime / presentation / input findings

### CF-01 — One Esc press can peel the system menu and inspection mode in the same frame

| Field | Assessment |
|---|---|
| Severity / confidence | **P1 / High** |
| Classification | **A. FIX BEFORE P04A.1 SEAL** |
| Repository / SHA | Unity WIP delta / `edff346781bb61a78a2097691993d494bff1fc19` against accepted `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs`: execution order and cancel path; `Assets/Studio/Runtime/Presentation/StudioCameraDirector.cs`: `Update` cancel handling; `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`: `Update` and menu cancel; `Assets/Studio/Tests/EditMode/StudioSystemMenuTests.cs`: cancel-order tests |
| Defect kind | **CURRENT WIP DEFECT**, not accepted-baseline debt |

**Concrete evidence.** WIP `StudioSystemMenuHud` has execution order `-200` and does not itself consume cancel in `Update` (`:38`, `114-143`). Accepted `StudioCameraDirector` runs at `-120` and consumes `Cancel` to exit inspection (`:11`, `206-214`). WIP `StudioSelectionManager` runs later and calls menu `TryConsumeCancel`, closing the menu (`:52-80`, `92-120`). The menu can be opened while inspecting (`StudioSystemMenuHud.cs:578-595`). Thus one physical press is visible to the camera director first and then the menu: inspection exits underneath and the menu closes. `StudioSystemMenuTests.cs:231-292` pins source order and invokes consumers in isolation; it does not exercise one ordered frame across both layers.

**Why it matters / consequence.** Esc violates the intended one-layer-per-press stack. The player returns two navigation levels instead of one, and a hidden underlying mode changes while a modal menu is visible.

**Recommended change — EXTEND.** The active lead should make `StudioCameraDirector` decline cancel whenever the system menu is open/owns Back. Keep the existing menu-first contract. After seal, consider a single input-layer arbiter only if more navigation layers arrive; do not broaden this checkpoint now.

```csharp
if (input.CancelPressed &&
    StudioSystemMenuHud.Instance != null &&
    StudioSystemMenuHud.Instance.Layer != StudioSystemMenuLayer.Closed)
    return;
if (input.CancelPressed || input.HomePressed)
    ExitInspection(input.HomePressed);
```

**Tests/proofs required.** A typed/behavior test that drives one ordered frame with inspection + open menu and proves only the menu closes; second press then exits inspection. The active lead must also retain the checkpoint's real-input packaged proof. Static source-order assertions alone are insufficient.

**Effort / change risk.** 1–3 hours / Medium. Input ownership is timing-sensitive.

**Dependency, collision, timing.** `StudioSelectionManager.cs`, `StudioSystemMenuHud.cs`, `StudioCameraDirector.cs`, and system-menu tests are active collision territory. Another agent must not edit them. Notify the P04A.1 lead and fix before seal.

### CF-10 — Presentation code has no typed test assembly boundary

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | Unity accepted baseline / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35`; WIP count observed separately at `edff346781bb61a78a2097691993d494bff1fc19` |
| Exact file and symbol | `Assets/Studio/Runtime/Presentation` assembly layout; `Assets/Studio/Tests/EditMode/Studio.Tests.EditMode.asmdef`; `Assets/Studio/Tests/EditMode/StudioCastingGreenlightTests.cs`; `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs`: `Configure`; `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs`: configuration call sites |

**Concrete evidence.** Presentation has no `.asmdef`; the EditMode test assembly references Data, Infrastructure, and Editor assemblies but cannot reference a presentation assembly that does not exist. `StudioCastingGreenlightTests.cs:20-27` therefore reaches the workspace through reflection. `StudioCastingWorkspace.cs:76-80` and `687-708` retain a nine-parameter `Configure` signature in part because reflection tests and host setup pin it; `StudioWorkspaceHost.cs:354-368` calls two large configure paths. Across accepted tests, 32 files contain 1,089 reflection references and 22 read source text 67 times. WIP rises to 35/1,257 and 24/73. CF-01 demonstrates the consequence: source-order tests passed while the composed input path remained wrong.

**Why it matters / consequence.** Tests verify spelling, visibility, or isolated calls rather than typed component contracts and frame-level behavior. Refactors become riskier while cross-component interaction defects can remain green.

**Recommended change — REFACTOR.** After P04A.1 seals, create a focused `Studio.Runtime.Presentation.asmdef`, reference it from EditMode tests, expose only necessary internals with `InternalsVisibleTo`, and replace large positional configuration methods with a typed dependency/context object. Migrate the highest-risk input/lifecycle tests first; do not mechanically rewrite all reflection in one pass.

**Tests/proofs required.** Unity compile and EditMode suite, direct typed tests for menu/selection/camera order, workspace enable/disable subscriptions, casting configure behavior, plus packaged smoke proof. Unity compilation was not run by this audit.

**Effort / change risk.** 1–2 days / Medium–High. Assembly boundaries can reveal latent dependency cycles and serialized type assumptions.

**Dependency, collision, timing.** Presentation and tests are active WIP files. Design now, implement only after seal, before P05 expands the same presentation surface.

### CF-11 — Pointer hover allocates a raycast hit array every frame

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | Unity accepted baseline / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs`: `Update`, `ResolvePick`, sight-line resolution |

**Concrete evidence.** `Update` performs pointer picking every frame (`StudioSelectionManager.cs:52-58`). `ResolvePick` calls allocating `Physics.RaycastAll`, then linearly resolves its results (`:193-220`). `SightLineBlocked` already uses non-allocating `Physics.Raycast` (`:222-230`). The allocating array is created even when only hover state is sought and scales with collider count.

**Why it matters / consequence.** Steady pointer movement or even stationary hover can create managed allocations, leading to avoidable GC spikes as the lot becomes denser in P05.

**Recommended change — REFACTOR.** Use a reusable `RaycastNonAlloc` buffer and deterministic linear selection that preserves the current Person-over-Place and occlusion laws. If the buffer saturates, use an explicit deterministic overflow path—an allocation only on saturation is safer than silently truncating. **REJECT** replacing this with a first-hit raycast; physics hit order does not encode product priority.

**Tests/proofs required.** Permuted-hit-order tests, Person/Place priority, occlusion, buffer saturation/fallback, and a profiler assertion of zero steady-state GC after warmup.

**Effort / change risk.** 0.5–1 day / Medium. Picking behavior is player-visible and must remain deterministic.

**Dependency, collision, timing.** `StudioSelectionManager.cs` is active WIP collision territory. Implement only post-seal as a measured standalone performance checkpoint; coordinate with P05 if it is already touching selection.

### CF-12 — Missing writer bodies trigger scene-wide searches from the per-frame path

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **B. FIX BEFORE P05 STARTS** |
| Repository / SHA | Unity accepted baseline / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Assets/Studio/Runtime/Presentation/StudioWriterPresencePresentation.cs`: `Update`, `ResolveBody`; `Assets/Studio/Runtime/Presentation/StudioBridgePresentation.cs`: person-slot/stable-ID lookup and snapshot event |

**Concrete evidence.** `StudioWriterPresencePresentation.Update` iterates projects every frame (`:52-79`). On cache miss, `ResolveBody` calls `FindObjectsByType` over the scene (`:112-127`), which allocates and scans; comments at `:86-87` acknowledge missing bodies as expected. `StudioBridgePresentation` already owns person slots and exposes exact stable-ID resolution (`:47-65`) plus snapshot application lifecycle.

**Why it matters / consequence.** A legitimate missing/unspawned writer makes the worst path persistent: every workspace/project/frame can rescan the scene. Larger casts amplify CPU and GC while the presentation remains unresolved.

**Recommended change — EXTEND.** Add an indexed body/transform resolver owned by `StudioBridgePresentation`, update it when bodies spawn/despawn or on `SnapshotApplied`, and let writer presence do only transform/billboard work per frame. Cache a negative resolution for the current presentation revision so missing bodies do not trigger repeated global searches.

**Tests/proofs required.** Query-count tests for missing bodies, late spawn/rebind, stale-body removal, exact-ID join, snapshot invalidation, and zero scene-wide searches in steady state.

**Effort / change risk.** 0.5–1 day / Medium.

**Dependency, collision, timing.** Coordinate with P05 body/stage/scenery work. No edits until P04A.1 seals because nearby presentation ownership is active.

### CF-13 — WIP capability ownership is three booleans plus a non-owning set

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | Unity WIP delta / `edff346781bb61a78a2097691993d494bff1fc19` against accepted `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`: local memo-owner booleans, registration setters, effective-capability branch; `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs`: per-frame capability reassertion |
| Defect kind | **GENERAL POST-SEAL MAINTENANCE DEBT introduced/expanded by WIP**, not a demonstrated current failure |

**Concrete evidence.** WIP `StudioBridgeClient` holds three local-owner booleans plus a `HashSet` (`:95-105`), exposes separate setters (`:194-242`), and branches over them when publishing system capabilities (`:1651-1684`). `StudioSystemMenuHud` reasserts its capability every frame (`:432-437`) and correctly clears its one-owner flag from both `OnDisable` and `OnDestroy` (`:406-428`). The set records capability names but not owner identity or reference count. Current code has one owner per capability, so this audit does not claim a present collision; it identifies the representation's next-owner failure mode.

**Why it matters / consequence.** The representation cannot model two simultaneous owners of one capability: a correct release by either owner would clear the other owner's claim. Current owners clean up their own flags, and no overlapping-owner failure was demonstrated, so this is not a P05 gate.

**Recommended change — REFACTOR.** Replace the booleans/setters with owner-scoped disposable claims, for example `Claim(ownerId, CapabilitySet): IDisposable`, backed by `capability -> owner IDs`. Effective capability remains present until the last owner releases. Use the same mechanism for intent and Save/Load capabilities.

**Tests/proofs required.** Two-owner overlap, partial release, final release, disabled/destroyed owner cleanup, reconnect fallback, and deterministic serialized capability order.

**Effort / change risk.** 0.5–1 day / Medium.

**Dependency, collision, timing.** `StudioBridgeClient.cs` and `StudioSystemMenuHud.cs` are active WIP files. **DO NOT TOUCH** until seal; land as standalone maintenance before introducing any second owner for an existing capability.

## 9. Test / proof / evidence findings

### CF-02 — P04A.1 evidence is not cryptographically or process-bound to the launched player

| Field | Assessment |
|---|---|
| Severity / confidence | **P1 / High** |
| Classification | **A. FIX BEFORE P04A.1 SEAL** |
| Repository / SHA | Unity WIP delta / `edff346781bb61a78a2097691993d494bff1fc19` against accepted `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Tools/p04a1-proof-launch.sh`: canonical proof launch/PID discovery; `Tools/p04a1-run-owner-input-proof.sh`: unfinished alternative launch/PID discovery/runtime configuration; `Tools/p04a1-proof-journey.mjs`: `windowInfo`; `Tools/p04a1-proof-menu-journeys.mjs`: `windowInfo`; `P04A1-OWNER-INPUT-REMEDY-RESUME.md`: proof status and next actions |
| Defect kind | **CURRENT WIP PROOF DEFECT**, not an accepted-runtime defect |

**Concrete evidence.** Both launchers start the app with `open -n` and then choose the newest globally matching process with `pgrep -n -f "Unity Visual Spike"` (`p04a1-proof-launch.sh:52-63`; `p04a1-run-owner-input-proof.sh:147-163`). That PID is not demonstrated to be the child created by this launch. The preferred passing journey chooses the largest title-matching window without PID (`p04a1-proof-journey.mjs:40-60`). The menu journey documents that a concurrent fullscreen instance caused exactly this collision and adds PID filtering (`p04a1-proof-menu-journeys.mjs:71-104`), but it cannot repair an already wrong `APP_PID`. The unfinished alternative runtime configuration samples current repository SHAs (`p04a1-run-owner-input-proof.sh:95-96`, `171-190`), not a build-time manifest or executable hash. The WIP handoff itself says earlier green runs used previous product bytes and must not support seal (`P04A1-OWNER-INPUT-REMEDY-RESUME.md:540-559`), while earlier sections still enumerate them as proven (`:161-175`); its older instructions also say Journeys C/D/E are unimplemented (`:513-520`) although later sections describe them.

**Why it matters / consequence.** A green report can drive or observe another player's window, or record current Git SHAs beside a binary built from older bytes. This is severe proof-integrity failure: the test may be real while its claimed subject is not.

**Recommended change — REFACTOR.** The active lead should mint a unique run ID before launch, capture the exact new process by comparing pre/post PID sets or a run-specific executable/argument identity, and require every chosen window's PID to match. Emit an immutable build manifest adjacent to the player with Unity SHA, TypeScript SHA, contract hash, tool versions, dirty flags, build UTC, and executable/bundle SHA-256. Copy that manifest into evidence and fail closed on absence or mismatch. Remove title-only fallback. Reconcile the handoff into one current status table so stale results cannot be read as current acceptance.

**Tests/proofs required.** Two concurrent matching player processes; delayed window creation; stale binary with current repository checkout; wrong manifest/hash; no matching PID; evidence-directory/run-ID uniqueness; final retained proof demonstrating PID, executable hash, and manifest equality.

**Effort / change risk.** 0.5–1.5 days / Low–Medium. Proof tooling changes require re-running all evidence they affect.

**Dependency, collision, timing.** All `Tools/p04a1-*` files and the handoff are active lead territory. Another agent must not edit them. Resolve before seal and discard/reclassify any evidence without the new binding.

### CF-06 — The WIP recording proxy writes the raw bridge capability to durable evidence

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | Unity WIP delta / `edff346781bb61a78a2097691993d494bff1fc19` against accepted `d0c42d7089a25eb496bcfc0e69433c3dc786bc35` |
| Exact file and symbol | `Tools/p04a1-recording-proxy.mjs`: response recording; `Tools/p04a1-proof-launch.sh`: evidence/runtime creation and lifecycle; `Tools/p04a1-run-owner-input-proof.sh`: evidence/runtime config and cleanup |
| Defect kind | **WIP TOOLING SECURITY/DURABILITY DEBT**, not production bridge behavior |

**Concrete evidence.** The proxy intentionally forwards the capability, then persists the literal `x-project-studio-capability` value in `wire-recording.jsonl` (`p04a1-recording-proxy.mjs:100-129`). The launchers protect the temporary runtime directory with mode 0700 but create `Evidence/S/...` without an explicit private mode (`p04a1-proof-launch.sh:22-25`; `p04a1-run-owner-input-proof.sh:98-103`). The canonical launcher has no general `trap` and leaves capability-bearing `proof.env`/`repro.env` behind (`p04a1-proof-launch.sh:66-80`). The unfinished alternative runner adds an exit trap (`p04a1-run-owner-input-proof.sh:105-110`) but also writes the raw capability into `runtime-config.json` (`:171-190`) and does not remove the runtime directory.

**Why it matters / consequence.** The capability is bearer-equivalent while its engine lives. Retained or broadly readable evidence unnecessarily exposes it; interrupted runs can leave credentials and processes behind. This is local proof tooling, so P2 is proportionate rather than a production P0.

**Recommended change — REMOVE / EXTEND.** Remove the raw header value from recordings; record only presence and, if correlation is necessary, a one-way run-local digest. Create evidence directories 0700 and files 0600, place capability-bearing configuration only in the private runtime directory, install cleanup before spawning, perform bounded TERM/KILL cleanup, and shred/unlink configuration on exit. Preserve request/response bodies only after a field-level sensitivity review.

**Tests/proofs required.** Static secret scanner over a synthetic evidence directory, file-mode assertions, signal/early-failure cleanup with fake processes, and proof that wire correlation still works without the raw token.

**Effort / change risk.** 0.5–2 hours / Low.

**Dependency, collision, timing.** Do not change active WIP proof tools behind the validating lead. Coordinate first. If the proxy will be used again for retained evidence, apply the narrow redaction/privacy change before that run; otherwise land immediately post-seal as standalone maintenance.

### CF-14 — Evidence runners duplicate private, inconsistent artifact durability logic

| Field | Assessment |
|---|---|
| Severity / confidence | **P2 / High** |
| Classification | **C. STANDALONE MAINTENANCE CHECKPOINT** |
| Repository / SHA | Unity accepted baseline / `d0c42d7089a25eb496bcfc0e69433c3dc786bc35`; WIP additions considered separately at `edff346781bb61a78a2097691993d494bff1fc19` |
| Exact file and symbol | `Assets/Studio/Runtime/Evidence/StudioRuntimeEvidenceReport.cs`: `StudioRuntimeCaptureArtifact`; `Assets/Studio/Runtime/Evidence/StudioRuntimeEvidenceBootstrap.cs`: capture/write path and `WriteReport`; `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`: `TryBuildArtifact`, `DurableCaptureArtifactsPassed`, `DurableArtifactMatches`; `Assets/Studio/Runtime/Presentation/StudioPlayerJourneyProofRunner.cs`: `WriteJsonAtomically`; WIP `Assets/Studio/Runtime/Presentation/UI/StudioUiElementRegistry.cs`: `Publish`, `Withdraw`, `Entries`; `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs`: `MaybeEmitElementMap` |

**Concrete evidence.** The shared runtime evidence artifact records path, dimensions, and bytes but no content hash (`StudioRuntimeEvidenceReport.cs:134-142`), and `StudioRuntimeEvidenceBootstrap.WriteReport` overwrites JSON directly (`:531-535`). In contrast, the Stage runner privately implements PNG validation, SHA-256, dimensions, durable reread, and artifact comparison (`StudioStageVisualProofRunner.cs:5368-5490`), while Player Journey has a separate private atomic JSON writer (`StudioPlayerJourneyProofRunner.cs:1646-1658`). WIP `StudioUiElementRegistry.Entries` supplies in-memory geometry (`:46-70`), and `StudioWorkspaceHost.MaybeEmitElementMap` serializes it with direct `File.WriteAllText` (`:159-215`) while external proof tools read concurrently. These are similar durability primitives with different guarantees.

**Why it matters / consequence.** A future Visual Oracle or ordinary proof consumer can accept a truncated report, stale screenshot, or report/artifact mismatch depending on which runner produced it. Fixes must be repeated across very large runners.

**Recommended change — EXTEND.** Add a small `Studio.Runtime.Evidence` utility boundary: immutable artifact descriptor with SHA-256/bytes/dimensions/media type; same-directory atomic JSON write; bounded read-after-write verification; and a manifest envelope with run/build/authority provenance. Migrate runners opportunistically. **DO NOT TOUCH** or genericize the Stage runner's domain-specific journey logic; reuse only its proven low-level artifact contract.

**Tests/proofs required.** Interrupted write, concurrent reader, tampered artifact, wrong dimensions/hash, stale pre-existing directory, schema-version mismatch, and successful migration of one small runner before Stage.

**Effort / change risk.** 1–2 days / Low–Medium.

**Dependency, collision, timing.** The WIP element-map path is active; define the shared seam after seal. This is the smallest enabling checkpoint for Visual Oracle V1.

## 10. Build / tooling / developer-experience findings

The build/tooling findings with actionable evidence are CF-02, CF-06, CF-09, CF-14, CF-15, and CF-18. Their implementation order matters more than adding a new general-purpose tooling layer:

| Concern | Current evidence | Action |
|---|---|---|
| Cross-repository generated contract | All three exact DTO copies match today, but the default check does not bind Unity | CF-09: retain the fast local check and add a pinned integration manifest/check. |
| Proof launch/provenance | PID is globally rediscovered; source SHAs are sampled after build | CF-02: bind process, window, manifest, and binary hash before accepting evidence. |
| Sensitive temporary state | Raw capability is retained; privacy/cleanup differs between launchers | CF-06: redact, set modes, and centralize bounded cleanup. |
| Profile launcher safety | Arbitrary absolute path can be chmodded; early child can escape cleanup | CF-15: reuse the private-directory lease seam and enter cleanup immediately. |
| Headless bundle boundary | Packaged audit allows imports through `ui/src` | CF-18: extract the exact headless seam, then tighten the existing audit. |
| Proof artifact writes | Hashing/atomicity exist privately and inconsistently | CF-14: one small evidence-primitive module, adopted incrementally. |

The TypeScript browser entry remains large (`ui/src/lot/StudioLotScreen.tsx` is 9,627 lines with 24 state hooks, 55 effects, 100 callbacks, and 52 refs) and `ui/src/engine/adapter.ts` is 7,522 lines. Size alone is not an actionable defect. CF-18 identifies the specific dependency boundary worth extracting; a general component-splitting campaign is deferred.

The isolated packaged build produced a Vite chunk-size warning. It is recorded but not promoted to a finding because this audit did not run or profile the browser product and current product authority is the packaged Unity path. Add a browser bundle budget only when that forward delivery role is settled and measured.

## 11. Performance findings

No runtime profiler was used, and no claim below depends on measured frame time. These are the five high-confidence risks whose loop/allocation shape is explicit in source:

| Finding | Hot-path evidence | Recommended bounded response |
|---|---|---|
| CF-07 | Every bridge poll recursively validates multiple times, canonicalizes/hashes twice, and projects the lot twice | One immutable per-poll build context; preserve fail-closed boundaries and measure before cross-poll caching. |
| CF-11 | Allocating `RaycastAll` in the per-frame pointer-hover path | Reusable non-alloc buffer with deterministic overflow handling. |
| CF-12 | Expected missing body causes `FindObjectsByType` from each per-frame writer path | Exact-ID body index plus revision-scoped negative cache. |
| CF-16 | Placement/workspace validation repeatedly scans ledger/history | Per-validation immutable accounting index. |
| CF-17 | Casting rebuilds availability, package, and script facts for several pools/views | Per-snapshot pure casting context. |

The audit rejects a DOTS campaign, global mutable caches, removal of validation, and speculative micro-optimization. Each accepted change has a count/parity/profiler proof that can show benefit without changing product law.

## 12. Security / durability findings

The strongest existing durability behavior should be preserved: schema/version gates, canonical serialization, fail-closed ID/intent checks, atomic checkpoint handling, and explicit capability-protected mutation routes. No evidence justified weakening them.

| Boundary | Finding/evidence | Durability rule |
|---|---|---|
| Save semantic integrity | CF-03 and CF-04 accept individually valid rows whose collection is contradictory | Validate cross-row/current-state invariants before accepting a save. |
| Post-action saveability | CF-05 allocator can collide with a valid reserved ID | Allocate against all occupied IDs and prove immediate round-trip. |
| Local proof capability | CF-06 persists the raw capability in durable JSONL | Never retain the bearer value; restrict directory/file modes and cleanup. |
| Profile filesystem | CF-15 accepts/chmods arbitrary absolute paths and follows normal path semantics | Resolve real paths, require a dedicated marker, refuse broad/sensitive roots. |
| Evidence provenance | CF-02/CF-14 permit stale, wrong-process, or partially written evidence | Bind run→PID→binary→manifest→artifact hashes and write atomically. |
| Bridge cache proposal | CF-07 could tempt a global snapshot cache | Key only to immutable authority revision/session epoch and invalidate fail-closed. |

No current-code evidence of journal replay widening, non-atomic production checkpoint replacement, symlink traversal in the production lease store, or capability leakage from production logs was found in the bounded inspection. That is not a penetration-test claim; it means no additional actionable finding met this audit's evidence bar.

## 13. P04A.1 WIP collision map

The exact accepted-to-WIP diff contains 31 files and `+8,035/-30` lines. Every row below is part of the bounded `d0c42d7..edff346` delta. “Avoid” means another implementation agent must not edit the file while the P04A.1 lead is validating it. `.meta` rows are listed explicitly because Unity GUID sidecars are independent tracked collision targets.

| File | Accepted-baseline responsibility | Current WIP responsibility / complexity added | Collision risk | Avoid now? | Post-seal cleanup/refactor candidate | Do not touch until seal? |
|---|---|---|---|---|---|---|
| `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs` | Bridge transport, snapshot/session lifecycle, authority capabilities | Adds `systemOwnerPresent` and cedes existing memo Save/Load buttons to the menu; +48/-13; overlaps CF-07/CF-13 | Very high | Yes | Owner-scoped capability claims (CF-13) | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioBridgeBootstrap.cs` | Runtime composition | Installs `StudioCastingAttentionPresentation` and `StudioSystemMenuHud`; +5 | High | Yes | Keep composition-only; revisit after typed presentation assembly | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioCameraInput.cs` | Camera input abstraction | Adds menu-rectangle/fullscreen pointer-hit blocking in `PointerOverUi`; +7 | High | Yes | Fold into one navigation-layer input ownership contract if needed | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioDevelopmentCardHud.cs` | Development card IMGUI presentation | Adds named handoff/navigation controls; +66 | High | Yes | Add symmetric `OnDisable` event/registry cleanup; retain the narrow handoff seam | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioDevelopmentPresentation.cs` | Development state presentation | Adds world-space `StudioCastingAttentionPresentation` pennant; +149 | High | Yes | Add disable/destroy cleanup for the owned child pennant | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioProductionRailHud.cs` | Production rail/project navigation | Adds locate-casting route and evidence naming; +135/-5 | High | Yes | Deduplicate focus/navigation request construction | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioSelectionManager.cs` | World selection, pointer picking, modal routing | Adds menu cancel suppression/interaction; +9; directly involved in CF-01 and future CF-11 | Critical | Yes | Fix CF-01 by active lead; non-alloc picking only post-seal | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioSystemMenuContracts.cs` | None | New menu state/action contracts; +162 | Critical | Yes | Separate pure state machine from platform actions if tests justify | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioSystemMenuContracts.cs.meta` | None | New Unity GUID sidecar | Critical | Yes | None unless source is moved after seal | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs` | None | New 758-line menu, discard confirmations, Save/Load/Quit, modal/capability ownership; CF-01/CF-13 | Critical | Yes | Split pure controller from rendering only after checkpoint proof | **Yes** |
| `Assets/Studio/Runtime/Presentation/StudioSystemMenuHud.cs.meta` | None | New Unity GUID sidecar | Critical | Yes | None unless source is moved after seal | **Yes** |
| `Assets/Studio/Runtime/Presentation/UI/StudioCastingWorkspace.cs` | Retained casting workspace and draft | Adds P04A.1 row controls, context/handoff behavior, proof names; +166/-10 | Critical | Yes | Typed configuration/context under CF-10 | **Yes** |
| `Assets/Studio/Runtime/Presentation/UI/StudioUiElementRegistry.cs` | None | New 72-line in-memory static geometry registry for external proof | Critical | Yes | Add owner-scoped lifecycle; disk durability remains host-owned | **Yes** |
| `Assets/Studio/Runtime/Presentation/UI/StudioUiElementRegistry.cs.meta` | None | New Unity GUID sidecar | Critical | Yes | None unless source is moved after seal | **Yes** |
| `Assets/Studio/Runtime/Presentation/UI/StudioWorkspaceHost.cs` | Workspace lifecycle/composition | Adds menu integration, element-map publication, casting handoff; +337/-2 | Critical | Yes | Consolidate lifecycle and typed dependencies under CF-10/CF-14 | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioCastingHandoffP04A1Tests.cs` | None | New 356-line handoff/source-reflection proof suite | High | Yes | Replace source pins with typed behavior tests under CF-10 | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioCastingHandoffP04A1Tests.cs.meta` | None | New Unity GUID sidecar | High | Yes | None | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs` | None | New 567-line P04A.1 workspace/reflection tests | High | Yes | Convert risk-bearing paths to typed tests under CF-10 | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioCastingWorkspaceP04A1Tests.cs.meta` | None | New Unity GUID sidecar | High | Yes | None | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioSystemMenuTests.cs` | None | New 669-line menu tests, including source-order pins that miss CF-01 | Critical | Yes | Add composed frame test, then reduce source-text assertions | **Yes** |
| `Assets/Studio/Tests/EditMode/StudioSystemMenuTests.cs.meta` | None | New Unity GUID sidecar | High | Yes | None | **Yes** |
| `Assets/Studio/UI/Resources/StudioCastingWorkspace.uss` | Casting workspace style/layout | Adds responsive controls/status styling; +171 | High | Yes | Tokenize repeated values only after visual seal | **Yes** |
| `P04A1-OWNER-INPUT-REMEDY-RESUME.md` | None | New 599-line operational/proof handoff; contains stale/current status tension in CF-02 | Critical | Yes | Collapse into one authoritative status/evidence manifest | **Yes** |
| `Tools/ownerinput/ownerinput.swift` | None | New 215-line macOS accessibility/window/input helper | Critical | Yes | Isolate deprecated API adaptation; retain OS boundary | **Yes** |
| `Tools/p04a1-drive-authority.mjs` | None | New 161-line authority setup helper | High | Yes | Reuse protocol client helper; keep checkpoint-specific flow | **Yes** |
| `Tools/p04a1-owner-input-proof.mjs` | None | New 1,405-line unfinished alternative named-element journey driver | Critical | Yes | Retain or remove only after an explicit parity decision | **Yes** |
| `Tools/p04a1-proof-journey.mjs` | None | New 608-line preferred passing A/B journey driver with title-only window choice (CF-02) | Critical | Yes | Retain checkpoint journey law; add exact process/build provenance | **Yes** |
| `Tools/p04a1-proof-launch.sh` | None | New 84-line launcher used by green runs; global PID discovery/no trap (CF-02/CF-06) | Critical | Yes | Add fail-fast exact PID/manifest binding and cleanup | **Yes** |
| `Tools/p04a1-proof-menu-journeys.mjs` | None | New 906-line menu journey driver; adds PID filtering but depends on launcher PID | Critical | Yes | Merge only after proof; avoid parallel runner drift | **Yes** |
| `Tools/p04a1-recording-proxy.mjs` | None | New 168-line wire recorder; persists raw capability (CF-06) | Critical | Yes | Redact and reuse a bounded recording primitive | **Yes** |
| `Tools/p04a1-run-owner-input-proof.sh` | None | New 200-line unfinished alternative wrapper; global PID and live-checkout provenance (CF-02) | Critical | Yes | Retain or remove only after an explicit parity decision | **Yes** |

The collision map distinguishes defects from debt:

- **Current WIP defects:** CF-01 (modal Esc double-peel) and CF-02 (proof subject/provenance ambiguity).
- **WIP security/durability debt:** CF-06; coordinate before reuse or land post-seal rather than silently changing current evidence.
- **General post-seal debt:** CF-10 and CF-13, plus the CF-11 change in a currently touched file. These do not invalidate the accepted baseline or current WIP by themselves.

The generated DTO is not in this WIP diff and is byte-identical across all three authorities. Even so, CF-08/CF-09 contract regeneration must wait until seal because `StudioBridgeClient.cs` is an active consumer collision.

## 14. Quick wins

These are ranked within the requested approximately 15-minute-to-4-hour range. A quick implementation is still a focused checkpoint with its listed proofs, not an invitation to mix unrelated fixes into P04A.1.

| Rank | Work | Effort | Finding / concrete outcome |
|---:|---|---:|---|
| 1 | Collision-safe authored-talent allocator | 1–2 h | CF-05; reuse the production-ID allocator pattern and prove immediate save round-trip. |
| 2 | Contract-set invariant pass | 2–4 h | CF-04; reject duplicate active ownership and inconsistent term/pay fields. |
| 3 | Safe living-lot profile and early cleanup | 2–4 h | CF-15; reuse private-directory checks and fake-child cleanup tests. |
| 4 | Refresh `Map` insertion order on re-quote | 30–60 min | CF-20; one helper plus exact cap/commit regression. |
| 5 | Pass one snapshot context through existing bridge helpers | 2–4 h | First tranche of CF-07; remove same-poll duplication before adding any cache. |
| 6 | Add symmetric disable cleanup for WIP handoff publishers | 1–3 h | Post-seal: withdraw `StudioDevelopmentCardHud` registry/listener state and destroy the Casting-attention pennant on disable. |
| 7 | Hoist persisted-production-ID extraction out of placement loops | 30–60 min | First tranche of CF-16; safe local reduction while preserving diagnostics. |
| 8 | Reconcile contradictory current/stale P04A.1 handoff sections | 15–30 min | CF-02; one unambiguous current status table, performed only by the active lead. |
| 9 | Correct the stale current-save comment in `ui/src/engine/adapter.ts:3462-3472` | 15–30 min | Documentation accuracy only; the live save boundary is V15. |
| 10 | Redact capability and set proof artifact modes/cleanup | 0.5–2 h | CF-06; coordinate with the active lead before another retained run. |

## 15. High-leverage maintenance candidates

| Rank | Candidate | Effort | Boundary and payoff |
|---:|---|---:|---|
| 1 | Typed Unity presentation/test assembly | 1–2 d | CF-10; replaces interaction-critical reflection/source pins with compiler-checked behavior seams. |
| 2 | Single bridge snapshot-build context and cheap authority head | 1–2 d | CF-07; removes same-poll duplication and makes metrics honest; add revision caching only after measurement. |
| 3 | Unity steady-frame query tranche | 1–2 d | CF-11 + CF-12; deterministic non-alloc picking and exact-ID body indexing remove two proven hot paths. |
| 4 | Shared evidence artifact/provenance primitives | 1–2 d | CF-14; atomic reports, hashes, and immutable manifests enable trustworthy future automation. |
| 5 | Placement accounting index | 0.5–1.5 d | CF-16; replaces repeated ledger/history walks without weakening validation. |
| 6 | Casting projection context | 1–2 d | CF-17; derives script/availability/package facts once and reduces rule drift. |
| 7 | Headless application/projection boundary | 2–3 d | CF-18; removes production bridge dependence on the browser adapter and makes bundle auditing meaningful. |
| 8 | Eliminate the two runtime import SCCs | 0.5–1 d | CF-19; restores dependency direction with small neutral domain/projection modules. |

## 16. Fix-before-P05 list

P04A.1 must first seal with CF-01 and CF-02 resolved by its active lead. Then complete these six items before P05 starts:

1. **CF-03:** enforce one coherent theatrical settlement row per production.
2. **CF-07:** pass one validated snapshot-build context through each poll and add a cheap authority head; preserve fail-closed validation and add cross-poll caching only after measurement.
3. **CF-08:** make union-to-C# generation fail on incompatible aggregate shapes.
4. **CF-09:** bind contract verification to the exact Unity consumer and manifest.
5. **CF-10:** establish the typed presentation/test assembly boundary.
6. **CF-12:** replace per-frame scene-wide writer-body lookup with an exact-ID index.

CF-04, CF-05, CF-06, CF-11, and CF-13–CF-19 remain worthwhile standalone work but are not prerequisites to begin P05. CF-18 in particular should wait until its known P05 adapter collision is clear.

## 17. Defer / reject list

At most eight tempting changes are deliberately excluded:

| Item | Classification | Judgment |
|---|---|---|
| Mechanically split `save.ts` by version | **E. DEFER / DO NOT FIX YET** | V1–V14 migrations are live compatibility law. Extract only proven neutral helpers while touching a specific invariant; a file-size campaign risks migration order. |
| Generalize or split `StudioStageVisualProofRunner` now | **E. DEFER / DO NOT FIX YET** | It is large but checkpoint-specific and unusually strong. Reuse its artifact primitives through CF-14; leave journey law sealed. |
| Broad UI Toolkit/IMGUI migration during P04A.1 | **E. DEFER / DO NOT FIX YET** | Coexistence is known and the retained workspace direction is settled. Finish the active input remedy before changing rendering architecture. |
| Act on Vite's generic chunk warning now | **E. DEFER / DO NOT FIX YET** | No browser runtime measurement or settled forward-delivery requirement supports a code change. Add a budget when that surface is product-critical. |
| Reimplement business/save validation in Unity | **F. REJECT** | It would duplicate TypeScript authority and create divergent truth. Unity should validate protocol shape/identity and present authority state. |
| Make checkpoint/journal writes asynchronous or write-behind for speed | **F. REJECT** | It weakens established fail-closed durability and creates partial-save ambiguity. Optimize derivation, not commit semantics. |
| Introduce a mutable global snapshot/projection cache | **F. REJECT** | It risks cross-session/revision leakage. CF-07 permits only immutable, explicitly invalidated revision-owned views. |
| Replace deterministic hit resolution with first-hit raycasts or loosen capability/ID checks | **F. REJECT** | Both simplify code by discarding correctness: physics order is not product priority, and fail-open protocol behavior is unacceptable. |

## 18. Visual Oracle V1 readiness

Current proof infrastructure is sufficient for a bounded pilot, not yet for unattended acceptance. Reuse the Stage visual runner's PNG decode, dimensions, SHA-256, durable reread, exact authority revision/digest, and anti-extra-post checks; reuse Player Journey's stale-directory guard and atomic JSON pattern; reuse the existing `Studio.Runtime.Evidence` assembly as the home for shared primitives. After P04A.1 seals, its named UI-element map and OS-input journey can provide interaction provenance without becoming the oracle itself.

Existing reports already carry viewport, timestamps, runtime/session IDs, revisions/digests, exact accepted intents, and artifact metadata in several runners. TypeScript governed artifacts also demonstrate SHA-bearing manifests. Missing pieces are one immutable build manifest, executable/bundle hash, run ID, exact PID/window binding, a common atomic report envelope, and uniform screenshot hashes.

The smallest implementation seam is CF-14: extend `Studio.Runtime.Evidence` with artifact/hash/atomic-manifest helpers, then make the proof launcher bind that manifest to the process as in CF-02. The dominant risk is stale or mismatched evidence that is internally valid but belongs to another binary, revision, viewport, or run. P05 remains the right pilot after those seams land because its bounded six-state/N-Stage proof and exact stable IDs provide strong comparison anchors; retain the checkpoint-specific Stage runner rather than building a general visual-testing platform first.

## 19. Recommended implementation order

1. The active P04A.1 lead alone resolves CF-01 and CF-02, then re-runs every affected static/real-input proof and seals. Coordinate CF-06 before any further retained wire recording.
2. Land the pre-P05 CF-03 theatrical-run invariant with versioned fixtures. CF-04 and CF-05 may follow in the same explicitly scoped save-integrity maintenance checkpoint, but they are not prerequisites for CF-03 or P05.
3. In a protocol/read-model checkpoint, add the CF-08 failing fixtures and generator fix, CF-09 real-consumer manifest check, and CF-07 single-build context/cheap authority head; measure before adding a revision cache.
4. In a post-seal Unity gate, create CF-10's typed presentation assembly and complete CF-12 through typed behavior tests.
5. Start P05 only after the Section 16 gates are green and collision ownership is explicit.
6. Treat CF-11 and CF-13 as separate post-seal maintenance: measure pointer allocation, and add owner-scoped claims before any actual second owner appears.
7. Schedule CF-14 as the enabling Visual Oracle maintenance seam; use P05 as the first bounded consumer.
8. Take CF-16, CF-17, CF-19, and finally CF-18 as separate measured maintenance tranches. CF-18 waits until P05's adapter work no longer collides.
9. Apply CF-15 and CF-20 whenever the relevant tooling/session area is next touched, or bundle only these genuinely independent quick wins into a narrowly reviewed maintenance checkpoint.

## 20. Builder handoff

### P04A.1 active lead

- Treat CF-01 and CF-02 as new pre-seal review items. They are source-supported current WIP defects; this audit made no edit to their files.
- Keep ownership of every file in Section 13. Other agents should avoid them until the lead publishes a sealed SHA.
- If wire evidence is captured again, coordinate the narrow CF-06 token-redaction/privacy change before retaining it.
- Do not accept old green directories for changed product bytes. Final evidence must name the exact run, PID/window, build manifest, binary hash, Unity SHA, TypeScript SHA, and contract hash.

### TypeScript maintenance builder

- Begin with failing regression fixtures for CF-03/04/05/20. Preserve deterministic ordering and error surfaces.
- For CF-07/16/17, use immutable operation contexts; never weaken entry-boundary validation or introduce cross-session mutable caches.
- For CF-08/09, regenerate once, inspect the complete generated diff, and prove both repository-local and exact Unity-consumer parity.
- Keep CF-18 standalone. The boundary is “headless authority/application projection,” not a rewrite of the browser adapter.

### Unity post-seal maintenance builder

- Establish CF-10's assembly/test boundary before larger presentation refactors so the compiler can guard them.
- Preserve current selection priority and occlusion law in CF-11. A non-alloc implementation is acceptable only with deterministic overflow behavior.
- Reuse `StudioBridgePresentation` exact-ID ownership for CF-12 rather than adding another scene registry.
- Model CF-13 capability claims by owner identity and lifetime, not additional booleans.

### Proof/evidence builder

- Implement CF-14 as a small library of low-level durability/provenance primitives. Do not absorb checkpoint journeys or product law.
- Pilot one small runner, then the P05 proof. Require an artifact hash and manifest/process binding before any oracle result can be called authoritative.

### Audit closure

This report changes documentation only. It does not alter TypeScript production code, Unity production code, schemas, generated contracts, tests, packages, builds in active repositories, or prior audit documents. Unity and the packaged player were never launched; no supervisor or bridge was started; no screen, mouse, keyboard, or Owner session was controlled.
