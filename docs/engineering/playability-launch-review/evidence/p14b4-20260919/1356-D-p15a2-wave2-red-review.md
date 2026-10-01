<!-- 1356-D: independent RED review (contract-auditor, read-only) of 1356-C, written by the reviewer -->

# 1356-D: review of the P15A.2 Wave 2 slice 2a RED (1356-C)

**Verdict: REFINE.** Three small leaf changes. The RED reasons, save-version handling and vi.mock seam hold.

Read at HEAD 4f4f98b7 (`src` tree db80ca31, unchanged since ff05430d). I ran no test, node, tsc or script. Both patches equal the scratch diffs and the staged copies (sha256 8fc1fe62…, 83cb2a59…) and pass `git apply --check`. A, I, H mean the archive, isolation and harness test files.

## Required changes

**R1. The player's arithmetic run end is unpinned.** 1356-A:55, :60-61 require `releaseTick + totalWeeks <= W`, not `status`, so the validator agrees years later. Every synthetic run derives its status from that same arithmetic (A:233-241), and the memoized campaign's player releases nothing (A:294), so no validated archive holds a player film. At the step both rules agree (tick.ts:786-796 completes a run when `weekIndex` reaches `totalWeeks`). They differ only at a past record week, which the validator rebuilds through the adapter (1356-A:124-125; reference powerRankingArchive.ts:88, :254). A status-reading adapter passes every leaf the reference passes, then refuses a real save whose player film was running at a recorded quarter. Fix: add two runs to `rank-adapter-player-films` whose status contradicts the arithmetic (`completed` but released W−2: running; `active` but released W−30: ended).

**R2. The rival half of "research moves neither" (1356-A:203-204) is vacuous.** `rank-fixed-cost-rival-operating-cost` reads weeks 130 and 260 (A:575-586). Rival research opens at a technology's `researchableWeek` (rivalResearch.ts:50-55), 260 for synchronized sound (technologyCatalogue.ts:60), and needs a built Laboratory, so no rival can pay `researchSpend` in either state. A fixed cost that adds a rival's research bill passes. Fix: check the rival side at a memo week inside that window, with a premise that some rival booked `researchSpend` there.

**R3. Sibling assumptions are undeclared.** These leaves hold only while the archive is the sole `p15Sequence` user and the step is tick()'s last expression:
- `rank-record-sequence-allocation` pins sequences 1..n and `next` = n+1 (A:670-675);
- RED 10 pins `next` and byte-identity of every other root (I:84-90);
- RED 9 pins the step as the last expression (I:111-118);
- `stripP15` drops two roots (A:125-128), so A:731 and A:766 fail in a shared step.

1355-F Amendment 4 (:38-42) allows that shared step, 1356-A:242 lets either root land first, and 1356-A:88-89 runs the P15B step after the ranking. Fix: list these leaves in the header and handback as re-pinned at a sibling landing, as the file does for `ARCHIVE_STEP`, and make `stripP15` read one `P15_ROOTS` list. The parent should rule on RED 10: once a sibling shares the allocator (1355-F2:26-30), removing the ranking step shifts that sibling's sequence values.

## Checklist

1. **Coverage.** §8 items 1-17 map to leaves as the handback states. Amendment 2 is `rank-validate-cadence-boundary` (A:990-1055: its three cases plus a world founded at 25). The Later ruling's id, sequence, phase and allocator refusals sit at A:1088-1156. Items 18-27 are Bridge view and projection work (1356-A:223-233), correctly 2b.
2. **RED reasons.** Every RED leaf reaches a missing module, export, root or fixture before any failing assertion. Where today's Save43 functions run, the root check comes first (A:728, :775, :787, :796). All static imports resolve. The control mirrors p11-finance-history-scale.test.ts:10-12 and survives the reference because `projectStateV18` copies explicit keys (save.ts:6508). No leaf passes today.
3. **Premises.** RED 9's signing premise holds by source. Week-0 rosters sign 208-week contracts (hollywood.ts:227-230); cases settle at `endWeekExclusive` (talentMarket.ts:133-139, :1411-1414) on the incremented week (:1327); a rival win stamps `replacement` at W (:1077, :1084), while `staff()` hires carry W−1 (hollywoodTick.ts:465). Another seed settled all 24 cases at 208 under V28 (tests/fixtures/p13b/PROVENANCE.md:136). A miss fails loudly at I:130. Minor: `rank-record-phase-triple` (A:678-685) never asserts a non-empty archive.
4. **Save versions.** No save-version literal above 42 appears. Today N = 43 (save.ts:6560) and every named function exists (:10656-10689, `migrateToV4`-`V43`, `makeSaveV1`-`V18`, each builder calling `assertFrozenBuilderRetainsHollywood` first). A later bump fails loudly until its sweep pins `ARCHIVE_STEP`.
5. **vi.mock.** Sound. vitest 2.1.9 registers a mock of an unresolved module (dist/chunks/execute.2pr0rHgK.js:325-345). `importOriginal` passes the mock callstack (vi.DgezovHB.js:3812-3817), so the reference cycle archive, hollywood, worldgen, save resolves without deadlock. No config disables per-file isolation (vitest.workspace.ts:15-37). The UI project already uses this pattern (ui/src/shell/save-presentation.test.tsx:24-27), so "a first" holds only for `tests/`. Any production seam would add test-only API; keep the mock, which binds tick.ts to the exported step 1356-A:76 names.
6. **Harness.** §8 item 17 names 6,240 weeks and 480 records (1356-A:220-221), so the length stands. It fails at week 13 today. Post-production runtime is unmeasured; no natural industry campaign in `tests/` runs that far (P11's 6,240 weeks are headless). Replace the 4-hour ceiling (H:72) with a budget from the first single-file run, as 1353-F3 did for Wave R, and keep the file out of broad allowlists.
7. **Determinism.** States compare through `stableStringify` or `exportSave`; every `toEqual` compares primitives; neither patch calls `Math.random` or `Date`.
8. **Reference.** Minimal: module, phase table, Save44 step, tick wrap, worldgen seed and one needed strip in `validatedLiveProfessionContext`. By reading, every leaf passes except the capture leaf, which waits for its fixture by design.
9. **Shared names.** `p15Sequence {version, next}`, `p15DomainSequence`, the phase triple and the four v1 phase ids match 1355-F2 items 1-5. P15C reads `week`, `studioId`, `rank` and `band` directly (1356-A:107-108). The reference checks `next` inside `validatePowerRankingArchive` (:262); P15A.1 needs one cross-root check instead, which the `/power ranking|p15/i` patterns already permit.
