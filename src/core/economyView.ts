// ── D-12 financial read models (economyView.ts) ───────────────────────────────
// The SINGLE source of every money figure the UI shows. Pure, deterministic, no
// React / DOM / RNG. Each figure MIRRORS the exact engine math — tick.ts step 3.5
// (weekly theatrical revenue), step 7.5 (overhead), employment payroll, the D-12.11
// solvency gate, and the D-12.16 "current commitments only" runway — so the dashboard
// NEVER reinvents a formula. Unit = whole dollars (the engine's unit). The sim never
// reads any of these; they are display-only, exactly like talentSummary / filmPackage.

import type { Contract, GameState, GameStateV3, TheatricalRun, LedgerKind } from './types.js'
import { TUNING } from './tuning.js'
import {
  economyEngaged,
  weeklyPayroll,
  weeklySalary,
  canAfford,
  type Affordability,
} from './employment.js'
// D-17A/T4 — the affordability scopes reuse the RECAP's own package builders and its own
// affordability helper, so "can I make a film?" is the same number on the Dashboard, at
// Assembly, and in the recap, and the existing recap-parity tests transfer unchanged.
// (studioRunRecap imports this module in turn; the cycle is inert — every reference on both
// sides lives inside a function body, and neither module reads the other at evaluation time.)
import {
  affordabilityOf,
  cheapestPackage,
  contractedRosterCanField,
  packageAllIn,
  recentTypicalCommitment,
  standardPackage,
  type PackageBreakdown,
  type PositionAffordability,
} from './studioRunRecap.js'

const EPS = 1e-9

// ── weekly cost side ──────────────────────────────────────────────────────────

// Weekly overhead the engine debits at tick step 7.5 — mirrors tick.ts:476-481 EXACTLY
// (base + per-contract; gated on engaged && founded). Zero pre-founding / when not engaged.
// D-17A/T1: the old citation (tick.ts:403-404) had rotted — the step-7.5 block has moved.
// D-17A/R2: the parameter widened GameStateV3 → GameState because the regime fact it
// consults (`economyEngaged`) is now a persisted field on the live state. TYPE-ONLY —
// every existing caller already passes a full GameState; the body is unchanged.
export function weeklyOverhead(state: GameState): number {
  if (!economyEngaged(state) || state.founding !== null) return 0
  return TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length
}

// Current weekly burn under EXISTING commitments ONLY: payroll + overhead. A production's
// negative + marketing are ONE-TIME debits paid at greenlight (already reflected in cash),
// never a recurring weekly cost — so they are deliberately NOT in weekly burn (D-12.16).
//
// D-17A/T1 — this is the ACTUAL-CHARGE basis, and it is the ONE authoritative burn every
// player-facing surface reads. During a founding draft the engine charges NOTHING: payroll is
// skipped at tick.ts:465 (`if (state.founding === null)`) and overhead at tick.ts:476 (`if
// (engaged && state.founding === null)`). The unguarded `weeklyPayroll` here was the §5.10
// divergence — the founding screen's runway was computed against a payroll no tick would debit
// for as long as the draft stayed open. `foundingRunwayPreview` below is the deliberate
// PROJECTION past that gate and is unchanged.
export function weeklyBurn(state: GameState): number {
  if (state.founding !== null) return 0
  return weeklyPayroll(state) + weeklyOverhead(state)
}

// During FOUNDING (founding !== null) overhead is not yet charged (tick step 7.5 gates on
// founding === null). This is the weekly overhead that WILL apply once the studio is founded with
// the proposed roster — so the founding preview can show the same current-commitments runway the
// Dashboard will show, just projected past the founding gate (no formula duplicated in the UI).
// D-17A/R2: same TYPE-ONLY widening as weeklyOverhead (GameStateV3 → GameState).
export function projectedWeeklyOverhead(state: GameState): number {
  if (!economyEngaged(state)) return 0
  return TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * state.contracts.length
}

// ── active-run revenue side ────────────────────────────────────────────────────

// Studio Revenue an ACTIVE run pays NEXT tick (current weekIndex's gross × locked share).
// Mirrors tick.ts:328-330 (step 3.5). Zero for completed / legacy runs.
// D-17A/T1: the old citation (tick.ts:311-312) had rotted — the step-3.5 block has moved.
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

// D-17A/T1 — THE ONE runway rule, applied to an arbitrary (cash, burn, revenue) triple, so
// no surface may re-derive it. weeks = ⌊cash / (burn − rev)⌋; net-cash-positive → infinite.
// Callers decide which cash to hand it (the live balance, or a post-commitment balance
// floored at 0); the rule itself is stated exactly once.
function runwayOf(cash: number, burn: number, rev: number): Runway {
  const net = burn - rev
  const netWeeklyCash = rev - burn
  if (net <= EPS) return { netWeeklyCash, weeks: null, infinite: true }
  return { netWeeklyCash, weeks: Math.floor(cash / net), infinite: false }
}

// "How long can the studio survive under its CURRENT commitments?" NEVER reserves cash
// for a hypothetical future greenlight. weeks = ⌊cash / max(ε, burn − activeRunRevenue)⌋.
// Net-cash-positive (revenue ≥ burn) → infinite (weeks null; UI shows "—").
export function runway(state: GameState): Runway {
  return runwayOf(state.studio.cash, weeklyBurn(state), expectedWeeklyRunRevenue(state))
}

// The SAME current-commitments runway definition, PROJECTED to the post-founding state: payroll +
// the overhead the proposed roster will incur once founded (no active runs exist during founding).
// So the founding screen and the Dashboard use one shared "Runway" definition.
export function foundingRunwayPreview(state: GameState): Runway {
  const burn = weeklyPayroll(state) + projectedWeeklyOverhead(state)
  if (burn <= EPS) return { netWeeklyCash: 0, weeks: null, infinite: true }
  return { netWeeklyCash: -burn, weeks: Math.floor(state.studio.cash / burn), infinite: false }
}

// ── affordability + post-commitment preview (D-12.11 / D-12.16) ────────────────

// One affordability helper the UI reads (delegates to the engine's authoritative gate).
export function affordability(state: Pick<GameStateV3, 'studio'>, amount: number): Affordability {
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
  // D-17A/T1: the SHARED runway rule, not a fourth near-copy. Semantics preserved exactly —
  // the post-commitment balance is floored at 0 (a blocked commitment is still previewed, and
  // a negative balance would otherwise report negative weeks).
  const postRunway: Runway = runwayOf(Math.max(0, cashAfter), burn, rev)
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

// ── D-17A/T3 — PROSPECTIVE cycle-inclusive break-even (Owner ruling R7) ─────────
// R7 makes the player-facing HEADLINE break-even STUDIO-ECONOMIC: a film must also carry
// the fixed cost the studio pays while it is being made and released, not only its direct
// commitment. The prospective attribution is the contract-literal
//   (PRODUCTION_TICKS + THEATRICAL_WEEKS) × current weekly burn ÷ expected concurrency.
// The contract-expiry-aware forward sum was REJECTED at the Phase-0 gate: it smuggles a
// "renew nobody" assumption into a headline number. Film Contribution (Studio Revenue −
// direct commitment) is untouched and remains the labelled direct-cost DETAIL (D-12 §3/§8):
// payroll and overhead are never silently folded into it.

export type CycleFixedCost = {
  weeks: number // PRODUCTION_TICKS + THEATRICAL_WEEKS — the full make-and-release cycle
  weeklyBurn: number // the basis used (founding-aware; see below)
  concurrency: number // the NAMED assumption: how many films share the cycle's fixed cost
  amount: number // round(weeks × weeklyBurn ÷ concurrency), whole dollars
}

// The fixed cost one candidate package is asked to carry over its own cycle.
//
// DEFAULT = SOLE OCCUPANCY (`concurrency: 1`) — the conservative assumption, and deliberately
// conservative exactly when the studio is poorest (the D-16 failure case): a studio with one
// film in flight really does pay the whole cycle's burn against that film. `concurrency: 2` is
// the only other value the UI passes, shown as a NAMED second line, never blended.
//
// BASIS: during a founding draft the engine charges nothing (weeklyBurn === 0), but the cycle
// being priced is paid AFTER founding — so the basis is the projected post-founding burn there,
// and the live actual-charge burn everywhere else. Never zero-rates a real cycle.
export function prospectiveCycleFixedCost(
  state: GameState,
  opts?: { concurrency?: number },
): CycleFixedCost {
  const weeks = TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS
  const basis =
    state.founding !== null ? weeklyPayroll(state) + projectedWeeklyOverhead(state) : weeklyBurn(state)
  const concurrency = Math.max(1, opts?.concurrency ?? 1)
  return { weeks, weeklyBurn: basis, concurrency, amount: Math.round((weeks * basis) / concurrency) }
}

export type CycleInclusiveBreakEven = {
  direct: number // break-even GROSS against the DIRECT commitment only (D-12 detail figure)
  cycleInclusive: number // break-even GROSS against commitment + cycle fixed cost (R7 HEADLINE)
  fixedCost: CycleFixedCost // the attribution, with its assumption named
}

// The REGIME's share of a film's gross — the one place the UI-facing break-even chain asks it.
// ENGAGED: a theatrical run pays `STUDIO_RENTAL_BLENDED` weekly (`economy.ts:67`). NEVER
// ENGAGED (D-1): no run opens; release credits the FULL gross in one lump (`tick.ts:238-247`),
// so the share is 1 and break-even gross IS the direct cost. D-17A FIX-PASS — a never-engaged
// studio was being told it had to gross 1.92× a cost it actually keeps 100% of.
export function regimeStudioShare(state: GameState): number {
  return economyEngaged(state) ? TUNING.STUDIO_RENTAL_BLENDED : 1
}

// The two break-even grosses side by side, so a surface can never show the direct figure
// without the studio-economic one. Both use the same `breakEvenGross` helper (cost ÷ share),
// at the same regime share.
export function cycleInclusiveBreakEvenGross(
  state: GameState,
  committedCost: number,
  opts?: { concurrency?: number },
): CycleInclusiveBreakEven {
  const fixedCost = prospectiveCycleFixedCost(state, opts)
  const share = regimeStudioShare(state)
  return {
    direct: breakEvenGross(committedCost, share),
    cycleInclusive: breakEvenGross(committedCost + fixedCost.amount, share),
    fixedCost,
  }
}

// ── D-17A/T4 — affordability scopes (promoted out of the recap) ────────────────
// "What can I actually make right now?", at three scopes, from player-visible values only:
//   cheapest      — a concrete greenlightable bare-minimum package (cheapest concept,
//                   lowest budget grid, minimum marketing, min-demand shape, available team);
//   standard      — a normally-funded film of that concept (the assembly's own defaults);
//   recentTypical — the median committed cost of the studio's three most recent releases
//                   (null until something has released).
// Each carries the ENGINE's solvency verdict (D-12.11 via `commitmentPreview`), not a
// re-implementation of it. D-17A promotes these to Dashboard + Assembly; they were previously
// reachable only through the D-15 recap, which is why the same builders are reused verbatim.

export type AffordabilityScopes = {
  cheapest: PositionAffordability | null
  cheapestBreakdown: PackageBreakdown | null
  standard: PositionAffordability | null
  standardBreakdown: PackageBreakdown | null
  recentTypical: PositionAffordability | null
  /** false ⇒ the packages above assume hiring freelancers to fill the roles the roster cannot. */
  contractedRosterCanFieldFilm: boolean
}

export function affordabilityScopes(state: GameState): AffordabilityScopes {
  const cheapestBreakdown = cheapestPackage(state)
  const standardBreakdown = standardPackage(state)
  const typical = recentTypicalCommitment(state)
  return {
    cheapest: cheapestBreakdown != null ? affordabilityOf(state, packageAllIn(cheapestBreakdown)) : null,
    cheapestBreakdown,
    standard: standardBreakdown != null ? affordabilityOf(state, packageAllIn(standardBreakdown)) : null,
    standardBreakdown,
    recentTypical: typical != null ? affordabilityOf(state, typical) : null,
    contractedRosterCanFieldFilm: contractedRosterCanField(state),
  }
}

// ── D-17A/T5 — contract-obligation truth at signing ────────────────────────────
// D-16 item 8: the offer screen showed the weekly salary and the signing bonus, never the FULL
// remaining guaranteed obligation the studio is committing to. These two selectors state it,
// from the same employment helpers the tick charges against.

export type OfferObligation = {
  weeklySalary: number // round(annualSalary / TICKS_PER_YEAR) — exactly what payroll debits
  guaranteedComp: number // weeklySalary × termWeeks (== `guaranteedComp(contract, startWeek)`)
  signingBonus: number // paid once, immediately (from the recruitment fund during founding)
  total: number // guaranteedComp + signingBonus — the whole commitment
}

/** The full obligation of an offer/renewal, from its own terms. Pure arithmetic, no state. */
export function offerObligation(offer: {
  annualSalary: number
  signingBonus: number
  termWeeks: number
}): OfferObligation {
  const weekly = weeklySalary(offer.annualSalary)
  const guaranteed = weekly * offer.termWeeks
  return {
    weeklySalary: weekly,
    guaranteedComp: guaranteed,
    signingBonus: offer.signingBonus,
    total: guaranteed + offer.signingBonus,
  }
}

export type PostSigningRunway = {
  before: Runway // the R1 runway as it stands now
  after: Runway // the same rule, with the signing's burn and cash consequences applied
  burnAfter: number // weekly burn once this contract is on the books
  cashAfter: number // cash once the signing bonus is paid
}

/**
 * What signing (or renewing) this offer does to the runway — the SAME runway rule, with:
 *   burn' = burn + weeklySalary(offer)                       (+ OVERHEAD_PER_EMPLOYEE for a NEW
 *                                                             seat; a renewal adds no seat, so it
 *                                                             prices only the weekly-salary DELTA)
 *   cash' = cash − signingBonus                              (ops phase; during a founding draft
 *                                                             the bonus draws the RECRUITMENT FUND,
 *                                                             not cash — actions.ts:1129-1142 — so
 *                                                             cash is unchanged there)
 * Read-model only: it changes no action and enforces no gate (the solvency gate on the bonus
 * itself is `affordability(state, offer.signingBonus)`).
 */
export function postSigningRunway(
  state: GameState,
  offer: { annualSalary: number; signingBonus: number },
  opts?: { replacesContract?: Contract },
): PostSigningRunway {
  const replaced = opts?.replacesContract
  const burn = weeklyBurn(state)
  // D-17A FIX-PASS — the ENGAGEMENT step. Signing is also the site that flips the persisted
  // regime from false to true (`actions.ts:1170`), and `weeklyOverhead` is gated on it: a
  // studio that has NEVER engaged pays 0 overhead, and the moment this signature lands it
  // starts paying OVERHEAD_BASE as well as the per-employee amount. Omitting the base
  // understated the burn by exactly $15,000/wk on a never-engaged studio's first ops-phase
  // signing (predicted 3,101 vs an actual 18,101 — a runway of 6,444 wk against a real 1,104),
  // rendered verbatim by the T5 line whose whole purpose is runway truth at signing.
  const overheadStep = economyEngaged(state) ? 0 : TUNING.OVERHEAD_BASE
  const salaryDelta =
    replaced === undefined
      ? weeklySalary(offer.annualSalary) + TUNING.OVERHEAD_PER_EMPLOYEE + overheadStep // a new seat costs overhead too
      : weeklySalary(offer.annualSalary) - weeklySalary(replaced.annualSalary)
  // During a founding draft the tick charges nothing at all, so the ACTUAL burn stays 0 (the
  // founding screen's projection is `foundingRunwayPreview`). Post-founding the delta applies.
  const burnAfter = state.founding !== null ? burn : burn + salaryDelta
  const cashAfter = state.founding !== null ? state.studio.cash : state.studio.cash - offer.signingBonus
  const rev = expectedWeeklyRunRevenue(state)
  return {
    before: runway(state),
    after: runwayOf(Math.max(0, cashAfter), burnAfter, rev),
    burnAfter,
    cashAfter,
  }
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
  publicity: number // D-17B §5: Σ publicity campaign purchases, stored negative
  construction: number // Annex V1: Σ studio construction capex, stored negative
  net: number // Σ all retained ledger amounts; migrated pre-ledger cash may use a V11 checkpoint
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
  publicity: 0,
  construction: 0,
  net: 0,
})

// COMPILE-GUARDED: `Record<LedgerKind, …>` makes a new LedgerKind a type error here until it
// is given a home, so no kind can silently fall into someone else's bucket (D-17B §5).
const KIND_FIELD: Record<LedgerKind, keyof FinanceTotals> = {
  studioRevenue: 'studioRevenue',
  boxOffice: 'boxOfficeLump',
  production: 'production',
  payroll: 'payroll',
  overhead: 'overhead',
  signingBonus: 'signingBonus',
  freelancerFee: 'freelancerFee',
  termination: 'termination',
  publicity: 'publicity',
  constructionCapex: 'construction',
  // Placement Core V12: the weekly operating cost of operational placed
  // facilities is its own auditable LEDGER KIND (one aggregated row per week,
  // correlated to nothing per-film) but it reports inside the existing OVERHEAD
  // bucket — it is studio overhead that scales with the property, and giving it
  // a new reporting field would change every finance read model's shape for a
  // number that belongs beside the weekly overhead it sits next to.
  facilityOpex: 'overhead',
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
  publicity: number // D-17B §5: publicity campaign purchases in the window (negative)
  construction: number // Annex V1: studio construction capex in the window (negative)
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
    publicity: 0,
    construction: 0,
    otherCash: 0,
    netCash: 0,
    releases: 0,
    completedRuns: 0,
  }
  for (const e of state.ledger) {
    if (e.week < fromWeek || e.week > toWeekInclusive) continue
    s.netCash += e.amount
    const kind: LedgerKind = e.kind
    switch (kind) {
      case 'payroll':
        s.payroll += e.amount
        break
      case 'overhead':
      // Placement Core V12: the weekly placed-facility operating charge is a
      // distinct kind on the ledger and reports inside the overhead bucket it
      // economically belongs to (see KIND_FIELD above). It is given an EXPLICIT
      // case here rather than falling through `default:` or `otherCash`.
      case 'facilityOpex':
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
      // D-17B §5 (reviewer M3, binding): publicity gets an EXPLICIT case. This switch's
      // `default:` is silent — letting a new, player-initiated, studio-level cost fall into
      // `otherCash` (documented as "signingBonus + freelancerFee + termination") would make
      // the weekly report quietly wrong about where the money went.
      case 'publicity':
        s.publicity += e.amount
        break
      case 'constructionCapex':
        s.construction += e.amount
        break
      case 'signingBonus':
      case 'freelancerFee':
      case 'termination':
        s.otherCash += e.amount
        break
      default: {
        // Exhaustiveness guard (the actions.ts:1288 idiom): a new LedgerKind must be given a
        // home HERE, not absorbed by a catch-all.
        const _exhaustive: never = kind
        throw new Error(`periodSummary: unhandled ledger kind ${JSON.stringify(_exhaustive)}`)
      }
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
  weeklyPayroll: number // contracted payroll COMPONENT (not charged during a founding draft)
  weeklyOverhead: number // overhead COMPONENT (already 0 during a founding draft)
  // D-17A/T1: the ACTUAL weekly charge — `weeklyBurn(state)`. Equals payroll + overhead once
  // the studio is founded; 0 while a founding draft is open, when the tick charges neither.
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
  // D-17A/T1: the ONE authoritative burn (founding-guarded), not an inline re-add. Post-founding
  // this is identical to payroll + overhead; during a founding draft the engine charges neither,
  // so burn is 0 while the payroll/overhead COMPONENTS still report the contracted amounts.
  const burn = weeklyBurn(state)
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
