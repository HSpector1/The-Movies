// ── D-17B · PAID PUBLICITY SHIM ──────────────────────────────────────────────
// ANALYSIS ONLY. Never imported by src/core/** or ui/src/**.
//
// WHAT THIS IS. R9's paid-publicity leg: an explicit, costly, bounded action that buys
// audience awareness, so the mean-reverting pair (paid inflow + passive loss) has an INFLOW
// at all. A1 sizes the target: publicity must deliver > 3.2 awareness points per 9-week cycle
// at N = 0.58 (≈ 1.3–1.8 at N = 0.45) for recovery from a 0 stock to exist at all.
//
// THE LEDGER CARRIER — MEASURED, AND BLESSED BY THE PHASE-A GATE (A4 F7, ruling 1).
// One entry per purchase:
//     { week, kind: 'termination', amount: -cost, note: `d17b-publicity:<tier>` }
// with NO `productionId` and NO `talentId`, and cash moved by EXACTLY `-cost` in the same
// object rewrite. Measured consequences on a real 60-week P3 state (8 runs, field-level diff):
//   • reconciliation holds, and the NEXT tick still reconciles;
//   • ZERO allocator fields move — R7's cycle-inclusive break-even is untouched;
//   • exactly 6 recap fields move, all pure cash;
//   • per-film `committedCost`/`contribution` in `PlayerView` are unchanged.
// Rejected alternatives, all measured: `production`/`freelancerFee` move
// `summary.totalFilmContribution` + `capital.totalCommitments` even with no `productionId`;
// `overhead`/`payroll` re-allocate the spend onto films (`fixedCostAllocation.ts:134`) and
// THROW on a non-integer amount (`:136-139`); `signingBonus` is numerically clean but COLLIDES
// with every policy's renewal rows, so `ledgerTotals.signingBonus` would mix the two.
//
// DISCIPLINE. Analysis keys on the NOTE PREFIX, never on the kind alone (`termination` is a
// real engine kind and P15-style policies could in principle write one). Costs are INTEGER
// dollars — not required by `termination`, but it keeps the door open to re-classifying the
// kind later without hitting the allocator's integer guard.
//
// EFFECT SHAPE (R9: diminishing, bounded, costly, useful-but-not-sufficient). Two diminishing
// mechanisms, deliberately separate so they can be studied apart:
//   • STOCK dependence: lift = maxLift · (1 − A/saturation)^shapeExp  — buying awareness you
//     already have is worthless, and lift is exactly 0 at A = saturation (default 100);
//   • REPETITION dependence: a per-tier cooldown plus a global anti-spam cooldown.
// `durationWeeks > 0` spreads the lift linearly over N weeks (a campaign, not a switch).

import type { GameState, LedgerEntry } from '../../core/index.js'

export const PUBLICITY_NOTE_PREFIX = 'd17b-publicity:'

export type PublicityTier = 'whisper' | 'push' | 'blitz'

export const PUBLICITY_TIERS: readonly PublicityTier[] = ['whisper', 'push', 'blitz'] as const

export type PublicityTierConfig = {
  /** cash, immediate, INTEGER dollars. */
  cost: number
  /** awareness points delivered at ZERO current awareness. */
  maxLift: number
  /** the awareness at which lift reaches exactly 0 (default 100 — the engine ceiling). */
  saturation: number
  /** diminishing exponent in the STOCK. 1 = linear fade, >1 = fades late, <1 = fades early. */
  shapeExp: number
  /** 0 = instant; N > 0 delivers the lift in N equal weekly parts. */
  durationWeeks: number
  /** weeks before THIS tier may be bought again. */
  cooldownWeeks: number
}

export type PublicityConfig = {
  tiers: Record<PublicityTier, PublicityTierConfig>
  /** anti-spam cooldown across ALL tiers. */
  globalCooldownWeeks: number
  /** optional hard per-run budget (the adversary study's control). */
  perRunCap?: number
}

/**
 * The lab's default menu. Calibrated against A1's sizing (a `push` at A = 0 delivers 4.0
 * points, i.e. > 3.2 per 9-week cycle) and A4 F5 (68 % of P3 runs reach the 0 floor, so the
 * cheapest rung must be affordable to a distressed studio: $60k is under one week of overhead).
 * SWEEPABLE — Stage 1/2 select the real constants; these are a starting point, not a ruling.
 */
export const DEFAULT_PUBLICITY: PublicityConfig = {
  tiers: {
    whisper: { cost: 60_000, maxLift: 1.5, saturation: 100, shapeExp: 1, durationWeeks: 0, cooldownWeeks: 4 },
    push: { cost: 250_000, maxLift: 4, saturation: 100, shapeExp: 1, durationWeeks: 0, cooldownWeeks: 8 },
    blitz: { cost: 900_000, maxLift: 10, saturation: 100, shapeExp: 1, durationWeeks: 3, cooldownWeeks: 16 },
  },
  globalCooldownWeeks: 2,
}

/** A pending campaign leg (`durationWeeks > 0`): `weeks` more payments of `perWeek` points. */
export type PublicityPending = { tier: PublicityTier; perWeek: number; weeksRemaining: number }

export type PublicityMemo = {
  count: number
  spend: number
  byTier: Record<PublicityTier, number>
  spendByTier: Record<PublicityTier, number>
  lastWeek: number | null
  firstWeek: number | null
  lastWeekByTier: Record<PublicityTier, number | null>
  /** weeks-since-last-release at each purchase — R9's "strategically timed" evidence. */
  weeksSinceReleaseAtBuy: number[]
  blockedByCooldown: number
  blockedByCash: number
  blockedByCap: number
  /** awareness points actually delivered (post-clamp), the honest denominator for $/point. */
  liftDelivered: number
  pending: PublicityPending[]
}

export function newPublicityMemo(): PublicityMemo {
  return {
    count: 0,
    spend: 0,
    byTier: { whisper: 0, push: 0, blitz: 0 },
    spendByTier: { whisper: 0, push: 0, blitz: 0 },
    lastWeek: null,
    firstWeek: null,
    lastWeekByTier: { whisper: null, push: null, blitz: null },
    weeksSinceReleaseAtBuy: [],
    blockedByCooldown: 0,
    blockedByCash: 0,
    blockedByCap: 0,
    liftDelivered: 0,
    pending: [],
  }
}

/** Reject a menu that could not mean what it says. */
export function validatePublicity(cfg: PublicityConfig): void {
  const problems: string[] = []
  if (!(cfg.globalCooldownWeeks >= 0)) problems.push('globalCooldownWeeks must be >= 0')
  if (cfg.perRunCap !== undefined && !(cfg.perRunCap >= 0)) problems.push('perRunCap must be >= 0')
  for (const tier of PUBLICITY_TIERS) {
    const t = cfg.tiers[tier]
    if (t === undefined) {
      problems.push(`tier ${tier} is missing`)
      continue
    }
    if (!Number.isInteger(t.cost) || t.cost < 0) {
      problems.push(`${tier}.cost must be a non-negative INTEGER dollar amount (got ${String(t.cost)})`)
    }
    if (!(t.maxLift >= 0)) problems.push(`${tier}.maxLift must be >= 0`)
    if (!(t.saturation > 0 && t.saturation <= 100)) problems.push(`${tier}.saturation must be in (0,100]`)
    if (!(t.shapeExp > 0)) problems.push(`${tier}.shapeExp must be > 0`)
    if (!Number.isInteger(t.durationWeeks) || t.durationWeeks < 0) {
      problems.push(`${tier}.durationWeeks must be a non-negative integer`)
    }
    if (!Number.isInteger(t.cooldownWeeks) || t.cooldownWeeks < 0) {
      problems.push(`${tier}.cooldownWeeks must be a non-negative integer`)
    }
  }
  if (problems.length > 0) throw new Error(`d17b/publicity: rejected config — ${problems.join(' | ')}`)
}

/**
 * The TOTAL awareness points a purchase at this tier buys, given the CURRENT stock.
 * Diminishing in the stock, bounded by `maxLift`, exactly 0 at `saturation`.
 */
export function publicityLift(cfg: PublicityConfig, tier: PublicityTier, awareness: number): number {
  const t = cfg.tiers[tier]
  const headroom = Math.max(0, 1 - Math.max(0, awareness) / t.saturation)
  return t.maxLift * Math.pow(headroom, t.shapeExp)
}

export type PublicityBlock = 'cooldown' | 'cash' | 'cap'
export type PublicityAvailability = { ok: true } | { ok: false; reason: PublicityBlock; cooldownRemaining: number }

/** Weeks before `tier` may be bought again (per-tier AND the global anti-spam cooldown). */
export function cooldownRemaining(
  cfg: PublicityConfig,
  memo: PublicityMemo,
  tier: PublicityTier,
  week: number,
): number {
  const last = memo.lastWeekByTier[tier]
  const perTier = last === null ? 0 : Math.max(0, last + cfg.tiers[tier].cooldownWeeks - week)
  const global = memo.lastWeek === null ? 0 : Math.max(0, memo.lastWeek + cfg.globalCooldownWeeks - week)
  return Math.max(perTier, global)
}

/**
 * May the studio buy this tier RIGHT NOW? Affordability is `cash − cost >= 0` — the same rule
 * `canAfford` enforces for every other voluntary commitment (Lesson AC: never a lookalike).
 */
export function publicityAvailable(
  cfg: PublicityConfig,
  memo: PublicityMemo,
  tier: PublicityTier,
  week: number,
  cash: number,
): PublicityAvailability {
  const cd = cooldownRemaining(cfg, memo, tier, week)
  if (cd > 0) return { ok: false, reason: 'cooldown', cooldownRemaining: cd }
  const cost = cfg.tiers[tier].cost
  if (cfg.perRunCap !== undefined && memo.spend + cost > cfg.perRunCap) {
    return { ok: false, reason: 'cap', cooldownRemaining: 0 }
  }
  if (cash - cost < 0) return { ok: false, reason: 'cash', cooldownRemaining: 0 }
  return { ok: true }
}

/** The intent a policy returns. `null` ⇒ buy nothing this week (the default for all 16). */
export type PublicityIntent = { tier: PublicityTier } | null

const clamp = (x: number, lo: number, hi: number): number => (x < lo ? lo : x > hi ? hi : x)

function withAwarenessAndCash(state: GameState, awareness: number, cash: number, entry: LedgerEntry | null): GameState {
  return {
    ...state,
    studio: {
      ...state.studio,
      cash,
      standing: { ...state.studio.standing, audienceAwareness: awareness },
    },
    ledger: entry === null ? state.ledger : [...state.ledger, entry],
  }
}

export type PublicityStep = {
  state: GameState
  memo: PublicityMemo
  /** the tier actually bought this week (null when nothing was). */
  bought: PublicityTier | null
  /** the ledger row written this week, for the driver's note-sum self-check. */
  entry: LedgerEntry | null
  /** awareness points delivered this week (purchase + any pending campaign legs). */
  liftThisWeek: number
}

/**
 * ONE WEEK of publicity: deliver any pending campaign legs, then attempt the intent.
 *
 * Applied by the driver BEFORE `tick` and AFTER the engine actions, so a publicity spend
 * competes for exactly the cash the greenlight gate already saw.
 *
 * Cash and the ledger move TOGETHER in a single object rewrite — the pairing the
 * reconciliation invariant depends on (a mismatched pair perturbed 71–74 recap fields in the
 * deliberately-unreconciled A4 probe row).
 */
export function applyPublicity(
  state: GameState,
  intent: PublicityIntent,
  cfg: PublicityConfig,
  memo: PublicityMemo,
  ctx: { week: number; weeksSinceRelease: number },
): PublicityStep {
  let awareness = state.studio.standing.audienceAwareness
  let cash = state.studio.cash
  let next: PublicityMemo = memo
  let liftThisWeek = 0

  // ── pending campaign legs (durationWeeks > 0) ──
  if (memo.pending.length > 0) {
    const stillPending: PublicityPending[] = []
    let delivered = 0
    for (const p of memo.pending) {
      const before = awareness
      awareness = clamp(awareness + p.perWeek, 0, 100)
      delivered += awareness - before
      if (p.weeksRemaining > 1) stillPending.push({ ...p, weeksRemaining: p.weeksRemaining - 1 })
    }
    liftThisWeek += delivered
    next = { ...next, pending: stillPending, liftDelivered: next.liftDelivered + delivered }
  }

  if (intent === null) {
    const s = liftThisWeek === 0 ? state : withAwarenessAndCash(state, awareness, cash, null)
    return { state: s, memo: next, bought: null, entry: null, liftThisWeek }
  }

  const tier = intent.tier
  const avail = publicityAvailable(cfg, next, tier, ctx.week, cash)
  if (!avail.ok) {
    next = {
      ...next,
      blockedByCooldown: next.blockedByCooldown + (avail.reason === 'cooldown' ? 1 : 0),
      blockedByCash: next.blockedByCash + (avail.reason === 'cash' ? 1 : 0),
      blockedByCap: next.blockedByCap + (avail.reason === 'cap' ? 1 : 0),
    }
    const s = liftThisWeek === 0 ? state : withAwarenessAndCash(state, awareness, cash, null)
    return { state: s, memo: next, bought: null, entry: null, liftThisWeek }
  }

  const t = cfg.tiers[tier]
  const total = publicityLift(cfg, tier, awareness)
  let pending = next.pending
  if (t.durationWeeks > 0) {
    pending = [...pending, { tier, perWeek: total / t.durationWeeks, weeksRemaining: t.durationWeeks }]
  } else {
    const before = awareness
    awareness = clamp(awareness + total, 0, 100)
    liftThisWeek += awareness - before
  }

  cash -= t.cost
  const entry: LedgerEntry = {
    week: ctx.week,
    kind: 'termination',
    amount: -t.cost,
    note: `${PUBLICITY_NOTE_PREFIX}${tier}`,
  }

  next = {
    ...next,
    count: next.count + 1,
    spend: next.spend + t.cost,
    byTier: { ...next.byTier, [tier]: next.byTier[tier] + 1 },
    spendByTier: { ...next.spendByTier, [tier]: next.spendByTier[tier] + t.cost },
    lastWeek: ctx.week,
    firstWeek: next.firstWeek ?? ctx.week,
    lastWeekByTier: { ...next.lastWeekByTier, [tier]: ctx.week },
    weeksSinceReleaseAtBuy: [...next.weeksSinceReleaseAtBuy, ctx.weeksSinceRelease],
    liftDelivered: next.liftDelivered + (t.durationWeeks > 0 ? 0 : liftThisWeek),
    pending,
  }

  return {
    state: withAwarenessAndCash(state, awareness, cash, entry),
    memo: next,
    bought: tier,
    entry,
    liftThisWeek,
  }
}

/** Σ of every ledger row whose note carries the publicity prefix (the driver's self-check). */
export function publicitySpendFromLedger(state: GameState): number {
  let acc = 0
  for (const e of state.ledger) {
    if (e.note.startsWith(PUBLICITY_NOTE_PREFIX)) acc += -e.amount
  }
  return acc
}

/**
 * The artifact stamp (Lesson BH). `undefined` when publicity is off, so the field is ABSENT —
 * never `null` — in the neutral arm.
 */
export function publicityKey(cfg: PublicityConfig | undefined): string | undefined {
  if (cfg === undefined) return undefined
  const tiers = PUBLICITY_TIERS.map((t) => {
    const c = cfg.tiers[t]
    return `${t}=${String(c.cost)}/${String(c.maxLift)}/exp${String(c.shapeExp)}/dur${String(c.durationWeeks)}/cd${String(c.cooldownWeeks)}`
  })
  const cap = cfg.perRunCap === undefined ? '' : `;cap=${String(cfg.perRunCap)}`
  return `${tiers.join(';')};gcd=${String(cfg.globalCooldownWeeks)}${cap}`
}
