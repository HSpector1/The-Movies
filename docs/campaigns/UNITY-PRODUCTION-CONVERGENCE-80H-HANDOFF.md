# Unity Production Convergence 80H - Current Handoff

START HERE. Read `docs/UNITY-PRODUCTION-CLIENT-DECISION.md`, then the campaign
ledger, this handoff, and the promotion register. The TypeScript/Unity engine
decision is settled. Do not restart planning from scratch.

## GOLDEN M4 SEALED - CURRENT BEST

This is the authoritative current-state section as of the timestamp below.
Golden M4 is the sole CURRENT BEST compatible Project: Studio pair. It combines
the authenticated durable/retry work from Checkpoints 8 and 9 with Checkpoint
10's one-command stable-profile supervisor. Both exact product commits and both
annotated M4 tags are pushed and remotely verified. It is Golden, not canonical
and not ready for canonical promotion.

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

Exact one-command launch from the campaign worktrees:

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
