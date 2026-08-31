// P05A.1 — the Owner's real-profile Queue Greenlight failure, pinned forever.
//
// The fixture is the CANONICAL SAVE from the Owner's own durable checkpoint at
// the moment of the live failure (session d1a145e0…, revision 2, week 5): two
// package-ready screenplays, 0 of 2 Development & Casting slots, $4,826,401
// cash. Against this exact state the Owner pressed QUEUE GREENLIGHT and the
// engine answered rejected:ENGINE_REJECTED three times while the client showed
// a generic sentence. These tests pin BOTH truths the correction relies on:
//
//   1. the engine's front doors are correct and speak exact sentences — the
//      capacity-only affordable package QUEUES with zero commitment, and every
//      illegal draft is refused with the precise player-facing reason in
//      `message` (Owner order §5D, §7A/G);
//   2. the reject ENVELOPE carries that exact reason — so a client that shows
//      anything else is hiding truth it was handed (Owner order §6, §7G).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { castingDraftToEngine } from '../bridge/casting.ts'
import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import type { BridgeCastingDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { busyTalentIds, importSave, type GameState } from '../src/core/index.ts'

const OWNER_SAVE_JSON = readFileSync(
  join(__dirname, 'fixtures', 'p05a1-owner-profile-rev2.save.json'),
  'utf8',
)
const OWNER_STATE_DIGEST = '1d139f96e7a69cf9d416a17cac1022e70b23fa113a0aaf22e7439db94d24cefd'

// The Owner's board, exactly (see DIAGNOSTIC-RECORD in the P05A.1 evidence):
const PROJECT = 'script-0002' // "The Vanished Constellation"
const DIRECTOR = 't-dir-02' //  Vera Barrow      · studio    · $0
const LEAD = 't-act-02' //      Wallace Vasquez  · freelancer · $214,234
const ANTAGONIST = 't-act-04' // Sidney Marchetti · studio    · $0
const SUPPORT = 't-act-19' //   Greta Calloway   · freelancer · $233,051
const CRAFT = 't-cra-06' //     Gloria Cortland  · freelancer · $839,697
const CASH = 4826401
const FEES = 214234 + 233051 + 839697 // 1,286,982
const NEG_075 = 2685427
const NEG_1X = 3580570
const MKT_MIN = 449734

function ownerState(): GameState {
  return importSave(OWNER_SAVE_JSON).state as GameState
}

function greenlightDraft(overrides: Partial<BridgeCastingDraftPayload> = {}): BridgeCastingDraftPayload {
  return {
    kind: 'greenlightPackage',
    projectId: PROJECT,
    slateLead: null,
    slateAntagonist: null,
    slateSupport: null,
    directorId: DIRECTOR,
    castLead: LEAD,
    castAntagonist: ANTAGONIST,
    castSupport: SUPPORT,
    craftLeadId: CRAFT,
    budgetNegative: NEG_075,
    budgetMarketing: MKT_MIN,
    ...overrides,
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

describe('P05A.1 — the Owner-profile Queue Greenlight state, replayed', () => {
  it('the fixture IS the failure state (digest pinned)', () => {
    expect(authoritativeDigest(ownerState())).toBe(OWNER_STATE_DIGEST)
  })

  // §7A — VALID CAPACITY-ONLY QUEUE: complete distinct legal package, both
  // budgets published, sufficient cash, only facility-capacity blocking.
  it('capacity-only affordable package: quote accepted, queues, then ONE queue row and zero commitment', () => {
    const state = ownerState()
    const session = new BridgeSession(state, 'p05a1-queue-green')
    const quoted = session.quote(quoteEnvelope(session, 'q-affordable', greenlightDraft()))
    if (!quoted.accepted) throw new Error(`expected acceptance, got: ${quoted.message}`)
    const quote = quoted.quote
    if (quote.kind !== 'greenlightPicture') throw new Error(`wrong quote kind ${quote.kind}`)
    expect(quote.startsNow).toBe(false)
    expect(quote.queues).toBe(true)
    expect(quote.affordable).toBe(true)
    expect(quote.freelancerFees).toBe(FEES)
    expect(quote.totalImmediate).toBe(FEES + NEG_075 + MKT_MIN)
    expect(quote.cashBefore).toBe(CASH)
    expect(quote.queueNote).toBe(
      'The greenlight joins the Development & Casting queue. No production identity, ' +
        'budget, or talent commitment exists until capacity reaches the package and ' +
        'TypeScript revalidates it.',
    )

    // Core half — the exact successor state the accepted quote previewed:
    // exactly ONE new queue row, and NOTHING committed until admission.
    const conversion = castingDraftToEngine(state, greenlightDraft())
    if (!conversion.ok) throw new Error(`conversion refused: ${conversion.error}`)
    const applied = conversion.apply(state) as { ok: boolean; next: GameState }
    if (!applied.ok) throw new Error('preflight apply refused')
    const successor = applied.next
    expect(successor.productionQueue.length).toBe(state.productionQueue.length + 1)
    const row = successor.productionQueue[successor.productionQueue.length - 1]!
    expect(row.kind).toBe('greenlightScriptProject')
    if (row.kind !== 'greenlightScriptProject') throw new Error('unreachable')
    expect(row.scriptProjectId).toBe(PROJECT)
    expect(successor.studio.cash).toBe(state.studio.cash)
    expect([...busyTalentIds(successor)].sort()).toEqual([...busyTalentIds(state)].sort())
    expect(successor.operations.workflows.length).toBe(state.operations.workflows.length)

    // Wire half — committing the quoted intent is ACCEPTED and the board then
    // says so: the project reads greenlight-queued, cash and productions are
    // untouched on the published envelope.
    const envelopeBefore = session.snapshot()
    const committed = session.command({
      protocolVersion: PROTOCOL_VERSION,
      schemaId: SCHEMA_ID,
      sessionId: session.sessionId,
      commandId: 'c-affordable',
      expectedStateRevision: session.stateRevision,
      type: 'submitIntent' as const,
      payload: { intentId: quote.intentId },
    })
    if (!committed.accepted) throw new Error(`expected commit acceptance, got: ${committed.message}`)
    const envelopeAfter = session.snapshot()
    expect(envelopeAfter.treasury.cash).toBe(envelopeBefore.treasury.cash)
    const board = envelopeAfter.snapshot.casting.casting.board
    if (board === null) throw new Error('the casting board must be published after a queued greenlight')
    const boardProject = board.projects.find((entry) => entry.projectId === PROJECT)
    expect(boardProject?.greenlightQueued).toBe(true)
    expect(envelopeAfter.snapshot.productions.activeProductions.length)
      .toBe(envelopeBefore.snapshot.productions.activeProductions.length)
  })

  // §7C / hypothesis B — the Owner's most probable draft (1× negative).
  it('unaffordable package: EXACT D-12 sentence rides in the reject message', () => {
    const session = new BridgeSession(ownerState(), 'p05a1-unaffordable')
    const rejected = session.quote(
      quoteEnvelope(session, 'q-unaffordable', greenlightDraft({ budgetNegative: NEG_1X })),
    )
    if (rejected.accepted) throw new Error('expected rejection')
    expect(rejected.reasonCode).toBe('ENGINE_REJECTED')
    expect(rejected.message).toBe(
      'applyActions: greenlight rejected — Insufficient cash — this 5317286 commitment ' +
        'would leave cash at -490885. New commitments require cash to stay at or above zero ' +
        '(unavoidable weekly payroll and overhead may still run it negative). (D-12 solvency gate)',
    )
    // The generic envelope guidance still exists BESIDE the exact message —
    // the client's law is to render `message`, never the generic pair.
    expect(rejected.rejection?.blocker).toBe(
      'The authoritative TypeScript engine refused the submitted intent.',
    )
    // A rejected quote mints nothing and moves nothing.
    expect(session.stateRevision).toBe(0)
  })

  // §7E — duplicate person, exact conflicting ids named.
  it('duplicate actor: exact sentence names the duplicated slots', () => {
    const session = new BridgeSession(ownerState(), 'p05a1-duplicate')
    const rejected = session.quote(
      quoteEnvelope(session, 'q-duplicate', greenlightDraft({ castAntagonist: LEAD })),
    )
    if (rejected.accepted) throw new Error('expected rejection')
    expect(rejected.reasonCode).toBe('ENGINE_REJECTED')
    expect(rejected.message).toBe(
      'applyActions: greenlight assigns the same actor to more than one cast slot ' +
        '(t-act-02, t-act-02, t-act-19)',
    )
  })

  // §7B — a selected person who is not a current candidate is named with role.
  it('non-candidate person: exact sentence names the id, role, and title', () => {
    const session = new BridgeSession(ownerState(), 'p05a1-alien')
    const rejected = session.quote(
      quoteEnvelope(session, 'q-alien', greenlightDraft({ castLead: 't-act-99' })),
    )
    if (rejected.accepted) throw new Error('expected rejection')
    expect(rejected.reasonCode).toBe('ENGINE_REJECTED')
    expect(rejected.message).toBe(
      '"t-act-99" is not a current Lead candidate for The Vanished Constellation.',
    )
  })

  // §7D — a budget that is not a published option.
  it('unpublished budget amount: exact sentence names the budget', () => {
    const session = new BridgeSession(ownerState(), 'p05a1-budget')
    const rejected = session.quote(
      quoteEnvelope(session, 'q-budget', greenlightDraft({ budgetNegative: 1234567 })),
    )
    if (rejected.accepted) throw new Error('expected rejection')
    expect(rejected.reasonCode).toBe('ENGINE_REJECTED')
    expect(rejected.message).toBe('Choose a published negative budget amount before greenlighting.')
  })

  // §7H — stale/session envelope refusals stay DISTINCT from engine illegality.
  it('stale revision and foreign session are their own reason codes, never ENGINE_REJECTED', () => {
    const session = new BridgeSession(ownerState(), 'p05a1-envelope')
    const stale = session.quote({
      ...quoteEnvelope(session, 'q-stale', greenlightDraft()),
      expectedStateRevision: 7,
    })
    if (stale.accepted) throw new Error('expected rejection')
    expect(stale.reasonCode).toBe('STALE_REVISION')

    const foreign = session.quote({
      ...quoteEnvelope(session, 'q-foreign', greenlightDraft()),
      sessionId: 'some-other-session',
    })
    if (foreign.accepted) throw new Error('expected rejection')
    expect(foreign.reasonCode).toBe('SESSION_MISMATCH')
  })
})
