// 1307: a genuine outgoing projection55 runtime checkpoint, minted at the last projection55/Save40 writer before
// the combined R2/R3 increment moves both (1304-F, 1305-F). The house law registers the outgoing schema id in the
// same commit that moves the projection; this input lets the prior-schema path be tested on real bytes. Parent
// executes once under the bounded recorder; no rehearsal, search, state surgery or retry. Its only input is the
// reviewed 1306 week-110 Save40 fixture, pinned by hash; it writes only its own new output directory.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID, validateCommand, validateControl } from '../../../../../bridge/protocol.ts'
import { decodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
import { createBridgeRuntimeCoordinator } from '../../../../../bridge/runtime/runtime-coordinator.ts'
import type { BridgeCheckpointStore } from '../../../../../bridge/runtime/checkpoint-store.ts'
import { BridgeSession } from '../../../../../bridge/session.ts'
import { exportSave, LIVE_SAVE_VERSION, makeSave, validateSaveV40 } from '../../../../../src/core/save.ts'

const ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const INPUT = 'tests/fixtures/p14/genuine-v40-pre-r3/genuine-v40-r3-outgoing-week110.json.gz'
const INPUT_GZIP = { bytes: 122176, sha256: '196b73d43ac6e346c6b6e6a73e0b13f16bc23a1f5d321947067d6f81ca774bd8' }
const INPUT_RAW = { bytes: 1094789, sha256: '2e717382e952fa0f175f07d5f7055d6d3f37c66eb4bf86a783dd169ae21d2ddc' }
const OUTPUT = 'tests/fixtures/p14/genuine-runtime55-pre-r3'
const NAME = 'runtime55-current111-saved110'
const SESSION = '1307-outgoing55'
const id = (raw: string | Uint8Array) => ({ bytes: typeof raw === 'string' ? Buffer.byteLength(raw) : raw.byteLength,
  sha256: createHash('sha256').update(raw).digest('hex') })
const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const out = (path: string, data: string | Uint8Array) => writeFileSync(resolve(ROOT, path), data, { flag: 'wx' })

class Store implements BridgeCheckpointStore {
  checkpointPath = '/synthetic/1307-outgoing55-checkpoint.json'
  writes = 0
  closed = false
  constructor(public contents: string | null = null) {}
  async read() { assert.equal(this.closed, false); return this.contents }
  async writeAtomic(text: string) { assert.equal(this.closed, false); this.writes++; this.contents = text }
  async close() { assert.equal(this.closed, false); this.closed = true }
}

async function main(): Promise<void> {
  assert.equal(LIVE_SAVE_VERSION, 40, 'valid only while the live writer is Save40')
  assert.equal(PROJECTION_VERSION, 55, 'valid only while the live projection is 55')
  assert.equal(PROTOCOL_VERSION, 4)
  const head = process.env.P14_RUNTIME55_PRODUCER_HEAD ?? ''
  assert.match(head, /^[0-9a-f]{40}$/, 'P14_RUNTIME55_PRODUCER_HEAD must name the published execution HEAD')
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), head)
  assert.ok(!existsSync(resolve(ROOT, OUTPUT)), `refusing to overwrite ${OUTPUT}`)

  const zipped = readFileSync(resolve(ROOT, INPUT))
  assert.deepEqual(id(zipped), INPUT_GZIP, 'pinned 1306 input gzip')
  const raw = gunzipSync(zipped).toString('utf8')
  assert.deepEqual(id(raw), INPUT_RAW, 'pinned 1306 input bytes')
  const input = validateSaveV40(JSON.parse(raw))
  assert.equal(exportSave(input), raw, 'input is a current-writer export')
  const initial = input.state
  assert.equal(initial.market.tick, 110)
  assert.equal(exportSave(makeSave(initial)), raw, 'the current writer re-exports the input exactly')

  let fresh = 0
  const store = new Store()
  const runtime = await createBridgeRuntimeCoordinator({ store, fatal: (error: unknown) => { throw error },
    createFreshSession: (limits) => { fresh++; return new BridgeSession(structuredClone(initial), SESSION, null, { limits }) } })
  let closed = false
  try {
  const start = decodeBridgeRuntimeCheckpoint(store.contents!)
  assert.equal(start.checkpoint.schemaId, SCHEMA_ID)
  assert.equal(start.checkpoint.currentSaveJson, raw)
  assert.equal(start.checkpoint.journal.length, 0)

  const control = validateControl(await runtime.read(session => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
    sessionId: session.sessionId, expectedStateRevision: session.stateRevision, commandId: '1307-save110' })))
  assert.ok(control.ok, control.ok ? '' : control.message)
  const saved = await runtime.dispatch('save', control.control)
  assert.equal(saved.firstSeen, true)
  assert.equal(saved.response.accepted, true)

  const snapshot = await runtime.read(session => session.snapshot())
  const option = snapshot.availableIntents.find(intent => intent.kind === 'advanceWeek')
  assert.ok(option, 'route premise: advanceWeek is offered at week 110')
  const command = validateCommand({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: snapshot.sessionId,
    commandId: '1307-advance110', expectedStateRevision: snapshot.stateRevision, type: 'submitIntent',
    payload: { intentId: option.intentId } })
  assert.ok(command.ok, command.ok ? '' : command.message)
  const advanced = await runtime.dispatch('command', command.command)
  assert.equal(advanced.firstSeen, true)
  assert.equal(advanced.response.accepted, true)

  const durable = store.contents!
  await runtime.close()
  closed = true
  assert.equal(fresh, 1)

  // 1307-B: restart from the durable bytes and replay the command. A genuine checkpoint
  // reopens without a rewrite and answers the duplicate from its journal (as 1221 did).
  const reopened = new Store(durable)
  const restarted = await createBridgeRuntimeCoordinator({ store: reopened, fatal: (error: unknown) => { throw error },
    createFreshSession: () => { throw new Error('a restart must not mint a fresh session') } })
  try {
    assert.equal(reopened.contents, durable)
    const replay = await restarted.dispatch('command', command.command)
    assert.equal(replay.firstSeen, false)
    assert.equal(replay.responseJson, advanced.responseJson)
    assert.equal(reopened.writes, 0)
    assert.equal(reopened.contents, durable)
  } finally {
    await restarted.close()
  }
  const decoded = decodeBridgeRuntimeCheckpoint(durable)
  const checkpoint = decoded.checkpoint
  assert.equal(checkpoint.schemaId, SCHEMA_ID)
  assert.equal(checkpoint.sessionId, SESSION)
  assert.equal(checkpoint.stateRevision, 1)
  assert.deepEqual(checkpoint.journal.map(row => row.route), ['save', 'command'])
  assert.equal(checkpoint.savedSaveJson, raw, 'saved slot is the week-110 input')
  assert.equal(decoded.currentSave.state.market.tick, 111)
  assert.notEqual(checkpoint.currentSaveJson, checkpoint.savedSaveJson)
  assert.equal(validateSaveV40(JSON.parse(checkpoint.currentSaveJson)).saveVersion, 40)
  const reloaded = loadBridgeRuntimeCheckpoint(durable)
  assert.equal(reloaded.migratedFromProtocolVersion, null, 'current55 loads without migration')

  const gz = gzipSync(Buffer.from(durable, 'utf8'), { level: 9 })
  assert.equal(gunzipSync(gz).toString('utf8'), durable)
  mkdirSync(resolve(ROOT, OUTPUT), { recursive: false })
  out(`${OUTPUT}/${NAME}.json.gz`, gz)
  const facts = { schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION, saveVersion: LIVE_SAVE_VERSION,
    sessionId: SESSION, stateRevision: 1, journalRoutes: ['save', 'command'], journalDigest: checkpoint.journalDigest,
    savedSlot: { week: 110, ...id(checkpoint.savedSaveJson!) }, currentSlot: { week: 111, ...id(checkpoint.currentSaveJson) } }
  out(`${OUTPUT}/${NAME}.provenance.json`, json({ purpose: 'generated test campaigns only; never Owner saves',
    record: '1307', plan: ['1304-F', '1305-F'],
    producer: 'docs/engineering/playability-launch-review/evidence/p14b4-20260919/1307-runtime55-outgoing-producer.ts',
    executionHead: head, input: { path: INPUT, gzip: INPUT_GZIP, decoded: INPUT_RAW },
    route: 'fresh runtime session on the 1306 week-110 Save40 input; save; submit the offered advanceWeek intent; restart and replay the command',
    gzip: id(gz), decoded: id(durable), facts }))
  out(`${OUTPUT}/MANIFEST.json`, json({ purpose: 'generated test campaigns only; never Owner saves', record: '1307',
    executionHead: head, checkpoints: [{ name: NAME, gzip: id(gz), decoded: id(durable), facts }] }))
  console.log(JSON.stringify({ output: OUTPUT, gzip: id(gz), decoded: id(durable), facts }))
  } finally {
    if (!closed) await runtime.close()
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
