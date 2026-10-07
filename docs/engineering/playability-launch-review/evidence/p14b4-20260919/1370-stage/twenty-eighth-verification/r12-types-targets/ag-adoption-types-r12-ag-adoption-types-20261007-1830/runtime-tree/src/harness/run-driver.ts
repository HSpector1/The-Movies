// ── M0A run driver (deterministic) ───────────────────────────────────────────
// runOneRun(seed, agentName): drive ONE seeded run of 52 ticks through the sim's
// PUBLIC surface only (generateWorld / applyActions / tick / the agents / the
// candidate + forecast + reception helpers). It NEVER reaches into src/core
// internals and NEVER mutates core state — every measurement is read off the
// returned GameState or recomputed from public exports.
//
// The driver is pure w.r.t. entropy: no unseeded randomness, no Date, no time, no
// UUID, no unstable iteration order. All derived RNG comes from the run seed via
// the sim's own seeded streams (inside applyActions/tick/generateCandidates). The
// driver itself draws nothing.
//
// Per §14 / the role brief it captures, per run:
//   - end-of-run standing triple (D-2)
//   - per release: forecast snapshot (confidence + 4 SegmentForecasts), realized
//     segmentScores, realized weightedAudienceScore, craft, cohesion, criticScore
//     (M8, §15.1, §15.2)
//   - per-release standing delta triple (Δaware, Δprestige, Δconf) (M6)
//   - Oracle per-greenlight decision: chosen strategy signature, chosen EV, chosen
//     ROI, best off-signature EV/ROI, top-forecast cast; plus a self-check that the
//     recomputed argmax equals the agent's returned greenlight (B25/B26)
//   - dead cultural state at tick 0 (B27)
//   - casting set: actor ids ever cast in a released OR active production (M17)

import {
  generateWorld,
  applyActions,
  tick,
  RandomAgent,
  OracleAgent,
  generateCandidates,
  packageReceptionInputs,
  forecastCenters,
  computeBoxOffice,
  TUNING,
} from '../core/index.js'
import type {
  GameState,
  Action,
  FilmResult,
  Forecast,
  SegmentForecast,
  CastSlot,
  SegmentId,
  Confidence,
} from '../core/index.js'
import type { CandidatePackage } from '../core/index.js'
import {
  strategySignature,
  promiseSignVector,
  roiOf,
  SEGMENT_ORDER,
  type PromiseSignVector,
} from './measure.js'

export type AgentName = 'random' | 'oracle'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// ── Per-record shapes written to the raw JSONL and consumed by the aggregator ──

// One released film's raw measurement (M8 / §15.1 / §15.2).
export type ReleaseRecord = {
  productionId: string
  confidence: Confidence
  // The 4 SegmentForecasts from the snapshot (segmentId, low, high, estimate,
  // center, confidence) paired with realized segmentScores.
  segments: Array<{
    segmentId: SegmentId
    low: number
    high: number
    estimate: number
    center: number
    confidence: Confidence
    realized: number
  }>
  weightedAudienceScore: number
  craft: number
  cohesion: number
  criticScore: number
  // Per-release standing delta triple (M6) — after-tick minus before-tick.
  deltaAwareness: number
  deltaPrestige: number
  deltaConfidence: number
}

// One Oracle greenlight decision's raw measurement (B25 / B26).
export type OracleDecisionRecord = {
  tick: number
  chosenSignature: string
  chosenEV: number
  chosenROI: number | null // null when chosen cost < ROI_COST_FLOOR (excluded from ROI stats)
  chosenCost: number
  // Best EV and best ROI among candidates NOT bearing the chosen signature (B25
  // margin needs the best off-signature ROI). null when no off-signature candidate
  // exists, or when no off-signature candidate is ROI-eligible.
  bestOffSignatureEV: number | null
  bestOffSignatureROI: number | null
  // B26 concentration tuple pieces.
  chosenPromiseSignVector: PromiseSignVector
  chosenNegativeLevel: number
  chosenMarketingLevel: number
  topForecastCast: { lead: string; antagonist: string; support: string }
  // Self-check: recomputed argmax productionId-equivalent (chosen package identity)
  // vs the agent's returned greenlight. True = they agree.
  argmaxMatchesAgent: boolean
}

export type RunRecord = {
  seed: string
  agent: AgentName
  releaseCount: number
  // D-2 end-of-run standing.
  endStanding: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number }
  releases: ReleaseRecord[]
  // Oracle-only (empty for random).
  oracleDecisions: OracleDecisionRecord[]
  // B27: dead cultural state at tick 0 (computed for BOTH agents identically —
  // it depends only on the fresh world, not the agent; the aggregator uses the
  // Oracle rows per §14 but the value is agent-independent).
  deadAtTick0: boolean
  deadTick0MaxProfit: number // the max expected profit over the 500 tick-0 packages
  // M17: number of distinct actors ever cast, and the actor-pool denominator.
  actorsEverCast: number
  actorPoolSize: number
  // Self-check summary for the run (any Oracle decision where argmax diverged).
  oracleArgmaxDivergences: number
}

// ── Oracle EV, recomputed EXACTLY as OracleAgent does (D-1 / ruling #3) ────────
// centers = forecastCenters(inp).centers; expectedTotal = computeBoxOffice(...).total;
// salaries = writer + director + lead + antagonist + support; craft salary = 0
// (craftHires always [] in M0A). EV = expectedTotal − negative − marketing − salaries.
// Returns { ev, salaries, cost } so the caller can derive ROI (D-1).
function oracleEV(state: GameState, pkg: CandidatePackage): { ev: number; cost: number } {
  const inp = packageReceptionInputs(state, pkg)
  const { centers } = forecastCenters(inp)
  const box = computeBoxOffice(
    centers,
    state.market.segments,
    state.market.baseMarketValue,
    state.studio.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
  )
  let salaries = inp.writer.salary + inp.director.salary
  for (const slot of CAST_SLOTS) salaries += inp.cast[slot].salary
  const ev = box.total - pkg.budget.negative - pkg.budget.marketing - salaries
  const cost = pkg.budget.negative + pkg.budget.marketing + salaries
  return { ev, cost }
}

// The "expectedTotal" of a package = computeBoxOffice(centers…).total (B26
// top-forecast cast is the argmax of THIS quantity across the 500).
function oracleExpectedTotal(state: GameState, pkg: CandidatePackage): number {
  const inp = packageReceptionInputs(state, pkg)
  const { centers } = forecastCenters(inp)
  const box = computeBoxOffice(
    centers,
    state.market.segments,
    state.market.baseMarketValue,
    state.studio.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
  )
  return box.total
}

// ── B27 dead cultural state at tick 0 ─────────────────────────────────────────
// Fresh world at tick 0 (INITIAL_STANDING, neutral forces): generateCandidates,
// expected PROFIT per package = oracleEV(...).ev; dead iff NONE ≥ 0.
function deadAtTick0(freshState: GameState): { dead: boolean; maxProfit: number } {
  const packages = generateCandidates(freshState, 0)
  let maxProfit = Number.NEGATIVE_INFINITY
  for (const pkg of packages) {
    const { ev } = oracleEV(freshState, pkg)
    if (ev > maxProfit) maxProfit = ev
  }
  return { dead: maxProfit < 0, maxProfit }
}

// ── The run ───────────────────────────────────────────────────────────────────
// `develop` GATES the D-9.8 DEVELOPMENT step in tick(). It DEFAULTS to false so the
// official M0A corpus (development OFF, owner ruling §1) is byte-identical to before
// this parameter existed. The separate D-9 development study passes develop=true.
export function runOneRun(seed: string, agentName: AgentName, develop = false): RunRecord {
  const agent = agentName === 'oracle' ? OracleAgent : RandomAgent

  let state = generateWorld(seed)

  // B27: dead-state is a property of the fresh world (tick 0). Compute it once on
  // the initial state (before any greenlight advances anything). Agent-independent.
  const dead = deadAtTick0(state)

  // Actor-pool denominator (M17): the actors in the generated world.
  const actorPoolSize = state.talent.filter((t) => t.role === 'actor').length

  // §5.5 segment shares, read from the live market (fixed §9 worldgen data). Used
  // to recompute realized weightedAudienceScore = Σ share · segmentScore, since
  // FilmResult does not carry it. Reading from state.market.segments (rather than
  // inlining) keeps the harness faithful to whatever the world declares.
  const shares: Record<SegmentId, number> = {} as Record<SegmentId, number>
  for (const seg of state.market.segments) shares[seg.id] = seg.share

  // Forecast snapshots captured at greenlight, keyed by productionId. Filled by
  // diffing activeProductions after each applyActions (a newly-appeared active
  // production's forecastSnapshot is its greenlight forecast — §7 / M1).
  const snapshotById = new Map<string, Forecast>()

  // The set of actor ids ever cast (in a released OR active production) (M17).
  const actorsEverCast = new Set<string>()

  const releases: ReleaseRecord[] = []
  const oracleDecisions: OracleDecisionRecord[] = []
  let oracleArgmaxDivergences = 0

  // Track which released films we have already recorded (releasedFilms is
  // cumulative on state).
  let recordedReleaseCount = 0

  const TICKS = TUNING.TICKS_PER_YEAR // 52

  for (let t = 0; t < TICKS; t++) {
    // Standing BEFORE this tick (for the per-release delta triple, M6).
    const before = state.studio.standing

    // ── Agent decision + applyActions ─────────────────────────────────────────
    // Recompute the candidate set + Oracle decision data BEFORE applying, so the
    // decision is measured against the exact pre-decision state the agent saw.
    const activeBefore = new Set(state.studio.activeProductions.map((p) => p.id))

    const actions = agent.chooseActions(state)

    if (agentName === 'oracle') {
      recordOracleDecision(state, actions, oracleDecisions)
    }

    state = applyActions(state, actions)

    // Capture the forecastSnapshot of any production that became active this tick.
    for (const p of state.studio.activeProductions) {
      if (!activeBefore.has(p.id)) {
        snapshotById.set(p.id, p.forecastSnapshot)
        // M17: cast actors of a newly-active production are "cast".
        for (const slot of CAST_SLOTS) actorsEverCast.add(p.cast[slot])
      }
    }

    // ── tick ───────────────────────────────────────────────────────────────────
    // develop === false (default) → tick(state) exactly, the frozen dev-OFF path.
    state = develop ? tick(state, { develop: true }) : tick(state)

    // Standing AFTER this tick.
    const after = state.studio.standing

    // Any releases that occurred this tick (releasedFilms is cumulative).
    const newReleases = state.studio.releasedFilms.slice(recordedReleaseCount)
    recordedReleaseCount = state.studio.releasedFilms.length

    for (const film of newReleases) {
      // In M0A there is at most one release per tick (B2/B3 slot cadence), so the
      // per-release delta triple = after − before for the tick the release
      // occurred. (If two releases ever shared a tick, the delta would be the
      // combined tick delta; the role brief states one release/tick in M0A.)
      const snap = snapshotById.get(film.productionId)
      if (snap === undefined) {
        throw new Error(
          `run-driver: released film ${film.productionId} has no captured forecast snapshot (seed ${seed})`,
        )
      }
      releases.push(buildReleaseRecord(film, snap, shares, after, before))
      // M17: a released production's cast actors are "cast" — captured at greenlight
      // above (film carries no cast; the greenlight capture already added them).
    }
  }

  // M17 also counts actors in productions still ACTIVE at year end (unfinished
  // productions — their cast was captured at greenlight above, so they are already
  // in actorsEverCast).

  const endStanding = {
    audienceAwareness: state.studio.standing.audienceAwareness,
    industryPrestige: state.studio.standing.industryPrestige,
    commercialConfidence: state.studio.standing.commercialConfidence,
  }

  return {
    seed,
    agent: agentName,
    releaseCount: releases.length,
    endStanding,
    releases,
    oracleDecisions,
    deadAtTick0: dead.dead,
    deadTick0MaxProfit: dead.maxProfit,
    actorsEverCast: actorsEverCast.size,
    actorPoolSize,
    oracleArgmaxDivergences,
  }

  // ── local helpers that close over oracleArgmaxDivergences ────────────────────
  function recordOracleDecision(
    s: GameState,
    acts: Action[],
    sink: OracleDecisionRecord[],
  ): void {
    // No greenlight this tick (cap reached) → no decision to record.
    const greenlight = acts.find((a) => a.kind === 'greenlight')
    if (greenlight === undefined || greenlight.kind !== 'greenlight') return

    const decisionTick = s.market.tick
    const packages = generateCandidates(s, decisionTick)

    // Recompute EV for every package; find argmax (ties by ascending index — keep
    // first-seen maximum, exactly OracleAgent's rule).
    let bestIdx = -1
    let bestEV = 0
    const evs: number[] = new Array(packages.length)
    const costs: number[] = new Array(packages.length)
    for (let i = 0; i < packages.length; i++) {
      const { ev, cost } = oracleEV(s, packages[i]!)
      evs[i] = ev
      costs[i] = cost
      if (bestIdx === -1 || ev > bestEV) {
        bestIdx = i
        bestEV = ev
      }
    }
    const chosen = packages[bestIdx]!
    const chosenCost = costs[bestIdx]!
    const chosenROI = chosenCost < TUNING.ROI_COST_FLOOR ? null : roiOf(bestEV, chosenCost)

    // Self-check: our recomputed argmax must equal the agent's greenlight. Build
    // the agent's greenlight identity with the recovered level indices (the levels
    // are not on the Action, so we compare via the field tuple that IS on it, plus
    // our chosen package's identity — if they diverge, count it).
    const agentId = greenlightActionIdentity(greenlight)
    const chosenId = packageIdentityNoLevels(chosen)
    const matches = agentId === chosenId
    if (!matches) oracleArgmaxDivergences += 1

    // B25 signature of the chosen package.
    const chosenSignature = strategySignature(chosen)

    // Best EV/ROI among candidates NOT bearing the chosen signature (B25 margin).
    let bestOffEV: number | null = null
    let bestOffROI: number | null = null
    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i]!
      if (strategySignature(pkg) === chosenSignature) continue
      const ev = evs[i]!
      if (bestOffEV === null || ev > bestOffEV) bestOffEV = ev
      // ROI only over ROI-eligible off-signature packages (cost ≥ floor).
      const cost = costs[i]!
      if (cost >= TUNING.ROI_COST_FLOOR) {
        const roi = roiOf(ev, cost)
        if (bestOffROI === null || roi > bestOffROI) bestOffROI = roi
      }
    }

    // B26 top-forecast cast: cast triple of the highest-expectedTotal package.
    let topIdx = -1
    let topTotal = Number.NEGATIVE_INFINITY
    for (let i = 0; i < packages.length; i++) {
      const total = oracleExpectedTotal(s, packages[i]!)
      if (total > topTotal) {
        topTotal = total
        topIdx = i
      }
    }
    const topPkg = packages[topIdx]!

    sink.push({
      tick: decisionTick,
      chosenSignature,
      chosenEV: bestEV,
      chosenROI,
      chosenCost,
      bestOffSignatureEV: bestOffEV,
      bestOffSignatureROI: bestOffROI,
      chosenPromiseSignVector: promiseSignVector(chosen.promise.ranges),
      chosenNegativeLevel: chosen.negativeLevel,
      chosenMarketingLevel: chosen.marketingLevel,
      topForecastCast: {
        lead: topPkg.cast.lead,
        antagonist: topPkg.cast.antagonist,
        support: topPkg.cast.support,
      },
      argmaxMatchesAgent: matches,
    })
  }
}

// ── Release-record assembly ───────────────────────────────────────────────────
// weightedAudienceScore is recomputed as Σ share · segmentScore (§5.5) from the
// film's realized per-segment scores and the live market shares — FilmResult does
// not carry the aggregate, and this recomputation is identical to computeBoxOffice's
// own weightedAudienceScore.
function buildReleaseRecord(
  film: FilmResult,
  snap: Forecast,
  shares: Record<SegmentId, number>,
  after: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number },
  before: { audienceAwareness: number; industryPrestige: number; commercialConfidence: number },
): ReleaseRecord {
  // Film-level confidence = the confidence stamped identically on each
  // SegmentForecast (§7 / M7). Read it from the first segment forecast.
  const confidence: Confidence = snap.segments[0]!.confidence

  // Pair each snapshot SegmentForecast with the realized segmentScore for that
  // segment. Iterate SEGMENT_ORDER for stable output ordering, looking each
  // segment's forecast up by id.
  const forecastById = new Map<SegmentId, SegmentForecast>()
  for (const sf of snap.segments) forecastById.set(sf.segmentId, sf)

  const segments = SEGMENT_ORDER.map((segId) => {
    const sf = forecastById.get(segId)!
    const realized = film.segmentScores[segId]
    return {
      segmentId: segId,
      low: sf.low,
      high: sf.high,
      estimate: sf.estimate,
      center: sf.center,
      confidence: sf.confidence,
      realized,
    }
  })

  let weightedAudienceScore = 0
  for (const segId of SEGMENT_ORDER) {
    weightedAudienceScore += shares[segId] * film.segmentScores[segId]
  }

  return {
    productionId: film.productionId,
    confidence,
    segments,
    weightedAudienceScore,
    craft: film.craft,
    cohesion: film.cohesion,
    criticScore: film.criticScore,
    deltaAwareness: after.audienceAwareness - before.audienceAwareness,
    deltaPrestige: after.industryPrestige - before.industryPrestige,
    deltaConfidence: after.commercialConfidence - before.commercialConfidence,
  }
}

// ── Argmax self-check identity helpers (level-free, since the Action carries no
// level indices — compare on the field tuple present on both) ──────────────────
function packageIdentityNoLevels(pkg: CandidatePackage): string {
  return [
    pkg.conceptId,
    pkg.writerId,
    pkg.directorId,
    pkg.cast.lead,
    pkg.cast.antagonist,
    pkg.cast.support,
    pkg.shape.opening,
    pkg.shape.midpoint,
    pkg.shape.ending,
    JSON.stringify(pkg.promise.ranges),
    pkg.budget.negative,
    pkg.budget.marketing,
  ].join('#')
}

function greenlightActionIdentity(a: Action): string {
  if (a.kind !== 'greenlight') return '<not-greenlight>'
  const p = a.production
  return [
    p.conceptId,
    p.writerId,
    p.directorId,
    p.cast.lead,
    p.cast.antagonist,
    p.cast.support,
    p.shape.opening,
    p.shape.midpoint,
    p.shape.ending,
    JSON.stringify(p.promise.ranges),
    p.budget.negative,
    p.budget.marketing,
  ].join('#')
}
