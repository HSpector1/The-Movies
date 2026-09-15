// ── R3-N1-DATA-02 — stale production-operation route on a SECOND, independently
// sourced fixture: SERVER REFUSAL ────────────────────────────────────────────
//
// Order OPS-R3-N1-NATIVE-CORRECTION-20260915-01 §4. Loads the immutable
// generated fixture `evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/
// generated-r3n1-dense-02.checkpoint.json` (see
// `evidence/Playability-Interaction-01/entry/generate-r3n1-dense-02.ts` /
// `-report.md` for its full provenance) and proves the exact same two SERVER
// REFUSAL shapes as `tests/r3n1-stale-schedule-take.test.ts`, on the
// production-operation decision this fixture actually carries:
// `resolveProductionBlocker` for production `prod-0015` (board command
// `scheduleShootingTake`) — genuinely offered, never resolved by the generator.
//
// This fixture carries only ONE active production (so only one
// `resolveProductionBlocker` intent exists), unlike
// `tests/r3n1-stale-schedule-take.test.ts`'s two-leader construction. Staleness
// is instead induced by a DIFFERENT, unrelated, real legal intent this exact
// fixture also offers: `acceptScreenplay` on `script-0001` (a screenplay
// project in 'review', unrelated to prod-0015's production board). This is a
// stronger proof of the general rule than a same-family second decision would
// be: intent ids are bound to the WHOLE authoritative stateDigest
// (`bridge/session.ts`, `intent-v4-[0-9a-f]{64}`), so ANY accepted legal
// command — not just another instance of the same decision family — stales
// every other captured intent, including one whose own underlying decision has
// not changed.
//
// Both cases below are SERVER REFUSAL by the bridge (BridgeSession /
// session.command). Client-side re-gating (prevention before a request is even
// sent) is proved natively by the coordinator, not here — same scope note as
// the DATA-01 precedent.

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
// (unexported) `command`/`submit`, per the DATA-01 precedent's own convention,
// reused unmodified here. ──────────────────────────────────────────────────
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

/** Loads the immutable r3n1-dense-02 fixture fresh, each call — never mutated. */
function loadFixtureState(): GameState {
  const path = resolve(
    'evidence/Playability-Interaction-01/fixtures/r3n1-dense-02/generated-r3n1-dense-02.checkpoint.json',
  )
  const raw = readFileSync(path, 'utf8')
  const loaded = loadCampaignLibrary(raw, limits)
  if (loaded.changed) throw new Error('r3n1-dense-02 fixture: unexpected migration/change on load')
  return loaded.session.gameState
}

describe('R3-N1-DATA-02 — stale production-operation route on r3n1-dense-02: SERVER REFUSAL by the bridge', () => {
  it('SERVER REFUSAL — a stale expectedStateRevision on the resolveProductionBlocker intent is rejected (STALE_REVISION / state-stale), with no mutation', () => {
    const state = loadFixtureState()
    const session = new BridgeSession(state, 'r3n1-stale-take-02-session-01')
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
    const advanced = submit(session, intentB!, 'r3n1-advance-unrelated-screenplay')
    expect(advanced.accepted).toBe(true)
    if (!advanced.accepted) throw new Error(advanced.message)
    const digestAfterAdvance = authoritativeDigest(session.gameState)
    expect(digestAfterAdvance).not.toBe(snapshot.stateDigest)

    const stale = submit(session, intentA!, 'r3n1-stale-attempt', staleRevision)
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
    const session = new BridgeSession(state, 'r3n1-stale-take-02-session-02')
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
    // prod-0015's own decision is still standing and simply re-mints a FRESH id
    // (same fact tests/r3n1-stale-schedule-take.test.ts and
    // tests/bridge-p05a-w2-intents.test.ts already prove for the same intent
    // family).
    const advanced = submit(session, intentB!, 'r3n1-settle-unrelated-screenplay')
    expect(advanced.accepted).toBe(true)
    if (!advanced.accepted) throw new Error(advanced.message)

    const oldIntent = submit(session, intentA!, 'r3n1-old-intent-current-revision')
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
    const acceptedOnce = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once', revisionForFresh)
    expect(acceptedOnce.accepted).toBe(true)
    // A repeat of the SAME (commandId, expectedStateRevision, intentId) is
    // idempotent replay, not a second application (command-conflict path proven
    // by tests/bridge.test.ts's own duplicate-command case), so the fresh
    // intent still applied exactly once.
    const repeat = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once', revisionForFresh)
    expect(repeat).toEqual(acceptedOnce)
  })
})
