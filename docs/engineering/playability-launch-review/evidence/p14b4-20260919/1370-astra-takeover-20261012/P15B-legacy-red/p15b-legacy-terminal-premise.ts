// Standalone scratch diagnostic. NOT executed. Parent freezes/launches only after review.
// Constructed player debit controls, NOT natural gameplay/survival/Legacy qualification.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { routeL } from '/Users/zacheryspector/studio-specialists/p15b/tests/helpers/p15c2-route-l.ts'
import { makeSave, stableStringify } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import type { GameState } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'

const ROUTE_MS = 90_000 // Existing tests/helpers/p15c2-legacy.ts:35; unchanged class budget.
const helper = '/Users/zacheryspector/studio-specialists/p15b/tests/helpers/p15b-live.ts'
const helperSHA = '921a8e1e69f07dfc3e9d6bcaeef63e0493772adac6f3c3b3deebaa1cb0e8a060'
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex')
const canon = (s: unknown) => stableStringify(s)
// Exact existing drainPlayer constructor (p15b-live.ts:47–51); no import of Vitest-owned helpers.
function drainPlayer(state: GameState, amount: number): GameState {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error('drainPlayer: amount must be a positive integer')
  return { ...state, studio: { ...state.studio, cash: state.studio.cash - amount },
    ledger: [...state.ledger, { week: state.market.tick, kind: 'publicity', amount: -amount, note: 'p15b test drain' }] }
}
function admit(s: GameState): { admitted: boolean; error?: string } {
  const bytes = canon(s)
  try { makeSave(s); return { admitted: true } }
  catch (e) { return { admitted: false, error: e instanceof Error ? e.message : String(e) } }
  finally { assert.equal(canon(s), bytes, 'real admission mutated caller') }
}
function summary(s: GameState) {
  const owner = s.hollywood?.playerStudioId
  const condition = s.corporateCondition.studios.find(r => r.studioId === owner)
  const playerEvents = s.corporateCondition.events.filter(r => r.studioId === owner)
  const latestStage = playerEvents.at(-1)?.to ?? null
  const due = s.corporateCondition.events.filter(r => r.studioId === owner && r.to === 'closed').map(r => r.week)
  const closures = s.studioClosure.closures.filter(r => r.studioId === owner).map(r => ({ week: r.closureWeek, closureId: r.closureId, endOfRun: r.endOfRun }))
  const recentLedger = s.ledger.filter(r => r.week >= s.market.tick - 1).reduce((totals, r) => { totals[r.kind] = (totals[r.kind] ?? 0) + r.amount; return totals }, {} as Record<string, number>)
  return { week: s.market.tick, cash: s.studio.cash, condition, latestStage, due, closures, recentLedger,
    playerLoans: s.corporateCondition.loans.filter(r => r.studioId === owner).length,
    playerLoanLedgerRows: s.ledger.filter(r => ['loanPrincipal', 'loanInstallment', 'claimPayment'].includes(r.kind)).length,
    stateSHA256: hash(canon(s)) }
}
const started = performance.now()
const result: { label: string; helperSHA256: string; routeBudgetMs: number; precursor?: unknown; cases: unknown[]; fatal?: string; elapsedMs?: number; budgetPassed?: boolean } = {
  label: 'constructed route-L player-debit terminal premise diagnostic; no gameplay acceptance',
  helperSHA256: helperSHA, routeBudgetMs: ROUTE_MS, cases: [],
}
let failed = false
try {
  assert.equal(hash(readFileSync(helper)), helperSHA, 'debit constructor provenance drift')
  const source = routeL().foundedAtFounding // Memoized existing seed route; no new seed or reconstructed clock.
  const sourceBytes = canon(source)
  assert.equal(source.market.tick, 6188, 'route-L actual precursor week')
  const initial = admit(source); result.precursor = { ...summary(source), ...initial }
  assert(initial.admitted, `precursor refused: ${initial.error}`)
  // Reuse ordinary shared prefix; all branches are detached, with no clock/counter/history edits.
  let prefix = structuredClone(source)
  for (const [drainWeek, target] of [[6206, 6239], [6207, 6240], [6208, 6241]] as const) {
    const record: Record<string, unknown> = { drainWeek, requestedTarget: target }
    result.cases.push(record)
    try {
      while (prefix.market.tick < drainWeek) {
        assert(performance.now() - started <= ROUTE_MS, 'original route elapsed budget exceeded')
        const bytes = canon(prefix); const next = tick(prefix)
        assert.equal(canon(prefix), bytes, 'prefix tick mutated caller'); prefix = next
      }
      record.beforeDebit = summary(prefix); const baseline = admit(prefix); record.baselineAdmission = baseline
      if (!baseline.admitted) { record.gap = 'ordinary prefix does not admit'; continue }
      const existing = summary(prefix)
      if (existing.closures.length || existing.due.length || existing.playerLoans || prefix.studio.cash < 0 || (existing.latestStage !== null && existing.latestStage !== 'stable')) {
        record.gap = 'fresh condition/cash/no-loan premise absent; no debit or counter rewrite attempted'; continue
      }
      const branch = structuredClone(prefix); const beforeBytes = canon(branch)
      const amount = Math.floor(branch.studio.cash) + 1; let state = drainPlayer(branch, amount)
      assert(state.studio.cash < 0, 'whole labelled debit must exceed unchanged fractional cash')
      assert.equal(canon(branch), beforeBytes, 'debit mutated source branch')
      record.constructedDebit = amount; record.drained = summary(state)
      const admission = admit(state); record.drainedAdmission = admission
      if (!admission.admitted) { record.gap = 'labelled drained control does not admit'; continue }
      const trace: unknown[] = []; record.trace = trace
      while (state.market.tick < target && summary(state).closures.length === 0) {
        assert(performance.now() - started <= ROUTE_MS, 'original route elapsed budget exceeded')
        const bytes = canon(state); const next = tick(state)
        assert.equal(canon(state), bytes, 'branch tick mutated caller'); state = next
        const observed = summary(state)
        if (observed.due.length || observed.closures.length) trace.push(observed)
      }
      record.final = summary(state); const finalAdmission = admit(state); record.finalAdmission = finalAdmission
      const closures = summary(state).closures
      record.targetMatched = closures.some(c => c.week === target)
      record.admittedTargetMatched = record.targetMatched === true && finalAdmission.admitted
      if (!finalAdmission.admitted) record.gap = 'final state refused real admission; timing match is observation only'
      else if (!record.targetMatched) record.gap = 'actual condition/closure timing differs or target reached without closure; no forcing/chase'
    } catch (e) { record.error = e instanceof Error ? e.message : String(e); failed = true }
    finally { assert.equal(canon(source), sourceBytes, 'memoized route precursor mutated') }
  }
  assert.equal(canon(source), sourceBytes, 'source precursor changed')
} catch (e) { result.fatal = e instanceof Error ? e.message : String(e); failed = true }
finally {
  result.elapsedMs = performance.now() - started; result.budgetPassed = result.elapsedMs <= ROUTE_MS
  if (!result.budgetPassed) failed = true
  console.log(JSON.stringify(result, null, 2))
  if (failed) process.exitCode = 1
}
