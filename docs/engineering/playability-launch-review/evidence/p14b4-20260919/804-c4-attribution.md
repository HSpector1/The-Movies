# 804 — C.4 attribution: run 803 against run 787, by full test identity and cause

Run 803: `node_modules/.bin/vitest run --project core` under `run-fixed-source-c2.mjs`, 2026-09-26
01:11:49–02:03:20 CEST. Result: **363 files (23 failed / 340 passed), 4236 cases (67 failed / 4160 passed /
9 todo)**. Comparison `compare-failures-c2.mjs 787 803` → `803-c4-vs-787-comparison.json`: **NEW 5, VANISHED 0,
RETAINED_SAME_CAUSE 62, RETAINED_CHANGED_CAUSE 0**.

## The recorder flag is FALSE, and why that is a process error, not a source change

`fixedSource: false`: HEAD moved from `33234928` to `c52e8792` during the run, because the parent committed the
resume notes mid-run. The recorder compares HEAD strictly. Verified after the run:
`git diff 33234928 c52e8792 -- <the recorder's SOURCE paths>` is EMPTY (the commit touched 3 docs files only);
`testedDiffSha256` is the empty-tree hash at both ends; `untrackedSource` is empty at both ends. The tested
source was therefore identical throughout. The flag is recorded as the recorder wrote it, and a final
verification run with no commits during it closes the checkpoint (805).

## Against the falsifiers published in 802

| # | predicted | measured | verdict |
| --- | --- | --- | --- |
| 1 | 363 files | 363 | CLEAN |
| 2 | 4236 ± 2 cases, 9 todo | 4236, 9 todo | CLEAN |
| 3 | C.4 suites 56 pass + 1 todo | `p14c4-cohorts` 29 (1 skipped = the todo), `p14c4-save-v35` 28; no C.4 failure | CLEAN |
| 4 | 787's 62 retained or vanished-and-traced | 62 RETAINED_SAME_CAUSE, 0 vanished; FU-2 failed again (5 of 7 runs) | CLEAN. The possible recovery of C.1's isolated-population failures did NOT happen; reported as measured and not investigated further |
| 5 | at least 1 new (p14c2a E1) | E1 present, plus 4 more | see below |
| 6 | any other new failure only in a hollywood world past week 52 reading talent, listings or staffing | 1 of the 4 fits (non-leak). 3 fall OUTSIDE the falsifier's class: they are sweep defects, not behaviour | the falsifier described behaviour and did not anticipate a sweep miss; each is traced |

## The 5 new failures, each traced

1. **`p14c2a-save-and-settlement` E1, BEHAVIOUR (class b), predicted.** The test asserts `state.talent` unchanged
   through a settlement span that crosses week 52. The youth floor appends one entrant there (782 §7.1/§9), so
   the list is one longer. Approved C.4 law; stays failing as coverage debt.
2–4. **`d11-cycle2:227`, `d12-economy:281`, `ruling-a-development-in-play:452`, SWEEP DEFECTS (class a).** Each
   guards a reloaded save with `saveVersion !== 34`. The inventory's S10 grep (794) matched `toBe(34)`,
   `saveVersion: 34` and `=== 34`, but not `!== 34`, and the sweep inherited that blind spot. The fix is
   `LIVE_SAVE_VERSION`, sent to the sweep author.
5. **`p13b-s8-nonleak`, UNLAWFUL TEST STATE exposed by C.4's fail-loud.** `withRivalResearch`
   (`tests/p13b-s8-nonleak.test.ts:57-88`) appends two `generateScientist` people to `state.talent` without
   provenance rows, a state the V33+ validator refuses. Before C.4, nothing between weeks 780 and 900 read their
   rows. The cohort request at week 832 reads every person's row and throws naming the person, as intended. The
   fix is a lawful append through `withTalentProvenance`, sent to the sweep author.

No implementation defect. No expectation moved in this record.
