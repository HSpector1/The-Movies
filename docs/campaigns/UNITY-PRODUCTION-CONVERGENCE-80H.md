# Unity Production Convergence 80H Campaign Ledger

This file is the chronological source of campaign history. Read
`UNITY-PRODUCTION-CONVERGENCE-80H-HANDOFF.md` for the exact current state and
the next action.

## Current campaign authority

Golden M5 is the sole CURRENT BEST build-from and recovery pair: TypeScript
`e5e95e54dc45252433bf96a75349f336df8dc875` plus Unity
`4770e22955f2fae770445065c2bf782ef251496e`, under pushed annotated
`golden/unity-convergence-m5` tags in both repositories. Remote tag objects
`6dbd1f22802e8f39599b0545751be901a176f081` /
`1775a85b0c0538ef417bbe1ee4adc194e727d0c8` peel to those exact commits.
M5 supersedes M4 without moving M1-M4. Promotion status is
**GOLDEN — CONTINUE CAMPAIGN**. M5 passes ADR 0006 and has no P0/P1, but it is
non-canonical and not ready for canonical merge review because the explicit P2
packaging, TypeScript-main reconciliation, physical foreground-input proof,
scalability, and polish boundaries remain.

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
| B - Durable local game runtime | Golden M5 inherits complete local-development runtime | Checkpoints 7/8/9/10 provide durable authenticated exact-retry continuity and a one-command owned lifecycle; emitted production packaging remains P2 work |
| C - Unity client architecture | Golden M5 visual/interaction slice | Protocol, runtime continuity, authoritative physical-location joins, two-scale Cinemachine direction, Stage-A truth/state presentation, unified input, collision recovery, exact role/light/practical proof, and presentation seams pass; broader production decomposition remains open |
| D - Full Movie journey in Unity | Partial at inherited baseline | Automated native Movie #2 path passes, but the interaction surface remains proof-oriented and does not yet provide the approved professional retained workspaces |
| E - Lot interaction / construction / management | Partial at inherited baseline | TypeScript construction intent and visible construction state pass; direct build placement interaction is not productionized in Unity |
| F - Hero Soundstage 7 | Golden M5 Stage slice | Stage-A truth drives five accepted operating states with authored apartment set, period surfaces, 12 readable production roles, three held props, shooting lights/practicals, load-in, clearing, Dark, supported pallet, and both-aspect proof; independent review passes ADR 0006 |
| G - Characters and authored animation | Partial, role animation slice accepted | Provenance-cleared bodies, Mecanim role controllers, authoritative/ambient slot separation, and 32 declared people exist; human detail, close-read role identity, and animation quality remain below target |
| H - Purposeful people / NavMesh | Partial, Stage-A activation proven | Runtime NavMesh activation and Stage-A role stations present 4/4 authoritative plus 8/8 ambient people in active proof states; 25/50/100 stress gates are untouched |
| I - Camera / occlusion / inspection | Golden M5 functional slice | Smooth management/inspection Cinemachine modes, accepted Stage 7 landscape/portrait profiles, Admin target, collision/occlusion recovery, shared mouse/touch sampling, UI gesture exclusion, Back/Escape/Home return, exact-viewport/critical-root proof, and both camera journeys pass; physical foreground activation remains P2 |
| J - World / era / campus quality | Partial at inherited visual floor | Campus scale reads, but overview remains a diorama and Administration is flat/empty; surroundings, density, material variation, inhabitation, and 1948 specificity remain weak |
| K - Materials / lighting / VFX / audio | Golden M5 Stage treatment | Provenance-recorded atlas, deterministic material derivatives, working-set backs, shooting-only lights, exact practical glows, state-driven effects, and Dark luma pass the Golden Stage gate; broader campus/audio polish remains open |
| L - Performance / scalability | Baseline only | M3 Max measurements captured; no 25/50/100 scalability campaign yet |
| M - Resilience | Golden M5 inherits durable runtime | Stale/duplicate, durable save/load, idle restart, outage retention, malformed protocol, exact lost-response recovery, and the supervised killed-engine pass remain green; production packaging and the full ugly-condition matrix remain P2 |
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

## 2026-08-21 11:43 CEST - Checkpoint 12 sealed: Stage 7 working soundstage (historical non-Golden)

Checkpoint 13 below supersedes Checkpoint 12 as the current campaign
development base. Checkpoint 12 remains preserved history and was never Golden,
tagged, canonical, promoted, or CURRENT BEST.

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

## 2026-08-21 14:16 CEST - Checkpoint 13 sealed: Take One interior production tableau (historical non-Golden)

Checkpoint 14 below supersedes Checkpoint 13 as the current campaign
development base. Checkpoint 13 remains preserved history and was never Golden,
tagged, canonical, promoted, or CURRENT BEST.

### Exact sealed state

| Component | Branch | Exact pushed product SHA | Direct parent / disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `6b28cacfa9d8fd802ced951bb3248153cf348259` | Unchanged Checkpoint 12 documentation seal; clean and pushed before this CP13 continuity edit; no TypeScript product change |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `e38c8400ff28b0a516dda47b9c2b9a64374a50d6` | Direct child of `219f290e3dc4b7174ee2ff26992692e8b2779c89`; `feat(visuals): stage a readable production tableau`; clean and pushed |

This is the only compatible Checkpoint 13 development pair. It is **SEALED
NON-GOLDEN**: neither side is tagged or canonical, and CP13 is not CURRENT BEST
or ready for canonical review. Golden M4 remains the sole CURRENT BEST recovery
pair: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under the pushed annotated
tag `golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 tag was created or moved.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP13 changes no TypeScript,
schema, generated DTO, V14 save, `GameState`, gameplay formula, RNG, permanent
identity, economy, construction rule, or simulation authority.

The documentation-only commit containing this section must be the direct child
of TypeScript `6b28cacfa9d8fd802ced951bb3248153cf348259`. A commit cannot embed
its own resulting SHA, so resolve it with `git rev-parse HEAD`; after push,
require HEAD to equal configured upstream and `git status --short` to be empty.
That docs-only child changes no CP13 product or promotion fact.

### Unity source and asset scope

Unity CP13 is an exact 87-file source/asset commit. It updates Stage authoring,
the canonical scene and NavMesh, camera/activity presentation, validation,
proof schema, EditMode coverage, lighting/volume/material assets, generated
role controllers, deterministic surface derivatives, and provenance. The core
new runtime seam is `StudioProductionRolePresentation`; the source atlas is
`Assets/Studio/Art/Authored/Stage/StageDressingAtlas.png`. No ignored build,
evidence, profile, checkpoint, screenshot, cache, lock, or `/tmp` output is in
the commit.

The OpenAI built-in image-generation source atlas is exactly 1254x1254,
2,753,366 bytes, SHA-256
`0b244fe00ba2251ffd80204978a09d0a5471062bb35315f1ccec973114095c89`.
`PROVENANCE.md` records the acquisition date, output terms, path, hash,
deterministic 615x615 crop/derivative process, and this exact prompt:

```text
Use case: stylized-concept
Asset type: square 2x2 texture atlas for a stylized Unity 1940s Hollywood soundstage apartment set
Primary request: create four original, production-ready material swatches arranged in a precise 2x2 atlas with narrow neutral gutters. Top-left: faded deep teal 1940s Art Deco fan-pattern wallpaper with subtle age and roller variation. Top-right: warm cream painted canvas flat with restrained plaster grain and tiny scuffs. Bottom-left: burgundy, tobacco, muted gold and teal geometric wool rug with an elegant 1940s residential pattern. Bottom-right: dark walnut studio floor boards with visible grain, worn traffic paths, taped/scuffed production marks but no letters.
Style/medium: stylized physically plausible game material albedo, hand-authored feel, rich but restrained, not photorealistic
Composition/framing: perfectly orthographic, each quadrant edge-to-edge within its cell, no perspective, no objects, no folds, no lighting direction, no cast shadows
Lighting/mood: neutral flat albedo capture
Color palette: deep teal, warm cream, oxblood, tobacco, muted brass, dark walnut
Constraints: square atlas; four clearly isolated equal-size quadrants; seamless-looking repeatable motifs; no text, no symbols, no logos, no trademarks, no people, no props, no UI, no watermark
Avoid: photographic room scene, perspective, dramatic lighting, borders wider than a narrow atlas gutter, glossy plastic, modern patterns, recognizable copyrighted imagery
```

CP13 gives the apartment set readable teal wallpaper, cream linen/canvas,
burgundy textile, dark walnut, and warm practical material families. It adds
exact deterministic role/wardrobe/controller assignments for Director,
CastLead, CastAntagonist, CastSupporting, CameraOperator, Grip, Electric,
ProductionAssistant, BoomOperator, Carpenter, CameraAssistant, and Wardrobe.
The exact 12 role IDs are `t-dir-04`, `t-act-01`, `t-act-04`, `t-act-09`,
`presentation-crew-camera`, `presentation-crew-grip`,
`presentation-crew-electric`, `presentation-crew-pa`,
`presentation-crew-boom`, `presentation-crew-carpenter`,
`presentation-crew-camera-assist`, and `presentation-crew-wardrobe`.
Director megaphone, PA slate, and boom microphone held-equipment state now fails
closed outside Shooting.

Seven shooting-only lights are enabled exactly in Shooting, and the three exact
shooting practical renderers are `Shooting Window Glow`,
`Shooting Sconce Glow`, and `Shooting Standing Lamp Glow`. The proof records
their exact active/inactive state in every milestone. Camera, blocking, crew
routes, set density, working backs, furniture, and load/clear props were refined
without changing the five authoritative states or emitting presentation POSTs.

### Accepted validation

| Gate | Checkpoint 13 result |
| --- | --- |
| Canonical scene validation | Passed final run 14: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings; `/tmp/project-studio-cp13-build-scene-20260821-run14.log` |
| Unity EditMode | Passed final run 16: 127/127; `/tmp/project-studio-cp13-editmode-run16.xml` and `/tmp/project-studio-cp13-editmode-run16.log` |
| Native macOS build | Passed final run 12; `/tmp/project-studio-cp13-build-macos-20260821-run12.log`; 152,745,358 aggregate regular-file bytes; executable 116,116 bytes; executable SHA-256 `68043e536a98adcd7686d4e54b0f08ecfa5572c832521ac6e2111dcef35e6e7e` |
| TypeScript bridge aggregate | **Inherited unchanged**, not a CP13 product rerun: 100/100 |
| Full TypeScript suite | **Inherited unchanged**, not a CP13 product rerun: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript checks | **Inherited unchanged**: full/bridge typechecks, production build, generated-contract/contract checks, and repository hygiene passed |

### Accepted five-state Stage evidence

Landscape evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115813Z/Landscape/`.

- Report `stage-visual-proof-landscape.json` is schema `3`, `complete`,
  1440x900, SHA-256
  `94c400a1cd7b649983923cb4fb9483636dd721a305e5778788cbba90d369f1c8`.
- Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256 values are
  `9eb1c9dc433eb0928bba995da747e4dfa95a960a16bb7f330c4f3062b72f82fa`,
  `2e6a422944e7da558970b463a4a3f015e9bd86183cd6cbf0b95292726c2eaf20`,
  `798579700f024adf9159631793bd19096c3732732d7839a75d97fd6941764424`,
  `12eadaa15e1f62a4dee4e11150ba482f7f3b4d4c6620a2e34a09b0ee32f752a1`,
  and `1b2cdba0b0bce9a50b0493ee191364cacccbac6f02c32194b70259936eee870a`.

Portrait evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115635Z/Portrait/`.

- Report `stage-visual-proof-portrait.json` is schema `3`, `complete`, 390x844,
  SHA-256
  `6aa60673b492bb5b8b2d94dc8d35f1ac4920da51f4312e5eb1e17d17d43dae77`.
- Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256 values are
  `b454d1386990f29b9610a253dda1b6d4711c78be96cefe076018abc35500c5bd`,
  `b38f17b65a9e693a7dad55c428dded48326393969cf2be80716bda7a163cc2e3`,
  `8808213eac99dc8d16e4c12c2e5d7a8e023ef380907537ad0ee8b38c2af6123e`,
  `4245b8777526b722ced33af5c6449caa5d323bfcac8229fc14a4d1a2224f801e`,
  and `e6b4da10a3eb3b8297041b1fc54c2927eb3550393603034a99db5fcd9049c2ca`.

Both accepted reports advance revision `0 -> 18`, finish Week `20` at digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
submit/accept exactly 18/18 proof-owned POSTs, record zero unexpected accepted
POSTs and zero presentation-owned POSTs, and pass the no-extra-presentation-POST
guard. Both validate the exact 12 role contracts, seven shooting-only lights,
three shooting practical renderers, five state roots, held-equipment state, and
4/4 authoritative plus all eight framed ambient bodies in active states.
Landscape and Portrait Load-In each honestly record 8/8 ambient roles framed
but only 7/8 visually clear; the enforced threshold is six. The load-in flatbed/truck is intentionally
outside the hero proof frustum, not accidentally clipped into the composition.

Superseded Stage proof attempts under `Evidence/E/Stage7-*` are iteration
history, not accepted seal evidence. The accepted roots and hashes above are
authoritative.

### Fresh Movie #2, reconnect, and restart regression

Accepted regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Regression-20260821T115956Z/`.
The stable private profile is
`/private/tmp/project-studio-cp13-regression-20260821T115956Z`.

- `Movie2/bridge-client-proof.json`, SHA-256
  `a350507148445aca3ae8b2ab90f26b62bade0f5ef85d3c4b976503c8c254f132`,
  is schema `5` and `complete`. Session
  `992847ef-d875-43e0-ac92-d5b7fdb00364` releases exact Movie #2
  `The Reluctant Cornerstone` / `script-0001` / `prod-0013` at revision `23`,
  Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Save/load restores digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  all 12 milestones, exact release identity, and retained `STALE_REVISION`
  guidance pass.
- `Reconnect/bridge-reconnect-proof.json`, SHA-256
  `aa1440efcf30fa80f98eb702b16694b13372b38d5f4907ca6ad3a3a81661daef`,
  is `complete` and retains that same logical authority and exact release
  identity under a new runtime instance.
- Accepted `RuntimeRestart2/bridge-runtime-restart-ready.json` / report SHA-256
  values are
  `23b6cf8d86fa32da38d3e9b7505d6c0c1cc8d89046cdd009dc62f864b0081472` /
  `dadacb1573d297d59ca7dba41be9975af1c469d5f038f0100c169f2a37c72e28`.
  It validates exact initial PID `8648`, PGID `8648`, supervisor `8643`, and
  incarnation `ps-lstart:Fri Aug 21 14:03:50 2026`; SIGKILL targets only that
  engine. Replacement PID `8692` returns on pinned port `50472`, with one
  outage/replacement, actions disabled during outage, retained projection,
  unchanged logical authority, and zero torn reads.
- `RuntimeRestart/bridge-runtime-restart-proof.json`, SHA-256
  `7c7757403edea814f1ef10c8875a8817c0bf9bf2ded6ee70455829ae222e73e9`,
  is invalid and superseded because the operator missed the 30-second kill
  window; the supervisor cleaned up. It is not a product failure.
- The stable checkpoint at
  `/private/tmp/project-studio-cp13-regression-20260821T115956Z/bridge-runtime/bridge-runtime-v1.json`
  is 1,354,922 bytes, SHA-256
  `45eba062636d12bdd08fc908bc4bb4e9fb51320ef7fb8e5ee271d057dca0ae1e`,
  protocol `4`, schema `ba9cd199...`, revision `23`, with 25 journal records:
  23 commands, one save, and one load.

The Movie2 and Reconnect reports are the CP13 release-identity proofs. The
Restart2 report is restart-continuity proof only: its schema leaves title and
project/production IDs blank and reports `exactMovie2Released: false`, while
its ordinal-2 released milestone and every restart invariant pass. Never use
Restart2 alone to claim exact release identity or misread its blank fields as a
product regression.

### Visual-fidelity ruling and non-Golden decision

CP13 materially improves Stage 7 surfaces, production-role contracts,
framing, working-set density, and state-specific effects. The landscape view is
more readable than CP12, and all accepted engineering/proof gates are green.

The visual verdict is still **NON-GOLDEN**. Portrait composition leaves large
ceiling/floor voids around a narrow action band and permits role/prop overlap;
the Load-In flats dominate that frame. Dark removes activity but remains
broadly warm-lit instead of reading as a genuinely dark stage. Landscape roles
remain clustered, and the slate, megaphone, boom, and individual departments
do not read distinctly enough at first glance. Counts, hashes, tests, build
bytes, and FPS cannot manufacture visual success.

CP13 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. CP12
is historical; no M5 or canonical state was created or moved.

### NEXT EXACT ACTION

Implement bounded Checkpoint 14 on the sealed CP13 pair: improve Stage role
silhouettes and held-prop legibility, add portrait-aspect-specific blocking and
composition, and make Dark genuinely dark through motivated state lighting.
Add screen-space prop-area and occlusion/separation proof that detects false
greens. Preserve the five-state truth and exact role/light/practical contracts;
do not widen TypeScript state, protocol/schema, save/gameplay, identity, or
simulation scope.

### DO NOT TOUCH

- Do not create or move M5, move/delete M1-M4, or promote CP13. Golden M4 is
  the sole immutable CURRENT BEST.
- Do not change TypeScript authority, protocol/projection/schema/generated DTOs,
  V14, `GameState`, identity, RNG, economy, construction, or gameplay formulas
  for CP14 visual work.
- Do not weaken exact five-state roots, 12 role assignments, held props, seven
  lights, three practicals, viewport, no-POST, Movie #2, reconnect, restart, or
  checkpoint assertions.
- Do not call frustum inclusion occlusion proof, hide portrait Load-In's 7/8
  clear count, put the truck back into the hero frustum solely to satisfy a
  count, or treat the invalid restart as a product defect.
- Do not stage builds, evidence, profiles, checkpoints, screenshots, logs,
  caches, locks, `/tmp` outputs, or protected reference assets.

### Recovery

1. Read this historical CP13 section, the handoff's CP13 section, the promotion
   register's CP13 section, ADR 0006, and the client decision. Do not reopen the
   engine/client decision.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP13, use TypeScript
   `6b28cacfa9d8fd802ced951bb3248153cf348259` plus Unity
   `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`. Never mix sides.
4. Preserve the containing documentation-only direct child of TypeScript
   `6b28cac...`; resolve its self SHA with `git rev-parse HEAD`. After push,
   require HEAD equal upstream and a clean tracked tree. Require Unity
   HEAD/upstream at `e38c840...` and a clean tracked tree.
5. Rebuild/launch with `npm run studio -- --unity-project
   '/Users/bruce/Project Studio - Unity Production Convergence 80H'`. Verify
   protocol/projection `4`, schema `ba9cd199...`, and authenticated readiness.
6. Use only the accepted Evidence/E report hashes above. Treat the first
   `RuntimeRestart` as invalid/superseded; use Movie2 plus Reconnect for release
   identity and RuntimeRestart2 only for actual process-replacement continuity.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## 2026-08-21 20:16 CEST - Checkpoint 14 sealed: proof-legible Stage roles (historical non-Golden)

Checkpoint 15 below supersedes Checkpoint 14 as the current campaign
development base. Checkpoint 14 remains preserved history and was never Golden,
tagged, canonical, promoted, or CURRENT BEST.

### Exact sealed state

| Component | Branch | Exact pushed product SHA | Direct parent / disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` | Checkpoint 13 documentation-only seal; clean and pushed before this CP14 continuity edit; no TypeScript product change |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `a1f6ae8a11d58e28491662a1858631f8019faf33` | Direct child of `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`; `feat(visuals): make stage roles proof-legible`; exact 47-file commit; clean and pushed |

This is the only compatible Checkpoint 14 development pair. It is **SEALED
NON-GOLDEN**: neither side is tagged or canonical, and CP14 is not CURRENT BEST
or ready for canonical review. Golden M4 remains the sole CURRENT BEST recovery
pair: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under the pushed annotated
tag `golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 tag was created or moved. CP13 is now
historical.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP14 changes no TypeScript,
schema/generated DTO, V14 save, `GameState`, gameplay formula, RNG, permanent
identity, economy, construction rule, or authority.

The documentation-only commit containing this section must be the direct child
of TypeScript `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`. A commit cannot embed
its own resulting SHA, so resolve it with `git rev-parse HEAD`; after push,
require HEAD to equal configured upstream and `git status --short` to be empty.
That docs-only child changes no CP14 product or promotion fact.

### Unity source and proof scope

Unity CP14 is an exact 47-file presentation, authoring, generated-asset,
canonical-scene, validation, and proof commit. It reblocks the exact 12 Stage
roles, strengthens deterministic wardrobe/held-prop materials, keeps the
Director megaphone, PA slate, and boom microphone hand-attached in Shooting,
refines both Stage inspection profiles, and adds an authoritative Dark-only
local grade.

Schema-4 proof adds persistent ID rendering and isolated/composite masks. It
fails closed on exact role and held-prop visible area, edge clearance,
occlusion, pair separation, owner overlap, PA face-interior clearance,
aspect-aware blocking, luma/effects state, authority correlation, viewport,
and extra POSTs. The scene/NavMesh/controllers are regenerated and persisted.
No Lionhead, purchased, trademarked, or protected visual-reference asset was
imported.

### Accepted validation

| Gate | Checkpoint 14 result |
| --- | --- |
| Canonical scene validation | Passed final run 40: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings; `/tmp/project-studio-cp14-scene-final-run40.log` |
| Unity EditMode | Passed final run 29: 189/189, 0 failed, 0 skipped; `/tmp/project-studio-cp14-editmode-run29.xml` and `/tmp/project-studio-cp14-editmode-run29.log` |
| Native macOS build | Passed final run 29; `/tmp/project-studio-cp14-build-final-run29.log`; 151,475,574 aggregate regular-file bytes; executable 116,116 bytes; executable SHA-256 `70329ea3f2fab238b4414e6af29c39ec57c2dfe24a781c8fd26cb91330abed48`; `Assembly-CSharp.dll` SHA-256 `18bad2a8dbf2984eedfe7af7d97d38d90e8ee7e3141f79336e891eddb551faf5` |
| Fresh TypeScript bridge aggregate | 100/100 |
| Fresh full TypeScript suite | 336 files, 4,526 passed, 5 skipped, 0 failed |
| Fresh TypeScript checks | Full/bridge typechecks, production build, generated-contract/contract identity, hygiene across 1,032 source files, 26 adopted-asset audit, and browser production-dependency audit passed |

### Accepted five-state Stage evidence

Landscape report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Stage7-20260821T180028Z/Landscape/stage-visual-proof-landscape.json`,
schema `4`, `complete`, exact 1440x900 viewport, SHA-256
`3c7fef40b1f0e40ed53ca37d2c397be4db46e05b9cf66d6f6a67b864cdd8a829`.

Portrait report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Stage7-20260821T180100Z/Portrait/stage-visual-proof-portrait.json`,
schema `4`, `complete`, exact 390x844 viewport, SHA-256
`5337e7ad920d72e44e5d50112c59f7463e716b9a70a510803d4c3b4f09adbb9d`.

Both reports prove exact Movie #2 identity `The Reluctant Cornerstone` /
`script-0001` / `prod-0013`, revision `0 -> 18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
18/18 accepted/submitted intent POSTs, zero ambiguous retries/recoveries, zero
unexpected accepted POSTs, zero presentation capture POSTs, and true
`noExtraPresentationPosts`.

| State | Revision / Week | Exact roles | Exact held props | Spill | Lights / indicators / practicals | Dark grade | L/P mean luma |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Waiting | 11 / 16 | 12 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.235897 / 0.222092 |
| Load-In | 13 / 17 | 12 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.241800 / 0.238575 |
| Shooting | 15 / 17 | 12 | 3 | 4.0 | 7 / 2 / 3 | 0 | 0.257441 / 0.243183 |
| Clearing | 17 / 19 | 8 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.235740 / 0.221426 |
| Dark | 18 / 20 | 0 | 0 | 0 | 0 / 0 / 0 | 1 | 0.116131 / 0.117365 |

Every expected role/held count is both active and visible. All screen-space,
effects, luma, authority, artifact, camera, composition, viewport, and no-POST
gates pass. Minimum occupied-minus-Dark luma is `0.119609/0.104062` and
Shooting-minus-Dark `0.141309/0.125819` for Landscape/Portrait. Dark P10/P90/
black fraction is `0.060255/0.196849/0` landscape and
`0.058835/0.194045/0` portrait.

The final Shooting slate is 778/1,028 visible landscape pixels (`0.75681`) and
427/570 portrait (`0.74912`), with owner overlap `0.02821/0.03860`.
Landscape raw/interior PA-head overlap is `2/0`; portrait is `0/0`. These are
valid mask/occlusion facts, not a manual-recognition claim.

### Fresh Movie #2, reconnect, and restart regression

Accepted root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Regression-20260821T180816Z/`.
Stable private profile:
`/private/tmp/project-studio-cp14-regression-20260821T180816Z`.

- Movie2 report SHA-256
  `b4214dcb5327b867d4e822373db5e45526fc6f6cf94234365749f7081582e83e`.
- Reconnect report/frame SHA-256
  `4cc452479c68006b38bab6bde1839e07b57be1a192b69fe83894cf97a434b03a` /
  `649289d6ac89a644abd56d89f85009fd43386f0ef075004ba9ad7128c1bb3653`.
- RuntimeRestart ready/report/frame SHA-256
  `031854be69a25cf2bfeafc3e0c4525dfd31ef07c5e3b9fea5dd6b36f1d914a53` /
  `47198241fdd11fdd56bd6a26cce487283bfe6f968e9ca2dd70ba2ed7e3b295d5` /
  `530cffc4c4ca58ace2f8fceb0cf87f0297d89c7c152ff645f84bfe0ef179a53e`.
- Session `ff8ae458-a58b-4139-886b-808a4fbd97af` retains revision `23`, Week
  `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
  and exact Movie #2 release identity in Movie2/Reconnect.
- RuntimeRestart replaces engine PID `75695` with `75736` on pinned port
  `61145`, observes exactly one outage/replacement, disables actions and
  retains the last projection during outage, preserves authority, and records
  zero torn reads.
- Stable checkpoint is 1,354,927 bytes, SHA-256
  `7af05320a1c4ed94096c620060159d0424b9a83b616822d1fbd4770814ca48c1`,
  protocol `4`, revision `23`, journal `25`.

Movie2 plus Reconnect are release-identity proof. RuntimeRestart is continuity
proof only; its blank identity fields and `exactMovie2Released: false` do not
negate the ordinal-2 release milestone or the accepted identity reports.

### Visual-fidelity ruling and non-Golden decision

Independent visual audit accepts the landscape result. The compatible pair
still fails: portrait roles occupy about 22.5% of viewport height, the slate is
mask-present but reads as a plain charcoal square with a tiny rail, and large
black headroom plus the Back UI reinforce a prototype read. Engineering proof
cannot substitute for manual two-second recognition.

CP14 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. No M5
or canonical state was created or moved.

### NEXT EXACT ACTION

Implement bounded CP15 on the sealed CP14 pair. Preserve every validated role
mark, camera, held-prop pose, state root, and authority boundary. Re-author only
the slate surface/contrast first, require a high-contrast bright rail at least
3 pixels thick in the 390x844 Shooting frame, and require manual two-second
clapperboard recognition. Do not change blocking/camera or widen TypeScript
state, protocol/schema, save/gameplay, identity, or simulation scope.

### Launch

The obvious moving-tip launch is:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, or promote CP14. Golden M4 remains
  the sole immutable CURRENT BEST.
- Do not move validated role marks, camera, or held-prop pose in the CP15
  slate-surface unit; do not widen TypeScript or weaken proof gates.
- Do not call mask presence first-glance recognition or conceal the portrait
  role-height/headroom/Back-UI failure.
- Do not stage ignored builds, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### Recovery

1. Read this historical CP14 section, the handoff's CP14 section, the promotion
   register's CP14 section, ADR 0006, and the client decision.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP14, use TypeScript
   `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` plus Unity
   `a1f6ae8a11d58e28491662a1858631f8019faf33`. Never mix sides.
4. Preserve the containing docs-only direct child of TypeScript `8dffc6f...`;
   resolve its self SHA with `git rev-parse HEAD`. After push, require HEAD
   equal upstream and a clean tracked tree. Require Unity HEAD/upstream at
   `a1f6ae8a...` and clean.
5. Rebuild/launch with the command above and verify protocol/projection `4`,
   schema `ba9cd199...`, and authenticated readiness.
6. Use only the accepted Evidence/F hashes above; no M5 tag or canonical
   promotion is authorized.

## 2026-08-21 21:20 CEST - Checkpoint 15 sealed: recognizable production slate (historical non-Golden)

Checkpoint 16 below supersedes CP15 as the current development base. CP15
remains preserved sealed history and was never Golden, tagged, canonical,
promoted, or CURRENT BEST.

### Exact sealed state

| Component | Branch | Exact pushed product SHA | Direct parent / disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` | Checkpoint 14 documentation-only seal; no TypeScript product change in CP15; local HEAD/upstream/live remote matched before this continuity edit |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `0c0ef1554278441eed1d2dccac54c2d941395041` | Direct child of `a1f6ae8a11d58e28491662a1858631f8019faf33`; `Improve Stage 7 slate readability`; exactly 6 modified paths; local HEAD/upstream/live remote matched and tracked tree clean |

This is the only compatible Checkpoint 15 development pair. It is **SEALED
NON-GOLDEN**: neither side is tagged or canonical, and CP15 is not CURRENT BEST
or ready for canonical review. Golden M4 remains the sole CURRENT BEST recovery
pair: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated
`golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 tag was created or moved. CP14 is
historical.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP15 changes no TypeScript,
generated DTO, V14 save, `GameState`, gameplay, identity, RNG, economy,
construction, camera, role mark, state semantics, or authority.

The documentation-only commit containing this section must be the direct child
of TypeScript `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`. A commit cannot embed
its own resulting SHA, so resolve it with `git rev-parse HEAD`; after push,
require HEAD to equal configured upstream and `git status --short` to be empty.
That docs-only child changes no CP15 product or promotion fact.

### Unity source and proof scope

CP15 modifies exactly six paths: Stage activity authoring, scene validation,
the schema-4 Stage proof runner, canonical `StudioLot.unity`, and the material/
proof EditMode tests. The PA slate uses exact sources `[base, LOD1, LOD1]` at
LOD thresholds `.52/.22/.025`, so the fuller LOD1 mesh is terminal. Its ordered
slots are dark board / ivory clapper / mustard stripe:
`HeldPropCharcoal`, `HeldPropIvory`, `HeldPropMustard`.

Proof requires landscape visible/long/short `800/32/28`, portrait `440/24/20`,
and minimum visible fraction `.70`. It retains owner overlap, PA head-interior,
all-role, edge, mask, luma, effects, authority, and no-POST gates. The CP14
slate pose, cameras, role marks, landscape profile, schema `4`, five states,
and TypeScript authority remain unchanged.

### Accepted validation

- Canonical runs 1 and 2 both pass 32 people, 10 vehicles, 16 equipment, 4
  captures, 0 errors, 0 warnings. Logs
  `/tmp/project-studio-cp15-dark-slate-scene-run1.log` and
  `/tmp/project-studio-cp15-dark-slate-scene-run2.log`; SHA-256:
  `d531886872560ac0ee92aaf6bb8eda549e9c2b7b78ef919be7b2fd041607b82e` /
  `fe5e9eebb9fd6a65bd4b82d633398292da36fe640444be2218b3fcb84b99b51e`;
  accepted validation JSON SHA-256
  `a2c6bf2ca3d3e6a40616ced0b474031ac0f4dfcd0479eafb6d6df8f0cc4a302a`.
- EditMode run 2 passes 191/191. XML `/tmp/project-studio-cp15-editmode-run2.xml`
  and log `/tmp/project-studio-cp15-editmode-run2.log`; SHA-256:
  `7ae511cf9c2c41a44abbd0456ffcf1c5d1be864b362e1a021f1672d39f3955ff` /
  `00d458a0ea374d79d6545d6068402d0fdaae1f19d065c7892b51721e3d7fd2ef`.
- Native build succeeds; log `/tmp/project-studio-cp15-dark-slate-build-run2.log`,
  SHA-256
  `fb2413bd4b35e32c1038a2ff1f727618a50cbbd66f504f5544d668292dcc3e8f`.
  App: 183 files / 151,475,682 bytes. Executable: 116,116 bytes, SHA-256
  `eae78f14c609aec59e5646094b371c1a2519b4671af902f7148eff74a2e63e48`.
  Player DLL SHA-256:
  `7e50620ec560db947da9a268ccdd38814248a11754a9e07e1851d0af6324802f`.
- Fresh TypeScript: bridge 11 files / 100 tests; full 336 files / 4,526 passed /
  5 skipped; both typechecks, build, contract drift, hygiene 1,032, assets 26/0,
  browser audit 0, and cleanup pass. Build has only the accepted chunk warning.

### Accepted five-state Stage evidence

Landscape:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Stage7-20260821T190243Z/Landscape/stage-visual-proof-landscape.json`,
schema `4`, complete, 1440x900, SHA-256
`3f3647dc172e30d85c55f46563329a589dcdb038e5dbcb0c3b697d4a1c7a494c`.

Portrait:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Stage7-20260821T190335Z/Portrait/stage-visual-proof-portrait.json`,
schema `4`, complete, 390x844, SHA-256
`ff420f3767a8ebd50515ae73235a4e5fe57e78bebd5ef0d84b8fd300a8c5afd1`.

Both prove Waiting/Load-In/Shooting/Clearing/Dark at revisions
`11/13/15/17/18`, ending revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Both accept 18/18 proof intents with zero presentation/unexpected/retry/
recovery POSTs. All 20 PNGs independently match recorded hash, dimensions,
bytes, and decode. Exact role counts are `12/12/12/8/0`; held props
`0/0/3/0/0`; every mask/role/prop/luma/effects/authority/no-POST gate passes.

Landscape/Portrait minimum occupied-minus-Dark luma is `0.119559/0.103997`;
Shooting-minus-Dark is `0.141363/0.125979`. Shooting slate: landscape
875/1,125 (`0.7777778`), 33x37, owner `0.0257778`, head `2/0`; portrait
497/640 (`0.7765625`), 24x27, owner `0.034375`, head `0/0`. Portrait's bright
rail is exactly six native pixels, y `501-506`. The targeted gate passes and
manual inspection recognizes a conventional clapperboard in both aspects.

### Fresh Movie #2, reconnect, and restart regression

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Regression-20260821T190530Z/`.

- Movie2 report/release frame SHA-256:
  `93e333c96116bc46f87c49570183b90466a22da58d84bff2c48af9b56927e9aa` /
  `2d44993a03ac2025caedfdd6a43a358a27d7813dbd90f4df51dfb7663a9d44c6`.
- Reconnect report/frame SHA-256:
  `1c2c47dce92915cfba244ac72c7875e9651fc85135408fab7cc9b9b0c6ab2fa6` /
  `e2a76395022745e1e9d57f8ada892c079f2af76977b024400571a2fff1107f0c`.
- First RuntimeRestart report SHA-256
  `a9751b46bde75dd40a10c548e58618e180555486399d41420832810257bf8bc3`
  is invalid/superseded because Unity missed outage observation.
- Accepted RuntimeRestart2 ready/report/frame SHA-256:
  `c0642e800f08c0026c423a2527d69aa9430e49119275861927d1cdb3b38473e5` /
  `dd188cc5c79471e8aa1d67bc1aaf30990fb12fc3fa51792c4cd0fb7876287659` /
  `17c9fd409eb16a27ea4534395c256d37f19c2382916cbddc6c8ebf33e8101107`.
  It records one replacement, three transport outages, zero torn reads, and
  passes all five continuity gates.
- Session `3fc95257-e59b-479f-9d43-1779ea5019a3` retains revision `23`, Week
  `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Stable checkpoint
  `/private/tmp/project-studio-cp15-regression-final-20260821T190530Z/bridge-runtime/bridge-runtime-v1.json`
  is 1,354,921 bytes, journal `25`, SHA-256
  `8338000aaab6a7c3267852814b1f2f72b582b16dce3d1c76e5dcbd13fa9248a8`.

Movie2/Reconnect prove exact release identity; RuntimeRestart2 proves restart
continuity only. The first failed observation is superseded operator history,
not a product defect.

### Visual-fidelity ruling and non-Golden decision

The CP15 slate is a recognizable conventional clapperboard in both aspects.
The pair still fails because portrait action remains compressed into a narrow
middle band with large dead headroom/floor, and dominant Back UI reinforces a
prototype read. A targeted slate pass cannot substitute for overall visual
success.

CP15 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. No M5
or canonical state was created or moved.

### NEXT EXACT ACTION

Implement bounded CP16 as a presentation-only portrait-framing slice. Freeze
both StageSeven camera profiles, every role/equipment mark, and the final CP15
slate. Replace the dominant control with exact `BACK`, `112x44`, anchored
`12px` from the top/right of `Screen.safeArea` while retaining its `44x44` hit
region. Use a low-contrast charcoal fill, thin warm keyline, and `13px` cream
text; no stock-silver treatment. Add permanent collider-free Stage A overhead
battens and foreground dolly rails/ties to replace the empty portrait black/
floor bands.

Use the current handoff's exact native control rectangles and Stage A authored
names/transforms/materials for validator and focused EditMode assertions,
including collider absence; assert the NavMesh asset remains byte-identical.
Add native
framing proof-ID targets and portrait occupancy gates: each target at least
`.002` viewport area, overhead
ending above `.23`, floor beginning below `.80` and reaching at least `.92`.
Preserve schema `4` and every role/backdrop/slate/state/luma/no-POST/authority
gate without weakening. Require fresh exact 390x844 plus 1440x900 proof and
manual acceptance that the ensemble/set is the first read, `BACK` is
discoverable but subordinate, upper/lower bands read as working soundstage,
and both native aspects are equal or better. The conventional slate and at
least `3px` bright rail must remain, with faces, hands, boom, megaphone, and
slate unobscured across all five milestones. No M5 absent independent Golden
acceptance of both aspects.

### Launch

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, or promote CP15. Golden M4 remains
  sole immutable CURRENT BEST.
- Do not change either StageSeven camera profile, any role/equipment mark, CP15
  slate source/material order/pose/gates, TypeScript authority, schema/state
  semantics, or weaken all-12 role, edge, mask, luma, no-POST, Movie #2,
  reconnect, or restart gates.
- Do not stage ignored builds, Evidence/G, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### Recovery

1. Read this section, the current CP15 handoff, the promotion register's CP15
   section, ADR 0006, and the client decision.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP15, use TypeScript
   `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` plus Unity
   `0c0ef1554278441eed1d2dccac54c2d941395041`. Never mix sides.
4. Preserve the containing documentation-only direct child of TypeScript
   `d92f741...`; resolve its self SHA with `git rev-parse HEAD`. After push,
   require HEAD equal upstream and clean. Require Unity HEAD/upstream/live
   remote at `0c0ef155...` and clean.
5. Rebuild/launch with the command above; verify protocol/projection `4`, schema
   `ba9cd199...`, and authenticated readiness.
6. Use only accepted Evidence/G hashes. No M5 tag or canonical promotion is
   authorized.

## 2026-08-21 22:41 CEST - Checkpoint 16 sealed: Stage 7 inspection framing (pushed, non-Golden)

### Exact sealed state

| Component | Branch | Exact pushed compatible SHA | Direct parent / disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `69c931ff56bd550926143ad065fc36794441a839` | CP15 documentation-only seal; no TypeScript product change in CP16; local HEAD/upstream matched before this continuity edit |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603` | Direct child of CP15 `0c0ef1554278441eed1d2dccac54c2d941395041`; `feat(visuals): frame Stage 7 inspection`; exactly 9 modified paths; local HEAD/upstream/live remote matched and tracked tree clean |

This is the only compatible Checkpoint 16 development pair. It is **SEALED
NON-GOLDEN**: neither side is tagged or canonical, and CP16 is not CURRENT BEST
or ready for canonical review. Golden M4 remains the sole CURRENT BEST recovery
pair: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated
`golden/unity-convergence-m4`. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 tag or canonical state was created or
moved. CP15 is historical.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP16 changes no TypeScript,
generated DTO, V14 save, `GameState`, gameplay, identity, RNG, economy,
construction, state semantics, or authority. Both StageSeven camera profiles,
every role/equipment mark, and the final CP15 slate remain frozen.

The documentation-only commit containing this section must be the direct child
of TypeScript `69c931ff56bd550926143ad065fc36794441a839`. A commit cannot
embed its own resulting SHA, so resolve it with `git rev-parse HEAD`; after
push, require HEAD to equal configured upstream and `git status --short` to be
empty. That docs-only child changes no CP16 product or promotion fact.

### Unity source, UI, scenery, and proof scope

CP16 modifies exactly nine paths: Stage architecture authoring, scene
validation, camera director/proof runner, schema-4 Stage proof runner,
canonical `StudioLot.unity`, and three focused EditMode test files.

The native return control is exactly `BACK`, `112x44`, `12px` from the
top/right of `Screen.safeArea`, with charcoal `.12/.115/.105/.86` fill, warm
`.66/.55/.38/.72` one-pixel keyline, bold `13px` cream `.96/.89/.72` text,
and a transparent full-rect hit overlay. Exact GUI rectangles are
`(1316,12,112,44)` at 1440x900, `(266,12,112,44)` at 390x844, and
`(266,59,112,44)` for safe area `(0,34,390,763)`.

Stage A gains identity-root `Inspection Portrait Framing` with exactly eight
direct renderers and no collider, rigidbody, NavMesh obstacle, light, or
runtime-state component. The accepted transforms below explicitly supersede
the initial CP16 draft, whose longer battens/rails could not satisfy both
frozen frusta:

- batten 01 endpoints `(-1.5,9,8)->(4.7,9,8)`, radius `.08`, `Steel`;
- batten 02 endpoints `(-1.5,10.4,12)->(5.6,10.4,12)`, radius `.08`, `Steel`;
- rail L/R `x=-.7/.4`, `y=.72`, `z=-5.53->-2.53`, radius `.035`, `Steel`;
- ties `x=-.15`, `y=.705`, `z=-5.23/-4.43/-3.63/-2.83`, each size
  `1.2/.035/.08`, `HeroStageBlackSteel`.

Schema `4` retains every CP15 role/backdrop/slate/state/luma/effects/authority/
no-POST gate and adds exact aggregates `inspection-overhead-framing` (two named
battens) and `inspection-floor-framing` (two named rails plus four named ties).
Proof fail-closes exact set/cardinality, one direct renderer per object,
normal-camera framing, composite/isolated ID pixels, edge inset, portrait area
at least `.002`, overhead bottom `<=.23`, floor top `>=.80`, and floor bottom
`>=.92`.

### Accepted validation

- Canonical runs 1 and 2 each pass 32 people, 10 vehicles, 16 equipment, 4
  captures, 0 errors, 0 warnings. Logs `/tmp/cp16-canonical-final1.log` and
  `/tmp/cp16-canonical-final2.log`; SHA-256
  `392b3744c7dd4bf2fd673ca78448a67de3f8febad75a9d1a4ced00a7006fdb24` /
  `235fd744280810479cbba5b0ecd987977f152c8fee7402b6aec4300992c5c478`.
  Accepted validation JSON SHA-256
  `9ae61146c6bd5da9b602be0a66d6795a443189c329f720647e080bccacdbc21a`.
- `StudioLotNavMesh.asset` remains byte-identical: 119,012 bytes, SHA-256
  `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.
- EditMode passes 196/196. XML `/tmp/cp16-editmode-final2.xml`, SHA-256
  `9c90c91ff421649e20f762a9f9293c7a3a72aa497fb9c5202a166e450d6c8814`;
  log SHA-256
  `9dcb8956bac70a430faaded74c9e1229a1dbd907542be9e280799727295bec00`.
- Native build succeeds. `/tmp/cp16-build-macos.log`, SHA-256
  `f28da81152e851db802b576f1a50fa5c689569637986d89002f69cf3daf1aac9`.
  App: 183 files / 151,509,138 bytes. Executable: 116,116 bytes, SHA-256
  `07ee943e6494256b8966bc74d667cb9ab3d3e0a6dc292d3b9077ae9b7d104653`.
  Player DLL / `UnityPlayer.dylib` SHA-256:
  `c2e56989046ee301279374b2d5c5d5b401d4dc4d535bfee3413f34f8abb77cf5` /
  `1b87c29dc8572c521081a15359f656819bd2959ea7623013e2b69ffc995846c4`.
- Fresh TypeScript bridge passes 11 files / 100 tests; full suite passes 336
  files / 4,526 tests with 5 skipped. Logs SHA-256
  `7266d1569c0df800bc12c2b14df5d24277ad82704ec255243ae2f1e35c37f43e` /
  `45ff4439a23c0c22687c3731d4cfcf94a6ff6b4e330c981a4e175a2ac22df95c`.
- Main/bridge typechecks, build, contract drift, hygiene 1,032, assets 26/0,
  browser audit 0, and cleanup pass. Their log SHA-256 values are
  `9b130e15b37796cd618608b6c6ca20ae83a96d1707ba154e59a187669a26e8c6`,
  `855ad18a7ca3545de92d4b3fd419afe98fb76a0b095511beff0b3e65cfdaee59`,
  `01642a00c111e12c59542f0af71fc7aa1ba26732fc926658d61e0b0571de8e52`,
  `0b7f4ee0eadbaf3e903661691140c40fa5384c902bf90b72feaac890583c6e5a`,
  `97f61db6a7ba9767429e221ce92e300f2e4b7762052b7c12f1f3b3498b25ca1f`,
  `6c440b2e3b673670102a229ca397aaede2fb0b03828f3ad655e0388f21af02ed`,
  and `eca8cdcbfe26f7401eb6a2c195ae86ade0b061668be90d3a36aa68853e57d144`.

### Accepted Stage and camera evidence

Landscape Stage report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Stage7-20260821T201651Z/Landscape/stage-visual-proof-landscape.json`,
382,106 bytes, schema `4`, complete, 1440x900, SHA-256
`3765777637011c0fe81f5f7c1d3d43a513d29280f83c103a749b30ee5bad2045`.

Portrait Stage report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Stage7-20260821T201758Z/Portrait/stage-visual-proof-portrait.json`,
380,648 bytes, schema `4`, complete, 390x844, SHA-256
`b962289528fedeef7a9f4f01919a10dd9f3310e17fe90b11f1c09d0de507c9e4`.

Both failure-empty reports prove Waiting/Load-In/Shooting/Clearing/Dark at
revisions `11/13/15/17/18`, ending revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Both accept 18/18 intents with zero unexpected/presentation POSTs; role counts
remain `12/12/12/8/0`, props `0/0/3/0/0`, and all five states pass all gates.

Landscape overhead area/top/bottom/edge is
`.004117284/.08444444/.11777778/76px`; floor is
`.009300155/.85111111/.99666667/3px` (`.009422840` Dark). Portrait overhead
is `.008710050/.20023696/.22630332/40px`; floor is
`.020373071/.80450237/.92061609/67px` (`.020649532` Dark).
Landscape/portrait minimum occupied-minus-Dark luma is
`.119611323/.104021385`; Shooting-minus-Dark is
`.141321108/.125808805`.

The Shooting slate remains 875/1,125 (`.7777778`), 33x37 in landscape and
497/640 (`.7765625`), 24x27 in portrait; the conventional clapperboard and
six-pixel bright portrait rail remain.

Camera evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Camera-20260821T203100Z/`.
Landscape/portrait schema-1 complete reports SHA-256:
`f760252c901c617f1786e007d6b37e5252a00527387e4cdead7851557eec0beb` /
`7e55b377596e91d9953a72723754b41d2a0f1a49d425151bd4602de35b52536f`.
Both prove exact size/visibility/hit test, same return path, restored management
and workflow state, unchanged target/snapshot/runtime authority, and no bridge
POST. `externalActivationRequired=false` exactly; the harness performs no
physical pointer click. That explicit nonblocking limit must not be promoted
into a physical-click claim.

### Fresh Movie #2, reconnect, and restart regression

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Regression-20260821T202208Z/`.

- Movie2 report/release frame SHA-256:
  `c32b4c8cb4a157914b55b43377faa6928ac821bebc354584628787fa832dc18b` /
  `f5ae57dcb9a612ca6a096d2c1af55d4934ebb8e4f0efbd7b8b8779649af6540f`.
- Reconnect report/frame SHA-256:
  `02e3f697d744530e00ba0b80288c0674af193d84c79f151937398468590585bf` /
  `d5984df46e620a582f116f7c0edc1d17032cdb95bb4528ce917012cfa79cea6c`.
- RuntimeRestart report/ready SHA-256
  `ebf03355949f67a3807460f2cd278e544c33c56bebb0ac4bde39b242d42f6e3a` /
  `7c30ec6f1d4d622711816dc1954726f65d475aa53983696c5c284470c4358f3f`
  and RuntimeRestart2 report/ready
  `168a999fc1f872dccf6e757aca1fb14b738551fd2f6325557daf62cf4075d145` /
  `ffddbbf01956579831542c63e6d9119179685156f7e40b20e20db34e62d2c3e7`
  are failed/superseded no-kill operator attempts. Unity correctly observed no
  outage and failed closed.
- Accepted RuntimeRestart3 ready/report/frame SHA-256:
  `6c7a452b218585ec878e26caddb4a9ebac92bf8c28f3d7897fad17ee9ed37f20` /
  `3117c5d1e517b4f3720524740dcbe0f6579709d57a938d6854564430f45d49b6` /
  `bdfd1a2777b6f525dbba83c4ab392b4a3e938aef34f5c5e4071e76cf9daad042`.
  One SIGKILL yields one replacement, three transport outages, zero torn reads,
  and all five continuity gates pass.

Movie2/Reconnect prove release identity `The Reluctant Cornerstone`,
`script-0001`, `prod-0013` in session
`9b0cd1bb-ce88-426d-9c7d-5ac9800c70a5`, revision `23`, Week `22`, digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
RuntimeRestart3 is restart-only; its identity fields are blank and
`exactMovie2Released` is false. Stable checkpoint
`/private/tmp/project-studio-cp16-regression-20260821T202208Z/bridge-runtime/bridge-runtime-v1.json`
is 1,354,926 bytes, protocol `4`, revision `23`, journal `25`, SHA-256
`a63c711763c0a7a8a00056c0ff052fe85fc60663fddfbd19e89d2f1e61d20459`.

### Visual-fidelity ruling and non-Golden decision

Independent visual audit accepts landscape as equal-or-better. Portrait has no
new clipping or slate regression, but role union remains exactly `.225118488`;
the action is compressed and the upper battens read weak/floating rather than
solving the dark upper band. The bounded pass cannot substitute for overall
first-read success.

CP16 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. No M5
or canonical state was created or moved.

### NEXT EXACT ACTION

Run CP17 as a rejectable portrait-motivated camera/permanent-reblock trial.
Freeze the landscape camera, CP16 UI/framing, final slate, equipment,
five-state/authority semantics, and every existing gate. Keep portrait camera
position `(46.2,2.05,22.8)`, use target `(48.1,3.3,38.2)` and the first
viable FOV `39`. Trial asymmetric permanent shared marks, initially Antagonist
`z=39.8`, Carpenter `x~46.08`, and Camera Operator `z=31.8`; static
projection predicts role union about `.2728`.

The earlier FOV `37` plus naive `.82` compression proposal is superseded and
must not be implemented. At FOV `37`, Batten 01 projects to
`x=-7.83..395.12` at 390px; FOV `39` keeps it at `x=3.35..384.09`.
Naive `.82` compression predicts only `.2682` union, clips Carpenter, and
creates Antagonist/Supporting physical overlap.

Adopt only if all unweakened all-12 role, edge, overlap, prop, framing, luma,
effects, state, no-POST, and authority gates pass; portrait role union ratchets
to at least `.27`, the conventional slate/bright rail remain, both rails stay
fully framed, and independent native review accepts both aspects. Marks must be
honest permanent shared routes, never aspect-triggered teleports or a fake
portrait tableau. Otherwise reject the trial and retain CP16. No M5 absent
independent Golden acceptance of both aspects.

### Launch

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, or promote CP16. Golden M4 remains
  sole immutable CURRENT BEST.
- Do not weaken landscape, CP16 UI/framing, slate, equipment, all-12 role,
  edge, overlap, prop, luma, effects, state, no-POST, authority, Movie #2,
  reconnect, restart, checkpoint, NavMesh, protocol, schema, or authority gates.
- Do not implement superseded FOV `37`/naive `.82` compression, an
  aspect-triggered role teleport, or a portrait-only fake tableau. Reblocked
  marks must be honest permanent shared routes and pass both native aspects.
- Do not stage ignored builds, Evidence/H, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### Decisions and recovery

| Decision | Reason | Reversible | Evidence |
| --- | --- | --- | --- |
| Seal CP16 non-Golden; retain M4 as CURRENT BEST | Slice passes but portrait role union/composition does not | Yes after later full Golden gate | Both accepted aspects and independent ruling |
| Use corrected bounded scenery, not initial draft | Initial geometry could not fit both frozen frusta | Yes only through revalidation | Dual-frustum contract, 196/196, schema-4 reports |
| Keep CP16 Unity-only | Presentation defect requires no authority/state change | Yes through separate justified state unit | Nine-path diff, unchanged contract |
| Trial CP17 at FOV 39 with permanent shared marks | FOV 37 clips Batten 01 and naive `.82` compression misses the `.27` ratchet while creating role defects; FOV 39 is the first viable camera candidate | Yes; retain CP16 on any failed ratchet/gate | FOV-37 AABB `-7.83..395.12`, FOV-39 AABB `3.35..384.09`, predicted `.2728` union |

Only these three continuity documents belong in the containing docs-only
commit, a direct child of TypeScript `69c931ff...`; resolve its self SHA after
commit and require HEAD/upstream equality plus a clean tracked tree after push.
Native apps, Evidence/H, private profiles/checkpoint, screenshots, validation,
locks, caches, and `/tmp` files remain ignored/local. Cleanup is clear.

1. Read this CP16 entry, the top handoff, promotion CP16 section, ADR 0006, and
   the client decision. Never infer CURRENT BEST from moving branches.
2. For immutable M4 recovery, verify TypeScript `11e2cf88...` plus Unity
   `6b323354...` under both pushed M4 tags.
3. Continue CP16 only with TypeScript `69c931ff...` plus Unity `e1cfa2a1...`.
4. Resolve the containing direct child's self SHA with `git rev-parse HEAD`;
   after push require HEAD equal upstream and clean, and Unity still exactly
   `e1cfa2a1...` at HEAD/upstream/live remote with clean tracked state.
5. Launch with the command above and verify protocol/projection `4`, schema
   `ba9cd199...`, authenticated readiness, and exact compact control.
6. Use only Evidence/H hashes. RuntimeRestart/RuntimeRestart2 are superseded
   no-kill attempts; RuntimeRestart3 is accepted restart-only continuity.
7. Continue only with NEXT EXACT ACTION. No M5 or canonical promotion is
   authorized.

## 2026-08-22 02:18 CEST - Checkpoint 18 authorized: rejectable portrait camera / floor-framing trial (not implemented)

### Continuity state

| Component | Branch | Exact retained SHA | Disposition |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `f97728e7cd16a2240a0bfa08b231aa8f74dab2f2` | Pushed CP16 documentation-only seal; local HEAD/upstream match before this continuity edit; no CP17/CP18 product source |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603` | Pushed clean CP16 product; retained after complete CP17 rejection; exact CP18 trial and rollback base |

This entry authorizes one bounded CP18 experiment; it records no implementation
or pass. CP16 remains **SEALED NON-GOLDEN** and the rollback authority. Golden
M4 remains the sole CURRENT BEST pair: TypeScript
`11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under their pushed
annotated `golden/unity-convergence-m4` tags. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 or canonical state exists.

The documentation-only commit containing this entry must be the direct child
of TypeScript `f97728e7cd16a2240a0bfa08b231aa8f74dab2f2`. It changes only the
ledger, handoff and promotion register. A commit cannot embed its own resulting
SHA; resolve the self SHA with `git rev-parse HEAD`. After push, require HEAD
equal configured upstream and `git status --short` empty. Unity must remain at
`e1cfa2a1...` and clean until the authorized product trial begins.

Protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`
and TypeScript sole simulation authority remain unchanged. The retained CP16
canonical scene SHA-256 is
`b9f4133554f03b73be7f07df7286cf0840608b4529bc480abcb1d6a6c090796d`;
the byte-identical NavMesh SHA-256 is
`20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.

### Rejected predecessor findings

CP17's FOV-39 permanent shared-route candidate is rejected, not partially
adopted. Its native C5F portrait report stopped with failure after
`rehearsal-waiting`: role union `.278436005` passed the intended ratchet, but
minimum/median visibility `.460526317/.807778835` failed, Wardrobe reached the
viewport edge (`0px` inset), and pair overlap failed at Grip/PA `.386842102`,
Director/Carpenter `.329442292`, Supporting/Camera Assistant `.304951906`, and
Antagonist/Boom `.302950084`. No CP17 product commit or push exists; all trial
source was removed and both product repositories returned clean to CP16.

The ignored diagnostic report is
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/I/Stage7-20260821T225134Z/Portrait/stage-visual-proof-portrait.json`,
SHA-256 `1b5a10520f5f2e004e013d35f363da9207772c4dfb9af052ee0045d5632dae1d`.
It remains explicit failed local evidence and must not be cited as an accepted
or durable proof.

After rollback, a calibrated static CP18 camera-only search froze all CP16
scene geometry and behavior and varied only normal portrait camera position,
target and FOV. It found no candidate that jointly satisfied the `.70`
backdrop-bottom gate, complete CP16 floor framing, `.27` role union and all
remaining body/held-prop margins. That result bounds the search performed; it
does not prove universal camera impossibility and does not replace native
validation. Scripts, derived masks and `/tmp` outputs are disposable local
notes, not durable evidence or recovery authority.

### Exact authorized product trial

Start only from Unity `e1cfa2a1...`. Preserve permanently and exactly:

- every CP16 role mark, route, yaw, held prop, equipment and work target;
- five-state behavior, final slate, state and authority semantics, CP16 UI;
- landscape camera, both overhead battens, facade/backdrop, materials,
  lighting, collision, navigation and all non-floor-framing scenery; and
- TypeScript authority, protocol, projection, schema/generated DTOs, V14,
  `GameState`, identity, RNG, economy, construction and gameplay formulas.

Change only:

1. Portrait StageSeven camera position to `(46.2,3.45,22.8)`, target to
   `(48.1,4.1,38.2)`, vertical FOV `46`.
2. The six collider-free `inspection-floor-framing` direct children by one
   permanent Stage A-local `+2.50` Z translation. Rail L/R retain
   `x=-.7/.4`, `y=.72`, radius `.035`, with endpoints changed only from
   `-5.53..-2.53` to `-3.03..-.03`. Four ties retain `x=-.15`, `y=.705`,
   size `1.2/.035/.08`, with centers changed only from
   `-5.23/-4.43/-3.63/-2.83` to `-2.73/-1.93/-1.13/-.33`.
3. The portrait role-union proof threshold and focused assertions from `.22`
   to `.27`. This is a ratchet; no other gate may move downward.

The shared floor-framing translation necessarily changes some landscape rail/
tie pixels and is expressly authorized. It authorizes no landscape camera,
role, overhead, facade, prop, state or UI change and no landscape quality
waiver. Fresh native Landscape must still pass every gate and be independently
ruled equal-or-better.

### Acceptance, rejection, and recovery

Adopt CP18 only if fresh canonical validation, focused/full EditMode, native
build, both complete five-state native Stage aspects, both camera journeys,
Movie #2, reconnect, killed-engine replacement, checkpoint integrity,
TypeScript gates, cleanup and independent visual review all pass without a
weakened threshold. Portrait must meet role union `.27`; both aspects must pass
exact roles, visibility, edge, pair separation/overlap, held equipment,
backdrop, slate, overhead/floor framing, luma, effects, state, intents,
no-POST, authority, navigation and every inherited CP16 gate.

On any failure or visual rejection, remove the complete CP18 delta and retain
exactly TypeScript `f97728e...` plus Unity `e1cfa2a1...`. Do not keep a partial
camera, proof or scenery change. Do not create a tag, M5, canonical claim or
CURRENT BEST movement without a later complete both-aspect acceptance and
independent Golden ruling.

Recovery order:

1. Read this entry, the top CP18 handoff, promotion CP18 section, retained CP16
   records, ADR 0006 and the client decision.
2. Recover immutable CURRENT BEST only from both M4 tags and verify the exact
   `11e2cf88...` / `6b323354...` pair.
3. Recover the CP18 trial base or rejection point only as TypeScript
   `f97728e...` plus Unity `e1cfa2a1...`; verify scene/NavMesh hashes above.
4. Resolve this containing documentation direct child's self SHA with
   `git rev-parse HEAD`, require it equals upstream after push, and keep the
   tree clean. No ignored Evidence/I or `/tmp` artifact enters Git.

## 2026-08-22 02:46 CEST - Checkpoint 19 authorized after atomic CP18 rejection: exact pallet-support correction (not implemented)

### Continuity state

| Component | Branch | Exact retained SHA | Disposition |
| --- | --- | --- | --- |
| TypeScript continuity authority | `campaign/unity-production-convergence-80h-ts` | `54035f6e8df6ef280b02c617c80f9560509ff18b` | Pushed clean CP18 documentation-only authority; direct child of `f97728e7cd16a2240a0bfa08b231aa8f74dab2f2`; no CP18/CP19 TypeScript product source |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603` | Pushed clean CP16 product after exact atomic rollback of rejected CP18; sole CP19 trial and rejection base |

CP18 is rejected and contributes no product commit, tag, push or accepted
evidence. CP19 is only a bounded authorization; it records no implementation
or pass. CP16 remains **SEALED NON-GOLDEN** and the exact Unity rollback
authority. Golden M4 remains the sole CURRENT BEST pair: TypeScript
`11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated
`golden/unity-convergence-m4` tags. Promotion remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. No M5 or canonical state exists.

The documentation-only commit containing this entry must be the direct child
of TypeScript `54035f6e8df6ef280b02c617c80f9560509ff18b` and may modify only
this ledger, the current handoff and the promotion register. Its direct parent
is CP18 continuity `54035f6e...`, whose direct parent is CP16 continuity
`f97728e7...`. A commit cannot embed its own resulting SHA; resolve the self
SHA with `git rev-parse HEAD`. After push, require HEAD equal configured
upstream and `git status --short` empty. This boundary authorizes no TypeScript
product mutation.

Protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`
and TypeScript sole simulation authority remain unchanged. The exact retained
CP16 canonical scene SHA-256 is
`b9f4133554f03b73be7f07df7286cf0840608b4529bc480abcb1d6a6c090796d`;
the byte-identical NavMesh SHA-256 is
`20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.

### CP18 failed result and rollback

CP18 re-applied its exact authorized portrait camera, permanent shared floor-
framing translation and `.27` role-union ratchet. Fresh native portrait proof
passed Waiting and LoadIn screen-space gates. Role union was `.304502368`;
LoadIn minimum/median role visible fractions were
`.761979997/.899182916`, maximum role-pair overlap was `.229594529`, and
backdrop bottom was `.702606618`. At `scenery-load-in`, revision `13`, week
`17`, the schema-4 proof then failed closed because the exact `Load-in Pallet`
critical renderer intersected the viewport edge. No later state or Landscape
milestone is claimed. Unity exited `2`, followed by exact runtime/profile
cleanup.

The explicit failed local report is
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/J/Stage7-20260822T003217Z/Portrait/stage-visual-proof-portrait.json`,
size `180895` bytes, SHA-256
`6ab97fd6d2c5288b5341f0f085cf7f594667872f3d122062f268112b304143a8`.
The rejected local diff is `/tmp/cp18-rejected-trial.patch`, SHA-256
`759e5eb70497a7622e07573784a256cb84c02dbf10b6c3708e94c99f9eefca3a`.
Both are nondurable diagnostic material, not accepted evidence or recovery
authority. All eight CP18 paths were restored atomically; Unity HEAD, upstream
and live remote remain CP16 `e1cfa2a1...`, the tracked tree is clean, and the
scene/NavMesh identities again match the retained hashes above.

### Exact authorized CP19 product trial

Start only from clean Unity `e1cfa2a1...`. Reapply the complete CP18 delta
unchanged:

1. Set portrait StageSeven camera position `(46.2,3.45,22.8)`, target
   `(48.1,4.1,38.2)`, vertical FOV `46`.
2. Translate only the six collider-free `inspection-floor-framing` direct
   children by permanent Stage A-local `+2.50` Z. Rail L/R retain
   `x=-.7/.4`, `y=.72`, radius `.035`, and endpoints become
   `-3.03..-.03`. Four ties retain `x=-.15`, `y=.705`, size
   `1.2/.035/.08`, and centers become `-2.73/-1.93/-1.13/-.33`.
3. Ratchet the portrait role-union product gate and focused assertions
   `.22 -> .27`. No other threshold may weaken.

Add exactly one correction beyond CP18: change only the exact
`Load-in Pallet` world Y `.35 -> .69`. Keep world X/Z `(48,31)`, yaw `18`,
uniform scale `1.65`, imported asset, name, parent, state membership, material
and every other property frozen. The existing Dolly Platform center Y is
`.55` with height `.28`, so its top is exactly `.69`; the imported pallet
mesh local minimum Y is `0`. This makes `.69` the exact support-plane
candidate, not an arbitrary screen-space offset. Native proof and manual
inspection must still establish visible support, no float and no occlusion.

The static design projection for Y `.69` predicts portrait pallet AABB x
`215.065..373.569`, y-from-bottom `18.814..99.005`, with L/R/B/T margins
`215.065/16.431/18.814/744.995` px. It predicts landscape x
`747.178..962.149`, y-from-bottom `95.109..168.139`, with margins
`747.178/477.851/95.109/731.861` px. For comparison, the rejected Y `.35`
portrait AABB was y-from-bottom `-26.485..60.420`. These static margins bound
the authorized hypothesis but are not native acceptance.

The complete CP19 Unity mutation set is exactly nine paths:

1. `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
2. `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
3. `Assets/Studio/Editor/Automation/StudioSceneValidation.cs`
4. `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs`
5. `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`
6. `Assets/Studio/Scenes/StudioLot.unity`
7. `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`
8. `Assets/Studio/Tests/EditMode/StudioSceneContractTests.cs`
9. `Assets/Studio/Tests/EditMode/StudioStageVisualProofRunnerTests.cs`

Freeze every other CP16 and CP18 contract: all role marks, routes, yaws, held
props, equipment, work targets, state membership and five-state behavior;
slate, UI, state/authority semantics and TypeScript authority; landscape
camera, overhead battens, facade/backdrop, materials, lighting, collision,
navigation and every unlisted scene/source/test path. The shared floor-framing
and pallet transforms necessarily change some Landscape pixels; this narrow
consequence is authorized but creates no Landscape gate or quality waiver.

### Acceptance, rejection, and recovery

Adopt CP19 only if all of the following pass without qualification:

- canonical authoring/validation with semantic and contract equivalence after
  local-fileID/order normalization; raw `StudioLot.unity` hash equality across
  regenerations is not required because Unity may reassign local file IDs or
  serialization order, while the recorded CP16 raw hash remains rollback
  identity only;
- focused and full EditMode, cached compile, native build and Git scope/hygiene;
- fresh complete schema-4 five-state Stage proof in both Portrait and
  Landscape, with every milestone and inherited unweakened gate passing;
- manual both-aspect review confirming the pallet is visibly supported on the
  dolly, never floating, never clipped and causes no role, held-prop, slate,
  framing, state-root or other critical-renderer occlusion;
- independent equal-or-better Landscape and acceptable Portrait rulings;
- both camera journeys, Movie #2, reconnect, actual killed-engine replacement
  restart, checkpoint integrity, TypeScript authority/gates and exact cleanup.

Any failed gate, partial milestone, unsupported/floating pallet, occlusion,
visual rejection, unexpected tenth path or regression rejects the complete
CP19 delta. Revert all nine Unity paths atomically and prove the exact CP16
Unity baseline `e1cfa2a1...`, scene `b9f41335...`, NavMesh `20a8afad...`, clean
tree and matching remote. Retain the TypeScript documentation chain through
`54035f6e...` and the containing CP19 record; never keep a partial camera,
floor-framing, `.27` proof or pallet change. Do not create/move M5, alter M1-M4,
claim canonical state or move CURRENT BEST without a later completely accepted
both-aspect product and independent Golden ruling.

Recovery order:

1. Read this entry, the top CP19 handoff, promotion CP19 section, historical
   CP18/CP16 records, ADR 0006 and the client decision.
2. Recover immutable CURRENT BEST only from both M4 tags and verify exact
   TypeScript `11e2cf88...` plus Unity `6b323354...`.
3. Start CP19 continuity only from pushed TypeScript `54035f6e...`; start or
   reject the Unity trial only from exact clean CP16 `e1cfa2a1...` and verify
   the retained scene/NavMesh hashes.
4. Resolve the containing docs-only direct child's self SHA with
   `git rev-parse HEAD`; after push require HEAD equal upstream and clean.
5. Treat Evidence/J, the CP18 patch, projected margins, profiles, builds,
   screenshots, masks, locks, caches and checkpoints as local nondurable
   diagnostics unless a later acceptance record explicitly seals new evidence.

## 2026-08-22 03:44 CEST - Golden M5 sealed: Stage 7 portrait inspection

### Exact promoted state

| Component | Branch | Exact M5 SHA | Direct parent / tag |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `e5e95e54dc45252433bf96a75349f336df8dc875` | Direct child of CP18 continuity `54035f6e8df6ef280b02c617c80f9560509ff18b`; no CP19 TypeScript product-source change; annotated `golden/unity-convergence-m5` tag object `6dbd1f22802e8f39599b0545751be901a176f081` remotely peels here |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `4770e22955f2fae770445065c2bf782ef251496e` | Direct child of CP16 `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`; `feat(visuals): compose Stage 7 portrait inspection`; annotated M5 tag object `1775a85b0c0538ef417bbe1ee4adc194e727d0c8` remotely peels here |

Both product commits, configured upstreams, and live remote branch refs matched;
Unity was tracked-clean. Both M5 tags are annotated, pushed, and remote-verified.
M1-M4 were not moved or deleted.

Golden M5 supersedes M4 as the sole CURRENT BEST compatible pair and exact
build-from/recovery answer. Promotion status remains
**GOLDEN — CONTINUE CAMPAIGN**. M5 is non-canonical and not ready for canonical
merge review.

The documentation-only commit containing this entry, the current handoff, and
the promotion register must be the direct child of TypeScript M5 authority
`e5e95e54...`. It changes no product or tag fact and is not the M5 tag target.
A commit cannot embed its own resulting SHA; resolve it after commit with
`git rev-parse HEAD`, then require local HEAD, configured upstream, and live
remote to match with an empty tracked status.

Protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`,
V14, `GameState`, permanent identities, RNG, economy, construction, gameplay
law, and TypeScript sole simulation authority are unchanged. Generated DTO
copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.

### Accepted CP19 implementation

CP18 remains rejected history. Its exact source delta failed closed at portrait
LoadIn because `Load-in Pallet` touched the viewport edge; its failed report
SHA-256 is
`6ab97fd6d2c5288b5341f0f085cf7f594667872f3d122062f268112b304143a8`.
The source was atomically rolled back before CP19. No CP18 Unity commit, push,
tag, or partial product survives.

CP19 then re-applied the CP18 presentation values and added only the support
correction:

1. Portrait StageSeven camera position `(46.2,3.45,22.8)`, target
   `(48.1,4.1,38.2)`, vertical FOV `46`.
2. Exactly six collider-free floor-framing children translated permanently by
   Stage A-local `+2.50` Z: rail endpoints `-3.03..-.03`; tie centers
   `-2.73/-1.93/-1.13/-.33`.
3. Portrait role-union proof ratcheted `.22 -> .27`; no other threshold
   weakened.
4. `Load-in Pallet` raised only from world Y `.35` to `.69`, preserving X/Z
   `(48,31)`, yaw `18`, scale `1.65`, imported prefab, parent, identity,
   material, and `STATE_LoadIn` membership.

The validator and focused test require one exact pallet renderer, one Dolly
Platform collider, one Interior Floor collider, pallet bottom equal to dolly
top within `.001`, pallet bottom at/above the floor, and at least `12px` inset
in both StageSeven profiles.

The Unity commit changes exactly nine paths:

1. `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
2. `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
3. `Assets/Studio/Editor/Automation/StudioSceneValidation.cs`
4. `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs`
5. `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`
6. `Assets/Studio/Scenes/StudioLot.unity`
7. `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`
8. `Assets/Studio/Tests/EditMode/StudioSceneContractTests.cs`
9. `Assets/Studio/Tests/EditMode/StudioStageVisualProofRunnerTests.cs`

There is no TypeScript product, schema/DTO, NavMesh, role route/mark/yaw,
held-prop, state-semantic, or authority mutation. Final scene SHA-256 is
`79b5c1cb5293772453879be03942df9df30268338724bacda8e1a547e3f373af`;
NavMesh remains
`20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.

### Mechanical validation

- Final canonical runs 3/4 each pass 32 people, 10 vehicles, 16 equipment,
  four captures, zero errors, zero warnings. Log SHA-256:
  `02a02fb4d88d637b0c4b8f63a2d1a91d132520f0440bef11499962fccc72817a` /
  `9bbc5e9ec1ca67138ec4bd90e017014750f0f2f7aca92c304ff776dc5fee8f24`.
  Validation JSON SHA-256:
  `81ef17423225beeecde89847ea71aff472b1f1639acc8943d99b4c4133202e16` /
  `aab88a43ba4d23108ecc90282e1f2f00b30c19aa21385e4612db91bf2ca3fec4`.
- Raw repeated scene SHA-256 values are `2ec501d7...` / `79b5c1cb...`.
  Both contain 6,588 records and are semantically/contract equivalent after
  local-fileID/order normalization. No universal normalized SHA is recorded.
- EditMode passes 197/197. XML/log SHA-256:
  `76238cb1b1e9c76ed968eff13efef737f4056cfaa3815af4574988f385177fef` /
  `884fb755d669697df6cc30087612df96579e864136f345ffa9cbe79be0263e17`.
- Native macOS build succeeds: 183 files / 151,509,142 bytes. Build log SHA-256
  `5f46f943389617b7f04b598d8006a0640da10ee87b0a2471ddebf2781353221f`;
  executable `b00432f9...`, `Assembly-CSharp.dll` `bf8aa251...`, UnityPlayer
  `1b87c29d...`.
- Fresh TypeScript bridge passes 11 files / 100 tests; full suite passes 336
  files / 4,526 tests with 5 skipped. Log SHA-256:
  `40e551f258c256461a1a5dc452b1831ef4c2fea3695d69eeb5c7642cb58571ad` /
  `4d0d851450f6f25daece154942e313192bde2138e32714aa3615ff2345922f45`.
- Both typechecks, contract drift, production build, hygiene 1,032, assets
  26/0, browser production audit 0, Git scope, and cleanup pass.

### Accepted Stage and camera evidence

Portrait report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Stage7-20260822T011050Z/Portrait/stage-visual-proof-portrait.json`,
380,839 bytes, schema `4`, complete, 390x844, SHA-256
`a5da02b556bb36138e13c248f1f0cea037088ffd2f4a670a0ed6458c7642d49a`.

Landscape report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Stage7-20260822T011141Z/Landscape/stage-visual-proof-landscape.json`,
382,208 bytes, schema `4`, complete, 1440x900, SHA-256
`271e6f7b82c11234a2ea48dd0e28b644406dc0f3c6735181019068053e5b1cfb`.

Both prove Waiting/LoadIn/Shooting/Clearing/Dark at revisions
`11/13/15/17/18`, final revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Both accept 18/18 intents with zero unexpected/presentation POSTs. Exact roles
are `12/12/12/8/0`; held props `0/0/3/0/0`; every gate passes and all
critical-root edge/outside lists are empty.

Portrait role union is `.304502368`, above `.27`. LoadIn minimum/median role
visible fractions are `.761954784/.899288893`, maximum overlap `.229637414`,
minimum edge `7px`, backdrop bottom `.702606618`. Landscape union remains
`.283333331`; LoadIn fractions `.721335709/.830210865`, maximum overlap
`.278664291`, minimum edge `142px`, backdrop bottom `.723333359`.

Portrait Dark/occupied-minimum/Shooting luma is
`.117711358/.226177484/.253625691`; landscape is
`.116124548/.235534251/.257450879`. All deltas pass. Shooting slate is
602/602 pixels at 24x27 portrait and 875/1,125 at 33x37 landscape.

Landscape/portrait camera report SHA-256 values are
`9ae6bfcb02c069538303e6f057c2123177c556f7314a1f2d4c0ca0ccf6acb6aa` /
`5a386c65b2a76fcca373fd875861d592be700bf63afe364f1dae71cb625614b3`.
Both complete four shots/five transitions with exact Stage/Admin joins,
collision displacement/recovery, unchanged authority, no bridge POST, and
restored management/workflow state.

### Movie2, reconnect, restart, and checkpoint

Evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Regression-20260822T011626Z/`.

- Movie2 report/release frame SHA-256:
  `ff496335150a8b4d7a196d0eaa6a1ac608d523d3f95c2862e263c8a32c1277c1` /
  `ba3dc5f88b53acb70215bd53bdd5d28eac33384e37acf2146b92a13310e8caf1`.
- Reconnect report/frame:
  `3f07791bc3e50cd48dbd5f0b8a394567495c3f080cb634d9a73e3bd186868075` /
  `b79810d62fa1493ad76499688288d6cbfb081fcd795d2ad9c0a8ac81dc840481`.
- Runtime-restart ready/report/frame:
  `81057de110ff134065f3baf0d80038903687a4f62f543e209835be33ecbde341` /
  `57bc2a2c1e7e129c3ae461a5adf6a34abed2f083cb740a594bbc2aa3fd7ecdbe` /
  `5a5a49e0f2bc6b5549857e3e8f9131841447cfb4a6f2d2037d0a9e7bbf879807`.

Movie2/Reconnect prove `The Reluctant Cornerstone`, `script-0001`,
`prod-0013`, revision `23`, Week `22`, digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
saved/restored digest
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
The actual killed-engine run records one outage, one replacement, stable
authority, disabled actions, retained projection, and zero torn reads.

Stable checkpoint is 1,354,903 bytes, protocol `4`, revision `23`, journal
`25`, SHA-256
`2a3f7f35ece6ae7e01f739a9678df3b34c79d325f5fb66acb468fcd4f27d4fa8`.
Seven launch leases are stopped with engine/Unity null; only the restart lease
records one engine restart. No product process remains.

### Golden ruling

Independent native review accepts both aspects, the supported pallet, portrait
first read, and equal-or-better landscape. Portrait role union improves from
CP16 `.225118488` to `.304502368`; all 12 silhouettes, slate, boom,
megaphone, state changes, and filmmaking action read clearly. The review rules
ADR 0006 satisfied, with no P0/P1.

M5 remains non-canonical because only P2 boundaries remain:

- `npm run studio` still uses the pinned `vite-node` development graph;
  emitted production packaging/direct packaged audit remain;
- TypeScript `main` needs isolated semantic reconciliation and full validation;
- camera proof records `externalActivationRequired=false`; no physical
  foreground mouse/touch activation is claimed;
- restart-only metadata leaves identity blank and
  `exactMovie2Released=false`, while its ordinal-2 milestone and invariants
  pass;
- pallet automation proves vertical contact, not full footprint containment;
  the frozen geometry overlaps the Dolly Platform by `45.36%` in X and `100%`
  in Z, and native visual review accepts that support;
- upper-ceiling/batten emphasis, pallet contact shadow, and scenery-flat depth
  remain optional polish; and
- 25/50/100 scalability and the wider ugly-condition matrix remain open.

### NEXT EXACT ACTION

Preserve Golden M5. On moving branches, first productionize/package the local
engine and directly audit the emitted graph; then reconcile TypeScript `main`
in an isolated merge candidate. Add real foreground mouse/touch activation
proof, 25/50/100 scalability, and only non-regressive visual polish. Every
continuation is non-Golden by default. Do not invent, create, or move M6 absent
a later complete independent Golden ruling.

Recovery order:

1. Read the top handoff, promotion M5 section, this entry, ADR 0006, and the
   client decision.
2. Recover/build only from both annotated M5 tags; verify tag objects
   `6dbd1f22...` / `1775a85b...` peel to `e5e95e54...` / `4770e229...`.
3. Never mix M5 with M4 or moving branch tips; keep M1-M5 immutable.
4. Verify protocol/projection `4`, schema `ba9cd199...`, DTO `1192d58a...`,
   scene `79b5c1cb...`, and NavMesh `20a8afad...`.
5. Resolve/push the containing docs-only direct child separately; it is not
   tagged product authority.
6. Use only accepted Evidence/K hashes. Evidence/J and CP18 patches remain
   failed local diagnostics; builds/profiles/checkpoints/masks/logs stay
   ignored and unstaged.

## 2026-08-23 13:52 CEST - Checkpoint 20 sealed: genuine foreground player journey (pushed, non-Golden)

CP20 closes the M5 P2 gap "real foreground mouse/touch activation proof" for
mouse input and ships the raw-founding player workflow. Golden M5 is unchanged
and remains sole CURRENT BEST; CP20 creates no tag.

Product commits, in order, on the moving branches:

- TypeScript (`campaign/unity-production-convergence-80h-ts`, parent
  `37aa4a8731f2fa78f28d7d5730ac79fa626e63cf`):
  1. `d0223c1af50b610e30c290ae26c6413e6373b8c9` raw Week-0 founding opening
     with GUI cast choice (schema
     `sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61`);
  2. `eb70acc19cdb608545cce0406c3507ba70019019` forward-migrate prior
     protocol-4 checkpoints;
  3. `3c5a90be9a9b08a6101cf1eca06158b144f38b69` schema-7 raw-founding
     in-flight evidence contract;
  4. `5eb80ed472093d63a5e9cf7d4c40998fcc934f89` memorable `npm run play`
     owner launcher (campaign tip).
- Unity (`campaign/unity-production-convergence-80h-client`, parent Unity M5
  `4770e22955f2fae770445065c2bf782ef251496e`):
  1. `a1fc23dfa827ccf38c929d4c00815e841ec5bf7d` regenerated DTO sync
     (byte-identical pair SHA-256
     `6bb617490900c903a6ebcb29bf6e32a338c473ba0d33c10e763088f8f794c81e`);
  2. `05279457a969222b80ab056b7b5e02233c7bc3b9` semantic `_Loop` animation
     import (30 loop clips loop; `Idle_No_Loop` stays non-looping);
  3. `e2f3fdbe4c58b226b9bcec5833f08b002aeac228` player workflow facts and
     founding/cast-choice panel;
  4. `0cadf221ef5b1c2ea0aa5e70f8aeba1efb9c4d67` Boom Operator mark
     `48.99 -> 49.09 X` with refreshed held Boom Microphone pose (scene
     `475c89ceffc009aa5ef06092995b0e918ffd3658e48e48d72891bf044cf963b7`,
     NavMesh unchanged `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`);
  5. `84b0c6d9a393b7a0169e71a336f050086db070ea` raw-founding automation
     prelude for bridge/stage proofs;
  6. `2b1562f80b7d8645765f5506a0deaf147f6aeb9e` passive player journey
     recorder (campaign tip).

Validation (prior session, tree byte-identical at seal): Unity EditMode
261/261; macOS build SUCCESS, codesign VALID; TypeScript 337 files / 4,540
passed / 5 skipped; both typechecks; contract drift; production build;
hygiene; 3D asset audit; `git diff --check` both repos.

Accepted evidence (local, ignored, exact SHA-256):

- Stage landscape
  `Evidence/R/CP20-Stage-BoomMark-Final-20260822T100014Z/Landscape/stage-visual-proof-landscape.json`
  400,748 bytes
  `5921d91c5e72f78598202366334be0669aba1d44a5d7dc2af42d48d432ac7b72`;
  portrait `.../Portrait/stage-visual-proof-portrait.json` 399,122 bytes
  `d42872044d6ae4faa476fb003d81a915c0cf5f8c9ce9e1b092c5359bbca0ffb6` — both
  schema 6, complete, 5/5, authority-identical, representative frames.
- Bridge
  `Evidence/R/CP20-Bridge-BoomMark-Final-20260822T100620Z/Main/bridge-client-proof.json`
  25,283 bytes
  `1ce8ed0ffbcfed91672d51f413f6cd97942fc3bcec6b82abf188b1c9c9003a92` —
  schema 7, 12/12, exact founding 7+1, Movie #2, save/load, zero restart
  budget.
- Genuine foreground PlayerJourney (completed this checkpoint,
  2026-08-23T11:43:35Z)
  `Evidence/R/CP20-PlayerJourney-Foreground-20260823T112246Z/Main/studio-player-journey-proof.json`
  91,275 bytes, schema 2, complete,
  `d9c90971d2a011ec19ef9469858764b0761299598ec80249fc1eb80b4ad460f0`, 38
  milestone screenshots. Console unlocked (`IOConsoleLocked = No`); all input
  was OS-level HID mouse events (`CGEventPost`, accessibility-trusted
  external process) into the frontmost supervised player. 49 attempts = 49
  accepted (47 commands + 1 save + 1 load), `zeroProofDirectSubmissions=true`,
  exact 7+1 founding, construction before development, both picture chains
  with the exact blocker detour twice, Picture 1 `Echoes of Undertow`
  (`script-0000`/`prod-0002`, FLOP), Picture 2 `The Reluctant Cornerstone`
  (`script-0001`/`prod-0013`, HIT), final revision 48 Week 22, saved =
  restored = final digest
  `4834455c7368f1c0345bad625fd6854c1ab320a6a93c570a1484c0b4fd35306e`, zero
  outages/replacements/torn reads, exit 0, exact process cleanup.

Native visual ruling: KEEP — boom relationship believable, role spacing
centered as intended, portrait strong, landscape not worse than M5.

Recorded, not fixed: cosmetic founding-literal indentation in
`bridge/session.ts` (P3); uncapped cast cross-product at greenlight (P2);
owner-machine launcher layout (by design); stage evidence remains
representative-frame. Open M5 P2 work continues: emitted packaging + audit,
TypeScript `main` reconciliation, 25/50/100 scalability, polish.

The docs-only commit containing this entry is the direct child of TypeScript
CP20 tip `5eb80ed472093d63a5e9cf7d4c40998fcc934f89`; resolve its self SHA
after commit and require HEAD/upstream/live-remote equality with a clean
tracked tree.

## 2026-08-23 14:20 CEST - Checkpoint 21 sealed: emitted production studio graph (pushed, non-Golden)

CP21 closes the first M5 P2 item: the local engine launcher is productionized
and its emitted dependency graph is directly audited. Golden M5 unchanged;
no tag created. The Unity client is untouched and remains CP20 tip
`2b1562f80b7d8645765f5506a0deaf147f6aeb9e`.

Product commits on `campaign/unity-production-convergence-80h-ts` (parent CP20
docs child `2278d083ae53044f079f372dd1cfbef4fb0fdb29`):

1. `ca6f8b4334cdbe107922e5331d12306414ef0497` emit the production studio
   graph with a fail-closed audit — `scripts/build-studio.mjs` (esbuild
   pinned `0.25.12`) bundles `bridge/supervisor/cli-packaged.ts` ->
   `dist/studio/studio.mjs` and `bridge/server.ts` ->
   `dist/studio/engine.mjs`; `scripts/audit-studio-packaged.mjs` fails
   closed unless the metafile graph is exactly first-party TypeScript plus
   node builtins; the supervisor's explicit `engineEntry` option selects
   `graph=emitted` vs `graph=vite-node-dev` with no fallback; packaged
   lifecycle test added.
2. `ea940aec4f7e13434ab8df855f221c9387515dfa` `npm run play` /
   `PLAY_PROJECT_STUDIO.command` emit, audit, and launch the packaged graph
   (campaign tip); READMEs updated.

Validation (fresh, post-change): bridge+main typechecks; contract drift
verified; browser production build; hygiene 1,038; 3D assets 26/0; browser
dependency audit 0; launcher syntax; full suite 337 files / 4,542 passed /
5 skipped (adds the packaged supervisor lifecycle test); `git diff --check`
clean. Unity EditMode not rerun — Unity tree byte-identical to sealed CP20.

Emitted package (ignored, reproducible; byte-identical across independent
rebuilds this session): `studio.mjs` 114,142 bytes SHA-256
`24c7597d6f85a2ccdbb16ee8a81fd1f79e68b9bad10b7817b23f9d3ccbb93ae5`;
`engine.mjs` 1,020,266 bytes SHA-256
`cf2624bb0727e465a538c5238623e75dc64c381690ef816b3d3f019f083b73fd`; audit:
78 inputs, all first-party (18 bridge / 55 src / 5 ui-src), zero
node_modules, only `node:` externals.

Accepted native evidence — packaged-runtime bridge client proof through the
real owner launcher:
`Evidence/R/CP21-Packaged-BridgeProof-20260823T121807Z/Main/bridge-client-proof.json`,
25,279 bytes, schema 7, complete, captured 2026-08-23T12:18:39Z, SHA-256
`8e72c6f29308d4da62b8cd873f2e1a7fa06e5358033207109c9a8db7e7d0b96f`, twelve
milestone captures. Raw-founding opening digest `3d8d2876...` identical to
the development graph; 27-intent prelude with exact 7+1 founding accounting;
Movie #2 `The Reluctant Cornerstone` released with `exactMovie2Released=true`
at revision 50 Week 22; saved = restored digest `4b9bded9...`; exact
`STALE_REVISION` rejection with retained projection; ~119.8 FPS; zero
outages/replacements; supervisor `graph=emitted`; Unity exit 0; exact
cleanup.

One CP21 launch mistake is recorded honestly: the first evidence attempt
passed a nonexistent `-studioBridgeProof` flag, so the app idled as a normal
game; it was shut down cleanly through the supervisor and relaunched with the
real `-studioBridgeAutoProof` flag. No proof threshold was touched.

The docs-only commit containing this entry is the direct child of TypeScript
CP21 tip `ea940aec4f7e13434ab8df855f221c9387515dfa`; resolve its self SHA
after commit and require HEAD/upstream/live-remote equality with a clean
tracked tree.

## 2026-08-23 14:42 CEST - Checkpoint 22 sealed: 25/50/100 scalability gate passed (pushed, non-Golden)

CP22 runs the long-open 25/50/100-person scalability gate (Phase H stress /
Phase L p95) and passes with wide headroom. Golden M5 unchanged; no tag.
TypeScript product source untouched.

Unity commit on `campaign/unity-production-convergence-80h-client` (parent
CP20 tip `2b1562f80b7d8645765f5506a0deaf147f6aeb9e`):
`c7a19dcd5b8c74b57a9053a1a2c0cf8b07bbd48e` — passive 25/50/100 scalability
stress proof (`StudioScalabilityProofRunner` + contract tests + three-line
bootstrap install; exactly five paths). Scene/NavMesh/DTO byte-identical;
clones are proof-only runtime objects with bookkeeping components stripped
and explicitly synthetic naming.

Validation: Unity EditMode 271/271 (adds 10 contract tests); macOS rebuild
SUCCESS + codesign VALID; `git diff --check` clean; native bridge auto proof
rerun on the rebuilt player: complete, exact Movie #2, revision 50, 119.6
FPS (`Evidence/R/CP22-Bridge-Regression-20260823T124042Z/Main/bridge-client-proof.json`,
25,247 bytes, SHA-256
`ab2c9a21dcd0fffa56007cf2c509dc2bf80b497f1fae412eba8c6daff9cbd504`).

Accepted scalability evidence (packaged runtime through the real owner
launcher; raw-founding opening `3d8d2876...`; baseline 4 ambient people):
`Evidence/R/CP22-Scalability-20260823T123843Z/Main/studio-scalability-proof.json`,
4,047 bytes, schema 1, complete, SHA-256
`211f32669d7ebbd9ec6f201e23dfdac0b9d0cf04d997bb181de7f76e7b888cc5`, three
tier captures. Tier results (M3 Max, 1440x900): 25 people p95 9.06 ms /
119.8 FPS / 1,686 draw calls; 50 people p95 9.05 ms / 119.4 FPS / 2,824
draw calls; 100 people p95 9.35 ms / 119.5 FPS / 5,923 draw calls / 2.87M
triangles / 457 MB working set. Every tier: exact population, all clones
on mesh, zero error logs, authority byte-identical afterwards (revision 0,
zero attempts/outages/replacements/torn reads). The 60 FPS p95 floor is the
first scalability ratchet; p99 and per-device budgets remain future
strengthening. Visual ruling: KEEP — natural distribution, no stacking or
T-posing; the 100-person lot notably improves perceived aliveness (recorded
as ambient-density polish input).

The docs-only commit containing this entry is the direct child of TypeScript
CP21 docs child `4fd6a8126433c237d02bbfdc6cf60df433e56c97`; resolve its self
SHA after commit and require HEAD/upstream/live-remote equality with a clean
tracked tree.
