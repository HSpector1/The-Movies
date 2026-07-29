# D-12 Micro-Budget Strategy Dominance Audit

**Status:** Accepted. Verdict A — Healthy Alternative Strategy. D-12 approved for merge.
**Type:** Read-only balance audit. No production mechanic, tuning constant, or calibration was changed.
**Harness:** `src/harness/run-microbudget-dominance-audit.ts` (permanent diagnostic).
**Reproduce:** `node_modules/.bin/vite-node src/harness/run-microbudget-dominance-audit.ts [AUDIT1_SEEDS] [CAMPAIGN_SEEDS] [AUDIT5_SEEDS]`
**Numbers below:** 300 seeds (Audit 1 and Audit 2), 200 seeds (Audit 5). All figures are medians unless a band (p10 / median / p90) is given.

The audit answered one question: is repeated micro-budget filmmaking a **dominant strategy**? It is not. Micro-budget is a legitimate low-risk, low-reward, standing-eroding lane that fails the dominance test on cash, risk, Awareness, and Prestige, and carries a large long-term opportunity cost. The owner's profitable test film was a favorable-tail draw, not the norm.

Everything was produced by driving the authoritative engine surface (`generateWorld → beginFounding → signContract → foundStudio → greenlight → tick`). Cash is read from `state.studio.cash` (`== INITIAL_CASH + Σ ledger.amount`); per-film Contribution is Studio Revenue (`Σ weeklyGross × studioShare`) minus **direct commitment** (`negative + marketing`); Standing is read from `state.studio.standing` and is never reset between films in a campaign.

---

## 1. Owner package — "Letters from Vineyard"

Cheapest available script (lowest `baseNegativeCost` concept), Lean Production Budget (negative = 0.75 × required), Small Marketing ($100k), cheapest practical writer / director / cast / craft, coherent accessible brief (ordinary shape, wide-range promise → promise mismatch 0). Direct commitment `= negative + marketing`.

The reconstruction reproduces the owner film's fingerprints across 300 seeds:

| Signal | Reconstruction (median) | Owner film |
|---|---|---|
| Direct commitment | $1.90M | $1.95M |
| Segment Fit (YA / Family / Adult / Prestige) | 70.7 / 74.5 / 82.7 / 74.6 | 74.6 / 79.9 / 82.0 / 72.1 |
| Promise mismatch | 0 | 0 |
| Legs | 2.12 | 2.16 |
| Δ Awareness | −2.7 | −2.9 |
| Δ Prestige | −6.0 (p10 −10) | −9.7 |
| Δ Confidence | +1.1 | +2.6 |
| Brief Coherence / Talent Fit / Execution Confidence | 88 / 37 / 22 | 80 / 42 / ~22 |
| Team Direction (== Delivered Alignment) | 35.6 | 0 (a low-tail draw) |

The harness asserts, on every seed, that the greenlight **Team Direction** equals the delivered `FilmResult.cohesion` — both are the deterministic §5.2 talent-vector cohesion. This holds across all runs.

**Classification: `audienceCoherentMicrobudgetMisfire`.** The package pairs a *coherent brief* (Brief Coherence 88, promise mismatch 0, strong segment fit) with a *misfired execution* (Team Direction 36, Execution Confidence 22, critic 38, negative prestige). It is modestly profitable on average with real downside — not a guaranteed win, and its low-scoring execution is critically, not commercially, punished.

---

## 2. Strategy definitions (Audit 2)

Four deterministic routes, 2 concurrent films, 12-film campaigns, **standing carried forward** (never reset), 300 seeds each. Concept = "script" (chosen by `baseNegativeCost` tier). "Awareness" marketing = $100k when cold, $400k standard, $1M for a warmed studio's commercial film.

| Route | Talent | Script | Shape | Budget (× req.) | Marketing |
|---|---|---|---|---|---|
| **A — Micro-budget Schlock** | cheapest | cheapest | ordinary | 0.75 (Lean) | $100k (Small) |
| **B — Competent Mainstream** | mid | median | ordinary | 1.0 (Adequate) | awareness-appropriate |
| **C — Premium / Ambitious** | strongest | expensive | ordinary | 1.25 (Generous) | $1M (Wide) |
| **D — Reckless Cheap-Demanding** | cheapest | median | demanding | 1.0 | $400k |

---

## 3. Major distributions

### Audit 1 — exact owner package (n = 300)

| Metric | Value |
|---|---|
| Forecast Contribution | downside −$1.45M / expected +$0.53M / upside +$3.14M |
| Realized Contribution | p10 −$0.29M / **median +$1.11M** / p90 +$3.02M |
| Loss probability | **18%** |
| Opening / Gross / Legs | $2.79M / $5.86M / 2.12 |
| Craft / Audience / Critic | 48.9 / 45.1 / 37.8 |
| Recover commitment in opening week | 24% |
| Production duration / profit-per-production-week | 14 wk / +$0.08M |

### Audit 2 — campaigns (median cash multiple; standing at 12 films)

| Route | 4-film | 8-film | **12-film** | <start@12 | reach@12 | Prestige@12 | Aware@12 | loss/film | profit/wk |
|---|---|---|---|---|---|---|---|---|---|
| **A schlock** | 1.00× | 1.11× | **1.29×** (p10 0.46 / p90 2.17) | 38% | 100% | 0.6 | 6.4 | 24% | +$0.10M |
| **B competent** | 0.57× | 0.87× | **1.70×** (p10 0.43 / p90 2.97) | 25% | 68% | 99.9 | 19.5 | 34% | ~$0.00M |
| **C premium** | 0.37× | 0.52× | **1.65×** (p10 0.87 / p90 3.00) | 19% | 37% | 100 | 34.6 | 29% | −$0.30M |
| **D reckless** | 0.20× | 0.23× | **0.72×** | 70% | 9% | 0 | 13.3 | 82% | −$0.64M |

Per-route continuity: schlock ever-negative 0% / drawdown $4.9M / unable-to-continue 0%; competent 8% / $13.6M / 32%; premium 40% / $19.6M / 63%; reckless 12% / $18.8M / 91%.

### Audit 4 — causal gross decomposition (owner package, representative seed)

`opening = baseMarketValue($34.48M) × reachSum(0.0826) × openingReachMult(1.043) × competition(1.0) × economyScale(0.7) = $2.08M`, where `reachSum = Σ share · awarenessFactor(0.317) · (openingAppeal/100)^APPEAL_CURVE_EXP(1.8)`; `legs = LEGS_MIN_ENGAGED(1.2) + (LEGS_MAX − 1.2) · (WAS 45.6/100)^LEGS_RETENTION_EXP(1.4) = 2.13`; `total = opening × legs = $4.43M`; `studioRev = × 0.52 = $2.31M`; `contribution = − $1.79M commitment = +$0.51M`. The reported **awarenessFactor 0.317 matches the owner film's reported 0.32**. No value enters the gross twice (craft → criticMean; starDraw → segmentAppeal; WAS → legs). Lean budget cuts cost ~25% while cutting craft's budget-adequacy term by only ~2 points, so cost falls far faster than delivery, and break-even gross ($3.65M) sits below ordinary opening demand — the structural reason cheap coherent films clear break-even.

### Audit 5 — Team-Direction isolation (n = 182 matched triples; crew OVR held identical)

Crew OVR distribution is statistically identical across all three bands (p10 / median / p90 ≈ 212 / 266 / 305), so directional agreement is the only moving part.

| Team Direction | Opening | Legs | Craft | Audience | **Critic** | **Δ Prestige** |
|---|---|---|---|---|---|---|
| 12 (low) | $5.42M | 2.45 | 69.1 | 56.3 | 46.8 | +1.5 |
| 47 (mid) | $5.64M | 2.46 | 69.8 | 56.7 | 52.9 | +6.6 |
| 72 (high) | $5.26M | 2.42 | 69.2 | 55.5 | **64.5** | **+10.0** |

**Team Direction has no commercial consequence.** Opening, legs, craft, and audience score are flat (non-monotonic, ±4%); only critic score and Industry Prestige rise with it. This is confirmed structurally: in `reception.ts`, cohesion enters only `criticMean` / `criticSigma` / the originality-bonus scaling, never a box-office multiplier, and critic score is not a box-office multiplier. Team Direction 0 is a critical / prestige problem, not a commercial one — which is exactly why the owner's poorly-directed film still made money. This is intended D-6 design (the three standing channels are separated: Awareness = reach, Prestige = critic, Confidence = ROI).

---

## 4. Why high ROI alone is not dominance

Schlock's per-film ROI (44%) is high, but it is computed on a very small commitment (~$1.9M), so absolute per-film profit is thin ($0.84M). Over a 12-film campaign (~58 weeks), fixed payroll and overhead consume most of that margin: the median cash multiple flattens to **1.29×**, and **38% of campaigns end below starting cash**. A high percentage return on a tiny base that barely outruns fixed burn is a *treading-water* outcome, not compounding growth. Dominance is a joint property across cash, risk, and standing — not a single favorable ratio.

---

## 5. Cash / risk / standing comparison (A schlock vs B competent)

- **Cash (12-film):** competent higher — 1.70× vs 1.29× (+31%).
- **Below-start risk (12-film):** competent lower — 25% vs 38%.
- **Per-film loss rate:** schlock lower — 24% vs 34%.
- **Ever cash-negative / drawdown:** schlock 0% / $4.9M vs competent 8% / $13.6M.
- **Continuity (unable-to-continue):** schlock 0% vs competent 32%.
- **Profit / week:** schlock higher on the robust median (+$0.10M vs ~$0.00M).
- **Awareness (12-film):** competent higher — 19.5 vs 6.4.
- **Prestige (12-film):** competent far higher — 99.9 vs 0.6.

Schlock wins profit-velocity, continuity, and drawdown. Competent wins cash, below-start risk, upside (p90 2.97× vs 2.17×), Awareness, and Prestige. Schlock strip-mines standing (Awareness 40 → 6, Prestige 40 → 0); competent builds Prestige to ~100.

---

## 6. Verdict — A: Healthy Alternative Strategy

The dominance bar requires micro-budget to *simultaneously* match or beat competent filmmaking on cash, loss probability, profit/week, Awareness, Prestige, and long-term opportunity. It wins only profit/week, continuity, and drawdown; it loses on cash, below-start risk, Awareness, and Prestige, and carries a large standing opportunity cost. Therefore it **does not dominate**.

Micro-budget is an intended early-game lane offering low capital exposure, modest absolute profit, high percentage ROI on favorable outcomes, a place to develop inexperienced talent, and a path toward eventually financing larger films. It occupies a distinct risk/reward/standing niche; it does not dominate competent or premium filmmaking. A rational player who wants to grow cash, build a brand, or win prestige chooses competent or premium; micro-budget is for surviving a cash squeeze or starting out.

**No tuning change is recommended.** The economy behaves coherently: distinct strategies occupy distinct niches, none dominates, the reckless demanding bet correctly loses, and the owner's profitable micro-budget film is fully explained (favorable ~p85 draw of a coherent-brief package; Team Direction is a prestige signal, not a box-office lever). **D-12 is approved for merge.**

---

## 7. Future watch item (backlog, not a current defect)

### Talent-development farming

Future talent-career work should test whether repeated low-cost productions develop talent too efficiently. A micro-budget farm completes many cheap films quickly; if each film advances its performers' skills at full rate regardless of context, a studio could grind inexpensive projects primarily to level up talent cheaply. When talent-development and aging systems are built, verify that skill growth scales sensibly with, and shows diminishing returns against:

- production difficulty (Production Demand / shape ambition);
- role significance (lead vs supporting vs bit part);
- realized performance / reception, not merely completion;
- Work Ethic and other talent traits;
- repetition (diminishing returns on repeated identical low-stakes work);
- project variety (breadth of concept / genre / shape experience).

This is a backlog concern for a future milestone, not a defect in the current D-12 economy. It is recorded here so it is not lost.
