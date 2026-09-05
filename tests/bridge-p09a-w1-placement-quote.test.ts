// P09A Wave 1 — the placement quote family over the bridge (P09 §18, REQ-015/017).
//
// Laws proven here, each against the engine's OWN legality authority rather
// than a re-derivation:
//   R1  A legal preview is an accepted quote that is a direct read of
//       `queryPlacement` (cells, per-cell verdicts, price, weeks, capability,
//       capacity, parcel) with the engine's price — the client never supplies one.
//   R2  An ILLEGAL preview is an ACCEPTED answer (`ok:false`) carrying the
//       ordered rejections, the primary, per-cell verdicts and player-facing
//       copy — never a refusal, never colour alone. Its id is NOT a registered
//       intent: submitting it is refused as not available.
//   R3  Every rejection family the geometry can produce rides the wire exactly
//       as the engine says it (a full-grid sweep, two footprints), and every
//       family has copy.
//   R4  Commit is the ONE digest-bound intent: it builds exactly once, charges
//       exactly the quoted price through the ledger, and a replay is refused.
//   R5  Any accepted command retires every outstanding quote (a stale placement
//       preview can never be committed against a state it did not see); a stale
//       revision is refused before anything is read.
//   R6  The founding regime is on the wire (`lot.property.regime`) as exact history;
//       the same authority answers differently on a bare lot and on the endowed
//       lot for the same ground, and a fresh bare-lot runtime carries no founding
//       facilities.
//   R7  The protocol validator accepts the new request shape and refuses a
//       malformed one.
import { describe, expect, it } from 'vitest'

import { PLACEMENT_REJECTION_COPY, placementRejectionHeadline } from '../bridge/placement.ts'
import { PROTOCOL_VERSION, SCHEMA_ID, validateQuote } from '../bridge/protocol.ts'
import type {
  BridgePlacementDraftPayload,
  BridgePlacementQuoteSnapshot,
} from '../bridge/schema/bridge-schema.ts'
import { BridgeSession } from '../bridge/session.ts'
import {
  applyActions,
  beginFounding,
  contractOffer,
  FOUNDING_MINIMUMS,
  generateWorld,
  queryPlacement,
} from '../src/core/index.js'
import type {
  CreativeRole,
  FoundingRegime,
  GameState,
  LotCell,
  PlacementRejection,
} from '../src/core/index.js'
import { FACILITY_BLUEPRINTS } from '../src/core/tuning.js'

// ── fixtures (identical founding path to tests/p09a-w0-founding-regime.test.ts) ──

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

const founded = (seed: string, regime: FoundingRegime = 'endowed') =>
  foundMinimum(generateWorld(seed, { regime }))

const GRID = { width: 28, depth: 26 } as const

const ALL_REJECTIONS: readonly PlacementRejection[] = [
  'unknownBlueprint',
  'offLot',
  'notOwned',
  'terrainUnbuildable',
  'groundReserved',
  'occupied',
  'clearanceRing',
  'noRoadAccess',
  'seversLot',
  'requirementsUnmet',
  'instanceLimit',
  'insufficientFunds',
]

function draft(blueprintId: string, origin: LotCell): BridgePlacementDraftPayload {
  return { verb: 'build', blueprintId, origin: { gx: origin.gx, gy: origin.gy } }
}

function quoteEnvelope(session: BridgeSession, commandId: string, payload: BridgePlacementDraftPayload) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: session.stateRevision,
    type: 'quotePlacement' as const,
    draft: payload,
  }
}

function commandEnvelope(session: BridgeSession, commandId: string, intentId: string, revision = session.stateRevision) {
  return {
    protocolVersion: PROTOCOL_VERSION,
    schemaId: SCHEMA_ID,
    sessionId: session.sessionId,
    commandId,
    expectedStateRevision: revision,
    type: 'submitIntent' as const,
    payload: { intentId },
  }
}

function quoteOrThrow(session: BridgeSession, commandId: string, payload: BridgePlacementDraftPayload) {
  const response = session.quote(quoteEnvelope(session, commandId, payload))
  if (!response.accepted) throw new Error(`${commandId}: ${response.message}`)
  return response
}

/** First origin (row-major) where the engine says the blueprint is legal. */
function firstLegalOrigin(state: GameState, blueprintId: string, skip: (cell: LotCell) => boolean = () => false): LotCell {
  for (let gy = 0; gy < GRID.depth; gy++) {
    for (let gx = 0; gx < GRID.width; gx++) {
      const origin = { gx, gy }
      if (skip(origin)) continue
      if (queryPlacement(state, { blueprintId, origin }).ok) return origin
    }
  }
  throw new Error(`no legal origin for ${blueprintId}`)
}

/** Field-by-field: the wire quote is a direct read of the engine quote. */
function expectDirectRead(wire: BridgePlacementQuoteSnapshot, state: GameState, blueprintId: string, origin: LotCell) {
  const engine = queryPlacement(state, { blueprintId, origin })
  expect(wire.ok).toBe(engine.ok)
  expect(wire.blueprintId).toBe(engine.blueprintId)
  expect(wire.origin).toEqual({ gx: origin.gx, gy: origin.gy })
  expect(wire.parcelId).toBe(engine.parcelId)
  expect(wire.cells).toEqual(engine.cells.map((c) => ({ gx: c.gx, gy: c.gy })))
  expect(wire.cellLegality).toEqual(
    engine.cellLegality.map((v) => ({ cell: { gx: v.cell.gx, gy: v.cell.gy }, ok: v.ok, rejection: v.rejection })),
  )
  expect(wire.cost).toBe(engine.cost)
  expect(wire.weeklyOperatingCost).toBe(engine.weeklyOperatingCost)
  expect(wire.buildWeeks).toBe(engine.buildWeeks)
  expect(wire.completesOnWeek).toBe(engine.completesOnWeek)
  expect(wire.capability).toBe(engine.capability)
  expect(wire.capacityDelta).toBe(engine.capacityDelta)
  expect(wire.rejections).toEqual(engine.rejections)
  expect(wire.primary).toBe(engine.primary)
  expect(wire.primaryReason).toBe(engine.primary === null ? null : placementRejectionHeadline(engine.primary, engine))
  expect(wire.unmetRequirements.map((u) => u.reason)).toEqual(engine.unmetRequirements.map((u) => u.reason))
  expect(wire.instanceCount).toBe(engine.instanceCount)
  expect(wire.maxInstances).toBe(engine.maxInstances)
  expect(wire.cashBefore).toBe(Math.round(state.studio.cash))
  expect(wire.cashAfter).toBe(Math.round(state.studio.cash) - engine.cost)
  expect(wire.kind).toBe('placeFacility')
  expect(wire.intentId.length).toBeGreaterThan(0)
  expect(wire.queues).toBe(false)
  expect(wire.queueNote).toBeNull()
  expect(wire.startsNow).toBe(engine.ok)
  expect(wire.consequence.length).toBeGreaterThan(0)
}

describe('P09A W1 — placement quote family over the bridge', () => {
  it('R1: a legal preview is an accepted quote that reads the engine authority verbatim, engine-priced', () => {
    const state = founded('p09a-w1-legal')
    const session = new BridgeSession(state, 'p09a-w1-legal')
    const blueprintId = 'development-office-2'
    const origin = firstLegalOrigin(state, blueprintId)
    const blueprint = FACILITY_BLUEPRINTS.find((b) => b.id === blueprintId)!

    const quoted = quoteOrThrow(session, 'legal-quote-1', draft(blueprintId, origin))
    expect(quoted.stateRevision).toBe(session.stateRevision)
    expectDirectRead(quoted.quote, state, blueprintId, origin)
    expect(quoted.quote.ok).toBe(true)
    expect(quoted.quote.rejections).toEqual([])
    expect(quoted.quote.primary).toBeNull()
    expect(quoted.quote.primaryReason).toBeNull()
    expect(quoted.quote.cost).toBe(blueprint.capex)
    expect(quoted.quote.buildWeeks).toBe(blueprint.buildWeeks)
    expect(quoted.quote.completesOnWeek).toBe(state.market.tick + blueprint.buildWeeks)
    expect(quoted.quote.cells).toHaveLength(blueprint.footprint.width * blueprint.footprint.depth)
    expect(quoted.quote.cellLegality.every((v) => v.ok && v.rejection === null)).toBe(true)
    expect(quoted.quote.footprint).toEqual({ width: blueprint.footprint.width, depth: blueprint.footprint.depth })
    expect(quoted.quote.name).toBe(blueprint.name)
    expect(quoted.quote.effectSummary).toBe(blueprint.effectSummary)
    expect(quoted.quote.commitLabel).toContain(blueprint.name.toUpperCase())
    expect(quoted.quote.commitLabel).toContain(`$${blueprint.capex.toLocaleString('en-US')}`)
    expect(quoted.quote.affordable).toBe(true)
    expect(quoted.quote.startsNow).toBe(true)
    // A preview mutates nothing.
    expect(session.stateRevision).toBe(0)
    expect(session.gameState).toBe(state)
  })

  it('R2: an illegal preview is an ACCEPTED ok:false answer with reasons — and its id is not a registered intent', () => {
    const state = founded('p09a-w1-illegal')
    const session = new BridgeSession(state, 'p09a-w1-illegal')

    // Off the lot entirely.
    const off = quoteOrThrow(session, 'illegal-off', draft('development-office-2', { gx: GRID.width + 3, gy: 2 }))
    expect(off.accepted).toBe(true)
    expect(off.quote.ok).toBe(false)
    expect(off.quote.primary).toBe('offLot')
    expect(off.quote.primaryReason).toBe(PLACEMENT_REJECTION_COPY.offLot)
    expect(off.quote.consequence).toContain(PLACEMENT_REJECTION_COPY.offLot)
    expect(off.quote.startsNow).toBe(false)
    expectDirectRead(off.quote, state, 'development-office-2', { gx: GRID.width + 3, gy: 2 })

    // The illegal id is minted but NOT registered: the authority refuses it.
    const submitted = session.command(commandEnvelope(session, 'illegal-commit', off.quote.intentId))
    expect(submitted.accepted).toBe(false)
    if (!submitted.accepted) expect(submitted.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.stateRevision).toBe(0)
    expect(session.gameState.placement.facilities).toHaveLength(state.placement.facilities.length)

    // Locked by a requirement: office 3 requires office 2 — the copy rides the wire.
    const origin3 = firstLegalOrigin(state, 'development-office-2')
    const locked = quoteOrThrow(session, 'illegal-locked', draft('development-office-3', origin3))
    expect(locked.quote.ok).toBe(false)
    expect(locked.quote.rejections).toContain('requirementsUnmet')
    expect(locked.quote.unmetRequirements.length).toBeGreaterThan(0)
    expect(locked.quote.unmetRequirements[0]!.kind).toBe('facility')
    expect(locked.quote.primaryReason).toBe(`Requirement not met: ${locked.quote.unmetRequirements[0]!.reason.replace(/\.$/, '')}.`)
    expect(locked.quote.consequence).toContain('Requirement not met:')
    expectDirectRead(locked.quote, state, 'development-office-3', origin3)

    // An unknown blueprint is a DRAFT refusal (about the request, not the ground).
    const unknown = session.quote(quoteEnvelope(session, 'illegal-unknown', draft('not-a-building', { gx: 1, gy: 1 })))
    expect(unknown.accepted).toBe(false)
    if (!unknown.accepted) {
      expect(unknown.reasonCode).toBe('ENGINE_REJECTED')
      expect(unknown.message).toBe(PLACEMENT_REJECTION_COPY.unknownBlueprint)
    }

    // Move/demolish are P09-R4: refused as a draft, never silently treated as a build.
    const move = session.quote(quoteEnvelope(session, 'illegal-verb', {
      ...draft('development-office-2', origin3),
      verb: 'move' as unknown as 'build',
    }))
    expect(move.accepted).toBe(false)
  })

  it('R3: a full-grid sweep with two footprints rides every rejection family the ground produces, exactly as the engine says', () => {
    const state = founded('p09a-w1-sweep')
    const session = new BridgeSession(state, 'p09a-w1-sweep')
    const families = new Set<PlacementRejection>()
    let previews = 0
    let legal = 0
    for (const blueprintId of ['development-office-2', 'stage-standard']) {
      for (let gy = -1; gy <= GRID.depth; gy += 1) {
        for (let gx = -1; gx <= GRID.width; gx += 1) {
          const origin = { gx, gy }
          const quoted = quoteOrThrow(session, `sweep-${blueprintId}-${String(gx)}-${String(gy)}`, draft(blueprintId, origin))
          previews += 1
          expectDirectRead(quoted.quote, state, blueprintId, origin)
          if (quoted.quote.ok) legal += 1
          for (const rejection of quoted.quote.rejections) families.add(rejection)
          // Per-cell verdicts carry only families that appear in the ordered list.
          for (const verdict of quoted.quote.cellLegality) {
            if (verdict.rejection !== null) expect(quoted.quote.rejections).toContain(verdict.rejection)
          }
          // The primary is always the first ordered rejection, or null when legal.
          expect(quoted.quote.primary).toBe(quoted.quote.rejections[0] ?? null)
        }
      }
    }
    // The sweep never mutated the state or moved the revision.
    expect(session.stateRevision).toBe(0)
    expect(session.gameState).toBe(state)
    expect(legal).toBeGreaterThan(0)
    expect(families.has('unknownBlueprint')).toBe(false)
    expect(previews).toBe(2 * (GRID.width + 2) * (GRID.depth + 2))
    // Geometry alone must produce the ground families on the endowed lot: the
    // authored founding bodies are RESERVED ground (never `occupied`, which is
    // the word for a facility the studio placed).
    for (const required of ['offLot', 'groundReserved', 'noRoadAccess', 'terrainUnbuildable'] as const) {
      expect(families, `sweep families: ${[...families].join(',')}`).toContain(required)
    }
    expect(families.has('occupied')).toBe(false)
    expect(families.has('clearanceRing')).toBe(false)

    // A PLACED facility is what produces `occupied` and its clear ring — and the
    // wire still reads the authority verbatim around it.
    const annexOrigin = firstLegalOrigin(state, 'craft-annex')
    const placed = quoteOrThrow(session, 'sweep-place-annex', draft('craft-annex', annexOrigin))
    const committed = session.command(commandEnvelope(session, 'sweep-commit-annex', placed.quote.intentId))
    expect(committed.accepted, (committed as { message?: string }).message).toBe(true)
    const around = new Set<PlacementRejection>()
    for (let gy = annexOrigin.gy - 3; gy <= annexOrigin.gy + 3; gy += 1) {
      for (let gx = annexOrigin.gx - 3; gx <= annexOrigin.gx + 3; gx += 1) {
        const origin = { gx, gy }
        const quoted = quoteOrThrow(session, `sweep-around-${String(gx)}-${String(gy)}`, draft('development-office-2', origin))
        expectDirectRead(quoted.quote, session.gameState, 'development-office-2', origin)
        for (const rejection of quoted.quote.rejections) around.add(rejection)
      }
    }
    for (const required of ['occupied', 'clearanceRing'] as const) {
      expect(around, `around families: ${[...around].join(',')}`).toContain(required)
    }
    // Every family has player-facing copy (no engine term leaks as the reason).
    expect(Object.keys(PLACEMENT_REJECTION_COPY).sort()).toEqual([...ALL_REJECTIONS].sort())
    for (const rejection of ALL_REJECTIONS) expect(PLACEMENT_REJECTION_COPY[rejection].length).toBeGreaterThan(0)
  })

  it('R4: commit builds exactly once at the quoted engine price, then the intent is spent', () => {
    const state = founded('p09a-w1-commit')
    const session = new BridgeSession(state, 'p09a-w1-commit')
    const blueprintId = 'craft-annex'
    const origin = firstLegalOrigin(state, blueprintId)
    const quoted = quoteOrThrow(session, 'commit-quote', draft(blueprintId, origin))
    expect(quoted.quote.ok).toBe(true)
    const before = session.gameState
    const cashBefore = before.studio.cash
    const facilitiesBefore = before.placement.facilities.length

    const committed = session.command(commandEnvelope(session, 'commit-1', quoted.quote.intentId))
    expect(committed.accepted, (committed as { message?: string }).message).toBe(true)
    const after = session.gameState
    expect(session.stateRevision).toBe(1)
    expect(after.placement.facilities).toHaveLength(facilitiesBefore + 1)
    const built = after.placement.facilities[after.placement.facilities.length - 1]!
    expect(built.blueprintId).toBe(blueprintId)
    expect(built.origin).toEqual(origin)
    // The engine's own price, charged once, through the ledger.
    expect(cashBefore - after.studio.cash).toBe(quoted.quote.cost)
    const capex = after.ledger.filter((e) => e.kind === 'constructionCapex' && e.week === before.market.tick)
    expect(capex.filter((e) => e.amount === -quoted.quote.cost)).toHaveLength(1)

    // Replay is refused: the quote was consumed.
    const replay = session.command(commandEnvelope(session, 'commit-2', quoted.quote.intentId))
    expect(replay.accepted).toBe(false)
    if (!replay.accepted) expect(replay.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.placement.facilities).toHaveLength(facilitiesBefore + 1)

    // The same ground now answers `occupied`, and the single-instance law now answers `instanceLimit`.
    const again = quoteOrThrow(session, 'commit-quote-again', draft(blueprintId, origin))
    expect(again.quote.ok).toBe(false)
    expect(again.quote.rejections).toContain('occupied')
    expect(again.quote.rejections).toContain('instanceLimit')
    expect(again.quote.instanceCount).toBe(1)
    expect(again.quote.maxInstances).toBe(1)
    expectDirectRead(again.quote, session.gameState, blueprintId, origin)
    const elsewhere = quoteOrThrow(
      session,
      'commit-quote-elsewhere',
      draft(blueprintId, firstLegalOrigin(session.gameState, 'development-office-2')),
    )
    expect(elsewhere.quote.ok).toBe(false)
    expect(elsewhere.quote.primary).toBe('instanceLimit')
  })

  it('R5: any accepted command retires outstanding placement quotes; a stale revision is refused first', () => {
    const state = founded('p09a-w1-stale')
    const session = new BridgeSession(state, 'p09a-w1-stale')
    const a = firstLegalOrigin(state, 'development-office-2')
    const b = firstLegalOrigin(state, 'craft-annex', (cell) => cell.gx === a.gx && cell.gy === a.gy)
    const quoteA = quoteOrThrow(session, 'stale-a', draft('development-office-2', a))
    const quoteB = quoteOrThrow(session, 'stale-b', draft('craft-annex', b))
    expect(quoteA.quote.ok).toBe(true)
    expect(quoteB.quote.ok).toBe(true)

    // Commit B — A was quoted against a state that no longer exists.
    const committedB = session.command(commandEnvelope(session, 'stale-commit-b', quoteB.quote.intentId))
    expect(committedB.accepted, (committedB as { message?: string }).message).toBe(true)
    const refusedA = session.command(commandEnvelope(session, 'stale-commit-a', quoteA.quote.intentId))
    expect(refusedA.accepted).toBe(false)
    if (!refusedA.accepted) expect(refusedA.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState.placement.facilities.filter((f) => f.blueprintId === 'development-office-2')).toHaveLength(0)

    // Re-quote A on the live state, then submit with a stale revision: refused before any read.
    const requoted = quoteOrThrow(session, 'stale-a-2', draft('development-office-2', a))
    const stale = session.command(commandEnvelope(session, 'stale-revision', requoted.quote.intentId, session.stateRevision - 1))
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')
    // The quote itself is untouched by a refused envelope: the live revision commits it.
    const live = session.command(commandEnvelope(session, 'stale-live', requoted.quote.intentId))
    expect(live.accepted, (live as { message?: string }).message).toBe(true)

    // A quote request with a stale revision is refused the same way.
    const staleQuote = session.quote({ ...quoteEnvelope(session, 'stale-quote', draft('craft-annex', b)), expectedStateRevision: 0 })
    expect(staleQuote.accepted).toBe(false)
    if (!staleQuote.accepted) expect(staleQuote.reasonCode).toBe('STALE_REVISION')
  })

  it('R6: the founding regime is on the wire as exact history; the same authority answers per the ground it sees', () => {
    const endowedState = founded('p09a-w1-regime')
    const bareState = founded('p09a-w1-regime', 'bare-lot')
    const endowedSession = new BridgeSession(endowedState, 'p09a-w1-regime-endowed')
    const bareSession = new BridgeSession(bareState, 'p09a-w1-regime-bare')

    expect(endowedSession.snapshot().snapshot.lot.property?.regime).toBe('endowed')
    expect(bareSession.snapshot().snapshot.lot.property?.regime).toBe('bare-lot')
    expect(bareState.foundingRegime).toBe('bare-lot')
    expect(endowedState.foundingRegime).toBe('endowed')

    // W0's proven bare-lot founding origin: legal on the bare lot, not on the endowed lot.
    const officeOrigin = { gx: 1, gy: 5 }
    const bareQuote = quoteOrThrow(bareSession, 'regime-bare-office', draft('development-casting-office', officeOrigin))
    const endowedQuote = quoteOrThrow(endowedSession, 'regime-endowed-office', draft('development-casting-office', officeOrigin))
    expectDirectRead(bareQuote.quote, bareState, 'development-casting-office', officeOrigin)
    expectDirectRead(endowedQuote.quote, endowedState, 'development-casting-office', officeOrigin)
    expect(bareQuote.quote.ok).toBe(true)
    expect(endowedQuote.quote.ok).toBe(false)

    // A bare lot commits its FIRST facility through the same one intent and pays the engine's price.
    const cashBefore = bareState.studio.cash
    const committed = bareSession.command(commandEnvelope(bareSession, 'regime-bare-commit', bareQuote.quote.intentId))
    expect(committed.accepted, (committed as { message?: string }).message).toBe(true)
    expect(bareSession.gameState.placement.facilities).toHaveLength(1)
    expect(cashBefore - bareSession.gameState.studio.cash).toBe(bareQuote.quote.cost)
    expect(bareSession.snapshot().snapshot.lot.property?.regime).toBe('bare-lot')

    // A fresh runtime honours the configured regime and never infers it.
    const freshBare = BridgeSession.createRuntime(undefined, 'bare-lot')
    const freshEndowed = BridgeSession.createRuntime()
    expect(freshBare.gameState.foundingRegime).toBe('bare-lot')
    expect(freshEndowed.gameState.foundingRegime).toBe('endowed')
    expect(freshBare.gameState.property.structures.map((s) => s.id).sort()).toEqual(['admin', 'gate'])
    expect(freshEndowed.gameState.property.structures.length).toBeGreaterThan(2)
    expect(freshBare.snapshot().snapshot.lot.property?.regime).toBe('bare-lot')
    expect(freshEndowed.snapshot().snapshot.lot.property?.regime).toBe('endowed')
  })

  it('R7: the protocol validator accepts the placement quote request and refuses malformed drafts', () => {
    const state = founded('p09a-w1-protocol')
    const session = new BridgeSession(state, 'p09a-w1-protocol')
    const good = validateQuote(quoteEnvelope(session, 'proto-good', draft('development-office-2', { gx: 3, gy: 4 })))
    expect(good.ok).toBe(true)
    const badOrigin = validateQuote({
      ...quoteEnvelope(session, 'proto-bad-origin', draft('development-office-2', { gx: 3, gy: 4 })),
      draft: { verb: 'build', blueprintId: 'development-office-2', origin: { gx: 3.5, gy: 4 } },
    })
    expect(badOrigin.ok).toBe(false)
    const badVerb = validateQuote({
      ...quoteEnvelope(session, 'proto-bad-verb', draft('development-office-2', { gx: 3, gy: 4 })),
      draft: { verb: 'demolish', blueprintId: 'development-office-2', origin: { gx: 3, gy: 4 } },
    })
    expect(badVerb.ok).toBe(false)
    const missingBlueprint = validateQuote({
      ...quoteEnvelope(session, 'proto-missing', draft('development-office-2', { gx: 3, gy: 4 })),
      draft: { verb: 'build', origin: { gx: 3, gy: 4 } },
    })
    expect(missingBlueprint.ok).toBe(false)
  })
})
