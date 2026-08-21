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
| A - Productionize TypeScript to Unity contract | Complete for current protocol | A1 generated contract, A2 named projections, A3 queue parity, and A4 structured remedies are sealed; later projection growth must retain the same authority/version discipline |
| B - Durable local game runtime | Golden M4 complete for local development | Checkpoints 7/8/9/10 provide durable authenticated exact-retry continuity and a one-command owned lifecycle; emitted production packaging remains later work |
| C - Unity client architecture | Partial, Checkpoint 12 non-Golden | Protocol, runtime continuity, authoritative physical-location joins, two-scale Cinemachine direction, Stage-A truth/state presentation, unified input, collision recovery, proof, and presentation seams exist; broader production decomposition remains open |
| D - Full Movie journey in Unity | Partial at inherited baseline | Automated native Movie #2 path passes, but the interaction surface remains proof-oriented and does not yet provide the approved professional retained workspaces |
| E - Lot interaction / construction / management | Partial at inherited baseline | TypeScript construction intent and visible construction state pass; direct build placement interaction is not productionized in Unity |
| F - Hero Soundstage 7 | Partial, Checkpoint 12 working-stage slice sealed non-Golden | Stage-A truth now drives five distinct operating states with film-camera, boom, director, cast, crew, load-in, clearing, lighting, and working-back cues; close-read art, materials, lighting, role scale, and portrait composition remain below the visual law |
| G - Characters and authored animation | Partial, role animation slice accepted | Provenance-cleared bodies, Mecanim role controllers, authoritative/ambient slot separation, and 32 declared people exist; human detail, close-read role identity, and animation quality remain below target |
| H - Purposeful people / NavMesh | Partial, Stage-A activation proven | Runtime NavMesh activation and Stage-A role stations present 4/4 authoritative plus 8/8 ambient people in active proof states; 25/50/100 stress gates are untouched |
| I - Camera / occlusion / inspection | Functional non-Golden slice | Smooth management/inspection Cinemachine modes, responsive Stage 7 landscape/portrait profiles, Admin target, collision/occlusion recovery, shared mouse/touch sampling, UI gesture exclusion, Back/Escape/Home return, and exact-viewport proof pass; frustum tests do not prove occlusion-free composition and real foreground touch remains unproven |
| J - World / era / campus quality | Partial at inherited visual floor | Campus scale reads, but overview remains a diorama and Administration is flat/empty; surroundings, density, material variation, inhabitation, and 1948 specificity remain weak |
| K - Materials / lighting / VFX / audio | Partial, first Stage 7 treatment accepted | Stage-specific generated surface detail, working-set backs, practical/shooting effects, and state-driven lights exist; flat low-detail materials and lighting still dominate the close read |
| L - Performance / scalability | Baseline only | M3 Max measurements captured; no 25/50/100 scalability campaign yet |
| M - Resilience | Partial | Stale/duplicate, durable save/load, idle restart, outage retention, malformed protocol, exact lost-response recovery, and the Golden M4 supervisor pass; production packaging and the full ugly-condition matrix remain incomplete |
| N - Professional QA | Active | Full TypeScript, Unity EditMode, native build, scene validation, two-resolution five-state Stage proof, native Movie #2, full-client reconnect, actual process-kill, evidence-verifier, and runtime capture gates are established and run per checkpoint |

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

## 2026-08-21 - Checkpoint 6: A4 structured rejection guidance (validated pre-commit)

### Exact pre-commit state

| Side | Branch | Current pushed HEAD / A4 parent | Working-tree state |
| --- | --- | --- | --- |
| TypeScript | `campaign/unity-production-convergence-80h-ts` | `85429f9d18e2b6321e21557bdb068b1047b4c452` | Dirty with the validated A4 protocol/runtime/schema/generated-golden/tests/README unit plus these continuity updates; not committed or pushed |
| Unity | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | Dirty with the validated generated DTO copy, strict protocol parser, rejection retention, proof presentation, and EditMode tests; not committed or pushed |

Both recorded base HEADs are pushed and match their remote campaign refs. A4
has no product commit SHA or Golden tag yet. Golden M2 remains the sole CURRENT
BEST until both repositories are committed, pushed, and deliberately sealed.

### TypeScript-owned rejection contract

A4 makes every genuine bridge rejection carry one closed, generated,
TypeScript-owned reason object. The live contract is protocol `3`, projection
`4`, schema identity
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
The projection version remains `4` because the authoritative snapshot bundle is
unchanged; protocol moves from `2` to `3` because the rejected-response envelope
has a new required member.

The exact rejection shape is:

```text
category, blocker, currentHolder, remedy
```

- `category` is one of `request-invalid`, `contract-incompatible`,
  `session-mismatch`, `state-stale`, `command-conflict`,
  `intent-unavailable`, `authority-refusal`, or `save-state`.
- `blocker` and `remedy` are required non-empty player-facing strings.
- `currentHolder` is required but nullable and must be non-empty when present.
  The current 12 mappings use `null` because no rejection path can truthfully
  prove a person, facility, or work item as the current holder.
- Root `reasonCode` and non-empty `message` remain diagnostic facts. Raw
  `ENGINE_REJECTED` and `SAVE_REJECTED` detail stays in `message`/logs and is not
  copied into player-facing blocker copy.
- All 12 existing reason codes map centrally in TypeScript. Schema tests reject
  a missing rejection, missing/null/blank blocker or remedy, a missing holder,
  an unknown category, and additional fields.
- Capacity contention remains an accepted authoritative queue receipt. The
  commission, audition, and greenlight contention tests explicitly prove that
  accepted responses contain no `rejection` member.
- Exact cached rejection replay remains byte/object exact within the existing
  process-memory journal.

The generated TypeScript-side C# golden and the Unity generated copy are
byte-identical. Generated C# names are
`StudioBridgeRejectedResponse.rejection`, `StudioBridgeRejection`, and
`StudioBridgeRejectionCategoryValues`; no C# gameplay formula or inferred
rejection mapping was introduced.

### Strict Unity retention and presentation

Unity consumes the generated protocol-3 DTO rather than mirroring the contract
by hand. It rejects malformed guidance and binds a valid rejection to the exact
session, state revision, game week, and state digest that produced it.

- Valid guidance survives same-state polling only when all authority tokens
  remain exact. The native stale proof retained `state-stale`, a null holder,
  and non-empty blocker/remedy from poll 11 to poll 12 while revision 18 and the
  digest remained unchanged.
- Accepted commands and session changes clear the retained rejection. A changed
  revision, week, or digest cannot carry stale guidance forward.
- Raw diagnostic `message` is available to logs/proof evidence but is not used
  as player copy.
- The proof HUD renders `WHAT HAPPENED`, optional `CURRENT HOLDER`, and
  `WHAT NEXT`. It omits the holder section when the authoritative field is null.
- The retained screenshot
  `Evidence/A4/Rejection-Guidance/10b-stale-rejection-retained.png` has SHA-256
  `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.

### Validation

| Gate | Validated A4 pre-commit result |
| --- | --- |
| Full TypeScript suite | 327 files; 4,452 passed, 5 skipped, 0 failed |
| Bridge/schema tests | 26/26 passed, including all 12 mappings, exact replay, adversarial schema failures, Movie #2, and all three accepted capacity queues |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk warnings only |
| Generated contract | Passed deterministic generation and cross-repository byte-identity check |
| TypeScript Movie #2 proof | Passed through Week 22 with final digest `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13` |
| Browser dependency audit | Passed with 0 browser-runtime vulnerabilities |
| Repository hygiene | Passed |
| Adopted 3D asset audit | Passed |
| Unity EditMode | 24/24 passed; `/tmp/studio-a4-rejection-p1-seal-editmode.xml` |
| Native macOS build | Passed; 136,938,870 bytes; `/tmp/studio-a4-rejection-p1-native-build-final.log` |
| Fresh native Movie #2 | Passed through Week 22/revision 23 with final digest `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13` |
| Native save/load | Passed with exact saved/restored digest `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Stale rejection | Passed as category `state-stale`, null holder, non-empty blocker/remedy, retained across one same-state poll without revision/digest mutation |
| Native reconnect | Separate process recovered Week 22/revision 23/final digest; `/tmp/studio-a4-rejection-p1-native-reconnect-final.log` |
| Native performance sample | Fresh proof 119.3803 FPS; reconnect 118.9993 FPS |
| Evidence | Ignored `Evidence/A4/Rejection-Guidance/` with 13 PNGs and two JSON reports |
| Independent audit | No open P0 or P1 finding |

### Residuals and promotion decision

The bounded A4 rejection path is validated, but four resilience gaps remain:

- unexpected bridge exceptions still use an unstructured fatal HTTP 500 path;
- JSON Schema constrains each field but cannot encode every reason-code/category
  cross-field pairing, so exhaustive TypeScript mapping tests remain required;
- some Unity client-adapter negative branches lack direct isolated tests even
  though strict protocol and retention tests plus native proof cover the
  accepted path;
- the 256-entry replay cache remains process-memory-only and does not survive
  restart.

A4 changes no art, camera, materials, animation, world layout, or simulation
formula. Its captures remain visually equivalent to A3/M2: a readable but
intrusive proof HUD over a sparse, distant campus that still reads too much like
a diorama. It remains below ADR 0006's inhabitable, two-scale, filmmaking-first
visual target.

Promotion status remains **GOLDEN — CONTINUE CAMPAIGN** with Golden M2 as the
sole CURRENT BEST. Do not create an A4 Golden tag or claim supersession from
dirty worktrees. The checkpoint owner must first inspect the whole diff, commit
and push both compatible repositories, verify remote SHAs, and then decide
whether the sealed pair materially qualifies as the next Golden.

### Next action after A4 seal

Replace the 256-entry memory-only replay cache with a bounded, save-associated
command identity journal, then prove exact duplicate response replay across
save/load and TypeScript engine process restart. After that durability unit,
begin the Phase B launcher and localhost security boundary.

## 2026-08-21 - Checkpoint 6 seal: Golden M3

### Exact sealed pair

| Side | Branch | Product SHA | Direct parent | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript | `campaign/unity-production-convergence-80h-ts` | `e9c6f06b717a6a106281b189a61072e35770155f` | `85429f9d18e2b6321e21557bdb068b1047b4c452` | `golden/unity-convergence-m3` |
| Unity | `campaign/unity-production-convergence-80h-client` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `golden/unity-convergence-m3` |

Both product commits and both annotated tags were pushed. Local, upstream, and
remote campaign refs were verified at the exact product SHAs. Remote M3 tag
objects were fetched with `git ls-remote` and peel to the recorded commits.
Both worktrees were clean after the product commits. M1 and M2 tags remain
unchanged, pushed, and immutable.

### Golden decision

Golden M3 supersedes M2 as CURRENT BEST. It is materially stronger because the
player-facing rejection path is now generated, strict, authority-bound, durable
across stable polling, and proven in the native Movie #2 flow. M3 preserves all
M2 queue-law and retained-client fixes and changes no authoritative gameplay
formula, V14 save shape, RNG stream, identity, economy/construction rule, or C#
simulation boundary.

The promotion status remains **GOLDEN — CONTINUE CAMPAIGN**, not canonical
promotion. Phase B process/save/replay durability is absent, TypeScript `main`
remains a historically diverged semantic merge, and Unity visuals remain below
ADR 0006. Those are real product boundaries, not reasons to make CURRENT BEST
ambiguous.

### Final accepted validation

- Full TypeScript regression: 327 files, 4,452 passed, 5 skipped.
- Bridge/schema: 26/26; TypeScript and bridge typechecks passed; production
  build, deterministic generation, cross-repository generated byte identity,
  browser dependency audit, repository hygiene, and 3D provenance audit passed.
- TypeScript proof: Movie #2 Week 22 and final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  save/import/headless parity remained exact.
- Unity EditMode: 24/24.
- Native build: 136,938,870 bytes.
- Fresh native Movie #2: `The Reluctant Cornerstone`, `script-0001`,
  `prod-0013`, Week 22/revision 23/final digest above.
- Native save/load: exact saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Structured stale rejection: `state-stale`, required player blocker/remedy,
  null holder, no state mutation, retained across successful poll 11 to 12.
- Separate-process Unity reconnect: same Week 22/revision 23/final digest.
- Performance: 119.3803 FPS proof and 118.9993 FPS reconnect on Apple M3 Max.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained frame SHA-256
  `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Independent red-team: two P1 proof/presentation defects were found, fixed,
  rebuilt, replayed, recaptured, and re-audited; no open P0/P1 remains.

### Residuals

- The 256-entry replay map, bridge state, and explicit save slot remain
  process-memory-only.
- An unexpected server exception still uses an unstructured fatal HTTP 500.
- Several Unity rejection-adapter mismatch branches lack isolated direct tests.
- Cross-field reason/category pairing is producer-tested rather than expressed
  as a JSON Schema relation.
- The runtime is unauthenticated loopback HTTP with two manually managed
  processes; Host/Origin/content-type/capability and launcher lifecycle remain
  Phase B work.
- Visuals are unchanged from M2 except the rejection notice and remain below the
  inhabitable two-scale studio target.

### Next exact action

Implement a separate strict `BridgeRuntimeCheckpointV1` containing untouched
canonical current V14 bytes, the last explicit save, logical session/revision,
and a bounded command identity/response journal. Commit it atomically before a
first-seen response, then prove exact duplicate response replay across
authoritative save/load and a real TypeScript engine process restart. Do not
widen V14 or put bridge operational history into `GameState`.

## 2026-08-21 - Checkpoint 7: durable bridge replay foundation (validated pre-commit, non-Golden)

### Exact candidate state

| Side | Branch | Current pushed HEAD / candidate parent | Working tree |
| --- | --- | --- | --- |
| TypeScript | `campaign/unity-production-convergence-80h-ts` | `85d865cdd4f38ab4df32e24393e130ca094f6b7f` | Dirty only with the validated runtime checkpoint/store/coordinator/server/session/tests/config/docs unit; no candidate commit yet |
| Unity | `campaign/unity-production-convergence-80h-client` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | Clean and pushed; no source or contract change |

Golden M3 remains the exact CURRENT BEST compatible pair: TypeScript
`e9c6f06b717a6a106281b189a61072e35770155f` plus Unity
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`, with immutable pushed
`golden/unity-convergence-m3` tags. This bounded TS-only infrastructure
candidate is not Golden because the normal launch remains memory-only, the
localhost transport remains unauthenticated, and no native Unity engine-kill
reconnect proof has run.

### Architecture landed

- Added strict closed `BridgeRuntimeCheckpointV1` outside `GameState` and V14.
  It contains exact canonical current V14 JSON, exact last explicit-save V14
  JSON or null, logical session/revision, canonical route/request/full-response
  entries, state/save digests, and a complete journal digest.
- Decoder rejects unknown/missing fields, incompatible format/protocol/schema,
  noncanonical bytes, invalid V14, digest mismatch, duplicate identities,
  route-invalid requests or rejections, revision regression/inflation,
  impossible saved-slot history, journal tampering, and all configured bounds.
- Replaced independent in-memory dispatch with one serialized coordinator for
  state reads and command/save/load. A first-seen response is hidden until the
  complete next checkpoint commits. A persistence or invariant failure poisons
  queued/later work rather than letting memory and disk diverge.
- Replays use the exact stored canonical response bytes. The old implicit
  256-entry eviction is gone. Default bounds are 512 entries, 16 MiB journal,
  and 32 MiB checkpoint.
- Recoverable history pressure first proves the candidate fits alone, then
  atomically rolls to a new logical session at revision zero while preserving
  current and explicit-save V14 authority. An intrinsically oversized first
  entry is fatal and cannot create endless session churn.
- Added a private filesystem store with a dedicated current-user `0700` root,
  `0600` checkpoint/lock, strict containment and symlink rejection, bounded
  UTF-8 reads, PID plus process-incarnation ownership, safe stale-lock reclaim,
  same-directory temp/file-sync/rename/directory-sync commit, rollback on
  post-rename failure, and ownership-safe close.
- The actual HTTP server can use port zero and an opt-in
  `PROJECT_STUDIO_BRIDGE_RUNTIME_DIR`. It restores or creates the checkpoint
  before listening, routes stateful work through the coordinator, emits exact
  stored bytes, distinguishes durable from memory-only startup, and drains on
  `SIGINT`/`SIGTERM` or fatal runtime failure.
- Added ADR 0007. V14, `GameState`, protocol 3, projection 4, schema hash,
  generated C#, Unity, Three.js, assets, simulation formulas, identities, and
  RNG streams are unchanged.

### Real failure-mode proof

`tests/bridge-process-restart.test.ts` launches the actual `vite-node`
`bridge/server.ts` on an ephemeral loopback port with a private runtime root.
It commits command/save/command/load, verifies canonical checkpoint/current and
explicit-save V14 bytes and the four exact route/request/response pairs, sends
`SIGKILL`, starts a new process against the same root, and proves:

- the logical session, revision, week, and state digest are unchanged;
- all four duplicate HTTP response bodies are byte-identical to the first
  process and authority does not advance;
- cross-route command-ID reuse is rejected without changing checkpoint bytes;
- a final graceful `SIGTERM` releases the lock.

Independent probes additionally proved a corrupt checkpoint exits nonzero while
preserving its bytes and releasing its lock; an explicit non-null save survives
multiple journal rollovers and later loads exactly; and a sole oversized entry
causes one generic fatal capacity error with no write, session change, or save
mutation. The non-null saved-slot rollover is now permanent coordinator-test
coverage rather than transient evidence.

### Red-team corrections

Audits found and closed all persistence-core P0/P1 defects before acceptance:

- unsafe chmod of an existing parent, ancestor-symlink escape, and PID-reuse
  false liveness;
- caller limit loss, post-mutation capacity failure, and a permanently full
  journal sink;
- route-rebound rejection replay, unbound historical response corruption, and
  first-response/replay wire-byte mismatch;
- checkpoint root revision inflation beyond terminal history; and
- endless session rollover when one response cannot fit an empty journal.

Final independent replay and lifecycle audits report no remaining P0/P1 in the
checkpoint, store, session, coordinator, or restart primitive.

### Validation

| Gate | Accepted result |
| --- | --- |
| Full TypeScript suite | 332 files; 4,488 passed, 5 skipped, 0 failed |
| Bridge aggregate | 62/62 passed across 7 files; generated schema/C# drift check passed |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited chunk warnings only |
| Movie #2 proof | Passed Week 22 at digest `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`; save/import/reconnect/headless parity exact |
| Browser dependency audit | Passed; 0 browser-runtime vulnerabilities |
| Repository hygiene | Passed; 1,017 repository files after documentation additions |
| 3D asset audit | Passed; 26 assets, 0 hard violations |
| Unity/native | Not rerun: no Unity, schema, DTO, projection, gameplay, or visual source changed; latest Golden M3 remains 24/24 EditMode and native Movie #2/reconnect proof |

### Honest residuals

- P1: independent HTTP reproduction sent an arbitrary Host, arbitrary Origin,
  and `text/plain` command with no capability; the server returned HTTP 200 and
  advanced revision `0 -> 1`. Loopback is not authorization.
- P1: normal `npm run bridge` intentionally uses a memory store unless a caller
  supplies the runtime directory. There is no product supervisor, random-port
  handoff, secret transfer, owned logs, restart loop, or stale-child cleanup.
- P1: handshake has no non-persisted runtime-instance ID and Unity has not
  proven an exact retained in-flight retry after engine death.
- P1: visuals remain unchanged from M3 and below ADR 0006.
- P2: the current `vite-node` development bridge graph is outside the green
  browser-runtime dependency audit.

### Decision and next gate

The candidate is a valuable production foundation and should be checkpointed,
but it is not a new Golden and not canonical-promotion material. M3 remains
CURRENT BEST. The next exact engineering action is to add a non-persisted
per-launch capability and runtime-instance ID, enforce exact loopback Host,
reject Origin, require JSON content type, add timeouts and attacker tests, then
regenerate the contract and update Unity authorization/restart detection.

## 2026-08-21 - Checkpoint 7 seal: durable replay product pushed, M3 preserved

TypeScript product commit
`e6fc2047f372e7642c3c2fcee1d3915bb4064620` (`feat(bridge): persist exact
replay across engine restarts`) is pushed to
`campaign/unity-production-convergence-80h-ts`; `git ls-remote` verified the
remote branch at that exact SHA before this continuity-only follow-up. Its
parent is `85d865cdd4f38ab4df32e24393e130ca094f6b7f`. Unity remains unchanged,
clean, and pushed at `40465d48c191c9dcdda2c6b32c17c9675f4908a4`.

The accepted validation and red-team record is exactly the Checkpoint 7 section
above. Final product-tree reruns passed 62/62 bridge tests, both TypeScript
typechecks, production build, 332-file full regression with 4,488 passed and 5
skipped, Movie #2/save/import/headless proof, browser dependency audit,
1,017-file repository hygiene, 26-asset provenance audit, and `git diff
--check`. Final independent product and continuity audits reported no open
P0/P1 in the bounded persistence core or checkpoint diff.

Product-SHA GitHub Actions run `32430904875` completed successfully in 10m25s
at `e6fc2047f372e7642c3c2fcee1d3915bb4064620`, including install, browser
dependency and repository hygiene, generated contract, both typechecks, bridge
and full application tests, production build, and 3D asset audit.

This seal deliberately creates no Golden tag. Golden M3 remains CURRENT BEST at
TypeScript `e9c6f06b717a6a106281b189a61072e35770155f` plus Unity
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`, both identified by immutable
`golden/unity-convergence-m3` tags. The durability product is a recoverable
non-Golden descendant because default launch, localhost authorization,
runtime-instance handshake, Unity kill/retry proof, and the binding visual gate
remain incomplete.

NEXT EXACT ACTION remains: add a non-persisted per-launch capability and
`runtimeInstanceId`; enforce exact loopback Host, reject Origin, require JSON
content type, add bounded HTTP timeouts and attacker tests; then regenerate the
contract and wire Unity authorization/restart detection.

## 2026-08-21 03:22 CEST - Checkpoint 8 sealed: authenticated runtime continuity (validated, pushed, non-Golden)

### Exact sealed state

| Side | Branch | Exact pushed product SHA | Parent | Working tree after seal |
| --- | --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `720826bd843995920bb2f219ab21203d236c1879` | `550eae6799b5cb64f567b42ab688a2bc76f5a073` | Product clean; branch receives only the containing continuity-document commit after this ledger update |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `94e8bcac6a5bf94fd70f3f8a61992511230688a2` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | Clean at the exact product SHA |

Both product commits are pushed and remotely verified as the only compatible
Checkpoint 8 pair. Golden M3 remains the sole
CURRENT BEST pair: TypeScript
`e9c6f06b717a6a106281b189a61072e35770155f` plus Unity
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`, both preserved by immutable
`golden/unity-convergence-m3` tags.

### Protocol-4 contract and local HTTP boundary

The sealed wire contract is protocol `4`, projection `4`, schema identity
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Projection remains `4` because no presentation projection or gameplay fact
changed. Protocol moves from `3` to `4` because `GET /health` and
`GET /session` now require a non-empty `runtimeInstanceId` identifying one
engine-process incarnation.

- `runtimeInstanceId` is generated once per TypeScript engine process. It is
  returned only by the health/session handshakes and is absent from snapshots,
  command/control responses, exact replay entries, V14 saves, and runtime
  checkpoints.
- Every request requires one canonical 32-byte base64url capability supplied by
  `PROJECT_STUDIO_BRIDGE_CAPABILITY`. The engine validates it before opening
  runtime state, deletes the raw environment value after deriving a digest,
  and compares presented credentials through a fixed-length digest with
  `timingSafeEqual`.
- The capability belongs to one complete product launch. The engine and Unity
  inherit the same value; an engine restart inside that launch reuses it, and a
  later product launch rotates it. It is never placed in argv, responses, logs,
  reports, saves, checkpoints, generated contract data, or repository files.
- The server remains bound only to `127.0.0.1`. It requires exactly the listener
  Host, rejects every Origin, requires exactly one `application/json` media type
  on POST, rejects `Expect: 100-continue`, closes rejected connections, and
  returns one generic boundary body without authority identifiers.
- Parser and lifecycle bounds are explicit: 16 KiB header bytes, 64 manually
  enforced complete raw headers, 100 requests per socket, 5-second header
  timeout, 15-second request and idle timeouts, 2-second keep-alive timeout, and
  a 1-second connection-check interval. Node's positive `maxHeadersCount` was
  deliberately disabled because it silently truncated `rawHeaders` and could
  hide an Origin or duplicate protected header after the limit; the complete
  size-bounded header set is parsed and then rejected when its manual count is
  over 64.
- Missing or malformed launch capability fails before the checkpoint store is
  opened. Unauthorized, wrong-Host, Origin-bearing, duplicate/overflow-header,
  and non-JSON POST probes cannot read or mutate runtime authority.

The checked-in canonical schema JSON has SHA-256
`a2b27d4ed12ca432444914d21743c66d7ca2cacb14ed440e29a58c7738849a75`.
The TypeScript generated C# golden and Unity generated copy are byte-identical
at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No C# gameplay formula, legality rule, time, RNG, economy, save migration, or
identity authority was introduced.

### Strict forward-only operational checkpoint migration

Protocol-3 replay bytes cannot truthfully be replayed as protocol 4. Startup
therefore has one narrow migration boundary for the exact immediately
preceding protocol-3/schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`
runtime checkpoint:

- the legacy root, canonical bytes, V14 current and explicit-save slots,
  digests, routes, requests, responses, command identities, revision ordering,
  terminal authority, journal digest, and capacity bounds are validated before
  migration;
- current and explicit-save V14 JSON remain byte-exact and are never widened or
  rewritten as a new gameplay save format;
- the incompatible protocol-3 replay journal is discarded only after complete
  validation, and protocol 4 starts a new logical session at revision zero with
  an empty journal;
- the protocol-4 checkpoint is committed atomically before the coordinator
  becomes ready; a migration write failure leaves the protocol-3 bytes intact,
  releases the store, and fails startup;
- corrupt, noncanonical, unknown-schema, or otherwise unsupported checkpoints
  still fail closed rather than being treated as a migration opportunity.

An independent real-version proof created a non-empty checkpoint with product
commit `e6fc2047f372e7642c3c2fcee1d3915bb4064620`, accepted a command and explicit
save under protocol 3, and launched this checkpoint against the same runtime
root. Protocol 4 opened a new logical session at revision zero with an empty
journal while preserving both current and saved digest exactly as
`bdc0ea0cd8dc342a30e49578da4bd921e52e283faa560f3e9902c5a2a4bed74a`.

### Unity session-first continuity policy

Unity now treats the transport and handshake as production infrastructure
rather than polling `/snapshot` directly.

- The capability is accepted only from the environment. The endpoint must be
  exact `http://127.0.0.1:<nonzero-port>` with no user info, path, query, or
  fragment before any authorized request can be created. Redirects are
  disabled, the capability header is centralized for every route, and POSTs
  receive JSON content type from the same request factory.
- Every refresh obtains a strict `/session` response before `/snapshot`.
  Protocol, schema, projection, runtime instance, logical session, revision,
  week, digest, required fields, and closed JSON shape are validated.
- A snapshot is joined only when its session/revision/week/digest exactly match
  the preceding handshake. A racing mutation is treated as a torn read and
  retried within a bound; repeated contradiction becomes a visible protocol
  failure rather than applying a mixed projection.
- Runtime replacement and logical-session replacement are distinct events.
  Same-session revision regression or same-revision digest conflict is fatal.
  A legitimate new logical session clears retained rejection guidance before
  a fresh projection is applied.
- During a temporary engine outage, actions are disabled and the last valid
  projection remains visible as explicitly stale presentation. The client
  becomes interactive again only after a compatible session-first join.
- HTTP `401`, `403`, and `415`, invalid launch configuration, and
  protocol/schema violations are terminal. Transport loss is reconnectable.
  `SESSION_MISMATCH` discards the obsolete action, clears authority-bound
  guidance, and reconnects without silently resubmitting it.

This unit intentionally does **not** retain or automatically replay an in-flight
POST. Command, save, and load bodies still live only for the current request.
That prevents unsafe speculative retry but leaves the commit-before-response
failure window as the next load-bearing resilience unit.

### Native player and restart evidence

Fresh protocol-4 Movie #2 proof is retained at
`Evidence/B/Secure-Movie2-Protocol4-Final-20260821T005553Z/`:

- the full world-first path completed `The Reluctant Cornerstone`,
  `script-0001`, `prod-0013` through release at revision `23`, Week `22`, and
  final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
- save/load restored exact digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
- the stale command remained an authoritative `STALE_REVISION` rejection with
  retained TypeScript blocker/remedy across successful poll `13 -> 14`;
- the run recorded zero transport outages, zero torn reads, zero runtime
  replacements, and `118.99945526372407` average FPS;
- report SHA-256 is
  `e1795b73ca2b1831671ce1df30dfba7ab14af79a1e91eed5850b58264b139049`;
  representative retained frame hashes are whole lot
  `a92cae2857b4b6a198d454040e557480198108bed11bace39a5e1c8814a6da25`,
  construction
  `fa1985e6fd5d6673366dba6c2842eef105a5aa68a88961e7ab59033e103336d3`,
  stale guidance
  `a5072e21877e2e1895a9956eb418f5f5994d0e3129893cd533fef28e5900343b`,
  and released Movie #2
  `6e1efea3348076ebb9733fa30f9127ddb0bfc8baa90f26350beb4c5d8820bf0d`.

Native engine-replacement proof is retained at
`Evidence/B/Runtime-Restart-Protocol4-Final-20260821T005655Z/`:

- before and after restart, logical session
  `8bd7be79-7ffb-483f-950e-2b4c7f9788c9`, revision `0`, Week `11`, and digest
  `3517604efca1c48a54732d9799b6a73ffa9ab99f26e0e28d54bdbac010af1109`
  remained exact;
- engine incarnation changed from
  `2ea0f819-461e-4406-b582-f00aeeac8020` to
  `6d3e4566-6c32-4b0c-a7a3-454b4e1711ec` while the same per-product-launch
  capability continued to authorize the running Unity client;
- Unity observed three failed outage polls, disabled actions, retained the last
  valid projection, detected the replacement, completed a compatible
  session-first join, and returned to live with zero torn reads;
- the durable checkpoint remained byte-identical with journal length zero and
  no authority mutation; capability scans of checkpoint, reports, and captured
  process logs found no secret value;
- restart performance was `118.99992055898248` average FPS;
- ready-record SHA-256 is
  `33b680284ae2248ffcd0b6e550afa9c16ff9ff8c4db1a1271e9a01a03174605f`,
  final report SHA-256 is
  `b0ea2900d39dba2d9553f2923f4a4fa8147c0252f3d9e372b9d21e1e4d6bcca5`,
  and restart frame SHA-256 is
  `6e3feeef0af977c5918d81fe6171d24a31da32e4beae45af62eaa47c2d368ede`.

The evidence directories remain deliberately ignored local material and are
not tracked source changes.

### Accepted seal validation

| Gate | Candidate result |
| --- | --- |
| Full TypeScript regression | 333 files; 4,493 passed, 5 skipped, 0 failed |
| Exact-product GitHub Actions | Run `32435419313` passed every configured gate in 10m54s at TypeScript product `720826bd843995920bb2f219ab21203d236c1879` |
| Bridge aggregate | 67/67 passed across 8 files, including generated drift, attacker boundary, real process restart, checkpoint migration, Movie #2, save/load, stale, duplicate, and deterministic parity coverage |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk-size warnings only |
| TypeScript Movie #2 proof | Passed through Week 22 at digest `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`; save/import/reconnect/headless parity remained exact |
| Browser dependency audit | Passed with 0 browser-runtime vulnerabilities |
| Repository hygiene | Passed across 1,018 repository files |
| Adopted 3D asset audit | Passed; 26 assets, 0 hard violations |
| Deterministic generated contract | Passed; TypeScript golden and Unity copy are byte-identical at the SHA-256 recorded above |
| Unity EditMode | 46/46 passed |
| Native macOS build | Passed; 136,955,718 bytes |
| Fresh native Movie #2 | Passed at Week 22/revision 23/final digest above with exact saved/restored digest, stale retention poll `13 -> 14`, zero outages, and zero torn reads |
| Native engine restart | Passed with a changed runtime instance, stable logical authority tuple, three observed outage polls, disabled actions/retained projection, zero torn reads, byte-identical empty-journal checkpoint, and no capability leakage |
| Native performance | 118.9995 FPS Movie #2 proof; 118.9999 FPS restart proof on Apple M3 Max |
| Scoped repository check | `git diff --check` passed before both product commits and again for this continuity seal |
| Independent P0/P1 review | Two TypeScript P1s were reproduced and fixed: protocol-3 checkpoints initially could not start under protocol 4, and Node header-count truncation could hide a protected tail Origin. Per-launch capability semantics and live log-capture coverage were also corrected. Final HTTP, migration, Unity lifecycle, and documentation audits report no open P0/P1. |

### Honest residuals and visual gate

- Exact in-flight POST recovery is not implemented. If the engine commits a
  command, save, or load and dies before Unity receives the response, Unity
  reconnects safely but does not yet resend the exact original route/body/ID.
- The normal runtime is still a manually coordinated development product. It
  has no supervisor-owned random-port handoff, automatic child restart,
  stale-child cleanup, packaged runtime dependency graph, or owned log
  lifecycle.
- The default `npm run bridge` path remains memory-only unless the caller
  supplies the private durable runtime directory.
- The development bridge still executes through `vite-node`; the green browser
  dependency audit is not a packaged Node runtime dependency audit.
- Evidence contains local absolute screenshot paths inside ignored JSON reports.
  Those reports are deliberately excluded and must not enter a canonical diff.
- No gameplay law, V14 shape, simulation formula, projection content, art,
  camera, material, character, animation, lot layout, HUD composition, or asset
  provenance changed in this checkpoint.

The new captures are operational evidence, not a visual uplift. They remain
visually equivalent to Golden M3: the campus is readable but sparse and distant,
the proof HUD remains intrusive, people and filmmaking activity remain weak,
and the result still reads too much like a handsome diorama. This checkpoint is
below ADR 0006's inhabitable, era-readable, two-scale, production-first visual
acceptance bar.

### Golden and promotion decision

This sealed checkpoint is **NON-GOLDEN**. It materially improves the load-bearing local
runtime and native reconnect behavior, but the mandatory Golden gate still
requires exact in-flight POST recovery and a complete fresh save/load/reconnect
playthrough on the sealed pushed pair. It also provides no visual improvement.
Do not create `golden/unity-convergence-m4`, move CURRENT BEST, or promote either
repository from this bounded checkpoint.

Golden M3 remains CURRENT BEST and promotion status remains
**GOLDEN — CONTINUE CAMPAIGN**. This line may supersede M3 only after the next
retry unit, broad validation on exact committed SHAs, clean pushed trees,
and an explicit overall-product judgment.

### NEXT EXACT ACTION

Retain the exact raw UTF-8 route, body, command ID, session, and expected
revision for one in-flight command/save/load POST; after transport loss, obtain
a compatible `/session` handshake and retry only the byte-identical envelope.
Add a deterministic server proof hook that drops the connection after durable
commit but before response delivery, then prove in the native Unity client that
command, save, and load each return the exact cached response once, never
double-mutate authority, and never retry across a changed logical session.

After that retry unit is sealed, implement the supervisor-owned random-port
launcher, private capability transfer, engine restart/stale-child cleanup, and
owned log lifecycle.

## 2026-08-21 04:52 CEST - Checkpoint 9 sealed: exact ambiguous POST recovery (validated, pushed, non-Golden)

### Exact sealed state

| Side | Branch | Exact pushed product SHA | Parent / post-seal state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `114c99c1c4e5623c5ea3e0c60864faed925fb33e` | Parent `b1738b92bd988bf5535629babb1223903ffad802`; product source clean; branch receives only the containing continuity-document commit after this update |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | Parent `94e8bcac6a5bf94fd70f3f8a61992511230688a2`; clean at exact pushed product SHA |

Both product commits and branch tips are pushed and remotely verified as the
only compatible Checkpoint 9 pair. The TypeScript product commit is
`test(bridge): seal exact in-flight response recovery`; the Unity product commit
is `feat(bridge): recover in-flight actions after engine loss`. The containing
TypeScript continuity-only commit must be the sole descendant of the recorded
product SHA and leave HEAD equal to upstream with a clean tree after push.

Golden M3 remains the sole CURRENT BEST pair: TypeScript
`e9c6f06b717a6a106281b189a61072e35770155f` plus Unity
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`, each preserved by pushed immutable
`golden/unity-convergence-m3`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

The protocol is unchanged at `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The generated TypeScript golden and Unity C# copy remain byte-identical at
SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No schema, DTO, V14 save field, `GameState` member, gameplay rule, permanent ID,
RNG stream, projection content, or simulation authority changed.

### Player and architecture value

Checkpoint 8 safely detected transport loss and refreshed authority but
intentionally did not replay an unresolved POST. That left one P1 failure
window: the TypeScript engine could atomically commit a command, save, or load,
then die before the native client received the response. The player saw an
outage without a reliable action outcome even though the durable journal
already contained the result.

Checkpoint 9 closes that window through a bounded exact-envelope
state machine:

- Unity retains the route, cloned raw UTF-8 body, command ID, originating
  logical session, expected revision, originating revision/week/digest, and
  request SHA-256 before the first send.
- A connection failure or `5xx` marks the result ambiguous and keeps the last
  exact projection visible but noninteractive. Authorization/media failures are
  terminal and never retried.
- Unity performs `/session` first. The exact retained bytes are retried only if
  the logical session is unchanged; session replacement abandons them.
- Reconciliation accepts only a current cached response, the one expected
  first-execution transition, a historical completion behind newer same-session
  authority, or a later `STALE_REVISION` receipt. Regression, same-revision
  digest/week conflict, command/session mismatch, an advance beyond one expected
  transition, or a non-stale rejection after authority advanced fails loudly.
- Completion is not published until a new `/session` plus `/snapshot` join
  establishes current authority. The client never reconstructs an intent from
  presentation state and never interprets a gameplay formula.

TypeScript adds a narrow deterministic acceptance seam after the queued runtime
coordinator has atomically stored a first-seen accepted response but before the
HTTP response begins. It is available only with `NODE_ENV=test`, a private
durable runtime directory, and one canonical closed environment plan. The plan
is deleted before runtime state opens. The gate hashes exact received bytes,
flushes one canonical post-commit marker, and either holds for external
`SIGKILL` or drops the response. Exact replay emits a separate marker and cannot
rearm the one-shot failure. The production path receives a disabled no-op gate.

A standalone TypeScript verifier now cross-checks the Unity report, all commit
and replay markers, the four-process topology, and the exact three-entry durable
journal. It rejects semantic-but-byte-different requests, forged response
hashes, partial/unterminated/noncanonical lines, duplicate or missing routes,
extra durable authority, and revision/digest/session contradictions.

### Sealed product diff

TypeScript product files in `114c99c1c4e5623c5ea3e0c60864faed925fb33e`:

- `bridge/server.ts`
- `bridge/testing/in-flight-evidence-verifier.ts` (new)
- `bridge/testing/post-commit-response-gate.ts` (new)
- `package.json`
- `scripts/verify-bridge-inflight-evidence.ts` (new)
- `tests/bridge-inflight-evidence-verifier.test.ts` (new)
- `tests/bridge-process-restart.test.ts`

Unity product files in `6b32335447848ed0680eb8077e78ee36aded5d56`:

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs` (new)
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs.meta` (new)
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeTransport.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeProofRunner.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs` (new)
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs.meta` (new)

Generated contract/data paths are untouched. This ledger, the handoff, and the
promotion register are the only continuity changes after the product commit and
belong in the containing docs-only seal rather than being mistaken for product
source.

### Deterministic test and evidence design

The native proof uses three explicit bounded command IDs and the first legal
intent offered by current TypeScript truth. For each route, an external harness
starts an engine against the same capability/runtime root, waits for the flushed
post-commit marker, kills that engine before response delivery, leaves the
native client long enough to observe the outage/paused exact projection, then
starts the next engine. The fourth engine delivers the cached load response.

The proof requires:

- one unchanged logical session across four TypeScript process incarnations;
- three runtime replacements and at least three observed outage polls;
- exactly three retries and exactly three recovered receipts;
- command revision `0 -> 1` with a changed digest;
- save revision `1 -> 1` with no state mutation and an exact saved digest;
- load revision `1 -> 2` with current/restored digest equal to saved truth;
- exactly ordered `command`, `save`, and `load` journal entries, each appearing
  once;
- exact request and response byte hashes across the server commit marker,
  server replay marker, Unity receipt, and checkpoint journal;
- retained last projection, disabled actions during each outage, no torn read,
  and a fresh joined projection before completion.

The first native attempt at
`Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021103Z/` failed before a
POST because the proof harness incorrectly required a hardcoded `advance-week`
intent that TypeScript did not offer. It left revision 0 and an empty journal;
report SHA-256 is
`a2bc3ae4e3d41416d1bdb943d0d793e90f2de4ec9ceba167368747c854511e50`,
checkpoint SHA-256 is
`e545a32350ec3875906c8a3fab803d10bbc6525a4dbffd6a1225066170fa0185`,
and a stale local lock remains in that ignored evidence root. This was a harness
assumption, not a gameplay/runtime regression. It is superseded and must not be
reused as evidence or as a runtime root. The final harness selects a real
authoritative `availableIntents` entry.

### Accepted native in-flight result

Final accepted root:
`Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021520Z/`.

- Unity proof status `complete`; report SHA-256
  `b6d9dcb95686d32c24690d1136899b8b195204b57350267263ce5141fea2ff77`.
- Independent verifier receipt SHA-256
  `20f3ec25f3fe3724c5b35c39c4f4f79a199a2aa309da2a3816654071f7235403`.
- Recovery capture SHA-256
  `9621d7ab21196465cb684b5e3879419af0da1d15c02a0cb82fe8c05edd17cc9a`.
- Same session `efcd5d93-7a62-48dc-bb70-1969d48fa617`; runtime replacements 3;
  outage polls 10; retry count 3; recovered count 3; torn reads 0.
- Initial revision/digest: `0` /
  `3517604efca1c48a54732d9799b6a73ffa9ab99f26e0e28d54bdbac010af1109`.
- Final revision/current/saved/restored digest: `2` /
  `141f95a8222cee274d913eb0d68ad6f461f4e2f35f6f49c4fc71c08cfb4992b5`.
- Runtime checkpoint: 897,790 bytes, exactly three journal entries, SHA-256
  `3bcbc4009efe5a5f1de972862a233118dd7b93aacc3b2f97f3df0cc23cebe1ff`.
- Command request/response SHA-256:
  `a302afc7bd8db68900efe59a3d009ec47d6d5dee591926d427eca263adedc71e` /
  `8bbb6fe08b737d376237f51ee885ac5a13b66a86c80f728d61ed94486e3cbc04`.
- Save request/response SHA-256:
  `529c126786ef68600a144baf6d376f00ca9872e5b7659b56d78cc97571a7b912` /
  `0575b464007fe0220c5eab77fb9de0483166ef7e4295228a2086190895d22199`.
- Load request/response SHA-256:
  `03b3088424a495765c419f6fa5c6c50a89d763004e9dda21098d8e50c3b9b433` /
  `88a2e7867ad266a23ac617c55a3251fe8cca9188c9388c13e33f7f8b7dda8c7b`.
- Native sample: 119.1992 FPS, 15,251-byte snapshot, 17.7425 ms TypeScript
  serialization, 4.2764 ms client parse, 0.2595 ms apply, and 24.3448 ms sampled
  command round trip.

### Regression evidence

Fresh Movie #2 regression root:
`Evidence/B/Checkpoint9-Movie2-Regression-Protocol4-20260821T022838Z/`.

- `The Reluctant Cornerstone`, `script-0001`, `prod-0013` released at Week 22,
  revision 23, final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Saved/restored digest remained exactly
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- `STALE_REVISION` guidance remained bound across poll 11 to poll 12.
- Report SHA-256
  `b25f679d2470c8e4ee642770b36738e38f247ee438008c780c16835257a186b9`;
  released frame SHA-256
  `e971426cd59aaa3cb2dca144e3bb9726291aa0c434d2276c37c16891861d93ef`.
- Runtime checkpoint: 1,354,916 bytes, revision 23, 25 journal entries,
  SHA-256
  `724f824b5399c2f91008fd9cb8dec6840dbb55d70304615977ad7d7242892dda`.
- Native sample: 119.9976 FPS, 15,394-byte snapshot, 19.4043 ms TypeScript
  serialization, 4.2752 ms parse, 0.2963 ms apply, and 33.0938 ms command RTT.

Idle engine-restart regression root:
`Evidence/B/Checkpoint9-Runtime-Restart-Regression-Protocol4-20260821T022933Z/`.

- Session `7c131fbf-292d-4df0-a01e-80ce811c039b`, revision 0, Week 11, and digest
  `3517604efca1c48a54732d9799b6a73ffa9ab99f26e0e28d54bdbac010af1109`
  remained exact while runtime identity changed once.
- Unity recorded 3 outage polls, retained exact projection, disabled/restored
  actions, and observed zero torn reads.
- Report SHA-256
  `cebc3c4d7599101c10ee7748205b2629b73cb36621f7b23a4fe969e4e5d7afeb`;
  ready-record SHA-256
  `6f26768239e8dbf965601377cbbbdfd1036b4d3993874aabc66d55de527e3f5f`;
  frame SHA-256
  `8ea7fb50a531bce9e21a5ebad132f8953caae2c009a26665faef88ee55f68344`.
- Empty-journal checkpoint: 266,526 bytes, SHA-256
  `19cef726bf977c538904fa8ddc6f48f0fdc61f5a17e9122eee76454463dc05fc`.
- Native sample: 118.9989 FPS.

### Accepted seal validation

| Gate | Result |
| --- | --- |
| Full TypeScript regression | 334 files; 4,510 passed, 5 skipped, 0 failed |
| Bridge aggregate | 84/84 across 9 files |
| Evidence verifier tests | 8/8 |
| Both TypeScript typechecks | Passed |
| Production build | Passed with inherited Vite chunk warnings only |
| Generated drift | Passed; protocol/schema/generated identities unchanged |
| Movie #2 and determinism proof | Passed exact release, V14 save/import/headless parity, stale/duplicate protection, and polling neutrality |
| Browser runtime dependency audit | Passed: 0 vulnerabilities |
| Repository hygiene | Passed: 1,022 files |
| Adopted 3D asset audit | Passed: 26 assets, 0 hard violations |
| Unity EditMode | 62/62 passed; `/tmp/studio-b9-editmode-proof-fix.xml` |
| Native macOS build | Passed; 136,980,022 aggregate file bytes; `/tmp/studio-b9-native-build-proof-fix.log` |
| Native in-flight response loss | Passed three actual engine kills plus exact journal/marker/report verification |
| Native Movie #2 regression | Passed fresh through release with exact save/load and retained stale guidance |
| Native idle restart regression | Passed actual outage/replacement with stable logical authority |
| Exact-product GitHub CI | Passed every Bridge contract workflow step for TypeScript `114c99c1c4e5623c5ea3e0c60864faed925fb33e`; run `32441324305`, 11m17s |
| `git diff --check` | Passed in both worktrees before continuity edits |
| Independent P0/P1 audit | No remaining P0/P1 after fixing split-marker parsing and advanced-authority rejection handling |

### Honest residuals and visual gate

- The default developer experience remains manual. There is no one-command
  supervisor owning a private runtime root, random loopback port, capability
  environment handoff, health readiness, engine restart, stale cleanup,
  graceful shutdown, or bounded logs.
- Development still executes through `vite-node`; the emitted/pinned production
  runtime graph and its direct dependency audit remain future work.
- Exact pending-POST recovery is committed and pushed as the exact product pair
  recorded above. Product source is clean; the containing docs-only seal does
  not change those product SHAs.
- Current evidence JSON contains local absolute screenshot paths and remains
  ignored; no evidence/build/log/runtime/lock file may enter Git.
- Visual output is unchanged. Inspection of
  `14-in-flight-post-recovered.png` still shows an elevated sparse diorama with
  a large generic proof HUD, small role-unreadable people, flat materials, and
  little visible filmmaking. It remains below ADR 0006's inhabitable,
  era-readable, two-scale production-client gate.

### Golden and promotion decision

Checkpoint 9 is **NON-GOLDEN**. It is a material, well-evidenced, and remotely
recoverable functional improvement over sealed Checkpoint 8, but the default
one-command lifecycle and visual recognizability gate remain incomplete.

Do not create `golden/unity-convergence-m4`, move CURRENT BEST, or promote either
repository from this checkpoint. Golden M3 remains CURRENT BEST and promotion
status remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

### NEXT EXACT ACTION

After the containing continuity-only update is committed/pushed and both trees
are confirmed clean, implement a one-command developer launcher/supervisor with
a private per-launch durable root, random loopback port, environment-only
capability handoff, authenticated
health readiness, owned engine restart, stale process/lock cleanup, graceful
Unity/engine shutdown, and bounded secret-free logs. Integrate and prove the
current exact pending-POST retry through that supervised lifecycle.

## 2026-08-21 06:07 CEST - Checkpoint 10 pre-commit: one-command supervised product lifecycle (Golden M4 candidate)

### Exact pre-commit state

| Side | Branch | Exact state | Push/working-tree state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | Dirty Checkpoint 10 candidate atop parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3` | Parent equals configured upstream and is pushed; candidate source/docs/tests have no commit or remote SHA yet |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | Clean; local HEAD equals configured upstream and is pushed |

Golden M3 remains the sole CURRENT BEST pair: TypeScript
`e9c6f06b717a6a106281b189a61072e35770155f` plus Unity
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`, each preserved by the pushed
immutable `golden/unity-convergence-m3` tag. Checkpoint 10 is a **Golden M4
candidate**, not a Golden declaration: its exact product SHA, remote branch
ref, Linux CI, clean-tree result, and M4 tags do not exist yet. Promotion status
remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

The bridge contract is unchanged at protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated C# copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No protocol/schema, generated DTO, projection content, `GameState`, V14 save,
gameplay formula, legality, construction, economy, identity, RNG, art, or asset
changed. TypeScript remains the sole simulation authority.

### Product and architecture value

Checkpoints 7 through 9 established atomic durable authority, authenticated
session-first reconnect, and byte-identical retry after command/save/load was
committed but its response was lost. The remaining player/developer gap was
lifecycle ownership: the caller still had to create and secure the capability
and runtime root, choose the port, coordinate two processes, restart the engine,
and clean children/logs.

Checkpoint 10 supplies one TypeScript-owned development product entry point:

- `npm run studio` owns the engine and Unity native executable as direct
  `shell:false` children with minimal allowlisted environments.
- One stable current-user-private profile preserves current and explicitly
  saved V14 authority, logical session/revision, and exact replay journal across
  full product exits.
- Every full launch gets a new random 32-byte base64url capability kept only in
  supervisor memory and the two child environments, plus a separate private
  launch/log directory.
- The initial engine requests loopback port `0`; a strict complete live line and
  authenticated schema-valid `/health` response establish readiness before
  Unity starts. Replacements reuse the pinned port, stable profile, and only
  that launch's capability.
- Strict `0600` leases bind supervisor, engine, and Unity PID to process
  incarnation and process group. Acquisition rejects live/concurrent,
  unverifiable, corrupt, oversized, wrong-owner, wrong-mode, and symlink state.
  Stale cleanup acts only after exact ownership verification.
- Startup rollback, `SIGINT`/`SIGTERM`/`SIGHUP`, Unity exit, engine crash,
  restart failure, and fatal supervisor error drive bounded owned group cleanup.
  The owner lease remains recoverable rather than being erased if a child may
  still survive.
- Supervisor, engine, and Unity logs are `0600`, line-aware, redact an exact
  capability even across split chunks, stop at 2 MiB each, and remain under a
  five-launch/32 MiB retention ceiling.
- A cross-platform process-incarnation helper now serves both the existing
  bridge checkpoint lock and the new supervisor lease, removing duplicated
  process identity code without changing checkpoint semantics.
- Accepted ADR 0008 records the stable-profile/per-launch-capability boundary,
  direct child ownership, ephemeral-then-pinned port behavior, and the explicit
  `vite-node` development packaging boundary.

This closes the bounded development lifecycle. It does not claim installer,
public packaging, update, profile-backup, or emitted runtime dependency
completion.

### Candidate source and documentation

Modified candidate files:

- `BRIDGE-README.md`
- `SECURITY.md`
- `bridge/runtime/checkpoint-store.ts`
- `docs/adr/README.md`
- `package.json`
- `tests/bridge-checkpoint-store.test.ts`

New candidate files:

- `bridge/runtime/process-incarnation.ts`
- `bridge/supervisor/bounded-log.ts`
- `bridge/supervisor/cli.ts`
- `bridge/supervisor/config.ts`
- `bridge/supervisor/lease.ts`
- `bridge/supervisor/supervisor.ts`
- `docs/adr/0008-supervise-the-local-product-lifecycle.md`
- `tests/bridge-process-incarnation.test.ts`
- `tests/bridge-supervisor.test.ts`
- `tests/fixtures/fake-unity-supervisor.mjs`

The ledger, current handoff, and promotion register are the only campaign
continuity files changed by this pre-commit update. Unity source is unchanged.

### Test design and validation

The focused supervisor suite covers fail-closed config, missing/ambiguous Unity
selection, controlled argument rejection, stable profile persistence, fresh
capability rotation, inherited secret scrubbing, capability redaction across
split log chunks, unauthenticated health rejection, authenticated health,
random first port, fixed-port replacement, signal cleanup, stale-incarnation
reclaim, concurrent-owner rejection, startup rollback, crash-budget exhaustion,
unrelated-process isolation, process-group cleanup, private modes, bounded logs,
and retention. The fake Unity fixture observes the endpoint/environment boundary
without becoming gameplay authority.

Latest candidate validation:

| Gate | Result |
| --- | --- |
| Full TypeScript regression | Passed: 336 files; 4,523 passed, 5 skipped, 0 failed |
| Bridge aggregate | Passed: 97/97 across 11 files |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed with inherited Vite chunk-size warnings only |
| Generated drift | Passed; contract/generated identities unchanged |
| Movie #2/determinism proof | Passed fresh release, exact V14 export/import/headless parity, stale/duplicate protection, and polling neutrality |
| Browser production dependency audit | Passed: 0 vulnerabilities |
| Full `npm audit` | 5 development-graph advisories: 3 moderate, 1 high, 1 critical; documented `vite-node` runtime boundary remains open |
| Repository hygiene | Passed: 1,032 files |
| Adopted 3D assets | Passed: 26 assets, 0 hard violations |
| Unity EditMode | Passed: 62/62; `/tmp/studio-b10-golden-editmode.xml` |
| Native macOS build | Existing compatible app passed/launched; 136,980,022 aggregate file bytes |
| Native supervised Movie #2 | Passed fresh construction, full Movie #2, exact save/load, retained stale rejection, and release |
| Full-client reconnect | Passed twice from one stable profile with exact logical authority |
| Automatic engine restart | Passed one actual replacement on the pinned port; outage/paused actions/retained projection/rejoin all observed; zero torn reads |
| Independent runtime audit | No open P0/P1 finding after ownership, rollback, health, group-cleanup, restart-budget, and log fixes |

The Linux `flock` owner-lock path still awaits exact-product CI. Therefore this
is not yet the remote Golden seal.

### Native supervised proof

Accepted evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

Fresh Movie #2 completed as `The Reluctant Cornerstone`, `script-0001`,
`prod-0013` at Week 22/revision 23. Final digest is
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
saved/restored digest is
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
Report SHA-256 is
`126152d4f91f64800ec6f88f22831cc6c0b297f3d97e9898ed5ef95c7db72f0e`.
The overview, construction, and released frames have SHA-256
`7a2c79e7355b411890241511e611f4049f6ce1dde9f856c9a62fc6ef534efef2`,
`405afbef4c5308235c0add108d7883aa912212cd36ca77ecfb0c5e6eb373e6b1`,
and `d6fdf5d26598d968906d19d0bec4d3e7a646415d2e5279b9c4ef6eda2add8a12`.
Native sample: 119.3772 FPS, 15,394-byte snapshot, 21.4668 ms TypeScript
serialization, 4.2044 ms parse, 0.3109 ms apply, and 24.8510 ms command RTT on
the Apple M3 Max reference.

Two later full-client launches recovered the same session, revision, week, and
final digest from the same profile. The final accepted reconnect report/frame
SHA-256 values are
`128fa7b1c58db4541b9c87bd9e3bca3bcefed16219edb61362ba1642bd92a050` /
`b1098fce189ca5f32a072e8c7c464274c329ee4d944ccf561b67c5f3f922fee3`;
sample 119.1999 FPS.

The accepted automatic replacement under `RuntimeRestart2/` observed one
outage, disabled actions, retained the exact projection, changed runtime
identity once, kept logical authority exact, and recorded zero torn reads.
Report/ready/frame SHA-256 values are
`65e4be5b7f2ef0bf0bc82432dad45b4212cd21ef9bcc555e75cb90fe6ce4087c` /
`eaeacbcfc155abb977c19c92b21750bbf2bab532acd814e31c4a8c5399952c1c` /
`171306b2701401a38464353f31a0ccd969caf2858bafdf245421ed89b5a740fe`;
sample 119.5948 FPS.

The stable local profile is
`/private/tmp/project-studio-b10-supervisor-native-20260821T035727Z/`.
Its final `bridge-runtime-v1.json` is 1,354,928 bytes, has SHA-256
`e6907ff5fe552cdc2c1f138458b93d4c2ec50bea4cc9cb4b173514c4fb8ed48c`,
retains session `864b0fee-00a3-49bb-9442-72b565410c73`, revision 23, exactly 25
journal entries, and journal digest
`e926f7e4a75b971303c9324fbbfc30d588bfca0af8a5cf7249b3b1aaeb3b5407`.
Five launch directories remain under the intended retention bound. Private
modes are exact, the active lease is absent after shutdown, and every recorded
launch ends with `cleanup complete`.

### Superseded evidence and honest residuals

- The first `RuntimeRestart/` attempt is invalid. The operator killed outside
  the proof's actual wait window, so Unity timed out with `Unity did not observe
  the TypeScript engine outage.` The report/ready hashes are
  `37a7dc93035a910c625a774a418525ab443ac8fe0e084985e45b06426a8a1b99` /
  `6de34f15b9f12da345cbaa9441fef658b8e30c68a967fd2e870aa5c8b748b63f`.
  Authority stayed exact. `RuntimeRestart2/` supersedes it; never cite the first
  directory as accepted proof or repeat its operator-timeout sequence.
- P2 proof reporting quirk: accepted `RuntimeRestart2` has
  `exactMovie2Released: false` because the restart-only harness does not
  populate the unrelated title/project/production fields. Its milestone still
  contains the exact released projection and all restart invariants pass. Do
  not mutate gameplay or weaken the restart proof to satisfy that convenience
  field.
- P2 portability gap: Linux `flock` remains to be confirmed by exact-product
  CI. Never replace lock/incarnation/group ownership with name-, port-, or
  PID-only guessing.
- P2 packaging boundary: `npm run studio` still executes the pinned
  development `vite-node` graph. Full `npm audit` finds 5 dev-graph advisories.
  Do not force-upgrade, suppress, or claim the clean browser audit covers the
  local engine runtime.
- Existing campaign-level P1 visual mismatch remains unchanged. Inspection of
  the accepted frames shows a sparse elevated diorama, oversized generic HUD,
  flat materials, small role-unreadable people, little visible filmmaking, and
  no convincing human-scale inspection view. It remains below ADR 0006.
- Evidence JSON embeds local absolute screenshot paths. The entire evidence
  root, proof profile, app build, `/tmp` test outputs, logs, and leases remain
  ignored/local and must not enter Git.

### Golden candidate decision and next work

Checkpoint 10 materially improves the overall playable product and is the
candidate for Golden M4 because it accumulates durable authority, exact retry,
Movie #2, save/load/reconnect, and the first one-command owned lifecycle. It
does **not** supersede M3 before the exact product commit is pushed, Linux CI is
green, both worktrees are clean, and immutable M4 tags are created/verified in
both repositories.

Do not tag the dirty tree and do not move CURRENT BEST in the promotion
register yet. After the product seal, the next exact engineering action is:

**Implement a visible vertical slice combining schema-backed stable Stage 7/Admin
location IDs with a Cinemachine management-to-inspection click focus transition,
then capture before/after evidence at both camera scales.**

Ordered work after that:

1. Build Hero Stage 7 into a visibly operating filmmaking environment.
2. Improve human proportions, role readability, animation, purposeful movement,
   and 25/50/100-person scalability evidence.
3. Package the TypeScript runtime and define/audit its emitted dependency graph.
4. Productionize direct lot construction placement, selection, and inspection.

## 2026-08-21 06:57 CEST - Golden M4 sealed: supervised durable product lifecycle

### Exact Golden state

| Side | Repository / branch | Golden product SHA | Parent / tag / push state |
| --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` / `campaign/unity-production-convergence-80h-ts` | `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` | Direct parent `e6421dcd51c7b64071b8be227f0950129634ff35`; implementation commit parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; pushed annotated `golden/unity-convergence-m4` remotely dereferences to this SHA |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` / `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | Direct parent `94e8bcac6a5bf94fd70f3f8a61992511230688a2`; branch clean/pushed; annotated `golden/unity-convergence-m4` remotely dereferences to this SHA |

Both branch tips were pushed and upstream-equal with clean tracked trees before
this continuity-only seal. The containing TypeScript documentation commit will
be the sole descendant of Golden product `11e2cf88...`; after push, local HEAD
must equal configured upstream and the tracked tree must again be clean. Unity
remains clean at exact Golden `6b323354...`.

All M1, M2, and M3 annotated tags remain immutable and pushed in both
repositories. No historical tag moved or was deleted.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**.

M4 is not canonical and is not ready for canonical merge review. It is the sole
CURRENT BEST compatible pair and the exact answer to “what should we build from
next?”

### Why M4 supersedes M3

M4 preserves M3's Movie #2, deterministic V14, queue-law parity, structured
rejections, and native client floor, then accumulates the missing durable local
product lifecycle:

- Checkpoint 8 established the authenticated capability boundary, durable
  current/saved authority, stable logical session, and safe engine restart;
- Checkpoint 9 established byte-identical retry of a committed-but-unanswered
  command/save/load through an exact durable request/response journal;
- Checkpoint 10 established one TypeScript-owned product entry point with a
  stable private profile, fresh per-launch capability, random first/pinned
  replacement port, authenticated readiness, direct engine/Unity children,
  PID-incarnation/process-group leases, stale cleanup, restart budget, graceful
  shutdown, bounded redacted logs, and automatic engine replacement;
- final exact-product Linux CI proved the supervisor and `flock` owner-lock path
  on the tagged TypeScript product SHA.

No schema, generated DTO, projection, `GameState`, V14 save field, gameplay
formula, legality, economy/construction rule, permanent identity, RNG stream,
art, asset, or Three.js regression oracle changed during the seal. TypeScript
remains sole simulation authority.

### Commit and CI seal trail

1. Implementation commit `e6421dcd51c7b64071b8be227f0950129634ff35`
   (`feat(runtime): supervise the local Unity product lifecycle`) was pushed on
   parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`.
2. First exact-product Bridge contract run `32446759604` failed in `Test
   application` at `tests/bridge-supervisor.test.ts:758`. A broad PID matcher
   counted the true publication and legitimate Linux
   `cleanup engine pid=8399`, receiving `[8399, 8399]`. All earlier gates,
   including bridge 97/97 and the Linux supervisor path, passed. No second
   engine spawn and no product P0/P1 was reproduced.
3. Direct child `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`
   (`test(runtime): classify engine publications exactly`) changed only the
   supervisor test and the interruption handoff. It parses exact publication
   lines and covers synthetic cleanup, unpublished/reused PIDs, a genuine
   second publication, and the race-correct cleanup of a replacement published
   before the Unity-exit boundary. Runtime product source did not change.
4. Final exact-product run `32447981439` passed every Bridge contract workflow
   step at `11e2cf88...` in 12m27s. This supersedes the failed first run as the
   accepted seal evidence.
5. Annotated `golden/unity-convergence-m4` tags were pushed and remotely
   verified at the exact TypeScript/Unity pair above.

### Phase status after seal

| Phase / scope | Status | Exact result / remaining work |
| --- | --- | --- |
| Setup and authority baseline | Complete | Frozen authorities, two-repository law, campaign branches, M1-M4 recovery tags, TypeScript-only simulation authority |
| Phase A contract/client convergence | Complete for current slice | Generated contract, named projections, queue-law parity, structured rejection guidance |
| Phase B durable development lifecycle | **Complete and Golden** | Atomic durable authority, authenticated restart, exact pending-POST replay, stable-profile one-command supervisor, Linux owner-lock validation |
| Phase B production packaging | **Partial** | Emitted runtime, installer/update, profile backup UX, and direct emitted dependency audit remain open; current `vite-node` dev graph has five advisories |
| Visual recognizability / camera | Partial and below acceptance | ADR 0006 two-scale inhabitable studio gate remains unmet; Stage 7/Admin focus slice is next |
| Production activity / people / construction polish | Inherited partial | Filmmaking readability, human proportions/roles, scale evidence, and direct placement/inspection remain open |
| Canonical promotion | Not ready | Visual gate, production packaging/audit, and TypeScript-main semantic mega-diff reconciliation remain blockers |

### Accepted validation

| Gate | Golden M4 result |
| --- | --- |
| Exact-product GitHub CI | Passed run `32447981439` at `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`; 12m27s; every workflow step green |
| Full TypeScript regression | 336 files; 4,524 passed, 5 skipped, 0 failed |
| Bridge aggregate | 98/98 across 11 files, including exact publication and Linux supervisor/`flock` paths |
| Typechecks / production build | Bridge and application typechecks passed; build passed with inherited Vite chunk warnings |
| Generated drift / authority | Protocol `4`, projection `4`, schema and generated C# identity passed; TypeScript remains sole simulation authority |
| Movie #2 / determinism | Fresh release, V14 export/import/headless parity, stale/duplicate protection, polling neutrality, exact save/load passed |
| Browser dependencies / hygiene / assets | Browser runtime audit 0; repository hygiene passed; 26 adopted 3D assets, 0 hard violations |
| Full development dependency audit | Five advisories remain: 3 moderate, 1 high, 1 critical; documented packaging blocker, not hidden by the browser audit |
| Unity EditMode | 62/62 passed; `/tmp/studio-b10-golden-editmode.xml` |
| Native macOS build | Passed/launched; 136,980,022 aggregate file bytes; executable 116,116 bytes |
| Native supervised Movie #2 | Passed fresh construction through release; 119.3772 FPS |
| Full-client reconnect | Passed twice with exact session/revision/week/digests; final sample 119.1999 FPS |
| Automatic engine replacement | Passed actual kill/replacement on pinned port; outage and disabled actions observed, projection retained, zero torn reads; 119.5948 FPS |
| Independent runtime audit | No open product P0/P1 regression after final test repair and Linux CI |
| Git recovery | Both product branches and both annotated M4 tags pushed; remote tag dereferences match the exact compatible pair |

### Movie #2 and native evidence

Accepted evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

- `The Reluctant Cornerstone`, `script-0001`, `prod-0013` released at Week 22,
  revision 23, final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Saved/restored digest remained
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Movie #2 report/released frame SHA-256:
  `126152d4f91f64800ec6f88f22831cc6c0b297f3d97e9898ed5ef95c7db72f0e` /
  `d6fdf5d26598d968906d19d0bec4d3e7a646415d2e5279b9c4ef6eda2add8a12`.
- Final reconnect report/frame SHA-256:
  `128fa7b1c58db4541b9c87bd9e3bca3bcefed16219edb61362ba1642bd92a050` /
  `b1098fce189ca5f32a072e8c7c464274c329ee4d944ccf561b67c5f3f922fee3`.
- Accepted restart report/ready/frame SHA-256:
  `65e4be5b7f2ef0bf0bc82432dad45b4212cd21ef9bcc555e75cb90fe6ce4087c` /
  `eaeacbcfc155abb977c19c92b21750bbf2bab532acd814e31c4a8c5399952c1c` /
  `171306b2701401a38464353f31a0ccd969caf2858bafdf245421ed89b5a740fe`.
- Stable private checkpoint: 1,354,928 bytes, 25 journal entries, SHA-256
  `e6907ff5fe552cdc2c1f138458b93d4c2ec50bea4cc9cb4b173514c4fb8ed48c`.

### Launch

Rebuild the ignored compatible native app only when absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-golden-m4-native-build.log \
  -quit
```

One-command product launch:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

### Honest visual and promotion decision

No visual uplift is claimed for M4. The accepted overview, construction,
production, release, reconnect, and restart captures still read as a sparse
elevated diorama with an oversized generic HUD, flat materials, small
role-unreadable people, weak filmmaking activity, and no convincing human-scale
inspection view. ADR 0006 and the visual-fidelity ruling remain unmet.

Canonical promotion is deliberately rejected at this checkpoint because:

- the visual/two-scale camera gate is still a campaign-level P1;
- `npm run studio` remains on the pinned `vite-node` development graph with five
  audit advisories and no emitted production package boundary;
- TypeScript `main` has a semantic mega-diff from the campaign line and has not
  been reconciled/tested as an actual merge candidate.

Golden M4 is therefore CURRENT BEST with promotion status exactly
**GOLDEN — CONTINUE CAMPAIGN**, not canonical and not ready for canonical merge
review.

### NEXT EXACT ACTION

Implement schema-backed stable Stage 7/Admin location IDs plus a Cinemachine
management-to-inspection click focus transition, then capture before/after
evidence at both camera scales.

Ordered work after that:

1. Turn Hero Stage 7 into a visibly operating filmmaking environment.
2. Improve human proportions, role readability, animation, purposeful movement,
   and 25/50/100-person scalability evidence.
3. Package the TypeScript runtime and define/audit its emitted dependency graph.
4. Productionize direct lot construction placement, selection, and inspection.

## 2026-08-21 08:50 CEST - Checkpoint 11 pushed: authoritative two-scale studio inspection (non-Golden)

### Exact pushed product state

| Component | Branch | Exact product SHA | Direct parent |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `014f7ef94e085222bf375b9457a6b15420fa314c` | `db03bd8400e79822262a17ba73b0a4c829dc91ff` |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `5c8a0eee7fa16bb9fd486fb61707230b208330d6` | `6b32335447848ed0680eb8077e78ee36aded5d56` |

Both product commits are pushed on their configured campaign branches. They are
the only compatible Checkpoint 11 product pair. Neither commit is tagged,
Golden, canonical, or CURRENT BEST.

Golden M4 remains the sole CURRENT BEST pair and immutable recovery authority:
TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, each under the pushed annotated
tag `golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. Do not create or move M5 from this checkpoint.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The checked-in TypeScript and Unity generated C# DTO copies remain
byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
There is no schema, V14, `GameState`, gameplay-formula, RNG, or authority move.

Exact-product GitHub Actions run `32454923261` passed every workflow step at
TypeScript `014f7ef94e085222bf375b9457a6b15420fa314c` in 12m12s, including
bridge/full tests, typechecks, production build, hygiene, and adopted assets.

### Authoritative location and placement identity

Checkpoint 11 first closes the identity prerequisite for camera focus rather
than inferring a Unity location from display labels or facility IDs:

- `lot.property.buildings[].id` is the sole physical presentation namespace;
  canonical bodies include `admin`, `stage-a`, `stage-b`, and `post`.
- Every stage building ID, active-production stage ID, and production-operation
  `locationBuildingId` resolves exactly once to that physical namespace.
- Facility IDs remain operational identities. They are never substituted for a
  physical building ID, and an unknown or ambiguous join fails closed instead
  of silently selecting Administration.
- A non-expansion placement joins by authoritative `placedFacilityId`; placement
  `1` for `facility-scenery-shop-1` resolves to physical body `placed-1`.
  `expansion` remains the documented lot-only parcel exception with no property
  body.
- Unity indexes physical locations only through explicit
  `StudioLocationBinding`. This prevents heterogeneous selectable/facility IDs
  from colliding and prevents stale authored construction bodies from surviving
  a missing authority join.
- TypeScript product `014f7ef9...` changes only the bridge-schema regression
  test. It pins these already-authoritative projection-v4 invariants through a
  real construction placement and the Stage 7 Movie #2 operation.

### Coherent two-scale camera slice

Unity product `5c8a0eee...` implements the first bounded management/inspection
slice on the current M4 baseline rather than merging stale PR #5 code:

- A Cinemachine 3.1.7 brain blends for `0.85` seconds between an elevated
  management camera and an authored human-scale inspection camera.
- The management home pose targets `(1, 3, 4)` from
  `(-65.419174, 115.43302, -79.50034)` at 36-degree FOV. Stage 7 targets
  `(48, 2.2, 36)` from `(52.5, 5.3, 12)` at 43-degree FOV; Administration
  targets `(-55, 3.2, -32)` from `(-41, 5.5, -48)` at 44-degree FOV.
- Cinemachine deocclusion preserves camera height with a `0.42` camera radius,
  `1.25` minimum target distance, and a mask that excludes selection proxies.
- One immutable mouse/touch sample per frame drives selection and both camera
  scales. The input path checks EventSystem, every active touch, the bridge
  panel, and the Back control, and latches a UI-owned gesture until all pointers
  release. A stationary startup cursor at the screen edge cannot pan the lot.
- Double activation enters or exits the same target. `BACK TO STUDIO` is always
  visible in inspection with a 220x56 hit area; Escape and Home also return.
  Management input and the prior workflow-panel visibility are restored.
- Camera focus is presentation-only. It emits no bridge POST and cannot mutate
  TypeScript authority. Selection remains stable through the return transition.
- The canonical scene was regenerated and validation now requires exact
  Stage 7/Admin location bindings, the two-camera rig, selection-layer
  isolation, and no invented facility-prefixed physical binding.

### Accepted validation

| Gate | Checkpoint 11 result |
| --- | --- |
| Full TypeScript suite | Passed: 336 files; 4,525 passed; 5 skipped; 0 failed |
| Bridge aggregate | Passed: 99/99 |
| TypeScript checks/build | Full and bridge typechecks passed; production build passed |
| Dependency/hygiene/assets | Browser runtime audit 0; repository hygiene 1,032 files; 26 adopted 3D assets with 0 hard violations |
| Unity EditMode | Passed 86/86 |
| Canonical scene validation | Passed: 32 people, 10 vehicles, 18 equipment objects, 4 capture anchors, 0 errors, 0 warnings |
| Native macOS build | Passed; aggregate file bytes `137037930` |
| Exact-product CI | Passed run `32454923261` at `014f7ef94e085222bf375b9457a6b15420fa314c`; 12m12s; every workflow step green |

### Native two-scale evidence

Accepted 1440x900 evidence:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Final-20260821T060033Z/`.

- Report SHA-256:
  `249c812d2279dd762ffc1f04efc80e08ebf7ee7597b2c12cc11b43e5a1afe912`.
- Management / Stage 7 / Administration / management-return frame SHA-256:
  `b557f2feeb57b4c5061fb138f904a3e83a780a5021101f13ba9a17bfd1e0f546`,
  `a682901c243e17460a626f041ef347a557bf91c16c21eb01f5f73442aa0bf242`,
  `476ae54561ea4d55b55167136601858c5fb0bf9312c29635e73f72ab9b525722`,
  `df8e8d166499e17dbf5a5a76314a843b2e803f33f60e487db99bdf85f726a02d`.
- All four mode changes blend and settle. The Back path restores management
  mode/input/panel, hides itself, and preserves Stage 7 selection.
- A synthetic invisible Default-layer obstruction displaces the inspection
  camera `8.6125526` metres without overlap, then recovers to the authored pose
  within `4.7683716e-7` metres after removal with clear spherecasts.
- The shooting authority is byte-stable before/after at session
  `camera-native-shooting-v1`, revision `12`, week `17`, digest
  `eeef141cbebfab95bbcbbcee55b67473e3b07d26507c7f111e7bf4ab3c65f521`;
  no bridge POST is observed. Samples remain approximately 119 FPS.

Accepted narrow 390x844 evidence:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Narrow-Final-20260821T060033Z/`.

- Report SHA-256:
  `f9bdeaf47d7be7056d97039520d47ef87d337b503e3c67f1d29e706505ab067b`.
- Management / Stage 7 / Administration / management-return frame SHA-256:
  `8a2f4507c67d81496e28d0fc8993482c041bb18985b7e1948d32fa93537152ea`,
  `6c8ab65c88768560ed754f9431d68f74d15d147edf61e99f1a8d9f168b4478d6`,
  `b108ea3ff74d457ab8aa6bc633b210212d46749de7e2b25e97e6fa519ed6d2db`,
  `601bf0b1de6f8738755684a9a94f1ce2af9ce2dac7b54e0ec0a220fabce769d6`.
- The same authority, transitions, collision recovery, 220x56 Back control,
  and workflow restoration pass at narrow resolution.

Three external-control attempts under
`Evidence/C/Camera-Touch-20260821T060033Z/`,
`Evidence/C/Camera-Touch-Final-20260821T060033Z/`, and
`Evidence/C/Camera-Touch-Final2-20260821T060033Z/` failed closed. Their report
hashes are
`74e49bcc1e9c5a613f5babef40654523cdb6773e7d14e4ca77a297471a521251`,
`94bb6e2b851eb72e0551a72e740c704bc3f93ee3711e999f15b273fd7a5402ce`,
and `6757fe48e9682da5353435cf91f248b0e65a7cd236b9c70904138870a4cc0e48`.
The unattended macOS
session remained behind `loginwindow`, so a targeted synthetic event never
reached the native GUI and the activation counter correctly stayed zero. These
are superseded environmental attempts, not accepted click/touch evidence. The
deterministic proof exercises the same return method and is accepted for this
non-Golden checkpoint, but a real foreground pointer/touch activation remains
an explicit evidence gap.

### Fresh native regression evidence

Fresh one-profile Movie #2, reconnect, and actual supervised engine-restart
evidence is rooted at
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Regression-20260821T062502Z/`.

- Movie #2 report/released-frame SHA-256:
  `c0fbb5e185a38e67886ea4e73a67de5109467f9314f8db1e9eabe0f26ce09600` /
  `5d01de0a80a2f5daea3b77b7970de2bd35f5647ca326e31f1e9017f2cfd11cbd`.
- Reconnect report/frame SHA-256:
  `66578dac0eed82ef504cb51ffb87b0f3501a00041128b92c7d64955eae5b20bd` /
  `21f1aad7c4aec3fc9da5defd6b1639d5895ecf0956f4580e96e158a444f83b4e`.
- Restart report/ready/frame SHA-256:
  `101cc3d8c81631c9e07486759e8926c52d4cf72165ec885e656164ea320526e3` /
  `96027cba21bd3c44d6efe5aab908818ca62e0b2495efee5638fd2cf686388208` /
  `0d63226b667f05680594e942da6bd0526dd59b00fa410e0587fdfbeef6aa9ecc`.
- Runtime checkpoint: 1,354,919 bytes, 25 journal entries, SHA-256
  `657458a33f8417e50da5d50d308161598705e0360de6d5403fd31e843a6df02e`.
- `The Reluctant Cornerstone`, `script-0001`, `prod-0013` reaches release at
  revision 23/week 22/digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Save/load restores digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  stale rejection remains retained across polling.
- Reconnect preserves the exact logical session/revision/week/digest. The
  restart proof kills validated engine PID `41873`, observes one outage and one
  new runtime instance, disables actions while retaining the last projection,
  then recovers exact authority with zero torn reads. All three runs are
  complete at approximately 120 FPS.

### Launch and rebuild

Rebuild the compatible native client when the ignored app is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-c-checkpoint11-native-build.log \
  -quit
```

Launch the pushed campaign pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

The ignored app/evidence/profile are local conveniences. Exact recovery is by
the two product SHAs above, never by mixing either side with another checkpoint.

### Visual-fidelity ruling and non-Golden decision

The governing visual reference is the local, six-page
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
SHA-256
`692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
It and representative The Movies screenshots are reference-only acceptance
material. No Lionhead asset, texture, UI artwork, layout, or protected
production material was copied or imported.

Checkpoint 11 passes the bounded camera/identity engineering gate and materially
improves the Stage 7 production fantasy: the close view reads at human scale and
visibly contains filmmaking equipment and activity. It does not pass the visual
Golden law:

- the management view remains a handsome but flat diorama;
- the large generic workflow HUD dominates the world and overwhelms 390x844;
- Administration remains flat, empty, and visibly uninhabited;
- people, faces, hair, wardrobe, and roles are not sufficiently human- or
  period-readable;
- grass, pavement, stucco, timber, metal, roofs, glass, and scenery still lack
  authored surface variation and believable material character;
- the campus does not yet consistently produce the immediate “This is The
  Movies” recognition without the title.

A technically valid camera does not compensate for a wrong-game visual result.
Checkpoint 11 is therefore **NON-GOLDEN**. M4 remains the sole CURRENT BEST;
status remains exactly **GOLDEN — CONTINUE CAMPAIGN**; there is no M5 tag and
no canonical promotion. Packaging and TypeScript-main reconciliation remain
later gates and must not displace the immediate visual product work.

### NEXT EXACT ACTION

Implement one bounded production-art slice on the pushed Checkpoint 11 pair:
make Stage 7 and Administration visibly inhabited and period-readable with
authored material variation and role-readable people, and replace the oversized
generic workflow surface with a restrained world-first responsive HUD. Then
rerun the same 1440x900 and 390x844 two-scale/collision/authority proof plus a
real foreground pointer/touch activation of `BACK TO STUDIO` before considering
another visual Golden checkpoint.

## 2026-08-21 09:16 CEST - Checkpoint 11 continuity CI interruption and test-only repair

### Exact branch history

| State | Exact SHA / run | Disposition |
| --- | --- | --- |
| Checkpoint 11 TypeScript product | `014f7ef94e085222bf375b9457a6b15420fa314c` | Unchanged compatible product with Unity `5c8a0eee7fa16bb9fd486fb61707230b208330d6` |
| Checkpoint 11 docs continuity | `ef6bb94d5bc05fd8a8166c8e7ac059a766e0b8e2`, parent `014f7ef9...` | Documentation-only; pushed |
| Docs-continuity CI | `32456422238` at `ef6bb94d...` | Failed in Bridge test helper; not a product defect |
| Test-only repair | `21629d2323dc11bc5927ff209f9255909fb5afe2`, parent `ef6bb94d...` | Changes only `tests/bridge-supervisor.test.ts`; pushed |
| Exact repair CI | `32457020574` at `21629d2...` | Passed every workflow step in 11m41s |
| Preliminary documentation seal | `600e014f3bd862583ee1605d158d1f8edb1f525e`, parent `21629d2...` | Documentation-only; pushed |
| Preliminary documentation-seal CI | `32458198739` at `600e014f...` | Passed every workflow step in 11m38s |

The Checkpoint 11 product pair, Golden M4 recovery pair, protocol `4`,
projection `4`, schema `ba9cd199...`, generated DTO `1192d58a...`, visual
verdict, and promotion status are unchanged. No Unity commit accompanies this
test-only repair.

### Failure classification and repair

Run `32456422238` reached the Bridge suite after browser audit, repository
hygiene, generated-contract verification, and both typechecks passed. During
the supervisor crash-loop test, `allFiles` enumerated a temporary atomic lease
candidate and then received `ENOENT` when `lstat` inspected the now-removed
path. The publisher had legally completed or cleaned the candidate between the
two operations. This is a test-inspection TOCTOU, not a runtime, authority,
camera, location, or Movie #2 failure.

Repair `21629d2...` is deliberately narrow:

- tolerate `ENOENT` only after an entry has already been discovered, including
  a directory that vanishes before its read;
- keep root `ENOENT` and every non-`ENOENT` error fail-closed;
- retain symlink exclusion and inspection of stable files;
- deterministically cover disappearing file/directory cases and `EACCES`.

Local repair validation passed `tests/bridge-supervisor.test.ts` 11/11 three
consecutive times, the Bridge aggregate 100/100, generated contract check,
bridge/full typechecks, and `git diff --check`. Repository hygiene remains
1,032 files. Exact repair run `32457020574` subsequently passed every workflow
step at `21629d2...` in 11m41s. Failed run `32456422238` is superseded
test-harness history. Preliminary documentation-seal run `32458198739` then
passed every workflow step at `600e014f...` in 11m38s; the post-product
validation repair and its continuity record are remotely validated.

Preliminary documentation seal
`600e014f3bd862583ee1605d158d1f8edb1f525e` follows pushed repair
`21629d2...`. The documentation-only commit containing this paragraph is its
direct child and cannot embed its own resulting SHA. At recovery, resolve it
with `git rev-parse HEAD`, require HEAD to equal configured upstream, and
require a clean tracked tree. M4 remains sole CURRENT BEST with status exactly
**GOLDEN — CONTINUE CAMPAIGN**; Checkpoint 11 remains the non-Golden development
base; no M5 or canonical promotion is authorized.

## 2026-08-21 11:43 CEST - Checkpoint 12 sealed: Stage 7 working soundstage (pushed, non-Golden)

### Exact sealed state

| Component | Branch | Exact pushed SHA | Direct parent / disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `93e15232915695e904680c34e2e1abbb4a5e5152` | Clean pushed Checkpoint 11 continuity tip; no TypeScript product change in Checkpoint 12 |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `219f290e3dc4b7174ee2ff26992692e8b2779c89` | Direct child of `5c8a0eee7fa16bb9fd486fb61707230b208330d6`; `feat(presentation): stage a working soundstage`; clean and pushed |

These SHAs are the compatible sealed Checkpoint 12 development pair. Neither is
tagged, Golden, canonical, or CURRENT BEST. Golden M4 remains the sole CURRENT
BEST recovery pair: TypeScript
`11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under the pushed annotated
tag `golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 tag or canonical promotion is authorized.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains the sole simulation authority. Checkpoint 12 changes only
Unity presentation, authoring, validation, and additive proof behavior; it does
not change V14, `GameState`, gameplay formulas, RNG, permanent identity, or the
generated bridge contract.

The documentation-only commit containing this section is the direct child of
TypeScript `93e15232915695e904680c34e2e1abbb4a5e5152`. Its self SHA is resolved
with `git rev-parse HEAD`; recovery requires HEAD to equal the configured
upstream and the tracked tree to be clean. This containing commit changes no
product or promotion fact.

### Working-soundstage implementation

- Added an exact protocol-v4 Stage-A truth resolver. It fails closed on missing,
  duplicate, ambiguous, stale-week, or inconsistent physical stage, facility,
  theater-subject, and production-operation joins instead of inventing visual
  activity.
- Added mutually exclusive `LoadIn`, `Shooting`, `Waiting`, and `Clearing`
  presentation roots plus a truly inactive `Dark` state. The state is a pure
  reading of authority and cannot advance time or POST an intent.
- Separated authoritative people from explicitly declared ambient presentation
  bodies. Active Stage-A states show the exact four on-stage authoritative
  director/cast identities when authority requires them and eight stable ambient
  camera, grip, electric, PA, boom, carpenter, camera-assist, and wardrobe
  identities; `Dark` removes stage activity.
- Activated the authored NavMesh at runtime, retained exact role stations, and
  added role-specific Mecanim controllers and purposeful movement for director,
  performance, camera, camera-assist, boom, electric, slate, and carry work.
- Added state-driven practical effects: interior spill while occupied, shooting
  beacon/indicators, six shooting-only lights, and distinct load-in, camera,
  boom, waiting, clearing, and dark equipment cues.
- Reworked Stage 7 as a visible working soundstage with an apartment set,
  wainscot/battens, practical furniture/radio, dolly track, camera, boom,
  director station, load-in flatbed/flats, wrap cart, stage apron, visible
  working backs, braces, rail, studs, and sandbag.
- Added deterministic Stage-specific material detail and normal variation for
  floor, canvas, timber, steel, and apron surfaces without importing protected
  reference material.
- Reframed Stage inspection as a responsive three-quarter composition: a
  landscape close read and a separate portrait profile, both keeping the exact
  role marks and state props in the proof frustum.
- Regenerated the canonical scene and expanded the validator to require the
  truth controller, exact state roots, effects wiring, slot authority,
  department counts, role stations, Stage materials/working side, camera
  anchors, and existing scene population counts.
- Added a separate five-milestone runtime proof that drives Movie #2 through
  Rehearsal Waiting, Scenery Load-In, Shooting, Wrap Clearing, and Stage Dark.
  It records exact authoritative correlation and visibility without replacing
  the normal full Movie #2/reconnect/restart proofs.

### Accepted validation

| Gate | Checkpoint 12 result |
| --- | --- |
| Canonical scene validation | Passed: 32 people, 10 vehicles, 18 equipment objects, 4 capture anchors, 0 errors, 0 warnings |
| Unity EditMode | Passed 101/101; `/tmp/project-studio-d-stage-seal2-editmode.xml` |
| Native macOS build | Passed; `/tmp/project-studio-d-stage-seal-build.log`; aggregate bytes `137484986`; executable SHA-256 `d41cadf58ec66502cc810aebd0c82022e8a58e350e10a94b4e2bdfbafa9f44e1` |
| Bridge aggregate | Passed 100/100 |
| Full TypeScript suite | Passed uncontended rerun: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript checks | `typecheck`, `typecheck:bridge`, build, generated-contract check, and repository hygiene passed |

The first full TypeScript run overlapped other validation and transiently
reported four duplicate-testid failures. The exact affected test file passed
28/28 in isolation, and the full uncontended rerun passed clean. The failure was
non-reproducible and is retained as concurrent-run test history, not erased or
classified as a product regression.

### Five-state native Stage evidence

Landscape evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093017Z/Landscape/`.

- Report SHA-256:
  `3b5891ccd2cb3f88ad3f7f39bfe40a8ba498d74a29a5e20154869ce1786f1072`.
- Rehearsal Waiting / Scenery Load-In / Shooting / Wrap Clearing / Dark PNG
  SHA-256:
  `ec028158917530eaf84fdcb54a3581e04eba63ae9d790d94f71c4a6418d40434`,
  `7d5c047d446300966138378b546f7f4076f22b226d17325c8b74c5d3ecd7008a`,
  `74611d9ccd43fb6b5bbec5c8da123594f1e14d015bfb7a24934416150eb8be6e`,
  `eb31e56b45a6353f066479e800981cc80fe70d0b1e667f608fe6c5da31d9d1f0`,
  `4e751ecb820f22938c3d5d06da17a862d5d1a1d2226a413e3f376ef9639720cb`.

Portrait evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093040Z/Portrait/`.

- Report SHA-256:
  `dc72c390a8d8c894d7e9c2f0b5c006135776927a7aa48fe460f20e9d9c4b9f72`.
- Rehearsal Waiting / Scenery Load-In / Shooting / Wrap Clearing / Dark PNG
  SHA-256:
  `1f9bede04eb6d0606e1406c79db362137f3095f0877036bc7bf31975edf7942f`,
  `6399fce172be3037061d5cfc9c7b51b1c3088ca9db96e0ea6eb45f703ec5cd11`,
  `7c658181a42eede15241cd4a0ca567cd6ae3d3491b2b36bdd26e1a73ba9533ef`,
  `6b3de340c82253a5b789d25a5cc1fbf58c48317415263a3f74b154e016bfb6ba`,
  `e79a7f24c885b6a6d64a80116364c941a29e5d42d92059f32937f25315669213`.

Both reports are `complete` at their exact 1440x900 and 390x844 viewports.
Both advance revision `0 -> 18`, finish Week `20`, submit and accept exactly
18/18 proof-owned POSTs, capture all five exact state milestones, show 4/4
authoritative plus 8/8 ambient Stage-A people in every active state that
requires them, and observe zero unexpected or presentation-owned POSTs. `Dark`
correctly has no active state root or stage people.

### Fresh Movie #2, reconnect, and restart regression

Accepted regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Regression-20260821T093322Z/`.

- Movie #2 report/released-frame SHA-256:
  `ec548b87a6b0caca729ae8a37d1ed1227405e5c46f44a4aa2b8ada54d74e5307` /
  `2f685af592fdd24382b664f39143ee4846f76e1e4a5681876b9ff98af0cde102`.
  Session `0523495d-4cb6-46fe-b60d-f5cd38947afb` reaches exact release at
  revision `23`, Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  save/load restores
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  average `119.001` FPS.
- Reconnect report/frame SHA-256:
  `c58bb140adbcbed30cd02cfa48847c1ed3563b633da66492e5877cd71fab41cf` /
  `6cde39fa913f01945d7a167d0fc9737b116062484ac64582d65ea73df8736deb`.
  It preserves the same logical authority under a new runtime instance at
  `119.199` FPS.
- Accepted `RuntimeRestart2` ready/report/frame SHA-256:
  `e06cc19e99bbf5a1ef75603348e9f65ff8ed876dca4aac1e1f61f00ae3c591b8` /
  `3e2e7be339a6c1dddbc61760364ab1cf51f20228cd4ae416dc402b5b448ac906` /
  `878f533dfa92d448ba99abd1dd63ffa34f10fb3e5832f58caf74e2d9562ce632`.
  It validates initial engine PID `81829` and its incarnation, kills that exact
  process, observes one outage and one replacement, accepts replacement PID
  `81939` on pinned port `62737`, preserves the same authority, and averages
  `119.999` FPS.
- `RuntimeRestart/bridge-runtime-restart-proof.json`, SHA-256
  `ee8631e363ca402cd56d7dd1c857a79bae5f915449dea7572b381811490035c2`,
  is a failed operator attempt that missed the kill window and killed no engine.
  It is superseded by `RuntimeRestart2` and is not a product failure.
- The stable runtime checkpoint is V1/protocol `4`/schema `ba9cd199...`, revision
  `23`, 25 journal entries, 1,354,914 bytes, SHA-256
  `4cff54571eba36eecdfded011c5e840c4eadd48dcfa8771dfeea37b0bc6473da`,
  with the exact saved digest above.

### Visual-fidelity ruling and non-Golden decision

The governing local reference remains
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`. Counts, test
passes, build size, and FPS establish engineering integrity only; they must
never be fused with the visual verdict.

Checkpoint 12 is meaningfully and immediately recognizable as a working
soundstage. Waiting, Load-In, Shooting, Clearing, and Dark are visibly distinct,
and Shooting clearly reads as a film camera, boom, director, cast, and crew
working around a dressed set. This is a material visual improvement over
Checkpoint 11.

It remains below the reference bar. The art is low-detail and flat, material
separation and lighting lack cinematic depth, roles remain tiny at the accepted
camera distance, and portrait captures retain empty vertical bands while the
Load-In truck is clipped. The result does not yet sustain the close-read,
inhabited, modern-The-Movies response required for a visual Golden.

Checkpoint 12 is therefore **SEALED NON-GOLDEN**. Golden M4 remains the sole
CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. No M5 tag is
created; no promotion or canonical claim is made.

### Known residuals

- Proof frustum checks establish in-frame points, not freedom from occlusion by
  every prop or person.
- Director-blocked `Waiting` shares the rehearsal `Waiting` presentation rather
  than having its own visual substate.
- The accepted runtime-restart report records `exactMovie2Released: false`
  because of the existing report-schema identity quirk, although its exact
  released ordinal-2 milestone and all restart invariants pass.
- Portrait composition still has empty bands and clips part of the load-in
  truck; this is visual debt, not a reason to weaken exact-viewport proof.

### NEXT EXACT ACTION

Implement one bounded Stage 7 visual slice on the pushed Checkpoint 12 pair.
Improve the set and role close read, material depth, practical/cinematic
lighting, and landscape/portrait composition while preserving the exact
protocol-v4 truth resolver and five-state behavior. Rerun the same five-state
landscape/portrait proof and full Movie #2/reconnect/restart regression. Do not
start another infrastructure unit and do not promote based on counts or FPS.

### DO NOT TOUCH

- Do not create or move `golden/unity-convergence-m5`; do not move or delete
  M1-M4. Golden M4 remains the sole CURRENT BEST immutable pair.
- Do not promote Checkpoint 12, call it Golden/canonical, or weaken the local
  visual-fidelity ruling because engineering gates pass.
- Do not change TypeScript sole simulation authority, protocol/schema/generated
  DTOs, V14, `GameState`, identity, RNG, economy, or gameplay formulas to solve
  presentation work.
- Do not infer Stage activity from display text, emit a presentation POST, merge
  authoritative and ambient identity, or relax fail-closed truth joins.
- Do not weaken exact state-root, active-person, viewport, no-presentation-POST,
  Movie #2, reconnect, restart, or checkpoint assertions.
- Do not treat frustum visibility as occlusion proof, the superseded missed-kill
  run as a product failure, or the restart-report schema quirk as proof that
  Movie #2 was not released.
- Do not stage ignored apps, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, or `/tmp` outputs. Do not import protected reference
  assets or reproduce the 2005 UI literally.

### Recovery

1. Read this section, the current handoff's Checkpoint 12 section, the promotion
   register's Checkpoint 12 non-Golden section, ADR 0006, and the client
   decision. Do not reopen the engine/client decision.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue Checkpoint 12, use TypeScript
   `93e15232915695e904680c34e2e1abbb4a5e5152` plus Unity
   `219f290e3dc4b7174ee2ff26992692e8b2779c89`. Never mix sides.
4. Preserve the documentation-only commit containing this section directly
   above TypeScript `93e1523...`. Resolve its self SHA with `git rev-parse HEAD`;
   after push, require HEAD equal configured upstream and an empty
   `git status --short`. Require Unity HEAD/upstream at `219f290...` and a clean
   tracked tree.
5. Rebuild and launch with `npm run studio -- --unity-project
   '/Users/bruce/Project Studio - Unity Production Convergence 80H'`. Verify
   protocol/projection `4`, schema `ba9cd199...`, and authenticated readiness.
6. Use the exact report/frame hashes above for regression. Treat
   `RuntimeRestart` as superseded and `RuntimeRestart2` as the accepted actual
   process-replacement proof.
7. Continue only with NEXT EXACT ACTION. Do not tag M5 or promote until a future
   checkpoint independently passes visual, interaction, runtime, remote CI,
   clean-tree, and recovery gates.
