import { describe, expect, it } from 'vitest'

import type { FacilitiesSourceProvenance } from '../facilities/index.js'
import { managedSeed, runManagedCell } from './managed.js'

const SOURCE: FacilitiesSourceProvenance = {
  sourceCommit: 'test',
  sourceTree: 'test',
  worktreeDirty: false,
  runtime: 'economy-truth-audit-test',
}

describe('economy truth audit managed lens', () => {
  it('uses stable named seeds', () => {
    expect(managedSeed(1)).toBe('eta-managed-001')
    expect(managedSeed(50)).toBe('eta-managed-050')
  })

  it('runs deterministic current and exact-timing free-capacity arms', () => {
    const left = runManagedCell('eta-managed-smoke', 'scaled-four-team', SOURCE)
    const right = runManagedCell('eta-managed-smoke', 'scaled-four-team', SOURCE)
    expect(left).toEqual(right)
    expect(left.current.slices['260']?.week).toBe(260)
    expect(left.plusOne.arm).toBe('free-plus-one-at-annex-open')
    expect(left.plusTwo.arm).toBe('free-plus-two-at-hall-open')
  })
})
