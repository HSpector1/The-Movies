import { openBridgeCheckpointStore } from '../../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator } from '../../bridge/runtime/runtime-coordinator.ts'
import { CAMPAIGN_LIBRARY_MAX_BYTES } from '../../bridge/runtime/campaign-library.ts'
import { decodeCampaignStorage } from '../../bridge/runtime/campaign-storage-codec.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS } from '../../bridge/runtime-checkpoint.ts'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { isDeepStrictEqual } from 'node:util'
import { cpus, totalmem, platform, release, arch } from 'node:os'
const [directory, fixturePath] = process.argv.slice(2)
mkdirSync(directory, { recursive: true })
const sha = value => createHash('sha256').update(value).digest('hex')
const assert = (value, message) => { if (!value) throw new Error(message) }
const report = { startedAt: new Date().toISOString(), completed: false, repetitions: 3, samples: [], errors: [],
  runtime: { node: process.version, executable: process.execPath, execArgv: process.execArgv },
  hardware: { platform: platform(), release: release(), arch: arch(), cpu: cpus()[0]?.model, logicalCpus: cpus().length, totalMemoryBytes: totalmem() },
  method: 'Three actual production store/coordinator recoveries of identical exact accepted32-record library bytes. Each timed interval starts before ownership acquisition, includes governed migration of every supported old checkpoint, canonical recompression and durable rewrite, and ends at first active snapshot. Reset, record-by-record verification, final decode and catalogue read are outside timing. Ordinary OS page cache/GC, no warmup or percentile claim; no HTTP/worker/native input measurement.' }
const root = directory + '/runtime', checkpointPath = root + '/bridge-runtime-v1.json'
mkdirSync(root, { recursive: true, mode: 0o700 })
let store = null, coordinator = null
const decode = text => decodeCampaignStorage(JSON.parse(text), DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS.maxCheckpointBytes, 32)
// Independent subtraction proof: no migration function supplies the expected value.
const RESEARCH_SKILLS = ['scientificMethod', 'acoustics', 'instrumentation', 'experimentation', 'engineering', 'documentation']
const RESEARCH_GENRES = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure']
let preservationChecks = 0
const preserved = (old, current, identity) => {
  assert(old.saveVersion === 19 && current.saveVersion === 20, 'Wrong migration versions: ' + identity)
  const a = old.state, b = current.state
  assert(b.market.tick === a.market.tick && b.technology.recordingStartedWeek === a.market.tick, 'Migration changed chronology: ' + identity)
  for (const key of ['projects', 'access', 'adoptions', 'productions']) assert(b.technology[key].length === 0, 'Migration invented technology: ' + identity)
  for (const key of ['studio', 'ledger', 'contracts', 'studioHistory', 'studioEvents', 'rngState']) assert(JSON.stringify(a[key]) === JSON.stringify(b[key]), 'Migration changed ' + key + ': ' + identity)
  assert(a.hollywood.businesses.length === b.hollywood.businesses.length, 'Migration changed businesses')
  for (let i = 0; i < a.hollywood.businesses.length; i++) {
    const prior = a.hollywood.businesses[i], next = b.hollywood.businesses[i]
    assert(next.studioId === prior.studioId && next.account.cash === prior.account.cash && next.account.periods.length === prior.account.periods.length, 'Migration changed rival account')
    for (let j = 0; j < prior.account.periods.length; j++) {
      const oldPeriod = prior.account.periods[j], newPeriod = next.account.periods[j]
      const movements = { ...newPeriod.movements }; delete movements.technologyAdoption
      assert(newPeriod.movements.technologyAdoption === 0 && JSON.stringify({ ...newPeriod, movements }) === JSON.stringify(oldPeriod), 'Migration changed retained rival period')
    }
  }
  assert(isDeepStrictEqual(b.technology, { version: 1, recordingStartedWeek: a.market.tick, projects: [], access: [], adoptions: [], productions: [] }), 'Migration technology root differs from exact neutral shape: ' + identity)
  assert(b.era.soundRequired === false, 'Migration failed approved silent-era rule: ' + identity)
  assert(b.talent.length === a.talent.length && b.talent.every((person, i) => person.id === a.talent[i].id), 'Migration added or reordered people: ' + identity)
  const projectedTalent = b.talent.map((person, i) => {
    const projected = { ...person }
    const expected = {
      skills: Object.fromEntries(RESEARCH_SKILLS.map(skill => [skill, { actual: 1, perceived: 1 }])),
      ceilings: Object.fromEntries(RESEARCH_SKILLS.map(skill => [skill, 1])),
      devRate: 1,
      genreExperience: Object.fromEntries(RESEARCH_GENRES.map(genre => [genre, { actual: 0, perceived: 0 }])),
      workHistory: 0,
    }
    for (const key of Object.keys(expected)) {
      assert(!Object.hasOwn(a.talent[i][key], 'research') && Object.hasOwn(person[key], 'research'), 'Migration research leaf is not additive: ' + identity)
      assert(isDeepStrictEqual(person[key].research, expected[key]), 'Migration invented non-neutral ' + key + '.research: ' + identity)
      const { research: _research, ...retained } = person[key]
      projected[key] = retained
    }
    return projected
  })
  const projectedBusinesses = b.hollywood.businesses.map((business, i) => ({
    ...business, account: { ...business.account, periods: business.account.periods.map((period, j) => {
      assert(!Object.hasOwn(a.hollywood.businesses[i].account.periods[j].movements, 'technologyAdoption'), 'Migration movement is not additive: ' + identity)
      assert(Object.hasOwn(period.movements, 'technologyAdoption') && period.movements.technologyAdoption === 0, 'Migration movement is not exact zero: ' + identity)
      const { technologyAdoption: _technologyAdoption, ...movements } = period.movements
      return { ...period, movements }
    }) },
  }))
  const { technology: _technology, ...retainedState } = b
  const projected = { ...current, saveVersion: 19, state: {
    ...retainedState, era: { ...b.era, soundRequired: a.era.soundRequired },
    talent: projectedTalent, hollywood: { ...b.hollywood, businesses: projectedBusinesses },
  } }
  assert(isDeepStrictEqual(projected, old), 'Migration changed original full save/state after exact authorized subtraction: ' + identity)
  preservationChecks++
}
try {
  const seed = readFileSync(fixturePath, 'utf8'), original = decode(seed)
  assert(original.records.length === 32, 'Expected32 records')
  report.input = { fixturePath, bytes: Buffer.byteLength(seed), sha256: sha(seed), records: original.records.map(record => ({ id: record.id, label: record.label, week: JSON.parse(JSON.parse(record.checkpointJson).currentSaveJson).state.market.tick })) }
  for (let i = 0; i < 3; i++) {
    store = await openBridgeCheckpointStore(checkpointPath, { runtimeRoot: root, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES })
    await store.writeAtomic(seed); await store.close(); store = null
    const memoryBefore = process.memoryUsage(), start = performance.now()
    store = await openBridgeCheckpointStore(checkpointPath, { runtimeRoot: root, maxBytes: CAMPAIGN_LIBRARY_MAX_BYTES })
    coordinator = await createBridgeRuntimeCoordinator({ store, campaigns: { durable: true, regime: 'endowed' }, fatal: error => report.errors.push({ fatal: String(error) }) })
    const snapshot = await coordinator.read(session => session.snapshot())
    const elapsedMs = performance.now() - start, memoryAfter = process.memoryUsage()
    const encoded = await store.read(), converted = decode(encoded), catalogue = await coordinator.campaignLibrary()
    assert(encoded !== seed && converted.records.length === 32 && catalogue.campaigns.length === 32 && snapshot.gameWeek === 6240, 'Recovery did not migrate complete library')
    assert(converted.activeCampaignId === original.activeCampaignId && converted.catalogueRevision === original.catalogueRevision, 'Recovery changed catalogue identity')
    assert(converted.legacyCheckpointJson === original.legacyCheckpointJson && JSON.stringify(converted.receipts) === JSON.stringify(original.receipts), 'Recovery changed retained provenance')
    const preservationChecksBefore = preservationChecks
    for (let j = 0; j < original.records.length; j++) {
      const prior = original.records[j], next = converted.records[j]
      assert(prior.id === next.id && prior.label === next.label && prior.revision === next.revision, 'Recovery changed record identity')
      const a = JSON.parse(prior.checkpointJson), b = JSON.parse(next.checkpointJson)
      preserved(JSON.parse(a.currentSaveJson), JSON.parse(b.currentSaveJson), prior.id)
      if (a.savedSaveJson === null) assert(b.savedSaveJson === null, 'Recovery invented a saved slot')
      else preserved(JSON.parse(a.savedSaveJson), JSON.parse(b.savedSaveJson), prior.id + ':saved')
      assert(catalogue.campaigns[j].gameWeek === JSON.parse(a.currentSaveJson).state.market.tick, 'Wrong record stage')
    }
    const oldWorking = JSON.parse(original.workingCheckpointJson), newWorking = JSON.parse(converted.workingCheckpointJson)
    preserved(JSON.parse(oldWorking.currentSaveJson), JSON.parse(newWorking.currentSaveJson), 'working')
    if (oldWorking.savedSaveJson === null) assert(newWorking.savedSaveJson === null, 'Recovery invented a working saved slot')
    else preserved(JSON.parse(oldWorking.savedSaveJson), JSON.parse(newWorking.savedSaveJson), 'working:saved')
    const decodedBytes = [converted.workingCheckpointJson, converted.legacyCheckpointJson ?? '', ...converted.records.map(record => record.checkpointJson)].reduce((n, text) => n + Buffer.byteLength(text), 0)
    assert(decodedBytes <= 1024 * 1024 * 1024 && Buffer.byteLength(encoded) <= CAMPAIGN_LIBRARY_MAX_BYTES, 'Migrated library exceeds unchanged bounds')
    assert(sha(readFileSync(fixturePath)) === report.input.sha256, 'Recovery changed accepted fixture bytes')
    report.samples.push({ sample: i, elapsedMs, memoryBefore, memoryAfter, outputBytes: Buffer.byteLength(encoded), decodedCheckpointBytes: decodedBytes, outputSha256: sha(encoded), allRecordsPreserved: true, fullSaveSubtractionProof: true, fullSaveComparisons: preservationChecks - preservationChecksBefore, neutralResearchProof: true, noNewPeople: true, activeDigest: snapshot.stateDigest })
    await coordinator.close(); coordinator = null; store = null
    assert(!existsSync(checkpointPath + '.lock'), 'Recovery retained lock')
    writeFileSync(directory + '/recovery-progress.json', JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report.samples.at(-1)))
  }
  report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally {
  try { if (coordinator) await coordinator.close(); else if (store) await store.close() } catch (error) { report.errors.push({ cleanup: String(error) }); report.completed = false; process.exitCode = 1 }
  report.finishedAt = new Date().toISOString(); report.lockAbsent = !existsSync(checkpointPath + '.lock')
  report.memory = { ...process.memoryUsage(), highWaterRssKiB: process.resourceUsage().maxRSS }
  writeFileSync(directory + '/recovery-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ completed: report.completed, samples: report.samples.map(row => row.elapsedMs), errors: report.errors }))
}
