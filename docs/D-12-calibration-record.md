# D-12 — Final Step-4 Calibration Record

**Date:** 2026-07-27 · **Branch:** `phase-5.2-economy` · **Harness:** `src/harness/run-economy-balance-study.ts` (300 seeds × 1/3/5 yr × 16 strategies) · **Output:** `out/economy-balance/summary.json`

**Fidelity class (owner 2026-07-27).** This is a **structural / relative** record. The harness is a money-mechanics abstraction anchored to the M0A corpus; its **absolute cash totals are inflated** and must NOT retune starting cash, production cost, payroll, film count, or forecasts. Absolutes are re-validated later through the most integrated engine path. The final D-12 report distinguishes three evidence classes — **[S] structural-harness** (this document), **[I] integrated-engine** (pending), **[H] human-playtest** (pending).

---

## 1. Selected calibration (provisional)

| Constant | Value | Status |
|---|---|---|
| `FAME_REACH_HALF_SAT` (Hill K) | **50** | **Selected Calibration Value** — subject to integrated harness + owner playtest |
| `STUDIO_RENTAL_BLENDED` | **0.52** | Provisional |
| `OVERHEAD_BASE` / `OVERHEAD_PER_EMPLOYEE` | **\$15,000 / \$1,500** per wk | Provisional (texture/roster-pressure lever, not the dominance correction) |
| Theatrical schedule | **6 weeks** | Provisional |

**K=50 rationale [S].** Hill `fameReach(f)=f/(f+50)`: fame 0→0.00 · 20→0.29 · 50→0.50 · 90→0.64 · 100→0.67. Crossover with the former linear term at fame=50; low fame is lifted (max +0.086 at f≈20), high fame is damped (−0.257 at f=90); marginal reach falls ~5× from low to high fame (0.033→0.006 per 5 pts). Every fame tier stays distinct and valuable; extreme fame has real diminishing returns. **K<25 is rejected** — it collapses the moderate→high progression (f50→f90 only +0.12) and optimizes the spread metric at the expense of the intended fantasy.

---

## 2. Why the model works — attribution [S]

Four economy baselines at K=50 / share 0.52 (Y3 median final cash, comparable strategies):

| Model | star | largeDepth | balanced | comparable spread | reading |
|---|---|---|---|---|---|
| legacy (100% lump) | $2656M | $2212M | $1045M | 3.64× | star runaway — the problem |
| share (0.52, no sat) | $1087M | $951M | — | 3.52× | share compresses *cash* ~2.5× but NOT the spread; star still #1 |
| shareSat (+saturation) | $993M | $965M | $956M | **2.57×** | **saturation compresses the spread + un-seats star** |
| full (+overhead) | $988M | $960M | $951M | 2.59× | overhead moves medians ~1% (texture) |

The studio-share alone does **not** break OVR/Fame dominance; the **Fame saturation** does. star drops from a 2.5× runaway to a near-tie with lower-OVR largeDepth and balanced.

---

## 3. Revised acceptance gates — all PASS [S]

The universal **≤ 2.0× spread gate is superseded** (owner 2026-07-27) as conceptually overbroad; see D-12-economy-contract §23. Controlling gates:

**Gate 1 — Comparable-strategy dominance (star/balanced/largeDepth):** comparable spread **1.10× / 1.04× / 1.08×** (Y1/3/5) ≤ 1.15 ✓ · top win share 28% / 32% / 34% ≤ 50% ✓ · Y1 winner = **tentpole** (highest-OVR not always winner) ✓ → **PASS**.

**Gate 2 — Star-dominance:** Y3 star win share **31.7%** (≤ 45 target, < 50 hard) ✓ · star advantage vs next comparable −9% / +3% / +5% ≤ 10% ✓ · Fame monotonic; fame 90–100 not a profit guarantee → **PASS**.

**Gate 3 — Small-studio viability (minimal/lean/prospect):** Y3 p10 **$137M / $227M / $169M** > 0 ✓ · 100% positive-cash runs ✓ · 38 films each ✓ · credible advantage = lower burn + recovery speed → **PASS**.

**Gate 4 — Global scale-spread diagnostic (secondary):** Y1 **2.461×** · Y3 **2.588×** (≤ 2.6 target ✓, not > 2.75 ✓) · Y5 **2.767×** nudges the review band — accepted late-game compounding (ruling D). The residual gap is benign large-vs-minimal studio scale, not Fame/OVR dominance.

**Invariants:** `bestStrategyNotAlwaysHighestOVR` ✓ · `payrollMatters` ✓ (star OVR 61.6 / payroll $16.8M ≈ largeDepth OVR 52.5 and balanced OVR 50.2 — the payroll premium no longer buys dominance) · deep-negative ~0% for disciplined strategies ✓ · reconciliation invariant ✓ · M0A byte-identical ✓.

Win share (full, Y3): star 32% · tentpole 24% · largeDepth 22% · balanced 19% · lean 2% · rest ~0%.

---

## 4. Affordable marketing experiment [S]

Controlled: identical film (OVR 52, fame 40, $6M negative) and studio state, **same reach/legs noise**, only marketing varies; every level affordable on $20M.

| level | marketing | median opening | median Studio Rev | median contribution | P(profit) | marginal Rev/$ |
|---|---|---|---|---|---|---|
| min | $0 | $11.6M | $18.6M | $12.6M | 97% | — |
| low | $1M | $18.1M | $29.1M | $22.1M | 99% | 10.44 |
| **moderate** | **$3M** | $19.6M | $31.5M | **$22.5M (max)** | 98% | 1.23 |
| high | $6M | $20.2M | $32.3M | $20.3M | 95% | 0.27 |
| maxAffordable | $10M | $20.4M | $32.7M | $16.7M | 88% | 0.09 |

Reach **monotonic** ✓ · marginal reach & marginal Studio-Revenue **strictly decreasing** ✓ · max marketing **not** profit-max ✓ · min **not** dominant ✓ · rational interior optimum = **moderate ($3M)** ✓. This is a real controlled concavity result, replacing the old "maxMarketing produced 0 films" artifact (now classified strategy failure, not concavity evidence).

---

## 5. Disciplined tentpole strategy [S]

Builds cash on affordable films, holds a $30M reserve, swings for a ~$52M ($40M negative + $12M marketing) film once affordable *by strategy choice*, keeps operating.

| horizon | reached a tentpole | median first swing | tentpole cost | gross | Studio Rev | contribution | profit rate | severe-loss rate | follow-on | strategy final cash |
|---|---|---|---|---|---|---|---|---|---|---|
| Y1 | 100% | week 16 | $52M | $83M | $43M | −$9M | 38% | 26% | 100% | $302M |
| Y3 | 100% | week 16 | $52M | $86M | $45M | −$7M | 37% | 26% | 100% | $999M |
| Y5 | 100% | week 16 | $52M | $84M | $44M | −$8M | 37% | 28% | 100% | $1734M |

Intended shape confirmed [S]: tentpoles are **not** turn-1 moves (the studio accumulates first); become available after capital-building; carry **substantial upside** (a swing pays off ~37% of the time — a $52M all-in needs a ~$100M-gross hit because the studio keeps 52%) and **material downside** (27% severe loss); the studio **always keeps operating** (100% follow-on); and the strategy is **competitive but not automatically optimal** (24% Y3 win share, star edges it). No escalation trigger (neither "almost never viable" nor "almost always destructive/superior"). **Timing caveat:** "week 16" is harness-relative — the harness inflates cash, so real first-tentpole timing is later; the *structure* (build-first, survivable, not-required) is the finding, and absolute timing is re-checked in the integrated rerun.

---

## 6. Integrated-engine rerun [I] — 100 seeds, REAL tick+reception

Harness: `src/harness/run-integrated-balance.ts` (drives `beginFounding → signContract → foundStudio → applyActions(greenlight) → tick` over 1/3/5 yr; strategies SELECT from each seed's real applicant pool; greedy greenlight fills free production slots when the solvency gate allows). Absolutes still overshoot real play (box office = gross) — read structurally.

**Y3 median final cash (real engine):** minimal $33M · lean $53M · balanced $408M · largeDepth $418M · star $397M · prospect $233M · tentpole $201M. Win share: largeDepth 54% · balanced 39% · **star 4%**.

**What [I] CONFIRMS (primary goal — met more strongly than [S]):**
- **Gate 2 star-dominance PASS, decisively.** star Y3 win share **4%** and star median is **below** balanced/largeDepth at every horizon (advantage −5% to −28%). On the real engine the highest-OVR/highest-payroll roster is the **weakest** comparable strategy (and carries the highest insolvency risk — everNeg 35%). Fame saturation + blended share didn't just neutralize star dominance, they inverted it.
- **Gate 1 comparable spread** (star/balanced/largeDepth) is tight at Y3/Y5 (**1.05–1.07×**), so no comparable strategy crushes the others by margin.
- **Gate 3 small-studio viability PASS at Y3.** minimal/lean/prospect all p10 > 0 ($1.4M/$4.5M/$26.9M), end-state positive in **96%/98%/98%** of runs, producing 17–34 films. (Transient negative dips that recover — everNeg 2–7% — are the intended survivable-negative design, not insolvency.)

**What [I] DIVERGES from [S] on (the reason the rerun was mandated):**
- **Gate 4 scale-spread = 12.7× (Y3), 27× (Y5)** — vs the [S] abstraction's 2.6×. This crosses the owner's >2.75× hard-review threshold by a wide margin. It is **not** OVR/payroll dominance (that is fixed); it is a **large-vs-minimal scale gap** driven by faithful engine mechanics the abstraction omitted: (1) the **writer/director concurrency bottleneck** — a 1-writer minimal studio makes ~17 films where a 2-writer balanced studio makes ~34 (exactly 2×, the MAX_CONCURRENT talent constraint), (2) the real **quality→gross** sensitivity punishing cheap rosters harder than the abstraction, (3) multi-year **compounding** amplifying both.
- **A mild balanced/largeDepth win-share edge (~54–57%)** replaces star dominance — a scale/output advantage (more creators → more concurrent films), not a talent-cost exploit. This nudges Gate 1's "no >50% winner" sub-criterion.
- **Y5 minimal thinning:** the smallest studios drop to 82% end-positive by Y5 (they tread water at ~$25–33M while large studios compound to ~$700M). Viable at Y3, scale-pressured by Y5.

**[I] verdict:** the milestone's central problem — highest-OVR/payroll dominance — is **solved and confirmed on the real engine**. The open item is the **magnitude** of the large-vs-minimal scale gap (12–27×, far above the 2.6× the abstraction predicted), which is an owner-level design-feel decision surfaced for review (§7).

## 7. Writer/creative-team concurrency diagnostic [I] (owner investigation, 2026-07-27)

Harness: `src/harness/run-writer-bottleneck-study.ts` (40 seeds, Y1/Y3, real engine; Y5 excluded to avoid the 208-week contract-term expiry — a renewal mechanic, not the concurrency question). Decomposes the 12× Y3 large-vs-minimal gap via four controlled variants + full instrumentation.

**Writer lifecycle (code audit — NO BUG):** a talent is exclusive to one active production (actions.ts M16.5 rejects any already-engaged id), held from greenlight until RELEASE (tick.ts removes released/cancelled productions from `activeProductions`), reload-invariant (busy is derived from persisted `activeProductions`), and freelancers are a legal escape hatch for any role (greenlight accepts market freelancers, paying `freelancerFee`). No stale assignment, no leak.

**Decomposition of the 12.45× Y3 gap (baseline):**
| strat | writers | Y3 films | films/yr | slot-idle% | contrib/film | rev/film | Y3 cash |
|---|---|---|---|---|---|---|---|
| minimal | 1 | 17 | 5.7 | 56% | $1.5M | $6.0M | $37M |
| lean | 1 | 17 | 5.7 | 56% | $2.8M | $8.0M | $58M |
| balanced | 2 | 34 | 11.3 | 12% | $13.3M | $19.9M | $442M |
| largeDepth | 3 | 34 | 11.3 | 12% | $14.0M | $22.6M | $462M |
| star | 2 | 34 | 11.3 | 13% | $13.1M | $23.6M | $422M |

12.45× ≈ **2× throughput** (17 vs 34 films — thin roster staffs one of two slots) **× ~9× per-film economics** ($1.5M vs $13.3M contrib/film). **Per-film economics is the dominant factor, not throughput.**

**Counterfactuals:**
- **A equal writers** (give thin strategies 2 writers): gap UNCHANGED (12.64×) — the block just shifts from `noWriter` to `noTeam` (director/actor/craft). The constraint is the whole creative team, not writers specifically.
- **B / equal-film-count** (per-film normalization): minimal $1.5M vs balanced $13.3M contrib/film — a **~9× per-film gap independent of throughput**. Driven by talent quality: best-talent strategies (star/balanced/largeDepth) all land ~$13M/film *regardless of roster size*; minimal's **cheapest-talent** roster lands $1.5M/film.
- **C writer-not-held ≈ fullCapacity** (give thin strategies a full 2-film creative team): throughput EQUALIZES (minimal → 34 films, slot-idle 12%) but the gap **WIDENS to 22.6×** and minimal's cash *drops* to $20M — because the extra films are unprofitable and add payroll. **Removing the concurrency limit does not help; it hurts.** Definitive proof throughput is not the cause.
- **D unlimited inputs**: concepts are reusable templates — `noConcept` blocks never fire. Development input is never the constraint.
- **E freelancer fill** (thin strategies hire market freelancers for busy slots): minimal +0.5 films, lean +4 films, but cash ~flat — the extra cheap films' revenue barely covers the freelancer fees. The escape hatch exists and is used, but doesn't rescue minimal because its problem is per-film economics, not throughput.
- **F non-compounding**: budgets are fixed multiples of concept cost (NOT cash-scaled) → no budget compounding; per-film contrib is stable across horizons (balanced $8.6M→$13.3M Y1→Y3 reflects modest *reputation* compounding, not budget escalation).

**Small-studio playability:** minimal makes 5.7 films/yr, is fully idle only 11% of weeks with a longest idle run of 1 week — it is *always working on one film*; the 2nd slot sits empty (56% slot-idle) because a thin roster can't staff it. Active, not stalled.

**Harness caveat (honest):** the raw 12× is *amplified* by the bot's `minimal = cheapest-possible talent` selection (signs the literal lowest-OVR applicants). A realistic minimal-BUDGET player signing few-but-competent creators would land near the best-talent strategies' ~$13M/film, shrinking the gap sharply. So the large-vs-*competent*-small gap is far below 12×.

**Classification: C — intended capacity/quality economics, acceptable.** Not a bug (A ruled out by audit). Not primarily the concurrency abstraction (B is only the ~2× throughput sub-component — deferred to the persistent-script milestone to retest, per the owner's B prescription; it is NOT the driver). Not excessive-needing-correction (D ruled out — no throughput correction helps; the small studio is active, not idle; the driver is intended talent-quality→box-office). **Recommended smallest next action:** replace the raw cash-spread gate with the **throughput/quality-normalized diagnostics** already gathered (contrib/film, films/yr, comparable-spread, slot utilization) — under which the economy is healthy (comparable strategies tight, per-film economics scale with talent investment, minimal is a deliberately-cheap outlier). **D-12 can close without changing any mechanic.**

## 8. Final balance framework (owner-accepted classification C, 2026-07-27)

Owner accepted classification **C** with a **B footnote** (the ~2× throughput sub-component from direct-assembly / no-persistent-scripts is deferred to the persistent-script milestone to retest). **No D-12 mechanic change** (K / share / overhead / starting cash / talent formulas / slots / assignment duration / solvency are all frozen). Harness: `src/harness/run-final-balance.ts` (60 seeds, Y1/3/5, real engine, roster renewal across the 208-week contract term).

**Raw cash-spread is RETIRED as an acceptance gate — DISCLOSED DIAGNOSTIC ONLY.** The 12–27× raw ratio combined ~2× throughput + ~9× per-film contribution from *deliberately selecting the cheapest talent* + reputation + payroll/freelancer structure. It does **not** demonstrate star dominance, a writer bug, or nonviable small studios — it mainly shows **extremely weak talent produces substantially weaker commercial results**.

**Terminology (§5).** Film **Contribution** = Studio Revenue − direct film costs (negative + marketing + freelancer fees). Studio **operating result** = Contribution − payroll − overhead − terminations. Payroll/overhead are **never** folded into per-film Contribution; an allocated operating-cost/film is reported **separately, labeled managerial**.

**`minimal` renamed `bargainBasement`** (a cheapest-legal-roster STRESS strategy, not the representative small studio). Added **`smallCompetent`** — the representative small studio: lean legal roster, **competent (mid-OVR) talent**, restrained payroll, normal budgets, legal freelancer use.

**Four diagnostic families (Y3 unless noted):**

**A — comparable capable-strategy dominance (THE gate): star / balanced / largeDepth.** Spread Y3 **1.05×**, Y5 1.06× (Y1 1.21× — the *expensive* strategy's early cost-drag, i.e. star *under*performing, not dominating). star Y3 win share **5%** (≤45 ✓, <50 ✓); star median advantage vs next comparable **−5%** (≤10 ✓); highest-OVR **never** the winner ✓. Dominance intent fully met; the only number outside the literal band is the benign Y1 spread.

**B — scale-normalized (largeDepth vs smallCompetent).** Y3 cash ratio **2.87× = films 1.55× × contrib/film 1.85×** — **fully explained, no residual** (explained 2.85 ≈ actual 2.87; payroll ratio 2.85×). The representative small studio is only ~2.9× behind large, entirely accounted for by film count × per-film quality — both intended. (bargainBasement's 12× was cheapest-talent quality collapse, now isolated as the stress case.)

**C — bargain-basement stress.** Playable (end-positive 100/95/75% at Y1/3/5), produces films (5–5.7/yr), not an idle exploit (full-idle 10–11% ≪ 40%), materially weaker (cash ≪ capable), **not dominant** (every comparable out-earns it). Weak talent → weak outcomes, as intended; it thins to 75% end-positive by Y5 (the cheapest studio struggles late — acceptable for a stress strategy).

**D — throughput diagnostic.** One-team studios (bargainBasement/lean/smallCompetent) run ~44–60% slot utilization (one of two slots), ~7 films/yr for smallCompetent; capable studios ~88% util, ~11 films/yr. **The present one-team studio generally uses one of two slots — NOT fixed in D-12; the persistent-script / living-slate milestone must retest** whether script inventory and development concurrency change this.

**smallCompetent (representative small studio):** rOVR 44.9, 7.3 films/yr, contrib/film **$7.1M** (Y3, ≈ capable strategies' $12–13M, ≫ bargainBasement's $0.9M), Y3 cash **$148M**, p10 $13.4M, end-positive 98%. Competitive, active, viable — the small studio's earnings gap vs large is throughput × quality, both legitimate.

**Conclusion: D-12 closes without any mechanic change.** Primary goal (star/OVR not dominant) holds on [S] and [I]; the scale gap is intended quality + capacity economics with a defer-to-script-milestone throughput note.

## 9. Closure — controlled review + display corrections (2026-07-27)

**Controlled review (2 independent passes):**
- **Adversarial bug-hunt — VERDICT SOUND.** All 8 invariants verified by re-running code, not trusting comments: M0A byte-identity (economy gated; no new sim draws; corpus + replay green), reconciliation invariant, release-paid-exactly-once, fame opening-reach isolation, V3→V4 no-double-pay, solvency gate, read-models mirror the engine, Sim-to-Next-Event window math (no off-by-one). No engine bugs.
- **Read-only contract audit — CONFORMS (engine) + 2 display deviations FOUND (now fixed).** The engine/sim core conforms clause-by-clause (§5 conservation, §6 share, §7 Hill isolation, §9 tick order, §11 solvency, §16 runway, §18 Sim, §19/20 save+migration, §25 tuning all match; no non-goal built; purity/determinism clean). It caught two stale **financial-display** surfaces still showing "Studio Revenue = full box office" (the §13-C/§17 newspaper + commercial-outlook corrections I had missed).

**Closure fixes applied (display layer only — no engine change, M0A untouched):**
- `newspaper.ts` — Studio Revenue + profit now from the film's theatrical run (blended share); disclosure corrected.
- `filmPackage.ts forecastProfitRange` — studioRevenue/profit scaled by `STUDIO_RENTAL_BLENDED`; break-even = cost/share; `studioRevenueIsFullBoxOffice: false`.
- Autopsy + FilmPackageSummary + FilmRecord — actual Studio Revenue = blended share; disclosure hints corrected.
- Affected truthfulness/UI tests updated to the D-12 share model (#18 now scans for a share-model witness).

**Follow-up (`D-12 closure: align live commercial forecast with fame saturation`):** the live Commercial-Outlook re-forecast now routes through the SAME §7 Hill fame opening-reach path as the greenlight-locked forecast and realized release — `SegmentForecast` exposes the fame-saturated `opening` band, `forecastProfitRange` threads the economy-gated `saturateFame` flag (from `employmentEngaged`) into the single engine helper (no UI/adapter duplication), and `boxTotalFor` applies the saturated opening. Proven by `tests/d12-commercial-outlook-fame.test.ts`: live re-forecast == locked forecast; live and realized openings move under the same transform; fame moves opening not legs; helper applied once; no UI file computes fame reach. Ungated/M0A path byte-identical (opening band === linear band when not engaged).

**Final verification:** 771 core+ui tests green · Playwright economy journey + cycle4 + two-film-autopsy green · repo typecheck + build clean · final balance framework re-confirmed (Family A/B/C hold).

## 10. Pending

- **[H] Owner playtest** — the "is it fun / is Fame legible / does the small-studio experience feel right" judgment no harness can make (post-Commit-2).
