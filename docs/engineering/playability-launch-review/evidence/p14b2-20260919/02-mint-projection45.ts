// Generated test campaign only. Run BEFORE the projection-46 writer exists.
// Refuses a moved source/schema or an existing output; never replaces old fixtures.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { BridgeSession, createBridgeInitialState } from '../../../../../bridge/session.ts'
import { PROTOCOL_VERSION, PROJECTION_VERSION, SCHEMA_ID } from '../../../../../bridge/protocol.ts'
import { encodeBridgeRuntimeCheckpoint } from '../../../../../bridge/runtime-checkpoint.ts'
const expectedSource = 'e37cd2330be8c9129b0193a2bf8e84258e851307'
const expectedSchema = 'sha256:5b2a4ca93d930e90a288db55bb5cc3fdc8eea070ef51fa1450a193a325bd755d'
const sourceSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (sourceSha !== expectedSource || PROJECTION_VERSION !== 45 || SCHEMA_ID !== expectedSchema) throw new Error('Mint requires the genuine outgoing projection45 writer')
const path = 'tests/fixtures/p14/genuine-projection45-runtime.checkpoint.json.gz'
const provenancePath = 'tests/fixtures/p14/genuine-projection45-runtime.provenance.json'
if (existsSync(path) || existsSync(provenancePath)) throw new Error('Refusing fixture overwrite')
const session = new BridgeSession(createBridgeInitialState('p14b2-outgoing45-runtime'), 'p14b2-outgoing45-runtime')
const control = (commandId: string) => ({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision })
const saved = session.save(control('save-week-zero'))
if (!saved.accepted) throw new Error(saved.message)
for (const kind of ['commissionScreenplay', 'advanceWeek']) {
  const intent = session.snapshot().availableIntents.find((i) => i.kind === kind)
  if (intent === undefined) throw new Error(`Missing lawful ${kind} intent`)
  const response = session.command({ ...control(kind), type: 'submitIntent', payload: { intentId: intent.intentId } })
  if (!response.accepted) throw new Error(response.message)
}
const checkpoint = session.exportRuntimeCheckpoint()
if (checkpoint.savedSaveJson === null || checkpoint.savedSaveJson === checkpoint.currentSaveJson) throw new Error('Fixture requires distinct real saved/current slots')
const bytes = encodeBridgeRuntimeCheckpoint(checkpoint)
const compressed = gzipSync(bytes)
const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const provenance = { sourceSha, schemaId: SCHEMA_ID, projectionVersion: PROJECTION_VERSION, protocolVersion: PROTOCOL_VERSION,
  command: 'node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b2-20260919/02-mint-projection45.ts',
  campaign: 'generated fixture, never Owner campaign', actions: [`save at week${saved.gameWeek}`, 'commissionScreenplay', 'advanceWeek'],
  uncompressedSha256: sha(bytes), compressedSha256: sha(compressed),
  currentSaveVersion: JSON.parse(checkpoint.currentSaveJson).saveVersion, savedSaveVersion: JSON.parse(checkpoint.savedSaveJson).saveVersion,
  currentWeek: JSON.parse(checkpoint.currentSaveJson).state.market.tick, savedWeek: JSON.parse(checkpoint.savedSaveJson).state.market.tick,
  stateRevision: checkpoint.stateRevision, journalEntries: checkpoint.journal.length }
writeFileSync(path, compressed, { flag: 'wx' })
writeFileSync(provenancePath, JSON.stringify(provenance, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(provenance, null, 2))
