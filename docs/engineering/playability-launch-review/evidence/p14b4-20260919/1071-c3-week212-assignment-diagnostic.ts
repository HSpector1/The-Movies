// Parent-only execution after source/reviewer freeze. No fixture or file writes.
// node_modules/.bin/vite-node --script <this file>
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { exportSave, importSave, makeSave, migrateToLive, validateSaveV37, validateSaveV38 } from '../../../../../src/core/save.ts'
import { tick } from '../../../../../src/core/tick.ts'
import type { GameState, Production, ScriptDevelopment } from '../../../../../src/core/types.ts'

const EXPECTED_HEAD = 'b71d4599b071bbe7258e992141acdb6056831cd1'
const FOCUS = 'person-studio-de11f27b-r03-0'
const root = new URL('../../../../../', import.meta.url)
const directory = 'tests/fixtures/p14/genuine-v37-c3-corpus/'
const filename = 'genuine-v37-c3-preretirement-week207.json.gz'
const pins = {
  manifest: 'b3a3251ae7b3df96a1e2a615991744c5d1e5966a095424693f086a1581244294',
  compressed: '926de1b20fa0cba9b822c05f542f0a3949c7e4b21560c2fa508b6fa3168af5a0',
  raw: 'd6ad88d432b3ec75fbf6a2843493240d4007892c8230aea1f9a2350adc8c1045',
} as const
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const git = (...args: string[]) => execFileSync('git', args,
  { cwd: fileURLToPath(root), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
const sourcePaths = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const sourceIdentity = () => ({ head: git('rev-parse', 'HEAD').trim(),
  diffSha256: sha(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...sourcePaths)),
  untracked: git('ls-files', '--others', '--exclude-standard', '--', ...sourcePaths).trim() })
const read = (path: string) => readFileSync(new URL(path, root))
const producerSha256 = sha(readFileSync(fileURLToPath(import.meta.url)))
const sourceBefore = sourceIdentity()
assert.equal(sourceBefore.head, EXPECTED_HEAD)
assert.equal(sourceBefore.untracked, '', 'parent must capture every consumed source before execution')

type Assignment = {
  personId: string; studioId: string; workId: string; kind: 'production' | 'screenplay';
  role: string; status: string; startWeek: number; dueWeek: number | null;
}
type Work = { studioId: string; workId: string; kind: 'production' | 'screenplay' }
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const workKey = (row: Work) => JSON.stringify([row.studioId, row.kind, row.workId])
function observe(state: GameState) {
  assert.ok(state.hollywood)
  const assignments: Assignment[] = [], works: Work[] = []
  const writerCredits: { studioId: string; workId: string; personId: string }[] = []
  const productions = (studioId: string, rows: readonly Production[]) => {
    for (const production of rows) {
      works.push({ studioId, workId: production.id, kind: 'production' })
      // A permanent screenplay credit is not an active production seat.
      writerCredits.push({ studioId, workId: production.id, personId: production.writerId })
      const seats: [string, string][] = [[production.directorId, 'director'],
        ...Object.entries(production.cast).map(([role, id]): [string, string] => [id, role]),
        ...production.craftIds.map((id): [string, string] => [id, 'craft'])]
      for (const [personId, role] of seats) assignments.push({ personId, studioId, workId: production.id,
        kind: 'production', role, status: 'active', startWeek: production.startTick, dueWeek: null })
    }
  }
  const scripts = (studioId: string, development: ScriptDevelopment) => {
    for (const project of development.projects) {
      works.push({ studioId, workId: project.id, kind: 'screenplay' })
      if (project.status !== 'drafting' && project.status !== 'rewriting') continue
      // Independent retained-field census. Include the attributed writer even
      // if a malformed pool were to omit it; do not use busyTalentIds/validator.
      const writers = [...new Set([project.writerId, ...project.writerIds])]
      for (const personId of writers) assignments.push({ personId, studioId, workId: project.id,
        kind: 'screenplay', role: 'writer', status: project.status,
        startWeek: project.commissionedWeek, dueWeek: project.dueWeek })
    }
  }
  productions(state.hollywood.playerStudioId, state.studio.activeProductions)
  scripts(state.hollywood.playerStudioId, state.scriptDevelopment)
  for (const business of state.hollywood.businesses) {
    productions(business.studioId, business.productions)
    scripts(business.studioId, business.development)
  }
  assignments.sort((a, b) => compare(JSON.stringify(a), JSON.stringify(b)))
  works.sort((a, b) => compare(workKey(a), workKey(b)))
  const byPerson = new Map<string, Assignment[]>()
  for (const row of assignments) byPerson.set(row.personId, [...(byPerson.get(row.personId) ?? []), row])
  const collisions = [...byPerson].filter(([, rows]) => rows.length > 1)
    .sort(([a], [b]) => compare(a, b)).map(([personId, rows]) => ({ personId, assignments: rows }))
  return { week: state.market.tick, assignments, works, collisions,
    focus: assignments.filter(row => row.personId === FOCUS),
    focusWriterCredits: writerCredits.filter(row => row.personId === FOCUS) }
}
const message = (error: unknown) => error instanceof Error ? error.message : String(error)
function proof(state: GameState) {
  try {
    const envelope = makeSave(state)
    assert.equal(envelope.saveVersion, 38)
    assert.equal(validateSaveV38(envelope), envelope)
    return { accepted: true, saveSha256: sha(exportSave(envelope)), refusal: null }
  } catch (error) { return { accepted: false, saveSha256: null, refusal: message(error) } }
}

const manifestBytes = read(`${directory}MANIFEST.json`)
assert.equal(sha(manifestBytes), pins.manifest)
const manifest = JSON.parse(manifestBytes.toString('utf8')) as {
  saveVersion: number; projectionVersion: number; sourceSha: string;
  artifacts: { filename: string; compressedSha256: string; uncompressedSha256: string }[]
}
assert.equal(manifest.saveVersion, 37); assert.equal(manifest.projectionVersion, 52)
assert.equal(manifest.sourceSha, '1f44aa505c0d677430451ab5fcacaf5e0ce205d6')
const artifact = manifest.artifacts.find(row => row.filename === filename)
assert.ok(artifact)
assert.equal(artifact.compressedSha256, pins.compressed); assert.equal(artifact.uncompressedSha256, pins.raw)
const compressed = read(directory + filename), raw = gunzipSync(compressed).toString('utf8')
assert.equal(sha(compressed), pins.compressed); assert.equal(sha(raw), pins.raw)
const old = validateSaveV37(JSON.parse(raw))
assert.equal(old.state.market.tick, 207); assert.equal(exportSave(old), raw)
let state = migrateToLive(importSave(raw)).state
const initialProof = proof(state)
assert.ok(initialProof.accepted, `genuine migrated207 must pass whole38: ${initialProof.refusal}`)
assert.equal(observe(state).collisions.length, 0, 'accepted207 has no simultaneous assignment')

let reserved = 0, completed = 0
let stoppedAt: 'bound' | 'tick-refusal' | 'save-refusal' = 'bound'
const observations: unknown[] = []
for (let index = 0; index < 5; index++) {
  assert.equal(state.market.tick, 207 + index)
  assert.ok(reserved < 5)
  const before = observe(state)
  reserved++
  let after: GameState
  try { after = tick(state, { develop: true }) }
  catch (error) {
    observations.push({ sourceWeek: before.week, tickReturned: false, tickRefusal: message(error),
      beforeCollisions: before.collisions, beforeFocus: before.focus, beforeWriterCredits: before.focusWriterCredits })
    stoppedAt = 'tick-refusal'; break
  }
  completed++
  assert.equal(after.market.tick, before.week + 1)
  // Capture actual assignments BEFORE the whole-save boundary that failed1033.
  const captured = observe(after), priorWorks = new Set(before.works.map(workKey))
  const validation = proof(after)
  observations.push({ sourceWeek: before.week, returnedWeek: captured.week, tickReturned: true,
    beforeAssignmentCount: before.assignments.length, afterAssignmentCount: captured.assignments.length,
    beforeCollisions: before.collisions, afterCollisions: captured.collisions,
    beforeFocus: before.focus, afterFocus: captured.focus,
    beforeWriterCredits: before.focusWriterCredits, afterWriterCredits: captured.focusWriterCredits,
    addedWork: captured.works.filter(row => !priorWorks.has(workKey(row))), validation })
  state = after
  if (!validation.accepted) { stoppedAt = 'save-refusal'; break }
}
assert.ok(reserved <= 5 && completed <= reserved)
assert.equal(state.market.tick, 207 + completed)
assert.deepEqual(sourceIdentity(), sourceBefore, 'consumed source/HEAD changed during diagnostic')
assert.equal(sha(readFileSync(fileURLToPath(import.meta.url))), producerSha256)
assert.equal(sha(read(`${directory}MANIFEST.json`)), pins.manifest)
assert.equal(sha(read(directory + filename)), pins.compressed)
const result = { producer: '1071-c3-week212-assignment-diagnostic.ts', producerSha256, source: sourceBefore,
  input: { filename, pins, strict37Accepted: true, migratedWeek: 207 }, initialProof,
  actualReservedTicks: reserved, actualCompletedTicks: completed, maxTicks: 5, lastReturnedWeek: state.market.tick,
  stoppedAt, focusPersonId: FOCUS, observations, sourceAndInputUnchanged: true,
  interpretation: 'Assignment IDs and full-save first cause only; no causal fix or qualification inferred.',
  environment: { node: process.version, platform: process.platform, arch: process.arch } }
const output = JSON.stringify(result, null, 2)
assert.ok(Buffer.byteLength(output, 'utf8') <= 1024 * 1024, 'bounded diagnostic output')
console.log(output)
