// wave3l probe (throwaway, never committed): moveRivalMoney on a research-v27 period with a loan kind.
// PROBE_EXPECT=throw (round 7 head): refuses by name. PROBE_EXPECT=nan (5a700af3): silently writes NaN.
import { describe, it, expect } from 'vitest'
import { moveRivalMoney, newFinancePeriod } from '../src/core/hollywood.js'
describe('wave3l probe: a loan kind moved into a v27-era period', () => {
  it(`behaves as ${process.env.PROBE_EXPECT}`, () => {
    const period = newFinancePeriod(100, 1000, 'research-v27')
    expect(Object.hasOwn(period.movements, 'loanPrincipal')).toBe(false)
    const account = { cash: 1000, periods: [period] } as unknown as Parameters<typeof moveRivalMoney>[0]
    const move = () => moveRivalMoney(account, 'loanPrincipal' as never, 50, 100, 'research-v27' as never)
    if (process.env.PROBE_EXPECT === 'throw') {
      expect(move).toThrow(/^Rival finance period from week 100 has no loanPrincipal movement$/)
      expect(account.cash).toBe(1000)
    } else {
      expect(move).not.toThrow()
      expect(Number.isNaN((period.movements as unknown as Record<string, number>).loanPrincipal)).toBe(true)
    }
  })
})
