// 1266-A/F/B: actual Actor retirement after real role transitions; three pure reads only.
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
import type { GameState } from '../src/core/types.js'

const INPUT = new URL('./fixtures/p14/genuine-v38-pre-p3/', import.meta.url)
const FILE = 'genuine-v38-p3-natural-week208.json.gz'
const ORDER = ['authored-0005', 'authored-0000', 'authored-0001'] as const
const HISTORICAL_LIMIT = 'Original V37 development provenance and twelve-digest parity FAIL remain immutable; no old P3 or old waiver link fabricated.'
const TIMEOUT = 60_000
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const emit = (kind: string, value: unknown): void => console.info(`1266-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { advanceAttempts: 0, advanceInvoked: 0, advanceCompleted: 0, quotes: 0 }
const quoteOrder: string[] = []
let restoreTick: (() => void) | undefined
let cache: { ok: true; state: GameState } | { ok: false; error: unknown } | undefined
beforeAll(() => {
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation(() => {
    count.advanceAttempts++; throw new Error('1266: hard zero advance attempts; Q16 has no simulation route')
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 0, hardQuotes: 3, publicMutationAttempts: 0,
    historicalPrefixAdvances: 0, captureReplay: false, simulationHelperImported: false, quoteOrder,
    inputCache: cache === undefined ? 'unreached' : cache.ok ? 'complete' : 'failed',
    ...(cache && !cache.ok ? { firstFailure: String(cache.error) } : {}) })
  expect(count.advanceAttempts).toBe(0); expect(count.advanceInvoked).toBe(0); expect(count.advanceCompleted).toBe(0)
  expect(count.quotes).toBeLessThanOrEqual(3)
})
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(42); expect(saves.validateSaveV42(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV42(imported)
  expect(current).toBe(imported); expect(saves.exportSave(current)).toBe(raw); expect(stable(state)).toBe(before)
}
function input208(): GameState {
  if (cache) { if (!cache.ok) throw cache.error; return clone(cache.state) }
  try {
    const manifestBytes = readFileSync(new URL('MANIFEST.json', INPUT))
    expect(manifestBytes.length).toBe(345615)
    expect(sha(manifestBytes)).toBe('87db7cc4885f5e9a9464d8e2c3e586be84078550aebf1155a672fa2782a2c987')
    const manifest = JSON.parse(manifestBytes.toString('utf8')) as { status: string; sourceHead: string; historicalLimit: string;
      artifacts: { filename: string; lineage: string; rawIdentity: { bytes: number; sha256: string };
        gzipIdentity: { bytes: number; sha256: string } }[] }
    expect(manifest.status).toBe('CAPTURED_OUTGOING_AUTHORITY_NOT_P3_QUALIFICATION')
    expect(manifest.sourceHead).toBe('00efc08607857c479a603efd43899e06ff805be7')
    expect(manifest.historicalLimit).toBe(HISTORICAL_LIMIT)
    const entries = manifest.artifacts.filter(row => row.filename === FILE); expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual({ filename: FILE,
      lineage: 'actual current Bridge advance207->208; independent develop:true tick matches',
      rawIdentity: { bytes: 1705876, sha256: 'ebb00ca54328ef3340d959d830045d28c73dc493b8f069220256183e718fc4bb' },
      gzipIdentity: { bytes: 174916, sha256: 'a7418eb0f90fa2d10ae65e78e3c3b9e75ec19346970c677c1cfdeefce42b2960' } })
    const compressed = readFileSync(new URL(FILE, INPUT)); expect(compressed.length).toBe(174916)
    expect(sha(compressed)).toBe(entries[0]!.gzipIdentity.sha256)
    const raw = gunzipSync(compressed).toString('utf8')
    expect(Buffer.byteLength(raw)).toBe(1705876); expect(sha(raw)).toBe(entries[0]!.rawIdentity.sha256)
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV38(parsed), oldBytes = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(oldBytes); admitted(state)
    expect(state.market.tick).toBe(208); expect(issuer(state)).toBe('studio-de11f27b-player')
    expect(state.firstTakes).toHaveLength(85); expect(state.firstTakes).toEqual(old.state.firstTakes)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 85, facts: [] })
    expect(state.promises).toHaveLength(59); expect(state.promises).toEqual(old.state.promises)
    expect(state.careerLifecycle).toEqual(old.state.careerLifecycle)
    expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] })
    expect(state.studio.activeProductions).toEqual([]); expect(state.operations.workflows).toEqual([])
    expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] }); expect(state.productionQueue).toEqual([])
    expect(state.technology.projects).toEqual([]); expect(state.construction.projects).toEqual([])
    expect(state.talentMarket.proposals).toEqual([]); expect(state.contracts).toEqual([])
    emit('INPUT', { lineage: entries[0], sourceHead: manifest.sourceHead, captureStatus: manifest.status,
      historicalLimit: manifest.historicalLimit, generatedTestCapture: true, naturalFundingClaim: false,
      actualWeek: state.market.tick, oldReceiptCount: state.firstTakes.length, oldReceiptsSha256: sha(stable(state.firstTakes)),
      promiseCount: state.promises.length, promisesSha256: sha(stable(state.promises)), firstTakeSubjects: state.firstTakeSubjects,
      migratedBytes: Buffer.byteLength(bytes(state)), migratedSha256: sha(bytes(state)) })
    cache = { ok: true, state }; return clone(state)
  } catch (error) { cache = { ok: false, error }; throw error }
}
function resources(state: GameState) {
  const claims = resourceClaimsOf(occupiedResourceSlots({ operations: state.operations, placement: state.placement,
    technology: state.technology, construction: state.construction, scriptDevelopment: state.scriptDevelopment,
    castingSessions: state.castingSessions, sets: state.sets }))
  const available = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => {
    const facilities = state.operations.facilities.filter(row => row.capability === capability)
    expect(facilities.length).toBe(capability === 'soundstage' ? 2 : 1)
    for (const facility of facilities) expect(facility.capacity).toBe(capability === 'soundstage' ? 1 : 2)
    const free = facilities.flatMap(facility => Array.from({ length: facility.capacity }, (_, slot) => ({ facilityId: facility.id, slot }))
      .filter(candidate => !claims.some(row => row.kind === 'facility' && row.facilityId === candidate.facilityId
        && (row.slot === null || row.slot === candidate.slot))))
    expect(free.length).toBeGreaterThan(0); return { capability, facilities: clone(facilities), free }
  })
  return { claims: clone(claims), available }
}
function stock(state: GameState) {
  const used = [...new Set([...state.studio.activeProductions.map(row => row.conceptId), ...state.studio.releasedFilms.map(row => row.conceptId)])]
  expect(used).toEqual(expect.arrayContaining(['c-00', 'c-01', 'c-02']))
  const unused = state.concepts.filter(row => row.genre === 'drama' && !used.includes(row.id))
  expect(unused.map(row => row.id)).toEqual(['c-04', 'c-12', 'c-18', 'c-20', 'c-22', 'c-23', 'c-25'])
  return { usedConceptIds: used, unusedDramaConcepts: clone(unused), freshWeek: 208, earliestTakeWeek: 213,
    dueWeekExclusive: 221, slackWeeks: 221 - (208 + 5) }
}
function personFacts(state: GameState, id: typeof ORDER[number]) {
  const talent = state.talent.find(row => row.id === id); assert.ok(talent)
  const role = id === 'authored-0005' ? 'actor' : id === 'authored-0000' ? 'director' : 'writer'
  expect(talent.role).toBe(role); expect(talent.age).toBe(id === 'authored-0005' ? 34 : 72)
  const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
  expect(talent.age).toBe(core.ageAt(provenance, 208)); assert.ok(talent.skills.acting)
  expect(Object.values(talent.skills.acting)).toHaveLength(6)
  for (const value of Object.values(talent.skills.acting)) expect(value).toEqual({ actual: 75, perceived: 75 })
  expect(state.freeAgents).toContain(id); expect(activeContract(state, id, 208)).toBeUndefined()
  const employmentHistory = state.hollywood!.employment.filter(row => row.terms.talentId === id)
  const active = employmentHistory.filter(row => row.terms.startWeek <= 208 && row.terms.endWeekExclusive > 208
    && (row.endedWeek === null || row.endedWeek > 208))
  expect(active).toEqual([]); expect(employmentHistory.some(row => row.terms.endWeekExclusive === 208)).toBe(true)
  const owners = [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development }))]
  const engagements = {
    productions: owners.flatMap(owner => owner.productions.filter(row => row.directorId === id || Object.values(row.cast).includes(id)
      || row.craftIds.includes(id)).map(row => ({ studioId: owner.studioId, productionId: row.id }))),
    writing: owners.flatMap(owner => owner.development.projects.filter(row => ['drafting', 'rewriting'].includes(row.status)
      && row.writerIds.includes(id)).map(row => ({ studioId: owner.studioId, projectId: row.id, dueWeek: row.dueWeek }))),
    research: state.technology.projects.filter(row => row.status === 'active' && row.seats.some(seat => seat.talentId === id
      && seat.releasedWeek === null)).map(row => row.id),
  }
  expect(engagements).toEqual({ productions: [], writing: [], research: [] }); expect(busyTalentIds(state).has(id)).toBe(false)
  const records = state.careerLifecycle.records.filter(row => row.personId === id)
  const changes = state.careerLifecycle.professionChanges.filter(row => row.personId === id)
  const current = core.retirementRecordFor(state, id), requested = core.retirementRecordFor(state, id, 'actor')
  const currentAdmission = core.assignmentRefusal(state, id, 208), requestedAdmission = core.assignmentRefusal(state, id, 208, 'actor')
  const facts = { personId: id, primaryRole: talent.role, age: talent.age, actingProfile: talent.skills.acting, provenance,
    employmentHistory, active, engagements, records, changes, current: current ?? null, requested: requested ?? null,
    currentAdmission, requestedAdmission }
  emit('PERSON', facts)
  expect(current).toBeUndefined(); expect(currentAdmission).toBeNull()
  if (id === 'authored-0005') {
    expect(records).toEqual([]); expect(changes).toEqual([]); expect(requested).toBeUndefined(); expect(requestedAdmission).toBeNull()
  } else {
    expect(records).toHaveLength(1); expect(requested).toEqual(records[0])
    expect(requested).toMatchObject({ personId: id, profession: 'actor', status: 'retired', announcedWeek: 104,
      effectiveWeek: 208, retiredWeek: 208, cause: 'hardBoundary' })
    expect(changes).toHaveLength(1); expect(changes[0]).toMatchObject({ personId: id, from: 'actor', to: role, week: 208 })
    expect(requestedAdmission).toBe(`talent "${id}" is retiredFromProfession — retired at week 208 (effective week 208) (P14C.2a)`)
  }
  return facts
}
function draft(state: GameState, beneficiaryPersonId: string): PromiseDraft {
  return { family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: issuer(state), beneficiaryPersonId,
    predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'drama' },
    startWeek: 208, termWeeks: 52, windowStartWeek: 208, dueWeekExclusive: 221 }
}
function census(state: GameState, request: PromiseDraft) {
  const attachedIds = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const membership = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress
    const live = row.outcome === null && remaining > 0
    const boundOrAttached = row.contractId !== null || attachedIds.includes(row.promiseId)
    const overlapping = row.dueWeekExclusive > 208 && row.windowStartWeek < request.dueWeekExclusive
    const issuerOrPerson = row.issuerStudioId === request.issuerStudioId || row.beneficiaryPersonId === request.beneficiaryPersonId
    return { promiseId: row.promiseId, remaining, live, boundOrAttached, overlapping, issuerOrPerson,
      selected: live && boundOrAttached && overlapping && issuerOrPerson && row.promiseId !== request.promiseId }
  })
  const selectedIds = membership.filter(row => row.selected).map(row => row.promiseId)
  const selected = state.promises.filter(row => selectedIds.includes(row.promiseId))
  expect(state.promises).toHaveLength(59); expect(selected).toEqual([])
  return { from: 208, rawRoots: clone(state.promises), attachedIds, membership, selected: clone(selected) }
}

describe('P4/P5 requested Actor retirement after actual transitions', () => {
  it('Q16 refuses fresh genre cast admission for real retired Actors in new primary professions', () => {
    const state = input208(), original = bytes(state), originalRng = clone(state.rngState)
    const resourceFacts = resources(state), stockFacts = stock(state)
    emit('COMMON', { actualWeek: 208, resources: resourceFacts, stock: stockFacts, historicalLimit: HISTORICAL_LIMIT })
    for (const id of ORDER) {
      const person = personFacts(state, id), request = draft(state, id), requestBytes = stable(request), union = census(state, request)
      expect(Object.hasOwn(request, 'promiseId')).toBe(false)
      assert.ok(count.quotes < 3); expect(ORDER[count.quotes]).toBe(id)
      count.quotes++; quoteOrder.push(id)
      const receipt = core.promiseFeasibility(state, request, 208)
      emit('QUOTE', { actualWeek: 208, person, request, receipt, union, resources: resourceFacts, stock: stockFacts,
        inputBytes: Buffer.byteLength(original), inputSha256: sha(original), prospectiveContractOnly: true })
      expect(bytes(state)).toBe(original); expect(stable(request)).toBe(requestBytes); expect(state.rngState).toEqual(originalRng)
      expect(receipt).toMatchObject({ rulesVersion: 7, week: 208 })
      expect(receipt).toMatchObject(id === 'authored-0005'
        ? { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null }
        : { classification: 'IMPOSSIBLE', bottleneck: 'retirement closes fresh cast admission' })
    }
    expect(quoteOrder).toEqual(ORDER); expect(count.quotes).toBe(3)
    admitted(state); expect(bytes(state)).toBe(original)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 85, facts: [] })
    expect(state.promises).toHaveLength(59); expect(state.market.tick).toBe(208)
  }, TIMEOUT)
})
