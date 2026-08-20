# Unity Production Convergence 80H - Current Handoff

START HERE. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, then the campaign
ledger, this handoff, and the promotion register. The TypeScript/Unity engine
decision is settled. Do not restart planning from scratch.

## CURRENT EXACT STATE

Timestamp: 2026-08-20 22:10 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden implementation | `cd2b15872ac5849fa16beec1775543758cb3139e` |
| TypeScript donor checkpoint parent | A2 continuity tip `7eff21fccabe0ffb7a622b8b96b390b8543f15da` |
| TypeScript donor checkpoint | `f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2` |
| TypeScript donor CI correction | `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc` |
| TypeScript branch tip | The pushed continuity commit containing this file. Resolve with `git rev-parse HEAD`; a commit cannot embed its own resulting SHA. It must descend from `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`. |
| TypeScript pushed | Yes after the immediate checkpoint push; local, upstream, and remote campaign refs must match |
| TypeScript working tree | Expected clean after checkpoint commits/push; `node_modules/` and `dist/` are ignored |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity base/parent | A1 client `7fb693c78da06cca1c8e688340241e1c9fa0b874` |
| Unity pushed | Yes after the immediate checkpoint push; local, upstream, and remote campaign refs must match |
| Unity working tree | Expected clean; `Library/`, `Logs/`, `Builds/`, and `Evidence/` are ignored |

Compatible Golden pair: TypeScript
`cd2b15872ac5849fa16beec1775543758cb3139e` and Unity
`a1c27318bec47f1abc4a29b77d9c413bdc8a8778`, tagged
`golden/unity-convergence-m1` in each repository.
Protocol is `2`; projection is `4`; schema ID is
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.

Remote default/canonical audit:

- TypeScript remote default `main` is
  `5914c84e453461240540184e79b2bd7eafeb647f`, diverged from the campaign at
  `c0c9561` (3 default-only and 185 campaign-only commits before A2).
- Unity remote default `unity-typescript-bridge-spike` is
  `626c2d3a25f21ebdbb2603939378368af925f18c`, a linear campaign ancestor.
- M1 is not promoted to either default. Promoting Unity alone would break the
  schema-pinned pair; promoting TypeScript would be an uncontrolled mega-merge.

## CAMPAIGN STATUS

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A3 queue-law correction, command rejection remedies, and
  deduplication durability. The PR #5 donor review is complete.
- Completed phases: campaign setup/baseline and Phase A1 generated DTO/schema
  pipeline.
- Partially completed phases: A2 now has an atomic six-section projection
  foundation; detailed screenplay/development, casting, package/greenlight, and
  structured notice/remedy projections remain. A3 inherits command IDs,
  expected revisions, stale rejection, error codes, readable messages, and a
  bounded response replay cache. D, E, F, G, H, I, J, K, and M remain inherited
  partial capabilities.
- Baseline-only phases: L performance/scalability and N professional QA.
- Untouched campaign phases: B and C; no campaign implementation has begun in D
  through N beyond inherited adoption behavior.
- Current acceptance gate: restore the three authoritative queue-admissible
  front doors to the bridge intent surface under occupied capacity, proving the
  command is accepted into the existing TypeScript queue rather than suppressed
  or converted into a rejection.

## WHAT WAS JUST DONE

### Concise description

Reviewed PR #5 at donor tip `0edeb4ea874de3d792a112c3d714e5c71657c76d`
without merging or cherry-picking it. Harvested only current-architecture
governance and security value: five concise ADRs, a truthful TypeScript/Unity/
localhost-bridge security policy, least-privilege full TypeScript CI, scoped
Dependabot, explicit bridge-runner ownership, a safe transitive security patch,
and repository hygiene enforcement.

### Files and systems changed

TypeScript repository only:

- `docs/adr/`: lightweight append-only decision process plus accepted authority,
  determinism, forward-save, and compatible-pair promotion boundaries.
- `SECURITY.md`: current V14, Unity-client, Three.js-reference, and localhost HTTP
  threat model with the unfinished capability/Origin/Host/content-type boundary
  stated explicitly.
- `.github/workflows/bridge-contract.yml`: read-only permissions, non-persisted
  checkout credentials, pinned actions, concurrency/timeout, and full contract,
  typecheck, test, build, dependency, asset, and hygiene gates.
- `.github/dependabot.yml`: bounded weekly npm and Actions proposals against
  `main`, with no auto-merge. It is intentionally inactive until the config
  reaches the default branch.
- `scripts/audit-repository-hygiene.mjs` and `.gitignore`: generated-output,
  credential-path, private-key, GitHub/AWS/npm-token, and signing-material
  protection without a blanket asset-size gate.
- `package.json` / `package-lock.json`: `vite-node@2.1.9` is now an explicit
  bridge development dependency; `nanoid` moved from `3.3.16` to `3.3.18` using
  the current lock, not PR #5's stale dependency graph.

Unity: no file changed. The Golden client remains exact.

### Why

PR #5 predates V14, the Unity production-client decision, the generated bridge
contract, current dependencies, the README fix, and asset guardrails. Its
lockfile and raw CI gates would regress or fail the current product. The adopted
subset adds enforceable current-baseline safeguards without importing stale
browser-only assumptions, history rewriting, automatic branch deletion, hard
LOC limits, blanket 2 MB asset limits, or blanket presentation randomness bans.

### Relevant commits

- Frozen TypeScript adoption authority:
  `f6606ac9db67dc70b12a7d247d74206571d12d2c`.
- Frozen Unity adoption authority:
  `d970b81c2b17383ee71c3c66a5622ecc140473b3`.
- A1 TypeScript implementation:
  `a7ceb56bbac6c2ceb0be534a5753f086c5d51401`.
- A1 TypeScript continuity tip:
  `1b249f02b701f8e24a3334d1e3f087b917ad9c8e`.
- A1 Unity implementation:
  `7fb693c78da06cca1c8e688340241e1c9fa0b874`.
- A2 TypeScript implementation:
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- A2 Unity implementation:
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- PR #5 donor base (not adopted):
  `3ac66bbbe1f29ecac44c1632ba23952fad8fe61d`.
- PR #5 donor tip (reviewed, not merged/cherry-picked):
  `0edeb4ea874de3d792a112c3d714e5c71657c76d`.
- Donor-harvest checkpoint:
  `f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2`.
- Donor workflow portability correction:
  `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`.

No GameState, legality, economy, time, RNG, save migration, identity, outcome,
progression, construction, production, or Three.js rule changed.

## WHAT IS WORKING RIGHT NOW

### Launch commands

Start the localhost-only TypeScript authority:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
npm run bridge
```

Open the Unity editor:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build the current native client when ignored output is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a2-build.log \
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
  -studioBridgeProofRoot '/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge' \
  -logFile /tmp/studio-a2-native-proof.log
```

### Bridge and runtime status

- No bridge or native process is intentionally left running.
- Local bind: `127.0.0.1:4317`; override with
  `PROJECT_STUDIO_BRIDGE_PORT`, `PROJECT_STUDIO_BRIDGE_URL`, or
  `-studioBridgeUrl`.
- Protocol: `2`.
- Projection: `4`.
- Schema:
  `sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.
- One atomic response carries `lot`, `productions`, `people`, `construction`,
  `journeyNotices`, and `releaseResults`; root authority tokens and legal intents
  remain revision-consistent.
- Lifecycle remains two manual processes. Save/session/replay state is process
  memory only; Phase B is untouched.

### Current playable flow

The native client completes screenplay, review, auditions, audition evidence,
editable casting/greenlight, pre-production, named blockers, director call,
scenery load-in, shooting, save/load restore, post-production, release,
construction, and stale-revision proof entirely through TypeScript-published
legal intents.

### Current visual state

A2 intentionally did not change presentation. Inspection of whole-lot, blocker,
release, and reconnect captures confirms the same readable campus and explicit
truth as A1. The proof HUD still dominates, visible people/filmmaking activity
remain weak, materials are prototype-grade, and Hero Soundstage 7 remains sparse.
Do not claim a visual improvement for A2.

### Current Movie #2 status

- Native proof status: `complete`.
- Title: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale action: rejected with `STALE_REVISION`.
- Reconnect: second native process recovered the same session, revision, week,
  digest, and exact released Movie #2 while the authority remained live.

## VALIDATION STATE

| Gate | Latest accepted result |
| --- | --- |
| TypeScript full tests | 325 files; 4,421 passed, 5 skipped, 0 failed in 62.05 seconds |
| Typecheck | `npm run typecheck` passed |
| Production build | Passed in 5.49 seconds; inherited large-chunk warnings only |
| Bridge typecheck | Passed |
| Bridge tests | 20/20 passed |
| Browser dependency audit | `npm run audit:browser-deps` passed with 0 vulnerabilities |
| Full npm audit | 5 dev-graph advisories remain: 3 moderate, 1 high, 1 critical; bridge runtime is not yet a production graph |
| Repository hygiene | Passed over 1,004 tracked/unignored files, including built-in negative guard checks |
| Workflow/config | GitHub Actions `32411795447` passed every expanded gate in 8m50s at correction SHA `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`; prior run `32410749816` exposed and led to correction of the missing Pillow/NumPy runner prerequisite |
| Generated drift | Canonical JSON, TypeScript C# golden, and Unity C# copy passed; generated copies byte-identical |
| Generated C# | 124,814 bytes; SHA-256 `3805f4d54cba772d0670697d3d356b9c480c7a35d1bd4a295a63c5110e8ca004` |
| Unity EditMode | Final seal 15/15 passed; `/tmp/studio-a2-seal-editmode-results.xml` |
| Unity PlayMode | No dedicated suite exists; native automation is the runtime gate |
| Native build | Passed; `/tmp/studio-a2-build-2.log`; ignored 131 MB app |
| Runtime playthrough | Fresh native Movie #2 complete at Week 22 with 11 milestone screenshots |
| Save/load | Passed with exact restored digest |
| Reconnect | Passed from a separate native process; screenshot `12-reconnected.png` |
| Stale/duplicate commands | Native stale rejection passed; bridge duplicate replay test passed |
| Determinism | Export/import/export, reconnect, and headless/bridge save bytes matched |
| Runtime console | No proof failure, error, exception, or protocol mismatch lines |
| Native A2 sample | 119.40 FPS; 15,394-byte snapshot; 17.22 ms serialization; 3.81 ms parse; 0.29 ms apply; 33.01 ms RTT |
| Reconnect sample | 119.40 FPS; 3.50 ms parse; 3.89 ms complete application |
| Baseline performance | 119.82 FPS; 8.32 ms median; 9.06 ms p95; 680 draw calls; 168,041 rendered triangles; 412 MB working set |
| Screenshot/evidence root | `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/` |

Exact accepted local artifacts:

- `/tmp/studio-a2-full-tests.log`
- `/tmp/studio-a2-typecheck.log`
- `/tmp/studio-a2-ts-build.log`
- `/tmp/studio-a2-headless-proof.log`
- `/tmp/studio-a2-seal-bridge.log`
- `/tmp/studio-a2-seal-generated.log`
- `/tmp/studio-a2-seal-editmode-results.xml`
- `/tmp/studio-a2-build-2.log`
- `/tmp/studio-a2-native-proof-final.log`
- `/tmp/studio-a2-native-reconnect-final.log`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/bridge-reconnect-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/01-whole-lot.png`
  through `12-reconnected.png`.

## KNOWN PROBLEMS / BLOCKERS

### 1. Runtime lifecycle and persistence remain experimental

- Exact defect: fixed default port, two manual processes, memory-only
  session/save/replay cache, no launcher, restart persistence, stale-process
  cleanup, integrated logs, or graceful product shutdown.
- Severity: High for product lifecycle; the current developer proof works.
- Reproduction: save, terminate the bridge, restart; a fresh bootstrap session
  replaces prior in-memory truth.
- Origin: Pre-existing adoption boundary; Phase B untouched.
- Attempted fixes: A1/A2 added health/schema/session handshakes and proved client
  reconnect while the engine remains alive. Disk persistence was not fabricated.
- Must not be tried again: do not bind beyond localhost or expose arbitrary
  filesystem/command execution; do not pretend in-process JSON is persistence.

### 2. Phase A2 purpose coverage is incomplete

- Exact defect: six coarse sections now exist, but screenplay/development,
  casting, package/greenlight, release autopsy detail, and structured notice
  holder/remedy surfaces have not yet been decomposed to their final contracts.
- Severity: Medium maintainability/player-workspace gap; no current data loss.
- Reproduction: inspect `StudioProjectionBundle` definitions and compare them to
  the Phase A2 named surface list.
- Origin: Deliberately bounded A2 foundation, not a regression.
- Attempted fixes: release results are isolated rather than hidden in mutable
  production state; journey and notices remain grouped until truthful detail is
  projected.
- Must not be tried again: do not create independently polled routes or per-
  section revision clocks; do not route identity by title or array index.

### 3. Bridge queue-admission parity is wrong under capacity contention

- Exact defect: bridge intent resolution withholds commission, auditions, and
  greenlight when current capacity is occupied even though the authoritative
  core accepts those front doors into queues.
- Severity: High permanent product-law gap for affected states; ordinary Golden
  Movie #2 remains playable because it does not hit every contention state.
- Reproduction: compare `bridge/session.ts` intent predicates with
  `src/core/actions.ts` and `tests/c2a-m4-queue-admission.test.ts`.
- Origin: Pre-existing adoption/bridge behavior, discovered during A3 audit; not
  caused by the donor checkpoint.
- Attempted fixes: research and source/test parity audit only; no mutation yet.
- Must not be tried again: do not encode Development/Casting capacity as a
  rejection, choose an arbitrary holder from plural queue authority, or invent
  a Unity-side queue rule.

### 4. A3 remedy and replay durability remain incomplete

- Exact defect: rejections carry code/message but no structured holder/remedy;
  response replay evicts after 256 command identities and is memory-only.
- Severity: Medium resilience/player-legibility gap.
- Reproduction: inspect rejection schema and `BridgeSession` replay cache.
- Origin: Pre-existing adoption behavior.
- Attempted fixes: command/session IDs, expected revision, stale rejection,
  deterministic replay inside the cache, and explicit messages already pass.
- Must not be tried again: do not infer gameplay remedies in C# or weaken stale,
  duplicate, and digest invariants.

### 5. Cross-repository generated-copy CI is not automatic

- Exact defect: TypeScript CI validates its own C# golden but cannot see the
  separate Unity repository unless that repo is supplied.
- Severity: Medium future drift risk; current files are byte-identical.
- Reproduction: run `npm run check:bridge-contract` without `--unity-project`.
- Origin: Separate-repository topology.
- Attempted fixes: deterministic cross-repo check exists and was mandatory at
  this seal; Unity strict fixtures compile against the generated copy.
- Must not be tried again: never hand-edit generated C# or add another mirror.

### 6. Current visual production floor remains below target

- Exact defect: developer-oriented HUD, sparse operating set, weak role/person
  readability, prototype materials/lighting, and limited visible filmmaking.
- Severity: High player/visual gap; functional Movie #2 passes.
- Reproduction: inspect A2 whole-lot, blocker, and release captures.
- Origin: Pre-existing spike, intentionally unchanged by A1/A2.
- Attempted fixes: none in these architecture checkpoints.
- Must not be tried again: do not fabricate production activity or move
  simulation truth into Unity for visual expedience.

### 7. Canonical promotion is intentionally deferred

- Exact defect: TypeScript default and campaign histories diverge by a semantic
  mega-diff; Unity alone is incompatible with the default TypeScript schema.
- Severity: High release-management risk, no campaign runtime defect.
- Reproduction: compare campaign with TypeScript `main@5914c84` and Unity
  `unity-typescript-bridge-spike@626c2d3`.
- Origin: Historical repository topology.
- Attempted fixes: M1 pair is explicit and preserved with immutable Golden tags.
- Must not be tried again: do not fast-forward Unity alone, cherry-pick generated
  DTOs alone, force push, rebase, or mass-merge the TypeScript lineage.

### 8. Dependency and localhost security boundaries remain

- Exact defect: the browser runtime audit is clean, but the current development
  bridge runs through the dev graph, where full npm audit reports 3 moderate,
  1 high, and 1 critical advisory. The localhost HTTP bridge also lacks a
  per-launch capability, Host/Origin policy, exact JSON content-type gate, and
  request/header timeouts.
- Severity: High before packaged Phase B runtime; bounded for the current local
  developer proof.
- Reproduction: run `npm audit`; inspect `bridge/server.ts` request admission.
- Origin: Pre-existing dependency/runtime boundary. `nanoid` is now patched and
  `vite-node` ownership is explicit.
- Attempted fixes: documented the exact boundary, added a clean browser-runtime
  audit, hardened CI/repository hygiene, and rejected the breaking forced Vitest
  upgrade after it changed bridge execution, types, test discovery, and timeouts.
- Must not be tried again: no `npm audit fix --force`, false-green whole-product
  audit claim, public bind, persistent/logged capability token, or browser-only
  threat model.

No unresolved Owner-decision item blocks the next action.

## NEXT EXACT ACTION

Correct `bridge/session.ts` so authoritative queue-admissible commission,
audition, and greenlight front doors remain in `availableIntents` under occupied
capacity, then prove through bridge tests that each command is accepted into the
existing TypeScript queue without changing core queue rules.

## NEXT 3-5 ACTIONS AFTER THAT

1. Add TypeScript-owned structured rejection guidance only for real rejection
   categories, generate the Unity contract, and retain/render valid guidance
   across snapshot polls without inventing a capacity blocker or holder.
2. Replace the 256-entry memory-only replay eviction boundary with a bounded,
   save-associated command identity journal and prove duplicate commands remain
   deterministic across save/load and engine process restart.
3. Extract a start/stop-capable localhost runtime with ephemeral-port discovery,
   per-launch capability, Host/Origin/content-type enforcement, request/header
   timeouts, health/schema handshake, save-path abstraction, and useful logs.
4. Add engine restart detection/reconnect and prove disk-backed save recovery
   through a native Unity restart playthrough.
5. Refactor the winning client into explicit runtime/session, projection store,
   presentation, interaction, and UI layers without changing simulation truth.

## DO NOT TOUCH

- Frozen authorities `737bbe1f`, `f6606ac9`, `d970b81c`, and `82c9486a`.
- Existing Golden tag `golden/unity-convergence-m1`; never move or delete it.
- Remote defaults or historical/C2 branches during the next unit; promotion
  requires a deliberately validated compatible pair, not unilateral movement.
- TypeScript ownership of GameState, legality, economy, time, RNG, saves,
  migrations, identities, outcomes, production/construction rules, and
  progression truth.
- Three.js implementation/reference/fallback or its broader projection merely
  to make Unity DTOs easier.
- Permanent IDs, deterministic RNG streams, or Owner-set product laws.
- Provenance-cleared assets/license records without evidence; no protected
  commercial/Lionhead assets, unclear-license donors, purchases, or generated
  imagery.
- Generated C# files by hand. Change the TypeScript schema and regenerate.
- Offline `StudioOfflineLotSnapshot` semantics while changing the v4 live wire.
- Local ignored `Evidence/`, `Builds/`, `Library/`, `Logs/`, `node_modules/`,
  `dist/`, or `/tmp` artifacts as tracked source.
- Localhost-only security boundary.

## DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Keep protocol 2, bump projection to 4 | Command/lifecycle semantics did not change; the read contract did | Yes through an explicit future migration | v3 compatibility rejection and v4 live proof |
| Keep one atomic transport response | Independently polled sections could mix revisions and invent client truth | Yes if a future measured need justifies a transactional transport | stable-poll and atomic-store tests |
| Split into six required sections | Lot, production, people, construction, journey/notices, and results have distinct consumers; release results deserve a terminal surface | Yes with a projection bump | exact one-owner schema test and Unity consumers |
| Keep legal intents at the envelope root | They span multiple surfaces and must match the same authority revision | Yes with explicit contract migration | direct poll equality test |
| Build sections from the full source through closed schemas | Avoids a second hand-maintained mapping that could silently drop optional facts | Yes with equivalent generated projection | schema identity/parity and wire-path tests |
| Use an atomic stable-ID projection store in Unity | Prevents partial cache mutation and array-index identity bugs | Yes internally; invariants must remain | 15/15 EditMode suite and native proof |
| Permit freelancer presence outside employee roster | Authoritative audition slates can include non-employees | Yes only if TypeScript authority changes | live Movie #2 and targeted test |
| Separate offline and live roots | Frozen broad fixture is not a valid v4 bundle and must not become live truth | Yes with equivalent isolation | loader/client tests |
| Declare M1 Golden | A1+A2 is the best fully validated compatible playable pair with no P0 regression | No tag movement; later Goldens may supersede it | broad tests, native build/proof/reconnect, screenshots |
| Do not promote M1 to defaults | TypeScript promotion is a 185+ commit semantic merge and Unity-only promotion breaks compatibility | Yes after a deliberate merge candidate exists | remote/default/ancestry audit |
| Keep A2 marked partial | Detailed named screenplay/casting/package/remedy projections remain | Yes when those capabilities land | Phase A2 checklist audit |
| Reject wholesale PR #5 adoption | Its base, lockfile, V13/browser doctrine, CI gates, and branch policies predate or conflict with the current product | Irreversible only if merged; no donor commit was adopted | exact PR/base diff and three independent audits |
| Adopt five current ADRs without moving documentation | These are durable cross-cutting boundaries and add recovery value without duplicating feature records | Yes by a superseding ADR | current architecture/save/promotion authorities |
| Audit browser dependencies honestly and defer bridge graph closure | `npm audit --omit=dev` is green but cannot cover the dev-run `vite-node` bridge | Yes after Phase B packages an explicit graph | scoped audit plus full audit report |
| Declare `vite-node` directly and patch only `nanoid` | Package scripts already execute the runner; the transitive security patch is nonbreaking | Yes through a validated dependency change | clean `npm ci`, full gates, exact lock diff |
| Keep Golden M1 as CURRENT BEST | Governance improves durability but changes no player build or Unity client and lacks a new native visual/playable delta | Yes when a later full compatible pair earns Golden | unchanged Golden tags and broad donor checkpoint validation |
| Fix queue parity before rejection guidance | Capacity front doors are authoritative queue admissions, not command failures | Yes in ordering; product law is frozen | core actions and queue-admission tests versus bridge resolver |

## UNCOMMITTED / GENERATED MATERIAL

### TypeScript

- Golden A2 implementation remains
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- The donor checkpoint is a non-Golden TypeScript-only descendant committed at
  `f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2`, with its CI portability
  correction at `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`. Only this
  continuity-only follow-up is newer; after push no tracked WIP should remain.
- Checked-in generated material is intentional: canonical JSON Schema and the
  TypeScript-side C# golden.
- `node_modules/`, Vite `dist/`, and `.tmp/3d-asset-audit.json` were regenerated
  locally and remain ignored. No donor screenshot, native build, save, token,
  or audit JSON report is tracked.

### Unity

- Tracked A2 implementation is committed at
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`; expected clean.
- `Builds/macOS/Project Studio Visual Spike.app`: ignored, 131 MB.
- `Evidence/A2/Unity-Bridge/`: ignored, approximately 16 MB, 12 PNGs and 2 JSON
  reports.
- `Evidence/A1/` and `Evidence/Baseline/`: ignored prior evidence.
- `Library/` and `Logs/`: ignored Unity cache/logs.

### Machine-local evidence

- `/tmp/studio-a2-full-tests.log`
- `/tmp/studio-a2-typecheck.log`
- `/tmp/studio-a2-ts-build.log`
- `/tmp/studio-a2-headless-proof.log`
- `/tmp/studio-a2-seal-bridge.log`
- `/tmp/studio-a2-seal-generated.log`
- `/tmp/studio-a2-seal-editmode-results.xml`
- `/tmp/studio-a2-seal-editmode.log`
- `/tmp/studio-a2-build-2.log`
- `/tmp/studio-a2-native-proof-final.log`
- `/tmp/studio-a2-native-reconnect-final.log`
- Earlier `/tmp/studio-a2-*` attempts are superseded and deliberately excluded.

## RECOVERY INSTRUCTIONS

1. Read the architecture decision, ledger, this handoff, and the promotion
   register in that order.
2. Verify the exact compatible pair, branch tips, tags, and clean trees:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse hspector-github/campaign/unity-production-convergence-80h-ts
   git rev-parse golden/unity-convergence-m1

   cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse origin/campaign/unity-production-convergence-80h-client
   git rev-parse golden/unity-convergence-m1
   ```

3. Run the minimum M1 contract smoke:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm ci
   npm run audit:browser-deps
   npm run audit:repo-hygiene
   npm run test:bridge
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. If changing contract/client code, run Unity EditMode:

   ```bash
   '/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
     -batchmode \
     -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
     -runTests \
     -testPlatform EditMode \
     -testResults /tmp/studio-campaign-editmode-results.xml \
     -logFile /tmp/studio-campaign-editmode-tests.log
   ```

5. Start `npm run bridge`, then launch the ignored native app using the command
   above. Rebuild if absent. The current Golden must show protocol 2/projection
   4 and release exact Movie #2 at Week 22 with the recorded IDs/digest.
6. Perform NEXT EXACT ACTION. Do not repeat A1/A2 research, recreate a monolith,
   independently poll sections, manually mirror DTOs, reopen Unity versus
   Three.js, or ask the Owner to reconstruct history.

A replacement agent with no chat history can verify both HEADs/tags, launch the
best build, understand every accepted gate and known failure, and begin A3 using
only these repositories and documents.
