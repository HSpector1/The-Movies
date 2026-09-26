// 1028-A/1032-A G4. Actual public films distinguish repeated contexts and
// counterpart ordering; no chooser or production evidence selector is an oracle.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { transitionInputsFor } from '../src/core/index.js'
import { fnv1a64 } from '../src/core/math.js'
import { stableStringify } from '../src/core/save.js'
import { careerIdentity, expectedPotentialTier, roleTier } from '../src/core/talentSummary.js'
import type { GameState, TransitionEvaluation, TransitionInputs, TransitionPictureRef, TransitionTargetInput } from '../src/core/types.js'
import { compareText, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'
import { assertEqualPublicProfiles, equalTupleAccounting, fourEqualMain, retiredEqualTuple,
  terminalEqualTuple, twoEqualMain, twoEqualRepeat } from './helpers/p14c3-equal-tuple-fixtures.js'

const pictureOrder = (a: TransitionPictureRef, b: TransitionPictureRef) =>
  compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId)
type PairFact = TransitionPictureRef & { counterpart: string }
function context(facts: PairFact[]) {
  const groups = new Map<string, Map<string, TransitionPictureRef>>()
  for (const fact of facts) {
    const group = groups.get(fact.counterpart) ?? new Map<string, TransitionPictureRef>()
    group.set(JSON.stringify([fact.studioId, fact.pictureId]), { studioId: fact.studioId, pictureId: fact.pictureId })
    groups.set(fact.counterpart, group)
  }
  const ranked = [...groups].map(([id, rows]) => ({ id, pictures: [...rows.values()].sort(pictureOrder) }))
    .sort((a, b) => b.pictures.length - a.pictures.length || compareText(a.id, b.id))
  const best = ranked[0], count = best?.pictures.length ?? 0
  const band: 0 | 1 | 2 = count === 0 ? 0 : count === 1 ? 1 : 2
  return { counts: new Map(ranked.map(row => [row.id, row.pictures.length])), contextCount: count, contextBand: band,
    contextWitness: { counterpartId: best?.id ?? null, pictures: best?.pictures.slice(0, 2) ?? [] } }
}
function independentInputs(state: GameState, id: string, total: number) {
  const owner = state.hollywood!.playerStudioId, talent = person(state, id)
  const provenance = state.talentProvenance.rows.find(row => row.personId === id)
  assert.ok(provenance?.kind === 'authored_exact_week')
  expect(provenance).toMatchObject({ ageAtEntry: 69, entryWeek: 0 })
  const age = provenance.ageAtEntry + Math.floor((state.market.tick - provenance.entryWeek) / 52)
  const takes = state.firstTakes.filter(row => row.week <= state.market.tick && Object.values(row.cast).includes(id))
    .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
      || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
  expect(takes).toHaveLength(total)
  expect(new Set(takes.map(row => JSON.stringify([row.studioId, row.productionId]))).size).toBe(total)
  expect(takes.every(row => row.cast.lead === id && row.studioId === owner)).toBe(true)
  const films = state.studio.releasedFilms.filter(row => row.releaseTick <= state.market.tick && row.participants
    && Object.values(row.participants.cast).some(credit => credit.talentId === id))
    .sort((a, b) => a.releaseTick - b.releaseTick || compareText(a.productionId, b.productionId))
  expect(films).toHaveLength(total)
  expect(new Set(films.map(row => row.productionId)).size).toBe(total)
  expect(new Set(films.map(row => row.productionId))).toEqual(new Set(takes.map(row => row.productionId)))
  expect(state.hollywood!.films.some(row => row.credits.some(credit => credit.talentId === id))).toBe(false)
  const directing = context(takes.map(row => ({ studioId: row.studioId, pictureId: row.productionId, counterpart: row.directorId })))
  const writing = context(films.map(row => ({ studioId: owner, pictureId: row.productionId, counterpart: row.participants!.writer.talentId })))
  assertEqualPublicProfiles(state, id)
  const target = (profession: 'director' | 'writer', counted: ReturnType<typeof context>): TransitionTargetInput => {
    const discipline = profession === 'director' ? 'directing' : 'writing'
    const standing = careerIdentity(talent).disciplines.find(row => row.discipline === discipline)
    assert.ok(standing)
    expect(roleTier(standing.ovr)).toBe('Generational')
    expect(expectedPotentialTier(talent, discipline, state.seed)).toBe('Limited')
    expect(standing).toMatchObject({ workHistory: 0, proven: false })
    return { profession, capability: standing.ovr, roleTier: 'Generational', workHistory: 0, proven: false,
      potentialTier: 'Limited', contextCount: counted.contextCount, contextBand: counted.contextBand,
      contextWitness: counted.contextWitness }
  }
  const inputs: TransitionInputs = { age, actingFirstTakes: takes.length, leadFirstTakes: takes.length,
    actingWitnesses: takes.slice(0, 3).map(row => row.eventId), targets: [target('director', directing), target('writer', writing)] }
  expect(transitionInputsFor(state, id, state.market.tick)).toEqual(inputs)
  return { inputs, takes, films, directing, writing }
}
function questionDigest(question: TransitionEvaluation, inputs: TransitionInputs): string {
  // The documented946 tuple, independently assembled from retained public facts.
  const targets = inputs.targets.map(row => [row.profession, row.capability, row.roleTier, row.workHistory,
    row.proven, row.potentialTier, row.contextCount, row.contextBand,
    [row.contextWitness.counterpartId, row.contextWitness.pictures.map(picture => [picture.studioId, picture.pictureId])]])
  return fnv1a64(JSON.stringify([1, question.personId, question.week, [question.source.personId, question.source.profession],
    [inputs.age, inputs.actingFirstTakes, inputs.leadFirstTakes, inputs.actingWitnesses, targets]]))
}
function noNewWork(state: GameState, atRelease: GameState, created: GameState, id: string): void {
  expect(person(state, id).role).toBe('actor')
  expect(person(state, id).workHistory).toEqual(person(atRelease, id).workHistory)
  expect(person(state, id).workHistory.acting).toBe(4)
  expect(person(state, id).workHistory.directing).toBe(0)
  expect(person(state, id).workHistory.writing).toBe(0)
  const credits = state.careerEvents.filter(row => row.talentId === id)
  // These immutable histories cross the real JSON boundary in T4, including
  // its existing one-zero representation law. Compare complete canonical data.
  expect(stableStringify(credits)).toBe(stableStringify(atRelease.careerEvents.filter(row => row.talentId === id)))
  expect(credits).toHaveLength(4)
  expect(credits.every(row => row.discipline === 'acting')).toBe(true)
  expect(stableStringify(state.firstTakes.filter(row => Object.values(row.cast).includes(id))))
    .toBe(stableStringify(atRelease.firstTakes.filter(row => Object.values(row.cast).includes(id))))
  expect(stableStringify(state.studio.releasedFilms)).toBe(stableStringify(atRelease.studio.releasedFilms))
  expect(state.talentProvenance.rows.find(row => row.personId === id))
    .toEqual(created.talentProvenance.rows.find(row => row.personId === id))
  expect(state.careerLifecycle.professionAnchors.find(row => row.personId === id))
    .toEqual(created.careerLifecycle.professionAnchors.find(row => row.personId === id))
  expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
  expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
  expect(activeContract(state, id)).toBeUndefined()
  expect(busyTalentIds(state).has(id)).toBe(false)
  expect(state.freeAgents).not.toContain(id)
}

afterAll(() => console.info('C3_G4_ACTUAL_ROUTES', JSON.stringify(equalTupleAccounting())))

describe('C.3 genuine equal public tuples and canonical counterpart evidence', () => {
  it('T1 distinguishes A/B from A/A contexts at the same two actual acting pictures', () => {
    const main = twoEqualMain(), repeat = twoEqualRepeat(), id = main.setup.id
    expect(repeat.setup.id).toBe(id)
    expect(main.pictures.map(row => row.pair)).toEqual(['A', 'B'])
    expect(repeat.pictures.map(row => row.pair)).toEqual(['A', 'A'])
    expect(main.pictures[0]).toEqual(repeat.pictures[0])
    const ab = independentInputs(main.state, id, 2), aa = independentInputs(repeat.state, id, 2)
    for (const discipline of ['directing', 'writing'] as const) {
      const a = discipline === 'directing' ? main.setup.A.directorId : main.setup.A.writerId
      const b = discipline === 'directing' ? main.setup.B.directorId : main.setup.B.writerId
      expect(ab[discipline].counts).toEqual(new Map([[b, 1], [a, 1]]))
      expect(aa[discipline].counts).toEqual(new Map([[a, 2]]))
      expect(ab[discipline]).toMatchObject({ contextCount: 1, contextBand: 1, contextWitness: { counterpartId: b } })
      expect(aa[discipline]).toMatchObject({ contextCount: 2, contextBand: 2, contextWitness: { counterpartId: a } })
      expect(ab[discipline].contextWitness.pictures).toHaveLength(1)
      expect(aa[discipline].contextWitness.pictures).toHaveLength(2)
    }
    expect(ab.inputs.actingFirstTakes).toBe(aa.inputs.actingFirstTakes)
    expect(ab.inputs.actingFirstTakes).toBeLessThan(3)
    for (const state of [main.state, repeat.state]) {
      expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual([])
      acceptedEvidence(state)
    }
  })

  it('T2 chooses later encountered smaller B witnesses from actual A/B/A/B tied pairs', () => {
    const f = fourEqualMain(), { id, A, B } = f.setup
    expect(f.pictures.map(row => row.pair)).toEqual(['A', 'B', 'A', 'B'])
    const facts = independentInputs(f.state, id, 4)
    expect(facts.takes.map(row => row.directorId)).toEqual([A.directorId, B.directorId, A.directorId, B.directorId])
    expect(facts.films.map(row => row.participants!.writer.talentId)).toEqual([A.writerId, B.writerId, A.writerId, B.writerId])
    expect(compareText(A.directorId, B.directorId)).toBeGreaterThan(0)
    expect(compareText(A.writerId, B.writerId)).toBeGreaterThan(0)
    const expectedPictures = f.pictures.filter(row => row.pair === 'B')
      .map(row => ({ studioId: f.state.hollywood!.playerStudioId, pictureId: row.productionId })).sort(pictureOrder)
    expect(expectedPictures).toHaveLength(2)
    for (const [counted, a, b] of [[facts.directing, A.directorId, B.directorId], [facts.writing, A.writerId, B.writerId]] as const) {
      expect(counted.counts).toEqual(new Map([[b, 2], [a, 2]]))
      expect(counted.contextWitness).toEqual({ counterpartId: b, pictures: expectedPictures })
    }
    expect(facts.inputs.actingFirstTakes).toBe(4)
    expect(facts.inputs.actingWitnesses).toHaveLength(3)
    expect(facts.inputs.targets.map(row => [row.proven, row.roleTier, row.contextBand, row.potentialTier]))
      .toEqual([[false, 'Generational', 2, 'Limited'], [false, 'Generational', 2, 'Limited']])
    // Evidence is observed at the actual fourth-release age; age73 belongs to208.
    expect(facts.inputs.age).toBe(69 + Math.floor(f.state.market.tick / 52))
    expect(facts.inputs.age).toBeLessThan(75)
    acceptedEvidence(f.state)
  })

  it('T3 genuinely declines both eligible equal careers at natural retirement208', () => {
    const f = retiredEqualTuple(), four = fourEqualMain(), state = f.state, id = f.setup.id
    expect(state.market.tick).toBe(208)
    expect(retirementRecordFor(f.notice52, id, 'actor')).toMatchObject({ announcedWeek: 52, ageAtAnnouncement: 70,
      effectiveWeek: 208, cause: 'hardBoundary', extensionUsed: false })
    expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ profession: 'actor', status: 'retired', retiredWeek: 208,
      announcedWeek: 52, effectiveWeek: 208, extensionUsed: false })
    expect(state.careerLifecycle.records.filter(row => row.personId === id)).toHaveLength(1)
    const openedCases = f.window196.talentMarket.cases.filter(row => row.talentId === id && row.openedWeek === 196)
    expect(openedCases).toHaveLength(1)
    const kase = openedCases[0]!
    expect(kase).toMatchObject({ variant: 'retirementExtension', closedWeek: null, outcome: null })
    const terminalCases = state.talentMarket.cases.filter(row => row.talentId === kase.talentId
      && row.subjectStudioId === kase.subjectStudioId && row.contractId === kase.contractId
      && row.openedWeek === kase.openedWeek && row.variant === kase.variant)
    expect(terminalCases).toEqual([expect.objectContaining({ outcome: 'expired', closedWeek: 208 })])
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    expect(state.talentMarket.receipts.filter(row => row.talentId === id && row.kind === 'proposalSubmitted')).toEqual([])
    const original = f.setup.created0.hollywood!.employment.filter(row => row.terms.talentId === id)
    expect(original).toHaveLength(1)
    expect(state.hollywood!.employment.filter(row => row.terms.talentId === id))
      .toEqual([expect.objectContaining({ contractId: original[0]!.contractId, endedWeek: 208, terms: original[0]!.terms })])
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.talentId === id && row.contractId === original[0]!.contractId))
      .toEqual([expect.objectContaining({ week: 208, fromStudioId: state.hollywood!.playerStudioId, toStudioId: null })])
    const { inputs } = independentInputs(state, id, 4)
    expect(inputs.age).toBe(73)
    for (const target of inputs.targets) {
      expect(target.capability).toBeGreaterThanOrEqual(60)
      expect(inputs.age).toBeLessThan(75)
      expect(inputs.actingFirstTakes).toBeGreaterThanOrEqual(3)
      expect(target.contextCount).toBe(2)
      expect([target.proven, target.roleTier, target.contextBand, target.potentialTier]).toEqual([false, 'Generational', 2, 'Limited'])
    }
    const questions = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    expect(questions).toHaveLength(1)
    const question = questions[0]!
    expect(question.ordinal).toBe(state.careerLifecycle.transitionEvaluations.findIndex(row => row.id === question.id))
    expect(question).toMatchObject({ personId: id, week: 208, source: { personId: id, profession: 'actor' },
      rulesVersion: 1, outcome: 'declinedAll', selected: null, reason: 'equalPublicTuples', inputs })
    expect(question.inputsDigest).toBe(questionDigest(question, inputs))
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([
      { personId: id, week: 208, profession: 'actor', source: { personId: id, profession: 'actor' },
        cause: 'declinedAll', evaluationId: question.id },
    ])
    noNewWork(state, four.state, f.setup.created0, id)
    acceptedEvidence(state)
  })

  it('T4 reloads actual208 and preserves terminal finality through every week to260', () => {
    const f = terminalEqualTuple(), four = fourEqualMain(), id = f.setup.id
    expect(f.observedWeeks).toEqual(Array.from({ length: 52 }, (_, index) => 209 + index))
    const questions = f.at208.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    const finalities = f.at208.careerLifecycle.industryRetirements.filter(row => row.personId === id)
    expect(questions).toEqual([expect.objectContaining({ week: 208, outcome: 'declinedAll', reason: 'equalPublicTuples' })])
    expect(finalities).toEqual([expect.objectContaining({ week: 208, cause: 'declinedAll', evaluationId: questions[0]!.id })])
    for (const state of [f.at208, f.loaded208, f.at259, f.at260]) {
      expect(state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual(questions)
      expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual(finalities)
      expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(f.at208, id, 'actor'))
      expect(state.hollywood!.employment.filter(row => row.terms.talentId === id))
        .toEqual(f.at208.hollywood!.employment.filter(row => row.terms.talentId === id))
      expect(state.talentMarket.cases.filter(row => row.talentId === id)).toEqual(f.at208.talentMarket.cases.filter(row => row.talentId === id))
      noNewWork(state, four.state, f.setup.created0, id)
      acceptedEvidence(state)
    }
    expect(f.at259.market.tick).toBe(259)
    expect(f.at260.market.tick).toBe(260)
    expect(equalTupleAccounting()).toMatchObject({ tickCalls: { main: 260 } })
    expect(equalTupleAccounting().totalTickCalls).toBeLessThanOrEqual(300)
  })
})
