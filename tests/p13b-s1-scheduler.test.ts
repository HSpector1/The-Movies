import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { activeContract, weeklySalary } from '../src/core/employment.js'
import { exportSave, importSave, makeSave, migrateToV24 } from '../src/core/save.js'
import { eligibleSeatIds, researchCandidates, researchWeekQuote, weeklyResearchPayroll } from '../src/core/technology.js'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aLaboratorySlice, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'

// P13B-S1 plan tests 3, 4, 5 and 7 (test 6, same-name identity through the Laboratory
// bridge page, lives in tests/bridge-p13b-s1-identity.test.ts). Generated worlds only; every dated fact comes from
// the live engine. A single default-seed ('p13a-core-causal-01') world is
// built once and reused as the common ancestor for every branch below so this
// file pays for exactly one world generation for its main scenarios; the
// independent-replay half of test 7 pays for its own, unavoidable, separate generation.
let laboratoryFacilityId: string
let entry: GameState // week 260, Laboratory operational with acoustic instruments, no Scientists yet
let week60Base: GameState // the same lot at week 60, before any recruit

type FixtureA = { begun: GameState; boundary: GameState; laboratoryFacilityId: string; projectId: string; ids: string[] }
type FixtureB = { paused: GameState; laboratoryFacilityId: string; projectId: string; id: string }
let fixtureA: FixtureA
let fixtureB: FixtureB

/** One Scientist (ids[0]) recruited at week 60 (contract 60->268, so it lapses
 * mid-project); three more (ids[1..3]) recruited at week 260 (contract
 * 260->468). All four assigned, research begun at the paper-table $40k
 * ceiling, advanced to week 269 — the boundary where ids[0]'s contract has
 * just lapsed and n has dropped from four to three. */
function buildFixtureA(base: GameState, lab: string): FixtureA {
  const ids = researchCandidates(base).map(c => c.id)
  let state = applyActions(base, [{ kind: 'recruitScientist', laboratoryFacilityId: lab, scientistId: ids[0]! }])
  state = advanceTo(state, 260)
  state = applyActions(state, [ids[1]!, ids[2]!, ids[3]!].map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId: lab, scientistId })))
  state = applyActions(state, [ids[0]!, ids[1]!, ids[2]!, ids[3]!].map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab, scientistId, technologyId: 'synchronized-sound' as const })))
  const projectId = state.technology.projects[0]!.id
  const begun = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 40_000 }])
  const boundary = advanceTo(begun, 269)
  return { begun, boundary, laboratoryFacilityId: lab, projectId, ids: ids.slice(0, 4) }
}

/** One Scientist recruited at week 60 (contract 60->268), assigned and begun
 * at week 260 at a $0 ceiling (output 1/week — far short of the 64 units
 * needed), advanced to week 268 where the only seat lapses and the project
 * must auto-pause without ever completing. */
function buildFixtureB(base: GameState, lab: string): FixtureB {
  const id = researchCandidates(base)[4]!.id
  let state = applyActions(base, [{ kind: 'recruitScientist', laboratoryFacilityId: lab, scientistId: id }])
  state = advanceTo(state, 260)
  state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: lab, scientistId: id, technologyId: 'synchronized-sound' }])
  const projectId = state.technology.projects[0]!.id
  state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 0 }])
  const paused = advanceTo(state, 268)
  return { paused, laboratoryFacilityId: lab, projectId, id }
}

function assertRoundTrip(state: GameState) {
  const direct = exportSave(makeSave(state))
  const restored = migrateToV24(importSave(direct)).state
  expect(exportSave(makeSave(restored))).toBe(direct)
}

beforeAll(() => {
  const labComplete = p13aLaboratorySlice()
  laboratoryFacilityId = labComplete.operations.facilities.find(f => f.capability === 'laboratory')!.id
  const installed = applyActions(labComplete, [{ kind: 'installAcousticInstruments', laboratoryFacilityId }])
  week60Base = advanceTo(installed, 60)
  entry = advanceTo(week60Base, 260)
  fixtureA = buildFixtureA(week60Base, laboratoryFacilityId)
  fixtureB = buildFixtureB(week60Base, laboratoryFacilityId)
}, 120_000)

describe('P13B-S1 scheduler table (test 3)', () => {
  function branch(seatCount: number, budgetPerWeek: number) {
    const ids = researchCandidates(entry).slice(0, seatCount).map(c => c.id)
    let state = applyActions(entry, ids.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
    state = applyActions(state, ids.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId, technologyId: 'synchronized-sound' as const })))
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek }])
    const quote = researchWeekQuote(state, state.technology.projects[0]!)
    return { state, quote, ids }
  }

  it('4 seats x $40,000 ceiling: 40,000 spend / 6 output / 11 funded weeks, then the matching receipt and ledger charge', () => {
    const { state, quote, ids } = branch(4, 40_000)
    expect(quote).toMatchObject({ spend: 40_000, output: 6, seats: 4, remainingWeeks: 11 })
    expect(quote.seatTalentIds).toEqual(ids)
    const ticked = tick(state)
    const project = ticked.technology.projects[0]!
    expect(project.verifiedWork).toBe(6)
    expect(project.expenditure).toBe(40_000)
    expect(project.weeks).toEqual([{ week: state.market.tick, seatTalentIds: ids, spend: 40_000, units: 960_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 40_000, rawUnits: 120_000 }] }])
    expect(ticked.ledger.some(e => e.kind === 'researchSpend' && e.amount === -40_000 && e.note === `research:${project.id}`)).toBe(true)
  })

  it('1 seat x $40,000 ceiling: 10,000 spend / 1.5 output / 43 funded weeks', () => {
    const { state, quote, ids } = branch(1, 40_000)
    expect(quote).toMatchObject({ spend: 10_000, output: 1.5, seats: 1, remainingWeeks: 43 })
    const ticked = tick(state)
    const project = ticked.technology.projects[0]!
    expect(project.verifiedWork).toBe(1.5)
    expect(project.expenditure).toBe(10_000)
    expect(project.weeks).toEqual([{ week: state.market.tick, seatTalentIds: ids, spend: 10_000, units: 240_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 10_000, rawUnits: 30_000 }] }])
  })

  it('4 seats x $0 ceiling: 0 spend / 4 output / 16 funded weeks, and no ledger charge at all', () => {
    const { state, quote, ids } = branch(4, 0)
    expect(quote).toMatchObject({ spend: 0, output: 4, seats: 4, remainingWeeks: 16 })
    const ticked = tick(state)
    const project = ticked.technology.projects[0]!
    expect(project.verifiedWork).toBe(4)
    expect(project.expenditure).toBe(0)
    expect(project.weeks).toEqual([{ week: state.market.tick, seatTalentIds: ids, spend: 0, units: 640_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 0, rawUnits: 80_000 }] }])
    expect(ticked.ledger.some(e => e.kind === 'researchSpend' && e.note === `research:${project.id}`)).toBe(false)
  })

  it('2 seats x $25,000 ceiling: 20,000 spend / 3 output / 22 funded weeks', () => {
    const { state, quote, ids } = branch(2, 25_000)
    expect(quote).toMatchObject({ spend: 20_000, output: 3, seats: 2, remainingWeeks: 22 })
    const ticked = tick(state)
    const project = ticked.technology.projects[0]!
    expect(project.verifiedWork).toBe(3)
    expect(project.expenditure).toBe(20_000)
    expect(project.weeks).toEqual([{ week: state.market.tick, seatTalentIds: ids, spend: 20_000, units: 480_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 20_000, rawUnits: 60_000 }] }])
  })
})

describe('P13B-S1 expiry, rehire and pause (test 4)', () => {
  it('drops n from four to three when one contract ends mid-project, retains the seat, and keeps the project active', () => {
    const { boundary, ids } = fixtureA
    const project = boundary.technology.projects[0]!
    expect(project.status).toBe('active')
    expect(project.seats.find(s => s.talentId === ids[0])).toEqual({ talentId: ids[0], laboratoryFacilityId, assignedWeek: 260, releasedWeek: null })
    expect(eligibleSeatIds(boundary, project)).toEqual([ids[1], ids[2], ids[3]])
    expect(project.weeks).toHaveLength(9)
    expect(project.weeks[7]).toEqual({ week: 267, seatTalentIds: ids, spend: 40_000, units: 960_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 40_000, rawUnits: 120_000 }] })
    expect(project.weeks[8]).toEqual({ week: 268, seatTalentIds: [ids[1], ids[2], ids[3]], spend: 30_000, units: 720_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [ids[1], ids[2], ids[3]], spend: 30_000, rawUnits: 90_000 }] })
    expect(project.verifiedWork).toBe(52.5)
    expect(project.expenditure).toBe(350_000)
  })

  it('lets the same expired id be rehired mid-project with no new seat row and no resume needed while active, then names it in the next receipt', () => {
    const { boundary, ids } = fixtureA
    const rehired = applyActions(boundary, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId: ids[0]! }])
    expect(rehired.technology).toBe(boundary.technology) // recruiting touches employment only, never technology
    const project = rehired.technology.projects[0]!
    expect(project.seats).toHaveLength(4)
    expect(eligibleSeatIds(rehired, project)).toEqual(ids)
    expect(project.status).toBe('active')
    const next = tick(rehired)
    const receipt = next.technology.projects[0]!.weeks.at(-1)!
    expect(receipt).toEqual({ week: 269, seatTalentIds: ids, spend: 40_000, units: 960_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: ids, spend: 40_000, rawUnits: 120_000 }] })
    expect(next.technology.projects[0]!.verifiedWork).toBe(58.5)
  })

  it('continues researchPayroll for the still-employed seats after one contract expires, at a lower but still positive total', () => {
    const { boundary, ids } = fixtureA
    const [, b, c, d] = ids
    const expected = [b!, c!, d!].reduce((sum, id) => sum + weeklySalary(activeContract(boundary, id)!.annualSalary), 0)
    const payrollRow = (week: number) => -boundary.ledger.find(e => e.kind === 'researchPayroll' && e.week === week)!.amount
    expect(payrollRow(268)).toBe(expected)
    expect(payrollRow(268)).toBeGreaterThan(0)
    expect(payrollRow(268)).toBeLessThan(payrollRow(260))
  })

  it('auto-pauses when the only seat’s contract lapses, retains verified work, refuses resumeResearch, then accepts it after rehiring the same id', () => {
    const { paused, projectId, id, laboratoryFacilityId: lab } = fixtureB
    const project = paused.technology.projects[0]!
    expect(project.status).toBe('paused')
    expect(project.verifiedWork).toBe(8)
    expect(project.weeks).toHaveLength(8)
    expect(project.weeks[7]).toEqual({ week: 267, seatTalentIds: [id], spend: 0, units: 160_000, labs: [{ laboratoryFacilityId: lab, seatTalentIds: [id], spend: 0, rawUnits: 20_000 }] })
    expect(weeklyResearchPayroll(paused, 268)).toBe(0)
    expect(() => applyActions(paused, [{ kind: 'resumeResearch', projectId }])).toThrow(/Employ and assign/)
    const rehired = applyActions(paused, [{ kind: 'recruitScientist', laboratoryFacilityId: lab, scientistId: id }])
    expect(eligibleSeatIds(rehired, rehired.technology.projects[0]!)).toEqual([id])
    const resumed = applyActions(rehired, [{ kind: 'resumeResearch', projectId }])
    expect(resumed.technology.projects[0]!.status).toBe('active')
    expect(resumed.technology.projects[0]!.budgetPerWeek).toBe(0)
    const next = tick(resumed)
    expect(next.technology.projects[0]!.weeks.at(-1)).toEqual({ week: 268, seatTalentIds: [id], spend: 0, units: 160_000, labs: [{ laboratoryFacilityId: lab, seatTalentIds: [id], spend: 0, rawUnits: 20_000 }] })
    expect(next.technology.projects[0]!.verifiedWork).toBe(9)
  })

  it('pauses immediately, in the same action, when the last eligible seat is released early', () => {
    const scientistId = researchCandidates(entry)[0]!.id
    let state = applyActions(entry, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId }])
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId, technologyId: 'synchronized-sound' }])
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])
    expect(state.technology.projects[0]!.status).toBe('active')
    const released = applyActions(state, [{ kind: 'releaseResearchSeat', projectId, scientistId }])
    expect(released.technology.projects[0]!.status).toBe('paused')
  })
})

describe('P13B-S1 conservation across a funded interval (test 5)', () => {
  it('reconciles receipts, expenditure, ledger, cash and payroll over six funded weeks', () => {
    const ids = researchCandidates(entry).slice(0, 3).map(c => c.id)
    let state = applyActions(entry, ids.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
    state = applyActions(state, ids.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId, technologyId: 'synchronized-sound' as const })))
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 30_000 }])
    const cashBefore = state.studio.cash
    const ledgerBefore = state.ledger.length

    const after = advanceTo(state, state.market.tick + 6)
    const project = after.technology.projects[0]!
    expect(project.weeks).toHaveLength(6)

    const receiptSpend = project.weeks.reduce((sum, r) => sum + r.spend, 0)
    const receiptUnits = project.weeks.reduce((sum, r) => sum + r.units, 0)
    expect(receiptSpend).toBe(project.expenditure)
    const ledgerSpend = after.ledger.filter(e => e.kind === 'researchSpend' && e.note === `research:${projectId}`).reduce((sum, e) => sum - e.amount, 0)
    expect(ledgerSpend).toBe(project.expenditure)
    expect(receiptUnits).toBe(Math.round(project.verifiedWork * 160_000))

    const newRows = after.ledger.slice(ledgerBefore)
    const cashDelta = cashBefore - after.studio.cash
    expect(cashDelta).toBe(newRows.reduce((sum, row) => sum - row.amount, 0))

    const expectedPayroll = ids.reduce((sum, id) => sum + weeklySalary(activeContract(after, id)!.annualSalary), 0)
    const payrollRows = newRows.filter(row => row.kind === 'researchPayroll')
    expect(payrollRows).toHaveLength(6)
    for (const row of payrollRows) expect(-row.amount).toBe(expectedPayroll)
  })
})

describe('P13B-S1 determinism, replay and interleaving (test 7)', () => {
  it('rebuilds byte-identically from the same seed and the same action list, both before and after further identical actions', () => {
    const replay = p13aResearchEntry()
    expect(exportSave(makeSave(replay))).toBe(exportSave(makeSave(entry)))

    const ids = researchCandidates(entry).slice(0, 2).map(c => c.id)
    const sequence = (state: GameState) => {
      let s = applyActions(state, ids.map(scientistId => ({ kind: 'recruitScientist' as const, laboratoryFacilityId, scientistId })))
      s = applyActions(s, ids.map(scientistId => ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId, technologyId: 'synchronized-sound' as const })))
      const projectId = s.technology.projects[0]!.id
      s = applyActions(s, [{ kind: 'beginResearch', projectId, budgetPerWeek: 20_000 }])
      return advanceTo(s, s.market.tick + 3)
    }
    expect(exportSave(makeSave(sequence(entry)))).toBe(exportSave(makeSave(sequence(replay))))
  }, 30_000)

  it('changes the seat count from the next receipt only when a person is seated mid-project', () => {
    const [c0, c1] = researchCandidates(entry).map(c => c.id)
    let state = applyActions(entry, [
      { kind: 'recruitScientist', laboratoryFacilityId, scientistId: c0! },
      { kind: 'recruitScientist', laboratoryFacilityId, scientistId: c1! },
    ])
    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: c0!, technologyId: 'synchronized-sound' }])
    const projectId = state.technology.projects[0]!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])
    state = advanceTo(state, state.market.tick + 2)
    expect(state.technology.projects[0]!.weeks).toEqual([
      { week: 260, seatTalentIds: [c0], spend: 10_000, units: 240_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [c0], spend: 10_000, rawUnits: 30_000 }] },
      { week: 261, seatTalentIds: [c0], spend: 10_000, units: 240_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [c0], spend: 10_000, rawUnits: 30_000 }] },
    ])

    state = applyActions(state, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: c1!, technologyId: 'synchronized-sound' }])
    state = tick(state)
    const project = state.technology.projects[0]!
    expect(project.weeks[0]).toEqual({ week: 260, seatTalentIds: [c0], spend: 10_000, units: 240_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [c0], spend: 10_000, rawUnits: 30_000 }] })
    expect(project.weeks[1]).toEqual({ week: 261, seatTalentIds: [c0], spend: 10_000, units: 240_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [c0], spend: 10_000, rawUnits: 30_000 }] })
    expect(project.weeks[2]).toEqual({ week: 262, seatTalentIds: [c0, c1], spend: 10_000, units: 400_000, labs: [{ laboratoryFacilityId: laboratoryFacilityId, seatTalentIds: [c0, c1], spend: 10_000, rawUnits: 50_000 }] })
  })

  it('round-trips save/reload byte-identically after seating, after funded weeks, after expiry and after pause', () => {
    const seatId = researchCandidates(entry)[7]!.id
    const seatedOnly = applyActions(
      applyActions(entry, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId: seatId }]),
      [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: seatId, technologyId: 'synchronized-sound' }],
    )
    assertRoundTrip(seatedOnly)

    const fundedId = researchCandidates(entry)[6]!.id
    let funded = applyActions(entry, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId: fundedId }])
    funded = applyActions(funded, [{ kind: 'assignResearchScientist', laboratoryFacilityId, scientistId: fundedId, technologyId: 'synchronized-sound' }])
    const projectId = funded.technology.projects[0]!.id
    funded = applyActions(funded, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])
    funded = advanceTo(funded, funded.market.tick + 3)
    assertRoundTrip(funded)

    assertRoundTrip(fixtureA.boundary)
    assertRoundTrip(fixtureB.paused)
  })
})
