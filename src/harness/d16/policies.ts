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
import { activeMarketingGrid } from './packages.js'
import type {
  CastPlanKey,
  D16Package,
  GenerationResult,
  PackageEvaluation,
  PackageOptions,
} from './packages.js'
import { HEALTHY_RUNWAY_WEEKS } from './states.js'
import type { FinancialState } from './states.js'
import type { PublicityIntent, PublicityTier } from './publicity.js'

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

/**
 * D-17B: the publicity intent rides a SECOND return channel, not the `Action` union —
 * `Action` is a production type and must not grow a member for a lab experiment. The method
 * is OPTIONAL, so the sixteen D-16 policies are untouched source-wise (which is what keeps the
 * neutral arm byte-identical) and "absent ⇒ never publicizes" needs no per-policy declaration.
 */
export type PlayerPolicy = PolicyCommon & {
  /**
   * `adversary` is a D-17B label with the same effect `exploit` already has: the corpus's
   * player-only headline matrix keys on `kind === 'player'`, so an adversary arm is excluded
   * from it by construction rather than by a remembered convention (the B1-D9 pattern).
   */
  kind: 'player' | 'exploit' | 'adversary'
  decide(view: PlayerView, ctx: PlayerCtx): Action[]
  publicize?(view: PlayerView, ctx: PlayerCtx): PublicityIntent
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
  return view.activeProductions.length < TUNING.AGENT_MAX_SLATE
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

// ── D-17B lab fix · the marketing rungs a policy names are RUNGS, not dollars ─
//
// THE DEFECT (Stage-8 verdict #15). Seven policies wrote their marketing level as a DOLLAR
// LITERAL — P4/P7/P11/P13 `$1,000,000`, P12 `$100,000`, P9 `[$100k, $400k]`, P15 `$400k`.
// `generatePackages` honours an explicit `marketingLevels` option over the active grid
// (packages.ts:448), so under a swept menu those policies kept spending the SHIPPED numbers:
// bit-identical end cash, marketing levels and awareness on all 300 seeds of both the 208-wk
// and the 312-wk corpora, i.e. 6 of the 14 player arms were INERT to the treatment and 26.5%
// of all films were placed off-grid. Worse, the names stopped being true: under
// `capacity:1.3,2.4,3.7` the rungs can run to $405k/$748k/$1,153k, so "P12_standardMinMkt"
// at a flat $100k was no longer the minimum rung and "P13_standardMaxMkt" at $1M was not the
// maximum — the two controlled marketing probes measured a level that was not on the menu.
//
// THE FIX. A policy names a RUNG; the dollars come from `activeMarketingGrid()` at DECISION
// time (the driver opens the week's `withMarketingGrid` scope around `decide`, so a
// capacity-anchored menu is re-read every week — driver.ts:884).
//
// NEUTRAL-ARM IDENTITY. With no scope open the active grid IS the shipped triple
// [100k, 400k, 1M], so `lowRung()/midRung()/highRung()` return exactly the literals they
// replaced and every package id, cost and enumeration order is unchanged. Proven by the
// 300x208 neutral SHA gate, not by inspection.
const lowRung = (): number => activeMarketingGrid()[0]
const midRung = (): number => activeMarketingGrid()[1]
const highRung = (): number => activeMarketingGrid()[2]

/** The standard-package option set. A FUNCTION because the mid rung is resolved per decision. */
function standardOpts(): PackageOptions {
  return {
    conceptCount: 1,
    shapeKeys: ['neutralDemand'],
    castPlans: ['bestOVR'],
    negIndices: [1],
    marketingLevels: [midRung()],
  }
}

function standardWith(marketing: number, castPlan: CastPlanKey = 'bestOVR'): PackageOptions {
  return { ...standardOpts(), castPlans: [castPlan], marketingLevels: [marketing] }
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
  description: 'Best forecast-profit concept at 1.25x negative and the TOP marketing rung of the active grid ($1M on the shipped menu), cast with the highest-fame affordable lead.',
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
      marketingLevels: [highRung()],
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
  description: 'Roster and cast prioritise fame; standard 1.0x negative at the TOP marketing rung of the active grid ($1M on the shipped menu).',
  founding: { counts: SMALL_ROSTER, rank: 'highestFame', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'highestFame'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(highRung(), 'highestFame')))
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
      marketingLevels: [lowRung(), midRung()],
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
          marketingLevels: [highRung()],
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

/** P12 — P3 at the LOWEST rung of the active grid (controlled marketing probe). */
export const standardMinMkt: PlayerPolicy = {
  name: 'P12_standardMinMkt',
  kind: 'player',
  disengagementIntended: false,
  description: 'P3 cadence at the LOWEST marketing rung of the active grid ($100k on the shipped menu). Controlled marketing probe — the rung is resolved per decision, so the name stays true under a swept menu.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(lowRung())))
  },
}

/** P13 — P3 at the HIGHEST rung of the active grid (controlled marketing probe). */
export const standardMaxMkt: PlayerPolicy = {
  name: 'P13_standardMaxMkt',
  kind: 'player',
  disengagementIntended: false,
  description: 'P3 cadence at the HIGHEST marketing rung of the active grid ($1M on the shipped menu). Controlled marketing probe — the rung is resolved per decision, so the name stays true under a swept menu.',
  founding: { counts: SMALL_ROSTER, rank: 'bestOVR', termWeeks: TUNING.CONTRACT_MAX_WEEKS },
  roster: roster(SMALL_ROSTER, 'bestOVR'),
  decide(view, ctx) {
    const maint = maintenanceActions(view, this.roster)
    if (maint.length > 0) return maint
    return commit(view, ctx, ctx.standard(standardWith(highRung())))
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
 * P15 [HISTORICAL EXPLOIT PROBE] — attempts the pre-D-17A engagement cliff (A2 §7.2).
 * D-17A made the founded economy persistent, so releasing every contract no longer flips
 * `economyEngaged` false and no longer reaches the legacy D-1 lump-sum economy. The policy stays
 * registered under its historical name as a regression probe: production-mode evidence must
 * show that the old exploit is closed, never silently describe it as a live payoff arm.
 */
export const exploitDisengage: PlayerPolicy = {
  name: 'P15_exploitDisengage',
  kind: 'exploit',
  disengagementIntended: true,
  description: 'HISTORICAL EXPLOIT PROBE. Releases every contract after founding; D-17A persistence must keep the founded economy engaged and close the former 100%-of-gross cliff.',
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
      marketingLevels: [midRung()],
    })
    const pick = gen.packages[0] ?? null
    // Commit unconditionally to keep probing the historical exploit boundary. In production
    // mode the persisted founded regime still applies the real solvency gate, so rejections are
    // expected evidence that D-17A closed the cliff.
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

/**
 * THE D-16 MENU — exactly the sixteen. `--policies all` resolves to THIS list, so the D-17B
 * publicity arms below can never silently enter a d17a-comparable corpus (and the neutral-arm
 * SHA gate cannot be broken by adding an arm).
 */
export const ALL_POLICIES: readonly Policy[] = [...PLAYER_POLICIES, ...ORACLE_POLICIES]

// ── D-17B · the eight publicity policies (A4 §3.2) ───────────────────────────
//
// Every one is a HOST policy spread + an overridden `publicize`, so the greenlight behaviour
// is provably identical to its host (Q0 is the control that proves it). Every rule reads only
// `PlayerView`/`PlayerCtx` — `view.standing.audienceAwareness` is already player-visible
// (`view.ts` copies the whole `Standing`), and tier availability comes from the §2.4 panel,
// which is itself built from player-caused facts.
//
// THE GATE THIS SET ENFORCES (R9's "must avoid" list, made falsifiable): if Q7 (adversary)
// beats Q0 (never) on the paired-seed player matrix, or if Q4/Q7's endCash win-share exceeds
// Q1/Q3's, the mechanic IS upkeep-spam and the candidate constants are rejected. Q6-vs-Q0
// action count is the "mandatory weekly clicking" metric.

/** Cheapest tier the panel reports as AVAILABLE right now (cost order, deterministic). */
function cheapestAvailableTier(view: PlayerView): PublicityTier | null {
  const panel = view.publicity
  if (panel === null) return null
  const open = panel.tiers.filter((t) => t.available)
  if (open.length === 0) return null
  let best = open[0]!
  for (const t of open) if (t.cost < best.cost || (t.cost === best.cost && t.tier < best.tier)) best = t
  return best.tier
}

/** Most expensive tier the panel reports as AVAILABLE right now. */
function richestAvailableTier(view: PlayerView): PublicityTier | null {
  const panel = view.publicity
  if (panel === null) return null
  const open = panel.tiers.filter((t) => t.available)
  if (open.length === 0) return null
  let best = open[0]!
  for (const t of open) if (t.cost > best.cost || (t.cost === best.cost && t.tier < best.tier)) best = t
  return best.tier
}

/** Is a release within `k` weeks? `remainingTicks` is player-visible (view.ts:371-378). */
function releaseWithin(view: PlayerView, k: number): boolean {
  return view.activeProductions.some((p) => p.remainingTicks >= 1 && p.remainingTicks <= k)
}

const LOW_AWARENESS = 15
const BAND_LO = 20
const BAND_HI = 45

/** Q0 — the CONTROL. Never publicizes, so it must reproduce its host P3 exactly. */
export const neverPublicize: PlayerPolicy = {
  ...standardCadence,
  name: 'Q0_neverPublicize',
  description:
    'CONTROL. P3 cadence, publicity enabled but never used — the arm that proves the publicity plumbing changes nothing when no intent is returned.',
  publicize() {
    return null
  },
}

/** Q1 — buy the cheapest available tier whenever the stock is low and it is affordable. */
export const publicizeAtLowAwareness: PlayerPolicy = {
  ...standardCadence,
  name: 'Q1_publicizeAtLowAwareness',
  description:
    'P3 cadence plus the cheapest AVAILABLE publicity tier whenever audience awareness is below 15. The "top up a collapsing stock" arm.',
  publicize(view) {
    if (view.standing.audienceAwareness >= LOW_AWARENESS) return null
    const tier = cheapestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/** Q2 — a campaign timed to the release, not to the calendar. */
export const publicizeBeforeEveryRelease: PlayerPolicy = {
  ...standardCadence,
  name: 'Q2_publicizeBeforeEveryRelease',
  description:
    'P3 cadence plus a `push` campaign in the 1–2 weeks before each release (PRODUCTION_TICKS = 8, so remainingTicks in {1,2}). Tests R9’s "strategically timed".',
  publicize(view) {
    if (!releaseWithin(view, 2)) return null
    const panel = view.publicity
    if (panel === null) return null
    const push = panel.tiers.find((t) => t.tier === 'push')
    return push !== undefined && push.available ? { tier: 'push' } : null
  },
}

/**
 * Q3 — the ROI-disciplined arm, on a HONESTLY DOCUMENTED PROXY (Lesson AC).
 *
 * The rule we WANTED — "buy iff the player-visible forecast improves by more than the cost" —
 * is NOT computable from `PlayerCtx`: `ctx.evaluate` reads the LIVE state, so there is no way
 * to re-evaluate a package at a hypothetical post-publicity awareness without handing the
 * policy the state. Rather than ship a lookalike, this arm buys only when the spend is
 * SOLVENCY-SAFE (post-commitment runway on its own best package still clears the classifier's
 * healthy threshold), USEFUL (awareness is low) and TIMED (a release is ≤ 2 weeks out).
 */
export const publicityROIDisciplined: PlayerPolicy = {
  ...forecastProfitMax,
  name: 'Q3_publicityROIDisciplined',
  description:
    'P5 scan plus publicity bought ONLY when it is solvency-safe (post-commitment runway >= the healthy threshold), useful (awareness < 15) and timed (release <= 2 weeks out). Documented PROXY for the uncomputable forecast-delta rule.',
  publicize(view, ctx) {
    if (view.standing.audienceAwareness >= LOW_AWARENESS) return null
    if (!releaseWithin(view, 2)) return null
    const gen = ctx.packages()
    const best = bestAffordable(ctx, gen.packages, (p) => ctx.evaluate(p).centerProfit)
    if (best === null) return null
    const post = ctx.preview(best).postRunway
    if (post.weeks !== null && post.weeks < HEALTHY_RUNWAY_WEEKS) return null
    const tier = cheapestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/** Q4 — the upper bound on spend: the richest available tier, every week it is affordable. */
export const maximumPublicity: PlayerPolicy = {
  ...standardCadence,
  name: 'Q4_maximumPublicity',
  description:
    'P3 cadence plus the most expensive AVAILABLE publicity tier whenever it is affordable, regardless of state. The spend upper bound.',
  publicize(view) {
    const tier = richestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/** Q5 — publicity as a distress lever. Tests R9's "useful but not sufficient in distress". */
export const emergencyPublicity: PlayerPolicy = {
  ...standardCadence,
  name: 'Q5_emergencyPublicity',
  description:
    'P3 cadence plus the cheapest AVAILABLE tier ONLY while the financial classifier reports bareMinOnly or noProduction. Tests whether publicity is useful, and not sufficient, in distress.',
  publicize(view, ctx) {
    const fs = ctx.financialState()
    if (fs !== 'bareMinOnly' && fs !== 'noProduction') return null
    const tier = cheapestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/** Q6 — keep the stock inside a band. The direct anti-"mandatory weekly clicking" probe. */
export const awarenessMaintenance: PlayerPolicy = {
  ...standardCadence,
  name: 'Q6_awarenessMaintenance',
  description:
    'P3 cadence plus band maintenance: buy the cheapest AVAILABLE tier below awareness 20, never above 45. Its purchase COUNT against Q0 is the "mandatory weekly clicking" metric.',
  publicize(view) {
    const a = view.standing.audienceAwareness
    // THE BAND: top up below `lo`, and never buy above `hi`. `lo < hi`, so the upper guard is
    // structurally implied — it is written out because it IS the rule R9 must be tested
    // against, and a future `lo` change must not silently delete it.
    if (a >= BAND_LO || a > BAND_HI) return null
    const tier = cheapestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/**
 * Q7 [ADVERSARY] — buy the cheapest tier every single week the cooldown allows, ignoring
 * state. If this arm WINS, the mechanic is upkeep spam and the constants are rejected.
 * `kind: 'adversary'` keeps it out of the player headline matrix by construction.
 */
export const publicitySpamAdversary: PlayerPolicy = {
  ...standardCadence,
  name: 'Q7_publicitySpamAdversary',
  kind: 'adversary',
  description:
    'ADVERSARY. P3 cadence plus the cheapest AVAILABLE tier EVERY week the cooldown allows, ignoring awareness, runway and timing. The upkeep-spam falsification arm — if it wins, the candidate constants are rejected.',
  publicize(view) {
    const tier = cheapestAvailableTier(view)
    return tier === null ? null : { tier }
  },
}

/** The eight D-17B publicity arms. NOT part of `ALL_POLICIES` (see the note there). */
export const PUBLICITY_POLICIES: readonly PlayerPolicy[] = [
  neverPublicize,
  publicizeAtLowAwareness,
  publicizeBeforeEveryRelease,
  publicityROIDisciplined,
  maximumPublicity,
  emergencyPublicity,
  awarenessMaintenance,
  publicitySpamAdversary,
]

/** Every policy `policyByName` can resolve: the D-16 sixteen plus the D-17B eight. */
export const ALL_KNOWN_POLICIES: readonly Policy[] = [...ALL_POLICIES, ...PUBLICITY_POLICIES]

export function policyByName(name: string): Policy {
  const found = ALL_KNOWN_POLICIES.find((p) => p.name === name || p.name.split('_')[0] === name)
  if (found === undefined) {
    throw new Error(
      `d16/policies: unknown policy "${name}". Known: ${ALL_KNOWN_POLICIES.map((p) => p.name).join(', ')}`,
    )
  }
  return found
}
