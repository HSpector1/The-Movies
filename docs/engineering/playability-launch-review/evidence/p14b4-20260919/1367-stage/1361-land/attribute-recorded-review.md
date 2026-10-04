# Independent recorded-run attribution script review

Reviewer: Codex /root/sweep_review, 2026-10-04.
Reviewed attribute-recorded.py SHA-256: `9896e39d32a7fd2d2b145a72d426b183829696a5a9bdd5c9f54e0ad688ec74fb`.

Initial disposition (superseded by the final addendum below): corrections required before treating this script as complete gate attribution. The existing evidence and production source were not changed. Findings below refer to this exact revision.

## Required corrections

1. **Shared dependency paths are normalized asymmetrically in primary messages (lines 51–54).** Blanket replacement of the live checkout prefix also rewrites live node_modules paths. Scratch runs use that same dependency directory, which is not underneath their scratch prefix. Thus identical dependency messages can appear changed. Use one common normalizer with the node_modules negative lookahead already used by d16. A Python-only synthetic identical primary containing the live node_modules path reproduced unequal normalized outputs. Existing x3 primary rows contain zero such paths, so this identifies a preparation defect rather than invalidating retained evidence.
2. **The external d16 JSON is not tied to the completed recorded run (lines 123–131).** Checking its hash and 176/12 totals proves its contents, not that this recorder command produced it. Require the recorder command to name the expected d16 config, JSON reporter and exact absolute output path. Validate JSON startTime and file start/end times against the record interval, and preserve those provenance fields and its hash in the result. The separately revised runner must refuse preexisting JSON, including dangling symlinks. Reject missing, stale or unfinished reports even if their failure set matches baseline.
3. **Core/UI completeness and unhandled errors are not asserted (lines 143–146).** The reused parsers attribute failures; they do not prove complete collection. The UI parser does not parse failed suites, and expected child exit alone is insufficient when ordinary failures coexist with other errors. Require final summary totals and explicit errors/unhandled checks against the accepted run corpus. Current x3 totals are core 448 files / 5265 cases, including 3 skipped and 11 todo; UI 204 files / 2697 cases, including 5 skipped and zero unhandled errors. Failure counts may require attribution rather than blind equality, but missing cases/files cannot be reported as a complete gate. An unexplained failed suite must be surfaced rather than hidden by the existing nonzero exit.
4. **Output ancestors can be symlinks (lines 118–121).** The final path is checked, but a symlink ancestor pointing to another external directory still passes. Reject every existing symlink component before creating the new output directory, preserving the task's no-writes-under-links rule. Keep output outside the repository and exclusive creation.
5. **d16 status consistency relies partly on header totals (lines 90–108).** Count actual passed/failed statuses, reject pending/todo/skipped or unknown states, and reconcile with 164/12/176. Prefer comparison of the full normalized case identity inventory to baseline in addition to the exact failed-message map, so a changed passing corpus cannot masquerade as unchanged coverage.

## Sound existing behavior

The completed recorder and postflight hashes bind the raw log, record and patch. Fixed source, exact HEAD, no signal/error, and consistent child exit are required. The script uses exclusive writes for generated JSON and existing attribution/comparison implementations rather than mutating baselines.

The d16 failure-message normalizer correctly retains shared live node_modules paths while replacing only the appropriate checkout prefix. Full failureMessages arrays are compared, not merely first messages. The prior d16 baseline parsed successfully with 176 unique cases, 12 failures and 164 passes in lightweight read-only verification.

The declared45 mapping was exercised against the accepted x3 core attribution and returned exact equality: 45 expected, 45 actual, 45 identical primary messages. No message normalization is applied to that contract. Existing parsers and the 1358 comparison were inspected rather than executed with new output.

The x3 comparison deliberately writes new/gone/changed details without asserting equality. That is acceptable for an attribution tool, but its exit zero must not be interpreted as automatic gate acceptance; every difference still requires parent disposition. In particular, the known seven supervisor/environment failures may change between environments and must remain explicit.

## Review limits

Used Python-only function loading under a non-main name, small synthetic normalization input, and reads of existing attribution/baseline JSON. The attribution main was not run. No Node, tests, heavy command, fixture payload access, source write or repository/index mutation occurred. Only this authorized review file was written. Re-review the corrected script hash before use.

## Final corrected revision

Reviewed final script SHA-256: `1b596e4dd32c42526fa90c50976004101b38bee2fb1de094d23ab9c4f2b526ab`.

Disposition: PROCEED for bounded attribution after each completed postflight. All five findings are resolved. The final revision also verifies the exact d16 config argument pair and explicitly rejects parsed UI unhandled errors.

Both primary and full-message normalization now preserve the shared live dependency paths. d16 binds its external JSON to the recorded reporter/config/output arguments and completed run interval, verifies actual 164/12 statuses, and compares all 176 case identities plus full failure messages. The result retains report hashes and the guarded command/times. Core/UI enforce accepted corpus totals, skip/todo counts, parsed failure consistency and errors. Exclusive external output rejects symlink ancestors. x3 differences explicitly require parent disposition rather than automatically accepting exit zero.

Python-only checks passed for identical shared-dependency primary normalization, ordinary source-prefix normalization, both accepted x3 corpus summaries, exact declared45 equality, and the 176-case/12-failure d16 baseline. These checks loaded functions with a non-main module name and created no attribution output. The future completed live d16 report and its timing binding remain unexecuted until the actual run exists. No changes to reviewed source, repository/index or prior evidence occurred.
