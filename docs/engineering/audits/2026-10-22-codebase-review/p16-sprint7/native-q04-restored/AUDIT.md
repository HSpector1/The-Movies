# Q04 restored-input postflight audit

All 1,645 source/input manifest hashes and all preflight pins independently match. Actual HEAD remains `5a730f42d5a66d22cba4808b5c642510c2f068bb` with the pinned successor. Both restored compressed fixtures independently match their exact Git blob IDs, byte counts, compressed SHA-256 and decompressed SHA-256 in Q04-FIXTURES-RESTORED.json; both SHA pairs also match the original test literals. No fixture expectations or contents were changed.

Actual Q04 child and wrapper exited normally with 0. JSON reports one passed selected leaf and nine selection skips. Duration 15,898.683 ms is below this file's original explicit 60,000 ms budget. Its prior missing-input cause is resolved and Q04's full selected assertions now reach completion. No selected runner/Vitest or heavy-lane lock remains. Freeze released.

Preserve the original seven-file 176/179 report unchanged. Combined evidence is 177 successful test identities out of those 179 through the complete-file run plus this focused correction, not a fresh 177/179 full-gate run. Inherited Save38 equality and the measured Legacy downgrade budget failure remain open, along with previously recorded functional-pass overruns. No primary promotion or broader gate qualification follows.

Reviewer performed only read-only postflight/hash inspection and wrote this external audit; no source/runtime changes.
