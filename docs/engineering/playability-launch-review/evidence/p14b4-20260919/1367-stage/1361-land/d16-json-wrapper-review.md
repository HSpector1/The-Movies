# Independent D16 JSON recorder-wrapper review

Reviewer: `/root/recovery_charter`, 2026-10-04. **PROCEED for the parent-controlled D16 run in the existing single heavy lane after the active core run and its postflight finish.** No blocking static defect found in this bounded wrapper revision. This is not D16 execution, result attribution or gate acceptance.

## Exact identities

| File in `/Users/zacheryspector/studio-scratch/1361-land` | SHA256 |
|---|---|
| `recorded-1361-d16-json.sh` | `91a7ac9cc195f8d7641f1459b2298ee6b8b9c72f5bf807cbe04161602a50fcd5` |
| Original `recorded-1361.sh` | `65c9c08f21e452843d35e0f5b29779d88d1a2544541270c38088e8a31bd642b4` |
| `attribute-recorded.py` | `1b596e4dd32c42526fa90c50976004101b38bee2fb1de094d23ab9c4f2b526ab` |

The new wrapper matches the exact SHA requested for review. Reviewed the small original/new diff, the actual recorder/guard source, and the attribution function that binds this report. The original wrapper and both other reviewed programs were read only. This review file is the only write.

## Command and artifact binding

The D16 recorder receives exactly this child command array, with ordinary shell splitting of the fixed `V` string:

```
node_modules/.bin/vitest
run
--config
src/harness/d16/vitest.d16.config.ts
--reporter=verbose
--reporter=json
--outputFile.json=/Users/zacheryspector/studio-scratch/1361-land/d16-vitest.json
```

`run-bounded-source-c2.mjs` records the command plus arguments unchanged in the recorder JSON. This satisfies `attribute-recorded.py:bind_d16_report`: the exact config pair, both reporter arguments and exact absolute output argument match its fixed expected report path. Attribution separately requires the report start and each file interval to fit the completed recorder interval, and checks the complete 176-case inventory, 164 passes and exact 12 failures/full messages against the retained baseline. No wrapper exit code or mere JSON hash substitutes for those attribution checks.

The external report is additional evidence. All five governed recorder paths remain exactly the original names under the original evidence stem:

- `1361-save45-broad-d16.json`
- `1361-save45-broad-d16.patch`
- `1361-save45-broad-d16.txt`
- `1361-save45-broad-d16-preflight.json`
- `1361-save45-broad-d16-postflight.json`

The reporter does not overwrite or repurpose any of those five. The original recorder remains in use; the original wrapper remains available unchanged for the already active run.

## Output refusal and sequencing

Before the D16 preflight, the new wrapper requires an absolute, fixed-basename report path whose parent already exists. It rejects every symlink ancestor, requires the parent to equal its strict canonical resolution, requires the report to be outside the resolved repository, and rejects any existing report object, including a dangling symlink. This provides a fresh path for the exclusively scheduled single-lane run; the wrapper does not claim a new cross-process atomic reservation mechanism.

After the child recorder returns, the unchanged postflight guard runs first. Its actual status is captured immediately. For D16, nonzero postflight stops the wrapper before any JSON hashing. Only a successful postflight reaches the report step, which rechecks ancestor/canonical-parent conditions, requires a regular non-symlink file, reads and parses valid JSON, then records its byte count and SHA256 with `hashedAfterSuccessfulPostflight: true` in the existing external log. Missing, symlinked, truncated or non-JSON reporter output cannot receive that accepted hash marker. JSON parsing here establishes a complete parse; the stronger content and interval checks remain the attribution script's responsibility.

## Preserved source and environment guards

The diff preserves the fixed Node path, repository cwd, caffeinate invocation, remote fetch/HEAD equality, clean tested source paths, landed sibling-test/hygiene checks, 5 GiB disk floor, recorder-stem rule and refusal of the existing five outputs. The 448-file core-list guard and all non-D16 child commands remain unchanged.

Preflight and postflight still use the same `run-bounded-source-guards.py` and bounded recorder. Those retain the actual source inventory, exact HEAD, index/stage entries, manual pins and fixed-source checks. Neither wrapper nor this review authorizes a source edit, commit or `git add` while the recorded run or its postflight is active. Capturing `post_status` preserves the original non-D16 log value and makes D16's additional hash step conditional on successful postflight.

## Validation and limits

Separate `bash -n recorded-1361-d16-json.sh` and `bash -n recorded-1361.sh` checks both returned exit 0. No wrapper, embedded Python guard, recorder, attribution main, Node process, test or heavy tool was executed. No fixture payload was opened and no repository/source/index was changed. The live report, actual recorder command, postflight, JSON timings and comparison remain to be measured and accepted by the parent after the lane is free.
