// ── §16 TUNING + rev. 4 additions ────────────────────────────────────────────
// One exported TUNING object: every §16 entry at its contract value, PLUS the
// rev. 4 "New TUNING entries" (docs/rev4-open-questions.md §4) and the two
// constants moved in per B17 (FORECAST_SIGMA, CONFIDENCE_INTERVAL_WIDTH) at their
// B17-revised values, and SEGMENT_TASTES per D-5.
//
// Other contract-declared constants (CAST_WEIGHT, ROLE_WEIGHT, SLOT_TRANSFORM,
// FORCE_VECTORS, INITIAL_STANDING, WORLD_CONFIG, the §13 grids) live as their own
// named exports below — the contract declares them outside §16.

import type {
  ArchetypePreset,
  CastSlot,
  CulturalForce,
  Discipline,
  Expression,
  Genre,
  PotentialTier,
  SegmentId,
  Standing,
} from './types.js'

export const TUNING = {
  // §16 verbatim
  COHESION_CAP: 16,
  COHESION_SMOOTH_LO: 0.35,
  COHESION_SMOOTH_HI: 0.85,
  EXPECTED_EXPRESSION: 0.55,
  EXPRESSION_FLOOR: 0.65,
  CENTROID_MIN_MAGNITUDE: 0.15,
  CRITIC_SIGMA_BASE: 4,
  ORIGINALITY_MAX_BONUS: 12,
  DERIVATIVENESS_MAX_PENALTY: 4,
  PROMISE_MAX_BONUS: 12,
  PROMISE_PENALTY_MAX: 18,
  MARKETING_HALF_SATURATION: 400_000,
  APPEAL_CURVE_EXP: 1.8,
  LEGS_MIN: 1.8,
  LEGS_MAX: 4.0,
  AUTHORED_START_SKILL: 35,
  AUTHORED_START_FAME: 5,
  BROADCAST_THRESHOLD: 0.45,
  BROADCAST_COOLDOWN_K: 0.7,
  BROADCAST_WINDOW: 6,

  // rev. 4 §4 new TUNING entries
  TICKS_PER_YEAR: 52,
  PRODUCTION_TICKS: 8,
  MAX_CONCURRENT_PRODUCTIONS: 2,
  INITIAL_CASH: 20_000_000,
  SALARY_BASE: 25_000,
  SALARY_SKILL_COEF: 150_000,
  SALARY_FAME_COEF: 600_000,
  ROI_COST_FLOOR: 500_000,

  // ── §6 standing, owner ruling D-6 (2026-07-26) ─────────────────────────────
  // Named constants for the three-channel update. Every value is normalized against
  // the STEP-1 per-release corpus distributions (200 seeds × 2 agents, 4000
  // releases; evidence in out/d6/step1-releases.jsonl). No magic number is inlined
  // in standing.ts; these are the only knobs.
  //
  // Awareness (reach primary, star secondary). reach = boxOffice.total /
  // baseMarketValue; SCALE = the reach that reads as "fully visible" (≈ pooled p90
  // reach 0.90). NEUTRAL = the normalized-reach pivot (0.58 ⇒ a film at ~0.58 of the
  // "fully visible" reach contributes ~0 from the reach term); below it the reach
  // term is negative so a low-reach studio stays low-awareness. WEIGHTs set so a
  // high-reach slate (Oracle, reach_norm ≈ 0.9) climbs each release (→ ≥60 over ten)
  // while a low-reach slate (Random, reach_norm ≈ 0.47) hovers near its start.
  AWARENESS_REACH_SCALE: 0.9, // reach value read as "fully visible" (pooled p90)
  AWARENESS_REACH_NEUTRAL: 0.58, // normalized-reach pivot (0..1); below → negative reach term
  AWARENESS_REACH_WEIGHT: 7, // primary reach coefficient (delta points per unit)
  AWARENESS_STAR_WEIGHT: 1.2, // secondary star-attention coefficient (delta points per unit)
  AWARENESS_DELTA_CAP: 6, // per-release |ΔaudienceAwareness| cap

  // Prestige (absolute critic achievement). BENCHMARK sits near the pooled
  // criticScore median (46.5) so it is REACHABLE from both sides — the prior fixed
  // 60 was above ~p90, so prestige could only fall. SCALE 1.2 makes a criticScore
  // ~2.4 above the benchmark give ~+2/release; a critic gap ≥12 saturates the ±10 cap.
  PRESTIGE_CRITIC_BENCHMARK: 45, // reachable neutral benchmark (≈ criticScore median)
  PRESTIGE_CRITIC_SCALE: 1.2, // criticScore points per one prestige delta point
  PRESTIGE_DELTA_CAP: 10, // per-release |ΔindustryPrestige| cap

  // Confidence (ROI primary, budget discipline penalty). ROI = profit /
  // max(cost, floor); ROI_SCALE = the ROI at which roiSignal saturates to 1
  // (≈ Oracle median ROI 5). DISCIPLINE_WEIGHT prices the over-funding fraction
  // (overrun ∈ {0, 0.25} in the corpus). COST_FLOOR guards the ROI denominator
  // (min observed committed cost ≈ 2.5M, so the 500k floor is a pure guard, matching
  // D-1's ROI_COST_FLOOR rationale). No absolute-reach term; no reuse of the
  // awareness surprise signal.
  CONFIDENCE_ROI_SCALE: 5, // ROI at which roiSignal saturates to ±1
  CONFIDENCE_ROI_WEIGHT: 4, // primary ROI coefficient (delta points per unit roiSignal)
  CONFIDENCE_DISCIPLINE_WEIGHT: 4, // over-funding penalty coefficient (delta points per unit overrun)
  CONFIDENCE_COST_FLOOR: 500_000, // ROI-denominator floor (currency); pure guard
  CONFIDENCE_DELTA_CAP: 5, // per-release |ΔcommercialConfidence| cap

  // moved into TUNING per B17, at B17-revised values
  FORECAST_SIGMA: { high: 5, medium: 10, low: 16 },
  CONFIDENCE_INTERVAL_WIDTH: { high: 7, medium: 11, low: 14 },
  // D-12 final downside: ENGAGED-only ASYMMETRIC downside widening (extra appeal points on the LOW
  // forecast band only — the expected value and upside are unchanged). At greenlight the studio does
  // not know future delivery, so an unproven / low-Fit / low-confidence package must show a genuinely
  // negative downside; a well-assembled, confident package keeps a tight band. Not engaged ⇒ 0 (M0A
  // byte-identical). Keyed by the film-level confidence tier.
  FORECAST_DOWNSIDE_WIDEN: { high: 0, medium: 7, low: 16 },

  // per D-5 — twelve numbers the tuning loop may adjust (intimacy, tonalWeight, kineticEnergy)
  SEGMENT_TASTES: {
    youngAdult: { intimacy: -0.45, tonalWeight: -0.3, kineticEnergy: 0.75 },
    family: { intimacy: 0.55, tonalWeight: -0.55, kineticEnergy: 0.2 },
    adult: { intimacy: -0.2, tonalWeight: 0.45, kineticEnergy: -0.15 },
    prestige: { intimacy: 0.4, tonalWeight: 0.7, kineticEnergy: -0.4 },
  } as Record<SegmentId, Expression>,

  // ── D-9.2 OVR (scalar knobs; OVR_WEIGHTS is a named table below) ─────────────
  OVR_WEAKNESS_KNEE: 80,
  OVR_WEAKNESS_COEF: 0.5,
  OVR_BREADTH_FLOOR: 70,
  OVR_BREADTH_COEF: 6,
  OVR_GATE_99_MEAN: 98,
  OVR_GATE_99_MINCORE: 94,
  OVR_GATE_95_MEAN: 93,
  OVR_GATE_95_MINCORE: 88,

  // ── D-9.3 project weighting (tables are named exports below) ─────────────────
  PROJECT_MOD_CLAMP: 1.6,

  // ── D-9.5 effective skill ────────────────────────────────────────────────────
  EXP_SKILL_CAP: 4,

  // ── D-9.6 Fit ────────────────────────────────────────────────────────────────
  FIT_ACTOR_ABILITY: 0.55,
  FIT_ACTOR_ROLEFIT: 0.3,
  FIT_ACTOR_EXP: 0.15,
  FIT_CREW_ABILITY: 0.65,
  FIT_CREW_TEMPER: 0.2,
  FIT_CREW_EXP: 0.15,
  FIT_CRAFT_ABILITY: 0.85,
  FIT_CRAFT_EXP: 0.15,
  FIT_MIN_ABILITY_SHARE: 0.45,
  FIT_ABILITY_FLOOR: 0.15,
  TEMPER_TOLERANCE: 1.8,

  // ── D-9.7 expected performance ───────────────────────────────────────────────
  EP_BASE_WIDTH: 5,
  EP_EXP_WIDTH: 6,
  EP_UNPROVEN_WIDTH: 5,

  // ── D-9.10 potential ─────────────────────────────────────────────────────────
  POTENTIAL_SCOUT_SIGMA: 4,
  POTENTIAL_BAND_HALF: 4,

  // ── D-9.13 generation ────────────────────────────────────────────────────────
  GEN_SKILL_MEAN: 60,
  GEN_SKILL_SD: 15,
  GEN_SKILL_LO: 20,
  GEN_SKILL_HI: 95,
  GEN_SKILL_SPREAD: 9,
  GEN_SPECIALIST_P: 0.22,
  GEN_SPECIALIST_SPIKE: [8, 20] as [number, number],
  GEN_SPECIALIST_SAG: [3, 9] as [number, number],
  GEN_WEAK_MEAN: 34,
  GEN_WEAK_SD: 10,
  GEN_WEAK_LO: 1,
  GEN_WEAK_HI: 70,
  GEN_PERCEIVED_SD: 6,
  GEN_HEADROOM_MEAN: 14,
  GEN_HEADROOM_SD: 10,
  GEN_HEADROOM_LO: 0,
  GEN_HEADROOM_HI: 60,
  GEN_WE_MEAN: 60,
  GEN_WE_SD: 18,
  GEN_EXP_MEAN: 12,
  GEN_EXP_SD: 12,
  GEN_EXP_LO: 0,
  GEN_EXP_HI: 60,
  GEN_EXP_PERCEIVED_SD: 6,

  // ── D-9.14 authored (creation budget) ────────────────────────────────────────
  AUTHORED_BUDGET: 100,
  AUTHORED_WE_COST: 30,
  AUTHORED_BIAS_COST: 20,
  AUTHORED_SECONDARY_COST: 20,
  AUTHORED_CEILING_JITTER: 3,
  AUTHORED_SECONDARY_PENALTY: 10,

  // ── D-9.15 migration ─────────────────────────────────────────────────────────
  MIGRATE_SKILL_SD: 7,
  MIGRATE_PERCEIVED_SD: 5,
  MIGRATE_SECONDARY_P: 0.15,
  MIGRATE_SECONDARY_PENALTY: [8, 22] as [number, number],
  MIGRATE_WEAK_MEAN: 34,
  MIGRATE_WEAK_SD: 10,
  MIGRATE_HEADROOM_MEAN: 14,
  MIGRATE_HEADROOM_SD: 10,
  MIGRATE_WE_MEAN: 60,
  MIGRATE_WE_SD: 18,

  // ── D-9.8 development + dev-rate range (shared by generation) ─────────────────
  DEV_RATE_MIN: 0.5,
  DEV_RATE_MAX: 1.5,
  DEV_BASE_RATE: 2.2,
  DEV_EXERCISE_THRESHOLD: 0.1,
  DEV_DIFFICULTY_SCALE: 5_000_000,
  DEV_DIFF_MIN: 0.7,
  DEV_DIFF_MAX: 1.3,
  DEV_RESULT_FLOOR: 0.35,
  DEV_RESULT_LO: 35,
  DEV_RESULT_HI: 75,
  DEV_HEADROOM_FULL: 20,
  DEV_HIGHLEVEL_SLOW: 0.4,
  DEV_WE_FLOOR: 0.5,
  DEV_WE_CEIL: 1.5,
  DEV_LAND_BIAS: 0.6,
  DEV_PERCEIVED_CATCHUP: 0.7,
  DEV_EXP_GAIN: 2,
  DEV_EXP_PERCEIVED_CATCHUP: 0.7,
  DEV_SECONDARY_WE_GATE: 70,
  DEV_AGE_YOUNG: 26,
  DEV_AGE_OLD: 60,
  DEV_AGE_FLOOR: 0.35,

  // ── D-9.12 forecast confidence (gated OFF per OQ-2; retained named for M1A) ───
  CONF_EXP_THRESHOLD: 60,

  // ── RULING B (2026-07-26) — capability vs career-identity threshold ──────────
  // A discipline is a "usable" capability at roleOVR ≥ this (the Strong/Limited-or-
  // developing boundary, D-9.2). Used by the Capable-but-Unproven career-identity
  // helper (capability = OVR ≥ threshold; career identity additionally requires a
  // demonstrated credit — workHistory[discipline] > 0).
  CAPABILITY_OVR_MIN: 60,

  // ── Phase 5.1 CYCLE 3 — Film Package assessment helpers (filmPackage.ts) ─────
  // PROVISIONAL weights/thresholds for the READ-ONLY UI assessment summaries. These
  // are NOT sim-read (the sim never reads filmPackage.ts, exactly like the D-9
  // talentSummary display functions). They only weight/threshold quantities that
  // already come out of REAL engine mechanics (reception §5, forecast §7, D-9 fit).
  // None of these change a reception/forecast/cohesion/D-3/D-6 formula.

  // creativeCohesion (#1) — talent-independent creative-brief coherence. Two real,
  // talent-independent alignment terms, both on the same Expression-distance metric
  // §5 uses (distance / sqrt(12), 0..1): (1) how well the shape's expression supports
  // the promise's intended expression (the promiseMismatch axes), and (2) how well
  // the combined brief expression sits in the intended-audience segment tastes (the
  // segmentFit metric). Blended, then mapped to 0..100. STRENGTH/CONFLICT band the
  // per-axis gap into "aligned"/"conflicting".
  COHESION_BRIEF_SHAPE_PROMISE_W: 0.55, // weight on shape↔promise expression support
  COHESION_BRIEF_SEGMENT_W: 0.45, // weight on brief↔intended-segment taste alignment
  COHESION_AXIS_ALIGNED: 0.35, // |per-axis gap| ≤ this ⇒ that axis is a STRENGTH
  COHESION_AXIS_CONFLICT: 0.9, // |per-axis gap| ≥ this ⇒ that axis is a CONFLICT
  COHESION_TIER_STRONG: 70, // score ≥ ⇒ 'strong' | ≥ MIXED ⇒ 'mixed' | else 'weak'
  COHESION_TIER_MIXED: 45,

  // executionConfidence (#3) — aggregate PERCEIVED-info confidence, 0..100. Blends
  // (a) the per-assignment expectedPerformance band widths (wider ⇒ less confident),
  // (b) the D-3 film-level forecast confidence tier, (c) production difficulty
  // (budgetAdequacy = negative/requiredNegative), (d) unproven cross-discipline
  // assignments (workHistory[discipline]==0). NEVER Work Ethic (development-only).
  EXEC_CONF_BAND_W: 0.4, // weight on the (inverted) mean EP band width
  EXEC_CONF_FORECAST_W: 0.3, // weight on the D-3 confidence-tier score
  EXEC_CONF_BUDGET_W: 0.2, // weight on budgetAdequacy (production difficulty)
  EXEC_CONF_UNPROVEN_W: 0.1, // weight on the proven-assignment fraction
  EXEC_CONF_BAND_REF: 16, // EP half-width read as "fully uncertain" (EP max ≈ 16)
  EXEC_CONF_TIER_SCORE: { high: 100, medium: 60, low: 25 }, // D-3 tier → 0..100
  EXEC_CONF_TIER_STRONG: 70, // score ≥ ⇒ 'strong' | ≥ MIXED ⇒ 'mixed' | else 'weak'
  EXEC_CONF_TIER_MIXED: 45,

  // forecastProfitRange (#4) — no new numeric weights; it reuses computeBoxOffice on
  // the per-segment low/high estimates and the D-1 committed-cost identity verbatim.

  // ── D-11 Studio Employment, Contracts, Roster, Freelancer Market ─────────────
  // All calibration defaults (owner: "not immutable design truth"). The balance
  // study (run-roster-balance-study.ts) validates the resulting distributions.

  // Founding draft (D-11.2): applicant pool sizes + required starting-roster minimums.
  HIRING_DRAFT_ACTORS: 11, // applicant pool (owner range 10–12)
  HIRING_DRAFT_DIRECTORS: 4, // (owner range 3–4)
  HIRING_DRAFT_WRITERS: 6, // (owner range 5–6)
  HIRING_DRAFT_CRAFT: 3, // Production/Craft candidates (owner: 3)
  HIRING_MIN_ACTORS: 3, // required initial hires (owner: 3 as of D-11.A cycle-2; was 5)
  HIRING_MIN_DIRECTORS: 1, // (owner: 1)
  HIRING_MIN_WRITERS: 1, // (owner: 1 as of D-11.D cycle-4; was 2 — a second writer has no assignable role until persistent scripts)
  HIRING_MIN_CRAFT: 1, // (owner: 1 Production/Craft Lead)
  HIRING_FOUNDING_BUDGET: 6_000_000, // recruitment fund (signing-bonus pool; NOT cash)

  // Contract terms (D-11.4). Term stored in weeks; 1..4 years at TICKS_PER_YEAR = 52.
  CONTRACT_MIN_WEEKS: 52, // 1 year
  CONTRACT_MAX_WEEKS: 208, // 4 years
  CONTRACT_TERM_OPTIONS: [52, 104, 156, 208] as readonly number[], // 1/2/3/4-year offers

  // Contract offer pricing (D-11.6). askAnnualSalary = salaryCurve × ANNUAL_MULT ×
  // lengthFactor × ageFactor × scarcityJitter. ANNUAL_MULT MUST stay < ~9.75 so a
  // freelancer stays pricier per single film (FREELANCER_FEE_PREMIUM band, D-11.10).
  CONTRACT_ANNUAL_MULT: 3.0, // per-production salaryCurve → annual salary
  CONTRACT_LENGTH_FACTOR: { 52: 1.08, 104: 1.0, 156: 0.95, 208: 0.9 } as Record<number, number>,
  CONTRACT_AGE_PRIME: 34, // age of peak market demand (bell centered here)
  CONTRACT_AGE_FACTOR_MIN: 0.85, // youngest/oldest ageFactor floor
  CONTRACT_AGE_SPREAD: 22, // age half-spread for the ageFactor bell
  CONTRACT_SCARCITY_JITTER: 0.08, // ± deterministic jitter from the 'hiring' stream
  CONTRACT_SIGNING_BONUS_FRACTION: 0.18, // signingBonus = round(annualSalary × this)

  // Renewal / termination (D-11.7 / D-11.9).
  HIRING_RENEWAL_WINDOW_WEEKS: 12, // window opens when 0 < remaining ≤ this (owner 8–12)
  HIRING_TERMINATION_FRACTION: 0.5, // terminationCost = this × remaining guaranteed salary

  // Freelancers (D-11.10). fee = round(salaryCurve × premium); a one-time project cost.
  FREELANCER_FEE_PREMIUM: 1.5, // freelancer one-film fee vs base per-production salary
  HIRING_FREELANCER_MARKET_SIZE: 6, // rotating freelancer listing size
  HIRING_MARKET_SIZE: 8, // rotating hiring-market (contract) listing size

  // Market rotation (D-11.14). Both markets rotate on this cadence, epoch-derived.
  HIRING_MARKET_ROTATION_WEEKS: 13,

  // ── D-11.C Balanced Creator specialization (cycle 3) ─────────────────────────
  // Every Balanced-Career professional skill starts at ≥ this floor (basic transferable
  // competence); the archetype preset then shapes the primary discipline to OVR ≈ 38–45.
  // Full Custom is UNRESTRICTED (may go below the floor). The player then allocates the
  // specialization budget (+1 per authoritative skill/genre point). See BALANCED_ARCHETYPES.
  BALANCED_CREATOR_SKILL_FLOOR: 15,
  BALANCED_CREATOR_SPECIALIZATION_POINTS: 40,

  // ── D-12 Studio Economy and Theatrical Runs (all Initial Calibration Hypotheses,
  // harness-tuned, unless marked owner) ────────────────────────────────────────
  // Gross is conserved (Σ weekly = opening×legs); only the TIMING and the SHARE change,
  // and everything is gated on economyEngaged so the M0A corpus is byte-identical.
  STUDIO_RENTAL_BLENDED: 0.52, // [ICH] fraction of weekly gross the studio keeps (sweep 0.42–0.62)
  THEATRICAL_WEEKS: 6, // [ICH] N_WEEKS modeled theatrical weeks
  THEATRICAL_HOLD_BASE: 0.42, // [ICH] geometric hold at LEGS_MIN
  THEATRICAL_HOLD_LEGS_COEF: 0.09, // [ICH] hold += this × (legs − LEGS_MIN)
  THEATRICAL_TAIL_FLOOR: 0.05, // [ICH] each modeled week earns ≥ this fraction of gross
  FAME_REACH_HALF_SAT: 50, // [OWNER surface/form; ICH value] Hill K for fame→opening-reach saturation
  OVERHEAD_BASE: 15_000, // [ICH] fixed weekly studio overhead
  OVERHEAD_PER_EMPLOYEE: 1_500, // [ICH] weekly overhead per contracted employee
  ECONOMY_MODEL_VERSION: 1, // [OWNER] 1 = D-12 blended-share theatrical run (0 = legacy full-gross)

  // ── D-12 owner calibration P2 (2026-07-28) ─────────────────────────────────
  // All THREE constants apply ONLY when the D-12 economy is engaged (saturateFame),
  // so the M0A corpus stays byte-identical (the non-engaged box-office path is the
  // legacy MARKETING_HALF_SATURATION Hill with no gross scale). See
  // docs/D-12-owner-calibration-contract.md.
  //
  // (1) Routine opening/gross scale — the single canonical multiplier on the ENGAGED
  // opening (and thus total + the conserved weekly schedule), applied once, after
  // creative/talent/Fame/Marketing determine opening and before the schedule + share.
  // Selected by the integrated owner-route gates: the highest value in [0.65,0.70] that
  // keeps money meaningfully constrained (competent 4-film median ~1.0–1.6×).
  ECONOMY_BOX_OFFICE_SCALE: 0.7, // [ICH; owner range 0.65–0.70] — selected: highest value passing the
  // four-film gates (competent median ~1.25×, p90 ~2.0–2.1×, ≥1 loss in 4 ≈ 47%, some runs below start).
  // (2) Awareness-conditioned Marketing efficient capacity. When engaged, the marketing
  // half-saturation is not a fixed 400k but scales with the film's PRE-marketing awareness
  // (studio audience awareness + the film's own opening appeal reach): a low-awareness film
  // saturates cheaply (CAP_MIN), a high-awareness event film absorbs a wide campaign (CAP_MAX).
  // capacity = CAP_MIN + (CAP_MAX − CAP_MIN) · awareness^EXP; marketingQuality = spend/(spend+capacity).
  // The EXP > 1 makes low-awareness films saturate their (small) capacity fast, so a maximum campaign
  // on a not-yet-visible film is wasted — an interior optimum — while a genuinely visible film still
  // absorbs a wide campaign efficiently. A NEW studio (low audience awareness) is therefore rarely
  // able to justify a maximum campaign until it has built awareness — the intended shape.
  MARKETING_CAPACITY_MIN: 15_000, // [ICH] efficient marketing capacity at zero pre-marketing awareness
  MARKETING_CAPACITY_MAX: 1_800_000, // [ICH] efficient marketing capacity at full pre-marketing awareness
  MARKETING_AWARENESS_STANDING_WEIGHT: 0.7, // [ICH] blend: studio audience awareness vs film opening-appeal reach (a NEW studio can't push a big campaign until it builds awareness)
  MARKETING_AWARENESS_EXP: 1.3, // [ICH] capacity ∝ awareness^EXP (capital-frontier fix: 2.0→1.3 so a low-awareness studio's capacity is larger → a Large campaign for a high-potential film keeps converting; a limited film still wastes it via low appeal + overexposure)
  // Stage A: MAXIMUM effective Marketing reach — the ceiling on how much of a film's opening reach a
  // campaign can supply, scaled by pre-marketing awareness. A not-yet-visible film converts even a
  // saturated campaign into only a little reach (so beyond efficient capacity, incremental reach
  // collapses and a maximum campaign overspends), while a visible film's campaign can carry a large
  // share of its reach. Replaces the flat 0.4 marketing weight in the ENGAGED path only (the legacy
  // non-engaged path keeps the fixed 0.4 for M0A byte-identity). Both marketing gross channels (base
  // awareness + the promise-specificity bonus) consume this single effective-Marketing value.
  MARKETING_REACH_MIN: 0.1, // [ICH] effective marketing reach ceiling at zero pre-marketing awareness
  MARKETING_REACH_MAX: 0.55, // [ICH] effective marketing reach ceiling at full pre-marketing awareness
  // ── D-12 discoverability (engaged only): reduce the organic opening FLOOR ─────
  // Capital-frontier fix. In M0A baseAwareness weights studio audience-awareness at 0.6 — every legal
  // film gets a large guaranteed reach even with no star draw and Small marketing (no obscurity risk).
  // Engaged play uses a lower weight so an unknown-cast, small-marketing film can genuinely fail to
  // find an audience — while established Awareness, Star Power, and paid Marketing still drive reach,
  // and a strong film can still build word of mouth (legs) after a weak opening. M0A keeps 0.6.
  ORGANIC_AWARENESS_FLOOR_WEIGHT: 0.52, // [ICH] engaged weight on studio audience awareness in baseAwareness (M0A literal 0.6) — a gentle cut: enough obscurity risk for unknown+small films without crushing established/marketed reach
  // Stage B: deterministic OVEREXPOSURE pressure (engaged only; NO new RNG, NO critic effect). Spending
  // far beyond a film's efficient marketing capacity raises audience expectations the delivered movie
  // must satisfy; when it under-delivers (low weighted audience score) those expectations sour and the
  // film FRONT-LOADS — its LEGS (hold) shrink. A film that delivers keeps its legs, so a genuine
  // high-awareness event film can still rationally run a maximum campaign; a weak or mismarketed film
  // that overspends loses money. Opening reach and critic score are untouched.
  OVEREXPOSURE_THRESHOLD: 1.3, // [ICH] overexposure begins above this spend÷capacity ratio
  OVEREXPOSURE_RANGE: 2.0, // [ICH] ratio span from threshold to full overexposure
  OVEREXPOSURE_LEGS_COEF: 0.5, // [ICH] max fractional LEGS reduction at full overexposure × full delivery gap
  // A film that DELIVERS (weighted audience score ≥ REF) creates no expectation gap — it withstands a
  // big campaign. The gap opens only as delivery falls below REF, saturating at REF − RANGE.
  OVEREXPOSURE_DELIVERY_REF: 58, // [ICH] audience score at/above which a big campaign is fully justified
  OVEREXPOSURE_DELIVERY_RANGE: 28, // [ICH] audience-score span over which the delivery gap opens to full

  // ── D-12 production-budget realization/reliability (engaged only) ───────────
  // A SEPARATE engaged-only layer ON TOP of the frozen M0A `budgetAdequacy` (which is left unchanged
  // in computeCraft/computeDeterministicCore). It answers "how much funding does THIS film need to
  // realize its ambition reliably", using the film's production DEMAND = requiredNegative (concept
  // base cost × shape budgetDemandMultiplier × era). Under-funding a DEMANDING film (high demand)
  // materially lowers realized craft; a contained film barely notices. Over-funding has sharply
  // diminishing craft returns (a little execution protection), and never multiplies box office or
  // buys critic points on its own. It is a deterministic craft delta — no new RNG, engaged-gated so
  // M0A stays byte-identical. See docs/D-12-owner-calibration-contract.md.
  BUDGET_UNDERFUND_COEF: 60, // [ICH] max craft points lost at full shortfall × full ambition
  BUDGET_AMBITION_REF: 0.8, // [ICH] budgetDemandMultiplier at/below which underfunding sensitivity ≈ 0 (contained)
  BUDGET_AMBITION_RANGE: 0.38, // [ICH] demand span to full ambition sensitivity (0.95 → 1.40)
  BUDGET_AMBITION_MIN: 0.15, // [ICH] floor: even a contained film loses a little if severely underfunded
  BUDGET_OVERFUND_COEF: 4, // [ICH] max craft protection from over-funding (small; diminishing)
  BUDGET_OVERFUND_SCALE: 0.3, // [ICH] over-funding diminishing-return scale (ratio units above 1.0)

  // ── D-12 script potential → commercial opportunity (engaged only) ────────────
  // Capital-frontier fix (owner 2026-07-30, audit verdict D). Two engaged-only levers make a
  // script's baseline potential matter commercially WITHOUT price ever multiplying box office:
  //  (1) beginFounding correlates negative-cost with baselineStrength (a rank-blend, no RNG; M0A
  //      never calls beginFounding, so non-engaged concept values are byte-identical) so price is
  //      a PROBABILISTIC market signal of potential — overlapping, never deterministic.
  //  (2) a delivery-GATED segment-appeal term lets high-potential material realize a higher audience
  //      CEILING only in proportion to how well it is delivered (craft) — so an underfunded premium
  //      script is an expensive flop, not a guaranteed win. Flows through the existing craft→appeal→
  //      reach/legs systems; never a price multiplier, never a critic-score multiplier.
  SCRIPT_COST_POTENTIAL_CORRELATION: 0.4, // [ICH] cost↔baselineStrength rank-blend (0 = independent, 1 = deterministic; <1 keeps overlap)
  SCRIPT_POTENTIAL_APPEAL_COEF: 22, // [ICH] max segment-appeal points a top-potential script adds WHEN fully delivered (craft=100)
  SCRIPT_POTENTIAL_REF: 60, // [ICH] baselineStrength reference (mean): appeal delta = coef·clamp((strength−ref)/40,0,1)·(craft/100) — UPSIDE only, so a limited script's lower ceiling comes from correlation (lower craft), not an appeal penalty

  // ── D-12 final downside: engaged retention (legs) reshape ───────────────────
  // The M0A legs curve `LEGS_MIN(1.8) + (LEGS_MAX-LEGS_MIN)·(WAS/100)` has a 1.8× floor — even a
  // genuine bomb multiplies its opening by ≥1.8×, so weak delivery can never collapse a film. That
  // floor is FROZEN (M0A byte-identity). This engaged-only reshape gives retention a LOWER floor and a
  // CONVEX response so delivered audience satisfaction (weighted audience score) actually governs word
  // of mouth: a poorly-delivered film opens and fades (legs → ~1), a well-delivered film holds (→ LEGS_MAX).
  // Engaged legs = LEGS_MIN_ENGAGED + (LEGS_MAX − LEGS_MIN_ENGAGED)·(WAS/100)^LEGS_RETENTION_EXP, then the
  // overexposure penalty applies as before. Not engaged ⇒ the legacy linear curve (byte-identical).
  LEGS_MIN_ENGAGED: 1.2, // [ICH] engaged retention floor (a true bomb opens and dies)
  LEGS_RETENTION_EXP: 1.4, // [ICH] convex WAS→legs response (>1 ⇒ weak delivery retains poorly)
} as const

// ── §5.1 cast weighting ──────────────────────────────────────────────────────
export const CAST_WEIGHT: Record<CastSlot, number> = { lead: 1.0, antagonist: 0.6, support: 0.35 }

// ── §5.2 expressive contribution weighting ───────────────────────────────────
// Axis-specific, NOT whole-vector negation. Antagonistic contrast reverses
// relational warmth; it does not reverse tone or kinetics.
export const SLOT_TRANSFORM: Record<CastSlot, Expression> = {
  lead: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
  antagonist: { intimacy: -1, tonalWeight: 1, kineticEnergy: 1 },
  support: { intimacy: 1, tonalWeight: 1, kineticEnergy: 1 },
}

// Contributor set for the centroid: writer, director, cast slots, shape.
export const ROLE_WEIGHT = {
  writer: 1.0,
  director: 1.6,
  lead: 1.4,
  antagonist: 0.8,
  support: 0.5,
  shape: 1.2,
} as const

// ── §5.3 cultural-force tuning vectors ───────────────────────────────────────
export const FORCE_VECTORS: Record<CulturalForce, Expression> = {
  escapism: { intimacy: 0.2, tonalWeight: -0.6, kineticEnergy: 0.4 },
  patriotism: { intimacy: 0.1, tonalWeight: 0.5, kineticEnergy: 0.4 },
  realism: { intimacy: 0.5, tonalWeight: 0.4, kineticEnergy: -0.4 },
  darkness: { intimacy: -0.3, tonalWeight: 0.8, kineticEnergy: 0.0 },
  optimism: { intimacy: 0.6, tonalWeight: -0.4, kineticEnergy: 0.1 },
  spectacle: { intimacy: -0.4, tonalWeight: 0.1, kineticEnergy: 0.9 },
}

// ── §6 standing ──────────────────────────────────────────────────────────────
export const INITIAL_STANDING: Standing = {
  audienceAwareness: 40,
  industryPrestige: 40,
  commercialConfidence: 50,
}

// ── §9 world generation config ───────────────────────────────────────────────
export const WORLD_CONFIG = {
  talentCount: 60,
  conceptCount: 30,
  marketValueRange: [20_000_000, 80_000_000] as [number, number],
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// D-9 Multi-Discipline Talent — named tables (large, non-scalar; kept as their own
// exports beside CAST_WEIGHT/FORCE_VECTORS per the contract's table pattern).
// Every table is declared in a FIXED field order so Object.keys iteration and
// stableStringify are stable (D-9.16).
// ═══════════════════════════════════════════════════════════════════════════════

// D-9.1 — the six skill keys per discipline, in the exact D-9.1 order. Drives
// every deterministic draw, weighted mean, and Record insertion order.
export const SKILL_ORDER = {
  acting: [
    'actingTechnique',
    'emotionalRange',
    'dialogueDelivery',
    'comicTiming',
    'physicalPerformance',
    'screenPresence',
  ],
  writing: [
    'storyStructure',
    'characterDevelopment',
    'dialogue',
    'originality',
    'narrativePacing',
    'rewriting',
  ],
  directing: [
    'visualStorytelling',
    'performanceDirection',
    'toneControl',
    'directingPacing',
    'productionManagement',
    'adaptability',
  ],
  craft: [
    'cinematography',
    'editing',
    'productionDesign',
    'soundAndMusic',
    'effectsExecution',
    'technicalCoordination',
  ],
} as const satisfies Record<Discipline, readonly string[]>

// Fixed discipline iteration order (D-9.16): acting → writing → directing → craft.
export const DISCIPLINE_ORDER: readonly Discipline[] = [
  'acting',
  'writing',
  'directing',
  'craft',
] as const

// Fixed genre iteration order (matches worldgen's GENRE_ORDER; drives the 24
// (discipline,genre) genre-experience records so their key order is stable).
export const GENRE_ORDER: readonly Genre[] = [
  'comedy',
  'drama',
  'crime',
  'romance',
  'horror',
  'adventure',
] as const

// role → primary discipline mapping (D-9.13 step 1).
export const ROLE_TO_DISCIPLINE = {
  writer: 'writing',
  director: 'directing',
  actor: 'acting',
  craft: 'craft',
} as const satisfies Record<'writer' | 'director' | 'actor' | 'craft', Discipline>

// ═══════════════════════════════════════════════════════════════════════════════
// RULING B (2026-07-26) — multi-hyphenate generation mixture (D-9.13 step 4 retune)
// ═══════════════════════════════════════════════════════════════════════════════
// The old single "secondary at μ = primary−(8..22)" scheme almost never cleared the
// (unchanged) roleOVR weakness/breadth penalties, so genuine multi-hyphenates were
// effectively absent. This replaces it with an ARCHETYPE MIXTURE that generates
// genuinely strong, broad SECONDARY SKILLS (never an OVR-formula bonus — the SAME
// roleOVR applies to every discipline). The PRIMARY distribution is untouched (only
// non-primary disciplines are enriched), so M0A/D-6 calibration (role-partitioned,
// primary-only) does not move. Frequencies calibrated (in-process sample) to:
//   ~11% of talent have ≥1 non-primary discipline with roleOVR ≥ 60,
//   ~4% ≥70, ~0.6% ≥80, two secondaries ≥60 rare, three ≥60 very rare,
// with NO material increase in 90+/95+/99 counts (secondaries top out well below).

// GEN_ARCHETYPE_MIX — the five archetypes' frequencies (sum = 1, checked below).
// Walked once per talent from the 'talent-secondary' substream (the FIRST draw).
//   ordinary    — strong primary, all three secondaries weak (the majority).
//   adjacent    — ONE usable ADJACENT secondary (an adjacent creative).
//   prospect    — ONE usable, stronger secondary (a genuine multi-hyphenate prospect,
//                 possibly low fame/unproven — fame is an independent stream).
//   established — TWO usable secondaries (a rare established multi-hyphenate).
//   triple      — THREE usable secondaries (a very-rare triple-threat).
export const GEN_ARCHETYPE_MIX = {
  ordinary: 0.72,
  adjacent: 0.175,
  prospect: 0.065,
  established: 0.03,
  triple: 0.01,
} as const

// GEN_SECONDARY_BANDS — per-archetype usable-secondary skill CENTER band. The
// center μ_sec = clamp(c + corr·(μ_primary − 60) + N(0, sd), floor, cap). `corr` is
// a MODEST positive tendency (stronger primaries lean to stronger secondaries), NOT
// a rule. Centers/caps are tuned so most usable secondaries land in the 60–69
// "Limited-or-developing" OVR band, with a thin 70+ tail and a very thin 80+ tail,
// and never a 90+ (caps ≤ 81). Persona/temperament plays NO part here.
export const GEN_SECONDARY_BANDS = {
  adjacent: { c: 66, corr: 0.28, sd: 5.5, floor: 52, cap: 79 },
  prospect: { c: 69, corr: 0.26, sd: 5.0, floor: 58, cap: 80 },
  established: { c: 69, corr: 0.28, sd: 4.5, floor: 60, cap: 81 },
  triple: { c: 67, corr: 0.26, sd: 4.5, floor: 56, cap: 80 },
} as const satisfies Record<
  string,
  { c: number; corr: number; sd: number; floor: number; cap: number }
>

// GEN_ADJACENCY — modest discipline adjacency correlations (tendencies, not rules)
// used to WEIGHT which non-primary discipline(s) become the usable secondary. Read
// as GEN_ADJACENCY[primary][candidate]. Writing↔Directing strongest; Acting↔Directing
// moderate; Acting↔Writing moderate/weak; Craft↔Directing moderate; Craft↔Acting weak.
// (Not every writer is a director — a positive weight is only a lean, and only the
// selected archetype grants a usable secondary at all.)
export const GEN_ADJACENCY: Record<Discipline, Partial<Record<Discipline, number>>> = {
  writing: { acting: 0.5, directing: 1.0, craft: 0.2 },
  directing: { acting: 0.6, writing: 1.0, craft: 0.5 },
  acting: { writing: 0.5, directing: 0.6, craft: 0.2 },
  craft: { acting: 0.2, writing: 0.2, directing: 0.5 },
}

// ── D-9.2 OVR core-weights (6-vectors in SKILL_ORDER, Σ = 1 per discipline) ────
export const OVR_WEIGHTS = {
  // acting: presence + emotionalRange lead; comicTiming softest.
  acting: [0.18, 0.2, 0.16, 0.1, 0.14, 0.22],
  // writing: structure + character lead; rewriting softest.
  writing: [0.2, 0.2, 0.16, 0.14, 0.17, 0.13],
  // directing: performanceDirection + visualStorytelling lead.
  directing: [0.2, 0.2, 0.18, 0.14, 0.15, 0.13],
  // craft: balanced (inert headless — D-4/OQ-6).
  craft: [0.17, 0.17, 0.17, 0.17, 0.16, 0.16],
} as const satisfies Record<Discipline, readonly number[]>

// ── D-9.3 base per-genre skill profiles (unnormalized 6-vectors in SKILL_ORDER) ─
// Normalized at use in projectSkillWeights. Weights need not sum to 1.
export const GENRE_SKILL_WEIGHTS = {
  acting: {
    // [actingTechnique, emotionalRange, dialogueDelivery, comicTiming, physicalPerformance, screenPresence]
    comedy: [1.0, 0.8, 1.2, 2.0, 0.7, 1.1],
    drama: [1.2, 2.0, 1.4, 0.4, 0.6, 1.2],
    crime: [1.3, 1.2, 1.1, 0.4, 1.0, 1.4],
    romance: [1.0, 1.8, 1.3, 0.8, 0.6, 1.3],
    horror: [1.1, 1.3, 0.7, 0.3, 1.6, 1.2],
    adventure: [1.0, 0.8, 0.8, 0.6, 1.9, 1.4],
  },
  writing: {
    // [storyStructure, characterDevelopment, dialogue, originality, narrativePacing, rewriting]
    comedy: [1.0, 1.1, 1.9, 1.3, 1.4, 1.0],
    drama: [1.4, 1.9, 1.4, 1.1, 1.0, 1.1],
    crime: [1.8, 1.2, 1.1, 1.2, 1.5, 1.1],
    romance: [1.1, 1.8, 1.5, 1.0, 1.1, 1.0],
    horror: [1.3, 1.0, 0.8, 1.4, 1.8, 1.1],
    adventure: [1.7, 1.0, 0.9, 1.3, 1.5, 1.0],
  },
  directing: {
    // [visualStorytelling, performanceDirection, toneControl, directingPacing, productionManagement, adaptability]
    comedy: [1.0, 1.5, 1.3, 1.8, 0.9, 1.1],
    drama: [1.2, 1.9, 1.5, 1.0, 0.9, 1.0],
    crime: [1.4, 1.3, 1.7, 1.3, 1.0, 1.0],
    romance: [1.1, 1.8, 1.5, 1.0, 0.9, 1.0],
    horror: [1.5, 1.2, 1.8, 1.4, 0.9, 1.1],
    adventure: [1.7, 1.0, 1.1, 1.3, 1.5, 1.3],
  },
  craft: {
    // Uniform 1.0 (CRAFT_GENRE_UNIFORM), effectsExecution → 1.6 for horror/adventure.
    // [cinematography, editing, productionDesign, soundAndMusic, effectsExecution, technicalCoordination]
    comedy: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    drama: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    crime: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    romance: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
    horror: [1.0, 1.0, 1.0, 1.0, 1.6, 1.0],
    adventure: [1.0, 1.0, 1.0, 1.0, 1.6, 1.0],
  },
} as const satisfies Record<Discipline, Record<Genre, readonly number[]>>

// ── D-9.3 shape → skill nudges (multipliers on the named skill; absent = 1.0) ──
// Keyed by FilmShape slot value. Each entry maps a skill name → multiplier.
export const SHAPE_SKILL_MODS: Record<string, Record<string, number>> = {
  // opening
  immediateAction: { physicalPerformance: 1.25, directingPacing: 1.2, narrativePacing: 1.2 },
  slowSetup: { emotionalRange: 1.15, characterDevelopment: 1.2, toneControl: 1.15 },
  mysteryHook: { storyStructure: 1.2, visualStorytelling: 1.15 },
  // midpoint
  reversal: { storyStructure: 1.2, rewriting: 1.15 },
  escalation: { physicalPerformance: 1.15, directingPacing: 1.15 },
  revelation: { emotionalRange: 1.15, performanceDirection: 1.15 },
  // ending
  triumph: { physicalPerformance: 1.1, narrativePacing: 1.1 },
  bittersweet: { emotionalRange: 1.2, toneControl: 1.2, characterDevelopment: 1.15 },
  tragic: { emotionalRange: 1.2, toneControl: 1.2, characterDevelopment: 1.15 },
  ambiguous: { toneControl: 1.2, originality: 1.15 },
}

// ── D-9.3 promise → skill nudges (keyed by a signal name; see projectSkillWeights)
export const PROMISE_SKILL_MODS = {
  seriousTone: { emotionalRange: 1.15, toneControl: 1.15, characterDevelopment: 1.1 }, // tMid ≥ +0.4
  lightTone: { comicTiming: 1.2, dialogue: 1.1 }, // tMid ≤ −0.4
  kinetic: { physicalPerformance: 1.2, visualStorytelling: 1.15, directingPacing: 1.15 }, // kMid ≥ +0.4
  intimate: { emotionalRange: 1.1, dialogueDelivery: 1.1, performanceDirection: 1.1 }, // iMid ≥ +0.4
  specific: { toneControl: 1.1, storyStructure: 1.05 }, // specificity ≥ 0.5
} as const satisfies Record<string, Record<string, number>>

// The promise-signal thresholds (D-9.3) — named so they are not inlined.
export const PROMISE_MOD_THRESHOLDS = {
  tonalSerious: 0.4,
  tonalLight: -0.4,
  kinetic: 0.4,
  intimate: 0.4,
  specific: 0.5,
} as const

// ── D-9.3 cast slot → skill nudges (actors only; absent = 1.0) ─────────────────
export const SLOT_SKILL_MODS: Record<CastSlot, Record<string, number>> = {
  lead: { emotionalRange: 1.2, screenPresence: 1.2 },
  antagonist: { screenPresence: 1.3, physicalPerformance: 1.1, emotionalRange: 0.9 },
  support: {}, // flat 1.0 — generalist
}

// ── D-9.8 temperament display bands (thresholds ascending; 5 words per axis) ───
// Buckets: ≤ −0.6 | (−0.6,−0.2] | (−0.2,+0.2] | (+0.2,+0.6] | > +0.6.
export const TEMPER_BANDS = {
  thresholds: [-0.6, -0.2, 0.2, 0.6] as const, // four cut points → five bands
  warmth: ['Cold', 'Reserved', 'Even', 'Warm', 'Radiant'] as const,
  gravity: ['Playful', 'Light', 'Balanced', 'Serious', 'Grave'] as const,
  physicality: ['Still', 'Subtle', 'Measured', 'Kinetic', 'Explosive'] as const,
} as const

// ── D-9.10 potential tier thresholds (upside = estOVR − currentOVR) ────────────
// tierOf(upside): < 3 Limited · 3–8 Steady · 9–15 Promising · 16–24 High Upside · ≥25 Exceptional.
export const POTENTIAL_TIER_THRESHOLDS = {
  steady: 3,
  promising: 9,
  highUpside: 16,
  exceptionalUpside: 25,
} as const

// ── D-9.14 authored budget tier costs + ceiling-OVR bands (per PotentialTier) ──
export const AUTHORED_TIER_COST = {
  Limited: 5,
  Steady: 12,
  Promising: 22,
  HighUpside: 32,
  ExceptionalUpside: 40,
  GenerationalUpside: 45,
} as const satisfies Record<PotentialTier, number>

// The ceiling-OVR band drawn per tier (the range shown to the player). Authored
// only; worldgen never uses these (its ceilings come from headroom, D-9.13).
export const AUTHORED_TIER_RANGE = {
  Limited: [40, 55],
  Steady: [55, 68],
  Promising: [68, 82],
  HighUpside: [82, 91],
  ExceptionalUpside: [91, 96],
  GenerationalUpside: [96, 99],
} as const satisfies Record<PotentialTier, readonly [number, number]>

// Authored talent's starting primary-discipline skill center (D-9.14, keeps the
// spirit of AUTHORED_START_SKILL = 35).
export const AUTHORED_START_OVR = 35

// ═══════════════════════════════════════════════════════════════════════════════
// D-11.C — Balanced Creator archetype presets (cycle 3)
// ═══════════════════════════════════════════════════════════════════════════════
// The profession-shaped BASELINE profile before the player spends the 40 specialization
// points. `primarySkills` are 6 absolute values in SKILL_ORDER for the primary discipline,
// tuned (validated with the authoritative roleOVR, NOT a creator formula — see the
// creator-baseline calibration study) so the pre-specialization primary OVR lands ≈ 38–45
// for focused prospects (High-Upside intentionally lower current OVR; Polished near the top).
// Archetypes distribute the six skills DIFFERENTLY so same-OVR people feel distinct.
// `secondaryBaseline` sets all non-primary skills (secondary OVR ≈ 15–28; ≥ the floor).
// A multi-hyphenate raises ONE adjacent secondary via `secondaryBoost`. `genreBaseline` is
// a small primary-discipline genre-experience start. Presets set ONLY authoritative values.
// PERCENTILE-CALIBRATED (owner amendment 2026-07-27): baselines tuned so a focused
// prospect lands ≈ 30–50th percentile pre-spec and ≈ 40–60th post-spec within the
// working-age/signable/matching-profession population (median primary OVR ≈ 43). Raw OVR
// is a consequence of the percentile target, not the target itself. See the calibration
// study (run-creator-baseline-study.ts). ONLY these baselines were tuned — never the
// global roleOVR / generated distribution / development / D-6 / market rules.
export const BALANCED_ARCHETYPES: readonly ArchetypePreset[] = [
  // ── Acting ──
  { id: 'balancedActingProspect', label: 'Balanced Acting Prospect', appliesTo: 'acting',
    primarySkills: [56, 56, 56, 56, 56, 56], secondaryBaseline: 42, genreBaseline: { drama: 15 },
    defaultPotentialTier: 'Steady', defaultWorkEthic: 60, fame: 8 },
  { id: 'comedyProspect', label: 'Comedy Prospect', appliesTo: 'acting',
    primarySkills: [54, 49, 60, 66, 53, 57], secondaryBaseline: 42, genreBaseline: { comedy: 30, drama: 12 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 60, fame: 10 },
  { id: 'dramaticProspect', label: 'Dramatic Prospect', appliesTo: 'acting',
    primarySkills: [58, 64, 57, 45, 52, 59], secondaryBaseline: 42, genreBaseline: { drama: 30, romance: 12 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 62, fame: 9 },
  { id: 'physicalPerformer', label: 'Physical Performer', appliesTo: 'acting',
    primarySkills: [55, 49, 51, 51, 69, 60], secondaryBaseline: 42, genreBaseline: { adventure: 25, crime: 12 },
    defaultPotentialTier: 'Steady', defaultWorkEthic: 58, fame: 9 },
  // ── Writing ──
  { id: 'balancedWritingProspect', label: 'Balanced Writing Prospect', appliesTo: 'writing',
    primarySkills: [56, 56, 56, 56, 56, 56], secondaryBaseline: 42, genreBaseline: { drama: 15 },
    defaultPotentialTier: 'Steady', defaultWorkEthic: 62, fame: 5 },
  { id: 'dialogueSpecialist', label: 'Dialogue Specialist', appliesTo: 'writing',
    primarySkills: [52, 54, 68, 54, 53, 55], secondaryBaseline: 42, genreBaseline: { comedy: 22, drama: 15 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 62, fame: 5 },
  { id: 'storyArchitect', label: 'Story Architect', appliesTo: 'writing',
    primarySkills: [68, 54, 52, 55, 55, 53], secondaryBaseline: 42, genreBaseline: { crime: 22, drama: 12 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 64, fame: 5 },
  { id: 'originalVoice', label: 'Original Voice', appliesTo: 'writing',
    primarySkills: [53, 53, 55, 68, 53, 52], secondaryBaseline: 42, genreBaseline: { horror: 20 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 60, fame: 6 },
  // ── Directing ──
  { id: 'balancedDirectingProspect', label: 'Balanced Directing Prospect', appliesTo: 'directing',
    primarySkills: [56, 56, 56, 56, 56, 56], secondaryBaseline: 42, genreBaseline: { drama: 15 },
    defaultPotentialTier: 'Steady', defaultWorkEthic: 62, fame: 6 },
  { id: 'visualDirector', label: 'Visual Director', appliesTo: 'directing',
    primarySkills: [68, 51, 55, 55, 54, 53], secondaryBaseline: 42, genreBaseline: { adventure: 22 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 62, fame: 7 },
  { id: 'performanceDirector', label: 'Performance Director', appliesTo: 'directing',
    primarySkills: [53, 68, 56, 52, 53, 55], secondaryBaseline: 42, genreBaseline: { drama: 22 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 63, fame: 7 },
  // ── Craft ──
  { id: 'balancedCraftProspect', label: 'Balanced Craft Prospect', appliesTo: 'craft',
    primarySkills: [56, 56, 56, 56, 56, 56], secondaryBaseline: 42, genreBaseline: { drama: 15 },
    defaultPotentialTier: 'Steady', defaultWorkEthic: 60, fame: 4 },
  { id: 'cinematographyProspect', label: 'Cinematography Prospect', appliesTo: 'craft',
    primarySkills: [68, 53, 55, 52, 52, 55], secondaryBaseline: 42, genreBaseline: { adventure: 18 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 60, fame: 4 },
  { id: 'effectsSpecialist', label: 'Effects Specialist', appliesTo: 'craft',
    primarySkills: [52, 52, 53, 53, 68, 55], secondaryBaseline: 42, genreBaseline: { horror: 20, adventure: 15 },
    defaultPotentialTier: 'Promising', defaultWorkEthic: 60, fame: 4 },
  // ── Career path (any profession) ──
  // D-11.D: labelled "Raw Prospect" (a low-current-ability STARTING SKILL PROFILE), not
  // "High-Upside" — the upside now lives solely in the separate Career Potential control
  // (defaultPotentialTier 'HighUpside'), so the two creator dropdowns stop duplicating "upside".
  { id: 'highUpsideProspect', label: 'Raw Prospect', appliesTo: 'any',
    primarySkills: [52, 52, 52, 52, 52, 52], secondaryBaseline: 38, genreBaseline: {},
    defaultPotentialTier: 'HighUpside', defaultWorkEthic: 85, fame: 4 },
  { id: 'polishedLowCeiling', label: 'Polished Low-Ceiling Professional', appliesTo: 'any',
    primarySkills: [60, 60, 60, 60, 60, 60], secondaryBaseline: 44, genreBaseline: { drama: 18 },
    defaultPotentialTier: 'Limited', defaultWorkEthic: 55, fame: 12 },
  { id: 'multiHyphenateProspect', label: 'Multi-Hyphenate Prospect', appliesTo: 'any',
    primarySkills: [54, 54, 54, 54, 54, 54], secondaryBaseline: 42,
    secondaryBoost: { role: 'director', skills: [52, 52, 52, 52, 52, 52] }, genreBaseline: {},
    defaultPotentialTier: 'Promising', defaultWorkEthic: 68, fame: 6 },
] as const satisfies readonly ArchetypePreset[]
