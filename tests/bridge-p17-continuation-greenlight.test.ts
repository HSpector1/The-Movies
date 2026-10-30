// Sprint 11 Bridge slice B: greenlight with a continuation through the real Bridge quote/commit pair (projection 66).
// RED at 2b1a5b4b by assertion: the closed quote parser there has no `continuation` member on the casting draft, so the
// first `{ ok: true }` assertion of each case fails. Every expected value is the core's own (continuationQuote over
// continuationWorldOf, resolveTitles, the franchise root); the route is the real industry-managed studio with two Ready
// screenplays, the first greenlit by the core as the locked parent (P16 mints its title at that greenlight).
import { beforeAll, describe, expect, it } from 'vitest'
import { applyActions } from '../src/core/actions.js'
import { continuationQuote } from '../src/core/continuation.js'
import { continuationWorldOf } from '../src/core/continuationGreenlight.js'
import { resolveTitles, storyPropertyId } from '../src/core/rights.js'
import { tick } from '../src/core/tick.js'
import { TUNING } from '../src/core/tuning.js'
import type { GameState } from '../src/core/types.js'
import { castingProjection } from '../bridge/casting.ts'
import { BRIDGE_SCHEMA, PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import { BridgeSession } from '../bridge/session.ts'
import type { BridgeCastingDraftPayload, BridgeContinuationRequest } from '../bridge/schema/bridge-schema.ts'
import { parseWireValue } from '../bridge/schema/runtime.ts'
import { commissionFor, freePackage } from './_m4Fixtures.js'
import { industryManagedStudio } from './helpers/p16-fixtures.js'

type Root = { properties: { storyPropertyId: string; installments: { childProductionId: string; type: string; parentProductionId: string | null }[] }[] }
const rootOf = (s: GameState): Root | undefined => (s as GameState & { franchises?: Root }).franchises

/** Two Ready screenplays after one week; the first is greenlit by the core and stays locked as the parent. */
function continuationWorld(seed: string) {
  let state = industryManagedStudio(seed)
  for (const index of [0, 1]) state = applyActions(state, [{ kind: 'commissionScript', project: commissionFor(state, index, index) }])
  state = tick(state)
  const ready: string[] = []
  for (const project of state.scriptDevelopment.projects) {
    if (project.status !== 'review') continue
    state = applyActions(state, [{ kind: 'acceptScript', projectId: project.id }])
    ready.push(project.id)
  }
  if (ready.length !== 2) throw new Error(`premise: seed ${seed} must leave two screenplays in review after one week (got ${ready.length})`)
  state = applyActions(state, [{ kind: 'greenlightScriptProject', production: freePackage(state, ready[0]!) }])
  const parent = state.studio.activeProductions[state.studio.activeProductions.length - 1]!
  return { state, parentId: parent.id, parentPropertyId: storyPropertyId(parent.conceptId), projectId: ready[1]! }
}

/** The bridge-casting.test.ts draft rule: every id from the LIVE candidate pools, three distinct available actors. */
function greenlightDraftFor(state: GameState, projectId: string): BridgeCastingDraftPayload {
  const view = castingProjection(state).board!.projects.find((p) => p.projectId === projectId)!
  const available = (pool: readonly { talentId: string; available: boolean }[]) => pool.find((candidate) => candidate.available)!.talentId
  const actors = view.leadCandidates.filter((candidate) => candidate.available)
  if (actors.length < 3) throw new Error(`premise: project ${projectId} has fewer than three available acting candidates`)
  return {
    kind: 'greenlightPackage', projectId, slateLead: null, slateAntagonist: null, slateSupport: null,
    directorId: available(view.directorCandidates), castLead: actors[0]!.talentId, castAntagonist: actors[1]!.talentId,
    castSupport: actors[2]!.talentId, craftLeadId: available(view.craftCandidates),
    budgetNegative: view.negativeOptions[0]!.amount, budgetMarketing: view.marketingOptions[0]!.amount, signTalentId: null, signTermWeeks: null,
  }
}

function quote(session: BridgeSession, commandId: string, draft: unknown) {
  const parsed = validateQuote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId,
    expectedStateRevision: session.stateRevision, type: 'quoteCasting', draft })
  expect(parsed, 'the closed quote parser admits the continuation member').toMatchObject({ ok: true })
  if (!parsed.ok || parsed.quote.type !== 'quoteCasting') throw new Error('unreachable after the assertion above')
  return session.quote(parsed.quote)
}
const commit = (session: BridgeSession, commandId: string, intentId: string) => session.command({ protocolVersion: PROTOCOL_VERSION,
  schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision, type: 'submitIntent', payload: { intentId } })

describe('P17 greenlight with a continuation on the Bridge (projection 66)', () => {
  let world: ReturnType<typeof continuationWorld>
  beforeAll(() => { world = continuationWorld('bridge-p17-continuation-greenlight') })

  it('quotes the lawful continuation choice, the parent right it relies on and the core read before committing anything', () => {
    const session = new BridgeSession(world.state, 'p17-continuation-quote')
    const draft = greenlightDraftFor(session.gameState, world.projectId)
    const request: BridgeContinuationRequest = { type: 'directSequel', predecessorProductionId: world.parentId }
    const before = session.gameState
    const quoted = quote(session, 'continuation-quote', { ...draft, continuation: request })
    expect(session.gameState).toBe(before)
    expect(quoted).toMatchObject({ accepted: true })
    if (!quoted.accepted || quoted.quote.kind !== 'greenlightPicture') throw new Error('unreachable after the assertion above')
    expect(parseWireValue(BRIDGE_SCHEMA.$defs.StudioBridgeQuoteResponse, quoted)).toEqual(quoted)
    expect(quoted.quote.startsNow).toBe(true)
    expect(quoted.quote.queues).toBe(false)
    expect(quoted.quote.featuredGuests).toBeNull()
    const player = world.state.hollywood!.playerStudioId
    const writerId = world.state.scriptDevelopment.projects.find((p) => p.id === world.projectId)!.writerId
    const core = continuationQuote(continuationWorldOf(world.state), { studioId: player, productionId: 'p17-continuation-expected', request,
      proposed: { writerId, directorId: draft.directorId!, cast: { lead: draft.castLead!, antagonist: draft.castAntagonist!, support: draft.castSupport! } } })
    expect(core.ok).toBe(true)
    if (!core.ok) throw new Error(core.reason)
    expect(quoted.quote.continuation).toEqual({
      storyPropertyId: world.parentPropertyId, type: 'directSequel', use: 'sequel', predecessorProductionId: world.parentId,
      branchId: core.branchId, branchKind: 'main', subPropertyId: null, link: true,
      rights: { via: 'title', holderStudioId: player, licenceId: null, grantorStudioId: null, licenceEndWeekExclusive: null,
        coverWeek: world.state.market.tick + TUNING.PRODUCTION_TICKS },
      recognition: core.recognition, momentum: core.momentum, fatigue: core.fatigue, comparison01: core.comparison01,
      continuityCredit: core.continuityCredit, inheritedAwareness01: core.inheritedAwareness01, band: core.band,
    })
    expect(core.storyPropertyId).toBe(world.parentPropertyId)
  })

  it('refuses an unlawful continuation by the core\'s own name, rejects an unknown request key and a continuation off a greenlight package', () => {
    const session = new BridgeSession(world.state, 'p17-continuation-refusal')
    const draft = greenlightDraftFor(session.gameState, world.projectId)
    const refused = quote(session, 'remake-of-locked', { ...draft, continuation: { type: 'remake', predecessorProductionId: world.parentId } })
    expect(refused).toMatchObject({ accepted: false, reasonCode: 'ENGINE_REJECTED' })
    if (refused.accepted) throw new Error('unreachable after the assertion above')
    expect(refused.message).toContain(`continuation refused: a remake cites exactly one RELEASED film; ${world.parentId} is not released`)
    const offPackage = quote(session, 'screen-test-continuation', { ...draft, kind: 'screenTest', continuation: { type: 'directSequel', predecessorProductionId: world.parentId } })
    expect(offPackage).toMatchObject({ accepted: false, reasonCode: 'ENGINE_REJECTED', message: 'A continuation or a featured guest rides only a greenlight package.' })
    const unknownKey = validateQuote({ protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId: 'unknown-key',
      expectedStateRevision: session.stateRevision, type: 'quoteCasting',
      draft: { ...draft, continuation: { type: 'directSequel', predecessorProductionId: world.parentId, ownerStudioId: 'forged' } } })
    expect(unknownKey).toMatchObject({ ok: false })
    expect(session.gameState).toBe(world.state)
  })

  it('commits through the greenlight action: the picture links to the parent property and mints no title of its own', () => {
    const session = new BridgeSession(world.state, 'p17-continuation-commit')
    const draft = greenlightDraftFor(session.gameState, world.projectId)
    const quoted = quote(session, 'continuation-commit-quote', { ...draft, continuation: { type: 'directSequel', predecessorProductionId: world.parentId } })
    expect(quoted).toMatchObject({ accepted: true })
    if (!quoted.accepted) throw new Error('unreachable after the assertion above')
    const committed = commit(session, 'continuation-commit', quoted.quote.intentId)
    expect(committed).toMatchObject({ accepted: true })
    const after = session.gameState
    const child = after.studio.activeProductions[after.studio.activeProductions.length - 1]!
    expect(child.id).not.toBe(world.parentId)
    const childConceptProperty = storyPropertyId(child.conceptId)
    expect(childConceptProperty).not.toBe(world.parentPropertyId)
    expect(rootOf(after)?.properties.map((p) => ({ property: p.storyPropertyId, edges: p.installments.map((e) => [e.childProductionId, e.type, e.parentProductionId]) })))
      .toEqual([{ property: world.parentPropertyId, edges: [[world.parentId, 'origin', null], [child.id, 'directSequel', world.parentId]] }])
    expect(resolveTitles(after).properties.find((p) => p.propertyId === world.parentPropertyId)!.workLinks).toContain(child.id)
    expect(after.rights.properties.some((p) => p.propertyId === childConceptProperty)).toBe(false)
    expect(after.rights.titleEvents.filter((e) => e.subject.right === 'R1' && e.subject.propertyId === childConceptProperty)).toEqual([])
    expect(resolveTitles(after).properties.filter((p) => p.workLinks.includes(child.id)).map((p) => p.propertyId)).toEqual([world.parentPropertyId])
  })
})
