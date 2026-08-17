// ── D-16 · roster-scoped candidate package generator ─────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// WHY NOT `candidates.ts` (A0 §3.3 G2). The shipped generator is unusable in a
// FOUNDED studio: it iterates `state.talent` (the whole generated world, not the
// roster), hard-codes `craftIds: []` (D-4) while an engaged greenlight requires
// EXACTLY ONE craft lead (actions.ts:404-408), and draws 500 packages by rejection
// sampling from the `candidates` stream. This module is roster-scoped, craft-aware,
// deterministic-by-enumeration (no stream draws at all), and bounded.
//
// LESSON AC — THE AUTHORITATIVE COST. `committedCost` here is computed by the SAME
// rule the action charges (actions.ts:399 + :417-440):
//     committedCost = budget.negative + budget.marketing
//                   + Σ freelancerFee(t) over ASSIGNED talent that is NOT contracted
// and legality is gated by `canAfford(state, committedCost)` — the identical function
// the engine enforces. `commitmentPreview(state, pkg.committedCost).affordable` is
// therefore bit-identical to the greenlight's own accept/reject. Parity is locked by
// packages.test.ts (build → preview → real applyActions on a clone → compare the exact
// cash deduction).
//
// DETERMINISM. Enumeration order is fixed: concept → shape → promise → castPlan →
// negative level → marketing level. No stream, no clock, no unseeded entropy.

import {
  MARKETING_BUDGET_LEVELS,
  NEGATIVE_BUDGET_MULTIPLIERS,
  PROMISE_WIDTHS,
  RngStream,
  TUNING,
  busyTalentIds,
  canAfford,
  commitmentPreview,
  computeBoxOffice,
  computeForecast,
  economyEngaged,
  employmentEngaged,
  forecastCenters,
  forecastProfitRange,
  freelancerFee,
  freelancerMarketIds,
  greenlightAssessment,
  isContracted,
  marketingLevelsFor,
  predictProductionId,
  rangeFrom,
  resolveReception,
  resolveShape,
  ROLE_TO_DISCIPLINE,
  roleOVR,
} from '../../core/index.js'
import type {
  Action,
  Budget,
  CastSlot,
  CommitmentPreview,
  CreativeRole,
  FilmConcept,
  FilmShape,
  ForecastProfitRange,
  GameState,
  GreenlightAssessment,
  Promise as FilmPromise,
  ReceptionInputs,
  SegmentId,
  ShapeEffects,
  Talent,
} from '../../core/index.js'

const CAST_SLOTS: readonly CastSlot[] = ['lead', 'antagonist', 'support'] as const
const OPENINGS: readonly FilmShape['opening'][] = ['immediateAction', 'slowSetup', 'mysteryHook'] as const
const MIDPOINTS: readonly FilmShape['midpoint'][] = ['reversal', 'escalation', 'revelation'] as const
const ENDINGS: readonly FilmShape['ending'][] = ['triumph', 'bittersweet', 'tragic', 'ambiguous'] as const

export type ShapeKey = 'minDemand' | 'neutralDemand' | 'highDemand' | 'bestCraft'
export type CastPlanKey = 'bestOVR' | 'highestFame' | 'cheapest' | 'youngest'

export type D16Package = {
  /** stable, deterministic, human-readable key. Identical inputs ⇒ identical id. */
  id: string
  conceptId: string
  conceptTitle: string
  shapeKey: ShapeKey
  shape: FilmShape
  promiseWidth: number
  promise: FilmPromise
  castPlan: CastPlanKey
  writerId: string
  directorId: string
  craftIds: string[]
  cast: Record<CastSlot, string>
  negIndex: number
  negMult: number
  marketing: number
  budget: Budget
  requiredNegative: number
  /** assigned ids that are NOT contracted — each charged a one-film fee at greenlight. */
  freelancerIds: string[]
  freelancerFees: number
  /** AUTHORITATIVE immediate cash the greenlight action charges. Lesson AC. */
  committedCost: number
}

export type PackageOptions = {
  /** how many concepts to span, chosen at evenly spaced baseNegativeCost ranks (min 1). */
  conceptCount?: number
  shapeKeys?: readonly ShapeKey[]
  promiseWidths?: readonly number[]
  castPlans?: readonly CastPlanKey[]
  negIndices?: readonly number[]
  marketingLevels?: readonly number[]
  /** allow filling unstaffed roles from the visible freelancer market at quoted fees. */
  allowFreelancers?: boolean
  /** ignore the contracted roster entirely and staff every role from the freelancer market. */
  freelancersOnly?: boolean
  /**
   * Ignore production-exclusivity (talent already engaged in an active production).
   * Used ONLY by the financial-state classifier: "what would a film cost?" is a MONEY
   * question, and a transiently busy roster must not be reported as financial distress.
   * `studioRunRecap`'s own `cheapestPackage`/`standardPackage` do the same (they read
   * `state.contracts`, never `busyTalentIds`). A package built with this flag is NOT
   * guaranteed greenlightable — never commit one.
   */
  ignoreBusy?: boolean
  /** hard cap; enumeration stops once reached (documented truncation, never silent). */
  maxPackages?: number
}

// ── D-17B · the MARKETING GRID override (A4 §5) ──────────────────────────────
// `MARKETING_BUDGET_LEVELS` (grid.ts:9) is NOT validated by the greenlight action
// (`actions.ts:380-451` reads `p.budget.marketing` as a free number), so the lab can sweep
// arbitrary triples without touching a production file. THE TRAP A4 §5 measured: this module
// used to snapshot the array at MODULE LOAD in three places (`DEFAULT_PACKAGE_OPTIONS`,
// `BARE_MINIMUM_DEFAULTS`, `STANDARD_DEFAULTS`), so mutating `grid.ts` in-process would have
// been a silent no-op sweep. The fix is an explicit ACTIVE grid resolved at GENERATION time.
//
// NEUTRAL-ARM RULE: `ACTIVE_GRID` starts as the shipped triple, so with no `withMarketingGrid`
// scope open every package id, cost and enumeration order is byte-identical to D-17A.
export type MarketingGrid = readonly [number, number, number]

const SHIPPED_GRID: MarketingGrid = [
  MARKETING_BUDGET_LEVELS[0]!,
  MARKETING_BUDGET_LEVELS[1]!,
  MARKETING_BUDGET_LEVELS[2]!,
]
let ACTIVE_GRID: MarketingGrid = SHIPPED_GRID
let PRODUCTION_MARKETING_MENU = false

/** Production alignment follows the persisted economy regime; historical lab mode preserves
 * its pre-D-17B employment predicate so frozen artifacts remain interpretable. */
function packageRegimeEngaged(state: GameState): boolean {
  return PRODUCTION_MARKETING_MENU ? economyEngaged(state) : employmentEngaged(state)
}

/** The triple `grid.ts` ships — the value the neutral arm must always resolve to. */
export function shippedMarketingGrid(): MarketingGrid {
  return SHIPPED_GRID
}

/** The triple package generation resolves RIGHT NOW. Read at call time, never snapshotted. */
export function activeMarketingGrid(): MarketingGrid {
  return ACTIVE_GRID
}

/** True only while a production-alignment run resolves each package through core D-17B. */
export function productionMarketingMenuActive(): boolean {
  return PRODUCTION_MARKETING_MENU
}

/** Reject a menu that could not be a menu: 3 finite, strictly ascending, non-negative rungs. */
export function validateMarketingGrid(g: MarketingGrid): void {
  if (g.length !== 3) throw new Error(`d16/packages: a marketing grid needs exactly 3 rungs, got ${g.length}`)
  for (const v of g) {
    if (!Number.isFinite(v) || v < 0) {
      throw new Error(`d16/packages: marketing grid rung ${String(v)} is not a finite non-negative number`)
    }
  }
  if (!(g[0] < g[1] && g[1] < g[2])) {
    throw new Error(`d16/packages: marketing grid rungs must be strictly ascending, got [${g.join(',')}]`)
  }
}

/** Stable, sorted-free artifact stamp for a grid: '200000,700000,2000000'. */
export function marketingGridKey(g: MarketingGrid): string {
  return g.join(',')
}

/**
 * Run `fn` with `g` as the active marketing menu, then restore — the `withTuningOverrides`
 * idiom. SINGLE PROCESS ONLY (module-global, exactly like the TUNING scope).
 */
export function withMarketingGrid<T>(g: MarketingGrid, fn: () => T): T {
  validateMarketingGrid(g)
  const saved = ACTIVE_GRID
  ACTIVE_GRID = g
  try {
    return fn()
  } finally {
    ACTIVE_GRID = saved
  }
}

/**
 * Run package generation through the production D-17B menu. The harness still owns its
 * roster-scoped package enumeration, but each named rung is resolved by the core's
 * `marketingLevelsFor(state, packageInputs)` for that exact package. Production imports
 * nothing from the harness; dependency direction remains one-way.
 */
export function withProductionMarketingMenu<T>(fn: () => T): T {
  const saved = PRODUCTION_MARKETING_MENU
  PRODUCTION_MARKETING_MENU = true
  try {
    return fn()
  } finally {
    PRODUCTION_MARKETING_MENU = saved
  }
}

/** Restoration canary, mirroring `assertTuningPristine`. */
export function assertMarketingGridPristine(label = ''): void {
  if (ACTIVE_GRID !== SHIPPED_GRID) {
    throw new Error(
      `d16/packages: the marketing grid was not restored${label ? ` (${label})` : ''}: active [${ACTIVE_GRID.join(',')}] !== shipped [${SHIPPED_GRID.join(',')}]`,
    )
  }
  if (PRODUCTION_MARKETING_MENU) {
    throw new Error(
      `d16/packages: the production marketing-menu scope was not restored${label ? ` (${label})` : ''}`,
    )
  }
}

/**
 * The default decision profile: 3 concepts × 3 shapes × 1 promise × 2 casts × 3 neg × 3 mkt = 162.
 * `marketingLevels` here is the SHIPPED grid snapshot, kept for shape stability; every
 * generation path below re-resolves it from `activeMarketingGrid()` at CALL time (A4 §5).
 */
export const DEFAULT_PACKAGE_OPTIONS: Required<PackageOptions> = {
  conceptCount: 3,
  shapeKeys: ['minDemand', 'neutralDemand', 'highDemand'],
  promiseWidths: [0.8],
  castPlans: ['bestOVR', 'highestFame'],
  negIndices: [0, 1, 2],
  marketingLevels: [...MARKETING_BUDGET_LEVELS],
  allowFreelancers: true,
  freelancersOnly: false,
  ignoreBusy: false,
  maxPackages: 200,
}

/** Options the financial-state classifier uses: cost question only, exclusivity ignored. */
export const STATE_PACKAGE_OPTIONS: PackageOptions = { ignoreBusy: true }

// ── shape catalogue (36 legal shapes, resolved once per process) ──────────────
type ShapeEntry = { shape: FilmShape; effects: ShapeEffects; order: number }
let SHAPE_CATALOGUE: ShapeEntry[] | null = null
function shapeCatalogue(): ShapeEntry[] {
  if (SHAPE_CATALOGUE !== null) return SHAPE_CATALOGUE
  const out: ShapeEntry[] = []
  let order = 0
  for (const opening of OPENINGS) {
    for (const midpoint of MIDPOINTS) {
      for (const ending of ENDINGS) {
        const shape: FilmShape = { opening, midpoint, ending }
        out.push({ shape, effects: resolveShape(shape), order: order++ })
      }
    }
  }
  SHAPE_CATALOGUE = out
  return out
}

/** Representative shapes. Ties broken by catalogue order, so the pick is deterministic. */
export function shapeFor(key: ShapeKey): { shape: FilmShape; effects: ShapeEffects } {
  const cat = shapeCatalogue()
  let best = cat[0]!
  for (const e of cat) {
    const better =
      key === 'minDemand'
        ? e.effects.budgetDemandMultiplier < best.effects.budgetDemandMultiplier
        : key === 'highDemand'
          ? e.effects.budgetDemandMultiplier > best.effects.budgetDemandMultiplier
          : key === 'bestCraft'
            ? e.effects.craftMod > best.effects.craftMod
            : Math.abs(e.effects.budgetDemandMultiplier - 1) < Math.abs(best.effects.budgetDemandMultiplier - 1)
    if (better) best = e
  }
  return { shape: best.shape, effects: best.effects }
}

/** The minimum budgetDemandMultiplier over all 36 shapes — the bare-minimum package's demand. */
export function minBudgetDemandMultiplier(): number {
  return shapeFor('minDemand').effects.budgetDemandMultiplier
}

// ── promise construction (reuses the §13 grid helper) ─────────────────────────
// A3 §8.2: the specificity BONUS is economically negligible (≤ +0.9 % of baseAwareness)
// while the mismatch PENALTY is worth up to 18 appeal points, so the rational play is the
// widest promise that still clears the D-3 `promiseIsSpecific ≥ 0.5` predicate — width 0.8.
// Widths come from PROMISE_WIDTHS (grid.ts:10); the centre is the neutral 0, i.e. the
// midpoint of the two innermost PROMISE_CENTERS (−0.25, +0.25). Ranges via `rangeFrom`.
function promiseFor(concept: FilmConcept, width: number, intended: SegmentId): FilmPromise {
  const r = rangeFrom(0, width)
  return {
    genre: concept.genre,
    intendedSegments: [intended],
    ranges: { intimacy: r, tonalWeight: r, kineticEnergy: r },
  }
}

// ── talent pools ──────────────────────────────────────────────────────────────
type Pools = Record<CreativeRole, { contracted: Talent[]; freelance: Talent[] }>

function buildPools(state: GameState, opts: Required<PackageOptions>, engaged: boolean): Pools {
  const busy = busyTalentIds(state)
  const market = new Set(freelancerMarketIds(state))
  const empty = (): { contracted: Talent[]; freelance: Talent[] } => ({ contracted: [], freelance: [] })
  const pools: Pools = { actor: empty(), director: empty(), writer: empty(), craft: empty() }
  for (const t of state.talent) {
    if (!opts.ignoreBusy && busy.has(t.id)) continue
    const bucket = pools[t.role]
    if (bucket === undefined) continue
    if (!engaged) {
      // DISENGAGED (A2 §7.2): D-11.12 is not enforced — ANY talent in the world is
      // assignable and each assignee is charged `talent.salary` (actions.ts:449-462).
      // Only the exploit policy ever runs here; it is labelled as such everywhere.
      bucket.freelance.push(t)
      continue
    }
    if (isContracted(state, t.id)) {
      if (!opts.freelancersOnly) bucket.contracted.push(t)
    } else if (market.has(t.id) && (opts.allowFreelancers || opts.freelancersOnly)) {
      bucket.freelance.push(t)
    }
  }
  return pools
}

function ovrOf(t: Talent, role: CreativeRole): number {
  return roleOVR(t, ROLE_TO_DISCIPLINE[role])
}

/**
 * Order a role's available talent for a cast plan. Contracted talent always sorts
 * before freelancers of equal merit: it costs $0 at greenlight (payroll covers it,
 * actions.ts:415-421), so preferring it is not a heuristic, it is the cost rule.
 * Every comparator ends with an id tie-break so the ordering is total and stable.
 */
function orderFor(pools: Pools, role: CreativeRole, plan: CastPlanKey): Talent[] {
  // N5: plain `<`/`>` id tie-breaks — never localeCompare.
  const byId = (a: Talent, b: Talent): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  const cmp: Record<CastPlanKey, (a: Talent, b: Talent) => number> = {
    bestOVR: (a, b) => ovrOf(b, role) - ovrOf(a, role) || b.fame - a.fame || byId(a, b),
    highestFame: (a, b) => b.fame - a.fame || ovrOf(b, role) - ovrOf(a, role) || byId(a, b),
    cheapest: (a, b) => a.salary - b.salary || ovrOf(b, role) - ovrOf(a, role) || byId(a, b),
    youngest: (a, b) => a.age - b.age || ovrOf(b, role) - ovrOf(a, role) || byId(a, b),
  }
  const bucket = pools[role]
  const contracted = [...bucket.contracted].sort(cmp[plan])
  const freelance = [...bucket.freelance].sort(cmp[plan])
  return [...contracted, ...freelance]
}

type CastAssignment = {
  writer: Talent
  director: Talent
  craft: Talent
  cast: Record<CastSlot, Talent>
}

function assignCast(pools: Pools, plan: CastPlanKey): CastAssignment | null {
  const used = new Set<string>()
  const take = (role: CreativeRole): Talent | null => {
    for (const t of orderFor(pools, role, plan)) if (!used.has(t.id)) { used.add(t.id); return t }
    return null
  }
  const writer = take('writer')
  if (writer === null) return null
  const director = take('director')
  if (director === null) return null
  const craft = take('craft')
  if (craft === null) return null
  const lead = take('actor')
  if (lead === null) return null
  // Antagonist / support are never chosen by fame — fame's commercial channel is the
  // weighted starDraw where the LEAD carries weight 1.0 (CAST_WEIGHT); spending fame on
  // the 0.35-weight support slot is dominated. Secondary slots always take best OVR.
  const secondaryPlan: CastPlanKey = plan === 'highestFame' ? 'bestOVR' : plan
  const takeSecondary = (): Talent | null => {
    for (const t of orderFor(pools, 'actor', secondaryPlan)) if (!used.has(t.id)) { used.add(t.id); return t }
    return null
  }
  const antagonist = takeSecondary()
  if (antagonist === null) return null
  const support = takeSecondary()
  if (support === null) return null
  return { writer, director, craft, cast: { lead, antagonist, support } }
}

// ── concept selection ────────────────────────────────────────────────────────
/** Concepts at evenly spaced baseNegativeCost ranks (always including the cheapest). */
function representativeConcepts(state: GameState, count: number): FilmConcept[] {
  const sorted = [...state.concepts].sort(
    (a, b) => a.baseNegativeCost - b.baseNegativeCost || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  )
  if (sorted.length === 0) return []
  const n = Math.max(1, Math.min(count, sorted.length))
  if (n === 1) return [sorted[0]!]
  const out: FilmConcept[] = []
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i * (sorted.length - 1)) / (n - 1))
    const c = sorted[idx]!
    if (!out.some((o) => o.id === c.id)) out.push(c)
  }
  return out
}

// ── intendedSegments (B21) ───────────────────────────────────────────────────
// candidates.ts:284-312 sets intendedSegments = [argmax_s expectedSegmentAppeal].
// segmentAppeal_s = 0.35·craft + 0.25·starDraw + 0.25·segmentFit_s + 0.15·timeliness
//                   + segmentAffinity_s − mismatchPenalty + potentialDelta
// (reception.ts:469-479). Only `segmentFit_s` and `segmentAffinity_s` vary BY SEGMENT;
// every other term is common to all four. The argmax is therefore invariant to budget
// and to talent (up to the 0..100 clamp), so we compute it ONCE per
// (concept, shape, promiseWidth) with a reference package and memoize. That is a
// documented, bounded deviation from re-deriving it per package — it saves ~9× the
// forecastCenters calls per decision and cannot change the chosen segment except at a
// clamp boundary.
function argmaxSegment(state: GameState, centers: Readonly<Record<SegmentId, number>>): SegmentId {
  let best: SegmentId = state.market.segments[0]!.id
  let bestVal = centers[best]
  for (const seg of state.market.segments) {
    const v = centers[seg.id]
    if (v > bestVal) {
      best = seg.id
      bestVal = v
    }
  }
  return best
}

export function receptionInputsFor(state: GameState, pkg: D16Package): ReceptionInputs {
  const byId = new Map(state.talent.map((t) => [t.id, t]))
  const concept = state.concepts.find((c) => c.id === pkg.conceptId)
  if (concept === undefined) throw new Error(`d16/packages: unknown conceptId "${pkg.conceptId}"`)
  const need = (id: string): Talent => {
    const t = byId.get(id)
    if (t === undefined) throw new Error(`d16/packages: unknown talentId "${id}"`)
    return t
  }
  const cast = {} as Record<CastSlot, Talent>
  for (const slot of CAST_SLOTS) cast[slot] = need(pkg.cast[slot])
  return {
    concept,
    shape: pkg.shape,
    shapeEffects: resolveShape(pkg.shape),
    promise: pkg.promise,
    budget: pkg.budget,
    writer: need(pkg.writerId),
    director: need(pkg.directorId),
    cast,
    craftHires: pkg.craftIds.map(need),
    market: state.market,
    standing: state.studio.standing,
    era: state.era,
  }
}

// ── generation ───────────────────────────────────────────────────────────────
export type GenerationResult = {
  packages: D16Package[]
  /** true when `maxPackages` truncated the enumeration (never silent). */
  truncated: boolean
  /** roles that could not be staffed at all under these options. */
  unstaffable: CreativeRole[]
  /** the engagement mode the costs were computed under. false ⇒ legacy D-1 salary path. */
  engaged: boolean
}

export function generatePackages(state: GameState, options: PackageOptions = {}): GenerationResult {
  // A4 §5: the marketing menu is resolved HERE, at generation time, from the active grid —
  // never from a module-load snapshot. An explicit caller option still wins (that is how the
  // controlled marketing probes P4/P7/P12/P13 pin their single rung).
  const opts: Required<PackageOptions> = {
    ...DEFAULT_PACKAGE_OPTIONS,
    marketingLevels: activeMarketingGrid(),
    ...options,
  }
  if (options.marketingLevels === undefined) opts.marketingLevels = activeMarketingGrid()
  // Historical lab/reference mode preserves its original employment predicate. A production
  // alignment run follows the action's persisted regime fact exactly (D-17A/R2).
  const engaged = packageRegimeEngaged(state)
  const pools = buildPools(state, opts, engaged)
  const unstaffable: CreativeRole[] = []
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, craft: 1, actor: 3 }
  for (const role of ['writer', 'director', 'craft', 'actor'] as const) {
    if (pools[role].contracted.length + pools[role].freelance.length < need[role]) unstaffable.push(role)
  }
  if (unstaffable.length > 0) return { packages: [], truncated: false, unstaffable, engaged }

  const concepts = representativeConcepts(state, opts.conceptCount)
  const packages: D16Package[] = []
  let truncated = false
  const segmentMemo = new Map<string, SegmentId>()
  const castMemo = new Map<CastPlanKey, CastAssignment | null>()
  const castFor = (plan: CastPlanKey): CastAssignment | null => {
    let a = castMemo.get(plan)
    if (a === undefined) {
      a = assignCast(pools, plan)
      castMemo.set(plan, a)
    }
    return a
  }

  outer: for (const concept of concepts) {
    for (const shapeKey of opts.shapeKeys) {
      const { shape, effects } = shapeFor(shapeKey)
      const requiredNegative = concept.baseNegativeCost * effects.budgetDemandMultiplier * state.era.costScale
      for (const width of opts.promiseWidths) {
        for (const plan of opts.castPlans) {
          const assigned = castFor(plan)
          if (assigned === null) continue
          const memoKey = `${concept.id}|${shapeKey}|${width}`
          let intended = segmentMemo.get(memoKey)
          if (intended === undefined) {
            const refBudget: Budget = { negative: requiredNegative, marketing: MARKETING_BUDGET_LEVELS[1]! }
            const refPromise = promiseFor(concept, width, state.market.segments[0]!.id)
            const centers = forecastCenters(
              {
                concept,
                shape,
                shapeEffects: effects,
                promise: { ...refPromise, intendedSegments: [] },
                budget: refBudget,
                writer: assigned.writer,
                director: assigned.director,
                cast: assigned.cast,
                craftHires: [assigned.craft],
                market: state.market,
                standing: state.studio.standing,
                era: state.era,
              },
              true,
              true,
            ).centers
            intended = argmaxSegment(state, centers)
            segmentMemo.set(memoKey, intended)
          }
          const promise = promiseFor(concept, width, intended)

          const assignedTalent: Talent[] = [
            assigned.writer,
            assigned.director,
            assigned.cast.lead,
            assigned.cast.antagonist,
            assigned.cast.support,
            assigned.craft,
          ]
          const freelancerIds: string[] = []
          let freelancerFees = 0
          for (const t of assignedTalent) {
            if (engaged) {
              if (isContracted(state, t.id)) continue
              freelancerIds.push(t.id)
              freelancerFees += freelancerFee(state, t)
            } else {
              // legacy D-1 debit: negative + marketing + Σ salaries over EVERY assignee.
              freelancerIds.push(t.id)
              freelancerFees += t.salary
            }
          }

          for (const negIndex of opts.negIndices) {
            const negMult = NEGATIVE_BUDGET_MULTIPLIERS[negIndex]
            if (negMult === undefined) continue
            // The production capacity depends on the forecast opening, which depends on
            // Production Budget through realized craft. Resolve the menu INSIDE the negative
            // loop with this exact package budget; marketing itself remains a harmless zero
            // placeholder because capacity does not read it.
            const negative = negMult * requiredNegative
            const productionMenu = PRODUCTION_MARKETING_MENU
              ? marketingLevelsFor(state, {
                  concept,
                  shape,
                  shapeEffects: effects,
                  promise,
                  budget: { negative, marketing: 0 },
                  writer: assigned.writer,
                  director: assigned.director,
                  cast: assigned.cast,
                  craftHires: [assigned.craft],
                  market: state.market,
                  standing: state.studio.standing,
                  era: state.era,
                })
              : null
            // Lab policies name rungs by reading ACTIVE_GRID. Recognize those values as
            // indices in production mode; an explicit off-grid dollar probe stays literal.
            const marketingChoices = opts.marketingLevels.map((value) => {
              if (productionMenu === null) return value
              const rung = ACTIVE_GRID.indexOf(value)
              return rung < 0 ? value : productionMenu[rung]!
            })
            for (const marketing of marketingChoices) {
              if (packages.length >= opts.maxPackages) {
                truncated = true
                break outer
              }
              // Grouped EXACTLY like the action: requiredNegative = base × demand × costScale,
              // THEN × multiplier. Unrounded, matching studioRunRecap.cheapestPackage.
              const budget: Budget = { negative, marketing }
              packages.push({
                id: `${concept.id}|${shapeKey}|w${width}|${plan}|n${negIndex}|m${marketing}`,
                conceptId: concept.id,
                conceptTitle: concept.title,
                shapeKey,
                shape,
                promiseWidth: width,
                promise,
                castPlan: plan,
                writerId: assigned.writer.id,
                directorId: assigned.director.id,
                craftIds: [assigned.craft.id],
                cast: {
                  lead: assigned.cast.lead.id,
                  antagonist: assigned.cast.antagonist.id,
                  support: assigned.cast.support.id,
                },
                negIndex,
                negMult,
                marketing,
                budget,
                requiredNegative,
                freelancerIds: [...freelancerIds],
                freelancerFees,
                committedCost: negative + marketing + freelancerFees,
              })
            }
          }
        }
      }
    }
  }
  return { packages, truncated, unstaffable, engaged }
}

/**
 * The bare-minimum legal package: cheapest concept, min-demand shape, 0.75×, $100k.
 * Reproduces `studioRunRecap.cheapestPackage` (parity-locked by states.test.ts).
 * `options` OVERRIDE these defaults — that is how the marketing probes vary one lever.
 */
export const BARE_MINIMUM_DEFAULTS: PackageOptions = {
  conceptCount: 1,
  shapeKeys: ['minDemand'],
  promiseWidths: [PROMISE_WIDTHS[1]!],
  castPlans: ['cheapest'],
  negIndices: [0],
  marketingLevels: [MARKETING_BUDGET_LEVELS[0]!],
}

/**
 * The bare-minimum GENERATION, so a caller can see `unstaffable` as well as the package.
 * A4 §5: the `[0]` rung comes from the ACTIVE grid at call time, so a swept menu moves the
 * classifier's cheapest reference film with it.
 */
export function bareMinimumGeneration(state: GameState, options: PackageOptions = {}): GenerationResult {
  return generatePackages(state, {
    ...BARE_MINIMUM_DEFAULTS,
    marketingLevels: [activeMarketingGrid()[0]],
    ...options,
  })
}

export function bareMinimumPackage(state: GameState, options: PackageOptions = {}): D16Package | null {
  return bareMinimumGeneration(state, options).packages[0] ?? null
}

/**
 * The standard package: cheapest concept, neutral-demand shape (the legal shape closest
 * to demand 1.0 — see the states.ts parity note on the recap's unbuildable 1.0), 1.0×, $400k.
 */
export const STANDARD_DEFAULTS: PackageOptions = {
  conceptCount: 1,
  shapeKeys: ['neutralDemand'],
  promiseWidths: [PROMISE_WIDTHS[1]!],
  castPlans: ['bestOVR'],
  negIndices: [1],
  marketingLevels: [MARKETING_BUDGET_LEVELS[1]!],
}

/** The standard GENERATION, so a caller can see `unstaffable` as well as the package. */
export function standardGeneration(state: GameState, options: PackageOptions = {}): GenerationResult {
  return generatePackages(state, {
    ...STANDARD_DEFAULTS,
    marketingLevels: [activeMarketingGrid()[1]],
    ...options,
  })
}

export function standardPackage(state: GameState, options: PackageOptions = {}): D16Package | null {
  return standardGeneration(state, options).packages[0] ?? null
}

// ── the action, and the authoritative affordability gate ─────────────────────
export function toGreenlightAction(pkg: D16Package): Action {
  return {
    kind: 'greenlight',
    production: {
      conceptId: pkg.conceptId,
      shape: pkg.shape,
      promise: pkg.promise,
      writerId: pkg.writerId,
      directorId: pkg.directorId,
      craftIds: [...pkg.craftIds],
      cast: { ...pkg.cast },
      budget: { ...pkg.budget },
    },
  }
}

/** The SAME gate the engine enforces (employment.ts:69-76 via actions.ts:437). */
export function packageAffordable(state: GameState, pkg: D16Package): boolean {
  return canAfford(state, pkg.committedCost).ok
}

export function packagePreview(state: GameState, pkg: D16Package): CommitmentPreview {
  return commitmentPreview(state, pkg.committedCost)
}

// ── engagement-mode money helpers (B2-C9 fix) ────────────────────────────────
/**
 * The studio's share of a film's gross under the CURRENT engagement mode.
 * ENGAGED → `STUDIO_RENTAL_BLENDED` (0.52) paid weekly by a theatrical run.
 * DISENGAGED → the legacy D-1 path credits **100 % of gross** in a single lump
 * (`tick.ts:238-247`). Pricing a disengaged film at 0.52 understates it ~1.92×.
 */
export function studioShareFor(engaged: boolean): number {
  return engaged ? TUNING.STUDIO_RENTAL_BLENDED : 1
}

/**
 * `forecastProfitRange` ALWAYS scales by `STUDIO_RENTAL_BLENDED` (`filmPackage.ts:557`)
 * and always reports `studioRevenueIsFullBoxOffice: false`, regardless of the `engaged`
 * flag — that flag only shapes the forecast CORE. So on the disengaged path its
 * `studioRevenue` centre must be un-scaled back to gross before it can be compared with
 * the lump the engine actually credits. The engaged branch is returned untouched so the
 * (decision-critical) engaged numbers stay bit-identical.
 */
export function centerRevenueFor(expectedAtBlendedShare: number, engaged: boolean): number {
  return engaged ? expectedAtBlendedShare : expectedAtBlendedShare / TUNING.STUDIO_RENTAL_BLENDED
}

// ── player-visible evaluation ────────────────────────────────────────────────
export type PackageEvaluation = {
  packageId: string
  committedCost: number
  preview: CommitmentPreview
  profit: ForecastProfitRange
  /** the engagement mode the money terms below were priced under. */
  engaged: boolean
  /** center of the player-visible profit band (engaged: estimate === center, forecast.ts:387). */
  centerProfit: number
  /** centerProfit / committedCost. */
  centerROI: number
  breakEvenGross: number
}

/**
 * Evaluate a package with EXACTLY the numbers the Release-Strategy screen shows:
 * `forecastProfitRange` on the predicted production id (so it draws the same derived
 * forecast stream the greenlight will persist) with the engagement flags threaded from
 * `employmentEngaged(state)` (NOT hard-coded true — B2-C9), plus `commitmentPreview`.
 * No hidden state is read.
 */
export function evaluatePackage(state: GameState, pkg: D16Package): PackageEvaluation {
  const engaged = packageRegimeEngaged(state)
  const inp = receptionInputsFor(state, pkg)
  const salaries = pkg.freelancerFees
  const profit = forecastProfitRange(inp, {
    seed: state.seed,
    productionId: predictProductionId(state),
    directorId: pkg.directorId,
    releasedFilms: state.studio.releasedFilms,
    concepts: state.concepts,
    salaries,
    saturateFame: engaged,
    engaged,
  })
  const preview = commitmentPreview(state, pkg.committedCost)
  const centerProfit = centerRevenueFor(profit.studioRevenue.expected, engaged) - pkg.committedCost
  return {
    packageId: pkg.id,
    committedCost: pkg.committedCost,
    preview,
    profit,
    engaged,
    centerProfit,
    centerROI: centerProfit / Math.max(TUNING.ROI_COST_FLOOR, pkg.committedCost),
    // break-even GROSS = cost / share; on the disengaged path the share is 1.
    breakEvenGross: engaged ? profit.breakEven : pkg.committedCost,
  }
}

/** The full player-visible greenlight dossier, priced under the state's OWN engagement mode. */
export function assessPackage(state: GameState, pkg: D16Package): GreenlightAssessment {
  const engaged = packageRegimeEngaged(state)
  const inp = receptionInputsFor(state, pkg)
  const id = predictProductionId(state)
  const byId: Record<string, Talent> = {}
  for (const t of state.talent) byId[t.id] = t
  // The SAME snapshot the greenlight will lock: computeForecast on the predicted id with
  // the engagement flags the action itself picks from state (actions.ts:392). Not a stub —
  // the assessment reports it verbatim.
  const forecastSnapshot = computeForecast(
    inp,
    {
      seed: state.seed,
      productionId: id,
      directorId: pkg.directorId,
      releasedFilms: state.studio.releasedFilms,
      concepts: state.concepts,
    },
    engaged,
    engaged,
  )
  return greenlightAssessment(
    {
      seed: state.seed,
      concepts: state.concepts,
      releasedFilms: state.studio.releasedFilms,
      talentById: byId,
      market: state.market,
      standing: state.studio.standing,
      era: state.era,
    },
    {
      id,
      conceptId: pkg.conceptId,
      shape: pkg.shape,
      promise: pkg.promise,
      writerId: pkg.writerId,
      directorId: pkg.directorId,
      craftIds: [...pkg.craftIds],
      cast: { ...pkg.cast },
      budget: { ...pkg.budget },
      startTick: state.market.tick,
      remainingTicks: TUNING.PRODUCTION_TICKS,
      forecastSnapshot,
    },
    engaged,
  )
}

// ── ORACLE-ONLY evaluation (genuine hidden information) ──────────────────────
/**
 * THE OMNISCIENT ARM. `resolveReception` at `discoverabilityZ = 0` — the ACTUAL-skill,
 * ACTUAL-persona deterministic core the release itself resolves (`reception.ts:673-724`;
 * `computeCraft` reads `'actual'` at `:174-185`, `computeContributions` builds from
 * `talent.actual` personas at `:269-277`) — times the mode-correct studio share, minus the
 * authoritative committed cost.
 *
 * B2-C1 FIX. This function previously scored `forecastCenters(inp, true, true)`, whose four
 * skill reads are ALL `'perceived'` (`forecast.ts:78-118`, and the file says so itself:
 * "forecast reads perceived; reception reads actual"). That is the same information the
 * PLAYER has, so P14 had **no** hidden-information advantage — it was a wide-search arm
 * wearing an oracle label. It now reads what only an oracle can read.
 *
 * DETERMINISM. `RngStream.deserialize(state.rngState)` is a COPY: the shared sim stream is
 * never advanced, and the only draw `resolveReception` makes is the §5.3 critic gaussian,
 * which feeds `criticScore` alone — `computeSegmentAppeal` consumes the *deterministic*
 * `timelinessContribution`, so `opening`/`total` do not depend on the stream position.
 * The returned number is therefore a pure function of (state, package).
 *
 * Still EXCLUDES the D-13 discoverability draw (z = 0) and the critic gaussian by
 * construction — it is the expectation of the deterministic core, not a Monte-Carlo mean.
 * ORACLE POLICIES ONLY.
 */
export function oracleExpectedContribution(state: GameState, pkg: D16Package): number {
  const engaged = packageRegimeEngaged(state)
  const inp = receptionInputsFor(state, pkg)
  const truth = resolveReception(inp, RngStream.deserialize(state.rngState), engaged, engaged, 0)
  return truth.total * studioShareFor(engaged) - pkg.committedCost
}

/**
 * The PERCEIVED-skill twin of `oracleExpectedContribution`, i.e. what the deterministic
 * forecast core believes the same package is worth. Exported so an analysis can measure the
 * information gap directly (`oracleExpectedContribution − perceivedExpectedContribution`)
 * instead of inferring it from a contaminated discoverability ratio. NOT for decisions.
 */
export function perceivedExpectedContribution(state: GameState, pkg: D16Package): number {
  const engaged = packageRegimeEngaged(state)
  const inp = receptionInputsFor(state, pkg)
  const c = forecastCenters(inp, engaged, engaged)
  const box = computeBoxOfficeCore(inp, c.centers, c.centersOpening, engaged)
  return box.total * studioShareFor(engaged) - pkg.committedCost
}

/**
 * THE AWARENESS-CONDITIONED MARKETING CAPACITY of one package — the spend at which reach
 * half-saturates (`reception.ts:553-559`).
 *
 * THIS IS THE SAME NUMBER THE SHIPPED READ-MODEL SHOWS. `marketingEfficiency`
 * (`ui/src/engine/adapter.ts:3136-3176`) computes `forecastCenters(inp, engaged, engaged)` and
 * then `computeBoxOffice(...)`, and reports `box.marketingCapacity` as `capacity`; this is that
 * pair, on the harness's own `receptionInputsFor`. `engaged` is the PERSISTED regime
 * (`economyEngaged`), exactly as the read-model reads it — not `employmentEngaged`.
 *
 * It does NOT depend on `budget.marketing`: capacity is a function of pre-marketing awareness
 * (studio standing + the film's own opening appeal), so it is well defined for a state
 * REGARDLESS of which marketing grid is active. That is what makes a capacity-anchored menu
 * resolvable without a chicken-and-egg on the grid it is choosing.
 */
export function awarenessConditionedCapacity(state: GameState, pkg: D16Package): number {
  const engaged = economyEngaged(state)
  const inp = receptionInputsFor(state, pkg)
  const c = forecastCenters(inp, engaged, engaged)
  return computeBoxOffice(
    c.centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    c.centersOpening,
    engaged,
  ).marketingCapacity
}

/** The engine's own §5.5 box-office pass over a supplied appeal/opening pair. */
function computeBoxOfficeCore(
  inp: ReceptionInputs,
  centers: Readonly<Record<SegmentId, number>>,
  centersOpening: Readonly<Record<SegmentId, number>>,
  engaged: boolean,
): { opening: number; total: number } {
  return computeBoxOffice(
    centers,
    inp.market.segments,
    inp.market.baseMarketValue,
    inp.standing,
    inp.promise,
    inp.budget,
    inp.shapeEffects,
    centersOpening,
    engaged,
  )
}
