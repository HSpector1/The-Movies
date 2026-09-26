// 949: read-only controlled diagnosis of948; original scenario/oracle retained.
// Three extra independent ticks from pre207 isolate options and serialization.
// No artifact-writing branch exists; --write is refused. Parent owns execution.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { applyActions } from '../../../../../src/core/actions.ts'
import { activeContract } from '../../../../../src/core/employment.ts'
import { retirementRecordFor } from '../../../../../src/core/careerLifecycle.ts'
import { careerIdentity, expectedPotentialRange, expectedPotentialTier } from '../../../../../src/core/talentSummary.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV37 } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import type { Action, CreativeRole, CustomTalentInput, Discipline, GameState } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = '1f44aa505c0d677430451ab5fcacaf5e0ce205d6'
const PRODUCTION_BASE = '9afae8874486fbb20dc5d373526698aacbec2114'
const SEED = 'p14c3-t0-public-actor-careers-01'
const OUTPUT = 'tests/fixtures/p14/genuine-v37-c3-corpus'
const PRODUCER = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/949-c3-t0-producer.ts'
const root = new URL('../../../../../', import.meta.url)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
// Counts every differing leaf while printing at most32 bounded examples per comparison.
// Object.is distinguishes -0 from0 in the PRE-serialization comparison; no cause is assumed.
function differences(left: unknown, right: unknown) {
  const first: { path: string; left: unknown; right: unknown }[] = []
  let count = 0
  const kind = (value: unknown): string => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
  const summary = (value: unknown): unknown => {
    if (value === undefined) return { special: 'undefined' }
    if (typeof value === 'number' && Object.is(value, -0)) return { special: '-0' }
    if (typeof value === 'number' && !Number.isFinite(value)) return { special: String(value) }
    if (typeof value === 'string' && value.length > 160) return { prefix: value.slice(0, 160), length: value.length, sha256: sha(value) }
    if (Array.isArray(value)) return { type: 'array', length: value.length }
    if (value !== null && typeof value === 'object') return { type: 'object', keys: Object.keys(value).sort().slice(0, 16), keyCount: Object.keys(value).length }
    return value
  }
  const add = (path: string, a: unknown, b: unknown) => {
    count++
    if (first.length < 32) first.push({ path, left: summary(a), right: summary(b) })
  }
  const visit = (a: unknown, b: unknown, path: string): void => {
    if (Object.is(a, b)) return
    if (kind(a) !== kind(b) || a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
      add(path, a, b); return
    }
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) add(path + '.length', a.length, b.length)
      for (let i = 0; i < Math.max(a.length, b.length); i++) visit(a[i], b[i], path + '[' + i + ']')
      return
    }
    const aa = a as Record<string, unknown>, bb = b as Record<string, unknown>
    for (const key of [...new Set([...Object.keys(aa), ...Object.keys(bb)])].sort()) {
      const child = path + '[' + JSON.stringify(key) + ']'
      if (!Object.hasOwn(aa, key) || !Object.hasOwn(bb, key)) {
        add(child + (Object.hasOwn(aa, key) ? ' [missing-right-key]' : ' [missing-left-key]'), aa[key], bb[key])
      } else visit(aa[key], bb[key], child)
    }
  }
  visit(left, right, '$')
  return { count, first, omitted: Math.max(0, count - first.length) }
}
// Only plain saved objects/arrays are admitted. Property insertion order, array
// order, undefined and every scalar other than -0 are preserved by this clone.
function cloneNormalizingOnlyNegativeZero<T>(value: T): { value: T; changed: number } {
  let changed = 0
  const clone = (item: unknown): unknown => {
    if (typeof item === 'number' && Object.is(item, -0)) { changed++; return 0 }
    if (Array.isArray(item)) return item.map(clone)
    if (item !== null && typeof item === 'object') {
      assert.equal(Object.getPrototypeOf(item), Object.prototype, 'diagnostic clone requires plain saved objects')
      return Object.fromEntries(Object.entries(item).map(([key, child]) => [key, clone(child)]))
    }
    return item
  }
  return { value: clone(value) as T, changed }
}
function fingerprints(value: unknown) {
  const native = JSON.stringify(value), canonical = canonicalJson(value)
  assert.equal(typeof native, 'string')
  return { nativeJsonSha256: sha(native), nativeJsonBytes: Buffer.byteLength(native),
    canonicalJsonSha256: sha(canonical), canonicalJsonBytes: Buffer.byteLength(canonical) }
}
// Distinguish key insertion order from structural values. Different key sets are
// counted separately and never mislabelled as order-only. Traverse the full tree.
function keyOrderDifferences(left: unknown, right: unknown) {
  const first: { path: string; leftKeys: string[]; rightKeys: string[]; keyCount: number }[] = []
  let count = 0, differentKeySets = 0
  const visit = (a: unknown, b: unknown, path: string): void => {
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return
    if (Array.isArray(a) || Array.isArray(b)) {
      if (Array.isArray(a) && Array.isArray(b)) for (let i = 0; i < Math.min(a.length, b.length); i++) visit(a[i], b[i], path + '[' + i + ']')
      return
    }
    const aa = a as Record<string, unknown>, bb = b as Record<string, unknown>
    const ak = Object.keys(aa), bk = Object.keys(bb)
    if (JSON.stringify([...ak].sort()) !== JSON.stringify([...bk].sort())) differentKeySets++
    else if (JSON.stringify(ak) !== JSON.stringify(bk)) {
      count++
      if (first.length < 32) first.push({ path, leftKeys: ak.slice(0, 16), rightKeys: bk.slice(0, 16), keyCount: ak.length })
    }
    for (const key of ak) if (Object.hasOwn(bb, key)) visit(aa[key], bb[key], path + '[' + JSON.stringify(key) + ']')
  }
  visit(left, right, '$')
  return { count, differentKeySets, first, omitted: Math.max(0, count - first.length), maximumDisplayedKeysPerObject: 16 }
}
// These are the nested raw-object owners consumed by feasibilityInputs, not a
// copied private digest formula. Array membership matches its source selection.
function rawFeasibilityOwners(world: GameState): Record<string, unknown> {
  const owners: Record<string, unknown> = {}
  const add = (id: string, productions: GameState['studio']['activeProductions'],
    operations: GameState['operations'], development: GameState['scriptDevelopment'], queue: unknown) => {
    owners[id + '/production-casts'] = productions.map(p => ({ productionId: p.id, cast: p.cast }))
    owners[id + '/workflows'] = operations.workflows
    owners[id + '/unproduced-script-reservations'] = development.projects.filter(p => p.status !== 'produced')
      .map(p => ({ projectId: p.id, reservation: p.reservation }))
    owners[id + '/production-queue'] = queue
  }
  add(world.hollywood?.playerStudioId ?? 'player', world.studio.activeProductions, world.operations, world.scriptDevelopment, world.productionQueue)
  for (const business of world.hollywood?.businesses ?? []) add(business.studioId, business.productions, business.operations, business.development, [])
  return owners
}
function changedOwnerEvidence(left: GameState, right: GameState) {
  const a = rawFeasibilityOwners(left), b = rawFeasibilityOwners(right)
  const changed = Object.keys(a).filter(key => JSON.stringify(a[key]) !== JSON.stringify(b[key]))
  return { count: changed.length, first: changed.slice(0, 16).map(owner => ({ owner,
    left: fingerprints(a[owner]), right: fingerprints(b[owner]),
    values: differences(a[owner], b[owner]), keyOrder: keyOrderDifferences(a[owner], b[owner]) })),
    omitted: Math.max(0, changed.length - 16) }
}
const git = (...args: string[]): string => execFileSync('git', args, {
  cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
})
const consumed = ['src', 'bridge', 'ui', 'scripts', 'generated', 'tests']
const sourceIdentity = () => ({
  head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', PRODUCTION_BASE, '--', ...consumed)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...consumed).trim().split('\n').filter(Boolean).sort(),
})
const beforeSource = sourceIdentity(), producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
assert.equal(process.argv.includes('--write'), false, '949 is diagnostic only; no fixture-writing mode')
assert.equal(beforeSource.head, EXPECTED_HEAD)
assert.equal(beforeSource.diffSha256, sha(''), 'current production/tests/fixtures must equal qualified C.2-RM')
assert.deepEqual(beforeSource.untracked, [])
assert.equal(LIVE_SAVE_VERSION, 37)
assert.equal(PROJECTION_VERSION, 52)
assert.equal(PROTOCOL_VERSION, 4)
assert.equal(SCHEMA_ID, 'sha256:f036ccdd62c4ac2a700a27796631e1c4f8c85f9cccfb14ac6850083fb8dba5f2')
assert.equal(existsSync(new URL(OUTPUT, root)), false, 'never overwrite or clean an existing corpus')

const SIX = (value: number): number[] => [value, value, value, value, value, value]
function custom(name: string, role: CreativeRole, age: number, target?: 'directing' | 'writing'): CustomTalentInput {
  const primary: Record<CreativeRole, Discipline> = { actor: 'acting', director: 'directing', writer: 'writing', craft: 'craft', scientist: 'research' }
  const skills = { acting: SIX(20), writing: SIX(20), directing: SIX(20), craft: SIX(20), research: SIX(1) }
  skills[primary[role]] = SIX(75)
  if (target) skills[target] = SIX(80)
  return { name, role, age, actual: { warmth: 0, gravity: 0, physicality: 0.2 }, workEthic: 55, fame: 25, skills }
}
const authoredInputs = [
  custom('C3 Actor With Directing Aptitude', 'actor', 68, 'directing'),
  custom('C3 Actor With Writing Aptitude', 'actor', 68, 'writing'),
  custom('C3 Recorded Director', 'director', 40),
  custom('C3 Recorded Writer', 'writer', 40),
  custom('C3 Recorded Craft Lead', 'craft', 40),
  custom('C3 Supporting Actor', 'actor', 30),
]
const actionTrace: { week: number; action: Action }[] = []
let ticks = 0
function act(state: GameState, action: Action): GameState {
  actionTrace.push({ week: state.market.tick, action })
  return applyActions(state, [action])
}
function step(state: GameState): GameState {
  assert.ok(ticks < 209, 'bounded primary producer: at most209 real ticks')
  ticks++
  return tick(state)
}
function toWeek(state: GameState, week: number): GameState {
  assert.ok(week >= state.market.tick && week <= 209, 'never rewind or exceed final week209')
  while (state.market.tick < week) state = step(state)
  return state
}
function saveBytes(state: GameState): string {
  const raw = exportSave(makeSave(state))
  assert.equal(exportSave(importSave(raw)), raw, 'exact live-save canonical round trip')
  assert.equal(validateSaveV37(JSON.parse(raw)).state.market.tick, state.market.tick)
  return raw
}
const snapshots: { filename: string; raw: string; week: number; kind: 'save' | 'runtimeCheckpoint' }[] = []
function capture(label: string, state: GameState) {
  const raw = saveBytes(state)
  snapshots.push({ filename: `genuine-v37-c3-${label}.json.gz`, raw, week: state.market.tick, kind: 'save' })
  console.log(JSON.stringify({ phase: label, week: state.market.tick, rawSha256: sha(raw) }))
}

// Sole explicit economic bootstrap, matching the established funded-fixture convention.
// It supplies no film, skill, credit, employment or lifecycle history.
let state = p13aGeneratedStudio(SEED)
assert.equal(state.market.tick, 0)
const cashBeforeBootstrap = state.studio.cash, bootstrapCash = 30_000_000
const bootstrapDelta = bootstrapCash - cashBeforeBootstrap
state = { ...state, studio: { ...state.studio, cash: bootstrapCash }, ledger: [...state.ledger, {
  week: 0, kind: bootstrapDelta > 0 ? 'studioRevenue' : 'overhead', amount: bootstrapDelta,
  note: 'C3 T0 explicitly disclosed generated-fixture cash bootstrap; no simulated earned revenue',
}] }
const initialTalentCount = state.talent.length
const ids: string[] = []
for (const input of authoredInputs) {
  const beforeCount = state.talent.length
  state = act(state, { kind: 'createCustomTalent', talent: input })
  assert.equal(state.talent.length, beforeCount + 1)
  const person = state.talent.at(-1)!
  assert.equal(person.name, input.name)
  assert.equal(person.age, input.age)
  assert.ok(Object.values(person.workHistory).every(value => value === 0), 'creator supplies no work history')
  assert.equal(state.contracts.some(contract => contract.talentId === person.id), false, 'creation does not sign')
  ids.push(person.id)
  state = act(state, { kind: 'signContract', talentId: person.id, termWeeks: 208 })
  assert.equal(activeContract(state, person.id)?.endWeekExclusive, 208)
}
assert.equal(state.talent.length, initialTalentCount + authoredInputs.length)
const [directorActorId, writerActorId, directorId, writerId, craftId, supportId] = ids as [string, string, string, string, string, string]
const focusIds = [directorActorId, writerActorId]
const focusProvenance = state.talentProvenance.rows.filter(row => focusIds.includes(row.personId))
function target(personId: string, discipline: 'directing' | 'writing', world: GameState) {
  const person = world.talent.find(row => row.id === personId)!
  const standing = careerIdentity(person).disciplines.find(row => row.discipline === discipline)!
  return { ...standing, publicExpectedPotentialTier: expectedPotentialTier(person, discipline, world.seed),
    publicExpectedPotentialRange: expectedPotentialRange(person, discipline, world.seed) }
}
assert.equal(target(directorActorId, 'directing', state).capable, true)
assert.equal(target(directorActorId, 'writing', state).capable, false)
assert.equal(target(writerActorId, 'writing', state).capable, true)
assert.equal(target(writerActorId, 'directing', state).capable, false)
capture('created-week0', state)

// Same real stage/set route as the independently verified C.2c natural-film helper.
const stageId = 'facility-soundstage-07'
assert.ok(state.operations.facilities.some(facility => facility.id === stageId && facility.capability === 'soundstage'))
const mounted = state.sets.find(set => set.mountedOn === stageId && set.status !== 'retired')
if (mounted) state = act(state, { kind: 'strikeSet', setId: mounted.id })
state = act(state, { kind: 'commissionSet', commission: { blueprintId: 'set-grand-ballroom', stageFacilityId: stageId } })
assert.ok(TUNING.SET_BUILD_WEEKS_BAND_HIGH <= 12, 'bounded initial construction phase')
state = toWeek(state, TUNING.SET_BUILD_WEEKS_BAND_HIGH)
assert.ok(state.sets.some(set => set.mountedOn === stageId && set.status === 'standing'))
const filmIds: string[] = []
for (let index = 0; index < 3; index++) {
  const concept = state.concepts.find(row => !state.studio.activeProductions.some(film => film.conceptId === row.id)
    && !state.studio.releasedFilms.some(film => film.conceptId === row.id))
  assert.ok(concept, 'bounded producer needs a real unused concept; never invent one')
  state = act(state, { kind: 'greenlight', production: {
    conceptId: concept.id, shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
    promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: {
      intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5],
    } },
    writerId, directorId, cast: { lead: directorActorId, antagonist: writerActorId, support: supportId },
    craftIds: [craftId], budget: { negative: concept.baseNegativeCost, marketing: 0 },
  } })
  const filmId = state.studio.activeProductions.at(-1)!.id
  assert.ok(!filmIds.includes(filmId), 'each greenlight creates its own production identity')
  filmIds.push(filmId)
  let released = false
  for (let stepIndex = 0; stepIndex < 40; stepIndex++) {
    const workflow = state.operations.workflows.find(row => row.productionId === filmId)
    if (workflow?.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      state = act(state, { kind: 'assignShootingDirector', productionId: filmId, directorId })
    }
    if (state.operations.workflows.find(row => row.productionId === filmId)?.shootingTask?.status === 'ready') {
      state = act(state, { kind: 'scheduleShootingTake', productionId: filmId })
    }
    if (state.studio.activeProductions.find(row => row.id === filmId)?.remainingTicks === 1) {
      state = act(state, { kind: 'commitPictureToRelease', productionId: filmId })
    }
    state = step(state)
    if (state.studio.releasedFilms.some(row => row.productionId === filmId)) { released = true; break }
  }
  assert.equal(released, true, `film${index + 1} must release within40 actual ticks; no timing extension or forged receipt`)
  const film = state.studio.releasedFilms.find(row => row.productionId === filmId)!
  assert.equal(film.participants?.cast.lead.talentId, directorActorId)
  assert.equal(film.participants?.cast.antagonist.talentId, writerActorId)
  assert.equal(film.participants?.director.talentId, directorId)
  assert.equal(film.participants?.writer.talentId, writerId)
  assert.equal(state.firstTakes.filter(take => take.productionId === filmId).length, 1)
  saveBytes(state)
  console.log(JSON.stringify({ phase: 'real-film-released', index: index + 1, filmId, week: state.market.tick }))
}
assert.ok(state.market.tick < 104, 'all three films must actually finish before announcement; refuse an absent premise')
assert.equal(state.studio.activeProductions.length, 0)
for (const id of focusIds) {
  assert.equal(state.firstTakes.filter(take => filmIds.includes(take.productionId) && Object.values(take.cast).includes(id)).length, 3)
  assert.equal(state.studio.releasedFilms.filter(film => filmIds.includes(film.productionId)
    && (film.participants?.cast.lead.talentId === id || film.participants?.cast.antagonist.talentId === id)).length, 3)
}
assert.equal(state.firstTakes.filter(take => filmIds.includes(take.productionId) && take.cast.lead === directorActorId && take.directorId === directorId).length, 3)
assert.equal(state.studio.releasedFilms.filter(film => filmIds.includes(film.productionId)
  && film.participants?.cast.antagonist.talentId === writerActorId && film.participants.writer.talentId === writerId).length, 3)
const workCompletedWeek = state.market.tick
capture('three-real-releases', state)

state = toWeek(state, 103)
for (const id of focusIds) assert.equal(retirementRecordFor(state, id), undefined)
capture('preannouncement-week103', state)
state = step(state)
for (const id of focusIds) {
  const record = retirementRecordFor(state, id)
  assert.ok(record)
  assert.equal(record.announcedWeek, 104)
  assert.equal(record.ageAtAnnouncement, 70)
  assert.equal(record.effectiveWeek, 208)
  assert.equal(record.status, 'announced')
  assert.equal(record.profession, 'actor')
}
capture('announced-week104', state)
state = toWeek(state, 207)
for (const id of focusIds) {
  assert.equal(retirementRecordFor(state, id)?.status, 'announced')
  assert.equal(activeContract(state, id)?.endWeekExclusive, 208)
  assert.equal(state.talent.find(person => person.id === id)?.age, 71)
}
capture('preretirement-week207', state)
const savedSaveJson = snapshots.at(-1)!.raw
const pre207InMemory = structuredClone(state) // diagnostic snapshot preserves -0; no tick or state mutation
state = step(state)
for (const id of focusIds) {
  const record = retirementRecordFor(state, id)
  assert.ok(record)
  assert.equal(record.status, 'retired')
  assert.equal(record.retiredWeek, 208)
  assert.equal(record.extensionUsed, false)
  assert.equal(record.finishingFromWeek, null)
  assert.equal(activeContract(state, id), undefined)
  assert.equal(state.talent.find(person => person.id === id)?.age, 72)
  const ownCases = state.talentMarket.cases.filter(kase => kase.talentId === id && kase.variant === 'retirementExtension')
  assert.equal(ownCases.length, 1, 'actual one-issuer opportunity existed without an offer')
  assert.notEqual(ownCases[0]!.outcome, null, 'the no-offer case actually closed')
  assert.notEqual(ownCases[0]!.outcome, 'settled', 'no accepted extension was fabricated')
}
assert.deepEqual(state.talentProvenance.rows.filter(row => focusIds.includes(row.personId)), focusProvenance)
assert.equal(target(directorActorId, 'directing', state).capable, true)
assert.equal(target(writerActorId, 'writing', state).capable, true)
assert.equal(target(directorActorId, 'directing', state).capableButUnproven, true, 'acting releases do not invent directing credits')
assert.equal(target(writerActorId, 'writing', state).capableButUnproven, true, 'acting releases do not invent writing credits')
capture('retired-week208', state)
const currentSaveJson = snapshots.at(-1)!.raw
const publicTargetFacts = { directingActor: target(directorActorId, 'directing', state), writingActor: target(writerActorId, 'writing', state) }

// Distinct current/saved slots and one actual accepted advance, not a fabricated journal.
const session = BridgeSession.fromSaveJson(savedSaveJson, 'generated-c3-outgoing-runtime52')
const bridgePre207 = structuredClone(session.gameState) // preserve the actual imported pre-command state
const snapshot = session.snapshot()
const advance = snapshot.availableIntents.find(intent => intent.kind === 'advanceWeek')
assert.ok(advance, 'real week207 publishes a usable public advance intent')
const command = { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
  expectedStateRevision: snapshot.stateRevision, commandId: 'generated-c3-207-to-208',
  type: 'submitIntent' as const, payload: { intentId: advance.intentId } }
const response = session.command(command)
assert.equal(response.accepted, true)
assert.equal(session.gameState.market.tick, 208)
assert.equal(session.stateRevision, 1)
const runtimeCurrentSaveJson = saveBytes(session.gameState)
// The original continuous default tick and actual bridge command above are kept.
// Additional branches are independent copies of the same actual pre207 values.
const raw207Fingerprint = fingerprints(pre207InMemory), imported207Fingerprint = fingerprints(bridgePre207)
const normalized207 = cloneNormalizingOnlyNegativeZero(pre207InMemory)
assert.equal(JSON.stringify(normalized207.value), JSON.stringify(pre207InMemory), 'zero-only clone preserves native JSON bytes and key order')
assert.equal(differences(pre207InMemory, normalized207.value).count, normalized207.changed)
assert.equal(keyOrderDifferences(pre207InMemory, normalized207.value).count, 0)
const rawDevelop208 = tick(structuredClone(pre207InMemory), { develop: true })
const importedDevelop208 = tick(structuredClone(bridgePre207), { develop: true })
const normalizedDevelop208 = tick(normalized207.value, { develop: true })
const rawDevelopJson = saveBytes(rawDevelop208), importedDevelopJson = saveBytes(importedDevelop208)
const normalizedDevelopJson = saveBytes(normalizedDevelop208)
const compare = (left: string, right: string) => ({ exactSaveBytesEqual: left === right,
  leftBytes: Buffer.byteLength(left), rightBytes: Buffer.byteLength(right),
  leftSha256: sha(left), rightSha256: sha(right), parsedSave: differences(JSON.parse(left), JSON.parse(right)) })
const saved207 = JSON.parse(savedSaveJson) as { state: unknown }
const afterSource = sourceIdentity()
assert.deepEqual(afterSource, beforeSource, 'diagnostics must not change consumed source or fixtures')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
assert.deepEqual(fingerprints(pre207InMemory), raw207Fingerprint, 'raw diagnostic input must remain untouched')
assert.deepEqual(fingerprints(bridgePre207), imported207Fingerprint, 'imported diagnostic input must remain untouched')
assert.equal(existsSync(new URL(OUTPUT, root)), false)
const promiseDigestRows = (world: GameState) => world.promises.map(p => ({ promiseId: p.promiseId,
  issuerStudioId: p.issuerStudioId, beneficiaryPersonId: p.beneficiaryPersonId,
  receiptWeek: p.feasibilityReceipt.week, inputsDigest: p.feasibilityReceipt.inputsDigest }))
const changedPromiseDigests = (left: GameState, right: GameState) => {
  const a = new Map(promiseDigestRows(left).map(row => [row.promiseId, row]))
  const b = new Map(promiseDigestRows(right).map(row => [row.promiseId, row]))
  const changed = [...new Set([...a.keys(), ...b.keys()])].filter(id => JSON.stringify(a.get(id)) !== JSON.stringify(b.get(id)))
  return { count: changed.length, first: changed.slice(0, 32).map(promiseId => ({ promiseId,
    left: a.get(promiseId) ?? null, right: b.get(promiseId) ?? null })), omitted: Math.max(0, changed.length - 32) }
}
const originalMismatch = runtimeCurrentSaveJson !== currentSaveJson
console.log(JSON.stringify({
  diagnostic: '949 controlled pre207 continuation comparison; no normalization of original scenario or equality oracle',
  sourceSha: EXPECTED_HEAD, qualifiedProductionSha: PRODUCTION_BASE, producer: PRODUCER, producerSha256,
  sourceBefore: beforeSource, sourceAfter: afterSource, mode: 'read-only-no-artifact-writes',
  scenario: { seed: SEED, originalContinuousTicks: ticks, separateBridgeAdvanceCommands: 1,
    additionalIndependentTicks: 3, fromWeek: 207, toWeek: 208, originalMismatch },
  inputs: { canonicalSaved207Sha256: sha(savedSaveJson), raw207: raw207Fingerprint,
    imported207: imported207Fingerprint, zeroOnly207: fingerprints(cloneNormalizingOnlyNegativeZero(pre207InMemory).value),
    negativeZeroConversions: normalized207.changed },
  pre207: {
    rawToSerializedValues: differences(pre207InMemory, saved207.state),
    serializedToBridgeImportValues: differences(saved207.state, bridgePre207),
    rawToImportedValues: differences(pre207InMemory, bridgePre207),
    rawToSerializedKeyOrder: keyOrderDifferences(pre207InMemory, saved207.state),
    serializedToImportedKeyOrder: keyOrderDifferences(saved207.state, bridgePre207),
    rawToImportedKeyOrder: keyOrderDifferences(pre207InMemory, bridgePre207),
    changedRawFeasibilityOwners: changedOwnerEvidence(pre207InMemory, bridgePre207),
  },
  comparisons: {
    rawDefaultVsRawDevelop: compare(currentSaveJson, rawDevelopJson),
    rawDevelopVsImportedDevelop: compare(rawDevelopJson, importedDevelopJson),
    zeroOnlyDevelopVsImportedDevelop: compare(normalizedDevelopJson, importedDevelopJson),
    rawDevelopVsZeroOnlyDevelop: compare(rawDevelopJson, normalizedDevelopJson),
    importedDevelopVsActualBridgeAdvance: compare(importedDevelopJson, runtimeCurrentSaveJson),
    originalActualBridgeVsContinuousDefault: compare(runtimeCurrentSaveJson, currentSaveJson),
  },
  digestChanges: {
    rawDefaultVsRawDevelop: changedPromiseDigests(state, rawDevelop208),
    rawDevelopVsImportedDevelop: changedPromiseDigests(rawDevelop208, importedDevelop208),
    zeroOnlyDevelopVsImportedDevelop: changedPromiseDigests(normalizedDevelop208, importedDevelop208),
  },
  post208RawOwners: changedOwnerEvidence(rawDevelop208, importedDevelop208),
  newlyReleasedPlayerFilms: {
    rawDefault: state.studio.releasedFilms.filter(f => f.releaseTick === 208).map(f => f.productionId),
    rawDevelop: rawDevelop208.studio.releasedFilms.filter(f => f.releaseTick === 208).map(f => f.productionId),
    importedDevelop: importedDevelop208.studio.releasedFilms.filter(f => f.releaseTick === 208).map(f => f.productionId),
    zeroOnlyDevelop: normalizedDevelop208.studio.releasedFilms.filter(f => f.releaseTick === 208).map(f => f.productionId),
  },
  interpretationLimit: 'Values and key order are separately observed. Zero-only normalization is a diagnostic branch, not a production or mint correction. A remaining mismatch is not excused.',
}, null, 2))
assert.equal(importedDevelopJson === runtimeCurrentSaveJson, true, 'actual public advance must match tick develop:true from its actual imported input')
// Preserve the failed944/947 exact original byte comparison. Do not substitute
// normalized, imported, parsed or digest-excluded equality for this oracle.
assert.equal(originalMismatch, false, '949: original public advance and continuous default tick differ; bounded diagnostics above; no artifacts written')
