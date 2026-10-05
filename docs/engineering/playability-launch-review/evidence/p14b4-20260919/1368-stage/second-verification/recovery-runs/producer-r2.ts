// Bounded original-engine capture, not behavioral GREEN or natural cutting proof.
import { existsSync, lstatSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { expect, it } from 'vitest'
import * as save from '../src/core/save.js'
import { admitRivalPlans, rivalFacilityDisposalEligibility } from '../src/core/rivalResearch.js'
import { blueprintById } from '../src/core/placement.js'
import type { GameState } from '../src/core/types.js'
import { loadArchivedEngine, ordinaryPath, requireFact, sha256 } from './helpers/1368-archived-route.js'

const SEED = 'p13a-core-causal-01'
const bytes = save.stableStringify
const env = (name: string) => { const value = process.env[name]; requireFact(value, `required environment ${name}`); return value }
function qualifierSource() {
  const rows: { path: string; sha256: string }[] = []
  function walk(dir: string): void {
    for (const name of readdirSync(dir).sort()) {
      const path = join(dir, name), stat = lstatSync(path)
      requireFact(!stat.isSymbolicLink(), 'qualifier source symlink refused')
      if (stat.isDirectory()) walk(path)
      else { requireFact(stat.isFile(), 'qualifier ordinary source required'); rows.push({ path, sha256: sha256(readFileSync(path)) }) }
    }
  }
  walk('src')
  rows.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0)
  return sha256(JSON.stringify(rows))
}
const coreWeekly = () => ['development-casting-office', 'stage-standard', 'scenery-shop', 'post-building']
  .reduce((n, id) => n + blueprintById(id)!.weeklyOperatingCost, 0)
const sumOpex = (b: NonNullable<GameState['hollywood']>['businesses'][number]) => b.account.periods.reduce((n, p) => n + p.movements.facilityOpex, 0)
type Row = { key: string; file: string; rawSha256: string; gzipSha256: string; week: number; version: number;
  studioId?: string; facilityId?: string; projectId?: string; qualification: string }

it('1368 original-source fixed route captures only publicly admitted premises', async () => {
  const mode = env('P1368_MODE')
  requireFact(mode === 'save45' || mode === 'period26', 'exact capture mode required')
  const version = mode === 'save45' ? 45 : 26, horizon = version === 45 ? 520 : 52
  const repo = ordinaryPath(env('P1368_REPO')), archive = ordinaryPath(env('P1368_ARCHIVE'))
  const recordingHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim()
  requireFact(recordingHead === env('P1368_RECORDING_HEAD'), 'recording HEAD differs')
  const out = resolve(env('P1368_OUTPUT'))
  requireFact(out === env('P1368_OUTPUT'), 'canonical absolute output required')
  ordinaryPath(dirname(out))
  requireFact(!existsSync(out), 'exclusive output already exists')
  // existsSync is false for dangling symlinks, so inspect that case explicitly.
  try { lstatSync(out); throw new Error('exclusive output already exists') }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  for (const root of [repo, archive, resolve('.')]) requireFact(out !== root && !out.startsWith(root + sep) && !root.startsWith(out + sep), 'output/source overlap')
  const qualifierPin = qualifierSource()
  requireFact(qualifierPin === env('P1368_QUALIFIER_SRC_SHA256'), 'independently recorded qualifier source pin differs')
  const authoringFiles = ['tests/1368-recovery-witness-producer.test.ts', 'tests/helpers/1368-archived-route.ts']
    .map(path => ({ path, sha256: sha256(readFileSync(ordinaryPath(resolve(path)))) }))
  const engine = await loadArchivedEngine(repo, archive, version, env('P1368_ARCHIVE_SHA256'))
  requireFact(save.LIVE_SAVE_VERSION === 46, 'qualification requires coherent actual Save46 source')
  mkdirSync(out)
  const rows: Row[] = [], observations: unknown[] = []
  const publicReader = version === 45 ? save.validateSaveV45 : save.validateSaveV26
  const oldReader = engine.save['validateSaveV' + version]
  requireFact(typeof oldReader === 'function', 'archived own-era reader missing')
  const admittedOldReader = oldReader as (value: unknown) => unknown
  function envelope(state: unknown) {
    const before = bytes(state)
    const value: unknown = engine.save.makeSave(state), original = bytes(value)
    requireFact(bytes(state) === before, 'archived writer mutated state')
    requireFact(admittedOldReader(value) === value && bytes(value) === original, 'archived reader mutation')
    requireFact(publicReader(value) === value && bytes(value) === original, 'current own-era reader mutation')
    const serialized = engine.save.exportSave(value)
    requireFact(bytes(value) === original, 'archived export mutated input')
    const imported = engine.save.importSave(serialized)
    requireFact(bytes(imported) === original, 'archived roundtrip differs')
    requireFact(bytes(state) === before, 'boundary reader mutated state')
    return value
  }
  function capture(key: string, value: unknown, detail: Omit<Row, 'key'|'file'|'rawSha256'|'gzipSha256'|'week'|'version'>) {
    if (rows.some(r => r.key === key)) return
    const before = bytes(value)
    const raw = engine.save.exportSave(value), gz = gzipSync(raw), file = key + '.json.gz'
    requireFact(bytes(value) === before, 'capture export mutated input')
    const admitted = publicReader(value)
    requireFact(bytes(value) === before, 'capture reader mutated input')
    writeFileSync(join(out, file), gz, { flag: 'wx' })
    requireFact(sha256(readFileSync(join(out, file))) === sha256(gz), 'capture write differs')
    rows.push({ key, file, version, week: admitted.state.market.tick, rawSha256: sha256(raw), gzipSha256: sha256(gz), ...detail })
  }
  let state: unknown = engine.genesis(SEED)
  const origin = envelope(state), originSha256 = sha256(bytes(origin))
  for (let week = 0; week <= horizon; week++) {
    requireFact((state as { market: { tick: number } }).market.tick === week, 'actual historical clock differs')
    if (version === 45) {
      // Cheap source-shaped filter, then full archived/public45/public46 admission.
      // It never mutates or ticks a migrated/synthetic state.
      const rawState = state as GameState
      const interesting = week === 265 || week === 280 || rawState.hollywood!.businesses.some(b =>
        b.productions.length === 0 && b.runs.length === 0 && b.operations.facilities.some(f => f.capability === 'laboratory')
        && !rawState.talentMarket.proposals.some(p => p.issuerStudioId === b.studioId))
      if (interesting) {
        const old = save.validateSaveV45(envelope(state)), oldBefore = bytes(old)
        const live = save.convertV45ToV46(old)
        requireFact(save.validateSaveV46(live) === live && bytes(old) === oldBefore, 'real45 migration/admission failed neutrality')
        requireFact(bytes(save.convertV46ToV45(live)) === oldBefore, 'zero-initialization roundtrip differs')
        if (week === 265) capture('baseline265', old, { qualification: 'Public45/46 admitted named instrument-boundary baseline only; no demand/hire/project/seat witness claim' })
        if (week === 280) capture('baseline280', old, { qualification: 'Public45/46 admitted ordinary baseline only; no C/B witness claim' })
        for (const owner of live.state.hollywood!.businesses) {
          if (owner.productions.length || owner.runs.length || owner.costCutting.since !== null
            || live.state.talentMarket.proposals.some(p => p.issuerStudioId === owner.studioId)) continue
          const candidate = structuredClone(live), selected = candidate.state.hollywood!.businesses.find(b => b.studioId === owner.studioId)!
          selected.costCutting.since = week
          save.validateSaveV46(candidate) // Only explicitly synthetic since; never written as historical payload.
          const inverse = structuredClone(candidate); inverse.state.hollywood!.businesses.find(b => b.studioId === owner.studioId)!.costCutting.since = null
          requireFact(bytes(inverse) === bytes(live), 'synthetic since changed unrelated authority')
          for (const facility of owner.operations.facilities.filter(f => f.capability === 'laboratory')) {
            const candidateBefore = bytes(candidate)
            const eligibility = rivalFacilityDisposalEligibility(candidate.state, owner.studioId, facility.id)
            requireFact(bytes(candidate) === candidateBefore, 'eligibility mutated synthetic control')
            if (eligibility.eligible) {
              const op = owner.operations.facilities.length === 5 && live.state.hollywood!.receipts.find(r =>
                r.kind === 'laboratoryOperational' && r.studioId === owner.studioId && r.facilityId === facility.id)
              // Keep original C5 core-only ledger assertion: no silent weakening for a second lab.
              const entered = live.state.hollywood!.identities.find(r => r.studioId === owner.studioId)!.enteredWeek!
              const exactOperational = op && op.week === week && sumOpex(owner) === -(week - entered) * coreWeekly()
              const detail = { studioId: owner.studioId, facilityId: facility.id,
                qualification: 'Original45 idle/no-run/no-proposal; public46 null since; only-since synthetic control admitted and exact disposal eligibility true; five total facilities' }
              if (owner.operations.facilities.length === 5) {
                if (week % 52 !== 0) capture('ordinary', old, detail)
                if (week > 0 && week % 52 === 0) capture('calendar', old, detail)
                if (exactOperational) capture('operational', old, detail)
              }
            } else if (eligibility.reason === 'research-history') {
              const project = live.state.technology.projects.find(p => p.id === eligibility.subjectId
                && p.studioId === owner.studioId && p.laboratoryFacilityId === facility.id)
              if (project) capture('research', old, { studioId: owner.studioId, facilityId: facility.id, projectId: project.id,
                qualification: 'Original45 idle/null-since control; actual retained primary project; synthetic since admitted; exact research-history refusal' })
            }
          }
        }
      }
    } else if (week === horizon) {
      const old = save.validateSaveV26(envelope(state)), original = bytes(old), lifted = save.migrateToV27(old)
      requireFact(save.validateSaveV27(lifted) === lifted && bytes(old) === original, 'real26→27 lift must admit neutrally')
      const before = bytes(lifted), result = admitRivalPlans(lifted.state as unknown as GameState, 'pre-recovery')
      requireFact(bytes(lifted) === before && result.history.length === 0, 'historical admission input/history changed')
      const prior = new Set(lifted.state.physicalPlans.plans.map(p => p.id))
      const added = result.state.physicalPlans.plans.filter(p => !prior.has(p.id))
      const facts = added.map(plan => {
        const oldOwner = lifted.state.hollywood!.businesses.find(b => b.studioId === plan.studioId)!
        const owner = result.state.hollywood!.businesses.find(b => b.studioId === plan.studioId)!
        const previous = oldOwner.account.periods.at(-1)!, last = owner.account.periods.at(-1)!
        return { planId: plan.id, studioId: plan.studioId, paid: plan.commitReceipt?.cost, work: plan.work,
          previousThrough: previous.throughWeek, previousFrom: previous.fromWeek, last,
          cashBefore: oldOwner.account.cash, cashAfter: owner.account.cash,
          opensNewOldPeriod: Math.floor(previous.fromWeek / 52) < 1 && previous.throughWeek < 52
            && owner.account.periods.length === oldOwner.account.periods.length + 1 && last.fromWeek === 52 && last.throughWeek === 52 }
      })
      observations.push({ week, added: facts })
      // Required lawful paid-plan premise; target money-roster assertions stay in consumer test.
      if (added.length > 0 && facts.every(f => f.opensNewOldPeriod && f.paid !== undefined && f.paid > 0)
        && added.every(p => p.status === 'started' && p.work.kind === 'placement' && p.work.blueprintId === 'research-laboratory')) {
        requireFact(save.validateSaveV27({ ...lifted, state: result.state }), 'admission output must validate27')
        capture('period52', old, { qualification: 'Genuine26 boundary52; real public27 lift and paid rival lab admission opens prior-year period; exact target assertions remain consumer responsibility' })
      }
    }
    if (week < horizon) {
      const before = bytes(state)
      const next = engine.tick(state, { develop: true })
      requireFact(bytes(state) === before, 'original tick mutated input')
      state = next
    }
  }
  const final = envelope(state), post = engine.postflight()
  requireFact(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim() === recordingHead, 'recording HEAD postflight differs')
  requireFact(qualifierSource() === qualifierPin, 'qualifier source postflight differs')
  for (const row of authoringFiles) requireFact(sha256(readFileSync(row.path)) === row.sha256, 'producer changed during run')
  const required = version === 45 ? ['ordinary', 'calendar', 'operational', 'research', 'baseline265', 'baseline280'] : ['period52']
  const missing = required.filter(key => !rows.some(r => r.key === key))
  const manifest = { format: '1368-recovery-witness/v1', mode, historicalGeneratingHead: engine.pre.head,
    archiveSha256: engine.pre.sha256, archivePostflightSha256: post.sha256,
    qualifierSourceSha256: qualifierPin, recordingRepositoryHead: recordingHead, authoringFiles,
    seed: SEED, start: 0, horizon, ticks: horizon, options: { develop: true }, originSha256,
    finalStateSha256: sha256(bytes(final)), rows, missing, observations,
    status: missing.length === 0 ? 'COMPLETE_PREMISES' : 'PARTIAL_PREMISES',
    limitation: 'Capture route only. Individual rows require independent provenance acceptance and full consumer assertions; absent rows are not waived.' }
  const text = JSON.stringify(manifest, null, 2) + '\n'
  writeFileSync(join(out, 'MANIFEST.json'), text, { flag: 'wx' })
  writeFileSync(join(out, 'RESULT.json'), JSON.stringify({ manifestSha256: sha256(text), status: manifest.status, missing }, null, 2) + '\n', { flag: 'wx' })
  expect(engine.postflight().sha256).toBe(engine.pre.sha256)
  expect(missing, 'bounded route completed but required witness is absent; retain partial bytes, no automatic widening').toEqual([])
}, 300_000)
