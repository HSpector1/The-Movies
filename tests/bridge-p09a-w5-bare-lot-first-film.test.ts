// P09A W5 — the AUTOMATED FULL FIRST-FILM JOURNEY at the authority boundary (P09 §23
// gate; P09-REQ-025/041): a bare lot is driven from founding to a released picture
// using ONLY what the bridge offers a client — placement quotes + commits for the
// plant, the Set commission quote + commit, and the journey's own next intent every
// week (the same selector the Unity client follows). No hidden cash, no free
// facility, no waived payroll: every dollar leaves the studio's own cash and the
// ledger reconciles exactly.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID, type SubmitIntentCommand } from '../bridge/protocol.ts'
import type { BridgeRuntimeCheckpointV1 } from '../bridge/runtime-checkpoint.ts'
import type { BridgeCheckpointStore } from '../bridge/runtime/checkpoint-store.ts'
import { createBridgeRuntimeCoordinator, type BridgeRuntimeCoordinator, type BridgeRuntimeReadView } from '../bridge/runtime/runtime-coordinator.ts'
import { BridgeSession, selectJourneyIntent } from '../bridge/session.ts'
import {
  applyActions,
  beginFounding,
  contractOffer,
  FOUNDING_MINIMUMS,
  foundingPhaseOf,
  generateWorld,
  importSave,
  migrateToV18,
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

// Exercise the same coordinator used by server.ts with its DEFAULT limits.
// Only the atomic byte store is inert; there is no HTTP server or fixture-state edit.
class JourneyCheckpointStore implements BridgeCheckpointStore {
  readonly checkpointPath = '<first-film-test-memory>'
  contents: string | null = null
  checkpoint!: BridgeRuntimeCheckpointV1
  writes = 0
  closeCalls = 0
  async read(): Promise<string | null> { return this.contents }
  async writeAtomic(text: string): Promise<void> {
    this.contents = text
    this.checkpoint = JSON.parse(text) as BridgeRuntimeCheckpointV1
    this.writes++
  }
  async close(): Promise<void> { this.closeCalls++ }
}

class JourneyRuntime {
  rollovers = 0
  constructor(
    readonly coordinator: BridgeRuntimeCoordinator,
    readonly store: JourneyCheckpointStore,
    readonly fatals: unknown[],
  ) {}

  static async open(state: GameState): Promise<JourneyRuntime> {
    const store = new JourneyCheckpointStore()
    const fatals: unknown[] = []
    const coordinator = await createBridgeRuntimeCoordinator({
      store,
      fatal: (error) => { fatals.push(error) },
      createFreshSession: (limits) => new BridgeSession(state, 'p09-w5-first-film', null, { limits }),
    })
    return new JourneyRuntime(coordinator, store, fatals)
  }

  // Inspection comes from the bytes actually persisted by the coordinator,
  // never the old BridgeSession object after its logical session is replaced.
  get gameState(): GameState { return migrateToV18(importSave(this.store.checkpoint.currentSaveJson)).state }

  async commit(tag: string, prepare: (live: BridgeRuntimeReadView, commandId: string) => SubmitIntentCommand): Promise<void> {
    // A full old journal may require one rollover. The candidate was proved to
    // fit alone before HistoryFull is thrown, so a second rollover cannot be progress.
    for (let attempt = 0; attempt < 2; attempt++) {
      const before = this.store.checkpoint
      const writesBefore = this.store.writes
      const request = await this.coordinator.read((live) => prepare(live, `${tag}-${String(attempt)}`))
      const result = await this.coordinator.dispatch('command', request)
      const after = this.store.checkpoint
      if (result.sessionRolledOver) {
        expect(result).toMatchObject({ firstSeen: false, response: { accepted: false, reasonCode: 'SESSION_MISMATCH' } })
        expect(after.currentSaveJson).toBe(before.currentSaveJson)
        expect(after.currentStateDigest).toBe(before.currentStateDigest)
        expect(after.savedSaveJson).toBe(before.savedSaveJson)
        expect(after.savedStateDigest).toBe(before.savedStateDigest)
        expect(after.sessionId).not.toBe(before.sessionId)
        expect(after.stateRevision).toBe(0)
        expect(after.journal).toEqual([])
        expect(this.store.writes).toBe(writesBefore + 1)
        const fresh = await this.coordinator.read((live) => live.snapshot())
        expect(fresh.sessionId).toBe(after.sessionId)
        expect(fresh.gameWeek).toBe(this.gameState.market.tick)
        expect(fresh.stateDigest).toBe(before.currentStateDigest)
        this.rollovers++
        // Re-read published intents or re-quote through prepare. A quote cache
        // does not survive a logical-session replacement; never replay its old ID.
        continue
      }
      expect(result.response.accepted, `${tag}: ${result.response.message}`).toBe(true)
      expect(result.firstSeen).toBe(true)
      expect(after.sessionId).toBe(request.sessionId)
      expect(after.stateRevision).toBe(request.expectedStateRevision + 1)
      expect(after.journal).toHaveLength(before.journal.length + 1)
      expect(after.journal.at(-1)).toMatchObject({ route: 'command', commandId: request.commandId, responseJson: result.responseJson })
      expect(this.store.writes).toBe(writesBefore + 1)
      const persistedBytes = this.store.contents
      const writesAfter = this.store.writes
      const replay = await this.coordinator.dispatch('command', request)
      expect(replay.firstSeen).toBe(false)
      expect(replay.responseJson).toBe(result.responseJson)
      expect(this.store.contents).toBe(persistedBytes)
      expect(this.store.writes).toBe(writesAfter)
      return
    }
    throw new Error(`${tag}: repeated logical-session rollover without accepting one legal action`)
  }
}

function envelope(session: BridgeRuntimeReadView, commandId: string) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: session.stateRevision }
}

async function buildThroughTheBridge(runtime: JourneyRuntime, blueprintId: string, tag: string): Promise<void> {
  await runtime.commit(`pc-${tag}`, (session, commandId) => {
    const quoted = session.quote({ ...envelope(session, `pq-${commandId}`), type: 'quotePlacement' as const, draft: { verb: 'build', blueprintId, origin: ORIGINS[blueprintId]! } })
    if (!quoted.accepted) throw new Error(`${blueprintId}: ${quoted.message}`)
    if (!quoted.quote.ok) throw new Error(`${blueprintId}: ${quoted.quote.primaryReason ?? 'not legal'}`)
    return { ...envelope(session, commandId), type: 'submitIntent' as const, payload: { intentId: quoted.quote.intentId } }
  })
}

describe('P09A W5 — the bare-lot first film, driven only through the bridge', () => {
  it('founds sparse, builds the plant and a Set at engine prices, and releases a picture on its own money', async () => {
    const session = await JourneyRuntime.open(foundMinimum(generateWorld('p09-w5-first-film', { regime: 'bare-lot' })))
    try {
      const ledgerStart = session.gameState.ledger.length
      let minCash = session.gameState.studio.cash
      let plantCommitted = false
      let setCommitted = false
      let commands = 0
      const kinds: string[] = []
      await buildThroughTheBridge(session, 'development-casting-office', 'office')
      for (let guard = 0; guard < 400 && session.gameState.studio.releasedFilms.length === 0; guard++) {
        const state = session.gameState
        minCash = Math.min(minCash, state.studio.cash)
        if (!plantCommitted && foundingPhaseOf(state) === 'satisfied') {
          for (const id of ['scenery-shop', 'stage-standard', 'post-building']) await buildThroughTheBridge(session, id, id)
          plantCommitted = true
          continue
        }
        const stage = state.operations.facilities.find((f) => f.capability === 'soundstage')
        const scenery = state.operations.facilities.find((f) => f.capability === 'set-scenery')
        if (!setCommitted && stage !== undefined && scenery !== undefined) {
          await session.commit('sc', (live, commandId) => {
            const quoted = live.quote({ ...envelope(live, `sq-${commandId}`), type: 'quoteSetCommission' as const, draft: { blueprintId: 'set-house-generic', stageFacilityId: stage.id } })
            if (!quoted.accepted) throw new Error(quoted.message)
            expect(quoted.quote.ok, quoted.quote.refusalReason ?? '').toBe(true)
            return { ...envelope(live, commandId), type: 'submitIntent' as const, payload: { intentId: quoted.quote.intentId } }
          })
          setCommitted = true
          continue
        }
        let acceptedKind = ''
        await session.commit(`j-${String(commands)}`, (live, commandId) => {
          const envelopeNow = live.snapshot()
          const intent = selectJourneyIntent(envelopeNow.availableIntents, envelopeNow.snapshot.journeyNotices.firstFilmJourney)
          expect(intent, `a playable journey intent at week ${String(state.market.tick)} (journey: ${envelopeNow.snapshot.journeyNotices.firstFilmJourney.headline} → ${String(envelopeNow.snapshot.journeyNotices.firstFilmJourney.next?.kind)})`).toBeDefined()
          acceptedKind = intent!.kind
          return { ...envelope(live, commandId), type: 'submitIntent' as const, payload: { intentId: intent!.intentId } }
        })
        kinds.push(acceptedKind)
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
      expect(session.rollovers, 'this projection21 journey exercises the natural default journal byte boundary').toBeGreaterThan(0)
      expect(session.fatals).toEqual([])
      console.log(`[p09 bridge journey] released week ${String(final.market.tick)}; commands ${String(commands)}; rollovers ${String(session.rollovers)}; cash floor ${String(Math.round(minCash))}; final cash ${String(Math.round(final.studio.cash))}`)
    } finally {
      await session.coordinator.close()
      expect(session.store.closeCalls).toBe(1)
    }
  })
})
