// P10-R1 — the contract quote family over the bridge (P10-REQ-018; execution order P10-R1):
// the two material contract actions the D-11 law already carried (`renewContract`,
// `releaseTalent`) now reach the client through ONE revision-bound quote → intent →
// commit route, with the engine deciding every window, price and refusal.
//   R0  The Profile publishes the legal windows and the engine's own renewal terms; the
//       quote family re-asks the same authorities, so the sheet cannot disagree.
//   R1  A legal renewal preview reads the engine verbatim; commit renews exactly once at
//       the quoted bonus; a replayed command is the same answer; a re-used intent is refused.
//   R2  A legal release preview carries the engine's termination cost; commit releases
//       once, debits once, and every recorded credit / career event stays on the record.
//   R3  A closed renewal window is an ACCEPTED `ok:false` answer whose id is not a commit.
//   R4  A stale quote (revision moved) is refused; the intent minted for the old state dies.
//   R5  Unknown person → draft refusal; no contract → accepted refusal; a changed contract
//       re-prices — the old sheet is never honoured.
//   R6  The engine's own refusals: unpublished term, the D-12 solvency gate, a screenplay task.
//   R7  Cancellation (quote without commit) is state-neutral.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, type BridgeContractDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import { contractActionDecisions, contractDraftToEngine, contractQuoteSnapshot, contractTermLabel } from '../bridge/contract.ts'
import { peopleProjection } from '../bridge/people.ts'
import {
  activeContract,
  activeScriptWriterAssignments,
  applyActions,
  beginFounding,
  contractOffer,
  contractOfferOptions,
  FOUNDING_MINIMUMS,
  generateWorld,
  guaranteedComp,
  renewalWindowOpen,
  terminationCost,
  tick,
  weeklySalary,
} from '../src/core/index.js'
import type { CommissionOriginalScreenplayPayload, CreativeRole, GameState, Genre, SegmentId } from '../src/core/index.js'
import { TUNING } from '../src/core/tuning.js'

const TERM = 52

function foundMinimum(state: GameState): GameState {
  let next = beginFounding(state)
  const applicants = next.founding!.applicantIds.map((id) => next.talent.find((t) => t.id === id)!)
  for (const role of ['actor', 'director', 'writer', 'craft'] as const satisfies readonly CreativeRole[]) {
    const pool = applicants
      .filter((t) => t.role === role)
      .map((t) => ({ t, offer: contractOffer(next, t.id, TERM) }))
      .sort((a, b) => a.offer.annualSalary - b.offer.annualSalary)
    for (const { t } of pool.slice(0, FOUNDING_MINIMUMS[role])) {
      next = applyActions(next, [{ kind: 'signContract', talentId: t.id, termWeeks: TERM }])
    }
  }
  return applyActions(next, [
    { kind: 'foundStudio' },
    { kind: 'activateStudioOperations' },
    { kind: 'activateScriptDevelopment' },
    { kind: 'activateCastingSessions' },
  ])
}
const founded = (seed: string) => foundMinimum(generateWorld(seed, { regime: 'endowed' }))

/** Tick the founded studio until at least one contract sits inside its renewal window. */
function intoWindow(seed: string): GameState {
  let state = founded(seed)
  for (let guard = 0; guard < 80; guard++) {
    if (state.contracts.some((c) => renewalWindowOpen(c, state.market.tick))) return state
    state = tick(state)
  }
  throw new Error('no contract reached its renewal window')
}
const contracted = (state: GameState) => state.contracts.map((c) => c.talentId)
const writerOnTask = (state: GameState) => activeScriptWriterAssignments(state.scriptDevelopment, state.concepts)

function envelope(session: BridgeSession, commandId: string, revision = session.stateRevision) {
  return { protocolVersion: PROTOCOL_VERSION, schemaId: SCHEMA_ID, sessionId: session.sessionId, commandId, expectedStateRevision: revision }
}
function quoteContract(session: BridgeSession, commandId: string, draft: BridgeContractDraftPayload) {
  const response = session.quote({ ...envelope(session, commandId), type: 'quoteContract' as const, draft })
  if (!response.accepted) throw new Error(`${commandId}: ${response.message}`)
  return response
}
function submit(session: BridgeSession, commandId: string, intentId: string, revision?: number) {
  return session.command({ ...envelope(session, commandId, revision), type: 'submitIntent' as const, payload: { intentId } })
}
const ledgerRows = (state: GameState, kind: string, talentId: string) =>
  state.ledger.filter((row) => row.kind === kind && row.talentId === talentId)

function originalPayload(writerId: string, genre: Genre): CommissionOriginalScreenplayPayload {
  return {
    writerId,
    genre,
    shape: { opening: 'mysteryHook', midpoint: 'revelation', ending: 'ambiguous' },
    promise: { genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.4, 0.6], tonalWeight: [0, 0.8], kineticEnergy: [-0.7, 0.2] } },
  }
}

describe('P10-R1 — contract renewal / early release over the bridge', () => {
  it('R0: the Profile publishes the legal windows and the engine\'s own terms; the schema publishes both intent kinds', () => {
    expect(AVAILABLE_INTENT_KINDS).toContain('renewContract')
    expect(AVAILABLE_INTENT_KINDS).toContain('releaseTalent')
    const early = founded('p10-r1-windows')
    const id = contracted(early)[0]!
    const before = contractActionDecisions(early, id)
    expect(before.renewAvailable).toBe(false)
    expect(before.renewReason).toMatch(/renewal window is not open yet/)
    expect(before.renewalTerms).toHaveLength(0)
    expect(before.releaseAvailable).toBe(true)
    expect(before.releaseReason).toBeNull()

    const state = intoWindow('p10-r1-windows')
    const open = state.contracts.find((c) => renewalWindowOpen(c, state.market.tick))!
    const decision = contractActionDecisions(state, open.talentId)
    expect(decision.renewAvailable).toBe(true)
    const offers = contractOfferOptions(state, open.talentId)
    expect(decision.renewalTerms.map((t) => t.termWeeks)).toEqual([...TUNING.CONTRACT_TERM_OPTIONS])
    for (const [i, term] of decision.renewalTerms.entries()) {
      expect(term.annualSalary).toBe(offers[i]!.annualSalary)
      expect(term.signingBonus).toBe(offers[i]!.signingBonus)
      expect(term.weeklySalary).toBe(weeklySalary(offers[i]!.annualSalary))
      expect(term.endWeekExclusive).toBe(state.market.tick + term.termWeeks)
      expect(term.termLabel).toBe(contractTermLabel(term.termWeeks))
    }
    // The wire carries the same decision (the Profile cannot disagree with the sheet).
    const profile = peopleProjection(state).profiles.find((p) => p.talentId === open.talentId)!
    expect(profile.employment.contract?.actions).toEqual(decision)
    // Nothing hidden rides the actions block.
    const serialized = JSON.stringify(profile.employment.contract?.actions)
    for (const forbidden of ['actual', 'ceilings', 'devRate', 'seed']) expect(serialized).not.toContain(`"${forbidden}"`)
  })

  it('R1: a legal renewal reads the engine verbatim, commits once at the quoted bonus, and refuses replay / re-use', () => {
    const state = intoWindow('p10-r1-renew')
    const week = state.market.tick
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const talent = state.talent.find((t) => t.id === open.talentId)!
    const offer = contractOffer(state, open.talentId, 104, week)
    const session = new BridgeSession(state, 'p10-r1-renew')
    const quoted = quoteContract(session, 'q-renew', { verb: 'renew', talentId: open.talentId, termWeeks: 104 })
    const q = quoted.quote
    expect(q.kind).toBe('renewContract')
    expect(q.ok).toBe(true)
    expect(q.startsNow).toBe(true)
    expect(q.queues).toBe(false)
    expect(q.verb).toBe('renew')
    expect(q.talentId).toBe(open.talentId)
    expect(q.talentName).toBe(talent.name)
    expect(q.renewalOpen).toBe(true)
    expect(q.currentEndWeekExclusive).toBe(open.endWeekExclusive)
    expect(q.termWeeks).toBe(104)
    expect(q.termLabel).toBe('2 years')
    expect(q.annualSalary).toBe(offer.annualSalary)
    expect(q.weeklySalary).toBe(weeklySalary(offer.annualSalary))
    expect(q.signingBonus).toBe(offer.signingBonus)
    expect(q.newEndWeekExclusive).toBe(week + 104)
    expect(q.cost).toBe(offer.signingBonus)
    expect(q.terminationCost).toBeNull()
    expect(q.refusal).toBeNull()
    expect(q.cashBefore).toBe(Math.round(state.studio.cash))
    expect(q.cashAfter).toBe(Math.round(state.studio.cash) - offer.signingBonus)
    expect(q.commitLabel).toContain(talent.name.toUpperCase())
    expect(q.consequence).toContain(`Week ${String(week + 104)}`)
    expect(q.consequence).not.toMatch(/morale|loyalty|reputation/i)
    // A quote mutates nothing.
    expect(session.stateRevision).toBe(0)
    expect(session.gameState).toBe(state)

    const committed = submit(session, 'c-renew', q.intentId)
    expect(committed.accepted).toBe(true)
    const after = session.gameState
    const renewed = activeContract(after, open.talentId)!
    expect(renewed.startWeek).toBe(week)
    expect(renewed.termWeeks).toBe(104)
    expect(renewed.endWeekExclusive).toBe(week + 104)
    expect(renewed.annualSalary).toBe(offer.annualSalary)
    expect(renewed.signingBonus).toBe(offer.signingBonus)
    expect(Math.round(state.studio.cash - after.studio.cash)).toBe(offer.signingBonus)
    const bonusRows = ledgerRows(after, 'signingBonus', open.talentId).filter((row) => row.week === week)
    expect(bonusRows).toHaveLength(1)
    expect(bonusRows[0]!.note).toBe('renewal signing bonus')
    expect(session.stateRevision).toBe(1)
    // Duplicate command: the exact prior answer, no second debit.
    const replay = submit(session, 'c-renew', q.intentId, 0)
    expect(replay.accepted).toBe(true)
    expect(session.stateRevision).toBe(1)
    expect(session.gameState).toBe(after)
    // A re-used intent under a fresh command is not available (the quote died with its state).
    const reuse = submit(session, 'c-renew-2', q.intentId)
    expect(reuse.accepted).toBe(false)
    if (!reuse.accepted) expect(reuse.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(ledgerRows(session.gameState, 'signingBonus', open.talentId).filter((row) => row.week === week)).toHaveLength(1)
  })

  it('R2: a legal release carries the engine\'s termination cost, commits once, and keeps every recorded credit', () => {
    const state = founded('p10-r1-release')
    const week = state.market.tick
    const busy = new Set(writerOnTask(state).map((a) => a.talentId))
    const contract = state.contracts.find((c) => !busy.has(c.talentId))!
    const talentBefore = state.talent.find((t) => t.id === contract.talentId)!
    const cost = terminationCost(contract, week)
    const session = new BridgeSession(state, 'p10-r1-release')
    const quoted = quoteContract(session, 'q-release', { verb: 'release', talentId: contract.talentId, termWeeks: null })
    const q = quoted.quote
    expect(q.kind).toBe('releaseTalent')
    expect(q.ok).toBe(true)
    expect(q.verb).toBe('release')
    expect(q.terminationCost).toBe(cost)
    expect(q.guaranteedRemaining).toBe(Math.round(guaranteedComp(contract, week)))
    expect(q.cost).toBe(cost)
    expect(q.signingBonus).toBeNull()
    expect(q.cashAfter).toBe(Math.round(state.studio.cash) - cost)
    expect(q.consequence).toMatch(/free agent/)
    expect(q.consequence).toMatch(/stay on the record/)
    const committed = submit(session, 'c-release', q.intentId)
    expect(committed.accepted).toBe(true)
    const after = session.gameState
    expect(activeContract(after, contract.talentId)).toBeUndefined()
    expect(after.freeAgents).toContain(contract.talentId)
    expect(Math.round(state.studio.cash - after.studio.cash)).toBe(cost)
    const rows = ledgerRows(after, 'termination', contract.talentId)
    expect(rows).toHaveLength(1)
    expect(rows[0]!.amount).toBe(-cost)
    // Historical credit retention: the person, their work history and career events are untouched.
    const talentAfter = after.talent.find((t) => t.id === contract.talentId)!
    expect(talentAfter.workHistory).toEqual(talentBefore.workHistory)
    expect(after.careerEvents.filter((e) => e.talentId === contract.talentId)).toEqual(state.careerEvents.filter((e) => e.talentId === contract.talentId))
    const profile = peopleProjection(after).profiles.find((p) => p.talentId === contract.talentId)!
    // Released people re-enter the one post-founding market (P10-REQ-026): no contract, listed as a free agent.
    expect(after.freeAgents).toContain(contract.talentId)
    expect(profile.employment.status).not.toBe('contracted')
    expect(profile.employment.contract).toBeNull()
    expect(profile.career.rows).toEqual(peopleProjection(state).profiles.find((p) => p.talentId === contract.talentId)!.career.rows)
    // Only one debit, ever.
    const replay = submit(session, 'c-release', q.intentId, 0)
    expect(replay.accepted).toBe(true)
    expect(ledgerRows(session.gameState, 'termination', contract.talentId)).toHaveLength(1)
  })

  it('R3: a closed renewal window is an accepted ok:false answer whose id is never a commit', () => {
    const state = founded('p10-r1-closed')
    const id = contracted(state)[0]!
    const session = new BridgeSession(state, 'p10-r1-closed')
    const quoted = quoteContract(session, 'q-closed', { verb: 'renew', talentId: id, termWeeks: 52 })
    expect(quoted.quote.ok).toBe(false)
    expect(quoted.quote.startsNow).toBe(false)
    expect(quoted.quote.refusal).toBe('renewalWindowClosed')
    expect(quoted.quote.refusalReason).toMatch(/window is not open yet/)
    expect(quoted.quote.refusalRemedy).toMatch(/Week \d+/)
    expect(quoted.quote.renewalOpen).toBe(false)
    expect(quoted.quote.cost).toBe(0)
    const refused = submit(session, 'c-closed', quoted.quote.intentId)
    expect(refused.accepted).toBe(false)
    if (!refused.accepted) expect(refused.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(session.gameState).toBe(state)
    expect(session.stateRevision).toBe(0)
  })

  it('R4: a stale quote is refused once the authority moved on', () => {
    const state = intoWindow('p10-r1-stale')
    const week = state.market.tick
    const busy = new Set(writerOnTask(state).map((a) => a.talentId))
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const other = state.contracts.find((c) => c.talentId !== open.talentId && !busy.has(c.talentId))!
    const session = new BridgeSession(state, 'p10-r1-stale')
    const release = quoteContract(session, 'q-old', { verb: 'release', talentId: other.talentId, termWeeks: null })
    const renew = quoteContract(session, 'q-new', { verb: 'renew', talentId: open.talentId, termWeeks: 52 })
    expect(submit(session, 'c-new', renew.quote.intentId).accepted).toBe(true)
    expect(session.stateRevision).toBe(1)
    const stale = submit(session, 'c-old-stale', release.quote.intentId, 0)
    expect(stale.accepted).toBe(false)
    if (!stale.accepted) expect(stale.reasonCode).toBe('STALE_REVISION')
    const dead = submit(session, 'c-old-dead', release.quote.intentId, 1)
    expect(dead.accepted).toBe(false)
    if (!dead.accepted) expect(dead.reasonCode).toBe('INTENT_NOT_AVAILABLE')
    expect(activeContract(session.gameState, other.talentId)).toBeDefined()
    expect(ledgerRows(session.gameState, 'termination', other.talentId)).toHaveLength(0)
  })

  it('R5: unknown person is a draft refusal; no contract is an accepted refusal; a changed contract re-prices', () => {
    const state = intoWindow('p10-r1-changed')
    const week = state.market.tick
    const session = new BridgeSession(state, 'p10-r1-changed')
    const unknown = session.quote({ ...envelope(session, 'q-unknown'), type: 'quoteContract' as const, draft: { verb: 'release', talentId: 't-nobody', termWeeks: null } })
    expect(unknown.accepted).toBe(false)
    if (!unknown.accepted) expect(unknown.reasonCode).toBe('ENGINE_REJECTED')
    const free = state.talent.find((t) => activeContract(state, t.id) === undefined)!
    const noContract = quoteContract(session, 'q-free', { verb: 'release', talentId: free.id, termWeeks: null })
    expect(noContract.quote.ok).toBe(false)
    expect(noContract.quote.refusal).toBe('noActiveContract')
    expect(noContract.quote.currentEndWeekExclusive).toBeNull()
    expect(submit(session, 'c-free', noContract.quote.intentId).accepted).toBe(false)
    // Changed contract: price the release, renew instead, and the old release sheet is dead.
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const firstRelease = quoteContract(session, 'q-rel-1', { verb: 'release', talentId: open.talentId, termWeeks: null })
    const renew = quoteContract(session, 'q-ren', { verb: 'renew', talentId: open.talentId, termWeeks: 156 })
    expect(submit(session, 'c-ren', renew.quote.intentId).accepted).toBe(true)
    const secondRelease = quoteContract(session, 'q-rel-2', { verb: 'release', talentId: open.talentId, termWeeks: null })
    expect(secondRelease.quote.intentId).not.toBe(firstRelease.quote.intentId)
    expect(secondRelease.quote.terminationCost).not.toBe(firstRelease.quote.terminationCost)
    expect(secondRelease.quote.currentEndWeekExclusive).toBe(week + 156)
    const old = submit(session, 'c-rel-old', firstRelease.quote.intentId)
    expect(old.accepted).toBe(false)
  })

  it('R6: the engine\'s own refusals — unpublished term, the D-12 solvency gate, a screenplay task', () => {
    const state = intoWindow('p10-r1-refusals')
    const week = state.market.tick
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const session = new BridgeSession(state, 'p10-r1-refusals')
    const odd = session.quote({ ...envelope(session, 'q-odd'), type: 'quoteContract' as const, draft: { verb: 'renew', talentId: open.talentId, termWeeks: 60 } })
    expect(odd.accepted).toBe(false)
    if (!odd.accepted) expect(odd.message).toMatch(/published renewal terms/)
    // D-12: the same studio with no cash cannot pay the renewal bonus — the conversion's
    // accepted refusal (the session serves it as `ok:false`, the R3 wire path) and the
    // engine's own throw at commit agree. (Cash is forged here at the module level only:
    // the save law refuses to digest a ledger that does not reconcile, which is exactly why
    // a forged state can never reach the session.)
    const broke: GameState = { ...state, studio: { ...state.studio, cash: 0 } }
    const draft: BridgeContractDraftPayload = { verb: 'renew', talentId: open.talentId, termWeeks: 52 }
    const conversion = contractDraftToEngine(broke, draft)
    expect(conversion.ok && conversion.refusal?.code).toBe('insufficientFunds')
    if (conversion.ok) {
      const sheet = contractQuoteSnapshot(broke, draft, conversion, 'intent-broke')
      expect(sheet.ok).toBe(false)
      expect(sheet.refusal).toBe('insufficientFunds')
      expect(sheet.affordable).toBe(false)
      expect(sheet.startsNow).toBe(false)
      expect(sheet.refusalReason).toMatch(/cannot cover/)
      const applied = conversion.apply(broke)
      expect(applied.ok).toBe(false)
      expect(() => applyActions(broke, [{ kind: 'renewContract', talentId: open.talentId, termWeeks: 52 }])).toThrow(/D-12 solvency gate/)
    }
    // A writer at work on a screenplay cannot be released until the task closes (existing D-11.9 guard).
    const writer = state.talent.find((t) => t.role === 'writer' && activeContract(state, t.id) !== undefined)!
    const drafting = applyActions(state, [{ kind: 'commissionOriginalScreenplay', screenplay: originalPayload(writer.id, 'drama') }])
    expect(writerOnTask(drafting).some((a) => a.talentId === writer.id)).toBe(true)
    const taskSession = new BridgeSession(drafting, 'p10-r1-task')
    const refused = quoteContract(taskSession, 'q-task', { verb: 'release', talentId: writer.id, termWeeks: null })
    expect(refused.quote.ok).toBe(false)
    expect(refused.quote.refusal).toBe('onScreenplayTask')
    expect(refused.quote.refusalReason).toMatch(/Drafting/)
    expect(contractActionDecisions(drafting, writer.id).releaseAvailable).toBe(false)
    expect(submit(taskSession, 'c-task', refused.quote.intentId).accepted).toBe(false)
    expect(activeContract(taskSession.gameState, writer.id)).toBeDefined()
  })

  it('R7: cancellation is state-neutral — a quote without a commit changes nothing', () => {
    const state = intoWindow('p10-r1-cancel')
    const open = state.contracts.find((c) => renewalWindowOpen(c, state.market.tick))!
    const session = new BridgeSession(state, 'p10-r1-cancel')
    const digest = authoritativeDigest(state)
    const first = quoteContract(session, 'q-1', { verb: 'renew', talentId: open.talentId, termWeeks: 52 })
    const release = quoteContract(session, 'q-2', { verb: 'release', talentId: open.talentId, termWeeks: null })
    expect(first.quote.ok && release.quote.ok).toBe(true)
    expect(session.stateRevision).toBe(0)
    expect(session.gameState).toBe(state)
    expect(authoritativeDigest(session.gameState)).toBe(digest)
    expect(first.stateDigest).toBe(digest)
    // Asking again for the same draft on the same state mints the same intent (deterministic, opaque).
    const again = quoteContract(session, 'q-3', { verb: 'renew', talentId: open.talentId, termWeeks: 52 })
    expect(again.quote.intentId).toBe(first.quote.intentId)
    expect(again.quote).toEqual(first.quote)
  })
})
