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
//   5. BROADCAST   phase-4 surface
//   6. DEVELOPMENT D-9.8 talent growth — GATED OFF by default (owner ruling)
//
// The ONLY randomness consumed FROM THE SIM STREAM (state.rngState) is in
// RECEPTION (the single §5.3 critic gaussian per release). `applyActions` and the
// §7 forecast pipeline are NOT called here.
//
// DEVELOPMENT (step 6, D-9.8) is a RUN/HARNESS GATE, not a persisted GameState
// field and not a §11 "SimulationFlags" object. It is threaded as an optional
// `options.develop` flag, default FALSE — so `tick(state)` (the M0A corpus call)
// leaves talent untouched and the validated D-6 baseline is unchanged. When ON,
// it draws ONLY from the DERIVED stream(seed,'develop',prodId+':'+talentId), which
// never advances state.rngState, so §15.7 replay stays exact either way.
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
import { developTalent, type DevelopmentContext } from './development.js'
import { weeklyPayroll } from './employment.js'
import { buildFilmResult, resolveReception, type ReceptionInputs } from './reception.js'
import { RngStream, stream } from './rng.js'
import { resolveShape } from './shape.js'
import { updateStanding, type ReleaseBenchmarks, type StandingContext } from './standing.js'
import type {
  BroadcastItem,
  CastSlot,
  Contract,
  Discipline,
  FilmResult,
  GameState,
  LedgerEntry,
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

// D-9.8 DEVELOPMENT capture: who worked on this release and in what discipline,
// plus the film facts development reads (concept/shapeEffects/promise/requiredNegative
// /criticScore). Performers in fixed order: writer→writing, director→directing,
// each cast actor→acting, each craft hire→craft (D-9.8).
type Performer = { talentId: string; discipline: Discipline }
type DevelopCapture = {
  productionId: string
  performers: Performer[]
  ctx: DevelopmentContext
}

type ReleaseRecord = {
  filmResult: FilmResult
  benchmarks: ReleaseBenchmarks
  ctx: StandingContext
  broadcast: ReleaseBroadcastCapture
  develop: DevelopCapture
}

// Run/harness options for a tick. `develop` GATES the D-9.8 DEVELOPMENT step and
// defaults to FALSE (owner ruling: development is OFF in the official M0A corpus).
// This is a parameter — like agent choice — NOT a persisted GameState field.
export type TickOptions = {
  develop?: boolean
}

export function tick(state: GameState, options?: TickOptions): GameState {
  const develop = options?.develop ?? false
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
  // D-11.18 financial ledger — every cash movement is recorded (reconciles with cash).
  const ledger: LedgerEntry[] = [...state.ledger]

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
      // RULING C: the greenlight-LOCKED shape stored on the Production (never a
      // mutable UI draft). resolveShape(prod.shape) still drives the film-level
      // ShapeEffects; the raw prod.shape drives the D-9 talent-skill reweighting.
      shape: prod.shape,
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
    // D-11.18 — record the release credit (Studio Revenue = full box office, disclosed).
    ledger.push({
      week: currentTick,
      kind: 'boxOffice',
      amount: filmResult.boxOffice.total,
      productionId: prod.id,
      note: 'box-office total',
    })

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

    // D-9.8 DEVELOPMENT capture — performers in fixed order (writer, director,
    // cast lead/antagonist/support, then craft hires in craftIds order), each in
    // the discipline they performed. The dev context is the film facts §5 produced.
    const performers: Performer[] = []
    performers.push({ talentId: prod.writerId, discipline: 'writing' })
    performers.push({ talentId: prod.directorId, discipline: 'directing' })
    for (const slot of CAST_SLOTS) performers.push({ talentId: prod.cast[slot], discipline: 'acting' })
    for (const cid of prod.craftIds) performers.push({ talentId: cid, discipline: 'craft' })

    const develop: DevelopCapture = {
      productionId: prod.id,
      performers,
      ctx: {
        concept,
        // RULING C: development weights skills through the SAME shape path as §5/§7,
        // using the LOCKED production.shape. Confined to the performed discipline.
        shape: prod.shape,
        shapeEffects: inp.shapeEffects,
        promise: prod.promise,
        requiredNegative: result.requiredNegative,
        criticScore: result.criticScore,
      },
    }

    records.push({ filmResult, benchmarks, ctx, broadcast, develop })
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

  // ── 6. DEVELOPMENT (D-9.8) — GATED OFF by default ──────────────────────────
  // Only runs when options.develop === true. Over the SAME `records` (this tick's
  // releases) in the SAME ascending-id order, each performer develops in the
  // discipline they performed, drawing ONLY from the DERIVED per-(prod,talent)
  // stream(seed,'develop',prodId+':'+talentId) — NEVER the sim stream, so rngState
  // is untouched and §15.7 replay is exact. Builds a NEW immutable talent[] (each
  // developed talent is a fresh object; talent not in any release is shared by
  // reference). When develop === false, `talent` is state.talent unchanged — the
  // validated M0A/D-6 baseline. A single talent working on two same-tick releases
  // develops once per release, in release order, over the evolving talent list.
  let talent: Talent[] = state.talent
  if (develop && records.length > 0) {
    // Index into the current talent list for O(1) resolution as it evolves.
    const byId = new Map<string, Talent>()
    for (const t of talent) byId.set(t.id, t)

    for (const rec of records) {
      for (const performer of rec.develop.performers) {
        const current = byId.get(performer.talentId)
        if (current === undefined) continue // craft with no hire etc. — nothing to develop
        const devStream = stream(state.seed, 'develop', `${rec.develop.productionId}:${performer.talentId}`)
        const developed = developTalent(current, performer.discipline, rec.develop.ctx, devStream)
        byId.set(performer.talentId, developed)
      }
    }

    // Rebuild the array in the ORIGINAL talent order (stable serialization),
    // substituting developed objects; untouched talent shared by reference.
    talent = state.talent.map((t) => byId.get(t.id) ?? t)
  }

  // ── 7. PAYROLL (D-11.5) ────────────────────────────────────────────────────
  // Weekly Σ contracted salaries, debited from cash EXACTLY ONCE per tick and
  // logged to the ledger. Applied for the week being advanced (currentTick).
  // Naturally 0 — and no ledger entry — when no contracts exist (the headless M0A
  // corpus), so M0A/D-6 stay byte-identical. Skipped during a founding draft
  // (no operations before the studio is founded).
  if (state.founding === null) {
    const payroll = weeklyPayroll(state, currentTick)
    if (payroll > 0) {
      cash -= payroll
      ledger.push({ week: currentTick, kind: 'payroll', amount: -payroll, note: 'weekly payroll' })
    }
  }

  // ── 8. CONTRACT EXPIRATION (D-11.8) ────────────────────────────────────────
  // Contracts whose term ends at or before the NEW week expire; their talent
  // become free agents (deterministic order: existing free agents, then expiring
  // contracts in state order). No cash effect. Payroll above already paid the
  // final active week (a contract active while week < endWeekExclusive).
  const newTick = currentTick + 1
  let contracts: Contract[] = state.contracts
  let freeAgents: string[] = state.freeAgents
  const expired = state.contracts.filter((c) => c.endWeekExclusive <= newTick)
  if (expired.length > 0) {
    contracts = state.contracts.filter((c) => c.endWeekExclusive > newTick)
    const fa = [...state.freeAgents]
    for (const c of expired) if (!fa.includes(c.talentId)) fa.push(c.talentId)
    freeAgents = fa
  }

  // ── Finalize ───────────────────────────────────────────────────────────────
  // market.tick increments as the LAST step (M1). The sim stream (advanced only by
  // the RECEPTION draws) is re-serialized once into the new rngState. broadcastItems
  // is the accumulated aired list (unchanged when no release aired). coverageContexts
  // stays untouched (declare-only until phase 6). `talent` is unchanged unless the
  // DEVELOPMENT gate (step 6) is on. D-11 employment fields (contracts/ledger/
  // freeAgents) thread through; founding is unchanged (ticks only run post-founding).
  return {
    ...state,
    rngState: rng.serialize(),
    market: { ...state.market, tick: currentTick + 1 },
    talent,
    studio: {
      ...state.studio,
      cash,
      standing,
      activeProductions: stillActive,
      releasedFilms,
    },
    broadcastItems,
    contracts,
    ledger,
    freeAgents,
  }
}
