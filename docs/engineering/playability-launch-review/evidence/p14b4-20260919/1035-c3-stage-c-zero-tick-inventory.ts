// 1034-A: fixed factual inventory only. Parent alone executes after review/freeze.
// vite-node --script <this file>; recorder must use a different output stem.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { RIVAL_ARRIVAL_WEEKS } from '../../../../../src/core/calendar.ts'
import { contractEndRefusal } from '../../../../../src/core/careerLifecycle.ts'
import { employmentStatus, hiringMarketIds } from '../../../../../src/core/employment.ts'
import { HOLLYWOOD_STARTING_MANIFEST, RIVAL_CREDIT_ROLES, RIVAL_TEAM_ROLES } from '../../../../../src/core/hollywoodStartingData.ts'
import { LIVE_SAVE_VERSION, exportSave, importSave, makeSave, migrateToLive, stableStringify,
  validateSaveV35, validateSaveV37, validateSaveV38 } from '../../../../../src/core/save.ts'
import { marketEligibility } from '../../../../../src/core/talentMarket.ts'
import { careerIdentity, expectedPotentialTier, roleTier } from '../../../../../src/core/talentSummary.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import type { AuthoredFilm } from '../../../../../src/core/hollywoodTypes.ts'
import type { GameState, Talent } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = 'ca5405be094c33f730f18faaa73d82d17124aa34'
const PLAN_SHA = '2a8e93f87ecbc41be01439ab3047dd714689fb771cbdb56eb3004df4c5442c67'
const root = new URL('../../../../../', import.meta.url)
const output = new URL('./1035-c3-stage-c-zero-tick-inventory.json', import.meta.url)
const plan = new URL('./1034-A-c3-stage-c-inventory-source-plan.md', import.meta.url)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const same = (actual: unknown, expected: unknown, why: string) => assert.ok(stableStringify(actual) === stableStringify(expected), why)
const git = (...args: string[]) => execFileSync('git', args, { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'ui', 'scripts', 'generated', 'tests', 'package.json', 'package-lock.json',
  'tsconfig.json', 'vitest.config.ts', 'vitest.workspace.ts']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const slots = ['lead', 'antagonist', 'support'] as const
const checkedFiles: { path: string; sha256: string }[] = []
let stage = 'initial checks', generatedCompleted = 0, immutableCompleted = 0
let outputWritten = false

const INPUTS = [
  { directory: 'tests/fixtures/p14/genuine-v37-c3-corpus/', filename: 'genuine-v37-c3-created-week0.json.gz',
    manifestList: 'artifacts', version: 37, week: 0,
    manifestSha256: 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294',
    compressedSha256: '0ce43de9abe897631f415f94ac79e584b87d6001c8bb4b5c37fccf3dcb8204a2',
    uncompressedSha256: '215b61730393abc8bc28b747d7d79bf9dcb65d2b03f17aa97b96880bc720fa23' },
  { directory: 'tests/fixtures/p14/genuine-v35-c2b-corpus/', filename: 'genuine-v35-c2b-rival-incumbent-cohorts.json.gz',
    manifestList: 'fixtures', version: 35, week: 2600,
    manifestSha256: 'f47f781a4063ed53dc52adb361fabddded63909bf888d217ae9b2c9fc799531b',
    compressedSha256: 'afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d',
    uncompressedSha256: '8b4c1934222bc28da2bd4517b3967350cc01e2517cb18044246a3a65323f2fa8' },
] as const

function person(state: GameState, id: string): Talent {
  const rows = state.talent.filter(row => row.id === id)
  assert.equal(rows.length, 1, `one person ${id}`)
  return rows[0]!
}
function target(state: GameState, talent: Talent, discipline: 'directing' | 'writing') {
  const standing = careerIdentity(talent).disciplines.find(row => row.discipline === discipline)
  assert.ok(standing, `${talent.id} ${discipline} public standing`)
  return { capability: standing.ovr, workHistory: standing.workHistory, proven: standing.proven,
    capable: standing.capable, roleTier: roleTier(standing.ovr), potentialTier: expectedPotentialTier(talent, discipline, state.seed) }
}
function life(state: GameState, id: string) {
  const rows = state.careerLifecycle
  return { retirements: rows.records.filter(row => row.personId === id),
    professionAnchor: rows.professionAnchors.find(row => row.personId === id) ?? null,
    evaluations: rows.transitionEvaluations.filter(row => row.personId === id),
    changes: rows.professionChanges.filter(row => row.personId === id),
    finalities: rows.industryRetirements.filter(row => row.personId === id),
    due: rows.transitionDue.filter(row => row.personId === id) }
}
function actingFacts(state: GameState, id: string) {
  const takes = state.firstTakes.filter(row => Object.values(row.cast).includes(id))
  const playerFilms = state.studio.releasedFilms.filter(row => row.participants
    && Object.values(row.participants.cast).some(credit => credit.talentId === id))
  const industryFilms = state.hollywood!.films.filter(row => row.credits.some(credit => credit.talentId === id
    && (credit.role === 'lead' || credit.role === 'antagonist' || credit.role === 'support')))
  return { campaignFirstTakes: takes.length, leadFirstTakes: takes.filter(row => row.cast.lead === id).length,
    playerReleasedActingFilms: playerFilms.length,
    industryAuthoredActingFilms: industryFilms.filter(row => row.provenance === 'authored-start/v1').length,
    industrySimulationActingFilms: industryFilms.filter(row => row.provenance === 'simulation/v1').length }
}
function canonicalRows(state: GameState, seedOrdinal: number | null) {
  const h = state.hollywood
  assert.ok(h)
  assert.equal(h.origin, 'fresh'); assert.equal(h.originWeek, 0)
  assert.equal(h.startingManifest, HOLLYWOOD_STARTING_MANIFEST.version)
  same(h.identities.filter(row => row.role === 'rival').sort((a, b) => a.row - b.row).map(row => row.eligibleWeek),
    RIVAL_ARRIVAL_WEEKS, 'actual rival schedule must match calendar authority')
  const rows = []
  for (let manifestRow = 1; manifestRow <= 4; manifestRow++) {
    const studios = h.identities.filter(row => row.row === manifestRow && row.role === 'rival')
    assert.equal(studios.length, 1, `canonical manifest row ${manifestRow}`)
    const studio = studios[0]!, template = HOLLYWOOD_STARTING_MANIFEST.studios[manifestRow - 1]!
    assert.equal(studio.name, template.name); assert.equal(studio.enteredWeek, 0)
    assert.equal(h.businesses.filter(row => row.studioId === studio.studioId).length, 1)
    assert.ok(template.films && template.names)
    assert.equal(template.films.length, 2)
    const authored = h.films.filter((film): film is AuthoredFilm => film.studioId === studio.studioId && film.provenance === 'authored-start/v1')
    assert.equal(authored.length, 2, `${studio.studioId} two canonical films`)
    const films = template.films.map((expected, index) => {
      const matches = authored.filter(row => row.title === expected[0])
      assert.equal(matches.length, 1, 'one film for each exact manifest title')
      const film = matches[0]!
      assert.equal(film.filmId, `${studio.studioId}:historical-film:${index}`)
      same([film.title, film.released.year, film.genre, film.criticScore, film.audienceScore, film.openingGross, film.totalGross],
        expected, 'original authored film facts match the starting manifest')
      assert.equal(film.credits.length, 6)
      film.credits.forEach((credit, creditIndex) => {
        assert.equal(credit.role, RIVAL_CREDIT_ROLES[creditIndex])
        assert.equal(credit.name, template.names![creditIndex])
        assert.equal(person(state, credit.talentId).name, credit.name)
        assert.equal(person(state, credit.talentId).role, RIVAL_TEAM_ROLES[creditIndex])
      })
      return film
    })
    for (let actorCreditSlotOrdinal = 0; actorCreditSlotOrdinal < slots.length; actorCreditSlotOrdinal++) {
      const slot = slots[actorCreditSlotOrdinal]!, creditIndex = actorCreditSlotOrdinal + 2
      const first = films[0]!.credits[creditIndex]!, second = films[1]!.credits[creditIndex]!
      assert.equal(first.role, slot); same(second, first, 'both authored films name the same canonical actor/slot')
      const talent = person(state, first.talentId)
      assert.equal(talent.role, 'actor')
      const origins = state.talentProvenance.rows.filter(row => row.personId === talent.id)
      assert.equal(origins.length, 1)
      const provenance = origins[0]!
      assert.equal(provenance.kind, 'authored_exact_week')
      assert.ok(provenance.kind === 'authored_exact_week')
      assert.equal(provenance.entryWeek, 0)
      const entries = h.employment.filter(row => row.studioId === studio.studioId && row.terms.talentId === talent.id && row.reason === 'entry')
      assert.equal(entries.length, 1, 'one real canonical entry employment')
      const entry = entries[0]!
      assert.equal(entry.terms.startWeek, 0); assert.equal(entry.terms.termWeeks, 208); assert.equal(entry.terms.endWeekExclusive, 208)
      assert.equal(h.receipts.filter(row => row.kind === 'employment' && row.reason === 'entry' && row.week === 0
        && row.contractId === entry.contractId && row.talentId === talent.id && row.toStudioId === studio.studioId).length, 1)
      const targets = { writing: target(state, talent, 'writing'), directing: target(state, talent, 'directing') }
      const candidate = provenance.ageAtEntry >= 60 && provenance.ageAtEntry <= 66
        && talent.role === 'actor' && targets.writing.capability >= 60 && targets.directing.capability < 60
      const counts = actingFacts(state, talent.id)
      if (state.market.tick === 0) assert.equal(counts.campaignFirstTakes, 0)
      rows.push({ rowIndex: rows.length, seedOrdinal, studioManifestRow: manifestRow, actorCreditSlotOrdinal, actorCreditSlot: slot,
        studioId: studio.studioId, studioName: studio.name, personId: talent.id, name: talent.name,
        provenance, materializedAge: talent.age, currentRole: talent.role, targets,
        initialEmployment: { contractId: entry.contractId, studioId: entry.studioId, reason: entry.reason,
          startWeek: entry.terms.startWeek, endWeekExclusive: entry.terms.endWeekExclusive, termWeeks: entry.terms.termWeeks, endedWeek: entry.endedWeek },
        authoredFilms: films.map(film => ({ filmId: film.filmId, title: film.title, year: film.released.year,
          actorCredit: film.credits[creditIndex], writerCredit: film.credits[0] })),
        actingFacts: counts, lifecycle: life(state, talent.id), candidate })
    }
  }
  assert.equal(rows.length, 12)
  assert.equal(new Set(rows.map(row => row.personId)).size, 12)
  return rows
}
function validateWhole(state: GameState): string {
  const before = stableStringify(state), saved = makeSave(state)
  assert.equal(saved.saveVersion, 38)
  assert.equal(validateSaveV38(saved), saved)
  assert.equal(stableStringify(state), before, 'whole-save validation leaves state unchanged')
  return sha(exportSave(saved))
}
function cohortFacts(state: GameState) {
  const id = 'person-cohort-832-actor-0', talent = person(state, id), h = state.hollywood!
  assert.equal(state.market.tick, 2600); assert.equal(talent.age, 57); assert.equal(talent.role, 'actor')
  const provenance = state.talentProvenance.rows.filter(row => row.personId === id)
  same(provenance, [{ personId: id, kind: 'authored_exact_week', entryWeek: 832, ageAtEntry: 23.874552652348545 }], 'exact cohort832 provenance')
  const cohort = state.careerLifecycle.cohorts.filter(row => row.personIds.includes(id))
  assert.equal(cohort.length, 1); assert.equal(cohort[0]!.week, 832)
  const targets = { writing: target(state, talent, 'writing'), directing: target(state, talent, 'directing') }
  assert.equal(targets.directing.capability, 69); assert.equal(targets.writing.capability, 13)
  assert.equal(targets.directing.proven, false); assert.equal(targets.writing.proven, false)
  const employment = h.employment.filter(row => row.terms.talentId === id)
  assert.equal(employment.length, 0)
  const counts = actingFacts(state, id)
  same(counts, { campaignFirstTakes: 0, leadFirstTakes: 0, playerReleasedActingFilms: 0,
    industryAuthoredActingFilms: 0, industrySimulationActingFilms: 0 }, 'cohort has no take or released acting credit')
  const lifecycle = life(state, id)
  for (const key of ['retirements', 'evaluations', 'changes', 'finalities', 'due'] as const) assert.equal(lifecycle[key].length, 0, `cohort ${key}`)
  assert.equal(state.studio.cash, -19_000_000); assert.equal(state.contracts.length, 0); assert.equal(state.studio.releasedFilms.length, 0)
  assert.equal(state.scriptDevelopment.mode, 'legacy')
  const facilities = ['facility-soundstage-07', 'facility-soundstage-12'].map(id => {
    const rows = state.operations.facilities.filter(row => row.id === id)
    assert.equal(rows.length, 1); assert.equal(rows[0]!.capability, 'soundstage')
    return rows[0]!
  })
  const freeAgentListed = state.freeAgents.includes(id), hiringMarketListed = hiringMarketIds(state).includes(id)
  assert.equal(freeAgentListed, true); assert.equal(hiringMarketListed, true)
  const eligibility = marketEligibility(state, id)
  assert.equal(eligibility.status, 'free_agent')
  const ordinary52EndRefusal = contractEndRefusal(state, id, state.market.tick + 52)
  assert.equal(ordinary52EndRefusal, null)
  return { personId: id, name: talent.name, provenance: provenance[0], materializedAge: talent.age, currentRole: talent.role,
    targets, employment, lifecycle, actingFacts: counts, freeAgentListed, hiringMarketListed,
    employmentStatus: employmentStatus(state, id), marketEligibility: eligibility,
    ordinary52EndRefusal,
    player: { cash: state.studio.cash, contractCount: state.contracts.length, releasedFilmCount: state.studio.releasedFilms.length,
      scriptDevelopmentMode: state.scriptDevelopment.mode, soundstages: facilities }, fundingAdded: 0 }
}
function immutableInput(input: typeof INPUTS[number]) {
  stage = `immutable ${input.filename}`
  const path = input.directory + input.filename, manifestPath = input.directory + 'MANIFEST.json'
  const compressed = readFileSync(new URL(path, root)), raw = gunzipSync(compressed).toString('utf8')
  const manifestBytes = readFileSync(new URL(manifestPath, root)), manifest = JSON.parse(manifestBytes.toString('utf8'))
  assert.equal(sha(compressed), input.compressedSha256); assert.equal(sha(raw), input.uncompressedSha256)
  assert.equal(sha(manifestBytes), input.manifestSha256)
  const entries = (manifest[input.manifestList] as { filename: string; compressedSha256: string; uncompressedSha256: string }[])
    .filter(row => row.filename === input.filename)
  assert.equal(entries.length, 1)
  assert.equal(entries[0]!.compressedSha256, input.compressedSha256); assert.equal(entries[0]!.uncompressedSha256, input.uncompressedSha256)
  checkedFiles.push({ path, sha256: sha(compressed) }, { path: manifestPath, sha256: sha(manifestBytes) })
  const parsed = importSave(raw), historicalBytes = stableStringify(parsed)
  assert.equal(parsed.saveVersion, input.version)
  if (input.version === 37) {
    assert.equal(validateSaveV37(parsed), parsed)
    assert.equal(manifest.sourceSha, '1f44aa505c0d677430451ab5fcacaf5e0ce205d6')
    assert.equal(manifest.producerSha256, 'aba3b5c101a1982e2994ce69de0e78633a16d499ebe6cb26bdcc31875235bb4c')
  } else {
    assert.equal(validateSaveV35(parsed), parsed)
    assert.equal(manifest.authority.headSha, '68783a8acb53aba4989829a2f6ddf95d8d544bc3')
  }
  const state = migrateToLive(parsed).state
  assert.equal(stableStringify(parsed), historicalBytes, 'migration preserves original parsed bytes')
  assert.equal(state.market.tick, input.week)
  const historicalState = parsed.state as unknown as Record<string, unknown>, liveState = state as unknown as Record<string, unknown>
  for (const [key, value] of Object.entries(historicalState)) {
    if (key !== 'careerLifecycle' && key !== 'talentMarket') same(liveState[key], value, `migration preserves original ${key}`)
  }
  // These two roots gain governed fields, while every existing dated fact stays.
  const oldLifecycle = historicalState.careerLifecycle as { boundaryWeek: number; cohorts: unknown; records: Record<string, unknown>[] }
  same(state.careerLifecycle.boundaryWeek, oldLifecycle.boundaryWeek, 'old lifecycle boundary unchanged')
  same(state.careerLifecycle.cohorts, oldLifecycle.cohorts, 'all old cohort receipts unchanged')
  assert.equal(state.careerLifecycle.records.length, oldLifecycle.records.length)
  oldLifecycle.records.forEach((row, index) => {
    const current = state.careerLifecycle.records[index] as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(row)) same(current[key], value, `old retirement ${index}/${key} unchanged`)
  })
  const oldMarket = historicalState.talentMarket as Record<string, unknown>
  for (const [key, value] of Object.entries(oldMarket)) {
    if (key !== 'cases') same((state.talentMarket as unknown as Record<string, unknown>)[key], value, `old market ${key} unchanged`)
  }
  const oldCases = oldMarket.cases as Record<string, unknown>[]
  assert.equal(state.talentMarket.cases.length, oldCases.length)
  oldCases.forEach((row, index) => {
    const current = state.talentMarket.cases[index] as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(row)) same(current[key], value, `old market case ${index}/${key} unchanged`)
  })
  const before = stableStringify(state), currentSaveSha256 = validateWhole(state), actors = canonicalRows(state, null)
  const excludedPlayerAuthoredPeople = input.week === 0 ? state.talent.filter(row => row.authored).map(row => row.id) : []
  if (input.week === 0) {
    same(excludedPlayerAuthoredPeople, ['authored-0000', 'authored-0001', 'authored-0002', 'authored-0003', 'authored-0004', 'authored-0005'],
      'created-week0 retains exactly its six disclosed player authors')
    assert.ok(actors.every(row => !excludedPlayerAuthoredPeople.includes(row.personId)), 'canonical candidates exclude Full Custom authors')
    assert.equal(state.firstTakes.length, 0); assert.equal(state.studio.releasedFilms.length, 0)
    assert.equal(state.hollywood!.films.filter(row => row.provenance === 'simulation/v1').length, 0)
  }
  const cohort = input.week === 2600 ? cohortFacts(state) : null
  assert.equal(stableStringify(state), before, 'immutable-world public reads preserve all current facts')
  immutableCompleted++
  return { input: { ...input, path, manifestPath, sourceSha: manifest.sourceSha ?? manifest.authority.headSha,
      producer: manifest.producer ?? 'historical V35 corpus manifest authority', producerSha256: manifest.producerSha256 ?? null },
    seed: state.seed, week: state.market.tick, saveVersion: 38, currentSaveSha256, canonicalActors: actors,
    candidateRowIndexes: actors.filter(row => row.candidate).map(row => row.rowIndex), cohort,
    excludedPlayerAuthoredPeople,
    originalFactsPreserved: true }
}

function main(): void {
  assert.equal(existsSync(output), false, 'refuse an existing inventory output')
  const sourceBefore = sourceIdentity()
  assert.equal(sourceBefore.head, EXPECTED_HEAD); assert.equal(sourceBefore.diffSha256, sha('')); assert.equal(sourceBefore.untracked, '')
  assert.equal(LIVE_SAVE_VERSION, 38)
  assert.equal(sha(readFileSync(plan)), PLAN_SHA)
  const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
  same(RIVAL_ARRIVAL_WEEKS, [0, 0, 0, 0, 520, 988, 1560, 1872, 2548], 'calendar arrival authority')
  // Read version literals only: no bridge session, runtime or wire action is used.
  const schemaSource = readFileSync(new URL('bridge/schema/bridge-schema.ts', root), 'utf8')
  const protocolVersion = Number(schemaSource.match(/export const PROTOCOL_VERSION = (\d+) as const/)?.[1])
  const projectionVersion = Number(schemaSource.match(/export const PROJECTION_VERSION = (\d+) as const/)?.[1])
  assert.equal(protocolVersion, 4); assert.equal(projectionVersion, 52)
  const immutableInputs = INPUTS.map(immutableInput)
  assert.equal(immutableCompleted, 2)
  const worlds = []
  const candidates: { seedOrdinal: number; studioManifestRow: number; actorCreditSlotOrdinal: number; rowIndex: number; personId: string }[] = []
  for (let ordinal = 0; ordinal < 128; ordinal++) {
    const seed = `p14c3-canonical-stage-c-${String(ordinal).padStart(3, '0')}`
    stage = `generated ${ordinal}/128 ${seed}`
    const state = p13aGeneratedStudio(seed), before = stableStringify(state)
    assert.equal(state.seed, seed); assert.equal(state.market.tick, 0)
    assert.ok(state.hollywood)
    assert.equal(state.hollywood.origin, 'fresh'); assert.equal(state.hollywood.originWeek, 0)
    assert.equal(state.hollywood.identities.filter(row => row.role === 'rival' && row.enteredWeek !== null).length, 4)
    assert.equal(state.firstTakes.length, 0); assert.equal(state.studio.releasedFilms.length, 0)
    assert.equal(state.hollywood.films.filter(row => row.provenance === 'simulation/v1').length, 0)
    const currentSaveSha256 = validateWhole(state), actors = canonicalRows(state, ordinal)
    assert.equal(stableStringify(state), before, 'generated-world validation/public reads leave all state unchanged')
    for (const row of actors) if (row.candidate) candidates.push({ seedOrdinal: ordinal, studioManifestRow: row.studioManifestRow,
      actorCreditSlotOrdinal: row.actorCreditSlotOrdinal, rowIndex: row.rowIndex, personId: row.personId })
    worlds.push({ seedOrdinal: ordinal, seed, week: 0, currentSaveSha256, canonicalActors: actors })
    generatedCompleted++
  }
  assert.equal(generatedCompleted, 128); assert.equal(worlds.length, 128)
  assert.equal(worlds.reduce((sum, world) => sum + world.canonicalActors.length, 0), 1536)
  const first = candidates[0] ?? null
  const firstCandidate = first === null ? null : { seed: worlds[first.seedOrdinal]!.seed, ...worlds[first.seedOrdinal]!.canonicalActors[first.rowIndex]! }
  stage = 'final source/input/producer checks'
  const sourceAfter = sourceIdentity()
  same(sourceAfter, sourceBefore, 'consumed source drift')
  assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256, 'producer drift')
  assert.equal(sha(readFileSync(plan)), PLAN_SHA, 'plan drift')
  for (const checked of checkedFiles) assert.equal(sha(readFileSync(new URL(checked.path, root))), checked.sha256, `input drift ${checked.path}`)
  const result = { format: 'p14c3-stage-c-zero-tick-inventory/v1', rulesMarker: '1034-A fixed canonical actor predicate/v1',
    planSha256: PLAN_SHA, producerSha256, sourceBefore, sourceAfter,
    environment: { node: process.version, platform: process.platform, arch: process.arch },
    saveVersion: LIVE_SAVE_VERSION, protocolVersion, projectionVersion,
    initialization: 'p13aGeneratedStudio: generateWorld(seed); evidence economyEngagedEver:true; public activateStudioOperations; initializeHollywood(fresh)',
    candidatePredicate: 'canonical manifest rows1..4 actor credits lead/antagonist/support; exact entry age inclusively60..66; current original Actor; public writing>=60; public directing<60',
    candidateOrder: ['seedOrdinal', 'studioManifestRow', 'actorCreditSlotOrdinal'],
    fixedSeedRule: 'p14c3-canonical-stage-c-000 through p14c3-canonical-stage-c-127 inclusive; no retries or early exit',
    counts: { immutableCompleted, generatedCompleted, generatedActorRows: 1536, ticks: 0, furtherActions: 0,
      generatedCandidates: candidates.length },
    arrivalWeeks: RIVAL_ARRIVAL_WEEKS, immutableInputs, worlds, candidates, firstCandidate,
    continuationExecuted: false, fundingAdded: 0,
    limitation: 'Starting facts only. No campaign continuation, three-take eligibility, choice, retirement, later canonical validation or rival work was executed.' }
  const bytes = JSON.stringify(result) + '\n'
  assert.ok(Buffer.byteLength(bytes) <= 4 * 1024 * 1024, 'compact result must fit4MiB; no truncation permitted')
  assert.equal(existsSync(output), false, 'output appeared during inventory')
  writeFileSync(output, bytes, { flag: 'wx' })
  outputWritten = true
  console.log(JSON.stringify({ output: fileURLToPath(output), outputSha256: sha(bytes), outputBytes: Buffer.byteLength(bytes),
    producerSha256, sourceSha: sourceBefore.head, immutableCompleted, generatedCompleted, generatedActorRows: 1536,
    ticks: 0, furtherActions: 0, candidateCount: candidates.length, firstCandidate, continuationExecuted: false }))
}

try { main() } catch (error) {
  console.error(JSON.stringify({ status: 'FAILED', stage, immutableCompleted, generatedCompleted,
    ticks: 0, furtherActions: 0, outputWritten, outputExists: existsSync(output),
    error: error instanceof Error ? { name: error.name, message: error.message.slice(0, 6000) } : String(error).slice(0, 6000) }))
  process.exitCode = 1
}
