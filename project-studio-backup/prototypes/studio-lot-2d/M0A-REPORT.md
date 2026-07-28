# M0A Instrumentation Report — Project: Studio

**Milestone:** M0A — the headless proving harness.
**Date:** 2026-07-26.
**Corpus:** 1,000 seeded single-year runs (`m0a-0001` … `m0a-1000`) × 2 agents = **2,000 runs**, 20,000 film releases, 12,000 Oracle greenlight decisions.
**Reproduce:** `npx tsc && node dist/src/harness/run-corpus.js` → writes `out/m0a/{raw-random,raw-oracle}.jsonl` + `summary.json` + `summary.md`. Byte-deterministic: the same seeds always produce the same result.

---

# Revision — M0A.1: D-6 Standing Channel Repair (2026-07-26) — verdict **PASS**

The baseline study (commit `81ee613`, preserved in full below) was BLOCKED on the one hard gate — reputation differentiation. The owner authorized a bounded repair (ruling **D-6**) redefining what the three reputation dials *mean* and driving each from a different cause. This section reports the result; the baseline sections below are unchanged and remain valid.

## Executive verdict (revised): **PASS**

The D-2 standing-differentiation gate — the sole blocker — now **PASSES**, all eight flags are healthy, and the three reputation dials are genuinely independent. The decision engine underneath is unchanged (the repair touched only the §6 reputation formulas). **This is a PASS of the M0A study; it is not, and must not be read as, approval for Phase 5** — that decision remains the owner's after review.

## What D-6 changed (plain English)
- **Audience Awareness = public visibility** → now driven by how widely a film is *seen* (box office relative to the market), plus a smaller star-power effect. (Was: driven by "beat the forecast".)
- **Industry Prestige = artistic respect** → now driven by *critic scores* against a **reachable** benchmark (~45, near the typical score), replacing the old fixed "60" that prestige could never climb to. (Prestige could only sink before.)
- **Commercial Confidence = financial trust** → now driven by *return on investment* and budget discipline — no longer the same "beat the forecast" signal that drove awareness.

The three dials now move on three different causes and **can move in different directions after the same release** (e.g. a huge-grossing money-loser makes the studio *more famous* but *less trusted with money*).

## Before → after
| Metric | Baseline `81ee613` | Revised (D-6) |
|---|---|---|
| **D-2 hard gate** | FAIL (2 of 4 profiles) | **PASS (3 of 4)** |
| A: prestige-high / awareness-low | 0% | **6.75%** ✓ |
| B: awareness-high / prestige-low | 33.5% | **6.95%** ✓ |
| C: confidence-high / prestige-low | 21.0% | **24.1%** ✓ |
| D: confidence-low / awareness-high | 0% | 0% (see note) |
| awareness↔confidence correlation | **0.99** (WARNING) | **0.345 / 0.108** (PASS) |
| end-of-run prestige | max 39.5 — never rises | spans 0–100 (Oracle med 64, Random 37) |

## All eight flags (revised) — all PASS
Choice dominance 0.66%, strategy concentration 0.02%, dead cultural state 0%, **standing differentiation PASS (3/4)**, **standing correlation PASS (max r 0.345, was 0.99)**, forecast calibration 83.2/73.1/62.5, casting diversity 78.6% (Random), authored not-exercised. **No previously-passing diagnostic regressed** — the §14 harness is byte-identical to baseline; only §6 changed, so the seven non-standing flags are computed by identical code over identical film outcomes.

## Candidate formulas, screening & selection
One structural family, dictated by the D-6 semantics (awareness ← reach + star; prestige ← critic-vs-benchmark; confidence ← ROI − discipline). Constants were calibrated to the observed per-release corpus distributions — criticScore median 46.5 → benchmark 45; reach p90 ≈ 0.90 → reach scale; Oracle median ROI ≈ 5 → ROI scale — by a grid sweep maximizing the joint profile occurrence. Selection priority: semantic correctness → D-2 pass → channel independence → no 7-flag regression → simplicity. Iterations used: within the 5-cap (one calibrated family; no structural re-do needed). Exact formulas + all 13 constants are recorded in `docs/rev4-open-questions.md` (ruling D-6) and `TUNING`.

## Behavioral cases — all PASS
The 7 D-6 behavioral case groups + 5 cause-isolation pairs all pass: widely-seen critical flop (awareness ↑, prestige ↓); acclaimed money-loser (prestige ↑, confidence ↓); profitable disciplined sleeper (confidence ↑, modest awareness); huge-gross money-loser (awareness ↑, **confidence ↓**); star-driven flop (awareness ↑ via visibility, prestige ↓, confidence ↓); low-budget prestige success (prestige ↑, awareness materially below a mass hit). Cause-isolation: changing only critic score moves only prestige; only reach moves only awareness; only profitability moves only confidence; only star fame moves awareness (small, secondary); changing only the dormant forecast moves **nothing** (proving the old surprise driver is gone).

## Independent verification of the revision
- **Adversarial review: SOUND — the pass is HONEST.** Split-corpus robustness confirmed (seeds 1–500 → 3/4; seeds 501–1000 → 3/4; even a stricter 62/38 boundary passes); no floor/ceiling saturation; three genuinely independent signals; tests mutation-verified; the flagship "huge-gross money-loser → confidence falls" holds; no agent-specific rules; seven flags unregressed.
- **Contract audit: CLEAN WITH NOTES** — the implementation matches D-6 exactly, touches only §6 + the ephemeral release context (no save-schema change), and the two flagged notes were stale comments (now fixed). Zero value/behavior deviations.

## Note on profile D (confidence-low / awareness-high — still 0%)
Only 3 of 4 profiles are required and A/B/C pass. Profile D stays at 0% for an **honest arithmetic reason**: this game's economy is almost always profitable (only ~1.6% of releases lose money), so confidence rarely falls low enough to co-occur with high awareness. Making D reachable would require redefining confidence as return *above an expected baseline* (financiers rewarding only better-than-expected ROI) — a further product decision beyond D-6, which the D-2 ruling routes to the owner rather than tuning around. **Flagged for your decision; not adopted here.**

## Honest characteristic to know
The two *thin* profiles (A at 6.75%, B at 6.95%) are **agent-segregated**: Random's low-reach slates produce prestige-high/awareness-low, while Oracle's high-reach slates produce awareness-high/prestige-low. This is legitimate — the profiles emerge from real slate-quality differences, not from any agent-specific code — but you should know the two thin profiles appear across the two agents rather than within a single agent's play.

## Preserved disclosures (unchanged by D-6)
Broadcast remains mechanically correct but inert in natural M0A (contract-forced); `technical` remains pinned at 40 (D-4); authored talent remains not-exercised; the Oracle's maximum-marketing tendency (98%) remains a report-only warning and was **not** part of this repair.

---

# Baseline (commit `81ee613`) — the original M0A study, preserved

*The following sections are the original baseline study and its BLOCKED verdict. They are preserved verbatim (the owner directed the baseline result be kept, not erased). They correctly implemented the prior contract and revealed the design problem that D-6 above repairs.*

## 1. Executive verdict (baseline): **BLOCKED**

M0A is **BLOCKED** — the one completion-blocking gate (**standing differentiation**) fails, and it **cannot be fixed within the tuning I am permitted to use**. The fix is a design decision that belongs to you, not a tuning tweak and not a bug.

The important nuance, stated plainly:

- **The study is valid** (independently reviewed and audited; byte-reproducible).
- **The film-decision engine is healthy** — **7 of 8** diagnostics pass, and every acceptance test except the differentiation gate passes.
- M0A is BLOCKED **specifically** because the three-channel **reputation** system, as the contract specifies it, collapses into effectively **two** independent dimensions — so it cannot produce the four distinct reputation "personalities" the gate demands.

**In one sentence:** the film-assembly *decisions* are meaningful and varied — M0A's core question is answered **yes** — but the *reputation model* is under-differentiated, and that is a §5/§6 formula matter outside the tuning surface, so it is your call.

---

## 2. What was tested (and why it matters to whether the game will be fun)

The harness generated a fresh, reproducible "world" from each of 1,000 seeds (60 industry people, 30 film concepts, four audience segments, a studio) and played out a full simulated year (52 weeks) twice per seed — once driven by a **Random** agent (picks films at random: proves the whole decision space is reachable and nothing breaks) and once by an **Oracle** agent (always picks the most profitable film it can foresee: reveals whether one strategy dominates). Each year produces ~10 film releases; the harness recorded, for every release, how it was received, how critics scored it, how each audience segment responded, its box office, and how the studio's cash and three reputation dials moved.

Over that corpus it computed **eight diagnostic flags**. The flags exist to answer the M0A question — *do the film-assembly maths produce real, varied decisions, or is one strategy always best?* — because a game where every optimal choice is the same, or where reputations never differentiate, is not fun to play. Seven flags say the decision space is healthy. The eighth (the only hard gate) says the reputation dials do not differentiate enough.

---

## 3. The eight diagnostic flags

### Flag 1 — Choice dominance — **PASS**
- **Purpose:** does one film "strategy" win almost every decision by a wide margin? (If so, there is no real choice.)
- **Definition (B25):** a strategy signature = (story-shape triple, budget level, marketing level, promise-direction signs). Flag if one signature wins **> 60%** of Oracle decisions **and** by a margin **> 15 ROI points**.
- **Measured:** the leading signature won **0.65%** of the 12,000 decisions. Nowhere near dominant.
- **Meaning:** the Oracle's optimal pick genuinely varies with the situation — there is real strategic variety.
- **Disclosure:** the flag is deliberately fine-grained. At a *coarser* grain the Oracle does show single-axis preferences — it picks the **maximum marketing budget 98%** of the time and a **bittersweet ending 53%** of the time, and it avoids slow-setup openings. This is faithful behavior (these are report lines you adjudicate, not a hard fail), but worth knowing: the Oracle has strong single-lever habits even though its *whole-package* choices are varied.

### Flag 2 — Strategy concentration — **PASS**
- **Purpose:** do most films end up looking the same (same promise, budget, and top cast)?
- **Definition (B26):** flag if **> 70%** of Oracle films share all three of (promise-direction signs, budget-level pair, top-forecast cast triple).
- **Measured:** the most common identical combination covered **0.02%** of films.
- **Meaning:** films are highly varied in construction; no monoculture.

### Flag 3 — Dead cultural state — **PASS**
- **Purpose:** is the world ever "dead" — no profitable film available at all?
- **Definition (B27):** per run, sample 500 candidate films at the start; the run is "dead" if none can turn a profit. Flag if **> 50%** of runs are dead.
- **Measured:** **0 of 1,000** runs were dead.
- **Meaning:** there is always a viable, profitable film to make — the economy is not degenerate.

### Flag 4 — Standing differentiation — **FAIL (this is the only completion-blocking gate)**
- **Purpose:** do different play patterns produce genuinely different studio "reputation personalities"? This is the heart of M0A.
- **Definition (D-2):** at year end, a reputation channel is "high" if ≥ 60 and "low" if ≤ 40. Four asymmetric personalities must appear, each in **≥ 5%** of runs (pooled across both agents): **(A)** prestige-high / awareness-low; **(B)** awareness-high / prestige-low; **(C)** confidence-high / prestige-low; **(D)** confidence-low / awareness-high. **HARD FAIL if fewer than 3 of the 4 appear.**
- **Measured (pooled over 2,000 runs):** (A) **0%**, (B) **33.5%**, (C) **21.0%**, (D) **0%** → **only 2 of 4** reach the 5% floor. **HARD FAIL.**
- **Reproduction seeds:** `m0a-0001` shows profiles B and C; profiles A and D never occur in any seed.
- **Meaning (why it fails — two structural reasons):**
  1. **Prestige is effectively a broken dial: it almost always sinks.** Prestige only rises when a film's critic score beats the fixed "60" line, but critic scores across the whole corpus sit well below that (only **6.4%** of releases score above 60; the average prestige change per release is **−1.7**). Across all 2,000 runs the **highest** year-end prestige was **39.5** — it never even climbs back to its starting value of 40. So no run is ever "prestige-high," which zeroes out profiles A and (by definition) any personality needing high prestige.
  2. **Awareness and confidence are one dial wearing two hats.** They move together **98% of the time** (r ≈ 0.98) because both are driven by the same signal — "did box office beat the forecast." A personality that needs them to point in *opposite* directions (profile D) therefore never occurs.
- **Why tuning cannot fix it:** the knobs that would fix this — how strongly a critic score moves prestige (the "60" anchor and the divisor), and how differently awareness vs confidence react — are written directly into the core §5/§6 formulas, which the contract's tuning authority explicitly may **not** change. I attempted the authorized tuning anyway (see §5); even a maximally aggressive, contract-legal lift of the critic pipeline moved "prestige reaches high" only from 0% to **0.75%** of runs (still under the 5% floor) and left profiles A and D at 0. This is exactly the "arithmetic-not-design" case the contract's own D-2 ruling anticipated and routed to the owner.

### Flag 5 — Standing correlation — **WARNING** (report-only, not blocking)
- **Purpose:** do the three reputation dials move on genuinely different causes?
- **Definition (M6):** warn if any pair of per-release changes correlates above **|r| > 0.9**.
- **Measured:** awareness ↔ confidence **r ≈ 0.99** (both agents); awareness ↔ prestige and prestige ↔ confidence ≈ 0.
- **Meaning:** this is the same finding as the gate above, seen from another angle — awareness and confidence are near-redundant. It is a warning by contract, but it is the direct cause of one of the two missing personalities.

### Flag 6 — Forecast calibration — **PASS**
- **Purpose:** are the studio's forecasts honest — does a "high-confidence" forecast actually land where it predicts?
- **Definition (M8):** the realized segment score should fall inside the forecast band; coverage should be **80–90%** for high confidence, **65–75%** medium, **55–65%** low.
- **Measured:** high **83.1%**, medium **73.0%**, low **62.5%** — all three inside their target bands, no under-sampled tiers.
- **Meaning:** the forecasting system is well-calibrated and trustworthy — a real asset for a game about predicting outcomes.

### Flag 7 — Casting diversity — **PASS**
- **Purpose:** does the studio actually use its talent pool, or cast the same few actors?
- **Definition (M17):** flag if the median Random-agent run casts **< 25%** of the 28-actor pool.
- **Measured:** Random median **78.6%** (Oracle **64.3%** for contrast).
- **Meaning:** casting draws broadly on the talent pool — no degenerate "always cast the same star" behavior.

### Flag 8 — Authored-talent effect — **PASS (not exercised)**
- **Purpose:** do player-created stars unbalance the game?
- **Definition:** by design, the headless agents never create talent, so this is reported as **not exercised** (0 appearances). The create-talent path is built and unit-tested; it simply isn't invoked in the headless study.

---

## 4. Acceptance tests (§15)

| Test | Result |
|---|---|
| **§15.1 Bounds** — every measured quantity stays in its stated range across all 20,000 releases | **PASS** (craft 26.3–83.6, cohesion 0–0.905, critic 3.3–85.6, etc., all in range) |
| **§15.2 Four quadrants** — coherent+strong, incoherent+strong, coherent+dull, incoherent+dull are all producible and distinguishable; and at least one released film lands in each quadrant across the corpus | **PASS** (unit recipes disjoint and distinguishable; all four corpus cells non-empty: 2,596 / 14,699 / 403 / 2,302) |
| **§15.3 Neutral stacking**, **§15.4 Promise ordering**, **§15.5 Slot transform**, **§15.6 Forecast independence** (from earlier phases) | **PASS** (still green) |
| **§15.7 Replay** — same seed + same actions → byte-identical state **and** broadcast copy | **PASS** (byte-identical full-year save, both agents; broadcast copy empty and identical — see §7) |
| **Forecast calibration** (Flag 6) | **PASS** |
| **Standing differentiation** (Flag 4) | **FAIL** — the blocking gate |
| **Casting diversity** (Flag 7) | **PASS** |

The uniform+dull quadrant exists and is distinct (craft ≈ 39.7, cohesion ≥ 0.75), so **cohesion is not swallowing craft** — the §15.2 diagnostic the contract worried about is clear.

---

## 5. Confidence-tier distribution

| Confidence tier | Forecasts | Share | Calibration coverage | Low sample? |
|---|---|---|---|---|
| High | 14,524 | 18.16% | 83.1% (target 80–90) ✓ | no |
| Medium | 29,364 | 36.71% | 73.0% (target 65–75) ✓ | no |
| Low | 36,112 | 45.14% | 62.5% (target 55–65) ✓ | no |
| **Total** | **80,000** | | | |

Every tier holds a healthy share (none under 5%), so no calibration figure is noise. All three tiers are calibrated inside their bands.

---

## 6. Tuning history

The tuning authority may change only the `TUNING` object; the §5/§6 formulas, flag thresholds, and §15 bounds are fixed. All corpus figures are full 1,000-seed × 2-agent runs. **Nothing was retained — all iterations were reverted to the contract defaults**, because none reached the gate and the true cause is outside the tuning surface.

| Iter | Hypothesis | Constants changed | D-2 result (A / B / C / D) | Prestige reaches ≥60 | Retained? |
|---|---|---|---|---|---|
| 0 (baseline) | — | contract defaults | 0% / 33.5% / 21.0% / 0% → **2/4 FAIL** | 0.00% | — (default) |
| 1 | Prestige is starved because cohesion's contribution is suppressed at typical cohesion; lift the critic pipeline | `COHESION_CAP` 16→24, `COHESION_SMOOTH_LO` 0.35→0.15 | 0% / 32.6% / 20.5% / 0% → **2/4 FAIL** | ~0% | **reverted** |
| 2 | Maximally aggressive prestige lift, to establish the ceiling | `COHESION_CAP` 16→40, `COHESION_SMOOTH_LO` 0.35→0.05, `ORIGINALITY_MAX_BONUS` 12→24 | 0% / 12.2% / 8.2% / 0% → **2/4 FAIL** | **0.75%** | **reverted** |

**What the tuning proved:** even the maximum contract-legal lift of critic scores raises "prestige reaches high" only to 0.75% (still under 5%), never unblocks profile A (the runs that do reach high prestige also have high awareness, so "prestige-high / awareness-low" still never occurs), never touches profile D (awareness/confidence stay correlated), and actually *shrinks* the two passing profiles. **The gate is unreachable through tuning.** The real levers — the §6 prestige anchor (60), the prestige divisor (8), and the awareness/confidence coefficients (6, 5, 2, 2) — are formula constants the tuning authority may not change. Cause = **math (fixed §5/§6 formulas), i.e. an unreachable threshold given the ruleset as written.**

---

## 7. Broadcast (headlines) — disclosed finding

> **Broadcast is mechanically implemented and replay-safe but inert under the current M0A outcome model. Natural corpus runs produce zero release headlines because the contracted surprise comparison has no audience-outcome variance. Template and threshold behavior were validated using constructed contract-valid fixtures.**

Detail: the contract measures a headline's "surprise" by comparing a film's realized audience reception against the noise-free forecast center (rule B24). But audience reception in this ruleset has no random component and is standing-independent, so it equals that forecast center **exactly** — surprise is always zero — and no headline clears the airing threshold. Across all 20,000 releases, **zero headlines aired.** This is a contract-forced consequence, not a defect; the `release-better`/`release-worse` ranking, threshold, ordering, and templates are proven correct by constructed unit fixtures that supply qualifying inputs.

This is recorded as a **future product-design decision, not technical debt** (see `docs/HANDOFF.md`). Before full broadcast presentation is built, the owner must decide whether later gameplay should (1) introduce genuine outcome variance, (2) define surprise relative to the studio's published (noisy) forecast, or (3) use another explicitly designed source of unexpected outcomes. **Adding a human player alone does not resolve this — a later mechanic or contract ruling is required.**

---

## 8. Required D-4 caveat (verbatim)

> technical is pinned at 40 in every M0A run, so craft's 15% technical weight is untested and the remaining four weights (script/director/cast/budget) are effectively validated at rescaled proportions (0.30/0.25/0.20/0.10 of a 0.85 active mass). Craft weights will need re-validation when craft hiring arrives in M1A.

---

## 9. Recommendation

**The film-decision engine is ready to be experienced; the reputation model is not.** The decision loop — concept → shape → promise → cast → budget → release → outcome — produces varied, non-dominated, well-forecast choices. That is the part of M0A the core question is about, and it is healthy.

But the reputation system, as specified, would display poorly in a UI: one dial (prestige) that only ever sinks, and two dials (awareness, confidence) that move as one. Building a thin UI over those numbers now would mean rebuilding it once the reputation model is revised — exactly the waste the phase-5 gate exists to prevent.

**I recommend NOT authorizing Phase 5 yet.** The next decision is yours and is a reputation-model decision, in plain terms:

1. **Revise the §6 reputation formulas** so the three channels differentiate — e.g. lower the prestige "60" anchor or raise its sensitivity so prestige can climb, and give confidence a different driver from awareness so they can diverge — then re-run this exact study to confirm the gate passes. *(This is a deliberate contract change to audited §5/§6 math; it is the "right" fix if reputation differentiation matters to the game, and it is the path I'd recommend if the answer is "yes, reputation should be a real, multi-dimensional system.")*
2. **Relax the differentiation gate by an explicit owner ruling** — e.g. accept 2 of 4 profiles, lower the 5% floor, or lengthen the run — which would flip the verdict without a formula change. *(This must be your ruling; I will not soften a contract threshold on my own.)*
3. **Accept M0A as BLOCKED-on-reputation for now**, ship the validated decision engine as-is, and defer the reputation revision.

My suggested path: **Option 1** — the decision engine has earned a real reputation system to sit on top of it, and revising §6 is the honest way to get there. Whichever you choose, the decision engine underneath is proven and does not need to change.

---

*Prepared by the PM/orchestrator from independent Opus-role implementation, contract-derived testing, one focused adversarial review, and one full contract audit. All figures are reproducible from the seeds above. Phase 5 has not begun.*
