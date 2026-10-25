// ── P15B Wave 4 RED: actual closure, claims and the finite estate (closure/v1) ──────────────────
// Authority: P15B-WAVE4-CLOSURE-CONTRACT.md §2–§6 as adopted by 1367-G (joint P15B/P16 adoption), with
// 1356-A §7 (the Ranking closure cohort) and 1353-A §7 (the end-of-run hook, disabled until the Legacy
// adapter amendment is adopted). Each leaf reads `src/core/studioClosure.js` and fails by name while an
// export or a record is missing, so the RED reads as the missing law.
//
// Routes (tests/helpers/p15b-live.ts): r04 drained by 10M closes at 163 (`rivalClosure`); the player
// with one signed contract, drained to −1, closes at 163 (`playerClosure`). Both hold negative cash at
// closure, so no claim is paid at C.
// r3 (the 1370-ar review): the estate's run receipts, claims distribution and archival run end to end on
// `forgedEstateRoute` (r03 closes at 131 with a live run; the premise device is documented at the helper); the
// shifted player route (`marketCaseClosure`) closes with an open market case; two genuine p13b captures close
// unfunded (one with a cancelled adoption, one with live research). Pending adoption, build and proposal
// families now have five admitted transaction controls in the separate pending-family test files.
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { terminationCost } from '../src/core/employment.js'
import { industryBusyTalentIds } from '../src/core/hollywood.js'
import { runMarketBatch } from '../src/core/marketIntegration.js'
import { P15_PHASE_ORDER_VERSION, P15_PHASE_TABLES } from '../src/core/p15Phases.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import { exportSave, importSave, makeSave, migrateToLive, stableStringify } from '../src/core/save.js'
import { advanceTalentMarketWeek } from '../src/core/talentMarket.js'
import { tick } from '../src/core/tick.js'
import { CLAIM_PAYMENT_LEDGER_NOTE, TUNING } from '../src/core/tuning.js'
import type { LiveIndustryFilm, RivalBusiness } from '../src/core/hollywoodTypes.js'
import type { Action, ClosureClaim, ClosureDisposition, ClosureRecord, GameState } from '../src/core/types.js'
import { base, BASE_WEEK, canon, claimsOf, closureOf, closureRoot, conditionRoot, drainPlayer, drainRival, ESTATE_CLOSING_DEFICIT, ESTATE_CLOSURE_WEEK, estateEventsOf, eventsOf,
  forgedEstateRoute, ledgerRows, loansOf, MARKET_CASE_CLOSURE_WEEK, marketCaseClosure, PLAYER, PLAYER_CLOSURE_DEFERRED, playerClosure, R01, R02, R03, R04, R04_CLOSURE_WEEK, raw,
  recordOf, refuses, rivalCash, rivalClosure, rivalMovement, sequenceNext, ticks, ticksTo } from './helpers/p15b-live.js'

type Mod = Record<string, unknown>
async function closure(): Promise<Mod> { return (await import('../src/core/studioClosure.js')) as unknown as Mod }
function fn<T>(mod: Mod, name: string): T {
  const value = mod[name]
  if (typeof value !== 'function') throw new Error(`RED: src/core/studioClosure.ts exports no function '${name}' (closure/v1)`)
  return value as T
}
type ValidateRoot = (raw: Record<string, unknown>, label: string) => void
type CloseStudio = (s: GameState, studioId: string, causeEventId: string, options?: { endOfRunHook?: unknown }) => GameState
const C = R04_CLOSURE_WEEK
const D = C + TUNING.CLOSURE_ESTATE_WINDOW_WEEKS
const RUN_FILM = `${R03}:film:13`
const PRODUCTION_FILM = `${R03}:film:14`
const businessOf = (s: GameState, id: string) => s.hollywood!.businesses.find((b) => b.studioId === id)!
const activeRows = (s: GameState, id: string) => s.hollywood!.activeEmploymentOrdinals.map((i) => s.hollywood!.employment[i]!).filter((e) => e.studioId === id)
const byKind = (record: ClosureRecord, kind: string) => record.dispositions.filter((d) => d.subjectKind === kind)
function requireClosure(s: GameState, studioId: string): ClosureRecord {
  const record = closureOf(s, studioId)
  if (record === undefined) throw new Error(`RED: ${studioId} has no closure record at week ${s.market.tick} (closure/v1 §2); the closure phase has not landed`)
  return record as unknown as ClosureRecord
}
const json = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T
function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const key of Object.keys(value as object)) deepFreeze((value as Record<string, unknown>)[key])
  }
  return value
}
const genuine = (name: string): GameState =>
  migrateToLive(JSON.parse(gunzipSync(readFileSync(new URL(`./fixtures/p13b/${name}.json.gz`, import.meta.url))).toString('utf8')) as never).state as GameState
/** Contract RED 4: delete one row of every family the record holds (re-digested and re-counted); the bidirectional
 * check names the live subject left without a disposition. Returns the families exercised. */
async function everyFamilyComplete(state: GameState, closureId: string): Promise<string[]> {
  const mod = await closure()
  const validate = fn<ValidateRoot>(mod, 'validateStudioClosureRoot')
  const digest = fn<(id: string, rows: readonly ClosureDisposition[]) => string>(mod, 'closureDigest')
  expect(() => validate(json(raw(state)), 'control')).not.toThrow()
  const record = closureRoot(state).closures.find((c) => c.closureId === closureId)!
  const kinds = [...new Set(record.dispositions.map((d) => d.subjectKind))]
  for (const kind of kinds) {
    const copy = json(raw(state))
    const target = (copy.studioClosure as { closures: ClosureRecord[] }).closures.find((c) => c.closureId === closureId)!
    const [removed] = target.dispositions.splice(target.dispositions.findIndex((d) => d.subjectKind === kind), 1)
    target.counts[kind] = (target.counts[kind] ?? 0) - 1
    if (target.counts[kind] === 0) delete target.counts[kind]
    target.digest = digest(closureId, target.dispositions)
    refuses(() => validate(copy, 'tamper'), `no disposition for live subject ${kind}:${removed!.subjectId}`)
  }
  return kinds
}

describe('p15b4 closure: the boundary, the terminal state and the loan stop (contract §2)', () => {
  it('closure-record-boundary-phase-ids', async () => {
    const route = rivalClosure(C + 2)
    expect(closureOf(route.get(C - 1)!, R04)).toBeUndefined()
    const s = route.get(C)!
    const record = requireClosure(s, R04)
    const closedEvent = eventsOf(s, R04).find((e) => e.to === 'closed')!
    expect(record).toMatchObject({ closureId: 'studio-closure-1', studioId: R04, closureWeek: C, causeEventId: closedEvent.eventId, lawVersion: 'closure/v1',
      phaseId: 'p15b.closure', phaseOrderVersion: P15_PHASE_ORDER_VERSION, phaseOrdinal: P15_PHASE_TABLES[P15_PHASE_ORDER_VERSION]!.find((e) => e.phaseId === 'p15b.closure')!.phaseOrdinal })
    // The closure follows the condition event in the one P15 sequence, and the allocator moved past it.
    expect(record.p15DomainSequence).toBeGreaterThan(closedEvent.p15DomainSequence)
    expect(sequenceNext(s)).toBeGreaterThan(record.p15DomainSequence)
    expect(closureRoot(s).nextClosure).toBe(2)
    expect(record.endOfRun).toBeNull()
    expect(record.receipts).toEqual([])
    // The condition record is unchanged by the closure, and the closure is never minted twice.
    expect(recordOf(s, R04)!.condition).toMatchObject({ stage: 'closed', week: C })
    expect(closureRoot(route.get(C + 2)!).closures.length).toBe(1)
    // r3 (review C8; contract §5): the record is immutable after creation; later estate transactions are their own records.
    expect(canon(requireClosure(route.get(C + 2)!, R04))).toBe(canon(record))
  })

  it('closure-terminal-operating-state', async () => {
    const mod = await closure()
    const isOperatingStudio = fn<(s: GameState, id: string) => boolean>(mod, 'isOperatingStudio')
    const closedWeekOf = fn<(s: GameState) => ReadonlyMap<string, number>>(mod, 'closedWeekOf')
    const route = rivalClosure(C + 7)
    const before = route.get(C - 1)!
    const at = route.get(C)!
    const later = route.get(C + 7)!
    expect(isOperatingStudio(before, R04)).toBe(true)
    expect(isOperatingStudio(at, R04)).toBe(false)
    expect([...closedWeekOf(later).entries()]).toEqual([[R04, C]])
    // Every live interval ended at C by a `closure` receipt; the person is free (no active row anywhere).
    const live = activeRows(before, R04)
    expect(live.length).toBe(6)
    expect(activeRows(at, R04)).toEqual([])
    for (const e of live) {
      const ended = at.hollywood!.employment.find((x) => x.contractId === e.contractId)!
      expect(ended.endedWeek).toBe(C)
      const receipt = at.hollywood!.receipts.find((r) => r.kind === 'employment' && r.contractId === e.contractId && r.toStudioId === null)
      expect(receipt).toMatchObject({ week: C, reason: 'closure', studioId: R04, fromStudioId: R04, talentId: e.terms.talentId })
      expect(at.hollywood!.activeEmploymentOrdinals.some((i) => at.hollywood!.employment[i]!.terms.talentId === e.terms.talentId)).toBe(false)
    }
    // r3 (review C5/D9; contract §3 "people become ordinary free agents in week C"): a rival's released staff join free
    // agency exactly as the player's do, each once, in the expiry path's (contract id) order.
    const released = [...live].sort((a, b) => (a.contractId < b.contractId ? -1 : 1)).map((e) => e.terms.talentId)
    for (const id of released) expect(before.freeAgents, id).not.toContain(id)
    expect(at.freeAgents.filter((id) => released.includes(id))).toEqual(released)
    expect(new Set(at.freeAgents).size).toBe(at.freeAgents.length)
    // The ordinary week C − 1 → C settled normally; from input week C on, nothing is charged or decided.
    for (const kind of ['payroll', 'overhead', 'facilityOpex', 'loanInstallment', 'production', 'development', 'marketing', 'signing'] as const) {
      expect(rivalMovement(later, R04, kind), kind).toBe(rivalMovement(at, R04, kind))
    }
    expect(rivalMovement(at, R04, 'overhead')).toBeLessThan(rivalMovement(before, R04, 'overhead'))
    expect(businessOf(later, R04).account.cash).toBe(businessOf(at, R04).account.cash)
    expect(businessOf(later, R04).nextDecisionWeek).toBe(businessOf(at, R04).nextDecisionWeek)
    // Terminal history stays readable: the business, its screenplays, facilities and films remain.
    expect(businessOf(later, R04).development.projects.length).toBe(businessOf(before, R04).development.projects.length)
    expect(later.hollywood!.films.filter((f) => f.studioId === R04).length).toBe(before.hollywood!.films.filter((f) => f.studioId === R04).length)
    // The other studios keep operating and being evaluated.
    expect(recordOf(later, PLAYER)!.condition.week).toBe(C + 7)
    expect(activeRows(later, R01).length).toBeGreaterThan(0)
  })

  it('closure-loan-stop', async () => {
    const mod = await closure()
    const installmentsPaid = fn<(loan: { contractedWeek: number; installments: number[] }, week: number, stopWeek: number | null) => number>(mod, 'installmentsPaid')
    const route = rivalClosure(C + 7)
    const s = route.get(C)!
    const loan = loansOf(s, R04)[0]!
    expect(loan.contractedWeek).toBe(138)
    const record = requireClosure(s, R04)
    const paid = C - loan.contractedWeek - 1
    const paidAmount = loan.installments.slice(0, paid).reduce((a, b) => a + b, 0)
    expect(record.loan).toEqual({ loanId: loan.loanId, stopWeek: C, paidInstallments: paid, paidAmount, remainder: loan.total - paidAmount })
    // The installment due at C − 1 was charged on arrival at C; the one due at C never is (contract §2).
    expect(rivalMovement(s, R04, 'loanInstallment')).toBe(-paidAmount)
    expect(rivalMovement(route.get(C + 7)!, R04, 'loanInstallment')).toBe(-paidAmount)
    // The loan row itself is byte-stable across the closure (1357-A §4 keys; the stop lives on the closure).
    expect(canon(loansOf(route.get(C + 7)!, R04)[0])).toBe(canon(loansOf(route.get(C - 1)!, R04)[0]))
    // r3 (review C15/D12): the P16 reader is stop-aware; from C the stopped balance is the closure record's `loan`.
    const conditionLive = (await import('../src/core/corporateConditionLive.js')) as unknown as { outstandingLoan: (s: GameState, id: string, week?: number) => { loanId: string } | undefined }
    expect(conditionLive.outstandingLoan(route.get(C - 1)!, R04)).toMatchObject({ loanId: loan.loanId })
    expect(conditionLive.outstandingLoan(s, R04)).toBeUndefined()
    expect(conditionLive.outstandingLoan(route.get(C + 7)!, R04)).toBeUndefined()
    // The formula: clamp(min(T, C) − contractedWeek − 1, 0, 52), near the first and the final installment.
    const law = { contractedWeek: 100, installments: Array.from({ length: 52 }, () => 1) }
    expect(installmentsPaid(law, 101, null)).toBe(0)
    expect(installmentsPaid(law, 102, null)).toBe(1)
    expect(installmentsPaid(law, 153, null)).toBe(52)
    expect(installmentsPaid(law, 400, null)).toBe(52)
    expect(installmentsPaid(law, 400, 101)).toBe(0)
    expect(installmentsPaid(law, 400, 130)).toBe(29)
    expect(installmentsPaid(law, 120, 130)).toBe(19)
    expect(byKind(record, 'loan')).toMatchObject([{ subjectId: loan.loanId, status: 'applied' }])
  })
})

describe('p15b4 closure: claims, dispositions, titles and the estate window (contract §3–§4)', () => {
  it('closure-claims-and-estate-archive', async () => {
    const mod = await closure()
    type View = { status: string; archivedWeek: number | null; lots: { status: string }[] }
    const estateView = fn<(s: GameState, c: ClosureRecord) => View>(mod, 'estateView')
    const route = rivalClosure(D + 1)
    const before = route.get(C - 1)!
    const s = route.get(C)!
    const record = requireClosure(s, R04)
    const live = activeRows(before, R04).filter((e) => e.terms.endWeekExclusive > C)
    const claims = claimsOf(s, record.closureId) as unknown as ClosureClaim[]
    expect(claims.length).toBe(live.length)
    // Ascending source contract id, then claim id; one claim per interval at terminationCost(contract, C).
    const expectedOrder = [...live].sort((a, b) => (a.contractId < b.contractId ? -1 : 1))
    claims.forEach((claim, i) => {
      const e = expectedOrder[i]!
      expect(claim).toMatchObject({ claimId: `closure-claim-${i + 1}`, closureId: record.closureId, studioId: R04, kind: 'employment', sourceContractId: e.contractId,
        claimantTalentId: e.terms.talentId, lawVersion: 'closure/v1', original: terminationCost(e.terms, C), paid: 0, unpaid: terminationCost(e.terms, C), status: 'unpaid', payments: [] })
      expect(claim.original).toBeGreaterThan(0)
    })
    expect(closureRoot(s).nextClaim).toBe(live.length + 1)
    // Negative closing cash: nothing distributable, no payment, no reset to zero (contract §3).
    expect(record.cash.closing).toBe(businessOf(s, R04).account.cash)
    expect(record.cash.closing).toBeLessThan(0)
    expect(record.cash.distributable).toBe(0)
    expect(rivalMovement(s, R04, 'claimPayment')).toBe(0)
    // The estate: open from C, closed once at D = C + 13 by its own sequenced archival event (r3, review C8).
    expect(record.estate).toEqual({ opensWeek: C, closesWeek: D, lots: record.estate.lots })
    expect(estateView(route.get(D - 1)!, requireClosure(route.get(D - 1)!, R04))).toMatchObject({ status: 'open', archivedWeek: null })
    expect(estateEventsOf(route.get(D - 1)!, record.closureId)).toEqual([])
    const atD = route.get(D)!
    const events = estateEventsOf(atD, record.closureId)
    expect(events).toEqual([{ eventId: 'estate-event-1', closureId: record.closureId, studioId: R04, week: D, kind: 'archival', amount: 0, reference: record.closureId,
      p15DomainSequence: events[0]!.p15DomainSequence, phaseId: 'p15b.closure', phaseOrdinal: record.phaseOrdinal, phaseOrderVersion: P15_PHASE_ORDER_VERSION }])
    expect(events[0]!.p15DomainSequence).toBeGreaterThan(record.p15DomainSequence)
    expect(sequenceNext(atD)).toBeGreaterThan(events[0]!.p15DomainSequence)
    const view = estateView(atD, requireClosure(atD, R04))
    expect(view).toMatchObject({ status: 'archived', archivedWeek: D })
    expect(view.lots.every((lot) => lot.status === 'archived')).toBe(true)
    // Archival keeps every unpaid obligation honestly, and nothing changes the record or pays afterwards.
    for (const claim of claimsOf(atD, record.closureId)) expect(claim).toMatchObject({ paid: 0, status: 'unpaidArchived' })
    expect(canon(requireClosure(route.get(D + 1)!, R04))).toBe(canon(record))
    expect(estateEventsOf(route.get(D + 1)!, record.closureId)).toEqual(events)
    expect(rivalMovement(route.get(D + 1)!, R04, 'claimPayment')).toBe(0)
  })

  it('closure-dispositions-complete-and-digest', async () => {
    const mod = await closure()
    const closureDigest = fn<(closureId: string, dispositions: readonly ClosureDisposition[]) => string>(mod, 'closureDigest')
    const route = rivalClosure(C + 1)
    const before = route.get(C - 1)!
    const s = route.get(C)!
    const record = requireClosure(s, R04)
    const b = businessOf(s, R04)
    // Every live subject exactly once, in canonical (kind, id) order, each with its prior-state proof and law version.
    const live = activeRows(before, R04).filter((e) => e.terms.endWeekExclusive > C)
    expect(byKind(record, 'employment').map((d) => d.subjectId).sort()).toEqual(live.map((e) => e.contractId).sort())
    for (const d of byKind(record, 'employment')) expect(d).toMatchObject({ status: 'applied', lawVersion: 'closure/v1' })
    expect(byKind(record, 'employment').every((d) => typeof d.claimId === 'string')).toBe(true)
    expect(byKind(record, 'facility').map((d) => d.subjectId).sort()).toEqual(b.operations.facilities.map((f) => f.id).sort())
    expect(byKind(record, 'facility').length).toBeGreaterThan(0)
    const plans = s.physicalPlans.plans.filter((p) => p.studioId === R04)
    expect(byKind(record, 'physicalPlan').map((d) => d.subjectId).sort()).toEqual(plans.map((p) => p.id).sort())
    const films = s.hollywood!.films.filter((f) => f.studioId === R04)
    expect(byKind(record, 'title').map((d) => d.subjectId).sort()).toEqual(films.map((f) => f.filmId).sort())
    expect(byKind(record, 'title').every((d) => typeof d.lotId === 'string')).toBe(true)
    expect(byKind(record, 'loan').length).toBe(1)
    expect(byKind(record, 'cash').length).toBe(1)
    // r3 (review T13): this route holds no screenplay, production, run, research or market subject; those families are
    // pinned with non-empty premises on the estate, market-case, research and transaction leaves below.
    expect(Object.keys(record.counts).sort()).toEqual(['cash', 'employment', 'facility', 'loan', 'physicalPlan', 'title'])
    const ids = record.dispositions.map((d) => `${d.subjectKind}:${d.subjectId}`)
    expect(new Set(ids).size).toBe(ids.length)
    expect([...ids].sort()).toEqual(ids)
    const counts: Record<string, number> = {}
    for (const d of record.dispositions) counts[d.subjectKind] = (counts[d.subjectKind] ?? 0) + 1
    expect(record.counts).toEqual(counts)
    expect(record.digest).toBe(closureDigest(record.closureId, record.dispositions))
    expect(record.digest).not.toBe(closureDigest(record.closureId, record.dispositions.slice(1)))
    // An incomplete plan is cancelled at C with zero refund; a completed Laboratory stays as a facility.
    for (const plan of plans) {
      const d = byKind(record, 'physicalPlan').find((x) => x.subjectId === plan.id)!
      if (plan.status === 'cancelled') expect(plan.statusWeek).toBe(C)
      expect(d.status).toBe('applied')
    }
    expect(rivalMovement(s, R04, 'researchCapacity')).toBe(rivalMovement(before, R04, 'researchCapacity'))
    expect(rivalMovement(s, R04, 'technologyRefund')).toBe(0)
    expect(await everyFamilyComplete(s, record.closureId)).toEqual(['cash', 'employment', 'facility', 'loan', 'physicalPlan', 'title'])
  })

  it('closure-titles-handoff-lots', async () => {
    const mod = await closure()
    const estateView = fn<(s: GameState, c: ClosureRecord) => { lots: { lotId: string; subjectId: string; status: string }[] }>(mod, 'estateView')
    const route = rivalClosure(D)
    const s = route.get(C)!
    const record = requireClosure(s, R04)
    const films = s.hollywood!.films.filter((f) => f.studioId === R04).map((f) => f.filmId).sort()
    expect(films.length).toBeGreaterThan(0)
    // One R2 lot per owned title, pending through the window, never sold or free: archived at D (P16 reads estateView).
    expect(record.estate.lots.map((lot) => lot.subjectId)).toEqual(films)
    record.estate.lots.forEach((lot, i) => expect(lot).toEqual({ lotId: `${record.closureId}:lot:${i + 1}`, right: 'R2', subjectId: films[i] }))
    expect(estateView(s, record).lots.every((lot) => lot.status === 'pending')).toBe(true)
    for (const d of byKind(record, 'title')) expect(record.estate.lots.some((lot) => lot.lotId === d.lotId && lot.subjectId === d.subjectId)).toBe(true)
    expect(estateView(route.get(D)!, requireClosure(route.get(D)!, R04)).lots.every((lot) => lot.status === 'archived')).toBe(true)
    // Films stay the studio's: creator and title chains are untouched by the handoff.
    expect(canon(route.get(D)!.hollywood!.films.filter((f) => f.studioId === R04))).toBe(canon(s.hollywood!.films.filter((f) => f.studioId === R04)))
  })

  it('closure-distribution-law', async () => {
    const mod = await closure()
    type Distribute = (claims: readonly ClosureClaim[], available: number, week: number, reference: string) => { claims: ClosureClaim[]; payments: { claimId: string; talentId: string; amount: number }[] }
    const distributeClaims = fn<Distribute>(mod, 'distributeClaims')
    const claim = (claimId: string, sourceContractId: string, original: number, paid = 0): ClosureClaim => ({ claimId, closureId: 'studio-closure-9', studioId: R04, kind: 'employment', sourceContractId,
      claimantTalentId: `person-${claimId}`, lawVersion: 'closure/v1', original, paid, unpaid: original - paid, status: paid === 0 ? 'unpaid' : paid === original ? 'paid' : 'partiallyPaid', payments: [] })
    const claims = [claim('closure-claim-2', 'b:contract', 100), claim('closure-claim-1', 'a:contract', 50), claim('closure-claim-3', 'b:contract', 40)]
    // Ascending source contract id, then claim id; min(available, unpaid) each; partial payment allowed.
    const paid = distributeClaims(claims, 120, 170, 'estate')
    expect(paid.payments).toEqual([{ claimId: 'closure-claim-1', talentId: 'person-closure-claim-1', amount: 50 }, { claimId: 'closure-claim-2', talentId: 'person-closure-claim-2', amount: 70 }])
    expect(paid.claims.map((c) => [c.claimId, c.paid, c.unpaid, c.status])).toEqual([
      ['closure-claim-1', 50, 0, 'paid'], ['closure-claim-2', 70, 30, 'partiallyPaid'], ['closure-claim-3', 0, 40, 'unpaid']])
    expect(paid.claims[0]!.payments).toEqual([{ week: 170, amount: 50, reference: 'estate' }])
    // Nothing available: no payment, no row, no change. A fractional available pays whole units only.
    expect(distributeClaims(claims, 0, 170, 'estate').payments).toEqual([])
    expect(distributeClaims(claims, -5, 170, 'estate').payments).toEqual([])
    expect(distributeClaims(claims, 49.9, 170, 'estate').payments).toEqual([{ claimId: 'closure-claim-1', talentId: 'person-closure-claim-1', amount: 49 }])
    // original = paid + unpaid always; a payment above the remainder refuses.
    refuses(() => distributeClaims([claim('closure-claim-1', 'a', 10, 11)], 5, 170, 'estate'), 'claim')
  })

  it('closure-pagination', async () => {
    const mod = await closure()
    const closureDigest = fn<(closureId: string, dispositions: readonly ClosureDisposition[]) => string>(mod, 'closureDigest')
    type Page = (record: ClosureRecord, cursor: number) => { closureId: string; digest: string; total: number; cursor: number; rows: ClosureDisposition[]; nextCursor: number | null }
    const closureDispositionsPage = fn<Page>(mod, 'closureDispositionsPage')
    const dispositions: ClosureDisposition[] = Array.from({ length: 250 }, (_, i) => ({ subjectKind: 'title', subjectId: `film-${String(i).padStart(3, '0')}`, prior: 'owned', result: 'lot', status: 'pending', claimId: null, lotId: `studio-closure-9:lot:${i + 1}`, lawVersion: 'closure/v1' }))
    const record = { closureId: 'studio-closure-9', dispositions, counts: { title: 250 }, digest: closureDigest('studio-closure-9', dispositions) } as unknown as ClosureRecord
    const first = closureDispositionsPage(record, 0)
    expect(first.rows.length).toBe(TUNING.CLOSURE_QUERY_PAGE_ROWS)
    expect(first).toMatchObject({ closureId: 'studio-closure-9', digest: record.digest, total: 250, cursor: 0, nextCursor: 100 })
    const second = closureDispositionsPage(record, first.nextCursor!)
    const third = closureDispositionsPage(record, second.nextCursor!)
    expect(third.rows.length).toBe(50)
    expect(third.nextCursor).toBeNull()
    expect([...first.rows, ...second.rows, ...third.rows]).toEqual(dispositions)
    expect(closureDispositionsPage(record, 100).rows).toEqual(second.rows)
    refuses(() => closureDispositionsPage(record, 7), 'cursor')
  })
})

describe('p15b4 closure: the estate end to end (contract §3–§5, RED 3 and RED 5; review T7, C8, D5)', () => {
  const EC = ESTATE_CLOSURE_WEEK
  const ED = EC + TUNING.CLOSURE_ESTATE_WINDOW_WEEKS

  it('estate-run-receipts-claims-and-archival', async () => {
    const mod = await closure()
    const estateRunInstallment = fn<(film: LiveIndustryFilm, due: number) => number | null>(mod, 'estateRunInstallment')
    const route = forgedEstateRoute(ED + 1)
    expect(() => makeSave(route.get(BASE_WEEK)!), 'premise: the forged migration boundary is lawful in shape').not.toThrow()
    const before = route.get(EC - 1)!
    const s = route.get(EC)!
    const record = requireClosure(s, R03)
    const runBefore = businessOf(before, R03).runs.find((r) => r.productionId === RUN_FILM)!
    // Premises: r03 closes at C with a run three installments from its end, a production and screenplays live.
    expect(record.closureWeek).toBe(EC)
    expect(runBefore).toMatchObject({ weekIndex: 2, totalWeeks: 6, releaseTick: 128 })
    expect(byKind(record, 'theatricalRun').map((d) => [d.subjectId, d.status])).toEqual([[RUN_FILM, 'applied']])
    expect(byKind(record, 'production').map((d) => d.subjectId)).toEqual([PRODUCTION_FILM])
    expect(byKind(record, 'screenplay').length).toBeGreaterThan(0)
    expect(record.cash.closing).toBeLessThan(0)
    expect(record.cash.closing).toBeGreaterThan(-ESTATE_CLOSING_DEFICIT - 1)
    expect(record.cash.distributable).toBe(0)
    expect(record.receipts).toEqual([])
    const film = (st: GameState) => st.hollywood!.films.find((f): f is LiveIndustryFilm => f.provenance === 'simulation/v1' && f.filmId === RUN_FILM)!
    const share = (index: number) => runBefore.weeklyGross[index]! * runBefore.studioShare
    // RED 5: the installment due at C − 1 was paid once, by the operating run loop in the advance that reached C.
    expect(film(s).studioRevenueReceived).toBeCloseTo(film(before).studioRevenueReceived + share(2), 6)
    // The estate collects exactly the installments due from C on, one per boundary at T − 1, each its own sequenced event.
    const end = route.get(ED + 1)!
    const events = estateEventsOf(end, record.closureId)
    const receipts = events.filter((e) => e.kind === 'runReceipt')
    expect(receipts.map((e) => [e.week, e.reference])).toEqual([[EC + 1, `${RUN_FILM}:due:${EC}`], [EC + 2, `${RUN_FILM}:due:${EC + 1}`], [EC + 3, `${RUN_FILM}:due:${EC + 2}`]])
    receipts.forEach((e, i) => {
      expect(e.amount).toBeCloseTo(share(3 + i), 6)
      expect(estateRunInstallment(film(before), EC + i)).toBeCloseTo(share(3 + i), 6)
    })
    expect(estateRunInstallment(film(before), EC + 3)).toBeNull()
    // D5: the final installment settles the film at its due week, the canonical schedule, with its receipt that week.
    const settled = route.get(EC + 3)!
    expect(film(settled).settledWeek).toBe(runBefore.releaseTick + runBefore.totalWeeks - 1)
    expect(settled.hollywood!.receipts.filter((r) => r.kind === 'filmSettled' && r.productionId === RUN_FILM).map((r) => r.week)).toEqual([EC + 2])
    expect(businessOf(settled, R03).runs).toEqual([])
    expect(film(settled).studioRevenueReceived).toBeCloseTo(runBefore.weeklyGross.reduce((a, b) => a + b, 0) * runBefore.studioShare, 6)
    // RED 3: a receipt first reduces negative cash; only floor(max(0, cash)) is then distributed.
    const distributions = events.filter((e) => e.kind === 'distribution')
    expect(distributions[0]!.week).toBe(EC + 1)
    expect(distributions[0]!.amount).toBe(Math.floor(record.cash.closing + receipts[0]!.amount))
    expect(distributions[0]!.amount).toBeLessThan(receipts[0]!.amount)
    // Every batch pays in (source contract, claim) order, min(available, unpaid) each: an independent replay.
    const claims = claimsOf(end, record.closureId)
    expect(claims.length).toBe(6)
    expect(claims.map((c) => c.sourceContractId)).toEqual([...claims.map((c) => c.sourceContractId)].sort())
    const unpaid = new Map(claims.map((c) => [c.claimId, c.original]))
    let cash = record.cash.closing
    for (const week of [EC, ...new Set(receipts.map((e) => e.week))]) {
      cash += receipts.filter((e) => e.week === week).reduce((sum, e) => sum + e.amount, 0)
      let available = Math.floor(Math.max(0, cash))
      for (const c of claims) {
        const pay = Math.min(available, unpaid.get(c.claimId)!)
        expect(c.payments.filter((p) => p.week === week).reduce((sum, p) => sum + p.amount, 0), `${c.claimId} at ${week}`).toBe(pay)
        available -= pay
        cash -= pay
        unpaid.set(c.claimId, unpaid.get(c.claimId)! - pay)
      }
      const batch = distributions.find((d) => d.week === week)
      const paidThatWeek = claims.flatMap((c) => c.payments.filter((p) => p.week === week))
      if (batch === undefined) expect(paidThatWeek).toEqual([])
      else {
        expect(paidThatWeek.reduce((sum, p) => sum + p.amount, 0)).toBe(batch.amount)
        for (const p of paidThatWeek) expect(p.reference).toBe(batch.eventId)
      }
    }
    // The statuses the amounts and the archived estate dictate: paid, partially paid and archived unpaid all occur.
    for (const c of claims) expect(c.status).toBe(c.paid === c.original ? 'paid' : c.paid === 0 ? 'unpaidArchived' : 'partiallyPaid')
    expect(new Set(claims.map((c) => c.status))).toEqual(new Set(['paid', 'partiallyPaid', 'unpaidArchived']))
    // Conservation: closing + estate receipts − claim payments, every payment one debit of the shared kind.
    const paidTotal = claims.reduce((sum, c) => sum + c.paid, 0)
    expect(paidTotal).toBe(distributions.reduce((sum, d) => sum + d.amount, 0))
    expect(rivalMovement(end, R03, 'claimPayment')).toBe(-paidTotal)
    expect(rivalCash(end, R03)).toBeCloseTo(record.cash.closing + receipts.reduce((sum, e) => sum + e.amount, 0) - paidTotal, 6)
    // Identity (contract §2, §5): stable ids, the one P15 sequence and the phase triple; one archival at D; the record never changes.
    events.forEach((e, i) => {
      expect(e).toMatchObject({ eventId: `estate-event-${i + 1}`, closureId: record.closureId, studioId: R03, phaseId: 'p15b.closure', phaseOrdinal: record.phaseOrdinal, phaseOrderVersion: record.phaseOrderVersion })
      expect(e.p15DomainSequence).toBeGreaterThan(i === 0 ? record.p15DomainSequence : events[i - 1]!.p15DomainSequence)
    })
    expect(events.filter((e) => e.kind === 'archival').map((e) => e.week)).toEqual([ED])
    expect(canon(requireClosure(end, R03))).toBe(canon(record))
    for (let week = EC; week <= ED + 1; week++) expect(() => makeSave(route.get(week)!), `week ${week}`).not.toThrow()
    const mid = route.get(EC + 2)!
    const reloaded = migrateToLive(importSave(exportSave(makeSave(mid)))).state as unknown as GameState
    expect(canon(reloaded)).toBe(canon(mid))
    expect(canon(ticks(reloaded, 3))).toBe(canon(ticks(mid, 3)))
    // Every family this closure holds (screenplay, production and run included) is complete in both directions.
    const families = await everyFamilyComplete(s, record.closureId)
    for (const kind of ['production', 'screenplay', 'theatricalRun']) expect(families).toContain(kind)
  })

  it('estate-validator-mutants', async () => {
    const validateSaveP15B = (await import('../src/core/save.js') as unknown as { validateSaveP15B: (save: unknown) => unknown }).validateSaveP15B
    const route = forgedEstateRoute(EC + 4)
    const state = route.get(EC + 4)!
    const closureId = requireClosure(state, R03).closureId
    expect(() => validateSaveP15B(makeSave(state))).not.toThrow()
    type Payment = { week: number; amount: number; reference: string }
    type Save = { state: { studioClosure: { claims: (ClosureClaim & { payments: Payment[] })[]; estateEvents: Record<string, unknown>[]; nextEstateEvent: number; closures: Record<string, unknown>[] };
      p15Sequence: { next: number }; ledger: Record<string, unknown>[]; studio: { cash: number }; hollywood: { businesses: { studioId: string; account: { cash: number; periods: { movements: Record<string, number>; closing: number }[] } }[] } } }
    const tamper = (edit: (s: Save['state']) => void): Save => { const save = json(makeSave(state)) as unknown as Save; edit(save.state); return save }
    const claims = (s: Save['state']) => s.studioClosure.claims.filter((c) => c.closureId === closureId)
    const eventAt = (s: Save['state'], week: number, kind: string) => s.studioClosure.estateEvents.find((e) => e.week === week && e.kind === kind)!
    const rival = (s: Save['state'], id: string) => s.hollywood.businesses.find((b) => b.studioId === id)!
    const debitRival = (s: Save['state'], id: string, amount: number) => { const b = rival(s, id); const p = b.account.periods.at(-1)!; p.movements.claimPayment = (p.movements.claimPayment ?? 0) - amount; p.closing -= amount; b.account.cash -= amount }
    const premise = claims(json(makeSave(state)).state as unknown as Save['state'])
    const [c1, c2] = premise
    const w1 = c1!.payments[0]!.week
    const w2 = c1!.payments[1]!.week
    expect(c1!.payments.length, 'premise: the first claim is paid over two batches').toBe(2)
    expect(c2!.payments.map((p) => p.week), 'premise: the second claim is paid in the first claim\'s second batch').toEqual([w2])
    expect(c2!.payments[0]!.amount).toBeGreaterThan(c1!.payments[0]!.amount)
    const partial = premise.find((c) => c.paid > 0 && c.paid < c.original)!
    const cases: [string, (s: Save['state']) => void][] = [
      // C7: an excess payment above the replayed cap (every total kept consistent).
      ['replay', (s) => { const c = claims(s).find((x) => x.claimId === partial.claimId)!; const p = c.payments.at(-1)!; p.amount += 1; c.paid += 1; c.unpaid -= 1
        ;(eventAt(s, p.week, 'distribution').amount as number) += 1; debitRival(s, R03, 1) }],
      // C7: priority broken, every per-week and per-claim total unchanged (claim 2 paid before claim 1 is complete).
      ['replay', (s) => { const [a, b] = claims(s); const moved = a!.payments[0]!.amount
        a!.payments = [{ week: w2, amount: a!.payments[1]!.amount + moved, reference: a!.payments[1]!.reference }]
        b!.payments = [{ week: w1, amount: moved, reference: c1!.payments[0]!.reference }, { week: w2, amount: b!.payments[0]!.amount - moved, reference: b!.payments[0]!.reference }] }],
      // C7: one claim paid twice in one batch.
      ['paid twice', (s) => { const b = claims(s)[1]!; const p = b.payments[0]!; const half = Math.floor(p.amount / 2); b.payments = [{ ...p, amount: half }, { ...p, amount: p.amount - half }] }],
      // C18: a payment dated before the closure week.
      ['before the closure week', (s) => { claims(s)[0]!.payments[0]!.week = EC - 1 }],
      // RED 5: a lost estate receipt, and an installment collected twice (the one paid by the operating loop at C).
      ['missing the run receipt', (s) => { s.studioClosure.estateEvents = s.studioClosure.estateEvents.filter((e) => !(e.kind === 'runReceipt' && e.week === EC + 2)) }],
      ['not a scheduled installment', (s) => { s.studioClosure.estateEvents.push({ ...eventAt(s, EC + 1, 'runReceipt'), eventId: `estate-event-${s.studioClosure.nextEstateEvent}`, week: EC + 4,
        reference: `${RUN_FILM}:due:${EC - 1}`, p15DomainSequence: s.p15Sequence.next }); s.studioClosure.nextEstateEvent += 1; s.p15Sequence.next += 1 }],
      // C8: an estate event's own identity.
      ['phase triple', (s) => { (s.studioClosure.estateEvents[0]!.phaseOrdinal as number) += 1 }],
      ['p15DomainSequence', (s) => { s.studioClosure.estateEvents[1]!.p15DomainSequence = s.studioClosure.estateEvents[0]!.p15DomainSequence }],
      // C8: the record is immutable; a later batch written into it is refused.
      ['distribution record', (s) => { (s.studioClosure.closures[0]!.receipts as unknown[]).push({ week: EC + 1, kind: 'distribution', amount: 1, reference: closureId }) }],
      // D4: money under the claim kind that no claim accounts for, for a studio that has not closed (F1 player, F2 rival).
      ['claimPayment', (s) => { s.ledger.push({ week: EC + 4, kind: 'claimPayment', amount: -1000, talentId: c1!.claimantTalentId, note: CLAIM_PAYMENT_LEDGER_NOTE }); s.studio.cash -= 1000 }],
      ['claimPayment', (s) => { debitRival(s, R01, 1000) }],
    ]
    for (const [text, edit] of cases) refuses(() => validateSaveP15B(tamper(edit)), text)
  })
})

describe('p15b4 closure: the player, the market, the families and the transaction (contract §2–§5)', () => {
  it('closure-player-read-only-end-of-run', async () => {
    const mod = await closure()
    const isOperatingStudio = fn<(s: GameState, id: string) => boolean>(mod, 'isOperatingStudio')
    const route = playerClosure()
    const last = Math.max(...route.keys())
    expect(last).toBe(C)
    const s = route.get(C)!
    const before = route.get(C - 1)!
    const record = requireClosure(s, PLAYER)
    expect(record).toMatchObject({ closureId: 'studio-closure-1', studioId: PLAYER, closureWeek: C, lawVersion: 'closure/v1', endOfRun: s.campaignLegacy.endOfRun!.legacySnapshotId })
    expect(isOperatingStudio(s, PLAYER)).toBe(false)
    // One signed contract becomes one claim at the capped exit law; the person is a free agent at C; unpaid at negative cash.
    const contract = before.contracts[0]!
    expect(before.contracts.length).toBe(1)
    expect(s.contracts).toEqual([])
    expect(s.freeAgents).toContain(contract.talentId)
    const claims = claimsOf(s, record.closureId)
    expect(claims).toMatchObject([{ claimantTalentId: contract.talentId, original: terminationCost(contract, C), paid: 0, status: 'unpaid' }])
    expect(ledgerRows(s, 'claimPayment')).toEqual([])
    expect(ledgerRows(s, 'termination').filter((row) => row.week === C)).toEqual([])
    expect(record.cash.closing).toBe(s.studio.cash)
    expect(record.cash.distributable).toBe(0)
    const row = s.hollywood!.employment.find((e) => e.studioId === PLAYER && e.terms.talentId === contract.talentId)!
    expect(row.endedWeek).toBe(C)
    // The record's exact rows: the claim, the two sets kept in place and the preserved cash; nothing pending on this route.
    expect(record.loan).toBeNull()
    expect(record.dispositions.map((d) => [d.subjectKind, d.status])).toEqual([['cash', 'applied'], ['employment', 'applied'], ['set', 'applied'], ['set', 'applied']])
    expect(s.campaignLegacy.endOfRun).toMatchObject({ kind: 'endOfRun', definition: 'campaign-legacy/v4', closureId: record.closureId, boundaryWeek: C + 1 })
    expect(s.campaignLegacy.endOfRun!.p15DomainSequence).toBeGreaterThan(record.p15DomainSequence)
    expect(s.p15Sequence.next).toBe(s.campaignLegacy.endOfRun!.p15DomainSequence + 1)
    expect(() => makeSave(s)).not.toThrow()
    // Read-only history: the week never advances again and no action is taken.
    refuses(() => tick(s), 'read-only')
    refuses(() => applyActions(s, [{ kind: 'publicity', tier: 1 } as unknown as Action]), 'read-only')
    // Earlier saves are untouched: the state before closure still ticks.
    expect(tick(before).market.tick).toBe(C)
  })

  it('closure-disposes-an-open-market-case (review C6/D3)', async () => {
    // The shifted route: the player's interval ends at 182, so the market opens its expiry case at 170, the same
    // advance in which the player becomes closure due. r2 refused this closure inside tick() and the run could
    // never advance again.
    const route = marketCaseClosure()
    const s = route.get(MARKET_CASE_CLOSURE_WEEK)!
    const contract = route.get(MARKET_CASE_CLOSURE_WEEK - 1)!.contracts[0]!
    const record = requireClosure(s, PLAYER)
    expect(record.closureWeek).toBe(MARKET_CASE_CLOSURE_WEEK)
    const kase = s.talentMarket.cases.find((k) => k.subjectStudioId === PLAYER && k.talentId === contract.talentId)!
    expect(kase).toMatchObject({ openedWeek: MARKET_CASE_CLOSURE_WEEK, outcome: 'invalidated', closedWeek: MARKET_CASE_CLOSURE_WEEK, reason: 'the subject studio closed' })
    expect(byKind(record, 'marketCase').map((d) => [d.subjectId, d.status])).toEqual([[`${kase.contractId}:${(kase as { variant?: string }).variant ?? 'expiry'}`, 'applied']])
    // The market's own invalidation receipt, and the person is a free agent with no open case left anywhere.
    expect(s.talentMarket.receipts.filter((r) => r.kind === 'invalidated' && r.talentId === contract.talentId && r.week === MARKET_CASE_CLOSURE_WEEK).length).toBe(1)
    expect(s.talentMarket.cases.some((k) => k.subjectStudioId === PLAYER && k.outcome === null)).toBe(false)
    expect(s.freeAgents).toContain(contract.talentId)
    expect(() => makeSave(s)).not.toThrow()
    refuses(() => tick(s), 'read-only')
    expect(await everyFamilyComplete(s, record.closureId)).toContain('marketCase')
  })

  it('closure-genuine-unfunded-route-closes (review T4)', () => {
    // The p13b-s7 capture unfunded: its unmanaged player closes with its lighting adoption cancelled at 793 (not in
    // flight). r2 refused this closure inside tick() at 847 and every later advance threw the same refusal.
    let s = genuine('legacy-v26-lighting-restored-795')
    expect(s.technology.adoptions.filter((a) => a.studioId === PLAYER).map((a) => [a.operationalWeek, a.cancelledWeek])).toEqual([[null, 793]])
    while (closureOf(s, PLAYER) === undefined && s.market.tick < 900) s = tick(s)
    const record = requireClosure(s, PLAYER)
    expect(record.closureWeek).toBe(847)
    expect(byKind(record, 'adoption')).toEqual([])
    expect(() => makeSave(s)).not.toThrow()
    refuses(() => tick(s), 'read-only')
  })

  it('closure-research-family (review T13)', async () => {
    // A genuine research capture, the player drained to −1: it closes with its research project live.
    let s = genuine('legacy-v20-research-active-280')
    const project = s.technology.projects.find((p) => p.studioId === PLAYER && p.status === 'active')!
    expect(project, 'premise: the capture holds active player research').toBeDefined()
    s = drainPlayer(s, Math.ceil(s.studio.cash) + 1)
    while (closureOf(s, PLAYER) === undefined && s.market.tick < 340) s = tick(s)
    const record = requireClosure(s, PLAYER)
    expect(byKind(record, 'research').map((d) => [d.subjectId, d.status])).toEqual([[project.id, 'applied']])
    expect(() => makeSave(s)).not.toThrow()
    expect(await everyFamilyComplete(s, record.closureId)).toContain('research')
  })

  it('closure-refusal-purity (contract RED 4; review T8)', async () => {
    const mod = await closure()
    const closeStudio = fn<CloseStudio>(mod, 'closeStudio')
    // The player's closure-due state before its closure phase (the browser Lot's deferral leaves it due), deep-frozen.
    const due = deepFreeze(json(tick(playerClosure().get(C - 1)!, PLAYER_CLOSURE_DEFERRED)))
    const bytes = stableStringify(due)
    const cause = eventsOf(due, PLAYER).find((e) => e.to === 'closed')!.eventId
    // A failure after every disposition is built (the end-of-run hook point) writes nothing.
    refuses(() => closeStudio(due, PLAYER, cause, { endOfRunHook: () => { throw new Error('injected mid-build failure') } }), 'injected mid-build failure')
    expect(stableStringify(due)).toBe(bytes)
    // The final validation refuses a result the root's own law rejects (here: claim money on a studio that never closed).
    const orphan = json(due) as unknown as { hollywood: { businesses: { studioId: string; account: { cash: number; periods: { movements: Record<string, number>; closing: number }[] } }[] } }
    const b = orphan.hollywood.businesses.find((x) => x.studioId === R01)!
    const p = b.account.periods.at(-1)!
    p.movements.claimPayment = -1000; p.closing -= 1000; b.account.cash -= 1000
    const orphanBytes = stableStringify(deepFreeze(orphan))
    refuses(() => closeStudio(orphan as unknown as GameState, PLAYER, cause), 'claimPayment')
    expect(stableStringify(orphan)).toBe(orphanBytes)
    // The lawful transaction runs on the frozen input itself (no in-place write) and its retry is the duplicate refusal.
    const closed = closeStudio(due, PLAYER, cause)
    expect(stableStringify(due)).toBe(bytes)
    expect(requireClosure(closed, PLAYER).closureWeek).toBe(C)
    refuses(() => closeStudio(deepFreeze(closed), PLAYER, cause), 'already closed')
    refuses(() => closeStudio(due, R01, cause), 'closure-due event')
    refuses(() => closeStudio(due, PLAYER, 'corporate-event-999'), 'closure-due event')
    expect(stableStringify(due)).toBe(bytes)
  })

  it('closure-operating-loops-skip-closed-studios (review C10/D10; Codex item 7)', async () => {
    const mod = await closure()
    const closedWeekOf = fn<(s: GameState) => ReadonlyMap<string, number>>(mod, 'closedWeekOf')
    const s = rivalClosure(196).get(196)!
    expect(s.talentMarket.cases.filter((k) => k.outcome === null).length, 'premise: open expiry cases at 196').toBeGreaterThan(0)
    const reopen = (state: GameState): GameState => ({ ...state, studioClosure: { ...state.studioClosure, closures: [] } } as unknown as GameState)
    const forgeR04 = (state: GameState, change: (b: RivalBusiness) => Partial<RivalBusiness>): GameState =>
      ({ ...state, hollywood: { ...state.hollywood!, businesses: state.hollywood!.businesses.map((b) => (b.studioId === R04 ? { ...b, ...change(b) } : b)) } })
    // A real production object (r03's film 14 at 130) retained by the closed business at its last production week.
    const donor = businessOf(base(), R03).productions[0]!
    const company = [...productionCompanyTalentIds([donor])]
    expect(company.length).toBeGreaterThan(0)
    const holding = forgeR04(s, () => ({ productions: [{ ...donor, remainingTicks: 1 }] }))
    // 1. The busy set: a closed business's retained work seats no one (the control without the closure does).
    for (const id of company) {
      expect(industryBusyTalentIds(holding.hollywood, closedWeekOf(holding)).has(id), id).toBe(false)
      expect(industryBusyTalentIds(reopen(holding).hollywood, closedWeekOf(reopen(holding))).has(id), id).toBe(true)
    }
    // 2. The shared-market batch: the closed business's production never joins a release batch.
    expect(runMarketBatch(holding, [], 196)!.rivalFactorById.has(donor.id)).toBe(false)
    expect(runMarketBatch(reopen(holding), [], 196)!.rivalFactorById.has(donor.id)).toBe(true)
    // 3. The market's rival proposal loop: with cash and no cost cutting, a closed studio still never proposes.
    const able = forgeR04(s, (b) => ({ costCutting: { version: 1, since: null }, account: { ...b.account, cash: 50_000_000 } }))
    const proposals = (state: GameState) => advanceTalentMarketWeek(state).talentMarket.receipts.slice(state.talentMarket.receipts.length).filter((r) => r.kind === 'proposalSubmitted' && r.studioId === R04).length
    expect(proposals(able)).toBe(0)
    expect(proposals(reopen(able))).toBeGreaterThan(0)
  })

  it('closure-ranking-cohort-v2', async () => {
    const quarterAfter = 13 * Math.ceil((C + 1) / 13)
    const quarterBefore = quarterAfter - 13
    const route = rivalClosure(quarterAfter)
    const archive = (s: GameState) => (raw(s).powerRanking as { snapshots: { week: number; definitionVersion: string; rows: { studioId: string }[] }[] }).snapshots
    const before = archive(route.get(quarterAfter)!).find((r) => r.week === quarterBefore)!
    const after = archive(route.get(quarterAfter)!).find((r) => r.week === quarterAfter)!
    // Before any actual closure, v1 as always and r04 (due or not) is in the cohort.
    expect(before.definitionVersion).toBe('power-ranking/v1')
    expect(before.rows.some((row) => row.studioId === R04)).toBe(true)
    // After r04's actual closure (163 < quarter), the closure cohort excludes it under the new definition; the
    // player and the other three rivals remain, and the earlier record is untouched.
    expect(after.definitionVersion).toBe('power-ranking/v2')
    expect(after.rows.some((row) => row.studioId === R04)).toBe(false)
    expect(after.rows.map((row) => row.studioId).sort()).toEqual([PLAYER, R01, R02, R03].sort())
    expect(canon(archive(route.get(quarterAfter)!).find((r) => r.week === quarterBefore))).toBe(canon(archive(route.get(quarterBefore)!).find((r) => r.week === quarterBefore)))
  })

  it('closure-ranking-cohort-boundary (contract RED 9; review T11)', () => {
    // r02 drained at 136 is negative from 137: warning 140, distress 144, closure due and actual closure at 169 = 13·13.
    let s = ticks(base(), 6)
    s = drainRival(s, R02, Math.ceil(rivalCash(s, R02)) + 10_000_000)
    const route = ticksTo(s, 182)
    expect(requireClosure(route.get(169)!, R02).closureWeek).toBe(169)
    const archive = (st: GameState) => (raw(st).powerRanking as { snapshots: { week: number; definitionVersion: string; rows: { studioId: string }[] }[] }).snapshots
    // The ranking phase precedes the closure phase: a studio closing at W stays in W's snapshot, under v1 (no closure precedes W).
    const at169 = archive(route.get(169)!).find((r) => r.week === 169)!
    expect(at169.definitionVersion).toBe('power-ranking/v1')
    expect(at169.rows.some((row) => row.studioId === R02)).toBe(true)
    const at182 = archive(route.get(182)!).find((r) => r.week === 182)!
    expect(at182.definitionVersion).toBe('power-ranking/v2')
    expect(at182.rows.some((row) => row.studioId === R02)).toBe(false)
    expect(canon(archive(route.get(182)!).find((r) => r.week === 169))).toBe(canon(at169))
    for (const week of [169, 182]) expect(() => makeSave(route.get(week)!), `week ${week}`).not.toThrow()
  })

  it('closure-retry-is-duplicate-refusal', async () => {
    const mod = await closure()
    const closeStudio = fn<CloseStudio>(mod, 'closeStudio')
    const route = rivalClosure(C + 1)
    const s = route.get(C)!
    const record = requireClosure(s, R04)
    const bytes = stableStringify(s)
    refuses(() => closeStudio(s, R04, record.causeEventId), 'already closed')
    // A studio that is not due cannot be closed: nothing is written either way.
    refuses(() => closeStudio(s, R01, record.causeEventId), 'closure-due event')
    expect(stableStringify(s)).toBe(bytes)
    expect(conditionRoot(s).nextEvent).toBe(conditionRoot(route.get(C + 1)!).nextEvent)
  })

  it('closure-tuning-bounds (review T12)', async () => {
    expect(Number.isInteger(TUNING.CLOSURE_ESTATE_WINDOW_WEEKS) && TUNING.CLOSURE_ESTATE_WINDOW_WEEKS > TUNING.THEATRICAL_WEEKS).toBe(true)
    expect(Number.isInteger(TUNING.CLOSURE_QUERY_PAGE_ROWS) && TUNING.CLOSURE_QUERY_PAGE_ROWS >= 1 && TUNING.CLOSURE_QUERY_PAGE_ROWS <= 100).toBe(true)
    // The frozen law table equals TUNING while both are closure/v1; the unused notice page constant is gone.
    const laws = (await closure()).CLOSURE_LAWS as Record<string, Record<string, number>>
    expect(laws['closure/v1']).toEqual({ CLOSURE_ESTATE_WINDOW_WEEKS: TUNING.CLOSURE_ESTATE_WINDOW_WEEKS })
    expect(Object.isFrozen(laws['closure/v1'])).toBe(true)
    expect(Object.hasOwn(TUNING, 'CORPORATE_NOTICE_PAGE_ROWS')).toBe(false)
  })
})
