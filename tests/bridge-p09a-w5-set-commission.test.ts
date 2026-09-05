// P09A W5 — the Set commission quote family over the bridge (design §21/§24 beat 8;
// P09-REQ-025/041): the bare lot's first film needs a mounted Set on the soundstage
// the player built, and the client reaches the accepted C2a-M2 Set law only through
// this family.
//   R1  A legal preview is an accepted quote that reads the engine's own price,
//       weeks, completion week, stage name and refusal authority verbatim.
//   R2  A refused preview is an ACCEPTED `ok:false` answer carrying the engine's
//       own reason + remedy, and its id is not a registered intent.
//   R3  Commit builds the Set exactly once at the quoted price; a replay is refused;
//       the same stage now refuses a second Set (`stageAlreadyDressed`).
//   R4  The authored Set catalogue rides the lot projection (managed mode only).
//   R5  An endowed studio can quote a Set on a founding stage the same way.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import type { BridgeSetCommissionDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BridgeSession } from '../bridge/session.ts'
import {
  applyActions,
  beginFounding,
  commissionSetRefusal,
  contractOffer,
  FOUNDING_MINIMUMS,
  generateWorld,
  setCommissionRefusalCopy,
  tick,
} from '../src/core/index.js'
import type { CreativeRole, FoundingRegime, GameState } from '../src/core/index.js'
import { SET_BLUEPRINTS } from '../src/core/tuning.js'

function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, 104) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: 104 }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}
const founded = (seed: string, regime: FoundingRegime = 'endowed') => foundMinimum(generateWorld(seed, { regime }))

/** A bare lot with the office, scenery shop and a soundstage all operational (no Set yet). */
function plantWithStage(seed: string): GameState {
  let state = applyActions(founded(seed, 'bare-lot'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
  for (let week = 0; week < 14; week++) state = tick(state)
  state = applyActions(state, [
    { kind: 'placeFacility', placement: { blueprintId: 'scenery-shop', origin: { gx: 16, gy: 14 } } },
    { kind: 'placeFacility', placement: { blueprintId: 'stage-standard', origin: { gx: 26, gy: 4 } } },
  ])
  for (let week = 0; week < 16; week++) state = tick(state)
  return state
}

function envelope(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision }
}
function quoteSet(session: BridgeSession, commandId: string, draft: BridgeSetCommissionDraftPayload) {
  const response = session.quote({ ...envelope(session, commandId), type: 'quoteSetCommission' as const, draft })
  if (!response.accepted) throw new Error(`${commandId}: ${response.message}`)
  return response
}
function submit(session: BridgeSession, commandId: string, intentId: string) {
  return session.command({ ...envelope(session, commandId), type: 'submitIntent' as const, payload: { intentId } })
}

describe('P09A W5 — Set commission over the bridge', () => {
  it('R1: a legal preview reads the engine verbatim and is the one registered commit', () => {
    const state = plantWithStage('p09-w5-legal')
    const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')!
    expect(commissionSetRefusal(state, { blueprintId: 'set-house-generic', stageFacilityId: stage.id })).toBeNull()
    const session = new BridgeSession(state, 'p09-w5-legal')
    const quoted = quoteSet(session, 'q1', { blueprintId: 'set-house-generic', stageFacilityId: stage.id })
    const house = SET_BLUEPRINTS.find((b) => b.id === 'set-house-generic')!
    expect(quoted.quote.kind).toBe('commissionSet')
    expect(quoted.quote.ok).toBe(true)
    expect(quoted.quote.startsNow).toBe(true)
    expect(quoted.quote.queues).toBe(false)
    expect(quoted.quote.cost).toBe(house.capex)
    expect(quoted.quote.buildWeeks).toBe(house.buildWeeks)
    expect(quoted.quote.completesOnWeek).toBe(state.market.tick + house.buildWeeks)
    expect(quoted.quote.quality).toBe(house.quality)
    expect(quoted.quote.setType).toBe(house.setType)
    expect(quoted.quote.stageFacilityId).toBe(stage.id)
    expect(quoted.quote.stageName).toBe(stage.name)
    expect(quoted.quote.refusal).toBeNull()
    expect(quoted.quote.refusalReason).toBeNull()
    expect(quoted.quote.cashBefore).toBe(Math.round(state.studio.cash))
    expect(quoted.quote.cashAfter).toBe(Math.round(state.studio.cash) - house.capex)
    expect(quoted.quote.commitLabel).toContain(house.name.toUpperCase())
    expect(quoted.quote.consequence).toContain(stage.name)
    // A preview mutates nothing.
    expect(session.stateRevision).toBe(0)
    expect(session.gameState.sets).toHaveLength(0)
  })

  it('R2: a refused preview is an accepted ok:false answer with the engine reason + remedy; its id is not a commit', () => {
    const state = plantWithStage('p09-w5-refused')
    const office = state.operations.facilities.find((f) => f.capability === 'development-casting')!
    const session = new BridgeSession(state, 'p09-w5-refused')
    // Not a soundstage.
    const wrongStage = quoteSet(session, 'q-wrong', { blueprintId: 'set-house-generic', stageFacilityId: office.id })
    expect(wrongStage.quote.ok).toBe(false)
    expect(wrongStage.quote.refusal).toBe('unknownStage')
    const copy = setCommissionRefusalCopy({ code: 'unknownStage', stageFacilityId: office.id }, { blueprintName: 'House Set' })
    expect(wrongStage.quote.refusalReason).toBe(copy.reason)
    expect(wrongStage.quote.refusalRemedy).toBe(copy.remedy)
    expect(wrongStage.quote.startsNow).toBe(false)
    const refused = submit(session, 'c-wrong', wrongStage.quote.intentId)
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) expect(refused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.sets).toHaveLength(0)
    // Unknown blueprint is a DRAFT refusal (about the request, not the ground).
    const unknown = session.quote({ ...envelope(session, 'q-unknown'), type: 'quoteSetCommission' as const, draft: { blueprintId: 'set-not-real', stageFacilityId: office.id } })
    expect(unknown.accepted).toBe(false)
    if (!unknown.accepted) expect(unknown.reasonCode).toBe('ENGINE_REJECTED')
    // No scenery capacity: a bare lot with a stage but no shop.
    let noShop = applyActions(founded('p09-w5-noshop', 'bare-lot'), [{ kind: 'placeFacility', placement: { blueprintId: 'development-casting-office', origin: { gx: 12, gy: 14 } } }])
    for (let week = 0; week < 14; week++) noShop = tick(noShop)
    noShop = applyActions(noShop, [{ kind: 'placeFacility', placement: { blueprintId: 'stage-standard', origin: { gx: 26, gy: 4 } } }])
    for (let week = 0; week < 16; week++) noShop = tick(noShop)
    const stage = noShop.operations.facilities.find((f) => f.capability === 'soundstage')!
    const shopless = new BridgeSession(noShop, 'p09-w5-noshop')
    const noCapacity = quoteSet(shopless, 'q-noshop', { blueprintId: 'set-house-generic', stageFacilityId: stage.id })
    expect(noCapacity.quote.ok).toBe(false)
    expect(noCapacity.quote.refusal).toBe('noSceneryCapacity')
    expect(noCapacity.quote.refusalRemedy?.length).toBeGreaterThan(0)
  })

  it('R3: commit builds the Set once at the quoted price; replay refused; the stage is then dressed', () => {
    const state = plantWithStage('p09-w5-commit')
    const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')!
    const session = new BridgeSession(state, 'p09-w5-commit')
    const quoted = quoteSet(session, 'q1', { blueprintId: 'set-house-generic', stageFacilityId: stage.id })
    const cashBefore = session.gameState.studio.cash
    const committed = submit(session, 'c1', quoted.quote.intentId)
    expect(committed.accepted, (committed as { message?: string }).message).toBe(true)
    expect(session.stateRevision).toBe(1)
    expect(session.gameState.sets).toHaveLength(1)
    expect(session.gameState.sets[0]!.blueprintId).toBe('set-house-generic')
    expect(session.gameState.sets[0]!.mountedOn).toBe(stage.id)
    expect(session.gameState.sets[0]!.status).toBe('under-construction')
    expect(cashBefore - session.gameState.studio.cash).toBe(quoted.quote.cost)
    const replay = submit(session, 'c2', quoted.quote.intentId)
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.sets).toHaveLength(1)
    const again = quoteSet(session, 'q2', { blueprintId: 'set-back-alley', stageFacilityId: stage.id })
    expect(again.quote.ok).toBe(false)
    expect(again.quote.refusal).toBe('stageAlreadyDressed')
    expect(again.quote.refusalReason).toContain(session.gameState.sets[0]!.name)
    // The projection now shows the set on the wire.
    const lot = session.snapshot().snapshot.lot
    expect(lot.sets?.map((s) => s.mountedOnFacilityId)).toEqual([stage.id])
  })

  it('R4: the authored Set catalogue rides the lot projection with engine prices and affordability', () => {
    const session = new BridgeSession(plantWithStage('p09-w5-catalog'), 'p09-w5-catalog')
    const catalog = session.snapshot().snapshot.lot.setCatalog
    expect(catalog).toBeDefined()
    expect(catalog!.map((row) => row.blueprintId)).toEqual(SET_BLUEPRINTS.map((b) => b.id))
    for (const row of catalog!) {
      const blueprint = SET_BLUEPRINTS.find((b) => b.id === row.blueprintId)!
      expect(row.cost).toBe(blueprint.capex)
      expect(row.buildWeeks).toBe(blueprint.buildWeeks)
      expect(row.quality).toBe(blueprint.quality)
      expect(row.setType).toBe(blueprint.setType)
      expect(row.name).toBe(blueprint.name)
      expect(row.affordable).toBe(session.gameState.studio.cash >= blueprint.capex)
    }
    // The protocol validator accepts the request shape.
    const good = validateQuote({ ...envelope(session, 'proto'), type: 'quoteSetCommission', draft: { blueprintId: 'set-house-generic', stageFacilityId: 'facility-x' } })
    expect(good.ok).toBe(true)
    const bad = validateQuote({ ...envelope(session, 'proto-bad'), type: 'quoteSetCommission', draft: { blueprintId: 'set-house-generic' } })
    expect(bad.ok).toBe(false)
  })

  it('R5: an endowed studio quotes a Set on a founding stage through the same family', () => {
    const state = founded('p09-w5-endowed')
    const dressed = new Set(state.sets.map((s) => s.mountedOn))
    const stage = state.operations.facilities.find((f) => f.capability === 'soundstage' && dressed.has(f.id))!
    const session = new BridgeSession(state, 'p09-w5-endowed')
    const quoted = quoteSet(session, 'q1', { blueprintId: 'set-graveyard', stageFacilityId: stage.id })
    expect(quoted.quote.ok).toBe(false)
    expect(quoted.quote.refusal).toBe('stageAlreadyDressed')
    expect(quoted.quote.stageName).toBe(stage.name)
  })
})
