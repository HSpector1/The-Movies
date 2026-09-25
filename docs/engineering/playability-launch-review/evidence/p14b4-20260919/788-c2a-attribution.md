# 788 — C.2a attribution: run 787 against run 772, by full test identity and cause

Run 787: `node_modules/.bin/vitest run --project core` on `c34b6674` under `run-fixed-source-c2.mjs`,
2026-09-25T18:55:40.621Z to 19:46:31.976Z (50.9 min), `fixedSource: true`, tested diff the empty-tree hash at
both ends, no untracked source at either end. Summary: **361 files (18 failed / 343 passed), 4179 cases
(62 failed / 4109 passed / 8 todo)**. Comparison: `compare-failures-c2.mjs 772 787` →
`787-c2a-vs-772-comparison.json`.

## Against the falsifiers published in 786

| # | predicted | measured | verdict |
| --- | --- | --- | --- |
| 1 | 361 files | 361 | CLEAN |
| 2 | 4179 ± 2 cases | 4179 exactly | CLEAN |
| 3 | all 40 `p14c2a-*` pass | 40/40 (0 `×` lines) | CLEAN |
| 4 | all 55 baseline failures retained, same identity (FU-2 may flip) | 55 RETAINED_SAME_CAUSE, 0 VANISHED, 0 CHANGED_CAUSE; FU-2 failed again (4 of 6 runs) | CLEAN |
| 5 | ≥ 7 new: family 6 ×6 and seed-b ledger | exactly those 7 | CLEAN |
| 6 | any other new failure only in worlds past week 104 / a hard boundary | none other | CLEAN |

## The 7 new failures, each traced input to consumer → outcome

**`p14b5-relationships` family 6 (6 cases), one premise.** The shared `f6Base` needs an actor listed by
`hiringMarketIds` at BOTH week 207 and week 208. Probe (temporary copy of the test, removed): by week 207 four
genesis people (`t-cra-03` (A129, retired 181), `t-cra-05` (A143, 195), `t-act-12` (A145, 197), `t-cra-00`
(A154, 206)) announced idle inside their windows and retired. D11 removes retired people from
`signableUniverse`, the pool the 13-week rotation samples, so epoch 15's Fisher–Yates draw differs for everyone.
Pre-C.2a (same probe at `947d8b5c`) the week-207 listing held `t-act-00`, which the 208 listing also holds, and
that was the premise's actor; post-C.2a the 207 listing is a different sample and the only actor in both weeks
is `t-act-23`, which the test reserves as `reliable`. The REQUIREMENT the family tests (D5 in the chooser under
the D1 roster predicate) is untouched; its natural scenario no longer exists. Changed-scenario failure, not a
defect.

**`bridge-p14b5-relationships` family 12 seed-b ledger: 48 to 47 rows.** Probe on the natural seed-b chain to
week 416 (temporary test file, removed; run at `c34b6674` and at `947d8b5c`): the only row lost is
`416:settled:person-studio-bc14baf6-r02-3`. That rival actor crossed the actor hard boundary at week 358
(`hardBoundary`, A358), E = 416 = the end of its 208-week contract in force (773 D5's contract branch), and it
retired at 416. Under D8 no market case opens for an announced person, so the renewal-window case that
settled at 416 before C.2a never opens. Intended law, measured.

## Disposition

All 7 are CHANGED-SCENARIO results of the approved C.2a law, not defects and not verified coverage. Following
the programme's precedent (record 771's `approved_behavioral_change` for C.1's ledger digests), they are
repaired as TEST ENGINEERING in a separate, labeled task: family 6 by a lawful premise that preserves the D5
requirement; the seed-b ledger control by an `approved_behavioral_change` entry citing this record. Until that
task lands they stay failing and count as coverage debt. No expectation was changed in this checkpoint.
