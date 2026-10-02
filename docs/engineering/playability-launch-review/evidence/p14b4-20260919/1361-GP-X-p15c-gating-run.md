# 1361-GP-X: G-P, the gating run for P15C Wave 2

**Result: no trigger. P15C's production proceeds on `p15a1-b-r2`.**
- **Holders:** every archetype's set on both seeds equals 1353-X4's.
- **The sibling roots:** they read as [1361-F5](1361-F5-parent-rulings-on-g2.md) ruling 4 expected, with two
  exceptions in the market reading. Both are errors in the parent's expectations, explained below.
- **C0** passed first.

## What ran

| Item | Value |
|---|---|
| Probe | [1361-GP-probe-r2.ts](1361-stage/gp/1361-GP-probe-r2.ts), sha256 3d460c22…, checked before the tree was built and after the copy |
| Gating tree | an archive of `p15a1-b-r2` (b0b6fb01), with 1353-X4's v2 tree edits committed as 45f3111 |
| Script | [run-1361-gp.sh](1361-stage/gp-x/run-1361-gp.sh) |
| What the script adds to notes §5.4 | 1361-GP-D finding 2's tree guard, which stops unless the smoke names `p15Sequence, powerRanking, sharedMarket`; finding 6's checks (`pipefail`, a stop after each archive and commit, the hash checked first) |
| What the script leaves unchanged | the probe, unrevised |
| Seeds and horizon | `p13a-core-causal-01` and `seed-b` to week 6240; smoke on p13a to week 20 |
| Lane and Node | alone, v20.20.2, after [1361-X3](1361-X3-p15a1-b-r2-dry-run.md) in the same lane job; logs outside the output directories |
| Times (CDT, 2026-10-02) | smoke 16:04:53-16:04:56; full run 16:04:56-16:11:36 (p13a 83 s, seed-b 314 s) |
| Outputs | [1361-stage/gp-x/](1361-stage/gp-x/) (`smoke-gp.json` sha256 f831eab5…, `gp.json` sha256 5ca908b3…) |

### C0, the control (1361-F2 ruling 1)

- **How it ran:** [run-1361-gp-c0.sh](1361-stage/gp-x/run-1361-gp-c0.sh) ran r1 and r2 on the writer's `base` tag
  with the v2 edits, through the lane, 15:48:09-15:48:17 CDT. Outputs: [1361-stage/gp-c0/](1361-stage/gp-c0/).
- **Result: pass on every criterion of notes §5.5.**
  - Both exit 0, with equal `manifestSha256` (c29c90b3…).
  - r2's JSON equals r1's once `probe`, the timings, `recordIdBridge` and `siblings` are set aside. Those two read
    `{landedLawRefusal: null, standInRows: 0}` and `{roots: [], …: null}`.
  - r2's stderr adds exactly one line, `P15 roots at week 20: none; …`.

## Against the expectations fixed before the run (1361-F5 ruling 4)

| Expectation | Result |
|---|---|
| Smoke: exit 0; tree guard | exit 0; "smoke read the roots: p15Sequence, powerRanking, sharedMarket" |
| Smoke: `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8 | as expected |
| Smoke: `rankingRecords` 1, `rankingRows` 5, `p15SequenceNext` 2 | as expected |
| Smoke: `marketRows` 0; `marketAssessments` from week 20 with no assessment | **missed:** `marketRows` null; `marketAssessments` `notRecorded` |
| Full: exit 0; both seeds at 6240, `mode` `"g-p"`; `campaign-legacy/v2`; tuning 60, 20, 49, rest v1 | as expected; `tuning` equals 1353-X4's field |
| Per seed: `adapterRefusals` `[]`, `lawRefusal` null, `f1.standInFilms` 8 | as expected |
| Per seed: three roots, `rankingRecords` 480, `p15SequenceNext − 1` = 480 = the `powerRanking` watermark | as expected |
| Per seed: `marketRows` 0 | **missed:** null |
| Per seed: `rankingRows` and `standInRows` 4,229 | 4,229 and 4,229 on both seeds: 1353-X4's entry weeks hold |
| Domains: `powerRanking` complete from 0; `marketAssessments` and `corporateCondition` `notRecorded`; the seven array domains as in 1353-X4 | as expected; the seven match 1353-X4 in status, start week and watermark |
| Trigger (1359-F5 ruling 1) | none: `retune` false for every archetype |

**Why the market expectations missed.** The parent examined both misses before reading further. Each is an error in
the expectation, not in the tree or the probe.
- **The boundary.** The probe builds facts with the run's last week as the boundary (`legacyFactsFromState(state,
  WEEKS)`, probe :357), so the smoke's boundary is 20, not 6240.
- **What D1 does to the root.** Under D1 the market root records from the current week. At any read-out it is
  therefore recorded from the boundary or later.
- **The rule that applies.** r4's §5.1 item 6 rule (probe :85-91) then reads the root as absent. The domain reads
  `notRecorded`, and `marketRows` reports an absent fact as null (probe :418).

This is the mechanism 1361-D2 named for 2040, and 1361-F5 ruling 2.3 accepts it. On this tree the market lens is
empty at every boundary, not only at B.

## Holders and the manifest, against 1353-X4

| Archetype | p13a now, 1353-X4 | seed-b now, 1353-X4 |
|---|---|---|
| artistic-voice | 0, 0 | 2, 2 |
| audience-institution | 0, 0 | 5, 5 |
| commercial-engine | 0, 0 | 2, 2 |
| technology-pioneer | 1, 1 | 5, 5 |
| talent-foundry | 2, 2 | 5, 5 |
| genre-specialist | 4, 4 | 3, 3 |
| resilient-survivor (exempt) | 0, 0 | 0, 0 |
| awards-dynasty (not evaluated) | 0, 0 | 0, 0 |

- **The holder sets are identical,** not only their sizes. The routes match 1353-X4's to the watermark: 99 and 1,960
  industry films; 546 and 11,712 industry career events.
- **What the sibling roots changed.** They add the `powerRanking` domain and its refs and move no holder.
- **Manifest bytes** are 42,495 and 67,304, against 35,139 and 60,492. The 6.8 to 7.4 KB added are the ranking refs,
  which notes §5.7 item 8 estimated at about 7 KB.
- **`manifestCanonical`** is kept in `gp.json` for G-L's K3.

## Caveats on the record

- **The market lens.** On this tree it is empty at every boundary (above). This run says nothing about how the market
  lens behaves with (c). The retuned (c) brings a G-P rerun on its own tree (1361-F ruling 13; 1353-F6:76-77).
- **The recovery amendment.** 1361-F2 ruling 5 sends G-P and G-L to a rerun after 1363 (1363-F ruling 7).
