# Delayed-player original45 route: v2 measurement correction

This preserves the reviewed r1 package at `S/1368-postrelease-prep` unchanged. Parent found that r1 recorded the admitted pre-action6240 save and bytes but timed only the post-release save. The newest Owner requirement asks for save cost before and after, plus relevant execution time. This v2 changes observation only; it retains the exact seed, original source, route, decisions, bounds, qualification and acceptance checks. No runtime or typecheck has run under either proposal according to the parent's dispatch.

## Exact change

`measureSaveCost(input)` factors the existing three pairs of `makeSave` and additional `validateSaveV45` calls. It preserves the sample fields and measured intervals; hashing, final serialization and input-neutrality checks remain outside each pair. At actual unengaged6240, after the original admitted checkpoint is written and before any hiring/action, the same function records `beforeTimings`. Every sample's save SHA must equal the independently admitted `beforeControl.saveSha256`. A failure remains an execution error, and the already-written genuine6240 checkpoint remains available.

The existing post-release `timings` property now calls that same function, at the same location after release proof and exact replay. Nothing changes its three samples or their meaning. Both arrays include sample, writer milliseconds, additional-reader milliseconds, combined milliseconds, raw save bytes and exact raw save SHA. Parent must compare those actual measured values to governing budgets; the operational watchdog is not a save-cost threshold.

Each tail-week row gains `driverExecutionMs`, measured immediately around the one actual `runRosterWallOperatingWeek` call. It includes that source helper's clone, public decisions/actions and its single ordinary tick. It excludes the probe's before/after hashing, public-action replay, save validation and later replay. This reports actual driver execution, not a claimed whole Bridge request or pure isolated core-tick duration. No duplicate driver is invoked. Overall elapsed time remains separately recorded. No optional qualified-boundary or per-signature timer was added.

Only the Python runner's fixed PREP directory changes to this v2 folder; all original archive, published dependency HEAD, exclusive output, five recorder files, source guards, Node20.20.2, 5 GiB, two-hour process-group watchdog and postflight rules are unchanged. The already-staged run layout and uncreated output stay `S/1368-postrelease-run-01`; stem stays `1368-original45-delayed-postrelease-r1` because no attempt has executed and no recorder outputs exist. This stem names the first execution attempt, not the producer revision.

## Artifacts and installation

- `producer-update.patch`: only the probe delta, applicable to the parent's exact already-staged r1 run layout. Verify its old `probe/postrelease.ts` SHA is `2b1eea76ee77fca1326be221a459e47c0ca9b043c006ea754e565a6cf4acf831` before applying.
- `producer.patch`: complete three-file external-layout producer for a fresh preparation; do not apply this additive patch over the existing staged files.
- `v1-to-v2.patch`: review evidence showing the probe change and the runner's sole path change. The runner belongs in this prep folder, not under the external run root.
- `probe/vite.config.ts`, `tsconfig.postrelease.json` and `ORIGINAL-SOURCE-PINS.json`: byte-identical to reviewed r1.
- `run-delayed.py`: use this v2 runner so its SHA manifest binds the updated probe.
- `SHA256.json`: exact complete package hashes; obtain its independently reviewed hash for the invocation below.

No existing archive needs regeneration. After independent exact-hash review, parent applies only `producer-update.patch` within `S/1368-postrelease-run-01` and verifies the resulting probe SHA against this v2 manifest. The original archived gameplay source remains untouched. Then, when the parent's heavy lane is free, run the same explicit strict type project from that run root:

```sh
./tree/node_modules/.bin/tsc --project tsconfig.postrelease.json --noEmit
```

Only after types pass, invoke the v2 runner with the actual published current dependency/tooling HEAD and the independently reviewed manifest hash:

```sh
python3 /Users/zacheryspector/studio-scratch/1368-postrelease-prep-v2/run-delayed.py \
  --head <actual-published-current-dependency-full-HEAD> \
  --prep-manifest-sha256 <independently-reviewed-v2-SHA256.json-hash>
```

All r1 route and provenance requirements remain binding: original gameplay HEAD `d5e2dad1e23183f1a94fe7b7d30e65ed88617f34`, src `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`, seed-b public unengaged genesis, genuine6240 checkpoint before actions, ordinary paid208-week hiring and public activation, unchanged direct-package default tick through at most6344, real post2040 release/history, official invariance and exact saved-boundary replay. The previous natural engaged6240/8791 evidence remains separate. Headless public-engine reachability still makes no Bridge new-game-menu claim.

The r1 package manifest remains `b8588664049c54f1bb9c6b5d9bd08342cfb7608e51b9d28ef507d999b15df738`. Its independent static review remains valid evidence for that exact version; it does not automatically approve this new observation diff. v2 still needs an independent static disposition before parent installation/types/runtime. Runtime qualification, release, replay, before/after costs, driver durations and budget acceptance remain unmeasured.

Only the new v2 scratch folder was written. Python AST parsing and textual/hash comparisons were performed; no Node, tests, types, game execution, archive creation, fixture payload access, live/index/candidate edit or nested agent occurred.
