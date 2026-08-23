# Project: Studio — Economy Intervention Frontier 03

**Status:** final analysis phase; no production tuning or gameplay change

**Production authority held fixed:** TypeScript `main` at `c902a704eb948cc576083d0973c8c23e59937dc1`

**Frozen evidence:** Audit 01 `e6c10c3880c8e843004bd2c57833b09b92efa899`; Diagnosis 02 `159fb7a31f0f125843b11607597dcbd6741e7505`

## Decision

No tested single knob, and no tested automatic combination, reduces both P1 failures while passing the activity and recovery gates. That is the decision-ready result—not a reason to keep searching parameter space.

The smallest credible future path is a coordinated but separable three-part prototype:

1. expose film contribution, downside and committed capital as a **human choice frontier**, rather than replace absolute-profit selection with another automatic rule;
2. give successful studios an **optional, repeated enterprise reinvestment ladder with real value**, at a scale materially above today's capital surface; and
3. treat an **earlier renewal window, possibly combined with modest founding-cohort phasing**, as cliff protection only, paired with an upstream economic recovery route.

The first two are the smallest credible hypotheses for keeping money relevant after success, pending a value-bearing prototype. The third can prevent some liquidity trouble from becoming instant all-role loss. None, alone, restores an unprofitable studio.

## Evidence boundary and experiment design

All counterfactual behavior exists only under `src/harness/economy-intervention-frontier/**` or the analysis seam in `src/harness/d16/driver.ts`. No `src/core/**`, TUNING, save, RNG, production, revenue, UI, bridge, Unity, Living Lot or Three.js behavior changed.

| Experiment identity | Hypothesis / policy | Sample and horizon | Primary metrics | Important limitation |
| --- | --- | --- | --- | --- |
| `D03-CHOICE-CONFIRM-1000x3-W260` | Downside budget and near-best/least-capital automatic selectors can break repeated absolute-profit dominance | 1,000 paired `eta-macro-*` worlds per arm, Week 260 | cash tails, runaway, distress, recovery, releases, contribution, strategy wins | A deterministic policy is not a human comprehension or choice test |
| `D03-CHOICE-ACTIVE-FALLBACK-1000x1-W260` | A least-bad affordable fallback can remove the near-best selector's creative inactivity | 1,000 paired worlds, Week 260 | same metrics plus zero-release runs | Forces a film in worlds where every visible forecast is negative |
| `D03-CHOICE-COMPOSITE-1000x1-W260` | Downside screening plus near-best/least-capital can improve both tails | 1,000 paired worlds, Week 260 | same metrics | Tests one readable ordering of the two signals, not all possible UI designs |
| `D03-CAPITAL-SCALE-1000xP5x3-W260` | Optional repeated capital conversion can identify relevant scale and cadence | 1,000 P5 worlds per ladder, Week 260 | liquid cash, enterprise resources, uptake timing, releases, distress | Asset has full retained book value and no utility, return, depreciation or resale |
| `D03-COMBINATION-1000x3-W260` | Choice and annual medium-scale reinvestment may complement each other | 1,000 paired worlds per choice arm, Week 260 | liquid runaway, enterprise endpoint, distress, recovery, activity | Cannot demonstrate fun or the payoff of an actual facility/capability |
| `D03-PRESERVATION-100x` | Candidate directions do not revive known strategy degeneracies | 100 paired worlds across publicity and 19 policy gates | strategy shares, stars, marketing horizons, publicity, inactivity | Directional gate, not a full re-certification of unchanged systems |
| `D03-RENEWAL-25x3x8-W442` | Expiry phase, legal-window timing and equal-total payment timing interact at the first wall and recurrence | 25 worlds × 3 operating policies × 8 arms, Week 144–442 | cohort loss, role loss, renewal acceptance, final cash, releases, recurrence | 75 policy-entry cells share 25 worlds and are overwhelmingly distressed |

`Runaway` retains Audit 01's maximum-cash threshold of three opening balances (`$60M`). `Enterprise end ≥ $60M` is an endpoint resource measure and is not interchangeable with runaway. `Durable recovery` retains the D-16 103-week sampled definition. Renewal percentages describe policy-entry cells, not 75 independent worlds.

## 1. Best wealth-control frontier

### Automatic film-choice rules: no Pareto winner

Observed facts, all at Week 260:

| Selector | Median cash | Runaway | Ever distressed | End negative | Durable recovery among distressed | Mean releases | Zero-film worlds |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Current P5 absolute contribution | `$70.29M` | 53.7% | 43.8% | 34.2% | 18.7% | 29.43 | 0/1,000 |
| Near-best 80%, least capital, abstain if all negative | `$36.60M` | 42.7% | 31.5% | 25.0% | 9.5% | 22.96 | 110/1,000 |
| Near-best 60%, least capital, abstain if all negative | `$22.90M` | 29.0% | 31.0% | 26.5% | 1.3% | 21.41 | 110/1,000 |
| Downside-loss budget 50%, abstain if none qualify | `$82.01M` | 56.7% | 33.7% | 26.0% | 17.8% | 25.42 | 180/1,000 |
| Near-best 80% with least-bad active fallback | `$12.27M` | 38.0% | 50.0% | 43.2% | 8.0% | 28.49 | 0/1,000 |
| Downside 50% → near-best 80% → least capital, active fallback | `$12.43M` | 38.0% | 49.7% | 42.9% | 8.2% | 28.54 | 0/1,000 |

The 80% abstaining arm is the attractive-looking frontier point until activity is inspected. It cuts runaway by 11.0 percentage points and negative endings by 9.2 points, but 11% of worlds never release a film and conditional recovery falls by roughly half. The stronger 60% arm pushes recovery to 4/310 distressed worlds. Neither passes the disengagement/activity gate.

Forcing the 80% arm to make the least-bad affordable film removes every zero-film run and retains a broad outcome range (`p10 -$10.36M`, `p90 $277.47M`, minimum seven releases). It also exposes why the abstention was doing important work: distress rises to 50.0%, negative endings to 43.2%, roster walls to 31.9%, and durable recovery falls to 40/500. Its paired cash effect versus P5 is `-$42.49M` median and `-$54.86M` mean (95% mean CI `-$58.37M` to `-$51.34M`); it wins only 33/1,000 pairs. `eta-macro-0010` is the worst paired cash tradeoff (`-$252.73M`), while `eta-macro-0400` is the largest gain (`+$4.05M`).

Adding the simple downside screen is almost inert: the composite has the same 38.0% runaway rate, moves distress by only three worlds, and leaves recovery at 8.2%. This rejects the tested automatic composition, not the value of showing both signals to a player.

**Interpretation:** absolute contribution remains too one-dimensional, but replacing it with a deterministic capital-efficiency rule moves harm between tails. The serious candidate is therefore a player-facing package card that exposes expected contribution, downside, committed capital and post-commitment runway together. Human discretion—not a hidden optimizer—must be tested before any selection law changes. No exact threshold is ready for production.

### Optional reinvestment: useful scale result, not a wealth fix

Each analysis rung converts cash to a separately journalled, fully retained enterprise asset only when the studio can still hold its `$20M` opening cash. One estate-equivalent is the measured current five-building surface, `$4.38M`.

| P5 capital shape | Maximum ladder | Median uptake / first uptake | Liquid runaway | Enterprise end ≥ `$60M` | Median liquid cash | Median enterprise resources |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| Current | `$0` | none | 53.7% | 52.3% | `$70.29M` | `$70.29M` |
| Four annual one-estate rungs | `$17.52M` | 4 rungs / Week 52 | 49.5% | 52.3% | `$52.90M` | `$70.29M` |
| Four annual five-estate rungs | `$87.60M` | 2 rungs (`$43.80M`) / Week 58 | 38.9% | 52.3% | `$28.23M` | `$70.29M` |
| Two 104-week ten-estate rungs | `$87.60M` | 1 rung (`$43.80M`) / Week 86 | 53.6% | 52.3% | `$35.94M` | `$70.29M` |

Two facts are robust:

- Today's one-estate scale is too small. Repeated commitments on the order of several current estates are needed before liquid money remains relevant to rich P5 studios.
- Shape matters. Annual opportunities materially reduce liquid runaway; the same maximum resource in two delayed lumps does not prevent the threshold crossing.

The lab does **not** show less wealth. All three arms leave median enterprise resources at `$70.29M`, and every arm leaves the enterprise-end-above-`$60M` rate at 52.3%. The medium and lumpy arms' paired mean enterprise-resource deltas include zero. They exchange liquidity for an asset carried at full value.

**Interpretation:** a serious future candidate is an optional expansion ladder that buys understandable capability, prestige or portfolio scale and carries logically earned commitments tied to those benefits. The result supports only an order of magnitude and annual/repeated shape; it does not support an exact price, benefit or operating cost. A retained-value accounting conversion, automatic tax or benefit-free sink is not a solution.

### Wealth preservation gates

- The active fallback retains exceptional success (`p90 $277.47M`, maximum `$661.76M`) and real failure (`p10 -$10.36M`), but fails the distress/recovery gate.
- Strategy outcomes do not converge: with the active arm in the normal tournament, the largest Week-260 cash share is 30.6%, the candidate itself wins 2.4%, four policies remain at or above 5%, and three remain at or above 10%.
- In the 100-world publicity gate, maximum publicity loses cash to never-publicize in 94 worlds and spam loses in 86. The candidate does not revive a universal publicity endpoint.
- Under the medium capital ladder, star-heavy P7 still loses cash to P3 in 62/100 while retaining higher Fame; minimum versus maximum marketing still reverses between Week 104 and Week 260; disengaged P15/P16 never activate the ladder.
- Office value was not simulated because the abstract asset has no utility. Existing Office creative uplift is untouched, but a real expansion prototype must explicitly test whether it complements or crowds out Offices.
- Every choice, capital, combination and publicity run reconciles; the P5 control is byte-equivalent after policy-name normalization.

## 2. Best renewal/recovery frontier

The factorial moves only analysis-state contract duration/end dates, legal eligibility timing, and timing of the same quoted signing payment. The phased duration offsets are `-18/-6/0/+6/+18` weeks with exact zero sum; founding prices, salaries, roster and RNG are held fixed. The split arm pays half at acceptance and forcibly pays the remainder at the prior expiry, so it is neither a grant nor a discount.

Observed facts:

| Full-now arm | Zero roster at treatment cohort end | Any role loss at cohort end | Role loss ever | Zero roster Week 428 | End negative | Median Week-442 cash |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Current synchronized / 12-week window | 32/75 (42.7%) | 42.7% | 84.0% | 84.0% | 89.3% | `-$7.59M` |
| Synchronized / 26-week window | 26/75 (34.7%) | 37.3% | 76.0% | 74.7% | 89.3% | `-$7.91M` |
| Phased / 12-week window | 25/75 (33.3%) | 42.7% | 84.0% | 78.7% | 89.3% | `-$7.76M` |
| Phased / 26-week window | 22/75 (29.3%) | 37.3% | 78.7% | 72.0% | 89.3% | `-$8.11M` |

For phased arms, calendar Week 208 is deliberately no longer the common expiry: their Week-208 zero-roster count is zero, but that is relocation, not prevention. The table uses each treatment's actual cohort end.

Among the 32 frozen full-wall cells, a 26-week window saves six first-cohort zero rosters; phasing alone saves seven; phasing plus the longer window saves ten. Yet all 32 still experience role loss eventually, none gains a recurrence acceptance versus current, and their mean final cash is worse by `$1.19M`, `$0.81M`, and `$1.55M` respectively. Synchronized 12-week split payment is an exact null in all affected cells.

This observatory produces only 0.24 mean releases from Week 144 to 442. Every arm ends 67/75 cells negative, and 0/67 ever-negative cells recover to nonnegative cash by the end. `facilities-0021/direct-package`, `facilities-0022/direct-package`, and `facilities-0005/scaled-two-team` are representative cases where phase plus the longer window preserves some or all roles at the first cohort boundary but still ends negative and reaches zero roster by Week 428. `facilities-0002/development-casting` remains the healthy no-wall control.

**Interpretation:** the 26-week eligibility class has a modest first-cliff effect. Phasing adds some first-cohort protection only when measured at the shifted cohort boundary. Neither repairs profitability or recurrence. The best renewal candidate is therefore **earlier eligibility as harm reduction**, with modest founding phasing retained only as a combination hypothesis. It deserves another bounded corpus only if that corpus contains economically recoverable studios around the window; it does not deserve a production prototype as a recovery fix.

Confidence is high that split timing and phasing alone do not cure the established wall in this corpus. Confidence is moderate that earlier eligibility can protect a transitional studio. Confidence is low about its general recovery value because this 25-world/75-entry observatory is intentionally dominated by already-failed operating trajectories.

## 3. Combination effects

| Choice + annual medium ladder | Liquid runaway | Enterprise end ≥ `$60M` | Distress | End negative | Durable recovery | Mean releases | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Downside budget 50%, abstaining | 39.7% | 55.8% | 33.7% | 26.0% | 17.8% | 25.42 | Better weak-side incidence, but total rich endpoint is worse than current |
| Near-best 80%, abstaining | 24.5% | 41.5% | 31.5% | 25.0% | 9.5% | 22.96 | Fails with 110 zero-film worlds |
| Near-best 80%, active fallback | 24.4% | 35.2% | 51.7% | 43.6% | 7.7% | 28.47 | Preserves activity but worsens distress and recovery |

By construction, the capital ladder principally reclassifies cash into full-book-value enterprise resources; it does not demonstrate a reduction in total wealth, and its liquidity pressure can still alter later affordability and policy trajectories. In the active combination, median liquid cash falls to `$6.55M`, while median enterprise resources remain approximately the choice arm's `$12.4M`; distress rises from 50.0% without the ladder to 51.7% with it. The table's liquid-runaway column is maximum cash over time, while its enterprise column is an end-of-run resource threshold; neither should be substituted for the other. The tested combination therefore moves failure between metrics rather than improving the frontier.

Wealth and renewal interventions are otherwise largely orthogonal. A rich-only ladder requiring the opening-cash reserve cannot help an insolvent renewal cell, while renewal timing does not touch rich-tail film contribution. Their eventual production prototypes should share preservation gates, but one should not be sold as financing the other.

The plausible combined direction remains conditional: a human-readable film-choice frontier plus optional value-bearing reinvestment addresses success-side money relevance; an upstream recovery route plus earlier renewal eligibility addresses failure-side lockout. This branch did not prove that four-part package and does not authorize it.

## 4. Rejected ideas

| Idea | Why rejected |
| --- | --- |
| Pure near-best 60% or ROI-like automatic choice | Lowers runaway by making durable recovery nearly disappear |
| Near-best/least-capital with forced least-bad production | Preserves activity but raises distress, negative endings and roster walls |
| Downside 50% automatic gate by itself | Lowers distress incidence but raises runaway to 56.7% and allows 180 zero-film worlds |
| Tested downside → near-best composite | Nearly identical to the failed active near-best arm; no two-tail improvement |
| Retained-value capital conversion as a “sink” | Lowers liquid cash while leaving enterprise wealth unchanged |
| Delayed, lumpy capital ladder as primary control | Same maximum scale as the annual ladder, but 53.6% liquid runaway |
| Phasing alone | Moves the calendar cliff; treatment-cohort loss and recurrence remain severe |
| Equal-total split renewal payment | Exact null under synchronized current timing; no durable recovery elsewhere |
| Blanket operating-cost increases, literal wealth taxes, retry-order changes and one-time bailouts | Diagnosis 02 already demonstrated that they punish ordinary studios, offer no player value, are inert, or postpone recurrence; not recomputed here |

## 5. Recommended future player tests

1. **Package-card comprehension.** Show expected contribution, low forecast, committed capital and post-commitment runway without changing the underlying choices. Ask whether players can explain the tradeoff and voluntarily choose a near-best lower-capital film sometimes. Include worlds with all-negative forecasts. Stop if the card creates rote selection, film abstention or a perceived “correct” threshold.
2. **Value-bearing expansion ladder.** Mock three or four repeated annual opportunities spanning current-estate scale to several-estate scale, each with a clear capability/prestige benefit and any ongoing commitment shown before purchase. Ask when success stops making money interesting, whether purchases feel optional, and whether stars, marketing and Offices remain viable alternatives. Do not treat the measured harness prices as production recommendations.
3. **Renewal fairness through recurrence.** Use three authored trajectories: healthy, transiently constrained (affordable around Week 182 but not Week 196), and structurally unprofitable. Compare current timing with a materially earlier window, then with modest founding phasing. Ask whether pressure is legible, whether a viable studio can act, and whether a failing studio still feels allowed to fail. Continue through the second renewal.
4. **Recovery fantasy.** In the same transient and structurally failing trajectories, ask what productive action players expect to use to recover before renewal. Simulation has shown that timing cannot substitute for an economically useful recovery lane; only human play can establish whether the current cheap-film, staffing and cash signals communicate a plausible route.

## Reproduction and compact evidence identity

Raw shards remain ignored. No aggregate JSON is committed. Each digest below is SHA-256 over the ordered list of the four shard SHA-256 values; the frozen Audit 01 macro hashes are independently pinned and revalidated by the aggregator.

| Raw identity | Files / bytes | Instrument commit | Combined digest |
| --- | ---: | --- | --- |
| Confirmed choice endpoints | 4 / 39,743,382 | `68b4f269dae82965bc8c77d4d29ebf0ba09fb778` | `ce4aa7c7a0b6d5847644601df976560c85c53e0743ad319315fecef8cf4c7897` |
| P5 capital scale/shape | 4 / 14,977,595 | `68b4f269dae82965bc8c77d4d29ebf0ba09fb778` | `51c53ba4a458c630e008c5e98bb9800ccfc672b9d3f99fce67b53be7fccd9a97` |
| Initial choice × capital combinations | 4 / 28,631,114 | `68b4f269dae82965bc8c77d4d29ebf0ba09fb778` | `eb50810241f9e49354f5cfb3ff7b97a7f3ed81c56c17a836f1c386513901b2cf` |
| Choice publicity gates | 4 / 3,761,124 | `68b4f269dae82965bc8c77d4d29ebf0ba09fb778` | `2ce40bbf4daafcb389b97c21cdd4b1496823bb6d454637f5b7d57b606cd93b92` |
| Nineteen-policy capital gates | 4 / 9,266,321 | `68b4f269dae82965bc8c77d4d29ebf0ba09fb778` | `7bb319c19e7d9265b233afb195ba07fef66a36b55f4509e2d9b9e6401f44557e` |
| Corrected renewal factorial v3 | 4 / 34,535,237 | `d87a2684cc4b7da3e41c990154df7e41ac6e8d66` | `5eedc9a9f05e2c8f1022d2886b7c99c762343fa5e8d388955fdee2cc118ffc97` |
| Active-fallback choice | 4 / 15,401,316 | `b5dba4e77f45fd1d194e0496a553234f6fb9d6e1` | `338f2d29ea76aa7ebf5dbcdbf3733726fb08f434874d67c98553e17ecb738c9c` |
| Active fallback × capital | 4 / 16,134,194 | `b5dba4e77f45fd1d194e0496a553234f6fb9d6e1` | `114a11fa5b16674d93b5fdda0cfceb3d10a68133ab826438faa5fe2f5ba664b4` |
| Active-fallback publicity gates | 4 / 1,975,899 | `b5dba4e77f45fd1d194e0496a553234f6fb9d6e1` | `12832d8003adf98d7158163fd9d798454edb557e96bfb6e2a7f69024e0379330` |
| Downside/near-best composite | 4 / 15,432,639 | `5194f7cd89d8f7dd907fc3177eab58957b640850` | `a42df533a22d899064b236b801eb1031cbaa1d50f6b600f62eb0417991647a36` |

Representative commands:

```bash
npm run frontier:economy -- choice-shard --seed-count 1000 --arms D03_nearBestProfit_80_leastCapital_activeFallback --shard-index 0 --shard-count 4 --out out/economy-intervention-frontier/choice-0.json
npm run frontier:economy -- capital-shard --seed-count 1000 --policies P5_forecastProfitMax --arms four-rung-1-estate,four-rung-5-estates,two-rung-10-estates --shard-index 0 --shard-count 4 --out out/economy-intervention-frontier/capital-0.json
npm run frontier:economy -- renewal-shard --shard-index 0 --shard-count 4 --out out/economy-intervention-frontier/renewal-0.json
npm run frontier:economy -- aggregate --baseline-dir <frozen-Audit-01-macro-dir> --choice-dir <raw-choice-dir> --capital-dir <raw-capital-dir> --renewal-dir <raw-renewal-dir> --out out/economy-intervention-frontier/aggregate.json
```

## 6. Owner recommendation

### Ready for bounded prototype

- No production economy value or rule. A **non-authoritative package-card/player test** is ready: expose contribution, downside, capital and runway together, retain the player's agency, and use zero-film/activity and durable recovery as stop gates.

### Needs more evidence

- An optional annual/repeated enterprise ladder with actual player value and logically earned benefit-linked commitments, tested around the measured several-estate scale and against enterprise—not merely liquid—wealth.
- Earlier renewal eligibility, optionally crossed with modest founding phasing, in a corpus containing genuinely recoverable pre-window studios and carried through second recurrence.
- The upstream productive recovery lane that must accompany renewal cliff protection; timing alone cannot provide it.

### Leave current system alone

- Star cost/value and Fame saturation; the horizon-dependent marketing tradeoff; publicity saturation/cooldown/anti-spam; Office creative uplift; deterministic cash/RNG/save reconciliation; existing production, revenue and capacity law. This branch found no reason to disturb them.

### Reject

- Pure ROI/near-best automatic replacement, the tested active fallback and downside/near-best composite, downside gating alone, retained-value “sinks,” delayed lumpy expansion as primary control, blanket cost pressure or literal wealth tax, renewal retry-order changes, split payment alone, phasing alone, and one-time renewal bailouts.
