// ── §7 Forecast pipeline ─────────────────────────────────────────────────────
// Computed at greenlight from greenlight-available information only. It must not
// reference realized scores (§15.6 forecast-independence test).
//
// Structure (rev. 4 B16/M7/B14/D-3/B17/M9):
//   - Deterministic per-segment centers = the §5.4 segmentAppeal computation with
//     NO sampled terms (criticScore := criticMean), at current standing/market.
//     This pass NEVER touches the sim stream (forecastCenters below).
//   - ONE film-level gaussian offset drawn from the DERIVED forecast stream
//     stream(seed, 'forecast', productionId) — never the sim stream (M9). Sigma =
//     TUNING.FORECAST_SIGMA[confidence]; confidence is film-level (D-3).
//   - estimate_s = clamp(center_s + offset, 0, 100); low/high = clamp(estimate ∓
//     CONFIDENCE_INTERVAL_WIDTH[confidence], 0, 100); band from estimate_s.
//   - expectedOpening/expectedTotal = §5.5 applied to the NOISY clamped estimates
//     (B16); expectedCriticScore = the deterministic criticMean.
//
// Pure module: no React/DOM/async/IO. Randomness only via the derived forecast
// stream, which is stateless (derived on demand from the run seed) — replays exact.

import { clamp, mean, remap, smoothstep, lerp } from './math.js'
import { computeSegmentAppeal, type ReceptionInputs, computeBoxOffice, budgetRealizationDelta } from './reception.js'
import { specificity } from './shape.js'
import { stream } from './rng.js'
import { CAST_WEIGHT, FORCE_VECTORS, ROLE_WEIGHT, TUNING } from './tuning.js'
import type {
  CastSlot,
  Confidence,
  CulturalForce,
  Expression,
  FilmConcept,
  FilmResult,
  Forecast,
  ForecastBand,
  ForecastFactorKey,
  SegmentForecast,
  SegmentId,
} from './types.js'
import { magnitude, personaToExpression, safeCosine } from './vector.js'
import { castContribution, roleFit } from './reception.js'
import { castSlotExecution, effectiveSkill } from './talentSummary.js'

const CAST_SLOTS: CastSlot[] = ['lead', 'antagonist', 'support']

// §7 band thresholds: <40 weak | 40–70 mixed | >70 strong.
export function bandOf(score: number): ForecastBand {
  if (score < 40) return 'weak'
  if (score > 70) return 'strong'
  return 'mixed'
}

// The deterministic quantities a forecast reads. Shares ReceptionInputs' shape but
// standing/market are current (greenlight-time) values.
export type ForecastInputs = ReceptionInputs

// The deterministic core that §5.4 segment centers depend on: craft, delivered,
// criticMean, timelinessContribution. Recomputed here WITHOUT any sampled term so
// forecastCenters never draws from any stream. Mirrors §5.1–§5.3 up to criticMean.
// EXPORTED (Phase 5.1 CYCLE 3) as a READ-ONLY type so the additive filmPackage.ts
// UI summaries can consume the intermediate PERCEIVED quantities `forecastCenters`
// already computes-and-discards (scriptStrength/directorExecution/castWeightedRoleFit).
// This is a type export only — the computation and its formulas are unchanged.
export type DeterministicCore = {
  craft: number
  delivered: Expression
  criticMean: number
  timelinessContribution: number
  // §5.1 sub-terms the B14 causal thresholds read.
  scriptStrength: number
  directorExecution: number
  castWeightedRoleFit: number
  // §5.1 production-difficulty read (0..100). Already computed below; now RETURNED
  // (Phase 5.1 CYCLE 3) so the filmPackage.ts execution-confidence summary can read
  // production difficulty without re-deriving the §5.1 formula. Additive field only —
  // the value and its formula are unchanged (identical to reception.ts:190-195).
  budgetAdequacy: number
}

function computeDeterministicCore(inp: ForecastInputs, engaged = false): DeterministicCore {
  // §5.1 craft — D-9.5: the identical FOUR reads, but use = 'perceived' (forecast
  // reads perceived; reception reads actual). Structure downstream unchanged.
  // RULING C (2026-07-26): the shape being greenlit (`inp.shape`, the raw FilmShape)
  // is threaded as the trailing arg so SHAPE_SKILL_MODS reweights the perceived
  // forecast identically to how reception reweights the actual result — the shared
  // projectSkillWeights path. Forecast uses the shape being greenlit; reception uses
  // production.shape (the same locked value once greenlit).
  const scriptStrength =
    inp.scriptStrengthOverride?.perceived ??
    (0.6 * inp.concept.baselineStrength +
      0.4 *
        effectiveSkill(
          inp.writer,
          'writing',
          inp.concept,
          undefined,
          inp.shapeEffects,
          inp.promise,
          'perceived',
          inp.shape,
        ))
  const directorExecution = effectiveSkill(
    inp.director,
    'directing',
    inp.concept,
    undefined,
    inp.shapeEffects,
    inp.promise,
    'perceived',
    inp.shape,
  )

  let castNum = 0
  let castDen = 0
  let fitNum = 0
  for (const slot of CAST_SLOTS) {
    const t = inp.cast[slot]
    const fit = roleFit(t, inp.concept.roleRequirements[slot])
    castNum +=
      CAST_WEIGHT[slot] *
      castSlotExecution(
        t,
        inp.concept,
        slot,
        inp.shapeEffects,
        inp.promise,
        'perceived',
        inp.shape,
      )
    castDen += CAST_WEIGHT[slot]
    fitNum += CAST_WEIGHT[slot] * fit
  }
  const castExecution = castNum / castDen
  const castWeightedRoleFit = fitNum / castDen

  const technical =
    inp.craftHires.length > 0
      ? mean(
          inp.craftHires.map((c) =>
            effectiveSkill(c, 'craft', inp.concept, undefined, inp.shapeEffects, inp.promise, 'perceived', inp.shape),
          ),
        )
      : 40

  const requiredNegative =
    inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
  const budgetAdequacy =
    (100 * clamp(inp.budget.negative / Math.max(requiredNegative, 1), 0, 1.15)) / 1.15

  // D-12: engaged-only production-budget realization delta ON TOP of the frozen M0A craft (0 when
  // not engaged → byte-identical). SAME rule the realized reception path uses, so forecast and result
  // agree on the budget's effect on realized craft.
  const realizationDelta = budgetRealizationDelta(
    inp.budget.negative,
    requiredNegative,
    inp.shapeEffects.budgetDemandMultiplier,
    engaged,
  )
  const craft = clamp(
    0.3 * scriptStrength +
      0.25 * directorExecution +
      0.2 * castExecution +
      0.15 * technical +
      0.1 * budgetAdequacy +
      inp.shapeEffects.craftMod +
      realizationDelta,
    0,
    100,
  )

  // §5.2 contributions and cohesion (identical to reception, deterministic)
  const contributions: Record<'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'shape', Expression> = {
    writer: personaToExpression(inp.writer.actual),
    director: personaToExpression(inp.director.actual),
    lead: castContribution(inp.cast.lead.actual, 'lead'),
    antagonist: castContribution(inp.cast.antagonist.actual, 'antagonist'),
    support: castContribution(inp.cast.support.actual, 'support'),
    shape: inp.shapeEffects.expression,
  }
  const keys = ['writer', 'director', 'lead', 'antagonist', 'support', 'shape'] as const

  let ci = 0
  let ct = 0
  let ck = 0
  let wsum = 0
  for (const k of keys) {
    const w = ROLE_WEIGHT[k]
    const c = contributions[k]
    ci += w * c.intimacy
    ct += w * c.tonalWeight
    ck += w * c.kineticEnergy
    wsum += w
  }
  const centroid: Expression = { intimacy: ci / wsum, tonalWeight: ct / wsum, kineticEnergy: ck / wsum }

  let directionalAgreement: number
  if (magnitude(centroid) < TUNING.CENTROID_MIN_MAGNITUDE) {
    directionalAgreement = 0
  } else {
    let agreeNum = 0
    let agreeDen = 0
    for (const k of keys) {
      const w = ROLE_WEIGHT[k]
      agreeNum += w * safeCosine(contributions[k], centroid)
      agreeDen += w
    }
    directionalAgreement = agreeNum / agreeDen
  }
  const expressiveStrength = clamp(
    mean(keys.map((k) => magnitude(contributions[k]))) / TUNING.EXPECTED_EXPRESSION,
    0,
    1,
  )
  const cohesion =
    clamp(directionalAgreement, 0, 1) * lerp(TUNING.EXPRESSION_FLOOR, 1.0, expressiveStrength)

  // §5.3 up to criticMean — no sampled term.
  const forces = inp.market.forces
  const forceKeys = Object.keys(forces) as CulturalForce[]
  let forceWeight = 0
  for (const f of forceKeys) forceWeight += forces[f] / 100
  let forceAlignment: number
  if (forceWeight < 1e-6) {
    forceAlignment = 0
  } else {
    let alignNum = 0
    for (const f of forceKeys) {
      alignNum += (forces[f] / 100) * safeCosine(centroid, FORCE_VECTORS[f])
    }
    forceAlignment = alignNum / forceWeight
  }

  const originalityRaw = clamp(inp.concept.originalityRaw + inp.shapeEffects.originalityMod, 0, 100)
  const cohesionContribution =
    TUNING.COHESION_CAP * smoothstep(TUNING.COHESION_SMOOTH_LO, TUNING.COHESION_SMOOTH_HI, cohesion)
  const originalityContribution =
    remap(Math.max(0, originalityRaw - 50), 0, 50, 0, TUNING.ORIGINALITY_MAX_BONUS) *
      lerp(0.55, 1.0, cohesion) -
    remap(Math.max(0, 50 - originalityRaw), 0, 50, 0, TUNING.DERIVATIVENESS_MAX_PENALTY)
  const timelinessContribution = clamp(forceAlignment * 10, -10, 10)

  const criticMean =
    0.65 * craft + cohesionContribution + originalityContribution + timelinessContribution

  return {
    craft,
    delivered: centroid,
    criticMean,
    timelinessContribution,
    scriptStrength,
    directorExecution,
    castWeightedRoleFit,
    budgetAdequacy,
  }
}

// ── Deterministic forecast centers (§7 forecastCenter, B16) ──────────────────
// The §5.4 segmentAppeal computation with no sampled terms, at current
// standing/market. §15.6's behavioral-independence tests use this directly. This
// function must NEVER touch the sim stream (it draws nothing at all).
export type ForecastCenters = {
  centers: Record<SegmentId, number>
  centersOpening: Record<SegmentId, number> // D-12: fame-saturated opening appeal (=== centers unless engaged)
  criticMean: number
  core: DeterministicCore
  segmentFit: Record<SegmentId, number>
  mismatchPenalty: number
  starDraw: number
}

export function forecastCenters(inp: ForecastInputs, saturateFame = false, engaged = false): ForecastCenters {
  const core = computeDeterministicCore(inp, engaged)
  const appeal = computeSegmentAppeal(inp, core.delivered, core.craft, core.timelinessContribution, saturateFame)
  return {
    centers: appeal.segmentAppeal,
    centersOpening: appeal.segmentAppealOpening,
    criticMean: core.criticMean,
    core,
    segmentFit: appeal.segmentFit,
    mismatchPenalty: appeal.mismatchPenalty,
    starDraw: appeal.starDraw,
  }
}

// ── §7 confidence (film-level, D-3) ──────────────────────────────────────────
type ConfidencePredicates = {
  knownLeadTrackRecord: boolean
  knownDirectorGenreRecord: boolean
  establishedSegmentHistory: boolean
  promiseIsSpecific: boolean
}

function computeConfidencePredicates(
  inp: ForecastInputs,
  directorId: string,
  releasedFilms: FilmResult[],
  concepts: FilmConcept[],
): ConfidencePredicates {
  // knownLeadTrackRecord: lead.fame ≥ 60 (public knowledge, static).
  const knownLeadTrackRecord = inp.cast.lead.fame >= 60

  // knownDirectorGenreRecord: director has a released film THIS RUN in this genre.
  // genre = concepts[film.conceptId].genre; director = film.directorId.
  const conceptGenre = new Map(concepts.map((c) => [c.id, c.genre]))
  const thisGenre = inp.concept.genre
  const knownDirectorGenreRecord = releasedFilms.some(
    (f) => f.directorId === directorId && conceptGenre.get(f.conceptId) === thisGenre,
  )

  // establishedSegmentHistory: a prior release this run scored ≥ 60 with that
  // segment. "That segment" = the film's intended segment(s) (B21).
  const intended = inp.promise.intendedSegments
  const establishedSegmentHistory = releasedFilms.some((f) =>
    intended.some((s) => f.segmentScores[s] !== undefined && f.segmentScores[s] >= 60),
  )

  // promiseIsSpecific: specificity(promise) ≥ 0.5.
  const promiseIsSpecific = specificity(inp.promise) >= 0.5

  return {
    knownLeadTrackRecord,
    knownDirectorGenreRecord,
    establishedSegmentHistory,
    promiseIsSpecific,
  }
}

function confidenceFromPoints(p: ConfidencePredicates): { points: number; confidence: Confidence } {
  const points =
    (p.knownLeadTrackRecord ? 1 : 0) +
    (p.knownDirectorGenreRecord ? 1 : 0) +
    (p.establishedSegmentHistory ? 1 : 0) +
    (p.promiseIsSpecific ? 1 : 0)
  const confidence: Confidence = points >= 3 ? 'high' : points >= 2 ? 'medium' : 'low'
  return { points, confidence }
}

// ── §7 uncertainty factors (B14) ─────────────────────────────────────────────
// uncertaintyFactors = the keys of the FAILED confidence predicates.
function computeUncertaintyFactors(predicates: ConfidencePredicates): ForecastFactorKey[] {
  const uncertainty: ForecastFactorKey[] = []
  if (!predicates.knownLeadTrackRecord) uncertainty.push('unknownLead')
  if (!predicates.knownDirectorGenreRecord) uncertainty.push('untestedDirectorGenre')
  if (!predicates.establishedSegmentHistory) uncertainty.push('noSegmentHistory')
  if (!predicates.promiseIsSpecific) uncertainty.push('vaguePromise')
  return uncertainty
}

// ── §7 causal factors (B14) ──────────────────────────────────────────────────
// causalFactors: up to two keys, fixed precedence, first two that fire. The
// promise term is subtractive and has NO causal key. Fixed precedence order per
// B14: castFame, roleFit, directorSkill, scriptStrength, segmentTaste,
// shapeAffinity, culturalTiming — first two that fire.
function computeCausalFactors(
  inp: ForecastInputs,
  centers: ForecastCenters,
): ForecastFactorKey[] {
  const core = centers.core
  const anySegmentFitGE = Object.values(centers.segmentFit).some((v) => v >= 70)
  const anyShapeAffinityGE = Object.values(inp.shapeEffects.segmentAffinity).some((v) => v >= 6)

  const ordered: Array<[boolean, ForecastFactorKey]> = [
    [centers.starDraw >= 60, 'castFame'],
    [core.castWeightedRoleFit >= 0.7, 'roleFit'],
    [core.directorExecution >= 70, 'directorSkill'],
    [core.scriptStrength >= 65, 'scriptStrength'],
    [anySegmentFitGE, 'segmentTaste'],
    [anyShapeAffinityGE, 'shapeAffinity'],
    [core.timelinessContribution >= 5, 'culturalTiming'],
  ]
  const causal: ForecastFactorKey[] = []
  for (const [fires, key] of ordered) {
    if (fires) causal.push(key)
    if (causal.length >= 2) break
  }
  return causal
}

// ── §7 full forecast ─────────────────────────────────────────────────────────
export type ForecastContext = {
  seed: string
  productionId: string
  directorId: string
  releasedFilms: FilmResult[]
  concepts: FilmConcept[]
}

// `saturateFame` = §7 fame Hill on opening reach; `engaged` = D-12 economy calibration (P2 gross
// scale + awareness marketing). Distinct concerns, both true together in engaged play; separated so
// fame-isolation tests can vary fame without the economy scale. Both default false (M0A byte-identical).
export function computeForecast(inp: ForecastInputs, ctx: ForecastContext, saturateFame = false, engaged = false): Forecast {
  const centers = forecastCenters(inp, saturateFame, engaged)

  // Confidence (film-level) — computed BEFORE the offset because sigma depends on it.
  const predicates = computeConfidencePredicates(
    inp,
    ctx.directorId,
    ctx.releasedFilms,
    ctx.concepts,
  )
  const { confidence } = confidenceFromPoints(predicates)

  // ONE film-level gaussian offset from the DERIVED forecast stream (M9) —
  // never the sim stream. sigma = FORECAST_SIGMA[confidence].
  const fstream = stream(ctx.seed, 'forecast', ctx.productionId)
  const rawOffset = fstream.gaussian(0, TUNING.FORECAST_SIGMA[confidence])
  // D-12 forecast causality: the single noisy offset, run through the CONVEX box office (opening ∝
  // appeal^APPEAL_CURVE_EXP, legs ∝ (WAS/100)^LEGS_RETENTION_EXP), turned the ENGAGED "expected" gross
  // into an optimistic SINGLE-SAMPLE outlier for low-confidence films (sigma is largest exactly when the
  // studio knows least). A +2σ draw on an unproven weak film inflated a ~$11M film to ~$50M+ "expected".
  // The honest expected is the DETERMINISTIC CENTER; forecast uncertainty belongs in the band (± width,
  // plus the low-confidence downside widen) and in the realized reception RNG — NOT in a biased central
  // point. So the engaged central estimate drops the offset (estimate = center); the band is unchanged in
  // WIDTH. The draw is still taken (stream advances identically) so nothing downstream shifts, and the
  // NON-engaged (M0A/headless) path keeps the noisy point → the acceptance corpus stays byte-identical.
  const offset = engaged ? 0 : rawOffset
  const width = TUNING.CONFIDENCE_INTERVAL_WIDTH[confidence]

  const causal = computeCausalFactors(inp, centers)
  const uncertainty = computeUncertaintyFactors(predicates)

  // Per-segment forecasts. The same film-level offset is added to every center
  // (M7); estimate clamped to [0,100] before the box-office pass (B16).
  const noisyEstimates: Record<SegmentId, number> = {} as Record<SegmentId, number>
  // D-12: the same film-level offset applied to the fame-saturated OPENING centers (=== the
  // linear centers unless engaged → byte-identical). Feeds only the opening reach.
  const noisyOpening: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const segments: SegmentForecast[] = []
  for (const seg of inp.market.segments) {
    const center = centers.centers[seg.id]
    const estimate = clamp(center + offset, 0, 100)
    noisyEstimates[seg.id] = estimate
    const openingCenter = centers.centersOpening[seg.id]!
    const openingEstimate = clamp(openingCenter + offset, 0, 100)
    noisyOpening[seg.id] = openingEstimate
    // D-12 final downside: widen the LOW band ONLY (asymmetric) for low-confidence / unproven / low-Fit
    // packages when engaged — the studio does not know future delivery at greenlight, so the downside
    // must be honest. The estimate and high are unchanged (a favorable seed can still profit). Not
    // engaged ⇒ downsideWiden = 0 (M0A byte-identical).
    const downsideWiden = engaged ? TUNING.FORECAST_DOWNSIDE_WIDEN[confidence] : 0
    const low = clamp(estimate - width - downsideWiden, 0, 100)
    const high = clamp(estimate + width, 0, 100)
    segments.push({
      segmentId: seg.id,
      center,
      estimate,
      low,
      high,
      expectedBand: bandOf(estimate),
      confidence,
      causalFactors: causal,
      uncertaintyFactors: uncertainty,
      // D-12: the fame-saturated OPENING band (same offset/width as the linear band; === linear
      // unless engaged). Exposed so a live re-forecast reproduces the greenlight opening exactly.
      opening: {
        center: openingCenter,
        estimate: openingEstimate,
        low: clamp(openingEstimate - width, 0, 100),
        high: clamp(openingEstimate + width, 0, 100),
      },
    })
  }

  // expectedOpening/expectedTotal = §5.5 applied to the NOISY clamped estimates (B16).
  const box = computeBoxOffice(
    noisyEstimates,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    noisyOpening,
    engaged, // D-12 P2: forecast applies the economy scale + awareness marketing when engaged (matches realized)
  )

  return {
    segments,
    expectedOpening: box.opening,
    expectedTotal: box.total,
    // expectedCriticScore = the deterministic criticMean.
    expectedCriticScore: centers.criticMean,
  }
}
