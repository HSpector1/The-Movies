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


---

# D-9 — Multi-Discipline Talent, OVR, Fit, Potential, Work Ethic, and Development

**Status:** **normative — owner-ratified on 2026-07-26 and IMPLEMENTED** (was drafted as a design ruling in the rev. 4 style: precise formulas, named `TUNING` constants, acceptance tests). Incorporated by reference into `docs/build-contract.md`; where D-9 and prior text conflict on the definition of talent ability, **D-9 wins**. This ruling supersedes the scalar `talent.skill` model everywhere the four §5 reads consume it and everywhere §7/§9/§10/§17 produce it. D-9 shipped as part of the Phase 5.1 talent milestone; the three 2026-07-26 owner rulings that governed how it was implemented are recorded in **D-10** below, and where D-10 amends this text (notably **D-9.15**, overridden by the SaveFileV2 ruling) **D-10 wins**.

**Guardrails the implementation honored.** D-9 changes *what* ability is and *how it is read/produced/grown*. It does **not** touch: the §5 pipeline shape and bounds, persona→expression contributions (M5), box office (§5.5), D-6 standing (`standing.ts` byte-untouched), fame→star power, the D-3 confidence predicates' structure, the sim-stream / derived-stream discipline (M9), or §15 replay exactness. Development adds **one new deterministic seeded step** to `tick`, drawn only from its own derived `'develop'` stream (never the sim RNG). **SaveFileV1 was NOT frozen against a successor:** it stays immutable and readable, but D-9 games save as a new **SaveFileV2** (see D-9.15 as amended by D-10). The official M0A calibration corpus runs with development **OFF** and role-partitioned (D-10.A), so D-6 and the M0A study are preserved.

---

## D-9.0 The one coupling invariant (why every effective-skill quantity is 0–100)

The engine consumes exactly one ability scalar, `talent.skill ∈ [0,100]`, in four §5 places (mirrored in §7's `computeDeterministicCore`):

1. `scriptStrength = 0.6·concept.baselineStrength + 0.4·writer.skill`
2. `directorExecution = director.skill`
3. per cast slot: `0.6·t.skill + 0.4·100·roleFit`
4. `technical = mean(craftHire.skill)` or `40` when no craft hires (D-4)

**D-9 replaces each `t.skill` read with a call to `effectiveSkill(...) ∈ [0,100]`** (D-9.5). Because the substitute stays in `[0,100]` with the same central tendency as the old scalar (guaranteed by the migration in D-9.15 and the generation calibration in D-9.13), the §5 output bounds hold, the M0A §15 bounds tests still pass, and D-6 remains calibrated after a re-tuning pass. **This is the hard invariant every formula below must respect.** OVR, Fit, Expected Performance, Potential, Work Ethic, and Genre Experience are **read-only summaries or development inputs** — the sim never reads them in §5. Only `effectiveSkill`, `roleFit` (unchanged, persona-driven), and `fame` (star power, unchanged) enter reception.

---

## D-9.1 Disciplines and the 24 professional skills

Four disciplines, six skills each, every skill an integer **1–99**, each with a **perceived** and an **actual** value (a real perceived/actual split, exactly as persona already has `actual`/`perceived`). Reception (§5) reads **actual**; forecast (§7) reads **perceived**.

**Skill meanings** (restated concisely from the owner's list; these are documentation, not formulas):

**Acting** (`acting`)
- `actingTechnique` — command of craft: hitting marks, take-to-take consistency, control.
- `emotionalRange` — believable reach across emotional registers.
- `dialogueDelivery` — line readings, rhythm, naturalism of speech.
- `comicTiming` — timing and control of comic beats.
- `physicalPerformance` — body, movement, action, physical characterization.
- `screenPresence` — how much the frame belongs to them. **Not** Star Power: an unknown (low `fame`) can have high `screenPresence`.

**Writing** (`writing`)
- `storyStructure` — architecture: act shape, causality, payoff.
- `characterDevelopment` — dimensional, motivated characters with arcs.
- `dialogue` — line-level writing.
- `originality` — freshness of premise and execution (the *writer's* trait; distinct from `concept.originalityRaw`).
- `narrativePacing` — scene-to-scene momentum.
- `rewriting` — diagnosing and repairing a draft.

**Directing** (`directing`)
- `visualStorytelling` — telling story through image and staging.
- `performanceDirection` — getting performances out of actors.
- `toneControl` — holding a consistent tone.
- `directingPacing` — cutting-room and on-set rhythm.
- `productionManagement` — running the shoot on scope.
- `adaptability` — solving problems as conditions change.

**Craft** (`craft`)
- `cinematography`, `editing`, `productionDesign`, `soundAndMusic`, `effectsExecution`, `technicalCoordination` — the technical departments. Craft **stays a single generic employee this milestone** (D-4: craft hiring is not in the M0A grid; `technical` is pinned at 40 headless), but every craft talent carries all six actual/perceived skills so the mechanism is complete when craft hiring arrives in M1A.

Skill keys are fixed and ordered per discipline exactly as listed above (`SKILL_ORDER`, D-9.16). This order drives every deterministic draw and every weighted mean, so `Object.keys` iteration is stable (same discipline the worldgen force/segment orders already impose).

---

## D-9.2 Role OVR (Actor / Writer / Director / Craft OVR, 1–99)

Every talent has **all four** role OVRs — "current estimate of broad professional ability + versatility in that discipline," computed from **perceived** skills. OVR is a **read-only display summary**. **The sim consumes the underlying skills via `effectiveSkill`, never OVR.**

OVR **excludes**: Fit, temperament, genre experience, star power, salary, availability, work ethic, potential, condition, and the selected film. **OVR does not change when the selected film changes.**

### Formula

For discipline `d` with perceived skills `s₁…s₆` and OVR core-weights `w₁…w₆` (D-9.16, `OVR_WEIGHTS[d]`, `Σwᵢ = 1`):

```
weightedMean(d) = Σ wᵢ·sᵢ                                    // 1..99

// WEAKNESS PENALTY — the worst core skills drag the estimate.
// deficit of skill i below the "no-weak-spot" line:
deficitᵢ    = max(0, OVR_WEAKNESS_KNEE − sᵢ)                  // 0.. (KNEE−1)
weaknessPen = OVR_WEAKNESS_COEF · sqrt( Σ wᵢ·deficitᵢ² )      // RMS, core-weighted

// BREADTH REQUIREMENT — reward covering all six; a two-trick pony is penalized.
// breadth = fraction of core skills at or above the breadth floor, core-weighted.
breadth     = Σ wᵢ·[ sᵢ ≥ OVR_BREADTH_FLOOR ]                 // 0..1
breadthPen  = OVR_BREADTH_COEF · (1 − breadth)                // 0..OVR_BREADTH_COEF

raw(d)      = weightedMean(d) − weaknessPen − breadthPen

// UPPER-TIER GATES — a displayed 99 is unreachable without genuine mastery
// AND no weak core skill; rounding alone cannot make a 99.
ovr(d)      = clamp( floor( applyGates(raw(d)) ), 1, 99 )
```

**`applyGates(x)`** enforces the ceiling structure:

```
minCore = min over core skills of sᵢ            // weakest core perceived skill
gate =  99  if weightedMean ≥ OVR_GATE_99_MEAN (98)  AND minCore ≥ OVR_GATE_99_MINCORE (94)
        95  else if weightedMean ≥ OVR_GATE_95_MEAN (93) AND minCore ≥ OVR_GATE_95_MINCORE (88)
        94  else  // hard cap below the elite gate
applyGates(x) = min(x, gate)
```

So:
- A displayed **99** requires core-weighted mean ≥ **98** *and* no core skill below **94** — exactly the owner's rule.
- One or two elite skills with a real weakness elsewhere pushes `weaknessPen` up and `minCore` down, capping the display at **94 (Elite)** — a **specialist**, not a 99. The person can still be devastating on a *matching* film (via `effectiveSkill`, D-9.5), but their broad OVR reads Elite, not Generational.
- Because `ovr = floor(...)` after the gate and the gate is a hard `min`, **rounding alone cannot cross 99** — `raw` must genuinely reach ≥ 99 pre-floor *and* pass the mean+minCore gate.

`OVR_WEAKNESS_KNEE`, the two gate mean/minCore pairs, and the coefficients are named constants (D-9.16), so the shape is tunable but never inlined.

### Player-facing tier labels (display only)

`95–99 Generational · 90–94 Elite · 80–89 Major-studio · 70–79 Strong · 60–69 Limited-or-developing · 50–59 Raw prospect · <50 Highly unproven.`

Function: `roleOVR(talent, discipline): number` and `roleTier(ovr): string`.

---

## D-9.3 Project-relevant skill weighting (the mechanism that makes specialists outperform)

This is the load-bearing new mechanism. Given a concept (genre, shape, promise) and — for actors — the cast slot, we derive a **project weight vector** over a discipline's six skills. A specialist whose *elite* skill is the *project-relevant* one gets a high **effective** skill for **that** project even at a lower OVR. **No hidden flat specialty bonus exists** — the advantage is fully traceable to (real skills × project weights) + temperament roleFit + genre experience.

### Base per-genre profiles

For each discipline `d` and genre `g`, `GENRE_SKILL_WEIGHTS[d][g]` is a non-negative 6-vector over that discipline's skills (D-9.16). Weights need not sum to 1; they are normalized at use (`Σ = 1` after normalization). The profiles encode which skills a genre leans on. Concrete starting profiles (unnormalized relative weights, in `SKILL_ORDER`):

**Acting** `[actingTechnique, emotionalRange, dialogueDelivery, comicTiming, physicalPerformance, screenPresence]`

| genre | tech | emo | dlg | comic | phys | presence |
|---|---|---|---|---|---|---|
| comedy | 1.0 | 0.8 | 1.2 | **2.0** | 0.7 | 1.1 |
| drama | 1.2 | **2.0** | 1.4 | 0.4 | 0.6 | 1.2 |
| crime | 1.3 | 1.2 | 1.1 | 0.4 | 1.0 | 1.4 |
| romance | 1.0 | **1.8** | 1.3 | 0.8 | 0.6 | 1.3 |
| horror | 1.1 | 1.3 | 0.7 | 0.3 | **1.6** | 1.2 |
| adventure | 1.0 | 0.8 | 0.8 | 0.6 | **1.9** | 1.4 |

**Writing** `[storyStructure, characterDevelopment, dialogue, originality, narrativePacing, rewriting]`

| genre | struct | char | dlg | orig | pacing | rewrite |
|---|---|---|---|---|---|---|
| comedy | 1.0 | 1.1 | **1.9** | 1.3 | 1.4 | 1.0 |
| drama | 1.4 | **1.9** | 1.4 | 1.1 | 1.0 | 1.1 |
| crime | **1.8** | 1.2 | 1.1 | 1.2 | 1.5 | 1.1 |
| romance | 1.1 | **1.8** | 1.5 | 1.0 | 1.1 | 1.0 |
| horror | 1.3 | 1.0 | 0.8 | 1.4 | **1.8** | 1.1 |
| adventure | **1.7** | 1.0 | 0.9 | 1.3 | 1.5 | 1.0 |

**Directing** `[visualStorytelling, performanceDirection, toneControl, directingPacing, productionManagement, adaptability]`

| genre | visual | perfDir | tone | pacing | prodMgmt | adapt |
|---|---|---|---|---|---|---|
| comedy | 1.0 | 1.5 | 1.3 | **1.8** | 0.9 | 1.1 |
| drama | 1.2 | **1.9** | 1.5 | 1.0 | 0.9 | 1.0 |
| crime | 1.4 | 1.3 | **1.7** | 1.3 | 1.0 | 1.0 |
| romance | 1.1 | **1.8** | 1.5 | 1.0 | 0.9 | 1.0 |
| horror | 1.5 | 1.2 | **1.8** | 1.4 | 0.9 | 1.1 |
| adventure | **1.7** | 1.0 | 1.1 | 1.3 | **1.5** | 1.3 |

**Craft** `[cinematography, editing, productionDesign, soundAndMusic, effectsExecution, technicalCoordination]` — craft is inert headless (D-4); a single balanced profile per genre suffices this milestone. Starting value: all six weights `1.0` for every genre (`CRAFT_GENRE_UNIFORM`), with `effectsExecution` raised to `1.6` for `horror`/`adventure` (spectacle-leaning). Fully specified so M1A inherits a real table, not a stub.

### Shape / promise / slot modifiers (multiplicative, bounded)

After the base genre profile, apply bounded multiplicative modifiers so *this exact film* re-weights within the genre. All modifiers are named constants; the composite modifier per skill is clamped to `[1/PROJECT_MOD_CLAMP, PROJECT_MOD_CLAMP]` (`PROJECT_MOD_CLAMP = 1.6`) so no film can erase a genre's core dimension.

- **Shape → skill nudges** (`SHAPE_SKILL_MODS`): the FilmShape drives a small set of skill emphases. Examples (multipliers applied to the named skill, all disciplines' relevant skill):
  - `opening = 'immediateAction'` → +physical/pacing emphasis: `physicalPerformance ×1.25`, `directingPacing ×1.2`, `narrativePacing ×1.2`.
  - `opening = 'slowSetup'` → `emotionalRange ×1.15`, `characterDevelopment ×1.2`, `toneControl ×1.15`.
  - `opening = 'mysteryHook'` → `storyStructure ×1.2`, `visualStorytelling ×1.15`.
  - `midpoint = 'reversal'` → `storyStructure ×1.2`, `rewriting ×1.15`.
  - `midpoint = 'escalation'` → `physicalPerformance ×1.15`, `directingPacing ×1.15`.
  - `midpoint = 'revelation'` → `emotionalRange ×1.15`, `performanceDirection ×1.15`.
  - `ending ∈ {tragic, bittersweet}` → `emotionalRange ×1.2`, `toneControl ×1.2`, `characterDevelopment ×1.15`.
  - `ending = 'triumph'` → `physicalPerformance ×1.1`, `narrativePacing ×1.1`.
  - `ending = 'ambiguous'` → `toneControl ×1.2`, `originality ×1.15`.
- **Promise → skill nudges** (`PROMISE_SKILL_MODS`): the promise range midpoints signal emphasis. Let `tMid = midpoint(promise.ranges.tonalWeight)`, `kMid = midpoint(promise.ranges.kineticEnergy)`, `iMid = midpoint(promise.ranges.intimacy)`.
  - `tMid ≥ +0.4` (serious) → `emotionalRange ×1.15`, `toneControl ×1.15`, `characterDevelopment ×1.1`.
  - `tMid ≤ −0.4` (light) → `comicTiming ×1.2`, `dialogue ×1.1`.
  - `kMid ≥ +0.4` (kinetic) → `physicalPerformance ×1.2`, `visualStorytelling ×1.15`, `directingPacing ×1.15`.
  - `iMid ≥ +0.4` (intimate) → `emotionalRange ×1.1`, `dialogueDelivery ×1.1`, `performanceDirection ×1.1`.
  - `specificity(promise) ≥ 0.5` → `toneControl ×1.1`, `storyStructure ×1.05` (a precise promise rewards tonal/structural control).
- **Cast slot → skill nudges** (actors only, `SLOT_SKILL_MODS`):
  - `lead` → `emotionalRange ×1.2`, `screenPresence ×1.2` (leads carry the emotional throughline and the frame).
  - `antagonist` → `screenPresence ×1.3`, `physicalPerformance ×1.1`, `emotionalRange ×0.9` (menace over warmth).
  - `support` → flat 1.0 (no emphasis; support is generalist).

Applying an absent-skill modifier is a no-op (multiplier 1.0). The final **project weight** for skill `i` in discipline `d` on this film is:

```
projWeightᵢ = normalize_i( GENRE_SKILL_WEIGHTS[d][genre]ᵢ
                           · clamp(shapeModᵢ · promiseModᵢ · slotModᵢ, 1/1.6, 1.6) )
```

Function: `projectSkillWeights(discipline, concept, [slot], shapeEffects, promise): number[6]` (normalized). Pure; reads only concept/shape/promise — deterministic, no stream.

---

## D-9.4 (reserved — merged into D-9.3/D-9.5)

---

## D-9.5 Effective skill (replaces the scalar `skill` in §5/§7)

```
effectiveSkill(talent, discipline, concept, slot?, use): number   // ∈ [0,100]
  use ∈ { 'actual' (reception §5), 'perceived' (forecast §7) }
```

Definition:

```
w        = projectSkillWeights(discipline, concept, slot?, shapeEffects, promise)   // 6-vec, Σ=1
skills   = talent[discipline].actual  (use='actual')  |  .perceived  (use='perceived')
base     = Σ wᵢ·skillsᵢ                                        // 1..99, project-weighted mean
exp      = genreExperience(talent, discipline, concept.genre, use)  // 0..100 (D-9.7)
expBonus = EXP_SKILL_CAP · smoothstep(0, 100, exp)             // 0..EXP_SKILL_CAP, small
effective = clamp( base + expBonus, 0, 100 )
```

- `base` is the whole story of ability: a specialist with `comicTiming = 96` on a comedy where `comicTiming` carries the dominant project weight gets a `base` far above their broad OVR; a generalist with a flat 78 profile gets `base ≈ 78` on every genre. **The advantage is entirely in the weights × real skills.**
- `expBonus` is deliberately **small** (`EXP_SKILL_CAP = 4`): experience is *not* skill. A veteran of the genre gets at most +4 effective points; a first-timer of equal skill loses at most 4. This keeps "experience ≠ skill" true while giving development something to move (D-9.8).
- The result stays in `[0,100]` → D-9.0 invariant holds.

**Substitution into §5 (reception.ts `computeCraft`) — the exact line changes:**

| current | D-9 replacement (`use = 'actual'`) |
|---|---|
| `0.6*concept.baselineStrength + 0.4*writer.skill` | `0.6*concept.baselineStrength + 0.4*effectiveSkill(writer,'writing',concept,undefined,'actual')` |
| `directorExecution = director.skill` | `directorExecution = effectiveSkill(director,'directing',concept,undefined,'actual')` |
| `0.6*t.skill + 0.4*100*roleFit` (per slot) | `0.6*effectiveSkill(t,'acting',concept,slot,'actual') + 0.4*100*roleFit` |
| `mean(craftHires.map(c => c.skill))` else `40` | `mean(craftHires.map(c => effectiveSkill(c,'craft',concept,undefined,'actual')))` else `40` |

`roleFit` is **unchanged** — still `1 − clamp(personaDistance(t.actual, req.target)/tolerance,0,1)`, persona-driven. Persona stays the temperament source; M5 contributions still use `personaToExpression(actual)`.

**Substitution into §7 (forecast.ts `computeDeterministicCore`) — identical four reads, but `use = 'perceived'`** (forecast reads perceived; reception reads actual). This is the perceived/actual split the owner requires. Everything downstream of these four numbers (craft, cohesion, critic, segment appeal, box office, D-6) is byte-for-byte unchanged in structure.

Because `effectiveSkill` needs the concept/shape/promise, and the four §5 reads already have `ReceptionInputs` (which carries `concept`, `shapeEffects`, `promise`), **no signature change to `resolveReception`/`computeCraft`/`computeDeterministicCore` is required** beyond threading those already-present fields into the helper. `craftHires` currently has no per-slot notion; craft uses `slot = undefined`.

---

## D-9.6 Project Fit (displayed estimate, perceived only)

`0–100` estimate of suitability for **this exact film / discipline / job**, from **perceived** skills only. **Excludes** salary, star power, hidden actual skill, hidden potential, post-release info, and any arbitrary bonus. Fit must **not completely erase professional ability** (floored contribution of effective skill).

Per-discipline formula (all use `perceived`):

```
effP   = effectiveSkill(talent, d, concept, slot?, 'perceived')     // 0..100 project-weighted, perceived
abilityTerm = FIT_ABILITY_FLOOR + (1 − FIT_ABILITY_FLOOR)·(effP/100)  // ∈ [FIT_ABILITY_FLOOR, 1], never 0
```

**Actor Fit** (uses temperament roleFit):
```
fit_actor = 100 · clamp(
    FIT_ACTOR_ABILITY · (effP/100)
  + FIT_ACTOR_ROLEFIT · roleFit(talent, req_slot)          // persona/temperament match, 0..1
  + FIT_ACTOR_EXP     · (genreExperience(...,'perceived')/100)
, 0, 1)
```
with `FIT_ACTOR_ABILITY + FIT_ACTOR_ROLEFIT + FIT_ACTOR_EXP = 1` and `FIT_ACTOR_ABILITY ≥ FIT_MIN_ABILITY_SHARE (0.45)` so ability cannot be erased by temperament. Proposed: `0.55 / 0.30 / 0.15`.

**Writer / Director Fit** (no cast slot; temperament enters weakly via a discipline-appropriate persona-target derived from the promise, see below):
```
fit_writer = 100 · clamp(
    FIT_CREW_ABILITY · (effP/100)
  + FIT_CREW_TEMPER  · temperamentMatch(talent, promise)   // 0..1
  + FIT_CREW_EXP     · (genreExperience(...,'perceived')/100)
, 0, 1)
```
Proposed weights `0.65 / 0.20 / 0.15` (`FIT_CREW_ABILITY ≥ 0.45`). Director uses the same shape with `'directing'`.

**`temperamentMatch(talent, promise)`** = `1 − clamp(personaDistance(talent.actual, promiseTargetPersona(promise)) / TEMPER_TOLERANCE, 0, 1)`, where `promiseTargetPersona(promise)` maps the promise range midpoints back into persona axes (`warmth←iMid, gravity←tMid, physicality←kMid`) — a writer/director whose temperament matches the film's intended expressive direction fits better. `TEMPER_TOLERANCE = 1.8` (mid of the concept tolerance band).

**Craft Fit** = `fit_writer` shape with `'craft'`, `temperamentMatch` weight 0 (craft is temperament-neutral): `FIT_CRAFT_ABILITY 0.85 / FIT_CRAFT_EXP 0.15`.

**Properties the owner requires, and how they hold:**
- A lower-OVR **specialist** can have **higher Fit** for a matching film: `effP` is project-weighted, so their elite project-relevant skill lifts `effP` above a generalist's; `roleFit`/`temperamentMatch` can lift it further. Changing the film (genre/shape/promise/slot) re-weights `effP` and can **reverse** the ranking — exactly as required.
- Fit never erases ability (`FIT_*_ABILITY ≥ 0.45`, `abilityTerm` floored).

Function: `projectFit(talent, discipline, concept, slot?, shapeEffects, promise): number` (0–100). Display only; the sim never reads it.

---

## D-9.7 Expected Performance (displayed band, separate from OVR and Fit)

A displayed **performance band** for a proposed assignment, derived from the **perceived effective contribution** plus **uncertainty**. It is the number the player reads as "how well will this person do on this job," distinct from OVR (broad) and Fit (suitability).

```
center  = effectiveSkill(talent, d, concept, slot?, 'perceived')        // 0..100
// uncertainty widens with (a) low perceived genre experience and
// (b) the perceived/rest gap the studio cannot see (scouting noise proxy).
uncertainty = EP_BASE_WIDTH
            + EP_EXP_WIDTH   · (1 − smoothstep(0,100, genreExperience(...,'perceived')))
            + EP_UNPROVEN_WIDTH · [ workHistoryCount(talent, d) == 0 ]     // "Unproven in this role"
low   = clamp(center − uncertainty, 0, 100)
high  = clamp(center + uncertainty, 0, 100)
band  = { low, high, expected: center }
```

Width source is therefore: a base width, plus a genre-inexperience term, plus a discrete "no work history in this discipline" bump (which is also what surfaces the **"Unproven in this role"** label, D-9.9). Proposed: `EP_BASE_WIDTH = 5`, `EP_EXP_WIDTH = 6`, `EP_UNPROVEN_WIDTH = 5`. Function: `expectedPerformance(talent, discipline, concept, slot?, ...): {low, high, expected}`. Display only.

---

## D-9.8 Creative Temperament (rename of persona for the player)

The persona axes are **unchanged internally** (`warmth`, `gravity`, `physicality`, each `−1..+1`, still the reception contribution + roleFit source). D-9 adds a **display renaming** and a deterministic summary — no new stored field.

**Axis mapping** (`persona axis ∈ [−1,1] → labeled axis`, display only):
- Emotional Temperature (Reserved ↔ Warm) ← `warmth`
- Tonal Instinct (Playful ↔ Serious) ← `gravity`
- Expressive Energy (Subtle ↔ Kinetic) ← `physicality`

**Per-profession interpretation** (documentation for the display layer; no mechanical effect):
- Actor: how they *read* on screen (a Warm/Serious/Subtle actor lands intimate dramas).
- Writer/Director: the *voice* they push a project toward (feeds `temperamentMatch`, D-9.6, and the §5 M5 contribution).
- Craft: cosmetic this milestone (craft contributes no persona vector to the centroid).

**Deterministic live-summary rule** (`temperamentSummary(persona): string`): for each axis, bucket the value into five bands by fixed thresholds and emit the band's word, then compose a fixed sentence template. Thresholds (`TEMPER_BANDS`): `≤ −0.6`, `(−0.6,−0.2]`, `(−0.2,+0.2]`, `(+0.2,+0.6]`, `> +0.6` →
- warmth: `Cold · Reserved · Even · Warm · Radiant`
- gravity: `Playful · Light · Balanced · Serious · Grave`
- physicality: `Still · Subtle · Measured · Kinetic · Explosive`

Template (deterministic given the three words): *"{gravityWord}, {warmthWord} presence with {physicalityWord} energy."* e.g. `(−0.7, +0.5, +0.8)` → *"Serious, Cold presence with Explosive energy."* Pure function of the persona; no stream.

**Presets** set **only** temperament (no skill bonus): a preset is a persona triple (or a small labeled set), applied at authored-talent creation (D-9.14). Presets never touch skills, potential, or work ethic.

**Temperament affects Fit (via roleFit / temperamentMatch), NOT OVR** — OVR (D-9.2) reads skills only. This is enforced by construction: `roleOVR` has no persona input.

---

## D-9.9 Genre experience (discipline-specific, per (discipline, genre))

`0–100`, per `(discipline, genre)` pair, with a **perceived** and an **actual** value. Storage: `talent.genreExperience[discipline][genre] = { actual, perceived }` (24 pairs per talent; see the type, D-9.11). Contributes to:
- **Fit** (D-9.6 `*_EXP` term),
- a **small effective-skill bonus** (D-9.5 `expBonus`, capped at `EXP_SKILL_CAP = 4`),
- **forecast confidence** (D-9.12): a new predicate can read perceived experience.

`genreExperience(talent, discipline, genre, use)` returns the requested value, or 0 if absent. **Grows only via completed work in that exact `(discipline, genre)`** (D-9.8 development). Experience ≠ skill (capped bonus, separate storage).

`workHistoryCount(talent, discipline)` (used by Expected Performance and the "Unproven in this role" label) = number of completed productions the talent performed in that discipline this run. Stored as `talent.workHistory[discipline]` (an integer counter, incremented in development; see D-9.11). When 0 → **"Unproven in this role."**

---

## D-9.10 Potential (hidden per-skill ceilings + development params; visible estimate)

Each of the 24 skills has a **hidden actual ceiling** `ceiling[d][skill] ∈ [current actual, 99]` (the max that skill can ever reach) and a **development-rate** parameter. Potential is **discipline-specific** (high acting ceilings, low directing ceilings possible on the same person). No skill ever exceeds **99**; no actual skill ever exceeds its ceiling.

**Storage** (hidden, never displayed raw): `talent.ceilings[discipline][skill] ∈ [1,99]`, integer; `talent.devRate[discipline] ∈ [DEV_RATE_MIN, DEV_RATE_MAX]` (a per-discipline multiplier, `0.5..1.5`). See the type (D-9.11).

**Visible estimate** (noisy, may be wrong, never exposes the true ceiling):
- `expectedPotentialTier(talent, discipline)` → one of `Limited · Steady · Promising · High Upside · Exceptional Upside` (`+ Generational Upside` only for **authored** talent, D-9.14). Derived from a **noised** projected-OVR-at-ceiling.
- `expectedPotentialRange(talent, discipline)` → an OVR band, e.g. *"Expected Actor Potential: 78–86"*.

Derivation:
```
ceilingOVR(d)   = roleOVR-style summary computed on the CEILINGS (not current skills)   // 1..99, the true (hidden) potential OVR
scoutNoise      = stream(seed, 'worldgen', 'scout-'+talentId+'-'+d).gaussian(0, POTENTIAL_SCOUT_SIGMA)   // deterministic per (seed,talent,discipline)
estOVR          = clamp(ceilingOVR(d) + scoutNoise, currentOVR(d), 99)
// The band is centered on the noisy estimate, never on the true ceilingOVR:
range           = [ clamp(round(estOVR − POTENTIAL_BAND_HALF),1,99),
                    clamp(round(estOVR + POTENTIAL_BAND_HALF),1,99) ]
tier            = tierOf(estOVR − currentOVR(d))   // upside = headroom above current
```
`tierOf(upside)`: `< 3 Limited · 3–8 Steady · 9–15 Promising · 16–24 High Upside · ≥ 25 Exceptional Upside`. The **true ceiling is never shown** — only `estOVR ± POTENTIAL_BAND_HALF`, and the noise (`POTENTIAL_SCOUT_SIGMA`, proposed 4) can push the estimate above or below the truth. `POTENTIAL_BAND_HALF = 4`.

**High Work Ethic may let someone EXCEED the visible estimate** (the studio underestimated them) but **never the true ceiling** — because development (D-9.8) is bounded by `ceilings`, not by the visible band, and WE only accelerates approach to `ceilings`. No skill exceeds 99 because ceilings ≤ 99.

---

## D-9.11 Work Ethic (visible 1–99)

`talent.workEthic ∈ [1,99]`, integer, **visible**. "How consistently the person turns experience into development." Labels (`workEthicLabel`): `1–29 Poor · 30–49 Inconsistent · 50–69 Professional · 70–84 Driven · 85–94 Exceptional · 95–99 Relentless`.

**WE affects ONLY development** (D-9.8): conversion probability, magnitude, consistency, reaching upper potential, exceeding the visible estimate, and secondary-discipline growth. **WE MUST NOT affect** current OVR, Fit, star power, box office, critic, or immediate quality — enforced by construction: no §5/§7 read and no OVR/Fit formula references `workEthic`. High WE ≠ guaranteed greatness (a low ceiling still caps you); low WE ≠ untalented (high current skill is independent of WE). Effects flow **only** through the development step.

---

## D-9.12 Forecast (perceived) vs Reception (actual) integration

- **Reception §5** reads **actual** skills + **actual** genre experience → `effectiveSkill(..., 'actual')`.
- **Forecast §7** reads **perceived** skills + **perceived** genre experience → `effectiveSkill(..., 'perceived')`. The four §7 reads in `computeDeterministicCore` change to the perceived calls (D-9.5). Everything else in §7 (the confidence predicates' structure, the single forecast gaussian from the derived stream, causal/uncertainty factors) is **unchanged**.
- **Genre experience may extend forecast confidence** — a small, additive amendment to D-3's `knownDirectorGenreRecord` predicate (kept optional, gated behind a named flag so D-3's approved calibration is not silently disturbed):
  ```
  knownDirectorGenreRecord =
      (director has a released film THIS RUN in this genre)     // D-3 as approved
   OR (director.genreExperience['directing'][genre].perceived ≥ CONF_EXP_THRESHOLD)   // D-9 addition
  ```
  with `CONF_EXP_THRESHOLD = 60`. **⚠ This changes the D-3 confidence corpus** — flagged as **Open Question OQ-2** below; do not adopt it silently.

Persona contributions (M5), box office (§5.5), and D-6 standing keep their structure with `fame` → star power throughout.

---

## D-9.13 Generated talent (deterministic, seeded — replaces scalar-skill generation)

Role counts stay **12 writers / 10 directors / 28 actors / 10 craft** = the **primary** profession (`role` field unchanged, `ROLE_BLOCKS` unchanged). **Every talent gets all four role OVRs** because every talent gets all 24 actual/perceived skills, all 24 ceilings, work ethic, dev rates, secondary aptitude, and genre experience.

**New worldgen substreams** (added to the `talent-*` family; each walked once per talent in generation order, fixed field-draw order — same scheme §9 already documents):
`talent-skillprofile`, `talent-secondary`, `talent-ceilings`, `talent-workethic`, `talent-devrate`, `talent-genreexp`, and (for the visible potential estimate) the per-talent `scout-<id>-<discipline>` derived streams.

**Per-talent generation, in fixed order:**

1. **Primary discipline** = the mapping `role → discipline` (`writer→writing`, `director→directing`, `actor→acting`, `craft→craft`).
2. **Primary skill center** `μ_primary ~ truncatedNormal(GEN_SKILL_MEAN 60, GEN_SKILL_SD 15, GEN_SKILL_LO 20, GEN_SKILL_HI 95)` (matches the old `talent-skill` distribution exactly, so migrated worlds and fresh worlds have the same primary-ability center — preserves D-6 calibration).
3. **Per-skill actual draws (primary discipline)** for each of the 6 skills: `actualᵢ = round(clamp(μ_primary + N(0, GEN_SKILL_SPREAD 9), 1, 99))`. Spread makes specialists/generalists emerge naturally: a talent with a high spread and one skill near 95 and the rest near 55 is a **specialist**; low spread near a common μ is a **generalist**. To deliberately manufacture specialists at the target rate, with probability `GEN_SPECIALIST_P (0.22)` pick one skill index (uniform) and add `GEN_SPECIALIST_SPIKE ~ uniform(8,20)` to it (clamped 99), and subtract `GEN_SPECIALIST_SAG ~ uniform(3,9)` from two other skills — a peaked profile with real weaknesses.
4. **Secondary aptitude:** with probability `GEN_SECONDARY_P (0.15)` the talent has a **genuinely usable** secondary discipline (calibration target **10–20 %**, so 0.15 centers it): pick a secondary discipline (uniform over the other three), draw its skills with a **lower** center `μ_secondary = clamp(μ_primary − GEN_SECONDARY_PENALTY, 20, 90)` (`GEN_SECONDARY_PENALTY ~ uniform(8,22)`), spread as above. Otherwise the other three disciplines are **weak** — skills drawn at `μ_weak ~ truncatedNormal(GEN_WEAK_MEAN 34, 10, 1, 70)`. This yields *weak secondary disciplines* by default and occasional *legit multi-hyphenates*.
5. **Perceived skills** = `clamp(actual + N(0, GEN_PERCEIVED_SD 6), 1, 99)` per skill (a real perceived/actual split, same idea as persona's 0.25 gaussian, scaled to the 1–99 range).
6. **Ceilings:** `ceiling[d][i] = clamp(round(max(actual[d][i], actual[d][i] + headroom)), actual[d][i], 99)`, `headroom ~ truncatedNormal(GEN_HEADROOM_MEAN 14, GEN_HEADROOM_SD 10, 0, 60)`. Younger talent gets **more runway**: `headroom *= ageRunwayMult(age)` (D-9.8). This produces *raw high-upside prospects* (low actual, high headroom) and *polished low-ceiling pros* (high actual, near-zero headroom). Ceiling generation is drawn **independently of work ethic** (`Potential ⊥ WorkEthic`) and independently of current actual beyond the `≥ actual` floor (so *high-potential-low-WE* and *low-potential-high-WE* both occur).
7. **Work Ethic:** `workEthic = round(truncatedNormal(GEN_WE_MEAN 60, GEN_WE_SD 18, 1, 99))`, drawn from its **own** stream, **uncorrelated** with skills, ceilings, and fame (`Ability ⊥ WorkEthic`, `Potential ⊥ WorkEthic`).
8. **Dev rate:** `devRate[d] = clamp(uniform(DEV_RATE_MIN 0.5, DEV_RATE_MAX 1.5), …)` per discipline (independent draws so a person can develop fast in acting, slow in writing).
9. **Star power (`fame`):** unchanged draw `truncatedNormal(40, 22, 0, 95)` from `talent-fame`, **independent of ability** (`Fame ⊥ Ability` — a *low-fame-skilled* pro and a *famous-limited* actor both occur because fame is a separate stream). This is Star Power, kept, separate from OVR.
10. **Persona (temperament):** unchanged (`talent-persona`), **not perfectly correlated with competence** (`Temperament ⊥ competence` — persona is its own stream).
11. **Genre experience (starting):** for the **primary** `(discipline, genre)` pairs, seed a small experience so veterans aren't blank: for each genre, `actual = round(clamp(N(GEN_EXP_MEAN 12, GEN_EXP_SD 12, ), 0, 60))` scaled by age (older → a bit more starting experience, `expAgeMult(age)`); perceived = `clamp(actual + N(0, GEN_EXP_PERCEIVED_SD 6), 0, 100)`. Secondary/weak disciplines start at experience 0. Keeps experience meaningful from tick 0 without inventing careers.
12. **Legacy `skill` field** (kept for save-shape stability, see D-9.15): set `talent.skill = roleOVR(talent, primaryDiscipline)` on **perceived** skills — a faithful scalar proxy so any legacy consumer reads a comparable number. (No live §5 code reads it after D-9; it is retained only for the frozen `SaveFileV1` shape and back-compat.)

**Calibration targets** (verified in the M0A re-run, reported as counts/shares): very few 90+ primary OVRs, ~no 99s (occasional single generational world), many 60–79, a meaningful <60 prospect tail, and **10–20 % of talent with a genuinely usable secondary discipline** (secondary primary-discipline OVR ≥ 60). The `GEN_*` constants are the tuning knobs; the distribution *shapes* are fixed here.

**Salary redefinition** (D-9 replaces `salaryCurve`): salary must come from **professional ability + star power**, kept convex/fame-dominant like B7 so D-1's ledger and M0A economics stay sane.

```
salaryCurve(talent): number
  primaryOVR = roleOVR(talent, primaryDiscipline)         // 1..99, perceived
  s = primaryOVR / 100
  f = talent.fame / 100
  salary = SALARY_BASE
         + SALARY_SKILL_COEF · s²                          // convex in ability
         + SALARY_FAME_COEF  · f²                          // fame-dominant, convex (as B7)
```
`SALARY_BASE/SKILL_COEF/FAME_COEF` keep their B7 values (`25_000 / 150_000 / 600_000`) so the range and fame-dominance are unchanged — the **only** change is `skill →ovr`, and since migrated primaryOVR is centered near the old `skill` (D-9.15), the salary distribution is preserved. **⚠ Signature change** (`salaryCurve(talent)` vs `salaryCurve(skill, fame)`): `worldgen.generateTalent` and `actions.applyCreateTalent` call sites update accordingly. Documented change; range is preserved.

---

## D-9.14 Authored talent (creation budget)

Potential + Work Ethic + starting skills + secondary aptitude share a **bounded creation budget** — you cannot max everything; no free 99-OVR superstar. Archetypes configure **real attributes + tradeoffs**, never unexplained bonuses.

**Extended authored input** (extends `AuthoredTalentInput`; `actual` persona stays fully player-chosen):
```
AuthoredTalentInput = {
  name, role, age,                      // as today
  actual: Persona,                      // temperament, fully player-chosen (or a preset, D-9.8)
  potentialTier: PotentialTier,         // 'Limited'|'Steady'|'Promising'|'HighUpside'|'ExceptionalUpside'|'GenerationalUpside'
  workEthic: number,                    // 1..99, player-chosen numerically
  skillBias?: SkillBias,                // optional per-discipline emphasis (specialist vs generalist)
  secondaryDiscipline?: CreativeRole    // optional; costs budget
}
```

**Budget model.** A fixed pool `AUTHORED_BUDGET (100)` is spent across four cost centers; the request is **rejected loudly** (M16 posture) if it overspends:
```
cost(potentialTier)  = AUTHORED_TIER_COST[tier]   // Limited 5 … Generational 45 (monotone)
cost(workEthic)      = AUTHORED_WE_COST · (workEthic / 99)          // linear, WE_COST 30
cost(skillBias)      = AUTHORED_BIAS_COST · biasMagnitude           // sharper specialist ⇒ costlier, BIAS_COST 20
cost(secondary)      = secondaryDiscipline ? AUTHORED_SECONDARY_COST (20) : 0
totalCost = Σ ≤ AUTHORED_BUDGET  (else reject)
```
So a Generational ceiling + Relentless WE + a strong specialist bias + a secondary discipline cannot all coexist — the owner's "no free superstar" rule is a hard budget constraint, not a soft nudge.

**Mapping selections → hidden values (deterministic given the authored input + seed + talent id).** Use `stream(seed, 'worldgen', 'authored-'+talentId)`:
- **Starting skills:** authored talent starts at `AUTHORED_START_OVR`-equivalent skills (keep the spirit of `AUTHORED_START_SKILL = 35`: primary-discipline skills drawn near center 35, spread by `skillBias`; a specialist bias raises one skill and lowers others within the budgeted magnitude). `fame = AUTHORED_START_FAME (5)`. Perceived = actual at creation (matches today's `perceived = actual` rule for authored talent).
- **Ceilings** are set from `potentialTier`: `ceilingOVR ~ uniform(TIER_RANGE[tier])` (the range shown to the player, e.g. *"High Upside — ceiling ≈ 82–91"*), then per-skill ceilings distributed around it (respecting `skillBias`) and jittered by `AUTHORED_CEILING_JITTER (3)` so the **true ceiling varies within or slightly outside** the displayed range — the studio's own creation is still a little uncertain. Ceilings floored at current actual, capped 99.
- **Work Ethic** = the chosen number exactly (visible, no jitter).
- **Secondary discipline** (if bought): seeded skills at `μ = start − AUTHORED_SECONDARY_PENALTY (10)`, its own ceilings from a one-tier-lower band.

Authored talent may show the extra **Generational Upside** tier (worldgen never does — reserved for authored). `applyCreateTalent` validates the budget and role/age as today, then constructs the full D-9 talent.

---

## D-9.15 Legacy-save conversion (V1 → V2)

> **⚠ OVERRIDDEN BY THE OWNER, 2026-07-26 (see D-10).** The original "NO SaveFileV2 —
> the envelope stays frozen" position below is **superseded**. Settled law is now:
> `SaveFileV1` (`saveVersion: 1`) stays **immutable and readable**; D-9 games save as a
> new **`SaveFileV2`** (`saveVersion: 2`); and an explicit, **deterministic**
> `importLegacyV1` / `convertV1ToV2` converts a validated V1 into a fresh V2. That
> converter is **non-mutating** (never touches the caller's V1), **idempotent**, and
> **replay-exact** (draws only from the derived `stream(seed,'migrate',…)` family,
> never the sim stream). `validateSave` dispatches on `saveVersion` and loudly rejects
> any unknown version. The derivation of the D-9 fields (below) is retained verbatim —
> it is exactly the conversion `convertV1ToV2` performs — but it produces a NEW V2
> envelope rather than back-filling a frozen V1 in place. The rest of this section is
> preserved for its derivation detail; read "on load, in place" as "in `convertV1ToV2`,
> into a new V2."

D-9 fields are **derived deterministically from the OLD (V1) talent** `{id,name,role,age,actual,perceived,skill,fame,salary,authored}` + `state.seed` + talent id, when the new fields are absent. Deterministic, **idempotent** (re-convert → identical), and **replay-exact** (uses only derived worldgen-family streams, never the sim stream).

**Detection.** A talent is "old-shape" iff it lacks the D-9 marker field (`talent.skills === undefined`, where `skills` is the new per-discipline record, D-9.16). `loadSave`/`importSave` map `migrateTalent(t, seed)` over `state.talent` when any old-shape talent is present. Migration preserves `name`, `age`, `role` (primary), `fame` (star power), `actual`/`perceived` persona (temperament), and any engagement/history already in state.

**Derivation** (`migrateTalent(old, seed)`, all draws from `stream(seed, 'migrate', old.id + '-' + fieldkey)` — a **new** derived key family so it never collides with worldgen or sim draws):

1. **Primary discipline** = `role → discipline`.
2. **Primary skills centered on `old.skill`:** for each of the 6 primary skills, `actualᵢ = round(clamp(old.skill + N(0, MIGRATE_SKILL_SD 7), 1, 99))` — *centered near the old scalar so comparable ability is maintained*, with per-skill variation so they are **not all identical**. (SD 7 ≈ the generation spread; keeps the migrated primary OVR ≈ `old.skill` in expectation, preserving D-6 economics.)
3. **Perceived primary skills:** `clamp(actualᵢ + (old.perceived-vs-actual persona bias sign) + N(0, MIGRATE_PERCEIVED_SD 5), 1, 99)`. (Simplest faithful rule: reuse the same perceived-noise magnitude as generation.)
4. **Secondary/weak disciplines:** with probability `MIGRATE_SECONDARY_P (0.15)` a usable secondary at `μ = old.skill − uniform(8,22)`; else weak at `μ ~ N(MIGRATE_WEAK_MEAN 34, 10)`. Same target 10–20 % usable secondary as fresh worldgen.
5. **Ceilings:** `ceiling = clamp(round(max(actual, actual + headroom·ageRunwayMult(old.age))), actual, 99)`, `headroom ~ truncatedNormal(MIGRATE_HEADROOM_MEAN 14, 10, 0, 60)`.
6. **Work Ethic:** `round(truncatedNormal(MIGRATE_WE_MEAN 60, 18, 1, 99))` from its own migrate key (independent of skill/fame).
7. **Dev rates:** `uniform(0.5,1.5)` per discipline.
8. **Genre experience defaults:** primary `(discipline, genre)` seeded small (as generation step 11, scaled by `old.age`); secondary/weak at 0.
9. **`workHistory`** = all-zero (no completed work recorded pre-migration; a loaded run's history counters begin at 0 — a documented, deterministic choice).
10. **`skill`, `salary`, `authored`** kept as-is from `old` (legacy `skill` preserved for shape; `salary` unchanged so no ledger drift on load; `authored` unchanged).

**Idempotency:** if `talent.skills` is already present (already migrated), `migrateTalent` returns the talent unchanged — re-import is a no-op. **Replay-exactness:** all migration randomness is derived from `stream(seed,'migrate',...)`, which is stateless and never advances `state.rngState`; the migrated state's `rngState` equals the imported one, so a resumed run replays identically.

`validateSave`/`makeSave`/`stableStringify` are **unchanged** — the migrated talent are plain JSON (D-9.16 keeps every field a JSON primitive/array/record), so byte-identity (§15.7) still holds after a save round-trip.

---

## D-9.16 The new `Talent` type and supporting types (lean, JSON-serializable)

```ts
// discipline & skill vocab
export type Discipline = 'acting' | 'writing' | 'directing' | 'craft'

export type ActingSkill    = 'actingTechnique'|'emotionalRange'|'dialogueDelivery'|'comicTiming'|'physicalPerformance'|'screenPresence'
export type WritingSkill   = 'storyStructure'|'characterDevelopment'|'dialogue'|'originality'|'narrativePacing'|'rewriting'
export type DirectingSkill = 'visualStorytelling'|'performanceDirection'|'toneControl'|'directingPacing'|'productionManagement'|'adaptability'
export type CraftSkill     = 'cinematography'|'editing'|'productionDesign'|'soundAndMusic'|'effectsExecution'|'technicalCoordination'

// a perceived/actual pair for one professional skill (both 1..99)
export type SkillPair = { actual: number; perceived: number }

// all six skills of one discipline; keys fixed in SKILL_ORDER[discipline]
export type DisciplineSkills = Record<string, SkillPair>   // 6 entries; keyed by that discipline's skill names

// per-discipline skill profiles (24 SkillPairs total)
export type SkillProfiles = {
  acting: DisciplineSkills; writing: DisciplineSkills
  directing: DisciplineSkills; craft: DisciplineSkills
}

// hidden per-skill ceilings (1..99), one 6-vector per discipline
export type Ceilings = {
  acting: Record<string, number>; writing: Record<string, number>
  directing: Record<string, number>; craft: Record<string, number>
}

// per-(discipline,genre) experience, perceived+actual (0..100)
export type GenreExpEntry = { actual: number; perceived: number }
export type GenreExperience = Record<Discipline, Record<Genre, GenreExpEntry>>

export type DevRates = Record<Discipline, number>          // 0.5..1.5 per discipline
export type WorkHistory = Record<Discipline, number>       // completed-production counters

export type Talent = {
  id: string
  name: string
  role: CreativeRole            // PRIMARY profession (unchanged; drives worldgen counts)
  age: number
  actual: Persona               // temperament (unchanged; reception/roleFit source)
  perceived: Persona            // temperament as believed (unchanged)
  fame: number                  // 0..100 STAR POWER (unchanged; separate from OVR)
  salary: number                // per production; now from salaryCurve(talent) (D-9.13)
  authored: boolean

  // ── D-9 additions (all plain JSON) ──
  skills: SkillProfiles         // 24 perceived/actual professional skills (§ D-9.1)
  ceilings: Ceilings            // hidden per-skill actual ceilings (§ D-9.10)
  devRate: DevRates             // per-discipline development rate (§ D-9.10)
  workEthic: number             // 1..99 visible (§ D-9.11)
  genreExperience: GenreExperience   // per (discipline,genre) perceived+actual (§ D-9.9)
  workHistory: WorkHistory      // completed productions per discipline (§ D-9.9)

  // legacy scalar retained for SaveFileV1 shape & back-compat; NOT read by §5 after D-9.
  skill: number                 // = roleOVR(primary, perceived) proxy
}
```

`SkillProfiles`/`Ceilings`/`GenreExperience` use `Record`s built in a **fixed declared field order** (`SKILL_ORDER`, discipline order `acting→writing→directing→craft`, genre order = `GENRE_ORDER`) so `Object.keys` iteration and `stableStringify` are stable (the same discipline the worldgen force/segment orders already impose). The presence of `skills` is the migration marker (D-9.15). Every value is a `number`/`string`/`boolean` or a `Record`/array of them — fully `SaveFileV1`-serializable.

---

## D-9.8 (development) — the new deterministic seeded `tick` step

**Placement.** A **new step 6 DEVELOPMENT** in `tick`, **after STANDING (step 4) and BROADCAST (step 5)**, over the same `records` (the released films this tick), in the same ascending-`productionId` order. It updates `GameState.talent` immutably. It draws from a **derived stream** `stream(seed, 'develop', productionId + ':' + talentId)` — **never** the sim stream — so `rngState` is untouched and §15.7 replay is exact. (Determinism source: seed + productionId + talentId, exactly as the ruling requires.)

**Who develops, and in what discipline.** For each released production, every talent who **worked** on it develops in the **discipline they performed**: writer → `writing`, director → `directing`, each cast actor → `acting`, each craft hire → `craft`. **Growth is confined to the used discipline** — acting work never raises writing skills.

**Which skills grow.** The **exercised** skills = the skills with non-trivial **project weight** on that film: `exercised = { i : projWeightᵢ ≥ DEV_EXERCISE_THRESHOLD }` (`0.10`). This ties development to what the film actually demanded (a comedy grows `comicTiming`, not `physicalPerformance`).

**Per-skill gain formula** (deterministic, bounded, ceiling-respecting, WE-modulated). For a talent `t`, discipline `d`, skill `i` with actual `a = skills[d][i].actual` and ceiling `c = ceilings[d][i]`:

```
if a ≥ c: gain = 0            // already at ceiling; nothing to give
else:
  headroom     = c − a                                  // >0
  // 1) base opportunity — larger for exercised skills, tiny for merely-present ones
  opportunity  = projWeightᵢ                            // 0..1

  // 2) difficulty & result — a hard, well-received film teaches more; failure still teaches
  difficulty   = clamp(requiredNegative / DEV_DIFFICULTY_SCALE, DEV_DIFF_MIN, DEV_DIFF_MAX)   // ~0.7..1.3
  resultMult   = DEV_RESULT_FLOOR + (1 − DEV_RESULT_FLOOR)·smoothstep(DEV_RESULT_LO, DEV_RESULT_HI, criticScore)
                 // FLOOR>0 ⇒ a flop still teaches (nonzero possible)

  // 3) diminishing returns — slows near the ceiling AND near the top of the 1..99 range
  diminishing  = smoothstep(0, DEV_HEADROOM_FULL, headroom) · (1 − DEV_HIGHLEVEL_SLOW·(a/99))

  // 4) age / career stage — younger develops faster; older still improves, slower; no decline
  ageMult      = ageRunwayMult(t.age)                   // 1.0 young … DEV_AGE_FLOOR old, never 0

  // 5) work ethic — the multiplier on conversion magnitude
  weMult       = DEV_WE_FLOOR + (DEV_WE_CEIL − DEV_WE_FLOOR)·(t.workEthic/99)

  rawGain = DEV_BASE_RATE · devRate[d] · opportunity · difficulty · resultMult
                          · diminishing · ageMult · weMult
```

**Conversion to an integer increment** (deterministic; WE modulates *probability & consistency*, not just magnitude):
```
u        = stream(seed,'develop', prodId+':'+talentId).next()     // one draw per (talent,skill) in fixed SKILL_ORDER
// WE raises the odds a fractional gain "lands" as a whole point:
threshold = 1 − (weMult · DEV_LAND_BIAS)                          // higher WE ⇒ lower threshold ⇒ lands more often
increment = floor(rawGain) + ( (rawGain − floor(rawGain)) > threshold·u ? 1 : 0 )
newActual = min(c, a + increment)
```
Ordinary films yield `increment ∈ {0,1}` for a couple of exercised skills → **small gains, no huge OVR jumps** (`DEV_BASE_RATE` tuned so the mean per-release gain across exercised skills is ≈ 0.4 points; an OVR moves ~0/+1 per film, occasionally +2 for a young high-WE talent on a demanding hit). `newActual` never exceeds `c` (≤ 99). Perceived skill updates toward actual by `DEV_PERCEIVED_CATCHUP` of the gain (the studio learns what it has): `newPerceived = clamp(perceived + round(DEV_PERCEIVED_CATCHUP·increment), 1, 99)`.

**Genre experience growth:** the film's `(discipline, genre)` experience rises: `expActual += DEV_EXP_GAIN · resultMult` (clamped 0..100), perceived catches up by `DEV_EXP_PERCEIVED_CATCHUP`. `workHistory[d] += 1` for the performer.

**Secondary-discipline growth** (WE-gated): a talent working *outside* their primary discipline develops normally in that discipline (cross-discipline is allowed, D-9.9). WE also grants a *small* passive secondary-discipline nudge only when `workEthic ≥ DEV_SECONDARY_WE_GATE (70)` and only for skills below their ceiling — encoding "high WE grows secondary disciplines," bounded and rare.

**Immutable update in `tick`.** DEVELOPMENT builds a **new** `talent[]`: it maps `state.talent`, replacing each developed talent with a **fresh** object (spread + new nested `skills`/`genreExperience`/`workHistory` records — never mutate in place, matching the tick purity contract). Talent not in any release is shared by reference. The returned `GameState.talent` is this new array. **Salaries are NOT recomputed at development time** (salary is a slow-moving, greenlight-time quantity; recomputing every tick would churn the ledger); a talent's salary refreshes only when next referenced by worldgen/authored creation — documented choice, keeps D-1 stable. *(If the owner wants salary to track development within a run, that is a small addition — flagged as **OQ-3**.)*

**Post-release development report content** (for the M0A report / future UI; a pure formatter over the before/after talent): per developed talent, list each skill that rose (`"Dialogue Delivery +1"`) and any role-OVR change (`"Actor OVR 62 → 63"`), plus experience gains (`"Comedy directing experience +2"`); if nothing rose, `"No measurable skill increase."` Function `developmentReport(before, after): string[]`.

**`ageRunwayMult(age)`** (shared by generation headroom scaling and development): a decreasing, always-positive curve — `1.0` at age ≤ `DEV_AGE_YOUNG (26)`, falling smoothly to `DEV_AGE_FLOOR (0.35)` at age ≥ `DEV_AGE_OLD (60)`, never reaching 0 (older still improves, slower; **no decline/retirement/death this milestone**). Precisely: `DEV_AGE_FLOOR + (1 − DEV_AGE_FLOOR)·(1 − smoothstep(DEV_AGE_YOUNG, DEV_AGE_OLD, age))`.

---

## Cross-discipline eligibility & engagement rules

- **Primary profession does NOT restrict eligibility.** Candidate/greenlight legality must now allow **any-discipline assignment** based on the person **having that discipline's skills** — which every talent does. Concretely: the M16 `requireRole` role-type check (writerId must be role 'writer', etc.) is **replaced** by a **has-discipline** check that always passes (everyone has all four skill sets). **⚠ This relaxes M16 role-matching** — see **OQ-1** below; it changes what greenlights/candidates are legal, so it is a decision, not a silent edit. For the **M0A headless corpus**, the candidate generator's role-pool split (writers-pool → writerId, etc.) can be **kept as-is** so the M0A economics corpus is unchanged, with cross-discipline casting exercised only via unit tests + authored/manual play — *this preserves the frozen M0A calibration while making the engine capable*. Recommended default: keep candidate generation role-partitioned in M0A; allow cross-discipline at the `applyActions` legality layer.
- **Preserve** the existing engagement rules exactly: one active engagement per talent (M16 exclusivity), no same actor in two slots of one film (M16), role-existence/id-resolution. **No simultaneous multi-role credits this milestone** (a talent fills exactly one role in one production).
- **"Unproven in this role"** surfaces when `workHistory[discipline] == 0` (D-9.9), widening Expected Performance (D-9.7).

---

## D-9.16 TUNING constants (every new named constant + proposed value)

All live in `TUNING` (or, for the large tables, as named exports beside `CAST_WEIGHT`/`FORCE_VECTORS` — the same pattern the contract uses for non-scalar tables). **No magic number is inlined.** Justifications reference the current engine's ranges.

**OVR (D-9.2)** — `OVR_WEIGHTS[discipline]` (6-vectors, Σ=1; proposed: core skills weighted ~0.20 each, softer skills ~0.13 — e.g. acting `[0.18,0.20,0.16,0.10,0.14,0.22]`), `OVR_WEAKNESS_KNEE 80`, `OVR_WEAKNESS_COEF 0.5`, `OVR_BREADTH_FLOOR 70`, `OVR_BREADTH_COEF 6`, `OVR_GATE_99_MEAN 98`, `OVR_GATE_99_MINCORE 94`, `OVR_GATE_95_MEAN 93`, `OVR_GATE_95_MINCORE 88`. (Gates chosen to make 99 require near-perfect breadth, matching the owner's spec; coefficients scaled to the 1–99 skill range.)

**Project weighting (D-9.3)** — `GENRE_SKILL_WEIGHTS[discipline][genre]` (the four tables above), `SHAPE_SKILL_MODS`, `PROMISE_SKILL_MODS`, `SLOT_SKILL_MODS`, `PROJECT_MOD_CLAMP 1.6`.

**Effective skill (D-9.5)** — `EXP_SKILL_CAP 4` (experience ≠ skill: at most +4 on a 0–100 scale, small vs the ±40 range skills already span).

**Fit (D-9.6)** — `FIT_ACTOR_ABILITY 0.55`, `FIT_ACTOR_ROLEFIT 0.30`, `FIT_ACTOR_EXP 0.15`; `FIT_CREW_ABILITY 0.65`, `FIT_CREW_TEMPER 0.20`, `FIT_CREW_EXP 0.15`; `FIT_CRAFT_ABILITY 0.85`, `FIT_CRAFT_EXP 0.15`; `FIT_MIN_ABILITY_SHARE 0.45`, `FIT_ABILITY_FLOOR 0.15`, `TEMPER_TOLERANCE 1.8`.

**Expected performance (D-9.7)** — `EP_BASE_WIDTH 5`, `EP_EXP_WIDTH 6`, `EP_UNPROVEN_WIDTH 5`.

**Temperament (D-9.8 display)** — `TEMPER_BANDS` (the four thresholds `−0.6,−0.2,+0.2,+0.6`) and the three word tables.

**Potential (D-9.10)** — `POTENTIAL_SCOUT_SIGMA 4`, `POTENTIAL_BAND_HALF 4`, tier thresholds `{Limited<3, Steady3-8, Promising9-15, HighUpside16-24, Exceptional≥25}`.

**Generation (D-9.13)** — `GEN_SKILL_MEAN 60`, `GEN_SKILL_SD 15`, `GEN_SKILL_LO 20`, `GEN_SKILL_HI 95` (= the old `talent-skill` distribution, preserving primary-ability center), `GEN_SKILL_SPREAD 9`, `GEN_SPECIALIST_P 0.22`, `GEN_SPECIALIST_SPIKE [8,20]`, `GEN_SPECIALIST_SAG [3,9]`, `GEN_SECONDARY_P 0.15` (centers the 10–20 % usable-secondary target), `GEN_SECONDARY_PENALTY [8,22]`, `GEN_WEAK_MEAN 34`, `GEN_PERCEIVED_SD 6`, `GEN_HEADROOM_MEAN 14`, `GEN_HEADROOM_SD 10`, `GEN_WE_MEAN 60`, `GEN_WE_SD 18`, `DEV_RATE_MIN 0.5`, `DEV_RATE_MAX 1.5`, `GEN_EXP_MEAN 12`, `GEN_EXP_SD 12`, `GEN_EXP_PERCEIVED_SD 6`.

**Authored (D-9.14)** — `AUTHORED_BUDGET 100`, `AUTHORED_TIER_COST {Limited5,Steady12,Promising22,HighUpside32,Exceptional40,Generational45}`, `AUTHORED_WE_COST 30`, `AUTHORED_BIAS_COST 20`, `AUTHORED_SECONDARY_COST 20`, `AUTHORED_TIER_RANGE` (ceiling-OVR band per tier, e.g. HighUpside `[82,91]`), `AUTHORED_CEILING_JITTER 3`, `AUTHORED_SECONDARY_PENALTY 10`. `AUTHORED_START_SKILL 35`/`AUTHORED_START_FAME 5` retained.

**Migration (D-9.15)** — `MIGRATE_SKILL_SD 7`, `MIGRATE_PERCEIVED_SD 5`, `MIGRATE_SECONDARY_P 0.15`, `MIGRATE_WEAK_MEAN 34`, `MIGRATE_HEADROOM_MEAN 14`, `MIGRATE_WE_MEAN 60`, `MIGRATE_WE_SD 18`.

**Development (D-9.8)** — `DEV_BASE_RATE 2.2` (tuned to ≈0.4 mean point/exercised skill/release), `DEV_EXERCISE_THRESHOLD 0.10`, `DEV_DIFFICULTY_SCALE 5_000_000`, `DEV_DIFF_MIN 0.7`, `DEV_DIFF_MAX 1.3`, `DEV_RESULT_FLOOR 0.35` (flops still teach), `DEV_RESULT_LO 35`, `DEV_RESULT_HI 75`, `DEV_HEADROOM_FULL 20`, `DEV_HIGHLEVEL_SLOW 0.4`, `DEV_WE_FLOOR 0.5`, `DEV_WE_CEIL 1.5`, `DEV_LAND_BIAS 0.6`, `DEV_PERCEIVED_CATCHUP 0.7`, `DEV_EXP_GAIN 2`, `DEV_EXP_PERCEIVED_CATCHUP 0.7`, `DEV_SECONDARY_WE_GATE 70`, `DEV_AGE_YOUNG 26`, `DEV_AGE_OLD 60`, `DEV_AGE_FLOOR 0.35`.

**Salary (D-9.13)** — `SALARY_BASE/SKILL_COEF/FAME_COEF` unchanged (B7 values); the change is `skill →primaryOVR` only.

**Forecast confidence (D-9.12, gated)** — `CONF_EXP_THRESHOLD 60` (only if OQ-2 is adopted).

`SKILL_ORDER` (the six skill keys per discipline, in the D-9.1 order) is a named export driving all draws and means.

---

## Acceptance tests (concrete assertions)

Restating the owner's required list as unit/corpus assertions in the §15 style (bounded terms get range tests; behaviors get disjoint-outcome tests). Seeded, deterministic.

**OVR**
- `roleOVR` ∈ [1,99] for 10 000 generated talent across seeds (bounds).
- *(Illustrative — corrected to the implemented formula.)* The 99 gate is `min(x, 99)`: it **caps** at 99, it does not lift to 99. A weighted mean of 98 **alone** floors to 98 (`raw = 98 − penalties ≤ 98` → `floor(min(raw,99)) = 98`, **not** 99). A displayed **99** requires the gate to pass (`weightedMean ≥ 98` **and** `minCore ≥ 94`) **and** `raw` to genuinely reach 99 pre-floor — e.g. an all-core-99 profile (zero weakness/breadth penalty → `raw = 99` → 99). Dropping one core skill below the min-core gate (e.g. to 90 < 94) fails the 99 gate → capped at ≤ 95, never 99. *(See the implemented assertions in `tests/d9-talent.test.ts`: all-99 → 99; all-98 → 98; one core at 90 → < 99.)*
- A two-elite/rest-weak specialist (two skills 96, four skills 60) displays ≤ 94, never 99 (specialist ≠ 99).
- `raw = 98.9` pre-floor with a failing gate → OVR ≤ 94; `raw = 98.9` with passing gate → 99 only via the gate, not via rounding (rounding-can't-make-99).
- OVR is invariant to the selected film (compute for two different concepts → identical).

**Project weighting / specialists**
- *(Illustrative — corrected to the implemented weights.)* The mechanism (a genre specialist beats a broader generalist on a matching film, and the ranking **reverses** off it) is real, but the old `comicTiming 96` / flat-80 numbers do **not** satisfy it under comedy's own weight table (`comicTiming` normalizes to ≈ 0.29 of the weight, not enough for a 4-point OVR-favored generalist to lose). A genuine specialist needs a larger spike. The implemented test uses a `comicTiming 98` specialist (its other five acting skills ≈ 72, broad OVR **lower** than the generalist) vs a flat-76 generalist: the specialist has strictly higher `effectiveSkill` on a **comedy** (comicTiming carries the weight) yet **lower** on a **drama** (`emotionalRange`-weighted, where it is ordinary). Both effective values ∈ [0,100]. *(Assertions in `tests/d9-talent.test.ts`, D-9.3/D-9.5 block.)*
- No talent's `effectiveSkill` exceeds `max(skills)+EXP_SKILL_CAP` or 100 (no hidden bonus).

**Fit**
- `projectFit` ∈ [0,100] (bounds). A lower-OVR matching specialist has higher Fit than a higher-OVR mismatch on the matching film; changing the film reverses it. Ability share ≥ 0.45 verified (zero-temperament-match still leaves ≥ 45 % of ability contribution).

**Temperament**
- `temperamentSummary` is a pure function of persona (same triple → same string, 5×5×5 buckets). Applying a preset changes only persona, leaving all 24 skills, ceilings, and WE untouched (asserted field-by-field). OVR is unchanged by any persona change.

**Potential**
- Visible `expectedPotentialRange` never equals or exposes the true ceiling; the noised estimate lands above the truth in some seeds and below in others (both occur across 1 000 talent). No ceiling > 99; no actual > its ceiling ever, across a full-run development corpus.

**Work Ethic**
- Across a controlled A/B (two talents identical except WE 20 vs WE 95, same films), OVR/Fit/salary/box office/critic on release day are **identical** (WE touches nothing immediate); after N releases the high-WE talent has **≥** the low-WE talent's total skill gain, and reaches nearer its ceiling (WE flows only through development). A low-WE talent with high ceilings can still be out-developed by a high-WE talent with lower ceilings only up to each one's own ceiling (high WE ≠ guaranteed greatness).

**Cross-discipline**
- An actor with usable `writing` skills can be legally assigned as writer at the `applyActions` legality layer; `workHistory.writing == 0` → "Unproven in this role" and a wider Expected Performance band. Engagement exclusivity and no-double-cast still reject as before.

**Development**
- Deterministic: same (seed, productionId, talentId) → identical gains on replay; `rngState` unchanged by the development step (replay-exact). Growth only in the performed discipline (a writer's `acting` skills never move on a film they wrote). A flop (`criticScore` 30) still produces a non-zero gain for some exercised skill in some seed (failure can teach). An ordinary film moves OVR by 0 or +1 (no huge jumps); no skill exceeds its ceiling. Diminishing returns: a near-ceiling skill gains strictly less than a far-from-ceiling skill of equal weight.

**Creator (authored budget)**
- An over-budget request (Generational + Relentless WE + strong bias + secondary) is **rejected loudly**. A within-budget authored talent maps deterministically (same input+seed → identical hidden ceilings within the shown tier band, WE exactly as chosen, no skill/OVR above the tier's implied cap). No authored talent starts as a 99-OVR superstar.

**Migration**
- `migrateTalent(old, seed)` is idempotent (re-import → byte-identical via `stableStringify`) and replay-exact (migrated `rngState` == imported). Migrated primary-discipline OVR is centered near `old.skill` (mean |Δ| < ~3 across 10 000 old talent), per-skill values are not all identical, and 10–20 % have a usable secondary. Persona/age/role/fame preserved exactly. A save with new-shape talent loads unchanged (no double migration).

**Bounds / §15 regression**
- After substitution, every §15 bounded term still holds (M11 list), the four-quadrant unit recipes (B28) still hit their disjoint craft/cohesion ranges (with `skill` replaced by `effectiveSkill` on the pinned inputs), and the D-6 differentiation gate still passes after a re-tune (documented as a re-run, not an assertion of the old numbers).

---

## D-9 PM RESOLUTIONS (settled 2026-07-26)

The architect flagged six places where D-9 touches the frozen engine or the owner's
spec. The PM resolved all six, consistent with the owner's explicit Phase-5.1 directives
plus routine-engineering latitude — NONE required a new owner ruling:

- **OQ-1 (cross-discipline / M16) — RESOLVED.** The owner explicitly required
  cross-discipline careers, so `applyActions` role-matching is relaxed to a
  has-discipline check (every talent has all four skill sets). The M0A candidate
  generator stays **role-partitioned** so the frozen D-2/economics corpus is unchanged;
  cross-discipline assignment is exercised via unit tests + human play only.
- **OQ-2 (genre-exp → forecast confidence) — RESOLVED.** The owner said "may"; NOT
  adopted into D-3 (the approved confidence corpus is left intact). Genre experience
  feeds only Project Fit + the small (`EXP_SKILL_CAP=4`) effective-skill bonus.
- **OQ-3 (dynamic salary) — RESOLVED.** Salary stays a greenlight-time quantity, not
  recomputed as skills develop within a run (no D-1 ledger churn). Future extension.
- **OQ-4 (development in the M0A corpus) — RESOLVED.** The owner explicitly required
  re-running + re-validating the 1000×2 study, so DEVELOPMENT is ON headless (gains
  tuned small), the corpus is re-run, the eight M0A flags revalidated, and D-6/D-2
  re-tuned within TUNING if they shifted (escalate to the owner only if a gate becomes
  structurally unreachable).
- **OQ-5 (legacy `skill` field) — RESOLVED.** Keep `skill` as a read-only primary-OVR
  proxy for SaveFileV1 shape stability; it is NEVER read by §5/§7.
- **OQ-6 (craft generic/inert) — RESOLVED.** Craft carries the full mechanism but is
  inert headless (matches D-4: no craft hired, `technical`=40). Confirmed intended.

The original architect notes follow for provenance.

## Open questions for the PM — RAISED BY THE ARCHITECT; all resolved above (provenance)

- **OQ-1 — Relaxing M16 role-matching.** D-9's cross-discipline requirement ("primary profession does not restrict eligibility") **directly conflicts** with M16's approved role-type check (`writerId` must be role `'writer'`, etc.) and with the candidate generator's role-partitioned pools (B18/B19). D-9 proposes: relax the **legality** check to "has this discipline's skills" (always true) while **keeping candidate generation role-partitioned for the M0A corpus** so M0A economics/calibration are unchanged, exercising cross-discipline only via tests + authored/manual play. This preserves the frozen M0A study but is a real change to M16's contract text — **needs an owner ruling** on (a) whether to relax legality at all in this milestone, and (b) whether the M0A candidate grid should stay role-partitioned or open up (opening it would re-open the D-2/economics corpus).

- **OQ-2 — Genre experience feeding forecast confidence.** D-9.12 offers an optional amendment to D-3's `knownDirectorGenreRecord` (OR perceived directing genre-experience ≥ 60). This **changes the D-3 confidence-tier corpus** the owner already approved and required a distribution table for (D-3 addendum). Adopt, or leave D-3 exactly as approved and have experience feed **only** Fit and the small effective-skill bonus? Default in this ruling: **not adopted** (gated behind `CONF_EXP_THRESHOLD`, off) pending the owner.

- **OQ-3 — Salary vs within-run development.** D-9.13 keeps salary a greenlight-time quantity and does **not** recompute it as skills develop within a run (avoids churning the D-1 ledger). If the owner wants a talent's price to rise as they develop (arguably realistic), that is a small addition (recompute `salary` in the development step). Not adopted here; flagged.

- **OQ-4 — Development timing vs the frozen M0A calibration.** Adding DEVELOPMENT to `tick` means the **10-release M0A run now has talent whose actual skills drift upward mid-run**. This shifts the reception/economics corpus that D-1/D-2/D-6 were calibrated against (later films use slightly stronger crews). D-9 keeps per-release gains tiny (mean ≈0.4 pts) to minimize drift, but the owner should confirm whether M0A's headless corpus should run **with development on** (realistic, but re-tunes D-6) or **with development gated off** for the calibration corpus and on only for play. Default: development **on**, gains tuned small, D-6 re-run and re-reported as part of implementing D-9.

- **OQ-5 — The legacy `skill` field.** D-9 retains `talent.skill` (as an OVR proxy) purely for `SaveFileV1` shape stability and back-compat, but nothing in §5/§7 reads it after D-9. The owner may prefer to **drop** it (cleaner type) at the cost of touching the frozen save shape, or **keep** it (chosen here). Confirm.

- **OQ-6 — Craft as a single generic employee.** The owner said "Craft may stay a single generic employee this milestone," and D-4 pins `technical` at 40 headless. D-9 fully specifies craft's six skills / OVR / weights / development anyway (so M1A inherits a real system), but craft **never develops in M0A** (no craft is ever hired, so no craft talent is ever in a `records` release). Confirm that "craft carries the full mechanism but is inert until M1A hiring" is the intended reading (it matches D-4).

---

**Summary of engine-integration points (for the implementer):**
- `reception.ts computeCraft` — 4 `.skill` reads →`effectiveSkill(..., 'actual')` (D-9.5 table). No signature change (`ReceptionInputs` already carries concept/shape/promise).
- `forecast.ts computeDeterministicCore` — same 4 reads →`effectiveSkill(..., 'perceived')`.
- `worldgen.ts generateTalent` — full D-9.13 generation; `salaryCurve(talent)`.
- `actions.ts applyCreateTalent` — D-9.14 authored budget + full talent construction; `salaryCurve(talent)`.
- `tick.ts` — **new step 6 DEVELOPMENT** after BROADCAST, over `records`, from `stream(seed,'develop',...)`; returns new `talent[]`. Also thread the performed-discipline resolution (writer→writing etc.).
- `save.ts loadSave/importSave` — call `migrateTalent` over `state.talent` when old-shape detected (D-9.15); `validateSave`/`stableStringify` unchanged.
- `types.ts` — the new `Talent` + supporting types (D-9.16).
- `tuning.ts` — all D-9.16 constants + tables.
- New read-only summary module (e.g. `talentSummary.ts`): `roleOVR`, `roleTier`, `projectFit`, `expectedPerformance`, `temperamentSummary`, `expectedPotentialTier/Range`, `workEthicLabel`, `developmentReport` — none read by §5/§7.
- `candidates.ts`/`agents.ts` — **no change** (they consume `forecastCenters`/`resolveReception`/`salaryCurve`, so the substitution propagates automatically); the only decision is OQ-1's candidate-pool question.

This is the complete D-9 ruling: exact formulas, the new type set, every named `TUNING` constant with a proposed value justified against the current engine's ranges, the deterministic migration, the precise §5/§7 substitution points, the new development step, the acceptance-test list, and the flagged open questions where the owner's requirements genuinely touch or conflict with the engine. D-9 was **owner-ratified and implemented on 2026-07-26**; the rulings that governed its implementation follow in **D-10**.

---

# D-10 — Phase 5.1 owner rulings (2026-07-26)

**Status:** normative, owner-ratified 2026-07-26, IMPLEMENTED as part of the Phase 5.1 talent milestone. D-10 records three owner rulings (A, B, C) plus the M16.7 closure that governed how D-9 was built. Where D-10 amends earlier text (notably the **D-9.15 "NO SaveFileV2"** position, now overridden), **D-10 wins**. All numeric values here and in D-9 marked "Proposed" are **provisional working defaults** implemented as named `TUNING` constants and validated behaviorally plus by corpus/distribution studies (see `M0A-REPORT.md` and the harness studies); they are tunable, never inlined. Full per-ruling test lists live in `tests/ruling-{a,b,c}-*.test.ts` — this section records the **binding decisions and guardrails**, not those lists.

## D-10.A — Development is ON in normal play

- Normal play **develops talent** on a **completed release**. A canceled or unfinished production develops **no one**.
- Only the **performed / assigned discipline** develops (a writer's writing grows, not their acting); the exercised skills are those the film actually demanded (D-9.8).
- Development is **deterministic** and draws only from its own derived **`'develop'` stream** (`stream(seed,'develop', prodId+':'+talentId)`); it **never advances** the reception / sim RNG, so replay stays byte-exact.
- **Potential constrains** growth (no skill exceeds its hidden ceiling; no OVR exceeds the ceiling OVR or 99). **Work Ethic** affects the **likelihood and consistency** of conversion, **not** immediate quality — WE touches nothing on release day. **Failure still teaches** (a flop still develops the performer). **No extreme OVR jumps.**
- A per-release **development summary** is shown to the player: skill deltas, OVR before→after, an explicit **no-measurable-increase** line when nothing crossed a display threshold, and **truthful** Work-Ethic / Potential notes — **without** exposing hidden ceilings, rolls, or true Potential.
- Development **survives export/import, V1→V2 conversion, replay, and reload exactly once** (idempotent; never double-applied).
- **Guardrail:** the **official M0A calibration corpus stays development-OFF**, role-partitioned, with **D-6 unchanged** (`standing.ts` byte-untouched). Development-ON is a normal-play behavior and a separate supplementary study, not part of the M0A gate.

## D-10.B — Multi-hyphenate generation

- Generation is retuned to a **mixture-model archetype population** with **modest discipline-adjacency correlations**, so **~10–15%** of talent have a non-primary discipline **OVR ≥ 60** (~2–5% ≥ 70, < 1% ≥ 80).
- This is achieved **WITHOUT** weakening or special-casing the OVR formula, **WITHOUT** any secondary-OVR bonus, and **WITHOUT** inflating the 90+/95+/99 tiers. **Primaries stay meaningfully stronger** than secondaries.
- "**Usable secondary**" is defined by **OVR ≥ 60** (not skill-mean).
- **Career identity:** a "**Capable but Unproven**" discipline (OVR ≥ 60 but **no credits**) is distinguished from a **credited** career identity. Career labels **require demonstrated credits**; the system never fabricates credits.

## D-10.C — FilmShape threaded into the sim

- The **greenlight-LOCKED** FilmShape now **reweights professional-skill contribution** through **ONE shared helper**, used by: UI **Fit** and **Expected Performance** (perceived), **forecast** (perceived), **reception** (actual), and **development** skill-exercise. One helper, five call sites → they cannot drift.
- The reweighting is **budget-neutral** (weights renormalized), **NOT an additive bonus**, and is **NOT double-counted** with `ShapeEffects` (which keeps its separate film-level role).
- **OVR, Star Power, and salary are invariant to shape.** Replay is **byte-identical**.

## M16.7 closure — one talent, one role per production

- Greenlight **rejects** a talent filling **more than one role** in a **single production** (e.g. the same person as both writer and director of one film). **Cross-discipline SINGLE-role assignment stays legal** (a talent may be hired for a discipline other than their primary, in one role).
- This check **never fires** in the role-partitioned M0A corpus (candidate pools keep roles disjoint), so it does not perturb the calibration study.

*Record: D-10 A/B/C and the M16.7 closure decided by the owner 2026-07-26, implemented in the Phase 5.1 talent milestone. Adversarial review = SOUND-WITH-CAVEATS; contract audit = CLEAN WITH NOTES. This section is normative alongside D-9; where they conflict, D-10 wins.*

# D-11 — Studio Employment, Contracts, Roster, and the Freelancer Market (owner ruling, 2026-07-26)

**Status: normative, owner-authorized 2026-07-26 (Phase 5.2A directive).** This section
is incorporated into `docs/build-contract.md` rev. 4 alongside D-1..D-10; where it
conflicts with an earlier ruling it says so explicitly and wins. It transforms talent
from an unrestricted global selection pool (M0A/Phase-5.1 behavior) into a persistent
studio resource: the player employs a limited roster under contracts, pays weekly
payroll, staffs films primarily from that roster, and hires one-film freelancers to
cover real gaps. It does **not** authorize the script-development milestone, automatic
time, rival studios, competing offers, the studio lot, or distribution economics
(§11 non-goals and Phase-5.2A "EXPLICITLY DEFERRED" list; see D-11.20).

## D-11.0 The compatibility invariant (why the employment system is *gated*)

The protected M0A acceptance corpus (`tests/acceptance-corpus.test.ts`) and the frozen
D-6 economics run **headless**: `RandomAgent`/`OracleAgent` greenlight packages drawn by
`generateCandidates` from the **global, role-partitioned** talent pool, and D-1 debits
`negative + marketing + Σ salaries` at greenlight. That path must stay **byte-identical**.

Therefore the employment system is **engaged** only when the studio has actually entered
it, defined precisely as:

> `employmentEngaged(state) ≡ state.founding !== null || state.contracts.length > 0`

This is **not** a §11 `SimulationFlags` object; it is derived from real state (whether a
founding draft is open or any contract exists), exactly as "busy" is derived from
`activeProductions`. When employment is **not** engaged (the headless corpus, legacy
fixtures, converted V2 saves before their first signing), greenlight keeps the **exact
D-1 open-pool behavior**: any global talent is assignable and the greenlight debit is
`negative + marketing + Σ salaries`. When employment **is** engaged (a real player game),
the roster/freelancer legality (D-11.12), the freelancer-fee economics (D-11.10), and the
required Production/Craft Lead (D-11.13) all apply. **D-6 `standing.ts` stays byte-untouched.**

## D-11.1 Employment status (five explicit statuses, derived — not stored per talent)

Every talent has exactly one **employment status**, computed by a pure function
`employmentStatus(state, talentId)` in first-match priority order:

1. **Studio Contracted** — an active contract exists (`startWeek ≤ week < endWeekExclusive`).
2. **Engaged Freelancer** — assigned in an active production, not contracted.
3. **Available Freelancer** — listed in the current freelancer market, not contracted/engaged.
4. **Free Agent** — immediately signable (in `state.freeAgents`, i.e. a former employee whose
   contract expired or was terminated), not contracted/engaged/freelancer-listed.
5. **Unavailable** — exists in the world but is not currently accessible.

Status is **derived**, never a mutable field on `Talent` (the person is separate from the
studio's relationship to them, mirroring D-9 keeping OVR/Fit derived). **Primary profession
and employment status are independent:** a Studio-Contracted *actor* still carries writing/
directing/craft skills (D-9) and may be assigned cross-discipline (D-11.12). The status
enum reserves an extensible identifier space for future rival ownership **without inventing
any rival behavior now** (Phase-5.2A). Rival contracts are NOT simulated this milestone.

## D-11.2 Starting applicant draft (a bounded founding team, not the whole industry)

A new **player** game opens in a **founding draft** (`state.founding !== null`) rather than
dropping the player into a full-access studio. **Critically, `generateWorld(seed)` itself
stays employment-free** — it produces `founding: null, contracts: [], ledger: [],
freeAgents: []` so the headless M0A corpus (which calls `generateWorld` directly) never
engages the gate (D-11.0) and stays byte-identical. The founding draft is opened by a
**separate pure entry point** `beginFounding(state): GameState` (the player's `newGame`
adapter = `beginFounding(generateWorld(seed))`); `beginFounding` selects a deterministic
applicant pool from the generated talent, sized by named constants (values within the
owner's stated ranges): `HIRING_DRAFT_ACTORS = 11`, `HIRING_DRAFT_DIRECTORS = 4`,
`HIRING_DRAFT_WRITERS = 6`, `HIRING_DRAFT_CRAFT = 3` (24 applicants). The pool is chosen to span **dependable
professionals, narrow specialists, inexpensive prospects, high-upside risks, low-fame
skilled people, at least an occasional usable multi-hyphenate, and meaningful weaknesses**;
worldgen (D-9.13 / D-10.B) already produces this variety, and the draft selection preserves
it (sort the eligible generated talent by a deterministic spread key, then take a diverse
slice — never "the top N by OVR", and **never a guaranteed superstar**).

The player must hire an initial roster meeting the minimums `HIRING_MIN_ACTORS = 5`,
`HIRING_MIN_DIRECTORS = 1`, `HIRING_MIN_WRITERS = 2`, `HIRING_MIN_CRAFT = 1` (9 hires).
`foundStudio` is **rejected** until every required discipline minimum is met — the player
**may not begin with an illegal roster missing a required discipline.**

The player receives a bounded **recruitment fund** `HIRING_FOUNDING_BUDGET` (a dedicated
signing-bonus pool, separate from operating cash). Founding **signing bonuses draw from the
recruitment fund**, never from `studio.cash`; cash stays at `INITIAL_CASH` (D-1) so the
studio enters operations with its full operating runway. The founding UI shows **projected
annual payroll, remaining cash, approximate runway, discipline coverage, roster strengths,
and roster gaps** (D-11.19).

## D-11.3 Studio roster + D-11.4 Contract model

A **contract** is a plain-JSON record on `state.contracts`:

```
Contract = {
  talentId: string
  annualSalary: number        // currency; paid weekly as annualSalary / TICKS_PER_YEAR
  signingBonus: number        // currency; paid ONCE at signing (D-11.5)
  startWeek: number           // market.tick at signing
  endWeekExclusive: number    // startWeek + termWeeks; contract active while week < this
  termWeeks: number           // 52..208 (1..4 years); stored in WEEKS, displayed in years
}
```

- **Term** is `1..4 years`, stored in weeks (`CONTRACT_MIN_WEEKS = 52`,
  `CONTRACT_MAX_WEEKS = 208`), displayed as understandable years + remaining time.
- **Exclusive studio employment:** a contracted talent is the studio's; they cannot be
  freelanced elsewhere (no rivals this milestone) and are staffed from the roster.
- **Guaranteed compensation** = `weeklySalary × remainingWeeks` where
  `weeklySalary = annualSalary / TICKS_PER_YEAR` and `remainingWeeks = endWeekExclusive − week`.
- **Renewal eligibility** = the renewal window is open (D-11.7).
- Longer contracts trade **cost certainty** for **termination exposure**; short contracts
  reduce commitment but bring **earlier renewal risk**. No option years, backend
  percentages, guaranteed-film clauses, loan-outs, or buyouts this milestone.

The **Studio Roster** screen (D-11.19) lists, per employee: name, employment status,
primary profession, all four role OVRs, Star Power, Potential estimate, Work Ethic,
current annual salary, contract expiration, current termination cost, availability,
current assignment, recent development, and renewal status — with filters for profession,
role OVR, specialties, Potential, Work Ethic, salary, contract duration, availability,
multi-hyphenates, and expiring contracts.

## D-11.5 Salary, payroll timing, and signing bonuses

- **Payroll** accrues **weekly**: `weeklyPayroll = Σ over active contracts of round(annualSalary / TICKS_PER_YEAR)`.
  It is debited from `studio.cash` **exactly once per `tick()`** (the week advance), as a
  dedicated payroll step, and recorded in the ledger (D-11.18). It applies whether or not
  any film releases that week. Payroll is naturally **0** when no contracts exist (the
  headless corpus), so no spurious ledger entry is emitted there and M0A is unaffected.
- **Payroll must never silently disappear into production costs** — it is a distinct ledger
  `kind: 'payroll'` and reconciles (D-11.18). No double-charge across save/reload/replay
  (payroll is applied inside `tick`, never pre-committed).
- **Signing bonus** is `round(annualSalary × CONTRACT_SIGNING_BONUS_FRACTION)` (a star
  premium is folded in via `annualSalary`, which already scales with fame). It is paid
  **immediately** when a contract is accepted: from the **recruitment fund** during founding,
  from **`studio.cash`** during operations. Recorded as ledger `kind: 'signingBonus'`.
- **D-1 negative-cash behavior remains authoritative:** cash may go negative with **no
  mechanical consequence**; there is **no bankruptcy and no forced game-over** this milestone.

## D-11.6 Contract offers (understandable asking terms, not a negotiation simulator)

Each candidate presents a **deterministic asking offer** derived from real factors, computed
by `contractOffer(state, talentId, termWeeks)`:

```
askAnnualSalary = round( salaryCurve(talent)                    // D-9.13: OVR(perceived)+fame
                         × CONTRACT_ANNUAL_MULT                 // per-production salary → annual
                         × lengthFactor(termWeeks)              // longer term ⇒ slightly lower annual
                         × ageFactor(age)                       // prime-career ⇒ slightly higher
                         × scarcityJitter(seed, talentId) )     // small deterministic ± from the 'hiring' stream
```

`CONTRACT_ANNUAL_MULT = 3.0` (calibration default). It **must** stay in the band that keeps
a freelancer more expensive than a contracted employee **for a single film** — i.e.
`FREELANCER_FEE_PREMIUM > CONTRACT_ANNUAL_MULT × PRODUCTION_TICKS / TICKS_PER_YEAR` fails
(freelancer dearer per one-off) while the full contract term costs far more than one fee
(contract amortizes over many films). At the defaults (`1.5` vs `3.0 × 8/52 ≈ 0.46`
salaryCurve-multiples) a freelancer costs ≈ 3.3× a contracted employee's 8-week cost, so
freelancers are the pricey one-off and contracts win only across repeated use — the intended
tension. The balance study (D-11.21.5) confirms this empirically.

The player may **accept**, **decline**, **choose among a small bounded set of term
alternatives** (the four year-terms `{52,104,156,208}`, each re-priced by `lengthFactor`),
or **return later** if the opportunity remains available. This is **not** a free-form
negotiation simulator. Demand is grounded in **relevant OVR, Star Power, age/career stage,
market scarcity, and contract length**. **Potential and Work Ethic may nudge market
perception only where named here (they do not); they never inflate current OVR** (D-9
keeps OVR from perceived skills only).

## D-11.7 Renewals

A contract enters its **renewal window** when `0 < (endWeekExclusive − week) ≤
HIRING_RENEWAL_WINDOW_WEEKS` (= 12, within the owner's "8–12 weeks before expiration"
band). During the window the talent presents fresh asking terms (`contractOffer` at the
current week — an older, more experienced, possibly higher-OVR talent may ask for more).
The player may **extend** (replace the contract with a new term at the new terms; a renewal
signing bonus applies), **decline**, **wait**, or **release early** (D-11.9). If no renewal
occurs, the contract **expires** at `endWeekExclusive` and the person **becomes a Free
Agent** (pushed to `state.freeAgents`). **No competing rival offers this milestone;** the
rival-offer hook is recorded in the handoff.

## D-11.8 / D-11.9 Expiration and early release

- **Expiration:** at `tick()`, every contract with `endWeekExclusive ≤ newWeek` is removed
  and its talent pushed to `state.freeAgents` (deterministic order).
- **Early release** (`releaseTalent`): the player may release a contracted employee. The
  **initial termination consequence is financial only**:
  `terminationCost = round(HIRING_TERMINATION_FRACTION × guaranteedComp)` where
  `HIRING_TERMINATION_FRACTION = 0.5` and `guaranteedComp = weeklySalary × remainingWeeks`.
  **This 50% is a calibration default, not an immutable design truth.** The exact
  termination cost is **displayed before confirmation** (D-11.19). It is debited from cash
  and recorded as ledger `kind: 'termination'`; the talent becomes a Free Agent. **No**
  morale, agent hostility, reputation, lawsuits, scandals, or relationship effects.

## D-11.10 Freelancers (one film, premium, cannot be assumed available)

A small **rotating freelancer market** (`freelancerMarket(state)`, size
`HIRING_FREELANCER_MARKET_SIZE = 6`) offers talent for **one film**:

- A freelancer receives a **one-film fee** `freelancerFee = round(salaryCurve(talent) ×
  FREELANCER_FEE_PREMIUM)` (`FREELANCER_FEE_PREMIUM = 1.5`). The fee is a **direct project
  cost** debited at greenlight (ledger `kind: 'freelancerFee'`) and is **never** payroll.
- Freelancers do **not** enter ongoing payroll, are **normally more expensive than an
  equivalent contracted employee for the same single film**, may be **unavailable**, and
  **leave after the production completes** — they **cannot be assumed available for the next
  project** (the market rotates; D-11.14).
- **Contract salary and freelancer fee must never be conflated:** a contracted employee's
  annual salary is payroll (spread weekly); a freelancer's fee is a one-time project cost.

The strategic tension (which the balance study must confirm, D-11.21): a freelancer is
cheaper for a **one-off**, but a contract **amortizes** over many films — so "freelancers
are always cheaper" is false and "contracts are cosmetic" is false.

## D-11.11 Film assembly candidate sources

Routine assembly shows **only two sources**, in this order:

1. **Your Studio** (Studio-Contracted talent) — the **default** view.
2. **Available Freelancers** — a clearly-secondary section that communicates the premium.

**Unavailable global talent is excluded from routine selection.** All Phase-5.1 legibility
(Project Fit, Expected Performance, OVR, Star Power, salary/fee, strengths & concerns,
package summary, weakest-role identification, Commercial Outlook, locked greenlight
assessment, post-release autopsy) is **preserved**; only the candidate **source** changes.

## D-11.12 Film-assignment legality (engine-enforced when employment is engaged)

A talent may be assigned to a film only if (checked in `applyGreenlight`, and **only when
`employmentEngaged(state)`** — see D-11.0):

- they are **Studio-Contracted** OR **legally engaged as a freelancer** (present in the
  current freelancer market at greenlight), AND
- they are **available** (not already engaged in a conflicting active production — the
  existing M16.5 exclusivity), AND
- they meet **discipline eligibility** (the D-9 has-discipline check — every talent has all
  four skill sets, so cross-discipline assignment is legal), AND
- same-production multiple-job rules remain **deferred** (M16.7 stays: one talent, one role
  per production).

The **relevant assigned discipline** governs OVR, Fit, Expected Performance, genre
experience, and development (D-9 / D-10.C, unchanged). Primary profession does **not** create
a permanent role restriction.

## D-11.13 Production/Craft Lead (a single required senior role)

The existing Crew/Craft system is preserved. In player-facing language the single craft
hire is the **Production/Craft Lead**, representing senior responsibility across
Cinematography, Editing, Production Design, Sound & Music, Effects Execution, and Technical
Coordination. **Every film requires exactly one Production/Craft Lead** (when employment is
engaged): greenlight is **rejected** with an empty `craftIds`, and the UI blocks the talent
step until a Lead is chosen. The Lead **must be employed or engaged as a freelancer**, has a
contract or one-film fee, **contributes real Craft skills and Fit**, receives development
through completed Craft work (D-9.8), and appears in roster, payroll, assembly, result, and
career history. **Craft is NOT split into six separate employees** this milestone.
(This activates the previously-inert `craftIds`/`technical` surface D-4 deferred; D-4's
"technical pinned at 40" limitation is thereby lifted for player games — the M0A corpus,
employment-not-engaged, keeps `craftIds: []` and D-4's stated behavior.)

## D-11.14 Market rotation (deterministic)

Both markets rotate on a fixed cadence `HIRING_MARKET_ROTATION_WEEKS = 13`. The listing for
an epoch `e = floor(week / HIRING_MARKET_ROTATION_WEEKS)` is derived purely from
`stream(seed, 'hiring', 'freelancers-' + e)` / `stream(seed, 'hiring', 'market-' + e)` over
the currently-signable universe (non-contracted, non-engaged talent), so it is **fully
deterministic** and needs no stored market state. `state.freeAgents` (former employees) are
always immediately signable and additionally surface in the hiring market. A hired talent
**leaves** the market (they are now contracted/engaged); a freelancer engaged in a
production is excluded until it completes and is not guaranteed to return.

## D-11.15 Hidden information

Consistent with D-9's perceived/actual split: pre-signing and pre-hire the player sees
**perceived** information only — role OVR, Fit, Expected Performance band, Star Power,
asking salary/fee, contract term, signing bonus, top strengths, the single most important
concern, a **Potential estimate** (tier + band, never true ceilings), and Work Ethic
(D-9.11 visible). The player **never** sees actual skills, true ceilings, or true Potential.
The roster and hiring-market cards keep advanced detail behind expandable panels (restrained
default; D-11.19).

## D-11.16 Save behavior (SaveFileV3 — a new explicit version)

Employment cannot be represented honestly in SaveFileV2 (which predates it), so a **new
explicit version SaveFileV3** is created, following the D-9.15 precedent exactly:

- `SaveFileV3 = { saveVersion: 3; seed; state: GameState; broadcastCache }` where the live
  `GameState` gains `founding`, `contracts`, `ledger`, and `freeAgents`. **SaveFileV2's state
  is frozen** as a new `GameStateV2` type alias capturing the pre-employment shape, and
  **`GameStateV1` is re-anchored onto it** — `GameStateV1 = Omit<GameStateV2, 'talent'> &
  { talent: TalentV1[] }` (today it derives from the live `GameState`; it must be re-based so
  the added employment fields do NOT leak into the frozen V1/V2 shapes or break the V1
  fixtures). **V1 and V2 validation rules are unchanged.** `validateSave` dispatches on
  version and **loudly rejects** unknown versions.
- **`convertV2ToV3` / `importLegacyV2`** take a validated V2 and produce a **new** V3 with
  `founding: null, contracts: [], ledger: [], freeAgents: []` (a converted legacy save has
  no employment; the D-11.0 gate is inactive until its first signing, so legacy play
  continues open-pool). The V2 input is **never mutated**; `rngState` is carried through
  **unchanged**; conversion is **deterministic and idempotent** (byte-identical under
  `stableStringify`); the original file is **never overwritten**; repeated import yields
  **identical** state. `V1 → V3` is available via `V1 → V2 → V3`.
- New games save as **V3** (`makeSave === makeSaveV3`). The **M14** envelope rules
  (`seed === state.seed`, `broadcastCache` deep-equals `state.broadcastItems`) hold for V3.

## D-11.17 Determinism (all preserved)

No `Math.random`; a new named derived stream purpose **`'hiring'`** (applicant draft,
contract offers, freelancer/hiring rotation) that is **stateless** and **never advances
`state.rngState`** (like `'candidates'`/`'forecast'`/`'develop'`); stable iteration order
everywhere; deterministic applicant markets, contract offers, and freelancer rotation; exact
replay; JSON-serializable state; **no duplicate** weekly payroll, renewals, termination
costs, or freelancer charges (each is applied at exactly one deterministic point).

## D-11.18 Economy interaction + the financial ledger

`studio.cash` (D-1) stays the single balance. A new **`state.ledger: LedgerEntry[]`** records
**every** cash movement for traceability and reconciliation:

```
LedgerEntry = { week; kind: 'production' | 'boxOffice' | 'payroll' | 'signingBonus'
                       | 'termination' | 'freelancerFee'; amount; talentId?; productionId?; note }
```

`amount` is **signed** (outflow negative, inflow positive). The reconciliation invariant is
`studio.cash ≈ INITIAL_CASH + Σ ledger.amount` — the ledger accounts for **every** cash
movement; because currency is floating-point and `cash` is accumulated incrementally while
the ledger is re-summed in one pass, the two agree **to within sub-cent floating-point
rounding** (the residual is a representation artifact, never a lost transaction). Founding
recruitment-fund bonuses are the one deliberate exception — they draw the fund, not cash,
and are logged with a note. Theatrical
revenue and distribution are **not** redesigned: the disclosed limitation
**"Studio Revenue currently equals full box-office revenue because distributor and exhibitor
economics are not yet modeled"** remains (recorded for future correction, not implemented here).

## D-11.19 UI responsibilities

Founding draft; Studio Roster screen (D-11.3 fields + filters, restrained default, advanced
detail behind expandable panels); Hiring Market (card fields per D-11.15, sortable by OVR,
salary, Star Power, Potential, Work Ethic, contract value, specialty; never all 24 skills at
once); assembly Your-Studio / Available-Freelancers sources with the premium communicated;
Production/Craft Lead required; a Payroll & Runway summary (current cash, weekly payroll,
annual payroll, committed signing bonuses, projected contract obligations, upcoming renewals,
estimated operating runway at current payroll); contract cards; renewal window; release
confirmation showing the exact termination cost. All numbers come from engine helpers (no
UI-invented figures), exactly as Phase 5.1.

## D-11.20 Explicitly deferred (recorded boundaries)

Persistent screenplay development, writers' rooms, script buying/selling, automatic time
speeds, auto-pause, rival studios, competing contract offers, talent buyouts, loan-outs,
relationships, morale, stress, agents, awards, scandals, retirement, studio-lot integration,
facility construction, distribution economics, and all Phase-6 systems unrelated to this
milestone. Future hooks recorded in the handoff: the **rival-offer** hook (D-11.7), the
**distribution-economics** correction (D-11.18), and **script/writers'-room** as Phase 5.2B.

## D-11.21 Acceptance criteria

1. **Starting roster:** deterministic applicant pool; required-profession coverage enforced;
   bounded roster selection; no unrestricted global-pool access once engaged; no guaranteed
   superstar; a valid, bounded starting payroll.
2. **Contracts:** 1–4-year terms; weekly payroll exactly once; signing bonus exactly once;
   expiration → Free Agent; renewal window opens on schedule; extension; release; termination
   cost = 50% remaining guaranteed; save/reload persistence.
3. **Hiring & market:** deterministic rotation; demand grounded in real inputs; filters/sorts
   truthful; hired talent leaves the free-agent/market pool; declined/expired offers behave
   correctly; no duplicate contracts.
4. **Assignment:** own roster is the default; unavailable global talent absent from routine
   selection; freelancers shown separately; freelancer fee enters film cost; studio salary
   stays payroll; cross-discipline assignment uses relevant OVR & Fit; engagement conflicts
   prohibited; Production/Craft Lead required and contributing.
5. **Economy:** weekly payroll changes cash; the ledger reconciles; contract obligations
   visible; a lean roster burns less than a star-heavy roster; the studio can recover from a
   poor film under plausible conditions; payroll creates pressure without immediate
   unavoidable failure.
6. **Determinism & saves:** exact replay; deterministic applicant pool/offers/rotation; no
   duplicate payroll or contract events after reload; explicit V2→V3 (and V1→V3) import.
7. **Compatibility:** the M0A acceptance corpus and D-6 economics are byte-identical
   (employment not engaged); `standing.ts` untouched.

*Record: D-11 authorized by the owner 2026-07-26 (Phase 5.2A directive), implemented on
branch `phase-5.2-studio-roster`. This section is normative alongside D-1..D-10; where they
conflict, D-11 wins for the employment/roster/contract/freelancer surface only.*

## D-11.A — Cycle-2 owner corrections (amendment, 2026-07-26)

Owner-approved amendment from the first Phase-5.2A playtest. It refines D-11 without
reopening unrelated subsections; where it differs from the original text it says so.

**A1 — Three-actor founding minimum (supersedes D-11.2's "5 actors").** The required
starting roster is now **3 actors / 1 director / 2 writers / 1 Production/Craft Lead**
(`HIRING_MIN_ACTORS = 3`; the others unchanged). These are minimums, not maximums; the
applicant pool sizes (D-11.2) are unchanged so founding still offers meaningful variety.
Three actors legally staff the standard film (lead + antagonist + support are the three
distinct cast slots); the one-role-per-production rule (M16.7) is unchanged — one actor may
never fill two slots.

**A2 — Custom-created talent: employment status + signing.** A player-created talent is a
normal industry person, **never auto-employed**. Placement by phase: created **during
founding** → added to the **founding applicant pool** (`founding.applicantIds`), signable
under the founding recruitment-fund rules and countable toward the minimum **once signed**;
created **during operations** → added as a **Free Agent** (`freeAgents`), signable via the
Hiring Market under normal cash/contract rules. Either way the player must sign them
(signing bonus, then weekly payroll), and they remain subject to availability and
assignment legality (D-11.12). A custom Production/Craft Lead is creatable, signable, and
assignable. Creation is **idempotent** — repeated confirmation / back-nav / save-load never
duplicates a talent id.

**A3 — Balanced Creator vs Full Custom Creator.** The Talent Creator has two explicit modes.
**Balanced Career Mode** = the existing D-9.14 creation-budget creator (constrained, for
normal generated-career play) — unchanged. **Full Custom Mode** = an advanced, clearly
labelled mode that edits the person's *authoritative underlying attributes directly* (all 24
professional skills, Star Power, Work Ethic, per-discipline potential/ceiling inputs,
Creative Temperament, primary profession, and per-(discipline,genre) genre experience from
the engine's genre list) and **may deliberately produce powerful/unbalanced people** (shown
with a restrained notice). **OVR is always a live derived preview from the edited skills —
never an independent editable field.** **Project Fit is never a stored creator attribute** —
it stays film/assignment/shape/promise/genre dependent. All inputs obey the authoritative
attribute bounds (0–99 skills, valid age range); no NaN/Infinity/out-of-range. Sensible
presets (Blank / Balanced Professional / Promising Prospect / Established Star / Acting
Specialist / Writer-Director / Craft Specialist) populate only the same authoritative fields.
A pre-creation contract preview (est. salary demand, signing bonus, term range, primary
profession, OVR profile) is shown; **creation is not signing.**

**A4 — Film-specific immutable participant history.** Each released film retains an
**immutable, film-specific participant record** captured at its locked greenlight (writer,
director, each cast slot, and the Production/Craft Lead — with talent id, displayed name,
role, assigned discipline, greenlight OVR/Fit/Expected-Performance, contracted-vs-freelancer
status) plus the actual resolved outcome. The post-release **autopsy renders from that
film's own stored record**, never from the currently-assembled film, current roster/
employment, the most recent release, or another film's data. Later talent development,
Star-Power change, contract change, or departure **must not rewrite** who made an older film
or what the studio believed at that film's greenlight. Implementation notes: (i) production
ids are made **unique even for same-tick greenlights** (the prior `prod-<startTick>` scheme
collided under the 2-concurrent-productions rule — the true cause of the duplicated-autopsy
bug); (ii) the participant record is an **additive optional field on the current V3
`FilmResult`** captured only when employment is engaged, so old V3 saves stay valid (autopsy
falls back to the session snapshot when the record is absent) and **no V4 is required**; the
M0A corpus (employment not engaged) is unaffected.

**A5 — Player-facing integer display precision (distinct from simulation precision).**
The engine keeps its authoritative full-precision values (Star Power/age may be fractional;
sorting and simulation use them unchanged). **Player-facing displays show whole numbers**
via centralized formatters: **Star Power = round(value)**; **age = completed whole years
(floor of elapsed years)** — never round age up before a birthday. Applied consistently
everywhere either is shown. This is presentation only; it never alters a simulation value or
a stored historical record.

**A6 — Four precision/record concepts, kept distinct.** (1) *Simulation precision* — the
authoritative full-precision engine values (unchanged; sorting/RNG/reception read these).
(2) *Player-facing display precision* — the integer formatters in A5 (presentation only).
(3) *Persistent historical film records* — the immutable per-film participant history in A4
(what the studio DID and believed, frozen at greenlight). (4) *Current mutable talent state*
— a person's present skills/Star-Power/contract/availability, which evolve and are shown on
their profile; these never overwrite (3).

*Record: D-11.A cycle-2 corrections authorized by the owner 2026-07-26, implemented as the
Phase 5.2A cycle-2 correction on `phase-5.2-studio-roster` (above `0f9d23d`). Normative
alongside D-11; where they differ, D-11.A wins.*