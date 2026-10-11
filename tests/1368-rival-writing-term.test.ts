import { beforeAll, describe, expect, it } from 'vitest'
import { tick } from '../src/core/tick.js'
import type { GameState } from '../src/core/types.js'
import { admitted, load414, premise414, snap, subject } from './helpers/1368-rival-writing.js'

// The same genuinely generated pre-fix input is used before and after correction.
// Capture/manifest absence or a failed premise is never an intended behavioral RED.
describe('prospective rival writing stays within its existing paid term', () => {
  let original: GameState
  beforeAll(() => { original = load414() }, 30_000)
  it('does not commit the 414 draft due417 against the selected writer term ending416', () => {
    const input = structuredClone(original), before = snap(input)
    const { business, employment } = premise414(input)
    const next = tick(input)
    expect(snap(input)).toBe(before); admitted(next)
    expect(next.hollywood!.employment.find(row => row.contractId === employment.contractId)).toEqual(employment)
    const owner = subject(next).business
    // The whole new-project row is the failure payload on the original source.
    expect(owner.development.projects.filter(project => project.commissionedWeek === 414),
      'new commission needs guaranteed paid work through its completion boundary').toEqual([])
    expect(owner.development.projects).toHaveLength(business.development.projects.length)
    expect(owner.projects).toHaveLength(business.projects.length)
    expect(owner.activeScriptOrdinals).not.toContain(34)
    expect(owner.nextDecisionWeek).toBe(415)
    expect(owner.costCutting.since, 'a term-duration refusal is not cash evidence').toBeNull()
  })
  it('preserves actual expiry416 and remains publicly admissible without unpaid active writing', () => {
    const input = structuredClone(original), before = snap(input)
    const { employment, writerId } = premise414(input)
    const next = tick(input); expect(snap(input)).toBe(before); admitted(next)
    const nextBefore = snap(next), expired = tick(next)
    expect(snap(next)).toBe(nextBefore); expect(expired.market.tick).toBe(416)
    expect(expired.hollywood!.employment.find(row => row.contractId === employment.contractId)).toMatchObject({ endedWeek: 416 })
    expect(expired.hollywood!.receipts.filter(row => row.kind === 'employment'
      && row.contractId === employment.contractId && row.reason === 'expiry' && row.week === 416)).toHaveLength(1)
    expect(expired.hollywood!.employment.filter(row => row.terms.talentId === writerId && row.terms.startWeek >= 414),
      'the guard must not force or fabricate a new paid term').toEqual([])
    admitted(expired) // Intended original-source RED: actual active writer invariant.
    expect(subject(expired).business.development.projects.filter(project =>
      (project.status === 'drafting' || project.status === 'rewriting') && project.writerIds.includes(writerId))).toEqual([])
  })
})
