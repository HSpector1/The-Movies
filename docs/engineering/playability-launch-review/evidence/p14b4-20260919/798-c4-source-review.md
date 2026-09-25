# 798 — P14C.4 independent source review (contract-auditor), persisted by the parent

Candidate: the implementation at `476046da` plus the §9 follow-up at `ccb8ab17` (diffs `e008062f…` and
`1d7a7f26…`), scaffold base `bd27de93`. Reviewer: the contract-auditor role contract run through a
general-purpose agent (roles not registered), model Sonnet, read-only. Returned 2026-09-26, shortly after the
`ccb8ab17` publication.

**Tool note, as given by the reviewer:** Glob and Grep were not in its session's tool set (Read only). It read
every file it cites in full instead: `careerLifecycle`, `worldgen`, `save`, `types`, `tuning`, `index`,
`aging`, `hollywood`, `employment`, `tick`, `historical-control`, and the three `p14c4` test files.

## Verdict: KEEP, no undisclosed defect

- Every 782 §7–§9 and 793 rule is MET at source. The look-ahead youth flag is
  `ageAt(row, week + 52) < 30` (`careerLifecycle.ts:271`); the clip and `clipped` sit at `:274-281`;
  `talentCountBefore` at `:294`; the contiguous profession-ordered block at `:317-325`; exact versus floored
  age at `:322-323`; `freeAgents` at `:331`; one receipt per request week, empty ones included, at `:326-333`;
  idempotence at `:312`; the null-hollywood gate at `:162`. `rngState` is never referenced. Provenance at `w`
  is traced through `tick.ts:1074` (tick set to `currentTick + 1`) → `:1154` → `careerLifecycle.ts:168` →
  `aging.ts:251`.
- Byte identity holds: `talent-age` is always drawn (`worldgen.ts:494`) and only replaced (`:495`).
- Save V35: exact keys (`save.ts:9566, 9597`). The validator calls the SAME `deriveCohortRequest` as the live
  step (`save.ts:9647`). Weeks strictly increase (`:9622`); the age bound is [20, 29] (`tuning.ts:426`,
  `save.ts:9642`). The downgrade is refused before envelope validation (`:9701` before `:9708`), and the frozen
  `convertV33ToV34` writes its own literal (`:9499`). **All 18 `=== 34) throw` guards and all 10
  `=== 34) return` arms carry a `35` sibling**, each read one by one; none is missing.

## The three disclosed issues (796), judged

1. A V34-shaped live state fails only at the next cohort week (`careerLifecycle.ts:308-311`, reached only
   through `:222`), whereas C.2a's missing root fails on every tick. ACCEPTABLE: the normal load path
   (`migrateToLive`) always opens `cohorts`, and the failure is loud when it comes. Recorded for C.2-RM or a
   later cleanup: throw on every tick for consistency.
2. `validateCohortReceipts` (`save.ts:9594`) reads records before `validateSaveV34`'s semantic pass (`:9477`),
   so a malformed record can surface as a V35 mismatch. ACCEPTABLE: the save is still refused, only the
   message is misattributed, and the order is 793 §5's.
3. Import cycles `careerLifecycle ↔ worldgen` and `↔ hollywood`. They already caused one load-order crash,
   which the writer patched with a literal. Latent fragility, not a present bug (INFERENCE on future risk).

## Coverage gaps (drive record 801)

- The original B6, "an empty request still appends a receipt", has had NO case since the repair turned B6 into
  the §9 discriminator (parent-verified: `tests/p14c4-cohorts.test.ts:163`).
- Nothing covers a rival's `staff()` taking an entrant (782 §8.5).
- D4 omits four tamperings the writer probed: an extra root key, a missing `cohorts` key, an extra receipt key,
  and a receipt dated after the tick.
- The two provenance tamperings both match only `/provenance/i`, so they do not tell "missing row" from "wrong
  week".
- D3's refusal is matched on `/downgrade/i` only, never on naming the first receipt's week.

Performance (INFERENCE from source): non-cohort weeks add one modulo check. A cohort week adds
O(talent) for the prefix scan plus O(entrants × provenance rows) for the sequential appends.
