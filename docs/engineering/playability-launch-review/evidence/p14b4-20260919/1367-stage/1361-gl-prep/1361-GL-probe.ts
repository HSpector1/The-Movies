// Bounded Save45 G-L preparation. Writes JSON stdout only; no fixtures or mutations.
// Full G-L remains incomplete until the separate seed-b post-2040 player release measurement.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { performance } from 'node:perf_hooks'
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import { makeSave, validateSaveV45, stableStringify, LIVE_SAVE_VERSION } from '../tree/src/core/save.ts'
import { CAMPAIGN_LEGACY_DEFINITION, LEGACY_BOUNDARY_WEEK, LEGACY_ARCHETYPE_IDS, freezeLegacy } from '../tree/src/core/campaignLegacy.ts'
import type { GameState } from '../tree/src/core/types.ts'
import type { LegacyManifest, OfficialLegacy } from '../tree/src/core/campaignLegacy.ts'
import { independentLegacyFactsFromState } from './1361-GL-independent-adapter.ts'

const sha = (text: string | Uint8Array) => createHash('sha256').update(text).digest('hex')
const B = LEGACY_BOUNDARY_WEEK
const referenceBytes = readFileSync(new URL('./gp-reference.json', import.meta.url))
const reference = JSON.parse(referenceBytes.toString('utf8')) as {
  probe: string; treeHead: string; law: string; weeks: number;
  seeds: { seed: string; manifestCanonical: string; manifestSha256: string }[]
}
function requireFact(value: unknown, message: string): asserts value { if (!value) throw new Error(`1361-GL: ${message}`) }
requireFact(LIVE_SAVE_VERSION === 45 && CAMPAIGN_LEGACY_DEFINITION === 'campaign-legacy/v2', 'requires the reviewed Save45/v2 source')
requireFact(reference.probe === '1361-GP-r2' && reference.weeks === B && reference.law === CAMPAIGN_LEGACY_DEFINITION, 'wrong historical G-P reference')
const unstamped = (manifest: OfficialLegacy): LegacyManifest => {
  const { legacySnapshotId, p15DomainSequence, phaseId, phaseOrdinal, phaseOrderVersion, ...plain } = manifest
  return plain
}
function capReport(manifest: LegacyManifest) {
  // Primary authority: 1353-A §5.2 shapes (domains16, archetypes8, lenses12, refs12/side, count keys4),
  // reiterated by 1359-A §5.1(5). Studios10 is this fixed world's one-player+nine-rival roster
  // (hollywoodValidation.ts identities rule), also the1353-A §5.2 size calculation.
  // Approximate140KB prose is not a new hard byte limit.
  const sides = manifest.studios.flatMap(s => s.archetypes.flatMap(a => [a.qualifying.length, a.contrary.length]))
  const lenses = manifest.studios.flatMap(s => s.lenses.map(l => l.refs.length))
  const ok = manifest.sources.length <= 16 && manifest.studios.length <= 10 && manifest.studios.every(s =>
    s.archetypes.length === 8 && s.lenses.length <= 12 && s.lenses.every(l => Object.keys(l.counts).length <= 4)) &&
    sides.every(n => n <= 12) && lenses.every(n => n <= 12)
  return { ok, sources: manifest.sources.length, studios: manifest.studios.length,
    maxArchetypeSideRefs: Math.max(0, ...sides), maxLensRefs: Math.max(0, ...lenses),
    refsTotal: sides.reduce((a, b) => a + b, 0) + lenses.reduce((a, b) => a + b, 0),
    byteEstimateOnly: '1353-A §5.2 says about 140 KB; structural caps above are the hard bounds' }
}
function holders(manifest: LegacyManifest) {
  return Object.fromEntries(LEGACY_ARCHETYPE_IDS.map(id => [id, Object.fromEntries(['held', 'notHeld', 'notRecorded'].map(outcome =>
    [outcome, manifest.studios.filter(s => s.archetypes.find(a => a.archetypeId === id)?.outcome === outcome).map(s => s.studioId)]))]))
}
function timing(state: GameState, label: string) {
  const officialBefore = stableStringify(state.campaignLegacy.official)
  const samples: { makeSaveMs: number; validateSaveV45Ms: number; combinedMs: number; bytes: number }[] = []
  for (let i = 0; i < 3; i++) {
    const start = performance.now(), save = makeSave(state), made = performance.now()
    validateSaveV45(save)
    const validated = performance.now()
    samples.push({ makeSaveMs: made - start, validateSaveV45Ms: validated - made, combinedMs: validated - start,
      bytes: Buffer.byteLength(JSON.stringify(save), 'utf8') })
  }
  requireFact(stableStringify(state.campaignLegacy.official) === officialBefore, `${label} changed official Legacy`)
  return { label, week: state.market.tick, samples,
    note: 'makeSave already validates and detaches; the separately timed validateSaveV45 call is additional validation. Serialization-size work excluded from both timers.' }
}
function runSeed(seed: string) {
  const begun = performance.now()
  let state = p13aGeneratedStudio(seed), freezeTickMs: number | null = null
  while (state.market.tick < B) {
    const isFreeze = state.market.tick === B - 1, t = performance.now()
    state = tick(state)
    if (isFreeze) freezeTickMs = performance.now() - t
    if (state.market.tick % 520 === 0) console.error(`[1361-GL] ${seed} week ${state.market.tick}: ${Math.round(performance.now() - begun)}ms`)
  }
  const routeMs = performance.now() - begun
  requireFact(!('corporateCondition' in state), 'Save45 comparison cannot carry P15B')
  requireFact(state.campaignLegacy.official !== null, `${seed} did not freeze at ${B}`)
  const stamped = state.campaignLegacy.official, plain = unstamped(stamped), canonical = stableStringify(plain)
  const stampCanonical = stableStringify(stamped)
  const previous = reference.seeds.find(s => s.seed === seed)
  requireFact(previous !== undefined && sha(previous.manifestCanonical) === previous.manifestSha256, `${seed} reference hash mismatch`)
  const adaptStart = performance.now(), facts = independentLegacyFactsFromState(state, B), adapted = performance.now()
  const independentlyBuilt = freezeLegacy({ version: 1, recordedFromWeek: 0, official: null, endOfRun: null }, B, facts).official
  const built = performance.now()
  requireFact(independentlyBuilt !== null, 'independent adapter/law did not produce a manifest')
  const cap = capReport(plain)
  const checks = { liveVsHistoricalGP: canonical === previous.manifestCanonical,
    liveVsIndependentAdapterOnSameRoute: canonical === stableStringify(independentlyBuilt), caps: cap.ok }
  const saveTimings = seed === 'seed-b' ? [timing(state, 'natural-seed-b-6240')] : []
  const atB = { seed, finalWeek: B, routeMs, freezeTickMs,
    independentAdapterMs: adapted - adaptStart, independentLawMs: built - adapted,
    manifestBytes: Buffer.byteLength(canonical, 'utf8'), stampedManifestBytes: Buffer.byteLength(stampCanonical, 'utf8'),
    manifestSha256: sha(canonical), manifestCanonical: canonical, stampCanonical,
    domainTable: plain.sources, holders: holders(plain), cap, checks }
  if (seed === 'seed-b') {
    const extensionStart = performance.now()
    while (state.market.tick < 8791) {
      state = tick(state)
      if (state.market.tick % 520 === 0) console.error(`[1361-GL] seed-b extension week ${state.market.tick}`)
    }
    requireFact(stableStringify(state.campaignLegacy.official) === stampCanonical, 'official Legacy changed after 2040')
    saveTimings.push(timing(state, 'natural-seed-b-8791'))
    return { ...atB, saveTimings, extension: { week: state.market.tick, ms: performance.now() - extensionStart,
      officialUnchanged: true, playerCash: state.studio.cash, contracts: state.contracts.length,
      activeProductions: state.studio.activeProductions.length, playerReleases: state.studio.releasedFilms.length,
      foundingOpen: state.founding !== null, operationsMode: state.operations.mode } }
  }
  return { ...atB, saveTimings, extension: null }
}
const runs = ['p13a-core-causal-01', 'seed-b'].map(runSeed)
const retune = LEGACY_ARCHETYPE_IDS.map(id => {
  const rows = runs.map(run => ({ seed: run.seed, studios: run.cap.studios,
    held: (run.holders[id]!.held as string[]).length, recorded: (run.holders[id]!.notRecorded as string[]).length < run.cap.studios }))
  const exempt = id === 'resilient-survivor' && runs.every(run => run.domainTable.find(d => d.domainId === 'corporateCondition')?.status === 'notRecorded')
  return { id, rows, exempt, trigger: !exempt && rows.some(r => r.recorded) && (rows.every(r => r.held === r.studios) || rows.every(r => r.held === 0)) }
})
const passed = runs.every(r => Object.values(r.checks).every(Boolean))
console.log(JSON.stringify({ probe: '1361-GL-natural-r1', sourceHead: process.env.PROBE_TREE_HEAD,
  reference: { probe: reference.probe, head: reference.treeHead, sha256: sha(referenceBytes) },
  runs, retune, retuneFindings: retune.filter(row => row.trigger).map(row => row.id),
  retuneDisposition: 'Any trigger remains a finding requiring the adopted retune route even when measuredSubsetPassed is true and process exits0',
  measuredSubsetPassed: passed,
  closureComplete: false, post2040PlayerRelease: { status: 'not-measured', requiredBy: '1361-F6 ruling3',
    reason: 'The prescribed natural G-P routes issue no player operating actions. A separate lawful seed-b operating continuation must produce a real post-2040 player release; no film/cash/employment is injected here.' },
  timingLimits: { freezeTick: 'report only (1359-A §9)', saveCalls: 'report only; parent compares actual harness/Bridge execution ceiling without treating this isolated call as a full step' },
}, null, 2))
if (!passed) process.exitCode = 1
// Exit0 means this measured subset succeeded; closureComplete remains explicitly false.
