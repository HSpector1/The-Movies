// ── C2a-M4 — Phase-Gate Admission at the three front doors (charter §3.3) ────
//
// The milestone's first law, tested where a player would feel it: a studio whose
// Development & Casting rooms are full no longer REFUSES the next picture. It
// admits the intent, states that it is waiting, holds nothing at all while it
// waits, and starts it the week a room actually frees.

import { describe, expect, it } from 'vitest'
import { applyActions, scriptCapacityView, stableStringify, tick } from '../src/core/index.js'
import type { GameState, ProductionQueueEntry, SegmentId } from '../src/core/index.js'
import {
  advance,
  contractedByRole,
  richFoundedStudio,
} from './contracts/_contractFixtures.js'
import {
  CONTENDED_DEPTH,
  commissionFor as commissionPayload,
  contendedStudio,
  freePackage,
  freeSlate,
} from './_m4Fixtures.js'

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

  it('rejects a second queued pool commission for the exact concept without blocking dequeue', () => {
    const { state } = contendedStudio('m4-commission-duplicate')
    const payload = commissionPayload(state, 4, 2)
    const action = { kind: 'commissionScript' as const, project: payload }
    const queued = applyActions(state, [action])
    const beforeDuplicate = stableStringify(queued)
    const sameConceptFromAnotherWriter = {
      kind: 'commissionScript' as const,
      project: commissionPayload(queued, 4, 3),
    }

    expect(() => applyActions(queued, [sameConceptFromAnotherWriter])).toThrow(
      /concept .* already has a screenplay commission waiting in the production queue/i,
    )
    expect(stableStringify(queued)).toBe(beforeDuplicate)
    expect(
      queued.productionQueue.filter(
        (entry) =>
          entry.kind === 'commissionScript' && entry.payload.conceptId === payload.conceptId,
      ),
    ).toHaveLength(1)

    const granted = advance(queued, 3)
    expect(granted.productionQueue).toEqual([])
    expect(
      granted.scriptDevelopment.projects.find(
        (project) => project.conceptId === payload.conceptId,
      ),
    ).toMatchObject({ status: 'drafting', commissionedWeek: granted.market.tick })
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

  it('a greenlight with no free slot is ADMITTED and commits its cash only when granted', () => {
    const { state, readyProjectIds } = contendedStudio('m4-greenlight-queue')
    const payload = freePackage(state, readyProjectIds[0]!)
    const queued = applyActions(state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])

    // §11.8 item 8's NAMED SUCCESSOR to the retired greenlight-throws-at-the-cap
    // test: the Nth greenlight ADMITS and queues on dev-slot exhaustion, with
    // the queue row asserted.
    expect(queued.productionQueue).toEqual([
      {
        kind: 'greenlightScriptProject',
        ordinal: 0,
        queuedWeek: state.market.tick,
        scriptProjectId: readyProjectIds[0],
        payload,
      },
    ])
    // GREENLIGHT COMMITMENT SEMANTICS UNCHANGED (§3.3): cash and talent commit
    // at greenlight — and a queued intent has not been greenlit.
    expect(queued.studio.cash).toBe(state.studio.cash)
    expect(queued.ledger).toEqual(state.ledger)
    expect(queued.studio.activeProductions).toHaveLength(2)
    expect(queued.operations.workflows).toHaveLength(2)

    const granted = advance(queued, 3)
    expect(granted.productionQueue).toEqual([])
    expect(granted.studio.activeProductions).toHaveLength(3)
    expect(granted.studio.cash).toBeLessThan(state.studio.cash)
    const admitted = granted.studio.activeProductions[2]!
    expect(
      granted.operations.workflows.some((workflow) => workflow.productionId === admitted.id),
    ).toBe(true)
  })

  it('rejects a second queued greenlight for the exact screenplay without blocking dequeue', () => {
    const { state, readyProjectIds } = contendedStudio('m4-greenlight-duplicate')
    const projectId = readyProjectIds[0]!
    const payload = freePackage(state, projectId)
    const action = { kind: 'greenlightScriptProject' as const, production: payload }
    const queued = applyActions(state, [action])
    const beforeDuplicate = stableStringify(queued)

    expect(() => applyActions(queued, [action])).toThrow(
      /screenplay project .* already has a greenlight waiting in the production queue/i,
    )
    expect(stableStringify(queued)).toBe(beforeDuplicate)
    expect(
      queued.productionQueue.filter(
        (entry) =>
          entry.kind === 'greenlightScriptProject' && entry.scriptProjectId === projectId,
      ),
    ).toHaveLength(1)

    const granted = advance(queued, 3)
    expect(granted.productionQueue).toEqual([])
    const project = granted.scriptDevelopment.projects.find(
      (candidate) => candidate.id === projectId,
    )
    expect(project).toMatchObject({ status: 'inProduction' })
    expect(
      granted.studio.activeProductions.some(
        (production) => production.id === project!.productionId,
      ),
    ).toBe(true)
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
        subjectId: payload.conceptId,
      },
    ])
    // An expired intent orphans nothing, because it held nothing.
    expect(after.scriptDevelopment.projects).toHaveLength(
      state.scriptDevelopment.projects.length,
    )
  })

  // P04A §2.5 — the identity a `queueIntentExpired` row carries. `subjectId`
  // is captured via `queueEntrySubjectId(entry)` BEFORE the entry is removed,
  // at both the dequeue-expiry site (queueAdmission.ts) and the cancel site
  // (actions.ts). For a `greenlightScriptProject` entry that identity is the
  // screenplay project's own id — proved here at both sites.
  it('drops a queued greenlight that is no longer legal at dequeue, carrying the project id', () => {
    const { state, readyProjectIds } = contendedStudio('m4-expiry-greenlight')
    const projectId = readyProjectIds[0]!
    const payload = freePackage(state, projectId)
    let queued = applyActions(state, [{ kind: 'greenlightScriptProject', production: payload }])
    const writerId = queued.scriptDevelopment.projects.find(
      (project) => project.id === projectId,
    )!.writerId
    // RE-POINTED for P04A.3 (Owner ruling §8). This fixture used to lapse the
    // credited WRITER's contract, because that used to make a queued greenlight
    // permanently illegal. It no longer does — a completed screenplay's credit is
    // not new labour, so neither `applyGreenlightScriptProject` nor
    // `applyGreenlight`'s D-11.12 set consults the writer's contract any more.
    //
    // The subject of this test is unchanged: an intent that CANNOT become legal
    // by waiting is dropped at dequeue, and the row it emits carries the
    // screenplay project's own id. So the illegality is re-pointed at a seat that
    // genuinely still gates — the DIRECTOR the package names leaves the studio's
    // talent entirely while the intent waits, which `requireTalent` refuses
    // permanently. (The project itself is still left in place: `scriptDevelopment
    // .projects` carries a positional id invariant, so a queued-intent illegality
    // fixture must break legality WITHOUT touching that array's membership.)
    void writerId
    queued = {
      ...queued,
      talent: queued.talent.filter((candidate) => candidate.id !== payload.directorId),
    }

    const after = advance(queued, 3)
    expect(after.productionQueue).toEqual([])
    expect(
      after.studioEvents.rows.filter((row) => row.kind === 'queueIntentExpired'),
    ).toMatchObject([
      {
        kind: 'queueIntentExpired',
        entryKind: 'greenlightScriptProject',
        ordinal: 0,
        reason: expect.stringContaining('unknown talent id'),
        subjectId: projectId,
      },
    ])
  })

  it('cancelling a queued greenlight emits queueIntentExpired carrying the project id', () => {
    const { state, readyProjectIds } = contendedStudio('m4-cancel-greenlight')
    const projectId = readyProjectIds[0]!
    const payload = freePackage(state, projectId)
    const queued = applyActions(state, [{ kind: 'greenlightScriptProject', production: payload }])
    expect(queued.productionQueue).toHaveLength(1)
    const ordinal = queued.productionQueue[0]!.ordinal

    const cancelled = applyActions(queued, [{ kind: 'cancelQueuedIntent', ordinal }])
    expect(cancelled.productionQueue).toEqual([])
    expect(
      cancelled.studioEvents.rows.filter((row) => row.kind === 'queueIntentExpired'),
    ).toMatchObject([
      {
        kind: 'queueIntentExpired',
        entryKind: 'greenlightScriptProject',
        ordinal,
        reason: expect.stringContaining('withdrew'),
        subjectId: projectId,
      },
    ])
    // Cancelling holds nothing and refunds nothing — because it held nothing:
    // the named project is exactly as ready as it was before it was queued.
    expect(
      cancelled.scriptDevelopment.projects.find((project) => project.id === projectId),
    ).toMatchObject({ status: 'ready' })
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
    const legacy = richFoundedStudio('m4-legacy-no-queue', CONTENDED_DEPTH)
    expect(legacy.operations.mode).toBe('legacy')
    expect(legacy.productionQueue).toEqual([])
    expect(() =>
      applyActions(legacy, [
        { kind: 'commissionScript', project: commissionPayload(legacy, 0, 0) },
      ]),
    ).toThrow()
    expect(legacy.productionQueue).toEqual([])
  })
})
