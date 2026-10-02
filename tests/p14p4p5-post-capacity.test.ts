// 1293-A/B/F: two ordinary advances, five public actions, two identical P4 post-capacity quotes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import * as core from '../src/core/index.js'
import * as saves from '../src/core/save.js'
import * as tickOwner from '../src/core/tick.js'
import * as opportunityOwner from '../src/core/opportunityPromises.js'
import { trustDrivers, trustDescriptor, studioTrustDescriptor } from '../src/core/promises.js'
import { activeContract, busyTalentIds } from '../src/core/employment.js'
import { occupiedResourceSlots, resourceClaimsOf } from '../src/core/occupancy.js'
import { facilityBodyCentre, sceneryLoadInWeeksForDistance } from '../src/core/sceneryLoadIn.js'
import type { PromiseDraft, TrustDriver } from '../src/core/promises.js'
import type { Action, FirstTakeSubject, GameState } from '../src/core/types.js'

const INPUT = new URL('./fixtures/p14/genuine-pre38-validation-controls/', import.meta.url)
const E = new URL('../docs/engineering/playability-launch-review/evidence/p14b4-20260919/', import.meta.url)
const FILE = 'reproduced-v35-c4-all-statuses-week312.json.gz', PROD = 'prod-0000', OTHER = 'prod-0000-1'
const ACTOR = 'authored-0000', DIRECTOR = 'authored-0003', PERSON = 't-act-00', TIMEOUT = 60_000
const IDS = [PROD, OTHER] as const
const DIRECTORS = [DIRECTOR, 't-dir-08'] as const
const OTHER_CAST = { lead: 'authored-0004', antagonist: 't-act-13', support: 't-act-14' }
const CAST = { lead: ACTOR, antagonist: 't-act-12', support: 't-act-11' }
const clone = <T>(value: T): T => structuredClone(value)
const stable = saves.stableStringify
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const bytes = (state: GameState): string => saves.exportSave(saves.makeSave(state))
const issuer = (state: GameState): string => { assert.ok(state.hollywood); return state.hollywood.playerStudioId }
const emit = (kind: string, value: unknown): void => console.info(`1293-P4P5-${kind} ${JSON.stringify(value)}`)
const count = { attempted: 0, reserved: 0, invoked: 0, completed: 0, outside: 0, actionAttempts: 0, actionsAccepted: 0, quotes: 0, returnedQuotes: 0, selectorCalls: 0 }
const operations: { action: Action; week: number; accepted: boolean }[] = []
const quotes: { request: PromiseDraft; receipt: ReturnType<typeof core.promiseFeasibility> }[] = []
const cache = new Map<string, { ok: true; value: GameState } | { ok: false; error: unknown }>()
let permit: { used: boolean } | undefined
let restoreTick: (() => void) | undefined
let oldTakes: GameState['firstTakes'] = [], oldRoots: GameState['promises'] = []
let initial: GameState | undefined
let expectedFacts: FirstTakeSubject[] = []
beforeAll(() => {
  const actual = tickOwner.tick
  const spy = vi.spyOn(tickOwner, 'tick').mockImplementation((state, options) => {
    count.attempted++
    if (!permit) { count.outside++; throw new Error('1293: advance outside the sole Q25 route') }
    assert.equal(permit.used, false); permit.used = true
    assert.ok(count.attempted <= 2 && count.reserved < 2, 'hard two advances before invocation')
    assert.equal(state.market.tick, 312 + count.completed); assert.equal(options, undefined)
    count.reserved++; count.invoked++
    const next = actual(state, options)
    expect(next.market.tick).toBe(state.market.tick + 1); count.completed++; return next
  })
  restoreTick = () => spy.mockRestore()
})
afterAll(() => {
  restoreTick?.()
  emit('COUNTERS', { ...count, hardAdvanceAttempts: 2, hardActions: 5, hardQuotes: 2, tickDevelopmentOption: 'default false',
    historicalPrefixAdvances: 0, producerOrHelperImported: false, operations, quoteOrder: quotes.map(row => row.request),
    phases: [...cache].map(([name, row]) => ({ name, complete: row.ok, ...(!row.ok ? { failure: String(row.error) } : {}) })) })
  expect(count.outside).toBe(0); expect(count.attempted).toBeLessThanOrEqual(2)
  expect(count.actionAttempts).toBeLessThanOrEqual(5); expect(count.quotes).toBeLessThanOrEqual(2)
})
function memo(name: string, build: () => GameState): GameState {
  const prior = cache.get(name)
  if (prior) { if (!prior.ok) throw prior.error; return clone(prior.value) }
  try { const value = build(); cache.set(name, { ok: true, value }); return clone(value) }
  catch (error) { cache.set(name, { ok: false, error }); throw error }
}
function admitted(state: GameState): void {
  const before = stable(state), save = saves.makeSave(state)
  expect(save.saveVersion).toBe(43); expect(saves.validateSaveV43(save)).toBe(save)
  const raw = saves.exportSave(save), imported = saves.importSave(raw), current = saves.validateSaveV43(imported)
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
    oldTakes = clone(state.firstTakes); oldRoots = clone(state.promises); initial = clone(state)
    setupFacts(state); queryPerson(state)
    emit('INPUT', { historicalReproduction: { generatedAt: manifest.generatedAt, sourceSha: manifest.sourceSha,
      originalCampaign: provenance.campaign, originalBuilder: provenance.recipe.builder, archivedSource: manifest.archivedSource,
      currentWorktree: manifest.currentWorktree, bounds: manifest.bounds, selected: entry, historicalRecord: historical },
      actualWeek: 312, cash: state.studio.cash, noCurrentFunding: true, oldReceiptCount: oldTakes.length,
      oldReceiptsSha256: sha(stable(oldTakes)), oldPromiseCount: oldRoots.length, oldPromisesSha256: sha(stable(oldRoots)),
      migratedLifecycle: state.careerLifecycle, setup: setupFacts(state), queriedPerson: queryPerson(state), firstTakeSubjects: state.firstTakeSubjects,
      migratedBytes: Buffer.byteLength(bytes(state)), migratedSha256: sha(bytes(state)) })
    return state
  })
}
function owners(state: GameState) {
  return [{ studioId: issuer(state), productions: state.studio.activeProductions, development: state.scriptDevelopment, concepts: state.concepts },
    ...state.hollywood!.businesses.map(row => ({ studioId: row.studioId, productions: row.productions, development: row.development, concepts: state.hollywood!.concepts }))]
}
function rootAuthority(row: GameState['promises'][number]) {
  return { promiseId: row.promiseId, family: row.family, issuerStudioId: row.issuerStudioId, beneficiaryPersonId: row.beneficiaryPersonId,
    contractId: row.contractId, predicate: clone(row.predicate), version: row.version, windowStartWeek: row.windowStartWeek,
    dueWeekExclusive: row.dueWeekExclusive, feasibilityReceipt: clone(row.feasibilityReceipt) }
}
function engagements(state: GameState, id: string) {
  const company = owners(state).flatMap(owner => owner.productions.map(p => ({ studioId: owner.studioId, production: clone(p),
    member: p.directorId === id || Object.values(p.cast).includes(id) || p.craftIds.includes(id), writerCredit: p.writerId === id })))
  const writing = owners(state).flatMap(owner => owner.development.projects.map(p => ({ studioId: owner.studioId, project: clone(p),
    assigned: (p.status === 'drafting' || p.status === 'rewriting') && p.writerIds.includes(id) })))
  const research = state.technology.projects.map(p => ({ project: clone(p), assigned: p.status === 'active'
    && p.seats.some(seat => seat.talentId === id && seat.releasedWeek === null) }))
  return { company, writing, research }
}
function queryPerson(state: GameState) {
  const talent = state.talent.find(row => row.id === PERSON); assert.ok(talent?.skills.acting)
  expect(talent).toMatchObject({ id: PERSON, role: 'actor', age: 41 })
  expect(talent.skills.acting).toEqual({ actingTechnique: { actual: 39, perceived: 47 }, comicTiming: { actual: 80, perceived: 92 },
    dialogueDelivery: { actual: 53, perceived: 48 }, emotionalRange: { actual: 54, perceived: 61 },
    physicalPerformance: { actual: 76, perceived: 81 }, screenPresence: { actual: 68, perceived: 63 } })
  const provenance = state.talentProvenance.rows.find(row => row.personId === PERSON); assert.ok(provenance)
  expect(provenance).toEqual({ personId: PERSON, kind: 'authored_exact_week', entryWeek: 0, ageAtEntry: 35.22299891072342 })
  expect(core.ageAt(provenance, state.market.tick)).toBe(41)
  const current = core.retirementRecordFor(state, PERSON), actor = core.retirementRecordFor(state, PERSON, 'actor')
  expect(current).toBeUndefined(); expect(actor).toBeUndefined()
  const currentRefusal = core.assignmentRefusal(state, PERSON, state.market.tick), actorRefusal = core.assignmentRefusal(state, PERSON, state.market.tick, 'actor')
  expect(currentRefusal).toBeNull(); expect(actorRefusal).toBeNull(); expect(activeContract(state, PERSON)).toBeUndefined()
  const employment = state.hollywood!.employment.filter(row => row.terms.talentId === PERSON); expect(employment).toEqual([])
  const facts = engagements(state, PERSON)
  expect(facts.company.filter(row => row.member || row.writerCredit)).toEqual([])
  expect(facts.writing.filter(row => row.assigned)).toEqual([]); expect(facts.research.filter(row => row.assigned)).toEqual([])
  expect(busyTalentIds(state).has(PERSON)).toBe(false)
  return { talent: clone(talent), provenance: clone(provenance), current: current ?? null, requestedActor: actor ?? null,
    currentRefusal, actorRefusal, employment: clone(employment), ...facts, actualWeek: state.market.tick, hypotheticalContractOnly: true }
}
function lockedPeople(state: GameState) {
  assert.ok(initial)
  const baseline = initial
  return [ACTOR, 'authored-0004', DIRECTOR, 't-dir-08'].map(id => {
    const talent = state.talent.find(row => row.id === id), provenance = state.talentProvenance.rows.find(row => row.personId === id)
    assert.ok(talent && provenance)
    expect(talent.role).toBe(id === DIRECTOR || id === 't-dir-08' ? 'director' : 'actor')
    expect(talent.age).toBe(id === 't-dir-08' ? 40 : 76); expect(core.ageAt(provenance, state.market.tick)).toBe(talent.age)
    expect(provenance).toEqual(baseline.talentProvenance.rows.find(row => row.personId === id))
    const record = core.retirementRecordFor(state, id), employment = state.hollywood!.employment.filter(row => row.terms.talentId === id)
    expect(activeContract(state, id)).toBeUndefined(); expect(employment).toEqual(baseline.hollywood!.employment.filter(row => row.terms.talentId === id))
    expect(employment).toHaveLength(1); expect(employment[0]).toMatchObject({ studioId: issuer(state), endedWeek: 208,
      terms: { talentId: id, startWeek: 0, endWeekExclusive: 208, termWeeks: 208 } })
    if (id === 't-dir-08') expect(record).toBeUndefined()
    else {
      expect(record).toEqual(core.retirementRecordFor(baseline, id))
      expect(record).toMatchObject({ personId: id, profession: talent.role, status: 'finishing_commitments', retiredWeek: null,
        announcedWeek: id === DIRECTOR ? 260 : 52, effectiveWeek: id === DIRECTOR ? 312 : 208 })
    }
    const facts = engagements(state, id), picture = id === DIRECTOR || id === ACTOR ? PROD : OTHER
    const present = state.studio.activeProductions.some(row => row.id === picture)
    expect(facts.company.filter(row => row.member).map(row => [row.studioId, row.production.id])).toEqual(present ? [[issuer(state), picture]] : [])
    expect(facts.writing.filter(row => row.assigned)).toEqual([]); expect(facts.research.filter(row => row.assigned)).toEqual([])
    return { talent: clone(talent), provenance: clone(provenance), current: record ?? null,
      requested: core.retirementRecordFor(state, id, talent.role) ?? null, employment: clone(employment), ...facts }
  })
}
function pairs() {
  const d = DIRECTOR, { lead: l, antagonist: a, support: s } = CAST
  return [[d, l, 6], [d, a, 4], [d, s, 2], [l, a, 6], [l, s, 4], [a, s, 2]].map(row => {
    const x = String(row[0]), y = String(row[1]); return { a: x < y ? x : y, b: x < y ? y : x, weight: Number(row[2]) }
  })
}
function resources(state: GameState) {
  expect(state.operations.mode).toBe('managed'); expect(state.placement.facilities).toEqual([])
  expect(state.construction.projects).toEqual([]); expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
  expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); expect(state.technology.projects).toHaveLength(1)
  expect(state.technology.projects[0]).toMatchObject({ id: 'studio-88c92bc3-r01:research:synchronized-sound',
    laboratoryFacilityId: 'studio-88c92bc3-r01:laboratory:0', status: 'completed', completedWeek: 276 })
  const expected: Record<string, unknown>[] = state.technology.projects.map(research => ({
    key: `facility:${research.laboratoryFacilityId}`, facilitySlotKey: null, kind: 'facility', facilityId: research.laboratoryFacilityId,
    slot: null, capability: null, owner: 'research', ownerId: research.id, research }))
  for (const w of state.operations.workflows) {
    for (const reservation of w.reservations) expected.push({ key: `facility:${reservation.facilityId}:${reservation.slot}`,
      facilitySlotKey: `${reservation.facilityId}:${reservation.slot}`, kind: 'facility', facilityId: reservation.facilityId,
      slot: reservation.slot, capability: reservation.capability, owner: 'production', ownerId: w.productionId, phase: w.phase, reservation })
    if (w.shootingTask !== null) expected.push({ key: `facility:${w.shootingTask.soundstageFacilityId}`, facilitySlotKey: null,
      kind: 'facility', facilityId: w.shootingTask.soundstageFacilityId, slot: null, capability: null,
      owner: 'shootingTask', ownerId: w.productionId, task: w.shootingTask })
  }
  expect(state.sets).toHaveLength(2)
  for (const set of state.sets) {
    expect(set.status).toBe('standing')
    expected.push({ key: `mount:${set.mountedOn}`, facilitySlotKey: null, kind: 'mount', facilityId: set.mountedOn,
      slot: null, capability: null, owner: 'set', ownerId: set.id, set })
  }
  for (const w of state.operations.workflows) if (w.bindings.setId !== null && w.reservations.some(r => r.capability === 'soundstage')) {
    expected.push({ key: `set:${w.bindings.setId}`, facilitySlotKey: null, kind: 'set', facilityId: w.bindings.stageFacilityId ?? '',
      slot: null, capability: null, owner: 'production', ownerId: w.productionId, setId: w.bindings.setId })
  }
  const before = stable(state), claims = resourceClaimsOf(occupiedResourceSlots(state))
  expect(claims).toEqual(expected); expect(stable(state)).toBe(before)
  expect(state.operations.facilities.map(row => [row.id, row.capability, row.capacity])).toEqual([
    ['facility-development-casting', 'development-casting', 2], ['facility-post-building', 'post', 2],
    ['facility-scenery-shop', 'set-scenery', 2], ['facility-soundstage-07', 'soundstage', 1], ['facility-soundstage-12', 'soundstage', 1] ])
  const free = (['development-casting', 'soundstage', 'set-scenery', 'post'] as const).map(capability => ({ capability,
    slots: state.operations.facilities.filter(f => f.capability === capability).flatMap(f => Array.from({ length: f.capacity }, (_, slot) => ({ facilityId: f.id, slot }))
      .filter(x => !expected.some(c => c.kind === 'facility' && c.facilityId === x.facilityId && (c.slot === null || c.slot === x.slot)))) }))
  return { claims: clone(claims), expected, free, ownerRoots: { operations: state.operations, technology: state.technology,
    placement: state.placement, construction: state.construction, casting: state.castingSessions, development: state.scriptDevelopment, sets: state.sets } }
}
function setupFacts(state: GameState) {
  assert.ok(initial); expect(state.studio.activeProductions.map(row => row.id)).toEqual(IDS)
  const geometry = IDS.map((id, index) => {
    const p = production(state, id), w = workflow(state, id), stage = index === 0 ? 'facility-soundstage-07' : 'facility-soundstage-12'
    expect(p).toMatchObject({ conceptId: index === 0 ? 'c-00' : 'c-01', directorId: DIRECTORS[index], cast: index === 0 ? CAST : OTHER_CAST,
      writerId: index === 0 ? 'authored-0001' : 't-wri-02', craftIds: [index === 0 ? 'authored-0002' : 't-cra-02'], startTick: 0, remainingTicks: 5 })
    expect(w).toMatchObject({ phase: 'shooting', blocker: null, setup: null,
      shootingTask: { id: `shooting:${id}`, status: 'unassigned', directorId: DIRECTORS[index], soundstageFacilityId: stage },
      bindings: { requiresSetBinding: true, stageFacilityId: stage, setId: `set-${index}`, heldSinceWeek: 2, lockedNovelty: 1, lockedUplift: index === 0 ? 5.7 : 4.7 } })
    expect(w.reservations).toEqual([
      { capability: 'soundstage', facilityId: stage, phase: 'shooting', productionId: id, slot: 0 },
      { capability: 'set-scenery', facilityId: 'facility-scenery-shop', phase: 'shooting', productionId: id, slot: index } ])
    expect(state.firstTakes.filter(t => t.studioId === issuer(state) && t.productionId === id)).toEqual([])
    expect(state.technology.productions.find(t => t.studioId === issuer(state) && t.productionId === id))
      .toEqual({ productionId: id, studioId: issuer(state), method: 'silent', adoptionId: null, lockedWeek: 3 })
    const from = facilityBodyCentre(state, 'facility-scenery-shop'), to = facilityBodyCentre(state, stage); assert.ok(from && to)
    const distance = Math.abs(to.gx - from.gx) + Math.abs(to.gy - from.gy), travelWeeks = sceneryLoadInWeeksForDistance(distance)
    expect(from).toEqual({ gx: 19, gy: 18 }); expect(to).toEqual({ gx: 18, gy: index === 0 ? 3 : 10 })
    expect(distance).toBe(index === 0 ? 16 : 9); expect(312 - w.bindings.heldSinceWeek!).toBeGreaterThanOrEqual(travelWeeks)
    return { production: clone(p), workflow: clone(w), from, to, distance, travelWeeks, calledWeek: w.bindings.heldSinceWeek }
  })
  for (const pair of pairs()) expect(state.relationships.filter(e => e.a === pair.a && e.b === pair.b)).toEqual([])
  const resource = resources(state); expect(resource.claims).toHaveLength(11)
  return { geometry, resource, people: lockedPeople(state), property: clone(state.property), placement: clone(state.placement), relationships: state.relationships }
}
function action(state: GameState, a: Action, verify: (next: GameState) => void): GameState {
  assert.ok(count.actionAttempts < 5)
  const input = clone(state), argument = clone(a), before = bytes(input), request = stable(argument), rng = clone(input.rngState)
  const operation = { action: clone(a), week: state.market.tick, accepted: false }; operations.push(operation)
  count.actionAttempts++; emit('ACTION-ATTEMPT', operation)
  const next = core.applyActions(input, [argument])
  expect(bytes(input)).toBe(before); expect(stable(argument)).toBe(request); expect(input.rngState).toEqual(rng)
  expect(next.market.tick).toBe(state.market.tick); verify(next); admitted(next)
  count.actionsAccepted++; operation.accepted = true
  emit('ACTION-ACCEPTED', { ...operation, productions: next.studio.activeProductions, workflows: next.operations.workflows,
    cash: next.studio.cash, ledgerAppend: next.ledger.slice(state.ledger.length), events: next.studioEvents,
    resource: resources(next), stateBytes: Buffer.byteLength(bytes(next)), stateSha256: sha(bytes(next)) })
  return next
}
function scheduled312(): GameState {
  return memo('two-scheduled312', () => {
    let state = input312()
    for (const [index, id] of IDS.entries()) {
      for (const kind of ['assignShootingDirector', 'scheduleShootingTake'] as const) {
        const prior = state, w = workflow(prior, id); assert.ok(w.shootingTask)
        const assigned = kind === 'assignShootingDirector', status = assigned ? 'ready' : 'scheduled'
        const a: Action = kind === 'assignShootingDirector' ? { kind: 'assignShootingDirector', productionId: id, directorId: DIRECTORS[index]! }
          : { kind: 'scheduleShootingTake', productionId: id }
        state = action(prior, a, next => {
          const expected: GameState = { ...prior, operations: { ...prior.operations,
            workflows: prior.operations.workflows.map(row => row.productionId === id ? { ...row, blocker: null,
              shootingTask: { ...w.shootingTask!, status } } : row) },
            studioEvents: assigned ? { nextSeq: prior.studioEvents.nextSeq + 1, rows: [...prior.studioEvents.rows,
              { seq: prior.studioEvents.nextSeq, week: 312, kind: 'sceneryArrived', productionId: id }] } : prior.studioEvents }
          expect(next).toEqual(expected); expect(workflow(next, id).shootingTask?.status).toBe(status)
        })
      }
    }
    lockedPeople(state); expect(state.market.tick).toBe(312); return state
  })
}
function ownerFacts(state: GameState) {
  return owners(state).flatMap(owner => owner.productions.map(p => {
    const concept = owner.concepts.find(row => row.id === p.conceptId); assert.ok(concept)
    return { studioId: owner.studioId, production: clone(p), concept: clone(concept), mode: owner.development.mode,
      linked: clone(owner.development.projects.filter(row => row.productionId === p.id)) }
  }))
}
function authority(state: GameState): void {
  assert.ok(initial); expect(state.firstTakes.slice(0, 111)).toEqual(oldTakes)
  expect(state.firstTakeSubjects).toEqual({ version: 1, cutoverOrdinal: 111, facts: expectedFacts })
  for (const old of oldRoots) {
    const found = state.promises.filter(row => row.promiseId === old.promiseId); expect(found).toHaveLength(1)
    expect(rootAuthority(found[0]!)).toEqual(rootAuthority(old))
  }
  expect(state.scriptDevelopment).toEqual({ mode: 'legacy', projects: [] }); expect(state.castingSessions).toEqual({ mode: 'legacy', sessions: [] })
  expect(state.productionQueue).toEqual([]); expect(state.releaseAuthority).toEqual({ commitments: [] })
  expect(state.contracts).toEqual(initial.contracts); expect(state.studio.releasedFilms).toEqual(initial.studio.releasedFilms)
  for (const id of IDS) expect(state.technology.productions.find(r => r.studioId === issuer(state) && r.productionId === id))
    .toEqual(initial.technology.productions.find(r => r.studioId === issuer(initial!) && r.productionId === id))
}
function firstPairs(state: GameState) {
  assert.ok(initial)
  return pairs().map(pair => {
    expect(initial!.relationships.filter(e => e.a === pair.a && e.b === pair.b)).toEqual([])
    const rows = state.relationships.filter(e => e.a === pair.a && e.b === pair.b); expect(rows).toHaveLength(1)
    const edge = rows[0]!
    expect(edge).toEqual({ edgeId: edge.edgeId, a: pair.a, b: pair.b, closeness: 50 + pair.weight,
      firstSharedWeek: 313, lastEventWeek: 313, sharedProductions: 1, sharedSuccesses: 0, sharedFailures: 0,
      sharedCancellations: 0, sharedCompetitions: 0, peakTier: pair.weight === 6 ? 'Colleagues' : 'Acquaintances', peakTierWeek: 313,
      recent: [{ kind: 'sharedProduction', week: 313, ref: PROD, delta: pair.weight }] })
    expect(edge.a).not.toBe('authored-0001'); expect(edge.b).not.toBe('authored-0001')
    expect(edge.a).not.toBe('authored-0002'); expect(edge.b).not.toBe('authored-0002')
    return { pair, edge: clone(edge) }
  })
}
function advance(state: GameState): GameState {
  const input = clone(state), prior = bytes(input), beforeOwners = ownerFacts(input), from = state.market.tick
  assert.equal(permit, undefined); permit = { used: false }
  let next: GameState
  try { next = tickOwner.tick(input) } finally { permit = undefined }
  expect(bytes(input)).toBe(prior); expect(next.firstTakes.slice(0, state.firstTakes.length)).toEqual(state.firstTakes)
  const afterOwners = ownerFacts(next), added = next.firstTakes.slice(state.firstTakes.length).map(receipt => {
    const owner = beforeOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
      ?? afterOwners.find(row => row.studioId === receipt.studioId && row.production.id === receipt.productionId)
    assert.ok(owner, 'every new receipt requires its actual owner/production/concept')
    expect(receipt.week).toBe(from + 1); expect(receipt.directorId).toBe(owner.production.directorId); expect(receipt.cast).toEqual(owner.production.cast)
    expect(owner.linked.length).toBeLessThanOrEqual(1); if (owner.mode === 'managed') expect(owner.linked).toHaveLength(1)
    for (const project of owner.linked) expect(project.conceptId).toBe(owner.concept.id)
    const subject: FirstTakeSubject = { eventId: receipt.eventId, conceptId: owner.concept.id, genre: owner.concept.genre,
      scriptProjectId: owner.linked[0]?.id ?? null }
    return { receipt: clone(receipt), subject, owner }
  })
  expectedFacts = [...expectedFacts, ...added.map(row => row.subject)]
  emit('ADVANCE', { from, to: next.market.tick, defaultDevelopFalse: true, added, actualSubjects: next.firstTakeSubjects,
    productions: next.studio.activeProductions, workflows: next.operations.workflows, eventsAppend: next.studioEvents.rows.slice(state.studioEvents.rows.length),
    resource: resources(next), relationshipsBefore: state.relationships, relationshipsAfter: next.relationships,
    lifecycleBefore: state.careerLifecycle, lifecycleAfter: next.careerLifecycle, employmentBefore: state.hollywood!.employment,
    employmentAfter: next.hollywood!.employment, oldPromiseRows: oldRoots.map(old => next.promises.find(row => row.promiseId === old.promiseId)),
    allPromises: next.promises, proposals: next.talentMarket.proposals, cashBefore: state.studio.cash, cashAfter: next.studio.cash,
    ledgerAppend: next.ledger.slice(state.ledger.length), releasedPlayer: next.studio.releasedFilms, industryFilms: next.hollywood!.films })
  authority(next); lockedPeople(next); admitted(next)
  for (const id of IDS) {
    const p = production(next, id), priorProduction = production(state, id), w = workflow(next, id)
    expect(p).toEqual({ ...priorProduction, remainingTicks: from === 312 ? 4 : 3 })
    expect(w.blocker).toBeNull()
    if (from === 312) {
      expect(w).toEqual({ ...workflow(state, id), shootingTask: { ...workflow(state, id).shootingTask!, status: 'completed' } })
      const own = added.filter(row => row.receipt.studioId === issuer(next) && row.receipt.productionId === id)
      expect(own).toHaveLength(1); const index = id === PROD ? 0 : 1
      expect(own[0]!.receipt).toMatchObject({ week: 313, directorId: DIRECTORS[index], cast: index === 0 ? CAST : OTHER_CAST })
      expect(own[0]!.subject).toEqual({ eventId: own[0]!.receipt.eventId, conceptId: index === 0 ? 'c-00' : 'c-01',
        genre: index === 0 ? 'drama' : 'comedy', scriptProjectId: null })
    } else {
      const index = id === PROD ? 0 : 1, oldWorkflow = workflow(state, id)
      expect(w).toMatchObject({ phase: 'postProduction', shootingTask: null, setup: null,
        bindings: { ...oldWorkflow.bindings, stageFacilityId: null, heldSinceWeek: null } })
      expect(w.reservations).toEqual([{ capability: 'post', facilityId: 'facility-post-building', phase: 'postProduction', productionId: id, slot: index }])
      const newEvents = next.studioEvents.rows.slice(state.studioEvents.rows.length)
      expect(newEvents.filter(row => row.kind === 'wrapped' && row.productionId === id)).toEqual([
        { kind: 'wrapped', productionId: id, stageFacilityId: index === 0 ? 'facility-soundstage-07' : 'facility-soundstage-12',
          setId: `set-${index}`, seq: newEvents.find(row => row.kind === 'wrapped' && row.productionId === id)!.seq, week: 313 } ])
      const phase = newEvents.filter(row => row.kind === 'phaseEntered' && row.productionId === id)
      expect(phase).toHaveLength(1); expect(phase[0]).toMatchObject({ week: 313, phase: 'postProduction' })
      const transition = newEvents.filter(row => (row.kind === 'reservationReleased' || row.kind === 'reservationGranted') && row.ownerId === id)
      expect(transition).toHaveLength(3)
      expect(transition).toEqual([
        ...oldWorkflow.reservations.map((r, i) => ({ kind: 'reservationReleased', ownerId: id, resourceKey: `${r.facilityId}:${r.slot}`, week: 313, seq: transition[i]!.seq })),
        { kind: 'reservationGranted', ownerId: id, resourceKey: `facility-post-building:${index}`, week: 313, seq: transition[2]!.seq } ])
    }
  }
  expect(next.sets).toEqual(from === 312 ? state.sets : state.sets.map(row => ({ ...row, condition: 91 })))
  for (const row of next.sets) expect(row.novelty).toBe(1)
  firstPairs(next); return next
}
function taken313(): GameState { return memo('two-takes313', () => advance(scheduled312())) }
function post314(): GameState {
  return memo('two-post314', () => {
    const state = advance(taken313()); expect(state.market.tick).toBe(314)
    expect(resources(state).claims).toHaveLength(5); return state
  })
}
function candidates(state: GameState) {
  const used = [...new Set([...state.studio.activeProductions.map(p => p.conceptId), ...state.studio.releasedFilms.map(p => p.conceptId)])]
  const crime = state.concepts.filter(row => row.genre === 'crime'), unused = crime.filter(row => !used.includes(row.id))
  expect(unused.map(row => row.id)).toEqual(['c-04', 'c-05', 'c-08', 'c-16', 'c-20']); expect(unused).toEqual(crime)
  for (const p of state.studio.activeProductions) expect(['drama', 'comedy']).toContain(state.concepts.find(row => row.id === p.conceptId)?.genre)
  const clocks = unused.map(row => ({ conceptId: row.id, freshWeek: 314, takeWeek: 319, dueWeekExclusive: 327, slack: 8 }))
  return { allCrime: clone(crime), unused: clone(unused), usedConceptIds: used, clocks }
}
function request(state: GameState): PromiseDraft {
  return { family: 'PREFERRED_GENRE_OPPORTUNITY', issuerStudioId: issuer(state), beneficiaryPersonId: PERSON,
    predicate: { kind: 'genreOpportunity', count: 1, seatClass: 'allCast', genre: 'crime' },
    startWeek: 314, termWeeks: 52, windowStartWeek: 314, dueWeekExclusive: 327 }
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
  expect(rows.length).toBeGreaterThanOrEqual(69); expect(selected).toEqual([])
  return { from, rawRoots: clone(state.promises), proposals: clone(state.talentMarket.proposals), attachedIds, rows, selected: clone(selected) }
}
function quote(state: GameState, cancelled: boolean): void {
  expect(state.market.tick).toBe(314); authority(state); admitted(state)
  const before = bytes(state), rng = clone(state.rngState), draft = request(state), argument = stable(draft)
  const person = queryPerson(state), stock = candidates(state), resource = resources(state), census = union(state, draft)
  expect(resource.claims).toHaveLength(cancelled ? 4 : 5)
  expect(resource.free).toEqual([
    { capability: 'development-casting', slots: [{ facilityId: 'facility-development-casting', slot: 0 }, { facilityId: 'facility-development-casting', slot: 1 }] },
    { capability: 'soundstage', slots: [{ facilityId: 'facility-soundstage-07', slot: 0 }, { facilityId: 'facility-soundstage-12', slot: 0 }] },
    { capability: 'set-scenery', slots: [{ facilityId: 'facility-scenery-shop', slot: 0 }, { facilityId: 'facility-scenery-shop', slot: 1 }] },
    { capability: 'post', slots: cancelled ? [{ facilityId: 'facility-post-building', slot: 0 }] : [] } ])
  assert.ok(count.quotes < 2)
  const spy = vi.spyOn(opportunityOwner, 'opportunityReservations')
  let receipt: ReturnType<typeof core.promiseFeasibility>, selected: unknown
  try {
    count.quotes++; receipt = core.promiseFeasibility(state, draft, 314); count.returnedQuotes++
    expect(spy.mock.calls).toHaveLength(1); const args = spy.mock.calls[0]!, result = spy.mock.results[0]!
    expect(args[0]).toBe(state); expect(args[1]).toBe(draft); expect(args[2]).toBe(census.from)
    expect(result.type).toBe('return'); selected = clone(result.value)
  } finally { count.selectorCalls += spy.mock.calls.length; spy.mockRestore() }
  quotes.push({ request: clone(draft), receipt: clone(receipt) })
  emit('QUOTE', { ordinal: count.quotes, cancelled, actualWeek: 314, request: draft, requestBytes: argument, receipt,
    census, actualSelection: selected, person, stock, resource, inputBytes: Buffer.byteLength(before), inputSha256: sha(before), rng })
  expect(selected).toEqual(census.selected); expect(bytes(state)).toBe(before); expect(stable(draft)).toBe(argument); expect(state.rngState).toEqual(rng)
  expect(receipt).toMatchObject({ rulesVersion: 7, week: 314, classification: cancelled ? 'REASONABLY_ACHIEVABLE' : 'FRAGILE',
    bottleneck: cancelled ? null : 'existing post capacity is not available for this opportunity' })
}
function firstQuote314(): GameState { return memo('first-quote314', () => { const state = post314(); quote(state, false); return state }) }
function conduct(state: GameState) {
  const before = bytes(state), studioId = issuer(state), week = state.market.tick
  const live = [...new Set([...state.studio.activeProductions.map(p => p.id), ...state.studio.releasedFilms.map(f => f.productionId),
    ...state.hollywood!.businesses.flatMap(b => b.productions.map(p => p.id)), ...state.hollywood!.films.map(f => f.filmId)])]
  const boundary = state.studioHistory.recordingStartedWeek, horizon = week - 260
  const rows = [null, DIRECTOR, CAST.lead, CAST.antagonist, CAST.support, PERSON].map(personId => {
    const drivers: TrustDriver[] = []
    const promiseRows = state.promises.filter(p => p.issuerStudioId === studioId && (personId === null || p.beneficiaryPersonId === personId))
    const employmentRows = state.hollywood!.employment.filter(r => r.studioId === studioId && (personId === null || r.terms.talentId === personId))
    const takeRows = state.firstTakes.filter(t => t.studioId === studioId && (personId === null || t.directorId === personId || Object.values(t.cast).includes(personId)))
    const kept = (at: number): boolean => at >= boundary && at > horizon
    for (const p of promiseRows) if (p.outcomeWeek !== null && kept(p.outcomeWeek)) {
      if (p.outcome === 'SATISFIED') drivers.push({ kind: 'promiseKept', week: p.outcomeWeek, positive: true, reason: 'kept a promise' })
      if (p.outcome === 'BROKEN') drivers.push({ kind: 'promiseBroken', week: p.outcomeWeek, positive: false, reason: 'broke a promise' })
    }
    const employmentCensus = employmentRows.map(r => ({ row: r, terminated: state.hollywood!.receipts.some(x => x.kind === 'employment'
      && x.contractId === r.contractId && x.toStudioId === null && x.reason === 'termination') }))
    for (const { row, terminated } of employmentCensus) if (row.endedWeek !== null && kept(row.endedWeek)) {
      if (terminated) drivers.push({ kind: 'terminatedEarly', week: row.endedWeek, positive: false, reason: 'ended a contract early' })
      else if (row.endedWeek >= row.terms.endWeekExclusive) drivers.push({ kind: 'ranToEnd', week: row.endedWeek, positive: true, reason: 'ran a contract to its end' })
    }
    const takeCensus = takeRows.map(t => ({ receipt: t, retainedLiveOrReleased: live.includes(t.productionId), insideHorizon: kept(t.week) }))
    for (const t of takeCensus) if (!t.retainedLiveOrReleased && t.insideHorizon) drivers.push({
      kind: 'cancelledAfterFirstTake', week: t.receipt.week, positive: false, reason: 'cancelled a picture after filming began' })
    drivers.sort((a, b) => a.week === b.week ? a.kind.localeCompare(b.kind) : b.week - a.week)
    const actual = trustDrivers(state, personId, studioId, week); expect(actual).toEqual(drivers)
    return { personId, promiseRows: clone(promiseRows), employmentCensus: clone(employmentCensus), takeCensus: clone(takeCensus),
      expectedDrivers: drivers, actualDrivers: clone(actual) }
  })
  const aggregate = rows[0]!.expectedDrivers
  const label = (drivers: readonly TrustDriver[]) => {
    const positive = drivers.filter(d => d.positive).length, negative = drivers.length - positive
    return negative === 0 ? positive > 0 ? 'Reliable' : 'Mixed record' : negative >= 2 && negative > positive ? 'Distrusted' : 'Mixed record'
  }
  const aggregateDescriptor = studioTrustDescriptor(state, studioId, week)
  expect(aggregateDescriptor).toEqual({ label: label(aggregate), drivers: aggregate.slice(0, 3), scope: 'studio' })
  const descriptors = rows.slice(1).map(row => {
    assert.ok(row.personId !== null)
    const actual = trustDescriptor(state, row.personId, studioId, week), own = row.expectedDrivers
    expect(actual).toEqual(own.length ? { label: label(own), drivers: own.slice(0, 3), scope: 'person' } : aggregateDescriptor)
    return { personId: row.personId, actual }
  })
  const queried = rows.find(row => row.personId === PERSON)!; expect(queried.promiseRows).toEqual([])
  expect(queried.employmentCensus).toEqual([]); expect(queried.takeCensus).toEqual([]); expect(queried.actualDrivers).toEqual([])
  expect(descriptors.find(row => row.personId === PERSON)!.actual).toEqual(aggregateDescriptor)
  expect(bytes(state)).toBe(before)
  return { actualWeek: week, studioId, boundary, horizon, liveOrReleasedIds: live, rows, aggregateDescriptor, descriptors }
}
function cancelled314(): GameState {
  return memo('cancelled314', () => {
    const state = firstQuote314(), take = state.firstTakes.find(t => t.studioId === issuer(state) && t.productionId === PROD); assert.ok(take)
    expect(take).toMatchObject({ week: 313, directorId: DIRECTOR, cast: CAST })
    const positive = firstPairs(state), beforeConduct = conduct(state), beforeResource = resources(state)
    const expectedRelationships = state.relationships.map(edge => {
      if (!positive.some(row => row.edge.edgeId === edge.edgeId)) return edge
      return { ...edge, closeness: edge.closeness - 2, lastEventWeek: 314, sharedCancellations: edge.sharedCancellations + 1,
        recent: [...edge.recent, { kind: 'cancelledAfterFirstTake' as const, week: 314, ref: PROD, delta: -2 }] }
    })
    const next = action(state, { kind: 'cancel', productionId: PROD }, result => {
      expect(result).toEqual({ ...state, studio: { ...state.studio, activeProductions: state.studio.activeProductions.filter(p => p.id !== PROD) },
        operations: { ...state.operations, workflows: state.operations.workflows.filter(w => w.productionId !== PROD) }, relationships: expectedRelationships })
      authority(result); expect(result.promises).toEqual(state.promises); expect(result.firstTakes).toEqual(state.firstTakes)
      expect(result.firstTakeSubjects).toEqual(state.firstTakeSubjects); expect(result.careerLifecycle).toEqual(state.careerLifecycle)
      expect(result.technology).toEqual(state.technology); expect(result.studioEvents).toEqual(state.studioEvents)
      expect(result.studio.cash).toBe(state.studio.cash); expect(result.ledger).toEqual(state.ledger)
      expect(production(result, OTHER)).toEqual(production(state, OTHER)); expect(workflow(result, OTHER)).toEqual(workflow(state, OTHER))
      expect(resources(result).claims).toHaveLength(4)
    })
    const changed = positive.map(row => {
      const edge = next.relationships.find(e => e.edgeId === row.edge.edgeId); assert.ok(edge)
      expect(edge.closeness).toBe(48 + row.pair.weight); expect(edge.sharedProductions).toBe(1); expect(edge.sharedCancellations).toBe(1)
      expect(edge.peakTier).toBe(row.edge.peakTier); expect(edge.peakTierWeek).toBe(313)
      expect(edge.recent).toEqual([...row.edge.recent, { kind: 'cancelledAfterFirstTake', week: 314, ref: PROD, delta: -2 }])
      return { pair: row.pair, before: row.edge, after: clone(edge) }
    })
    expect(changed).toHaveLength(6)
    const afterConduct = conduct(next), driver: TrustDriver = { kind: 'cancelledAfterFirstTake', week: 313, positive: false,
      reason: 'cancelled a picture after filming began' }
    for (const before of beforeConduct.rows) {
      const after = afterConduct.rows.find(r => r.personId === before.personId)!
      const expected = before.personId === PERSON ? before.actualDrivers : [...before.actualDrivers, driver]
        .sort((a, b) => a.week === b.week ? a.kind.localeCompare(b.kind) : b.week - a.week)
      expect(after.actualDrivers).toEqual(expected)
    }
    lockedPeople(next)
    emit('CANCEL-CONDUCT', { actualWeek: 314, retainedTake: take, changes: changed, relationshipsBefore: state.relationships,
      relationshipsAfter: next.relationships, beforeConduct, afterConduct, resourceBefore: beforeResource, resourceAfter: resources(next),
      retainedLifecycle: next.careerLifecycle, retainedTechnology: next.technology, promises: next.promises,
      firstTakes: next.firstTakes, firstTakeSubjects: next.firstTakeSubjects })
    return next
  })
}
function secondQuote314(): GameState { return memo('second-quote314', () => { const state = cancelled314(); quote(state, true); return state }) }

describe('P4/P5 actual post capacity after two completed shooting phases', () => {
  it('Q25 isolates post occupancy and preserves actual take authority through one public cancellation', () => {
    const before = firstQuote314(), after = secondQuote314()
    expect(quotes).toHaveLength(2); expect(stable(quotes[0]!.request)).toBe(stable(quotes[1]!.request))
    expect(candidates(after).unused).toEqual(candidates(before).unused); expect(candidates(after).clocks).toEqual(candidates(before).clocks)
    expect(union(after, request(after))).toEqual(union(before, request(before)))
    const priorPerson = queryPerson(before), nextPerson = queryPerson(after)
    expect(nextPerson.talent).toEqual(priorPerson.talent); expect(nextPerson.provenance).toEqual(priorPerson.provenance)
    expect(nextPerson.current).toEqual(priorPerson.current); expect(nextPerson.requestedActor).toEqual(priorPerson.requestedActor)
    expect(nextPerson.employment).toEqual(priorPerson.employment)
    expect(resources(after).free.filter(r => r.capability !== 'post')).toEqual(resources(before).free.filter(r => r.capability !== 'post'))
    authority(after); admitted(after); expect(count).toEqual({ attempted: 2, reserved: 2, invoked: 2, completed: 2, outside: 0,
      actionAttempts: 5, actionsAccepted: 5, quotes: 2, returnedQuotes: 2, selectorCalls: 2 })
    expect(operations.map(row => [row.week, row.action.kind, row.accepted])).toEqual([
      [312, 'assignShootingDirector', true], [312, 'scheduleShootingTake', true], [312, 'assignShootingDirector', true],
      [312, 'scheduleShootingTake', true], [314, 'cancel', true] ])
    expect([...cache].every(([, row]) => row.ok)).toBe(true)
    emit('COMPLETE', { actualWeek: 314, quotes, counters: count, subjectRoot: after.firstTakeSubjects, allTakes: after.firstTakes,
      retainedOldTakeCount: oldTakes.length, originalPromiseAuthorities: oldRoots.map(rootAuthority), currentPromises: after.promises,
      remainingProduction: production(after, OTHER), remainingWorkflow: workflow(after, OTHER), sets: after.sets,
      finishingPeople: lockedPeople(after), noRetirementCompletionTick: true })
  }, TIMEOUT)
})
