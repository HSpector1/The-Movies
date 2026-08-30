// ── P05A W2 — ALL active exact-ID Production decisions publish (recon §6.2) ──
//
// The bridge's one command path (`availableIntents` → `applyAvailableIntent`)
// now emits one digest-bound `resolveProductionBlocker` intent per active
// production whose board card carries a current command, ascending by exact
// productionId — never only the guided picture's. The guided journey selects
// from the same family, so guidance and availability cannot disagree.

import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import {
  BridgeSession,
  availableIntents,
  selectJourneyIntent,
} from '../bridge/session.ts'
import { applyActions, tick } from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import { studioLotSnapshot } from '../ui/src/engine/adapter.ts'
import { contendedStudio } from './_m4Fixtures.ts'
import { advance } from './contracts/_contractFixtures.ts'

/** Both leaders at their unassigned Shooting decision, simultaneously. */
function twoDecisionsState(seed: string): { state: GameState; leaders: string[] } {
  const { state } = contendedStudio(seed)
  const leaders = state.studio.activeProductions.map((production) => production.id)
  const walked = advance(state, 4)
  for (const id of leaders) {
    const workflow = walked.operations.workflows.find(
      (candidate) => candidate.productionId === id,
    )!
    expect(workflow.phase).toBe('shooting')
    expect(workflow.shootingTask?.status).toBe('unassigned')
  }
  return { state: walked, leaders: [...leaders].sort() }
}

describe('P05A W2 — all-active production intents', () => {
  it('publishes one exact-ID intent per deciding production, ascending', () => {
    const { state, leaders } = twoDecisionsState('w2-intents-both')
    const productionIntents = availableIntents(state).filter(
      (intent) => intent.kind === 'resolveProductionBlocker',
    )
    expect(productionIntents.map((intent) => intent.productionId)).toEqual(leaders)
    for (const intent of productionIntents) {
      expect(intent.label).toMatch(/^Call /)
      expect(intent.intentId).toMatch(/^intent-v4-[0-9a-f]{64}$/)
    }
  })

  it('lets the guided journey select ITS production from the shared family', () => {
    const { state } = twoDecisionsState('w2-intents-journey')
    const journey = studioLotSnapshot(state).firstFilmJourney
    expect(journey?.next?.kind).toBe('resolve-production')
    const selected = selectJourneyIntent(availableIntents(state), journey)
    expect(selected?.kind).toBe('resolveProductionBlocker')
    expect(selected?.productionId).toBe(journey?.productionId)
  })

  it('applies a NON-guided production intent and leaves the other decision standing', () => {
    const { state, leaders } = twoDecisionsState('w2-intents-isolation')
    const session = new BridgeSession(state)
    const envelope = session.snapshot()
    const journeyId = envelope.snapshot.journeyNotices.firstFilmJourney?.productionId
    const nonGuided = envelope.availableIntents.find(
      (intent) =>
        intent.kind === 'resolveProductionBlocker' && intent.productionId !== journeyId,
    )
    expect(nonGuided).toBeDefined()
    const response = session.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'w2-nonguided-call',
      expectedStateRevision: envelope.stateRevision,
      type: 'submitIntent',
      payload: { intentId: nonGuided!.intentId },
    })
    expect(response.accepted).toBe(true)
    if (!response.accepted) throw new Error('unreachable')
    // The commanded production settled to its next decision; the OTHER
    // production's decision is byte-untouched and still published.
    const successors = response.availableIntents.filter(
      (intent) => intent.kind === 'resolveProductionBlocker',
    )
    const other = leaders.find((id) => id !== nonGuided!.productionId)!
    expect(successors.some((intent) => intent.productionId === other)).toBe(true)
    expect(successors.some((intent) => intent.productionId === nonGuided!.productionId)).toBe(
      true,
    )
  })

  it('drops a production’s intent when its decision settles, and keeps digests exact', () => {
    const { state, leaders } = twoDecisionsState('w2-intents-settle')
    // Resolve BOTH call decisions and both schedules outside the bridge.
    let walked = state
    for (const id of leaders) {
      const production = walked.studio.activeProductions.find((p) => p.id === id)!
      walked = applyActions(walked, [
        { kind: 'assignShootingDirector', productionId: id, directorId: production.directorId },
        { kind: 'scheduleShootingTake', productionId: id },
      ])
    }
    expect(
      availableIntents(walked).filter((intent) => intent.kind === 'resolveProductionBlocker'),
    ).toEqual([])
    const advanced = tick(walked)
    // Next decisions (if any) re-mint fresh digest-bound ids.
    for (const intent of availableIntents(advanced)) {
      expect(intent.intentId).toMatch(/^intent-v4-[0-9a-f]{64}$/)
    }
  })
})
