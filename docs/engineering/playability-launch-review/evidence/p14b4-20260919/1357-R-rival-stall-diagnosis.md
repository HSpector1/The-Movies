# 1357-R: why rivals stop filming and go broke on the natural route (read-only diagnosis)

HEAD b0809602. Written 2026-10-01 (local). No test, tsc or node ran, and no repository file changed. During the work
the checkout moved to 975e72a1 through three docs-only commits; `git diff b0809602 975e72a1 -- src generated` is
empty, so every source line cited here holds at both.
E = `docs/engineering/playability-launch-review/evidence/p14b4-20260919`. The seed is p13a-core-causal-01 unless a
section names another. M = million. Each claim carries MEASURED (read from an output or the source) or INFERRED
(reasoned from measured facts, with no run behind it).

## Summary

1. Income: a rival earns only studio revenue from its own releases (52% of each week's gross for six weeks). On p13a-core-causal-01 the last payments land at weeks 266, 238, 142 and 90 for r01-r04.
2. Stop: r01, r02 and r03 stop filming with 3.4-7.1M above their reserve. Their two index screenplays lose money at every affordable package; once the dearest package is out of reach the shelving law labels each evaluation cash-blocked, which never counts toward shelving, so the full index blocks every commission and retry. r04 stops because cash minus reserve falls below its cheapest package (about 3.17M).
3. Broke: with no income, cash falls by one weekly operating cost each week. 208-week contracts lapse, every hiring route needs cash above the reserve, and no rival verb sheds a facility or a full team, so the zero-staff floor is 41,500-46,500 a week for good.
4. History: the stall predates shelving. On the old tree r01 and r02 froze at weeks 108 and 118 and still held 9.4M and 10.5M at week 215; shelving added eight films and reached the same end state.
5. Lever: the binding set is the cash-blocked count freeze (hollywoodTick.ts:236, :267), the reserve-plus-cheapest-package gate (:231, :323), the reserve gate on re-hiring (:159; talentMarket.ts:389-401) and the missing cost-shedding paths (hollywood.ts:128-142; hollywoodTick.ts:183-191). On the p13a seeds a film cycle also loses money at full pace, so those levers buy time; solvency also needs per-film returns above the cycle's fixed cost, which seed-b's rivals reached on twice the base market value and p13a's never did.

## Sources and their link to HEAD

- **Decide rows.** `E/1344-stage/s7/out/c-diag/decide-diag.jsonl` holds 1,172 chooser calls to week 520 at 469a9547:
  cash, reserve, affordable count (`pol.evaluated`), unaffordable count (`pol.cash`), best affordable package and
  outcome. The spy leaves the chain unchanged (1344-V §2). HEAD reproduces the c-p13a route byte for byte (1348-X7).
  The rows' reserve-crossing weeks (r01 281, r02 305, r04 115) equal 1357-X's at b0809602. So these rows describe
  HEAD (INFERRED from those three facts).
- **Route outputs.** `c-p13a-1`, `o-p13a`, `c-seedb` and `o-seedb` under `E/1344-stage/s7/out/`: `s7.json` (events,
  series) and `rival-economy.jsonl` (cash, `emp`).
- **Final states.** `/Users/zacheryspector/studio-scratch/1344-s7/out/{c-p13a-1,o-p13a,c-seedb}/final-state.json` are
  uncommitted. Their sha256 equal `E/1344-stage/s7/out/final-state-sha256.txt` (fe78e4ab…, 6b5fc939…, c7a30778…).
  They give money by kind per year (`account.periods`), employment rows, film results, standing receipts and
  talent-market receipts at week 520.
- **6,240-week outputs.** `E/1357-stage/x/1357-P-output.json` and `E/1357-stage/x/1357-X-cash-diag.json`, three seeds, b0809602.
- **Base market values.** A Python port of `src/core/rng.ts` (appendix) reproduces the four final-state values to the
  last bit and 1355-C4's three (23,554,590; 42,486,846; 64,574,534). It gives p13a-wait-control-01 27,148,939.

## 1. Income

**What a rival earns, and from what (MEASURED, source).**
- A rival's production releases at hollywoodTick.ts:379-408, which opens a theatrical run (:398; economy.ts:53-73).
  The run spreads opening × legs over 6 weeks (economy.ts:28-49; `THEATRICAL_WEEKS`, tuning.ts:480).
- Each week the run pays gross × 0.52 (hollywoodTick.ts:414-417; `STUDIO_RENTAL_BLENDED`, tuning.ts:479, set at
  economy.ts:67) as `studioRevenue`, and settles after its sixth payment (:421-423).
- The opening gross is base market value × reach × four other factors (reception.ts:697-703), and the competition
  factor is fixed at 1.0 (:678). Revenue therefore scales with the seed's market value. A rival screenplay's cost comes
  from concept strength alone (screenplay.ts:128-133, :193).
- `studioRevenue` is the only money kind the validator lets rise above zero (hollywoodValidation.ts:295), and it must
  reconcile to the studio's own films (:327). No interest, sale, license or other inflow exists. Income ends five
  weeks after the last release.

**When it stops on p13a-core-causal-01 (MEASURED).**

| Rival | Last greenlight, release | Last income week | Cash at the next decision | Films, weeks 0-519 | Average film net |
|---|---|---:|---:|---:|---:|
| r01 | 253, 261 | 266 | 4,383,955 (267) | 15 | +0.56M |
| r02 | 225, 233 | 238 | 10,140,790 (239) | 15 | +0.77M |
| r03 | 129, 137 | 142 | 8,580,410 (143) | 15 | +0.47M |
| r04 | 77, 85 | 90 | 4,881,823 (91) | 8 | +0.48M |

Sources: `c-p13a-1/s7.json` `events`; c-diag `cash` (r02 gains 18,478 from week 238 to 239, then loses 116,524 a
week); final-state films, `studioRevenueReceived - directCommitment` (range -0.13M to +1.48M per film).

Studio revenue by year (final state `account.periods`; year = floor(week/52), hollywood.ts:44), in M (MEASURED):

| Year (weeks) | 0 (0-51) | 1 (52-103) | 2 (104-155) | 3 (156-207) | 4 (208-259) | 5 (260-311) | 6-9 (312-519) |
|---|---:|---:|---:|---:|---:|---:|---:|
| r01 | 23.80 | 14.55 | 3.92 | 8.08 | 5.38 | 2.40 | 0 |
| r02 | 23.59 | 22.46 | 7.98 | 0.45 | 10.17 | 0 | 0 |
| r03 | 20.57 | 19.35 | 14.84 | 0 | 0 | 0 | 0 |
| r04 | 17.81 | 11.11 | 0 | 0 | 0 | 0 | 0 |

## 2. Why evaluations turn cash-blocked

**The gate (MEASURED, source).**
- `evaluate()` (hollywoodTick.ts:213-237) runs for each ready screenplay in the active index, and only while no
  production runs (:259-260). With no seatable director, three actors and craft it returns staffingBlocked before
  the chooser (:225).
- It passes `cashAvailable = cash - operatingReserve` (:231). `operatingReserve` is this week's
  `rivalWeeklyOperatingCost` times `policy.reserveWeeks` (:60-62; hollywood.ts:106-111).
- `policy.reserveWeeks` comes from the studio template: 13, 18, 20 and 15 for r01-r04 (hollywoodStartingData.ts:12,
  :16, :20, :24) and 15, 18, 13, 16 and 12 for r05-r09 (:28-36). `enterRival` copies it into the business
  (hollywood.ts:207-208).
- The chooser walks 54 packages: 6 billings × 3 negative sizes (0.65, 0.85 and 1.05 of the required negative, times
  `negativeScale`; tuning.ts:39) × 3 marketing rungs (hollywoodPolicy.ts:49-61). It skips a package whose negative
  plus marketing exceeds `cashAvailable` (:62). An affordable package is viable when its forecast contribution
  (expected gross × 0.52 - negative - marketing) beats a marketing-ratio penalty (:66-73; tuning.ts:40).
- With nothing viable, `evaluate()` returns cashBlocked if the chooser skipped any package for cash, and
  economicRejection otherwise (:236). Only economicRejection advances the shelving count (:267-268); 13 shelve
  (tuning.ts:33). 1344-A §3.1 defines cashBlocked the same way.
- The reserve rule at :301 gates commission: fewer than two screenplays in the index and cash at or above the
  reserve. A commission also needs no shelving hold (:302), a free writer (:303-304), a full team (:317-320) and an
  affordable package under a longer reserve, weekly cost × max(reserveWeeks, draft weeks + 9) (:322-327). A retry
  needs no production and a free slot (:286-287).

cashBlocked therefore means "no affordable package is viable and some dearer package is out of reach". No line asks
whether the dearer package would be viable.

**The numbers at onset (MEASURED, c-diag; cheapest package INFERRED as bracketed).**

| Rival, event | Week | Screenplay | Cash | Reserve (weeks × weekly cost) | Cash - reserve | Affordable of 54 | Best affordable contribution | Cheapest package |
|---|---:|---|---:|---:|---:|---:|---:|---|
| r01 first cash-blocked | 250 | script-0021 | 5,919,830 | 1,306,695 (13 × 100,515) | 4,613,135 | 45 | -233,639 | |
| r01 all cash-blocked from | 262 | script-0021 | 4,657,520 | 1,306,695 | 3,350,825 | 12 | -304,871 | 2,712,746-2,745,519 |
| r01 second screenplay | 265 | script-0023 | 5,378,129 | 1,514,695 | 3,863,434 | 24 | -482,499 | 2,869,261-2,897,300 |
| r02 first cash-blocked | 234 | script-0021 | 8,997,979 | 2,097,432 (18 × 116,524) | 6,900,547 | 48 | -248,420 | |
| r02 all cash-blocked from | 247 | script-0021 | 9,208,598 | 2,097,432 | 7,111,166 | 48 | -248,420 | 3,916,591-3,992,414 |
| r02 second screenplay | 247 | script-0022 | 9,208,598 | 2,097,432 | 7,111,166 | 48 | -180,223 | 4,035,115-4,107,890 |
| r03 first cash-blocked | 144 | script-0016 | 8,480,949 | 1,989,220 (20 × 99,461) | 6,491,729 | 52 | -128,959 | |
| r03 all cash-blocked from | 151 | script-0016 | 7,784,722 | 1,989,220 | 5,795,502 | 42 | -128,959 | 3,507,900-3,606,051 |
| r03 second screenplay | 166 | script-0017 | 6,292,807 | 1,989,220 | 4,303,587 | 38 | -276,386 | 2,712,212-2,778,049 |
| r04 first cash-blocked | 49 | script-0005 | 6,255,832 | 1,890,390 (15 × 126,026) | 4,365,442 | 24 | -70,758 | |
| r04 all cash-blocked from | 86 | script-0005 | 3,601,884 | 1,890,390 | 1,711,494 | 0 | none | 3,160,278-3,189,857 |

Cheapest package method: for each screenplay, the last evaluation with any affordable package caps the cheapest
package (the cost of its best affordable package), and the next evaluation with none sets the floor (cash - reserve
that week). No release falls between the two weeks, so the package set holds (INFERRED). r04's bracket comes from
weeks 74 and 75; the other brackets come from weeks 266-271, 173-174 and 181-182.

**What the rows show.**
- At onset r01, r02 and r03 held 0.6-3.1M more than the cheapest package of each frozen screenplay. Every affordable
  package, the cheapest included, failed the forecast test. (MEASURED)
- Four frozen screenplays had earlier weeks with all 54 packages affordable and all 54 unviable: r02's script-0021
  (weeks 235-246) and script-0022 (237-244), r01's script-0021 (251-253) and r03's script-0016 (140-143). The label
  flipped to cashBlocked when the dearest rung left reach; r02 still had 7.1M available. (MEASURED)
- The shelving counts froze below 13: r01 at 3 and 0, r02 at 12 and 8, r03 at 4 and 0. r02's script-0021 sat one
  rejection short. The week-520 final state holds the same counts and index pairs (`screenplayShelving.rejections`,
  `activeScriptOrdinals`). (MEASURED)
- The full index blocked every commission after weeks 262 (r01), 234 (r02) and 163 (r03) (`s7.json`
  `events.commissions`) and every retry after the same weeks. All seven of r01's shelved screenplays fell due by week
  262; its last two retry attempts, at 250 and 262, came back cash-blocked and changed nothing (1344-V §3). (MEASURED)
- Each frozen screenplay missed viability narrowly: best affordable contributions of -128,959 to -482,499 on packages
  costing 2.7-4.6M. (MEASURED)
- r04 is a cash stall. At week 86 it had 1,711,494 above its reserve against a cheapest package above 3,160,277. Its
  last commission came at week 74 (`events.commissions`). The index count and the reserve left commission open until
  week 115, so once its writer was free the commission search (:322-327) found no package that fit (INFERRED: the
  diag spy skips commission searches).
- From onset to cash below reserve at decision time: r01 19 weeks (281), r02 58 (305), r03 57 (208, after its
  week-208 hires) and r04 29 (115). 1357-X lists the same weeks at b0809602; c-diag has no r03 row after 207, so
  r03's week comes from 1357-X alone. (MEASURED)

**Why the packages lose money.**
- The greenlight gate admits films that do not pay for their cycle. The chooser subtracts 14 weeks of fixed cost
  (8 production weeks plus 6 run weeks) from both the score and the threshold (hollywoodPolicy.ts:69-73), so any film
  whose contribution beats the penalty passes. 47 of the route's 53 rival greenlights forecast a negative operating
  margin (c-diag `candidate.m`). (MEASURED)
- Audience awareness falls with nearly every release. 51 of 53 rival releases on p13a and all 107 on seed-b lowered it (`filmReleased`
  receipts, final states); r01 fell from 49.7 to 25.6. A release moves awareness by 7 × (reach - 0.45) plus 1.2 ×
  mean cast fame / 100, with reach = gross / (0.9 × base market value) (standing.ts:153-175; tuning.ts:108,
  :126-129). A p13a film must gross roughly 10-14M to hold awareness, depending on cast fame; rival films grossed
  4.55-15.04M. Above 35, awareness also decays each week (hollywoodTick.ts:427-428; tuning.ts:139-140); below 35
  only a release whose reach clears the pivot lifts it. (MEASURED receipts and source)
- r01's forecast totals fell from 11.47M (film:0) to 4.74M (film:22) (final-state film forecasts). That falling
  awareness drives this decline is INFERRED; no output decomposes the forecast.

## 3. Why staff reach zero and nobody rehires

**The hiring path (MEASURED, source).**
- Contracts run 208 weeks (`HOLLYWOOD_CONTRACT_WEEKS`, tuning.ts:36; entry contracts hollywood.ts:247) and end in
  `finishHollywoodWeek` (hollywoodTick.ts:446-455). Nothing else ended payroll on this route.
- Three hiring routes exist, and the reserve gates each one:
  - P14 market: a rival bids for its own expiring people and for team roles it lacks (talentMarket.ts:698-718).
    Submission (:457) and settlement (:1235) both require cash minus the bonus to stay at or above the reserve
    (:389-401).
  - `staff()` renewal (hollywoodTick.ts:102-127) skips any person with an open market case (:111). The case opens
    with the 12-week renewal window (tuning.ts:409), so this route renewed nobody here.
  - `staff()` slot fill (:140-174) runs every week (:362; tuning.ts:29). It keeps a current employee, else takes the
    last expired person, else the first free person, else mints a new one (:148-157). It then requires cash minus
    the bonus to cover the reserve including the new contract (:159, :95-99).
- The talent pool never blocks, because `staff()` mints. Policy limits hiring to the six team roles plus the
  Scientists research demands (:140, :363). The reserve is the only gate that refuses.

**What happened (MEASURED: c-p13a-1 final state `hollywood.employment` and `talentMarket.receipts`;
`rival-economy.jsonl` `emp`).**
- Week 196: r01, r02 and r03 each bid for all 24 expiring industry people. r04, below zero since week 130, bid for
  none.
- Week 208: r01 and r02 won six each, r03 four. Settlement records "Night Orchard Productions could not fund the
  signing bonus" for r03's own third actor and craft. r04's six people went unsigned, and r04 has had no staff since.
  r03, short a craft and an actor, made no chooser call after week 207 (c-diag), which is what staffingBlocked
  (:225) produces (INFERRED).
- Week 265: r01 hired four Scientists for research while its index was frozen.
- Weeks 404-416 and 461-473: no studio bid for any of the 20 expiring people ("no studio proposed before the decision
  week"). Cash at week 415 stood at -14.7M (r01), -11.1M (r02) and -17.8M (r03).
- The route holds no renewal and no termination: employment receipts carry only entry, replacement and expiry.
- Headcount: r04 6 to 0 at 208; r03 6 to 4 at 208 and 0 at 416; r02 6 to 0 at 416; r01 6 to 10 at 265, 4 at 416
  and 0 at 473.

**Cost of the week-208 re-hire (MEASURED).** r01, r02 and r03 signed 16 contracts of 208 weeks paying 50,015, 66,024
and 46,236 a week: 33.75M of payroll over the term plus 1.52M of bonuses. The new teams made four films (r01's
film:20 and film:22, r02's film:19 and film:20); r03's made none.

## 4. Fixed costs that continue with no staff

**Components of `rivalWeeklyOperatingCost` (hollywood.ts:106-111), charged every week at hollywoodTick.ts:430-432
(MEASURED, source).**

| Component | Rule | Source | With no staff |
|---|---|---|---:|
| Payroll | weekly salary of each active contract | hollywood.ts:107-109 | 0 |
| Overhead base | 15,000 a week | tuning.ts:485 | 15,000 |
| Overhead per contract | 1,500 per active contract | tuning.ts:486 | 0 |
| Starting facilities | development-casting 5,500, stage 9,000, scenery 4,000, post 5,000 | hollywood.ts:128-138, :145-152; tuning.ts:854, :752, :833, :822 | 23,500 |
| Laboratory | 3,000 each | tuning.ts:761 | 3,000-6,000 |
| Instrument modules | 2,000, 2,000 or 1,000 each | hollywood.ts:139-141; tuning.ts:772, :777, :782 | 0-2,000 |

**Measured weekly cost (MEASURED: c-diag reserve ÷ reserve weeks; final-state periods).**

| Rival | Filming (year 1) | At the freeze | Zero staff, from | Facilities at 520 |
|---|---:|---:|---|---|
| r01 | 100,705 | 100,515 (262), 119,515 by 278 | 46,500, week 473 | 4 starting + 2 laboratories + 2,000 of modules |
| r02 | 91,732 | 116,524 (247) | 43,500, week 416 | 4 starting + 1 laboratory + 2,000 of modules |
| r03 | 99,461 | 99,461 (151) | 41,500, week 416 | 4 starting + 1 laboratory |
| r04 | 126,026 | 126,026 (86) | 41,500, week 208 | 4 starting + 1 laboratory |

Every rival built a Laboratory in year 0 (900,000 each, `researchCapacity`), which adds 3,000 a week for life. r01 also
spent 2,665,000 on research capacity, research and a technology adoption in weeks 260-311, after its last greenlight
(year-5 movements). 1352-W0's 38,500 floor counts the four starting facilities only; with their laboratories every
p13a rival sits above it. (MEASURED)

**Verbs that could reduce them (MEASURED, source).**
- Facilities: none. Entry sets the four (hollywood.ts:145-152, :204); rivalResearch.ts:288 adds a Laboratory; no rival
  path removes one.
- Payroll: only expiry and termination. Termination (hollywoodTick.ts:175-197) applies to surplus non-Scientists that
  the slot loop did not keep (:183-184), with more than 26 weeks left (:187), no open promise to them (:188) and cash
  still above the reserve after the charge (:191). A full team is never surplus, and the route records no termination.
- Overhead base: none.
- Research and technology: admission needs cash above cost plus reserve (rivalResearch.ts:132-135;
  technologyRival.ts:48), and research spend idles when cash falls short (technology.ts:166). No rival pause or
  cancel verb exists (1352-W0 §3).

No verb lets a rival cut its fixed cost. It falls only when contracts expire.

## 5. Was the stall there before shelving?

Yes. The old tree (ff803032, equal to 1329's 133aca7a source; 1344-V §1-§2) stalls the same rivals and ends in the
same state. (MEASURED: `o-p13a/s7.json`, `o-p13a/rival-economy.jsonl`, `o-diag/decide-diag.jsonl` to week 215;
candidate columns as in sections 1-3.)

| Measure | Old tree (no shelving) | Candidate = HEAD route |
|---|---|---|
| Last release r01, r02, r03, r04 | 104, 114, 137, 85 | 261, 233, 137, 85 |
| How r01 froze | script-0006 + script-0011, economic rejection with all 54 affordable, from week 108; cash 9,408,615 vs reserve 1,288,885 at 215 | script-0021 + script-0023, cash-blocked from 262 and 265 |
| How r02 froze | script-0011 + script-0013, same pattern, from week 118; cash 10,514,378 vs reserve 2,140,920 at 215 | script-0021 + script-0022, cash-blocked from 247 and 245 |
| r03, r04 | r03: script-0015 economic rejections 138-160 with no exit, both screenplays cash-blocked 161-207; r04: script-0005 cash-blocked from 49, counts equal to the candidate's | r03 shelves script-0015 at 150, then freezes; r04 unchanged |
| Cash first below zero (10-week samples) | 290, 300, 230, 130 | 300, 330, 230, 130 |
| Headcount first zero (samples) | 480, 420, 420, 210 | 480, 420, 420, 210 |
| Cash at 520 | -20.7M, -18.6M, -21.3M, -22.8M | -20.3M, -15.7M, -22.1M, -22.8M |

1329-A named the old lock: a rival holding two ready screenplays with no viable package cannot greenlight or
commission, and no rule shelves an unviable screenplay (1329-A, "Cause"). Shelving (D-1329-1) gave that screenplay an
exit and bought r01 and r02 eight more films. The cashBlocked label closes the exit again once cash thins, so the
lock returns in a new form.

## 6. Why seed-b's late entrants thrive

**Identical by code (MEASURED, source).**
- r05-r09 use the same templates on every seed: capital 24, 26, 34, 28 and 38M, reserve weeks 15, 18, 13, 16 and 12
  (hollywoodStartingData.ts:27-36).
- They start at standing 40/40/50 (hollywoodStartingData.ts:48-52) with the same four facilities and 5.9M of capex
  (hollywood.ts:145-152, :209-211), six 208-week contracts (:226-255) and the fixed entry weeks 520, 988, 1560, 1872
  and 2548 (calendar.ts:3).
- The world stays still: the era never changes after generation (worldgen.ts:694-698; no tick writes it), forces stay
  at 50 (worldgen.ts:659-662), nothing ever fills `competingSlate` (worldgen.ts:680), and the competition factor is
  1.0 (reception.ts:678). Rivals do not compete for audience.

**Different by seed.**
- Base market value (worldgen.ts:671-673, uniform in 20-80M, tuning.ts:2094): 35,646,915 on p13a-core-causal-01 and
  71,160,383 on seed-b (MEASURED, final states), 27,148,939 on p13a-wait-control-01 (INFERRED, Python port). Gross
  scales with it and costs do not (section 1).
- Late entrants hire the first free person of each role from the seed's own talent pool (hollywood.ts:229-230).
  r05's entry bonuses came to 457,564 on p13a and 645,157 on seed-b, leaving 17,642,436 and 17,454,843 (MEASURED,
  final states; 1344-V ruling 4).

**Measured outcomes.**

| Measure | p13a-core-causal-01 | p13a-wait-control-01 | seed-b |
|---|---|---|---|
| r01-r04 average film net, weeks 0-519 | +0.47 to +0.77M | not measured | +1.46 to +2.04M |
| r01-r04 revenue ÷ direct cost, weeks 0-519 | 1.15-1.22 | not measured | 1.33-1.63 |
| r01-r04 fixed cost per 9-week film cycle | 0.83-1.13M | not measured | 0.74-0.97M |
| r01-r04 first cash ≤ 0 | 294, 323, 226, 130 | 248, 210, 132, 110 | 642, 614, 508, 479 |
| r05-r09 weeks from entry to cash ≤ 0 | 177, 203, 222, 227, 321 | 119, 162, 247, 204, 276 | never |
| r05-r09 lowest cash; cash at 6,240 | below zero | below zero | 6.7-17.6M; 0.67-3.13B |

Sources: final states (`films`, `account.periods`); `1357-X-cash-diag.json` (`firstNonPositive`, `minCash`,
`endCash`). The 9-week cycle is the fastest a rival can film: one production at a time (hollywoodTick.ts:260) of 8
weeks (tuning.ts:76), and c-diag shows r01 greenlighting at weeks 3, 12, 21, 30, 39 and 48.

**What this supports.**
- On seed-b a full-pace film cycle earned 0.69-1.07M above its fixed cost; on p13a it lost 0.06-0.65M (INFERRED
  arithmetic on the MEASURED rows above). In code, a late entrant's capital, standing, facilities, costs and reserve
  do not depend on the seed. The seed sets the base market value, the people the entrant hires and every later draw
  (concepts, forecasts, reception).
- r05 on p13a-core-causal-01 reached zero cash 177 weeks after entry. Its entry cash buys 183 weeks of its entry
  weekly cost (96,384: payroll 48,884, overhead 24,000, facilities 23,500). Its whole life therefore netted about zero
  income (INFERRED).
- seed-b's r01-r04 still collapse. Their awareness fell to 0 at weeks 448, 465, 358 and 265 (receipts), and they
  shelved 60 screenplays from week 195 on (1344-V §4-§5). (MEASURED)

**What the outputs cannot answer.** Beyond r05's entry rows at week 520, no output records a film, a standing change,
a decision or money by kind for any of r05-r09 on any seed. The §7 runs stop at week 520, the week r05 enters; 1357-P
and the 1357-X cash diagnostic record only condition stage, cash and headcount. So the outputs cannot say why seed-b's late entrants
thrive, whether p13a's late entrants film at all, or whether their awareness erodes as r01-r04's does.

## 7. The binding constraint

A rival that stops filming needs, in order: a free slot, a viable package it can afford above its reserve, a team,
and then a film cycle that earns more than its fixed cost. If it cannot film, it needs a way to cut cost. These
mechanisms decide each step.

**Stop with cash (r01-r03).** The cashBlocked label (hollywoodTick.ts:236) and the count rule (:267-268) keep two dead
screenplays in the index, and the index rule (:286-287, :301) then blocks every commission and retry (MEASURED,
source and section 2). To change the outcome, a screenplay with no viable affordable package would have to leave the
index, or advance its count, while a dearer package sits out of reach. Timing matters too: 13 counted rejections plus a 13-week hold (tuning.ts:33-34;
hollywoodTick.ts:280, :302) must fit inside the rival's runway above its reserve.

| Rival | Freeze | Cash above reserve until | Earliest recommission had cash-blocked weeks counted | Fits? |
|---|---:|---:|---|---|
| r01 | 262 | 281 | 284: script-0021 reaches 13 at 271, hold 13 | no |
| r02 | 247 | 305 | 262: shelvings at 247 and 249, hold to 262 | yes, 43 weeks left |
| r03 | 151 | 208 | 165: script-0016 reaches 13 at 152, hold to 165 | yes, 43 weeks left |
| r04 | 86 | 115 | does not apply: a slot was free and no package fit | no |

This table is INFERRED arithmetic on MEASURED weeks; no run tested it, and nothing measured shows the new
screenplays would be viable.

**Stop for cash (r04).** The cash a rival must hold to start its cheapest film is its reserve plus that film's
cheapest package: hollywoodTick.ts:60-62 and :231 for the evaluation, :323 for the commission, hollywoodPolicy.ts:57-62
and tuning.ts:39 for the package (MEASURED, source). r04 needed about 5.06M (1.89M reserve, MEASURED, plus a
3.16-3.19M cheapest package, INFERRED bracket) and held 3.6M. That sum would have to fall below what a rival holds
when it stops.

**Cut costs (all four).** No rival path removes a facility (hollywood.ts:128-142, :145-152; hollywoodTick.ts:432), and
termination never reaches a full team or a rival below its reserve (hollywoodTick.ts:183-191). Every re-hire needs
cash above the reserve (:118, :159; talentMarket.ts:389-401), and new contracts and research commitments ignore a
frozen pipeline (talentMarket.ts:698-718; rivalResearch.ts:132-135; technologyRival.ts:48) (MEASURED, source and
sections 3-4). Cost levers buy time and cannot save a rival on their own. Had r02 released its frozen team at week 247, the termination charge (26 weeks of
salary, 1.72M; employment.ts:207-210) would have left zero-income cash to last until about week 419 instead of 323
(INFERRED arithmetic). Any floor with no income ends below zero.

**Underneath.** On the p13a seeds a full-pace film cycle lost money against fixed cost (section 6; INFERRED arithmetic
on MEASURED rows). Three mechanisms feed that loss: the greenlight gate ignores the cycle's fixed cost
(hollywoodPolicy.ts:69-73), awareness falls with nearly every release (standing.ts:153-175), and gross scales with a seed-drawn base market
value (reception.ts:697-703) (MEASURED, source). Freeing the slot or cutting cost slows the fall on those seeds;
recovery also needs film cycles that earn more than they cost (INFERRED).

## Levers

| # | Mechanism | Code | Measured effect | What would have to change | Kind |
|---|---|---|---|---|---|
| L1 | cashBlocked evaluations never count toward shelving | hollywoodTick.ts:236, :267-268; hollywoodPolicy.ts:62, :73 | r01-r03 froze at counts 3/0, 12/8, 4/0 with 3.4-7.1M above reserve | a screenplay with no viable affordable package must eventually leave the index while dearer packages are out of reach | resume income |
| L2 | a full index blocks commission and retry | hollywoodTick.ts:286-287, :301 | no commission or retry after 262, 234, 163; all seven of r01's shelved screenplays were due by 262 | a slot must open when both index screenplays are frozen (follows from L1) | resume income |
| L3 | the shelving clock | tuning.ts:33-34; hollywoodTick.ts:280, :302 | at least 26 weeks from a fresh freeze to a recommission; r01 had 19 | freeze-to-recommission time must fit inside the runway above the reserve | resume income |
| L4 | reserve plus cheapest package | hollywoodTick.ts:60-62, :231, :323; hollywoodPolicy.ts:57-62; tuning.ts:39 | r04 needed about 5.06M to film and held 3.6M at week 86 | that sum must fall below what a stopped rival holds | resume income |
| L5 | every re-hire needs cash above the reserve | hollywoodTick.ts:118, :159; talentMarket.ts:389-401, :457, :1235 | r04 lost its team at 208; r03 lost its craft and an actor; nobody re-staffed at 416 | a rival below its reserve needs a way to keep or regain a minimum team | resume income |
| L6 | no facility disposal | hollywood.ts:128-142, :145-152, :204; hollywoodTick.ts:432; rivalResearch.ts:288 adds only | floor of 41,500-46,500 a week for life | a rival path that removes a facility and its opex | cut cost |
| L7 | termination never reaches a full team | hollywoodTick.ts:183-191 | no termination on the route; frozen r01-r03 paid 2.4-3.4M a year in payroll | a rival that cannot film must be able to release staff it cannot use, below its reserve | cut cost |
| L8 | commitments ignore a frozen pipeline | talentMarket.ts:698-718; hollywoodTick.ts:140-174; rivalResearch.ts:132-135; technologyRival.ts:48 | 16 contracts at 208 (33.75M) for four films; r01's 2.67M of research and technology after its last greenlight | new commitments must read whether the rival can film | cut cost |
| L9 | the greenlight gate ignores the cycle's fixed cost | hollywoodPolicy.ts:69-73 | 47 of 53 greenlights forecast a negative operating margin | the gate must weigh the cycle's fixed cost (this cuts filming, so alone it only slows the drain) | upstream |
| L10 | awareness falls with nearly every release | standing.ts:153-175; hollywoodTick.ts:427-428; tuning.ts:108, :126-129, :139-140 | 51 of 53 p13a and 107 of 107 seed-b releases lowered it | rival films need a way to hold awareness at the reach they achieve | upstream |
| L11 | one income source | hollywoodTick.ts:414-417; hollywoodValidation.ts:295 | income ends five weeks after the last release | any inflow without a release needs a new positive money kind | income |

The smallest binding set: L1 (with L2 as its consequence) and L4 decide whether a stopped rival can film again
before its cash runs out; L6 and L7 decide whether it can cut cost; L5 decides whether it can film after its
contracts end. L3 and L8-L11 shape how fast and how far.

## What this report did not measure

- Whether the new screenplays would be viable had the frozen pair left the index. No counterfactual run exists; the
  section 7 timing table is arithmetic.
- Whether the dearer packages of r01's script-0023, r03's script-0017 and r04's script-0005 were viable. Those
  screenplays were never fully affordable in the diag.
- Commission searches. The diag spy skips them, so r04's failed commissions in weeks 78-114 are inferred.
- Anything about r05-r09 beyond cash, stage and headcount, on any seed, including whether they film.
- p13a-wait-control-01 beyond the 1357-P and cash-diagnostic summaries. Its base market value comes from the Python
  port.
- Chooser rows on seed-b. Its stall evidence (awareness reaching 0, 60 shelvings) comes from receipts and `s7.json`.
- How the forecast splits between awareness, cast, screenplay and market.
- Money by kind after week 520. The final states stop there; 1357-X covers 6,240 weeks with cash, stage and
  headcount only.
- The reserve arithmetic behind r03's two refused seats at week 208. The settlement receipt names the bonus refusal;
  this report did not reproduce the sum.
- The old tree after week 215 for chooser rows (o-diag stops there).
- How P15B's law or the player's economy would respond to any lever. No re-probe ran.

## Appendix: the RNG port behind the base market values

`worldgen.ts:671-673` draws `stream(seed, 'worldgen', 'market').uniform(20M, 80M)`. This port of `rng.ts:70-120`,
`:168-170` and `:204-206` returns 35646914.85371441 for p13a-core-causal-01 and 71160382.95906037 for seed-b,
equal to the final states, and 27148938.72 for p13a-wait-control-01.

```python
M = 0xFFFFFFFF
def i32(x):
    x &= M
    return x - (1 << 32) if x & 0x80000000 else x
def imul(a, b): return i32((a & M) * (b & M))
def splitmix32(seed):
    z = i32(seed + 0x9e3779b9); nxt = z
    z = imul(z ^ ((z & M) >> 16), 0x21f0aaad)
    z = imul(z ^ ((z & M) >> 15), 0x735a2d97)
    z = z ^ ((z & M) >> 15)
    return z & M, nxt
def seed_state(s):
    h = i32(0x811c9dc5)
    for ch in s: h = imul(h ^ ord(ch), 0x01000193)
    acc, words = i32(h), []
    for _ in range(4):
        v, acc = splitmix32(acc); words.append(v)
    return words
def sfc32(st):
    a, b, c, d = [x & M for x in st]
    t = i32(a + b); a = b ^ (b >> 9); b = i32(c + ((c << 3) & M))
    c = ((c << 21) & M) | (c >> 11); d = i32(d + 1); s = i32(t + d); c = i32(c + s)
    st[:] = [a & M, b & M, c & M, d & M]
    return (s & M) / 4294967296
def base_market_value(seed):
    return 20_000_000 + 60_000_000 * sfc32(seed_state(f"{seed}::worldgen::market"))
```
