// ── C1-M8 — the ground the Annex contract holds ──────────────────────────────
//
// THE DEFECT THIS FILE EXISTS FOR (red-team, C1-M8): the legacy `expansion`
// parcel accepted ANY building. A Development Office II built there — or, in the
// shipped flow, carried there by the move ghost, which roams the whole property
// by design — was accepted by the engine and then dropped by the composed world:
// no body, no inspector, no verbs, no demolition, the retained Annex contract
// permanently unstartable, opex billed forever, save-persistent, and not one
// error anywhere. A player could delete a building they had paid for by putting
// it down on the wrong four cells.
//
// THE LAW IT PROVES, in the engine's own words: A PLACEMENT THE ENGINE ACCEPTS
// MUST COMPOSE A BODY. No ground may accept a building it will not show. The
// legality half of that is `RESERVED_PARCEL_BLUEPRINTS` — the legacy parcel
// accepts the Development & Casting Annex the contract itself builds, and refuses
// everything else with `groundReserved`, at BUILD and at MOVE alike.
//
// It is proved four ways, because the trap had four doors:
//   • the query refuses every generic blueprint on every cell of that ground;
//   • the two mutating verbs are byte-neutral against it, mid-construction too;
//   • the contract's own build is untouched — quoted, started, completed;
//   • a save that already carries such a placement FAILS CLOSED with a named
//     error at the invariant and at the V13 load boundary, because a pre-fix or
//     forged save is the one remaining way into the eaten state.
//
// The browser half of this claim is `ui/e2e/tycoon-legacy-parcel-refusal-v1.spec.ts`.

import { describe, expect, it } from 'vitest'
import {
  LEGACY_EXPANSION_PARCEL_ID,
  PLACEMENT_REJECTION_ORDER,
  applyActions,
  assertStudioPlacementInvariants,
  commitPlacement,
  demolishFacility,
  exportSave,
  facilityDemolitionRefusal,
  facilityMoveRefusal,
  generateWorld,
  importSave,
  makeSave,
  moveFacility,
  parcelById,
  parcelReservedBlueprintId,
  queryPlacement,
  studioCalendar,
  studioConstructionView,
  tick,
  validateSaveV15,
} from '../src/core/index.js'
import {
  CRAFT_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_HALL_BLUEPRINT,
  DEVELOPMENT_OFFICE_2_BLUEPRINT,
  FACILITY_BLUEPRINTS,
} from '../src/core/tuning.js'
import type { GameState, LotCell, SaveFileV15 } from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id
const OFFICE_2 = DEVELOPMENT_OFFICE_2_BLUEPRINT.id

// Origins on the initial property, each named by the parcel it belongs to.
const LEGACY_ORIGIN = { gx: 7, gy: 15 } // `expansion` — the reserved ground
const WEST_LAWN = { gx: 0, gy: 9 } // open, road-served ground
const SOUTH_LAWN = { gx: 3, gy: 19 } // ditto, on the boulevard

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

/** Cash adjustment that keeps the cash/ledger reconciliation true. */
function withCash(state: GameState, cash: number): GameState {
  const delta = cash - state.studio.cash
  return {
    ...state,
    studio: { ...state.studio, cash },
    ledger:
      delta === 0
        ? state.ledger
        : [
            ...state.ledger,
            {
              week: state.market.tick,
              kind: delta > 0 ? ('studioRevenue' as const) : ('overhead' as const),
              amount: delta,
              note: 'test fixture cash identity adjustment',
            },
          ],
  }
}

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

function richStudio(seed: string): GameState {
  return withCash(managedStudio(seed), 50_000_000)
}

/** An operational Development Office II standing on the west lawn. */
function standingOffice(seed: string): GameState {
  const built = commitPlacement(richStudio(seed), { blueprintId: OFFICE_2, origin: WEST_LAWN })
  expect(built.placement.facilities).toHaveLength(1)
  const operational = advance(built, DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks)
  expect(operational.placement.facilities[0]!.status).toBe('operational')
  return operational
}

/** Every cell of the reserved parcel, in reading order. */
function reservedCells(state: GameState): LotCell[] {
  const parcel = parcelById(state.property, LEGACY_EXPANSION_PARCEL_ID)!
  const cells: LotCell[] = []
  for (let gy = parcel.rect.y0; gy <= parcel.rect.y1; gy++) {
    for (let gx = parcel.rect.x0; gx <= parcel.rect.x1; gx++) cells.push({ gx, gy })
  }
  return cells
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// ── A. the reservation itself ────────────────────────────────────────────────

describe('C1-M8 (A) — the ground the Annex contract holds', () => {
  it('names exactly one reserved parcel, and the blueprint it is held for', () => {
    const state = managedStudio('c1-m8-reservation')
    const reserved = state.property.parcels
      .filter((parcel) => parcelReservedBlueprintId(parcel.id) !== null)
      .map((parcel) => parcel.id)
    expect(reserved).toEqual([LEGACY_EXPANSION_PARCEL_ID])
    expect(parcelReservedBlueprintId(LEGACY_EXPANSION_PARCEL_ID)).toBe(ANNEX)
    // A reservation is a fact about GROUND, so it ranks with the other ground
    // rules and above `occupied`, which is only ever true of one week.
    const order = [...PLACEMENT_REJECTION_ORDER]
    expect(order.indexOf('groundReserved')).toBeGreaterThan(order.indexOf('terrainUnbuildable'))
    expect(order.indexOf('groundReserved')).toBeLessThan(order.indexOf('occupied'))
  })
})

// ── B. the build door ────────────────────────────────────────────────────────

describe('C1-M8 (B) — a generic building may not be BUILT there', () => {
  it('refuses every catalog blueprint but the Annex, at the parcel origin', () => {
    const state = richStudio('c1-m8-build-refused')
    for (const blueprint of FACILITY_BLUEPRINTS) {
      const quote = queryPlacement(state, { blueprintId: blueprint.id, origin: LEGACY_ORIGIN })
      if (blueprint.id === ANNEX) {
        expect(quote.ok, `${blueprint.id} is the contract's own building`).toBe(true)
        continue
      }
      expect(quote.ok, blueprint.id).toBe(false)
      // The reservation is the PRIMARY answer: it outranks a studio-scope lock
      // (Office III is not unlocked here either) and outranks money.
      expect(quote.primary, blueprint.id).toBe('groundReserved')
      expect(
        quote.cellLegality.filter((verdict) => verdict.rejection === 'groundReserved'),
      ).toHaveLength(quote.cells.length)
    }
  })

  it('refuses it on EVERY cell of the reserved ground, and byte-neutrally', () => {
    const state = richStudio('c1-m8-build-sweep')
    for (const origin of reservedCells(state)) {
      const quote = queryPlacement(state, { blueprintId: OFFICE_2, origin })
      expect(quote.ok, `${String(origin.gx)},${String(origin.gy)}`).toBe(false)
      expect(quote.rejections).toContain('groundReserved')
      // A refused commit returns the SAME state object, so nothing was charged.
      expect(commitPlacement(state, { blueprintId: OFFICE_2, origin })).toBe(state)
    }
  })

  it('refuses a footprint that merely OVERLAPS the reserved ground', () => {
    const state = richStudio('c1-m8-build-straddle')
    // (7,18) puts the front row of the office on the parcel's boulevard frontage
    // strip and the back row off it: half on the reserved ground, and refused for
    // exactly the cells that are on it. The neighbouring ground answers first in
    // the ordered list — `notOwned` is the more fundamental fact about a cell that
    // is not part of the property at all — and that ordering is the standing law,
    // not something this rule may jump.
    const straddle = queryPlacement(state, { blueprintId: OFFICE_2, origin: { gx: 7, gy: 18 } })
    expect(straddle.ok).toBe(false)
    expect(straddle.rejections).toContain('groundReserved')
    const onReserved = straddle.cellLegality.filter(
      (verdict) => verdict.rejection === 'groundReserved',
    )
    expect(onReserved.length).toBeGreaterThan(0)
    expect(onReserved.length).toBeLessThan(straddle.cells.length)
    // Every cell that IS on the reserved ground says so, one for one.
    for (const verdict of straddle.cellLegality) {
      const reserved = verdict.cell.gy <= 18 && verdict.cell.gx >= 7 && verdict.cell.gx <= 10
      if (reserved) expect(verdict.rejection).toBe('groundReserved')
    }
  })

  it('accepts nothing anywhere on the property whose body the world would not show', () => {
    // The standing invariant, swept: across every blueprint and every origin on
    // the property, an ACCEPTED quote never touches reserved ground.
    const state = richStudio('c1-m8-accepted-composes')
    const reserved = new Set(reservedCells(state).map((cell) => `${String(cell.gx)},${String(cell.gy)}`))
    let accepted = 0
    for (const blueprint of FACILITY_BLUEPRINTS) {
      if (blueprint.id === ANNEX) continue // the contract's own ground is its own case
      for (let gy = 0; gy < state.property.bounds.depth; gy++) {
        for (let gx = 0; gx < state.property.bounds.width; gx++) {
          const quote = queryPlacement(state, { blueprintId: blueprint.id, origin: { gx, gy } })
          if (!quote.ok) continue
          accepted++
          for (const cell of quote.cells) {
            expect(reserved.has(`${String(cell.gx)},${String(cell.gy)}`)).toBe(false)
          }
        }
      }
    }
    expect(accepted).toBeGreaterThan(0)
  })
})

// ── C. the move door — the one the shipped UI actually opens ─────────────────

describe('C1-M8 (C) — a building the studio owns may not be CARRIED there', () => {
  it('refuses the move from every cell of the reserved ground, byte-neutrally', () => {
    const state = standingOffice('c1-m8-move-refused')
    const before = exportSave(makeSave(state))
    for (const origin of reservedCells(state)) {
      const label = `${String(origin.gx)},${String(origin.gy)}`
      const refusal = facilityMoveRefusal(state, { placementId: 1, origin })
      expect(refusal?.code, label).toBe('illegalDestination')
      if (refusal?.code !== 'illegalDestination') throw new Error('unreachable')
      // Every one of these origins puts at least one cell on the reserved ground.
      // Origins near the parcel edge ALSO run off the property, and `notOwned`
      // still answers first there — the reservation never jumps the binding order.
      expect(refusal.quote.rejections, label).toContain('groundReserved')
      // The SAME state object comes back: a refused move charges and moves nothing.
      expect(moveFacility(state, { placementId: 1, origin })).toBe(state)
    }
    // On the ground the ghost actually lands on, the reservation IS the answer.
    const atOrigin = facilityMoveRefusal(state, { placementId: 1, origin: LEGACY_ORIGIN })
    if (atOrigin?.code !== 'illegalDestination') throw new Error('unreachable')
    expect(atOrigin.quote.primary).toBe('groundReserved')
    expect(exportSave(makeSave(state))).toBe(before)
    // …and the building is still where it was, still movable and demolishable.
    expect(state.placement.facilities[0]!.origin).toEqual(WEST_LAWN)
    expect(facilityMoveRefusal(state, { placementId: 1, origin: SOUTH_LAWN })).toBeNull()
    expect(facilityDemolitionRefusal(state, { placementId: 1 })).toBeNull()
  })

  it('refuses it MID-CONSTRUCTION too, so a half-built site cannot be parked there', () => {
    const building = advance(
      commitPlacement(richStudio('c1-m8-move-mid-build'), {
        blueprintId: OFFICE_2,
        origin: WEST_LAWN,
      }),
      2,
    )
    expect(building.placement.facilities[0]!.status).toBe('underConstruction')
    const refusal = facilityMoveRefusal(building, { placementId: 1, origin: LEGACY_ORIGIN })
    expect(refusal?.code).toBe('illegalDestination')
    expect(moveFacility(building, { placementId: 1, origin: LEGACY_ORIGIN })).toBe(building)
    // The site completes on its own ground and stays a building the player owns.
    const finished = advance(building, DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks)
    expect(finished.placement.facilities[0]!.parcelId).toBe('west-lawn')
    expect(facilityDemolitionRefusal(finished, { placementId: 1 })).toBeNull()
    assertStudioPlacementInvariants(finished)
  })

  it('refuses the move beside a STANDING Annex with the reservation, not merely "occupied"', () => {
    const withAnnex = commitPlacement(standingOffice('c1-m8-move-beside-annex'), {
      blueprintId: ANNEX,
      origin: LEGACY_ORIGIN,
    })
    const operational = advance(withAnnex, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    expect(studioConstructionView(operational).status).toBe('operational')
    // The clear corner of the pad, where the Annex's own 3×2 body is not standing.
    const refusal = facilityMoveRefusal(operational, { placementId: 1, origin: { gx: 8, gy: 17 } })
    expect(refusal?.code).toBe('illegalDestination')
    if (refusal?.code !== 'illegalDestination') throw new Error('unreachable')
    expect(refusal.quote.primary).toBe('groundReserved')
    expect(operational.placement.facilities.filter((placed) => placed.parcelId === 'expansion'))
      .toHaveLength(1)
  })

  it('leaves every OTHER destination exactly as legal as it was', () => {
    const state = standingOffice('c1-m8-move-elsewhere')
    const moved = moveFacility(state, { placementId: 1, origin: SOUTH_LAWN })
    expect(moved).not.toBe(state)
    const placed = moved.placement.facilities[0]!
    expect(placed.origin).toEqual(SOUTH_LAWN)
    expect(placed.parcelId).toBe('south-lawn')
    expect(placed.id).toBe(state.placement.facilities[0]!.id)
    expect(placed.facilityId).toBe(state.placement.facilities[0]!.facilityId)
    expect(moved.studio.cash).toBe(state.studio.cash)
    assertStudioPlacementInvariants(moved)
  })
})

// ── D. the contract itself, untouched ────────────────────────────────────────

describe('C1-M8 (D) — the legacy Annex contract works exactly as sealed', () => {
  it('quotes, starts, builds and completes on its own ground', () => {
    const state = richStudio('c1-m8-annex-contract')
    const vacant = studioConstructionView(state)
    expect(vacant.status).toBe('vacant')
    expect(vacant.canStart).toBe(true)
    expect(vacant.parcelId).toBe(LEGACY_EXPANSION_PARCEL_ID)

    const started = commitPlacement(state, { blueprintId: ANNEX, origin: LEGACY_ORIGIN })
    expect(started).not.toBe(state)
    expect(studioConstructionView(started).status).toBe('building')
    const operational = advance(started, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    const view = studioConstructionView(operational)
    expect(view.status).toBe('operational')
    expect(view.facilityId).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.facilityIdBase)
    expect(view.completedCapacityGain).toBe(1)
    // Frozen until the C2 Flip, exactly as before.
    expect(facilityDemolitionRefusal(operational, { placementId: 1 })?.code).toBe('foundingPlacement')
    expect(demolishFacility(operational, { placementId: 1 })).toBe(operational)
    assertStudioPlacementInvariants(operational)
    expect(studioCalendar(operational)).toBeTruthy()
  })

  it('stays startable after a generic building has been refused the ground', () => {
    // The trap's real cost was that the contract died silently. Prove it lives.
    const state = standingOffice('c1-m8-annex-after-refusal')
    for (const origin of reservedCells(state)) {
      expect(moveFacility(state, { placementId: 1, origin })).toBe(state)
      expect(commitPlacement(state, { blueprintId: CRAFT_ANNEX_BLUEPRINT.id, origin })).toBe(state)
    }
    expect(studioConstructionView(state).canStart).toBe(true)
    const started = commitPlacement(state, { blueprintId: ANNEX, origin: LEGACY_ORIGIN })
    expect(studioConstructionView(started).status).toBe('building')
  })
})

// ── E. the saves that already carry the trap ─────────────────────────────────

describe('C1-M8 (E) — a save that stands a generic building there fails CLOSED', () => {
  /** The forgery a pre-fix session could genuinely have written to disk. */
  function forgedSave(seed: string): SaveFileV15 {
    const save = clone(makeSave(standingOffice(seed)))
    const placed = save.state.placement.facilities[0]!
    placed.parcelId = LEGACY_EXPANSION_PARCEL_ID
    placed.origin = { ...LEGACY_ORIGIN }
    placed.cells = [
      { gx: 7, gy: 15 },
      { gx: 8, gy: 15 },
      { gx: 9, gy: 15 },
      { gx: 7, gy: 16 },
      { gx: 8, gy: 16 },
      { gx: 9, gy: 16 },
    ]
    return save
  }

  it('is refused by the invariant and at the V13 load boundary, by name', () => {
    const save = forgedSave('c1-m8-forged-save')
    const named = /stands on ground reserved for the studio's Annex contract/
    expect(() =>
      assertStudioPlacementInvariants(save.state as unknown as GameState),
    ).toThrow(named)
    expect(() => validateSaveV15(save)).toThrow(named)
    // The load path a player actually reaches — never a half-loaded world.
    expect(() => importSave(JSON.stringify(save))).toThrow(named)
  })

  it('accepts the standing legacy Annex on that same ground, so the law is not over-tight', () => {
    const annex = advance(
      commitPlacement(richStudio('c1-m8-annex-save'), { blueprintId: ANNEX, origin: LEGACY_ORIGIN }),
      DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks,
    )
    const save = makeSave(annex)
    expect(validateSaveV15(save)).toBe(save)
    const json = exportSave(save)
    expect(exportSave(importSave(json) as SaveFileV15)).toBe(json)
    expect(annex.placement.facilities[0]!.parcelId).toBe(LEGACY_EXPANSION_PARCEL_ID)
  })

  it('refuses a forgery of any other catalog building on that ground', () => {
    // Each building is BUILT legally first, so the only thing wrong with the save
    // is where it stands — every other correlation the invariants enforce is real.
    for (const [blueprint, origin] of [
      [DEVELOPMENT_CASTING_HALL_BLUEPRINT, SOUTH_LAWN],
      [CRAFT_ANNEX_BLUEPRINT, WEST_LAWN],
    ] as const) {
      const built = commitPlacement(richStudio(`c1-m8-forged-${blueprint.id}`), {
        blueprintId: blueprint.id,
        origin,
      })
      expect(built.placement.facilities).toHaveLength(1)
      const save = clone(makeSave(built))
      const placed = save.state.placement.facilities[0]!
      placed.parcelId = LEGACY_EXPANSION_PARCEL_ID
      placed.origin = { ...LEGACY_ORIGIN }
      placed.cells = []
      for (let dy = 0; dy < blueprint.footprint.depth; dy++) {
        for (let dx = 0; dx < blueprint.footprint.width; dx++) {
          placed.cells.push({ gx: LEGACY_ORIGIN.gx + dx, gy: LEGACY_ORIGIN.gy + dy })
        }
      }
      expect(() => validateSaveV15(save), blueprint.id).toThrow(/reserved for the studio's Annex/)
    }
  })
})
