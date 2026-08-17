// Placement Core V12 — the strict SaveFileV12 persistence boundary.
//
// Law 18 (strict current, permissive historical) and law 19 (copy the historical
// boundary guard pattern verbatim for new roots) are the contract here:
//   • V12 is the live envelope and validates its own placement authority
//     exactly, structurally and semantically.
//   • V11's rules are UNCHANGED and still reject V12 authority under their tag.
//   • V1–V11 boundaries reject the placement root, the operating ledger kind,
//     any non-canonical catalog project id, and any suffixed placed facility.
//   • migrateToV11 refuses to downgrade; every frozen builder refuses to discard.
//   • V11 → V12 migration moves a legacy Annex without inventing anything.

import { describe, expect, it } from 'vitest'
import {
  ANNEX_CAPEX,
  ANNEX_DURATION_WEEKS,
  ANNEX_FACILITY_ID,
  ANNEX_LEDGER_NOTE,
  ANNEX_PARCEL_ID,
  ANNEX_PROJECT_ID,
  applyActions,
  commitPlacement,
  convertV10ToV11,
  convertV11ToV12,
  emptyStudioConstruction,
  emptyStudioPlacement,
  exportSave,
  generateWorld,
  importSave,
  initialManagedStudioConstruction,
  initialManagedStudioPlacement,
  makeSave,
  makeSaveV1,
  makeSaveV10,
  makeSaveV11,
  migrateToV10,
  migrateToV11,
  convertV12ToV13,
  makeSaveV12,
  migrateToV12,
  stableStringify,
  tick,
  validateSave,
  validateSaveV11,
  validateSaveV12,
  validateSaveV13,
} from '../src/core/index.js'
import type {
  GameState,
  PlacementRequest,
  SaveFileV11,
  SaveFileV12,
  StudioConstruction,
} from '../src/core/index.js'

const ANNEX = 'development-casting-annex'
const LEGACY: PlacementRequest = { blueprintId: ANNEX, origin: { gx: 7, gy: 15 } }
const WEST_NORTH: PlacementRequest = { blueprintId: ANNEX, origin: { gx: 0, gy: 9 } }

function clone<T>(value: T): T {
  return JSON.parse(stableStringify(value)) as T
}

function managedVacant(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

function building(seed: string): GameState {
  return commitPlacement(managedVacant(seed), LEGACY)
}

function advance(state: GameState, weeks: number): GameState {
  let next = state
  for (let week = 0; week < weeks; week++) next = tick(next)
  return next
}

/**
 * A genuine V11 envelope carrying the fixed-parcel Annex in the frozen shape.
 * Built from a placement-free managed state so `makeSaveV11` accepts it, then
 * given exactly the V11 project, parcel link, capex row, and (when completed)
 * the Annex facility. Used to prove the V11 → V12 migration on real V11 input.
 */
function legacyV11Save(
  seed: string,
  status: 'vacant' | 'building' | 'completed',
): SaveFileV11 {
  const vacant = managedVacant(seed)
  if (status === 'vacant') return makeSaveV11(vacant)

  const startedWeek = 0
  const construction: StudioConstruction = {
    mode: 'managed',
    parcels: [{ id: ANNEX_PARCEL_ID, projectId: ANNEX_PROJECT_ID }],
    projects: [
      {
        id: ANNEX_PROJECT_ID,
        kind: 'development-casting-annex',
        parcelId: ANNEX_PARCEL_ID,
        facilityId: ANNEX_FACILITY_ID,
        status: status === 'completed' ? 'completed' : 'building',
        capex: ANNEX_CAPEX,
        startedWeek,
        dueWeek: startedWeek + ANNEX_DURATION_WEEKS,
        completedWeek: status === 'completed' ? startedWeek + ANNEX_DURATION_WEEKS : null,
      },
    ],
  }
  // The frozen V11 shape is reached by advancing the placement-free state to the
  // right week and then substituting the V11 construction root, its debit, and
  // (when operational) the facility the V11 tick would have appended.
  const weeks = status === 'completed' ? ANNEX_DURATION_WEEKS : 4
  const advanced = advance(vacant, weeks)
  const source: GameState = {
    ...advanced,
    studio: { ...advanced.studio, cash: advanced.studio.cash - ANNEX_CAPEX },
    ledger: [
      {
        week: startedWeek,
        kind: 'constructionCapex',
        amount: -ANNEX_CAPEX,
        constructionProjectId: ANNEX_PROJECT_ID,
        note: ANNEX_LEDGER_NOTE,
      },
      ...advanced.ledger,
    ],
    operations:
      status === 'completed'
        ? {
            ...advanced.operations,
            facilities: [
              ...advanced.operations.facilities,
              {
                id: ANNEX_FACILITY_ID,
                name: 'Development & Casting Annex',
                capability: 'development-casting',
                capacity: 1,
              },
            ],
          }
        : advanced.operations,
    construction,
    placement: emptyStudioPlacement(),
  }
  return makeSaveV11(source)
}

// C1-M1a: V12 is now a FROZEN format — the live envelope is SaveFileV13 (see
// property-save-v13.test.ts). Every V12 law below still binds, exercised through
// the explicit `makeSaveV12` frozen builder instead of the live `makeSave`.
describe('Placement Core V12 — the frozen envelope', () => {
  it('writes V12 explicitly and round-trips every lifecycle state byte-identically', () => {
    const started = building('save-v12-lifecycles')
    const states = [
      generateWorld('save-v12-legacy'),
      managedVacant('save-v12-vacant'),
      started,
      advance(started, ANNEX_DURATION_WEEKS),
      advance(started, ANNEX_DURATION_WEEKS + 3),
      commitPlacement(commitPlacement(managedVacant('save-v12-many'), LEGACY), WEST_NORTH),
    ]
    for (const state of states) {
      const save = makeSaveV12(state)
      expect(save.saveVersion).toBe(12)
      expect(validateSave(save)).toBe(save)
      expect(validateSaveV12(save)).toBe(save)
      const json = exportSave(save)
      expect(exportSave(importSave(json))).toBe(json)
      expect(exportSave(migrateToV12(importSave(json)))).toBe(json)
    }
  })

  it('projects the placement root positively, dropping unknown future fields', () => {
    const withFuture = {
      ...managedVacant('save-v12-projection'),
      futureV13: { mustNotLeak: true },
    }
    const save = makeSaveV12(withFuture)
    expect('futureV13' in save.state).toBe(false)
    // The V13 property root is projected away too — it has no V12 home.
    expect('property' in save.state).toBe(false)
    expect(save.state.placement).toEqual(initialManagedStudioPlacement())
    expect(Object.keys(save.state).sort()).toContain('placement')
  })

  it('rejects a malformed placement root structurally, before any domain rule', () => {
    const valid = makeSaveV12(building('save-v12-shape'))
    const cases: ReadonlyArray<[string, (save: SaveFileV12) => void, RegExp]> = [
      [
        'missing root',
        (save) => {
          delete (save.state as unknown as Record<string, unknown>).placement
        },
        /state is missing required field "placement"/,
      ],
      [
        'not an object',
        (save) => {
          ;(save.state as unknown as Record<string, unknown>).placement = 7
        },
        /state\.placement must be a plain object/,
      ],
      [
        'unknown field',
        (save) => {
          ;(save.state.placement as unknown as Record<string, unknown>).future = true
        },
        /state\.placement has unknown field "future"/,
      ],
      [
        'bad mode',
        (save) => {
          ;(save.state.placement as unknown as Record<string, unknown>).mode = 'other'
        },
        /state\.placement\.mode must be "legacy" or "managed"/,
      ],
      [
        'zero nextPlacementId',
        (save) => {
          save.state.placement.nextPlacementId = 0
        },
        /nextPlacementId must be a finite integer no less than 1/,
      ],
      [
        'non-integer cell',
        (save) => {
          save.state.placement.facilities[0]!.origin.gx = 7.5
        },
        /origin\.gx must be a finite integer/,
      ],
      [
        'empty cells',
        (save) => {
          save.state.placement.facilities[0]!.cells = []
        },
        /cells must be a non-empty array/,
      ],
      [
        'unknown status',
        (save) => {
          ;(save.state.placement.facilities[0] as unknown as Record<string, unknown>).status =
            'mothballed'
        },
        /status must be one of/,
      ],
      [
        'empty facility id',
        (save) => {
          save.state.placement.facilities[0]!.facilityId = ''
        },
        /facilityId/,
      ],
    ]
    for (const [, mutate, expected] of cases) {
      const bad = clone(valid)
      mutate(bad)
      expect(() => validateSaveV12(bad)).toThrow(expected)
    }
  })

  it('rejects a semantically forged placement root', () => {
    const valid = makeSaveV12(building('save-v12-semantics'))
    const cases: ReadonlyArray<[string, (save: SaveFileV12) => void, RegExp]> = [
      [
        'cells disagree with the blueprint footprint',
        (save) => {
          save.state.placement.facilities[0]!.cells.pop()
        },
        /cells disagree with its blueprint footprint/,
      ],
      [
        'moved onto unowned ground',
        (save) => {
          save.state.placement.facilities[0]!.origin = { gx: 9, gy: 2 }
          save.state.placement.facilities[0]!.cells = [
            { gx: 9, gy: 2 },
            { gx: 10, gy: 2 },
            { gx: 11, gy: 2 },
            { gx: 9, gy: 3 },
            { gx: 10, gy: 3 },
            { gx: 11, gy: 3 },
          ]
        },
        /origin is not on an owned parcel/,
      ],
      [
        'parcelId disagrees with the origin',
        (save) => {
          save.state.placement.facilities[0]!.parcelId = 'west-lawn'
        },
        /parcelId disagrees with its origin/,
      ],
      [
        'unknown blueprint',
        (save) => {
          save.state.placement.facilities[0]!.blueprintId = 'no-such-blueprint'
        },
        /references unknown blueprint/,
      ],
      [
        'id not reserved',
        (save) => {
          save.state.placement.nextPlacementId = 1
        },
        /id is not reserved by nextPlacementId/,
      ],
      [
        'wrong completion clock',
        (save) => {
          save.state.placement.facilities[0]!.completesWeek += 1
        },
        /completesWeek must equal placedWeek \+ 13/,
      ],
      [
        'status ahead of the clock',
        (save) => {
          save.state.placement.facilities[0]!.status = 'operational'
        },
        /status disagrees with its committed completion week/,
      ],
      [
        'non-canonical identity',
        (save) => {
          save.state.placement.facilities[0]!.facilityId = 'facility-something-else'
        },
        /facilityId is not a canonical identity/,
      ],
      [
        'capex row without a placement',
        (save) => {
          save.state.placement.facilities = []
          save.state.placement.nextPlacementId = 1
        },
        /has no placed facility/,
      ],
      [
        'placement without a capex row',
        (save) => {
          save.state.ledger = save.state.ledger.filter(
            (entry) => entry.kind !== 'constructionCapex',
          )
          save.state.studio.cash += ANNEX_CAPEX
        },
        /has no construction capex row/,
      ],
      [
        'wrong capex amount',
        (save) => {
          const row = save.state.ledger.find((entry) => entry.kind === 'constructionCapex')!
          row.amount = -1
          save.state.studio.cash += ANNEX_CAPEX - 1
        },
        /construction capex amount must equal the blueprint capex/,
      ],
      [
        'retired V11 project root repopulated',
        (save) => {
          save.state.construction = {
            mode: 'managed',
            parcels: [{ id: ANNEX_PARCEL_ID, projectId: ANNEX_PROJECT_ID }],
            projects: [
              {
                id: ANNEX_PROJECT_ID,
                kind: 'development-casting-annex',
                parcelId: ANNEX_PARCEL_ID,
                facilityId: ANNEX_FACILITY_ID,
                status: 'building',
                capex: ANNEX_CAPEX,
                startedWeek: 0,
                dueWeek: ANNEX_DURATION_WEEKS,
                completedWeek: null,
              },
            ],
          }
        },
        /projects must be empty in SaveFileV12/,
      ],
    ]
    for (const [, mutate, expected] of cases) {
      const bad = clone(valid)
      mutate(bad)
      expect(() => validateSaveV12(bad)).toThrow(expected)
    }
  })

  it('rejects overlapping placements and clearance-ring violations in a forged save', () => {
    const twoPlacements = commitPlacement(
      commitPlacement(managedVacant('save-v12-overlap'), WEST_NORTH),
      { blueprintId: ANNEX, origin: { gx: 0, gy: 12 } },
    )
    const valid = makeSave(twoPlacements)
    expect(validateSaveV13(valid)).toBe(valid)

    const overlapped = clone(valid)
    overlapped.state.placement.facilities[1]!.origin = { gx: 0, gy: 9 }
    overlapped.state.placement.facilities[1]!.cells =
      overlapped.state.placement.facilities[0]!.cells.map((cell) => ({ ...cell }))
    expect(() => validateSaveV13(overlapped)).toThrow(/overlaps placed facility 1/)

    const tooClose = clone(valid)
    tooClose.state.placement.facilities[1]!.origin = { gx: 0, gy: 11 }
    tooClose.state.placement.facilities[1]!.cells = [
      { gx: 0, gy: 11 },
      { gx: 1, gy: 11 },
      { gx: 2, gy: 11 },
      { gx: 0, gy: 12 },
      { gx: 1, gy: 12 },
      { gx: 2, gy: 12 },
    ]
    expect(() => validateSaveV13(tooClose)).toThrow(/violates its clearance ring/)
  })

  it('rejects a forged operating charge that disagrees with the operational facilities', () => {
    const operational = advance(building('save-v12-opex'), ANNEX_DURATION_WEEKS + 2)
    const valid = makeSave(operational)
    expect(validateSaveV13(valid)).toBe(valid)

    const doubled = clone(valid)
    const row = doubled.state.ledger.find((entry) => entry.kind === 'facilityOpex')!
    const before = row.amount
    row.amount = before * 2
    doubled.state.studio.cash += before
    expect(() => validateSaveV13(doubled)).toThrow(
      /facility operating cost at week .* disagrees/,
    )

    const early = clone(valid)
    const earliest = early.state.ledger.find((entry) => entry.kind === 'facilityOpex')!
    earliest.week = 1 // before the facility existed
    expect(() => validateSaveV13(early)).toThrow(
      /facility operating cost at week 1 disagrees/,
    )
  })
})

describe('Placement Core V12 — historical boundary guards (law 19)', () => {
  it('rejects the placement root under every historically tolerant version tag', () => {
    // V1–V7 keep their historical tolerance for unrelated additive fields, so the
    // dedicated guard is what refuses V12 authority there. V8–V12 reject it
    // earlier still, through their own exact-key checking.
    const v1 = makeSaveV1(generateWorld('save-v12-guard-root'))
    const forged = clone(v1) as unknown as { state: Record<string, unknown> }
    forged.state.placement = emptyStudioPlacement()
    expect(() => validateSave(forged)).toThrow(
      /state\.placement belongs only to SaveFileV12/,
    )
    for (const strict of [
      makeSaveV10(managedVacant('save-v12-guard-root-10')),
      makeSaveV11(managedVacant('save-v12-guard-root-11')),
    ] as const) {
      const forged = clone(strict) as unknown as { state: Record<string, unknown> }
      forged.state.placement = emptyStudioPlacement()
      expect(() => validateSave(forged)).toThrow(/unknown field "placement"/)
    }
  })

  it('rejects the V12 operating ledger kind under a historical tag', () => {
    const v11 = clone(makeSaveV11(managedVacant('save-v12-guard-opex'))) as unknown as {
      state: { ledger: Array<Record<string, unknown>> }
    }
    v11.state.ledger.push({
      week: 0,
      kind: 'facilityOpex',
      amount: -3_500,
      note: 'weekly facility operating cost',
    })
    expect(() => validateSave(v11)).toThrow(
      /SaveFileV12 facility operating authority/,
    )
  })

  it('rejects a non-canonical catalog project id under a historical tag', () => {
    const v11 = clone(makeSaveV11(managedVacant('save-v12-guard-project'))) as unknown as {
      state: { ledger: Array<Record<string, unknown>> }
    }
    v11.state.ledger.push({
      week: 0,
      kind: 'constructionCapex',
      amount: -ANNEX_CAPEX,
      constructionProjectId: 'construction-development-casting-annex-2',
      note: ANNEX_LEDGER_NOTE,
    })
    expect(() => validateSave(v11)).toThrow(/SaveFileV12 catalog project id/)
  })

  it('rejects a suffixed placed facility under a historical tag', () => {
    const v11 = clone(makeSaveV11(managedVacant('save-v12-guard-facility'))) as unknown as {
      state: { operations: { facilities: Array<Record<string, unknown>> } }
    }
    v11.state.operations.facilities.push({
      id: 'facility-development-casting-annex-2',
      name: 'Development & Casting Annex 2',
      capability: 'development-casting',
      capacity: 1,
    })
    expect(() => validateSave(v11)).toThrow(/SaveFileV12 placed facility/)
  })

  it('refuses to downgrade a V12 save through migrateToV11 or any earlier boundary', () => {
    const v12 = makeSaveV12(building('save-v12-downgrade'))
    expect(() => migrateToV11(v12)).toThrow(
      /cannot downgrade SaveFileV12 or discard placement and property state/,
    )
    expect(() => migrateToV10(v12)).toThrow(
      /migrateToV10: cannot downgrade SaveFileV12/,
    )
    expect(migrateToV12(v12)).toBe(v12) // idempotent by identity
  })

  // C1-M1a: the same law one version on. A live V13 save may not be downgraded
  // through ANY earlier boundary, including the now-historical migrateToV12.
  it('refuses to downgrade a V13 save through migrateToV12 or any earlier boundary', () => {
    const v13 = makeSave(building('save-v13-downgrade'))
    expect(() => migrateToV12(v13)).toThrow(
      /migrateToV12: cannot downgrade SaveFileV13 or discard property state/,
    )
    expect(() => migrateToV11(v13)).toThrow(
      /cannot downgrade SaveFileV13 or discard placement and property state/,
    )
    expect(() => migrateToV10(v13)).toThrow(
      /migrateToV10: cannot downgrade SaveFileV13/,
    )
  })

  it('lets frozen builders project only an EMPTY placement root', () => {
    const legacy = generateWorld('save-v12-frozen-legacy')
    const vacant = managedVacant('save-v12-frozen-vacant')
    expect('placement' in makeSaveV1(legacy).state).toBe(false)
    expect('placement' in makeSaveV10(vacant).state).toBe(false)
    expect('placement' in makeSaveV11(vacant).state).toBe(false)

    const started = building('save-v12-frozen-building')
    // V1–V10 refuse it as V11 construction authority (the capex row); V11, whose
    // construction root is genuinely vacant, refuses it as V12 placement history.
    for (const builder of [makeSaveV1, makeSaveV10]) {
      expect(() => builder(started)).toThrow(/cannot downgrade or discard/i)
    }
    expect(() => makeSaveV11(started)).toThrow(
      /cannot downgrade or discard authoritative V12 placement history/,
    )

    const operational = advance(started, ANNEX_DURATION_WEEKS + 1)
    expect(() => makeSaveV11(operational)).toThrow(/cannot downgrade or discard/i)

    // …and a forged operating row alone is enough to stop the projection.
    const forged: GameState = {
      ...vacant,
      ledger: [
        ...vacant.ledger,
        { week: 0, kind: 'facilityOpex', amount: -1, note: 'weekly facility operating cost' },
      ],
    }
    expect(() => makeSaveV11(forged)).toThrow(
      /cannot downgrade or discard authoritative V12 facility operating ledger state/,
    )
  })

  it('keeps the V11 validator rules exactly as they were', () => {
    for (const status of ['vacant', 'building', 'completed'] as const) {
      const v11 = legacyV11Save(`save-v12-frozen-v11-${status}`, status)
      expect(v11.saveVersion).toBe(11)
      expect(validateSaveV11(v11)).toBe(v11)
      expect(validateSave(v11)).toBe(v11)
      expect(exportSave(importSave(exportSave(v11)))).toBe(exportSave(v11))
    }
  })
})

describe('Placement Core V12 — the V11 → V12 migration', () => {
  it('gives a legacy (unmanaged) world the empty placement root', () => {
    const v11 = makeSaveV11(generateWorld('migrate-v12-legacy'))
    const before = stableStringify(v11)
    const v12 = convertV11ToV12(v11)
    expect(v12.saveVersion).toBe(12)
    expect(v12.state.placement).toEqual(emptyStudioPlacement())
    expect(v12.state.construction).toEqual(emptyStudioConstruction())
    expect(v12.state.rngState).toBe(v11.state.rngState)
    expect(stableStringify(v11)).toBe(before) // the input is never mutated
  })

  it('gives a managed VACANT world the empty managed root and a free parcel', () => {
    const v11 = legacyV11Save('migrate-v12-vacant', 'vacant')
    const v12 = convertV11ToV12(v11)
    expect(v12.state.placement).toEqual(initialManagedStudioPlacement())
    expect(v12.state.construction).toEqual(initialManagedStudioConstruction())
    // The legacy parcel is genuinely free: the Annex can still be started.
    const started = applyActions(convertV12ToV13(v12).state, [{ kind: 'startDevelopmentCastingAnnex' }])
    expect(started.placement.facilities[0]).toMatchObject({
      parcelId: ANNEX_PARCEL_ID,
      facilityId: ANNEX_FACILITY_ID,
      projectId: ANNEX_PROJECT_ID,
      status: 'underConstruction',
    })
  })

  it('moves a BUILDING legacy Annex onto the legacy parcel with the same clock', () => {
    const v11 = legacyV11Save('migrate-v12-building', 'building')
    const v12 = convertV11ToV12(v11)
    expect(v12.state.construction).toEqual(initialManagedStudioConstruction())
    expect(v12.state.placement).toEqual({
      mode: 'managed',
      nextPlacementId: 2,
      facilities: [
        {
          id: 1,
          blueprintId: ANNEX,
          parcelId: ANNEX_PARCEL_ID,
          origin: { gx: 7, gy: 15 },
          cells: [
            { gx: 7, gy: 15 },
            { gx: 8, gy: 15 },
            { gx: 9, gy: 15 },
            { gx: 7, gy: 16 },
            { gx: 8, gy: 16 },
            { gx: 9, gy: 16 },
          ],
          facilityId: ANNEX_FACILITY_ID,
          projectId: ANNEX_PROJECT_ID,
          status: 'underConstruction',
          placedWeek: 0,
          completesWeek: ANNEX_DURATION_WEEKS,
        },
      ],
    })
    // Not one ledger row, cash figure, or clock was invented.
    expect(v12.state.ledger).toEqual(v11.state.ledger)
    expect(v12.state.studio.cash).toBe(v11.state.studio.cash)
    expect(v12.state.rngState).toBe(v11.state.rngState)
    expect(v12.state.market.tick).toBe(v11.state.market.tick)
    // …and the remaining weeks still complete on the original committed week.
    const completed = advance(
      convertV12ToV13(v12).state,
      ANNEX_DURATION_WEEKS - v12.state.market.tick,
    )
    expect(completed.market.tick).toBe(ANNEX_DURATION_WEEKS)
    expect(completed.placement.facilities[0]!.status).toBe('operational')
    expect(
      completed.operations.facilities.some((facility) => facility.id === ANNEX_FACILITY_ID),
    ).toBe(true)
  })

  it('moves a COMPLETED legacy Annex without disturbing its facility or reservations', () => {
    const v11 = legacyV11Save('migrate-v12-completed', 'completed')
    const v12 = convertV11ToV12(v11)
    expect(v12.state.placement.facilities[0]).toMatchObject({
      status: 'operational',
      placedWeek: 0,
      completesWeek: ANNEX_DURATION_WEEKS,
      facilityId: ANNEX_FACILITY_ID,
      projectId: ANNEX_PROJECT_ID,
    })
    // The facility keeps its exact V11 identity, so every reservation that
    // already points at it keeps pointing at the same thing.
    expect(v12.state.operations.facilities).toEqual(v11.state.operations.facilities)
    expect(v12.state.ledger).toEqual(v11.state.ledger)
    expect(v12.state.studio.cash).toBe(v11.state.studio.cash)
    // No operating charge is back-dated onto the migrated history.
    expect(v12.state.ledger.filter((entry) => entry.kind === 'facilityOpex')).toEqual([])
    // The charge starts on the next advance, not retroactively.
    const next = tick(convertV12ToV13(v12).state)
    expect(next.ledger.filter((entry) => entry.kind === 'facilityOpex')).toHaveLength(1)
  })

  it('is deterministic and idempotent', () => {
    for (const status of ['vacant', 'building', 'completed'] as const) {
      const source = legacyV11Save(`migrate-v12-idempotent-${status}`, status)
      const first = convertV11ToV12(source)
      const second = convertV11ToV12(source)
      expect(stableStringify(first)).toBe(stableStringify(second))
      expect(migrateToV12(first)).toBe(first)
    }
  })

  it('lifts every historical version through the whole frozen chain', () => {
    const v10 = makeSaveV10(managedVacant('migrate-v12-chain'))
    const v11 = convertV10ToV11(v10)
    const direct = migrateToV12(v10)
    expect(direct.saveVersion).toBe(12)
    expect(stableStringify(direct)).toBe(stableStringify(convertV11ToV12(v11)))
    expect(direct.state.placement).toEqual(initialManagedStudioPlacement())
  })
})
