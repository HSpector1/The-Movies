// ── C1-M3a — Move & Demolish V1 ──────────────────────────────────────────────
//
// What is under test:
//   • FAIL-CLOSED engagement. Every persisted holder of a facility id blocks both
//     verbs. The enumeration in placement.ts's header is the contract; this file
//     is where a missing source becomes a failure.
//   • Eligibility: the legacy Annex placement is excluded from both verbs, and
//     founding property structures are unreachable by the shape of the action.
//   • MOVE preserves identity and re-runs the one legality authority with the
//     mover's own cells excluded.
//   • DEMOLISH is strictly lossy, refunds exactly once, and leaves nothing
//     dangling — including in the historical opex reconciliation.
//   • No refund farming, no duplication, no id reuse, byte-deterministic replay,
//     and save round-trips carrying moved and demolished history.
//
// TWO KINDS OF FIXTURE, deliberately distinguished:
//   • Where a real action sequence can produce the state, it does.
//   • Where it would take a full casting-and-package fixture to reach one field,
//     the state is CONSTRUCTED — and every constructed state used for a refusal
//     is first proved LEGAL by running the whole invariant suite over it, so it
//     is a state the engine could genuinely be in, not a forgery.
//
// Everything here is seeded and pure: no wall clock, no unseeded randomness.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  applyActions,
  assertStudioPlacementInvariants,
  beginFounding,
  commitPlacement,
  demolishFacility,
  demolishedFacilityHistory,
  exportSave,
  expectedWeeklyOperatingCostAt,
  facilityDemolitionRefund,
  facilityDemolitionRefusal,
  facilityEngagements,
  facilityMoveRefusal,
  generateWorld,
  importSave,
  makeSave,
  makeSaveV12,
  migrateToV15,
  moveFacility,
  queryPlacement,
  stableStringify,
  studioCalendar,
  tick,
  validateSave,
  validateSaveV15,
} from '../src/core/index.js'
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_DEMOLITION_LEDGER_NOTE,
  FACILITY_DEMOLITION_REFUND_FRACTION,
  FACILITY_MOVE_COST,
} from '../src/core/tuning.js'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  LedgerEntry,
  SegmentId,
  Talent,
} from '../src/core/index.js'

const ANNEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id
const ANNEX_FACILITY = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.facilityIdBase
const BUILD_WEEKS = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks
const CAPEX = DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex
const REFUND = Math.round(CAPEX * FACILITY_DEMOLITION_REFUND_FRACTION)

// Origins on the initial property. Each names its parcel so a failure reads as a
// geometry statement rather than a pair of magic numbers.
const LEGACY_ORIGIN = { gx: 7, gy: 15 } // `expansion` — the excluded Annex contract
const WEST_NORTH = { gx: 0, gy: 9 } // `west-lawn`
const WEST_SOUTH = { gx: 0, gy: 12 } // `west-lawn`, clear of the first
const SOUTH_LAWN = { gx: 3, gy: 19 } // `south-lawn`
const STAGE_SOUTH = { gx: 15, gy: 16 } // `stage-south`

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

/** A rich managed studio with one OPERATIONAL annex standing on the west lawn. */
function studioWithOperationalAnnex(seed: string, origin = WEST_NORTH): GameState {
  const rich = withCash(managedStudio(seed), 50_000_000)
  return advance(commitPlacement(rich, { blueprintId: ANNEX, origin }), BUILD_WEEKS)
}

function refundRows(state: GameState): LedgerEntry[] {
  return state.ledger.filter((entry) => entry.kind === 'facilityDemolitionRefund')
}

function placementOf(state: GameState, id: number) {
  return state.placement.facilities.find((placed) => placed.id === id)
}

// ── the founded-studio fixture, for the two script/casting engagement sources ──

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((t) => t.id === id)!)
}
function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}
function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole(pool, 'director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole(pool, 'writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole(pool, 'craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}
function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}
function commissionPayload(state: GameState, conceptIndex: number): CommissionScriptPayload {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId: contractedByRole(state, 'writer')[0]!.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult', 'prestige'] as SegmentId[],
      ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] },
    },
  }
}

/**
 * A studio with an operational annex AND a live screenplay reservation standing
 * on that annex. The reservation is retargeted onto the annex rather than waiting
 * for the initial facility's two slots to fill — a state the allocator itself
 * produces under heavier load. It is asserted LEGAL below before any refusal is
 * read from it, so nothing here rests on a forged shape.
 */
function studioWithEngagedAnnex(seed: string): GameState {
  let state = foundedStudio(seed)
  state = applyActions(state, [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
  state = advance(
    commitPlacement(withCash(state, 50_000_000), { blueprintId: ANNEX, origin: WEST_NORTH }),
    BUILD_WEEKS,
  )
  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, 0) },
  ])
  return {
    ...state,
    scriptDevelopment: {
      ...state.scriptDevelopment,
      projects: state.scriptDevelopment.projects.map((project) =>
        project.reservation === null
          ? project
          : { ...project, reservation: { ...project.reservation, facilityId: ANNEX_FACILITY, slot: 0 } },
      ),
    },
  }
}

// ── A. the engagement predicate ──────────────────────────────────────────────

describe('C1-M3a (A) — every persisted holder of a facility blocks both verbs', () => {
  it('finds a screenplay reservation, on the RESERVATION and not the status', () => {
    const engaged = studioWithEngagedAnnex('m3a-engaged-script')
    // The constructed state is a state the engine could genuinely be in.
    expect(() => assertStudioPlacementInvariants(engaged)).not.toThrow()
    expect(() => studioCalendar(engaged)).not.toThrow()

    const holders = facilityEngagements(engaged, ANNEX_FACILITY)
    expect(holders).toHaveLength(1)
    expect(holders[0]).toMatchObject({
      kind: 'screenplay',
      facilityId: ANNEX_FACILITY,
      activity: 'drafting a screenplay',
    })
    expect(holders[0]!.holderId.length).toBeGreaterThan(0)
  })

  it('finds a casting-session reservation', () => {
    const base = studioWithEngagedAnnex('m3a-engaged-casting')
    // Move the same live reservation into the casting root instead.
    const session = {
      id: 'session-probe',
      projectId: base.scriptDevelopment.projects[0]!.id,
      status: 'auditioning' as const,
      startedWeek: base.market.tick,
      dueWeek: base.market.tick + 1,
      reservation: {
        sessionId: 'session-probe',
        facilityId: ANNEX_FACILITY,
        capability: 'development-casting' as const,
        slot: 0,
      },
    }
    const state = {
      ...base,
      castingSessions: {
        ...base.castingSessions,
        sessions: [...base.castingSessions.sessions, session],
      },
    } as unknown as GameState
    const holders = facilityEngagements(state, ANNEX_FACILITY)
    expect(holders.map((holder) => holder.kind).sort()).toEqual(['castingSession', 'screenplay'])
    expect(holders.find((holder) => holder.kind === 'castingSession')).toMatchObject({
      holderId: 'session-probe',
      activity: 'auditioning',
    })
  })

  it('finds a production workflow reservation AND the shooting task separately', () => {
    // A unit test of the predicate over the exact shapes the operations root
    // persists. The two are checked independently ON PURPOSE: the shooting task
    // is a denormalized second copy of the soundstage id, and a guard that only
    // walked reservations[] would leave it dangling the day the two diverge.
    const base = managedStudio('m3a-engaged-production')
    const state = {
      ...base,
      operations: {
        ...base.operations,
        workflows: [
          {
            productionId: 'prod-1',
            phase: 'shooting',
            reservations: [
              {
                productionId: 'prod-1',
                facilityId: ANNEX_FACILITY,
                capability: 'soundstage',
                slot: 0,
                phase: 'shooting',
              },
            ],
            shootingTask: { soundstageFacilityId: ANNEX_FACILITY },
            blockers: [],
          },
        ],
      },
    } as unknown as GameState
    const holders = facilityEngagements(state, ANNEX_FACILITY)
    expect(holders.map((holder) => holder.kind)).toEqual(['production', 'shootingTask'])
    expect(holders.every((holder) => holder.holderId === 'prod-1')).toBe(true)
  })

  it('finds a retired V11 construction project, which V12 can no longer create', () => {
    const base = managedStudio('m3a-engaged-legacy')
    const state = {
      ...base,
      construction: {
        ...base.construction,
        projects: [{ id: 'legacy-project', facilityId: ANNEX_FACILITY, status: 'building' }],
      },
    } as unknown as GameState
    expect(facilityEngagements(state, ANNEX_FACILITY)).toEqual([
      {
        kind: 'legacyConstructionProject',
        facilityId: ANNEX_FACILITY,
        holderId: 'legacy-project',
        activity: 'construction',
      },
    ])
  })

  it('reports an idle facility as engaged by nothing, and is deterministic', () => {
    const idle = studioWithOperationalAnnex('m3a-idle')
    expect(facilityEngagements(idle, ANNEX_FACILITY)).toEqual([])
    const engaged = studioWithEngagedAnnex('m3a-deterministic')
    expect(stableStringify(facilityEngagements(engaged, ANNEX_FACILITY))).toBe(
      stableStringify(facilityEngagements(engaged, ANNEX_FACILITY)),
    )
  })

  it('REFUSES both verbs while the facility is engaged, and changes nothing', () => {
    const engaged = studioWithEngagedAnnex('m3a-refuse-engaged')
    const id = engaged.placement.facilities[0]!.id

    for (const refusal of [
      facilityMoveRefusal(engaged, { placementId: id, origin: SOUTH_LAWN }),
      facilityDemolitionRefusal(engaged, { placementId: id }),
    ]) {
      expect(refusal).not.toBeNull()
      expect(refusal!.code).toBe('facilityEngaged')
      if (refusal!.code !== 'facilityEngaged') throw new Error('unreachable')
      expect(refusal!.facilityId).toBe(ANNEX_FACILITY)
      expect(refusal!.holders).toHaveLength(1)
    }

    // Byte-neutral: the SAME state object, by reference.
    expect(moveFacility(engaged, { placementId: id, origin: SOUTH_LAWN })).toBe(engaged)
    expect(demolishFacility(engaged, { placementId: id })).toBe(engaged)
    // And the action layer throws rather than silently doing nothing.
    expect(() =>
      applyActions(engaged, [{ kind: 'demolishFacility', demolition: { placementId: id } }]),
    ).toThrow(/facilityEngaged/)
  })

  it('still asks an underConstruction site the same question rather than skipping it', () => {
    const site = commitPlacement(withCash(managedStudio('m3a-under-construction'), 50_000_000), {
      blueprintId: ANNEX,
      origin: WEST_NORTH,
    })
    expect(site.placement.facilities[0]!.status).toBe('underConstruction')
    // It holds nothing by definition — it has no capacity and nothing can reserve
    // it — and that is a RESULT of the check, not a bypass of it.
    expect(facilityEngagements(site, site.placement.facilities[0]!.facilityId)).toEqual([])
    expect(facilityDemolitionRefusal(site, { placementId: 1 })).toBeNull()
  })
})

// ── B. eligibility ───────────────────────────────────────────────────────────

describe('C1-M3a (B) — what may not be touched at all', () => {
  it('excludes the legacy Annex placement from BOTH verbs', () => {
    const legacy = commitPlacement(withCash(managedStudio('m3a-legacy'), 50_000_000), {
      blueprintId: ANNEX,
      origin: LEGACY_ORIGIN,
    })
    expect(legacy.placement.facilities[0]!.parcelId).toBe('expansion')
    for (const refusal of [
      facilityMoveRefusal(legacy, { placementId: 1, origin: SOUTH_LAWN }),
      facilityDemolitionRefusal(legacy, { placementId: 1 }),
    ]) {
      expect(refusal).toMatchObject({ code: 'foundingPlacement', placementId: 1, parcelId: 'expansion' })
    }
    expect(moveFacility(legacy, { placementId: 1, origin: SOUTH_LAWN })).toBe(legacy)
    expect(demolishFacility(legacy, { placementId: 1 })).toBe(legacy)
  })

  it('cannot reach a founding property structure, by the shape of the action', () => {
    // Both verbs take a placementId. The eight authored bodies own no placement
    // record, so no id can name one — asserted rather than assumed.
    const state = studioWithOperationalAnnex('m3a-structures')
    expect(state.property.structures).toHaveLength(8)
    const placementIds = new Set(state.placement.facilities.map((placed) => placed.id))
    for (const structure of state.property.structures) {
      expect(placementIds.has(structure.id as unknown as number)).toBe(false)
    }
    // Every id that is not a live placement is simply unknown.
    for (const id of [0, 2, 99, -1]) {
      expect(facilityDemolitionRefusal(state, { placementId: id })).toMatchObject({
        code: 'unknownPlacement',
      })
    }
  })

  it('refuses outside the managed regime', () => {
    const legacyMode = generateWorld('m3a-regime')
    expect(facilityDemolitionRefusal(legacyMode, { placementId: 1 })).toEqual({
      code: 'regimeNotReady',
    })
  })
})

// ── C. move ──────────────────────────────────────────────────────────────────

describe('C1-M3a (C) — move', () => {
  it('relocates without changing one thing about the building itself', () => {
    const before = studioWithOperationalAnnex('m3a-move-identity')
    const original = before.placement.facilities[0]!
    const after = moveFacility(before, { placementId: original.id, origin: SOUTH_LAWN })
    expect(after).not.toBe(before)
    const moved = placementOf(after, original.id)!

    // Only the ground changed.
    expect(moved.origin).toEqual(SOUTH_LAWN)
    expect(moved.parcelId).toBe('south-lawn')
    expect(moved.cells[0]).toEqual(SOUTH_LAWN)
    // Identity, status, and the whole clock are preserved — this is a change of
    // address, not a rebuild.
    expect(moved.id).toBe(original.id)
    expect(moved.facilityId).toBe(original.facilityId)
    expect(moved.projectId).toBe(original.projectId)
    expect(moved.status).toBe(original.status)
    expect(moved.placedWeek).toBe(original.placedWeek)
    expect(moved.completesWeek).toBe(original.completesWeek)
    // No ledger row and no capacity change: moving is free in V1.
    expect(after.ledger).toEqual(before.ledger)
    expect(after.studio.cash).toBe(before.studio.cash - FACILITY_MOVE_COST)
    expect(after.operations.facilities).toEqual(before.operations.facilities)
    expect(after.placement.nextPlacementId).toBe(before.placement.nextPlacementId)
    expect(() => assertStudioPlacementInvariants(after)).not.toThrow()
    expect(after.rngState).toBe(before.rngState)
  })

  it('may overlap its OWN old footprint — a one-cell nudge is still a move', () => {
    const before = studioWithOperationalAnnex('m3a-move-overlap')
    const id = before.placement.facilities[0]!.id
    // One cell along, overlapping four of its own six cells.
    const nudged = moveFacility(before, { placementId: id, origin: { gx: 0, gy: 10 } })
    expect(nudged).not.toBe(before)
    expect(placementOf(nudged, id)!.origin).toEqual({ gx: 0, gy: 10 })
    // Moving onto its own exact footprint is legal too, and is still one action.
    const inPlace = moveFacility(before, { placementId: id, origin: WEST_NORTH })
    expect(inPlace).not.toBe(before)
    expect(stableStringify(inPlace)).toBe(stableStringify(before))
  })

  it('refuses an illegal destination through the one legality authority', () => {
    const state = studioWithOperationalAnnex('m3a-move-illegal')
    const id = state.placement.facilities[0]!.id
    const cases: [string, { gx: number; gy: number }, string][] = [
      ['off the property', { gx: -3, gy: -3 }, 'offLot'],
      ['unclaimed ground', { gx: 9, gy: 2 }, 'notOwned'],
      ['protected ground', { gx: 7, gy: 10 }, 'terrainUnbuildable'],
      ['no road frontage', { gx: 22, gy: 1 }, 'noRoadAccess'],
    ]
    for (const [, origin, primary] of cases) {
      const refusal = facilityMoveRefusal(state, { placementId: id, origin })
      expect(refusal!.code).toBe('illegalDestination')
      if (refusal!.code !== 'illegalDestination') throw new Error('unreachable')
      expect(refusal!.quote.primary).toBe(primary)
      expect(moveFacility(state, { placementId: id, origin })).toBe(state)
    }
  })

  it('refuses a move onto ANOTHER facility, which is what stops duplication', () => {
    const one = studioWithOperationalAnnex('m3a-move-occupied')
    const two = commitPlacement(withCash(one, 50_000_000), {
      blueprintId: ANNEX,
      origin: STAGE_SOUTH,
    })
    const refusal = facilityMoveRefusal(two, { placementId: 1, origin: STAGE_SOUTH })
    expect(refusal!.code).toBe('illegalDestination')
    if (refusal!.code !== 'illegalDestination') throw new Error('unreachable')
    expect(refusal!.quote.rejections).toContain('occupied')
    expect(moveFacility(two, { placementId: 1, origin: STAGE_SOUTH })).toBe(two)
    // Both buildings still stand, exactly once each.
    expect(two.placement.facilities).toHaveLength(2)
  })

  it('stays legal even when the blueprint is now at its instance limit or locked', () => {
    // Moving ADDS nothing, so the two studio-scope unlock rules do not apply. A
    // building you already own must never be trapped where it stands.
    const state = studioWithOperationalAnnex('m3a-move-not-building')
    const id = state.placement.facilities[0]!.id
    const quote = queryPlacement(
      state,
      { blueprintId: ANNEX, origin: SOUTH_LAWN },
      { movingPlacementId: id },
    )
    expect(quote.rejections).not.toContain('requirementsUnmet')
    expect(quote.rejections).not.toContain('instanceLimit')
    // And a move is priced at the move cost, not at capex — you are not buying
    // the building a second time.
    expect(quote.cost).toBe(FACILITY_MOVE_COST)
    const broke = withCash(state, 0)
    expect(facilityMoveRefusal(broke, { placementId: id, origin: SOUTH_LAWN })).toBeNull()
  })

  it('is not refused for money by a studio that is already in the red (C1-M8)', () => {
    // `canAfford` is the solvency gate for a voluntary COMMITMENT, and a studio
    // whose cash is negative fails it for every amount — zero included. A move
    // commits nothing, so a broke studio was being refused a free mutation with
    // "the studio cannot cover the capital cost this week" beside a quote reading
    // MOVE COST $0. The gate binds the moment a fee exists, and not before.
    const state = studioWithOperationalAnnex('m3a-move-in-the-red')
    const id = state.placement.facilities[0]!.id
    const inTheRed = withCash(state, -25_000)
    expect(inTheRed.studio.cash).toBeLessThan(0)

    const quote = queryPlacement(
      inTheRed,
      { blueprintId: ANNEX, origin: SOUTH_LAWN },
      { movingPlacementId: id },
    )
    expect(quote.cost).toBe(FACILITY_MOVE_COST)
    expect(quote.rejections).not.toContain('insufficientFunds')
    expect(facilityMoveRefusal(inTheRed, { placementId: id, origin: SOUTH_LAWN })).toBeNull()
    const moved = moveFacility(inTheRed, { placementId: id, origin: SOUTH_LAWN })
    expect(moved).not.toBe(inTheRed)
    expect(placementOf(moved, id)!.origin).toEqual(SOUTH_LAWN)
    expect(moved.studio.cash).toBe(inTheRed.studio.cash)
    expect(() => assertStudioPlacementInvariants(moved)).not.toThrow()

    // A demolition PAYS the studio, and never consulted the gate at all.
    const razed = demolishFacility(inTheRed, { placementId: id })
    expect(razed).not.toBe(inTheRed)
    expect(razed.studio.cash).toBe(inTheRed.studio.cash + REFUND)

    // …and a real purchase is still refused, exactly as before: the rule that
    // changed is "zero is not a commitment", not "the studio may overspend".
    const purchase = queryPlacement(inTheRed, { blueprintId: ANNEX, origin: SOUTH_LAWN })
    expect(purchase.cost).toBe(CAPEX)
    expect(purchase.rejections).toContain('insufficientFunds')
    expect(commitPlacement(inTheRed, { blueprintId: ANNEX, origin: SOUTH_LAWN })).toBe(inTheRed)
  })

  it('moves a site that is still under construction without touching its clock', () => {
    const site = commitPlacement(withCash(managedStudio('m3a-move-site'), 50_000_000), {
      blueprintId: ANNEX,
      origin: WEST_NORTH,
    })
    const mid = advance(site, 3)
    const moved = moveFacility(mid, { placementId: 1, origin: SOUTH_LAWN })
    const placed = placementOf(moved, 1)!
    expect(placed.status).toBe('underConstruction')
    expect(placed.completesWeek).toBe(BUILD_WEEKS)
    // It still completes on its original committed week, in the right place.
    const done = advance(moved, BUILD_WEEKS - moved.market.tick)
    expect(placementOf(done, 1)!.status).toBe('operational')
    expect(placementOf(done, 1)!.parcelId).toBe('south-lawn')
    expect(() => assertStudioPlacementInvariants(done)).not.toThrow()
  })

  it('is byte-identical on replay of the same action sequence', () => {
    const run = (seed: string): GameState => {
      let state = studioWithOperationalAnnex(seed)
      state = applyActions(state, [
        { kind: 'moveFacility', move: { placementId: 1, origin: SOUTH_LAWN } },
      ])
      state = advance(state, 3)
      return applyActions(state, [
        { kind: 'moveFacility', move: { placementId: 1, origin: WEST_SOUTH } },
      ])
    }
    expect(stableStringify(run('m3a-move-replay'))).toBe(stableStringify(run('m3a-move-replay')))
  })
})

// ── D. demolish ──────────────────────────────────────────────────────────────

describe('C1-M3a (D) — demolish', () => {
  it('removes the building, its facility, and credits the depreciated refund', () => {
    const before = studioWithOperationalAnnex('m3a-demolish')
    expect(before.operations.facilities.some((f) => f.id === ANNEX_FACILITY)).toBe(true)
    const cashBefore = before.studio.cash

    const after = demolishFacility(before, { placementId: 1 })
    expect(after).not.toBe(before)
    expect(after.placement.facilities).toEqual([])
    expect(after.operations.facilities.some((f) => f.id === ANNEX_FACILITY)).toBe(false)
    expect(after.studio.cash).toBe(cashBefore + REFUND)

    const rows = refundRows(after)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual({
      week: after.market.tick,
      kind: 'facilityDemolitionRefund',
      amount: REFUND,
      constructionProjectId: before.placement.facilities[0]!.projectId,
      note: FACILITY_DEMOLITION_LEDGER_NOTE,
    })
    expect(facilityDemolitionRefund(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT)).toBe(REFUND)
    expect(() => assertStudioPlacementInvariants(after)).not.toThrow()
    // Nothing dangles: the calendar renders rather than throwing.
    expect(() => studioCalendar(after)).not.toThrow()
    expect(after.rngState).toBe(before.rngState)
  })

  it('refunds a mid-construction site at the SAME fraction, with no facility to remove', () => {
    const site = commitPlacement(withCash(managedStudio('m3a-demolish-site'), 50_000_000), {
      blueprintId: ANNEX,
      origin: WEST_NORTH,
    })
    const mid = advance(site, 4)
    const cashBefore = mid.studio.cash
    const after = demolishFacility(mid, { placementId: 1 })
    expect(after.placement.facilities).toEqual([])
    expect(after.studio.cash).toBe(cashBefore + REFUND)
    // It never became a facility, so none was withdrawn.
    expect(after.operations.facilities).toEqual(mid.operations.facilities)
    expect(() => assertStudioPlacementInvariants(after)).not.toThrow()
  })

  it('refuses a second demolition of the same building', () => {
    const once = demolishFacility(studioWithOperationalAnnex('m3a-demolish-twice'), {
      placementId: 1,
    })
    expect(facilityDemolitionRefusal(once, { placementId: 1 })).toMatchObject({
      code: 'unknownPlacement',
      placementId: 1,
    })
    expect(demolishFacility(once, { placementId: 1 })).toBe(once)
    expect(refundRows(once)).toHaveLength(1)
    expect(() =>
      applyActions(once, [{ kind: 'demolishFacility', demolition: { placementId: 1 } }]),
    ).toThrow(/unknownPlacement/)
  })

  it('never reuses a placement id, so a rebuild can never inherit a dead identity', () => {
    const razed = demolishFacility(studioWithOperationalAnnex('m3a-ids'), { placementId: 1 })
    expect(razed.placement.nextPlacementId).toBe(2)
    const rebuilt = commitPlacement(withCash(razed, 50_000_000), {
      blueprintId: ANNEX,
      origin: WEST_NORTH,
    })
    const fresh = rebuilt.placement.facilities[0]!
    expect(fresh.id).toBe(2)
    // The project id is distinct because the old capex row still names the first
    // one; the ledger is the longest-lived identity authority.
    expect(fresh.projectId).not.toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.projectIdBase)
    expect(() => assertStudioPlacementInvariants(rebuilt)).not.toThrow()
    expect(() => studioCalendar(rebuilt)).not.toThrow()
  })

  it('stops charging operating cost from the demolition week onward', () => {
    const standing = advance(studioWithOperationalAnnex('m3a-opex'), 3)
    const opexBefore = standing.ledger.filter((entry) => entry.kind === 'facilityOpex').length
    expect(opexBefore).toBeGreaterThan(0)

    const razed = demolishFacility(standing, { placementId: 1 })
    const later = advance(razed, 4)
    // No new operating rows after it came down.
    expect(later.ledger.filter((entry) => entry.kind === 'facilityOpex')).toHaveLength(opexBefore)

    // And the HISTORY still reconciles: the weeks it stood are still expected to
    // have been charged, reconstructed from the ledger pair that brackets its life.
    const demolishedWeek = standing.market.tick
    expect(demolishedFacilityHistory(later.ledger)).toHaveLength(1)
    expect(
      expectedWeeklyOperatingCostAt(later.placement, later.ledger, demolishedWeek - 1),
    ).toBe(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost)
    expect(expectedWeeklyOperatingCostAt(later.placement, later.ledger, demolishedWeek)).toBe(0)
    expect(() => assertStudioPlacementInvariants(later)).not.toThrow()
  })
})

// ── E. capital is strictly lossy ─────────────────────────────────────────────

describe('C1-M3a (E) — no refund farming', () => {
  it('loses money on every build-complete-demolish cycle, monotonically', () => {
    let state = withCash(managedStudio('m3a-farming'), 50_000_000)
    const cashAt: number[] = [state.studio.cash]
    for (let cycle = 0; cycle < 5; cycle++) {
      state = commitPlacement(state, { blueprintId: ANNEX, origin: WEST_NORTH })
      state = advance(state, BUILD_WEEKS)
      state = demolishFacility(state, { placementId: cycle + 1 })
      cashAt.push(state.studio.cash)
    }
    // Strictly decreasing across every cycle. Not "usually", not "on average".
    for (let i = 1; i < cashAt.length; i++) {
      expect(cashAt[i]!).toBeLessThan(cashAt[i - 1]!)
    }
    // The capital leg alone is a guaranteed loss before any operating cost.
    expect(REFUND).toBeLessThan(CAPEX)
    expect(FACILITY_DEMOLITION_REFUND_FRACTION).toBeLessThan(1)
    expect(refundRows(state)).toHaveLength(5)
    expect(state.placement.nextPlacementId).toBe(6)
    expect(() => assertStudioPlacementInvariants(state)).not.toThrow()
  })

  it('refuses a forged second refund, and a refund with no capital behind it', () => {
    const razed = demolishFacility(studioWithOperationalAnnex('m3a-forged'), { placementId: 1 })
    const projectId = refundRows(razed)[0]!.constructionProjectId

    const doubled: GameState = {
      ...razed,
      studio: { ...razed.studio, cash: razed.studio.cash + REFUND },
      ledger: [...razed.ledger, { ...refundRows(razed)[0]!, week: razed.market.tick }],
    }
    expect(() => assertStudioPlacementInvariants(doubled)).toThrow(
      /is credited more than once/,
    )

    const unbacked: GameState = {
      ...razed,
      studio: { ...razed.studio, cash: razed.studio.cash + REFUND },
      ledger: [
        ...razed.ledger,
        {
          week: razed.market.tick,
          kind: 'facilityDemolitionRefund',
          amount: REFUND,
          constructionProjectId: 'construction-that-never-happened',
          note: FACILITY_DEMOLITION_LEDGER_NOTE,
        },
      ],
    }
    expect(() => assertStudioPlacementInvariants(unbacked)).toThrow(
      /has no construction capex row/,
    )

    const inflated: GameState = {
      ...razed,
      studio: { ...razed.studio, cash: razed.studio.cash + CAPEX },
      ledger: razed.ledger.map((entry) =>
        entry.kind === 'facilityDemolitionRefund' && entry.constructionProjectId === projectId
          ? { ...entry, amount: CAPEX }
          : entry,
      ),
    }
    expect(() => assertStudioPlacementInvariants(inflated)).toThrow(
      /is not the depreciated fraction/,
    )
  })

  it('refuses a refund for a facility that still stands', () => {
    const standing = studioWithOperationalAnnex('m3a-standing-refund')
    const forged: GameState = {
      ...standing,
      studio: { ...standing.studio, cash: standing.studio.cash + REFUND },
      ledger: [
        ...standing.ledger,
        {
          week: standing.market.tick,
          kind: 'facilityDemolitionRefund',
          amount: REFUND,
          constructionProjectId: standing.placement.facilities[0]!.projectId,
          note: FACILITY_DEMOLITION_LEDGER_NOTE,
        },
      ],
    }
    expect(() => assertStudioPlacementInvariants(forged)).toThrow(
      /was refunded while its facility still stands/,
    )
  })

  it('refuses a placement that vanished with no refund behind it', () => {
    const standing = studioWithOperationalAnnex('m3a-vanished')
    const vanished: GameState = {
      ...standing,
      operations: {
        ...standing.operations,
        facilities: standing.operations.facilities.filter((f) => f.id !== ANNEX_FACILITY),
      },
      placement: { ...standing.placement, facilities: [] },
    }
    expect(() => assertStudioPlacementInvariants(vanished)).toThrow(
      /has no placed facility and no demolition refund/,
    )
  })
})

// ── F. persistence and replay ────────────────────────────────────────────────

describe('C1-M3a (F) — saves, boundaries, and determinism', () => {
  it('round-trips a history containing both a move and a demolition', () => {
    let state = withCash(managedStudio('m3a-roundtrip'), 50_000_000)
    state = commitPlacement(state, { blueprintId: ANNEX, origin: WEST_NORTH })
    state = commitPlacement(withCash(state, 50_000_000), { blueprintId: ANNEX, origin: STAGE_SOUTH })
    state = advance(state, BUILD_WEEKS)
    state = moveFacility(state, { placementId: 1, origin: SOUTH_LAWN })
    state = demolishFacility(state, { placementId: 2 })
    state = advance(state, 2)

    const save = makeSave(state)
    expect(save.saveVersion).toBe(15)
    expect(validateSave(save)).toBe(save)
    expect(validateSaveV15(save)).toBe(save)
    const json = exportSave(save)
    expect(exportSave(importSave(json))).toBe(json)
    const reloaded = migrateToV15(importSave(json)).state
    expect(exportSave(makeSave(reloaded))).toBe(json)
    expect(reloaded.placement.facilities).toEqual(state.placement.facilities)
    expect(refundRows(reloaded)).toHaveLength(1)
    // A reloaded world continues identically to one that never stopped.
    expect(stableStringify(advance(reloaded, 3))).toBe(stableStringify(advance(state, 3)))
  })

  it('keeps the refund row out of every historical save format (law 19)', () => {
    const razed = demolishFacility(studioWithOperationalAnnex('m3a-boundary'), { placementId: 1 })
    // A frozen builder may not silently drop the credit.
    expect(() => makeSaveV12(razed)).toThrow(
      /cannot downgrade or discard authoritative V13 facility demolition ledger state/,
    )
    // And an older validator refuses the row outright.
    const forgedV11 = JSON.parse(exportSave(makeSave(razed))) as {
      saveVersion: number
      state: Record<string, unknown>
    }
    delete forgedV11.state.property
    delete forgedV11.state.placement
    // C2a-M1: strip the V14 roots too, so the REFUND ROW is the first violation
    // this forgery contains. A forgery that trips a newer closed-world rule first
    // proves nothing about the guard under test.
    delete forgedV11.state.sets
    delete forgedV11.state.nextSetId
    delete forgedV11.state.productionQueue
    delete forgedV11.state.originalScreenplays
    delete forgedV11.state.studioEvents
    forgedV11.saveVersion = 11
    expect(() => validateSave(forgedV11)).toThrow(
      /SaveFileV13 facility demolition authority|facilityDemolitionRefund/,
    )
  })

  it('replays a full build/move/demolish action sequence byte-identically', () => {
    const run = (): GameState => {
      let state = withCash(managedStudio('m3a-sequence'), 50_000_000)
      state = applyActions(state, [
        { kind: 'placeFacility', placement: { blueprintId: ANNEX, origin: WEST_NORTH } },
      ])
      state = advance(state, BUILD_WEEKS)
      state = applyActions(state, [
        { kind: 'moveFacility', move: { placementId: 1, origin: SOUTH_LAWN } },
      ])
      state = advance(state, 2)
      state = applyActions(state, [
        { kind: 'demolishFacility', demolition: { placementId: 1 } },
      ])
      return advance(state, 2)
    }
    const first = run()
    const second = run()
    expect(stableStringify(second)).toBe(stableStringify(first))
    expect(second.rngState).toBe(first.rngState)
    expect(refundRows(first)).toHaveLength(1)
  })
})
