# 792 — P14C.4 demonstration BASELINE, measured before any C.4 source exists

Parent measurement, 2026-09-25 21:58:55–22:20 CEST (host clock; the last harness run ended before `date` read 22:20:03). Harness
`792-c4-demonstration-harness.mts` (sha256 `1b2bc45e05c751ed…`): a fresh generated studio
(`p13aGeneratedStudio(seed)`), a PASSIVE player (no player action at all), rivals under their own policy,
6,240 ticks, one sample every 52 weeks. It reads the lifecycle root and cohort receipts by feature detection,
so the same bytes run at every source. Seeds `p14c4-demo-01/02/03`. Outputs: `792-c4-demo-{ref,c2a}-{01,02,03}.json`.

| arm | source | meaning |
| --- | --- | --- |
| `ref` | `f3652852` (C.1 closed, before any C.2 source) in a disposable detached worktree (`git worktree remove`d after the three runs) | the 782 §6.2 reference: no retirement |
| `c2a` | `ff7b9ac1` (src identical to the C.2a checkpoint `c34b6674`) | retirement, no cohorts: 782 §4's "cohorts disabled" arm |

Both arms record `srcDirty: false`.

## 1. The two arms against 782 §4's pass condition

| | ref (3 seeds) | c2a (3 seeds) |
| --- | --- | --- |
| active population at week 6,240 | 84, 84, 84 (constant from week 0) | **0, 0, 0** (first zero at 4264 / 4784 / 4524) |
| hiring listing | never below 8 | **empty from week 2,548** on all three seeds; empty for good from ≈4,680 |
| first week with NO unproven person under 30, per profession | actor 260–520, director 364–468, writer 0–416, craft 156–520 | **identical to ref**, seed by seed |
| pass condition (every film profession has an unproven person under 30, and the market is non-empty, at every tenth year after year 10) | FAILS from year 10 (youth clause) | FAILS from year 10 (youth clause) and from year 50 (market clause) |

The youth clause fails in BOTH arms at the same weeks. Aging alone (C.1) removes every person under 30 within
ten years, because a passive world adds nobody young. Retirement then removes everyone else. By week 4,680 every
seed's C.2a world has no working professional. This is the gap C.4 exists to close.

## 2. Pre-existing finding F-792-1: the rival economy collapses in a passive-player world

The finding is present in BOTH arms, so C.2a did not cause it. On all three seeds every rival's cash is negative
from week 260. Rival active employment reaches 0 by week 416. It returns to 6 only at samples where the newest
entrant is the single rival with positive cash (an inference from the samples, not traced). Businesses grow from 4 to 9 through scheduled entry. The industry's film count stops
early: seed 01 at 18 by week 572, seed 03 at 9 by week 52, and seed 02 never releases a film beyond the 8 in
the starting manifest. The passive player's own cash turns negative at week 1,352, which is expected when the
player makes no films. Earlier programme records mention only single-rival insolvency (for example "r04 insolvent at 404",
`evidence/p14b1-20260919-t4/13-b2-test-preparation.md:128`); none of them records this systemic collapse,
so this record is its first measurement. **This is recorded, not fixed:** rival solvency is not C.4's to change, and
no plan item authorizes new rival economics. Consequences for C.4:
- The demonstration measures SUPPLY in a dead industry. In this world nobody gains credits, so every entrant
  stays unproven until 30, and idle retirement at the window start ends every career.
- In a live economy the youth clause is harder to meet, because young people get credits and become proven.
  The demonstration cannot show that case; its record must say so.

## 3. First runtime measurement at the endurance horizon (passive world only)

The first run of any arm to week 6,240. The machine was shared with a concurrent single-file test process, so
times are indicative. The same seed measured 52.3 s and 68.3 s in two runs.

| arm | total, 3 seeds | per 1,040 weeks, first → last |
| --- | --- | --- |
| ref | 31.8–36.6 s | 9.2–10.2 s → 3.8–4.4 s (falls as the industry dies) |
| c2a | 51.5–68.3 s | 8.1–8.7 s → 10.1–11.1 s (**rises** while nobody works) |

Late-game cost in the c2a arm, SOURCE-DERIVED EXPLANATION (not instrumented): every active professional is retired or capped, so each broke rival
reaches `staff()`'s mint branch (`hollywoodTick.ts:145-147` at `ff7b9ac1`) on every decision week. It mints a person through
`generateIndustryTalent`, fails the affordability check and discards them. Correct behaviour, repeated
wasted work. Add 783's two history-proportional costs (`idle()` scans, settlement over every record). An
active campaign has far more employment history than this passive world, so this measurement is **not** the
endurance obligation.

## 4. Sizing: 782 R3 as written would fail its own acceptance criterion

`792-c4-sizing-paper-model.py.txt` is a PAPER MODEL, not the engine. It reproduces the c2a arm's measured
dynamics: everyone idle, the idle clause from week 104, `E = A + 52`, windows per 773 D1, and the fresh-founding
composition actor 40 / director 14 / writer 16 / craft 14. It then adds annual cohorts under four sizing rules.
Entrant ages follow TN(24, 3, 20, 32) (782 R5). 200 model seeds per rule (seeded `random.Random(i)`, so reruns
reproduce): 6 min 20 s; rerun 22:31:29–22:36:56 CEST after 782-A2 to print the joint, with identical marginals.

| rule | P(pass at every tenth-year sample) | P(pass at mid-year samples) | P(both, joint) | active at year 120 |
| --- | --- | --- | --- | --- |
| 1:1 replacement of last year's retirements (782 R3) | 0.015 | 0.015 | 0.000 | 84 |
| deficit to the accepted population | 0.015 | 0.015 | 0.000 | 84 |
| 1:1 + youth floor | 0.95 | 0.985 | 0.94 | 90–104 |
| **deficit + youth floor** | **0.97** | **0.965** | **0.935** | **84–87** |

Pure replacement fails because three professions are small. About 0.35 directors retire a year, an entrant
stays under 30 for about six years, and eleven samples across three small professions almost always hit a
gap. The youth floor admits at least one entrant for a profession that has no active person under 30 at the
annual request. The deficit term keeps the population at the accepted size: extra entrants are absorbed by
later requests rather than accumulating. The floor makes the youth clause close to TRUE BY CONSTRUCTION at
the cohort week, so the demonstration must also sample mid-year and report the listing (782 §7).

LOGIC MEASURED (paper model labelled as such) · NOTHING VERIFIED ABOUT C.4, which does not exist yet.
