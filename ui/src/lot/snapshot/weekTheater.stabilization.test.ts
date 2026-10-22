// Stabilization 2026-10-22, audit finding L-39 (LOT-06, the capability spelling).
//
// `lotSceneryShopBodies` tested a placed facility's capability against `'setScenery'`, while the
// engine and the adapter spell it `'set-scenery'` (src/core/tuning.ts). A Scenery Shop the player
// BUILT therefore never counted as a freight origin, and the founding Post body was drawn as the
// origin of hauls a built shop sent: invented world content.
import { describe, expect, it } from 'vitest'
import type { StudioLotSnapshot } from './StudioLotSnapshot.ts'
import { lotSceneryShopBodies } from './weekTheater.ts'

function withPlacements(placements: readonly { id: number; capability: string; status: string }[]): StudioLotSnapshot {
  return { placement: { placements } } as unknown as StudioLotSnapshot
}

describe('L-39: a built Scenery Shop is a freight origin', () => {
  it('counts an operational placed facility with the engine\'s own capability id', () => {
    const bodies = lotSceneryShopBodies(withPlacements([{ id: 7, capability: 'set-scenery', status: 'operational' }]))
    expect(bodies).toContain('placed-7')
  })

  it('still ignores a shop under construction and a facility of another capability', () => {
    const bodies = lotSceneryShopBodies(withPlacements([
      { id: 8, capability: 'set-scenery', status: 'underConstruction' },
      { id: 9, capability: 'soundstage', status: 'operational' },
    ]))
    expect(bodies).not.toContain('placed-8')
    expect(bodies).not.toContain('placed-9')
  })

  it('never matched the camel-case spelling the Lot used to test for', () => {
    const bodies = lotSceneryShopBodies(withPlacements([{ id: 10, capability: 'setScenery', status: 'operational' }]))
    expect(bodies).not.toContain('placed-10')
  })
})
