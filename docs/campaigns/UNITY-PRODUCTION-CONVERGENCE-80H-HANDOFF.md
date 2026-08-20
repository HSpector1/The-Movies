# Unity Production Convergence 80H - Current Handoff

START HERE. This file is the current-state authority. Read
`docs/UNITY-PRODUCTION-CLIENT-DECISION.md` first and the campaign ledger for
chronology. Do not restart planning or reopen the engine decision.

## CURRENT EXACT STATE

Timestamp: 2026-08-20 20:34 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript HEAD | `9584cd247c13b7fdda007ce767351b683890c1a5` before the accepted A1 checkpoint commit containing this update |
| TypeScript pushed | Baseline HEAD is pushed and equals `hspector-github/campaign/unity-production-convergence-80h-ts`; A1 source/docs are intentionally uncommitted until the checkpoint seal below |
| TypeScript working tree | Accepted A1 schema, generator, tests, CI, bridge integration, and continuity updates are the only intended changes; `node_modules/` is ignored |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD | `7fb693c78da06cca1c8e688340241e1c9fa0b874` |
| Unity pushed | Yes; local HEAD, upstream, and `git ls-remote` all match `7fb693c78da06cca1c8e688340241e1c9fa0b874` |
| Unity working tree | Clean; `Library/`, `Logs/`, `Builds/`, and `Evidence/` are ignored |

The final checkpoint will replace the two pre-commit HEAD descriptions above
with pushed SHAs. A Git commit cannot embed its own resulting SHA; for the final
TypeScript continuity commit, local `HEAD` and the remote campaign ref are the
exact branch-tip authorities.

## CAMPAIGN STATUS

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A2 projection decomposition is next.
- Completed phases: campaign setup/baseline and Phase A1 generated DTO/schema
  pipeline.
- Partially completed phases: A3 has inherited command IDs, deduplication,
  expected revision, stale rejection, explicit codes, and readable messages;
  inherited D, E, F, G, H, I, J, K, and M capabilities remain partial.
- Baseline-only phases: L performance/scalability and N professional QA.
- Untouched campaign phases: B and C; no new campaign implementation has begun
  in D through N.
- Current acceptance gate: decompose projection `3` into named purpose-specific
  projections with shared authoritative revision/digest and stable identity,
  while retaining a simple local transport and generated contract.

## WHAT WAS JUST DONE

### Concise description

Completed Phase A1 end to end. TypeScript now owns a complete canonical JSON
Schema, deterministically generates C# DTOs and embedded schema bytes, and fails
validation when generated artifacts drift. Unity consumes the generated DTOs,
strictly validates raw JSON before materialization, preserves nullable numeric
semantics, and fails loudly on unsupported protocol/schema/projection.

### Files and systems changed

- Added `bridge/schema/bridge-schema.ts`, schema DSL/runtime/canonical hashing,
  generated JSON Schema, documentation, and adversarial tests.
- Added deterministic `scripts/generate-bridge-contract.ts`, TypeScript C#
  golden output, npm generate/check commands, and bridge-contract CI.
- Updated bridge projection/requests/responses to schema-derived types;
  successful command and load responses are exact flat envelopes.
- Added typed `/health`, `/session`, and `/contract` handshake bodies. The
  contract route returns canonical `contractJson`; its SHA-256 equals `schemaId`.
- Replaced Unity handwritten live DTO declarations with generated partial DTOs.
- Added `StudioBridgeWireValidator`, exact endpoint parsers, compatibility
  preflight, generated normalizers, and accepted-response mapping.
- Added official Unity Newtonsoft JSON package `3.2.2` directly.
- Migrated the frozen offline fixture loader to an intentionally lenient Json.NET
  resolver so generated nullable fields retain `null`, zero, and positive values.
- Expanded Unity contract tests from the inherited gate to 14 total EditMode
  tests and TypeScript bridge tests to 18 total.

No GameState, gameplay formula, economy, legality, time, RNG, save migration,
identity, outcome, progression rule, or Three.js behavior changed.

### Why

The adoption proof manually mirrored approximately 42 C# DTO classes and hashed
only a field-name descriptor. It could silently ignore missing/unknown fields,
lose nullable values, and had an incorrect unused load DTO. This was a
load-bearing drift risk for every later Unity capability.

### Relevant commits

- Frozen TypeScript adoption authority:
  `f6606ac9db67dc70b12a7d247d74206571d12d2c`.
- Architecture authority:
  `82c9486a6ce3a849d72c7f7f5258d6392cc3483a`.
- TypeScript baseline checkpoint:
  `9584cd247c13b7fdda007ce767351b683890c1a5`.
- Frozen Unity adoption authority:
  `d970b81c2b17383ee71c3c66a5622ecc140473b3`.
- Unity clean-import baseline:
  `75706567fa9895892a88310a494158069b70aeda`.
- Unity A1 generated-contract consumer:
  `7fb693c78da06cca1c8e688340241e1c9fa0b874`.
- TypeScript A1 checkpoint: pending the immediate implementation/continuity
  commits; replace this line after push.

## WHAT IS WORKING RIGHT NOW

### Launch commands

Install TypeScript dependencies and start the localhost-only authority:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
npm run bridge
```

Open Unity:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build the current native client if ignored output is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a1-build.log \
  -quit
```

Launch after the bridge is live:

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
  -studioBridgeProofRoot '/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge' \
  -logFile /tmp/studio-a1-native-proof.log
```

### Bridge and runtime status

- No bridge or native process is intentionally left running.
- Local bind: `127.0.0.1:4317`; override port with
  `PROJECT_STUDIO_BRIDGE_PORT` and client URL with
  `PROJECT_STUDIO_BRIDGE_URL` or `-studioBridgeUrl`.
- Protocol: `2`.
- Projection/snapshot: `3`.
- Schema:
  `sha256:26a421b7e5e993828baf1ee8f077bc2dd917fff41f4a062847d3555d58cdbcd6`.
- Canonical `/contract` payload: 30,122 JSON characters; its measured SHA-256
  exactly equals the schema ID.
- Lifecycle remains two manually launched processes. Save/session/replay state
  remains process memory only; Phase B is untouched.

### Current playable flow

The native client completes screenplay, screenplay review, auditions, audition
evidence acknowledgement, casting/greenlight, pre-production, named blockers,
director call, scenery load-in, shooting, save/load restore, post-production,
release, construction, and stale-revision rejection entirely through
TypeScript-published legal intents.

### Current visual state

A1 intentionally did not change presentation. Inspected final whole-lot and
release captures still show a readable campus and explicit truth, but the proof
HUD dominates half the screen, people/film activity remain visually weak, and
Hero Soundstage 7 is sparse. Baseline visual scores remain authoritative; do not
claim a visual improvement for this checkpoint.

### Current Movie #2 status

- Proof status: `complete`.
- Title: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale action: rejected with `STALE_REVISION`.

## VALIDATION STATE

| Gate | Latest result |
| --- | --- |
| TypeScript full tests | Final isolated seal: 325 files passed, 4,419 passed, 5 skipped, 0 failed; 60.93 seconds |
| Typecheck | `npm run typecheck` passed |
| Production build | Passed in 4.00 seconds; inherited large-chunk warnings only |
| Bridge typecheck | Passed |
| Bridge tests | 18/18 passed |
| Generated drift | Passed for canonical JSON, TypeScript C# golden, and separate Unity C# copy |
| Unity EditMode | 14/14 passed; `/tmp/studio-a1-editmode-results-4.xml` |
| Unity PlayMode | No dedicated PlayMode suite exists |
| Native build | Passed; `Build Finished, Result: Success`; ignored 131 MB app |
| Runtime playthrough | Native Movie #2 complete at Week 22 with 11 milestone screenshots |
| Runtime console | No proof failure, error, exception, or protocol mismatch lines |
| A1 proof performance | 118.80 FPS average; 15,304-byte snapshot; 24.46 ms serialization; 4.78 ms strict parse; 0.31 ms apply; 33.13 ms command RTT |
| Baseline performance | 119.82 FPS, 8.32 ms median, 9.06 ms p95, 680 draw calls, 168,041 rendered triangles, 412 MB working set |
| Latest evidence | `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge/` |

Exact final A1 artifacts:

- `/tmp/studio-a1-editmode-results-4.xml`
- `/tmp/studio-a1-editmode-4.log`
- `/tmp/studio-a1-build-final.log`
- `/tmp/studio-a1-native-proof-final.log`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge/01-whole-lot.png`
  through `11-movie-2-released.png`

## KNOWN PROBLEMS / BLOCKERS

### 1. Cross-repository generated-copy CI is not automatic

- Exact defect: TypeScript CI verifies its deterministic C# golden, but cannot
  inspect the separate Unity repository unless that repository is supplied.
- Severity: Medium drift risk, not a current mismatch.
- Reproduction: `npm run check:bridge-contract` checks local artifacts only;
  add `-- --unity-project '<Unity path>'` to check both repositories.
- Origin: Separate-repository topology, not a regression.
- Attempted fix: deterministic cross-repository check exists and currently
  proves byte identity; Unity strict fixtures compile and run against that copy.
- Must not be tried again: never hand-edit generated C# or copy fields into a
  second handwritten mirror. Always run the cross-repository check at a seal.

### 2. Runtime lifecycle and persistence remain experimental

- Exact defect: fixed default port, two manual processes, memory-only
  session/save/replay cache, no launcher, restart persistence, stale-process
  cleanup, integrated logs, or graceful product shutdown.
- Severity: High for product lifecycle; current development proof works.
- Reproduction: save, terminate the bridge, restart; a fresh bootstrap session
  replaces the prior in-memory truth.
- Origin: Pre-existing adoption boundary; Phase B untouched.
- Attempted fix: none in A1.
- Must not be tried again: do not bind beyond localhost or expose arbitrary
  filesystem/command execution.

### 3. Projection is still one bundled response

- Exact defect: v3 deliberately narrows Unity facts but remains a single
  `StudioLotSnapshot` tree, so unrelated presentation systems share one DTO and
  one application path.
- Severity: Medium maintainability risk; current payload is small and correct.
- Reproduction: inspect `StudioLotSnapshotSchema` and Unity snapshot application.
- Origin: A1 intentionally stopped before A2.
- Attempted fix: browser-only fields removed and the projection versioned.
- Must not be tried again: do not introduce distributed services or duplicate
  gameplay rules while decomposing local read projections.

### 4. A3 remedies and replay durability are incomplete

- Exact defect: response replay cache evicts after 256 identities; rejections
  have a code/message but not a structured remedy/current-holder payload.
- Severity: Medium resilience/player-legibility gap.
- Origin: Pre-existing adoption proof.
- Attempted fix: exact IDs, session IDs, expected revision, stale rejection, and
  duplicate response replay already work.
- Must not be tried again: do not weaken stale or deduplication tests.

### 5. Current interaction and visual production floor remain below target

- Exact defect: proof HUD, sparse operating set, weak people/role readability,
  and prototype materials/lighting.
- Severity: High player/visual gap; functional Movie #2 gate passes.
- Origin: Pre-existing spike, unchanged by A1.
- Attempted fix: none in this architecture checkpoint.
- Must not be tried again: do not fabricate production activity or move legality
  into Unity for presentation speed.

### 6. Existing dependency/import warnings

- npm reports six inherited advisories and Vite large chunks; React/jsdom emits
  inherited warnings. First clean Unity import emitted transient glTFast errors,
  but subsequent EditMode runs and native builds are clean.
- Severity: Medium dependency/import audit, Low for A2.
- Must not be tried again: no `npm audit fix --force`; do not remove licensed
  character assets or upgrade glTFast without reproducible evidence.

## NEXT EXACT ACTION

Implement named `lot`, `productions`, `people`, `construction`, and
`journeyNotices` projection DTOs under one local snapshot response with one
shared `stateRevision`, `stateDigest`, and stable IDs; bump the projection
version, regenerate both C# artifacts, update Unity projection caches/application
to consume the named sections, then run bridge tests and Unity EditMode contract
tests. Do not add additional processes or duplicate simulation formulas.

## NEXT 3-5 ACTIONS AFTER THAT

1. Add A2 tests proving unchanged sections retain identity/revision semantics and
   projection polling remains save/RNG neutral.
2. Complete A3 structured rejection remedies/current-holder facts and make
   command replay identity durable beyond the 256-entry memory eviction window.
3. Extract a start/stop-capable localhost runtime with ephemeral-port discovery,
   health/schema handshake, persisted save path abstraction, and integration
   tests as the first Phase B unit.
4. Add engine restart detection/reconnect and prove save recovery through a
   native Unity restart playthrough.
5. Begin the professional Movie #2 retained workspaces only after A/B/C seams are
   stable, keeping the lot visible and TypeScript authoritative.

## DO NOT TOUCH

- Frozen authorities `737bbe1f`, `f6606ac9`, `d970b81c`, and `82c9486a`.
- `main`, C2 branches, protected branches, or history; never force push.
- TypeScript ownership of GameState, legality, economy, time, RNG, saves,
  migrations, identities, outcomes, production rules, and progression truth.
- Three.js implementation/reference/fallback or its broader snapshot merely to
  make Unity DTOs easier.
- Permanent IDs, deterministic RNG streams, or Owner-set product laws.
- Provenance-cleared assets/license records without evidence; no protected
  commercial/Lionhead assets, unclear-license donors, purchases, or generated
  imagery.
- Generated C# DTO files by hand. Change the TypeScript schema and regenerate.
- Local ignored `Evidence/`, `Builds/`, `Library/`, `Logs/`, `node_modules/`, or
  `/tmp` artifacts as if they were tracked source.
- The local-only security boundary.
- No unresolved Owner decision currently blocks A2.

## DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Keep protocol 2 and bump projection to 3 | Commands/lifecycle are unchanged; selected Unity read shape changed | Yes via explicit future protocol/projection migration | v2 command tests and v3 compatibility failures |
| Use one TypeScript schema as authority | Removes manual cross-language shape drift | Yes, but replacing it requires another deterministic authority | Canonical JSON/C# generation and tests |
| Narrow Unity projection intentionally | Unity did not consume broad economy/browser fields; copying them would perpetuate a monolith | Yes with a projection bump | Consumer audit and 15,304-byte live proof |
| Hash ordinal canonical JSON | Stable across formatting, insertion order, locale, and ICU | Yes only through a schema identity migration | Adversarial non-ASCII ordering/hash tests |
| Use official Newtonsoft package and validate JToken before DTOs | `JsonUtility` ignores unknown/missing fields and loses nullable values | Yes with equivalent proven parser | Unity strict negative corpus and native AOT proof |
| Keep endpoint response shapes exact | Plain snapshot and flat accepted command/load are not safe as one superset | Yes only with schema/projection migration | Separate parser tests and live save/load proof |
| Keep frozen fixture parsing lenient and isolated | Historical fixture is broader/older than live v3 but must preserve nullable facts | Yes | Loader assertions for slot/maxInstances/placed IDs/timing |
| Return canonical JSON string from `/contract` | Makes discovery response itself schema-valid without a self-referential object schema | Yes with protocol/schema identity change | HTTP SHA-256 handshake check |
| Keep evidence local/ignored | PNGs/builds/logs are generated and large; durable paths/results are in docs | Yes | `Evidence/A1` inventory |

## UNCOMMITTED / GENERATED MATERIAL

### TypeScript

- Before the immediate seal, all A1 source plus both continuity documents are
  intentionally uncommitted. After the checkpoint push, no tracked WIP should
  remain.
- `node_modules/` is ignored.
- Vite `dist/` is generated/ignored when present.
- Checked-in generated material is intentional source control material:
  canonical JSON Schema and the TypeScript-side C# golden.

### Unity

- Tracked worktree is clean at pushed A1 commit `7fb693c78da06cca1c8e688340241e1c9fa0b874`.
- `Builds/macOS/Project Studio Visual Spike.app`: ignored, 131 MB.
- `Evidence/A1/Unity-Bridge/`: ignored, approximately 14 MB, 11 PNGs plus JSON.
- `Evidence/Baseline/`: ignored baseline captures and measurements.
- `Library/` and `Logs/`: ignored Unity cache/logs.

### Machine-local evidence

- `/tmp/studio-a1-editmode-results-4.xml`
- `/tmp/studio-a1-editmode-4.log`
- `/tmp/studio-a1-build-final.log`
- `/tmp/studio-a1-native-proof-final.log`
- Earlier `/tmp/studio-a1-*` attempts are superseded and deliberately excluded.

## RECOVERY INSTRUCTIONS

1. Read the architecture decision, ledger, and this file in that order.
2. Verify both branches and remotes:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse hspector-github/campaign/unity-production-convergence-80h-ts

   cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse origin/campaign/unity-production-convergence-80h-client
   ```

3. Run the minimum A1 smoke:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm ci
   npm run test:bridge
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. If touching the contract/client, run Unity EditMode:

   ```bash
   '/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
     -batchmode \
     -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
     -runTests \
     -testPlatform EditMode \
     -testResults /tmp/studio-campaign-editmode-results.xml \
     -logFile /tmp/studio-campaign-editmode-tests.log
   ```

5. Start `npm run bridge`, then use the native launch command above. Rebuild if
   ignored output is absent. The current best proof must release Movie #2 at
   Week 22 with the exact IDs/digests recorded above.
6. Perform NEXT EXACT ACTION. Do not repeat A1 research, manually mirror DTOs,
   reopen Unity versus Three.js, or ask the Owner to reconstruct history.

A replacement agent can rebuild, validate, launch, understand the accepted and
deferred work, and begin A2 using only the two campaign branches plus this file.
