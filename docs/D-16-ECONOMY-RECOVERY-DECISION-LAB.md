# D-16 — Economy & Recovery Decision Lab (Owner Decision Package)

**Status:** ANALYSIS COMPLETE — Owner economy ruling required. No production behavior was changed.
**Analysis base:** `main @ 33eb33ae307904aa3f00db20bc695e40bf46d1e4` (local == remote at study start).
**Lab branch:** `audit-d16-economy-recovery-decision-lab` (this branch; adds only `src/harness/d16/` analysis tooling, this report, the source matrix, and DRAFT lessons).
**Evidence:** `out/d16-economy-lab/` (gitignored): 20 specialist reports (`analysis/A*.md`, `B1/B2`), the 16,000-run main corpus (`corpus/main-1000/`), ~200 scoped corpora and probes, and the Owner's Week-86 save (read-only copy). Every quantitative claim below carries its seed count and horizon; **CURRENT ENGINE** and **COUNTERFACTUAL** are never mixed. The statistical reviewer (A18) independently re-derived the headline numbers from the raw corpus; the corrections it demanded are incorporated here.
**Companion document:** `docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md` — every financial value mapped to its authoritative source.

---

## 1. Executive finding

**The engine's model is honest; its economy is structurally negative-sum; its decision surface is mostly dead; and its one real skill is untaught because the UI displays the number that skill depends on with the wrong sign.**

Five sentences carry the whole study:

1. **Normal play loses.** Over 1,000 worlds × 208 weeks (CURRENT ENGINE), 9 of 14 player-information policies end with negative median cash from a $20M start; the default way to play (standard cadence) is first-order stochastically dominated and is the best available choice in 0 of 1,000 worlds; doing nothing at all ends at +$9.73M and is the single most-often-best "strategy" (40.2%).
2. **The cause is a feedback stock with no equilibrium, not the D-13 lottery.** `audienceAwareness` is the only standing channel that touches money; a competent film's gross (~0.25×bMV) sits far below the awareness-neutral gross (0.522×bMV), so awareness ratchets down ~1.5 points per release from a starting value (40) that sits exactly on the separatrix (~40–45). It effectively never rises (never in 400 full-series exemplar runs; 5 of 116,440 low-awareness post-release intervals corpus-wide), the oracle decays too (40 → 14.6), and no positive equilibrium exists anywhere in the system. One causal qualifier (A18): awareness collapse is lethal *at the 52% share and current cost basis* — the disengaged exploit thrives at awareness 0 on 100% of gross. Turning the D-13 discovery draw **off** makes distress *worse* in all five policies tested — D-13 did not cause the ruin; it made it illegible.
3. **Player agency exists and is the cheapest thing to fix.** The oracle's edge over good play — $62.6M as a difference of medians, ~$31.5M on the stricter paired estimate — is *menu breadth*; hidden information contributes **$0.00M** (paired) — the forecast is literally true. A one-sentence human rule ("only greenlight films whose forecast center is positive") beats default play on 99% of seeds for +$12.16M. But the UI shows that center **with the wrong sign** on exactly the packages a struggling studio can afford (fixed costs excluded: a green "+$358K Profit" upside that is a −$190K studio loss), shows two contradictory runway numbers (186wk vs 72wk on the same save), and labels 62.4% of standard-cadence runs "healthy" at week 104 while their median awareness is 12.5 of 40.
4. **Distress is unrecoverable with player information — and that is measured, not asserted.** Durable recovery (healthy at +103 weeks) from real harvested distressed states: constrained 5%, bareMinOnly 0%, noProduction 0% for every player arm over 124,200 continuations; an oracle finds 7.5–10.8% from the same states — so recovery is *unfindable*, not structurally impossible — except insolvency, which is absorbing for both (0 of 4,700 oracle arms; weekly self-transition 99.69%). D-12.12's designated recovery tool, the cheap film, is arithmetically refuted at distressed awareness: from the Owner's Week-86 save the bare-minimum film has **P(profit) = 0 exactly** (best possible Studio Revenue $1.91M against a $2.02M cost; 102 of 250 luck arms hit the 1.8× ceiling and still lost).
5. **Two defects bracket everything.** (a) The **engagement cliff** (engine defect): `economyEngaged ≡ contracts.length > 0`, so firing the whole roster ($925,614 from Week-86, no solvency check) reverts the studio to the legacy 100%-of-gross economy. Measured on the Owner's save (A13 probe, `a13-cliff-output.txt`): the same package nets −$2.29M engaged (including 16 weeks of fixed costs) vs +$4.50M disengaged; at corpus scale, player films released at awareness 0 have a −$0.97M median contribution engaged vs +$1.91M under the 100%-gross rule (A10). The labelled exploit policy wins 61.2% of all-arms corpus seeds at a $142M median, beating the oracle. (b) `releaseTalent` carries no solvency gate while D-12.11's text enumerates it as gated — a code-vs-law inconsistency requiring a ruling either way (this report recommends keeping it ungated and amending the text; §15.3).

**Recommendation (one of A–E): D — both balance correction and player-agency/recovery changes are required.** With the sharpening that the "recovery" half is primarily *truthful information + a refillable awareness stock + a distress toolkit*, and only optionally (and strictly later) a financing mechanic. §10–§12 give the packages. E is explicitly rejected: the architecture (pure core, true forecast, signed ledger, determinism) is better than genre standard and every fix in this report is a repair, not a replacement.

---

## 2. The current model (summary)

Full mapping: `docs/D-16-ENGINE-ECONOMY-SOURCE-MATRIX.md`. In one paragraph: the engaged economy has exactly one revenue source — a 52% blended share of theatrical gross paid over 6 conserved weekly installments — against four cost families: production commitment (negative × {0.75, 1.0, 1.25} grid), marketing ({100k, 400k, 1M} grid, sunk at greenlight), weekly payroll + weekly overhead ($15k + $1.5k/employee), and freelancer fees (salaryCurve × 1.5) when the contracted roster can't field a film. Concepts are free and never consumed. Contracts run up to 208 weeks, renew with a fresh signing bonus, and are the *only* thing keeping the D-12 economy switched on. Negative cash blocks voluntary commitments (solvency gate) but payroll and overhead run forever; there is no game-over, no debt, no secondary revenue, and no recovery mechanic by standing law (D-1/D-11.5, D-12.11, D-12.12). The reconciliation invariant `cash = INITIAL_CASH + Σledger` holds exactly across all 16,000 corpus runs.

---

## 3. Economy health assessment (proposed gates and verdicts)

Gate formalizations proposed as D-16 decision criteria — **not production law until the Owner accepts them**. Each was evaluated on the CURRENT engine; thresholds and sensitivity are in the cited reports.

| # | Gate (rationale) | Metric & threshold (proposed) | Verdict (CURRENT) | Decisive evidence |
|---|---|---|---|---|
| G1 | Multiple viable strategies (a solved game is not a game) | No player policy beats every other pairwise with min margin >55%; ≥3 policies each argmax in ≥10% of worlds | **FAIL** | P5 beats every other player policy pairwise (min 55.6% — the binding margin is vs doNothing); P1/P3/P8/P12 argmax in 0/1000 worlds at every horizon; doNothing tops argmax at 40.2% on the 14-arm player menu (A9, A20) |
| G2 | Capital matters (spend must create downside pressure) | Payroll/budget choices shift P(distress) ≥10pp in both directions somewhere | **PARTIAL** | Payroll kills (17.7% of star-roster runs die with profitable films, A5) but the gradient is one-way: less roster is always better; overhead ×2 spreads only $0.46M across policies (A12) |
| G3 | Better decisions matter (skill > luck) | Policy share of end-cash variance (asinh) > world+draw share on a fixed named menu | **FAIL** | Policy 9.1% (3-arm luck fan) / 21.8% (14-arm corpus menu) vs world 47–70% (asinh; menu-sensitive 0.2–39.4% at adversarial extremes — quote only with the menu named); luck alone flips P3's end-cash sign in 28/50 worlds (P5 12/50, P11 16/50); bMV (r=0.73 with outcome) is invisible at founding (|r|≤0.05 vs every visible week-0 signal) though substantially inferable from box office after the first releases (R²≈0.4–0.5 by ~wk12) (A9, A18) |
| G4 | Uncertainty without dominating | Draw share of per-film contribution variance <40% for supported films; interior outcomes >60% of exposed draws | **FAIL** (low-support) / PASS (supported) | Draw share 43–69% for low-support tiers vs 0.9–3.7% supported; only 24.4% of full-shortfall outcomes are interior — a 0.2×/1.8× coin flip (A4) |
| G5 | Cheap films have a purpose | Cheap tier is the truly-best choice in ≥10% of decision states, in a player-visible class | **FAIL** | P1: 98% distress, −$1.05M median film; below awareness 20 its best case is loss-minimization; **not fixable balance-only** (A12 oracle tier study) |
| G6 | Premium films have a purpose | Premium is the truly-best tier in ≥10% of decision states | **FAIL** | 0% of 406 oracle decision states under CURRENT and every awareness arm; needs bMV $148M+ against an $80M world cap; 1.25× loses to 1.0× on 89% of paired seeds with p90Δ +$0.04M — no upside tail (A9, A12) |
| G7 | Stars create tradeoffs | Fame purchase has positive studio-level EV in some state class AND real carrying cost in another | **PARTIAL/FAIL** | Well-formed at film level (insurance: engaged-arms discovery immunity 0.0% at lead fame <5 → 66.0% at 80+; p10 +$0.70M; upside sold) but priced at 2.2× its payout — matched-budget fame edge $0.00M median (A5, A12, A18) |
| G8 | Distress recoverable sometimes | Durable recovery (healthy at +103wk) reachable with player information from ≥25% of non-insolvent distress states | **FAIL** (player) / PARTIAL (oracle) | Player arms: 5/0/0% from constrained/bareMinOnly/noProduction (124,200 continuations); oracle: 7.5–10.8% — unfindable, not impossible; insolvency absorbing for both, 0/4,700 arms (A7, A8, A18) |
| G9 | Waiting is not magical | Producing beats abstention pairwise ≥65% for a competent studio at every horizon | **FAIL** | doNothing: +$9.73M median, 0% distress, 100% end-positive, beats 12/13 player policies pairwise; waiting is also the best single action from every distress class (A8, A9) |
| G10 | Recovery is not free | Any recovery path costs ≥4 weeks and carries ≥20% residual failure | **PASS** (today, vacuously: the only durable path is the exploit) | Median weeks-to-transient-recovery 6; 27% of "recovered" runs still die; preserve this property in every future mechanic (A12) |
| G11 | Snowballing bounded | P(runaway) explained more by play than by world; runaway runs retain ≥10% failure exposure | **FAIL** | Max 59× start, runaway runs never end negative, drawdown ≤1.4%; runaway is a world property (585/1000 worlds never run away under any policy); the current brake on snowballing is the death spiral itself (A7, A10) |
| G12 | Failure is legible (prospective) | First honest warning precedes the point-of-no-return by ≥8 weeks | **FAIL** (prospective) / PASS (retrospective) | State ladder lags: median 92 weeks from peak cash to first non-healthy label; 62.4% of standard-cadence runs labelled healthy at wk104 at median awareness 12.5; break-even understated 27%; insolvency alert fires exactly once, ever (A16, A19) |

**Overall: the current economy fails 9 of 12 proposed gates.** Of the three non-FAIL verdicts, G2 and G7 are PARTIAL and G10 passes vacuously (the only durable recovery path today is the labelled exploit). Statistical caveat (A18): P10's +$0.18M median carries a bootstrap CI of [−0.21, +0.66] — the 9-vs-5 negative-median split has one policy statistically indistinguishable from zero.

A18's standing corrections apply to every number above and are adopted throughout: 9/14 (not 10/14) negative-median policies; 6/9 (not 7/9) Owner films on clip bounds; variance shares quoted in asinh only; all "0%" claims carry world-clustered 95% upper bounds (recovery from awareness <20: ≤0.3%; the aw<20 no-rise claim is carried by the `standing.ts` break-even algebra, not the sample).

---

## 4. Strategy findings (G1/G3/G9)

- **The best play is stasis, not growth.** The best film-making policy (forecast-profit-max) ends at +$20.49M median — +2.5% over start after four years and 27 films; the median default-cadence studio *peaks* at $21.46M and gives back 110% of that peak. No trajectory in 16,000 runs classifies as oscillating: there is no business cycle, only one-way slides (A10, A19).
- **The oracle gap is a menu gap.** Paired decomposition: search breadth $31.5M, hidden information $0.00M. Adding a single shape option to the scan menu is worth +$24.6M; a legal player-information rule with the wider menu beats the oracle on 63% of seeds (95% CI 57–68%, n=300) (A9; A18-corrected magnitudes).
- **The one real skill:** "only greenlight forecast-positive packages" — +$12.16M vs default, 99% paired win rate, end-positive 43%→80%, while making *fewer* films (14 vs 23). This is learnable, legible, and currently untaught (§7).
- **False choices measured:** promise width (100% of 317,930 films use 0.8), cast plan (medΔ +$0.09M), genre (uniform even for the oracle), the conservative reserve rule (binds on 0.25% of decisions; P2≡P3 on 95% of seeds). The premium budget rung and the $100k marketing rung are dead (§5/§6). Of ten decision surfaces, one is a real recurring lottery-hedged decision (concept, tail-only), one is real-but-invisible-and-irreversible (founding roster), and one is the load-bearing skill (greenlight-or-wait) (A19).

## 5. Roster / payroll findings (G2/G7)

- The mid/high-cadence studio **dies of payroll, not of films**: default-cadence films are break-even at the median (−$1.07M over 22 films per run) while the roster consumes $21.68M — ~95% of net capital destroyed (per-run signed-ledger medians; in absolute outlay terms production still moves 3.3× more gross dollars — the roster is where the *net* loss lives) (A5).
- The founding roster is the game's largest financial decision and its least informed: committed in week 0, worth 51–136% of starting cash in guaranteed payroll+overhead, frozen for 196 weeks (renewal window 12wk; `releaseTalent` called 0 times across 15,000 non-exploit runs), gated only on the signing bonus — which draws from an off-ledger $6M fund that never binds (0/200 seeds within 5% of cap).
- **Fame is real insurance priced at 2.2× the payout** (matched experiment, 1000 paired seeds: +$5.61M payroll buys +$2.55M film P&L; end cash −$2.58M, 35.3% win). Its true return is 4.49× skill per point (direct oracle probe — **A3's earlier 11× estimate did not reproduce and is retired**); `salaryCurve` prices fame at 4×, so fame is mildly *under*-priced at low-fame leads and over-priced at star level. Discovery immunity is fame's real product (engaged arms only: 0.0% at lead fame <5 → 31.9% at 60–80 → 66.0% at 80+; the pooled all-arms table is Simpson-inverted by the exploit and must not be quoted).
- Development farming is dead: the youngest-cheapest roster grows OVR fastest, fame slowest, at 2.25× the payroll per head of the cheap roster, and finishes last at every horizon (A5, A10 G-LH12).

## 6. Marketing findings

- Within the legal grid, marketing is close to a solved choice for any real cast: $1M wins 85–98% of paired worlds; $100k is the argmax in 829 of 9,000 controlled cells and **profitable in 0 of those 829**. The whole-run paired effect of always-max over default is +$1.43M (76% win) — and +$6.72M over always-min (A6).
- **The grid brackets the true optimum from the wrong side at both ends** (unconstrained per-world optimum: $300k–$1.5M by tier/awareness). This *reconciles* the D-12 record: its accepted "moderate $3M profit-max" lived on an unbounded dial the shipped $1M cap excludes. The clean fix is the grid, not the response curve: `{200k, 700k, 2M}` or `{300k, 850k, 2.5M}` produce no dead rung in the controlled sweep.
- **Marketing dies exactly where recovery needs it:** on the Week-86 save the $1M rung is affordable on 0 of 81 packages, and the awareness-conditioned capacity means a declining studio cannot buy reach at any price. The Assembly copy currently steers players *away* from the only lever with marginal return > 1 ("near saturation — most of this campaign is wasted") (A6, A16).

## 7. UX / explainability findings (G12; Tier-0 core)

All five blocking gaps are information-only (values already computed, correct, and tested — the defect is placement, labelling, and one omitted cost basis):

1. Two live "Runway" definitions (roster screen: payroll-only, 186wk; dashboard: true, 72wk — same save, same label).
2. Break-even and the profit band exclude the ~$548K/film 14-week fixed-cost cycle — a 27% understatement at bare-minimum scale, largest exactly when the studio is poorest; every branch of the only affordable Week-86 package loses money while its upside renders green as "Profit."
3. Two live definitions of a released film's "profit" (projected full-run vs cash-basis; a third, run-blind variant found by the source-matrix pass at `adapter.ts:1769`).
4. The affordability scopes (bare-min / standard / typical) exist, parity-tested, and render only inside a retrospectively-titled screen, gated off before the first release.
5. The standing card claims Commercial Confidence is "how much financiers trust the studio" — no financiers exist; two of three standing channels have zero commercial effect, displayed at equal weight while the one that matters (awareness) collapses. The Owner's save: awareness 12.31, prestige 95.31 — *"the most revered studio nobody has heard of"* — computed by the engine and narrated nowhere.

Discovery risk is prose-only (the 0.2×/1.8× band is never quantified; the warning proxy silently misses 14.5% of exposed packages); the insolvency alert fires exactly once by construction; and no surface shows what a contract's multi-year obligation does to runway at signing time (A16).

## 8. D-13 discoverability findings (G4/G5)

- **Exonerated as a cause of ruin; convicted on shape.** Removing the draw *raises* distress in all five policies (paired 300×208wk); the draw was worth +$8.2M to the Owner's save; the RNG is clean; the closure's accepted numbers reproduce at HEAD exactly (17% / 38%), and the conflicting older doc predates the discovery commit — record reconciled (A4).
- The convicting measurements: only 24.4% of full-shortfall outcomes are interior (two-atom coin flip); 90.4% of legal packages at real decision points are exposed and **77.8% of real states contain no immune package at any price** ("a condition satisfied by almost everyone is not a condition"); variance is regressive 47× across cost deciles while the *mean* draw favors cheap films — the tax is levied purely in the second moment; a 0.2× draw is unsurvivable for every package (needs ROI@z0 > 400%; observed max 230%) while 1.8× rescues only 47% of losers.
- Defect localized to three constants, ranked: `DISC_FLOOR` (0.2), `DISC_SUPPORT_THRESHOLD` (0.45), `DISC_SPREAD` (3.5). Not `DISC_CEIL`, not the stream, not the idea.

## 9. Failure, recovery, Week-86

### Failure states (A7)

Insolvency is mechanically absorbing while anyone is employed (weekly self-transition 99.69%; `canAfford` refuses every voluntary action at cash<0 while payroll runs unconditionally). The Owner's exact position (bareMinOnly, no active runs, cash>0) arises in 31–43% of standard-family runs, median first occurrence week 80–116. Runaway success is real (up to 59×) and entirely world-selected. The wk-208 contract wall is a structural boundary: at 260 weeks, 100% of the 410 observed player cliffs land on week 208 exactly and every one freezes at Δcash $0.00 forever — **"going broke then profiting from the cliff" never occurs in observed play**; the exploit requires choosing the cliff while still solvent.

### Recovery paths (A8)

Every legal lever from distress was tested (28 arms × 30 real states × 30 luck arms): cheaper films, reconfiguration, cheaper talent, freelancers, expiry, early release, waiting, cadence, marketing, genre. **Waiting is the argmax in most cases and nothing durably recovers.** The corpus's transient "recovered" flag is a 6-week blip (94% of flagged runs still end in terminal decline). The only >25% sequence is the exploit: fire everyone → disengage → +$100.4M median, 100% durable. Legality ≠ credibility, now with numbers (extends Lesson V).

### THE WEEK-86 FORENSIC AUTOPSY (A11; independently re-verified by A19/A18)

**What happened.** $20M → $2.83M = films −$13.80M (80.4%) + fixed costs −$3.37M (19.6%); ledger closes to the cent. State ladder: healthy weeks 0–57, constrained week 58, bareMinOnly week 63 (D-15's markers verified; D-16 adds week 58). Nine standard-ish Drama films, one concept made four times.

**Which decisions mattered.** Ranked by measured impact: (1) the founding screen — all six creatives player-authored at age 18, fame 0, with $5,857,978 of the $6M recruitment fund left unspent, while the week-0 market offered fame to 90.9. A fame-65+ lead sets the discovery multiplier to exactly 1.0; a fame-10 lead puts every film on the coin flip. (2) Greenlighting against the forecast: the locked, player-visible forecast center was **negative on 9 of 9 films** (Σ −$22.0M) — but the UI's fixed-cost-blind "Profit" framing, the wrong-sign upside band, and the never-rendered script quality (the cheapest-concept reflex selected the 29th-best script of 30) made the discipline invisible. (3) Slate scale: film #1 committed $10.9M = 55% of cash in one action.

**Which outcomes were unlucky.** None, net: the Owner was **lucky by +$8.2M** (realized −$13.8M vs −$20.4M median over 200,000 draw resamples; a 78th-percentile outcome). Critic variance contributed under $60K. 6 of 9 films landed on a clip bound.

**What was structural.** The world was favorable (95.7th percentile for default play at 208wk): all 13 market-founded harness arms ended week 86 **above the Owner's $2.83M** — 12 of 13 by more than $10M, and 10 of 13 above the $20M start (P3 reached $60.9M cash, a +$40.9M gain; P1/P8/P16 ended below start but far above the Owner); 197/200 luck-resampled arms beat the real outcome. The structural share of the loss is the awareness ratchet (start 40 = separatrix) amplified by the fame-0 roster — the same state re-evaluated at awareness 40 has a +$955K best affordable package; at 12.31 the best is −$926K.

**Could earlier action have prevented it?** Yes, at three points: hire (or partially hire) from the market at founding; adopt the forecast-positive gate (the signal existed on-screen, mis-signed, from film 1); stop or downscale after week 26 (cumulative contribution turned negative — currently visible only retrospectively). The point-of-no-return band is weeks 54–63; the first honest in-game signal ("severe") arrived at week 86.

**Is recovery credible under current rules?** No — and the load-bearing proof is arithmetic, not sampling: at awareness 12.31 the bare-minimum film's *best possible* Studio Revenue (discovery pinned at the 1.8× ceiling) is $1.91M against a $2.02M cost, so the profit set is empty by construction (0/200 engine runs and best-of-250 luck arms −$107K confirm; single-state by nature — it is the Owner's actual save). Waiting: −$1.95M by week 208 (least bad); every legal composite ends negative except the labelled exploit (+$124.4M at 122wk). **Another bare-minimum film is technically legal and strategically irrational** — the truthful answer the recap already gestures at, now proven.

**No special-case tuning for this save is proposed or needed:** the founding-trap, the truth gaps, and the ratchet are general findings; fixing them fixes the class, not the instance.

---

## 10. Counterfactual results (Tier-1 balance evidence, A12)

78 tagged arms, paired seeds, sweeps at 500×104wk, confirmations at 1000×208wk. Headlines:

- **Recommended Tier-1 pair:** `AWARENESS_REACH_NEUTRAL 0.58→0.45` + `DISC_SUPPORT_EXP 1.5→2.5`. Confirmed at 1000×208 paired (arm `conf-pkg-trim` vs `conf-cur`; numbers re-derived from the artifacts by the final audit pass): default cadence −$2.18M → **+$4.32M** (94.0% paired win; every producing policy improves, P5 +$46M); draw share of per-film variance 0.39 → 0.07; recovery|distress 78.4% → 91.8%; terminal decline 63% → 46%; doNothing argmax share on A12's 8-policy sweep menu 42.9% → 30% (14-arm corpus menu baseline: 40.2%). **Named cost:** runaway roughly doubles (P3 6%→17%, P5 39%→54%) and the trimmed discovery tail costs P3 ~$3.2M of median vs the awareness fix alone. (A12's report prints the win-rate column of the *rejected* 0.35 arm in places; its §12 win-rate column should be re-derived before further quotation — the medians and all other fields reproduce exactly.)
- **The structural limit of balance-only:** the awareness stock has no decay and feeds the gross that sets its own sign — the neutral-point frontier is monotone (terminal decline 63%→23% buys runaway 6%→48%), so **G8 and G11 cannot be decoupled by any constant. A small Tier-2 mechanic (weekly awareness decay, or an asymmetric gain/loss coefficient) is required** to create a two-way stock — which is also the only fix family that creates a business *cycle* (A19's fun ranking #2).
- G5 (cheap-tier purpose) is not fixable at constant profitability by any swept lever; it needs niche/segment protection (Tier 2/4 design work).
- `ECONOMY_BOX_OFFICE_SCALE 1.00` and `AWARENESS_REACH_NEUTRAL 0.35` are explicitly **rejected** (runaway breaks outright / feedback-loop sign flips).
- Overhead ×2 is a uniform translation (spread $0.46M across policies) — overhead is not a strategic differentiator at current scale.
- Harness note: the 18 `DISC_*`/`MARKETING_*` keys A12/A4 needed are absent from `experiment.ts`'s allowlist (worked around with verified read-site probes; add upstream — §13).

---

## 11. Recommendation

**D — BALANCE AND RECOVERY/AGENCY CHANGES ARE BOTH REQUIRED**, sequenced:

1. **Truth first** (Tier 0): the five G12 blockers — one runway, one profit definition, cycle-inclusive break-even everywhere, affordability scopes promoted to Dashboard/Assembly, quantified discovery band, honest standing copy, and *naming the greenlight discipline* to the player. Highest fun-per-risk of any family (A19 #1); no rules touched; several items are prerequisites for everything else being evaluable by a human.
2. **Close the defects** (rules): the engagement cliff (persist engagement at `foundStudio`, never derive it from roster size again — or gate step 3.5 on active runs), and an explicit Owner ruling on `releaseTalent` (recommendation: keep it ungated — it is the distress toolkit's core — and amend D-12.11's text to say so).
3. **Tier-1 balance:** A12's two-constant pair + the marketing grid repair + `DISC_FLOOR` raise (A4's ranked defect). Re-run the D-12 gate suite and the D-16 gates as acceptance.
4. **Tier-2 agency/cycle:** weekly awareness decay (decouples G8 from G11) + one non-release awareness action (Publicity-Office family, A15) — spam-bounded by time cost and diminishing returns; this pair converts the fuse into a stock and is where "recovery" actually lives.
5. **Later, optional, post-repair** (Tier 3): one financing mechanic at most — Co-Financed Picture or Distribution Advance (blueprints in A13) — only after film EV is positive at the margin (the sequencing law: financing a negative-ROIC economy is life support), and never both at once. The soft-failure ladder (A14) enters here if the Owner wants failure to have an arc.

---

## 12. Owner option packages

All packages assume the analysis-base engine; file references are the authoritative sites from the source matrix. None is implemented; each is scoped for a normal milestone contract.

### MINIMAL — "Stop lying, stop the exploit, fix the sign"
- **Mechanics:** Tier-0 truth package (5 items, §7); engagement persisted at `foundStudio` (one new boolean on `GameState`, set once, never cleared — the D-12 economy stays on for the life of the save); `releaseTalent` ruling recorded; A12 Tier-1 two-constant change; marketing grid `{200k, 700k, 2M}`.
- **Files:** `ui/src/screens/{Assembly,StudioRoster,Dashboard,FilmRecord,ReleaseResult}.tsx`, `ui/src/engine/adapter.ts` (read-models only), `src/core/economyView.ts` (one cycle-cost selector), `src/core/employment.ts:47-59` + `tick.ts` gate sites, `src/core/tuning.ts` (2 constants), `src/core/grid.ts` (1 array), `src/core/types.ts` + `save.ts` (SaveFileV6: one boolean, `convertV5ToV6` sets it from `contracts.length>0||founding`).
- **Save/migration:** V6, trivial, deterministic/idempotent per house pattern. **UI:** copy + placement only beyond the above. **Art:** none.
- **Tests:** action-parity for the new break-even basis (Lesson AC pattern); cliff-closure regression (a zero-contract engaged save keeps paying runs); M0A byte-identity re-proof (all changes gated/engaged-path or UI); grid/tuning bound tests; re-run D-12 §23 gates + D-16 G1–G12 corpus (the d16 harness is the instrument — one command).
- **Player experience:** the numbers stop contradicting each other; the greenlight discipline becomes visible; standard play stops being a guaranteed slow loss; the world's best save-scum disappears.
- **Risks:** runaway doubles (accepted, disclosed); grid change shifts all forecasts (needs a fresh calibration pass on the D-13 targets); V6 bump touches save tooling.
- **Interactions:** D-12 (lifts its §21 "only authorized reception touch" wording — needs an explicit ruling clause), D-13 (DISC_SUPPORT_EXP change re-runs its closure distributions), D-14 none, D-15 (recap wording for new break-even basis).
- **Decomposition:** 1 milestone, 2 phases (engine+save / UI+copy), each with adversarial review.

### PREFERRED — Minimal + "give the economy a pulse" (recommended)
- **Adds:** weekly awareness decay toward a floor (new step in `standing`-adjacent tick, engaged-only, constants in TUNING — the A12 §11.4 design; decouples death-spiral from runaway; creates the cycle); one **Publicity Office** action (spend a week + modest cash for bounded awareness; diminishing, cooldown; the first non-release input to the ratchet and the second real use for marketing's dead rungs); `DISC_FLOOR` 0.2→0.35–0.5 (band study first); menu repair (add the `bestCraft` shape rung to assembly's default candidate surface; recost or annotate the premium rung honestly).
- **Files (beyond Minimal):** `src/core/tick.ts` (one gated step), `standing.ts`-adjacent pure helper, `src/core/actions.ts` (one new action kind + validation), `types.ts`/`save.ts` (action needs no new state beyond a cooldown field → same V6), UI: one action surface on the Dashboard.
- **Tests:** decay bounds/monotonicity; publicity anti-spam property tests (corpus: publicity-spam policy must not dominate); full G1–G12 re-corpus with the d16 harness as the acceptance gate; D-13 closure re-validation.
- **Player experience:** awareness becomes a managed resource with two inputs and one drain — comebacks become mechanically possible and *earned*; waiting acquires a real cost (decay), fixing G9 honestly rather than punitively.
- **Risks:** decay + publicity must be tuned together or publicity becomes upkeep-spam (A19's red-team scenario — mitigate with cooldown + concave response + corpus gate); slightly larger surface for the milestone review.
- **Decomposition:** 2 milestones (Minimal; then Cycle) — each independently shippable, reviewed, and corpus-gated.

### AMBITIOUS — Preferred + "distress has an arc" (long-term)
- **Adds (each its own contract):** the A14 soft-failure ladder (Act I dated forward warnings [Tier 0]; Act II "The Backer" — a refusable, once-per-run distress rescue priced in future gross share, reusing per-run `studioShare`; Act III player-executed restructuring under a deadline + optional player-chosen acquisition exit scored by the D-15 recap); ONE financing blueprint (Co-Financed Picture *or* Distribution Advance, A13) strictly after the Preferred corpus proves positive marginal film EV; G5 niche protection (cheap films serve an identifiable cheaper-to-reach audience — design study first).
- **Rulings required first:** the four A14 rulings (standing-vs-cash consequence distinction; D-12.11 narrow lift; forced-restructure-as-choice; player-chosen exit), plus the co-financing awareness-share question.
- **Save:** V7 tranche (advances[]/deferrals[]/deal fields per A17 §7 — all modeled on existing primitives, one version).
- **Risks:** every recovery mechanic is farmable if the cliff is not already closed and film EV is not already positive — this package is *sequenced behind Preferred by design*; scope creep into rival/library territory is explicitly out.
- **Decomposition:** 3+ milestones, each Owner-gated; nothing here blocks or delays Minimal/Preferred.

---

## 13. Professionalization findings (record only; no fixes in D-16)

1. The D-12 integrated balance gates **fail at today's HEAD** (Y3 medians negative for all seven strategies vs the recorded PASS) — the certification went stale across D-12-P2/D-13/D-14 with no re-run. Adopt: every engine-touching milestone re-runs the standing gate corpus (the d16 harness makes this a one-command check).
2. No D-12 closure/merge record exists (every D-12 doc ends "Not merged"; the code is live) — the largest documentary gap in the economy record.
3. Duplicated financial formulas: 7 `requiredNegative` sites, 3 live per-film "Studio Revenue/profit" definitions, 3 runway definitions, 4 committed-cost definitions; comment drift at the mirror sites the source matrix now pins.
4. `experiment.ts` TUNING allowlist needs the 18 verified `DISC_*`/`MARKETING_*` keys; `luck.ts` "independent arms" wording should be softened to match its measured (sound) behavior; `summary.md`'s pooled per-film table over-weights high-cadence runs (sign-flips P2/P3) — the per-run metric is the correct default; the corpus runner stamps `tagNote:'CURRENT'` on counterfactual arm files whose `mode` field is correctly `COUNTERFACTUAL` (the `mode` field is authoritative; fix the note); A12's §12 win-rate column mixes in a rejected arm's figures and needs re-derivation (its medians reproduce exactly); when quoting win shares, name the menu — A18's 27.0% for P5 is the all-arms share, A9's 30.5% the player-menu share, both correct.
5. The engagement gate as a *derived* economy switch is fragile by construction; persist it (Minimal package) and treat "derived law toggles" as an anti-pattern.
6. FAILED vs BLOCKED discipline held throughout this study (e.g., the vitest-workspace inclusion and the allowlist gaps were reported as BLOCKED with the one-line upstream fix named, not silently worked around).

## 14. Explicit non-recommendations

- **No loans / no credit line now** (sequencing law: financing a negative-EV film economy is life support; an honestly-collateralized line prices at ~$394K — a correct and useless answer).
- **No library licensing / recurring passive revenue** (it would mask the awareness spiral and make the gates pass without repairing anything — dangerous precisely because it works).
- **No work-for-hire income floor** (abstention already wins 40% of the time; a guaranteed floor makes not-playing strictly better).
- **No hard game-over / bankruptcy / receivership** (contradicts standing law ×4; the cliff would be its farm).
- **No global gross retune to 1.0, no `AWARENESS_REACH_NEUTRAL` 0.35** (both flip the loop into runaway).
- **No tuning targeted at making the Week-86 save healthier** (its causes are general; the fixes above address the class).
- **No fundamental redesign (E)** — the core is worth keeping: a literally-true forecast, an honest autopsy, FM-grade determinism, and a conserved ledger are ahead of genre standard.

## 15. Unresolved Owner decisions (consolidated)

1. Accept the G1–G12 gate set (with A18's operationalizations) as D-16 law?
2. Engagement-cliff closure shape: persist-at-founding (recommended) vs gate-step-3.5-on-runs?
3. `releaseTalent`: keep ungated + amend D-12.11 text (recommended), or gate it?
4. Lift the D-12 §21 "do not retune D-6" instruction for exactly `AWARENESS_REACH_NEUTRAL` (+ the Tier-2 decay design)?
5. Re-open three D-13 constants (`DISC_FLOOR`, `DISC_SUPPORT_EXP`/`SPREAD`) against its closure record?
6. Marketing grid replacement (and which triple)?
7. Break-even convention: cycle-inclusive everywhere (recommended) vs side-by-side film/studio numbers?
8. Standing channels: relabel prestige/confidence as non-commercial (Tier 0) vs give them mechanical teeth later?
9. Authorize the Tier-2 pair (decay + Publicity Office) as the D-17 candidate?
10. The four A14 failure-philosophy rulings + the co-financing awareness-share question (Ambitious only).
11. G12 wording: prospective legibility (recommended) vs retrospective?
12. Publish this analysis branch to the remote (repo practice allows audit branches; no evidence files are tracked)?

---

*Produced by the D-16 Engine Room lab: 5 Phase-1 auditors, a built-reviewed-fixed corpus harness (102 tests), a 16,000-run headline corpus + ~200 scoped corpora, 9 corpus specialists, 4 design researchers, an adversarial statistical reviewer, a design red team, and an independent final audit — all on the Opus swarm under Fable orchestration. Raw evidence: `out/d16-economy-lab/` (gitignored).*
