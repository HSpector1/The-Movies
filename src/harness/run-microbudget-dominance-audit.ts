// ── D-12 MICRO-BUDGET STRATEGY DOMINANCE AUDIT — read-only balance study [audit] ──
// NOT production. Nothing here changes shipped tuning, box office, opening, legs, talent,
// budget, standing, salaries, overhead, starting cash, studio share, or RNG. Every result
// is produced by driving the AUTHORITATIVE core surface exactly as play does:
//   generateWorld → beginFounding → signContract → foundStudio → greenlight (applyActions) → tick.
// Cash is read from state.studio.cash (== INITIAL_CASH + Σ ledger.amount). Per-film contribution
// is Studio Revenue (Σ weeklyGross × studioShare) − DIRECT COMMITMENT (negative + marketing) — the
// SAME "Contribution" the owner film reported. Standing (audienceAwareness / industryPrestige /
// commercialConfidence) is read from state.studio.standing and is NEVER reset between films.
//
// The five audits (owner directive 2026-07-29):
//   1. Exact owner package (Letters from Vineyard) across ≥300 seeds.
//   2. Four repeated-strategy campaigns (A schlock / B competent / C premium / D reckless),
//      ≥300 seeds each, snapshots after 4 / 8 / 12 films (standing carried forward).
//   4. Causal decomposition of the owner package's gross into its named factors.
//   5. Team-Direction isolation (matched packages, direction varied across 0–20 / 40–60 / 70+).
// (Audit 3 — the dominance test — and the verdict are computed in the report from these outputs.)
//
// Run:  node_modules/.bin/vite-node src/harness/run-microbudget-dominance-audit.ts [AUDIT1_SEEDS] [CAMPAIGN_SEEDS]
// Out:  out/d12-microbudget-dominance/*.json  (+ console digest)

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  generateWorld,
  beginFounding,
  applyActions,
  tick,
  TUNING,
  FOUNDING_MINIMUMS,
  busyTalentIds,
  canAfford,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  greenlightAssessment,
  employmentEngaged,
  resolveShape,
  forecastCenters,
  computeSegmentAppeal,
  computeBoxOffice,
  personaToExpression,
  castContribution,
  safeCosine,
  magnitude,
  ROLE_WEIGHT,
  clamp,
  mean as vmean,
  lerp,
} from '../core/index.js'
import type {
  GameState,
  CreativeRole,
  Talent,
  CastSlot,
  SegmentId,
  FilmConcept,
  FilmShape,
  Promise as FilmPromise,
  Standing,
  ReceptionInputs,
} from '../core/index.js'

const AUDIT1_SEEDS = Number(process.argv[2] ?? 300)
const CAMPAIGN_SEEDS = Number(process.argv[3] ?? 300)
const OUT = join(process.cwd(), 'out', 'd12-microbudget-dominance')
const INITIAL = TUNING.INITIAL_CASH
const SHARE = TUNING.STUDIO_RENTAL_BLENDED // 0.52 — read, never changed

// ── stats helpers ─────────────────────────────────────────────────────────────
function quantile(xs: number[], q: number): number {
  if (xs.length === 0) return 0
  const s = [...xs].sort((a, b) => a - b)
  const i = Math.max(0, Math.min(s.length - 1, Math.floor(q * (s.length - 1))))
  return s[i]!
}
const median = (xs: number[]) => quantile(xs, 0.5)
const rate = (flags: boolean[]) => (flags.length ? flags.filter(Boolean).length / flags.length : 0)
const r2 = (n: number) => Math.round(n * 1000) / 1000
const M = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`
const bandR = (xs: number[]) => ({ p10: r2(quantile(xs, 0.1)), median: r2(median(xs)), p90: r2(quantile(xs, 0.9)) })
const bandM = (xs: number[]) => ({ p10: Math.round(quantile(xs, 0.1)), median: Math.round(median(xs)), p90: Math.round(quantile(xs, 0.9)) })

const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']
type Rank = 'best' | 'cheapest' | 'star' | 'mid'

// ── shapes (three narrative slots) — the SAME options play offers ───────────────
// ordinary   — commercially accessible, Standard Production Demand (the owner brief kind).
// demanding  — high demand + reach, low craft headroom (the ambitious/reckless kind).
const SHAPES: Record<'ordinary' | 'demanding', FilmShape> = {
  ordinary: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' },
  demanding: { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' },
}

// Wide-range promise (⇒ promiseMismatch ≈ 0, matching the owner film's "Promise mismatch 0"),
// genre pinned to the concept. intendedSegments broad so segment Fit is honestly scored.
function widePromise(concept: FilmConcept): FilmPromise {
  return {
    genre: concept.genre,
    intendedSegments: ['adult'] as SegmentId[],
    ranges: {
      intimacy: [-0.5, 0.5],
      tonalWeight: [-0.5, 0.5],
      kineticEnergy: [-0.5, 0.5],
    },
  }
}

function rankTalent(list: Talent[], role: CreativeRole, rank: Rank): Talent[] {
  const ovr = (t: Talent) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
  const arr = [...list]
  if (rank === 'best') arr.sort((a, b) => ovr(b) + b.fame - (ovr(a) + a.fame))
  else if (rank === 'cheapest') arr.sort((a, b) => ovr(a) + a.fame - (ovr(b) + b.fame))
  else if (rank === 'star') arr.sort((a, b) => ovr(b) + 2 * b.fame - (ovr(a) + 2 * a.fame))
  else {
    const sortedOvr = [...arr].map(ovr).sort((a, b) => a - b)
    const med = sortedOvr[Math.floor(sortedOvr.length / 2)] ?? 0
    arr.sort((a, b) => Math.abs(ovr(a) - med) - Math.abs(ovr(b) - med))
  }
  return arr
}

// Found a studio, signing `counts` of each role by `rank` (the SAME founding surface as play).
function foundFor(seed: string, rank: Rank, counts: Record<CreativeRole, number>): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const toSign: string[] = []
  for (const role of ROLES) {
    const want = Math.max(FOUNDING_MINIMUMS[role], counts[role])
    const ranked = rankTalent(pool.filter((t) => t.role === role), role, rank)
    for (const t of ranked.slice(0, want)) toSign.push(t.id)
  }
  for (const id of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

// concept by cost tier (sorted by baseNegativeCost). "script" = concept.
function pickConcept(s: GameState, tier: 'cheapest' | 'median' | 'expensive'): FilmConcept {
  const sorted = [...s.concepts].sort((a, b) => a.baseNegativeCost - b.baseNegativeCost)
  if (tier === 'cheapest') return sorted[0]!
  if (tier === 'expensive') return sorted[sorted.length - 1]!
  return sorted[Math.floor(sorted.length / 2)]!
}

// requiredNegative = baseNegativeCost × shape budgetDemandMultiplier × era.costScale (reception.ts:220).
function requiredNegative(concept: FilmConcept, shape: FilmShape, s: GameState): number {
  return concept.baseNegativeCost * resolveShape(shape).budgetDemandMultiplier * s.era.costScale
}

// Team Direction / Delivered Talent Alignment (§5.2 cohesion) — a FAITHFUL replica of
// reception.ts computeContributions, computed from the talent's ACTUAL personas + shape. It is
// fully deterministic (no sampling), so the greenlight preview equals the delivered FilmResult.cohesion.
// Audit 1 asserts round(this × 100) === round(film.cohesion × 100), proving the replica is exact.
const CONTRIB_KEYS = ['writer', 'director', 'lead', 'antagonist', 'support', 'shape'] as const
function teamDirection(writer: Talent, director: Talent, cast: Record<CastSlot, Talent>, shape: FilmShape): number {
  const contributions = {
    writer: personaToExpression(writer.actual),
    director: personaToExpression(director.actual),
    lead: castContribution(cast.lead.actual, 'lead'),
    antagonist: castContribution(cast.antagonist.actual, 'antagonist'),
    support: castContribution(cast.support.actual, 'support'),
    shape: resolveShape(shape).expression,
  } as const
  let ci = 0, ct = 0, ck = 0, wsum = 0
  for (const k of CONTRIB_KEYS) {
    const w = ROLE_WEIGHT[k]
    const c = contributions[k]
    ci += w * c.intimacy; ct += w * c.tonalWeight; ck += w * c.kineticEnergy; wsum += w
  }
  const centroid = { intimacy: ci / wsum, tonalWeight: ct / wsum, kineticEnergy: ck / wsum }
  let directionalAgreement = 0
  if (magnitude(centroid) >= TUNING.CENTROID_MIN_MAGNITUDE) {
    let an = 0, ad = 0
    for (const k of CONTRIB_KEYS) { const w = ROLE_WEIGHT[k]; an += w * safeCosine(contributions[k], centroid); ad += w }
    directionalAgreement = an / ad
  }
  const expressiveStrength = clamp(vmean(CONTRIB_KEYS.map((k) => magnitude(contributions[k]))) / TUNING.EXPECTED_EXPRESSION, 0, 1)
  return clamp(directionalAgreement, 0, 1) * lerp(TUNING.EXPRESSION_FLOOR, 1.0, expressiveStrength)
}

// ── single-film detailed measurement (authoritative) ────────────────────────────
type FilmMeasure = {
  ok: boolean
  // package
  directCommitment: number
  requiredNeg: number
  negMult: number
  // greenlight-time PERCEIVED assessment (owner's decision-point knowledge)
  briefCoherence: number // creativeCohesion.score (0..100) — "Creative Brief Coherence"
  talentFit: number // packageFit.overall (0..100) — "Overall Talent Fit"
  executionConfidence: number // executionConfidence.score (0..100)
  teamDirection: number // §5.2 cohesion × 100 — "Team Direction at greenlight"
  promiseMismatch: number // 0..1
  segmentFit: Record<SegmentId, number>
  forecastProfit: { low: number; expected: number; high: number } // Contribution band at greenlight
  forecastOpening: number
  forecastTotal: number
  // realized
  opening: number
  gross: number
  legs: number
  studioRevenue: number
  contribution: number
  criticScore: number
  audienceScore: number // weighted audience score Σ share × segmentScores
  craft: number
  deliveredAlignment: number // FilmResult.cohesion × 100 (must equal teamDirection)
  recoveredOpeningWeek: boolean // opening-week studio revenue ≥ direct commitment
  durationWeeks: number
  // standing deltas (single release, vs INITIAL_STANDING)
  dAwareness: number
  dPrestige: number
  dConfidence: number
}

function measureFilm(
  seed: string,
  opts: { rank: Rank; conceptTier: 'cheapest' | 'median' | 'expensive'; shapeKey: 'ordinary' | 'demanding'; negMult: number; marketing: number },
): FilmMeasure | null {
  const counts: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 1, craft: 1 }
  let s = foundFor(seed, opts.rank, counts)
  const engaged = employmentEngaged(s)
  const standingBefore: Standing = { ...s.studio.standing }
  const shape = SHAPES[opts.shapeKey]
  const concept = pickConcept(s, opts.conceptTier)
  const promise = widePromise(concept)
  const reqNeg = requiredNegative(concept, shape, s)
  const negative = Math.round(reqNeg * opts.negMult)
  const marketing = opts.marketing
  const directCommitment = negative + marketing

  const busy = busyTalentIds(s)
  const pick = (role: CreativeRole) =>
    rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role, opts.rank)
  const w = pick('writer')[0], d = pick('director')[0], a = pick('actor'), c = pick('craft')[0]
  if (!w || !d || !c || a.length < 3) return null
  if (!canAfford(s, directCommitment).ok) return null
  const cast = { lead: a[0]!, antagonist: a[1]!, support: a[2]! } as Record<CastSlot, Talent>
  const teamDir = teamDirection(w, d, cast, shape)

  const action = {
    kind: 'greenlight' as const,
    production: {
      conceptId: concept.id,
      shape,
      promise,
      writerId: w.id,
      directorId: d.id,
      cast: { lead: cast.lead.id, antagonist: cast.antagonist.id, support: cast.support.id } as Record<CastSlot, string>,
      craftIds: [c.id],
      budget: { negative, marketing },
    },
  }
  s = applyActions(s, [action])
  const id = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  const prod = s.studio.activeProductions.find((p) => p.id === id)!

  // Greenlight assessment (perceived, deterministic) on the SAME engaged economy path.
  const talentById: Record<string, Talent> = {}
  for (const t of s.talent) talentById[t.id] = t
  const assess = greenlightAssessment(
    { seed: s.seed, concepts: s.concepts, releasedFilms: s.studio.releasedFilms, talentById, market: s.market, standing: s.studio.standing, era: s.era },
    prod,
    engaged,
  )

  // Perceived segment fit / promise mismatch: rebuild the greenlight ReceptionInputs & score them.
  const inp: ReceptionInputs = {
    concept, shape, shapeEffects: resolveShape(shape), promise,
    budget: { negative, marketing }, writer: w, director: d, cast, craftHires: [c],
    market: s.market, standing: standingBefore, era: s.era,
  }
  const fc = forecastCenters(inp, engaged, engaged)
  const appeal = computeSegmentAppeal(inp, fc.core.delivered, fc.core.craft, fc.core.timelinessContribution, engaged)

  // advance to run completion.
  const durationCap = TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 6
  let weeks = 0
  for (let k = 0; k < durationCap; k++) {
    s = tick(s, { develop: true })
    weeks++
    const run = s.theatricalRuns.find((r) => r.productionId === id)
    if (run && run.status !== 'active') break
  }
  const run = s.theatricalRuns.find((r) => r.productionId === id)
  if (!run) return null
  const gross = run.weeklyGross.reduce((x, y) => x + y, 0)
  const opening = run.weeklyGross[0] ?? 0
  const studioRevenue = gross * run.studioShare
  const openingStudioRev = opening * run.studioShare
  const film = s.studio.releasedFilms.find((f) => f.productionId === id)!
  const audienceScore = s.market.segments.reduce((acc, seg) => acc + seg.share * (film.segmentScores[seg.id] ?? 0), 0)
  const standingAfter = s.studio.standing

  return {
    ok: true,
    directCommitment,
    requiredNeg: Math.round(reqNeg),
    negMult: opts.negMult,
    briefCoherence: assess.cohesion.score,
    talentFit: assess.fit.overall,
    executionConfidence: assess.execution.score,
    teamDirection: teamDir * 100,
    promiseMismatch: appeal.promiseMismatch,
    segmentFit: appeal.segmentFit,
    forecastProfit: { low: assess.profit.profit.low, expected: assess.profit.profit.expected, high: assess.profit.profit.high },
    forecastOpening: prod.forecastSnapshot.expectedOpening,
    forecastTotal: prod.forecastSnapshot.expectedTotal,
    opening,
    gross,
    legs: opening > 0 ? gross / opening : 0,
    studioRevenue,
    contribution: studioRevenue - directCommitment,
    criticScore: film.criticScore,
    audienceScore,
    craft: film.craft,
    deliveredAlignment: film.cohesion * 100,
    recoveredOpeningWeek: openingStudioRev >= directCommitment,
    durationWeeks: weeks,
    dAwareness: standingAfter.audienceAwareness - standingBefore.audienceAwareness,
    dPrestige: standingAfter.industryPrestige - standingBefore.industryPrestige,
    dConfidence: standingAfter.commercialConfidence - standingBefore.commercialConfidence,
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT 1 — exact owner package distribution (≥300 seeds)
// ════════════════════════════════════════════════════════════════════════════════
function audit1(seeds: number) {
  const opts = { rank: 'cheapest' as Rank, conceptTier: 'cheapest' as const, shapeKey: 'ordinary' as const, negMult: 0.75, marketing: 100_000 }
  const rows: FilmMeasure[] = []
  let alignMismatch = 0
  for (let i = 0; i < seeds; i++) {
    const m = measureFilm(`owner-${i}`, opts)
    if (!m) continue
    rows.push(m)
    // self-check: greenlight Team Direction must equal delivered alignment (both deterministic §5.2 cohesion).
    if (Math.round(m.teamDirection) !== Math.round(m.deliveredAlignment)) alignMismatch++
  }
  const contrib = rows.map((r) => r.contribution)
  const segFitKeys = rows.length ? Object.keys(rows[0]!.segmentFit) : []
  const segFitMed: Record<string, number> = {}
  for (const k of segFitKeys) segFitMed[k] = r2(median(rows.map((r) => r.segmentFit[k as SegmentId] ?? 0)))
  return {
    label: 'Letters from Vineyard — cheapest script, Lean budget (negMult 0.75), Small marketing (100k), cheapest talent, coherent ordinary brief',
    n: rows.length,
    teamDirectionEqualsDeliveredAlignment: alignMismatch === 0,
    directCommitmentMedian: Math.round(median(rows.map((r) => r.directCommitment))),
    forecastContribution: {
      downside: Math.round(median(rows.map((r) => r.forecastProfit.low))),
      expected: Math.round(median(rows.map((r) => r.forecastProfit.expected))),
      upside: Math.round(median(rows.map((r) => r.forecastProfit.high))),
    },
    realizedContribution: bandM(contrib),
    lossProbability: r2(rate(contrib.map((x) => x < 0))),
    opening: bandM(rows.map((r) => r.opening)),
    legs: bandR(rows.map((r) => r.legs)),
    gross: bandM(rows.map((r) => r.gross)),
    craft: bandR(rows.map((r) => r.craft)),
    audienceScore: bandR(rows.map((r) => r.audienceScore)),
    criticScore: bandR(rows.map((r) => r.criticScore)),
    teamDirection: bandR(rows.map((r) => r.teamDirection)),
    deliveredAlignment: bandR(rows.map((r) => r.deliveredAlignment)),
    briefCoherence: bandR(rows.map((r) => r.briefCoherence)),
    talentFit: bandR(rows.map((r) => r.talentFit)),
    executionConfidence: bandR(rows.map((r) => r.executionConfidence)),
    promiseMismatchMedian: r2(median(rows.map((r) => r.promiseMismatch))),
    segmentFitMedian: segFitMed,
    standingChange: {
      awareness: bandR(rows.map((r) => r.dAwareness)),
      prestige: bandR(rows.map((r) => r.dPrestige)),
      confidence: bandR(rows.map((r) => r.dConfidence)),
    },
    productionDurationWeeksMedian: median(rows.map((r) => r.durationWeeks)),
    profitPerProductionWeek: bandM(rows.map((r) => r.contribution / Math.max(1, r.durationWeeks))),
    recoverDuringOpeningWeekRate: r2(rate(rows.map((r) => r.recoveredOpeningWeek))),
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT 2 — repeated-strategy campaigns (≥300 seeds each; snapshots at 4/8/12 films)
// ════════════════════════════════════════════════════════════════════════════════
type StrategyRoute = {
  name: string
  rank: Rank
  conceptTier: 'cheapest' | 'median' | 'expensive'
  shapeKey: 'ordinary' | 'demanding'
  negMult: number
  marketing: number | 'awareness' // 'awareness' = awareness-appropriate (rationalMarketing)
  maxConcurrent: number
  counts: Record<CreativeRole, number>
}
const STRATEGIES: StrategyRoute[] = [
  // A — MICRO-BUDGET SCHLOCK: cheapest script, audience-friendly ordinary brief, cheapest talent,
  //     Lean budget, Small marketing, repeat whenever capacity allows.
  { name: 'A_microbudget_schlock', rank: 'cheapest', conceptTier: 'cheapest', shapeKey: 'ordinary', negMult: 0.75, marketing: 100_000, maxConcurrent: 2, counts: { actor: 6, director: 2, writer: 2, craft: 2 } },
  // B — COMPETENT MAINSTREAM: ordinary (median-cost) script, sensible ordinary brief, competent
  //     (mid-tier) talent, budget appropriate to demand, awareness-appropriate marketing.
  { name: 'B_competent_mainstream', rank: 'mid', conceptTier: 'median', shapeKey: 'ordinary', negMult: 1.0, marketing: 'awareness', maxConcurrent: 2, counts: { actor: 6, director: 2, writer: 2, craft: 2 } },
  // C — PREMIUM / AMBITIOUS: expensive (high production value) project, strongest practical talent,
  //     higher Production Budget, wide marketing — accepts high capital exposure. (Ordinary shape so
  //     premium is not double-charged the demanding-shape craft penalty; that lever is isolated in D.)
  { name: 'C_premium_ambitious', rank: 'best', conceptTier: 'expensive', shapeKey: 'ordinary', negMult: 1.25, marketing: 1_000_000, maxConcurrent: 2, counts: { actor: 6, director: 2, writer: 2, craft: 2 } },
  // D — RECKLESS CHEAP-DEMANDING: cheapest talent on a demanding shape (execution inadequate for the
  //     Production Demand), legal funding + marketing.
  { name: 'D_reckless_cheap_demanding', rank: 'cheapest', conceptTier: 'median', shapeKey: 'demanding', negMult: 1.0, marketing: 400_000, maxConcurrent: 2, counts: { actor: 6, director: 2, writer: 2, craft: 2 } },
]

function rationalMarketing(s: GameState): number {
  const warmed = s.studio.releasedFilms.length >= 2
  const aud = s.studio.standing.audienceAwareness
  if (warmed && aud >= 45) return 1_000_000
  if (aud < 12) return 100_000
  return 400_000
}

type CampaignFilm = { contribution: number; directCommitment: number; criticScore: number; audienceScore: number; teamDirection: number }
type Snapshot = {
  films: number
  cash: number
  cashMultiple: number
  weeks: number
  awareness: number
  prestige: number
  confidence: number
  canFinanceNext: boolean
}
type CampaignRun = {
  reached: number
  unableToContinue: boolean
  everNegative: boolean
  minCash: number
  filmRows: CampaignFilm[]
  snapshots: Record<number, Snapshot>
  finalCash: number
}

const SNAPSHOT_AT = [4, 8, 12]
const TARGET_FILMS = 12

function nextDirectCommitment(s: GameState, st: StrategyRoute): number {
  const shape = SHAPES[st.shapeKey]
  const concept = pickConcept(s, st.conceptTier)
  const negative = Math.round(requiredNegative(concept, shape, s) * st.negMult)
  const marketing = st.marketing === 'awareness' ? rationalMarketing(s) : st.marketing
  return negative + marketing
}

function runCampaign(seed: string, st: StrategyRoute): CampaignRun {
  let s = foundFor(seed, st.rank, st.counts)
  const committedById: Record<string, number> = {}
  const tdById: Record<string, number> = {}
  const filmRows: CampaignFilm[] = []
  const completedIds = new Set<string>()
  const snapshots: Record<number, Snapshot> = {}
  let minCash = s.studio.cash
  let everNegative = false
  let unableToContinue = false
  let weeks = 0
  const WEEK_CAP = TARGET_FILMS * (TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS) + 120
  let stall = 0

  const shape = SHAPES[st.shapeKey]
  const launchedCount = () => Object.keys(committedById).length
  for (; weeks < WEEK_CAP; weeks++) {
    // Greenlight to fill capacity while films remain to launch.
    while (s.studio.activeProductions.length < st.maxConcurrent && launchedCount() < TARGET_FILMS) {
      const busy = busyTalentIds(s)
      const pick = (role: CreativeRole) =>
        rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role, st.rank)
      const w = pick('writer')[0], d = pick('director')[0], a = pick('actor'), c = pick('craft')[0]
      if (!w || !d || !c || a.length < 3) break
      const concept = pickConcept(s, st.conceptTier)
      const promise = widePromise(concept)
      const negative = Math.round(requiredNegative(concept, shape, s) * st.negMult)
      const marketing = st.marketing === 'awareness' ? rationalMarketing(s) : st.marketing
      const directCommitment = negative + marketing
      if (!canAfford(s, directCommitment).ok) break
      const cast = { lead: a[0]!, antagonist: a[1]!, support: a[2]! } as Record<CastSlot, Talent>
      const teamDir = teamDirection(w, d, cast, shape)
      s = applyActions(s, [{
        kind: 'greenlight',
        production: {
          conceptId: concept.id, shape, promise,
          writerId: w.id, directorId: d.id,
          cast: { lead: cast.lead.id, antagonist: cast.antagonist.id, support: cast.support.id } as Record<CastSlot, string>,
          craftIds: [c.id], budget: { negative, marketing },
        },
      }])
      const p = s.studio.activeProductions[s.studio.activeProductions.length - 1]!
      committedById[p.id] = directCommitment
      tdById[p.id] = teamDir
    }

    s = tick(s, { develop: true })
    minCash = Math.min(minCash, s.studio.cash)
    if (s.studio.cash < 0) everNegative = true

    // Register newly-completed runs (in productionId order) as films.
    for (const [pid, commit] of Object.entries(committedById)) {
      if (completedIds.has(pid)) continue
      const run = s.theatricalRuns.find((r) => r.productionId === pid)
      if (run && run.status !== 'active') {
        completedIds.add(pid)
        const gross = run.weeklyGross.reduce((x, y) => x + y, 0)
        const film = s.studio.releasedFilms.find((f) => f.productionId === pid)
        const audienceScore = film ? s.market.segments.reduce((acc, seg) => acc + seg.share * (film.segmentScores[seg.id] ?? 0), 0) : 0
        filmRows.push({
          contribution: gross * run.studioShare - commit,
          directCommitment: commit,
          criticScore: film ? film.criticScore : 0,
          audienceScore,
          teamDirection: (tdById[pid] ?? 0) * 100,
        })
        const count = completedIds.size
        if (SNAPSHOT_AT.includes(count)) {
          snapshots[count] = {
            films: count,
            cash: s.studio.cash,
            cashMultiple: s.studio.cash / INITIAL,
            weeks,
            awareness: s.studio.standing.audienceAwareness,
            prestige: s.studio.standing.industryPrestige,
            confidence: s.studio.standing.commercialConfidence,
            canFinanceNext: canAfford(s, nextDirectCommitment(s, st)).ok,
          }
        }
      }
    }

    // Stuck detection: below target, no active production, nothing paying, cannot afford next film.
    const remaining = TARGET_FILMS - launchedCount()
    const noActive = s.studio.activeProductions.length === 0
    const noRevenueIncoming = !s.theatricalRuns.some((r) => r.status === 'active')
    if (remaining > 0 && noActive && noRevenueIncoming && !canAfford(s, nextDirectCommitment(s, st)).ok) {
      stall++
      if (stall > 3) { unableToContinue = true; break }
    } else {
      stall = 0
    }
    // Done: all TARGET films launched AND every launched run has completed.
    if (launchedCount() >= TARGET_FILMS && completedIds.size >= launchedCount()) break
  }

  const reached = completedIds.size
  // fill any missing snapshots (e.g., campaign ended before 12) with the final state.
  return { reached, unableToContinue, everNegative, minCash, filmRows, snapshots, finalCash: s.studio.cash }
}

function audit2(seeds: number) {
  const out: any[] = []
  for (const st of STRATEGIES) {
    const runs: CampaignRun[] = []
    for (let i = 0; i < seeds; i++) runs.push(runCampaign(`camp-${st.name}-${i}`, st))
    const perHorizon: Record<number, any> = {}
    for (const h of SNAPSHOT_AT) {
      const snaps = runs.map((r) => r.snapshots[h]).filter(Boolean) as Snapshot[]
      if (snaps.length === 0) { perHorizon[h] = { n: 0, note: 'no run reached this horizon' }; continue }
      const cash = snaps.map((x) => x.cash)
      const mult = snaps.map((x) => x.cashMultiple)
      perHorizon[h] = {
        n: snaps.length,
        reachedRate: r2(snaps.length / runs.length),
        endingCash: bandM(cash),
        cashMultiple: bandR(mult),
        probBelowStart: r2(rate(mult.map((m) => m < 1))),
        weeksMedian: Math.round(median(snaps.map((x) => x.weeks))),
        awareness: bandR(snaps.map((x) => x.awareness)),
        prestige: bandR(snaps.map((x) => x.prestige)),
        confidence: bandR(snaps.map((x) => x.confidence)),
        canFinanceNextRate: r2(rate(snaps.map((x) => x.canFinanceNext))),
      }
    }
    const allFilms = runs.flatMap((r) => r.filmRows)
    const contribs = allFilms.map((f) => f.contribution)
    const rois = allFilms.map((f) => (f.directCommitment > 0 ? f.contribution / f.directCommitment : 0))
    out.push({
      route: st.name,
      definition: {
        rank: st.rank, conceptTier: st.conceptTier, shape: st.shapeKey, negMult: st.negMult,
        marketing: st.marketing, maxConcurrent: st.maxConcurrent,
      },
      seeds: runs.length,
      horizons: perHorizon,
      profitPerFilm: bandM(contribs),
      roiPerFilm: bandR(rois),
      lossRatePerFilm: r2(rate(contribs.map((x) => x < 0))),
      criticScore: bandR(allFilms.map((f) => f.criticScore)),
      audienceScore: bandR(allFilms.map((f) => f.audienceScore)),
      teamDirection: bandR(allFilms.map((f) => f.teamDirection)),
      probEverNegative: r2(rate(runs.map((r) => r.everNegative))),
      maxDrawdownMedian: Math.round(median(runs.map((r) => INITIAL - r.minCash))),
      projectsCompletedMedian: Math.round(median(runs.map((r) => r.reached))),
      unableToContinueRate: r2(rate(runs.map((r) => r.unableToContinue))),
      // campaign-level profit per week over the 12-film (or reached) horizon
      profitPerWeekMedian: Math.round(median(runs.map((r) => {
        const snap = r.snapshots[12] ?? r.snapshots[8] ?? r.snapshots[4]
        const wk = snap ? snap.weeks : 1
        return (r.finalCash - INITIAL) / Math.max(1, wk)
      }))),
    })
  }
  return out
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT 4 — causal decomposition of the owner package's gross
// ════════════════════════════════════════════════════════════════════════════════
function audit4(seed: string) {
  const counts: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 1, craft: 1 }
  let s = foundFor(seed, 'cheapest', counts)
  const engaged = employmentEngaged(s)
  const shape = SHAPES.ordinary
  const concept = pickConcept(s, 'cheapest')
  const promise = widePromise(concept)
  const reqNeg = requiredNegative(concept, shape, s)
  const negative = Math.round(reqNeg * 0.75)
  const marketing = 100_000
  const busy = busyTalentIds(s)
  const pick = (role: CreativeRole) =>
    rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role, 'cheapest')
  const w = pick('writer')[0]!, d = pick('director')[0]!, a = pick('actor'), c = pick('craft')[0]!
  const cast = { lead: a[0]!, antagonist: a[1]!, support: a[2]! } as Record<CastSlot, Talent>
  const inp: ReceptionInputs = {
    concept, shape, shapeEffects: resolveShape(shape), promise,
    budget: { negative, marketing }, writer: w, director: d, cast, craftHires: [c],
    market: s.market, standing: s.studio.standing, era: s.era,
  }
  const fc = forecastCenters(inp, engaged, engaged)
  const appeal = computeSegmentAppeal(inp, fc.core.delivered, fc.core.craft, fc.core.timelinessContribution, engaged)
  const box = computeBoxOffice(
    appeal.segmentAppeal, s.market.segments, s.market.baseMarketValue, s.studio.standing,
    promise, { negative, marketing }, resolveShape(shape), appeal.segmentAppealOpening, engaged,
  )
  const directCommitment = negative + marketing
  const teamDir = teamDirection(w, d, cast, shape)
  return {
    label: 'Owner-package (Letters from Vineyard) causal gross decomposition — single representative seed',
    seed,
    engaged,
    directCommitment,
    requiredNegative: Math.round(reqNeg),
    negativeAtLean075: negative,
    breakEvenGross: Math.round(directCommitment / SHARE),
    factors: {
      baseMarketValue: Math.round(s.market.baseMarketValue),
      economyScale: engaged ? TUNING.ECONOMY_BOX_OFFICE_SCALE : 1,
      craft: r2(fc.core.craft),
      starDraw: r2(appeal.starDraw),
      segmentFit: Object.fromEntries(Object.entries(appeal.segmentFit).map(([k, v]) => [k, r2(v)])),
      promiseMismatch: r2(appeal.promiseMismatch),
      mismatchPenalty: r2(appeal.mismatchPenalty),
      segmentAppeal: Object.fromEntries(Object.entries(appeal.segmentAppeal).map(([k, v]) => [k, r2(v)])),
      weightedAudienceScore: r2(box.weightedAudienceScore),
      preMarketingAwareness: r2(box.preMarketingAwareness),
      marketingCapacity: Math.round(box.marketingCapacity),
      marketingQuality: r2(box.marketingQuality),
      baseAwareness: r2(box.baseAwareness),
      awarenessFactor: r2(box.awarenessFactor),
      openingReachMult: r2(box.openingReachMult),
      competitionFactor: box.competitionFactor,
      teamDirection: r2(teamDir * 100),
      criticMean: r2(fc.core.criticMean),
    },
    opening: Math.round(box.opening),
    legs: r2(box.legs),
    total: Math.round(box.total),
    studioRevenue: Math.round(box.total * SHARE),
    contribution: Math.round(box.total * SHARE - directCommitment),
    // Opening reconstructs multiplicatively: base × reachSum × openingReachMult × competition × economyScale.
    note: 'opening = baseMarketValue × Σ_seg(share × awarenessFactor × (openingAppeal/100)^APPEAL_CURVE_EXP) × openingReachMult × competitionFactor × economyScale; legs = LEGS_MIN_ENGAGED + (LEGS_MAX−LEGS_MIN_ENGAGED)×(WAS/100)^LEGS_RETENTION_EXP; total = opening × legs. Cohesion/Team Direction enters criticMean ONLY — never opening or legs.',
  }
}

// ════════════════════════════════════════════════════════════════════════════════
// AUDIT 5 — Team-Direction isolation (matched packages; direction varied across bands)
// ════════════════════════════════════════════════════════════════════════════════
// Hold concept / shape / promise / budget / marketing / standing constant. From a large cheapest-
// talent pool, enumerate candidate crews and BUCKET them by Team Direction (0–20 / 40–60 / 70+),
// matching total crew OVR within a tolerance so the ONLY moving part is directional agreement.
function audit5(seeds: number) {
  const shape = SHAPES.ordinary
  const negMult = 1.0
  const marketing = 400_000
  type Bucket = 'low' | 'mid' | 'high'
  const acc: Record<Bucket, { forecastExpected: number[]; forecastDownside: number[]; craft: number[]; audience: number[]; opening: number[]; legs: number[]; contribution: number[]; loss: boolean[]; td: number[]; ovr: number[]; critic: number[]; prestigeDelta: number[] }> =
    { low: blank(), mid: blank(), high: blank() }
  function blank() { return { forecastExpected: [], forecastDownside: [], craft: [], audience: [], opening: [], legs: [], contribution: [], loss: [], td: [], ovr: [], critic: [], prestigeDelta: [] } }

  let matchedTriples = 0
  for (let i = 0; i < seeds; i++) {
    // A big roster so many crews exist. Use MID talent so OVR is controllable and comparable.
    let s = foundFor(`dir-${i}`, 'mid', { actor: 10, director: 4, writer: 4, craft: 4 })
    const engaged = employmentEngaged(s)
    const concept = pickConcept(s, 'median')
    const promise = widePromise(concept)
    const reqNeg = requiredNegative(concept, shape, s)
    const negative = Math.round(reqNeg * negMult)
    const directCommitment = negative + marketing
    const contracted = (role: CreativeRole) => s.contracts.map((cn) => s.talent.find((t) => t.id === cn.talentId)!).filter((t) => t.role === role)
    const writers = contracted('writer'), directors = contracted('director'), actors = contracted('actor'), crafts = contracted('craft')
    if (writers.length < 2 || directors.length < 2 || actors.length < 4 || crafts.length < 2) continue
    const ovrOf = (t: Talent, role: CreativeRole) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
    // Enumerate a bounded set of crews; compute Team Direction + total OVR for each.
    type Cand = { w: Talent; d: Talent; cast: Record<CastSlot, Talent>; c: Talent; td: number; ovr: number }
    const cands: Cand[] = []
    for (const w of writers.slice(0, 4)) for (const d of directors.slice(0, 4)) {
      for (let x = 0; x < Math.min(actors.length, 8); x++) for (let y = 0; y < Math.min(actors.length, 8); y++) for (let z = 0; z < Math.min(actors.length, 8); z++) {
        if (x === y || y === z || x === z) continue
        const cast = { lead: actors[x]!, antagonist: actors[y]!, support: actors[z]! } as Record<CastSlot, Talent>
        const cft = crafts[0]!
        const td = teamDirection(w, d, cast, shape) * 100
        const ovr = ovrOf(w, 'writer') + ovrOf(d, 'director') + ovrOf(cast.lead, 'actor') + ovrOf(cast.antagonist, 'actor') + ovrOf(cast.support, 'actor') + ovrOf(cft, 'craft')
        cands.push({ w, d, cast, c: cft, td, ovr })
      }
    }
    if (cands.length === 0) continue
    // Choose an OVR target = median candidate OVR; keep only crews within ±TOL OVR.
    const TOL = 20
    const targetOvr = median(cands.map((c) => c.ovr))
    const near = cands.filter((c) => Math.abs(c.ovr - targetOvr) <= TOL)
    const bucketOf = (td: number): Bucket | null => (td <= 20 ? 'low' : td >= 40 && td <= 60 ? 'mid' : td >= 70 ? 'high' : null)
    const chosen: Record<Bucket, Cand | undefined> = { low: undefined, mid: undefined, high: undefined }
    // Per band, pick the crew whose total OVR is CLOSEST to the shared target — tightest OVR match so
    // the only material difference across the three runs is directional agreement (Team Direction).
    for (const b of ['low', 'mid', 'high'] as Bucket[]) {
      const inBand = near.filter((c) => bucketOf(c.td) === b)
      if (inBand.length) chosen[b] = inBand.reduce((best, c) => (Math.abs(c.ovr - targetOvr) < Math.abs(best.ovr - targetOvr) ? c : best))
    }
    // Require all three bands present this seed so it is a genuine matched triple.
    if (!chosen.low || !chosen.mid || !chosen.high) continue
    matchedTriples++
    for (const b of ['low', 'mid', 'high'] as Bucket[]) {
      const cand = chosen[b]!
      const m = runOne(s, engaged, concept, shape, promise, negative, marketing, cand.w, cand.d, cand.cast, cand.c)
      if (!m) continue
      acc[b].forecastExpected.push(m.forecastExpected)
      acc[b].forecastDownside.push(m.forecastDownside)
      acc[b].craft.push(m.craft)
      acc[b].audience.push(m.audienceScore)
      acc[b].opening.push(m.opening)
      acc[b].legs.push(m.legs)
      acc[b].contribution.push(m.studioRevenue - directCommitment)
      acc[b].loss.push(m.studioRevenue - directCommitment < 0)
      acc[b].td.push(cand.td)
      acc[b].ovr.push(cand.ovr)
      acc[b].critic.push(m.criticScore)
      acc[b].prestigeDelta.push(m.prestigeDelta)
    }
  }
  const summarize = (b: Bucket) => {
    const g = acc[b]
    return {
      n: g.contribution.length,
      teamDirectionMedian: r2(median(g.td)),
      crewOvrMedian: r2(median(g.ovr)),
      crewOvrBand: bandR(g.ovr), // p10/median/p90 — proves the OVR match is tight per band, not just equal-median
      crewOvrMean: r2(vmean(g.ovr)),
      forecastExpectedGrossMedian: Math.round(median(g.forecastExpected)),
      forecastDownsideGrossMedian: Math.round(median(g.forecastDownside)),
      craftMedian: r2(median(g.craft)),
      audienceScoreMedian: r2(median(g.audience)),
      criticScoreMedian: r2(median(g.critic)),
      prestigeDeltaMedian: r2(median(g.prestigeDelta)),
      openingMedian: Math.round(median(g.opening)),
      legsMedian: r2(median(g.legs)),
      contributionMedian: Math.round(median(g.contribution)),
      lossProbability: r2(rate(g.loss)),
    }
  }
  return {
    label: 'Team-Direction isolation — matched concept/shape/promise/budget/marketing/standing/OVR; only directional agreement varies',
    matchedTriples,
    bands: { low_0_20: summarize('low'), mid_40_60: summarize('mid'), high_70plus: summarize('high') },
  }
}

// Run ONE film on an already-founded state `s` WITHOUT mutating it (fresh clone via re-founding is not
// needed — greenlight+tick return NEW states; we never write back into the caller's `s`).
function runOne(
  s0: GameState, engaged: boolean, concept: FilmConcept, shape: FilmShape, promise: FilmPromise,
  negative: number, marketing: number, w: Talent, d: Talent, cast: Record<CastSlot, Talent>, c: Talent,
): { forecastExpected: number; forecastDownside: number; craft: number; audienceScore: number; opening: number; legs: number; studioRevenue: number; criticScore: number; prestigeDelta: number } | null {
  if (!canAfford(s0, negative + marketing).ok) return null
  const prestigeBefore = s0.studio.standing.industryPrestige
  let s = applyActions(s0, [{
    kind: 'greenlight',
    production: {
      conceptId: concept.id, shape, promise,
      writerId: w.id, directorId: d.id,
      cast: { lead: cast.lead.id, antagonist: cast.antagonist.id, support: cast.support.id } as Record<CastSlot, string>,
      craftIds: [c.id], budget: { negative, marketing },
    },
  }])
  const id = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  const prod = s.studio.activeProductions.find((p) => p.id === id)!
  const talentById: Record<string, Talent> = {}
  for (const t of s.talent) talentById[t.id] = t
  const assess = greenlightAssessment(
    { seed: s.seed, concepts: s.concepts, releasedFilms: s.studio.releasedFilms, talentById, market: s.market, standing: s.studio.standing, era: s.era },
    prod, engaged,
  )
  const forecastExpected = prod.forecastSnapshot.expectedTotal
  const forecastDownside = assess.profit.studioRevenue.low / SHARE // downside GROSS
  const durationCap = TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 6
  for (let k = 0; k < durationCap; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === id)
    if (run && run.status !== 'active') break
  }
  const run = s.theatricalRuns.find((r) => r.productionId === id)
  if (!run) return null
  const gross = run.weeklyGross.reduce((x, y) => x + y, 0)
  const opening = run.weeklyGross[0] ?? 0
  const film = s.studio.releasedFilms.find((f) => f.productionId === id)!
  const audienceScore = s.market.segments.reduce((acc, seg) => acc + seg.share * (film.segmentScores[seg.id] ?? 0), 0)
  return {
    forecastExpected, forecastDownside,
    craft: film.craft, audienceScore,
    opening, legs: opening > 0 ? gross / opening : 0,
    studioRevenue: gross * run.studioShare,
    criticScore: film.criticScore,
    prestigeDelta: s.studio.standing.industryPrestige - prestigeBefore,
  }
}

// ── run all ─────────────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true })
/* eslint-disable no-console */
console.log(`# D-12 MICRO-BUDGET STRATEGY DOMINANCE AUDIT`)
console.log(`# INITIAL_CASH ${M(INITIAL)}  studioShare ${SHARE}  scale ${TUNING.ECONOMY_BOX_OFFICE_SCALE}  appealExp ${TUNING.APPEAL_CURVE_EXP}  legsExp ${TUNING.LEGS_RETENTION_EXP}`)
console.log(`# audit1 seeds ${AUDIT1_SEEDS}  campaign seeds ${CAMPAIGN_SEEDS}\n`)

const a1 = audit1(AUDIT1_SEEDS)
console.log(`## AUDIT 1 — exact owner package (n=${a1.n})  [TeamDir==DeliveredAlign: ${a1.teamDirectionEqualsDeliveredAlignment}]`)
console.log(`  direct commitment(med) ${M(a1.directCommitmentMedian)}   break-even gross ${M(a1.directCommitmentMedian / SHARE)}`)
console.log(`  forecast Contribution   downside ${M(a1.forecastContribution.downside)}  expected ${M(a1.forecastContribution.expected)}  upside ${M(a1.forecastContribution.upside)}`)
console.log(`  realized Contribution   p10 ${M(a1.realizedContribution.p10)}  med ${M(a1.realizedContribution.median)}  p90 ${M(a1.realizedContribution.p90)}   LOSS ${(a1.lossProbability * 100).toFixed(0)}%`)
console.log(`  opening ${M(a1.opening.median)}  gross ${M(a1.gross.median)}  legs ${a1.legs.median}   recover-in-opening-week ${(a1.recoverDuringOpeningWeekRate * 100).toFixed(0)}%`)
console.log(`  craft ${a1.craft.median}  audienceScore ${a1.audienceScore.median}  critic ${a1.criticScore.median}   TeamDirection ${a1.teamDirection.median}  DeliveredAlign ${a1.deliveredAlignment.median}  BriefCoherence ${a1.briefCoherence.median}  TalentFit ${a1.talentFit.median}  ExecConf ${a1.executionConfidence.median}`)
console.log(`  Δawareness ${a1.standingChange.awareness.median}  Δprestige ${a1.standingChange.prestige.median}  Δconfidence ${a1.standingChange.confidence.median}   prodWeeks ${a1.productionDurationWeeksMedian}  profit/wk ${M(a1.profitPerProductionWeek.median)}`)
writeFileSync(join(OUT, 'audit1-exact-package.json'), JSON.stringify(a1, null, 2))

const a2 = audit2(CAMPAIGN_SEEDS)
console.log(`\n## AUDIT 2 — repeated strategy campaigns (n=${CAMPAIGN_SEEDS} each; snapshots at 4/8/12 films)`)
for (const r of a2) {
  console.log(`\n  ${r.route}  [${r.definition.rank} talent, ${r.definition.conceptTier} script, ${r.definition.shape} shape, negMult ${r.definition.negMult}, mkt ${r.definition.marketing}]`)
  for (const h of SNAPSHOT_AT) {
    const x = r.horizons[h]
    if (!x || x.n === 0) { console.log(`    ${h} films: (no run reached)`) ; continue }
    console.log(`    ${h} films (reach ${(x.reachedRate * 100).toFixed(0)}%): cash med ${M(x.endingCash.median)} (${x.cashMultiple.median}×, p10 ${x.cashMultiple.p10}× p90 ${x.cashMultiple.p90}×)  <start ${(x.probBelowStart * 100).toFixed(0)}%  aware ${x.awareness.median} prestige ${x.prestige.median} conf ${x.confidence.median}  finance-next ${(x.canFinanceNextRate * 100).toFixed(0)}%  ~${x.weeksMedian}wk`)
  }
  console.log(`    profit/film med ${M(r.profitPerFilm.median)}  ROI/film med ${(r.roiPerFilm.median * 100).toFixed(0)}%  loss/film ${(r.lossRatePerFilm * 100).toFixed(0)}%  critic ${r.criticScore.median}  audience ${r.audienceScore.median}  teamDir ${r.teamDirection.median}`)
  console.log(`    everNeg ${(r.probEverNegative * 100).toFixed(0)}%  maxDrawdown med ${M(r.maxDrawdownMedian)}  projects med ${r.projectsCompletedMedian}  unable-to-continue ${(r.unableToContinueRate * 100).toFixed(0)}%  profit/wk med ${M(r.profitPerWeekMedian)}`)
}
writeFileSync(join(OUT, 'audit2-strategy-campaigns.json'), JSON.stringify(a2, null, 2))

const a4 = audit4('decomp-0')
console.log(`\n## AUDIT 4 — causal gross decomposition (owner package, seed ${a4.seed})`)
console.log(`  base ${M(a4.factors.baseMarketValue)} × economyScale ${a4.factors.economyScale}   craft ${a4.factors.craft}  starDraw ${a4.factors.starDraw}  WAS ${a4.factors.weightedAudienceScore}  awarenessFactor ${a4.factors.awarenessFactor}  openingReachMult ${a4.factors.openingReachMult}`)
console.log(`  → opening ${M(a4.opening)}  legs ${a4.legs}  total ${M(a4.total)}  studioRev ${M(a4.studioRevenue)}  contribution ${M(a4.contribution)}   (break-even gross ${M(a4.breakEvenGross)})`)
console.log(`  TeamDirection ${a4.factors.teamDirection} → criticMean ${a4.factors.criticMean} (critic path only; NOT in opening/legs)`)
writeFileSync(join(OUT, 'audit4-causal-decomposition.json'), JSON.stringify(a4, null, 2))

const A5_SEEDS = Number(process.argv[4] ?? Math.max(120, Math.min(CAMPAIGN_SEEDS, 200)))
const a5 = audit5(A5_SEEDS)
console.log(`\n## AUDIT 5 — Team-Direction isolation (matched triples: ${a5.matchedTriples})`)
for (const [k, v] of Object.entries(a5.bands) as [string, any][]) {
  console.log(`  ${k.padEnd(12)} TD ${String(v.teamDirectionMedian).padStart(5)}  OVR ${v.crewOvrMedian} [p10 ${v.crewOvrBand.p10} p90 ${v.crewOvrBand.p90}]  craft ${v.craftMedian}  audience ${v.audienceScoreMedian}  opening ${M(v.openingMedian)}  legs ${v.legsMedian}  contrib ${M(v.contributionMedian)}  loss ${(v.lossProbability * 100).toFixed(0)}%  |  critic ${v.criticScoreMedian}  Δprestige ${v.prestigeDeltaMedian}`)
}
writeFileSync(join(OUT, 'audit5-direction-isolation.json'), JSON.stringify(a5, null, 2))

console.log(`\nwrote ${OUT}/{audit1-exact-package,audit2-strategy-campaigns,audit4-causal-decomposition,audit5-direction-isolation}.json`)
