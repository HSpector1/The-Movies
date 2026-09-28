// 1041/1047/1053: actual cohort-born player work and dated origin authority.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it } from 'vitest'
import { ageAt } from '../src/core/aging.js'
import { assignmentRefusal, contractEndRefusal, retirementRecordFor } from '../src/core/careerLifecycle.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { professionAtWeek, transitionInputsFor } from '../src/core/index.js'
import { validateProfessionHistory } from '../src/core/professionHistory.js'
import { convertV38ToV37, convertV39ToV38, convertV40ToV39, convertV41ToV40, exportSave, makeSave, stableStringify, validateSaveV35, validateSaveV37, validateSaveV41 } from '../src/core/save.js'
import { caseForTalent, playerOffer, proposalDraft } from '../src/core/talentMarket.js'
import { careerIdentity, expectedPotentialTier, roleTier } from '../src/core/talentSummary.js'
import { TUNING } from '../src/core/tuning.js'
import type { FilmCreativeRole, GameState, TransitionInputs, TransitionTargetInput } from '../src/core/types.js'
import { clone, compareText, person } from './helpers/p14c3-fixtures.js'
import { acceptedEvidence } from './helpers/p14c3-genuine-evidence-fixtures.js'
import { COHORT_SUBJECT, cohortCase, cohortChosen, cohortEmployment, cohortFinalBoundary, cohortLaterWork,
  cohortNoticeGap, cohortRenewalOne, cohortRenewalThree, cohortRenewalTwo, cohortRouteAccounting, cohortSetup,
  cohortThreeFilms, recordCohortRoute } from './helpers/p14c3-cohort-transition-fixtures.js'

const id = COHORT_SUBJECT
function preserveOrigin(state: GameState): void {
  const original = cohortSetup().untouched
  expect(state.talent.slice(0, original.talent.length).map(row => row.id)).toEqual(original.talent.map(row => row.id))
  expect(state.talentProvenance.rows.slice(0, original.talentProvenance.rows.length)).toEqual(original.talentProvenance.rows)
  expect(state.careerLifecycle.professionAnchors.slice(0, original.careerLifecycle.professionAnchors.length))
    .toEqual(original.careerLifecycle.professionAnchors)
  expect(state.careerLifecycle.cohorts.slice(0, original.careerLifecycle.cohorts.length)).toEqual(original.careerLifecycle.cohorts)
  const receipts = state.careerLifecycle.cohorts.filter(row => row.week === 832)
  expect(receipts).toEqual([{ week: 832, talentCountBefore: 108,
    requested: { actor: 1, director: 0, writer: 0, craft: 0 }, clipped: 0, personIds: [id] }])
  expect(state.talent[108]!.id).toBe(id)
  expect(state.talentProvenance.rows.find(row => row.personId === id)).toEqual({ personId: id,
    kind: 'authored_exact_week', entryWeek: 832, ageAtEntry: 23.874552652348545 })
  expect(state.careerLifecycle.professionAnchors.find(row => row.personId === id)).toEqual({ personId: id,
    profession: 'actor', kind: 'existing', recordedWeek: 2600 })
}
function independentActingInputs(state: GameState) {
  const origin = cohortThreeFilms(), owner = state.hollywood!.playerStudioId, talent = person(state, id)
  const provenance = state.talentProvenance.rows.find(row => row.personId === id)
  assert.ok(provenance)
  const takes = state.firstTakes.filter(row => row.week <= state.market.tick && Object.values(row.cast).includes(id))
    .sort((a, b) => a.week - b.week || compareText(a.studioId, b.studioId)
      || compareText(a.productionId, b.productionId) || compareText(a.eventId, b.eventId))
  expect(takes).toHaveLength(3)
  expect(new Set(takes.map(row => row.productionId))).toEqual(new Set(origin.pictureIds))
  expect(takes.every(row => row.studioId === owner && row.cast.lead === id && row.directorId === origin.team.directorId)).toBe(true)
  const films = state.studio.releasedFilms.filter(row => row.releaseTick <= state.market.tick
    && row.participants && Object.values(row.participants.cast).some(credit => credit.talentId === id))
  expect(films).toHaveLength(3)
  expect(new Set(films.map(row => row.productionId))).toEqual(new Set(origin.pictureIds))
  expect(films.every(row => row.participants!.writer.talentId === origin.team.writerId)).toBe(true)
  expect(state.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id))).toEqual([])
  const pictures = origin.pictureIds.map(pictureId => ({ studioId: owner, pictureId }))
    .sort((a, b) => compareText(a.studioId, b.studioId) || compareText(a.pictureId, b.pictureId))
  const target = (profession: 'director' | 'writer'): TransitionTargetInput => {
    const discipline = profession === 'director' ? 'directing' : 'writing'
    const standing = careerIdentity(talent).disciplines.find(row => row.discipline === discipline)
    assert.ok(standing)
    const tier = roleTier(standing.ovr)
    assert.ok(tier === 'Highly unproven' || tier === 'Raw prospect' || tier === 'Limited-or-developing'
      || tier === 'Strong' || tier === 'Major-studio' || tier === 'Elite' || tier === 'Generational')
    const potential = expectedPotentialTier(talent, discipline, state.seed)
    assert.ok(potential === 'Limited' || potential === 'Steady' || potential === 'Promising'
      || potential === 'High Upside' || potential === 'Exceptional Upside' || potential === 'Generational Upside')
    return { profession, capability: standing.ovr, roleTier: tier, workHistory: standing.workHistory,
      proven: standing.proven, potentialTier: potential, contextCount: 3, contextBand: 2,
      contextWitness: { counterpartId: profession === 'director' ? origin.team.directorId : origin.team.writerId,
        pictures: pictures.slice(0, 2) } }
  }
  const inputs: TransitionInputs = { age: ageAt(provenance, state.market.tick), actingFirstTakes: takes.length,
    leadFirstTakes: takes.length, actingWitnesses: takes.slice(0, 3).map(row => row.eventId), targets: [target('director'), target('writer')] }
  expect(transitionInputsFor(state, id, state.market.tick)).toEqual(inputs)
  expect(inputs.targets[0]).toMatchObject({ profession: 'director', contextCount: 3, contextBand: 2 })
  expect(inputs.targets[0].capability).toBeGreaterThanOrEqual(60)
  expect(inputs.targets[1].capability).toBeLessThan(60)
  return { inputs, takes, films }
}
function preserveChoiceAndActing(state: GameState): void {
  const chosen = cohortChosen().state, firstWork = cohortThreeFilms().state
  for (const field of ['transitionEvaluations', 'professionChanges', 'industryRetirements', 'transitionDue'] as const)
    expect(state.careerLifecycle[field].filter(row => row.personId === id)).toEqual(chosen.careerLifecycle[field].filter(row => row.personId === id))
  expect(retirementRecordFor(state, id, 'actor')).toEqual(retirementRecordFor(chosen, id, 'actor'))
  expect(stableStringify(state.firstTakes.filter(row => Object.values(row.cast).includes(id))))
    .toBe(stableStringify(firstWork.firstTakes.filter(row => Object.values(row.cast).includes(id))))
  expect(stableStringify(state.careerEvents.filter(row => row.talentId === id && row.discipline === 'acting')))
    .toBe(stableStringify(firstWork.careerEvents.filter(row => row.talentId === id && row.discipline === 'acting')))
  expect(person(state, id).workHistory.acting).toBe(3)
  const cases = chosen.talentMarket.cases.filter(row => row.talentId === id)
  expect(state.talentMarket.cases.filter(row => row.talentId === id).slice(0, cases.length)).toEqual(cases)
  preserveOrigin(state)
}
function actual3328Request(state: GameState) {
  const receipts = state.careerLifecycle.cohorts.filter(row => row.week === 3328)
  expect(receipts).toHaveLength(1)
  const receipt = receipts[0]!, prefix = state.talent.slice(0, receipt.talentCountBefore)
  const active: Record<FilmCreativeRole, string[]> = { actor: [], director: [], writer: [], craft: [] }
  const young: Record<FilmCreativeRole, boolean> = { actor: false, director: false, writer: false, craft: false }
  for (const talent of prefix) {
    const anchor = state.careerLifecycle.professionAnchors.find(row => row.personId === talent.id)
    const provenance = state.talentProvenance.rows.find(row => row.personId === talent.id)
    assert.ok(anchor && provenance)
    const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === talent.id && row.week <= 3328)
    expect(changes.length).toBeLessThanOrEqual(1)
    const role = changes.at(0)?.to ?? anchor.profession
    if (role === 'scientist') continue
    if (state.careerLifecycle.records.some(row => row.personId === talent.id && row.profession === role
      && row.status === 'retired' && row.retiredWeek !== null && row.retiredWeek <= 3328)) continue
    active[role].push(talent.id)
    if (ageAt(provenance, 3380) < 30) young[role] = true
  }
  expect(active.actor).not.toContain(id)
  expect(active.director.filter(personId => personId === id)).toEqual([id])
  expect(active.director.filter(personId => personId !== id)).toHaveLength(active.director.length - 1)
  const accepted = { actor: 40, director: 14, writer: 16, craft: 14 }
  const requested: Record<FilmCreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  let room = 32, clipped = 0
  for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
    const wanted = Math.max(accepted[role] - active[role].length, young[role] ? 0 : 1)
    requested[role] = Math.min(room, wanted); room -= requested[role]; clipped += wanted - requested[role]
  }
  expect(receipt.requested).toEqual(requested); expect(receipt.clipped).toBe(clipped)
  expect(receipt.personIds).toHaveLength(Object.values(requested).reduce((sum, n) => sum + n, 0))
  expect(state.talent.slice(receipt.talentCountBefore, receipt.talentCountBefore + receipt.personIds.length).map(row => row.id)).toEqual(receipt.personIds)
  for (const entrant of receipt.personIds) {
    expect(state.careerLifecycle.professionAnchors.filter(row => row.personId === entrant))
      .toEqual([{ personId: entrant, profession: person(state, entrant).role, kind: 'entrant', recordedWeek: 3328 }])
    expect(state.talentProvenance.rows.filter(row => row.personId === entrant))
      .toEqual([expect.objectContaining({ kind: 'authored_exact_week', entryWeek: 3328 })])
  }
  recordCohortRoute('cohort3328', { requested, clipped, entrants: receipt.personIds.length,
    active: Object.fromEntries(Object.entries(active).map(([role, ids]) => [role, ids.length])), focusRole: 'director', focusContribution: 1 })
  return receipt
}

afterAll(() => console.info('C3_COHORT_ROUTE_ACTUAL', JSON.stringify(cohortRouteAccounting())))

describe('C.3 genuine cohort-born Actor enters a new profession with origin authority intact', () => {
  it('J1 accepts genuine35/37/current input and discloses only the initial79M before real public hires', () => {
    const f = cohortSetup()
    expect(validateSaveV35(f.old)).toBe(f.old); expect(validateSaveV37(f.old37)).toBe(f.old37)
    for (const state of [f.untouched, f.funded, f.state]) { acceptedEvidence(state); preserveOrigin(state) }
    expect(f.funded.studio.cash - f.untouched.studio.cash).toBe(79_000_000)
    expect(f.funded.ledger.slice(f.untouched.ledger.length)).toEqual([{ week: 2600, kind: 'studioRevenue', amount: 79_000_000,
      note: '1053 disclosed test bootstrap; not earned revenue; one initial funding arrangement only' }])
    expect(stableStringify({ ...f.funded, studio: { ...f.funded.studio, cash: f.untouched.studio.cash }, ledger: f.untouched.ledger }))
      .toBe(stableStringify(f.untouched))
    expect(f.state.market.tick).toBe(2600)
    expect(f.state.talent).toHaveLength(f.untouched.talent.length + 5)
    const people = [id, f.team.directorId, f.team.writerId, f.team.craftId, f.team.cast.antagonist, f.team.cast.support]
    expect(new Set(people).size).toBe(6)
    for (const personId of people) {
      expect(activeContract(f.state, personId)).toMatchObject({ startWeek: 2600, endWeekExclusive: 2808, termWeeks: 208 })
      const entries = f.state.hollywood!.employment.filter(row => row.terms.talentId === personId && row.terms.startWeek === 2600)
      expect(entries).toHaveLength(1)
      expect(f.state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.talentId === personId
        && row.contractId === entries[0]!.contractId && row.week === 2600)).toHaveLength(1)
    }
    expect(f.state.ledger.slice(f.funded.ledger.length).every(row => row.kind === 'signingBonus')).toBe(true)
    expect(f.state.studio.cash - f.funded.studio.cash).toBe(f.state.ledger.slice(f.funded.ledger.length).reduce((sum, row) => sum + row.amount, 0))
    expect(f.state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)).toEqual([])
    expect(f.state.careerLifecycle.professionChanges.filter(row => row.personId === id)).toEqual([])
    expect(f.state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
    expect(f.state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
  })

  it('J2 actually releases three lead pictures with repeated Director and credited Writer context', () => {
    const f = cohortThreeFilms(), facts = independentActingInputs(f.state)
    expect(f.state.market.tick).toBeLessThanOrEqual(2728)
    expect(facts.inputs.actingFirstTakes).toBe(3); expect(facts.inputs.leadFirstTakes).toBe(3)
    expect(facts.inputs.actingWitnesses).toHaveLength(3)
    expect(facts.inputs.targets.map(row => row.contextWitness.pictures.length)).toEqual([2, 2])
    expect(facts.inputs.targets.map(row => row.workHistory)).toEqual([0, 0])
    expect(facts.inputs.targets.map(row => row.proven)).toEqual([false, false])
    expect(person(f.state, id).workHistory.acting).toBe(3)
    expect(f.state.careerEvents.filter(row => row.talentId === id)).toHaveLength(3)
    expect(f.state.careerEvents.filter(row => row.talentId === id).every(row => row.discipline === 'acting')).toBe(true)
    expect(activeContract(f.state, id)).toMatchObject({ startWeek: 2600, endWeekExclusive: 2808 })
    expect(retirementRecordFor(f.state, id)).toBeUndefined()
    preserveOrigin(f.state); acceptedEvidence(f.state)
  })

  it.each([
    { leaf: 'J3', build: cohortRenewalOne }, { leaf: 'J4', build: cohortRenewalTwo }, { leaf: 'J5', build: cohortRenewalThree },
  ])('$leaf genuinely retains the incumbent through its ordinary proposal and decision-week payment', ({ build }) => {
    const f = build(), state = f.state, { spec } = f, owner = state.hollywood!.playerStudioId
    const original = cohortEmployment(state, f.previousStart, spec.decision), next = cohortEmployment(state, spec.decision, spec.end)
    expect(original.endedWeek).toBe(spec.decision)
    expect(next.contractId).not.toBe(original.contractId)
    expect(next.terms).toEqual(activeContract(state, id))
    expect(cohortCase(state, spec.open, 'expiry')).toMatchObject({ subjectStudioId: owner, contractId: original.contractId,
      openedWeek: spec.open, closedWeek: spec.decision, outcome: 'settled' })
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.reason === 'expiry'
      && row.contractId === original.contractId && row.week === spec.decision))
      .toEqual([expect.objectContaining({ talentId: id, studioId: owner, fromStudioId: owner, toStudioId: null })])
    expect(state.hollywood!.receipts.filter(row => row.kind === 'employment' && row.contractId === next.contractId
      && row.week === spec.decision)).toEqual([expect.objectContaining({ talentId: id, studioId: owner, toStudioId: owner })])
    const ask = playerOffer(state, id, spec.term, spec.decision), salary = Math.round(ask.annualSalary * 1.25)
    const bonus = Math.round(salary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
    expect(next.terms).toMatchObject({ startWeek: spec.decision, endWeekExclusive: spec.end,
      termWeeks: spec.term, annualSalary: salary, signingBonus: bonus })
    const own = f.submitted.talentMarket.proposals.find(row => row.talentId === id && row.issuerStudioId === owner)
    assert.ok(own)
    expect(proposalDraft(state, owner, id, spec.term, 1.25, spec.decision).digest).toBe(own.digest)
    expect(f.submitted.contracts).toEqual(f.opened.contracts); expect(f.submitted.ledger).toEqual(f.opened.ledger)
    expect(f.submitted.studio.cash).toBe(f.opened.studio.cash)
    expect(state.ledger.filter(row => row.kind === 'signingBonus' && row.talentId === id
      && row.week >= spec.open && row.week <= spec.decision)).toEqual([expect.objectContaining({ week: spec.decision, amount: -bonus })])
    expect(state.ledger.slice(0, f.beforeDecision.ledger.length)).toEqual(f.beforeDecision.ledger)
    expect(state.studio.cash - f.beforeDecision.studio.cash)
      .toBe(state.ledger.slice(f.beforeDecision.ledger.length).reduce((sum, row) => sum + row.amount, 0))
    expect(state.talentMarket.receipts.filter(row => row.kind === 'settled' && row.talentId === id
      && row.week >= spec.open && row.week <= spec.decision)).toEqual([expect.objectContaining({ week: spec.decision, studioId: owner })])
    expect(state.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    const priorCases = f.opened.talentMarket.cases.filter(row => row.talentId === id && row.closedWeek !== null)
    for (const earlier of priorCases) expect(cohortCase(state, earlier.openedWeek, earlier.variant)).toEqual(earlier)
    expect(state.talentMarket.receipts.slice(0, f.opened.talentMarket.receipts.length)).toEqual(f.opened.talentMarket.receipts)
    expect(state.talentMarket.cases.filter(row => row.talentId === id && row.variant === 'retirementExtension')).toEqual([])
    expect(state.promises.filter(row => row.beneficiaryPersonId === id)).toEqual([])
    expect(retirementRecordFor(state, id, 'actor')).toBeUndefined()
    preserveOrigin(state); acceptedEvidence(state)
  })

  it('J6 records actual hard70 notice, unoffered59-week descriptor and seven-week expiry gap', () => {
    const f = cohortNoticeGap(), record = retirementRecordFor(f.window, id, 'actor'), view = caseForTalent(f.window, id)
    assert.ok(record && view)
    expect(retirementRecordFor(f.beforeNotice, id, 'actor')).toBeUndefined()
    expect(record).toMatchObject({ cause: 'hardBoundary', announcedWeek: 3231, ageAtAnnouncement: 70,
      effectiveWeek: 3283, status: 'announced', extensionUsed: false, extendedFromWeek: null })
    expect(view).toMatchObject({ openedWeek: 3271, decisionWeek: 3276 })
    const term = record.effectiveWeek + 52 - view.decisionWeek, beforeDraft = stableStringify(f.window)
    expect(term).toBe(59)
    const draft = proposalDraft(f.window, f.window.hollywood!.playerStudioId, id, term, 1.25, f.window.market.tick)
    expect(draft).toMatchObject({ talentId: id, issuerStudioId: f.window.hollywood!.playerStudioId,
      startWeek: 3276, endWeekExclusive: 3335, termWeeks: 59, premiumTier: 1.25 })
    expect(stableStringify(f.window)).toBe(beforeDraft)
    expect(f.window.talentMarket.proposals.filter(row => row.talentId === id)).toEqual([])
    expect(cohortCase(f.expired, 3271, 'retirementExtension')).toMatchObject({ outcome: 'expired', closedWeek: 3276 })
    expect(f.expired.hollywood!.receipts.filter(row => row.kind === 'employment' && row.talentId === id
      && row.reason === 'expiry' && row.week === 3276 && row.contractId === cohortEmployment(f.expired, 3224, 3276).contractId)).toHaveLength(1)
    for (const state of [f.expired, f.state]) {
      expect(activeContract(state, id)).toBeUndefined(); expect(busyTalentIds(state).has(id)).toBe(false)
      expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'announced', effectiveWeek: 3283, extensionUsed: false })
      expect(contractEndRefusal(state, id, state.market.tick + 52)).toMatch(/retirementAnnounced/)
      expect(state.talentMarket.receipts.filter(row => row.kind === 'settled' && row.talentId === id && row.week >= 3271)).toEqual([])
      expect(state.ledger.filter(row => row.kind === 'signingBonus' && row.talentId === id && row.week >= 3271)).toEqual([])
      preserveOrigin(state); acceptedEvidence(state)
    }
    expect(f.state.market.tick).toBe(3282)
  })

  it('J7 makes the real3283 Director choice while preserving the original832 Actor receipt and strict cause', () => {
    const f = cohortChosen(), state = f.state, facts = independentActingInputs(state)
    expect(facts.inputs.age).toBe(71)
    const questions = state.careerLifecycle.transitionEvaluations.filter(row => row.personId === id)
    expect(questions).toHaveLength(1)
    expect(questions[0]).toMatchObject({ personId: id, week: 3283, source: { personId: id, profession: 'actor' },
      rulesVersion: 1, inputs: facts.inputs, outcome: 'chosen', selected: 'director', reason: 'onlyEligibleTarget' })
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === id))
      .toEqual([expect.objectContaining({ personId: id, week: 3283, from: 'actor', to: 'director', evaluationId: questions[0]!.id })])
    expect(retirementRecordFor(state, id)).toBeUndefined()
    expect(state.careerLifecycle.transitionDue.filter(row => row.personId === id)).toEqual([])
    expect(state.careerLifecycle.industryRetirements.filter(row => row.personId === id)).toEqual([])
    expect(activeContract(state, id)).toBeUndefined(); expect(state.freeAgents.filter(personId => personId === id)).toEqual([id])
    expect(state.hollywood!.employment.filter(row => row.terms.talentId === id)).toEqual(f.before.hollywood!.employment.filter(row => row.terms.talentId === id))
    expect(state.ledger.filter(row => row.talentId === id && row.week === 3283)).toEqual([])
    expect(state.careerEvents.filter(row => row.talentId === id)).toEqual(f.before.careerEvents.filter(row => row.talentId === id))
    expect(person(state, id).workHistory.directing).toBe(0)
    expect(professionAtWeek(state, id, 832)).toBe('actor')
    expect(professionAtWeek(state, id, 3282)).toBe('actor')
    expect(professionAtWeek(state, id, 3283)).toBe('director')
    preserveOrigin(state)
    const control = makeSave(state), controlBytes = stableStringify(control), malformed = clone(control)
    expect(validateSaveV41(control)).toBe(control)
    const amended = malformed.state.careerLifecycle.cohorts.map(row => row.week !== 832 ? row
      : { ...row, requested: { actor: 0, director: 1, writer: 0, craft: 0 } })
    Object.defineProperty(malformed.state.careerLifecycle, 'cohorts', { value: amended, enumerable: true, configurable: true, writable: true })
    expect(validateProfessionHistory({ ...malformed.state }).originalProfession(id)).toBe('actor')
    expect(() => validateSaveV41(malformed)).toThrow(/cohort receipt.*week 832.*as a director entrant.*original profession disagrees/)
    expect(stableStringify(control)).toBe(controlBytes)
    expect(validateSaveV41(control)).toBe(control)
    expect(() => convertV38ToV37(convertV39ToV38(convertV40ToV39(convertV41ToV40(control))))).toThrow(/cannot downgrade or discard an opportunity predicate or recorded first-take subject/)
    const origin = cohortSetup()
    expect(validateSaveV35(origin.old)).toBe(origin.old); expect(validateSaveV37(origin.old37)).toBe(origin.old37)
  })

  it('J8 reloads and hires a new crew for genuine Director work while retired acting stays refused', () => {
    const f = cohortLaterWork(), state = f.state, origin = cohortSetup(), chosen = cohortChosen().state
    expect(exportSave(makeSave(f.loaded))).toBe(exportSave(makeSave(chosen)))
    const newIds = f.hired.talent.slice(f.loaded.talent.length).map(row => row.id)
    expect(newIds).toHaveLength(5)
    expect(newIds).toEqual([f.team.writerId, f.team.craftId, f.team.cast.lead, f.team.cast.antagonist, f.team.cast.support])
    expect(newIds.some(personId => origin.state.talent.some(row => row.id === personId))).toBe(false)
    for (const personId of [id, ...newIds]) {
      expect(activeContract(f.hired, personId)).toMatchObject({ startWeek: 3283, endWeekExclusive: 3335, termWeeks: 52 })
      expect(activeContract(state, personId)).toMatchObject({ startWeek: 3283, endWeekExclusive: 3335 })
    }
    for (const personId of newIds) {
      expect(f.hired.talentProvenance.rows.find(row => row.personId === personId)).toMatchObject({ kind: 'authored_exact_week', entryWeek: 3283, ageAtEntry: 30 })
      expect(f.hired.careerLifecycle.professionAnchors.find(row => row.personId === personId)).toEqual({ personId,
        profession: person(f.hired, personId).role, kind: 'entrant', recordedWeek: 3283 })
    }
    expect(assignmentRefusal(f.prepared, id, f.prepared.market.tick, 'actor')).toMatch(/retiredFromProfession/)
    expect(assignmentRefusal(f.prepared, id, f.prepared.market.tick, 'director')).toBeNull()
    const takes = state.firstTakes.filter(row => row.productionId === f.productionId && row.studioId === state.hollywood!.playerStudioId)
    expect(takes).toEqual([expect.objectContaining({ directorId: id, cast: f.team.cast })])
    expect(takes[0]!.week).toBeGreaterThan(3283)
    const film = state.studio.releasedFilms.find(row => row.productionId === f.productionId)
    assert.ok(film)
    expect(film.participants).toMatchObject({ director: { talentId: id }, writer: { talentId: f.team.writerId } })
    expect(film.releaseTick).toBeGreaterThanOrEqual(takes[0]!.week)
    expect(state.market.tick).toBeLessThanOrEqual(3323)
    const events = state.careerEvents.filter(row => row.talentId === id && row.discipline === 'directing')
    expect(events).toEqual([expect.objectContaining({ filmId: f.productionId, role: 'director', workHistoryBefore: 0, workHistoryAfter: 1 })])
    expect(careerIdentity(person(state, id)).disciplines.find(row => row.discipline === 'directing')).toMatchObject({ workHistory: 1, proven: true })
    preserveChoiceAndActing(state); acceptedEvidence(state)
  })

  it('J9 counts the active Director at actual3328 and survives loaded3329 with all origin and choice facts', () => {
    const f = cohortFinalBoundary(), receipt = actual3328Request(f.cohort)
    expect(f.before.market.tick).toBe(3327); expect(f.state.market.tick).toBe(3329)
    expect(exportSave(makeSave(f.loaded))).toBe(exportSave(makeSave(f.cohort)))
    expect(f.cohort.careerLifecycle.cohorts.slice(0, f.before.careerLifecycle.cohorts.length)).toEqual(f.before.careerLifecycle.cohorts)
    expect(f.cohort.careerLifecycle.professionAnchors.slice(0, f.before.careerLifecycle.professionAnchors.length))
      .toEqual(f.before.careerLifecycle.professionAnchors)
    expect(f.cohort.talentProvenance.rows.slice(0, f.before.talentProvenance.rows.length)).toEqual(f.before.talentProvenance.rows)
    expect(f.cohort.talent.slice(0, f.before.talent.length).map(row => row.id)).toEqual(f.before.talent.map(row => row.id))
    for (const state of [f.cohort, f.loaded, f.state]) {
      expect(state.careerLifecycle.cohorts.filter(row => row.week === 3328)).toEqual([receipt])
      expect(person(state, id).role).toBe('director')
      expect(activeContract(state, id)).toMatchObject({ startWeek: 3283, endWeekExclusive: 3335 })
      expect(retirementRecordFor(state, id)).toBeUndefined()
      expect(retirementRecordFor(state, id, 'actor')).toMatchObject({ status: 'retired', retiredWeek: 3283 })
      preserveChoiceAndActing(state); acceptedEvidence(state)
    }
    expect(cohortRouteAccounting().calls).toBe(729)
  })
})
