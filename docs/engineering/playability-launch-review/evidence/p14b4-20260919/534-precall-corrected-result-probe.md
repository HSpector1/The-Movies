# 534 — Temporary result probes on the corrected 526 candidate

2026-09-20. Parent-applied, passive, UNMETERED diagnostic (the ten 514/525 observation sites,
marker `B4_RESULT_534`) on the frozen 526 candidate: the 517 exact pre-call bills plus the
single 518-specified correction (rT6 requirement-walk width, `calc(32)`). No optimization,
owner, tariff, cap, timeout, test or validator changed. The exact candidate was restored
from its frozen snapshot copy and hash-verified; no diagnostic remains.

## Identities

- Base commit `df0533c6fac18ec5027231500d80050d800fd3b5`; candidate replay source
  `d5f8cb7171f602df76b2115819e7e63320b84b4f7e602fb5811ad57984b1eb22` (2797 lines); protected
  patch (record-check capture, production only, +70/−13)
  `add13897e0d5346b5e3b81bbc10c840d0114462f1fff521cc0335f6e4e8b51b5`.
- Probed source `72c401eb797ae96233d53d7c948fe36c70824ccb2d366d13577c7f459935b7c9` (2830
  lines); archived probe patch (identical for both runs)
  `115616944343be25a3899d8ee6d0f4c7ad8e90abbaef442f872e702acada4e3e`.
- Runs, serial, `record-check.mjs`, both fixedSource:true, no untracked source: first-take
  16:32:52.480–16:32:58.293Z exit 0 (PASS including the shared kernel assertion); stale
  16:32:58.497–16:33:05.097Z exit 1 (original `expected 'workLimit' to be 'commandRefused'`
  at test line 234).
- Restoration at 16:33:05Z from the frozen snapshot; SHA256 `d5f8cb71…1eb22` and protected
  patch `add13897…8b51b5` verified.

## Bill values against 525 (517) and the 526 handback predictions

| Frame (label, move) | 514 (505) | 525 (517) | 526 predicted | 534 measured |
| --- | ---: | ---: | ---: | ---: |
| 1 (new; restricted) | 315 | 315 | 315 | **315** |
| 2 (8→7 retained Development) | 11193 | 6861 | 6861 | **6861** |
| 3 (7→6 single-early, rT7) | 9587 | 8099 | 8099 | **8099** |
| 4 (6→5 single-early, rT6) | 8905 | 8398 | 8578 | **8578** |
| 5 (5→4 restricted) | 850 | 850 | 850 | **850** |
| 6 (4→3 wrapOnly/singleWrapSlot) | 7948 | 7948 | 7948 | **7948** |
| 7 (3→2 restricted) | 576 | 576 | 576 | **576** |
| 8 (2→1 single Post exit) | not reached | 5668 | 5668 | **5668** |

Every prediction is exact. The only `used` differences from 525 are the disclosed
`calc(32)` self-charge on the two single-early frames (+16 at the week-3 `sweepBillDone`,
+32 at the week-4 `sweepBillDone`) and the 180 larger week-4 reservation, so every later
probe reads exactly +212 on both routes; every other arm's payment sequence is unchanged.

## Results

- First-take route: producer work **182925** (517: 182713; 505: 189256; 492: 190818), leaving
  17,075 for the kernel; the original test including the shared kernel assertion passes.
- Stale route: the week-8 single Post exit `sweepBill` completes (bill 5668, `sweepBillDone`
  at 197531); the cut is the week-8 owner reservation, `payFailure` at 197631 requesting
  5765 with 2369 remaining, in `frame` (526 line 1879) at the `work.pay(work.calc(64).plus(bill, …))`
  reservation, 526 line 1950. Result workLimit through (8, 0). The 302 stale route remains
  RED as 515/516/517/518/526 stated in advance; the remaining route (week-8 reservation and
  sweep, week-9 commit, week-9 release frame, week-10 refusal) is unchanged at ≈ 22k LIKELY.
- No cap, timeout, assertion, fixture or expected-failure set changed.
