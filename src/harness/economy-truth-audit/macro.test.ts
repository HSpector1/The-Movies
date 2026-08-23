import { describe, expect, it } from 'vitest'

import { policyByName } from '../d16/policies.js'
import { compactMacroRun, macroSeed, runMacroCell } from './macro.js'

describe('economy truth audit macro lens', () => {
  it('uses stable named seeds', () => {
    expect(macroSeed(1)).toBe('eta-macro-0001')
    expect(macroSeed(1000)).toBe('eta-macro-1000')
  })

  it('is deterministic and captures slice ledger trajectories without changing production', () => {
    const policy = policyByName('P3')
    const left = runMacroCell('eta-macro-smoke', policy)
    const right = runMacroCell('eta-macro-smoke', policy)
    expect(left).toEqual(right)
    expect(left.slices['52']?.ledgerTotals).toBeDefined()
    expect(left.reconciliationOk).toBe(true)
    expect(compactMacroRun).toBeTypeOf('function')
  })
})
