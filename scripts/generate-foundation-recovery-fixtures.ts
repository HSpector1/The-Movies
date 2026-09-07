import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { BridgeSession } from '../bridge/session.js'
import { encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.js'
import { PROTOCOL_VERSION, SCHEMA_ID, SNAPSHOT_VERSION } from '../bridge/protocol.js'
import { exportSave, makeSave } from '../src/core/index.js'
import { foundationRecoveryStudio } from '../tests/contracts/_foundationRecoveryFixtures.js'

// Fixture generation only. Never opens a bridge, player, or Owner profile.
const output = resolve('ui/e2e/foundation-recovery-v1')
mkdirSync(output, { recursive: true })
const state = foundationRecoveryStudio()
const session = new BridgeSession(state, 'foundation-recovery-no-project')
const checkpoint = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
const save = exportSave(makeSave(state))
writeFileSync(resolve(output, 's1-no-contract-no-project.checkpoint.json'), checkpoint)
writeFileSync(resolve(output, 's1-no-contract-no-project.save.json'), save)
writeFileSync(resolve(output, 'fixture-provenance.json'), JSON.stringify({
  authorization: 'OPS-P08P10-FOUNDATION-RECOVERY-01',
  generator: 'scripts/generate-foundation-recovery-fixtures.ts',
  legalTrajectory: 'minimum founding; commission/accept; legal greenlight and operations; Ready at9; hold to104; commit and release at105',
  seed: state.seed, week: state.market.tick, cash: state.studio.cash,
  contracts: state.contracts.length, protocolVersion: PROTOCOL_VERSION,
  snapshotVersion: SNAPSHOT_VERSION, schemaId: SCHEMA_ID, saveVersion: 18,
  addedCash: 0, editedContracts: 0, forcedScreenplays: 0,
  checkpointSha256: createHash('sha256').update(checkpoint).digest('hex'),
  saveSha256: createHash('sha256').update(save).digest('hex'),
}, null, 2) + '\n')
console.log('Generated legal recovery fixture at ' + output)
