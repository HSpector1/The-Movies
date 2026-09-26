// Reviewed997-A / 1001-A: current and requested profession boundaries remain
// distinct facts. All historical controls are genuine; detached E changes below
// are explicitly pure-read discriminators, never admitted historical saves.
import assert from 'node:assert/strict'
import { describe, expect, it, vi } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import * as lifecycle from '../src/core/careerLifecycle.js'
import * as math from '../src/core/math.js'
import { advancePromisesWeek, promiseFeasibility } from '../src/core/promises.js'
import type { PromiseDraft } from '../src/core/promises.js'
import { migrateToLive, stableStringify } from '../src/core/save.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { c2bLiveFixture } from './helpers/p14c2b-fixtures.js'
import { advanceTo, c2cFixture, promiseById } from './helpers/p14c2c-fixtures.js'
import { historicalWriterPair } from './helpers/p14c2rm-fixtures.js'
import { FOCUS, chosen, clone, envelope38, migrated, obligationControls, person, saveApi } from './helpers/p14c3-fixtures.js'

type Family = 'P1' | 'P2'
function admitted(state: GameState): void {
  const saved = envelope38(state)
  expect(saveApi('validateSaveV38')(saved)).toBe(saved)
}
function youngActor(state: GameState): { state: GameState; id: string } {
  const next = applyActions(state, [{ kind: 'createTalent', talent: { name: '1001 actual young quote control',
    role: 'actor', age: 30, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, potentialTier: 'Steady', workEthic: 55 } }])
  expect(next.talent).toHaveLength(state.talent.length + 1)
  const id = next.talent.at(-1)!.id
  expect(lifecycle.retirementRecordFor(next, id)).toBeUndefined()
  admitted(next)
  return { state: next, id }
}
function draft(state: GameState, id: string, family: Family = 'P1', issuer = state.hollywood!.playerStudioId): PromiseDraft {
  // Proposed terms, not a claim that any employer could actually bind them.
  const week = state.market.tick
  return { family: family === 'P1' ? 'APPEARANCE_COUNT' : 'LEAD_OR_SIGNIFICANT_ROLE_COUNT',
    issuerStudioId: issuer, beneficiaryPersonId: id,
    predicate: family === 'P1' ? { count: 1 } : { kind: 'castRoleCount', count: 1, seatClass: 'lead' },
    startWeek: week, termWeeks: 52, windowStartWeek: week, dueWeekExclusive: week + 52 }
}
let originalCache: { state: GameState; id: string; young: string } | undefined
function originalWriter() {
  if (originalCache === undefined) {
    const old = historicalWriterPair(), loaded = migrateToLive(old.commissioned).state
    expect(loaded.market.tick).toBe(311)
    expect(person(loaded, old.writerId).role).toBe('writer')
    expect(person(loaded, old.writerId).skills.acting).toBeDefined()
    expect(lifecycle.retirementRecordFor(loaded, old.writerId)).toMatchObject({ profession: 'writer',
      status: 'announced', announcedWeek: 260, effectiveWeek: 312 })
    expect(lifecycle.retirementRecordFor(loaded, old.writerId, 'actor')).toBeUndefined()
    admitted(loaded)
    const control = youngActor(loaded)
    originalCache = { state: control.state, id: old.writerId, young: control.id }
  }
  return clone(originalCache)
}

/** Observe the exact primitive input that actually produced this public receipt.
 * Spy uses the real hash implementation and is always restored. No expected hash
 * is copied from output and no production digest helper is imported. */
function materialFor(state: GameState, quote: PromiseDraft) {
  const stateBefore = stableStringify(state), quoteBefore = stableStringify(quote)
  const spy = vi.spyOn(math, 'fnv1a64')
  try {
    const receipt = promiseFeasibility(state, quote, state.market.tick)
    const matches = spy.mock.calls.flatMap((args, index) => {
      const result = spy.mock.results[index]
      return result?.type === 'return' && result.value === receipt.inputsDigest ? [args[0]] : []
    })
    expect(matches, 'instrumentation premise: observe exactly the real call producing the public receipt').toHaveLength(1)
    const material: unknown = JSON.parse(matches[0]!)
    assert.ok(Array.isArray(material), 'receipt material is a positional array')
    expect(stableStringify(state)).toBe(stateBefore)
    expect(stableStringify(quote)).toBe(quoteBefore)
    return { receipt, material: material as unknown[] }
  } finally { spy.mockRestore() }
}
function boundaryTails(material: unknown[]): unknown[][] {
  return material.filter((item): item is unknown[] => Array.isArray(item)
    && (item[0] === 'retirement' || item[0] === 'requestedRetirement'))
}
function changedEffectiveWeek(state: GameState, id: string, profession: 'actor' | 'director'): GameState {
  // Deliberately invalid-history pure-read input. No makeSave/validator admission
  // is claimed for this detached question; the actual original is admitted first.
  expect(state.careerLifecycle.records.filter(row => row.personId === id && row.profession === profession)).toHaveLength(1)
  return { ...state, careerLifecycle: { ...state.careerLifecycle, records: state.careerLifecycle.records.map(row =>
    row.personId === id && row.profession === profession ? { ...row, effectiveWeek: row.effectiveWeek + 1 } : row) } }
}
let destinationCache: GameState | undefined
function actualDestinationAnnouncement(): GameState {
  if (destinationCache === undefined) {
    const old = obligationControls('production')
    assert.ok(old.laterProduction && old.laterProductionId)
    let state = applyActions(old.laterProduction, [{ kind: 'cancel', productionId: old.laterProductionId }])
    const actorRecord = clone(lifecycle.retirementRecordFor(state, FOCUS.director, 'actor'))
    assert.ok(actorRecord)
    expect(state.market.tick).toBe(208)
    expect(person(state, FOCUS.director)).toMatchObject({ role: 'director', age: 72 })
    expect(state.contracts.find(row => row.talentId === FOCUS.director)).toMatchObject({ startWeek: 208, endWeekExclusive: 260 })
    // 997-A correction: real employment208→260 prevents idle notice at260/312.
    // Reach the actual hard75 birthday at364, with no manual dates or extra loop.
    for (let count = 0; count < 156; count++) state = tick(state, { develop: true })
    expect(state.market.tick).toBe(364)
    expect(person(state, FOCUS.director)).toMatchObject({ role: 'director', age: 75 })
    const current = lifecycle.retirementRecordFor(state, FOCUS.director)
    assert.ok(current, 'bounded genuine premise: actual current-profession announcement at hard75')
    const week = state.market.tick, ends: number[] = []
    for (const contract of state.contracts) {
      if (contract.talentId === FOCUS.director && contract.startWeek <= week && week < contract.endWeekExclusive) ends.push(contract.endWeekExclusive)
    }
    for (const employment of state.hollywood!.employment) {
      const terms = employment.terms
      if (terms.talentId === FOCUS.director && terms.startWeek <= week && week < (employment.endedWeek ?? terms.endWeekExclusive)) ends.push(terms.endWeekExclusive)
    }
    expect(current).toMatchObject({ personId: FOCUS.director, profession: 'director', status: 'announced',
      cause: 'hardBoundary', announcedWeek: 364, ageAtAnnouncement: 75,
      effectiveWeek: Math.max(week + TUNING.RETIREMENT_NOTICE_WEEKS, ...ends) })
    expect(lifecycle.retirementRecordFor(state, FOCUS.director, 'actor')).toEqual(actorRecord)
    expect(state.careerLifecycle.professionChanges.filter(row => row.personId === FOCUS.director))
      .toEqual(old.laterProduction.careerLifecycle.professionChanges.filter(row => row.personId === FOCUS.director))
    admitted(state)
    destinationCache = state
  }
  return clone(destinationCache)
}
let rivalQuoteCache: { state: GameState; young: string; issuer: string } | undefined
function rivalQuote() {
  if (rivalQuoteCache === undefined) {
    const control = youngActor(chosen())
    const rival = control.state.hollywood!.identities.find(row => row.role === 'rival'
      && control.state.hollywood!.businesses.some(business => business.studioId === row.studioId))
    assert.ok(rival, 'actual rival studio with actual pipeline resources')
    rivalQuoteCache = { state: control.state, young: control.id, issuer: rival.studioId }
  }
  return clone(rivalQuoteCache)
}
function assertOutcomeDispatch(state: GameState, promiseId: string, beneficiary: string): void {
  admitted(state)
  const promise = promiseById(state, promiseId), before = stableStringify(state)
  expect(promise).toMatchObject({ outcome: null, progress: 0, beneficiaryPersonId: beneficiary })
  expect(promise.contractId).not.toBeNull()
  expect(promise.dueWeekExclusive).toBeGreaterThan(state.market.tick)
  const spy = vi.spyOn(lifecycle, 'assignmentRefusal')
  try {
    const after = advancePromisesWeek(state)
    const calls = spy.mock.calls.filter(([, id, week]) => id === beneficiary && week === state.market.tick)
    expect(calls.length, 'instrumentation premise: actual open-promise disposition calls the real admission owner').toBeGreaterThan(0)
    expect(promiseById(after, promiseId)).toEqual(promise)
    expect(stableStringify(after)).toBe(before)
    expect(stableStringify(state)).toBe(before)
    for (const call of calls) expect(call[3], 'acting-promise disposition must explicitly request the actor episode').toBe('actor')
  } finally { spy.mockRestore() }
}

describe('C.3 N01–N10 current global and requested actor boundaries', () => {
  it('N01 preserves original nonactor global admission despite having no actor record', () => {
    const { state, id } = originalWriter(), before = stableStringify(state)
    expect(lifecycle.retirementRecordFor(state, id, 'actor')).toBeUndefined()
    expect(lifecycle.assignmentRefusal(state, id, 311)).toMatch(/retirementAnnounced/)
    expect(lifecycle.assignmentRefusal(state, id, 311, 'actor')).toMatch(/retirementAnnounced/)
    expect(stableStringify(state)).toBe(before)
  })

  it.each(['P1', 'P2'] as const)('N02–03 original announced writer caps requested %s acting feasibility', family => {
    const { state, id, young } = originalWriter(), before = stableStringify(state)
    const control = promiseFeasibility(state, draft(state, young, family), 311)
    expect(control.classification, 'identical shaped311→363 quote for an unannounced actor must have a path').not.toBe('IMPOSSIBLE')
    const result = promiseFeasibility(state, draft(state, id, family), 311)
    expect(result).toMatchObject({ classification: 'IMPOSSIBLE', week: 311, rulesVersion: 4 })
    expect(result.bottleneck).toMatch(/retire/i)
    expect(stableStringify(state)).toBe(before)
  })

  it('N04 retains the legacy single-actor boundary tail and adds no tail for a genuine no-record subject', () => {
    const control = youngActor(migrated()), state = control.state
    expect(person(state, FOCUS.director).role).toBe('actor')
    const actual = materialFor(state, draft(state, FOCUS.director))
    expect(boundaryTails(actual.material)).toEqual([['retirement', 'announced', 208]])
    const noRecord = materialFor(state, draft(state, control.id))
    expect(boundaryTails(noRecord.material)).toEqual([])
    expect(noRecord.receipt.rulesVersion).toBe(4)
  })

  it('N05 binds the distinct retired-actor tail after a real director transition', () => {
    const state = chosen(), before = stableStringify(state), quote = draft(state, FOCUS.director)
    admitted(state)
    expect(lifecycle.retirementRecordFor(state, FOCUS.director)).toBeUndefined()
    const actual = materialFor(state, quote)
    expect(boundaryTails(actual.material)).toEqual([['requestedRetirement', 'actor', 'retired', 208]])
    const changed = materialFor(changedEffectiveWeek(state, FOCUS.director, 'actor'), quote)
    expect(changed.receipt.inputsDigest).not.toBe(actual.receipt.inputsDigest)
    expect(actual.receipt.classification).toBe('IMPOSSIBLE')
    expect(changed.receipt.classification).toBe('IMPOSSIBLE')
    expect(stableStringify(state)).toBe(before)
  })

  it('N06 binds both real profession boundaries after normal208→364 continuation', () => {
    const state = actualDestinationAnnouncement(), before = stableStringify(state)
    const current = lifecycle.retirementRecordFor(state, FOCUS.director)!
    const quote = draft(state, FOCUS.director), actual = materialFor(state, quote)
    expect(boundaryTails(actual.material)).toEqual([['retirement', 'announced', current.effectiveWeek],
      ['requestedRetirement', 'actor', 'retired', 208]])
    for (const profession of ['actor', 'director'] as const) {
      const changed = materialFor(changedEffectiveWeek(state, FOCUS.director, profession), quote)
      expect(changed.receipt.inputsDigest, `the ${profession} E is independently material`).not.toBe(actual.receipt.inputsDigest)
      expect(changed.receipt.classification).toBe('IMPOSSIBLE')
    }
    expect(actual.receipt.classification).toBe('IMPOSSIBLE')
    expect(stableStringify(state)).toBe(before)
  })

  it.each(['P1', 'P2'] as const)('N07–08 rival-issuer %s quote also refuses the genuinely closed acting episode', family => {
    const { state, issuer, young } = rivalQuote(), before = stableStringify(state)
    const control = promiseFeasibility(state, draft(state, young, family, issuer), 208)
    expect(control.classification, 'same real rival resources can quote a single young actor picture').not.toBe('IMPOSSIBLE')
    const result = promiseFeasibility(state, draft(state, FOCUS.director, family, issuer), 208)
    expect(result).toMatchObject({ classification: 'IMPOSSIBLE', rulesVersion: 4, week: 208 })
    expect(result.bottleneck).toMatch(/retire/i)
    expect(stableStringify(state)).toBe(before)
    // A quote with a real issuer is not proof of rival hiring or accepted seating.
  })

  it('N09 actual open player promise disposition explicitly requests actor at its real current week', () => {
    const f = c2cFixture()
    expect(f.lastAdmission.market.tick).toBe(147)
    assertOutcomeDispatch(f.lastAdmission, f.promiseId, f.actorId)
  })

  it('N10 actual open rival promise disposition explicitly requests actor before its genuine cutoff', () => {
    const id = 'person-cohort-208-actor-1', issuer = 'studio-25969b11-r01', promiseId = 'promise-148'
    const initial = c2bLiveFixture('genuine-v35-c2b-rival-incumbent-cohorts')
    expect(initial.market.tick).toBe(2600)
    expect(promiseById(initial, promiseId)).toMatchObject({ outcome: null, beneficiaryPersonId: id,
      issuerStudioId: issuer, windowStartWeek: 2496, dueWeekExclusive: 2704,
      contractId: 'studio-25969b11-r01:contract:person-cohort-208-actor-1:2496' })
    const state = advanceTo(initial, 2695) // existing qualified95-tick rival fixture route
    expect(state.market.tick).toBe(2695)
    expect(lifecycle.retirementRecordFor(state, id)).toMatchObject({ announcedWeek: 2566, effectiveWeek: 2704, status: 'announced' })
    expect(state.hollywood!.businesses.find(row => row.studioId === issuer)!.productions).toEqual([])
    assertOutcomeDispatch(state, promiseId, id)
  })
})
