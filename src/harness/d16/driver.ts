// ── D-16 · founded-studio run driver ─────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// ONE RUN =
//   generateWorld(seed)
//     → beginFounding                       (opens the draft AND rewrites concepts —
//                                            correlateConceptCost, A17 hazard H4)
//     → policy founding hires               (signing bonuses draw the $6M recruitment
//                                            fund, NOT cash — types.ts:348-349)
//     → foundStudio
//     → for each week:  policy.decide → applyActions → tick(state, { develop: true })
//
// FIDELITY RULES HONOURED (A17 §4.2 / §6):
//   • ALWAYS `tick(state, { develop: true })` — `tick(state)` defaults develop:false and
//     simulates a different game (no growth, no Star Power, no career events).
//   • One action per `applyActions` call: B3 permits at most ONE greenlight per call, and
//     isolating each action makes a rejection attributable.
//   • Concepts are read from the POST-beginFounding state, never from generateWorld.
//   • Money is read from the ledger, accumulated from INITIAL_CASH in ARRAY ORDER
//     (float-associativity caveat, A17 §3.5).
//   • No clock, no unseeded entropy anywhere near an artifact.
//
// TWO HARD STOPS (loud, never silent):
//   • RECONCILIATION — every 26 weeks and at the end, `cash === INITIAL_CASH + Σ ledger`
//     within EPS. A violation HALTS the run with a thrown error.
//     CAVEAT (B2-L13): EPS is an ABSOLUTE dollar tolerance, so a drift below 1e-6 passes.
//     At the cash scales this lab reaches (1e6 … 1e9) a *relative* tolerance would be
//     LOOSER, not tighter, so the absolute form is kept deliberately and disclosed here.
//   • ENGAGEMENT CLIFF — any week with `employmentEngaged === false` for a policy that did
//     NOT declare `disengagementIntended` is recorded as a defect flag (`engagementCliffHit`)
//     with the week it first happened. The run continues so the damage is measurable, but
//     the flag rides on every emitted row AND the corpus SPLITS on it: a cliff run is never
//     pooled into a headline distribution or a win-share column (B2-C3).
//     `engagedWeekFraction` is emitted for EVERY run, so the flag (which is n/a by
//     construction for P15/P16) is never the only engagement signal in an artifact.

import {
  RngStream,
  TUNING,
  applyActions,
  beginFounding,
  commitmentPreview,
  computeBoxOffice,
  employmentEngaged,
  forecastCenters,
  forecastProfitRange,
  generateWorld,
  predictProductionId,
  resolveReception,
  resolveShape,
  roleOVR,
  stream,
  tick,
} from '../../core/index.js'
import type { Action, CastSlot, CreativeRole, GameState, ReceptionInputs, Talent } from '../../core/index.js'
import { assertNoHiddenLeak, buildFoundingView, buildOracleView, buildPlayerView, reconciledCash } from './view.js'
import type { PlayerView } from './view.js'
import {
  bareMinimumGeneration,
  centerRevenueFor,
  evaluatePackage,
  assessPackage,
  generatePackages,
  oracleExpectedContribution,
  packageAffordable,
  packagePreview,
  shapeFor,
  STATE_PACKAGE_OPTIONS,
  standardGeneration,
} from './packages.js'
import type { D16Package, PackageOptions } from './packages.js'
import { assessFinancialState, runawayCash, summarizeEpisodes } from './states.js'
import type { EpisodeSummary, FinancialState, StateSeriesPoint } from './states.js'
import { planFoundingHires } from './policies.js'
import type { OracleCtx, PlayerCtx, Policy } from './policies.js'

const EPS = 1e-6
const RECONCILE_EVERY = 26
/** cap on the per-run rejection log so a pathological run cannot bloat the JSONL. */
const MAX_LOGGED_REJECTIONS = 25

export type WeekPoint = {
  week: number
  cash: number
  state: FinancialState
  engaged: boolean
  audienceAwareness: number
  industryPrestige: number
  commercialConfidence: number
  activeProductions: number
  activeRuns: number
  weeklyBurn: number
  releasedFilms: number
}

export type FilmRecord = {
  productionId: string
  conceptId: string
  greenlightWeek: number
  releaseWeek: number | null
  committedCost: number
  negative: number
  marketing: number
  freelancerFees: number
  /** which of the three MARKETING_BUDGET_LEVELS was chosen. */
  marketingLevel: number
  negMult: number
  shapeKey: string
  leadId: string
  leadFame: number
  leadOVR: number
  genre: string
  /** the LOCKED forecast centre the player saw (Forecast.expectedTotal). */
  forecastTotal: number
  forecastCritic: number
  /**
   * the player-visible profit centre at greenlight (forecastProfitRange), priced under the
   * state's OWN engagement mode — on the disengaged path the studio keeps 100 % of gross
   * (tick.ts:238-247), so pricing it at 0.52 would mis-state every exploit row (B2-C9).
   */
  forecastCenterProfit: number
  /** the engagement mode `forecastCenterProfit` (and the realized money below) was priced under. */
  greenlitEngaged: boolean
  realizedGross: number | null
  realizedOpening: number | null
  realizedCritic: number | null
  studioRevenue: number | null
  contribution: number | null
  /**
   * THE D-13 DISCOVERABILITY MULTIPLIER, exactly.
   * realized opening ÷ the ACTUAL-skill deterministic opening at z = 0, where the
   * denominator is `resolveReception(inp, <copy of rngState>, engaged, engaged, 0).opening`
   * on the PRE-TICK state — i.e. the identical call `tick.ts:207` makes with the draw
   * zeroed. Because `discoverability` multiplies the opening last (`reception.ts:645-647`)
   * the ratio IS the multiplier: it lives in [DISC_FLOOR, DISC_CEIL] and is EXACTLY 1
   * whenever `discoverabilitySpread === 0`.
   * B2-C2 FIX: the denominator used to be the PERCEIVED-skill forecast core, so this field
   * was `discoverability × (perceived ÷ actual quality)` — for a well-supported policy
   * essentially 100 % information gap and 0 % luck. null when the film has not released.
   */
  discoveryMultiplier: number | null
  /** the exact D-13 draw, read from the DERIVED `discovery-v1` stream. */
  discoveryZ: number | null
  /**
   * The INFORMATION GAP, separated from luck: the perceived-skill deterministic opening
   * ÷ the actual-skill deterministic opening, both at z = 0. 1.0 ⇒ the forecast core knew
   * the truth; > 1 ⇒ the player's information over-stated the package. This is the term
   * that used to contaminate `discoveryMultiplier`.
   */
  perceivedVsActualOpeningRatio: number | null
}

/** A voluntary action the ENGINE refused, with its own reason string (never swallowed). */
export type RejectionRecord = {
  week: number
  kind: Action['kind']
  reason: string
}

export type RunRecord = {
  seed: string
  policy: string
  policyKind: Policy['kind']
  horizonWeeks: number
  founded: boolean
  foundingHires: number
  /** cash the run OPENED at. INITIAL_CASH for a fresh run; the save's cash for a resume. */
  openingCash: number
  /** absolute engine tick the run opened at (0 for a fresh run, 86 for the owner save). */
  startWeek: number
  endCash: number
  endWeek: number
  /** films released BY THIS RUN — a resumed save's pre-existing history is excluded (B2-C10). */
  filmsReleased: number
  /** films already in `releasedFilms` when the run opened (0 for a fresh run). */
  filmsReleasedAtStart: number
  filmsGreenlit: number
  /** defect flag: a policy that did NOT declare `disengagementIntended` lost the engaged economy. */
  engagementCliffHit: boolean
  engagementCliffWeek: number | null
  /** cash at the moment of the cliff — the only part of a cliff run's money that is clean. */
  engagementCliffCash: number | null
  /** true when the policy is DESIGNED to disengage (P15 exploit, P16 doNothing). */
  disengagementIntended: boolean
  /** weeks with `employmentEngaged === true` ÷ horizonWeeks. Emitted for EVERY run (B2-C8). */
  engagedWeekFraction: number
  reconciliationOk: boolean
  rejectedActions: number
  /** the engine's OWN reason for each refusal, capped (B2-C5 — nothing is swallowed). */
  rejections: RejectionRecord[]
  rejectionsTruncated: boolean
  /** weeks in which a package generation reported an unstaffable role (market thinness, B2-H5). */
  unstaffableWeeks: number
  /** per-role count of the weeks above. */
  unstaffableRoleWeeks: Record<string, number>
  /** slices keyed by weeks ELAPSED (52 / 104 / 208 from the run's own start — B2-C10). */
  slices: Record<string, SliceRecord>
  episodes: EpisodeSummary
  films: FilmRecord[]
  /** downsampled weekly series (every `checkpointEvery` weeks). */
  checkpoints: WeekPoint[]
  /** full weekly series — populated only for exemplar seeds. */
  series: WeekPoint[] | null
  ledgerTotals: Record<string, number>
}

export type SliceRecord = {
  /** weeks ELAPSED since the run opened (the slice key). */
  weeksElapsed: number
  /** the ABSOLUTE engine tick this slice was taken at. */
  week: number
  cash: number
  state: FinancialState
  /** films released BY THIS RUN up to this slice. */
  filmsReleased: number
  audienceAwareness: number
  weeklyBurn: number
  engaged: boolean
}

export type RunOptions = {
  seed: string
  policy: Policy
  horizonWeeks: number
  /**
   * weeks ELAPSED at which to snapshot a slice (default 52 / 104 / 208, clipped to horizon).
   * Relative, not absolute: a run resumed at tick 86 slices at ticks 138 / 190 / 294.
   */
  sliceWeeks?: readonly number[]
  /** how often to store a checkpoint in the JSONL row (default every 4 weeks). */
  checkpointEvery?: number
  /** keep the full weekly series (exemplar seeds only — memory). */
  keepFullSeries?: boolean
  /** start from an existing state instead of generateWorld (e.g. the Week-86 save). */
  initialState?: GameState
}

/** Build the player-facing decision context. Holds `state` in a closure; never exposes it. */
function makePlayerCtx(state: GameState, cache: PkgCache): PlayerCtx {
  return {
    week: state.market.tick,
    maxConcurrent: TUNING.MAX_CONCURRENT_PRODUCTIONS,
    packages: (options?: PackageOptions) => cache.packages(state, options),
    bareMinimum: (options?: PackageOptions) => cache.bare(state, options),
    standard: (options?: PackageOptions) => cache.standard(state, options),
    evaluate: (pkg: D16Package) => cache.evaluate(state, pkg),
    assess: (pkg: D16Package) => assessPackage(state, pkg),
    affordable: (pkg: D16Package) => packageAffordable(state, pkg),
    preview: (pkg: D16Package) => packagePreview(state, pkg),
    previewAmount: (amount: number) => commitmentPreview(state, amount),
    financialState: () =>
      assessFinancialState(state, {
        bareMinimum: cache.bare(state, STATE_PACKAGE_OPTIONS),
        standard: cache.standard(state, STATE_PACKAGE_OPTIONS),
      }).state,
  }
}

/** Per-week memo so a scanning policy pays for each forecast at most once. */
class PkgCache {
  private key = ''
  private gen = new Map<string, ReturnType<typeof generatePackages>>()
  private evals = new Map<string, ReturnType<typeof evaluatePackage>>()
  private bareMemo = new Map<string, D16Package | null>()
  private stdMemo = new Map<string, D16Package | null>()
  /**
   * B2-H5: an unfieldable roster must be MEASURED, not hidden. A week counts when the studio
   * COULD have started a film (a production slot was free) but the UN-BUSY roster plus the
   * VISIBLE freelancer market could not staff a legal one. Two exclusions keep the number
   * meaningful rather than merely large:
   *   • `ignoreBusy` generations — the classifier's pure cost probes — are skipped, or "my
   *     roster is mid-shoot" would be counted as an inability to field a film;
   *   • weeks with every slot already in production are skipped, because there was no
   *     decision to block.
   */
  readonly unstaffableWeeks = new Set<number>()
  readonly unstaffableRoleWeeks = new Map<CreativeRole, Set<number>>()

  private noteUnstaffable(
    state: GameState,
    roles: readonly CreativeRole[],
    options: PackageOptions | undefined,
  ): void {
    if (roles.length === 0) return
    if (options?.ignoreBusy === true) return
    if (state.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) return
    const w = state.market.tick
    this.unstaffableWeeks.add(w)
    for (const r of roles) {
      let set = this.unstaffableRoleWeeks.get(r)
      if (set === undefined) {
        set = new Set<number>()
        this.unstaffableRoleWeeks.set(r, set)
      }
      set.add(w)
    }
  }

  private reset(state: GameState): void {
    const k = `${state.market.tick}:${state.studio.activeProductions.length}:${state.contracts.length}:${state.studio.cash}`
    if (k !== this.key) {
      this.key = k
      this.gen.clear()
      this.evals.clear()
      this.bareMemo.clear()
      this.stdMemo.clear()
    }
  }
  private static optKey(options?: PackageOptions): string {
    return options === undefined ? '' : JSON.stringify(options, Object.keys(options).sort())
  }
  packages(state: GameState, options?: PackageOptions): ReturnType<typeof generatePackages> {
    this.reset(state)
    const k = PkgCache.optKey(options)
    let v = this.gen.get(k)
    if (v === undefined) {
      v = generatePackages(state, options)
      this.gen.set(k, v)
      this.noteUnstaffable(state, v.unstaffable, options)
    }
    return v
  }
  bare(state: GameState, options?: PackageOptions): D16Package | null {
    this.reset(state)
    const k = PkgCache.optKey(options)
    let v = this.bareMemo.get(k)
    if (v === undefined) {
      const gen = bareMinimumGeneration(state, options)
      this.noteUnstaffable(state, gen.unstaffable, options)
      v = gen.packages[0] ?? null
      this.bareMemo.set(k, v)
    }
    return v
  }
  standard(state: GameState, options?: PackageOptions): D16Package | null {
    this.reset(state)
    const k = PkgCache.optKey(options)
    let v = this.stdMemo.get(k)
    if (v === undefined) {
      const gen = standardGeneration(state, options)
      this.noteUnstaffable(state, gen.unstaffable, options)
      v = gen.packages[0] ?? null
      this.stdMemo.set(k, v)
    }
    return v
  }
  evaluate(state: GameState, pkg: D16Package): ReturnType<typeof evaluatePackage> {
    this.reset(state)
    let v = this.evals.get(pkg.id)
    if (v === undefined) {
      v = evaluatePackage(state, pkg)
      this.evals.set(pkg.id, v)
    }
    return v
  }
}

function assertReconciled(state: GameState, seed: string, policy: string): void {
  const expected = reconciledCash(state)
  const actual = state.studio.cash
  if (Math.abs(expected - actual) > EPS) {
    throw new Error(
      `d16/driver: RECONCILIATION VIOLATED at week ${state.market.tick} (seed ${seed}, policy ${policy}): ` +
        `cash ${actual} !== INITIAL_CASH + Σledger ${expected} (Δ ${actual - expected}). Run HALTED.`,
    )
  }
}

function ledgerTotals(state: GameState): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of state.ledger) out[e.kind] = (out[e.kind] ?? 0) + e.amount
  const sorted: Record<string, number> = {}
  for (const k of Object.keys(out).sort()) sorted[k] = out[k]!
  return sorted
}

function weekPoint(state: GameState, view: PlayerView, fs: FinancialState): WeekPoint {
  return {
    week: state.market.tick,
    cash: state.studio.cash,
    state: fs,
    engaged: employmentEngaged(state),
    audienceAwareness: state.studio.standing.audienceAwareness,
    industryPrestige: state.studio.standing.industryPrestige,
    commercialConfidence: state.studio.standing.commercialConfidence,
    activeProductions: state.studio.activeProductions.length,
    activeRuns: view.economyView.activeRuns,
    weeklyBurn: view.economyView.weeklyBurn,
    releasedFilms: state.studio.releasedFilms.length,
  }
}

/** Found the studio according to the policy's declarative FoundingPlan. */
export function foundStudioFor(seed: string, policy: Policy, initial?: GameState): { state: GameState; hires: number } {
  let s = initial ?? beginFounding(generateWorld(seed))
  if (s.founding === null) return { state: s, hires: 0 }
  const fv = buildFoundingView(s)
  if (fv === null) return { state: s, hires: 0 }
  const hires = planFoundingHires(fv, policy.founding)
  let signed = 0
  for (const h of hires) {
    try {
      s = applyActions(s, [{ kind: 'signContract', talentId: h.talentId, termWeeks: h.termWeeks }])
      signed += 1
    } catch {
      // A rejected founding signing (fund exhausted / not in the pool) is a faithful
      // consequence of the plan, not a harness error. foundStudio below will throw
      // loudly if the minimums are genuinely unmet.
    }
  }
  s = applyActions(s, [{ kind: 'foundStudio' }])
  return { state: s, hires: signed }
}

export function runOne(opts: RunOptions): RunRecord {
  const { seed, policy, horizonWeeks } = opts
  const checkpointEvery = opts.checkpointEvery ?? 4
  const sliceWeeks = (opts.sliceWeeks ?? [52, 104, 208]).filter((w) => w <= horizonWeeks)

  const founded = foundStudioFor(seed, policy, opts.initialState)
  let state = founded.state
  const cache = new PkgCache()

  // B2-C10: a RESUMED run (e.g. the Week-86 owner save) opens mid-history. Everything the
  // record reports must be relative to THIS run, not to the save's past.
  const startWeek = state.market.tick
  const openingCash = state.studio.cash
  const filmsReleasedAtStart = state.studio.releasedFilms.length
  const runawayThreshold = runawayCash(openingCash)

  const series: WeekPoint[] = []
  const checkpoints: WeekPoint[] = []
  const stateSeries: StateSeriesPoint[] = []
  const slices: Record<string, SliceRecord> = {}
  const films = new Map<string, FilmRecord>()
  const rejections: RejectionRecord[] = []
  let rejectionsTruncated = false
  let filmsGreenlit = 0
  let rejectedActions = 0
  let engagementCliffWeek: number | null = null
  let engagementCliffCash: number | null = null
  let engagedWeeks = 0
  let reconciliationOk = true

  // B2-C3/C8: P15 (exploit) AND P16 (doNothing, `renewAtWeeksRemaining: 0`) disengage BY
  // DESIGN. Flagging them as a defect prints "cliff 0 %" against the two policies whose
  // whole point is the cliff, and flagging P16 would fire the moment its founding contracts
  // expire. The declaration lives on the policy, not on a `kind` heuristic.
  const disengagementIntended = policy.disengagementIntended

  for (let w = 0; w < horizonWeeks; w++) {
    const view = buildPlayerView(state, { seedLabel: seed })
    // L12: the information-discipline canary is WIRED, not merely available. It costs a
    // JSON round-trip of the whole view, so it runs on the run's first week only — enough
    // to catch a structural leak, cheap enough to leave on in the corpus.
    if (w === 0 && policy.kind !== 'oracle') assertNoHiddenLeak(view)
    const fs = assessFinancialState(state, {
      bareMinimum: cache.bare(state, STATE_PACKAGE_OPTIONS),
      standard: cache.standard(state, STATE_PACKAGE_OPTIONS),
    }).state
    const engaged = employmentEngaged(state)
    if (engaged) engagedWeeks += 1
    if (!engaged && !disengagementIntended && engagementCliffWeek === null) {
      engagementCliffWeek = state.market.tick
      engagementCliffCash = state.studio.cash
    }

    const pt = weekPoint(state, view, fs)
    if (opts.keepFullSeries === true) series.push(pt)
    if (w % checkpointEvery === 0) checkpoints.push(pt)
    stateSeries.push({ week: pt.week, state: fs, cash: pt.cash })

    // ── decide ──
    let actions: Action[]
    if (policy.kind === 'oracle') {
      const base = makePlayerCtx(state, cache)
      const octx: OracleCtx = {
        ...base,
        state,
        playerView: view,
        trueContribution: (pkg: D16Package) => oracleExpectedContribution(state, pkg),
      }
      actions = policy.decide(buildOracleView(state, seed), octx)
    } else {
      actions = policy.decide(view, makePlayerCtx(state, cache))
    }

    // ── act (one action per call; B3 allows at most one greenlight per call) ──
    for (const action of actions) {
      const before = state
      try {
        state = applyActions(state, [action])
      } catch (err) {
        // B2-C5: the engine's own reason is RECORDED, never swallowed. Every rejection in
        // the pre-fix smoke corpus was `renewContract rejected — Insufficient cash`, and
        // each one silently lapsed a contract — invisible because this catch dropped it.
        rejectedActions += 1
        if (rejections.length < MAX_LOGGED_REJECTIONS) {
          rejections.push({
            week: before.market.tick,
            kind: action.kind,
            reason: err instanceof Error ? err.message : String(err),
          })
        } else {
          rejectionsTruncated = true
        }
        state = before
        continue
      }
      if (action.kind === 'greenlight') {
        const prod = state.studio.activeProductions[state.studio.activeProductions.length - 1]
        if (prod !== undefined) {
          filmsGreenlit += 1
          const committedCost = before.studio.cash - state.studio.cash
          // Read the fee leg from the ledger rows the action just wrote rather than
          // subtracting floats (A17 H6): the ledger is authoritative and exact.
          let feeLeg = 0
          for (let li = before.ledger.length; li < state.ledger.length; li++) {
            const e = state.ledger[li]!
            if (e.kind === 'freelancerFee' && e.productionId === prod.id) feeLeg += -e.amount
          }
          const meta = describeGreenlight(before, action, committedCost)
          films.set(prod.id, {
            productionId: prod.id,
            conceptId: prod.conceptId,
            greenlightWeek: prod.startTick,
            releaseWeek: null,
            committedCost,
            negative: prod.budget.negative,
            marketing: prod.budget.marketing,
            freelancerFees: feeLeg,
            marketingLevel: prod.budget.marketing,
            negMult: meta.negMult,
            shapeKey: meta.shapeKey,
            leadId: prod.cast.lead,
            leadFame: meta.leadFame,
            leadOVR: meta.leadOVR,
            genre: meta.genre,
            forecastTotal: prod.forecastSnapshot.expectedTotal,
            forecastCritic: prod.forecastSnapshot.expectedCriticScore,
            forecastCenterProfit: meta.centerProfit,
            greenlitEngaged: meta.engaged,
            realizedGross: null,
            realizedOpening: null,
            realizedCritic: null,
            studioRevenue: null,
            contribution: null,
            discoveryMultiplier: null,
            discoveryZ: null,
            perceivedVsActualOpeningRatio: null,
          })
        }
      }
    }

    // ── advance ──
    const preTick = state
    const releasedBefore = state.studio.releasedFilms.length
    state = tick(state, { develop: true })
    if (state.studio.releasedFilms.length > releasedBefore) {
      for (let i = releasedBefore; i < state.studio.releasedFilms.length; i++) {
        const f = state.studio.releasedFilms[i]!
        const rec = films.get(f.productionId)
        if (rec === undefined) continue
        rec.releaseWeek = f.releaseTick
        rec.realizedGross = f.boxOffice.total
        rec.realizedOpening = f.boxOffice.opening
        rec.realizedCritic = f.criticScore
        const disc = reconstructDiscovery(preTick, f.productionId, f.boxOffice.opening)
        rec.discoveryMultiplier = disc.multiplier
        rec.discoveryZ = disc.z
        rec.perceivedVsActualOpeningRatio = disc.perceivedVsActual
      }
    }

    if ((w + 1) % RECONCILE_EVERY === 0) {
      try {
        assertReconciled(state, seed, policy.name)
      } catch (err) {
        reconciliationOk = false
        throw err
      }
    }
    // B2-C10: slice weeks are RELATIVE to the run's own start, so a run resumed at tick 86
    // still produces its 52/104/208 slices (the absolute test never fired for a resume).
    for (const sw of sliceWeeks) {
      if (state.market.tick === startWeek + sw && slices[String(sw)] === undefined) {
        const sview = buildPlayerView(state, { seedLabel: seed })
        slices[String(sw)] = {
          weeksElapsed: sw,
          week: state.market.tick,
          cash: state.studio.cash,
          state: assessFinancialState(state, {
            bareMinimum: cache.bare(state, STATE_PACKAGE_OPTIONS),
            standard: cache.standard(state, STATE_PACKAGE_OPTIONS),
          }).state,
          filmsReleased: state.studio.releasedFilms.length - filmsReleasedAtStart,
          audienceAwareness: state.studio.standing.audienceAwareness,
          weeklyBurn: sview.economyView.weeklyBurn,
          engaged: employmentEngaged(state),
        }
      }
    }
  }

  assertReconciled(state, seed, policy.name)

  // Final money attribution, from the AUTHORITATIVE run records + ledger.
  const runById = new Map(state.theatricalRuns.map((r) => [r.productionId, r]))
  for (const rec of films.values()) {
    const run = runById.get(rec.productionId)
    if (run !== undefined) {
      rec.studioRevenue = run.cumulativeStudioRevenuePaid
      rec.contribution = run.cumulativeStudioRevenuePaid - rec.committedCost
    } else if (rec.releaseWeek !== null) {
      // Disengaged path: the release credited a single 100 %-of-gross `boxOffice` lump
      // and opened NO theatrical run (tick.ts:238-247). Read the lump from the ledger.
      let lump = 0
      for (const e of state.ledger) {
        if (e.kind === 'boxOffice' && e.productionId === rec.productionId) lump += e.amount
      }
      if (lump === 0 && rec.realizedGross !== null) lump = rec.realizedGross
      rec.studioRevenue = lump
      rec.contribution = lump - rec.committedCost
    }
  }

  const filmList = [...films.values()].sort((a, b) =>
    a.greenlightWeek - b.greenlightWeek ||
    (a.productionId < b.productionId ? -1 : a.productionId > b.productionId ? 1 : 0),
  )

  const unstaffableRoleWeeks: Record<string, number> = {}
  for (const role of [...cache.unstaffableRoleWeeks.keys()].sort()) {
    unstaffableRoleWeeks[role] = cache.unstaffableRoleWeeks.get(role)!.size
  }

  return {
    seed,
    policy: policy.name,
    policyKind: policy.kind,
    horizonWeeks,
    founded: state.founding === null,
    foundingHires: founded.hires,
    openingCash,
    startWeek,
    endCash: state.studio.cash,
    endWeek: state.market.tick,
    filmsReleased: state.studio.releasedFilms.length - filmsReleasedAtStart,
    filmsReleasedAtStart,
    filmsGreenlit,
    engagementCliffHit: engagementCliffWeek !== null,
    engagementCliffWeek,
    engagementCliffCash,
    disengagementIntended,
    engagedWeekFraction: horizonWeeks === 0 ? NaN : engagedWeeks / horizonWeeks,
    reconciliationOk,
    rejectedActions,
    rejections,
    rejectionsTruncated,
    unstaffableWeeks: cache.unstaffableWeeks.size,
    unstaffableRoleWeeks,
    slices,
    // B2-M6/C10: the runaway threshold is 3× the run's OWN opening cash, evaluated at call
    // time — so an INITIAL_CASH counterfactual binds, and a resumed run is not measured
    // against a $60M bar it opened $2.8M below.
    episodes: summarizeEpisodes(stateSeries, { runawayCash: runawayThreshold }),
    films: filmList,
    checkpoints,
    series: opts.keepFullSeries === true ? series : null,
    ledgerTotals: ledgerTotals(state),
  }
}

// ── greenlight metadata (derived EXACTLY from the action, never guessed) ─────
function describeGreenlight(
  state: GameState,
  action: Action & { kind: 'greenlight' },
  committedCost: number,
): {
  negMult: number
  shapeKey: string
  genre: string
  leadFame: number
  leadOVR: number
  centerProfit: number
  engaged: boolean
} {
  const engaged = employmentEngaged(state)
  const p = action.production
  const concept = state.concepts.find((c) => c.id === p.conceptId)
  const genre = concept?.genre ?? 'unknown'
  const effects = resolveShape(p.shape)
  const requiredNegative =
    concept === undefined ? 0 : concept.baseNegativeCost * effects.budgetDemandMultiplier * state.era.costScale
  const negMult = requiredNegative > 0 ? p.budget.negative / requiredNegative : NaN

  // Label the shape by the D-16 representative it equals; 'other' when it is none of them.
  let shapeKey = 'other'
  for (const key of ['minDemand', 'neutralDemand', 'highDemand', 'bestCraft'] as const) {
    const s = shapeFor(key).shape
    if (s.opening === p.shape.opening && s.midpoint === p.shape.midpoint && s.ending === p.shape.ending) {
      shapeKey = key
      break
    }
  }

  const lead = state.talent.find((t) => t.id === p.cast.lead)
  const byId = new Map(state.talent.map((t) => [t.id, t]))
  let centerProfit = NaN
  if (concept !== undefined) {
    const cast = {} as Record<CastSlot, Talent>
    let ok = true
    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      const t = byId.get(p.cast[slot])
      if (t === undefined) { ok = false; break }
      cast[slot] = t
    }
    const writer = byId.get(p.writerId)
    const director = byId.get(p.directorId)
    const craftHires = p.craftIds.map((id) => byId.get(id)).filter((t): t is Talent => t !== undefined)
    if (ok && writer !== undefined && director !== undefined && craftHires.length === p.craftIds.length) {
      const range = forecastProfitRange(
        {
          concept,
          shape: p.shape,
          shapeEffects: effects,
          promise: p.promise,
          budget: p.budget,
          writer,
          director,
          cast,
          craftHires,
          market: state.market,
          standing: state.studio.standing,
          era: state.era,
        },
        {
          seed: state.seed,
          productionId: predictProductionId(state),
          directorId: p.directorId,
          releasedFilms: state.studio.releasedFilms,
          concepts: state.concepts,
          // committedCost − negative − marketing = the fee/salary leg the action charged.
          salaries: committedCost - p.budget.negative - p.budget.marketing,
          // B2-C9: the engagement flags come from the STATE, not a literal `true`. The
          // engine-locked `forecastTotal` column already does this (actions.ts:392 picks
          // the mode from state); only this harness-recomputed centre was wrong, by ~19×
          // on the exploit's rows.
          saturateFame: engaged,
          engaged,
        },
      )
      centerProfit = centerRevenueFor(range.studioRevenue.expected, engaged) - committedCost
    }
  }
  return {
    negMult,
    shapeKey,
    genre,
    leadFame: lead?.fame ?? NaN,
    leadOVR: lead === undefined ? NaN : roleOVR(lead, 'acting'),
    centerProfit,
    engaged,
  }
}

// ── D-13 discoverability reconstruction (B2-C2 fix) ──────────────────────────
/**
 * `reception.ts:645-647` computes the opening as
 *     openingDiscovered = opening × clamp(exp(spread · z), DISC_FLOOR, DISC_CEIL)
 * with the multiplier EXACTLY 1 when `discoverabilitySpread === 0`. So the multiplier is
 * recoverable as `realizedOpening ÷ opening(z = 0)` — PROVIDED the denominator is the same
 * deterministic core the release itself ran.
 *
 * THE DEFECT THIS REPLACES. The denominator used to be
 * `computeBoxOffice(forecastCenters(inp, true, true).centers, …)`. `forecastCenters` →
 * `computeDeterministicCore` reads PERCEIVED skills (`forecast.ts:78-118`); the release
 * reads ACTUAL skills and ACTUAL personas (`reception.ts:174-185`, `:269-277`). The emitted
 * "discoverability" was therefore `discoverability × (perceived ÷ actual)`, which leaves
 * [0.2, 1.8], disagrees in sign with z, and is never exactly 1 — for a well-supported
 * policy (where the true multiplier IS exactly 1) it was ~100 % information gap and 0 % luck.
 *
 * THE DENOMINATOR NOW. `resolveReception(inp, <copy of preTick.rngState>, engaged, engaged, 0)`
 * — the identical call `tick.ts:207` makes, with the draw zeroed and the engagement flags
 * taken from the pre-tick state exactly as `tick.ts:157` does. The rng copy never advances
 * the sim stream, and the only draw `resolveReception` makes (the §5.3 critic gaussian)
 * does not reach `opening`, so the denominator is a pure function of the pre-tick state.
 *
 * `perceivedVsActual` is the term that used to contaminate the ratio, now emitted on its
 * own so an analysis can attribute a "misled player" story to information OR to luck, and
 * never confuse the two. `discoveryZ` is the raw draw, read straight from the DERIVED
 * `discovery-v1` stream (`tick.ts:203-205`) — it never touches the sim stream.
 */
function reconstructDiscovery(
  preTick: GameState,
  productionId: string,
  realizedOpening: number,
): { multiplier: number | null; z: number; perceivedVsActual: number | null } {
  const engaged = employmentEngaged(preTick)
  // tick.ts:203-205 — the draw exists ONLY on the engaged path; disengaged releases use z = 0.
  const z = engaged ? stream(preTick.seed, 'discovery-v1', productionId).gaussian(0, 1) : 0
  const miss = { multiplier: null, z, perceivedVsActual: null }
  const prod = preTick.studio.activeProductions.find((p) => p.id === productionId)
  if (prod === undefined) return miss
  const concept = preTick.concepts.find((c) => c.id === prod.conceptId)
  if (concept === undefined) return miss
  const byId = new Map(preTick.talent.map((t) => [t.id, t]))
  const writer = byId.get(prod.writerId)
  const director = byId.get(prod.directorId)
  if (writer === undefined || director === undefined) return miss
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of ['lead', 'antagonist', 'support'] as const) {
    const t = byId.get(prod.cast[slot])
    if (t === undefined) return miss
    cast[slot] = t
  }
  const craftHires = prod.craftIds.map((id) => byId.get(id)).filter((t): t is Talent => t !== undefined)
  if (craftHires.length !== prod.craftIds.length) return miss
  const inp: ReceptionInputs = {
    concept,
    shape: prod.shape,
    shapeEffects: resolveShape(prod.shape),
    promise: prod.promise,
    budget: prod.budget,
    writer,
    director,
    cast,
    craftHires,
    market: preTick.market,
    standing: preTick.studio.standing,
    era: preTick.era,
  }
  // THE ACTUAL-skill deterministic core, z = 0 — the exact denominator.
  const actual = resolveReception(inp, RngStream.deserialize(preTick.rngState), engaged, engaged, 0)
  if (!(actual.opening > 0)) return { multiplier: null, z, perceivedVsActual: null }
  const multiplier = realizedOpening / actual.opening

  // The PERCEIVED core, for the information-gap term only. Never used as a denominator.
  const c = forecastCenters(inp, engaged, engaged)
  const perceived = computeBoxOffice(
    c.centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    c.centersOpening,
    engaged,
  )
  return { multiplier, z, perceivedVsActual: perceived.opening / actual.opening }
}
