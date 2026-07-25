// ── §5 Reception pipeline ────────────────────────────────────────────────────
// The full §5 pipeline as pure functions over explicit inputs. Seed-deterministic
// but NOT variance-free (§5.6): the ONLY sampled term is the single §5.3 critic
// draw, taken from the passed-in sim RngStream. No hidden random modifiers.
//
// Rev. 4 references folded in: M5 (contributor vectors — writer/director use
// personaToExpression(actual), cast per SLOT_TRANSFORM, shape uses
// shapeEffects.expression; perceived is dormant), N4 (budgetAdequacy guard
// max(requiredNegative,1)), D-4 (technical = 40 when craftIds empty), B12
// (FilmResult carries conceptId/directorId).
//
// This module is pure: no React/DOM/async/IO. The RngStream is threaded in and
// its single draw mutates only that stream's state (which the harness owns).

import { clamp, lerp, mean, remap, smoothstep } from './math.js'
import type { RngStream } from './rng.js'
import { specificity } from './shape.js'
import { CAST_WEIGHT, FORCE_VECTORS, ROLE_WEIGHT, SLOT_TRANSFORM, TUNING } from './tuning.js'
import type {
  CastSlot,
  CulturalForce,
  EraConfig,
  Expression,
  FilmConcept,
  FilmResult,
  MarketState,
  Persona,
  Promise as FilmPromise,
  RoleRequirement,
  Segment,
  SegmentId,
  ShapeEffects,
  Standing,
  Talent,
} from './types.js'
import { distance, magnitude, personaDistance, personaToExpression, safeCosine } from './vector.js'

const CAST_SLOTS: CastSlot[] = ['lead', 'antagonist', 'support']
const AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const

// Multiply two Expressions component-wise (§5.2 castContribution via SLOT_TRANSFORM).
function multiplyComponents(a: Expression, b: Expression): Expression {
  return {
    intimacy: a.intimacy * b.intimacy,
    tonalWeight: a.tonalWeight * b.tonalWeight,
    kineticEnergy: a.kineticEnergy * b.kineticEnergy,
  }
}

// §5.2 verbatim: castContribution(p, slot) = personaToExpression(p) ⊙ SLOT_TRANSFORM[slot].
export function castContribution(p: Persona, slot: CastSlot): Expression {
  return multiplyComponents(personaToExpression(p), SLOT_TRANSFORM[slot])
}

// The explicit inputs the §5 pipeline reads. Resolved lookups only — no state
// traversal below the harness boundary.
export type ReceptionInputs = {
  concept: FilmConcept
  shapeEffects: ShapeEffects
  promise: FilmPromise
  budget: { negative: number; marketing: number }
  writer: Talent
  director: Talent
  cast: Record<CastSlot, Talent>
  craftHires: Talent[] // resolved craft talent; empty ⇒ technical = 40 (D-4)
  market: MarketState
  standing: Standing
  era: EraConfig
}

// The rich breakdown §5.6 requires: every intermediate exposed alongside the
// FilmResult-shaped output (which carries conceptId/directorId per B12). The
// critic draw is the only sampled term.
export type ReceptionResult = {
  // §5.1 craft inputs
  scriptStrength: number
  directorExecution: number
  castExecution: number
  technical: number
  requiredNegative: number
  budgetAdequacy: number
  craft: number
  // §5.2 contributions and cohesion
  contributions: Record<'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'shape', Expression>
  centroid: Expression // = delivered
  delivered: Expression
  directionalAgreement: number
  expressiveStrength: number
  cohesion: number
  // §5.3 critic
  forceAlignment: number
  originalityRaw: number
  cohesionContribution: number
  originalityContribution: number
  timelinessContribution: number
  criticMean: number
  criticSigma: number
  criticScore: number
  reviewVariance: number
  // §5.4 segment appeal
  promiseMismatch: number
  mismatchPenalty: number
  starDraw: number
  segmentFit: Record<SegmentId, number>
  segmentAppeal: Record<SegmentId, number>
  // §5.5 box office
  marketingQuality: number
  baseAwareness: number
  awarenessFactor: number
  openingReachMult: number
  competitionFactor: number
  weightedAudienceScore: number
  opening: number
  legs: number
  total: number
  // FilmResult-shaped fields (B12 additions included at call site via buildFilmResult)
  segmentScores: Record<SegmentId, number>
}

// §5.1 roleFit(t, req) = 1 - clamp(personaDistance(actual, target)/tolerance, 0, 1).
export function roleFit(t: Talent, req: RoleRequirement): number {
  return 1 - clamp(personaDistance(t.actual, req.target) / req.tolerance, 0, 1)
}

// ── §5.1 Craft ───────────────────────────────────────────────────────────────
function computeCraft(inp: ReceptionInputs): {
  scriptStrength: number
  directorExecution: number
  castExecution: number
  technical: number
  requiredNegative: number
  budgetAdequacy: number
  craft: number
} {
  const scriptStrength = 0.6 * inp.concept.baselineStrength + 0.4 * inp.writer.skill
  const directorExecution = inp.director.skill

  // castExecution = Σ CAST_WEIGHT[slot]·(0.60·skill + 0.40·100·roleFit) / Σ CAST_WEIGHT
  let castNum = 0
  let castDen = 0
  for (const slot of CAST_SLOTS) {
    const t = inp.cast[slot]
    const req = inp.concept.roleRequirements[slot]
    const fit = roleFit(t, req)
    castNum += CAST_WEIGHT[slot] * (0.6 * t.skill + 0.4 * 100 * fit)
    castDen += CAST_WEIGHT[slot]
  }
  const castExecution = castNum / castDen

  // D-4: technical = mean craft-hire skill, or 40 when craftIds is empty.
  const technical =
    inp.craftHires.length > 0 ? mean(inp.craftHires.map((c) => c.skill)) : 40

  const requiredNegative =
    inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale

  // N4: guard the denominator with max(requiredNegative, 1).
  const budgetAdequacy =
    (100 * clamp(inp.budget.negative / Math.max(requiredNegative, 1), 0, 1.15)) / 1.15

  const craft = clamp(
    0.3 * scriptStrength +
      0.25 * directorExecution +
      0.2 * castExecution +
      0.15 * technical +
      0.1 * budgetAdequacy +
      inp.shapeEffects.craftMod,
    0,
    100,
  )

  return {
    scriptStrength,
    directorExecution,
    castExecution,
    technical,
    requiredNegative,
    budgetAdequacy,
    craft,
  }
}

// ── §5.2 Contributions and cohesion ──────────────────────────────────────────
type ContribKey = 'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'shape'

function computeContributions(inp: ReceptionInputs): {
  contributions: Record<ContribKey, Expression>
  centroid: Expression
  directionalAgreement: number
  expressiveStrength: number
  cohesion: number
} {
  // M5: writer & director contribute personaToExpression(actual); cast per
  // castContribution (SLOT_TRANSFORM); shape contributes shapeEffects.expression.
  const contributions: Record<ContribKey, Expression> = {
    writer: personaToExpression(inp.writer.actual),
    director: personaToExpression(inp.director.actual),
    lead: castContribution(inp.cast.lead.actual, 'lead'),
    antagonist: castContribution(inp.cast.antagonist.actual, 'antagonist'),
    support: castContribution(inp.cast.support.actual, 'support'),
    shape: inp.shapeEffects.expression,
  }

  const keys: ContribKey[] = ['writer', 'director', 'lead', 'antagonist', 'support', 'shape']

  // centroid = Σ(ROLE_WEIGHT[s]·contribution_s) / Σ(ROLE_WEIGHT[s]) = delivered.
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

  // directionalAgreement — zero-guard on centroid magnitude (CENTROID_MIN_MAGNITUDE).
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

  // expressiveStrength over all six contribution magnitudes.
  const expressiveStrength = clamp(
    mean(keys.map((k) => magnitude(contributions[k]))) / TUNING.EXPECTED_EXPRESSION,
    0,
    1,
  )

  const cohesion =
    clamp(directionalAgreement, 0, 1) * lerp(TUNING.EXPRESSION_FLOOR, 1.0, expressiveStrength)

  return { contributions, centroid, directionalAgreement, expressiveStrength, cohesion }
}

// ── §5.3 Critic score ────────────────────────────────────────────────────────
function computeCritic(
  inp: ReceptionInputs,
  delivered: Expression,
  craft: number,
  cohesion: number,
  rng: RngStream,
): {
  forceAlignment: number
  originalityRaw: number
  cohesionContribution: number
  originalityContribution: number
  timelinessContribution: number
  criticMean: number
  criticSigma: number
  criticScore: number
  reviewVariance: number
} {
  const forces = inp.market.forces
  const forceKeys = Object.keys(forces) as CulturalForce[]

  // forceWeight = Σ_f (forces[f]/100); forceAlignment guarded by EPSILON.
  let forceWeight = 0
  for (const f of forceKeys) forceWeight += forces[f] / 100

  let forceAlignment: number
  if (forceWeight < 1e-6) {
    forceAlignment = 0
  } else {
    let alignNum = 0
    for (const f of forceKeys) {
      alignNum += (forces[f] / 100) * safeCosine(delivered, FORCE_VECTORS[f])
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
  const criticSigma = TUNING.CRITIC_SIGMA_BASE + (1 - cohesion) * 3

  // The single sampled term in all of §5 — drawn from the passed-in sim stream.
  const criticScore = clamp(rng.gaussian(criticMean, criticSigma), 0, 100)
  const reviewVariance = criticScore - criticMean

  return {
    forceAlignment,
    originalityRaw,
    cohesionContribution,
    originalityContribution,
    timelinessContribution,
    criticMean,
    criticSigma,
    criticScore,
    reviewVariance,
  }
}

// ── §5.4 Segment appeal ──────────────────────────────────────────────────────
function distanceOutsideRange(v: number, r: [number, number]): number {
  if (v < r[0]) return r[0] - v
  if (v > r[1]) return v - r[1]
  return 0
}

// Exposed so forecast (§7) reuses the identical deterministic segment-appeal
// computation. Uses no sampled terms — timelinessContribution and craft are
// deterministic (the §5.3 critic DRAW never feeds segmentAppeal).
export function computeSegmentAppeal(
  inp: ReceptionInputs,
  delivered: Expression,
  craft: number,
  timelinessContribution: number,
): {
  promiseMismatch: number
  mismatchPenalty: number
  starDraw: number
  segmentFit: Record<SegmentId, number>
  segmentAppeal: Record<SegmentId, number>
} {
  // promiseMismatch = clamp(sqrt(Σ_axis square(distanceOutsideRange)) / sqrt(12), 0, 1)
  let sq = 0
  for (const axis of AXES) {
    const d = distanceOutsideRange(delivered[axis], inp.promise.ranges[axis])
    sq += d * d
  }
  const promiseMismatch = clamp(Math.sqrt(sq) / Math.sqrt(12), 0, 1)
  const mismatchPenalty = specificity(inp.promise) * promiseMismatch * TUNING.PROMISE_PENALTY_MAX

  // starDraw = 100·clamp(Σ CAST_WEIGHT[slot]·(fame/100) / Σ CAST_WEIGHT, 0, 1)
  let starNum = 0
  let starDen = 0
  for (const slot of CAST_SLOTS) {
    starNum += CAST_WEIGHT[slot] * (inp.cast[slot].fame / 100)
    starDen += CAST_WEIGHT[slot]
  }
  const starDraw = 100 * clamp(starNum / starDen, 0, 1)

  const segmentFit: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const segmentAppeal: Record<SegmentId, number> = {} as Record<SegmentId, number>
  for (const seg of inp.market.segments) {
    const fit = 100 * (1 - clamp(distance(delivered, seg.taste) / Math.sqrt(12), 0, 1))
    segmentFit[seg.id] = fit
    segmentAppeal[seg.id] = clamp(
      0.35 * craft +
        0.25 * starDraw +
        0.25 * fit +
        0.15 * (timelinessContribution * 5) +
        inp.shapeEffects.segmentAffinity[seg.id] -
        mismatchPenalty,
      0,
      100,
    )
  }

  return { promiseMismatch, mismatchPenalty, starDraw, segmentFit, segmentAppeal }
}

// ── §5.5 Box office ──────────────────────────────────────────────────────────
// Factored to accept the per-segment appeal scores so §7 can reuse it against
// noisy estimates (B16). competitionFactor ≡ 1.0 (N11). Pure; no sampling.
export function computeBoxOffice(
  segmentAppeal: Record<SegmentId, number>,
  segments: Segment[],
  baseMarketValue: number,
  standing: Standing,
  promise: FilmPromise,
  budget: { negative: number; marketing: number },
  shapeEffects: ShapeEffects,
): {
  marketingQuality: number
  baseAwareness: number
  awarenessFactor: number
  openingReachMult: number
  competitionFactor: number
  weightedAudienceScore: number
  opening: number
  legs: number
  total: number
} {
  const marketingQuality =
    budget.marketing / (budget.marketing + TUNING.MARKETING_HALF_SATURATION)
  const baseAwareness = clamp(
    0.6 * (standing.audienceAwareness / 100) + 0.4 * marketingQuality,
    0,
    1,
  )
  const awarenessFactor = clamp(
    baseAwareness *
      (1 + (specificity(promise) * marketingQuality * TUNING.PROMISE_MAX_BONUS) / 100),
    0,
    1,
  )

  const openingReachMult = 1 + shapeEffects.openingReachMod / 100
  const competitionFactor = 1.0

  let reachSum = 0
  let weightedAudienceScore = 0
  for (const seg of segments) {
    const appeal = segmentAppeal[seg.id]
    const appealCurve = Math.pow(appeal / 100, TUNING.APPEAL_CURVE_EXP)
    reachSum += seg.share * awarenessFactor * appealCurve
    weightedAudienceScore += seg.share * appeal
  }

  const opening = baseMarketValue * reachSum * openingReachMult * competitionFactor
  const legs = TUNING.LEGS_MIN + (TUNING.LEGS_MAX - TUNING.LEGS_MIN) * (weightedAudienceScore / 100)
  const total = opening * legs

  return {
    marketingQuality,
    baseAwareness,
    awarenessFactor,
    openingReachMult,
    competitionFactor,
    weightedAudienceScore,
    opening,
    legs,
    total,
  }
}

// ── §5 Full pipeline ─────────────────────────────────────────────────────────
// The single §5.3 critic draw comes from the passed-in sim stream (rng).
export function resolveReception(inp: ReceptionInputs, rng: RngStream): ReceptionResult {
  const craftBlock = computeCraft(inp)
  const contribBlock = computeContributions(inp)
  const delivered = contribBlock.centroid

  const criticBlock = computeCritic(inp, delivered, craftBlock.craft, contribBlock.cohesion, rng)

  const appealBlock = computeSegmentAppeal(
    inp,
    delivered,
    craftBlock.craft,
    criticBlock.timelinessContribution,
  )

  const boxOffice = computeBoxOffice(
    appealBlock.segmentAppeal,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
  )

  return {
    ...craftBlock,
    contributions: contribBlock.contributions,
    centroid: delivered,
    delivered,
    directionalAgreement: contribBlock.directionalAgreement,
    expressiveStrength: contribBlock.expressiveStrength,
    cohesion: contribBlock.cohesion,
    ...criticBlock,
    ...appealBlock,
    ...boxOffice,
    segmentScores: appealBlock.segmentAppeal,
  }
}

// Assemble the §2.4 FilmResult shape (with B12's conceptId/directorId) from a
// resolved ReceptionResult plus the film's release-time metadata.
export function buildFilmResult(
  r: ReceptionResult,
  meta: { productionId: string; releaseTick: number; conceptId: string; directorId: string },
): FilmResult {
  return {
    productionId: meta.productionId,
    releaseTick: meta.releaseTick,
    delivered: r.delivered,
    cohesion: r.cohesion,
    craft: r.craft,
    criticMean: r.criticMean,
    criticSigma: r.criticSigma,
    criticScore: r.criticScore,
    reviewVariance: r.reviewVariance,
    segmentScores: r.segmentScores,
    boxOffice: { opening: r.opening, total: r.total },
    conceptId: meta.conceptId,
    directorId: meta.directorId,
  }
}
