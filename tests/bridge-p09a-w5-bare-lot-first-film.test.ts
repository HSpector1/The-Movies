// P09A W5 — the AUTOMATED FULL FIRST-FILM JOURNEY at the authority boundary (P09 §23
// gate; P09-REQ-025/041): a bare lot is driven from founding to a released picture
// using ONLY what the bridge offers a client — placement quotes + commits for the
// plant, the Set commission quote + commit, and the journey's own next intent every
// week (the same selector the Unity client follows). No hidden cash, no free
// facility, no waived payroll: every dollar leaves the studio's own cash and the
// ledger reconciles exactly.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { BridgeSession, selectJourneyIntent } from '../bridge/session.ts'
import {
  applyActions,
  beginFounding,
  contractOffer,
  FOUNDING_MINIMUMS,
  foundingPhaseOf,
  generateWorld,
} from '../src/core/index.js'
import type { CreativeRole, GameState, LotCell } from '../src/core/index.js'
import { TUNING } from '../src/core/tuning.js'

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

const ORIGINS: Record<string, LotCell> = {
  'development-casting-office': { gx: 12, gy: 14 },
  'scenery-shop': { gx: 16, gy: 14 },
  'stage-standard': { gx: 26, gy: 4 },
  'post-building': { gx: 30, gy: 14 },
}

function envelope(session: BridgeSession, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision }
}

function buildThroughTheBridge(session: BridgeSession, blueprintId: string, tag: string): void {
  const quoted = session.quote({ ...envelope(session, `pq-${tag}`), type: 'quotePlacement' as const, draft: { verb: 'build', blueprintId, origin: ORIGINS[blueprintId]! } })
  if (!quoted.accepted) throw new Error(`${blueprintId}: ${quoted.message}`)
  if (!quoted.quote.ok) throw new Error(`${blueprintId}: ${quoted.quote.primaryReason ?? 'not legal'}`)
  const committed = session.command({ ...envelope(session, `pc-${tag}`), type: 'submitIntent' as const, payload: { intentId: quoted.quote.intentId } })
  if (!committed.accepted) throw new Error(`${blueprintId} commit: ${committed.message}`)
}

describe('P09A W5 — the bare-lot first film, driven only through the bridge', () => {
  it('founds sparse, builds the plant and a Set at engine prices, and releases a picture on its own money', () => {
    const session = new BridgeSession(foundMinimum(generateWorld('p09-w5-first-film', { regime: 'bare-lot' })), 'p09-w5-first-film')
    const ledgerStart = session.gameState.ledger.length
    let minCash = session.gameState.studio.cash
    let plantCommitted = false
    let setCommitted = false
    let commands = 0
    const kinds: string[] = []
    buildThroughTheBridge(session, 'development-casting-office', 'office')
    for (let guard = 0; guard < 400 && session.gameState.studio.releasedFilms.length === 0; guard++) {
      const state = session.gameState
      minCash = Math.min(minCash, state.studio.cash)
      if (!plantCommitted && foundingPhaseOf(state) === 'satisfied') {
        for (const id of ['scenery-shop', 'stage-standard', 'post-building']) buildThroughTheBridge(session, id, id)
        plantCommitted = true
        continue
      }
      const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')
      const scenery = state.operations.facilities.find((f) => f.capability === 'set-scenery')
      if (!setCommitted && stage !== undefined && scenery !== undefined) {
        const quoted = session.quote({ ...envelope(session, 'sq'), type: 'quoteSetCommission' as const, draft: { blueprintId: 'set-house-generic', stageFacilityId: stage.id } })
        if (!quoted.accepted) throw new Error(quoted.message)
        expect(quoted.quote.ok, quoted.quote.refusalReason ?? '').toBe(true)
        const committed = session.command({ ...envelope(session, 'sc'), type: 'submitIntent' as const, payload: { intentId: quoted.quote.intentId } })
        expect(committed.accepted).toBe(true)
        setCommitted = true
        continue
      }
      const envelopeNow = session.snapshot()
      const intent = selectJourneyIntent(envelopeNow.availableIntents, envelopeNow.snapshot.journeyNotices.firstFilmJourney)
      expect(intent, `a playable journey intent at week ${String(state.market.tick)} (journey: ${envelopeNow.snapshot.journeyNotices.firstFilmJourney.headline} → ${String(envelopeNow.snapshot.journeyNotices.firstFilmJourney.next?.kind)})`).toBeDefined()
      const result = session.command({ ...envelope(session, `j-${String(commands)}`), type: 'submitIntent' as const, payload: { intentId: intent!.intentId } })
      expect(result.accepted, `${intent!.kind} accepted`).toBe(true)
      kinds.push(intent!.kind)
      commands++
    }
    const final = session.gameState
    expect(final.studio.releasedFilms.length, `released (kinds: ${kinds.slice(-8).join(',')})`).toBe(1)
    expect(final.placement.facilities.filter((f) => f.status === 'operational')).toHaveLength(4)
    expect(final.sets).toHaveLength(1)
    expect(plantCommitted && setCommitted).toBe(true)
    expect(minCash).toBeGreaterThan(0)
    // Every cost was real and paid from the studio's own cash; the ledger reconciles exactly.
    const journey = final.ledger.slice(ledgerStart)
    const kindsSeen = new Set(journey.map((row) => row.kind))
    for (const kind of ['constructionCapex', 'facilityOpex', 'payroll', 'overhead', 'production'] as const) expect(kindsSeen.has(kind), kind).toBe(true)
    expect(journey.some((row) => /fixture|adjust/i.test(row.note ?? ''))).toBe(false)
    expect(final.studio.cash).toBe(final.ledger.reduce<number>((sum, row) => sum + row.amount, TUNING.INITIAL_CASH))
    expect(final.foundingRegime).toBe('bare-lot')
    expect(final.studioHistory.rows.some((row) => row.kind === 'filmReleased')).toBe(true)
    console.log(`[p09 bridge journey] released week ${String(final.market.tick)}; commands ${String(commands)}; cash floor ${String(Math.round(minCash))}; final cash ${String(Math.round(final.studio.cash))}`)
  })
})
