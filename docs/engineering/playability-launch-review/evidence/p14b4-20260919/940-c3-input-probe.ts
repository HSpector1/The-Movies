// 940: read-only inventory, not a C.3 chooser or future-rule expectation.
// Parent alone may execute after freeze/review (planned record941).
// node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/940-c3-input-probe.ts
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { importSave, LIVE_SAVE_VERSION, migrateToLive, validateSaveV37 } from '../../../../../src/core/save.ts'
import { careerIdentity, expectedPotentialRange, expectedPotentialTier } from '../../../../../src/core/talentSummary.ts'
import { retirementRecordFor } from '../../../../../src/core/careerLifecycle.ts'
import { flattenParticipants } from '../../../../../src/core/starPower.ts'
import { TUNING } from '../../../../../src/core/tuning.ts'
import { canonicalJson } from '../../../../../bridge/schema/canonical.ts'
import type { FilmParticipantRole, GameState, Talent } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = '9afae8874486fbb20dc5d373526698aacbec2114'
const root = new URL('../../../../../', import.meta.url)
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')
const git = (...args: string[]): string => execFileSync('git', args, {
  cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
})
const consumed = ['src', 'bridge', 'ui', 'scripts', 'generated', 'tests']
const sourceIdentity = () => ({
  head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...consumed)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...consumed).trim(),
})
const beforeSource = sourceIdentity()
assert.equal(beforeSource.head, EXPECTED_HEAD, 'inventory requires unchanged published C.2-RM source')
assert.equal(beforeSource.diffSha256, sha(''), 'consumed source must start clean')
assert.equal(beforeSource.untracked, '', 'no untracked consumed source')
assert.equal(LIVE_SAVE_VERSION, 37)
assert.equal(TUNING.CAPABILITY_OVR_MIN, 60, 'inventory filter uses the existing P10 capability boundary')
const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))

const inputs = [
  {
    directory: 'tests/fixtures/p14/genuine-v35-c2b-corpus/',
    filename: 'genuine-v35-c2b-rival-incumbent-cohorts.json.gz',
    manifestList: 'fixtures', version: 35, week: 2600,
    compressedSha256: 'afb89ad0a5f1e972564d1389c800fb544e5082e8a8dddb4bbd5a2a43520e085d',
    uncompressedSha256: '8b4c1934222bc28da2bd4517b3967350cc01e2517cb18044246a3a65323f2fa8',
    focusIds: ['person-cohort-208-actor-1'],
  },
  {
    directory: 'tests/fixtures/p14/genuine-projection51-runtime-c2rm/',
    filename: 'genuine-v37-scientist-week670.json.gz',
    manifestList: 'artifacts', version: 37, week: 670,
    compressedSha256: '34f0ac18280f8e5fef2482e6e1dcc5c48f30a1ef10d3ca9eaece8699ece99861',
    uncompressedSha256: 'c119e1aac5b1dda794bf6c6967dceade05eeace2626002eebdae68628d31db72',
    focusIds: [],
  },
] as const

type Credit = { talentId: string; role: FilmParticipantRole }
type RecordedFilm = {
  filmId: string; provenance: 'authored-start/v1' | 'simulation/v1' | 'player-record';
  releaseWeek: number | null; historicalYear: number | null; credits: readonly Credit[]
}
const actingRoles = new Set<FilmParticipantRole>(['lead', 'antagonist', 'support'])
const ordered = (values: Iterable<string>): string[] => [...new Set(values)].sort()
const SAMPLE_LIMIT = 8
const CANDIDATE_LIMIT = 128
const sample = (values: Iterable<string>) => {
  const all = ordered(values)
  return { count: all.length, ids: all.slice(0, SAMPLE_LIMIT), omitted: Math.max(0, all.length - SAMPLE_LIMIT) }
}
function filmsOf(state: GameState): RecordedFilm[] {
  const films: RecordedFilm[] = (state.hollywood?.films ?? []).map(film => ({
    filmId: film.filmId, provenance: film.provenance,
    releaseWeek: film.provenance === 'authored-start/v1' ? null : film.result.releaseTick,
    historicalYear: film.provenance === 'authored-start/v1' ? film.released.year : null,
    credits: film.credits,
  }))
  for (const film of state.studio.releasedFilms) films.push({
    filmId: film.productionId, provenance: 'player-record', releaseWeek: film.releaseTick,
    historicalYear: null, credits: film.participants ? flattenParticipants(film.participants) : [],
  })
  assert.equal(new Set(films.map(film => film.filmId)).size, films.length, 'film identities must not double-count')
  return films
}
function targetFacts(person: Talent, state: GameState, discipline: 'directing' | 'writing') {
  const standing = careerIdentity(person).disciplines.find(row => row.discipline === discipline)
  assert.ok(standing)
  return {
    perceivedOvr: standing.ovr, capable: standing.capable, proven: standing.proven,
    capableButUnproven: standing.capableButUnproven, recordedWorkHistory: standing.workHistory,
    publicExpectedPotentialTier: expectedPotentialTier(person, discipline, state.seed),
    publicExpectedPotentialRange: expectedPotentialRange(person, discipline, state.seed),
  }
}
function actorFacts(person: Talent, state: GameState, films: readonly RecordedFilm[]) {
  const id = person.id, retirement = retirementRecordFor(state, id)
  const takes = state.firstTakes.filter(take => Object.values(take.cast).includes(id))
  assert.equal(new Set(takes.map(take => take.productionId)).size, takes.length, 'one real first take per production')
  const leads = takes.filter(take => take.cast.lead === id)
  const leadByDirector = new Map<string, string[]>()
  for (const take of leads) leadByDirector.set(take.directorId, [...(leadByDirector.get(take.directorId) ?? []), take.productionId])
  const repeatedDirectorLead = [...leadByDirector].filter(([, ids]) => ids.length >= 2)
    .sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
  const ownFilms = films.filter(film => film.credits.some(credit => credit.talentId === id))
  const actingFilms = ownFilms.filter(film => film.credits.some(credit => credit.talentId === id && actingRoles.has(credit.role)))
  const writerContexts = actingFilms.flatMap(film => film.credits.filter(credit => credit.role === 'writer' && credit.talentId !== id)
    .map(writer => ({
      filmId: film.filmId, writerId: writer.talentId, provenance: film.provenance,
      releaseWeek: film.releaseWeek, historicalYear: film.historicalYear,
      matchingFirstTake: takes.some(take => take.productionId === film.filmId),
    })))
  const sharedWriterIds = ordered(writerContexts.map(row => row.writerId))
  const repeatedWriters = sharedWriterIds.filter(writerId => new Set(writerContexts.filter(row => row.writerId === writerId).map(row => row.filmId)).size >= 2)
  const careerEvents = [...state.careerEvents, ...(state.hollywood?.careerEvents ?? [])].filter(event => event.talentId === id)
  const employment = (state.hollywood?.employment ?? []).filter(row => row.terms.talentId === id)
  const currentEmployment = employment.filter(row => row.terms.startWeek <= state.market.tick
    && state.market.tick < (row.endedWeek ?? row.terms.endWeekExclusive))
  const cohort = state.careerLifecycle.cohorts.find(row => row.personIds.includes(id))
  return {
    personId: id, name: person.name, currentRole: person.role, age: person.age,
    lifecycle: retirement === undefined ? { status: 'active' } : {
      status: retirement.status, profession: retirement.profession, announcedWeek: retirement.announcedWeek,
      effectiveWeek: retirement.effectiveWeek, retiredWeek: retirement.retiredWeek, extensionUsed: retirement.extensionUsed,
    },
    currentEmployerStudioIds: ordered(currentEmployment.map(row => row.studioId)),
    recordedEmploymentStudioIds: ordered(employment.map(row => row.studioId)),
    cohortEntryWeek: cohort?.week ?? null,
    target: { directing: targetFacts(person, state, 'directing'), writing: targetFacts(person, state, 'writing') },
    firstTakes: {
      acting: takes.length, lead: leads.length, productionIds: sample(takes.map(row => row.productionId)),
      uniqueLeadDirectors: leadByDirector.size, repeatedDirectorLeadPairs: repeatedDirectorLead.length,
      repeatedDirectorLeadTakes: repeatedDirectorLead.reduce((sum, [, ids]) => sum + ids.length, 0),
      repeatedDirectorLead: repeatedDirectorLead.slice(0, SAMPLE_LIMIT).map(([directorId, ids]) => ({ directorId, ...sample(ids) })),
      omittedDirectorPairs: Math.max(0, repeatedDirectorLead.length - SAMPLE_LIMIT),
    },
    releasedCredits: {
      roleCredits: ownFilms.reduce((count, film) => count + film.credits.filter(credit => credit.talentId === id).length, 0),
      distinctFilms: ownFilms.length, actingFilms: actingFilms.length,
      authoredActingFilms: actingFilms.filter(film => film.provenance === 'authored-start/v1').length,
      campaignActingFilms: actingFilms.filter(film => film.provenance !== 'authored-start/v1').length,
      capturedCareerEvents: careerEvents.length,
      careerEventRoles: Object.fromEntries([...new Set(careerEvents.map(event => event.role))].sort()
        .map(role => [role, careerEvents.filter(event => event.role === role).length])),
      sharedWriterFilmCount: new Set(writerContexts.map(row => row.filmId)).size,
      sharedWriterRoleCreditPairs: writerContexts.length,
      authoredSharedWriterFilmCount: new Set(writerContexts.filter(row => row.provenance === 'authored-start/v1').map(row => row.filmId)).size,
      campaignSharedWriterFilmCount: new Set(writerContexts.filter(row => row.provenance !== 'authored-start/v1').map(row => row.filmId)).size,
      matchedFirstTakeSharedWriterFilmCount: new Set(writerContexts.filter(row => row.matchingFirstTake).map(row => row.filmId)).size,
      uniqueWriters: sharedWriterIds.length, repeatedWriters: sample(repeatedWriters),
      contexts: writerContexts.sort((a, b) => a.filmId < b.filmId ? -1 : a.filmId > b.filmId ? 1 : a.writerId < b.writerId ? -1 : a.writerId > b.writerId ? 1 : 0).slice(0, SAMPLE_LIMIT),
      omittedContexts: Math.max(0, writerContexts.length - SAMPLE_LIMIT),
    },
  }
}

const inputChecks: { path: string; sha256: string }[] = []
const results = inputs.map(input => {
  const path = input.directory + input.filename, manifestPath = input.directory + 'MANIFEST.json'
  const compressed = readFileSync(new URL(path, root)), raw = gunzipSync(compressed).toString('utf8')
  const manifestBytes = readFileSync(new URL(manifestPath, root))
  const manifest = JSON.parse(manifestBytes.toString('utf8')) as Record<string, unknown>
  const entries = manifest[input.manifestList] as { filename: string; compressedSha256: string; uncompressedSha256: string }[]
  const entry = entries.find(row => row.filename === input.filename)
  assert.ok(entry, 'exact historical manifest entry exists')
  assert.equal(entry.compressedSha256, input.compressedSha256)
  assert.equal(entry.uncompressedSha256, input.uncompressedSha256)
  assert.equal(sha(compressed), input.compressedSha256)
  assert.equal(sha(raw), input.uncompressedSha256)
  inputChecks.push({ path, sha256: sha(compressed) }, { path: manifestPath, sha256: sha(manifestBytes) })
  const parsed = importSave(raw), beforeInput = canonicalJson(parsed)
  assert.equal(parsed.saveVersion, input.version)
  const live = validateSaveV37(migrateToLive(parsed)), state = live.state
  assert.equal(state.market.tick, input.week, 'migration does not advance the clock')
  assert.equal(canonicalJson(parsed), beforeInput, 'migration leaves imported historical input untouched')
  const beforeState = canonicalJson(state)
  const films = filmsOf(state), actors = state.talent.filter(person => person.role === 'actor')
  const under75 = actors.filter(person => person.age < 75)
  const candidates = under75.filter(person => careerIdentity(person).disciplines.some(row =>
    (row.discipline === 'directing' || row.discipline === 'writing') && row.capable))
    .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  assert.ok(candidates.length <= CANDIDATE_LIMIT, `candidate output exceeds explicit bound ${CANDIDATE_LIMIT}; no silent truncation`)
  const group = (people: readonly Talent[]) => ({
    all: people.length,
    activeWithoutRecord: people.filter(person => retirementRecordFor(state, person.id) === undefined).length,
    announced: people.filter(person => retirementRecordFor(state, person.id)?.status === 'announced').length,
    finishing: people.filter(person => retirementRecordFor(state, person.id)?.status === 'finishing_commitments').length,
    retired: people.filter(person => retirementRecordFor(state, person.id)?.status === 'retired').length,
  })
  const report = {
    input: { path, manifestPath, manifestSha256: sha(manifestBytes), sourceVersion: input.version,
      compressedSha256: sha(compressed), uncompressedSha256: sha(raw), rawBytes: Buffer.byteLength(raw) },
    live: { saveVersion: live.saveVersion, week: state.market.tick, seed: state.seed, stateSha256: sha(beforeState) },
    aggregate: {
      population: state.talent.length, actors: group(actors), actorsUnder75: group(under75), candidates: group(candidates),
      candidateFilter: 'current Talent.role actor; materialized age <75; directing or writing careerIdentity capable at current P10 minimum60; not a C.3 eligibility rule',
      directingCapableUnder75: under75.filter(person => targetFacts(person, state, 'directing').capable).length,
      writingCapableUnder75: under75.filter(person => targetFacts(person, state, 'writing').capable).length,
      directingProvenUnder75: under75.filter(person => targetFacts(person, state, 'directing').proven).length,
      writingProvenUnder75: under75.filter(person => targetFacts(person, state, 'writing').proven).length,
      maxDirectingOvrUnder75: under75.length ? Math.max(...under75.map(person => targetFacts(person, state, 'directing').perceivedOvr)) : null,
      maxWritingOvrUnder75: under75.length ? Math.max(...under75.map(person => targetFacts(person, state, 'writing').perceivedOvr)) : null,
      firstTakeReceipts: state.firstTakes.length, releasedFilms: films.length,
      uncapturedPlayerFilms: state.studio.releasedFilms.filter(film => !film.participants).length,
      lifecycleRecords: state.careerLifecycle.records.length, cohortReceipts: state.careerLifecycle.cohorts.length,
    },
    candidates: candidates.map(person => actorFacts(person, state, films)),
    requestedFocus: input.focusIds.map(id => {
      const person = state.talent.find(row => row.id === id)
      assert.ok(person, `retained manifest focus ${id}`)
      assert.equal(person.role, 'actor')
      return actorFacts(person, state, films)
    }),
  }
  assert.equal(canonicalJson(state), beforeState, 'inventory derivations leave the validated state unchanged')
  return report
})

const afterSource = sourceIdentity()
assert.deepEqual(afterSource, beforeSource, 'source HEAD/diff/untracked set drifted')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256, 'producer drifted')
for (const input of inputChecks) assert.equal(sha(readFileSync(new URL(input.path, root))), input.sha256, `${input.path} drifted`)
console.log(JSON.stringify({
  probe: '940-c3-input-probe.ts', producerSha256, sourceBefore: beforeSource, sourceAfter: afterSource,
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  limits: { maximumCandidateRowsPerWorld: CANDIDATE_LIMIT, exampleIdsOrContextsPerGroup: SAMPLE_LIMIT },
  factsOnly: true, simulatedWeeks: 0, results,
}, null, 2))
