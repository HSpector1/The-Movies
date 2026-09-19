# Independent F1 candidate review

Native contract-auditor, read-only; parent persisted report, 2026-09-19.
Candidate: `e37cd2330be8c9129b0193a2bf8e84258e851307` plus the bounded
`productionSetup.ts` history-proof patch and independent assigned tests.
Verdict: **KEEP — no remaining concrete defect in this bounded correction.**

The new branch replaces only released live-stage occupancy with an exact
permanent wrap witness (same production/stage/Set, completion ≤ wrap ≤ current
week). It requires a null current stage and unchanged retained Set. Existing
completion, date/unit, revision, route, equipment and provenance checks remain
intact; a different occupied stage cannot use the historical exception.

The witness condition correctly handles wrapped work blocked on Post while its
phase remains shooting. Independent tests cover real wrap→Post, actual 27-week
compaction, Post contention, nine malformed-history/binding cases and detached
active shooting. RED `02i` has three exact intended binding failures and ten
negative passes on stable source.

Limit: Post contention verifies the pure validator under an explicitly configured
one-slot capacity; it does not claim a whole-save round trip for that configured
state. Candidate GREEN, the 17-file run and both typechecks remain parent-owned
and were not established by this source review. No edits or tests by reviewer.
