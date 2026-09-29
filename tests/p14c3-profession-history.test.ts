// 1040/1044: public append paths and invocation-local historical authority.
import assert from 'node:assert/strict'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { ageAt } from '../src/core/aging.js'
import { activeContract, canAfford, offerForTalent } from '../src/core/employment.js'
import { initializeHollywood } from '../src/core/hollywood.js'
import * as hollywoodValidation from '../src/core/hollywoodValidation.js'
import { professionAtWeek } from '../src/core/index.js'
import { TRANSITION_ROOT_FIELDS, validateProfessionHistory } from '../src/core/professionHistory.js'
import type { ProfessionValidationContext } from '../src/core/professionHistory.js'
import * as save from '../src/core/save.js'
import { researchCandidates } from '../src/core/technology.js'
import type { FilmCreativeRole, GameState, RetirementRecordV36 } from '../src/core/types.js'
import { clone, FOCUS, historical37, person, scientistBoundary } from './helpers/p14c3-fixtures.js'
import { acceptBoundary, actual207, actual208, actual209, boundaryAccounting, cachedBoundary,
  CREATOR_KINDS, creatorBoundary, deepDeficit2652, dormant209, dormantBoundary, freshBoundary, freshIndustryBoundary,
  lateIndustryBoundary, mutableField, recordBoundary, reopenBoundary } from './helpers/p14c3-history-boundary-fixtures.js'

function unchangedHistory(before: GameState, state: GameState): void {
  expect(state.careerLifecycle.transitionEvaluations).toEqual(before.careerLifecycle.transitionEvaluations)
  expect(state.careerLifecycle.professionChanges).toEqual(before.careerLifecycle.professionChanges)
  expect(state.careerLifecycle.industryRetirements).toEqual(before.careerLifecycle.industryRetirements)
  expect(state.careerLifecycle.transitionDue).toEqual(before.careerLifecycle.transitionDue)
  expect(state.careerLifecycle.records).toEqual(before.careerLifecycle.records)
  expect(state.careerLifecycle.cohorts).toEqual(before.careerLifecycle.cohorts)
}
function appendProof(before: GameState, state: GameState, ids: readonly string[], week: number): void {
  expect(state.talent.slice(0, before.talent.length)).toEqual(before.talent)
  expect(state.talent.slice(before.talent.length).map(row => row.id)).toEqual(ids)
  expect(state.careerLifecycle.professionAnchors.slice(0, before.talent.length)).toEqual(before.careerLifecycle.professionAnchors)
  expect(state.talentProvenance.rows.slice(0, before.talentProvenance.rows.length)).toEqual(before.talentProvenance.rows)
  for (const id of ids) {
    expect(state.talentProvenance.rows.filter(row => row.personId === id)).toEqual([
      expect.objectContaining({ kind: 'authored_exact_week', entryWeek: week }),
    ])
    expect(state.careerLifecycle.professionAnchors.filter(row => row.personId === id)).toEqual([
      { personId: id, profession: person(state, id).role, kind: 'entrant', recordedWeek: week },
    ])
  }
  expect(state.careerLifecycle.professionAnchors).toHaveLength(state.talent.length)
  expect(new Set(state.careerLifecycle.professionAnchors.map(row => row.personId)).size).toBe(state.talent.length)
}
const originalValidateHollywood: typeof hollywoodValidation.validateHollywood = hollywoodValidation.validateHollywood
function observeHollywood(contexts: (ProfessionValidationContext | undefined)[]) {
  return vi.spyOn(hollywoodValidation, 'validateHollywood').mockImplementation((...args) => {
    originalValidateHollywood(...args)
    contexts.push(args[8])
  })
}
function historyProof(state: GameState): ProfessionValidationContext {
  // A record view is the declared raw-validator boundary, not a fabricated live
  // cast. Full38 must already accept every positive passed by these tests.
  return validateProfessionHistory({ ...state })
}
function frozen<T extends { saveVersion: number; state: object }>(value: T, reader: (input: unknown) => T): T {
  expect(reader(value)).toBe(value)
  const root: unknown = Reflect.get(value.state, 'careerLifecycle')
  for (const field of TRANSITION_ROOT_FIELDS) expect(root !== null && typeof root === 'object' && Object.hasOwn(root, field)).toBe(false)
  return value
}
function expectedCohort(state: GameState, week: number) {
  const matches = state.careerLifecycle.cohorts.filter(row => row.week === week)
  expect(matches).toHaveLength(1)
  const receipt = matches[0]!, prefix = state.talent.slice(0, receipt.talentCountBefore)
  const roles: readonly FilmCreativeRole[] = ['actor', 'director', 'writer', 'craft']
  const counts: Record<FilmCreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  const young: Record<FilmCreativeRole, boolean> = { actor: false, director: false, writer: false, craft: false }
  for (const talent of prefix) {
    const anchor = state.careerLifecycle.professionAnchors.find(row => row.personId === talent.id)
    assert.ok(anchor)
    const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === talent.id && row.week <= week)
    expect(changes.length).toBeLessThanOrEqual(1)
    const role = changes.at(0)?.to ?? anchor.profession
    if (role === 'scientist') continue
    if (state.careerLifecycle.records.some(row => row.personId === talent.id && row.profession === role
      && row.status === 'retired' && row.retiredWeek !== null && row.retiredWeek <= week)) continue
    counts[role]++
    const provenance = state.talentProvenance.rows.find(row => row.personId === talent.id)
    assert.ok(provenance)
    if (ageAt(provenance, week + 52) < 30) young[role] = true
  }
  let room = 32, clipped = 0
  const requested: Record<FilmCreativeRole, number> = { actor: 0, director: 0, writer: 0, craft: 0 }
  const accepted = { actor: 40, director: 14, writer: 16, craft: 14 }
  for (const role of roles) {
    const wanted = Math.max(accepted[role] - counts[role], young[role] ? 0 : 1)
    requested[role] = Math.min(wanted, room); room -= requested[role]; clipped += wanted - requested[role]
  }
  expect(receipt.requested).toEqual(requested); expect(receipt.clipped).toBe(clipped)
  expect(receipt.personIds.length).toBe(Object.values(requested).reduce((sum, n) => sum + n, 0))
  expect(state.talent.slice(receipt.talentCountBefore, receipt.talentCountBefore + receipt.personIds.length).map(row => row.id))
    .toEqual(receipt.personIds)
  recordBoundary(`cohort${week}`, { entrants: receipt.personIds.length, requested, counts, clipped })
  return receipt
}

afterAll(() => console.info('C3_HISTORY_BOUNDARY_ACTUAL', JSON.stringify(boundaryAccounting())))

describe('C.3 current append and strict historical authority boundaries', () => {
  it.each(CREATOR_KINDS)('H1–H3 %s appends one real209 entrant and survives reload', kind => {
    const f = creatorBoundary(kind), beforeBytes = save.stableStringify(f.before)
    expect(f.state.market.tick).toBe(209)
    appendProof(f.before, f.state, [f.id], 209)
    unchangedHistory(f.before, f.state)
    expect(f.state.founding).toBeNull()
    expect(f.state.freeAgents.filter(id => id === f.id)).toEqual([f.id])
    expect(activeContract(f.state, f.id)).toBeUndefined()
    expect(f.state.hollywood!.employment.filter(row => row.terms.talentId === f.id)).toEqual([])
    expect(f.state.talentProvenance.rows.find(row => row.personId === f.id)).toMatchObject({ ageAtEntry: 30 })
    expect(save.exportSave(save.makeSave(f.loaded))).toBe(save.exportSave(save.makeSave(f.state)))
    expect(() => save.convertV38ToV37(save.convertV39ToV38(save.convertV40ToV39(save.convertV41ToV40(save.convertV42ToV41(save.makeSave(f.state))))))).toThrow(/entrant authority|profession transition/)
    expect(save.stableStringify(f.before)).toBe(beforeBytes)
  })

  it('H4 recruits the actual new Scientist01 with one670 anchor and preserves retained00', () => {
    const f = cachedBoundary('new-scientist', () => {
      const before = scientistBoundary()
      expect(before.market.tick).toBe(670); expect(before.studio.cash).toBe(4_673_280)
      expect(before.talent.filter(row => row.role === 'scientist').map(row => row.id)).toEqual(['t-sci-00'])
      const laboratory = before.operations.facilities.find(row => row.capability === 'laboratory')
      assert.ok(laboratory)
      expect(before.talent.some(row => row.id === 't-sci-01')).toBe(false)
      const candidate = researchCandidates(before).find(row => row.id === 't-sci-01')
      assert.ok(candidate)
      expect(before.hollywood!.employment.filter(row => row.terms.talentId === candidate.id)).toEqual([])
      const preview = offerForTalent(before.seed, { ...candidate, age: Math.floor(candidate.age) }, 208, 670)
      expect(canAfford(before, preview.signingBonus).ok, 'actual signing bonus is affordable before recruitment').toBe(true)
      expect(before.studio.cash).toBeGreaterThanOrEqual(preview.signingBonus)
      acceptBoundary(before)
      const state = applyActions(before, [{ kind: 'recruitScientist', laboratoryFacilityId: laboratory.id, scientistId: candidate.id }])
      acceptBoundary(state)
      return { before, state, id: candidate.id, laboratoryId: laboratory.id, exactEntryAge: candidate.age,
        previewSigningBonus: preview.signingBonus }
    })
    appendProof(f.before, f.state, [f.id], 670)
    unchangedHistory(f.before, f.state)
    expect(person(f.state, 't-sci-00')).toEqual(person(f.before, 't-sci-00'))
    expect(f.state.talentProvenance.rows.find(row => row.personId === f.id)).toMatchObject({ ageAtEntry: f.exactEntryAge })
    expect(person(f.state, f.id)).toMatchObject({ role: 'scientist', age: Math.floor(f.exactEntryAge) })
    const contract = activeContract(f.state, f.id)
    assert.ok(contract)
    expect(contract).toMatchObject({ startWeek: 670, endWeekExclusive: 878, termWeeks: 208 })
    expect(contract.signingBonus).toBe(f.previewSigningBonus)
    expect(f.state.studio.cash).toBe(f.before.studio.cash - contract.signingBonus)
    expect(f.state.ledger.slice(f.before.ledger.length)).toEqual([
      expect.objectContaining({ week: 670, kind: 'signingBonus', talentId: f.id, amount: -contract.signingBonus }),
    ])
    const beforeRepeat = save.stableStringify(f.state)
    expect(() => applyActions(f.state, [{ kind: 'recruitScientist', laboratoryFacilityId: f.laboratoryId, scientistId: f.id }]))
      .toThrow(/already employs/)
    expect(save.stableStringify(f.state)).toBe(beforeRepeat)
    reopenBoundary(f.state)
  })

  it('H5 fresh public founding appends the actual24 canonical people once', () => {
    const { before, state } = freshIndustryBoundary(), ids = state.talent.slice(before.talent.length).map(row => row.id)
    expect(ids).toHaveLength(24)
    appendProof(before, state, ids, 0)
    expect(state.careerLifecycle.professionAnchors.slice(0, before.talent.length).every(row => row.kind === 'existing')).toBe(true)
    expect(state.hollywood).toMatchObject({ origin: 'fresh', originWeek: 0 })
    const h = state.hollywood!
    expect(h.identities.filter(row => row.role === 'rival' && row.enteredWeek === 0)).toHaveLength(4)
    expect(h.films.filter(row => row.provenance === 'authored-start/v1')).toHaveLength(8)
    for (const id of ids) {
      expect(h.employment.filter(row => row.reason === 'entry' && row.terms.talentId === id)).toEqual([
        expect.objectContaining({ terms: expect.objectContaining({ startWeek: 0, endWeekExclusive: 208 }) }),
      ])
      expect(h.receipts.filter(row => row.kind === 'employment' && row.reason === 'entry' && row.talentId === id)).toHaveLength(1)
      expect(h.films.filter(row => row.provenance === 'authored-start/v1' && row.credits.some(credit => credit.talentId === id))).toHaveLength(2)
    }
    const beforeRepeat = save.stableStringify(state)
    expect(initializeHollywood(state, 'fresh')).toBe(state)
    expect(save.stableStringify(state)).toBe(beforeRepeat)
    acceptBoundary(state)
  })

  it('H6 actual208 tick preserves the zero-request formula after the two real role changes', () => {
    const before = actual207(), state = actual208()
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === FOCUS.director || row.personId === FOCUS.writer))
      .toHaveLength(2)
    const receipt = expectedCohort(state, 208)
    expect(receipt.requested).toEqual({ actor: 0, director: 0, writer: 0, craft: 0 })
    expect(receipt.clipped).toBe(0)
    expect(receipt.personIds).toEqual([])
    expect(state.careerLifecycle.cohorts.slice(0, before.careerLifecycle.cohorts.length)).toEqual(before.careerLifecycle.cohorts)
    expect(state.careerLifecycle.professionAnchors.slice(0, before.talent.length)).toEqual(before.careerLifecycle.professionAnchors)
    expect(state.talent.slice(0, before.talent.length).map(row => row.id)).toEqual(before.talent.map(row => row.id))
    expect(state.talentProvenance.rows.slice(0, before.talentProvenance.rows.length)).toEqual(before.talentProvenance.rows)
    acceptBoundary(state)
  })

  it('H7 genuine empty dormant34→38 control remains null through209 without invented retirement', () => {
    const f = dormantBoundary(), original = save.stableStringify(f.old)
    const v35 = frozen(save.convertV34ToV35(f.old), save.validateSaveV35)
    const v36 = frozen(save.convertV35ToV36(v35), save.validateSaveV36)
    const v37 = frozen(save.convertV36ToV37(v36), save.validateSaveV37)
    expect(v37.state.hollywood).toBeNull()
    const after = dormant209()
    for (const state of [f.state, after]) {
      expect(state.hollywood).toBeNull()
      expect(state.careerLifecycle.records).toEqual([])
      expect(state.careerLifecycle.transitionBoundaryWeek).toBe(208)
      expect(state.careerLifecycle.professionAnchors).toEqual(f.state.talent.map(row =>
        ({ personId: row.id, profession: row.role, kind: 'existing', recordedWeek: 208 })))
      expect(state.careerLifecycle.transitionEvaluations).toEqual([])
      expect(state.careerLifecycle.professionChanges).toEqual([])
      expect(state.careerLifecycle.industryRetirements).toEqual([])
      expect(state.careerLifecycle.transitionDue).toEqual([])
      expect(state.careerLifecycle.cohorts).toEqual([])
      acceptBoundary(state)
    }
    expect(save.stableStringify(f.old)).toBe(original)
  })

  it('H8 actual late founding keeps boundary208 and anchors only genuinely new209 entry hires', () => {
    const { before, state } = lateIndustryBoundary()
    expect(state.hollywood).toMatchObject({ origin: 'migration', originWeek: 209 })
    expect(state.careerLifecycle.transitionBoundaryWeek).toBe(208)
    const old = new Set(before.talent.map(row => row.id)), minted = state.talent.filter(row => !old.has(row.id)).map(row => row.id)
    appendProof(before, state, minted, 209)
    unchangedHistory(before, state)
    const hired = state.hollywood!.employment.filter(row => row.reason === 'entry' && row.terms.startWeek === 209)
    const reused = hired.filter(row => old.has(row.terms.talentId))
    expect(hired).toHaveLength(24)
    expect(new Set(hired.map(row => row.terms.talentId)).size).toBe(24)
    expect(hired.filter(row => !old.has(row.terms.talentId)).map(row => row.terms.talentId).sort()).toEqual([...minted].sort())
    for (const row of reused) expect(state.careerLifecycle.professionAnchors.find(anchor => anchor.personId === row.terms.talentId))
      .toEqual(before.careerLifecycle.professionAnchors.find(anchor => anchor.personId === row.terms.talentId))
    const snapshot = save.stableStringify(state)
    expect(initializeHollywood(state, 'migration')).toBe(state)
    expect(save.stableStringify(state)).toBe(snapshot)
    recordBoundary('late209', { minted: minted.length, reused: reused.length, employment: hired.length })
    acceptBoundary(state)
  })

  it('H9 every actual frozen18→37 intermediate stays free of current profession fields', () => {
    const current = freshBoundary(), original = save.stableStringify(current)
    expect(current.careerLifecycle.professionAnchors.every(row => row.kind === 'existing')).toBe(true)
    const v18 = frozen(save.makeSaveV18(current), save.validateSaveV18)
    const v19 = frozen(save.convertV18ToV19(v18), save.validateSaveV19)
    const v20 = frozen(save.convertV19ToV20(v19), save.validateSaveV20)
    const v21 = frozen(save.convertV20ToV21(v20), save.validateSaveV21)
    const v22 = frozen(save.convertV21ToV22(v21), save.validateSaveV22)
    const v23 = frozen(save.convertV22ToV23(v22), save.validateSaveV23)
    const v24 = frozen(save.convertV23ToV24(v23), save.validateSaveV24)
    const v25 = frozen(save.convertV24ToV25(v24), save.validateSaveV25)
    const v26 = frozen(save.convertV25ToV26(v25), save.validateSaveV26)
    const v27 = frozen(save.convertV26ToV27(v26), save.validateSaveV27)
    const v28 = frozen(save.convertV27ToV28(v27), save.validateSaveV28)
    const v29 = frozen(save.convertV28ToV29(v28), save.validateSaveV29)
    const v30 = frozen(save.convertV29ToV30(v29), save.validateSaveV30)
    const v31 = frozen(save.convertV30ToV31(v30), save.validateSaveV31)
    const v32 = frozen(save.convertV31ToV32(v31), save.validateSaveV32)
    const v33 = frozen(save.convertV32ToV33(v32), save.validateSaveV33)
    const v34 = frozen(save.convertV33ToV34(v33), save.validateSaveV34)
    const v35 = frozen(save.convertV34ToV35(v34), save.validateSaveV35)
    const v36 = frozen(save.convertV35ToV36(v35), save.validateSaveV36)
    const v37 = frozen(save.convertV36ToV37(v36), save.validateSaveV37)
    const final = save.convertV37ToV38(v37)
    expect(save.validateSaveV38(final)).toBe(final)
    expect(final.state.careerLifecycle.professionAnchors).toEqual(final.state.talent.map(row =>
      ({ personId: row.id, profession: row.role, kind: 'existing', recordedWeek: final.state.market.tick })))
    expect(save.stableStringify(current)).toBe(original)
  })

  it('H10 actual whole38 delegates copied original/date/entrant authority to the real19 endpoint', () => {
    const f = creatorBoundary('createTalent'), current = save.makeSave(f.state), old = historical37()
    expect(save.validateSaveV42(current)).toBe(current); expect(save.validateSaveV37(old)).toBe(old)
    const currentBytes = save.stableStringify(current), oldBytes = save.stableStringify(old)
    const contexts: (ProfessionValidationContext | undefined)[] = [], spy = observeHollywood(contexts)
    try {
      expect(save.validateSaveV42(current)).toBe(current)
      expect(contexts.length, 'actual private chain must reach the spied real Hollywood validator').toBeGreaterThan(0)
      for (const context of contexts) {
        assert.ok(context)
        expect(context.originalProfession(FOCUS.director)).toBe('actor')
        expect(context.professionAtWeek(FOCUS.director, 207)).toBe('actor')
        expect(context.professionAtWeek(FOCUS.director, 208)).toBe('director')
        expect(context.professionAtWeek(FOCUS.writer, 208)).toBe('writer')
        expect(context.entrantWeek(f.id)).toBe(209)
      }
      contexts.length = 0
      expect(save.validateSaveV37(old)).toBe(old)
      expect(contexts.length).toBeGreaterThan(0)
      expect(contexts.every(context => context === undefined)).toBe(true)
    } finally { spy.mockRestore() }
    expect(save.stableStringify(current)).toBe(currentBytes); expect(save.stableStringify(old)).toBe(oldBytes)
  })

  it('H11 A/B/A validation and copied closure facts remain independent of caller mutations', () => {
    const f = creatorBoundary('createTalent'), a = save.makeSave(f.state), b = save.makeSave(actual207())
    const aBytes = save.stableStringify(a), bBytes = save.stableStringify(b)
    for (const input of [a, b, a]) expect(save.validateSaveV42(input)).toBe(input)
    expect(professionAtWeek(a.state, FOCUS.director, 208)).toBe('director')
    expect(professionAtWeek(b.state, FOCUS.director, 207)).toBe('actor')
    const detached = clone(a), contexts: (ProfessionValidationContext | undefined)[] = [], spy = observeHollywood(contexts)
    try { expect(save.validateSaveV42(detached)).toBe(detached) } finally { spy.mockRestore() }
    const context = contexts.at(-1)
    assert.ok(context, 'actual successful delegated context is captured')
    const anchor = detached.state.careerLifecycle.professionAnchors.find(row => row.personId === FOCUS.director)
    const change = detached.state.careerLifecycle.professionChanges.find(row => row.personId === FOCUS.director)
    const entrant = detached.state.careerLifecycle.professionAnchors.find(row => row.personId === f.id)
    assert.ok(anchor && change && entrant)
    anchor.profession = 'writer'; change.to = 'writer'; entrant.recordedWeek = 208
    person(detached.state, FOCUS.director).role = 'writer'
    expect(context.originalProfession(FOCUS.director)).toBe('actor')
    expect(context.professionAtWeek(FOCUS.director, 207)).toBe('actor')
    expect(context.professionAtWeek(FOCUS.director, 208)).toBe('director')
    expect(context.entrantWeek(f.id)).toBe(209)
    const forgedB = clone(b)
    person(forgedB.state, FOCUS.director).role = 'director'
    expect(() => save.validateSaveV42(forgedB)).toThrow(/current profession changed without its anchored change history/)
    const old = historical37(), forgedOld = clone(old)
    expect(save.validateSaveV37(old)).toBe(old)
    const oldPerson = forgedOld.state.talent.find(row => row.id === FOCUS.director)
    assert.ok(oldPerson); oldPerson.role = 'director'
    expect(() => save.validateSaveV37(forgedOld)).toThrow(/retirement record.*names profession actor/)
    expect(save.validateSaveV42(a)).toBe(a); expect(save.validateSaveV42(b)).toBe(b)
    expect(save.stableStringify(a)).toBe(aBytes); expect(save.stableStringify(b)).toBe(bBytes)
  })

  it('H12 a future209 entrant cannot be smuggled into an earlier208 cohort prefix', () => {
    const f = creatorBoundary('createTalent'), control = save.makeSave(f.state), malformed = clone(control)
    expect(save.validateSaveV42(control)).toBe(control)
    const prior = save.stableStringify(control), index = malformed.state.careerLifecycle.cohorts.findIndex(row => row.week === 208)
    expect(index).toBeGreaterThanOrEqual(0)
    const receipts = [...malformed.state.careerLifecycle.cohorts]
    receipts[index] = { week: 208, talentCountBefore: malformed.state.talent.length,
      requested: { actor: 0, director: 0, writer: 0, craft: 0 }, clipped: 0, personIds: [] }
    mutableField(malformed.state.careerLifecycle, 'cohorts', receipts)
    expect(historyProof(malformed.state).entrantWeek(f.id)).toBe(209)
    expect(() => save.validateSaveV42(malformed)).toThrow(/future entrant in its recorded talent prefix/)
    expect(save.stableStringify(control)).toBe(prior)
    expect(save.validateSaveV42(control)).toBe(control)
  })

  it('H13 private34 refuses an otherwise shaped retirement predating actual creation', () => {
    const f = creatorBoundary('createTalent'), control = save.makeSave(f.state), malformed = clone(control)
    expect(save.validateSaveV42(control)).toBe(control)
    const prior = save.stableStringify(control)
    const arranged: RetirementRecordV36 = { personId: f.id, profession: 'actor', intentRulesVersion: 1,
      cause: 'hardBoundary', announcedWeek: 208, ageAtAnnouncement: 30, effectiveWeek: 260,
      status: 'announced', finishingFromWeek: null, retiredWeek: null, extensionUsed: false, extendedFromWeek: null }
    mutableField(malformed.state.careerLifecycle, 'records', [...malformed.state.careerLifecycle.records, arranged])
    expect(historyProof(malformed.state).entrantWeek(f.id)).toBe(209)
    expect(() => save.validateSaveV42(malformed)).toThrow(/precedes this person's actual creation/)
    expect(save.stableStringify(control)).toBe(prior)
    expect(save.validateSaveV42(control)).toBe(control)
  })

  it('H14 frozen public37 never borrows current authority from root fields or earlier invocations', () => {
    const old = historical37(), current = save.makeSave(actual209()), original = save.stableStringify(old)
    expect(save.validateSaveV37(old)).toBe(old); expect(save.validateSaveV42(current)).toBe(current)
    const extra = clone(old)
    for (const field of TRANSITION_ROOT_FIELDS) mutableField(extra.state.careerLifecycle, field, clone(current.state.careerLifecycle[field]))
    expect(() => save.validateSaveV37(extra)).toThrow(/careerLifecycle.*exactly/)
    const stripped = clone(current)
    for (const field of TRANSITION_ROOT_FIELDS) Reflect.deleteProperty(stripped.state.careerLifecycle, field)
    const stamped = { ...stripped, saveVersion: 37 }
    const contexts: (ProfessionValidationContext | undefined)[] = [], spy = observeHollywood(contexts)
    try {
      expect(() => save.validateSaveV37(stamped)).toThrow(/retirement record.*names profession actor/)
      expect(save.validateSaveV37(old)).toBe(old)
      expect(contexts.length, 'genuine historical control reaches the real endpoint').toBeGreaterThan(0)
      expect(contexts.every(context => context === undefined)).toBe(true)
    } finally { spy.mockRestore() }
    expect(save.stableStringify(old)).toBe(original)
    expect(save.validateSaveV42(current)).toBe(current)
  })

  it('H15 actual deep-deficit2600→2652 tick appends a nonempty cohort with current entrant authority', () => {
    const f = deepDeficit2652()
    expect(f.reconciled.market.tick).toBe(2601)
    expect(f.previous.market.tick).toBe(2651)
    const originalIds = new Set(f.before.talent.map(row => row.id))
    const previousIds = new Set(f.previous.talent.map(row => row.id))
    for (const state of [f.state, f.loaded]) {
      expect(state.market.tick).toBe(2652)
      const receipt = expectedCohort(state, 2652)
      expect(receipt.personIds.length, 'this distinct current route must actually append people').toBeGreaterThan(0)
      expect(receipt.talentCountBefore).toBeGreaterThanOrEqual(f.previous.talent.length)
      expect(state.talent.slice(receipt.talentCountBefore).map(row => row.id)).toEqual(receipt.personIds)
      const expectedIds: string[] = []
      for (const role of ['actor', 'director', 'writer', 'craft'] as const) {
        for (let n = 0; n < receipt.requested[role]; n++) {
          const id = `person-cohort-2652-${role}-${n}`
          expect(state.talent.slice(0, receipt.talentCountBefore).some(row => row.id === id)).toBe(false)
          expect(previousIds.has(id)).toBe(false)
          expect(person(state, id).role).toBe(role)
          expectedIds.push(id)
        }
      }
      expect(receipt.personIds).toEqual(expectedIds)
      for (const before of [f.before, f.previous]) {
        expect(state.talent.slice(0, before.talent.length).map(row => row.id)).toEqual(before.talent.map(row => row.id))
        expect(state.careerLifecycle.professionAnchors.slice(0, before.careerLifecycle.professionAnchors.length))
          .toEqual(before.careerLifecycle.professionAnchors)
        expect(state.talentProvenance.rows.slice(0, before.talentProvenance.rows.length)).toEqual(before.talentProvenance.rows)
        expect(state.careerLifecycle.cohorts.slice(0, before.careerLifecycle.cohorts.length)).toEqual(before.careerLifecycle.cohorts)
        assert.ok(before.hollywood && state.hollywood)
        expect(state.hollywood.receipts.slice(0, before.hollywood.receipts.length)).toEqual(before.hollywood.receipts)
      }
      expect(state.careerLifecycle.records.slice(0, f.before.careerLifecycle.records.length)).toEqual(f.before.careerLifecycle.records)
      expect(state.careerLifecycle.professionAnchors).toHaveLength(state.talent.length)
      expect(state.talentProvenance.rows).toHaveLength(state.talent.length)
      expect(new Set(state.talent.map(row => row.id)).size).toBe(state.talent.length)
      expect(new Set(state.careerLifecycle.professionAnchors.map(row => row.personId)).size).toBe(state.talent.length)
      expect(new Set(state.talentProvenance.rows.map(row => row.personId)).size).toBe(state.talent.length)
      const cohortIds = new Set(receipt.personIds), newPeople = state.talent.filter(row => !originalIds.has(row.id))
      let otherEntrants = 0, finalWeekStaff = 0
      for (const talent of newPeople) {
        const anchors = state.careerLifecycle.professionAnchors.filter(row => row.personId === talent.id)
        const provenance = state.talentProvenance.rows.filter(row => row.personId === talent.id)
        expect(anchors).toHaveLength(1); expect(provenance).toHaveLength(1)
        const row = provenance[0]!
        assert.ok(row.kind === 'authored_exact_week')
        expect(anchors[0]).toEqual({ personId: talent.id, profession: talent.role, kind: 'entrant', recordedWeek: row.entryWeek })
        if (cohortIds.has(talent.id)) {
          expect(row.entryWeek).toBe(2652)
          expect(previousIds.has(talent.id)).toBe(false)
        } else {
          otherEntrants++
          expect(row.entryWeek).toBeGreaterThanOrEqual(2600)
          expect(row.entryWeek).toBeLessThanOrEqual(2651)
          if (!previousIds.has(talent.id)) { expect(row.entryWeek).toBe(2651); finalWeekStaff++ }
          assert.ok(state.hollywood)
          const hires = state.hollywood.receipts.filter(receipt => receipt.kind === 'employment'
            && receipt.talentId === talent.id && receipt.week === row.entryWeek)
          expect(hires).toHaveLength(1)
          const hire = hires[0]!
          assert.ok(hire.kind === 'employment')
          expect(['entry', 'replacement']).toContain(hire.reason)
          expect(hire.fromStudioId).toBeNull()
          const employment = state.hollywood.employment.filter(contract => contract.contractId === hire.contractId)
          expect(employment).toHaveLength(1)
          expect(employment[0]!.terms).toMatchObject({ talentId: talent.id, startWeek: row.entryWeek })
          expect(employment[0]!.studioId).toBe(hire.toStudioId)
        }
      }
      expect(newPeople).toHaveLength(receipt.personIds.length + otherEntrants)
      expect(receipt.talentCountBefore - f.previous.talent.length).toBe(finalWeekStaff)
      recordBoundary('deepDeficit2652', { inputPeople: f.before.talent.length, previousPeople: f.previous.talent.length,
        talentCountBefore: receipt.talentCountBefore, cohortEntrants: receipt.personIds.length,
        otherEntrants, finalWeekStaff, finalPeople: state.talent.length })
      acceptBoundary(state)
    }
    expect(save.exportSave(save.makeSave(f.loaded))).toBe(save.exportSave(save.makeSave(f.state)))
  })
})
