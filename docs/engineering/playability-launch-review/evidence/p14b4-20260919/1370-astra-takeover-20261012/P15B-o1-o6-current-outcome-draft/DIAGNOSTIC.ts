// Bounded current-source live-arm outcome/accounting diagnostic, NOT complete1363-V/acceptance.
// Actual historical130 continuation to600, default-develop semantics preserved explicitly.
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, isAbsolute, join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'
import { importSave, migrateToLive, makeSave, stableStringify } from '/Users/zacheryspector/studio-specialists/p15b/src/core/save.ts'
import { tick } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tick.ts'
import { isOperatingStudio } from '/Users/zacheryspector/studio-specialists/p15b/src/core/operatingState.ts'
import { rivalWeeklyOperatingCost, rivalCapacityOpex } from '/Users/zacheryspector/studio-specialists/p15b/src/core/hollywood.ts'
import { weeklySalary } from '/Users/zacheryspector/studio-specialists/p15b/src/core/employment.ts'
import { rivalFacilityDisposalEligibility } from '/Users/zacheryspector/studio-specialists/p15b/src/core/rivalResearch.ts'
import { blueprintById, facilityDemolitionRefund } from '/Users/zacheryspector/studio-specialists/p15b/src/core/placement.ts'
import { contractLoan, loanMaxPrincipal } from '/Users/zacheryspector/studio-specialists/p15b/src/core/studioLoan.ts'
import { loanInstallmentDueFor, studioRemedies } from '/Users/zacheryspector/studio-specialists/p15b/src/core/corporateConditionLive.ts'
import { TUNING } from '/Users/zacheryspector/studio-specialists/p15b/src/core/tuning.ts'
import type { GameState } from '/Users/zacheryspector/studio-specialists/p15b/src/core/types.ts'
import type { RivalBusiness, RivalMoneyKind } from '/Users/zacheryspector/studio-specialists/p15b/src/core/hollywoodTypes.ts'

const sha = (v: string | Buffer) => createHash('sha256').update(v).digest('hex')
const bytes = (v: unknown) => stableStringify(v)
const budgetMs = 30_000, horizon = 600, options = { develop: false } as const
const manifestPin = '35f281f6a56190b422c44d16838290a977a595db7e3ad3ace7c4d72cafb74f3f'
const defaultRoot = '/Users/zacheryspector/studio-specialists/p15b/tests/fixtures/p14/genuine-v42-pre-shelving'
const fixtureRoot = process.env.P15B_O1O6_FIXTURE_ROOT ?? defaultRoot
const output = process.env.P15B_O1O6_DIAGNOSTIC_JSON
if (!output || !isAbsolute(output) || existsSync(output) || !lstatSync(dirname(output)).isDirectory()) throw new Error('Require fresh absolute P15B_O1O6_DIAGNOSTIC_JSON in existing output directory.')
if ((process.env.P15B_O1O6_FIXTURE_ROOT === undefined) !== (process.env.P15B_O1O6_MANIFEST_SHA256 === undefined)) throw new Error('Fixture root/pin override must be paired.')
if (process.env.P15B_O1O6_MANIFEST_SHA256 !== undefined && process.env.P15B_O1O6_MANIFEST_SHA256 !== manifestPin) throw new Error('Only actual independently pinned week130 manifest admitted.')
class Premise extends Error {}
function check(v: unknown, text: string): asserts v { if (!v) throw new Premise(text) }
function within(stage: string) { check(performance.now() <= budgetMs, `unchanged30s process budget exceeded at${stage}`) }
const result: Record<string, unknown> = { kind: 'O1/O6 current-source130→600 LIVE-ARM DIAGNOSTIC, not full1363-V or acceptance', status: 'STARTED',
  seed: 'p13a-core-causal-01', startWeek: 130, horizon, options, totalBudgetMs: budgetMs, ticksAttempted: 0,
  sourceDriverSHA256: sha(readFileSync(fileURLToPath(import.meta.url))), manifestSHA256: manifestPin,
  rootMode: fixtureRoot === defaultRoot ? 'default-genuine-v42-pre-shelving' : 'explicit-paired-pinned-override',
  arms: ['current integrated source, actual live loan producer, current shared-market tuning unchanged'],
  actualSharedMarketMaximumPenalty: TUNING.SHARED_MARKET_FACTOR_MAX_PENALTY,
  missingFormalReprobeScope: ['independent control/A/A+B source arms', 'pressure-off source arm', 'other adopted seeds',
    'pre130 history under new recovery policy', '1560/2080/3120/4160/4680/6240 checkpoints', 'G-P/G-L',
    'internal cashBlocked/unaffordableViable evaluation census and exact refused package cost', 'false-positive causal comparison'],
  purityScope: 'full original130 input and mandatory checkpoint admission; eligibility full-read purity at checkpoints; not full serialization of every intermediate tick',
  admissions: [], moments: [], checkpointRows: [], disposals: [], loanTransitions: [], eligibilityChanges: [], nextTick: null }
function admit(s: GameState, label: string) {
  within(label + ':before'); const before = sha(bytes(s)); let error: string | null = null
  try { makeSave(s) } catch (e) { error = (e as Error).message }
  const after = sha(bytes(s)), admitted = error === null && before === after
  ;(result.admissions as unknown[]).push({ label, admitted, error, beforeSHA256: before, afterSHA256: after })
  within(label + ':after'); check(admitted, `full admission/purity failed:${label}`)
}
function totals(b: RivalBusiness) {
  const kinds = Object.keys(b.account.periods[0]!.movements) as RivalMoneyKind[]
  return Object.fromEntries(kinds.map(k => [k, b.account.periods.reduce((n, p) => n + p.movements[k], 0)])) as Record<RivalMoneyKind, number>
}
function business(s: GameState, id: string) { const b = s.hollywood!.businesses.find(b => b.studioId === id); check(b, 'observed rival missing'); return b }
function summary(s: GameState, id: string) {
  const h = s.hollywood!, b = business(s, id), at = s.market.tick
  const employees = h.activeEmploymentOrdinals.map(i => h.employment[i]!).filter(e => e.studioId === id && e.terms.startWeek <= at && at < e.terms.endWeekExclusive && e.endedWeek === null)
  const payroll = employees.reduce((n, e) => n + weeklySalary(e.terms.annualSalary), 0)
  const overhead = TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * employees.length
  const capacity = rivalCapacityOpex(b, h.receipts), fixed = rivalWeeklyOperatingCost(b, h, at)
  check(payroll + overhead + capacity === fixed, 'public operating cost owners disagree')
  const labs = b.operations.facilities.filter(f => f.capability === 'laboratory')
  const labBodyOpex = labs.length * blueprintById('research-laboratory')!.weeklyOperatingCost
  const core = b.operations.facilities.filter(f => f.capability !== 'laboratory')
  const coreOpex = rivalCapacityOpex({ ...b, operations: { ...b.operations, facilities: core } }, [])
  const condition = s.corporateCondition.studios.find(r => r.studioId === id)?.condition
  const closure = s.studioClosure.closures.find(c => c.studioId === id)
  return { week: at, studioId: id, cash: b.account.cash, reserve: fixed * b.policy.reserveWeeks, cashMinusReserve: b.account.cash - fixed * b.policy.reserveWeeks,
    costs: { payroll, overhead, retainedCoreBodyOpex: coreOpex, retainedLabBodyOpex: labBodyOpex,
      retainedInstrumentOpex: capacity - coreOpex - labBodyOpex, weeklyFixedCost: fixed, nextScheduledLoanInstallment: loanInstallmentDueFor(s, id, at) },
    actualOperating: isOperatingStudio(s, id), conditionStage: condition?.stage ?? 'notEvaluated', closureDue: condition?.stage === 'closed' && !closure,
    actualClosedWeek: closure?.closureWeek ?? null, cuttingSince: b.costCutting.since, nextDecisionWeek: b.nextDecisionWeek,
    headcount: employees.length, remedies: studioRemedies(s, id), productionCount: b.productions.length, runCount: b.runs.length,
    coreFacilityIds: core.map(f => f.id), laboratoryIds: labs.map(f => f.id), cumulativeMovements: totals(b),
    refusedPackageCost: null, refusedPackageCostStatus: 'UNKNOWN: private actual decision evaluation, not independently reimplemented' }
}
const first: Record<string, Record<string, unknown>> = {}, eligibilitySeen = new Map<string, string>(), avoided: Record<string, number> = {}
function setFirst(id: string, key: string, value: unknown) { if (first[id][key] === null) first[id][key] = value }
function observeEligibility(s: GameState) {
  const verifyPurity = s.market.tick % 10 === 0
  const before = verifyPurity ? sha(bytes(s)) : null
  for (const b of s.hollywood!.businesses) for (const f of b.operations.facilities) {
    const decision = rivalFacilityDisposalEligibility(s, b.studioId, f.id), key = `${b.studioId}|${f.id}`
    const signature = bytes(decision)
    if (eligibilitySeen.get(key) !== signature) {
      eligibilitySeen.set(key, signature)
      ;(result.eligibilityChanges as unknown[]).push({ observedWeek: s.market.tick, studioId: b.studioId, facilityId: f.id, decision,
        boundaryOnly: true, note: 'actual policy may admit/dispose after same-tick cutting entry before this full-boundary observation' })
    }
  }
  if (verifyPurity) check(sha(bytes(s)) === before, 'pure disposal eligibility mutated state at observed checkpoint')
}

try {
  within('fixture')
  const manifest = readFileSync(join(fixtureRoot, 'MANIFEST.json'))
  check(manifest.length === 1113 && sha(manifest) === manifestPin, 'actual week130 manifest pin differs')
  const gzip = readFileSync(join(fixtureRoot, 'genuine-v42-rival-stall-week-130.json.gz'))
  check(gzip.length === 121262 && sha(gzip) === 'af45c8a0efb9a56ac9ff4c16244509d59b49a02370f8390769c79b133d7238f6', 'week130 gzip pin differs')
  const raw = gunzipSync(gzip).toString('utf8')
  check(Buffer.byteLength(raw) === 1096270 && sha(raw) === 'f0bf1f76552347f590b54cafefc5704a436f63de49c6782e9bb9a582f28f1425', 'week130 raw pin differs')
  const historical = importSave(raw), beforeOld = sha(bytes(historical))
  check(historical.saveVersion === 42, 'actual own-era input is not Save42')
  let s = migrateToLive(historical).state as GameState
  check(sha(bytes(historical)) === beforeOld, 'public migration mutated historical input')
  check(s.seed === 'p13a-core-causal-01' && s.market.tick === 130 && s.hollywood !== null && s.founding === null, 'actual known130 premise changed')
  check(s.corporateCondition.loans.length === 0 && s.corporateCondition.events.length === 0 && s.studioClosure.closures.length === 0, 'historical migration backfilled current condition/loan/closure history')
  admit(s, 'actual-public-migrated130')
  const initial = s, initialSHA = sha(bytes(s)), startingTotals: Record<string, Record<RivalMoneyKind, number>> = {}
  const initialize = (state: GameState, b: RivalBusiness) => {
    if (first[b.studioId]) return
    first[b.studioId] = { enteringCurrentPolicyWeek: state.market.tick, actualIndustryEnteredWeek: state.hollywood!.identities.find(r => r.studioId === b.studioId)!.enteredWeek,
      firstBelowReserve: null, firstNonpositiveCash: null, lowestObservedCash: b.account.cash,
      firstLoanWeek: null, firstHiringAfterLoan: null, firstRenewalAfterLoan: null, firstCommissionAfterLoan: null,
      firstGreenlightAfterLoan: null, firstTakeAfterLoan: null, firstReleaseAfterLoan: null, firstRevenueAfterLoan: null,
      firstOrdinaryDecisionAfterLoan: null, futureUntilHorizon: horizon }
    avoided[b.studioId] = 0; startingTotals[b.studioId] = totals(b)
  }
  s.hollywood!.businesses.forEach(b => initialize(s, b))
  const baseline = s.hollywood!.businesses.map(b => summary(s, b.studioId))
  result.baseline = baseline
  while (s.market.tick < horizon) {
    within(`before-tick${s.market.tick}`)
    const own = s.hollywood!.playerStudioId
    if (!isOperatingStudio(s, own)) { result.stop = { week: s.market.tick, playerClosedWeek: s.studioClosure.closures.find(c => c.studioId === own)!.closureWeek }; throw new Premise('actual player terminal before fixed600 horizon; NO tick/bypass') }
    const week = s.market.tick, beforeReceipts = s.hollywood!.receipts.length, beforeTakes = s.firstTakes.length
    observeEligibility(s)
    for (const b of s.hollywood!.businesses) {
      initialize(s, b); const row = summary(s, b.studioId)
      if (row.cash < row.reserve) setFirst(b.studioId, 'firstBelowReserve', week)
      if (row.cash <= 0) setFirst(b.studioId, 'firstNonpositiveCash', week)
      first[b.studioId].lowestObservedCash = Math.min(Number(first[b.studioId].lowestObservedCash), row.cash)
      const loanWeek = first[b.studioId].firstLoanWeek
      if (loanWeek !== null && week >= Number(loanWeek) && week >= b.nextDecisionWeek && row.actualOperating) setFirst(b.studioId, 'firstOrdinaryDecisionAfterLoan', { inputWeek: week, facts: row })
    }
    result.nextTick = week; result.ticksAttempted = Number(result.ticksAttempted) + 1
    const next = tick(s, options)
    check(next.market.tick === week + 1, `full tick clock failed at${week}`)
    const freshReceipts = next.hollywood!.receipts.slice(beforeReceipts)
    for (const b of next.hollywood!.businesses) {
      initialize(next, b)
      const id = b.studioId, prev = s.hollywood!.businesses.find(p => p.studioId === id)
      if (!prev) { ;(result.moments as unknown[]).push({ kind: 'actual-studio-entry', producedWeek: next.market.tick, after: summary(next, id) }); continue }
      check(prev.operations.facilities.filter(f => f.capability !== 'laboratory').every(f => b.operations.facilities.some(n => n.id === f.id)), 'protected existing core body removed')
      if (b.costCutting.since !== prev.costCutting.since) {
        ;(result.moments as unknown[]).push({ kind: 'cutting-transition', inputWeek: week, producedWeek: next.market.tick,
          priorSince: prev.costCutting.since, nextSince: b.costCutting.since, before: summary(s, id), after: summary(next, id) })
      }
      const freshLoans = next.corporateCondition.loans.filter(l => l.studioId === id && !s.corporateCondition.loans.some(old => old.loanId === l.loanId))
      for (const loan of freshLoans) {
        check(b.costCutting.since === null, 'actual principal did not clear cutting atomically in returned business')
        check(loan.principal === loanMaxPrincipal(loan.weeklyFixedCostAtContract), 'rival principal not actual lawful maximum')
        const terms = contractLoan(loan.principal, loan.weeklyFixedCostAtContract, loan.contractedWeek)
        check(bytes(terms.installments) === bytes(loan.installments) && terms.total === loan.total, 'real loan terms differ from shared law')
        setFirst(id, 'firstLoanWeek', loan.contractedWeek)
        ;(result.loanTransitions as unknown[]).push({ studioId: id, loanId: loan.loanId, contractedWeek: loan.contractedWeek,
          principal: loan.principal, total: loan.total, installmentCount: loan.installments.length, cuttingCleared: true,
          principalMovementDelta: totals(b).loanPrincipal - totals(prev).loanPrincipal, before: summary(s, id), after: summary(next, id) })
        check(totals(b).loanPrincipal - totals(prev).loanPrincipal === loan.principal, 'principal credit does not equal exactly one real booked principal')
      }
      const freshDisposals = freshReceipts.filter((r): r is Extract<typeof r, { kind: 'facilityDisposed' }> => r.studioId === id && r.kind === 'facilityDisposed')
      check(totals(b).facilityDemolitionRefund - totals(prev).facilityDemolitionRefund === freshDisposals.reduce((n, r) => n + r.refund, 0), 'actual total refund credit differs from fresh disposal receipts')
      for (const receipt of freshDisposals) {
        if (receipt.kind !== 'facilityDisposed') continue
        const body = next.physicalPlans.plans.find(p => p.studioId === id && p.id === receipt.planId)!
        check(body?.commitReceipt && body.work.kind === 'placement' && body.work.blueprintId === 'research-laboratory', 'actual disposal missing paid body plan')
        const blueprint = blueprintById('research-laboratory')!
        check(receipt.refund === facilityDemolitionRefund(blueprint) && receipt.refund < body.commitReceipt.cost, 'actual disposal refund law/capital basis differs')
        check(!b.operations.facilities.some(f => f.id === receipt.facilityId), 'disposed body remains operational')
        check(next.hollywood!.receipts.filter(r => r.kind === 'facilityDisposed' && r.studioId === id && r.facilityId === receipt.facilityId).length === 1, 'duplicate disposal refund receipt')
        ;(result.disposals as unknown[]).push({ studioId: id, week: receipt.week, observedProducedWeek: next.market.tick,
          facilityId: receipt.facilityId, planId: receipt.planId, paidCapital: body.commitReceipt.cost, refund: receipt.refund,
          quotedBlueprint: body.work.blueprintId, bodyWeeklyOpex: blueprint.weeklyOperatingCost,
          refundMovementDelta: totals(b).facilityDemolitionRefund - totals(prev).facilityDemolitionRefund,
          beforeCash: prev.account.cash, afterCash: b.account.cash })
      }
      if (isOperatingStudio(s, id)) {
        const removed = next.hollywood!.receipts.filter(r => r.kind === 'facilityDisposed' && r.studioId === id && r.week <= week)
        avoided[id] += removed.length * blueprintById('research-laboratory')!.weeklyOperatingCost
      }
      const loanWeek = first[id].firstLoanWeek
      if (loanWeek !== null && week >= Number(loanWeek)) {
        for (const r of freshReceipts.filter(r => r.studioId === id)) {
          if (r.kind === 'employment' && (r.reason === 'entry' || r.reason === 'replacement')) setFirst(id, 'firstHiringAfterLoan', { week: r.week, eventId: r.eventId })
          if (r.kind === 'employment' && r.reason === 'renewal') setFirst(id, 'firstRenewalAfterLoan', { week: r.week, eventId: r.eventId })
          if (r.kind === 'filmAnnounced') setFirst(id, 'firstGreenlightAfterLoan', { week: r.week, productionId: r.productionId })
          if (r.kind === 'filmReleased') setFirst(id, 'firstReleaseAfterLoan', { week: r.week, productionId: r.productionId })
        }
        for (const p of b.development.projects.filter(p => !prev.development.projects.some(old => old.id === p.id))) setFirst(id, 'firstCommissionAfterLoan', { week: p.commissionedWeek, scriptProjectId: p.id })
        for (const take of next.firstTakes.slice(beforeTakes).filter(t => t.studioId === id)) setFirst(id, 'firstTakeAfterLoan', { week: take.week, productionId: take.productionId })
        const revenue = totals(b).studioRevenue - totals(prev).studioRevenue
        if (revenue > 0) setFirst(id, 'firstRevenueAfterLoan', { inputWeek: week, amount: revenue, scope: 'any actual film revenue; may originate from preloan film, not itself resumed production proof' })
      }
    }
    s = next; result.lastCompletedWeek = s.market.tick
    if ((s.market.tick <= 520 && s.market.tick % 10 === 0) || s.market.tick === horizon) {
      admit(s, `checkpoint${s.market.tick}`)
      ;(result.checkpointRows as unknown[]).push({ week: s.market.tick, rivals: s.hollywood!.businesses.map(b => summary(s, b.studioId)) })
    }
    if (s.market.tick % 100 === 0) process.stdout.write(JSON.stringify({ progressWeek: s.market.tick, ticksAttempted: result.ticksAttempted }) + '\n')
  }
  admit(s, 'final600'); check(sha(bytes(initial)) === initialSHA, 'original admitted130 input mutated across route')
  check(s.corporateCondition.loans.length > 0, 'fixed route did not exercise actual principal producer')
  result.final = s.hollywood!.businesses.map(b => {
    const id = b.studioId, end = summary(s, id), loans = s.corporateCondition.loans.filter(l => l.studioId === id)
    const start = startingTotals[id], finalTotals = totals(b)
    const closure = s.studioClosure.closures.find(c => c.studioId === id)
    first[id].lowestObservedCash = Math.min(Number(first[id].lowestObservedCash), end.cash)
    if (end.cash < end.reserve) setFirst(id, 'firstBelowReserve', s.market.tick)
    if (end.cash <= 0) setFirst(id, 'firstNonpositiveCash', s.market.tick)
    const postLoanProduction = first[id].firstGreenlightAfterLoan !== null
    const noGreenlightSinceCurrentCutting = b.costCutting.since !== null && !s.hollywood!.receipts.some(r => r.studioId === id && r.kind === 'filmAnnounced' && r.week >= b.costCutting.since!)
    const payments = loans.map(l => {
      const stop = Math.min(s.market.tick, closure?.closureWeek ?? s.market.tick)
      const paidCount = Math.max(0, Math.min(l.installments.length, stop - l.contractedWeek - 1))
      const paidAmount = l.installments.slice(0, paidCount).reduce((n, amount) => n + amount, 0)
      if (closure?.loan?.loanId === l.loanId) check(closure.loan.paidInstallments === paidCount && closure.loan.paidAmount === paidAmount && closure.loan.remainder === l.total - paidAmount, 'actual closure loan summary differs from paid schedule')
      return { loanId: l.loanId, contractedWeek: l.contractedWeek, principal: l.principal, total: l.total,
        installmentsPaid: paidCount, paidAmount,
        remainder: l.total - paidAmount,
        actualClosureStopWeek: closure?.closureWeek ?? null }
    })
    check(payments.reduce((n, l) => n + l.paidAmount, 0) === -finalTotals.loanInstallment, 'scheduled individual payments do not equal actual aggregate installment debit')
    return { ...end, firstObserved: first[id], anyPostLoanGreenlight: loans.length ? postLoanProduction : null,
      postLoanFilmingDisposition: loans.length ? postLoanProduction ? 'actual postloan greenlight observed; subsequent firstTake/release/revenue fields remain separate' : 'NO postloan greenlight within measured horizon; valid negative outcome' : 'NO loan observed; no postloan qualification',
      policyOutcome: closure ? 'actuallyClosed' : end.closureDue ? 'closureDueOnly' : noGreenlightSinceCurrentCutting ? 'noProductionCuttingSurvivorAtHorizon' : 'operatingAtHorizon-not-guaranteedSustainable',
      routeMovements: Object.fromEntries(Object.keys(finalTotals).map(k => [k, finalTotals[k as RivalMoneyKind] - start[k as RivalMoneyKind]])),
      avoidedDisposedBodyOpexOnActualChargedOperatingInputs: avoided[id],
      loans: payments, cumulativeMovementBasis: 'route deltas begin at first observed current-policy snapshot; annual periods separately retain actual entry capital/signing',
      annualFinancePeriodSummaries: b.account.periods.map(p => ({ fromWeek: p.fromWeek, throughWeek: p.throughWeek, opening: p.opening, closing: p.closing, movements: p.movements })) }
  })
  result.nextTick = null; within('complete'); result.status = 'CURRENT_ROUTE_OUTCOME_ACCOUNTING_OBSERVED_PARTIAL_REPROBE_NOT_ACCEPTANCE'
} catch (error) {
  result.status = error instanceof Premise ? 'UNMET_PREMISE_NOT_ACCEPTANCE' : 'DIAGNOSTIC_ERROR_NOT_ACCEPTANCE'
  result.error = (error as Error).message; process.exitCode = error instanceof Premise ? 2 : 1
}
result.elapsedMs = performance.now()
writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
process.stdout.write(JSON.stringify({ kind: result.kind, status: result.status, ticksAttempted: result.ticksAttempted,
  lastCompletedWeek: result.lastCompletedWeek ?? null, error: result.error ?? null, elapsedMs: result.elapsedMs,
  diagnosticSHA256: sha(readFileSync(output)) }) + '\n')
