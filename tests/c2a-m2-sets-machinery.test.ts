// ── C2a-M2 — the life of a Set (charter §3.1) ────────────────────────────────
//
// Commission, build, repair, strike, and the two holds a set makes on the
// studio's capacity. What this suite is really proving is that a Set behaves like
// a first-class entity with a capital life — committed, maintained, recovered —
// and that every refusal it can produce is a sentence a player could act on.

import { describe, expect, it } from 'vitest'
import {
  SET_BLUEPRINTS,
  TUNING,
  applyActions,
  assertSetsInvariants,
  bindableSetsOnStage,
  commissionSetRefusal,
  facilityEngagements,
  generateWorld,
  repairSetRefusal,
  setBlueprintById,
  setById,
  setCommissionRefusalCopy,
  setDemolitionRefund,
  setGenreFit,
  setIsUnderRepair,
  setIsUsable,
  setMountedOn,
  setNoveltyReceptionFactor,
  setBindingUplift,
  setRepairRefusalCopy,
  setStrikeRefusalCopy,
  strikeSetRefusal,
  tick,
} from '../src/core/index.js'
import type { GameState, StudioSet } from '../src/core/index.js'

const STAGE_7 = 'facility-soundstage-07'
const STAGE_12 = 'facility-soundstage-12'
const GRAVEYARD = 'set-graveyard'
const HOUSE = 'set-house-generic'

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

/** A managed studio with Stage 12 cleared for building on. */
function clearedStage12(seed: string): GameState {
  const state = withCash(managedStudio(seed), 50_000_000)
  return applyActions(state, [{ kind: 'strikeSet', setId: setMountedOn(state.sets, STAGE_12)!.id }])
}

describe('C2a-M2 — commissioning a set', () => {
  it('refuses UP FRONT and holds nothing when the stage is already dressed', () => {
    const state = withCash(managedStudio('m2-commission-dressed'), 50_000_000)
    const refusal = commissionSetRefusal(state, {
      blueprintId: GRAVEYARD,
      stageFacilityId: STAGE_7,
    })
    expect(refusal).toEqual({
      code: 'stageAlreadyDressed',
      stageFacilityId: STAGE_7,
      setId: 'set-0',
      setName: 'Stage 7 House Set',
    })
    // …and the state is genuinely untouched: no set, no capex, no cash moved.
    expect(() =>
      applyActions(state, [
        { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_7 } },
      ]),
    ).toThrow(/already standing on Soundstage 7/)
    expect(state.sets).toHaveLength(2)
    expect(state.ledger.some((entry) => entry.kind === 'setCapex')).toBe(false)
  })

  it('refuses an unknown stage, an unknown blueprint, and an unaffordable build', () => {
    const rich = withCash(managedStudio('m2-commission-refusals'), 50_000_000)
    const cleared = clearedStage12('m2-commission-refusals')
    expect(
      commissionSetRefusal(rich, { blueprintId: GRAVEYARD, stageFacilityId: 'facility-post-building' }),
    ).toEqual({ code: 'unknownStage', stageFacilityId: 'facility-post-building' })
    expect(
      commissionSetRefusal(cleared, { blueprintId: 'set-nope', stageFacilityId: STAGE_12 }),
    ).toEqual({ code: 'unknownBlueprint', blueprintId: 'set-nope' })
    const broke = withCash(cleared, 1_000)
    expect(
      commissionSetRefusal(broke, { blueprintId: GRAVEYARD, stageFacilityId: STAGE_12 }),
    ).toMatchObject({ code: 'insufficientFunds' })
  })

  it('refuses when every scenery crew is already working', () => {
    let state = clearedStage12('m2-commission-crews')
    // Both founding scenery slots taken by sets going up: strike the Stage 7 set
    // too, then start one build on each stage. FOUNDING_SCENERY_CAPACITY is 2.
    state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
    state = applyActions(state, [
      { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_7 } },
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-courtroom', stageFacilityId: STAGE_12 },
      },
    ])
    expect(state.sets.filter((set) => set.status === 'under-construction')).toHaveLength(2)
    // Both founding stages are now dressed, so the MOUNT would refuse a third
    // build before the crew ever did. Ask the refusal probe about a stage that is
    // free, so the answer is about the crew and only the crew.
    const withThirdStage: GameState = {
      ...state,
      operations: {
        ...state.operations,
        facilities: [
          ...state.operations.facilities,
          {
            id: 'facility-stage-9',
            name: 'Soundstage 9',
            capability: 'soundstage' as const,
            capacity: 1,
          },
        ],
      },
    }
    expect(
      commissionSetRefusal(withThirdStage, {
        blueprintId: 'set-city-street',
        stageFacilityId: 'facility-stage-9',
      }),
    ).toEqual({ code: 'noSceneryCapacity' })
  })

  it('takes a scenery crew, charges capital, and comes up standing on its week', () => {
    const state = clearedStage12('m2-commission-build')
    const blueprint = setBlueprintById(GRAVEYARD)!
    const cashBefore = state.studio.cash
    const commissioned = applyActions(state, [
      { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_12 } },
    ])

    const built = setMountedOn(commissioned.sets, STAGE_12)!
    expect(built.status).toBe('under-construction')
    expect(built.completesWeek).toBe(commissioned.market.tick + blueprint.buildWeeks)
    expect(built.blueprintId).toBe(GRAVEYARD)
    expect(built.setType).toBe(blueprint.setType)
    expect(built.quality).toBe(blueprint.quality)
    // Nothing is standing yet, so it is neither fresh nor whole.
    expect(built.novelty).toBe(0)
    expect(built.condition).toBe(0)
    expect(setIsUnderRepair(built)).toBe(false)
    expect(setIsUsable(built)).toBe(false)

    // Capital committed once, on its own auditable kind.
    expect(commissioned.studio.cash).toBe(cashBefore - blueprint.capex)
    const capex = commissioned.ledger.filter((entry) => entry.kind === 'setCapex')
    expect(capex).toHaveLength(1)
    expect(capex[0]!.amount).toBe(-blueprint.capex)
    expect(capex[0]!.note).toBe('Graveyard — set construction')

    // The crew is genuinely engaged: the shop cannot be demolished under it.
    const engagements = facilityEngagements(commissioned, 'facility-scenery-shop')
    expect(engagements.some((held) => held.kind === 'set' && held.activity === 'building a set')).toBe(
      true,
    )

    // …and it stands on the week it promised, not before.
    const dayBefore = advance(commissioned, blueprint.buildWeeks - 1)
    expect(setById(dayBefore.sets, built.id)!.status).toBe('under-construction')
    const done = advance(dayBefore, 1)
    const standing = setById(done.sets, built.id)!
    expect(standing.status).toBe('standing')
    expect(standing.completesWeek).toBeNull()
    expect(standing.novelty).toBe(TUNING.SET_NOVELTY_INITIAL)
    expect(standing.condition).toBe(TUNING.SET_CONDITION_INITIAL)
    expect(setIsUsable(standing)).toBe(true)
    // Permanent history: the set went up, and that is a matter of record.
    expect(
      done.studioEvents.rows.filter(
        (row) => row.kind === 'setBuilt' && row.setId === built.id,
      ),
    ).toHaveLength(1)
    // The crew went home.
    expect(facilityEngagements(done, 'facility-scenery-shop')).toHaveLength(0)
  })

  it('mints a unique, player-legible name for every set', () => {
    let state = clearedStage12('m2-commission-names')
    state = applyActions(state, [
      { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_12 } },
    ])
    const first = setMountedOn(state.sets, STAGE_12)!
    expect(first.name).toBe('Graveyard')
    // Strike it and build the same class again: the second one is numbered, so no
    // two sets can ever share the name the cash ledger carries.
    state = applyActions(state, [{ kind: 'strikeSet', setId: first.id }])
    state = applyActions(state, [
      { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_12 } },
    ])
    const second = setMountedOn(state.sets, STAGE_12)!
    expect(second.name).toBe('Graveyard 3')
    expect(new Set(state.sets.map((set) => set.name)).size).toBe(state.sets.length)
  })

  it('never rolls the set-id counter back, even when every set is struck', () => {
    let state = clearedStage12('m2-commission-monotonic')
    const afterStrike = state.nextSetId
    state = applyActions(state, [{ kind: 'strikeSet', setId: 'set-0' }])
    expect(state.nextSetId).toBe(afterStrike)
    state = applyActions(state, [
      { kind: 'commissionSet', commission: { blueprintId: GRAVEYARD, stageFacilityId: STAGE_7 } },
    ])
    expect(state.nextSetId).toBe(afterStrike + 1)
    expect(state.sets.map((set) => set.id)).toEqual(['set-0', 'set-1', 'set-2'])
  })
})

describe('C2a-M2 — striking a set', () => {
  it('is instant, refunds a depreciated fraction, and records the retirement', () => {
    const state = withCash(managedStudio('m2-strike'), 50_000_000)
    const house = setById(state.sets, 'set-1')!
    const refund = setDemolitionRefund(setBlueprintById(HOUSE)!)
    const cashBefore = state.studio.cash
    const struck = applyActions(state, [{ kind: 'strikeSet', setId: house.id }])

    expect(TUNING.SET_STRIKE_WEEKS).toBe(0)
    expect(struck.market.tick).toBe(state.market.tick)
    expect(setById(struck.sets, house.id)!.status).toBe('retired')
    expect(struck.studio.cash).toBe(cashBefore + refund)
    // Strictly lossy: the refund can never exceed what was paid.
    expect(refund).toBeLessThan(setBlueprintById(HOUSE)!.capex)
    const row = struck.ledger.filter((entry) => entry.kind === 'setDemolitionRefund')
    expect(row).toHaveLength(1)
    expect(row[0]!.amount).toBe(refund)
    expect(row[0]!.note).toBe('Stage 12 House Set — set struck')
    const retired = struck.studioEvents.rows.filter((event) => event.kind === 'setRetired')
    expect(retired).toHaveLength(1)
    expect(retired[0]).toMatchObject({ setId: house.id, refund })
    // The stage is clear the same week.
    expect(setMountedOn(struck.sets, STAGE_12)).toBeNull()
  })

  it('refuses a set that is already struck, and one it has never heard of', () => {
    const state = applyActions(withCash(managedStudio('m2-strike-refuse'), 50_000_000), [
      { kind: 'strikeSet', setId: 'set-0' },
    ])
    expect(strikeSetRefusal(state, 'set-0')).toEqual({ code: 'alreadyRetired', setId: 'set-0' })
    expect(strikeSetRefusal(state, 'set-99')).toEqual({ code: 'unknownSet', setId: 'set-99' })
  })

  it('keeps a stage undemolishable while a set stands on it', () => {
    const state = withCash(managedStudio('m2-strike-mount'), 50_000_000)
    const held = facilityEngagements(state, STAGE_7)
    expect(held.some((engagement) => engagement.kind === 'set')).toBe(true)
    expect(held.find((engagement) => engagement.kind === 'set')!.activity).toBe(
      'a set standing on this stage',
    )
  })
})

describe('C2a-M2 — repairing a set', () => {
  function worn(seed: string, condition: number): GameState {
    const state = withCash(managedStudio(seed), 50_000_000)
    return {
      ...state,
      sets: state.sets.map((set) => (set.id === 'set-1' ? { ...set, condition } : set)),
    }
  }

  it('refuses a set that is already whole', () => {
    const state = withCash(managedStudio('m2-repair-whole'), 50_000_000)
    expect(repairSetRefusal(state, 'set-1')).toEqual({ code: 'alreadyWhole', setId: 'set-1' })
  })

  it('takes a crew, charges maintenance, and comes back whole on its week', () => {
    const state = worn('m2-repair', 40)
    const cashBefore = state.studio.cash
    expect(repairSetRefusal(state, 'set-1')).toBeNull()
    const ordered = applyActions(state, [{ kind: 'repairSet', setId: 'set-1' }])

    const under = setById(ordered.sets, 'set-1')!
    expect(under.status).toBe('under-construction')
    expect(under.completesWeek).toBe(ordered.market.tick + TUNING.SET_REPAIR_WEEKS)
    // THE DISCRIMINATOR: a repair keeps its worn condition, so it is not a build.
    expect(under.condition).toBe(40)
    expect(setIsUnderRepair(under)).toBe(true)

    expect(ordered.studio.cash).toBe(cashBefore - TUNING.SET_REPAIR_COST)
    const maintenance = ordered.ledger.filter((entry) => entry.kind === 'setMaintenance')
    expect(maintenance).toHaveLength(1)
    expect(maintenance[0]!.amount).toBe(-TUNING.SET_REPAIR_COST)
    expect(maintenance[0]!.note).toBe('Stage 12 House Set — set repair')

    const done = advance(ordered, TUNING.SET_REPAIR_WEEKS)
    const repaired = setById(done.sets, 'set-1')!
    expect(repaired.status).toBe('standing')
    expect(repaired.condition).toBe(TUNING.SET_CONDITION_INITIAL)
    // Repainting a set does not make the audience forget it.
    expect(repaired.novelty).toBe(setById(state.sets, 'set-1')!.novelty)
    // And a repair is NOT a build: the studio's permanent history gains nothing.
    expect(done.studioEvents.rows.some((row) => row.kind === 'setBuilt')).toBe(false)
  })

  it('gates USE below the threshold, and repair is the way back', () => {
    const unusable = worn('m2-repair-gate', TUNING.SET_CONDITION_UNUSABLE_THRESHOLD - 1)
    expect(setIsUsable(setById(unusable.sets, 'set-1')!)).toBe(false)
    expect(bindableSetsOnStage(unusable, STAGE_12)).toEqual([])
    const repaired = advance(
      applyActions(unusable, [{ kind: 'repairSet', setId: 'set-1' }]),
      TUNING.SET_REPAIR_WEEKS,
    )
    expect(bindableSetsOnStage(repaired, STAGE_12).map((set) => set.id)).toEqual(['set-1'])
  })
})

describe('C2a-M2 — every refusal is a sentence a player can act on', () => {
  it('says what happened and what to do, in filmmaking words', () => {
    const copies = [
      setCommissionRefusalCopy(
        { code: 'stageAlreadyDressed', stageFacilityId: STAGE_7, setId: 'set-0', setName: 'Graveyard' },
        { stageName: 'Soundstage 7' },
      ),
      setCommissionRefusalCopy({ code: 'noSceneryCapacity' }, {}),
      setCommissionRefusalCopy({ code: 'insufficientFunds', cost: 1, cash: 0 }, {}),
      setCommissionRefusalCopy({ code: 'notManaged' }, {}),
      setCommissionRefusalCopy({ code: 'unknownBlueprint', blueprintId: 'x' }, {}),
      setCommissionRefusalCopy({ code: 'unknownStage', stageFacilityId: 'x' }, {}),
      setRepairRefusalCopy({ code: 'setInUse', setId: 'set-0', productionId: 'p' }, { setName: 'Graveyard' }),
      setRepairRefusalCopy({ code: 'alreadyWhole', setId: 'set-0' }, { setName: 'Graveyard' }),
      setRepairRefusalCopy({ code: 'notStanding', setId: 'set-0' }, {}),
      setRepairRefusalCopy({ code: 'unknownSet', setId: 'set-0' }, {}),
      setRepairRefusalCopy({ code: 'notManaged' }, {}),
      setRepairRefusalCopy({ code: 'noSceneryCapacity' }, {}),
      setRepairRefusalCopy({ code: 'insufficientFunds', cost: 1, cash: 0 }, {}),
      setStrikeRefusalCopy({ code: 'setInUse', setId: 'set-0', productionId: 'p' }, { setName: 'Graveyard' }),
      setStrikeRefusalCopy({ code: 'alreadyRetired', setId: 'set-0' }, { setName: 'Graveyard' }),
      setStrikeRefusalCopy({ code: 'unknownSet', setId: 'set-0' }, {}),
      setStrikeRefusalCopy({ code: 'notManaged' }, {}),
    ]
    for (const copy of copies) {
      for (const sentence of [copy.reason, copy.remedy]) {
        expect(sentence.trim().length).toBeGreaterThan(0)
        expect(sentence.trim().endsWith('.')).toBe(true)
        // No engine vocabulary reaches a player (the professional-tycoon floor).
        expect(sentence).not.toMatch(
          /facility-|set-\d|blueprintId|setId|capability|reservation|workflow|TUNING|null|undefined/,
        )
      }
    }
  })
})

describe('C2a-M2 — the wired stat block, bounded', () => {
  const sample = (over: Partial<StudioSet>): StudioSet => ({
    id: 'set-x',
    name: 'Sample',
    blueprintId: GRAVEYARD,
    mountedOn: STAGE_7,
    setType: 'graveyard',
    status: 'standing',
    completesWeek: null,
    quality: 50,
    novelty: 1,
    condition: 100,
    genreWeights: setBlueprintById(GRAVEYARD)!.genreWeights,
    priorityGenre: 'horror',
    ...over,
  })

  it('keeps FIT inside 0..1 even at the top of the weight ladder plus the bonus', () => {
    for (const blueprint of SET_BLUEPRINTS) {
      const set = sample({
        genreWeights: blueprint.genreWeights,
        priorityGenre: blueprint.priorityGenre,
      })
      for (const genre of Object.keys(blueprint.genreWeights) as (keyof typeof blueprint.genreWeights)[]) {
        const fit = setGenreFit(set, genre)
        expect(fit).toBeGreaterThanOrEqual(0)
        expect(fit).toBeLessThanOrEqual(1)
      }
      // The priority genre is always at least as good a fit as any other.
      const best = setGenreFit(set, blueprint.priorityGenre)
      for (const genre of Object.keys(blueprint.genreWeights) as (keyof typeof blueprint.genreWeights)[]) {
        expect(best).toBeGreaterThanOrEqual(setGenreFit(set, genre))
      }
    }
  })

  it('keeps the UPLIFT inside its two authored maxima, at every extreme', () => {
    const max = TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX
    const extremes = [
      sample({ quality: 0, genreWeights: { ...sample({}).genreWeights, horror: 0 }, priorityGenre: 'comedy' }),
      sample({ quality: 100, priorityGenre: 'horror' }),
      sample({ quality: 100, genreWeights: { ...sample({}).genreWeights, horror: 1 }, priorityGenre: 'horror' }),
      sample({ quality: -50 as number }),
      sample({ quality: 500 as number }),
    ]
    for (const set of extremes) {
      const uplift = setBindingUplift(set, 'horror')
      expect(uplift).toBeGreaterThanOrEqual(0)
      expect(uplift).toBeLessThanOrEqual(max)
    }
    // The very best possible set reaches exactly the authored ceiling.
    expect(
      setBindingUplift(
        sample({ quality: 100, genreWeights: { ...sample({}).genreWeights, horror: 1 }, priorityGenre: 'horror' }),
        'horror',
      ),
    ).toBeCloseTo(max, 10)
  })

  it('keeps the NOVELTY factor inside its floor and exactly 1 when fresh', () => {
    // Exactly 1.0 — a bit-exact IEEE no-op, which is what makes a fresh set
    // byte-identical rather than merely equal.
    expect(setNoveltyReceptionFactor(1)).toBe(1)
    expect(setNoveltyReceptionFactor(null)).toBe(1)
    expect(setNoveltyReceptionFactor(0)).toBe(TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN)
    for (const novelty of [-1, 0, 0.25, 0.5, 0.75, 1, 2]) {
      const factor = setNoveltyReceptionFactor(novelty)
      expect(factor).toBeGreaterThanOrEqual(TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN)
      expect(factor).toBeLessThanOrEqual(1)
    }
  })
})

describe('C2a-M2 — the sets invariant', () => {
  it('refuses two sets on one stage, and a set standing on no stage at all', () => {
    const state = withCash(managedStudio('m2-invariant'), 50_000_000)
    expect(() => assertSetsInvariants(state)).not.toThrow()
    const doubled: GameState = {
      ...state,
      sets: [...state.sets, { ...state.sets[0]!, id: 'set-9' }],
      nextSetId: 10,
    }
    expect(() => assertSetsInvariants(doubled)).toThrow(/both stand on/)
    const homeless: GameState = {
      ...state,
      sets: state.sets.map((set) =>
        set.id === 'set-0' ? { ...set, mountedOn: 'facility-post-building' } : set,
      ),
    }
    expect(() => assertSetsInvariants(homeless)).toThrow(/mounted on no soundstage/)
  })

  it('refuses a standing set with no condition — the build/repair discriminator', () => {
    const state = withCash(managedStudio('m2-invariant-condition'), 50_000_000)
    const forged: GameState = {
      ...state,
      sets: state.sets.map((set) => (set.id === 'set-0' ? { ...set, condition: 0 } : set)),
    }
    expect(() => assertSetsInvariants(forged)).toThrow(/has no condition/)
  })

  it('holds a legacy world to an empty sets root', () => {
    const legacy = generateWorld('m2-invariant-legacy')
    expect(legacy.operations.mode).toBe('legacy')
    expect(() => assertSetsInvariants(legacy)).not.toThrow()
    expect(() => assertSetsInvariants({ ...legacy, nextSetId: 3 })).toThrow(/minted a set id/)
  })
})
