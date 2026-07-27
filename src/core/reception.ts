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

import { fameReach } from './economy.js'
import { clamp, lerp, mean, remap, smoothstep } from './math.js'
import type { RngStream } from './rng.js'
import { specificity } from './shape.js'
import { effectiveSkill } from './talentSummary.js'
import { CAST_WEIGHT, FORCE_VECTORS, ROLE_WEIGHT, SLOT_TRANSFORM, TUNING } from './tuning.js'
import type {
  CastSlot,
  CulturalForce,
  EraConfig,
  Expression,
  FilmConcept,
  FilmResult,
  FilmShape,
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
  // The greenlight-LOCKED FilmShape (RULING C, 2026-07-26). Threaded so the sim's
  // effectiveSkill reads honor SHAPE_SKILL_MODS — the SAME shape-weighting path UI
  // Fit/EP already use. `shapeEffects` (resolveShape(shape)) still governs the
  // film-level structural mechanics (craft/cohesion/segment affinity); `shape`
  // governs ONLY the D-9 talent-skill reweighting. No double-count: the two touch
  // disjoint paths (see projectSkillWeights vs computeContributions/segmentAffinity).
  shape: FilmShape
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
  // D-9.5 — the FOUR §5 skill reads become effectiveSkill(..., 'actual'). The
  // pipeline shape, roleFit (persona), M5 contributions, box office, and bounds are
  // unchanged. effectiveSkill stays in [0,100] (D-9.0 invariant). concept/shapeEffects/
  // promise come from ReceptionInputs.
  // RULING C (2026-07-26): the greenlight-LOCKED `inp.shape` (raw FilmShape) is now
  // threaded as the trailing arg so SHAPE_SKILL_MODS reweights skills here — the SAME
  // shape-weighting path UI Fit/EP and §7 forecast use. Reception reads the ACTUAL
  // skills (use='actual'); the shape is identical to the one §7 forecast weighted,
  // so the only forecast-vs-result difference is perceived-vs-actual skills.
  const scriptStrength =
    0.6 * inp.concept.baselineStrength +
    0.4 * effectiveSkill(inp.writer, 'writing', inp.concept, undefined, inp.shapeEffects, inp.promise, 'actual', inp.shape)
  const directorExecution = effectiveSkill(
    inp.director,
    'directing',
    inp.concept,
    undefined,
    inp.shapeEffects,
    inp.promise,
    'actual',
    inp.shape,
  )

  // castExecution = Σ CAST_WEIGHT[slot]·(0.60·effectiveSkill + 0.40·100·roleFit) / Σ CAST_WEIGHT
  let castNum = 0
  let castDen = 0
  for (const slot of CAST_SLOTS) {
    const t = inp.cast[slot]
    const req = inp.concept.roleRequirements[slot]
    const fit = roleFit(t, req)
    const eff = effectiveSkill(t, 'acting', inp.concept, slot, inp.shapeEffects, inp.promise, 'actual', inp.shape)
    castNum += CAST_WEIGHT[slot] * (0.6 * eff + 0.4 * 100 * fit)
    castDen += CAST_WEIGHT[slot]
  }
  const castExecution = castNum / castDen

  // D-4: technical = mean craft-hire effectiveSkill, or 40 when craftIds is empty.
  const technical =
    inp.craftHires.length > 0
      ? mean(
          inp.craftHires.map((c) =>
            effectiveSkill(c, 'craft', inp.concept, undefined, inp.shapeEffects, inp.promise, 'actual', inp.shape),
          ),
        )
      : 40

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
  saturateFame = false, // D-12: when engaged, the Fame→OPENING-reach component saturates
): {
  promiseMismatch: number
  mismatchPenalty: number
  starDraw: number
  segmentFit: Record<SegmentId, number>
  segmentAppeal: Record<SegmentId, number>
  segmentAppealOpening: Record<SegmentId, number> // === segmentAppeal unless saturateFame
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
  // D-12 (gated): the Fame-driven component of OPENING reach saturates via the Hill helper
  // (fameReach substitutes for fame/100), while segment appeal / audience response / legs
  // keep the LINEAR starDraw. When NOT engaged (M0A), starDrawOpening === starDraw →
  // segmentAppealOpening === segmentAppeal → byte-identical.
  let satNum = 0
  for (const slot of CAST_SLOTS) satNum += CAST_WEIGHT[slot] * fameReach(inp.cast[slot].fame)
  const starDrawOpening = saturateFame ? 100 * clamp(satNum / starDen, 0, 1) : starDraw

  const segmentFit: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const segmentAppeal: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const segmentAppealOpening: Record<SegmentId, number> = {} as Record<SegmentId, number>
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
    // Opening-only appeal: the SAME formula with the saturated star term (else identical).
    segmentAppealOpening[seg.id] = saturateFame
      ? clamp(
          0.35 * craft +
            0.25 * starDrawOpening +
            0.25 * fit +
            0.15 * (timelinessContribution * 5) +
            inp.shapeEffects.segmentAffinity[seg.id] -
            mismatchPenalty,
          0,
          100,
        )
      : segmentAppeal[seg.id]
  }

  return { promiseMismatch, mismatchPenalty, starDraw, segmentFit, segmentAppeal, segmentAppealOpening }
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
  // D-12: the OPENING-reach appeal (fame-saturated when engaged). Defaults to segmentAppeal
  // so every existing caller is unchanged (opening === legs appeal → byte-identical).
  openingSegmentAppeal: Record<SegmentId, number> = segmentAppeal,
  // D-12 P2: whether the D-12 economy is ENGAGED (=== saturateFame === employmentEngaged). When
  // false (M0A/headless), the legacy fixed-capacity marketing Hill + no gross scale apply, so the
  // acceptance corpus is byte-identical. When true, awareness-conditioned marketing + the routine
  // gross scale apply. Default false so every existing/M0A caller is unchanged.
  engaged = false,
): {
  marketingQuality: number
  preMarketingAwareness: number
  marketingCapacity: number
  baseAwareness: number
  awarenessFactor: number
  openingReachMult: number
  competitionFactor: number
  weightedAudienceScore: number
  opening: number
  legs: number
  total: number
} {
  // D-12 P2 (owner calibration): pre-marketing awareness = how visible/wanted this film is BEFORE
  // any marketing spend — a blend of studio audience awareness and the film's OWN opening-appeal
  // reach (fame-saturated when engaged). It drives the awareness-conditioned marketing capacity so
  // a low-awareness film cannot efficiently absorb a maximum campaign.
  let appealReachSum = 0
  for (const seg of segments) {
    appealReachSum += seg.share * Math.pow(openingSegmentAppeal[seg.id]! / 100, TUNING.APPEAL_CURVE_EXP)
  }
  const preMarketingAwareness = clamp(
    TUNING.MARKETING_AWARENESS_STANDING_WEIGHT * (standing.audienceAwareness / 100) +
      (1 - TUNING.MARKETING_AWARENESS_STANDING_WEIGHT) * appealReachSum,
    0,
    1,
  )
  // Efficient marketing capacity (the marketing spend at which reach half-saturates). Legacy fixed
  // MARKETING_HALF_SATURATION when NOT engaged (M0A byte-identical); awareness-scaled when engaged.
  const marketingCapacity = engaged
    ? TUNING.MARKETING_CAPACITY_MIN +
      (TUNING.MARKETING_CAPACITY_MAX - TUNING.MARKETING_CAPACITY_MIN) *
        Math.pow(preMarketingAwareness, TUNING.MARKETING_AWARENESS_EXP)
    : TUNING.MARKETING_HALF_SATURATION
  const marketingQuality = budget.marketing / (budget.marketing + marketingCapacity)
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
    // D-12: OPENING reach uses the (fame-saturated when engaged) opening appeal; LEGS and
    // the audience score keep the LINEAR appeal → legs is untouched by fame saturation.
    const appealCurve = Math.pow(openingSegmentAppeal[seg.id] / 100, TUNING.APPEAL_CURVE_EXP)
    reachSum += seg.share * awarenessFactor * appealCurve
    weightedAudienceScore += seg.share * appeal
  }

  // D-12 P2 routine gross scale — the single canonical multiplier, applied ONCE here (economy-engaged
  // only) at the same conceptual point in every path: after creative/talent/Fame/Marketing determine
  // the opening, and BEFORE the theatrical schedule + the Studio Revenue share. Scaling the opening
  // scales the total (legs unchanged) and every conserved weekly payment proportionally. Never scales
  // costs/payroll/overhead/the post-share revenue — those stay full-scale.
  const economyScale = engaged ? TUNING.ECONOMY_BOX_OFFICE_SCALE : 1
  const opening = baseMarketValue * reachSum * openingReachMult * competitionFactor * economyScale
  const legs = TUNING.LEGS_MIN + (TUNING.LEGS_MAX - TUNING.LEGS_MIN) * (weightedAudienceScore / 100)
  const total = opening * legs

  return {
    marketingQuality,
    preMarketingAwareness,
    marketingCapacity,
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
// `saturateFame` = the §7 Fame→opening-reach Hill (a reception modeling choice). `engaged` = the
// D-12 economy calibration (P2 routine gross scale + awareness-conditioned marketing). Both are true
// together in engaged production play, but they are DISTINCT concerns and are threaded separately so
// the fame-isolation harness/tests can vary fame WITHOUT triggering the economy scale. Both default
// false → the M0A/headless path is byte-identical.
export function resolveReception(inp: ReceptionInputs, rng: RngStream, saturateFame = false, engaged = false): ReceptionResult {
  const craftBlock = computeCraft(inp)
  const contribBlock = computeContributions(inp)
  const delivered = contribBlock.centroid

  const criticBlock = computeCritic(inp, delivered, craftBlock.craft, contribBlock.cohesion, rng)

  const appealBlock = computeSegmentAppeal(
    inp,
    delivered,
    craftBlock.craft,
    criticBlock.timelinessContribution,
    saturateFame,
  )

  const boxOffice = computeBoxOffice(
    appealBlock.segmentAppeal,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    appealBlock.segmentAppealOpening,
    engaged, // D-12 P2: economy calibration (routine gross scale + awareness marketing), distinct from fame
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
