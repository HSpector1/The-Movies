// ── P10A W1b/W4 — deterministic Visual Oracle fixtures for the PERSON route ──
//
// The person inspector, retained Profile, and Roster are proven on projection 18, so their
// checkpoints must carry the projection-18 schema (createBridgeRuntimeCheckpoint stamps the
// current SCHEMA_ID). Rather than re-derive an endowed studio, this re-envelopes the ACCEPTED
// P09 migrated-endowed state (60 talent; six on-lot, contracted, locatable people; the same
// state s1-p09-migrated-endowed-unchanged already proves untouched) as a projection-18
// checkpoint with the p10 session identity the runner gates on. The state is real and
// unmodified — only the projection envelope and the session id are new.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { createBridgeRuntimeCheckpoint, encodeBridgeRuntimeCheckpoint } from '../bridge/runtime-checkpoint.ts'

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex')

const P09_ENDOWED = 'ui/e2e/p09-visual-oracle-v1/s1-p09-migrated-endowed-unchanged.checkpoint.json'
const OUT_DIR = 'ui/e2e/p10-visual-oracle-v1'

type P10Fixture = { scenarioId: string; sessionId: string; sourceSaveJson: string }

const P09_FIRST_FILM = 'ui/e2e/p09-visual-oracle-v1/s10-p09-first-film-released.checkpoint.json'

const fixtures: P10Fixture[] = [
  {
    scenarioId: 'person-inspector',
    sessionId: 'p10-oracle-p10-person-inspector',
    sourceSaveJson: (JSON.parse(readFileSync(P09_ENDOWED, 'utf8')) as { currentSaveJson: string }).currentSaveJson,
  },
  {
    // The cross-stack person<->history adapters need a studio with a released film and captured
    // participants. The accepted P09 first-film-released state has exactly that (six credited
    // people in P08 history, each a partial-provenance credit without a frozen career event).
    scenarioId: 'person-history',
    sessionId: 'p10-oracle-p10-person-history',
    sourceSaveJson: (JSON.parse(readFileSync(P09_FIRST_FILM, 'utf8')) as { currentSaveJson: string }).currentSaveJson,
  },
]

mkdirSync(OUT_DIR, { recursive: true })
const manifest = fixtures.map((fixture, index) => {
  const ordinal = index + 1
  // The checkpoint's own hydrate validates the reused save under the current save path.
  const checkpoint = createBridgeRuntimeCheckpoint({
    sessionId: fixture.sessionId,
    stateRevision: 0,
    currentSaveJson: fixture.sourceSaveJson,
    savedSaveJson: null,
    journal: [],
  })
  const checkpointJson = encodeBridgeRuntimeCheckpoint(checkpoint)
  const checkpointName = `s${ordinal}-p10-${fixture.scenarioId}.checkpoint.json`
  writeFileSync(join(OUT_DIR, checkpointName), checkpointJson)
  return {
    ordinal,
    scenarioId: `p10-${fixture.scenarioId}`,
    file: checkpointName,
    byteLength: Buffer.byteLength(checkpointJson),
    sha256: sha256(checkpointJson),
    sessionId: fixture.sessionId,
    schemaId: checkpoint.schemaId,
    protocolVersion: checkpoint.protocolVersion,
    stateDigest: checkpoint.currentStateDigest,
    source: P09_ENDOWED,
  }
})
writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify({ generatedFrom: P09_ENDOWED, fixtures: manifest }, null, 2) + '\n')
for (const m of manifest) console.log(`[gen-p10] ${m.file} schema=${m.schemaId} protocol=${m.protocolVersion} session=${m.sessionId} sha=${m.sha256.slice(0, 12)}`)
