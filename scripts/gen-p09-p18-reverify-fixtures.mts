// P09-on-P10 re-verify — re-envelope the accepted P09 Build scenarios at projection 18 so the
// FINAL projection-18 player can rerun the ordinary-boot / Build regression (Current Ops addendum
// item 4). Same states, same p09-oracle- session identities (so the shipped p09 runner scenarios
// accept them) and same filenames; only the projection envelope (schema ea5d645f) is new.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const SRC = 'ui/e2e/p09-visual-oracle-v1'
const OUT = 'ui/e2e/p09-visual-oracle-v1-p18'
mkdirSync(OUT, { recursive: true })

// The bare-lot boot (s2), the Build placement (s3), and the office rising (s5).
const files = ['s2-p09-sparse-start', 's3-p09-valid-placement', 's5-p09-office-rising', 's7-p09-reconnect-same-ids', 's9-p09-save-load-mid-construction', 's1-p09-migrated-endowed-unchanged']
for (const name of files) {
  const src = JSON.parse(readFileSync(join(SRC, `${name}.checkpoint.json`), 'utf8')) as { currentSaveJson: string; sessionId: string }
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: src.sessionId,
    stateRevision: 0,
    currentSaveJson: src.currentSaveJson,
    savedSaveJson: null,
    journal: [],
  })
  const json = encodeBridgeRuntimeCheckpoint(checkpoint)
  writeFileSync(join(OUT, `${name}.checkpoint.json`), json)
  console.log(`[gen-p18] ${name} schema=${checkpoint.schemaId.slice(0, 20)} session=${src.sessionId} sha=${sha256(json).slice(0, 12)}`)
}
