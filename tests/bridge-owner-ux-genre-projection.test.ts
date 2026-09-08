import { describe, expect, it } from 'vitest'
import { generateWorld } from '../src/core/index.js'
import type { GameState } from '../src/core/index.js'
import { peopleProjection } from '../bridge/people.ts'

// Deliberately distinct public/hidden values and acting/writing strengths.
// This is a projection fixture, not a claimed gameplay route or newly granted skill.
function fixture(): { state: GameState; actorId: string; otherId: string } {
  const state = generateWorld('owner-ux-public-genre-grid')
  const actor = state.talent.find((talent) => talent.role === 'actor')!
  const other = state.talent.find((talent) => talent.id !== actor.id)!
  other.name = actor.name
  for (const talent of [actor, other]) {
    for (const cells of Object.values(talent.genreExperience)) {
      for (const cell of Object.values(cells)) {
        cell.perceived = 0
        cell.actual = 95
      }
    }
  }
  actor.genreExperience.acting.horror.perceived = 83
  actor.genreExperience.writing.drama.perceived = 61.25
  actor.genreExperience.writing.comedy.perceived = 14.5
  actor.workHistory.writing = 0
  other.genreExperience.writing.drama.perceived = 2
  return { state, actorId: actor.id, otherId: other.id }
}

describe('Owner UX public discipline/genre experience', () => {
  it('publishes all 24 labelled perceived cells, retaining zero and fractional values', () => {
    const { state, actorId } = fixture()
    const profile = peopleProjection(state).profiles.find((person) => person.talentId === actorId)!
    expect(profile.genreExperience).toHaveLength(24)
    const expectedDisciplines = ['acting', 'writing', 'directing', 'craft']
    const expectedGenres = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']
    expect(profile.genreExperience.map((cell) => `${cell.discipline}/${cell.genre}`)).toEqual(
      expectedDisciplines.flatMap((discipline) => expectedGenres.map((genre) => `${discipline}/${genre}`)),
    )
    expect(profile.genreExperience.find((cell) => cell.discipline === 'writing' && cell.genre === 'drama')).toEqual({
      discipline: 'writing', genre: 'drama', label: 'Drama', perceived: 61.25,
    })
    expect(profile.genreExperience.find((cell) => cell.discipline === 'writing' && cell.genre === 'horror')).toEqual({
      discipline: 'writing', genre: 'horror', label: 'Horror', perceived: 0,
    })
    for (const cell of profile.genreExperience) {
      expect(Object.keys(cell).sort()).toEqual(['discipline', 'genre', 'label', 'perceived'])
    }
  })

  it('keeps an Actor\'s writing experience separate from home specialties and campaign credits', () => {
    const { state, actorId } = fixture()
    const profile = peopleProjection(state).profiles.find((person) => person.talentId === actorId)!
    expect(profile.profession).toBe('actor')
    expect(profile.primaryDiscipline).toBe('acting')
    expect(profile.specialties).toEqual([
      { discipline: 'acting', genre: 'horror', label: 'Horror', perceived: 83 },
    ])
    const writing = profile.genreExperience.filter((cell) => cell.discipline === 'writing')
    expect(writing.find((cell) => cell.genre === 'drama')!.perceived).toBe(61.25)
    expect(writing.find((cell) => cell.genre === 'horror')!.perceived).toBe(0)
    expect(profile.disciplines.find((discipline) => discipline.discipline === 'writing')!.workHistory).toBe(0)
    expect(profile.career.rows).toHaveLength(0)
  })

  it('never publishes hidden actual experience or changes public cells when only actual changes', () => {
    const { state, actorId } = fixture()
    const before = peopleProjection(state).profiles.find((person) => person.talentId === actorId)!.genreExperience
    const changed = structuredClone(state)
    const actor = changed.talent.find((person) => person.id === actorId)!
    for (const cells of Object.values(actor.genreExperience)) {
      for (const cell of Object.values(cells)) cell.actual = 7
    }
    const after = peopleProjection(changed).profiles.find((person) => person.talentId === actorId)!.genreExperience
    expect(after).toEqual(before)
    expect(JSON.stringify(after)).not.toContain('actual')
  })

  it('joins same-name people by ID and preserves canonical cells when talent order changes', () => {
    const { state, actorId, otherId } = fixture()
    const profiles = peopleProjection(state).profiles
    const actor = profiles.find((person) => person.talentId === actorId)!
    const other = profiles.find((person) => person.talentId === otherId)!
    expect(actor.name).toBe(other.name)
    expect(actor.genreExperience.find((cell) => cell.discipline === 'writing' && cell.genre === 'drama')!.perceived).toBe(61.25)
    expect(other.genreExperience.find((cell) => cell.discipline === 'writing' && cell.genre === 'drama')!.perceived).toBe(2)
    const reordered = peopleProjection({ ...state, talent: [...state.talent].reverse() }).profiles
    expect(reordered.find((person) => person.talentId === actorId)!.genreExperience).toEqual(actor.genreExperience)
  })

  it('returns fresh cell objects and arrays without mutating state or later projections', () => {
    const { state, actorId } = fixture()
    const stateBefore = JSON.stringify(state)
    const served = peopleProjection(state).profiles.find((person) => person.talentId === actorId)!
    const expected = structuredClone(served.genreExperience)
    served.genreExperience[0]!.perceived = 100
    served.genreExperience[0]!.label = 'Mutated'
    served.genreExperience.reverse()
    served.genreExperience.pop()
    expect(JSON.stringify(state)).toBe(stateBefore)
    expect(peopleProjection(state).profiles.find((person) => person.talentId === actorId)!.genreExperience).toEqual(expected)
  })

  it('normalizes a perceived negative zero to the JSON wire zero without changing talent', () => {
    const { state, actorId } = fixture()
    const actor = state.talent.find(person => person.id === actorId)!
    actor.genreExperience.writing.horror.perceived = -0
    const cell = peopleProjection(state).profiles.find(person => person.talentId === actorId)!
      .genreExperience.find(cell => cell.discipline === 'writing' && cell.genre === 'horror')!
    expect(Object.is(cell.perceived, 0)).toBe(true)
    expect(Object.is(actor.genreExperience.writing.horror.perceived, -0)).toBe(true)
    expect(JSON.parse(JSON.stringify(cell))).toEqual(cell)
  })
})
