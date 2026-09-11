import { migrateToV20, validateSaveV19, exportSave, makeSave } from '../../src/core/save.ts'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { performance } from 'node:perf_hooks'
import { setImmediate as yieldNow } from 'node:timers/promises'

const [directory] = process.argv.slice(2)
const sha = value => createHash('sha256').update(value).digest('hex')
const bytes = value => Buffer.byteLength(JSON.stringify(value))
const assert = (value, message) => { if (!value) throw new Error(message) }
const raw = readFileSync(directory + '/p12/week-6240.save.json', 'utf8')
const source = validateSaveV19(JSON.parse(raw))
assert(source.state.market.tick === 6240, 'Migration input must be actual accepted6240-week V19')
const sourceSha = sha(JSON.stringify(source))
const report = { startedAt: new Date().toISOString(), warmups: [], samples: [], completed: false,
  input: { sha256: sha(raw), bytes: Buffer.byteLength(raw), saveVersion: source.saveVersion, week: source.state.market.tick },
  method: 'Exact accepted592e926-generated V19 input. JSON parse precedes timed migrateToV20 call; governed validation/migration are included. Three warmups and20 observed samples, ordinary GC.', errors: [] }
try {
  let converted
  for (let i = -3; i < 20; i++) {
    const parseStart = performance.now(), input = JSON.parse(raw), parseMs = performance.now() - parseStart
    const memoryBefore = process.memoryUsage(), start = performance.now()
    converted = migrateToV20(input)
    const elapsedMs = performance.now() - start
    report[i < 0 ? 'warmups' : 'samples'].push({ sample: i < 0 ? i + 3 : i, parseMs, migrationMs: elapsedMs,
      parsePlusMigrationMs: parseMs + elapsedMs, memoryBefore, memoryAfter: process.memoryUsage() })
    assert(sha(JSON.stringify(input)) === sourceSha, 'Migration mutated the accepted input')
    console.log(JSON.stringify({ phase: 'migration', sample: i, elapsedMs }))
    await yieldNow()
  }
  assert(converted.state.technology.recordingStartedWeek === 6240 && converted.state.technology.projects.length === 0 && converted.state.technology.productions.length === 0, 'Migration invented technology history')
  for (const key of ['studio', 'ledger', 'contracts', 'studioHistory', 'studioEvents', 'rngState']) assert(JSON.stringify(converted.state[key]) === JSON.stringify(source.state[key]), 'Migration changed ' + key)
  for (let i = 0; i < source.state.hollywood.businesses.length; i++) {
    const old = source.state.hollywood.businesses[i], current = converted.state.hollywood.businesses[i]
    assert(current.account.cash === old.account.cash, 'Migration moved rival cash')
    for (let p = 0; p < old.account.periods.length; p++) {
      const period = current.account.periods[p], prior = old.account.periods[p]
      assert(period.opening === prior.opening && period.closing === prior.closing && period.movements.technologyAdoption === 0, 'Migration changed finance history')
    }
  }
  const p13 = JSON.parse(readFileSync(directory + '/p13/week-6240.save.json', 'utf8'))
  const technology = p13.state.technology
  const perStudio = p13.state.hollywood.identities.map(identity => {
    const rows = Object.fromEntries(['projects', 'access', 'adoptions', 'productions'].map(key => [key, technology[key].filter(row => row.studioId === identity.studioId)]))
    const business = p13.state.hollywood.businesses.find(b => b.studioId === identity.studioId)
    const financeLeafBytes = (business?.account.periods ?? []).reduce((total, period) => {
      const stripped = { ...period.movements }; delete stripped.technologyAdoption
      return total + bytes(period.movements) - bytes(stripped)
    }, 0)
    return { studioId: identity.studioId, role: identity.role, enteredWeek: identity.enteredWeek,
      counts: Object.fromEntries(Object.entries(rows).map(([key, value]) => [key, value.length])),
      technologyRowsBytes: bytes(rows) - bytes({ projects: [], access: [], adoptions: [], productions: [] }), financeMovementLeafBytes: financeLeafBytes }
  })
  let researchPersonLeafBytes = 0
  for (const person of p13.state.talent) for (const key of ['skills', 'ceilings', 'devRate', 'workHistory', 'genreExperience']) {
    const stripped = { ...person[key] }; delete stripped.research
    researchPersonLeafBytes += bytes(person[key]) - bytes(stripped)
  }
  report.size = { p12WholeSaveBytes: Buffer.byteLength(raw), p13WholeSaveBytes: bytes(p13), pairedWholeSaveDeltaBytes: bytes(p13) - Buffer.byteLength(raw),
    technologyRootBytes: bytes(technology), researchPersonLeafBytes, perStudio,
    perStudioAttributionBytes: perStudio.reduce((sum, row) => sum + row.technologyRowsBytes + row.financeMovementLeafBytes, 0),
    hollywoodBudgetBytes: 8_000_000,
    qualification: 'Per-studio figures attribute exact technology-row payload and added finance movement keys; global research person leaves are separate. Physical records, causal changed outcomes and formatting/root delimiters are outside that subtotal. Paired whole saves show actual workload difference, not solely a field-removal estimate. No fabricated stripped save is validated or offered as loadable.' }
  const migratedJson = exportSave(makeSave(converted.state))
  report.output = { bytes: Buffer.byteLength(migratedJson), sha256: sha(migratedJson), migrationOnlyDeltaBytes: Buffer.byteLength(migratedJson) - Buffer.byteLength(raw), preservedExistingHistoryAndBalances: true }
  const values = report.samples.map(row => row.migrationMs).sort((a,b) => a-b)
  report.summary = { n: values.length, medianMs: (values[9]+values[10])/2, p95Ms: values[18], maxMs: values[19], minMs: values[0] }
  report.completed = true
} catch (error) { report.errors.push({ message: error.message, stack: error.stack }); process.exitCode = 1 }
finally { report.finishedAt = new Date().toISOString(); report.memory = { ...process.memoryUsage(), highWaterRssKiB: process.resourceUsage().maxRSS }; writeFileSync(directory + '/migration-report.json', JSON.stringify(report, null, 2)); console.log(JSON.stringify({ completed: report.completed, summary: report.summary, size: report.size, errors: report.errors })) }
