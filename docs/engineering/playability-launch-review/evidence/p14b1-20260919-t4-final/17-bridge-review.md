# Independent bridge attribution review

Native contract-auditor, read-only; parent persisted report, 2026-09-19.
Verdict: **KEEP the bridge attribution.** No reviewer edits or tests.

At fixed source `ee91913e41b9baa30bcda8eef8c8195da7bfd1cc`, the raw bridge log
confirms 717 passed / 12 failed / two todos; 67 passed / two failed files;
exit 1, ending 2026-09-19T12:51:55.545Z.

All twelve failures match the prior `f32d56c` bridge run by complete test
identifier and diagnostic: nine campaign-library timeouts at 5000 ms, two at
20000 ms, and one campaign-isolation timeout at 60000 ms. Comparison JSON `15`
agrees with both raw logs. No baseline failure disappeared; no new identifier,
changed diagnostic, failed-suite error or unhandled error appeared. The B.1
bridge file passed all eleven tests.

Metadata records identical source SHA at both ends, empty tested-source diff
hashes, no untracked source, and `fixedSource: true`. Documentation updates do
not compromise that identity.

Limits: this is an attributed NON-GREEN suite. Matching timeouts neither prove
unfinished assertions pass nor establish unchanged performance. Root typecheck
and seven new core test failures still need their separate corrective evidence.
Keep the full-run and final test-correction identities distinct; no wholly green
full rerun may be claimed. Generated contract and headless bridge checks do not
verify Unity/native behavior or Owner acceptance. Concurrently edited tests were
not inspected by this reviewer.
