// ── P03A: the Development projection and the commission-quote seam ───────────
//
// Four laws under proof:
//   1. The quote seam converts a player's draft selections into ONE opaque
//      digest-bound commit intent, TypeScript-side only, with no mutation at
//      quote time and exactly one mutation at commit.
//   2. A quote is valid for exactly the state that minted it — any accepted
//      command invalidates every outstanding quote.
//   3. The Development board is leak-free: no hidden-truth key ever crosses.
//   4. The rewrite preview equals the realized perceived assessment EXACTLY —
//      the deterministic-projection ruling of Package 03, witnessed end to end.

import { describe, expect, it } from 'vitest'

import { BridgeSession, createBridgeInitialState } from '../bridge/session.ts'
import { developmentProjection, draftToEngine } from '../bridge/development.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgeCommissionDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { rewriteDecisionPreview } from '../src/core/index.ts'
import { PROMISE_CENTERS, PROMISE_WIDTHS, rangeFrom } from '../src/core/grid.ts'

const HIDDEN_KEY_NAMES = [
  'rngState',
  'actual',
  'actualStrength',
  'skills',
  'ceilings',
  'baselineStrength',
  'originalityRaw',
  'officeTierAtMint',
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

function marketDraft(session: BridgeSession): BridgeCommissionDraftPayload {
  const development = developmentProjection(session.gameState)
  const board = development.board
  if (board === null) throw new Error('test fixture: development board is unexpectedly null')
  const concept = board.commission.concepts[0]
  const writer = board.commission.writers.find((candidate) => candidate.available)
  if (concept === undefined || writer === undefined) {
    throw new Error('test fixture: no commissionable concept/writer at the movie-two gate')
  }
  return {
    source: 'market',
    conceptId: concept.id,
    genre: null,
    writerId: writer.id,
    opening: 'slowSetup',
    midpoint: 'revelation',
    ending: 'bittersweet',
    intendedSegments: ['adult', 'prestige'],
    intimacyCenter: 1,
    tonalWeightCenter: 1,
    kineticEnergyCenter: 1,
  }
}

function quoteEnvelope(
  session: BridgeSession,
  commandId: string,
  draft: BridgeCommissionDraftPayload,
) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
    type: 'quoteCommission' as const,
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

describe('P03A Development bridge — quote seam and board', () => {
  it('quotes, mints, and commits a market commission draft through the quote seam', () => {
    const session = new BridgeSession(
      createBridgeInitialState('p03a-quote-market'),
      'p03a-quote-market',
    )
    const draft = marketDraft(session)
    const digestBefore = session.snapshot().stateDigest
    const revisionBefore = session.stateRevision

    const quoted = session.quote(quoteEnvelope(session, 'quote-1', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    // A quote mutates nothing.
    expect(quoted.stateRevision).toBe(revisionBefore)
    expect(quoted.stateDigest).toBe(digestBefore)
    expect(session.snapshot().stateDigest).toBe(digestBefore)
    expect(quoted.quote.kind).toBe('commissionScreenplay')
    expect(quoted.quote.commitLabel).toBe('Commission screenplay')
    expect(quoted.quote.startsNow).toBe(true)
    expect(quoted.quote.queues).toBe(false)
    expect(quoted.quote.draftWeeks).toBe(1)
    expect(quoted.quote.consequence).toMatch(/One week passes/)
    expect(quoted.quote.noFeeLine).toMatch(/No separate screenplay acquisition fee/)

    const projectsBefore = session.gameState.scriptDevelopment.projects.length
    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'commit-1', quoted.quote.intentId)),
    )
    expect(committed.stateRevision).toBe(revisionBefore + 1)
    const projects = session.gameState.scriptDevelopment.projects
    expect(projects.length).toBe(projectsBefore + 1)
    const project = projects[projects.length - 1]!
    expect(project.conceptId).toBe(draft.conceptId)
    expect(project.writerId).toBe(draft.writerId)
    expect(project.status).toBe('drafting')
    expect(project.shape).toEqual({
      opening: 'slowSetup',
      midpoint: 'revelation',
      ending: 'bittersweet',
    })
    // Center index 1 with the pinned width 0.8 — byte-exact to the engine's own
    // range law (the same floats the browser form produces).
    const expectedRange = rangeFrom(PROMISE_CENTERS[1]!, PROMISE_WIDTHS[1]!)
    expect(project.promise.ranges.intimacy).toEqual(expectedRange)
    expect(project.promise.ranges.tonalWeight).toEqual(expectedRange)
    expect(project.promise.ranges.kineticEnergy).toEqual(expectedRange)
    expect(project.promise.intendedSegments).toEqual(['adult', 'prestige'])

    // The commit consumed the quote: replaying the same intentId is refused
    // without mutation.
    const replay = session.command(commandEnvelope(session, 'commit-2', quoted.quote.intentId))
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')
  })

  it('rejects stale and malformed drafts without mutation', () => {
    const session = new BridgeSession(
      createBridgeInitialState('p03a-quote-stale'),
      'p03a-quote-stale',
    )
    const draft = marketDraft(session)
    const digestBefore = session.snapshot().stateDigest

    // Wrong revision fails closed before any engine work.
    const stale = session.quote({
      ...quoteEnvelope(session, 'quote-stale', draft),
      expectedStateRevision: session.stateRevision + 7,
    })
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')

    // An unknown writer is the engine's refusal, spoken as a player sentence.
    const unknownWriter = session.quote(
      quoteEnvelope(session, 'quote-bad-writer', { ...draft, writerId: 't-nobody-00' }),
    )
    expect(unknownWriter.accepted).toBe(false)
    if (!unknownWriter.accepted) {
      expect(unknownWriter.reasonCode).toBe('ENGINE_REJECTED')
      expect(unknownWriter.message).toMatch(/not on the current commission board/)
    }

    // A market draft with no premise named is refused in plain language.
    const noConcept = session.quote(
      quoteEnvelope(session, 'quote-no-concept', { ...draft, conceptId: null }),
    )
    expect(noConcept.accepted).toBe(false)
    if (!noConcept.accepted) expect(noConcept.message).toMatch(/names the premise/)

    // Nothing above touched the state.
    expect(session.snapshot().stateDigest).toBe(digestBefore)

    // A minted quote dies with the state that minted it: any accepted command
    // clears every outstanding quote.
    const quoted = session.quote(quoteEnvelope(session, 'quote-live', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    const advance = session
      .snapshot()
      .availableIntents.find((intent) => intent.kind === 'advanceWeek')
    if (advance !== undefined) {
      requireAccepted(session.command(commandEnvelope(session, 'advance-x', advance.intentId)))
      const dead = session.command(commandEnvelope(session, 'commit-dead', quoted.quote.intentId))
      expect(dead.accepted).toBe(false)
      if (!dead.accepted) expect(dead.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    }
  })

  it('publishes a leak-free Development board and an exact rewrite preview at review', () => {
    const session = new BridgeSession(
      createBridgeInitialState('p03a-review-board'),
      'p03a-review-board',
    )
    const draft = marketDraft(session)
    const quoted = session.quote(quoteEnvelope(session, 'quote-r', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    requireAccepted(session.command(commandEnvelope(session, 'commit-r', quoted.quote.intentId)))

    // The pool draft is one week; one authoritative advance reaches review.
    const advance = session
      .snapshot()
      .availableIntents.find((intent) => intent.kind === 'advanceWeek')
    if (advance === undefined) throw new Error('test fixture: no advanceWeek intent after commit')
    requireAccepted(session.command(commandEnvelope(session, 'advance-r', advance.intentId)))

    const development = developmentProjection(session.gameState)
    const board = development.board
    expect(board).not.toBeNull()
    if (board === null) return

    // Leak boundary: the whole projection carries no hidden-truth key name.
    const keys = allObjectKeys(development)
    for (const hidden of HIDDEN_KEY_NAMES) {
      expect(keys.has(hidden), `hidden key "${hidden}" crossed the boundary`).toBe(false)
    }

    // The review context is the decision surface: identity, basis, brief, cards.
    const review = board.review
    expect(review).not.toBeNull()
    if (review === null) return
    expect(review.reviewState).toBe('first-draft')
    expect(review.assessment).not.toBeNull()
    expect(review.whyThisEstimate.length).toBeGreaterThan(0)
    expect(review.brief.openingTitle).toBe('Slow Setup')
    expect(review.brief.midpointTitle).toBe('Revelation')
    expect(review.brief.endingTitle).toBe('Bittersweet')
    expect(review.accept.label).toBe('Accept first draft')
    expect(review.accept.lines.some((line) => /No time, cash, capacity, or RNG/.test(line))).toBe(true)
    expect(board.worldStatus).toMatch(/Decision required/)
    expect(board.attentionPennant).toMatch(/SCREENPLAY READY/)

    // The preview rides the rewrite card whenever the rewrite is legal.
    if (review.rewrite.available) {
      const preview = review.rewrite.preview
      expect(preview).not.toBeNull()
      if (preview === null) return
      expect(preview.dueWeek).toBe(session.gameState.market.tick + 1)
      expect(preview.currentLine).toMatch(/^Est\. /)
      expect(preview.projectedLine).toMatch(/^Projected Est\. /)

      // THE EXACTNESS LAW: authorize the rewrite, advance the one week, and the
      // realized perceived assessment equals the projection to the last bit.
      const corePreview = rewriteDecisionPreview(session.gameState, review.projectId)
      expect(corePreview).not.toBeNull()
      if (corePreview === null) return
      expect(preview.projectedScore).toBe(corePreview.projectedScore)
      const rewriteIntent = session
        .snapshot()
        .availableIntents.find((intent) => intent.kind === 'requestRewrite')
      expect(rewriteIntent).toBeDefined()
      if (rewriteIntent === undefined) return
      requireAccepted(session.command(commandEnvelope(session, 'rewrite-r', rewriteIntent.intentId)))
      const advanceTwo = session
        .snapshot()
        .availableIntents.find((intent) => intent.kind === 'advanceWeek')
      expect(advanceTwo).toBeDefined()
      if (advanceTwo === undefined) return
      requireAccepted(session.command(commandEnvelope(session, 'advance-r2', advanceTwo.intentId)))
      const realized = session.gameState.scriptDevelopment.projects.find(
        (candidate) => candidate.id === review.projectId,
      )
      expect(realized?.status).toBe('review')
      expect(realized?.rewriteCount).toBe(1)
      expect(realized?.assessment?.perceivedStrength).toBe(preview.projectedScore)

      // Final review offers Accept only, and says so.
      const finalBoard = developmentProjection(session.gameState).board
      expect(finalBoard?.review?.reviewState).toBe('final-draft')
      expect(finalBoard?.review?.rewrite.available).toBe(false)
      expect(finalBoard?.review?.finalNote).toMatch(/No further rewrite/)
    }
  })

  it("quotes an original screenplay draft with the engine's own clock", () => {
    const session = new BridgeSession(
      createBridgeInitialState('p03a-quote-original'),
      'p03a-quote-original',
    )
    const market = marketDraft(session)
    const draft: BridgeCommissionDraftPayload = {
      ...market,
      source: 'original',
      conceptId: null,
      genre: 'drama',
    }
    const conversion = draftToEngine(session.gameState, draft)
    expect(conversion.ok).toBe(true)
    const quoted = session.quote(quoteEnvelope(session, 'quote-o', draft))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.kind).toBe('commissionOriginalScreenplay')
    expect(quoted.quote.title).toBeNull()
    expect(quoted.quote.commitLabel).toBe('Commission an original screenplay')
    expect(quoted.quote.draftWeeks).toBeGreaterThanOrEqual(1)
    expect(quoted.quote.draftWeeks).toBeLessThanOrEqual(6)

    const conceptsBefore = session.gameState.concepts.length
    const committed = requireAccepted(
      session.command(commandEnvelope(session, 'commit-o', quoted.quote.intentId)),
    )
    expect(committed.accepted).toBe(true)
    // The original mints its concept at commit, never at quote.
    expect(session.gameState.concepts.length).toBe(conceptsBefore + 1)
    const project = session.gameState.scriptDevelopment.projects[
      session.gameState.scriptDevelopment.projects.length - 1
    ]!
    expect(project.promise.genre).toBe('drama')
    expect(project.dueWeek).toBe(project.commissionedWeek + (quoted.quote.draftWeeks ?? 0))
  })
})
