// Parent executes this separately. Standard library + recording codec only;
// no project imports, ticks, commands, source edits or artifact writes.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ObservationEncoder, OBSERVATION_FORMAT, ORIGINAL_PRODUCER, ORIGINAL_ENDURANCE,
  ORIGINAL_A_DIRECTORY, ORIGINAL_A_METADATA, assertRecordingReference, decodeObservations,
  recordingIdentity, verifyRecordingProvenance, type RecordingIdentity, type RecordingProvenance } from './1098-c3-observation-codec.ts'

const CAP = 16 * 1024 ** 2, AUTHORITY_CAP = 256 * 1024 ** 2, DIRECTORY_CAP = 1024 ** 3
const SOURCE = ['src', 'bridge', 'tests', 'generated', 'ui', 'scripts', 'package.json', 'package-lock.json',
  'tsconfig.json', 'tsconfig.bridge.json', 'tsconfig.src.json', 'vitest.config.ts', 'vitest.workspace.ts']
const evidence = dirname(fileURLToPath(import.meta.url)), root = resolve(evidence, '../../../../..')
const codePoint = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
function sourceIdentity() {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  return { head: git('rev-parse', 'HEAD').trim(),
    diff: recordingIdentity(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE)),
    tracked: recordingIdentity(git('ls-files', '--stage', '--', ...SOURCE)),
    untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE).trim() }
}
const line = (value: unknown) => JSON.stringify(value) + '\n'
function main() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 2); assert.equal(args[0], '--source-sha'); assert.match(args[1]!, /^[a-f0-9]{40}$/)
  const source = sourceIdentity(); assert.equal(source.head, args[1]); assert.equal(source.untracked, '')
  const inputs = new Map<string, RecordingIdentity>()
  const read = (path: string) => {
    assert.equal(lstatSync(path).isSymbolicLink(), false)
    const raw = readFileSync(path, 'utf8'); inputs.set(path, recordingIdentity(raw)); return raw
  }
  const proofText = read(resolve(evidence, '1098-c3-recording-provenance.json'))
  const proof = JSON.parse(proofText) as RecordingProvenance
  const original = read(resolve(evidence, '1052-c3-active-endurance-driver.ts'))
  const revised = read(resolve(evidence, '1098-c3-active-endurance-driver.ts'))
  const codec = read(resolve(evidence, '1098-c3-observation-codec.ts'))
  const verification = read(fileURLToPath(import.meta.url))
  assert.equal(proof.original.path, '1052-c3-active-endurance-driver.ts')
  assert.equal(proof.revised.path, '1098-c3-active-endurance-driver.ts')
  assert.equal(proof.codec.path, '1098-c3-observation-codec.ts')
  assert.equal(proof.verification.path, basename(fileURLToPath(import.meta.url)))
  assert.deepEqual(recordingIdentity(verification), proof.verification.identity)
  const equivalence = verifyRecordingProvenance(proof, original, revised, codec)
  assert.deepEqual(equivalence, { reconstructedOriginal: ORIGINAL_PRODUCER, endurance: ORIGINAL_ENDURANCE, hunks: 8 })

  const directory = resolve(evidence, ORIGINAL_A_DIRECTORY)
  assert.equal(lstatSync(directory).isSymbolicLink(), false)
  const metadataText = read(resolve(directory, 'metadata.json'))
  const metadata = JSON.parse(metadataText) as { status: string; variant: string; seed: string
    source: ReturnType<typeof sourceIdentity>; producer: RecordingIdentity
    schema: { save: number; protocol: number; projection: number; schemaId: string }
    counters: { ticks: number; tickAttempts: number; commands: number; reads: number }
    files: { path: string; identity: RecordingIdentity }[] }
  assert.deepEqual(recordingIdentity(metadataText), ORIGINAL_A_METADATA)
  assert.equal(metadata.seed, 'p14c3-active-endurance-6240-01')
  assert.deepEqual(metadata.schema, { save: 38, protocol: 4, projection: 53,
    schemaId: 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d' })
  assert.deepEqual(metadata.source.diff, source.diff); assert.deepEqual(metadata.source.tracked, source.tracked)
  assert.equal(metadata.source.untracked, '')
  assert.equal(metadata.counters.ticks, 6240); assert.equal(metadata.counters.tickAttempts, 6240)
  assert.equal(metadata.counters.commands, 1072); assert.equal(metadata.counters.reads, 121)
  const compact = ['commands.jsonl', 'observations.jsonl', 'checkpoints.jsonl', 'failure.json', 'metadata.json']
  const expectedNames = [...compact, 'authority-3120.json', 'authority-6240.json',
    ...[0, 3120, 6240].map(week => `runtime/week-${week}.library.json`)].sort(codePoint)
  const actual: { path: string; identity: RecordingIdentity }[] = []
  const visit = (current: string) => {
    for (const name of readdirSync(current).sort(codePoint)) {
      const path = resolve(current, name), stat = lstatSync(path), local = relative(directory, path)
      assert.equal(stat.isSymbolicLink(), false)
      if (stat.isDirectory()) { assert.equal(local, 'runtime'); visit(path) }
      else {
        assert.ok(stat.isFile()); assert.ok(expectedNames.includes(local))
        assert.ok(stat.size <= (compact.includes(local) ? CAP : AUTHORITY_CAP))
        actual.push({ path: local, identity: recordingIdentity(read(path)) })
      }
    }
  }
  visit(directory)
  assert.equal(actual.length, 10); assert.ok(actual.reduce((sum, row) => sum + row.identity.bytes, 0) <= DIRECTORY_CAP)
  assert.deepEqual(actual.map(row => row.path).sort(codePoint), expectedNames)
  assert.deepEqual(actual.filter(row => row.path !== 'metadata.json'), metadata.files)
  const failure = JSON.parse(read(resolve(directory, 'failure.json'))) as Record<string, unknown>
  assert.equal(failure.status, 'PASS'); assert.equal(failure.failure, null); assert.equal(failure.guardFailure, null)
  const recording = { format: OBSERVATION_FORMAT, codec: proof.codec.identity,
    provenance: recordingIdentity(proofText), originalProducer: ORIGINAL_PRODUCER,
    baseline: { directory: ORIGINAL_A_DIRECTORY, metadata: ORIGINAL_A_METADATA, producer: ORIGINAL_PRODUCER }, equivalence }
  assertRecordingReference(metadataText, ORIGINAL_A_DIRECTORY, 'A', proof.revised.identity, recording)

  const observations = read(resolve(directory, 'observations.jsonl'))
  const originalLines = observations.slice(0, -1).split('\n').map(raw => raw + '\n')
  assert.ok(observations.endsWith('\n')); assert.equal(originalLines.length, 9240)
  const encoder = new ObservationEncoder(CAP), encodedParts: string[] = []
  for (const raw of originalLines) { const prepared = encoder.prepare(raw); encodedParts.push(prepared.text); prepared.commit() }
  const encoded = encodedParts.join('')
  assert.deepEqual(recordingIdentity(encoded), { bytes: 3329384,
    sha256: '2c1a9f08b3f5ee20189db844ee16f85fd1787ff006d1febd65c3af550ce8436c' }, 'independent1098-A byte-only encoding measurement')
  let index = 0, reconstructedBytes = 0
  const hash = createHash('sha256')
  const decoded = decodeObservations(encoded, raw => {
    assert.equal(raw, originalLines[index], `original logical row${index} exact bytes`)
    index++; reconstructedBytes += Buffer.byteLength(raw); hash.update(raw)
  }, CAP)
  assert.equal(index, originalLines.length)
  assert.deepEqual(decoded, { logicalRows: 9240, definitions: 121, dictionaryBytes: 591151 })
  assert.deepEqual({ bytes: reconstructedBytes, sha256: hash.digest('hex') }, recordingIdentity(observations))

  const control = { kind: 'lifecycle-boundary', week: 104, root: 'records', count: 1, focus: [{ id: 'p', value: 1 }] }
  const positive = new ObservationEncoder(CAP), pending = positive.prepare(line(control))
  assert.equal(positive.prepare(line(control)).text, pending.text, 'preparation has no dictionary mutation')
  pending.commit()
  const repeated = positive.prepare(line(control)); assert.ok(!repeated.text.includes('focus-definition')); repeated.commit()
  const definition = line({ kind: 'focus-definition', id: 'focus-0', focus: control.focus })
  const reference = line({ kind: 'lifecycle-boundary', week: 104, root: 'records', count: 1, focusRef: 'focus-0' })
  assert.equal(pending.text, definition + reference)
  const largeControl = { ...control, focus: [{ padding: 'x'.repeat(256) }] }
  const failedCapEncoder = new ObservationEncoder(Buffer.byteLength(line(largeControl)))
  assert.throws(() => failedCapEncoder.prepare(line(largeControl)), /combined definition and reference/)
  const smaller = { ...control, focus: [] }
  const afterCap = failedCapEncoder.prepare(line(smaller)); assert.ok(afterCap.text.includes('"id":"focus-0"'))
  afterCap.commit()
  let refused = 0
  const refusal = (body: () => unknown, pattern: RegExp) => { assert.throws(body, pattern); refused++ }
  const decode = (raw: string, cap = CAP) => decodeObservations(raw, () => {}, cap)
  refusal(() => pending.commit(), /commits once/)
  refusal(() => new ObservationEncoder(CAP).prepare(definition), /inject codec definitions/)
  refusal(() => new ObservationEncoder(CAP).prepare(reference), /keys and order/)
  refusal(() => new ObservationEncoder(CAP).prepare(line({ ...control, focus: null })), /focus is an array/)
  refusal(() => new ObservationEncoder(CAP).prepare(line({ ...control, root: ['records'] })), /known lifecycle root/)
  refusal(() => decode(reference), /unknown\/forward/)
  refusal(() => decode(definition + reference + definition), /sequential unique/)
  refusal(() => decode(definition + reference + line({ kind: 'focus-definition', id: 'focus-1', focus: control.focus })), /duplicate focus/)
  refusal(() => decode(definition), /unused terminal/)
  refusal(() => decode(definition + line({ kind: 'tick-timing', elapsedMs: 1 })), /stranded/)
  refusal(() => decode(definition + line({ ...JSON.parse(reference), focusRef: 'focus-1' })), /unknown\/forward/)
  refusal(() => decode(line({ id: 'focus-0', kind: 'focus-definition', focus: [] }) + reference), /keys and order/)
  refusal(() => decode(definition + reference.slice(0, -1)), /complete encoded JSONL/)
  refusal(() => decode(definition + reference, Buffer.byteLength(definition + reference) - 1), /encoded compact cap/)
  refusal(() => decode('{invalid}\n'), /JSON|property|Unexpected/i)
  refusal(() => new ObservationEncoder(CAP).prepare(' ' + line(control)), /byte representation/)

  const candidate = (variant: 'B' | 'C') => line({ status: 'PASS', variant, producer: proof.revised.identity, recording })
  assertRecordingReference(candidate('B'), 'new-B', 'B', proof.revised.identity, recording)
  assertRecordingReference(candidate('C'), 'new-C', 'C', proof.revised.identity, recording)
  refusal(() => assertRecordingReference(metadataText, 'copied-A', 'A', proof.revised.identity, recording), /exact completed original A/)
  refusal(() => assertRecordingReference(metadataText + ' ', ORIGINAL_A_DIRECTORY, 'A', proof.revised.identity, recording), /metadata pin/)
  refusal(() => assertRecordingReference(line({ ...JSON.parse(metadataText), status: 'FAIL' }), ORIGINAL_A_DIRECTORY, 'A', proof.revised.identity, recording), /completed PASS/)
  refusal(() => assertRecordingReference(metadataText, ORIGINAL_A_DIRECTORY, 'B', proof.revised.identity, recording), /exact predecessor/)
  refusal(() => assertRecordingReference(line({ status: 'PASS', variant: 'B', producer: ORIGINAL_PRODUCER, recording }), 'old-B', 'B', proof.revised.identity, recording), /same revised/)
  refusal(() => assertRecordingReference(line({ status: 'PASS', variant: 'B', producer: proof.revised.identity }), 'new-B', 'B', proof.revised.identity, recording), /exact recording format/)
  refusal(() => assertRecordingReference(line({ status: 'PASS', variant: 'C', producer: proof.revised.identity,
    recording: { ...recording, format: 'other' } }), 'new-C', 'C', proof.revised.identity, recording), /exact recording format/)
  refusal(() => verifyRecordingProvenance(proof, original, revised + '\n', codec), /Expected values|deep-equal|equal/i)
  refusal(() => verifyRecordingProvenance(proof, original, revised, codec + '\n'), /Expected values|deep-equal|equal/i)
  const badHunk = structuredClone(proof); badHunk.edits[0]!.oldText += 'changed'
  refusal(() => verifyRecordingProvenance(badHunk, original, revised, codec), /Expected values|deep-equal|equal/i)
  const unknownHunk = structuredClone(proof); unknownHunk.edits[0]!.label = 'game-policy'
  refusal(() => verifyRecordingProvenance(unknownHunk, original, revised, codec), /only documented/)

  for (const [path, identity] of inputs) assert.deepEqual(recordingIdentity(readFileSync(path)), identity, `input drift:${relative(root, path)}`)
  actual.length = 0; visit(directory)
  assert.equal(actual.length, 10)
  assert.deepEqual(actual.map(row => row.path).sort(codePoint), expectedNames, 'complete original A inventory remains exact')
  assert.deepEqual(actual.filter(row => row.path !== 'metadata.json'), metadata.files)
  assert.deepEqual(sourceIdentity(), source, 'source/HEAD/index remains frozen')
  const result = { marker: 'C3_RECORDING_AMENDMENT_VERIFIED', source, producer: proof.revised.identity,
    codec: proof.codec.identity, verification: proof.verification.identity, provenance: recordingIdentity(proofText),
    originalProducer: ORIGINAL_PRODUCER, originalAMetadata: ORIGINAL_A_METADATA, equivalence,
    observedFile: recordingIdentity(observations), encodedInMemory: recordingIdentity(encoded), decoded,
    originalBytesReconstructed: reconstructedBytes, refusalControls: refused, gameplayCalls: 0, filesWritten: 0 }
  const output = JSON.stringify(result)
  assert.ok(Buffer.byteLength(output) <= 32 * 1024); console.log(output)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() }
  catch (error) {
    console.error(JSON.stringify({ marker: 'C3_RECORDING_AMENDMENT_VERIFICATION_FAILED', message: String(error).slice(0, 6000), gameplayCalls: 0, filesWritten: 0 }))
    process.exitCode = 1
  }
}
