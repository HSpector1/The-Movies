// 1042/1055/1061: six independent leaves, one genuine canonical098 trajectory.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { ageAt } from '../src/core/aging.js'
import { retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { professionAtWeek, salaryCurve, transitionInputsFor } from '../src/core/index.js'
import { fnv1a64 } from '../src/core/math.js'
import { validateProfessionHistory } from '../src/core/professionHistory.js'
import { exportSave, makeSave, stableStringify, validateSaveV37, validateSaveV44 } from '../src/core/save.js'
import { careerIdentity, expectedPotentialTier, roleOVR, roleTier } from '../src/core/talentSummary.js'
import type { GameState, TransitionEvaluation, TransitionInputs, TransitionPictureRef, TransitionTargetInput } from '../src/core/types.js'
import { clone, compareText, historical37, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'
import { CANONICAL_STUDIO, CANONICAL_SUBJECT, canonicalChosen, canonicalEmployment, canonicalHired,
  canonicalInitial, canonicalReleased, recordCanonicalRoute } from './helpers/p14c3-canonical-rival-fixtures.js'

const id = CANONICAL_SUBJECT
afterAll(recordCanonicalRoute)
const pictureOrder = (a: TransitionPictureRef, b: TransitionPictureRef) =>
  compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId)
type ContextFact = TransitionPictureRef & { counterpartId: string }
function strongest(facts: ContextFact[]) {
  const counterparts = [...new Set(facts.map(row => row.counterpartId))]
  const ranked = counterparts.map(counterpartId => {
    const pictures = new Map(facts.filter(row => row.counterpartId === counterpartId)
      .map(row => [JSON.stringify([row.studioId, row.pictureId]), { studioId: row.studioId, pictureId: row.pictureId }]))
    return { counterpartId, pictures: [...pictures.values()].sort(pictureOrder) }
  }).sort((a, b) => b.pictures.length - a.pictures.length || compareText(a.counterpartId, b.counterpartId))
  const best = ranked.at(0), total = best?.pictures.length ?? 0
  const band: 0 | 1 | 2 = total === 0 ? 0 : total === 1 ? 1 : 2
  return { contextCount: total, contextBand: band,
    contextWitness: { counterpartId: best?.counterpartId ?? null, pictures: best?.pictures.slice(0, 2) ?? [] } }
}
function independentInputs(state: GameState) {
  const provenance = state.talentProvenance.rows.find(row => row.personId === id)
  assert.ok(provenance)
  const all = state.firstTakes.filter(row => row.week <= state.market.tick && Object.values(row.cast).includes(id))
    .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
      || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
  const pictures = new Set<string>()
  const takes = all.filter(row => {
    const key = JSON.stringify([row.studioId, row.productionId])
    if (pictures.has(key)) return false
    pictures.add(key); return true
  })
  const leads = takes.filter(row => row.cast.lead === id)
  const directors: ContextFact[] = leads.map(row => ({ counterpartId: row.directorId, studioId: row.studioId, pictureId: row.productionId }))
  const writers: ContextFact[] = []
  const industry = state.hollywood!
  for (const film of state.studio.releasedFilms) {
    if (film.releaseTick <= state.market.tick && film.participants
      && Object.values(film.participants.cast).some(credit => credit.talentId === id)) {
      writers.push({ counterpartId: film.participants.writer.talentId, studioId: industry.playerStudioId, pictureId: film.productionId })
    }
  }
  const films = industry.films.filter(film => {
    const studio = industry.identities.find(row => row.studioId === film.studioId)
    return studio?.enteredWeek !== null && studio?.enteredWeek !== undefined && studio.enteredWeek <= state.market.tick
      && (film.provenance === 'authored-start/v1' || film.result.releaseTick <= state.market.tick)
      && film.credits.some(credit => credit.talentId === id && ['lead', 'antagonist', 'support'].includes(credit.role))
  })
  for (const film of films) {
    const writer = film.credits.filter(row => row.role === 'writer')
    expect(writer).toHaveLength(1)
    writers.push({ counterpartId: writer[0]!.talentId, studioId: film.studioId, pictureId: film.filmId })
    if (film.provenance === 'simulation/v1') {
      const receipt = industry.receipts.filter(row => row.kind === 'filmReleased'
        && row.studioId === film.studioId && row.productionId === film.filmId)
      expect(receipt).toHaveLength(1)
      expect(receipt[0]!.week).toBe(film.result.releaseTick)
      expect(takes.some(row => row.studioId === film.studioId && row.productionId === film.filmId)).toBe(true)
    }
  }
  const target = (profession: 'director' | 'writer'): TransitionTargetInput => {
    const discipline = profession === 'director' ? 'directing' : 'writing'
    const standing = careerIdentity(person(state, id)).disciplines.find(row => row.discipline === discipline)
    assert.ok(standing)
    const tier = roleTier(standing.ovr), potential = expectedPotentialTier(person(state, id), discipline, state.seed)
    assert.ok(tier === 'Highly unproven' || tier === 'Raw prospect' || tier === 'Limited-or-developing'
      || tier === 'Strong' || tier === 'Major-studio' || tier === 'Elite' || tier === 'Generational')
    assert.ok(potential === 'Limited' || potential === 'Steady' || potential === 'Promising' || potential === 'High Upside'
      || potential === 'Exceptional Upside' || potential === 'Generational Upside')
    return { profession, capability: standing.ovr, roleTier: tier, workHistory: standing.workHistory,
      proven: standing.proven, potentialTier: potential, ...strongest(profession === 'director' ? directors : writers) }
  }
  const inputs: TransitionInputs = { age: ageAt(provenance, state.market.tick), actingFirstTakes: takes.length,
    leadFirstTakes: leads.length, actingWitnesses: takes.slice(0, 3).map(row => row.eventId), targets: [target('director'), target('writer')] }
  expect(transitionInputsFor(state, id, state.market.tick)).toEqual(inputs)
  return { inputs, takes, films }
}
function independentDigest(question: TransitionEvaluation, input: TransitionInputs): string {
  // Published946 tuple, independent of the production digest/evidence helper.
  return fnv1a64(JSON.stringify([1, id, question.week, [id, 'actor'], [input.age,
    input.actingFirstTakes, input.leadFirstTakes, input.actingWitnesses,
    input.targets.map(row => [row.profession, row.capability, row.roleTier, row.workHistory,
      row.proven, row.potentialTier, row.contextCount, row.contextBand,
      [row.contextWitness.counterpartId, row.contextWitness.pictures.map(picture => [picture.studioId, picture.pictureId])]])]]))
}
function originalFacts(state: GameState): void {
  const initial = canonicalInitial(), old = initial.hollywood!, h = state.hollywood!
  const authored = old.films.filter(film => film.provenance === 'authored-start/v1'
    && film.credits.some(credit => credit.talentId === id))
  expect(authored).toHaveLength(2)
  expect(authored.map(film => ({ filmId: film.filmId, title: film.title,
    released: film.provenance === 'authored-start/v1' ? film.released : null })))
    .toEqual([{ filmId: `${CANONICAL_STUDIO}:historical-film:0`, title: 'The Misdelivered Parcel', released: { kind: 'beforeCampaign', year: 1914 } },
      { filmId: `${CANONICAL_STUDIO}:historical-film:1`, title: 'Sunday at the Pier', released: { kind: 'beforeCampaign', year: 1918 } }])
  for (const film of authored) {
    expect(film.credits.find(row => row.talentId === id)).toEqual({ talentId: id, name: 'Clara Moss', role: 'support' })
    expect(film.credits.find(row => row.role === 'writer')).toEqual({ talentId: `${CANONICAL_STUDIO.replace('studio-', 'person-studio-')}-0`, name: 'Iris Bell', role: 'writer' })
    expect(stableStringify(h.films.find(row => row.filmId === film.filmId))).toBe(stableStringify(film))
    expect(state.firstTakes.some(take => take.productionId === film.filmId)).toBe(false)
  }
  expect(state.careerLifecycle.professionAnchors.filter(row => row.personId === id))
    .toEqual([{ personId: id, profession: 'actor', kind: 'entrant', recordedWeek: 0 }])
  expect(state.talentProvenance.rows.find(row => row.personId === id)).toEqual(initial.talentProvenance.rows.find(row => row.personId === id))
  const oldJob = canonicalEmployment(initial)[0]!, current = canonicalEmployment(state).find(row => row.contractId === oldJob.contractId)
  assert.ok(current)
  expect({ ...current, endedWeek: null }).toEqual(oldJob)
  const signed = old.receipts.filter(row => row.kind === 'employment' && row.contractId === oldJob.contractId)
  expect(signed).toHaveLength(1)
  expect(signed[0]).toMatchObject({ week: 0, studioId: CANONICAL_STUDIO, reason: 'entry', toStudioId: CANONICAL_STUDIO, talentId: id })
  expect(h.receipts.filter(row => signed.some(receipt => receipt.eventId === row.eventId))).toEqual(signed)
  if (state.market.tick > 0 && person(state, id).role === 'writer') {
    assert.ok(current.endedWeek !== null)
    const closures = h.receipts.filter(row => row.kind === 'employment' && row.talentId === id
      && row.fromStudioId === current.studioId && row.week === current.endedWeek
      && (row.contractId === current.contractId && row.toStudioId === null
        || row.reason === 'renewal' && row.toStudioId === current.studioId))
    expect(closures).toHaveLength(1)
  }
}
function signingReconciliation(state: GameState, studioId: string): void {
  const h = state.hollywood!, business = h.businesses.find(row => row.studioId === studioId)
  assert.ok(business)
  const signing = business.account.periods.reduce((sum, period) => sum + period.movements.signing, 0)
  const committed = h.employment.filter(row => row.studioId === studioId).reduce((sum, row) => sum + row.terms.signingBonus, 0)
  expect(signing).toBeCloseTo(-committed, 6)
}

describe('C.3 canonical Actor history survives actual passive rival Writer transition and work', () => {
  it('K1 reaches genuine eligible acting retirement with independently counted campaign and authored evidence', () => {
    const f = canonicalChosen(), { inputs, takes, films } = independentInputs(f.observed.before)
    originalFacts(f.initial); signingReconciliation(f.initial, CANONICAL_STUDIO)
    expect(inputs.age).toBeLessThan(75)
    expect(takes.length).toBeGreaterThanOrEqual(3)
    expect(new Set(takes.map(row => JSON.stringify([row.studioId, row.productionId]))).size).toBe(takes.length)
    expect(films.filter(film => film.provenance === 'authored-start/v1')).toHaveLength(2)
    expect(films.filter(film => film.provenance === 'simulation/v1').length).toBeGreaterThan(0)
    const writer = inputs.targets[1]
    expect(writer.profession).toBe('writer'); expect(writer.capability).toBeGreaterThanOrEqual(60)
    expect(writer.proven || writer.contextCount >= 2).toBe(true)
    const questions = f.state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    const question = questions.at(-1)!
    expect(question).toMatchObject({ personId: id, week: f.state.market.tick, source: { personId: id, profession: 'actor' },
      rulesVersion: 1, outcome: 'chosen', selected: 'writer', inputs })
    expect(questions.slice(0, -1).every(row => row.outcome === 'deferred')).toBe(true)
    const director = inputs.targets[0]
    const directorEligible = director.capability >= 60 && (director.proven || director.contextCount >= 2)
    if (!directorEligible) expect(question.reason).toBe('onlyEligibleTarget')
    else {
      const tiers = ['Highly unproven', 'Raw prospect', 'Limited-or-developing', 'Strong', 'Major-studio', 'Elite', 'Generational']
      const potentials = ['Limited', 'Steady', 'Promising', 'High Upside', 'Exceptional Upside', 'Generational Upside']
      const tuple = (target: TransitionTargetInput) => [Number(target.proven), tiers.indexOf(target.roleTier), target.contextBand, potentials.indexOf(target.potentialTier)]
      const left = tuple(writer), right = tuple(director), differing = left.findIndex((value, index) => value !== right[index])
      expect(differing).toBeGreaterThanOrEqual(0); expect(left[differing]).toBeGreaterThan(right[differing]!)
      expect(question.reason).toBe('strongerPublicTuple')
    }
    expect(retirementRecordFor(f.state, id, 'actor')).toMatchObject({ profession: 'actor', status: 'retired' })
    expect(f.state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
  })

  it('K2 observes the exact real owner write set and inclusive Actor-to-Writer authority', () => {
    const f = canonicalChosen(), { before, after, keys } = f.observed, week = before.market.tick
    expect(before.market.tick).toBe(f.state.market.tick)
    expect(keys.some(key => key.personId === id && key.profession === 'actor')
      || before.careerLifecycle.transitionDue.some(row => row.personId === id && row.week === week)).toBe(true)
    const retired = retirementRecordFor(before, id, 'actor')
    assert.ok(retired?.retiredWeek !== null && retired?.retiredWeek !== undefined)
    expect(retired.status).toBe('retired'); expect(retired.retiredWeek).toBeLessThanOrEqual(week)
    expect(busyTalentIds(before).has(id)).toBe(false)
    expect(activeContract(before, id)).toBeUndefined()
    expect(canonicalEmployment(before).filter(row => row.terms.startWeek <= week && week < (row.endedWeek ?? row.terms.endWeekExclusive))).toEqual([])
    const changes = after.careerLifecycle.professionChanges.slice(before.careerLifecycle.professionChanges.length)
    const mask = (state: GameState) => ({ ...state, freeAgents: [], careerLifecycle: { ...state.careerLifecycle,
      transitionEvaluations: [], professionChanges: [], industryRetirements: [], transitionDue: [] },
    talent: state.talent.map(talent => changes.some(change => change.personId === talent.id)
      ? { ...talent, role: undefined, skill: undefined, salary: undefined } : talent) })
    expect(mask(after)).toEqual(mask(before))
    for (const field of ['transitionEvaluations', 'professionChanges', 'industryRetirements'] as const)
      expect(after.careerLifecycle[field].slice(0, before.careerLifecycle[field].length)).toEqual(before.careerLifecycle[field])
    for (const change of changes) {
      const destination = person(after, change.personId)
      expect(destination.role).toBe(change.to)
      expect(destination.skill).toBe(roleOVR(destination, change.to === 'director' ? 'directing' : 'writing'))
      expect(destination.salary).toBe(salaryCurve(destination))
    }
    const focusChanges = changes.filter(row => row.personId === id)
    expect(focusChanges).toHaveLength(1)
    expect(focusChanges[0]).toMatchObject({ from: 'actor', to: 'writer', week })
    const questions = after.careerLifecycle.transitionEvaluations.filter(row => row.id === focusChanges[0]!.evaluationId)
    expect(questions).toHaveLength(1)
    const { inputs } = independentInputs(before)
    expect(questions[0]!.inputs).toEqual(inputs)
    expect(questions[0]!.inputsDigest).toBe(independentDigest(questions[0]!, inputs))
    expect(professionAtWeek(after, id, week - 1)).toBe('actor')
    expect(professionAtWeek(after, id, week)).toBe('writer')
    expect(after.freeAgents.filter(personId => personId === id)).toEqual([id])
    expect(after.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
    // The captured internal phase is observed, never offered to whole-save
    // validation before the actual tick completes its remaining owners.
    acceptedEvidence(f.state); acceptedEvidence(f.loaded)
  })

  it('K3 preserves exact canonical old support credits and actual employment closure through Writer reload', () => {
    const f = canonicalChosen()
    for (const state of [f.state, f.loaded]) {
      acceptedEvidence(state); originalFacts(state)
      expect(person(state, id).role).toBe('writer')
      expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toHaveLength(1)
      expect(new Set(state.talent.map(row => row.id)).size).toBe(state.talent.length)
      expect(stableStringify(state.firstTakes)).toBe(stableStringify(f.state.firstTakes))
      expect(stableStringify(state.hollywood!.careerEvents)).toBe(stableStringify(f.state.hollywood!.careerEvents))
      expect(state.hollywood!.careerEvents.filter(row => row.talentId === id).every(row => row.discipline === 'acting')).toBe(true)
      expect(state.careerLifecycle).toEqual(f.state.careerLifecycle)
    }
    expect(exportSave(makeSave(f.loaded))).toBe(exportSave(makeSave(f.state)))
  })

  it('K4 refuses separate malformed canonical title, credit, entry cause and missing profession authority', () => {
    const control = makeSave(canonicalChosen().loaded)
    expect(validateSaveV44(control)).toBe(control)
    const old = historical37()
    expect(validateSaveV37(old)).toBe(old) // Genuine953 bytes; never relabel current098.
    const title = clone(control), credit = clone(control), entry = clone(control)
    const authoredId = `${CANONICAL_STUDIO}:historical-film:0`
    title.state.hollywood!.films.find(row => row.filmId === authoredId)!.title = 'Detached malformed title'
    credit.state.hollywood!.films.find(row => row.filmId === authoredId)!.credits.find(row => row.talentId === id)!.name = 'Detached malformed name'
    entry.state.hollywood!.employment.find(row => row.contractId === `${CANONICAL_STUDIO}:contract:${id}:0`)!.reason = 'replacement'
    for (const [mutant, cause] of [[title, /authored film differs from canonical starting manifest/],
      [credit, /authored credit differs from canonical starting manifest/],
      [entry, /authored credit differs from canonical starting manifest/]] as const) {
      expect(() => validateProfessionHistory({ ...mutant.state })).not.toThrow()
      expect(() => validateSaveV44(mutant)).toThrow(cause)
    }
    const missing = clone(control)
    // Remove only this person's authority; keep other real changes and coherent
    // array ordinals so an unrelated ordinal error cannot mask the role refusal.
    missing.state.careerLifecycle = { ...missing.state.careerLifecycle,
      professionChanges: missing.state.careerLifecycle.professionChanges.filter(row => row.personId !== id)
        .map((row, ordinal) => ({ ...row, ordinal, id: `profession-change-${ordinal}` })) }
    expect(person(missing.state, id).role).toBe('writer')
    expect(() => validateProfessionHistory({ ...missing.state })).toThrow(/current profession changed without its anchored change history/)
    expect(() => validateSaveV44(missing)).toThrow(/current profession changed without its anchored change history/)
    expect(validateSaveV44(control)).toBe(control)
  })

  it('L1 observes an actual passive non-player Writer hire with one employer and paid signing authority', () => {
    const f = canonicalHired(), h = f.state.hollywood!, job = f.employment
    acceptedEvidence(f.state); originalFacts(f.state)
    expect(job.terms.startWeek).toBeGreaterThanOrEqual(f.choiceWeek)
    expect(job.terms.startWeek).toBe(f.state.market.tick - 1)
    expect(job.terms.endWeekExclusive).toBeGreaterThan(job.terms.startWeek)
    expect(h.identities.find(row => row.studioId === job.studioId)).toMatchObject({ role: 'rival' })
    expect(job.studioId).not.toBe(h.playerStudioId)
    expect(professionAtWeek(f.state, id, job.terms.startWeek)).toBe('writer')
    expect(person(f.state, id).role).toBe('writer')
    expect(activeContract(f.state, id)).toBeUndefined()
    const active = canonicalEmployment(f.state).filter(row => row.terms.startWeek <= f.state.market.tick
      && f.state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive))
    expect(active).toEqual([job])
    const sign = h.receipts.filter(row => row.kind === 'employment' && row.contractId === job.contractId
      && row.toStudioId === job.studioId)
    expect(sign).toHaveLength(1)
    expect(sign[0]).toMatchObject({ week: job.terms.startWeek, studioId: job.studioId, kind: 'employment',
      talentId: id, reason: job.reason, contractId: job.contractId, toStudioId: job.studioId })
    expect(job.terms.signingBonus).toBeGreaterThan(0)
    signingReconciliation(f.state, job.studioId)
    expect(canonicalEmployment(f.state).filter(row => row.terms.startWeek >= f.choiceWeek))
      .toEqual([job])
    expect(f.state.firstTakes.filter(row => row.week > f.choiceWeek && Object.values(row.cast).includes(id))).toEqual([])
  })

  it('L2 completes real rival screenplay review, production and released Writer credit after the change', () => {
    const f = canonicalReleased(), film = f.film, state = f.state, h = state.hollywood!
    const business = h.businesses.find(row => row.studioId === film.studioId)
    assert.ok(business)
    const project = business.development.projects.find(row => row.id === film.scriptProjectId)
    assert.ok(project)
    expect(f.project.studioId).toBe(film.studioId)
    expect(f.project.first).toMatchObject({ id: project.id, conceptId: film.conceptId, writerId: id,
      commissionedWeek: project.commissionedWeek })
    expect(project.commissionedWeek).toBe(f.project.state.market.tick - 1)
    expect(project.writerIds).toEqual([id])
    expect(project.commissionedWeek).toBeGreaterThanOrEqual(f.hire.choiceWeek)
    expect(project).toMatchObject({ status: 'produced', productionId: film.filmId, writerId: id,
      conceptId: film.conceptId, dueWeek: null, reservation: null })
    const commissioningJobs = canonicalEmployment(state).filter(row => row.studioId === film.studioId
      && row.terms.startWeek <= project.commissionedWeek && project.commissionedWeek < (row.endedWeek ?? row.terms.endWeekExclusive))
    expect(commissioningJobs).toHaveLength(1)
    expect(professionAtWeek(state, id, project.commissionedWeek)).toBe('writer')
    expect(f.acceptance.before).toMatchObject({ id: project.id, writerId: id, conceptId: film.conceptId, status: 'review' })
    expect(f.acceptance.after).toEqual({ ...f.acceptance.before, status: 'ready' })
    expect(f.acceptance.sourceWeek + 1).toBeGreaterThanOrEqual(project.commissionedWeek)
    const producedAt = f.production.state.hollywood!.businesses.find(row => row.studioId === film.studioId)!
    const production = producedAt.productions.find(row => row.id === film.filmId)
    assert.ok(production)
    expect(production.writerId).toBe(id)
    expect(production.conceptId).toBe(film.conceptId)
    expect(producedAt.development.projects.find(row => row.id === project.id))
      .toMatchObject({ status: 'inProduction', productionId: film.filmId, writerId: id })
    expect(production.startTick).toBeGreaterThanOrEqual(f.acceptance.sourceWeek + 1)
    expect(film.credits.find(row => row.role === 'writer')).toEqual({ talentId: id, name: 'Clara Moss', role: 'writer' })
    expect(film.result.participants?.writer).toMatchObject({ talentId: id, role: 'writer', discipline: 'writing' })
    expect(film.result.releaseTick).toBe(state.market.tick - 1)
    const release = h.receipts.filter(row => row.kind === 'filmReleased' && row.productionId === film.filmId && row.studioId === film.studioId)
    expect(release).toHaveLength(1)
    expect(release[0]).toMatchObject({ week: film.result.releaseTick, conceptId: film.conceptId })
    const cost = business.projects.find(row => row.scriptProjectId === project.id)
    assert.ok(cost)
    expect(cost).toMatchObject({ conceptId: film.conceptId, productionId: film.filmId, announcedWeek: production.startTick })
    expect(film.directCommitment).toBe(cost.development + cost.production + cost.marketing)
    expect(film.directCommitment).toBeGreaterThan(0)
    expect(business.account.periods.reduce((sum, row) => sum + row.movements.production, 0))
      .toBeCloseTo(-business.projects.reduce((sum, row) => sum + row.production, 0), 6)
    expect(business.account.periods.reduce((sum, row) => sum + row.movements.marketing, 0))
      .toBeCloseTo(-business.projects.reduce((sum, row) => sum + row.marketing, 0), 6)
    const events = h.careerEvents.filter(row => row.filmId === film.filmId && row.talentId === id)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ role: 'writer', discipline: 'writing', releaseWeek: film.result.releaseTick })
    expect(events[0]!.workHistoryAfter).toBe(events[0]!.workHistoryBefore + 1)
    const chosen = canonicalChosen().loaded
    expect(person(state, id).workHistory.writing).toBeGreaterThan(person(chosen, id).workHistory.writing)
    for (const current of [state, f.loaded]) {
      acceptedEvidence(current); originalFacts(current)
      expect(retirementRecordFor(current, id, 'actor')).toEqual(retirementRecordFor(chosen, id, 'actor'))
      expect(current.careerLifecycle.professionChanges.filter(row => row.personId === id))
        .toEqual(chosen.careerLifecycle.professionChanges.filter(row => row.personId === id))
      expect(stableStringify(current.hollywood!.careerEvents.filter(row => row.talentId === id && row.discipline === 'acting')))
        .toBe(stableStringify(chosen.hollywood!.careerEvents.filter(row => row.talentId === id && row.discipline === 'acting')))
      expect(stableStringify(current.hollywood!.films.find(row => row.filmId === film.filmId))).toBe(stableStringify(film))
    }
    expect(exportSave(makeSave(f.loaded))).toBe(exportSave(makeSave(state)))
  })
})
