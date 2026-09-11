import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
const [directory, p13Attempt = 'p13-final', acceptedAttempt = 'p12'] = process.argv.slice(2)
const read = name => JSON.parse(readFileSync(directory + '/' + name, 'utf8'))
const sha = name => createHash('sha256').update(readFileSync(directory + '/' + name)).digest('hex')
const p12 = read(acceptedAttempt + '/store-report.json'), p13 = read(p13Attempt + '/store-report.json'), migration = read('migration-report.json'), library32 = existsSync(directory + '/library32-current/recovery-report.json') ? read('library32-current/recovery-report.json') : null
const generators = { p12: read('p12/generation-report.json'), p13: read('p13/generation-report.json') }
for (const [name, report] of Object.entries({ p12, p13, migration, ...(library32 ? { library32 } : {}), ...Object.fromEntries(Object.entries(generators).map(([k,v])=>[k+'Generator',v])) })) {
  if (!report.completed || report.errors.length) throw new Error(name + ' is not a completed successful measurement')
}
const percent = (value, reference) => 100 * (value / reference - 1)
const summarizeTicks = report => {
  const values = report.ticks.map(row => row.elapsedMs).sort((a,b)=>a-b)
  return { n: values.length, totalMs: values.reduce((sum,v)=>sum+v,0), medianMs: (values[3119]+values[3120])/2, p95Ms: values[Math.ceil(.95*values.length)-1], maxMs: values.at(-1) }
}
const compare = phase => {
  const control = p12[phase].summary, candidate = p13[phase].summary
  return { control, candidate,
    medianDifferenceMs: candidate.medianMs - control.medianMs,
    medianDifferencePercent: percent(candidate.medianMs, control.medianMs),
    p95DifferenceMs: candidate.p95Ms - control.p95Ms,
    p95DifferencePercent: percent(candidate.p95Ms, control.p95Ms),
    rangesOverlap: Math.max(control.minMs, candidate.minMs) <= Math.min(control.maxMs, candidate.maxMs),
    allCandidateSamplesAboveControlMaximum: candidate.minMs > control.maxMs,
    rawControlSamplesMs: p12[phase].samples.map(row => row.elapsedMs),
    rawCandidateSamplesMs: p13[phase].samples.map(row => row.elapsedMs) }
}
const report = { recordedAt: new Date().toISOString(), completedMeasurements: true, library32Complete: library32?.completed === true,
  matchedComparison: { save: compare('campaignSave'), loadReady: compare('loadReady'), qualification: 'Sequential coordinated quiet-window datasets, not interleaved randomized or statistical paired trials. These are empirical n20 distributions; no population confidence or numerical materiality threshold is inferred.' },
  authority: { p12: read(acceptedAttempt + '/performance-store-binding.json'), p13: read(p13Attempt + '/performance-store-binding.json'), migration: read('performance-migration-binding.json') },
  save: { acceptedGeneratedControl: p12.campaignSave.summary, p13Generated: p13.campaignSave.summary,
    retainedP12P95Ms: 9577.754, p95DifferenceFromRetainedMs: p13.campaignSave.summary.p95Ms - 9577.754,
    p95DifferenceFromRetainedPercent: percent(p13.campaignSave.summary.p95Ms, 9577.754),
    p95DifferenceFromGeneratedControlMs: p13.campaignSave.summary.p95Ms - p12.campaignSave.summary.p95Ms,
    p95DifferenceFromGeneratedControlPercent: percent(p13.campaignSave.summary.p95Ms, p12.campaignSave.summary.p95Ms),
    qualification: acceptedAttempt === 'p12' ? 'Generated accepted control included background P13 generator and native task activity. Workload at6240 differs from retained8794 library. These are observed comparisons, not isolated attribution or an invented acceptance threshold.' : 'Both generated controls used coordinated quiet windows; ordinary OS/background activity remains. Workload at6240 differs from retained8794 library. These are bounded observations, not an invented acceptance threshold.' },
  loadReady: { acceptedGeneratedControl: p12.loadReady.summary, p13Generated: p13.loadReady.summary, retainedP12P95Ms: 13414.888 },
  migration: { summary: migration.summary, input: migration.input, output: migration.output, sourceUnchanged: migration.completed },
  library32: library32 ? { fixture: read('library32-accepted/fixture-report.json'), recovery: library32, authority: read('library32-current/performance-library32-recovery-binding.json') } : { completed: false, disposition: 'Prepared only. STOP under Current Ops material incremental save/load regression escalation. All32-record fixture/recovery preparations remain unexecuted; no32-record results claimed.' },
  size: migration.size,
  endurance: Object.fromEntries(Object.entries(generators).map(([mode, value]) => [mode, { final: value.final, ticks: summarizeTicks(value), source: read(mode+'/performance-generator-binding.json') }])),
  correction: read('p09-history-reuse-correction.json'),
  reportFiles: Object.fromEntries(['p12/generation-report.json','p13/generation-report.json',acceptedAttempt+'/store-report.json',p13Attempt+'/store-report.json','migration-report.json','p09-history-reuse-correction.json',...(library32 ? ['library32-accepted/fixture-report.json','library32-current/recovery-report.json'] : [])].map(name => [name, sha(name)])),
  disposition: 'STOP under the Current Ops material incremental save/load regression condition. Matched empirical n20 Save/load ranges are disjoint, with all P13 observations slower. No numerical margin was supplied or invented. No optimization or32-record execution followed. Original P12 misses and unmeasured native input/transport/stress qualifications remain binding.' }
writeFileSync(directory + '/performance-summary.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify({ comparison: report.matchedComparison, save: report.save, migration: report.migration.summary, size: report.size.pairedWholeSaveDeltaBytes }))
