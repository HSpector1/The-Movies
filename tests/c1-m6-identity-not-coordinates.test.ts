// ── C1-M6 CLAIM 3 — no COORDINATES-AS-IDENTITY regression ────────────────────
//
// Campaign law: "Identity must not depend on coordinates; fixed coordinates are not
// business logic." M3a made a move identity-preserving and said so. This file asks the
// harder question the expanded property makes askable: when a building can be picked up
// and put down somewhere that did not exist a milestone ago, does EVERY reference to it
// follow the building, or does something quietly follow the ground?
//
// The subject is the committed South Yard fixture — a real second zone — with two
// annexes standing: one in the FOUNDING zone, engaged by a live screenplay, and one in
// the NEW zone, idle and free to move. Four kinds of reference are checked:
//
//   • LEDGER CORRELATION — the capex row that paid for a building, and the refund row
//     that buries it, are matched by construction project id;
//   • FACILITY ENGAGEMENTS — the fail-closed guard over every persisted holder;
//   • THE SHARED-CAPACITY REGISTRY — `operations.facilities`, which the allocator scans;
//   • THE COMPANION / READ-MODEL references the whole UI is built on.
//
// And then the one that actually catches a coordinate-keyed system: a NEW building
// raised on the EXACT ground a demolished one stood on must inherit nothing from it.
//
// The renderer-side half of the same question (`placed-<id>` as a world id) is proved
// in `ui/src/lot/tycoon/expandedPropertyWorld.test.ts`.

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  applyActions,
  assertStudioPlacementInvariants,
  cellKey,
  commitPlacement,
  demolishFacility,
  demolishedFacilityHistory,
  expectedWeeklyOperatingCostAt,
  facilityEngagements,
  facilityMoveRefusal,
  importSave,
  migrateToV17,
  moveFacility,
  queryPlacement,
  stableStringify,
  studioPlacementView,
  tick,
} from '../src/core/index.js'
import { DEVELOPMENT_CASTING_ANNEX_BLUEPRINT } from '../src/core/tuning.js'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  LotCell,
  PlacedFacility,
  SegmentId,
  Talent,
} from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id
const BUILD_WEEKS = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks

/** The founding zone's west lawn, and two sites in the second zone. */
const WEST_LAWN: LotCell = { gx: 0, gy: 9 }
const SOUTH_YARD_EAST: LotCell = { gx: 12, gy: 30 }
const SOUTH_YARD_WEST: LotCell = { gx: 2, gy: 30 }

const fixtureBytes = readFileSync(
  join(
    dirname(fileURLToPath(import.meta.url)),
    '..',
    'ui',
    'e2e',
    'expanded-property-v1',
    'week-0-south-yard-second-zone.save.json',
  ),
  'utf8',
)

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

function commissionPayload(state: GameState): CommissionScriptPayload {
  const concept = state.concepts[0]!
  return {
    conceptId: concept.id,
    writerId: contractedByRole(state, 'writer')[0]!.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] },
    },
  }
}

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

function placementOf(state: GameState, id: number): PlacedFacility {
  const placed = state.placement.facilities.find((candidate) => candidate.id === id)
  if (placed === undefined) throw new Error(`no placement ${String(id)}`)
  return placed
}

/**
 * THE FIXTURE FOR THIS FILE — the committed second-zone world, with:
 *
 *   • annex A on the west lawn (the FOUNDING zone), operational, and ENGAGED by a live
 *     screenplay reservation retargeted onto it — the same state the allocator itself
 *     produces under heavier load, and asserted legal below before any conclusion is
 *     drawn from it;
 *   • annex B in the SOUTH YARD (the NEW zone), operational and idle.
 */
function twoAnnexStudio(): { state: GameState; engagedId: number; idleId: number } {
  let state = migrateToV17(importSave(fixtureBytes)).state
  // `foundManagedStudio` already activates the managed roots this fixture needs; the
  // activation is conditional so the fixture can gain or lose one without this file
  // silently asserting a mode it never checked.
  if (state.scriptDevelopment.mode === 'legacy') {
    state = applyActions(state, [{ kind: 'activateScriptDevelopment' }])
  }
  if (state.castingSessions.mode === 'legacy') {
    state = applyActions(state, [{ kind: 'activateCastingSessions' }])
  }
  expect(state.scriptDevelopment.mode).toBe('managed')
  state = commitPlacement(state, { blueprintId: ANNEX, origin: WEST_LAWN })
  state = commitPlacement(state, { blueprintId: ANNEX, origin: SOUTH_YARD_EAST })
  expect(state.placement.facilities).toHaveLength(2)
  state = advance(state, BUILD_WEEKS)
  expect(state.placement.facilities.every((placed) => placed.status === 'operational')).toBe(true)

  const engaged = state.placement.facilities[0]!
  const idle = state.placement.facilities[1]!
  expect(engaged.parcelId).toBe('west-lawn')
  expect(idle.parcelId).toBe('south-yard-east')

  state = applyActions(state, [{ kind: 'commissionScript', project: commissionPayload(state) }])
  state = {
    ...state,
    scriptDevelopment: {
      ...state.scriptDevelopment,
      projects: state.scriptDevelopment.projects.map((project) =>
        project.reservation === null
          ? project
          : {
              ...project,
              reservation: { ...project.reservation, facilityId: engaged.facilityId, slot: 0 },
            },
      ),
    },
  }
  // Nothing below rests on a forged shape.
  expect(() => assertStudioPlacementInvariants(state)).not.toThrow()
  expect(facilityEngagements(state, engaged.facilityId)).toHaveLength(1)
  expect(facilityEngagements(state, idle.facilityId)).toEqual([])
  return { state, engagedId: engaged.id, idleId: idle.id }
}

/** Move the idle annex from the new zone's east parcel to its west parcel. */
function moveIdleAcrossTheZone(state: GameState, idleId: number): GameState {
  const moved = moveFacility(state, { placementId: idleId, origin: SOUTH_YARD_WEST })
  expect(moved).not.toBe(state)
  expect(placementOf(moved, idleId).parcelId).toBe('south-yard-west')
  return moved
}

describe('C1-M6 (3) — a move changes the ground and nothing else', () => {
  it('keeps every identity field and moves only what is about position', () => {
    const { state, idleId } = twoAnnexStudio()
    const before = placementOf(state, idleId)
    const after = placementOf(moveIdleAcrossTheZone(state, idleId), idleId)

    // Identity — every field that answers "which building is this?"
    expect(after.id).toBe(before.id)
    expect(after.blueprintId).toBe(before.blueprintId)
    expect(after.facilityId).toBe(before.facilityId)
    expect(after.projectId).toBe(before.projectId)
    expect(after.status).toBe(before.status)
    expect(after.placedWeek).toBe(before.placedWeek)
    expect(after.completesWeek).toBe(before.completesWeek)

    // Position — and ONLY position.
    expect(after.parcelId).not.toBe(before.parcelId)
    expect(after.origin).toEqual(SOUTH_YARD_WEST)
    expect(after.cells).not.toEqual(before.cells)
    expect(after.cells).toHaveLength(before.cells.length)
    expect(Object.keys(after).sort()).toEqual(Object.keys(before).sort())
  })

  it('leaves the ledger, its correlations, and the historical opex untouched', () => {
    const { state, idleId } = twoAnnexStudio()
    const before = placementOf(state, idleId)
    const moved = moveIdleAcrossTheZone(state, idleId)

    // A move is not a purchase: not one row, and not one byte, changes.
    expect(stableStringify(moved.ledger)).toBe(stableStringify(state.ledger))
    const capex = moved.ledger.filter((row) => row.kind === 'constructionCapex')
    expect(capex.map((row) => row.constructionProjectId)).toContain(before.projectId)
    expect(capex.filter((row) => row.constructionProjectId === before.projectId)).toHaveLength(1)

    // Every historical week is still charged exactly what it was charged.
    for (let week = 0; week <= moved.market.tick; week++) {
      expect(expectedWeeklyOperatingCostAt(moved.placement, moved.ledger, week)).toBe(
        expectedWeeklyOperatingCostAt(state.placement, state.ledger, week),
      )
    }
    expect(() => assertStudioPlacementInvariants(moved)).not.toThrow()
  })

  it('answers engagements by facility id, never by where the facility stands', () => {
    const { state, engagedId, idleId } = twoAnnexStudio()
    const engaged = placementOf(state, engagedId)
    const before = stableStringify(facilityEngagements(state, engaged.facilityId))
    const moved = moveIdleAcrossTheZone(state, idleId)

    // The engaged building never moved, and its holder never mentioned a coordinate.
    expect(stableStringify(facilityEngagements(moved, engaged.facilityId))).toBe(before)
    expect(facilityEngagements(moved, engaged.facilityId)[0]!.facilityId).toBe(engaged.facilityId)
    expect(facilityEngagements(moved, placementOf(moved, idleId).facilityId)).toEqual([])

    // …and the refusal the engaged building earns is the SAME refusal at two entirely
    // different destinations, one in each zone. The guard is about who holds it, not
    // about where it is being asked to go.
    const toNewZone = facilityMoveRefusal(state, {
      placementId: engagedId,
      origin: SOUTH_YARD_WEST,
    })
    const toOldZone = facilityMoveRefusal(state, { placementId: engagedId, origin: { gx: 3, gy: 19 } })
    expect(toNewZone?.code).toBe('facilityEngaged')
    expect(stableStringify(toNewZone)).toBe(stableStringify(toOldZone))
    // …and it refused byte-neutrally.
    expect(moveFacility(state, { placementId: engagedId, origin: SOUTH_YARD_WEST })).toBe(state)
  })

  it('keeps the shared-capacity registry entry identical, at the same index', () => {
    const { state, idleId } = twoAnnexStudio()
    const before = placementOf(state, idleId)
    const beforeIndex = state.operations.facilities.findIndex(
      (facility) => facility.id === before.facilityId,
    )
    expect(beforeIndex).toBeGreaterThanOrEqual(0)

    const moved = moveIdleAcrossTheZone(state, idleId)
    // The registry is ordered by completion week then placement id — never by position.
    expect(stableStringify(moved.operations.facilities)).toBe(
      stableStringify(state.operations.facilities),
    )
    expect(
      moved.operations.facilities.findIndex((facility) => facility.id === before.facilityId),
    ).toBe(beforeIndex)
  })

  it('moves the position-derived companion references, and only those', () => {
    const { state, idleId } = twoAnnexStudio()
    const before = studioPlacementView(state)
    const moved = moveIdleAcrossTheZone(state, idleId)
    const after = studioPlacementView(moved)

    const parcelIds = (view: ReturnType<typeof studioPlacementView>, id: string) =>
      view.parcels.find((parcel) => parcel.id === id)!.placedFacilityIds

    // The parcel is a PLACE, so what stands on it follows the ground. Correctly.
    expect(parcelIds(before, 'south-yard-east')).toEqual([idleId])
    expect(parcelIds(before, 'south-yard-west')).toEqual([])
    expect(parcelIds(after, 'south-yard-east')).toEqual([])
    expect(parcelIds(after, 'south-yard-west')).toEqual([idleId])
    expect(before.parcels.map((parcel) => parcel.id)).toEqual(after.parcels.map((p) => p.id))

    // The placement is an IDENTITY, so everything that names the building follows it.
    const beforeRow = before.placements.find((row) => row.id === idleId)!
    const afterRow = after.placements.find((row) => row.id === idleId)!
    expect(afterRow.name).toBe(beforeRow.name)
    expect(afterRow.facilityId).toBe(beforeRow.facilityId)
    expect(afterRow.blueprintId).toBe(beforeRow.blueprintId)
    expect(afterRow.status).toBe(beforeRow.status)
    expect(afterRow.placedWeek).toBe(beforeRow.placedWeek)
    expect(afterRow.completesWeek).toBe(beforeRow.completesWeek)
    expect(afterRow.weeklyOperatingCost).toBe(beforeRow.weeklyOperatingCost)
    expect(afterRow.parcelId).not.toBe(beforeRow.parcelId)
    // The rest of the property answers exactly as it did.
    expect(after.lotWidth).toBe(before.lotWidth)
    expect(after.lotDepth).toBe(before.lotDepth)
    expect(after.weeklyOperatingCost).toBe(before.weeklyOperatingCost)
  })
})

// ── the one that catches a coordinate-keyed system ───────────────────────────

describe('C1-M6 (3) — ground is not identity, even when it is the SAME ground', () => {
  it('gives a new building raised on a demolished one’s exact cells none of its identity', () => {
    const { state, engagedId, idleId } = twoAnnexStudio()
    const moved = moveIdleAcrossTheZone(state, idleId)
    const dead = placementOf(moved, idleId)
    const deadCells = dead.cells.map(cellKey).sort()

    const demolished = demolishFacility(moved, { placementId: idleId })
    expect(demolished).not.toBe(moved)
    expect(demolished.placement.facilities.some((placed) => placed.id === idleId)).toBe(false)

    // Raise a new building on EXACTLY the ground the dead one occupied.
    expect(queryPlacement(demolished, { blueprintId: ANNEX, origin: dead.origin }).ok).toBe(true)
    const rebuilt = commitPlacement(demolished, { blueprintId: ANNEX, origin: dead.origin })
    expect(rebuilt).not.toBe(demolished)
    const successor = rebuilt.placement.facilities.at(-1)!
    expect(successor.cells.map(cellKey).sort()).toEqual(deadCells)

    // Same ground. Nothing else in common.
    expect(successor.id).not.toBe(dead.id)
    expect(successor.id).toBeGreaterThan(dead.id) // ids are monotonic and never reused
    expect(successor.facilityId).not.toBe(dead.facilityId)
    expect(successor.projectId).not.toBe(dead.projectId)
    expect(successor.placedWeek).not.toBe(dead.placedWeek)

    // The dead building's history is still its own, matched by project id and not by
    // the ground its successor now stands on.
    const history = demolishedFacilityHistory(rebuilt.ledger)
    expect(history).toHaveLength(1)
    expect(history[0]!.projectId).toBe(dead.projectId)
    expect(history[0]!.blueprint.id).toBe(ANNEX)
    expect(
      rebuilt.ledger.filter(
        (row) => row.kind === 'constructionCapex' && row.constructionProjectId === successor.projectId,
      ),
    ).toHaveLength(1)
    expect(
      rebuilt.ledger.filter(
        (row) =>
          row.kind === 'facilityDemolitionRefund' &&
          row.constructionProjectId === successor.projectId,
      ),
    ).toHaveLength(0)

    // No engagement was inherited with the ground, and the engaged building on the
    // OTHER side of the property never noticed any of it.
    expect(facilityEngagements(rebuilt, successor.facilityId)).toEqual([])
    expect(facilityEngagements(rebuilt, dead.facilityId)).toEqual([])
    const engaged = placementOf(rebuilt, engagedId)
    expect(stableStringify(facilityEngagements(rebuilt, engaged.facilityId))).toBe(
      stableStringify(facilityEngagements(state, engaged.facilityId)),
    )
    expect(() => assertStudioPlacementInvariants(rebuilt)).not.toThrow()
  })
})
