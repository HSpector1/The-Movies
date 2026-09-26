// Independent C.2 Scientist amendment fixtures, record 840 / Owner 773 §10.
// The V33 bytes are genuine. Age variants are explicitly SYNTHETIC in-memory
// inputs, never rewritten corpus/history; all later work uses public commands/tick.
import { expect } from 'vitest'
import { applyActions } from '../../src/core/actions.js'
import { ageAt, anchorOf, recomputeDue } from '../../src/core/aging.js'
import { contractEndRefusal, lifecycleStatus } from '../../src/core/careerLifecycle.js'
import { activeContract } from '../../src/core/employment.js'
import { importSave, makeSave, migrateToLive } from '../../src/core/save.js'
import { eligibleSeatIds, occupiedSeats, researchCandidates } from '../../src/core/technology.js'
import { advanceTo } from '../../src/harness/p13a/fixtures.js'
import type { Action, CreativeRole, GameState, TalentProvenanceRow } from '../../src/core/types.js'
import { c2Fixture } from './p14c2a-fixtures.js'
import { fund } from './p14b2-fixtures.js'

export { advanceTo }
export const SCI = 't-sci-00'
export const SCI_BIRTHDAY = 566
export const SCI_END = 728
export const owner = (state: GameState) => state.hollywood!.playerStudioId
export const labId = (state: GameState) => state.operations.facilities.find(f => f.capability === 'laboratory')!.id
export const project = (state: GameState) => state.technology.projects.find(p =>
  p.studioId === owner(state) && p.technologyId === 'synchronized-sound')!
export const saveRoundTrip = (state: GameState): GameState =>
  migrateToLive(importSave(JSON.stringify(makeSave(state)))).state

let genuine: GameState | undefined
export function scientistWorld(): GameState {
  if (genuine === undefined) {
    const frozen = c2Fixture('genuine-v33-c2-scientist')
    // The helper's cast is NOT permission to tick a frozen state. Explicit lift first.
    genuine = migrateToLive({ saveVersion: 33, seed: frozen.seed, state: frozen,
      broadcastCache: frozen.broadcastItems } as Parameters<typeof migrateToLive>[0]).state
    expect(genuine.market.tick).toBe(520)
    expect(genuine.talent.find(t => t.id === SCI)).toMatchObject({ role: 'scientist', age: 61 })
    expect(project(genuine)).toMatchObject({ status: 'paused', verifiedWork: 0, expenditure: 0, weeks: [] })
  }
  return structuredClone(genuine)
}

/** Changes ONLY age authority/cache for explicitly named materialized people.
 * Anchor week/kind, identity, employment, research and every dated receipt stay put.
 * No retired person or terminal lifecycle record is ever reopened by this helper. */
export function withSyntheticAgeShift(state: GameState, shifts: ReadonlyMap<string, number>): GameState {
  const rows: TalentProvenanceRow[] = state.talentProvenance.rows.map(row => {
    const delta = shifts.get(row.personId)
    if (delta === undefined) return row
    expect(state.careerLifecycle.records.some(r => r.personId === row.personId)).toBe(false)
    return row.kind === 'legacy_age_anchor' ? { ...row, ageAtMigration: row.ageAtMigration + delta }
      : { ...row, ageAtEntry: row.ageAtEntry + delta }
  })
  const talent = state.talent.map(person => shifts.has(person.id)
    ? { ...person, age: ageAt(rows.find(row => row.personId === person.id)!, state.market.tick) } : person)
  const ages = new Map(talent.map(person => [person.id, person.age]))
  const variant = { ...state, talent, talentProvenance: { ...state.talentProvenance, rows,
    due: recomputeDue(rows, id => ages.get(id)) } }
  expect(variant.hollywood!.employment).toEqual(state.hollywood!.employment)
  expect(variant.technology).toEqual(state.technology)
  return saveRoundTrip(variant) // whole-save acceptance, not a permissive record cast
}

export type ScientistMode = 'genuine' | 'eligible62' | 'hardIdle' | 'hardResearch' | 'hardFilm'
const checkpoints = new Map<ScientistMode, Map<number, GameState>>()
/** Detached copies of a deterministic bounded campaign; no future-law assertions
 * here, so old-production RED reaches the behavior named in each test. */
export function scientistAt(mode: ScientistMode, week: number): GameState {
  let points = checkpoints.get(mode)
  if (points === undefined) {
    let state = scientistWorld()
    const delta = mode === 'eligible62' ? -1 : mode.startsWith('hard') ? 10 : 0
    if (delta !== 0) state = withSyntheticAgeShift(state, new Map([[SCI, delta]]))
    if (mode === 'hardResearch' || mode === 'hardFilm') {
      state = applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(state), scientistId: SCI }])
      expect(activeContract(state, SCI)).toMatchObject({ startWeek: 520, endWeekExclusive: SCI_END, termWeeks: 208 })
    }
    points = new Map([[520, state]])
    checkpoints.set(mode, points)
  }
  if (week < 520) throw new Error('Scientist fixture cannot rewind the genuine corpus')
  const previous = [...points.keys()].filter(w => w <= week).sort((a, b) => b - a)[0]!
  let state = points.get(previous)!
  if (mode === 'hardResearch' && state.market.tick < 565 && week >= 565) {
    state = advanceTo(state, 565)
    state = applyActions(state, [{ kind: 'beginResearch', projectId: project(state).id, budgetPerWeek: 0 }])
    points.set(565, state)
  }
  // One Scientist produces ONE unit/week at budget 0 (8*20,000/160,000),
  // not 0.125. An uninterrupted project would finish629. These explicit public
  // pause/resume decisions keep genuine unfinished work for the expiry boundary.
  if (mode === 'hardResearch' && state.market.tick < 567 && week >= 567) {
    state = advanceTo(state, 567)
    state = applyActions(state, [{ kind: 'pauseResearch', projectId: project(state).id }])
    points.set(567, state)
  }
  if (mode === 'hardResearch' && state.market.tick < 716 && week >= 716) {
    state = advanceTo(state, 716)
    state = applyActions(state, [{ kind: 'resumeResearch', projectId: project(state).id }])
    points.set(716, state)
  }
  state = advanceTo(state, week)
  points.set(week, state)
  return structuredClone(state)
}

export function scientistSupply(state: GameState) {
  const candidates = researchCandidates(state)
  const materialized = candidates.filter(candidate => state.talent.some(t => t.id === candidate.id))
  const activeEmployment = (id: string, studioId: string) => state.hollywood!.employment.some(row =>
    row.terms.talentId === id && row.studioId === studioId && row.terms.startWeek <= state.market.tick &&
    state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive))
  const canRecruit = (id: string): boolean => {
    try { applyActions(state, [{ kind: 'recruitScientist', laboratoryFacilityId: labId(state), scientistId: id }]); return true }
    catch { return false }
  }
  return {
    week: state.market.tick, rawIds: candidates.map(t => t.id), materializedIds: materialized.map(t => t.id),
    latentIds: candidates.filter(t => !state.talent.some(person => person.id === t.id)).map(t => t.id),
    statuses: materialized.map(t => ({ personId: t.id, status: lifecycleStatus(state, t.id) })),
    // Latent candidates have generated entry ages, NOT historical aging records.
    lifecycleTermHireableIds: candidates.filter(t => contractEndRefusal(state, t.id, state.market.tick + 208) === null).map(t => t.id),
    recruitableIds: candidates.filter(t => canRecruit(t.id)).map(t => t.id),
    playerEmployedIds: materialized.filter(t => activeEmployment(t.id, owner(state))).map(t => t.id),
    rivalEmployedIds: state.talent.filter(t => t.role === 'scientist' && state.hollywood!.identities.some(identity =>
      identity.studioId !== owner(state) && activeEmployment(t.id, identity.studioId))).map(t => t.id),
    occupiedSeatIds: occupiedSeats(project(state)).map(s => s.talentId),
    eligibleSeatIds: eligibleSeatIds(state, project(state)),
    verifiedWork: project(state).verifiedWork,
    scientistIds: state.talent.filter(t => t.role === 'scientist').map(t => t.id),
  }
}

let exhausted: GameState | undefined
/** Honest exhaustion stress input: materialize all EIGHT via real recruitment at
 * 520, then shift their age anchors by whole years so each is 71 now. Each keeps
 * its actual birthday fraction, contract, provenance kind/week and receipts.
 * No latent person is claimed to have aged while absent, and no ninth is created. */
export function exhaustedScientistPool(): GameState {
  if (exhausted === undefined) {
    let state = fund(scientistWorld()) // explicitly ledger-balanced cash bootstrap
    for (const candidate of researchCandidates(state)) state = applyActions(state, [
      { kind: 'recruitScientist', laboratoryFacilityId: labId(state), scientistId: candidate.id },
    ])
    const shifts = new Map(researchCandidates(state).map(person => [person.id, 71 - person.age]))
    state = withSyntheticAgeShift(state, shifts)
    for (const candidate of researchCandidates(state)) {
      const row = state.talentProvenance.rows.find(r => r.personId === candidate.id)!
      expect(ageAt(row, 520)).toBe(71)
      expect(anchorOf(row).week).toBeLessThanOrEqual(520)
    }
    exhausted = advanceTo(state, SCI_END)
  }
  return structuredClone(exhausted)
}

export type ScientistFilm = { ready: GameState; held: GameState; productionId: string; greenlight: Action }
let film: ScientistFilm | undefined
export function scientistFilm(): ScientistFilm {
  if (film !== undefined) return structuredClone(film)
  let state = fund(scientistAt('hardFilm', 700))
  expect(project(state).status).toBe('paused') // no active research plus film graft
  const roles: CreativeRole[] = ['writer', 'director', 'actor', 'actor', 'actor']
  const ids: string[] = []
  for (const [index, role] of roles.entries()) {
    const name = `C2s Film ${role} ${index}`
    state = applyActions(state, [{ kind: 'createTalent', talent: { name, role, age: 40,
      actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
    const id = state.talent.find(t => t.name === name)!.id
    ids.push(id)
    state = applyActions(state, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  }
  const stage = 'facility-soundstage-07'
  const mounted = state.sets.find(s => s.mountedOn === stage && s.status !== 'retired')
  if (mounted !== undefined) state = applyActions(state, [{ kind: 'strikeSet', setId: mounted.id }])
  state = applyActions(state, [{ kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stage } }])
  state = advanceTo(state, SCI_END - 9)
  const concept = state.concepts.find(c => !state.studio.activeProductions.some(p => p.conceptId === c.id)
    && !state.studio.releasedFilms.some(p => p.conceptId === c.id))!
  const greenlight: Action = { kind: 'greenlight', production: { conceptId: concept.id,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
    writerId: ids[0]!, directorId: ids[1]!, cast: { lead: ids[2]!, antagonist: ids[3]!, support: ids[4]! },
    craftIds: [SCI], budget: { negative: concept.baseNegativeCost, marketing: 0 } } }
  const ready = state
  state = applyActions(state, [greenlight])
  const productionId = state.studio.activeProductions.at(-1)!.id
  state = advanceTo(state, SCI_END)
  // Actual unscheduled take gate; no remainingTicks/workflow/receipt editing.
  expect(state.studio.activeProductions.find(p => p.id === productionId)).toMatchObject({ remainingTicks: 5 })
  expect(state.firstTakes.some(take => take.productionId === productionId)).toBe(false)
  saveRoundTrip(state)
  film = { ready, held: state, productionId, greenlight }
  return structuredClone(film)
}
