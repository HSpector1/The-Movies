# Independent R05 fresh-entry source applicability follow-up

**PASS: current committed core reproduces the original week-2548 canonical bytes exactly from the original fresh seed and initialization.** This closes the remaining changed-source applicability gap for fresh entry. It is a bounded engineering proof, not an implementation restart or native acceptance.

Executed 2026-09-10 16:39:57.962–16:40:04.767 UTC against TS commit `6827293985a1375e8cefed745fbc4227a01aeb53`. Exact original driver: `initializeHollywood(generateWorld('r05-living-hollywood'), 'fresh')`, followed by `tick(state, { develop: true })`, without player actions. No bridge, server, native input, worktree edits, original-artifact overwrites, or second 6,240-week continuation occurred.

All 53 imported pure-core source files remained unchanged. Source SHA `ebbefcac78abed86f4bf2f3d20e63b34fb8bfe2afee107979c5857bad6db1bce` is identical to the completed current 2548→8788 continuation's source binding. The five changed files relative to the old run are `hollywood.ts`, `hollywoodTick.ts`, `hollywoodValidation.ts`, `save.ts`, and `worldgen.ts`. The fresh-entry probe bundle SHA is `afe25e2a93cef0da5b05c252a476ed5c0b7a3d4387f9eeef9b995a34046cbff5`.

Exactly 2,548 ordinary ticks reached the all-nine checkpoint. Its 10,667,175 bytes matched `/tmp/p12a-engineering-8788-P6KEMm/week-2548.save.json` byte-for-byte, SHA `742a9b980b5ea43c7c72c53f8493302846c86929b1dbb9e5e8db93be448e040c`. The original file remained unchanged. No comparison differed and no rebaseline occurred.

There were 60 strict save validations and 16 detailed entry checks: initial incumbents plus before/due/after each of the five thresholds. The last after check used one isolated tick to 2549, leaving the final comparison at 2548.

| Entrant due | Before | Due | After | Due label |
| --- | --- | --- | --- | --- |
| 520 | 519: 4 studios | 520: 5 | 521: 5 | 1930 · Week 1 |
| 988 | 987: 5 studios | 988: 6 | 989: 6 | 1939 · Week 1 |
| 1560 | 1559: 6 studios | 1560: 7 | 1561: 7 | 1950 · Week 1 |
| 1872 | 1871: 7 studios | 1872: 8 | 1873: 8 | 1956 · Week 1 |
| 2548 | 2547: 8 studios | 2548: 9 | 2549: 9 | 1969 · Week 1 |

At every detailed check, each future studio had no business, entered date, recorded date, employment, or receipt; an explicit early-entry call refused. Every due studio had exactly one business and entry receipt with the expected date/origin/key. Capital matched the approved initial balances, capacity was charged exactly once at 5,900,000, and the first-period signing charges matched exactly six initial contracts and six unique entry employment receipts. At entry itself, cash equaled capital minus capacity minus those actual signing charges. Reentering an admitted studio and reinitializing an existing Hollywood returned the same state without further entry/endowment. Annual strict financial validation and the final exact-byte comparison independently covered retained authority.

Player RNG stayed `219853229,3878288057,3773428936,3488871996` throughout initialization, all ordinary ticks, and the isolated next tick. Every tick's calendar matched the 1920/52-week policy; the boundary labels correctly moved from Week 52 to Week 1 to Week 2.

Final counts also matched the original report: nine studios, 84 people, 800 films (792 simulated plus eight authored), 4,752 career events, 306 employment intervals, 30 active intervals, 2,718 receipts, and 808 concepts. Final save reload was exact. Fresh and reloaded next ticks matched at 2549, SHA `f373a41e7369963517af1d0caba1f2847264ee2fadbe7c995e1509b40cbe9677`; this also exactly matched the already verified current continuation's entry-next-tick hash.

This fresh proof and `/tmp/p12a-core-resume-t7c16t09/report.json` therefore join through the same exact saved state and unchanged current source set. The separate current 2548→8788 proof already reproduced the original final bytes after 6,240 more ordinary ticks; it was not rerun here.

Observed pure tick time: 4,347.398 ms total, median 0.981 ms, p95 6.338 ms, maximum 19.094 ms. Full proof wall time was 6.805 seconds. Hardware was Apple M3 Max, 16 logical CPUs, 137,438,953,472 bytes RAM, Darwin 25.6.0 arm64; Node v26.3.1 used no extra flags. Final sampled probe RSS was 520,437,760 bytes. These are engineering observations, not isolated performance acceptance, peak RSS, or packaged/native application measurements.

Evidence is in `report.json`, `probe.log`, `probe-source.ts`, `probe-bundle.mjs`, `binding.json`, `source-before.json`, `source-after.json`, `prior-imported-source-comparison.json`, and `evidence-sha256.json`. The new synthetic save stays private. Native campaign, presentation, input, product acceptance, and hook activation are outside this proof; the hook remains explicit-checker fallback.
