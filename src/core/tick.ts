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

import { buildFilmResult, resolveReception, type ReceptionInputs } from './reception.js'
import { RngStream } from './rng.js'
import { resolveShape } from './shape.js'
import { updateStanding, type ReleaseBenchmarks, type StandingContext } from './standing.js'
import type {
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

// The per-release pieces STANDING (§6) needs, captured during RECEPTION so the
// Production (removed from activeProductions at RELEASE) need not be revisited.
type ReleaseRecord = {
  filmResult: FilmResult
  benchmarks: ReleaseBenchmarks
  ctx: StandingContext
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

    // B12 context: the three cast fames + actual/required negative. requiredNegative
    // is the §5.1 value the reception result already computed.
    const ctx: StandingContext = {
      castFames: {
        lead: cast.lead.fame,
        antagonist: cast.antagonist.fame,
        support: cast.support.fame,
      },
      actualNegative: prod.budget.negative,
      requiredNegative: result.requiredNegative,
    }

    records.push({ filmResult, benchmarks, ctx })
  }

  // ── 4. STANDING ────────────────────────────────────────────────────────────
  // Accumulate the three channels sequentially, IN ascending-id order (records is
  // already in release order). Start from start-of-tick standing.
  let standing: Standing = startOfTickStanding
  for (const rec of records) {
    standing = updateStanding(standing, rec.filmResult, rec.benchmarks, rec.ctx)
  }

  // ── 5. BROADCAST ───────────────────────────────────────────────────────────
  // phase-4 surface (§8 broadcast content deferred; see build order §12 step 4)

  // ── Finalize ───────────────────────────────────────────────────────────────
  // market.tick increments as the LAST step (M1). The sim stream (advanced only by
  // the RECEPTION draws) is re-serialized once into the new rngState.
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
  }
}
