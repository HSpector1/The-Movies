# 1358-X5: parent dry run of slice B production steps 1-4 (r2) on the landed RED

[1358-F7](1358-F7-parent-rulings-on-1358-E.md) Next 2 and [1358-F8](1358-F8-parent-response-to-1358-J.md) ruling 6
ordered this run. **At every step, every classified RED row behaves as 1358-E's "What each step leaves red" says,
with 0 mismatches.**
- After step 4 only rows 59-61, the three Mentor leaves, stay red. Each fails first at `acceptedEvidence` with
  `expected 44 to be 43`, as [1358-J](1358-J-rel-sliceB-production-review.md) predicted.
- Both bridge-contract generator checks pass at step 4.
- Every other failure, at runtime or in a type gate, sits in a test file and comes from the Save44 version and type
  pins. That fallout belongs to the sweep (1358-N).

## How it ran

- **Script.** [run-1358-X5.sh](1358-stage/x5/run-1358-X5.sh), alone in the heavy lane under `HEAVY-LANE-LOCK`, on
  2026-10-02 from 02:36:30 to 02:46:47 CDT, Node v20.20.2 ([x5.lane.meta](1358-stage/x5/x5.lane.meta),
  [x5.log.txt](1358-stage/x5/x5.log.txt)).
- **Tree.** An archive of HEAD 5245072a: RED r8 landed at 650e963a, and the capture minted at 4ad8e0f7.
  `docs`, `node_modules`, `art`, `tools` and `tests/fixtures` were linked. Nothing was written under a link, the tree
  read clean after each step, and the parent deleted it after the run.
- **Steps.** Each cumulative step patch, revision r2 ([1358-E2](1358-E2-rel-sliceB-production-r2-handback.md)), went
  in with `git apply --index` on the base commit, and the tree was reset to base after each step. The script checked
  each patch's sha256: 95d5a5d9…, eaa026e2…, 510c361b… and 2004b500….
- **Each step ran:**
  - the six slice B files with `--no-cache` and the verbose and JSON reporters;
  - the root, UI and Bridge type gates;
  - at step 4, `check:bridge-contract` and `check:bridge-contract:fixtures`.
- **Checker.** [check-steps.py](1358-stage/x5/check-steps.py) compares each of r8's 100 classified rows with 1358-E's
  red list for the step. It maps 1358-E's r6 numbering onto r8's: r8 inserts its three save-v44 rows at 41-43, so an
  r6 row from 41 on moves up by three. It lists every failure outside the classified rows.

## Results

| Step | Tests (148) | Classified red: expected, mismatches | Unclassified failures | Root, UI, Bridge type errors |
|---|---|---|---|---|
| 1, Save44 | 92 failed, 56 passed | 62, 0 | 30 | 37, 2, 2 |
| 2, the log and Rivals | 74 failed, 74 passed | 44, 0 | 30 | 35, 2, 2 |
| 3, romance | 40 failed, 108 passed | 10, 0 | 30 | 46, 2, 2 |
| 4, projection 57 | 33 failed, 115 passed | 3, 0 | 30 | 46, 2, 2 |

- **Per file after step 4:** only the Bridge labels file keeps classified failures (3 of 14). Competitions-log
  passes 7 of 7, labels 12 of 12, save-v44 25 of 25 and romance 37 of 37.
- **Rows 59-61** (1358-J's rows 56-58) fail at `tests/helpers/p14c3-genuine-evidence-fixtures.ts:17:29` with
  `AssertionError: expected 44 to be 43`. The sweep's first move turns them green (1358-F8 ruling 7).
- **Generator.** `check:bridge-contract` verifies the step-4 schema and exits 0. `check:bridge-contract:fixtures` exits
  0 ([x5-step4-generate.txt](1358-stage/x5/x5-step4-generate.txt)). This settles 1358-E's U2 and 1358-J finding 10:
  the emulated artifacts equal the real generator's.

## The fallout outside the classified rows (to the sweep)

- **Runtime: 30 failures per step, all in `p14b5-relationships`.**
  - Three are the 1344-F6 row 6 exceptions, failing as in the baseline (`expected [] to deeply equal [
    'studio-aca408ec-r01:film:6' ]`).
  - The other 27 are Save44 fallout, the kinds 1358-J finding 15 names:
    - staged edges without `competitions` meet the Save44 validator (`validateSaveV44: state.relationships[24].competitions is missing`), in families 6, 6b and 8 and the D5 reason sentences;
    - `validateSaveV43` calls on live envelopes throw `expected version 43`;
    - family 10's refusal leaves now meet the version check before their own guard.
- **Type gates: all errors sit in test files.** No `src`, `bridge` or `ui/src` file errors at any step.
  - At step 1 the root gate gives the RED's 17 errors and 20 fallout errors:
    - `p14b10-conflict-evidence:108` and `p14b4-material-evidence-core:293`, as 1358-J predicted;
    - 18 `SaveFileV44` arguments passed where a `SaveFileV43` is typed. These are the live-to-older chains of 1358-J's
      sweep item 3c and a few direct calls, in `tests/helpers/p14c2b-fixtures.ts:69`, `p14c4-fixtures.ts:71`,
      `p14c3-canonical-rival-fixtures.ts:198`, `save.test.ts:370` and :419, `p14p3-directing-promises.test.ts:387`
      and :693, and 11 other test files.
  - From step 3 the RED's own errors are gone. The strict-Pick errors arrive, 24 in `p14b5-relationships` and 2 in
    `p14b5-t-failure-tuning`, as 1358-J finding 15 predicted.
  - The UI and Bridge gates each report the same two errors, in the shared helpers `p14c2b-fixtures.ts:69` and
    `p14c4-fixtures.ts:71`. **1358-J's expectation that the UI and Bridge gates show no new error was wrong.** Its
    sweep item 3c names both helpers.
- **1358-J's step-1 type prediction was incomplete.** It listed only the two TS2322 sites, but the step-1 tree also
  types 18 live chains. They are the same kind as its item 3c, and the sweep plan takes them from this run.

## Outputs

[1358-stage/x5/](1358-stage/x5/) holds each step's `x5-step<k>.txt`, `.json`, `-tsc.txt` and `-check.txt`, plus the
step-4 generator output.

## Next

1358-M2 measures the whole suite on the step-4 tree: core over 440 files, UI and the four §7 natural routes. It
started at 02:48:24 CDT. The sweep plan 1358-N follows from it.
