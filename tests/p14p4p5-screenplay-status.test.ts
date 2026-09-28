// 1254-A/F/G: one independent status route; no original Q05/Q06 helper import.
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
import type { Action, CastingSlate, GameState, ScriptProject } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const ACTOR = 'authored-0005', WRITER = 'authored-0003', PROJECT = 'script-0002'
const HARD_ADVANCES = 3, TIMEOUT = 60_000
const clone = <T>(x: T): T => structuredClone(x)
const sha = (x: string | Uint8Array): string => createHash('sha256').update(x).digest('hex')
const stable = saves.stableStringify
const issuer = (s: GameState): string => { assert.ok(s.hollywood); return s.hollywood.playerStudioId }
const bytes = (s: GameState): string => saves.exportSave(saves.makeSave(s))
const emit = (kind: string, value: unknown): void => console.info(`1254-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0,
  actionAttempts: 0, actionAccepted: 0, baselineQuotes: 0, statusQuotes: 0, downgradeAttempts: 0 }
const operations: { week: number; action: Action; accepted: boolean }[] = []
const phaseCache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let permit: { from: number; used: boolean } | undefined
let restoreTick: (() => void) | undefined
let oldReceipts: GameState['firstTakes'] = []
const tickTrace: unknown[] = []

beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1254: tick outside the sole Q11 owner') }
    assert.equal(permit.used, false, 'one authorization cannot cover two tick calls')
    permit.used = true
    assert.ok(count.attempted <= HARD_ADVANCES && count.reserved < HARD_ADVANCES, 'hard3 before invocation')
    assert.equal(state.market.tick, permit.from)
    assert.equal(permit.from, 45 + count.reserved, 'only fixed45→46→47→48 chronology')
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(state.market.tick + 1)
    count.completed++
    return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: HARD_ADVANCES, oldQ05Q06Imported: false,
    capturePrefixAdvances: 0, phases: [...phaseCache].map(([name, row]) => ({ name, complete: row.ok })), operations, tickTrace })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(HARD_ADVANCES)
})
function memo(name: string, build: () => GameState): GameState {
  const prior = phaseCache.get(name)
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const state = build(); phaseCache.set(name, { ok: true, value: state }); return clone(state) }
  catch (error) { phaseCache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(41); expect(saves.validateSaveV41(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw)
  expect(stable(state)).toBe(before)
}
function person(state: GameState, id: string, role: 'actor' | 'writer', initial = false) {
  const talent = state.talent.find(t => t.id === id); assert.ok(talent)
  expect(talent.role).toBe(role)
  const skill = role === 'actor' ? talent.skills.acting : talent.skills.writing; assert.ok(skill)
  if (initial) for (const value of Object.values(skill)) expect(value.actual).toBe(75)
  const provenance = state.talentProvenance.rows.find(r => r.personId === id); assert.ok(provenance)
  expect(talent.age).toBe(core.ageAt(provenance, state.market.tick))
  expect(talent.age).toBe(id === WRITER ? 40 : id === ACTOR ? 30 : 68)
  expect(core.retirementRecordFor(state, id)).toBeUndefined()
  expect(core.retirementRecordFor(state, id, role)).toBeUndefined()
  const contract = activeContract(state, id); assert.ok(contract)
  expect(contract).toMatchObject({ talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208 })
  if (id === WRITER) expect(contract).toMatchObject({ annualSalary: 351932, signingBonus: 63348 })
  if (id === ACTOR) expect(contract).toMatchObject({ annualSalary: 370212, signingBonus: 66638 })
  const employment = state.hollywood!.employment.filter(e => e.studioId === issuer(state)
    && e.terms.talentId === id && e.endedWeek === null && e.terms.startWeek <= state.market.tick
    && e.terms.endWeekExclusive > state.market.tick)
  expect(employment).toHaveLength(1); expect(employment[0]!.terms).toEqual(contract)
  return { talent, contract, employmentId: employment[0]!.contractId, provenance }
}
function owners(state: GameState) {
  return [{ studioId: issuer(state), productions: state.studio.activeProductions,
    development: state.scriptDevelopment, concepts: state.concepts },
  ...state.hollywood!.businesses.map(b => ({ studioId: b.studioId, productions: b.productions,
    development: b.development, concepts: state.hollywood!.concepts }))]
}
function engagements(state: GameState, id: string) {
  const company = owners(state).flatMap(o => o.productions.filter(p => p.directorId === id
    || Object.values(p.cast).includes(id) || p.craftIds.includes(id))
    .map(p => ({ studioId: o.studioId, productionId: p.id, remainingTicks: p.remainingTicks })))
  const writing = owners(state).flatMap(o => o.development.projects.filter(p =>
    (p.status === 'drafting' || p.status === 'rewriting') && p.writerIds.includes(id))
    .map(p => ({ studioId: o.studioId, projectId: p.id, dueWeek: p.dueWeek })))
  const research = state.technology.projects.filter(p => p.status === 'active'
    && p.seats.some(seat => seat.talentId === id && seat.releasedWeek === null)).map(p => p.id)
  return { company, writing, research }
}
function idle(state: GameState, id: string): void {
  expect(engagements(state, id)).toEqual({ company: [], writing: [], research: [] })
  expect(busyTalentIds(state).has(id)).toBe(false)
}
function capacity(state: GameState) {
  const claims = resourceClaimsOf(occupiedResourceSlots({ operations: state.operations, placement: state.placement,
    technology: state.technology, construction: state.construction, scriptDevelopment: state.scriptDevelopment,
    castingSessions: state.castingSessions, sets: state.sets }))
  const available = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    slots: state.operations.facilities.filter(f => f.capability === capability).flatMap(f =>
      Array.from({ length: f.capacity }, (_, slot) => ({ facilityId: f.id, slot })).filter(candidate =>
        !claims.some(c => c.kind === 'facility' && c.facilityId === candidate.facilityId
          && (c.slot === null || c.slot === candidate.slot)))) }))
  for (const row of available) expect(row.slots.length, `actual available ${row.capability}`).toBeGreaterThan(0)
  return { claims, available }
}
function union(state: GameState, request: PromiseDraft) {
  const attached = new Set(state.talentMarket.proposals.flatMap(p => p.promises))
  const from = Math.max(state.market.tick, request.windowStartWeek)
  return state.promises.filter(p => p.outcome === null && p.progress < p.predicate.count
    && (p.contractId !== null || attached.has(p.promiseId)) && p.promiseId !== request.promiseId
    && p.dueWeekExclusive > from && p.windowStartWeek < request.dueWeekExclusive
    && (p.issuerStudioId === request.issuerStudioId || p.beneficiaryPersonId === request.beneficiaryPersonId))
}
function pureQuote(state: GameState, request: PromiseDraft, baseline = false) {
  const before = bytes(state), requested = stable(request), rng = clone(state.rngState)
  if (baseline) { assert.ok(count.baselineQuotes < 3); count.baselineQuotes++ }
  else { assert.ok(count.statusQuotes < 24); count.statusQuotes++ }
  const receipt = core.promiseFeasibility(state, request, state.market.tick)
  expect(bytes(state)).toBe(before); expect(stable(request)).toBe(requested); expect(state.rngState).toEqual(rng)
  return receipt
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
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), before = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(before); admitted(state)
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24701506)
    expect(state.promises).toEqual([]); expect(state.firstTakes).toHaveLength(19)
    oldReceipts = clone(state.firstTakes)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
    expect(state.studio.activeProductions).toEqual([]); expect(state.productionQueue).toEqual([])
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(state.operations.mode).toBe('managed'); expect(state.scriptDevelopment.mode).toBe('managed')
    expect(state.scriptDevelopment.projects.map(p => [p.id, p.conceptId, p.status, p.productionId]))
      .toEqual([['script-0000', 'c-00', 'ready', null], ['script-0001', 'c-01', 'ready', null]])
    for (const p of state.scriptDevelopment.projects) expect(p.assessment).not.toBeNull()
    expect(state.concepts.find(c => c.id === 'c-02')?.genre).toBe('comedy')
    expect(state.scriptDevelopment.projects.some(p => p.conceptId === 'c-02')).toBe(false)
    person(state, WRITER, 'writer', true); person(state, ACTOR, 'actor', true)
    idle(state, WRITER); idle(state, ACTOR); capacity(state)
    const common = { family: 'PREFERRED_GENRE_OPPORTUNITY' as const, issuerStudioId: issuer(state),
      beneficiaryPersonId: 'authored-0006', startWeek: 52, termWeeks: 104, windowStartWeek: 52, dueWeekExclusive: 112,
      predicate: { kind: 'genreOpportunity' as const, count: 1 as const, seatClass: 'allCast' as const, genre: 'drama' as const } }
    const requests: PromiseDraft[] = [
      { ...common, family: 'APPEARANCE_COUNT', predicate: { count: 1 } },
      { ...common, family: 'LEAD_OR_SIGNIFICANT_ROLE_COUNT', predicate: { kind: 'castRoleCount', count: 1, seatClass: 'lead' } },
      { ...common, family: 'DIRECTING_COUNT', predicate: { kind: 'directorCount', count: 1 } },
    ]
    const controls = requests.map(request => ({ request, receipt: pureQuote(state, request, true) }))
    const line = '1227-P4P5-LEGACY46 ' + JSON.stringify({ controls, rngState: state.rngState })
    console.info(line)
    const prior = readFileSync(new URL('1230-legacy46-baseline.txt', E), 'utf8')
    expect(Buffer.byteLength(prior)).toBe(1226)
    expect(sha(prior)).toBe('36921548246e8ec4cc2241353cf62fa1e9868cc037a62e2a8a1a0bf26cc35342')
    expect(line + '\n').toBe(prior)
    return state
  })
}
function act(state: GameState, action: Action): GameState {
  const before = bytes(state), source = clone(state), snapshot = clone(action)
  assert.ok(count.actionAttempts < 7, 'fixed seven public actions only')
  count.actionAttempts++; const row = { week: state.market.tick, action: snapshot, accepted: false }; operations.push(row)
  emit('ACTION-ATTEMPT', row)
  const next = core.applyActions(source, [clone(action)])
  admitted(next); expect(bytes(state)).toBe(before); expect(action).toEqual(snapshot)
  expect(next.market.tick).toBe(state.market.tick)
  expect(next.productionQueue).toEqual(state.productionQueue)
  count.actionAccepted++; row.accepted = true
  return next
}
function project(state: GameState): ScriptProject {
  const found = state.scriptDevelopment.projects.find(p => p.id === PROJECT); assert.ok(found)
  expect(found).toMatchObject({ conceptId: 'c-02', writerId: WRITER, writerIds: [WRITER], commissionedWeek: 45, productionId: null })
  return found
}
function takeOwners(state: GameState) {
  return owners(state).flatMap(o => o.productions.map(p => ({ studioId: o.studioId, productionId: p.id,
    conceptId: p.conceptId, genre: o.concepts.find(c => c.id === p.conceptId)?.genre,
    projects: o.development.projects.filter(s => s.productionId === p.id).map(s => ({ id: s.id, conceptId: s.conceptId })),
    cast: clone(p.cast), directorId: p.directorId, remainingTicks: p.remainingTicks })))
}
function advance(state: GameState): GameState {
  assert.equal(permit, undefined)
  const before = bytes(state), source = clone(state), prior = clone(state.firstTakes), priorOwners = takeOwners(state)
  permit = { from: state.market.tick, used: false }
  let next: GameState
  try { next = tickOwner.tick(source, { develop: true }) } finally { permit = undefined }
  expect(bytes(state)).toBe(before); admitted(next)
  expect(next.firstTakes.slice(0, prior.length)).toEqual(prior)
  const afterOwners = takeOwners(next)
  const added = next.firstTakes.slice(prior.length).map(receipt => {
    const owner = priorOwners.find(o => o.studioId === receipt.studioId && o.productionId === receipt.productionId)
      ?? afterOwners.find(o => o.studioId === receipt.studioId && o.productionId === receipt.productionId)
    assert.ok(owner); assert.ok(owner.genre); expect(owner.projects).toHaveLength(1)
    expect(owner.projects[0]!.conceptId).toBe(owner.conceptId)
    expect(receipt.cast).toEqual(owner.cast); expect(receipt.directorId).toBe(owner.directorId)
    expect(receipt.week).toBe(next.market.tick)
    const expected = { eventId: receipt.eventId, conceptId: owner.conceptId, genre: owner.genre, scriptProjectId: owner.projects[0]!.id }
    expect(next.firstTakeSubjects.facts.find(f => f.eventId === receipt.eventId)).toEqual(expected)
    return { receipt, owner, expected }
  })
  const r04 = next.hollywood!.businesses.find(b => b.studioId === 'studio-de11f27b-r04'); assert.ok(r04)
  const production = r04.productions.find(p => p.id === 'studio-de11f27b-r04:film:4')
  const workflow = r04.operations.workflows.find(w => w.productionId === production?.id)
  const trace = { from: state.market.tick, to: next.market.tick, added, r04: { production, workflow } }
  tickTrace.push(trace); emit('ADVANCE', trace)
  return next
}
function statusQuotes(state: GameState, name: string, availableWeek: number, takeWeek: number): void {
  admitted(state)
  const target = project(state), actor = person(state, ACTOR, 'actor')
  expect(target.writerId).not.toBe(ACTOR); idle(state, ACTOR)
  const session = state.castingSessions.sessions.find(s => s.projectId === PROJECT)
  let screenplayAvailable = state.market.tick
  if (target.status === 'drafting' || target.status === 'rewriting') {
    assert.ok(target.dueWeek !== null && target.reservation !== null)
    screenplayAvailable = Math.max(screenplayAvailable, target.dueWeek)
    expect(target.reservation.projectId).toBe(PROJECT)
  } else { expect(['review', 'ready']).toContain(target.status); expect(target.assessment).not.toBeNull() }
  let castingAvailable = state.market.tick
  if (session?.status === 'auditioning') {
    assert.ok(session.dueWeek !== null && session.reservation !== null)
    castingAvailable = Math.max(castingAvailable, session.dueWeek)
    expect(session.reservation.sessionId).toBe(session.id)
  }
  const fresh = Math.max(state.market.tick, screenplayAvailable, castingAvailable, actor.contract.startWeek)
  expect(fresh).toBe(availableWeek); expect(Math.max(45, fresh + 5)).toBe(takeWeek)
  expect(core.assignmentRefusal(state, ACTOR, fresh, 'actor')).toBeNull()
  const resources = capacity(state)
  for (const [due, classification, bottleneck] of [
    [takeWeek, 'IMPOSSIBLE', 'no filming week inside the window can reach this opportunity'],
    [takeWeek + 7, 'FRAGILE', 'the due week leaves too little slack before filming would start'],
    [takeWeek + 8, 'REASONABLY_ACHIEVABLE', null],
  ] as const) {
    const request: PromiseDraft = { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId: ACTOR,
      startWeek: actor.contract.startWeek, termWeeks: actor.contract.termWeeks, windowStartWeek: 45, dueWeekExclusive: due,
      predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: PROJECT } }
    const selected = union(state, request)
    emit('STATUS-PREMISE', { name, actualWeek: state.market.tick, target, session, actor: {
      id: ACTOR, age: actor.talent.age, contract: actor.contract, employmentId: actor.employmentId },
      engagements: engagements(state, ACTOR), resources, selected, fresh, takeWeek, request })
    expect(selected).toEqual([])
    const receipt = pureQuote(state, request)
    emit('STATUS-QUOTE', { name, actualWeek: state.market.tick, fresh, takeWeek, request, receipt, counters: count })
    expect(receipt).toMatchObject({ classification, bottleneck, rulesVersion: 7, week: state.market.tick })
  }
}
const slate: CastingSlate = { lead: [ACTOR, 'authored-0000'], antagonist: ['authored-0000', 'authored-0001'],
  support: [ACTOR, 'authored-0001'] }
function casting(state: GameState, status: 'auditioning' | 'review' | 'complete') {
  expect(state.castingSessions.mode).toBe('managed'); expect(state.castingSessions.sessions).toHaveLength(1)
  const session = state.castingSessions.sessions[0]!
  expect(session).toMatchObject({ id: 'casting-0000', projectId: PROJECT, startedWeek: 47, status, slate })
  if (status === 'auditioning') {
    expect(session.dueWeek).toBe(48); expect(session.reservation).not.toBeNull(); expect(session.results).toBeNull()
  } else {
    expect(session.dueWeek).toBeNull(); expect(session.reservation).toBeNull(); assert.ok(session.results)
    for (const slot of ['lead', 'antagonist', 'support'] as const) {
      expect(session.results[slot].map(r => r.talentId)).toEqual(slate[slot])
      for (const result of session.results[slot]) {
        expect(Number.isFinite(result.estimate)).toBe(true)
        expect(result.low).toBeLessThanOrEqual(result.estimate); expect(result.high).toBeGreaterThanOrEqual(result.estimate)
      }
    }
  }
  return session
}
function factOnly(state: GameState): void {
  admitted(state); expect(state.market.tick).toBe(48)
  const before = bytes(state), rng = clone(state.rngState), save = saves.makeSave(state)
  const tags = state.promises.filter(p => 'kind' in p.predicate
    && (p.predicate.kind === 'genreOpportunity' || p.predicate.kind === 'projectOpportunity'))
  emit('FACT-ONLY-PREMISE', { actualWeek: 48, predicates: state.promises.map(p => ({ promiseId: p.promiseId, predicate: p.predicate })),
    materialTags: tags, subjectRoot: state.firstTakeSubjects, receiptSuffix: state.firstTakes.slice(19) })
  expect(tags).toEqual([]); expect(state.firstTakeSubjects.version).toBe(1)
  expect(state.firstTakeSubjects.cutoverOrdinal).toBe(19)
  expect(state.firstTakes.slice(0, 19)).toEqual(oldReceipts)
  expect(state.firstTakeSubjects.facts.length).toBeGreaterThan(0)
  const suffix = state.firstTakes.slice(19)
  expect(state.firstTakeSubjects.facts.map(f => f.eventId)).toEqual(suffix.map(t => t.eventId))
  const currentOwners = takeOwners(state)
  for (const receipt of suffix) {
    const owner = currentOwners.find(o => o.studioId === receipt.studioId && o.productionId === receipt.productionId); assert.ok(owner)
    expect(owner.projects).toHaveLength(1); assert.ok(owner.genre)
    expect(owner.projects[0]!.conceptId).toBe(owner.conceptId)
    expect(receipt.cast).toEqual(owner.cast); expect(receipt.directorId).toBe(owner.directorId)
    expect(state.firstTakeSubjects.facts.find(f => f.eventId === receipt.eventId)).toEqual({ eventId: receipt.eventId,
      conceptId: owner.conceptId, genre: owner.genre, scriptProjectId: owner.projects[0]!.id })
  }
  expect(suffix.some(t => t.studioId === 'studio-de11f27b-r04' && t.productionId === 'studio-de11f27b-r04:film:4' && t.week === 48)).toBe(true)
  assert.equal(count.downgradeAttempts, 0); count.downgradeAttempts++
  let error: unknown
  try { saves.convertV40ToV39(saves.convertV41ToV40(save)) } catch (caught) { error = caught }
  const message = error instanceof Error ? error.message : String(error)
  emit('FACT-ONLY-REFUSAL', { actualWeek: 48, message, facts: state.firstTakeSubjects.facts })
  expect(error).toBeInstanceOf(Error)
  expect(message).toBe('migrateToV39: cannot downgrade or discard an opportunity predicate or recorded first-take subject')
  expect(saves.exportSave(save)).toBe(before); expect(bytes(state)).toBe(before); expect(state.rngState).toEqual(rng)
}

describe('P4/P5 screenplay and casting status clocks', () => {
  it('Q11 uses actual writing and audition boundaries and retains fact-only take authority', () => {
    const initial = input45()
    const drafting = memo('drafting45', () => {
      person(initial, WRITER, 'writer'); idle(initial, WRITER)
      expect(core.assignmentRefusal(initial, WRITER, 45, 'writer')).toBeNull()
      const next = act(initial, { kind: 'commissionScript', project: { conceptId: 'c-02', writerId: WRITER,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: 'comedy', intendedSegments: ['adult'], ranges: {
          intimacy: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5] } } } })
      expect(next.scriptDevelopment.projects.slice(0, 2)).toEqual(initial.scriptDevelopment.projects)
      expect(next.scriptDevelopment.projects).toHaveLength(3)
      expect(project(next)).toMatchObject({ status: 'drafting', dueWeek: 46, assessment: null, rewriteCount: 0 })
      expect(project(next).reservation).not.toBeNull(); return next
    })
    statusQuotes(drafting, 'Drafting45', 46, 51)
    const review46 = memo('review46', () => {
      const next = advance(drafting)
      expect(project(next)).toMatchObject({ status: 'review', dueWeek: null, reservation: null, rewriteCount: 0 })
      expect(project(next).assessment).not.toBeNull(); return next
    })
    statusQuotes(review46, 'Review46', 46, 51)
    const ready46 = memo('detachedReady46', () => {
      const next = act(review46, { kind: 'acceptScript', projectId: PROJECT })
      expect(project(next)).toEqual({ ...project(review46), status: 'ready' }); return next
    })
    statusQuotes(ready46, 'Ready46', 46, 51)
    expect(project(review46).status).toBe('review')
    const rewriting = memo('rewriting46', () => {
      person(review46, WRITER, 'writer'); idle(review46, WRITER)
      expect(core.assignmentRefusal(review46, WRITER, 46, 'writer')).toBeNull()
      const next = act(review46, { kind: 'requestScriptRewrite', projectId: PROJECT })
      expect(project(next)).toMatchObject({ status: 'rewriting', dueWeek: 47, rewriteCount: 1, assessment: project(review46).assessment })
      expect(project(next).reservation).not.toBeNull(); return next
    })
    statusQuotes(rewriting, 'Rewriting46', 47, 52)
    const review47 = memo('review47', () => {
      const next = advance(rewriting)
      expect(project(next)).toMatchObject({ status: 'review', dueWeek: null, reservation: null, rewriteCount: 1 })
      expect(project(next).assessment).not.toBeNull(); return next
    })
    const ready47 = memo('ready47', () => {
      const next = act(review47, { kind: 'acceptScript', projectId: PROJECT })
      expect(project(next)).toEqual({ ...project(review47), status: 'ready' }); return next
    })
    statusQuotes(ready47, 'Ready47', 47, 52)
    const activated = memo('managedCasting47', () => {
      expect(ready47.founding).toBeNull(); expect(core.economyEngaged(ready47)).toBe(true)
      expect(ready47.castingSessions).toEqual({ mode: 'legacy', sessions: [] }); capacity(ready47)
      const next = act(ready47, { kind: 'activateCastingSessions' })
      expect(next.castingSessions).toEqual({ mode: 'managed', sessions: [] }); return next
    })
    const auditioning = memo('auditioning47', () => {
      for (const id of [ACTOR, 'authored-0000', 'authored-0001']) {
        person(activated, id, 'actor'); idle(activated, id); expect(id).not.toBe(WRITER)
        expect(core.assignmentRefusal(activated, id, 48, 'actor')).toBeNull()
      }
      const next = act(activated, { kind: 'startCastingSession', session: { projectId: PROJECT, slate: clone(slate) } })
      casting(next, 'auditioning'); expect(project(next)).toEqual(project(activated)); return next
    })
    statusQuotes(auditioning, 'Auditioning47', 48, 53)
    const review48 = memo('castingReview48', () => {
      const next = advance(auditioning); casting(next, 'review')
      expect(project(next).status).toBe('ready'); return next
    })
    statusQuotes(review48, 'CastingReview48', 48, 53)
    const complete48 = memo('castingComplete48', () => {
      const next = act(review48, { kind: 'acknowledgeCastingSession', sessionId: 'casting-0000' })
      expect(casting(next, 'complete')).toEqual({ ...casting(review48, 'review'), status: 'complete' })
      expect(project(next)).toEqual(project(review48)); return next
    })
    statusQuotes(complete48, 'CastingComplete48', 48, 53)
    factOnly(review48)
    expect(count).toEqual({ attempted: 3, reserved: 3, invoked: 3, completed: 3, outside: 0,
      actionAttempts: 7, actionAccepted: 7, baselineQuotes: 3, statusQuotes: 24, downgradeAttempts: 1 })
  }, TIMEOUT)
})
