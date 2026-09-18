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
//
// RE-EXPRESSION (P14A.1-T3, 2026-09-18): R1, R4, R5, R6 and R7 fail on this
// tree — landed engine fact, reproduced directly by running this file
// unmodified: `applyActions: renewContract rejected — talent "…" is
// underMarketCase; submit a proposal for the decision week instead (P14A
// §2.1.3)` (src/core/actions.ts, applyRenewContract). Ruling: the REPEALED
// in-window renewal — under P14A.1 (Owner direction R6, plan T2 line) a
// person inside the renewal window is a market-case subject, and the
// incumbent renews by SUBMITTING THE INCUMBENT'S PROPOSAL
// (`marketProposalAction` propose/revise/withdraw over the bridge at
// projection 42; engine `submitProposal`), never by committing `renewContract`
// directly. `intoWindow()` below GUARANTEES this: its own `tick()` loop opens
// a market case the SAME tick a contract's renewal window opens (companion
// §2.1.3 discovery is part of the identical weekly pass), so there is no
// reachable in-window state, once the market is engaged, where renewContract
// still applies unconditionally.
//
// Each of the five cases is re-expressed ONCE, preserving its original claim
// wherever the law still supports it:
//   (i)   a claim about the renewal QUOTE/commit/stale-revision/cancellation
//         itself becomes the SAME claim over the proposal path — RED until
//         projection 42 lands (see `marketProposalDraftToEngine`'s import
//         comment below for why this is the same missing binding
//         tests/bridge-p14a1-market.test.ts pins, and why the session-level
//         quote()/command() dispatch is deliberately NOT used to reach it).
//   (ii)  a claim about a refusal that exists OUTSIDE the market (unknown
//         person, no contract, an unpublished term, a screenplay task in
//         progress) stays on the ORIGINAL verb/path and is GREEN now.
//   (iii) one new case (after R7) pins that in-window `renewContract` is
//         refused with the `underMarketCase` reason verbatim — GREEN now.
import { describe, expect, it } from 'vitest'

import { PROTOCOL_VERSION, SCHEMA_ID } from '../bridge/protocol.ts'
import { AVAILABLE_INTENT_KINDS, type BridgeContractDraftPayload } from '../bridge/schema/bridge-schema.ts'
import { BridgeSession, authoritativeDigest } from '../bridge/session.ts'
import {
  contractActionDecisions,
  contractTermLabel,
  // NOT YET EXISTING (P14A.1-T3 bridge test 9 — projection 42): the
  // `marketProposalAction` (propose/revise/withdraw) draft-to-engine
  // conversion. SAME missing binding, SAME module path, as
  // tests/bridge-p14a1-market.test.ts imports — importing a nonexistent named
  // export from this EXISTING module binds `undefined` (verified against this
  // tree via a disposable vite-node probe: no resolution failure, a TypeError
  // only when called), so this file loads and R0/R2/R3/the UNCHANGED portions
  // of R5/R6 below still run and pass; only the re-expressed (i)-bucket cases
  // that CALL it go RED, at the call, never at collection.
  marketProposalDraftToEngine,
} from '../bridge/contract.ts'
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
import { currentProposals, playerOffer } from '../src/core/talentMarket.js'
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

  it('R1 → re-expressed under R6: the incumbent\'s PROPOSAL reads the engine verbatim, commits once at the quoted bonus, and refuses replay / re-use', () => {
    // Original claim (unchanged): the renewal sheet reads the engine's own
    // price verbatim, a legal commit renews exactly once at that price, a
    // replayed command is the same answer, and a re-used intent dies with its
    // state. RE-EXPRESSED over the proposal path (see file header). RED until
    // projection 42 lands — `marketProposalDraftToEngine` is imported but not
    // yet exported (see its import comment above); this call is the RED cause.
    const state = intoWindow('p10-r1-renew')
    const week = state.market.tick
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const playerStudioId = state.hollywood!.playerStudioId
    // R1 (the studio-aware pricing entry): the SAME entry the repealed direct
    // renewContract commit priced through — playerOffer, floored per-studio.
    const offer = playerOffer(state, open.talentId, 104, week)

    const draft = marketProposalDraftToEngine(state, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 104, premiumTier: 1.0 })
    expect(draft.ok).toBe(true)
    if (!draft.ok) return
    expect(draft.annualSalary).toBe(offer.annualSalary)
    expect(draft.signingBonus).toBe(offer.signingBonus)

    const committed = draft.apply(state)
    expect(committed.ok).toBe(true)
    if (!committed.ok) return
    const mine = currentProposals(committed.next, open.talentId).find((p) => p.issuerStudioId === playerStudioId)!
    expect(mine.termWeeks).toBe(104)
    expect(mine.startWeek).toBe(open.endWeekExclusive) // the effective week is the OLD contract's endWeekExclusive (companion §2.1.3)
    expect(mine.annualSalary).toBe(offer.annualSalary)
    expect(mine.signingBonus).toBe(offer.signingBonus)

    // Duplicate commit: the exact prior answer, no second debit (submitProposal
    // replaces the studio's CURRENT proposal in place — at most one per studio).
    const replay = draft.apply(committed.next)
    expect(replay.ok).toBe(true)
    if (!replay.ok) return
    expect(currentProposals(replay.next, open.talentId).filter((p) => p.issuerStudioId === playerStudioId)).toHaveLength(1)
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

  it('R4 → re-expressed under R6: a proposal draft that is no longer legal on the live state is refused once the authority moved on', () => {
    // PREMISE NOT SATISFIED: the exact session-level STALE_REVISION /
    // INTENT_NOT_AVAILABLE reasonCode pairing (BridgeSession.command/quote)
    // for the NEW `marketProposalAction` intent kind is not independently
    // pinned here — routing a fabricated `type` string through the CURRENT
    // `session.quote()` falls through its fixed if/else chain to the FINAL
    // (casting) branch today, which would silently misinterpret the draft and
    // report an unrelated, confusing error — a harness trap, not a clean
    // "missing projection" RED (see tests/bridge-p14a1-market.test.ts's header
    // for the verified reason: `session.quote()` has no catch-all guard).
    // This case instead re-expresses the SAME underlying claim — an old,
    // no-longer-legal draft is refused, never silently honoured — at the
    // draft-conversion entry point, mirroring the EXISTING
    // `contractDraftToEngine` "commit revalidates" pattern verbatim (bridge/
    // contract.ts: "Commit revalidates: the same authorities, the live
    // state."). RED until projection 42 lands.
    const state = intoWindow('p10-r1-stale')
    const week = state.market.tick
    const busy = new Set(writerOnTask(state).map((a) => a.talentId))
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const other = state.contracts.find((c) => c.talentId !== open.talentId && !busy.has(c.talentId))!
    const playerStudioId = state.hollywood!.playerStudioId

    const staleDraft = marketProposalDraftToEngine(state, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(staleDraft.ok).toBe(true)
    if (!staleDraft.ok) return

    // The authority moves on: an UNRELATED person is released early — the
    // ORIGINAL R4 case's committed renewal served the same role (advancing
    // the live state). The old draft must still be honoured (sanity: it must
    // not over-refuse on an unrelated change).
    const unrelatedMoved = applyActions(state, [{ kind: 'releaseTalent', talentId: other.talentId }])
    const stillLegal = staleDraft.apply(unrelatedMoved)
    expect(stillLegal.ok).toBe(true)

    // Now the SUBJECT's own case is invalidated (released early — the exact
    // trigger companion §2.1.3 names). The OLD draft must fail closed.
    const invalidated = applyActions(state, [{ kind: 'releaseTalent', talentId: open.talentId }])
    const refused = staleDraft.apply(invalidated)
    expect(refused.ok).toBe(false)
  })

  it('R5: unknown person is a draft refusal; no contract is an accepted refusal; a changed PROPOSAL re-prices (re-expressed under R6)', () => {
    // UNCHANGED (bucket ii — these refusals live outside the market, on the
    // `release` verb, and still pass on this tree exactly as before): unknown
    // person is a draft refusal, and no contract is an accepted refusal.
    const state = intoWindow('p10-r1-changed')
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

    // RE-EXPRESSED (bucket i): "a changed contract re-prices" — the original
    // claim used a committed RENEWAL to change the sheet; that commit is
    // exactly what P14A.1 repeals in-window. Re-expressed as: the incumbent's
    // PROPOSAL is revised (propose, then revise to different terms), and the
    // revised sheet differs from the first. RED until projection 42 lands.
    const open = state.contracts.find((c) => renewalWindowOpen(c, state.market.tick))!
    const playerStudioId = state.hollywood!.playerStudioId
    const firstProposal = marketProposalDraftToEngine(state, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(firstProposal.ok).toBe(true)
    if (!firstProposal.ok) return
    const applied = firstProposal.apply(state)
    expect(applied.ok).toBe(true)
    if (!applied.ok) return
    const revisedProposal = marketProposalDraftToEngine(applied.next, { verb: 'revise', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 156, premiumTier: 1.0 })
    expect(revisedProposal.ok).toBe(true)
    if (!revisedProposal.ok) return
    expect(revisedProposal.termWeeks).not.toBe(firstProposal.termWeeks) // a genuinely changed sheet, not a coincidental tie
  })

  it('R6: the engine\'s own refusals — unpublished term, a screenplay task (UNCHANGED); D-12 on a PROPOSAL (re-expressed under R6)', () => {
    const state = intoWindow('p10-r1-refusals')
    const week = state.market.tick
    const open = state.contracts.find((c) => renewalWindowOpen(c, week))!
    const session = new BridgeSession(state, 'p10-r1-refusals')
    // UNCHANGED (bucket ii): an unpublished term is refused at the DRAFT level,
    // before any market-case check is reachable.
    const odd = session.quote({ ...envelope(session, 'q-odd'), type: 'quoteContract' as const, draft: { verb: 'renew', talentId: open.talentId, termWeeks: 60 } })
    expect(odd.accepted).toBe(false)
    if (!odd.accepted) expect(odd.message).toMatch(/published renewal terms/)

    // UNCHANGED (bucket ii): a writer at work on a screenplay cannot be
    // released — `releaseTalent` is not case-gated (only `renewContract` is;
    // P14A §2.1.3), so this refusal is untouched by the market.
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

    // RE-EXPRESSED (bucket i): the D-12 solvency gate, now asked on the
    // PROPOSAL path — a direct in-window `applyActions(renewContract)` D-12
    // throw is no longer reachable once the market is engaged (`intoWindow`
    // guarantees a case is already open the moment a contract is in-window —
    // see file header). RED until projection 42 lands. (Cash is forged here at
    // the module level only, exactly as the ORIGINAL R6 case did: the save law
    // refuses to digest a ledger that does not reconcile, which is exactly why
    // a forged state can never reach a real session.)
    const playerStudioId = state.hollywood!.playerStudioId
    const broke: GameState = { ...state, studio: { ...state.studio, cash: 0 } }
    const brokeDraft = marketProposalDraftToEngine(broke, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(brokeDraft.ok).toBe(true) // the DRAFT itself is legal; affordability (canAfford) is asked at commit, mirroring D-12
    if (!brokeDraft.ok) return
    const appliedBroke = brokeDraft.apply(broke)
    expect(appliedBroke.ok).toBe(false)
  })

  it('R7 → re-expressed under R6: cancellation is state-neutral for a PROPOSAL draft — drafting mutates nothing, and asking again is deterministic', () => {
    // RED until projection 42 lands.
    const state = intoWindow('p10-r1-cancel')
    const open = state.contracts.find((c) => renewalWindowOpen(c, state.market.tick))!
    const playerStudioId = state.hollywood!.playerStudioId
    const digest = authoritativeDigest(state)

    const draft = marketProposalDraftToEngine(state, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(draft.ok).toBe(true)
    expect(authoritativeDigest(state)).toBe(digest) // drafting mutates nothing — the same accepted invariant as every other draft family

    // Asking again for the same draft on the same state is deterministic.
    const again = marketProposalDraftToEngine(state, { verb: 'propose', talentId: open.talentId, issuerStudioId: playerStudioId, termWeeks: 52, premiumTier: 1.0 })
    expect(again).toEqual(draft)
  })

  it('R6 ruling, ADDED (iii): in-window renewContract is now refused — the market-case redirect (P14A §2.1.3), verbatim', () => {
    const state = intoWindow('p10-r1-market-case-redirect')
    const open = state.contracts.find((c) => renewalWindowOpen(c, state.market.tick))!
    expect(() => applyActions(state, [{ kind: 'renewContract', talentId: open.talentId, termWeeks: 52 }]))
      .toThrow(`applyActions: renewContract rejected — talent "${open.talentId}" is underMarketCase; submit a proposal for the decision week instead (P14A §2.1.3)`)
  })
})
