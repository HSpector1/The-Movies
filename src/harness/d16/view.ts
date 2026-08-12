// ── D-16 · INFORMATION DISCIPLINE LAYER ──────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// A0 §4 finding: no shipped harness models the player's information set. Policies
// are either omniscient (OracleAgent scores noise-free `forecastCenters`) or blind
// (hard-coded budget constants). This module is the missing seam: ONE whitelist-only
// projection of a GameState into exactly what the shipped UI shows a player, and one
// labelled full-state passthrough for oracle policies.
//
// THE RULE. `buildPlayerView` is a WHITELIST, never a blacklist. Every field is
// copied from a named engine read-model that the UI itself calls, or from a field a
// shipped UI component renders. Nothing is spread (`...state`), so a future engine
// field cannot leak in by accident.
//
// EXPLICITLY EXCLUDED, with the reason:
//   • talent.actual (persona)         hidden temperament; `perceived` is the visible twin
//   • talent.skills[*].actual         hidden skill; roleOVR() reads the PERCEIVED vector
//   • talent.ceilings / devRate       hidden potential (D-9.10)
//   • concept.baselineStrength        THE D-13 script-potential field. Passed to the UI by
//                                     selectConcepts() but rendered NOWHERE — ui/src/components/
//                                     ConceptCard.tsx renders title, genre, baseNegativeCost and
//                                     requiredSlots only, and its own header says "Shows ONLY
//                                     contract-public, player-visible concept fields".
//   • concept.originalityRaw          rendered ONLY post-release, in the Autopsy
//                                     (ui/src/screens/Autopsy.tsx:498). Not available at the
//                                     greenlight decision, so it is not in the decision view.
//                                     (Recorded here because the D-16 brief asked for it: the
//                                     UI does show it, but only AFTER the film has released.)
//   • market.baseMarketValue          never rendered. The only UI trace is a derived post-release
//                                     sentence in the autopsy ("Reach was N% of the available
//                                     market", ui/src/engine/adapter.ts:1637) which *implies* bMV
//                                     once a film's gross is known. Excluded from the decision
//                                     view; the leak is documented, not modelled.
//   • state.rngState                  the sim stream
//   • discovery / forecast / critic draws, era.costScale internals, future anything.
//
// INCLUDED because the UI shows all three standing channels (Dashboard), the full
// finance card (economyView.financeView), every contract's terms, the locked
// forecastSnapshot of an active production, and every theatrical run's status.

import {
  TUNING,
  ROLE_TO_DISCIPLINE,
  DISCIPLINE_ORDER,
  activeContract,
  busyTalentIds,
  financeView,
  freelancerFee,
  freelancerMarketIds,
  hiringMarketIds,
  contractOffer,
  employmentEngaged,
  renewalWindowOpen,
  terminationCost,
  roleOVR,
  roleTier,
  workEthicLabel,
  runView,
  weeklySalary,
  foundingGaps,
  studioRunRecap,
} from '../../core/index.js'
import type {
  CastSlot,
  Contract,
  CreativeRole,
  CurrentPosition,
  Discipline,
  FinanceTotals,
  Forecast,
  GameState,
  Genre,
  Persona,
  RunView,
  Runway,
  Standing,
  Talent,
} from '../../core/index.js'

// ── the visible projection of one person ─────────────────────────────────────
// PERCEIVED skills only (roleOVR reads the perceived vector, talentSummary.ts:124-126),
// plus fame, age, work-ethic label, and the quoted money the UI prints next to them.
export type PerceivedTalent = {
  talentId: string
  name: string
  role: CreativeRole
  age: number
  fame: number
  workEthic: number
  workEthicLabel: string
  /** temperament AS BELIEVED (talent.perceived). The hidden `actual` twin is never copied. */
  temperamentPerceived: Persona
  /** perceived role OVR per discipline — the number the roster screen prints. */
  perceivedOVR: Record<Discipline, number>
  primaryDiscipline: Discipline
  primaryOVR: number
  primaryTier: string
  /** the per-production salary the world prints on a person (talent.salary). */
  quotedSalary: number
  /** one-film freelancer fee quote (employment.ts:219-221) — what a hire would cost. */
  quotedFreelancerFee: number
  /**
   * The deterministic contract terms the Hiring Market / Founding screen prints, one per
   * CONTRACT_TERM_OPTIONS. Empty for already-contracted talent (their live terms are in
   * `PlayerView.contracts`).
   */
  contractQuotes: { termWeeks: number; annualSalary: number; signingBonus: number }[]
  employment: 'contracted' | 'availableFreelancer' | 'hiringMarket' | 'busy' | 'unavailable'
  busy: boolean
}

export type ContractView = {
  talentId: string
  name: string
  role: CreativeRole
  annualSalary: number
  weeklySalary: number
  signingBonus: number
  startWeek: number
  endWeekExclusive: number
  termWeeks: number
  weeksRemaining: number
  renewalWindowOpen: boolean
  terminationCostNow: number
  /** renewal terms the Roster screen offers — populated ONLY while the window is open. */
  renewalQuotes: { termWeeks: number; annualSalary: number; signingBonus: number }[]
}

export type ConceptView = {
  conceptId: string
  title: string
  genre: Genre
  /** "Base production needs" — the exact number ConceptCard prints in `normal` mode. */
  baseNegativeCost: number
  requiredSlots: CastSlot[]
}

export type ActiveProductionView = {
  productionId: string
  conceptId: string
  startTick: number
  remainingTicks: number
  budget: { negative: number; marketing: number }
  writerId: string
  directorId: string
  craftIds: string[]
  cast: Record<CastSlot, string>
  /** the LOCKED forecast stamped at greenlight (Production.forecastSnapshot). */
  forecastSnapshot: Forecast
}

export type ReleasedFilmView = {
  productionId: string
  conceptId: string
  releaseTick: number
  criticScore: number
  audienceScore: number
  boxOfficeOpening: number
  boxOfficeTotal: number
  /** Studio Revenue CREDITED so far for this film, from its theatrical run. */
  studioRevenuePaid: number
  /** full-run share × gross (equals credited once the run completes). */
  studioRevenueProjected: number
  /** committed cost reconstructed from the ledger (production + freelancerFee rows). */
  committedCost: number
  contribution: number
  runStatus: RunView['status'] | 'none'
}

export type EconomyView = {
  cash: number
  weeklyPayroll: number
  weeklyOverhead: number
  weeklyBurn: number
  expectedWeeklyRunRevenue: number
  netWeeklyCash: number
  runway: Runway
  activeRuns: number
  pipelineRunRevenue: number
  totals: FinanceTotals
}

export type FoundingView = {
  budget: number
  spentBonus: number
  budgetRemaining: number
  gaps: Record<CreativeRole, number>
  applicants: PerceivedTalent[]
}

export type PlayerView = {
  readonly kind: 'player'
  seedLabel: string
  week: number
  cash: number
  /** all three channels — the Dashboard renders every one of them. */
  standing: Standing
  economyEngaged: boolean
  economyView: EconomyView
  contracts: ContractView[]
  roster: PerceivedTalent[]
  freelancerMarket: PerceivedTalent[]
  hiringMarket: PerceivedTalent[]
  concepts: ConceptView[]
  activeProductions: ActiveProductionView[]
  /** every run, active and completed — the D-15 recap shows both. */
  theatricalRuns: RunView[]
  releasedFilms: ReleasedFilmView[]
  /** D-15 Studio Run Recap "Current Position" — costly (~2 ms), so sampled, never per-week. */
  position: CurrentPosition | null
}

export type OracleView = {
  readonly kind: 'oracle'
  seedLabel: string
  week: number
  /** the FULL state, labelled. Oracle policies may read anything, including hidden fields. */
  state: GameState
}

/** Market membership sets, computed ONCE per view (each call is a full-world scan). */
type MarketSets = { freelancer: ReadonlySet<string>; hiring: ReadonlySet<string>; busy: ReadonlySet<string> }

function perceivedOf(state: GameState, t: Talent, sets: MarketSets): PerceivedTalent {
  const perceivedOVR = {} as Record<Discipline, number>
  for (const d of DISCIPLINE_ORDER) perceivedOVR[d] = roleOVR(t, d)
  const primaryDiscipline: Discipline = ROLE_TO_DISCIPLINE[t.role]
  const primaryOVR = perceivedOVR[primaryDiscipline]!
  const contracted = activeContract(state, t.id) !== undefined
  const isBusy = sets.busy.has(t.id)
  const inFreelancerMarket = sets.freelancer.has(t.id)
  const inHiringMarket = sets.hiring.has(t.id)
  const employment: PerceivedTalent['employment'] = contracted
    ? 'contracted'
    : isBusy
      ? 'busy'
      : inFreelancerMarket
        ? 'availableFreelancer'
        : inHiringMarket
          ? 'hiringMarket'
          : 'unavailable'
  return {
    talentId: t.id,
    name: t.name,
    role: t.role,
    age: t.age,
    fame: t.fame,
    workEthic: t.workEthic,
    workEthicLabel: workEthicLabel(t.workEthic),
    temperamentPerceived: { ...t.perceived },
    perceivedOVR,
    primaryDiscipline,
    primaryOVR,
    primaryTier: roleTier(primaryOVR),
    quotedSalary: t.salary,
    quotedFreelancerFee: freelancerFee(t),
    contractQuotes: contracted
      ? []
      : TUNING.CONTRACT_TERM_OPTIONS.map((term) => {
          const o = contractOffer(state, t.id, term, state.market.tick)
          return { termWeeks: o.termWeeks, annualSalary: o.annualSalary, signingBonus: o.signingBonus }
        }),
    employment,
    busy: isBusy,
  }
}

function contractViewOf(state: GameState, c: Contract, name: string, role: CreativeRole): ContractView {
  const week = state.market.tick
  const windowOpen = renewalWindowOpen(c, week)
  return {
    renewalQuotes: windowOpen
      ? TUNING.CONTRACT_TERM_OPTIONS.map((term) => {
          const o = contractOffer(state, c.talentId, term, week)
          return { termWeeks: o.termWeeks, annualSalary: o.annualSalary, signingBonus: o.signingBonus }
        })
      : [],
    talentId: c.talentId,
    name,
    role,
    annualSalary: c.annualSalary,
    weeklySalary: weeklySalary(c.annualSalary),
    signingBonus: c.signingBonus,
    startWeek: c.startWeek,
    endWeekExclusive: c.endWeekExclusive,
    termWeeks: c.termWeeks,
    weeksRemaining: Math.max(0, c.endWeekExclusive - week),
    renewalWindowOpen: windowOpen,
    terminationCostNow: terminationCost(c, week),
  }
}

/**
 * Committed cost per production, from the AUTHORITATIVE ledger rows, in ONE pass.
 * (A2 §7.7: six copies of this filter exist in the tree; this reads the ledger, never a
 * parallel formula.) One pass matters — the ledger grows unbounded and this view is built
 * every simulated week.
 */
function committedCostByProduction(state: GameState): Map<string, number> {
  const out = new Map<string, number>()
  for (const e of state.ledger) {
    if (e.productionId === undefined) continue
    if (e.kind !== 'production' && e.kind !== 'freelancerFee') continue
    out.set(e.productionId, (out.get(e.productionId) ?? 0) + -e.amount)
  }
  return out
}

function audienceScoreOf(segmentScores: Record<string, number>, state: GameState): number {
  let acc = 0
  for (const seg of state.market.segments) acc += seg.share * (segmentScores[seg.id] ?? 0)
  return acc
}

export type PlayerViewOptions = {
  /** include the D-15 recap Current Position (≈2 ms). Sample it; never call per-week. */
  includePosition?: boolean
  seedLabel?: string
}

/**
 * WHITELIST-ONLY projection of what a real player can see at a decision point.
 * Pure: reads state, mutates nothing, advances no RNG.
 */
export function buildPlayerView(state: GameState, opts: PlayerViewOptions = {}): PlayerView {
  const fv = financeView(state)
  const talentById = new Map(state.talent.map((t) => [t.id, t]))
  const freelancerIds = freelancerMarketIds(state)
  const hiringIds = hiringMarketIds(state)
  const sets: MarketSets = {
    busy: busyTalentIds(state),
    freelancer: new Set(freelancerIds),
    hiring: new Set(hiringIds),
  }

  const roster: PerceivedTalent[] = []
  for (const c of state.contracts) {
    const t = talentById.get(c.talentId)
    if (t !== undefined) roster.push(perceivedOf(state, t, sets))
  }

  const freelancerMarket: PerceivedTalent[] = []
  for (const id of freelancerIds) {
    const t = talentById.get(id)
    if (t !== undefined) freelancerMarket.push(perceivedOf(state, t, sets))
  }

  const hiringMarket: PerceivedTalent[] = []
  for (const id of hiringIds) {
    const t = talentById.get(id)
    if (t !== undefined) hiringMarket.push(perceivedOf(state, t, sets))
  }

  const contracts: ContractView[] = state.contracts.map((c) => {
    const t = talentById.get(c.talentId)
    return contractViewOf(state, c, t?.name ?? c.talentId, t?.role ?? 'actor')
  })

  const concepts: ConceptView[] = state.concepts.map((c) => ({
    conceptId: c.id,
    title: c.title,
    genre: c.genre,
    baseNegativeCost: c.baseNegativeCost,
    requiredSlots: [...c.requiredSlots],
  }))

  const activeProductions: ActiveProductionView[] = state.studio.activeProductions.map((p) => ({
    productionId: p.id,
    conceptId: p.conceptId,
    startTick: p.startTick,
    remainingTicks: p.remainingTicks,
    budget: { negative: p.budget.negative, marketing: p.budget.marketing },
    writerId: p.writerId,
    directorId: p.directorId,
    craftIds: [...p.craftIds],
    cast: { ...p.cast },
    forecastSnapshot: p.forecastSnapshot,
  }))

  const runByProduction = new Map(state.theatricalRuns.map((r) => [r.productionId, r]))
  const costByProduction = committedCostByProduction(state)
  const releasedFilms: ReleasedFilmView[] = state.studio.releasedFilms.map((f) => {
    const run = runByProduction.get(f.productionId)
    const rv = run ? runView(run) : null
    const committedCost = costByProduction.get(f.productionId) ?? 0
    const paid = rv?.studioRevenuePaid ?? 0
    return {
      productionId: f.productionId,
      conceptId: f.conceptId,
      releaseTick: f.releaseTick,
      criticScore: f.criticScore,
      audienceScore: audienceScoreOf(f.segmentScores, state),
      boxOfficeOpening: f.boxOffice.opening,
      boxOfficeTotal: f.boxOffice.total,
      studioRevenuePaid: paid,
      studioRevenueProjected: rv?.totalStudioRevenue ?? 0,
      committedCost,
      contribution: paid - committedCost,
      runStatus: rv?.status ?? 'none',
    }
  })

  return {
    kind: 'player',
    seedLabel: opts.seedLabel ?? state.seed,
    week: state.market.tick,
    cash: state.studio.cash,
    standing: { ...state.studio.standing },
    economyEngaged: employmentEngaged(state),
    economyView: {
      cash: fv.cash,
      weeklyPayroll: fv.weeklyPayroll,
      weeklyOverhead: fv.weeklyOverhead,
      weeklyBurn: fv.weeklyBurn,
      expectedWeeklyRunRevenue: fv.expectedWeeklyRunRevenue,
      netWeeklyCash: fv.netWeeklyCash,
      runway: fv.runway,
      activeRuns: fv.activeRuns,
      pipelineRunRevenue: fv.pipelineRunRevenue,
      totals: fv.totals,
    },
    contracts,
    roster,
    freelancerMarket,
    hiringMarket,
    concepts,
    activeProductions,
    theatricalRuns: state.theatricalRuns.map(runView),
    releasedFilms,
    position: opts.includePosition === true ? studioRunRecap(state).position : null,
  }
}

/** The founding-draft slice of the player view (only meaningful while `state.founding !== null`). */
export function buildFoundingView(state: GameState): FoundingView | null {
  if (state.founding === null) return null
  const byId = new Map(state.talent.map((t) => [t.id, t]))
  const sets: MarketSets = {
    busy: busyTalentIds(state),
    freelancer: new Set(freelancerMarketIds(state)),
    hiring: new Set(hiringMarketIds(state)),
  }
  const applicants: PerceivedTalent[] = []
  for (const id of state.founding.applicantIds) {
    const t = byId.get(id)
    if (t !== undefined) applicants.push(perceivedOf(state, t, sets))
  }
  return {
    budget: state.founding.budget,
    spentBonus: state.founding.spentBonus,
    budgetRemaining: state.founding.budget - state.founding.spentBonus,
    gaps: foundingGaps(state),
    applicants,
  }
}

/** Full-state passthrough, LABELLED so an artifact can never confuse the two views. */
export function buildOracleView(state: GameState, seedLabel?: string): OracleView {
  return { kind: 'oracle', seedLabel: seedLabel ?? state.seed, week: state.market.tick, state }
}

// ── the structural guarantee (also asserted at runtime by view.test.ts) ───────
/** Key names that must never appear anywhere inside a serialized PlayerView. */
export const FORBIDDEN_PLAYER_VIEW_KEYS: readonly string[] = ['actual', 'scriptPotential', 'rngState']

/** Recursively collect every object key present in a value. Arrays contribute no keys. */
export function collectKeys(value: unknown, into: Set<string> = new Set()): Set<string> {
  if (value === null || typeof value !== 'object') return into
  if (Array.isArray(value)) {
    for (const v of value) collectKeys(v, into)
    return into
  }
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    into.add(k)
    collectKeys(v, into)
  }
  return into
}

/**
 * Throws loudly if a PlayerView carries a forbidden key.
 * WIRED, not merely available (B2-L12): `driver.ts` calls this on the first week of every
 * non-oracle run, so the information-discipline guarantee is checked by the corpus itself
 * and not only by `isolation.test.ts`. It costs a JSON round-trip of the whole view, which
 * is why it runs once per run rather than once per week.
 */
export function assertNoHiddenLeak(view: PlayerView): void {
  const keys = collectKeys(JSON.parse(JSON.stringify(view)) as unknown)
  const found = FORBIDDEN_PLAYER_VIEW_KEYS.filter((k) => keys.has(k))
  if (found.length > 0) {
    throw new Error(`d16/view: PlayerView leaked hidden field(s): ${found.join(', ')}`)
  }
}

/** Ledger-order reconciliation (A17 §3.5 float-associativity caveat: accumulate in ARRAY ORDER). */
export function reconciledCash(state: GameState): number {
  let acc: number = TUNING.INITIAL_CASH
  for (const e of state.ledger) acc += e.amount
  return acc
}
