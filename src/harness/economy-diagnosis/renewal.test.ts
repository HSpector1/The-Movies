import { describe, expect, it } from 'vitest'
import type { RosterWallSourceProvenance } from '../roster-wall/provenance.js'
import { runRenewalDiagnosisCell } from './renewal.js'

const source: RosterWallSourceProvenance = {
  branch: 'codex/economy-diagnosis-02',
  commit: 'test',
  tree: 'test',
  worktreeDirty: false,
  runtime: 'vitest',
  saveVersion: 14,
  productionAuthorityCommit: 'test',
  productionAuthorityTree: 'test',
  authorityDiffPaths: [],
}

describe('economy diagnosis renewal lab', () => {
  it('keeps all counterfactuals reconciled and RNG-valid on one canonical entry', () => {
    const cell = runRenewalDiagnosisCell(
      'facilities-0001',
      'direct-package',
      source,
    )
    for (const arm of [
      cell.baseline260,
      cell.halfGap260,
      cell.minimumRole260,
      cell.fullGap260,
      cell.baseline428,
      cell.fullGap428,
    ]) {
      expect(arm.invariantFailures).toBe(0)
    }
    expect(cell.timeline.weeks196Through207).toHaveLength(12)
    expect(cell.timeline.warnings.map((warning) => warning.week)).toEqual([156, 182, 196])
    if (cell.allGap === 0) expect(cell.zeroGrantIdentityAt260).toBe(true)
  }, 60_000)
})
