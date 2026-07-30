# Capital Frontier Correction — before/after (300 seeds)

Owner directive 2026-07-30 (audit verdict D). Three engaged-only causal levers; M0A
byte-identical. "Before" = audit on main `6210906`; "after" = fix branch
`economy-capital-frontier-fix` (300 seeds, `run-capital-risk-reward-audit.ts`).

## Script-tier isolation (matched mid talent)

| cell (neg1.0/mkt1M) | metric | before | after |
|---|---|---|---|
| cheapest | Contribution | +$4.22M | +$2.40M |
| cheapest | ROI / loss | 126% / 6% | 61% / 18% |
| cheapest | p90 | ~$9M | $6.07M |
| expensive | Contribution | −$1.09M | **+$1.20M** |
| expensive | ROI / loss | −12% / 60% | **14% / 40%** |
| expensive | p10 / p90 | −$5.2M / — | **−$3.50M / $7.53M** |
| expensive | gross vs cheapest | flat (~$15M each) | **$17.69M vs $12.43M** |

Before: script price was pure cost (flat gross, contribution collapses). After: a premium
script tends to higher `baselineStrength` → higher craft/WAS/gross when funded+delivered
(gross $17.69M vs $12.43M), with a **higher p90 ($7.53M > cheap $6.07M)** and a **larger
loss tail** (p10 −$3.50M, loss 40%) — a rational high-risk/high-reward play. Cheap keeps
the ROI/safety crown (61% ROI, 18% loss).

## Discoverability (unknown cast × Small marketing)

| | before | after |
|---|---|---|
| P(opening < $1M) | 0% | 1% |
| P(opening < $2M) | 17% | **31%** |
| opening floor (p10) | ~$1.9M | $1.48M |
| sleeper (star-driven) | 46% | 48% (preserved) |
| good-film-obscure | 0% | 0% |

Meaningful obscurity risk restored (P<$2M 17%→31%) while star power, marketing, and
post-weak-opening word of mouth still work; sleepers preserved.

## Marketing value (matched film)

Small→Standard is the big jump; Standard→Large now adds reach for high-potential funded
films (premium expensive neg1.0: mkt$0.40M open $5.53M → mkt$1M open $6.66M, contrib
+$0.14M → +$1.20M) and remains wasteful for limited films (low appeal + overexposure).

## Owner six-film reconstruction

| film | before contrib / ROI | after contrib / ROI |
|---|---|---|
| 1 (cheapest) | +$3.43M / 177% | +$1.85M / 82% |
| 3 (median) | +$2.81M / 52% | +$1.74M / 34% |
| 6 (expensive max) | +$1.19M / 11% | **+$3.83M / 38%** |

After: the later larger films earn a **greater absolute** contribution (+$3.83M vs the
cheap +$1.85M) with a **greater ceiling and exposure** ($9.67M commitment) but **lower
ROI** — no guarantee of out-ROI-ing the cheap films. Awareness no longer collapses.

## Repeated strategies (talent-conflated; capital frontier is cleaner in the factorial)

| strategy | profit/film | ROI | loss | drawdown |
|---|---|---|---|---|
| A cheap coherent (cheapest talent) | −$0.49M | −21% | 67% | $13.2M |
| B mid-budget | +$0.49M | 9% | 42% | $17.5M |
| C premium rational (best talent) | +$2.98M | 37% | 18% | $18.5M |
| D maximum spend | +$3.74M | 38% | 19% | $19.9M |
| E cheap incoherent | −$1.31M | −44% | 92% | $19.0M |

The strategy campaigns conflate the TALENT axis with capital. The clean **capital** frontier
is the matched factorial above (cheap = ROI/safety king; premium funded = ceiling/risk
king; no region best in all axes). E (incoherent) correctly loses. Strategy A's marginality
is the cheapest-TALENT + no-marketing corner (the intended obscurity risk), NOT a capital
defect — the factorial cheap SCRIPT (matched mid talent) is highly profitable (ROI 61%,
loss 18%).

## Residuals (honest)
- Premium p90 ($7.53M mid-talent) is a touch below the aspirational $8–10M, but clearly
  exceeds cheap and rises with best talent (strategy C).
- P(open<$1M) is ~1% (target 15–25%); P(<$2M)=31% carries the meaningful obscurity risk
  (lowering the floor further crushed all films — a global-reach lever, avoided).
- Calibration targeted the matched FACTORIAL (not the single owner run) to avoid overfitting.

## Constants (engaged-only)
`SCRIPT_COST_POTENTIAL_CORRELATION 0.4`, `SCRIPT_POTENTIAL_APPEAL_COEF 22`,
`SCRIPT_POTENTIAL_REF 60`, `ORGANIC_AWARENESS_FLOOR_WEIGHT 0.52` (M0A 0.6),
`MARKETING_AWARENESS_EXP 2.0→1.3`. Production budget constants unchanged (Phase 4).
