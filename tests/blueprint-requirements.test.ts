// ── C1-M2 — the declarative blueprint requirement schema ─────────────────────
//
// What is under test:
//   • Every requirement KIND evaluates correctly, met and unmet, including the
//     five whose backing systems land in C3/C4 — those must be honestly UNMET
//     and must never throw.
//   • The locked-reason vocabulary: the exact product copy C1-M5 will render.
//   • The binding rejection ORDER, proved through the real rule engine:
//     domain cell failures ≻ requirementsUnmet ≻ instanceLimit ≻ insufficientFunds.
//   • `maxInstances` counting: underConstruction counts, operational counts,
//     other blueprints do not, founding structures do not.
//   • Purity and determinism of evaluation.
//   • ZERO behaviour change for the shipped Annex blueprint.
//
// The synthetic blueprints below are TEST-LOCAL by design: they are never added
// to FACILITY_BLUEPRINTS, because catalog content is C1-M4's milestone. They
// reach the REAL rule engine through `quoteForBlueprint`, which is the function
// `queryPlacement` itself delegates to — so these tests exercise shipped code,
// not a reimplementation of it. Nothing here can commit a placement: only
// `queryPlacement` resolves the catalog, and only `commitPlacement` spends.
//
// Everything here is seeded and pure: no wall clock, no unseeded randomness.

import { describe, expect, it } from 'vitest'
import {
  DEVELOPMENT_CASTING_ANNEX_BLUEPRINT,
  FACILITY_BLUEPRINTS,
} from '../src/core/tuning.js'
import {
  INITIAL_PROPERTY,
  LIVE_REQUIREMENT_KINDS,
  PLACEMENT_REJECTION_ORDER,
  applyActions,
  blueprintAtInstanceLimit,
  blueprintInstanceCount,
  blueprintMaxInstances,
  blueprintRequirementMet,
  blueprintRequirementReason,
  commitPlacement,
  evaluateBlueprintRequirements,
  generateWorld,
  queryPlacement,
  quoteForBlueprint,
  requirementIsAttainable,
  stableStringify,
  studioPlacementView,
  tick,
} from '../src/core/index.js'
import type {
  BlueprintRequirement,
  BlueprintRequirementKind,
  FacilityBlueprint,
  GameState,
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

function advance(state: GameState, weeks: number): GameState {
  let out = state
  for (let week = 0; week < weeks; week++) out = tick(out)
  return out
}

/**
 * A synthetic catalog entry. Deliberately NOT added to FACILITY_BLUEPRINTS —
 * catalog content is C1-M4. Its geometry copies the Annex so that a rejection
 * can only ever come from the rule under test, never from an accidental
 * footprint difference.
 */
function synthetic(overrides: Partial<FacilityBlueprint> & { id: string }): FacilityBlueprint {
  return {
    name: 'Test Building',
    capability: 'development-casting',
    capacity: 1,
    footprint: { width: 3, depth: 2 },
    clearanceRing: 1,
    requiresRoadAccess: true,
    buildWeeks: 4,
    capex: 100_000,
    weeklyOperatingCost: 1_000,
    facilityIdBase: `facility-${overrides.id}`,
    projectIdBase: `construction-${overrides.id}`,
    ledgerNote: `${overrides.id} construction`,
    effectSummary: 'Does something the tests do not depend on.',
    requires: [],
    ...overrides,
  }
}

/** A legal, road-fronting, buildable origin on the initial property. */
const LEGAL_ORIGIN = { gx: 7, gy: 15 } // the `expansion` parcel
const SECOND_ORIGIN = { gx: 0, gy: 9 } // `west-lawn`, far from the first

// Every kind, with one requirement that IS satisfiable today (where possible)
// and one that is not, so no kind can quietly go unexercised.
const ALL_KINDS: readonly BlueprintRequirementKind[] = [
  'date',
  'facility',
  'structure',
  'rank',
  'certificate',
  'award',
  'research',
  'landZone',
]

describe('C1-M2 — requirement kinds evaluate honestly', () => {
  it('covers every declared kind, and separates live ones from not-yet-attainable', () => {
    expect([...LIVE_REQUIREMENT_KINDS].sort()).toEqual(['date', 'facility', 'structure'])
    // The union and the test's own checklist agree: a ninth kind added without a
    // test would fail here rather than silently going unexercised.
    const sample: Record<BlueprintRequirementKind, BlueprintRequirement> = {
      date: { kind: 'date', week: 1 },
      facility: { kind: 'facility', blueprintId: ANNEX },
      structure: { kind: 'structure', structureId: 'writers' },
      rank: { kind: 'rank', tier: 'Respected Studio Head' },
      certificate: { kind: 'certificate', certificateId: 'First Hit' },
      award: { kind: 'award', awardId: 'Best Picture' },
      research: { kind: 'research', packId: 'Sound Recording' },
      landZone: { kind: 'landZone', zoneId: 'the eastern lots' },
    }
    expect(Object.keys(sample).sort()).toEqual([...ALL_KINDS].sort())
    for (const kind of ALL_KINDS) {
      const attainable = requirementIsAttainable(sample[kind])
      expect(attainable).toBe((LIVE_REQUIREMENT_KINDS as readonly string[]).includes(kind))
    }
  })

  it('meets and fails a date requirement on the exact week boundary', () => {
    const state = managedStudio('c1-m2-date')
    expect(state.market.tick).toBe(0)
    const gate: BlueprintRequirement = { kind: 'date', week: 3 }
    expect(blueprintRequirementMet(state, gate)).toBe(false)
    expect(blueprintRequirementMet(advance(state, 2), gate)).toBe(false)
    // Met ON the week, not after it.
    expect(blueprintRequirementMet(advance(state, 3), gate)).toBe(true)
    expect(blueprintRequirementMet(advance(state, 4), gate)).toBe(true)
    // Week 0 gates are trivially met, which is what an unconditional date means.
    expect(blueprintRequirementMet(state, { kind: 'date', week: 0 })).toBe(true)
  })

  it('meets a facility requirement only once a placement is OPERATIONAL', () => {
    const gate: BlueprintRequirement = { kind: 'facility', blueprintId: ANNEX }
    const vacant = withCash(managedStudio('c1-m2-facility'), 5_000_000)
    expect(blueprintRequirementMet(vacant, gate)).toBe(false)

    const building = commitPlacement(vacant, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    expect(building.placement.facilities[0]!.status).toBe('underConstruction')
    // A site under construction is NOT a facility yet — this is the whole point
    // of the rule, and it matches the capacity law (gated on active, not existing).
    expect(blueprintRequirementMet(building, gate)).toBe(false)

    const operational = advance(building, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    expect(operational.placement.facilities[0]!.status).toBe('operational')
    expect(blueprintRequirementMet(operational, gate)).toBe(true)

    // A requirement naming a blueprint nobody has built stays unmet.
    expect(
      blueprintRequirementMet(operational, { kind: 'facility', blueprintId: 'no-such-blueprint' }),
    ).toBe(false)
  })

  it('meets a structure requirement for any authored body, landmark or founding', () => {
    const state = managedStudio('c1-m2-structure')
    for (const structure of INITIAL_PROPERTY.structures) {
      expect(
        blueprintRequirementMet(state, { kind: 'structure', structureId: structure.id }),
      ).toBe(true)
    }
    expect(blueprintRequirementMet(state, { kind: 'structure', structureId: 'nope' })).toBe(false)
    // It reads the STATE's property, not the constants: remove a body and the
    // gate closes. (C1-M1a made this possible; here is what it buys.)
    const razed: GameState = {
      ...state,
      property: {
        ...state.property,
        structures: state.property.structures.filter((s) => s.id !== 'theater'),
      },
    }
    expect(blueprintRequirementMet(razed, { kind: 'structure', structureId: 'theater' })).toBe(false)
    expect(blueprintRequirementMet(razed, { kind: 'structure', structureId: 'writers' })).toBe(true)
  })

  it('evaluates every not-yet-attainable kind as UNMET, in every state, without throwing', () => {
    const states = [
      generateWorld('c1-m2-future-legacy'),
      managedStudio('c1-m2-future-managed'),
      advance(withCash(managedStudio('c1-m2-future-rich'), 9_000_000), 40),
    ]
    const future: BlueprintRequirement[] = [
      { kind: 'rank', tier: 'Respected Studio Head' },
      { kind: 'certificate', certificateId: 'First Hit' },
      { kind: 'award', awardId: 'Best Picture' },
      { kind: 'research', packId: 'Sound Recording' },
      { kind: 'landZone', zoneId: 'the eastern lots' },
    ]
    for (const state of states) {
      for (const requirement of future) {
        expect(() => blueprintRequirementMet(state, requirement)).not.toThrow()
        expect(blueprintRequirementMet(state, requirement)).toBe(false)
        expect(requirementIsAttainable(requirement)).toBe(false)
      }
    }
  })
})

describe('C1-M2 — the locked-reason vocabulary (C1-M5 renders these verbatim)', () => {
  const context = { property: INITIAL_PROPERTY, catalog: FACILITY_BLUEPRINTS }

  it('pins the exact sentence for every kind', () => {
    expect(blueprintRequirementReason({ kind: 'date', week: 60 }, context)).toBe(
      'Available from Week 60.',
    )
    // A facility requirement names the building the way the player knows it.
    expect(
      blueprintRequirementReason({ kind: 'facility', blueprintId: ANNEX }, context),
    ).toBe('Requires an operational Development & Casting Annex.')
    expect(
      blueprintRequirementReason({ kind: 'structure', structureId: 'writers' }, context),
    ).toBe('Requires the Development.')
    expect(
      blueprintRequirementReason({ kind: 'rank', tier: 'Respected Studio Head' }, context),
    ).toBe('Requires Respected Studio Head rank. Studio rank is not part of the game yet.')
    expect(
      blueprintRequirementReason({ kind: 'certificate', certificateId: 'First Hit' }, context),
    ).toBe('Requires the First Hit certificate. Certificates are not part of the game yet.')
    expect(
      blueprintRequirementReason({ kind: 'award', awardId: 'Best Picture' }, context),
    ).toBe('Requires the Best Picture award. Awards are not part of the game yet.')
    expect(
      blueprintRequirementReason({ kind: 'research', packId: 'Sound Recording' }, context),
    ).toBe('Requires the Sound Recording research. Research is not part of the game yet.')
    expect(
      blueprintRequirementReason({ kind: 'landZone', zoneId: 'the eastern lots' }, context),
    ).toBe('Requires owning the eastern lots. Buying land is not part of the game yet.')
  })

  it('falls back to the raw id rather than inventing a name it does not have', () => {
    expect(
      blueprintRequirementReason({ kind: 'facility', blueprintId: 'unshipped-thing' }, context),
    ).toBe('Requires an operational unshipped-thing.')
    expect(
      blueprintRequirementReason({ kind: 'structure', structureId: 'unbuilt-thing' }, context),
    ).toBe('Requires the unbuilt-thing.')
  })

  it('is player copy: no code names, no milestones, no campaign vocabulary', () => {
    const every: BlueprintRequirement[] = [
      { kind: 'date', week: 60 },
      { kind: 'facility', blueprintId: ANNEX },
      { kind: 'structure', structureId: 'writers' },
      { kind: 'rank', tier: 'Respected Studio Head' },
      { kind: 'certificate', certificateId: 'First Hit' },
      { kind: 'award', awardId: 'Best Picture' },
      { kind: 'research', packId: 'Sound Recording' },
      { kind: 'landZone', zoneId: 'the eastern lots' },
    ]
    for (const requirement of every) {
      const reason = blueprintRequirementReason(requirement, context)
      expect(reason).toMatch(/\S/)
      // A complete sentence a player can read.
      expect(reason.endsWith('.')).toBe(true)
      expect(reason[0]).toBe(reason[0]!.toUpperCase())
      // Never leaks engine or process vocabulary into the product surface.
      expect(reason).not.toMatch(
        /C[1-9]-M|blueprintId|requirementsUnmet|instanceLimit|milestone|TUNING|undefined|null/,
      )
    }
  })
})

describe('C1-M2 — evaluating a whole requirement list', () => {
  it('is available only when EVERY requirement is met, and reports each miss', () => {
    const blueprint = synthetic({
      id: 'multi-gate',
      requires: [
        { kind: 'date', week: 5 },
        { kind: 'structure', structureId: 'writers' }, // met from week 0
        { kind: 'facility', blueprintId: ANNEX },
        { kind: 'award', awardId: 'Best Picture' },
      ],
    })
    const state = withCash(managedStudio('c1-m2-list'), 5_000_000)

    const early = evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
    expect(early.available).toBe(false)
    // AUTHORED order, with the met one absent — never reordered, never padded.
    expect(early.unmet.map((entry) => entry.requirement.kind)).toEqual([
      'date',
      'facility',
      'award',
    ])
    expect(early.unmet.map((entry) => entry.notYetAttainable)).toEqual([false, false, true])
    expect(early.unmet[0]!.reason).toBe('Available from Week 5.')

    // Satisfy the two live gates; the C3 award gate alone still blocks.
    const built = advance(
      commitPlacement(state, { blueprintId: ANNEX, origin: LEGAL_ORIGIN }),
      DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks,
    )
    const later = evaluateBlueprintRequirements(built, blueprint, FACILITY_BLUEPRINTS)
    expect(later.available).toBe(false)
    expect(later.unmet.map((entry) => entry.requirement.kind)).toEqual(['award'])
    expect(later.unmet[0]!.notYetAttainable).toBe(true)
  })

  it('treats an empty requirement list as unconditionally available', () => {
    const state = managedStudio('c1-m2-empty')
    const open = synthetic({ id: 'open', requires: [] })
    expect(evaluateBlueprintRequirements(state, open, FACILITY_BLUEPRINTS)).toEqual({
      available: true,
      unmet: [],
    })
  })

  it('is pure and deterministic — same inputs, same answer, no mutation', () => {
    const state = advance(withCash(managedStudio('c1-m2-pure'), 5_000_000), 3)
    const blueprint = synthetic({
      id: 'pure-probe',
      requires: [
        { kind: 'date', week: 99 },
        { kind: 'rank', tier: 'Respected Studio Head' },
        { kind: 'facility', blueprintId: ANNEX },
      ],
    })
    const before = stableStringify(state)
    const first = evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
    const second = evaluateBlueprintRequirements(state, blueprint, FACILITY_BLUEPRINTS)
    expect(stableStringify(second)).toBe(stableStringify(first))
    // Not the same object — a fresh value each time, so no caller can poison it.
    expect(second).not.toBe(first)
    expect(second.unmet).not.toBe(first.unmet)
    // The state it was asked about is untouched, RNG included.
    expect(stableStringify(state)).toBe(before)
    expect(state.rngState).toBe(
      advance(withCash(managedStudio('c1-m2-pure'), 5_000_000), 3).rngState,
    )
  })
})

describe('C1-M2 — instance limits', () => {
  it('counts placements of the blueprint in EVERY status, and nothing else', () => {
    const rich = withCash(managedStudio('c1-m2-instances'), 50_000_000)
    expect(blueprintInstanceCount(rich.placement, ANNEX)).toBe(0)

    const one = commitPlacement(rich, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    expect(blueprintInstanceCount(one.placement, ANNEX)).toBe(1) // underConstruction counts

    const two = commitPlacement(withCash(one, 50_000_000), {
      blueprintId: ANNEX,
      origin: SECOND_ORIGIN,
    })
    expect(blueprintInstanceCount(two.placement, ANNEX)).toBe(2)

    const done = advance(two, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT.buildWeeks)
    expect(done.placement.facilities.every((p) => p.status === 'operational')).toBe(true)
    expect(blueprintInstanceCount(done.placement, ANNEX)).toBe(2) // operational counts

    // Another blueprint's id counts none of them.
    expect(blueprintInstanceCount(done.placement, 'some-other-blueprint')).toBe(0)
  })

  it('never counts a founding structure — property is not a placement', () => {
    // Eight authored bodies stand on the property from week zero. None of them is
    // a placement, so no blueprint's allowance is consumed by the studio simply
    // existing. A one-per-studio building is still buildable on a fresh lot.
    const state = managedStudio('c1-m2-structures-dont-count')
    expect(state.property.structures).toHaveLength(8)
    expect(state.placement.facilities).toHaveLength(0)
    for (const blueprint of FACILITY_BLUEPRINTS) {
      expect(blueprintInstanceCount(state.placement, blueprint.id)).toBe(0)
    }
    const onePerStudio = synthetic({ id: 'one-per-studio', maxInstances: 1 })
    expect(blueprintAtInstanceLimit(state.placement, onePerStudio)).toBe(false)
  })

  it('reports an absent allowance as unlimited, and never blocks on it', () => {
    const unlimited = synthetic({ id: 'unlimited' })
    expect(blueprintMaxInstances(unlimited)).toBeNull()
    const many = advance(
      commitPlacement(
        commitPlacement(withCash(managedStudio('c1-m2-unlimited'), 50_000_000), {
          blueprintId: ANNEX,
          origin: LEGAL_ORIGIN,
        }),
        { blueprintId: ANNEX, origin: SECOND_ORIGIN },
      ),
      1,
    )
    expect(blueprintAtInstanceLimit(many.placement, unlimited)).toBe(false)
    // The shipped Annex is unlimited, which is its proven V11 behaviour.
    expect(blueprintMaxInstances(DEVELOPMENT_CASTING_ANNEX_BLUEPRINT)).toBeNull()
    expect(blueprintAtInstanceLimit(many.placement, DEVELOPMENT_CASTING_ANNEX_BLUEPRINT)).toBe(
      false,
    )
  })

  it('binds at exactly the authored allowance', () => {
    const rich = withCash(managedStudio('c1-m2-limit-binds'), 50_000_000)
    const one = commitPlacement(rich, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    const two = commitPlacement(withCash(one, 50_000_000), {
      blueprintId: ANNEX,
      origin: SECOND_ORIGIN,
    })
    // A blueprint sharing the Annex's id, limited to N, sees the Annex's count.
    const limitedTo1 = synthetic({ id: ANNEX, maxInstances: 1 })
    const limitedTo2 = synthetic({ id: ANNEX, maxInstances: 2 })
    const limitedTo3 = synthetic({ id: ANNEX, maxInstances: 3 })
    expect(blueprintAtInstanceLimit(rich.placement, limitedTo1)).toBe(false)
    expect(blueprintAtInstanceLimit(one.placement, limitedTo1)).toBe(true)
    expect(blueprintAtInstanceLimit(one.placement, limitedTo2)).toBe(false)
    expect(blueprintAtInstanceLimit(two.placement, limitedTo2)).toBe(true)
    expect(blueprintAtInstanceLimit(two.placement, limitedTo3)).toBe(false)
  })
})

describe('C1-M2 — placement integration and the binding rejection order', () => {
  it('pins the two new codes into the binding order, before money', () => {
    const order = [...PLACEMENT_REJECTION_ORDER]
    expect(order.indexOf('requirementsUnmet')).toBeGreaterThan(order.indexOf('seversLot'))
    expect(order.indexOf('instanceLimit')).toBeGreaterThan(order.indexOf('requirementsUnmet'))
    expect(order.indexOf('insufficientFunds')).toBeGreaterThan(order.indexOf('instanceLimit'))
    // Money stays last, always.
    expect(order.at(-1)).toBe('insufficientFunds')
  })

  it('rejects a locked blueprint through the real rule engine, and says why', () => {
    const state = withCash(managedStudio('c1-m2-query-locked'), 5_000_000)
    const locked = synthetic({
      id: 'locked',
      requires: [
        { kind: 'date', week: 60 },
        { kind: 'certificate', certificateId: 'First Hit' },
      ],
    })
    const quote = quoteForBlueprint(state, locked, LEGAL_ORIGIN)
    expect(quote.ok).toBe(false)
    expect(quote.rejections).toEqual(['requirementsUnmet'])
    expect(quote.primary).toBe('requirementsUnmet')
    // The copy rides on the quote, so a preview never has to re-derive it.
    expect(quote.unmetRequirements.map((entry) => entry.reason)).toEqual([
      'Available from Week 60.',
      'Requires the First Hit certificate. Certificates are not part of the game yet.',
    ])
    // Everything else about the quote is still fully computed — the query never
    // fails fast, so a preview can still paint the footprint.
    expect(quote.cells).toHaveLength(6)
    expect(quote.cellLegality.every((verdict) => verdict.ok)).toBe(true)
    expect(quote.cost).toBe(locked.capex)
  })

  it('rejects a blueprint that has used up its allowance', () => {
    const rich = withCash(managedStudio('c1-m2-query-limit'), 50_000_000)
    const one = commitPlacement(rich, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    const limited = synthetic({ id: ANNEX, maxInstances: 1, requires: [] })
    const quote = quoteForBlueprint(withCash(one, 50_000_000), limited, SECOND_ORIGIN)
    expect(quote.rejections).toEqual(['instanceLimit'])
    expect(quote.primary).toBe('instanceLimit')
    expect(quote.instanceCount).toBe(1)
    expect(quote.maxInstances).toBe(1)
    expect(quote.unmetRequirements).toEqual([])
  })

  it('orders requirementsUnmet ≻ instanceLimit ≻ insufficientFunds', () => {
    // One blueprint that fails all three at once, on legal ground.
    const rich = withCash(managedStudio('c1-m2-order-all'), 50_000_000)
    const one = commitPlacement(rich, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    const broke = withCash(one, 0)

    const allThree = synthetic({
      id: ANNEX,
      maxInstances: 1,
      capex: 9_000_000,
      requires: [{ kind: 'award', awardId: 'Best Picture' }],
    })
    const quote = quoteForBlueprint(broke, allThree, SECOND_ORIGIN)
    expect(quote.rejections).toEqual([
      'requirementsUnmet',
      'instanceLimit',
      'insufficientFunds',
    ])
    expect(quote.primary).toBe('requirementsUnmet')

    // Drop the requirement: the limit becomes primary, money still last.
    const twoOfThree = synthetic({ ...allThree, id: ANNEX, requires: [] })
    const limitQuote = quoteForBlueprint(broke, twoOfThree, SECOND_ORIGIN)
    expect(limitQuote.rejections).toEqual(['instanceLimit', 'insufficientFunds'])
    expect(limitQuote.primary).toBe('instanceLimit')

    // Drop the limit too: only money is left.
    const moneyOnly = synthetic({ ...twoOfThree, id: 'money-only' })
    delete (moneyOnly as { maxInstances?: number }).maxInstances
    const moneyQuote = quoteForBlueprint(broke, moneyOnly, SECOND_ORIGIN)
    expect(moneyQuote.rejections).toEqual(['insufficientFunds'])
    expect(moneyQuote.primary).toBe('insufficientFunds')
  })

  it('lets every domain cell failure outrank all three', () => {
    // One Annex already stands, so a one-per-studio blueprint sharing its id is
    // genuinely at its limit — all three studio-scope facts are true at once.
    const rich = withCash(managedStudio('c1-m2-order-domain'), 50_000_000)
    const broke = withCash(
      commitPlacement(rich, { blueprintId: ANNEX, origin: LEGAL_ORIGIN }),
      0,
    )
    const worst = synthetic({
      id: ANNEX,
      maxInstances: 1,
      capex: 9_000_000,
      requires: [{ kind: 'award', awardId: 'Best Picture' }],
    })
    // Off the property entirely: geometry outranks everything.
    const off = quoteForBlueprint(broke, worst, { gx: -5, gy: -5 })
    expect(off.primary).toBe('offLot')
    expect(off.rejections).toContain('requirementsUnmet')
    expect(off.rejections).toContain('insufficientFunds')
    // Owned but protected ground.
    const blocked = quoteForBlueprint(broke, worst, { gx: 7, gy: 10 })
    expect(blocked.primary).toBe('terrainUnbuildable')
    // Unclaimed ground inside the property.
    const unowned = quoteForBlueprint(broke, worst, { gx: 9, gy: 2 })
    expect(unowned.primary).toBe('notOwned')
    // Owned, buildable, but unserved by road.
    const noRoad = quoteForBlueprint(broke, worst, { gx: 22, gy: 1 })
    expect(noRoad.primary).toBe('noRoadAccess')
    // In every case the studio-scope facts are still REPORTED, just outranked —
    // the query never fails fast, so a caller sees the whole picture.
    for (const quote of [off, blocked, unowned, noRoad]) {
      expect(quote.rejections).toContain('requirementsUnmet')
      expect(quote.rejections).toContain('instanceLimit')
      expect(quote.rejections).toContain('insufficientFunds')
    }
  })

  it('opens the gate the moment its requirement is met, with no other change', () => {
    const state = withCash(managedStudio('c1-m2-gate-opens'), 5_000_000)
    const gated = synthetic({ id: 'gated', requires: [{ kind: 'date', week: 4 }] })

    const before = quoteForBlueprint(state, gated, LEGAL_ORIGIN)
    expect(before.ok).toBe(false)
    expect(before.primary).toBe('requirementsUnmet')

    const after = quoteForBlueprint(advance(state, 4), gated, LEGAL_ORIGIN)
    expect(after.ok).toBe(true)
    expect(after.rejections).toEqual([])
    expect(after.unmetRequirements).toEqual([])
  })
})

describe('C1-M2 — the shipped Annex is unchanged', () => {
  it('quotes identically across the WHOLE parcel map, gates and all', () => {
    // The schema must be behaviour-neutral for the one blueprint that ships. An
    // unconditional, unlimited blueprint has to produce exactly the verdicts it
    // produced before the schema existed — swept over every origin, not sampled.
    const state = withCash(managedStudio('c1-m2-annex-neutral'), 5_000_000)
    let evaluated = 0
    let legal = 0
    for (let gy = -1; gy <= 26; gy++) {
      for (let gx = -1; gx <= 28; gx++) {
        const quote = queryPlacement(state, { blueprintId: ANNEX, origin: { gx, gy } })
        evaluated++
        if (quote.ok) legal++
        // Neither new code can EVER appear for this blueprint.
        expect(quote.rejections).not.toContain('requirementsUnmet')
        expect(quote.rejections).not.toContain('instanceLimit')
        expect(quote.unmetRequirements).toEqual([])
        expect(quote.maxInstances).toBeNull()
        expect(quote.instanceCount).toBe(0)
      }
    }
    expect(evaluated).toBe(30 * 28)
    expect(legal).toBeGreaterThan(0)
  })

  it('stays unlimited after several builds, exactly as V11 proved', () => {
    let state = withCash(managedStudio('c1-m2-annex-unlimited'), 50_000_000)
    for (const origin of [LEGAL_ORIGIN, SECOND_ORIGIN, { gx: 0, gy: 12 }]) {
      state = commitPlacement(withCash(state, 50_000_000), { blueprintId: ANNEX, origin })
    }
    expect(state.placement.facilities).toHaveLength(3)
    const quote = queryPlacement(state, { blueprintId: ANNEX, origin: { gx: 3, gy: 19 } })
    expect(quote.instanceCount).toBe(3)
    expect(quote.maxInstances).toBeNull()
    expect(quote.rejections).not.toContain('instanceLimit')
    expect(quote.ok).toBe(true)
  })

  it('reports the Annex as available and buildable in the catalog read model', () => {
    const view = studioPlacementView(withCash(managedStudio('c1-m2-catalog'), 5_000_000))
    expect(view.catalog).toHaveLength(5)
    expect(view.catalog[0]).toMatchObject({
      blueprintId: ANNEX,
      available: true,
      unmet: [],
      instanceCount: 0,
      maxInstances: null,
      atInstanceLimit: false,
      affordable: true,
      buildable: true,
    })
    // Broke: still unlocked and within its allowance, just not affordable.
    const poor = studioPlacementView(withCash(managedStudio('c1-m2-catalog-poor'), 0))
    expect(poor.catalog[0]).toMatchObject({
      available: true,
      atInstanceLimit: false,
      affordable: false,
      buildable: false,
    })
  })

  it('keeps a refused commit byte-neutral without any new code', () => {
    // commitPlacement re-queries, so the new rules protect the commit path for
    // free. Proved on the one blueprint that can reach it: an unaffordable build.
    const broke = withCash(managedStudio('c1-m2-commit-neutral'), 0)
    const after = commitPlacement(broke, { blueprintId: ANNEX, origin: LEGAL_ORIGIN })
    expect(after).toBe(broke) // the SAME object, by reference
  })
})
