// ── §3 tick pipeline ─────────────────────────────────────────────────────────
// `tick(state): GameState` — the fixed-order simulation step of §3's
// `state = tick(applyActions(state, actions))` pair. Pure: no React/DOM/async/IO,
// no time, no unseeded entropy. Returns a NEW GameState by spreads; never mutates
// the input or any of its sub-objects in place.
//
// Pipeline, in this EXACT order (§3):
//   1. PRODUCTION  advance active productions
//   1.5 CONSTRUCTION COMPLETION — the retained V11 Annex pass (a no-op under V12,
//                  whose construction root carries no projects)
//   1.6 PLACEMENT COMPLETION — V12 placed facilities become operational (inserted,
//                  not reordered; same position as 1.5, i.e. BEFORE any capacity
//                  aggregation, so a site contributes nothing until it flips)
//   2. RELEASE     finished productions enter release
//   3. RECEPTION   resolve released films (§5)
//   4. STANDING    update the three channels (§6)
//   5. BROADCAST   phase-4 surface
//   5.5 AWARENESS DRIFT — D-17B §1 counter-flow, ENGAGED-ONLY, no RNG (inserted, not reordered;
//                  D-12 §9 permits insertions — docs/D-12-economy-contract.md:129)
//   6. DEVELOPMENT D-9.8 talent growth — GATED OFF by default (owner ruling)
//   7. PAYROLL / 7.5 OVERHEAD / 7.6 PLACED-FACILITY OPERATING COST (V12; inserted,
//                  not reordered) / 8. CONTRACT EXPIRATION
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
import {
  castingOccupiedFacilitySlots,
  completeDueCastingSessions,
} from './castingSessions.js'
import { completeDueConstruction } from './construction.js'
import {
  assertStudioPlacementInvariants,
  completeDuePlacements,
  weeklyPlacementOperatingCost,
} from './placement.js'
import { developTalent, type DevelopmentContext } from './development.js'
import { economyEngaged, weeklyPayroll } from './employment.js'
import { openTheatricalRun } from './economy.js'
import { clamp } from './math.js'
import { assertNoDoubleBookedResourceSlots } from './occupancy.js'
import { advanceManagedProductions } from './operations.js'
import { developmentOfficeEstUplift } from './facilityEffects.js'
import {
  completeDueScriptWork,
  markScriptProjectProduced,
  scriptOccupiedFacilitySlots,
  scriptProjectForProduction,
} from './scriptDevelopment.js'
import {
  buildTalentCareerEvent,
  computeStarPowerDelta,
  flattenParticipants,
  roleDiscipline,
} from './starPower.js'
import { FACILITY_OPEX_LEDGER_NOTE, TUNING } from './tuning.js'
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
  TalentCareerEvent,
  TheatricalRun,
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

  // Validate the whole placement/construction/accounting boundary before advancing
  // so a tick cannot repair malformed empty state, a missing debit, a forged clock,
  // or a mismatched completed facility. Placement Core V12 is the single authority:
  // it owns the placed-facility lifecycle, the capital and operating ledger rows,
  // and the exact operational facility set, and it delegates the retired V11
  // construction root, cash reconciliation, and shared script/casting law to the
  // construction checker under its placement policy.
  // The committed facilities observatory's placement-free counterfactual arms
  // retain their explicit configured-capacity policy (the V11 rule, one version
  // on: it keyed off `construction.projects.length === 0`); any real placement
  // history immediately selects the exact V12 facility truth.
  assertStudioPlacementInvariants(state, {
    facilityPolicy: state.placement.facilities.length === 0 ? 'configured' : 'placement-v12',
  })

  // Deserialize the sim stream ONCE. Its state is re-serialized as the final step.
  const rng = RngStream.deserialize(state.rngState)

  // ── 0.5 SCRIPT DEVELOPMENT ────────────────────────────────────────────────
  // A commission/rewrite made in week t is due at t+1 and completes during the
  // single visible advance from t to t+1. Completed work releases its shared
  // Development & Casting slot before productions allocate their next phase.
  let scriptDevelopment = completeDueScriptWork(
    state.scriptDevelopment,
    currentTick + 1,
    {
      concepts: state.concepts,
      talent: state.talent,
      // C1-M4: read from the estate STANDING NOW. Step 1.6 completes construction
      // later in this same advance, so an office finishing this week does not
      // uplift a draft finishing this week — the same "contributes nothing until
      // it flips" law capacity has followed since V11.
      estUplift: developmentOfficeEstUplift(state),
    },
  )

  // ── 0.6 CASTING SESSIONS ─────────────────────────────────────────────────
  // Due camera tests resolve after screenplay work and before production
  // allocation. Their observations use isolated derived streams and release the
  // shared slot during this same visible week.
  const castingSessions = completeDueCastingSessions(
    state.castingSessions,
    currentTick + 1,
    {
      seed: state.seed,
      concepts: state.concepts,
      talent: state.talent,
      scriptDevelopment,
    },
  )

  // ── 1. PRODUCTION ──────────────────────────────────────────────────────────
  // Advance every active production with startTick < currentTick (M1 skip-first-
  // tick: a film greenlit at t does NOT advance during tick t). Immutable: build a
  // fresh Production for advanced ones, share the untouched ones by reference.
  const productionAdvance = advanceManagedProductions(
    state.operations,
    state.studio.activeProductions,
    currentTick,
    new Set([
      ...scriptOccupiedFacilitySlots(scriptDevelopment),
      ...castingOccupiedFacilitySlots(castingSessions),
    ]),
  )
  const advanced: Production[] = productionAdvance.productions

  // ── 1.5 CONSTRUCTION COMPLETION ─────────────────────────────────────────
  // A project due on arrival at S+13 becomes physical only AFTER this advance's
  // script, casting, and production allocation. Do not retry or move any work.
  const constructionCompletion = completeDueConstruction(
    state.construction,
    productionAdvance.operations,
    currentTick + 1,
  )
  const construction = constructionCompletion.construction

  // ── 1.6 PLACEMENT COMPLETION (V12) ──────────────────────────────────────
  // INSERTION, NOT A REORDERING (D-12 §9 permits insertions —
  // docs/D-12-economy-contract.md:129): steps 1–6 keep their order and meaning.
  // This sits in EXACTLY the position the V11 Annex completion holds — after this
  // advance's script, casting, and production allocation, before RELEASE and
  // therefore before any capacity aggregation. That is the whole point: a placed
  // facility occupies land and contributes ZERO capacity until it flips here, and
  // no existing work is reallocated during the completing advance.
  const placementCompletion = completeDuePlacements(
    state.placement,
    constructionCompletion.operations,
    currentTick + 1,
  )
  const operations = placementCompletion.operations
  const placement = placementCompletion.placement

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
  // ── D-12 economy (gated) — a shallow copy of the run history so weekly progress can be
  // recorded without mutating the input. Empty (and untouched) for the M0A corpus.
  const engaged = economyEngaged(state)
  const theatricalRuns: TheatricalRun[] = state.theatricalRuns.map((r) => ({ ...r }))

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
      ...(() => {
        const project = scriptProjectForProduction(
          scriptDevelopment,
          prod.id,
        )
        return project?.assessment
          ? {
              scriptStrengthOverride: {
                actual: project.assessment.actualStrength,
                perceived: project.assessment.perceivedStrength,
              },
            }
          : {}
      })(),
    }

    // The single §5.3 critic draw for this release — the ONLY sim-stream advance. `engaged` drives
    // BOTH the §7 fame→opening-reach saturation and the D-12 P2 economy calibration (gross scale +
    // awareness marketing) — in production they are the same signal (economyEngaged).
    // D-13 conditional discoverability: one governed N(0,1) draw from the ISOLATED engaged-only
    // stream(seed,'discovery-v1',prodId) — like 'develop', it never advances state.rngState, so §15.7
    // replay stays exact and M0A (never engaged → z=0, no draw) is byte-identical. It only widens the
    // opening-reach uncertainty for low-reach-support packages; legs/critic/audience score are untouched.
    const discoverabilityZ = engaged
      ? stream(state.seed, 'discovery-v1', prod.id).gaussian(0, 1)
      : 0
    const result = resolveReception(inp, rng, engaged, engaged, discoverabilityZ)

    const baseFilmResult = buildFilmResult(result, {
      productionId: prod.id,
      releaseTick: currentTick,
      conceptId: prod.conceptId,
      directorId: prod.directorId,
    })
    // D-11.A/.C — freeze the film's own immutable participant record + the LOCKED
    // greenlight forecast onto the result (when captured at an engaged greenlight, i.e.
    // prod.participants present). Absent on M0A/legacy films → byte-identical.
    const filmResult = prod.participants
      ? {
          ...baseFilmResult,
          participants: prod.participants,
          forecast: {
            expectedCriticScore: prod.forecastSnapshot.expectedCriticScore,
            expectedTotal: prod.forecastSnapshot.expectedTotal,
            expectedOpening: prod.forecastSnapshot.expectedOpening,
          },
        }
      : baseFilmResult

    releasedFilms.push(filmResult)
    // D-12: when the economy is engaged, OPEN a multi-week theatrical run instead of the
    // single-lump credit. Its first week is paid by the WEEKLY THEATRICAL REVENUE step
    // (3.5) in this same tick — release resolution itself credits NO Studio Revenue. When
    // NOT engaged (M0A/legacy), keep the D-1 single-lump full-gross credit → byte-identical.
    if (engaged) {
      const opening = filmResult.boxOffice.opening
      const legs = opening > 0 ? filmResult.boxOffice.total / opening : 1
      theatricalRuns.push(openTheatricalRun(filmResult, opening, legs, currentTick))
    } else {
      cash += filmResult.boxOffice.total
      ledger.push({
        week: currentTick,
        kind: 'boxOffice',
        amount: filmResult.boxOffice.total,
        productionId: prod.id,
        note: 'box-office total',
      })
    }

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
      // D-17B §1 (E1): the economy regime for THIS release — the same `engaged` the reception
      // and theatrical branches above already consume (`economyEngaged(state)`, the persisted
      // R2 fact). Ephemeral like the rest of this context (B12): nothing is persisted.
      engaged,
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

  // The film result now exists and the production has left the active slate; keep
  // the screenplay's exact production link as append-only Produced history.
  if (scriptDevelopment.mode === 'managed') {
    for (const production of releasing) {
      scriptDevelopment = markScriptProjectProduced(
        scriptDevelopment,
        production.id,
      )
    }
  }

  // ── 3.5 WEEKLY THEATRICAL REVENUE (D-12; gated) ────────────────────────────
  // Credit each ACTIVE run's current week — INCLUDING any run just opened in step 3 this
  // tick, so a release is paid exactly ONCE (here, never at resolution). One studioRevenue
  // ledger entry per active run per week; the gross lives on the run (not the ledger).
  // No sim stream. Empty (and no ledger entries) when not engaged → byte-identical.
  if (engaged) {
    for (const run of theatricalRuns) {
      if (run.status !== 'active') continue
      const wg = run.weeklyGross[run.weekIndex] ?? 0
      const rev = wg * run.studioShare
      cash += rev
      run.cumulativeGrossPaid += wg
      run.cumulativeStudioRevenuePaid += rev
      run.weekIndex += 1
      if (run.weekIndex >= run.totalWeeks) run.status = 'completed'
      ledger.push({
        week: currentTick,
        kind: 'studioRevenue',
        amount: rev,
        productionId: run.productionId,
        note: `theatrical week ${run.weekIndex} studio revenue`,
      })
    }
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

  // ── 5.5 AWARENESS DRIFT (D-17B §1; engaged only) ───────────────────────────
  // The selected counter-flow: Family C, ONE-SIDED.
  //     awareness' = awareness − AWARENESS_DRIFT_RATE · max(0, awareness − AWARENESS_DRIFT_ANCHOR)
  // Pure, weekly, deterministic, NO RNG (this milestone adds none), and PULL-DOWN ONLY — it acts
  // solely on studios ABOVE the anchor, so it is structurally the opposite of rubber-banding and
  // is exactly inert at or below the anchor (it can never manufacture a death spiral). The final
  // clamp is the engine's own 0..100 standing law (standing.ts:139); with a non-negative excess
  // the subtraction cannot leave [anchor, 100], so the clamp is a guard, not a behaviour.
  //
  // PLACEMENT (measured, BINDING — contract §1): a new step 5.5, IMMEDIATELY AFTER BROADCAST and
  // BEFORE DEVELOPMENT. This is the placement the lab measured: the D-16 driver applied its
  // counter-flow shim POST-tick (`driver.ts:807-841`), i.e. after the whole pipeline and therefore
  // after BROADCAST. A step 4.5 would change what BROADCAST observes and is an UNMEASURED variant,
  // so it is not shipped. Consequently BROADCAST above still reads the post-step-4, PRE-drift
  // standing, and everything after this point reads the POST-drift stock.
  //
  // INSERTION LEGALITY: D-12 §9 permits pipeline INSERTIONS with no reordering
  // (docs/D-12-economy-contract.md:129) — steps 1-6 keep their order and their meaning.
  //
  // Engaged-gated (the same `economyEngaged` fact the rest of this tick uses), so the M0A/headless
  // corpus never runs it and stays byte-identical.
  if (engaged) {
    const excess = Math.max(0, standing.audienceAwareness - TUNING.AWARENESS_DRIFT_ANCHOR)
    if (excess > 0) {
      standing = {
        ...standing,
        audienceAwareness: clamp(
          standing.audienceAwareness - TUNING.AWARENESS_DRIFT_RATE * excess,
          0,
          100,
        ),
      }
    }
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
  const newCareerEvents: TalentCareerEvent[] = []
  if (develop && records.length > 0) {
    // Index into the current talent list for O(1) resolution as it evolves.
    const byId = new Map<string, Talent>()
    for (const t of talent) byId.set(t.id, t)

    for (const rec of records) {
      // D-14: snapshot each participant's PRE-development state for the frozen career
      // event's before→after (engaged films only; participants captured at greenlight).
      const parts = rec.filmResult.participants
      const beforeById = new Map<string, Talent>()
      if (parts !== undefined) {
        for (const p of flattenParticipants(parts)) {
          const cur = byId.get(p.talentId)
          if (cur !== undefined) beforeById.set(p.talentId, cur)
        }
      }

      // 1. DEVELOPMENT (D-9.8) — UNCHANGED. Craft grows in the performed discipline.
      for (const performer of rec.develop.performers) {
        const current = byId.get(performer.talentId)
        if (current === undefined) continue // craft with no hire etc. — nothing to develop
        const devStream = stream(state.seed, 'develop', `${rec.develop.productionId}:${performer.talentId}`)
        const developed = developTalent(current, performer.discipline, rec.develop.ctx, devStream)
        byId.set(performer.talentId, developed)
      }

      // 2. D-14 STAR POWER (fame) — engaged-only (requires frozen participants), so M0A
      //    is untouched. DETERMINISTIC (no RNG): the delta comes only from realized reach,
      //    role, audience response, forecast comparison, and current fame. Applied to the
      //    POST-development talent → affects FUTURE films only; the just-resolved film's
      //    economics (opening/legs/total, computed in step 3 from pre-tick fame) are
      //    untouched. One frozen TalentCareerEvent per participant.
      if (parts !== undefined) {
        const concept = rec.develop.ctx.concept
        for (const p of flattenParticipants(parts)) {
          const before = beforeById.get(p.talentId)
          const developed = byId.get(p.talentId)
          if (before === undefined || developed === undefined) continue
          const sp = computeStarPowerDelta({
            fameBefore: developed.fame,
            role: p.role,
            realizedTotal: rec.filmResult.boxOffice.total,
            audienceScore: rec.broadcast.weightedAudienceScore,
            expectedTotal: rec.filmResult.forecast ? rec.filmResult.forecast.expectedTotal : null,
          })
          const withFame: Talent = { ...developed, fame: clamp(developed.fame + sp.delta, 0, 100) }
          byId.set(p.talentId, withFame)
          newCareerEvents.push(
            buildTalentCareerEvent({
              talentBefore: before,
              talentAfter: withFame,
              role: p.role,
              discipline: roleDiscipline(p.role),
              filmId: rec.develop.productionId,
              filmTitle: concept.title,
              releaseWeek: rec.filmResult.releaseTick,
              genre: concept.genre,
              realizedOpening: rec.filmResult.boxOffice.opening,
              realizedTotal: rec.filmResult.boxOffice.total,
              audienceScore: rec.broadcast.weightedAudienceScore,
              criticScore: rec.filmResult.criticScore,
              sp,
            }),
          )
        }
      }
    }

    // Rebuild the array in the ORIGINAL talent order (stable serialization),
    // substituting developed objects; untouched talent shared by reference.
    talent = state.talent.map((t) => byId.get(t.id) ?? t)
  }
  const careerEvents =
    newCareerEvents.length > 0 ? [...state.careerEvents, ...newCareerEvents] : state.careerEvents

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

  // ── 7.5 STUDIO OVERHEAD (D-12; gated) ──────────────────────────────────────
  // Fixed weekly base + per contracted employee, debited once per tick when the economy is
  // engaged and the studio is founded. Absent for the headless corpus → byte-identical.
  if (engaged && state.founding === null) {
    const overhead = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length
    if (overhead > 0) {
      cash -= overhead
      ledger.push({ week: currentTick, kind: 'overhead', amount: -overhead, note: 'weekly studio overhead' })
    }
  }

  // ── 7.6 PLACED-FACILITY OPERATING COST (V12; gated) ────────────────────────
  // INSERTION, NOT A REORDERING. One aggregated row per week — the convention
  // payroll and overhead already use — charged for every facility that was
  // OPERATIONAL at the start of this advance (`state.placement`, deliberately not
  // the post-completion set): a site that becomes operational during this advance
  // was still a construction site for the week being charged, so its first
  // operating charge lands on the NEXT advance. Absent for every state with no
  // operational placement, so M0A and all pre-V12 histories stay byte-identical.
  if (engaged && state.founding === null) {
    const facilityOpex = weeklyPlacementOperatingCost(state.placement)
    if (facilityOpex > 0) {
      cash -= facilityOpex
      ledger.push({
        week: currentTick,
        kind: 'facilityOpex',
        amount: -facilityOpex,
        note: FACILITY_OPEX_LEDGER_NOTE,
      })
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
  // FAIL-CLOSED at the tick boundary (charter §3.2). Every allocator run above is
  // already cross-owner aware; this asks the union producer the one question none
  // of them can answer alone — did this advance leave any slot with two owners? It
  // must never fire on a legal state, and it is where the Sets exclusivity check
  // lands at M2 without a second walk being invented for it.
  assertNoDoubleBookedResourceSlots({
    operations,
    scriptDevelopment,
    castingSessions,
    construction,
  })

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
    theatricalRuns,
    careerEvents,
    operations,
    scriptDevelopment,
    castingSessions,
    construction,
    placement,
  }
}
