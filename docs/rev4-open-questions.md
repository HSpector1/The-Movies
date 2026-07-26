# Build Contract rev. 4 — Gap Resolutions (NORMATIVE — decisions recorded 2026-07-25)

**What this is.** The contract audit confirmed 56 places where rev. 3 is undefined,
ambiguous, or self-contradictory. For every item the orchestrator proposes a specific
resolution — the most reasonable reading of the contract's intent. Items are split:

- **§1 DECISIONS FOR THE OWNER** — two defensible answers lead to materially different
  games, or the contract contradicts itself in a way only authorial intent resolves.
  All five are now decided (rulings recorded inline); B17 was decided earlier and is
  recorded in §0.
- **§2 PROPOSED** — mechanical resolutions. Skim and rubber-stamp; strike anything you
  disagree with.

**Status: signed off.** The owner approved D-1 through D-4 with adjustments and
redirected D-5 (all recorded inline below). This document is **normative**,
incorporated by reference into `docs/build-contract.md` rev. 4; where the two
conflict, this document wins.

IDs (B/M/N = blocking/major/minor) match the audit report. Correction: three confirmed
findings (cancel semantics, talent exclusivity, casting-diversity scope) were dropped
from the report summary by error; they appear here as **M15–M17**.

---

## §0 Already decided by the owner

### B17 — Forecast calibration bands unreachable ✅ RESOLVED
All three confidence tiers used width/sigma ≈ 1.5 → ~87% coverage each; confidence was
cosmetic. **Decision:** keep `FORECAST_SIGMA = { high: 5, medium: 10, low: 16 }`;
change `CONFIDENCE_INTERVAL_WIDTH = { high: 7, medium: 11, low: 14 }`; add a **medium
calibration band of 65–75%**; move **both constants into TUNING** so the tuning loop
can reach them.
*Verification:* coverage = P(|N(0,σ)| ≤ w) → high **83.8%** (band 80–90 ✓), medium
**72.9%** (65–75 ✓), low **61.9%** (55–65 ✓). Distinct, ordered, and each inside its
band as specified.

---

## §1 DECISIONS FOR THE OWNER (all 5 decided 2026-07-25)

### D-1 (= B4 + B5 + margin units) — The money model
`Studio.cash` exists, §13's Oracle scores "expected value," and §14's dead-cultural-state
flag needs "expected profit ≥ 0" — but rev. 3 defines no initial cash, no debits, no
credits, and no profit, while §11 excludes "the studio economy."

**Recommendation (a film ledger, not an economy):**
- `INITIAL_CASH = 20_000_000` (TUNING).
- Greenlight debits `budget.negative + budget.marketing + Σ salaries` (writer, director,
  cast, craft — salary is per production, §2.2).
- Release credits `boxOffice.total`. No upkeep, no interest, no insolvency: cash may go
  negative with no mechanical consequence (receivership is §11).
- `profit(film) = boxOffice.total − negative − marketing − Σ salaries`.
- Oracle EV = expected profit (currency), variance excluded.
- §14 dominance "margin > 15": expected profit is in dollars, so 15 needs units.
  Margin measured in **ROI percentage points**, ROI = profit / (negative +
  marketing + salaries); margin > 15 means a 15-point ROI gap.

**DECIDED (owner, 2026-07-25): APPROVED as above**, with a small-denominator guard.
Orchestrator's pick between the two offered options: a **minimum cost floor**, not a
log-transform — `ROI_COST_FLOOR = 500_000` (TUNING). Packages whose total cost
(negative + marketing + salaries) falls below the floor keep their currency EV for
choice but are **excluded from ROI-based statistics** (the dominance margin). Reason
for the pick: it keeps "margin > 15" meaning literal ROI points (a log-transform
would silently redefine the §14 threshold), and under B8/M3 the structural minimum
cost is ≈ 1.4M (0.75 × min requiredNegative ≈ 1.2M, + 100k marketing + salaries), so
the floor is a pure guard that only bites if future tuning drags costs down into the
degenerate zone.

**§11-vs-formula contradiction sweep (requested):** the places where a non-goal
collides with a quantity the contract needs —
1. *Studio economy* ↔ profit/cash (this decision).
2. *Competition modelling* ↔ `CompetingRelease`/`competingSlate`/`competitionFactor`
   (§2.5/§5.5) — resolved as inert, see N11.
3. *Aging & career progression* ↔ §7's confidence predicates: skill and fame are static
   all year, so "known lead track record" cannot mean career history — it must be
   within-run history or a static fame proxy. That fork is D-3.
4. *Cultural drift* ↔ §14 "dead cultural state": forces are pinned at 50 all run, so the
   flag tests exactly one cultural state — the neutral baseline. Presumably the point in
   M0A; confirm.
5. *Salaries* (§9 `salaryCurve`) only bite if money moves — resolved by this decision.

### D-2 (= B13) — Operationalizing the standing-differentiation hard fail
The contract's only hard fail — "fewer than 3 of 4 asymmetric profiles occur" — has no
numeric high/low and no definition of "occur." Loose readings pass trivially over 1,000
runs; strict ones fail arbitrarily. This gate decides whether M0A passes, so the
thresholds are yours.

**Recommendation:** evaluate **end-of-run** standing. "High" = channel ≥ 60, "low" =
channel ≤ 40 (absolute; brackets all three starting values 40/40/50). A profile
*occurs* if its (high, low) channel pair holds at end-of-run; it *counts* for the gate
if it appears in ≥ **5%** of runs, pooled across both agents. Hard fail if fewer than
3 of the 4 profiles reach that bar.

**DECIDED (owner, 2026-07-25): APPROVED** — end-of-run, 60/40 thresholds, occurrence
floor raised from 1% to **5%** (at 1% the gate cannot catch a collapsed master stat).

**Reachability check against B1/B2 (owner-requested, done before finalizing):** under
the defaults, a run yields **10 releases** (slot cycle = 9 ticks: release during
t + 8, slot re-greenlit at t + 9; two staggered slots → releases at ticks 8, 9, 17,
18, … 44, 45; two productions unfinished at year end). Climb arithmetic per §6:
awareness +20 (40→60) needs e.g. five releases at ≈ +4 delta (surprise ≈ +0.4 with a
famous cast) — attainable inside 10 releases; confidence −10 (50→40, the "low" side)
takes a few flops/overruns; prestige is the binding constraint: the +7 delta cap is
unreachable in practice (it requires criticScore 116), so the practical max is +5 at
score 100, and a typical strong film (score ≈ 80) gives +2.5 — reaching prestige ≥ 60
takes roughly eight strong releases of the ten. **Verdict: no profile is structurally
unreachable, so the gate ships as approved** — but high-prestige profiles will be the
rarest, and if the corpus shows a profile below 5% for arithmetic rather than design
reasons, that goes to the owner (adjust thresholds or run length) per this ruling
rather than being tuned around.

### D-3 (= B15) — What grounds forecast confidence in a one-year world
`knownLeadTrackRecord + knownDirectorGenreRecord + establishedSegmentHistory +
promiseIsSpecific` — none defined. Two defensible schemes with materially different
calibration corpora:
- **(A) Within-run history only:** predicates read this run's releases. Consequence:
  early-run forecasts are almost all low-confidence; high-confidence appears late, if
  ever — the high tier may starve.
- **(B) Static proxies:** fame/skill thresholds. Consequence: confidence never changes
  within a run; tiers are populated from tick 0 but "history" is fiction.

**Recommendation (hybrid):** `knownLeadTrackRecord` = lead.fame ≥ 60 (public knowledge
is static); `knownDirectorGenreRecord` = director has a released film **this run** in
this genre (computable because rev. 4 adds `conceptId`/`directorId` to FilmResult —
see B12; genre = `concepts[conceptId].genre`); `establishedSegmentHistory` = a prior
release this run scored ≥ 60 with that segment; `promiseIsSpecific` =
specificity(promise) ≥ 0.5.

**DECIDED (owner, 2026-07-25): APPROVED**, with one addition: the M0A report **must
include the distribution of confidence tiers across the corpus** (counts and shares
of forecasts per tier). A tier holding a trivially small sample gets its calibration
figure marked LOW SAMPLE — if 90% of forecasts land in "low", the high band's number
is noise, not a result. (Folded into M8 and N8 below.)

### D-4 (= B20) — Craft hiring: in or out of the M0A action space
`CANDIDATE_CONFIG` has writer/director/actor dimensions only. As written, agents never
hire craft → `technical` is the constant 40 in every M0A run, so 15% of the craft
formula and the budget/technical interplay go untested. Two defensible answers:
- **(A) As written:** craft is M1A player texture; M0A reports `technical` as
  unexercised surface.
- **(B) Add a dimension:** `craftLevel ∈ {0, 2, 4}` hires sampled from the craft pool,
  making technical vary at the cost of a bigger grid.

**Recommendation:** (A) — the contract's grid is explicit, and no §14 flag reads
technical. The M0A report will state the limitation.

**DECIDED (owner, 2026-07-25): APPROVED (A)**, with the limitation named explicitly
in the report, verbatim requirement: *technical is pinned at 40 in every M0A run, so
craft's 15% technical weight is untested and the remaining four weights
(script/director/cast/budget) are effectively validated at rescaled proportions
(0.30/0.25/0.20/0.10 of a 0.85 active mass). Craft weights will need re-validation
when craft hiring arrives in M1A.* (Folded into N8.)

### D-5 (= B6) — Segment taste table: TUNING data, not a frozen table

**DECIDED (owner, 2026-07-25):** the table moves into TUNING as `SEGMENT_TASTES` —
twelve numbers the tuning loop may adjust if instrumentation shows two segments
co-moving, without a contract revision. (This is the explicit owner say-so that
widens the tuning surface beyond original §16 for this table.)

**Proposed starting values** (signs forced by §4 affinities; magnitudes chosen for
separation) — (intimacy, tonalWeight, kineticEnergy):

| segment | i | t | k |
|---|---|---|---|
| youngAdult | −0.45 | −0.30 | +0.75 |
| family | +0.55 | −0.55 | +0.20 |
| adult | −0.20 | +0.45 | −0.15 |
| prestige | +0.40 | +0.70 | −0.40 |

(Adult was moved off the earlier near-center (+0.10, +0.30, 0.00) to a distinctive
direction matching its §4 affinity shapes — mysteryHook (−0.2, +0.5, −0.1) at
adult +7 is nearly this exact vector — which fixes the two defects the owner's
checks target; see below.)

**The six pairwise distances** (max possible √12 ≈ 3.464; segmentFit separation for
any film is bounded by distance/3.464 × 100 fit points):

| pair | distance | max fit divergence |
|---|---|---|
| adult–prestige | **0.696** | ~20 pts |
| youngAdult–family | 1.168 | ~34 pts |
| youngAdult–adult | 1.198 | ~35 pts |
| family–adult | 1.298 | ~37 pts |
| family–prestige | 1.395 | ~40 pts |
| youngAdult–prestige | 1.745 | ~50 pts |

**Check 1 — no two segments are one segment wearing two hats.** The closest pair is
adult–prestige at 0.696 (both "serious" audiences, split mainly on intimacy and
warmth of tone). That is 20% of the maximum possible separation — enough for films to
diverge by up to ~20 fit points between them — and it is the pair the tuning loop
watches first: if instrumentation shows their appeal co-moving, `SEGMENT_TASTES` is
now legal to adjust. Every other pair exceeds 1.16 (≥ 34 fit points of divergence).

**Check 2 — no single point is near-optimal for all four.** The point closest to all
four tastes (their centroid, (0.075, 0.075, 0.10)) achieves segmentFit of only
**74 / 77 / 85 / 75** (yA / family / adult / prestige) versus the **100** a targeted
film achieves for its own segment — a play-to-the-middle film gives up 15–26 fit
points with every single audience. No one-film-type-wins-everywhere point exists in
this geometry. (The residual truth that a central film's *share-weighted average* fit
beats a targeted film's average is Jensen's inequality and unavoidable in any
geometry; what matters is that §5.5's convex appealCurve rewards the targeted film's
peak, and the per-segment gap above is what the four-quadrant and dominance
instrumentation will surface if the middle ever dominates in practice.)

---

### D-6 — Standing Channel Revision (owner ruling, 2026-07-26) — supersedes the §6 standing delta formulas ONLY

**Why the prior §6 was superseded.** The M0A study (baseline commit `81ee613`) BLOCKED
on the D-2 standing-differentiation gate. Two structural causes, both proven and both
outside the tuning surface: (a) the prior §6 keyed BOTH `awarenessDelta` and
`confidenceDelta` off one shared `commercialSurprise` (realized-vs-forecast box office),
collapsing those two channels into one dimension (corpus M6 |r| ≈ 0.99); and (b)
`prestigeDelta = (criticScore − 60)/8` anchored prestige to a fixed criticScore of 60
that the corpus reaches above ~p90 — so prestige only ever fell (baseline prestige-high
rate ≈ 0%). Only 2 of 4 asymmetric profiles occurred. This ruling redefines the three
channels by MEANING and drives each from an ABSOLUTE realized quantity (not forecast
surprise) so they move on genuinely different causes — which §6's own text already
demanded ("the three channels must move on different causes — that is the point"). The
rest of §6 (INITIAL_STANDING 40/40/50, the [0,100] channel clamps, the per-release
delta-then-clamp shape) is unchanged.

**Channel meanings (SETTLED product decisions):**
- **Audience Awareness = how visible / culturally noticeable the studio is.** PRIMARY
  driver: absolute audience REACH (box-office relative to the available market).
  SECONDARY: star attention. It must NOT primarily measure forecast surprise.
- **Industry Prestige = how artistically / critically respected the studio is.** SOLE
  driver: absolute critical achievement (realized criticScore vs a REACHABLE neutral
  benchmark). It must NOT be driven by box office, profit, star fame, or forecast surprise.
- **Commercial Confidence = how strongly financiers trust the studio to deploy money.**
  PRIMARY drivers: realized ROI on committed cost, and budget discipline. It must NOT
  primarily measure absolute reach and must NOT reuse the awareness/commercial-surprise signal.

**Exact final formulas** (`updateStanding(standing, r, b, ctx)`; each delta clamped to
its channel cap; each channel value clamped [0,100]; `b`/`ReleaseBenchmarks` is RETAINED
in the signature but DORMANT — the old forecast-surprise term is deleted):
- `reach = clamp(r.boxOffice.total / max(baseMarketValue, 1) / AWARENESS_REACH_SCALE, 0, 1)`
- `starAttention = clamp(mean(cast fame)/100, 0, 1)`
- **`awarenessDelta = clamp(AWARENESS_REACH_WEIGHT·(reach − AWARENESS_REACH_NEUTRAL) + AWARENESS_STAR_WEIGHT·starAttention, −AWARENESS_DELTA_CAP, +AWARENESS_DELTA_CAP)`** — the NEUTRAL offset lets a low-reach film contribute a negative delta so awareness can stay low.
- **`prestigeDelta = clamp((r.criticScore − PRESTIGE_CRITIC_BENCHMARK)/PRESTIGE_CRITIC_SCALE, −PRESTIGE_DELTA_CAP, +PRESTIGE_DELTA_CAP)`** — BENCHMARK is reachable (near the corpus criticScore median).
- `committedCost = actualNegative + marketing + salaries`; `cost = max(committedCost, CONFIDENCE_COST_FLOOR)`; `roi = (r.boxOffice.total − committedCost)/cost`; `roiSignal = clamp(roi / CONFIDENCE_ROI_SCALE, −1, +1)`; `budgetOverrun = clamp((actualNegative − requiredNegative)/max(requiredNegative,1), 0, 1)`
- **`confidenceDelta = clamp(CONFIDENCE_ROI_WEIGHT·roiSignal − CONFIDENCE_DISCIPLINE_WEIGHT·budgetOverrun, −CONFIDENCE_DELTA_CAP, +CONFIDENCE_DELTA_CAP)`** — no reach term; does not reuse the awareness signal.

**New TUNING constants** (all normalized against the STEP-1 per-release corpus, 200
seeds × 2 agents; evidence `out/d6/step1-releases.jsonl`): `AWARENESS_REACH_SCALE 0.9`
(≈ p90 reach = "fully visible"), `AWARENESS_REACH_NEUTRAL 0.58` (normalized-reach pivot),
`AWARENESS_REACH_WEIGHT 7`, `AWARENESS_STAR_WEIGHT 1.2`, `AWARENESS_DELTA_CAP 6`;
`PRESTIGE_CRITIC_BENCHMARK 45` (≈ criticScore median), `PRESTIGE_CRITIC_SCALE 1.2`,
`PRESTIGE_DELTA_CAP 10`; `CONFIDENCE_ROI_SCALE 5` (≈ Oracle median ROI), `CONFIDENCE_ROI_WEIGHT 4`,
`CONFIDENCE_DISCIPLINE_WEIGHT 4`, `CONFIDENCE_COST_FLOOR 500_000` (ROI-denominator guard),
`CONFIDENCE_DELTA_CAP 5`. These are tuning values the loop may adjust; formulas, caps'
existence, and the D-2 gate are fixed.

**Normalization rules.** reach and roiSignal are normalized into fixed ranges before
weighting (reach ∈ [0,1], roiSignal ∈ [−1,+1]); star attention ∈ [0,1]; budgetOverrun ∈
[0,1]. Every constant carries units/normalization (see the `TUNING` comments).

**Allowed delta caps.** Per-release: awareness ±6, prestige ±10, confidence ±5 (named
TUNING caps). Chosen so a channel can reach ≥60 from its start over ten releases AND
fall to ≤40 — both D-2 extremes reachable.

**Required inputs (B12 ephemeral release context, `StandingContext`).** Existing:
`castFames`, `actualNegative`, `requiredNegative`. Added (all already-existing values
captured at release, dropped at tick end — GameState/SaveFileV1 UNCHANGED):
`baseMarketValue`, `marketing`, `salaries` (Σ writer+director+cast salaries).

**The D-2 gate is UNCHANGED** — end-of-run, high ≥60 / low ≤40, the four named
asymmetric profiles, ≥5% occurrence pooled across both agents, HARD FAIL if fewer than
3 of 4. Under D-6 the gate PASSES with profiles A/B/C (6.75% / 6.95% / 24.1%); profile D
(confidence-low & awareness-high) remains sub-5% for arithmetic reasons — D-1's economy
is almost always profitable, so confidence rarely falls — which D-2's own reachability
ruling routes to the owner rather than being tuned around. Making D reachable would
require a confidence baseline term (reward ROI only ABOVE an expected return); that is a
further owner decision, not adopted here.

---

## §2 PROPOSED RESOLUTIONS (skim and rubber-stamp)

### A. Time and the run

- **B1 — Run/year/tick.** One tick = one week; `TICKS_PER_YEAR = 52` (TUNING); a run =
  one full-year trajectory, tick 0 → 52; "thousands of isolated film decisions" is the
  across-runs aggregate. At year end the run simply stops; still-active productions
  remain in state, reported as unfinished, excluded from flag statistics.
  *Why:* §14's standing flags need multi-release trajectories; weekly ticks match
  "opening" and "legs" semantics.
- **B2 — Production duration.** `PRODUCTION_TICKS = 8` (TUNING), fixed; `remainingTicks`
  initialized to it at greenlight. *Why:* nothing in the contract varies duration;
  with B3's concurrency 2 this yields **10 releases/year** (slot cycle is 9 ticks —
  release during t + 8, slot re-greenlit at t + 9 — two staggered slots → releases at
  ticks 8, 9, 17, 18, … 44, 45, plus two unfinished at year end), ample signal for
  §6/§14.
- **B3 — Cadence and concurrency.** Agents are invoked every tick; at most one
  greenlight per tick; greenlight valid only while `activeProductions.length <
  MAX_CONCURRENT_PRODUCTIONS = 2` (TUNING). All 30 concepts are available at every
  decision (rev. 3's reference semantics permit reuse). *Why:* smallest rule set that
  makes decisions comparable across ticks and runs.
- **M1 — Clock conventions.** `market.tick` increments as the final step of `tick()`;
  during a tick's pipeline, currentTick = `state.market.tick`. `startTick` = tick at
  which the greenlight is applied. PRODUCTION advances only productions with
  `startTick < currentTick` — a film does not advance during its greenlight tick —
  decrementing `remainingTicks` by 1; RELEASE collects those at 0, so a film greenlit
  at t releases during tick t + PRODUCTION_TICKS exactly. `releaseTick` stamped at
  RELEASE; `forecastSnapshot` computed inside `applyActions` at greenlight, its noise
  drawn from the forecast stream (M9). *Why:* the skip-first-tick rule is what makes
  the release arithmetic land on t + PRODUCTION_TICKS rather than t + PRODUCTION_TICKS
  − 1; every alternative is an off-by-one of this one.
- **N5 — Same-tick multi-release order.** Resolve and apply standing updates in
  ascending `productionId` order. *Why:* any fixed order works; this one is
  deterministic and observable.

### B. Money mechanics (details under D-1's model)

- **M2 — actualNegative and the overrun tension.** `actualNegative =
  production.budget.negative`. The §5.1 adequacy cap (rewards up to 1.15×) coexisting
  with the §6 overrun penalty (> 1.0×) is intended design — lavish budgets buy craft
  and worry backers. Implement both as written. *Why:* the two formulas are verbatim
  and not in conflict; they price the same choice differently on different channels.
- **M3 — NEGATIVE_BUDGET_MULTIPLIERS base.** `budget.negative = multiplier ×
  requiredNegative` (i.e. after shape's budgetDemandMultiplier and era.costScale).
  *Why:* makes the three levels mean under/at/over-funding the film as designed —
  budgetAdequacy becomes exactly 65.2 / 87.0 / 100.
- **M15 — Cancel semantics.** `cancel` is valid only for an active production; the
  production is removed; already-committed money stays spent (no refund); no standing
  effect. Note: neither §13 agent ever emits cancel, so in M0A this is validation
  surface only. *Why:* simplest rule; any refund curve would be invented balance.
- **M16 — Talent exclusivity and validation.** A talent may occupy at most one role in
  one active production at a time; candidate generation excludes busy talent; no person
  fills two slots of the same film; role-type matching is enforced (`writerId` must be
  role 'writer', `directorId` 'director', cast slots 'actor', `craftIds` 'craft').
  These are the concrete rules behind §3's "validates". Invalid actions are rejected
  loudly (run aborts in the harness — a bug, not a game event). *Why:* minimal rules
  that make the candidate grid well-defined; salary "per production" implies engagement
  for the production's duration.

### C. World generation

- **B6 — Segment taste table.** Resolved by **D-5** (owner-decided): the table lives
  in TUNING as `SEGMENT_TASTES`; starting values and separation analysis in D-5.
- **B7 — salaryCurve.** `salary = SALARY_BASE + SALARY_SKILL_COEF·(skill/100)² +
  SALARY_FAME_COEF·(fame/100)²` with TUNING values 25_000 / 150_000 / 600_000
  (range ≈ 25k–775k per production). *Why:* fame-dominant, convex pricing — stars cost
  disproportionately; quiet skill is cheap — matching §10's scarcity logic.
- **B8 — baseNegativeCost.** `~ truncatedNormal(4_500_000, 1_500_000, 2_000_000,
  9_000_000)`. *Why:* matches §9's house distribution style; strictly positive
  (N4's guard becomes belt-and-braces); scaled so a typical film can profit against
  20–80M market values without profit being automatic.
- **B9 — Role distribution.** 60 talent = 12 writers, 10 directors, 28 actors,
  10 craft. *Why:* pools comfortably exceed CANDIDATE_CONFIG's 5/5/8-per-slot sampling;
  actors largest because three cast slots and the diversity flag draw on them.
- **B10 / N1 — Era.** `{ soundRequired: true, televisionCompetition: false, censorship:
  'none', costScale: 1.0 }`. The three non-costScale fields are inert data in this
  contract (no mechanics exist for them). *Why:* neutral era; costScale 1.0 makes
  requiredNegative = baseNegativeCost × shape multiplier.
- **B11 — requiredSlots.** Always all three: every concept gets `requiredSlots =
  ['lead','antagonist','support']`; the field is retained for later contracts; every
  fixed-denominator formula (castExecution, starDraw, the six-contributor set) stands
  as written. *Why:* all §5 formulas and §15.3/§15.5 assume exactly three slots; subset
  support would rewrite half the reception pipeline against the contract's text.
- **M4 — Genre.** `concept.genre ~ uniform` over the six genres; validation requires
  `promise.genre === concept.genre`; genre is otherwise inert in phases 1–4 (it feeds
  only D-3's director-genre predicate, if adopted). *Why:* uniform is the only
  non-invented distribution; the equality constraint keeps the promise honest.
- **N2 — Names and titles.** Generated from bundled word-lists (tuning data files)
  drawn on the worldgen substream — deterministic, replay-stable, cosmetic. *Why:*
  §15.7 byte-identity requires determinism; content is flavor only.
- **N3 — Worldgen initials.** `tick = 0`; `activeProductions`, `releasedFilms`,
  `broadcastItems`, `coverageContexts`, `competingSlate` all `[]`; generated talent
  `authored = false`. *Why:* the only defaults consistent with §2.5/§5.5/§10.

### D. Reception details

- **M5 — Contributor vectors.** Writer and director contribute
  `personaToExpression(t.actual)`; shape contributes `shapeEffects.expression`; cast per
  SLOT_TRANSFORM (as written); `expressiveStrength` averages the magnitudes of all six
  contributions. `perceived` is dormant data in this contract — carried, never read
  (it belongs to later contracts). *Why:* §5.1's roleFit already establishes `actual`
  as the performance-relevant persona; §2.1 maps persona→expression identically for
  all people.
- **N4 — budgetAdequacy guard.** Use `max(requiredNegative, 1)` in the denominator,
  mirroring §6's own guard. *Why:* removes the contract's only unguarded division;
  moot in practice under B8/B10 but §15.3's "no NaN anywhere" makes it cheap insurance.

### E. Standing

- **B12 — updateStanding data flow.** At RELEASE the production is removed from
  `activeProductions` and threaded through the rest of the tick as a release context
  `{production, castTalent, forecastSnapshot, and the §5 intermediates mismatchPenalty
  / timelinessContribution / awarenessFactor}`; RECEPTION produces the FilmResult;
  STANDING calls `updateStanding(standing, r, b, ctx)` — the rev. 4 signature gains the
  context parameter; benchmarks derive from `forecastSnapshot` (as written). The
  context stays available through BROADCAST (step 5, which consumes it per B23/B24)
  and is dropped at tick end; `releasedFilms` keeps FilmResult only. Rev. 4 adds two
  fields to FilmResult — `conceptId` and `directorId` — so released films stay
  attributable after the Production is gone (D-3's director-genre predicate needs
  them). *Why:* smallest change that makes §6, §8, and D-3 all computable; everything
  else about FilmResult's declared shape is untouched.
- **M6 — Standing correlation.** Pearson correlation over per-release delta triples
  (awarenessDelta, prestigeDelta, confidenceDelta), pooled across all releases in the
  corpus, computed per agent; warn if any pairwise |r| > 0.9. *Why:* levels are
  integrals and correlate trivially; deltas measure whether the channels move on
  different causes, which §6 says is the point.

### F. Forecast

- **B14 — ForecastFactorKey.** `'castFame' | 'roleFit' | 'directorSkill' |
  'scriptStrength' | 'shapeAffinity' | 'segmentTaste' | 'culturalTiming' |
  'unknownLead' | 'untestedDirectorGenre' | 'noSegmentHistory' | 'vaguePromise'`.
  `causalFactors` = up to two keys, chosen by fixed thresholds in fixed precedence
  order: `castFame` if starDraw ≥ 60; `roleFit` if the CAST_WEIGHT-weighted mean
  roleFit ≥ 0.7; `directorSkill` if director.skill ≥ 70; `scriptStrength` if
  scriptStrength ≥ 65; `segmentTaste` if segmentFit(s) ≥ 70; `shapeAffinity` if
  shapeEffects.segmentAffinity[s] ≥ 6; `culturalTiming` if timelinessContribution ≥ 5
  — take the first two that fire (zero or one is valid). The promise term is
  subtractive and has no causal key. `uncertaintyFactors` = the keys of the failed
  confidence predicates (`unknownLead`, `untestedDirectorGenre`, `noSegmentHistory`,
  `vaguePromise`). *Why:* threshold rules over film-level scalars the pipeline already
  computes — arithmetic, not judgment, with no contribution-decomposition scheme to
  invent.
- **B16 — The expected pipeline.** `expectedSegmentAppealAtGreenlight` = the §5
  pipeline run at greenlight with sampled terms removed: `criticScore := criticMean`;
  segment appeals as computed (already deterministic); standing = current standing;
  `expectedCriticScore = criticMean`. `expectedOpening`/`expectedTotal` = §5.5 applied
  to the **noisy** per-segment estimates — so §6's surprise measures reality against
  the studio's stated expectation, which is why benchmarks come from the snapshot.
  The estimate is clamped before that pass — `estimate_s = clamp(center_s + offset,
  0, 100)` — because an unclamped negative estimate would hit `pow(negative, 1.8)` =
  NaN in appealCurve, violating §15.3.
  *Why:* the §7 comment specifies exactly this ("uses the §5 pipeline with no sampled
  terms"); routing the noise into the totals is what makes commercialSurprise nonzero.
- **M7 — Forecast assembly.** One gaussian offset drawn per forecast (film-level, from
  the forecast stream, M9), added to every segment center: `estimate_s =
  clamp(center_s + offset, 0, 100)`, stored on SegmentForecast as a new `estimate`
  field (B23 consumes it; midpoint-of-[low,high] reconstruction is lossy at the 0/100
  edges); `low/high = estimate_s ∓ width`, clamped 0..100 as written; `expectedBand`
  from `estimate_s` (the studio's belief); `confidence` is film-level, stamped
  identically on each SegmentForecast. *Why:* one studio, one belief-error;
  per-segment independent noise would let errors cancel in expectedTotal and dilute
  §6's surprise.
- **M8 — Calibration measurement.** Population = every SegmentForecast of every
  released film in the corpus, both agents pooled, grouped by confidence tier;
  `realizedSegmentScore = r.segmentScores[segmentId]`; coverage = fraction inside
  [low, high]; bands per B17 (high 80–90, medium 65–75, low 55–65). Per D-3, the
  report includes the tier distribution (counts and shares of forecasts per
  confidence tier); a tier holding under 5% of the corpus gets its calibration figure
  marked LOW SAMPLE. *Why:* the calibration test (§7) is stated per segment; pooling
  both agents matches the flag's "Both"; a starved tier's coverage number is noise.

### G. Agents and the decision grid

- **B18 / B19 — Candidate package and enumeration.** A package =
  `{conceptId, writerId, directorId, cast (all three slots), shape, promise,
  negativeLevel, marketingLevel}`. Per decision, from the candidate substream: sample
  5 writers, 5 directors, 8 actors per slot (from eligible, non-busy talent), 6 of the
  36 shapes, and 8 promises — each promise built per-axis from the §13 grids (center
  and width sampled per axis, `rangeFrom` applied). Take the cross product of concepts ×
  those samples × 3 negative levels × 3 marketing levels; at construction set
  `promise.genre = concept.genre` (M4) and `intendedSegments` per B21, and drop any
  package assigning the same actor to more than one slot (M16 — the independent
  per-slot samples can overlap). Uniform-sample the remainder down to
  `maxPackagesPerDecision = 500` **without replacement** (500 distinct packages);
  both agents receive the identical 500. Disclosed: the pre-sample space is ~10⁸, so
  the 500 are sparse by design — that is §13's own cap, and B25/B26 are defined over
  these sampled sets. *Why:* respects every §13 constant; per-axis promises are the
  only reading that makes 3-axis promises meaningful; seeded sampling keeps both
  agents comparable and replays exact.
- **B21 — intendedSegments.** Populated as `[argmax_s expectedSegmentAppeal]` at
  package construction (single segment, metadata); `Forecast.segments` always covers
  all four segments; nothing else consumes the field in this contract. *Why:* keeps
  the calibration population well-defined (all segments) and fills the required field
  with its evident meaning at zero mechanical risk.
- **M9 — Agent and candidate RNG.** Four named streams derived from the run seed: the
  sim stream (threaded through `state.rngState` as written, carrying **only
  reception-time sampling** — the §5.3 critic draw), plus stateless derived streams
  `stream(seed, 'candidates', tick)`, `stream(seed, 'agent', tick)`, and
  `stream(seed, 'forecast', productionId)` for the §7 forecast gaussian. *Why:*
  `chooseActions` returns only actions and cannot thread rngState; derived streams are
  deterministic, save-free, and replay-exact; isolating the forecast draw from the sim
  stream is what makes §15.6's forecast-independence test hold regardless of how many
  releases precede a greenlight.
- **N6 — Oracle scope vs §14.** The §14 Agent column governs which corpus feeds which
  flag; §13's "dominance and concentration only" describes the Oracle's design purpose,
  not a data restriction. *Why:* the alternative leaves the dead-state flag with no
  producing agent.
- **N7 — "Oracle-optimal".** The argmax package actually chosen at each Oracle
  decision; the authored-talent row is effectively Oracle-fed (Random reported
  alongside for context). *Why:* argmax is the only set §13's Oracle definition
  singles out.

### H. Broadcast (phase-4 minimal core)

- **B22 — Item generation.** Phases 1–4 generate release-topic candidates only: one
  candidate BroadcastItem per released film, at its release tick. The talent/studio/
  cultural relevance branches are implemented but unreachable, documented as such.
  *Why:* nothing in phases 1–4 produces the other topics' events; §8 needs only the
  two release templates.
- **B23 — BroadcastFacts derivation.** `forecastBand` = band(Σ share · snapshot
  `estimate_s`) using the stored per-segment estimates (M7); `realizedBand` =
  band(realized weightedAudienceScore); bands use §7's thresholds (<40 / 40–70 / >70)
  — coherent reuse, since both quantities are convex combinations of 0–100 segment
  scores. `direction` = better/worse/asExpected by band comparison (threshold-free).
  Items with direction `asExpected` do not air in phases 1–4: the two-template
  contract covers better/worse only, and exclusion at selection is deterministic, so
  §15.7 replay is unaffected. `primaryCause` by fixed precedence: 'promise' if
  mismatchPenalty ≥ 6, else 'cohesion' if cohesion < COHESION_SMOOTH_LO, else 'timing'
  if |timelinessContribution| ≥ 5, else 'reach' if awarenessFactor < 0.35, else
  'craft'. `subjectId = filmId = productionId`. All inputs (forecastSnapshot,
  mismatchPenalty, timelinessContribution, awarenessFactor, cohesion) reach BROADCAST
  via B12's release context. *Why:* every rule is computable from quantities the
  pipeline exposes at step 5; band-level direction avoids inventing a points
  threshold.
- **B24 — Ranking-factor inputs.** For release items: `magnitude` compares realized
  weightedAudienceScore against the forecast center (weighted mean of pre-noise
  segment centers — §8 says "forecastCenter", the deterministic quantity);
  `prominence` = lead fame / 100; novelty's "matching" = same topic among aired items
  in the window; `mentionsInWindow` = aired items with the same subjectId in the
  window. *Why:* literal readings where the text names a quantity; aired-only windows
  because unaired candidates were never "coverage".
- **M10 — Novelty clamp.** `novelty = clamp(1 − matching/BROADCAST_WINDOW, 0, 1)`.
  *Why:* restores the §8 header's "all ranking factors normalize 0..1".

### I. Instrumentation flags, acceptance tests, save

- **B25 — Choice dominance.** An "option" = the strategy signature (shape triple,
  negativeLevel, marketingLevel, sign vector of the promise axis centers); comparable
  decisions = all Oracle greenlight decisions in the corpus; a signature "wins" a
  decision if the chosen package bears it; margin = mean, **over the decisions the
  leading signature won**, of (EV of the chosen package − best EV among that
  decision's candidates bearing any other signature), in D-1's ROI points. Flag if one
  signature wins > 60% with margin > 15. *Why:* full packages
  are unique, so dominance must be measured at the strategy level — the signature is
  the coarsest projection that still names a strategy.
- **B26 — Strategy concentration.** "Promise axis signs" = sign of each axis's range
  midpoint (−/0/+); "budget level" = the (negativeLevel, marketingLevel) pair;
  "top-forecast cast" = the exact cast triple of the highest-expectedTotal package
  among that decision's 500 candidates. Flag if > 70% of Oracle films share all three.
  *Why:* midpoint sign is the only sign a range straddling zero has; the pair reading
  of "budget level" is the stricter and simpler one.
- **B27 — Dead cultural state.** Per run, at tick 0 (INITIAL_STANDING, neutral forces):
  generate 500 packages with the standard candidate generator across concepts, compute
  expected profit for each; the run is "dead" if none ≥ 0. Report the dead-run
  fraction; the flag fires if > 50% of runs are dead. *Why:* tick 0 is the one
  cultural state M0A has (see D-1 sweep, item 4); per-run sampling keeps the statistic
  seeded and reproducible.
- **B28 — Four-quadrants test.** Two parts. **(i) Unit-level**, synthetic contributor
  sets with **every §5.1 input pinned** (shape contribution injected directly with
  craftMod 0, per M12's injection license; budget.negative = requiredNegative →
  budgetAdequacy 87.0; no craft hires → technical 40):
  *uniform+dull* — six aligned vectors (pairwise cosine ≥ 0.9, magnitudes ≈ 0.6), all
  skills 30, baselineStrength 35, roleFit 0.5 all slots → craft ≈ 39.7: assert
  craft ≤ 42 and cohesion ≥ 0.75;
  *uniform+capable* — same vectors, skills 85, baselineStrength 75, roleFit 0.9 →
  craft ≈ 77: assert craft ≥ 72, cohesion ≥ 0.75;
  *talented+contradictory* — skills 85, baselineStrength 75, roleFit 0.9, opposed
  vectors (some pairwise cosine ≤ −0.5) → assert craft ≥ 72, cohesion ≤ 0.35;
  *varied+structured* — scattered cast vectors with strongly aligned director+shape,
  skills 60, baselineStrength 55, roleFit 0.7 → craft ≈ 60: assert craft in 50–68,
  cohesion in 0.45–0.68.
  The assertion ranges are strictly disjoint by construction, and "distinguishable" is
  additionally checked on the concrete constructed values (≥ 10 craft points or ≥ 0.20
  cohesion between every pair). **(ii) Corpus-level:** across the ≥ 1,000 runs, at least one
  released film lands in each cell of (craft ≷ 55) × (cohesion ≷ 0.55). *Why:* the
  labels map onto the craft × cohesion plane the diagnostic clause names ("cohesion
  swallowing craft"); the unit recipes make the cells constructible, the corpus check
  makes them reachable.
- **M11 — Bounds test scope.** Rev. 4 enumerates the bounded-term list explicitly
  (every quantity the contract annotates with a range: roleFit, scriptStrength,
  directorExecution, castExecution, technical, budgetAdequacy, craft, cohesion,
  criticScore, segmentScores, specificity, promiseMismatch, mismatchPenalty, starDraw,
  segmentFit, marketingQuality, baseAwareness, awarenessFactor, openingReachMult,
  legs, all ShapeEffects clamps, standing channels and deltas, forecast low/high,
  distances, safeCosine, forceAlignment, timelinessContribution, criticSigma
  [CRITIC_SIGMA_BASE, CRITIC_SIGMA_BASE + 3], expressiveStrength [0,1],
  directionalAgreement [−1,1], cohesionContribution [0, COHESION_CAP],
  originalityContribution [−DERIVATIVENESS_MAX_PENALTY, ORIGINALITY_MAX_BONUS], and
  the §8 factors incl. M10's novelty clamp). Scope rule: every term with a stated
  **or derivable** finite range is in, minus the exemptions. Explicitly exempt as
  unbounded by design: `criticMean`, `reviewVariance`, and all currency quantities.
  Corpus: both agents' runs. *Why:* makes §15.1 mechanical; the exemptions are the
  contract's own (criticMean is deliberately unclamped per §5.6).
- **M12 — Neutral-stacking test referent.** "Score" = `cohesionContribution`. The test
  is unit-level: construct the six contributions directly, with shape's vector injected
  as `{0,0,0}` (no legal SHAPE_OPTIONS combination produces it — the injection is part
  of the test, not the game); assert `cohesionContribution ≤ COHESION_CAP · 0.5` and no
  NaN anywhere in the full pipeline on those inputs. *Why:* the only reading under
  which the test can pass (centroid magnitude 0 → cohesion 0 → contribution 0 ≤ 8);
  a criticMean/criticScore reading fails for any competent crew since 0.65·craft alone
  exceeds 8 — and §15.3's own "no NaN" clause shows it is a pipeline-integrity test,
  not a scoring claim.
- **M13 — Promise-ordering test metric.** Ordered on `boxOffice.total` (deterministic —
  no sampled term reaches it), three unit cases sharing identical concept, cast, crew,
  shape, and negative budget, with marketing fixed at MARKETING_HALF_SATURATION:
  *precise-and-met* (all widths 0.4, ranges centered on delivered), *vague* (all
  widths 2.0), *precise-and-missed* (widths 0.4, centers displaced 1.2 from
  delivered). Assert strict ordering precise-met > vague > precise-missed. *Why:* on
  segment appeal alone precise-met and vague **tie** — both have zero mismatchPenalty,
  vague because its specificity is 0 — so §15.4's strict ordering is only satisfiable
  on box office, where §5.5's specificity bonus rewards the kept promise: precise-met
  wins on awareness; precise-missed loses more on appeal (≈ −7 points amplified
  through the 1.8-power curve) than its awareness bonus recovers. Verified
  arithmetically.
- **M15/M16** — see section B (money mechanics) above.
- **M17 — Casting diversity scope.** Denominator = the actor pool (28 under B9);
  "cast" = occupying any CastSlot in a released or active production; measured
  **per run**, flag if the median across runs of (actors ever cast / actor pool)
  < 25%. Reported for Random (per the §14 Agent column), with Oracle shown for
  contrast. *Why:* writers/directors/craft cannot be "cast" (M16's role matching);
  per-run measurement is what world regeneration makes meaningful — pooled-across-runs
  "ever" would saturate trivially.
- **N8 — Report medium and seeds.** The M0A report = `M0A-REPORT.md`: one section per
  flag with its rev. 4 definition, measured value, supporting evidence, and verdict,
  plus the §15 results; corpus seeds derived from a master seed as `m0a-0001` …
  `m0a-1000`. Owner-required content (D-3, D-4): the confidence-tier distribution
  table, and the verbatim D-4 technical limitation statement (technical pinned at 40;
  craft weights validated at rescaled proportions; re-validation flagged for M1A).
  *Why:* "not a CSV" wants judgment attached to numbers; derived seeds make the
  corpus reproducible by anyone.
- **N9 — Flag consequences.** Only standing differentiation is a completion-blocking
  hard fail; standing correlation is a warning; the other six flags are report lines
  the owner adjudicates. *Why:* the contract labels exactly two rows; the labels are
  the semantics.
- **N10 — Dangling reference.** §6's "§9's differentiation gate" is a stale pointer;
  rev. 4 reads "§14's differentiation gate." *Why:* §9 contains no gate, and a
  worldgen-time standing gate is incoherent — every world starts at INITIAL_STANDING.
- **N11 — Competition scaffolding.** Types stay as declared; `competitionFactor ≡ 1.0`
  and `competingSlate ≡ []` in both M0A and M1A (same ruleset, §1); nothing produces
  or reads `marketPressure` in this contract. *Why:* §5.5's comment scopes M0A, but
  §11 scopes the whole contract; the types are rev. 3's own declarations, kept inert.
- **M14 — SaveFileV1 duplication.** `broadcastCache ≡ state.broadcastItems`
  (aired items only, per B24's aired-only windows); the envelope `seed` must equal
  `state.seed`; load validation rejects any divergence loudly (same failure mode as an
  unknown saveVersion); §15.7's byte-identity compares the full serialized SaveFileV1.
  *Why:* keeps rev. 3's declared shape while making divergence impossible rather than
  ambiguous.

---

## §3 Recorded refutations (audit-cleared; listed so rev. 4 does not relitigate)

- **Authored talent never enters headless M0A runs** — by construction: agents draw
  only from the candidate grid and never emit `createTalent`. The §14 authored-talent
  flag is reported as "not exercised (by design this contract)"; §10's separate
  reporting shows zero. The createTalent path is still implemented and unit-tested
  (it is contract surface); it is simply unreached by the M0A agents.
- **CoverageContext** is declared but unwired until phase 6 (deliberate deferral).
- **Tuning authority**: the autonomous loop may change exactly the §16 TUNING values
  (plus FORECAST_SIGMA and CONFIDENCE_INTERVAL_WIDTH once B17 moves them in);
  formulas, flag thresholds, and §15 bounds are fixed; final values are reported as
  deviations from the contract's defaults.
- **truncatedNormal** = true truncated sampling (resample until in range), not clamp —
  the contract's own clamp idiom on the adjacent line is the contrast.
- **Prestige anchor 60** and the dormant `expectedCriticScore`/`expectedOpening`
  benchmark fields: verbatim formulas, implemented as written.
- **Broadcast `template`** holds the canonical rendered copy (generatedCopy never in
  this contract).

---

## §4 New TUNING entries introduced by rev. 4

`TICKS_PER_YEAR: 52` · `PRODUCTION_TICKS: 8` · `MAX_CONCURRENT_PRODUCTIONS: 2` ·
`INITIAL_CASH: 20_000_000` · `SALARY_BASE: 25_000` · `SALARY_SKILL_COEF: 150_000` ·
`SALARY_FAME_COEF: 600_000` · `ROI_COST_FLOOR: 500_000` ·
`FORECAST_SIGMA: { high: 5, medium: 10, low: 16 }` (moved in per B17) ·
`CONFIDENCE_INTERVAL_WIDTH: { high: 7, medium: 11, low: 14 }` (moved in per B17) ·
`SEGMENT_TASTES` (per D-5).

**Per D-6 (Standing Channel Revision, 2026-07-26):** `AWARENESS_REACH_SCALE 0.9` ·
`AWARENESS_REACH_NEUTRAL 0.58` · `AWARENESS_REACH_WEIGHT 7` · `AWARENESS_STAR_WEIGHT 1.2` ·
`AWARENESS_DELTA_CAP 6` · `PRESTIGE_CRITIC_BENCHMARK 45` · `PRESTIGE_CRITIC_SCALE 1.2` ·
`PRESTIGE_DELTA_CAP 10` · `CONFIDENCE_ROI_SCALE 5` · `CONFIDENCE_ROI_WEIGHT 4` ·
`CONFIDENCE_DISCIPLINE_WEIGHT 4` · `CONFIDENCE_COST_FLOOR 500_000` · `CONFIDENCE_DELTA_CAP 5`.

---

*Record: D-1 through D-5 decided by the owner 2026-07-25, adjustments recorded
inline. This document is normative alongside `docs/build-contract.md` (rev. 4).
Phase 1 may begin.*
