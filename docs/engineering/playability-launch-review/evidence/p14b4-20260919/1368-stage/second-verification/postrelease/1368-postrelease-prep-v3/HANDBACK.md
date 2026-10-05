# Delayed-player original45 route: v3 explicit config type

Parent's completed type-attempt r3 reached TypeScript and failed only with TS2742 on the Vite config's inferred default export, which required a reference through `tree/node_modules/vite`. The inherited declaration settings require a portable named type. Earlier attempts r1 and r2 failed in wrapper setup before TypeScript (worktree/index lookup and non-Node command rejection respectively); all three remain evidence and none is a passing typecheck.

This v3 preserves r1 and r2 prep folders unchanged. The only TypeScript edit imports the existing Vite `UserConfig` type and gives the unchanged `defineConfig({root: ...})` result an explicit `const config: UserConfig` annotation before default export. The runtime function call, root value, exact config path and plugin-free behavior are unchanged. Probe `postrelease.ts` remains byte-identical to reviewed v2, including beforeTimings, post-release timings, actual driverExecutionMs, qualification, replay and all source/route/output controls. No game source or measurement method changed.

The runner changes only its fixed PREP folder from v2 to v3 so its accepted manifest binds this config. Original source pins, strict type project, dependency HEAD attribution, source guards, named five recorder files, existing first-attempt output root and watchdog remain unchanged. The full details and source-grounded route remain in the preserved r1 handback, with v2's timing correction in its own handback.

`producer-update.patch` updates only the config in the parent's existing external run layout. Its expected old config SHA is `06f583d578f009208180e140d4358a50a72719d2ebf9047b998f01ae901e0877`. `v2-to-v3.patch` additionally shows the runner's sole path edit for review; the runner stays in this prep folder. `producer.patch` is the complete additive three-file external-layout proposal for fresh reconstruction, not an overwrite patch for an already staged layout.

After independent static review, parent applies the config-only update in `S/1368-postrelease-run-01`, verifies the new manifest hashes, then reruns the actual Node-wrapped strict type command under the parent's recorded single lane. From that external run root, the TypeScript command is:

```sh
./tree/node_modules/.bin/tsc --project tsconfig.postrelease.json --noEmit
```

Runtime remains unauthorized by a type failure. Only after the named project genuinely passes, run the v3 recorded wrapper with the actual published current dependency HEAD and independently reviewed manifest hash:

```sh
python3 /Users/zacheryspector/studio-scratch/1368-postrelease-prep-v3/run-delayed.py \
  --head <actual-published-current-dependency-full-HEAD> \
  --prep-manifest-sha256 <independently-reviewed-v3-SHA256.json-hash>
```

The unchanged probe still generates solely with original Save45 `d5e2dad1e23183f1a94fe7b7d30e65ed88617f34`, src `88d0197645b3a5bd69d73ebff0c5c1c9ff0aa837`, seed-b, ordinary unengaged ticks to6240 and a paid public tail bounded by6344. No founding grant, altered cash/history, new seed/horizon, late-start product mode or Bridge-menu claim appears. A genuine post2040 release, original45 admission, exact replay, before/after measured save costs and budget assessment remain runtime prerequisites.

This author performed only Python syntax parsing and hash/text comparisons. No Node, TypeScript, tests, game execution, fixture payload, source/index/candidate edits or new agents occurred. Only the new v3 folder was written. Existing type-attempt results are attributed to the parent, not rerun or rewritten here.
