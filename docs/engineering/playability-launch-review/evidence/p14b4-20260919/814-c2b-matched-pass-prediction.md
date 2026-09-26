# 814 — P14C.2b matched-pass prediction, published before the run

Written by the parent before the recorded run of the C.2b candidate (the implementation `8cf6bed2`, the
follow-up `25e8fc11`, the V36 sweep 813 and the repaired RED 810 §8). The run is
`node_modules/.bin/vitest run --project core` under `run-fixed-source-c2.mjs`, with no commit until it ends.
Each line is labelled MEASURED (already observed on this candidate), SOURCE (read at source) or INFERENCE.

## 1. The baseline

Run 805 (`e32c85b4`): 363 files, 4236 cases, 63 failed, 9 todo. Record 809 has since repaired 8 of the 63 by
test-side changes: family 6 of `p14b5-relationships` (6), family 12 `seed-b` of `bridge-p14b5-relationships`
(1) and `p14c2a-save-and-settlement` E1 (1). Expected inherited set: **55**, including FU-2, which is
intermittent (it failed in 6 of 8 full runs).

## 2. Falsifiers

| # | prediction | label |
| --- | --- | --- |
| 1 | 363 + the new C.2b files: `p14c2b-extension`, `p14c2b-save-v36` and `bridge-p14c2b-extension`. Expected **366** | SOURCE |
| 2 | **4287** = 4236 + the RED's 51 (31 + 14 + 6), ± 0 from the sweep, which moves values and adds no cases; todo **11** = 9 + the RED's 2 (W4c, W7c) | INFERENCE |
| 3 | every C.2b RED case passes, except any case its author reported as revealing an implementation defect (none reported). Re-run by the parent at 04:45–04:47: 14/14, 6/6, 29 + 2 todo | MEASURED |
| 4 | the 55 inherited failures are RETAINED with the same cause, or VANISHED and traced. The 8 repaired in 809 VANISH against 805 | INFERENCE |
| 5 | **`bridge-p14b5-relationships` family 12 `seed-b` moves again.** 809 pinned 47 rows because C.2a removed `416:settled:person-studio-bc14baf6-r02-3`: that rival actor announced at week 358, with E = 416 = its contract end. At `E − 12 = 404` its employer holds it, so C.2b opens an extension case, and the rival branch bids at tier 1.1 if the bonus clears its reserve (806 §5, §8.1). Expected: `rows` and `settled` 47 → 48, the added row is r02-3 settled at 416 with winner `studio-bc14baf6-r02`, the three row digests move, and `takes` and `rng` stay UNMOVED. If the rival cannot afford the bonus, the file does not move at all. Any other movement falsifies this line | INFERENCE, from 788/809 and 806 |
| 6 | any other NEW failure lies only in a test whose industry world reaches an announced employee's `E − 12` and reads retirement, contracts, employment, rosters, listings or a digest of them after that week (812 §4). A new failure outside that class is a defect until traced | INFERENCE |
| 7 | `generated/` stays empty; projection 50, protocol 4 and promise rules 4 unmoved | MEASURED by the writer (811) |

## 3. What a clean run does not show

It does not show that a player can reach an extension through the bridge except when `D = E` (811 §6.4: the
bridge proposal path accepts only catalogue terms), and it covers no Unity surface. The C.2b acceptance rests
on the RED (behaviour), the writer's end-to-end check and probe (811 §5), and the source review.
