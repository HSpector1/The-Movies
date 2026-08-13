// ── Phase 5.1 CYCLE 3 — Film Package assessment helpers (READ-ONLY UI summaries) ──
//
// PURE, deterministic, JSON-serializable read-only assessments the UI (Film Package
// summary, candidate cards, change-preview, greenlight autopsy) calls so it never
// reinvents an engine formula. THE SIM NEVER READS THIS MODULE — exactly like the
// D-9 talentSummary display functions. Every quantity here is either:
//   • a REAL engine mechanic reused verbatim (projectFit / expectedPerformance /
//     computeForecast / forecastCenters / computeBoxOffice / resolveShape), or
//   • a talent-independent alignment on the SAME Expression-distance metric §5 uses.
// No reception/forecast/cohesion/D-3/D-6/save FORMULA is changed. Any new weight or
// threshold is a NAMED TUNING constant (TUNING.COHESION_* / TUNING.EXEC_CONF_*).
//
// Randomness: creativeCohesion / packageFit / executionConfidence / packageDelta /
// greenlightAssessment / risksMaterialized draw NOTHING (fully deterministic).
// forecastProfitRange calls computeForecast, whose ONE film-level gaussian is drawn
// from the DERIVED forecast stream (never the sim stream), replayed exactly per M9 —
// identical to how the greenlight forecastSnapshot was produced.

import { clamp, mean } from './math.js'
import { computeBoxOffice, type ReceptionInputs } from './reception.js'
import {
  computeForecast,
  forecastCenters,
  type DeterministicCore,
  type ForecastContext,
} from './forecast.js'
import { resolveShape } from './shape.js'
import { TUNING } from './tuning.js'
import { expectedPerformance, projectFit, workHistoryCount } from './talentSummary.js'
import type { PerformanceBand } from './talentSummary.js'
import type {
  CastSlot,
  Confidence,
  Discipline,
  Expression,
  FilmConcept,
  Promise as FilmPromise,
  FilmResult,
  FilmShape,
  Forecast,
  ForecastFactorKey,
  Production,
  Range,
  SegmentId,
  Talent,
} from './types.js'
import { distance } from './vector.js'

// NOTE: `FilmPromise` is the contract's `Promise` type (imported with an alias to
// avoid shadowing the global). See types.ts (`export type Promise`).

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const
const AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const
const SEGMENT_ORDER: readonly SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige'] as const

// The maximum meaningful Expression distance (sqrt(12)); the SAME normalizer §5's
// promiseMismatch and segmentFit use to map a raw distance into [0,1].
const MAX_EXPR_DISTANCE = Math.sqrt(12)

// Range midpoint helper (mirrors talentSummary's private midpoint).
function midpoint(r: Range): number {
  return (r[0] + r[1]) / 2
}

// The promise's INTENDED expression = its per-axis range midpoints. This is the
// SAME "intended expression" vector talentSummary.promiseTargetPersona and the §5.4
// promiseMismatch metric operate over (intimacy ← intimacy range, etc.).
function promiseIntendedExpression(promise: FilmPromise): Expression {
  return {
    intimacy: midpoint(promise.ranges.intimacy),
    tonalWeight: midpoint(promise.ranges.tonalWeight),
    kineticEnergy: midpoint(promise.ranges.kineticEnergy),
  }
}

// Plain-language axis names for strengths/conflicts (display only).
const AXIS_TERM: Record<(typeof AXES)[number], string> = {
  intimacy: 'intimacy',
  tonalWeight: 'tonal',
  kineticEnergy: 'kinetic',
}

// ═══════════════════════════════════════════════════════════════════════════════
// #1 creativeCohesion — TALENT-INDEPENDENT creative-brief coherence.
// ═══════════════════════════════════════════════════════════════════════════════
// DISCLOSURE (important): this is NOT the §5 talent-persona cohesion
// (computeContributions/reception.ts:222-283), which blends writer/director/cast
// persona contributions with the shape into a centroid and measures directional
// agreement. THAT cohesion is a property of the CAST-AND-CREW. `creativeCohesion`
// here is a property of the CREATIVE BRIEF ALONE — how well the chosen structural
// shape and the promised expression cohere, and how well that brief sits with its
// intended audience — measured BEFORE any talent is attached. It reads ONLY
// talent-independent vectors: resolveShape(shape).expression, the promise range
// midpoints, concept.genre, and TUNING.SEGMENT_TASTES for promise.intendedSegments.
// It EXCLUDES talent, fame, salary, Fit, box office, and all post-release info.
//
// Both alignment terms use the identical Expression-distance metric §5 uses
// (distance / sqrt(12) → [0,1]): (a) how well shape.expression supports the
// promise's intended expression (the same axes §5.4 promiseMismatch scores), and
// (b) how well the blended brief expression sits inside the intended-segment tastes
// (the same metric §5.4 segmentFit scores). No talent input can reach this number.

export type CreativeCohesion = {
  score: number // 0..100
  tier: 'strong' | 'mixed' | 'weak'
  strengths: string[] // aligned axes, plain terms (tonal/kinetic/intimacy)
  conflicts: string[] // conflicting axes, plain terms
  explanation: string
  talentIndependent: true // disclosure flag: never reads talent/fame/salary/fit/box
}

export function creativeCohesion(
  concept: FilmConcept,
  shape: FilmShape,
  promise: FilmPromise,
): CreativeCohesion {
  const shapeExpr = resolveShape(shape).expression // talent-independent structural vector
  const intended = promiseIntendedExpression(promise) // talent-independent promised vector

  // (a) shape ↔ promise support: 1 − distance/sqrt(12), on [0,1]. High ⇒ the chosen
  // structure pushes the film toward the expression the promise commits to.
  const shapePromiseSupport = 1 - clamp(distance(shapeExpr, intended) / MAX_EXPR_DISTANCE, 0, 1)

  // The blended brief expression the audience will read: the mean of the structural
  // shape vector and the promised expression (both talent-independent).
  const brief: Expression = {
    intimacy: (shapeExpr.intimacy + intended.intimacy) / 2,
    tonalWeight: (shapeExpr.tonalWeight + intended.tonalWeight) / 2,
    kineticEnergy: (shapeExpr.kineticEnergy + intended.kineticEnergy) / 2,
  }

  // (b) brief ↔ intended-audience taste: mean segment alignment over the promise's
  // intended segments (the SAME segmentFit metric §5.4 uses). Empty intendedSegments
  // ⇒ neutral 0.5 (no audience aim to cohere with).
  const segs = promise.intendedSegments.length > 0 ? promise.intendedSegments : []
  let segAlign: number
  if (segs.length === 0) {
    segAlign = 0.5
  } else {
    let s = 0
    for (const seg of segs) {
      const taste = TUNING.SEGMENT_TASTES[seg]
      s += 1 - clamp(distance(brief, taste) / MAX_EXPR_DISTANCE, 0, 1)
    }
    segAlign = s / segs.length
  }

  const blended =
    TUNING.COHESION_BRIEF_SHAPE_PROMISE_W * shapePromiseSupport +
    TUNING.COHESION_BRIEF_SEGMENT_W * segAlign
  const score = clamp(100 * blended, 0, 100)

  // Per-axis strengths/conflicts: name the axes where shape and promise agree
  // (small gap) vs conflict (large gap) — the tonal/kinetic/intimacy legibility the
  // UI shows. Deterministic iteration in fixed AXES order.
  const strengths: string[] = []
  const conflicts: string[] = []
  for (const axis of AXES) {
    const gap = Math.abs(shapeExpr[axis] - intended[axis])
    if (gap <= TUNING.COHESION_AXIS_ALIGNED) {
      strengths.push(`${AXIS_TERM[axis]} aligned`)
    } else if (gap >= TUNING.COHESION_AXIS_CONFLICT) {
      conflicts.push(`${AXIS_TERM[axis]} conflict`)
    }
  }

  const tier: CreativeCohesion['tier'] =
    score >= TUNING.COHESION_TIER_STRONG
      ? 'strong'
      : score >= TUNING.COHESION_TIER_MIXED
        ? 'mixed'
        : 'weak'

  const explanation =
    `Creative brief for a ${concept.genre} film. The ${describeShape(shape)} structure ` +
    `${tier === 'strong' ? 'strongly supports' : tier === 'mixed' ? 'partially supports' : 'pulls against'} ` +
    `the promised tone, and ${segAlign >= 0.6 ? 'fits' : segAlign >= 0.4 ? 'partly fits' : 'sits away from'} ` +
    `the intended audience. Brief coherence only — talent is assessed separately.`

  return { score, tier, strengths, conflicts, explanation, talentIndependent: true }
}

// A plain-language shape descriptor (display only, talent-independent).
function describeShape(shape: FilmShape): string {
  return `${shape.opening}/${shape.midpoint}/${shape.ending}`
}

// ═══════════════════════════════════════════════════════════════════════════════
// #2 packageFit — REUSE projectFit + expectedPerformance for every assignment.
// ═══════════════════════════════════════════════════════════════════════════════
// Runs the EXISTING D-9.6 projectFit and D-9.7 expectedPerformance (talentSummary.ts:
// 303-358 / 364-394) for writer, director, each cast slot, and each craft hire. NO
// new fit formula. `overall` is the ability-weighted mean of per-assignment fit but
// NEVER hides a weak role: `weakest` is reported separately, and `severeMismatch`
// flags a role whose fit falls below a hard floor. `unfilled` names any required
// cast slot with no assignment.

export type AssignmentFit = {
  role: 'writer' | 'director' | 'lead' | 'antagonist' | 'support' | 'craft'
  talentId: string
  talentName: string
  discipline: Discipline
  slot?: CastSlot // present for the three cast roles
  fit: number // 0..100 — D-9.6 projectFit
  expected: PerformanceBand // D-9.7 expectedPerformance {low, high, expected}
  unproven: boolean // workHistory[discipline] == 0 (cross-discipline / first job)
}

export type PackageFitInput = {
  concept: FilmConcept
  shape: FilmShape
  promise: FilmPromise
  writer: Talent
  director: Talent
  cast: Record<CastSlot, Talent>
  craftHires: Talent[]
}

export type PackageFit = {
  perAssignment: AssignmentFit[]
  overall: number // 0..100 — ability-weighted mean fit (does NOT hide the weakest)
  strongest: AssignmentFit
  weakest: AssignmentFit // ALWAYS reported so `overall` cannot mask a weak role
  severeMismatch?: AssignmentFit // weakest, iff its fit < FIT floor
  unfilled: CastSlot[] // required cast slots with no assignment
}

// Fit weights for the ability-weighted overall — reuse the SAME contributor weights
// §5 already uses for the centroid/craft (CAST_WEIGHT is per-slot, ROLE_WEIGHT per
// contributor). We keep it simple and legible: writer/director/cast weighted by
// their §5 role weight; craft averaged. (This is a DISPLAY roll-up, not a §5 read.)
function buildAssignment(
  role: AssignmentFit['role'],
  talent: Talent,
  discipline: Discipline,
  concept: FilmConcept,
  slot: CastSlot | undefined,
  shape: FilmShape,
  promise: FilmPromise,
): AssignmentFit {
  const shapeEffects = resolveShape(shape)
  return {
    role,
    talentId: talent.id,
    talentName: talent.name,
    discipline,
    ...(slot !== undefined ? { slot } : {}),
    fit: projectFit(talent, discipline, concept, slot, shapeEffects, promise, shape),
    expected: expectedPerformance(talent, discipline, concept, slot, shapeEffects, promise, shape),
    unproven: workHistoryCount(talent, discipline) === 0,
  }
}

export function packageFit(inp: PackageFitInput): PackageFit {
  const { concept, shape, promise } = inp
  const perAssignment: AssignmentFit[] = []

  // Fixed order: writer → director → cast (lead/antagonist/support) → craft hires.
  perAssignment.push(buildAssignment('writer', inp.writer, 'writing', concept, undefined, shape, promise))
  perAssignment.push(
    buildAssignment('director', inp.director, 'directing', concept, undefined, shape, promise),
  )

  const unfilled: CastSlot[] = []
  for (const slot of CAST_SLOTS) {
    const actor = inp.cast[slot]
    // A cast slot may be legitimately unfilled in a UI draft; report it, don't invent.
    if (actor === undefined) {
      if (concept.requiredSlots.includes(slot)) unfilled.push(slot)
      continue
    }
    perAssignment.push(buildAssignment(slot, actor, 'acting', concept, slot, shape, promise))
  }

  for (const c of inp.craftHires) {
    perAssignment.push(buildAssignment('craft', c, 'craft', concept, undefined, shape, promise))
  }

  // Ability-weighted overall (writer 1.0, director 1.6, lead 1.4, antagonist 0.8,
  // support 0.5, craft 0.6 each — mirrors §5 ROLE_WEIGHT for the crew/cast and gives
  // craft a modest voice). Never a substitute for `weakest`.
  const ROLE_ROLLUP_WEIGHT: Record<AssignmentFit['role'], number> = {
    writer: 1.0,
    director: 1.6,
    lead: 1.4,
    antagonist: 0.8,
    support: 0.5,
    craft: 0.6,
  }
  let num = 0
  let den = 0
  for (const a of perAssignment) {
    const w = ROLE_ROLLUP_WEIGHT[a.role]
    num += w * a.fit
    den += w
  }
  const overall = den > 0 ? num / den : 0

  // strongest / weakest by fit; first-seen wins ties (stable, fixed iteration order).
  let strongest = perAssignment[0]!
  let weakest = perAssignment[0]!
  for (const a of perAssignment) {
    if (a.fit > strongest.fit) strongest = a
    if (a.fit < weakest.fit) weakest = a
  }

  // severeMismatch: the weakest assignment, only when it falls below the D-9.6 hard
  // ability floor (TUNING.FIT_ABILITY_FLOOR, expressed on the 0..100 fit scale).
  const severe = weakest.fit < TUNING.FIT_ABILITY_FLOOR * 100 ? weakest : undefined

  return {
    perAssignment,
    overall,
    strongest,
    weakest,
    ...(severe !== undefined ? { severeMismatch: severe } : {}),
    unfilled,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #3 executionConfidence — aggregate PERCEIVED-info confidence (0..100).
// ═══════════════════════════════════════════════════════════════════════════════
// Reuses only PERCEIVED information the studio can see at greenlight:
//   (a) the per-assignment D-9.7 expectedPerformance band widths (wider ⇒ less
//       confident) — the SAME bands #2 produced;
//   (b) the D-3 film-level forecast confidence tier + its causal/uncertainty factors
//       (computeForecast, forecast.ts) — NOT recomputed here; consumed as given;
//   (c) production difficulty = budgetAdequacy (budget.negative / requiredNegative,
//       reception.ts:190-195 / forecast.ts:114-117), read off forecastCenters.core;
//   (d) unproven cross-discipline assignments (workHistory[discipline]==0).
// EXCLUDES Work Ethic (development-only, D-9.11). NEVER changes D-3.

export type ExecutionConfidence = {
  score: number // 0..100
  tier: 'strong' | 'mixed' | 'weak'
  confidenceSources: string[] // legible reasons confidence is high
  uncertaintySources: string[] // legible reasons confidence is low
  explanation: string
}

export type ExecutionConfidenceInput = ReceptionInputs
export type ExecutionConfidenceContext = ForecastContext

export function executionConfidence(
  inp: ExecutionConfidenceInput,
  ctx: ExecutionConfidenceContext,
): ExecutionConfidence {
  // (a) Mean EP band half-width across every assignment (writer/director/cast/craft),
  // inverted against a reference max width so wider ⇒ lower confidence. Reuse the
  // SAME expectedPerformance mechanic #2 uses.
  const fit = packageFit({
    concept: inp.concept,
    shape: inp.shape,
    promise: inp.promise,
    writer: inp.writer,
    director: inp.director,
    cast: inp.cast,
    craftHires: inp.craftHires,
  })
  const halfWidths = fit.perAssignment.map((a) => (a.expected.high - a.expected.low) / 2)
  const meanHalfWidth = halfWidths.length > 0 ? mean(halfWidths) : 0
  const bandConfidence = 1 - clamp(meanHalfWidth / TUNING.EXEC_CONF_BAND_REF, 0, 1)

  // (b) D-3 film-level forecast confidence tier (unchanged; consumed as given). Read
  // the tier + factors off the greenlight forecast the engine already produces. NOTE: only
  // confidence / causal / uncertainty are read here — all fame-saturation-INVARIANT (confidence
  // is predicate-based; causal reads the linear stored starDraw) — so the §7 opening-saturation
  // flag is intentionally not threaded here (it would not change any consumed value).
  const forecast = computeForecast(inp, ctx)
  const tierConf: Confidence = forecast.segments[0]?.confidence ?? 'low'
  const causal: ForecastFactorKey[] = forecast.segments[0]?.causalFactors ?? []
  const uncertain: ForecastFactorKey[] = forecast.segments[0]?.uncertaintyFactors ?? []
  const forecastScore = TUNING.EXEC_CONF_TIER_SCORE[tierConf]

  // (c) Production difficulty = budgetAdequacy (0..100), read from the perceived core
  // that forecastCenters already computes-and-discards (RULING C threading).
  const core: DeterministicCore = forecastCenters(inp).core
  const budgetConfidence = core.budgetAdequacy / 100

  // (d) Proven fraction across assignments (unproven cross-discipline ⇒ lower).
  const provenCount = fit.perAssignment.filter((a) => !a.unproven).length
  const provenFraction = fit.perAssignment.length > 0 ? provenCount / fit.perAssignment.length : 1

  const score = clamp(
    100 *
      (TUNING.EXEC_CONF_BAND_W * bandConfidence +
        TUNING.EXEC_CONF_FORECAST_W * (forecastScore / 100) +
        TUNING.EXEC_CONF_BUDGET_W * budgetConfidence +
        TUNING.EXEC_CONF_UNPROVEN_W * provenFraction),
    0,
    100,
  )

  const tier: ExecutionConfidence['tier'] =
    score >= TUNING.EXEC_CONF_TIER_STRONG
      ? 'strong'
      : score >= TUNING.EXEC_CONF_TIER_MIXED
        ? 'mixed'
        : 'weak'

  // Legible sources. Confidence: D-3 causal factors + a well-funded/narrow-band read.
  const confidenceSources: string[] = causal.map(factorLabel)
  if (bandConfidence >= 0.6) confidenceSources.push('narrow performance bands')
  if (budgetConfidence >= 0.9) confidenceSources.push('fully funded negative')
  if (provenFraction >= 0.8) confidenceSources.push('proven assignments')

  // Uncertainty: D-3 uncertainty factors + wide bands / underfunding / unproven.
  const uncertaintySources: string[] = uncertain.map(factorLabel)
  if (bandConfidence < 0.4) uncertaintySources.push('wide performance bands')
  if (budgetConfidence < 0.75) uncertaintySources.push('under-funded negative')
  const unprovenAssignments = fit.perAssignment.filter((a) => a.unproven)
  for (const a of unprovenAssignments) {
    uncertaintySources.push(`${a.role} unproven in ${a.discipline}`)
  }

  const explanation =
    `Execution confidence ${tier} (${Math.round(score)}/100): the studio's forecast is ` +
    `${tierConf}-confidence, performance bands are ${bandConfidence >= 0.6 ? 'tight' : bandConfidence >= 0.4 ? 'moderate' : 'wide'}, ` +
    `the negative is ${budgetConfidence >= 0.9 ? 'fully funded' : budgetConfidence >= 0.75 ? 'adequately funded' : 'under-funded'}, ` +
    `and ${provenCount}/${fit.perAssignment.length} assignments are proven. Work Ethic is excluded (development-only).`

  return { score, tier, confidenceSources, uncertaintySources, explanation }
}

// Human labels for the §7 ForecastFactorKey union (display only; no formula).
function factorLabel(k: ForecastFactorKey): string {
  const map: Record<ForecastFactorKey, string> = {
    castFame: 'known cast draw',
    roleFit: 'strong role fit',
    directorSkill: 'proven director',
    scriptStrength: 'strong script',
    shapeAffinity: 'shape suits audience',
    segmentTaste: 'audience taste match',
    culturalTiming: 'timely subject',
    unknownLead: 'unknown lead',
    untestedDirectorGenre: 'director untested in genre',
    noSegmentHistory: 'no track record with audience',
    vaguePromise: 'vague creative promise',
  }
  return map[k]
}

// ═══════════════════════════════════════════════════════════════════════════════
// #4 forecastProfitRange — a profit RANGE by running computeBoxOffice on the
// per-segment low/high forecast estimates, plus the D-1 committed-cost identity.
// ═══════════════════════════════════════════════════════════════════════════════
// D-12 §6/§17: when the economy is ENGAGED, studioRevenue = the blended RENTAL SHARE of box
// office (STUDIO_RENTAL_BLENDED), NOT the full gross; distributor/exhibitor economics are
// abstracted into the single blended share. D-17A FIX-PASS: the NEVER-ENGAGED (D-1) path still
// credits the full `boxOffice.total` in one lump at release, so there the share is 1 and
// `studioRevenueIsFullBoxOffice` is true — the flag now REPORTS the basis instead of asserting
// a constant one.
//
//   committedCost = budget.negative + budget.marketing + Σ salaries (writer +
//                   director + all cast + all craft) — the D-1 debit identity
//                   (actions.ts:279-282, agents.ts:128-132, standing/D-1).
//   breakEven     = committedCost / share — the break-even GROSS box office (studio keeps `share`).
//   studioRevenue.{low,high,expected} = share × computeBoxOffice(estimates).total on the
//     per-segment {low, high, estimate} forecast bands (reusing §5.5 verbatim).
//   profit        = studioRevenue − committedCost, per band edge.
// Does NOT guarantee profit; a negative `profit.low` is reported honestly.
// NOTE (minor, disclosed): this LIVE re-forecast computes openings on the linear fame path;
// the greenlight-LOCKED forecast (actions.ts) and the realized release both apply the §7 fame
// saturation. The decision-relevant locked forecast is correct; this panel's opening magnitude
// may differ slightly from the realized opening for very-high-fame casts.

export type MoneyRange = { low: number; high: number; expected: number }

export type ForecastProfitRange = {
  studioRevenue: MoneyRange
  profit: MoneyRange
  breakEven: number // = committedCost / share (break-even GROSS box office)
  committedCost: number
  confidence: Confidence
  upsideDrivers: string[] // from the §7 causal factors
  downsideRisks: string[] // from the §7 uncertainty factors
  // D-12 engaged: false (blended rental share). D-1 / never engaged: true (full gross lump).
  studioRevenueIsFullBoxOffice: boolean
}

export type ForecastProfitInput = ReceptionInputs
export type ForecastProfitContext = ForecastContext & {
  // Salaries the D-1 committed cost sums. The UI resolves these from the same talent
  // it passes in `inp` (writer/director/cast/craft); we accept them explicitly so this
  // helper stays a pure function of its inputs (no state traversal).
  salaries: number
  // D-12: whether the economy is engaged (`economyEngaged(state)` — the PERSISTED regime fact
  // since D-17A/R2; the adapter threads it at `adapter.ts:3070-3071`), threaded from the adapter
  // so the LIVE Commercial-Outlook re-forecast uses the SAME §7 Hill fame opening-reach path as the
  // greenlight-locked forecast and realized release. Defaults false → linear (ungated/M0A) path.
  saturateFame?: boolean
  // D-12 P2: whether the D-12 economy calibration (routine gross scale + awareness-conditioned
  // marketing) applies. Equals saturateFame in production, but kept SEPARATE so a fame-only test can
  // isolate fame. Defaults false → no gross scale, legacy marketing Hill.
  engaged?: boolean
}

// Run §5.5 box office on ONE per-segment LEGS appeal map + its matching OPENING appeal map
// (D-12: legs stay linear, opening is fame-saturated). Factored so we can run it on the low,
// expected, and high band edges identically. Omitting the opening map reproduces the legacy
// single-appeal behavior (opening === legs).
function boxTotalFor(
  inp: ForecastProfitInput,
  appealBySegment: Record<SegmentId, number>,
  openingBySegment?: Record<SegmentId, number>,
  engaged = false,
): number {
  return computeBoxOffice(
    appealBySegment,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    openingBySegment,
    engaged, // D-12 P2: same engaged gate as greenlight/realized (awareness mkt + gross scale)
  ).total
}

// ═══════════════════════════════════════════════════════════════════════════════
// D-17A/T6 — QUANTIFIED DISCOVERABILITY EXPOSURE (Owner ruling; D-16 item 9)
// ═══════════════════════════════════════════════════════════════════════════════
// The D-13 discoverability mechanic widens a film's OPENING when the package lacks reach
// support. The player was warned about it in prose only, and the warning was decided by a
// PARALLEL APPROXIMATION of the engine's rule (raw awareness/100 + a flat marketing bump +
// an UNWEIGHTED mean of cast fame), which disagreed with the engine and silently missed
// exposed packages. Lesson AC: same rule, not a similar one.
//
// This is the SAME rule `resolveReception` applies (reception.ts:633-642), evaluated on the
// AUTHORITATIVE operands rather than proxies for them:
//   • awarenessFactor  — from `computeBoxOffice(...)` at the forecast centers, i.e. the very
//     box-office pass that produces the displayed expected gross;
//   • starDraw         — from `forecastCenters(...)`: the LINEAR, CAST_WEIGHT-weighted draw
//     (NOT `starDrawOpening`), exactly what reception.ts:707 feeds the rule.
// INFORMATION DISCIPLINE: nothing here reveals the realized discoverability draw. The
// box-office pass runs at z = 0 (the default), so the multiplier it applies is exactly 1 and
// the only thing extracted is the deterministic support level the player could compute from
// values already on screen. `resolveReception` and every constant are untouched.

// Compact money for the DISPLAY-ONLY narrative strings below. Mirrors `ui/src/format.ts`
// `money()` exactly, so a figure quoted inside a risk sentence reads the same as the same
// figure quoted in a Metric two panels away. Presentation only — nothing here is simulated.
function moneyShort(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs.toFixed(0)}`
}

/** An opening MULTIPLIER for display: two decimals, trailing zeros trimmed (0.85x, 1.8x, 1x). */
function mult(m: number): string {
  return `${Number(m.toFixed(2))}x`
}

export type DiscoveryExposure = {
  /** blended reach support ∈ [0,1] — DISC_SUPPORT_AWARENESS·awareness + DISC_SUPPORT_STAR·star. */
  reachSupport: number
  /** how far below DISC_SUPPORT_THRESHOLD the support falls, as a fraction ∈ [0,1]. 0 = safe. */
  shortfall: number
  /**
   * true iff the engine will actually apply a discovery multiplier: the economy is ENGAGED
   * **and** the support falls short. D-17A FIX-PASS — `reception.ts:643` gates the spread on
   * `engaged` (`discoverabilitySpread = engaged ? … : 0`), so on the never-engaged path the
   * multiplier is identically 1 and there is nothing to warn about. `exposed` used to ignore
   * the regime, so a disengaged package was told its opening could swing across the hard
   * floor-to-ceiling band when the
   * engine could not move it at all.
   */
  exposed: boolean
  /** the regime this verdict was computed under. false ⇒ the multiplier is identically 1. */
  engaged: boolean
  /** the lognormal spread the engine applies: DISC_SPREAD · shortfall^DISC_SUPPORT_EXP. */
  spread: number
  /** |z| the band below is quoted at — DISC_FORECAST_LOW_Z, the engine's own forecast-band z. */
  bandZ: number
  /**
   * The band the engine can ACTUALLY produce at ±bandZ, after the hard clips:
   *   bandLow  = max(DISC_FLOOR, exp(−spread·z)),  bandHigh = min(DISC_CEIL, exp(+spread·z)).
   * D-17A FIX-PASS: the display used to quote the hard clips for EVERY exposed
   * package. At a 2% shortfall the real band is [0.99×, 1.01×] — the clips were unreachable,
   * and the quoted "worst case" dollar figure was one the engine would never produce.
   */
  bandLow: number
  bandHigh: number
  /** true when the band actually reaches the hard clip — only then is naming it truthful. */
  clippedLow: boolean
  clippedHigh: boolean
  /** the governed clip bounds on the opening multiplier. */
  floor: number
  ceil: number
}

/**
 * The rule itself, on its two authoritative operands. Mirrors reception.ts:633-642.
 * `reachSupport` and `shortfall` are BYTE-IDENTICAL to the pre-fix-pass computation — the
 * adversarial suite pins them against the engine's own operands.
 */
function discoveryExposureFrom(
  awarenessFactor: number,
  starDraw: number,
  engaged: boolean,
): DiscoveryExposure {
  const reachSupport = clamp(
    TUNING.DISC_SUPPORT_AWARENESS * awarenessFactor + TUNING.DISC_SUPPORT_STAR * clamp(starDraw / 100, 0, 1),
    0,
    1,
  )
  const shortfall = clamp((TUNING.DISC_SUPPORT_THRESHOLD - reachSupport) / TUNING.DISC_SUPPORT_THRESHOLD, 0, 1)
  const exposed = engaged && shortfall > 0
  const spread = engaged ? TUNING.DISC_SPREAD * Math.pow(shortfall, TUNING.DISC_SUPPORT_EXP) : 0
  const z = TUNING.DISC_FORECAST_LOW_Z
  const rawLow = Math.exp(-spread * z)
  const rawHigh = Math.exp(spread * z)
  const bandLow = Math.max(TUNING.DISC_FLOOR, rawLow)
  const bandHigh = Math.min(TUNING.DISC_CEIL, rawHigh)
  return {
    reachSupport,
    shortfall,
    exposed,
    engaged,
    spread,
    bandZ: z,
    bandLow,
    bandHigh,
    clippedLow: rawLow <= TUNING.DISC_FLOOR,
    clippedHigh: rawHigh >= TUNING.DISC_CEIL,
    floor: TUNING.DISC_FLOOR,
    ceil: TUNING.DISC_CEIL,
  }
}

/** The forecast-centre box office + its centres — ONE pass, shared by the range and the exposure. */
function centerBoxOffice(
  inp: ForecastProfitInput,
  saturateFame: boolean,
  engaged: boolean,
): { centers: ReturnType<typeof forecastCenters>; box: ReturnType<typeof computeBoxOffice> } {
  const centers = forecastCenters(inp, saturateFame, engaged)
  const box = computeBoxOffice(
    centers.centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    centers.centersOpening,
    engaged,
    // discoverabilityZ + openingStarDraw deliberately left at their defaults: the multiplier is
    // exactly 1 at z = 0, and awarenessFactor does not depend on the star draw.
  )
  return { centers, box }
}

/**
 * Is this package exposed to discoverability risk, and by how much? Player-visible information
 * only (studio awareness, marketing spend, cast fame — all on screen at Assembly).
 */
export function discoveryExposure(
  inp: ForecastProfitInput,
  opts?: { saturateFame?: boolean; engaged?: boolean },
): DiscoveryExposure {
  // D-17A FIX-PASS: the default is the DISENGAGED regime, and it is now honoured rather than
  // silently assumed-yet-exposed — a caller who omits the flag gets `exposed: false`, which is
  // the truth on that path (`reception.ts:643` zeroes the spread when not engaged).
  const engaged = opts?.engaged ?? false
  const { centers, box } = centerBoxOffice(inp, opts?.saturateFame ?? false, engaged)
  return discoveryExposureFrom(box.awarenessFactor, centers.starDraw, engaged)
}

export function forecastProfitRange(
  inp: ForecastProfitInput,
  ctx: ForecastProfitContext,
): ForecastProfitRange {
  // D-12: same canonical fame AND economy-engaged path as greenlight/realized (single engine helper;
  // no UI duplication). engaged must be threaded so the forecast craft carries the SAME production-
  // budget realization delta the greenlight-locked forecast + realized release use — otherwise the
  // live Commercial-Outlook range would omit an under/over-funded film's craft penalty and diverge.
  const forecast = computeForecast(inp, ctx, ctx.saturateFame ?? false, ctx.engaged ?? false)

  // Assemble the low / estimate / high per-segment LEGS appeal maps (§7 SegmentForecast.
  // {low,estimate,high}) AND the matching fame-saturated OPENING maps (SegmentForecast.opening.*),
  // so the box-office pass reproduces the greenlight/realized opening reach exactly (D-12 §7).
  const lowMap: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const midMap: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const highMap: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const openLow: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const openMid: Record<SegmentId, number> = {} as Record<SegmentId, number>
  const openHigh: Record<SegmentId, number> = {} as Record<SegmentId, number>
  for (const seg of forecast.segments) {
    lowMap[seg.segmentId] = seg.low
    midMap[seg.segmentId] = seg.estimate
    highMap[seg.segmentId] = seg.high
    openLow[seg.segmentId] = seg.opening.low
    openMid[seg.segmentId] = seg.opening.estimate
    openHigh[seg.segmentId] = seg.opening.high
  }

  // Run §5.5 verbatim on each band (legs + matching opening). Box office is monotone in appeal.
  const engaged = ctx.engaged ?? false // D-12 P2 economy scale — distinct from the fame flag above
  const revLow = boxTotalFor(inp, lowMap, openLow, engaged)
  const revExpected = boxTotalFor(inp, midMap, openMid, engaged)
  const revHigh = boxTotalFor(inp, highMap, openHigh, engaged)

  // D-1 committed cost = negative + marketing + Σ salaries (salaries passed in ctx).
  const committedCost = inp.budget.negative + inp.budget.marketing + ctx.salaries

  // D-12 §6/§17: Studio Revenue is the blended RENTAL SHARE of box office (not the full gross);
  // break-even GROSS = cost / share. The revLow/expected/high above are GROSS box office; scale.
  // D-17A FIX-PASS — the share is the REGIME's share, not a constant. ENGAGED: a theatrical run
  // pays the studio `STUDIO_RENTAL_BLENDED` of each week's gross (`economy.ts:67`). NEVER
  // ENGAGED (D-1): release credits the FULL gross in one lump (`tick.ts:238-247`), so the share
  // is 1 and break-even gross IS the direct cost. Applying 0.52 there understated the studio's
  // own money ~1.92× and put the Assembly break-even and the Dashboard scorecard — which reads
  // the run — on two different bases for the same question.
  const share = engaged ? TUNING.STUDIO_RENTAL_BLENDED : 1
  const studioRevenue: MoneyRange = { low: revLow * share, high: revHigh * share, expected: revExpected * share }
  const profit: MoneyRange = {
    low: revLow * share - committedCost,
    high: revHigh * share - committedCost,
    expected: revExpected * share - committedCost,
  }

  const confidence: Confidence = forecast.segments[0]?.confidence ?? 'low'
  const upsideDrivers = (forecast.segments[0]?.causalFactors ?? []).map(factorLabel)
  const downsideRisks = (forecast.segments[0]?.uncertaintyFactors ?? []).map(factorLabel)

  // Capital-frontier fix (engaged, DISPLAY-ONLY): narrate the new script-potential, discoverability,
  // and marketing tradeoffs so players understand the risk. These read only values the forecast band
  // already reflects (script potential, funding adequacy, star draw, awareness, marketing tier) — they
  // add no formula, draw no RNG, and reveal no hidden outcome. filmPackage.ts is never read by the sim,
  // so this cannot perturb M0A byte-identity. Thresholds compare against named constants only.
  if (engaged) {
    const strength = inp.concept.baselineStrength
    const reqNeg = inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
    const funding = inp.budget.negative / Math.max(reqNeg, 1)
    // D-17A/T6: ONE forecast-centre box-office pass, reused by the discoverability exposure and
    // by the marketing-capacity copy below. `engaged` ⇒ the forecast offset is 0, so these
    // centres ARE the `midMap`/`openMid` maps that produced `revExpected` above.
    const { centers: fcCenters, box: centerBox } = centerBoxOffice(inp, ctx.saturateFame ?? false, engaged)

    if (strength >= TUNING.SCRIPT_POTENTIAL_REF + 15) {
      upsideDrivers.push('Strong material gives this film substantial upside if the team delivers.')
    } else if (strength <= TUNING.SCRIPT_POTENTIAL_REF - 12) {
      downsideRisks.push('Limited script potential constrains the ordinary commercial ceiling.')
    }
    if (funding < 0.95 && inp.shapeEffects.budgetDemandMultiplier > TUNING.BUDGET_AMBITION_REF) {
      downsideRisks.push("Production funding is insufficient to realize the script's potential.")
    }
    // D-13 conditional discoverability: when the package lacks reach support (low awareness +
    // marketing + star), the opening carries wide governed uncertainty. Communicate the risk WITH
    // ITS NUMERIC BAND and the sleeper counterpoint (never promise it), and WIDEN the forecast LOW
    // band to reflect the discovery-obscurity scenario — display-only, deterministic, mirroring the
    // realized spread; it never reveals the realized z (drawn only at release from the isolated
    // 'discovery-v1' stream).
    //
    // D-17A/T6: the exposure is now decided by the ENGINE'S OWN RULE on its own operands
    // (`discoveryExposureFrom` over this pass's awarenessFactor + the linear starDraw). The old
    // proxy — raw awareness/100 plus a flat marketing bump plus an unweighted cast-fame mean —
    // disagreed with the engine and silently missed exposed packages. The widening MAGNITUDE logic
    // below is unchanged; it is simply driven by the correct shortfall now.
    const disc = discoveryExposureFrom(centerBox.awarenessFactor, fcCenters.starDraw, engaged)
    if (disc.exposed) {
      const discSpread = disc.spread
      // D-17A/T6 (final copy — WORDING ONLY, values and logic unchanged): the last
      // unquantified word here was "substantial", an intensity claim the read-model can
      // actually measure. The sentence now states the measured support against the threshold
      // it misses. Nothing beyond that is claimed — no probability, no realized draw, no
      // promise of a sleeper.
      //
      // D-17A FIX-PASS: the band is the SHORTFALL-DERIVED one the engine can actually produce
      // at ±DISC_FORECAST_LOW_Z, not the hard clips. Quoting the floor-to-ceiling band for every exposed
      // package overclaimed by orders of magnitude at small shortfalls (a 2% shortfall's real
      // band is [0.99×, 1.01×]) and contradicted the forecast band on the same panel, whose
      // low edge is already `exp(−spread·z)`. The clips are named only when reached.
      const clipNote =
        disc.clippedLow || disc.clippedHigh
          ? ` The engine clips the multiplier at ${disc.floor}x and ${disc.ceil}x, and this band reaches ${
              disc.clippedLow && disc.clippedHigh ? 'both' : disc.clippedLow ? 'the floor' : 'the ceiling'
            }.`
          : ''
      downsideRisks.push(
        `Limited reach support (${Math.round(disc.reachSupport * 100)}% of the ${Math.round(
          TUNING.DISC_SUPPORT_THRESHOLD * 100,
        )}% this film needs to open reliably) creates discoverability risk: this film's opening turnout can land anywhere from ${mult(
          disc.bandLow,
        )} to ${mult(disc.bandHigh)} its expected level.${clipNote}`,
      )
      upsideDrivers.push('A weak opening could still develop into a sleeper if audiences respond.')
      const discLowMult = Math.max(TUNING.DISC_FLOOR, Math.exp(-discSpread * TUNING.DISC_FORECAST_LOW_Z))
      profit.low = Math.min(profit.low, revExpected * share * discLowMult - committedCost)
    }
    // D-17A/T6: the capacity line is gated on MEASURED capacity — this campaign's spend against
    // the awareness-conditioned `marketingCapacity` the same box-office pass computed — rather
    // than on an absolute spend threshold.
    //
    // D-17A FIX-PASS (R6 again). What stood here still asserted that "spend beyond that converts
    // to little additional turnout". That is a claim about MARGINAL RETURN, and the engine does
    // not compute one: sweeping the real marketing grid, the measured marginal return at this
    // gate is frequently above 1 studio dollar per marketing dollar, and the NEXT grid rung is
    // often net-positive. The same line also called a ratio of SPEND ("$400K ÷ $267K of measured
    // capacity") "1.6x the AUDIENCE this film can efficiently reach", which the Assembly screen
    // states correctly two panels away.
    //
    // The rule now: report only what is measured, on the basis it is measured on. The entry
    // fires exactly when the engine's OWN `overexposure` value is above zero — the same gate
    // Assembly's overexposure line uses — and it names the consequence the engine actually
    // applies, which is a LEGS penalty conditional on under-delivery (`reception.ts:601-616`),
    // not wasted turnout. No steering, no marginal-return claim.
    const capacityRatio =
      centerBox.marketingCapacity > 0 ? inp.budget.marketing / centerBox.marketingCapacity : 0
    if (centerBox.overexposure > 0) {
      downsideRisks.push(
        `Marketing of ${moneyShort(inp.budget.marketing)} against a measured efficient capacity of ` +
          `${moneyShort(centerBox.marketingCapacity)} — ${Math.round(capacityRatio * 100)}% of capacity — ` +
          `counts as overexposure at ${Math.round(centerBox.overexposure * 100)}% of the full effect. ` +
          `The active menu begins at ${String(TUNING.MARKETING_MENU_MULTIPLIERS[0])}x capacity, ` +
          `extends to ${String(TUNING.MARKETING_MENU_MULTIPLIERS[1])}x, and reaches its maximum ` +
          `campaign at ${String(TUNING.MARKETING_MENU_MULTIPLIERS[2])}x. ` +
          `What that costs is measured on the film's legs, not its opening: a campaign this far past ` +
          `capacity raises expectations, and if the film underdelivers on them word of mouth shortens its run.`,
      )
    }
  }

  return {
    studioRevenue,
    profit,
    breakEven: committedCost / share, // break-even GROSS (studio keeps only `share` of it)
    committedCost,
    confidence,
    upsideDrivers,
    downsideRisks,
    // D-17A FIX-PASS: this field states the basis, so it must follow the regime share above.
    studioRevenueIsFullBoxOffice: !engaged,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #5 greenlightAssessment — recompute the greenlight-time PERCEIVED assessment from
// the LOCKED production, deterministically, for the autopsy to diff against actuals.
// ═══════════════════════════════════════════════════════════════════════════════
// Reads ONLY the locked snapshot/production (never live/mutable state): the LOCKED
// production.shape/promise/budget/forecastSnapshot and the talent as they were at
// greenlight (resolved from the pre-tick snapshot). creativeCohesion + packageFit +
// executionConfidence + the LOCKED forecast snapshot + legible strengths/risks.

export type GreenlightAssessment = {
  productionId: string
  cohesion: CreativeCohesion
  fit: PackageFit
  execution: ExecutionConfidence
  profit: ForecastProfitRange
  forecastSnapshot: Forecast // the LOCKED production.forecastSnapshot
  strengths: string[]
  risks: string[]
  // The stored uncertainty factors the autopsy maps against actuals (risksMaterialized).
  storedUncertaintyFactors: ForecastFactorKey[]
}

// The minimal pre-tick snapshot the autopsy needs: the run seed, the market/standing/
// era/concepts/released-films as they were at greenlight, and a talent lookup. The
// UI passes these from the LOCKED save; nothing here reads live GameState.
export type PreTickSnapshot = {
  seed: string
  concepts: FilmConcept[]
  releasedFilms: FilmResult[]
  talentById: Record<string, Talent>
  market: ReceptionInputs['market']
  standing: ReceptionInputs['standing']
  era: ReceptionInputs['era']
}

function requireTalent(snap: PreTickSnapshot, id: string, label: string): Talent {
  const t = snap.talentById[id]
  if (t === undefined) {
    throw new Error(`greenlightAssessment: ${label} references unknown talent id "${id}"`)
  }
  return t
}

export function greenlightAssessment(
  snapshot: PreTickSnapshot,
  production: Production,
  // D-12: whether the economy was engaged at greenlight. The autopsy reconstructs the LOCKED
  // greenlight forecast, which used the P2 economy path (0.70 gross scale + awareness marketing +
  // budget realization). If this is false the recomputed profit range OMITS the scale and reads
  // ~1/0.70× too high — the autopsy arithmetic bug. A session-autopsied greenlight is always engaged.
  engaged = false,
  // Managed Script Projects freeze their assessment before production. Autopsy
  // callers resolve this pair from the authoritative production link inside core;
  // legacy callers omit it and preserve the original concept/writer calculation.
  scriptStrengthOverride?: ReceptionInputs['scriptStrengthOverride'],
): GreenlightAssessment {
  const concept = snapshot.concepts.find((c) => c.id === production.conceptId)
  if (concept === undefined) {
    throw new Error(
      `greenlightAssessment: production "${production.id}" references unknown conceptId "${production.conceptId}"`,
    )
  }

  const writer = requireTalent(snapshot, production.writerId, 'writerId')
  const director = requireTalent(snapshot, production.directorId, 'directorId')
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) {
    cast[slot] = requireTalent(snapshot, production.cast[slot], `cast.${slot}`)
  }
  const craftHires = production.craftIds.map((id, i) =>
    requireTalent(snapshot, id, `craftIds[${i}]`),
  )

  // Rebuild the §5 ReceptionInputs exactly as the greenlight did, from the LOCKED
  // production.shape/promise/budget and the greenlight-time market/standing/era.
  const inp: ReceptionInputs = {
    concept,
    shape: production.shape,
    shapeEffects: resolveShape(production.shape),
    promise: production.promise,
    budget: production.budget,
    writer,
    director,
    cast,
    craftHires,
    market: snapshot.market,
    standing: snapshot.standing,
    era: snapshot.era,
    ...(scriptStrengthOverride ? { scriptStrengthOverride } : {}),
  }
  const ctx: ForecastContext = {
    seed: snapshot.seed,
    productionId: production.id,
    directorId: production.directorId,
    releasedFilms: snapshot.releasedFilms,
    concepts: snapshot.concepts,
  }

  const cohesion = creativeCohesion(concept, production.shape, production.promise)
  const fit = packageFit({
    concept,
    shape: production.shape,
    promise: production.promise,
    writer,
    director,
    cast,
    craftHires,
  })
  const execution = executionConfidence(inp, ctx)

  let salaries = writer.salary + director.salary
  for (const slot of CAST_SLOTS) salaries += cast[slot].salary
  for (const c of craftHires) salaries += c.salary
  // D-12: recompute the profit range on the SAME economy path the greenlight locked — otherwise the
  // autopsy's Expected Studio Revenue / profit diverge from the persisted forecast snapshot (which is
  // scaled). saturateFame + engaged both track the greenlight economy state.
  const profit = forecastProfitRange(inp, { ...ctx, salaries, saturateFame: engaged, engaged })

  // The stored uncertainty factors come off the LOCKED forecast snapshot (D-3).
  const storedUncertaintyFactors =
    production.forecastSnapshot.segments[0]?.uncertaintyFactors ?? []

  // Strengths / risks: legible roll-up over the four assessments (display only).
  const strengths: string[] = []
  if (cohesion.tier === 'strong') strengths.push('coherent creative brief')
  strengths.push(...cohesion.strengths)
  if (fit.strongest.fit >= 70) strengths.push(`strong ${fit.strongest.role}`)
  strengths.push(...execution.confidenceSources)
  // D-17A/T2: WORDING ONLY — the trigger and the value are untouched. `profit.profit` is the
  // DIRECT-cost band (Studio Revenue − the film's own commitment); this assessment has no
  // studio state and therefore cannot know the fixed cost of the cycle, so an unqualified
  // "expected to profit" asserted a profitability that can be false studio-economically. The
  // claim now names the basis it is actually making. R7's headline lives at Assembly, which
  // does have the burn in scope.
  if (profit.profit.expected > 0) strengths.push('expected to profit on its direct costs')

  const risks: string[] = []
  risks.push(...cohesion.conflicts)
  if (fit.severeMismatch !== undefined) {
    risks.push(`severe mismatch: ${fit.severeMismatch.role}`)
  } else if (fit.weakest.fit < 45) {
    risks.push(`weak ${fit.weakest.role}`)
  }
  risks.push(...execution.uncertaintySources)
  if (profit.profit.low < 0) risks.push('could lose money')

  return {
    productionId: production.id,
    cohesion,
    fit,
    execution,
    profit,
    forecastSnapshot: production.forecastSnapshot,
    strengths,
    risks,
    storedUncertaintyFactors,
  }
}

// ── risksMaterialized — map each stored uncertaintyFactor to whether it BIT ────────
// For the autopsy: given the greenlight assessment (which stores the D-3 uncertainty
// factors) and the ACTUAL FilmResult, decide for each stored factor whether the risk
// it named actually hurt the film. Reads the locked assessment + the actual result
// only. Deterministic; no formula change.

export type MaterializedRisk = {
  factor: ForecastFactorKey
  materialized: boolean
  detail: string
}

export type RisksMaterialized = {
  risks: MaterializedRisk[]
  materializedCount: number
}

// Thresholds for "did the risk bite" — provisional, read-only autopsy heuristics over
// the ACTUAL result (not sim reads). Kept local (autopsy-only display judgments).
const AUTOPSY = {
  UNDERPERFORM_CRITIC: 45, // criticScore below ⇒ the film underperformed critically
  UNDERPERFORM_SEGMENT: 50, // a segment score below ⇒ that audience underperformed
  VAGUE_PROMISE_COHESION: 0.5, // realized cohesion below ⇒ the vague brief showed
} as const

export function risksMaterialized(
  assessment: GreenlightAssessment,
  actualResult: FilmResult,
): RisksMaterialized {
  const risks: MaterializedRisk[] = []

  // Mean realized segment score (for segment-history / lead risks).
  const segScores = SEGMENT_ORDER.map((s) => actualResult.segmentScores[s]).filter(
    (v): v is number => v !== undefined,
  )
  const meanSegScore = segScores.length > 0 ? mean(segScores) : 0

  for (const factor of assessment.storedUncertaintyFactors) {
    let materialized = false
    let detail = ''
    switch (factor) {
      case 'unknownLead': {
        // The lead was an unknown quantity; it BIT if the film underperformed with
        // audiences (low mean segment score) or critics.
        materialized =
          meanSegScore < AUTOPSY.UNDERPERFORM_SEGMENT ||
          actualResult.criticScore < AUTOPSY.UNDERPERFORM_CRITIC
        detail = materialized
          ? `unknown lead: mean audience ${Math.round(meanSegScore)}, critics ${Math.round(actualResult.criticScore)}`
          : 'unknown lead delivered'
        break
      }
      case 'untestedDirectorGenre': {
        // Untested director in-genre; BIT if craft/critics came in low.
        materialized = actualResult.criticScore < AUTOPSY.UNDERPERFORM_CRITIC
        detail = materialized
          ? `untested director: critics ${Math.round(actualResult.criticScore)}`
          : 'director handled the genre'
        break
      }
      case 'noSegmentHistory': {
        // No track record with the intended audience; BIT if segments underperformed.
        materialized = meanSegScore < AUTOPSY.UNDERPERFORM_SEGMENT
        detail = materialized
          ? `no audience track record: mean audience ${Math.round(meanSegScore)}`
          : 'audience turned out'
        break
      }
      case 'vaguePromise': {
        // Vague creative promise; BIT if realized cohesion was low (the brief showed).
        materialized = actualResult.cohesion < AUTOPSY.VAGUE_PROMISE_COHESION
        detail = materialized
          ? `vague promise: realized cohesion ${actualResult.cohesion.toFixed(2)}`
          : 'the film held together anyway'
        break
      }
      default: {
        // Causal-only factors are not stored as uncertainty factors; ignore defensively.
        detail = 'not an uncertainty factor'
        break
      }
    }
    risks.push({ factor, materialized, detail })
  }

  const materializedCount = risks.filter((r) => r.materialized).length
  return { risks, materializedCount }
}

// ═══════════════════════════════════════════════════════════════════════════════
// #6 packageDelta — a PURE diff of two assessments (change-preview / A-B compare).
// ═══════════════════════════════════════════════════════════════════════════════
// Only REAL computed deltas; no directional claim not backed by a number. Diffs the
// per-assignment fit (by role+slot), overall fit, execution confidence, and the
// forecast/profit/star-power/salary numbers already computed on each side.

export type AssignmentDelta = {
  role: AssignmentFit['role']
  slot?: CastSlot
  beforeTalentId?: string
  afterTalentId?: string
  changed: boolean // the assigned talent id differs
  fitBefore?: number
  fitAfter?: number
  fitDelta?: number // afterFit − beforeFit (only when both present)
}

export type PackageDelta = {
  perAssignment: AssignmentDelta[]
  overallFitDelta: number
  executionConfidenceDelta: number
  studioRevenueExpectedDelta: number
  profitExpectedDelta: number
  breakEvenDelta: number
  starPowerDelta: number // Σ fame after − Σ fame before (cast only)
  salaryDelta: number // committedCost after − before (proxy for salary/budget shift)
}

// One side of a delta: the assessments plus the raw cast fame + committed cost the
// diff needs. The UI builds `before`/`after` from greenlightAssessment (or a live
// package assessment) plus these two scalars it already has in hand.
export type PackageSide = {
  fit: PackageFit
  execution: ExecutionConfidence
  profit: ForecastProfitRange
  castStarPower: number // Σ cast fame (0..300)
}

// Key an assignment by role+slot for stable pairing across before/after.
function assignmentKey(a: { role: AssignmentFit['role']; slot?: CastSlot }): string {
  return a.slot !== undefined ? `${a.role}:${a.slot}` : a.role
}

export function packageDelta(before: PackageSide, after: PackageSide): PackageDelta {
  // Pair per-assignment by role+slot. Fixed union order: before's order, then any
  // after-only keys appended (deterministic).
  const beforeByKey = new Map<string, AssignmentFit>()
  for (const a of before.fit.perAssignment) beforeByKey.set(assignmentKey(a), a)
  const afterByKey = new Map<string, AssignmentFit>()
  for (const a of after.fit.perAssignment) afterByKey.set(assignmentKey(a), a)

  const orderedKeys: string[] = []
  const seen = new Set<string>()
  for (const a of before.fit.perAssignment) {
    const k = assignmentKey(a)
    orderedKeys.push(k)
    seen.add(k)
  }
  for (const a of after.fit.perAssignment) {
    const k = assignmentKey(a)
    if (!seen.has(k)) {
      orderedKeys.push(k)
      seen.add(k)
    }
  }

  const perAssignment: AssignmentDelta[] = []
  for (const k of orderedKeys) {
    const b = beforeByKey.get(k)
    const a = afterByKey.get(k)
    const role = (a ?? b)!.role
    const slot = (a ?? b)!.slot
    const changed = (b?.talentId ?? null) !== (a?.talentId ?? null)
    const d: AssignmentDelta = {
      role,
      ...(slot !== undefined ? { slot } : {}),
      ...(b !== undefined ? { beforeTalentId: b.talentId, fitBefore: b.fit } : {}),
      ...(a !== undefined ? { afterTalentId: a.talentId, fitAfter: a.fit } : {}),
      changed,
      ...(b !== undefined && a !== undefined ? { fitDelta: a.fit - b.fit } : {}),
    }
    perAssignment.push(d)
  }

  return {
    perAssignment,
    overallFitDelta: after.fit.overall - before.fit.overall,
    executionConfidenceDelta: after.execution.score - before.execution.score,
    studioRevenueExpectedDelta:
      after.profit.studioRevenue.expected - before.profit.studioRevenue.expected,
    profitExpectedDelta: after.profit.profit.expected - before.profit.profit.expected,
    breakEvenDelta: after.profit.breakEven - before.profit.breakEven,
    starPowerDelta: after.castStarPower - before.castStarPower,
    salaryDelta: after.profit.committedCost - before.profit.committedCost,
  }
}
