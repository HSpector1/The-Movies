# 800 — P14C.4 demonstration, RUN 2 (after 782 §9): PASSED on all 6 seeds

Parent measurement, 2026-09-26 00:22:28–01:08:39 CEST. Source: HEAD at `7ac410c8` when the job started, and
`src/` identical to `ccb8ab17` (the §9 implementation). The JSON records `e19cfd4d`, the HEAD when each run
finished; only tests and docs moved in between, so `srcDirty: false`. Harness `792-c4-demonstration-harness.mts`,
sha256 `b60c683b3819078b…`. Pass condition: 782 §7.5, unchanged. Seeds: 04, 05 and 06 were PRE-REGISTERED as
primary in 782 §9.4 (published at `32b2d58d`) before this run; 01–03 are reported only. Outputs
`800-c4-demo-run2-{01..06}.json`.

A first attempt at 00:04 was abandoned: its background job was killed, and an orphaned seed-04 process kept
running until the parent killed it at 00:22. It wrote no output. CPU time was compared before blaming code:
`476046da` and HEAD both measured about 16.2 s user time on seed 01 to week 1,040, so §9 costs nothing.

## 1. Result

| seed | role | youth + listing (22 samples) | active at 6,240 | industry | verdict |
| --- | --- | --- | --- | --- | --- |
| 04 | PRIMARY | no miss; min unproven under 30: actor 2, director 1, writer 1, craft 1 | 93 | **LIVE: 2,498 films, 6 of 9 rivals solvent** | PASS |
| 05 | PRIMARY | no miss | 88 | collapsed (13 films) | PASS |
| 06 | PRIMARY | no miss | 89 | collapsed (12 films) | PASS |
| 01 | reported | no miss | 85 | collapsed | PASS |
| 02 | reported | no miss | 84 | collapsed | PASS |
| 03 | reported | no miss | 84 | collapsed | PASS |

The listing-level minimum of unproven people under 30 equals the population minimum on every seed, so every
such person was visible to the player in the hiring listing at every sample.

**What this proves and what it does not.** In the five collapsed worlds, 782 §9.5 applies: a young presence
follows from the rule by construction, and the run checks that the implementation delivers it end to end.
**Seed 04 is the informative case.** Rivals there are solvent and keep releasing films, so entrants can gain
credits and become proven before 30, and the youth clause is not true by construction. It held at every
sample. That is one live-economy seed, not a claim about live economies in general.

## 2. The first live-economy endurance measurement

| seed | industry | wall | CPU user |
| --- | --- | --- | --- |
| 04 | live | 2,521.6 s | **1,017.6 s** |
| 05, 06, 01, 02 | collapsed | 42–44 s | 50.3–52.2 s |
| 03 | collapsed | 75.8 s | 62.1 s |

The 6,240-week endurance obligation has now been run for a passive player: about 17 CPU-minutes when the
industry lives, under 1 when it collapses. Cost grows with accumulated industry history; the per-520-week wall time
rose from 12 s to 52 s by week 2,080 in the earlier diagnostic, which ran under the orphan's load, so it is
indicative only. This is not the whole obligation. An ACTIVE
player adds its own history, and no bound in the programme's plan was checked against these numbers.

`freeAgents` reaches 259–290 entries at week 6,240 on every seed (never pruned; 793 §8). The listing therefore
grows with it, and 793 §8 already records that a native list must page.

LOGIC MEASURED · the demonstration criterion of 772 D1, as operationalized in 782 §7.5, is MET on the
pre-registered seeds.
