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
