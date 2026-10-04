// 1290-A/B/F: four fixed public set actions, two identical pure P5 quotes, zero advances.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import * as opportunityOwner from '../src/core/opportunityPromises.js'
import { activeContract, busyTalentIds, canAfford } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { PromiseDraft } from '../src/core/promises.js'
import type { Action, GameState, ScriptProject, StudioSet } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const ACTOR = 'authored-0005', WRITER = 'authored-0003', TIMEOUT = 60_000
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
// 1309-X2 ruling 1: convertV40ToV41 (src/core/save.ts:10479) adds a zero
// `termination` movement to every rival finance period; the OLD state never
// carried it, so the expected migrated state must build it the same way,
// never a literal.
// 1309-X3 ruling 4: generic over the state it receives -- GameStateV38/V39
// (and any other era's state sharing this shape) hit exactOptionalPropertyTypes
// when forced through the plain GameState parameter/return type.
type WithRivalBusinesses = { hollywood: { businesses: readonly { account: { periods: readonly { movements: Record<string, number> }[] } }[] } | null }
function withRivalTermination<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period) => ({
      ...period, movements: { ...period.movements, termination: 0 } })) },
  })) } }
}
// 1320-A S5: Save42 gives every relationship edge a `sharedCompetitions` counter
// (convertV41ToV42); a genuine V41-or-older old.state never carried it.
type WithRelationships = { relationships: readonly { sharedCompetitions?: number }[] }
function withSharedCompetitions<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, sharedCompetitions: 0 })) }
}
// 1358-N S5: Save44 gives every relationship edge an empty `competitions` log and a null `romance`
// (convertV43ToV44, save.ts:10776-10781); a genuine V43-or-older old.state never carried them.
function withEmptyCompetitionsAndRomance<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, competitions: [], romance: null })) }
}
// 1344-N S5: Save43 gives every rival business the empty `screenplayShelving` root
// (convertV42ToV43, save.ts:10678-10686); a genuine V42-or-older old.state never carried it.
type WithScreenplayShelving = { hollywood: { businesses: readonly { screenplayShelving?: unknown }[] } | null }
function withEmptyScreenplayShelving<T extends WithScreenplayShelving>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// 1361-N S5: Save45 (convertV44ToV45, save.ts:10980-10984) adds the four P15 roots, empty, at the
// save's own week and back-fills nothing; a genuine V44-or-older old.state never carried them. The
// literals are this file's own expectation: production's initialP15Roots never defines it
// (1361-F7 ruling 3).
function withEmptyP15Roots<T extends object>(state: T, week: number): T {
  return { ...state,
    powerRanking: { version: 1, recordedFromWeek: week, snapshots: [] },
    p15Sequence: { version: 1, next: 1 },
    sharedMarket: { version: 1, recordedFromWeek: week, assessments: [] },
    campaignLegacy: { version: 1, recordedFromWeek: week, official: null, endOfRun: null } }
}
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const emit = (kind: string, value: unknown): void => console.info(`1290-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { advanceAttempts: 0, advanceInvoked: 0, advanceCompleted: 0,
  actionAttempts: 0, actionsAccepted: 0, quoteAttempts: 0, quotesReturned: 0, selectorCalls: 0 }
const operations: { action: Action; accepted: boolean }[] = []
const quotes: { request: PromiseDraft; receipt: ReturnType<typeof core.promiseFeasibility> }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let initial: GameState | undefined
let restoreTick: (() => void) | undefined
beforeAll(() => {
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    count.advanceAttempts++; throw new Error('1290: hard zero engine advances; no route is authorized')
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 0, hardActions: 4, hardQuotes: 2,
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
  expect(save.saveVersion).toBe(45); expect(saves.validateSaveV45(save)).toBe(save)
  const raw = saves.exportSave(save)
  expect(saves.exportSave(saves.importSave(raw))).toBe(raw); expect(stable(state)).toBe(before)
}
function retained(state: GameState): void {
  assert.ok(initial); admitted(state)
  expect(state.market.tick).toBe(45); expect(state.firstTakes).toEqual(initial.firstTakes)
  expect(state.firstTakes).toHaveLength(19)
  expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
  expect(state.promises).toEqual([]); expect(state.talentMarket.proposals).toEqual([]); expect(state.productionQueue).toEqual([])
  expect(state.studio.activeProductions).toEqual([]); expect(state.operations.workflows).toEqual([])
  expect(state.contracts).toEqual(initial.contracts); expect(state.hollywood!.employment).toEqual(initial.hollywood!.employment)
  expect(state.ledger.slice(0, initial.ledger.length)).toEqual(initial.ledger)
  expect(state.studioEvents.rows.slice(0, initial.studioEvents.rows.length)).toEqual(initial.studioEvents.rows)
  expect(state.sets[0]).toEqual(initial.sets[0])
  // These are the only roots any of the four public set actions may change.
  expect({ ...state, sets: initial.sets, nextSetId: initial.nextSetId, ledger: initial.ledger,
    studioEvents: initial.studioEvents, studio: { ...state.studio, cash: initial.studio.cash } }).toEqual(initial)
}
function person(state: GameState) {
  const talent = state.talent.find(row => row.id === ACTOR); assert.ok(talent)
  expect(talent).toMatchObject({ role: 'actor', age: 30 }); assert.ok(talent.skills.acting)
  expect(Object.values(talent.skills.acting)).toHaveLength(6)
  for (const value of Object.values(talent.skills.acting)) expect(value).toEqual({ actual: 75, perceived: 75 })
  const provenance = state.talentProvenance.rows.find(row => row.personId === ACTOR); assert.ok(provenance)
  expect(provenance).toEqual({ personId: ACTOR, kind: 'authored_exact_week', ageAtEntry: 30, entryWeek: 0 })
  expect(core.ageAt(provenance, 45)).toBe(30)
  expect(core.retirementRecordFor(state, ACTOR)).toBeUndefined()
  expect(core.retirementRecordFor(state, ACTOR, 'actor')).toBeUndefined()
  expect(core.assignmentRefusal(state, ACTOR, 45, 'actor')).toBeNull()
  const contract = activeContract(state, ACTOR); assert.ok(contract)
  expect(contract).toEqual({ talentId: ACTOR, startWeek: 0, endWeekExclusive: 208, termWeeks: 208,
    annualSalary: 370212, signingBonus: 66638 })
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === ACTOR)
  expect(employment).toEqual([{ contractId: 'studio-de11f27b-player:contract:authored-0005:0:player-29',
    studioId: issuer(state), terms: contract, reason: 'player-contract', endedWeek: null }])
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  const productionRows = owners.flatMap(owner => owner.productions.map(row => ({ studioId: owner.studioId, production: row,
    companyMember: row.directorId === ACTOR || Object.values(row.cast).includes(ACTOR) || row.craftIds.includes(ACTOR),
    writerCredit: row.writerId === ACTOR })))
  const writingRows = owners.flatMap(owner => owner.development.projects.map(row => ({ studioId: owner.studioId, project: row,
    activeAssignment: (row.status === 'drafting' || row.status === 'rewriting') && row.writerIds.includes(ACTOR) })))
  const researchRows = state.technology.projects.map(row => ({ project: row, activeAssignment: row.status === 'active'
    && row.seats.some(seat => seat.talentId === ACTOR && seat.releasedWeek === null) }))
  expect(productionRows.filter(row => row.companyMember)).toEqual([])
  expect(writingRows.filter(row => row.activeAssignment)).toEqual([])
  expect(researchRows.filter(row => row.activeAssignment)).toEqual([])
  expect(busyTalentIds(state).has(ACTOR)).toBe(false)
  expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
  return { talent, provenance, contract, employment, productionRows, writingRows, researchRows,
    currentRecord: core.retirementRecordFor(state, ACTOR) ?? null,
    requestedActorRecord: core.retirementRecordFor(state, ACTOR, 'actor') ?? null, assignmentQueryWeek: 45 }
}
function project(state: GameState, id: string): ScriptProject {
  const rows = state.scriptDevelopment.projects.filter(row => row.id === id)
  expect(rows).toHaveLength(1); return rows[0]!
}
function resources(state: GameState) {
  expect(state.operations.workflows).toEqual([]); expect(state.studio.activeProductions).toEqual([])
  expect(state.placement.facilities).toEqual([]); expect(state.construction.projects).toEqual([])
  expect(state.technology.projects).toEqual([]); expect(state.castingSessions.sessions).toEqual([])
  for (const row of state.scriptDevelopment.projects) { expect(row.status).toBe('ready'); expect(row.reservation).toBeNull() }
  expect(state.operations.facilities.map(row => [row.id, row.capability, row.capacity])).toEqual([
    ['facility-development-casting', 'development-casting', 2], ['facility-post-building', 'post', 2],
    ['facility-scenery-shop', 'set-scenery', 2], ['facility-soundstage-07', 'soundstage', 1], ['facility-soundstage-12', 'soundstage', 1] ])
  for (const set of state.sets) expect(['retired', 'standing', 'under-construction']).toContain(set.status)
  const mounts = state.sets.filter(row => row.status !== 'retired').map(set => ({ key: `mount:${set.mountedOn}`,
    facilitySlotKey: null, kind: 'mount', facilityId: set.mountedOn, slot: null, capability: null, owner: 'set', ownerId: set.id, set }))
  // All other owners were enumerated above and have no facility claim. Thus these
  // fixed under-construction sets independently acquire scenery slots in set order.
  const working = state.sets.filter(row => row.status === 'under-construction')
  expect(working.length).toBeLessThanOrEqual(2)
  const scenery = working.map((set, slot) => ({ key: `facility:facility-scenery-shop:${slot}`,
    facilitySlotKey: `facility-scenery-shop:${slot}`, kind: 'facility', facilityId: 'facility-scenery-shop',
    slot, capability: 'set-scenery', owner: 'set', ownerId: set.id, set }))
  const expected = [...mounts, ...scenery], before = stable(state)
  const claims = resourceClaimsOf(occupiedResourceSlots(state))
  expect(claims).toEqual(expected); expect(stable(state)).toBe(before)
  const free = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    slots: state.operations.facilities.filter(row => row.capability === capability).flatMap(facility =>
      Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot })).filter(candidate =>
        !expected.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId
          && (row.slot === null || row.slot === candidate.slot)))) }))
  expect(free).toEqual([
    { capability: 'development-casting', slots: [{ facilityId: 'facility-development-casting', slot: 0 }, { facilityId: 'facility-development-casting', slot: 1 }] },
    { capability: 'soundstage', slots: [{ facilityId: 'facility-soundstage-07', slot: 0 }, { facilityId: 'facility-soundstage-12', slot: 0 }] },
    { capability: 'set-scenery', slots: [0, 1].filter(slot => slot >= working.length).map(slot => ({ facilityId: 'facility-scenery-shop', slot })) },
    { capability: 'post', slots: [{ facilityId: 'facility-post-building', slot: 0 }, { facilityId: 'facility-post-building', slot: 1 }] } ])
  return { claims: clone(claims), expected, free, ownerRoots: { operations: state.operations, placement: state.placement,
    construction: state.construction, technology: state.technology, development: state.scriptDevelopment,
    casting: state.castingSessions, sets: state.sets } }
}
function input45(): GameState {
  return memo('genuine45', () => {
    const manifestBytes = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifestBytes.length).toBe(11550); expect(sha(manifestBytes)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const manifest = JSON.parse(manifestBytes.toString('utf8'))
    expect(manifest).toMatchObject({ kind: 'genuine-current39-p3-market-week45', status: 'COMPLETE',
      actualExecutionHead: '272401eb36dc49563d306de39503e306b6c9dc2d' })
    const historicalBytes = readFileSync(new URL('./fixtures/p14/genuine-v37-c3-corpus/MANIFEST.json', import.meta.url))
    expect(historicalBytes.length).toBe(32532); expect(sha(historicalBytes)).toBe('b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294')
    const historical = JSON.parse(historicalBytes.toString('utf8'))
    expect(historical.bootstrap).toEqual({ builder: 'p13aGeneratedStudio', cashBefore: 20000000, cashAfter: 30000000, delta: 10000000,
      note: 'Disclosed generated-fixture funding, not simulated earned film revenue. No other direct world edits.' })
    expect(manifest.initialization).toContain('no funding or alternate route')
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
    expect(state).toEqual({ ...withEmptyP15Roots(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withRivalTermination(withSharedCompetitions(old.state)))), old.state.market.tick), firstTakeSubjects: { version: 1, cutoverOrdinal: 19, facts: [] } })
    initial = clone(state); retained(state)
    expect(issuer(state)).toBe('studio-de11f27b-player'); expect(state.studio.cash).toBe(24701506)
    expect(state.operations.mode).toBe('managed'); expect(state.scriptDevelopment.mode).toBe('managed')
    expect(state.founding).toBeNull(); expect(state.economyEngagedEver).toBe(true)
    expect(state.scriptDevelopment.projects).toHaveLength(2)
    for (const [id, conceptId, genre, strength] of [
      ['script-0000', 'c-00', 'drama', 60.24468148832871], ['script-0001', 'c-01', 'crime', 56.87065310220528],
    ] as const) {
      expect(project(state, id)).toMatchObject({ conceptId, writerId: WRITER, writerIds: [WRITER], status: 'ready',
        dueWeek: null, reservation: null, productionId: null, assessment: { actualStrength: strength, perceivedStrength: strength } })
      expect(state.concepts.find(row => row.id === conceptId)?.genre).toBe(genre)
    }
    expect(state.nextSetId).toBe(3)
    expect(state.sets.map(row => [row.id, row.name, row.blueprintId, row.mountedOn, row.status, row.completesWeek])).toEqual([
      ['set-0', 'Stage 7 House Set', 'set-house-generic', 'facility-soundstage-07', 'retired', null],
      ['set-1', 'Stage 12 House Set', 'set-house-generic', 'facility-soundstage-12', 'standing', null],
      ['set-2', 'Grand Ballroom', 'set-grand-ballroom', 'facility-soundstage-07', 'standing', null] ])
    expect(state.studioEvents).toEqual({ nextSeq: 2, rows: [
      { kind: 'setRetired', refund: 52500, seq: 0, setId: 'set-0', week: 0 },
      { kind: 'setBuilt', seq: 1, setId: 'set-2', week: 8 } ] })
    const owner = person(state), resource = resources(state); expect(resource.claims).toHaveLength(2)
    emit('INPUT', { capture: manifest, historicalBootstrap: historical.bootstrap, rawBytes: Buffer.byteLength(raw), rawSha256: sha(raw),
      actualWeek: 45, cash: state.studio.cash, person: owner, resource, contracts: state.contracts,
      firstTakes: state.firstTakes, firstTakeSubjects: state.firstTakeSubjects, promises: state.promises,
      proposals: state.talentMarket.proposals, ledger: state.ledger, studioEvents: state.studioEvents })
    return state
  })
}
function act(state: GameState, action: Action, ordinal: number, expected: GameState, cash: number, claims: number): GameState {
  assert.equal(count.actionAttempts, ordinal); assert.ok(count.actionAttempts < 4)
  const argument = clone(action), actionBytes = stable(argument), input = clone(state), before = bytes(input), rng = clone(input.rngState)
  const row = { action: clone(action), accepted: false }; operations.push(row)
  count.actionAttempts++; emit('ACTION-ATTEMPT', { ...row, actualWeek: 45, cashBefore: state.studio.cash })
  const next = core.applyActions(input, [argument])
  expect(bytes(input)).toBe(before); expect(stable(argument)).toBe(actionBytes); expect(input.rngState).toEqual(rng)
  expect(next).toEqual(expected); retained(next); expect(next.studio.cash).toBe(cash)
  const resource = resources(next); expect(resource.claims).toHaveLength(claims)
  count.actionsAccepted++; row.accepted = true
  emit('ACTION-ACCEPTED', { ...row, actualWeek: 45, cashBefore: state.studio.cash, cashAfter: next.studio.cash,
    nextSetId: next.nextSetId, sets: next.sets, ledgerAppend: next.ledger.slice(state.ledger.length),
    studioEvents: next.studioEvents, resource, stateBytes: Buffer.byteLength(bytes(next)), stateSha256: sha(bytes(next)) })
  return next
}
function strike(state: GameState, id: 'set-1' | 'set-2', ordinal: number): GameState {
  const target = state.sets.find(row => row.id === id); assert.ok(target)
  expect(target.status).toBe('standing'); expect(state.operations.workflows).toEqual([])
  const capex = id === 'set-1' ? 150000 : 880000, refund = Math.round(capex * 0.35)
  expect(refund).toBe(id === 'set-1' ? 52500 : 308000)
  const expected: GameState = { ...state,
    sets: state.sets.map(row => row.id === id ? { ...row, status: 'retired', completesWeek: null } : row),
    studio: { ...state.studio, cash: state.studio.cash + refund },
    ledger: [...state.ledger, { week: 45, kind: 'setDemolitionRefund', amount: refund, note: `${target.name} — set struck` }],
    studioEvents: { nextSeq: state.studioEvents.nextSeq + 1, rows: [...state.studioEvents.rows,
      { kind: 'setRetired', seq: state.studioEvents.nextSeq, week: 45, setId: id, refund }] } }
  return act(state, { kind: 'strikeSet', setId: id }, ordinal, expected, id === 'set-1' ? 24754006 : 25062006, id === 'set-1' ? 1 : 0)
}
function commission(state: GameState, stage: 'facility-soundstage-12' | 'facility-soundstage-07', ordinal: number): GameState {
  const first = stage === 'facility-soundstage-12', id = first ? 3 : 4
  expect(state.nextSetId).toBe(id); expect(state.sets.filter(row => row.mountedOn === stage && row.status !== 'retired')).toEqual([])
  expect(canAfford(state, 150000)).toEqual({ ok: true }); expect(state.studio.cash - 150000).toBeGreaterThanOrEqual(0)
  const resource = resources(state)
  expect(resource.free.find(row => row.capability === 'set-scenery')!.slots.map(row => row.slot)).toEqual(first ? [0, 1] : [1])
  const set: StudioSet = { id: `set-${id}`, name: first ? 'House Set' : 'House Set 4', blueprintId: 'set-house-generic',
    mountedOn: stage, setType: 'generic-interior', status: 'under-construction', completesWeek: 45 + 3,
    quality: 45, condition: 0, novelty: 0, priorityGenre: 'drama',
    genreWeights: { adventure: 0.5, comedy: 0.5, crime: 0.5, drama: 0.5, horror: 0.5, romance: 0.5 } }
  const expected: GameState = { ...state, sets: [...state.sets, set], nextSetId: id + 1,
    studio: { ...state.studio, cash: state.studio.cash - 150000 },
    ledger: [...state.ledger, { week: 45, kind: 'setCapex', amount: -150000, note: `${set.name} — set construction` }] }
  return act(state, { kind: 'commissionSet', commission: { blueprintId: 'set-house-generic', stageFacilityId: stage } },
    ordinal, expected, first ? 24912006 : 24762006, first ? 2 : 4)
}
function firstBuild45(): GameState {
  return memo('first-build45', () => commission(strike(strike(input45(), 'set-1', 0), 'set-2', 1), 'facility-soundstage-12', 2))
}
function request(state: GameState): PromiseDraft {
  return { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId: ACTOR,
    predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: 'script-0001' },
    startWeek: 45, termWeeks: 52, windowStartWeek: 45, dueWeekExclusive: 58 }
}
function union(state: GameState, draft: PromiseDraft) {
  const from = Math.max(state.market.tick, draft.windowStartWeek), attachedIds = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const rows = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress, open = row.outcome === null, unmet = remaining > 0,
      boundOrAttached = row.contractId !== null || attachedIds.includes(row.promiseId), notSelf = row.promiseId !== draft.promiseId,
      overlap = row.dueWeekExclusive > from && row.windowStartWeek < draft.dueWeekExclusive,
      issuerOrPerson = row.issuerStudioId === draft.issuerStudioId || row.beneficiaryPersonId === draft.beneficiaryPersonId
    return { promiseId: row.promiseId, remaining, open, unmet, boundOrAttached, notSelf, overlap, issuerOrPerson,
      selected: open && unmet && boundOrAttached && notSelf && overlap && issuerOrPerson }
  })
  const ids = rows.filter(row => row.selected).map(row => row.promiseId), selected = state.promises.filter(row => ids.includes(row.promiseId))
  expect(rows).toEqual([]); expect(attachedIds).toEqual([]); expect(state.talentMarket.proposals).toEqual([]); expect(selected).toEqual([])
  return { from, rawRoots: clone(state.promises), proposals: clone(state.talentMarket.proposals), attachedIds, rows, selected: clone(selected) }
}
function quote(state: GameState, congested: boolean): void {
  retained(state)
  const before = bytes(state), rng = clone(state.rngState), draft = request(state), argument = stable(draft)
  const owner = person(state), target = project(state, 'script-0001'), concept = state.concepts.find(row => row.id === target.conceptId)
  expect(target.status).toBe('ready'); expect(target.writerId).toBe(WRITER); expect(target.writerId).not.toBe(ACTOR)
  expect(target.dueWeek).toBeNull(); expect(target.reservation).toBeNull(); expect(target.productionId).toBeNull()
  expect(concept?.genre).toBe('crime')
  const freshWeek = Math.max(45, draft.windowStartWeek), takeWeek = freshWeek + 5, slack = draft.dueWeekExclusive - takeWeek
  expect([freshWeek, takeWeek, slack]).toEqual([45, 50, 8])
  const resource = resources(state), census = union(state, draft)
  expect(resource.free.find(row => row.capability === 'set-scenery')!.slots.map(row => row.slot)).toEqual(congested ? [] : [1])
  assert.ok(count.quoteAttempts < 2)
  const spy = vi.spyOn(opportunityOwner, 'opportunityReservations')
  let receipt: ReturnType<typeof core.promiseFeasibility>, selected: unknown
  try {
    count.quoteAttempts++; receipt = core.promiseFeasibility(state, draft, 45); count.quotesReturned++
    expect(spy.mock.calls).toHaveLength(1)
    const args = spy.mock.calls[0]!, result = spy.mock.results[0]!
    expect(args[0]).toBe(state); expect(args[1]).toBe(draft); expect(args[2]).toBe(census.from)
    expect(result.type).toBe('return'); selected = clone(result.value)
  } finally { count.selectorCalls += spy.mock.calls.length; spy.mockRestore() }
  quotes.push({ request: clone(draft), receipt: clone(receipt) })
  emit('QUOTE', { ordinal: count.quoteAttempts, actualWeek: 45, congested, request: draft, requestBytes: argument, receipt,
    person: owner, target, concept, freshWeek, takeWeek, slack, resource, census, actualSelection: selected,
    inputBytes: Buffer.byteLength(before), inputSha256: sha(before), rng, hypotheticalTermsOnly: true })
  expect(selected).toEqual(census.selected); expect(bytes(state)).toBe(before); expect(stable(draft)).toBe(argument); expect(state.rngState).toEqual(rng)
  expect(receipt).toMatchObject({ rulesVersion: 7, week: 45, classification: congested ? 'FRAGILE' : 'REASONABLY_ACHIEVABLE',
    bottleneck: congested ? 'existing set-scenery capacity is not available for this opportunity' : null })
}
function firstQuote45(): GameState {
  return memo('first-quote45', () => { const state = firstBuild45(); quote(state, false); return state })
}
function secondBuild45(): GameState {
  return memo('second-build45', () => commission(firstQuote45(), 'facility-soundstage-07', 3))
}
function secondQuote45(): GameState {
  return memo('second-quote45', () => { const state = secondBuild45(); quote(state, true); return state })
}

describe('P4/P5 actual scenery capacity with independently free other facilities', () => {
  it('Q24 isolates two under-construction scenery holds with identical Ready crime requests', () => {
    const before = firstQuote45(), prior = resources(before), argument = stable(request(before))
    const after = secondQuote45(), later = resources(after)
    expect(stable(request(after))).toBe(argument); expect(quotes).toHaveLength(2)
    expect(stable(quotes[0]!.request)).toBe(argument); expect(stable(quotes[1]!.request)).toBe(argument)
    expect(later.free.filter(row => row.capability !== 'set-scenery')).toEqual(prior.free.filter(row => row.capability !== 'set-scenery'))
    expect(person(after)).toEqual(person(before)); expect(project(after, 'script-0001')).toEqual(project(before, 'script-0001'))
    expect(union(after, request(after))).toEqual(union(before, request(before)))
    expect(after.studioEvents).toEqual(before.studioEvents); expect(after.contracts).toEqual(before.contracts)
    retained(after); expect(count.actionAttempts).toBe(4); expect(count.actionsAccepted).toBe(4)
    expect(count.quoteAttempts).toBe(2); expect(count.quotesReturned).toBe(2); expect(count.selectorCalls).toBe(2)
    expect(count.advanceAttempts).toBe(0); expect(count.advanceInvoked).toBe(0); expect(count.advanceCompleted).toBe(0)
    emit('COMPLETE', { actualWeek: 45, completedBuilds: 0, sets: after.sets, nextSetId: after.nextSetId,
      quotes, cash: after.studio.cash, firstTakeSubjects: after.firstTakeSubjects, retainedTakeCount: after.firstTakes.length, counters: count })
  }, TIMEOUT)
})
