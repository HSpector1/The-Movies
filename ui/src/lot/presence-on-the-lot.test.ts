// ── Presence on the Lot V1 — the whole chain, over REAL engine state ──────────
//
// The pure modules are proven from hand-built projections elsewhere. This spec proves
// the join: a real founded studio commissions a real screenplay, and the writer ends up
// standing at Development's door with the panel quoting the sentence the player reads.
//
// Nothing here is hand-edited. The state is built by calling engine actions with a named
// seed, exactly as the accepted fixtures do (law 25).

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  beginFounding,
  FOUNDING_MINIMUMS,
  generateWorld,
  studioPresence,
  tick,
} from '../../../src/core/index.ts'
import type {
  CommissionScriptPayload,
  CreativeRole,
  GameState,
} from '../../../src/core/index.ts'
import { studioLotSnapshot } from '../engine/adapter.ts'
import { lotBuildingInspectorContext } from './buildingInspector.ts'
import { lotPersonPresenceLine } from './snapshot/presenceLines.ts'
import { LOT_PRESENCE_STATIC_BEAT } from './snapshot/StudioLotSnapshot.ts'
import { PLACE_BY_BUILDING } from './tycoon/world.ts'
import {
  presenceOccupantCounts,
  presenceStands,
  type PresencePersonHome,
} from './tycoon/presence.ts'

const SEED = 'presence-on-the-lot-v1'

function foundManagedScriptStudio(seed: string): GameState {
  let state = beginFounding(generateWorld(seed))
  const pool = state.founding!.applicantIds.map(
    (id) => state.talent.find((talent) => talent.id === id)!,
  )
  const byRole = (role: CreativeRole, count: number): typeof pool =>
    pool.filter((talent) => talent.role === role).slice(0, count)
  const hires = [
    ...byRole('actor', FOUNDING_MINIMUMS.actor),
    ...byRole('director', FOUNDING_MINIMUMS.director),
    ...byRole('writer', FOUNDING_MINIMUMS.writer),
    ...byRole('craft', FOUNDING_MINIMUMS.craft),
  ]
  for (const hire of hires) {
    state = applyActions(state, [
      { kind: 'signContract', talentId: hire.id, termWeeks: 156 },
    ])
  }
  return applyActions(state, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
  ])
}

function writerId(state: GameState): string {
  const contracted = state.contracts.map(
    (contract) => state.talent.find((talent) => talent.id === contract.talentId)!,
  )
  return contracted.find((talent) => talent.role === 'writer')!.id
}

function commission(state: GameState): GameState {
  const concept = state.concepts[0]!
  const project: CommissionScriptPayload = {
    conceptId: concept.id,
    writerId: writerId(state),
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.5, 0.5],
        tonalWeight: [-0.5, 0.5],
        kineticEnergy: [-0.5, 0.5],
      },
    },
  }
  return applyActions(state, [{ kind: 'commissionScript', project }])
}

const DRAFTING = commission(foundManagedScriptStudio(SEED))
const IDLE = foundManagedScriptStudio(SEED)

describe('presence reaches the lot from real engine state', () => {
  it('carries the engine projection onto the snapshot, week for week', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const engine = studioPresence(DRAFTING)
    expect(snapshot.presence).toBeDefined()
    expect(snapshot.presence!.week).toBe(engine.week)
    expect(snapshot.presence!.week).toBe(DRAFTING.market.tick)
    expect(snapshot.presence!.beatsPerWeek).toBe(engine.people[0]!.beats.length)
    expect(snapshot.presence!.staticBeat).toBe(LOT_PRESENCE_STATIC_BEAT)
    expect(snapshot.presence!.people.map((person) => person.talentId)).toEqual(
      engine.people.map((person) => person.talentId),
    )
  })

  it('claims nothing the engine did not claim, and adds no person of its own', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const engine = studioPresence(DRAFTING)
    for (const person of snapshot.presence!.people) {
      const source = engine.people.find((candidate) => candidate.talentId === person.talentId)!
      expect(person.facilityId).toBe(source.site)
      expect(person.slot).toBe(source.slot)
      expect(person.credit).toBe(source.credit)
      expect(person.engagement).toBe(source.engagement)
      expect(person.blockedReason).toBe(source.blockedReason)
      expect(person.beats).toEqual(source.beats)
    }
  })

  it('joins the Calendar’s own words for the drafting writer', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const writer = snapshot.presence!.people.find(
      (person) => person.talentId === writerId(DRAFTING),
    )!
    expect(writer.engagement).toBe('script')
    expect(writer.credit).toBe('writer')
    expect(writer.facilityId).toBe('facility-development-casting')
    expect(writer.facilityName).toBe('Development & Casting')
    expect(writer.activity).toBe('drafting')
    expect(writer.workTitle).toBe(
      DRAFTING.concepts.find((concept) => concept.id === DRAFTING.scriptDevelopment.projects[0]!.conceptId)!.title,
    )
  })

  it('stands that writer at DEVELOPMENT’s own door, not in a parked home slot', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const id = writerId(DRAFTING)
    const home = { gx: 5.4, gy: 11.9 }
    const people = new Map<string, PresencePersonHome>(
      snapshot.people.map((person) => [
        person.id,
        { role: person.role, home } as PresencePersonHome,
      ]),
    )
    const stands = presenceStands(
      snapshot.presence,
      snapshot.placement?.placements ?? [],
      people,
      LOT_PRESENCE_STATIC_BEAT,
    )
    const writerStand = stands.find((stand) => stand.talentId === id)!
    expect(writerStand.stance).toBe('at-site')
    expect(writerStand.site?.kind === 'place' && writerStand.site.buildingId).toBe('writers')
    const door = PLACE_BY_BUILDING.writers.anchors.work!
    expect(Math.hypot(writerStand.destination!.gx - door.gx, writerStand.destination!.gy - door.gy))
      .toBeLessThan(2)
    expect(writerStand.path[0]).toEqual(home)
    expect(writerStand.path.at(-1)).toEqual(writerStand.destination)
    expect(writerStand.path.length).toBeGreaterThan(2)

    // Everyone else attends their roster home facility (LL-CP1) when the lot
    // can place it, and is parked at home only when the week claims nothing.
    const presenceById = new Map(
      snapshot.presence!.people.map((person) => [person.talentId, person]),
    )
    const others = stands.filter((stand) => stand.talentId !== id)
    expect(others.length).toBeGreaterThan(0)
    let attending = 0
    for (const stand of others) {
      const record = presenceById.get(stand.talentId)
      if (record?.facilityId != null) {
        expect(stand.stance).toBe('at-site')
        attending += 1
      } else {
        expect(stand.stance).toBe('home')
      }
    }
    expect(attending).toBeGreaterThan(0)
  })

  it('counts the claimed writer plus the attending company on Development’s sign', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const counts = presenceOccupantCounts(snapshot.presence, snapshot.placement?.placements ?? [])
    // The expected sign counts are recomputed from the same presence truth the
    // sign reads: everyone at-site at the static beat, per mapped facility.
    const expected = new Map<string, number>()
    for (const person of snapshot.presence!.people) {
      if (person.facilityId === null) continue
      if (person.beats[snapshot.presence!.staticBeat] !== 'at-site') continue
      const building = person.facilityId === 'facility-development-casting'
        ? 'writers'
        : person.facilityId === 'facility-scenery-shop'
          ? 'post'
          : null
      if (building !== null) expected.set(building, (expected.get(building) ?? 0) + 1)
    }
    expect(counts.byBuilding.get('writers')).toBe(expected.get('writers'))
    expect(new Set(counts.byBuilding.keys())).toEqual(new Set(expected.keys()))
    // The claimed writer is never alone now: the contracted company attends too.
    expect(counts.byBuilding.get('writers')!).toBeGreaterThan(1)
    // Roster attendance (LL-CP1): the lot is inhabited even before the first
    // screenplay is commissioned.
    expect(
      presenceOccupantCounts(studioLotSnapshot(IDLE).presence, []).byBuilding.size,
    ).toBeGreaterThan(0)
  })

  it('quotes the drafting sentence in the person panel', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const line = lotPersonPresenceLine(snapshot, writerId(DRAFTING))
    expect(line?.kind).toBe('at-site')
    expect(line?.line).toMatch(/^Drafting .+ at Development & Casting, slot 1$/)
  })

  it('lists that writer under "Who’s here this week" on Development', () => {
    const snapshot = studioLotSnapshot(DRAFTING)
    const writer = snapshot.people.find((person) => person.id === writerId(DRAFTING))!
    const context = lotBuildingInspectorContext(snapshot, 'writers', null, null)
    // M-B prints the people group ahead of the verbs, so it is now `occupantFacts`.
    // Same content, same source, and it is still ONLY there. The heading count is
    // recomputed from the same presence truth (writer plus attending company).
    const atDevelopment = snapshot.presence!.people.filter(
      (person) =>
        person.facilityId === 'facility-development-casting' &&
        person.beats[snapshot.presence!.staticBeat] === 'at-site',
    ).length
    expect(atDevelopment).toBeGreaterThan(1)
    expect(context.occupantFacts.map((fact) => fact.term)).toContain(writer.name)
    expect(context.occupantFacts.find((fact) => fact.key === 'presence:heading')?.detail).toBe(
      `${atDevelopment} people`,
    )
    expect(context.facts.map((fact) => fact.term)).not.toContain(writer.name)
  })

  it('states an unclaimed week for an employee with no work', () => {
    const snapshot = studioLotSnapshot(IDLE)
    const anyone = snapshot.people[0]!
    const line = lotPersonPresenceLine(snapshot, anyone.id)
    expect(line?.kind).toBe('roster')
  })

  it('follows the picture week over week without the lot deciding anything', () => {
    // One tick: the draft is still in progress or has reached review; either way the
    // lot's answer is the engine's, and the two never diverge.
    const next = tick(DRAFTING)
    const snapshot = studioLotSnapshot(next)
    const engine = studioPresence(next)
    expect(snapshot.presence!.week).toBe(next.market.tick)
    expect(snapshot.presence!.people.map((person) => person.facilityId)).toEqual(
      engine.people.map((person) => person.site),
    )
  })

  it('changes no engine byte — the snapshot is a projection, not a step', () => {
    const before = JSON.stringify(DRAFTING)
    studioLotSnapshot(DRAFTING)
    studioLotSnapshot(DRAFTING)
    expect(JSON.stringify(DRAFTING)).toBe(before)
  })

  it('omits presence entirely in legacy operations rather than claiming an empty week', () => {
    let legacy = beginFounding(generateWorld(SEED))
    const pool = legacy.founding!.applicantIds.map(
      (id) => legacy.talent.find((talent) => talent.id === id)!,
    )
    const byRole = (role: CreativeRole, count: number): typeof pool =>
      pool.filter((talent) => talent.role === role).slice(0, count)
    for (const hire of [
      ...byRole('actor', FOUNDING_MINIMUMS.actor),
      ...byRole('director', FOUNDING_MINIMUMS.director),
      ...byRole('writer', FOUNDING_MINIMUMS.writer),
      ...byRole('craft', FOUNDING_MINIMUMS.craft),
    ]) {
      legacy = applyActions(legacy, [
        { kind: 'signContract', talentId: hire.id, termWeeks: 156 },
      ])
    }
    legacy = applyActions(legacy, [{ kind: 'foundStudio' }])
    expect(legacy.operations.mode).toBe('legacy')
    expect(studioLotSnapshot(legacy).presence).toBeUndefined()
  })
})
