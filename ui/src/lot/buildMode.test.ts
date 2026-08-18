// ── Build Mode V1 — the pure parts of the in-world placement flow ─────────────
//
// Every fixture below is built with the engine's own public surface, exactly as the
// snapshot tests do, and every expectation is read from the Engine's projection —
// so a test here can never certify a number this module invented.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  tick,
} from '../../../src/core/index.ts'
import type { CreativeRole, GameState } from '../../../src/core/index.ts'
import {
  PLACEMENT_REJECTION_SEQUENCE,
  placementQuote,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import type { LotPlacementProjection } from './snapshot/StudioLotSnapshot.ts'
import {
  LOT_PLACEMENT_REJECTION_TEXT,
  blueprintById,
  buildQuoteKey,
  buildReceiptText,
  clampBuildOrigin,
  defaultBuildOrigin,
  footprintCellsAt,
  lotParcelInspectorContext,
  parcelAtCell,
  parcelById,
  placementsOnParcel,
  quoteFacts,
  quoteRejectionText,
  rectSize,
} from './buildMode.ts'

const ANNEX = 'development-casting-annex'

function foundStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
  const byRole = (role: CreativeRole, count: number) =>
    pool.filter((talent) => talent.role === role).slice(0, count)
  const toSign = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const talent of toSign) {
    state = applyActions(state, [{ kind: 'signContract', talentId: talent.id, termWeeks: 156 }])
  }
  // Managed operations is the regime a placement requires; found it exactly the way
  // the adapter's own `foundManagedStudioAction` does.
  return applyActions(state, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}

function placementOf(state: GameState): LotPlacementProjection {
  const projection = studioLotSnapshot(state).placement
  if (projection === undefined) throw new Error('snapshot carries no placement projection')
  return projection
}

const BASE = foundStudio('build-mode-v1')
const BASE_PLACEMENT = placementOf(BASE)

describe('Build Mode V1 — parcel geometry', () => {
  it('reports inclusive parcel size, matching the engine rectangles', () => {
    const westLawn = parcelById(BASE_PLACEMENT, 'west-lawn')
    expect(westLawn).not.toBeNull()
    // (0,9)–(2,14) inclusive is 3 × 6 cells.
    expect(rectSize(westLawn!.rect)).toEqual({ width: 3, depth: 6 })
  })

  it('resolves the parcel that owns a cell, and none for unclaimed ground', () => {
    expect(parcelAtCell(BASE_PLACEMENT, { gx: 0, gy: 9 })?.id).toBe('west-lawn')
    // The studio avenue is circulation, never a parcel.
    expect(parcelAtCell(BASE_PLACEMENT, { gx: 5, gy: 7 })).toBeNull()
  })

  it('lays a footprint out in the same fixed reading order the engine uses', () => {
    expect(footprintCellsAt({ gx: 4, gy: 20 }, { width: 3, depth: 2 })).toEqual([
      { gx: 4, gy: 20 },
      { gx: 5, gy: 20 },
      { gx: 6, gy: 20 },
      { gx: 4, gy: 21 },
      { gx: 5, gy: 21 },
      { gx: 6, gy: 21 },
    ])
  })
})

describe('Build Mode V1 — the draft origin', () => {
  const southLawn = parcelById(BASE_PLACEMENT, 'south-lawn')!
  const annex = blueprintById(BASE_PLACEMENT, ANNEX)!

  it('clamps a footprint INTO the parcel rather than sliding it somewhere else', () => {
    // south-lawn is (3,19)–(8,22); a 3×2 footprint may start no later than (6,21).
    expect(clampBuildOrigin({ gx: 99, gy: 99 }, southLawn.rect, annex.footprint)).toEqual({
      gx: 6,
      gy: 21,
    })
    expect(clampBuildOrigin({ gx: -4, gy: -4 }, southLawn.rect, annex.footprint)).toEqual({
      gx: 3,
      gy: 19,
    })
    // An origin already inside is returned untouched.
    expect(clampBuildOrigin({ gx: 5, gy: 20 }, southLawn.rect, annex.footprint)).toEqual({
      gx: 5,
      gy: 20,
    })
  })

  it('clamps a footprint larger than its parcel to the parcel origin', () => {
    const northLawn = parcelById(BASE_PLACEMENT, 'north-lawn')! // (0,2)–(2,6): 3 × 5
    expect(clampBuildOrigin({ gx: 2, gy: 6 }, northLawn.rect, { width: 9, depth: 9 })).toEqual({
      gx: 0,
      gy: 2,
    })
  })

  it('refuses a non-finite origin without inventing one off the parcel', () => {
    expect(clampBuildOrigin({ gx: Number.NaN, gy: 20 }, southLawn.rect, annex.footprint)).toEqual({
      gx: 3,
      gy: 20,
    })
  })

  it('starts a fresh draft at the first origin that touches nothing already placed', () => {
    expect(defaultBuildOrigin(southLawn, annex.footprint, [])).toEqual({ gx: 3, gy: 19 })
    const occupying = {
      id: 1,
      blueprintId: ANNEX,
      name: 'Development & Casting Annex',
      facilityId: 'facility-development-casting-annex',
      parcelId: 'south-lawn',
      origin: { gx: 3, gy: 19 },
      cells: footprintCellsAt({ gx: 3, gy: 19 }, annex.footprint),
      status: 'underConstruction' as const,
      placedWeek: 0,
      completesWeek: 13,
      weeksRemaining: 13,
      progress01: 0,
      weeklyOperatingCost: 3_500,
    }
    expect(defaultBuildOrigin(southLawn, annex.footprint, [occupying])).toEqual({ gx: 6, gy: 19 })
  })
})

describe('Build Mode V1 — the identical-input memo', () => {
  it('produces one key per (blueprint, origin, week, cash) tuple', () => {
    const a = buildQuoteKey(ANNEX, { gx: 3, gy: 19 }, 0, 20_000_000)
    const b = buildQuoteKey(ANNEX, { gx: 3, gy: 19 }, 0, 20_000_000)
    expect(a).toBe(b)
    expect(buildQuoteKey(ANNEX, { gx: 4, gy: 19 }, 0, 20_000_000)).not.toBe(a)
    expect(buildQuoteKey(ANNEX, { gx: 3, gy: 19 }, 1, 20_000_000)).not.toBe(a)
    // A change of cash alone can flip affordability without the cursor moving at all.
    expect(buildQuoteKey(ANNEX, { gx: 3, gy: 19 }, 0, 100)).not.toBe(a)
  })
})

describe('Build Mode V1 — rejection words', () => {
  it('gives every engine rejection code exactly one player sentence', () => {
    for (const code of PLACEMENT_REJECTION_SEQUENCE) {
      expect(LOT_PLACEMENT_REJECTION_TEXT[code]).toMatch(/\S/)
    }
    expect(Object.keys(LOT_PLACEMENT_REJECTION_TEXT).sort()).toEqual(
      [...PLACEMENT_REJECTION_SEQUENCE].sort(),
    )
  })

  it('reports the engine primary — a legality failure always outranks money', () => {
    // The north back lot is buildable and owned but has NO road frontage. The studio is
    // also rich enough to afford the annex, so this proves ordering by construction.
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 22, gy: 1 } })
    expect(quote.ok).toBe(false)
    expect(quote.primary).toBe('noRoadAccess')
    expect(quoteRejectionText(quote)).toBe(LOT_PLACEMENT_REJECTION_TEXT.noRoadAccess)
  })

  it('says nothing at all about a legal quote', () => {
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } })
    expect(quote.ok).toBe(true)
    expect(quoteRejectionText(quote)).toBeNull()
  })

  it('paints every cell of an illegal footprint, not just the first bad one', () => {
    // west-lawn is (0,9)–(2,14) and is only 3 wide; a 3×2 origin at gx 1 runs off it.
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 1, gy: 10 } })
    expect(quote.cellLegality).toHaveLength(6)
    expect(quote.cellLegality.filter((verdict) => verdict.ok).length).toBeGreaterThan(0)
    expect(quote.cellLegality.filter((verdict) => !verdict.ok).length).toBeGreaterThan(0)
  })
})

describe('Build Mode V1 — the cost box and the receipt', () => {
  it('states capital, clock, running cost and capacity, all from the quote', () => {
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } })
    const facts = quoteFacts(quote)
    expect(facts.map((fact) => fact.key)).toEqual([
      'quote:cost',
      'quote:weeks',
      'quote:opex',
      'quote:capacity',
    ])
    expect(facts[0]!.detail).toContain('780,000')
    expect(facts[1]!.detail).toContain('13 weeks')
    expect(facts[1]!.detail).toContain(`Week ${String(quote.completesOnWeek)}`)
    expect(facts[2]!.detail).toContain('3,500')
    expect(facts[3]!.detail).toBe('+1 shared slot')
  })

  it('names cost and completion week in the receipt', () => {
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } })
    expect(buildReceiptText(quote, 'Development & Casting Annex')).toBe(
      `$780,000 committed to Development & Casting Annex. Construction completes in Week ${String(quote.completesOnWeek)}.`,
    )
  })

  // C1-M8: a move quoted through the build machinery must not promise a build. The
  // blueprint's construction clock in a move panel offered a six-week rebuild that
  // never happens; a move states only what a move does.
  it('a move quote promises no construction clock and no new capacity', () => {
    const quote = placementQuote(BASE, { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } })
    const facts = quoteFacts(quote, true)
    expect(facts.map((fact) => fact.key)).toEqual(['quote:cost', 'quote:weeks', 'quote:opex'])
    expect(facts[0]!.term).toBe('Move cost')
    expect(facts[1]!).toMatchObject({
      term: 'Downtime',
      detail: 'None — the building moves standing.',
    })
    expect(facts[2]!.detail).toBe('$3,500 — unchanged by the move')
    expect(facts.some((fact) => fact.detail.includes('completes Week'))).toBe(false)
    expect(facts.some((fact) => fact.detail.includes('once operational'))).toBe(false)
  })
})

describe('Build Mode V1 — the parcel panel', () => {
  it('withholds a panel for a parcel the projection does not describe', () => {
    expect(lotParcelInspectorContext(BASE_PLACEMENT, 'no-such-parcel')).toBeNull()
    expect(lotParcelInspectorContext(null, 'west-lawn')).toBeNull()
  })

  it('offers a build on open, road-served ground', () => {
    const context = lotParcelInspectorContext(BASE_PLACEMENT, 'south-lawn')!
    expect(context.status).toBe('vacant')
    expect(context.canBuild).toBe(true)
    expect(context.buildBlockedReason).toBeNull()
    expect(context.facts.find((fact) => fact.key === 'parcel:frontage')?.detail).toContain('Yes')
    expect(context.placements).toEqual([])
  })

  it('refuses a build on protected ground and says why', () => {
    const context = lotParcelInspectorContext(BASE_PLACEMENT, 'courtyard')!
    expect(context.status).toBe('blocked')
    expect(context.canBuild).toBe(false)
    expect(context.buildBlockedReason).toBe(
      'This ground is protected — the studio does not build on it.',
    )
  })

  it('refuses a build on ground with no road frontage and says why', () => {
    const context = lotParcelInspectorContext(BASE_PLACEMENT, 'north-back-lot')!
    expect(context.canBuild).toBe(false)
    expect(context.buildBlockedReason).toContain('no road frontage')
    expect(context.facts.find((fact) => fact.key === 'parcel:frontage')?.detail).toContain('None')
  })

  it('reads a construction site, then the operational building, from engine truth', () => {
    const committed = applyActions(BASE, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    const building = lotParcelInspectorContext(placementOf(committed), 'south-lawn')!
    expect(building.status).toBe('building')
    expect(building.statusLine).toContain('under construction')
    expect(building.statusLine).toContain('13 to go')
    expect(building.placements).toHaveLength(1)
    expect(building.placements[0]!.status).toBe('underConstruction')

    let advanced = committed
    for (let week = 0; week < 13; week++) advanced = tick(advanced)
    const operational = lotParcelInspectorContext(placementOf(advanced), 'south-lawn')!
    expect(operational.status).toBe('operational')
    expect(operational.statusLine).toContain('operational')
    expect(operational.statusLine).toContain('$3,500')
    expect(operational.placements[0]!.status).toBe('operational')
    expect(operational.placements[0]!.progress01).toBe(1)
  })

  it('lists two annexes on two different parcels, each on its own ground', () => {
    let state = applyActions(BASE, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    state = applyActions(state, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 0, gy: 9 } } },
    ])
    const projection = placementOf(state)
    expect(projection.placements).toHaveLength(2)
    expect(placementsOnParcel(projection, 'south-lawn')).toHaveLength(1)
    expect(placementsOnParcel(projection, 'west-lawn')).toHaveLength(1)
    expect(new Set(projection.placements.map((placed) => placed.facilityId)).size).toBe(2)
    expect(lotParcelInspectorContext(projection, 'south-lawn')!.status).toBe('building')
    expect(lotParcelInspectorContext(projection, 'west-lawn')!.status).toBe('building')
  })

  it('mid-construction progress is the engine clock, never a wall clock', () => {
    let state = applyActions(BASE, [
      { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } } },
    ])
    for (let week = 0; week < 4; week++) state = tick(state)
    const placed = placementOf(state).placements[0]!
    expect(placed.status).toBe('underConstruction')
    expect(placed.progress01).toBeCloseTo(4 / 13, 10)
    expect(placed.weeksRemaining).toBe(9)
  })
})
