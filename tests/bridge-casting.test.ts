// ── P04A: the Casting projection and the casting quote seam ───────────────────
//
// Proof obligations under test:
//   1. screenTest quote -> mint -> /command commit parity: the exact player
//      slate becomes the session, no fee/hold/busy-assignment, one reservation,
//      dueWeek = week+1.
//   2. greenlight quote -> commit parity: the exact participants/budget become
//      the production; a refusal changes NOTHING (deep-equal GameState/
//      exportSave/revision/journal before vs after).
//   3. Queue paths: capacity-only ⇒ quote reports queues:true; committing
//      creates a queue entry with zero commitment (nothing created yet).
//   4. Stale revision refuses before any engine work.
//   5. An accepted unrelated command invalidates a live quote, but the exact
//      same draft is quotable fresh again against the new state.
//   6. Malformed/unknown ids and non-menu budgets refuse in plain language,
//      without mutation.
//   7. Repeated identical quotes are pure and semantically identical.
//   8. The wire JSON of projection+quote never carries a hidden-truth key.
//   9. A queueIntentExpired notice carries the exact projectId and survives
//      save/load.

import { describe, expect, it } from 'vitest'

import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { castingProjection } from '../bridge/casting.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import {
  applyActions,
  busyTalentIds,
  exportSave,
  makeSave,
  stableStringify,
  tick,
  type GameState,
} from '../src/core/index.ts'
import {
  availableConceptId,
  availableWriterId,
  commissionPayload,
  contractedByRole,
  managedStudio,
  withCash,
} from './contracts/_contractFixtures.ts'
import { contendedGreenlightStudio, contendedStudio, freePackage } from './_m4Fixtures.ts'

const HIDDEN_KEY_NAMES = [
  'rngState',
  'seed',
  'actual',
  'actualStrength',
  'persona',
  'temperament',
  'teamDirection',
  'ceiling',
  'ceilings',
  'weeklyBurn',
  'runwayWeeks',
  'runwayInfinite',
  'runway',
]

function allObjectKeys(value: unknown, keys = new Set<string>()): Set<string> {
  if (Array.isArray(value)) {
    for (const entry of value) allObjectKeys(entry, keys)
    return keys
  }
  if (typeof value === 'object' && value !== null) {
    for (const key of Reflect.ownKeys(value)) {
      if (typeof key === 'string') keys.add(key)
      allObjectKeys((value as Record<PropertyKey, unknown>)[key], keys)
    }
  }
  return keys
}

function castingQuoteEnvelope(
  session: BridgeSession,
  commandId: string,
  draft: BridgeCastingDraftPayload,
) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
    type: 'quoteCasting' as const,
    draft,
  }
}

function commandEnvelope(session: BridgeSession, commandId: string, intentId: string) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
    type: 'submitIntent' as const,
    payload: { intentId },
  }
}

function requireAccepted<T extends { accepted: boolean; message?: string }>(response: T): T {
  if (!response.accepted) {
    throw new Error(`expected acceptance, got: ${String((response as { message?: string }).message)}`)
  }
  return response
}

/** One Ready screenplay, one open Development & Casting slot, full founding roster free. */
function freshReadyProject(seed: string): { state: GameState; projectId: string } {
  let state = withCash(managedStudio(seed), 50_000_000)
  const conceptId = availableConceptId(state)
  const writerId = availableWriterId(state)
  state = applyActions(state, [
    { kind: 'commissionScript', project: commissionPayload(state, conceptId, writerId) },
  ])
  const projectId = state.scriptDevelopment.projects[0]!.id
  state = tick(state)
  state = applyActions(state, [{ kind: 'acceptScript', projectId }])
  return { state, projectId }
}

/** The same Ready screenplay, plus a completed and acknowledged camera test — all three tested actors free again. */
function readyProjectWithCompletedCasting(seed: string): { state: GameState; projectId: string } {
  const { state: readyState, projectId } = freshReadyProject(seed)
  const actors = contractedByRole(readyState, 'actor')
  let state = applyActions(readyState, [
    {
      kind: 'startCastingSession',
      session: {
        projectId,
        slate: {
          lead: [actors[0]!.id, actors[1]!.id],
          antagonist: [actors[0]!.id, actors[2]!.id],
          support: [actors[1]!.id, actors[2]!.id],
        },
      },
    },
  ])
  state = tick(state)
  const session = state.castingSessions.sessions.find((candidate) => candidate.projectId === projectId)!
  expect(session.status).toBe('review')
  state = applyActions(state, [{ kind: 'acknowledgeCastingSession', sessionId: session.id }])
  return { state, projectId }
}

/**
 * Draws every id straight from the LIVE candidate pools (never from the raw
 * founding roster) so this fixture can never collide with the screenplay's own
 * locked writer — a multi-hyphenate founding member who happens to write THIS
 * project is correctly excluded from every pool for it (castingPackageReadModel's
 * own documented law), and a fixture that ignored the pools could pick exactly
 * that person and get an honest engine refusal instead of a clean greenlight.
 */
function greenlightDraftFor(state: GameState, projectId: string): BridgeCastingDraftPayload {
  const view = castingProjection(state).board!.projects.find((p) => p.projectId === projectId)!
  const available = (pool: readonly { talentId: string; available: boolean }[]) =>
    pool.find((candidate) => candidate.available)!.talentId
  // lead/antagonist/support pools share the SAME eligible-actor set (only per-slot
  // fit/evidence differ), so three DISTINCT people must be drawn positionally
  // from one pool rather than independently from each — picking "the first
  // available" per pool could otherwise choose the same actor twice.
  const distinctActors = view.leadCandidates.filter((candidate) => candidate.available)
  if (distinctActors.length < 3) {
    throw new Error(`test fixture: project "${projectId}" has fewer than three available acting candidates`)
  }
  return {
    kind: 'greenlightPackage',
    projectId,
    slateLead: null,
    slateAntagonist: null,
    slateSupport: null,
    directorId: available(view.directorCandidates),
    castLead: distinctActors[0]!.talentId,
    castAntagonist: distinctActors[1]!.talentId,
    castSupport: distinctActors[2]!.talentId,
    craftLeadId: available(view.craftCandidates),
    budgetNegative: view.negativeOptions[0]!.amount,
    budgetMarketing: view.marketingOptions[0]!.amount,
  }
}

describe('P04A Casting bridge — quote seam and board', () => {
  it('quotes, mints, and commits a screen test with the EXACT player slate — no fee, no hold, one reservation, dueWeek = week+1', () => {
    const { state, projectId } = freshReadyProject('p04a-screentest-happy')
    const session = new BridgeSession(state, 'p04a-screentest-happy')
    const view = castingProjection(session.gameState).board!.projects.find((p) => p.projectId === projectId)!
    const actors = contractedByRole(session.gameState, 'actor')
    const draft: BridgeCastingDraftPayload = {
      kind: 'screenTest',
      projectId,
      slateLead: [actors[0]!.id, actors[1]!.id],
      slateAntagonist: [actors[0]!.id, actors[2]!.id],
      slateSupport: [actors[1]!.id, actors[2]!.id],
      directorId: null,
      castLead: null,
      castAntagonist: null,
      castSupport: null,
      craftLeadId: null,
      budgetNegative: null,
      budgetMarketing: null,
    }
    expect(view.leadCandidates.map((c) => c.talentId)).toContain(actors[0]!.id)

    const digestBefore = session.snapshot().stateDigest
    const revisionBefore = session.stateRevision
    const weekBefore = session.gameState.market.tick
    const cashBefore = session.gameState.studio.cash

    const quoted = session.quote(castingQuoteEnvelope(session, 'screentest-quote-1', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    // A quote mutates nothing.
    expect(quoted.stateRevision).toBe(revisionBefore)
    expect(quoted.stateDigest).toBe(digestBefore)
    expect(session.snapshot().stateDigest).toBe(digestBefore)
    expect(quoted.quote.kind).toBe('startAuditions')
    expect(quoted.quote.commitLabel).toBe('Start camera tests')
    expect(quoted.quote.startsNow).toBe(true)
    expect(quoted.quote.queues).toBe(false)
    expect(quoted.quote.uniquePeople).toBe(3)
    expect(quoted.quote.weekLine).toMatch(new RegExp(String(weekBefore + 1)))
    expect(quoted.quote.noFeeLine).toMatch(/no casting fee/i)
    expect(quoted.quote.noHoldLine).toBeTruthy()

    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'screentest-commit-1', quoted.quote.intentId)),
    )
    expect(committed.stateRevision).toBe(revisionBefore + 1)

    const sessions = session.gameState.castingSessions.sessions
    expect(sessions).toHaveLength(1)
    const created = sessions[0]!
    expect(created.projectId).toBe(projectId)
    expect(created.slate).toEqual({
      lead: draft.slateLead,
      antagonist: draft.slateAntagonist,
      support: draft.slateSupport,
    })
    expect(created.status).toBe('auditioning')
    expect(created.dueWeek).toBe(weekBefore + 1)
    expect(created.reservation).not.toBeNull()

    // No fee: cash is untouched by a screen test.
    expect(session.gameState.studio.cash).toBe(cashBefore)
    // No hold/busy/assignment: the three tested actors remain unengaged.
    const busy = busyTalentIds(session.gameState)
    expect(busy.has(actors[0]!.id)).toBe(false)
    expect(busy.has(actors[1]!.id)).toBe(false)
    expect(busy.has(actors[2]!.id)).toBe(false)

    // Replaying the same intentId is refused — the quote was consumed.
    const replay = session.command(commandEnvelope(session, 'screentest-commit-2', quoted.quote.intentId))
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')

    // FIX 1: the projection publishes the authoritative active slate — the
    // EXACT six player-chosen talentIds, grouped by role, identity + display
    // name only.
    const nameFor = (talentId: string) =>
      session.gameState.talent.find((candidate) => candidate.id === talentId)!.name
    const expectedActiveSlate = {
      lead: draft.slateLead!.map((talentId) => ({ talentId, name: nameFor(talentId) })),
      antagonist: draft.slateAntagonist!.map((talentId) => ({ talentId, name: nameFor(talentId) })),
      support: draft.slateSupport!.map((talentId) => ({ talentId, name: nameFor(talentId) })),
    }
    const projectAfterCommit = castingProjection(session.gameState).board!.projects.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(projectAfterCommit.activeSlate).toEqual(expectedActiveSlate)

    // ...and it survives save/load.
    const saved = requireAccepted(
      session.save({
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        sessionId: session.sessionId,
        commandId: 'screentest-save-1',
        expectedStateRevision: session.stateRevision,
      }),
    )
    const loaded = requireAccepted(
      session.load({
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        sessionId: session.sessionId,
        commandId: 'screentest-load-1',
        expectedStateRevision: session.stateRevision,
      }),
    )
    expect(saved.stateDigest).toBe(loaded.stateDigest)
    const projectAfterLoad = castingProjection(session.gameState).board!.projects.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(projectAfterLoad.activeSlate).toEqual(expectedActiveSlate)
  })

  it('quotes, mints, and commits a greenlight with the EXACT participants and budget; a later refusal changes NOTHING', () => {
    const { state, projectId } = readyProjectWithCompletedCasting('p04a-greenlight-happy')
    const session = new BridgeSession(state, 'p04a-greenlight-happy')
    const draft = greenlightDraftFor(session.gameState, projectId)
    const cashBefore = session.gameState.studio.cash

    const quoted = session.quote(castingQuoteEnvelope(session, 'greenlight-quote-1', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.kind).toBe('greenlightPicture')
    expect(quoted.quote.commitLabel).toBe('Greenlight picture')
    expect(quoted.quote.startsNow).toBe(true)
    expect(quoted.quote.queues).toBe(false)
    expect(quoted.quote.negative).toBe(draft.budgetNegative)
    expect(quoted.quote.marketing).toBe(draft.budgetMarketing)
    expect(quoted.quote.cashBefore).toBe(cashBefore)
    expect(quoted.quote.cashAfter).toBe(cashBefore - quoted.quote.totalImmediate!)
    expect(quoted.quote.affordable).toBe(true)
    expect(quoted.quote.strongestAssignmentLine).toBeTruthy()
    expect(quoted.quote.weakestAssignmentLine).toBeTruthy()
    expect(quoted.quote.forecastLine).toBeTruthy()
    expect(quoted.quote.setDemandLine).toBeTruthy()

    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'greenlight-commit-1', quoted.quote.intentId)),
    )
    expect(committed.accepted).toBe(true)
    const productions = session.gameState.studio.activeProductions
    expect(productions).toHaveLength(1)
    const production = productions[0]!
    expect(production.directorId).toBe(draft.directorId)
    expect(production.cast).toEqual({
      lead: draft.castLead,
      antagonist: draft.castAntagonist,
      support: draft.castSupport,
    })
    expect(production.craftIds).toEqual([draft.craftLeadId])
    expect(production.budget).toEqual({ negative: draft.budgetNegative, marketing: draft.budgetMarketing })
    expect(session.gameState.studio.cash).toBe(quoted.quote.cashAfter)

    // A refusal after this changes NOTHING: full state/save/revision/journal identity.
    const revisionBeforeRefusal = session.stateRevision
    const digestBeforeRefusal = authoritativeDigest(session.gameState)
    const saveBeforeRefusal = exportSave(makeSave(session.gameState))
    const journalSizeBefore = session.runtimeJournalSize
    const refused = session.quote(
      castingQuoteEnvelope(session, 'greenlight-refuse-1', { ...draft, budgetNegative: -1 }),
    )
    expect(refused.accepted).toBe(false)
    expect(session.stateRevision).toBe(revisionBeforeRefusal)
    expect(authoritativeDigest(session.gameState)).toBe(digestBeforeRefusal)
    expect(exportSave(makeSave(session.gameState))).toBe(saveBeforeRefusal)
    expect(session.runtimeJournalSize).toBe(journalSizeBefore)
  })

  it('capacity-only screen test and greenlight both quote queues:true and commit with ZERO commitment', () => {
    const { state, readyProjectIds } = contendedStudio('p04a-screentest-queue')
    const projectId = readyProjectIds[0]!
    const session = new BridgeSession(state, 'p04a-screentest-queue')
    const view = castingProjection(session.gameState).board!.projects.find((p) => p.projectId === projectId)!
    expect(view.packageReadiness.willQueue || view.leadCandidates.length >= 2).toBe(true)
    const freeActors = view.leadCandidates.filter((c) => c.available)
    expect(freeActors.length).toBeGreaterThanOrEqual(3)
    const draft: BridgeCastingDraftPayload = {
      kind: 'screenTest',
      projectId,
      slateLead: [freeActors[0]!.talentId, freeActors[1]!.talentId],
      slateAntagonist: [freeActors[0]!.talentId, freeActors[2]!.talentId],
      slateSupport: [freeActors[1]!.talentId, freeActors[2]!.talentId],
      directorId: null,
      castLead: null,
      castAntagonist: null,
      castSupport: null,
      craftLeadId: null,
      budgetNegative: null,
      budgetMarketing: null,
    }
    const quoted = session.quote(castingQuoteEnvelope(session, 'queue-screentest-quote', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.queues).toBe(true)
    expect(quoted.quote.startsNow).toBe(false)
    expect(quoted.quote.queueNote).toBeTruthy()

    const sessionsBefore = session.gameState.castingSessions.sessions.length
    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'queue-screentest-commit', quoted.quote.intentId)),
    )
    expect(committed.accepted).toBe(true)
    expect(session.gameState.castingSessions.sessions.length).toBe(sessionsBefore)
    expect(
      session.gameState.productionQueue.some(
        (entry) => entry.kind === 'startCastingSession' && entry.payload.projectId === projectId,
      ),
    ).toBe(true)

    // FIX 1: even while only QUEUED (no CastingSession created yet), the
    // projection's activeSlate already carries the exact six player-chosen
    // talentIds, grouped by role, from the queued production-queue entry.
    const queuedNameFor = (talentId: string) =>
      session.gameState.talent.find((candidate) => candidate.id === talentId)!.name
    const projectQueued = castingProjection(session.gameState).board!.projects.find(
      (candidate) => candidate.projectId === projectId,
    )!
    expect(projectQueued.sessionStatus).toBe('queued')
    expect(projectQueued.activeSlate).toEqual({
      lead: draft.slateLead!.map((talentId) => ({ talentId, name: queuedNameFor(talentId) })),
      antagonist: draft.slateAntagonist!.map((talentId) => ({ talentId, name: queuedNameFor(talentId) })),
      support: draft.slateSupport!.map((talentId) => ({ talentId, name: queuedNameFor(talentId) })),
    })
  })

  it('capacity-only greenlight quotes queues:true (cashAfter null) and commits with ZERO commitment', () => {
    const fixture = contendedGreenlightStudio('p04a-greenlight-queue')
    const session = new BridgeSession(fixture.state, 'p04a-greenlight-queue')
    const draft = greenlightDraftFor(session.gameState, fixture.targetProjectId)
    const quoted = session.quote(castingQuoteEnvelope(session, 'queue-greenlight-quote', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.queues).toBe(true)
    expect(quoted.quote.startsNow).toBe(false)
    expect(quoted.quote.cashAfter).toBeNull()
    expect(quoted.quote.queueNote).toBeTruthy()

    const productionsBefore = session.gameState.studio.activeProductions.length
    const cashBefore = session.gameState.studio.cash
    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'queue-greenlight-commit', quoted.quote.intentId)),
    )
    expect(committed.accepted).toBe(true)
    expect(session.gameState.studio.activeProductions.length).toBe(productionsBefore)
    expect(session.gameState.studio.cash).toBe(cashBefore)
    expect(
      session.gameState.productionQueue.some(
        (entry) => entry.kind === 'greenlightScriptProject' && entry.scriptProjectId === fixture.targetProjectId,
      ),
    ).toBe(true)
  })

  it('refuses a stale revision before any engine work', () => {
    const { state, projectId } = freshReadyProject('p04a-stale')
    const session = new BridgeSession(state, 'p04a-stale')
    const digestBefore = session.snapshot().stateDigest
    const draft = greenlightDraftFor(session.gameState, projectId)
    const stale = session.quote({
      ...castingQuoteEnvelope(session, 'stale-quote', draft),
      expectedStateRevision: session.stateRevision + 7,
    })
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')
    expect(session.snapshot().stateDigest).toBe(digestBefore)
  })

  it('an accepted unrelated command invalidates a live casting quote; the exact same draft is quotable fresh again', () => {
    const { state, projectId } = freshReadyProject('p04a-invalidate')
    const session = new BridgeSession(state, 'p04a-invalidate')
    const actors = contractedByRole(session.gameState, 'actor')
    const draft: BridgeCastingDraftPayload = {
      kind: 'screenTest',
      projectId,
      slateLead: [actors[0]!.id, actors[1]!.id],
      slateAntagonist: [actors[0]!.id, actors[2]!.id],
      slateSupport: [actors[1]!.id, actors[2]!.id],
      directorId: null,
      castLead: null,
      castAntagonist: null,
      castSupport: null,
      craftLeadId: null,
      budgetNegative: null,
      budgetMarketing: null,
    }
    const quoted = session.quote(castingQuoteEnvelope(session, 'invalidate-quote-1', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return

    // An unrelated commission, committed through its own (already-proven) quote seam.
    const commissionQuote = session.quote({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'unrelated-commission-quote',
      expectedStateRevision: session.stateRevision,
      type: 'quoteCommission' as const,
      draft: {
        source: 'market',
        conceptId: session.gameState.concepts.find(
          (candidate) => !session.gameState.scriptDevelopment.projects.some((p) => p.conceptId === candidate.id),
        )!.id,
        genre: null,
        writerId: contractedByRole(session.gameState, 'writer').find(
          (candidate) => candidate.id !== session.gameState.scriptDevelopment.projects[0]!.writerId,
        )!.id,
        opening: 'slowSetup',
        midpoint: 'revelation',
        ending: 'bittersweet',
        intendedSegments: ['adult'],
        intimacyCenter: 1,
        tonalWeightCenter: 1,
        kineticEnergyCenter: 1,
      },
    })
    expect(commissionQuote.accepted).toBe(true)
    if (!commissionQuote.accepted) return
    requireAccepted(
      session.command(commandEnvelope(session, 'unrelated-commission-commit', commissionQuote.quote.intentId)),
    )

    // The prior casting quote's intentId is dead against the new state.
    const dead = session.command(commandEnvelope(session, 'invalidate-commit-dead', quoted.quote.intentId))
    expect(dead.accepted).toBe(false)
    if (!dead.accepted) expect(dead.reasonCode).toBe('INTENT_NOT_AVAILABLE')

    // The exact same draft facts are quotable fresh against the NEW state.
    const requoted = session.quote(castingQuoteEnvelope(session, 'invalidate-quote-2', draft))
    expect(requoted.accepted).toBe(true)
    if (requoted.accepted) {
      expect(requoted.quote.kind).toBe('startAuditions')
      expect(requoted.quote.intentId).not.toBe(quoted.quote.intentId)
    }
  })

  it('refuses malformed slates, unknown ids, and non-menu budgets in plain language, without mutation', () => {
    const { state, projectId } = freshReadyProject('p04a-malformed')
    const session = new BridgeSession(state, 'p04a-malformed')
    const actors = contractedByRole(session.gameState, 'actor')
    const digestBefore = session.snapshot().stateDigest

    const oneId = session.quote(
      castingQuoteEnvelope(session, 'malformed-1', {
        kind: 'screenTest',
        projectId,
        slateLead: [actors[0]!.id],
        slateAntagonist: [actors[0]!.id, actors[2]!.id],
        slateSupport: [actors[1]!.id, actors[2]!.id],
        directorId: null,
        castLead: null,
        castAntagonist: null,
        castSupport: null,
        craftLeadId: null,
        budgetNegative: null,
        budgetMarketing: null,
      } as unknown as BridgeCastingDraftPayload),
    )
    expect(oneId.accepted).toBe(false)
    if (!oneId.accepted) expect(oneId.message).toMatch(/exactly two/i)

    const unknownId = session.quote(
      castingQuoteEnvelope(session, 'malformed-2', {
        kind: 'screenTest',
        projectId,
        slateLead: ['talent-does-not-exist-00', actors[1]!.id],
        slateAntagonist: [actors[0]!.id, actors[2]!.id],
        slateSupport: [actors[1]!.id, actors[2]!.id],
        directorId: null,
        castLead: null,
        castAntagonist: null,
        castSupport: null,
        craftLeadId: null,
        budgetNegative: null,
        budgetMarketing: null,
      }),
    )
    expect(unknownId.accepted).toBe(false)
    if (!unknownId.accepted) expect(unknownId.message).toMatch(/not a current/i)

    const badBudget = session.quote(
      castingQuoteEnvelope(session, 'malformed-3', {
        ...greenlightDraftFor(session.gameState, projectId),
        budgetNegative: 1,
      }),
    )
    expect(badBudget.accepted).toBe(false)
    if (!badBudget.accepted) expect(badBudget.message).toMatch(/published negative budget/i)

    expect(session.snapshot().stateDigest).toBe(digestBefore)
  })

  it('repeated identical quotes are pure: identical GameState/save/revision/journal, and semantically identical output', () => {
    const { state, projectId } = freshReadyProject('p04a-repeat')
    const session = new BridgeSession(state, 'p04a-repeat')
    const draft = greenlightDraftFor(session.gameState, projectId)

    const before = stableStringify(session.gameState)
    const journalBefore = session.runtimeJournalSize
    const first = session.quote(castingQuoteEnvelope(session, 'repeat-1', draft))
    const second = session.quote(castingQuoteEnvelope(session, 'repeat-2', draft))
    expect(stableStringify(session.gameState)).toBe(before)
    expect(session.runtimeJournalSize).toBe(journalBefore)
    expect(first.accepted).toBe(true)
    expect(second.accepted).toBe(true)
    if (!first.accepted || !second.accepted) return
    expect(second.quote).toEqual(first.quote)
    expect(second.quote.intentId).toBe(first.quote.intentId)
  })

  it('wire JSON of the CASTING projection and quote never carries a hidden-truth key (burn/runway included)', () => {
    const { state, projectId } = readyProjectWithCompletedCasting('p04a-leak')
    const session = new BridgeSession(state, 'p04a-leak')
    // Scoped to the casting projection + the casting quote specifically: the
    // wider snapshot envelope legitimately carries `treasury.weeklyBurn`/
    // `runwayWeeks` (a pre-existing, unrelated published field) — the P04A law
    // under test is that CASTING never grows its own copy of burn/runway/
    // recurring-delta or any other hidden-truth key, not that the whole bridge
    // envelope is burn-free.
    const castingSnapshot = castingProjection(session.gameState)
    const draft = greenlightDraftFor(session.gameState, projectId)
    const quoted = session.quote(castingQuoteEnvelope(session, 'leak-quote', draft))
    expect(quoted.accepted).toBe(true)

    const keys = allObjectKeys({ casting: castingSnapshot, quote: quoted.accepted ? quoted.quote : null })
    for (const hidden of HIDDEN_KEY_NAMES) {
      expect(keys.has(hidden), `hidden key "${hidden}" crossed the wire boundary`).toBe(false)
    }
    const raw = JSON.stringify({ casting: castingSnapshot, quote: quoted.accepted ? quoted.quote : null })
    for (const banned of ['weeklyBurn', 'rngState', 'temperament', 'teamDirection', 'runway']) {
      expect(raw.toLowerCase().includes(banned.toLowerCase()), `banned substring "${banned}" appeared on the wire`).toBe(false)
    }
  })

  it('a queueIntentExpired notice carries the exact projectId and survives save/load', () => {
    const fixture = contendedGreenlightStudio('p04a-expiry')
    const payload = freePackage(fixture.state, fixture.targetProjectId)
    let queued = applyActions(fixture.state, [
      { kind: 'greenlightScriptProject', production: payload },
    ])
    // The director this queued greenlight depends on becomes uncontracted while
    // it waits — no longer legal, and cannot become legal by waiting.
    queued = {
      ...queued,
      contracts: queued.contracts.filter((contract) => contract.talentId !== payload.directorId),
    }
    let expired = queued
    for (let i = 0; i < 3; i++) expired = tick(expired)
    expect(
      expired.productionQueue.some(
        (entry) => entry.kind === 'greenlightScriptProject' && entry.scriptProjectId === fixture.targetProjectId,
      ),
    ).toBe(false)
    expect(
      expired.studioEvents.rows.some(
        (row) => row.kind === 'queueIntentExpired' && row.subjectId === fixture.targetProjectId,
      ),
    ).toBe(true)

    const session = new BridgeSession(expired, 'p04a-expiry-session')
    const board = castingProjection(session.gameState).board!
    const notice = board.expiryNotices.find((entry) => entry.projectId === fixture.targetProjectId)
    expect(notice).toBeDefined()
    if (notice === undefined) return
    expect(notice.reviewActionLabel).toBe('Review package')
    expect(notice.title.length).toBeGreaterThan(0)

    // Survives save/load.
    const saved = requireAccepted(
      session.save({
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        sessionId: session.sessionId,
        commandId: 'expiry-save',
        expectedStateRevision: session.stateRevision,
      }),
    )
    const loaded = requireAccepted(
      session.load({
        protocolVersion: PROTOCOL_VERSION,
        schemaId: SCHEMA_ID,
        sessionId: session.sessionId,
        commandId: 'expiry-load',
        expectedStateRevision: session.stateRevision,
      }),
    )
    expect(saved.stateDigest).toBe(loaded.stateDigest)
    const reloadedBoard = castingProjection(session.gameState).board!
    const reloadedNotice = reloadedBoard.expiryNotices.find(
      (entry) => entry.projectId === fixture.targetProjectId,
    )
    expect(reloadedNotice).toEqual(notice)
  })
})
