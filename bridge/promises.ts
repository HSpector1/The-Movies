// P14B.1-T3 — the THIN Core promise surface (projection 45).
//
// ONE bridge module owns every promise fact Unity may read, so companion §2.1.5's
// narrowing has exactly one place to be right. Nothing here re-derives a promise
// fact of its own:
//   * WHAT A VIEWER MAY SEE is the engine's own `caseDisclosure` — the issuer's own
//     row carries the real draft (family, count, window, classification), every
//     competing row carries the literal `'UNKNOWN'` marker, before and after
//     settlement. This module passes that answer through and narrows nothing twice.
//   * WHETHER A DRAFTED PROMISE IS OFFERABLE is `promiseFeasibility` (§4.3): pure,
//     no RNG, committed state by reference. The verdict is a READ — it mutates
//     nothing, registers no intent and never echoes the drafted family back onto
//     the wire, so asking about a promise leaks nothing about one.
//   * WHAT A STUDIO PROMISED is `state.promises`, filtered to the VIEWING studio's
//     own BOUND rows (`contractId` set — the T2 ruling that a promise binds only
//     when its proposal is committed; an unbound promise is never evaluated, never
//     a trust driver, and therefore not a record anyone may read as one).
//
// P14B.2 reuses this same bound history for the case, Profile and workspace.
// Trust text and promise attention live in trust.ts; public outcomes in industry.ts.

import { allPromises, promiseFeasibility, waiverAccepted, waivePromise } from '../src/core/promises.ts'
import type { PromiseAttachment } from '../src/core/promises.ts'
import { caseDisclosure, caseForTalent, UNKNOWN } from '../src/core/talentMarket.ts'
import type { Disclosed, DisclosedPromise } from '../src/core/talentMarket.ts'
import type { GameState, PromiseClassification } from '../src/core/types.ts'
import type { ActionOutcome } from '../ui/src/engine/adapter.ts'
import type {
  BridgeMarketProposalPromiseDraftPayload, BridgeMarketPromiseHistoryRow,
  BridgePromiseWaiverDraftPayload, BridgePromiseWaiverQuoteSnapshot,
} from './schema/bridge-schema.ts'

/** One proposal's promise disclosure, as the viewing studio may lawfully read it:
 * the real draft for its own row, `null` when its own row attached none, and the
 * `'UNKNOWN'` marker for every competing row. */
export type MarketPromiseRow = {
  issuerStudioId: string
  promise: Disclosed<DisclosedPromise | null>
}

export type MarketPromiseHistoryRow = BridgeMarketPromiseHistoryRow

/** The wire draft (projection 47): the closed family-discriminated union — a
 * `LEAD_OR_SIGNIFICANT_ROLE_COUNT` draft carries its required `seatClass`, every
 * other family is count-only. */
export type WirePromiseDraft = BridgeMarketProposalPromiseDraftPayload

/** The ONE wire→core material conversion, shared by quote and attach: the kind
 * and the selected class travel together, only for the seat-class family. */
export function corePredicateOf(draft: WirePromiseDraft): PromiseAttachment['predicate'] {
  return 'seatClass' in draft
    ? { kind: 'castRoleCount', count: draft.count, seatClass: draft.seatClass }
    : { count: draft.count }
}

/** The quote-time draft. The window is checked against the PROPOSED contract, so
 * the proposal's own `startWeek` and `termWeeks` ride along. */
export type PromiseQuoteDraft = WirePromiseDraft & {
  startWeek: number
  termWeeks: number
}

export type PromiseQuoteVerdict = {
  ok: boolean
  classification: PromiseClassification
  message: string | null
}

/**
 * The per-proposal promise row for one case, as ONE studio may see it. The Profile
 * case block and the Talent Market comparison read the same rows (the comparison
 * already aliases the block's own `proposals` array by reference).
 *
 * `[]` means THIS WORLD HOLDS NO CASE for this person — the same absence
 * `marketCaseProjection` answers with `null` — not "no promises": a case with
 * proposals always returns one row per proposal, promise or no promise.
 */
export function promiseRowsFor(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  week: number = state.market.tick,
): MarketPromiseRow[] {
  if (caseForTalent(state, talentId, week) === null) return []
  return caseDisclosure(state, talentId, viewerStudioId, week).proposals
    .map((proposal) => ({ issuerStudioId: proposal.issuerStudioId, promise: proposal.promise }))
}

/**
 * The VIEWING studio's own promise record for this person: bound rows only, open
 * (`outcome: null`) and settled, newest mint first. A rival's
 * promise is never a row here — it is `'UNKNOWN'` on the proposal row and absent
 * everywhere else.
 */
export function promiseHistoryFor(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
): MarketPromiseHistoryRow[] {
  return allPromises(state)
    .flatMap((promise): MarketPromiseHistoryRow[] => {
      if (promise.issuerStudioId !== viewerStudioId
        || promise.beneficiaryPersonId !== talentId
        || promise.contractId === null) return []
      return [{
        promiseId: promise.promiseId,
        family: promise.family,
        count: promise.predicate.count,
        // The stored shape alone selects a class; a legacy classless P2 reads null.
        seatClass: 'kind' in promise.predicate ? promise.predicate.seatClass : null,
        windowStartWeek: promise.windowStartWeek,
        dueWeekExclusive: promise.dueWeekExclusive,
        contractId: promise.contractId,
        outcome: promise.outcome,
        outcomeWeek: promise.outcomeWeek,
        outcomeCause: promise.outcomeCause,
        // P14B.8: the TYPED successor link and the delivered part of the count. Both
        // are read straight off the stored row — this module derives neither.
        supersededByPromiseId: promise.supersededByPromiseId,
        progress: promise.progress,
      }]
    })
    .reverse()
}

/**
 * Is this promise offerable on this proposal, at this week? The §4.3 classification
 * verbatim, with the service's own bottleneck as the typed refusal sentence (Q1: no
 * override in B.1 — FRAGILE and IMPOSSIBLE are refused, never quietly downgraded).
 */
export function promiseQuoteSnapshot(
  state: GameState,
  issuerStudioId: string,
  talentId: string,
  draft: PromiseQuoteDraft,
  week: number = state.market.tick,
): PromiseQuoteVerdict {
  const receipt = promiseFeasibility(state, {
    family: draft.family,
    issuerStudioId,
    beneficiaryPersonId: talentId,
    predicate: corePredicateOf(draft),
    windowStartWeek: draft.windowStartWeek,
    dueWeekExclusive: draft.dueWeekExclusive,
    startWeek: draft.startWeek,
    termWeeks: draft.termWeeks,
  }, week)
  const ok = receipt.classification === 'REASONABLY_ACHIEVABLE'
  return {
    ok,
    classification: receipt.classification,
    message: ok ? null : `not offerable: ${String(receipt.bottleneck)}`,
  }
}

/** The own-row promise, unboxed. `UNKNOWN` cannot reach an own row (the engine sets
 * both from the same issuer test), so this is a type narrowing, not a fallback. */
export function unboxPromise(value: Disclosed<DisclosedPromise | null>): DisclosedPromise | null {
  return value === UNKNOWN ? null : value
}

// ── P14B.8 (projection 50) — THE WAIVER'S PLAYER ROUTE ───────────────────────
//
// B.7 built the law: a studio that can no longer keep an open promise offers the
// person a substitute, and on acceptance the original settles WAIVED while the
// substitute binds to the SAME employment contract in the same step. B.8 adds the
// route and NOTHING ELSE — no rule, no sentence and no version of the law moves.
//
// THE OWNERSHIP GATE lives here and only here. `waiverAccepted` and `waivePromise`
// compare no issuer: `waivePromise` resolves by id alone, ids are
// `promise-${promises.length}` (sequential, dense, trivially enumerable), and
// `substituteDraft` reads `issuerStudioId` off the promise, so a rival's waiver
// evaluates against the RIVAL's own pipeline and trust and looks entirely lawful.
// Measured, not argued: on `genuine-v31-with-edges`, `waiverAccepted` returns NULL
// for a rival-issued `promise-1` and `waivePromise` settles it. Because the engine
// publishes no sentence there, the refusal CANNOT be an accepted `ok:false` quote —
// there would be nothing to put in it. It is a conversion refusal, and it is
// deliberately WORD-FOR-WORD the refusal an unknown id gets, so the answer declines
// to confirm that a promise the player may not read about exists at all.
//
// The gate is the BRIDGE's because `waivePromise` is a pure verb whose caller
// supplies authority, and every other authority decision in this codebase is made at
// this boundary. `playerProposalDraft` is the same decision one step earlier: it
// FORCES `issuerStudioId` to the player rather than trusting the payload. A waiver
// has no such field to force, so the same decision can only be a refusal.

/** The wire draft (projection 50): one promise id plus one substitute, whose family
 * is APPEARANCE_COUNT or an explicitly classed LEAD_OR_SIGNIFICANT_ROLE_COUNT. */
export type WireWaiverDraft = BridgePromiseWaiverDraftPayload

export type PromiseWaiverConversionOk = {
  ok: true
  kind: 'waivePromise'
  /** The ORIGINAL, resolved from the id and PROVEN to be this studio's own. */
  promiseId: string
  talentId: string
  talentName: string
  substitute: PromiseAttachment
  seatClass: BridgePromiseWaiverQuoteSnapshot['seatClass']
  commitLabel: string
  /** `waiverAccepted`'s BARE sentence, or `null` when this person accepts. */
  refusal: string | null
  apply: (current: GameState) => ActionOutcome
}
export type PromiseWaiverConversion = { ok: false; error: string } | PromiseWaiverConversionOk

/** The ONE sentence for "not yours" and "no such thing". Naming which it was would
 * itself disclose whether a rival holds that id. */
function noSuchPromiseOfYours(promiseId: string): string {
  return `This studio has no promise ${JSON.stringify(promiseId)} on its record.`
}

function substituteTerms(count: number, seatClass: string | null): string {
  const noun = seatClass === null
    ? 'appearance'
    : seatClass === 'lead' ? 'lead role' : 'lead or antagonist role'
  return `${String(count)} ${noun}${count === 1 ? '' : 's'}`
}

/**
 * ONE module-level `apply`, not a fresh closure per conversion (the market-proposal
 * precedent): two conversions of the same draft on the same state must be
 * INDISTINGUISHABLE, and two distinct closures are never deeply equal. Called as a
 * METHOD, never detached. It re-runs the engine verb on CURRENT state; the
 * fail-closed re-check of ownership and acceptance happens in `quotedIntentFor`
 * BEFORE this is ever reached, so the namespaced throw never becomes player copy.
 */
function applyPromiseWaiver(this: PromiseWaiverConversionOk, current: GameState): ActionOutcome {
  return { ok: true, next: waivePromise(current, { promiseId: this.promiseId, substitute: this.substitute }) }
}

/** The ONLY conversion from a waiver draft to the engine. Pure: it asks
 * `waiverAccepted` (which mutates nothing) for the verdict and NEVER calls
 * `waivePromise` inside a `try` to ask a question — that would ship the engine's
 * `promises: …` namespace to a player and ask a mutating verb a read-only one. */
export function promiseWaiverDraftToEngine(state: GameState, draft: WireWaiverDraft): PromiseWaiverConversion {
  const promise = allPromises(state).find((candidate) => candidate.promiseId === draft.promiseId)
  // THE GATE. `hollywood` absent means no player studio is on the record, and
  // `string !== undefined` refuses — fail-closed, never a permissive default.
  if (promise === undefined || promise.issuerStudioId !== state.hollywood?.playerStudioId) {
    return { ok: false, error: noSuchPromiseOfYours(draft.promiseId) }
  }
  const talent = state.talent.find((candidate) => candidate.id === promise.beneficiaryPersonId)
  if (talent === undefined) {
    return { ok: false, error: `The person promise ${JSON.stringify(draft.promiseId)} was made to is not on this world's record.` }
  }
  const substitute: PromiseAttachment = {
    family: draft.substitute.family,
    predicate: corePredicateOf(draft.substitute),
    windowStartWeek: draft.substitute.windowStartWeek,
    dueWeekExclusive: draft.substitute.dueWeekExclusive,
  }
  const seatClass = 'seatClass' in draft.substitute ? draft.substitute.seatClass : null
  const terms = substituteTerms(draft.substitute.count, seatClass)
  return {
    ok: true,
    kind: 'waivePromise',
    promiseId: promise.promiseId,
    talentId: talent.id,
    talentName: talent.name,
    substitute,
    seatClass,
    commitLabel: `WAIVE PROMISE — ${talent.name.toUpperCase()} · SUBSTITUTE ${terms.toUpperCase()} BEFORE WEEK ${String(draft.substitute.dueWeekExclusive)}`,
    // Rule 9 reads the substitute against the REAL employment interval inside the
    // engine (`substituteDraft`), so the bridge re-derives no contract window of its
    // own: one that disagreed with the commit would be worse than none.
    refusal: waiverAccepted(state, promise, substitute, state.market.tick),
    apply: applyPromiseWaiver,
  }
}

/** The waiver consequence sheet Unity renders verbatim. It describes the
 * substitute's TERMS and never its id: that id is minted at COMMIT as
 * `promise-${promises.length}` and is wrong the moment another promise lands first. */
export function promiseWaiverQuoteSnapshot(
  conversion: PromiseWaiverConversionOk,
  intentId: string,
): BridgePromiseWaiverQuoteSnapshot {
  const { substitute, seatClass, refusal, talentName } = conversion
  const terms = substituteTerms(substitute.predicate.count, seatClass)
  return {
    intentId,
    kind: 'waivePromise',
    commitLabel: conversion.commitLabel,
    // A waiver settles and binds in the same accepted command. Nothing queues.
    startsNow: true,
    queues: false,
    queueNote: null,
    ok: refusal === null,
    refusalReason: refusal,
    promiseId: conversion.promiseId,
    talentId: conversion.talentId,
    family: substitute.family,
    count: substitute.predicate.count,
    seatClass,
    windowStartWeek: substitute.windowStartWeek,
    dueWeekExclusive: substitute.dueWeekExclusive,
    consequence: refusal === null
      ? `Settles your open promise to ${talentName} as waived and binds the substitute in its place — ${terms} between Week ${String(substitute.windowStartWeek)} and Week ${String(substitute.dueWeekExclusive - 1)}, on the same employment contract. Work already delivered is neither erased nor counted again. Nothing is charged, and this is not announced publicly.`
      : `Nothing is waived and nothing changes: ${refusal}.`,
  }
}
