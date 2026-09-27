// Parent-only data/source verification. No project imports, evaluation, writes,
// commands against the simulation, or gameplay. Synthetic metadata below tests
// only the admission gate; it never alleges a completed corrected C run.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { lstatSync, readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ORIGINAL_A_DIRECTORY, ORIGINAL_A_METADATA, ORIGINAL_PRODUCER, OBSERVATION_FORMAT,
  recordingIdentity, verifyRecordingProvenance, decodeObservations, type RecordingIdentity,
  type RecordingProvenance } from './1098-c3-observation-codec.ts'
import { assertCorrectedReference, correctionLineage, verifyCorrectedSource, verifyProducerCorrection,
  verifySourceRows, SOURCE_PATHS, OUTPUTS, type CorrectionProof, type SourceIdentity } from './1108-c3-lineage-compatibility.ts'

const CAP = 16 * 1024 ** 2, AUTHORITY_CAP = 256 * 1024 ** 2, DIRECTORY_CAP = 1024 ** 3
const evidence = dirname(fileURLToPath(import.meta.url)), root = resolve(evidence, '../../../../..')
const codePoint = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const sourceIdentity = (): SourceIdentity => {
  const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 ** 2 })
  return { head: git('rev-parse', 'HEAD').trim(), diff: recordingIdentity(git('diff', '--no-ext-diff', '--binary', 'HEAD', '--', ...SOURCE_PATHS)),
    tracked: recordingIdentity(git('ls-files', '--stage', '--', ...SOURCE_PATHS)),
    untracked: git('ls-files', '--others', '--exclude-standard', '--', ...SOURCE_PATHS).trim() }
}
function main() {
  const args = process.argv.slice(2)
  assert.equal(args.length, 2); assert.equal(args[0], '--source-sha'); assert.match(args[1]!, /^[a-f0-9]{40}$/)
  const source = sourceIdentity(); assert.equal(source.head, args[1])
  const inputs = new Map<string, RecordingIdentity>()
  const read = (path: string) => {
    const stat = lstatSync(path); assert.ok(stat.isFile() && !stat.isSymbolicLink())
    const bytes = readFileSync(path); inputs.set(path, recordingIdentity(bytes)); return bytes
  }
  const readText = (name: string) => read(resolve(evidence, name)).toString('utf8')
  const proofText = readText('1108-c3-lineage-provenance.json'), proof = JSON.parse(proofText) as CorrectionProof
  const original = readText('1098-c3-active-endurance-driver.ts'), corrected = readText('1108-c3-active-endurance-driver.ts')
  assert.equal(proof.producer.original.path, '1098-c3-active-endurance-driver.ts')
  assert.equal(proof.producer.corrected.path, '1108-c3-active-endurance-driver.ts')
  const producer = verifyProducerCorrection(proof, original, corrected)
  const reconstructed = verifyCorrectedSource(root, proof, source)
  for (const file of proof.dependencies) {
    assert.equal(basename(file.path), file.path)
    assert.deepEqual(recordingIdentity(readText(file.path)), file.identity, 'exact dependency source')
  }
  assert.ok(proof.dependencies.some(file => file.path === basename(fileURLToPath(import.meta.url))))
  const recordingProofText = readText('1098-c3-recording-provenance.json')
  const recordingProof = JSON.parse(recordingProofText) as RecordingProvenance
  const equivalence = verifyRecordingProvenance(recordingProof, readText('1052-c3-active-endurance-driver.ts'),
    original, readText('1098-c3-observation-codec.ts'))
  const recording = { format: OBSERVATION_FORMAT, codec: recordingProof.codec.identity,
    provenance: recordingIdentity(recordingProofText), originalProducer: ORIGINAL_PRODUCER,
    baseline: { directory: ORIGINAL_A_DIRECTORY, metadata: ORIGINAL_A_METADATA, producer: ORIGINAL_PRODUCER }, equivalence }
  const correction = correctionLineage(proof, proofText)
  const metadataTexts = new Map<'A' | 'B', string>()
  const inventories = new Map<string, { path: string; identity: RecordingIdentity }[]>()
  const inventory = (directory: string, variant: 'A' | 'B') => {
    assert.equal(lstatSync(directory).isSymbolicLink(), false)
    const compact = ['commands.jsonl', 'observations.jsonl', 'checkpoints.jsonl', 'failure.json', 'metadata.json']
    const expected = [...compact, 'authority-3120.json', 'authority-6240.json',
      ...(variant === 'A' ? [0, 3120, 6240].map(week => `runtime/week-${week}.library.json`) : [])].sort(codePoint)
    const rows: { path: string; identity: RecordingIdentity }[] = []
    const visit = (current: string) => {
      for (const name of readdirSync(current).sort(codePoint)) {
        const path = resolve(current, name), local = relative(directory, path), stat = lstatSync(path)
        assert.equal(stat.isSymbolicLink(), false)
        if (stat.isDirectory()) { assert.equal(local, 'runtime'); visit(path) }
        else {
          assert.ok(stat.isFile()); assert.ok(expected.includes(local), 'complete permitted original inventory')
          assert.ok(stat.size <= (compact.includes(local) ? CAP : AUTHORITY_CAP))
          rows.push({ path: local, identity: recordingIdentity(read(path)) })
        }
      }
    }
    visit(directory); assert.deepEqual(rows.map(row => row.path).sort(codePoint), expected)
    assert.ok(rows.length <= 10); assert.ok(rows.reduce((sum, row) => sum + row.identity.bytes, 0) <= DIRECTORY_CAP)
    return rows
  }
  for (const variant of ['A', 'B'] as const) {
    const named = variant === 'A' ? proof.originalA : proof.originalB, directory = resolve(evidence, named.directory)
    const text = read(resolve(directory, 'metadata.json')).toString('utf8'); metadataTexts.set(variant, text)
    assertCorrectedReference(text, named.directory, variant, proof.producer.corrected.identity, source, recording, correction)
    const metadata = JSON.parse(text) as { seed: string; schema: unknown; counters: { ticks: number; tickAttempts: number; commands: number }
      files: { path: string; identity: RecordingIdentity }[] }
    assert.equal(metadata.seed, 'p14c3-active-endurance-6240-01')
    assert.deepEqual(metadata.schema, { save: 38, protocol: 4, projection: 53,
      schemaId: 'sha256:d59e144e4077f669804ca87dd6184ef23bd44c9d93e44eb795f2b66350926a4d' })
    assert.equal(metadata.counters.ticks, 6240); assert.equal(metadata.counters.tickAttempts, 6240)
    assert.equal(metadata.counters.commands, 1072)
    const rows = inventory(directory, variant); inventories.set(directory, rows)
    assert.deepEqual(rows.filter(row => row.path !== 'metadata.json'), metadata.files, 'exact historical inventory byte pins')
    const failure = JSON.parse(read(resolve(directory, 'failure.json')).toString('utf8')) as Record<string, unknown>
    assert.equal(failure.status, 'PASS'); assert.equal(failure.failure, null); assert.equal(failure.guardFailure, null)
    if (variant === 'B') decodeObservations(read(resolve(directory, 'observations.jsonl')).toString('utf8'), () => {}, CAP)
  }

  let refusals = 0
  const refuse = (label: string, run: () => unknown) => { assert.throws(run, assert.AssertionError, label); refusals++ }
  const line = (value: unknown) => JSON.stringify(value) + '\n'
  const gate = (text: string, directory: string, variant: 'A' | 'B' | 'C' | 'D') =>
    assertCorrectedReference(text, directory, variant, proof.producer.corrected.identity, source, recording, correction)
  const a = metadataTexts.get('A')!, b = metadataTexts.get('B')!
  for (const [variant, text, directory] of [['A', a, proof.originalA.directory], ['B', b, proof.originalB.directory]] as const) {
    refuse(`${variant} directory alias`, () => gate(text, directory + '-copy', variant))
    refuse(`${variant} changed byte`, () => gate(text + ' ', directory, variant))
    refuse(`${variant} failed reference`, () => gate(line({ ...JSON.parse(text), status: 'FAIL' }), directory, variant))
    refuse(`${variant} relabelled producer`, () => gate(line({ ...JSON.parse(text), producer: proof.producer.corrected.identity }), directory, variant))
    refuse(`${variant} relabelled source`, () => gate(line({ ...JSON.parse(text), source }), directory, variant))
  }
  refuse('A cannot occupy B', () => gate(a, proof.originalA.directory, 'B'))
  refuse('B cannot occupy C', () => gate(b, proof.originalB.directory, 'C'))
  // Admission-only synthetic metadata, never an artifact or gameplay witness.
  const candidate = { status: 'PASS', variant: 'C', producer: proof.producer.corrected.identity, source, recording, correction }
  gate(line(candidate), OUTPUTS.C, 'C')
  // A distinct recorded HEAD is permitted with the exact same consumed source;
  // this synthetic gate control is not proof that this invented HEAD exists.
  gate(line({ ...candidate, source: { ...source, head: '1'.repeat(40) } }), OUTPUTS.C, 'C')
  refuse('old failed C directory', () => gate(line(candidate), '1052-c3-endurance-C-recording-v1', 'C'))
  refuse('new C failed', () => gate(line({ ...candidate, status: 'FAIL' }), OUTPUTS.C, 'C'))
  refuse('new C wrong producer', () => gate(line({ ...candidate, producer: proof.producer.original.identity }), OUTPUTS.C, 'C'))
  refuse('new C malformed recorded HEAD', () => gate(line({ ...candidate, source: { ...source, head: 'invalid' } }), OUTPUTS.C, 'C'))
  refuse('new C changed source index', () => gate(line({ ...candidate, source: { ...source, tracked: proof.originalSource.tracked } }), OUTPUTS.C, 'C'))
  refuse('new C dirty source', () => gate(line({ ...candidate, source: { ...source, diff: recordingIdentity('extra') } }), OUTPUTS.C, 'C'))
  refuse('new C untracked source', () => gate(line({ ...candidate, source: { ...source, untracked: 'tests/extra.ts' } }), OUTPUTS.C, 'C'))
  refuse('new C changed recording', () => gate(line({ ...candidate, recording: { ...recording, format: 'other' } }), OUTPUTS.C, 'C'))
  refuse('new C missing correction', () => gate(line({ ...candidate, correction: undefined }), OUTPUTS.C, 'C'))
  refuse('new C changed correction', () => gate(line({ ...candidate, correction: { ...correction, protocol: 'other' } }), OUTPUTS.C, 'C'))
  refuse('D is not a predecessor', () => gate(line({ ...candidate, variant: 'D' }), OUTPUTS.D, 'D'))
  refuse('extra producer byte', () => verifyProducerCorrection(proof, original, corrected + '\n'))
  const wrongHunk = structuredClone(proof); wrongHunk.producer.edits[0]!.oldText += 'changed'
  refuse('incorrect reverse hunk', () => verifyProducerCorrection(wrongHunk, original, corrected))
  const unknownHunk = structuredClone(proof); unknownHunk.producer.edits[0]!.label = 'game-policy'
  refuse('unnamed producer change', () => verifyProducerCorrection(unknownHunk, original, corrected))
  const rows = proof.correctedSource.files, sourceRead = (path: string) => readFileSync(resolve(root, path))
  refuse('extra consumed source', () => verifySourceRows(proof, [...rows, { ...rows[0]!, path: 'tests/extra.ts' }], sourceRead))
  refuse('missing consumed source', () => verifySourceRows(proof, rows.slice(1), sourceRead))
  const differentMode = structuredClone(rows); differentMode[0]!.mode = rows[0]!.mode === '100644' ? '100755' : '100644'
  refuse('source mode change', () => verifySourceRows(proof, differentMode, sourceRead))
  const differentBlob = structuredClone(rows); differentBlob[0]!.object = '0'.repeat(40)
  refuse('source blob change', () => verifySourceRows(proof, differentBlob, sourceRead))
  refuse('actual source byte changed', () => verifySourceRows(proof, rows, path => path === rows[0]!.path
    ? Buffer.concat([sourceRead(path), Buffer.from('\n')]) : sourceRead(path)))
  const extraProduction = structuredClone(proof); extraProduction.production.push(extraProduction.production[0]!)
  refuse('broader production scope', () => verifySourceRows(extraProduction, rows, sourceRead))
  const oldSourceChanged = structuredClone(proof); oldSourceChanged.originalSource.files[0]!.object = '0'.repeat(40)
  refuse('changed old source inventory', () => verifySourceRows(oldSourceChanged, rows, sourceRead))
  const changedTest = structuredClone(proof); changedTest.test.identity.sha256 = '0'.repeat(64)
  refuse('changed independent test', () => verifySourceRows(changedTest, rows, sourceRead))
  const changedProductionHunk = structuredClone(proof); changedProductionHunk.production[0]!.edits[0]!.oldText += 'x'
  refuse('changed production reversal', () => verifySourceRows(changedProductionHunk, rows, sourceRead))
  const wrongOutput = { ...proof, outputs: { ...proof.outputs, C: '1052-c3-endurance-C-other' as typeof OUTPUTS.C } }
  refuse('changed output lineage', () => correctionLineage(wrongOutput, proofText))
  assert.equal(refusals, 36, 'fixed refusal-control count')

  for (const [path, before] of inputs) assert.deepEqual(recordingIdentity(readFileSync(path)), before, `input unchanged:${relative(root, path)}`)
  for (const [directory, before] of inventories) assert.deepEqual(inventory(directory, directory === resolve(evidence, proof.originalA.directory) ? 'A' : 'B'), before)
  assert.deepEqual(verifyCorrectedSource(root, proof, source), reconstructed)
  assert.deepEqual(sourceIdentity(), source, 'source/HEAD/index unchanged')
  console.log(JSON.stringify({ marker: 'C3_CORRECTED_SOURCE_LINEAGE_VERIFIED', source,
    producer: proof.producer.corrected, provenance: recordingIdentity(proofText), reconstructed, producerReversal: producer,
    originalRecordingReversal: equivalence, referenceInventories: [...inventories].map(([directory, rows]) => ({
      directory: basename(directory), files: rows.length, bytes: rows.reduce((sum, row) => sum + row.identity.bytes, 0) })),
    refusalControls: refusals, correctedPredecessorControl: 'synthetic admission-only; no gameplay claim',
    actualTicks: 0, actualCommands: 0, artifactWrites: 0 }))
}
main()
