import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [directory] = process.argv.slice(2)
const read = name => JSON.parse(readFileSync(directory + '/' + name, 'utf8'))
const sha = name => createHash('sha256').update(readFileSync(directory + '/' + name)).digest('hex')
const p12 = read('p12/store-report.json'), p13 = read('p13/store-report.json'), migration = read('migration-report.json')
const generators = { p12: read('p12/generation-report.json'), p13: read('p13/generation-report.json') }
for (const [name, report] of Object.entries({ p12, p13, migration, ...Object.fromEntries(Object.entries(generators).map(([k,v])=>[k+'Generator',v])) })) {
  if (!report.completed || report.errors.length) throw new Error(name + ' is not a completed successful measurement')
}
const percent = (value, reference) => 100 * (value / reference - 1)
const summarizeTicks = report => {
  const values = report.ticks.map(row => row.elapsedMs).sort((a,b)=>a-b)
  return { n: values.length, totalMs: values.reduce((sum,v)=>sum+v,0), medianMs: (values[3119]+values[3120])/2, p95Ms: values[Math.ceil(.95*values.length)-1], maxMs: values.at(-1) }
}
const report = { recordedAt: new Date().toISOString(), completed: true,
  authority: { p12: read('p12/performance-store-binding.json'), p13: read('p13/performance-store-binding.json'), migration: read('performance-migration-binding.json') },
  save: { acceptedGeneratedControl: p12.campaignSave.summary, p13Generated: p13.campaignSave.summary,
    retainedP12P95Ms: 9577.754, p95DifferenceFromRetainedMs: p13.campaignSave.summary.p95Ms - 9577.754,
    p95DifferenceFromRetainedPercent: percent(p13.campaignSave.summary.p95Ms, 9577.754),
    p95DifferenceFromGeneratedControlMs: p13.campaignSave.summary.p95Ms - p12.campaignSave.summary.p95Ms,
    p95DifferenceFromGeneratedControlPercent: percent(p13.campaignSave.summary.p95Ms, p12.campaignSave.summary.p95Ms),
    qualification: 'Generated accepted control included background P13 generator and native task activity. Workload at6240 differs from retained8794 library. These are observed comparisons, not isolated attribution or an invented acceptance threshold.' },
  loadReady: { acceptedGeneratedControl: p12.loadReady.summary, p13Generated: p13.loadReady.summary, retainedP12P95Ms: 13414.888 },
  migration: { summary: migration.summary, input: migration.input, output: migration.output, sourceUnchanged: migration.completed },
  size: migration.size,
  endurance: Object.fromEntries(Object.entries(generators).map(([mode, value]) => [mode, { final: value.final, ticks: summarizeTicks(value), source: read(mode+'/performance-generator-binding.json') }])),
  correction: read('p09-history-reuse-correction.json'),
  reportFiles: Object.fromEntries(['p12/generation-report.json','p13/generation-report.json','p12/store-report.json','p13/store-report.json','migration-report.json','p09-history-reuse-correction.json'].map(name => [name, sha(name)])),
  disposition: 'Bounded measurements only. Original P12 performance misses and unmeasured native input/transport/stress qualifications remain binding. Current Ops supplied no numerical incremental-regression margin; final disposition must use the exact evidence without inventing one.' }
writeFileSync(directory + '/performance-summary.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify({ save: report.save, migration: report.migration.summary, size: report.size.pairedWholeSaveDeltaBytes }))
