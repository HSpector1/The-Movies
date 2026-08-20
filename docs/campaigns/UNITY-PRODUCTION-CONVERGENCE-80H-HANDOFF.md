# Unity Production Convergence 80H - Current Handoff

START HERE. This file is the current-state authority. For chronological history,
read `UNITY-PRODUCTION-CONVERGENCE-80H.md`.

## CURRENT EXACT STATE

### Timestamp

2026-08-20 19:35 CEST (UTC+02:00).

### Repositories

| Side | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript implementation HEAD | `82c9486a6ce3a849d72c7f7f5258d6392cc3483a` before this continuity-only checkpoint |
| TypeScript branch tip | The pushed commit containing this file. Resolve exactly with `git rev-parse HEAD`; Git commits cannot embed their own resulting SHA. The implementation HEAD above must be an ancestor. |
| TypeScript pushed | Yes. `hspector-github/campaign/unity-production-convergence-80h-ts` matched `82c9486a` before staging this checkpoint and must match the local tip after the checkpoint push. |
| TypeScript working tree | Two new campaign continuity documents are staged/uncommitted while this handoff is being written; expected clean after checkpoint commit. `node_modules/` and `dist/` are ignored generated material. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD | `75706567fa9895892a88310a494158069b70aeda` |
| Unity pushed | Yes. Remote branch was explicitly verified at `75706567fa9895892a88310a494158069b70aeda`. |
| Unity working tree | Clean. `Library/`, `Logs/`, `Builds/`, and `Evidence/` are intentionally ignored local generated material. |

Do not treat the TypeScript implementation SHA and the continuity-only tip as a
discrepancy. Verify that the recorded implementation SHA is an ancestor and that
local `HEAD` equals the pushed campaign ref.

## CAMPAIGN STATUS

- Current phase: Phase A - productionize the TypeScript to Unity contract.
- Current subphase: A1 generated DTO/schema pipeline.
- Completed phases: campaign setup and reproducible baseline only.
- Partially completed inherited capabilities: D, E, F, G, H, I, J, K, M.
- Baseline-only phases: L and N.
- Untouched campaign phases: B and C; no new campaign implementation has begun
  in D through N.
- Current acceptance gate: a complete TypeScript-owned canonical protocol schema
  must deterministically generate Unity DTOs, schema identity, and a drift check;
  unsupported protocol/schema must continue to fail closed.

## WHAT WAS JUST DONE

### Concise description

Verified all frozen authorities, created and pushed isolated 80-hour campaign
branches, incorporated the exact architecture decision, established a full
TypeScript/Unity/native baseline, played Movie #2 through the native Unity
client, captured and inspected evidence, and stabilized clean Unity imports.

### Files and systems changed

- TypeScript campaign gained the exact existing
  `docs/UNITY-PRODUCTION-CLIENT-DECISION.md` via fast-forward to its immutable
  authority commit.
- Added this handoff and the chronological campaign ledger.
- Unity `Assets/Settings/Mobile_RPAsset.asset` was deterministically migrated by
  Unity 6/URP from serialization version 12 to 13.
- Unity `.gitignore` now excludes local `Evidence/` output.
- No gameplay formula, game rule, identity, RNG stream, save format, or Three.js
  implementation changed.

### Why

- The boot document must exist on the campaign branch.
- The baseline makes later improvements measurable and exposes real problems
  that cached adoption worktrees could hide.
- Persisting the URP migration prevents every clean worktree from becoming dirty
  on its first editor run.

### Relevant commits

- TypeScript adoption authority: `f6606ac9db67dc70b12a7d247d74206571d12d2c`
- Architecture decision / current implementation parent:
  `82c9486a6ce3a849d72c7f7f5258d6392cc3483a`
- Unity adoption authority: `d970b81c2b17383ee71c3c66a5622ecc140473b3`
- Unity clean-import checkpoint: `75706567fa9895892a88310a494158069b70aeda`

## WHAT IS WORKING RIGHT NOW

### Launch commands

TypeScript dependency setup:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
```

Start the current local-only bridge:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run bridge
```

Open the Unity project:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build the current native player if local ignored output is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-campaign-build.log \
  -quit
```

Launch the current native client after starting the bridge:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

Run the native Movie #2 proof:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike' \
  -screen-fullscreen 0 \
  -screen-width 1440 \
  -screen-height 900 \
  -studioBridgeAutoProof \
  -studioBridgeProofRoot '/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Unity-Bridge' \
  -logFile /tmp/studio-campaign-native-proof.log
```

### Bridge and runtime status

- No bridge or native player is intentionally left running at handoff.
- Bridge binds to `127.0.0.1:4317` only.
- Protocol version: 2.
- Snapshot version: 2.
- Schema:
  `sha256:3cd9be425ab45f6ea75e257bd6011ea41b3571d5aaf6d7f83d7a8980922b411e`.
- Current lifecycle still requires separate manual TypeScript and Unity launches.
- Bridge save/session/replay state is process memory only.
- Unity polls and reconnects, but a bridge process restart creates a fresh
  bootstrap session and loses the in-memory save.

### Current playable flow

The native automated proof completes:

screenplay -> screenplay review -> auditions -> audition evidence acknowledgement
-> selected package/greenlight -> pre-production -> named blockers -> director
call -> scenery load-in -> shooting -> save/load restore -> post-production ->
release.

It also starts construction, rejects a deliberately stale revision, preserves
exact screenplay/production IDs, and releases Movie #2 at Week 22.

The current ordinary interaction surface is still a proof HUD that exposes
TypeScript-published legal intents. Functionality is proven; the Phase D
professional player journey is not complete.

### Current visual state

- Whole-lot view establishes a coherent studio campus, repeated soundstages,
  departments, gate, roads, backlot, vehicles, palms, and surrounding blocks.
- Construction reads clearly as a timber/scaffold site.
- Hero-stage exterior reads as a soundstage.
- Hero-stage interior is bare, dark, materially flat, and lacks visible camera,
  dolly, boom, lights, grip/electric gear, cables, carts, and an active company.
- People exist and move, but only seven are visible and they are too small or
  absent in the judging frames to communicate roles.
- HUD is explicit about truth and next action but is visibly a developer/proof
  interface rather than a commercial tycoon UI.

### Current Movie #2 status

- Latest completed proof: status `complete`.
- Movie: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save and restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale intent: rejected with `STALE_REVISION` without truth mutation.

## VALIDATION STATE

| Gate | Latest result |
| --- | --- |
| TypeScript tests | `npm test`: 324 files passed; 4,409 tests passed; 5 skipped; 0 failed; 64.78 seconds |
| Typecheck | `npm run typecheck`: passed |
| Bridge typecheck | `npm run typecheck:bridge`: passed |
| Production build | `npm run build`: passed in 6.31 seconds; existing large-chunk warnings |
| Bridge tests | `npm run test:bridge`: 8/8 passed in 10.93 seconds |
| Save determinism | Bridge/headless save parity passed; 251,936 canonical bytes; export/import/export byte-identical |
| Unity EditMode | Second run 11/11 passed; zero repeated asset-import failures |
| Unity PlayMode | No dedicated PlayMode suite exists |
| Native build | Passed; 131 MB app at `Builds/macOS/Project Studio Visual Spike.app` |
| Runtime playthrough | Native Movie #2 proof complete at Week 22 with 11 milestone screenshots |
| Runtime console scan | No proof/evidence error or exception lines |
| Performance | 119.82 FPS average, 8.32 ms median, 9.06 ms p95, 680 average draw calls, 168,041 average rendered triangles, 412 MB working set |
| Latest screenshots | Unity bridge milestone set and four 1920x1080 runtime judging captures under local ignored `Evidence/Baseline/` |

Exact validation artifacts:

- `/tmp/studio-campaign-editmode-results-2.xml`
- `/tmp/studio-campaign-editmode-tests-2.log`
- `/tmp/studio-campaign-build.log`
- `/tmp/studio-campaign-native-proof.log`
- `/tmp/studio-campaign-runtime-evidence.log`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Unity-Bridge/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Runtime/PerformanceCaptures/Unity/runtime-performance.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Runtime/Screenshots/Unity-Runtime/`

## KNOWN PROBLEMS / BLOCKERS

### 1. Hand-maintained DTO drift

- Exact defect: TypeScript hashes an incomplete hand-authored descriptor while
  Unity manually mirrors about 42 DTO classes. Types, requiredness, nullability,
  enums, and outgoing payload conformance are not mechanically protected.
- Severity: High, load-bearing architecture blocker for Phase A.
- Reproduction: compare `bridge/protocol.ts` with Unity
  `StudioBridgeProtocol.cs` and `StudioLotSnapshot.cs`; note missing root fields,
  omitted `currentCommand`, and mismatched unused load DTO.
- Origin: Pre-existing adoption-proof limitation, not a campaign regression.
- Attempted fixes: None yet. Audit and exact implementation map completed.
- Must not be tried again: do not manually add another C# mirror field as the
  primary fix. Establish the generator and drift gate first.

### 2. Runtime lifecycle and persistence are experimental

- Exact defect: fixed/manual port, separate processes, in-memory save/session,
  no launcher, port discovery, graceful shutdown, restart persistence, stale
  process cleanup, or durable logs.
- Severity: High for product launch and resilience; current development proof
  remains usable.
- Reproduction: start bridge, save, stop bridge, restart; the new process has a
  new session and bootstrap truth and cannot load the prior in-memory save.
- Origin: Pre-existing adoption-proof boundary.
- Attempted fixes: None; reserved for Phase B after A1/A2/A3 foundation.
- Must not be tried again: do not expose the bridge beyond localhost and do not
  add arbitrary filesystem/command execution endpoints.

### 3. Current Unity interaction is a proof HUD

- Exact defect: legal intents are presented as a large debug-like panel; complex
  choices are partly preselected by TypeScript proof logic and are not editable
  through professional retained workspaces.
- Severity: High player-experience gap; Movie #2 automated acceptance passes.
- Reproduction: launch the native client against the bridge and inspect the left
  half of the screen during any Movie #2 stage.
- Origin: Pre-existing adoption proof, not a regression.
- Attempted fixes: None in campaign yet.
- Must not be tried again: do not duplicate selection legality or production
  formulas in Unity to accelerate UI work.

### 4. Hero stage lacks a visible production company

- Exact defect: active-stage and close captures show a bare living-room set with
  no crew or filmmaking equipment; lighting and materials are prototype-grade.
- Severity: High visual gap and direct Phase F acceptance failure.
- Reproduction: inspect `B-Active-Stage.png` and
  `D-Human-Production-Close.png` in baseline evidence.
- Origin: Pre-existing visual spike limitation.
- Attempted fixes: None in campaign yet.
- Must not be tried again: do not fabricate production activity when TypeScript
  reports no active production.

### 5. First clean Unity import emitted transient glTFast errors

- Exact defect: 24 shared character GLBs logged a glTFast
  `SortAndNormalizeBoneWeightsJob` safety exception during the first fresh
  Library import.
- Severity: Medium reproducibility warning. Native build succeeded and the second
  11/11 test run repeated zero import failures.
- Reproduction: occurred only on the first import in this fresh worktree; not yet
  deterministically reproduced.
- Origin: Pre-existing package/cache behavior, not a campaign code regression.
- Attempted fixes: allowed first import to settle, built natively, reran tests;
  second run clean. Persisted the unrelated deterministic URP asset migration.
- Must not be tried again: do not delete, re-export, or replace the
  provenance-cleared GLBs solely because of the transient first-pass log. Do not
  upgrade glTFast without an isolated, evidence-backed package decision.

### 6. Dependency and bundle warnings

- Exact defect: npm reports 6 advisories; Vite reports several chunks above 500
  KB; React/jsdom tests emit pre-existing warnings.
- Severity: Medium for dependency audit, Low for current bridge work.
- Origin: Pre-existing.
- Attempted fixes: None; validation remains green.
- Must not be tried again: do not run `npm audit fix --force` or weaken warnings
  and tests just to make reports quieter.

## NEXT EXACT ACTION

Implement a complete TypeScript-owned canonical bridge schema and deterministic
C# DTO generator/check gate. The schema must encode exact types, required and
optional fields, nullability, enums, and additional-properties policy; compute
`SCHEMA_ID` from canonical schema bytes; generate Unity DTOs deterministically;
and make `npm` validation fail when generated C# is stale. Keep handwritten
Unity compatibility and normalization helpers outside the generated file. Then
run `npm run test:bridge`, `npm run typecheck:bridge`, and Unity EditMode protocol
tests.

## NEXT 3-5 ACTIONS AFTER THAT

1. Replace the handwritten Unity DTO declarations with generated output while
   preserving the existing client/public API and strict protocol/schema failure.
2. Add emitted-fixture schema validation and Unity tests for requiredness,
   nullability, enum drift, unknown fields, and unsupported protocol/schema.
3. Decompose the monolithic snapshot into named purpose-specific projections
   sharing authoritative revision, digest, and stable identities.
4. Add structured rejection remedies and make command ID deduplication durable
   beyond the current 256-response eviction window.
5. Extract a start/stop-capable localhost HTTP service with ephemeral-port
   integration tests as the first Phase B runtime seam.

## DO NOT TOUCH

- Frozen TypeScript authority `737bbe1f`, adoption authority `f6606ac9`, Unity
  adoption authority `d970b81c`, or architecture authority `82c9486a`.
- `main`, C2 branches, protected branches, or any history. Never force push.
- TypeScript ownership of GameState, rules, legality, economy, time, RNG, saves,
  migrations, identities, outcomes, and progression truth.
- Three.js implementation, reference behavior, or fallback capability.
- Permanent IDs and deterministic RNG streams.
- Owner-set product laws, especially lot primacy, 1920 start, visible builders,
  real-time pause/1x/2x/4x, queue-not-forbid, physical-capacity concurrency,
  Movie Quality != Success, and marketing never changing quality.
- Provenance-cleared assets or license records without an evidence-backed need.
- Protected/restricted `wintersets`, unclear-license interior props, GPL donor
  code, commercial-game assets, Lionhead assets, or generated imagery.
- Local baseline `Evidence/`, `Builds/`, `Library/`, and `/tmp` logs are isolated
  generated material; do not mistake them for tracked source.
- Unresolved future Owner decisions must remain documented and reversible; none
  currently blocks A1.

## DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Evidence |
| --- | --- | --- | --- |
| Use new sibling worktrees and requested campaign branches | Protect frozen authorities and unrelated dirty worktrees | Yes; campaign branches can be abandoned without rewriting history | Local/remote SHA verification |
| Fast-forward campaign TypeScript branch to exact architecture decision after initial push | Boot procedure requires the decision document; commit is direct child adding only that file | Yes on campaign branch, without touching authority | `git show 82c9486a` topology |
| Make full DTO/schema generation the first engineering unit | It is the approved production follow-up and all later projection/runtime work depends on a trustworthy contract | Yes, provided generated output remains deterministic | Bridge/Unity audit found concrete drift |
| Accept URP asset serialization migration | Fresh worktree wrote it deterministically and build/tests pass; leaving it uncommitted dirties every clean import | Yes through an ordinary future commit if package evidence changes | Unity commit `7570656`; clean second import |
| Keep baseline evidence local and ignored | Captures/builds/logs are large generated artifacts; paths and measurements are durably recorded in docs | Yes; selected artifacts can later be adopted with Git LFS | `.gitignore`, evidence inventory |
| Treat first-pass glTFast failures as a warning, not an asset rollback | Native build and second import/test run are clean | Yes; investigate if reproducible | First and second Unity logs |

## UNCOMMITTED / GENERATED MATERIAL

### TypeScript worktree

- `node_modules/`: ignored, generated by `npm ci`.
- `dist/`: ignored production web build output.
- At the moment this file was authored, both campaign documents are the only
  intended uncommitted tracked material. They must be committed and pushed as
  the baseline checkpoint before implementation continues.

### Unity worktree

- `Library/`: ignored Unity cache, approximately 1.8 GB after import.
- `Logs/`: ignored Unity editor logs.
- `Builds/macOS/Project Studio Visual Spike.app`: ignored native build,
  approximately 131 MB.
- `Evidence/Baseline/Unity-Bridge/`: ignored, 11 PNG screenshots plus
  `bridge-client-proof.json`, approximately 14 MB.
- `Evidence/Baseline/Runtime/`: ignored, four 1920x1080 PNG screenshots plus
  `runtime-performance.json`.
- No uncommitted tracked Unity source is expected.

### Machine-local logs and results

- `/tmp/studio-campaign-editmode-results.xml`
- `/tmp/studio-campaign-editmode-tests.log`
- `/tmp/studio-campaign-editmode-results-2.xml`
- `/tmp/studio-campaign-editmode-tests-2.log`
- `/tmp/studio-campaign-build.log`
- `/tmp/studio-campaign-native-proof.log`
- `/tmp/studio-campaign-runtime-evidence.log`

These artifacts are deliberately excluded from Git. The exact result summaries
and durable local paths are recorded above.

## RECOVERY INSTRUCTIONS

1. Read, in order:
   `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`,
   `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H.md`, and this file.
2. Verify TypeScript state:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse hspector-github/campaign/unity-production-convergence-80h-ts
   git merge-base --is-ancestor 82c9486a6ce3a849d72c7f7f5258d6392cc3483a HEAD
   ```

3. Verify Unity state:

   ```bash
   cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse origin/campaign/unity-production-convergence-80h-client
   ```

   Expected Unity SHA:
   `75706567fa9895892a88310a494158069b70aeda`.

4. Run only the minimum smoke before continuing:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm ci
   npm run test:bridge
   npm run typecheck:bridge
   ```

5. If changing Unity DTOs, run:

   ```bash
   '/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
     -batchmode \
     -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
     -runTests \
     -testPlatform EditMode \
     -testResults /tmp/studio-campaign-editmode-results.xml \
     -logFile /tmp/studio-campaign-editmode-tests.log
   ```

6. Use the launch/build commands above to run the current best client. If the
   ignored native build is missing, rebuild it; do not copy an authority
   worktree's Library or mutate an authority branch.
7. Perform the NEXT EXACT ACTION. Do not restart planning, reopen Unity versus
   Three.js, or repeat baseline research.

A replacement agent can recover the functional state from the two pushed
branches. Local evidence improves visual review but is not required to rebuild,
test, launch, or continue A1.

