# 799 — P14C.4 demonstration, RUN 1: FAILED (1 of 3 seeds), traced to one design defect

Parent measurement, 2026-09-25 23:15:00–23:17:31 CEST. Source `476046da` (the C.4 implementation, src clean;
`git diff --quiet HEAD -- src` true before the run). Harness `792-c4-demonstration-harness.mts`, sha256
`b60c683b3819078b…` (the version that samples every 26 weeks). Outputs `799-c4-demo-c4-{01,02,03}.json`. The
pass condition is 782 §7.5 exactly as published at `95b981eb`, before any C.4 source existed.

## 1. Result against the pass condition

| seed | 22 youth/listing samples (tenth years + mid-years) | active at 6,240 (band 63–105) | verdict |
| --- | --- | --- | --- |
| 01 | 1 miss: week 5,694 (mid-year), no unproven craft under 30 | 85 | **FAIL** |
| 02 | 2 misses: week 2,054 craft, week 4,654 director (both mid-year) | 84 | **FAIL** |
| 03 | none | 84 | PASS |

Every cohort-week sample passes, and every miss falls on a mid-year sample. The hiring listing is never empty,
with 82–84 rows at week 6,240. The population holds at 84–85. Entrants against retirements over 120 years, per profession (entrants/retirements): 01: actor 123/123, director 37/36, writer 44/44, craft 44/44; 02: actor 124/124, director 39/39, writer 43/43, craft 42/42; 03: actor 124/124, director 38/38, writer 48/48, craft 42/42. Entrants track retirements. A youth-floor entrant lifts a profession above its accepted size until the next retirement absorbs it, which is why seed 01 ends at 85 with one extra director. There is no clip, and there are 120 receipts per seed. Runtime is 46.7–49.9 s per seed. `freeAgents` grows to 285–291 entries,
mostly retired ids (never pruned; 793 §8). The paper model predicted 0.935 per seed; 1 of 3 is well below it.

## 2. Trace (script archived as `799-c4-trace-demo.mts.txt`; each run replays the seed through the real engine)

| seed, miss | at the preceding cohort week | at the miss |
| --- | --- | --- |
| 01 craft 5,694 | week 5,668: the ONLY craft person under 30 is `person-cohort-5460-craft-0`, exact age 29.982, no credits. The floor does not fire (receipt requests 0 craft) | 30.482: nobody under 30 for the rest of the year |
| 02 craft 2,054 | week 2,028: only `person-cohort-1820-craft-0`, exact 29.757; receipt requests 0 craft | 30.257 |
| 02 director 4,654 | week 4,628: youngest `person-cohort-4368-director-0`, exact 29.663; receipt requests 0 directors | 30.163 |

**Root cause, one mechanism for all three:** 782 §7.1 defines `young_p` at the request INSTANT, while the
requirement it serves is a young, unproven presence THROUGH the year until the next request. A person weeks
from their 30th birthday satisfies the predicate, suppresses the floor, and ages out. The same principle
exposes a second leak in R5: entrant ages reach 32, and `isProven` (`talentMarket.ts:700-703`) classes anyone
30 or older as a proven veteran. An entrant drawn at 30–32 therefore enters as the opposite of 782 §2's
"capable-but-unproven newcomers", and one drawn at 29.x ages out within the year (seed 01's
`person-cohort-5460-craft-1` stood at 29.978 at week 5,616).

This is a DESIGN defect in the parent's §7.1 and R5, found by the acceptance measurement. The implementation
does exactly what 793 specifies, and no implementation defect was found. Run 1 stays on the record as a
FAILED prediction. The correction is 782 §9. It does not relax the pass condition, and it is evaluated on
fresh seeds.
