// CLOSE-GATES-01 §9 — projection-19 re-envelopes of the ACCEPTED P08 and P09 Visual Oracle
// fixtures, so the cumulative P08/P09 regression runs on the FINAL compatible engine/player pair
// with the oracle's session identity intact (the engine re-projects a prior-schema checkpoint
// with a fresh session id, which the runner's session gate would refuse). Same states, same
// session ids, same filenames; only the projection envelope (schema 6a2c01fe…) is new.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'
import { importSaveJson, exportSaveJson } from '../ui/src/engine/adapter.ts'

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')
const SETS = [
  { src: 'ui/e2e/p08-visual-oracle-v1', out: 'ui/e2e/p08-visual-oracle-v1-p19' },
  { src: 'ui/e2e/p09-visual-oracle-v1', out: 'ui/e2e/p09-visual-oracle-v1-p19' },
]
for (const { src, out } of SETS) {
  mkdirSync(out, { recursive: true })
  const manifest: Array<Record<string, unknown>> = []
  for (const file of readdirSync(src).filter((name) => name.endsWith('.checkpoint.json')).sort()) {
    const checkpoint = JSON.parse(readFileSync(join(src, file), 'utf8')) as { currentSaveJson: string; savedSaveJson: string | null; sessionId: string }
    // The accepted save inside may be an older durable version; the live import path migrates it
    // exactly as the engine would on boot, and the re-envelope carries the CURRENT V18 bytes.
    const current: any = importSaveJson(checkpoint.currentSaveJson)
    if (!current.ok) throw new Error(`${file}: ${current.error}`)
    const saved: any = checkpoint.savedSaveJson === null ? null : importSaveJson(checkpoint.savedSaveJson)
    if (saved !== null && !saved.ok) throw new Error(`${file} (saved): ${saved.error}`)
    const envelope = createBridgeRuntimeCheckpoint({
      sessionId: checkpoint.sessionId,
      stateRevision: 0,
      currentSaveJson: exportSaveJson(current.state),
      savedSaveJson: saved === null ? null : exportSaveJson(saved.state),
      journal: [],
    })
    const json = encodeBridgeRuntimeCheckpoint(envelope)
    writeFileSync(join(out, file), json)
    manifest.push({ file, sessionId: checkpoint.sessionId, schemaId: envelope.schemaId, sha256: sha256(json), gameWeek: current.state.market.tick })
    console.log(`[gen-p19] ${out}/${file} week=${String(current.state.market.tick)} session=${checkpoint.sessionId} sha=${sha256(json).slice(0, 12)}`)
  }
  writeFileSync(join(out, 'manifest.json'), JSON.stringify({ generatedFrom: src, schemaId: manifest[0]?.schemaId, fixtures: manifest }, null, 2) + '\n')
}
