# V4 resumed postflight audit

All 1,642 source/input hashes and all preflight pins independently match. Actual and selected HEAD remain `5a730f42d5a66d22cba4808b5c642510c2f068bb`; installed v4/test-v2 bytes are manifest-pinned. Actual lifecycle child and wrapper ended normally with exit 1. No selected runner/Vitest process or heavy-lane lock remained.

JSON reports one failed selected positive leaf, zero passed, and two selection-skipped leaves. The failed body took 7,071.801 ms, exceeding the unchanged 5,000 ms budget. First reported cause is a frozen save-validation error: V37 through V31/V30 wrapping `Cannot read properties of undefined (reading 'some')`. This is a changed observed failure, not green lifecycle acceptance.

The retained log and JSON stack end at save.ts's wrapping validators and contain no caller test/helper frame or intermediate checkpoints. They therefore do not establish whether this invocation completed a first take or which later save site it reached. Do not infer that it advanced past the previous first-take failure merely from the changed error text. Exact reachability requires a bounded diagnosis; no additional runtime or source investigation was performed in this postflight audit. Release/save/replay and new hostile-control completion remain unproven on v4.

Coordinator endpoint checks observed no foreign Godot before/after the short run; this is not continuous-exclusivity proof and does not waive the measured overrun.

Release the completed checkpoint freeze to the sole coordinator. No repository file or runtime was changed/launched by the reviewer.
