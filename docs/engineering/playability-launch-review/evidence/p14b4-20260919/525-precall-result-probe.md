# 525 — Temporary result probes on the frozen 517 candidate (exact pre-call bills)

2026-09-20. Parent-applied, passive, UNMETERED diagnostic on the frozen 517 candidate, the
same ten observation sites as 514 (marker `B4_RESULT_525`). No optimization, owner, tariff,
cap, timeout, test or validator changed. The exact candidate was restored from the frozen
snapshot copy and hash-verified; no diagnostic remains.

## Identities

- Base commit `df0533c6fac18ec5027231500d80050d800fd3b5`; candidate replay source
  `65cf1bf1a66c3cc91c819ac7f5402527ca677900002c90ca3e58d443f9ac697e` (2796 lines), protected
  patch (record-check capture, production only) `44e54ca7769351d64e39c17cfdc24aa681578c0157799833c96c68715cce4745`.
- Probed source `082d1bed9c4b520df915dd6a46cd745667f4b1e94e5d26a4f2b533d14f17dc02` (2829 lines);
  archived probe patch (candidate + probes, identical for both runs)
  `cbb1b3dbd6617d62cfd9173286386a89d9c32bbc204617d8c7e7d3ed1a26df2d`.
- Runs, serial, `record-check.mjs`, both fixedSource:true, no untracked source:
  first-take 16:01:25.072–16:01:31.376Z exit 0 (PASS including the shared kernel assertion);
  stale 16:01:31.578–16:01:38.134Z exit 1 (original `expected 'workLimit' to be
  'commandRefused'` at test line 234).
- Restoration at 16:01:38Z by copying the frozen snapshot candidate back; SHA256
  `65cf1bf1…c697e` and protected patch `44e54ca7…4745` verified; `git status` shows only the
  candidate, its handback and the 519–525 evidence files.

## Bill values: measured 525 against 514 (505 source) and the 517 handback predictions

| Frame (label, move) | 514 measured | 517 predicted | 525 measured | Arm |
| --- | ---: | ---: | ---: | --- |
| 1 (new; restricted) | 315 | 315 | **315** | unchanged |
| 2 (8→7 retained Development) | 11193 | 6861 | **6861** | C2 |
| 3 (7→6 single-early) | 9587 | 8099 | **8099** | C4 |
| 4 (6→5 single-early, shooting) | 8905 | 8398 | **8398** | C4 |
| 5 (5→4 restricted) | 850 | 850 | **850** | unchanged |
| 6 (4→3 wrapOnly/singleWrapSlot) | 7948 | 7948 | **7948** | unchanged |
| 7 (3→2 restricted) | 576 | 576 | **576** | unchanged |
| 8 (2→1 single Post exit) | not reached (9234 paper) | 5668 | **5668** | C3, now reached |

Every prediction is exact. Both routes are identical up to the first `dimensions` call
(44084 / 44454), and the Ready admission that follows costs 594 less on both routes
(handback predicted a 666 smaller `initialAdmissionBill`; the 72 difference is the changed
admission arm's own calculator charge, which the handback did not predict).

## Work consumed: the unchanged arms are byte-identical in payment sequence

Per-probe `used` deltas (525 − 514), stale route: −594 at every probe from week-1 frame entry
through week-2 `dimensions`; −216 at the week-2 `sweepBillDone` (the retained arm's own
calculator charge grew by 378: the new paid workflow walk, the 339-shape release term and the
retained retention arm) and −4548 at week-3 entry (= −216 − 4332); −4548 at every week-3
probe including `sweepBillDone` (no calculator change on the single-early arm), −6036 at
week-4 entry (= −4548 − 1488) and at every week-4 probe; −6543 from the week-5 commands on
(= −6036 − 507), constant through weeks 5, 6 and 7 at every probe including their
`sweepBillDone`, which proves the restricted and wrapOnly/singleWrapSlot arms' sequences did
not move. The first-take route shows the same deltas and finishes at **182713** (514: 189256;
−6543), leaving 17,287 for the kernel; the original test including the shared kernel assertion
passes again.

## Stale route boundary on 517

The week-8 (Post 2→1, single Post exit) `sweepBill` now completes: `sweepBillDone` at 197319
with bill 5668 (`dimensionsDone` 191456 → 5863 for the pre-sweep constants and the bill's own
calculator work). The cut is the owner reservation immediately after it: `payFailure` at
197419 requesting 5765 (= bill 5668 + the 97-unit observation literal), 2581 remaining, in
`frame` (517 line 1878) at the `work.pay(work.calc(64).plus(bill, …))` reservation, 517 line 1949,
called from `replayPlans`.
Result: workLimit through (8, 0). 514 cut 1225 units inside that same bill's calculation.

Measured saving to the refusal on this fixture: 6543 to the week-8 entry plus 3566 on the
week-8 bill ≈ 10.1k gross, inside the 516 term-level recount (≈10.3–10.8k) once the two
changed-arm calculator charges (+378, +72) are counted. Against 515's LIKELY remaining gap of
≈32.5k, the route still needs roughly 22k more: the week-8 owner reservation and sweep
(≈5.8k + drain/reconcile/bookkeeping ≈1.7k), the week-9 `commitRelease` command (≈6.6k), the
week-9 release frame (≈10–12k) and the week-10 stale refusal (≈0.2k). The 302 stale route
remains RED, as 515/516/517 stated in advance; no cap, timeout, assertion, fixture or
expected-failure set changed.
