// ── §13 Candidate generator (phase 3, step 4) ────────────────────────────────
// generateCandidates(state, tick): CandidatePackage[] — the finite, deterministic,
// agent-INDEPENDENT decision grid both agents draw from (§13; rev. 4 B18/B19/B21).
//
// This module is pure and reads state only through public fields. It NEVER touches
// the sim stream (state.rngState): every draw comes from the DERIVED candidate
// stream stream(state.seed, 'candidates', tick) (M9), keyed by tick (not by agent),
// so RandomAgent and OracleAgent — invoked at the same state — see the IDENTICAL
// 500 packages.
//
// Rev. 4 references folded in:
//   B18 — package shape (concept/writer/director/cast + shape + promise + budget,
//         plus the negativeLevel/marketingLevel index metadata phase-4 flags read).
//   B19 — enumeration: sample pools, cross-product, drop double-cast (M16), dedupe
//         to 500 distinct packages by rejection sampling from the candidate stream.
//   B21 — intendedSegments = [argmax_s expectedSegmentAppeal] at construction.
//   M3  — requiredNegative = baseNegativeCost · shape budgetDemandMultiplier ·
//         era.costScale; budget.negative = NEGATIVE_BUDGET_MULTIPLIERS[negIdx] ·
//         requiredNegative; budget.marketing = MARKETING_BUDGET_LEVELS[mktIdx].
//   M16 — eligibility (exclude talent engaged in ANY active production) + drop any
//         package whose three cast ids are not all distinct.
//   D-4 — craftIds is ALWAYS [] in M0A (no craft dimension in the grid).
//
// The DRAW ORDER is fixed and documented (see the numbered comments below); the
// insertion order of the 500 distinct packages defines each package's candidate
// index, which OracleAgent uses for tie-breaks (ruling #3).

import {
  CANDIDATE_CONFIG,
  MARKETING_BUDGET_LEVELS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  PROMISE_CENTERS,
  PROMISE_WIDTHS,
  rangeFrom,
} from './grid.js'
import { economyEngaged } from './employment.js'
import { forecastCenters, type ForecastInputs } from './forecast.js'
import { marketingLevelsFor } from './marketingMenu.js'
import type { ReceptionInputs } from './reception.js'
import { resolveShape } from './shape.js'
import type { RngStream } from './rng.js'
import { stream } from './rng.js'
import type {
  Budget,
  CastSlot,
  FilmConcept,
  FilmShape,
  GameState,
  Promise as FilmPromise,
  Range,
  SegmentId,
  ShapeEffects,
  Talent,
} from './types.js'

// Fixed cast-slot iteration order (determinism, everywhere in this module).
const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// Fixed segment order for the B21 argmax tie-break (worldgen order).
const SEGMENT_ORDER: readonly SegmentId[] = ['youngAdult', 'family', 'adult', 'prestige'] as const

// The three FilmShape axes, in order, for enumerating the 36 shapes.
const OPENINGS: readonly FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook']
const MIDPOINTS: readonly FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation']
const ENDINGS: readonly FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous']

// The three promise axes, in order (each sampled independently per B19).
const PROMISE_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const

// A promise range-triple: one Range per axis, in the fixed axis order.
type PromiseTriple = { intimacy: Range; tonalWeight: Range; kineticEnergy: Range }

// ── The candidate package (B18) ──────────────────────────────────────────────
export type CandidatePackage = {
  conceptId: string
  writerId: string
  directorId: string
  craftIds: string[] // ALWAYS [] in M0A (D-4 — no craft dimension)
  cast: Record<CastSlot, string> // distinct actor ids across the 3 slots
  shape: FilmShape
  promise: FilmPromise // genre = concept.genre (M4); intendedSegments = [argmax] (B21)
  budget: Budget // negative = mult × requiredNegative (M3); marketing = the drawn rung
  negativeLevel: number // index 0..2 into NEGATIVE_BUDGET_MULTIPLIERS (B18 metadata)
  // index 0..2 into the ACTIVE marketing menu: the capacity-anchored rungs when the economy
  // is engaged (D-17B §4), the legacy MARKETING_BUDGET_LEVELS otherwise.
  marketingLevel: number
}

// Guard the 500-distinct rejection loop. The valid space is ~10^8, so 500 distinct
// draws are reachable in vastly fewer attempts; this only fires on a pathological
// (degenerate pool) state, and then it aborts loudly (a bug, not a game event).
const MAX_DRAW_ATTEMPTS = 500_000

// Sample n DISTINCT items from `pool` WITHOUT replacement, drawing from `rng` in a
// fixed order (partial Fisher–Yates: pick an index in the remaining span, swap it
// to the front, repeat). Takes min(n, pool.length) defensively (B19). Returns a
// fresh array; does not mutate `pool`.
function sampleWithoutReplacement<T>(pool: readonly T[], n: number, rng: RngStream): T[] {
  const work = pool.slice()
  const take = Math.min(n, work.length)
  for (let i = 0; i < take; i++) {
    // pick j in [i, work.length)
    const j = i + Math.floor(rng.next() * (work.length - i))
    const tmp = work[i]!
    work[i] = work[j]!
    work[j] = tmp
  }
  return work.slice(0, take)
}

// The 36 distinct shapes, enumerated in a fixed order (opening × midpoint × ending).
function allShapes(): FilmShape[] {
  const out: FilmShape[] = []
  for (const opening of OPENINGS) {
    for (const midpoint of MIDPOINTS) {
      for (const ending of ENDINGS) {
        out.push({ opening, midpoint, ending })
      }
    }
  }
  return out
}

// Draw ONE promise range-triple: for each of the three axes independently, pick a
// center from PROMISE_CENTERS and a width from PROMISE_WIDTHS (center then width,
// in the fixed axis order intimacy → tonalWeight → kineticEnergy), apply rangeFrom
// (B19 / §13).
function drawPromiseTriple(rng: RngStream): PromiseTriple {
  const ranges = {} as Record<(typeof PROMISE_AXES)[number], Range>
  for (const axis of PROMISE_AXES) {
    const center = PROMISE_CENTERS[Math.floor(rng.next() * PROMISE_CENTERS.length)]!
    const width = PROMISE_WIDTHS[Math.floor(rng.next() * PROMISE_WIDTHS.length)]!
    ranges[axis] = rangeFrom(center, width)
  }
  return { intimacy: ranges.intimacy, tonalWeight: ranges.tonalWeight, kineticEnergy: ranges.kineticEnergy }
}

// Compute intendedSegments = [argmax_s expectedSegmentAppeal] (B21). segment appeal
// does NOT depend on intendedSegments, so we compute the deterministic noise-free
// centers first (with a placeholder intendedSegments), then pick the single segment
// with the max center, breaking ties by the fixed segment order SEGMENT_ORDER.
function argmaxSegment(centers: Record<SegmentId, number>): SegmentId {
  let best: SegmentId = SEGMENT_ORDER[0]!
  let bestVal = centers[best]
  for (const s of SEGMENT_ORDER) {
    const v = centers[s]
    // strictly-greater replaces — first-seen (earliest in SEGMENT_ORDER) wins ties.
    if (v > bestVal) {
      best = s
      bestVal = v
    }
  }
  return best
}

// ── generateCandidates (B19) ─────────────────────────────────────────────────
export function generateCandidates(state: GameState, tick: number): CandidatePackage[] {
  const rng = stream(state.seed, 'candidates', tick)
  // D-17B §4: which marketing MENU this state offers. ENGAGED play resolves the
  // capacity-anchored rungs per package below; DISENGAGED/M0A keeps the legacy
  // MARKETING_BUDGET_LEVELS array byte-identically (the acceptance corpus is never engaged).
  const engaged = economyEngaged(state)

  // ── Step 1 — Eligibility (M16). A talent is eligible iff not engaged in ANY
  // active production (as writerId / directorId / any cast slot / any craftId).
  const busy = new Set<string>()
  for (const active of state.studio.activeProductions) {
    busy.add(active.writerId)
    busy.add(active.directorId)
    for (const slot of CAST_SLOTS) busy.add(active.cast[slot])
    for (const cid of active.craftIds) busy.add(cid)
  }
  const eligibleWriters: Talent[] = []
  const eligibleDirectors: Talent[] = []
  const eligibleActors: Talent[] = []
  for (const t of state.talent) {
    if (busy.has(t.id)) continue
    if (t.role === 'writer') eligibleWriters.push(t)
    else if (t.role === 'director') eligibleDirectors.push(t)
    else if (t.role === 'actor') eligibleActors.push(t)
    // craft is not a grid dimension in M0A (D-4) — ignored.
  }

  // ── Step 2 — Sample pools from the candidate stream, in this FIXED order:
  //   (a) 5 writers   without replacement from eligible writers
  //   (b) 5 directors without replacement from eligible directors
  //   (c) 8 lead actors, then 8 antagonist actors, then 8 support actors — three
  //       INDEPENDENT without-replacement 8-samples from eligible actors (they may
  //       overlap across slots; double-cast within a package is dropped in step 3).
  //   (d) 6 distinct shapes from the 36
  //   (e) 8 promise range-triples (each: per-axis center then width, in axis order)
  const writers = sampleWithoutReplacement(eligibleWriters, CANDIDATE_CONFIG.maxWritersPerConcept, rng)
  const directors = sampleWithoutReplacement(eligibleDirectors, CANDIDATE_CONFIG.maxDirectorsPerConcept, rng)
  const leadPool = sampleWithoutReplacement(eligibleActors, CANDIDATE_CONFIG.maxActorsPerSlot, rng)
  const antagPool = sampleWithoutReplacement(eligibleActors, CANDIDATE_CONFIG.maxActorsPerSlot, rng)
  const supportPool = sampleWithoutReplacement(eligibleActors, CANDIDATE_CONFIG.maxActorsPerSlot, rng)
  const shapes = sampleWithoutReplacement(allShapes(), 6, rng)
  const promiseTriples: PromiseTriple[] = []
  for (let i = 0; i < 8; i++) promiseTriples.push(drawPromiseTriple(rng))

  const concepts = state.concepts // all 30 concepts are candidates (B19)

  // Memoize resolveShape over the (≤6) sampled shapes within this decision — the
  // Oracle later scores 500 packages/tick, so avoid re-resolving the same shape.
  const shapeEffectsCache = new Map<FilmShape, ShapeEffects>()
  const resolveShapeCached = (shape: FilmShape): ShapeEffects => {
    let e = shapeEffectsCache.get(shape)
    if (e === undefined) {
      e = resolveShape(shape)
      shapeEffectsCache.set(shape, e)
    }
    return e
  }

  // ── Step 3 — Draw 500 DISTINCT packages by rejection sampling from the cross
  // product concepts × writers × directors × leadPool × antagPool × supportPool ×
  // shapes × promiseTriples × 3 negativeLevels × 3 marketingLevels. Each dimension's
  // index is drawn uniformly per attempt, in this fixed order:
  //   conceptIdx, writerIdx, directorIdx, leadIdx, antagIdx, supportIdx,
  //   shapeIdx, promiseIdx, negIdx, mktIdx.
  // Drop a draw whose three cast ids are not all distinct (M16 double-cast); dedupe
  // via a key of all chosen indices (distinct packages, without replacement). The
  // insertion order defines each package's candidate index.
  const target = CANDIDATE_CONFIG.maxPackagesPerDecision
  const seen = new Set<string>()
  const packages: CandidatePackage[] = []

  let attempts = 0
  while (packages.length < target) {
    if (attempts++ >= MAX_DRAW_ATTEMPTS) {
      throw new Error(
        `generateCandidates: could not reach ${target} distinct packages after ${MAX_DRAW_ATTEMPTS} attempts (tick ${tick})`,
      )
    }

    const conceptIdx = Math.floor(rng.next() * concepts.length)
    const writerIdx = Math.floor(rng.next() * writers.length)
    const directorIdx = Math.floor(rng.next() * directors.length)
    const leadIdx = Math.floor(rng.next() * leadPool.length)
    const antagIdx = Math.floor(rng.next() * antagPool.length)
    const supportIdx = Math.floor(rng.next() * supportPool.length)
    const shapeIdx = Math.floor(rng.next() * shapes.length)
    const promiseIdx = Math.floor(rng.next() * promiseTriples.length)
    const negIdx = Math.floor(rng.next() * NEGATIVE_BUDGET_MULTIPLIERS.length)
    const mktIdx = Math.floor(rng.next() * MARKETING_BUDGET_LEVELS.length)

    const leadActor = leadPool[leadIdx]!
    const antagActor = antagPool[antagIdx]!
    const supportActor = supportPool[supportIdx]!

    // M16 double-cast drop: the three cast ids must be all distinct.
    if (
      leadActor.id === antagActor.id ||
      leadActor.id === supportActor.id ||
      antagActor.id === supportActor.id
    ) {
      continue
    }

    // Dedupe on the full index tuple (distinct packages, without replacement).
    const key = `${conceptIdx},${writerIdx},${directorIdx},${leadIdx},${antagIdx},${supportIdx},${shapeIdx},${promiseIdx},${negIdx},${mktIdx}`
    if (seen.has(key)) continue
    seen.add(key)

    // ── Step 4 — Construct the package.
    const concept: FilmConcept = concepts[conceptIdx]!
    const writer = writers[writerIdx]!
    const director = directors[directorIdx]!
    const shape = shapes[shapeIdx]!
    const triple = promiseTriples[promiseIdx]!
    const shapeEffects = resolveShapeCached(shape)

    // M3: requiredNegative = baseNegativeCost · budgetDemandMultiplier · era.costScale.
    const requiredNegative =
      concept.baseNegativeCost * shapeEffects.budgetDemandMultiplier * state.era.costScale
    const budget: Budget = {
      negative: NEGATIVE_BUDGET_MULTIPLIERS[negIdx]! * requiredNegative,
      marketing: MARKETING_BUDGET_LEVELS[mktIdx]!,
    }

    const cast: Record<CastSlot, string> = {
      lead: leadActor.id,
      antagonist: antagActor.id,
      support: supportActor.id,
    }
    const castTalent: Record<CastSlot, Talent> = {
      lead: leadActor,
      antagonist: antagActor,
      support: supportActor,
    }

    // B21: intendedSegments = [argmax_s expectedSegmentAppeal]. segmentAppeal does
    // NOT depend on intendedSegments, so compute the deterministic noise-free
    // centers with a placeholder promise (ranges = the triple; intendedSegments = []),
    // then set intendedSegments to the single argmax segment.
    const promiseForCenters: FilmPromise = {
      genre: concept.genre, // M4
      intendedSegments: [],
      ranges: triple,
    }
    const inp: ForecastInputs = {
      concept,
      shape, // RULING C: the candidate's sampled shape drives the shared weighting path
      shapeEffects,
      promise: promiseForCenters,
      budget,
      writer,
      director,
      cast: castTalent,
      craftHires: [], // D-4 — no craft in M0A
      market: state.market,
      standing: state.studio.standing,
      era: state.era,
    }
    const { centers } = forecastCenters(inp)
    const intended = argmaxSegment(centers)

    const promise: FilmPromise = {
      genre: concept.genre,
      intendedSegments: [intended],
      ranges: triple,
    }

    // D-17B §4 — ENGAGED ONLY: re-resolve the drawn marketing rung against the
    // capacity-anchored menu. `mktIdx` (the draw) is UNTOUCHED, so the candidate stream's
    // draw order and the dedupe key are identical in both regimes; only the dollars the
    // index maps to change. The menu is anchored on THIS package's own capacity, which is a
    // function of pre-marketing awareness alone — `budget.marketing` never enters it
    // (reception.ts reads it only inside computeBoxOffice), so `inp` carrying the legacy rung
    // as a placeholder cannot bias the answer. When not engaged this is `budget.marketing`
    // unchanged, so the M0A corpus is byte-identical.
    const marketing = engaged ? marketingLevelsFor(state, inp)[mktIdx]! : budget.marketing

    packages.push({
      conceptId: concept.id,
      writerId: writer.id,
      directorId: director.id,
      craftIds: [], // D-4
      cast,
      shape,
      promise,
      budget: { negative: budget.negative, marketing },
      negativeLevel: negIdx,
      marketingLevel: mktIdx,
    })
  }

  return packages
}

// The §5 ReceptionInputs a package resolves to at a given state. Shared by the
// candidate generator (for B21 centers) and OracleAgent (for expected profit).
// Exported so agents.ts assembles inputs identically without re-deriving cast
// resolution. Pure lookup — no stream, no mutation.
export function packageReceptionInputs(state: GameState, pkg: CandidatePackage): ReceptionInputs {
  const concept = state.concepts.find((c) => c.id === pkg.conceptId)!
  const writer = state.talent.find((t) => t.id === pkg.writerId)!
  const director = state.talent.find((t) => t.id === pkg.directorId)!
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) {
    cast[slot] = state.talent.find((t) => t.id === pkg.cast[slot])!
  }
  return {
    concept,
    shape: pkg.shape, // RULING C: shared shape-weighting path (locked package shape)
    shapeEffects: resolveShape(pkg.shape),
    promise: pkg.promise,
    budget: pkg.budget,
    writer,
    director,
    cast,
    craftHires: [], // D-4
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
  }
}
