# Interrupted consumer resume audit

All 1,641 source/input manifest hashes and all preflight pins independently match their frozen bytes. Selected and actual HEAD are `5a730f42d5a66d22cba4808b5c642510c2f068bb`. Lane metadata records terminal exit 143. Recorded owned root 59216 and descendants 59346, 59348, 59360, 61406, 62168 are absent; no selected runner remains and the heavy-lane lock is absent.

The UI typecheck actually completed with exit 0, resolving the preceding missing-input typecheck failure for this selected tree. Bridge/core consumers started but were interrupted before a terminal child result or complete JSON report. Partial assertions and durations remain partial evidence only; no complete consumer pass/fail total or original-budget acceptance can be inferred. The later UI runtime stage remains unrun. Root and Bridge typecheck results from the earlier checkpoint are prior evidence, not newly executed children of this resume.

The coordinator recorded foreign Godot PID 62526 at 24.1% CPU at 11:46:06 (elapsed 32 seconds), followed by controlled termination of the owned lane. Exclusive execution is not qualified. The observation does not establish which particular assertion durations were affected. Private host samples and interruption inventory remain in LOCAL artifacts and are not copied into this report.

The stopped checkpoint freeze is released to the sole coordinator. This releases the completed interruption audit only; it does not qualify a restart or a completed gate. Subsequent host checks and any fresh authorized launch remain the coordinator's responsibility. Reviewer ran no tests/compiler/generator and changed no repository files.
