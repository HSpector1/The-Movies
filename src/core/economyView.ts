// ── D-12 financial read models (economyView.ts) ───────────────────────────────
// The SINGLE source of every money figure the UI shows. Pure, deterministic, no
// React / DOM / RNG. Each figure MIRRORS the exact engine math — tick.ts step 3.5
// (weekly theatrical revenue), step 7.5 (overhead), employment payroll, the D-12.11
// solvency gate, and the D-12.16 "current commitments only" runway — so the dashboard
// NEVER reinvents a formula. Unit = whole dollars (the engine's unit). The sim never
// reads any of these; they are display-only, exactly like talentSummary / filmPackage.

import type { GameState, GameStateV3, TheatricalRun, LedgerKind } from './types.js'
import { TUNING } from './tuning.js'
import { economyEngaged, weeklyPayroll, canAfford, type Affordability } from './employment.js'

const EPS = 1e-9

// ── weekly cost side ──────────────────────────────────────────────────────────

// Weekly overhead the engine debits at tick step 7.5 — mirrors tick.ts:403-404 EXACTLY
// (base + per-contract; gated on engaged && founded). Zero pre-founding / when not engaged.
export function weeklyOverhead(state: GameStateV3): number {
  if (!economyEngaged(state) || state.founding !== null) return 0
  return TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length
}

// Current weekly burn under EXISTING commitments ONLY: payroll + overhead. A production's
// negative + marketing are ONE-TIME debits paid at greenlight (already reflected in cash),
// never a recurring weekly cost — so they are deliberately NOT in weekly burn (D-12.16).
export function weeklyBurn(state: GameState): number {
  return weeklyPayroll(state) + weeklyOverhead(state)
}

// ── active-run revenue side ────────────────────────────────────────────────────

// Studio Revenue an ACTIVE run pays NEXT tick (current weekIndex's gross × locked share).
// Mirrors tick.ts:311-312. Zero for completed / legacy runs.
export function runNextWeekRevenue(run: TheatricalRun): number {
  if (run.status !== 'active') return 0
  return (run.weeklyGross[run.weekIndex] ?? 0) * run.studioShare
}

// Studio Revenue REMAINING across all not-yet-credited weeks of an active run.
export function runRemainingRevenue(run: TheatricalRun): number {
  if (run.status !== 'active') return 0
  let rem = 0
  for (let w = run.weekIndex; w < run.totalWeeks; w++) rem += (run.weeklyGross[w] ?? 0) * run.studioShare
  return rem
}

// Σ next-week Studio Revenue across ALL already-active runs (feeds runway, D-12.16).
export function expectedWeeklyRunRevenue(state: GameState): number {
  return state.theatricalRuns.reduce((s, r) => s + runNextWeekRevenue(r), 0)
}

// Σ remaining Studio Revenue across ALL active runs (future cash already "in the pipe").
export function pipelineRunRevenue(state: GameState): number {
  return state.theatricalRuns.reduce((s, r) => s + runRemainingRevenue(r), 0)
}

// ── runway (D-12.16 — CURRENT COMMITMENTS ONLY) ────────────────────────────────

export type Runway = {
  netWeeklyCash: number // signed: activeRunRevenue − burn (positive = earning)
  weeks: number | null // null = net-cash-positive → "—"
  infinite: boolean
}

// "How long can the studio survive under its CURRENT commitments?" NEVER reserves cash
// for a hypothetical future greenlight. weeks = ⌊cash / max(ε, burn − activeRunRevenue)⌋.
// Net-cash-positive (revenue ≥ burn) → infinite (weeks null; UI shows "—").
export function runway(state: GameState): Runway {
  const burn = weeklyBurn(state)
  const rev = expectedWeeklyRunRevenue(state)
  const net = burn - rev
  const netWeeklyCash = rev - burn
  if (net <= EPS) return { netWeeklyCash, weeks: null, infinite: true }
  return { netWeeklyCash, weeks: Math.floor(state.studio.cash / net), infinite: false }
}

// ── affordability + post-commitment preview (D-12.11 / D-12.16) ────────────────

// One affordability helper the UI reads (delegates to the engine's authoritative gate).
export function affordability(state: GameStateV3, amount: number): Affordability {
  return canAfford(state, amount)
}

export type CommitmentPreview = {
  amount: number // the immediate voluntary commitment (negative + marketing + committed fees)
  cashBefore: number
  cashAfter: number // cash − amount (may be shown even when blocked, for the reason)
  affordable: boolean
  reason?: string // the SAME reason the engine returns on rejection
  postWeeklyBurn: number // burn AFTER the commitment (unchanged — production is one-time)
  postRunway: Runway // runway after paying the commitment NOW (cash reduced, burn/rev same)
}

// The Release Strategy screen's "post-greenlight picture" (D-12.16): what the proposed
// production + marketing commitment does to cash and runway, and whether it passes the gate.
// Weekly burn is UNCHANGED by a greenlight (production cost is one-time; contracted payroll
// and overhead do not move; freelancer fees are one-time and already inside `amount`).
export function commitmentPreview(state: GameState, amount: number): CommitmentPreview {
  const aff = canAfford(state, amount)
  const cashAfter = state.studio.cash - amount
  const burn = weeklyBurn(state)
  const rev = expectedWeeklyRunRevenue(state)
  const net = burn - rev
  const postRunway: Runway =
    net <= EPS
      ? { netWeeklyCash: rev - burn, weeks: null, infinite: true }
      : { netWeeklyCash: rev - burn, weeks: Math.floor(Math.max(0, cashAfter) / net), infinite: false }
  return {
    amount,
    cashBefore: state.studio.cash,
    cashAfter,
    affordable: aff.ok,
    ...(aff.ok ? {} : { reason: aff.reason }),
    postWeeklyBurn: burn,
    postRunway,
  }
}

// ── break-even ──────────────────────────────────────────────────────────────────

// Break-even THEATRICAL GROSS for a film: Studio Revenue = share × gross, so the gross
// that returns the committed cost is cost / share. With the blended 0.52 share a film must
// gross ≈ 1.92× its committed cost to break even (the studio keeps only its rental share).
export function breakEvenGross(committedCost: number, studioShare: number = TUNING.STUDIO_RENTAL_BLENDED): number {
  return committedCost / Math.max(EPS, studioShare)
}

// ── per-run financial view ──────────────────────────────────────────────────────

export type RunView = {
  productionId: string
  conceptId: string
  status: TheatricalRun['status']
  weekIndex: number
  totalWeeks: number
  releaseTick: number
  completionTick: number // tick at which the final week is credited (release + totalWeeks − 1)
  studioShare: number
  totalGross: number // Σ weeklyGross (= opening×legs for D-12 runs)
  grossPaid: number
  studioRevenuePaid: number
  nextWeekRevenue: number
  remainingRevenue: number
  totalStudioRevenue: number // share × totalGross (paid + remaining), what the run will yield
}

export function runView(run: TheatricalRun): RunView {
  const totalGross = run.weeklyGross.reduce((a, b) => a + b, 0)
  return {
    productionId: run.productionId,
    conceptId: run.conceptId,
    status: run.status,
    weekIndex: run.weekIndex,
    totalWeeks: run.totalWeeks,
    releaseTick: run.releaseTick,
    completionTick: run.releaseTick + run.totalWeeks - 1,
    studioShare: run.studioShare,
    totalGross,
    grossPaid: run.cumulativeGrossPaid,
    studioRevenuePaid: run.cumulativeStudioRevenuePaid,
    nextWeekRevenue: runNextWeekRevenue(run),
    remainingRevenue: runRemainingRevenue(run),
    totalStudioRevenue: totalGross * run.studioShare,
  }
}

export function activeRunViews(state: GameState): RunView[] {
  return state.theatricalRuns.filter((r) => r.status === 'active').map(runView)
}

// ── ledger aggregation (gross / StudioRevenue / cost / marketing / payroll / overhead) ─

export type FinanceTotals = {
  studioRevenue: number // Σ D-12 weekly Studio Revenue receipts
  boxOfficeLump: number // Σ legacy single-lump box office (M0A / migrated path)
  production: number // Σ production debits (negative + marketing), stored negative
  payroll: number
  overhead: number
  signingBonus: number
  freelancerFee: number
  termination: number
  net: number // Σ all ledger amounts (= cash − INITIAL_CASH; reconciliation invariant)
}

const ZERO_TOTALS = (): FinanceTotals => ({
  studioRevenue: 0,
  boxOfficeLump: 0,
  production: 0,
  payroll: 0,
  overhead: 0,
  signingBonus: 0,
  freelancerFee: 0,
  termination: 0,
  net: 0,
})

const KIND_FIELD: Record<LedgerKind, keyof FinanceTotals> = {
  studioRevenue: 'studioRevenue',
  boxOffice: 'boxOfficeLump',
  production: 'production',
  payroll: 'payroll',
  overhead: 'overhead',
  signingBonus: 'signingBonus',
  freelancerFee: 'freelancerFee',
  termination: 'termination',
}

// Aggregate the whole signed ledger by kind. `net` is the reconciliation total.
export function financeTotals(state: GameState): FinanceTotals {
  const t = ZERO_TOTALS()
  for (const e of state.ledger) {
    t[KIND_FIELD[e.kind]] += e.amount
    t.net += e.amount
  }
  return t
}

// ── period summary (Advance Week + Sim-to-Next-Event report; D-12.18) ──────────

export type PeriodSummary = {
  fromWeek: number
  toWeekInclusive: number
  weeks: number
  payroll: number
  overhead: number
  studioRevenue: number
  boxOfficeLump: number
  production: number
  otherCash: number // signingBonus + freelancerFee + termination
  netCash: number // signed Σ over the window
  releases: number // runs opened in the window
  completedRuns: number // runs whose final week credited in the window
}

// Summarize every ledger movement whose `week` ∈ [fromWeek, toWeekInclusive], plus the
// release / run-completion counts derived from theatricalRuns' release + completion ticks.
export function periodSummary(state: GameState, fromWeek: number, toWeekInclusive: number): PeriodSummary {
  const s: PeriodSummary = {
    fromWeek,
    toWeekInclusive,
    weeks: Math.max(0, toWeekInclusive - fromWeek + 1),
    payroll: 0,
    overhead: 0,
    studioRevenue: 0,
    boxOfficeLump: 0,
    production: 0,
    otherCash: 0,
    netCash: 0,
    releases: 0,
    completedRuns: 0,
  }
  for (const e of state.ledger) {
    if (e.week < fromWeek || e.week > toWeekInclusive) continue
    s.netCash += e.amount
    switch (e.kind) {
      case 'payroll':
        s.payroll += e.amount
        break
      case 'overhead':
        s.overhead += e.amount
        break
      case 'studioRevenue':
        s.studioRevenue += e.amount
        break
      case 'boxOffice':
        s.boxOfficeLump += e.amount
        break
      case 'production':
        s.production += e.amount
        break
      default:
        s.otherCash += e.amount
    }
  }
  for (const r of state.theatricalRuns) {
    if (r.releaseTick >= fromWeek && r.releaseTick <= toWeekInclusive) s.releases += 1
    const completionTick = r.releaseTick + r.totalWeeks - 1
    if (r.status === 'completed' && completionTick >= fromWeek && completionTick <= toWeekInclusive) s.completedRuns += 1
  }
  return s
}

// ── dashboard finances card (the one aggregate the Dashboard reads) ────────────

export type FinanceView = {
  cash: number
  weeklyPayroll: number
  weeklyOverhead: number
  weeklyBurn: number
  expectedWeeklyRunRevenue: number
  netWeeklyCash: number // activeRunRevenue − burn
  runway: Runway
  activeRuns: number
  pipelineRunRevenue: number // remaining Studio Revenue across active runs
  totals: FinanceTotals
}

export function financeView(state: GameState): FinanceView {
  const payroll = weeklyPayroll(state)
  const overhead = weeklyOverhead(state)
  const burn = payroll + overhead
  const rev = expectedWeeklyRunRevenue(state)
  return {
    cash: state.studio.cash,
    weeklyPayroll: payroll,
    weeklyOverhead: overhead,
    weeklyBurn: burn,
    expectedWeeklyRunRevenue: rev,
    netWeeklyCash: rev - burn,
    runway: runway(state),
    activeRuns: state.theatricalRuns.filter((r) => r.status === 'active').length,
    pipelineRunRevenue: pipelineRunRevenue(state),
    totals: financeTotals(state),
  }
}
