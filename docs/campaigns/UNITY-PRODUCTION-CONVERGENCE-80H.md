# Unity Production Convergence 80H Campaign Ledger

This file is the chronological source of campaign history. Read
`UNITY-PRODUCTION-CONVERGENCE-80H-HANDOFF.md` for the exact current state and
the next action.

## Campaign mandate

- Started: 2026-08-20
- Target duration: approximately 80 wall-clock hours
- TypeScript is the sole authoritative simulation engine.
- Unity is the production visual and interaction client.
- Three.js remains preserved as a working regression oracle, reference client,
  visual-design donor, and fallback.
- The engine bake-off is closed. This campaign must not reopen it.

## Frozen starting authorities

| Authority | Repository / branch | SHA | Verified 2026-08-20 |
| --- | --- | --- | --- |
| Current game | `/Users/bruce/The Movies - Visual Spike`, `visual-tycoon-conversion-spike` | `737bbe1f37586552a1dc55c4e82b614e57dfc2f2` | Local and remote match; worktree has pre-existing untracked screenshot directories |
| TypeScript adoption proof | `adoption/current-game-unity-gate-ts` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` | Local and remote match; authority worktree clean |
| Unity adoption proof | `adoption/current-game-unity-gate-client` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` | Local and remote match; authority worktree clean |
| Architecture decision | `docs/unity-production-client-decision` | `82c9486a6ce3a849d72c7f7f5258d6392cc3483a` | Local and remote match; direct child of TypeScript adoption proof |

The architecture decision adds only
`docs/UNITY-PRODUCTION-CLIENT-DECISION.md`. The campaign TypeScript branch was
created and first pushed from `f6606ac9`, then fast-forwarded to the exact
decision authority `82c9486a` so every replacement agent has the mandated boot
document.

## Campaign worktrees

| Side | Worktree | Branch | Starting SHA | Remote |
| --- | --- | --- | --- | --- |
| TypeScript | `/Users/bruce/The Movies - Unity Production Convergence 80H` | `campaign/unity-production-convergence-80h-ts` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` | `hspector-github` |
| Unity | `/Users/bruce/Project Studio - Unity Production Convergence 80H` | `campaign/unity-production-convergence-80h-client` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` | `origin` |

Both branches were pushed immediately on 2026-08-20. No protected branch was
rewritten, merged, rebased, or force-pushed.

## Phase status

| Phase | Status | Notes |
| --- | --- | --- |
| Campaign setup and baseline | Complete | Authorities verified, isolated branches pushed, full baseline built, played, captured, and measured |
| A - Productionize TypeScript to Unity contract | Active | A1 complete; A2 named projection decomposition is the current acceptance gate; A3 retains inherited command protections but still lacks structured remedies and durable replay identity |
| B - Durable local game runtime | Untouched | Current server is a fixed-port, manually launched, in-memory experiment |
| C - Unity client architecture | Untouched | Existing spike layers have been inventoried only |
| D - Full Movie journey in Unity | Partial at inherited baseline | Automated native Movie #2 path passes, but the interaction surface remains proof-oriented and does not yet provide the approved professional retained workspaces |
| E - Lot interaction / construction / management | Partial at inherited baseline | TypeScript construction intent and visible construction state pass; direct build placement interaction is not productionized in Unity |
| F - Hero Soundstage 7 | Partial at inherited baseline | Exterior and inspectable interior exist; interior is visually bare and lacks an operating production company |
| G - Characters and authored animation | Partial at inherited baseline | Provenance-cleared assets, Mecanim setup, 32 animators, and seven active people exist; quality and role activity are below target |
| H - Purposeful people / NavMesh | Partial at inherited baseline | Seven visible people are active on NavMesh; 25/50/100 stress gates are untouched |
| I - Camera / occlusion / inspection | Partial at inherited baseline | Tycoon camera and judging cameras exist; professional interaction QA is untouched |
| J - World / era / campus quality | Partial at inherited baseline | Campus scale reads; surroundings, density, hills, and 1948 specificity remain weak |
| K - Materials / lighting / VFX / audio | Partial at inherited baseline | URP presentation exists; prototype surfaces and sparse soundstage lighting dominate |
| L - Performance / scalability | Baseline only | M3 Max measurements captured; no 25/50/100 scalability campaign yet |
| M - Resilience | Partial at inherited baseline | Stale command and save/load pass; restart, outage, malformed schema, and missing-asset matrix is incomplete |
| N - Professional QA | Baseline only | Full TypeScript, Unity EditMode, native build, native Movie #2, and runtime capture gates established |

## 2026-08-20 - Checkpoint 0: branch creation and architecture boot

### Work completed

- Verified all four frozen authorities locally and against GitHub.
- Created and pushed `campaign/unity-production-convergence-80h-ts` from
  `f6606ac9db67dc70b12a7d247d74206571d12d2c`.
- Created and pushed `campaign/unity-production-convergence-80h-client` from
  `d970b81c2b17383ee71c3c66a5622ecc140473b3`.
- Fast-forwarded only the new TypeScript campaign branch to the immutable
  architecture-decision commit `82c9486a6ce3a849d72c7f7f5258d6392cc3483a`
  and pushed it.
- Preserved dirty historical worktrees without touching their unrelated
  untracked material.

### Decisions

- Campaign work happens only in the two new sibling worktrees.
- The architecture decision commit is part of the campaign branch because the
  boot protocol requires its document and it is an exact direct descendant of
  the requested TypeScript branch point.
- Existing Three.js code and authorities remain untouched.

## 2026-08-20 - Checkpoint 1: reproducible baseline

### TypeScript validation

Run from `/Users/bruce/The Movies - Unity Production Convergence 80H`:

| Gate | Result |
| --- | --- |
| `npm ci` | Passed; 200 packages installed. npm reports 6 dependency advisories: 3 moderate, 2 high, 1 critical. No forced audit mutation was attempted. |
| `npm test` | Passed: 324 files, 4,409 passed, 5 skipped, 0 failed, 64.78 seconds |
| `npm run typecheck` | Passed |
| `npm run typecheck:bridge` | Passed |
| `npm run build` | Passed in 6.31 seconds; Vite reports existing large-chunk warnings |
| `npm run test:bridge` | Passed: 8/8 in 10.93 seconds |
| `npm run proof:bridge` | Passed during audit; Movie #2 released at Week 22; canonical save bytes 251,936 |

Bridge schema at baseline:
`sha256:3cd9be425ab45f6ea75e257bd6011ea41b3571d5aaf6d7f83d7a8980922b411e`.

The bridge suite proves exact Movie #2 identity, same-title safety, stale/forged
identity rejection, session and revision protection, save/load, fresh-session
reconnect reconstruction, byte-identical bridge/headless saves, polling
neutrality, and failed-intent save neutrality.

### Unity validation

Run from `/Users/bruce/Project Studio - Unity Production Convergence 80H` with
Unity `6000.3.22f1`:

| Gate | Result |
| --- | --- |
| EditMode run 1 | Passed 11/11. Fresh Library import logged 24 transient glTFast bone-weight job-safety failures for shared character GLBs. |
| Native macOS build | Passed, `Build Finished, Result: Success`, 131 MB app on disk |
| Native Movie #2 proof | Passed; report status `complete`, exact Movie #2 released Week 22 at revision 23 |
| Save/load in native proof | Passed; saved and restored digest both `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Stale intent in native proof | Rejected with `STALE_REVISION`; authoritative digest and revision unchanged |
| EditMode run 2 | Passed 11/11 with zero repeated asset-import failures |
| Runtime console scan | No native proof or runtime-evidence error/exception lines |

The initial import upgraded `Assets/Settings/Mobile_RPAsset.asset` from URP asset
serialization version 12 to 13. The deterministic upgrade and an ignored local
`Evidence/` root were accepted in Unity commit
`75706567fa9895892a88310a494158069b70aeda` and pushed. This prevents a clean
campaign worktree from remaining dirty after the first editor run.

### Native Movie #2 evidence

- Report:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Unity-Bridge/bridge-client-proof.json`
- Screenshots:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Unity-Bridge/01-whole-lot.png`
  through `11-movie-2-released.png`
- Movie title: `The Reluctant Cornerstone`
- Screenplay ID: `script-0001`
- Production ID: `prod-0013`
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`
- Final snapshot payload: 18,498 bytes
- TypeScript serialization: 17.59 ms in the final sampled response
- Unity JSON parse: 0.21 ms
- Unity snapshot apply: 0.30 ms
- Command round trip: 24.71 ms
- Native proof average: 120.0 FPS

### Runtime performance baseline

Evidence:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/Baseline/Runtime/PerformanceCaptures/Unity/runtime-performance.json`.

Same-device reference: Apple M3 Max, 1920x1080 windowed, PC URP quality, 8-second
warmup, 10-second sample.

| Metric | Baseline |
| --- | ---: |
| Average FPS | 119.82 |
| Average frame time | 8.35 ms |
| Median frame time | 8.32 ms |
| p95 frame time | 9.06 ms |
| Maximum sampled frame | 28.71 ms |
| Average draw calls | 680.04 |
| Average batches | 359.80 |
| Average set-pass calls | 85.93 |
| Average rendered triangles | 168,041 |
| Active mesh triangles in scene | 4,407,650 |
| Process working set | 412,106,752 bytes |
| Visible people | 7 |
| Visible vehicles | 10 |
| Active NavMesh agents on mesh | 7/7 active; 7/32 total components |

The report warns that only 7 of 32 NavMeshAgent components were active on the
mesh. This matches the seven authoritative visible people at this snapshot, but
the future 25/50/100 stress gates must verify scaling behavior.

### Visual baseline critique

Inspected captures:

- `A-Whole-Lot.png`
- `B-Active-Stage.png`
- `C-Construction.png`
- `D-Human-Production-Close.png`
- Movie #2 whole-lot, construction, blocker, and release captures

Self-grade, 1 to 10:

| Criterion | Score | Evidence-based critique |
| --- | ---: | --- |
| The Movies identity | 5 | Studio campus, gates, stages, and departments read; the living filmmaking fantasy is weak |
| Professional tycoon readability | 5 | Campus organization and construction silhouette read; Movie controls remain a debug/proof panel |
| Campus scale | 6 | Multiple large stages, roads, gate, backlot, departments, and surrounding blocks establish scale |
| Era identity | 5 | Deco forms, signage, vehicles, palms, and palette suggest mid-century Hollywood; surroundings and wardrobe do not carry enough period specificity |
| Buildings | 5 | Exterior silhouettes are coherent but simple, clean, and materially flat |
| People | 2 | Seven people exist but are visually absent or tiny in key captures; no strong body/role readability |
| Animation | 3 | Mecanim/NavMesh motion exists, but authored production actions are not visible in the judging frames |
| Filmmaking activity | 2 | Active-stage capture shows a bare living-room set with no camera, boom, dolly, lights, grip gear, or crew |
| Materials / lighting | 4 | Readable stylized palette, but surfaces are flat and the stage interior is underlit and empty |
| Camera | 5 | Useful overview and judging cameras exist; production focus does not yet compose a convincing operating set |
| HUD / UI | 3 | Truth and next-step copy are explicit, but hierarchy is developer-oriented and occupies nearly half the world view |
| World density | 4 | Campus rhythm is credible; empty apron/interior/acreage and crude hills weaken commercial density |

Baseline verdict: functionally strong adoption proof, visibly pre-production.
Passing tests do not make the current Unity presentation commercially acceptable.

### Baseline architecture findings

- `bridge/protocol.ts` hashes a hand-curated field-name descriptor rather than a
  complete machine-readable schema with field types, requiredness, nullability,
  enums, and `additionalProperties` policy.
- Unity manually mirrors approximately 42 DTO classes across
  `StudioBridgeProtocol.cs` and `StudioLotSnapshot.cs`.
- Concrete drift exists: several root fields are not represented in Unity,
  `currentCommand` is omitted, and an unused Unity load-response DTO does not
  match the flattened TypeScript response.
- No deterministic generator, generated-file verification, or CI drift gate
  exists.
- The current snapshot is one Three.js-oriented monolith of roughly 18 to 21 KB.
- Command IDs, session IDs, expected revisions, stale rejection, exact opaque
  intent IDs, and a 256-entry response replay cache already work.
- The response replay cache silently evicts old command IDs, so sufficiently old
  IDs can eventually be reused.
- Rejections have codes and messages but no structured player remedy.
- Bridge save state is process memory only; restart loses session, revision,
  replay cache, and saved JSON.
- The bridge binds only to `127.0.0.1`, which is correct, but uses a fixed/manual
  port and lacks process lifecycle, graceful shutdown, port discovery, persisted
  logs, stale-process cleanup, and an integrated launcher.

### Known baseline warnings

- `npm ci` reports 6 dependency advisories. Do not run `npm audit fix --force`;
  assess direct reachability and upgrade impact deliberately.
- Vite emits existing bundle-size warnings above 500 KB.
- React tests emit pre-existing `act(...)` warnings and one expected jsdom canvas
  not-implemented warning while still passing.
- A first clean Unity Library import produced transient glTFast character-import
  job errors. A native build and a second 11/11 run were clean. Do not remove or
  replace provenance-cleared assets based only on that transient log.

## 2026-08-20 - Checkpoint 2: canonical generated bridge contract

### Player and architecture value

Phase A1 is complete. TypeScript now owns one complete Draft 2020-12 JSON Schema
for the Unity wire contract. The schema encodes exact object shapes, required and
optional properties, nullability, string vocabularies, numeric bounds, request
and response literals, protocol identity, and projection identity. Every DTO
object is closed with `additionalProperties: false`.

The schema is canonicalized with fixed ordinal key ordering and hashed with
SHA-256. Protocol remains `2`; the intentionally narrowed Unity presentation
projection is version `3`. Accepted schema identity:

`sha256:26a421b7e5e993828baf1ee8f077bc2dd917fff41f4a062847d3555d58cdbcd6`.

The authoritative simulation still produces the broader browser/Three.js lot
read model. A schema walker selects and validates only Unity-owned presentation
facts. This intentionally removes unused browser/economy fields rather than
perpetuating a giant accidental DTO. It changes no GameState, rule, formula,
identity, save, RNG stream, or Three.js behavior.

### Generated pipeline

- Authoritative source: `bridge/schema/bridge-schema.ts`.
- Deterministic schema artifact:
  `bridge/schema/project-studio-bridge.schema.json` (56,196 bytes).
- Deterministic C# golden artifact:
  `generated/unity/StudioBridgeDtos.Generated.cs` (120,976 bytes).
- Unity generated copy:
  `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs`.
- Both C# copies are byte-identical, SHA-256
  `a453df4b6dc1b9ac2d7b164273730cbf30b757280a9db4b93ca0c365911ab6bd`.
- `npm run generate:bridge-contract` writes artifacts.
- `npm run check:bridge-contract` fails without changing files when checked-in
  artifacts are missing or stale.
- Passing `--unity-project <path>` verifies the separate Unity repository copy
  in the same check.
- `npm run test:bridge` always runs the generated-artifact check first.
- `.github/workflows/bridge-contract.yml` runs generation drift, bridge
  typecheck, and bridge tests in CI.

### Strict Unity consumption

- Removed the handwritten live DTO mirror; handwritten files now retain only
  fixture wrappers, normalization, validation, and endpoint adapters.
- Added a direct official `com.unity.nuget.newtonsoft-json` `3.2.2` dependency.
- Unity preflights protocol, schema, and projection before DTO materialization.
- Raw JSON is checked against the embedded canonical schema, including closed
  shapes, missing fields, nested enums, literals, unions, bounds, and nullable
  arms.
- Duplicate properties, comments, trailing JSON, trailing commas, metadata
  shadows, and incompatible identities fail closed.
- Plain snapshots, accepted command/load responses, saves, and rejections use
  separate exact response DTOs. The former incorrect nested load DTO is gone;
  successful load remains the real flat accepted response.
- Nullable numerics preserve `null`, zero, and positive values across TypeScript
  and Unity (`slot`, `maxInstances`, set completion, theater timing/distance).
- The older broad offline fixture uses a deliberately lenient Json.NET resolver,
  preserving nullable values without pretending that fixture is a live v3 wire
  response.

### Validation

| Gate | Accepted A1 result |
| --- | --- |
| Generated cross-repository check | Passed; TypeScript golden and Unity copy byte-identical |
| Bridge typecheck | Passed |
| Bridge tests | 18/18 passed, including full Movie #2, schema drift, handshake shapes, canonical hash, exact response shapes, prototype-shadow unknown fields, and nullable-number arms |
| Full TypeScript tests | Final isolated seal passed 325 files, 4,419 tests, 5 skipped, 0 failed in 60.93 seconds |
| TypeScript production build | Passed; only inherited large-chunk warnings |
| Unity EditMode | 14/14 passed in `/tmp/studio-a1-editmode-results-4.xml` |
| Native macOS build | Passed: `Build Finished, Result: Success` |
| HTTP handshake | `/health`, `/session`, and `/contract` returned protocol 2/projection 3; SHA-256 of `contractJson` exactly matched `schemaId` |
| Native Movie #2 | Passed; exact `script-0001` / `prod-0013` released Week 22, revision 23 |
| Native save/load | Saved and restored digest both `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Native stale action | Rejected with `STALE_REVISION` |
| Runtime scan | No error, exception, protocol mismatch, or proof failure lines |

Final A1 proof evidence is local and intentionally ignored:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A1/Unity-Bridge/01-whole-lot.png`
  through `11-movie-2-released.png`
- `/tmp/studio-a1-native-proof-final.log`
- `/tmp/studio-a1-build-final.log`

Final native proof sample: 15,304-byte snapshot, 24.46 ms TypeScript
serialization, 4.78 ms strict Unity parse, 0.31 ms application, 33.13 ms command
round trip, and 118.80 average FPS. Strict parsing is measurably more expensive
than the baseline permissive `JsonUtility` parse; profile allocations and parse
cost during Phase L rather than weakening validation.

### Visual critique

A1 was deliberately load-bearing rather than visual. Inspected whole-lot and
Movie #2 release captures are visually unchanged from the accepted baseline:
campus scale and identity remain readable, while the proof HUD still dominates,
people and filmmaking activity remain weak, and Hero Soundstage 7 remains bare.
No visual score was inflated for architecture work.

### Decisions and residual risk

- Projection `3` is an explicit Unity presentation projection, not a claim that
  the entire browser snapshot is mirrored. Phase A2 will decompose it further
  without creating network/distributed complexity.
- Protocol stays `2` because commands and lifecycle semantics did not change.
- The separate-repository Unity artifact cannot be checked by the TypeScript CI
  runner without checking out that repository. The deterministic
  `--unity-project` gate is mandatory at cross-repository checkpoints; current
  bytes match. Never edit the generated C# by hand.
- Revisions are constrained to signed Int32 on this Unity contract. This is
  practically unreachable in the current local session but is a formally
  narrower numeric range than JavaScript safe integers; revisit only with an
  explicit protocol migration.

## Accepted commits

| Repository | SHA | Value |
| --- | --- | --- |
| TypeScript | `82c9486a6ce3a849d72c7f7f5258d6392cc3483a` | Exact architecture decision incorporated into campaign boot state |
| TypeScript | `9584cd247c13b7fdda007ce767351b683890c1a5` | Reproducible baseline and durable continuity checkpoint |
| Unity | `75706567fa9895892a88310a494158069b70aeda` | Clean-import URP serialization and ignored local evidence root |
| Unity | `7fb693c78da06cca1c8e688340241e1c9fa0b874` | Generated strict contract consumer, exact endpoint parsing, nullable fixture preservation, and adversarial EditMode coverage |

The TypeScript continuity-document checkpoint commit that contains this ledger
is the campaign branch tip after Checkpoint 1; resolve it with `git rev-parse
HEAD` because a Git commit cannot embed its own final SHA.

## Next acceptance gate

Phase A2: split projection `3` into named lot, productions, people,
construction, and journey/notices projections under one shared authoritative
revision/digest envelope. Preserve stable IDs, retain a local single-response
transport, regenerate C#, and update Unity projection caches without moving any
simulation truth into C#.
