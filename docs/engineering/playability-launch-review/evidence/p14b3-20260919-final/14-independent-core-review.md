# P14B.3 independent full-core attribution review

Date: 2026-09-19. Reviewer: native `contract-auditor` specialist. **KEEP — core attribution only.**

## Scope and identity

The assigned source is published `359f6361c130e7d0b2808e2d82d328843c9e90a3`.
The parent owns the serial full verification; its bridge stage remains underway
when this review is written. Source, executable tests, configuration and HEAD
remain frozen. This reviewer ran no engine, tests, probes, typechecks, network,
installs or commits. Read-only evidence parsing/hashing and this one authorized
documentation write are the complete activity of this task.

Inspected complete raw core logs and the complete comparison:

| Artifact | SHA256 |
|---|---|
| `11-test-core-359f636.txt` | `48e621170b00d1dd5530bc326ca5d19ca033452732203a4d47fba9601bd7f77d` |
| `../p14a3-20260918/11-test-core-f32d56c.txt` | `373844d785abd1d50e3aeb898761542a79da408f09132ff5ed28263b947783f7` |
| `13-core-comparison.json` | `f4323c7a9d68f7a4e6d922e34cc2e4d8f1d85b1f530f9d602994e52dc62124ca` |

The candidate raw header names the assigned source and command
`vitest run --project core --minWorkers=1 --maxWorkers=2 --reporter=dot`.
It records start `2026-09-19T16:55:21.682Z`, end
`2026-09-19T17:54:20.081Z`, exit code **1**, signal null, and duration
**3536.71s**. Its final totals are **308 files: 301 passed, 7 failed;
3366 tests: 3338 passed, 22 failed, 6 todo**.

## Independent comparison

MET WITH EVIDENCE. A separate read-only parser read both entire raw logs,
extracted all complete `FAIL |core|` identifiers and their following grouped
diagnostics, and compared the error messages, actual/expected values, source
frames and displayed code/trace text. Grouped Vitest timeout identifiers were
expanded individually, not mistaken for one failed test. No duplicate failure
identifiers were found.

Only ANSI display escapes and the generated six-character
`studio-scenery-export-<temporary>` suffix were normalized. No test name, digest,
path, line/column, timeout threshold or diagnostic interior was normalized.
In addition to the per-test comparison, the entire normalized failure section
(from the Failed Tests heading to the Test Files footer) is byte-identical:
SHA256 `90a19bfbec7526dd7501beeb1c15d46faac045820d9232e01e3f688ea0c53a6a`.

Result: **22 baseline identifiers, 22 candidate identifiers, 22 exact diagnostic
matches, zero new/changed failures, zero absent baseline failures**. Every
identifier, candidate/baseline diagnostic and diagnostic SHA256 in
`13-core-comparison.json` agrees with the independent extraction. That pinned
JSON preserves the complete individual names and diagnostic/trace bytes.

| Inherited signature group | Exact matches | Preserved diagnostic origin |
|---|---:|---|
| R05 named-campaign transactions | 11 | Nine `Test timed out in 5000ms`; two `Test timed out in 20000ms`; full respective identifiers retained |
| P13 named-campaign isolation | 1 | `Test timed out in 60000ms`; exact Save As/inactive/renamed/new-campaign test identifier |
| P13 scientist foundation | 3 | Exact actual and expected SHA256 pairs for `p13a-person-regression-1`, `p13a-person-regression-2`, `m0a-0001`; `tests/p13a-scientist-foundation.test.ts:32:77` |
| R3 dense stale-schedule fixtures | 6 | Exact ENOENT paths for `r3n1-dense-02`, `02p31`, `02p32`; both cases per file; unchanged loadFixtureState and test-call trace locations |
| Frozen scenery exporter | 1 | `ModuleNotFoundError: No module named 'PIL'`; `tools/hollywood/export_district.py:16`, test line85:7; only temporary output-directory suffix differs |

Scanning the complete candidate log found no Failed Suites section, Unhandled
Errors/Error/Rejection or Uncaught Exception diagnostic. The observed 301
passing-file records agree with the footer; the seven failed-file count is
consistent with the 22 individually attributed tests.

## Required positive checks

MET WITH EVIDENCE. The completed core raw log reports:

| File | Observed result | Raw-log line |
|---|---|---:|
| `tests/bridge-p14b3-promise-command.test.ts` | 19 passed, no failures/todos | 358 |
| `tests/p14b3-reservations.test.ts` | 9 passed, no failures/todos | 1176 |
| `tests/p14b3-rule-revision.test.ts` | 6 passed, no failures/todos | 1246 |
| `tests/bridge-runtime-checkpoint.test.ts` | 61 passed, no failures/todos | 36 |

All **34 B3 cases** therefore pass in this full core stage, not merely the
earlier targeted run. None of these four files contains a skip/todo/only marker.

The previously corrected checkpoint exact-set test remains an unconditional
`it` at `tests/bridge-runtime-checkpoint.test.ts:944`, comparing the sorted
actual key array by strict `toEqual` against independent literal hashes. Its
genuine outgoing projection45 identity
`sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d`
is present at line985. The separate current-schema exclusion at line937 remains.
The file's clean 61-test result includes these fast tests; the dot reporter
does not print a separate timed line for every passing test. No weakening or
fresh correction is proposed or performed by this review.

## Qualification and next gate

The exact historical signatures support **attribution**, not a green full
suite. In particular, matching timeout names and thresholds do not establish
performance equivalence, explain the timeout's cause, or prove assertions that
were not reached before timeout. Missing-fixture and PIL failures likewise do
not verify their blocked behavior. The three digest assertions remain failed;
their exact historical byte pairs are preserved, not blessed or repinned.

**NOT VERIFIED HERE:** the still-running bridge stage, whole-run final
`fixedSource` sealing/end identity, B3 full closeout, Unity/rendering/native
verification or Owner acceptance. The parent must finish bridge verification,
compare its full diagnostics, inspect the sealed source identity/diff and then
publish a separately qualified final disposition. This core review does not
authorize starting a source/test writer while that freeze remains active.
