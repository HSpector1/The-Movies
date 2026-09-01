// ── P06A W1 — decision surfaces speak the hold law truthfully ────────────────
//
//   S1  The decision ladder's tier 4: an UNCOMMITTED ready picture is the one
//       release-review stop (ascending id); committing clears it.
//   S2  The journey names the review at Production & Post and promises no week
//       while held; a committed picture says "next studio week".
//   S3  The calendar publishes NO release week for a held picture (never a
//       false one) and the held assumption sentence.
//   S4  `returnWeek`: a held picture's company has no truthful return week;
//       a committed picture's returns next week (hostile-review F4).
//   S5  Advance-to-Next-Event stops at the release decision with ZERO weeks;
//       manual Advance Week still ticks the world while the picture holds.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  nextStudioDecision,
  returnWeek,
  studioCalendar,
  tick,
} from '../src/core/index.js'
import { firstFilmJourney } from '../src/core/firstFilmJourney.js'
import { nextReleaseReviewDecision } from '../src/core/scriptReadModel.js'
import { advanceToNextEvent, advanceWeek, studioDecision } from '../ui/src/engine/adapter.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/index.js'
import {
  generateWorld,
  initialManagedStudioConstruction,
  initialManagedStudioOperations,
  initialManagedStudioPlacement,
} from '../src/core/index.js'

// The managed drive fixture (same vocabulary as p06a-w1-release-authority).
function assignment(state: GameState, offset = 0) {
  const population =
    state.contracts.length > 0
      ? state.contracts.map((c) => state.talent.find((t) => t.id === c.talentId)!)
      : state.talent
  const byRole = (role: string) => population.filter((t) => t.role === role)
  const actors = byRole('actor')
  return {
    writerId: byRole('writer')[offset]!.id,
    directorId: byRole('director')[offset]!.id,
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    craftIds: [byRole('craft')[offset]!.id],
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

function toReleaseReady(seed: string, count = 1): GameState {
  let state: GameState = {
    ...generateWorld(seed),
    operations: initialManagedStudioOperations(),
    construction: initialManagedStudioConstruction(),
    placement: initialManagedStudioPlacement(),
  }
  for (let i = 0; i < count; i++) {
    state = applyActions(state, [{ kind: 'greenlight', production: productionPayload(state, i) }])
  }
  state = tick(state)
  state = tick(state)
  state = tick(state)
  state = tick(state)
  const actions = state.studio.activeProductions.flatMap((production) => [
    {
      kind: 'assignShootingDirector' as const,
      productionId: production.id,
      directorId: production.directorId,
    },
    { kind: 'clearSceneryLoadIn' as const, productionId: production.id },
    { kind: 'scheduleShootingTake' as const, productionId: production.id },
  ])
  state = applyActions(state, actions)
  state = tick(state)
  state = tick(state)
  state = tick(state)
  state = tick(state)
  for (const production of state.studio.activeProductions) {
    expect(production.remainingTicks).toBe(1)
  }
  return state
}

const commit = (state: GameState, productionId: string): GameState =>
  applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])

describe('P06A W1 — tier 4 of the decision ladder', () => {
  it('names the first uncommitted ready picture in ascending id order and clears on commit', () => {
    let state = toReleaseReady('p06a-tier4', 2)
    const [a, b] = state.studio.activeProductions.map((p) => p.id).sort() as [string, string]

    const decision = nextStudioDecision(state)
    expect(decision).toMatchObject({ kind: 'releaseReview', productionId: a })
    expect(nextReleaseReviewDecision(state)?.title).toBeTruthy()

    state = commit(state, a)
    expect(nextStudioDecision(state)).toMatchObject({ kind: 'releaseReview', productionId: b })
    state = commit(state, b)
    expect(nextStudioDecision(state)).toBeNull()
  })
})

describe('P06A W1 — the journey speaks the hold law', () => {
  it('routes an uncommitted ready picture to the release review at post, promising no week', () => {
    const state = toReleaseReady('p06a-journey-held')
    const journey = firstFilmJourney(state)
    expect(journey?.next).toMatchObject({ kind: 'release-review', site: 'post' })
    expect(journey?.waiting).toBeNull()
    expect(journey?.headline).toBe('RELEASE READY')
  })

  it('tells a committed picture the truth: it releases on the next studio week', () => {
    const ready = toReleaseReady('p06a-journey-committed')
    const state = commit(ready, ready.studio.activeProductions[0]!.id)
    const journey = firstFilmJourney(state)
    expect(journey?.headline).toBe('COMMITTED TO RELEASE')
    expect(journey?.next).toMatchObject({ kind: 'advance-week' })
    expect(journey?.waiting?.untilWeek).toBe(state.market.tick + 1)
  })
})

describe('P06A W1 — the calendar never invents a release week', () => {
  it('publishes null for a held picture and week+1 after commitment', () => {
    const held = toReleaseReady('p06a-calendar')
    const id = held.studio.activeProductions[0]!.id
    const heldView = studioCalendar(held).productionOutlook.find((v) => v.productionId === id)!
    expect(heldView.conditionalReleaseWeek).toBeNull()
    expect(heldView.releaseAssumption).toMatch(/Held at Release Ready/)

    const committed = commit(held, id)
    const committedView = studioCalendar(committed).productionOutlook.find(
      (v) => v.productionId === id,
    )!
    expect(committedView.conditionalReleaseWeek).toBe(committed.market.tick + 1)
  })
})

describe('P06A W1 — returnWeek under the hold law (hostile F4)', () => {
  it('gives a held company no truthful return week, and a committed one next week', () => {
    const held = toReleaseReady('p06a-returnweek')
    const production = held.studio.activeProductions[0]!
    expect(returnWeek(held, production.cast.lead)).toBeNull()
    expect(returnWeek(held, production.directorId)).toBeNull()

    const committed = commit(held, production.id)
    expect(returnWeek(committed, production.cast.lead)).toBe(committed.market.tick + 1)

    // Earlier phases keep the conditional estimate — regression pin.
    let early: GameState = {
      ...generateWorld('p06a-returnweek-early'),
      operations: initialManagedStudioOperations(),
      construction: initialManagedStudioConstruction(),
      placement: initialManagedStudioPlacement(),
    }
    early = applyActions(early, [
      { kind: 'greenlight', production: productionPayload(early, 0) },
    ])
    early = tick(early)
    const earlyProduction = early.studio.activeProductions[0]!
    expect(earlyProduction.remainingTicks).toBe(8)
    expect(returnWeek(early, earlyProduction.cast.lead)).toBe(early.market.tick + 8)
  })
})

describe('P06A W1 — time controls at the release decision', () => {
  it('Advance to Next Event stops at the decision with zero weeks and the exact title', () => {
    const state = toReleaseReady('p06a-nextevent')
    const decision = studioDecision(state)
    expect(decision?.kind).toBe('releaseReview')

    const result = advanceToNextEvent(state)
    expect(result.weeks).toBe(0)
    expect(result.stopReason).toBe('releaseReview')
    expect(result.releaseDecision?.productionId).toBe(state.studio.activeProductions[0]!.id)
    expect(result.stopMessage).toMatch(/Release Ready — commit it to release, or hold/)
    // Zero weeks means byte-identical state: nothing advanced, nothing released.
    expect(result.next).toBe(state)
  })

  it('manual Advance Week remains legal and ticks the world while the picture holds', () => {
    const state = toReleaseReady('p06a-manual-advance')
    const result = advanceWeek(state)
    expect(result.next.market.tick).toBe(state.market.tick + 1)
    expect(result.next.studio.activeProductions[0]!.remainingTicks).toBe(1)
    expect(result.next.studio.releasedFilms).toEqual([])
  })
})
