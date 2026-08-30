// ── C2a-M2 — the stage+set composite, and what a bound set gives a picture ───
//
// The player-facing payoff of the whole milestone: a picture no longer merely
// occupies a soundstage, it stands on a NAMED SET, and which set it stands on
// changes what the film becomes and how many people turn up to see it.
//
// Four laws under test, all from charter §3.1/§3.2:
//   * the stage and the set are acquired ATOMICALLY at rehearsal entry, and both
//     are retained through shooting;
//   * a picture with a stage and no scenery gets `set-unavailable`, which is a
//     DIFFERENT refusal from having no stage — because the remedies differ;
//   * quality and fit become ONE bounded uplift, LOCKED at bind;
//   * novelty is locked at bind, depleted at RELEASE, and never by a cancellation.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  TUNING,
  applyActions,
  beginFounding,
  bindableSetsOnStage,
  generateWorld,
  setBindingUplift,
  setById,
  setNoveltyReceptionFactor,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  Genre,
  SegmentId,
  StudioSet,
  Talent,
} from '../src/core/index.js'

const STAGE_7 = 'facility-soundstage-07'
const STAGE_12 = 'facility-soundstage-12'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  // Enough for TWO simultaneous packages, so the contention cases below can put
  // two pictures on the lot without reusing a single body twice.
  const hires = [
    ...byRole(pool, 'actor').slice(0, Math.max(FOUNDING_MINIMUMS.actor, 6)),
    ...byRole(pool, 'director').slice(0, Math.max(FOUNDING_MINIMUMS.director, 2)),
    ...byRole(pool, 'writer').slice(0, Math.max(FOUNDING_MINIMUMS.writer, 2)),
    ...byRole(pool, 'craft').slice(0, Math.max(FOUNDING_MINIMUMS.craft, 2)),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 104 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
}

function assignment(state: GameState, offset = 0) {
  const population =
    state.contracts.length > 0
      ? state.contracts.map(
          (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
        )
      : state.talent
  const actors = byRole(population, 'actor')
  return {
    writerId: byRole(population, 'writer')[offset]!.id,
    directorId: byRole(population, 'director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole(population, 'craft')[offset]!.id],
  }
}

function productionPayload(state: GameState, offset = 0) {
  const concept = state.concepts[offset]!
  return {
    conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'] as SegmentId[],
      ranges: {
        intimacy: [-0.5, 0.5] as [number, number],
        tonalWeight: [-0.5, 0.5] as [number, number],
        kineticEnergy: [-0.5, 0.5] as [number, number],
      },
    },
    ...assignment(state, offset),
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

function operationsStudio(seed: string): GameState {
  return applyActions(foundedStudio(seed), [{ kind: 'activateStudioOperations' }])
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

/** A greenlit picture, advanced to the week it enters Rehearsal. */
function atRehearsal(seed: string): GameState {
  let state = withCash(operationsStudio(seed), 60_000_000)
  state = applyActions(state, [
    { kind: 'greenlight', production: productionPayload(state) },
  ])
  state = tick(state) // the greenlight tick does not advance the picture
  state = tick(state) // Development → Pre-production
  state = tick(state) // Pre-production → Rehearsal
  return state
}

function workflowOf(state: GameState, index = 0) {
  return state.operations.workflows[index]!
}

function genreOf(state: GameState, productionId: string): Genre {
  const production = state.studio.activeProductions.find(
    (candidate) => candidate.id === productionId,
  )!
  return state.concepts.find((concept) => concept.id === production.conceptId)!.genre
}

describe('C2a-M2 — the marker at greenlight', () => {
  it('is true for a managed greenlight, and stays false where the charter says it must', () => {
    const state = withCash(operationsStudio('m2-marker'), 60_000_000)
    const greenlit = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state) },
    ])
    expect(workflowOf(greenlit).bindings.requiresSetBinding).toBe(true)
    // …and nothing is bound YET: a greenlight opens in Development, which holds
    // no stage, so the marker is a promise about rehearsal rather than a claim.
    expect(workflowOf(greenlit).bindings.setId).toBeNull()
    expect(workflowOf(greenlit).bindings.lockedUplift).toBeNull()
    expect(workflowOf(greenlit).bindings.lockedNovelty).toBeNull()

    // A DIRECTLY-CONSTRUCTED state — one assembled field by field rather than
    // founded — is untouched (§3.1), and `nextSetId` is the fact that says so:
    // no set has ever existed in that world.
    const handmade: GameState = { ...state, sets: [], nextSetId: 0 }
    const handmadeGreenlight = applyActions(handmade, [
      { kind: 'greenlight', production: productionPayload(handmade) },
    ])
    expect(workflowOf(handmadeGreenlight).bindings.requiresSetBinding).toBe(false)
  })
})

describe('C2a-M2 — the stage+set composite at rehearsal entry', () => {
  it('AUTO-BINDS the one candidate set, and locks both numbers', () => {
    const state = atRehearsal('m2-bind-auto')
    const workflow = workflowOf(state)
    expect(workflow.phase).toBe('rehearsal')

    // Exactly one candidate on the stage it took — the endowment's house set —
    // so the bind is automatic (§3.1) and the player is never asked a question
    // with one answer.
    expect(bindableSetsOnStage(state, workflow.bindings.stageFacilityId!).length).toBeLessThanOrEqual(
      1,
    )
    const set = setById(state.sets, workflow.bindings.setId!)!
    expect(set.mountedOn).toBe(workflow.bindings.stageFacilityId)
    expect(set.status).toBe('standing')

    // BOTH numbers locked at the moment of binding, from the set as it stood.
    expect(workflow.bindings.lockedNovelty).toBe(set.novelty)
    expect(workflow.bindings.lockedUplift).toBe(
      setBindingUplift(set, genreOf(state, workflow.productionId)),
    )
    expect(workflow.bindings.lockedUplift).toBeGreaterThan(0)
    expect(workflow.bindings.lockedUplift).toBeLessThanOrEqual(
      TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX,
    )
    expect(workflow.bindings.heldSinceWeek).toBe(state.market.tick - 1)
  })

  it('retains the SAME stage and the SAME set through shooting, and nothing moves', () => {
    const rehearsing = atRehearsal('m2-bind-sticky')
    const before = workflowOf(rehearsing).bindings
    const shooting = tick(rehearsing)
    const after = workflowOf(shooting).bindings
    expect(workflowOf(shooting).phase).toBe('shooting')
    expect(after.stageFacilityId).toBe(before.stageFacilityId)
    expect(after.setId).toBe(before.setId)
    // The lock is taken ONCE. A retained binding keeps the numbers it was given,
    // so a set that wore or went stale mid-shoot cannot rewrite its own gift.
    expect(after.lockedUplift).toBe(before.lockedUplift)
    expect(after.lockedNovelty).toBe(before.lockedNovelty)
    // And the acquisition week is preserved across the retention, which is the
    // entire meaning of the field.
    expect(after.heldSinceWeek).toBe(before.heldSinceWeek)
  })

  it('refuses with SET-UNAVAILABLE when a stage is free but nothing is standing on it', () => {
    // Strike both house sets: the studio has two stages and no scenery at all.
    let state = withCash(operationsStudio('m2-bind-unavailable'), 60_000_000)
    state = applyActions(state, [
      { kind: 'strikeSet', setId: 'set-0' },
      { kind: 'strikeSet', setId: 'set-1' },
    ])
    state = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state) },
    ])
    state = tick(state)
    state = tick(state)
    expect(workflowOf(state).phase).toBe('preProduction')
    state = tick(state)

    // It did NOT advance, and the reason names the thing it is actually waiting
    // for. A picture with no stage waits on a stage; a picture with a stage and
    // no scenery waits on a SET, and telling them apart is what makes the remedy
    // obvious ("build a set" rather than "wait for a stage").
    expect(workflowOf(state).phase).toBe('preProduction')
    expect(workflowOf(state).blocker).toEqual({
      kind: 'set-unavailable',
      targetPhase: 'rehearsal',
    })
    expect(workflowOf(state).bindings.setId).toBeNull()

    // …and it is RELIEVABLE, which owner law 2 requires: build the set, and the
    // picture moves the moment it stands.
    state = applyActions(state, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-house-generic', stageFacilityId: STAGE_7 },
      },
    ])
    for (let week = 0; week < 6; week++) state = tick(state)
    expect(workflowOf(state).bindings.setId).not.toBeNull()
    expect(workflowOf(state).blocker).toBeNull()
    expect(setById(state.sets, workflowOf(state).bindings.setId!)!.mountedOn).toBe(STAGE_7)
  })

  it('refuses with FACILITY-CAPACITY when there is no stage to be had at all', () => {
    // Two pictures, one stage: the second one is waiting on a BUILDING.
    let state = withCash(operationsStudio('m2-bind-no-stage'), 90_000_000)
    state = {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities.filter(
          (facility) => facility.id !== STAGE_12,
        ),
      },
      sets: state.sets.filter((set) => set.mountedOn !== STAGE_12),
    }
    state = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state, 0) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state, 1) },
    ])
    for (let week = 0; week < 4; week++) state = tick(state)
    const blocked = state.operations.workflows.find((workflow) => workflow.blocker !== null)
    expect(blocked?.blocker).toEqual({
      kind: 'facility-capacity',
      capability: 'soundstage',
      targetPhase: 'rehearsal',
    })
  })

  it('never lets two pictures stand on one set', () => {
    let state = withCash(operationsStudio('m2-bind-exclusive'), 90_000_000)
    state = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state, 0) },
    ])
    state = tick(state)
    state = applyActions(state, [
      { kind: 'greenlight', production: productionPayload(state, 1) },
    ])
    for (let week = 0; week < 4; week++) state = tick(state)
    const bound = state.operations.workflows
      .map((workflow) => workflow.bindings.setId)
      .filter((setId): setId is string => setId !== null)
    expect(new Set(bound).size).toBe(bound.length)
  })
})

describe('C2a-M2 — wrap, wear, and what reaches the audience', () => {
  function shootThrough(seed: string): GameState {
    let state = atRehearsal(seed)
    const productionId = workflowOf(state).productionId
    const directorId = state.studio.activeProductions[0]!.directorId
    state = tick(state) // Rehearsal → Shooting
    state = applyActions(state, [
      { kind: 'assignShootingDirector', productionId, directorId },
    ])
    // P05A W1: the due-at-call trip settles inside the Director call itself.
    state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
    state = tick(state) // the take completes
    return state
  }

  it('names the bound set in the WRAP, and wears it exactly once', () => {
    const shooting = shootThrough('m2-wrap')
    const boundSetId = workflowOf(shooting).bindings.setId!
    const conditionBefore = setById(shooting.sets, boundSetId)!.condition
    const wrapped = tick(shooting) // Shooting → Post: the wrap

    const rows = wrapped.studioEvents.rows.filter((row) => row.kind === 'wrapped')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ setId: boundSetId })

    // ONE wrap, ONE wear — per-use and deterministic, with no clock and no draw.
    expect(setById(wrapped.sets, boundSetId)!.condition).toBe(
      conditionBefore - TUNING.SET_CONDITION_WEAR_PER_PRODUCTION,
    )
    // The picture is in Post and has RELEASED the stage and the set, but keeps
    // its record of what it shot on.
    expect(workflowOf(wrapped).phase).toBe('postProduction')
    expect(workflowOf(wrapped).bindings.setId).toBe(boundSetId)
    expect(bindableSetsOnStage(wrapped, setById(wrapped.sets, boundSetId)!.mountedOn)).toHaveLength(1)
  })

  it('depletes novelty at RELEASE — and a picture that never releases burns none', () => {
    let state = shootThrough('m2-novelty')
    const boundSetId = workflowOf(state).bindings.setId!
    const noveltyAtBind = setById(state.sets, boundSetId)!.novelty
    state = tick(state) // wrap
    // Wrapping does not deplete: the audience has not seen anything yet.
    expect(setById(state.sets, boundSetId)!.novelty).toBe(noveltyAtBind)
    while (state.studio.activeProductions.length > 0) state = tick(state)
    expect(setById(state.sets, boundSetId)!.novelty).toBe(
      noveltyAtBind - TUNING.SET_NOVELTY_DEPLETION_PER_RELEASE,
    )

    // A CANCELLED picture burns nothing (§3.1, asserted rather than assumed).
    let cancelled = shootThrough('m2-novelty-cancel')
    const cancelledSetId = workflowOf(cancelled).bindings.setId!
    const before = setById(cancelled.sets, cancelledSetId)!.novelty
    cancelled = applyActions(cancelled, [
      { kind: 'cancel', productionId: workflowOf(cancelled).productionId },
    ])
    cancelled = tick(cancelled)
    expect(setById(cancelled.sets, cancelledSetId)!.novelty).toBe(before)
  })

  it('spends the LOCKED numbers at release, not the set’s live ones', () => {
    let state = shootThrough('m2-locked')
    const locked = workflowOf(state).bindings
    const boundSetId = locked.setId!
    // Wear the set hard behind the picture's back: the film has already been shot.
    state = {
      ...state,
      sets: state.sets.map((set: StudioSet) =>
        set.id === boundSetId ? { ...set, novelty: 0, quality: 0 } : set,
      ),
    }
    state = tick(state) // wrap
    const stillLocked = workflowOf(state).bindings
    expect(stillLocked.lockedNovelty).toBe(locked.lockedNovelty)
    expect(stillLocked.lockedUplift).toBe(locked.lockedUplift)
    // The factor the release will spend is the one taken at bind.
    expect(setNoveltyReceptionFactor(stillLocked.lockedNovelty)).toBe(
      setNoveltyReceptionFactor(locked.lockedNovelty),
    )
  })

  it('makes WHICH SET a real choice — a better set makes a better picture', () => {
    // The same seed, the same package, the same week — and one difference: the
    // set the picture stands on. This is owner law 3's teeth, measured.
    function runWith(seed: string, mutate: (set: StudioSet) => StudioSet): GameState {
      let state = withCash(operationsStudio(seed), 60_000_000)
      state = { ...state, sets: state.sets.map(mutate) }
      state = applyActions(state, [
        { kind: 'greenlight', production: productionPayload(state) },
      ])
      const productionId = state.studio.activeProductions[0]!.id
      const directorId = state.studio.activeProductions[0]!.directorId
      state = tick(state)
      state = tick(state)
      state = tick(state) // → Rehearsal (binds)
      state = tick(state) // → Shooting
      state = applyActions(state, [
        { kind: 'assignShootingDirector', productionId, directorId },
      ])
      // P05A W1: due-at-call settles inside the Director call itself.
      state = applyActions(state, [{ kind: 'scheduleShootingTake', productionId }])
      while (state.studio.releasedFilms.length === 0) state = tick(state)
      return state
    }

    const poor = runWith('m2-lever', (set) => ({ ...set, quality: 0 }))
    const great = runWith('m2-lever', (set) => ({ ...set, quality: 100 }))
    expect(great.studio.releasedFilms[0]!.craft).toBeGreaterThan(
      poor.studio.releasedFilms[0]!.craft,
    )
    // …and bounded: the whole lever is at most its two authored maxima.
    expect(
      great.studio.releasedFilms[0]!.craft - poor.studio.releasedFilms[0]!.craft,
    ).toBeLessThanOrEqual(TUNING.SET_QUALITY_UPLIFT_MAX + TUNING.SET_GENRE_FIT_UPLIFT_MAX)

    // A STALE set draws a smaller opening, and legs are untouched — a tired
    // street corner costs a picture its first audience, not its word of mouth.
    const fresh = runWith('m2-lever-novelty', (set) => ({ ...set, novelty: 1 }))
    const stale = runWith('m2-lever-novelty', (set) => ({ ...set, novelty: 0 }))
    expect(stale.studio.releasedFilms[0]!.boxOffice.opening).toBeLessThan(
      fresh.studio.releasedFilms[0]!.boxOffice.opening,
    )
    // Legs are untouched: the TOTAL scales in exactly the same proportion as the
    // opening, which is what "scaling the opening scales the total, legs
    // unchanged" means when only the two are on the record.
    expect(
      stale.studio.releasedFilms[0]!.boxOffice.total /
        stale.studio.releasedFilms[0]!.boxOffice.opening,
    ).toBeCloseTo(
      fresh.studio.releasedFilms[0]!.boxOffice.total /
        fresh.studio.releasedFilms[0]!.boxOffice.opening,
      10,
    )
    expect(
      stale.studio.releasedFilms[0]!.boxOffice.opening /
        fresh.studio.releasedFilms[0]!.boxOffice.opening,
    ).toBeCloseTo(TUNING.SET_NOVELTY_RECEPTION_FACTOR_MIN, 10)
  })
})
