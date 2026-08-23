import { describe, expect, it } from 'vitest'
import { runChoiceCell } from './choice.js'
import { runChoicePublicityGateCell } from './gates.js'

function normalized(value: unknown, policy: string): string {
  return JSON.stringify({ ...(value as Record<string, unknown>), policy })
}

describe('economy intervention frontier preservation gates', () => {
  it('unused publicity is an exact no-op for the choice candidate', () => {
    const seed = 'economy-frontier-publicity-no-op'
    const arm = 'D03_nearBestProfit_80_leastCapital' as const
    const plain = runChoiceCell(seed, arm)
    const control = runChoicePublicityGateCell(seed, arm, 'never').macro
    const { choiceDiagnostics: _ignored, ...plainMacro } = plain
    expect(normalized(control, arm)).toBe(normalized(plainMacro, arm))
    expect(control.publicitySpend).toBe(0)
  })
})
