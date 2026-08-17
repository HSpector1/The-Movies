// Placement Core V12 — the weekly lifecycle: completion, capacity, the operating
// charge, and determinism.
//
// The laws under test:
//   • A site occupies land and contributes ZERO capacity until it flips, and it
//     flips on EXACTLY its committed completion week — across a save/load and
//     across a long multi-tick run alike.
//   • Completion runs before capacity aggregation, in the same tick position the
//     V11 Annex completion held.
//   • Every operational placed facility carries a weekly operating charge: one
//     aggregated row per week, first charged the week AFTER it becomes
//     operational, reported inside the existing overhead bucket.
//   • None of it consumes the simulation stream.

import { describe, expect, it } from 'vitest'
import {
  INITIAL_STUDIO_FACILITIES,
  TUNING,
  applyActions,
  commitPlacement,
  exportSave,
  financeTotals,
  generateWorld,
  importSave,
  makeSave,
  migrateToV13,
  operationalPlacedFacilities,
  periodSummary,
  placedStudioFacility,
  stableStringify,
  studioConstructionView,
  tick,
  weeklyPlacementOperatingCost,
} from '../src/core/index.js'
import { FACILITY_OPEX_LEDGER_NOTE } from '../src/core/tuning.js'
import type { GameState, LedgerEntry, PlacementRequest } from '../src/core/index.js'

const ANNEX = 'development-casting-annex'
const OPEX = TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST
const BUILD_WEEKS = TUNING.PLACEMENT_ANNEX_BUILD_WEEKS

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

function at(gx: number, gy: number): PlacementRequest {
  return { blueprintId: ANNEX, origin: { gx, gy } }
}

const LEGACY = at(7, 15)
const WEST_NORTH = at(0, 9)
const WEST_SOUTH = at(0, 12)
const STAGE_SOUTH = at(15, 16)

function advance(state: GameState, weeks: number): GameState {
  let next = state
  for (let week = 0; week < weeks; week++) next = tick(next)
  return next
}

function opexRows(state: GameState): LedgerEntry[] {
  return state.ledger.filter((entry) => entry.kind === 'facilityOpex')
}

function developmentCastingCapacity(state: GameState): number {
  return state.operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .reduce((sum, facility) => sum + facility.capacity, 0)
}

describe('Placement Core V12 — completion flips capacity exactly once, on its week', () => {
  it('contributes nothing for twelve advances and everything on the thirteenth', () => {
    let state = commitPlacement(managedStudio('placement-clock'), LEGACY)
    const baseCapacity = developmentCastingCapacity(state)
    expect(baseCapacity).toBe(2) // the initial Development & Casting facility

    for (let week = 1; week <= BUILD_WEEKS - 1; week++) {
      state = tick(state)
      expect(state.market.tick).toBe(week)
      expect(state.placement.facilities[0]!.status).toBe('underConstruction')
      expect(developmentCastingCapacity(state)).toBe(baseCapacity)
      expect(state.operations.facilities).toHaveLength(INITIAL_STUDIO_FACILITIES.length)
      expect(operationalPlacedFacilities(state.placement)).toEqual([])
    }

    state = tick(state)
    expect(state.market.tick).toBe(BUILD_WEEKS)
    expect(state.placement.facilities[0]!.status).toBe('operational')
    expect(developmentCastingCapacity(state)).toBe(baseCapacity + 1)
    expect(state.operations.facilities).toHaveLength(INITIAL_STUDIO_FACILITIES.length + 1)
    expect(state.operations.facilities.at(-1)).toEqual({
      id: 'facility-development-casting-annex',
      name: 'Development & Casting Annex',
      capability: 'development-casting',
      capacity: 1,
    })

    // It flips ONCE. Twenty further advances add no second facility.
    const after = advance(state, 20)
    expect(after.operations.facilities).toHaveLength(INITIAL_STUDIO_FACILITIES.length + 1)
    expect(after.placement.facilities).toHaveLength(1)
  })

  it('flips at the same week when the run is split by a save and a reload', () => {
    const start = commitPlacement(managedStudio('placement-clock-reload'), LEGACY)
    const continuous = advance(start, BUILD_WEEKS)

    let split = start
    for (let week = 0; week < BUILD_WEEKS; week++) {
      const json = exportSave(makeSave(split))
      const reloaded = migrateToV13(importSave(json))
      expect(exportSave(reloaded)).toBe(json)
      split = tick(reloaded.state)
    }

    expect(exportSave(makeSave(split))).toBe(exportSave(makeSave(continuous)))
    expect(split.placement.facilities[0]!.status).toBe('operational')
    expect(developmentCastingCapacity(split)).toBe(3)
  })

  it('completes independent placements on their own weeks, in placement-id order', () => {
    let state = managedStudio('placement-clock-many')
    state = commitPlacement(state, WEST_NORTH) // placed week 0 → operational week 13
    state = advance(state, 2)
    state = commitPlacement(state, WEST_SOUTH) // placed week 2 → operational week 15
    state = advance(state, 1)
    state = commitPlacement(state, STAGE_SOUTH) // placed week 3 → operational week 16

    expect(state.placement.facilities.map((placed) => placed.completesWeek)).toEqual([
      13, 15, 16,
    ])

    state = advance(state, 10) // week 13
    expect(state.market.tick).toBe(13)
    expect(state.placement.facilities.map((placed) => placed.status)).toEqual([
      'operational',
      'underConstruction',
      'underConstruction',
    ])
    expect(developmentCastingCapacity(state)).toBe(3)

    state = advance(state, 3) // week 16
    expect(state.placement.facilities.map((placed) => placed.status)).toEqual([
      'operational',
      'operational',
      'operational',
    ])
    expect(developmentCastingCapacity(state)).toBe(5)

    // The facility set is the initial five followed by the placed facilities in
    // completion order — which is exactly what the invariant enforces.
    expect(state.operations.facilities).toEqual([
      ...INITIAL_STUDIO_FACILITIES,
      ...operationalPlacedFacilities(state.placement).map(placedStudioFacility),
    ])
    expect(state.operations.facilities.slice(5).map((facility) => facility.id)).toEqual([
      'facility-development-casting-annex',
      'facility-development-casting-annex-2',
      'facility-development-casting-annex-3',
    ])
    expect(state.operations.facilities.slice(5).map((facility) => facility.name)).toEqual([
      'Development & Casting Annex',
      'Development & Casting Annex 2',
      'Development & Casting Annex 3',
    ])
  })

  it('keeps the retained construction read model truthful across the whole lifecycle', () => {
    let state = managedStudio('placement-view-lifecycle')
    expect(studioConstructionView(state)).toMatchObject({
      status: 'vacant',
      canStart: true,
      startedWeek: null,
      dueWeek: null,
      completedWeek: null,
      completedAdvances: 0,
      remainingAdvances: 0,
      currentDevelopmentCastingCapacity: 2,
      completedCapacityGain: 0,
    })

    state = commitPlacement(state, LEGACY)
    expect(studioConstructionView(state)).toMatchObject({
      status: 'building',
      canStart: false,
      startedWeek: 0,
      dueWeek: 13,
      completedWeek: null,
      completedAdvances: 0,
      remainingAdvances: 13,
    })

    state = advance(state, 6)
    expect(studioConstructionView(state)).toMatchObject({
      status: 'building',
      completedAdvances: 6,
      remainingAdvances: 7,
    })

    state = advance(state, 7)
    expect(studioConstructionView(state)).toMatchObject({
      status: 'operational',
      completedWeek: 13,
      completedAdvances: 13,
      remainingAdvances: 0,
      currentDevelopmentCastingCapacity: 3,
      completedCapacityGain: 1,
    })
  })
})

describe('Placement Core V12 — the weekly operating charge', () => {
  it('charges nothing while a site is under construction, including its completing week', () => {
    let state = commitPlacement(managedStudio('placement-opex-start'), LEGACY)
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(0)

    state = advance(state, BUILD_WEEKS)
    expect(state.market.tick).toBe(BUILD_WEEKS)
    expect(state.placement.facilities[0]!.status).toBe('operational')
    // The completing advance charged nothing: it was still a construction site
    // for the week being paid for.
    expect(opexRows(state)).toEqual([])
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(OPEX)
  })

  it('charges exactly one aggregated row per week from the week after completion', () => {
    const start = commitPlacement(managedStudio('placement-opex-rows'), LEGACY)
    const state = advance(start, BUILD_WEEKS + 5)
    const rows = opexRows(state)
    expect(rows.map((row) => row.week)).toEqual([13, 14, 15, 16, 17])
    for (const row of rows) {
      expect(row).toEqual({
        week: row.week,
        kind: 'facilityOpex',
        amount: -OPEX,
        note: FACILITY_OPEX_LEDGER_NOTE,
      })
    }
  })

  it('scales the aggregated row with the number of operational facilities', () => {
    let state = managedStudio('placement-opex-scaling')
    state = commitPlacement(state, WEST_NORTH)
    state = commitPlacement(state, WEST_SOUTH)
    state = commitPlacement(state, STAGE_SOUTH)
    state = advance(state, BUILD_WEEKS + 2)

    expect(state.placement.facilities.every((placed) => placed.status === 'operational')).toBe(
      true,
    )
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(3 * OPEX)
    const rows = opexRows(state)
    expect(rows.map((row) => row.week)).toEqual([13, 14])
    expect(rows.every((row) => row.amount === -3 * OPEX)).toBe(true)
  })

  it('reconciles cash exactly against the capital and operating rows', () => {
    const base = managedStudio('placement-opex-cash')
    const state = advance(commitPlacement(base, LEGACY), BUILD_WEEKS + 4)
    const weeksCharged = state.market.tick - BUILD_WEEKS
    // The exact decomposition: opening cash, the one capital debit, the weekly
    // studio overhead this engaged (contract-free) studio always pays, and the
    // placed-facility operating charge for every week after completion.
    expect(state.studio.cash).toBe(
      base.studio.cash -
        TUNING.PLACEMENT_ANNEX_CAPEX -
        state.market.tick * TUNING.OVERHEAD_BASE -
        weeksCharged * OPEX,
    )
    expect(weeksCharged).toBe(4)
    // The reconciliation invariant proves the same thing at every boundary.
    expect(() => makeSave(state)).not.toThrow()
  })

  it('reports the operating charge inside the existing overhead bucket', () => {
    const state = advance(
      commitPlacement(managedStudio('placement-opex-reporting'), LEGACY),
      BUILD_WEEKS + 3,
    )
    const rows = opexRows(state)
    expect(rows).toHaveLength(3)

    const totals = financeTotals(state)
    const overheadRows = state.ledger.filter(
      (entry) => entry.kind === 'overhead' || entry.kind === 'facilityOpex',
    )
    expect(totals.overhead).toBe(
      overheadRows.reduce((sum, entry) => sum + entry.amount, 0),
    )
    expect(totals.construction).toBe(-TUNING.PLACEMENT_ANNEX_CAPEX)
    expect(totals.net).toBe(state.ledger.reduce((sum, entry) => sum + entry.amount, 0))

    const window = periodSummary(state, BUILD_WEEKS, state.market.tick)
    expect(window.overhead).toBeLessThanOrEqual(-3 * OPEX)
    expect(window.otherCash).toBe(0) // never absorbed by the catch-all bucket
  })

  it('charges nothing at all in a placement-free game', () => {
    const state = advance(managedStudio('placement-opex-absent'), 20)
    expect(opexRows(state)).toEqual([])
    expect(weeklyPlacementOperatingCost(state.placement)).toBe(0)
    expect(financeTotals(state).construction).toBe(0)
  })
})

describe('Placement Core V12 — determinism', () => {
  it('consumes no simulation RNG at any point in the lifecycle', () => {
    const base = managedStudio('placement-rng')
    const rngState = base.rngState
    let state = commitPlacement(base, LEGACY)
    expect(state.rngState).toBe(rngState)
    for (let week = 0; week < BUILD_WEEKS + 4; week++) {
      state = tick(state)
      // The headless studio has no release, so the sim stream never advances —
      // and placement never touches it in the first place.
      expect(state.rngState).toBe(rngState)
    }
  })

  it('replays a scripted run byte-identically from the same seed', () => {
    const script = (seed: string): GameState => {
      let state = managedStudio(seed)
      state = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
      state = advance(state, 4)
      state = applyActions(state, [
        { kind: 'placeFacility', placement: WEST_NORTH },
      ])
      state = advance(state, 3)
      state = applyActions(state, [
        { kind: 'placeFacility', placement: STAGE_SOUTH },
      ])
      return advance(state, BUILD_WEEKS + 6)
    }
    const first = script('placement-replay')
    const second = script('placement-replay')
    expect(stableStringify(first)).toBe(stableStringify(second))
    expect(exportSave(makeSave(first))).toBe(exportSave(makeSave(second)))
    expect(first.placement.facilities).toHaveLength(3)
    expect(first.operations.facilities).toHaveLength(INITIAL_STUDIO_FACILITIES.length + 3)
  })

  it('continues byte-identically after a mid-run save and reload', () => {
    const start = advance(commitPlacement(managedStudio('placement-reload'), LEGACY), 5)
    const continuous = advance(start, 12)

    const json = exportSave(makeSave(start))
    const reloaded = migrateToV13(importSave(json))
    expect(exportSave(reloaded)).toBe(json)
    const resumed = advance(reloaded.state, 12)

    expect(exportSave(makeSave(resumed))).toBe(exportSave(makeSave(continuous)))
  })

  it('iterates placements in ascending id order regardless of construction order', () => {
    let state = managedStudio('placement-order-stability')
    state = commitPlacement(state, STAGE_SOUTH)
    state = commitPlacement(state, WEST_NORTH)
    state = commitPlacement(state, LEGACY)
    expect(state.placement.facilities.map((placed) => placed.id)).toEqual([1, 2, 3])
    const done = advance(state, BUILD_WEEKS)
    expect(operationalPlacedFacilities(done.placement).map((placed) => placed.id)).toEqual([
      1, 2, 3,
    ])
  })
})
