# 1297-C — Fixed legacy-neighbor manual guard handback

[The companion](1297-C-legacy-neighbors-manual-guard.py) implements the separate pre/post guard authorized by [1297-F](1297-F-parent-plan-adoption.md). It supplements the unchanged bounded recorder/guards for **1298-legacy-neighbors-runtime only**. It neither invokes the test command nor grants permission to run it. Parent execution remains after Q25 closure, independent companion review and publication.

Frozen source:13,645 bytes / SHA256 `4a7e946729e84cbe27bdadf7aeab46ee51d7e524368464c40d53488068e3e63b`. A standard-library syntax parse passed; the companion itself has not been executed. Its fixed literals match the adopted12-file manifest. No project import/compiler/test, live source/index change, broad content inventory or fixture-directory scan was performed.

Exactly17 manual file identities are recorded in each exclusive output: the manifest's12 files, A, B, F, the manifest itself, and this Python source. Exactly three gzip rows also retain their declared decoded identities. The seven P14 corpus payloads are explicitly authorized by the existing plan; the other five manifest rows are two test files, their fixture helper and two Vitest configurations. No additional fixture/e2e/public payload is read. Path literals, complete manifest bytes, file identities, command and selection must all match. Symlinked read paths are refused. The manifest remains3,831 bytes / `dd9843b8f4671a7b1b6411ce8dc0aad73e5ee282b128857e9fdacdce19ce86ff`; no frozen1297 authority or1293 artifact was modified.

The companion requires `P14_NEIGHBORS_EXPECTED_HEAD` to be the actual **published execution HEAD**, supplied by the parent after this source is published. It must also receive the exact reviewed companion hash as `P14_NEIGHBORS_GUARD_SHA256`. The mutable future HEAD is deliberately not hardcoded from source preparation. Run from the repository root:

```sh
P14_NEIGHBORS_EXPECTED_HEAD=<published-execution-HEAD> P14_NEIGHBORS_GUARD_SHA256=4a7e946729e84cbe27bdadf7aeab46ee51d7e524368464c40d53488068e3e63b python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1297-C-legacy-neighbors-manual-guard.py pre
P14_NEIGHBORS_EXPECTED_HEAD=<same-published-execution-HEAD> P14_NEIGHBORS_GUARD_SHA256=4a7e946729e84cbe27bdadf7aeab46ee51d7e524368464c40d53488068e3e63b python3 docs/engineering/playability-launch-review/evidence/p14b4-20260919/1297-C-legacy-neighbors-manual-guard.py post
```

The angle-bracket HEAD values above are explanatory placeholders, not literal shell syntax. The ordered parent procedure is: bounded preflight(cap0), companion `pre`, bounded recorder with the exact adopted argv, closed bounded postflight, then companion `post`. The companion refuses a preflight after any run/post artifact already exists. Outputs use exclusive creation and are never cleaned up on a failure:

- `1298-legacy-neighbors-runtime-manual-preflight.json`
- `1298-legacy-neighbors-runtime-manual-postflight.json`

Both live below this evidence directory. Pre pins the completed bounded preflight and17 manual inputs. Post rechecks all17 plus three decoded inputs, unchanged preflight, bounded pre/post scope/inventory/manual/index/stage metadata, actual HEAD, exact executed argv, fixed source, empty recorded patch and untracked lists. It joins the raw file's complete initial JSON header to the final record, and verifies raw/record/patch byte hashes against the bounded postflight. It also verifies chronological ordering and the exact filtered source filename set using read-only Git metadata. It does **not** recompute the bounded source inventory or reopen that guard's manual payload set.

The automatic exclusion prefixes must be exactly `tests/fixtures/`, `ui/e2e/`, `ui/public/`. The ordinary bounded helpers still own their allowed source-byte checks. This companion is deliberately not a replacement for those guards, their review, or independent result attribution. A nonzero child result can still receive a complete manual postflight; `manualGuardsExact:true` describes preservation, while `testExitCode`, signal and error retain the actual run result. No test PASS is inferred.

The only accepted command remains:

```sh
node_modules/.bin/vitest run --project core --no-file-parallelism tests/p14b4-d3-matching.test.ts tests/p14b3-rule-revision.test.ts -t 'B4 D3 public pure matcher|pins the live evaluator generation|preserves genuine|new actual attachment'
```

Expected13 selected/one filtered is prospective metadata. Cap0 is unchanged source-route accounting, **not an observed numeric invocation counter**. The actual result/selection, existing timeout behavior, generated age controls, historical evaluator1 inputs, public attachment and filtered winning-freeze limits remain those in A/B/F. Prior compiler attribution is a separate parent comparison against its exact code source; this docs-only companion does not create a compiler qualification or authorize an extra one.
