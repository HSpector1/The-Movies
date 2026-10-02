# 1355-X4: the P15A.1 Wave 2 open-loop gate G1, run at HEAD 975e72a1

[1355-A](1355-A-p15a1-wave2-charter.md) §5 sets G1 before the recorded RED: apply `assessBatch` week by week to each
route's recorded releases, open loop, with no production change.

**Result: Proceed, flagged for the Wave 4 playtest brief.** At week 6240, every table row G1 can fill reads
Proceed on both seeds except one. On p13a only 8.8% of releases reach f ≤ 0.95, under the 10% line, so pressure there
is too weak to notice. No row reads Retune in any scope.

## How it ran

- **Probe.** [1355-G1-probe.ts](1355-stage/g1/1355-G1-probe.ts) (sha256 5bea7a2f…), written by an agent for this gate,
  with notes in [1355-G1-notes.md](1355-stage/g1/1355-G1-notes.md).
  - It ticks `p13aGeneratedStudio(seed)` once a week. Each week it runs `assessBatch` on that week's recorded releases
    against the 25 weeks before them, which it keeps with the law's own `reduceExposures`.
  - It never feeds the factor back.
  - Player releases come from `studio.releasedFilms`, with genre from the concept. Rival releases come from
    `hollywood.films` with provenance `simulation/v1`.
  - Gross is each release's recorded `boxOffice.total`.
- **The seed-b route.** 1355-A :173 builds seed-b with `rivalFixture`, which ignores its seed
  (`tests/helpers/p14b2-fixtures.ts:249-265`). The probe runs `p13aGeneratedStudio('seed-b')`, as 1357-P does.
- **Tree and lane.** The same scratch tree as [1359-X4](1359-X4-p15c-gp-probe-results.md) (975e72a1, Node v20.20.2).
  It ran alone under `HEAVY-LANE-LOCK` on 2026-10-01 CDT:
  - a 20-week smoke from 23:14:46 to 23:14:49;
  - the full run from 23:22:25 to 23:29:41, exit 0.
- **Outputs:** [1355-G1-output.json](1355-stage/g1/1355-G1-output.json) (663,964 bytes, with one row per release) and
  [1355-G1-progress.txt](1355-stage/g1/1355-G1-progress.txt).

## The weekly checks

- **Count check.** No recorded release escaped its week.
- **Due-set check.** Every week's recorded releases equal the set 1355-A §3.1 would freeze: 0 mismatch weeks of 6,240 on
  each seed.

## The §5 table rows G1 fills (cumulative to week 6240)

| Row | Proceed | Flag | p13a-core-causal-01 | seed-b |
|---|---|---|---|---|
| Median factor | ≥ 0.95 | 0.90-0.95 | 0.984 | 0.976 |
| p10 factor | ≥ 0.85 | 0.80-0.85 | 0.955 | 0.909 |
| Lowest genre mean factor | ≥ 0.90 | 0.85-0.90 | 0.956 | 0.958 |
| Releases with f ≤ 0.95 | ≥ 10% | < 10% | **8.8%, Flag** | 22.2% |
| Releases | | | 91 | 1,952 |
| First-order gross change Σ gross·(1-f) / Σ gross | report only | | 1.9% | 3.4% |

## By read-out

| Week | p13a releases (cumulative / window) | p13a's flagged rows | seed-b releases (cumulative / window) | seed-b's flagged rows |
|---:|---|---|---|---|
| 520 | 53 / 53 | none | 107 / 107 | none |
| 1560 | 71 / 18 | window: f ≤ 0.95 at 0% | 283 / 176 | window: f ≤ 0.95 at 1.1% |
| 3120 | 91 / 20 | cumulative 8.8%; window 0% | 927 / 644 | none |
| 4680 | 91 / 0 | window: no releases | 1,622 / 695 | none |
| 6240 | 91 / 0 | cumulative 8.8%; window: no releases | 1,952 / 330 | none |

- **p13a makes no release after the 3120 window.** This is the rival collapse
  ([1357-X](1357-X-p15b-wave2-probe-results.md), [1357-R](1357-R-rival-stall-diagnosis.md)). Its pressure sample is
  thin: 91 releases in 120 years.
- **seed-b's p10 factor** is lowest at week 520 (0.868, Proceed), when its four first rivals release together.

## Consequence

- G1 does not block the P15A.1 Wave 2 RED.
- The flag goes into the Wave 4 playtest brief. On a thin economy, pressure stays below the noticeable line.
- G2, the closed loop, runs later against the frozen step-(c) candidate at the RED commit (1355-A §5).
