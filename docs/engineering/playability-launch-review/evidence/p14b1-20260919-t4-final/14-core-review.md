# Independent core attribution and correction-plan review

Native contract-auditor, read-only; parent persisted report, 2026-09-19.
Source: `ee91913e41b9baa30bcda8eef8c8195da7bfd1cc`. No reviewer edits or tests.
Verdict: **KEEP the proposed test-only corrections; T4 remains IN PROGRESS.**

The raw full core log records 3253 passed / 29 failed / seven todos across
301 files (288 passed / 13 failed), exit 1. Comparison `13-core-comparison.json`
matches all 22 historical failures by complete test identifier and diagnostic,
including exact scientist digest values and trace origins. Only ANSI formatting
and the exporter's generated temporary-directory suffix are normalized. No
historical failure disappeared. Seven new failures occur across six files;
they are B.1-introduced test compatibility failures, not inherited failures.

All seven B.1 files passed their executed assertions, including the 34 T4
regressions. No failed-suite or unhandled-error diagnostic was found in this log.
Core began 11:24:04.665Z and ended 12:22:13.360Z; Vitest duration 3486.64 seconds.
Bridge started serially at 12:22:13.363Z and is still running at this review.

## Approved narrow corrections

The detailed prescriptions are preserved at
`../p14b1-20260919-t4/15-queued-test-corrections.md`.

- V11 demolition forgery: assert new V29 roots empty, then strip them; retain the
  existing demolition/refund refusals and the strict frozen validator.
- Reconstructed V25 workflow/downgrade cases: the same empty-root prerequisite;
  preserve all workflow and downgrade assertions and genuine V24 bytes. Correct
  the provenance title: reconstructed V25 does not prove nonempty V24 migration.
- S6 live forge: stamp the already migrated state with the live version; preserve
  genuine V25 fixtures and the separately frozen V26 checks.
- P08 history boundary: require a real history row before the chosen boundary,
  every real first take at/after it, and empty promises. Preserve the exact
  recording-boundary refusal instead of accepting the unrelated first-take error.
- P06 and S3 live-save downgrade pins: require the exact V29 refusal, retaining
  byte equality, commitment count, all refusals and genuine historical fixtures.
- Separate root typecheck TS2339: read the same native `attached.promises` array
  instead of the partial test adapter; retain the digest assertion and values.

## Required verification and honest closeout

Finish and attribute the bridge run before editing source/tests. For these
test-only amendments, the complete fixed-production-source pass plus fresh runs
of all seven amended test files and both typechecks is sufficient. Any additional
failure requires its own diagnosis; this review does not establish future GREEN.

Record the full-run commit and later test-correction commit separately. Verify
that no production, configuration, harness or historical fixture changed between
them. Preserve these original failing logs. The eventual claim may be full
core/bridge evidence on `ee91913`, inherited failures explicitly retained, and
separately green affected tests/typechecks on the final candidate. It may NOT be
reported as an all-green full-suite rerun, Unity verification or Owner acceptance.
