import { beforeAll, describe, expect, it } from 'vitest'
import { exportCurrentState, importSave, makeSave, migrateToV20 } from '../src/core/save.js'
import { validateTechnology } from '../src/core/technology.js'
import type { IndustryFilm } from '../src/core/hollywoodTypes.js'
import type { GameState } from '../src/core/types.js'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

let source: GameState
let sourceJson: string
let studioId: string
let productionId: string

beforeAll(() => {
  source = advanceTo(p13aGeneratedStudio('p13a-technology-membership'), 428)
  const historical = source.technology.productions.find(row => row.studioId !== source.hollywood!.playerStudioId &&
    !source.hollywood!.businesses.find(business => business.studioId === row.studioId)!.productions.some(production => production.id === row.productionId) &&
    source.hollywood!.films.some(film => film.studioId === row.studioId && film.filmId === row.productionId && film.provenance === 'simulation/v1'))
  if (!historical) throw new Error('The actual week428 fixture must contain a recorded historical rival loadout')
  studioId = historical.studioId
  productionId = historical.productionId
  sourceJson = exportCurrentState(source)
}, 30_000)

const copy = () => structuredClone(source)
const loadout = (state: GameState) => state.technology.productions.find(row => row.studioId === studioId && row.productionId === productionId)!
const film = (state: GameState) => state.hollywood!.films.find(row => row.studioId === studioId && row.filmId === productionId)!

describe('P13A exact historical technology membership under local indexing', () => {
  it('rejects an absent historical film with the existing unknown-loadout refusal', () => {
    const state = copy()
    loadout(state).productionId = 'missing-historical-film'
    expect(() => makeSave(state)).toThrow('unknown production loadout')
  })

  it('rejects a real historical film claimed by another entered studio', () => {
    const state = copy()
    const other = state.hollywood!.businesses.find(business => business.studioId !== studioId)!
    expect(state.hollywood!.identities.find(identity => identity.studioId === other.studioId)?.enteredWeek).not.toBeNull()
    expect(film(state).studioId).toBe(studioId)
    Object.assign(loadout(state), {studioId: other.studioId, method: 'silent', adoptionId: null})
    expect(() => makeSave(state)).toThrow('unknown production loadout')
  })

  it('still rejects an exact duplicate original Hollywood film after indexed membership succeeds', () => {
    const state = copy()
    state.hollywood!.films.push(structuredClone(film(state)))
    expect(() => validateTechnology(state)).not.toThrow()
    expect(() => makeSave(state)).toThrow('duplicate film identity')
  })

  it('still rejects a malformed null film in the original source array', () => {
    const state = copy()
    state.hollywood!.films.push(null as unknown as IndustryFilm)
    // The full original boundary must reject; the exact first validator may
    // differ when malformed input is encountered while deriving the index.
    expect(() => makeSave(state)).toThrow()
  })

  it('does not discard an unknown field on an original Hollywood film', () => {
    const state = copy()
    Object.assign(film(state), {unrecordedAuthority: undefined})
    expect(() => validateTechnology(state)).not.toThrow()
    expect(() => makeSave(state)).toThrow(/exact keys|unknown/i)
    expect(Object.hasOwn(film(state), 'unrecordedAuthority')).toBe(true)
  })

  it.each(['productionId', 'studioId'] as const)('keeps the bounded-identity refusal for a blank %s', key => {
    const state = copy()
    loadout(state)[key] = ''
    expect(() => makeSave(state)).toThrow('bounded identity required')
  })

  it('does not reuse membership across independent round-tripped copies with the same world and entity IDs', () => {
    const original = migrateToV20(importSave(sourceJson)).state
    const branch = migrateToV20(importSave(sourceJson)).state
    expect(branch).not.toBe(original)
    expect(branch.hollywood!.worldId).toBe(original.hollywood!.worldId)
    expect(loadout(branch)).toEqual(loadout(original))
    expect(() => validateTechnology(original)).not.toThrow()
    branch.hollywood!.films = branch.hollywood!.films.filter(row => row.studioId !== studioId || row.filmId !== productionId)
    // This deliberate branch forgery isolates membership itself. The real
    // Save As suite separately proves lawful independent campaign evolution.
    expect(() => validateTechnology(branch)).toThrow('unknown production loadout')
    expect(() => makeSave(branch)).toThrow('unknown production loadout')
    expect(exportCurrentState(original)).toBe(sourceJson)
  })

  it('rechecks the same mutable input after removal and after exact restoration', () => {
    const state = copy()
    const before = exportCurrentState(state)
    expect(() => validateTechnology(state)).not.toThrow()
    const index = state.hollywood!.films.findIndex(row => row.studioId === studioId && row.filmId === productionId)
    const removed = state.hollywood!.films.splice(index, 1)[0]!
    expect(() => validateTechnology(state)).toThrow('unknown production loadout')
    state.hollywood!.films.splice(index, 0, removed)
    expect(() => validateTechnology(state)).not.toThrow()
    expect(exportCurrentState(state)).toBe(before)
    expect(exportCurrentState(source)).toBe(sourceJson)
  })
})
