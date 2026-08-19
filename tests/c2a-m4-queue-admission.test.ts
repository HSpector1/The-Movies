// ── C2a-M4 — Phase-Gate Admission at the three front doors (charter §3.3) ────
//
// The milestone's first law, tested where a player would feel it: a studio whose
// Development & Casting rooms are full no longer REFUSES the next picture. It
// admits the intent, states that it is waiting, holds nothing at all while it
// waits, and starts it the week a room actually frees.
//
// The fixture is a contended studio: two pictures in Development hold both shared
// slots for two consecutive weeks, which is the only way to have a queue that is
// still a queue when the next week arrives.

import { describe, expect, it } from 'vitest'
import {
  FOUNDING_MINIMUMS,
  applyActions,
  beginFounding,
  generateWorld,
  scriptCapacityView,
  stableStringify,
  tick,
} from '../src/core/index.js'
import type {
  CastSlot,
  CreativeRole,
  GameState,
  ProductionQueueEntry,
  SegmentId,
  Talent,
} from '../src/core/index.js'

function applicants(state: GameState): Talent[] {
  return state.founding!.applicantIds.map((id) => state.talent.find((talent) => talent.id === id)!)
}

function byRole(talent: readonly Talent[], role: CreativeRole): Talent[] {
  return talent.filter((person) => person.role === role)
}

function contractedByRole(state: GameState, role: CreativeRole): Talent[] {
  const contracted = new Set(state.contracts.map((contract) => contract.talentId))
  return state.talent.filter((person) => person.role === role && contracted.has(person.id))
}

function foundedStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = applicants(state)
  const hires = [
    ...byRole(pool, 'actor').slice(0, Math.max(FOUNDING_MINIMUMS.actor, 9)),
    ...byRole(pool, 'director').slice(0, Math.max(FOUNDING_MINIMUMS.director, 2)),
    ...byRole(pool, 'writer').slice(0, Math.max(FOUNDING_MINIMUMS.writer, 4)),
    ...byRole(pool, 'craft').slice(0, Math.max(FOUNDING_MINIMUMS.craft, 2)),
  ]
  for (const hire of hires) {
    state = applyActions(state, [{ kind: 'signContract', talentId: hire.id, termWeeks: 208 }])
  }
  return applyActions(state, [{ kind: 'foundStudio' }])
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

/** A founded studio with managed operations, screenplays and auditions. */
function managedStudio(seed: string): GameState {
  return withCash(
    applyActions(foundedStudio(seed), [
      { kind: 'activateStudioOperations' },
      { kind: 'activateScriptDevelopment' },
      { kind: 'activateCastingSessions' },
    ]),
    120_000_000,
  )
}

function commissionPayload(state: GameState, conceptIndex: number, writerIndex = 0) {
  const concept = state.concepts[conceptIndex]!
  return {
    conceptId: concept.id,
    writerId: contractedByRole(state, 'writer')[writerIndex]!.id,
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
  }
}

function greenlightPayload(state: GameState, projectId: string, offset = 0) {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)!
  const concept = state.concepts.find((candidate) => candidate.id === project.conceptId)!
  const actors = contractedByRole(state, 'actor')
  return {
    projectId,
    directorId: contractedByRole(state, 'director')[offset]!.id,
    craftIds: [contractedByRole(state, 'craft')[offset]!.id],
    cast: {
      lead: actors[offset * 3]!.id,
      antagonist: actors[offset * 3 + 1]!.id,
      support: actors[offset * 3 + 2]!.id,
    } satisfies Record<CastSlot, string>,
    budget: { negative: concept.baseNegativeCost, marketing: 0 },
  }
}

/**
 * A studio holding BOTH shared slots with two pictures in Development, with two
 * Ready screenplays left over. Development and Pre-production both require the
 * slot, so the gate stays shut for two consecutive advances — long enough for a
 * queue to age.
 */
function contendedStudio(seed: string): { state: GameState; readyProjectIds: string[] } {
  let state = managedStudio(seed)
  // Four screenplays, two at a time (the studio has exactly two slots).
  const projectIds: string[] = []
  for (const pair of [
    [0, 1],
    [2, 3],
  ]) {
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, pair[0]!, pair[0]!) },
    ])
    state = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, pair[1]!, pair[1]!) },
    ])
    state = tick(state)
    for (const project of state.scriptDevelopment.projects) {
      if (project.status !== 'review') continue
      state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
      projectIds.push(project.id)
    }
  }
  // Two greenlights: both pictures sit in Development, holding both slots.
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: greenlightPayload(state, projectIds[0]!, 0),
    },
  ])
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: greenlightPayload(state, projectIds[1]!, 1),
    },
  ])
  return { state, readyProjectIds: projectIds.slice(2) }
}

/** Advance `weeks` visible weeks. */
function advance(state: GameState, weeks: number): GameState {
  let next = state
  for (let i = 0; i < weeks; i++) next = tick(next)
  return next
}

/**
 * The audition slate the contended fixture can always staff: three actors that
 * neither greenlit picture locked.
 */
function freeSlate(state: GameState, projectId: string) {
  const actors = contractedByRole(state, 'actor')
  return {
    projectId,
    slate: {
      lead: [actors[6]!.id, actors[7]!.id] as [string, string],
      antagonist: [actors[6]!.id, actors[8]!.id] as [string, string],
      support: [actors[7]!.id, actors[8]!.id] as [string, string],
    },
  }
}

function queueKinds(state: GameState): string[] {
  return state.productionQueue.map((entry) => entry.kind)
}

describe('C2a-M4 §3.3 — the front doors admit and queue', () => {
  it('a commission with no free slot is ADMITTED, holds nothing, and starts when one frees', () => {
    const { state } = contendedStudio('m4-commission-queue')
    expect(scriptCapacityView(state)).toMatchObject({ occupied: 2, available: 0 })

    const payload = commissionPayload(state, 4, 2)
    const queued = applyActions(state, [{ kind: 'commissionScript', project: payload }])

    const expected: ProductionQueueEntry = {
      kind: 'commissionScript',
      ordinal: 0,
      queuedWeek: state.market.tick,
      payload,
    }
    expect(queued.productionQueue).toEqual([expected])
    // NOTHING IS HELD WHILE QUEUED (§3.3): no project, no reservation, no slot,
    // no cash, no ledger row.
    expect(queued.scriptDevelopment.projects).toHaveLength(
      state.scriptDevelopment.projects.length,
    )
    expect(scriptCapacityView(queued)).toMatchObject({ occupied: 2, available: 0 })
    expect(queued.studio.cash).toBe(state.studio.cash)
    expect(queued.ledger).toEqual(state.ledger)
    // The door records that it admitted rather than refused.
    expect(
      queued.studioEvents.rows.filter((row) => row.kind === 'queueAdmitted'),
    ).toMatchObject([{ kind: 'queueAdmitted', entryKind: 'commissionScript', ordinal: 0 }])

    // The two pictures keep their slots through Development and Pre-production
    // (sticky retention), so the intent is still waiting while they hold them.
    const held = advance(queued, 2)
    expect(held.productionQueue).toHaveLength(1)
    expect(held.scriptDevelopment.projects).toHaveLength(state.scriptDevelopment.projects.length)

    // The advance that ends Pre-production releases the slots, and the queue
    // takes one in the SAME visible week.
    const granted = tick(held)
    expect(granted.productionQueue).toEqual([])
    const started = granted.scriptDevelopment.projects.find(
      (project) => project.conceptId === payload.conceptId,
    )
    expect(started).toMatchObject({ status: 'drafting', commissionedWeek: granted.market.tick })
    // The due week a queued draft carries is a week that has not passed: the
    // admission is stamped with the week that ARRIVED, so its delivery lands on
    // the week its own record names.
    expect(started!.dueWeek).toBeGreaterThan(granted.market.tick)
  })

  it('a queued ORIGINAL commission mints nothing until the slot is granted', () => {
    const { state } = contendedStudio('m4-original-queue')
    const writer = contractedByRole(state, 'writer')[2]!
    const genre = state.concepts[0]!.genre
    const action = {
      kind: 'commissionOriginalScreenplay' as const,
      screenplay: {
        writerId: writer.id,
        genre,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' } as const,
        promise: {
          genre,
          intendedSegments: ['adult'] as SegmentId[],
          ranges: {
            intimacy: [-0.5, 0.5] as [number, number],
            tonalWeight: [-0.5, 0.5] as [number, number],
            kineticEnergy: [-0.5, 0.5] as [number, number],
          },
        },
      },
    }

    const queued = applyActions(state, [action])
    expect(queued.productionQueue).toMatchObject([
      { kind: 'commissionOriginalScreenplay', ordinal: 0, payload: { writerId: writer.id, genre } },
    ])
    // THE MINT IS THE COMMIT (§8.1): a waiting original owns no concept id, no
    // ordinal and no blueprint, which is why an expired one orphans nothing.
    expect(queued.concepts).toHaveLength(state.concepts.length)
    expect(queued.originalScreenplays).toEqual(state.originalScreenplays)
    expect(
      Object.prototype.hasOwnProperty.call(queued.productionQueue[0]!.payload, 'conceptId'),
    ).toBe(false)

    const granted = advance(queued, 3)
    expect(granted.productionQueue).toEqual([])
    expect(granted.concepts).toHaveLength(state.concepts.length + 1)
    expect(granted.originalScreenplays.nextOrdinal).toBe(
      state.originalScreenplays.nextOrdinal + 1,
    )
  })

  it('an audition start with no free slot is ADMITTED and waits', () => {
    const { state, readyProjectIds } = contendedStudio('m4-casting-queue')
    const session = freeSlate(state, readyProjectIds[0]!)
    const queued = applyActions(state, [{ kind: 'startCastingSession', session }])
    expect(queued.productionQueue).toEqual([
      { kind: 'startCastingSession', ordinal: 0, queuedWeek: state.market.tick, payload: session },
    ])
    expect(queued.castingSessions.sessions).toHaveLength(0)

    const granted = advance(queued, 3)
    expect(granted.productionQueue).toEqual([])
    expect(granted.castingSessions.sessions).toMatchObject([
      { projectId: readyProjectIds[0], status: 'auditioning' },
    ])
  })

  it('refuses what waiting cannot fix — only the capacity refusal queues', () => {
    const { state } = contendedStudio('m4-illegal-not-queued')
    const before = stableStringify(state)
    // An unknown concept is not a capacity problem; it throws at the door.
    expect(() =>
      applyActions(state, [
        {
          kind: 'commissionScript',
          project: { ...commissionPayload(state, 4, 2), conceptId: 'concept-does-not-exist' },
        },
      ]),
    ).toThrow(/unknown concept/)
    expect(stableStringify(state)).toBe(before)
    expect(state.productionQueue).toEqual([])
  })

  it('drops an intent that is no longer legal at dequeue, with a stated reason', () => {
    const { state } = contendedStudio('m4-expiry')
    const payload = commissionPayload(state, 4, 2)
    let queued = applyActions(state, [{ kind: 'commissionScript', project: payload }])
    // The premise the queued intent names is claimed by somebody else while it
    // waits — the intent is no longer legal and cannot become legal by waiting.
    queued = {
      ...queued,
      concepts: queued.concepts.filter((concept) => concept.id !== payload.conceptId),
    }

    const after = advance(queued, 3)
    expect(after.productionQueue).toEqual([])
    expect(
      after.studioEvents.rows.filter((row) => row.kind === 'queueIntentExpired'),
    ).toMatchObject([
      {
        kind: 'queueIntentExpired',
        entryKind: 'commissionScript',
        ordinal: 0,
        reason: expect.stringContaining('unknown concept'),
      },
    ])
    // An expired intent orphans nothing, because it held nothing.
    expect(after.scriptDevelopment.projects).toHaveLength(
      state.scriptDevelopment.projects.length,
    )
  })

  it('serves the queue longest-waiting-first, ordinal tie-break — against a genuine tie', () => {
    const { state, readyProjectIds } = contendedStudio('m4-queue-order')
    // Week A: one intent joins.
    let queued = applyActions(state, [
      { kind: 'commissionScript', project: commissionPayload(state, 4, 2) },
    ])
    // The next advance keeps both slots busy (Development → Pre-production).
    queued = tick(queued)
    const tieWeek = queued.market.tick
    // Week B: TWO more intents join in the SAME week — a genuine tie on
    // `queuedWeek`, resolved by the ordinal and nothing else.
    queued = applyActions(queued, [
      { kind: 'commissionScript', project: commissionPayload(queued, 5, 3) },
    ])
    queued = applyActions(queued, [
      { kind: 'startCastingSession', session: freeSlate(queued, readyProjectIds[0]!) },
    ])
    expect(
      queued.productionQueue.map((entry) => [entry.kind, entry.ordinal, entry.queuedWeek]),
    ).toEqual([
      ['commissionScript', 0, state.market.tick],
      ['commissionScript', 1, tieWeek],
      ['startCastingSession', 2, tieWeek],
    ])

    // Two slots free at once, so the two longest-waiting intents are granted —
    // the week-A commission first, then the lower ordinal of the genuine tie.
    const granted = advance(queued, 2)
    expect(queueKinds(granted)).toEqual(['startCastingSession'])
    expect(
      granted.scriptDevelopment.projects.filter((project) => project.status === 'drafting'),
    ).toHaveLength(2)
  })

  it('is deterministic under contention — same seed, same script, same queue', () => {
    const run = (): GameState => {
      const { state } = contendedStudio('m4-determinism')
      let next = applyActions(state, [
        { kind: 'commissionScript', project: commissionPayload(state, 4, 2) },
      ])
      next = tick(next)
      next = applyActions(next, [
        { kind: 'commissionScript', project: commissionPayload(next, 5, 3) },
      ])
      return advance(next, 3)
    }
    expect(stableStringify(run())).toBe(stableStringify(run()))
  })

  it('never queues in a legacy studio — a refusal there is still a refusal', () => {
    // A studio with no managed operations has no shared rooms to wait for; its
    // front doors are unchanged and its queue must stay empty.
    const legacy = foundedStudio('m4-legacy-no-queue')
    expect(legacy.operations.mode).toBe('legacy')
    expect(legacy.productionQueue).toEqual([])
    expect(() =>
      applyActions(legacy, [
        { kind: 'commissionScript', project: commissionPayload(legacy, 0) },
      ]),
    ).toThrow()
    expect(legacy.productionQueue).toEqual([])
  })
})
