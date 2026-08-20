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
| TypeScript | `a7ceb56bbac6c2ceb0be534a5753f086c5d51401` | Canonical schema, deterministic C# generation/drift gate, schema-derived bridge projection, and adversarial contract coverage |
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

## 2026-08-20 - Checkpoint 3: atomic named projection bundle

### Player and architecture value

Phase A2's decomposition foundation is accepted. The localhost bridge still
delivers one authoritative snapshot transaction, but projection `4` replaces
the monolithic live `StudioLotSnapshot` with six required, closed sections:

- `lot`: studio identity, week, scene seed, buildings, property, stages, sets;
- `productions`: active productions and operations;
- `people`: roster and optional authoritative presence;
- `construction`: placement, parcels, catalog, and placed facilities;
- `journeyNotices`: first-film journey plus optional week-theater notices;
- `releaseResults`: released-film results.

Legal intents, session identity, state revision, state digest, and game week stay
at the response root. There are no independently polled routes, per-section
revision clocks, or client-side joins across moments in time. Release results
are isolated from mutable operations rather than being buried in a generic
production section.

Protocol remains `2` because command and lifecycle semantics are unchanged.
Projection is `4`. Accepted schema identity:

`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.

The TypeScript schema's shared field map is the single property authority for
the legacy parity projection and all six live sections. Runtime projection gives
each closed schema the complete broad source object, allowing the schema walker
to retain its owned facts. This avoids a second hand-maintained projection map
that could silently omit future optional values. A structural test proves all
15 v3 live fields appear exactly once in v4 with identical schema semantics.

### Unity consumer

The generated v4 DTOs are consumed through an atomic `StudioProjectionStore`.
Before mutating current state, it validates and indexes stable identities for
buildings, people, presence, active productions, production operations,
construction records, parcels, catalog items, property buildings, stages, sets,
week-theater subjects, and released films.

The store rejects:

- an incomplete six-section response;
- a lower revision in the same session;
- the same revision with a different digest;
- the same revision/digest with different projected data;
- duplicate stable IDs in any indexed surface;
- unsupported projection `3` or schema identity.

An identical same-revision bundle is a true no-op. A new session resets the
revision epoch only after a complete valid bundle is built. `StudioBridgeClient`
publishes the store-owned response, eliminating the former possibility of the
client and cache disagreeing. Accepted command/load application errors are
contained and surfaced as protocol mismatches rather than escaping callbacks.

Authoritative presence intentionally permits audition freelancers absent from
the employee roster. The frozen broad fixture is now represented by
`StudioOfflineLotSnapshot` and remains isolated from the v4 live bundle.

### Validation

| Gate | Accepted A2 result |
| --- | --- |
| Cross-repository generated check | Passed; C# files byte-identical, 124,814 bytes, SHA-256 `3805f4d54cba772d0670697d3d356b9c480c7a35d1bd4a295a63c5110e8ca004` |
| Bridge typecheck | Passed |
| Bridge tests | 20/20 passed, including field ownership, real wire paths, stable polling, projection-3 rejection, nullability, and full Movie #2 |
| Full TypeScript suite | 325 files; 4,421 passed, 5 skipped, 0 failed in 60.25 seconds |
| TypeScript typecheck | Passed |
| TypeScript production build | Passed in 5.73 seconds; inherited chunk warnings only |
| Headless proof | Passed Movie #2 plus export/import/export, reconnect, and bridge/headless byte identity |
| Unity EditMode | Final seal 15/15 passed in `/tmp/studio-a2-seal-editmode-results.xml` |
| Native macOS build | Passed in `/tmp/studio-a2-build-2.log` |
| Fresh native Movie #2 | Passed; exact `script-0001` / `prod-0013` released Week 22, revision 23 |
| Native save/load | Passed; saved/restored digest `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Native stale action | Rejected with `STALE_REVISION`; authority unchanged |
| Native reconnect | Separate client process recovered the same session/revision/week/digest and released Movie #2 |
| Runtime scan | No error, exception, protocol mismatch, or proof-failure lines |

The final state digest remains
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
matching A1 and the headless authority. No GameState, rule, formula, identity,
save, RNG stream, or Three.js behavior changed.

Final native proof sample: 15,394-byte snapshot, 17.22 ms TypeScript
serialization, 3.81 ms strict Unity parse, 0.29 ms store application, 33.01 ms
command round trip, and 119.40 FPS average. A fresh reconnect applied the entire
bundle in 3.89 ms and averaged 119.40 FPS. These are proof samples, not a
replacement for the Phase L p95/p99 stress program.

### Evidence and visual critique

Local ignored evidence:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/bridge-reconnect-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A2/Unity-Bridge/01-whole-lot.png`
  through `12-reconnected.png`
- `/tmp/studio-a2-native-proof-final.log`
- `/tmp/studio-a2-native-reconnect-final.log`

Whole-lot, production-blocker, release, and reconnect captures were inspected.
A2 is visually unchanged by design. The campus and explicit next-action truth
remain readable; the proof HUD is intrusive, people and production activity are
weak, and the hero stage remains sparse. A2 earns acceptance for architecture,
atomicity, and preserved playability, not visual uplift. The baseline self-grade
remains authoritative.

### Red-team findings resolved

- Removed a hand-maintained field-selection map and added exact schema ownership
  parity so optional facts cannot silently drift.
- Added direct stable-poll assertions for sections, intents, revision, digest,
  game week, and save bytes.
- Preserved real wire paths in validation errors.
- Removed a false Unity invariant that rejected authoritative audition
  freelancers absent from the employee roster.
- Moved command/load projection application inside protocol error boundaries.
- Made same-revision behavior compare all semantic stable-ID maps and exact
  projection JSON before no-op.
- Added week-theater subject identity validation and caching.
- Updated runtime binding audit paths to the named schema.

Independent final TypeScript and Unity audits found no remaining checkpoint
blocker.

### Scope honestly deferred

A2 is not marked fully complete. Detailed screenplay/development, casting,
package/greenlight, richer release/autopsy, and structured holder/remedy
projections remain. The six-section response is the durable decomposition
foundation on which those surfaces can be added without rebuilding transport or
introducing mixed revisions.

### Golden and promotion decision

Accepted compatible pair:

| Repository | SHA | Value |
| --- | --- | --- |
| TypeScript | `cd2b15872ac5849fa16beec1775543758cb3139e` | Projection-4 schema/runtime, proof migration, deterministic generated artifacts, and adversarial tests |
| Unity | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | Atomic projection store, offline/live separation, migrated presentation/proof, and EditMode coverage |

This pair is the first campaign **GOLDEN CHECKPOINT**, preserved by immutable
annotated tag `golden/unity-convergence-m1` in both repositories.

It is not promoted to remote defaults. TypeScript `main@5914c84` diverges from
the campaign at `c0c9561` with three default-only and 185 campaign-only commits
before A2. Treating A2 as a simple feature merge would therefore promote an
unreviewed historical mega-diff. Unity is linearly fast-forwardable, but moving
it alone would make the remote defaults schema-incompatible. The technical PM
decision is **GOLDEN — CONTINUE CAMPAIGN**.

### Next acceptance gate

Phase A3 first unit: add TypeScript-authoritative structured rejection facts for
`blocker`, `currentHolder`, and `remedy`; generate the Unity DTOs, present those
facts without inferring legality in C#, and add bridge plus EditMode negative
coverage. Then make command deduplication durable across save/load and engine
restart before starting the Phase B lifecycle.

## 2026-08-20 - Checkpoint 4: PR #5 donor harvest and current-baseline hardening

### Donor disposition

Reviewed GitHub PR #5 only as a donor proposal. Its base
`3ac66bbbe1f29ecac44c1632ba23952fad8fe61d` and tip
`0edeb4ea874de3d792a112c3d714e5c71657c76d` predate V14, the approved Unity
production-client architecture, current bridge/schema generation, current npm
graph, current main README correction, branch triage, and current 3D guardrails.
Neither donor commit was merged, cherry-picked, or used as a lockfile source.

The donor lock root had only React/ReactDOM and would remove current Phaser,
Three.js, AJV, bridge, and generation dependencies. Its browser-only V13
security description is false for the localhost TypeScript authority plus Unity
client. Its raw 2 MB repository scan and `Math.random` grep fail legitimate
current source, assets, comments, and test needles. Automatic branch deletion,
history rewriting, hard LOC/document budgets, and documentation moves were
rejected.

### Production-ready harvest

- Added five concise accepted ADRs for the lightweight append-only decision
  process, sole TypeScript simulation authority, scoped deterministic boundary,
  forward-only versioned saves, and exact compatible-pair Golden promotion.
- Added a current `SECURITY.md` covering TypeScript authority, Unity production
  client, preserved Three.js client, V14 saves, localhost HTTP routes, asset
  provenance, and the unfinished runtime security boundary.
- Expanded the existing workflow rather than creating duplicate CI. It now has
  read-only permissions, non-persisted checkout credentials, pinned official
  action SHAs, concurrency cancellation, a job timeout, and full dependency,
  hygiene, schema, bridge, typecheck, test, build, and 3D-asset gates.
- Added bounded weekly npm and GitHub Actions Dependabot configuration targeting
  `main`, with no auto-merge. GitHub will not activate this configuration until
  it is present on the default branch.
- Added credential/signing/generated-output ignores and a repository hygiene
  audit that checks tracked plus unignored files, runs negative guard self-tests,
  and rejects known credential paths/markers without imposing a blanket binary
  size limit.
- Declared `vite-node@2.1.9` directly because bridge and generation scripts
  execute it. Refreshed only the current lock's nonbreaking `nanoid` transitive
  from `3.3.16` to `3.3.18`. No forced Vitest/Vite major update was accepted.

### Security and dependency truth

`npm run audit:browser-deps` passes with zero vulnerabilities. This is explicitly
not called a whole-product runtime audit: the development bridge executes
`vite-node` from the dev graph. Full `npm audit` reports five remaining tooling
advisories (three moderate, one high, one critical). An isolated forced upgrade
selected Vitest 4 and broke bridge execution, typechecking, test discovery, and
timeouts, so it was rejected rather than hidden.

Before Phase B production packaging, the bridge must have an explicit compiled
or packaged runtime dependency graph. The current loopback HTTP service must
also gain a per-launch random capability, expected Host policy, Origin rejection,
exact JSON content-type enforcement, request/header timeouts, safe launcher to
Unity token transfer, and proof that the token is never persisted or logged.
Loopback-only binding remains mandatory and no arbitrary filesystem or command
endpoint is authorized.

### Validation

| Gate | Accepted donor-checkpoint result |
| --- | --- |
| Clean install | `npm ci` passed with 205 installed packages |
| Browser dependency audit | 0 vulnerabilities |
| Full dependency report | 5 dev advisories documented: 3 moderate, 1 high, 1 critical |
| Repository hygiene | Passed over 1,003 repository files plus negative self-tests |
| Generated bridge contract | Passed; canonical JSON and C# golden unchanged |
| Bridge typecheck | Passed |
| Bridge tests | 20/20 passed, including Movie #2, stale/duplicate commands, save/load/reconnect, and determinism |
| Full TypeScript typecheck | Passed |
| Full TypeScript suite | 325 files; 4,421 passed, 5 skipped, 0 failed in 62.05 seconds |
| Production build | Passed in 5.49 seconds; inherited chunk warnings only |
| 3D asset audit | 26 assets; 0 hard violations |
| Workflow/config | GitHub Actions run `32411795447` passed every expanded gate in 8m50s at `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`; local YAML and actionlint 1.7.10 also passed |
| Diff audit | No gameplay, protocol, generated DTO, UI, source asset, test, or Unity client changes; `git diff --check` passed |

Independent architecture, CI/security, and whole-diff red teams found no
remaining checkpoint blocker after correcting the ADR-index ignore, exact
2,000,000-byte request-limit wording, actionable private-report fallback,
`.npmrc`/npm-token coverage, env-example scanning, Python/C# scanning, and
generated-root detection.

Accepted donor-harvest implementation commit:
`f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2`.

The first expanded remote workflow run, GitHub Actions `32410749816`, proved all
new install, dependency, hygiene, contract, typecheck, and bridge gates, then
failed the full suite because the Ubuntu runner did not contain Pillow. Seven
pre-existing authored-art/provenance tests call the repository's Python image
pipeline. The local suite was green because the reference Pillow/NumPy stack was
already installed. The workflow correction pins Python 3.14, Pillow 12.3.0, and
NumPy 2.5.1 and updates the official checkout/setup actions to Node-24 v6 refs.
No test was skipped or weakened.

Correction commit `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc` is pushed. Its
follow-up GitHub Actions run `32411795447` passed the clean install, scoped
dependency audit, repository hygiene, generated-contract check, both
typechecks, all 20 bridge tests, the full 4,421-test application suite,
production build, and adopted-3D-asset audit in 8m50s. The earlier failed run is
retained as evidence of the corrected portability gap, not hidden as a flaky
success.

No Unity test or native rebuild was required for this TypeScript-only governance
checkpoint. Golden M1's Unity binary, Movie #2 evidence, save/load/reconnect
proof, screenshots, and performance remain the accepted product evidence.

### Golden and promotion decision

This is not a new Golden Checkpoint. It improves engineering durability but has
no compatible Unity delta, new native build, visual improvement, or player-flow
change. CURRENT BEST remains the immutable M1 pair:

- TypeScript `cd2b15872ac5849fa16beec1775543758cb3139e`;
- Unity `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`;
- tag `golden/unity-convergence-m1` in both repositories;
- status **GOLDEN — CONTINUE CAMPAIGN**.

### A3 sequencing decision

The A3 audit found an inherited bridge parity defect: commission, auditions, and
greenlight are suppressed from `availableIntents` under occupied capacity even
though the TypeScript core deliberately accepts those front doors into queues.
Permanent law says queue, do not forbid. Correct that bridge resolver parity
before adding structured rejection guidance. Do not cement capacity as a
rejection or choose one arbitrary holder/remedy from plural queue authority.

### Next acceptance gate

Correct the three queue-admissible bridge intent resolvers, prove each command is
accepted into authoritative TypeScript queue state under occupied capacity, and
retain exact identity, revision, stale-click, Movie #2, save, and determinism
behavior. Structured rejection guidance follows only for genuine rejection
categories.

## 2026-08-20 - Checkpoint 5: A3 queue-law parity across the product

### Exact accepted state

| Side | Branch | Accepted SHA | Parent / compatible base | Remote state |
| --- | --- | --- | --- | --- |
| TypeScript | `campaign/unity-production-convergence-80h-ts` | `7d76951f6ad641e8940b97b03806b87638ed8ad8` | Parent `7218368cddc46eaeb0fb99691489d457a89112d6` | Pushed and verified |
| Unity | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | Compatible with the accepted TypeScript protocol/projection schema | Pushed and verified; no Unity source or generated contract changed in A3 |

The coherent A3 product commit is accepted and recoverable on the remote. It
contains the queue-law implementation, retained-client parity, adversarial
coverage, and visual-recognizability ADR. This ledger and the other campaign
registers form the docs-only continuity checkpoint that seals the exact pair
below as Golden M2.

### Queue law restored end to end

The inherited mismatch was real: the TypeScript action boundary correctly
queued screenplay commissions, auditions, and greenlights when shared
Development & Casting capacity was occupied, while bridge and retained-client
read surfaces hid or described those same intents as unavailable. A3 now makes
the existing `Queue, don't forbid` law consistent across core, bridge, and
player presentation without moving any legality into TypeScript's clients.

- The bridge resolves commission, audition, and greenlight candidates by exact
  journey identity instead of a fixed commission-first priority. Capacity alone
  no longer removes a legal intent from `availableIntents`.
- Every bridge candidate is preflighted through the authoritative TypeScript
  action. Only capacity-only outcomes are queue-admissible; genuine writer,
  staffing, founding, casting-review, identity, and other hard blockers remain
  closed.
- Accepted bridge messages distinguish an immediate start from an authoritative
  queue receipt. A queued commission creates no screenplay/project identity,
  locks no writer, and charges no cost; queued auditions reserve or charge no
  actor; a queued greenlight creates no production identity and commits no
  budget or talent until dequeue revalidation succeeds.
- Normal front doors reject a second exact queued pool concept, casting project,
  or greenlight project. Internal dequeue replay remains legal. Read models and
  bridge selectors suppress the already-queued exact identity so repeated or
  rapid clicks cannot grow duplicate queue facts.
- Retained screenplay commissioning, audition planning/Casting, Package
  Assembly, lot cards, and inspectors now expose queue-admissible actions and
  truthful waiting copy rather than capacity refusals. The authoritative state,
  revision, command identity, and stale-click checks remain the dispatch gate.
- Casting review and completed Casting history now use
  `canSubmitGreenlightIntent`, not `knownGatesClear`, for the exact Package
  handoff. Capacity-only packages retain the `Development & Casting is full`
  notice while offering `Take results to Package` / `Open package`; unfinished
  Casting, writer/staffing hard blockers, and `greenlight-queued` remain closed.
  The strict retained snapshot proves the exact session/project/title action
  and fails neutral on malformed or stale identities.

No gameplay formula, RNG stream, save schema, projection schema, generated C#
DTO, or Unity-side simulation rule changed. This checkpoint aligns all clients
with authority that already existed and adds exact duplicate protection at the
TypeScript front door.

### Validation

| Gate | Accepted A3 result |
| --- | --- |
| Full TypeScript suite | 327 files; 4,450 passed, 5 skipped, 0 failed |
| Bridge tests | 24/24 passed, including all three capacity queues, exact receipts, duplicate/stale rejection, Movie #2, save/load, reconnect, and deterministic parity |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk warnings only |
| Native macOS build | Passed; final build is 136,925,846 bytes |
| Generated contract verification | Passed; canonical TypeScript schema and Unity C# generated copies remain byte-identical |
| Repository hygiene | Passed |
| Browser dependency audit | Passed with 0 browser-runtime vulnerabilities |
| Adopted 3D asset audit | Passed; 26 assets, 0 hard violations |
| Diff/independent audit | `git diff --check` passed; independent final review found no remaining P0 or P1 defect in the A3 checkpoint |
| Product-SHA remote CI | GitHub Actions run `32422095175` passed every expanded gate in 9m36s at `7d76951f6ad641e8940b97b03806b87638ed8ad8` |

Focused tests cover capacity-only queue admission, no premature mutation or
reservation, exact dequeue payloads, casting-to-Package handoff, unfinished
Casting, hard blockers, exact queued-greenlight closure, malformed retained
projections, duplicate intent rejection, same-title identity, and stale action
safety.

### Native Movie #2, save, stale, and reconnect proof

The unchanged validated Unity client at `a1c27318` was run against the A3
TypeScript authority. The native proof again completed exact Movie #2 at Week
22, revision 23, with final digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
The active save was exported, loaded, and restored at digest
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
A stale command was rejected without authority mutation. A separate Unity
client process reconnected to the same Week 22 / revision 23 session and final
digest.

The final-seal native Movie #2 proof averaged 119.18 FPS and the reconnect proof
averaged 119.19 FPS on the Apple M3 Max reference device. These are lifecycle proof
samples, not the later Phase L p95/p99 or 25/50/100-person scalability gate.

Local ignored evidence:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-client-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-reconnect-proof.json`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/01-whole-lot.png`
  through `12-reconnected.png`
- `/tmp/studio-a3-native-proof-final-seal.log`
- `/tmp/studio-a3-native-reconnect-final-seal.log`

### Visual recognizability ruling and honest critique

The Owner's visual-fidelity ruling is now binding campaign doctrine and is
recorded in
`docs/adr/0006-visual-recognizability-and-two-scale-camera.md`. Visual
recognizability relative to *The Movies* is a first-class goal alongside systems
recognizability, without copying Lionhead assets, textures, layouts, UI artwork,
or any protected production material. Unity must support one coherent camera
with both an elevated management scale and a lower, inhabitable
inspection/production scale. Period, role, material, filmmaking activity, and
backlot working-side truth must read from the world rather than labels alone.

The source visual review was
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf` (SHA-256
`692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`).
Its literal claim that the production client is orthographic is stale for the
current Unity client: Unity already uses perspective Cinemachine cameras,
orbit, focus, and a variable pitch. Its central product critique remains valid.

A3 intentionally makes no visual change. The new captures still read too much
like a handsome diorama: the normal pitch and narrow lens keep inspection
distant, focus retains the high management framing, the proof HUD dominates the
world, materials and era specificity remain uneven, people are too small for
role readability, and active production does not yet read strongly enough as
filmmaking. Architecture, performance, and test counts do not satisfy this
visual gate. The approved reversible next visual experiment is a two-scale
camera profile after the load-bearing A/runtime work is safely checkpointed;
it must not be used to interrupt or disguise unfinished bridge/runtime work.

### Golden and promotion decision

Golden M2 is the exact compatible pair:

| Repository | Golden SHA | Immutable annotated tag |
| --- | --- | --- |
| TypeScript authority | `7d76951f6ad641e8940b97b03806b87638ed8ad8` | `golden/unity-convergence-m2` |
| Unity production client | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `golden/unity-convergence-m2` |

Both annotated tags point to those exact commits and are immutable and pushed
as part of this seal. They do not move or replace the preserved
`golden/unity-convergence-m1` tags.

Golden M2 supersedes M1 as CURRENT BEST because it retains M1's generated
protocol, atomic Unity projection store, deterministic Movie #2/save/reconnect
proof, and native performance while materially improving player and
architecture integrity:

- all three capacity-admissible movie intents now obey the permanent queue law
  across TypeScript core, bridge, and retained clients;
- exact duplicate queue identities are rejected without weakening dequeue;
- receipts state precisely what is and is not held while an intent waits;
- Casting reaches the exact queueable Package rather than falsely closing on
  facility capacity;
- the full suite, bridge proof, native Movie #2, save/load, stale rejection,
  reconnect, deterministic digests, build, audits, and independent P0/P1 review
  all pass.

M2 is visually unchanged from M1 and remains honestly below the newly ratified
visual-recognizability ADR. That is a known product deficit, not hidden by the
Golden designation. M2 is Golden because it is the best validated overall
playable state, not because the current camera, people, materials, HUD, or
filmmaking activity have reached the visual target.

Promotion status remains **GOLDEN — CONTINUE CAMPAIGN**. Neither repository is
promoted to its canonical/default branch. The TypeScript default remains a
large divergent historical line, moving Unity alone would break compatible-pair
clarity, Phase A structured rejection work and Phase B lifecycle hardening are
unfinished, and the visual client remains below the approved product bar.

### Next acceptance gate

Add structured TypeScript-owned rejection facts only for genuine command
failures, generate and validate the Unity DTO changes, and retain/render exact
blocker, holder, and remedy guidance across stable same-revision polls. Capacity
must remain queue authority, not be recast as a rejection.
