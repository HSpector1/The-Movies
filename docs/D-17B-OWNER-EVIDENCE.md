# D-17B — Awareness Business Cycle & Reach Repair — Owner Evidence

**Status:** implementation evidence complete; **Owner / Engine PM review required**.  
**Accepted foundation:** D-17A `79a9ab3bb9e31ed7d32c571a56d9cc07792ed72f`, annotated tag
`d17a-decision-truth`.  
**Production implementation measured at:** `a48862b871bc487e6d449891b536a9db616e1373`
(implementation/evidence source; documentation-only closure follows).  
**Branch:** `d17-economy-truth-equilibrium`; `main` local and `hspector-github/main` both
`33eb33ae307904aa3f00db20bc695e40bf46d1e4`; no merge or push.  
**Authority:** D-16 Owner Rulings + D-17B Owner Authorization + Candidate Design Contract rev. 3.

This package reports production execution, not simulation shims. Generated corpora are intentionally
Git-ignored; every artifact path, source commit/tree, dirty flag, execution mode, candidate key and
known reference defect is recorded in its `summary.json`.

## 1. Recovered and shipped production stack

| System | Production rule |
|---|---|
| Reach neutral | engaged `.45`; disengaged legacy `.58` (E1) |
| Awareness counter-flow | engaged-only, pull-down only: `A' = A − .04·max(0,A−35)`, tick step 5.5 |
| Discoverability | threshold `.375`, spread `4`, exponent `1.5`, floor `.30`, ceiling `1.8`; RNG key remains `discovery-v1` |
| Marketing menu | engaged exact dollars `round(capacity×{1.3,2.4,3.7})`, strictly ascending; disengaged legacy menu (E2) |
| Publicity | immediate, deterministic, engaged-only, affordable-only; `lift=maxLift·(1−A/100)^6`; saturation `100`; global cooldown 6 wk |
| Whisper | `$1,200,000`, max 18 points, tier cooldown 8 wk |
| Push | `$3,600,000`, max 30 points, tier cooldown 12 wk |
| Blitz | `$8,000,000`, max 42 points, tier cooldown 20 wk |
| Persistence/accounting | SaveFileV7; `publicity` ledger kind; no film commitment/contribution contamination |

The action exposes exact cost, estimated immediate lift, post-action awareness/cash, shared and
tier cooldowns, and the measured below-~A30 maintenance boundary. It does not recommend a tier or
guarantee a return. Publicity cannot create cash: the ledger debit equals the tier cost exactly.

## 2. Governed production evidence and identity

### 2.1 Production corpus

`out/d16-economy-lab/corpus/d17b-final-production-reviewed`

- 300 seeds × 208 weeks × 24 policies; mode `CURRENT`; `execution: production`.
- Source commit `bb8b17f7438a943ae258c827144a935e79e48d45`, tree
  `98af02661d0d95777e39e031d14bd84db5e601b2`, dirty `false`, Node `v24.19.0`.
- Exact identity:
  `D17B:drift=0.04/35;reach=0.45/0.58;disc=0.375/4/1.5/0.3/rng=discovery-v1;marketing=capacity:1.3,2.4,3.7;publicity=whisper=1200000/18/sat100/exp6/dur0/cd8;push=3600000/30/sat100/exp6/dur0/cd12;blitz=8000000/42/sat100/exp6/dur0/cd20;gcd=6`.
- P16 do-nothing median end cash is byte-stable at exactly `$9,831,504`.

### 2.2 Frozen-reference comparison

`out/d16-economy-lab/d17b/agreement/d17b-final-production-agreement`

| Comparison | Result |
|---|---|
| Policy medians/rates | **23/23 comparable policies PASS** rev. 3 tolerance; 0 failed |
| P15 exploit | **NOT_COMPARABLE**: frozen reference used `employmentEngaged` and the abolished pre-D-17A economy; production correctly uses persisted `economyEngaged` |
| Maintenance Q6 vs P3 | reference `149/300 = 49.67%` FAIL; production `151/300 = 50.33%` PASS; verdict not identical |
| Anti-spam Q7 vs Q0 | reference 7.00%, production 7.33%; both PASS; production median delta `−$12.128M` |
| Overall | **REVIEW_REQUIRED**, solely because the governed Q6 208-week verdict crosses the 50% boundary |

The separate rev. 3 break-even-tuned below-A≈30 verification arm passed 67.3%; Q6 is the older
below-A20 focused arm. The two-seed boundary movement is reported, never tuned away.

Frozen-reference defects are preserved: publicity identity omitted saturation; source provenance
was absent; P15 used the wrong predicate; 90,277 distinct stored marketing-dollar keys prevent
logical-rung reconstruction; and the stored tournament contained P1–P3 only. The comparator
recomputes tournaments from raw rows. No frozen row was edited.

## 3. Awareness equilibrium, reach and uncertainty

- The joint stack moves full-corpus awareness floor-week share **18.32% → 2.26%** in the governed
  lab comparison and leaves **0.00% ceiling absorption across all 24 production policies**.
- The practical operating range is roughly A0–A57, not the nominal full 0–100 meter. P16 settles
  at A35 from A40 under the pull-down-only drift; the drift never supplies free recovery below 35.
- Production final-awareness medians demonstrate interior residence under active strategies:
  P3 `15.73`, P4 `32.62`, P5 `27.10`, P11 `28.59`, Q1 `20.34`, Q6 `23.81`; low-quality/cheap
  strategies can still absorb at the floor (P1 53.7%, P8 47.0%). This is a repaired two-way stock,
  not guaranteed equilibrium for every policy.
- Candidate DISC tuple produces breakouts/disasters/sign flips `3.3% / 2.6% / 5.6%` in the corpus
  and `5.2% / 4.1% / 7.5%` in the exact harvest, versus baseline `11.4% / 9.5% / 17.1%`.
  Zero of 10 cost deciles exceeds 40% draw share. The worst-case floor is less punitive while
  uncertainty remains material.
- `discovery-v1` is retained because only constants changed. Replay determinism and the unchanged
  RNG key are regression-tested.

## 4. Publicity: use, anti-spam and recovery

### 4.1 Tier utilization

Across production rows: Whisper `7,781` uses, Push `7,349`, Blitz `851`; the corrected frozen
reference has `7,806 / 7,377 / 844`. Q6 uses Whisper exclusively. Push appears in the intentional
pre-release/max/emergency/spam policies; Blitz is limited to the maximum adversary. Thus the ladder
is behaviorally real across the test menu but ordinary maintenance remains a one-rung use case.

### 4.2 Anti-spam

At 208 weeks, Q7 beats Q0 on only **7.33%** of paired production seeds and loses the median world by
`$12.128M`; Q7 median end cash is `$1.690M` vs Q0 `$9.379M`. Q4 maximum publicity is worse:
median `−$11.583M`, distress `99.67%`, terminal decline `61%`. The mechanic is not upkeep spam.
The rev. 3 312-week reference result remains disclosed: Q7 wins 38.5% with median `−$4.82M` but
positive mean from tail worlds; the week-208 roster wall materially mediates that horizon result.

### 4.3 Distress continuation

`out/d16-economy-lab/d17b/continuation/d17b-final-production` continues the same 180 verified entry
states for 156 weeks:

| arm | durable@103 | end insolvent | floor absorption | median end cash | median publicity |
|---|---:|---:|---:|---:|---:|
| Q0 never publicize | `0/180 = 0.0%` | 100.0% | 85.0% | `−$5.474M` | `$0` |
| Q1 low-awareness | `23/177 = 13.0%` judged | 85.0% | 30.6% | `−$5.132M` | one Whisper / `$1.2M` |
| Q5 emergency | `19/180 = 10.6%` | 89.4% | 35.6% | `−$5.378M` | one Whisper / `$1.2M` |

Publicity creates real, costly exits and durable recoveries, but remains below G8's 25% bar and
leaves 85–89% of these continuations insolvent. It is an option, not a rescue guarantee.

## 5. Marketing menu and film-purpose evidence

Production recorded **144,420 logical film-rung choices**: low `32,242` (22.33%), middle `73,493`
(50.89%), high `38,685` (26.78%). All three rungs are live. The frozen reference's logical mix is
unrecoverable because it serialized dynamic dollar values as `marketingLevel`; no fake comparison
is supplied.

The lab's decision-cell study remains the proper menu-quality evidence: maximum-rung optimal share
38.7%, zero dead rungs, distress access 9.4%, capacity menu beats the best fixed menu on 11/14
player arms with pooled median `+$0.230M`. This is an improvement, not proof that the historical
≤35% target or menu-breadth problem is fully solved.

| Film strategy | Production evidence | Verdict |
|---|---|---|
| Cheap P1 | median film contribution `−$0.815M`; median end cash `−$2.290M`; distress 89%, terminal decline 87.7%, floor absorption 53.7% | **G5 still FAIL**; cheap film purpose not repaired and cost-quartile inversion makes it riskier |
| Standard P3 | median contribution `+$1.232M`; end cash `$9.379M`; distress 45.7%, terminal 42.0%, runaway 25.3% | viable but not dominant proof |
| Premium P4 | median contribution `+$2.942M`; end cash `$11.770M`; distress 71.3%, terminal 46.3%, runaway 39.0%, durable@103 37.9% | economically distinct, but **does not prove** premium is truly best in ≥10% of decision states; G6 remains FAIL |

No talent, salary, contract, payroll, overhead, freelancer or production-budget formula changed.
Talent/package quality does affect measured marketing capacity and therefore exact campaign dollars;
the existing D-17A burn/runway accounting remains the capital counterweight. On the current healthy
fixture, burn is `$116,782/wk`, cash `$22.012M`, and all three affordability scopes remain open;
the Week-86 distressed save burns `$39,174/wk` but can afford only the cheapest `$2.111M` package.

## 6. Strategy, distress and both runaway tails

### 6.1 Player tournament (raw-row recomputation)

P16 do nothing `31.00%`; P4 premium `27.33%`; P5 forecast profit `10.39%`; P11 adaptive `10.06%`;
Q3 publicity ROI `9.72%`; P7 star-driven `5.67%`; Q6 maintenance `3.44%`; every other player arm
below 1%. Four arms clear 10% only before rounding nuances (P5 10.39, P11 10.06, P16 31, P4 27.33),
but P5 still has 66.3% minimum pairwise dominance. G1 therefore fails its pairwise half.

All-arms shares are explicitly not player shares: oracle P14 `61.0%`, P16 `14.67%`, P4 `12.0%`,
P15 `8.33%`; all others ≤1.67%.

### 6.2 Player control vs world variance

The asinh end-cash policy share regresses `0.269 → 0.217`; G3 fails. For cash runaway specifically,
world share rises `.240 → .312` while policy share rises only `.188 → .202`. Better decisions do
matter in individual worlds, but world selection still dominates the tail.

### 6.3 Distress, recovery and terminal decline

- Fresh-start player distress ranges from 0% (P16) to 100% (P9/Q4); representative competent arms:
  P3 45.7%, P4 71.3%, P5 37.3%, P11 46.0%, Q3 37.0%, Q6 42.0%.
- Durable@103 among each arm's distress entries: P4 37.85%, Q2 32.53%, P11 22.46%, P5/Q3 ~16.2%,
  P3 2.92%, Q6 2.38%. The targeted 180-state publicity continuations remain 10.6–13.0%; G8 is
  **PARTIAL**, not a milestone-wide pass.
- Oracle P14: distress 31.7%, durable@103 35.79%, terminal decline 19.3%. It is reported separately
  and never used as player evidence.
- Terminal decline remains substantial: P1 87.7%, P3 42.0%, P4 46.3%, P5 30.3%, P11 35.7%,
  Q6 38.0%, Q7 51.0%.

### 6.4 Awareness vs cash runaway

Awareness ceiling absorption is **0 across all 24 arms**: the stock tail is bounded. Cash runaway
is not. The 14-player-arm mean runaway rate rises **11.1% → 19.6–19.7%**; worlds in which no arm
runs away fall **55.0% → 46.7%**. P5 reaches 51%, P4 39%, P11 44.7%, Q3 52%. This is the exact
Lesson-BK result: awareness runaway fixed does not equal cash runaway fixed.

## 7. Week-86 Owner-save replay and current decision truth

`out/d16-economy-lab/d17b/week86/d17b-final-production` opens the actual save at week 86 with
cash `$2,833,923.17`, awareness `12.306`, 6 contracts, and continues 156 weeks. It is one save,
never pooled as a rate.

| arm | publicity | films | end cash | weeks insolvent | final A | durable |
|---|---:|---:|---:|---:|---:|---:|
| Q0 no publicity | 0 / `$0` | 0 | `−$4.441M` | 102 | 12.306 | no |
| Q1 low awareness | 1 Whisper / `$1.2M` | 0 | `−$5.641M` | 126 | 20.492 | no |
| Q3 ROI disciplined | 0 / `$0` | 6 | `−$2.374M` | 70 | 0 | no |
| Q5 emergency | 1 Whisper / `$1.2M` | 0 | `−$5.641M` | 126 | 20.492 | no |

The save is not rescued by publicity. The action visibly costs cash and can improve awareness while
worsening solvency; Q3's legal production path is the least-bad measured continuation and still ends
insolvent.

Current D-17A surface remeasurement is recorded in `docs/D-17A-OWNER-EVIDENCE.md`:

- cheapest package: negative `$1,915,390.889` + exact capacity campaign `$195,215` =
  commitment `$2,110,605.889` (rendered `$2,110,606`), cash after `$723,317`, runway `18 wk`;
- direct break-even `$4,058,857.48`; sole-occupancy cycle break-even `$5,113,542.10`; shared
  occupancy `(commitment + $274,218)/.52 = $4,586,199.79`;
- central direct result `−$881,026.99`; studio-economic result `−$1,429,462.99`;
- support `.12531` vs threshold `.375`; band `.3×–1.8×`;
- exact menu `$195,215 / $360,396 / $555,611` at capacity `$150,165.10`;
- old A45/$2M discovery fixture is now correctly supported; replacement A35/$2M fixture preserves
  the retired-proxy mismatch (`.3875` proxy supported vs `.3239188` engine exposed).

## 8. Final G1–G12 table

| Gate | Verdict | Final evidence |
|---|---|---|
| G1 Multiple viable strategies | **FAIL** | four player arms reach ~10% tournament share, but P5 minimum pairwise dominance remains 66.3% (>55%) |
| G2 Capital matters | **PARTIAL** | film/marketing/publicity/payroll choices strongly move distress, but the payroll gradient and broad capital trade remain one-way |
| G3 Better decisions matter | **FAIL** | asinh policy variance share `.269→.217`; world control remains larger |
| G4 Uncertainty without dominating | **PASS** | 0/10 cost deciles exceed 40% draw share; DISC outcomes remain interior/material; breakouts/disasters 5.2/4.1% harvest |
| G5 Cheap films have a purpose | **FAIL / not re-opened** | D-16 structural verdict stands; P1 film median `−$0.815M`; cost-quartile inversion worsens purpose |
| G6 Premium films have a purpose | **FAIL** | P4 outcomes improve but no ≥10% decision-state truly-best proof; protected purpose defect remains |
| G7 Stars create tradeoffs | **PARTIAL/FAIL** | discovery insurance remains, price/value imbalance unchanged; no talent pricing change authorized |
| G8 Distress recoverable sometimes | **PARTIAL** | two fresh-start player arms exceed 25%, but targeted production continuations reach only 10.6–13.0%; no general player recovery pass |
| G9 Waiting is not magical | **PARTIAL** | several producing arms beat waiting in many worlds, yet P16 still takes 31% player tournament share; every-horizon 65% proof not established |
| G10 Recovery is not free | **PASS** | publicity costs ≥$1.2M and continuation residual failure is 85–89%; no-publicity floor exits do not become durable recovery |
| G11 Snowballing bounded | **PARTIAL/FAIL** | awareness half passes (0% ceiling absorption); cash half regresses to 19.6–19.7% mean runaway and remains world-led |
| G12 Failure is legible prospectively | **PARTIAL** | D-17A/D-17B truth surfaces pass; the formal ≥8-week point-of-no-return timing corpus was not re-certified |

This is intentionally not a manufactured clean sweep: 2 PASS, 5 PARTIAL/mixed, 5 FAIL under the
conservative classification above.

## 9. Regression and adversarial proof

- Full repository suite: **112 files / 1476 tests passed** at the reviewed implementation; final
  documentation-close rerun recorded in D-17B Closure.
- D-16/D-17 harness suite: **10 files / 176 tests passed**.
- Root + UI TypeScript: clean. Production Vite build: clean.
- D-12, D-13, D-14, D-15 and D-17A named tests all pass; a green regression suite does not revive
  D-12's stale balance certification.
- Save V5/V6/V7 migration, malformed publicity validation, replay determinism, M0A/disengaged
  byte-identity, publicity cooldown/affordability/diminishing lift/no-money/conservation/saturation,
  menu rounding/strict ascent, DISC tuple/RNG, and D-17A action-parity/read-model tests pass.
- Independent engine review fixed complete V7 validation and legal package action-parity.
- Independent UI review fixed shared/global cooldown visibility, break-even wording, exact charged
  dollars, constant duplication, and required D-17A remeasurement.
- Independent harness/statistical/design review fixed production execution, provenance, policy ids,
  logical-rung instrumentation and raw-row tournament comparison; frozen-reference defects remain
  disclosed rather than laundered.

## 10. Structural residuals and Owner decisions

Not repaired: cash-runaway tail; top-decile economic immortality; week-208 synchronized roster wall;
P5 pairwise dominance; G3 world dominance; cheap/premium purpose; remaining menu breadth; formal G12
timing. Financing, loans, bailouts, failure ladders, restructuring/acquisition, Art work and broader
D1-B work were outside scope and were not started.

Owner / Engine PM must rule separately:

1. **E1:** accept engaged `.45` / disengaged `.58` reach-neutral split under R4, or require the
   contract's unconditional-.45 fallback and M0A rebaseline.
2. **E2:** accept capacity-anchored menu kind under R6, or choose the measured fixed-triple fallback.
3. **E3:** accept the awareness repair with disclosed cash-runaway regression, or defer shipment
   pending a separately authorized size-scaling cash sink.
4. **E4:** accept SaveFileV7 for publicity state.
5. **E5:** accept BALANCED DISC `.375/4/1.5/.30`; MAX-REPAIR remains lower-variance and the third
   option is dominated.
6. **Maintenance boundary:** accept the production Q6 `151/300` PASS despite the frozen reference
   `149/300` FAIL and rely on the rev. 3 below-A≈30 verification, or require a new governed
   production arm/corpus before acceptance. Do not tune the mechanic to force identical labels.
7. Accept this partial G1–G12 outcome as D-17B closure, and charter the next Engine milestone around
   the week-208 roster wall plus a researched size-scaling cash sink—without bundling financing or
   the failure ladder.
