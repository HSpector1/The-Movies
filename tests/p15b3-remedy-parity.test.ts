// ── P15B Wave 3 RED: remedy parity (1352-A §3 row 3, §4.3; 1357-A §3.4) ──────────────────────
// One legal release predicate for both studios, the remedy capability built from it, and the live
// remedy list. Each leaf imports `src/core/corporateConditionLive.js` dynamically and fails by name
// while the module or an export is missing, so the RED reads as the missing law, not as a type error.
//
// Fixtures: tests/helpers/p15b-live.ts (the genuine week-130 capture, migrated to live).
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { tick } from '../src/core/tick.js'
import { terminationCost } from '../src/core/employment.js'
import { productionCompanyTalentIds } from '../src/core/productionPeople.js'
import type { Action, GameState } from '../src/core/types.js'
import { base, BASE_WEEK, drainPlayer, drainRival, ledgerRows, loansOf, PLAYER, R01, R04, recordOf, refuses, rivalMovement, ticksTo } from './helpers/p15b-live.js'

type Live = Record<string, unknown>
async function live(): Promise<Live> {
  try { return (await import('../src/core/corporateConditionLive.js')) as unknown as Live }
  catch (error) { throw new Error(`RED: src/core/corporateConditionLive.ts does not exist (${(error as Error).message})`) }
}
function fn<T>(mod: Live, name: string): T {
  const value = mod[name]
  if (typeof value !== 'function') throw new Error(`RED: src/core/corporateConditionLive.ts exports no function '${name}'`)
  return value as T
}
type Refusal = (state: GameState, studioId: string, talentId: string) => string | null
type Count = (state: GameState, studioId: string, week?: number) => number
type Capability = (state: GameState, studioId: string) => { hasPendingRelease: boolean; terminableContracts: number; hasOutstandingLoan: boolean; founding: boolean }
type Remedies = (state: GameState, studioId: string) => string[]

const FOUNDING_TEXT = 'the founding draft is still open; release waits until the studio is founded (R2)'
const activeRivalEmployees = (s: GameState, studioId: string) =>
  s.hollywood!.activeEmploymentOrdinals.map((i) => s.hollywood!.employment[i]!).filter((e) => e.studioId === studioId)

let hiredState: GameState | null = null
/** The player signs the capture's one free agent at 130 (D-11 signContract), so the player holds one contract. */
function hired(): GameState {
  if (hiredState === null) {
    const s = base()
    const talentId = s.freeAgents[0]
    if (talentId === undefined) throw new Error('premise: the capture holds a free agent to sign')
    hiredState = applyActions(s, [{ kind: 'signContract', talentId, termWeeks: 52 } as Action])
    if (hiredState.contracts.length !== 1) throw new Error('premise: signContract at 130 yields one player contract')
  }
  return hiredState
}

describe('p15b3 remedy parity: one legal release predicate (1352-A §4.3; 1357-A §3.4)', () => {
  it('release-predicate-player', async () => {
    const releaseRefusal = fn<Refusal>(await live(), 'releaseRefusal')
    const s = hired()
    const talentId = s.contracts[0]!.talentId
    expect(releaseRefusal(s, PLAYER, talentId)).toBeNull()
    // Founding: refused by the one predicate, and applyActions' sentence is the predicate's own.
    const founding: GameState = { ...s, founding: { applicantIds: [], budget: 0, spentBonus: 0 } }
    expect(releaseRefusal(founding, PLAYER, talentId)).toBe(FOUNDING_TEXT)
    refuses(() => applyActions(founding, [{ kind: 'releaseTalent', talentId } as Action]), `releaseTalent rejected — ${FOUNDING_TEXT}`)
    // A legal release goes through, with the shared charge law (R2/R3) and no loan or closure row.
    const released = applyActions(s, [{ kind: 'releaseTalent', talentId } as Action])
    expect(released.contracts.length).toBe(0)
    expect(ledgerRows(released, 'termination').at(-1)).toMatchObject({ week: BASE_WEEK, amount: -terminationCost(s.contracts[0]!, BASE_WEEK), talentId })
  })

  it('release-predicate-rival-seats-and-writing', async () => {
    const mod = await live()
    const releaseRefusal = fn<Refusal>(mod, 'releaseRefusal')
    const terminableContracts = fn<Count>(mod, 'terminableContracts')
    // r04 at 130: six employees, none seated, none writing → all six are legally terminable.
    const s = base()
    const employees = activeRivalEmployees(s, R04)
    expect(employees.length).toBe(6)
    for (const e of employees) expect(releaseRefusal(s, R04, e.terms.talentId)).toBeNull()
    expect(terminableContracts(s, R04)).toBe(6)
    // A rival production seats its company: the seat refusal is the player's own sentence.
    const route = ticksTo(s, 145)
    let seated: { state: GameState; studioId: string; production: GameState['studio']['activeProductions'][number] } | null = null
    for (const state of route.values()) {
      for (const b of state.hollywood!.businesses) {
        const production = b.productions[0]
        if (production !== undefined) { seated = { state, studioId: b.studioId, production }; break }
      }
      if (seated !== null) break
    }
    if (seated === null) throw new Error('premise: some rival holds an active production in weeks 130-145')
    const company = [...productionCompanyTalentIds([seated.production])]
    const rivalIds = new Set(activeRivalEmployees(seated.state, seated.studioId).map((e) => e.terms.talentId))
    const seatedEmployee = company.find((id) => rivalIds.has(id))
    if (seatedEmployee === undefined) throw new Error('premise: the production seats one of its own employees')
    expect(releaseRefusal(seated.state, seated.studioId, seatedEmployee))
      .toBe(`talent "${seatedEmployee}" is seated on active production "${seated.production.id}" until it is released (R2)`)
    const refusedCount = [...rivalIds].filter((id) => releaseRefusal(seated.state, seated.studioId, id) !== null).length
    expect(refusedCount).toBeGreaterThan(0)
    expect(terminableContracts(seated.state, seated.studioId)).toBe(rivalIds.size - refusedCount)
    // A forged writing assignment on a rival screenplay refuses with the player's writing sentence.
    const h = s.hollywood!
    const b = h.businesses.find((x) => x.studioId === R04)!
    const ordinal = b.activeScriptOrdinals[0]!
    const project = b.development.projects[ordinal]!
    const writerId = employees[0]!.terms.talentId
    const forged: GameState = { ...s, hollywood: { ...h, businesses: h.businesses.map((x) => x.studioId !== R04 ? x
      : { ...x, development: { ...x.development, projects: x.development.projects.map((p, i) => i === ordinal
        ? { ...p, status: 'drafting' as const, writerId, dueWeek: BASE_WEEK + 4, rewriteCount: 0 as const, assessment: null, productionId: null } : p) } }) } }
    const title = h.concepts.find((c) => c.id === project.conceptId)!.title
    // The label is the player's own (`Drafting <title>`, scriptDevelopment.ts activeScriptWriterAssignments).
    expect(releaseRefusal(forged, R04, writerId)).toBe(`talent "${writerId}" is Drafting ${title} and must finish that screenplay task first`)
    expect(terminableContracts(forged, R04)).toBe(5)
  })

  it('rival-release-loop-uses-the-predicate', async () => {
    const releaseRefusal = fn<Refusal>(await live(), 'releaseRefusal')
    // r3 (review T10): behavior, never source text. r01 drained by 14M cuts costs from 155 and, at its decision at
    // 156, releases five of its six employees under R8's cost-cutting release law (r01-4 stays by that law's choice).
    const W = 156
    const route = ticksTo(drainRival(base(), R01, 14_000_000), W + 1)
    const input = route.get(W)!
    const ended = (s: GameState) => s.hollywood!.receipts.filter((r) => r.kind === 'employment' && r.reason === 'termination' && r.studioId === R01 && r.week === W).map((r) => (r as { talentId: string }).talentId)
    const released = ended(route.get(W + 1)!)
    expect(released.length, 'premise: the route holds real rival early releases').toBe(5)
    // Every release is one the one predicate allows at its input week.
    for (const id of released) expect(releaseRefusal(input, R01, id), `release of ${id}`).toBeNull()
    // The loop asks the predicate: with the predicate refusing one of those five (the player's own sentence), the same
    // input keeps that person and still releases the other four.
    const mod = (await import('../src/core/corporateConditionLive.js')) as unknown as { releaseRefusal: Refusal }
    const kept = released[0]!
    const original = mod.releaseRefusal
    const spy = vi.spyOn(mod, 'releaseRefusal').mockImplementation((state, studioId, talentId) =>
      (studioId === R01 && talentId === kept ? `talent "${kept}" is seated on active production "forged" until it is released (R2)` : original(state, studioId, talentId)))
    let after: string[]
    let asked = 0
    try { after = ended(tick(input)); asked = spy.mock.calls.filter(([, studioId]) => studioId === R01).length } finally { spy.mockRestore() }
    expect(asked, 'the rival loop consulted the predicate').toBeGreaterThan(0)
    expect(after).not.toContain(kept)
    for (const id of released.filter((x) => x !== kept)) expect(after).toContain(id)
    expect(ended(tick(input))).toEqual(released)
  })
})

describe('p15b3 remedy parity: capability and the live remedy list (1352-A §4.3; 1357-A §3.4)', () => {
  it('remedy-capability-both-studios', async () => {
    const mod = await live()
    const remedyCapability = fn<Capability>(mod, 'remedyCapability')
    const s = base()
    expect(remedyCapability(s, R04)).toEqual({ hasPendingRelease: false, terminableContracts: 6, hasOutstandingLoan: false, founding: false })
    expect(remedyCapability(s, PLAYER)).toEqual({ hasPendingRelease: false, terminableContracts: 0, hasOutstandingLoan: false, founding: false })
    expect(remedyCapability(hired(), PLAYER).terminableContracts).toBe(1)
    const founding: GameState = { ...s, founding: { applicantIds: [], budget: 0, spentBonus: 0 } }
    expect(remedyCapability(founding, PLAYER)).toMatchObject({ founding: true, terminableContracts: 0 })
    // The loan state reads the live loan root: r04 borrows at its distress boundary (138) and repays after.
    const r04 = ticksTo(drainRival(s, R04, 10_000_000), 139)
    expect(remedyCapability(r04.get(137)!, R04).hasOutstandingLoan).toBe(false)
    expect(remedyCapability(r04.get(138)!, R04).hasOutstandingLoan).toBe(true)
    expect(remedyCapability(r04.get(139)!, R04).hasOutstandingLoan).toBe(true)
  })

  it('remedies-live-both-studios', async () => {
    const mod = await live()
    const studioRemedies = fn<Remedies>(mod, 'studioRemedies')
    const s = base()
    // No record at the capture week: no list. Stable with staff: REDUCE_OBLIGATIONS only (LOAN reads the stage).
    expect(studioRemedies(s, R04)).toEqual([])
    const s131 = tick(s)
    expect(recordOf(s131, R04)!.condition.stage).toBe('stable')
    expect(studioRemedies(s131, R04)).toEqual(['REDUCE_OBLIGATIONS'])
    expect(studioRemedies(s131, PLAYER)).toEqual([])
    // r04 drained: warning at 134 opens LOAN beside REDUCE_OBLIGATIONS (two routes, 1352-A §4.3); at the
    // distress boundary the rival policy has already borrowed, so only REDUCE_OBLIGATIONS remains.
    const r04 = ticksTo(drainRival(s, R04, 10_000_000), 165)
    expect(recordOf(r04.get(134)!, R04)!.condition.stage).toBe('warning')
    expect(studioRemedies(r04.get(134)!, R04)).toEqual(['LOAN', 'REDUCE_OBLIGATIONS'])
    expect(recordOf(r04.get(138)!, R04)!.condition.stage).toBe('distress')
    expect(studioRemedies(r04.get(138)!, R04)).toEqual(['REDUCE_OBLIGATIONS'])
    // Closed: never evaluated, no list.
    expect(recordOf(r04.get(163)!, R04)!.condition.stage).toBe('closed')
    expect(studioRemedies(r04.get(163)!, R04)).toEqual([])
    // The player, drained with no staff and no release: LOAN alone in warning, nothing once borrowing.
    const player = ticksTo(drainPlayer(s, s.studio.cash + 1), 134)
    const s134 = player.get(134)!
    expect(studioRemedies(s134, PLAYER)).toEqual(['LOAN'])
    const borrowed = applyActions(s134, [{ kind: 'takeLoan', principal: 390_000 } as Action])
    expect(studioRemedies(borrowed, PLAYER)).toEqual([])
  })

  it('shared-cost-phase', async () => {
    await live()
    // The installment is charged in the fixed-cost phase: the player's row follows the week's overhead row,
    // and the rival's movement lands in the same annual period as that week's payroll (1352-A §4.4; 1357-A §6.4).
    const s = base()
    const player = ticksTo(drainPlayer(s, s.studio.cash + 1), 134)
    const route = ticksTo(applyActions(player.get(134)!, [{ kind: 'takeLoan', principal: 390_000 } as Action]), 137)
    const rows136 = route.get(137)!.ledger.map((row, index) => ({ row, index })).filter(({ row }) => row.week === 136)
    const overhead = rows136.find(({ row }) => row.kind === 'overhead')
    const installment = rows136.find(({ row }) => row.kind === 'loanInstallment')
    expect(overhead).toBeDefined()
    expect(installment).toBeDefined()
    expect(overhead!.index).toBeLessThan(installment!.index)
    // r3 (review T15): the rival's installment due at week w is charged in the advance from w, the same advance that
    // charges w's payroll: compared tick by tick, not by year. r04 drained by 10M borrows at 138.
    const r04 = ticksTo(drainRival(s, R04, 10_000_000), 141)
    const loan = loansOf(r04.get(141)!, R04)[0]!
    expect(loan.contractedWeek).toBe(138)
    const delta = (from: number, kind: string) => rivalMovement(r04.get(from + 1)!, R04, kind) - rivalMovement(r04.get(from)!, R04, kind)
    expect(delta(138, 'loanInstallment'), 'nothing is due at the contract week').toBe(0)
    expect(delta(139, 'loanInstallment')).toBe(-loan.installments[0]!)
    expect(delta(140, 'loanInstallment')).toBe(-loan.installments[1]!)
    for (const from of [138, 139, 140]) expect(delta(from, 'payroll'), `payroll in the advance from ${from}`).toBeLessThan(0)
  })
})
