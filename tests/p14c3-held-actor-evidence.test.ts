// 1018-A G3: authentic held production and four public forks, <=304 total ticks.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { transitionInputsFor } from '../src/core/index.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { careerIdentity } from '../src/core/talentSummary.js'
import type { GameState, TransitionPictureRef } from '../src/core/types.js'
import { compareText, expectFocusChosen, FOCUS, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence, agedHeldEvidence, assertHeldEvidence, cancelledAfterEvidence, cancelledBeforeEvidence,
  evidenceTickCount, heldEvidence, noSubjectDecision, releasedHeldEvidence, subjectEvaluations, takenEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'

const orderPicture = (a: TransitionPictureRef, b: TransitionPictureRef) => compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId)
let observedReleaseWeek: number | null = null
let observedClearanceWeek: number | null = null
let observedAgeFinalityWeek: number | null = null
afterAll(() => console.info(JSON.stringify({ phase: '1020-genuine-route-observation', group: 'G3',
  tickCalls: evidenceTickCount('held'), releaseWeek: observedReleaseWeek,
  clearanceWeek: observedClearanceWeek, ageFinalityWeek: observedAgeFinalityWeek })))
function evidence(state: GameState, takesExpected: 3 | 4, writerExpected: 3 | 4): void {
  const f = heldEvidence(), owner = state.hollywood!.playerStudioId
  for (const id of Object.values(FOCUS)) {
    const takes = state.firstTakes.filter(row => row.week <= state.market.tick && Object.values(row.cast).includes(id))
      .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
        || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
    expect(takes).toHaveLength(takesExpected)
    expect(new Set(takes.map(row => JSON.stringify([row.studioId, row.productionId]))).size).toBe(takesExpected)
    expect(takes.every(row => row.studioId === owner)).toBe(true)
    const leads = takes.filter(row => row.cast.lead === id)
    const originalDirector = leads.filter(row => row.directorId === 'authored-0002')
    const youngDirector = leads.filter(row => row.directorId === f.directorId)
    expect(leads).toHaveLength(id === FOCUS.director ? takesExpected : 0)
    expect(originalDirector).toHaveLength(id === FOCUS.director ? 3 : 0)
    expect(youngDirector).toHaveLength(id === FOCUS.director ? takesExpected - 3 : 0)
    expect(originalDirector.length + youngDirector.length).toBe(leads.length)
    const films = state.studio.releasedFilms.filter(row => row.releaseTick <= state.market.tick && row.participants
      && Object.values(row.participants.cast).some(credit => credit.talentId === id))
    expect(films).toHaveLength(writerExpected)
    expect(films.every(row => row.participants!.writer.talentId === 'authored-0003')).toBe(true)
    expect(new Set(films.map(row => row.productionId)).size).toBe(writerExpected)
    // This corpus has no other owner's films for these publicly authored people.
    expect(state.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id))).toEqual([])
    const inputs = transitionInputsFor(state, id, state.market.tick)
    expect(inputs.actingFirstTakes).toBe(takesExpected)
    expect(inputs.leadFirstTakes).toBe(leads.length)
    expect(inputs.actingWitnesses).toEqual(takes.slice(0, 3).map(row => row.eventId))
    const director = inputs.targets.find(row => row.profession === 'director')!
    const directorPictures = originalDirector.map(row => ({ studioId: row.studioId, pictureId: row.productionId })).sort(orderPicture)
    expect(director).toMatchObject({ contextCount: originalDirector.length,
      contextBand: id === FOCUS.director ? 2 : 0, contextWitness: {
        counterpartId: id === FOCUS.director ? 'authored-0002' : null, pictures: directorPictures.slice(0, 2) } })
    const writerPictures = films.map(row => ({ studioId: owner, pictureId: row.productionId })).sort(orderPicture)
    expect(inputs.targets.find(row => row.profession === 'writer')).toMatchObject({ contextCount: writerExpected, contextBand: 2,
      contextWitness: { counterpartId: 'authored-0003', pictures: writerPictures.slice(0, 2) } })
    // At an actual decision boundary the immutable recorded question must contain
    // these newly available retained facts, not a stale pre-clearance count.
    const recorded = subjectEvaluations(state, id).find(row => row.week === state.market.tick)
    if (recorded) {
      expect(recorded.inputs.actingFirstTakes).toBe(inputs.actingFirstTakes)
      expect(recorded.inputs.leadFirstTakes).toBe(inputs.leadFirstTakes)
      expect(recorded.inputs.actingWitnesses).toEqual(inputs.actingWitnesses)
      for (const target of ['director', 'writer'] as const) {
        const question = recorded.inputs.targets.find(row => row.profession === target)!
        const current = inputs.targets.find(row => row.profession === target)!
        expect({ count: question.contextCount, band: question.contextBand, witness: question.contextWitness })
          .toEqual({ count: current.contextCount, band: current.contextBand, witness: current.contextWitness })
      }
    }
  }
}
function originals(state: GameState): void {
  const f = heldEvidence()
  for (const id of Object.values(FOCUS)) {
    expect(state.talentProvenance.rows.find(row => row.personId === id))
      .toEqual(f.origin.talentProvenance.rows.find(row => row.personId === id))
    expect(state.careerLifecycle.professionAnchors.find(row => row.personId === id))
      .toEqual(f.origin.careerLifecycle.professionAnchors.find(row => row.personId === id))
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ personId: id, profession: 'actor', announcedWeek: 104,
      effectiveWeek: 208, extensionUsed: false, extendedFromWeek: null })
    for (const take of f.origin.firstTakes.filter(row => Object.values(row.cast).includes(id))) {
      expect(state.firstTakes.find(row => row.eventId === take.eventId)).toEqual(take)
    }
    for (const film of f.origin.studio.releasedFilms.filter(row => row.participants
      && Object.values(row.participants.cast).some(credit => credit.talentId === id))) {
      expect(state.studio.releasedFilms.find(row => row.productionId === film.productionId))
        .toMatchObject({ productionId: film.productionId, releaseTick: film.releaseTick, participants: film.participants })
    }
  }
  expect(state.talent.slice(0, f.origin.talent.length).map(row => row.id)).toEqual(f.origin.talent.map(row => row.id))
}
function chosenAt(state: GameState, week: number): void {
  acceptedEvidence(state)
  expectFocusChosen(state, week)
  for (const id of Object.values(FOCUS)) {
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: week, finishingFromWeek: 208 })
  }
  originals(state)
}

describe('C.3 genuine held actor evidence and retirement clearance', () => {
  it('H1 holds a real unscheduled company across E without a take, release or transition', () => {
    const f = heldEvidence()
    expect(f.origin.market.tick).toBe(104)
    expect(f.held.market.tick).toBe(208)
    expect(f.held.studio.activeProductions.find(row => row.id === f.productionId)).toMatchObject({ startTick: 199,
      directorId: f.directorId, writerId: 'authored-0003', cast: { lead: FOCUS.director, antagonist: FOCUS.writer } })
    acceptedEvidence(f.held)
    assertHeldEvidence(f.held, f.productionId)
    evidence(f.held, 3, 3)
    originals(f.held)
  })

  it('H2 cancels before a take and makes one genuine decision at clearance209 without new evidence', () => {
    const f = heldEvidence(), state = cancelledBeforeEvidence()
    chosenAt(state, 209)
    expect(state.studio.activeProductions.filter(row => row.id === f.productionId)).toEqual([])
    expect(state.firstTakes.filter(row => row.productionId === f.productionId)).toEqual([])
    expect(state.studio.releasedFilms.filter(row => row.productionId === f.productionId)).toEqual([])
    expect(state.careerEvents.filter(row => row.filmId === f.productionId)).toEqual([])
    evidence(state, 3, 3)
  })

  it('H3 captures an actual post-E take while the active company still postpones both decisions', () => {
    const f = heldEvidence(), state = takenEvidence()
    expect(state.market.tick).toBe(209)
    acceptedEvidence(state)
    expect(state.firstTakes.filter(row => row.productionId === f.productionId)).toEqual([expect.objectContaining({
      week: 209, studioId: state.hollywood!.playerStudioId, productionId: f.productionId, directorId: f.directorId,
      cast: expect.objectContaining({ lead: FOCUS.director, antagonist: FOCUS.writer }) })])
    expect(state.studio.activeProductions.some(row => row.id === f.productionId)).toBe(true)
    expect(state.studio.releasedFilms.some(row => row.productionId === f.productionId)).toBe(false)
    for (const id of Object.values(FOCUS)) {
      expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'finishing_commitments', finishingFromWeek: 208 })
      noSubjectDecision(state, id)
    }
    evidence(state, 4, 3)
    originals(state)
  })

  it('H4 cancels after the take and retains acting/directing facts but no released Writer picture at210', () => {
    const f = heldEvidence(), state = cancelledAfterEvidence()
    chosenAt(state, 210)
    expect(state.studio.activeProductions.filter(row => row.id === f.productionId)).toEqual([])
    expect(state.firstTakes.filter(row => row.productionId === f.productionId))
      .toEqual(takenEvidence().firstTakes.filter(row => row.productionId === f.productionId))
    expect(state.studio.releasedFilms.filter(row => row.productionId === f.productionId)).toEqual([])
    expect(state.careerEvents.filter(row => row.filmId === f.productionId)).toEqual([])
    evidence(state, 4, 3)
  })

  it('H5 actual release adds the fourth shared Writer credit before one observed clearance decision each', () => {
    const f = heldEvidence(), state = releasedHeldEvidence()
    observedReleaseWeek = state.studio.releasedFilms.find(row => row.productionId === f.productionId)?.releaseTick ?? null
    observedClearanceWeek = retirementRecordFor(state, FOCUS.director, 'actor')?.retiredWeek ?? null
    expect(state.market.tick).toBeGreaterThan(209)
    expect(state.market.tick).toBeLessThanOrEqual(249)
    chosenAt(state, state.market.tick)
    const film = state.studio.releasedFilms.find(row => row.productionId === f.productionId)
    assert.ok(film)
    expect(film.releaseTick).toBeGreaterThanOrEqual(209)
    expect(film.releaseTick).toBeLessThanOrEqual(state.market.tick)
    expect(film.participants).toMatchObject({ writer: { talentId: 'authored-0003' }, director: { talentId: f.directorId },
      cast: { lead: { talentId: FOCUS.director }, antagonist: { talentId: FOCUS.writer } } })
    expect(state.firstTakes.filter(row => row.productionId === f.productionId))
      .toEqual(takenEvidence().firstTakes.filter(row => row.productionId === f.productionId))
    expect(state.studio.activeProductions.some(row => row.id === f.productionId)).toBe(false)
    evidence(state, 4, 4)
    for (const id of Object.values(FOCUS)) {
      expect(subjectEvaluations(cancelledAfterEvidence(), id)[0]!.inputs.targets.find(row => row.profession === 'writer')?.contextCount).toBe(3)
      expect(subjectEvaluations(state, id)[0]!.inputs.targets.find(row => row.profession === 'writer')?.contextCount).toBe(4)
    }
  })

  it('H6 holds genuine work to75 and takes age precedence over qualifying evidence, preserving finality after reopening', () => {
    const f = heldEvidence(), route = agedHeldEvidence()
    observedAgeFinalityWeek = route.retired.careerLifecycle.industryRetirements.find(row => row.personId === FOCUS.director)?.week ?? null
    expect(route.before.market.tick).toBe(363)
    assertHeldEvidence(route.before, f.productionId)
    evidence(route.before, 3, 3)
    for (const [target, id] of Object.entries(FOCUS)) {
      const discipline = target === 'director' ? 'directing' : 'writing'
      const provenance = route.before.talentProvenance.rows.find(row => row.personId === id)
      expect(provenance).toMatchObject({ ageAtEntry: 68, entryWeek: 0 })
      expect(Math.floor(68 + 363 / 52)).toBe(74)
      expect(Math.floor(68 + 364 / 52)).toBe(75)
      expect(careerIdentity(person(route.before, id)).disciplines.find(row => row.discipline === discipline)?.ovr).toBeGreaterThanOrEqual(60)
      const beforeInputs = transitionInputsFor(route.before, id, 363)
      expect(beforeInputs.actingFirstTakes).toBe(3)
      expect(beforeInputs.targets.find(row => row.profession === target)?.contextCount).toBe(3)
      const rows = subjectEvaluations(route.retired, id)
      expect(rows).toHaveLength(1)
      expect(rows[0]).toMatchObject({ week: 364, source: { personId: id, profession: 'actor' },
        outcome: 'ageBoundary', reason: 'waitingAgeReached', selected: null, inputs: { age: 75, actingFirstTakes: 3 } })
      const finalities = route.retired.careerLifecycle.industryRetirements.filter(row => row.personId === id)
      expect(finalities).toEqual([{ personId: id, week: 364, profession: 'actor', source: { personId: id, profession: 'actor' },
        cause: 'ageBoundary', evaluationId: rows[0]!.id }])
      for (const state of [route.retired, route.loaded, route.after]) {
        acceptedEvidence(state)
        expect(person(state, id)).toMatchObject({ role: 'actor', age: 75 })
        expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 364, finishingFromWeek: 208 })
        expect(subjectEvaluations(state, id)).toEqual(rows)
        expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual(finalities)
        expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
        expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
        expect(state.freeAgents).not.toContain(id)
        expect(state.firstTakes.some(row => row.productionId === f.productionId)).toBe(false)
        expect(state.studio.releasedFilms.some(row => row.productionId === f.productionId)).toBe(false)
        originals(state)
      }
    }
    expect(route.after.market.tick).toBe(365)
    expect(evidenceTickCount('held')).toBeLessThanOrEqual(304)
  })
})
