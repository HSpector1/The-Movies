// 951: preserve actual outgoing Save37/projection52 bytes before the digest fix.
// Continuous scenario is unchanged from944/947 (supported default develop:false).
// Runtime/continuous parity is an explicitly preserved known FAIL, never a pass.
// Default prepares only; --write creates nine new payloads plus their manifest
// after all historical premises, exact known-defect and runtime checks succeed.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync, gunzipSync } from 'node:zlib'
import { applyActions } from '../../../../../src/core/actions.ts'
import { activeContract } from '../../../../../src/core/employment.ts'
import { retirementRecordFor } from '../../../../../src/core/careerLifecycle.ts'
import { careerIdentity, expectedPotentialRange, expectedPotentialTier } from '../../../../../src/core/talentSummary.ts'
import { exportSave, importSave, LIVE_SAVE_VERSION, makeSave, validateSaveV37 } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { decodeBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import type { Action, CreativeRole, CustomTalentInput, Discipline, GameState } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = '1f44aa505c0d677430451ab5fcacaf5e0ce205d6'
const PRODUCTION_BASE = '9afae8874486fbb20dc5d373526698aacbec2114'
const SEED = 'p14c3-t0-public-actor-careers-01'
const OUTPUT = 'tests/fixtures/p14/genuine-v37-c3-corpus'
const PRODUCER = 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/951-c3-t0-preservation-producer.ts'
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
// Parent decision after945/948/950: preserve both genuine outgoing branches,
// recording the known parity defect. This is not a fixed or normalized world.
assert.notEqual(runtimeCurrentSaveJson, currentSaveJson, 'known baseline parity FAIL must still reproduce before preservation')
assert.equal(sha(currentSaveJson), '7de879a5c7a5ab4ffdac819734957572aa58349c5d59768c572c249339739a7f', 'continuous208 must reproduce its independently recorded948/950 bytes')
assert.equal(sha(runtimeCurrentSaveJson), '414b3491ad4d6a7244c9af71e24a7bbe491106d9cf290e1ee30cb9a62b57fb84', 'actual runtime208 must reproduce its independently recorded948/950 bytes')
const parsed208 = differences(JSON.parse(runtimeCurrentSaveJson), JSON.parse(currentSaveJson))
assert.equal(parsed208.count, 12, 'preserve exactly the recorded twelve differing promise digests')
assert.equal(parsed208.omitted, 0, 'all differing leaves must be examined before any fixture is written')
assert.equal(new Set(parsed208.first.map(diff => diff.path)).size, 12)
for (const diff of parsed208.first) {
  assert.match(diff.path, /^\$\["state"\]\["promises"\]\[\d+\]\["feasibilityReceipt"\]\["inputsDigest"\]$/, 'no other parsed208 difference is authorized')
  assert.equal(typeof diff.left, 'string')
  assert.equal(typeof diff.right, 'string')
  assert.match(diff.left as string, /^[0-9a-f]{16}$/)
  assert.match(diff.right as string, /^[0-9a-f]{16}$/)
}
const saved207 = JSON.parse(savedSaveJson) as { state: unknown }
assert.equal(differences(saved207.state, bridgePre207).count, 0, 'actual bridge import must preserve serialized207 values')
const knownParityDefect = {
  status: 'FAIL' as const,
  description: 'The actual BridgeSession advance and continuous default tick have twelve different promise feasibility inputsDigest receipts. Original values are preserved separately; no digest or state is repaired.',
  attribution: '950 held tick options constant and isolated negative zero: both controls were equal. Canonical import changed 9376 object key orders with no changed key sets; receipt JSON.stringify retains nested raw-object order. This is an existing save/load continuation ordering defect.',
  evidence: ['945-c3-t0-mint', '948-c3-t0-diagnostic', '950-c3-t0-causal'],
  comparator: { left: 'actual BridgeSession current208', right: 'continuous default-tick current208' },
  bytes: { left: Buffer.byteLength(runtimeCurrentSaveJson), right: Buffer.byteLength(currentSaveJson),
    leftSha256: sha(runtimeCurrentSaveJson), rightSha256: sha(currentSaveJson) },
  parsed208,
  pre207MemoryToSerializedState: differences(pre207InMemory, saved207.state),
  pre207SerializedStateToBridgeImport: differences(saved207.state, bridgePre207),
  limit: 'Outgoing historical preservation only. A successful mint does not make this parity check pass or qualify the ordering defect as fixed.',
}
console.log(JSON.stringify({ phase: 'known-runtime-parity-FAIL-preserved', knownParityDefect }))
snapshots.push({ filename: 'genuine-v37-c3-runtime-current208.json.gz', raw: runtimeCurrentSaveJson, week: 208, kind: 'save' })
const checkpoint = session.exportRuntimeCheckpoint()
assert.equal(checkpoint.journal.length, 1)
assert.equal(checkpoint.savedSaveJson, savedSaveJson)
assert.equal(checkpoint.currentSaveJson, runtimeCurrentSaveJson)
assert.notEqual(savedSaveJson, runtimeCurrentSaveJson)
assert.equal(checkpoint.savedStateDigest, sha(savedSaveJson))
assert.equal(checkpoint.currentStateDigest, sha(runtimeCurrentSaveJson))
assert.equal(checkpoint.journalDigest, sha(canonicalJson(checkpoint.journal)))
const runtimeRaw = encodeBridgeRuntimeCheckpoint(checkpoint)
assert.equal(encodeBridgeRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(runtimeRaw).checkpoint), runtimeRaw)
const loaded = loadBridgeRuntimeCheckpoint(runtimeRaw, undefined, () => { throw new Error('current52 must reopen without migration') })
assert.equal(loaded.migratedFromProtocolVersion, null)
const reopened = BridgeSession.fromRuntimeCheckpoint(loaded.hydrated)
assert.equal(encodeBridgeRuntimeCheckpoint(reopened.exportRuntimeCheckpoint()), runtimeRaw)
assert.equal(canonicalJson(reopened.command(command)), canonicalJson(response), 'actual duplicate command replay survives reopen')
assert.equal(encodeBridgeRuntimeCheckpoint(reopened.exportRuntimeCheckpoint()), runtimeRaw, 'duplicate replay cannot apply another advance')
snapshots.push({ filename: 'runtime52-current208-saved207.json.gz', raw: runtimeRaw, week: 208, kind: 'runtimeCheckpoint' })
state = step(state)
for (const id of focusIds) assert.equal(retirementRecordFor(state, id)?.retiredWeek, 208)
capture('postretirement-week209', state)
assert.equal(ticks, 209)

// Prepare and validate every artifact BEFORE any directory or file creation.
assert.equal(snapshots.length, 9, 'nine actual payloads: eight saves plus one runtime checkpoint')
assert.equal(new Set(snapshots.map(item => item.filename)).size, 9)
assert.deepEqual(snapshots.map(item => item.filename).sort(), [
  'genuine-v37-c3-created-week0.json.gz',
  'genuine-v37-c3-three-real-releases.json.gz',
  'genuine-v37-c3-preannouncement-week103.json.gz',
  'genuine-v37-c3-announced-week104.json.gz',
  'genuine-v37-c3-preretirement-week207.json.gz',
  'genuine-v37-c3-retired-week208.json.gz',
  'genuine-v37-c3-runtime-current208.json.gz',
  'genuine-v37-c3-postretirement-week209.json.gz',
  'runtime52-current208-saved207.json.gz',
].sort())
const artifacts = snapshots.map(({ filename, raw, week, kind }) => {
  const compressed = gzipSync(raw, { level: 9 })
  assert.equal(gunzipSync(compressed).toString('utf8'), raw)
  return { filename, kind, week, compressed, uncompressedSha256: sha(raw), compressedSha256: sha(compressed),
    byteLength: Buffer.byteLength(raw), compressedByteLength: compressed.length }
})
assert.deepEqual(sourceIdentity(), beforeSource, 'no consumed source drift while preparing genuine artifacts')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
const manifest = {
  generatedAt: new Date().toISOString(), sourceSha: EXPECTED_HEAD, qualifiedProductionSha: PRODUCTION_BASE,
  producer: PRODUCER, producerSha256, seed: SEED, sourceBefore: beforeSource,
  saveVersion: LIVE_SAVE_VERSION, projectionVersion: PROJECTION_VERSION, protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
  description: 'Public Full Custom authoring followed by three actual released films under supported default develop:false core ticks, natural acting announcement/retirement, and a separate genuine public runtime advance/replay. The known continuation digest parity FAIL is preserved, not repaired. No C.3 transition law exists in these outgoing bytes.',
  development: { continuousTicks: false, supportedPath: 'core tick default develop:false', normalPlayDevelopmentClaimed: false,
    runtimeAdvance: true, note: 'The public runtime advance from207 to208 uses develop:true. The earlier continuous scenario remains exactly the default-development path of944/947; acting takes and released credits are real, but this is not a normal-play development corpus.' },
  knownParityDefect,
  bootstrap: { builder: 'p13aGeneratedStudio', cashBefore: cashBeforeBootstrap, cashAfter: bootstrapCash,
    delta: bootstrapDelta, note: 'Disclosed generated-fixture funding, not simulated earned film revenue. No other direct world edits.' },
  authoredInputs, actionTrace, continuousTicks: ticks, separateRuntimeAdvanceCommands: 1,
  bounds: { createdPeople: 6, releaseCount: 3, maximumTicksPerFilm: 40, latestWorkCompletionExclusive: 104, finalWeek: 209 },
  focus: { directorActorId, writerActorId, directorId, writerId, craftId, supportId, filmIds, workCompletedWeek,
    announcementWeek: 104, effectiveWeek: 208, retiredWeek: 208, publicTargetFacts,
    actingTakeEvidence: state.firstTakes.filter(take => filmIds.includes(take.productionId)),
    releasedCreditEvidence: state.studio.releasedFilms.filter(film => filmIds.includes(film.productionId)).map(film => ({
      filmId: film.productionId, releaseWeek: film.releaseTick,
      writerId: film.participants!.writer.talentId, directorId: film.participants!.director.talentId,
      cast: Object.fromEntries(Object.entries(film.participants!.cast).map(([slot, credit]) => [slot, credit.talentId])),
    })) },
  runtime: { savedWeek: 207, currentWeek: 208, journalEntries: checkpoint.journal.length,
    savedSaveArtifact: 'genuine-v37-c3-preretirement-week207.json.gz',
    actualCurrentSaveArtifact: 'genuine-v37-c3-runtime-current208.json.gz',
    distinctContinuous208Artifact: 'genuine-v37-c3-retired-week208.json.gz',
    continuous208Sha256: sha(currentSaveJson), parityStatus: knownParityDefect.status,
    savedStateDigest: checkpoint.savedStateDigest, currentStateDigest: checkpoint.currentStateDigest, journalDigest: checkpoint.journalDigest, command },
  artifacts: artifacts.map(({ compressed: _bytes, ...metadata }) => ({ ...metadata,
    lineage: metadata.filename === 'runtime52-current208-saved207.json.gz' ? 'actual public runtime; saved continuous207/current imported-and-advanced208'
      : metadata.filename === 'genuine-v37-c3-runtime-current208.json.gz' ? 'actual public runtime current208'
      : 'continuous default develop:false core path' })),
}
const write = process.argv.includes('--write')
if (write) {
  assert.equal(existsSync(new URL(OUTPUT, root)), false, 'never replace preserved artifacts')
  mkdirSync(new URL(OUTPUT, root))
  for (const artifact of artifacts) writeFileSync(new URL(`${OUTPUT}/${artifact.filename}`, root), artifact.compressed, { flag: 'wx' })
  writeFileSync(new URL(`${OUTPUT}/MANIFEST.json`, root), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
  for (const artifact of artifacts) assert.equal(sha(readFileSync(new URL(`${OUTPUT}/${artifact.filename}`, root))), artifact.compressedSha256)
}
const afterSource = sourceIdentity()
assert.equal(afterSource.head, beforeSource.head)
assert.equal(afterSource.diffSha256, beforeSource.diffSha256, 'no existing consumed file changed')
assert.deepEqual(afterSource.untracked, write ? [...artifacts.map(artifact => `${OUTPUT}/${artifact.filename}`), `${OUTPUT}/MANIFEST.json`].sort() : [])
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
console.log(JSON.stringify({ mode: write ? 'minted-new-corpus' : 'prepared-without-file-writes', manifest, sourceAfter: afterSource }, null, 2))
