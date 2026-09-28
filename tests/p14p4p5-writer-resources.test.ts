// 1260-A/F/B: two public commissions and nine pure quotes; no engine advances.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { PromiseDraft } from '../src/core/promises.js'
import type { Action, GameState, ScriptProject } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const WRITING_ACTOR = 'authored-0001', OTHER_WRITER = 'authored-0003', IDLE_ACTOR = 'authored-0005'
const TIMEOUT = 60_000
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1260-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { advanceAttempts: 0, advanceInvoked: 0, advanceCompleted: 0,
  actionAttempts: 0, actionsAccepted: 0, quotes: { Q13: 0, Q14: 0 } }
const operations: { action: Action; accepted: boolean; beforeCash: number; afterCash?: number }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let restoreTick: (() => void) | undefined
beforeAll(() => {
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    count.advanceAttempts++; throw new Error('1260: hard zero advance attempts; no route is authorized')
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 0, hardActions: 2, hardQuotes: { Q13: 5, Q14: 4 },
    capturePrefixAdvances: 0, oldTestHelpersImported: false, operations,
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok })) })
  expect(count.advanceAttempts).toBe(0); expect(count.advanceInvoked).toBe(0); expect(count.advanceCompleted).toBe(0)
})
function memo(name: string, build: () => GameState): GameState {
  const old = cache.get(name)
  if (old) { if (!old.ok) throw old.error; return clone(old.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(41); expect(saves.validateSaveV41(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw); expect(stable(state)).toBe(before)
}
function person(state: GameState, id: string, requested: 'actor' | 'writer', atWeek = 45) {
  const talent = state.talent.find(row => row.id === id); assert.ok(talent)
  const primary = id === OTHER_WRITER ? 'writer' : 'actor'
  expect(talent).toMatchObject({ role: primary, age: id === WRITING_ACTOR ? 68 : id === OTHER_WRITER ? 40 : 30 })
  const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
  expect(talent.age).toBe(core.ageAt(provenance, state.market.tick))
  const profile = requested === 'actor' ? talent.skills.acting : talent.skills.writing; assert.ok(profile)
  const value = id === WRITING_ACTOR && requested === 'writer' ? 80 : 75
  for (const observed of Object.values(profile)) expect(observed).toEqual({ actual: value, perceived: value })
  expect(core.retirementRecordFor(state, id)).toBeUndefined()
  expect(core.retirementRecordFor(state, id, requested)).toBeUndefined()
  expect(core.assignmentRefusal(state, id, atWeek, requested)).toBeNull()
  const contract = activeContract(state, id); assert.ok(contract)
  expect(contract).toMatchObject({ talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208 })
  const expectedMoney = id === WRITING_ACTOR ? { annualSalary: 314062, signingBonus: 56531 }
    : id === OTHER_WRITER ? { annualSalary: 351932, signingBonus: 63348 } : { annualSalary: 370212, signingBonus: 66638 }
  expect(contract).toMatchObject(expectedMoney)
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === id
    && row.terms.startWeek <= state.market.tick && row.terms.endWeekExclusive > state.market.tick
    && (row.endedWeek === null || row.endedWeek > state.market.tick))
  expect(employment).toHaveLength(1); expect(employment[0]!.studioId).toBe(issuer(state))
  expect(employment[0]!.terms).toEqual(contract)
  return { talent, provenance, contract, employment: employment[0], admissionQueryWeek: atWeek, requested }
}
function engagements(state: GameState, id: string) {
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  return {
    productions: owners.flatMap(owner => owner.productions.filter(row => row.directorId === id || Object.values(row.cast).includes(id)
      || row.craftIds.includes(id)).map(row => ({ studioId: owner.studioId, productionId: row.id, remainingTicks: row.remainingTicks }))),
    writing: owners.flatMap(owner => owner.development.projects.filter(row => (row.status === 'drafting' || row.status === 'rewriting')
      && row.writerIds.includes(id)).map(row => ({ studioId: owner.studioId, projectId: row.id, dueWeek: row.dueWeek, writerIds: clone(row.writerIds) }))),
    research: state.technology.projects.filter(row => row.status === 'active'
      && row.seats.some(seat => seat.talentId === id && seat.releasedWeek === null)).map(row => row.id),
  }
}
function idle(state: GameState, id: string): void {
  expect(engagements(state, id)).toEqual({ productions: [], writing: [], research: [] })
  expect(busyTalentIds(state).has(id)).toBe(false)
}
function project(state: GameState, id: string): ScriptProject {
  const rows = state.scriptDevelopment.projects.filter(row => row.id === id)
  expect(rows).toHaveLength(1); return rows[0]!
}
function resources(state: GameState) {
  const claims = resourceClaimsOf(occupiedResourceSlots({ operations: state.operations, placement: state.placement,
    technology: state.technology, construction: state.construction, scriptDevelopment: state.scriptDevelopment,
    castingSessions: state.castingSessions, sets: state.sets }))
  const dev = state.operations.facilities.filter(row => row.capability === 'development-casting')
  expect(dev).toHaveLength(1); expect(dev[0]).toMatchObject({ id: 'facility-development-casting', capacity: 2 })
  const screenplay = state.scriptDevelopment.projects.flatMap(row => row.reservation === null ? []
    : [{ owner: 'screenplay', ownerId: row.id, kind: 'facility', facilityId: row.reservation.facilityId,
      capability: row.reservation.capability, slot: row.reservation.slot }])
  const actualDev = claims.filter(row => row.kind === 'facility' && row.facilityId === dev[0]!.id)
    .map(row => ({ owner: row.owner, ownerId: row.ownerId, kind: row.kind, facilityId: row.facilityId, capability: row.capability, slot: row.slot }))
  expect(actualDev).toEqual(screenplay)
  const freeDev = Array.from({ length: 2 }, (_, slot) => slot).filter(slot => !screenplay.some(row => row.slot === slot))
  const others = (['soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    available: state.operations.facilities.filter(row => row.capability === capability).flatMap(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot })).filter(candidate =>
        !claims.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId
          && (row.slot === null || row.slot === candidate.slot)))) }))
  for (const row of others) expect(row.available.length).toBeGreaterThan(0)
  return { claims: clone(claims), screenplay, actualDev, freeDev, others }
}
function census(state: GameState, draft: PromiseDraft) {
  const attached = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
  const from = Math.max(state.market.tick, draft.windowStartWeek)
  const selected = state.promises.filter(row => row.outcome === null && row.progress < row.predicate.count
    && (row.contractId !== null || attached.has(row.promiseId)) && row.promiseId !== draft.promiseId
    && row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive
    && (row.issuerStudioId === draft.issuerStudioId || row.beneficiaryPersonId === draft.beneficiaryPersonId))
  expect(selected).toEqual([]); return { from, rawRoots: clone(state.promises), attachedIds: [...attached], selected: clone(selected) }
}
function draft(state: GameState, beneficiaryPersonId: string, scriptProjectId: string, dueWeekExclusive: number): PromiseDraft {
  return { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId,
    predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId },
    startWeek: 0, termWeeks: 208, windowStartWeek: 45, dueWeekExclusive }
}
function quote(state: GameState, query: PromiseDraft, leaf: 'Q13' | 'Q14', label: string, facts: unknown) {
  const limit = leaf === 'Q13' ? 5 : 4; assert.ok(count.quotes[leaf] < limit)
  const before = bytes(state), requested = stable(query), rng = clone(state.rngState), union = census(state, query)
  count.quotes[leaf]++
  const receipt = core.promiseFeasibility(state, query, 45)
  emit('QUOTE', { leaf, label, actualWeek: state.market.tick, request: query, receipt, union, facts,
    inputBytes: Buffer.byteLength(before), inputSha256: sha(before) })
  expect(bytes(state)).toBe(before); expect(stable(query)).toBe(requested); expect(state.rngState).toEqual(rng)
  expect(receipt).toMatchObject({ rulesVersion: 7, week: 45 }); return receipt
}
function expectRA(receipt: ReturnType<typeof quote>): void {
  expect(receipt).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifest = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifest.length).toBe(11550)
    expect(sha(manifest)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const zipped = readFileSync(new URL('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz', E))
    expect(zipped.length).toBe(86995)
    expect(sha(zipped)).toBe('12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117')
    const raw = gunzipSync(zipped).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(751294)
    expect(sha(raw)).toBe('e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), prior = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(prior); admitted(state)
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24701506)
    expect(state.promises).toEqual([]); expect(state.firstTakes).toHaveLength(19)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
    expect(state.studio.activeProductions).toEqual([]); expect(state.productionQueue).toEqual([])
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] }); expect(state.technology.projects).toEqual([])
    expect(state.scriptDevelopment.mode).toBe('managed')
    expect(state.scriptDevelopment.projects).toHaveLength(2)
    for (const [id, conceptId, genre] of [['script-0000', 'c-00', 'drama'], ['script-0001', 'c-01', 'crime']] as const) {
      const row = project(state, id)
      expect(row).toMatchObject({ conceptId, writerId: OTHER_WRITER, writerIds: [OTHER_WRITER], status: 'ready', dueWeek: null,
        productionId: null, reservation: null }); expect(row.assessment).not.toBeNull()
      expect(state.concepts.find(c => c.id === conceptId)?.genre).toBe(genre)
    }
    for (const [conceptId, genre] of [['c-02', 'comedy'], ['c-03', 'romance']] as const) {
      expect(state.concepts.find(c => c.id === conceptId)?.genre).toBe(genre)
      expect(state.scriptDevelopment.projects.some(row => row.conceptId === conceptId)).toBe(false)
    }
    person(state, WRITING_ACTOR, 'actor'); person(state, WRITING_ACTOR, 'writer')
    person(state, OTHER_WRITER, 'writer'); person(state, IDLE_ACTOR, 'actor')
    for (const id of [WRITING_ACTOR, OTHER_WRITER, IDLE_ACTOR]) idle(state, id)
    expect(resources(state).freeDev).toEqual([0, 1])
    emit('INPUT', { week: 45, ready: state.scriptDevelopment.projects, cash: state.studio.cash, resourceFacts: resources(state) })
    return state
  })
}
function commission(state: GameState, second: boolean): GameState {
  const writerId = second ? OTHER_WRITER : WRITING_ACTOR, conceptId = second ? 'c-03' : 'c-02'
  const id = second ? 'script-0003' : 'script-0002'
  person(state, writerId, 'writer'); idle(state, writerId)
  expect(resources(state).freeDev).toEqual(second ? [1] : [0, 1])
  const action: Action = { kind: 'commissionScript', project: { conceptId, writerId,
    shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: second ? 'romance' : 'comedy', intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5] } } } }
  assert.equal(count.actionAttempts, second ? 1 : 0, 'fixed shared first commission then one second commission')
  const before = bytes(state), originalAction = clone(action)
  const operation: typeof operations[number] = { action: clone(action), accepted: false, beforeCash: state.studio.cash }
  count.actionAttempts++; operations.push(operation); emit('ACTION-ATTEMPT', operation)
  const next = core.applyActions(clone(state), [clone(action)])
  admitted(next); expect(bytes(state)).toBe(before); expect(action).toEqual(originalAction)
  expect(next.market.tick).toBe(45); expect(next.productionQueue).toEqual(state.productionQueue)
  expect(next.scriptDevelopment.projects.slice(0, state.scriptDevelopment.projects.length)).toEqual(state.scriptDevelopment.projects)
  expect(next.scriptDevelopment.projects).toHaveLength(state.scriptDevelopment.projects.length + 1)
  const added = project(next, id)
  expect(added).toMatchObject({ conceptId, writerId, writerIds: [writerId], status: 'drafting', commissionedWeek: 45, dueWeek: 46,
    assessment: null, productionId: null, rewriteCount: 0,
    reservation: { projectId: id, facilityId: 'facility-development-casting', capability: 'development-casting', slot: second ? 1 : 0 } })
  expect(next.firstTakes).toEqual(state.firstTakes); expect(next.firstTakeSubjects).toEqual(state.firstTakeSubjects)
  expect(next.promises).toEqual([]); expect(next.contracts).toEqual(state.contracts)
  expect(next.studio.cash).toBe(state.studio.cash); expect(next.ledger).toEqual(state.ledger)
  count.actionsAccepted++; operation.accepted = true; operation.afterCash = next.studio.cash
  emit('ACTION-ACCEPTED', { ...operation, project: added, resources: resources(next) }); return next
}
function firstCommission(): GameState { return memo('firstCommission45', () => commission(input45(), false)) }
function secondCommission(): GameState { return memo('secondCommission45', () => commission(firstCommission(), true)) }

describe('P4/P5 actual writing availability and development reservations', () => {
  it('Q13 separates finite active-writing delay from permanent same-picture writer credit', () => {
    const initial = input45(), baselineTarget = clone(project(initial, 'script-0000'))
    const beneficiary = person(initial, WRITING_ACTOR, 'actor'); idle(initial, WRITING_ACTOR)
    expect(baselineTarget.writerId).toBe(OTHER_WRITER); expect(baselineTarget.writerId).not.toBe(WRITING_ACTOR)
    const beforeResources = resources(initial); expect(beforeResources.freeDev).toEqual([0, 1])
    const baseline = draft(initial, WRITING_ACTOR, baselineTarget.id, 58)
    const beforeReceipt = quote(initial, baseline, 'Q13', 'idle Ready target, fresh45/take50/slack8', {
      contract: beneficiary.contract, employmentId: beneficiary.employment!.contractId, writerCredit: baselineTarget.writerId,
      engagements: engagements(initial, WRITING_ACTOR), freshWeek: 45, earliestTakeWeek: 50, resources: beforeResources })
    expectRA(beforeReceipt)

    const writing = firstCommission(), assignment = project(writing, 'script-0002')
    expect(project(writing, baselineTarget.id)).toEqual(baselineTarget)
    expect(writing.talent.find(row => row.id === WRITING_ACTOR)?.role).toBe('actor')
    const active = engagements(writing, WRITING_ACTOR)
    expect(active).toEqual({ productions: [], research: [], writing: [{ studioId: issuer(writing), projectId: assignment.id,
      dueWeek: 46, writerIds: [WRITING_ACTOR] }] })
    expect(busyTalentIds(writing).has(WRITING_ACTOR)).toBe(true)
    person(writing, WRITING_ACTOR, 'actor'); person(writing, WRITING_ACTOR, 'writer')
    const due = assignment.dueWeek; assert.ok(due !== null)
    const fresh = Math.max(writing.market.tick, due), take = fresh + 5
    expect(fresh).toBe(46); expect(take).toBe(51)
    person(writing, WRITING_ACTOR, 'actor', fresh) // Pure admission query; actual state remains45.
    const afterResources = resources(writing)
    expect(afterResources.freeDev).toEqual([1]); expect(afterResources.others).toEqual(beforeResources.others)
    const commonFacts = { actualWeek: 45, assignment, engagements: active, target: baselineTarget,
      freshWeek: fresh, earliestTakeWeek: take, resources: afterResources }
    for (const control of [
      { due: take, classification: 'IMPOSSIBLE', bottleneck: 'no filming week inside the window can reach this opportunity' },
      { due: take + 7, classification: 'FRAGILE', bottleneck: 'the due week leaves too little slack before filming would start' },
      { due: take + 8, classification: 'REASONABLY_ACHIEVABLE', bottleneck: null },
    ] as const) {
      const query = draft(writing, WRITING_ACTOR, baselineTarget.id, control.due)
      if (control.due === 58) expect(stable(query)).toBe(stable(baseline))
      const receipt = quote(writing, query, 'Q13', `writing due46 / exclusive${control.due}`, commonFacts)
      expect(receipt).toMatchObject({ classification: control.classification, bottleneck: control.bottleneck })
    }
    const own = draft(writing, WRITING_ACTOR, assignment.id, 112)
    expect(assignment.writerId).toBe(own.beneficiaryPersonId)
    expect(own.dueWeekExclusive).toBeGreaterThan(take + 8)
    const collision = quote(writing, own, 'Q13', 'actual target writer cannot be same-picture cast', commonFacts)
    expect(collision).toMatchObject({ classification: 'IMPOSSIBLE',
      bottleneck: 'the credited writer cannot hold a cast seat in the same picture' })
    expect(count.quotes.Q13).toBe(5)
    expect(writing.market.tick).toBe(45); expect(writing.promises).toEqual([])
  }, TIMEOUT)

  it('Q14 retains unrelated development holds and exempts only the target screenplay reservation', () => {
    const one = firstCommission(), targetReady = clone(project(one, 'script-0000')), targetDraft = clone(project(one, 'script-0002'))
    const beneficiary = person(one, IDLE_ACTOR, 'actor'); idle(one, IDLE_ACTOR)
    expect(targetReady.writerId).not.toBe(IDLE_ACTOR); expect(targetDraft.writerId).not.toBe(IDLE_ACTOR)
    const beforeResources = resources(one)
    expect(beforeResources.freeDev).toEqual([1])
    expect(beforeResources.screenplay.map(row => [row.ownerId, row.slot])).toEqual([['script-0002', 0]])
    const readyQuery = draft(one, IDLE_ACTOR, targetReady.id, 112)
    const draftingQuery = draft(one, IDLE_ACTOR, targetDraft.id, 112)
    const readyBytes = stable(readyQuery), draftingBytes = stable(draftingQuery)
    const readyFresh = one.market.tick, draftingDue = targetDraft.dueWeek; assert.ok(draftingDue !== null)
    const draftingFresh = Math.max(one.market.tick, draftingDue)
    expect(readyFresh).toBe(45); expect(draftingFresh).toBe(46)
    person(one, IDLE_ACTOR, 'actor', draftingFresh)
    const beforeFacts = { actualWeek: 45, contract: beneficiary.contract, engagements: engagements(one, IDLE_ACTOR),
      targetReady, targetDraft, readyFresh, readyTake: readyFresh + 5, draftingFresh, draftingTake: draftingFresh + 5,
      resources: beforeResources }
    expectRA(quote(one, readyQuery, 'Q14', 'Ready with one raw free slot', beforeFacts))
    expectRA(quote(one, draftingQuery, 'Q14', 'drafting with one raw free slot', beforeFacts))

    const two = secondCommission(), other = project(two, 'script-0003')
    person(two, IDLE_ACTOR, 'actor'); idle(two, IDLE_ACTOR)
    expect(project(two, targetReady.id)).toEqual(targetReady); expect(project(two, targetDraft.id)).toEqual(targetDraft)
    expect(other.writerId).toBe(OTHER_WRITER); expect(other.dueWeek).toBe(46)
    const afterResources = resources(two)
    expect(afterResources.freeDev).toEqual([])
    expect(afterResources.screenplay.map(row => [row.ownerId, row.facilityId, row.slot])).toEqual([
      ['script-0002', 'facility-development-casting', 0], ['script-0003', 'facility-development-casting', 1],
    ])
    expect(afterResources.others).toEqual(beforeResources.others)
    expect(afterResources.claims.filter(row => row.capability !== 'development-casting'))
      .toEqual(beforeResources.claims.filter(row => row.capability !== 'development-casting'))
    assert.ok(targetDraft.reservation)
    expect(targetDraft.reservation.projectId).toBe(targetDraft.id)
    expect(draftingDue).toBeLessThanOrEqual(draftingFresh)
    // Independent path-specific membership: only the actual target's due claim is removed.
    const retained = afterResources.screenplay.filter(row => !(row.ownerId === targetDraft.id
      && targetDraft.dueWeek !== null && targetDraft.dueWeek <= draftingFresh))
    expect(retained.map(row => [row.ownerId, row.slot])).toEqual([['script-0003', 1]])
    const usableAtTargetDue = [0, 1].filter(slot => !retained.some(row => row.slot === slot))
    expect(usableAtTargetDue).toEqual([0])
    expect(targetReady.reservation).toBeNull(); expect(targetReady.dueWeek).toBeNull()
    expect(stable(readyQuery)).toBe(readyBytes); expect(stable(draftingQuery)).toBe(draftingBytes)
    const afterFacts = { actualWeek: 45, engagements: engagements(two, IDLE_ACTOR), targetReady, targetDraft, other,
      readyFresh, readyTake: readyFresh + 5, draftingFresh, draftingTake: draftingFresh + 5,
      resources: afterResources, retainedForTarget: retained, usableAtTargetDue }
    const congested = quote(two, readyQuery, 'Q14', 'Ready retains both unrelated development holds', afterFacts)
    expect(congested).toMatchObject({ classification: 'FRAGILE',
      bottleneck: 'existing development-casting capacity is not available for this opportunity' })
    expectRA(quote(two, draftingQuery, 'Q14', 'own due reservation exempt, other screenplay remains held', afterFacts))
    expect(stable(readyQuery)).toBe(readyBytes); expect(stable(draftingQuery)).toBe(draftingBytes)
    expect(count.quotes.Q14).toBe(4); expect(count.actionAttempts).toBe(2); expect(count.actionsAccepted).toBe(2)
    expect(two.market.tick).toBe(45); expect(two.promises).toEqual([])
  }, TIMEOUT)
})
