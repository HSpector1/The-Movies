// ── R3-N1-DATA-01 Item B — stale production-operation route: SERVER REFUSAL ──
//
// Changed commitment route under test: production-operation resolution
// (`resolveProductionBlocker`), whose lawful resolution applies the
// production's current board command (src/core/scriptReadModel.ts
// `productionBoard`) — for a Shooting-phase production with an unassigned
// shooting task this family is exactly `assignShootingDirector` /
// `scheduleShootingTake` (src/core/operations.ts, src/core/actions.ts).
//
// A fixture reaching literal take-scheduling readiness the way
// tests/_m5Fixtures.ts's `studioTheWeekBeforeWrap` intends currently THROWS
// under this engine — reproduced with BOTH its own seed and the seed used by
// tests/_m5PlaytestSave.ts:
//   Error: applyActions: clearSceneryLoadIn rejected — productionId
//   "prod-0002" has no active scenery-load-in blocker
//     at Module.clearSceneryLoadIn (src/core/operations.ts:668)
//     at Module.studioTheWeekBeforeWrap (tests/_m5Fixtures.ts:236)
// (test-author scope is tests/fixtures only; this file does not repair that
// fixture — see the R3-N1-DATA-01 report for the reproduction as filed.)
//
// Per R3-N1-DATA-01's fallback clause, this test instead uses the NEAREST
// lawfully offered production-operation intent: the exact two-leader
// "unassigned Shooting decision" state already proven live by
// tests/bridge-p05a-w2-intents.test.ts (`twoDecisionsState`, built from
// `contendedStudio` + `advance(state, 4)`), whose offered bridge intent kind
// is `resolveProductionBlocker`.
//
// Both cases below are SERVER REFUSAL by the bridge (BridgeSession /
// session.command). Client-side re-gating (prevention before a request is
// even sent) is proved natively by the coordinator, not here.

import { describe, expect, it } from 'vitest'

import {
  PROTOCOL_VERSION,
  SCHEMA_ID,
  validateCommand,
  type AvailableIntent,
} from '../bridge/protocol.ts'
import { BridgeSession, authoritativeDigest, type CommandResponse } from '../bridge/session.ts'
import type { GameState } from '../src/core/index.ts'
import { contendedStudio } from './_m4Fixtures.ts'
import { advance } from './contracts/_contractFixtures.ts'

// ── local helpers — replicated verbatim from tests/bridge.test.ts's own
// (unexported) `command`/`submit`, per R3-N1-DATA-01's brief. ─────────────
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
 * Both leaders at their unassigned Shooting decision, simultaneously — the
 * exact construction already proven by tests/bridge-p05a-w2-intents.test.ts
 * (`twoDecisionsState`). Reproduced here (that helper is module-local and not
 * exported) rather than routed through tests/_m5Fixtures.ts, which currently
 * throws for this purpose (see file header).
 */
function twoDecisionsState(seed: string): { state: GameState; leaders: string[] } {
  const { state } = contendedStudio(seed)
  const leaders = state.studio.activeProductions.map((production) => production.id)
  const walked = advance(state, 4)
  for (const id of leaders) {
    const workflow = walked.operations.workflows.find((candidate) => candidate.productionId === id)!
    expect(workflow.phase).toBe('shooting')
    expect(workflow.shootingTask?.status).toBe('unassigned')
  }
  return { state: walked, leaders: [...leaders].sort() }
}

describe('R3-N1-DATA-01 — stale production-operation route: SERVER REFUSAL by the bridge', () => {
  it('SERVER REFUSAL — a stale expectedStateRevision on the production-operation intent is rejected (STALE_REVISION / state-stale), with no mutation', () => {
    const { state, leaders } = twoDecisionsState('r3n1-stale-take-01')
    const session = new BridgeSession(state, 'r3n1-stale-take-session-01')
    const snapshot = session.snapshot()
    const intentA = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === leaders[0],
    )
    const intentB = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === leaders[1],
    )
    expect(intentA).toBeDefined()
    expect(intentB).toBeDefined()
    const staleRevision = session.stateRevision

    // Advance the authoritative state with a DIFFERENT production's own legal
    // command, so intentA's captured revision is now genuinely stale.
    const advanced = submit(session, intentB!, 'r3n1-advance-other-production')
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

  it('SERVER REFUSAL — the OLD intentId at the CURRENT revision is INTENT_NOT_AVAILABLE once the state has moved on; the fresh intent for the same production is then accepted exactly once', () => {
    const { state, leaders } = twoDecisionsState('r3n1-stale-take-02')
    const session = new BridgeSession(state, 'r3n1-stale-take-session-02')
    const snapshot = session.snapshot()
    const intentA = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === leaders[0],
    )
    const intentB = snapshot.availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === leaders[1],
    )
    expect(intentA).toBeDefined()
    expect(intentB).toBeDefined()

    // Settle the OTHER production first. Every intentId is digest-bound
    // (bridge/session.ts: `intent-v4-[0-9a-f]{64}`), so intentA's OLD id is no
    // longer any currently offered intent's id, even when — as here —
    // production A's own decision is still standing and simply re-mints a
    // FRESH id (tests/bridge-p05a-w2-intents.test.ts's own final case proves
    // the same fact for this exact family of intents).
    const advanced = submit(session, intentB!, 'r3n1-settle-other-production')
    expect(advanced.accepted).toBe(true)
    if (!advanced.accepted) throw new Error(advanced.message)

    const oldIntent = submit(session, intentA!, 'r3n1-old-intent-current-revision')
    expect(oldIntent).toMatchObject({
      accepted: false,
      reasonCode: 'INTENT_NOT_AVAILABLE',
      rejection: { category: 'intent-unavailable' },
    })
    expect(oldIntent.stateDigest).toBe(authoritativeDigest(session.gameState))

    // Still offered (documented per the brief's alternative branch): production
    // A's decision is still standing, under a FRESH digest-bound intentId —
    // and that fresh intent is accepted exactly once.
    const freshA = session.snapshot().availableIntents.find(
      (intent) => intent.kind === 'resolveProductionBlocker' && intent.productionId === leaders[0],
    )
    expect(freshA).toBeDefined()
    expect(freshA!.intentId).not.toBe(intentA!.intentId)

    const revisionForFresh = session.stateRevision
    const acceptedOnce = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once', revisionForFresh)
    expect(acceptedOnce.accepted).toBe(true)
    // A repeat of the SAME (commandId, expectedStateRevision, intentId) is
    // idempotent replay, not a second application (command-conflict path
    // proven by tests/bridge.test.ts's own duplicate-command case), so the
    // fresh intent still applied exactly once.
    const repeat = submit(session, freshA!, 'r3n1-fresh-intent-accepted-once', revisionForFresh)
    expect(repeat).toEqual(acceptedOnce)
  })
})
