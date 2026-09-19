# B-F2 T4 — independent completed-core attribution

Date: 2026-09-19. Native `contract-auditor`.

**KEEP — core attribution only.** All22 failures have the same complete test
identifiers and diagnostics/traces as the canonical P14A.3 baseline. There are no
new, changed or absent baseline failures in this completed core stage. The suite
is NOT green. Bridge is still running; this is not B-F2 closeout or a whole-run
fixed-source seal.

## Exact evidence and method

Tested source: `89b5ad2cfc6947ea07fb043ef5b23eba38d7dbde`.

- Candidate: `11-test-core-89b5ad2.txt`, SHA256
  `215c7729d4ea3f304d5aa85a285232b413faed903e65cd221aa62fe61dc84cc1`.
- Canonical baseline: `../p14a3-20260918/11-test-core-f32d56c.txt`, SHA256
  `373844d785abd1d50e3aeb898761542a79da408f09132ff5ed28263b947783f7`.
- Parent comparison: `13-core-comparison.json`, SHA256
  `fa4c886eaa51d3b3989a7d8e12b7ac20c65acf442897728a76a9b6edfaaf434a`.

Independently parsed both COMPLETE raw logs with an inline read-only filesystem
parser, not the parent's comparison utility and not an engine/test import.
Expanded grouped FAIL headings into each full test identifier and retained each
complete diagnostic, including actual/expected hashes, error classes/messages,
paths and trace origins. Removed only ANSI styling and replaced the generated
six-character `studio-scenery-export-` temporary suffix with `<temporary>`.
Reporter decoration was parsed separately from test identifiers; no substantive
diagnostic differences were ignored.

Results:22 baseline identifiers,22 candidate identifiers,22 exact matches,
0 changed,0 new,0 absent,0 duplicate identifiers. Every comparison JSON row's
identifier, candidate/baseline diagnostic and both diagnostic hashes independently
match the raw-log extraction. The ENTIRE normalized failure section also matches
byte-for-byte, SHA256
`90a19bfbec7526dd7501beeb1c15d46faac045820d9232e01e3f688ea0c53a6a`.

Full-log scanning found no `Failed Suites`, unhandled-error/rejection or uncaught-
exception diagnostics. The22 failures occupy the same7 failed test files:

-11 named campaign-library timeouts:9 at5000ms,2 at20000ms.
-1 named campaign-isolation timeout at60000ms.
-3 scientist-foundation digest assertions, with exact expected/received values
  and the unchanged `tests/p13a-scientist-foundation.test.ts:32:77` trace.
-6 ENOENT fixture failures across the dense02/02p31/02p32 files, preserving exact
  missing paths and all loader/caller trace locations.
-1 missing-PIL exporter failure, preserving exporter line16 and test line85:7;
  only the generated temporary-directory suffix was normalized.

The verified comparison retains all22 full identifiers and diagnostics; this
summary does not substitute count-only matching for that evidence.

## Completed result and positive coverage

Core command: `vitest run --project core --minWorkers=1 --maxWorkers=2 --reporter=dot`.
Start `2026-09-19T19:21:43.624Z`; end `2026-09-19T20:27:45.924Z`; exit1,
signal/error null. Recorded process wall time3962.300s; Vitest duration3960.79s.
Actual totals:309 files,302 passed/7 failed;3379 tests,3351 passed/22 failed/6 todo.

The raw log explicitly reports these passing files with no skipped tests:

- `p14bf2-acting-discipline.test.ts`:13/13, raw line724.
- `p14b1-t4-regressions.test.ts`:34/34, raw line855.
- B3 command19/19 at line356, reservations9/9 at1211, revision6/6 at1249:
  all34 B3 cases pass.
- `bridge-runtime-checkpoint.test.ts`:61/61, raw line44. The inspected current
  test still uses the independently literal-pinned exact prior-schema set,
  including outgoing45, plus current-schema exclusion and unknown-schema refusal.

The chooser file at raw line37 reports13 tests with2 skipped:11 passed, not13
executed passes. Those two carried todos do not gain coverage from this run.

## Metadata/source boundary

Read `00-run.json` and the recorder source without executing it. Independently
checked all five completed command logs' source/command/start/end/exit/signal
against metadata, null execution errors and serialized stage ordering. Both
root/UI and bridge typechecks and both contract checks completed exit0; the
contract logs explicitly verify their generated artifacts.

At this review boundary `00-run.json` still has end:null and an unfinished bridge
command starting `2026-09-19T20:27:45.932Z`. It has no final fixedSource verdict.
The recorder's start source is89b5ad2 with clean start status and empty protected
diff hash `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.
Independent read-only checks still find HEAD exactly89b5ad2, no tracked diff and
no untracked file in the recorder's protected source/test/config paths:
`src bridge tests ui generated scripts package.json package-lock.json
vitest.config.ts vitest.workspace.ts tsconfig.json tsconfig.bridge.json`.
These interim observations do not replace the required end-of-run seal.

## Qualifications and next gate

Exact timeout signatures establish historical attribution, NOT their root cause,
performance equivalence or passage/reachability of assertions after the timeout.
Missing fixtures/PIL likewise leave the affected behavioral checks incomplete.
This review does not repair, suppress or waive those failures.

B3's raw core log reports3536.71s versus this run's3960.79s: approximately
58.95 versus66.01 minutes, an observed increase of424.08s (about12.0%). The suite
also has13 additional tests. No benchmark/control or profiling was performed;
neither performance equivalence nor a particular cause of the increase is
established. Preserve this timing qualification in the eventual closeout.

Next: let the parent-owned bridge stage finish, inspect its complete failure
signatures and metadata seal, then perform independent qualified final review.
No whole-run green result, B-F2 accepted label, T0 preservation authorization,
Unity/native/rendering verification or Owner acceptance follows from this file.

Reviewer activity: read-only evidence/source inspection, hashing and lightweight
parsing, plus this sole authorized documentation addition. No tests, probes,
engine execution, typechecks, installs, network, source/test/config changes,
commits or delegation.
