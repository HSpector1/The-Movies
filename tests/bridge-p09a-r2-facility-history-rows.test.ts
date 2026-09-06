// P09-REQ-040 / P08-REQ-013 (P08-R2) — the facility-history producer: exact construction /
// facility milestones recorded in P08 Studio History at the ONE mutation site of each
// (commit, completion, move, demolition), with current/historical location decided from the
// live placement identity, never from a name; nothing reconstructed; save round-trip exact.
import { describe, expect, it } from 'vitest'

import { historyProjection } from '../bridge/history.ts'
import {
  applyActions,
  beginFounding,
  contractOffer,
  facilityDemolitionRefusal,
  facilityMoveRefusal,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../src/core/index.js'
import type { CreativeRole, GameState } from '../src/core/index.js'
import { exportSaveJson, importSaveJson } from '../ui/src/engine/adapter.ts'

function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}
const bareLot = (seed: string) => foundMinimum(generateWorld(seed, { regime: 'bare-lot' }))
const facilityRows = (state: GameState) =>
  state.studioHistory.rows.filter((row) => row.kind.startsWith('facility')) as Array<Extract<GameState['studioHistory']['rows'][number], { kind: 'facilityCommitted' | 'facilityCompleted' | 'facilityDemolished' | 'facilityMoved' }>>
const timelineFor = (state: GameState, facilityId: string) =>
  historyProjection(state).timeline.filter((row) => row.subjectKind === 'facility' && row.subjectId === facilityId)

describe('P09-REQ-040 — facility milestones in Studio History', () => {
  it('records Construction started at commit with the exact placement identity, current and locatable', () => {
    const state = bareLot('p09-r2-commit')
    const week = state.market.tick
    const placed = applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    const site = placed.placement.facilities[placed.placement.facilities.length - 1]!
    const rows = facilityRows(placed)
    expect(rows).toHaveLength(1)
    const row = rows[0]!
    expect(row.kind).toBe('facilityCommitted')
    expect(row.week).toBe(week)
    expect(row.placementId).toBe(site.id)
    expect(row.facilityId).toBe(site.facilityId)
    expect(row.blueprintId).toBe('development-casting-office')
    expect(row.name).toBe('Development & Casting Office')
    expect(row.subjects).toEqual([{ kind: 'facility', placementId: site.id, facilityId: site.facilityId }])
    expect(row.significance).toBe('standard')
    const timeline = timelineFor(placed, site.facilityId)
    expect(timeline).toHaveLength(1)
    expect(timeline[0]!.headline).toBe('Construction started: Development & Casting Office')
    expect(timeline[0]!.subjectLocation).toBe('current')
    expect(timeline[0]!.buildingId).toBe(`placed-${String(site.id)}`)
    // Nothing recorded before the commit; nothing reconstructed.
    expect(facilityRows(state)).toHaveLength(0)
  })

  it('records Opened at the placement\'s own completion week, after every row of the advancing week', () => {
    let state = applyActions(bareLot('p09-r2-complete'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    const site = state.placement.facilities[0]!
    for (let guard = 0; guard < 40 && state.placement.facilities[0]!.status !== 'operational'; guard++) state = tick(state)
    expect(state.placement.facilities[0]!.status).toBe('operational')
    const opened = facilityRows(state).find((row) => row.kind === 'facilityCompleted')!
    expect(opened).toBeDefined()
    expect(opened.week).toBe(site.completesWeek)
    expect(opened.placementId).toBe(site.id)
    expect(opened.facilityId).toBe(site.facilityId)
    expect(opened.significance).toBe('major')
    // Chronology never runs backwards (the append law), and the timeline reads it as Opened.
    const weeks = state.studioHistory.rows.map((row) => row.week)
    expect(weeks).toEqual([...weeks].sort((a, b) => a - b))
    const timeline = timelineFor(state, site.facilityId)
    expect(timeline.map((row) => row.headline)).toEqual(['Construction started: Development & Casting Office', 'Opened: Development & Casting Office'])
    expect(timeline.every((row) => row.subjectLocation === 'current' && row.buildingId === `placed-${String(site.id)}`)).toBe(true)
  })

  it('records Demolished; the facility becomes historical with no body to locate, and its old rows follow', () => {
    let state = applyActions(bareLot('p09-r2-demolish'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    for (let week = 0; week < 14; week++) state = tick(state)
    state = applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 16, gy: 14 } } }])
    const shop = state.placement.facilities.find((f) => f.blueprintId === 'scenery-shop')!
    for (let guard = 0; guard < 40 && state.placement.facilities.find((f) => f.id === shop.id)!.status !== 'operational'; guard++) state = tick(state)
    const refusal = facilityDemolitionRefusal(state, { placementId: shop.id })
    expect(refusal).toBeNull()
    const week = state.market.tick
    const demolished = applyActions(state, [{ kind: 'demolishFacility', demolition: { placementId: shop.id } }])
    expect(demolished.placement.facilities.some((f) => f.id === shop.id)).toBe(false)
    const row = facilityRows(demolished).find((r) => r.kind === 'facilityDemolished')!
    expect(row.week).toBe(week)
    expect(row.placementId).toBe(shop.id)
    expect(row.facilityId).toBe(shop.facilityId)
    expect(row.name).toBe('Scenery Shop')
    const timeline = timelineFor(demolished, shop.facilityId)
    expect(timeline.map((r) => r.headline)).toEqual(['Construction started: Scenery Shop', 'Opened: Scenery Shop', 'Demolished: Scenery Shop'])
    // A demolished facility has no current body: every one of its rows is historical, and the
    // stale id resolves to nothing rather than to another building.
    expect(timeline.every((r) => r.subjectLocation === 'historical' && r.buildingId === null)).toBe(true)
    // The office is untouched and still current.
    const office = demolished.placement.facilities[0]!
    expect(timelineFor(demolished, office.facilityId).every((r) => r.subjectLocation === 'current' && r.buildingId === `placed-${String(office.id)}`)).toBe(true)
  })

  it('records Moved when a legal move happens, keeping the placement identity', () => {
    let state = applyActions(bareLot('p09-r2-move'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    for (let week = 0; week < 14; week++) state = tick(state)
    state = applyActions(state, [{ kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 16, gy: 14 } } }])
    const shop = state.placement.facilities.find((f) => f.blueprintId === 'scenery-shop')!
    const move = { placementId: shop.id, origin: { gx: 20, gy: 14 } }
    const refusal = facilityMoveRefusal(state, move)
    if (refusal !== null) {
      // The engine's own refusal stands (named); no row is invented for a move that did not happen.
      expect(typeof refusal.code).toBe('string')
      expect(() => applyActions(state, [{ kind: 'moveFacility', move }])).toThrow(/moveFacility rejected/)
      expect(facilityRows(state).some((r) => r.kind === 'facilityMoved')).toBe(false)
      return
    }
    const moved = applyActions(state, [{ kind: 'moveFacility', move }])
    const row = facilityRows(moved).find((r) => r.kind === 'facilityMoved')!
    expect(row.placementId).toBe(shop.id)
    expect(row.facilityId).toBe(shop.facilityId)
    const after = moved.placement.facilities.find((f) => f.id === shop.id)!
    expect(after.origin).toEqual({ gx: 20, gy: 14 })
    expect(timelineFor(moved, shop.facilityId).at(-1)!.headline).toBe('Moved: Scenery Shop')
    expect(timelineFor(moved, shop.facilityId).at(-1)!.subjectLocation).toBe('current')
  })

  it('survives Save/Load byte-exact and validates under the live save law', () => {
    let state = applyActions(bareLot('p09-r2-save'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    for (let week = 0; week < 15; week++) state = tick(state)
    expect(facilityRows(state).map((r) => r.kind)).toEqual(['facilityCommitted', 'facilityCompleted'])
    const saved = exportSaveJson(state)
    const reloaded: any = importSaveJson(saved)
    expect(reloaded.ok).toBe(true)
    expect(reloaded.state.studioHistory).toEqual(state.studioHistory)
    expect(exportSaveJson(reloaded.state)).toBe(saved)
    expect(JSON.stringify(historyProjection(reloaded.state))).toBe(JSON.stringify(historyProjection(state)))
  })
})
