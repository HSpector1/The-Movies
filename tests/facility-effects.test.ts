// ── C1-M4 — the widened catalog and its real mechanical effects ──────────────
//
// The product law under test: NO DECORATIVE BLUEPRINTS. Every entry changes a
// real, existing, player-visible number today. So every effect here is proved
// three ways:
//   (a) NEUTRAL WHEN UNBUILT — with none of these standing, the number is
//       byte-identical to what it was before the catalog widened;
//   (b) MOVES ITS NUMBER — operational, it changes that exact number, by the
//       exact named TUNING amount, deterministically;
//   (c) HONEST WHEN DEMOLISHED — the semantics are defined and asserted, not
//       discovered.
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
  developmentOfficeEstUplift,
  exportSave,
  freelancerFee,
  freelancerFeeMultiplier,
  generateWorld,
  hasOperationalBlueprint,
  importSave,
  makeSave,
  migrateToV13,
  operationalBlueprintCount,
  queryPlacement,
  stableStringify,
  studioCalendar,
  studioPlacementView,
  tick,
} from '../src/core/index.js'
import {
  CRAFT_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  DEVELOPMENT_CASTING_HALL_BLUEPRINT,
  DEVELOPMENT_OFFICE_2_BLUEPRINT,
  DEVELOPMENT_OFFICE_3_BLUEPRINT,
  FACILITY_BLUEPRINTS,
  FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT,
  SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT,
  SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT,
} from '../src/core/tuning.js'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
  LotCell,
  SegmentId,
  Talent,
} from '../src/core/index.js'

// Origins chosen so every footprint sits wholly on a road-fronting buildable
// parcel and no two violate each other's clearance ring.
const SITE = {
  office2: { gx: 0, gy: 9 }, // west-lawn
  office3: { gx: 0, gy: 12 }, // west-lawn, one clear row below
  craft: { gx: 15, gy: 16 }, // stage-south
  hall: { gx: 3, gy: 19 }, // south-lawn, 4x3
  annex: { gx: 7, gy: 15 }, // the legacy expansion parcel
} as const

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
function commissionPayload(state: GameState, conceptIndex = 0): CommissionScriptPayload {
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

function managedStudio(seed: string): GameState {
  const engaged: GameState = { ...generateWorld(seed), economyEngagedEver: true }
  return applyActions(engaged, [{ kind: 'activateStudioOperations' }])
}
function scriptStudio(seed: string): GameState {
  return applyActions(foundedStudio(seed), [
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
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
function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}
function build(state: GameState, blueprintId: string, origin: LotCell): GameState {
  const next = commitPlacement(withCash(state, 50_000_000), { blueprintId, origin })
  if (next === withCash(state, 50_000_000)) throw new Error(`build refused: ${blueprintId}`)
  return next
}

/** Commission one screenplay and let the draft complete; return its EST. */
function draftEst(state: GameState, conceptIndex = 0): { state: GameState; est: number } {
  const conceptId = state.concepts[conceptIndex]!.id
  const commissioned = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptIndex) },
  ])
  const drafted = tick(commissioned)
  const project = drafted.scriptDevelopment.projects.find(
    (candidate) => candidate.conceptId === conceptId,
  )!
  if (project.assessment === null) throw new Error('draft did not complete')
  return { state: drafted, est: project.assessment.perceivedStrength }
}

// ── the catalog itself ───────────────────────────────────────────────────────

describe('C1-M4 — the widened catalog', () => {
  it('ships five entries, each with authored numbers in their stated ranges', () => {
    expect(FACILITY_BLUEPRINTS.map((blueprint) => blueprint.id)).toEqual([
      'development-casting-annex',
      'development-casting-hall',
      'development-office-2',
      'development-office-3',
      'craft-annex',
    ])
    // The bounded-term law runs at every action, tick, and save boundary; this
    // pins the authored values themselves so a price cannot drift unnoticed.
    const pinned = [
      [DEVELOPMENT_CASTING_HALL_BLUEPRINT, 1_400_000, 20, 6_000, 2, 4, 3],
      [DEVELOPMENT_OFFICE_2_BLUEPRINT, 600_000, 8, 2_500, 0, 3, 2],
      [DEVELOPMENT_OFFICE_3_BLUEPRINT, 1_200_000, 12, 4_000, 0, 3, 2],
      [CRAFT_ANNEX_BLUEPRINT, 400_000, 6, 2_000, 0, 3, 2],
    ] as const
    for (const [blueprint, capex, weeks, opex, capacity, width, depth] of pinned) {
      expect(blueprint.capex).toBe(capex)
      expect(blueprint.buildWeeks).toBe(weeks)
      expect(blueprint.weeklyOperatingCost).toBe(opex)
      expect(blueprint.capacity).toBe(capacity)
      expect(blueprint.footprint).toEqual({ width, depth })
      expect(blueprint.requiresRoadAccess).toBe(true)
    }
  })

  it('gives every entry a player sentence, and no two share an identity', () => {
    const ids = new Set<string>()
    const notes = new Set<string>()
    for (const blueprint of FACILITY_BLUEPRINTS) {
      expect(blueprint.effectSummary.trim().length).toBeGreaterThan(0)
      expect(blueprint.effectSummary.trim().endsWith('.')).toBe(true)
      // Player copy: no engine vocabulary leaks onto a catalog card.
      expect(blueprint.effectSummary).not.toMatch(
        /blueprintId|capacity:|TUNING|operational placement|C1-M|facilityId/,
      )
      expect(ids.has(blueprint.id)).toBe(false)
      expect(notes.has(blueprint.ledgerNote)).toBe(false)
      ids.add(blueprint.id)
      notes.add(blueprint.ledgerNote)
    }
  })

  it('keeps the Annex byte-identical to its accepted V11 law', () => {
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capex).toBe(780_000)
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks).toBe(13)
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.capacity).toBe(1)
    expect(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.requires).toEqual([])
  })
})

// ── (1)(2) the Development Office tiers ──────────────────────────────────────

describe('C1-M4 — Development Office tiers raise what a screenplay becomes', () => {
  it('changes nothing at all when no office stands', () => {
    const state = scriptStudio('m4-office-neutral')
    expect(developmentOfficeEstUplift(state)).toBe(0)
    // The same world, drafted twice, is the same draft — and building an
    // unrelated facility does not move it either.
    const control = draftEst(advance(state, 8))
    const withAnnex = draftEst(
      advance(build(state, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id, SITE.annex), 8),
    )
    expect(withAnnex.est).toBe(control.est)
  })

  it('raises the review EST by exactly the named tier amount', () => {
    const seed = 'm4-office-uplift'
    const base = scriptStudio(seed)
    const weeks = DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks

    const control = draftEst(advance(base, weeks))
    const officed = build(base, DEVELOPMENT_OFFICE_2_BLUEPRINT.id, SITE.office2)
    const officeReady = advance(officed, weeks)
    expect(hasOperationalBlueprint(officeReady, DEVELOPMENT_OFFICE_2_BLUEPRINT.id)).toBe(true)
    expect(developmentOfficeEstUplift(officeReady)).toBe(SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT)

    const uplifted = draftEst(officeReady)
    expect(uplifted.est).toBe(control.est + SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT)
    // The hidden truth moved with the visible estimate, not instead of it.
    const project = uplifted.state.scriptDevelopment.projects[0]!
    const controlProject = control.state.scriptDevelopment.projects[0]!
    expect(project.assessment!.actualStrength).toBe(
      controlProject.assessment!.actualStrength + SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT,
    )
    // Speed is untouched: one week to draft, with or without the office.
    expect(project.status).toBe('review')
    expect(controlProject.status).toBe('review')
  })

  it('does not stack, and the highest tier wins', () => {
    const base = scriptStudio('m4-office-tiers')
    const two = advance(
      build(base, DEVELOPMENT_OFFICE_2_BLUEPRINT.id, SITE.office2),
      DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks,
    )
    expect(developmentOfficeEstUplift(two)).toBe(SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT)

    const three = advance(
      build(two, DEVELOPMENT_OFFICE_3_BLUEPRINT.id, SITE.office3),
      DEVELOPMENT_OFFICE_3_BLUEPRINT.buildWeeks,
    )
    expect(operationalBlueprintCount(three, DEVELOPMENT_OFFICE_2_BLUEPRINT.id)).toBe(1)
    expect(operationalBlueprintCount(three, DEVELOPMENT_OFFICE_3_BLUEPRINT.id)).toBe(1)
    // Tier III REPLACES tier II's gain — 9, never 4 + 9.
    expect(developmentOfficeEstUplift(three)).toBe(SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT)
    expect(SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT).toBeLessThan(
      SCRIPT_DEVELOPMENT_OFFICE_TIER_2_EST_UPLIFT + SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT,
    )
  })

  it('gates tier III behind an OPERATIONAL tier II, and refuses a second of either', () => {
    const base = withCash(managedStudio('m4-office-gate'), 50_000_000)
    // Locked with nothing built.
    const locked = queryPlacement(base, {
      blueprintId: DEVELOPMENT_OFFICE_3_BLUEPRINT.id,
      origin: SITE.office3,
    })
    expect(locked.primary).toBe('requirementsUnmet')
    expect(locked.unmetRequirements[0]!.reason).toBe(
      'Requires an operational Development Office II.',
    )

    // Still locked while tier II is only under construction — the requirement
    // asks for an operational building, exactly as capacity does.
    const building = build(base, DEVELOPMENT_OFFICE_2_BLUEPRINT.id, SITE.office2)
    expect(
      queryPlacement(building, {
        blueprintId: DEVELOPMENT_OFFICE_3_BLUEPRINT.id,
        origin: SITE.office3,
      }).primary,
    ).toBe('requirementsUnmet')

    const ready = advance(building, DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks)
    expect(
      queryPlacement(withCash(ready, 50_000_000), {
        blueprintId: DEVELOPMENT_OFFICE_3_BLUEPRINT.id,
        origin: SITE.office3,
      }).ok,
    ).toBe(true)

    // And a second tier II is refused by its instance limit, because a second
    // one is provably worth nothing.
    expect(
      queryPlacement(withCash(ready, 50_000_000), {
        blueprintId: DEVELOPMENT_OFFICE_2_BLUEPRINT.id,
        origin: SITE.office3,
      }).primary,
    ).toBe('instanceLimit')
  })

  it('never un-writes a screenplay when the office is demolished', () => {
    const base = scriptStudio('m4-office-demolish')
    const ready = advance(
      build(base, DEVELOPMENT_OFFICE_2_BLUEPRINT.id, SITE.office2),
      DEVELOPMENT_OFFICE_2_BLUEPRINT.buildWeeks,
    )
    const drafted = draftEst(ready)
    const est = drafted.est

    const placementId = drafted.state.placement.facilities[0]!.id
    const razed = demolishFacility(drafted.state, { placementId })
    expect(razed).not.toBe(drafted.state)
    expect(developmentOfficeEstUplift(razed)).toBe(0)

    // The finished screenplay is untouched — the assessment is stored, and a
    // building coming down cannot reach back into work already done.
    expect(razed.scriptDevelopment.projects[0]!.assessment!.perceivedStrength).toBe(est)
    const later = advance(razed, 3)
    expect(later.scriptDevelopment.projects[0]!.assessment!.perceivedStrength).toBe(est)
    expect(() => assertStudioPlacementInvariants(later)).not.toThrow()

    // A screenplay commissioned AFTER the demolition gets no uplift. Compared
    // against the same concept in a studio that never built an office.
    const control = draftEst(advance(scriptStudio('m4-office-demolish'), later.market.tick), 1)
    const afterward = draftEst(later, 1)
    expect(afterward.est).toBe(control.est)
  })
})

// ── (3) the Development & Casting Hall ───────────────────────────────────────

describe('C1-M4 — the Hall adds two shared slots', () => {
  const capacityOf = (state: GameState): number =>
    state.operations.facilities
      .filter((facility) => facility.capability === 'development-casting')
      .reduce((sum, facility) => sum + facility.capacity, 0)

  it('contributes nothing until it is operational, then exactly two slots', () => {
    const base = managedStudio('m4-hall')
    const before = capacityOf(base)
    expect(before).toBe(2)

    const site = build(base, DEVELOPMENT_CASTING_HALL_BLUEPRINT.id, SITE.hall)
    // A construction site occupies land and contributes nothing.
    expect(capacityOf(site)).toBe(before)

    const ready = advance(site, DEVELOPMENT_CASTING_HALL_BLUEPRINT.buildWeeks)
    expect(ready.placement.facilities[0]!.status).toBe('operational')
    expect(capacityOf(ready)).toBe(before + 2)
    expect(() => assertStudioPlacementInvariants(ready)).not.toThrow()
    expect(() => studioCalendar(ready)).not.toThrow()

    // Demolishing gives the slots back and leaves nothing dangling.
    const razed = demolishFacility(ready, { placementId: 1 })
    expect(capacityOf(razed)).toBe(before)
    expect(() => studioCalendar(razed)).not.toThrow()
  })

  it('stacks, unlike the office tiers, and so carries no instance limit', () => {
    expect(
      FACILITY_BLUEPRINTS.find((b) => b.id === DEVELOPMENT_CASTING_HALL_BLUEPRINT.id)!.maxInstances,
    ).toBeUndefined()
    const base = managedStudio('m4-hall-stack')
    const one = advance(
      build(base, DEVELOPMENT_CASTING_HALL_BLUEPRINT.id, SITE.hall),
      DEVELOPMENT_CASTING_HALL_BLUEPRINT.buildWeeks,
    )
    const two = advance(
      build(one, DEVELOPMENT_CASTING_HALL_BLUEPRINT.id, { gx: 23, gy: 20 }),
      DEVELOPMENT_CASTING_HALL_BLUEPRINT.buildWeeks,
    )
    expect(capacityOf(two)).toBe(capacityOf(base) + 4)
  })
})

// ── (5) the Craft Services Annex ─────────────────────────────────────────────

describe('C1-M4 — the Craft Services Annex cuts freelancer fees', () => {
  it('multiplies by exactly 1 when unbuilt — a bit-exact no-op', () => {
    const state = managedStudio('m4-craft-neutral')
    expect(freelancerFeeMultiplier(state)).toBe(1)
    const talent = state.talent[0]!
    const base = freelancerFee(state, talent)
    expect(base).toBeGreaterThan(0)
    expect(Number.isInteger(base)).toBe(true)
    // An unrelated facility does not touch the fee.
    const annexed = advance(
      build(state, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id, SITE.annex),
      DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks,
    )
    expect(freelancerFee(annexed, talent)).toBe(base)
  })

  it('cuts every fee by the named percentage once operational', () => {
    const base = managedStudio('m4-craft')
    const site = build(base, CRAFT_ANNEX_BLUEPRINT.id, SITE.craft)
    expect(freelancerFeeMultiplier(site)).toBe(1) // still a construction site

    const ready = advance(site, CRAFT_ANNEX_BLUEPRINT.buildWeeks)
    expect(freelancerFeeMultiplier(ready)).toBe(1 - FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT)

    let checked = 0
    for (const talent of base.talent.slice(0, 25)) {
      const full = freelancerFee(base, talent)
      const cut = freelancerFee(ready, talent)
      expect(cut).toBeLessThan(full)
      // Exactly the discount, to the dollar the single rounding produces.
      expect(Math.abs(cut - full * (1 - FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT))).toBeLessThanOrEqual(1)
      expect(Number.isInteger(cut)).toBe(true)
      // Deterministic.
      expect(freelancerFee(ready, talent)).toBe(cut)
      checked++
    }
    expect(checked).toBe(25)
  })

  it('restores the full fee when demolished, and never repriced a past film', () => {
    const ready = advance(
      build(managedStudio('m4-craft-demolish'), CRAFT_ANNEX_BLUEPRINT.id, SITE.craft),
      CRAFT_ANNEX_BLUEPRINT.buildWeeks,
    )
    const talent = ready.talent[0]!
    const discounted = freelancerFee(ready, talent)
    const razed = demolishFacility(ready, { placementId: 1 })
    expect(freelancerFeeMultiplier(razed)).toBe(1)
    expect(freelancerFee(razed, talent)).toBeGreaterThan(discounted)
    // Past films are priced from their ledger rows, which nothing here rewrites.
    expect(razed.ledger.filter((entry) => entry.kind === 'freelancerFee')).toEqual(
      ready.ledger.filter((entry) => entry.kind === 'freelancerFee'),
    )
  })

  it('does not stack a second annex', () => {
    expect(CRAFT_ANNEX_BLUEPRINT.maxInstances).toBe(1)
    const ready = advance(
      build(managedStudio('m4-craft-stack'), CRAFT_ANNEX_BLUEPRINT.id, SITE.craft),
      CRAFT_ANNEX_BLUEPRINT.buildWeeks,
    )
    expect(
      queryPlacement(withCash(ready, 50_000_000), {
        blueprintId: CRAFT_ANNEX_BLUEPRINT.id,
        origin: SITE.office2,
      }).primary,
    ).toBe('instanceLimit')
  })
})

// ── the whole estate, together ───────────────────────────────────────────────

describe('C1-M4 — the whole catalog standing at once', () => {
  function fullEstate(seed: string): GameState {
    let state = managedStudio(seed)
    state = build(state, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.id, SITE.annex)
    state = build(state, DEVELOPMENT_CASTING_HALL_BLUEPRINT.id, SITE.hall)
    state = build(state, DEVELOPMENT_OFFICE_2_BLUEPRINT.id, SITE.office2)
    state = build(state, CRAFT_ANNEX_BLUEPRINT.id, SITE.craft)
    state = advance(state, DEVELOPMENT_CASTING_HALL_BLUEPRINT.buildWeeks)
    // Tier III only becomes legal once tier II is operational.
    state = build(state, DEVELOPMENT_OFFICE_3_BLUEPRINT.id, SITE.office3)
    return advance(state, DEVELOPMENT_OFFICE_3_BLUEPRINT.buildWeeks)
  }

  it('stands all five, each operational, with every invariant holding', () => {
    const estate = fullEstate('m4-estate')
    expect(estate.placement.facilities).toHaveLength(5)
    expect(estate.placement.facilities.every((placed) => placed.status === 'operational')).toBe(true)
    for (const blueprint of FACILITY_BLUEPRINTS) {
      expect(hasOperationalBlueprint(estate, blueprint.id)).toBe(true)
    }
    // Only the capacity-bearing ones joined the shared-capacity registry.
    const registered = estate.operations.facilities.map((facility) => facility.id)
    expect(registered).toContain('facility-development-casting-annex')
    expect(registered).toContain('facility-development-casting-hall')
    expect(registered).not.toContain('facility-development-office-2')
    expect(registered).not.toContain('facility-craft-annex')

    expect(() => assertStudioPlacementInvariants(estate)).not.toThrow()
    expect(() => studioCalendar(estate)).not.toThrow()
    // Every effect is live at once.
    expect(developmentOfficeEstUplift(estate)).toBe(SCRIPT_DEVELOPMENT_OFFICE_TIER_3_EST_UPLIFT)
    expect(freelancerFeeMultiplier(estate)).toBe(1 - FREELANCER_FEE_CRAFT_ANNEX_DISCOUNT)
  })

  it('round-trips the whole estate byte-identically and replays deterministically', () => {
    const estate = fullEstate('m4-estate-save')
    const json = exportSave(makeSave(estate))
    const reloaded = migrateToV13(importSave(json)).state
    expect(exportSave(makeSave(reloaded))).toBe(json)
    expect(reloaded.placement.facilities).toEqual(estate.placement.facilities)
    // A reloaded world continues identically to one that never stopped.
    expect(stableStringify(advance(reloaded, 4))).toBe(stableStringify(advance(estate, 4)))
    // And the whole run is reproducible from its seed.
    expect(stableStringify(fullEstate('m4-estate-save'))).toBe(stableStringify(estate))
  })

  it('charges every building its weekly operating cost, together', () => {
    const estate = fullEstate('m4-estate-opex')
    const expected =
      DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.weeklyOperatingCost +
      DEVELOPMENT_CASTING_HALL_BLUEPRINT.weeklyOperatingCost +
      DEVELOPMENT_OFFICE_2_BLUEPRINT.weeklyOperatingCost +
      DEVELOPMENT_OFFICE_3_BLUEPRINT.weeklyOperatingCost +
      CRAFT_ANNEX_BLUEPRINT.weeklyOperatingCost
    const opexRow = advance(estate, 1)
      .ledger.filter((entry) => entry.kind === 'facilityOpex')
      .at(-1)!
    expect(opexRow.amount).toBe(-expected)
  })

  it('shows the whole catalog in the build read model, with its unlock state', () => {
    const view = studioPlacementView(withCash(managedStudio('m4-catalog-view'), 50_000_000))
    expect(view.catalog).toHaveLength(5)
    const office3 = view.catalog.find((entry) => entry.blueprintId === 'development-office-3')!
    expect(office3.available).toBe(false)
    expect(office3.unmet[0]!.reason).toBe('Requires an operational Development Office II.')
    expect(office3.buildable).toBe(false)
    const hall = view.catalog.find((entry) => entry.blueprintId === 'development-casting-hall')!
    expect(hall.available).toBe(true)
    expect(hall.buildable).toBe(true)
    // Every card carries its player sentence.
    for (const entry of view.catalog) {
      const blueprint = FACILITY_BLUEPRINTS.find((b) => b.id === entry.blueprintId)!
      expect(blueprint.effectSummary.length).toBeGreaterThan(0)
    }
  })
})
