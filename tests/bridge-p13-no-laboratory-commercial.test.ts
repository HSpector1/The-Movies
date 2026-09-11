import { describe, expect, it } from 'vitest'
import { BridgeSession } from '../bridge/session.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { advanceTo, p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'

describe('P13A commercial route without a Laboratory', () => {
  it('keeps wait, purchase and exact stage/Post decisions in the global intent list beside other studio actions', () => {
    let session = new BridgeSession(p13aGeneratedStudio('p13a-no-laboratory-commercial'), 'commercial-no-lab')
    const submit = (label: string, commandId: string) => {
      const snapshot = session.snapshot()
      const intent = snapshot.availableIntents.find(i => i.kind === 'researchAction' && i.label.startsWith(label))
      expect(intent, label).toBeDefined()
      const result = session.command({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID,
        sessionId: snapshot.sessionId, expectedStateRevision: snapshot.stateRevision,
        commandId, type: 'submitIntent', payload: { intentId: intent!.intentId } })
      expect(result.accepted).toBe(true)
      return result
    }
    expect(session.gameState.placement.facilities).toHaveLength(0)
    expect(session.snapshot().availableIntents.some(i => i.kind !== 'researchAction')).toBe(true)
    const cash = session.gameState.studio.cash
    submit('Wait for commercial sound', 'wait-without-lab')
    expect(session.gameState.studio.cash).toBe(cash)
    expect(session.gameState.technology.access[0]!.route).toBe('wait')
    expect(session.gameState.placement.facilities).toHaveLength(0)
    session = new BridgeSession(advanceTo(session.gameState, 416), 'commercial-no-lab-at-release')
    submit('Purchase synchronized-sound access', 'purchase-without-lab')
    expect(session.gameState.technology.access[0]!.route).toBe('purchase')
    expect(session.gameState.placement.facilities).toHaveLength(0)
    const intents = session.snapshot().availableIntents.filter(i => i.kind === 'researchAction' && i.label.startsWith('Install sound:'))
    expect(intents).toHaveLength(2)
    expect(intents[0]!.detail).toContain('Post')
    expect(intents[0]!.detail).toContain('charged now')
    submit(intents[0]!.label, 'adopt-exact-chain-without-lab')
    const adoption = session.gameState.technology.adoptions[0]!
    expect(adoption.route).toBe('purchase')
    expect(session.gameState.placement.facilities.every(p => p.installation !== undefined)).toBe(true)
    expect(session.gameState.operations.facilities.some(f => f.capability === 'laboratory')).toBe(false)
    expect(adoption.stageFacilityId).toBe(session.gameState.operations.facilities.find(f => f.capability === 'soundstage')!.id)
    expect(adoption.postFacilityId).toBe(session.gameState.operations.facilities.find(f => f.capability === 'post')!.id)
  })
})
