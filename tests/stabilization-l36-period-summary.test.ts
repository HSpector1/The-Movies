// Stabilization 2026-10-22, audit finding L-36 (LOT-03): the rail lists every bucket of the
// period summary so "Net this period" adds up from the rows shown. The law that makes the
// rows sum to the net lives in the producer, and this pins it with the two buckets the audit
// named (financing, and claim payments inside "Other cash") non-zero.
import { describe, expect, it } from 'vitest'
import { periodSummary } from '../src/core/economyView.js'
import type { GameState, LedgerEntry } from '../src/core/types.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

describe('L-36: the period summary net is the sum of its buckets', () => {
  it('with loan principal, an installment, a claim payment and a signing bonus in the window', () => {
    const base = p13aGeneratedStudio('stabilization-l36')
    const week = base.market.tick
    const talentId = base.talent[0]!.id
    const rows: LedgerEntry[] = [
      { week, kind: 'loanPrincipal', amount: 250_000, note: 'L-36 witness: principal received' },
      { week, kind: 'loanInstallment', amount: -12_500, note: 'L-36 witness: installment paid' },
      { week, kind: 'claimPayment', amount: -8_000, talentId, note: 'L-36 witness: closure claim paid' },
      { week, kind: 'signingBonus', amount: -3_000, talentId, note: 'L-36 witness: signing bonus' },
    ]
    const state: GameState = { ...base, ledger: [...base.ledger, ...rows] }
    const s = periodSummary(state, week, week)
    expect(s.financing).toBe(250_000 - 12_500)
    expect(s.otherCash).toBe(-8_000 - 3_000)
    const buckets = s.payroll + s.overhead + s.studioRevenue + s.boxOfficeLump + s.production + s.publicity + s.construction + s.financing + s.otherCash
    expect(s.netCash).toBe(buckets)
  })
})
