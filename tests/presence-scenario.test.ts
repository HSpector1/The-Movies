// Presence Projection V1 — the realistic scenario walk.
//
// One studio, built entirely through public actions with a named seed, followed
// week by week: a screenplay being drafted, the company moving across facilities
// as the production changes phase, and a genuine facility-capacity queue.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  assertStudioOperationsInvariants,
  studioPresence,
  tick,
} from '../src/core/index.js'
import type { GameState, PersonPresence, StudioPresence } from '../src/core/index.js'
import {
  activateManaged,
  cheapestConcepts,
  contractedByRole,
  foundedStudio,
  packagePayload,
  readyScript,
} from './_presenceFixtures.js'

function at(presence: StudioPresence, talentId: string): PersonPresence {
  const person = presence.people.find((candidate) => candidate.talentId === talentId)
  if (person === undefined) throw new Error(`presence has no person "${talentId}"`)
  return person
}

function facilityOf(state: GameState, capability: string, productionId: string): string {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )!
  return workflow.reservations.find((reservation) => reservation.capability === capability)!
    .facilityId
}

/**
 * Tick until `ready` holds, bounded. A production greenlit in week W does not
 * advance on the tick out of W (`startTick < currentTick`), so phase changes are
 * not one-tick-per-week; the walk asserts the STATE it stopped at, never the
 * number of ticks it took to get there.
 */
function advanceUntil(
  state: GameState,
  ready: (candidate: GameState) => boolean,
  limit = 6,
): GameState {
  let next = state
  for (let i = 0; i < limit; i++) {
    if (ready(next)) return next
    next = tick(next)
  }
  if (!ready(next)) throw new Error(`advanceUntil: condition not reached within ${String(limit)} weeks`)
  return next
}

function phaseOf(state: GameState, productionId: string): string | undefined {
  return state.operations.workflows.find((workflow) => workflow.productionId === productionId)
    ?.phase
}

describe('Presence Projection V1 — scenario walk', () => {
  it('follows one company from the drafting week to release across every phase', () => {
    let state = activateManaged(foundedStudio('presence-walk'))
    const concept = cheapestConcepts(state, 1)[0]!
    const writer = contractedByRole(state, 'writer')[0]!
    const director = contractedByRole(state, 'director')[0]!
    const craft = contractedByRole(state, 'craft')[0]!
    const actors = contractedByRole(state, 'actor')

    // ── the drafting week: the writer is at Development & Casting, alone ──────
    state = applyActions(state, [
      {
        kind: 'commissionScript',
        project: {
          conceptId: concept.id,
          writerId: writer.id,
          shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
          promise: {
            genre: concept.genre,
            intendedSegments: ['adult', 'prestige'],
            ranges: {
              intimacy: [-0.4, 0.6],
              tonalWeight: [0, 0.8],
              kineticEnergy: [-0.7, 0.2],
            },
          },
        },
      },
    ])
    const project = state.scriptDevelopment.projects[0]!
    let presence = studioPresence(state)
    expect(presence.week).toBe(state.market.tick)
    expect(presence.withheld).toEqual([])
    expect(at(presence, writer.id)).toMatchObject({
      engagement: 'script',
      credit: 'writer',
      ownerId: project.id,
      site: project.reservation!.facilityId,
      slot: project.reservation!.slot,
      blockedReason: null,
    })
    expect(at(presence, writer.id).beats).toContain('at-site')
    // Everyone else on the roster is present with no workplace claim.
    for (const person of presence.people) {
      if (person.talentId === writer.id) continue
      expect(person).toMatchObject({ engagement: 'roster', site: null, slot: null, ownerId: null })
      expect(new Set(person.beats)).toEqual(new Set(['home']))
    }

    // ── development / preProduction: writer + director at Development & Casting
    state = tick(state)
    state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    state = applyActions(state, [
      {
        kind: 'greenlightScriptProject',
        production: packagePayload(state, project.id, {
          directorId: director.id,
          craftIds: [craft.id],
          cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
        }),
      },
    ])
    const productionId = state.studio.activeProductions[0]!.id

    for (const phase of ['development', 'preProduction'] as const) {
      state = advanceUntil(state, (candidate) => phaseOf(candidate, productionId) === phase)
      presence = studioPresence(state)
      const site = facilityOf(state, 'development-casting', productionId)
      expect(at(presence, writer.id)).toMatchObject({
        engagement: 'production',
        credit: 'writer',
        ownerId: productionId,
        site,
      })
      expect(at(presence, director.id)).toMatchObject({
        engagement: 'production',
        credit: 'director',
        site,
      })
      expect(at(presence, craft.id).engagement).toBe('roster')
      expect(at(presence, actors[0]!.id).engagement).toBe('roster')
      state = tick(state)
    }

    // ── rehearsal: the director and the cast are on the soundstage ────────────
    state = advanceUntil(state, (candidate) => phaseOf(candidate, productionId) === 'rehearsal')
    presence = studioPresence(state)
    const stage = facilityOf(state, 'soundstage', productionId)
    expect(at(presence, director.id)).toMatchObject({ site: stage, credit: 'director' })
    expect(at(presence, actors[0]!.id)).toMatchObject({ site: stage, credit: 'lead' })
    expect(at(presence, actors[1]!.id)).toMatchObject({ site: stage, credit: 'antagonist' })
    expect(at(presence, actors[2]!.id)).toMatchObject({ site: stage, credit: 'support' })
    expect(at(presence, writer.id).engagement).toBe('roster')
    expect(at(presence, craft.id).engagement).toBe('roster')

    // ── shooting: cast on the stage, craft on the scenery slot the phase holds
    state = advanceUntil(state, (candidate) => phaseOf(candidate, productionId) === 'shooting')
    presence = studioPresence(state)
    expect(at(presence, director.id).site).toBe(facilityOf(state, 'soundstage', productionId))
    expect(at(presence, craft.id)).toMatchObject({
      site: facilityOf(state, 'set-scenery', productionId),
      credit: 'craft',
    })

    // A scenery-load-in blocker is work on site, NOT a capacity queue.
    state = applyActions(state, [
      { kind: 'assignShootingDirector', productionId, directorId: director.id },
    ])
    expect(state.operations.workflows[0]!.blocker).toMatchObject({ kind: 'scenery-load-in' })
    presence = studioPresence(state)
    expect(at(presence, director.id).blockedReason).toBeNull()
    expect(at(presence, director.id).beats).not.toContain('waiting')

    state = applyActions(state, [
      { kind: 'clearSceneryLoadIn', productionId },
      { kind: 'scheduleShootingTake', productionId },
    ])
    state = tick(state)
    expect(state.studio.activeProductions[0]!.remainingTicks).toBe(4)

    // ── postProduction: director and craft finish the picture; cast released ──
    state = advanceUntil(state, (candidate) => phaseOf(candidate, productionId) === 'postProduction')
    presence = studioPresence(state)
    const post = facilityOf(state, 'post', productionId)
    expect(at(presence, director.id).site).toBe(post)
    expect(at(presence, craft.id).site).toBe(post)
    expect(at(presence, actors[0]!.id).engagement).toBe('roster')

    // ── releaseReady: the phase holds no reservation, so nobody is claimed ────
    state = advanceUntil(state, (candidate) => phaseOf(candidate, productionId) === 'releaseReady')
    presence = studioPresence(state)
    for (const person of presence.people) {
      expect(person).toMatchObject({ engagement: 'roster', site: null, blockedReason: null })
    }
    expect(presence.withheld).toEqual([])
  })

  it('shows an honest queue: a soundstage-blocked company waits at the site it holds', () => {
    // MAX_CONCURRENT_PRODUCTIONS is 2 and every capability ships two slots, so
    // the initial facility set can never produce a queue. This uses the accepted
    // operations-suite mechanism for reaching one: a structurally valid
    // CONFIGURED facility set with a single soundstage (see
    // `withOneSoundstage` / `facilityPolicy: 'configured'` in operations.test.ts).
    // The blocker itself is produced by the engine's own tick, never hand-written.
    let state = activateManaged(
      foundedStudio('presence-queue', { actor: 6, director: 2, writer: 2, craft: 2 }),
    )
    const concepts = cheapestConcepts(state, 2)
    const writers = contractedByRole(state, 'writer')
    const directors = contractedByRole(state, 'director')
    const crafts = contractedByRole(state, 'craft')
    const actors = contractedByRole(state, 'actor')

    const greenlight = (index: number, projectId: string): void => {
      state = applyActions(state, [
        {
          kind: 'greenlightScriptProject',
          production: packagePayload(state, projectId, {
            directorId: directors[index]!.id,
            craftIds: [crafts[index]!.id],
            cast: {
              lead: actors[index * 3]!.id,
              antagonist: actors[index * 3 + 1]!.id,
              support: actors[index * 3 + 2]!.id,
            },
          }),
        },
      ])
    }

    const first = readyScript(state, concepts[0]!, writers[0]!.id)
    state = first.state
    const second = readyScript(state, concepts[1]!, writers[1]!.id)
    state = second.state
    greenlight(0, first.projectId)
    greenlight(1, second.projectId)

    // One soundstage for two companies.
    state = {
      ...state,
      operations: {
        ...state.operations,
        facilities: state.operations.facilities.filter(
          (facility) => facility.id !== 'facility-soundstage-12',
        ),
      },
    }
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, {
      facilityPolicy: 'configured',
    })

    state = advanceUntil(
      state,
      (candidate) => candidate.operations.workflows.some((workflow) => workflow.blocker !== null),
    )
    assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, {
      facilityPolicy: 'configured',
    })

    const blocked = state.operations.workflows.find((workflow) => workflow.blocker !== null)!
    const blockedId = blocked.productionId
    expect(blocked.phase).toBe('preProduction')
    expect(blocked.blocker).toEqual({
      kind: 'facility-capacity',
      capability: 'soundstage',
      targetPhase: 'rehearsal',
    })
    const blockedProduction = state.studio.activeProductions.find(
      (production) => production.id === blockedId,
    )!

    const presence = studioPresence(state)
    expect(presence.withheld).toEqual([])
    const held = facilityOf(state, 'development-casting', blockedId)
    for (const talentId of [blockedProduction.writerId, blockedProduction.directorId]) {
      const person = at(presence, talentId)
      expect(person).toMatchObject({
        engagement: 'production',
        ownerId: blockedId,
        site: held,
        blockedReason: 'awaiting soundstage capacity to enter rehearsal',
      })
      expect(person.beats).toContain('waiting')
      expect(person.beats).not.toContain('at-site')
    }

    // The queue is exactly the blocked company's phase attendance — nobody else.
    const waiting = presence.people.filter((person) => person.beats.includes('waiting'))
    expect(waiting.map((person) => person.talentId).sort()).toEqual(
      [blockedProduction.writerId, blockedProduction.directorId].sort(),
    )
    // …and the company that holds the stage is working, not queued.
    for (const person of presence.people) {
      if (person.engagement !== 'production' || person.ownerId === blockedId) continue
      expect(person.blockedReason).toBeNull()
      expect(person.beats).toContain('at-site')
    }

    // The queue clears the moment the stage frees: cancel the holder, tick, and
    // the same people are at work with no blockedReason.
    const holderId = state.operations.workflows.find(
      (workflow) => workflow.productionId !== blockedId,
    )!.productionId
    state = applyActions(state, [{ kind: 'cancel', productionId: holderId }])
    state = advanceUntil(state, (candidate) => phaseOf(candidate, blockedId) === 'rehearsal')
    const cleared = studioPresence(state)
    expect(cleared.people.filter((person) => person.beats.includes('waiting'))).toEqual([])
    expect(at(cleared, blockedProduction.directorId)).toMatchObject({
      site: facilityOf(state, 'soundstage', blockedId),
      blockedReason: null,
    })
  })
})
