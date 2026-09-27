// Recording only. No project imports, game state mutation, filesystem or clock.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'

export const OBSERVATION_FORMAT = 'c3-observations-focus-dictionary-v1' as const
export const ORIGINAL_PRODUCER = { bytes: 66372,
  sha256: 'f7d19d39218b9570b3be65a14a0e3cd0a346dd06be1beb283a9bdcc830dfff4d' } as const
export const ORIGINAL_ENDURANCE = { bytes: 43293,
  sha256: '3c356493a0515e88a75ca945d0ed2d0b0daed1a4b2414aeee811a531fc96ae8d' } as const
export const ORIGINAL_A_METADATA = { bytes: 1129358,
  sha256: '3762178bb4a542b5f10014a55c78fead6bbfbbf2e4cecd70659cb69becc6163d' } as const
export const ORIGINAL_A_DIRECTORY = '1052-c3-endurance-A-observer-fixed'
export type RecordingIdentity = { bytes: number; sha256: string }
export type RecordingProvenance = {
  format: typeof OBSERVATION_FORMAT
  original: { path: string; identity: RecordingIdentity; endurance: RecordingIdentity }
  revised: { path: string; identity: RecordingIdentity }
  codec: { path: string; identity: RecordingIdentity }
  verification: { path: string; identity: RecordingIdentity }
  eligibleOriginalA: { directory: string; metadata: RecordingIdentity; producer: RecordingIdentity }
  edits: { label: string; originalStart: number; originalEnd: number; oldText: string; newText: string }[]
}
export const recordingIdentity = (text: string | Uint8Array): RecordingIdentity => ({ bytes: Buffer.byteLength(text),
  sha256: createHash('sha256').update(text).digest('hex') })

function object(value: unknown): Record<string, unknown> {
  assert.ok(value !== null && typeof value === 'object' && !Array.isArray(value), 'observation object required')
  return value as Record<string, unknown>
}
function exactKeys(value: Record<string, unknown>, keys: readonly string[]) {
  assert.deepEqual(Object.keys(value), keys, 'record keys and order are exact')
}
function parsedLine(text: string): Record<string, unknown> {
  assert.ok(text.endsWith('\n') && !text.slice(0, -1).includes('\n'), 'one complete JSONL record required')
  const row = object(JSON.parse(text.slice(0, -1)))
  assert.equal(JSON.stringify(row) + '\n', text, 'retain exact JSON.stringify byte representation')
  assert.equal(typeof row.kind, 'string')
  return row
}
function boundaryPrefix(row: Record<string, unknown>): string {
  assert.equal(row.kind, 'lifecycle-boundary')
  assert.ok(Number.isSafeInteger(row.week) && (row.week as number) >= 0)
  assert.ok(Number.isSafeInteger(row.count) && (row.count as number) >= 0)
  assert.ok(typeof row.root === 'string'
    && ['records', 'professionChanges', 'transitionEvaluations', 'industryRetirements'].includes(row.root), 'known lifecycle root required')
  return JSON.stringify({ kind: row.kind, week: row.week, root: row.root, count: row.count }).slice(0, -1)
}
export type PreparedObservation = { text: string; commit: () => void }

export class ObservationEncoder {
  private readonly ids = new Map<string, string>()
  private dictionaryBytes = 0
  constructor(private readonly byteCap: number) { assert.ok(Number.isSafeInteger(byteCap) && byteCap > 0) }

  prepare(text: string): PreparedObservation {
    assert.ok(Buffer.byteLength(text) <= this.byteCap, 'single original record within compact cap')
    const row = parsedLine(text)
    assert.notEqual(row.kind, 'focus-definition', 'caller cannot inject codec definitions')
    if (row.kind !== 'lifecycle-boundary') return { text, commit: () => {} }
    exactKeys(row, ['kind', 'week', 'root', 'count', 'focus'])
    assert.ok(Array.isArray(row.focus), 'focus is an array')
    const prefix = boundaryPrefix(row), focus = JSON.stringify(row.focus)
    assert.equal(prefix + ',"focus":' + focus + '}\n', text)
    const known = this.ids.get(focus), id = known ?? `focus-${this.ids.size}`
    const definition = known === undefined ? JSON.stringify({ kind: 'focus-definition', id, focus: row.focus }) + '\n' : ''
    const encoded = definition + prefix + ',"focusRef":' + JSON.stringify(id) + '}\n'
    const addition = known === undefined ? Buffer.byteLength(focus) : 0
    assert.ok(this.dictionaryBytes + addition <= this.byteCap, 'dictionary within existing compact cap')
    assert.ok(Buffer.byteLength(encoded) <= this.byteCap, 'combined definition and reference within compact cap')
    let committed = false
    return { text: encoded, commit: () => {
      assert.equal(committed, false, 'prepared append commits once'); committed = true
      if (known === undefined) {
        assert.equal(this.ids.has(focus), false, 'prepared append cannot race another new definition')
        assert.equal(id, `focus-${this.ids.size}`)
        this.ids.set(focus, id); this.dictionaryBytes += addition
      } else assert.equal(this.ids.get(focus), id)
    } }
  }
}

// Streaming reconstruction: decoded bytes need not be retained in memory or a
// second artifact. The caller may hash/compare each line. Physical input and
// dictionary retain the original compact cap; no logical row is discarded.
export function decodeObservations(text: string, emit: (line: string) => void, byteCap: number) {
  assert.ok(Number.isSafeInteger(byteCap) && byteCap > 0)
  assert.ok(Buffer.byteLength(text) <= byteCap, 'encoded compact cap')
  assert.ok(text.endsWith('\n'), 'complete encoded JSONL required')
  const definitions = new Map<string, string>(), values = new Set<string>()
  let dictionaryBytes = 0, waiting: string | null = null, logicalRows = 0
  for (const raw of text.slice(0, -1).split('\n')) {
    const line = raw + '\n', row = parsedLine(line)
    if (row.kind === 'focus-definition') {
      assert.equal(waiting, null, 'a definition must be used immediately')
      exactKeys(row, ['kind', 'id', 'focus']); assert.ok(Array.isArray(row.focus))
      const id = `focus-${definitions.size}`, focus = JSON.stringify(row.focus)
      assert.equal(row.id, id, 'sequential unique dictionary identity')
      assert.equal(values.has(focus), false, 'duplicate focus definition refused')
      dictionaryBytes += Buffer.byteLength(focus)
      assert.ok(dictionaryBytes <= byteCap, 'dictionary compact cap')
      definitions.set(id, focus); values.add(focus); waiting = id
    } else if (row.kind === 'lifecycle-boundary') {
      exactKeys(row, ['kind', 'week', 'root', 'count', 'focusRef'])
      assert.equal(typeof row.focusRef, 'string')
      const id = row.focusRef as string, focus = definitions.get(id)
      assert.notEqual(focus, undefined, 'unknown/forward focus reference refused')
      if (waiting !== null) assert.equal(id, waiting, 'new definition must serve the next boundary')
      waiting = null; emit(boundaryPrefix(row) + ',"focus":' + focus + '}\n'); logicalRows++
    } else {
      assert.equal(waiting, null, 'definition cannot be stranded before another record')
      emit(line); logicalRows++
    }
  }
  assert.equal(waiting, null, 'unused terminal definition refused')
  return { logicalRows, definitions: definitions.size, dictionaryBytes }
}

// The actual revised loader and its independent refusal verification share this
// recording-identity gate. Complete inventory/source/authority checks remain in
// the loader, byte-for-byte in the reviewed reference hunk.
export function assertRecordingReference(metadataText: string, directory: string, variant: 'A' | 'B' | 'C' | 'D',
  producer: RecordingIdentity, recording: unknown) {
  const metadata = object(JSON.parse(metadataText))
  assert.equal(metadata.status, 'PASS', 'reference must have completed PASS')
  assert.equal(metadata.variant, variant, 'reference occupies its exact predecessor/baseline role')
  if (variant === 'A') {
    assert.equal(directory, ORIGINAL_A_DIRECTORY, 'only the exact completed original A is eligible')
    assert.deepEqual(recordingIdentity(metadataText), ORIGINAL_A_METADATA, 'immutable original A metadata pin')
    assert.deepEqual(metadata.producer, ORIGINAL_PRODUCER, 'explicit original producer; never relabelled identical')
    assert.equal(metadata.recording, undefined, 'original A keeps its original metadata shape')
  } else {
    assert.equal(object(recording).format, OBSERVATION_FORMAT, 'current recording lineage is mandatory')
    assert.deepEqual(metadata.producer, producer, 'same revised frozen producer for remaining variants')
    assert.deepEqual(metadata.recording, recording, 'exact recording format, codec, provenance and original A lineage')
  }
}

export function verifyRecordingProvenance(proof: RecordingProvenance, original: string, revised: string, codec: string) {
  assert.equal(proof.format, OBSERVATION_FORMAT)
  assert.deepEqual(recordingIdentity(original), ORIGINAL_PRODUCER)
  assert.deepEqual(proof.original.identity, ORIGINAL_PRODUCER)
  assert.deepEqual(proof.original.endurance, ORIGINAL_ENDURANCE)
  assert.deepEqual(recordingIdentity(revised), proof.revised.identity)
  assert.deepEqual(recordingIdentity(codec), proof.codec.identity)
  assert.equal(proof.eligibleOriginalA.directory, ORIGINAL_A_DIRECTORY)
  assert.deepEqual(proof.eligibleOriginalA.metadata, ORIGINAL_A_METADATA)
  assert.deepEqual(proof.eligibleOriginalA.producer, ORIGINAL_PRODUCER)
  const labels = ['codec-import', 'recording-metadata-type', 'artifact-encoder', 'artifact-append',
    'reference-compatibility', 'recording-preflight', 'recording-input-guards', 'recording-metadata']
  assert.deepEqual(proof.edits.map(edit => edit.label), labels, 'only documented recording/reference hunks')
  const originalBytes = Buffer.from(original), revisedBytes = Buffer.from(revised)
  const forward: Buffer[] = [], reverse: Buffer[] = []
  let originalCursor = 0, revisedCursor = 0
  for (const edit of proof.edits) {
    assert.ok(Number.isSafeInteger(edit.originalStart) && Number.isSafeInteger(edit.originalEnd))
    assert.ok(edit.originalStart >= originalCursor && edit.originalEnd >= edit.originalStart && edit.originalEnd <= originalBytes.length)
    const unchanged = originalBytes.subarray(originalCursor, edit.originalStart)
    assert.deepEqual(revisedBytes.subarray(revisedCursor, revisedCursor + unchanged.length), unchanged)
    forward.push(unchanged); reverse.push(unchanged); revisedCursor += unchanged.length
    const oldBytes = Buffer.from(edit.oldText), newBytes = Buffer.from(edit.newText)
    assert.deepEqual(originalBytes.subarray(edit.originalStart, edit.originalEnd), oldBytes)
    assert.deepEqual(revisedBytes.subarray(revisedCursor, revisedCursor + newBytes.length), newBytes)
    forward.push(newBytes); reverse.push(oldBytes)
    originalCursor = edit.originalEnd; revisedCursor += newBytes.length
  }
  const tail = originalBytes.subarray(originalCursor)
  assert.deepEqual(revisedBytes.subarray(revisedCursor), tail)
  forward.push(tail); reverse.push(tail)
  assert.deepEqual(Buffer.concat(forward), revisedBytes, 'bounded patch reconstructs complete revised source')
  assert.deepEqual(Buffer.concat(reverse), originalBytes, 'reverse only listed hunks reconstructs exact original source')
  const segment = (source: string) => {
    const start = source.indexOf('class Endurance {'), end = source.indexOf('function loadReference(')
    assert.ok(start >= 0 && end > start); return source.slice(start, end)
  }
  assert.equal(segment(revised), segment(original), 'entire game policy and all schedules byte-identical')
  assert.deepEqual(recordingIdentity(segment(original)), ORIGINAL_ENDURANCE)
  return { reconstructedOriginal: ORIGINAL_PRODUCER, endurance: ORIGINAL_ENDURANCE, hunks: proof.edits.length }
}
