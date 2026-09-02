// P05A.3 — the Owner's casting-roster deadlock, pinned on the real profile.
//
// The fixture is the canonical save from the Owner's durable checkpoint at the
// moment they hit the wall (week 8, revision 10): The Bitter Migration is
// Ready, three distinct actors are mandatory, and exactly TWO legal actors
// exist across all three acting pools. The core's scriptReadModel computes the
// exact shortage ("Actors (2 of 3 available)…" + the sign/wait/rotate remedy)
// — and the casting package read model DROPPED it, publishing
// knownGatesClear=true for a mathematically unstaffable package.
//
// Proof obligations (order §14/§17 on the REAL deadlock state):
//   A. The shortage is a NAMED blocker, never a silent READY.
//   B. The hiring market is ALIVE on the wire: deterministic candidate order,
//      full D-11.6 offer economics, market-rotation week.
//   C. Busy actors are visible rows with the AUTHORITATIVE return week.
//   D. sign quote → commit: exact figures, then the signed actor joins the
//      legal pool and the staffing blocker disappears (the deadlock breaks).
//   E. Unaffordable sign refuses at quote time with the engine's D-12
//      sentence, and mutates nothing.
//   F. A stale offer refuses with INTENT_NOT_AVAILABLE; the same draft is
//      quotable fresh against the new state.
//   H. Signing one Underwood touches no other talent (same-surname isolation).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { createHash } from 'node:crypto'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { castingProjection } from '../bridge/casting.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { importSave, migrateToV16 } from '../src/core/index.ts'

const OWNER_SAVE_JSON = readFileSync(
  join(__dirname, 'fixtures', 'p05a3-owner-profile-rev10.save.json'),
  'utf8',
)
const OWNER_STATE_DIGEST = 'a3550efd3fe8f929'
const PROJECT_ID = 'script-0003'

// The Owner's live market, in hiringMarketIds order (free agents first, then
// the epoch sample). Pinned exactly: candidate ORDER is part of the wire law.
const MARKET_IDS = [
  't-act-25', // Vera Cortland — the star the Owner cannot yet afford (bonus 180,203 > cash)
  't-act-14',
  't-dir-00',
  't-act-17',
  't-act-12',
  't-wri-03',
  't-act-11',
  't-wri-01',
]
const GLORIA = 't-act-17' // Gloria Underwood, cheapest signable actor
const GLORIA_1YR = { weekly: 6040, guaranteed: 314080, bonus: 56536 }

function ownerState(): GameState {
  // P06A: the P05-era fixture migrates to the LIVE state — the old cast hid it.
  return migrateToV16(importSave(OWNER_SAVE_JSON)).state
}

function projectView(state: GameState) {
  return castingProjection(state).board?.projects.find((entry) => entry.projectId === PROJECT_ID)
}

function distinctAvailableActors(state: GameState): Set<string> {
  const project = projectView(state)
  return new Set(
    [
      ...(project?.leadCandidates ?? []),
      ...(project?.antagonistCandidates ?? []),
      ...(project?.supportCandidates ?? []),
    ]
      .filter((candidate) => candidate.available)
      .map((candidate) => candidate.talentId),
  )
}

function signDraft(talentId: string, termWeeks: number): BridgeCastingDraftPayload {
  return {
    kind: 'signActor',
    projectId: PROJECT_ID,
    slateLead: null,
    slateAntagonist: null,
    slateSupport: null,
    directorId: null,
    castLead: null,
    castAntagonist: null,
    castSupport: null,
    craftLeadId: null,
    budgetNegative: null,
    budgetMarketing: null,
    signTalentId: talentId,
    signTermWeeks: termWeeks,
  }
}

function quoteEnvelope(session: BridgeSession, commandId: string, draft: BridgeCastingDraftPayload) {
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

describe('P05A.3 — the two-actor deadlock is a NAMED blocker, never a silent READY', () => {
  it('the fixture IS the deadlock state', () => {
    const state = ownerState()
    // P06A: pin the RAW FIXTURE BYTES (immutable); the live V16 migration moved
    // the state digest, not the historical artifact.
    expect(
      createHash('sha256').update(OWNER_SAVE_JSON).digest('hex').startsWith(OWNER_STATE_DIGEST),
    ).toBe(true)
    const project = projectView(state)
    expect(project?.title).toBe('The Bitter Migration')
    // Exactly two distinct available actors across all three acting pools.
    expect(distinctAvailableActors(state).size).toBe(2)
  })

  it('publishes the package-staffing blocker with the exact counts and the acquisition remedy', () => {
    const readiness = projectView(ownerState())?.packageReadiness
    expect(readiness).toBeDefined()

    const staffing = readiness?.blockers.find((blocker) => blocker.code === 'package-staffing')
    expect(staffing, 'the shortage the core computes must reach the wire').toBeDefined()
    expect(staffing?.message).toContain('Actors (2 of 3 available')
    expect(staffing?.remedy).toContain('Sign suitable talent')

    // A package that cannot be staffed is NOT clear and does NOT queue.
    expect(readiness?.knownGatesClear).toBe(false)
    expect(readiness?.willQueue).toBe(false)
    expect(projectView(ownerState())?.attention).toBe('blocked')
  })
})

describe('P05A.3 — the hiring market is alive on the wire (§11/§13)', () => {
  it('publishes the exact candidates in hiringMarketIds order with full offer economics', () => {
    const board = castingProjection(ownerState()).board!
    expect(board.hiringCandidates.map((candidate) => candidate.talentId)).toEqual(MARKET_IDS)

    for (const candidate of board.hiringCandidates) {
      expect(candidate.kind).toBe('hiring-market')
      expect(candidate.availabilityLabel).toBe(
        'In the hiring market — requires a contract before casting',
      )
      // Every candidate carries the full published term menu, cheapest-first.
      expect(candidate.offers.map((offer) => offer.termWeeks)).toEqual([52, 104, 156, 208])
      for (const offer of candidate.offers) {
        expect(offer.weeklySalary).toBe(Math.round(offer.annualSalary / 52))
        expect(offer.guaranteedComp).toBe(offer.weeklySalary * offer.termWeeks)
        expect(offer.totalObligation).toBe(offer.signingBonus + offer.guaranteedComp)
      }
    }

    const gloria = board.hiringCandidates.find((candidate) => candidate.talentId === GLORIA)!
    expect(gloria.name).toBe('Gloria Underwood')
    expect(gloria.role).toBe('actor')
    const oneYear = gloria.offers[0]!
    expect(oneYear.termLabel).toBe('1 year')
    expect(oneYear.weeklySalary).toBe(GLORIA_1YR.weekly)
    expect(oneYear.guaranteedComp).toBe(GLORIA_1YR.guaranteed)
    expect(oneYear.signingBonus).toBe(GLORIA_1YR.bonus)
  })

  it('publishes the freelancer-market rotation week (week 8 → next rotation at week 13)', () => {
    expect(castingProjection(ownerState()).board!.freelancerMarketRefreshWeek).toBe(13)
  })

  it('busy actors are visible pool rows carrying the AUTHORITATIVE return week (§12)', () => {
    const project = projectView(ownerState())!
    const rows = new Map(
      [...project.leadCandidates, ...project.antagonistCandidates, ...project.supportCandidates].map(
        (candidate) => [candidate.talentId, candidate],
      ),
    )
    // Two productions wrap at different weeks; the rows say WHEN, not just "busy".
    expect(rows.get('t-act-15')?.available).toBe(false)
    expect(rows.get('t-act-15')?.returnWeek).toBe(13)
    expect(rows.get('t-act-19')?.available).toBe(false)
    expect(rows.get('t-act-19')?.returnWeek).toBe(16)
    // Available candidates carry no return week — they never left.
    for (const candidate of rows.values()) {
      if (candidate.available) expect(candidate.returnWeek).toBeNull()
    }
  })
})

describe('P05A.3 — sign quote → commit breaks the deadlock (§17-A/E/F/H)', () => {
  it('A+H: quotes exact figures, commits, and the signed actor joins the legal pool', () => {
    const state = ownerState()
    const session = new BridgeSession(state, 'p05a3-sign-happy')
    const cashBefore = session.gameState.studio.cash
    const contractsBefore = session.gameState.contracts.length

    const quoted = session.quote(quoteEnvelope(session, 'sign-quote-1', signDraft(GLORIA, 52)))
    expect(quoted.accepted).toBe(true)
    if (!quoted.accepted) return
    expect(quoted.quote.kind).toBe('signContract')
    expect(quoted.quote.commitLabel).toBe('Sign Gloria Underwood — 1 year')
    expect(quoted.quote.signTalentName).toBe('Gloria Underwood')
    expect(quoted.quote.signTermWeeks).toBe(52)
    expect(quoted.quote.signWeeklySalary).toBe(GLORIA_1YR.weekly)
    expect(quoted.quote.signGuaranteedComp).toBe(GLORIA_1YR.guaranteed)
    // The immediate commitment is the signing bonus, exactly (D-12).
    expect(quoted.quote.totalImmediate).toBe(GLORIA_1YR.bonus)
    expect(quoted.quote.cashBefore).toBe(cashBefore)
    expect(quoted.quote.cashAfter).toBe(cashBefore - GLORIA_1YR.bonus)
    expect(quoted.quote.affordable).toBe(true)

    const committed = session.command(commandEnvelope(session, 'sign-commit-1', quoted.quote.intentId))
    expect(committed.accepted).toBe(true)

    // The deadlock is broken: three distinct available actors, no staffing blocker.
    const after = session.gameState
    expect(after.studio.cash).toBe(cashBefore - GLORIA_1YR.bonus)
    expect(distinctAvailableActors(after).size).toBe(3)
    const readiness = projectView(after)?.packageReadiness
    expect(readiness?.blockers.find((blocker) => blocker.code === 'package-staffing')).toBeUndefined()

    // H: same-surname isolation — exactly ONE new contract, and it is Gloria's.
    // (Claude Underwood, t-act-21, shares the surname and stays untouched.)
    expect(after.contracts.length).toBe(contractsBefore + 1)
    const added = after.contracts.filter(
      (contract) => !state.contracts.some((prior) => prior === contract),
    )
    expect(added.map((contract) => contract.talentId)).toEqual([GLORIA])
    expect(after.freeAgents.includes(GLORIA)).toBe(false)
  })

  it('E: an unaffordable sign refuses at quote time with the D-12 sentence and mutates nothing', () => {
    // Vera Cortland's 1-year signing bonus (180,203) exceeds the Owner's real
    // cash (147,893) — the unaffordable case exists on the untouched fixture.
    const session = new BridgeSession(ownerState(), 'p05a3-sign-broke')
    const digestBefore = session.snapshot().stateDigest

    const refused = session.quote(quoteEnvelope(session, 'sign-quote-broke', signDraft('t-act-25', 52)))
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) {
      expect(refused.reasonCode).toBe('ENGINE_REJECTED')
      expect(refused.message).toContain('D-12 solvency gate')
    }
    expect(session.snapshot().stateDigest).toBe(digestBefore)
  })

  it('F: an accepted unrelated sign invalidates a live offer; the same draft is quotable fresh', () => {
    const session = new BridgeSession(ownerState(), 'p05a3-sign-stale')

    const offer = session.quote(quoteEnvelope(session, 'stale-offer-1', signDraft(GLORIA, 52)))
    expect(offer.accepted).toBe(true)
    if (!offer.accepted) return

    // The Owner signs the director first — an unrelated, accepted commit.
    const other = session.quote(quoteEnvelope(session, 'stale-other-quote', signDraft('t-dir-00', 52)))
    expect(other.accepted).toBe(true)
    if (!other.accepted) return
    const otherCommit = session.command(
      commandEnvelope(session, 'stale-other-commit', other.quote.intentId),
    )
    expect(otherCommit.accepted).toBe(true)

    // The old offer is dead against the new state — the client renders OFFER CHANGED.
    const dead = session.command(commandEnvelope(session, 'stale-dead-commit', offer.quote.intentId))
    expect(dead.accepted).toBe(false)
    if (!dead.accepted) expect(dead.reasonCode).toBe('INTENT_NOT_AVAILABLE')

    // The same draft facts are quotable fresh against the new state.
    const requoted = session.quote(quoteEnvelope(session, 'stale-offer-2', signDraft(GLORIA, 52)))
    expect(requoted.accepted).toBe(true)
    if (requoted.accepted) {
      expect(requoted.quote.kind).toBe('signContract')
      expect(requoted.quote.intentId).not.toBe(offer.quote.intentId)
    }
  })

  it('refuses an unknown or non-signable talent and a missing term in plain language', () => {
    const session = new BridgeSession(ownerState(), 'p05a3-sign-refusals')
    const digestBefore = session.snapshot().stateDigest

    // t-act-15 (Errol Reyes) is under contract and shooting — not signable.
    const busy = session.quote(quoteEnvelope(session, 'refuse-busy', signDraft('t-act-15', 52)))
    expect(busy.accepted).toBe(false)
    if (!busy.accepted) expect(busy.message).toContain('not currently signable')

    const unknown = session.quote(
      quoteEnvelope(session, 'refuse-unknown', signDraft('talent-does-not-exist-00', 52)),
    )
    expect(unknown.accepted).toBe(false)
    if (!unknown.accepted) expect(unknown.message).toContain('not currently signable')

    // A term outside the published menu never reaches the engine.
    const badTerm = session.quote(quoteEnvelope(session, 'refuse-term', signDraft(GLORIA, 53)))
    expect(badTerm.accepted).toBe(false)
    if (!badTerm.accepted) expect(badTerm.message).toContain('published contract term')

    expect(session.snapshot().stateDigest).toBe(digestBefore)
  })
})
