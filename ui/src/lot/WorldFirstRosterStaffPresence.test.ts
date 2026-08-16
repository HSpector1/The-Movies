// ── World-First Roster Staff Presence V1 (M1.5) ───────────────────────────────
//
// Playtest 1: "zero named employees on the Week-0 lot". The adapter projected roster
// people only in LEGACY mode, so a managed studio's own staff simply did not exist in
// the world. These specs pin the managed-mode projection:
//
//   • every contracted employee is present, exactly once, as `studio-roster` with NO
//     production claim (the scene parks them; nothing here claims a location or a task);
//   • an active production's company keeps `active-production` authority and is never
//     duplicated as roster;
//   • ambiguous or malformed employment truth is WITHHELD, never guessed at;
//   • the existing person inspector resolves a roster person truthfully.

import { describe, expect, it } from 'vitest'
import { applyActions } from '../../../src/core/index.ts'
import {
  greenlight,
  requiredNegative,
  studioLotSnapshot,
} from '../engine/adapter.ts'
import type { CreativeRole, DraftPackage, GameState } from '../engine/adapter.ts'
import { foundedRosterIds, newFoundedGame } from '../test/founding.ts'
import { lotPersonWorkContext } from './snapshot/personWork.ts'

function managedStudio(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const ids = (role: CreativeRole) => foundedRosterIds(state, role)
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: {
        intimacy: [-0.4, 0.4],
        tonalWeight: [-0.4, 0.4],
        kineticEnergy: [-0.4, 0.4],
      },
    },
    writerId: ids('writer')[0]!,
    directorId: ids('director')[0]!,
    craftIds: [ids('craft')[0]!],
    cast: {
      lead: ids('actor')[0]!,
      antagonist: ids('actor')[1]!,
      support: ids('actor')[2]!,
    },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

function withOnePicture(seed: string): GameState {
  const result = greenlight(managedStudio(seed), legalPackage(managedStudio(seed)))
  if (!result.ok) throw new Error(result.error)
  return result.next
}

function contractedIds(state: GameState): Set<string> {
  return new Set(state.contracts.map((contract) => contract.talentId))
}

describe('managed roster staff presence — the studio’s own employees are on its lot', () => {
  it('projects every contracted employee exactly once at Week 0, claiming no picture', () => {
    const state = managedStudio('roster-presence-week-zero')
    const snapshot = studioLotSnapshot(state)
    const contracted = contractedIds(state)

    expect(snapshot.operationsMode).toBe('managed')
    expect(snapshot.people.map((person) => person.id).sort()).toEqual([...contracted].sort())
    expect(new Set(snapshot.people.map((person) => person.id)).size).toBe(snapshot.people.length)
    for (const person of snapshot.people) {
      expect(person.authority).toBe('studio-roster')
      expect(person.productionId).toBeNull()
      expect(person.productionTitle).toBeNull()
      expect(person.name).toBe(state.talent.find((talent) => talent.id === person.id)!.name)
    }
  })

  it('never puts an uncontracted free agent on the lot', () => {
    const state = managedStudio('roster-presence-free-agents')
    const contracted = contractedIds(state)
    const freeAgents = state.talent.filter((talent) => !contracted.has(talent.id))

    expect(freeAgents.length).toBeGreaterThan(0)
    const projected = new Set(studioLotSnapshot(state).people.map((person) => person.id))
    expect(freeAgents.some((talent) => projected.has(talent.id))).toBe(false)
  })

  it('uses the accepted presentation-role convention without relabelling a profession', () => {
    const state = managedStudio('roster-presence-roles')
    const snapshot = studioLotSnapshot(state)
    for (const person of snapshot.people) {
      const talent = state.talent.find((candidate) => candidate.id === person.id)!
      expect(person.role).toBe(talent.role === 'director' ? 'director' : 'talent')
    }
    expect(snapshot.people.some((person) => person.role === 'director')).toBe(true)
    expect(snapshot.people.some((person) => person.role === 'talent')).toBe(true)
  })

  it('is independent of contract and talent array order', () => {
    const state = managedStudio('roster-presence-order')
    const reversed: GameState = {
      ...state,
      contracts: [...state.contracts].reverse(),
      talent: [...state.talent].reverse(),
    }
    expect(studioLotSnapshot(reversed).people).toEqual(studioLotSnapshot(state).people)
  })

  it('does not mutate the state it reads', () => {
    const state = managedStudio('roster-presence-pure')
    const before = JSON.stringify(state)
    studioLotSnapshot(state)
    expect(JSON.stringify(state)).toBe(before)
  })

  it('opens the existing person inspector truthfully for a roster employee', () => {
    const state = managedStudio('roster-presence-inspector')
    const snapshot = studioLotSnapshot(state)
    const person = snapshot.people[0]!
    const work = lotPersonWorkContext(snapshot, person.id)
    expect(work.kind).toBe('roster')
    expect(work.person?.id).toBe(person.id)
  })
})

describe('managed roster staff presence — company presence takes precedence', () => {
  it('keeps a company member on their picture and never lists them twice', () => {
    const state = withOnePicture('roster-presence-company')
    const snapshot = studioLotSnapshot(state)
    const production = state.studio.activeProductions[0]!
    const companyIds = new Set([
      production.writerId,
      production.directorId,
      production.cast.lead,
      production.cast.antagonist,
      production.cast.support,
      ...production.craftIds,
    ])

    expect(new Set(snapshot.people.map((person) => person.id)).size).toBe(snapshot.people.length)
    for (const id of companyIds) {
      const rows = snapshot.people.filter((person) => person.id === id)
      expect(rows).toHaveLength(1)
      expect(rows[0]!.authority).toBe('active-production')
      expect(rows[0]!.productionId).toBe(production.id)
    }
    // Everyone else on the payroll is still present, and still claims no picture.
    const rest = snapshot.people.filter((person) => !companyIds.has(person.id))
    expect(rest.length).toBeGreaterThan(0)
    expect(rest.every((person) =>
      person.authority === 'studio-roster' &&
      person.productionId === null &&
      person.productionTitle === null,
    )).toBe(true)
    expect(snapshot.people.map((person) => person.id).sort()).toEqual(
      [...contractedIds(state)].sort(),
    )
  })

  it('leaves a hostile company’s Director/Lead fallback pair to the production path', () => {
    const legal = withOnePicture('roster-presence-hostile-company')
    const production = legal.studio.activeProductions[0]!
    // No craft member: the complete-company proof fails atomically and the adapter falls
    // back to the independently safe Director/Lead pair.
    const hostile: GameState = {
      ...legal,
      studio: {
        ...legal.studio,
        activeProductions: [{ ...production, craftIds: [] }],
      },
    }
    const snapshot = studioLotSnapshot(hostile)

    expect(snapshot.productionOperations?.every((row) => row.companyMembers === undefined)).toBe(true)
    expect(new Set(snapshot.people.map((person) => person.id)).size).toBe(snapshot.people.length)
    for (const id of [production.directorId, production.cast.lead]) {
      const rows = snapshot.people.filter((person) => person.id === id)
      expect(rows).toHaveLength(1)
      expect(rows[0]!.authority).toBe('active-production')
    }
    // The writer is a contracted employee with an unambiguous assignment: present, and
    // present as roster — presence never invents a picture credit the engine did not give.
    const writerRows = snapshot.people.filter((person) => person.id === production.writerId)
    expect(writerRows).toHaveLength(1)
    expect(writerRows[0]!.authority).toBe('studio-roster')
    expect(writerRows[0]!.productionId).toBeNull()
  })
})

describe('managed roster staff presence — hostile employment truth is withheld', () => {
  it('withholds the WHOLE roster projection when one identity is contracted twice', () => {
    const state = managedStudio('roster-presence-duplicate-contract')
    const duplicated: GameState = {
      ...state,
      contracts: [...state.contracts, { ...state.contracts[0]! }],
    }
    expect(studioLotSnapshot(duplicated).people).toEqual([])
  })

  it.each([
    [
      'an empty contract identity',
      (state: GameState): GameState => ({
        ...state,
        contracts: [{ ...state.contracts[0]!, talentId: '' }, ...state.contracts.slice(1)],
      }),
    ],
    [
      'a contract naming a talent the studio does not have',
      (state: GameState): GameState => ({
        ...state,
        talent: state.talent.filter((talent) => talent.id !== state.contracts[0]!.talentId),
      }),
    ],
  ])('fails the whole snapshot closed for %s, so presence never has to guess', (_label, corrupt) => {
    // These two shapes never reach the presence projection: the accepted read-model
    // boundary already refuses to name an employee it cannot resolve, and the snapshot
    // fails closed as a whole. The projection's own skip is the second line of defence.
    const state = managedStudio('roster-presence-unresolvable')
    expect(() => studioLotSnapshot(corrupt(state))).toThrow(/unknown talent/)
  })

  it('skips a person whose identity is duplicated in the talent set', () => {
    const state = managedStudio('roster-presence-duplicate-talent')
    const twinId = state.contracts[0]!.talentId
    const twin = state.talent.find((talent) => talent.id === twinId)!
    const doubled: GameState = {
      ...state,
      talent: [{ ...twin, name: 'Hostile duplicate name' }, ...state.talent],
    }
    const people = studioLotSnapshot(doubled).people
    expect(people.some((person) => person.id === twinId)).toBe(false)
    expect(people.length).toBe(state.contracts.length - 1)
  })

  it('skips a person whose current engagement is ambiguous', () => {
    const legal = withOnePicture('roster-presence-ambiguous')
    const production = legal.studio.activeProductions[0]!
    // The same person recorded in two cast slots: employment is real, but which picture
    // credit they hold is not answerable, so presence withholds them entirely.
    const ambiguous: GameState = {
      ...legal,
      studio: {
        ...legal.studio,
        activeProductions: [
          { ...production, cast: { ...production.cast, support: production.cast.antagonist } },
        ],
      },
    }
    const people = studioLotSnapshot(ambiguous).people
    expect(people.some((person) => person.id === production.cast.antagonist)).toBe(false)
  })
})
