// Source/reference admission only. No game imports, evaluation, mutation or clock.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ORIGINAL_ENDURANCE, ORIGINAL_A_DIRECTORY, ORIGINAL_A_METADATA, ORIGINAL_PRODUCER,
  recordingIdentity, type RecordingIdentity } from './1098-c3-observation-codec.ts'

export const CORRECTION_PROTOCOL = 'c3-force-order-source-lineage-v1' as const
export const SOURCE_PATHS = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts'] as const
export const PRODUCTION_PATHS = ['src/core/forecast.ts', 'src/core/reception.ts', 'src/core/tuning.ts', 'src/core/worldgen.ts'] as const
export const TEST_PATH = 'tests/p14c3-force-order.test.ts'
export const TEST_IDENTITY = { bytes: 17550,
  sha256: 'baff4328fec99d7ed5c59072ea01172e733b6a46bb56be30d1952999e11b63c6' } as const
export const EMPTY_IDENTITY = { bytes: 0,
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' } as const
export const OLD_TRACKED = { bytes: 157398,
  sha256: '74251acc61847dd183e5c429cfce36db9d39860d38f3de23cfbe7116b93d6181' } as const
export const OUTPUTS = { C: '1052-c3-endurance-C-force-order-v1', D: '1052-c3-endurance-D-force-order-v1' } as const
const ORIGINAL_B = { directory: '1052-c3-endurance-B-recording-v1',
  metadata: { bytes: 1129812, sha256: '38ad11c77215118970dfcc9cf7d3e7424ac6b205733779adbf8648b2e8db5383' },
  sourceHead: '1f4b8429fef335e1fb25bede0b5d2c6014901ba8',
  producer: { bytes: 69157, sha256: '909e822e1847dc6752eb1af6b56c0ebb8e5e338127e99476709454c9de2d2eba' } } as const
const DEPENDENCIES = ['1052-c3-active-endurance-driver.ts', '1098-c3-active-endurance-driver.ts',
  '1098-c3-observation-codec.ts', '1098-c3-recording-provenance.json', '1098-c3-recording-verification.ts',
  '1107-canonical-preservation.jsonl', '1107-force-order-production.patch',
  '1108-c3-lineage-compatibility.ts', '1108-c3-lineage-typecheck.mjs', '1108-c3-lineage-verification.ts'] as const
export type SourceIdentity = { head: string; diff: RecordingIdentity; tracked: RecordingIdentity; untracked: string }
type FilePin = { path: string; identity: RecordingIdentity }
type SourcePin = FilePin & { mode: string; object: string }
export type SourceEdit = { label: string; originalStart: number; originalEnd: number; oldText: string; newText: string }
export type CorrectionProof = {
  protocol: typeof CORRECTION_PROTOCOL
  originalSource: { head: string; tracked: RecordingIdentity; files: SourcePin[] }
  correctedSource: { tracked: RecordingIdentity; files: SourcePin[] }
  production: { path: string; original: RecordingIdentity; corrected: RecordingIdentity; edits: SourceEdit[] }[]
  test: SourcePin
  producer: { original: FilePin; corrected: FilePin; edits: SourceEdit[] }
  dependencies: FilePin[]
  originalA: { directory: string; metadata: RecordingIdentity; source: SourceIdentity; producer: RecordingIdentity }
  originalB: { directory: string; metadata: RecordingIdentity; source: SourceIdentity; producer: RecordingIdentity }
  outputs: typeof OUTPUTS
}
export type CorrectionLineage = {
  protocol: typeof CORRECTION_PROTOCOL; provenance: RecordingIdentity
  originalTracked: RecordingIdentity; correctedTracked: RecordingIdentity
  production: { path: string; original: RecordingIdentity; corrected: RecordingIdentity }[]
  addedTest: FilePin; originalProducer: RecordingIdentity; correctedProducer: RecordingIdentity
  endurance: typeof ORIGINAL_ENDURANCE
  originalA: CorrectionProof['originalA']; originalB: CorrectionProof['originalB']; outputs: typeof OUTPUTS
}
const codePoint = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const blob = (bytes: Uint8Array) => createHash('sha1').update(`blob ${bytes.byteLength}\0`).update(bytes).digest('hex')
function stageText(rows: readonly SourcePin[]) {
  assert.deepEqual(rows.map(row => row.path), rows.map(row => row.path).sort(codePoint), 'source rows in exact Git path order')
  assert.equal(new Set(rows.map(row => row.path)).size, rows.length, 'source paths unique')
  return rows.map(row => {
    assert.match(row.mode, /^100(644|755)$/); assert.match(row.object, /^[a-f0-9]{40}$/)
    assert.ok(row.path && !row.path.includes('\n') && !row.path.includes('\t') && !row.path.startsWith('/')
      && !row.path.split('/').includes('..'), 'regular repository source path')
    return `${row.mode} ${row.object} 0\t${row.path}\n`
  }).join('')
}

// The supplied corrected bytes must contain precisely the documented edits.
// Reversal constructs every original byte; it never normalizes text or values.
export function reverseEdits(corrected: string, edits: readonly SourceEdit[]): string {
  const next = Buffer.from(corrected), oldParts: Buffer[] = []
  let oldCursor = 0, newCursor = 0
  for (const edit of edits) {
    assert.ok(Number.isSafeInteger(edit.originalStart) && Number.isSafeInteger(edit.originalEnd)
      && edit.originalStart >= oldCursor && edit.originalEnd >= edit.originalStart, 'ordered bounded source hunk')
    const oldBytes = Buffer.from(edit.oldText), newBytes = Buffer.from(edit.newText)
    assert.equal(edit.originalEnd - edit.originalStart, oldBytes.length, 'exact original hunk length')
    const unchangedLength = edit.originalStart - oldCursor
    assert.ok(newCursor + unchangedLength + newBytes.length <= next.length, 'hunk within corrected source')
    oldParts.push(next.subarray(newCursor, newCursor + unchangedLength)); newCursor += unchangedLength
    assert.deepEqual(next.subarray(newCursor, newCursor + newBytes.length), newBytes, 'exact corrected hunk bytes')
    oldParts.push(oldBytes); newCursor += newBytes.length; oldCursor = edit.originalEnd
  }
  oldParts.push(next.subarray(newCursor)); return Buffer.concat(oldParts).toString('utf8')
}
export function verifyProducerCorrection(proof: CorrectionProof, original: string, corrected: string) {
  assert.equal(proof.protocol, CORRECTION_PROTOCOL)
  assert.deepEqual(proof.dependencies.map(file => file.path), DEPENDENCIES, 'exact dependency set and order')
  assert.deepEqual(proof.producer.original.identity, ORIGINAL_B.producer, 'only the reviewed1098 base producer')
  assert.deepEqual(recordingIdentity(original), proof.producer.original.identity, 'frozen1098 producer')
  assert.deepEqual(recordingIdentity(corrected), proof.producer.corrected.identity, 'frozen1108 producer')
  assert.deepEqual(proof.producer.edits.map(edit => edit.label), ['lineage-import', 'lineage-metadata-type',
    'lineage-reference-gate', 'lineage-preflight', 'lineage-input-guards', 'lineage-reference-calls',
    'lineage-output-metadata', 'lineage-output-disclosure'], 'only named source/reference/output lineage edits')
  assert.equal(reverseEdits(corrected, proof.producer.edits), original, 'full reverse reconstruction of1098 producer')
  const segment = (source: string) => {
    const begin = source.indexOf('class Endurance {'), end = source.indexOf('function loadReference(')
    assert.ok(begin >= 0 && end > begin); return source.slice(begin, end)
  }
  assert.equal(segment(corrected), segment(original), 'complete policy, commands, schedules and comparisons unchanged')
  assert.deepEqual(recordingIdentity(segment(corrected)), ORIGINAL_ENDURANCE)
  return { reconstructedProducer: proof.producer.original.identity, endurance: ORIGINAL_ENDURANCE,
    hunks: proof.producer.edits.length }
}
export function verifySourceRows(proof: CorrectionProof, actual: readonly SourcePin[], read: (path: string) => Uint8Array) {
  assert.equal(proof.protocol, CORRECTION_PROTOCOL)
  assert.equal(proof.originalSource.head, 'aa9acec52f4e6a393358cedd2f72689f0476938e')
  assert.deepEqual(proof.originalSource.tracked, OLD_TRACKED)
  assert.equal(proof.originalSource.files.length, 1660); assert.equal(proof.correctedSource.files.length, 1661)
  assert.deepEqual(recordingIdentity(stageText(proof.originalSource.files)), OLD_TRACKED)
  assert.deepEqual(recordingIdentity(stageText(proof.correctedSource.files)), proof.correctedSource.tracked)
  assert.deepEqual(actual, proof.correctedSource.files, 'entire current source inventory equals corrected pin')
  assert.deepEqual(proof.production.map(row => row.path), PRODUCTION_PATHS, 'exact four production paths')
  assert.equal(proof.test.path, TEST_PATH); assert.deepEqual(proof.test.identity, TEST_IDENTITY)
  const oldMap = new Map(proof.originalSource.files.map(row => [row.path, row]))
  const changes = new Map(proof.production.map(row => [row.path, row]))
  const reconstructed: SourcePin[] = []
  for (const row of actual) {
    const bytes = read(row.path)
    assert.deepEqual(recordingIdentity(bytes), row.identity, `actual source bytes:${row.path}`)
    assert.equal(blob(bytes), row.object, `source Git blob:${row.path}`)
    if (row.path === TEST_PATH) { assert.deepEqual(row, proof.test); continue }
    const original = oldMap.get(row.path); assert.ok(original, 'no additional source path')
    assert.equal(row.mode, original.mode, 'no source mode changes')
    const change = changes.get(row.path)
    let oldBytes: Uint8Array = bytes
    if (change) {
      assert.ok(change.edits.length > 0, 'nonempty reviewed production edit')
      assert.deepEqual(change.corrected, row.identity); assert.deepEqual(change.original, original.identity)
      oldBytes = Buffer.from(reverseEdits(Buffer.from(bytes).toString('utf8'), change.edits))
      assert.notDeepEqual(row.identity, original.identity, 'each named production file actually changes')
    } else assert.deepEqual(row, original, 'all other source bytes and modes unchanged')
    assert.deepEqual(recordingIdentity(oldBytes), original.identity, `complete old source reconstruction:${row.path}`)
    assert.equal(blob(oldBytes), original.object, `old source Git blob:${row.path}`)
    reconstructed.push({ ...original })
  }
  assert.deepEqual(reconstructed, proof.originalSource.files)
  assert.deepEqual(recordingIdentity(stageText(reconstructed)), OLD_TRACKED, 'exact original complete tracked index reconstructed')
  return { originalFiles: reconstructed.length, correctedFiles: actual.length,
    productionFiles: changes.size, addedTests: 1, originalTracked: OLD_TRACKED, correctedTracked: proof.correctedSource.tracked }
}
export function verifyCorrectedSource(root: string, proof: CorrectionProof, source: SourceIdentity) {
  assert.deepEqual(source.diff, EMPTY_IDENTITY, 'published clean consumed source required; no dirty-source allowance')
  assert.equal(source.untracked, '')
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  const stage = git('ls-files', '--stage', '--', ...SOURCE_PATHS)
  assert.deepEqual(recordingIdentity(stage), source.tracked)
  assert.deepEqual(source.tracked, proof.correctedSource.tracked, 'exact corrected source index')
  const rows = stage.trimEnd().split('\n').map(line => {
    const match = /^(100(?:644|755)) ([a-f0-9]{40}) 0\t(.+)$/.exec(line)
    assert.ok(match, 'only regular stage-zero consumed files')
    const path = match[3]!, stat = lstatSync(resolve(root, path))
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'regular source file only')
    assert.equal((stat.mode & 0o111) !== 0, match[1] === '100755', 'source executable bit agrees with index')
    return { path, mode: match[1]!, object: match[2]!, identity: recordingIdentity(readFileSync(resolve(root, path))) }
  })
  return verifySourceRows(proof, rows, path => readFileSync(resolve(root, path)))
}
export function correctionLineage(proof: CorrectionProof, proofText: string): CorrectionLineage {
  assert.deepEqual(proof.outputs, OUTPUTS)
  assert.equal(proof.originalA.directory, ORIGINAL_A_DIRECTORY)
  assert.deepEqual(proof.originalA.metadata, ORIGINAL_A_METADATA)
  assert.deepEqual(proof.originalA.producer, ORIGINAL_PRODUCER)
  assert.equal(proof.originalA.source.head, 'aa9acec52f4e6a393358cedd2f72689f0476938e')
  assert.equal(proof.originalB.directory, ORIGINAL_B.directory)
  assert.deepEqual(proof.originalB.metadata, ORIGINAL_B.metadata)
  assert.deepEqual(proof.originalB.producer, ORIGINAL_B.producer)
  assert.equal(proof.originalB.source.head, ORIGINAL_B.sourceHead)
  return { protocol: CORRECTION_PROTOCOL, provenance: recordingIdentity(proofText),
    originalTracked: proof.originalSource.tracked, correctedTracked: proof.correctedSource.tracked,
    production: proof.production.map(({ path, original, corrected }) => ({ path, original, corrected })),
    addedTest: { path: proof.test.path, identity: proof.test.identity }, originalProducer: proof.producer.original.identity,
    correctedProducer: proof.producer.corrected.identity, endurance: ORIGINAL_ENDURANCE,
    originalA: proof.originalA, originalB: proof.originalB, outputs: OUTPUTS }
}
export function assertCorrectedReference(metadataText: string, directory: string, variant: 'A' | 'B' | 'C' | 'D',
  producer: RecordingIdentity, source: SourceIdentity, recording: unknown, correction: CorrectionLineage) {
  const metadata = JSON.parse(metadataText) as { status: string; variant: string; producer: RecordingIdentity
    source: SourceIdentity; recording?: unknown; correction?: CorrectionLineage }
  assert.equal(correction.protocol, CORRECTION_PROTOCOL)
  assert.deepEqual(producer, correction.correctedProducer, 'executing corrected producer pin')
  assert.equal(metadata.status, 'PASS', 'reference completed PASS required')
  assert.equal(metadata.variant, variant, 'exact reference role')
  assert.deepEqual(source.diff, EMPTY_IDENTITY); assert.equal(source.untracked, '')
  assert.deepEqual(source.tracked, correction.correctedTracked, 'current corrected source pin')
  if (variant === 'A' || variant === 'B') {
    const old = variant === 'A' ? correction.originalA : correction.originalB
    assert.equal(directory, old.directory, 'only named qualified historical reference')
    assert.deepEqual(recordingIdentity(metadataText), old.metadata, 'immutable historical metadata bytes')
    assert.deepEqual(metadata.producer, old.producer, 'historical producer kept distinct')
    assert.deepEqual(metadata.source, old.source, 'historical source identity kept distinct')
    assert.deepEqual(old.source.tracked, OLD_TRACKED); assert.deepEqual(old.source.diff, EMPTY_IDENTITY)
    assert.equal(old.source.untracked, ''); assert.equal(metadata.correction, undefined)
    if (variant === 'A') assert.equal(metadata.recording, undefined)
    else assert.deepEqual(metadata.recording, recording, 'original B recording lineage unchanged')
  } else {
    assert.equal(variant, 'C', 'only corrected C may precede D')
    assert.equal(directory, OUTPUTS.C, 'only exact corrected C output precedes D')
    assert.deepEqual(metadata.producer, producer, 'same corrected frozen producer')
    assert.match(metadata.source.head, /^[a-f0-9]{40}$/, 'actual predecessor HEAD remains separately recorded')
    assert.deepEqual(metadata.source.diff, source.diff, 'same corrected consumed patch across publications')
    assert.deepEqual(metadata.source.tracked, source.tracked, 'same corrected consumed tracked source across publications')
    assert.equal(metadata.source.untracked, '', 'no unrecorded predecessor source')
    assert.deepEqual(metadata.recording, recording, 'same unchanged recording codec lineage')
    assert.deepEqual(metadata.correction, correction, 'same exact corrected source lineage')
  }
}
