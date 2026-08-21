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
| B - Durable local game runtime | Active | Checkpoints 7/8 provide durable authenticated restart continuity; sealed Checkpoint 9 proves exact command/save/load response-loss recovery; the one-command supervisor remains the current gate |
| C - Unity client architecture | Partial | Protocol, runtime continuity, projection cache/client, interaction, proof, and presentation seams exist; the spike still needs broader production decomposition |
| D - Full Movie journey in Unity | Partial at inherited baseline | Automated native Movie #2 path passes, but the interaction surface remains proof-oriented and does not yet provide the approved professional retained workspaces |
| E - Lot interaction / construction / management | Partial at inherited baseline | TypeScript construction intent and visible construction state pass; direct build placement interaction is not productionized in Unity |
| F - Hero Soundstage 7 | Partial at inherited baseline | Exterior and inspectable interior exist; interior is visually bare and lacks an operating production company |
| G - Characters and authored animation | Partial at inherited baseline | Provenance-cleared assets, Mecanim setup, 32 animators, and seven active people exist; quality and role activity are below target |
| H - Purposeful people / NavMesh | Partial at inherited baseline | Seven visible people are active on NavMesh; 25/50/100 stress gates are untouched |
| I - Camera / occlusion / inspection | Partial at inherited baseline | Tycoon camera and judging cameras exist; professional interaction QA is untouched |
| J - World / era / campus quality | Partial at inherited baseline | Campus scale reads; surroundings, density, hills, and 1948 specificity remain weak |
| K - Materials / lighting / VFX / audio | Partial at inherited baseline | URP presentation exists; prototype surfaces and sparse soundstage lighting dominate |
| L - Performance / scalability | Baseline only | M3 Max measurements captured; no 25/50/100 scalability campaign yet |
| M - Resilience | Partial | Stale/duplicate, durable save/load, idle restart, outage retention, malformed protocol, and exact lost-response recovery pass; default supervisor and the full ugly-condition matrix remain incomplete |
| N - Professional QA | Active | Full TypeScript, Unity EditMode, native build, native Movie #2, actual process-kill, evidence-verifier, and runtime capture gates are established and run per checkpoint |

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
