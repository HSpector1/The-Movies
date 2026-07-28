// ── §3 tick pipeline ─────────────────────────────────────────────────────────
// `tick(state): GameState` — the fixed-order simulation step of §3's
// `state = tick(applyActions(state, actions))` pair. Pure: no React/DOM/async/IO,
// no time, no unseeded entropy. Returns a NEW GameState by spreads; never mutates
// the input or any of its sub-objects in place.
//
// Pipeline, in this EXACT order (§3):
//   1. PRODUCTION  advance active productions
//   2. RELEASE     finished productions enter release
//   3. RECEPTION   resolve released films (§5)
//   4. STANDING    update the three channels (§6)
//   5. BROADCAST   phase-4 surface — an intentional no-op here
//
// The ONLY randomness consumed is the sim stream (state.rngState), and ONLY in
// RECEPTION (the single §5.3 critic gaussian per release). `applyActions` and the
// §7 forecast pipeline are NOT called here.
//
// Rev. 4 references folded in:
//   M1   — currentTick = state.market.tick; PRODUCTION advances only productions
//          with startTick < currentTick (a film does NOT advance during its
//          greenlight tick), decrementing remainingTicks by 1; market.tick is
//          incremented as the FINAL step. A film greenlit at t releases during
//          tick t + PRODUCTION_TICKS exactly.
//   N5   — same-tick multi-release order: resolve reception and accumulate standing
//          in ascending productionId order, using plain string `<` (NOT
//          localeCompare — locale sorting is forbidden).
//   B12  — each release is threaded to STANDING via a context carrying the three
//          cast fames, actualNegative, and requiredNegative; benchmarks derive
//          from the production's forecastSnapshot. releasedFilms keeps FilmResult
//          only; the release context is dropped at tick end.
//   N10  — §6's "§9 gate" pointer is stale; there is no gate in this pipeline.

import { evaluateReleaseBroadcast, type ReleaseBroadcastInputs } from './broadcast.js'
import { buildFilmResult, resolveReception, type ReceptionInputs } from './reception.js'
import { RngStream } from './rng.js'
import { resolveShape } from './shape.js'
import { updateStanding, type ReleaseBenchmarks, type StandingContext } from './standing.js'
import type {
  BroadcastItem,
  CastSlot,
  FilmResult,
  GameState,
  Production,
  Standing,
  Talent,
} from './types.js'

// Fixed cast-slot iteration order (determinism: cast resolution and fame capture
// both walk this order).
const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const

// Resolve a talent id to its Talent, or throw a loud abort (a harness bug, not a
// game event) — mirrors applyActions' M16 loud-rejection posture.
function requireTalent(talent: readonly Talent[], id: string, label: string): Talent {
  const found = talent.find((t) => t.id === id)
  if (found === undefined) {
    throw new Error(`tick: ${label} references unknown talent id "${id}"`)
  }
  return found
}

// The per-release pieces STANDING (§6) and BROADCAST (§8) need, captured during
// RECEPTION so the Production (removed from activeProductions at RELEASE) need not
// be revisited. `broadcast` carries the §8 inputs (B23/B24) that the ReceptionResult
// exposes — plus the forecast snapshot, lead fame, concept title, and market
// segments — with `standing` and `tick` filled in at step 5 (standing must be the
// AFTER-step-4 value, so it is not captured here).
type ReleaseBroadcastCapture = Omit<ReleaseBroadcastInputs, 'standing'>

type ReleaseRecord = {
  filmResult: FilmResult
  benchmarks: ReleaseBenchmarks
  ctx: StandingContext
  broadcast: ReleaseBroadcastCapture
}

export function tick(state: GameState): GameState {
  const currentTick = state.market.tick

  // Deserialize the sim stream ONCE. Its state is re-serialized as the final step.
  const rng = RngStream.deserialize(state.rngState)

  // ── 1. PRODUCTION ──────────────────────────────────────────────────────────
  // Advance every active production with startTick < currentTick (M1 skip-first-
  // tick: a film greenlit at t does NOT advance during tick t). Immutable: build a
  // fresh Production for advanced ones, share the untouched ones by reference.
  const advanced: Production[] = state.studio.activeProductions.map((p) =>
    p.startTick < currentTick ? { ...p, remainingTicks: p.remainingTicks - 1 } : p,
  )

  // ── 2. RELEASE ─────────────────────────────────────────────────────────────
  // Collect productions at remainingTicks === 0 after step 1; the rest stay
  // active. Order releasing productions ascending by id via plain string `<`
  // (N5 — NOT localeCompare).
  const releasing = advanced.filter((p) => p.remainingTicks === 0)
  const stillActive = advanced.filter((p) => p.remainingTicks !== 0)
  releasing.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  // ── 3. RECEPTION ───────────────────────────────────────────────────────────
  // For each releasing production IN ascending-id order: resolve reception (the
  // ONLY sim-stream consumer — one critic gaussian per release, in this order),
  // build the FilmResult, credit cash += boxOffice.total, append to releasedFilms,
  // and capture the STANDING pieces. Standing read here is START-OF-TICK standing
  // (the accumulation in step 4 has not begun).
  const startOfTickStanding: Standing = state.studio.standing
  const records: ReleaseRecord[] = []
  let cash = state.studio.cash
  const releasedFilms: FilmResult[] = [...state.studio.releasedFilms]

  for (const prod of releasing) {
    const concept = state.concepts.find((c) => c.id === prod.conceptId)
    if (concept === undefined) {
      throw new Error(`tick: release references unknown conceptId "${prod.conceptId}"`)
    }

    const writer = requireTalent(state.talent, prod.writerId, 'release writerId')
    const director = requireTalent(state.talent, prod.directorId, 'release directorId')

    const cast = {} as Record<CastSlot, Talent>
    for (const slot of CAST_SLOTS) {
      cast[slot] = requireTalent(state.talent, prod.cast[slot], `release cast.${slot}`)
    }

    const craftHires: Talent[] = prod.craftIds.map((id, i) =>
      requireTalent(state.talent, id, `release craftIds[${i}]`),
    )

    const inp: ReceptionInputs = {
      concept,
      shapeEffects: resolveShape(prod.shape),
      promise: prod.promise,
      budget: prod.budget,
      writer,
      director,
      cast,
      craftHires,
      market: state.market,
      standing: startOfTickStanding,
      era: state.era,
    }

    // The single §5.3 critic draw for this release — the ONLY sim-stream advance.
    const result = resolveReception(inp, rng)

    const filmResult = buildFilmResult(result, {
      productionId: prod.id,
      releaseTick: currentTick,
      conceptId: prod.conceptId,
      directorId: prod.directorId,
    })

    // Credit the box office total (D-1 ledger; the debit happened at greenlight).
    cash += filmResult.boxOffice.total
    releasedFilms.push(filmResult)

    // Benchmarks from the production's forecastSnapshot (§6 / B12).
    const benchmarks: ReleaseBenchmarks = {
      expectedOpening: prod.forecastSnapshot.expectedOpening,
      expectedTotal: prod.forecastSnapshot.expectedTotal,
      expectedCriticScore: prod.forecastSnapshot.expectedCriticScore,
    }

    // B12 context (D-6): the three cast fames + actual/required negative (already
    // captured), PLUS baseMarketValue, marketing, and salaries — all ALREADY-EXISTING
    // values read at RELEASE. salaries = Σ(writer + director + cast) resolved talent
    // salaries (craft salaries are 0 in M0A — no craft hires — but excluded here since
    // D-1's committed cost is negative + marketing + writer/director/cast salaries).
    // This context is dropped at tick end (B12); nothing is persisted to GameState.
    const castSalaries = cast.lead.salary + cast.antagonist.salary + cast.support.salary
    const ctx: StandingContext = {
      castFames: {
        lead: cast.lead.fame,
        antagonist: cast.antagonist.fame,
        support: cast.support.fame,
      },
      actualNegative: prod.budget.negative,
      requiredNegative: result.requiredNegative,
      baseMarketValue: state.market.baseMarketValue,
      marketing: prod.budget.marketing,
      salaries: writer.salary + director.salary + castSalaries,
    }

    // §8 broadcast inputs (B23/B24), captured now from the ReceptionResult + the
    // production's forecastSnapshot + the lead's fame + the concept title. `standing`
    // is deferred: broadcast reads standing AS IT STANDS after step-4 STANDING.
    const broadcast: ReleaseBroadcastCapture = {
      productionId: prod.id,
      forecastSnapshot: prod.forecastSnapshot,
      segments: state.market.segments,
      weightedAudienceScore: result.weightedAudienceScore,
      mismatchPenalty: result.mismatchPenalty,
      cohesion: result.cohesion,
      timelinessContribution: result.timelinessContribution,
      awarenessFactor: result.awarenessFactor,
      leadFame: cast.lead.fame,
      conceptTitle: concept.title,
      tick: currentTick,
    }

    records.push({ filmResult, benchmarks, ctx, broadcast })
  }

  // ── 4. STANDING ────────────────────────────────────────────────────────────
  // Accumulate the three channels sequentially, IN ascending-id order (records is
  // already in release order). Start from start-of-tick standing.
  let standing: Standing = startOfTickStanding
  for (const rec of records) {
    standing = updateStanding(standing, rec.filmResult, rec.benchmarks, rec.ctx)
  }

  // ── 5. BROADCAST ───────────────────────────────────────────────────────────
  // §8 minimal deterministic core (B22/B23/B24/M10). Process releases in the SAME
  // ascending-id order used above (`records` is already release-ordered). For each
  // release, evaluate the release broadcast against the ACCUMULATING aired-item list
  // (state.broadcastItems plus any items aired earlier THIS tick) so a later same-tick
  // release sees earlier same-tick aired items in its window. Broadcast reads the
  // AFTER-step-4 `standing`. asExpected items and sub-threshold items do not air.
  //
  // broadcastItems is the ONLY thing broadcast changes — cash/standing/reception/
  // rngState/market are untouched by this step. It draws from no RNG stream.
  const broadcastItems: BroadcastItem[] = [...state.broadcastItems]
  for (const rec of records) {
    const item = evaluateReleaseBroadcast(
      { ...rec.broadcast, standing },
      broadcastItems,
    )
    if (item !== null) broadcastItems.push(item)
  }

  // ── Finalize ───────────────────────────────────────────────────────────────
  // market.tick increments as the LAST step (M1). The sim stream (advanced only by
  // the RECEPTION draws) is re-serialized once into the new rngState. broadcastItems
  // is the accumulated aired list (unchanged when no release aired). coverageContexts
  // stays untouched (declare-only until phase 6).
  return {
    ...state,
    rngState: rng.serialize(),
    market: { ...state.market, tick: currentTick + 1 },
    studio: {
      ...state.studio,
      cash,
      standing,
      activeProductions: stillActive,
      releasedFilms,
    },
    broadcastItems,
  }
}
