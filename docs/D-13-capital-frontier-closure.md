# D-13 — Capital Frontier and Discoverability Closure

Owner-approved closure record for the capital-intensity, script-potential, marketing-value,
and opening-discoverability corrections.

- Approved source branch: `economy-capital-frontier-fix`
- Approved implementation HEAD (pre-closure): `91a84be`
- Main baseline at approval: `6210906`
- Read-only audit branch: `economy-capital-risk-reward-audit @ 6ebd8f9`
- Milestone designation: **D-13 — CAPITAL FRONTIER AND DISCOVERABILITY CLOSURE**

## 1. Original owner finding

- Low-cost films had both the highest ROI and the highest absolute Contribution.
- Expensive scripts and maximum Marketing lacked enough marginal value to justify the
  additional capital: spending up did not buy a commensurate ceiling or a distinct role.

## 2. Audit diagnosis

The read-only capital risk/reward audit (branch `economy-capital-risk-reward-audit @ 6ebd8f9`)
found:

- Script price was commercially inert: paying more for a script bought no reliable
  commercial opportunity.
- Marketing saturated too early: the marginal reach from a larger campaign flattened
  before it justified the spend.
- Production Budget was already broadly healthy: the underfunding / adequate / overfunding
  relationship worked and did not need a retune.
- Opening reach lacked sufficient downside uncertainty: `computeBoxOffice` was fully
  deterministic, so genuinely unsupported packages could not land in the obscurity tail.

## 3. Approved causal corrections

1. **Imperfect script-cost / potential correlation** — a more expensive script is more
   likely, but not guaranteed, to carry higher commercial potential.
2. **Delivery-gated script-potential commercial opportunity** — that potential converts to
   appeal only when the film is actually well executed; a squandered good script does not
   pay off.
3. **Conditional opening discoverability** — a governed opening-reach multiplier whose
   downside widens only for packages that lack reach support (awareness + marketing + star),
   leaving supported films unchanged.
4. **Restored selective value from larger Marketing** — a larger campaign meaningfully
   reduces obscurity for otherwise unsupported films.
5. **No broad Production Budget retune** — the budget adequacy relationship was left intact
   by decision.

## 4. Final accepted distributions

Confirmed over 1000 factorial / 300 campaign seeds
(`src/harness/run-capital-risk-reward-audit.ts 1000 300`):

- Unknown cast + Small Marketing:
  - P(opening < $1M): approximately **17%** (owner target 15-25%);
  - P(opening < $2M): approximately **38%** (owner target 35-50%).
- Good-film obscure rate: **nonzero** (approximately 1% for unknown + Small), decaying to 0%
  as reach support rises.
- Supported cheap film retains a **positive median Contribution**.
- Premium funded package (neg x 1.0 / mkt $1.00M) p90 approximately **$7.59M**.
- Premium retains approximately **40% single-film loss risk** in the matched package.
- Owner film 1 (cheapest, neg x 0.75 / mkt $0.10M): approximately **+$1.72M / 75% ROI**.
- Owner film 6 (expensive, neg x 1.25 / mkt $1.00M): approximately **+$3.87M / 40% ROI**.

## 5. Strategic owner intent (accepted)

- Microbudget wins on survival, ROI, and development opportunity.
- Mid-budget provides balanced growth.
- Premium wins on absolute ceiling and transformational upside.
- Unsupported films can disappear.
- Spending cannot rescue inadequate demand or execution automatically.
- No single capital strategy dominates every relevant measure.

## 6. Prohibited fixes confirmed avoided

The closure was reached without any of the following:

- No flat microbudget penalty.
- No direct script-price box-office multiplier.
- No guaranteed blockbuster bonus.
- No critic-score box-office multiplier.
- No Prestige or Confidence gross multiplier.
- No global gross reduction.
- No save-schema change (SaveFileV4/V3 unchanged).
- No Gate D modification.

The only realized-variance lever added is an isolated, engaged-only, versioned derived RNG
stream (`'discovery-v1'`) that never advances `state.rngState`, so M0A byte-identity and
§15.7 deterministic replay are preserved.

## 7. Retained watch item

Continue monitoring the balance between talent-development farming and cheap-film production
during the future talent-career milestone. Microbudget films are intentionally the survival
and development engine; if a later milestone makes talent development free or frictionless,
revisit whether cheap production remains appropriately bounded.
