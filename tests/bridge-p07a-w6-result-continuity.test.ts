// ── P07A W6 — result continuity / save-load / exact-ID / migration proof ─────
//
// The §5 lifecycle laws under test, stated once:
//   R1  COMMITTED → next authoritative batch → exactly ONE durable FilmResult +
//       ONE theatrical run; further weeks never duplicate either (§5A).
//       (Batch ID-order / click-order independence is already sealed law:
//        p06a-w1-release-authority.test.ts L3 — not re-proven here.)
//   R2  An ACTIVE run reports its true week, speaks projected language, and the
//       wire carries it with runStatus 'active' (the Unity rail's IN THEATERS
//       filter is unit-tested client-side against exactly this field) (§5B).
//   R3  RUN COMPLETE flips truthfully to final language, LEAVES the active
//       filter, and remains durably inspectable in the results projection (§5C).
//   R4  Save V16 round-trips the whole result truth mid-run, and the reloaded
//       branch completes the run IDENTICALLY to the unbroken one (§5C/§5E).
//   R5  Same-title films stay separate everywhere: two FilmResults, two runs,
//       two wire cards — identity is the exact production id, never the title
//       (§5D).
//   R6  A film with NO run record (a pre-run-tracking save) reads as settled
//       legacy truth — paid == totals, never 'projected', nothing fabricated
//       (§5F).
//   R7  The results projection is PURE presentation: deriving it twice changes
//       nothing and yields identical bytes — no RNG, no state mutation (§3F).

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  exportSave,
  FOUNDING_MINIMUMS,
  generateWorld,
  importSave,
  makeSave,
  migrateToV16,
  nextStudioDecision,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type { CastSlot, GameState, SegmentId } from '../src/core/index.js'
import { filmResultView, studioLotSnapshot } from '../ui/src/engine/adapter.ts'

// ── fixtures (the p06a-w1-release-authority vocabulary, minimally copied) ────

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

function productionPayload(state: GameState, conceptOffset = 0, staffOffset = 0) {
  const concept = state.concepts[conceptOffset]!
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
    ...assignment(state, staffOffset),
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/**
 * A SAVE-LEGAL managed world: really founded, economy-engaged, operations on —
 * required both for `exportSave` and for the D-12 multi-week theatrical run
 * (an unengaged economy takes the legacy single-lump credit and mints no run).
 */
function foundedManagedWorld(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const applicants = state.founding!.applicantIds.map(
    (id) => state.talent.find((t) => t.id === id)!,
  )
  const byRole = (role: string) => applicants.filter((t) => t.role === role)
  const hires = [
    ...byRole('actor').slice(0, FOUNDING_MINIMUMS.actor),
    ...byRole('director').slice(0, FOUNDING_MINIMUMS.director),
    ...byRole('writer').slice(0, FOUNDING_MINIMUMS.writer),
    ...byRole('craft').slice(0, FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 208 }])
  }
  state = applyActions(state, [{ kind: 'foundStudio' }])
  return applyActions(state, [{ kind: 'activateStudioOperations' }])
}

const greenlit = (state: GameState, conceptOffset = 0, staffOffset = 0): GameState =>
  applyActions(state, [
    { kind: 'greenlight', production: productionPayload(state, conceptOffset, staffOffset) },
  ])

const commit = (state: GameState, productionId: string): GameState =>
  applyActions(state, [{ kind: 'commitPictureToRelease', productionId }])

/**
 * Drive the CURRENT single active production to `releaseReady` (tick 1) the way
 * a player does — apply exactly the production-operation decisions the engine
 * publishes, then advance. Works from a fresh world AND after a prior release
 * (stage/scenery state differs; hand-scripted choreography would not survive).
 */
function driveToReleaseReady(state: GameState): GameState {
  for (let week = 0; week < 30; week++) {
    for (let guard = 0; guard < 8; guard++) {
      const decision = nextStudioDecision(state)
      if (decision === null || decision.kind !== 'productionOperation') break
      state = applyActions(state, [decision.command])
    }
    if (state.studio.activeProductions[0]!.remainingTicks === 1) return state
    state = tick(state)
  }
  throw new Error('driveToReleaseReady: never reached releaseReady in 30 weeks')
}

/** Commit the ready picture and advance ONE authoritative week: the release. */
function releaseTheReadyPicture(state: GameState): { state: GameState; id: string } {
  const id = state.studio.activeProductions[0]!.id
  state = tick(commit(state, id))
  expect(state.studio.releasedFilms.some((f) => f.productionId === id)).toBe(true)
  return { state, id }
}

const runOf = (state: GameState, id: string) =>
  state.theatricalRuns.find((r) => r.productionId === id)

const resultCardOf = (state: GameState, id: string) =>
  studioLotSnapshot(state).results!.find((c) => c.id === id)

/** Advance weeks until the exact run completes (bounded; never a lucky loop). */
function completeTheRun(state: GameState, id: string): GameState {
  for (let week = 0; week < 20; week++) {
    if (runOf(state, id)!.status === 'completed') return state
    state = tick(state)
  }
  throw new Error(`completeTheRun: run for ${id} never completed in 20 weeks`)
}

// ── R1: released exactly once, durably ───────────────────────────────────────

describe('P07A W6 — commitment releases exactly once (R1)', () => {
  it('one commit + one week = one FilmResult + one run; later weeks never duplicate', () => {
    const ready = driveToReleaseReady(greenlit(foundedManagedWorld('p07a-w6-once')))
    let { state, id } = releaseTheReadyPicture(ready)

    expect(state.studio.releasedFilms.filter((f) => f.productionId === id)).toHaveLength(1)
    expect(state.theatricalRuns.filter((r) => r.productionId === id)).toHaveLength(1)
    expect(studioLotSnapshot(state).results!.filter((c) => c.id === id)).toHaveLength(1)

    // The result is frozen at release: no later week may rewrite the verdict.
    const sealedCritic = state.studio.releasedFilms.find((f) => f.productionId === id)!.criticScore
    for (let week = 0; week < 8; week++) state = tick(state)
    expect(state.studio.releasedFilms.filter((f) => f.productionId === id)).toHaveLength(1)
    expect(state.theatricalRuns.filter((r) => r.productionId === id)).toHaveLength(1)
    expect(state.studio.releasedFilms.find((f) => f.productionId === id)!.criticScore).toBe(
      sealedCritic,
    )
  })
})

// ── R2/R3: the active-run truth, then the truthful flip to final ─────────────

describe('P07A W6 — active-run truth and the run-complete flip (R2/R3)', () => {
  it('speaks projected while active, final once complete, and stays durably inspectable', () => {
    const ready = driveToReleaseReady(greenlit(foundedManagedWorld('p07a-w6-flip')))
    let { state, id } = releaseTheReadyPicture(ready)

    // ACTIVE (§5B): the wire card matches the run record exactly.
    const run = runOf(state, id)!
    expect(run.status).toBe('active')
    const activeCard = resultCardOf(state, id)!
    expect(activeCard.runStatus).toBe('active')
    expect(activeCard.projected).toBe(true)
    expect(activeCard.resultLabel.startsWith('Projected')).toBe(true)
    expect(activeCard.weeksCredited).toBe(run.weekIndex)
    expect(activeCard.totalWeeks).toBe(run.totalWeeks)
    expect(activeCard.releaseWeek).toBe(
      state.studio.releasedFilms.find((f) => f.productionId === id)!.releaseTick,
    )

    // COMPLETE (§5C): final language, out of the active set, still on the wire.
    state = completeTheRun(state, id)
    const finalCard = resultCardOf(state, id)!
    expect(finalCard.runStatus).toBe('completed')
    expect(finalCard.projected).toBe(false)
    expect(finalCard.resultLabel.startsWith('Projected')).toBe(false)
    expect(['Profit', 'Loss', 'Break-even']).toContain(finalCard.resultLabel)
    // Everything banked: paid-to-date equals the locked totals.
    expect(finalCard.grossPaidToDate).toBeCloseTo(finalCard.boxOfficeGrossTotal, 6)
    expect(finalCard.studioRevenuePaidToDate).toBeCloseTo(finalCard.studioRevenueTotal, 6)
    expect(studioLotSnapshot(state).results!.filter((c) => c.id === id)).toHaveLength(1)
  })
})

// ── R4: V16 round-trip mid-run + identical completion after reload ───────────

describe('P07A W6 — save/load preserves result truth mid-run (R4)', () => {
  it('round-trips the projection byte-for-byte and completes the run identically', () => {
    const ready = driveToReleaseReady(greenlit(foundedManagedWorld('p07a-w6-save')))
    const { state, id } = releaseTheReadyPicture(ready)
    const midRun = tick(state) // one credited week: paid-to-date is a real partial

    const reloaded = migrateToV16(importSave(exportSave(makeSave(midRun)))).state as GameState
    expect(stableStringify(reloaded.studio.releasedFilms)).toBe(
      stableStringify(midRun.studio.releasedFilms),
    )
    expect(stableStringify(reloaded.theatricalRuns)).toBe(stableStringify(midRun.theatricalRuns))
    expect(stableStringify(studioLotSnapshot(reloaded).results)).toBe(
      stableStringify(studioLotSnapshot(midRun).results),
    )

    // §5E reconnect determinism: the reloaded branch's future is the same future.
    const doneOriginal = completeTheRun(midRun, id)
    const doneReloaded = completeTheRun(reloaded, id)
    expect(stableStringify(studioLotSnapshot(doneReloaded).results)).toBe(
      stableStringify(studioLotSnapshot(doneOriginal).results),
    )
  })
})

// ── R5: same-title films never collide ───────────────────────────────────────

describe('P07A W6 — duplicate titles are separated by exact id (R5)', () => {
  it('two films named identically keep separate results, runs, and wire cards', () => {
    // Same TITLE is data, not identity: rename concept #1 to concept #0's title
    // before either is made — two distinct productions, one visible name.
    let world = foundedManagedWorld('p07a-w6-twins')
    const sharedTitle = world.concepts[0]!.title
    world = {
      ...world,
      concepts: world.concepts.map((c, i) => (i === 1 ? { ...c, title: sharedTitle } : c)),
    }

    // Picture A: released, run completed.
    let state = driveToReleaseReady(greenlit(world, 0))
    const a = releaseTheReadyPicture(state)
    state = completeTheRun(a.state, a.id)

    // Picture B (same title, later): released, run still active.
    state = driveToReleaseReady(greenlit(state, 1, 0))
    const b = releaseTheReadyPicture(state)
    state = b.state

    expect(a.id).not.toBe(b.id)
    // `results` is required on the wire (schema) but optional on the TS type for
    // fixture ergonomics (W2) — the live adapter always emits it.
    const cards = studioLotSnapshot(state).results!
    const cardA = cards.find((c) => c.id === a.id)!
    const cardB = cards.find((c) => c.id === b.id)!
    expect(cardA.title).toBe(sharedTitle)
    expect(cardB.title).toBe(sharedTitle)
    // Two cards, two runs, two results — the title collides, nothing else does.
    expect(cards.filter((c) => c.title === sharedTitle)).toHaveLength(2)
    expect(state.theatricalRuns.filter((r) => r.productionId === a.id)).toHaveLength(1)
    expect(state.theatricalRuns.filter((r) => r.productionId === b.id)).toHaveLength(1)
    expect(cardA.runStatus).toBe('completed')
    expect(cardB.runStatus).toBe('active')

    // Independent save/load: the twins survive a round-trip distinct.
    const reloaded = migrateToV16(importSave(exportSave(makeSave(state)))).state as GameState
    expect(stableStringify(studioLotSnapshot(reloaded).results)).toBe(stableStringify(cards))
  })
})

// ── R6: a no-run legacy record reads as settled truth, never fabricated ──────

describe('P07A W6 — pre-run-tracking films read as settled legacy truth (R6)', () => {
  it('no run record ⇒ runStatus none, paid == totals, never projected', () => {
    const ready = driveToReleaseReady(greenlit(foundedManagedWorld('p07a-w6-legacy')))
    const { state, id } = releaseTheReadyPicture(ready)
    // A V3-era save carried releasedFilms but NO theatricalRuns — model exactly
    // that shape: the film exists, its run record does not.
    const legacy: GameState = {
      ...state,
      theatricalRuns: state.theatricalRuns.filter((r) => r.productionId !== id),
    }
    const film = legacy.studio.releasedFilms.find((f) => f.productionId === id)!
    const view = filmResultView(legacy, film)
    expect(view.business.runStatus).toBe('none')
    expect(view.business.projected).toBe(false)
    expect(view.business.resultLabel.startsWith('Projected')).toBe(false)
    // Fully settled — never a fabricated partial (§5F).
    expect(view.business.grossPaidToDate).toBe(view.business.boxOfficeGrossTotal)
    expect(view.business.studioRevenuePaidToDate).toBe(view.business.studioRevenueTotal)
    expect(view.business.totalWeeks).toBe(0)
    expect(view.business.weeksCredited).toBe(0)
  })
})

// ── R7: deriving the projection is free of side effects ──────────────────────

describe('P07A W6 — the results projection is pure presentation (R7)', () => {
  it('deriving twice yields identical bytes and mutates nothing', () => {
    const ready = driveToReleaseReady(greenlit(foundedManagedWorld('p07a-w6-pure')))
    const { state } = releaseTheReadyPicture(ready)
    const stateBefore = stableStringify(state)
    const first = stableStringify(studioLotSnapshot(state).results)
    const second = stableStringify(studioLotSnapshot(state).results)
    expect(second).toBe(first)
    expect(stableStringify(state)).toBe(stateBefore)
  })
})
