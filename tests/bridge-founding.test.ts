import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID, type AvailableIntent } from '../bridge/protocol.ts'
import {
  decodeBridgeRuntimeCheckpoint,
  encodeBridgeRuntimeCheckpoint,
} from '../bridge/runtime-checkpoint.ts'
import { canonicalJson } from '../bridge/schema/canonical.ts'
import { BridgeSession } from '../bridge/session.ts'
import { foundingApplicantRows, offerObligation } from '../ui/src/engine/adapter.ts'

function submit(
  session: BridgeSession,
  option: AvailableIntent,
  commandId: string,
  expectedStateRevision = session.stateRevision,
) {
  return session.command({
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision,
    type: 'submitIntent',
    payload: { intentId: option.intentId },
  })
}

function roleOfFirstOffer(session: BridgeSession): string {
  const option = session.snapshot().availableIntents[0]
  if (option === undefined || option.kind !== 'signFoundingContract') {
    throw new Error('Fresh founding state omitted its contract offer.')
  }
  const row = foundingApplicantRows(session.gameState).find(
    (candidate) => option.label.startsWith(`Offer ${candidate.name} `),
  )
  if (row === undefined) throw new Error(`Could not identify founding option ${option.label}.`)
  return row.role
}

describe('Bridge production founding v1', () => {
  it('opens a fresh production runtime on draft-ordered, profession-gated 104-week Actor offers', () => {
    const session = BridgeSession.createRuntime()
    const snapshot = session.snapshot()
    const actorRows = foundingApplicantRows(session.gameState, 'actor')

    expect(session.stateRevision).toBe(0)
    expect(session.gameState.market.tick).toBe(0)
    expect(session.gameState.founding).not.toBeNull()
    expect(session.gameState.contracts).toEqual([])
    expect(snapshot.availableIntents.map((option) => option.kind)).toEqual(
      actorRows.map(() => 'signFoundingContract'),
    )
    expect(snapshot.availableIntents.map((option) => option.label)).toEqual(
      actorRows.map((row) => `Offer ${row.name} a 2-year actor contract`),
    )
    expect(snapshot.availableIntents.every((option) =>
      option.projectId === null &&
      option.castingSessionId === null &&
      option.productionId === null
    )).toBe(true)
    expect(snapshot.availableIntents[0]?.detail).toMatch(
      /Perceived OVR .* potential .* work ethic .* guaranteed salary .* total obligation .* projected founding runway/,
    )
    expect(snapshot.availableIntents.some((option) =>
      option.kind === 'commissionScreenplay' || option.kind === 'startConstruction'
    )).toBe(false)
  })

  it('emits the exact founding action at Core coverage and keeps the reserve Actor optional', () => {
    // LL-CP9 REGRESSION GATE. Core founding closes at 3 Actors / 1 Director /
    // 1 Writer / 1 Production-Craft Lead — the ENGINE's law. The bridge must
    // emit foundStudio the moment coverage is met, with ZERO reserve Actors
    // signed: a proof-harness reserve is never allowed to become player law.
    const coreRoles = ['actor', 'actor', 'actor', 'director', 'writer', 'craft']

    // ── Path A: the player founds at the Core minimum ──
    const playerSession = BridgeSession.createRuntime()
    for (const [index, expectedRole] of coreRoles.entries()) {
      expect(roleOfFirstOffer(playerSession)).toBe(expectedRole)
      const before = playerSession.snapshot()
      expect(new Set(before.availableIntents.map((option) => option.kind))).toEqual(
        new Set(['signFoundingContract']),
      )
      expect(before.founding?.readyToFound).toBe(false)
      expect(before.founding?.waveReserve).toBe(false)
      const accepted = submit(playerSession, before.availableIntents[0]!, `core-sign-${String(index + 1)}`)
      expect(accepted).toMatchObject({ accepted: true, stateRevision: index + 1, gameWeek: 0 })
      expect(playerSession.gameState.contracts).toHaveLength(index + 1)
      expect(playerSession.gameState.contracts.every((contract) => contract.termWeeks === 104)).toBe(true)
      expect(playerSession.gameState.founding).not.toBeNull()
    }

    const atCoverage = playerSession.snapshot()
    expect(atCoverage.founding?.readyToFound).toBe(true)
    expect(atCoverage.founding?.progress.every((entry) => entry.met)).toBe(true)
    const foundOption = atCoverage.availableIntents.find((option) => option.kind === 'foundStudio')
    expect(foundOption).toMatchObject({
      kind: 'foundStudio',
      label: 'START A STUDIO',
      projectId: null,
      castingSessionId: null,
      productionId: null,
    })
    expect(foundOption?.detail).toMatch(
      /Actors 3\/3; Directors 1\/1; Writers 1\/1; Production\/Craft Leads 1\/1/,
    )
    expect(foundOption?.detail).not.toContain('reserve Actor')
    // The reserve wave rides beside founding as an explicitly optional offer.
    expect(atCoverage.founding?.waveReserve).toBe(true)
    expect(atCoverage.founding?.arrivals.length).toBeGreaterThan(0)
    expect(atCoverage.founding?.arrivals.every((arrival) => arrival.reserve)).toBe(true)
    const reserveOffers = atCoverage.availableIntents.filter(
      (option) => option.kind === 'signFoundingContract',
    )
    expect(reserveOffers.length).toBeGreaterThan(0)
    expect(reserveOffers[0]?.detail).toMatch(/^Optional reserve Actor/)

    const foundedAtCore = submit(playerSession, foundOption!, 'found-at-core-minimum')
    expect(foundedAtCore).toMatchObject({ accepted: true, stateRevision: 7, gameWeek: 0 })
    expect(playerSession.gameState.founding).toBeNull()
    expect(playerSession.gameState.contracts).toHaveLength(6)
    expect(playerSession.gameState.operations.mode).toBe('managed')
    expect(playerSession.gameState.scriptDevelopment.mode).toBe('managed')
    expect(playerSession.gameState.castingSessions.mode).toBe('managed')
    if (foundedAtCore.accepted) expect(foundedAtCore.founding).toBeNull()
    expect(playerSession.snapshot().availableIntents.map((option) => option.kind)).toEqual(
      expect.arrayContaining(['commissionScreenplay', 'startConstruction']),
    )

    // ── Path B: automation deliberately signs its reserve Actor, then founds ──
    const reserveSession = BridgeSession.createRuntime()
    for (const [index] of coreRoles.entries()) {
      const before = reserveSession.snapshot()
      const signing = before.availableIntents.find(
        (option) => option.kind === 'signFoundingContract',
      )
      expect(submit(reserveSession, signing!, `reserve-core-${String(index + 1)}`)).toMatchObject({
        accepted: true,
      })
    }
    const withReserveOffers = reserveSession.snapshot()
    const reserveOffer = withReserveOffers.availableIntents.find(
      (option) => option.kind === 'signFoundingContract',
    )
    expect(reserveOffer).toBeDefined()
    expect(submit(reserveSession, reserveOffer!, 'reserve-sign-7')).toMatchObject({
      accepted: true,
      stateRevision: 7,
    })
    expect(reserveSession.gameState.contracts).toHaveLength(7)

    const ready = reserveSession.snapshot()
    // With the reserve on the books the optional wave closes: founding stands alone.
    expect(ready.availableIntents.map((option) => option.kind)).toEqual(['foundStudio'])
    expect(ready.availableIntents[0]?.detail).toMatch(
      /Actors 4\/3; Directors 1\/1; Writers 1\/1; Production\/Craft Leads 1\/1/,
    )
    expect(ready.availableIntents[0]?.detail).toContain('reserve Actor')
    const founded = submit(reserveSession, ready.availableIntents[0]!, 'founding-start-studio')
    expect(founded).toMatchObject({ accepted: true, stateRevision: 8, gameWeek: 0 })
    expect(reserveSession.gameState.founding).toBeNull()
    expect(reserveSession.gameState.contracts).toHaveLength(7)
    expect(reserveSession.snapshot().availableIntents.map((option) => option.kind)).toEqual(
      expect.arrayContaining(['commissionScreenplay', 'startConstruction']),
    )
  })

  it('publishes a founding-arrival view whose joins, prices, and previews are the authority\'s own', () => {
    const session = BridgeSession.createRuntime()
    const envelope = session.snapshot()
    const founding = envelope.founding
    expect(founding).not.toBeNull()
    expect(founding?.waveRole).toBe('actor')
    expect(founding?.waveRoleLabel).toBe('actor')
    expect(founding?.waveReserve).toBe(false)
    expect(founding?.readyToFound).toBe(false)
    expect(founding?.progress.map((entry) => entry.role)).toEqual(
      ['actor', 'director', 'writer', 'craft'],
    )
    // Exact join, by construction: the arrival list and the signing intents are
    // the same resolution pass in the same order.
    const signingIds = envelope.availableIntents
      .filter((option) => option.kind === 'signFoundingContract')
      .map((option) => option.intentId)
    expect(founding?.arrivals.map((arrival) => arrival.intentId)).toEqual(signingIds)
    // Every displayed fact equals the engine's own read models — Unity never prices.
    const rows = foundingApplicantRows(session.gameState, 'actor')
    for (const arrival of founding?.arrivals ?? []) {
      const row = rows.find((candidate) => candidate.id === arrival.talentId)
      expect(row).toBeDefined()
      const offer = row!.card.employment.offerOptions.find((option) => option.termWeeks === 104)!
      const obligation = offerObligation(offer)
      expect(arrival.name).toBe(row!.name)
      expect(arrival.role).toBe('actor')
      expect(arrival.ovr).toBe(row!.ovr)
      expect(arrival.ovrTier).toBe(row!.ovrTier)
      expect(arrival.potentialHigh).toBe(row!.potentialHigh)
      expect(arrival.topStrengths).toEqual(row!.topStrengths)
      expect(arrival.primaryConcern).toBe(row!.primaryConcern)
      expect(arrival.annualSalary).toBe(offer.annualSalary)
      expect(arrival.signingBonus).toBe(offer.signingBonus)
      expect(arrival.weeklySalary).toBe(obligation.weeklySalary)
      expect(arrival.guaranteedComp).toBe(obligation.guaranteedComp)
      expect(arrival.totalObligation).toBe(obligation.total)
      expect(arrival.termWeeks).toBe(104)
    }
    // The treasury pulse is present from the first frame; a founding draft
    // charges no burn (the engine's own founding-guarded rule).
    expect(envelope.treasury.cash).toBe(session.gameState.studio.cash)
    expect(envelope.treasury.weeklyBurn).toBe(0)

    // Dispatching an arrival's intentId is exactly the established opaque path,
    // and the accepted projection repaints the wave without the signed person.
    const first = founding!.arrivals[0]!
    const option = envelope.availableIntents.find((entry) => entry.intentId === first.intentId)!
    const accepted = submit(session, option, 'arrival-sign-1')
    expect(accepted).toMatchObject({ accepted: true, stateRevision: 1 })
    expect(session.gameState.contracts[0]?.talentId).toBe(first.talentId)
    if (accepted.accepted) {
      expect(accepted.founding?.arrivals.some(
        (arrival) => arrival.talentId === first.talentId,
      )).toBe(false)
      expect(accepted.founding?.progress.find((entry) => entry.role === 'actor')?.count).toBe(1)
    }
  })

  it('replays an accepted founding offer exactly and rejects stale or consumed choices without mutation', () => {
    const session = BridgeSession.createRuntime()
    const opening = session.snapshot()
    const acceptedEnvelope = {
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'founding-replay',
      expectedStateRevision: 0,
      type: 'submitIntent' as const,
      payload: { intentId: opening.availableIntents[0]!.intentId },
    }
    const accepted = session.command(acceptedEnvelope)
    expect(accepted).toMatchObject({ accepted: true, stateRevision: 1 })

    expect(canonicalJson(session.command(acceptedEnvelope))).toBe(canonicalJson(accepted))
    expect(session.stateRevision).toBe(1)
    expect(session.gameState.contracts).toHaveLength(1)

    const stale = submit(session, opening.availableIntents[1]!, 'founding-stale', 0)
    expect(stale).toMatchObject({ accepted: false, reasonCode: 'STALE_REVISION', stateRevision: 1 })
    const consumed = submit(session, opening.availableIntents[0]!, 'founding-consumed')
    expect(consumed).toMatchObject({
      accepted: false,
      reasonCode: 'INTENT_NOT_AVAILABLE',
      stateRevision: 1,
    })
    expect(session.gameState.contracts).toHaveLength(1)
  })

  it('restores an in-progress founding draft with exact authority and replay continuity', () => {
    const session = BridgeSession.createRuntime()
    const firstOption = session.snapshot().availableIntents[0]!
    const first = submit(session, firstOption, 'founding-before-restart')
    expect(first.accepted).toBe(true)

    const encoded = encodeBridgeRuntimeCheckpoint(session.exportRuntimeCheckpoint())
    const recovered = BridgeSession.fromRuntimeCheckpoint(decodeBridgeRuntimeCheckpoint(encoded))
    expect(recovered.sessionId).toBe(session.sessionId)
    expect(recovered.stateRevision).toBe(1)
    expect(recovered.gameState.founding).toEqual(session.gameState.founding)
    expect(recovered.gameState.contracts).toEqual(session.gameState.contracts)
    expect(recovered.snapshot().availableIntents).toEqual(session.snapshot().availableIntents)

    const replay = recovered.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: recovered.sessionId,
      commandId: 'founding-before-restart',
      expectedStateRevision: 0,
      type: 'submitIntent',
      payload: { intentId: firstOption.intentId },
    })
    expect(canonicalJson(replay)).toBe(canonicalJson(first))
    expect(recovered.stateRevision).toBe(1)
    expect(recovered.gameState.contracts).toHaveLength(1)
  })
})
