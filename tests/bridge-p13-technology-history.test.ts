import { describe, expect, it } from 'vitest'
import { historyProjection } from '../bridge/history.ts'
import { applyActions } from '../src/core/actions.ts'
import { initializeHollywood } from '../src/core/hollywood.ts'
import { tick } from '../src/core/tick.ts'
import { generateWorld } from '../src/core/worldgen.ts'

describe('P13A dated technology history projection', () => {
  it('shows the recorded 1925 and 1928 availability dates without claiming player adoption', () => {
    const generated = generateWorld('p13a-history-public-copy')
    let state = initializeHollywood(applyActions({ ...generated, economyEngagedEver: true }, [{ kind: 'activateStudioOperations' }]), 'fresh')
    while (state.market.tick < 416) state = tick(state)
    const rows = historyProjection(state).timeline.filter(row => row.kind === 'technologyMilestone')
    expect(rows.map(row => row.headline)).toEqual(['Synchronized-sound research opens', 'Synchronized sound reaches commercial release'])
    expect(rows[0]!.detail).toContain('1925')
    expect(rows[1]!.detail).toContain('1928')
    expect(rows.every(row => row.subjectKind === 'studio' && row.subjectLocation === 'none' && row.buildingId === null)).toBe(true)
    expect(state.technology.access.filter(row => row.studioId === state.hollywood!.playerStudioId)).toEqual([])
    expect(state.technology.adoptions.filter(row => row.studioId === state.hollywood!.playerStudioId)).toEqual([])
  }, 30_000)
})
