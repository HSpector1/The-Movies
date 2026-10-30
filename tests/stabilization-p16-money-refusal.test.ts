import { describe, expect, it } from 'vitest'
import { moveRivalMoney, newFinancePeriod } from '../src/core/hollywood.js'
import { P16_RIVAL_MONEY_KINDS, type RivalAccount } from '../src/core/hollywoodTypes.js'

describe('P16 money refusal preserves the complete working account', () => {
  for (const kind of ['loanPrincipal', ...P16_RIVAL_MONEY_KINDS] as const) {
    for (const week of [51, 52]) {
      it(`refuses ${kind} in the V27 roster at week ${week} without opening a period`, () => {
        const account = { openingBalance: 1000, openingBasis: 'before-capacity-and-signing' as const, cash: 1000, periods: [newFinancePeriod(51, 1000, 'research-v27')] } as RivalAccount
        const before = JSON.stringify(account)
        expect(() => moveRivalMoney(account, kind, 50, week, 'research-v27'))
          .toThrow(`Rival finance period from week ${week} has no ${kind} movement`)
        expect(JSON.stringify(account)).toBe(before)
      })
    }
  }

  it('books a valid V27 movement once across the year boundary and preserves the previous period', () => {
    const account = { openingBalance: 1000, openingBasis: 'before-capacity-and-signing' as const, cash: 1000, periods: [newFinancePeriod(51, 1000, 'research-v27')] } as RivalAccount
    const previous = JSON.stringify(account.periods[0])
    moveRivalMoney(account, 'researchCapacity', -25, 52, 'research-v27')
    expect(account.cash).toBe(975)
    expect(account.periods).toHaveLength(2)
    expect(JSON.stringify(account.periods[0])).toBe(previous)
    expect(account.periods[1]).toEqual({ ...newFinancePeriod(52, 1000, 'research-v27'),
      closing: 975, movements: { ...newFinancePeriod(52, 1000, 'research-v27').movements, researchCapacity: -25 } })
  })

  it('keeps every P16 kind available in a live year-boundary period', () => {
    const account = { openingBalance: 1000, openingBasis: 'before-capacity-and-signing' as const, cash: 1000, periods: [newFinancePeriod(51, 1000)] } as RivalAccount
    for (const kind of P16_RIVAL_MONEY_KINDS) moveRivalMoney(account, kind, 1, 52)
    expect(account.periods).toHaveLength(2)
    expect(account.cash).toBe(1000 + P16_RIVAL_MONEY_KINDS.length)
    expect(account.periods[1]!.closing).toBe(account.cash)
    for (const kind of P16_RIVAL_MONEY_KINDS) expect(account.periods[1]!.movements[kind]).toBe(1)
  })
})
