<!-- 1356-D2: confirmation review (contract-auditor, read-only) of 1356-C2 r2, written by the reviewer -->

# 1356-D2: confirmation of the slice 2a RED r2

**Verdict: CONFIRMED.** Read at HEAD 8f416f79 (`src` tree db80ca31, unchanged). I ran no test, node, tsc or script. `1356-p15a2-wave2-red-r2.patch` equals `git diff 45b2782 adeee94 -- tests` and passes `git apply --check`; the reference stays byte-identical to r1 (83cb2a59…).

## F2 items and 1356-D R1-R3

A, I, H mean the archive, isolation and harness files at adeee94.

| Item | Status | Evidence |
|---|---|---|
| F2 1 / R1 | APPLIED | `completed` at W−2 expects running; `active` at W−30 expects ended (A:352-353, :360-361, :371). A reader of `status` or `weekIndex` now fails. |
| F2 2 / R2 | APPLIED, seeded route | `rivalResearchWindow()` ticks the S8 route to the first W > 260 where a rival booked `researchSpend` and keeps an active project, stopping at 572 (A:243-272). The control asserts each fact (A:633-645); the RED leaf checks the payer at W (A:647-665). F2 allows a seeded campaign. |
| F2 3 / R3 | APPLIED | Helper below. Allocation: distinct, ascending, `next` over every root, contiguity only without sibling rows (A:745-770). RED 10: non-P15 bytes, sequence-free sibling bytes, sibling order, `next` difference equal to records (I:72-80, :101-112). RED 9 sits beside `ARCHIVE_STEP` in both headers (A:27-42, I:15-23) and the handback. |
| F2 4 | APPLIED | Non-empty premise (A:776). |
| F2 5 | APPLIED | PROVISIONAL two-hour ceiling, `campaignMs` reported, run alone (H:15-19, :38, :80). |

`tests/helpers/p15-roots.ts` exports `P15_ROOTS = ['p15Sequence', 'powerRanking']` (:10) and `stripP15`, which drops exactly those keys (:13-15), plus `p15Rows` (:21-35). Both files import it.

## The author's extra changes

- **renumber** (A:976-981) places the archive's sequences above every P15 row and `next` above them. Each cadence tamper still meets only the cadence rule when siblings hold rows. 1355-F2 item 4 has no cross-root week-order rule that this could trip.
- **Case (c)** migrates `genuine-v37-c3-preannouncement-week103.json.gz` (A:1141), which `c3Raw` checks against its manifest sha256 (tests/helpers/p14c3-fixtures.ts:91-105). The save holds a fresh-origin industry at tick 103 (`originWeek` 0), so `agrees(c, [104])` tests something real. The change drops r1's downgrade of a ticked state, which a sibling holding rows refuses (1357-A:158-159).
- **Declared leaves** each have a real cause: P15B's step adds zero loan movements (1357-A:153-156) and books loan principal after the ranking. The handback says "five" but names six (cosmetic).
- **R2 route** matches the measured S8 facts: r01 researches from 265 to 276 (tests/bridge-p13b-s8-rivals.test.ts:26-38). `newFinancePeriod` seeds every money kind (hollywood.ts:35-38), so `researchSpent` never adds `undefined`.

## New ways to pass vacuously

None. The sibling branches are empty today by design, as F2 states, and the contiguity branch runs today. `rank-validate-id-week-only` asserts its premise (A:1188). The window memo returns only a paying rival and throws by name at 572.

By reading, the unchanged reference passes R1 and R2: it decides by arithmetic (reference powerRankingArchive.ts:88) and returns `rivalWeeklyOperatingCost` for rivals (:58).
