# Unity Production Convergence 80H - Promotion Register

This file is the authoritative answer to: **What is currently the best version
of Project: Studio, and is it ready for promotion?** Preserve every Golden tag.
Do not infer a compatible TypeScript/Unity pair from branch names alone.

## CURRENT BEST PROJECT: STUDIO - GOLDEN M5

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `e5e95e54dc45252433bf96a75349f336df8dc875` | `golden/unity-convergence-m5` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `4770e22955f2fae770445065c2bf782ef251496e` | `golden/unity-convergence-m5` |

This exact pair is the sole CURRENT BEST build-from and recovery authority.
Both annotated M5 tags are pushed and remote-verified:

- TypeScript tag object
  `6dbd1f22802e8f39599b0545751be901a176f081` peels to
  `e5e95e54dc45252433bf96a75349f336df8dc875`.
- Unity tag object `1775a85b0c0538ef417bbe1ee4adc194e727d0c8`
  peels to `4770e22955f2fae770445065c2bf782ef251496e`.

M5 supersedes M4 without moving or deleting any prior tag. M1-M4 remain
immutable historical recovery points. M5 is Golden and passes ADR 0006, but it
is deliberately **non-canonical** and is not ready for canonical merge review.

The TypeScript M5 SHA is the pushed CP19 continuity/authorization commit,
direct child of `54035f6e8df6ef280b02c617c80f9560509ff18b`; it changes no TypeScript
product source. The Unity M5 SHA is direct child of CP16
`e1cfa2a1dc1da7b2be8214d587fac60d444b0603`. The documentation-only commit
that records this final promotion must be the direct child of TypeScript
`e5e95e54...`; it is continuity, not the M5 tag target. Resolve its self SHA
after commit and require HEAD/configured-upstream/live-remote equality plus a
clean tracked tree after push.

M5 remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated TypeScript/Unity DTO copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
TypeScript remains sole simulation authority.

### Current Golden tags

- M5 TypeScript: `golden/unity-convergence-m5` -> `e5e95e54...`.
- M5 Unity: `golden/unity-convergence-m5` -> `4770e229...`.
- Preserved M4 TypeScript: `golden/unity-convergence-m4` -> `11e2cf88...`.
- Preserved M4 Unity: `golden/unity-convergence-m4` -> `6b323354...`.
- Preserved M3 TypeScript/Unity: `e9c6f06b...` / `40465d48...`.
- Preserved M2 TypeScript/Unity: `7d76951f...` / `a1c27318...`.
- Preserved M1 TypeScript/Unity: `cd2b1587...` / `a1c27318...`.

### Why M5 supersedes M4

M5 retains M4's deterministic V14 authority, exact-retry journal, authenticated
supervisor, one-command lifecycle, Movie2, save/load/reconnect, killed-engine
continuity, and immutable identity. It then accumulates the bounded Unity
campaign through CP19:

- authoritative Stage/Admin physical joins and two-scale Cinemachine
  inspection with collision recovery and an in-product compact Back path;
- an authored Stage 7 interior with period material treatment, five exact
  operating states, 12 readable production roles, three held filmmaking props,
  shooting lights/practicals, working-set backs, load-in, clearing, and Dark;
- schema-4 screen-space proof for exact role/prop/framing pixels, visibility,
  overlap, edge, backdrop, luma, state, effects, critical roots, and no
  presentation POSTs;
- a portrait composition that raises role union from CP16 `.225118488` to
  `.304502368` under a strengthened `.27` product gate while preserving the
  accepted landscape first read; and
- an exact supported Load-in Pallet contract that closes CP18's failed viewport
  edge, without changing TypeScript authority or stage-state law.

Independent both-aspect review accepts portrait and equal-or-better landscape,
finds no P0/P1, and rules that M5 satisfies ADR 0006. That visual success, on
top of inherited M4 runtime strength, makes M5 the obvious build-from product.

### Exact M5 product delta

The Unity commit changes exactly nine paths: Stage activity/architecture
authoring, scene validation, inspection profile, Stage visual proof contract,
canonical scene, and three focused EditMode test files. The accepted values are
portrait camera `(46.2,3.45,22.8)` -> `(48.1,4.1,38.2)` at FOV `46`; six
floor-framing children at permanent `+2.50` local Z; portrait union gate
`.22 -> .27`; and Load-in Pallet Y `.35 -> .69` while retaining `(48,31)`,
yaw `18`, scale `1.65`, exact prefab, parent, identity, material, and state.

The final scene SHA-256 is
`79b5c1cb5293772453879be03942df9df30268338724bacda8e1a547e3f373af`.
The NavMesh remains byte-identical at
`20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04`.

### Validation summary

- Two final canonical runs each pass 32 people, 10 vehicles, 16 equipment,
  four captures, zero errors/warnings. Raw scene SHA-256 values
  `2ec501d7...` / `79b5c1cb...` differ only by Unity-local IDs/order; both have
  6,588 semantically/contract-equivalent records. No universal normalized SHA
  is claimed.
- Unity EditMode passes 197/197; native macOS build succeeds at 183 files /
  151,509,142 bytes.
- TypeScript bridge passes 11 files / 100 tests; full suite passes 336 files /
  4,526 tests with 5 skipped. Both typechecks, contract drift, production build,
  hygiene 1,032, assets 26/0, and browser production audit 0 pass.
- Both schema-4 Stage reports complete all five milestones at 1440x900 and
  390x844, accept 18/18 intents, emit zero unexpected/presentation POSTs, and
  leave all critical-root edge/outside lists empty.
- Both schema-1 camera journeys, exact Movie2, save/load, reconnect, actual
  killed-engine replacement, stable checkpoint, Git scope, and exact cleanup
  pass.

### Accepted evidence

Stage report SHA-256 values:

- portrait, 380,839 bytes:
  `a5da02b556bb36138e13c248f1f0cea037088ffd2f4a670a0ed6458c7642d49a`;
- landscape, 382,208 bytes:
  `271e6f7b82c11234a2ea48dd0e28b644406dc0f3c6735181019068053e5b1cfb`.

Both end revision `18`, Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Role counts are `12/12/12/8/0`; held props `0/0/3/0/0`. Portrait role union
is `.304502368`, LoadIn min/median visible fractions
`.761954784/.899288893`, overlap `.229637414`, edge `7px`. Landscape union
is `.283333331`, LoadIn fractions `.721335709/.830210865`, overlap
`.278664291`, edge `142px`. All inherited gates pass.

Camera report SHA-256 values are
`9ae6bfcb02c069538303e6f057c2123177c556f7314a1f2d4c0ca0ccf6acb6aa` /
`5a386c65b2a76fcca373fd875861d592be700bf63afe364f1dae71cb625614b3`.

Regression report/frame SHA-256 values:

- Movie2:
  `ff496335150a8b4d7a196d0eaa6a1ac608d523d3f95c2862e263c8a32c1277c1` /
  `ba3dc5f88b53acb70215bd53bdd5d28eac33384e37acf2146b92a13310e8caf1`;
- reconnect:
  `3f07791bc3e50cd48dbd5f0b8a394567495c3f080cb634d9a73e3bd186868075` /
  `b79810d62fa1493ad76499688288d6cbfb081fcd795d2ad9c0a8ac81dc840481`;
- restart ready/report/frame:
  `81057de110ff134065f3baf0d80038903687a4f62f543e209835be33ecbde341` /
  `57bc2a2c1e7e129c3ae461a5adf6a34abed2f083cb740a594bbc2aa3fd7ecdbe` /
  `5a5a49e0f2bc6b5549857e3e8f9131841447cfb4a6f2d2037d0a9e7bbf879807`.

The exact Movie2 identity is `The Reluctant Cornerstone`, `script-0001`,
`prod-0013`; final revision/week/digest is `23` / `22` /
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
Saved/restored digest is
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
Stable checkpoint is 1,354,903 bytes, 25 journal entries, SHA-256
`2a3f7f35ece6ae7e01f739a9678df3b34c79d325f5fb66acb468fcd4f27d4fa8`.

### Known P2 boundaries

No P0/P1 remains. M5 is not canonical because:

- the launcher still uses the pinned `vite-node` development graph; emitted
  production packaging/direct packaged audit remain;
- TypeScript `main` requires deliberate isolated semantic reconciliation;
- camera proof records `externalActivationRequired=false`, so no physical
  foreground mouse/touch activation is claimed;
- restart-only metadata leaves identity blank and
  `exactMovie2Released=false`, although its released ordinal-2 milestone and
  restart invariants pass;
- pallet automation proves vertical contact, not full footprint containment;
  the frozen geometry overlaps the Dolly Platform by `45.36%` in X and `100%`
  in Z, and native visual review accepts that support;
- upper-ceiling/batten emphasis, pallet contact shadow, and scenery-flat depth
  remain optional polish; and
- 25/50/100 scalability and the broader ugly-condition matrix remain open.

### Promotion decision and next action

Golden M5 is sole CURRENT BEST, supersedes M4, and is exactly recoverable from
the two M5 tags. It is not canonical and not ready for canonical merge review.

Continue only with bounded P2 packaging, emitted-graph audit, isolated
TypeScript-main reconciliation, real foreground input proof, scalability, and
non-regressive polish. Keep all M1-M5 tags immutable. Every new slice is
non-Golden by default; do not invent, create, or move M6 without a later full
independent Golden ruling.

## CHECKPOINT 21 SEALED EMITTED PRODUCTION STUDIO GRAPH - NON-GOLDEN

Promotion status: **NOT PROMOTED — GOLDEN M5 REMAINS CURRENT BEST**

CP21 (TypeScript `ea940aec4f7e13434ab8df855f221c9387515dfa`, Unity unchanged
at CP20 `2b1562f80b7d8645765f5506a0deaf147f6aeb9e`) productionizes the local
engine launcher: `npm run play` emits `dist/studio/{studio.mjs,engine.mjs}`
(esbuild-pinned, byte-identical across rebuilds), passes the fail-closed
packaged-graph audit (78 first-party inputs, zero `node_modules`, only
`node:` externals, no development loader), and supervises the emitted engine
(`graph=emitted`). Native proof: schema-7 bridge client proof complete on the
packaged runtime through the real owner launcher (report SHA-256
`8e72c6f29308d4da62b8cd873f2e1a7fa06e5358033207109c9a8db7e7d0b96f`), with the
deterministic raw-founding opening digest identical to the development graph.
Simulation authority, protocol, schema, and the M5 tags are unchanged. CP21
is deliberately non-Golden; no M6 exists.

## CHECKPOINT 20 SEALED GENUINE FOREGROUND PLAYER JOURNEY - NON-GOLDEN

Promotion status: **NOT PROMOTED — GOLDEN M5 REMAINS CURRENT BEST**

CP20 is the sealed, validated, pushed campaign tip on both moving branches:
TypeScript `5eb80ed472093d63a5e9cf7d4c40998fcc934f89` (direct descendant of
the M5 docs child `37aa4a87...`) and Unity
`2b1562f80b7d8645765f5506a0deaf147f6aeb9e` (direct descendant of Unity M5
`4770e229...`). It ships the raw Week-0 founding workflow, player-workflow
facts, the semantic `_Loop` animation import, the Boom Operator mark
`49.09 X`, raw-founding proof preludes, the owner launcher, and — closing the
M5 P2 item for mouse input — the genuine foreground PlayerJourney proof:
schema-2 `complete`, 49 GUI attempts = 49 accepted,
`zeroProofDirectSubmissions=true`, driven end-to-end by OS-level HID mouse
events into the frontmost supervised player on an unlocked console
(report SHA-256
`d9c90971d2a011ec19ef9469858764b0761299598ec80249fc1eb80b4ad460f0`).

CP20 is deliberately **non-Golden**: no independent full Golden ruling was
run for it, no M6 tag exists, and M1-M5 remain immutable. Promotion beyond M5
requires a later complete independent Golden ruling under the standing
discipline. Contract at CP20: protocol `4`, projection `4`, schema
`sha256:f84ae77ec59a0d7ca7cdd89115456504ddecbde2c6e3839936e4951bd65bce61`,
DTO pair `6bb61749...`; this supersedes the M5 schema id only on the moving
branches, never on the M5 tags.

## PRIOR GOLDEN M4 REGISTER - HISTORICAL

This section preserves M4 exactly as the CURRENT BEST decision stood before
M5. All unqualified CURRENT BEST and no-M5 statements below are historical and
superseded by the M5 authority above; the M4 tags themselves remain immutable.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` | `golden/unity-convergence-m4` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | `golden/unity-convergence-m4` |

This exact pair was the sole CURRENT BEST recovery answer. Both annotated M4
tags are pushed and their remote dereferences were verified at the exact SHAs
above. Both campaign branches have advanced to the non-Golden Checkpoint 13
pair recorded below; those moving tips do not replace the tagged M4 product
SHAs. Continue bounded campaign work from Checkpoint 13, but recover/build M4
only from both tags. Never mix sides.

M4 remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated TypeScript/Unity C# copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
TypeScript remains sole simulation authority.

### Historical M4-era Golden tags

- M4 TypeScript: `golden/unity-convergence-m4` ->
  `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`.
- M4 Unity: `golden/unity-convergence-m4` ->
  `6b32335447848ed0680eb8077e78ee36aded5d56`.
- Preserved M3 TypeScript: `golden/unity-convergence-m3` ->
  `e9c6f06b717a6a106281b189a61072e35770155f`.
- Preserved M3 Unity: `golden/unity-convergence-m3` ->
  `40465d48c191c9dcdda2c6b32c17c9675f4908a4`.
- Preserved M2 TypeScript: `golden/unity-convergence-m2` ->
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- Preserved M2 Unity: `golden/unity-convergence-m2` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Preserved M1 TypeScript: `golden/unity-convergence-m1` ->
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- Preserved M1 Unity: `golden/unity-convergence-m1` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

M4 superseded M3 as CURRENT BEST. No prior Golden tag was moved or deleted.

### Parent and base SHAs

| Component | Direct parent | Implementation parent / frozen campaign base |
| --- | --- | --- |
| TypeScript authority | `e6421dcd51c7b64071b8be227f0950129634ff35` | Implementation commit parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; frozen base `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `94e8bcac6a5bf94fd70f3f8a61992511230688a2` | Frozen base `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

TypeScript M4 contains two product commits after the prior continuity tip:
`e6421dcd...` implements the lifecycle; direct child `11e2cf88...` makes its
Linux test evidence publication-exact and race-correct without changing
runtime product source.

### Why M4 is better than M3

M4 preserves M3's Movie #2, queue-law, deterministic V14, identity, structured
rejection, and native visual floor, then accumulates three durable Phase B
improvements:

- Checkpoint 8 adds an authenticated capability boundary, durable current/saved
  authority, stable logical session, incarnation identity, and safe restart;
- Checkpoint 9 adds byte-exact bounded retry for ambiguous committed
  `/command`, `/save`, and `/load` responses, with the durable journal proving
  one mutation and an exact replay after engine loss;
- Checkpoint 10 makes those capabilities one usable product: `npm run studio`
  owns a stable private profile, fresh per-launch capability, random initial
  loopback port, pinned replacement port, authenticated readiness, direct
  engine/Unity children, process-incarnation leases, stale cleanup, automatic
  restart, graceful shutdown, and bounded redacted logs;
- exact Linux CI now covers the supervisor and `flock` owner-lock path rather
  than leaving that portability boundary source-audited only;
- one command launches the compatible client and authoritative engine while
  the stable profile preserves current and explicitly saved V14 authority
  across full application exits.

No gameplay formula, `GameState` field, V14 save shape, RNG stream, permanent
identity, economy/construction rule, art, or simulation authority moved into C#.

### Exact M4 recovery and launch

Create isolated worktrees at both immutable M4 tags; the advanced campaign
worktrees are not exact M4:

```bash
git -C '/Users/bruce/The Movies - Unity Production Convergence 80H' \
  worktree add --detach /tmp/project-studio-golden-m4-ts \
  golden/unity-convergence-m4
git -C '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  worktree add --detach /tmp/project-studio-golden-m4-unity \
  golden/unity-convergence-m4
cd /tmp/project-studio-golden-m4-ts
npm ci
```

Build the exact M4 Unity client:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath /tmp/project-studio-golden-m4-unity \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-golden-m4-native-build.log \
  -quit
```

Launch exact M4 from the detached tag worktrees with one command:

```bash
cd /tmp/project-studio-golden-m4-ts
npm run studio -- \
  --unity-project /tmp/project-studio-golden-m4-unity
```

The exact immutable recovery authority is the M4 tag pair above. The advanced
campaign worktrees launch Checkpoint 13 and must not be described as exact M4.

### Validation summary

- Final exact-product GitHub Bridge contract run `32447981439` passed every
  step at TypeScript M4 `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6`
  in 12m27s, including Linux supervisor/`flock`, typechecks, build, hygiene, and
  adopted assets.
- Full TypeScript suite: 336 files, 4,524 passed, 5 skipped, 0 failed.
- Bridge aggregate: 98/98 across 11 files, including exact engine-publication
  parsing and race-correct Linux shutdown cleanup.
- Generated drift, protocol/schema identity, Movie #2/determinism proof, V14
  export/import/headless parity, stale/duplicate protection, and polling
  neutrality passed.
- Browser production dependency audit: 0. Repository hygiene passed. Adopted
  3D assets: 26, with 0 hard violations.
- Full development graph audit separately reports five advisories: 3 moderate,
  1 high, 1 critical. This remains a packaging boundary, not a clean whole-
  runtime audit claim.
- Unity EditMode: 62/62 in `/tmp/studio-b10-golden-editmode.xml`.
- Native macOS build passed/launched: 136,980,022 aggregate file bytes;
  executable 116,116 bytes.
- Fresh supervised Movie #2 passed construction, exact save/load, retained
  stale guidance, and release at Week 22/revision 23.
- Full-client reconnect passed twice from one stable profile with exact logical
  authority. An actual engine replacement retained the projection, disabled
  actions during outage, restored authority, and recorded zero torn reads.
- Performance on Apple M3 Max: Movie #2 119.3772 FPS; final reconnect 119.1999
  FPS; accepted restart 119.5948 FPS.
- No open product P0/P1 runtime finding remains after final local/native/Linux
  validation.

The first exact-product run `32446759604` at `e6421dcd...` is superseded seal
history, not a product regression. A broad test matcher counted both the true
publication and legitimate `cleanup engine pid=8399`, yielding `[8399, 8399]`.
Commit `11e2cf88...` parses the exact publication line and adds synthetic
cleanup, unpublished/reused PID, genuine-second-publication, and pre-exit race
coverage. The final run above passed it on Linux.

Accepted evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

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

### Movie #2 status

Playable end to end from fresh TypeScript authority through construction,
screenplay, auditions/evidence, editable casting/package, greenlight,
pre-production, director/scenery, load-in, shooting, save/load, post, retained
stale guidance, release, full-client reconnect, and supervised engine restart.
Exact identity: `The Reluctant Cornerstone`, `script-0001`, `prod-0013`.
Final revision/week/digest: `23` / `22` /
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
Saved/restored digest:
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.

### Visual status

M4 claims no visual uplift over M3. Direct inspection of the overview,
construction, production, release, reconnect, and restart frames still shows a
sparse elevated diorama, oversized generic proof HUD, flat materials, small
role-unreadable people, weak filmmaking activity, and no convincing human-scale
inspection view. It remains below ADR 0006 and the visual-fidelity ruling.

Checkpoint 11 delivered the stable Stage 7/Admin location and two-scale camera
gate; Checkpoint 12 delivered the first working-soundstage slice; Checkpoint 13
adds the readable Take One interior tableau recorded below. The current visual
gate is role silhouette/held-prop legibility, portrait-specific blocking,
genuinely dark Dark-state lighting, and screen-space occlusion proof.

### Known defects

- P1: ADR 0006 visual recognizability remains unmet. This is the principal
  canonical-promotion blocker.
- P2: `npm run studio` still executes the pinned `vite-node` development graph;
  emitted production packaging and its direct audit remain incomplete, with the
  five development advisories recorded above.
- P2/integration: TypeScript `main` has a large semantic divergence from this
  campaign line. A canonical merge requires deliberate full-diff reconciliation
  and validation on the actual merge candidate.
- P2 evidence quirk: the restart-only report has
  `exactMovie2Released: false` because unrelated identity fields are not filled;
  its exact released ordinal-2 milestone and all restart invariants pass.
- There is no known P0 regression and no violation of TypeScript simulation
  authority.

### Promotion decision

Golden M4 is the best known playable overall product and supersedes M3. It is
recoverable as an exact pushed/tagged compatible pair and passes the Golden
runtime, Movie #2, determinism, save/load/reconnect, native, and Linux CI gates.

It is **not** promoted to canonical and is **not** ready for canonical merge
review. ADR 0006 is still unmet, the local engine remains on an unaudited
development packaging boundary with five advisories, and current TypeScript
`main` has a semantic mega-diff that has not been reconciled on a merge
candidate. This is an autonomous technical-PM decision to preserve M4 as the
obvious build-from state while continuing the campaign.

Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

## CHECKPOINT 19 AUTHORIZATION - HISTORICAL PRE-IMPLEMENTATION BOUNDARY

This section preserves the exact CP19 authorization before implementation. Its
present-tense non-promotion and M4-current statements are historical and are
superseded by Golden M5 above.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

CP18 is rejected in full after its native portrait proof failed closed on the
exact Load-in Pallet renderer. Its complete source/scene delta was removed.
CP19 is an authorization boundary for one rejectable presentation trial: the
exact unchanged CP18 delta plus only the pallet support-height correction. It
is not implemented, validated, sealed, tagged, canonical, promoted, CURRENT
BEST, or ready for canonical review. CP16 remains the exact rollback product;
Golden M4 above remains the sole CURRENT BEST recovery answer.

| Component | Repository | Branch | Exact retained SHA | Disposition | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `54035f6e8df6ef280b02c617c80f9560509ff18b` | Pushed CP18 documentation-only authority; direct child of `f97728e7cd16a2240a0bfa08b231aa8f74dab2f2`; no CP18/CP19 product source | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603` | Pushed, clean CP16 product after atomic CP18 rollback; sole CP19 trial and rejection base | None |

The documentation-only commit containing this section must be the direct child
of TypeScript `54035f6e8df6ef280b02c617c80f9560509ff18b`. Because a commit
cannot embed its own resulting SHA, resolve it with `git rev-parse HEAD`; after
push require HEAD equal configured upstream and an empty tracked status. This
document authorizes no TypeScript product change and does not alter the
compatible product or promotion result.

CP18's schema-4 portrait report passed Waiting and LoadIn screen-space metrics,
including role union `.304502368`, LoadIn minimum/median visible fractions
`.761979997/.899182916`, maximum role-pair overlap `.229594529`, and backdrop
bottom `.702606618`. At LoadIn revision `13`, week `17`, it failed because
`Load-in Pallet` intersected the viewport edge. The failed `180895`-byte report
at `Evidence/J/Stage7-20260822T003217Z/Portrait/stage-visual-proof-portrait.json`
has SHA-256
`6ab97fd6d2c5288b5341f0f085cf7f594667872f3d122062f268112b304143a8`.
Unity exited `2`; cleanup and atomic rollback were exact. The local nondurable
rejection patch `/tmp/cp18-rejected-trial.patch` has SHA-256
`759e5eb70497a7622e07573784a256cb84c02dbf10b6c3708e94c99f9eefca3a`.
Neither artifact is accepted proof or recovery authority, and CP18 produced no
Unity commit, tag, push, or promotion movement.

### Exact authorized CP19 delta

- Freeze every other CP16/CP18 contract, including roles, routes, yaws, props,
  equipment, work targets, slate, state, authority, UI, landscape camera,
  overhead battens, facade/backdrop, lighting, collision and NavMesh.
- Reapply the exact CP18 portrait StageSeven profile: camera
  `(46.2,3.45,22.8)`, target `(48.1,4.1,38.2)`, FOV `46`.
- Reapply the exact CP18 translation of only the six collider-free floor-
  framing children by permanent
  Stage A-local `+2.50` Z: rail endpoints become `-3.03..-.03`; tie centers
  become `-2.73/-1.93/-1.13/-.33`. X, Y, radius, size, material, identity and
  membership stay frozen.
- Reapply the exact CP18 portrait role-union ratchet `.22 -> .27`; every other
  threshold and gate remains unweakened.
- Beyond CP18, change only the exact `Load-in Pallet` world Y `.35 -> .69`.
  Preserve X/Z `(48,31)`, yaw `18`, uniform scale `1.65`, imported model,
  identity, parent and all other properties. `.69` equals the Dolly Platform
  top (`.55 + .28/2`), and the imported pallet has local minimum Y `0`.

Static projection predicts the raised pallet inside portrait with AABB x
`215.065..373.569`, y-from-bottom `18.814..99.005`, and L/R/B/T margins
`215.065/16.431/18.814/744.995` px; landscape AABB x
`747.178..962.149`, y-from-bottom `95.109..168.139`, and margins
`747.178/477.851/95.109/731.861` px. The rejected `.35` portrait placement was
y-from-bottom `-26.485..60.420`. These calculations authorize the trial but do
not substitute for native proof.

The complete CP19 Unity scope is exactly nine paths and no others:

1. `Assets/Studio/Editor/Authoring/StudioLotActivityAuthoring.cs`
2. `Assets/Studio/Editor/Authoring/StudioLotArchitectureAuthoring.cs`
3. `Assets/Studio/Editor/Automation/StudioSceneValidation.cs`
4. `Assets/Studio/Runtime/Presentation/StudioInspectionTarget.cs`
5. `Assets/Studio/Runtime/Presentation/StudioStageVisualProofRunner.cs`
6. `Assets/Studio/Scenes/StudioLot.unity`
7. `Assets/Studio/Tests/EditMode/StudioCameraPresentationTests.cs`
8. `Assets/Studio/Tests/EditMode/StudioSceneContractTests.cs`
9. `Assets/Studio/Tests/EditMode/StudioStageVisualProofRunnerTests.cs`

Because the six floor renderers and pallet are shared permanent geometry, their
landscape pixels may change only as the direct result of the exact authorized
transforms. This is not permission to waive landscape evidence. CP19 can be
adopted only if fresh native Portrait and Landscape each pass every milestone
and unweakened gate, manual review confirms the pallet is supported, does not
float and creates no occlusion, landscape is independently equal-or-better,
and all canonical/EditMode/build/camera/Movie #2/reconnect/restart/checkpoint/
TypeScript/Git gates remain green.

Canonical regeneration requires semantic/contract equivalence after local-
fileID/order normalization, not raw `StudioLot.unity` hash equality across
runs. Unity may reassign local file IDs or serialization order; the recorded
CP16 raw scene hash remains rollback identity only.

Any failure rejects the entire nine-path CP19 delta atomically back to Unity
CP16 `e1cfa2a1...`; no partial camera, floor-framing, proof or pallet adoption
is authorized. Retain the pushed TypeScript continuity chain through
`54035f6e...` and record the rejection. No tag, M5, canonical claim, or CURRENT
BEST movement is authorized. The byte-identical Golden M4 prefix, exact SHAs
and annotated tags above remain the controlling promotion record.

## CHECKPOINT 16 SEALED INSPECTION FRAMING - NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 16 is the compatible pushed campaign tip after Checkpoint 15. Its
bounded Stage 7 inspection-framing slice passes, but CP16 is **SEALED
NON-GOLDEN**: it is not CURRENT BEST, tagged, canonical, promoted, or ready for
canonical review because the portrait composition still fails first-read
quality. Golden M4 above remains the sole CURRENT BEST recovery answer.

| Component | Repository | Branch | Exact pushed compatible SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `69c931ff56bd550926143ad065fc36794441a839` | `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`; CP15 documentation-only seal; no CP16 TypeScript product change | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `e1cfa2a1dc1da7b2be8214d587fac60d444b0603` | `0c0ef1554278441eed1d2dccac54c2d941395041`; `feat(visuals): frame Stage 7 inspection`; exactly 9 modified paths | None |

Both compatible parents are pushed. Unity local HEAD, configured upstream, and
live remote branch equal `e1cfa2a1...` with a clean tracked tree. TypeScript
HEAD/upstream equal `69c931ff...` before this continuity edit. Never substitute
either parent or mix CP16 sides.

The documentation-only commit containing this section must be the direct child
of TypeScript `69c931ff56bd550926143ad065fc36794441a839`. A commit cannot
embed its own resulting SHA, so resolve its self SHA with `git rev-parse HEAD`;
after push, require HEAD equal configured upstream and a clean tracked tree.
That docs-only child changes no CP16 product or promotion fact.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP16 changes no TypeScript,
generated DTO, V14 save, `GameState`, identity, RNG, economy, construction,
gameplay, state semantics, or authority. Both StageSeven camera profiles, all
role/equipment marks, and the final CP15 slate are frozen.

### What Checkpoint 16 adds

- `BACK` is exactly `112x44`, `12px` from the top/right of
  `Screen.safeArea`, with a charcoal `.12/.115/.105/.86` fill, warm
  `.66/.55/.38/.72` one-pixel keyline, bold `13px` cream text, and the full
  `112x44` transparent hit overlay. Exact GUI rectangles are
  `(1316,12,112,44)` at 1440x900, `(266,12,112,44)` at 390x844, and
  `(266,59,112,44)` for safe area `(0,34,390,763)`.
- Stage A gains identity-root `Inspection Portrait Framing` with exactly eight
  permanent direct renderers and no collider, rigidbody, NavMesh obstacle,
  light, or runtime-state component.
- The accepted geometry below supersedes the initial CP16 draft, which could
  not satisfy both frozen camera frusta. Exact Stage A-local endpoints are
  batten 01 `(-1.5,9,8)->(4.7,9,8)` and batten 02
  `(-1.5,10.4,12)->(5.6,10.4,12)`, radius `.08`, `Steel`; rails are
  `x=-.7/.4`, `y=.72`, `z=-5.53->-2.53`, radius `.035`, `Steel`; four ties
  are centered at `x=-.15`, `y=.705`, `z=-5.23/-4.43/-3.63/-2.83`, size
  `1.2/.035/.08`, `HeroStageBlackSteel`.
- Schema `4` now fail-closes exact aggregate IDs
  `inspection-overhead-framing` and `inspection-floor-framing`, renderer
  cardinality/names, normal-frustum visibility, composite/isolated ID pixels,
  edge inset, and portrait area/band thresholds. All pre-existing role,
  backdrop, slate, state, luma, effects, authority, and no-POST gates remain.

### Accepted validation and evidence

| Gate | Checkpoint 16 result |
| --- | --- |
| Canonical scene validation | Runs 1 and 2 each pass 32 people / 10 vehicles / 16 equipment / 4 captures / 0 errors / 0 warnings. `/tmp/cp16-canonical-final1.log`, SHA-256 `392b3744c7dd4bf2fd673ca78448a67de3f8febad75a9d1a4ced00a7006fdb24`; `/tmp/cp16-canonical-final2.log`, SHA-256 `235fd744280810479cbba5b0ecd987977f152c8fee7402b6aec4300992c5c478`; accepted validation JSON SHA-256 `9ae61146c6bd5da9b602be0a66d6795a443189c329f720647e080bccacdbc21a` |
| NavMesh | `StudioLotNavMesh.asset` remains byte-identical, 119,012 bytes, SHA-256 `20a8afad3e7fba5f0c974050fbc39f332f03ad29c21dc84561809758aa828f04` |
| Unity EditMode | 196/196; `/tmp/cp16-editmode-final2.xml`, SHA-256 `9c90c91ff421649e20f762a9f9293c7a3a72aa497fb9c5202a166e450d6c8814`; log SHA-256 `9dcb8956bac70a430faaded74c9e1229a1dbd907542be9e280799727295bec00` |
| Native build | Success; `/tmp/cp16-build-macos.log`, SHA-256 `f28da81152e851db802b576f1a50fa5c689569637986d89002f69cf3daf1aac9`; app 183 files / 151,509,138 bytes; executable 116,116 bytes, SHA-256 `07ee943e6494256b8966bc74d667cb9ab3d3e0a6dc292d3b9077ae9b7d104653`; player DLL `c2e56989046ee301279374b2d5c5d5b401d4dc4d535bfee3413f34f8abb77cf5`; `UnityPlayer.dylib` `1b87c29dc8572c521081a15359f656819bd2959ea7623013e2b69ffc995846c4` |
| Fresh TypeScript gates | Bridge 11 files / 100 tests; full 336 files / 4,526 passed / 5 skipped; both typechecks, build, contract drift, hygiene 1,032, assets 26/0, browser audit 0, and cleanup pass; build has only the accepted chunk warning |

Accepted Stage reports are
`Evidence/H/Stage7-20260821T201651Z/Landscape/stage-visual-proof-landscape.json`,
382,106 bytes, SHA-256
`3765777637011c0fe81f5f7c1d3d43a513d29280f83c103a749b30ee5bad2045`,
and
`Evidence/H/Stage7-20260821T201758Z/Portrait/stage-visual-proof-portrait.json`,
380,648 bytes, SHA-256
`b962289528fedeef7a9f4f01919a10dd9f3310e17fe90b11f1c09d0de507c9e4`.
Both are schema `4`, `complete`, failure-empty, and prove Waiting/Load-In/
Shooting/Clearing/Dark at revisions `11/13/15/17/18`; final revision `18`,
Week `20`, digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
Both accept 18/18 intents with zero unexpected or presentation POSTs and all
five states pass every gate.

- Landscape overhead area/top/bottom/edge is
  `.004117284/.08444444/.11777778/76px`; floor is
  `.009300155/.85111111/.99666667/3px` (`.009422840` in Dark).
- Portrait overhead area/top/bottom/edge is
  `.008710050/.20023696/.22630332/40px`; floor is
  `.020373071/.80450237/.92061609/67px` (`.020649532` in Dark).
- Landscape/portrait minimum occupied-minus-Dark luma is
  `.119611323/.104021385`; Shooting-minus-Dark is
  `.141321108/.125808805`. The Shooting slate remains 875/1,125
  (`.7777778`), 33x37 in landscape and 497/640 (`.7765625`), 24x27 in
  portrait, with the six-pixel portrait bright rail retained.

Camera evidence root is `Evidence/H/Camera-20260821T203100Z/`. Landscape and
portrait schema-1 reports are complete/failure-empty at SHA-256
`f760252c901c617f1786e007d6b37e5252a00527387e4cdead7851557eec0beb` and
`7e55b377596e91d9953a72723754b41d2a0f1a49d425151bd4602de35b52536f`.
Both prove the exact `112x44` control is visible and hit-testable, invokes the
same return path, restores management/workflow input, preserves target and
authority, and posts nothing. `externalActivationRequired=false` exactly;
the harness did not perform a physical pointer click. That is a recorded,
nonblocking evidence limit, not a claim of physical-click coverage.

Fresh functional root is `Evidence/H/Regression-20260821T202208Z/`.

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
  are failed/superseded no-kill operator attempts: Unity correctly reported
  that no outage was observed.
- Accepted RuntimeRestart3 report/ready/frame SHA-256:
  `3117c5d1e517b4f3720524740dcbe0f6579709d57a938d6854564430f45d49b6` /
  `6c7a452b218585ec878e26caddb4a9ebac92bf8c28f3d7897fad17ee9ed37f20` /
  `bdfd1a2777b6f525dbba83c4ab392b4a3e938aef34f5c5e4071e76cf9daad042`.
  One SIGKILL produces one replacement and three observed transport outages,
  zero torn reads, and all five continuity gates pass.

Movie2 and Reconnect prove exact release identity `The Reluctant Cornerstone` /
`script-0001` / `prod-0013` in session
`9b0cd1bb-ce88-426d-9c7d-5ac9800c70a5`, revision `23`, Week `22`, digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
RuntimeRestart3 is restart-only; its identity fields are blank and
`exactMovie2Released` is false by design. The stable checkpoint is 1,354,926
bytes, protocol `4`, revision `23`, journal `25`, SHA-256
`a63c711763c0a7a8a00056c0ff052fe85fc60663fddfbd19e89d2f1e61d20459`.

### Visual and promotion decision

Landscape passes the bounded slice and is equal-or-better. Portrait has no new
clipping or slate regression, but its role union remains exactly `.225118488`;
the action stays compressed, while the upper battens read weak/floating rather
than materially solving the large dark upper band. CP16 therefore remains
visually **NON-GOLDEN**.

CP16 receives no tag. Golden M4 remains the sole CURRENT BEST with status
exactly **GOLDEN — CONTINUE CAMPAIGN**. CP15 is historical. No M5, canonical
state, or Golden recovery pointer was created or moved.

### NEXT EXACT ACTION

Run bounded CP17 as a portrait-motivated camera/permanent-reblock trial. Freeze
the landscape camera, CP16 `BACK` UI and framing scenery, CP15 slate,
equipment, five-state semantics, authority, and every existing gate. Keep the
portrait camera at `(46.2,2.05,22.8)`, use target `(48.1,3.3,38.2)` and the
first viable FOV `39`. Trial an asymmetric but permanent shared-mark reblock,
starting with Antagonist `z=39.8`, Carpenter `x~46.08`, and Camera Operator
`z=31.8`; static projection predicts role union about `.2728`.

The earlier FOV `37` plus naive `.82` compression proposal is superseded and
must not be implemented: at FOV `37`, Batten 01 projects to AABB
`x=-7.83..395.12` in the 390px viewport, while FOV `39` keeps it at
`x=3.35..384.09`; naive `.82` compression still predicts only `.2682` role
union, clips Carpenter, and creates Antagonist/Supporting physical overlap.

Adopt the trial only if the unweakened all-12 role, edge, overlap, held-prop,
framing, luma, state, no-POST, and authority gates pass; portrait role union
must ratchet to at least `.27`, the conventional slate and bright rail must
remain, both dolly rails must stay fully framed, and independent native review
must accept both aspects. Marks must be honest permanent shared routes: no
aspect-triggered teleport or fake tableau. Otherwise reject the trial and
retain CP16. No M5 absent independent Golden acceptance of both aspects.

### Launch

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

The moving compatible pair launches CP16. Immutable CURRENT BEST recovery uses
both M4 tags in the first section.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, promote CP16, or infer CURRENT BEST
  from moving branches. Golden M4 remains sole immutable CURRENT BEST.
- Do not weaken landscape, CP16 UI/framing, slate, all-12 role, edge, overlap,
  prop, luma, effects, state, no-POST, authority, Movie #2, reconnect, restart,
  checkpoint, or NavMesh gates during CP17.
- Do not implement the superseded FOV `37`/naive `.82` compression proposal,
  aspect-triggered role teleport, or a portrait-only fake tableau. Any reblock
  must be permanent/shared and pass fresh native proof in both aspects.
- Do not stage ignored apps, Evidence/H, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### Recovery

1. Read this CP16 section, the handoff's top CP16 section, ledger CP16 entry,
   ADR 0006, and the client decision. Do not infer CURRENT BEST from branches.
2. For immutable M4 recovery verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56` under their M4 tags.
3. To continue CP16 use TypeScript
   `69c931ff56bd550926143ad065fc36794441a839` plus Unity
   `e1cfa2a1dc1da7b2be8214d587fac60d444b0603`. Never mix sides.
4. Resolve the containing docs-only direct child's self SHA with
   `git rev-parse HEAD`; after push require HEAD equal upstream and clean.
   Require Unity HEAD/upstream/live remote at `e1cfa2a1...` and clean.
5. Rebuild/launch with the command above; verify protocol/projection `4`, schema
   `ba9cd199...`, authenticated readiness, and the compact `BACK` control.
6. Use only accepted Evidence/H hashes. RuntimeRestart and RuntimeRestart2 are
   superseded no-kill attempts; RuntimeRestart3 is accepted restart-only proof.
7. Continue only with NEXT EXACT ACTION. No M5 or canonical promotion is
   authorized.

## CHECKPOINT 15 SEALED RECOGNIZABLE PRODUCTION SLATE - HISTORICAL NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 16 above supersedes Checkpoint 15 as the current development base.
CP15 remains preserved **SEALED NON-GOLDEN** history: its targeted
slate-recognition gate passed, but it was never CURRENT BEST, tagged, canonical,
promoted, or ready for canonical review. Golden M4 above remains the sole
CURRENT BEST recovery answer.

| Component | Repository | Branch | Exact pushed SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` | `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`; CP14 documentation-only seal; no CP15 TypeScript product change | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `0c0ef1554278441eed1d2dccac54c2d941395041` | `a1f6ae8a11d58e28491662a1858631f8019faf33`; `Improve Stage 7 slate readability`; exactly 6 modified paths | None |

Both local HEADs, configured upstreams, and live remote branch refs matched the
exact SHAs above before this continuity edit; both tracked trees were clean.
Never substitute either parent or mix CP15 sides.

The documentation-only commit containing this section must be the direct child
of TypeScript `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f`. A commit cannot
embed its own resulting SHA, so resolve its self SHA with `git rev-parse HEAD`;
after push, require HEAD equal configured upstream and a clean tracked tree.
That docs-only child changes no CP15 product or promotion fact.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP15 makes no TypeScript,
generated DTO, V14 save, `GameState`, identity, RNG, economy, construction,
gameplay, camera, role-mark, state-semantics, or authority change.

### What Checkpoint 15 adds

- the PA slate uses exact sources `[base, LOD1, LOD1]` at thresholds
  `.52/.22/.025`, retaining the fuller LOD1 mesh as its terminal asset;
- ordered material slots are dark board / ivory clapper / mustard stripe:
  `HeldPropCharcoal`, `HeldPropIvory`, `HeldPropMustard`;
- fail-closed landscape slate thresholds are `800/32/28`, portrait
  `440/24/20`, and minimum visible fraction `.70`;
- only six Unity paths change: slate authoring, validation, schema-4 proof,
  canonical scene, and two test files. CP14 slate pose, cameras, role marks,
  landscape profile, state/authority semantics, and schema `4` stay fixed.

### Accepted validation

| Gate | Checkpoint 15 result |
| --- | --- |
| Canonical scene validation | Runs 1 and 2 each passed 32 people / 10 vehicles / 16 equipment / 4 captures / 0 errors / 0 warnings. `/tmp/project-studio-cp15-dark-slate-scene-run1.log`, SHA-256 `d531886872560ac0ee92aaf6bb8eda549e9c2b7b78ef919be7b2fd041607b82e`; `/tmp/project-studio-cp15-dark-slate-scene-run2.log`, SHA-256 `fe5e9eebb9fd6a65bd4b82d633398292da36fe640444be2218b3fcb84b99b51e`; accepted validation JSON SHA-256 `a2c6bf2ca3d3e6a40616ced0b474031ac0f4dfcd0479eafb6d6df8f0cc4a302a` |
| Unity EditMode | 191/191; `/tmp/project-studio-cp15-editmode-run2.xml`, SHA-256 `7ae511cf9c2c41a44abbd0456ffcf1c5d1be864b362e1a021f1672d39f3955ff`; `/tmp/project-studio-cp15-editmode-run2.log`, SHA-256 `00d458a0ea374d79d6545d6068402d0fdaae1f19d065c7892b51721e3d7fd2ef` |
| Native build | Success; `/tmp/project-studio-cp15-dark-slate-build-run2.log`, SHA-256 `fb2413bd4b35e32c1038a2ff1f727618a50cbbd66f504f5544d668292dcc3e8f`; app 183 files / 151,475,682 bytes; executable 116,116 bytes, SHA-256 `eae78f14c609aec59e5646094b371c1a2519b4671af902f7148eff74a2e63e48`; player DLL SHA-256 `7e50620ec560db947da9a268ccdd38814248a11754a9e07e1851d0af6324802f` |
| Fresh TypeScript gates | Bridge 11 files / 100 tests; full 336 files / 4,526 passed / 5 skipped; both typechecks, build, contract drift, hygiene 1,032, assets 26/0, browser audit 0, and cleanup passed; build had only the accepted chunk warning |

### Accepted Stage and functional evidence

- Landscape schema-4 report:
  `Evidence/G/Stage7-20260821T190243Z/Landscape/stage-visual-proof-landscape.json`,
  1440x900, SHA-256
  `3f3647dc172e30d85c55f46563329a589dcdb038e5dbcb0c3b697d4a1c7a494c`.
- Portrait schema-4 report:
  `Evidence/G/Stage7-20260821T190335Z/Portrait/stage-visual-proof-portrait.json`,
  390x844, SHA-256
  `ff420f3767a8ebd50515ae73235a4e5fe57e78bebd5ef0d84b8fd300a8c5afd1`.
- Both complete reports prove states/revisions
  `Waiting/11`, `Load-In/13`, `Shooting/15`, `Clearing/17`, `Dark/18`, ending
  revision `18`, Week `20`, digest
  `ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`.
  They accept 18/18 proof intents with zero presentation/unexpected/retry/
  recovery POSTs. All 20 PNGs match recorded hashes, dimensions, bytes, and
  decode; every mask/role/prop/luma/effects/authority/no-POST gate passes.
- Exact role counts are `12/12/12/8/0`; held props `0/0/3/0/0`. Landscape/
  Portrait minimum occupied-minus-Dark luma is `0.119559/0.103997`, and
  Shooting-minus-Dark `0.141363/0.125979`.
- Shooting slate: landscape 875/1,125 (`0.7777778`), 33x37, owner `0.0257778`,
  head `2/0`; portrait 497/640 (`0.7765625`), 24x27, owner `0.034375`, head
  `0/0`. The portrait bright rail is exactly six native pixels, y `501-506`.
  Manual inspection recognizes a conventional clapperboard in both aspects.

Fresh functional root: `Evidence/G/Regression-20260821T190530Z/`.

- Movie2 report/release frame:
  `93e333c96116bc46f87c49570183b90466a22da58d84bff2c48af9b56927e9aa` /
  `2d44993a03ac2025caedfdd6a43a358a27d7813dbd90f4df51dfb7663a9d44c6`.
- Reconnect report/frame:
  `1c2c47dce92915cfba244ac72c7875e9651fc85135408fab7cc9b9b0c6ab2fa6` /
  `e2a76395022745e1e9d57f8ada892c079f2af76977b024400571a2fff1107f0c`.
- First RuntimeRestart report
  `a9751b46bde75dd40a10c548e58618e180555486399d41420832810257bf8bc3`
  is invalid/superseded because Unity missed outage observation.
- Accepted RuntimeRestart2 ready/report/frame:
  `c0642e800f08c0026c423a2527d69aa9430e49119275861927d1cdb3b38473e5` /
  `dd188cc5c79471e8aa1d67bc1aaf30990fb12fc3fa51792c4cd0fb7876287659` /
  `17c9fd409eb16a27ea4534395c256d37f19c2382916cbddc6c8ebf33e8101107`.
  It records one replacement, three transport outages, zero torn reads, and
  passes all five continuity gates.
- Session `3fc95257-e59b-479f-9d43-1779ea5019a3` retains revision `23`, Week
  `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Checkpoint
  `/private/tmp/project-studio-cp15-regression-final-20260821T190530Z/bridge-runtime/bridge-runtime-v1.json`:
  1,354,921 bytes, journal `25`, SHA-256
  `8338000aaab6a7c3267852814b1f2f72b582b16dce3d1c76e5dcbd13fa9248a8`.

Movie2 plus Reconnect carry exact release identity. RuntimeRestart2 carries
restart continuity only. The first failed observation is superseded operator
history, not a product defect.

### Visual and promotion decision

The bounded slate target passes: both aspects show a recognizable conventional
clapperboard. The pair remains visually **NON-GOLDEN** because portrait action
is still compressed into a narrow middle band with large dead headroom/floor,
and the dominant Back UI reinforces a prototype composition. A targeted pass
cannot manufacture overall visual success.

CP15 receives no tag. Golden M4 remains the sole CURRENT BEST with status
exactly **GOLDEN — CONTINUE CAMPAIGN**. CP14 is historical. No M5 or canonical
state was created or moved.

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

The moving pair launches CP15. Immutable CURRENT BEST recovery uses both M4
tags in the first section.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, promote CP15, or infer CURRENT BEST
  from moving branches. Golden M4 remains sole immutable CURRENT BEST.
- Do not change either StageSeven camera profile, any role/equipment mark, CP15
  slate sources/material order/pose/gates, TypeScript authority, schema/state
  semantics, or weaken all-12 role, edge, mask, luma, no-POST, Movie #2,
  reconnect, or restart gates.
- Do not stage ignored builds, evidence, profiles, checkpoints, logs, or
  protected reference assets.

### Recovery

1. Read this CP15 section, the current handoff, ledger CP15 entry, ADR 0006,
   and the client decision.
2. For immutable M4 recovery verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56` under their M4 tags.
3. To continue CP15 use TypeScript
   `d92f74191dc9d4d0e80f3e922e7dbc4bd0961c2f` plus Unity
   `0c0ef1554278441eed1d2dccac54c2d941395041`. Never mix sides.
4. Resolve the containing docs-only direct child's self SHA with
   `git rev-parse HEAD`; after push require HEAD equal upstream and clean.
   Require Unity HEAD/upstream/live remote at `0c0ef155...` and clean.
5. Continue only with NEXT EXACT ACTION. No M5 or canonical promotion is
   authorized.

## CHECKPOINT 14 SEALED PROOF-LEGIBLE STAGE ROLES - HISTORICAL NON-GOLDEN

Checkpoint 14 was the compatible campaign tip before Checkpoint 15. CP15 above
supersedes it as the current development base. CP14 remains preserved **SEALED
NON-GOLDEN** history: it was never CURRENT BEST, tagged, canonical, promoted,
or ready for canonical review. Golden M4 remains the sole CURRENT BEST.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 14 was the compatible pushed campaign tip after Checkpoint 13 and
the correct base for bounded CP15 visual work at that seal. It is **SEALED
NON-GOLDEN**: it is not CURRENT BEST, tagged, canonical, promoted, or ready for
canonical review. Golden M4 above remains the sole CURRENT BEST recovery
answer.

| Component | Repository | Branch | Exact pushed SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` | `6b28cacfa9d8fd802ced951bb3248153cf348259`; CP13 documentation-only seal; no CP14 TypeScript product change | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `a1f6ae8a11d58e28491662a1858631f8019faf33` | `e38c8400ff28b0a516dda47b9c2b9a64374a50d6` | None |

Both sides were clean, pushed, and equal to configured upstream before this
continuity edit. Unity `a1f6ae8...` is
`feat(visuals): make stage roles proof-legible`, an exact 47-file Unity
presentation/authoring/proof commit. Never substitute its parent or mix CP14
sides.

The documentation-only commit containing this section must be the direct child
of TypeScript `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a`. A commit cannot
embed its own resulting SHA, so resolve its self SHA with `git rev-parse HEAD`;
after push, require HEAD equal configured upstream and a clean tracked tree.
That docs-only child changes no CP14 product or promotion fact.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP14 changes no TypeScript,
generated DTO, V14 save, `GameState`, identity, RNG, economy, construction,
gameplay formula, or authority boundary.

### What Checkpoint 14 adds

- deterministic reblocking/material differentiation for 12 exact filmmaking
  roles and hand-attached Director megaphone, PA slate, and boom microphone;
- aspect-aware Stage inspection profiles plus a Dark-only local inspection
  grade without changing the five authoritative states;
- schema-4 native proof with persistent ID rendering, isolated/composite masks,
  exact visible-area/occlusion/separation/owner/head-clearance gates, luma and
  effects truth, and zero-presentation-POST enforcement;
- regenerated canonical scene/NavMesh/controllers, fail-closed validation, and
  expanded EditMode coverage. No protected source art was imported.

### Accepted validation

| Gate | Checkpoint 14 result |
| --- | --- |
| Canonical scene validation | Final run 40: 32 people, 10 vehicles, 16 equipment objects, 4 capture anchors, 0 errors, 0 warnings; `/tmp/project-studio-cp14-scene-final-run40.log` |
| Unity EditMode | Final run 29: 189/189 passed, 0 failed/skipped; `/tmp/project-studio-cp14-editmode-run29.xml` |
| Native macOS build | Final run 29 passed; 151,475,574 aggregate regular-file bytes; executable 116,116 bytes, SHA-256 `70329ea3f2fab238b4414e6af29c39ec57c2dfe24a781c8fd26cb91330abed48`; `Assembly-CSharp.dll` SHA-256 `18bad2a8dbf2984eedfe7af7d97d38d90e8ee7e3141f79336e891eddb551faf5` |
| Fresh TypeScript gates | Bridge 100/100; full suite 336 files, 4,526 passed, 5 skipped, 0 failed; both typechecks, build, contract identity/generated contract, hygiene across 1,032 source files, 26 adopted assets, and browser production audit green |

### Accepted Stage and functional evidence

- Landscape schema-4 report:
  `Evidence/F/Stage7-20260821T180028Z/Landscape/stage-visual-proof-landscape.json`,
  1440x900, SHA-256
  `3c7fef40b1f0e40ed53ca37d2c397be4db46e05b9cf66d6f6a67b864cdd8a829`.
- Portrait schema-4 report:
  `Evidence/F/Stage7-20260821T180100Z/Portrait/stage-visual-proof-portrait.json`,
  390x844, SHA-256
  `5337e7ad920d72e44e5d50112c59f7463e716b9a70a510803d4c3b4f09adbb9d`.
- Both complete reports advance revision `0 -> 18`, Week `20`, digest
  `ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
  accept 18/18 proof-owned POSTs, and record zero presentation/unexpected POSTs,
  ambiguous retries, or recoveries. Exact role counts are `12/12/12/8/0` and
  held-prop counts `0/0/3/0/0` across Waiting/Load-In/Shooting/Clearing/Dark.
- Effects are exact: spill `1.2/1.2/4.0/1.2/0`; Shooting alone has 7 lights,
  2 indicators, and 3 practicals; Dark alone has grade weight `1`. Every
  screen-space, authority, luma, effects, backdrop, viewport, and no-POST gate
  passes.
- Landscape/Portrait mean luma by state is Waiting `0.235897/0.222092`,
  Load-In `0.241800/0.238575`, Shooting `0.257441/0.243183`, Clearing
  `0.235740/0.221426`, and Dark `0.116131/0.117365`. Minimum occupied-minus-
  Dark is `0.119609/0.104062`; Shooting-minus-Dark is `0.141309/0.125819`.
- The Shooting slate is mask-visible at 778/1,028 landscape pixels (`0.75681`)
  and 427/570 portrait (`0.74912`). Owner overlap is `0.02821/0.03860`;
  landscape raw/interior head overlap is `2/0`, portrait `0/0`.

Fresh functional root:
`Evidence/F/Regression-20260821T180816Z/`.

- Movie2 report SHA-256
  `b4214dcb5327b867d4e822373db5e45526fc6f6cf94234365749f7081582e83e`.
- Reconnect report/frame SHA-256
  `4cc452479c68006b38bab6bde1839e07b57be1a192b69fe83894cf97a434b03a` /
  `649289d6ac89a644abd56d89f85009fd43386f0ef075004ba9ad7128c1bb3653`.
- RuntimeRestart ready/report/frame SHA-256
  `031854be69a25cf2bfeafc3e0c4525dfd31ef07c5e3b9fea5dd6b36f1d914a53` /
  `47198241fdd11fdd56bd6a26cce487283bfe6f968e9ca2dd70ba2ed7e3b295d5` /
  `530cffc4c4ca58ace2f8fceb0cf87f0297d89c7c152ff645f84bfe0ef179a53e`.
- Session `ff8ae458-a58b-4139-886b-808a4fbd97af` retains exact Movie #2 at
  revision `23`, Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Restart replaces engine PID `75695` with `75736` on pinned port `61145`,
  records one outage/replacement and zero torn reads, disables actions during
  outage, and preserves projection and logical authority.
- Stable checkpoint: 1,354,927 bytes, SHA-256
  `7af05320a1c4ed94096c620060159d0424b9a83b616822d1fbd4770814ca48c1`,
  revision `23`, journal `25`.

Movie2 plus Reconnect carry exact release identity. RuntimeRestart is continuity
proof only; its intentionally blank identity fields and
`exactMovie2Released: false` do not negate the ordinal-2 release milestone or
accepted release reports.

### Visual and promotion decision

Independent inspection accepts the CP14 landscape view. The compatible pair
still fails the visual law because portrait roles occupy only about 22.5% of
viewport height, the proof-present slate reads as a plain charcoal square with
a tiny rail rather than an immediate clapperboard, and large black headroom
plus the Back UI reinforce a prototype read. Tests, masks, hashes, and build
bytes cannot manufacture visual recognition.

CP14 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST with status exactly **GOLDEN — CONTINUE CAMPAIGN**. CP13
is historical. No M5 or canonical state was created or moved.

### NEXT EXACT ACTION

Implement bounded CP15 on CP14. Preserve every validated role mark, camera,
held-prop pose, state root, and authority boundary; re-author only the slate
surface/contrast first. Require a high-contrast bright rail at least 3 pixels
thick at 390x844 and manual two-second clapperboard recognition. Do not widen
TypeScript state, protocol/schema, save/gameplay, identity, or simulation.

### Launch

Continue the moving CP14 pair with:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

For immutable CURRENT BEST recovery/build, use both M4 tags in the first
section, not the moving branches.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, promote CP14, or infer CURRENT BEST
  from moving branch tips. Golden M4 remains the sole immutable CURRENT BEST.
- Do not move validated role marks, camera, or held-prop pose in the bounded
  CP15 slate-surface unit; do not widen TypeScript or weaken proof gates.
- Do not stage ignored builds, evidence, profiles, checkpoints, screenshots,
  logs, locks, caches, `/tmp` outputs, or protected reference assets.

### Recovery

1. Read this historical CP14 section, the handoff's CP14 section, ledger CP14
   entry, ADR 0006, and the client decision.
2. For immutable M4 recovery, verify TypeScript
   `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
   `6b32335447848ed0680eb8077e78ee36aded5d56` under their M4 tags.
3. To continue CP14, use TypeScript
   `8dffc6f31d3f3034eb5a94fcf0dafd8c65005d4a` plus Unity
   `a1f6ae8a11d58e28491662a1858631f8019faf33`. Never mix sides.
4. Resolve the containing docs-only direct child's self SHA with
   `git rev-parse HEAD`; after push require HEAD equal upstream and a clean
   tracked tree. Require Unity HEAD/upstream at `a1f6ae8a...` and clean.
5. Continue only with NEXT EXACT ACTION. No M5 tag or canonical promotion is
   authorized.

## CHECKPOINT 13 SEALED TAKE ONE INTERIOR TABLEAU - HISTORICAL NON-GOLDEN

Checkpoint 13 was the compatible campaign tip before Checkpoint 14. CP14 above
supersedes it as the current development base. CP13 remains preserved **SEALED
NON-GOLDEN** history: it was never CURRENT BEST, tagged, canonical, promoted,
or ready for canonical review. Golden M4 remains the sole CURRENT BEST.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 13 was the compatible pushed campaign tip after Checkpoint 12 and
the correct base for bounded CP14 visual work at that seal. It is **SEALED
NON-GOLDEN**: it is not CURRENT BEST, tagged, canonical, promoted, or ready for
canonical review. Golden M4 above remains the sole CURRENT BEST recovery
answer.

| Component | Repository | Branch | Exact pushed SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `6b28cacfa9d8fd802ced951bb3248153cf348259` | `93e15232915695e904680c34e2e1abbb4a5e5152`; CP12 documentation-only seal; no CP13 TypeScript product change | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `e38c8400ff28b0a516dda47b9c2b9a64374a50d6` | `219f290e3dc4b7174ee2ff26992692e8b2779c89` | None |

Both product sides were clean, pushed, and equal to configured upstream before
this continuity edit. Unity `e38c840...` is
`feat(visuals): stage a readable production tableau`; it is an exact 87-file
Unity source/asset commit. Never substitute its parent or mix CP13 sides.

The documentation-only commit containing this section must be the direct child
of TypeScript `6b28cacfa9d8fd802ced951bb3248153cf348259`. Resolve its
self SHA with `git rev-parse HEAD`; after push, require HEAD equal configured
upstream and a clean tracked tree. That docs-only child does not change product
or promotion facts.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. CP13 makes no TypeScript, schema,
generated DTO, V14 save, `GameState`, identity, RNG, economy, construction,
gameplay-formula, or authority change.

### What Checkpoint 13 adds

- a provenance-recorded 1254x1254, 2,753,366-byte OpenAI-generated Stage atlas,
  SHA-256
  `0b244fe00ba2251ffd80204978a09d0a5471062bb35315f1ccec973114095c89`,
  with deterministic 615x615 crops, repeat-wrapped albedos,
  luminance-derived normals, and shared URP material families;
- an era-readable teal-wallpaper/cream-linen/burgundy-textile/dark-walnut
  apartment set, denser working-stage dressing, refined camera/blocking, and
  persisted canonical scene/NavMesh;
- exact role/wardrobe/controller contracts for 12 production identities:
  `t-dir-04`, `t-act-01`, `t-act-04`, `t-act-09`,
  `presentation-crew-camera`, `presentation-crew-grip`,
  `presentation-crew-electric`, `presentation-crew-pa`,
  `presentation-crew-boom`, `presentation-crew-carpenter`,
  `presentation-crew-camera-assist`, and `presentation-crew-wardrobe`;
- state-owned Director megaphone, PA slate, and boom microphone, with exact
  equipment ownership/activity guards;
- exactly seven shooting-only lights and three exact shooting-practical
  renderers: `Shooting Window Glow`, `Shooting Sconce Glow`, and
  `Shooting Standing Lamp Glow`;
- schema-3 Stage proof and EditMode/validator false-green guards for roles,
  held props, light/practical state, composition, framing, and zero
  presentation-owned POSTs.

The exact `PROVENANCE.md` ImageGen prompt is:

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

The provenance record also pins the 2026-08-21 acquisition date, OpenAI output
terms, source path/hash, and derivative process. No third-party reference image,
real film, logo, text, trademark, Lionhead asset, or protected reference asset
was imported.

### Validation and accepted Stage evidence

- Canonical scene validator final run 14 passed with 32 people, 10 vehicles,
  16 equipment objects, 4 capture anchors, 0 errors, and 0 warnings in
  `/tmp/project-studio-cp13-build-scene-20260821-run14.log`.
- Unity EditMode final run 16 passed 127/127 in
  `/tmp/project-studio-cp13-editmode-run16.xml`; log
  `/tmp/project-studio-cp13-editmode-run16.log`.
- Native macOS build final run 12 passed in
  `/tmp/project-studio-cp13-build-macos-20260821-run12.log`: 152,745,358
  aggregate regular-file bytes; executable 116,116 bytes; executable SHA-256
  `68043e536a98adcd7686d4e54b0f08ecfa5572c832521ac6e2111dcef35e6e7e`.
- TypeScript results are **inherited unchanged**, not CP13 TypeScript product
  reruns: bridge 100/100; full 336 files, 4,526 passed, 5 skipped, 0 failed;
  full/bridge typechecks, production build, generated-contract/contract checks,
  and hygiene passed.

Accepted landscape root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115813Z/Landscape/`.
Schema-3 complete 1440x900 report SHA-256:
`94c400a1cd7b649983923cb4fb9483636dd721a305e5778788cbba90d369f1c8`.
Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
`9eb1c9dc433eb0928bba995da747e4dfa95a960a16bb7f330c4f3062b72f82fa`,
`2e6a422944e7da558970b463a4a3f015e9bd86183cd6cbf0b95292726c2eaf20`,
`798579700f024adf9159631793bd19096c3732732d7839a75d97fd6941764424`,
`12eadaa15e1f62a4dee4e11150ba482f7f3b4d4c6620a2e34a09b0ee32f752a1`,
`1b2cdba0b0bce9a50b0493ee191364cacccbac6f02c32194b70259936eee870a`.

Accepted portrait root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Stage7-20260821T115635Z/Portrait/`.
Schema-3 complete 390x844 report SHA-256:
`6aa60673b492bb5b8b2d94dc8d35f1ac4920da51f4312e5eb1e17d17d43dae77`.
Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256:
`b454d1386990f29b9610a253dda1b6d4711c78be96cefe076018abc35500c5bd`,
`b38f17b65a9e693a7dad55c428dded48326393969cf2be80716bda7a163cc2e3`,
`8808213eac99dc8d16e4c12c2e5d7a8e023ef380907537ad0ee8b38c2af6123e`,
`4245b8777526b722ced33af5c6449caa5d323bfcac8229fc14a4d1a2224f801e`,
`e6b4da10a3eb3b8297041b1fc54c2927eb3550393603034a99db5fcd9049c2ca`.

Both reports advance revision `0 -> 18`, finish Week `20` at digest
`ba8024eaad964a3b886ff668f746ba4b75d23b759f159a3bc20f26e5ca30f26d`,
accept 18/18 proof-owned POSTs, record zero unexpected and zero
presentation-owned POSTs, and pass the exact role/light/practical/no-extra-POST
contracts. All eight ambient roles are framed in active states; Landscape and
Portrait Load-In each honestly have only 7/8 visually clear, above the enforced
threshold of six. The flatbed/truck is intentionally outside the hero proof frustum.
Superseded `Evidence/E/Stage7-*` attempts are preserved iteration history and
are not accepted evidence.

### Functional regression and evidence interpretation

Accepted root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/E/Regression-20260821T115956Z/`;
private profile:
`/private/tmp/project-studio-cp13-regression-20260821T115956Z`.

- Movie2 report SHA-256
  `a350507148445aca3ae8b2ab90f26b62bade0f5ef85d3c4b976503c8c254f132`
  is schema `5`, complete, and proves exact release identity
  `The Reluctant Cornerstone` / `script-0001` / `prod-0013` at revision `23`,
  Week `22`, digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  save/load restores
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`;
  12 milestones and retained `STALE_REVISION` guidance pass.
- Reconnect report SHA-256
  `aa1440efcf30fa80f98eb702b16694b13372b38d5f4907ca6ad3a3a81661daef`
  is complete and retains that same logical authority and exact release
  identity under a new runtime.
- Accepted RuntimeRestart2 ready/report SHA-256 values are
  `23b6cf8d86fa32da38d3e9b7505d6c0c1cc8d89046cdd009dc62f864b0081472` /
  `dadacb1573d297d59ca7dba41be9975af1c469d5f038f0100c169f2a37c72e28`.
  It validates exact PID/PGID `8648`, supervisor `8643`, process incarnation,
  SIGKILL only of that engine, replacement PID `8692` on pinned port `50472`,
  one outage/replacement, disabled actions during outage, retained authority,
  and zero torn reads.
- First-restart report SHA-256
  `7c7757403edea814f1ef10c8875a8817c0bf9bf2ded6ee70455829ae222e73e9`
  is invalid/superseded operator history: the 30-second kill window was missed.
  It is not a product failure.
- The stable checkpoint is 1,354,922 bytes, journal `25`, SHA-256
  `45eba062636d12bdd08fc908bc4bb4e9fb51320ef7fb8e5ee271d057dca0ae1e`.

Movie2 and Reconnect are release-identity proof. RuntimeRestart2 is restart
continuity only: its blank identity fields and `exactMovie2Released: false` are
the known report-schema quirk, while its ordinal-2 released milestone and all
restart invariants pass. Never use RuntimeRestart2 alone to claim or refute
exact release identity.

### Recovery and launch

Continue CP13 with TypeScript
`6b28cacfa9d8fd802ced951bb3248153cf348259` plus Unity
`e38c8400ff28b0a516dda47b9c2b9a64374a50d6`, then launch:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

For immutable CURRENT BEST recovery/build, use both M4 tags in the top section.
Preserve this section's containing docs-only direct child of `6b28cac...`;
after push, resolve it with `git rev-parse HEAD`, require HEAD equal upstream
and a clean tracked tree, and require Unity clean/upstream at `e38c840...`.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, or promote CP13. M4 remains sole
  CURRENT BEST.
- Do not alter TypeScript authority, protocol/projection/schema/generated DTOs,
  V14, `GameState`, identity, RNG, economy, construction, or gameplay formulas.
- Do not weaken exact five-state, role, held-prop, light/practical, viewport,
  no-POST, Movie2, reconnect, restart, or checkpoint assertions.
- Do not equate frustum checks with occlusion/separation proof, hide portrait
  Load-In's 7/8 clear count, or classify the missed-kill attempt as a product
  defect.
- Do not commit native apps, evidence, profiles, checkpoints, screenshots,
  logs, caches, locks, `/tmp` outputs, or protected reference assets.

### Visual ruling, promotion decision, and next exact action

CP13 is materially better than CP12 in set surfaces, working-stage density,
production-role contracts, held equipment, lighting state, and proof rigor.
That progress is not enough for Golden.

Portrait still has large ceiling/floor void, a narrow overlapped action band,
and Load-In flats that dominate the frame. Dark is empty but broadly warm-lit,
not genuinely stage-dark. Landscape improves, but roles remain clustered and
the slate, megaphone, boom, and department silhouettes are not immediately
legible. Tests, hashes, population counts, build bytes, and FPS establish
engineering health only and cannot manufacture visual success.

Checkpoint 13 is therefore **SEALED NON-GOLDEN** and receives no tag. Golden M4
remains the sole CURRENT BEST; promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**. CP12 is historical; no M5 or canonical state
was created or moved.

NEXT EXACT ACTION is bounded CP14: improve Stage role silhouette and held-prop
legibility, add portrait-aspect-specific blocking/composition, make Dark
genuinely dark through motivated state lighting, and add screen-space prop-area
plus occlusion/separation proof. Preserve exact five-state truth and do not
widen TypeScript state, protocol/schema, save/gameplay, identity, or simulation
scope.

## CHECKPOINT 12 SEALED STAGE 7 WORKING SOUNDSTAGE - HISTORICAL NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 12 is the compatible pushed campaign tip after Checkpoint 11 and
before Checkpoint 13. CP13 above supersedes it as the current development base.
It remains preserved **SEALED NON-GOLDEN** history: it was never CURRENT BEST,
tagged, canonical, promoted, or ready for canonical review. Golden M4 above
remains the sole CURRENT BEST recovery answer.

| Component | Repository | Branch | Exact pushed SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `93e15232915695e904680c34e2e1abbb4a5e5152` | `600e014f3bd862583ee1605d158d1f8edb1f525e` | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `219f290e3dc4b7174ee2ff26992692e8b2779c89` | `5c8a0eee7fa16bb9fd486fb61707230b208330d6` | None |

TypeScript `93e1523...` remains clean and pushed with no Checkpoint 12 product
change. Unity `219f290e...`, `feat(presentation): stage a working soundstage`,
is clean and pushed. These two SHAs are the only compatible Checkpoint 12 pair.
Never substitute the Unity parent or mix one side with another checkpoint.

The documentation-only commit containing this section is the direct child of
TypeScript `93e15232915695e904680c34e2e1abbb4a5e5152`. Its self SHA is resolved
with `git rev-parse HEAD`; recovery requires HEAD to equal configured upstream
and the tracked tree to be clean. That docs-only child changes no product or
promotion fact.

The contract remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
TypeScript remains sole simulation authority. There is no schema, V14,
`GameState`, gameplay-formula, RNG, permanent-identity, economy, or generated
DTO change.

### What Checkpoint 12 adds

- exact, fail-closed Stage-A protocol-v4 truth resolution across the physical
  stage, facility, theater beat, and production operation;
- mutually exclusive Waiting, Load-In, Shooting, and Clearing roots plus true
  Dark inactivity, all presentation-only and save-neutral;
- separate authoritative and ambient person slots, with exact on-stage
  director/cast identities and eight stable filmmaking-department bodies;
- runtime NavMesh activation, role stations, purposeful locomotion, and
  director/performance/camera/boom/electric/slate/carry Mecanim roles;
- state-driven shooting beacon/indicators, interior spill, six shooting-only
  lights, and distinct load-in/shooting/waiting/clearing equipment;
- an apartment set, practical furniture, film camera/dolly/boom/director
  stations, loading flatbed/flats, wrap cart, working backs/studs/braces/rail,
  sandbag, and deterministic Stage-specific material detail;
- responsive landscape and portrait Stage inspection profiles;
- regenerated canonical scene/validator coverage and an additive five-state
  runtime proof that does not replace full Movie #2/reconnect/restart gates.

### Validation and evidence

- Scene validation: 32 people, 10 vehicles, 18 equipment objects, 4 capture
  anchors, 0 errors, 0 warnings.
- Unity EditMode: 101/101 in
  `/tmp/project-studio-d-stage-seal2-editmode.xml`.
- Native build: passed in `/tmp/project-studio-d-stage-seal-build.log`;
  137,484,986 aggregate bytes; executable SHA-256
  `d41cadf58ec66502cc810aebd0c82022e8a58e350e10a94b4e2bdfbafa9f44e1`.
- TypeScript: bridge 100/100; uncontended full rerun 336 files, 4,526 passed,
  5 skipped; both typechecks, build, generated-contract check, and hygiene pass.
  An initial concurrent full run transiently reported four duplicate-testid
  failures; the affected file passed 28/28 alone and the uncontended full rerun
  was clean. This is retained as non-reproducible test history, not a product
  regression.

Landscape Stage evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093017Z/Landscape/`.
Report SHA-256 is
`3b5891ccd2cb3f88ad3f7f39bfe40a8ba498d74a29a5e20154869ce1786f1072`;
Waiting / Load-In / Shooting / Clearing / Dark PNG SHA-256 values are
`ec028158917530eaf84fdcb54a3581e04eba63ae9d790d94f71c4a6418d40434`,
`7d5c047d446300966138378b546f7f4076f22b226d17325c8b74c5d3ecd7008a`,
`74611d9ccd43fb6b5bbec5c8da123594f1e14d015bfb7a24934416150eb8be6e`,
`eb31e56b45a6353f066479e800981cc80fe70d0b1e667f608fe6c5da31d9d1f0`,
and `4e751ecb820f22938c3d5d06da17a862d5d1a1d2226a413e3f376ef9639720cb`.

Portrait Stage evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Stage7-20260821T093040Z/Portrait/`.
Report SHA-256 is
`dc72c390a8d8c894d7e9c2f0b5c006135776927a7aa48fe460f20e9d9c4b9f72`;
the five corresponding PNG SHA-256 values are
`1f9bede04eb6d0606e1406c79db362137f3095f0877036bc7bf31975edf7942f`,
`6399fce172be3037061d5cfc9c7b51b1c3088ca9db96e0ea6eb45f703ec5cd11`,
`7c658181a42eede15241cd4a0ca567cd6ae3d3491b2b36bdd26e1a73ba9533ef`,
`6b3de340c82253a5b789d25a5cc1fbf58c48317415263a3f74b154e016bfb6ba`,
and `e79a7f24c885b6a6d64a80116364c941a29e5d42d92059f32937f25315669213`.

Both reports are complete at exact 1440x900 and 390x844 viewports, revision
`0 -> 18`, Week `20`, 18/18 accepted proof-owned POSTs, five exact states, 4/4
authoritative plus 8/8 ambient people in active states, and zero unexpected or
presentation-owned POSTs.

Fresh regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/D/Regression-20260821T093322Z/`.

- Movie #2 report/released PNG:
  `ec548b87a6b0caca729ae8a37d1ed1227405e5c46f44a4aa2b8ada54d74e5307` /
  `2f685af592fdd24382b664f39143ee4846f76e1e4a5681876b9ff98af0cde102`;
  session `0523495d-4cb6-46fe-b60d-f5cd38947afb`, revision 23/Week 22/digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
  saved/restored
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`,
  119.001 FPS.
- Reconnect report/PNG:
  `c58bb140adbcbed30cd02cfa48847c1ed3563b633da66492e5877cd71fab41cf` /
  `6cde39fa913f01945d7a167d0fc9737b116062484ac64582d65ea73df8736deb`;
  same logical authority/new runtime, 119.199 FPS.
- Accepted `RuntimeRestart2` ready/report/PNG:
  `e06cc19e99bbf5a1ef75603348e9f65ff8ed876dca4aac1e1f61f00ae3c591b8` /
  `3e2e7be339a6c1dddbc61760364ab1cf51f20228cd4ae416dc402b5b448ac906` /
  `878f533dfa92d448ba99abd1dd63ffa34f10fb3e5832f58caf74e2d9562ce632`;
  exact initial PID `81829`/incarnation, replacement PID `81939`, pinned port
  `62737`, one outage/replacement, same authority, 119.999 FPS.
- Superseded restart report
  `ee8631e363ca402cd56d7dd1c857a79bae5f915449dea7572b381811490035c2`
  missed the operator kill window and killed no engine. It is not a product
  failure.
- Runtime checkpoint: V1/protocol `4`/schema `ba9cd199...`, revision `23`, 25
  journal entries, 1,354,914 bytes, SHA-256
  `4cff54571eba36eecdfded011c5e840c4eadd48dcfa8771dfeea37b0bc6473da`,
  exact saved digest above.

### Visual ruling and residuals

Checkpoint 12 is meaningfully recognizable as a working soundstage. The five
states are distinct, and Shooting clearly reads as a film camera, boom,
director, cast, and crew around a dressed set. This is real visual progress.

It remains below
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`: art/materials and
lighting are low-detail and flat, roles are tiny, portrait framing leaves empty
bands, and the load-in truck is clipped. Frustum inclusion is not proof against
occlusion. Director-blocked Waiting shares rehearsal Waiting. The accepted
restart report's `exactMovie2Released: false` is the existing schema quirk even
though the exact Movie #2 release milestone and restart invariants pass.

Counts, tests, build bytes, and FPS prove engineering health only. They must
never be combined with the visual ruling to manufacture a Golden decision.

### Recovery and launch

For exact Checkpoint 12 continuation, use TypeScript
`93e15232915695e904680c34e2e1abbb4a5e5152` with Unity
`219f290e3dc4b7174ee2ff26992692e8b2779c89`, then launch:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

For immutable CURRENT BEST recovery/build, use both M4 tags in the first
section, never the moving campaign tips. Preserve this section's containing
docs-only child of `93e1523...`; resolve it with `git rev-parse HEAD`, and after
push require HEAD equal upstream plus a clean tracked tree. Unity must remain
clean at HEAD/upstream `219f290e...`.

### DO NOT TOUCH

- Do not create/move M5, move/delete M1-M4, or promote Checkpoint 12. M4 remains
  sole CURRENT BEST.
- Do not alter TypeScript authority, protocol/schema/generated DTOs, V14,
  `GameState`, identity, RNG, economy, or gameplay formulas for visual work.
- Do not weaken Stage truth, state-root, authority/ambient, viewport, no-POST,
  Movie #2, reconnect, restart, or checkpoint assertions.
- Do not equate frustum checks with occlusion proof, classify the missed-kill
  attempt as a product defect, or hide the restart-report schema quirk.
- Do not commit native apps, evidence, profiles, checkpoints, screenshots,
  logs, caches, locks, or protected reference assets.

### Promotion decision and next exact action

Checkpoint 12 is **SEALED NON-GOLDEN** and receives no tag. Golden M4 remains
the sole CURRENT BEST; promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

The next unit is one bounded Stage 7 visual slice improving set/role close-read,
material depth, practical/cinematic lighting, and landscape/portrait
composition while preserving exact five-state truth. Rerun the Stage proof and
full Movie #2/reconnect/restart gates. Do not divert to infrastructure and do
not consider promotion until the images independently satisfy the visual law.

## CHECKPOINT 11 PUSHED CAMERA/LOCATION PAIR - HISTORICAL NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

This section records the compatible pushed campaign tip after Golden M4 and
before Checkpoint 12. Checkpoint 12 above supersedes it as the current
development base. Checkpoint 11 remains useful production history, but it is
not CURRENT BEST, Golden, tagged, canonical, or ready for canonical promotion.
The Golden M4 section above remains authoritative.

| Component | Repository | Branch | Exact product SHA | Direct parent | Tag |
| --- | --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `014f7ef94e085222bf375b9457a6b15420fa314c` | `db03bd8400e79822262a17ba73b0a4c829dc91ff` | None |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `5c8a0eee7fa16bb9fd486fb61707230b208330d6` | `6b32335447848ed0680eb8077e78ee36aded5d56` | None |

Both product commits are pushed. They are the only compatible Checkpoint 11
product pair. The TypeScript branch has since added docs-only continuity
`ef6bb94d5bc05fd8a8166c8e7ac059a766e0b8e2`, pushed test-only repair
`21629d2323dc11bc5927ff209f9255909fb5afe2`, and preliminary docs-only seal
`600e014f3bd862583ee1605d158d1f8edb1f525e`; none replaces the product SHA.
The documentation-only commit containing this section is the direct child of
`600e014f...` and cannot embed its own resulting SHA. Resolve it with
`git rev-parse HEAD`; the sealed branch must have HEAD equal configured
upstream and a clean tracked tree. Never pair `014f7ef9...` with a Unity commit
other than `5c8a0eee...`.

The exact immutable CURRENT BEST remains Golden M4: TypeScript
`11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` plus Unity
`6b32335447848ed0680eb8077e78ee36aded5d56`, both under the pushed annotated
tag `golden/unity-convergence-m4`. No M5 tag exists or is authorized here.

Checkpoint 11 remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated TypeScript/Unity C# DTO copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
TypeScript remains sole simulation authority.

### Why Checkpoint 11 is the better development base but cannot supersede M4

Checkpoint 11 establishes the first coherent technical path between the two
required player scales:

- projection-v4 physical bodies are joined through the canonical
  `lot.property.buildings[].id` namespace instead of display/facility guesses;
- stage, active-production, and production-operation locations resolve exactly
  once; non-expansion placements join `placedFacilityId` to `placed-{id}`;
  unknown/ambiguous joins fail closed;
- explicit Unity location bindings isolate physical presentation identity from
  operational facility IDs and generic selectable IDs;
- typed Cinemachine management and human-scale inspection cameras blend between
  authored whole-campus, Stage 7, and Administration views;
- deocclusion/collision, mouse/touch sampling, UI gesture exclusion, double
  activation, Back/Escape/Home return, and management-panel restoration are
  implemented without a Bridge POST or C# gameplay authority;
- native 1440/narrow camera evidence and fresh Movie #2/reconnect/restart
  regression evidence pass.

Those improvements make Checkpoint 11 the correct and materially better base
for the next bounded development slice. They are reversible, current-baseline
client work rather than a wholesale merge of stale PR #5. They do not satisfy
the complete Golden acceptance contract and therefore cannot supersede sealed
M4 as CURRENT BEST. The overview remains a diorama, Administration is empty,
materials/people/period identity remain weak, and the generic HUD dominates
narrow screens. A technically stronger camera that still produces the
wrong-game response fails the governing visual gate.

### Launch and rebuild

Rebuild the compatible native app when the ignored build is absent:

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

For immutable CURRENT BEST recovery/build, use the M4 tags in the top section,
not these moving campaign branches.

### Validation summary

- Full TypeScript suite passed: 336 files, 4,525 passed, 5 skipped, 0 failed.
- Bridge aggregate passed 99/99; bridge/full typechecks and production build
  passed.
- Browser runtime audit reports 0; repository hygiene passed across 1,032
  files; all 26 adopted 3D assets pass with 0 hard violations.
- Unity EditMode passed 86/86.
- Canonical scene validation passed with 32 people, 10 vehicles, 18 equipment
  objects, 4 capture anchors, 0 errors, and 0 warnings.
- Native macOS build passed at 137,037,930 aggregate file bytes.
- TypeScript exact-product GitHub Actions run `32454923261` passed every step at
  `014f7ef94e085222bf375b9457a6b15420fa314c` in 12m12s, including bridge/full
  tests, typechecks, production build, hygiene, and adopted assets.

### Post-product continuity CI repair

- Docs-only `ef6bb94d...` triggered run `32456422238`. Its Bridge step failed
  because the test helper enumerated an atomic lease candidate that disappeared
  before `lstat`, producing `ENOENT`. This is a legal publication TOCTOU in test
  inspection, not a product/runtime/camera defect.
- Pushed test-only `21629d2...`, direct child of `ef6bb94d...`, tolerates only
  `ENOENT` for an already discovered entry. The scan root, `EACCES`, and every
  other error remain fail-closed; symlinks stay excluded and stable files stay
  inspected.
- Deterministic file/directory disappearance and `EACCES` coverage pass.
  Supervisor tests passed 11/11 three consecutive times; bridge passed 100/100;
  contract check, bridge/full typechecks, and diff hygiene passed locally.
- Exact repair CI run `32457020574` passed every workflow step at
  `21629d2323dc11bc5927ff209f9255909fb5afe2` in 11m41s. Failed run
  `32456422238` remains superseded test-harness history. This later validation
  history does not change the Checkpoint 11 product pair or its non-Golden
  decision.
- Preliminary docs-only seal `600e014f3bd862583ee1605d158d1f8edb1f525e`
  then passed exact CI run `32458198739` in 11m38s with every workflow step
  green. The documentation-only commit containing this section is its direct
  child; it changes no product or promotion fact.

Accepted 1440x900 camera evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Final-20260821T060033Z/`.
Report SHA-256 is
`249c812d2279dd762ffc1f04efc80e08ebf7ee7597b2c12cc11b43e5a1afe912`;
the management, Stage 7, Administration, and return frames are
`b557f2feeb57b4c5061fb138f904a3e83a780a5021101f13ba9a17bfd1e0f546`,
`a682901c243e17460a626f041ef347a557bf91c16c21eb01f5f73442aa0bf242`,
`476ae54561ea4d55b55167136601858c5fb0bf9312c29635e73f72ab9b525722`,
and `df8e8d166499e17dbf5a5a76314a843b2e803f33f60e487db99bdf85f726a02d`.

Accepted 390x844 camera evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Camera-Narrow-Final-20260821T060033Z/`.
Report SHA-256 is
`f9bdeaf47d7be7056d97039520d47ef87d337b503e3c67f1d29e706505ab067b`;
the four frame hashes are
`8a2f4507c67d81496e28d0fc8993482c041bb18985b7e1948d32fa93537152ea`,
`6c8ab65c88768560ed754f9431d68f74d15d147edf61e99f1a8d9f168b4478d6`,
`b108ea3ff74d457ab8aa6bc633b210212d46749de7e2b25e97e6fa519ed6d2db`,
and `601bf0b1de6f8738755684a9a94f1ce2af9ce2dac7b54e0ec0a220fabce769d6`.

Both accepted camera reports preserve exact shooting session/revision/week/
digest, observe no Bridge POST, restore the workflow panel and management
input, and pass an `8.6125526`-metre collision displacement/recovery. Their Back
proof calls the production return path deterministically.

The three external GUI activation attempts under `Evidence/C/Camera-Touch-*`
failed closed because the unattended macOS process remained behind
`loginwindow`; no activation reached the GUI and no false success was emitted.
Their report hashes are
`74e49bcc1e9c5a613f5babef40654523cdb6773e7d14e4ca77a297471a521251`,
`94bb6e2b851eb72e0551a72e740c704bc3f93ee3711e999f15b273fd7a5402ce`,
and `6757fe48e9682da5353435cf91f248b0e65a7cd236b9c70904138870a4cc0e48`.
They are superseded environmental attempts, not accepted real-click evidence.

Fresh regression root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/C/Regression-20260821T062502Z/`.

- Movie #2 report/released frame:
  `c0fbb5e185a38e67886ea4e73a67de5109467f9314f8db1e9eabe0f26ce09600` /
  `5d01de0a80a2f5daea3b77b7970de2bd35f5647ca326e31f1e9017f2cfd11cbd`.
- Reconnect report/frame:
  `66578dac0eed82ef504cb51ffb87b0f3501a00041128b92c7d64955eae5b20bd` /
  `21f1aad7c4aec3fc9da5defd6b1639d5895ecf0956f4580e96e158a444f83b4e`.
- Restart report/ready/frame:
  `101cc3d8c81631c9e07486759e8926c52d4cf72165ec885e656164ea320526e3` /
  `96027cba21bd3c44d6efe5aab908818ca62e0b2495efee5638fd2cf686388208` /
  `0d63226b667f05680594e942da6bd0526dd59b00fa410e0587fdfbeef6aa9ecc`.
- Final runtime checkpoint: 1,354,919 bytes, 25 journal entries, SHA-256
  `657458a33f8417e50da5d50d308161598705e0360de6d5403fd31e843a6df02e`.
- Movie #2 releases at revision 23/week 22/digest `429b88d...`; save/load
  restores `5543ef56...`; reconnect preserves exact authority; an actual
  validated engine PID is killed/replaced with outage retention, disabled
  actions, and zero torn reads. The three accepted runs average about 120 FPS.

### Visual status and promotion decision

The governing six-page visual reference is
`/Users/bruce/Downloads/project-studio-visual-fidelity.pdf`, 1,087,211 bytes,
SHA-256
`692140a7d4be313fd1df7605c96306a9f7e53f4fce46bc0f69a5ec1453a96a39`.
It and representative The Movies screenshots are visual references only. No
protected Lionhead asset, texture, layout, UI artwork, or production material
was copied or imported.

Stage 7's close view is the successful part: people and cameras/lights/boom now
read at a useful human scale and the activity more visibly resembles
filmmaking. The overall product still fails the acceptance law:

- management remains a flat tabletop/diorama view;
- the generic workflow HUD is oversized and overwhelms the narrow viewport;
- Administration is flat, empty, and not an inhabited institution;
- people are not sufficiently proportioned, faced, styled, wardrobed, or
  role-readable;
- surfaces lack believable authored variation and the campus lacks consistent
  period communication;
- the product would not yet reliably provoke veteran recognition without the
  title.

The missing foreground click/touch proof is a second, narrower evidence gap.
Therefore Checkpoint 11 is **NON-GOLDEN** and receives no tag. It does not
supersede M4, and neither repository is promoted to canonical. Packaging and
main-line reconciliation remain deferred until later. Promotion status remains
exactly **GOLDEN — CONTINUE CAMPAIGN**.

### Next exact action

Implement one bounded production-art slice on this pushed pair: make Stage 7
and Administration visibly inhabited and period-readable with authored
material variation and role-readable people, plus a restrained world-first
responsive HUD. Then rerun the identical 1440x900 and 390x844
camera/collision/authority comparison and a real foreground pointer/touch Back
activation before any M5 or canonical decision.

## PRIOR GOLDEN M3 REGISTER - HISTORICAL

This section records M3 as it stood before Golden M4. Every statement below
that calls M3 CURRENT BEST is historical and superseded by the M4 authority
above. M3 remains an immutable recovery tag, not the current build-from pair.

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `e9c6f06b717a6a106281b189a61072e35770155f` | `golden/unity-convergence-m3` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | `golden/unity-convergence-m3` |

Both annotated tags are pushed and remote tag dereferences were verified at the
exact product SHAs. Both campaign branches have since advanced beyond M3; the
TypeScript worktree now contains an uncommitted Checkpoint 10 candidate atop
its pushed continuity tip, while Unity remains at the pushed Checkpoint 9
client. Neither moving branch/worktree is the M3 product authority. M3 remains
this schema-pinned compatible pair: protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Never build, recover, or promote only one side.

### Current Golden tags

- M3 TypeScript: `golden/unity-convergence-m3` ->
  `e9c6f06b717a6a106281b189a61072e35770155f`.
- M3 Unity: `golden/unity-convergence-m3` ->
  `40465d48c191c9dcdda2c6b32c17c9675f4908a4`.
- Preserved M2 TypeScript: `golden/unity-convergence-m2` ->
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- Preserved M2 Unity: `golden/unity-convergence-m2` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Preserved M1 TypeScript: `golden/unity-convergence-m1` ->
  `cd2b15872ac5849fa16beec1775543758cb3139e`.
- Preserved M1 Unity: `golden/unity-convergence-m1` ->
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

M3 supersedes M2 as CURRENT BEST. No prior tag was moved or deleted.

### Parent and base SHAs

| Component | Direct parent | Frozen campaign base |
| --- | --- | --- |
| TypeScript authority | `85429f9d18e2b6321e21557bdb068b1047b4c452` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

### Why M3 is better than M2

M3 preserves every M2 queue-law, identity, determinism, save, Movie #2, and
visual capability, then closes the genuine-command rejection experience across
the schema boundary:

- every genuine rejection carries a closed TypeScript-owned category, blocker,
  required-nullable holder, and remedy;
- all 12 codes map centrally while capacity-full commission, auditions, and
  greenlight remain accepted queue receipts;
- Unity consumes the generated DTO, rejects malformed guidance, and binds a
  notice to exact session/revision/week/digest authority tokens;
- same-state polls no longer erase the explanation after one second;
- accepted command/save/load and session changes clear the notice;
- raw engine diagnostics stay in logs/evidence while the HUD shows WHAT
  HAPPENED, optional CURRENT HOLDER, and WHAT NEXT;
- a race-free native proof demonstrates retention across a later successful
  poll without mutating TypeScript truth.

No gameplay formula, GameState field, V14 save shape, RNG stream, identity,
economy rule, construction rule, or simulation authority moved into C#.

### Launch command

Create detached worktrees from both immutable M3 tags so active campaign work
cannot silently change the product being launched:

```bash
git -C '/Users/bruce/The Movies - Unity Production Convergence 80H' \
  worktree add --detach '/tmp/project-studio-golden-m3-ts' \
  golden/unity-convergence-m3
git -C '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  worktree add --detach '/tmp/project-studio-golden-m3-unity' \
  golden/unity-convergence-m3
```

Terminal 1:

```bash
cd '/tmp/project-studio-golden-m3-ts'
npm ci
npm run bridge
```

Build in the detached Unity M3 worktree:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/tmp/project-studio-golden-m3-unity' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-m3-native-build.log \
  -quit
```

Terminal 2:

```bash
cd '/tmp/project-studio-golden-m3-unity'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

### Validation summary

- TypeScript full suite: 327 files, 4,452 passed, 5 skipped, 0 failed.
- Bridge/schema: 26/26; both typechecks; production build; generated drift;
  Movie #2/determinism proof; browser dependency, repository hygiene, and 3D
  provenance gates all passed.
- Unity EditMode: 24/24.
- Native build: 136,938,870 bytes.
- Fresh native Movie #2: Week 22/revision 23; exact title/project/production;
  final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/load: exact saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Structured stale proof: category `state-stale`, null holder, non-empty
  blocker/remedy, unchanged revision/digest, retained from poll 11 to poll 12.
- Reconnect: separate native process recovered Week 22/revision 23/final digest.
- Performance: 119.3803 FPS proof and 118.9993 FPS reconnect on Apple M3 Max.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained screenshot
  SHA-256 `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Independent red-team: no open P0 or P1 finding.

### Movie #2 status

Playable end to end from real TypeScript intents: screenplay, review, auditions,
evidence, package/greenlight, pre-production, director call, scenery load-in,
shooting, save/load, post, release, stale rejection, and reconnect. Exact route:
`The Reluctant Cornerstone`, `script-0001`, `prod-0013`.

### Visual status

M3 improves the retained error presentation only. World art, camera, people,
materials, animation, and activity remain visually equivalent to M2 and below
ADR 0006. The campus still reads too much like a distant diorama; M3 does not
claim the required inhabitable, human-scale filmmaking uplift.

### Known defects

- P1: replay/session/save state remains process-memory-only.
- P1: launch and shutdown still require two manually managed processes.
- P1: visual recognizability/two-scale camera/Hero Stage 7 target remains unmet.
- P2: unexpected server exceptions retain the unstructured HTTP 500 path.
- P2: reason/category pairing is exhaustive in producer tests, not encoded as a
  cross-field JSON Schema relation.
- P2: some Unity rejection-adapter mismatch branches lack isolated direct tests.
- P2: cross-repository Unity-copy drift is locally gated, not automatic CI.

### Promotion decision

M3 is the best known playable overall product and is recoverable as an exact
pair, so it is a Golden checkpoint. It is **not** promoted to canonical: Phase B
runtime durability is absent, TypeScript `main` remains historically diverged,
and the Unity visual product still misses the binding recognizability gate.
Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

## CHECKPOINT 10 PRE-COMMIT - HISTORICAL GOLDEN M4 CANDIDATE

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

This section records the pre-commit candidate state only. Its M3-current,
uncommitted, no-CI, and no-M4-tag statements were superseded by the sealed M4
section at the top of this register.

This candidate is the first state to accumulate Checkpoints 8 and 9's durable,
authenticated, exact retry/reconnect guarantees with a one-command owned native
lifecycle. It is materially stronger than Checkpoint 9 and is intended to
become Golden M4 if the exact product commit, remote refs, clean-tree gate,
Linux CI, and immutable tags are completed. It is not committed, pushed,
Golden, tagged, or canonical yet. Golden M3 above remains CURRENT BEST.

| Component | Branch | Exact current state | Parent/base state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | Uncommitted Checkpoint 10 source/docs/tests in the dirty worktree; no candidate SHA exists | Pushed HEAD/upstream and candidate parent `808d319bd1b9b2c8b81cd8e2c60808ae0180c8a3`; frozen campaign base `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `campaign/unity-production-convergence-80h-client` | Clean, pushed `6b32335447848ed0680eb8077e78ee36aded5d56` | Direct parent `94e8bcac6a5bf94fd70f3f8a61992511230688a2`; frozen campaign base `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

The candidate remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated C# files remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
No schema, DTO, V14, `GameState`, gameplay, construction, economy, identity,
RNG, projection, art, or asset changed. TypeScript remains sole simulation
authority.

### Why this candidate is better than Checkpoint 9

Checkpoint 9 made engine loss, exact pending POST replay, save/load, and
same-session reconnect correct, but an operator still had to generate/protect a
capability, create a private runtime directory, choose a port, coordinate two
processes, restart the engine, and clean logs/children. Checkpoint 10 adds one
bounded product owner:

- `npm run studio` directly launches the TypeScript engine, waits for a strict
  authenticated health response, then directly launches the compatible Unity
  native executable;
- one stable current-user-private profile preserves current and explicitly
  saved V14 authority across full product launches;
- a new random 32-byte capability and private log directory are created per
  full launch, while engine replacements retain only that launch's capability;
- the first engine obtains an ephemeral loopback port and replacements are
  pinned to the same port while Unity reconnects;
- PID, process incarnation, and process group are tracked in strict private
  leases, with stale-owner recovery and fail-closed cleanup;
- supervisor, engine, and Unity logs are line-aware, exact-secret redacted,
  `0600`, bounded to 2 MiB each, and retained under five-launch/32 MiB limits;
- signal shutdown, startup rollback, restart budgeting, unrelated-process
  isolation, and child-group cleanup are exercised in focused tests;
- ADR 0008 makes the stable-profile/per-launch-capability and development
  `vite-node` packaging boundaries durable architecture rather than an
  undocumented launcher convention.

Native acceptance used the same private profile for fresh Movie #2, two
full-client reconnects, and one automatic engine replacement. Session
`864b0fee-00a3-49bb-9442-72b565410c73`, revision 23, Week 22, final digest
`429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`,
and saved digest
`5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`
remained exact. The final checkpoint has 25 journal entries and SHA-256
`e6907ff5fe552cdc2c1f138458b93d4c2ec50bea4cc9cb4b173514c4fb8ed48c`.

### Candidate launch command

Build the ignored native app first when it is absent:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-b10-m4-native-build.log \
  -quit
```

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

For an isolated persistent proof profile:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm run studio -- \
  --profile-root '/absolute/private/profile/path' \
  --unity-project '/Users/bruce/Project Studio - Unity Production Convergence 80H'
```

### Candidate validation summary

- Full TypeScript suite: 336 files, 4,523 passed, 5 skipped, 0 failed.
- Bridge aggregate: 97/97 across 11 files; both typechecks, production build,
  generated drift, Movie #2/determinism proof, and focused supervisor/process
  tests passed.
- Browser production dependency audit: 0 vulnerabilities. Full `npm audit`
  separately reports 5 development-graph advisories (3 moderate, 1 high,
  1 critical), preserving the explicit `vite-node` packaging boundary.
- Repository hygiene: 1,032 files. Adopted 3D asset audit: 26 assets, 0 hard
  violations.
- Unity EditMode: 62/62 in `/tmp/studio-b10-golden-editmode.xml`.
- Compatible native macOS build: passed/launched, 136,980,022 aggregate file
  bytes.
- Fresh supervised Movie #2: passed construction, complete Movie #2,
  save/load, retained stale guidance, and release at Week 22/revision 23.
- Full-client reconnect: passed twice from the same stable profile and exact
  logical authority.
- Automatic engine restart: passed one actual replacement on the pinned port,
  with outage observed, actions disabled, exact projection retained, stable
  authority, and zero torn reads.
- Performance on Apple M3 Max: Movie #2 119.3772 FPS; final reconnect 119.1999
  FPS; accepted restart 119.5948 FPS.
- Independent bounded audit: no open P0/P1 supervisor/runtime finding after
  ownership, rollback, health parsing, group cleanup, restart budget, and log
  fixes.

Accepted evidence root:
`/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/B10/Supervisor-20260821T035727Z/`.

- Movie #2 report/released frame SHA-256:
  `126152d4f91f64800ec6f88f22831cc6c0b297f3d97e9898ed5ef95c7db72f0e` /
  `d6fdf5d26598d968906d19d0bec4d3e7a646415d2e5279b9c4ef6eda2add8a12`.
- Final reconnect report/frame SHA-256:
  `128fa7b1c58db4541b9c87bd9e3bca3bcefed16219edb61362ba1642bd92a050` /
  `b1098fce189ca5f32a072e8c7c464274c329ee4d944ccf561b67c5f3f922fee3`.
- Accepted `RuntimeRestart2` report/ready/frame SHA-256:
  `65e4be5b7f2ef0bf0bc82432dad45b4212cd21ef9bcc555e75cb90fe6ce4087c` /
  `eaeacbcfc155abb977c19c92b21750bbf2bab532acd814e31c4a8c5399952c1c` /
  `171306b2701401a38464353f31a0ccd969caf2858bafdf245421ed89b5a740fe`.
- `RuntimeRestart/` is invalid, operator-timeout evidence: report/ready hashes
  `37a7dc93035a910c625a774a418525ab443ac8fe0e084985e45b06426a8a1b99` /
  `6de34f15b9f12da345cbaa9441fef658b8e30c68a967fd2e870aa5c8b748b63f`.
  It was superseded by `RuntimeRestart2` and must not be cited as a pass.

### Movie #2 status

Fresh supervised Movie #2 is playable end to end through construction,
screenplay, auditions/evidence, editable casting/package, greenlight,
pre-production, director/scenery blockers, load-in, shooting, save/load, post,
stale rejection, release, full-client reconnect, and engine replacement. Exact
identity is `The Reluctant Cornerstone`, `script-0001`, `prod-0013`.

### Visual status

No visual uplift is claimed. Direct inspection of the B10 overview,
construction, production, release, reconnect, and restart frames shows the same
sparse elevated diorama, oversized generic proof HUD, flat materials, small
role-unreadable people, weak filmmaking activity, and uninhabitable camera
distance as M3. This remains below ADR 0006 and the visual-fidelity ruling.

### Known defects and candidate decision

- There is no known P0/P1 lifecycle regression, but the existing campaign-level
  P1 visual recognizability/two-scale-camera/Hero Stage 7 gate remains open.
- P2: accepted restart evidence reports `exactMovie2Released: false` because the
  restart-only proof does not populate unrelated Movie #2 identity fields; its
  exact milestone and authority are nevertheless present and stable.
- P2: the Linux `flock` owner-lock path awaits exact-product CI.
- P2: production packaging and emitted dependency auditing remain incomplete;
  the dev `vite-node` graph has the five advisories recorded above. Do not use a
  forced audit upgrade or misstate the clean browser audit as whole-runtime
  coverage.
- Candidate source, continuity docs, and tests are dirty/uncommitted; therefore
  no exact product SHA, pushed candidate ref, clean-tree proof, CI run, or M4
  tag exists.

Checkpoint 10 is a **GOLDEN M4 CANDIDATE**, not a Golden Checkpoint. It does not
supersede M3 until its exact source is committed/pushed, exact-product CI is
green, both trees are clean, and immutable M4 tags are created and remotely
verified. Do not create or claim `golden/unity-convergence-m4` from the dirty
tree. CURRENT BEST remains the exact immutable M3 pair at the top of this file.
Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**.

After seal, the next product action is: implement a visible vertical slice
combining schema-backed stable Stage 7/Admin location IDs with a Cinemachine
management-to-inspection click focus transition, then capture before/after
evidence at both camera scales.

## CHECKPOINT 9 SEALED PHASE B PAIR - HISTORICAL NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

This section is historical. Its M3-current statements record the Checkpoint 9
decision at that time and are superseded by Golden M4 at the top of this file.

Checkpoint 9 is a validated, protocol-pinned, committed, pushed, and recoverable
compatible pair. It is not CURRENT BEST, Golden, tagged, or canonical. Golden
M3 at the top of this register remains the sole answer to "what should we build
from now?"

| Component | Branch | Exact pushed product SHA | Parent / state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `114c99c1c4e5623c5ea3e0c60864faed925fb33e` | Parent `b1738b92bd988bf5535629babb1223903ffad802`; product commit pushed; branch may have one continuity-only descendant |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | Parent `94e8bcac6a5bf94fd70f3f8a61992511230688a2`; branch clean at exact pushed product SHA |

Both product commits and campaign branch tips are pushed and remotely verified.
The TypeScript commit is `test(bridge): seal exact in-flight response recovery`;
the Unity commit is `feat(bridge): recover in-flight actions after engine loss`.
These two product SHAs are the only compatible Checkpoint 9 pair. The containing
TypeScript continuity-only commit does not change the product pair.

The checkpoint remains compatible at protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated C# copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
There is no schema, generated DTO, V14, `GameState`, gameplay, identity, RNG,
projection, art, or asset change. TypeScript remains sole simulation authority.

### Why Checkpoint 9 is better than Checkpoint 8

Checkpoint 8 detects an engine outage, retains a paused exact projection,
distinguishes runtime replacement from logical-session replacement, and safely
rejoins authority. It deliberately discards an unresolved POST outcome rather
than guessing. Checkpoint 9 closes that final commit-before-response window:

- Unity retains one immutable exact route/body/command/session/revision envelope
  before first send and never reconstructs it from presentation state.
- After ambiguous transport loss, `/session` must confirm the same logical
  session before Unity retries the exact bytes. Session replacement discards it.
- Cached, fresh, historical, and later-stale outcomes are reconciled against the
  originating and handshake authority; contradictions fail loudly.
- A fresh `/session` plus `/snapshot` join is mandatory before recovered
  completion is published or actions resume.
- TypeScript exposes a canonical one-shot post-commit hold/drop seam only in a
  test process with durable state; normal product startup receives no fault
  control.
- A separate fail-closed verifier binds server commit/replay markers, Unity
  receipt hashes, the four-process restart topology, and the exact ordered
  durable journal rather than trusting one self-reported proof file.

An actual native run killed three successive TypeScript engine processes after
the command, save, and load were durably committed but before their responses
were delivered. One logical session survived; Unity observed 10 outage polls,
three runtime replacements, three exact retries, three recoveries, retained a
paused projection, and completed at exactly revision 2 with no torn read or
duplicate mutation.

### Sealed product files

TypeScript:

- `bridge/server.ts`
- `bridge/testing/in-flight-evidence-verifier.ts`
- `bridge/testing/post-commit-response-gate.ts`
- `package.json`
- `scripts/verify-bridge-inflight-evidence.ts`
- `tests/bridge-inflight-evidence-verifier.test.ts`
- `tests/bridge-process-restart.test.ts`

Unity:

- `Assets/Studio/Runtime/Infrastructure/StudioBridgeClient.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgePendingPost.cs.meta`
- `Assets/Studio/Runtime/Infrastructure/StudioBridgeTransport.cs`
- `Assets/Studio/Runtime/Presentation/StudioBridgeProofRunner.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs`
- `Assets/Studio/Tests/EditMode/StudioBridgePendingPostTests.cs.meta`

The three campaign documents are intentional continuity-only TypeScript changes.
No generated data, evidence, builds, logs, caches, secrets, lock files, or assets
belong in either product commit.

### Validation summary

- Full TypeScript: 334 files, 4,510 passed, 5 skipped, 0 failed; both
  typechecks, production build, generated drift, Movie #2/determinism proof,
  browser dependency audit, repository hygiene over 1,022 files, and 26-asset
  provenance audit passed.
- Exact-product GitHub CI passed every Bridge contract workflow step for
  TypeScript `114c99c1c4e5623c5ea3e0c60864faed925fb33e` in run `32441324305`
  (11m17s).
- Bridge aggregate: 84/84 across 9 files. Evidence-verifier mutation suite: 8/8.
- Unity EditMode: 62/62. Native macOS build: 136,980,022 aggregate file bytes.
- Final in-flight root:
  `Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021520Z/`.
- In-flight Unity report SHA-256:
  `b6d9dcb95686d32c24690d1136899b8b195204b57350267263ce5141fea2ff77`;
  verifier receipt:
  `20f3ec25f3fe3724c5b35c39c4f4f79a199a2aa309da2a3816654071f7235403`;
  recovery frame:
  `9621d7ab21196465cb684b5e3879419af0da1d15c02a0cb82fe8c05edd17cc9a`.
- In-flight checkpoint: 897,790 bytes, exactly three ordered journal entries,
  SHA-256
  `3bcbc4009efe5a5f1de972862a233118dd7b93aacc3b2f97f3df0cc23cebe1ff`;
  same session `efcd5d93-7a62-48dc-bb70-1969d48fa617`; final revision 2;
  current/saved/restored digest
  `141f95a8222cee274d913eb0d68ad6f461f4e2f35f6f49c4fc71c08cfb4992b5`.
- Fresh Movie #2 regression root:
  `Evidence/B/Checkpoint9-Movie2-Regression-Protocol4-20260821T022838Z/`;
  report SHA-256
  `b25f679d2470c8e4ee642770b36738e38f247ee438008c780c16835257a186b9`;
  Week 22/revision 23/final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`;
  exact saved/restored digest
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Idle restart regression root:
  `Evidence/B/Checkpoint9-Runtime-Restart-Regression-Protocol4-20260821T022933Z/`;
  report SHA-256
  `cebc3c4d7599101c10ee7748205b2629b73cb36621f7b23a4fe969e4e5d7afeb`;
  one runtime replacement and three outage polls with exact stable logical
  session/revision/week/digest.
- Performance samples: 119.1992 FPS response-loss proof, 119.9976 FPS Movie #2,
  and 118.9989 FPS idle restart on Apple M3 Max.
- Independent final audit found no remaining P0/P1 in this bounded checkpoint.

The earlier root
`Evidence/B/InFlight-Post-Recovery-Protocol4-20260821T021103Z/` is explicitly
superseded. It failed before sending a POST because the proof hardcoded an
unavailable `advance-week` intent, retained revision 0/an empty journal, and
left a stale ignored lock. Its report SHA-256 is
`a2bc3ae4e3d41416d1bdb943d0d793e90f2de4ec9ceba167368747c854511e50`.
Do not use that root as promotion evidence or reuse its runtime directory.

### Movie #2 status

Fresh native Movie #2 remains playable end to end: construction, screenplay,
auditions/evidence, editable casting and package, greenlight, pre-production,
director/scenery blockers, load-in, shooting, save/load, post, stale rejection,
release, and reconnect. Exact identity remains `The Reluctant Cornerstone`,
`script-0001`, `prod-0013`. Checkpoint 9 adds resilience underneath this path;
it changes no production rule.

### Visual status

No visual improvement is claimed. The new recovery screenshot was inspected and
remains equivalent to M3: elevated sparse diorama framing, flat materials,
small role-unreadable people, weak visible filmmaking, and a large generic proof
HUD. The checkpoint remains below ADR 0006's inhabitable, period-authored,
two-scale visual acceptance gate.

### Known defects and promotion decision

- The pair is committed and pushed, but remains intentionally non-Golden because
  the default runtime lifecycle and visual gate below are incomplete.
- Default launch remains manually coordinated. No one-command supervisor owns a
  private durable root, random port, capability handoff, health readiness,
  engine restart, stale cleanup, graceful shutdown, and bounded logs.
- The bridge still runs through `vite-node`; the emitted/pinned runtime graph
  and direct production dependency audit remain incomplete.
- Visual recognizability, Hero Stage 7, human-scale inspection, role-readable
  people, period materials, and visible filmmaking remain below the binding
  product floor.

Checkpoint 9 materially supersedes Checkpoint 8 as a validated, pushed Phase B
recovery checkpoint, but it does not supersede Golden M3 as CURRENT BEST. It
receives no tag and no canonical promotion. Promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

After the containing continuity-only update is committed/pushed and both trees
are clean, the next engineering action is the one-command supervisor with
private durable root, random port, environment-only capability handoff,
authenticated health readiness, engine restart, stale cleanup, graceful
shutdown, and bounded secret-free logs. The existing exact retry path must be
proven through that entry point.

## CHECKPOINT 8 SEALED PHASE B PAIR - HISTORICAL NON-GOLDEN

This section is historical. Its M3-current statements record the Checkpoint 8
decision at that time and are superseded by Golden M4 at the top of this file.

Checkpoint 8 is a validated, protocol-pinned, committed, pushed, and recoverable
compatible pair. It is not tagged, Golden, or canonical. Its exact product SHAs
and parents are:

| Component | Branch | Exact product SHA | Parent | State |
| --- | --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `720826bd843995920bb2f219ab21203d236c1879` | `550eae6799b5cb64f567b42ab688a2bc76f5a073` | Product commit pushed; branch may have one continuity-only descendant |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `94e8bcac6a5bf94fd70f3f8a61992511230688a2` | `40465d48c191c9dcdda2c6b32c17c9675f4908a4` | Product commit pushed; branch clean at exact product SHA |

The Checkpoint 8 pair is protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
The generated TypeScript C# golden and Unity copy are byte-identical. These two
product SHAs are the only Checkpoint 8 compatible pair; neither side is
independently promotable.

### What Checkpoint 8 adds

- The TypeScript HTTP boundary now requires a canonical non-persisted 32-byte
  launch capability, binds to exact IPv4 loopback, rejects invalid Host and all
  Origin requests, requires JSON for POST, uses bounded HTTP timeouts, and emits
  generic boundary failures without reflecting the capability.
- `/health` and the new `/session` route expose a non-persisted
  `runtimeInstanceId` separately from logical session/revision/week/digest
  authority. Gameplay truth, V14 saves, migration, replay, and outcomes remain
  TypeScript-owned.
- The durable runtime checkpoint moves to protocol `4` with a strict forward-only
  migration from the immediately preceding protocol-3 checkpoint. Migration
  preserves current and explicitly saved V14 bytes, creates a fresh logical
  session at revision zero, discards incompatible replay bytes, commits before
  use, and preserves the old bytes on a failed migration write.
- Unity accepts only exact `http://127.0.0.1:<port>` transport, attaches the
  capability header through one private transport factory, disables redirects,
  joins `/session` before `/snapshot`, rejects persistent torn reads, and gates
  every action until the handshake and applied projection match exactly.
- Unity distinguishes engine-process replacement from logical-session change.
  During an outage it retains the last projection as explicitly noninteractive;
  `SESSION_MISMATCH` discards the prior action, clears session-bound guidance,
  refreshes authority, and never auto-replays a stale or session-mismatched
  envelope. Fatal authorization and contract errors are player-visible without
  exposing the capability.

### Checkpoint 8 validation

- TypeScript bridge/schema/runtime/security: 67/67 passed, including capability
  attacker coverage, runtime incarnation, protocol-3 checkpoint migration,
  persistence/restart, stale/duplicate commands, save/load, and deterministic
  Movie #2 paths.
- Full TypeScript regression: 333 files, 4,493 passed, 5 skipped, 0 failed.
  Both TypeScript typechecks, production build, generated drift, Movie #2,
  repository hygiene, browser dependency audit, and 3D provenance gates passed.
- Exact-product GitHub Actions run `32435419313` passed every configured gate in
  10m54s at TypeScript SHA `720826bd843995920bb2f219ab21203d236c1879`.
- Unity EditMode: 46/46 passed, including strict protocol-4 DTO parsing,
  loopback/capability transport, session/snapshot continuity, torn reads, and
  authority-bound rejection retention.
- Native macOS build passed at 136,955,718 bytes.
- Fresh authenticated native Movie #2 passed the full player path: construction,
  screenplay, auditions/evidence, package and greenlight, pre-production,
  blocker resolution, shooting, save/load, post, stale rejection, and release.
  `The Reluctant Cornerstone`, `script-0001`, and `prod-0013` released at Week
  22/revision 23 with final digest
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
  Saved/restored digest was exactly
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Movie #2 report and 12 milestone captures are in ignored local evidence at
  `Evidence/B/Secure-Movie2-Protocol4-Final-20260821T005553Z/` in the Unity
  worktree. The report completed at 118.9995 FPS with zero torn reads.
- An externally orchestrated idle native engine-kill proof observed three outage
  polls, disabled actions while retaining the exact Week 11/revision 0
  projection, detected one changed runtime incarnation, and returned Live with
  unchanged session/revision/week/digest. Report and capture are in ignored local
  evidence at
  `Evidence/B/Runtime-Restart-Protocol4-Final-20260821T005655Z/`; all restart
  assertions are true.
- Independent TypeScript and Unity audits found no remaining P0/P1 in this
  bounded checkpoint.

### Why Checkpoint 8 does not supersede M3

Checkpoint 8 materially improves the Phase B architecture and native recovery
evidence and is now a recoverable pushed product checkpoint. It still does not
supersede M3 because:

- the default developer launch still starts a memory-only runtime through two
  manually managed processes; no supervisor yet owns a private runtime root,
  random port, capability transfer, child lifecycle, logs, or cleanup;
- exact byte-identical recovery of an ambiguous in-flight command, save, or load
  after a lost response remains unimplemented and unproven; the current client
  intentionally refreshes authority without automatic replay;
- visual output is unchanged from M3 and remains below ADR 0006's inhabitable,
  human-scale, filmmaking-recognizability gate.

Therefore Checkpoint 8 receives no Golden tag and no canonical promotion. It
does **not** supersede M3. CURRENT BEST remains the exact immutable M3 pair at
the top of this register, and promotion status remains exactly
**GOLDEN — CONTINUE CAMPAIGN**.

## PRIOR GOLDEN M2 REGISTER - HISTORICAL

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `7d76951f6ad641e8940b97b03806b87638ed8ad8` | `golden/unity-convergence-m2` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | `golden/unity-convergence-m2` |

Both product SHAs are pushed. They are one schema-pinned compatible pair:
protocol `2`, projection `4`, schema
`sha256:6e75cf246298bb742b66e56a17d8582a71dc2c3edb0c6542ad6595588244e833`.
Do not promote, build, or recover only one side of the pair.

The TypeScript campaign branch may have a continuity-document-only descendant
of the product SHA after this register, the ledger, and the handoff are sealed.
That does not change the product candidate. The M2 tags identify the exact code
pair to build and recover.

## A4 PRE-COMMIT CANDIDATE - HISTORICAL

A4 is a materially stronger compatible working state, but it is still dirty in
both repositories and therefore is not CURRENT BEST, is not Golden, and has no
tag. Golden M2 above remains the sole promotable/recovery answer until A4 is
committed, pushed, and sealed.

| Component | Branch | Current pushed HEAD / A4 parent | Candidate state |
| --- | --- | --- | --- |
| TypeScript authority | `campaign/unity-production-convergence-80h-ts` | `85429f9d18e2b6321e21557bdb068b1047b4c452` | Validated dirty A4 protocol/schema/runtime/generated-golden/tests/README changes |
| Unity production client | `campaign/unity-production-convergence-80h-client` | `a1c27318bec47f1abc4a29b77d9c413bdc8a8778` | Validated dirty generated DTO, strict parser, retention, proof HUD, and EditMode changes |

The A4 candidate contract is protocol `3`, projection `4`, schema
`sha256:3e812c30081ae8c9af3999e8907246c040957dfffedcbcf9909a19c1eeb317ac`.
Every genuine rejection contains a required closed TypeScript-owned
`rejection` object with category, required non-empty blocker, required-nullable
current holder, and required non-empty remedy. All 12 reason codes map in
TypeScript. Capacity queue admission remains accepted and contains no rejection.

Unity strictly parses the generated DTO, binds retained guidance to exact
session/revision/week/digest authority tokens, retains it only across unchanged
polls, and clears it on acceptance or session change. Raw diagnostic messages
remain log-only. The proof HUD renders WHAT HAPPENED, optional CURRENT HOLDER,
and WHAT NEXT.

Validated pre-commit evidence:

- TypeScript: 327 files, 4,452 passed, 5 skipped; 26/26 bridge/schema tests;
  both typechecks, production build, generated drift, Movie #2 proof, repository
  hygiene, adopted-3D guard, and zero-vulnerability browser audit pass.
- Unity: 24/24 EditMode tests; native build 136,938,870 bytes; fresh Movie #2
  release at Week 22/revision 23; exact save/load; retained `state-stale`
  guidance across an unchanged poll; and separate-process reconnect all pass.
- Deterministic final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/load digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Native samples: 119.3803 FPS fresh proof and 118.9993 FPS reconnect.
- Evidence: ignored `Evidence/A4/Rejection-Guidance/`; retained-guidance
  screenshot SHA-256
  `d57920515d9a0de8f3ce804e5f7545496e905b6538cf6eed103a84b9a768b4d5`.
- Independent review reports no open P0 or P1 finding.

Known A4 residuals are an unstructured unexpected-fatal HTTP 500 path,
schema-external reason/category pairing enforcement, several Unity adapter
negative branches without isolated direct tests, and a 256-entry replay cache
that remains memory-only. Visuals are unchanged and remain below ADR 0006; the
candidate still reads too much like a distant proof diorama.

Promotion status remains exactly **GOLDEN — CONTINUE CAMPAIGN**. Do not create
or push an A4 Golden tag from dirty worktrees. After coherent commits exist in
both repositories, inspect the exact compatible pair, verify remote SHAs, and
make the Golden supersession decision from the sealed evidence.

## LEGACY M2 REGISTER DETAILS - HISTORICAL

### Parent and base SHAs

| Component | Direct parent of product SHA | Campaign base / frozen adoption authority |
| --- | --- | --- |
| TypeScript authority | `7218368cddc46eaeb0fb99691489d457a89112d6` | `f6606ac9db67dc70b12a7d247d74206571d12d2c` |
| Unity production client | `7fb693c78da06cca1c8e688340241e1c9fa0b874` | `d970b81c2b17383ee71c3c66a5622ecc140473b3` |

### Canonical / default branches at M2

| Repository | Remote default branch | Last audited SHA | Campaign relationship |
| --- | --- | --- | --- |
| TypeScript | `main` | `5914c84e453461240540184e79b2bd7eafeb647f` | Diverged; the campaign is a large semantic line that requires deliberate reconciliation |
| Unity | `unity-typescript-bridge-spike` | `626c2d3a25f21ebdbb2603939378368af925f18c` | Linear ancestor of the campaign |

The Unity repository's local archival `main` at
`17572ceb376fed048f110f34bbaac2fa7a8095ce` is not the remote default or a
production-promotion target.

### M2 Golden tags - historical

- `golden/unity-convergence-m2` in `HSpector1/The-Movies` identifies
  `7d76951f6ad641e8940b97b03806b87638ed8ad8`.
- `golden/unity-convergence-m2` in
  `HSpector1/project-studio-unity-visual-spike` identifies
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.
- Preserved M1: `golden/unity-convergence-m1` in `HSpector1/The-Movies`
  identifies `cd2b15872ac5849fa16beec1775543758cb3139e`.
- Preserved M1: `golden/unity-convergence-m1` in
  `HSpector1/project-studio-unity-visual-spike` identifies
  `a1c27318bec47f1abc4a29b77d9c413bdc8a8778`.

M2 supersedes M1 as CURRENT BEST. M1 remains an immutable recovery point and
its tags must never be moved or deleted. The frozen adoption authorities remain
additional recovery authorities but were not retroactively relabeled as
campaign Goldens.

### Why M2 superseded M1

M2 contains the complete M1 A1 generated-contract foundation and A2 atomic
projection bundle, then closes the A3 queue-law parity defects across the bridge
and retained TypeScript client:

- commission, exact-project audition, and exact-project greenlight intents
  remain reachable during Development & Casting contention and enter the
  existing TypeScript-authoritative queue rather than being falsely withheld;
- ambient concurrent front-door choices no longer hijack the exact guided
  picture journey;
- exact queued concept/project duplicate guards and read-model suppression
  contain rerenders, panel reopenings, rapid clicks, and stale retained-client
  affordances;
- accepted bridge and retained-client receipts distinguish queued work from an
  immediately committed screenplay, camera test, or production and claim no
  identity, cash, talent, or room the engine has not committed;
- capacity-only casting completion can hand off to Package so the player can
  queue greenlight, while writer, staffing, founding, and duplicate blockers
  continue to fail closed;
- queued audition and greenlight guidance preserves exact screenplay identity
  through waiting, save/load, dequeue, and continuation.

This is a material functional and architectural improvement, not a visual one.
Unity stays at the same exact SHA used by M1 because A3 changes TypeScript
authority, bridge intent availability, and the retained TypeScript client
without changing the generated wire schema or Unity source. TypeScript remains
the sole simulation authority. M2 changes no gameplay formula, save identity,
RNG stream, or Three.js authority boundary.

The Unity visual state is unchanged from M1 and remains below the
visual-recognizability and two-scale-camera ruling recorded in ADR 0006. M2
supersedes M1 functionally despite not claiming visual uplift.

### M2 launch command - historical

Terminal 1:

```bash
cd '/Users/bruce/The Movies - Unity Production Convergence 80H'
npm ci
npm run bridge
```

Terminal 2:

```bash
cd '/Users/bruce/Project Studio - Unity Production Convergence 80H'
'Builds/macOS/Project Studio Visual Spike.app/Contents/MacOS/Project Studio - Unity Visual Spike'
```

If the ignored native app is absent, rebuild it with:

```bash
'/Applications/Unity/Hub/Editor/6000.3.22f1/Unity.app/Contents/MacOS/Unity' \
  -batchmode \
  -projectPath '/Users/bruce/Project Studio - Unity Production Convergence 80H' \
  -executeMethod Studio.Editor.Automation.StudioAutomation.BuildMacOS \
  -logFile /tmp/studio-a3-native-build-seal.log \
  -quit
```

For byte-exact recovery, use clean worktrees at
`golden/unity-convergence-m2` in both repositories. A continuity-only branch
descendant is product-equivalent but is not a replacement for the exact Golden
pair recorded above.

### M2 validation summary

| Gate | Golden M2 result |
| --- | --- |
| TypeScript full suite | 327 files passed; 4,450 passed, 5 skipped, 0 failed |
| TypeScript typecheck | Passed |
| TypeScript production build | Passed; inherited Vite chunk-size warnings only |
| Bridge typecheck | Passed |
| Bridge/schema tests | 24/24 passed, including exact Movie #2, save/reconnect, stale/duplicate, and queue-contention coverage |
| Generated contract | Passed deterministic generation and cross-repository drift verification; protocol `2`, projection `4` |
| Unity EditMode | 15/15 passed |
| Unity PlayMode | No dedicated suite exists; native automation is the runtime gate |
| Native macOS build | Passed: `Build Finished, Result: Success` |
| Fresh native Movie #2 | Passed through release at Week 22, revision 23 |
| Native save/load | Passed; saved/restored digest identical |
| Native reconnect | Passed in a separate process at the same session, revision, week, and digest |
| Stale command | Rejected with `STALE_REVISION`; truth unchanged |
| Duplicate command / duplicate work | Deterministic command replay and exact queued-work guards passed |
| Determinism | Export/import/export byte-identical; headless and bridge save bytes/digests identical |
| Runtime console | No proof failure, error, exception, or protocol mismatch |
| Whole-diff red team | No P0 or P1 finding remains |
| Product-SHA remote CI | GitHub Actions run `32422095175` passed every expanded gate in 9m36s |

Final native evidence:

- build log: `/tmp/studio-a3-native-build-seal.log`;
- Movie #2 proof log: `/tmp/studio-a3-native-proof-final-seal.log`;
- reconnect proof log: `/tmp/studio-a3-native-reconnect-final-seal.log`;
- structured proof:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-client-proof.json`;
- structured reconnect proof:
  `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/bridge-reconnect-proof.json`.

### M2 Movie #2 status

- Status: fully playable end to end through the native Unity proof client.
- Title: `The Reluctant Cornerstone`.
- Screenplay: `script-0001`.
- Production: `prod-0013`.
- Released: Week 22, revision 23.
- Final digest:
  `429b88d5538e44839a7cfa78acc244e8a17f435a1064f9f66ea75b522203ed13`.
- Save/restored digest:
  `5543ef56db8fec0df43f1a8e02548b84d77d393b71dea9cd33659614804cc5ee`.
- Stale intent: rejected with `STALE_REVISION` without changing truth.
- Reconnect: a separate native process recovered Week 22, revision 23, the
  exact Movie #2 identity, and the final digest.

The proof covers screenplay, auditions, editable casting, greenlight,
pre-production, blockers, shooting, post, save/load, release, and reconnect.
It also covers the A3 contention path that queues exact authoritative work
instead of hiding or duplicating it.

### M2 visual status

A3 intentionally changes no Unity art, camera, UI composition, animation, or
world layout. The native A3 captures prove that the M1 presentation is
preserved while the queue-law behavior changes underneath it. Campus scale is
readable, but the proof HUD remains intrusive; people and filmmaking activity
remain weak; and Hero Soundstage 7, materials, era readability, and camera
inspection remain below ADR 0006's commercial floor.

Current local, Git-ignored evidence:

- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/01-whole-lot.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/02-construction.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/03-screenplay-ready.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/04-audition-results-ready.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/05-auditions-reviewed-roles-greenlight.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/06-greenlit.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/07-production-blocker.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/08-shooting.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/09-post-production.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/10-save-load-restored.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/11-movie-2-released.png`
- `/Users/bruce/Project Studio - Unity Production Convergence 80H/Evidence/A3/Queue-Parity/12-reconnected.png`

Latest native Movie #2 sample: 119.18 FPS average, 15,394-byte snapshot,
18.52 ms TypeScript serialization, 3.82 ms strict client parse, 0.33 ms apply,
and 33.25 ms command round trip. The separate reconnect application recovered
the final snapshot with 3.96 ms parse and 4.44 ms apply. These are evidence
samples, not yet a formal Phase L percentile budget.

### M2 known defects

- Phase A3 establishes truthful queue-law parity, but the more detailed
  screenplay/development, casting, package/greenlight, and structured
  holder/remedy projections remain future production work.
- Phase B runtime lifecycle is still two manually managed processes with a
  fixed default port and memory-only session/save/replay state. Engine restart
  loses the session.
- The proof HUD and visual client remain pre-production; M2 provides no visual
  uplift and remains below ADR 0006's visual floor.
- TypeScript CI cannot inspect the separate Unity repository unless it is
  checked out and supplied to the cross-repository drift command.
- The response replay cache remains memory-only and evicts after 256 identities.
- No dedicated Unity PlayMode suite exists.
- The browser npm dependency audit is clean, but the development bridge still
  executes through a dev graph with five advisories (3 moderate, 1 high,
  1 critical). Phase B must package and audit an explicit runtime graph.
- The loopback bridge has no per-launch capability, Host/Origin policy, exact
  JSON content-type gate, or request/header timeouts. These are Phase B
  production blockers, not reasons to expose a public bind.
- Dependabot configuration on the campaign branch remains inactive until it
  reaches the repository default branch.
- Vite chunk warnings and first-import glTFast noise remain under documented
  non-destructive handling rules.

No known P0 regression, P1 regression, or TypeScript-authority violation
remains at the M2 seal.

### M2 promotion decision

**GOLDEN — CONTINUE CAMPAIGN**

M2 is the best-known compatible product pair and supersedes M1 functionally.
It is not being promoted to either canonical/default branch during this
checkpoint for three independent technical reasons:

- Phase B has not yet delivered a production runtime lifecycle, disk-backed
  restart recovery, packaged dependency boundary, or completed localhost
  hardening;
- TypeScript `main` and the campaign line still require deliberate
  reconciliation of a large semantic campaign mega-diff rather than an
  uncontrolled wholesale merge;
- the unchanged Unity client remains below ADR 0006's accepted visual floor and
  cannot yet serve as the obvious commercial-quality canonical product line.

This is a technical-PM rejection of premature canonical promotion, not a
request for Owner arbitration. Continue from the exact M2 pair. Do not mistake
functional supersession of M1 for completion of the runtime or visual product.

### M2 promotion package status

Not prepared. M2 is not `READY FOR OWNER MERGE REVIEW` and has not been promoted
to canonical. The primary rollback/recovery point is the compatible M2 pair
named at the top and preserved by `golden/unity-convergence-m2` in both
repositories. The previous M1 pair remains available at
`golden/unity-convergence-m1` in both repositories and must not be moved or
deleted.
