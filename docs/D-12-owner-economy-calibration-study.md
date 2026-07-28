# D-12 Owner Economy Calibration Study

**Status:** STUDY ONLY — no production tuning changed, nothing committed. Awaiting owner ruling.
**Branch:** `phase-5.2-economy` · **Phase A commit:** `b09e1ea` (owner UX closure, already committed).
**Evidence classes:** `[H]` owner human playtest · `[I]` integrated real-engine harness · `[S]` structural harness · `[R]` historical/source research · `[D]` diagnostic override · `[P]` proposed production change.
**Raw outputs:** `out/d12-owner-economy-calibration/{owner-routes,marketing-study,budget-study,payroll-overhead,sensitivity-matrix}.json` + `console-digest.txt`.
**Harness:** `src/harness/run-owner-calibration-study.ts` (150-seed default; report figures from a 120-seed run). Reproduces the owner route on the authoritative core surface (`generateWorld → beginFounding → signContract → foundStudio → greenlight → tick`) and decomposes every cash flow from the **ledger** (`cash === INITIAL_CASH + Σ ledger.amount`). Diagnostic levers mutate TUNING/market **in-process only** and restore.

---

## 1. Executive diagnosis

The owner's human verdict — *"money was not a meaningful constraint"* `[H]` — **reproduces on the real engine** `[I]` and has a single dominant cause.

A **competent small studio makes ~2.4–2.5× its starting cash in just four films** (p90 ~3.9–4.0×), because a **routine film returns 110–165% of its own direct cost as Film Contribution** while **losing money only 3–9% of the time.** Operating costs are trivial: a full year of payroll + overhead is worth **≈ one film's contribution.** Nothing about hiring the best talent, maximizing marketing, or choosing expensive tiers forces a real trade-off.

The one lever that materially moves both the four-film cash multiple and the loss rate is **base opening/gross scale.** Salary ×2, overhead ×3, and lower starting cash do **not** fix it (the last makes the ratio *worse*). Studio share is a minor secondary lever.

> **Bottom line: D-12 must not merge unchanged. The correct primary correction is to lower routine opening/gross scale (~0.60–0.70×), not to raise operating costs or cut starting cash.** Because maximum Marketing is currently *universally* optimal, the recommended package pairs the gross correction with an **awareness-conditioned marketing curve.**

---

## 2. Source benchmark — The Movies (2005, Lionhead) `[R]`

Full research in the appendix of `out/…/console-digest.txt` notes; summary here (A = explicit source fact, B = source-supported inference, C = design recommendation, D = unsupported/contradicted). **The IGN wiki was inaccessible and contributed nothing** (fetch failed; not inferred). Sources: official manual PDF (qualitative only, zero dollar figures), GameFAQs guides via SuperCheats/Neoseeker mirrors, Fandom wiki price snippets, gamepressure guide.

- **Starting cash: undocumented `[D]`.** No accessed source states a number; the manual only offers a Sandbox "shoestring vs. pile of cash" toggle. **Not inferred.** A modern sim must define starting capital as a named `TUNING` constant.
- **Compulsory startup facilities `[A]`:** Stage School $5k, Casting $5k, Crew $4k, Production Office $12k, Basic Script Office $6k, + ≥1 set. Minimum viable "make one film" bundle ≈ **$32k `[B]`** (summation, order-of-magnitude only). Payroll (builders/janitors) runs **before** any film exists.
- **Sets `[A]`:** a wide, deliberately irregular price band ($2k comedy stage → $117k urban street; repeating-digit "texture" like $55,555). Reusable durable capital that amortizes across films `[B]`.
- **Movie income arrives OVER TIME `[A]`:** a pulsing-$ decaying revenue stream you eventually "archive," never a lump sum. Exact rate/curve undocumented `[D]` — not fabricated. **This matches our D-12 six-week weekly-payout run.**
- **Nine progression ranks `[A]`** gate on **multiple axes at once** — films released, *career earnings* AND *current bank balance*, star ratings, awards (e.g. Cert 5 wants $7M earned **and** $4M on hand). You cannot spend your way up or hoard past the volume gates `[B]`.
- **Marketing must fit AWARENESS and scale `[A]`:** "match the marketing budget to the quality rating and total filming costs"; over-marketing a low-awareness film **hurts reviews and wastes money** — a matched optimum, *not* "more is better." (Directly relevant to our max-marketing dominance below.)
- **Salaries ratchet with fame `[A]`** (stars demand more as they and the studio grow; can walk off with your investment) — a recurring, escalating operating treadmill `[B]`.
- **Two teams = throughput AND carrying cost `[A/B]`** (taught explicitly; duplicated stars/sets/crew/wages inferred as the cost). Small-films-as-cash-flow is **only implicit** `[C/D]` — mechanically enabled, never advised by a source.

**Controlling lessons the original embodies (and D-12 should preserve):** meaningful founding capital; constrained early liquidity (debt allowed but soft-locks expansion); first films *establish* rather than instantly enrich; income over time; stronger films/talent create upside; **marketing matched to awareness**; growth requires reinvestment; multiple teams add throughput *and* carrying cost; long-term success keeps money relevant (top ranks demand $20–35M). **Do NOT use missing facilities as an excuse for excessive film profitability.**

**Three conceptual layers** (implement only Layer 2 + 3 in D-12; Layer 1 is future):
1. **Capital expenditure** — facilities (tiered ladders), sets (durable/amortizing), lot/prestige. *(future)*
2. **Direct film economics** — negative + marketing + attributable salary; box office as a time-distributed decaying stream. *(D-12 ✓)*
3. **Recurring studio operations** — payroll, overhead, maintenance; two-team scaling multiplies both throughput and this overhead. *(D-12 ✓ payroll + overhead)*

---

## 3. Gemini proposal audit `[R]` (claims classified; the actual proposal doc was not provided — the enumerated claims are audited on their merits and against §2 + our engine)

Classes: A explicitly supported · B plausible inference · C design inspiration · D unsupported/contradicted · **E technically defective.**

| Claim | Class | Note |
|---|---|---|
| 1920s start $100,000 / modern $5,000,000 / infinite sandbox | **D** | No source documents 1920s starting cash (§2). Specific figures are invented; do not adopt. |
| Universal `EraMultiplier` (1920=1× / 1980=5× / 2026=20×) | **E / D** | A single global revenue scalar is mechanically a runaway knob and historically indefensible (box-office scale ≠ a clean linear inflation multiple). Eras are also a **project non-goal**. Reject/defer. |
| Facility prices (Stage School $5k, Casting $5k, Crew $4k, Basic Script $10k, Adv Script $50k, Production $6k, Post $39k, Publicity $45k, Lab $25k, amenities $3k–$30k) | **A (partial) / B** | Several match §2 within rounding (Stage School/Casting/Crew). Others (Basic Script $10k vs source $6k; Production $6k vs source $12k) are **contradicted or reordered** — treat the *ladder shape* as inspiration `[C]`, not the numbers. **Facilities are a non-goal in D-12.** |
| Three set tiers $10k/$25k/$75k + $500/mo maintenance | **C** | Reasonable *shape* but the source set band is far wider/irregular (§2). Sets + maintenance are future Layer-1; defer. |
| Monthly staff-salary table; script acquisition $2k/$15k/$50k; **$1,500/scene** shooting cost | **C / D** | Per-scene cost implies a scene-composition system (non-goal). Defer. |
| Five-factor quality formula | **C** | Overlaps our existing craft/cohesion pipeline; no need to import. |
| **Linear marketing / Fame hype** | **E** | A *linear* marketing term makes **maximum marketing universally optimal** by construction — the exact failure our own study finds even with a *saturating* curve (§9). Reject; use an awareness-conditioned saturating curve instead. |
| **Q² total-revenue equation** | **E** | Squaring quality creates **runaway multiplicative scaling** (a strong film's revenue explodes). Dangerous; our additive/segment model is safer. Reject. |
| Proposed flop/avg/hit/blockbuster financial table | **C** | Useful as a *target distribution* to calibrate toward (see §11), not as an implementation. |
| Fixed **four-week** run, weekly split **45/25/18/12** | **B / A-adjacent** | The split sums to 100% and *conserves* the locked gross **iff** legs don't rescale the schedule. Our engine already uses a **six-week** conserved schedule — keep ours. |
| **"Legs modification without schedule renormalization"** | **E** | Modifying legs without renormalizing the weekly split **breaks gross conservation** (double-counts). Our schedule renormalizes; do not adopt this. |
| Residuals / era residual multipliers / 3-month gap / 0.88 decay / cult-classic growing residuals / VHS-DVD-streaming / worked lifetime example | **D / defer** | Residual/catalog markets are a **future milestone / non-goal**; the "worked example" cannot be reconciled without the source doc. Explicitly **reject/defer** for D-12. |

**Technical tests performed:** (a) *conservation* — our theatrical schedule conserves (`Σ weeklyGross === opening×legs`, verified by the D-12 beta test suite); a 45/25/18/12 split conserves only if legs don't rescale it. (b) *linear marketing → universal max* — **confirmed defective**; our study (§9) shows even a *saturating* Hill curve already makes max marketing dominate, so a linear term is strictly worse. (c) *Q² runaway* — squaring is multiplicatively unstable; rejected. (d) *universal EraMultiplier* — a global scalar is exactly the kind of single-lever runaway we are trying to remove; rejected. **No Gemini number or formula is adopted merely because it is detailed.**

Retained *principles* (supported): startup capital matters; facilities/sets consume capital; salaries recur; revenue arrives over time; hits fund expansion; later catalog markets *may* exist in a future milestone.

---

## 4. Owner-route reproduction `[I]` (120 seeds, real engine)

Four routes staffed by **selection from each seed's real deterministic applicant pool**, run until **four films' theatrical runs complete**. Film Contribution = full-run Studio Revenue (blended share × gross) − direct film cost (negative + marketing); payroll/overhead are recurring, not allocated to films (per the owner's contribution definition).

| Route | 4-film cash multiple (p10 / med / p90) | Contribution/film (median) | % of commitment | Loss/film | ≥1 loss in 4 | end<start |
|---|---|---|---|---|---|---|
| **A** competent, aggressive | 0.96 / **2.45** / 3.96× | $7.85M | 117% | 8% | 19% | 11% |
| **B** competent, restrained | 1.05 / **2.35** / 3.78× | $8.22M | 164% | 3% | 8% | 7% |
| **C** star-heavy | 0.96 / **2.46** / 4.00× | $7.77M | 114% | 9% | 20% | 11% |
| **D** bargain (stress, not representative) | 0.66 / **1.21** / 1.85× | $1.74M | 49% | 23% | 41% | 30% |

**Reading:** every *competent* route (A/B/C) roughly **2.4–2.5× in four films**, with contribution **exceeding the film's own cost**, near-zero insolvency, and only a modest loss rate. The owner's 3–4× is the **p90 (lucky) outcome** and/or the result of making more than four films — the engine reaches it routinely by film 5–6. Bargain-basement (D) is the only route where money bites (1.2× median, 23% loss/film) — confirming it is a *stress case*, not the representative small studio.

---

## 5. Four-film cash trajectories `[I]`

Competent median final cash after four films ≈ **$47–49M** from a $20M start. p10 hovers ≈ **1.0×** (a competent studio rarely ends *below* start), p90 ≈ **3.8–4.0×**. The distribution is **too high and too tight**: the floor barely dips under starting cash and the typical outcome is a 2.4× windfall. Target shape (§11) wants the median near 1.0–1.6× and a real left tail.

---

## 6. Per-film ROI distribution `[I]`

Contribution as a fraction of commitment: competent median **114–164%**; bargain **49%**. In plain terms, **the median competent film earns more than it costs** — a $5M film typically grosses enough that (0.52 × gross) − $5M ≈ **+$8M**, i.e. gross ≈ $25M ≈ **5× its negative**. A 5× hit is the *typical* film, not the exceptional one. That inversion (median = hit) is the core defect.

---

## 7. Loss frequency `[I]`

Per-film loss probability: A 8%, B 3%, C 9%, D 23%. Probability of ≥1 loss across four competent films: 8–20%. Probability of ending below starting cash: 7–11% (competent), 30% (bargain). Probability of ending below $5M or crossing negative: ~0% competent. **Downside almost never crosses zero for a competent studio** — there is no risk to manage.

---

## 8. Forecast-risk findings `[I]`

The forecast band is honest (the persisted greenlight snapshot equals what the player approves — fixed in the beta closure). The problem is **not** forecast optimism or band width; it is that the **realized mean is too high.** Loss occurs only in the deep left tail. **Per the directive, correct the mean before touching variance** — widening randomness here would only mask an over-profitable center.

---

## 9. Marketing study `[I]` (awareness-conditioned)

Same competent package, marketing ∈ {$100k, $400k, $1M} × awareness {fresh, after 3 releases}:

| Awareness | $100k | $400k | $1M | profit-max |
|---|---|---|---|---|
| fresh | $3.28M (9% loss) | $6.17M (3%) | **$7.94M (0%)** | **$1M** |
| after 3 films | $4.36M (9%) | $7.57M (1%) | **$9.17M (0%)** | **$1M** |

Marginal contribution per marketing dollar is **positive but diminishing** (fresh 9.6× → 3.0×; warm 10.7× → 2.7×). **Maximum marketing is universally optimal** at every awareness level — confirming the owner's impression and the earlier beta signal. This **fails the directive's reject criterion** ("maximum Marketing must not be universally optimal for nearly every credible film").

Marketing is *already* a saturating Hill term (`marketingQuality = m / (m + 400k)`, weighted 0.4 of reach). It dominates anyway **because gross is so high that even the diminishing tail pays.** A **candidate awareness-conditioned curve** (efficient capacity rises with awareness; above-capacity reach collapses; over-hype adds Promise-mismatch risk) would restore a matched optimum — *and this matches the 2005 game's documented over-exposure penalty* (§2). But the deeper driver is gross scale.

---

## 10. Production-budget study `[I]`

Same package, negative multiplier ∈ {0.75 … 1.75}:

| negMult | 0.75 | 1.0 | 1.25 | 1.5 | 1.75 |
|---|---|---|---|---|---|
| median contribution | **$9.89M** | $9.16M | $7.94M | $6.74M | $5.67M |
| loss/film | 1% | 1% | 5% | 10% | 18% |

**Lean is profit-maximizing; higher budget is pure downside** (more cost + more risk, not enough extra gross). Budget adequacy **saturates too cheaply** — the expensive tiers are a trap, not a strategy. This is a *secondary* calibration note (a diminishing-return budget→craft/reliability curve would make tiers real), but it is **not** the money-isn't-a-constraint root, and max budget is at least *not* the dominant strategy.

---

## 11. Payroll / overhead study `[I]`

Annual burn (payroll + overhead, read from the ledger) vs one film's contribution:

| Route | annual payroll | annual overhead | annual burn | one-film contribution | burn ÷ one film |
|---|---|---|---|---|---|
| A | $8.5M | $1.4M | **$9.9M** | $8.85M | **1.12×** |
| B | $5.9M | $1.3M | $7.2M | $9.07M | 0.79× |
| C | $8.7M | $1.5M | $10.2M | $9.03M | 1.13× |
| D | $2.0M | $0.7M | $2.7M | $2.04M | 1.33× |

A **full year of operations costs about one film's contribution**, and a competent studio makes ~4 films/year — so operations consume **~25% of gross output.** Payroll/overhead are not negligible in absolute terms, but they are trivial against film ROI. **The weak pressure is film profits being too high, not operating costs being too low.** Raising overhead/salary would be an arbitrary tax that hides excessive film ROI (see §14: salary ×2 / overhead ×3 barely move the four-film multiple). **Do not use them as the primary lever.**

---

## 12. Starting-capital analysis `[I]` / `[R]`

$20M founds the current *no-facility* studio comfortably (recruitment fund $6M is separate from cash; a competent roster leaves most of the $20M liquid). **Lowering starting cash is the wrong first move:** diagnostically, `startCash=$12M` *raises* the four-film multiple to **4.1×** (smaller denominator) while barely changing loss rate — it makes money *look* more constrained as a ratio while leaving films just as over-profitable.

**Future (not D-12) capital structure `[R]/[C]`:** when Layer-1 facilities/sets/lot exist, a **$20M total capitalization with only ~$8–12M liquid after mandatory setup** would reproduce the original game's constrained-early-liquidity feel (§2) — *without* lowering the number. Precommitted infrastructure, not a smaller bank, is the right lever there. **Facilities remain a non-goal now.**

---

## 13. Ranked root-cause attribution `[I]`

1. **Base opening/gross scale is too high (dominant).** It is the only lever that materially moves *both* the four-film multiple and the loss rate (§14). The median film is a 5× hit (§6).
2. **Loss probability is near zero (4–9%).** Downside rarely crosses zero, so there is no financial judgment to exercise.
3. **Maximum Marketing is universally optimal (§9)** and **budget adequacy saturates cheaply (§10)** — spending choices carry no real trade-off. Both are largely *symptoms* of (1).
4. **Recurring operations are trivial relative to film ROI (§11).** A consequence of (1), not an independent cause — and not the lever to pull.
5. **Studio share (0.52) is a minor secondary lever** (§14); starting cash is a *non*-lever (§12).

---

## 14. Sensitivity matrix `[D]` (route A four-film multiple; one diagnostic lever at a time, 120 seeds)

| Lever | cash multiple (p10 / med / p90) | loss/film | end<start |
|---|---|---|---|
| **baseline** | 1.10 / **2.81** / 4.06× | 4% | 5% |
| gross ×0.9 | 0.93 / 2.46 / 3.61× | 7% | 10% |
| gross ×0.8 | 0.75 / 2.12 / 3.15× | 9% | 12% |
| **gross ×0.7** | 0.58 / **1.78** / 2.70× | 12% | 18% |
| **gross ×0.6** | 0.39 / **1.43** / 2.24× | 19% | 28% |
| salary ×1.25 / ×1.5 / ×2 | … / 2.76 / 2.71 / **2.60** / … | 4% | 7–10% |
| overhead ×2 / ×3 | … / 2.77 / **2.73** / … | 4% | 7% |
| startCash $15M / $12M | med **3.50 / 4.13×** (worse) | 1–2% | 5–7% |
| share 0.50 / 0.48 / 0.45 | med 2.68 / 2.54 / **2.34×** | 4–8% | 7–12% |
| **gross ×0.7 + share 0.48** | 0.48 / **1.59** / 2.45× | 16% | 23% |

**Only gross scale (and, weakly, share) meaningfully moves the outcome.** Salary ×2 and overhead ×3 leave the median at ~2.6–2.7× — proving operations are not the fix. Lower starting cash makes the ratio worse. **Marketing effectiveness** and **budget diminishing-return** curves were characterized structurally in §9–§10 rather than as single-constant toggles (they are curve shapes, not scalars).

---

## 15. Candidate calibration packages `[P]` (≤3; smallest coherent preferred)

### P1 — Routine gross scale (smallest, single lever)
- **Change:** introduce a named routine opening/gross scale ≈ **0.62–0.65×** (a single `TUNING` multiplier on base opening reach / market value; legs and the fame Hill K=50 unchanged).
- **Primary problem:** film ROI too high (§13.1).
- **Expected four-film shape:** median ~1.4–1.5×, p90 ~2.2×, some competent runs below start; loss/film ~15–19%.
- **Small-competent:** viable (p10 near/above break-even). **Star-heavy:** modestly worse (higher spend, thinner margin). **Bargain:** harsher but still a stress lane. **Tentpole:** viable-but-risky.
- **Marketing:** still saturating — **max marketing remains optimal → FAILS the reject criterion.** **Budget:** lean still best.
- **Future-facility compatible:** yes. **Risk:** leaves the two explicit owner complaints about marketing dominance unaddressed.

### P2 — Gross scale + awareness-conditioned marketing (RECOMMENDED)
- **Change:** routine gross scale ≈ **0.65–0.70×** **+** replace the pure Hill marketing term with an **awareness-conditioned curve**: efficient marketing capacity rises with existing awareness (Fame reach + studio awareness); below capacity spend adds reach, near capacity it diminishes, **above capacity incremental reach collapses** and over-hype adds Promise-mismatch/expectation risk. (Directly mirrors the 2005 over-exposure penalty, §2.)
- **Primary problems:** film ROI (gross) **and** universal max-marketing (§9, §13.3).
- **Expected four-film shape:** median ~1.3–1.6×, p90 ~2.0–2.3×, ~20–30% end-below-start on aggressive play; loss/film ~15–25%; **marketing gains a genuine interior optimum** for low-awareness films (max marketing no longer free).
- **All strategies:** competent viable; star-heavy pays for fame via reach but not guaranteed ROI; bargain remains a stress lane; tentpole viable-but-risky and now *requires* awareness to justify a wide campaign.
- **Future-facility compatible:** yes (awareness will later also flow from prestige/publicity facilities). **Risk:** two levers (slightly larger than P1); the marketing curve needs its own calibration pass + a fresh human re-test.

### P3 — Gross scale + secondary share trim (alternative)
- **Change:** routine gross scale ≈ **0.70×** **+** studio share **0.52 → 0.48**.
- **Expected four-film shape (measured):** median **1.59×**, p90 2.45×, loss/film **16%**, end<start **23%** — in target.
- **Trade-off:** lets gross stay at a gentler 0.70× by sharing the correction with the *smallest coherent remaining* lever (share). **Does not fix max-marketing dominance.** Touching 0.52 (an architectural constant) should only happen if gross alone can't reach target — here it can, so this is an *alternative*, not the recommendation.

---

## 16. Recommended package

**P2 — routine gross scale (~0.65–0.70×) + awareness-conditioned marketing.**

It is the smallest package that satisfies **all** the directive's reject criteria: it corrects the dominant root cause (gross/film-ROI, §13.1) *and* removes universal max-marketing (§9, an explicit reject), while restoring the documented 2005 marketing-fits-awareness fantasy (§2). It leans on the top two preferred levers (routine gross scale; awareness-conditioned marketing) and touches **neither** salary, overhead, starting cash, studio share, nor forecast variance.

## 17. Why the other packages are inferior

- **P1** is smaller but **fails the max-marketing reject gate** — lowering gross alone leaves maximum Marketing universally optimal. Acceptable only if the owner de-scopes the marketing complaint.
- **P3** hits the four-film targets with measured numbers, but (a) it does not fix max-marketing dominance, and (b) it spends part of the correction on **studio share (0.52)** — an architectural constant the calibration record says to move only as the *last* coherent lever. P2 achieves the same balance without touching it.
- **Rejected outright:** raising salary/overhead (§11, §14 — a tax that hides ROI), lowering starting cash (§12 — worsens the ratio), and widening forecast variance (§8 — masks an over-profitable mean).

---

## 18. Required implementation tests if a package is approved

- **Gross scale:** a `TUNING` unit test asserting the new routine-scale constant's value and range; an `[I]` four-film harness re-run asserting competent median ∈ ~[1.0, 1.6]×, p90 ≤ ~2.25×, loss/film ∈ ~[20%, 35%], and ≥ some competent runs below start.
- **Awareness-conditioned marketing (P2):** unit tests that (a) at **low awareness**, the profit-maximizing marketing level is **interior** (not the max tier); (b) at **high awareness**, higher spend still pays; (c) above-capacity spend yields **negative** marginal contribution; determinism preserved (same seed → same reach); the legacy/M0A path and linear Star Power in legs/audience unchanged.
- **Invariants (all packages):** M0A acceptance corpus + deterministic replay **byte-identical** (economy gated behind `employmentEngaged`); SaveFileV4 unchanged; fame Hill K=50 and the six-week conserved run preserved; the beta-closure forecast-truthfulness tests still green.
- **Regression:** the full 802-test suite + 7 Playwright specs + build.

## 19. Required human re-test route

After a package lands, the owner should replay the exact route that failed: found a competent (not bargain, not all-star) studio; make **four** films with **credible Fit** decisions, **high-but-affordable** budget and marketing, using the second slot when a legal team exists. Success criteria to *feel*: at least one film should be a real risk (downside crossing zero); four routine films should leave the studio **comfortable but not 3–4× richer**; a genuine hit should still feel exceptional and open expansion; and — for P2 — **maximum marketing should no longer be the obvious default** for a low-awareness film.

## 20. May D-12 merge unchanged?

**No.** The human balance gate failed and reproduces on the engine `[I]`: money stops being a constraint after ~four films. D-12's *architecture* is sound (six-week conserved runs, gross vs Studio Revenue, blended 0.52 share, fame Hill K=50, payroll, overhead, solvency, deterministic forecasts, SaveFileV4, M0A gating) and should be **preserved** — this is a **calibration** change, not a redesign. Recommendation: adopt **P2**, re-run the implementation tests, and re-gate on the human re-test above before merge.

---

*Study produced without changing any production tuning constant, formula, or save schema. Harness, raw outputs, and this report are uncommitted pending the owner's ruling.*

---

# PRODUCTION RESULTS — P2 implemented (owner ruling 2026-07-28) `[P]`

Governed by `docs/D-12-owner-calibration-contract.md`. Implemented on the real engine, economy-engaged only (M0A byte-identical); adversarial review **SOUND**, contract audit **CONFORMS**; 810 tests + 7 Playwright + build green.

## Selected gross multiplier
`TUNING.ECONOMY_BOX_OFFICE_SCALE = 0.70` — the **highest** value in the owner's 0.65–0.70 range (all candidates keep the competent median in range; 0.70 keeps the most gross while staying constrained, and is the least harsh on the bargain stress lane). Applied once, engaged-gated, in the single canonical `computeBoxOffice`, to the opening (before legs/schedule/share). Invariant proven by test: engaged total = non-engaged total × 0.70; legs untouched; Σ weekly = opening×legs.

## Selected Marketing curve and constants
Awareness-conditioned capacity replacing the fixed Hill (engaged only): `capacity = MARKETING_CAPACITY_MIN + (MAX − MIN)·awareness^EXP`, `marketingQuality = spend/(spend+capacity)`, where pre-marketing awareness = `0.6·studioAudienceAwareness + 0.4·filmOpeningAppealReach`.
- `MARKETING_CAPACITY_MIN = 25_000`, `MARKETING_CAPACITY_MAX = 1_800_000`, `MARKETING_AWARENESS_STANDING_WEIGHT = 0.6`, `MARKETING_AWARENESS_EXP = 2.0`.
- No new critic penalty, RNG, or backlash (the directive's first-implementation constraint).

## Before → after (competent four-film, integrated engine `[I]`, 150 seeds)
| Route | cash multiple median (p90) — before → **after** | contribution/film %commit before → **after** | loss/film before → **after** | ≥1 loss in 4 before → **after** |
|---|---|---|---|---|
| A competent aggressive | 2.45 (3.96) → **1.62 (2.70)** | 117% → **61%** | 8% → **20%** | 19% → **35%** |
| B competent restrained | 2.35 (3.78) → **1.71 (2.64)** | 164% → **97%** | 3% → **13%** | 8% → **24%** |
| C star-heavy | 2.46 (4.00) → **1.63 (2.71)** | 114% → **61%** | 9% → **20%** | 20% → **36%** |
| D bargain (stress) | 1.21 (1.85) → **1.04 (1.55)** | 49% → **21%** | 23% → **35%** | 41% → **53%** |

The dominant defect is corrected: routine films no longer return more than their cost, four ordinary films no longer multiply cash toward 3–4×, and losses are now common. End-below-start is 23–29% (competent), some runs recover from p10 ≈ 0.46–0.67×.

## Marketing optima by awareness
Marginal contribution per marketing dollar dropped from ~5–15× (pre-P2) to **~1.6× at the top tier** (steeply diminishing), and capacity now rises with awareness (a brand-new studio's film is flagged **Overextended** by a $1M campaign; a warmed studio absorbs it efficiently). The player-facing Budget & Forecast now shows a truthful campaign-status band (Underexposed / Efficient / Near saturation / Overextended), engine-derived.

## Production Budget findings (Stage 3C)
Lean (0.75×) remains expected-Contribution optimal across all diverse-package types (contained/ordinary/demanding × best/cheapest); higher tiers stay pure downside.

## Remaining limitations (require owner ruling before merge)
1. **Marketing — maximum campaign not fully dethroned.** Awareness-conditioned reach saturation + full cost (the directive's mandated FIRST implementation) steeply cuts marginal returns and makes marketing awareness-dependent, but **maximum Marketing remains the median-optimal single tier on a fresh studio** (100% in the diverse gate; the thin positive marginal survives because marketing feeds two gross channels — base awareness and the specificity/promise bonus). Per Stage 3B, the second mechanism (a **deterministic over-exposure / expectation effect** — e.g. spending far beyond capacity adds Promise-mismatch/expectation risk that dampens legs or audience response) is **PROPOSED for owner approval, not implemented.** Missing dependency: a bounded, engaged-gated over-exposure penalty.
2. **Production Budget — still a dominated ("fake") choice; STOP condition invoked.** The existing budget-adequacy channel (`budgetAdequacy` = relative-to-`requiredNegative`, saturating at 1.15×, only 10% of craft) **cannot be corrected by a bounded constant tweak**: (a) it is computed in `computeCraft`, which is **shared with the frozen M0A path** — any change breaks byte-identity; (b) raising its weight/cap globally would flip it to *universal* dominance (max budget always best); (c) making it ambition-conditioned (Lean-for-contained, Generous-for-ambitious) requires the adequacy *knee* to depend on ambition — a structural, engaged-gated change beyond a bounded tweak. **Proposed design:** an engaged-gated budget→realization/reliability channel where under-funding a *demanding* film (high `budgetDemandMultiplier`) materially lowers expected craft/reliability while a *contained* film saturates adequacy cheaply — so Lean is rational for contained films and Adequate/Generous for ambitious ones, without touching M0A. Left UNIMPLEMENTED per the directive's stop condition.
3. **Balance is at/just above the tightest targets.** Competent median ~1.6–1.7× (target ~1.0–1.6×) and p90 ~2.6–2.7× (soft target ≤2.0–2.25×) — a justified deviation: within the owner-mandated 0.65–0.70 scale range these are the achievable values; the residual overshoot is coupled to items (1)/(2) (efficient-marketing skill play and budget efficiency both currently reward the competent player). The owner's *described* high-marketing route lands ~1.6× (in range); efficient skilled play reaches ~2.0× (skill-reward ceiling, still below the 3–4× breakout).

## Required human re-test
See §19 above, plus: confirm a $1M campaign on a brand-new studio's first film reads **Overextended** and that stepping down to Standard improves Film Contribution; confirm four ordinary films leave the studio comfortable-but-not-multiplied and at least one film loses money.

## Can D-12 merge?
The money-is-not-a-constraint **root cause is corrected**. But two owner-approval items remain open: the marketing over-exposure mechanism (proposed) and the budget-choice redesign (stop condition). **D-12 should NOT merge until the owner rules on (1) and (2)** — either approving the follow-on mechanisms or accepting them as documented limitations. This is not a merge; it is the calibration-implemented checkpoint for the owner's human balance re-test.

---

# D-12 CALIBRATION CLOSURE — Marketing & Production Budget made strategic (owner ruling 2026-07-28) `[P]`

Both previously-open items are now resolved on the real engine (all economy-ENGAGED-gated; M0A byte-identical). Adversarial review **SOUND** (one forecast/realized divergence found and fixed + covered by a new regression test); contract audit **CONFORMS**; 819 tests + 7 Playwright + build green.

## Marketing path audit
Raw `budget.marketing` enters the box office **once** (reception.ts, computing the canonical `marketingQuality`). Both gross channels — base awareness and the promise-specificity bonus — consume a single canonical `effectiveMarketing` value; overexposure reads spend÷capacity for a LEGS-only expectation signal. **No accidental raw-spend double count** (confirmed by review + a single-source test). No path was removed to force a result; the effect was consolidated onto the canonical value.

## Marketing Stage A (saturation + full cost) — necessary but NOT sufficient alone
Stage A adds an awareness-scaled **effective-marketing-reach ceiling** (`MARKETING_REACH_MIN=0.1`, `MARKETING_REACH_MAX=0.55`) so a not-yet-visible film converts even a saturated campaign into little reach. It cut max-marketing dominance 100%→~42–50% and pulled the four-film balance into target, but could not reach ≤35% because a high-appeal/high-gross film always benefits from a little more reach. **Stage B was required** (per the directive's escalation clause).

## Marketing Stage B (deterministic overexposure) — implemented
Spend beyond `OVEREXPOSURE_THRESHOLD=1.3 ×` efficient capacity raises audience expectations; a film that **under-delivers** (weighted audience score below `OVEREXPOSURE_DELIVERY_REF=58`, over a `RANGE=28` band) is **front-loaded** — its LEGS shrink by up to `OVEREXPOSURE_LEGS_COEF=0.5 × overexposure × deliveryGap`. Deterministic (no new RNG); **opening reach and critic score are untouched**; a delivering film keeps its legs, so a genuine event film can still run a maximum campaign. Player-facing Budget & Forecast shows the truthful engine-derived campaign band (Underexposed / Efficient / Near saturation / Overextended).

## Production Demand model + realization/reliability rule
**Production Demand = `requiredNegative` = concept.baseNegativeCost × shape `budgetDemandMultiplier` × era** — the existing engine value that already scales with concept cost AND shape ambition (spectacle shapes demand ~1.4×; contained ~0.85×). A NEW engaged-only craft **realization delta** (`budgetRealizationDelta`, applied identically in the realized `computeCraft` AND the forecast `computeDeterministicCore`, on top of the FROZEN M0A `budgetAdequacy`): under-funding penalty `= −BUDGET_UNDERFUND_COEF(60) × shortfall × ambitionSensitivity` (ambition from `budgetDemandMultiplier` via `BUDGET_AMBITION_REF=0.8`, `RANGE=0.38`, floor `0.15`); over-funding protection `= BUDGET_OVERFUND_COEF(4) × (1 − e^(−over/0.3))` (small, diminishing). Budget affects gross **only via craft** — it never multiplies box office or buys critic points, and the delta is 0 when not engaged.

## Final constants
`ECONOMY_BOX_OFFICE_SCALE = 0.70` (unchanged — the repaired Marketing/Budget systems brought the routes into target at 0.70, so no reduction was needed). Marketing: capacity 15k–1.8M, awareness weight 0.7, exp 2.0, reach ceiling 0.1–0.55; overexposure 1.3/2.0/0.5, delivery ref 58 / range 28. Budget: underfund 60, ambition 0.8/0.38/0.15, overfund 4/0.3.

## Marketing-tier optima (diverse representative set: best/mid/cheapest × contained/ordinary/demanding × fresh/warmed)
Maximum Marketing optimal in **33%** of packages (target ≤35%); **3 distinct tiers** optimal; Standard optimal ~61% (≈60% ceiling). Low-awareness/weak films prefer Minimum/Standard; strong high-awareness commercial films rationally prefer Maximum. Marginal contribution per marketing dollar declines steeply (~6.5× → ~1.6× → negative when overextended).

## Production-Budget-tier optima
Top tier (Lean) optimal in **39–50%** (target ≤70%); **3 distinct tiers**. By ambition: **contained → Lean, ordinary → Adequate, demanding → Generous** — exactly the intended shape. Over-funding a contained film wastes money; under-funding a demanding film materially lowers realized craft.

## Before → after four-film routes (150 seeds)
Rational competent bot (package-specific choices): 4-film cash multiple **median 1.50×, p90 2.18×**, loss/film **19%**, ≥1 loss in four **35%**, ends below start **25%**, breakout **1%** — budget picks by ambition {Lean 25%, Adequate 50%, Generous 25%}. Fixed routes: A(aggressive) med 1.20×, B(restrained) 1.38×, C(star) 1.23×, D(bargain, stress) 0.89×; competent p90 ~2.17–2.21×. Contribution/film 31–67% of commitment (was 114–164%). All competent gates met.

## Tentpole / high-awareness finding
A tentpole is not a turn-one move (capital-building precedes it); on a warmed, visible studio a Maximum campaign + Generous budget on a strong demanding film is rational and has real upside, but retains material loss risk (over-marketing a film that fails to deliver still front-loads it). Neither system makes tentpoles guaranteed-quality machines: budget buys realization/reliability (craft), never box office.

## Remaining limitations
None blocking. Ordinary competent contribution and loss frequency are in the design ranges; the p90 sits at the top of the ≤2.0–2.25× target. Distinctions used by the routes: *ordinary success* < ~$3M contribution, *hit* ~$3–10M, *breakout* ≥ ~$10M (≈1% of films). Rare-tail breakouts remain.

## Required human re-test
Found a competent studio; make four films spanning a contained, an ordinary, and a demanding concept/shape. Confirm: (a) on your first film a $1M campaign reads **Overextended** and stepping to Standard improves Film Contribution; (b) the **demanding** film's Contribution is better at Generous budget than Lean, while the **contained** film is fine on Lean; (c) four films leave you comfortable-but-not-multiplied (~1.5×) with at least one loss; (d) maximum Marketing is no longer the automatic answer.

## Merge readiness
All known D-12 calibration merge blockers are resolved: money is a meaningful constraint, Maximum Marketing is not universally optimal, and Production Budget is a real ambition-driven choice — all M0A-byte-identical and deterministic. **Still not a merge** — pending the owner's final human balance re-test.

---

# D-12 FINAL DOWNSIDE CLOSURE — legs retention, weak-film risk, forecast truth (owner ruling 2026-07-28) `[P]`

The final human playtest ended at 1.96× with no losses (three critics < 50, one deliberately-sabotaged film that was still forecast a guaranteed profit). Three defects fixed, all economy-ENGAGED-gated (M0A byte-identical). Adversarial review **SOUND**; contract audit **CONFORMS**; 829 tests + 7 Playwright + build green.

## 1. Autopsy forecast root cause
`greenlightAssessment` (the autopsy's greenlight-reconstruction) recomputed `forecastProfitRange` on a ctx with **neither `saturateFame` nor `engaged`** → the recomputed Expected Studio Revenue / profit ran on the NON-engaged path (omitting the 0.70 gross scale + awareness marketing), reading **≈ 1/0.70× too high** (Letters $18.69M shown vs the correct $13.21M; matched across all three films). Fix: thread `engaged` (= `employmentEngaged(preTick)`, always true for a session autopsy) through `greenlightAssessment → forecastProfitRange`, so every autopsy expected value comes from the same engaged path the locked snapshot used. Now: Expected Studio Revenue = Expected Gross × 0.52, Expected Contribution = that − commitment, and Expected Gross == the persisted snapshot byte-for-byte (regression-tested).

## 2. Legs dependency audit + the floor
Legs = `(LEGS_MIN + (LEGS_MAX − LEGS_MIN)·WAS/100) × (1 − overexposurePenalty)`, i.e. **linear in weighted audience score** from 1.8 (WAS 0) to 4.0 (WAS 100). The owner's identical `2.82`: Letters (WAS 46.3 → 2.82 base, small campaign, no penalty); A Season (WAS 54.6 → 3.00 base × ~0.94 overexposure penalty = 2.82 — a **coincidence + over-marketing cancellation**, NOT a constant); Wayward (WAS 58.7 → 3.09, no penalty). **The real defect: `LEGS_MIN = 1.8` is too high a floor** — even a genuine bomb multiplies its opening ≥1.8×, so weak delivery could never collapse a film, and the linear mid-range was too flat. No hidden clamp/plateau — the collisions were genuine formula outputs.

## 3. Exact formulas/constants changed
`LEGS_MIN`/`LEGS_MAX` are M0A-shared (FROZEN), so the fix is an **engaged-only retention reshape**: engaged legs = `LEGS_MIN_ENGAGED(1.2) + (LEGS_MAX − 1.2)·(WAS/100)^LEGS_RETENTION_EXP(1.4)`, then × the overexposure penalty. A lower floor (1.2) + convex response so delivered audience satisfaction governs word of mouth. Response curve (engaged): WAS 20→**1.49**, 40→1.99, 46→2.14, 55→2.41, 59→2.54, 65→2.75, 80→3.25 (vs the flat linear 2.24/2.68/2.82/3.00/3.09/3.23/3.56). Strictly increasing, no floor above 1.2; a true bomb (WAS≤35) opens and dies. `ECONOMY_BOX_OFFICE_SCALE` retained at **0.70** — the corrections made competent play *less* profitable (rational ~1.24×→~1.16×), so lowering the global scale was neither needed nor warranted (§9). Autopsy fix = path selection only (no formula changed). No new RNG; critic score remains not a box-office input; budget still affects gross only via craft.

## 4. Letters from Vineyard — before → after
- **Forecast (before):** expected contribution +$9.20M with a +$4.75M downside — a guaranteed large profit. **After:** the forecast DOWNSIDE crosses below zero (weak-film regression test asserts `profit.low < 0`); it is no longer guaranteed.
- **Realized legs (before):** 2.82 → total $14.18M → +$3.36M. **After:** engaged legs at WAS 46 ≈ 2.14 → the same film front-loads toward its opening.
- **Weakest-legal route (150 seeds, cheapest talent + Generous budget + small marketing):** Film Contribution median **−$1.49M** (p10 −$4.59M, p90 +$1.56M), **loss probability 73%** (target 65–90%). Generous Production Budget cannot erase weak casting/Fit (downside stays negative). Classification: **weakest legal package** — expected result near/below break-even, actual loss more likely than profit.
- **Weak-commercial route** (cheapest talent + demanding shape): loss probability **87%**, median −$2.23M.

## 5. Owner four-film route — before → after
The exact sabotage route (three good films + the weak Letters) ended at 1.96× because the weak film was a guaranteed profit and legs never collapsed. After: the weak film loses ~73% of the time and every film's legs track delivery, so 1.96× is no longer the ordinary result — reaching ~2× now requires a genuine strong hit to offset the weak film's frequent loss.

## 6. Rational-route distributions (150 seeds)
Rational competent bot: 4-film cash multiple **median 1.156×, p90 1.69×** (target 1.0–1.6× / ≤2.0–2.25×), loss/film 29%, ≥1 loss in four 50%, ends below start 41%, breakout ~0%. Marketing gate 28% max-optimal (3 tiers); budget gate top tier 56% (3 tiers; contained→Lean, ordinary→Adequate, demanding→Generous). Strong films retain strong legs (WAS 80 → 3.25); tentpoles keep upside AND real downside (over-marketing a film that fails to deliver front-loads it).

## 7. Production Demand UI
New engine-derived read model `productionDemandView` + a live Budget & Forecast panel: **Production Demand** category (Contained / Standard / Demanding / Highly Demanding, from the Shape ambition multiplier), **Funding status** (Underfunded / Lean but Viable / Adequately Funded / Well Funded / Excess Spending, from budget ÷ demand), the real drivers (concept base cost × Shape ambition), and a truthful consequence line (underfunding threatens realization; overfunding gives diminishing protection; more budget does NOT create audience demand or fix casting/Fit). React only renders it.

## 8. Remaining limitations
None blocking. Competent rational play sits at the lower half of the 1.0–1.6× band (median ~1.16×) with ends-below-start ~41% — a deliberately tighter risk profile than pre-closure, aligned with the owner's "money was too easy" finding; the owner's human re-test is the final judgment. Audience delivery (WAS) remains only moderately craft-sensitive (a mediocre film scores WAS ~46, not ~30); the legs reshape compensates by making retention collapse for that delivery. A future deeper delivery→appeal sensitivity pass could widen weak-vs-strong separation further, but is out of this bounded closure's scope.

## Can D-12 merge?
All known merge blockers are resolved: forecast truth (autopsy arithmetic reconciles), weak-film downside (weakest legal film ~73% loss), retention sensitivity (legs respond to delivery with a low floor; genuine bombs possible), no hidden floor. Still **not a merge** — pending the owner's final human balance re-test.
