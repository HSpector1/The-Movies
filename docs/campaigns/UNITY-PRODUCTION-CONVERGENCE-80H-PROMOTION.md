# Unity Production Convergence 80H - Promotion Register

This file is the authoritative answer to: **What is currently the best version
of Project: Studio, and is it ready for promotion?** Preserve every Golden tag.
Do not infer a compatible TypeScript/Unity pair from branch names alone.

## CURRENT BEST PROJECT: STUDIO - GOLDEN M4

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

| Component | Repository | Branch | Exact product SHA | Golden tag |
| --- | --- | --- | --- | --- |
| TypeScript authority | `HSpector1/The-Movies` | `campaign/unity-production-convergence-80h-ts` | `11e2cf88a35ce004ecd7a240fdc2ec892c3688b6` | `golden/unity-convergence-m4` |
| Unity production client | `HSpector1/project-studio-unity-visual-spike` | `campaign/unity-production-convergence-80h-client` | `6b32335447848ed0680eb8077e78ee36aded5d56` | `golden/unity-convergence-m4` |

This exact pair is the sole CURRENT BEST recovery answer. Both annotated M4
tags are pushed and their remote dereferences were verified at the exact SHAs
above. Both campaign branches have advanced to the non-Golden Checkpoint 12
pair recorded below; those moving tips do not replace the tagged M4 product
SHAs. Continue bounded campaign work from Checkpoint 12, but recover/build M4
only from both tags. Never mix sides.

M4 remains protocol `4`, projection `4`, schema
`sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f`.
Generated TypeScript/Unity C# copies remain byte-identical at SHA-256
`1192d58a323e98b4ebab001d910c5f38dfa6455c90b38769e8af6325e84ee1dd`.
TypeScript remains sole simulation authority.

### Current Golden tags

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

M4 supersedes M3 as CURRENT BEST. No prior Golden tag was moved or deleted.

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
campaign worktrees launch Checkpoint 12 and must not be described as exact M4.

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

Checkpoint 11 subsequently delivered the stable Stage 7/Admin location and
two-scale camera gate; Checkpoint 12 adds the working-soundstage slice recorded
below. The current next visual gate is a stronger Stage 7 set/role close read,
material and lighting depth, and landscape/portrait composition.

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

## CHECKPOINT 12 SEALED STAGE 7 WORKING SOUNDSTAGE - NON-GOLDEN

Promotion status: **GOLDEN — CONTINUE CAMPAIGN**

Checkpoint 12 is the compatible pushed campaign tip after Checkpoint 11. It is
a meaningful working-soundstage visual/runtime slice and the correct base for
the next bounded visual unit. It is **SEALED NON-GOLDEN**: it is not CURRENT
BEST, tagged, canonical, promoted, or ready for canonical review. Golden M4
above remains the sole CURRENT BEST recovery answer.

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
