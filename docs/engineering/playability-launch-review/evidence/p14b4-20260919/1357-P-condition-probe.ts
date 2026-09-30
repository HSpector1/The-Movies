// 1357-P: the P15B Wave 2 measurement probe (charter 1357-A §8; 1352-A §6). Read-only and written to be run later.
// It ticks natural seeded campaigns through the public tick API (`p13aGeneratedStudio` then `tick`, the 1344-P2
// harness) and, after every tick, feeds the pure Wave 1 law (`corporate-condition/v1`, `studio-loan/v1`) from the
// produced state through the 1357-A §3 adapter, in shadow. Nothing is written to disk: one JSON document goes to
// stdout, progress lines to stderr. No test fixture, doc or save is read or written.
//
// Arms (1357-A §8):
//   a: the condition law, no loans.
//   b: the condition law plus the rival loan policy (1357-A §6.2) in shadow. Cash is adjusted by principal minus
//      installments charged; rival behavior is the unchanged natural route. The player takes no action on a natural
//      route, so the player appears in arm a only.
//
// Run from a scratch tree with the Wave 1 patch (1352-stage/1352-p15b1-production.patch) and shelving landed:
//   PROBE_SEEDS=p13a-core-causal-01,seed-b,p13a-wait-control-01 PROBE_WEEKS=6240 npx tsx 1357-P-condition-probe.ts
// The parent adjusts the one import prefix '../tree/' below to that tree.
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import { CORPORATE_CONDITION_VERSION, stepCondition } from '../tree/src/core/corporateCondition.ts'
import type { Condition, ConditionCause, ConditionFacts, ConditionStage, ConditionTransition } from '../tree/src/core/corporateCondition.ts'
import { STUDIO_LOAN_VERSION, contractLoan, loanEligible, loanInstallmentDue, loanMaxPrincipal } from '../tree/src/core/studioLoan.ts'
import type { StudioLoan } from '../tree/src/core/studioLoan.ts'
import { economyEngaged, weeklyPayroll } from '../tree/src/core/employment.ts'
import { weeklyFacilityOperatingCost, weeklyOverhead } from '../tree/src/core/economyView.ts'
import { rivalWeeklyOperatingCost } from '../tree/src/core/hollywood.ts'
import { financialStrengthBand } from '../tree/src/core/powerRanking.ts'
import type { FinancialStrengthBand } from '../tree/src/core/powerRanking.ts'
import { TUNING } from '../tree/src/core/tuning.ts'
import type { GameState } from '../tree/src/core/types.ts'

const SEEDS = (process.env.PROBE_SEEDS ?? 'p13a-core-causal-01,seed-b,p13a-wait-control-01').split(',').map(s => s.trim()).filter(Boolean)
const WEEKS = Number(process.env.PROBE_WEEKS ?? 6240)
if (!Number.isSafeInteger(WEEKS) || WEEKS < 1) throw new Error(`probe: PROBE_WEEKS must be a positive integer (got ${process.env.PROBE_WEEKS})`)
if (SEEDS.length === 0) throw new Error('probe: PROBE_SEEDS names no seed')
// (year − 1920) × 52 (calendar.ts:18).
const CHECKPOINTS: readonly (readonly [number, number])[] = [[1960, 2080], [1980, 3120], [2000, 4160], [2040, 6240]]
const EARLY_CLOSURE_WEEKS = 104

type Track = {
  condition: Condition | null
  firstWeek: Partial<Record<ConditionStage, number>>
  transitions: { week: number; from: ConditionStage; to: ConditionStage; causes: ConditionCause[] }[]
  loan: StudioLoan | null
  loans: { week: number; principal: number; weeklyFixedCost: number }[]
  delta: number // arm b: principal received minus installments charged so far
}
type Row = {
  studioId: string
  role: 'player' | 'rival'
  enteredWeek: number
  firstEvaluatedWeek: number
  a: Track
  b: Track
  bandWeeks: Record<FinancialStrengthBand, number>
  strainedAboveWarnWeeks: number // band Strained while cover ≥ CORPORATE_WARN_COVER_WEEKS (1352-F calibration fact 1)
  firstBelowReserveWeek: number | null // rivals: cash < fixed cost × reserveWeeks (1352-F calibration fact 2)
  weeksBelowReserve: number
  distressEntries: { arm: 'a' | 'b'; week: number; loan: boolean; release: boolean; families: number; headcount: number }[]
}

const newTrack = (): Track => ({ condition: null, firstWeek: {}, transitions: [], loan: null, loans: [], delta: 0 })

// 1357-A §3.3: the one fixed cost, 1356-A §3 `studioWeeklyFixedCost`, inlined until powerRankingArchive.ts exists.
// Player: founding ? 0 : payroll + overhead + facility opex (= weeklyBurn − weeklyResearchSpend). Rival:
// rivalWeeklyOperatingCost at W. Research is excluded on both sides; the loan installment is a separate fact.
function weeklyFixedCost(state: GameState, studioId: string): number {
  const h = state.hollywood!
  if (studioId === h.playerStudioId) {
    return state.founding !== null ? 0 : weeklyPayroll(state) + weeklyOverhead(state) + weeklyFacilityOperatingCost(state)
  }
  return rivalWeeklyOperatingCost(business(state, studioId), h, state.market.tick)
}
function business(state: GameState, studioId: string) {
  const b = state.hollywood!.businesses.find(row => row.studioId === studioId)
  if (!b) throw new Error(`probe: entered rival ${studioId} has no business`)
  return b
}
const cashOf = (state: GameState, studioId: string, player: boolean) => player ? state.studio.cash : business(state, studioId).account.cash

// 1357-A §3.1: the player when engaged and founded; every rival entered at or before W; ascending studioId.
function evaluatedStudios(state: GameState): string[] {
  const h = state.hollywood
  if (!h) return []
  const W = state.market.tick
  const ids: string[] = []
  if (economyEngaged(state) && state.founding === null) ids.push(h.playerStudioId)
  for (const s of h.identities) if (s.role === 'rival' && s.enteredWeek !== null && s.enteredWeek <= W) ids.push(s.studioId)
  return ids.sort()
}

// 1352-F3 item 1: a closed (closure-due) studio never reaches stepCondition again.
function step(t: Track, facts: ConditionFacts): ConditionTransition | null {
  if (t.condition?.stage === 'closed') return null
  const { next, transition } = stepCondition(t.condition, facts)
  t.condition = next
  if (transition) {
    t.transitions.push({ week: transition.week, from: transition.from, to: transition.to, causes: transition.causes })
    t.firstWeek[transition.to] ??= transition.week
  }
  return transition
}

const outstanding = (t: Track, W: number) => t.loan !== null && W <= t.loan.contractedWeek + t.loan.installments.length

function runSeed(seed: string) {
  const started = Date.now()
  let state = p13aGeneratedStudio(seed)
  const rows = new Map<string, Row>()
  while (state.market.tick < WEEKS) {
    state = tick(state)
    const W = state.market.tick
    const h = state.hollywood
    // Arm b: the installment due in week W − 1 was charged by the advance just run (1357-A §5).
    for (const row of rows.values()) if (row.b.loan) row.b.delta -= loanInstallmentDue(row.b.loan, W - 1)
    for (const studioId of evaluatedStudios(state)) {
      const player = studioId === h!.playerStudioId
      let row = rows.get(studioId)
      if (!row) {
        const identity = h!.identities.find(s => s.studioId === studioId)!
        row = { studioId, role: player ? 'player' : 'rival', enteredWeek: identity.enteredWeek ?? 0, firstEvaluatedWeek: W,
          a: newTrack(), b: newTrack(), bandWeeks: { inTheRed: 0, strained: 0, stable: 0, thriving: 0 },
          strainedAboveWarnWeeks: 0, firstBelowReserveWeek: null, weeksBelowReserve: 0, distressEntries: [] }
        rows.set(studioId, row)
      }
      const wfc = weeklyFixedCost(state, studioId)
      // 1352-F Amendment 4: every evaluated studio carries a positive fixed cost. Fail loud, never echo a value.
      if (!(wfc > 0)) throw new Error(`probe: ${studioId} has no positive weekly fixed cost at week ${W}`)
      const cash = cashOf(state, studioId, player)
      const release = player
        ? state.studio.activeProductions.length > 0 || state.theatricalRuns.some(r => r.status === 'active')
        : business(state, studioId).productions.length > 0 || business(state, studioId).runs.length > 0
      const headcount = player ? state.contracts.length
        : h!.activeEmploymentOrdinals.filter(i => h!.employment[i]!.studioId === studioId).length

      const ta = step(row.a, { week: W, cash, weeklyFixedCost: wfc, loanInstallment: 0 })
      if (ta?.to === 'distress') {
        const loan = loanEligible('distress', wfc, { hasOutstandingLoan: false, founding: false })
        row.distressEntries.push({ arm: 'a', week: W, loan, release, families: Number(loan) + Number(release), headcount })
      }
      if (!player) {
        const installment = row.b.loan ? loanInstallmentDue(row.b.loan, W) : 0
        const tb = step(row.b, { week: W, cash: cash + row.b.delta, weeklyFixedCost: wfc, loanInstallment: installment })
        if (row.b.condition?.stage === 'distress') {
          const eligible = loanEligible('distress', wfc, { hasOutstandingLoan: outstanding(row.b, W), founding: false })
          if (tb?.to === 'distress') {
            row.distressEntries.push({ arm: 'b', week: W, loan: eligible, release, families: Number(eligible) + Number(release), headcount })
          }
          // 1357-A §6.2: loanEligible before contractLoan; the maximum principal, contracted at W.
          if (eligible) {
            const principal = loanMaxPrincipal(wfc)
            row.b.loan = contractLoan(principal, wfc, W)
            row.b.loans.push({ week: W, principal, weeklyFixedCost: wfc })
            row.b.delta += principal
          }
        }
      }

      // Calibration facts on real (arm a) cash.
      const band = financialStrengthBand(cash, wfc)
      row.bandWeeks[band]++
      if (band === 'strained' && cash / wfc >= TUNING.CORPORATE_WARN_COVER_WEEKS) row.strainedAboveWarnWeeks++
      if (!player && cash < wfc * business(state, studioId).policy.reserveWeeks) {
        row.weeksBelowReserve++
        row.firstBelowReserveWeek ??= W
      }
    }
    if (W % 520 === 0) console.error(`[1357-P] ${seed}: week ${W}/${WEEKS}, ${Math.round((Date.now() - started) / 1000)} s`)
  }
  return { rows, finalWeek: state.market.tick, elapsedMs: Date.now() - started }
}

const stageAt = (r: Row, week: number): ConditionStage | 'notEvaluated' => {
  if (week < r.firstEvaluatedWeek) return 'notEvaluated'
  let stage: ConditionStage = 'stable'
  for (const x of r.a.transitions) if (x.week <= week) stage = x.to
  return stage
}
const reached = (t: Track, stage: ConditionStage, week: number) => (t.firstWeek[stage] ?? Infinity) <= week

function checkpoint(rows: Row[], week: number) {
  const rivals = rows.filter(r => r.role === 'rival' && r.enteredWeek <= week)
  const arm = (k: 'a' | 'b') => ({
    warned: rivals.filter(r => reached(r[k], 'warning', week)).length,
    distressed: rivals.filter(r => reached(r[k], 'distress', week)).length,
    closureDue: rivals.filter(r => reached(r[k], 'closed', week)).length,
    loans: rivals.reduce((n, r) => n + r[k].loans.filter(l => l.week <= week).length, 0),
  })
  const player = rows.find(r => r.role === 'player')
  return {
    week, rivalsEntered: rivals.length, a: arm('a'), b: arm('b'),
    closureDueShareB: rivals.length === 0 ? null : arm('b').closureDue / rivals.length,
    player: player ? { stage: stageAt(player, week), closureDue: reached(player.a, 'closed', week) } : null,
  }
}

// Approximate root bytes in the 1357-A §4 shape (arm b, the arm the live law will resemble).
function rootBytes(rows: Row[]): number {
  const studios = rows.map(r => ({ studioId: r.studioId, firstEvaluatedWeek: r.firstEvaluatedWeek,
    definitionVersion: CORPORATE_CONDITION_VERSION, condition: (r.role === 'player' ? r.a : r.b).condition }))
  const events = rows.flatMap(r => (r.role === 'player' ? r.a : r.b).transitions.map(x => ({ studioId: r.studioId, ...x,
    definitionVersion: CORPORATE_CONDITION_VERSION })))
    .sort((x, y) => x.week - y.week || (x.studioId < y.studioId ? -1 : 1))
    .map((e, i) => ({ eventId: `corporate-event-${i + 1}`, ...e })) // 1357-A §4 allocator ids (annex D.7), from 1
  const loans = rows.flatMap(r => r.b.loans.map(l => ({ studioId: r.studioId, lawVersion: STUDIO_LOAN_VERSION,
    contractedWeek: l.week, weeklyFixedCostAtContract: l.weeklyFixedCost, ...contractLoan(l.principal, l.weeklyFixedCost, l.week) })))
    .sort((x, y) => x.contractedWeek - y.contractedWeek || (x.studioId < y.studioId ? -1 : 1))
    .map((l, i) => ({ loanId: `corporate-loan-${i + 1}`, ...l }))
  return Buffer.byteLength(JSON.stringify({ version: 1, recordedFromWeek: 0, nextEvent: events.length + 1,
    nextLoan: loans.length + 1, studios, events, loans }))
}

const report = SEEDS.map(seed => {
  const { rows: byId, finalWeek, elapsedMs } = runSeed(seed)
  const rows = [...byId.values()].sort((x, y) => (x.studioId < y.studioId ? -1 : 1))
  return {
    seed, finalWeek, elapsedMs, msPerTick: elapsedMs / finalWeek,
    checkpoints: Object.fromEntries(CHECKPOINTS.filter(([, w]) => w <= finalWeek).map(([year, w]) => [year, checkpoint(rows, w)])),
    earlyClosures: rows.flatMap(r => (['a', 'b'] as const).flatMap(k => {
      const closed = r[k].firstWeek.closed
      return r.role === 'rival' && closed !== undefined && closed - r.enteredWeek <= EARLY_CLOSURE_WEEKS
        ? [{ studioId: r.studioId, arm: k, enteredWeek: r.enteredWeek, closureDueWeek: closed }] : []
    })),
    distressEntriesUnderTwoRoutes: rows.flatMap(r => r.distressEntries.filter(d => d.families < 2).map(d => ({ studioId: r.studioId, ...d }))),
    events: rows.reduce((n, r) => n + (r.role === 'player' ? r.a : r.b).transitions.length, 0),
    rootBytesArmB: rootBytes(rows),
    studios: rows.map(r => ({
      studioId: r.studioId, role: r.role, enteredWeek: r.enteredWeek, firstEvaluatedWeek: r.firstEvaluatedWeek,
      a: { firstWeek: r.a.firstWeek, transitions: r.a.transitions.map(({ week, from, to }) => ({ week, from, to })) },
      b: r.role === 'player' ? null : { firstWeek: r.b.firstWeek, transitions: r.b.transitions.map(({ week, from, to }) => ({ week, from, to })),
        loans: r.b.loans.map(({ week, principal }) => ({ week, principal })) },
      bandWeeks: r.bandWeeks, strainedAboveWarnWeeks: r.strainedAboveWarnWeeks, everWarnedA: r.a.firstWeek.warning ?? null,
      firstBelowReserveWeek: r.firstBelowReserveWeek, weeksBelowReserve: r.weeksBelowReserve,
      distressEntries: r.distressEntries,
    })),
  }
})

console.log(JSON.stringify({
  probe: '1357-P', charter: '1357-A §8', treeHead: process.env.PROBE_TREE_HEAD ?? 'unrecorded', weeks: WEEKS,
  law: { condition: CORPORATE_CONDITION_VERSION, loan: STUDIO_LOAN_VERSION },
  tuning: Object.fromEntries(Object.entries(TUNING).filter(([k]) => k.startsWith('CORPORATE_') || k.startsWith('LOAN_'))),
  seeds: report,
}, null, 2))
