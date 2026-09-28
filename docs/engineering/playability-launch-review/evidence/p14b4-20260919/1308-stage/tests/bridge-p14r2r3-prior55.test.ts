// ── P14 task 1308-C (new file): the outgoing projection55 runtime-checkpoint consumer for the
// combined R2+R3 increment (projection 55->56, Save 40->41) ──
//
// STAGED FILE. Import paths below are written for this file's INTENDED destination,
// `tests/bridge-p14r2r3-prior55.test.ts` (one level below repo root, beside every other
// `tests/*.test.ts`; fixture URL relative to that same directory). It is physically staged at
// docs/engineering/playability-launch-review/evidence/p14b4-20260919/1308-stage/tests/ and has
// NOT been executed, type-checked, or moved from there by this author.
//
// PRECEDENT MIRRORED: tests/bridge-p14p4p5-opportunities.test.ts's leaf 'B55-3 independently
// migrates genuine54 slots and resets only prior runtime authority' (read in full) — the same
// shape one version bump earlier (prior54->current55). This file is the projection56 successor:
// prior55->current56, consuming the genuine outgoing projection55 checkpoint the parent minted
// and reviewed for exactly this purpose (1307-K closure: "registered as projection-v55 in
// SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS by the R2/R3 increment; its RED/GREEN consumer test
// loads it through the prior-schema path and migrates each Save40 slot to Save41
// independently"). Functions `pinned`/`prior54` in that file are the direct style precedent for
// the `pinned`/`priorCheckpoint` helpers below; not imported (this file stands alone).
//
// FIXTURE (pinned by MANIFEST + provenance, read directly; no other fixture payload gunzipped
// or parsed to derive a fact in this file): `tests/fixtures/p14/genuine-runtime55-pre-r3/
// runtime55-current111-saved110.json.gz`. Provenance (1307-K, 1307 provenance.json, verbatim):
// route "fresh runtime session on the 1306 week-110 Save40 input; save; submit the offered
// advanceWeek intent; restart and replay the command" — built FROM the genuine
// `genuine-v40-r3-outgoing-week110` Save40 input (same fixture family
// p14r3-save-v41.test.ts uses), so its `savedSaveJson` slot (week 110) carries the SAME one
// player termination ledger row / receipt and zero rival termination receipts that file's
// "same-name collision" leaf witnesses; `currentSaveJson` (week 111) is one further public
// week advanced. schemaId sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158
// (protocolVersion 4, projection 55 — the CURRENT, unbumped, live schema id at this HEAD, per
// `bridge/schema/bridge-schema.ts:281` PROJECTION_VERSION=55 and its $id construction), sessionId
// '1307-outgoing55', stateRevision 1, journalRoutes ['save','command'], journalDigest
// e8b9748d6870e02f99306dd0f534043832e11fbb61b41d640b12f3f3925c2f82, savedSlot {week:110,
// bytes:1094789, sha256:2e717382e952fa0f175f07d5f7055d6d3f37c66eb4bf86a783dd169ae21d2ddc},
// currentSlot {week:111, bytes:1095023,
// sha256:487d8f7eae91d3ec058a5f7f42be21428a2f6a318c3dd459b0cf2ed06985143d}. All facts above are
// read directly from tests/fixtures/p14/genuine-runtime55-pre-r3/MANIFEST.json and
// runtime55-current111-saved110.provenance.json, cross-checked against the actual committed
// checkpoint's own top-level fields (format/checkpointVersion/protocolVersion/schemaId/
// sessionId/stateRevision/journal, all confirmed present) — never derived from running any
// project code.
//
// CURRENT PRODUCTION FACT (RED cause, verified directly against source at this HEAD):
//   - `bridge/schema/bridge-schema.ts:281` PROJECTION_VERSION is 55, not 56; `BRIDGE_SCHEMA.$id`
//     is therefore `urn:project-studio:bridge:protocol-4:projection-55`, not `...-56`.
//   - `SCHEMA_ID` (`bridge/protocol.ts:35`, `schemaIdentity(BRIDGE_SCHEMA)`) is computed from
//     the CURRENT (projection55) schema, so it equals this fixture's own `schemaId` TODAY —
//     the fixture's schema is the LIVE one, not yet a prior one. Once R2/R3 lands, PROJECTION_
//     VERSION moves to 56, SCHEMA_ID changes, and this fixture's schema id must be registered
//     as a PRIOR one — today it is absent from SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.
//   - `validateSaveV41`/`convertV40ToV41`/`migrateToLive`'s Save41 path do not exist yet
//     (same absent-export RED as p14r3-save-v41.test.ts; migrateToLive itself exists today but
//     only chains to V40).
// Every assertion below is therefore RED against unchanged production.

import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it, vi } from 'vitest'
import { PROJECTION_VERSION, PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BRIDGE_SCHEMA } from '../bridge/schema/bridge-schema.ts'
import {
  encodeBridgeRuntimeCheckpoint, loadBridgeRuntimeCheckpoint,
  SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS,
} from '../bridge/runtime-checkpoint.ts'
import { exportSave, migrateToLive, validateSaveV40, validateSaveV41 } from '../src/core/save.js'

const FIXTURES = new URL('./fixtures/p14/genuine-runtime55-pre-r3/', import.meta.url)
const OLD_SCHEMA = 'sha256:2c377b6fa3c559eee753e7a9d91d4956399cca1a5693edb15adb3de7c4f27158'
const sha = (value: string | Uint8Array): string => createHash('sha256').update(value).digest('hex')

type PriorRuntime = {
  format: string; checkpointVersion: number; protocolVersion: number; schemaId: string
  sessionId: string; stateRevision: number; currentSaveJson: string; savedSaveJson: string
  currentStateDigest: string; savedStateDigest: string; journalDigest: string
  journal: { route: string; commandId: string; requestJson: string; responseJson: string }[]
}

function manifestPin(): void {
  const manifest = readFileSync(new URL('MANIFEST.json', FIXTURES))
  expect(manifest.byteLength).toBe(1270)
  expect(sha(manifest)).toBe('c573009c6a46210750b6f3ab4e52e6beccc54515752baaf75fc10f74f2897fcc')
}

function priorCheckpoint(): { raw: string; value: PriorRuntime } {
  manifestPin()
  const gz = readFileSync(new URL('runtime55-current111-saved110.json.gz', FIXTURES))
  expect(gz.byteLength).toBe(435601)
  expect(sha(gz)).toBe('3e9ca499555dfcca262078329f66030fc0a49f52e350dec38749bb51e2af7447')
  const raw = gunzipSync(gz).toString('utf8')
  expect(Buffer.byteLength(raw, 'utf8')).toBe(4850473)
  expect(sha(raw)).toBe('939da0b79a2b9fbef45b7f71c71e3717d80d885b7c3a2e6244cdebc1bf379036')
  const value = JSON.parse(raw) as PriorRuntime
  expect(value).toMatchObject({
    format: 'project-studio-bridge-runtime-checkpoint', checkpointVersion: 1, protocolVersion: 4,
    schemaId: OLD_SCHEMA, sessionId: '1307-outgoing55', stateRevision: 1,
  })
  expect(value.journal).toHaveLength(2)
  expect(value.journal.map((row) => row.route)).toEqual(['save', 'command'])
  expect(value.journalDigest).toBe('e8b9748d6870e02f99306dd0f534043832e11fbb61b41d640b12f3f3925c2f82')
  expect(value.currentStateDigest).toBe('487d8f7eae91d3ec058a5f7f42be21428a2f6a318c3dd459b0cf2ed06985143d')
  expect(value.savedStateDigest).toBe('2e717382e952fa0f175f07d5f7055d6d3f37c66eb4bf86a783dd169ae21d2ddc')
  expect(Buffer.byteLength(value.currentSaveJson, 'utf8')).toBe(1095023)
  expect(Buffer.byteLength(value.savedSaveJson, 'utf8')).toBe(1094789)
  expect(sha(value.currentSaveJson)).toBe(value.currentStateDigest)
  expect(sha(value.savedSaveJson)).toBe(value.savedStateDigest)
  const currentParsed = JSON.parse(value.currentSaveJson) as { saveVersion: number; state: { market: { tick: number } } }
  const savedParsed = JSON.parse(value.savedSaveJson) as { saveVersion: number; state: { market: { tick: number } } }
  expect(currentParsed.saveVersion).toBe(40); expect(currentParsed.state.market.tick).toBe(111)
  expect(savedParsed.saveVersion).toBe(40); expect(savedParsed.state.market.tick).toBe(110)
  return { raw, value }
}

type Period = { movements: Record<string, number> }
type Business = { account: { periods: Period[] } }
/** The exact 40->41 migration shape asserted independently by p14r3-save-v41.test.ts:
 * `termination: 0` added to every rival period's movements, nothing else. */
function withTerminationZero<T extends { hollywood?: { businesses?: Business[] } | null }>(state: T): T {
  const clone = JSON.parse(JSON.stringify(state)) as T
  for (const business of clone.hollywood?.businesses ?? []) {
    for (const period of business.account.periods) (period.movements as Record<string, number>).termination = 0
  }
  return clone
}

describe('P14 1308-C: the outgoing projection55 runtime checkpoint migrates to current56, and each Save40 slot migrates to Save41 independently', () => {
  it('loadBridgeRuntimeCheckpoint migrates the prior-schema checkpoint, resets runtime authority, and migrates both save slots to V41 with only the new key added', () => {
    const old = priorCheckpoint()
    const preimage = old.raw
    const factory = vi.fn(() => '1308-prior55')

    // The schema/projection literals the migration target must already carry.
    expect(PROTOCOL_VERSION).toBe(4)
    expect(PROJECTION_VERSION).toBe(56)
    expect(BRIDGE_SCHEMA.$id).toBe('urn:project-studio:bridge:protocol-4:projection-56')
    expect([...SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS].filter(([id]) => id === OLD_SCHEMA)).toEqual([[OLD_SCHEMA, 'projection-v55']])
    expect(SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS.has(SCHEMA_ID)).toBe(false)

    const loaded = loadBridgeRuntimeCheckpoint(old.raw, undefined, factory)
    expect(loaded.migratedFromProtocolVersion).toBe(4)
    expect(factory).toHaveBeenCalledTimes(1)
    const current = loaded.hydrated.checkpoint
    expect(current).toMatchObject({ schemaId: SCHEMA_ID, sessionId: '1308-prior55', stateRevision: 0, journal: [], journalDigest: sha('[]') })
    expect(current.sessionId).not.toBe(old.value.sessionId) // fresh session id

    for (const slot of ['currentSaveJson', 'savedSaveJson'] as const) {
      const nextRaw = current[slot]
      expect(nextRaw, `${slot} must be present on the migrated checkpoint`).toBeTruthy()
      const previous = validateSaveV40(JSON.parse(old.value[slot]))
      const now = validateSaveV41(JSON.parse(nextRaw!))
      expect(now.saveVersion).toBe(41)
      // new.state equals old.state with termination:0 added to every rival finance period's
      // movements, and nothing else — the same fact p14r3-save-v41.test.ts asserts directly
      // on the raw fixtures, independently re-derived here through the runtime-checkpoint path.
      expect(now.state).toEqual(withTerminationZero(previous.state as never))
      // slot bytes equal exportSave(migrateToLive(previous)) — the checkpoint's own migration
      // must route through the SAME migrateToLive chain the save-file path uses, not a second,
      // divergent conversion.
      expect(nextRaw).toBe(exportSave(migrateToLive(previous) as never))
    }
    expect(current.currentSaveJson).not.toBe(current.savedSaveJson) // week 111 != week 110

    // Re-encoding the migrated checkpoint loads WITHOUT migration — the migration is a
    // one-time, prior-schema-only event, never repeated on an already-current checkpoint.
    const currentRaw = encodeBridgeRuntimeCheckpoint(current)
    const again = vi.fn(() => { throw new Error('current56 must not migrate again') })
    const reloaded = loadBridgeRuntimeCheckpoint(currentRaw, undefined, again)
    expect(reloaded.migratedFromProtocolVersion).toBeNull()
    expect(again).not.toHaveBeenCalled()
    expect(encodeBridgeRuntimeCheckpoint(reloaded.hydrated.checkpoint)).toBe(currentRaw)

    // The original prior-schema bytes are never mutated by any of the above.
    expect(old.raw).toBe(preimage)
  })
})
