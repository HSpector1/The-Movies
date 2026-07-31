# Capital Intensity Risk/Reward Audit — read-only balance study

Owner directive 2026-07-30. Read-only: no production tuning/engine/mechanic was
modified. All numbers are produced by driving the authoritative core exactly as play
does (`generateWorld → beginFounding → signContract → foundStudio → greenlight → tick`)
from `src/harness/run-capital-risk-reward-audit.ts` (300 seeds; deterministic, seeded RNG).

Baseline: main `6210906`. Audit branch `economy-capital-risk-reward-audit`.

---

## VERDICT: D — BOTH B AND C

**B (micro-budget overtuned):** cheap coherent films are too safe. Even an unknown cast
with $100k marketing opens ~$3.3M (p10 $1.76M); **P(opening < $1M) = 0%** and
**P(good film obscure) = 0%** in every condition — there is no obscurity risk. The cheap
route is simultaneously best in median Contribution, ROI, loss probability, drawdown, and
profit-per-week (a dominance defect).

**C (premium investment undertuned):** the capital-intensity levers provide too little
incremental commercial ceiling. **Script price buys nothing** (see below); production
budget above "adequate" (neg×1.0) has negative marginal value; top-tier marketing ($1M)
is near-zero marginal over $400k. Expensive scripts + max budget + max marketing raise
cost 3–6× for ~flat gross → Contribution collapses.

The owner's provisional concern (C or D) is correct; the data says **D**.

**E caveat (inside D):** fully realizing the *intended* premium-script tradeoff ("a
premium script creates greater potential, realized by funding + talent") requires a script
COMMERCIAL-POTENTIAL dimension that does not exist today — `baseNegativeCost` is pure cost,
uncorrelated with quality. That specific remedy is a near-new mechanic (E-adjacent).

---

## The smoking gun — script price is commercially inert

Matched factorial, `neg×1.0`, `mkt $400k`, `rank=mid`, ordinary brief, 300 seeds:

| script tier | baseNegativeCost | baselineStrength | craft | WAS | gross (med) | commit | Contribution | loss |
|---|---|---|---|---|---|---|---|---|
| cheapest | $2.28M | 59.8 | 71.9 | 57.1 | $13.39M | $2.79M | **+$4.22M** | 2% |
| median | $4.64M | 59.4 | 71.8 | 56.7 | $13.67M | $5.28M | +$1.93M | 29% |
| expensive | $7.46M | 61.2 | 71.6 | 57.1 | $13.78M | $8.23M | **−$1.17M** | 63% |

Cost rises 3.3×; **quality (baselineStrength), craft, WAS, and gross are flat**; the entire
cost delta comes straight out of Contribution. Causally: `baseNegativeCost` feeds ONLY
`requiredNegative → budgetAdequacy` (a 0.10-weight craft term, capped at 1.15×). A concept
has NO commercial-demand / audience-potential / gross-ceiling field (`types.ts:154-163`).
`baseNegativeCost` is also uncorrelated with `baselineStrength` in worldgen, so buying by
price does not even buy quality.

## Marginal value of each lever (cheapest script, 300 seeds)

- **Marketing** (neg×1.0): contrib $2.92M → **$4.22M** (100k→400k, +$1.30M) → **$4.22M**
  (400k→1M, **+$0.00M**). awarenessFactor 0.31 → 0.40 → 0.46. The $1M tier is dead weight.
  Cause: `marketingQuality = spend/(spend+capacity)` (Hill) with `capacity = 15k +
  1.785M·preMktAware^2.0` — a low-awareness studio has tiny capacity (~$170k) and saturates
  by $400k; `awarenessFactor = clamp(…, 0, 1)` is a hard ceiling. Marketing is also
  redundant with Awareness (both additive into `baseAwareness`, then clamped).
- **Production budget** (mkt $400k): craft 59 → 72 → 75 (neg 0.75→1.0→1.25); contrib
  $3.46M → **$4.22M** → $4.01M. Appropriate funding (1.0) has positive marginal value;
  over-funding (1.25) is negative (cost outpaces the capped budgetAdequacy at 1.15×). **This
  lever behaves as intended** — the defect is script price + marketing top tier, not budget.
- **Script tier**: zero commercial value (table above).

## Owner-run reconstruction (median, 300 seeds)

| film | package | commit | gross | Contribution | ROI | awareBefore | Δprestige |
|---|---|---|---|---|---|---|---|
| 1 | cheapest / Lean / Small | $1.90M | $10.72M | +$3.43M | 177% | 40.0 | +2.4 |
| 2 | cheapest / Lean / Small | $1.90M | $10.37M | +$3.30M | 171% | 38.3 | +1.5 |
| 3 | median / Adequate / Standard | $5.25M | $15.61M | +$2.81M | 52% | 36.5 | +9.1 |
| 4 | expensive / Premium / Large | $10.82M | $18.64M | **−$1.20M** | −10% | 35.6 | +10 |
| 5 | expensive / Premium / Large | $10.71M | $21.41M | +$0.42M | 4% | 35.3 | +10 |
| 6 | expensive / Premium / Large | $10.67M | $22.88M | +$1.19M | 11% | 34.8 | +10 |

Reproduces the owner's pattern: gross rises 2.2× while commitment rises 5.7× → ROI falls
177%→11% and Contribution dips negative. Two silent factors: **Awareness DECAYS** each film
(−0.5 to −1.7), cancelling the rising marketing (redundant + saturating); and **Prestige
climbs to +10/film but is commercially inert** (only `audienceAwareness` is read by
`computeBoxOffice`; `industryPrestige`/`commercialConfidence` are display-only).

## Discoverability (Audit 3) — no obscurity risk

| draw × marketing | opening (med / p10) | P(<$1M) | P(<$2M) | sleeper | goodObscure |
|---|---|---|---|---|---|
| unknown × $0.1M | $3.34M / $1.76M | 0% | 17% | 0% | 0% |
| unknown × $1M | $4.86M / $2.56M | 0% | 3% | 0% | 0% |
| high-star × $0.1M | $4.61M / $2.40M | 0% | 1% | 46% | 0% |

Every film clears ~$1.7M opening. Sleepers require star power (0% unknown → 46% high-star).
An unknown good film can neither flop into obscurity nor become a sleeper.

## Repeated strategies A–E (300 seeds, 6/12 films)

| strategy | 12-film cash mult | profit/film | ROI/film | loss/film | everNeg | drawdown | reach@12 |
|---|---|---|---|---|---|---|---|
| A cheap coherent | 1.26× | $0.77M | 41% | 29% | 0% | $4.9M | 99% |
| B mid-budget | 1.87× | $1.16M | 22% | 34% | 11% | $14.0M | 66% |
| C premium rational | 1.67× | $1.40M | 15% | 31% | 36% | $19.6M | 46% |
| D maximum spend | 1.75× | $1.35M | 12% | 30% | 41% | $19.6M | 31% |
| E cheap incoherent | 0.64× | −$0.32M | −13% | 60% | 5% | $12.1M | 82% |

Premium campaigns reach a higher absolute 12-film ceiling — but that comes from **best
talent (fame → opening)**, not the capital spend, and at 3–4× the drawdown, 31–46% reach
(capital-starved), and 36–41% ever-negative. E (incoherent) correctly loses money and gets
critic 19.5 — the engine *does* punish incoherence. A (cheap coherent) is the ROI/safety
king (0% ever-negative, $4.9M drawdown) but has the lowest absolute ceiling.

---

## Smallest causal corrections (NOT implemented — owner approval required)

All engaged-gated (D-12 path) to preserve M0A byte-identity.

1. **Script → commercial ceiling (core C).** Correlate `baseNegativeCost` with
   `baselineStrength` in the engaged worldgen path AND give quality/potential a real
   commercial weight (raise the appeal/reach ceiling, realized only with adequate funding +
   talent). Minimal version reuses the existing quality field; the fuller "audience
   potential" is a new dimension (E-adjacent). Do NOT make price a direct box-office
   multiplier.
2. **Reduce the universal opening floor (core B).** Lower the awareness-only reach floor in
   `baseAwareness` (the 0.6·awareness term) so a small-marketing, unknown-cast film can
   genuinely under-open — restoring obscurity risk — without penalizing cheap films that
   market adequately. Preserves sleepers (legs still reward WAS) and profitable microbudget.
3. **Marketing elasticity (C).** Soften `MARKETING_AWARENESS_EXP=2.0` (capacity ∝ awareness²)
   or raise `MARKETING_CAPACITY_MIN` so a large campaign buys more reach for a low-awareness
   premium film — while keeping "excessive marketing beyond demand wastes money."
4. (Flag, not a recommendation) Prestige/Confidence are commercially inert; giving Prestige a
   modest paid-reach channel would make the owner's critic gains matter, but that is a design
   decision, possibly a contract non-goal.

### Target before/after distributions

- Expensive script (neg1.0/mkt400k): **now** −$1.17M, loss 63% → **target** median ~+$1–2M
  with a higher p90 (+$8–10M vs cheap's +$6M) AND a larger loss tail (p10 ~−$4M, loss ~35%):
  a rational high-risk/high-reward bet, not strictly dominated.
- Unknown + small marketing opening: **now** P(<$1M)=0%, floor ~$1.7M → **target** P(<$1M)
  ~15–25%, P(<$2M) ~40%.
- Cheap coherent single film: **now** +$4.22M, loss 2% → **target** keep median positive but
  loss ~15–25% at Small marketing (obscurity risk); preserve profitable microbudget outcomes.

### Preserved by design
- **Sleeper hits:** must remain (currently 18–46% for known talent); ideally allow rare
  unknown sleepers.
- **Blockbuster loss risk:** must remain large (currently 36–41% ever-negative on premium);
  raise the ceiling so it is a rational gamble, not a strictly-worse one.

### Tests that would need updates (if approved)
`tests/acceptance-corpus.test.ts` (§15.1 bounds), `tests/forecast.test.ts` /
`forecast-independence.test.ts`, `tests/d12-p2-calibration.test.ts`; `tests/replay.test.ts`
byte-identity holds ONLY if all changes stay engaged-gated (worldgen correlation must not
alter the M0A stream). `tests/d12-economy.test.ts` conservation is unaffected (opening×legs
is conserved regardless of the ceiling).
