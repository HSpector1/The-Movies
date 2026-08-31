/**
 * P04A.2 §19E — THE WRITER-CREDIT LAW AT THE BRIDGE QUOTE/COMMAND SEAM.
 *
 * The bridge half of the §19 A–H regression suite. Its sibling,
 * `tests/p04a2-writer-credit-law.test.ts`, carries §19 A–D and F–H plus the core half
 * of §19E, and both share `_p04a2WriterCreditFixtures.ts`.
 *
 * WHY THIS IS A SEPARATE FILE. `tsconfig.json` excludes `tests/bridge*.test.ts` and
 * `tsconfig.bridge.json` includes exactly those, because bridge sources import with
 * explicit `.ts` extensions (`allowImportingTsExtensions`). A non-`bridge*` test that
 * imports `../bridge/**` therefore fails `npm run typecheck` (TS5097) even though it
 * runs fine under vitest. The §19E clause requires the real bridge quote/commit
 * helpers, so it lives here, where CI's `typecheck:bridge` and `test:bridge` cover it.
 *
 * Proof obligations (§19E):
 *   • the greenlight quote publishes NO writer-busy blocker for the CREDITED writer;
 *   • ONE opaque intent is minted, and the /command is the sole commit;
 *   • the exact player-chosen ids become the production, and the writer credit is exact;
 *   • a stale revision still refuses;
 *   • no partial mutation on refusal (state, save bytes, revision, journal all identical).
 */
import { describe, expect, it } from 'vitest'

import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { castingProjection } from '../bridge/casting.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { applyActions, exportSave, makeSave } from '../src/core/index.ts'
import type { GameState } from '../src/core/index.ts'
import {
  buildScenario,
  projectById,
  SEED,
} from './_p04a2WriterCreditFixtures.js'

function greenlightDraftFor(state: GameState, projectId: string): BridgeCastingDraftPayload {
  const view = castingProjection(state).board!.projects.find((p) => p.projectId === projectId)!
  const available = (pool: readonly { talentId: string; available: boolean }[]) =>
    pool.find((candidate) => candidate.available)!.talentId
  const distinctActors = view.leadCandidates.filter((candidate) => candidate.available)
  if (distinctActors.length < 3) {
    throw new Error(`p04a2 fixture: project "${projectId}" has fewer than three available actors`)
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
    signTalentId: null,
    signTermWeeks: null,
  }
}

function quoteEnvelope(
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

describe('P04A.2 §19E — the greenlight quote/command seam publishes no writer-busy blocker', () => {
  /** The §19A world with managed Casting switched on, so the bridge board exists. */
  function bridgeWorld(seed: string) {
    const s = buildScenario(seed)
    const state = applyActions(s.deadlock, [{ kind: 'activateCastingSessions' }])
    expect(projectById(state, s.projectBId).status).toBe('drafting')
    return { s, state }
  }

  it('quotes clean, mints ONE opaque intent, and the command is the sole commit', () => {
    const { s, state } = bridgeWorld(SEED)
    const session = new BridgeSession(state, SEED)

    const board = castingProjection(session.gameState).board!
    const view = board.projects.find((p) => p.projectId === s.projectAId)!
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19E bridge packageReadiness (A ready, writer drafting B):',
      JSON.stringify(view.packageReadiness),
    )
    expect(view.packageReadiness.knownGatesClear).toBe(true)
    expect(view.packageReadiness.blockers.map((b) => b.code)).not.toContain('writer-assignment')
    expect(view.packageReadiness.blockers.map((b) => b.code)).not.toContain('writer-contract')
    expect(view.writerId).toBe(s.writerId)

    const draft = greenlightDraftFor(session.gameState, s.projectAId)
    const revisionBefore = session.stateRevision
    const digestBefore = session.snapshot().stateDigest

    const quoted = session.quote(quoteEnvelope(session, 'p04a2-e-quote-1', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.kind).toBe('greenlightPicture')
    // A quote is not a commit.
    expect(quoted.stateRevision).toBe(revisionBefore)
    expect(quoted.stateDigest).toBe(digestBefore)
    expect(session.gameState.studio.activeProductions).toHaveLength(0)
    // ONE opaque intent id — not a re-serialization of the draft.
    expect(quoted.quote.intentId).toMatch(/^intent-v/)
    expect(quoted.quote.intentId).not.toContain(s.writerId)
    expect(quoted.quote.intentId).not.toContain(s.projectAId)

    const committed = session.command(
      commandEnvelope(session, 'p04a2-e-commit-1', quoted.quote.intentId),
    )
    expect(committed.accepted).toBe(true)
    expect(session.stateRevision).toBe(revisionBefore + 1)

    // The command is the SOLE commit: the exact ids stay exact.
    const production = session.gameState.studio.activeProductions[0]!
    expect(production.directorId).toBe(draft.directorId)
    expect(production.cast).toEqual({
      lead: draft.castLead,
      antagonist: draft.castAntagonist,
      support: draft.castSupport,
    })
    expect(production.craftIds).toEqual([draft.craftLeadId])
    expect(production.writerId).toBe(s.writerId)
    // …and screenplay B is still being drafted by that same writer.
    expect(projectById(session.gameState, s.projectBId).status).toBe('drafting')

    // Replaying the consumed intent is refused.
    const replay = session.command(
      commandEnvelope(session, 'p04a2-e-commit-2', quoted.quote.intentId),
    )
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.studio.activeProductions).toHaveLength(1)
  })

  it('a stale revision still refuses, and a refusal mutates NOTHING', () => {
    const { s, state } = bridgeWorld(SEED)
    const session = new BridgeSession(state, `${SEED}-stale`)
    const draft = greenlightDraftFor(session.gameState, s.projectAId)

    const revisionBefore = session.stateRevision
    const digestBefore = authoritativeDigest(session.gameState)
    const saveBefore = exportSave(makeSave(session.gameState))
    const journalBefore = session.runtimeJournalSize

    const stale = session.quote({
      ...quoteEnvelope(session, 'p04a2-e-stale', draft),
      expectedStateRevision: session.stateRevision + 7,
    })
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')

    // An ordinary (non-stale) refusal — an illegal budget — is equally inert.
    const refused = session.quote(
      quoteEnvelope(session, 'p04a2-e-badbudget', { ...draft, budgetNegative: -1 }),
    )
    expect(refused.accepted).toBe(false)
    // eslint-disable-next-line no-console
    console.log(
      '[P04A.2 WITNESS] §19E refusals leave no trace:',
      JSON.stringify({
        staleReason: stale.accepted ? null : stale.reasonCode,
        budgetRefused: !refused.accepted,
      }),
    )

    expect(session.stateRevision).toBe(revisionBefore)
    expect(authoritativeDigest(session.gameState)).toBe(digestBefore)
    expect(exportSave(makeSave(session.gameState))).toBe(saveBefore)
    expect(session.runtimeJournalSize).toBe(journalBefore)
    expect(session.gameState.studio.activeProductions).toHaveLength(0)
    expect(projectById(session.gameState, s.projectBId).status).toBe('drafting')
  })
})

