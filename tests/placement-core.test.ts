// Placement Core V12 — the pure legality query, the commit that re-runs it, and
// the blueprint catalog's preserved law.
//
// The contract under test (CODE-MINING-LEDGER Entries 2–3, clean-room):
//   • `queryPlacement` evaluates EVERY cell and never throws on illegality.
//   • `rejections` is ordered by the binding legality order; `primary` is its
//     head, so money — always last — can never mask a domain failure.
//   • `commitPlacement` calls the same query itself, returns the caller's state
//     BY REFERENCE on any rejection, and charges the cost it computed.
//   • The action layer throws on an illegal command, like every other action.

import { describe, expect, it } from 'vitest'
import {
  PLACEMENT_REJECTION_ORDER,
  TUNING,
  applyActions,
  blueprintById,
  commitPlacement,
  generateWorld,
  legacyAnnexPlacementRequest,
  occupiedCellKeys,
  placementRegimeReady,
  queryPlacement,
  stableStringify,
  studioConstructionView,
  studioPlacementView,
} from '../src/core/index.js'
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_BLUEPRINTS,
} from '../src/core/tuning.js'
import { RngStream } from '../src/core/rng.js'
import type {
  GameState,
  PlacementQuote,
  PlacementRejection,
  PlacementRequest,
} from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}

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

function at(gx: number, gy: number, blueprintId: string = ANNEX): PlacementRequest {
  return { blueprintId, origin: { gx, gy } }
}

// Origins used throughout. Each names the parcel it belongs to so a failure
// reads as a geometry statement rather than a pair of magic numbers.
const ORIGIN = {
  legacyExpansion: at(7, 15), // `expansion`, road-fronting, buildable
  westLawnNorth: at(0, 9), // `west-lawn`, buildable, exactly 3 wide
  westLawnSouth: at(0, 12), // `west-lawn`, one clear row below the first
  westLawnTouching: at(0, 11), // `west-lawn`, adjacent to a placement at gy 9
  southLawn: at(3, 19), // `south-lawn`, buildable
  stageSouth: at(15, 16), // `stage-south`, buildable
  courtyard: at(7, 10), // `courtyard`, owned but blocked
  serviceYard: at(21, 16), // `service-yard`, owned but blocked
  adminBuilding: at(9, 2), // Administration's footprint — owned by no parcel
  northBackLot: at(21, 0), // `north-back-lot`, buildable, no road frontage
  offEast: at(26, 0), // spills past gx 27
  offSouth: at(0, 25), // spills past gy 25
} as const

describe('Placement Core V12 — the blueprint catalog', () => {
  it('carries exactly one honest blueprint whose Annex law is the V11 law', () => {
    expect(FACILITY_BLUEPRINTS).toHaveLength(1)
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT).toEqual({
      id: 'development-casting-annex',
      name: 'Development & Casting Annex',
      capability: 'development-casting',
      capacity: 1,
      footprint: { width: 3, depth: 2 },
      clearanceRing: 1,
      requiresRoadAccess: true,
      buildWeeks: 13,
      capex: 780_000,
      weeklyOperatingCost: 3_500,
      facilityIdBase: 'facility-development-casting-annex',
      projectIdBase: 'construction-development-casting-annex',
      ledgerNote: 'Development & Casting Annex construction',
      effectSummary:
        'Adds one shared Development & Casting slot, so one more screenplay or audition can run at a time.',
      // C1-M2: unconditionally available and unlimited — the proven V11 law,
      // now stated in the declarative schema instead of by the schema's absence.
      requires: [],
    })
    // Unlimited: the absent allowance is the default, and it stays the default.
    expect(FACILITY_BLUEPRINTS[0]!.maxInstances).toBeUndefined()
  })

  it('sources every catalog number from TUNING', () => {
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex).toBe(TUNING.PLACEMENT_ANNEX_CAPEX)
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks).toBe(
      TUNING.PLACEMENT_ANNEX_BUILD_WEEKS,
    )
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capacity).toBe(
      TUNING.PLACEMENT_ANNEX_CAPACITY,
    )
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost).toBe(
      TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST,
    )
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.clearanceRing).toBe(
      TUNING.PLACEMENT_ANNEX_CLEARANCE_RING,
    )
  })

  it('keeps the weekly operating cost defensible against the overhead it sits beside', () => {
    const opex = TUNING.PLACEMENT_ANNEX_WEEKLY_OPERATING_COST
    expect(Number.isInteger(opex)).toBe(true)
    // Roughly two support staff of standing cost, well under the fixed base, and
    // a small fraction of the studio's opening capital over a full year.
    expect(opex).toBeGreaterThan(TUNING.OVERHEAD_PER_EMPLOYEE)
    expect(opex).toBeLessThan(TUNING.OVERHEAD_BASE)
    expect(opex * TUNING.TICKS_PER_YEAR).toBeLessThan(TUNING.INITIAL_CASH / 100)
    // A year of operating cost is a real but recoverable fraction of the capex.
    expect(opex * TUNING.TICKS_PER_YEAR).toBeLessThan(
      TUNING.PLACEMENT_ANNEX_CAPEX / 2,
    )
  })

  it('resolves blueprints by id and reports an unknown one as null', () => {
    expect(blueprintById(ANNEX)).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT)
    expect(blueprintById('no-such-blueprint')).toBeNull()
  })
})

describe('Placement Core V12 — the legality query', () => {
  it('quotes an ok placement with the exact catalog price, clock, and capacity', () => {
    const state = managedStudio('placement-quote-ok')
    const quote = queryPlacement(state, ORIGIN.legacyExpansion)
    expect(quote).toEqual({
      ok: true,
      blueprintId: ANNEX,
      origin: { gx: 7, gy: 15 },
      parcelId: 'expansion',
      cells: [
        { gx: 7, gy: 15 },
        { gx: 8, gy: 15 },
        { gx: 9, gy: 15 },
        { gx: 7, gy: 16 },
        { gx: 8, gy: 16 },
        { gx: 9, gy: 16 },
      ],
      cellLegality: [
        { cell: { gx: 7, gy: 15 }, ok: true, rejection: null },
        { cell: { gx: 8, gy: 15 }, ok: true, rejection: null },
        { cell: { gx: 9, gy: 15 }, ok: true, rejection: null },
        { cell: { gx: 7, gy: 16 }, ok: true, rejection: null },
        { cell: { gx: 8, gy: 16 }, ok: true, rejection: null },
        { cell: { gx: 9, gy: 16 }, ok: true, rejection: null },
      ],
      cost: 780_000,
      weeklyOperatingCost: 3_500,
      buildWeeks: 13,
      completesOnWeek: 13,
      capability: 'development-casting',
      capacityDelta: 1,
      rejections: [],
      primary: null,
      unmetRequirements: [],
      instanceCount: 0,
      maxInstances: null,
    })
  })

  it('never mutates the state it is asked about', () => {
    const state = managedStudio('placement-query-pure')
    const before = stableStringify(state)
    for (const request of Object.values(ORIGIN)) queryPlacement(state, request)
    queryPlacement(state, at(7, 15, 'no-such-blueprint'))
    expect(stableStringify(state)).toBe(before)
  })

  it('reports an unknown blueprint without inventing a footprint or a price', () => {
    const state = managedStudio('placement-unknown-blueprint')
    const quote = queryPlacement(state, at(7, 15, 'no-such-blueprint'))
    expect(quote.ok).toBe(false)
    expect(quote.primary).toBe('unknownBlueprint')
    expect(quote.rejections).toEqual(['unknownBlueprint'])
    expect(quote.cells).toEqual([])
    expect(quote.cellLegality).toEqual([])
    expect(quote.cost).toBe(0)
    expect(quote.buildWeeks).toBe(0)
    expect(quote.capacityDelta).toBe(0)
    expect(quote.capability).toBeNull()
    expect(quote.parcelId).toBeNull()
  })

  it.each([
    ['offLot (east)', ORIGIN.offEast, 'offLot'],
    ['offLot (south)', ORIGIN.offSouth, 'offLot'],
    ['notOwned', ORIGIN.adminBuilding, 'notOwned'],
    ['terrainUnbuildable (courtyard)', ORIGIN.courtyard, 'terrainUnbuildable'],
    ['terrainUnbuildable (scenery yard)', ORIGIN.serviceYard, 'terrainUnbuildable'],
    ['noRoadAccess', ORIGIN.northBackLot, 'noRoadAccess'],
  ] as const)('reports %s as its primary rejection', (_label, request, expected) => {
    const state = managedStudio(`placement-primary-${expected}`)
    const quote = queryPlacement(state, request)
    expect(quote.ok).toBe(false)
    expect(quote.primary).toBe(expected)
    expect(quote.rejections).toContain(expected)
  })

  it('evaluates every cell rather than failing on the first bad one', () => {
    const state = managedStudio('placement-per-cell')
    // Origin (5,14) straddles three different verdicts in one footprint: the
    // unclaimed path cells at gx 5–6, the blocked courtyard at (7,14), and the
    // perfectly legal expansion-parcel cell at (7,15).
    const quote = queryPlacement(state, at(5, 14))
    expect(quote.cellLegality).toHaveLength(6)
    expect(quote.cellLegality.map((verdict) => verdict.rejection)).toEqual([
      'notOwned',
      'notOwned',
      'terrainUnbuildable',
      'notOwned',
      'notOwned',
      null,
    ])
    expect(quote.cellLegality.filter((verdict) => verdict.ok)).toHaveLength(1)
    // Both codes are collected, in the binding order, and neither is dropped.
    expect(quote.rejections).toEqual(['notOwned', 'terrainUnbuildable'])
    expect(quote.primary).toBe('notOwned')
  })

  it('reports occupancy from the derived index, per cell', () => {
    const state = managedStudio('placement-occupied')
    const placed = commitPlacement(state, ORIGIN.legacyExpansion)
    expect(occupiedCellKeys(placed.placement).size).toBe(6)
    const quote = queryPlacement(placed, ORIGIN.legacyExpansion)
    expect(quote.primary).toBe('occupied')
    expect(quote.cellLegality.every((verdict) => verdict.rejection === 'occupied')).toBe(true)
  })

  it('rejects a neighbour inside the clearance ring even when its own cells are free', () => {
    const state = managedStudio('placement-clearance')
    const placed = commitPlacement(state, ORIGIN.westLawnNorth)
    const touching = queryPlacement(placed, ORIGIN.westLawnTouching)
    expect(touching.primary).toBe('clearanceRing')
    // Its own cells are all legal — only the ring is violated.
    expect(touching.cellLegality.every((verdict) => verdict.ok)).toBe(true)
    // One clear row further away, the same blueprint is legal again.
    expect(queryPlacement(placed, ORIGIN.westLawnSouth).ok).toBe(true)
  })

  it('puts money LAST: a domain failure always outranks affordability', () => {
    const broke = withCash(managedStudio('placement-money-last'), 1_000)
    for (const [request, expected] of [
      [ORIGIN.offEast, 'offLot'],
      [ORIGIN.adminBuilding, 'notOwned'],
      [ORIGIN.courtyard, 'terrainUnbuildable'],
      [ORIGIN.northBackLot, 'noRoadAccess'],
    ] as const) {
      const quote = queryPlacement(broke, request)
      expect(quote.primary).toBe(expected)
      expect(quote.rejections).toContain('insufficientFunds')
      expect(quote.rejections.at(-1)).toBe('insufficientFunds')
    }
  })

  it('reports insufficientFunds alone at the exact affordability boundary', () => {
    const base = managedStudio('placement-afford-boundary')
    const exact = withCash(base, TUNING.PLACEMENT_ANNEX_CAPEX)
    expect(queryPlacement(exact, ORIGIN.legacyExpansion).ok).toBe(true)

    const short = withCash(base, TUNING.PLACEMENT_ANNEX_CAPEX - 1)
    const quote = queryPlacement(short, ORIGIN.legacyExpansion)
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toEqual(['insufficientFunds'])
    expect(quote.primary).toBe('insufficientFunds')
    // The price is still quoted: a preview shows what the thing costs.
    expect(quote.cost).toBe(TUNING.PLACEMENT_ANNEX_CAPEX)
  })

  it('orders every rejection list by the binding legality order', () => {
    const state = withCash(managedStudio('placement-order'), 1_000)
    const requests = [
      ...Object.values(ORIGIN),
      at(5, 14),
      at(10, 17), // straddles `expansion` and unclaimed ground
      at(20, 3), // straddles unclaimed ground and `north-back-lot`
    ]
    for (const request of requests) {
      const quote = queryPlacement(state, request)
      const indices = quote.rejections.map((code) =>
        PLACEMENT_REJECTION_ORDER.indexOf(code),
      )
      expect(indices).toEqual([...indices].sort((a, b) => a - b))
      expect(new Set(quote.rejections).size).toBe(quote.rejections.length)
      expect(quote.primary).toBe(quote.rejections[0] ?? null)
      expect(quote.ok).toBe(quote.rejections.length === 0)
    }
  })

  it('pins the binding legality order itself', () => {
    expect(PLACEMENT_REJECTION_ORDER).toEqual([
      'unknownBlueprint',
      'offLot',
      'notOwned',
      'terrainUnbuildable',
      'occupied',
      'clearanceRing',
      'noRoadAccess',
      'seversLot',
      // C1-M2: studio-scope locks rank below every site-scope geometry rule and
      // above money, which stays last.
      'requirementsUnmet',
      'instanceLimit',
      'insufficientFunds',
    ])
  })
})

describe('Placement Core V12 — the commit', () => {
  it('returns the SAME state object by reference on every rejection', () => {
    const state = withCash(managedStudio('placement-commit-reference'), 1_000)
    const rejected: PlacementRequest[] = [
      at(7, 15, 'no-such-blueprint'),
      ORIGIN.offEast,
      ORIGIN.offSouth,
      ORIGIN.adminBuilding,
      ORIGIN.courtyard,
      ORIGIN.serviceYard,
      ORIGIN.northBackLot,
      ORIGIN.legacyExpansion, // legal, but unaffordable at this cash
    ]
    for (const request of rejected) {
      expect(queryPlacement(state, request).ok).toBe(false)
      expect(commitPlacement(state, request)).toBe(state)
    }
  })

  it('returns the same state by reference when the regime is not ready', () => {
    const legacy = generateWorld('placement-commit-regime')
    expect(placementRegimeReady(legacy)).toBe(false)
    expect(commitPlacement(legacy, ORIGIN.legacyExpansion)).toBe(legacy)

    const engagedButUnmanaged: GameState = { ...legacy, economyEngagedEver: true }
    expect(placementRegimeReady(engagedButUnmanaged)).toBe(false)
    expect(commitPlacement(engagedButUnmanaged, ORIGIN.legacyExpansion)).toBe(
      engagedButUnmanaged,
    )

    const managed = managedStudio('placement-commit-regime-managed')
    expect(placementRegimeReady(managed)).toBe(true)
    expect(commitPlacement(managed, ORIGIN.legacyExpansion)).not.toBe(managed)
  })

  it('charges the cost its own query computed, and records it as one capex row', () => {
    const state = managedStudio('placement-commit-charge')
    const quote = queryPlacement(state, ORIGIN.legacyExpansion)
    const before = stableStringify(state)
    const next = commitPlacement(state, ORIGIN.legacyExpansion)

    expect(stableStringify(state)).toBe(before) // the input is never mutated
    expect(next.studio.cash).toBe(state.studio.cash - quote.cost)
    expect(next.ledger).toHaveLength(state.ledger.length + 1)
    expect(next.ledger.at(-1)).toEqual({
      week: state.market.tick,
      kind: 'constructionCapex',
      amount: -quote.cost,
      constructionProjectId: 'construction-development-casting-annex',
      note: 'Development & Casting Annex construction',
    })
    expect(next.rngState).toBe(state.rngState)
    expect(next.market.tick).toBe(state.market.tick)
    expect(next.operations).toBe(state.operations) // no capacity until completion
  })

  it('records a placed facility with a monotonic reserved identity', () => {
    const state = managedStudio('placement-commit-record')
    const next = commitPlacement(state, ORIGIN.legacyExpansion)
    expect(next.placement.nextPlacementId).toBe(2)
    expect(next.placement.facilities).toEqual([
      {
        id: 1,
        blueprintId: ANNEX,
        parcelId: 'expansion',
        origin: { gx: 7, gy: 15 },
        cells: [
          { gx: 7, gy: 15 },
          { gx: 8, gy: 15 },
          { gx: 9, gy: 15 },
          { gx: 7, gy: 16 },
          { gx: 8, gy: 16 },
          { gx: 9, gy: 16 },
        ],
        facilityId: 'facility-development-casting-annex',
        projectId: 'construction-development-casting-annex',
        status: 'underConstruction',
        placedWeek: 0,
        completesWeek: 13,
      },
    ])
  })

  it('gives the FIRST Annex the canonical V11 identities and later ones a suffix', () => {
    let state = managedStudio('placement-commit-identity')
    state = commitPlacement(state, ORIGIN.westLawnNorth)
    state = commitPlacement(state, ORIGIN.westLawnSouth)
    state = commitPlacement(state, ORIGIN.stageSouth)
    expect(state.placement.facilities.map((placed) => placed.id)).toEqual([1, 2, 3])
    expect(state.placement.facilities.map((placed) => placed.facilityId)).toEqual([
      'facility-development-casting-annex',
      'facility-development-casting-annex-2',
      'facility-development-casting-annex-3',
    ])
    expect(state.placement.facilities.map((placed) => placed.projectId)).toEqual([
      'construction-development-casting-annex',
      'construction-development-casting-annex-2',
      'construction-development-casting-annex-3',
    ])
    // Multiple Annex-class placements are legal in V12; each is charged once.
    expect(
      state.ledger.filter((entry) => entry.kind === 'constructionCapex'),
    ).toHaveLength(3)
    expect(state.studio.cash).toBe(
      managedStudio('placement-commit-identity').studio.cash -
        3 * TUNING.PLACEMENT_ANNEX_CAPEX,
    )
  })

  it('never reuses a placement id, even across a rejected commit', () => {
    let state = managedStudio('placement-commit-monotonic')
    state = commitPlacement(state, ORIGIN.legacyExpansion)
    const reserved = state.placement.nextPlacementId
    state = commitPlacement(state, ORIGIN.legacyExpansion) // occupied → refused
    expect(state.placement.nextPlacementId).toBe(reserved)
    state = commitPlacement(state, ORIGIN.southLawn)
    expect(state.placement.facilities.map((placed) => placed.id)).toEqual([1, 2])
  })
})

describe('Placement Core V12 — the runner invariant (property)', () => {
  // The ledger's explicit property: the quote a commit acts on is deep-equal to
  // the quote the query reported. Driven by a SEEDED stream; the repository's
  // determinism hygiene forbids the unseeded global generator in src/ and tests/.
  it('commit quote deep-equals query quote over random requests', () => {
    const rng = RngStream.fromSeed('placement-property-v12')
    let state = managedStudio('placement-property')
    let committed = 0
    let refused = 0

    for (let trial = 0; trial < 400; trial++) {
      const request: PlacementRequest = {
        blueprintId: rng.next() < 0.05 ? 'no-such-blueprint' : ANNEX,
        origin: {
          gx: Math.floor(rng.uniform(-2, 30)),
          gy: Math.floor(rng.uniform(-2, 28)),
        },
      }
      const quoted: PlacementQuote = queryPlacement(state, request)
      const next = commitPlacement(state, request)

      if (!quoted.ok) {
        expect(next).toBe(state)
        refused++
        continue
      }
      committed++
      // The commit acted on exactly the quoted facts: same cells, same price,
      // same clock. Re-quoting the PRE-commit state reproduces them byte for byte.
      expect(queryPlacement(state, request)).toEqual(quoted)
      const placed = next.placement.facilities.at(-1)!
      expect(placed.cells).toEqual(quoted.cells)
      expect(placed.parcelId).toBe(quoted.parcelId)
      expect(placed.completesWeek).toBe(quoted.completesOnWeek)
      expect(next.studio.cash).toBe(state.studio.cash - quoted.cost)
      expect(next.ledger.at(-1)!.amount).toBe(-quoted.cost)
      // And the same request is no longer legal on the post-commit state.
      expect(queryPlacement(next, request).ok).toBe(false)
      state = next
    }

    // The trial space genuinely exercises both arms.
    expect(committed).toBeGreaterThan(0)
    expect(refused).toBeGreaterThan(committed)
    // Nothing in this property consumed the simulation stream.
    expect(state.rngState).toBe(managedStudio('placement-property').rngState)
  })

  it('is deterministic: the same seeded trial sequence produces the same state', () => {
    const run = (): string => {
      const rng = RngStream.fromSeed('placement-property-determinism')
      let state = managedStudio('placement-property-determinism')
      for (let trial = 0; trial < 120; trial++) {
        state = commitPlacement(state, {
          blueprintId: ANNEX,
          origin: {
            gx: Math.floor(rng.uniform(0, 28)),
            gy: Math.floor(rng.uniform(0, 26)),
          },
        })
      }
      return stableStringify(state)
    }
    expect(run()).toBe(run())
  })
})

describe('Placement Core V12 — the action boundary', () => {
  // The pure helper reports and returns state; the ACTION asserts legality and
  // therefore throws. Both halves are tested here so the boundary cannot drift.

  it('throws on an illegal placeFacility and leaves the state byte-identical', () => {
    const state = managedStudio('placement-action-illegal')
    const before = stableStringify(state)
    const cases: ReadonlyArray<[PlacementRequest, RegExp]> = [
      [at(7, 15, 'no-such-blueprint'), /unknownBlueprint/],
      [ORIGIN.offEast, /offLot/],
      [ORIGIN.adminBuilding, /notOwned/],
      [ORIGIN.courtyard, /terrainUnbuildable/],
      [ORIGIN.northBackLot, /noRoadAccess/],
    ]
    for (const [placement, message] of cases) {
      expect(() => applyActions(state, [{ kind: 'placeFacility', placement }])).toThrow(
        message,
      )
      expect(stableStringify(state)).toBe(before)
    }
  })

  it('keeps the D-12 solvency reason on the insufficient-funds path', () => {
    const broke = withCash(managedStudio('placement-action-broke'), 1_000)
    expect(() =>
      applyActions(broke, [{ kind: 'placeFacility', placement: ORIGIN.legacyExpansion }]),
    ).toThrow(/Insufficient cash.*D-12 solvency gate/s)
  })

  it('throws when the regime is not ready instead of silently doing nothing', () => {
    const legacy = generateWorld('placement-action-regime')
    expect(() =>
      applyActions(legacy, [{ kind: 'placeFacility', placement: ORIGIN.legacyExpansion }]),
    ).toThrow(/placement requires managed operations/)
  })

  it('commits through the one implementation when the placement is legal', () => {
    const state = managedStudio('placement-action-legal')
    const viaAction = applyActions(state, [
      { kind: 'placeFacility', placement: ORIGIN.legacyExpansion },
    ])
    const viaHelper = commitPlacement(state, ORIGIN.legacyExpansion)
    expect(stableStringify(viaAction)).toBe(stableStringify(viaHelper))
  })

  it('makes the legacy Annex action an alias for the same commit', () => {
    const state = managedStudio('placement-action-alias')
    expect(legacyAnnexPlacementRequest(state.property)).toEqual({
      blueprintId: ANNEX,
      origin: { gx: 7, gy: 15 },
    })
    const viaAlias = applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }])
    const viaPlacement = applyActions(state, [
      { kind: 'placeFacility', placement: legacyAnnexPlacementRequest(state.property) },
    ])
    expect(stableStringify(viaAlias)).toBe(stableStringify(viaPlacement))
    // …and the retained read model still describes it exactly as V11 did.
    expect(studioConstructionView(viaAlias)).toMatchObject({
      mode: 'managed',
      status: 'building',
      parcelId: 'expansion',
      projectId: 'construction-development-casting-annex',
      facilityId: 'facility-development-casting-annex',
      capex: 780_000,
      durationWeeks: 13,
      startedWeek: 0,
      dueWeek: 13,
      completedWeek: null,
      canStart: false,
    })
  })

  it('lets the alias be refused once its parcel is occupied, without touching state', () => {
    const state = applyActions(managedStudio('placement-alias-twice'), [
      { kind: 'startDevelopmentCastingAnnex' },
    ])
    const before = stableStringify(state)
    expect(() =>
      applyActions(state, [{ kind: 'startDevelopmentCastingAnnex' }]),
    ).toThrow(/occupied|clearanceRing/)
    expect(stableStringify(state)).toBe(before)
  })
})

describe('Placement Core V12 — the build-mode read model', () => {
  it('projects the parcel map, the catalog, and live occupancy from state alone', () => {
    const state = managedStudio('placement-view')
    const empty = studioPlacementView(state)
    expect(empty.mode).toBe('managed')
    expect(empty.buildEnabled).toBe(true)
    expect(empty.lotWidth).toBe(28)
    expect(empty.lotDepth).toBe(26)
    expect(empty.parcels).toHaveLength(10)
    expect(empty.placements).toEqual([])
    expect(empty.weeklyOperatingCost).toBe(0)
    expect(empty.catalog).toEqual([
      {
        blueprintId: ANNEX,
        name: 'Development & Casting Annex',
        capability: 'development-casting',
        capacity: 1,
        footprint: { width: 3, depth: 2 },
        clearanceRing: 1,
        requiresRoadAccess: true,
        buildWeeks: 13,
        cost: 780_000,
        weeklyOperatingCost: 3_500,
        affordable: true,
        available: true,
        unmet: [],
        instanceCount: 0,
        maxInstances: null,
        atInstanceLimit: false,
        buildable: true,
      },
    ])
    const expansion = empty.parcels.find((parcel) => parcel.id === 'expansion')!
    expect(expansion).toEqual({
      id: 'expansion',
      label: 'Annex Expansion Parcel',
      terrain: 'buildable',
      rect: { x0: 7, y0: 15, x1: 10, y1: 18 },
      roadFrontage: true,
      occupiedCells: 0,
      placedFacilityIds: [],
    })

    const placed = commitPlacement(state, ORIGIN.legacyExpansion)
    const after = studioPlacementView(placed)
    expect(after.parcels.find((parcel) => parcel.id === 'expansion')).toMatchObject({
      occupiedCells: 6,
      placedFacilityIds: [1],
    })
    expect(after.placements).toEqual([
      {
        id: 1,
        blueprintId: ANNEX,
        name: 'Development & Casting Annex',
        facilityId: 'facility-development-casting-annex',
        parcelId: 'expansion',
        origin: { gx: 7, gy: 15 },
        cells: placed.placement.facilities[0]!.cells,
        status: 'underConstruction',
        placedWeek: 0,
        completesWeek: 13,
        weeksRemaining: 13,
        weeklyOperatingCost: 3_500,
      },
    ])
    // Under construction contributes nothing to the weekly operating charge.
    expect(after.weeklyOperatingCost).toBe(0)
  })

  it('reports build disabled on a state that cannot place', () => {
    expect(studioPlacementView(generateWorld('placement-view-legacy'))).toMatchObject({
      mode: 'legacy',
      buildEnabled: false,
      placements: [],
    })
  })
})

// A tiny compile-time guard: the rejection union and the ordered list agree.
const _EXHAUSTIVE: readonly PlacementRejection[] = PLACEMENT_REJECTION_ORDER
void _EXHAUSTIVE
