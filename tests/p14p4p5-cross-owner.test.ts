// 1269-A/B: six pure cross-owner availability quotes; no action or engine advance.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import { activeContract } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import type { PromiseDraft } from '../src/core/promises.js'
import type { GameState } from '../src/core/types.js'

const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const RIVAL = 'studio-de11f27b-r04', ACTOR = 'person-studio-de11f27b-r04-2', WRITER = 'person-studio-de11f27b-r04-0'
const FILM = 'studio-de11f27b-r04:film:4', TARGET = 'script-0000', TIMEOUT = 60_000
const ORDER = [{ id: ACTOR, dues: [57, 64, 65], floor: 52, take: 57 },
  { id: WRITER, dues: [51, 58, 59], floor: 46, take: 51 }] as const
const clone = <T>(value: T): T => structuredClone(value)
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
// 1358-N S5: Save44 (convertV43ToV44, src/core/save.ts:10776-10781) gives every relationship edge an
// empty `competitions` log and a null `romance`; a genuine V43-or-older old.state never carried them.
function withEmptyCompetitionsAndRomance<T extends WithRelationships>(state: T): T {
  return { ...state, relationships: state.relationships.map(edge => ({ ...edge, competitions: [], romance: null })) }
}
// 1344-N S5: Save43 (convertV42ToV43, src/core/save.ts:10678-10686) gives every rival business an
// empty `screenplayShelving` root; a genuine V42-or-older old.state never carried it.
function withEmptyScreenplayShelving<T extends WithRivalBusinesses>(state: T): T {
  if (state.hollywood === null) return state
  return { ...state, hollywood: { ...state.hollywood, businesses: state.hollywood.businesses.map((business) => ({
    ...business, screenplayShelving: { version: 1, rejections: [], shelved: [], commissionHoldUntilWeek: 0 } })) } }
}
// 1361-N S5: Save45 (convertV44ToV45, src/core/save.ts:10980-10984) adds the four P15 roots, empty, at
// the save's own week and back-fills nothing; a genuine V44-or-older old.state never carried them. The
// literals are this file's own expectation: production's initialP15Roots never defines it
// (1361-F7 ruling 3).
function withEmptyP15Roots<T extends object>(state: T, week: number): T {
  return { ...state,
    powerRanking: { version: 1, recordedFromWeek: week, snapshots: [] },
    p15Sequence: { version: 1, next: 1 },
    sharedMarket: { version: 1, recordedFromWeek: week, assessments: [] },
    campaignLegacy: { version: 1, recordedFromWeek: week, official: null, endOfRun: null } }
}
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const emit = (kind: string, value: unknown): void => console.info(`1269-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { advanceAttempts: 0, advanceInvoked: 0, advanceCompleted: 0, quotes: 0 }
const quoteOrder: { personId: string; dueWeekExclusive: number }[] = []
let restoreTick: (() => void) | undefined
let cache: { ok: true; state: GameState } | { ok: false; error: unknown } | undefined
beforeAll(() => {
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    count.advanceAttempts++; throw new Error('1269: hard zero advance attempts; Q17 has no simulation route')
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 0, hardQuotes: 6, publicMutationAttempts: 0,
    historicalPrefixAdvances: 0, captureReplay: false, simulationHelperImported: false, quoteOrder,
    inputCache: cache === undefined ? 'unreached' : cache.ok ? 'complete' : 'failed',
    ...(cache && !cache.ok ? { firstFailure: String(cache.error) } : {}) })
  expect(count.advanceAttempts).toBe(0); expect(count.advanceInvoked).toBe(0); expect(count.advanceCompleted).toBe(0)
  expect(count.quotes).toBeLessThanOrEqual(6)
})
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(45); expect(saves.validateSaveV45(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV45(imported)
  expect(current).toBe(imported); expect(saves.exportSave(current)).toBe(raw); expect(stable(state)).toBe(before)
}
function input45(): GameState {
  if (cache) { if (!cache.ok) throw cache.error; return clone(cache.state) }
  try {
    const manifestBytes = readFileSync(new URL('1171-p3-current45-capture/MANIFEST.json', E))
    expect(manifestBytes.length).toBe(11550)
    expect(sha(manifestBytes)).toBe('a261fc3177527d05d5a8daf624de7af015df8c9a8fedd3e11b37fe1597a2f4b6')
    const manifest = JSON.parse(manifestBytes.toString('utf8')) as { status: string; actualExecutionHead: string;
      output: { filename: string; saveVersion: number; week: number; raw: { bytes: number; sha256: string };
        gzip: { bytes: number; sha256: string } } }
    expect(manifest.status).toBe('COMPLETE'); expect(manifest.actualExecutionHead).toBe('272401eb36dc49563d306de39503e306b6c9dc2d')
    expect(manifest.output).toEqual({ filename: 'genuine-v39-p3-market-week45.json.gz', saveVersion: 39, week: 45,
      raw: { bytes: 751294, sha256: 'e7401f2578a7ad151383ca905df4253c2bbd82d6823c406c28b7e76aa809c5af' },
      gzip: { bytes: 86995, sha256: '12799a849b0b4aff49cd9707ea8c1b87c64b4e787ff261b2e9cf4b109a953117' } })
    const zipped = readFileSync(new URL(`1171-p3-current45-capture/${manifest.output.filename}`, E))
    expect(zipped.length).toBe(manifest.output.gzip.bytes); expect(sha(zipped)).toBe(manifest.output.gzip.sha256)
    const raw = gunzipSync(zipped).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(manifest.output.raw.bytes); expect(sha(raw)).toBe(manifest.output.raw.sha256)
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV39(parsed), prior = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(prior); admitted(state)
    const { firstTakeSubjects, ...retained } = state
    // 1344-N S5 (x2 at a318722, :94 measured `+ "screenplayShelving"` on each of four rival businesses, nothing else).
    // 1361-N S5: and the four empty P15 roots at the input's own week (this capture ticks nothing after its migration).
    expect(retained).toEqual(withEmptyP15Roots(withEmptyCompetitionsAndRomance(withEmptyScreenplayShelving(withRivalTermination(withSharedCompetitions(old.state)))), old.state.market.tick)); expect(firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
    expect(state.market.tick).toBe(45); expect(state.studio.cash).toBe(24701506)
    expect(issuer(state)).toBe('studio-de11f27b-player')
    expect(state.firstTakes).toHaveLength(19); expect(state.promises).toEqual([]); expect(state.talentMarket.proposals).toEqual([])
    expect(state.studio.activeProductions).toEqual([]); expect(state.productionQueue).toEqual([])
    expect(state.operations.workflows).toEqual([]); expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
    expect(state.technology.projects).toEqual([]); expect(state.construction.projects).toEqual([])
    expect(state.scriptDevelopment.mode).toBe('managed'); expect(state.scriptDevelopment.projects).toHaveLength(2)
    emit('INPUT', { capture: manifest.output, captureHead: manifest.actualExecutionHead, actualWeek: state.market.tick,
      generatedTestCapture: true, naturalFundingClaim: false, preservedOldStateSha256: sha(stable(old.state)),
      oldReceiptCount: state.firstTakes.length, oldReceiptsSha256: sha(stable(state.firstTakes)), firstTakeSubjects,
      migratedBytes: Buffer.byteLength(bytes(state)), migratedSha256: sha(bytes(state)) })
    cache = { ok: true, state }; return clone(state)
  } catch (error) { cache = { ok: false, error }; throw error }
}
function targetAndResources(state: GameState) {
  const projects = state.scriptDevelopment.projects.filter(row => row.id === TARGET); expect(projects).toHaveLength(1)
  const target = projects[0]!
  expect(target).toMatchObject({ id: TARGET, conceptId: 'c-00', writerId: 'authored-0003', writerIds: ['authored-0003'],
    commissionedWeek: 8, status: 'ready', dueWeek: null, reservation: null, productionId: null,
    assessment: { actualStrength: 60.24468148832871, perceivedStrength: 60.24468148832871 } })
  const concept = state.concepts.find(row => row.id === target.conceptId); assert.ok(concept); expect(concept.genre).toBe('drama')
  expect([ACTOR, WRITER]).not.toContain(target.writerId)
  const claims = resourceClaimsOf(occupiedResourceSlots(state))
  const availability = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => {
    const facilities = state.operations.facilities.filter(row => row.capability === capability)
    expect(facilities.length).toBe(capability === 'soundstage' ? 2 : 1)
    for (const facility of facilities) expect(facility.capacity).toBe(capability === 'soundstage' ? 1 : 2)
    const free = facilities.flatMap(facility => Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot }))
      .filter(candidate => !claims.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId
        && (row.slot === null || row.slot === candidate.slot))))
    expect(free.length).toBeGreaterThan(0); return { capability, facilities: clone(facilities), free }
  })
  return { issuerStudioId: issuer(state), target: clone(target), concept: clone(concept), claims: clone(claims), availability }
}
function personFacts(state: GameState, id: typeof ACTOR | typeof WRITER) {
  const talent = state.talent.find(row => row.id === id); assert.ok(talent)
  expect(talent).toMatchObject(id === ACTOR ? { role: 'actor', age: 42 } : { role: 'writer', age: 32 })
  assert.ok(talent.skills.acting); expect(Object.values(talent.skills.acting)).toHaveLength(6)
  const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
  expect(provenance).toMatchObject({ personId: id, kind: 'authored_exact_week', entryWeek: 0 })
  expect(talent.age).toBe(core.ageAt(provenance, 45)); expect(activeContract(state, id, 45)).toBeUndefined()
  const employmentHistory = state.hollywood!.employment.filter(row => row.terms.talentId === id)
  expect(employmentHistory).toHaveLength(1)
  expect(employmentHistory[0]).toEqual({ contractId: `${RIVAL}:contract:${id}:0`, endedWeek: null, reason: 'entry', studioId: RIVAL,
    terms: { talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208,
      annualSalary: id === ACTOR ? 275079 : 488850, signingBonus: id === ACTOR ? 49514 : 87993 } })
  const records = state.careerLifecycle.records.filter(row => row.personId === id)
  const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === id)
  expect(records).toEqual([]); expect(changes).toEqual([])
  expect(core.retirementRecordFor(state, id)).toBeUndefined(); expect(core.retirementRecordFor(state, id, 'actor')).toBeUndefined()
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  const allProductions = owners.flatMap(owner => owner.productions.map(row => ({ studioId: owner.studioId,
    productionId: row.id, conceptId: row.conceptId, startTick: row.startTick, remainingTicks: row.remainingTicks,
    directorId: row.directorId, cast: clone(row.cast), craftIds: clone(row.craftIds), writerId: row.writerId,
    companyIds: [...new Set([row.directorId, ...Object.values(row.cast), ...row.craftIds])],
    companyMember: row.directorId === id || Object.values(row.cast).includes(id) || row.craftIds.includes(id), writerCredit: row.writerId === id })))
  const allWriting = owners.flatMap(owner => owner.development.projects.map(row => ({ studioId: owner.studioId,
    projectId: row.id, status: row.status, writerId: row.writerId, writerIds: clone(row.writerIds), dueWeek: row.dueWeek,
    commissionedWeek: row.commissionedWeek, assessment: clone(row.assessment), reservation: clone(row.reservation), productionId: row.productionId,
    activeWriting: (row.status === 'drafting' || row.status === 'rewriting') && row.writerIds.includes(id) })))
  const research = state.technology.projects.filter(row => row.status === 'active'
    && row.seats.some(seat => seat.talentId === id && seat.releasedWeek === null))
  expect(research).toEqual([])
  const company = allProductions.filter(row => row.companyMember), writing = allWriting.filter(row => row.activeWriting)
  const credits = allProductions.filter(row => row.writerCredit)
  const film = allProductions.find(row => row.studioId === RIVAL && row.productionId === FILM); assert.ok(film)
  expect(film).toMatchObject({ conceptId: `${RIVAL}:concept:4`, startTick: 43, remainingTicks: 7,
    cast: { lead: ACTOR }, writerId: WRITER }); expect(film.companyIds).not.toContain(WRITER)
  expect(state.firstTakes.filter(row => row.studioId === RIVAL && row.productionId === FILM)).toEqual([])
  const business = state.hollywood!.businesses.find(row => row.studioId === RIVAL); assert.ok(business)
  const filmProject = business.development.projects.find(row => row.id === 'script-0004'); assert.ok(filmProject)
  expect(filmProject).toMatchObject({ status: 'inProduction', productionId: FILM, conceptId: film.conceptId,
    writerId: WRITER, writerIds: [WRITER] })
  const filmConcept = state.hollywood!.concepts.find(row => row.id === film.conceptId); assert.ok(filmConcept)
  expect(filmConcept.genre).toBe('horror')
  if (id === ACTOR) { expect(company).toEqual([film]); expect(writing).toEqual([]); expect(credits).toEqual([]) }
  else {
    expect(company).toEqual([]); expect(credits).toEqual([film]); expect(writing).toHaveLength(1)
    expect(writing[0]).toMatchObject({ studioId: RIVAL, projectId: 'script-0005', status: 'drafting', writerId: WRITER,
      writerIds: [WRITER], commissionedWeek: 43, dueWeek: 46, assessment: null, productionId: null,
      reservation: { capability: 'development-casting', facilityId: `${RIVAL}:development`, projectId: 'script-0005', slot: 1 } })
  }
  const companyFloors = company.map(row => {
    expect(row.startTick).toBeLessThan(45); expect(row.remainingTicks).toBeGreaterThan(0)
    return { studioId: row.studioId, productionId: row.productionId, floor: 45 + row.remainingTicks }
  })
  const writingFloors = writing.map(row => { assert.ok(row.dueWeek !== null); return { studioId: row.studioId, projectId: row.projectId, floor: row.dueWeek } })
  const freshWeek = Math.max(45, ...companyFloors.map(row => row.floor), ...writingFloors.map(row => row.floor)), takeWeek = freshWeek + 5
  expect(freshWeek).toBe(id === ACTOR ? 52 : 46); expect(takeWeek).toBe(id === ACTOR ? 57 : 51)
  const admissions = [45, freshWeek].map(queryWeek => ({ queryWeek, current: core.assignmentRefusal(state, id, queryWeek),
    requestedActor: core.assignmentRefusal(state, id, queryWeek, 'actor') }))
  for (const row of admissions) { expect(row.current).toBeNull(); expect(row.requestedActor).toBeNull() }
  return { personId: id, primaryRole: talent.role, age: talent.age, actingProfile: clone(talent.skills.acting), provenance: clone(provenance),
    employmentHistory: clone(employmentHistory), records, changes, allProductions, allWriting, research: clone(research),
    company, writing, credits, filmProject: clone(filmProject), filmConcept: clone(filmConcept), companyFloors, writingFloors,
    freshWeek, takeWeek, admissions, actualWeek: 45, prospectiveBoundaryReadsOnly: true }
}
function draft(state: GameState, beneficiaryPersonId: string, dueWeekExclusive: number): PromiseDraft {
  return { family: 'SPECIFIC_PROJECT', issuerStudioId: issuer(state), beneficiaryPersonId,
    predicate: { kind: 'projectOpportunity', count: 1, seatClass: 'allCast', scriptProjectId: TARGET },
    startWeek: 45, termWeeks: 104, windowStartWeek: 45, dueWeekExclusive }
}
function census(state: GameState, request: PromiseDraft) {
  const attachedIds = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const membership = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress, live = row.outcome === null && remaining > 0
    const boundOrAttached = row.contractId !== null || attachedIds.includes(row.promiseId)
    const overlapping = row.dueWeekExclusive > 45 && row.windowStartWeek < request.dueWeekExclusive
    const issuerOrPerson = row.issuerStudioId === request.issuerStudioId || row.beneficiaryPersonId === request.beneficiaryPersonId
    return { promiseId: row.promiseId, remaining, live, boundOrAttached, overlapping, issuerOrPerson,
      selected: live && boundOrAttached && overlapping && issuerOrPerson && row.promiseId !== request.promiseId }
  })
  const selectedIds = membership.filter(row => row.selected).map(row => row.promiseId)
  const selected = state.promises.filter(row => selectedIds.includes(row.promiseId))
  expect(state.promises).toEqual([]); expect(state.talentMarket.proposals).toEqual([]); expect(selected).toEqual([])
  return { from: 45, rawRoots: clone(state.promises), proposals: clone(state.talentMarket.proposals), attachedIds, membership, selected: clone(selected) }
}

describe('P4/P5 cross-owner production and writing availability', () => {
  it('Q17 distinguishes an occupied rival Actor from a credited Writer with an earlier active-draft boundary', () => {
    const state = input45(), original = bytes(state), originalRng = clone(state.rngState), target = targetAndResources(state)
    emit('COMMON', { actualWeek: 45, target, hypotheticalPlayerInterval: { startWeek: 45, endWeekExclusive: 149 },
      existingRivalContractsUnchanged: true, noHireTransferOrStaffingClaim: true })
    for (const subject of ORDER) {
      const person = personFacts(state, subject.id)
      expect(person.freshWeek).toBe(subject.floor); expect(person.takeWeek).toBe(subject.take)
      emit('PERSON', person)
      for (const [index, due] of subject.dues.entries()) {
        expect(due - person.takeWeek).toBe([0, 7, 8][index])
        const request = draft(state, subject.id, due), requested = stable(request), union = census(state, request)
        expect(Object.hasOwn(request, 'promiseId')).toBe(false)
        expect(request.startWeek + request.termWeeks).toBe(149); expect(due).toBeLessThan(149)
        assert.ok(count.quotes < 6); count.quotes++; quoteOrder.push({ personId: subject.id, dueWeekExclusive: due })
        const receipt = core.promiseFeasibility(state, request, 45)
        emit('QUOTE', { ordinal: count.quotes, actualWeek: state.market.tick, request, receipt, union, person, target,
          inputBytes: Buffer.byteLength(original), inputSha256: sha(original), prospectiveContractOnly: true })
        expect(bytes(state)).toBe(original); expect(stable(request)).toBe(requested); expect(state.rngState).toEqual(originalRng)
        expect(receipt).toMatchObject({ rulesVersion: 7, week: 45 })
        expect(receipt).toMatchObject(index === 0
          ? { classification: 'IMPOSSIBLE', bottleneck: 'no filming week inside the window can reach this opportunity' }
          : index === 1 ? { classification: 'FRAGILE', bottleneck: 'the due week leaves too little slack before filming would start' }
            : { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null })
      }
    }
    expect(quoteOrder).toEqual(ORDER.flatMap(subject => subject.dues.map(dueWeekExclusive => ({ personId: subject.id, dueWeekExclusive }))))
    expect(count.quotes).toBe(6); admitted(state); expect(bytes(state)).toBe(original)
    expect(state.market.tick).toBe(45); expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 19, facts: [] })
    expect(state.firstTakes).toHaveLength(19); expect(state.promises).toEqual([])
  }, TIMEOUT)
})
