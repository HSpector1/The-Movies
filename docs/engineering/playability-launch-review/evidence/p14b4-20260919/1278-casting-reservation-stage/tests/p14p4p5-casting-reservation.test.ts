// 1278-A/B: three public actions, four pure P5 quotes, no engine advances.
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
const ACTOR = 'authored-0005', WRITER = 'authored-0003', TIMEOUT = 60_000
const ACTORS = [ACTOR, 'authored-0000', 'authored-0001'] as const
const SLATE: CastingSlate = { lead: [ACTOR, 'authored-0000'], antagonist: ['authored-0000', 'authored-0001'],
  support: ['authored-0001', ACTOR] }
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1278-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { advanceAttempts: 0, advanceInvoked: 0, advanceCompleted: 0,
  actionAttempts: 0, actionsAccepted: 0, quoteAttempts: 0, quotesReturned: 0 }
const operations: { action: Action; accepted: boolean }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let restoreTick: (() => void) | undefined
let initial: GameState | undefined
beforeAll(() => {
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    count.advanceAttempts++; throw new Error('1278: hard zero engine advances; no route is authorized')
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 0, hardActions: 3, hardQuotes: 4,
    capturePrefixAdvances: 0, oldTestsOrHelpersImported: false, operations,
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
  expect(save.saveVersion).toBe(40); expect(saves.validateSaveV40(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw); expect(stable(state)).toBe(before)
}
function retained(state: GameState): void {
  assert.ok(initial); admitted(state)
  expect(state.market.tick).toBe(45); expect(state.market).toEqual(initial.market)
  expect(state.firstTakes).toEqual(initial.firstTakes); expect(state.firstTakes).toHaveLength(19)
  expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
  expect(state.contracts).toEqual(initial.contracts); expect(state.hollywood!.employment).toEqual(initial.hollywood!.employment)
  expect(state.promises).toEqual([]); expect(state.talentMarket.proposals).toEqual([]); expect(state.productionQueue).toEqual([])
  expect(state.studio.cash).toBe(24701506); expect(state.ledger).toEqual(initial.ledger)
  expect(state.rngState).toEqual(initial.rngState); expect(state.operations).toEqual(initial.operations)
  expect(state.scriptDevelopment.projects.slice(0, 2)).toEqual(initial.scriptDevelopment.projects)
  expect(state.studio.activeProductions).toEqual([]); expect(state.operations.workflows).toEqual([])
}
function person(state: GameState, id: string, atWeek = 45) {
  const talent = state.talent.find(row => row.id === id); assert.ok(talent)
  const requested = id === WRITER ? 'writer' : 'actor'
  const age = id === WRITER ? 40 : id === ACTOR ? 30 : 68
  expect(talent).toMatchObject({ role: requested, age })
  const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
  expect(provenance).toEqual({ personId: id, kind: 'authored_exact_week', ageAtEntry: age, entryWeek: 0 })
  expect(core.ageAt(provenance, state.market.tick)).toBe(age)
  const profile = requested === 'actor' ? talent.skills.acting : talent.skills.writing; assert.ok(profile)
  for (const value of Object.values(profile)) expect(value).toEqual({ actual: 75, perceived: 75 })
  expect(core.retirementRecordFor(state, id)).toBeUndefined()
  expect(core.retirementRecordFor(state, id, requested)).toBeUndefined()
  expect(core.assignmentRefusal(state, id, atWeek, requested)).toBeNull()
  const contract = activeContract(state, id); assert.ok(contract)
  const money = id === ACTOR ? [370212, 66638] : id === WRITER ? [351932, 63348]
    : id === 'authored-0000' ? [332099, 59778] : [314062, 56531]
  expect(contract).toEqual({ talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208,
    annualSalary: money[0], signingBonus: money[1] })
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === id
    && row.terms.startWeek <= state.market.tick && row.terms.endWeekExclusive > state.market.tick
    && (row.endedWeek === null || row.endedWeek > state.market.tick))
  expect(employment).toHaveLength(1); expect(employment[0]!.studioId).toBe(issuer(state))
  expect(employment[0]!.terms).toEqual(contract)
  return { talent, provenance, contract, employment, currentRecord: core.retirementRecordFor(state, id) ?? null,
    requestedRecord: core.retirementRecordFor(state, id, requested) ?? null, requested, admissionQueryWeek: atWeek,
    actualWeek: state.market.tick }
}
function engagements(state: GameState, id: string) {
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  const productionRows = owners.flatMap(owner => owner.productions.map(row => ({ studioId: owner.studioId, production: row,
    companyMember: row.directorId === id || Object.values(row.cast).includes(id) || row.craftIds.includes(id),
    writerCredit: row.writerId === id })))
  const writingRows = owners.flatMap(owner => owner.development.projects.map(row => ({ studioId: owner.studioId, project: row,
    activeAssignment: (row.status === 'drafting' || row.status === 'rewriting') && row.writerIds.includes(id) })))
  const researchRows = state.technology.projects.map(row => ({ project: row, activeAssignment: row.status === 'active'
    && row.seats.some(seat => seat.talentId === id && seat.releasedWeek === null) }))
  return { productionRows, writingRows, researchRows,
    company: productionRows.filter(row => row.companyMember), writing: writingRows.filter(row => row.activeAssignment),
    research: researchRows.filter(row => row.activeAssignment),
    auditions: state.castingSessions.sessions.filter(row => Object.values(row.slate).some(pair => pair.includes(id))) }
}
function idle(state: GameState, id: string): void {
  const facts = engagements(state, id)
  expect(facts.company).toEqual([]); expect(facts.writing).toEqual([]); expect(facts.research).toEqual([])
  expect(busyTalentIds(state).has(id)).toBe(false)
}
function project(state: GameState, id: string): ScriptProject {
  const rows = state.scriptDevelopment.projects.filter(row => row.id === id)
  expect(rows).toHaveLength(1); return rows[0]!
}
function session(state: GameState) {
  expect(state.castingSessions.mode).toBe('managed'); expect(state.castingSessions.sessions).toHaveLength(1)
  const row = state.castingSessions.sessions[0]!
  expect(row).toEqual({ id: 'casting-0000', projectId: 'script-0000', status: 'auditioning', slate: SLATE,
    startedWeek: 45, dueWeek: 46, results: null,
    reservation: { sessionId: 'casting-0000', facilityId: 'facility-development-casting', capability: 'development-casting', slot: 0 } })
  return row
}
function resources(state: GameState) {
  expect(state.placement.facilities).toEqual([]); expect(state.construction.projects).toEqual([])
  expect(state.technology.projects).toEqual([]); expect(state.operations.workflows).toEqual([])
  for (const set of state.sets) expect(['retired', 'standing']).toContain(set.status)
  const screenplay = state.scriptDevelopment.projects.flatMap(row => row.reservation === null ? [] : [{ owner: 'screenplay',
    ownerId: row.id, kind: 'facility', facilityId: row.reservation.facilityId, capability: row.reservation.capability,
    slot: row.reservation.slot }])
  const casting = state.castingSessions.sessions.flatMap(row => row.reservation === null ? [] : [{ owner: 'castingSession',
    ownerId: row.id, kind: 'facility', facilityId: row.reservation.facilityId, capability: row.reservation.capability,
    slot: row.reservation.slot }])
  const mounts = state.sets.filter(row => row.status !== 'retired').map(row => ({ owner: 'set', ownerId: row.id, kind: 'mount',
    facilityId: row.mountedOn, capability: null, slot: null }))
  const expected = [...screenplay, ...casting, ...mounts]
  const claims = resourceClaimsOf(occupiedResourceSlots(state))
  expect(claims.map(row => ({ owner: row.owner, ownerId: row.ownerId, kind: row.kind, facilityId: row.facilityId,
    capability: row.capability, slot: row.slot }))).toEqual(expected)
  const facilities = state.operations.facilities.filter(row => row.capability === 'development-casting')
  expect(facilities).toEqual([{ id: 'facility-development-casting', name: 'Development & Casting', capability: 'development-casting', capacity: 2 }])
  const development = [...screenplay, ...casting]
  for (const row of development) expect(row.facilityId).toBe(facilities[0]!.id)
  const freeDev = [0, 1].filter(slot => !development.some(row => row.slot === slot))
  const others = (['soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    available: state.operations.facilities.filter(row => row.capability === capability).flatMap(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot })).filter(candidate =>
        !claims.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId
          && (row.slot === null || row.slot === candidate.slot)))) }))
  for (const row of others) expect(row.available.length).toBeGreaterThan(0)
  return { claims: clone(claims), expected, development, screenplay, casting, freeDev, others,
    ownerRoots: { operations: state.operations, placement: state.placement, construction: state.construction,
      technology: state.technology, scriptDevelopment: state.scriptDevelopment, castingSessions: state.castingSessions, sets: state.sets } }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifestBytes = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifestBytes.length).toBe(11550); expect(sha(manifestBytes)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const manifest = JSON.parse(manifestBytes.toString('utf8'))
    expect(manifest).toMatchObject({ kind: 'genuine-current39-p3-market-week45', status: 'COMPLETE',
      actualExecutionHead: '272401eb36dc49563d306de39503e306b6c9dc2d' })
    const zipped = readFileSync(new URL('1171-p3-current45-capture/genuine-v39-p3-market-week45.json.gz', E))
    expect(zipped.length).toBe(86995); expect(sha(zipped)).toBe('12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117')
    const raw = gunzipSync(zipped).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(751294); expect(sha(raw)).toBe('e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af')
    expect(manifest.output).toEqual({ filename: 'genuine-v39-p3-market-week45.json.gz', saveVersion: 39, week: 45,
      raw: { bytes: Buffer.byteLength(raw), sha256: sha(raw) }, gzip: { bytes: zipped.length, sha256: sha(zipped) } })
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), prior = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(prior)
    expect(state).toEqual({ ...old.state, firstTakeSubjects: { version: 1, cutoverOrdinal: 19, facts: [] } })
    initial = clone(state); retained(state)
    expect(issuer(state)).toBe('studio-de11f27b-player')
    expect(state.operations.mode).toBe('managed'); expect(state.scriptDevelopment.mode).toBe('managed')
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(state.founding).toBeNull(); expect(state.economyEngagedEver).toBe(true)
    expect(state.scriptDevelopment.projects).toHaveLength(2)
    for (const [id, conceptId, genre, strength] of [
      ['script-0000', 'c-00', 'drama', 60.24468148832871], ['script-0001', 'c-01', 'crime', 56.87065310220528],
    ] as const) {
      expect(project(state, id)).toMatchObject({ conceptId, writerId: WRITER, writerIds: [WRITER], status: 'ready',
        dueWeek: null, reservation: null, productionId: null, assessment: { actualStrength: strength, perceivedStrength: strength } })
      expect(state.concepts.find(row => row.id === conceptId)?.genre).toBe(genre)
    }
    expect(state.concepts.find(row => row.id === 'c-02')?.genre).toBe('comedy')
    expect(state.scriptDevelopment.projects.some(row => row.conceptId === 'c-02')).toBe(false)
    for (const id of [...ACTORS, WRITER]) { person(state, id); person(state, id, 46); idle(state, id) }
    const resourceFacts = resources(state); expect(resourceFacts.freeDev).toEqual([0, 1])
    emit('INPUT', { capture: manifest, rawBytes: Buffer.byteLength(raw), rawSha256: sha(raw), week: state.market.tick,
      persons: [...ACTORS, WRITER].map(id => ({ person: person(state, id), engagement: engagements(state, id) })),
      contracts: state.contracts, firstTakes: state.firstTakes, firstTakeSubjects: state.firstTakeSubjects,
      resourceFacts, promiseRoots: state.promises, proposals: state.talentMarket.proposals })
    return state
  })
}
function act(state: GameState, action: Action, ordinal: number, verify: (next: GameState) => void): GameState {
  assert.equal(count.actionAttempts, ordinal); assert.ok(count.actionAttempts < 3)
  const before = bytes(state), request = stable(action), row = { action: clone(action), accepted: false }
  count.actionAttempts++; operations.push(row); emit('ACTION-ATTEMPT', row)
  const next = core.applyActions(clone(state), [clone(action)])
  expect(bytes(state)).toBe(before); expect(stable(action)).toBe(request); retained(next)
  expect(next.productionQueue).toEqual(state.productionQueue); verify(next)
  count.actionsAccepted++; row.accepted = true
  emit('ACTION-ACCEPTED', { ...row, week: next.market.tick, casting: next.castingSessions, development: next.scriptDevelopment,
    screenplayAuthority: next.originalScreenplays, resourceFacts: resources(next), stateBytes: Buffer.byteLength(bytes(next)), stateSha256: sha(bytes(next)) })
  return next
}
function activated45(): GameState {
  return memo('activated45', () => {
    const state = input45()
    return act(state, { kind: 'activateCastingSessions' }, 0, next => {
      expect(next.castingSessions).toEqual({ mode: 'managed', sessions: [] })
      expect({ ...next, castingSessions: state.castingSessions }).toEqual(state)
    })
  })
}
function auditioning45(): GameState {
  return memo('auditioning45', () => {
    const state = activated45(), target = project(state, 'script-0000')
    for (const pair of Object.values(SLATE)) expect(new Set(pair).size).toBe(2)
    expect([...new Set(Object.values(SLATE).flat())].sort()).toEqual([...ACTORS].sort())
    for (const id of ACTORS) { person(state, id); idle(state, id); expect(target.writerId).not.toBe(id) }
    return act(state, { kind: 'startCastingSession', session: { projectId: target.id, slate: clone(SLATE) } }, 1, next => {
      session(next); expect({ ...next, castingSessions: state.castingSessions }).toEqual(state)
      expect(resources(next).freeDev).toEqual([1]); for (const id of ACTORS) idle(next, id)
    })
  })
}
function draft(state: GameState, ownCasting: boolean): PromiseDraft {
  return { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId: ACTOR,
    predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: ownCasting ? 'script-0000' : 'script-0001' },
    startWeek: 0, termWeeks: 208, windowStartWeek: 45, dueWeekExclusive: ownCasting ? 59 : 58 }
}
function quote(state: GameState, query: PromiseDraft, ownCasting: boolean, congested: boolean) {
  retained(state); const audition = session(state), resourceFacts = resources(state)
  assert.ok('kind' in query.predicate && query.predicate.kind === 'projectOpportunity')
  const target = project(state, query.predicate.scriptProjectId)
  expect(target.status).toBe('ready'); expect(target.writerId).not.toBe(ACTOR); expect(target.reservation).toBeNull()
  const matchesSession = audition.projectId === target.id
  expect(matchesSession).toBe(ownCasting)
  const due = audition.dueWeek; assert.ok(due !== null)
  const freshWeek = matchesSession ? Math.max(state.market.tick, due) : state.market.tick
  const takeWeek = freshWeek + 5
  expect(freshWeek).toBe(ownCasting ? 46 : 45); expect(takeWeek).toBe(ownCasting ? 51 : 50)
  expect(query.dueWeekExclusive - takeWeek).toBe(8)
  person(state, ACTOR, freshWeek); idle(state, ACTOR)
  const exempted = resourceFacts.development.filter(row => row.owner === 'castingSession' && row.ownerId === audition.id
    && matchesSession && due <= freshWeek)
  const held = resourceFacts.development.filter(row => !exempted.includes(row))
  expect(exempted.map(row => [row.ownerId, row.slot])).toEqual(ownCasting ? [['casting-0000', 0]] : [])
  expect(held.map(row => [row.ownerId, row.slot])).toEqual(congested
    ? ownCasting ? [['script-0002', 1]] : [['script-0002', 1], ['casting-0000', 0]]
    : ownCasting ? [] : [['casting-0000', 0]])
  const usable = [0, 1].filter(slot => !held.some(row => row.slot === slot))
  expect(resourceFacts.freeDev).toEqual(congested ? [] : [1])
  expect(usable).toEqual(congested ? ownCasting ? [0] : [] : ownCasting ? [0, 1] : [1])
  const attached = new Set(state.talentMarket.proposals.flatMap(row => row.promises))
  const from = Math.max(state.market.tick, query.windowStartWeek)
  const membership = state.promises.map(row => ({ row, open: row.outcome === null, owes: row.progress < row.predicate.count,
    active: row.contractId !== null || attached.has(row.promiseId), self: row.promiseId === query.promiseId,
    overlap: row.dueWeekExclusive > from && row.windowStartWeek < query.dueWeekExclusive,
    issuerOrPerson: row.issuerStudioId === query.issuerStudioId || row.beneficiaryPersonId === query.beneficiaryPersonId }))
  const selected = membership.filter(row => row.open && row.owes && row.active && !row.self && row.overlap && row.issuerOrPerson).map(row => row.row)
  expect(selected).toEqual([]); expect(membership).toEqual([]); expect([...attached]).toEqual([])
  const before = bytes(state), request = stable(query), rng = clone(state.rngState)
  assert.ok(count.quoteAttempts < 4); count.quoteAttempts++
  const receipt = core.promiseFeasibility(state, query, 45); count.quotesReturned++
  emit('QUOTE', { ordinal: count.quoteAttempts, actualWeek: state.market.tick, ownCasting, congested, query, receipt,
    person: person(state, ACTOR, freshWeek), engagements: [...ACTORS, WRITER].map(id => ({ id, facts: engagements(state, id) })),
    target, audition, freshWeek, takeWeek, slack: query.dueWeekExclusive - takeWeek, resourceFacts, exempted, held, usable,
    union: { from, rawRoots: state.promises, proposals: state.talentMarket.proposals, membership, selected },
    inputBytes: Buffer.byteLength(before), inputSha256: sha(before), requestBytes: request, rng })
  expect(bytes(state)).toBe(before); expect(stable(query)).toBe(request); expect(state.rngState).toEqual(rng)
  expect(receipt).toMatchObject({ rulesVersion: 7, week: 45 })
  return receipt
}
function baselines45(): GameState {
  return memo('baselineQuotes45', () => {
    const state = auditioning45()
    for (const own of [false, true]) expect(quote(state, draft(state, own), own, false))
      .toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    expect(count.quotesReturned).toBe(2); return state
  })
}
function congested45(): GameState {
  return memo('congested45', () => {
    const state = baselines45(); person(state, WRITER); idle(state, WRITER)
    const action: Action = { kind: 'commissionScript', project: { conceptId: 'c-02', writerId: WRITER,
      shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
      promise: { genre: 'comedy', intendedSegments: ['adult'], ranges: {
        intimacy: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5] } } } }
    return act(state, action, 2, next => {
      expect({ ...next, scriptDevelopment: state.scriptDevelopment, originalScreenplays: state.originalScreenplays }).toEqual(state)
      expect(next.scriptDevelopment.projects).toHaveLength(3)
      expect(project(next, 'script-0002')).toMatchObject({ conceptId: 'c-02', writerId: WRITER, writerIds: [WRITER],
        status: 'drafting', commissionedWeek: 45, dueWeek: 46, assessment: null, productionId: null, rewriteCount: 0,
        reservation: { projectId: 'script-0002', facilityId: 'facility-development-casting', capability: 'development-casting', slot: 1 } })
      expect(session(next)).toEqual(session(state)); expect(resources(next).freeDev).toEqual([])
      const work = engagements(next, WRITER)
      expect(work.company).toEqual([]); expect(work.research).toEqual([]); expect(work.writing).toHaveLength(1)
      expect(work.writing[0]).toMatchObject({ studioId: issuer(next), project: { id: 'script-0002', dueWeek: 46 } })
      expect(busyTalentIds(next).has(WRITER)).toBe(true)
      for (const id of ACTORS) idle(next, id)
    })
  })
}

describe('P4/P5 actual casting reservation under development congestion', () => {
  it('Q20 exempts only the target audition reservation at its committed due boundary', () => {
    const before = baselines45(), otherQuery = draft(before, false), ownQuery = draft(before, true)
    const originalQueries = [stable(otherQuery), stable(ownQuery)], earlier = resources(before)
    const after = congested45()
    expect(project(after, 'script-0002').dueWeek).toBe(session(after).dueWeek)
    expect(resources(after).others).toEqual(earlier.others)
    expect([stable(draft(after, false)), stable(draft(after, true))]).toEqual(originalQueries)
    const other = quote(after, otherQuery, false, true)
    expect(other).toMatchObject({ classification: 'FRAGILE',
      bottleneck: 'existing development-casting capacity is not available for this opportunity' })
    const own = quote(after, ownQuery, true, true)
    expect(own).toMatchObject({ classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
    expect([stable(otherQuery), stable(ownQuery)]).toEqual(originalQueries)
    retained(after); expect(count.actionAttempts).toBe(3); expect(count.actionsAccepted).toBe(3)
    expect(count.quoteAttempts).toBe(4); expect(count.quotesReturned).toBe(4)
    expect(count.advanceAttempts).toBe(0); expect(count.advanceInvoked).toBe(0); expect(count.advanceCompleted).toBe(0)
    emit('COMPLETE', { actualWeek: after.market.tick, knownDueQueryWeek: 46, rawFreeDevelopmentSlots: resources(after).freeDev,
      auditionsStillPending: session(after), unrelatedDraftStillPending: project(after, 'script-0002'),
      firstTakeSubjects: after.firstTakeSubjects, retainedFirstTakeCount: after.firstTakes.length, counters: count })
  }, TIMEOUT)
})
