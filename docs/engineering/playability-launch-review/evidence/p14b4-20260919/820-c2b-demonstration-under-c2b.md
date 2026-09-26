# 820 — the C.4 demonstration under C.2b (780 §6.2's check): PASSED on all 6 seeds

Parent measurement, 2026-09-26 06:55:48–07:19:10 CEST, one sequential job, no other heavy process. Production
source identical to `8599f5f7` throughout: the JSONs record HEAD `e4426466` (seed 04) and `474d2e0f` (the rest),
both with 0 lines of `src bridge ui scripts` diff against `8599f5f7`, and `srcDirty: false`. Harness
`792-c4-demonstration-harness.mts`, sha256 `b60c683b3819078b…`, unchanged. Pass condition 782 §7.5, word for
word. Evaluator `820-eval-demo.py.txt` checks the 22 samples (weeks 1040…6240 and 26 weeks before each): every
film profession has an active unproven person under 30, the listing is non-empty, and the active population at
6,240 is in [63, 105]. Outputs `820-c2b-demo-{01..06}.json`. Baseline: run 2, `800-c4-demo-run2-*.json`.

## 1. Result

| seed | verdict | min unproven under 30 (actor/director/writer/craft) | active at 6,240 | films | rival rows live at 6,240 | retirements / entrants | wall |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 04 (live) | PASS | 2/1/1/1 (run 2: same) | 93 (run 2: 93) | **3,223** (run 2: 2,498) | **34** (27) | 193 / 194 (198 / 199) | 19.7 min |
| 05 | PASS | 1/1/1/1 | 88 (88) | 13 (13) | 0 (0) | 246 / 246 (same) | 0.8 min |
| 06 | PASS | 2/1/1/1 | 89 (89) | 12 (12) | 0 (0) | 248 / 249 (same) | 0.8 min |
| 01 | PASS | 1/1/1/1 | 85 (85) | 18 (18) | 0 (0) | 244 / 245 (same) | 0.7 min |
| 02 | PASS | 2/1/1/1 | 84 (84) | 8 (8) | 0 (0) | 248 / 248 (same) | 0.6 min |
| 03 | PASS | 1/1/1/1 | 84 (84) | 9 (9) | 0 (0) | 251 / 251 (same) | 0.6 min |

Rivals solvent at 6,240 on seed 04: 6 of 9, as in run 2.

## 2. What the numbers say

- **The five collapsed seeds are identical to run 2 on every reported measure.** Their rivals are insolvent
  (F-792-1), the player is passive, and so no employer bids an extension. 780 §6.2's paper claim, that moving
  the cohort after the market is behaviour-neutral for C.4's request, holds where nothing else changes.
- **Seed 04, the one live economy, moved and still passes.** Rivals keep more people under contract (34 live
  rows against 27), make 29% more films (3,223 against 2,498), and five fewer people retire over 120 years, with
  five fewer entrants replacing them. The population and the youth floor are unchanged. This is the extension
  working as designed in a live industry, measured, not predicted: no record forecast the size of the film
  increase. INFERENCE, not traced: extended employees keep rival teams staffed through what were retirement
  gaps, so rivals greenlight more often.
- The wall time of seed 04 (19.7 min) is lower than run 2's 42 min. The cause was not measured (run 2 started
  after 800 §0's orphan was killed, and CPU time was not recorded here), so no cost comparison is claimed.

## 3. What this does not show

An active player is still unmeasured (805 §4). The film increase on seed 04 is not attributed below the level
of "more rival employment": no per-film trace was run.
