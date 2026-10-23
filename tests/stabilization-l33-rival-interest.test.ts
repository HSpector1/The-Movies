// Stabilization 2026-10-23, Owner decision 10A on audit finding L-33 (FAC-07).
//
// A paused, zero-work player project barred every rival from its technology for good: the rival
// research policy (`interests()` in src/core/rivalResearch.ts) stood the industry down for ANY
// uncancelled project of another studio, and a seat could open such a project before the
// technology was researchable at all, so rivals kept buying Laboratories and never researched.
// The rulings: only a started project stands the rivals down, and `assignSeat` refuses a seat
// before the technology's researchable week.
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { campaignDate } from '../src/core/calendar.js'
import { admitRivalPlans } from '../src/core/rivalResearch.js'
import { stableStringify } from '../src/core/save.js'
import { researchCandidates } from '../src/core/technology.js'
import { technologyEntry, type TechnologyCatalogueEntry } from '../src/core/technologyCatalogue.js'
import type { TechnologyId } from '../src/core/technologyTypes.js'
import type { GameState } from '../src/core/types.js'
import { p13aLaboratorySlice, p13aResearchEntry } from '../src/harness/p13a/fixtures.js'

const SOUND = technologyEntry('synchronized-sound')
const LIGHTING = technologyEntry('lighting-control-01')
const refusal = (entry: TechnologyCatalogueEntry) =>
  `${entry.name} research opens ${campaignDate(entry.researchableWeek).label}. Assign a Laboratory seat from that week.`

/** The player's first named Scientist candidate, employed on its one Laboratory. */
function hired(state: GameState): { state: GameState; laboratoryFacilityId: string; scientistId: string } {
  const laboratoryFacilityId = state.operations.facilities.find((f) => f.capability === 'laboratory')!.id
  const scientistId = researchCandidates(state)[0]!.id
  return { state: applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId, scientistId }]), laboratoryFacilityId, scientistId }
}
const seat = (h: ReturnType<typeof hired>, technologyId: TechnologyId): GameState =>
  applyActions(h.state, [{ kind: 'assignResearchScientist', laboratoryFacilityId: h.laboratoryFacilityId, scientistId: h.scientistId, technologyId }])
const playerProjects = (state: GameState) => state.technology.projects.filter((p) => p.studioId === state.hollywood!.playerStudioId)

/** The rival sound-instrument plans this week's rival admission decision commits. */
function rivalSoundModules(state: GameState) {
  const own = state.hollywood!.playerStudioId
  return admitRivalPlans(state).state.physicalPlans.plans
    .filter((plan) => plan.studioId !== own && plan.work.blueprintId === SOUND.instrumentBlueprintId)
}

describe('L-33: rival research interest and the researchable-week seat law', () => {
  // Generated worlds only: week 12 (Laboratory complete) and week 260 (sound researchable, the
  // player's Laboratory equipped, no project). `paused` seats one Scientist on sound at 260 and
  // never begins: the paused, zero-work project the finding names.
  let slice: GameState, entry: GameState, paused: GameState
  beforeAll(() => {
    slice = p13aLaboratorySlice()
    entry = p13aResearchEntry()
    paused = seat(hired(entry), 'synchronized-sound')
  }, 120_000)

  it('a seat before the researchable week is refused by name, with the week in the sentence, and changes nothing', () => {
    const early = hired(slice)
    expect(early.state.market.tick).toBe(12)
    const before = stableStringify(early.state)
    expect(() => seat(early, 'synchronized-sound'))
      .toThrow('Synchronized sound research opens 1925 · Week 1. Assign a Laboratory seat from that week.')
    expect(() => seat(early, 'lighting-control-01')).toThrow(refusal(LIGHTING))
    expect(stableStringify(early.state)).toBe(before)
    expect(playerProjects(early.state)).toEqual([])
    // Sound's researchable week does not open lighting.
    expect(() => seat(hired(entry), 'lighting-control-01')).toThrow(refusal(LIGHTING))
  })

  it('from the researchable week the seat is admitted as before: a paused, zero-work project holding it', () => {
    expect(paused.market.tick).toBe(SOUND.researchableWeek)
    expect(playerProjects(paused)).toMatchObject([{ technologyId: SOUND.id, status: 'paused', startedWeek: null,
      verifiedWork: 0, expenditure: 0, seats: [{ assignedWeek: SOUND.researchableWeek, releasedWeek: null }] }])
  })

  it('the rival research decision is the same with and without that paused, zero-work project, and it pursues sound', () => {
    const without = rivalSoundModules(entry)
    expect(without.length, 'premise: rivals equip a Laboratory for sound in its researchable week').toBeGreaterThan(0)
    expect(rivalSoundModules(paused)).toEqual(without)
  })

  it('a started player project still stands the rivals down', () => {
    const projectId = playerProjects(paused)[0]!.id
    const started = applyActions(paused, [{ kind: 'beginResearch', projectId, budgetPerWeek: 10_000 }])
    expect(playerProjects(started)[0]).toMatchObject({ status: 'active', startedWeek: SOUND.researchableWeek })
    expect(rivalSoundModules(started)).toEqual([])
  })
})
