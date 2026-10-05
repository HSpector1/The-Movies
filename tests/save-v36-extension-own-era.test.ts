// 1362-O item9 / 1344-X12: additive genuine own-era open and used guard witnesses.
// Preserve the original live-chain tests and earlier own-era patch unchanged.
import { describe, expect, it } from 'vitest'
import { convertV36ToV35, migrateToV35, stableStringify, validateSaveV36 } from '../src/core/save.js'
import { EXTENSION_NEW_CONTRACT, EXTENSION_OLD_CONTRACT, EXTENSION_PERSON, EXTENSION_STUDIO,
  extensionFixture, extensionRaw } from './helpers/1367-extension-fixtures.js'

type Save36 = ReturnType<typeof validateSaveV36>
function refusal(run: () => unknown): string {
  try { run() } catch (error) {
    expect(error).toBeInstanceOf(Error)
    return (error as Error).message
  }
  throw new Error('Expected the exact V36 extension downgrade guard to refuse')
}
function exactGuard(save: Save36, expected: string): void {
  // The production loss guard runs before validation. Admission MUST precede
  // either catch, otherwise a malformed object could pass for the wrong reason.
  const before = stableStringify(save)
  expect(validateSaveV36(save)).toBe(save)
  expect(stableStringify(save)).toBe(before)
  expect(refusal(() => convertV36ToV35(save))).toBe(expected)
  expect(stableStringify(save)).toBe(before)
  expect(refusal(() => migrateToV35(save))).toBe(expected)
  expect(stableStringify(save)).toBe(before)
}

describe('1367 genuine V36 retirement-extension downgrade controls', () => {
  it('admits the genuine week92 open case, then first refuses V35 with one case and zero used extensions', () => {
    const { save, raw, facts } = extensionFixture('open'), state = save.state
    const cases = state.talentMarket.cases.filter(row => row.variant === 'retirementExtension')
    const used = state.careerLifecycle.records.filter(row => row.extensionUsed)
    const record = state.careerLifecycle.records.find(row => row.personId === EXTENSION_PERSON)!
    expect(cases).toHaveLength(1); expect(used).toHaveLength(0)
    expect(record).toEqual(facts.record)
    expect(record).toMatchObject({ personId: EXTENSION_PERSON, profession: 'actor', status: 'announced',
      effectiveWeek: 104, extensionUsed: false, extendedFromWeek: null })
    expect(cases[0]).toEqual(facts.extensionCase)
    expect(cases[0]).toEqual({ talentId: EXTENSION_PERSON, subjectStudioId: EXTENSION_STUDIO,
      contractId: EXTENSION_OLD_CONTRACT, openedWeek: 92, closedWeek: null, outcome: null, reason: null, variant: 'retirementExtension' })
    const employment = state.hollywood!.employment.filter(row => row.terms.talentId === EXTENSION_PERSON)
    expect(employment).toEqual(facts.settlementEmployment)
    expect(employment).toHaveLength(1)
    expect(employment[0]).toMatchObject({ contractId: EXTENSION_OLD_CONTRACT, studioId: EXTENSION_STUDIO,
      endedWeek: null, terms: { startWeek: 0, endWeekExclusive: 98, termWeeks: 98 } })
    expect(state.contracts.filter(row => row.talentId === EXTENSION_PERSON)).toEqual([employment[0]!.terms])
    const expected = 'migrateToV35: cannot downgrade SaveFileV36 or discard the retirement extension — it holds 1 retirementExtension case(s) and 0 used extension(s) (first: authored-0000), and V35 has nowhere to record the one final extension'
    expect(facts.expectedRefusal).toBe(expected)
    exactGuard(save, expected)
    expect(extensionRaw('open')).toBe(raw)
  })

  it('admits the genuine week98 used extension WITH its required settled case and employment, then first refuses V35', () => {
    const { save, raw, facts } = extensionFixture('used'), state = save.state
    const cases = state.talentMarket.cases.filter(row => row.variant === 'retirementExtension')
    const used = state.careerLifecycle.records.filter(row => row.extensionUsed)
    expect(cases).toHaveLength(1); expect(used).toHaveLength(1)
    expect(used[0]).toEqual(facts.record)
    expect(used[0]).toMatchObject({ personId: EXTENSION_PERSON, profession: 'actor', status: 'announced',
      effectiveWeek: 156, extensionUsed: true, extendedFromWeek: 104 })
    expect(used[0]!.effectiveWeek - used[0]!.extendedFromWeek!).toBe(52)
    expect(cases[0]).toEqual(facts.extensionCase)
    expect(cases[0]).toEqual({ talentId: EXTENSION_PERSON, subjectStudioId: EXTENSION_STUDIO,
      contractId: EXTENSION_OLD_CONTRACT, openedWeek: 92, closedWeek: 98, outcome: 'settled',
      reason: 'settled at the decision week', variant: 'retirementExtension' })
    const employment = state.hollywood!.employment.filter(row => row.terms.talentId === EXTENSION_PERSON)
    expect(employment).toEqual(facts.settlementEmployment)
    expect(employment).toHaveLength(2)
    expect(employment[0]).toMatchObject({ contractId: EXTENSION_OLD_CONTRACT, endedWeek: 98,
      terms: { startWeek: 0, endWeekExclusive: 98, termWeeks: 98 } })
    const settlement = employment.filter(row => row.studioId === EXTENSION_STUDIO
      && row.terms.startWeek === cases[0]!.closedWeek && row.terms.endWeekExclusive === used[0]!.effectiveWeek)
    expect(settlement, 'exactly one real settlement interval reconciles the one-use fact').toHaveLength(1)
    expect(settlement[0]).toEqual({ contractId: EXTENSION_NEW_CONTRACT, studioId: EXTENSION_STUDIO,
      endedWeek: null, reason: 'player-contract', terms: { talentId: EXTENSION_PERSON, startWeek: 98,
        endWeekExclusive: 156, termWeeks: 58, annualSalary: 75448, signingBonus: 13581 } })
    expect(state.contracts.filter(row => row.talentId === EXTENSION_PERSON)).toEqual([settlement[0]!.terms])
    const expected = 'migrateToV35: cannot downgrade SaveFileV36 or discard the retirement extension — it holds 1 retirementExtension case(s) and 1 used extension(s) (first: authored-0000), and V35 has nowhere to record the one final extension'
    expect(facts.expectedRefusal).toBe(expected)
    exactGuard(save, expected)
    expect(extensionRaw('used')).toBe(raw)
  })
})
