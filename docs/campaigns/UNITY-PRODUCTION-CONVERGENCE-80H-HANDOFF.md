# Unity Production Convergence 80H - Current Handoff

START HERE. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, then the campaign
ledger, this handoff, and the promotion register. The TypeScript/Unity engine
decision is settled. Do not restart planning from scratch.

## CHECKPOINT 21 SEALED - NON-GOLDEN CAMPAIGN TIP

CP21 productionizes the local engine launcher and audits the emitted graph —
the first item of the M5 P2 boundary. It is **non-Golden**; Golden M5 remains
the sole formal CURRENT BEST. No M6 tag exists or is implied.

### CURRENT EXACT STATE

Timestamp: 2026-08-23 14:20 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` at `ea940aec4f7e13434ab8df855f221c9387515dfa`; CP21 commits `ca6f8b4334cdbe107922e5331d12306414ef0497` (emitted production graph + fail-closed audit) and `ea940aec...` (launcher emits/audits/launches packaged graph) on top of the CP20 docs child `2278d083ae53044f079f372dd1cfbef4fb0fdb29` |
| Unity production client | unchanged this checkpoint; remains CP20 tip `2b1562f80b7d8645765f5506a0deaf147f6aeb9e` |
| Contract | Unchanged: protocol `4`, projection `4`, schema `sha256:f84ae77e...`, DTO pair `6bb61749...`; no simulation, identity, or gameplay-law change |
| Emitted package | `npm run build:studio` -> `dist/studio/studio.mjs` (114,142 bytes, SHA-256 `24c7597d6f85a2ccdbb16ee8a81fd1f79e68b9bad10b7817b23f9d3ccbb93ae5`) and `dist/studio/engine.mjs` (1,020,266 bytes, SHA-256 `cf2624bb0727e465a538c5238623e75dc64c381690ef816b3d3f019f083b73fd`); byte-identical across independent rebuilds this session; `dist/` stays ignored |
| Packaged-graph audit | `npm run audit:studio-packaged` PASS: 78 metafile inputs, all first-party (`bridge/` 18, `src/` 55, `ui/src/` 5), zero `node_modules` inputs, only `node:` externals, no development loader, no UI-side dependencies |

### ACCEPTED CP21 PRODUCT

- `scripts/build-studio.mjs` emits the supervisor
  (`bridge/supervisor/cli-packaged.ts`) and engine (`bridge/server.ts`) as
  self-contained node ESM bundles with an esbuild (pinned `0.25.12`)
  metafile.
- `scripts/audit-studio-packaged.mjs` fails closed on any non-first-party
  input, development-loader segment, UI dependency, missing output, or
  non-builtin external.
- The supervisor takes an explicit `engineEntry` option: the packaged entry
  supervises its emitted sibling `engine.mjs`; the development entry
  (`npm run studio`) keeps the pinned vite-node graph; no flag, environment
  variable, or fallback chooses the graph. Spawn reports say
  `graph=emitted` / `graph=vite-node-dev`.
- `npm run play` / `PLAY_PROJECT_STUDIO.command` now emit, audit, and launch
  the packaged graph; READMEs updated.

### VALIDATION STATE

All fresh this checkpoint, after the source change: bridge typecheck PASS;
main typecheck PASS; contract drift verified; production (browser) build
PASS; repository hygiene 1,038 files PASS; 3D assets 26/0 PASS; browser
dependency audit 0 vulnerabilities; `zsh -n` launcher syntax PASS; full suite
**337 files / 4,542 passed / 5 skipped** including the new packaged-graph
supervisor lifecycle test (emits, audits, ready line, `graph=emitted`, clean
exit 0, no vite-node in output); `git diff --check` clean. Unity EditMode was
not rerun: the Unity worktree is byte-identical to sealed CP20.

### ACCEPTED NATIVE EVIDENCE

Packaged-runtime bridge client proof, launched through the real owner
launcher (`PLAY_PROJECT_STUDIO.command` -> emit -> audit -> emitted
supervisor -> emitted engine -> real Unity player):

- `Evidence/R/CP21-Packaged-BridgeProof-20260823T121807Z/Main/bridge-client-proof.json`,
  25,279 bytes, schema `7`, status `complete`, captured
  `2026-08-23T12:18:39Z`, SHA-256
  `8e72c6f29308d4da62b8cd873f2e1a7fa06e5358033207109c9a8db7e7d0b96f`, plus
  the twelve milestone captures `01`-`11` and `10b`.
- Raw-founding opening (revision 0, week 0, digest `3d8d2876...` — identical
  to the vite-node graph's deterministic opening); automation prelude 27
  intents with exact 7+1 founding accounting; Movie #2
  `The Reluctant Cornerstone` (`script-0001`/`prod-0013`) released,
  `exactMovie2Released=true`; final revision `50`, Week `22`; saved =
  restored digest `4b9bded953cb14eb38bb26d496fb4f5d621c6556816e3d8b3f339822ad743d2c`;
  stale intent rejected `STALE_REVISION` with retained projection; average
  FPS `119.8`; zero runtime replacements/outages; supervisor log shows
  `graph=emitted`; Unity exit code 0; cleanup complete; no residual product
  process.

### KNOWN BOUNDARIES AFTER CP21

- Emitted packaging covers the local owner launch. Public distribution still
  needs install/update behavior and profile backup (unchanged P2).
- TypeScript `main` reconciliation, 25/50/100 scalability, the ugly-condition
  matrix, and optional visual polish remain open (unchanged P2).
- CP20 notes stand: cosmetic founding-literal indentation (P3), uncapped cast
  cross-product at greenlight (P2), owner-machine launcher layout by design.

### NEXT EXACT ACTION

Keep M5 immutable. Next bounded P2 work in priority order: reconcile
TypeScript `main` in an isolated merge candidate with full revalidation; then
25/50/100 scalability and ugly-condition proof; targeted visual polish only
when it preserves all M5 gates. Every continuation is non-Golden by default;
do not create or move an M6 tag without a later complete independent Golden
ruling.

### RECOVERY INSTRUCTIONS

1. Golden recovery remains M5-only (see the M5 section below).
2. CP21 campaign tips: TypeScript `ea940aec...` (plus its docs child),
   Unity `2b1562f8...` (unchanged CP20). Both pushed; HEAD = upstream =
   live remote with clean tracked trees.
3. `dist/studio` is emitted, ignored, and reproducible: rebuild with
   `npm run build:studio` and verify the audit plus the bundle SHA-256
   values above.

## CHECKPOINT 20 SEALED - NON-GOLDEN CAMPAIGN TIP

CP20 is sealed, validated, and pushed on both moving campaign branches. It is
**non-Golden**; Golden M5 below remains the sole formal CURRENT BEST and the
only build-from/recovery authority. No M6 tag exists or is implied.

### CURRENT EXACT STATE

Timestamp: 2026-08-23 13:52 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` at `5eb80ed472093d63a5e9cf7d4c40998fcc934f89`; four CP20 commits (`d0223c1a...`, `eb70acc1...`, `3c5a90be...`, `5eb80ed4...`) on top of the pushed M5 docs child `37aa4a8731f2fa78f28d7d5730ac79fa626e63cf` |
| Unity production client | `campaign/unity-production-convergence-80h-client` at `2b1562f80b7d8645765f5506a0deaf147f6aeb9e`; six CP20 commits (`a1fc23df...`, `05279457...`, `e2f3fdbe...`, `0cadf221...`, `84b0c6d9...`, `2b1562f8...`) directly on top of Unity M5 `4770e22955f2fae770445065c2bf782ef251496e` |
| Contract | Protocol `4`, projection `4`, schema `sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61`; DTO copies byte-identical at SHA-256 `6bb617490900c903a6ebcb29bf6e32a338c473ba0d33c10e763088f8f794c81e` |
| Scene / NavMesh | `StudioLot.unity` SHA-256 `475c89ceffc009aa5ef06092995b0e918ffd3658e48e48d72891bf044cf963b7`; `StudioLotNavMesh.asset` unchanged at `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04` |
| Golden | M5 unchanged and immutable in both repos (`golden/unity-convergence-m5`); CP20 creates no tag |

### ACCEPTED CP20 PRODUCT

- TypeScript: fresh runtimes open at exact revision-zero Week 0 raw founding
  under the versioned deterministic adopted-authority seed; seven
  `signFoundingContract` signings then one `foundStudio`; audition-evidence
  cast-choice greenlight intents; forward-migration of prior protocol-4
  checkpoints (open founding drafts refused fail-closed); schema-7 in-flight
  evidence contract; `npm run play` / `PLAY_PROJECT_STUDIO.command` owner
  launcher (owner-machine layout by design).
- Unity: player-workflow facts for every accepted GUI mutation (button screen
  rect, layout/repaint nonce, command identity, route revisions, attempt and
  accepted counters); founding/cast-choice/reception workflow panel and
  selection receipt HUD; semantic `_Loop` animation import so the 30 intended
  loop clips actually loop (`Idle_No_Loop` intentionally non-looping); Boom
  Operator shooting mark `48.99 -> 49.09 X` with refreshed held Boom
  Microphone pose; raw-founding automation prelude for the schema-7 bridge
  proof and schema-6 stage proof; the passive player journey recorder.

### VALIDATION STATE

Validated by the prior session against exactly this tree (byte-identical at
seal, re-verified 2026-08-23): Unity EditMode 261/261; macOS player build
SUCCESS with valid codesign; TypeScript 337 files / 4,540 passed / 5 skipped;
main+bridge typechecks; contract drift check; production build; repository
hygiene; 3D asset audit; `git diff --check` clean in both repos. No source
change occurred after those gates; this session added only local evidence.

### ACCEPTED NATIVE EVIDENCE

Stage (rebuilt player, both aspects authority-identical, schema 6, complete,
5/5 milestones; representative frames — they do not claim every instant of
every animation loop):

- `Evidence/R/CP20-Stage-BoomMark-Final-20260822T100014Z/Landscape/stage-visual-proof-landscape.json`,
  400,748 bytes, SHA-256
  `5921d91c5e72f78598202366334be0669aba1d44a5d7dc2af42d48d432ac7b72`.
- `Evidence/R/CP20-Stage-BoomMark-Final-20260822T100014Z/Portrait/stage-visual-proof-portrait.json`,
  399,122 bytes, SHA-256
  `d42872044d6ae4faa476fb003d81a915c0cf5f8c9ce9e1b092c5359bbca0ffb6`.

Bridge (schema 7, 12/12 milestones, exact founding 7+1, Movie #2, save/load,
stale-state/checkpoint joins, zero restart budget):

- `Evidence/R/CP20-Bridge-BoomMark-Final-20260822T100620Z/Main/bridge-client-proof.json`,
  25,283 bytes, SHA-256
  `1ce8ed0ffbcfed91672d51f413f6cd97942fc3bcec6b82abf188b1c9c9003a92`.

**Genuine foreground PlayerJourney proof (the CP20 blocker, completed
2026-08-23):**

- `Evidence/R/CP20-PlayerJourney-Foreground-20260823T112246Z/Main/studio-player-journey-proof.json`,
  91,275 bytes, schema `2`, status `complete`, captured
  `2026-08-23T11:43:35Z`, SHA-256
  `d9c90971d2a011ec19ef9469858764b0761299598ec80249fc1eb80b4ad460f0`,
  plus 38 milestone screenshots `00`-`37` in the same root.
- Method: macOS console unlocked (`IOConsoleLocked = No`); every input was a
  physical-path foreground interaction — OS-level HID mouse events posted via
  `CGEventPost` from an external accessibility-trusted process into the
  frontmost supervised player window (`node .../supervisor/cli.ts` +
  `-studioPlayerJourneyProof`). No direct handler invocation, no fake click,
  no test shortcut.
- Result: 49 attempts = 49 accepted (47 commands + 1 save + 1 load);
  `zeroProofDirectSubmissions=true`; exact 7+1 founding; construction before
  Picture 1 development; both full picture beat chains including the exact
  director-dispatch -> scenery-load-in -> take-scheduling detour twice;
  Picture 1 `Echoes of Undertow` (`script-0000`/`prod-0002`, FLOP); Picture 2
  `The Reluctant Cornerstone` (`script-0001`/`prod-0013`, HIT); final
  revision `48`, Week `22`; saved = restored = final digest
  `4834455c7368f1c0345bad625fd6854c1ab320a6a93c570a1484c0b4fd35306e`; session
  `b26bd3d9-6366-49c4-b7ed-e51dcfaabe43`, runtime
  `29d1294d-c29f-463c-b6c5-22d808770b60`, zero outages/replacements/torn
  reads; Unity exit code 0; supervisor cleanup complete; no residual product
  process.

This completes the M5 P2 item "real foreground mouse/touch activation proof"
for mouse input on the guided journey. It does not claim touch input, and the
prior camera proof's `externalActivationRequired=false` record stands as
history.

### VISUAL RULING

Native review of the CP20 stage evidence accepts the result: the Boom
Operator reads naturally with a believable raised-boom relationship, sits
centered between Supporting Actor and Camera Assistant in both aspects, role
spacing is good, filmmaking language (dolly, camera, boom, slate, director)
remains readable, no bad occlusion or prop clipping, portrait remains strong,
landscape is not worse than M5. KEEP.

### KNOWN P2/P3 NOTES (RECORDED, NOT FIXED IN CP20)

- `bridge/session.ts` founding intent literal has mis-indented
  `projectId`/`castingSessionId`/`productionId` fields — cosmetic only (P3).
- `castsFromReviewedAuditions` enumerates the full lead x antagonist x
  support cross product with no cap; bounded today by the founding roster,
  but it will inflate the intent surface as rosters grow (P2).
- The launcher hardcodes the owner-machine sibling layout by design.
- Landscape/portrait stage evidence remains representative-frame; per-instant
  animation-loop continuity is covered by import semantics tests, not frames.
- M5 P2 items still open: emitted production packaging + packaged-graph
  audit; TypeScript `main` reconciliation; 25/50/100 scalability and the
  ugly-condition matrix; optional visual polish.

### NEXT EXACT ACTION

Keep M5 immutable. Continue bounded non-Golden P2 work in priority order:
first productionize/package the local engine launcher and audit the emitted
graph; then reconcile TypeScript `main` in an isolated merge candidate; then
25/50/100 scalability and ugly-condition proof; targeted visual polish only
when it preserves all M5 gates. Do not create or move an M6 tag without a
later complete independent Golden ruling.

### DO NOT TOUCH

- Everything in the M5 DO NOT TOUCH list below remains binding.
- Do not weaken the player journey acceptance contract or represent any
  synthetic in-process activation as physical foreground interaction.
- Do not stage Evidence/R, private profiles/checkpoints, builds, screenshots,
  logs, or scratch tooling.

### RECOVERY INSTRUCTIONS

1. Golden recovery remains M5-only (see the M5 section below).
2. The CP20 campaign tips are `5eb80ed4...` (TypeScript) and `2b1562f8...`
   (Unity); both pushed with HEAD = configured upstream = live remote and
   clean tracked trees.
3. CP20 evidence roots are local and ignored; verify by the exact SHA-256
   values above. The PlayerJourney profile/supervisor logs were session
   scratch, not evidence.

## GOLDEN M5 SEALED - SOLE CURRENT BEST

Golden M5 is the exact build-from and recovery authority. Checkpoint 19 passed
the complete both-aspect visual, authority, lifecycle, regression, and Git
gates; an independent ruling found no P0/P1 and accepted the result against ADR
0006. M5 supersedes M4 as sole CURRENT BEST while remaining non-canonical and
not ready for canonical merge review. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

### CURRENT EXACT STATE

Timestamp: 2026-08-22 03:44 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript authority | `/Users/bruce/The Movies - Unity Production Convergence 80H`; `campaign/unity-production-convergence-80h-ts`; `e5e95e54dc45252433bf96a75349f336df8dc875`; direct child of CP18 continuity `54035f6e8df6ef280b02c617c80f9560509ff18b`; no CP19 TypeScript product-source change |
| Unity production client | `/Users/bruce/Project Studio - Unity Production Convergence 80H`; `campaign/unity-production-convergence-80h-client`; `4770e22955f2fae770445065c2bf782ef251496e`; direct child of CP16 `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`; exactly nine paths |
| Golden tag | Pushed annotated `golden/unity-convergence-m5` in both repositories |
| TypeScript tag identity | Tag object `6dbd1f22802e8f39599b0545751be901a176f081`; remote peel `e5e95e54dc45252433bf96a75349f336df8dc875` |
| Unity tag identity | Tag object `1775a85b0c0538ef417bbe1ee4adc194e727d0c8`; remote peel `4770e22955f2fae770445065c2bf782ef251496e` |
| Git state before this seal | Both product HEADs equalled configured upstream and live remote; Unity tracked tree clean; all M1-M4 tags preserved unchanged |
| Promotion | Golden M5 is sole CURRENT BEST; `GOLDEN — CONTINUE CAMPAIGN`; non-canonical |

The three continuity documents containing this seal must form the
documentation-only direct child of TypeScript M5 authority `e5e95e54...`.
That child is not the M5 tag target and changes no product fact. A commit cannot
embed its own resulting SHA; resolve it after commit with `git rev-parse HEAD`,
then require local HEAD, configured upstream, and live remote to match with an
empty tracked status.

Protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`,
V14, `GameState`, identities, RNG, economy, construction, gameplay formulas,
and TypeScript sole simulation authority remain unchanged. The generated DTO
copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.

### ACCEPTED CP19 PRODUCT

CP19 re-applies the accepted CP18 presentation hypothesis and adds the exact
pallet-support correction:

- portrait StageSeven camera position `(46.2,3.45,22.8)`, target
  `(48.1,4.1,38.2)`, vertical FOV `46`;
- the six collider-free floor-framing children translated permanently by
  Stage A-local `+2.50` Z: rail endpoints `-3.03..-.03` and tie centers
  `-2.73/-1.93/-1.13/-.33`;
- portrait role-union proof ratcheted from `.22` to `.27`; and
- `Load-in Pallet` raised only from world Y `.35` to `.69`, retaining X/Z
  `(48,31)`, yaw `18`, scale `1.65`, imported model, identity, parent,
  material, and `STATE_LoadIn` membership.

The validator and focused test require exactly one pallet renderer, one Dolly
Platform collider, and one Interior Floor collider. The pallet renderer bottom
equals the dolly top within `.001`, remains at or above the floor, and projects
with at least `12px` inset in both sealed StageSeven profiles.

The committed Unity scope is exactly:

1. `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
2. `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
3. `Assets/Studio/Editor/Automation/StudioSceneValidation.cs`
4. `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs`
5. `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`
6. `Assets/Studio/Scenes/StudioLot.unity`
7. `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`
8. `Assets/Studio/Tests/EditMode/StudioSceneContractTests.cs`
9. `Assets/Studio/Tests/EditMode/StudioStageVisualProofRunnerTests.cs`

Canonical `StudioLot.unity` SHA-256 is
`79b5c1cb5293772453879be03942df9df30268338724bacda8e1a547e3f373af`.
`StudioLotNavMesh.asset` remains byte-identical at SHA-256
`20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.

### ACCEPTED VALIDATION

- Final canonical runs 3/4 each pass 32 people, 10 vehicles, 16 equipment,
  four captures, zero errors, and zero warnings. Log SHA-256 values are
  `02a02fb4d88d637b0c4b8f63a2d1a91d132520f0440bef11499962fccc72817a`
  and `9bbc5e9ec1ca67138ec4bd90e017014750f0f2f7aca92c304ff776dc5fee8f24`;
  validation JSON SHA-256 values are
  `81ef17423225beeecde89847ea71aff472b1f1639acc8943d99b4c4133202e16`
  and `aab88a43ba4d23108ecc90282e1f2f00b30c19aa21385e4612db91bf2ca3fec4`.
- The repeated raw scene SHA-256 values are
  `2ec501d71bfa66756679225e00542c462bc5f6c51b3d1fdc3b2c9655d60dad64`
  and the accepted `79b5c1cb...`. Both contain 6,588 Unity YAML records and
  are semantically/contract equivalent after local-fileID/order
  normalization. No universal normalized SHA is claimed.
- EditMode passes 197/197. XML SHA-256 is
  `76238cb1b1e9c76ed968eff13efef737f4056cfaa3815af4574988f385177fef`;
  log SHA-256 is
  `884fb755d669697df6cc30087612df96579e864136f345ffa9cbe79be0263e17`.
- Native macOS build succeeds. Log SHA-256 is
  `5f46f943389617b7f04b598d8006a0640da10ee87b0a2471ddebf2781353221f`;
  app is 183 files / 151,509,142 bytes. Executable SHA-256 is
  `b00432f98d8cb03e2ac4bd3f1255e21e091385ba97b057ab0f075896989438c6`;
  `Assembly-CSharp.dll` is
  `bf8aa251942d9bbe43075ad1be3d943bd5b9de3fa7f616a4a7ab9fd6254a1dda`;
  `UnityPlayer.dylib` is
  `1b87c29dc8572c521081a15359f656819bd2959ea7623013e2b69ffc995846c4`.
- Fresh TypeScript bridge passes 11 files / 100 tests; the full suite passes
  336 files / 4,526 tests with 5 skipped. Log SHA-256 values are
  `40e551f258c256461a1a5dc452b1831ef4c2fea3695d69eeb5c7642cb58571ad`
  and `4d0d851450f6f25daece154942e313192bde2138e32714aa3615ff2345922f45`.
- Main/bridge typechecks, contract drift, build, hygiene 1,032, assets 26/0,
  and browser production audit 0 all pass. Log SHA-256 values are respectively
  `9b130e15b37796cd618608b6c6ca20ae83a96d1707ba154e59a187669a26e8c6`,
  `855ad18a7ca3545de92d4b3fd419afe98fb76a0b095511beff0b3e65cfdaee59`,
  `0b7f4ee0eadbaf3e903661691140c40fa5384c902bf90b72feaac890583c6e5a`,
  `027d50f29b82114084295b35c5cce56e1ca195544f22ea51b487d936cd875aa7`,
  `97f61db6a7ba9767429e221ce92e300f2e4b7762052b7c12f1f3b3498b25ca1f`,
  `6c440b2e3b673670102a229ca397aaede2fb0b03828f3ad655e0388f21af02ed`,
  and `eca8cdcbfe26f7401eb6a2c195ae86ade0b061668be90d3a36aa68853e57d144`.

### ACCEPTED NATIVE EVIDENCE

Portrait Stage report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Stage7-20260822T011050Z/Portrait/stage-visual-proof-portrait.json`,
380,839 bytes, schema `4`, complete, 390x844, SHA-256
`a5da02b556bb36138e13c248f1f0cea037088ffd2f4a670a0ed6458c7642d49a`.

Landscape Stage report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Stage7-20260822T011141Z/Landscape/stage-visual-proof-landscape.json`,
382,208 bytes, schema `4`, complete, 1440x900, SHA-256
`271e6f7b82c11234a2ea48dd0e28b644406dc0f3c6735181019068053e5b1cfb`.

Both prove Waiting/LoadIn/Shooting/Clearing/Dark at revisions
`11/13/15/17/18`, ending revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Both accept 18/18 intents with zero unexpected or presentation POSTs. Exact
visible role counts are `12/12/12/8/0`; held props are `0/0/3/0/0`; every
screen/state/role/prop/effect/luma gate passes; all critical-root edge/outside
lists are empty.

Portrait role union is `.304502368`, clearing the strengthened `.27` gate.
LoadIn minimum/median role-visible fractions are
`.761954784/.899288893`, maximum pair overlap `.229637414`, minimum edge
`7px`, and backdrop bottom `.702606618`. Landscape role union remains
`.283333331`; LoadIn fractions are `.721335709/.830210865`, maximum overlap
`.278664291`, minimum edge `142px`, and backdrop bottom `.723333359`.

Portrait Dark/occupied-minimum/Shooting luma is
`.117711358/.226177484/.253625691`; the two Dark deltas are
`.108466126/.135914326`. Landscape equivalents are
`.116124548/.235534251/.257450879`, with deltas
`.119409703/.141326338`. All pass. The Shooting slate is 602/602 pixels,
24x27 portrait, and 875/1,125 pixels, 33x37 landscape.

Camera reports at
`Evidence/K/Camera-20260822T011455Z/Landscape/camera-proof.json` and
`Portrait/camera-proof.json` are complete schema `1`, 23,975/23,956 bytes,
SHA-256
`9ae6bfcb02c069538303e6f057c2123177c556f7314a1f2d4c0ca0ccf6acb6aa` /
`5a386c65b2a76fcca373fd875861d592be700bf63afe364f1dae71cb625614b3`.
Both four-shot/five-transition journeys prove exact Stage/Admin joins,
settled blends, collision displacement/recovery, unchanged authority, no bridge
POST, and restored management/workflow state.

Regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/K/Regression-20260822T011626Z/`.

- Movie2 report/release frame SHA-256:
  `ff496335150a8b4d7a196d0eaa6a1ac608d523d3f95c2862e263c8a32c1277c1` /
  `ba3dc5f88b53acb70215bd53bdd5d28eac33384e37acf2146b92a13310e8caf1`.
- Reconnect report/frame SHA-256:
  `3f07791bc3e50cd48dbd5f0b8a394567495c3f080cb634d9a73e3bd186868075` /
  `b79810d62fa1493ad76499688288d6cbfb081fcd795d2ad9c0a8ac81dc840481`.
- Runtime-restart ready/report/frame SHA-256:
  `81057de110ff134065f3baf0d80038903687a4f62f543e209835be33ecbde341` /
  `57bc2a2c1e7e129c3ae461a5adf6a34abed2f083cb740a594bbc2aa3fd7ecdbe` /
  `5a5a49e0f2bc6b5549857e3e8f9131841447cfb4a6f2d2037d0a9e7bbf879807`.

Movie2/Reconnect prove `The Reluctant Cornerstone`, `script-0001`,
`prod-0013`, revision `23`, Week `22`, digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
and exact save/load digest
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
The actual killed-engine run records one outage, one replacement, stable
authority, disabled actions, retained projection, and zero torn reads.

Stable checkpoint
`/private/tmp/project-studio-cp19-regression-20260822T011626Z/bridge-runtime/bridge-runtime-v1.json`
is 1,354,903 bytes, protocol `4`, revision `23`, journal `25`, SHA-256
`2a3f7f35ece6ae7e01f739a9678df3b34c79d325f5fb66acb468fcd4f27d4fa8`.
All seven launch leases are stopped with engine/Unity null; only the accepted
restart lease records one engine restart. No live product process remains.

### RULING AND P2 BOUNDARY

Independent visual review accepts both aspects, the supported pallet, the
portrait first read, and equal-or-better landscape. Portrait role union rises
from CP16 `.225118488` to `.304502368`; role silhouettes, slate, boom,
megaphone, stage state, and filmmaking action are readable. CP19 satisfies ADR
0006 for this Golden gate. No P0/P1 remains.

M5 is deliberately non-canonical. Remaining P2 work is explicit:

- `npm run studio` still executes the pinned `vite-node` development graph;
  emitted production packaging and a direct packaged dependency audit remain;
- TypeScript `main` has a large semantic divergence requiring deliberate
  isolated merge-candidate reconciliation and full revalidation;
- camera proof uses the in-product hit target and return path but records
  `externalActivationRequired=false`; it does not prove a physical foreground
  mouse/touch activation;
- the restart-only report leaves movie identity fields blank and therefore
  says `exactMovie2Released=false`; its exact released ordinal-2 milestone and
  all restart invariants pass;
- pallet automation proves vertical contact, not full footprint containment;
  the frozen geometry overlaps the Dolly Platform by `45.36%` in X and `100%`
  in Z, and native visual review accepts that support;
- upper-ceiling/batten emphasis, pallet contact-shadow depth, and abstract
  scenery-flat treatment remain optional polish, not failed recognizability;
  and
- 25/50/100 scale and the broader ugly-condition matrix remain unrun.

### NEXT EXACT ACTION

Keep M5 immutable and take only bounded P2 work on moving branches. First
productionize the local engine launcher/package and audit that emitted graph;
then reconcile TypeScript `main` in an isolated merge candidate. Add a real
foreground mouse/touch activation proof, run 25/50/100 scalability, and perform
targeted visual polish only when it preserves all M5 gates. Every continuation
is non-Golden by default. Do not invent, create, or move an M6 tag without a
later complete independent Golden ruling.

### DO NOT TOUCH

- Do not move, delete, or retarget M1-M5; do not infer a compatible pair from
  moving branches.
- Do not move simulation authority, state semantics, gameplay law, or durable
  identity into Unity.
- Do not weaken M5 role, held-prop, framing, backdrop, slate, luma, effects,
  state, no-POST, authority, Movie2, reconnect, restart, checkpoint, schema,
  protocol, Git, or both-aspect visual gates.
- Do not stage Evidence/K, private profiles/checkpoints, builds, masks,
  screenshots, logs, locks, caches, controller-noise patches, or `/tmp` files.

### RECOVERY INSTRUCTIONS

1. Recover/build only from both pushed annotated
   `golden/unity-convergence-m5` tags.
2. Verify TypeScript tag object `6dbd1f22...` peels to `e5e95e54...` and Unity
   tag object `1775a85b...` peels to `4770e229...`.
3. Use isolated clean worktrees; never mix M5 with M4 or moving branch tips.
4. Verify protocol/projection `4`, schema `ba9cd199...`, DTO SHA
   `1192d58a...`, scene `79b5c1cb...`, and NavMesh `20a8afad...`.
5. Treat the containing docs-only child as continuity, not the tagged product;
   resolve its self SHA and require HEAD/upstream/live-remote equality after
   push.
6. Use only accepted Evidence/K hashes above. Evidence/J and the rejected CP18
   patch remain explicit failed diagnostics.
7. Continue only with the bounded P2 action above; M5 stays sole CURRENT BEST.

## CHECKPOINT 19 AUTHORIZATION - HISTORICAL PRE-IMPLEMENTATION BOUNDARY

The following section preserves the exact rejectable authorization as it stood
before CP19 implementation. Its present-tense restrictions and M4 disposition
are historical and are superseded by the Golden M5 authority above.

Checkpoint 18 is rejected in full after its fresh native portrait proof failed
closed on the exact Load-in Pallet renderer. Its source delta was removed
atomically, so Checkpoint 16 remains the pushed, clean, sealed non-Golden
product and rollback baseline. The only authorized continuation is the exact
CP19 trial below: reapply CP18 unchanged and add only the Load-in Pallet support
height correction. CP19 is not implemented, validated, sealed, Golden, tagged,
canonical, promoted, or CURRENT BEST. Golden M4 remains the sole CURRENT BEST
recovery pair.

### CURRENT EXACT STATE AND CONTINUITY BOUNDARY

Timestamp: 2026-08-22 02:46 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree / branch | `/Users/bruce/The Movies - Unity Production Convergence 80H`; `campaign/unity-production-convergence-80h-ts` |
| TypeScript pushed CP18 continuity authority | `54035f6e8df6ef280b02c617c80f9560509ff18b`; direct child of CP16 authority `f97728e7cd16a2240a0bfa08b231aa8f74dab2f2`; local HEAD and configured upstream match before this continuity edit; product source authority is unchanged |
| Containing CP19 authorization document | These three continuity documents must form the documentation-only direct child of `54035f6e8df6ef280b02c617c80f9560509ff18b`. A commit cannot embed its own resulting SHA; resolve the self SHA with `git rev-parse HEAD`. After push, HEAD must equal configured upstream and the tracked tree must be clean. |
| Unity worktree / branch | `/Users/bruce/Project Studio - Unity Production Convergence 80H`; `campaign/unity-production-convergence-80h-client` |
| Unity retained CP16 product / rollback authority | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`; HEAD/configured upstream/live remote match and tracked tree is clean after complete CP18 rejection |
| Retained CP16 scene / NavMesh identity | Canonical `StudioLot.unity` SHA-256 `b9f4133554f03b73be7f07df7286cf0840608b4529bc480abcb1d6a6c090796d`; `StudioLotNavMesh.asset` SHA-256 `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04` |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; rejected CP18 and authorized CP19 change no promotion fact |

Protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`
and TypeScript's sole simulation authority remain frozen. CP19 may not change
TypeScript product source, generated contracts, V14, `GameState`, identity,
RNG, economy, construction, gameplay formulas, or state semantics.

### REJECTED CP18 RESULT

CP18 re-applied the exact authorized portrait camera, permanent shared floor-
framing translation and `.27` role-union ratchet. The native schema-4 portrait
proof passed the Waiting and LoadIn screen-space gates, including role union
`.304502368`, LoadIn minimum/median role visible fractions
`.761979997/.899182916`, maximum role-pair overlap `.229594529`, and backdrop
bottom `.702606618`. It nevertheless failed closed at `scenery-load-in`,
revision `13`, week `17`, because the exact `Load-in Pallet` critical renderer
intersected the portrait viewport edge. No later milestone or aspect is
claimed. Unity exited `2`, and exact runtime/profile cleanup completed.

The rejected local diagnostic is
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/J/Stage7-20260822T003217Z/Portrait/stage-visual-proof-portrait.json`,
size `180895` bytes, SHA-256
`6ab97fd6d2c5288b5341f0f085cf7f594667872f3d122062f268112b304143a8`.
It is explicit failed local evidence, not accepted or durable proof. The exact
rejected source diff is preserved only as disposable local engineering material
at `/tmp/cp18-rejected-trial.patch`, SHA-256
`759e5eb70497a7622e07573784a256cb84c02dbf10b6c3708e94c99f9eefca3a`.
Every CP18 source and scene mutation was removed atomically; no CP18 Unity
product commit or push exists. TypeScript continuity `54035f6e...` records the
authorization history but changes no product source.

### NEXT EXACT ACTION

Implement one rejectable CP19 presentation-only trial from the exact clean CP16
Unity product. Reapply the exact CP18 delta unchanged:

- set the portrait StageSeven camera position to `(46.2,3.45,22.8)`, target
  to `(48.1,4.1,38.2)`, and vertical FOV to `46`;
- translate only the six collider-free direct children in
  `inspection-floor-framing` by Stage A-local `+2.50` on Z;
- retain rail L/R at `x=-.7/.4`, `y=.72`, radius `.035`, but change their
  local Z endpoints from `-5.53..-2.53` to `-3.03..-.03`;
- retain the four ties at `x=-.15`, `y=.705`, size `1.2/.035/.08`, but change
  their local Z centers from `-5.23/-4.43/-3.63/-2.83` to
  `-2.73/-1.93/-1.13/-.33`; and
- ratchet the portrait role-union threshold from `.22` to `.27` in product
  proof and focused tests. This is a stronger gate, never permission to weaken
  any other threshold.

Add only one correction beyond CP18: change the exact `Load-in Pallet` world Y
from `.35` to `.69`. Preserve its world X/Z `(48,31)`, yaw `18`, uniform scale
`1.65`, imported model, parent, name, state membership, material and every other
property. `.69` is the exact top of the existing Dolly Platform
(`.55 + .28/2`), and the imported pallet mesh has local minimum Y `0`, so this
places the pallet on that support instead of introducing a free-floating offset.
This geometric rationale is static only; native proof and manual inspection
must establish actual support, no float, and no new occlusion.

Freeze every other CP16/CP18 contract: CP16 role marks, routes, yaws, held props,
equipment, work targets, slate, five-state behavior, state/authority semantics,
UI, landscape camera,
both overhead battens, facade/backdrop, materials, lighting, collision,
NavMesh, and every other framing child and source path. No aspect-triggered
role movement, camera roll, custom projection, portrait-only tableau, or
authority mutation is authorized.

The static projection predicts the raised pallet AABB at portrait x
`215.065..373.569`, y-from-bottom `18.814..99.005`, leaving L/R/B/T margins
`215.065/16.431/18.814/744.995` px. At landscape it predicts x
`747.178..962.149`, y-from-bottom `95.109..168.139`, leaving margins
`747.178/477.851/95.109/731.861` px. The rejected `.35` placement projected
portrait y-from-bottom `-26.485..60.420`. These are design calculations, not
native acceptance and not permission to weaken the edge rule.

The complete authorized Unity diff is exactly these nine paths and no others:

1. `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
2. `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
3. `Assets/Studio/Editor/Automation/StudioSceneValidation.cs`
4. `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs`
5. `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`
6. `Assets/Studio/Scenes/StudioLot.unity`
7. `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`
8. `Assets/Studio/Tests/EditMode/StudioSceneContractTests.cs`
9. `Assets/Studio/Tests/EditMode/StudioStageVisualProofRunnerTests.cs`

The six floor-framing children and raised pallet are shared permanent scene
geometry. Their rail/tie/pallet pixels may therefore change in landscape only
as the direct consequence of the authorized transforms; this narrow pixel
change is explicit and is not a landscape waiver. Adoption requires fresh
native five-state reports in both aspects, with every milestone passing every
unweakened gate, plus independent equal-or-better visual review.

### ADOPTION / REJECTION GATE

Adopt CP19 only after clean canonical validation, focused and full EditMode,
native build, fresh five-state Stage proof in both aspects, both camera
journeys, Movie #2, reconnect, actual engine-replacement restart, checkpoint
integrity, TypeScript gates, Git hygiene, and independent native visual review
all pass. In particular:

- portrait role union is at least `.27` under the strengthened product gate;
- all 12 required roles preserve exact active/visible sets, edge inset,
  visibility, body overlap and centroid-separation gates;
- all held equipment preserves exact sets, area, edge, visibility,
  owner/head relationship and pair-overlap gates;
- backdrop/facade, slate, overhead framing and translated floor framing pass
  every area/band/edge/normal-camera condition in all required states;
- the Load-in Pallet is fully inside the viewport at every active milestone in
  both aspects and is manually confirmed supported on the dolly, not floating,
  and not occluding any role, held prop, slate, framing or critical renderer;
- luma, effects, no-POST, intent, state, authority, schema and navigation gates
  remain unweakened; and
- fresh landscape is equal-or-better despite the expressly authorized shared
  floor-framing and pallet pixel movement.

Repeated canonical generation must be semantically and contract equivalent
after local-fileID/order normalization. Raw `StudioLot.unity` byte/hash equality
between regenerations is not required because Unity may reassign local file IDs
or serialization order; the retained CP16 raw hash remains exact rollback
identity, not a CP19 generation-determinism gate.

Any failed gate, clipped renderer, unsupported/floating pallet, new occlusion,
body/held-prop collision, visual regression, unexpected path, or independent
rejection invalidates the whole trial. Remove every CP19 source/scene mutation
atomically and return Unity exactly to CP16 `e1cfa2a1...`; retain the pushed
TypeScript continuity chain through `54035f6e...` and the containing docs-only
CP19 record. Do not cherry-pick a partial camera, proof, scenery or pallet
change.
No M5 exists absent a later independent Golden ruling over a completely
accepted both-aspect product.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, promote CP16/CP19, or infer CURRENT
  BEST from a moving branch. Golden M4 is the sole immutable CURRENT BEST.
- Do not revive any CP17 role reblock or alter CP16 role routes, marks, yaws,
  props, equipment, work targets, UI, state, authority, landscape camera,
  overhead framing, facade, lighting, collision, or NavMesh.
- Do not move any scenery except the exact six floor-framing children by the
  exact shared `+2.50` Z translation and the exact Load-in Pallet Y
  `.35 -> .69`. Landscape pixel change is authorized only for the resulting
  floor-framing rails/ties and pallet and must still pass every gate.
- Do not weaken role, held-prop, framing, backdrop, slate, luma, effects,
  state, no-POST, authority, Movie #2, reconnect, restart, checkpoint, schema,
  protocol, or Git gates. The only threshold change is `.22 -> .27`.
- Do not treat the rejected Evidence/J report, CP18 patch, `/tmp` calculations,
  masks, screenshots, profiles, builds, locks, caches, or checkpoints as accepted
  evidence or stage them in Git.

### RECOVERY INSTRUCTIONS

1. Read this CP19 boundary, the retained CP16 sections below, the historical
   CP18 ledger entry, promotion CP19 section, ADR 0006, and the client decision.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88...` plus Unity `6b323354...`.
3. For current continuity, start from pushed TypeScript `54035f6e...`; for the
   exact Unity reject/rollback base use `e1cfa2a1...` and verify the retained
   scene and NavMesh hashes above.
4. Preserve the containing documentation-only direct child of TypeScript
   `54035f6e...`; resolve its self SHA with `git rev-parse HEAD`, then require
   HEAD equal configured upstream and clean after push.
5. Implement only NEXT EXACT ACTION across exactly nine Unity paths. If it does
   not receive complete fresh native both-aspect acceptance, restore the exact
   CP16 Unity rollback base atomically and record the rejection rather than
   advancing the product tip.

## CHECKPOINT 16 SEALED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

Checkpoint 16 is the pushed, compatible Stage 7 inspection-framing slice on
top of Checkpoint 15. Its compact return control and permanent framing scenery
pass the bounded proof, but the pair is not Golden, tagged, canonical,
promoted, or CURRENT BEST because portrait composition still fails. Golden M4
remains the sole CURRENT BEST recovery pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 22:41 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript CP16 compatible authority / pushed parent | `69c931ff56bd550926143ad065fc36794441a839`; CP15 documentation seal; no TypeScript product change in CP16; local HEAD and configured upstream match before this continuity edit |
| Containing documentation seal | This section belongs in the documentation-only direct child of `69c931ff56bd550926143ad065fc36794441a839`. A commit cannot embed its own resulting SHA; resolve its self SHA with `git rev-parse HEAD`. After push, HEAD must equal configured upstream and the tracked tree must be clean. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity CP16 product / pushed | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`; direct child of CP15 `0c0ef1554278441eed1d2dccac54c2d941395041`; `feat(visuals): frame Stage 7 inspection`; exactly 9 modified paths |
| Unity branch tip / working tree | Local HEAD, configured upstream, and live remote branch all equal `e1cfa2a1...`; tracked tree clean |
| Compatible CP16 pair | TypeScript `69c931ff56bd550926143ad065fc36794441a839` plus Unity `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; CP16 is SEALED NON-GOLDEN and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP16 changes no TypeScript,
schema/generated contract, V14 save, `GameState`, gameplay formula, RNG,
identity, economy, construction rule, state semantics, or authority. Both
StageSeven camera profiles, every role/equipment mark, and the final CP15 slate
remain frozen.

### CAMPAIGN STATUS

- Golden M4 remains the immutable build/recovery answer. CP16 is the moving
  development tip and does not supersede that authority.
- CP16 changes exactly nine Unity paths. It adds a compact safe-area `BACK`
  control, permanent collider-free Stage A framing, fail-closed schema-4
  framing proof, canonical-scene validation, and focused tests.
- Fresh scene validation, 196/196 EditMode, native build, both five-state Stage
  aspects, both camera journeys, Movie #2, reconnect, actual killed-engine
  replacement, checkpoint integrity, and full TypeScript gates pass.
- Landscape is equal-or-better and the bounded slice succeeds. Portrait keeps
  every role/framing/slate gate but remains compressed at role union
  `.225118488`; upper battens are weak/floating in first read.
- CP15 is historical. No M5 tag, canonical state, or Golden pointer was
  created or moved. Cleanup is clear.

### WHAT WAS JUST DONE

- Replaced the dominant old control with exact `BACK`, `112x44`, anchored
  `12px` from the top/right of `Screen.safeArea`. Its fill is charcoal
  `.12/.115/.105/.86`, its one-pixel keyline warm `.66/.55/.38/.72`, and its
  bold `13px` text cream `.96/.89/.72`; the transparent overlay keeps the full
  `112x44` hit region.
- Exact GUI rectangles are `(1316,12,112,44)` at 1440x900,
  `(266,12,112,44)` at 390x844, and `(266,59,112,44)` for safe area
  `(0,34,390,763)`.
- Added identity-root `Inspection Portrait Framing` under Stage A with exactly
  eight direct renderers and no collider, rigidbody, NavMesh obstacle, light,
  or runtime-state component.
- The following accepted geometry explicitly supersedes the initial CP16
  draft, which could not fit both frozen frusta:
  batten 01 `(-1.5,9,8)->(4.7,9,8)` and batten 02
  `(-1.5,10.4,12)->(5.6,10.4,12)`, radius `.08`, `Steel`; rails
  `x=-.7/.4`, `y=.72`, `z=-5.53->-2.53`, radius `.035`, `Steel`; ties at
  `x=-.15`, `y=.705`, `z=-5.23/-4.43/-3.63/-2.83`, size
  `1.2/.035/.08`, `HeroStageBlackSteel`.
- Added exact aggregate proof IDs `inspection-overhead-framing` with two named
  battens and `inspection-floor-framing` with two named rails plus four named
  ties. The proof requires exact set/cardinality, one direct renderer per
  object, normal-camera framing, composite and isolated pixels, edge inset,
  `.002` portrait area, overhead bottom `<=.23`, floor top `>=.80`, and floor
  bottom `>=.92` without weakening any earlier gate.
- Modified exactly these nine paths:
  `StudioLotArchitectureAuthoring.cs`, `StudioSceneValidation.cs`,
  `StudioCameraDirector.cs`, `StudioCameraProofRunner.cs`,
  `StudioStageVisualProofRunner.cs`, `StudioLot.unity`,
  `StudioCameraPresentationTests.cs`, `StudioSceneContractTests.cs`, and
  `StudioStageVisualProofRunnerTests.cs`.

### WHAT IS WORKING RIGHT NOW

The obvious current development launch uses the exact CP16 branch pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Rebuild the ignored compatible app only when absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/cp16-rebuild.log \
  -quit
```

These moving worktrees launch CP16, not immutable M4. For exact CURRENT BEST
recovery/build, use both M4 tags recorded in the promotion register.

### ACCEPTED VALIDATION

| Gate | Accepted result |
| --- | --- |
| Canonical scene | `/tmp/cp16-canonical-final1.log` SHA-256 `392b3744c7dd4bf2fd673ca78448a67de3f8febad75a9d1a4ced00a7006fdb24` and `/tmp/cp16-canonical-final2.log` SHA-256 `235fd744280810479cbba5b0ecd987977f152c8fee7402b6aec4300992c5c478` each pass 32 people / 10 vehicles / 16 equipment / 4 captures / 0 errors / 0 warnings; accepted validation JSON SHA-256 `9ae61146c6bd5da9b602be0a66d6795a443189c329f720647e080bccacdbc21a` |
| NavMesh | `StudioLotNavMesh.asset`, 119,012 bytes, remains byte-identical at SHA-256 `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04` |
| EditMode | 196/196; `/tmp/cp16-editmode-final2.xml` SHA-256 `9c90c91ff421649e20f762a9f9293c7a3a72aa497fb9c5202a166e450d6c8814`; log SHA-256 `9dcb8956bac70a430faaded74c9e1229a1dbd907542be9e280799727295bec00` |
| Native app | Success; `/tmp/cp16-build-macos.log` SHA-256 `f28da81152e851db802b576f1a50fa5c689569637986d89002f69cf3daf1aac9`; 183 files / 151,509,138 bytes; executable 116,116 bytes / `07ee943e6494256b8966bc74d667cb9ab3d3e0a6dc292d3b9077ae9b7d104653`; player DLL `c2e56989046ee301279374b2d5c5d5b401d4dc4d535bfee3413f34f8abb77cf5`; `UnityPlayer.dylib` `1b87c29dc8572c521081a15359f656819bd2959ea7623013e2b69ffc995846c4` |
| TypeScript bridge/full | 11 files / 100 passed, log SHA-256 `7266d1569c0df800bc12c2b14df5d24277ad82704ec255243ae2f1e35c37f43e`; 336 files / 4,526 passed / 5 skipped, log SHA-256 `45ff4439a23c0c22687c3731d4cfcf94a6ff6b4e330c981a4e175a2ac22df95c` |
| TypeScript static/build | Main typecheck `9b130e15b37796cd618608b6c6ca20ae83a96d1707ba154e59a187669a26e8c6`; bridge typecheck `855ad18a7ca3545de92d4b3fd419afe98fb76a0b095511beff0b3e65cfdaee59`; build `01642a00c111e12c59542f0af71fc7aa1ba26732fc926658d61e0b0571de8e52`; only accepted chunk warning |
| TypeScript audits | Contract drift `0b7f4ee0eadbaf3e903661691140c40fa5384c902bf90b72feaac890583c6e5a`; hygiene 1,032 / `97f61db6a7ba9767429e221ce92e300f2e4b7762052b7c12f1f3b3498b25ca1f`; assets 26/0 / `6c440b2e3b673670102a229ca397aaede2fb0b03828f3ad655e0388f21af02ed`; browser audit 0 / `eca8cdcbfe26f7401eb6a2c195ae86ade0b061668be90d3a36aa68853e57d144` |

### ACCEPTED FIVE-STATE STAGE PROOF

Landscape report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Stage7-20260821T201651Z/Landscape/stage-visual-proof-landscape.json`,
382,106 bytes, schema `4`, complete, 1440x900, SHA-256
`3765777637011c0fe81f5f7c1d3d43a513d29280f83c103a749b30ee5bad2045`.

Portrait report:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Stage7-20260821T201758Z/Portrait/stage-visual-proof-portrait.json`,
380,648 bytes, schema `4`, complete, 390x844, SHA-256
`b962289528fedeef7a9f4f01919a10dd9f3310e17fe90b11f1c09d0de507c9e4`.

Both reports are failure-empty and prove Waiting/Load-In/Shooting/Clearing/
Dark at revisions `11/13/15/17/18`, final revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Each accepts 18/18 intents with zero unexpected/presentation POSTs. Exact role
counts remain `12/12/12/8/0`, held props `0/0/3/0/0`, and all five states pass
all role, prop, framing, luma, effects, state, authority, and no-POST gates.

- Landscape overhead area/top/bottom/edge:
  `.004117284/.08444444/.11777778/76px`; floor:
  `.009300155/.85111111/.99666667/3px`, with Dark area `.009422840`.
- Portrait overhead area/top/bottom/edge:
  `.008710050/.20023696/.22630332/40px`; floor:
  `.020373071/.80450237/.92061609/67px`, with Dark area `.020649532`.
- Landscape/portrait minimum occupied-minus-Dark luma:
  `.119611323/.104021385`; Shooting-minus-Dark:
  `.141321108/.125808805`.
- Shooting slate remains landscape 875/1,125 (`.7777778`), 33x37, owner
  `.0257778`, head `2/0`; portrait 497/640 (`.7765625`), 24x27, owner
  `.034375`, head `0/0`. The conventional slate and six-pixel portrait bright
  rail remain intact.

### ACCEPTED CAMERA CONTROL PROOF

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Camera-20260821T203100Z/`.
Landscape/portrait schema-1 complete reports have SHA-256
`f760252c901c617f1786e007d6b37e5252a00527387e4cdead7851557eec0beb` /
`7e55b377596e91d9953a72723754b41d2a0f1a49d425151bd4602de35b52536f`.
Both prove the exact `112x44` control is visible, hit-testable, invokes the same
return path, restores management input and workflow panel, preserves target/
snapshot/runtime authority, and makes no bridge POST.

`externalActivationRequired=false` exactly; no physical pointer click was
performed. The harness confirms the product hit rectangle and same return
method rather than hardware click injection. This is a nonblocking evidence
limit and must not be restated as physical-click coverage.

### FRESH MOVIE #2, RECONNECT, AND RESTART REGRESSION

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/H/Regression-20260821T202208Z/`.

- Movie2 report/release frame SHA-256:
  `c32b4c8cb4a157914b55b43377faa6928ac821bebc354584628787fa832dc18b` /
  `f5ae57dcb9a612ca6a096d2c1af55d4934ebb8e4f0efbd7b8b8779649af6540f`.
- Reconnect report/frame SHA-256:
  `02e3f697d744530e00ba0b80288c0674af193d84c79f151937398468590585bf` /
  `d5984df46e620a582f116f7c0edc1d17032cdb95bb4528ce917012cfa79cea6c`.
- RuntimeRestart report/ready
  `ebf03355949f67a3807460f2cd278e544c33c56bebb0ac4bde39b242d42f6e3a` /
  `7c30ec6f1d4d622711816dc1954726f65d475aa53983696c5c284470c4358f3f`
  and RuntimeRestart2 report/ready
  `168a999fc1f872dccf6e757aca1fb14b738551fd2f6325557daf62cf4075d145` /
  `ffddbbf01956579831542c63e6d9119179685156f7e40b20e20db34e62d2c3e7`
  are failed/superseded no-kill operator attempts; Unity correctly failed
  closed because it observed no outage.
- Accepted RuntimeRestart3 report/ready/frame:
  `3117c5d1e517b4f3720524740dcbe0f6579709d57a938d6854564430f45d49b6` /
  `6c7a452b218585ec878e26caddb4a9ebac92bf8c28f3d7897fad17ee9ed37f20` /
  `bdfd1a2777b6f525dbba83c4ab392b4a3e938aef34f5c5e4071e76cf9daad042`.
  One SIGKILL yields one runtime replacement, three transport outages, zero
  torn reads, and all five continuity gates pass.

Movie2 and Reconnect prove exact release identity `The Reluctant Cornerstone`,
`script-0001`, `prod-0013` in the same session
`9b0cd1bb-ce88-426d-9c7d-5ac9800c70a5`, revision `23`, Week `22`, digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
RuntimeRestart3 proves restart continuity only; its identity fields remain blank
and `exactMovie2Released` is false. Stable checkpoint
`/private/tmp/project-studio-cp16-regression-20260821T202208Z/bridge-runtime/bridge-runtime-v1.json`
is 1,354,926 bytes, protocol `4`, revision `23`, journal `25`, SHA-256
`a63c711763c0a7a8a00056c0ff052fe85fc60663fddfbd19e89d2f1e61d20459`.

### VISUAL-FIDELITY RULING AND NON-GOLDEN DECISION

Independent review accepts landscape as equal-or-better for the bounded slice.
Portrait introduces no clipping, slate, role, or authority regression, but the
role union is still exactly `.225118488`; action remains compressed in the
middle and the upper battens read weak/floating against the large dark band.
Engineering proof does not manufacture first-read composition quality.

CP16 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. No M5
or canonical state was created or moved.

### NEXT EXACT ACTION

Run bounded CP17 as a portrait-motivated camera/permanent-reblock trial. Freeze
the landscape camera, CP16 UI/framing, final CP15 slate, equipment, state and
authority semantics, and every existing gate. Keep portrait camera position
`(46.2,2.05,22.8)`, use target `(48.1,3.3,38.2)` and the first viable FOV
`39`. Trial asymmetric permanent shared marks, initially Antagonist `z=39.8`,
Carpenter `x~46.08`, and Camera Operator `z=31.8`; static projection predicts
role union about `.2728`.

The earlier FOV `37` plus naive `.82` compression proposal is superseded. It
must not be implemented: FOV `37` projects Batten 01 to
`x=-7.83..395.12` at 390px, while FOV `39` keeps it at
`x=3.35..384.09`; naive `.82` compression predicts only `.2682` union,
clips Carpenter, and creates Antagonist/Supporting physical overlap.

Adopt only if all unweakened all-12 role, edge, overlap, held-prop, framing,
luma, effects, state, no-POST, and authority gates pass; portrait role union
must be at least `.27`, the conventional slate/bright rail must remain, both
rails must stay fully framed, and independent review accepts both native
aspects. Marks must be honest permanent shared routes, never aspect-triggered
teleports or a fake portrait tableau. Otherwise reject the trial and retain
CP16. No M5 absent independent Golden acceptance of both aspects.

### DO NOT TOUCH

- Do not create/move M5 or move/delete M1-M4. Golden M4 is the sole CURRENT
  BEST immutable pair.
- Do not promote CP16, call it Golden/canonical, or let the bounded proof pass
  override the failed portrait-composition ruling.
- Do not weaken landscape, CP16 UI/framing, final slate, equipment, all-12 role,
  edge, overlap, prop, luma, effects, state, no-POST, authority, Movie #2,
  reconnect, restart, checkpoint, or NavMesh gates in the CP17 trial.
- Do not implement superseded FOV `37`/naive `.82` compression, an
  aspect-triggered role teleport, or a portrait-only fake tableau. Authored
  marks must remain honest permanent shared routes and pass both aspects.
- Do not change TypeScript authority, protocol/projection/schema/generated
  DTOs, V14, `GameState`, identity, RNG, economy, construction, gameplay
  formulas, or state semantics.
- Do not stage ignored apps, Evidence/H, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Seal CP16 non-Golden and retain M4 as CURRENT BEST | The slice and landscape pass, but portrait role union remains `.225118488` and upper framing does not solve the compressed first read | Yes after a later complete Golden gate | Ten accepted CP16 Stage frames and independent both-aspect review |
| Correct the initial framing draft before sealing | The first dimensions could not fit both frozen camera frusta without clipping; the accepted bounded geometry does | Yes only through a separately validated slice | 196/196 tests, dual-frustum scene contract, both schema-4 reports |
| Keep CP16 Unity-only and nine-path bounded | The defect is presentation-only; no authority/state mutation is needed | Only through separately justified state work | Exact commit diff and unchanged protocol/projection/schema |
| Make CP17 a rejectable FOV-39 permanent-reblock trial | FOV 37 clips Batten 01 and naive `.82` compression misses the union ratchet/creates role defects; FOV 39 plus asymmetric permanent shared marks is the first viable static candidate | Yes; reject to CP16 on any failure | FOV-37 AABB `-7.83..395.12`, FOV-39 AABB `3.35..384.09`, predicted union `.2728` |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is committed and pushed at TypeScript `69c931ff...` and Unity
  `e1cfa2a1...`; Unity HEAD/upstream/live remote and tracked cleanliness were
  verified before this docs-only continuity update.
- Only the ledger, handoff, and promotion register belong in the containing
  documentation-only commit. It must be a direct child of TypeScript
  `69c931ff56bd550926143ad065fc36794441a839`; resolve its self SHA with
  `git rev-parse HEAD` after commit, then require HEAD equal upstream and a
  clean tracked tree after push.
- Native apps, Evidence/H, private profiles/checkpoint, validation JSON,
  screenshots, `/tmp` logs/results, locks, and caches remain local/ignored and
  must not enter Git. Cleanup is clear.

### RECOVERY INSTRUCTIONS

1. Read this top CP16 section, the ledger CP16 entry, promotion CP16 section,
   ADR 0006, and the client decision. Do not restart the engine/client decision
   or infer CURRENT BEST from moving branches.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP16, use TypeScript
   `69c931ff56bd550926143ad065fc36794441a839` plus Unity
   `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`. Never mix sides.
4. Preserve the containing documentation-only direct child of TypeScript
   `69c931ff...`; resolve its self SHA with `git rev-parse HEAD`. After push,
   require HEAD equal upstream and a clean tracked tree. Require Unity
   HEAD/upstream/live remote at `e1cfa2a1...` and clean.
5. Rebuild/launch with the command above. Verify protocol/projection `4`, schema
   `ba9cd199...`, authenticated readiness, and the exact compact control.
6. Use only accepted Evidence/H hashes. Treat RuntimeRestart and
   RuntimeRestart2 as superseded no-kill attempts; Movie2 plus Reconnect prove
   release identity, and RuntimeRestart3 proves process-replacement continuity.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## CHECKPOINT 15 SEALED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

Checkpoint 16 above supersedes Checkpoint 15 as the current development base.
CP15 remains preserved history: its recognizable-slate slice closed the
bounded clapperboard gate, but it was never Golden, tagged, canonical,
promoted, or CURRENT BEST. Golden M4 remains the sole CURRENT BEST recovery
pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 21:20 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript CP15 authority / pushed parent | `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`; Checkpoint 14 documentation seal; no TypeScript product change in CP15; local HEAD, configured upstream, and live remote branch all match before this continuity edit |
| Containing documentation seal | This section belongs in the documentation-only direct child of `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`. A commit cannot embed its own resulting SHA; resolve its self SHA with `git rev-parse HEAD`. After push, HEAD must equal configured upstream and the tracked tree must be clean. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity CP15 product / pushed | `0c0ef1554278441eed1d2dccac54c2d941395041`; direct parent `a1f6ae8a11d58e28491662a1858631f8019faf33`; `Improve Stage 7 slate readability`; exactly 6 modified paths |
| Unity branch tip / working tree | Local HEAD, configured upstream, and live remote branch all equal `0c0ef155...`; tracked tree clean |
| Compatible CP15 pair | TypeScript `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` plus Unity `0c0ef1554278441eed1d2dccac54c2d941395041`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; CP15 is SEALED NON-GOLDEN and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP15 changes no TypeScript,
schema/generated contract, V14 save, `GameState`, gameplay formula, RNG,
identity, economy, construction rule, camera profile, role mark, state
semantics, or simulation authority.

### CAMPAIGN STATUS

- Golden M4 remains the immutable build/recovery answer. CP15 is the current
  development tip but cannot supersede that authority.
- CP15 changes exactly six Unity paths and only the PA slate's authored LOD,
  material ordering, validator, schema-4 proof contract, tests, and regenerated
  canonical scene.
- The targeted slate gate now passes. The clapperboard reads conventionally in
  both accepted Shooting frames, and portrait contains a six-native-pixel
  bright rail.
- Fresh landscape/portrait Stage proof, Movie #2, save/load, reconnect, actual
  killed-engine replacement, native build, and full TypeScript gates pass.
- The pair remains visually non-Golden: portrait activity is still compressed
  into a narrow middle band with large dead headroom/floor, while the dominant
  Back UI reinforces a prototype composition.
- CP14 is historical. No M5 tag or canonical state was created or moved.

### WHAT WAS JUST DONE

- Kept the PA slate's exact LOD source sequence `[base, LOD1, LOD1]` with
  thresholds `.52/.22/.025`; the fuller LOD1 mesh is now the authored terminal
  asset instead of the sparse LOD2.
- Enforced ordered material slots dark board / ivory clapper / mustard stripe:
  `HeldPropCharcoal`, `HeldPropIvory`, `HeldPropMustard`.
- Raised the PA slate fail-closed proof contract to landscape visible/long/
  short thresholds `800/32/28`, portrait `440/24/20`, and visible fraction
  `.70`, while preserving owner overlap and face-interior clearance gates.
- Kept schema `4`, the final CP14 slate pose, all role marks, landscape and
  portrait cameras, five authoritative states, and TypeScript authority
  unchanged.
- Modified exactly these six paths:
  `StudioLotActivityAuthoring.cs`, `StudioSceneValidation.cs`,
  `StudioStageVisualProofRunner.cs`, `StudioLot.unity`,
  `StudioMaterialLightingAssetsTests.cs`, and
  `StudioStageVisualProofRunnerTests.cs`.

### WHAT IS WORKING RIGHT NOW

The obvious current development launch uses the exact CP15 branch pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Rebuild the ignored compatible app only when absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/project-studio-cp15-rebuild.log \
  -quit
```

These moving campaign worktrees launch CP15, not immutable M4. For exact
CURRENT BEST recovery/build, use both M4 tags.

### VALIDATION STATE

| Gate | CP15 result |
| --- | --- |
| Canonical scene validation | Run 1 and run 2 both passed: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings. Run-1 log `/tmp/project-studio-cp15-dark-slate-scene-run1.log`, SHA-256 `d531886872560ac0ee92aaf6bb8eda549e9c2b7b78ef919be7b2fd041607b82e`; run-2 log `/tmp/project-studio-cp15-dark-slate-scene-run2.log`, SHA-256 `fe5e9eebb9fd6a65bd4b82d633398292da36fe640444be2218b3fcb84b99b51e`; accepted run validation JSON SHA-256 `a2c6bf2ca3d3e6a40616ced0b474031ac0f4dfcd0479eafb6d6df8f0cc4a302a` |
| Unity EditMode | Run 2 passed 191/191; XML `/tmp/project-studio-cp15-editmode-run2.xml`, SHA-256 `7ae511cf9c2c41a44abbd0456ffcf1c5d1be864b362e1a021f1672d39f3955ff`; log SHA-256 `00d458a0ea374d79d6545d6068402d0fdaae1f19d065c7892b51721e3d7fd2ef` |
| Native macOS build | Run 2 passed; `/tmp/project-studio-cp15-dark-slate-build-run2.log`, SHA-256 `fb2413bd4b35e32c1038a2ff1f727618a50cbbd66f504f5544d668292dcc3e8f`; app 183 regular files / 151,475,682 bytes; executable 116,116 bytes, SHA-256 `eae78f14c609aec59e5646094b371c1a2519b4671af902f7148eff74a2e63e48`; player `Assembly-CSharp.dll` SHA-256 `7e50620ec560db947da9a268ccdd38814248a11754a9e07e1851d0af6324802f` |
| Bridge aggregate | Fresh pass: 11 files, 100/100 tests |
| Full TypeScript suite | Fresh pass: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript checks | Both typechecks, production build, generated-contract/contract drift, hygiene across 1,032 source files, 26 adopted assets with 0 hard violations, and browser production audit with 0 vulnerabilities passed; build emitted only the accepted chunk-size warning |
| Cleanup | Clear; no leaked supervised runtime or staged ignored evidence/build output |

### ACCEPTED STAGE PROOF

Landscape root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Stage7-20260821T190243Z/Landscape/`.

- `stage-visual-proof-landscape.json`: schema `4`, `complete`, exact requested/
  observed 1440x900 landscape viewport, SHA-256
  `3f3647dc172e30d85c55f46563329a589dcdb038e5dbcb0c3b697d4a1c7a494c`.

Portrait root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Stage7-20260821T190335Z/Portrait/`.

- `stage-visual-proof-portrait.json`: schema `4`, `complete`, exact requested/
  observed 390x844 portrait viewport, SHA-256
  `ff420f3767a8ebd50515ae73235a4e5fe57e78bebd5ef0d84b8fd300a8c5afd1`.

Both prove exact Movie #2 identity `The Reluctant Cornerstone` /
`script-0001` / `prod-0013`, advance the same five states at revisions
`11/13/15/17/18`, finish revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
submit/accept 18/18 proof-owned intent POSTs, and record zero presentation or
unexpected accepted POSTs, ambiguous retries, and recovered posts. All 20 PNG
color/mask artifacts independently match their recorded SHA, dimensions, byte
counts, and successful decode.

| State | Exact roles | Exact held props | Spill | Lights / indicators / practicals | Dark grade | L/P mean luma |
| --- | --- | --- | --- | --- | --- | --- |
| Waiting | 12 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.235976 / 0.221889 |
| Load-In | 12 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.241826 / 0.238697 |
| Shooting | 12 | 3 | 4.0 | 7 / 2 / 3 | 0 | 0.257495 / 0.243351 |
| Clearing | 8 | 0 | 1.2 | 0 / 0 / 0 | 0 | 0.235692 / 0.221369 |
| Dark | 0 | 0 | 0 | 0 / 0 / 0 | 1 | 0.116133 / 0.117372 |

All expected role/held sets are both active and visible. Every mask, role,
held-prop, owner/head, edge, pair, aspect, backdrop, luma, effects, authority,
viewport, artifact, and no-POST gate passes. Minimum occupied-minus-Dark luma
is `0.119559/0.103997`; Shooting-minus-Dark is `0.141363/0.125979` for
Landscape/Portrait.

The final Shooting slate is 875/1,125 visible landscape pixels (`0.7777778`),
33x37, owner overlap `0.0257778`, raw/interior PA-head overlap `2/0`; portrait
is 497/640 (`0.7765625`), 24x27, owner overlap `0.034375`, head overlap `0/0`.
The portrait bright clapper rail is exactly six native pixels, y `501-506`.
The targeted slate gate passes and manual inspection recognizes a conventional
clapperboard in both aspects.

Earlier `Evidence/G/Stage7-*` attempts are superseded iteration history. Only
the two roots and report hashes above are accepted CP15 Stage evidence.

### FRESH FUNCTIONAL REGRESSION

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/G/Regression-20260821T190530Z/`.
Private profile:
`/private/tmp/project-studio-cp15-regression-final-20260821T190530Z`.

- Movie2 report/release-frame SHA-256:
  `93e333c96116bc46f87c49570183b90466a22da58d84bff2c48af9b56927e9aa` /
  `2d44993a03ac2025caedfdd6a43a358a27d7813dbd90f4df51dfb7663a9d44c6`.
- Reconnect report/frame SHA-256:
  `1c2c47dce92915cfba244ac72c7875e9651fc85135408fab7cc9b9b0c6ab2fa6` /
  `e2a76395022745e1e9d57f8ada892c079f2af76977b024400571a2fff1107f0c`.
- First RuntimeRestart ready/report SHA-256:
  `f1337ca0a4a7b49bd1cfc127b4fc204d7759d3d2b219b8bed6250f216383b8ec` /
  `a9751b46bde75dd40a10c548e58618e180555486399d41420832810257bf8bc3`.
  It is invalid and superseded because Unity missed outage observation; the
  engine was replaced, but the report correctly failed closed.
- Accepted RuntimeRestart2 ready/report/frame SHA-256:
  `c0642e800f08c0026c423a2527d69aa9430e49119275861927d1cdb3b38473e5` /
  `dd188cc5c79471e8aa1d67bc1aaf30990fb12fc3fa51792c4cd0fb7876287659` /
  `17c9fd409eb16a27ea4534395c256d37f19c2382916cbddc6c8ebf33e8101107`.
  It replaces engine PID `87546` with `87604` on pinned port `62901`, records
  one replacement, three transport outages, zero torn reads, and passes all
  five outage/restart/action-disable/projection/authority gates.
- All accepted functional reports retain session
  `3fc95257-e59b-479f-9d43-1779ea5019a3`, revision `23`, Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Movie2/Reconnect prove exact release identity; restart proves continuity only.
- Stable checkpoint
  `/private/tmp/project-studio-cp15-regression-final-20260821T190530Z/bridge-runtime/bridge-runtime-v1.json`
  is 1,354,921 bytes, SHA-256
  `8338000aaab6a7c3267852814b1f2f72b582b16dce3d1c76e5dcbd13fa9248a8`,
  protocol `4`, revision `23`, with 25 journal entries.

Do not misclassify the first failed report as a product defect. Do not use the
restart-only report's blank movie identity and `exactMovie2Released: false` to
negate the accepted Movie2/Reconnect release proof.

### KNOWN PROBLEMS / BLOCKERS

- P1 portrait composition: activity remains in a narrow middle band, with
  large dead headroom and floor; the all-12 role union remains about 22.5% of
  viewport height.
- P1 portrait UI: the dominant Back control consumes visual attention and
  reinforces the prototype read instead of the inhabitable studio read.
- Slate recognition is closed for CP15 and must be preserved; it is no longer
  the next visual blocker.
- Real foreground pointer/touch, 25/50/100 scaling, emitted packaging, and
  TypeScript-main reconciliation remain later gates. No product P0 or authority
  drift is known.

Never fuse tests, masks, hashes, build bytes, or the targeted slate pass with
overall visual success. CP15 is **SEALED NON-GOLDEN**. Golden M4 remains the
sole CURRENT BEST and promotion remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

### NEXT EXACT ACTION

Implement bounded CP16 as a presentation-only portrait-framing slice. Freeze
both StageSeven camera profiles, every role/equipment mark, and the final CP15
slate sources/meshes/material order/pose/proof gates. Make only these changes:

- Replace the dominant control with exact `BACK`, `112x44`, anchored `12px`
  from the top/right of `Screen.safeArea`; keep the full `44x44` hit region.
  Use a low-contrast charcoal fill, thin warm keyline, and `13px` cream text;
  the stock-silver treatment is not allowed.
  Full-safe native results must be portrait `Rect(266,12,112,44)` and landscape
  `Rect(1316,12,112,44)`; a notched `Rect(0,34,390,763)` must map to GUI `y=59`.
  EditMode must assert those rectangles. Runtime proof must assert
  `insideSafeArea`, width at most `112`, and height exactly `44`.
- Add permanent collider-free Stage A overhead battens and foreground dolly
  rails/ties to replace the empty portrait black/floor bands. Under the Stage A
  root, author `Inspection Overhead Batten 01` from `(-7,10,8)` to `(7,10,8)`
  and `Inspection Overhead Batten 02` from `(-8,10.4,12)` to `(8,10.4,12)`,
  each radius `.08` and material `Steel`. Author `Inspection Dolly Rail L`
  from `(-.7,.72,-6)` to `(-.7,.72,-3)` and `Inspection Dolly Rail R` from
  `(.4,.72,-6)` to `(.4,.72,-3)`, each radius `.035` and material `Steel`.
  Author `Inspection Dolly Tie 01` through `04` at center `x=-.15`, `y=.705`,
  respective `z=-5.7,-4.9,-4.1,-3.3`, size `(1.2,.035,.08)`, and material
  `HeroStageBlackSteel`. Validation and focused EditMode tests must assert exact
  names, parents, transforms, materials, collider absence, and a byte-identical
  NavMesh asset.
- Add framing proof-ID targets without changing schema `4`. In portrait, each
  framing target must occupy at least `.002` viewport area; overhead detail
  must finish above `.23`, and floor detail must begin below `.80` and reach at
  least `.92`. Preserve every existing role/backdrop/slate/state/luma/no-POST/
  authority gate, including all-12 role and edge gates without weakening.

Require fresh exact 390x844 and 1440x900 proof plus independent manual review:
within two seconds the ensemble/set is the first read, `BACK` is discoverable
but subordinate, upper/lower bands read as a working soundstage, and both
native aspects are visually equal or better. The slate must retain a
conventional read and at least a `3px` bright rail, while faces, hands, boom,
megaphone, and slate remain unobscured across all five milestones. Do not
create M5 absent independent Golden acceptance of both aspects.

### NEXT 3-5 ACTIONS AFTER THAT

1. Compare all ten CP16 frames with CP15 and reject any camera, mark, landscape,
   or slate regression even if portrait framing metrics improve.
2. Run fresh Movie #2, reconnect, exact process-restart, Unity, and TypeScript
   regression against the exact CP16 compatible pair.
3. Expand believable role motion and run 25/50/100-person scalability evidence.
4. Complete real foreground pointer/touch evidence and direct lot interaction.
5. Audit emitted runtime packaging, then reconcile TypeScript `main` only on a
   separately validated canonical candidate.

### DO NOT TOUCH

- Do not create/move M5 or move/delete M1-M4. Golden M4 is the sole CURRENT
  BEST immutable pair.
- Do not promote CP15, call it Golden/canonical, or let the targeted slate pass
  override the failed portrait-composition ruling.
- Do not change either StageSeven camera profile, any role/equipment mark, or
  the CP15 slate's `[base, LOD1, LOD1]` sources, `.52/.22/.025` thresholds,
  ordered materials, pose, proof thresholds, or recognition gate.
- Do not change TypeScript authority, protocol/
  projection/schema/generated DTOs, V14, `GameState`, identities, RNG, economy,
  construction, gameplay formulas, or state semantics for CP16.
- Do not weaken all-12 role, edge, mask, prop, owner/head, luma, effects,
  viewport, no-POST, Movie #2, reconnect, restart, or checkpoint gates.
- Do not stage ignored apps, Evidence/G, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Seal CP15 non-Golden and retain M4 as CURRENT BEST | Slate recognition now passes, but portrait composition remains compressed and prototype-like | Yes after a later complete Golden gate | Ten accepted CP15 frames and independent manual ruling |
| Reuse LOD1 as terminal slate mesh | Sparse LOD2 could not retain clapper geometry at portrait scale | Yes while preserving the recognition contract | `[base, LOD1, LOD1]`, six-pixel portrait rail, 191/191 tests |
| Keep CP15 Unity-only and six-path bounded | No authority or state change is needed to fix an authored presentation defect | Only through a separately justified state unit | Exact commit diff and unchanged schema `4` |
| Bound CP16 to presentation-only portrait framing | Camera/role proof margins are too narrow to justify reblocking or reframing; the dominant Back control and empty bands are the safer demonstrated defects | Yes after CP16 visual inspection | Portrait edge `6px`, backdrop `.7014`, role union `.2251`, overlap `.2825`, visibility `.7064`, plus independent static framing audit |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is committed and pushed at TypeScript `d92f741...` and Unity
  `0c0ef155...`; local HEAD, upstream, live remote refs, and tracked cleanliness
  were verified before this docs-only continuity update.
- Only the ledger, handoff, and promotion register belong in the containing
  documentation-only commit. It must be a direct child of TypeScript
  `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`; resolve its self SHA with
  `git rev-parse HEAD` after commit, then require HEAD equal upstream and a
  clean tracked tree after push.
- Native apps, Evidence/G, the private regression profile/checkpoint,
  screenshots, validation JSON, and `/tmp` files remain local/ignored and must
  not enter Git. Cleanup is clear.

### RECOVERY INSTRUCTIONS

1. Read this top CP15 section, the ledger's CP15 entry, the promotion
   register's CP15 section, ADR 0006, and the client decision. Do not restart
   the engine/client decision or infer CURRENT BEST from moving branches.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP15, use TypeScript
   `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` plus Unity
   `0c0ef1554278441eed1d2dccac54c2d941395041`. Never mix sides.
4. Preserve the containing documentation-only direct child of TypeScript
   `d92f741...`; resolve its self SHA with `git rev-parse HEAD`. After push,
   require HEAD equal upstream and a clean tracked tree. Require Unity
   HEAD/upstream/live remote at `0c0ef155...` and a clean tracked tree.
5. Rebuild/launch with `npm run studio -- --unity-project
   '/Users/bruce/Project Studio - Unity Production Convergence 80H'`. Verify
   protocol/projection `4`, schema `ba9cd199...`, and authenticated readiness.
6. Use only the accepted Evidence/G hashes above. Treat the first restart as
   invalid/superseded; use Movie2 plus Reconnect for release identity and
   RuntimeRestart2 only for exact process-replacement continuity.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## CHECKPOINT 14 SEALED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

Checkpoint 15 above supersedes Checkpoint 14 as the current development base.
Checkpoint 14 remains preserved history and was never Golden, tagged,
canonical, promoted, or CURRENT BEST.

Checkpoint 14 is the pushed, compatible proof-legible Stage-role slice on top
of Checkpoint 13. It was the correct development base for CP15 at that seal,
but it is not Golden, tagged, canonical, promoted, or CURRENT BEST. Golden M4
remains the sole CURRENT BEST recovery pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 20:16 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript CP14 authority / pushed parent | `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`; Checkpoint 13 documentation seal; no TypeScript product change in CP14; HEAD/upstream equal and tracked tree clean before this continuity edit |
| Containing documentation seal | This section belongs in the documentation-only direct child of `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`. A commit cannot embed its own resulting SHA; resolve its self SHA with `git rev-parse HEAD`. After push, HEAD must equal configured upstream and the tracked tree must be clean. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity CP14 product / pushed | `a1f6ae8a11d58e28491662a1858631f8019faf33`; direct parent `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`; `feat(visuals): make stage roles proof-legible`; exact 47-file commit |
| Unity branch tip / working tree | HEAD equals configured upstream at `a1f6ae8a...`; tracked tree clean |
| Compatible CP14 pair | TypeScript `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` plus Unity `a1f6ae8a11d58e28491662a1858631f8019faf33`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; CP14 is SEALED NON-GOLDEN and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP14 changes no TypeScript,
schema/generated contract, V14 save shape, `GameState`, gameplay formula, RNG,
identity, economy, construction rule, or simulation authority.

### CAMPAIGN STATUS

- Golden M4 remains the immutable build/recovery answer. CP14 was the current
  development tip at that seal but could not supersede that authority.
- CP14 is an exact 47-file Unity presentation/authoring/proof commit. It
  reblocks 12 production roles, strengthens deterministic wardrobe and held-
  prop materials, refines the landscape/portrait Stage inspection profiles,
  and adds an authoritative Dark-only local post-process grade.
- Native proof schema `4` adds persistent proof-ID rendering, isolated and
  composite masks, exact role/held-prop screen-area, occlusion, pair-separation,
  owner-overlap, PA-head-clearance, luma, effect, no-POST, and authority gates.
- Fresh landscape and portrait five-state Stage proof, Movie #2, save/load,
  reconnect, actual killed-engine replacement, native build, and full
  TypeScript validation pass on the sealed pair.
- Independent inspection accepts the landscape presentation, but the pair
  remains visually non-Golden: portrait compresses the roles to about 22.5% of
  viewport height, the slate reads as a plain charcoal square with a tiny
  rail, and large black headroom plus the Back UI reinforce a prototype read.
- CP13 is historical. No M5 tag or canonical state was created or moved.
- Packaging, TypeScript-main reconciliation, 25/50/100 scaling, and real
  foreground touch remain later work. Do not let them displace bounded CP15.

### WHAT WAS JUST DONE

- Reauthored deterministic Stage role marks and aspect-aware inspection
  profiles so Director, three cast roles, Camera, Grip, Electric, PA, Boom,
  Carpenter, Camera Assistant, and Wardrobe all clear exact screen-space area,
  edge, occlusion, overlap, and pair-separation gates in both viewports.
- Made the Director megaphone, PA slate, and boom microphone hand-attached and
  proof-visible only in Shooting; added authored charcoal, ivory, mustard, and
  steel prop material families without importing protected source assets.
- Added `StudioStageVisualProofId.shader`, its persistent proof asset seam, and
  a proof-only ID material. The runner now captures composite and isolated
  masks without changing authoritative state or emitting presentation POSTs.
- Added exact held-prop owner-overlap and PA head-clearance proof. The final
  landscape Shooting slate is 778/1,028 pixels visible (`0.75681`), owner
  overlap `0.02821`, raw head overlap `2`, and eroded-interior head overlap
  `0`; portrait is 427/570 (`0.74912`), owner overlap `0.03860`, and raw/
  interior head overlap `0`.
- Added a locally wired `StageDarkInspectionVolume` that is weight `1` only in
  authoritative Dark. It creates a genuine light-level separation without
  changing the five authoritative state roots or Stage activity ownership.
- Regenerated and persisted the canonical scene/NavMesh and role controllers,
  tightened validator coverage, and expanded EditMode coverage from 127 to
  189 tests.
- Kept the simulation journey and compatible protocol unchanged. The five
  Stage milestones still reach Waiting, Load-In, Shooting, Clearing, and Dark
  at the same revisions, weeks, and final digest.

### WHAT IS WORKING RIGHT NOW

The exact CP14 development launch at that seal used this branch pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Rebuild the ignored compatible app only when absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/project-studio-cp14-rebuild.log \
  -quit
```

At the CP14 seal these moving campaign worktrees launched CP14, not immutable
M4. The current moving tips now launch CP15. For exact CURRENT BEST recovery/
build, use both M4 tags.

### VALIDATION STATE

| Gate | CP14 result |
| --- | --- |
| Canonical scene validation | Final run 40 passed: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings; `/tmp/project-studio-cp14-scene-final-run40.log` |
| Unity EditMode | Final run 29 passed 189/189, 0 failed, 0 skipped; `/tmp/project-studio-cp14-editmode-run29.xml`; log `/tmp/project-studio-cp14-editmode-run29.log` |
| Native macOS build | Final run 29 passed; `/tmp/project-studio-cp14-build-final-run29.log`; 151,475,574 aggregate regular-file bytes; executable 116,116 bytes; executable SHA-256 `70329ea3f2fab238b4414e6af29c39ec57c2dfe24a781c8fd26cb91330abed48`; `Assembly-CSharp.dll` SHA-256 `18bad2a8dbf2984eedfe7af7d97d38d90e8ee7e3141f79336e891eddb551faf5` |
| Bridge aggregate | Fresh pass: 100/100 |
| Full TypeScript suite | Fresh uncontended pass: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript checks | Fresh full and bridge typechecks, production build, generated-contract/contract identity, repository hygiene across 1,032 source files, 26 adopted-asset audit, and browser production-dependency audit passed |

### ACCEPTED STAGE PROOF

Landscape root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Stage7-20260821T180028Z/Landscape/`.

- `stage-visual-proof-landscape.json`: schema `4`, `complete`, exact requested/
  observed landscape viewport 1440x900, SHA-256
  `3c7fef40b1f0e40ed53ca37d2c397be4db46e05b9cf66d6f6a67b864cdd8a829`.

Portrait root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Stage7-20260821T180100Z/Portrait/`.

- `stage-visual-proof-portrait.json`: schema `4`, `complete`, exact requested/
  observed portrait viewport 390x844, SHA-256
  `5337e7ad920d72e44e5d50112c59f7463e716b9a70a510803d4c3b4f09adbb9d`.

Both reports prove exact Movie #2 identity `The Reluctant Cornerstone` /
`script-0001` / `prod-0013`, advance revision `0 -> 18`, finish Week `20` at
digest `ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
submit/accept exactly 18/18 proof-owned intent POSTs, and record zero ambiguous
retries, zero recovered posts, zero unexpected accepted POSTs, and zero
presentation capture POSTs. `noExtraPresentationPosts` is true. All ten color
artifacts and ten ID-mask artifacts have non-placeholder byte/hash records
verified against the files.

| State | Revision / Week | Exact roles active/visible | Exact held active/visible | Spill | Shooting lights / indicators / practicals | Dark volume |
| --- | --- | --- | --- | --- | --- | --- |
| Waiting | 11 / 16 | 12/12 | 0/0 | 1.2 | 0 / 0 / 0 | 0 |
| Load-In | 13 / 17 | 12/12 | 0/0 | 1.2 | 0 / 0 / 0 | 0 |
| Shooting | 15 / 17 | 12/12 | 3/3 | 4.0 | 7 / 2 / 3 | 0 |
| Clearing | 17 / 19 | 8/8 | 0/0 | 1.2 | 0 / 0 / 0 | 0 |
| Dark | 18 / 20 | 0/0 | 0/0 | 0 | 0 / 0 / 0 | 1 |

Exact active/visible sets, role area/occlusion/edge/pair overlap/pair
separation, portrait blocking, held area/edge/occlusion/owner overlap/head
clearance, backdrop, effects, luma thresholds, camera, composition, authority,
and no-POST gates all pass in both reports.

| State | Landscape mean luma | Portrait mean luma |
| --- | ---: | ---: |
| Waiting | 0.235897 | 0.222092 |
| Load-In | 0.241800 | 0.238575 |
| Shooting | 0.257441 | 0.243183 |
| Clearing | 0.235740 | 0.221426 |
| Dark | 0.116131 | 0.117365 |

Landscape Dark P10/P90/black fraction are `0.060255` / `0.196849` / `0`;
Portrait values are `0.058835` / `0.194045` / `0`. Minimum occupied-minus-
Dark separation is `0.119609` landscape and `0.104062` portrait; Shooting-
minus-Dark is `0.141309` and `0.125819`. Both luma-separation gates pass.

Earlier `Evidence/F/Stage7-*` attempts are superseded iteration history. Only
the two roots and report hashes above are accepted CP14 Stage evidence.

### FRESH FUNCTIONAL REGRESSION

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/F/Regression-20260821T180816Z/`.
Private profile:
`/private/tmp/project-studio-cp14-regression-20260821T180816Z`.

- Movie2 report SHA-256
  `b4214dcb5327b867d4e822373db5e45526fc6f6cf94234365749f7081582e83e`:
  schema `5`, `complete`, session
  `ff8ae458-a58b-4139-886b-808a4fbd97af`, exact
  `The Reluctant Cornerstone` / `script-0001` / `prod-0013`, revision `23`,
  Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
  saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`,
  12 milestones, exact release true, and retained `STALE_REVISION` guidance.
- Reconnect report/frame SHA-256:
  `4cc452479c68006b38bab6bde1839e07b57be1a192b69fe83894cf97a434b03a` /
  `649289d6ac89a644abd56d89f85009fd43386f0ef075004ba9ad7128c1bb3653`.
  It is complete and retains the same logical authority, revision/week/digest,
  and exact Movie #2 release identity under a new runtime instance.
- RuntimeRestart ready/report/frame SHA-256:
  `031854be69a25cf2bfeafc3e0c4525dfd31ef07c5e3b9fea5dd6b36f1d914a53` /
  `47198241fdd11fdd56bd6a26cce487283bfe6f968e9ca2dd70ba2ed7e3b295d5` /
  `530cffc4c4ca58ace2f8fceb0cf87f0297d89c7c152ff645f84bfe0ef179a53e`.
  It validates initial engine PID `75695`, replacement PID `75736`, pinned
  port `61145`, one observed outage/replacement, actions disabled and the last
  projection retained during outage, unchanged logical authority, and zero
  torn reads.
- The stable checkpoint at
  `/private/tmp/project-studio-cp14-regression-20260821T180816Z/bridge-runtime/bridge-runtime-v1.json`
  is 1,354,927 bytes, SHA-256
  `7af05320a1c4ed94096c620060159d0424b9a83b616822d1fbd4770814ca48c1`,
  protocol `4`, schema `ba9cd199...`, revision `23`, with 25 journal records.

Use Movie2 plus Reconnect for release identity. RuntimeRestart is restart-
continuity proof only: its schema leaves movie identity blank and reports
`exactMovie2Released: false`, while its ordinal-2 released milestone and all
restart invariants pass. Do not use those blank identity fields to negate the
accepted Movie2/Reconnect release proof.

### KNOWN PROBLEMS / BLOCKERS

- P1 portrait composition/recognition: role union height is about 22.5% of the
  viewport, with large black headroom and the Back UI contributing to a
  compressed prototype presentation.
- P1 slate recognition: schema-4 masks prove that the slate is present,
  visible, clear of the PA's face interior, and sufficiently unoccluded, but
  manual inspection still reads it as a plain charcoal square with a tiny rail
  rather than an unmistakable clapperboard.
- Landscape is acceptable in the independent CP14 visual audit, and Dark now
  has a genuine luma gap. Neither result overrides the failed pair-level
  portrait/first-glance gate.
- Real foreground pointer/touch, 25/50/100 scaling, emitted packaging, and
  TypeScript-main reconciliation remain later gates. There is no known product
  P0 regression or authority drift.

Never fuse population counts, test totals, masks, hashes, build bytes, or FPS
with visual success. CP14 is **SEALED NON-GOLDEN**. Golden M4 remains the sole
CURRENT BEST and promotion remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

### NEXT EXACT ACTION

Implement bounded CP15 on the sealed CP14 pair: preserve every validated role
mark, camera, held-prop pose, state root, and authority boundary, and re-author
only the slate surface/contrast first. Require a high-contrast bright rail at
least 3 pixels thick in the 390x844 Shooting frame and manual two-second
clapperboard recognition. Do not change blocking/camera merely to make the
proof pass, and do not widen TypeScript state, protocol/schema, save/gameplay,
identity, or simulation scope.

### NEXT 3-5 ACTIONS AFTER THAT

1. Run the same schema-4 landscape/portrait five-state proof and inspect both
   Shooting frames for two-second slate recognition, not mask presence alone.
2. Run full Movie #2, reconnect, exact process-restart, Unity, and TypeScript
   regression on the CP15 candidate; preserve report/frame hashes exactly.
3. If portrait remains visually compressed after the slate-only unit, charter
   a separate composition slice with explicit manual framing acceptance.
4. Expand believable role motion and run 25/50/100-person scalability evidence.
5. Complete real foreground pointer/touch and emitted-runtime packaging audits,
   then reconcile TypeScript `main` only on a separately validated candidate.

### DO NOT TOUCH

- Do not create/move M5 or move/delete M1-M4. Golden M4 is the sole CURRENT
  BEST immutable pair.
- Do not promote CP14, call it Golden/canonical, or let proof totals, build
  bytes, population counts, masks, hashes, or FPS override visual inspection.
- Do not change TypeScript sole simulation authority, protocol/projection/
  schema/generated DTOs, V14, `GameState`, permanent identities, RNG, economy,
  construction, or gameplay formulas for CP15 slate work.
- Do not move the validated role marks, camera, or held-prop pose in the slate-
  surface unit. Do not weaken exact state-root, assignment, prop, screen-space,
  effects, luma, viewport, no-POST, Movie #2, reconnect, restart, or checkpoint
  assertions.
- Do not call mask presence first-glance recognition or conceal the portrait
  role-height/headroom/Back-UI failure.
- Do not stage ignored apps, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Seal CP14 non-Golden and retain M4 as CURRENT BEST | Landscape and engineering gates pass, but portrait remains compressed/prototype-like and the slate fails first-glance recognition | Yes after a later complete Golden gate | Ten accepted CP14 color frames, schema-4 masks, and independent role audit |
| Keep CP14 Unity-only | The bounded gap is presentation/proof; authoritative simulation/schema/save/gameplay behavior is already correct | Only through a separately justified state unit | Exact 47-file Unity diff and unchanged protocol/schema |
| Accept persistent proof-ID and isolated/composite masks | Frustum inclusion could not prove visible area, occlusion, owner overlap, or face clearance | Yes while retaining fail-closed proof | Two accepted schema-4 reports and 189/189 EditMode |
| Accept the landscape view but fail the compatible pair | Golden presentation acceptance is pair-level; portrait and first-glance slate recognition still fail | Yes after later visual closure | Independent landscape/portrait audit |
| Bound CP15 to slate surface/contrast | It is the smallest demonstrated visual defect and avoids invalidating already-green blocking/camera/authority contracts | Yes after CP15 inspection | Portrait 427/570 visible pixels but charcoal-square manual read |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is committed and pushed at TypeScript `8dffc6f...` and Unity
  `a1f6ae8a...`; both were clean with HEAD equal upstream before this docs-only
  continuity update.
- Only the ledger, handoff, and promotion register belong in the containing
  documentation-only commit. It must be a direct child of TypeScript
  `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`; resolve its self SHA with
  `git rev-parse HEAD` after commit, then require HEAD equal upstream and a
  clean tracked tree after push.
- Native apps, Evidence/F, the private regression profile/checkpoint,
  screenshots, and `/tmp` validation files remain local/ignored and must not
  enter Git.
- CP14 added generated code-authored materials and proof assets. It imported no
  Lionhead, purchased, trademarked, or protected visual-reference content.

### RECOVERY INSTRUCTIONS

1. Read this top CP14 section, the ledger's CP14 entry, the promotion
   register's CP14 section, ADR 0006, and the client decision. Do not restart
   the engine/client decision or infer CURRENT BEST from moving branches.
2. For immutable CURRENT BEST recovery, use both M4 tags and verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP14, use TypeScript
   `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` plus Unity
   `a1f6ae8a11d58e28491662a1858631f8019faf33`. Never mix sides.
4. Preserve the containing documentation-only direct child of TypeScript
   `8dffc6f...`; resolve its self SHA with `git rev-parse HEAD`. After push,
   require HEAD equal upstream and a clean tracked tree. Require Unity
   HEAD/upstream at `a1f6ae8a...` and a clean tracked tree.
5. Rebuild/launch with `npm run studio -- --unity-project
   '/Users/bruce/Project Studio - Unity Production Convergence 80H'`. Verify
   protocol/projection `4`, schema `ba9cd199...`, and authenticated readiness.
6. Use only the accepted Evidence/F report/frame hashes above. Use Movie2 plus
   Reconnect for release identity and RuntimeRestart only for exact process-
   replacement continuity.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## CHECKPOINT 13 SEALED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

Checkpoint 14 above supersedes Checkpoint 13 as the current development base.
Checkpoint 13 remains preserved history and was never Golden, tagged,
canonical, promoted, or CURRENT BEST.

Checkpoint 13 is the pushed, compatible Take One interior production-tableau
slice on top of Checkpoint 12. It was the correct development base for CP14 at
that seal, but it is not Golden, tagged, canonical, promoted, or CURRENT BEST.
Golden M4 remains the sole CURRENT BEST recovery pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 14:16 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript CP13 authority / pushed parent | `6b28cacfa9d8fd802ced951bb3248153cf348259`; no TypeScript product change in CP13; HEAD/upstream equal and tracked tree clean before this continuity edit |
| Containing documentation seal | This section belongs in the documentation-only direct child of `6b28cacfa9d8fd802ced951bb3248153cf348259`. Resolve its self SHA with `git rev-parse HEAD`; after push, HEAD must equal configured upstream and the tracked tree must be clean. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity CP13 product / pushed | `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`; direct parent `219f290e3dc4b7174ee2ff26992692e8b2779c89`; `feat(visuals): stage a readable production tableau` |
| Unity branch tip / working tree | HEAD equals configured upstream at `e38c8400...`; tracked tree clean |
| Compatible CP13 pair | TypeScript `6b28cacfa9d8fd802ced951bb3248153cf348259` plus Unity `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; CP13 is SEALED NON-GOLDEN and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP13 changes no TypeScript,
schema/generated contract, V14 save shape, `GameState`, gameplay formula, RNG,
identity, economy, construction rule, or simulation authority.

### CAMPAIGN STATUS

- Golden M4 remains the immutable build/recovery answer. CP13 was the
  materially better visual development tip at that seal but could not
  supersede that authority.
- CP13 is an exact 87-file Unity source/asset change. It adds an authored period
  atlas and deterministic derivatives, stronger set dressing, exact production
  role/wardrobe/controller contracts, held props, seven shooting-only lights,
  three shooting practical glows, blocking/camera refinements, canonical scene
  persistence, validation, and proof-schema false-green guards.
- Fresh native landscape/portrait Stage proof, Movie #2, save/load, full-client
  reconnect, and actual killed-engine replacement pass on the sealed pair.
- The visual gate still fails independently: portrait has large vertical void,
  a narrow overlapped action band, and dominant Load-In flats; Dark is empty but
  broadly warm-lit; landscape roles remain clustered and their held props are
  not individually legible at first glance.
- CP12 is historical. No M5 tag or canonical state was created or moved.
- Packaging, TypeScript-main reconciliation, 25/50/100 scaling, and real
  foreground touch remain later work. Do not let them displace bounded CP14.

### WHAT WAS JUST DONE

- Added the provenance-cleared source atlas
  `Assets/Studio/Art/Authored/Stage/StageDressingAtlas.png`: 1254x1254,
  2,753,366 bytes, SHA-256
  `0b244fe00ba2251ffd80204978a09d0a5471062bb35315f1ccec973114095c89`.
  Canonical authoring deterministically crops four 615x615 cells into
  repeat-wrapped albedo, luminance-derived normal textures, and shared URP
  wallpaper, linen, burgundy textile, and walnut materials.
- Added `StudioProductionRolePresentation` and exact fail-closed contracts for
  Director, CastLead, CastAntagonist, CastSupporting, CameraOperator, Grip,
  Electric, ProductionAssistant, BoomOperator, Carpenter, CameraAssistant, and
  Wardrobe. Their exact IDs are `t-dir-04`, `t-act-01`, `t-act-04`,
  `t-act-09`, `presentation-crew-camera`, `presentation-crew-grip`,
  `presentation-crew-electric`, `presentation-crew-pa`,
  `presentation-crew-boom`, `presentation-crew-carpenter`,
  `presentation-crew-camera-assist`, and `presentation-crew-wardrobe`.
- Added deterministic role wardrobes/controllers and state-owned held Director
  megaphone, PA slate, and boom microphone. Equipment ownership/activity fails
  closed outside Shooting.
- Rebuilt the apartment set with era-readable teal wallpaper, warm canvas,
  burgundy textile/rug, dark walnut boards, practical furniture, and stronger
  working-stage density; refined routes and aspect-specific camera/blocking.
- Made seven lights shooting-only and added exactly three shooting-practical
  renderers: `Shooting Window Glow`, `Shooting Sconce Glow`, and
  `Shooting Standing Lamp Glow`. Proof asserts their exact state in all five
  milestones.
- Regenerated and persisted the canonical scene/NavMesh, tightened validator
  and EditMode coverage, and upgraded the Stage proof to schema `3` with exact
  role, held-prop, light/practical, composition, no-POST, and false-green gates.
- Kept all changes presentation-only. The five Stage states and full Movie #2
  authority journey remain unchanged.

### IMAGEGEN PROVENANCE

`PROVENANCE.md` records OpenAI built-in image generation, applicable output
terms, the 2026-08-21 acquisition date, source path/hash, deterministic
derivative process, and this exact prompt:

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

### WHAT IS WORKING RIGHT NOW

The exact CP13 development launch at that seal used this pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Rebuild the ignored compatible app only when absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/project-studio-cp13-rebuild.log \
  -quit
```

At the CP13 seal these moving worktrees launched CP13, not immutable M4. The
current moving tips now launch CP15. For exact CURRENT BEST recovery/build, use
both M4 tags.

### VALIDATION STATE

| Gate | CP13 result |
| --- | --- |
| Canonical scene validation | Final run 14 passed: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings; `/tmp/project-studio-cp13-build-scene-20260821-run14.log` |
| Unity EditMode | Final run 16 passed 127/127; `/tmp/project-studio-cp13-editmode-run16.xml`; log `/tmp/project-studio-cp13-editmode-run16.log` |
| Native macOS build | Final run 12 passed; `/tmp/project-studio-cp13-build-macos-20260821-run12.log`; 152,745,358 aggregate regular-file bytes; executable 116,116 bytes; executable SHA-256 `68043e536a98adcd7686d4e54b0f08ecfa5572c832521ac6e2111dcef35e6e7e` |
| Bridge aggregate | **Inherited unchanged**, not a CP13 TypeScript product rerun: 100/100 |
| Full TypeScript suite | **Inherited unchanged**, not a CP13 TypeScript product rerun: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript checks | **Inherited unchanged**: full and bridge typechecks, production build, generated-contract/contract checks, and repository hygiene passed |

### ACCEPTED STAGE PROOF

Landscape root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115813Z/Landscape/`.

- `stage-visual-proof-landscape.json`: schema `3`, `complete`, 1440x900,
  SHA-256
  `94c400a1cd7b649983923cb4fb9483636dd721a305e5778788cbba90d369f1c8`.
- Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
  `9eb1c9dc433eb0928bba995da747e4dfa95a960a16bb7f330c4f3062b72f82fa`,
  `2e6a422944e7da558970b463a4a3f015e9bd86183cd6cbf0b95292726c2eaf20`,
  `798579700f024adf9159631793bd19096c3732732d7839a75d97fd6941764424`,
  `12eadaa15e1f62a4dee4e11150ba482f7f3b4d4c6620a2e34a09b0ee32f752a1`,
  `1b2cdba0b0bce9a50b0493ee191364cacccbac6f02c32194b70259936eee870a`.

Portrait root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115635Z/Portrait/`.

- `stage-visual-proof-portrait.json`: schema `3`, `complete`, 390x844,
  SHA-256
  `6aa60673b492bb5b8b2d94dc8d35f1ac4920da51f4312e5eb1e17d17d43dae77`.
- Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
  `b454d1386990f29b9610a253dda1b6d4711c78be96cefe076018abc35500c5bd`,
  `b38f17b65a9e693a7dad55c428dded48326393969cf2be80716bda7a163cc2e3`,
  `8808213eac99dc8d16e4c12c2e5d7a8e023ef380907537ad0ee8b38c2af6123e`,
  `4245b8777526b722ced33af5c6449caa5d323bfcac8229fc14a4d1a2224f801e`,
  `e6b4da10a3eb3b8297041b1fc54c2927eb3550393603034a99db5fcd9049c2ca`.

Both reports advance revision `0 -> 18`, finish Week `20` at digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
accept exactly 18/18 proof-owned POSTs, record zero unexpected and zero
presentation-owned POSTs, and pass exact role/light/practical/no-extra-POST
contracts. Active states frame 4/4 authoritative and all eight ambient bodies.
Landscape and Portrait Load-In are intentionally honest: each frames 8/8
ambient roles, but only 7/8 are visually clear; the required threshold is six. The flatbed/truck
is intentionally outside the hero proof frustum. Do not rewrite either fact as
a full-clear or clipping claim. Earlier `Evidence/E/Stage7-*` attempts are
superseded iteration history; only these two roots are accepted.

### FRESH FUNCTIONAL REGRESSION

Root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Regression-20260821T115956Z/`.
Private profile:
`/private/tmp/project-studio-cp13-regression-20260821T115956Z`.

- Movie2 report SHA-256
  `a350507148445aca3ae8b2ab90f26b62bade0f5ef85d3c4b976503c8c254f132`:
  schema `5`, `complete`, session
  `992847ef-d875-43e0-ac92-d5b7fdb00364`, exact
  `The Reluctant Cornerstone` / `script-0001` / `prod-0013`, revision `23`,
  Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
  saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`,
  12 milestones, exact release true, retained `STALE_REVISION` guidance.
- Reconnect report SHA-256
  `aa1440efcf30fa80f98eb702b16694b13372b38d5f4907ca6ad3a3a81661daef`:
  complete, same logical authority and exact release identity under a new
  runtime instance.
- Accepted `RuntimeRestart2` ready/report SHA-256:
  `23b6cf8d86fa32da38d3e9b7505d6c0c1cc8d89046cdd009dc62f864b0081472` /
  `dadacb1573d297d59ca7dba41be9975af1c469d5f038f0100c169f2a37c72e28`.
  It validates PID/PGID `8648`, supervisor `8643`, incarnation
  `ps-lstart:Fri Aug 21 14:03:50 2026`, SIGKILL of only that engine,
  replacement PID `8692` on pinned port `50472`, one outage/replacement,
  actions disabled during outage, retained authority/projection, and zero torn
  reads.
- Invalid first restart report SHA-256
  `7c7757403edea814f1ef10c8875a8817c0bf9bf2ded6ee70455829ae222e73e9`
  missed the operator's 30-second kill window. It is superseded operator
  history, not a product defect.
- Stable checkpoint
  `/private/tmp/project-studio-cp13-regression-20260821T115956Z/bridge-runtime/bridge-runtime-v1.json`
  is 1,354,922 bytes, SHA-256
  `45eba062636d12bdd08fc908bc4bb4e9fb51320ef7fb8e5ee271d057dca0ae1e`,
  protocol `4`, schema `ba9cd199...`, revision `23`, journal `25` (23 command,
  one save, one load).

Use Movie2 plus Reconnect for release identity. `RuntimeRestart2` is only
restart-continuity proof: its schema leaves movie identity blank and reports
`exactMovie2Released: false`, while its ordinal-2 released milestone and restart
invariants pass. Do not use its blank identity fields to negate the accepted
Movie2/Reconnect release proof.

### KNOWN PROBLEMS / BLOCKERS

- P1 portrait composition: large ceiling/floor voids compress action into a
  narrow band; people/props overlap, and Load-In flats dominate.
- P1 Dark lighting: activity is absent, but the stage remains broadly warm-lit
  and does not read as genuinely stage-dark.
- P1 role read: landscape is improved but clustered; slate, megaphone, boom,
  and individual department silhouettes are not sufficiently legible.
- Screen-frustum inclusion is not occlusion/separation or held-prop screen-area
  proof. CP14 must close that false-green gap.
- Real foreground pointer/touch, 25/50/100 scaling, emitted packaging, and
  TypeScript-main reconciliation remain later gates. There is no known product
  P0 regression or authority drift.

Never fuse population counts, test totals, hashes, build bytes, or FPS with
visual success. CP13 is **SEALED NON-GOLDEN**. Golden M4 remains the sole
CURRENT BEST and promotion remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

### NEXT EXACT ACTION

Implement bounded CP14 on CP13: improve Stage role silhouettes and held-prop
legibility, author portrait-aspect-specific blocking/composition, and make Dark
genuinely dark through motivated state lighting. Add screen-space prop-area and
occlusion/separation proof that fails on overlap or illegibility. Preserve the
five-state truth and exact role/light/practical contracts; do not widen
TypeScript state, protocol/schema, save/gameplay, identity, or simulation scope.

### NEXT 3-5 ACTIONS AFTER THAT

1. Compare every CP14 landscape/portrait state frame against accepted CP13 and
   the local visual-fidelity ruling; accept images by inspection, not counts.
2. Run the same Stage schema-3 proof plus full Movie #2, reconnect, and exact
   process-restart regression; preserve invalid/superseded attempts honestly.
3. Expand believable role motion and run 25/50/100-person scalability evidence.
4. Complete real foreground pointer/touch evidence and direct lot
   construction/inspection.
5. Package/audit the emitted TypeScript runtime, then reconcile TypeScript
   `main` only on a separately validated canonical candidate.

### DO NOT TOUCH

- Do not create/move M5 or move/delete M1-M4. Golden M4 is the sole CURRENT
  BEST immutable pair.
- Do not promote CP13, call it Golden/canonical, or let proof totals, build
  bytes, population counts, hashes, or FPS override visual inspection.
- Do not change TypeScript sole simulation authority, protocol/projection/
  schema/generated DTOs, V14, `GameState`, permanent identities, RNG, economy,
  construction, or gameplay formulas for CP14.
- Do not weaken exact state-root, role assignment, held-prop, light/practical,
  viewport, no-POST, Movie #2, reconnect, restart, or checkpoint assertions.
- Do not call frustum inclusion occlusion proof, conceal portrait Load-In's 7/8
  visually-clear count, move the truck into the hero frustum merely to satisfy
  a count, or classify the missed-kill attempt as a product defect.
- Do not stage ignored apps, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Seal CP13 non-Golden and retain M4 as CURRENT BEST | Materials, roles, set density, and proof rigor improve, but portrait, Dark, overlap, and prop legibility still fail the visual law | Yes after a later complete Golden gate | Ten accepted CP13 Stage frames and independent visual audit |
| Keep CP13 Unity-only | The target gap is presentation; authoritative simulation/schema/save/gameplay behavior is already correct | Only through a separately justified state unit | Exact 87-file Unity diff and unchanged protocol/schema |
| Require exact role/light/practical contracts | Counts alone could pass while departments, held props, or state lighting were wrong | Yes within presentation while retaining fail-closed proof | Schema-3 role/effects records and 127/127 EditMode |
| Exclude the flatbed/truck from the hero frustum | The close-read proof is about interior production blocking, not an exterior vehicle edge | Yes through a later deliberate composition decision | Exact composition proof and accepted frames |
| Separate release identity from restart continuity | Restart2 intentionally omits unrelated identity fields; Movie2/Reconnect carry exact release identity | Only through a future report-schema version | Three accepted functional reports and explicit schema quirk |
| Bound CP14 to silhouette/composition/Dark proof | These are the dominant visual P1s; state/schema expansion would dilute the acceptance unit | Yes after CP14 inspection | Independent visual ruling |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is committed and pushed at TypeScript `6b28cac...` and Unity
  `e38c840...`; both were clean with HEAD equal upstream before this docs-only
  continuity update.
- Only the ledger, handoff, and promotion register belong in the containing
  documentation-only commit. It must be a direct child of TypeScript
  `6b28cac...`; resolve its SHA with `git rev-parse HEAD` after commit, then
  require HEAD equal upstream and a clean tracked tree after push.
- Native apps, Evidence/E, the private regression profile/checkpoint,
  screenshots, and `/tmp` validation files remain local/ignored and must not
  enter Git.
- `StageDressingAtlas.png` is committed product source with its `.meta` and
  exact `PROVENANCE.md` record. It is not uncommitted evidence. No Lionhead,
  purchased, trademarked, or protected visual-reference content was imported.

### RECOVERY INSTRUCTIONS

1. Read this top CP13 section, the ledger's CP13 entry, the promotion
   register's CP13 section, ADR 0006, and the client decision. Do not restart
   the engine/client decision.
2. For immutable CURRENT BEST recovery, verify both M4 tag dereferences:
   TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`, Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue CP13, use exact TypeScript
   `6b28cacfa9d8fd802ced951bb3248153cf348259` plus Unity
   `e38c8400ff28b0a516dda47b9c2b9a64374a50d6`. Never mix sides.
4. Preserve this section's containing documentation-only direct child of
   `6b28cac...`. Resolve the self SHA with `git rev-parse HEAD`; after push,
   confirm HEAD equals upstream and `git status --short` is empty. Confirm Unity
   HEAD/upstream at `e38c840...` and clean.
5. Rebuild/launch using the exact commands above. Verify protocol/projection
   `4`, schema `ba9cd199...`, and authenticated readiness before visual edits.
6. Use only the accepted Evidence/E hashes above. Treat the first
   `RuntimeRestart` as invalid/superseded, Movie2/Reconnect as release-identity
   proof, and RuntimeRestart2 as exact process-replacement continuity proof.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## CHECKPOINT 12 SEALED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

Checkpoint 13 above supersedes Checkpoint 12 as the current development base.
Checkpoint 12 remains preserved history and was never Golden, tagged,
canonical, promoted, or CURRENT BEST.

Checkpoint 12 is the pushed, compatible Stage 7 working-soundstage slice on top
of Checkpoint 11. It was the correct development base for the next bounded
visual unit at that seal, but it is not Golden, tagged, canonical, promoted, or
CURRENT BEST.
Golden M4 remains the sole CURRENT BEST recovery pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 11:43 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Checkpoint 12 authority / pushed | `93e15232915695e904680c34e2e1abbb4a5e5152`; no TypeScript product change in Checkpoint 12; HEAD/upstream equal and tracked tree clean before this continuity edit |
| Containing documentation seal | This section is contained in the documentation-only direct child of `93e15232915695e904680c34e2e1abbb4a5e5152`. Its self SHA is resolved with `git rev-parse HEAD`; recovery requires HEAD to equal configured upstream and the tracked tree to be clean. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity Checkpoint 12 product / pushed | `219f290e3dc4b7174ee2ff26992692e8b2779c89`; direct parent `5c8a0eee7fa16bb9fd486fb61707230b208330d6`; commit `feat(presentation): stage a working soundstage` |
| Unity branch tip / working tree | HEAD equals configured upstream at `219f290e...`; tracked tree clean |
| Compatible Checkpoint 12 pair | TypeScript `93e15232915695e904680c34e2e1abbb4a5e5152` plus Unity `219f290e3dc4b7174ee2ff26992692e8b2779c89`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; Checkpoint 12 is SEALED NON-GOLDEN and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. There is no schema, V14,
`GameState`, gameplay-formula, RNG, permanent-identity, or generated-contract
change in Checkpoint 12.

### CAMPAIGN STATUS

- Golden M4 remains the immutable build/recovery answer. Checkpoint 12 is the
  materially better development tip but does not supersede that authority.
- The Stage 7 camera now reveals a real five-state operating soundstage driven
  by exact protocol-v4 truth: Waiting, Load-In, Shooting, Clearing, and Dark.
- Active states preserve the distinction between exact authoritative on-stage
  identities and eight stable ambient department bodies. Runtime NavMesh,
  purposeful role animation, props, lighting/effects, and set working backs
  make the filmmaking activity recognizable.
- Fresh native landscape/portrait Stage proof, Movie #2, save/load, reconnect,
  and an actual killed-engine replacement pass on the sealed pair.
- The visual gate still fails: low-detail flat art/material/lighting, tiny role
  reads, portrait empty bands, and a clipped load-in truck remain below the
  local visual-fidelity ruling. Engineering counts and FPS do not alter that
  verdict.
- Packaging, TypeScript-main reconciliation, 25/50/100-person scaling, and real
  foreground touch remain later work. They do not outrank the next bounded
  Stage visual slice.

### WHAT WAS JUST DONE

- Added a pure, fail-closed `stage-a` truth resolver that joins the exact
  protocol-v4 property body, stage/facility, theater beat, and production
  operation without inferring missing authority or emitting an intent.
- Added mutually exclusive authored state roots for `Waiting`, `LoadIn`,
  `Shooting`, and `Clearing`, with all activity absent for `Dark` and first-load
  truth withheld until a complete snapshot arrives.
- Declared authoritative and ambient presentation slots separately. Active
  proof states show 4/4 authoritative director/cast identities when required
  and 8/8 ambient camera, grip, electric, PA, boom, carpenter, camera-assist,
  and wardrobe identities.
- Activated the authored NavMesh at runtime and added director, performance,
  camera, camera-assist, boom, electric, slate, and carry role animation and
  purposeful routing.
- Added state-driven interior spill, shooting beacon/indicators, six
  shooting-only lights, and distinct waiting/load-in/shooting/clearing props.
- Expanded Stage 7 art with a dressed apartment set, practical furniture,
  dolly/camera/boom/director stations, loading flatbed/flats, wrap cart, stage
  apron, visible working backs/studs/braces/rail, sandbag, and stronger generated
  stage-specific material detail.
- Added responsive diagonal Stage inspection profiles for 1440x900 landscape
  and 390x844 portrait while preserving the Checkpoint 11 camera/selection
  architecture and no-POST presentation boundary.
- Regenerated the canonical scene, expanded the validator and EditMode suite,
  rebuilt the native app, and added an additive five-state Movie #2 proof. The
  normal Movie #2/reconnect/restart proofs remain separate and passed fresh.

### WHAT IS WORKING RIGHT NOW

Rebuild the compatible pushed client if the ignored native app is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/project-studio-d-stage-seal-build.log \
  -quit
```

Launch the pushed Checkpoint 12 pair with the one product command:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

- Start a studio and make Movie #1 and Movie #2 through the Unity client as at
  Golden M4/Checkpoint 11. Inspect Stage 7 to see current TypeScript truth
  select exactly one of Waiting, Load-In, Shooting, Clearing, or Dark.
- Shooting visibly clusters a film camera, boom operator, director, cast, and
  crew around the dressed set. Load-In brings the flatbed/flats; Clearing uses
  wrap equipment; Dark removes stage people and activity lighting.
- Movie #2 remains `The Reluctant Cornerstone`, `script-0001`, `prod-0013`,
  released at revision `23`, Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Saved/restored digest is
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.

### VALIDATION STATE

| Gate | Checkpoint 12 result |
| --- | --- |
| Scene validator | 32 people, 10 vehicles, 18 equipment objects, 4 captures, 0 errors, 0 warnings |
| Unity EditMode | 101/101 passed; `/tmp/project-studio-d-stage-seal2-editmode.xml` |
| Native build | Passed; `/tmp/project-studio-d-stage-seal-build.log`; 137,484,986 aggregate bytes; executable SHA-256 `d41cadf58ec66502cc810aebd0c82022e8a58e350e10a94b4e2bdfbafa9f44e1` |
| Bridge aggregate | 100/100 passed |
| Full TypeScript | Uncontended rerun passed: 336 files, 4,526 passed, 5 skipped, 0 failed |
| TypeScript supporting gates | `typecheck`, `typecheck:bridge`, build, generated-contract check, and hygiene passed |
| Stage runtime proof | Both exact viewports complete; revision 0 -> 18 / Week 20; 18/18 accepted proof-owned POSTs; five states; active-state 4/4 authority plus 8/8 ambient; zero unexpected/presentation POSTs |
| Journey regression | Fresh Movie #2, exact save/load, reconnect, and accepted actual engine replacement pass with the same authority |

The initial full TypeScript suite was run concurrently with other validation and
transiently produced four duplicate-testid failures. The affected file then
passed 28/28 alone and the full uncontended suite reran clean. This is retained
as non-reproducible concurrent-run history, not hidden and not a product defect.

Accepted Stage evidence:

- Landscape root:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093017Z/Landscape/`;
  report SHA-256
  `3b5891ccd2cb3f88ad3f7f39bfe40a8ba498d74a29a5e20154869ce1786f1072`.
- Landscape Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
  `ec028158917530eaf84fdcb54a3581e04eba63ae9d790d94f71c4a6418d40434`,
  `7d5c047d446300966138378b546f7f4076f22b226d17325c8b74c5d3ecd7008a`,
  `74611d9ccd43fb6b5bbec5c8da123594f1e14d015bfb7a24934416150eb8be6e`,
  `eb31e56b45a6353f066479e800981cc80fe70d0b1e667f608fe6c5da31d9d1f0`,
  `4e751ecb820f22938c3d5d06da17a862d5d1a1d2226a413e3f376ef9639720cb`.
- Portrait root:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093040Z/Portrait/`;
  report SHA-256
  `dc72c390a8d8c894d7e9c2f0b5c006135776927a7aa48fe460f20e9d9c4b9f72`.
- Portrait Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
  `1f9bede04eb6d0606e1406c79db362137f3095f0877036bc7bf31975edf7942f`,
  `6399fce172be3037061d5cfc9c7b51b1c3088ca9db96e0ea6eb45f703ec5cd11`,
  `7c658181a42eede15241cd4a0ca567cd6ae3d3491b2b36bdd26e1a73ba9533ef`,
  `6b3de340c82253a5b789d25a5cc1fbf58c48317415263a3f74b154e016bfb6ba`,
  `e79a7f24c885b6a6d64a80116364c941a29e5d42d92059f32937f25315669213`.

Accepted fresh regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Regression-20260821T093322Z/`.

- Movie #2 report/released-frame SHA-256:
  `ec548b87a6b0caca729ae8a37d1ed1227405e5c46f44a4aa2b8ada54d74e5307` /
  `2f685af592fdd24382b664f39143ee4846f76e1e4a5681876b9ff98af0cde102`;
  session `0523495d-4cb6-46fe-b60d-f5cd38947afb`; 119.001 FPS.
- Reconnect report/frame SHA-256:
  `c58bb140adbcbed30cd02cfa48847c1ed3563b633da66492e5877cd71fab41cf` /
  `6cde39fa913f01945d7a167d0fc9737b116062484ac64582d65ea73df8736deb`;
  same authority/new runtime; 119.199 FPS.
- Accepted `RuntimeRestart2` ready/report/frame SHA-256:
  `e06cc19e99bbf5a1ef75603348e9f65ff8ed876dca4aac1e1f61f00ae3c591b8` /
  `3e2e7be339a6c1dddbc61760364ab1cf51f20228cd4ae416dc402b5b448ac906` /
  `878f533dfa92d448ba99abd1dd63ffa34f10fb3e5832f58caf74e2d9562ce632`.
  Initial PID `81829`/incarnation is validated; replacement PID `81939` uses
  pinned port `62737`; exactly one outage/replacement; same authority; 119.999
  FPS.
- Superseded `RuntimeRestart` report SHA-256
  `ee8631e363ca402cd56d7dd1c857a79bae5f915449dea7572b381811490035c2`
  missed the operator kill window and killed no engine. It is not a product
  failure.
- Runtime checkpoint: V1, protocol `4`, schema `ba9cd199...`, revision `23`, 25
  journal entries, 1,354,914 bytes, SHA-256
  `4cff54571eba36eecdfded011c5e840c4eadd48dcfa8771dfeea37b0bc6473da`,
  exact saved digest above.

### KNOWN PROBLEMS / BLOCKERS

- P1 visual acceptance: the soundstage is recognizable and its five states are
  distinct, but art, surfaces, and lighting remain low-detail/flat; people and
  roles read too small; portrait keeps empty bands and clips the load-in truck.
  This remains below
  `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`.
- Frustum checks prove projected viewport inclusion, not freedom from occlusion
  by every foreground prop/body.
- Director-blocked `Waiting` currently shares the rehearsal `Waiting` visual
  state.
- The accepted restart report records `exactMovie2Released: false` because of
  the existing report-schema quirk; the exact ordinal-2 released milestone and
  all restart invariants pass.
- Real foreground pointer/touch activation remains unproven. Do not waive it for
  a future Golden.
- P2 packaging and TypeScript-main reconciliation remain open. There is no known
  product P0 regression or authority drift.

Never fuse population counts, test totals, build bytes, or FPS with visual
success. They verify different acceptance dimensions.

### NEXT EXACT ACTION

Implement one bounded visual slice on Checkpoint 12 that improves Stage 7 set
and role close-read, material depth, practical/cinematic lighting, and
landscape/portrait composition. Preserve the exact Stage truth/state machinery,
then rerun the five-state proof and the full Movie #2/reconnect/restart
regression. Do not switch to infrastructure work and do not propose promotion
until the images independently pass the visual law.

### NEXT 3-5 ACTIONS AFTER THAT

1. Compare every new landscape/portrait state frame against Checkpoint 12 and
   the local visual-fidelity ruling without importing protected material.
2. Give director-blocked Waiting its own exact visual substate if the authority
   supports a rigorous distinction; never parse display text to obtain it.
3. Expand believable role motion and run 25/50/100-person scalability evidence.
4. Complete real foreground pointer/touch evidence and productionize direct lot
   construction/inspection.
5. Package/audit the emitted TypeScript runtime, then reconcile TypeScript
   `main` only on a separately validated canonical candidate.

### DO NOT TOUCH

- Do not create/move `golden/unity-convergence-m5`; do not move/delete M1-M4.
  Golden M4 remains the sole CURRENT BEST immutable pair.
- Do not promote Checkpoint 12, call it Golden/canonical, or let test totals,
  build bytes, population counts, or FPS override visual inspection.
- Do not change TypeScript sole simulation authority, protocol/schema/generated
  DTOs, V14, `GameState`, permanent identities, RNG, economy, or gameplay
  formulas for presentation work.
- Do not infer Stage state from display text, emit presentation POSTs, merge
  ambient and authoritative identity, or relax fail-closed Stage joins.
- Do not weaken exact state-root, active-person, viewport, no-POST, Movie #2,
  save/load, reconnect, restart, or checkpoint assertions.
- Do not claim frustum inclusion proves occlusion-free composition. Do not treat
  the missed-kill report as a product failure or the restart-report schema quirk
  as proof Movie #2 was not released.
- Do not stage ignored apps, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, or `/tmp` outputs. Do not import protected references or
  reproduce the 2005 UI literally.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Seal Checkpoint 12 non-Golden and retain M4 as CURRENT BEST | The soundstage is now recognizable and stateful, but the close-read art/material/lighting/composition bar still fails | Yes after a later complete Golden gate | Ten accepted Stage frames and local visual ruling |
| Drive all Stage state from exact protocol-v4 joins | Presentation must reflect authoritative stage/operation/theater truth and fail closed on ambiguity | Only through a separately versioned authority change | Resolver/EditMode coverage and five-state reports |
| Separate ambient from authoritative people | Ambient crew may enrich the world but cannot impersonate simulation identities | Yes within presentation while preserving the boundary | Slot validator and active-state 4/4 plus 8/8 evidence |
| Keep the five-state proof additive | A focused visual proof must not replace full journey, reconnect, or process-restart regression | Yes | Separate accepted evidence roots |
| Continue with a visual close-read slice | The dominant remaining failure is visible quality, not runtime infrastructure | Yes after comparative inspection | Landscape/portrait captures and non-Golden ruling |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is committed and pushed at TypeScript `93e1523...` and Unity
  `219f290e...`; both were clean with HEAD equal upstream before this docs-only
  continuity update.
- Only the ledger, handoff, and promotion register belong in the containing
  documentation-only commit. It must be a direct child of TypeScript
  `93e1523...`; resolve its SHA with `git rev-parse HEAD` after commit, then
  require HEAD equal upstream and a clean tracked tree after push.
- Native apps, evidence, private profiles/checkpoints, screenshots, and `/tmp`
  validation files remain local/ignored and must not enter Git.
- No purchased, image-generated, Lionhead, or otherwise protected reference
  asset is part of Checkpoint 12.

### RECOVERY INSTRUCTIONS

1. Read this top section, the ledger Checkpoint 12 entry, the promotion
   register's Checkpoint 12 section, ADR 0006, and the client decision. Do not
   restart the engine/client decision.
2. For immutable CURRENT BEST recovery, verify both M4 tag dereferences:
   TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`, Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue Checkpoint 12, use exact TypeScript
   `93e15232915695e904680c34e2e1abbb4a5e5152` plus Unity
   `219f290e3dc4b7174ee2ff26992692e8b2779c89`. Never mix sides.
4. Preserve this section's containing documentation-only direct child of
   `93e1523...`. Resolve the self SHA with `git rev-parse HEAD`; after push,
   confirm HEAD equals configured upstream and `git status --short` is empty.
   Confirm Unity HEAD/upstream at `219f290...` and a clean tracked tree.
5. Rebuild/launch with the exact commands above. Verify protocol/projection `4`,
   schema `ba9cd199...`, and authenticated readiness before changing visuals.
6. Use the exact evidence hashes above. Treat the first `RuntimeRestart` as
   superseded operator history and `RuntimeRestart2` as accepted process-kill
   proof.
7. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized until a future checkpoint passes visual, interaction, runtime,
   remote CI, clean-tree, and recovery gates independently.

## CHECKPOINT 11 PUSHED - HISTORICAL NON-GOLDEN CAMPAIGN TIP

This section records the prior current state before Checkpoint 12. Checkpoint 11
is a pushed, compatible location-identity and two-scale camera pair on top of
Golden M4, but Checkpoint 12 above supersedes it as the current development tip.
It was never Golden, tagged, canonical, or CURRENT BEST. Golden M4 remains the
sole CURRENT BEST recovery pair.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 09:32 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Checkpoint 11 product / pushed | `014f7ef94e085222bf375b9457a6b15420fa314c`; direct parent `db03bd8400e79822262a17ba73b0a4c829dc91ff` |
| TypeScript branch tip / working tree | The pushed documentation-only seal containing this section is the direct child of preliminary docs-only seal `600e014f3bd862583ee1605d158d1f8edb1f525e`, which follows test-only repair `21629d2323dc11bc5927ff209f9255909fb5afe2` and docs-only continuity `ef6bb94d5bc05fd8a8166c8e7ac059a766e0b8e2`. Because a commit cannot embed its own resulting SHA, resolve the seal with `git rev-parse HEAD`; required state is HEAD equal configured upstream with a clean tracked tree. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity Checkpoint 11 product / pushed | `5c8a0eee7fa16bb9fd486fb61707230b208330d6`; direct parent `6b32335447848ed0680eb8077e78ee36aded5d56` |
| Unity branch tip / working tree | Local HEAD, configured upstream, and pushed branch equal `5c8a0eee...`; tracked tree clean |
| Compatible Checkpoint 11 pair | TypeScript `014f7ef94e085222bf375b9457a6b15420fa314c` plus Unity `5c8a0eee7fa16bb9fd486fb61707230b208330d6`; no tag |
| Sole CURRENT BEST / recovery pair | Golden M4: TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56`, both under pushed annotated `golden/unity-convergence-m4` |
| Exact-product CI | Passed TypeScript run `32454923261` at `014f7ef94e085222bf375b9457a6b15420fa314c`; 12m12s; every workflow step green |
| Post-product continuity failure | Docs-only `ef6bb94d5bc05fd8a8166c8e7ac059a766e0b8e2` triggered run `32456422238`; Bridge test failed on an `allFiles` disappearing-candidate `lstat` `ENOENT`; this is a test-harness TOCTOU race, not a product defect |
| Test-only repair / CI | Pushed `21629d2323dc11bc5927ff209f9255909fb5afe2`, parent `ef6bb94d...`; exact repair run `32457020574` passed every workflow step in 11m41s |
| Preliminary documentation seal / CI | Pushed `600e014f3bd862583ee1605d158d1f8edb1f525e`, parent `21629d2...`; exact run `32458198739` passed every workflow step in 11m38s |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 remains sole CURRENT BEST; Checkpoint 11 is non-Golden and not canonical |

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The generated TypeScript and Unity C# DTO copies remain byte-identical at
SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
TypeScript remains sole simulation authority; no schema, V14, `GameState`,
gameplay formula, RNG stream, or permanent authority moved into Unity.

### CAMPAIGN STATUS

- Golden M4 has completed the durable local-development lifecycle and remains
  the immutable recovery floor.
- Checkpoint 11 has completed the first bounded Phase C/I location and camera
  slice: canonical physical identity, management/inspection modes, collision,
  shared pointer/touch handling, and deterministic Back-path evidence.
- Native Movie #2, save/load/stale retention, reconnect, and an actual killed
  engine/replacement all pass fresh on the Checkpoint 11 pair.
- The player-facing visual gate remains failed. Stage 7 is more legibly a film
  production at close scale, but the campus, Administration, materials, people,
  period identity, and responsive HUD do not yet meet the governing ruling.
- Emitted production packaging and TypeScript-main reconciliation remain later
  work. They do not outrank the immediate production-art slice.
- Post-product validation continuity is repaired and remotely sealed by exact
  repair run `32457020574` and preliminary documentation-seal run
  `32458198739`. Checkpoint 11 product/runtime/visual facts and its non-Golden
  decision remain unchanged.

### WHAT WAS JUST DONE

- TypeScript `014f7ef9...` pins projection-v4 physical identity without changing
  the protocol: `lot.property.buildings[].id` is the physical namespace; stage,
  active-production, and production-operation IDs join it exactly; real
  placement `1` for `facility-scenery-shop-1` joins `placed-1`; `expansion`
  remains the documented parcel-only exception.
- Unity `5c8a0eee...` uses explicit `StudioLocationBinding` components and
  fail-closed joins, so an unknown/ambiguous physical ID cannot default to
  Administration or collide with a facility/selectable ID.
- Added a typed Cinemachine 3.1.7 overview/inspection director with authored
  Stage 7 and Administration profiles, 0.85-second blends, deocclusion,
  collision recovery, selection-proxy exclusion, and smooth return.
- Unified mouse and touch into one frame sample, latched UI-owned gestures,
  blocked camera actions over every UI/touch, prevented stationary startup
  edge-pan, and restored management input/workflow visibility after inspection.
- Added a persistent 220x56 `BACK TO STUDIO` control plus Escape/Home and
  same-target double activation. Camera focus is presentation-only and emits no
  Bridge POST.
- Regenerated and validated the canonical scene, expanded EditMode identity and
  camera tests, rebuilt the native app, captured 1440/narrow proofs, and reran a
  fresh full Movie #2/reconnect/restart regression.
- Three real external-control attempts failed closed because the unattended
  macOS session remained behind `loginwindow`; they are superseded
  environmental attempts. No successful real foreground click/touch proof is
  claimed.
- Docs-only continuity commit `ef6bb94d...` triggered CI run `32456422238`.
  Bridge test failed because an atomic lease candidate disappeared after
  recursive discovery but before `lstat`; the remaining bridge files passed and
  the failure occurred in test inspection and did not contradict product
  behavior.
- Pushed test-only child `21629d2...` repairs only the test helper. A discovered
  entry's `ENOENT` from `lstat` or directory read is tolerated; the scan root
  and every non-`ENOENT` error still fail closed. Symlinks remain excluded and
  stable files remain inspected.
- Deterministic tests cover disappearing files/directories plus `EACCES`.
  Supervisor tests passed 11/11 three consecutive times locally; the bridge
  aggregate passed 100/100; contract check, both typechecks, and diff hygiene
  passed. Exact repair CI `32457020574` then passed every workflow step at
  `21629d2...` in 11m41s.

### WHAT IS WORKING RIGHT NOW

Rebuild the exact compatible native client if the ignored app is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-c-checkpoint11-native-build.log \
  -quit
```

Launch the pushed Checkpoint 11 branch pair:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

- Management starts at the authored whole-campus home and retains pan/orbit/zoom
  and selection. Double-activate Stage 7 or Administration to blend into its
  human-scale profile; use `BACK TO STUDIO`, Escape, Home, or same-target double
  activation to return.
- Stage 7 targets physical `stage-a`, operational facility
  `facility-soundstage-07`; Administration targets physical `admin`. No
  facility-prefixed fallback is legal.
- Movie #2 remains `The Reluctant Cornerstone`, `script-0001`, `prod-0013`,
  released at revision 23/week 22/digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Saved/restored digest is
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.

### VALIDATION STATE

| Gate | Checkpoint 11 result |
| --- | --- |
| Full TypeScript suite | Passed: 336 files; 4,525 passed; 5 skipped; 0 failed |
| Bridge aggregate | Checkpoint 11 product passed 99/99; test-only repair passed 100/100 locally |
| Typechecks/build | Bridge and full application typechecks passed; production build passed |
| Audits | Browser runtime dependencies 0; repository hygiene 1,032 files; 26 adopted 3D assets, 0 hard violations |
| Unity EditMode | Passed 86/86 |
| Scene validation | Passed: 32 people, 10 vehicles, 18 equipment objects, 4 capture anchors, 0 errors, 0 warnings |
| Native build | Passed; 137,037,930 aggregate file bytes |
| Native camera proof | Passed deterministic 1440x900 and 390x844 mode/blend/collision/authority/Back-path runs |
| Native journey regression | Passed fresh Movie #2, exact save/load/stale retention, full-client reconnect, and one actual engine replacement with zero torn reads |
| Real foreground pointer/touch | **Not accepted**: unattended `loginwindow` prevented external GUI activation; deterministic same-path proof passed, but a foreground run remains required |
| Exact-product GitHub CI | Passed run `32454923261` at TypeScript `014f7ef94e085222bf375b9457a6b15420fa314c`; 12m12s; every workflow step green |
| Docs-continuity CI | Run `32456422238` failed in the test helper when one atomic lease candidate disappeared between discovery and `lstat`; classified test-only, not a product regression |
| Repair validation | `tests/bridge-supervisor.test.ts` 11/11 passed three times; bridge 100/100; contract check, bridge/full typechecks, and `git diff --check` passed |
| Exact repair CI | Passed run `32457020574` at pushed test-only `21629d2323dc11bc5927ff209f9255909fb5afe2`; 11m41s; every workflow step green |
| Preliminary documentation-seal CI | Passed run `32458198739` at pushed docs-only `600e014f3bd862583ee1605d158d1f8edb1f525e`; 11m38s; every workflow step green |

Accepted camera evidence:

- 1440x900 root:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Final-20260821T060033Z/`;
  report SHA-256
  `249c812d2279dd762ffc1f04efc80e08ebf7ee7597b2c12cc11b43e5a1afe912`.
- 1440 management / Stage 7 / Administration / return frame SHA-256:
  `b557f2feeb57b4c5061fb138f904a3e83a780a5021101f13ba9a17bfd1e0f546`,
  `a682901c243e17460a626f041ef347a557bf91c16c21eb01f5f73442aa0bf242`,
  `476ae54561ea4d55b55167136601858c5fb0bf9312c29635e73f72ab9b525722`,
  `df8e8d166499e17dbf5a5a76314a843b2e803f33f60e487db99bdf85f726a02d`.
- 390x844 root:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Narrow-Final-20260821T060033Z/`;
  report SHA-256
  `f9bdeaf47d7be7056d97039520d47ef87d337b503e3c67f1d29e706505ab067b`.
- Narrow management / Stage 7 / Administration / return frame SHA-256:
  `8a2f4507c67d81496e28d0fc8993482c041bb18985b7e1948d32fa93537152ea`,
  `6c8ab65c88768560ed754f9431d68f74d15d147edf61e99f1a8d9f168b4478d6`,
  `b108ea3ff74d457ab8aa6bc633b210212d46749de7e2b25e97e6fa519ed6d2db`,
  `601bf0b1de6f8738755684a9a94f1ce2af9ce2dac7b54e0ec0a220fabce769d6`.
- Both accepted runs preserve session `camera-native-shooting-v1`, revision 12,
  week 17, digest
  `eeef141cbebfab95bbcbbcee55b67473e3b07d26507c7f111e7bf4ab3c65f521`
  without a Bridge POST. Collision displaces `8.6125526` metres and recovers
  within `4.7683716e-7` metres with no overlap/blocked spherecast.
- Superseded external-control report roots are `Camera-Touch-...`,
  `Camera-Touch-Final-...`, and `Camera-Touch-Final2-...`; hashes
  `74e49bcc1e9c5a613f5babef40654523cdb6773e7d14e4ca77a297471a521251`,
  `94bb6e2b851eb72e0551a72e740c704bc3f93ee3711e999f15b273fd7a5402ce`,
  and `6757fe48e9682da5353435cf91f248b0e65a7cd236b9c70904138870a4cc0e48`.

Accepted fresh regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Regression-20260821T062502Z/`.

- Movie #2 report/release frame SHA-256:
  `c0fbb5e185a38e67886ea4e73a67de5109467f9314f8db1e9eabe0f26ce09600` /
  `5d01de0a80a2f5daea3b77b7970de2bd35f5647ca326e31f1e9017f2cfd11cbd`.
- Reconnect report/frame SHA-256:
  `66578dac0eed82ef504cb51ffb87b0f3501a00041128b92c7d64955eae5b20bd` /
  `21f1aad7c4aec3fc9da5defd6b1639d5895ecf0956f4580e96e158a444f83b4e`.
- Runtime-restart report/ready/frame SHA-256:
  `101cc3d8c81631c9e07486759e8926c52d4cf72165ec885e656164ea320526e3` /
  `96027cba21bd3c44d6efe5aab908818ca62e0b2495efee5638fd2cf686388208` /
  `0d63226b667f05680594e942da6bd0526dd59b00fa410e0587fdfbeef6aa9ecc`.
- Final checkpoint: 1,354,919 bytes, 25 journal entries, SHA-256
  `657458a33f8417e50da5d50d308161598705e0360de6d5403fd31e843a6df02e`.

### KNOWN PROBLEMS / BLOCKERS

- P1 visual acceptance: management still reads as a flat diorama with a large
  generic HUD; Administration is empty/flat; people, materials, production
  density, wardrobe, roles, and period identity remain insufficient. Narrow
  management is largely obscured by the workflow panel.
- P1 evidence: real pointer/touch activation of the Back control has not run in
  a foreground interactive macOS session. The proof fails closed and must be
  rerun, not waived, before a later visual Golden.
- P2 packaging: `npm run studio` still uses the pinned development graph; emitted
  production packaging and direct dependency remediation remain incomplete.
- Canonical integration: TypeScript `main` remains semantically divergent. Do
  not attempt wholesale/canonical reconciliation during the next bounded art
  slice.
- Exact-product CI is green at the pushed TypeScript product. This closes the
  remote engineering gate but does not override the failed visual gate.
- Exact repair CI `32457020574` is green at pushed `21629d2...`; failed run
  `32456422238` remains superseded test-harness history, not a product defect.
- Preliminary documentation-seal CI `32458198739` is green at pushed
  `600e014f...`; every workflow step passed in 11m38s.
- There is no known product P0 regression and no authority drift in accepted
  evidence.

The visual-fidelity authority is
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
SHA-256
`692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
It and representative The Movies screenshots are references only. Do not copy
or import protected assets, textures, UI artwork, layouts, or production
material.

### NEXT EXACT ACTION

Implement one bounded production-art slice on Checkpoint 11: make Stage 7 and
Administration visibly inhabited and period-readable with authored material
variation and role-readable people, and replace the oversized generic workflow
surface with a restrained world-first responsive HUD. Rerun the same 1440x900
and 390x844 camera/collision/authority proof plus a real foreground
pointer/touch activation of `BACK TO STUDIO`.

### NEXT 3-5 ACTIONS AFTER THAT

1. Compare new 1440/narrow captures against Checkpoint 11, Golden M4, the local
   visual-fidelity ruling, and representative The Movies references without
   importing protected material.
2. Expand believable role activity, locomotion, waiting, and production
   clustering, then measure 25/50/100-person behavior.
3. Productionize direct lot construction placement/inspection while retaining
   the canonical placed-facility identity join.
4. Compile/package the TypeScript runtime and define/audit its emitted
   dependency graph.
5. Reconcile the campaign with TypeScript `main` only after the visual and
   packaging gates justify a canonical candidate.

### DO NOT TOUCH

- Do not create/move `golden/unity-convergence-m5`. Do not move/delete M1-M4;
  M4 remains the sole CURRENT BEST immutable pair.
- Do not promote Checkpoint 11 wholesale, merge stale PR #5, or call the camera
  slice Golden/canonical. Production-ready donor concepts must be reimplemented
  cleanly on the current campaign baseline.
- Do not change TypeScript sole simulation authority, protocol/schema/generated
  DTOs, V14, `GameState`, permanent identities, RNG, or gameplay formulas to
  solve presentation work.
- Do not restore facility-prefixed physical fallbacks, default an unknown
  location to Administration, or treat `expansion` as a property body.
- Do not weaken collision, UI gesture exclusion, no-POST, exact-return, or
  restart assertions to make evidence pass.
- Do not classify run `32456422238` as a product failure, broadly swallow
  filesystem errors, follow symlinks, or tolerate root/non-`ENOENT` scan
  failures. Only a discovered entry that atomically vanishes is benign.
- Do not stage ignored apps, evidence, profiles, screenshots, logs, locks,
  caches, or `/tmp` outputs. The temporary profile-seeding helper was deleted
  before product commit and is absent.
- Do not import protected reference assets or reproduce the 2005 UI literally.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Keep Checkpoint 11 non-Golden and retain M4 as CURRENT BEST | Camera/identity behavior is materially better, but the visual result still fails the inhabitable, period-readable, world-first gate and real foreground touch proof is absent | Yes after a later complete visual gate | Accepted 1440/narrow captures, failed-closed external-control reports, visual ruling |
| Use `lot.property.buildings` as the physical namespace | A single authoritative namespace prevents facility/selectable collisions and invented fallbacks while preserving operational facility IDs | Only through a separately versioned contract change | TS identity test, Unity bindings/validator, native authoritative target joins |
| Keep camera behavior presentation-only | Focus, orbit, collision, and HUD visibility do not need simulation mutation | Yes if a future gameplay command is explicitly designed in TypeScript | No-POST camera reports and unchanged digest |
| Make production art and responsive HUD the next bounded unit | The camera now exposes the real deficit: empty/flat locations, weak human/period readability, and UI that dominates narrow screens | Yes after visual comparison | Stage/Admin/overview/narrow frames and PDF law |
| Defer packaging and main reconciliation | They remain necessary, but neither resolves the immediate player-facing wrong-game response | Yes | Promotion blockers remain recorded |
| Repair the continuity scan as a test-only TOCTOU defect | Atomic lease publication may remove a discovered candidate before inspection; swallowing only discovered-entry `ENOENT` models that legal race while root and permission errors remain fail-closed | Yes if a stronger deterministic scan replaces it | Failed run `32456422238`, deterministic disappearance/`EACCES` coverage, repeated 11/11 supervisor runs |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source remains committed and pushed at TypeScript `014f7ef9...` and
  Unity `5c8a0eee...`. Pushed `21629d2...` changes only
  `tests/bridge-supervisor.test.ts`; it does not replace either product SHA.
- There is no uncommitted product or continuity work. This ledger, handoff, and
  promotion register are sealed by the documentation-only commit containing
  this section, directly atop preliminary seal `600e014f...`. At recovery,
  TypeScript HEAD must equal configured upstream and the tracked tree must be
  clean.
- Unity is already clean with HEAD equal configured upstream at `5c8a0eee...`.
- Camera/regression evidence, the ignored native app, private seeded proof
  profile/checkpoint, `/tmp` results, caches, logs, locks, and screenshots
  remain local and must not enter Git. The temporary seeding helper is absent
  and was not part of either product commit.
- No purchased, image-generated, Lionhead, or otherwise protected asset is part
  of Checkpoint 11.

### RECOVERY INSTRUCTIONS

1. Read this top section, the ledger Checkpoint 11 entry, the promotion
   register's Checkpoint 11 non-Golden section, ADR 0006, and the product-client
   decision. Do not restart the engine/client decision.
2. For immutable CURRENT BEST recovery, verify both pushed M4 tag dereferences:
   TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`, Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
3. To continue Checkpoint 11, use the exact pushed pair TypeScript
   `014f7ef94e085222bf375b9457a6b15420fa314c` plus Unity
   `5c8a0eee7fa16bb9fd486fb61707230b208330d6`. Never mix sides.
4. Preserve pushed validation repair
   `21629d2323dc11bc5927ff209f9255909fb5afe2`, preliminary documentation seal
   `600e014f3bd862583ee1605d158d1f8edb1f525e`, and this section's containing
   documentation-only child above the product pair. Resolve the containing
   seal with `git rev-parse HEAD`; confirm it is the direct child of
   `600e014f...`, equals configured upstream, and has an empty
   `git status --short`. Confirm Unity HEAD/upstream at `5c8a0eee...` and a
   clean tracked tree.
5. Rebuild/launch with the exact commands above. Verify protocol/projection `4`,
   schema `ba9cd199...`, and authenticated readiness before changing visuals.
6. Use the accepted report/frame hashes above for regression. Treat all three
   `Camera-Touch*` roots as failed/superseded; rerun the external proof only in
   a real foreground interactive session.
7. Continue only with NEXT EXACT ACTION. Do not tag M5 or promote to canonical
   unless a future checkpoint independently passes the visual, interaction,
   runtime, remote CI, clean-tree, and recovery gates.

## GOLDEN M4 SEALED - HISTORICAL RECOVERY AUTHORITY

This is the immutable historical Golden M4 authority beneath Golden M5. M4 was
the sole CURRENT BEST compatible Project: Studio pair at seal time; M5 now
supersedes it without moving the M4 tags. M4
combines the authenticated durable/retry work from Checkpoints 8 and 9 with Checkpoint
10's one-command stable-profile supervisor. Both exact product commits and both
annotated M4 tags are pushed and remotely verified. It is Golden, not canonical
and not ready for canonical promotion.

This section preserves M4 seal-time branch, worktree, command, and next-action
history. Both campaign branches have since advanced to Checkpoint 11. Use the
top recovery instructions and both M4 tags for exact M4; do not run this
section's seal-time absolute-path commands against the advanced worktrees and
call the result M4.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 06:57 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden M4 product / pushed | `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`; pushed campaign tip before this continuity-only seal |
| TypeScript direct parent | `e6421dcd51c7b64071b8be227f0950129634ff35` (`feat(runtime): supervise the local Unity product lifecycle`) |
| TypeScript implementation parent | `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; parent of the implementation product commit |
| TypeScript branch tip / working tree | This handoff's containing commit will be the sole documentation-only descendant of Golden product `11e2cf88...`; after push, local HEAD must equal configured upstream and the tracked tree must be clean |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity Golden M4 product / parent | `6b32335447848ed0680eb8077e78ee36aded5d56`; direct parent `94e8bcac6a5bf94fd70f3f8a61992511230688a2` |
| Unity pushed state / working tree | Local HEAD, configured upstream, pushed branch, and remote tag dereference agree at `6b323354...`; tracked tree clean |
| Current compatible pair | TypeScript `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity `6b32335447848ed0680eb8077e78ee36aded5d56` |
| Golden M4 tags | Annotated and pushed `golden/unity-convergence-m4` in both repositories; remote dereferences match the exact compatible pair |
| Preserved prior tags | Immutable M1, M2, and M3 tags remain pushed in both repositories; none was moved or deleted |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M4 supersedes M3 as CURRENT BEST but is not canonical or ready for canonical promotion |

The M4 bridge remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The checked-in TypeScript and Unity generated C# copies remain byte-identical at
SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No schema, generated DTO, projection fact, `GameState`, V14 field, gameplay
formula, permanent identity, RNG stream, art, or asset changed in the seal.
TypeScript remains sole simulation authority.

### CAMPAIGN STATUS

- Current phase: Phase B development lifecycle is complete and sealed Golden;
  move next to the first visible two-scale production slice.
- Completed phases/subphases: setup/baseline; A1 generated contract; A2 named
  atomic projections; A3 queue-law parity; A4 rejection guidance; donor
  governance/security reconciliation; Checkpoint 7 durable commit-before-
  response; Checkpoint 8 authenticated restart; Checkpoint 9 exact in-flight
  command/save/load recovery; and Checkpoint 10 supervised product lifecycle.
- Phase B completed scope: stable private profile, fresh per-launch capability,
  random initial/pinned restart port, authenticated readiness, direct child
  ownership, incarnation-bound leases, stale cleanup, bounded secret-free logs,
  automatic engine restart, signal shutdown, and full-launch V14 continuity.
- Partially completed Phase B packaging scope: emitted production runtime,
  installer/update behavior, dependency remediation, and profile backup/recovery
  UX remain incomplete.
- Untouched/later high-value work: the Stage 7/Admin two-scale visual slice,
  inhabitable production activity, human readability, and direct construction
  polish remain the next visible convergence phases.
- Current acceptance gate: schema-backed stable location identity plus a
  Cinemachine management-to-inspection transition, proven with before/after
  captures at both camera scales without moving simulation authority into C#.

### WHAT WAS JUST DONE

- `e6421dcd51c7b64071b8be227f0950129634ff35` committed and pushed the
  one-command TypeScript-owned supervisor and its tests, ADR, security policy,
  README, shared process-incarnation helper, leases, bounded logs, stable
  profile, authenticated readiness, and automatic engine replacement.
- First exact-product CI run `32446759604` failed only because a broad test
  regex counted legitimate Linux cleanup `cleanup engine pid=8399` as a second
  start and received `[8399, 8399]`. It did not reproduce a product defect.
- Direct child `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` changed only the test and
  interruption handoff: it parses exact engine-publication lines and covers
  synthetic cleanup, unpublished/reused PIDs, a genuine second publication,
  and the valid pre-exit replacement cleanup race.
- Final exact-product Bridge contract run `32447981439` passed every step at
  `11e2cf88...` in 12m27s, including the Linux supervisor/`flock` path, bridge
  98/98, full 336-file suite, typechecks, production build, hygiene, and assets.
- Annotated immutable `golden/unity-convergence-m4` tags were created and pushed
  in both repositories. Their remote dereferences match `11e2cf88...` and
  `6b323354...` exactly. M1-M3 remain preserved.
- Golden M4 supersedes M3 because it accumulates M3's playable/rejection floor,
  Checkpoint 8 security/restart, Checkpoint 9 byte-exact in-flight retry, and
  Checkpoint 10's first owned one-command native lifecycle.

### WHAT IS WORKING RIGHT NOW

If the ignored native app is absent, rebuild the exact compatible Unity client:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-golden-m4-native-build.log \
  -quit
```

Seal-time one-command launch (historical; do not run this against the advanced
campaign worktrees and call the result M4):

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

- `npm run studio` owns both local processes, an authenticated random loopback
  endpoint, a stable private V14 profile, a fresh per-launch capability, exact
  engine replacement on the pinned port, cleanup, and bounded redacted logs.
- Fresh construction and Movie #2 remain playable through screenplay,
  auditions/evidence, package/greenlight, pre-production, director/scenery,
  load-in, shooting, save/load, post, stale guidance, release, full-client
  reconnect, and supervised engine restart.
- Movie #2 is `The Reluctant Cornerstone`, `script-0001`, `prod-0013`, released
  at Week 22/revision 23 with final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`
  and saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- The stable proof profile recovered the same session/revision/digests across
  full-client launches and an actual engine replacement with zero torn reads.
- Visual output is unchanged from M3 and remains below ADR 0006: it still reads
  as a sparse elevated diorama with a large generic HUD, flat materials, small
  role-unreadable people, weak filmmaking activity, and no convincing
  human-scale inspection view.

### VALIDATION STATE

| Gate | Golden M4 result |
| --- | --- |
| Exact-product GitHub CI | Passed run `32447981439` at `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`; 12m27s; all steps green |
| Full TypeScript suite | Passed: 336 files; 4,524 passed, 5 skipped, 0 failed |
| Bridge aggregate | Passed: 98/98 across 11 files, including exact publication parsing and Linux supervisor/`flock` behavior |
| Typechecks/build | Bridge and full application typechecks passed; production build passed with inherited Vite chunk warnings only |
| Contract/determinism | Generated drift, protocol/schema identity, Movie #2, V14 export/import/headless parity, stale/duplicate protection, and polling neutrality passed |
| Dependency/hygiene/assets | Browser runtime audit 0; repository hygiene passed; 26 adopted 3D assets, 0 hard violations |
| Full development audit | Five dev-graph advisories remain: 3 moderate, 1 high, 1 critical; explicitly not misreported as browser runtime findings |
| Unity EditMode | Passed 62/62; `/tmp/studio-b10-golden-editmode.xml` |
| Native macOS build | Passed/launched; 136,980,022 aggregate file bytes; executable 116,116 bytes |
| Native Movie #2 | Passed fresh construction through exact save/load/stale guidance/release; 119.3772 FPS |
| Full-client reconnect | Passed twice from one stable profile with exact logical authority; final sample 119.1999 FPS |
| Supervised engine restart | Passed one actual replacement: outage observed, actions disabled, projection retained, authority exact, zero torn reads; 119.5948 FPS |
| P0/P1 runtime audit | No open P0/P1 product regression after final test repair and exact-product CI |
| Git recovery | Both product branches and annotated M4 tags pushed; remote tag dereferences match the exact pair |

Accepted native evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

- Movie #2 report/release frame SHA-256:
  `126152d4f91f64800ec6f88f22831cc6c0b297f3d97e9898ed5ef95c7db72f0e` /
  `d6fdf5d26598d968906d19d0bec4d3e7a646415d2e5279b9c4ef6eda2add8a12`.
- Final reconnect report/frame SHA-256:
  `128fa7b1c58db4541b9c87bd9e3bca3bcefed16219edb61362ba1642bd92a050` /
  `b1098fce189ca5f32a072e8c7c464274c329ee4d944ccf561b67c5f3f922fee3`.
- Accepted restart report/ready/frame SHA-256:
  `65e4be5b7f2ef0bf0bc82432dad45b4212cd21ef9bcc555e75cb90fe6ce4087c` /
  `eaeacbcfc155abb977c19c92b21750bbf2bab532acd814e31c4a8c5399952c1c` /
  `171306b2701401a38464353f31a0ccd969caf2858bafdf245421ed89b5a740fe`.
- Final private checkpoint: 1,354,928 bytes, 25 journal entries, SHA-256
  `e6907ff5fe552cdc2c1f138458b93d4c2ec50bea4cc9cb4b173514c4fb8ed48c`.

### KNOWN PROBLEMS / BLOCKERS

- P1 visual acceptance: M4 does not meet ADR 0006's inhabitable, era-readable,
  two-scale studio fantasy. This blocks canonical promotion even though the
  runtime and recovery gates pass.
- P2 packaging/dependency boundary: `npm run studio` still executes the pinned
  `vite-node` development graph. Full `npm audit` reports five dev advisories;
  emitted production packaging and its direct dependency audit remain open.
- Canonical integration risk: TypeScript `main` has a large semantic divergence
  from the campaign line. No canonical merge should occur without a deliberate
  full-diff reconciliation and rerun on the actual merge candidate.
- P2 proof-report quirk: the accepted restart-only report has
  `exactMovie2Released: false` because its unrelated identity fields are not
  populated; its milestone contains exact ordinal-2 released authority and all
  restart invariants pass.
- No known product P0 regression exists. The failed first CI run was a
  superseded test-classifier defect, not a lifecycle failure.

### NEXT EXACT ACTION

Implement schema-backed stable Stage 7/Admin location IDs plus a Cinemachine
management-to-inspection click focus transition, then capture before/after
evidence at both camera scales.

### NEXT 3-5 ACTIONS AFTER THAT

1. Turn Hero Stage 7 into a visibly operating filmmaking environment with
   camera, boom, lights, blocking, crew marks, and TypeScript-projected context.
2. Improve human proportions, role-readable wardrobe, locomotion, waiting, and
   production clustering, with 25/50/100-person performance evidence.
3. Compile/package the local TypeScript runtime, define its emitted dependency
   graph, and clear or explicitly contain the five development advisories.
4. Productionize direct lot construction placement, selection, and focused
   inspection while preserving TypeScript legality.
5. Reconcile the full M4 candidate against current TypeScript `main` only after
   the visible/product packaging gates justify canonical review.

### DO NOT TOUCH

- Do not move or delete M1-M4 tags; M4 is the current immutable recovery pair.
- Do not change TypeScript sole simulation authority, protocol/schema/generated
  DTOs, `GameState`, V14, permanent identities, RNG, gameplay formulas, or
  Three.js as regression oracle without a separately justified product change.
- Do not treat the first failed CI run as a product regression or loosen the
  exact engine-publication/restart cleanup assertions added in `11e2cf88...`.
- Do not promote to canonical while ADR 0006, production packaging/dependency
  audit, and the TypeScript-main semantic reconciliation remain open.
- Do not stage ignored builds, evidence, profiles, logs, locks, caches,
  screenshots, absolute local proof paths, or generated artifacts.
- The visual-fidelity PDF and representative The Movies captures remain
  reference evidence only; never import protected assets or layouts.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Declare Golden M4 and supersede M3 | M4 accumulates authenticated durability, exact in-flight retry, one-command lifecycle, Movie #2, native recovery, clean remote CI, and immutable recovery tags | No tag movement; a later Golden may supersede it | Exact pair, CI `32447981439`, native evidence, remote tag dereferences |
| Preserve the first CI failure as superseded test history | The same PID was counted twice through a broad regex; exact publication parsing and race-correct cleanup pass locally and on Linux CI | Yes if contrary product evidence appears | Runs `32446759604` and `32447981439`; commit `11e2cf88...` |
| Keep promotion status Golden, not canonical | The visual target, emitted packaging/dependency audit, and main-line semantic reconciliation are not complete | Yes after all stronger gates pass on an actual merge candidate | ADR 0006 critique, five dev advisories, main comparison |
| Move next to Stage 7/Admin two-scale focus | Runtime lifecycle is now sealed; visual recognizability is the highest-value product gap | Yes | M4 captures and visual acceptance ruling |

### UNCOMMITTED / UNSAVED MATERIAL

- Product source is clean and pushed at Golden TypeScript `11e2cf88...`; this
  ledger/handoff/promotion seal is the only intended continuity follow-up.
- This handoff's containing docs-only commit will be the sole descendant of the
  TypeScript M4 product SHA. After push, branch HEAD must equal configured
  upstream and `git status --short` must be empty.
- Unity tracked source is clean/pushed at Golden `6b323354...`.
- Ignored B10 evidence, the private stable proof profile, native app, `/tmp`
  results, caches, screenshots, logs, locks, and leases remain local and must
  not enter Git.
- No purchased, generated-image, protected, or newly adopted asset is part of
  M4.

### RECOVERY INSTRUCTIONS

1. Read this section, the promotion register's CURRENT BEST M4 section, ADR
   0006, ADR 0008, and the chronological seal entry in the ledger.
2. For immutable recovery, verify the TypeScript M4 tag remotely dereferences
   to `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` and the Unity M4 tag to
   `6b32335447848ed0680eb8077e78ee36aded5d56`. Never mix either side with a
   different checkpoint.
3. Verify the TypeScript campaign branch contains Golden product `11e2cf88...`;
   after the containing continuity commit is pushed, local HEAD must equal its
   upstream and the tracked tree must be clean.
4. Verify Unity branch/HEAD/upstream `6b323354...` and a clean tracked tree.
5. If the ignored app is absent, run the exact Unity rebuild command under WHAT
   IS WORKING RIGHT NOW. Then run the documented `npm run studio --
   --unity-project ...` command and confirm authenticated readiness.
6. For regression validation, use CI run `32447981439`, the native evidence
   hashes above, and the stable-profile Movie #2/reconnect/restart proof. The
   earlier `32446759604` run is superseded test-only history.
7. Continue from NEXT EXACT ACTION. Do not reopen the Unity-versus-TypeScript
   authority decision or infer CURRENT BEST from moving branch history.

## CHECKPOINT 10 SEAL INTERRUPTION - HISTORICAL TEST-ONLY CI FAILURE

This section was the authoritative interruption record at the timestamp below.
Every M3-current/no-M4 statement in this historical section was superseded by
the sealed Golden M4 section above.
Checkpoint 10 now has an exact pushed product commit, but its first exact-product
Linux CI run failed in a supervisor test classifier. The failure duplicated one
real engine PID by counting its legitimate cleanup line as another spawn; it did
not reproduce a second engine start or a product P0/P1. The test-only repair is
implemented and locally green but not yet committed or pushed. Golden M3 remains
CURRENT BEST and no M4 tag exists.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 06:37 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript product HEAD / upstream | `e6421dcd51c7b64071b8be227f0950129634ff35`; local HEAD, configured upstream, and pushed campaign branch agree |
| TypeScript product parent | `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3` |
| TypeScript pushed state | Yes; exact Checkpoint 10 product commit `e6421dcd51c7b64071b8be227f0950129634ff35` is remotely recoverable |
| TypeScript working tree | Dirty only with the completed test-only correction in `tests/bridge-supervisor.test.ts` and this interruption handoff; product implementation otherwise remains at the pushed commit |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / upstream / pushed | `6b32335447848ed0680eb8077e78ee36aded5d56`; local HEAD, configured upstream, and pushed campaign branch agree |
| Unity working tree | Clean; ignored `Builds/` and `Evidence/` remain local only |
| Current Golden recovery pair | TypeScript `e9c6f06b717a6a106281b189a61072e35770155f` plus Unity `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Golden tags | Immutable and pushed `golden/unity-convergence-m1`, `golden/unity-convergence-m2`, and `golden/unity-convergence-m3` in both repositories; no M4 tag exists |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M3 remains CURRENT BEST; Checkpoint 10 is a pushed but unsealed M4 candidate, not Golden or canonical |

### CAMPAIGN STATUS

- Current phase: Phase B seal interruption after the first exact-product Linux
  CI run for the one-command supervised lifecycle.
- Completed before interruption: the full Checkpoint 10 product implementation,
  local TypeScript/bridge/build/proof gates, Unity EditMode/native validation,
  Movie #2, save/load/reconnect, and actual supervised engine replacement.
- Partially completed: exact-product remote seal. The product commit is pushed,
  but CI run `32446759604` is red and the locally green test-only correction is
  not yet committed or pushed.
- Untouched/later work: the Stage 7/Admin two-scale visual slice remains next
  only after this seal is repaired; production packaging and the broader visual
  acceptance work remain incomplete as recorded below.
- Current acceptance gate: commit/push the exact spawn-line parser repair,
  obtain green exact-product Linux CI, confirm clean trees, then make the Golden
  M4 decision. Do not tag while this gate is red.

### WHAT WAS JUST DONE

- Product commit `e6421dcd51c7b64071b8be227f0950129634ff35`
  (`feat(runtime): supervise the local Unity product lifecycle`) was created
  from parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3` and pushed.
- GitHub Bridge contract run `32446759604` executed against that exact SHA and
  failed in `Test application` at `tests/bridge-supervisor.test.ts:758`.
- The failing assertion expected one engine start but received `[8399, 8399]`.
  Its broad regex matched both the real start and the legitimate Linux cleanup
  message `cleanup engine pid=8399`.
- All earlier CI gates, including the 97/97 bridge aggregate and the Linux
  supervisor path, passed before that classifier failure.
- The repair is constrained to parsing the exact engine-publication log line.
  It ignores cleanup diagnostics, treats any replacement published before the
  Unity-exit boundary as a legitimate shutdown race, proves every unique
  published engine is dead, and still forbids a restart spawn after Unity exit.
  No gameplay, runtime ownership, bridge contract, V14, or Unity change is
  needed.

### WHAT IS WORKING RIGHT NOW

- The exact Checkpoint 10 product commit is pushed and recoverable with the
  compatible clean/pushed Unity client at `6b323354...`.
- The locally validated `npm run studio` lifecycle, persistent private profile,
  per-launch capability, authenticated health, owned restart, bounded logs,
  Movie #2, save/load, reconnect, and restart evidence remain as recorded in
  the immediately following historical pre-commit section.
- TypeScript remains sole simulation authority. Protocol `4`, projection `4`,
  generated DTO identity, `GameState`, V14, gameplay, art, and assets are
  unchanged by the current test repair.
- The exact candidate is not Golden while its exact-product CI run is red.

### VALIDATION STATE

| Gate | Current result |
| --- | --- |
| Product commit and push | Passed: TypeScript `e6421dcd51c7b64071b8be227f0950129634ff35` is the exact remote campaign tip |
| Compatible Unity pair | Passed: clean/pushed `6b32335447848ed0680eb8077e78ee36aded5d56` |
| Local Checkpoint 10 validation | Passed before product commit as recorded in the following historical section: 336 files, 4,523 passed, 5 skipped; bridge 97/97; both typechecks; build; Movie #2/determinism; Unity 62/62; native Movie #2/reconnect/restart |
| Exact-product GitHub CI | **Failed**: Bridge contract run `32446759604`, `Test application`, `tests/bridge-supervisor.test.ts:758` |
| CI failure classification | Test-only false duplicate: cleanup `pid=8399` was counted as another start, yielding `[8399, 8399]`; no second spawn or product P0/P1 reproduced |
| Local repaired supervisor gate | Passed: 10/10, including exact publication parsing and Linux cleanup regression |
| Local repaired bridge aggregate | Passed: 98/98 across 11 files |
| Local repaired full TypeScript suite | Passed: 336 files; 4,524 passed, 5 skipped, 0 failed |
| Local repaired typechecks | Passed: bridge and full application |
| Local repaired diff check | Passed |
| Golden M4 seal | Blocked until corrected tests pass locally and on exact-product Linux CI; no M4 tag exists |

### KNOWN PROBLEMS / BLOCKERS

- Seal blocker: the locally green test repair has no pushed SHA or exact-product
  Linux result yet. Commit/push it and require the replacement workflow to pass.
- No product P0/P1 was reproduced by run `32446759604`. The duplicate values
  are the same PID from two log contexts, not two engine processes.
- The campaign-level P1 visual mismatch, P2 `vite-node` packaging/audit boundary,
  and restart-proof reporting quirk remain unchanged from the detailed section
  below. None explains or should be mixed into this CI repair.
- M3 remains CURRENT BEST. Checkpoint 10 must not receive an M4 tag or canonical
  promotion while exact-product CI is red or either worktree is dirty.

### NEXT EXACT ACTION

Commit/push the locally green exact-publication parser repair, rerun
exact-product Linux CI, and only then make the Golden M4 decision.

### NEXT 3-5 ACTIONS AFTER THAT

1. Commit and push only the reviewed test repair plus continuity update; verify
   the remote candidate SHA.
2. Rerun/wait for the Bridge contract workflow on the repaired exact SHA.
3. If CI is green and both trees are clean, update all three campaign documents,
   decide Golden M4, and create/push immutable M4 tags; otherwise preserve M3
   and record the exact remaining blocker.
4. Reconfirm remote tag dereferences and the one-command launch after the seal.
5. Resume the Stage 7/Admin two-scale visual slice from the sealed pair.

### DO NOT TOUCH

- Do not change the supervisor lifecycle implementation merely to satisfy this
  false-positive parser. Preserve the race-correct invariants: the first
  publication is the initial engine, no restart begins after Unity exit, and
  every uniquely published engine is dead after shutdown.
- Do not change TypeScript simulation authority, protocol/schema/generated DTOs,
  `GameState`, V14, gameplay formulas, RNG, construction/economy rules, or Unity
  source for this repair.
- Do not create or move Golden tags, promote canonical branches, rewrite Git
  history, force push, or discard the dirty test repair.
- Keep ignored builds, evidence, profiles, logs, leases, caches, and local
  absolute proof paths out of Git.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Interrupt the M4 seal and keep M3 CURRENT BEST | Exact-product CI is red, so the Golden remote gate has not passed | Yes after a green repaired exact-product run | GitHub run `32446759604`; no M4 tag |
| Classify the failure as a test parser defect, not a second engine start | The assertion received the same PID twice because it matched the real start and `cleanup engine pid=8399` | Yes if contrary process evidence appears | Failed line 758 and CI log |
| Repair only the exact spawn-line parser | The product invariant remains correct; the classifier is too broad | Yes | Earlier CI gates and local/native evidence remain green |
| Permit only a pre-exit replacement race and prove its cleanup | Unity can exit during the bounded restart backoff; an engine published before that observation is legitimate but must be terminated | Yes with contrary lifecycle evidence | Exact-line helper, no-post-exit-spawn assertion, and unique-PID liveness checks |

### UNCOMMITTED / UNSAVED MATERIAL

- `tests/bridge-supervisor.test.ts` is dirty with the completed test-only exact
  publication parser, focused regression, and race-correct shutdown assertions.
  Its local supervisor, bridge, full-suite, typecheck, and diff gates pass.
- This handoff is dirty to preserve the interruption state. No other tracked
  product implementation change is expected at this checkpoint.
- Ignored B10 native evidence, the private proof profile, native app, `/tmp`
  results, caches, logs, locks, and leases remain local and must not be staged.

### RECOVERY INSTRUCTIONS

1. Read this top interruption section, then the immediately following historical
   Checkpoint 10 pre-commit section for full implementation/evidence context.
2. Verify TypeScript branch `campaign/unity-production-convergence-80h-ts` has
   HEAD/upstream product `e6421dcd51c7b64071b8be227f0950129634ff35`, parent
   `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`, and only the intended test and
   continuity work dirty.
3. Verify Unity is clean/pushed on
   `campaign/unity-production-convergence-80h-client` at
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
4. Inspect GitHub Bridge contract run `32446759604` and confirm the sole failed
   step is `Test application` with `[8399, 8399]` caused by cleanup-line matching.
5. Inspect, commit, and push the exact publication-parser repair plus this
   interruption handoff; its focused/full local gates already pass.
6. Run exact-product Linux CI on the repaired pushed SHA. Do not declare or tag
   Golden M4 until it is green and both worktrees are clean.
7. After the Golden decision is durably recorded in the ledger, handoff, and
   promotion register, resume the Stage 7/Admin camera slice.

## CHECKPOINT 10 PRE-COMMIT - HISTORICAL GOLDEN M4 CANDIDATE

This section was the authoritative pre-commit state at the timestamp below.
Checkpoint 10 is implementation-complete and broadly validated in the dirty
TypeScript worktree, but it has no product commit, remote SHA, or Golden tag
yet. Golden M3 remains CURRENT BEST until the exact candidate is committed,
pushed, revalidated at its product SHA, and tagged in both repositories.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 06:07 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript HEAD / upstream | `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; local HEAD and configured upstream agree |
| TypeScript candidate parent | `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3` |
| TypeScript pushed state | The parent is pushed; the Checkpoint 10 product source and this continuity update are not committed or pushed yet |
| TypeScript working tree | Dirty only with the explicit Checkpoint 10 source, ADR/documentation, and tests listed below; no generated build/evidence is tracked |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / upstream | `6b32335447848ed0680eb8077e78ee36aded5d56`; local HEAD and configured upstream agree |
| Unity pushed state | Yes; exact compatible client commit is pushed |
| Unity working tree | Clean; ignored `Builds/` and `Evidence/` remain local only |
| Current Golden recovery pair | TypeScript `e9c6f06b717a6a106281b189a61072e35770155f` plus Unity `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Golden tags | Immutable and pushed `golden/unity-convergence-m1`, `golden/unity-convergence-m2`, and `golden/unity-convergence-m3` in both repositories |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M3 remains CURRENT BEST; Checkpoint 10 is an unsealed Golden M4 candidate, not a declared Golden or canonical state |

The candidate contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The checked-in TypeScript and Unity generated C# copies remain byte-identical at
SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
There is no schema, generated DTO, projection, `GameState`, V14, gameplay,
economy, construction, identity, RNG, art, or asset change. TypeScript remains
the sole simulation authority.

### CAMPAIGN STATUS

- Current phase: Phase B, durable local game runtime, at the pre-commit seal for
  the one-command supervised lifecycle.
- Completed phases/subphases: setup/baseline; A1 generated contract; A2 named
  atomic projections; A3 queue-law parity; A4 structured rejection guidance;
  donor security/governance reconciliation; Checkpoint 7 commit-before-response
  durability; Checkpoint 8 authenticated idle restart; and Checkpoint 9 exact
  ambiguous command/save/load response recovery.
- Checkpoint 10 candidate: stable private profile, fresh per-launch capability,
  OS-selected first port, pinned restart port, authenticated health, direct
  engine/Unity ownership, incarnation-bound leases, bounded redacted logs,
  automatic engine restart, signal shutdown, stale-child cleanup, and retained
  V14 authority across full launches are implemented and locally proven.
- Partially completed Phase B: development lifecycle is candidate-complete.
  Production packaging, emitted runtime dependency definition/audit,
  install/update behavior, and profile backup/recovery UX remain incomplete.
- Untouched/later phases: Phase C/D/E functionality is inherited and playable;
  the high-value visible work in F through K remains mostly untouched or
  inherited partial work; L through N retain baseline/partial evidence.
- Current acceptance gate: seal the exact product source, verify the pushed
  product SHA and clean worktrees, then decide and create immutable M4 tags only
  if the final Golden gate still passes.

### WHAT WAS JUST DONE

The TypeScript campaign worktree now provides `npm run studio` as the preferred
one-command native development entry point. The supervisor owns a stable
current-user-private profile so current and explicitly saved V14 authority
survive full product exits. It creates a separate private launch directory and
a fresh random 32-byte base64url capability for every full launch; the
capability exists only in supervisor memory and the two direct child
environments, never argv, checkpoint, lease, report, or log.

The first engine binds exact IPv4 loopback on port `0`; the supervisor parses a
strict complete live line and requires an authenticated, schema-valid `/health`
response before starting Unity. Engine replacements reuse the same stable
profile, launch capability, and pinned port while the one Unity process retains
its exact projection and reconnects. Engine and Unity are direct `shell:false`
children with allowlisted environments. Their PID, process incarnation, and
process group are held in strict private leases. Shutdown handles
`SIGINT`/`SIGTERM`/`SIGHUP`, terminates owned groups, fails closed when ownership
cannot be proved, and leaves a recoverable stale lease instead of forgetting a
surviving child.

Per-launch supervisor/engine/Unity logs are `0600`, line-aware, exact-capability
redacted across split chunks, bounded to 2 MiB each, and retained under a
five-launch/32 MiB profile ceiling. Stale profiles are reclaimed only after
PID-incarnation/process-group verification. A shared process-incarnation helper
now serves both the existing bridge checkpoint lock and supervisor leases.
ADR 0008 records the stable-profile/per-launch-capability boundary and the
development `vite-node` packaging boundary; the bridge README, security policy,
and ADR index now describe the operational contract.

Candidate source and documentation paths, all currently uncommitted:

- `BRIDGE-README.md`
- `SECURITY.md`
- `bridge/runtime/checkpoint-store.ts`
- `bridge/runtime/process-incarnation.ts` (new)
- `bridge/supervisor/bounded-log.ts` (new)
- `bridge/supervisor/cli.ts` (new)
- `bridge/supervisor/config.ts` (new)
- `bridge/supervisor/lease.ts` (new)
- `bridge/supervisor/supervisor.ts` (new)
- `docs/adr/0008-supervise-the-local-product-lifecycle.md` (new)
- `docs/adr/README.md`
- `package.json`
- `tests/bridge-checkpoint-store.test.ts`
- `tests/bridge-process-incarnation.test.ts` (new)
- `tests/bridge-supervisor.test.ts` (new)
- `tests/fixtures/fake-unity-supervisor.mjs` (new)
- the three campaign continuity documents in this update

Why: Checkpoint 9 made process replacement safe but still required an operator
to create and protect the capability/runtime directory, choose and pin a port,
coordinate two processes, restart the engine, and clean logs/children. This
candidate closes that remaining Phase B developer-lifecycle gap without moving
gameplay truth into C# or making the launch secret persistent.

Relevant SHAs: candidate parent/pushed TypeScript tip
`808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; compatible pushed Unity client
`6b32335447848ed0680eb8077e78ee36aded5d56`. No Checkpoint 10 product SHA or M4
tag exists yet.

### WHAT IS WORKING RIGHT NOW

If the ignored native app is absent, rebuild the exact compatible Unity client:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-b10-m4-native-build.log \
  -quit
```

Preferred candidate launch from the TypeScript worktree:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Use an explicit stable profile when isolating a proof or alternate studio:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --profile-root '/absolute/private/profile/path' \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

The Unity project must contain
`Builds/macOS/Project Studio Visual Spike.app`. Run
`npm run studio -- --help` for direct executable/app selection, restart budget,
and proof-argument forwarding. Do not put a capability, bridge URL, bridge port,
or `-logFile` in forwarded Unity arguments; the supervisor owns them.

- Bridge/runtime status: authenticated protocol 4, durable atomic checkpoint,
  exact replay, pending-POST recovery, stable logical session across engine and
  full-client relaunch, random initial loopback port, fixed-port restart, and
  bounded owned lifecycle are working.
- Current playable flow: construction and Movie #2 remain playable from fresh
  authority through screenplay, auditions/evidence, casting/package,
  greenlight, pre-production, director/scenery blockers, load-in, shooting,
  save/load, post-production, release, stale guidance, full-client reconnect,
  and supervised engine restart.
- Current Movie #2 status: `The Reluctant Cornerstone`, `script-0001`,
  `prod-0013` released at Week 22/revision 23. Final digest is
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  saved/restored digest is
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Current visual state: unchanged from M3 and below ADR 0006. The actual B10
  captures still read as a sparse, elevated diorama with an oversized generic
  HUD, small role-unreadable people, flat materials, little visible filmmaking,
  and no convincing human-scale inhabitable inspection view.

### VALIDATION STATE

| Gate | Latest Checkpoint 10 candidate result |
| --- | --- |
| Full TypeScript tests | Passed: 336 files; 4,523 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk-size warnings only |
| TypeScript Movie #2/determinism proof | Passed fresh release, exact V14 export/import/headless parity, stale/duplicate protection, and polling neutrality |
| Bridge aggregate | Passed: 97/97 across 11 files |
| Supervisor/process tests | Passed configuration fail-closed cases, capability rotation/redaction, profile persistence, fixed-port restart, signal cleanup, stale-incarnation reclaim, restart budget, unrelated-process isolation, bounded logs, and retention |
| Generated contract | Passed; protocol 4/projection 4/schema and generated C# identities unchanged |
| Browser dependency audit | Passed: 0 browser-runtime vulnerabilities |
| Full `npm audit` | Reports 5 development-graph advisories: 3 moderate, 1 high, 1 critical; this is the documented `vite-node` development-runtime boundary, not a browser-runtime pass |
| Repository hygiene | Passed: 1,032 repository files checked |
| Adopted 3D asset audit | Passed: 26 assets, 0 hard violations |
| Unity EditMode | Passed: 62/62; `/tmp/studio-b10-golden-editmode.xml` |
| Native macOS build | Existing compatible build passed and launched; 136,980,022 aggregate file bytes |
| Native supervised Movie #2 | Passed fresh end to end through construction, exact save/load, stale retention, and release at Week 22/revision 23 |
| Full-client reconnect | Passed twice from the same stable profile with exact session/revision/week/final digest and rotated engine runtime identity |
| Supervised engine restart | Passed one actual engine kill/replacement on the pinned port: outage observed, actions disabled, projection retained, authority exact, zero torn reads |
| Performance | Movie #2 119.3772 FPS; accepted reconnect 119.1999 FPS; accepted restart 119.5948 FPS on Apple M3 Max |
| Independent audit | No open P0/P1 finding in the bounded supervisor/runtime implementation after ownership, startup rollback, group cleanup, health parsing, restart-budget, and logging fixes |

Accepted native evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

- Movie #2 report: `Movie2/bridge-client-proof.json`, SHA-256
  `126152d4f91f64800ec6f88f22831cc6c0b297f3d97e9898ed5ef95c7db72f0e`.
- Whole-lot, construction, and release frames: SHA-256
  `7a2c79e7355b411890241511e611f4049f6ce1dde9f856c9a62fc6ef534efef2`,
  `405afbef4c5308235c0add108d7883aa912212cd36ca77ecfb0c5e6eb373e6b1`,
  and
  `d6fdf5d26598d968906d19d0bec4d3e7a646415d2e5279b9c4ef6eda2add8a12`.
- First accepted reconnect report/frame: SHA-256
  `0e5040e3d8eb3a90f3292d1c681a4e533bb0384a357b2e1f324f44a71c9d5f65` /
  `4698b5d657c9376a510d67fbddec8db582ee1c0dcd75bf0c54c0ee079f56625c`.
- Final accepted reconnect report/frame: SHA-256
  `128fa7b1c58db4541b9c87bd9e3bca3bcefed16219edb61362ba1642bd92a050` /
  `b1098fce189ca5f32a072e8c7c464274c329ee4d944ccf561b67c5f3f922fee3`.
- Accepted restart report/ready/frame in `RuntimeRestart2/`: SHA-256
  `65e4be5b7f2ef0bf0bc82432dad45b4212cd21ef9bcc555e75cb90fe6ce4087c` /
  `eaeacbcfc155abb977c19c92b21750bbf2bab532acd814e31c4a8c5399952c1c` /
  `171306b2701401a38464353f31a0ccd969caf2858bafdf245421ed89b5a740fe`.
- Stable local proof profile:
  `/private/tmp/project-studio-b10-supervisor-native-20260821T035727Z/`.
  Its final 1,354,928-byte checkpoint has SHA-256
  `e6907ff5fe552cdc2c1f138458b93d4c2ec50bea4cc9cb4b173514c4fb8ed48c`,
  session `864b0fee-00a3-49bb-9442-72b565410c73`, revision 23, exactly 25 journal
  entries, current/saved digests matching the Movie #2 proof, and journal digest
  `e926f7e4a75b971303c9324fbbfc30d588bfca0af8a5cf7249b3b1aaeb3b5407`.
- Five private launch directories remain as intended by retention. All product
  logs and lease files are `0600`, all profile/launch/runtime directories are
  `0700`, the active lease is absent after shutdown, and every recorded launch
  ends with `cleanup complete`.

### KNOWN PROBLEMS / BLOCKERS

- No open P0/P1 regression is known in the Checkpoint 10 lifecycle candidate.
  The pre-existing visual acceptance gap remains a campaign-level P1: launch
  the accepted proof and inspect the overview/construction/release frames; the
  world is still a sparse, distant diorama dominated by a generic HUD. This is
  unchanged from M3, not introduced by the supervisor. Do not treat FPS,
  runtime resilience, or test counts as passing ADR 0006.
- P2, restart-proof reporting quirk. Exact defect: accepted
  `RuntimeRestart2/bridge-runtime-restart-proof.json` has status `complete` and
  proves the exact released projection, but its unrelated top-level
  `exactMovie2Released` field is `false` because the restart-only harness does
  not populate the Movie #2 title/project/production fields. Reproduction: run
  the restart-only proof after released Movie #2 and inspect that field beside
  the milestone's exact `script-0001`/`prod-0013` projection. This is a proof
  reporting quirk, not a simulation/client regression. Do not weaken the
  restart invariants or change gameplay state merely to make this unrelated
  convenience field true.
- P2, Linux portability confirmation. Exact defect: macOS process ownership and
  native lifecycle are proven, while the Linux `flock` owner-lock path awaits
  exact-product CI. This is a validation gap, not a reproduced defect. Do not
  replace file locking with a name-only, port-only, or PID-only ownership guess.
- P2, packaged runtime audit boundary. Exact defect: `npm run studio` directly
  invokes the checked-in bridge through the pinned `vite-node` development
  graph. Full `npm audit` reports 5 dev-graph advisories (3 moderate, 1 high,
  1 critical), although the browser production dependency audit is clean.
  Reproduction: inspect `package.json` and run full `npm audit`. This is
  inherited/incomplete packaging work, not a new gameplay regression. Do not
  run `npm audit fix --force`, suppress findings, or claim the browser-only
  audit covers the local engine runtime.
- Superseded invalid evidence: `RuntimeRestart/` ended with
  `Unity did not observe the TypeScript engine outage.` Its report/ready hashes
  are
  `37a7dc93035a910c625a774a418525ab443ac8fe0e084985e45b06426a8a1b99` /
  `6de34f15b9f12da345cbaa9441fef658b8e30c68a967fd2e870aa5c8b748b63f`.
  The operator timed the kill before the proof was actually waiting for it;
  authority remained exact and the product did not fail. `RuntimeRestart2/`
  supersedes it. Do not cite `RuntimeRestart/` as accepted evidence or repeat
  the operator-timeout sequence.

### NEXT EXACT ACTION

Implement a visible vertical slice combining schema-backed stable Stage 7/Admin
location IDs with a Cinemachine management-to-inspection click focus
transition, then capture before/after evidence at both camera scales.

### NEXT 3-5 ACTIONS AFTER THAT

1. Turn Hero Stage 7 into a visibly operating filmmaking environment with
   camera, boom, lights, blocking, crew marks, and TypeScript-projected
   production context rather than presentation-side rules.
2. Improve human proportions, role-readable wardrobe, locomotion, waiting, and
   production clustering with a 25/50/100 visible-person performance pass.
3. Compile/package the local TypeScript runtime, define its emitted dependency
   graph, and clear or explicitly contain the current development advisories.
4. Add real lot construction placement/selection feedback and focused
   construction inspection while preserving TypeScript legality.

### DO NOT TOUCH

- Frozen authorities, immutable M1/M2/M3 tags, V14 save/game truth, permanent
  IDs, RNG streams, economy/production/construction formulas, or Three.js as
  regression oracle.
- Generated DTO/schema/projection files: Checkpoint 10 has no protocol change.
- The stable-profile/per-launch-capability boundary accepted in ADR 0008. Never
  persist a capability or place it in argv, logs, leases, saves, checkpoints,
  reports, screenshots, or Git.
- The accepted Checkpoint 9 exact pending-POST state machine and durable journal
  unless a reproduced regression contradicts its evidence.
- Canonical `main`/C2, historical branches, prior Golden tags, or Git history.
- The visual-fidelity PDF and representative The Movies captures are reference
  evidence only; do not import protected assets, layouts, textures, or UI art.
- Current evidence/profile/build/log material is local and ignored. Keep it out
  of the product commit.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| One TypeScript supervisor owns the local product lifecycle | Unity and the authoritative engine are one product, while ownership of transport/process lifecycle does not belong in gameplay or C# | Yes at a later packaged-launcher boundary | ADR 0008 and passing supervisor/native proofs |
| Persist the private profile, rotate the capability per full launch | Disposable runtime roots strand saves; persistent secrets unnecessarily expand risk | Yes only through a reviewed profile/security migration | Same session/revision/digests across five launches with no capability in checkpoint/logs |
| Select port 0 once, then pin the replacement port | Avoid fixed-port collisions while preserving Unity's exact endpoint across an engine restart | Yes with a reviewed reconnect protocol change | RuntimeRestart2 uses one replacement and retains exact authority |
| Spawn engine and Unity directly with minimal environments | Gives the supervisor exact child/process-group ownership and keeps the capability out of argv/shell history | Yes at packaged-launcher replacement | Unit tests, private leases/logs, and five clean native shutdowns |
| Treat Checkpoint 10 as an M4 candidate, not Golden yet | The source is uncommitted/unpushed and Linux CI/tag evidence does not exist yet | Yes after the seal gate | Current Git state and promotion law |
| Move next to the Stage 7/Admin two-scale visual slice after seal | Phase B is now candidate-complete; the highest-value gap is the binding visual/camera recognizability gate | Yes | B10 captures and ADR 0006 critique |

### UNCOMMITTED / UNSAVED MATERIAL

- Uncommitted tracked modifications: `BRIDGE-README.md`, `SECURITY.md`,
  `bridge/runtime/checkpoint-store.ts`, `docs/adr/README.md`, `package.json`,
  `tests/bridge-checkpoint-store.test.ts`, plus these three continuity files.
- Untracked candidate source/tests/docs:
  `bridge/runtime/process-incarnation.ts`, all five files under
  `bridge/supervisor/`,
  `docs/adr/0008-supervise-the-local-product-lifecycle.md`,
  `tests/bridge-process-incarnation.test.ts`,
  `tests/bridge-supervisor.test.ts`, and
  `tests/fixtures/fake-unity-supervisor.mjs`.
- Ignored native evidence: the complete B10 evidence root named above,
  including 15 PNG captures and seven JSON proof/readiness files. JSON contains
  local absolute screenshot paths and must remain ignored.
- Ignored stable proof profile: the `/private/tmp/project-studio-b10-...`
  directory named above, including the checkpoint, five launch directories,
  leases, owner lock, and bounded logs. It is local validation material, not a
  user save distribution format.
- Ignored existing native build:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Builds/macOS/Project Studio Visual Spike.app`.
- Local validation outputs include `/tmp/studio-b10-golden-editmode.xml` and
  ordinary terminal/test/build logs. None belongs in Git.
- Invalid `RuntimeRestart/` evidence remains isolated solely to document the
  superseded operator-timeout attempt; it is not accepted evidence.

### RECOVERY INSTRUCTIONS

1. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, the chronological ledger,
   this top handoff section, the promotion register, ADR 0006, and ADR 0008.
2. Verify TypeScript is on
   `campaign/unity-production-convergence-80h-ts` at parent
   `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`, with exactly the candidate
   source/docs/tests above dirty, and upstream still at that parent. Do not
   discard or regenerate this work.
3. Verify Unity is clean on
   `campaign/unity-production-convergence-80h-client` at pushed
   `6b32335447848ed0680eb8077e78ee36aded5d56`.
4. Run the minimum smoke validation: `npm run typecheck:bridge`, the focused
   process-incarnation/supervisor tests, and `git diff --check`. If the product
   source changed after this record, rerun the proportionate affected gates.
5. Inspect, stage, and commit only the explicit Checkpoint 10 product files and
   the three continuity documents. Do not stage `Builds/`, `Evidence/`, `/tmp`,
   the private profile, logs, or absolute-path proof JSON.
6. Push the TypeScript product commit, verify the remote SHA, run exact-product
   Linux CI, and confirm both worktrees clean. If all Golden requirements still
   pass, update all three continuity documents to the sealed product SHA,
   declare Golden M4, create immutable annotated
   `golden/unity-convergence-m4` tags at the exact compatible TypeScript/Unity
   pair, push both tags, and verify their remote dereferences.
7. Rebuild the ignored native app with the exact Unity command under WHAT IS
   WORKING RIGHT NOW when it is absent, then launch the candidate with
   `npm run studio -- --unity-project ...`. Verify Movie #2/reconnect from the
   stable profile if any seal-time source changed.
8. Continue from NEXT EXACT ACTION. Do not ask the Owner to reconstruct Phase B
   or reopen Unity-versus-TypeScript authority.

## CHECKPOINT 9 SEALED - HISTORICAL

This section was the authoritative current-state record at the timestamp below.
Checkpoint 9 is validated, committed, pushed, and remotely recoverable as one
exact compatible product pair. It is deliberately non-Golden.

### CURRENT EXACT STATE

Timestamp: 2026-08-21 05:03 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript product HEAD / pushed | `114c99c1c4e5623c5ea3e0c60864faed925fb33e`; pushed to the recorded campaign branch |
| TypeScript product parent | `b1738b92bd988bf5535629babb1223903ffad802` |
| TypeScript branch tip / working tree | This handoff's containing commit is the sole continuity-only descendant of product `114c99c1c4e5623c5ea3e0c60864faed925fb33e`; after push, `git rev-parse HEAD` must equal the configured upstream and the tree must be clean |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / upstream / pushed | `6b32335447848ed0680eb8077e78ee36aded5d56`; local HEAD, configured upstream, and remote campaign branch agree |
| Unity product parent | `94e8bcac6a5bf94fd70f3f8a61992511230688a2` |
| Unity working tree | Clean |
| Branches pushed | Yes; TypeScript product `114c99c1...` and Unity product `6b323354...` are remotely recoverable as the exact Checkpoint 9 compatible pair |
| Current Golden recovery pair | TypeScript `e9c6f06b717a6a106281b189a61072e35770155f` plus Unity `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Golden tags | Immutable and pushed `golden/unity-convergence-m1`, `golden/unity-convergence-m2`, and `golden/unity-convergence-m3` in both repositories |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; Golden M3 remains the sole CURRENT BEST; sealed Checkpoint 9 is non-Golden and not canonical |

The candidate contract is unchanged at protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The checked-in TypeScript and Unity generated C# copies remain byte-identical at
SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`;
the canonical schema JSON remains SHA-256
`a2b27d4ed12ca432444914d21743c66d7ca2cacb14ed440e29a58c7738849a75`.
No schema, generated DTO, projection fact, gameplay formula, `GameState` member,
V14 save field, permanent identity, RNG stream, art, or asset changed. TypeScript
remains the sole simulation authority.

### CAMPAIGN STATUS

- Current phase: Phase B, durable local game runtime.
- Completed phases/subphases: setup/baseline; A1 generated contract; A2 named
  atomic projections; A3 queue-law parity; A4 structured rejection guidance;
  donor security/governance reconciliation; Checkpoint 7 durable commit-before-
  response state; and sealed Checkpoint 8 authenticated session-first idle
  restart continuity.
- Checkpoint 9 sealed status: exact ambiguous response-loss recovery for
  `/command`, `/save`, and `/load` is implementation-complete, independently
  audited, broadly validated, committed/pushed, and proven against three actual
  engine `SIGKILL` replacements.
- Partially completed Phase B: a secure manual same-shell launch, durable runtime
  primitives, process replacement, exact journal replay, and exact pending-POST
  recovery now work. Default product startup and lifecycle ownership do not.
- Untouched/incomplete Phase B: one-command supervisor, private per-launch
  runtime root ownership, random-port discovery, capability environment handoff,
  health readiness, automatic engine restart, stale-child cleanup, graceful
  shutdown, bounded product logs, and emitted/pinned runtime packaging audit.
- Later phases: inherited Phase C/D/E functionality remains playable; F through
  N remain mostly untouched or inherited partial work. Visual output is
  unchanged and below ADR 0006.
- Current acceptance gate: implement the one-command developer supervisor
  without weakening the authenticated, durable, and exact-retry invariants.

### WHAT WAS JUST DONE

TypeScript adds a test-only deterministic failure seam after the runtime
coordinator has atomically committed the first-seen response and before HTTP
headers are sent. It accepts one canonical closed environment plan only when
`NODE_ENV=test` and a durable runtime directory are both present, deletes the
plan from the environment before opening the runtime, hashes the exact received
UTF-8 request bytes, flushes one bounded canonical commit marker, and either
holds for external `SIGKILL` or drops the socket. A replayed response emits a
separate exact-byte marker but never rearms the one-shot failure. Normal product
launches have a disabled no-op gate.

A new fail-closed evidence verifier binds the Unity proof report, exactly three
post-commit markers, exactly three replay markers, the expected four-process
restart topology, and exactly three ordered durable journal entries. It hashes
the journal's exact request/response JSON and rejects semantic-but-byte-different
retries, forged hashes, duplicate/missing/extra markers, noncanonical partial
lines, duplicate report routes, extra journal authority, state-chain mismatch,
and unexpected evidence schema. The CLI writes a canonical validation receipt.

Unity now creates one immutable pending POST before its first send. It retains
the exact route, cloned raw UTF-8 body, command ID, originating logical session,
expected revision, originating revision/week/digest, and request hash. Transport
loss and server `5xx` keep the envelope ambiguous and actions disabled. The
client obtains `/session` first, retries the exact bytes only for the same
logical session, abandons without retry on session replacement or terminal
authorization/media failures, reconciles cached/current, first-execution,
historical-completion, and stale-rejection receipts, and requires a fresh joined
snapshot before publishing completion. Authority regression, same-revision
digest/week contradiction, command mismatch, more than one fresh transition,
non-stale rejection after authority advanced, or a second session change fails
loudly. No intent is re-created from presentation state and no gameplay rule was
added to C#.

The native proof harness now accepts three explicit command IDs, uses the first
current TypeScript-authorized intent rather than hardcoding an intent kind,
proves command/save/load response loss across three successive engine kills,
records only SHA-256 wire identities, and asserts one command revision, no save
mutation, one load revision, stable logical session, exact saved/restored digest,
retained paused presentation, three exact retries, and three recovered receipts.

Sealed TypeScript product paths:

- `bridge/server.ts`
- `bridge/testing/in-flight-evidence-verifier.ts` (new)
- `bridge/testing/post-commit-response-gate.ts` (new)
- `package.json`
- `scripts/verify-bridge-inflight-evidence.ts` (new)
- `tests/bridge-inflight-evidence-verifier.test.ts` (new)
- `tests/bridge-process-restart.test.ts`

The product commit is `114c99c1c4e5623c5ea3e0c60864faed925fb33e`,
`test(bridge): seal exact in-flight response recovery`.

Sealed Unity product files:

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs` (new)
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs.meta` (new)
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeTransport.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeProofRunner.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs` (new)
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs.meta` (new)

Why: commit-before-response and durable deduplication made an exact retry safe,
but the native client still lost the outcome whenever the engine died in that
last response window. This bounded unit closes that P1 without retrying across
logical sessions, generating a new envelope, or contaminating V14/game truth.

The Unity product commit is `6b32335447848ed0680eb8077e78ee36aded5d56`,
`feat(bridge): recover in-flight actions after engine loss`.

Relevant sealed pair: TypeScript
`114c99c1c4e5623c5ea3e0c60864faed925fb33e` (parent
`b1738b92bd988bf5535629babb1223903ffad802`) plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56` (parent
`94e8bcac6a5bf94fd70f3f8a61992511230688a2`). Both commits and branch tips are
pushed and remotely verified.

### WHAT IS WORKING RIGHT NOW

Launch the sealed Checkpoint 9 native build from one shell so both
processes inherit the same capability without putting it in argv or a file:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
launch_capability="$(node -e \
  "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))")"
runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/project-studio-runtime.XXXXXX")"
chmod 700 "$runtime_dir"
bridge_log="${TMPDIR:-/tmp}/project-studio-bridge.$$.log"
PROJECT_STUDIO_BRIDGE_CAPABILITY="$launch_capability" \
  PROJECT_STUDIO_BRIDGE_RUNTIME_DIR="$runtime_dir" \
  PROJECT_STUDIO_BRIDGE_PORT=4317 \
  npm run bridge >"$bridge_log" 2>&1 &
bridge_pid=$!
while ! rg -q '\[bridge\] live http://127\.0\.0\.1:4317' "$bridge_log"; do sleep 0.1; done
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
PROJECT_STUDIO_BRIDGE_CAPABILITY="$launch_capability" \
  'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
kill -TERM "$bridge_pid"
wait "$bridge_pid"
```

The current manual launch still requires the caller to choose/own the runtime
directory, port, secret lifetime, engine process, and logs. Reuse the capability
and runtime directory only for an engine restart inside that one product launch;
rotate them for the next launch.

- Bridge/runtime status: authenticated protocol 4, opt-in durable state,
  commit-before-response, exact replay, protocol-3 migration, runtime identity,
  and test-gated post-commit response interruption all work. The response seam
  is inaccessible unless both test mode and durable state are explicit.
- Unity runtime status: session-first polling, outage retention, action pause,
  process-replacement detection, byte-identical same-session retry, response
  reconciliation, and fresh-projection completion are working in 62 EditMode
  tests and native command/save/load proof.
- Current playable flow: construction and exact Movie #2 remain playable from
  screenplay through auditions, editable casting/package, greenlight,
  pre-production, director/scenery blockers, load-in, shooting, save/load, post,
  release, stale guidance, reconnect, and response-loss recovery.
- Current Movie #2 status: `The Reluctant Cornerstone`, `script-0001`,
  `prod-0013` released at Week 22/revision 23; final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Current visual state: unchanged from M3. Actual inspection of the new recovery
  frame still shows an elevated sparse campus, small unreadable people, flat
  materials, and a large proof HUD rather than an inhabitable period film studio.
  The candidate remains below ADR 0006 and is not a visual Golden.

### VALIDATION STATE

| Gate | Latest sealed Checkpoint 9 result |
| --- | --- |
| Full TypeScript tests | Passed: 334 files; 4,510 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Full application typecheck passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk-size warnings only |
| Generated contract | Passed; unchanged protocol 4/projection 4/schema `ba9cd199...`; generated C# copies byte-identical at `1192d58a...` |
| Bridge aggregate | Passed: 84/84 across 9 files |
| Focused process recovery | Passed after the marker parser fix; split stdout writes are ignored until newline termination, and command/save/load commit/replay paths pass |
| Evidence verifier unit suite | Passed: 8/8 fail-closed verifier cases |
| Exact native evidence verifier | Passed; canonical receipt `bridge-inflight-evidence-validation.json` proves 3 commit markers, 3 replay markers, and 3 journal entries |
| TypeScript Movie #2/determinism proof | Passed through release, exact V14 export/import/headless parity, stale/duplicate protection, and polling independence |
| Browser dependency audit | Passed: 0 browser-runtime vulnerabilities |
| Repository hygiene | Passed: 1,022 repository files checked |
| Adopted 3D asset audit | Passed: 26 assets, 0 hard violations |
| Unity EditMode | Passed: 62/62 in `/tmp/studio-b9-editmode-proof-fix.xml` |
| Native macOS build | Passed; `Builds/macOS/Project Studio Visual Spike.app`; 136,980,022 aggregate file bytes; log `/tmp/studio-b9-native-build-proof-fix.log` |
| Native in-flight recovery | Passed actual `SIGKILL` after command/save/load commit: same session, 3 runtime replacements, 10 outage polls, 3 exact retries/recoveries, final revision 2, exact save/load digest, no torn reads |
| Native Movie #2 regression | Passed fresh end to end at Week 22/revision 23 with exact save/load and retained `STALE_REVISION` guidance from poll 11 to 12 |
| Native idle restart regression | Passed one actual engine replacement: stable session/revision 0/Week 11/digest, 3 outage polls, retained projection, actions disabled/restored, zero torn reads |
| Performance samples | In-flight proof 119.1992 FPS; Movie #2 119.9976 FPS; idle restart 118.9989 FPS on Apple M3 Max |
| Source hygiene | TypeScript and Unity `git diff --check` passed before this docs update; generated/schema paths are untouched |
| Exact-product CI | Passed on TypeScript product `114c99c1c4e5623c5ea3e0c60864faed925fb33e`: Bridge contract run `32441324305`, all steps green in 11m17s |
| Independent audit | No remaining P0/P1 in the bounded pending-POST lifecycle, deterministic seam, evidence verifier, or native proof after fixes |

Final exact in-flight evidence:

- Root:
  `Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021520Z/`.
- Unity report SHA-256:
  `b6d9dcb95686d32c24690d1136899b8b195204b57350267263ce5141fea2ff77`.
- Verifier receipt SHA-256:
  `20f3ec25f3fe3724c5b35c39c4f4f79a199a2aa309da2a3816654071f7235403`.
- Recovery frame SHA-256:
  `9621d7ab21196465cb684b5e3879419af0da1d15c02a0cb82fe8c05edd17cc9a`.
- Runtime checkpoint: 897,790 bytes, SHA-256
  `3bcbc4009efe5a5f1de972862a233118dd7b93aacc3b2f97f3df0cc23cebe1ff`,
  session `efcd5d93-7a62-48dc-bb70-1969d48fa617`, revision 2, exactly ordered
  `command/save/load` journal length 3, current and saved digest
  `141f95a8222cee274d913eb0d68ad6f461f4e2f35f6f49c4fc71c08cfb4992b5`.
- Request/response hashes: command
  `a302afc7bd8db68900efe59a3d009ec47d6d5dee591926d427eca263adedc71e` /
  `8bbb6fe08b737d376237f51ee885ac5a13b66a86c80f728d61ed94486e3cbc04`;
  save
  `529c126786ef68600a144baf6d376f00ca9872e5b7659b56d78cc97571a7b912` /
  `0575b464007fe0220c5eab77fb9de0483166ef7e4295228a2086190895d22199`;
  load
  `03b3088424a495765c419f6fa5c6c50a89d763004e9dda21098d8e50c3b9b433` /
  `88a2e7867ad266a23ac617c55a3251fe8cca9188c9388c13e33f7f8b7dda8c7b`.

Regression evidence:

- Movie #2 root:
  `Evidence/B/Checkpoint9-Movie2-Regression-Protocol4-20260821T022838Z/`;
  report SHA-256
  `b25f679d2470c8e4ee642770b36738e38f247ee438008c780c16835257a186b9`;
  released frame SHA-256
  `e971426cd59aaa3cb2dca144e3bb9726291aa0c434d2276c37c16891861d93ef`;
  checkpoint 1,354,916 bytes, 25 journal entries, SHA-256
  `724f824b5399c2f91008fd9cb8dec6840dbb55d70304615977ad7d7242892dda`.
- Idle restart root:
  `Evidence/B/Checkpoint9-Runtime-Restart-Regression-Protocol4-20260821T022933Z/`;
  report SHA-256
  `cebc3c4d7599101c10ee7748205b2629b73cb36621f7b23a4fe969e4e5d7afeb`;
  ready record SHA-256
  `6f26768239e8dbf965601377cbbbdfd1036b4d3993874aabc66d55de527e3f5f`;
  frame SHA-256
  `8ea7fb50a531bce9e21a5ebad132f8953caae2c009a26665faef88ee55f68344`;
  checkpoint 266,526 bytes with an empty journal, SHA-256
  `19cef726bf977c538904fa8ddc6f48f0fdc61f5a17e9122eee76454463dc05fc`.

### KNOWN PROBLEMS / BLOCKERS

- P1, default runtime lifecycle. Exact defect: normal product startup still
  requires manual capability generation, private directory/port selection, two
  process launches, engine restart, shutdown, and log cleanup. Reproduction:
  run only the current native app or ordinary `npm run bridge`; no supervisor
  discovers/owns the full product lifecycle, and the bridge is memory-only
  unless the caller explicitly supplies a runtime directory. This is pre-
  existing incomplete Phase B work, not a Checkpoint 9 regression. Attempted
  fixes: secure/durable primitives and a documented manual launch work. Must not
  put the capability in argv, disk, logs, checkpoints, saves, reports, or
  `GameState`; do not use a fixed shared runtime root or public bind.
- P2, packaged runtime audit boundary. Exact defect: development still executes
  through `vite-node`; the zero-vulnerability browser audit is not an audit of a
  pinned emitted Node runtime. Reproduction: inspect `npm run bridge` and the
  dependency audit scope. This is pre-existing. Must not claim a production
  dependency audit until the emitted runtime graph itself is pinned and audited.
- P1, visual product mismatch. Exact defect: current evidence remains a high,
  sparse, flat diorama dominated by a generic proof HUD; human-scale role
  readability, period materials, visible filmmaking, Hero Stage 7, and the
  two-scale camera remain absent. Reproduction: inspect
  `14-in-flight-post-recovered.png` and the Movie #2 sequence against ADR 0006
  and the fidelity reference. This is pre-existing and unchanged. Must not call
  Checkpoint 9 a visual improvement or Golden based on runtime tests/FPS.
- P0/P1 retry defect status: closed and durably checkpointed in the exact pushed
  product pair. The accepted evidence and committed source agree. Do not reopen
  this design while implementing the launcher unless a reproduced regression
  contradicts the recorded proof.
- Superseded failed proof: `Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021103Z/`
  failed before any POST because the proof harness hardcoded a nonexistent
  `advance-week` intent. Report SHA-256 is
  `a2bc3ae4e3d41416d1bdb943d0d793e90f2de4ec9ceba167368747c854511e50`;
  revision stayed 0, journal length stayed 0, and its 266,526-byte checkpoint
  SHA-256 is
  `e545a32350ec3875906c8a3fab803d10bbc6525a4dbffd6a1225066170fa0185`.
  It also retains a stale local lock from the aborted orchestration. This was a
  proof-harness assumption, not a product regression. Do not retry a hardcoded
  intent kind or reuse that evidence/runtime root; select an actual
  authoritative `availableIntents` entry as the final proof does.
- Earlier attempted fixes that must not be repeated: parsing an unterminated
  stdout fragment as a complete marker; accepting a non-stale rejection after
  authority advanced; completing recovery before a fresh snapshot join;
  retrying after logical-session replacement; reconstructing a request body;
  counting ordinary polls as outages; allowing redirects with the capability;
  or using Node's positive `maxHeadersCount` truncation. All were replaced with
  fail-closed tested behavior.

### NEXT EXACT ACTION

Implement the one-command developer launcher/supervisor that owns a private
per-launch durable runtime root, selects a random loopback port, generates and
hands the capability to both children only through their environments, waits
for authenticated health readiness, launches Unity, restarts the engine while
preserving the same logical launch, removes stale owned processes/locks, shuts
both children down gracefully, and writes bounded useful logs without secrets.
Integrate the validated exact pending-POST retry path into this supervised
lifecycle and prove it through the one-command entry point.

Before this engineering action starts, commit and push this containing
continuity-only update, then verify the TypeScript branch tip equals its upstream
and both worktrees are clean. This does not change the exact product pair above.

### NEXT 3-5 ACTIONS AFTER THAT

1. Prove supervisor-owned save/load/reconnect and exact response-loss recovery
   from an active Movie #2 production and active construction, including stale
   and duplicate protections across automatic engine replacement.
2. Emit and pin the production bridge runtime, audit its actual packaged
   dependency graph, and document the installer boundary without weakening the
   local-only/no-filesystem-execution boundary.
3. Exercise ugly lifecycle cases through the supervisor: rapid clicking,
   malformed/unsupported protocol, repeated engine death, Unity restart,
   graceful shutdown, stale runtime ownership, and missing presentation asset.
4. Resume the isolated `location-v1` two-scale camera experiment and Hero
   Soundstage 7 slice only after the default runtime lifecycle is sealed.

### DO NOT TOUCH

- Frozen authorities; immutable M1/M2/M3 tags; V14 save/game truth; permanent
  IDs; RNG streams; Three.js regression oracle; and TypeScript-only simulation
  authority.
- Do not tag or promote non-Golden Checkpoint 9 to main/C2. A future canonical
  promotion remains authorized only after its full higher gate. Do not rebase,
  force-push, rewrite history, delete tags/branches, buy assets, use protected
  assets, generate images, or mutate historical research truth.
- Do not persist the capability or `runtimeInstanceId`; widen V14; add bridge
  metadata to `GameState`; hand-edit generated DTOs; duplicate gameplay formulas
  in C#; silently evict IDs; or perform async unqueued checkpoint writes.
- Do not retry a pending POST across a changed logical session, create a new ID,
  reserialize from current UI state, mutate the retained bytes, accept an
  authority contradiction, or publish completion before a fresh joined
  projection.
- Keep the post-commit response seam strictly test-only, durable-only, one-shot,
  canonical, and absent from product logs. Do not expose it through HTTP or
  enable it in a normal launch.
- Keep `location-v1` and other visual experiments isolated until the default
  lifecycle gate is closed. Evidence is validation material, not visual
  acceptance.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Retain the exact raw UTF-8 POST before first send | A deduplicated retry is safe only if route, bytes, ID, and originating authority are immutable | Yes within client infrastructure; byte identity is non-negotiable | Three native request hashes match commit marker, replay marker, Unity receipt, and journal bytes |
| Retry only after `/session` confirms the originating logical session | Runtime replacement is recoverable; logical-session replacement invalidates the pending authority | No relaxation is safe without a stronger authority proof | Unity lifecycle tests and three same-session native replacements |
| Require a fresh session/snapshot join after the replay receipt | A cached or historical response cannot alone prove the current projection | Yes only if an equally strict atomic endpoint replaces it | 62/62 EditMode plus final native revision/digest chain |
| Accept current cached, expected first execution, historical completion, or later `STALE_REVISION`, but fail other contradictions | These are the complete honest outcomes around commit/replay and a racing same-session mutation | Reversible only at an explicit protocol/lifecycle redesign | Pure lifecycle tests and independent P1 audit fixes |
| Gate response interruption behind test mode plus durable runtime | Production must not expose a crash/fault control; the proof needs a deterministic post-commit boundary | Yes; remove after equivalent lower-level harness exists | 84 bridge tests and actual three-`SIGKILL` proof |
| Add a standalone fail-closed evidence verifier | A Unity JSON assertion alone cannot prove exact server bytes or a single durable mutation | Yes, but the acceptance evidence must remain independently cross-checked | 8/8 mutation tests and canonical verifier receipt |
| Use the first offered authoritative intent in the native recovery proof | Intent availability is TypeScript truth; the harness must not invent a hardcoded action | Yes | Superseded `021103Z` failure and successful `021520Z` run |
| Keep M3 as CURRENT BEST and Checkpoint 9 non-Golden | The default launcher is absent and visuals are unchanged/below ADR 0006 even though Checkpoint 9 is now a clean pushed recovery pair | Yes after a later full Golden gate | Promotion register, remote product SHAs, and evidence above |

### UNCOMMITTED / GENERATED MATERIAL

- No TypeScript product WIP remains. Product source is clean at pushed
  `114c99c1...`; only this ledger, handoff, and promotion update are dirty for
  the containing continuity-only commit. After its push, the branch must be
  clean and equal its upstream.
- No Unity product WIP remains. The tree is clean at pushed `6b323354...`.
  Generated DTO/data files are untouched.
- Ignored local evidence: the superseded failed root
  `Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021103Z/`; accepted root
  `Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021520Z/`; Movie #2 root
  `Evidence/B/Checkpoint9-Movie2-Regression-Protocol4-20260821T022838Z/`; and
  idle restart root
  `Evidence/B/Checkpoint9-Runtime-Restart-Regression-Protocol4-20260821T022933Z/`.
- The failed root contains a deliberately excluded stale local lock file. Do
  not reuse, clean into Git, or treat that root as accepted proof.
- Generated local native build: Unity `Builds/macOS/Project Studio Visual
  Spike.app`, 136,980,022 aggregate file bytes. Unity `Library/` and `Logs/`
  remain ignored caches.
- Local validation logs/results include
  `/tmp/studio-b9-editmode-proof-fix.log`,
  `/tmp/studio-b9-editmode-proof-fix.xml`, and
  `/tmp/studio-b9-native-build-proof-fix.log`. Native process logs live inside
  the four ignored evidence roots. Earlier B9 intermediate EditMode/build logs
  remain local and deliberately excluded.
- TypeScript generated/ignored material remains `.tmp/3d-asset-audit.json`,
  `dist/`, `node_modules/`, and temporary runtime directories. None may enter
  Git.
- Evidence JSON intentionally contains local absolute screenshot paths. All
  evidence, runtime checkpoints, logs, lock files, and native builds remain
  ignored and must not enter a product or canonical diff.
- The local fidelity PDF remains outside Git at
  `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
  SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
- No purchased, generated-image, protected, or newly adopted production asset is
  part of Checkpoint 9.

### RECOVERY INSTRUCTIONS

1. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, the campaign ledger, this
   top section, the promotion register, ADR 0006, ADR 0007, `BRIDGE-README.md`,
   and `SECURITY.md`. Do not reopen the Unity/TypeScript decision.
2. Verify the TypeScript worktree branch. Confirm product
   `114c99c1c4e5623c5ea3e0c60864faed925fb33e` is an ancestor of HEAD, and that
   the branch tip is exactly one continuity-document-only descendant of that
   product commit. After the containing docs commit is pushed, HEAD must equal
   its configured upstream and `git status --short` must be empty.
3. Verify the Unity worktree branch, exact HEAD/upstream
   `6b32335447848ed0680eb8077e78ee36aded5d56`, and a clean status. Do not
   discard or rebuild the validated pending-POST unit from chat history.
4. Verify protocol `4`, projection `4`, schema `ba9cd199...`, generated copies
   `1192d58a...`, and no generated diff. Run only the minimum dirty-source smoke
   if no file changed after this timestamp: `npm run typecheck:bridge`,
   `npm run test:bridge`, and Unity EditMode; expected results are 84/84 and
   62/62. Run `npm run verify:bridge-inflight-evidence -- '<accepted-root>'`;
   its canonical output must match the stored verifier receipt.
5. Inspect the accepted `021520Z` report, verifier receipt, three server marker
   pairs, runtime journal, and recovery frame. Do not use `021103Z` as proof.
   The exact hashes and expected state chain are recorded above.
6. Verify both product SHAs are present remotely. The only allowed descendant
   before new engineering is the containing TypeScript continuity-only commit;
   verify it is pushed and both worktrees are clean.
7. Launch the sealed pair with the same-shell command above and perform a brief
   authenticated session/retry smoke if exact source differs from the evidence
   build. Then perform NEXT EXACT ACTION. Do not ask the Owner to reconstruct
   Checkpoint 9 or repeat the closed ambiguous-POST research.

## CHECKPOINT 8 SEALED - HISTORICAL

### CURRENT EXACT STATE

Timestamp: 2026-08-21 03:22 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript product HEAD / pushed | `720826bd843995920bb2f219ab21203d236c1879`; pushed to the recorded campaign branch |
| TypeScript product parent | `550eae6799b5cb64f567b42ab688a2bc76f5a073` |
| TypeScript branch tip / working tree | This handoff's containing commit is the sole continuity-only descendant of `720826bd843995920bb2f219ab21203d236c1879`; after push, `git rev-parse HEAD` must equal the configured upstream and the tree must be clean |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / upstream / pushed | `94e8bcac6a5bf94fd70f3f8a61992511230688a2`; local HEAD, configured upstream, and remote branch agree |
| Unity product parent | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Unity working tree | Clean |
| Current Golden recovery pair | TypeScript `e9c6f06b717a6a106281b189a61072e35770155f` plus Unity `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Golden tags | Immutable and pushed `golden/unity-convergence-m1`, `golden/unity-convergence-m2`, and `golden/unity-convergence-m3` in both repositories |
| Branches pushed | Yes; TypeScript product `720826bd...` and Unity product `94e8bcac...` are remotely recoverable as one compatible pair |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; M3 remains CURRENT BEST; sealed Checkpoint 8 is non-Golden and not canonical |

The exact sealed contract is protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The TypeScript and Unity generated C# copies are byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No gameplay formula, `GameState` member, V14 field, permanent identity, or RNG
stream changed. TypeScript remains the sole simulation authority.

### CAMPAIGN STATUS

- Current phase: Phase B, durable local game runtime.
- Completed phases/subphases: campaign setup/baseline; A1 generated contract;
  A2 named atomic projections; A3 queue-law parity; A4 structured rejection
  guidance; donor governance/security reconciliation; Phase B's separate V14-
  preserving runtime checkpoint, commit-before-response coordinator, private
  atomic store, bounded replay, lock recovery, and real-process replay core.
- Partially completed: Checkpoint 8 adds an authenticated loopback boundary,
  protocol-4 process identity, forward migration from the exact protocol-3
  operational checkpoint, strict Unity transport, session-first polling,
  restart/outage detection, torn-read recovery, and native idle restart proof.
- Untouched or incomplete in Phase B: exact ambiguous in-flight POST retention
  and retry, default durable launch, random-port/supervisor lifecycle, packaged
  runtime graph, stale-child cleanup, bounded product logs, and active-state
  restart proof.
- Later phases: inherited Phase C/D/E capabilities remain playable; F through N
  remain mostly untouched or inherited partial work. The current visual client
  remains below ADR 0006.
- Current acceptance gate: recover an engine death after authoritative commit
  but before HTTP response without duplicate mutation, lost action, stale replay,
  or any retry across a changed logical session.

### WHAT WAS JUST DONE

TypeScript now requires one canonical random 32-byte base64url capability for
every request, deletes the plaintext from its own environment after hashing it,
binds only `127.0.0.1`, requires the exact local Host, rejects every Origin,
requires `application/json` for POST, rejects duplicate/protected overflow
headers, bounds headers/body/request/socket lifetime and requests per socket, and
returns generic closed boundary failures. The capability is absent from saves,
checkpoints, journal entries, responses, reports, and logs.

Protocol 4 adds a random non-persisted `runtimeInstanceId` only to `/health` and
`/session`. It is absent from snapshots, POST envelopes/responses, the replay
journal, runtime checkpoint, V14, and logs. Startup performs one strict forward-
only migration from protocol 3/schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`:
both exact V14 slots survive, while incompatible cached protocol-3 response
bytes are discarded behind a new logical session at revision zero. Migration
is atomically committed before the server becomes ready and preserves old bytes
if the write fails.

Unity now validates an exact `http://127.0.0.1:<port>` endpoint before reading or
attaching the environment capability, disables redirects, attaches the secret
through one transport factory, and performs `/session` before `/snapshot`.
Runtime-process identity is kept separate from logical authority identity.
Actual outages retain the last authoritative projection and disable actions;
runtime replacement reconnects only after the authority tuple is valid. A
bounded session/snapshot join policy retries transient torn reads and fails
loudly after five consecutive contradictions. Runtime-only replacement preserves
player guidance; logical-session change and `SESSION_MISMATCH` clear it and
discard the old action without automatic replay.

Files/systems changed:

- TypeScript contract/runtime: `bridge/schema/bridge-schema.ts`, checked-in JSON,
  generated Unity DTO, `bridge/server.ts`, `bridge/runtime-checkpoint.ts`, and
  `bridge/runtime/runtime-coordinator.ts`.
- TypeScript tests/docs: bridge schema/session tests, runtime checkpoint and
  coordinator tests, process restart tests, new `tests/bridge-http-security.test.ts`,
  `BRIDGE-README.md`, `SECURITY.md`, and campaign continuity documents.
- Unity runtime: generated DTO, `StudioBridgeProtocol`, `StudioBridgeTransport`,
  `StudioBridgeRuntimeContinuity`, `StudioBridgeClient`, rejection retention,
  and `StudioBridgeProofRunner`.
- Unity tests: protocol, rejection-retention, and runtime-continuity EditMode
  suites plus the required new `.meta` files.

Why: loopback alone is not authentication, a logical session cannot identify an
engine-process replacement, and a protocol bump must not strand the already-
validated protocol-3 durable state. This unit closes those boundaries without
moving simulation or save truth into C#.

Relevant commits: TypeScript product
`720826bd843995920bb2f219ab21203d236c1879` (parent
`550eae6799b5cb64f567b42ab688a2bc76f5a073`) and Unity product
`94e8bcac6a5bf94fd70f3f8a61992511230688a2` (parent
`40465d48c191c9dcdda2c6b32c17c9675f4908a4`). Both product commits are pushed.

### WHAT IS WORKING RIGHT NOW

Launch the sealed protocol-4 checkpoint from one shell so both processes
receive the same capability without putting it in argv or a file:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
launch_capability="$(node -e \
  "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))")"
runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/project-studio-runtime.XXXXXX")"
chmod 700 "$runtime_dir"
bridge_log="${TMPDIR:-/tmp}/project-studio-bridge.$$.log"
PROJECT_STUDIO_BRIDGE_CAPABILITY="$launch_capability" \
  PROJECT_STUDIO_BRIDGE_RUNTIME_DIR="$runtime_dir" \
  PROJECT_STUDIO_BRIDGE_PORT=4317 \
  npm run bridge >"$bridge_log" 2>&1 &
bridge_pid=$!
while ! rg -q '\[bridge\] live http://127\.0\.0\.1:4317' "$bridge_log"; do sleep 0.1; done
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
PROJECT_STUDIO_BRIDGE_CAPABILITY="$launch_capability" \
  'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
kill -TERM "$bridge_pid"
wait "$bridge_pid"
```

Reuse the same `launch_capability` and `runtime_dir` only when restarting the
engine during that one product launch. Rotate the capability for the next
product launch. Normal `npm run bridge` without a capability fails closed; it
also remains memory-only unless `PROJECT_STUDIO_BRIDGE_RUNTIME_DIR` is supplied.

- Bridge/runtime status: authenticated protocol 4 is live; opt-in durable state
  survives `SIGKILL`; same-session response replay remains byte-exact; an actual
  protocol-3 checkpoint migrates to protocol 4 with both V14 digests exact.
- Unity runtime status: session-first polling, strict transport, redirect denial,
  outage presentation retention, action pause, process-replacement detection,
  reconnect, and bounded torn-read handling are working in EditMode and native
  proof.
- Current playable flow: construction and exact Movie #2 remain playable from
  screenplay through auditions, editable casting/package, greenlight,
  pre-production, director/scenery blockers, load-in, shooting, save/load, post,
  release, stale guidance, and reconnect.
- Current Movie #2 status: `The Reluctant Cornerstone`, `script-0001`,
  `prod-0013` released at Week 22/revision 23; final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Current visual state: functionally unchanged from M3. The capture remains a
  high-isometric, sparse diorama with a generic debug-heavy HUD. It does not yet
  feel inhabitable, human-scale, era-authored, or visibly like filmmaking and
  remains below ADR 0006's recognizability gate.

### VALIDATION STATE

| Gate | Latest result |
| --- | --- |
| Full TypeScript tests | Passed: 333 files; 4,493 passed, 5 skipped, 0 failed |
| Product-SHA CI | GitHub Actions run `32435419313` passed all gates for exact TypeScript product `720826bd843995920bb2f219ab21203d236c1879` in 10m54s |
| TypeScript typecheck | Full application typecheck passed |
| Bridge typecheck | Passed |
| Production build | Passed; inherited Vite chunk-size warnings only |
| Generated contract | Passed; protocol 4/projection 4/schema `ba9cd199...`; checked-in JSON and generated C# deterministic |
| Bridge aggregate | Passed: 67/67 across 8 files, including raw HTTP attacker, restart, migration, replay, Movie #2, and save determinism coverage |
| Bridge proof | Passed; exact Movie #2 release, V14 save/import/headless parity, stale/duplicate protection, and polling independence |
| Protocol-3 migration | Passed unit/coordinator failure tests and an independent real checkpoint produced by `e6fc2047`; current/saved V14 digests preserved exactly |
| Browser dependency audit | Passed: 0 browser-runtime vulnerabilities |
| Repository hygiene | Passed: 1,018 repository files checked |
| 3D asset audit | Passed: 26 assets, 0 hard violations |
| Unity EditMode | Passed: 46/46 |
| Native macOS build | Passed; `Builds/macOS/Project Studio Visual Spike.app`; 136,955,718 aggregate file bytes |
| Native Movie #2 | Passed protocol 4 end-to-end at Week 22/revision 23; stale rejection retained from poll 13 to 14; no console failure |
| Native runtime restart | Passed actual outage and engine replacement with the same logical session/revision `0`/Week `11`/digest `3517604efca1c48a54732d9799b6a73ffa9ab99f26e0e28d54bdbac010af1109`; runtime ID changed; 3 outage polls; projection retained; actions disabled then restored |
| Restart checkpoint | Byte-identical across restart; SHA-256 `9684a67cb1e04bd4cec44dd91aab37aabef28d53b22d757b175b8821dd1bcfb5`; 266,526 bytes; journal length 0 |
| Performance | Movie #2 average 118.999455 FPS; restart proof 118.999921 FPS on Apple M3 Max |
| Secret scan | Capability absent from server/Unity logs, checkpoint, reports, evidence JSON, and generated DTO; runtime ID absent from checkpoint and logs |
| Latest evidence | `Evidence/B/Secure-Movie2-Protocol4-Final-20260821T005553Z/` and `Evidence/B/Runtime-Restart-Protocol4-Final-20260821T005655Z/` |
| Evidence hashes | Movie #2 proof JSON `e1795b73...`; released frame `6e1efea3...`; restart proof JSON `b0ea2900...`; restart frame `6e3feeef...` |

Independent TypeScript and Unity red-team passes found no remaining P0/P1 in
the implemented protocol-4 boundary, migration, or idle restart lifecycle after
fixes. This is still not a Golden checkpoint because the next acceptance gate
and default product lifecycle are incomplete and visual quality did not improve.

### KNOWN PROBLEMS / BLOCKERS

- P1, ambiguous in-flight POST recovery. Exact defect: Unity does not retain and
  retry the exact raw UTF-8 route/body/command identity if the engine dies after
  durable commit but before response delivery. Reproduction: kill the engine in
  that interval during `/command`, `/save`, or `/load`; the authoritative action
  may be committed while Unity observes only transport failure and discards the
  operation. This is pre-existing unfinished Phase B work, not a Checkpoint 8
  regression. Commit-before-response, durable deduplication, same-session exact
  replay, session-first polling, and process/outage detection are implemented;
  the deterministic response-hold seam and native kill proof are not. Must not
  generate a new command ID/body, retry before validating `/session`, or replay
  anything after logical-session mismatch.
- P1, default runtime lifecycle. Exact defect: normal `npm run bridge` remains
  memory-only and there is no one-command supervisor owning a private runtime
  root, random port, capability handoff, child restart/shutdown, stale-process
  cleanup, and bounded logs. Reproduction: launch with only capability and port;
  startup reports `checkpoint=memory-only`, and engine exit leaves Unity without
  a supervisor. This is pre-existing incomplete Phase B work. The secure/durable
  primitives and manual launch are validated. Must not place the capability in
  argv, logs, disk, reports, checkpoints, saves, or `GameState`, and must not
  expose arbitrary filesystem or command execution through HTTP.
- P2, packaged runtime audit boundary. Exact defect: the development bridge runs
  through `vite-node`; `npm run audit:browser-deps` intentionally excludes the
  dev runtime graph. Reproduction: inspect the launch script and audit scope.
  This is pre-existing packaging work. Browser dependencies and repository
  hygiene pass. Must not claim a production dependency audit until an emitted,
  pinned runtime artifact is audited directly.
- P1, visual product mismatch. Exact defect: current captures remain elevated,
  sparse, flat, and debug-HUD-led; people, role readability, era materials,
  two-scale camera, Hero Stage 7, and visible filmmaking remain below ADR 0006.
  Reproduction: inspect the latest whole-lot, construction, shooting, release,
  and restart frames against the fidelity reference and M3. This is pre-existing
  and visually unchanged in Checkpoint 8. Must not call this unit a visual
  improvement or Golden based on tests/FPS.
- Attempted fixes that must not be repeated: a positive Node
  `server.maxHeadersCount` hid protected tail headers through truncation;
  transport redirects forwarded the capability; ordinary poll transitions were
  miscounted as outages; one valid session/snapshot race was treated as fatal;
  runtime-only replacement cleared valid rejection guidance; and protocol-3
  checkpoints were initially rejected instead of migrated. All were replaced
  with tested fail-closed or recovery behavior. Do not restore those designs.

### NEXT EXACT ACTION

Implement exact in-flight POST recovery for `/command`, `/save`, and `/load`:
retain the route, raw UTF-8 body, and `commandId` before send; after transport
loss, fetch and validate `/session`; retry the identical bytes only when the
logical session still matches, and discard/refresh on session mismatch. Add a
deterministic TypeScript test seam that holds the response after atomic durable
commit, then kill the engine at that point in a native Unity proof and verify
one authoritative mutation plus byte-identical deduplicated response recovery.

### NEXT 3-5 ACTIONS AFTER THAT

1. Build the one-command developer launcher/supervisor with a private durable
   root, random port, same-launch capability handoff, bounded logs, owned child
   restart/shutdown, health readiness, and stale-process cleanup.
2. Prove checkpoint/reconnect/save-load behavior from an active Movie #2
   production and active construction, including duplicate/stale protection.
3. Emit and pin the production bridge runtime, audit its actual packaged
   dependency graph, and document the remaining installer/launcher boundary.
4. Resume the isolated `location-v1` two-scale camera experiment and Hero
   Soundstage 7 visual slice only after the Phase B lifecycle gate is sealed.

### DO NOT TOUCH

- Frozen authorities, immutable M1/M2/M3 tags, V14 save/game truth, permanent
  IDs, RNG streams, Three.js regression oracle, and TypeScript-only simulation
  authority.
- Do not tag or promote non-Golden Checkpoint 8, and do not merge this bounded
  checkpoint to main/C2. A later canonical promotion remains authorized only
  after the full delegated PM gate and a reviewed merge candidate pass. Never
  rebase, force-push, rewrite history, delete tags/branches, buy assets, use
  protected assets, generate images, or mutate historical research truth.
- Do not persist the capability or `runtimeInstanceId`; widen V14; add bridge
  metadata to `GameState`; hand-edit generated DTOs; duplicate gameplay formulas
  in C#; silently evict command IDs; or perform async unqueued checkpoint writes.
- Do not weaken exact Host/Origin/content-type/header/redirect checks. Do not
  retry a retained POST across a changed logical session or reconstruct its
  body from current presentation state.
- Keep `location-v1` and other visual experiments isolated until the runtime
  recovery gate is closed. The latest native evidence is validation material,
  not proof of visual acceptance.

### DECISIONS MADE THIS SESSION

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Bump protocol to 4 and keep projection at 4 | Process identity changes the handshake contract but adds no snapshot facts | Only at a later explicit protocol boundary | Generated schema/DTO checks and 67 bridge tests |
| Keep `runtimeInstanceId` process-local and expose it only on health/session | Process replacement must be visible without contaminating durable/gameplay truth | Yes, within infrastructure, while confinement remains | Schema exclusion tests, checkpoint/log scans, native restart proof |
| Require one 32-byte per-launch capability on every request | Loopback is not an authentication boundary | Replaceable by an equally private launcher channel | Raw attacker tests and no-secret scans |
| Migrate exactly protocol 3 to 4 by preserving both V14 slots but opening a new session with no journal | Protocol-3 response bytes cannot satisfy protocol 4, while gameplay/save authority must survive | Forward-only; do not synthesize rewritten replay bytes | Unit/coordinator failure tests and actual `e6fc2047` checkpoint migration |
| Preserve projection/guidance during runtime-only replacement and disable actions during real outage | Process identity is not logical authority identity | Yes if an equally strict state machine replaces it | 46 EditMode tests and native restart evidence |
| Do not automatically retry POSTs in this unit | Safe retry requires retaining exact bytes and validating the logical session after ambiguity | Yes; NEXT EXACT ACTION adds the bounded safe path | Red-team lifecycle audit and missing kill-after-commit proof |
| Keep M3 as CURRENT BEST and mark Checkpoint 8 non-Golden | Default lifecycle and in-flight proof remain incomplete; visuals are unchanged and below ADR 0006 | Yes after the full Golden gate passes | Promotion register, current evidence, and blocker list above |

### UNCOMMITTED / GENERATED MATERIAL

- No tracked or untracked product WIP remains after the containing continuity
  commit is pushed. The TypeScript branch tip may be one documentation-only
  descendant of product `720826bd...`; Unity remains exactly at product
  `94e8bcac...`.
- Ignored local evidence: `Evidence/B/Secure-Movie2-20260821T003224Z/`,
  `Evidence/B/Secure-Movie2-Protocol4-20260821T005114Z/`,
  `Evidence/B/Secure-Movie2-Protocol4-Final-20260821T005553Z/`,
  `Evidence/B/Runtime-Restart-20260821T003049Z/`,
  `Evidence/B/Runtime-Restart-Protocol4-20260821T005219Z/`, and
  `Evidence/B/Runtime-Restart-Protocol4-Final-20260821T005655Z/`.
- Generated local native build: Unity `Builds/macOS/Project Studio Visual
  Spike.app`, 136,955,718 aggregate file bytes. Unity `Library/` and `Logs/`
  remain ignored caches.
- Local final logs: `/tmp/studio-b8-final-editmode.log`,
  `/tmp/studio-b8-final-editmode.xml`,
  `/tmp/studio-b8-final-native-build.log`,
  `/tmp/studio-b8-final-movie2-server-20260821T005553Z.log`,
  `/tmp/studio-b8-final-movie2-unity-20260821T005553Z.log`, and the three
  `/tmp/studio-b8-final-restart-*-20260821T005655Z.log` files. Earlier B8 and
  red-team logs remain local and deliberately excluded.
- TypeScript generated/ignored material: `.tmp/3d-asset-audit.json`, `dist/`,
  `node_modules/`, and temporary runtime directories. These must not enter Git.
- Retained final runtime checkpoints are local-only:
  `/var/folders/q_/n1q5ygxd25b3r9wnd57c5zsw0000gn/T/studio-b8-final-movie2-runtime.PFUS1e/bridge-runtime-v1.json`
  is 1,354,920 bytes, has 25 journal entries, and SHA-256
  `2e657e66284389709116f228e31f4488450c2c104288ca7f43235cb3544b93ce`;
  `/var/folders/q_/n1q5ygxd25b3r9wnd57c5zsw0000gn/T/studio-b8-final-restart-runtime.rv3wJn/bridge-runtime-v1.json`
  is 266,526 bytes, has 0 journal entries, and SHA-256
  `9684a67cb1e04bd4cec44dd91aab37aabef28d53b22d757b175b8821dd1bcfb5`.
- The local visual-fidelity PDF remains outside Git at
  `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
  SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
- No purchased, generated-image, protected, or newly adopted production asset is
  part of Checkpoint 8.

### RECOVERY INSTRUCTIONS

1. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, the campaign ledger, this top
   section, the promotion register, ADR 0006, ADR 0007, `BRIDGE-README.md`, and
   `SECURITY.md`. Do not restart planning or reopen the engine decision.
2. In the TypeScript worktree, verify branch
   `campaign/unity-production-convergence-80h-ts`; confirm product commit
   `720826bd843995920bb2f219ab21203d236c1879` is an ancestor of HEAD, HEAD equals
   its configured upstream, and `git status --short` is empty. The branch tip may
   be exactly one continuity-document-only descendant of the product commit.
3. In the Unity worktree, verify branch
   `campaign/unity-production-convergence-80h-client`, HEAD/upstream
   `94e8bcac6a5bf94fd70f3f8a61992511230688a2`, then confirm
   `git status --short` is empty.
4. Verify protocol `4`, projection `4`, schema `ba9cd199...`, and SHA-256
   `1192d58a...` for both generated DTO copies. Run the minimum source smoke:
   `npm run check:bridge-contract`, `npm run typecheck:bridge`, and
   `npm run test:bridge`; expected bridge result is 67/67.
5. If Unity source integrity is uncertain, run Unity 6000.3.22f1 EditMode with
   `-runTests -testPlatform EditMode`; expected result is 46/46. Rebuild only if
   the current native app is missing or source changed after the timestamp.
6. Launch the protocol-4 checkpoint with the same-shell command above. Confirm
   authenticated `/session`, a stable logical session, a nonempty runtime ID,
   Movie #2 playability, and clear action pause/recovery during an engine restart.
7. Inspect the two final evidence directories and logs listed above. They prove
   idle restart and Movie #2, not the still-missing kill-after-commit case.
8. Continue with NEXT EXACT ACTION exactly as written. Do not ask the Owner to
   reconstruct history or repeat settled A1-A4/checkpoint/security research.

## GOLDEN M3 HANDOFF - HISTORICAL

Timestamp: 2026-08-21 00:55 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden M3 product / pushed remote | `e9c6f06b717a6a106281b189a61072e35770155f` |
| TypeScript parent | `85429f9d18e2b6321e21557bdb068b1047b4c452` |
| TypeScript working tree | Clean immediately after product push/tag; this continuity-only update is the sole expected tracked follow-up |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity Golden M3 HEAD / pushed remote | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` |
| Unity parent | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity working tree | Clean; only ignored `Builds/`, `Evidence/`, `Library/`, and `Logs/` remain local |
| Golden tags | `golden/unity-convergence-m3` pushed in each repository and peeled to the exact product pair; M1/M2 preserved |
| Promotion | `GOLDEN — CONTINUE CAMPAIGN`; not promoted to canonical |

The exact compatible live contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Golden M3 supersedes M2 as CURRENT BEST because it preserves M2's queue-law and
Movie #2 integrity while adding a generated, strict, poll-durable player
explanation for every genuine rejection. TypeScript remains sole simulation
authority.

### Current campaign status

- Current phase: Phase A contract durability moving into Phase B local runtime.
- Completed: setup/baseline, A1 generated contract, A2 atomic named projection
  foundation, A3 queue-law parity, A4 structured rejection guidance, donor
  security/governance harvest.
- Partial: command identity/revision/deduplication/rejection are robust within a
  process, but replay/save/session durability does not survive engine restart.
- Untouched: production launcher/lifecycle, authenticated local transport,
  durable disk save, production client layering. Later visual/player phases
  remain inherited partial work.
- Current acceptance gate: exact response replay across save/load and an actual
  TypeScript process restart without changing V14 or `GameState`.

### Just completed

- TS commit `e9c6f06b717a6a106281b189a61072e35770155f` publishes protocol 3 and one
  closed `rejection` object with category, blocker, required-nullable holder, and
  remedy; all 12 codes map centrally; capacity queues remain accepted.
- Unity commit `40465d48c191c9dcdda2c6b32c17c9675f4908a4` consumes the generated DTO,
  validates exact authority tokens, retains the notice across same-state polls,
  clears it on acceptance/session change, and renders WHAT HAPPENED / optional
  CURRENT HOLDER / WHAT NEXT. Raw diagnostics are log/proof-only.
- Generated copies are byte-identical. Both commits/branches/tags are pushed,
  remote-verified, and clean. No asset, simulation, save, RNG, or identity
  authority changed.

### Working build and evidence

Launch:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run bridge

cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

- Runtime: localhost `127.0.0.1:4317`; still two manual processes with
  process-memory-only session/save/replay.
- Playable flow: construction and exact Movie #2 from screenplay through
  release, including save/load, stale rejection, and reconnect.
- Movie #2: `The Reluctant Cornerstone`, `script-0001`, `prod-0013`, Week
  22/revision 23, final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Visual state: rejection notice improved; world/camera/people/materials/activity
  unchanged and still below ADR 0006's inhabitable two-scale target.
- TypeScript: 327 files/4,452 pass/5 skip; bridge 26/26; both typechecks, build,
  proof, generator, browser-dependency, hygiene, and 3D audits passed.
- Unity: EditMode 24/24; native build 136,938,870 bytes; save/load digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  stale notice retained poll 11 to 12; proof/reconnect 119.3803/118.9993 FPS.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained screenshot
  SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Latest logs: `/tmp/studio-a4-rejection-p1-seal-editmode.xml`,
  `/tmp/studio-a4-rejection-p1-native-build-final.log`,
  `/tmp/studio-a4-rejection-p1-native-proof-final.log`, and
  `/tmp/studio-a4-rejection-p1-native-reconnect-final.log`.

### Known blockers

- P1: replay/session/current-state/explicit-save checkpoint is memory-only.
- P1: no one-command supervisor, durable disk save, restart-aware Unity
  handshake, per-launch capability, or coordinated shutdown.
- P1: visual recognizability, two-scale camera, Hero Stage 7, people/animation,
  and visible filmmaking remain below the product target.
- P2: unexpected HTTP 500 remains unstructured; cross-repository DTO copy CI is
  local; several Unity mismatch branches lack isolated tests.
- Do not retry widening V14, persisting bridge metadata in `GameState`, silently
  evicting command IDs in one logical session, or letting async checkpoint
  writes reorder authoritative mutations.

### Historical next exact action

Implement a separate strict `BridgeRuntimeCheckpointV1` containing untouched
canonical current V14 JSON, last explicit saved V14 JSON, logical session ID,
state revision, and a bounded canonical request/full-response journal. Serialize
all command/save/load dispatch through one persistence queue, atomically commit
the checkpoint before sending a first-seen response, and prove raw response
replay across save/load and a real engine process restart.

### Historical next 3-5 actions

1. Add a non-persisted `runtimeInstanceId`, harden the HTTP server, and make
   Unity perform health/session/snapshot handshake plus restart-aware reconnect.
2. Add per-launch capability, strict Host/Origin/content-type/timeouts, and an
   emitted dependency-audited bridge runtime.
3. Add the one-command developer supervisor with random port, safe logs, owned
   child shutdown, and stale-lock cleanup.
4. Prove native engine kill/restart during Movie #2, then active-production and
   construction save/recovery.
5. Resume the isolated `location-v1` camera experiment and Hero Stage 7 slice.

### Do not touch

- Frozen authorities, M1/M2/M3 tags, V14 save/game truth, IDs, RNG streams,
  Three.js regression oracle, and TypeScript-only simulation authority.
- Do not merge to main/C2, rebase, force-push, rewrite history, delete tags or
  historical branches, buy assets, use protected assets, or generate images.
- Do not put replay metadata into `GameState`, widen V14, hand-edit generated
  DTOs, infer gameplay remedies in Unity, or expose filesystem/command execution
  over the bridge.
- Local fidelity references, screenshots, builds, evidence JSON, logs, caches,
  `.tmp/`, `dist/`, and `node_modules/` remain excluded from Git.

### Decisions made this session

- M3 is CURRENT BEST and supersedes M2; status remains
  `GOLDEN — CONTINUE CAMPAIGN`, not canonical promotion.
- Protocol is 3 because rejection shape is breaking; projection stays 4 because
  snapshot facts did not change.
- TypeScript owns all rejection facts. Raw diagnostics are not player copy.
- The replay checkpoint must be operational state separate from closed V14 and
  `GameState`; this preserves deterministic gameplay/save parity.
- A logical session must survive process restart for exact replay. A separate
  non-persisted runtime instance identity will later signal process replacement.

### Uncommitted / generated material

- Unity product tree is clean at M3. Ignored current native build and A4 evidence
  remain local and deliberately excluded.
- TypeScript product tree was clean at M3; this ledger/handoff/promotion update
  is a continuity-only descendant and must be committed/pushed separately.
- Generated C# is committed in both repositories and byte-identical. Do not
  regenerate unless the canonical TypeScript schema changes.
- The local visual-fidelity PDF remains outside Git at
  `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
  SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.

### Recovery

1. Read the architecture decision, ledger, this top section, and promotion
   register.
2. Verify both M3 tags peel to the product SHAs above and remote branch refs
   agree. The TypeScript branch may have a docs-only descendant containing this
   section; its product tag remains the recovery authority.
3. Run `npm run test:bridge`, both typechecks, and the cross-repository generated
   check before starting the replay checkpoint.
4. Launch the commands above and inspect the accepted A4 evidence. Do not repeat
   A1-A4 research or ask the Owner to reconstruct the campaign.
5. Preserve M1/M2/M3 tags, frozen authorities, Three.js oracle, V14 bytes, IDs,
   RNG streams, and all ignored evidence/build material.

## A4 PRE-COMMIT STATE - HISTORICAL

This section was the authoritative pre-commit handoff at 2026-08-21 00:48 CEST
(UTC+02:00). It is preserved only as checkpoint history. The Golden M3 section
above supersedes it completely.

### Current exact state

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript HEAD / pushed branch | `85429f9d18e2b6321e21557bdb068b1047b4c452`; local, upstream, and remote agree before the A4 commit |
| TypeScript working tree | Dirty only with the validated A4 contract/runtime/schema/generated/tests/README unit and the three campaign continuity documents |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD / pushed branch | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`; local, upstream, and remote agree before the A4 commit |
| Unity working tree | Dirty only with the validated generated DTO, strict parser, rejection retention/client/HUD/proof, tests, and their two new `.meta` files |
| Current Golden | M2: TypeScript `7d76951f6ad641e8940b97b03806b87638ed8ad8` plus Unity `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Golden tags | Immutable/pushed `golden/unity-convergence-m1` and `golden/unity-convergence-m2` in both repositories |
| A4 pushed | No. A4 has no commit or tag yet. Do not call it Golden from dirty worktrees. |

The A4 compatible contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
The TypeScript and Unity generated C# files are byte-identical at SHA-256
`791853b02e1cc0b4fa2e2256f7b984dac71d2689bd7d0205f5d76353a49ccf09`.

### Campaign status

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A4 structured rejection guidance is implementation-complete,
  independently audited, and validated pre-commit.
- Completed: campaign setup/baseline; A1 generated schema/DTO pipeline; A2
  atomic named projection bundle; A3 queue-law parity; PR #5 donor/security
  harvest.
- Partially completed: command IDs, expected revision, stale rejection,
  deduplication, explicit codes, structured player guidance, and bounded
  in-process replay. Replay persistence and fatal-path structure remain.
- Untouched as campaign implementations: Phase B durable product runtime and
  Phase C production-client layering. D through N retain inherited partial
  capabilities only.
- Current acceptance gate: commit and push the exact validated protocol-3 pair,
  verify clean remote SHAs, then decide Golden M3 without weakening the visual
  or runtime requirements.

### What was just done

A4 replaces code-only bridge failures with one closed TypeScript-owned
`rejection` object containing `category`, required non-empty `blocker`, required
nullable `currentHolder`, and required non-empty `remedy`. All 12 reason codes
map centrally. Capacity-full commission, auditions, and greenlight remain
accepted queue admissions and never receive this object.

Unity consumes only the generated DTO. It strictly validates the wire, binds a
notice to the exact session/revision/week/digest, retains it through unchanged
polls, clears it on an accepted command/save/load or session epoch change, and
never invents a holder or remedy. Raw root `message` stays diagnostic-only. The
HUD renders `WHAT HAPPENED`, optional `CURRENT HOLDER`, and `WHAT NEXT`.

TypeScript files changed:

- `BRIDGE-README.md`
- `bridge/protocol.ts`
- `bridge/schema/bridge-schema.ts`
- `bridge/schema/project-studio-bridge.schema.json`
- `bridge/session.ts`
- `generated/unity/StudioBridgeDtos.Generated.cs`
- `tests/bridge-schema.test.ts`
- `tests/bridge.test.ts`
- the three campaign continuity documents

Unity files changed:

- `Assets/Studio/Runtime/Data/Generated/StudioBridgeDtos.Generated.cs`
- `Assets/Studio/Runtime/Data/StudioBridgeProtocol.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- new `Assets/Studio/Runtime/Infrastructure/StudioRejectionRetention.cs` and `.meta`
- `Assets/Studio/Runtime/Presentation/StudioBridgeProofRunner.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgeProtocolTests.cs`
- new `Assets/Studio/Tests/EditMode/StudioRejectionRetentionTests.cs` and `.meta`

Why: the player must see a durable, truthful explanation for a rejected action
after the next one-second poll. Unity may present the answer but may not derive
legality, holders, or remedies. Protocol moved from `2` to `3` because the
closed rejected-response envelope gained a required member; projection stayed
at `4` because the snapshot bundle did not change.

Relevant committed parents are TypeScript `85429f9d18e2b6321e21557bdb068b1047b4c452`
and Unity `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`. A4 commit SHAs do not exist
yet. Frozen authorities remain `f6606ac9db67dc70b12a7d247d74206571d12d2c`
and `d970b81c2b17383ee71c3c66a5622ecc140473b3`.

### What is working right now

Start the protocol-3 TypeScript authority:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run bridge
```

Open Unity:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

Build and launch the current native client:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a4-native-build.log \
  -quit

cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

- Bridge/runtime: localhost `127.0.0.1:4317`, two manually managed processes,
  in-memory session/save/replay. A4 does not claim Phase B lifecycle completion.
- Playable flow: construction, exact Movie #2 screenplay, auditions, evidence,
  package/greenlight, pre-production, blockers, load-in, shooting, save/load,
  post, release, stale rejection, and reconnect all work through TypeScript
  intents.
- Movie #2: `The Reluctant Cornerstone`, `script-0001`, `prod-0013`, released
  Week 22/revision 23 at digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Visual state: unchanged from M2. The retained rejection frame is clearer, but
  the campus still reads too much like a distant diorama and remains below ADR
  0006's inhabitable, two-scale, filmmaking-first acceptance target.

### Validation state

| Gate | Latest exact result |
| --- | --- |
| TypeScript full tests | 327 files; 4,452 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| Bridge typecheck | Passed |
| TypeScript production build | Passed; inherited chunk warnings only |
| Bridge/schema tests | 26/26 passed |
| Generated drift | Passed across schema, TS C# golden, and Unity generated copy |
| TypeScript Movie #2/determinism proof | Passed; final digest `429b88d5...3ed13`; export/import/headless parity true |
| Browser dependency audit | 0 browser-runtime vulnerabilities |
| Repository hygiene / adopted 3D assets | Both passed |
| Unity EditMode | 24/24; `/tmp/studio-a4-rejection-p1-seal-editmode.xml` |
| Native macOS build | Passed; 136,938,870 bytes; `/tmp/studio-a4-rejection-p1-native-build-final.log` |
| Native runtime playthrough | Fresh Movie #2 complete at Week 22/revision 23 |
| Native save/load | Saved/restored digest `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee` |
| Stale/retention proof | `state-stale`, non-empty blocker/remedy, null holder, unchanged revision 18/digest, later poll 11 to 12 |
| Native reconnect | Same session state at Week 22/revision 23/final digest |
| Performance | 119.3803 FPS proof; 118.9993 FPS reconnect on Apple M3 Max |
| Evidence | Ignored `Evidence/A4/Rejection-Guidance/`; 13 PNGs, 2 JSON reports |
| Visual evidence | `10b-stale-rejection-retained.png`, SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5` |
| Independent audit | No open P0 or P1 finding |

### Known problems and blockers

1. **Replay journal is process-memory-only - P1 resilience, pre-existing.**
   Reproduce by submitting a command, restarting `npm run bridge`, and trying
   the same identity: the 256-entry cache and session vanish. Save/load within
   one process passes. Do not move this data into `GameState` or V14 gameplay
   history; implement a bounded save-associated bridge journal.
2. **Runtime lifecycle is manual - P1 productization, pre-existing.**
   Reproduce by launching the native app without separately starting the bridge.
   No launcher-owned process, random capability token, durable disk save, or
   graceful coordinated shutdown exists. Do not expose a configurable network
   bind or arbitrary filesystem/command API.
3. **Unexpected HTTP 500 remains unstructured - P2 resilience, pre-existing.**
   The bounded command/control rejection contract is structured, but an
   unexpected server exception still returns the existing fatal response. Do
   not disguise an internal exception as a gameplay holder/remedy.
4. **Reason/category pairing is producer-tested, not schema-relational - P2.**
   Every mapping is exhaustively tested, but JSON Schema does not encode the
   cross-field pairing. Do not duplicate the mapping as gameplay logic in C#.
5. **Some Unity adapter negative branches lack direct tests - P2 test gap.**
   Wrong session/command/revision/week/digest branches are explicit; parser,
   retention, and native positive rejection coverage pass.
6. **Visual target is not met - P1 product quality, pre-existing.**
   Reproduce from any A4 overview capture. People/roles, filmmaking activity,
   materials, camera proximity, and Hero Stage 7 remain below ADR 0006. Do not
   polish the old fixed-diorama premise or import protected reference assets.
7. **Cross-repository contract CI is not automatic - P2 tooling.**
   TS CI verifies its golden, while the external Unity-copy path is checked
   locally. Do not hand-edit generated DTOs.

### Historical next exact action

Replace `BridgeSession`'s 256-entry memory-only replay map with a bounded,
save-associated command identity journal, then prove exact duplicate response
replay across authoritative save/load and a TypeScript engine process restart.

### Historical next 3-5 actions after that

1. Implement the Phase B one-command developer launcher with engine startup,
   random port/capability token, health/schema/session handshake, logs, graceful
   shutdown, and stale-process cleanup.
2. Add atomic disk-backed V14 save persistence and recovery without exposing
   arbitrary filesystem access through HTTP.
3. Prove engine restart detection, Unity reconnect, save/load during active
   production and construction, malformed protocol, and temporary outage.
4. Start the isolated `location-v1` two-scale camera experiment after the
   runtime foundation is durable.
5. Use the resulting inspection mode to begin Hero Soundstage 7's professional
   filmmaking vertical slice.

### Do not touch

- Frozen TypeScript authority, Unity adoption authority, architecture decision,
  M1/M2 tags, current IDs, RNG streams, V14 game truth, and Three.js oracle.
- Do not merge to main/C2, rebase, force-push, move/delete Golden tags, rewrite
  history, delete historical branches, or mass-clean repositories.
- Do not move gameplay legality/formulas/saves into C#, infer rejection facts in
  Unity, manually edit generated DTOs, or turn capacity queues into rejection.
- Do not adopt protected The Movies/Lionhead assets, buy assets, generate images,
  or commit the local fidelity PDF/evidence/build/cache/log outputs.
- Keep the unstructured HTTP 500 and launcher/security work isolated from this
  already validated A4 unit until after its checkpoint is sealed.

### Decisions made this session

- Protocol `3`, projection `4`: required rejection envelope is breaking; snapshot
  projection is unchanged. Reversible only through another coordinated protocol
  revision. Evidence: schema/generator/Unity/native gates.
- TypeScript owns category/blocker/holder/remedy; Unity only validates, retains,
  and renders. This is the frozen authority law, not optional.
- `currentHolder` is required-nullable and remains null until an exact causal
  world holder exists. Never select the first member of a plural queue.
- Raw rejection `message` is diagnostic-only. Red-team evidence showed revision
  jargon was unsuitable as player copy; final screenshot renders only structured
  guidance. Reversible presentation detail, authority boundary remains fixed.
- Same-state polls retain a notice; accepted operations/session changes clear it;
  mismatched authority tokens cannot replace it. Reversible lifecycle policy,
  backed by EditMode and native post-poll proof.
- A4 is not Golden while dirty. M2 remains CURRENT BEST pending exact commits,
  remote verification, and deliberate tagging.

### Uncommitted and generated material

- TypeScript tracked A4 source plus these three continuity docs are intentionally
  uncommitted. No unrelated tracked file is present.
- Unity tracked A4 source and two new source/meta pairs are intentionally
  uncommitted. `Builds/`, `Evidence/`, `Library/`, and `Logs/` remain ignored.
- Ignored current evidence: `Evidence/A4/Rejection-Guidance/`, including proof
  JSON SHA-256 `814009e4c5b1a0c2942fbbcf61bdcf1c28f25fb804e5ba70e7d3b6d9b13396a1`,
  reconnect JSON SHA-256 `bf6d70addc525e9a23acc67bdccc16afde1a43fd8f9aa28aba09249878f1e9c7`,
  and retained screenshot SHA above.
- Current logs: `/tmp/studio-a4-rejection-p1-seal-editmode.log`, matching XML,
  `/tmp/studio-a4-rejection-p1-native-build-final.log`,
  `/tmp/studio-a4-rejection-p1-native-proof-final.log`, and
  `/tmp/studio-a4-rejection-p1-native-reconnect-final.log`.
- `.tmp/3d-asset-audit.json`, `dist/`, `node_modules/`, native build, screenshots,
  JSON evidence, logs, caches, and local PDF are deliberately excluded.
- Local PDF: `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`,
  1,087,211 bytes, SHA-256
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.

### Recovery instructions

1. Read the architecture decision, ledger, this authoritative A4 section, and
   promotion register in that order.
2. Verify both recorded parent HEADs and dirty file lists with `git status`,
   `git rev-parse HEAD`, and the configured upstream refs. M2 tags must remain
   immutable/pushed.
3. Run the minimum smoke:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm run test:bridge
   npm run typecheck
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. If A4 is still uncommitted, do not restart implementation. Inspect the exact
   diff, preserve the validated generated copy, commit/push both repositories,
   verify remote SHAs and clean trees, then update all continuity documents and
   make the M3 Golden decision.
5. If A4 has been sealed by a later top-of-file section, follow that newer exact
   pair and its NEXT EXACT ACTION. Never infer the compatible pair from branch
   names alone.

A replacement agent can launch protocol 3, understand every passed and failed
gate, finish the A4 checkpoint without Owner reconstruction, and continue into
the replay journal. The older M2 handoff remains below for historical context.

## PRIOR GOLDEN M2 HANDOFF - HISTORICAL

Timestamp: 2026-08-21 00:12 CEST (UTC+02:00).

| Item | Exact state |
| --- | --- |
| TypeScript worktree | `/Users/bruce/The Movies - Unity Production Convergence 80H` |
| TypeScript branch | `campaign/unity-production-convergence-80h-ts` |
| TypeScript Golden M2 product SHA | `7d76951f6ad641e8940b97b03806b87638ed8ad8` |
| TypeScript Golden M2 parent | `7218368cddc46eaeb0fb99691489d457a89112d6` |
| TypeScript branch tip | The committed continuity declaration is `103ad1a4a55e27eb6ea3dff5ad10836d7b46a3aa`; this final CI note will create one more docs-only descendant. After that commit, `git rev-parse HEAD` is authoritative because a commit cannot embed its own resulting SHA. Every branch-tip commit after the Golden product SHA must remain documentation-only. |
| TypeScript pushed | Yes through product commit `7d76951f6ad641e8940b97b03806b87638ed8ad8`; the two local docs-only continuity commits are pending one final push. |
| TypeScript working tree | Only the three campaign continuity documents are dirty for the final CI note. Product source is committed. Expected clean after the docs-only commit/push. Ignored `node_modules/`, `dist/`, and `.tmp/` outputs remain local. |
| Unity worktree | `/Users/bruce/Project Studio - Unity Production Convergence 80H` |
| Unity branch | `campaign/unity-production-convergence-80h-client` |
| Unity HEAD | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity pushed | Yes; local, upstream, and remote campaign refs all resolve to `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` |
| Unity working tree | Clean. `Library/`, `Logs/`, `Builds/`, and `Evidence/` are ignored local outputs. |

Golden M2 is the declared exact compatible pair: TypeScript product
`7d76951f6ad641e8940b97b03806b87638ed8ad8` plus Unity
`a1c27318bec47f1abc4a29b77d9c413bdc8a8778`, under immutable annotated tag name
`golden/unity-convergence-m2` in each repository. Both annotated tag refs are
pushed and resolve to those exact product commits; a later docs-only TypeScript
branch tip does not move the Golden tag. Golden M2 supersedes M1 as CURRENT
BEST. Both `golden/unity-convergence-m1` tags remain preserved and immutable at
their original SHAs.

The compatible live contract remains protocol `2`, projection `4`, schema ID
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.

Remote default/canonical audit remains unchanged:

- TypeScript remote default `main` is
  `5914c84e453461240540184e79b2bd7eafeb647f`, historically diverged from the
  campaign. Do not merge the campaign into it casually.
- Unity remote default `unity-typescript-bridge-spike` is
  `626c2d3a25f21ebdbb2603939378368af925f18c`, a campaign ancestor.
- Neither campaign branch has been promoted to its remote default.

### M2 campaign status - historical

- Current phase: Phase A, productionize the TypeScript to Unity contract.
- Current subphase: A3 queue-law parity is sealed as Golden M2. Work now moves
  to TypeScript-owned structured guidance for genuine command rejections.
- Completed phases: campaign setup/baseline; A1 generated schema/DTO pipeline;
  A2 atomic named projection foundation; PR #5 donor review and current-architecture
  security/governance harvest.
- Partially completed phases: A3 commands have IDs, expected revisions, stale
  rejection, deduplication, explicit codes/messages, bounded response replay,
  and queue-admissible bridge/UI parity. Structured rejection guidance and
  durable replay remain. D through N retain inherited partial capabilities only.
- Untouched phases: Phase B durable local runtime and Phase C production client
  layering have not begun as campaign implementations.
- Current acceptance gate: add generated TypeScript-owned rejection categories
  and guidance, then prove Unity retains and renders only valid guidance across
  same-revision polls. Capacity remains queue admission, never a rejection.

### M2 what was just done - historical

#### Concise description

Committed and pushed A3 queue parity end to end at
`7d76951f6ad641e8940b97b03806b87638ed8ad8`. Commission, audition, and greenlight
intents remain available when both authoritative Development & Casting slots are
occupied. TypeScript accepts those commands into its existing deterministic
queue rather than the bridge or UI suppressing them as capacity failures. Exact
duplicate queued intents are rejected at the normal front door but dequeue
replay remains legal.

The retained Lot now distinguishes immediate acceptance from queue admission.
Queued screenplay and greenlight successors show truthful WHAT HAPPENED / WHY IT
MATTERS / WHAT NEXT copy, claim no premature project or production identity, and
fire no false immediate-commit/formation presentation.

The binding Visual Fidelity / Recognizability Ruling is encoded as ADR
`docs/adr/0006-visual-recognizability-and-two-scale-camera.md`. The approved
production direction is a coherent two-scale Unity camera and an inhabitable,
human-scale period studio, not a permanently high-angle diorama. This changes
the acceptance target, not simulation authority.

#### Files and systems changed

TypeScript product commit `7d76951f6ad641e8940b97b03806b87638ed8ad8`:

- `bridge/session.ts`: queue-admissible intent production independent of the
  guided journey; exact project/production routing; authoritative preflight;
  explicit accepted queue messages.
- `bridge/proof.ts`: centralized journey-intent selection rather than fixed
  commission-first proof priority.
- `src/core/productionQueue.ts` and `src/core/actions.ts`: exact queued
  commission/casting/greenlight duplicate guards while preserving dequeue.
- `src/core/scriptReadModel.ts`, `src/core/castingReadModel.ts`, and
  `src/core/firstFilmJourney.ts`: queue-aware legal actions, exact waiting
  states, and advance/cancel remedies without capacity-as-refusal.
- `ui/src/engine/`, `ui/src/screens/`, `ui/src/lot/`: queueable controls,
  casting/package precedence, retained queue receipts, fail-neutral malformed
  receipt behavior, and truthful Lot/world copy.
- `ui/src/lot/snapshot/queueAdmission.ts`: exact whole-successor witnesses for
  pool/original commission and greenlight queue admission. It replays the pure
  TypeScript action and requires byte-equivalent state rather than duplicating
  queue rules in presentation.
- Core, bridge, read-model, contention/property, React, retained-workspace, and
  snapshot tests were added or strengthened. Pressure harnesses now avoid
  resubmitting an already queued exact greenlight.
- `docs/adr/0006-visual-recognizability-and-two-scale-camera.md` and
  `docs/adr/README.md`: binding modern-The-Movies recognizability and two-scale
  camera direction.
- Campaign continuity documents form the docs-only follow-up being prepared now.

Unity tracked source: no file changed. The same Unity client was rebuilt and
revalidated against the A3 TypeScript authority.

#### Why

The previous bridge and presentation treated occupied capacity as if the
authoritative action were unavailable. That contradicted the permanent product
law "queue, don't forbid" and the core action implementation. It also produced
false retained-shell copy such as "GREENLIGHT ACCEPTED" when only a queue row
existed. A3 restores one authority: Unity/React submits intent, TypeScript either
commits or queues it, and every client presents that exact outcome.

The visual ADR is required because a technically correct high-angle campus can
still look like the wrong game. It preserves management readability while
requiring lower inspection/production framing, authored materials, believable
people, visible filmmaking, and period-studio UI identity.

#### Relevant commits

- Frozen TypeScript adoption authority:
  `f6606ac9db67dc70b12a7d247d74206571d12d2c`.
- Frozen Unity adoption authority:
  `d970b81c2b17383ee71c3c66a5622ecc140473b3`.
- A1 TypeScript implementation:
  `a7ceb56bbac6c2ceb0be534a5753f086c5d51401`.
- A1 Unity implementation:
  `7fb693c78da06cca1c8e688340241e1c9fa0b874`.
- A2 TypeScript implementation / preserved Golden M1:
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- A2 Unity implementation / preserved Golden M1 client:
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Donor harvest:
  `f1847f9ec33c5b206d6b4354c8e5ad170cbd8de2`.
- Donor CI correction:
  `38eb2d535b4c1da5c3c2908885c68227fb6ee0bc`.
- A3 parent:
  `7218368cddc46eaeb0fb99691489d457a89112d6`.
- A3 queue-parity product commit / Golden M2 TypeScript product:
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- Golden M2 Unity product:
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

No gameplay formula, GameState schema, protocol/projection version, RNG stream,
save version, existing identity, economy rule, construction rule, or Unity
simulation authority changed.

### M2 working state - historical

#### Launch commands

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

Build the current native client if the ignored app is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a3-native-build-seal.log \
  -quit
```

Launch the current native client after the bridge is live:

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
  -studioBridgeProofRoot '/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity' \
  -logFile /tmp/studio-a3-native-proof-final-seal.log
```

#### Bridge and runtime status

- No bridge or native process is intentionally running now.
- Bind remains localhost-only at `127.0.0.1:4317`; override through
  `PROJECT_STUDIO_BRIDGE_PORT`, `PROJECT_STUDIO_BRIDGE_URL`, or
  `-studioBridgeUrl`.
- Protocol `2`, projection `4`, and schema identity are unchanged.
- One atomic response still carries `lot`, `productions`, `people`,
  `construction`, `journeyNotices`, and `releaseResults`, plus root
  authority tokens and same-revision legal intents.
- Commission, auditions, and greenlight now remain available under occupied
  capacity and resolve through TypeScript queue admission.
- Lifecycle is still two manually managed processes. Session/save/replay state
  remains bridge-process memory; Phase B is not complete.

#### Current playable flow

The current native client completes screenplay, review, auditions, audition
evidence, editable casting/greenlight, pre-production, blockers, director call,
scenery load-in, shooting, save/load, post-production, release, construction,
stale-revision rejection, and reconnect through TypeScript-published legal
intents. Focused bridge/browser tests additionally prove contended commission,
audition, and greenlight queue admission and retained queue-aware presentation.

#### Current visual state

A3 did not change Unity visuals. The current client already uses perspective,
Cinemachine, orbit/pan/focus, textured and normal-mapped materials, eight
provenance-cleared Quaternius human variants, and Mecanim animators. Therefore
the local fidelity PDF's Three.js-specific primitive/texture counts are not a
literal Unity inventory.

The important critique remains valid: the standard pitch, narrow lens, focus
behavior, oversized proof HUD, sparse human-scale activity, weak role
readability, prototype weathering/lighting, and sparse Hero Soundstage 7 still
read as a managed diorama rather than an inhabitable filmmaking institution.
Focus changes pivot/distance but retains the high management pitch and lens.
The current visual state fails the new final visual target; do not claim A3 as a
visual improvement.

The next isolated camera experiment, after load-bearing runtime work, is
`location-v1`: keep overview pitch 46.5 degrees, yaw 38.5 degrees, FOV 36,
distance 155; use focus pitch 32 degrees, FOV 42, and distance
`clamp(diagonal * 1.45, 18, 72)`; preserve yaw, smooth transitions, and make
Home restore overview. Keep that experiment isolated from materials, lighting,
HUD, protocol, and simulation changes.

#### Current Movie #2 status

- Native proof: `complete`.
- Movie #2: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Saved/restored shooting digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale action: rejected with `STALE_REVISION`.
- Reconnect: a second native process recovered the same session at revision 23,
  Week 22, with the exact Movie #2 identity and final digest.

### M2 validation state - historical

| Gate | Latest accepted result |
| --- | --- |
| TypeScript full tests | 327 files passed; 4,450 passed, 5 skipped, 0 failed in 60.15 seconds; `/tmp/studio-a3-seal-final-full-tests.log` |
| Typecheck | `npm run typecheck` passed after the retained queue-receipt changes |
| Production build | Passed in 3.74 seconds; inherited large-chunk warnings only; `/tmp/studio-a3-build.log` |
| Bridge typecheck | `npm run typecheck:bridge` passed |
| Bridge tests | 24/24 passed across 13 bridge and 11 schema tests; `/tmp/studio-a3-bridge-tests.log` |
| Generated drift | Canonical schema, TypeScript C# golden, and Unity C# copy verified byte-identical |
| Browser dependency audit | Passed with 0 vulnerabilities |
| Full npm audit | Existing dev-graph advisories remain; no whole-product clean claim |
| Repository hygiene | Passed over 1,005 tracked/unignored files |
| 3D asset guard | 26 assets, 0 hard violations |
| Unity EditMode | Final seal 15/15 passed; `/tmp/studio-a3-editmode-results-seal.xml` |
| Unity PlayMode | No dedicated suite; native automation remains the runtime gate |
| Native build | Final seal success; 136,925,846 bytes; `/tmp/studio-a3-native-build-seal.log` |
| Runtime playthrough | Fresh native Movie #2 complete at Week 22/revision 23 with 11 milestones |
| Save/load | Exact saved and restored digest `5543ef56...` |
| Reconnect | Separate native process restored Week 22/revision 23/final digest; `12-reconnected.png` |
| Stale/duplicate commands | Native stale rejection passed; bridge replay/duplicate tests and front-door queued-duplicate tests passed |
| Determinism | Export/import/export, headless/bridge proof, save/load, and reconnect parity passed |
| Runtime console | No proof failure, error, exception, or protocol/schema mismatch; Unity emits known shutdown thread-finalization warnings on exit |
| Native A3 final-seal sample | 119.18 FPS; 15,394-byte snapshot; 18.52 ms serialization; 3.82 ms parse; 0.33 ms apply; 33.25 ms RTT |
| Reconnect final-seal sample | 119.19 FPS; 15,394-byte snapshot; 23.10 ms serialization; 3.96 ms parse; 4.44 ms initial apply; 33.20 ms RTT |
| Inherited baseline | 119.82 FPS; 8.32 ms median; 9.06 ms p95; 680 draw calls; 168,041 triangles; 412 MB working set |
| Screenshot/evidence root | `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/` |
| Product-SHA CI | GitHub Actions run `32422095175` passed every gate for `7d76951f6ad641e8940b97b03806b87638ed8ad8` in 9m36s |

Current accepted evidence:

- `Evidence/A3/Queue-Parity/bridge-client-proof.json`
- `Evidence/A3/Queue-Parity/bridge-reconnect-proof.json`
- `Evidence/A3/Queue-Parity/01-whole-lot.png` through
  `12-reconnected.png`
- `/tmp/studio-a3-seal-final-full-tests.log`
- `/tmp/studio-a3-bridge-tests.log`
- `/tmp/studio-a3-typecheck.log`
- `/tmp/studio-a3-bridge-typecheck.log`
- `/tmp/studio-a3-build.log`
- `/tmp/studio-a3-generated.log`
- `/tmp/studio-a3-hygiene.log`
- `/tmp/studio-a3-assets.log`
- `/tmp/studio-a3-browser-audit.log`
- `/tmp/studio-a3-editmode-results-seal.xml`
- `/tmp/studio-a3-editmode-seal.log`
- `/tmp/studio-a3-native-build-seal.log`
- `/tmp/studio-a3-native-proof-final-seal.log`
- `/tmp/studio-a3-native-reconnect-final-seal.log`
- `/tmp/studio-a3-proof.log`

### M2 known problems / blockers - historical

#### 1. Structured rejection guidance is not yet a generated contract

- Exact defect: genuine command failures expose code/message but no typed
  TypeScript-owned category, holder, remedy, or action guidance that Unity can
  retain across same-revision polls.
- Severity: High for the next Phase A contract unit and player-legible negative
  paths; Golden M2 queue behavior itself is accepted.
- Reproduction: inspect bridge rejection response/schema and Unity rejection
  handling; trigger a legal command that fails for a non-capacity reason, then
  poll the unchanged revision.
- Origin: Pre-existing adoption gap, not an A3 queue regression.
- Attempted fixes: A3 first removed capacity from the rejection category and
  made queue acceptance truthful. Existing codes/messages, stale rejection, and
  fail-neutral UI behavior remain.
- Must not be tried again: do not call capacity a rejection; do not infer holder
  or remedy in C#; do not invent a singular holder where queue authority is
  plural.

#### 2. Replay durability remains process-memory-only

- Exact defect: command response replay is bounded to 256 in-memory identities
  and does not survive bridge restart.
- Severity: High resilience gap before product runtime packaging.
- Reproduction: exceed the cache or restart the bridge, then resubmit a prior
  command ID.
- Origin: Pre-existing bridge proof boundary.
- Attempted fixes: command/session IDs, exact expected revision, deterministic
  in-cache replay, and duplicate tests pass.
- Must not be tried again: do not weaken stale/digest checks, use an unbounded
  cache, or write a Unity-side command ledger.

#### 3. Runtime lifecycle and save persistence remain experimental

- Exact defect: fixed default port, two manual processes, memory-only
  session/save/replay state, no launcher, restart recovery, stale-process
  cleanup, integrated logs, graceful shutdown, or disk-backed save abstraction.
- Severity: High product lifecycle gap; current developer proof works.
- Reproduction: save, terminate the bridge, restart, and observe a new in-memory
  authority.
- Origin: Phase B untouched.
- Attempted fixes: health/schema/session handshakes and client reconnect while
  the same engine remains alive.
- Must not be tried again: no public bind, arbitrary filesystem/command bridge,
  persistent/logged capability token, or claim that in-process JSON is durable.

#### 4. Projection decomposition remains incomplete

- Exact defect: the six atomic sections are still coarse for screenplay,
  casting, package/greenlight, detailed results, and structured notices/remedies.
- Severity: Medium maintainability/client-workspace gap.
- Reproduction: compare the projection bundle to the Phase A2 named surface list.
- Origin: Deliberately bounded A2 foundation.
- Attempted fixes: atomic same-revision bundle and stable-ID Unity store pass.
- Must not be tried again: no independently polled revision clocks, title/index
  routing, or second presentation-owned simulation model.

#### 5. Current visuals still fail the new recognizability gate

- Exact defect: high management framing persists into focus, serialized home
  distance and controller limits disagree, the 520-pixel proof HUD dominates,
  people/activity are weak at human scale, and Hero Soundstage 7 remains sparse.
- Severity: High product-identity gap; no functional regression.
- Reproduction: inspect A3 overview, blocker, shooting, and release captures;
  focus a production and compare with the binding visual ruling.
- Origin: Pre-existing Unity spike art/camera boundary, unchanged by A3.
- Attempted fixes: audit only; ADR 0006 defines the two-scale target and a
  reversible `location-v1` experiment.
- Must not be tried again: do not reopen Unity versus Three.js, copy Lionhead
  assets/layout/UI, fabricate production activity, perform a blanket asset
  rewrite, or move simulation truth into Unity.

#### 6. Cross-repository generated-copy CI is not automatic

- Exact defect: TypeScript CI checks its C# golden but cannot see the Unity repo
  without an explicit `--unity-project` path.
- Severity: Medium drift risk; current copies are byte-identical.
- Reproduction: run contract check without the Unity path.
- Origin: Separate-repository topology.
- Attempted fixes: deterministic cross-repo check and Unity strict fixtures.
- Must not be tried again: never hand-edit generated C# or add another mirror.

#### 7. Canonical promotion remains deferred

- Exact defect: TypeScript default and campaign histories remain a semantic
  mega-diff; Unity alone is incompatible with default TypeScript.
- Severity: High release-management risk, not a runtime defect.
- Reproduction: compare campaign branches with recorded remote defaults.
- Origin: Historical repository topology.
- Attempted fixes: immutable M1 tags plus the explicit Golden M2 compatible pair.
- Must not be tried again: no unilateral default merge, rebase, force push,
  generated-DTO-only cherry-pick, or Golden tag movement.

#### 8. Development dependency and localhost security boundaries remain

- Exact defect: browser runtime audit is clean, but the dev-run bridge graph
  still has advisories and lacks per-launch capability, strict Host/Origin and
  content-type gates, and request/header timeouts.
- Severity: High before packaged Phase B; bounded for local developer use.
- Reproduction: run full `npm audit` and inspect `bridge/server.ts`.
- Origin: Pre-existing runtime boundary.
- Attempted fixes: least-privilege CI, repository hygiene, browser audit,
  explicit `vite-node`, and safe `nanoid` patch.
- Must not be tried again: no `npm audit fix --force`, false clean claim,
  browser-only threat model, or non-localhost bind.

No unresolved Owner-decision item blocks the next action.

### M2 next exact action - historical

Implement TypeScript-owned structured rejection categories and actionable
guidance in the bridge protocol/schema, regenerate the TypeScript C# golden and
Unity DTO copy, then make Unity retain and render only schema-valid rejection
guidance across same-revision polls. Run `npm run test:bridge`, bridge
typecheck/generated drift checks, and Unity EditMode negative-path tests.

### M2 next 3-5 actions - historical

1. Replace the 256-entry memory-only replay eviction boundary with a bounded,
   save-associated command identity journal; prove duplicate commands remain
   deterministic across save/load and engine process restart.
2. Begin Phase B with a start/stop-capable localhost runtime, ephemeral-port
   discovery, per-launch capability, Host/Origin/content-type enforcement,
   request/header timeouts, save-path abstraction, useful logs, and graceful
   shutdown.
3. Add engine restart detection/reconnect and prove disk-backed recovery through
   a native Unity restart and active-production save/load playthrough.
4. Run the isolated `location-v1` two-scale camera experiment, capture control
   and candidate evidence under `Evidence/I1/Camera-Fidelity/`, and accept it
   only if management readability, human-scale framing, clipping, performance,
   and veteran-recognizability gates pass.
5. Refactor the winning Unity client into explicit runtime/session, projection
   store, presentation, interaction, and UI layers without changing simulation
   truth.

### M2 do-not-touch record - historical

- Frozen authorities `737bbe1f`, `f6606ac9`, `d970b81c`, and
  `82c9486a`.
- Existing `golden/unity-convergence-m1` tags; never move or delete them.
- The declared `golden/unity-convergence-m2` product pair. Publish each tag at
  its exact product SHA during the final seal, then never move or delete it.
- TypeScript ownership of GameState, legality, economy, time, RNG, saves,
  migrations, identities, outcomes, production/construction rules, and
  progression truth.
- The authoritative core queue laws now proven by A3. Capacity queues; it is not
  a rejection. A queued intent holds nothing and is revalidated at dequeue.
- Three.js as preserved reference/regression oracle/fallback.
- Permanent IDs, deterministic RNG streams, V14 history, or Owner-set product
  laws.
- Protected/Lionhead assets, unclear-license donors, purchases, or generated
  imagery.
- Generated C# by hand. Change TypeScript schema, regenerate, and verify both
  repositories.
- `StudioOfflineLotSnapshot` semantics merely to simplify the live bundle.
- Local ignored `Evidence/`, `Builds/`, `Library/`, `Logs/`,
  `node_modules/`, `dist/`, `.tmp/`, `/tmp`, or the local PDF as tracked
  source.
- The `location-v1` camera experiment must remain isolated from protocol,
  simulation, material, lighting, and HUD changes until its camera hypothesis is
  measured.
- Remote defaults/historical branches before deliberate promotion validation.
- Localhost-only bridge security boundary.

### M2 decisions - historical

| Decision | Reason | Reversible | Supporting evidence |
| --- | --- | --- | --- |
| Preserve capacity as queue admission across bridge and UI | Core TypeScript already owns the permanent queue law; suppressing the intent contradicted authority | The implementation is reversible; the product law is not | Queue-admission core tests, bridge contention tests, retained UI tests |
| Centralize exact journey-intent routing | Fixed commission-first proof priority could choose the wrong exact project/production | Yes | Bridge Movie #2 and opaque-identity tests |
| Guard exact duplicate queued intents at normal front doors, not dequeue | Rapid/stale client resubmission must not clone queue rows, while the existing row must still commit later | Yes internally | Commission/casting/greenlight duplicate and dequeue tests |
| Treat queue success as its own retained presentation | A queue row creates no project/production identity and holds no cash/talent/facility | Yes if equivalent truthful UX replaces it | Whole-successor queue witnesses and App-authority tests |
| Use whole-state pure replay to witness retained queue success | Reusing the TypeScript action avoids a presentation-side queue formula | Yes | Malformed/tampered/stale/null tests |
| Keep protocol 2/projection 4 for A3 queue parity | Wire shape did not change | Yes only through explicit future migration | Generated drift and v4 native proof |
| Ratify visual recognizability and a two-scale camera as binding | A readable diorama can still evoke the wrong game; management and emotional proximity are both required | Supersedable by later ADR, not casually ignored | Owner ruling, local fidelity PDF, Unity code/capture audit |
| Treat PDF numeric Three.js inventory claims as reference-specific | Current Unity already has perspective, Cinemachine, textured materials, humans, and animators | Yes with new evidence | Unity source and A3 capture audit |
| Declare Golden M2 and supersede M1 as CURRENT BEST | The pushed A3 product closes a permanent queue-law/client-parity defect while preserving Movie #2, determinism, native performance, and architecture | No tag movement; a later Golden may supersede it | Product SHA `7d76951...`, Unity `a1c273...`, final full/native seal |
| Preserve Golden M1 | M2 supersession must not erase the prior recovery point | No; tags are immutable | Existing M1 tag pair remains at `cd2b158...` / `a1c273...` |
| Keep promotion status `GOLDEN — CONTINUE CAMPAIGN` | Structured rejection guidance, durable runtime/restart recovery, canonical-history reconciliation, and visual floor remain unfinished | Yes after stronger evidence | Known blockers and unchanged defaults |

### M2 uncommitted / generated material - historical

#### TypeScript continuity tail

- Golden M2 product source is committed and pushed at
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`, parent
  `7218368cddc46eaeb0fb99691489d457a89112d6`.
- Only these tracked continuity files are dirty now:
  `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H.md`, this handoff, and
  `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H-PROMOTION.md`.
- No product source or untracked source remains outside the product commit.
- After the continuity commit, the TypeScript branch tip will be a docs-only
  descendant of the Golden product SHA. Use `git rev-parse HEAD` for that branch
  tip; keep `golden/unity-convergence-m2` pinned to `7d76951...`.
- Checked-in generated schema and TypeScript-side C# golden remain intentional
  tracked source; A3 did not change their bytes.
- `node_modules/`, `dist/`, and `.tmp/3d-asset-audit.json` are ignored and
  regenerated locally.

#### Unity ignored material

- Tracked Unity source is clean at
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- `Builds/macOS/Project Studio Visual Spike.app`: ignored final-seal native
  build, 136,925,846 bytes.
- `Evidence/A3/Queue-Parity/`: ignored, approximately 16 MB, 12 PNGs and 2
  JSON reports.
- `Evidence/A2/`, `Evidence/A1/`, and `Evidence/Baseline/`: ignored prior
  evidence.
- `Library/` and `Logs/`: ignored Unity cache/logs.

#### Local visual-fidelity source

- `/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`
- Size: 1,087,211 bytes.
- SHA-256:
  `692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
- This is local reference input, deliberately excluded from Git. Do not adopt
  protected The Movies screenshots/assets into production or source control.

#### Machine-local logs/evidence

- `/tmp/studio-a3-seal-final-full-tests.log`
- `/tmp/studio-a3-bridge-tests.log`
- `/tmp/studio-a3-typecheck.log`
- `/tmp/studio-a3-bridge-typecheck.log`
- `/tmp/studio-a3-build.log`
- `/tmp/studio-a3-generated.log`
- `/tmp/studio-a3-hygiene.log`
- `/tmp/studio-a3-assets.log`
- `/tmp/studio-a3-browser-audit.log`
- `/tmp/studio-a3-editmode-results-seal.xml`
- `/tmp/studio-a3-editmode-seal.log`
- `/tmp/studio-a3-native-build-seal.log`
- `/tmp/studio-a3-native-proof-final-seal.log`
- `/tmp/studio-a3-native-reconnect-final-seal.log`
- `/tmp/studio-a3-proof.log`
- `/tmp/studio-a3-headless-proof.json`
- Superseded but deliberately retained diagnostics:
  `/tmp/studio-a3-3d-audit.log`, `/tmp/studio-a3-full-tests.log`,
  `/tmp/studio-a3-editmode-results.xml`, `/tmp/studio-a3-editmode.log`,
  `/tmp/studio-a3-final-full-tests.log`,
  `/tmp/studio-a3-generated-check.log`,
  `/tmp/studio-a3-native-build.log`,
  `/tmp/studio-a3-native-proof.log`,
  `/tmp/studio-a3-native-proof-postbuild.log`,
  `/tmp/studio-a3-native-proof-seal.log`,
  `/tmp/studio-a3-native-reconnect.log`,
  `/tmp/studio-a3-native-reconnect-postbuild.log`,
  `/tmp/studio-a3-native-reconnect-seal.log`,
  `/tmp/studio-a3-queue-proof.json`,
  `/tmp/studio-a3-repo-hygiene.log`, and
  `/tmp/studio-a3-seal-full-tests.log`.

No screenshot, native build, local PDF, token, secret, cache, or temporary report
is intended for the checkpoint commit.

### M2 recovery instructions - historical

1. Read, in order:
   - `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`
   - `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H.md`
   - this handoff
   - `docs/campaigns/UNITY-PRODUCTION-CONVERGENCE-80H-PROMOTION.md`
2. Verify the recorded committed heads, remote refs, Golden tags, and worktrees:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse hspector-github/campaign/unity-production-convergence-80h-ts
   git rev-parse golden/unity-convergence-m1
   git rev-parse 'golden/unity-convergence-m2^{}'
   git merge-base --is-ancestor \
     7d76951f6ad641e8940b97b03806b87638ed8ad8 HEAD
   git diff --check

   cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   git status --short --branch
   git rev-parse HEAD
   git rev-parse origin/campaign/unity-production-convergence-80h-client
   git rev-parse golden/unity-convergence-m1
   git rev-parse 'golden/unity-convergence-m2^{}'
   ```

   The TypeScript branch tip may be a docs-only descendant and is whatever
   `git rev-parse HEAD` reports after the continuity commit. It must descend from
   product SHA `7d76951...`; the M2 tag itself must dereference exactly to that
   product SHA. The Unity branch and M2 tag both resolve to `a1c273...`. Local,
   upstream, and remote branch refs must agree, and both worktrees should be clean.
3. Run the minimum Golden M2 smoke before modifying it:

   ```bash
   cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
   npm run test:bridge
   npm run typecheck
   npm run typecheck:bridge
   npm run check:bridge-contract -- \
     --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
   ```

4. Launch Golden M2 with `npm run bridge`, then the ignored native
   app command above. Confirm protocol 2/projection 4 and exact Movie #2 release
   at Week 22/revision 23. The accepted evidence is already under
   `Evidence/A3/Queue-Parity/`.
5. Verify GitHub Actions run `32422095175` remains successful for the exact
   Golden TypeScript product SHA. Do not rerun it or weaken any gate merely to
   obtain another green result.
6. Perform NEXT EXACT ACTION. Do not repeat A1/A2 research, reopen Unity versus
   Three.js, hand-mirror DTOs, encode remedies in C#, reinterpret capacity as a
   rejection, or ask the Owner to reconstruct history.

A replacement agent with no chat history can now verify both repositories,
launch the current best build, understand the accepted Golden M2 product and its
remaining defects, preserve the local evidence, and continue from the exact
next action.
