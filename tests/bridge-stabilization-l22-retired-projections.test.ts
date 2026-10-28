// Stabilization 2026-10-24, Owner decision 20A on audit finding L-22 (BRIDGE-03).
//
// The prior-identity registry jumped from projection 45 to 31: the thirteen identities of
// projections 32–44 were never registered and no genuine checkpoint of any of them exists. The
// ruling retires them formally, so bridge/runtime-checkpoint.ts states the range in
// RETIRED_PROTOCOL_4_SCHEMA_IDS and the existing schemaId refusal names the retired projection.
//
// The checkpoints below are SYNTHETIC: a genuine V14 save (the `makeSaveV14` recipe that
// tests/bridge-runtime-checkpoint.test.ts uses for its prior protocol-4 cases) wrapped in an
// envelope that claims the named identity. They prove the dispatch, never a historical profile.
import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { managedStudio } from './contracts/_contractFixtures.js'
import {
  BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
  BRIDGE_RUNTIME_CHECKPOINT_VERSION,
  BridgeRuntimeCheckpointError,
  RETIRED_PROTOCOL_4_SCHEMA_IDS,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
  decodeBridgeRuntimeCheckpoint,
  loadBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { exportSave, makeSaveV14 } from '../src/core/index.js'

// Read independently from each commit's generated/unity/StudioBridgeDtos.Generated.cs
// "Schema identity" header, never derived from the registry under test.
const PROJECTION_38 = 'sha256:baecd21e5fbfd4f13bd08b7af132d4b05fe24a40f1b38cd19d2782d9e2d0851e' // 06f05cf5
const LOWEST_REGISTERED = 'sha256:ba9cd199704f66d375585d0bec2128c950618a3ba6a8cf0845a5550fde41659f' // projection-v4-early, 720826bd
const HIGHEST_REGISTERED = 'sha256:d57642ad971a0682ae587c8d9c73fdf8b251f28749dd156e53a5c8487b4e6df8' // projection-v65, the outgoing identity registered beneath current66 (Sprint 11 slice B)
const RETIRED_LABELS = Array.from({ length: 13 }, (_, i) => `projection-v${String(32 + i)}`)

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
const projectionOf = (label: string): number => Number(/^projection-v(\d+)/.exec(label)![1])

let v14SaveJson: string | null = null
function syntheticCheckpoint(schemaId: string, seed: string): string {
  const currentSaveJson = v14SaveJson ??= exportSave(makeSaveV14(managedStudio('l22-retired-projections')))
  return `${canonicalJson({
    format: BRIDGE_RUNTIME_CHECKPOINT_FORMAT,
    checkpointVersion: BRIDGE_RUNTIME_CHECKPOINT_VERSION,
    protocolVersion: PROTOCOL_VERSION,
    schemaId,
    sessionId: `${seed}-prior-session`,
    stateRevision: 0,
    currentSaveJson,
    currentStateDigest: sha256(currentSaveJson),
    savedSaveJson: null,
    savedStateDigest: null,
    journalDigest: sha256(canonicalJson([])),
    journal: [],
  })}\n`
}

function refusal(run: () => unknown): BridgeRuntimeCheckpointError {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(BridgeRuntimeCheckpointError)
    return error as BridgeRuntimeCheckpointError
  }
  throw new Error('the checkpoint loaded; a refusal was required')
}

describe('L-22: projections 32–44 are retired by name, and the registered range still resolves', () => {
  it('the registry states the retired range: exactly projections 32–44, disjoint from the supported identities and the running one', () => {
    expect([...RETIRED_PROTOCOL_4_SCHEMA_IDS.values()]).toEqual(RETIRED_LABELS)
    expect(RETIRED_PROTOCOL_4_SCHEMA_IDS.get(PROJECTION_38)).toBe('projection-v38')
    for (const id of RETIRED_PROTOCOL_4_SCHEMA_IDS.keys()) expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(id)).toBe(false)
    expect(RETIRED_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)
    const supported = [...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.values()].map(projectionOf)
    expect(supported.filter((projection) => projection >= 32 && projection <= 44)).toEqual([])
  })

  it('a synthetic checkpoint claiming projection 38 is refused by name on the schemaId path, before any migration or new session', () => {
    const bytes = syntheticCheckpoint(PROJECTION_38, 'l22-retired-38')
    const createSessionId = vi.fn(() => 'l22-must-not-mint')
    const loaded = refusal(() => loadBridgeRuntimeCheckpoint(bytes, undefined, createSessionId))
    expect(loaded.checkpointPath).toBe('checkpoint.schemaId')
    expect(loaded.message).toMatch(/does not match the running TypeScript bridge schema/)
    expect(loaded.message).toContain('projection-v38 is retired')
    expect(loaded.message).toContain('projections 32–44')
    expect(createSessionId).not.toHaveBeenCalled()
    // The plain decode route shares the same refusal.
    expect(refusal(() => decodeBridgeRuntimeCheckpoint(bytes)).message).toBe(loaded.message)
  })

  it('every retired identity is refused with its own projection named; an unknown identity keeps the plain refusal', () => {
    const bytes = syntheticCheckpoint(PROJECTION_38, 'l22-retired-each')
    for (const [id, label] of RETIRED_PROTOCOL_4_SCHEMA_IDS) {
      const error = refusal(() => loadBridgeRuntimeCheckpoint(bytes.replace(PROJECTION_38, id)))
      expect(error.checkpointPath).toBe('checkpoint.schemaId')
      expect(error.message).toContain(`${label} is retired`)
    }
    const unknown = refusal(() => loadBridgeRuntimeCheckpoint(bytes.replace(PROJECTION_38, `sha256:${'ab'.repeat(32)}`)))
    expect(unknown.message).toBe('checkpoint.schemaId: does not match the running TypeScript bridge schema')
  })

  function resolves(schemaId: string, label: string, extreme: (...values: number[]) => number): void {
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.get(schemaId)).toBe(label)
    expect(extreme(...[...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.values()].map(projectionOf))).toBe(projectionOf(label))
    const loaded = loadBridgeRuntimeCheckpoint(syntheticCheckpoint(schemaId, `l22-${label}`), undefined, () => `l22-${label}-fresh`)
    expect(loaded.migratedFromProtocolVersion).toBe(PROTOCOL_VERSION)
    expect(loaded.hydrated.checkpoint).toMatchObject({ schemaId: SCHEMA_ID, sessionId: `l22-${label}-fresh`, stateRevision: 0, journal: [] })
  }

  it('the lowest registered projection (4, its early identity) still resolves and takes the governed prior path', () => {
    resolves(LOWEST_REGISTERED, 'projection-v4-early', Math.min)
  })

  it('the highest registered projection (65) still resolves and takes the governed prior path', () => {
    resolves(HIGHEST_REGISTERED, 'projection-v65', Math.max)
  })
})
