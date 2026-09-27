// 1272-A/F/B: reproduced historical authority; five quotes, two existing-task actions, one tick.
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
import { facilityBodyCentre, sceneryLoadInWeeksForDistance } from '../src/core/sceneryLoadIn.js'
import type { PromiseDraft } from '../src/core/promises.js'
import type { Action, FirstTakeSubject, GameState } from '../src/core/types.js'

const INPUT = new URL('./fixtures/p14/genuine-pre38-validation-controls/', import.meta.url)
const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FILE = 'reproduced-v35-c4-all-statuses-week312.json.gz', PROD = 'prod-0000', OTHER = 'prod-0000-1'
const ACTOR = 'authored-0000', DIRECTOR = 'authored-0003', TIMEOUT = 60_000
const CAST = { lead: ACTOR, antagonist: 't-act-12', support: 't-act-11' }
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const emit = (kind: string, value: unknown): void => console.info(`1272-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0, actionAttempts: 0, actionsAccepted: 0, quotes: 0 }
const operations: { action: Action; week: number; accepted: boolean }[] = []
const quotes: { request: PromiseDraft; receipt: ReturnType<typeof core.promiseFeasibility> }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let permit: { used: boolean } | undefined
let restoreTick: (() => void) | undefined
let oldTakes: GameState['firstTakes'] = [], oldRoots: GameState['promises'] = []
beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1272: advance outside the sole Q18 route') }
    assert.equal(permit.used, false); permit.used = true
    assert.ok(count.attempted <= 1 && count.reserved < 1, 'hard one advance before invocation')
    assert.equal(state.market.tick, 312); assert.equal(options, undefined)
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(313); count.completed++; return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 1, hardActions: 2, hardQuotes: 5, tickDevelopmentOption: 'default false',
    historicalPrefixAdvances: 0, producerOrHelperImported: false, operations, quoteOrder: quotes.map(row => row.request),
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok, ...(!row.ok ? { failure: String(row.error) } : {}) })) })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(1)
  expect(count.actionAttempts).toBeLessThanOrEqual(2); expect(count.quotes).toBeLessThanOrEqual(5)
})
function memo(name: string, build: () => GameState): GameState {
  const prior = cache.get(name)
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(40); expect(saves.validateSaveV40(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV40(imported)
  expect(current).toBe(imported); expect(saves.exportSave(current)).toBe(raw); expect(stable(state)).toBe(before)
}
function production(state: GameState, id = PROD) {
  const rows = state.studio.activeProductions.filter(row => row.id === id); expect(rows).toHaveLength(1); return rows[0]!
}
function workflow(state: GameState, id = PROD) {
  const rows = state.operations.workflows.filter(row => row.productionId === id); expect(rows).toHaveLength(1); return rows[0]!
}
function input312(): GameState {
  return memo('literal35-to40:312', () => {
    const manifestBytes = readFileSync(new URL('MANIFEST.json', INPUT))
    expect(manifestBytes.length).toBe(48338); expect(sha(manifestBytes)).toBe('c9609b940ae77bf3d5c99c81463152d2c4b8782372da59249b942d1e51f1b101')
    const manifest = JSON.parse(manifestBytes.toString('utf8')) as { generatedAt: string; sourceSha: string; producerSha256: string;
      archivedSource: { sourceSha: string; fileCount: number; filesSha256: string; files: unknown[] };
      currentWorktree: { head: string; patchSha256: string; untracked: string[] }; development: { develop: boolean };
      bounds: { totalTicks: number; stages: { name: string; startWeek: number; endWeek: number; ticks: number }[] };
      artifacts: { filename: string; kind: string; week: number; byteLength: number; compressedByteLength: number;
        uncompressedSha256: string; compressedSha256: string }[] }
    expect(manifest.generatedAt).toBe('2026-09-26T20:21:57.565Z')
    expect(manifest.sourceSha).toBe('c000479d6e888d3a02f5c2ff534f5dfcbb32af3f')
    expect(manifest.producerSha256).toBe('5de47c19d3c665e79590126c3c7155d517ef65fc3285a69a751a539cc355e161')
    expect(manifest.archivedSource).toMatchObject({ sourceSha: manifest.sourceSha, fileCount: 174,
      filesSha256: '1583d5c7d6311cc8de99429a4ead13d8d82a4abdc73602eb436cf5dac6280816' })
    expect(manifest.archivedSource.files).toHaveLength(174)
    expect(sha(JSON.stringify(manifest.archivedSource.files))).toBe(manifest.archivedSource.filesSha256)
    expect(manifest.currentWorktree).toEqual({ head: manifest.sourceSha,
      patchSha256: '3acb791a875fcce2403ebe2809e8e312e3318d41b7c2834ff45d964c33a5aa92', untracked: [] })
    expect(manifest.bounds.totalTicks).toBe(501); expect(manifest.development.develop).toBe(false)
    expect(manifest.bounds.stages.find(row => row.name === 'C4 all-statuses')).toEqual({ name: 'C4 all-statuses', startWeek: 227, endWeek: 312, ticks: 85 })
    const provenanceBytes = readFileSync(new URL('./fixtures/p14/genuine-v34-c4-corpus/genuine-v34-c4-all-statuses.provenance.json', import.meta.url))
    expect(provenanceBytes.length).toBe(7589); expect(sha(provenanceBytes)).toBe('043b645d0dc808164f85c24e31d69665429609921ef018669f705bfff9770769')
    const provenance = JSON.parse(provenanceBytes.toString('utf8')) as { campaign: string; recipe: { builder: string }; week: number; saveVersion: number }
    expect(provenance.campaign).toBe("generated test campaign (world 5: migrated from the repository's own held V33 fixture); never an Owner save")
    expect(provenance.recipe.builder).toBe('fund(p13aGeneratedStudio("p14c4-corpus-01-y3")) -> createTalent x5 (age 70 each) -> signContract + sign supporting cast x2 -> greenlight x2 (both left unreleased) -> advanceTo(227)')
    expect(provenance.week).toBe(227); expect(provenance.saveVersion).toBe(34)
    const historicalBytes = readFileSync(new URL('978-c3-historical-controls.json', E))
    expect(historicalBytes.length).toBe(2980); expect(sha(historicalBytes)).toBe('8ce1f5fc19b5b416324df3832d594fdd40a12cf2ad042a9f7b8e6836a7d41559')
    const historical = JSON.parse(historicalBytes.toString('utf8')) as { exitCode: number; fixedExistingSource: boolean; exactDeclaredOutputs: boolean; start: string; end: string }
    expect(historical).toMatchObject({ exitCode: 0, fixedExistingSource: true, exactDeclaredOutputs: true,
      start: '2026-09-26T20:21:42.408Z', end: '2026-09-26T20:21:57.923Z' })
    const entry = manifest.artifacts.find(row => row.filename === FILE); assert.ok(entry)
    expect(entry).toMatchObject({ kind: 'save35', week: 312, byteLength: 2185646, compressedByteLength: 221085,
      uncompressedSha256: 'f0316e4966e2bd4ce092accc0abe2b0c2e83b6f2a047827d866e08102ca6ff33',
      compressedSha256: '4c53ede9e7b548b60f09385a7d0427bedcfca98654bb62d3619ed6b549121d18' })
    const compressed = readFileSync(new URL(FILE, INPUT)); expect(compressed.length).toBe(entry.compressedByteLength); expect(sha(compressed)).toBe(entry.compressedSha256)
    const raw = gunzipSync(compressed).toString('utf8'); expect(Buffer.byteLength(raw)).toBe(entry.byteLength); expect(sha(raw)).toBe(entry.uncompressedSha256)
    const parsed: unknown = JSON.parse(raw), old = saves.validateSaveV35(parsed), prior = stable(old)
    expect(old).toBe(parsed); expect(saves.exportSave(old)).toBe(raw)
    const state = saves.migrateToLive(old).state
    expect(stable(old)).toBe(prior); admitted(state)
    expect(state.market.tick).toBe(312); expect(issuer(state)).toBe('studio-88c92bc3-player'); expect(state.studio.cash).toBe(-3959669.2663676403)
    expect(state.firstTakes).toEqual(old.state.firstTakes); expect(state.firstTakes).toHaveLength(111)
    expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 111, facts: [] })
    expect(state.promises).toEqual(old.state.promises); expect(state.promises).toHaveLength(69)
    expect(state.careerLifecycle.boundaryWeek).toBe(old.state.careerLifecycle.boundaryWeek)
    expect(state.careerLifecycle.cohorts).toEqual(old.state.careerLifecycle.cohorts)
    expect(state.careerLifecycle.records.map(({ extensionUsed, extendedFromWeek, ...row }) => {
      expect(extensionUsed).toBe(false); expect(extendedFromWeek).toBeNull(); return row
    })).toEqual(old.state.careerLifecycle.records)
    expect(state.talentMarket.cases.map(({ variant, ...row }) => { expect(variant).toBe('expiry'); return row })).toEqual(old.state.talentMarket.cases)
    expect(state.careerLifecycle.transitionBoundaryWeek).toBe(312); expect(state.careerLifecycle.professionChanges).toEqual([])
    expect(state.studio.activeProductions).toEqual(old.state.studio.activeProductions)
    expect(state.operations).toEqual(old.state.operations); expect(state.contracts).toEqual([])
    expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); expect(state.talentMarket.proposals).toEqual([])
    expect(state.releaseAuthority).toEqual({ commitments: [] }); expect(state.productionQueue).toEqual([])
    oldTakes = clone(state.firstTakes); oldRoots = clone(state.promises)
    emit('INPUT', { historicalReproduction: { generatedAt: manifest.generatedAt, sourceSha: manifest.sourceSha,
      originalCampaign: provenance.campaign, originalBuilder: provenance.recipe.builder, archivedSource: manifest.archivedSource,
      currentWorktree: manifest.currentWorktree, bounds: manifest.bounds, selected: entry, historicalRecord: historical },
      actualWeek: 312, cash: state.studio.cash, noCurrentFunding: true, oldReceiptCount: oldTakes.length,
      oldReceiptsSha256: sha(stable(oldTakes)), oldPromiseCount: oldRoots.length, oldPromisesSha256: sha(stable(oldRoots)),
      migratedLifecycle: state.careerLifecycle, firstTakeSubjects: state.firstTakeSubjects,
      migratedBytes: Buffer.byteLength(bytes(state)), migratedSha256: sha(bytes(state)) })
    return state
  })
}
function owners(state: GameState) {
  return [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment, concepts: state.concepts },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development, concepts: state.hollywood!.concepts }))]
}
function personFacts(state: GameState, id: typeof ACTOR | typeof DIRECTOR) {
  const talent = state.talent.find(row => row.id === id); assert.ok(talent)
  expect(talent).toMatchObject({ role: id === ACTOR ? 'actor' : 'director', age: 76 }); assert.ok(talent.skills.acting)
  expect(Object.values(talent.skills.acting)).toHaveLength(6)
  for (const value of Object.values(talent.skills.acting)) expect(value).toEqual({ actual: id === ACTOR ? 35 : 30, perceived: id === ACTOR ? 35 : 30 })
  const provenance = state.talentProvenance.rows.find(row => row.personId === id); assert.ok(provenance)
  expect(provenance).toEqual({ personId: id, kind: 'authored_exact_week', ageAtEntry: 70, entryWeek: 0 })
  expect(talent.age).toBe(core.ageAt(provenance, state.market.tick)); expect(activeContract(state, id)).toBeUndefined()
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === id)
  expect(employment).toHaveLength(1); expect(employment[0]).toMatchObject({ studioId: issuer(state), endedWeek: 208,
    terms: { talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208 } })
  const record = core.retirementRecordFor(state, id), requested = core.retirementRecordFor(state, id, 'actor'); assert.ok(record)
  expect(record).toMatchObject({ personId: id, profession: talent.role, status: 'finishing_commitments', retiredWeek: null,
    announcedWeek: id === ACTOR ? 52 : 260, effectiveWeek: id === ACTOR ? 208 : 312, finishingFromWeek: id === ACTOR ? 208 : 312 })
  if (id === ACTOR) expect(requested).toEqual(record); else expect(requested).toBeUndefined()
  const currentRefusal = core.assignmentRefusal(state, id, 312), requestedRefusal = core.assignmentRefusal(state, id, 312, 'actor')
  const expected = `talent "${id}" is finishingCommitments — they finish the work they hold and take no new contract, proposal, case or assignment (effective week ${record.effectiveWeek}) (P14C.2a)`
  expect(currentRefusal).toBe(expected); expect(requestedRefusal).toBe(expected)
  const companyCensus = owners(state).flatMap(owner => owner.productions.map(p => ({ studioId: owner.studioId, productionId: p.id,
    conceptId: p.conceptId, directorId: p.directorId, cast: clone(p.cast), craftIds: clone(p.craftIds), writerId: p.writerId,
    companyMember: p.directorId === id || Object.values(p.cast).includes(id) || p.craftIds.includes(id), castMember: Object.values(p.cast).includes(id) })))
  expect(companyCensus.filter(row => row.companyMember).map(row => [row.studioId, row.productionId])).toEqual([[issuer(state), PROD]])
  expect(companyCensus.filter(row => row.castMember).map(row => row.productionId)).toEqual(id === ACTOR ? [PROD] : [])
  const activeWriting = owners(state).flatMap(owner => owner.development.projects.filter(p => ['drafting', 'rewriting'].includes(p.status)
    && p.writerIds.includes(id)).map(p => ({ studioId: owner.studioId, project: clone(p) })))
  const research = state.technology.projects.filter(row => row.status === 'active' && row.seats.some(seat => seat.talentId === id && seat.releasedWeek === null))
  expect(activeWriting).toEqual([]); expect(research).toEqual([])
  return { personId: id, role: talent.role, age: talent.age, acting: clone(talent.skills.acting), provenance: clone(provenance),
    employment: clone(employment), current: clone(record), requestedActor: requested ?? null, currentRefusal, requestedRefusal,
    companyCensus, activeWriting, research: clone(research) }
}
function heldFacts(state: GameState) {
  const p = production(state), w = workflow(state), other = production(state, OTHER)
  expect(p).toMatchObject({ id: PROD, conceptId: 'c-00', writerId: 'authored-0001', directorId: DIRECTOR, cast: CAST,
    craftIds: ['authored-0002'], startTick: 0, remainingTicks: 5 })
  expect(other).toMatchObject({ id: OTHER, conceptId: 'c-01', cast: { lead: 'authored-0004' }, startTick: 0, remainingTicks: 5 })
  expect(state.concepts.find(row => row.id === 'c-00')).toMatchObject({ genre: 'drama', title: 'The Painted Pilgrimage' })
  expect(state.concepts.find(row => row.id === 'c-01')?.genre).toBe('comedy')
  expect(state.firstTakes.filter(row => row.studioId === issuer(state) && [PROD, OTHER].includes(row.productionId))).toEqual([])
  expect(w).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: 'unassigned', directorId: DIRECTOR },
    bindings: { requiresSetBinding: true, stageFacilityId: 'facility-soundstage-07', setId: 'set-0', heldSinceWeek: 2 } })
  expect(w.reservations).toEqual([
    { capability: 'soundstage', facilityId: 'facility-soundstage-07', phase: 'shooting', productionId: PROD, slot: 0 },
    { capability: 'set-scenery', facilityId: 'facility-scenery-shop', phase: 'shooting', productionId: PROD, slot: 0 }])
  const set = state.sets.find(row => row.id === 'set-0'); assert.ok(set)
  expect(set).toMatchObject({ status: 'standing', mountedOn: 'facility-soundstage-07' })
  const claims = resourceClaimsOf(occupiedResourceSlots(state)), held = claims.filter(row => row.kind === 'facility')
  const expected = state.operations.workflows.flatMap(row => row.reservations.map(r => ({ ownerId: row.productionId,
    facilityId: r.facilityId, capability: r.capability, slot: r.slot })))
  expect(held.map(row => ({ ownerId: row.ownerId, facilityId: row.facilityId, capability: row.capability, slot: row.slot }))).toEqual(expected)
  const to = facilityBodyCentre(state, 'facility-soundstage-07'), from = facilityBodyCentre(state, 'facility-scenery-shop')
  expect(to).toEqual({ gx: 18, gy: 3 }); expect(from).toEqual({ gx: 19, gy: 18 }); assert.ok(to && from)
  const distance = Math.abs(to.gx - from.gx) + Math.abs(to.gy - from.gy)
  expect(distance).toBe(16); expect(sceneryLoadInWeeksForDistance(distance)).toBe(2)
  expect(312 - w.bindings.heldSinceWeek!).toBeGreaterThanOrEqual(2)
  return { production: clone(p), otherProduction: clone(other), workflow: clone(w), set: clone(set), claims: clone(claims),
    property: clone(state.property), placement: clone(state.placement), geometry: { from, to, distance, travelWeeks: 2, calledWeek: 2 },
    heldTakeLowerBound: 312 + Math.max(1, p.remainingTicks - 4) }
}
function census(state: GameState, request: PromiseDraft) {
  const attachedIds = [...new Set(state.talentMarket.proposals.flatMap(row => row.promises))]
  const membership = state.promises.map(row => {
    const remaining = row.predicate.count - row.progress, live = row.outcome === null && remaining > 0
    const boundOrAttached = row.contractId !== null || attachedIds.includes(row.promiseId)
    const overlapping = row.dueWeekExclusive > 312 && row.windowStartWeek < request.dueWeekExclusive
    const issuerOrPerson = row.issuerStudioId === request.issuerStudioId || row.beneficiaryPersonId === request.beneficiaryPersonId
    return { promiseId: row.promiseId, remaining, live, boundOrAttached, overlapping, issuerOrPerson,
      selected: live && boundOrAttached && overlapping && issuerOrPerson && row.promiseId !== request.promiseId }
  })
  const selectedIds = membership.filter(row => row.selected).map(row => row.promiseId)
  const selected = state.promises.filter(row => selectedIds.includes(row.promiseId))
  expect(state.promises).toHaveLength(69); expect(selected).toEqual([])
  return { from: 312, rawRoots: clone(state.promises), proposals: clone(state.talentMarket.proposals), attachedIds, membership, selected: clone(selected) }
}
function quoted312(): GameState {
  return memo('five-material-quotes312', () => {
    const state = input312(), original = bytes(state), rng = clone(state.rngState), held = heldFacts(state)
    expect(held.heldTakeLowerBound).toBe(313)
    const actor = personFacts(state, ACTOR), director = personFacts(state, DIRECTOR)
    emit('HELD', { actualWeek: 312, held, actor, director })
    const cases = [[ACTOR, 'drama', 313], [ACTOR, 'drama', 320], [ACTOR, 'drama', 321],
      [ACTOR, 'comedy', 325], [DIRECTOR, 'drama', 325]] as const
    for (const [index, [personId, genre, dueWeekExclusive]] of cases.entries()) {
      const request: PromiseDraft = { family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: issuer(state), beneficiaryPersonId: personId,
        predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre },
        startWeek: 312, termWeeks: 52, windowStartWeek: 312, dueWeekExclusive }
      const requested = stable(request), union = census(state, request); assert.ok(count.quotes < 5)
      count.quotes++; const receipt = core.promiseFeasibility(state, request, 312); quotes.push({ request: clone(request), receipt: clone(receipt) })
      emit('QUOTE', { ordinal: count.quotes, actualWeek: 312, request, receipt, union, person: personId === ACTOR ? actor : director,
        held, inputBytes: Buffer.byteLength(original), inputSha256: sha(original), hypotheticalContractOnly: true })
      expect(bytes(state)).toBe(original); expect(stable(request)).toBe(requested); expect(state.rngState).toEqual(rng)
      expect(receipt).toMatchObject({ rulesVersion: 7, week: 312 })
      expect(receipt).toMatchObject(index === 0 ? { classification: 'IMPOSSIBLE', bottleneck: 'no filming week inside the window can reach this opportunity' }
        : index === 1 ? { classification: 'FRAGILE', bottleneck: 'the due week leaves too little slack before filming would start' }
          : index === 2 ? { classification: 'REASONABLY_ACHIEVABLE', bottleneck: null }
            : { classification: 'IMPOSSIBLE', bottleneck: 'retirement closes fresh cast admission' })
    }
    expect(count.quotes).toBe(5); admitted(state); return state
  })
}
function act(state: GameState, action: Action, taskStatus: 'ready' | 'scheduled'): GameState {
  assert.ok(count.actionAttempts < 2); const before = bytes(state), request = stable(action)
  const operation = { action: clone(action), week: state.market.tick, accepted: false }
  operations.push(operation); count.actionAttempts++; emit('ACTION-ATTEMPT', operation)
  const next = core.applyActions(clone(state), [clone(action)])
  expect(bytes(state)).toBe(before); expect(stable(action)).toBe(request); expect(next.market.tick).toBe(312)
  expect(next.studio.activeProductions).toEqual(state.studio.activeProductions); expect(next.productionQueue).toEqual(state.productionQueue)
  expect(next.promises).toEqual(state.promises); expect(next.firstTakes).toEqual(state.firstTakes); expect(next.firstTakeSubjects).toEqual(state.firstTakeSubjects)
  expect(next.careerLifecycle).toEqual(state.careerLifecycle); expect(next.hollywood!.employment).toEqual(state.hollywood!.employment)
  expect(next.contracts).toEqual(state.contracts); expect(next.studio.cash).toBe(state.studio.cash); expect(next.ledger).toEqual(state.ledger)
  expect(next.scriptDevelopment).toEqual(state.scriptDevelopment); expect(next.releaseAuthority).toEqual(state.releaseAuthority)
  expect(workflow(next)).toMatchObject({ phase: 'shooting', blocker: null, shootingTask: { status: taskStatus, directorId: DIRECTOR } })
  expect(workflow(next).bindings).toEqual(workflow(state).bindings); expect(workflow(next).reservations).toEqual(workflow(state).reservations)
  expect(workflow(next, OTHER)).toEqual(workflow(state, OTHER)); admitted(next)
  if (action.kind === 'assignShootingDirector') expect(next.studioEvents.rows.slice(state.studioEvents.rows.length)).toEqual([
    { seq: state.studioEvents.nextSeq, week: 312, kind: 'sceneryArrived', productionId: PROD }])
  operation.accepted = true; count.actionsAccepted++
  emit('ACTION-ACCEPTED', { ...operation, production: production(next), workflow: workflow(next), studioEvents: next.studioEvents,
    firstTakeSubjects: next.firstTakeSubjects }); return next
}
function ready312(): GameState {
  return memo('director-ready312', () => act(quoted312(), { kind: 'assignShootingDirector', productionId: PROD, directorId: DIRECTOR }, 'ready'))
}
function scheduled312(): GameState {
  return memo('scheduled312', () => act(ready312(), { kind: 'scheduleShootingTake', productionId: PROD }, 'scheduled'))
}
function ownerFacts(state: GameState) {
  return owners(state).flatMap(owner => owner.productions.map(p => {
    const concept = owner.concepts.find(row => row.id === p.conceptId); assert.ok(concept)
    const linked = owner.development.projects.filter(row => row.productionId === p.id)
    return { studioId: owner.studioId, production: clone(p), concept: clone(concept), mode: owner.development.mode, linked: clone(linked) }
  }))
}
function rootAuthority(row: GameState['promises'][number]) {
  return { promiseId: row.promiseId, family: row.family, issuerStudioId: row.issuerStudioId, beneficiaryPersonId: row.beneficiaryPersonId,
    contractId: row.contractId, predicate: clone(row.predicate), version: row.version, windowStartWeek: row.windowStartWeek,
    dueWeekExclusive: row.dueWeekExclusive, feasibilityReceipt: clone(row.feasibilityReceipt) }
}
function taken313(): GameState {
  return memo('actual-take313', () => {
    const state = scheduled312(), prior = bytes(state), beforeOwners = ownerFacts(state)
    expect(production(state).remainingTicks).toBe(5); assert.equal(permit, undefined); permit = { used: false }
    let next: GameState
    try { next = tickOwner.tick(clone(state)) } finally { permit = undefined }
    expect(bytes(state)).toBe(prior); expect(next.firstTakes.slice(0, 111)).toEqual(oldTakes)
    const afterOwners = ownerFacts(next), added = next.firstTakes.slice(111).map(receipt => {
      const owner = beforeOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
        ?? afterOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
      assert.ok(owner, 'new receipt requires its actual owner/production/concept')
      expect(receipt.week).toBe(313); expect(receipt.directorId).toBe(owner.production.directorId); expect(receipt.cast).toEqual(owner.production.cast)
      expect(owner.linked.length).toBeLessThanOrEqual(1); if (owner.mode === 'managed') expect(owner.linked).toHaveLength(1)
      for (const project of owner.linked) expect(project.conceptId).toBe(owner.concept.id)
      const subject: FirstTakeSubject = { eventId: receipt.eventId, conceptId: owner.concept.id, genre: owner.concept.genre,
        scriptProjectId: owner.linked[0]?.id ?? null }
      return { receipt: clone(receipt), subject, owner }
    })
    emit('ADVANCE', { from: 312, to: next.market.tick, added, actualSubjectRoot: next.firstTakeSubjects,
      production: production(next), workflow: workflow(next), oldPromiseRows: oldRoots.map(old => next.promises.find(row => row.promiseId === old.promiseId)),
      actorRecord: core.retirementRecordFor(next, ACTOR), directorRecord: core.retirementRecordFor(next, DIRECTOR) })
    expect(next.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 111, facts: added.map(row => row.subject) })
    const own = added.filter(row => row.receipt.studioId === issuer(next) && row.receipt.productionId === PROD)
    expect(own).toHaveLength(1); expect(own[0]!.receipt).toMatchObject({ week: 313, directorId: DIRECTOR, cast: CAST })
    expect(own[0]!.subject).toEqual({ eventId: own[0]!.receipt.eventId, conceptId: 'c-00', genre: 'drama', scriptProjectId: null })
    expect(production(next)).toMatchObject({ conceptId: 'c-00', remainingTicks: 4, directorId: DIRECTOR, cast: CAST,
      writerId: 'authored-0001', craftIds: ['authored-0002'] })
    expect(production(next, OTHER)).toEqual(production(state, OTHER)); expect(workflow(next, OTHER)).toEqual(workflow(state, OTHER))
    for (const id of [ACTOR, DIRECTOR]) {
      expect(core.retirementRecordFor(next, id)).toEqual(core.retirementRecordFor(state, id))
      expect(core.retirementRecordFor(next, id)).toMatchObject({ status: 'finishing_commitments', retiredWeek: null })
      expect(next.talent.find(row => row.id === id)?.role).toBe(state.talent.find(row => row.id === id)?.role)
      expect(activeContract(next, id)).toBeUndefined()
      expect(next.hollywood!.employment.filter(row => row.terms.talentId === id)).toEqual(state.hollywood!.employment.filter(row => row.terms.talentId === id))
    }
    for (const old of oldRoots) {
      const rows = next.promises.filter(row => row.promiseId === old.promiseId); expect(rows).toHaveLength(1)
      expect(rootAuthority(rows[0]!)).toEqual(rootAuthority(old))
    }
    expect(next.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); expect(next.releaseAuthority).toEqual({ commitments: [] })
    admitted(next); return next
  })
}

describe('P4/P5 existing finishing commitments and material work', () => {
  it('Q18 distinguishes held finishing cast work from forbidden fresh work and records its actual next take', () => {
    const state = taken313()
    expect(state.market.tick).toBe(313); expect(count).toEqual({ attempted: 1, reserved: 1, invoked: 1, completed: 1, outside: 0,
      actionAttempts: 2, actionsAccepted: 2, quotes: 5 })
    expect(operations.map(row => [row.week, row.action.kind, row.accepted])).toEqual([
      [312, 'assignShootingDirector', true], [312, 'scheduleShootingTake', true]])
    expect([...cache].every(([, row]) => row.ok)).toBe(true)
  }, TIMEOUT)
})
