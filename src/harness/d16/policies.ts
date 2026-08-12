// ── D-16 · policies ──────────────────────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// A0 §3.3 G5: no shipped policy ever declines to greenlight, waits, renews, or
// downsizes. Every one is "greedy-fill until the gate blocks". For a RECOVERY study
// that is the central missing behaviour, so this module models the whole action
// surface a player has: founding hires inside the $6M recruitment fund, contract
// renewal, optional release, and the greenlight decision itself.
//
// THE INFORMATION SEAM IS TYPE-ENFORCED.
//   • a PlayerPolicy's `decide` receives `PlayerView` + `PlayerCtx`. Neither type has a
//     `state` field, so a player policy CANNOT reach hidden information — the compiler
//     stops it. `PlayerCtx`'s operations are all built from the same engine read-models
//     the UI calls.
//   • an OraclePolicy's `decide` receives `OracleView` (full state, labelled) + `OracleCtx`.
//   • an exploit policy is a player policy that is LABELLED `kind: 'exploit'` because it
//     deliberately leaves the D-12 economy (A2 §7.2 engagement cliff).
//
// AFFORDABILITY. Every commitment goes through `ctx.affordable(pkg)` →
// `canAfford(state, pkg.committedCost)` — the authoritative gate (Lesson AC). No policy
// ever compares cash to a lookalike cost.

import { FOUNDING_MINIMUMS, TUNING } from '../../core/index.js'
import type { Action, CommitmentPreview, CreativeRole, GameState, GreenlightAssessment } from '../../core/index.js'
import type { FoundingView, PerceivedTalent, PlayerView, OracleView, ContractView } from './view.js'
import type {
  CastPlanKey,
  D16Package,
  GenerationResult,
  PackageEvaluation,
  PackageOptions,
} from './packages.js'
import { HEALTHY_RUNWAY_WEEKS } from './states.js'
import type { FinancialState } from './states.js'

// ── contexts ─────────────────────────────────────────────────────────────────

/** Everything a PLAYER policy may compute. Deliberately has no `state`. */
export type PlayerCtx = {
  week: number
  maxConcurrent: number
  packages(options?: PackageOptions): GenerationResult
  bareMinimum(options?: PackageOptions): D16Package | null
  standard(options?: PackageOptions): D16Package | null
  evaluate(pkg: D16Package): PackageEvaluation
  assess(pkg: D16Package): GreenlightAssessment
  affordable(pkg: D16Package): boolean
  preview(pkg: D16Package): CommitmentPreview
  previewAmount(amount: number): CommitmentPreview
  financialState(): FinancialState
}

/**
 * A player context plus the full state and the noise-free truth. ORACLE ONLY.
 * `playerView` is provided so an oracle can reuse the shared roster-maintenance helpers
 * (which are written against the player surface) without re-deriving them.
 */
export type OracleCtx = PlayerCtx & {
  state: GameState
  playerView: PlayerView
  trueContribution(pkg: D16Package): number
}

// ── founding ─────────────────────────────────────────────────────────────────

export type FoundingPlan = {
  counts: Record<CreativeRole, number>
  rank: CastPlanKey
  /** default contract term for every founding hire. */
  termWeeks: number
  /**
   * P9 shape: keep exactly ONE hire on `termWeeks` and put every other founding hire on
   * `shortTermWeeks`, so the roster shrinks to a single contract by natural expiry — no
   * termination cost, and the economy stays engaged (A2 §7.2).
   */
  shortTermWeeks?: number
  /** which hire keeps the long term when `shortTermWeeks` is set (cheapest by default). */
  keepRank?: CastPlanKey
}

export type FoundingHire = { talentId: string; termWeeks: number }

const ROLE_ORDER: readonly CreativeRole[] = ['writer', 'director', 'craft', 'actor'] as const

function rankValue(t: PerceivedTalent, rank: CastPlanKey): number {
  switch (rank) {
    case 'bestOVR':
      return -t.primaryOVR
    case 'highestFame':
      return -t.fame
    case 'cheapest':
      return t.quotedSalary
    case 'youngest':
      return t.age
  }
}

function orderApplicants(list: readonly PerceivedTalent[], rank: CastPlanKey): PerceivedTalent[] {
  return [...list].sort(
    (a, b) =>
      rankValue(a, rank) - rankValue(b, rank) ||
      (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0),
  )
}

function bonusFor(t: PerceivedTalent, termWeeks: number): number {
  const q = t.contractQuotes.find((x) => x.termWeeks === termWeeks)
  return q?.signingBonus ?? Infinity
}

/**
 * Turn a FoundingPlan into concrete hires, respecting FOUNDING_MINIMUMS and the $6M
 * recruitment fund (`founding.budget`, off-ledger — types.ts:348-349). Minimums are
 * filled FIRST (in ROLE_ORDER) so a plan can never produce an unfoundable roster; extra
 * depth is added afterwards while the fund allows.
 */
export function planFoundingHires(founding: FoundingView, plan: FoundingPlan): FoundingHire[] {
  const byRole: Record<CreativeRole, PerceivedTalent[]> = { writer: [], director: [], craft: [], actor: [] }
  for (const a of founding.applicants) byRole[a.role]?.push(a)

  const hires: FoundingHire[] = []
  const taken = new Set<string>()
  let remaining = founding.budgetRemaining

  const tryHire = (t: PerceivedTalent, term: number): boolean => {
    if (taken.has(t.talentId)) return false
    const bonus = bonusFor(t, term)
    if (!Number.isFinite(bonus) || bonus > remaining) return false
    taken.add(t.talentId)
    remaining -= bonus
    hires.push({ talentId: t.talentId, termWeeks: term })
    return true
  }

  const shortTerm = plan.shortTermWeeks
  // Pass 1 — minimums, cheapest-bonus-first within the rank order so the fund always suffices.
  for (const role of ROLE_ORDER) {
    const want = FOUNDING_MINIMUMS[role]
    const ordered = orderApplicants(byRole[role], plan.rank)
    let got = 0
    for (const t of ordered) {
      if (got >= want) break
      if (tryHire(t, shortTerm ?? plan.termWeeks)) got += 1
    }
    if (got < want) {
      // Fall back to the cheapest bonuses for this role — the minimum is mandatory.
      for (const t of orderApplicants(byRole[role], 'cheapest')) {
        if (got >= want) break
        if (tryHire(t, shortTerm ?? plan.termWeeks)) got += 1
      }
    }
  }
  // Pass 2 — extra depth beyond the minimum, while the fund allows.
  for (const role of ROLE_ORDER) {
    const want = Math.max(FOUNDING_MINIMUMS[role], plan.counts[role])
    let got = hires.filter((h) => byRole[role].some((t) => t.talentId === h.talentId)).length
    for (const t of orderApplicants(byRole[role], plan.rank)) {
      if (got >= want) break
      if (tryHire(t, shortTerm ?? plan.termWeeks)) got += 1
    }
  }

  if (shortTerm !== undefined) {
    // Promote exactly ONE hire to the long term; every other contract lapses naturally.
    const keepRank = plan.keepRank ?? 'cheapest'
    const pool = founding.applicants.filter((a) => taken.has(a.talentId))
    const keep = orderApplicants(pool, keepRank)[0]
    if (keep !== undefined) {
      for (const h of hires) if (h.talentId === keep.talentId) h.termWeeks = plan.termWeeks
    }
  }
  return hires
}

// ── shared weekly roster maintenance ─────────────────────────────────────────

export type RosterPolicyOptions = {
  /**
   * Renew a contract once weeksRemaining ≤ this (0 disables renewal entirely).
   * The engine's window is `0 < remaining ≤ HIRING_RENEWAL_WINDOW_WEEKS` (12), so the
   * DEFAULT is the FULL window: renewing at 4 weeks out gave a cash-poor studio only four
   * attempts before the contract lapsed and the economy silently disengaged (B2-C3).
   */
  renewAtWeeksRemaining: number
  renewTermWeeks: number
  /**
   * Only renew contracts whose ORIGINAL term was ≥ this many weeks (0 = renew any).
   * This is how P9 keeps its ONE long contract while genuinely letting the short ones
   * lapse — the docstring's behaviour, which `renewAtWeeksRemaining` alone could not
   * express (B2-H5).
   */
  renewMinTermWeeks: number
  /** re-sign lapsed roster roles from the hiring market up to these counts (0 disables). */
  refillCounts: Record<CreativeRole, number> | null
  refillRank: CastPlanKey
}

export const DEFAULT_ROSTER_OPTIONS: RosterPolicyOptions = {
  renewAtWeeksRemaining: TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
  renewTermWeeks: TUNING.CONTRACT_MAX_WEEKS,
  renewMinTermWeeks: 0,
  refillCounts: null,
  refillRank: 'bestOVR',
}

/**
 * Renewals due this week, priced against a RUNNING cash figure.
 *
 * B2-C5 FIX. This used to test every eligible contract against ONE `view.cash` snapshot and
 * return them all; the driver then applied them one action per `applyActions` call, each
 * signing bonus reducing cash, and the engine re-checked with the live `canAfford`
 * (`actions.ts:1191-1194`). A week with 7 simultaneous renewals therefore emitted 7
 * approvals, the engine refused the later ones, and each refusal LAPSED a contract — the
 * harness manufacturing the very disengagement mechanism it was built to prevent. Every
 * rejection in the pre-fix smoke corpus was `renewContract rejected — Insufficient cash`.
 *
 * Now `cash` is decremented as each renewal is approved, so the set this returns is one the
 * engine will accept in order. A renewal the studio genuinely cannot afford is still
 * skipped — that is a faithful consequence (and the reason `engagedWeekFraction` and the
 * cliff split exist), not an error.
 */
function renewalActions(view: PlayerView, opts: RosterPolicyOptions): Action[] {
  if (opts.renewAtWeeksRemaining <= 0) return []
  const out: Action[] = []
  const ordered: ContractView[] = [...view.contracts].sort((a, b) =>
    a.weeksRemaining - b.weeksRemaining ||
    (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0),
  )
  let cash = view.cash
  for (const c of ordered) {
    if (!c.renewalWindowOpen) continue
    if (c.weeksRemaining > opts.renewAtWeeksRemaining) continue
    if (c.termWeeks < opts.renewMinTermWeeks) continue
    const quote = c.renewalQuotes.find((q) => q.termWeeks === opts.renewTermWeeks)
    if (quote === undefined) continue
    // AUTHORITATIVE gate: the renewal signing bonus is a voluntary immediate commitment
    // (actions.ts:1191-1194). A blocked renewal is a faithful consequence, not an error.
    if (cash - quote.signingBonus < 0) continue
    cash -= quote.signingBonus
    out.push({ kind: 'renewContract', talentId: c.talentId, termWeeks: opts.renewTermWeeks })
  }
  return out
}

function refillActions(view: PlayerView, opts: RosterPolicyOptions): Action[] {
  if (opts.refillCounts === null) return []
  const have: Record<CreativeRole, number> = { writer: 0, director: 0, craft: 0, actor: 0 }
  for (const r of view.roster) have[r.role] += 1
  for (const role of ROLE_ORDER) {
    const want = Math.max(FOUNDING_MINIMUMS[role], opts.refillCounts[role])
    if (have[role] >= want) continue
    const candidates = orderApplicants(
      view.hiringMarket.filter((t) => t.role === role && t.employment === 'hiringMarket'),
      opts.refillRank,
    )
    for (const t of candidates) {
      const quote = t.contractQuotes.find((q) => q.termWeeks === TUNING.CONTRACT_MAX_WEEKS)
      if (quote === undefined) continue
      if (view.cash - quote.signingBonus < 0) continue
      // One re-sign per week keeps the action stream bounded and legible.
      return [{ kind: 'signContract', talentId: t.talentId, termWeeks: TUNING.CONTRACT_MAX_WEEKS }]
    }
  }
  return []
}

/** Renewals first (cheap, protects engagement), then at most one refill. */
export function maintenanceActions(view: PlayerView, opts: RosterPolicyOptions): Action[] {
  const renew = renewalActions(view, opts)
  if (renew.length > 0) return renew
  return refillActions(view, opts)
}

// ── policy types ─────────────────────────────────────────────────────────────

/**
 * B2-C3/C8. Losing `employmentEngaged` is a DEFECT for a policy that means to keep playing
 * the D-12 economy and a DESIGN GOAL for two policies that do not: P15 (the labelled
 * exploit) and P16 (`doNothing`, whose whole point is that it takes no voluntary action,
 * renewal included). Declaring it per policy — rather than inferring it from `kind` — stops
 * the driver flagging P16 as broken and stops the summary printing "cliff 0 %" against the
 * one arm that is fully disengaged.
 */
type PolicyCommon = {
  name: string
  description: string
  founding: FoundingPlan
  roster: RosterPolicyOptions
  /** true when this policy is DESIGNED to leave the engaged economy. */
  disengagementIntended: boolean
}

export type PlayerPolicy = PolicyCommon & {
  kind: 'player' | 'exploit'
  decide(view: PlayerView, ctx: PlayerCtx): Action[]
}

export type OraclePolicy = PolicyCommon & {
  kind: 'oracle'
  decide(view: OracleView, ctx: OracleCtx): Action[]
}

export type Policy = PlayerPolicy | OraclePolicy

// ── helpers shared by the concrete policies ──────────────────────────────────

const MIN_ROSTER: Record<CreativeRole, number> = { actor: 3, director: 1, writer: 1, craft: 1 }
const SMALL_ROSTER: Record<CreativeRole, number> = { actor: 4, director: 1, writer: 1, craft: 1 }
const DEEP_ROSTER: Record<CreativeRole, number> = { actor: 5, director: 2, writer: 1, craft: 1 }

function roster(
  counts: Record<CreativeRole, number>,
  rank: CastPlanKey,
  over: Partial<RosterPolicyOptions> = {},
): RosterPolicyOptions {
  return { ...DEFAULT_ROSTER_OPTIONS, refillCounts: counts, refillRank: rank, ...over }
}

function slotFree(view: PlayerView): boolean {
  return view.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS
}

/** Greenlight the given package if a slot is free and the authoritative gate passes. */
function commit(view: PlayerView, ctx: PlayerCtx, pkg: D16Package | null): Action[] {
  if (pkg === null) return []
  if (!slotFree(view)) return []
  if (!ctx.affordable(pkg)) return []
  return [{ kind: 'greenlight', production: greenlightBody(pkg) }]
}

function greenlightBody(pkg: D16Package): (Action & { kind: 'greenlight' })['production'] {
  return {
    conceptId: pkg.conceptId,
    shape: pkg.shape,
    promise: pkg.promise,
    writerId: pkg.writerId,
    directorId: pkg.directorId,
    craftIds: [...pkg.craftIds],
    cast: { ...pkg.cast },
    budget: { ...pkg.budget },
  }
}

/** Argmax over affordable packages, with a deterministic id tie-break. */
function bestAffordable(
  ctx: PlayerCtx,
  packages: readonly D16Package[],
  score: (p: D16Package) => number,
): D16Package | null {
  let best: D16Package | null = null
  let bestScore = -Infinity
  for (const p of packages) {
    if (!ctx.affordable(p)) continue
    const s = score(p)
    if (s > bestScore || (s === bestScore && best !== null && p.id < best.id)) {
      best = p
      bestScore = s
    }
  }
  return best
}

const STANDARD_OPTS: PackageOptions = {
  conceptCount: 1,
  shapeKeys: ['neutralDemand'],
  castPlans: ['bestOVR'],
  negIndices: [1],
  marketingLevels: [400_000],
}

function standardWith(marketing: number, castPlan: CastPlanKey = 'bestOVR'): PackageOptions {
  return { ...STANDARD_OPTS, castPlans: [castPlan], marketingLevels: [marketing] }
}

// ── the sixteen policies ─────────────────────────────────────────────────────

/** P1 — minimal legal roster, always the bare-minimum package when affordable. */
export const cheapestViable: PlayerPolicy = {
  name: 'P1_cheapestViable',
  kind: 'player',
  disengagementIntended: false,
  description: 'Minimum legal contracted roster; always the bare-minimum package (cheapest concept, min-demand shape, 0.75x, $100k) when affordable.',
  founding: { counts: MIN_ROSTER, rank: 'cheapest', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(MIN_ROSTER, 'cheapest'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.bareMinimum({ castPlans: ['cheapest'] }))
  },
}

/** P2 — standard package ONLY while it leaves ≥ 26 weeks of post-commitment runway. */
export const conservativeStandard: PlayerPolicy = {
  name: 'P2_conservativeStandard',
  kind: 'player',
  disengagementIntended: false,
  description: 'Standard 1.0x/$400k only when post-commitment runway is >= 26 weeks of current burn; otherwise wait.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    const pkg = ctx.standard()
    if (pkg === null || !slotFree(view) || !ctx.affordable(pkg)) return []
    const post = ctx.preview(pkg).postRunway
    // `weeks === null` = net-cash-positive ⇒ effectively infinite runway.
    // B2-L13: the threshold is IMPORTED from the classifier (states.ts:49), not a literal —
    // "conservative" and "healthy" must never be able to drift apart silently.
    if (post.weeks !== null && post.weeks < HEALTHY_RUNWAY_WEEKS) return []
    return commit(view, ctx, pkg)
  },
}

/** P3 — the cadence baseline: standard package whenever affordable and a slot is free. */
export const standardCadence: PlayerPolicy = {
  name: 'P3_standardCadence',
  kind: 'player',
  disengagementIntended: false,
  description: 'Standard 1.0x/$400k whenever affordable and a production slot is free.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard())
  },
}

/** P4 — best-forecast concept at 1.25× / $1M with the highest-fame affordable lead. */
export const premiumAmbitious: PlayerPolicy = {
  name: 'P4_premiumAmbitious',
  kind: 'player',
  disengagementIntended: false,
  description: 'Best forecast-profit concept at 1.25x negative and $1M marketing, cast with the highest-fame affordable lead.',
  founding: { counts: DEEP_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(DEEP_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    const gen = ctx.packages({
      conceptCount: 3,
      castPlans: ['highestFame', 'bestOVR'],
      negIndices: [2],
      marketingLevels: [1_000_000],
    })
    // Prefer the highest-fame cast plan; fall back to best-OVR when fame is unaffordable.
    const fameFirst = gen.packages.filter((p) => p.castPlan === 'highestFame')
    const pick =
      bestAffordable(ctx, fameFirst, (p) => ctx.evaluate(p).centerProfit) ??
      bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerProfit)
    return commit(view, ctx, pick)
  },
}

/** P5 — scan the whole roster-scoped set, maximize player-visible forecast profit centre. */
export const forecastProfitMax: PlayerPolicy = {
  name: 'P5_forecastProfitMax',
  kind: 'player',
  disengagementIntended: false,
  description: 'Scans the full roster-scoped package set and maximizes the player-visible forecast profit centre.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    const gen = ctx.packages()
    return commit(view, ctx, bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerProfit))
  },
}

/** P6 — same scan, maximize centre profit per committed dollar. */
export const forecastROIMax: PlayerPolicy = {
  name: 'P6_forecastROIMax',
  kind: 'player',
  disengagementIntended: false,
  description: 'Scans the full roster-scoped package set and maximizes forecast centre profit / committed cost.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    const gen = ctx.packages()
    return commit(view, ctx, bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerROI))
  },
}

/** P7 — fame-first roster and cast; standard negative; maximum marketing. */
export const starDriven: PlayerPolicy = {
  name: 'P7_starDriven',
  kind: 'player',
  disengagementIntended: false,
  description: 'Roster and cast prioritise fame; standard 1.0x negative with $1M marketing.',
  founding: { counts: SMALL_ROSTER, rank: 'highestFame', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'highestFame'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(1_000_000, 'highestFame')))
  },
}

/** P8 — young/cheap roster, maximum cadence of bare-minimum films (development probe). */
export const developmentFarm: PlayerPolicy = {
  name: 'P8_developmentFarm',
  kind: 'player',
  disengagementIntended: false,
  description: 'Young, cheap roster running the highest possible cadence of bare-minimum films (development-farming probe).',
  founding: { counts: SMALL_ROSTER, rank: 'youngest', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'youngest'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.bareMinimum({ castPlans: ['youngest'] }))
  },
}

/**
 * P9 — exactly ONE cheap contract retained, everything else freelance.
 * The single contract is what keeps `employmentEngaged` true (employment.ts:47-49), so
 * this measures freelancer economics WITHOUT falling off the engagement cliff. The other
 * founding hires are signed on 52-week terms and allowed to LAPSE — natural expiry costs
 * nothing, while `releaseTalent` would charge 50 % of the remaining guaranteed salary.
 *
 * B2-H5 FIX. This policy previously inherited `renewAtWeeksRemaining: 4` from
 * `DEFAULT_ROSTER_OPTIONS`, so `maintenanceActions` renewed the very 52-week contracts the
 * docstring said it let lapse — onto fresh 208-week terms, at week ~48. The measured run was
 * a cheap ALL-CONTRACTED roster with ZERO freelancer fees in the ledger, not freelancer
 * economics. `renewMinTermWeeks: CONTRACT_MAX_WEEKS` now renews ONLY the one retained
 * long-term contract; every 52-week hire expires as designed.
 *
 * EXPECTED CONSEQUENCE, which is the point: once the short contracts lapse the studio often
 * CANNOT field a film — the week-0 freelancer market holds roughly 5 actors, 1 craft, 0
 * writers, 0 directors. The driver counts those weeks (`unstaffableWeeks` /
 * `unstaffableRoleWeeks`) so market thinness is measured rather than hidden.
 */
export const freelancerLean: PlayerPolicy = {
  name: 'P9_freelancerLean',
  kind: 'player',
  disengagementIntended: false,
  description: 'Retains exactly one cheap contract (keeping the economy engaged), lets every other founding contract expire, and staffs each film from the freelancer market — including the weeks the market is too thin to field one.',
  founding: {
    counts: MIN_ROSTER,
    rank: 'cheapest',
    termWeeks: TUNING.CONTRACT_MAX_WEEKS,
    shortTermWeeks: TUNING.CONTRACT_MIN_WEEKS,
    keepRank: 'cheapest',
  },
  roster: roster(MIN_ROSTER, 'cheapest', {
    refillCounts: null,
    renewMinTermWeeks: TUNING.CONTRACT_MAX_WEEKS,
  }),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    const gen = ctx.packages({
      conceptCount: 1,
      shapeKeys: ['minDemand'],
      castPlans: ['cheapest'],
      negIndices: [0, 1],
      marketingLevels: [100_000, 400_000],
      allowFreelancers: true,
    })
    return commit(view, ctx, bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerProfit))
  },
}

/** P10 — small roster; never greenlights while any production or run is still live. */
export const lowBurnWaiter: PlayerPolicy = {
  name: 'P10_lowBurnWaiter',
  kind: 'player',
  disengagementIntended: false,
  description: 'Small roster; waits for every production AND theatrical run to complete before the next greenlight (waiting probe, A0 G9).',
  founding: { counts: MIN_ROSTER, rank: 'cheapest', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(MIN_ROSTER, 'cheapest'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (view.activeProductions.length > 0) return []
    if (view.theatricalRuns.some((r) => r.status === 'active')) return []
    return commit(view, ctx, ctx.standard())
  },
}

/** P11 — state-responsive ladder over the D-16 financial states. */
export const adaptiveBalanced: PlayerPolicy = {
  name: 'P11_adaptiveBalanced',
  kind: 'player',
  disengagementIntended: false,
  description: 'Premium when healthy, standard when constrained, bare-minimum when only that is affordable, wait when no production is affordable.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    switch (ctx.financialState()) {
      case 'healthy': {
        const gen = ctx.packages({
          conceptCount: 2,
          castPlans: ['bestOVR', 'highestFame'],
          negIndices: [1, 2],
          marketingLevels: [1_000_000],
        })
        return commit(view, ctx, bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerProfit))
      }
      case 'constrained':
        return commit(view, ctx, ctx.standard())
      case 'bareMinOnly':
        return commit(view, ctx, ctx.bareMinimum({ castPlans: ['cheapest'] }))
      case 'noProduction':
      case 'insolvent':
        return []
    }
  },
}

/** P12 — P3 with minimum marketing (controlled marketing probe). */
export const standardMinMkt: PlayerPolicy = {
  name: 'P12_standardMinMkt',
  kind: 'player',
  disengagementIntended: false,
  description: 'P3 cadence with $100k marketing (controlled marketing probe).',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(100_000)))
  },
}

/** P13 — P3 with maximum marketing (controlled marketing probe). */
export const standardMaxMkt: PlayerPolicy = {
  name: 'P13_standardMaxMkt',
  kind: 'player',
  disengagementIntended: false,
  description: 'P3 cadence with $1M marketing (controlled marketing probe).',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(1_000_000)))
  },
}

/** P14 [ORACLE] — maximize the TRUE noise-free expected contribution. Same action surface. */
export const oracleEV: OraclePolicy = {
  name: 'P14_oracleEV',
  kind: 'oracle',
  disengagementIntended: false,
  description:
    'ORACLE. Maximizes TRUE expected contribution — resolveReception at z=0 on the ACTUAL skills and ACTUAL personas the release itself reads (hidden information no player has) — over a WIDER package space than any bounded player scan. Same action surface.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(_view, ctx) {
    const view = ctx.playerView
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    if (!slotFree(view)) return []
    // FINDING, recorded here because it shapes this policy: on the ENGAGED path the
    // D-12 forecast-causality fix sets `estimate === center` (forecast.ts:387), so the
    // player-visible `forecastProfitRange` centre IS the noise-free deterministic centre.
    // An oracle that scores the SAME package set therefore makes exactly the same choices
    // as P5. Its remaining genuine advantage is SEARCH BREADTH — no bounded scan — so this
    // policy spans 4 concepts x 4 shapes x 3 cast plans x 3 negatives x 3 marketings (432).
    const gen = ctx.packages({
      conceptCount: 4,
      shapeKeys: ['minDemand', 'neutralDemand', 'highDemand', 'bestCraft'],
      castPlans: ['bestOVR', 'highestFame', 'cheapest'],
      maxPackages: 500,
    })
    return commit(view, ctx, bestAffordable(ctx, gen.packages, (p) => ctx.trueContribution(p)))
  },
}

/**
 * P15 [EXPLOIT] — deliberately falls off the engagement cliff (A2 §7.2).
 * Releases every contract immediately after founding so `contracts.length === 0` and
 * `economyEngaged` flips false: no overhead, no solvency gate, no 6-week 52 % run — the
 * legacy D-1 single-lump 100 %-of-gross credit instead. LABELLED EXPLOIT everywhere; its
 * numbers measure the cliff, not a playable strategy.
 */
export const exploitDisengage: PlayerPolicy = {
  name: 'P15_exploitDisengage',
  kind: 'exploit',
  disengagementIntended: true,
  description: 'EXPLOIT. Releases every contract after founding so the D-12 economy disengages (100%-of-gross lump, no overhead, no solvency gate). Measures the engagement cliff.',
  founding: { counts: MIN_ROSTER, rank: 'cheapest', termWeeks: TUNING.CONTRACT_MIN_WEEKS },
  roster: { ...DEFAULT_ROSTER_OPTIONS, renewAtWeeksRemaining: 0, refillCounts: null },
  decide(view, ctx) {
    // Shed contracts one per week (releaseTalent is ungated — A2 §7.1 — but each one costs
    // 50 % of the remaining guaranteed salary, so the order is cheapest-termination-first).
    if (view.contracts.length > 0) {
      const cheapest = [...view.contracts].sort(
        (a, b) =>
          a.terminationCostNow - b.terminationCostNow ||
          (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0),
      )[0]!
      return [{ kind: 'releaseTalent', talentId: cheapest.talentId }]
    }
    if (!slotFree(view)) return []
    const gen = ctx.packages({
      conceptCount: 1,
      shapeKeys: ['minDemand'],
      castPlans: ['cheapest'],
      negIndices: [0],
      marketingLevels: [400_000],
    })
    const pick = gen.packages[0] ?? null
    // No solvency gate exists on the disengaged path; commit unconditionally so the
    // exploit's true (unbounded) shape is measured rather than a harness-imposed limit.
    if (pick === null || !slotFree(view)) return []
    return [{ kind: 'greenlight', production: greenlightBody(pick) }]
  },
}

/** P16 — found a minimal roster, then take NO voluntary action ever again. */
export const doNothing: PlayerPolicy = {
  name: 'P16_doNothing',
  kind: 'player',
  // B2-C3: "never renews" MEANS the founding contracts lapse at week 208 and the economy
  // disengages. That is the baseline's definition, not a defect — so it declares it, and
  // the driver stops raising a cliff flag against it past the 208-week boundary.
  disengagementIntended: true,
  description: 'Founds a minimal roster then never greenlights, never renews, never signs. The pure decay baseline: end cash = INITIAL_CASH - horizon x weekly burn (until the founding contracts expire at week 208, after which it also disengages BY DESIGN).',
  founding: { counts: MIN_ROSTER, rank: 'cheapest', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  // renewAtWeeksRemaining 0 ⇒ no renewal. Any voluntary spend would break the arithmetic
  // identity that makes this a baseline, so "do nothing" is taken literally.
  roster: { ...DEFAULT_ROSTER_OPTIONS, renewAtWeeksRemaining: 0, refillCounts: null },
  decide() {
    return []
  },
}

export const PLAYER_POLICIES: readonly PlayerPolicy[] = [
  cheapestViable,
  conservativeStandard,
  standardCadence,
  premiumAmbitious,
  forecastProfitMax,
  forecastROIMax,
  starDriven,
  developmentFarm,
  freelancerLean,
  lowBurnWaiter,
  adaptiveBalanced,
  standardMinMkt,
  standardMaxMkt,
  exploitDisengage,
  doNothing,
]

export const ORACLE_POLICIES: readonly OraclePolicy[] = [oracleEV]

export const ALL_POLICIES: readonly Policy[] = [...PLAYER_POLICIES, ...ORACLE_POLICIES]

export function policyByName(name: string): Policy {
  const found = ALL_POLICIES.find((p) => p.name === name || p.name.split('_')[0] === name)
  if (found === undefined) {
    throw new Error(`d16/policies: unknown policy "${name}". Known: ${ALL_POLICIES.map((p) => p.name).join(', ')}`)
  }
  return found
}
