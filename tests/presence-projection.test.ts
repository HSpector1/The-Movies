// Presence Projection V1 — the projection's laws, and its behaviour against
// malformed or hostile truth.
//
// Every world here comes from public actions with a named seed; the hostile
// cases forge a deep copy AFTERWARDS, so each one is a legal world with exactly
// one thing broken.

import { describe, expect, it } from 'vitest'
import {
  applyActions,
  BEATS_PER_WEEK,
  PRESENCE_DEPARTURE_WINDOW,
  PRESENCE_LAST_WORK_BEAT,
  rosterHomeFacilityId,
  studioPresence,
  tick,
} from '../src/core/index.js'
import type { GameState, StudioPresence } from '../src/core/index.js'
import {
  activateManaged,
  cheapestConcepts,
  contractedByRole,
  foundedStudio,
  packagePayload,
  presenceViolations,
  readyScript,
} from './_presenceFixtures.js'

function forge(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state)) as GameState
}

function mutable(value: unknown): Record<string, unknown> {
  return value as Record<string, unknown>
}

/** A world with a company in Rehearsal, a screenplay drafting, and a full roster. */
function busyStudio(seed: string): GameState {
  let state = activateManaged(foundedStudio(seed, { actor: 6, director: 2, writer: 2, craft: 2 }))
  const concepts = cheapestConcepts(state, 2)
  const writers = contractedByRole(state, 'writer')
  const directors = contractedByRole(state, 'director')
  const crafts = contractedByRole(state, 'craft')
  const actors = contractedByRole(state, 'actor')

  const first = readyScript(state, concepts[0]!, writers[0]!.id)
  state = first.state
  state = applyActions(state, [
    {
      kind: 'greenlightScriptProject',
      production: packagePayload(state, first.projectId, {
        directorId: directors[0]!.id,
        craftIds: [crafts[0]!.id],
        cast: { lead: actors[0]!.id, antagonist: actors[1]!.id, support: actors[2]!.id },
      }),
    },
  ])
  state = tick(state)
  state = tick(state)
  state = tick(state)
  // A second screenplay is drafted alongside the running production.
  return applyActions(state, [
    {
      kind: 'commissionScript',
      project: {
        conceptId: concepts[1]!.id,
        writerId: writers[1]!.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concepts[1]!.genre,
          intendedSegments: ['adult'],
          ranges: {
            intimacy: [-0.4, 0.6],
            tonalWeight: [0, 0.8],
            kineticEnergy: [-0.7, 0.2],
          },
        },
      },
    },
  ])
}

/** A world with a live casting session at Development & Casting. */
function auditioningStudio(seed: string): GameState {
  let state = activateManaged(foundedStudio(seed, { actor: 6, director: 2, writer: 2, craft: 2 }))
  const concept = cheapestConcepts(state, 1)[0]!
  const writer = contractedByRole(state, 'writer')[0]!
  const actors = contractedByRole(state, 'actor')
  const ready = readyScript(state, concept, writer.id)
  state = ready.state
  return applyActions(state, [
    {
      kind: 'startCastingSession',
      session: {
        projectId: ready.projectId,
        slate: {
          lead: [actors[0]!.id, actors[1]!.id],
          antagonist: [actors[1]!.id, actors[2]!.id],
          support: [actors[2]!.id, actors[0]!.id],
        },
      },
    },
  ])
}

function claimed(presence: StudioPresence): StudioPresence['people'] {
  return presence.people.filter((person) => person.engagement !== 'roster')
}

describe('Presence Projection V1 — laws', () => {
  it('projects each person once, in ascending talentId order, against real reservations', () => {
    const state = busyStudio('presence-laws')
    const presence = studioPresence(state)
    expect(presenceViolations(state, presence)).toEqual([])
    expect(presence.withheld).toEqual([])
    expect(presence.people.length).toBeGreaterThan(0)
    expect(new Set(presence.people.map((person) => person.talentId)).size).toBe(
      presence.people.length,
    )
    expect(presence.people.map((person) => person.talentId)).toEqual(
      [...presence.people.map((person) => person.talentId)].sort(),
    )
    // Every contracted employee is present; nobody else is.
    const contracted = new Set(
      state.contracts
        .filter(
          (contract) =>
            contract.startWeek <= state.market.tick &&
            state.market.tick < contract.endWeekExclusive,
        )
        .map((contract) => contract.talentId),
    )
    expect(presence.people.map((person) => person.talentId).sort()).toEqual([...contracted].sort())
  })

  it('holds its laws across every week of a production, including the casting week', () => {
    let state = auditioningStudio('presence-laws-weeks')
    for (let week = 0; week < 12; week++) {
      const presence = studioPresence(state)
      expect(presenceViolations(state, presence)).toEqual([])
      expect(presence.week).toBe(state.market.tick)
      state = tick(state)
    }
  })

  it('shapes every beat array as home → travel → work → home, integers only', () => {
    const state = busyStudio('presence-beats')
    const presence = studioPresence(state)
    for (const person of presence.people) {
      expect(person.beats).toHaveLength(BEATS_PER_WEEK)
      expect(person.slot === null || Number.isInteger(person.slot)).toBe(true)
      if (person.engagement === 'roster' && person.site === null) {
        expect(person.beats.every((beat) => beat === 'home')).toBe(true)
        continue
      }
      if (person.engagement === 'roster') {
        // Roster attendance canon: slot-less, at the profession's home site,
        // with the same work-week shape asserted below.
        expect(person.site).toBe(rosterHomeFacilityId(person.role))
        expect(person.slot).toBeNull()
      }
      const departure = person.beats.indexOf('travel')
      expect(departure).toBeGreaterThanOrEqual(0)
      expect(departure).toBeLessThan(PRESENCE_DEPARTURE_WINDOW)
      expect(person.beats[PRESENCE_LAST_WORK_BEAT]).toBe('at-site')
      expect(person.beats[BEATS_PER_WEEK - 1]).toBe('home')
      for (let i = 0; i < departure; i++) expect(person.beats[i]).toBe('home')
      for (let i = departure + 1; i <= PRESENCE_LAST_WORK_BEAT; i++) {
        expect(person.beats[i]).toBe('at-site')
      }
    }
    expect(Number.isInteger(BEATS_PER_WEEK)).toBe(true)
    expect(BEATS_PER_WEEK).toBe(10)
  })

  it('projects an auditioning slate at the session slot, and nobody the session did not name', () => {
    const state = auditioningStudio('presence-casting')
    const session = state.castingSessions.sessions[0]!
    const presence = studioPresence(state)
    expect(presenceViolations(state, presence)).toEqual([])

    const auditionees = claimed(presence).filter((person) => person.engagement === 'casting')
    const slate = new Set([
      ...session.slate.lead,
      ...session.slate.antagonist,
      ...session.slate.support,
    ])
    expect(auditionees.map((person) => person.talentId).sort()).toEqual([...slate].sort())
    for (const person of auditionees) {
      expect(person).toMatchObject({
        credit: 'auditionee',
        ownerId: session.id,
        site: session.reservation!.facilityId,
        slot: session.reservation!.slot,
        blockedReason: null,
      })
    }
    // The session closes on the next tick and the slot is released with it.
    const after = studioPresence(tick(state))
    expect(after.people.filter((person) => person.engagement === 'casting')).toEqual([])
  })

  it('claims each person exactly once even when tiers overlap (production outranks casting)', () => {
    // Existing law forbids the overlap: `assertCastingSlateEligibility` rejects a
    // busy candidate, so no legal state has one. Forge it anyway and prove the
    // projection resolves by PRECEDENCE instead of double-claiming.
    const legal = busyStudio('presence-precedence')
    const lead = legal.studio.activeProductions[0]!.cast.lead
    const forged = forge(legal)
    const project = forged.scriptDevelopment.projects.find(
      (candidate) => candidate.status === 'drafting',
    )!
    mutable(forged).castingSessions = {
      mode: 'managed',
      sessions: [
        {
          id: 'casting-forged',
          projectId: project.id,
          status: 'auditioning',
          startedWeek: forged.market.tick,
          dueWeek: forged.market.tick + 1,
          reservation: {
            sessionId: 'casting-forged',
            facilityId: 'facility-development-casting',
            capability: 'development-casting',
            slot: 1,
          },
          slate: {
            lead: [lead, forged.talent[0]!.id],
            antagonist: [forged.talent[1]!.id, forged.talent[2]!.id],
            support: [forged.talent[3]!.id, lead],
          },
          results: null,
        },
      ],
    }

    const presence = studioPresence(forged)
    expect(presence.people.filter((person) => person.talentId === lead)).toHaveLength(1)
    expect(presence.people.find((person) => person.talentId === lead)!.engagement).toBe('production')
    expect(presenceViolations(forged, presence)).toEqual([])
  })
})

describe('Presence Projection V1 — malformed and hostile truth', () => {
  it('withholds a person whose talent record is duplicated, and never throws', () => {
    const legal = busyStudio('presence-duplicate-id')
    const forged = forge(legal)
    const twin = forged.talent[0]!
    forged.talent.push({ ...twin, name: `${twin.name} (twin)` })

    const presence = studioPresence(forged)
    expect(presence.people.some((person) => person.talentId === twin.id)).toBe(false)
    expect(presence.withheld).toContainEqual({
      talentId: twin.id,
      reason: 'duplicate talent record for this id',
    })
  })

  it('withholds a claimed person whose talent record is missing', () => {
    const legal = busyStudio('presence-missing-talent')
    const forged = forge(legal)
    const directorId = forged.studio.activeProductions[0]!.directorId
    mutable(forged).talent = forged.talent.filter((person) => person.id !== directorId)

    const presence = studioPresence(forged)
    expect(presence.people.some((person) => person.talentId === directorId)).toBe(false)
    expect(presence.withheld).toContainEqual({
      talentId: directorId,
      reason: 'no talent record for this id',
    })
    // Everyone else still projects: withholding is per person, not per studio.
    expect(presence.people.length).toBeGreaterThan(0)
    expect(presenceViolations(forged, presence)).toEqual([])
  })

  it('withholds everyone standing on a facility slot two owners claim', () => {
    const legal = busyStudio('presence-contradictory-slot')
    const forged = forge(legal)
    const project = forged.scriptDevelopment.projects.find(
      (candidate) => candidate.status === 'drafting',
    )!
    const workflow = forged.operations.workflows[0]!
    const production = forged.studio.activeProductions[0]!
    // Point the screenplay's slot at the production's own reserved slot.
    const stolen = workflow.reservations[0]!
    mutable(project).reservation = {
      projectId: project.id,
      facilityId: stolen.facilityId,
      capability: 'development-casting',
      slot: stolen.slot,
    }

    const presence = studioPresence(forged)
    const contested = `facility slot "${stolen.facilityId}:${String(stolen.slot)}" is claimed by more than one owner`
    expect(presence.withheld).toContainEqual({ talentId: project.writerId, reason: contested })
    for (const person of presence.people) {
      expect(person.site).not.toBe(stolen.facilityId)
    }
    expect(presence.withheld.some((entry) => entry.talentId === production.directorId)).toBe(true)
  })

  it('withholds a company whose phase reservation is gone, and one drafting without a slot', () => {
    const legal = busyStudio('presence-missing-reservation')
    const forged = forge(legal)
    const workflow = forged.operations.workflows[0]!
    const production = forged.studio.activeProductions[0]!
    mutable(workflow).reservations = []
    const project = forged.scriptDevelopment.projects.find(
      (candidate) => candidate.status === 'drafting',
    )!
    mutable(project).reservation = null

    const presence = studioPresence(forged)
    expect(presence.people.some((person) => person.talentId === production.directorId)).toBe(false)
    expect(
      presence.withheld.find((entry) => entry.talentId === production.directorId)!.reason,
    ).toMatch(/holds no .* reservation/)
    expect(presence.withheld).toContainEqual({
      talentId: project.writerId,
      reason: `screenplay "${project.id}" is drafting without a reservation`,
    })
  })

  it('withholds a person whose talent record has no usable name', () => {
    const legal = busyStudio('presence-nameless')
    const forged = forge(legal)
    const person = forged.talent.find(
      (candidate) => candidate.id === forged.studio.activeProductions[0]!.directorId,
    )!
    mutable(person).name = ''

    const presence = studioPresence(forged)
    expect(presence.withheld).toContainEqual({
      talentId: person.id,
      reason: 'talent record has no usable name or primary role',
    })
  })

  it('withholds the WHOLE week when the ambiguity is global, and never throws', () => {
    const legal = busyStudio('presence-global')
    const cases: { break: (state: GameState) => void; reason: RegExp }[] = [
      { break: (s) => void (mutable(s.market).tick = -1), reason: /market\.tick/ },
      { break: (s) => void (mutable(s.market).tick = 1.5), reason: /market\.tick/ },
      { break: (s) => void (mutable(s).seed = ''), reason: /seed/ },
      { break: (s) => void (mutable(s).talent = null), reason: /talent/ },
      { break: (s) => void (mutable(s).contracts = 'nope'), reason: /contracts/ },
      { break: (s) => void (mutable(s.studio).activeProductions = null), reason: /activeProductions/ },
      { break: (s) => void (mutable(s).operations = { mode: 'managed' }), reason: /operations/ },
      { break: (s) => void (mutable(s).scriptDevelopment = {}), reason: /scriptDevelopment/ },
      { break: (s) => void (mutable(s).castingSessions = { mode: 'managed' }), reason: /castingSessions/ },
    ]
    for (const testCase of cases) {
      const forged = forge(legal)
      testCase.break(forged)
      const presence = studioPresence(forged)
      expect(presence.week).toBeNull()
      expect(presence.people).toEqual([])
      expect(presence.withheld.length).toBeGreaterThan(0)
      expect(presence.withheld.every((entry) => entry.talentId === null)).toBe(true)
      expect(presence.withheld.some((entry) => testCase.reason.test(entry.reason))).toBe(true)
    }
    expect(() => studioPresence(undefined as unknown as GameState)).not.toThrow()
    expect(studioPresence(undefined as unknown as GameState)).toEqual({
      week: null,
      people: [],
      withheld: [{ talentId: null, reason: 'state is not an object' }],
    })
  })

  it('projects an empty week for a headless world that has no studio at all', () => {
    const state = busyStudio('presence-headless')
    const forged = forge(state)
    mutable(forged).contracts = []
    mutable(forged).operations = { mode: 'legacy', facilities: [], workflows: [] }
    mutable(forged).scriptDevelopment = { mode: 'legacy', projects: [] }
    mutable(forged).castingSessions = { mode: 'legacy', sessions: [] }
    mutable(forged.studio).activeProductions = []

    const presence = studioPresence(forged)
    expect(presence).toEqual({ week: forged.market.tick, people: [], withheld: [] })
  })

  it('sends every unclaimed contracted member to their profession home facility (LL-CP1 canon)', () => {
    const state = busyStudio('presence-roster-attendance')
    const presence = studioPresence(state)
    const roster = presence.people.filter((person) => person.engagement === 'roster')
    expect(roster.length).toBeGreaterThan(0)
    for (const person of roster) {
      expect(person.site).toBe(rosterHomeFacilityId(person.role))
      expect(person.slot).toBeNull()
      expect(person.ownerId).toBeNull()
      expect(person.credit).toBeNull()
      expect(person.beats).toContain('travel')
      expect(person.beats).toContain('at-site')
      expect(person.beats[BEATS_PER_WEEK - 1]).toBe('home')
      expect(person.beats.includes('waiting')).toBe(false)
    }
    expect(rosterHomeFacilityId('writer')).toBe('facility-development-casting')
    expect(rosterHomeFacilityId('director')).toBe('facility-development-casting')
    expect(rosterHomeFacilityId('actor')).toBe('facility-development-casting')
    expect(rosterHomeFacilityId('craft')).toBe('facility-scenery-shop')
    expect(rosterHomeFacilityId('gaffer')).toBeNull()
  })

  it('keeps an unclaimed contracted member home when their home facility does not exist', () => {
    const state = busyStudio('presence-roster-no-home')
    const forged = forge(state)
    mutable(forged.operations).facilities = state.operations.facilities.filter(
      (facility) => facility.id !== 'facility-development-casting' &&
        facility.id !== 'facility-scenery-shop',
    )
    const presence = studioPresence(forged)
    const roster = presence.people.filter((person) => person.engagement === 'roster')
    expect(roster.length).toBeGreaterThan(0)
    for (const person of roster) {
      expect(person.site).toBeNull()
      expect(person.beats.every((beat) => beat === 'home')).toBe(true)
    }
  })
})
