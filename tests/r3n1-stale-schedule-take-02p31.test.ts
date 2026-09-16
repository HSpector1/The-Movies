// ── R3-N4-DATA-03 — the r3n1-stale-schedule-take-02 command-owner refusal
// proof, run on the NEW projection-31 sibling fixture ─────────────────────
//
// `tests/r3n1-stale-schedule-take-02.test.ts` proves the two SERVER REFUSAL
// shapes (STALE_REVISION on a stale expectedStateRevision; INTENT_NOT_AVAILABLE
// on an old, already-superseded intentId) against `fixtures/r3n1-dense-02`,
// a fixture minted under the OUTGOING projection-30 contract. This file proves
// the identical two shapes against `fixtures/r3n1-dense-02p31`
// (see `evidence/Playability-Interaction-01/entry/generate-r3n1-dense-03.ts` /
// `-report.md` for its full provenance: loaded from the immutable
// r3n1-dense-02 checkpoint through the bridge's own load/migrate path, with
// NO actions and NO ticks applied, then re-encoded at the CURRENT running
// schema — so its declared schemaId already equals the running SCHEMA_ID and
// this fixture needs no further migration to load).
//
// Same underlying campaign fact both fixtures carry: production `prod-0015`
// offers a live `resolveProductionBlocker` (board command `scheduleShootingTake`)
// decision, and screenplay project `script-0001` offers a live, unrelated
// `acceptScreenplay` decision — never resolved by the generator. Staleness is
// induced the same way: settling the UNRELATED screenplay intent stales the
// production intent's captured id/revision, because intent ids are bound to
// the whole authoritative stateDigest (bridge/session.ts:
// `intent-v4-[0-9a-f]{64}`).
//
// Both cases below are SERVER REFUSAL by the bridge (BridgeSession /
// session.command). Client-side re-gating is proved natively by the
// coordinator, not here — same scope note as the DATA-01/DATA-02 precedents.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  validateCommand,
  type AvailableIntent,
} from '../bridge/protocol.ts'
import { loadCampaignLibrary } from '../bridge/runtime/campaign-library.ts'
import { DEFAULT_BRIDGE_RUNTIME_CHECKPOINT_LIMITS as limits } from '../bridge/runtime-checkpoint.ts'
import { BridgeSession, authoritativeDigest, type CommandResponse } from '../bridge/session.ts'
import type { GameState } from '../src/core/index.ts'

// ── local helpers — replicated verbatim from tests/bridge.test.ts's own
// (unexported) `command`/`submit`, per the DATA-01/DATA-02 precedent's own
// convention, reused unmodified here. ───────────────────────────────────────
function command(
  session: BridgeSession,
  intentId: string,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId,
    commandId,
    expectedStateRevision: revision,
    type: 'submitIntent' as const,
    payload: { intentId },
  }
}

function submit(
  session: BridgeSession,
  intent: AvailableIntent,
  commandId: string,
  revision = session.stateRevision,
  sessionId = session.sessionId,
): CommandResponse {
  const parsed = validateCommand(command(session, intent.intentId, commandId, revision, sessionId))
  if (!parsed.ok) throw new Error(parsed.message)
  return session.command(parsed.command)
}

/**
 * Loads the immutable r3n1-dense-02p31 fixture fresh, each call — never
 * mutated. Unlike the projection-30 r3n1-dense-02 fixture, this fixture was
 * minted AT the current running schema (R3-N4-DATA-03), so loading it here
 * requires NO migration: `loaded.changed` must be false. Any load-time change
 * would mean either the fixture was mutated after minting or the running
 * schema moved on since this fixture was generated — both are hard failures,
 * not a case to tolerate.
 */
function loadFixtureState(): GameState {
  const path = resolve(
    'evidence/Playability-Interaction-01/fixtures/r3n1-dense-02p31/generated-r3n1-dense-02p31.checkpoint.json',
  )
  const raw = readFileSync(path, 'utf8')
  const loaded = loadCampaignLibrary(raw, limits)
  if (loaded.changed) {
    throw new Error(
      'r3n1-dense-02p31 fixture: unexpected migration/change on load — this fixture was minted at the running schema',
    )
  }
  return loaded.session.gameState
}

describe('R3-N4-DATA-03 — stale production-operation route on r3n1-dense-02p31: SERVER REFUSAL by the bridge', () => {
  it('SERVER REFUSAL — a stale expectedStateRevision on the resolveProductionBlocker intent is rejected (STALE_REVISION / state-stale), with no mutation', () => {
    const state = loadFixtureState()
    const session = new BridgeSession(state, 'r3n1-stale-take-02p31-session-01')
    const snapshot = session.snapshot()
    const intentA = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === 'prod-0015',
    )
    const intentB = snapshot.availableIntents.find(
      (intent) => intent.kind === 'acceptScreenplay' && intent.projectId === 'script-0001',
    )
    expect(intentA).toBeDefined()
    expect(intentB).toBeDefined()
    const staleRevision = session.stateRevision

    // Advance the authoritative state with a DIFFERENT, unrelated legal command
    // (accepting an unrelated screenplay draft), so intentA's captured revision
    // is now genuinely stale.
    const advanced = submit(session, intentB!, 'r3n1-advance-unrelated-screenplay-p31')
    expect(advanced.accepted).toBe(true)
    if (!advanced.accepted) throw new Error(advanced.message)
    const digestAfterAdvance = authoritativeDigest(session.gameState)
    expect(digestAfterAdvance).not.toBe(snapshot.stateDigest)

    const stale = submit(session, intentA!, 'r3n1-stale-attempt-p31', staleRevision)
    expect(stale).toMatchObject({
      accepted: false,
      reasonCode: 'STALE_REVISION',
      rejection: { category: 'state-stale' },
    })
    // No mutation: the rejection reports (and leaves) the digest AFTER the
    // legitimate advance, unchanged by the rejected stale attempt.
    expect(stale.stateDigest).toBe(digestAfterAdvance)
    expect(authoritativeDigest(session.gameState)).toBe(digestAfterAdvance)
  })

  it('SERVER REFUSAL — the OLD intentId at the CURRENT revision is INTENT_NOT_AVAILABLE once the state has moved on; the fresh resolveProductionBlocker intent for the same production is then accepted exactly once', () => {
    const state = loadFixtureState()
    const session = new BridgeSession(state, 'r3n1-stale-take-02p31-session-02')
    const snapshot = session.snapshot()
    const intentA = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === 'prod-0015',
    )
    const intentB = snapshot.availableIntents.find(
      (intent) => intent.kind === 'acceptScreenplay' && intent.projectId === 'script-0001',
    )
    expect(intentA).toBeDefined()
    expect(intentB).toBeDefined()

    // Settle the unrelated screenplay decision first. Every intentId is
    // digest-bound (bridge/session.ts: `intent-v4-[0-9a-f]{64}`), so intentA's
    // OLD id is no longer any currently offered intent's id, even though
    // prod-0015's own decision is still standing and simply re-mints a FRESH
    // id (same fact tests/r3n1-stale-schedule-take.test.ts,
    // tests/r3n1-stale-schedule-take-02.test.ts and
    // tests/bridge-p05a-w2-intents.test.ts already prove for the same intent
    // family).
    const advanced = submit(session, intentB!, 'r3n1-settle-unrelated-screenplay-p31')
    expect(advanced.accepted).toBe(true)
    if (!advanced.accepted) throw new Error(advanced.message)

    const oldIntent = submit(session, intentA!, 'r3n1-old-intent-current-revision-p31')
    expect(oldIntent).toMatchObject({
      accepted: false,
      reasonCode: 'INTENT_NOT_AVAILABLE',
      rejection: { category: 'intent-unavailable' },
    })
    expect(oldIntent.stateDigest).toBe(authoritativeDigest(session.gameState))

    // Still offered: prod-0015's scheduleShootingTake decision is still
    // standing, under a FRESH digest-bound intentId — and that fresh intent is
    // accepted exactly once.
    const freshA = session.snapshot().availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === 'prod-0015',
    )
    expect(freshA).toBeDefined()
    expect(freshA!.intentId).not.toBe(intentA!.intentId)

    const revisionForFresh = session.stateRevision
    const acceptedOnce = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once-p31', revisionForFresh)
    expect(acceptedOnce.accepted).toBe(true)
    // A repeat of the SAME (commandId, expectedStateRevision, intentId) is
    // idempotent replay, not a second application (command-conflict path
    // proven by tests/bridge.test.ts's own duplicate-command case), so the
    // fresh intent still applied exactly once.
    const repeat = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once-p31', revisionForFresh)
    expect(repeat).toEqual(acceptedOnce)
  })
})
