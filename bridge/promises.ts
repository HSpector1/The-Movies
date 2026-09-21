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

import { allPromises, promiseFeasibility } from '../src/core/promises.ts'
import type { PromiseAttachment } from '../src/core/promises.ts'
import { caseDisclosure, caseForTalent, UNKNOWN } from '../src/core/talentMarket.ts'
import type { Disclosed, DisclosedPromise } from '../src/core/talentMarket.ts'
import type { GameState, PromiseClassification } from '../src/core/types.ts'
import type {
  BridgeMarketProposalPromiseDraftPayload, BridgeMarketPromiseHistoryRow,
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
