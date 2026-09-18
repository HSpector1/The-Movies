// ── P14A.1 — One Contested Expiry Core ───────────────────────────────────────
//
// THE CONTESTED TALENT MARKET. A PURE module (like employment/talentSummary): no
// React/DOM/async/IO, no time, no unseeded entropy, no RNG at all — the person's
// choice is deterministic, versioned and replayable by ruling (§3.4.1 direction 4
// / S25: "no hidden poaching dice").
//
// Authority: docs/engineering/playability-launch-review/plans/P14-HEADLESS-PLAN.md
// ("P14A.1 — One Contested Expiry Core"), and by reference
// docs/engineering/p14-preparation-8ef5246a/P14-PREPARATION-COMPANION.md
// §2.1.2–§2.1.8 and §3.2/§3.5, and CODEX-P13-P15-OWNER-RULINGS.md §3.4.1
// directions 1–4, 8 and 14.
//
// WHAT THIS MODULE DOES NOT OWN (direction 14, never duplicated here):
//   P10 the person, the contract and its price (`employment.ts`, `actions.ts`)
//   P12 studio identity, the current employer, one-employer exclusivity and the
//       employer intervals (`hollywood.ts`, `industryEmployment.ts`)
//   P11 money, the ledger and the forecasts
// Everything those owners already hold is DERIVED on read, never copied. The one
// reference this root persists is a `contractId`: the decision week is read LIVE
// off the P12 employment row it names, so a case can never disagree with the
// contract it is about.
//
// ENGAGEMENT. The market engages exactly when the industry root exists
// (`state.hollywood !== null`), for the same reason `employmentEngaged` and
// `economyEngaged` exist: eligibility is defined over P12 employer facts and the
// set of ENTERED studios, and a world with no industry has neither. The headless
// M0A corpus and the roster-wall observatory (both `hollywood: null`) therefore
// stay byte-identical, and no case, proposal or receipt is ever minted there.

import { rivalEmployment, rivalWeeklyOperatingCost, moveRivalMoney } from './hollywood.js'
import { RIVAL_TEAM_ROLES } from './hollywoodStartingData.js'
import { recordPlayerEmployment } from './industryEmployment.js'
import { activeContract, canAfford, contractOffer, guaranteedComp, renewalWindowOpen, terminationCost } from './employment.js'
import type { ContractOffer, TerminationLaw } from './employment.js'
import { attachedPromiseDigest, promiseFeasibility, proposalDigest, trustDescriptor } from './promises.js'
import { careerIdentity } from './talentSummary.js'
import { TUNING } from './tuning.js'
import type { Contract, GameState, LedgerEntry, LegacyTermination, MarketCaseStatus, MarketEligibilityStatus,
  PromiseClassification, PromiseFamily,
  Standing, TalentMarketCase, TalentMarketProposal, TalentMarketReceipt, TalentMarketState } from './types.js'
import type { HollywoodState, IndustryEmployment, IndustryReceipt, RivalBusiness } from './hollywoodTypes.js'

const iround = (x: number): number => Math.round(x)

/** The empty root. A world that has held no case, no proposal and no receipt. */
export function initialTalentMarket(): TalentMarketState {
  return { cases: [], proposals: [], receipts: [], legacyTerminations: [], representation: null }
}

// ── engagement ───────────────────────────────────────────────────────────────

export function talentMarketEngaged(state: Pick<GameState, 'hollywood'>): boolean {
  return state.hollywood !== null
}

/** Every studio that has actually ENTERED. A reserved rival (`enteredWeek === null`)
 * is not in the world yet and cannot propose (companion §2.1.2). Row order. */
export function enteredStudioIds(hollywood: HollywoodState | null): string[] {
  return (hollywood?.identities ?? []).filter((s) => s.enteredWeek !== null).map((s) => s.studioId)
}

// ── §2.1.2 market eligibility (direction 4) ──────────────────────────────────

export type MarketEligibility = { status: MarketEligibilityStatus; proposers: string[] }

/**
 * The six-state table. Eligibility reads `rivalEmployment` / the player contract
 * and the contract WINDOW — never the `employmentStatus` string, which says
 * `unavailable` both for rival-employed and for off-rotation people.
 *
 * The three P14C rows (`retirement_announced`, `finishing_commitments`,
 * `retired_or_ineligible`) are declared in the type and are NOT reachable before
 * P14C: no accepted engine path announces a retirement or commits a lifecycle
 * transition, and this classifier invents neither.
 */
export function marketEligibility(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): MarketEligibility {
  const entered = enteredStudioIds(state.hollywood)
  const terms = subjectTerms(state, talentId, week)
  // Free agents (expired, released early, never employed) stay INSTANT-SIGN in
  // Core (R26): any entered studio may pursue them immediately — there is no
  // case, no deadline and no person choice on that path.
  if (terms === undefined) return { status: 'free_agent', proposers: entered }
  // No in-term approaches, no hidden tampering: outside the window nobody may propose.
  if (!renewalWindowOpen(terms, week)) return { status: 'contracted_outside_window', proposers: [] }
  return { status: 'renewal_window', proposers: entered }
}

/** The subject's live contract terms at `week`, from whichever owner holds them. */
function subjectTerms(state: GameState, talentId: string, week: number): Contract | undefined {
  return activeContract(state, talentId, week) ?? rivalEmployment(state, talentId, week)?.terms
}

// ── §2.1.3 the case ──────────────────────────────────────────────────────────

export type MarketCaseView = {
  talentId: string
  subjectTalentId: string
  subjectStudioId: string
  contractId: string
  status: MarketCaseStatus
  /** DERIVED on read from the live employment row this case names. Never a stored copy. */
  decisionWeek: number
  openedWeek: number
}

function employmentRow(state: GameState, contractId: string): IndustryEmployment | undefined {
  return state.hollywood?.employment.find((e) => e.contractId === contractId)
}

/** The decision week: the subject's `endWeekExclusive`, read LIVE off the P12 row. */
function decisionWeekOf(state: GameState, kase: TalentMarketCase): number {
  const row = employmentRow(state, kase.contractId)
  if (row === undefined) {
    throw new Error(`talentMarket: case for "${kase.talentId}" names employment row "${kase.contractId}", which does not exist`)
  }
  return row.terms.endWeekExclusive
}

/**
 * Invalidation, DERIVED so an action's effect is visible before the next tick:
 * the subject's interval closed EARLY (a release under §3 — the person is a free
 * agent now). An interval closed AT the decision week is an ordinary expiry, not
 * an invalidation, which is exactly the week settlement runs.
 */
function releasedEarly(state: GameState, kase: TalentMarketCase): boolean {
  const row = employmentRow(state, kase.contractId)
  return row !== undefined && row.endedWeek !== null && row.endedWeek < row.terms.endWeekExclusive
}

function caseStatusAt(state: GameState, kase: TalentMarketCase, week: number): MarketCaseStatus {
  if (kase.outcome !== null) return kase.outcome
  if (releasedEarly(state, kase)) return 'invalidated'
  if (week >= decisionWeekOf(state, kase)) return 'decision_pending'
  return week <= kase.openedWeek ? 'discovered' : 'proposals_open'
}

function latestCase(state: GameState, talentId: string): TalentMarketCase | undefined {
  const rows = state.talentMarket.cases.filter((c) => c.talentId === talentId)
  return rows[rows.length - 1]
}

/** The case for this person, or null. `status` and `decisionWeek` are derived. */
export function caseForTalent(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): MarketCaseView | null {
  const kase = latestCase(state, talentId)
  if (kase === undefined) return null
  return {
    talentId: kase.talentId,
    subjectTalentId: kase.talentId,
    subjectStudioId: kase.subjectStudioId,
    contractId: kase.contractId,
    status: caseStatusAt(state, kase, week),
    decisionWeek: decisionWeekOf(state, kase),
    openedWeek: kase.openedWeek,
  }
}

/** True while this person's case is OPEN — the predicate `staff()` and
 * `applyRenewContract` consult. The exclusion lands with the case-open check,
 * not with settlement, so it stands for the whole open-case span. */
export function caseOpenForTalent(state: GameState, talentId: string, week: number = state.market.tick): boolean {
  const view = caseForTalent(state, talentId, week)
  return view !== null && !TERMINAL.has(view.status)
}

const TERMINAL = new Set<MarketCaseStatus>(['settled', 'declined', 'expired', 'invalidated'])

// ── §2.1.4 the draft, the premium tier and the studio-aware price ────────────

/** The premium tier enum. `1.00` is the plain ask and the FLOOR; a below-ask tier
 * is not offered in P14A (companion §2.1.7 reservation). */
export function isPremiumTier(tier: number): boolean {
  return TUNING.MARKET_PREMIUM_TIERS.some((t) => t === tier)
}

/**
 * R1 (companion §3.5) — the persistent salary expectation toward the RELEASING
 * studio. Read from the records that NAME a termination, never inferred from row
 * shape: the P12 end receipt with reason `termination` keyed to the exact
 * `contractId`, joined (for the player) to the unconditional P10 `termination`
 * ledger row `applyReleaseTalent` writes. The floor is the HIGHEST of the
 * studio's unexpired memories for that person, each valid until its OWN
 * contract's original `endWeekExclusive`. No new persisted fact.
 */
export function releaseFloor(
  state: GameState,
  releasingStudioId: string,
  talentId: string,
  week: number = state.market.tick,
): { floorAnnual: number; validUntilWeek: number } | null {
  const hollywood = state.hollywood
  if (hollywood === null) return null
  let best: { floorAnnual: number; validUntilWeek: number } | null = null
  for (const receipt of hollywood.receipts) {
    if (receipt.kind !== 'employment' || receipt.reason !== 'termination') continue
    if (receipt.studioId !== releasingStudioId || receipt.talentId !== talentId) continue
    // The player's release always writes its own ledger row; that row is the
    // evidence of record for the one-batch edge the mirror can still miss.
    if (releasingStudioId === hollywood.playerStudioId &&
      !state.ledger.some((row) => row.kind === 'termination' && row.talentId === talentId && row.week === receipt.week)) continue
    const row = hollywood.employment.find((e) => e.contractId === receipt.contractId)
    if (row === undefined) continue
    const validUntilWeek = row.terms.endWeekExclusive
    if (week >= validUntilWeek) continue // the memory lapsed with the original term
    if (best === null || row.terms.annualSalary > best.floorAnnual) {
      best = { floorAnnual: row.terms.annualSalary, validUntilWeek }
    }
  }
  return best
}

/**
 * The ONE studio-aware pricing entry of companion §2.1.4: the shared P10 ask,
 * floored by R1 for the studio that released this person, BEFORE any premium
 * tier. `offerForTalent` itself stays floor-free, so the stateless Full-Custom
 * preview is unchanged.
 */
export function studioOffer(
  state: GameState,
  studioId: string,
  talentId: string,
  termWeeks: number,
  week: number = state.market.tick,
): ContractOffer {
  const offer = contractOffer(state, talentId, termWeeks, week)
  const floor = releaseFloor(state, studioId, talentId, week)
  if (floor === null || floor.floorAnnual <= offer.annualSalary) return offer
  // The bonus is the same published fraction of the annual everywhere (§2.1.4 /
  // `offerForTalent`), so a floored annual carries a floored bonus.
  return {
    ...offer,
    annualSalary: floor.floorAnnual,
    signingBonus: iround(floor.floorAnnual * TUNING.CONTRACT_SIGNING_BONUS_FRACTION),
  }
}

/**
 * The PLAYER studio's studio-aware ask: the one entry every player quote and
 * every player contract action prices through, so what is shown and what is
 * charged cannot diverge (R1, companion §3.5 / §2.1.4).
 */
export function playerOffer(
  state: GameState,
  talentId: string,
  termWeeks: number,
  week: number = state.market.tick,
): ContractOffer {
  // No industry root means no P12 employment row a floor could be read from, so
  // the ask IS the plain market ask — by law (the market engages iff
  // `state.hollywood !== null`), not as a fallback.
  return state.hollywood === null
    ? contractOffer(state, talentId, termWeeks, week)
    : studioOffer(state, state.hollywood.playerStudioId, talentId, termWeeks, week)
}

/** The bounded term alternatives (D-11.6), priced through `playerOffer`. */
export function playerOfferOptions(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): ContractOffer[] {
  return TUNING.CONTRACT_TERM_OPTIONS.map((t) => playerOffer(state, talentId, t, week))
}

export type ProposalDraft = {
  talentId: string
  issuerStudioId: string
  termWeeks: number
  premiumTier: number
  annualSalary: number
  signingBonus: number
  startWeek: number
  endWeekExclusive: number
  digest: string
}

/** The effective week a proposal starts: the open case's decision week (the old
 * contract's `endWeekExclusive`), so the incumbent's renewal IS a proposal. */
function effectiveWeekFor(state: GameState, talentId: string, week: number): number {
  const view = caseForTalent(state, talentId, week)
  return view === null ? week : view.decisionWeek
}

/**
 * A proposal REFERENCES a P10-priced draft: it stores (talentId, termWeeks,
 * startWeek, premiumTier) plus a DIGEST of the derived offer, and re-derives the
 * terms through the shared entry at settlement. A material-term change mints a
 * new digest, which invalidates the prior version.
 */
export function proposalDraft(
  state: GameState,
  issuerStudioId: string,
  talentId: string,
  termWeeks: number,
  premiumTier: number,
  week: number = state.market.tick,
  /** P14B.1 (3): the attached promises' own digest, `''` when none is attached. */
  promisePart = '',
): ProposalDraft {
  if (!isPremiumTier(premiumTier)) {
    throw new Error(
      `talentMarket: premium tier ${premiumTier} is not offered — P14A prices at ${TUNING.MARKET_PREMIUM_TIERS.join(', ')} and never below the ask (companion §2.1.4/§2.1.7)`,
    )
  }
  const ask = studioOffer(state, issuerStudioId, talentId, termWeeks, week)
  const annualSalary = iround(ask.annualSalary * premiumTier)
  const signingBonus = iround(annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION)
  const startWeek = effectiveWeekFor(state, talentId, week)
  return {
    talentId,
    issuerStudioId,
    termWeeks: ask.termWeeks,
    premiumTier,
    annualSalary,
    signingBonus,
    startWeek,
    endWeekExclusive: startWeek + ask.termWeeks,
    // MATERIAL terms only (companion §2.1.4), WIDENED by P14B.1 (3) with the
    // attached promise. Price is DERIVED, never material: ordinary drift between
    // submission and the decision week must not invalidate a version. A proposal
    // carrying NO promise digests byte-identically to its V28 self, so every
    // migrated proposal re-derives its stored digest unchanged.
    digest: proposalDigest(talentId, issuerStudioId, ask.termWeeks, startWeek, premiumTier, promisePart),
  }
}

/**
 * The proposal's price AT `week`, re-derived from its MATERIAL terms through the
 * same shared pricing entry the draft used (companion §2.1.4: "re-derives the six
 * accepted terms through the shared pricing entry at review and at settlement").
 * This is the ONE re-derivation reservation, affordability, ranking, the commit
 * and every "current price" read share; the price stored on the persisted
 * proposal is the submission-week QUOTE and is never read here.
 */
function proposalPriceAt(
  state: GameState,
  proposal: Pick<TalentMarketProposal, 'talentId' | 'issuerStudioId' | 'termWeeks' | 'premiumTier'>,
  week: number,
): { askAnnual: number; annualSalary: number; signingBonus: number } {
  const ask = studioOffer(state, proposal.issuerStudioId, proposal.talentId, proposal.termWeeks, week)
  const annualSalary = iround(ask.annualSalary * proposal.premiumTier)
  return { askAnnual: ask.annualSalary, annualSalary, signingBonus: iround(annualSalary * TUNING.CONTRACT_SIGNING_BONUS_FRACTION) }
}

// ── affordability (companion §2.1.4; neither rule is P11's) ──────────────────

function rivalOperatingReserve(business: RivalBusiness, hollywood: HollywoodState, week: number): number {
  return rivalWeeklyOperatingCost(business, hollywood, week) * business.policy.reserveWeeks
}

/** The player's bonus passes the accepted D-12 `canAfford` legality gate; the
 * rival's passes its own reserve rule (P12 strategy). */
function affordabilityRefusal(state: GameState, issuerStudioId: string, bonus: number, week: number): string | null {
  const hollywood = state.hollywood!
  if (issuerStudioId === hollywood.playerStudioId) {
    const affordable = canAfford(state, bonus)
    return affordable.ok ? null : `${affordable.reason} (D-12 solvency gate)`
  }
  const business = hollywood.businesses.find((b) => b.studioId === issuerStudioId)
  if (business === undefined) return `studio "${issuerStudioId}" has no business account`
  const reserve = rivalOperatingReserve(business, hollywood, week)
  return business.account.cash - bonus >= reserve
    ? null
    : `the signing bonus would leave "${issuerStudioId}" under its operating reserve`
}

// ── proposals: at most one CURRENT per studio, revised in place ──────────────

export type ProposalIntent = {
  talentId: string
  issuerStudioId: string
  termWeeks: number
  premiumTier: number
}

function requireOpenCase(state: GameState, talentId: string, week: number): MarketCaseView {
  if (!talentMarketEngaged(state)) throw new Error('talentMarket: no industry — the market is not engaged')
  const view = caseForTalent(state, talentId, week)
  if (view === null || TERMINAL.has(view.status)) {
    throw new Error(`talentMarket: no open market case for "${talentId}" — free agents are signed directly, and nobody may approach a person in term`)
  }
  return view
}

function appendReceipt(
  market: TalentMarketState,
  draft: Omit<TalentMarketReceipt, 'eventId' | 'dropped'> & { dropped?: readonly string[] },
): TalentMarketState {
  return {
    ...market,
    receipts: [...market.receipts, { ...draft, dropped: draft.dropped ?? [], eventId: `talent-market-event-${market.receipts.length}` }],
  }
}

export function submitProposal(state: GameState, intent: ProposalIntent): GameState {
  const week = state.market.tick
  requireOpenCase(state, intent.talentId, week)
  const eligible = marketEligibility(state, intent.talentId, week)
  if (!eligible.proposers.includes(intent.issuerStudioId)) {
    throw new Error(`talentMarket: studio "${intent.issuerStudioId}" may not propose for "${intent.talentId}" — it has not entered, or the person is not in an approved window`)
  }
  const draft = proposalDraft(state, intent.issuerStudioId, intent.talentId, intent.termWeeks, intent.premiumTier, week)
  const refusal = affordabilityRefusal(state, intent.issuerStudioId, draft.signingBonus, week)
  if (refusal !== null) throw new Error(`talentMarket: proposal rejected — ${refusal}`)
  const proposal: TalentMarketProposal = {
    talentId: draft.talentId,
    issuerStudioId: draft.issuerStudioId,
    termWeeks: draft.termWeeks,
    premiumTier: draft.premiumTier,
    startWeek: draft.startWeek,
    annualSalary: draft.annualSalary,
    signingBonus: draft.signingBonus,
    submittedWeek: week,
    digest: draft.digest,
    // A re-submission is this codebase's own "revise in place": the fresh
    // proposal restores the material terms and carries NO promise, so removing a
    // promise is exactly a re-submit with nothing attached.
    promises: [],
    representation: null,
  }
  const others = state.talentMarket.proposals.filter(
    (p) => !(p.talentId === intent.talentId && p.issuerStudioId === intent.issuerStudioId),
  )
  const market = appendReceipt(
    { ...state.talentMarket, proposals: [...others, proposal] },
    { kind: 'proposalSubmitted', week, talentId: intent.talentId, studioId: intent.issuerStudioId, reasons: [] },
  )
  return { ...state, talentMarket: market }
}

export function withdrawProposal(state: GameState, talentId: string, issuerStudioId: string): GameState {
  const others = state.talentMarket.proposals.filter((p) => !(p.talentId === talentId && p.issuerStudioId === issuerStudioId))
  if (others.length === state.talentMarket.proposals.length) {
    throw new Error(`talentMarket: studio "${issuerStudioId}" has no current proposal for "${talentId}" to withdraw`)
  }
  return { ...state, talentMarket: { ...state.talentMarket, proposals: others } }
}

export function currentProposals(state: GameState, talentId: string): readonly TalentMarketProposal[] {
  return state.talentMarket.proposals.filter((p) => p.talentId === talentId)
}

// ── §2.1.5 disclosure: what is lawfully known, and what says UNKNOWN ─────────

export const UNKNOWN = 'UNKNOWN' as const
export type Disclosed<T> = T | typeof UNKNOWN

/** P14B.1: what an attached promise says to its OWN issuer. Ordering-only facts
 * (family, count, window, classification) — never a salary term, never free text. */
export type DisclosedPromise = {
  family: PromiseFamily
  count: number
  windowStartWeek: number
  dueWeekExclusive: number
  classification: PromiseClassification
}

export type DisclosedProposal = {
  issuerStudioId: string
  submittedWeek: number
  termWeeks: number
  effectiveWeek: number
  premiumTier: Disclosed<number>
  annualSalary: Disclosed<number>
  signingBonus: Disclosed<number>
  /** §2.1.5 row "the competing proposal's attached promises": UNKNOWN to every
   * non-issuer, before and after settlement. The issuer's own row carries the
   * real draft, or `null` when it attached none. */
  promise: Disclosed<DisclosedPromise | null>
}

export type CaseDisclosure = {
  subjectTalentId: string
  subjectStudioId: string
  status: MarketCaseStatus
  decisionWeek: number
  proposals: DisclosedProposal[]
  /** Order-only, after settlement. Never an amount. */
  settlementReasons: readonly string[]
}

/**
 * The authored NARROWING of the accepted blanket rule that rival contract terms
 * are private. Public: that a case exists, its subject and its decision week;
 * that a competing proposal exists, from which studio, since which week; its term
 * length and effective week. PRIVATE, before and after settlement: the premium
 * tier, the salary and the bonus — every non-issuer's row says literally
 * `'UNKNOWN'`. No band, estimate or rumor is invented, and no private figure is
 * carried anywhere else in this DTO (the digest is deliberately absent).
 */
export function caseDisclosure(
  state: GameState,
  talentId: string,
  viewerStudioId: string,
  week: number = state.market.tick,
): CaseDisclosure {
  const view = caseForTalent(state, talentId, week)
  if (view === null) throw new Error(`talentMarket: no case for "${talentId}" to disclose`)
  const settlement = [...state.talentMarket.receipts].reverse().find((r) => r.talentId === talentId && r.kind === 'settled')
  return {
    subjectTalentId: view.subjectTalentId,
    subjectStudioId: view.subjectStudioId,
    status: view.status,
    decisionWeek: view.decisionWeek,
    proposals: currentProposals(state, talentId).map((p) => {
      const mine = p.issuerStudioId === viewerStudioId
      // The issuer's own figures are the price RE-DERIVED at the read week — the
      // same number settlement will commit — never the submission-week quote.
      const priced = mine ? proposalPriceAt(state, p, week) : null
      return {
        issuerStudioId: p.issuerStudioId,
        submittedWeek: p.submittedWeek,
        termWeeks: p.termWeeks,
        effectiveWeek: p.startWeek,
        premiumTier: mine ? p.premiumTier : UNKNOWN,
        annualSalary: priced === null ? UNKNOWN : priced.annualSalary,
        signingBonus: priced === null ? UNKNOWN : priced.signingBonus,
        promise: mine ? disclosedPromise(state, p) : UNKNOWN,
      }
    }),
    settlementReasons: settlement?.reasons ?? [],
  }
}

/** The issuer's OWN attached promise, as facts rather than prose. At most one
 * rides a proposal in B.1, so this reads the first and only member. */
function disclosedPromise(state: GameState, proposal: TalentMarketProposal): DisclosedPromise | null {
  const id = proposal.promises[0]
  if (id === undefined) return null
  const promise = state.promises.find((p) => p.promiseId === id)
  if (promise === undefined) return null
  return {
    family: promise.family,
    count: promise.predicate.count,
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    classification: promise.feasibilityReceipt.classification,
  }
}

// ── §3 firing: the recalibrated charge, disclosed per direction 2 ────────────

export type ReleaseDisclosure = {
  remainingWeeks: number
  remainingGuaranteedCompensation: number
  capApplies: boolean
  charge: number
  effectiveEndWeek: number
  /** "every other authoritative consequence" — order-only facts, no amounts. */
  consequences: readonly string[]
}

/**
 * The confirmation's disclosure content (rulings §3.4.1 direction 2; companion
 * §3.4), in its TWO exact branches: the cap applies (more than 26 weeks remain)
 * or it does not (the charge is all remaining guaranteed pay). The free-text
 * copy itself is bridge-owned; these are the facts it must state.
 */
export function releaseDisclosure(
  state: GameState,
  talentId: string,
  week: number = state.market.tick,
): ReleaseDisclosure {
  const contract = activeContract(state, talentId, week)
  if (contract === undefined) {
    throw new Error(`talentMarket: "${talentId}" has no active contract to release (D-11.9)`)
  }
  const remainingWeeks = Math.max(0, contract.endWeekExclusive - week)
  const capApplies = remainingWeeks > TUNING.HIRING_TERMINATION_CAP_WEEKS
  const consequences = [
    capApplies
      ? 'the cap applies: the charge is twenty-six weeks of pay, not the whole remaining guarantee'
      : 'no cap applies: fewer than twenty-six weeks remain, so the charge is all remaining guaranteed pay',
    'the charge is paid now and may take cash negative — release is not solvency-gated',
    'they leave the roster this week as a free agent; any entered studio may sign them at once',
    'they ask no less than this contract’s salary from this studio until its original end week',
    'their open market case closes and every competing proposal is invalidated',
    'the release is published this week as a public employment transition',
    'recorded credits and career history stay on the record',
  ]
  return {
    remainingWeeks,
    remainingGuaranteedCompensation: guaranteedComp(contract, week),
    capApplies,
    charge: terminationCost(contract, week),
    effectiveEndWeek: week,
    consequences,
  }
}

// ── §2.1.4 the rival proposal trigger (a PURE P12 policy) ────────────────────

export type MarketCaseDescriptor = {
  talentId: string
  subjectStudioId: string
  decisionWeek: number
}

/**
 * The pure policy function P12 evaluates inside its own weekly decision, over a
 * case description P14 hands it. P14 owns and stores the proposal record; this
 * function decides nothing else and touches no state.
 *
 * The rival proposes when:
 *   (a) the subject is its OWN person in the window (the incumbent-rival proposal)
 *   (b) it holds a same-role contract ending at or before the subject's effective week
 *   (c) it has a seat deficit at that role at the effective week
 *
 * A policy-driven "upgrade" that would require releasing a current employee needs
 * the Ready rival-termination path (§3.6) and is not in Core. No RNG.
 *
 * ponytail: linear scans of `state.talent` per employment row — O(roster x people)
 * per (case, studio) pair on a weekly pass. Fine at the accepted world size (60
 * people, 4 entered studios); index by PersonId if a century-scale profile ever
 * shows this pass in the weekly-advance budget (R25).
 */
export function rivalProposalTrigger(
  state: GameState,
  hollywood: HollywoodState,
  business: RivalBusiness,
  descriptor: MarketCaseDescriptor,
  week: number,
): boolean {
  if (descriptor.subjectStudioId === business.studioId) return true // (a)
  const role = state.talent.find((t) => t.id === descriptor.talentId)?.role
  if (role === undefined) return false
  const own = hollywood.activeEmploymentOrdinals
    .map((i) => hollywood.employment[i]!)
    .filter((e) => e.studioId === business.studioId && e.terms.talentId !== descriptor.talentId &&
      e.terms.startWeek <= week && (e.endedWeek === null || week < e.endedWeek))
  const sameRole = own.filter((e) => state.talent.find((t) => t.id === e.terms.talentId)?.role === role)
  if (sameRole.some((e) => e.terms.endWeekExclusive <= descriptor.decisionWeek)) return true // (b)
  const required = RIVAL_TEAM_ROLES.filter((r) => r === role).length
  const heldAtEffectiveWeek = sameRole.filter((e) => e.terms.endWeekExclusive > descriptor.decisionWeek).length
  return heldAtEffectiveWeek < required // (c)
}

// ── §2.1.7 the person-choice rule ────────────────────────────────────────────
//
// Deterministic, versioned, replayable, no RNG, not a single exposed formula, and
// NEVER dependent on array order, Map/Set order, `PersonId` lexical order or
// `StudioIdentity.row`. Each surviving proposal is scored on typed descriptors,
// each reduced to a small BAND so near-equal offers TIE rather than differ by a
// dollar; every band difference produces a typed, ordering-only reason.
//
// D3 (opportunity) and D4 (trust) GO LIVE with P14B.1: a promise and a trust
// record are now real facts. D5 (relationships) stays NEUTRAL — no relationship
// fact exists yet, so it would tie for every pair and is omitted rather than
// faked. It arrives with P14B.2.
//
// The band edges below marked HYPOTHESIS are NUMERICAL/CONTENT HYPOTHESIS per the
// companion, not settled law; the RULE (bands, pairwise wins, dominance, the
// public priority order) is what is settled.

const DESCRIPTOR_ORDER = ['compensation', 'term', 'opportunity', 'trust', 'standing', 'incumbency'] as const
export type DescriptorKey = (typeof DESCRIPTOR_ORDER)[number]

const DESCRIPTOR_REASON: Record<DescriptorKey, string> = {
  compensation: 'their compensation band ranked above the others',
  term: 'their term matched what this person prefers',
  opportunity: 'they offered an opportunity',
  trust: 'their record with this person ranked above the others',
  standing: 'their studio standing ranked higher',
  incumbency: 'they are the current employer',
}

/** HYPOTHESIS: the person's public archetype, from public facts only — a proven
 * professional (any discipline with a real credit) or at or past the age band, or
 * else capable-but-unproven. It is readable on the profile and not manipulable.
 * The ONE archetype test: both public preferences below read it directly, so the
 * term preference never rides on the priority order's array positions. */
function isProven(state: GameState, talentId: string): boolean {
  const talent = state.talent.find((t) => t.id === talentId)
  return talent !== undefined && (careerIdentity(talent).identityDisciplines.length > 0 || talent.age >= 30)
}

/** §2.1.7's two archetype orders, reduced over the LIVE descriptors (only D5
 * relationships stays NEUTRAL — see DESCRIPTOR_ORDER above): capable-but-unproven
 * (opportunity, compensation, relationships, term, trust, Standing, incumbency) →
 * opportunity, compensation, term, trust, standing, incumbency; proven veterans
 * (compensation, term, trust, relationships, incumbency, Standing, opportunity) →
 * compensation, term, trust, incumbency, standing, opportunity. The P14A.1-F1 fix
 * is PRESERVED by this widening: compensation still precedes term for the
 * unproven branch, and incumbency still precedes Standing for the proven one. */
function priorityOrder(state: GameState, talentId: string): readonly DescriptorKey[] {
  return isProven(state, talentId)
    ? (['compensation', 'term', 'trust', 'incumbency', 'standing', 'opportunity'] as const)
    : (['opportunity', 'compensation', 'term', 'trust', 'standing', 'incumbency'] as const)
}

/** HYPOTHESIS: the person's public term preference — a proven professional
 * prefers the longest catalogue term, a rising one the shortest. */
function preferredTerm(state: GameState, talentId: string): number {
  const options = TUNING.CONTRACT_TERM_OPTIONS
  return isProven(state, talentId) ? options[options.length - 1]! : options[0]!
}

/**
 * The person's PUBLIC preference, read-only. §2.1.7 says the archetype-derived
 * priority order is "readable on the profile and not manipulable" — these two
 * accessors are that read and nothing more: pure, deterministic, no save fact, no
 * receipt, and no second copy of the rule (they ARE `priorityOrder`/`preferredTerm`).
 */
export function publicPriorityOrder(state: GameState, talentId: string): readonly DescriptorKey[] {
  return priorityOrder(state, talentId)
}

export function publicPreferredTerm(state: GameState, talentId: string): number {
  return preferredTerm(state, talentId)
}

const STANDING_BAND_TOLERANCE = 5 // HYPOTHESIS: standing points inside which two studios are "similar"

function standingMean(s: Standing): number {
  return (s.audienceAwareness + s.industryPrestige + s.commercialConfidence) / 3
}

function issuerStanding(state: GameState, issuerStudioId: string): number {
  const hollywood = state.hollywood!
  if (issuerStudioId === hollywood.playerStudioId) return standingMean(state.studio.standing)
  const business = hollywood.businesses.find((b) => b.studioId === issuerStudioId)
  return business === undefined ? 0 : standingMean(business.standing)
}

/** The live classification of whatever promise a proposal carries, re-run against
 * committed state at `week` — null when it carries none. */
function attachedClassification(state: GameState, proposal: TalentMarketProposal, week: number): PromiseClassification | null {
  const id = proposal.promises[0]
  if (id === undefined) return null
  const promise = state.promises.find((p) => p.promiseId === id)
  if (promise === undefined) return null
  return promiseFeasibility(state, {
    family: promise.family,
    issuerStudioId: promise.issuerStudioId,
    beneficiaryPersonId: promise.beneficiaryPersonId,
    predicate: promise.predicate,
    windowStartWeek: promise.windowStartWeek,
    dueWeekExclusive: promise.dueWeekExclusive,
    startWeek: proposal.startWeek,
    termWeeks: proposal.termWeeks,
    promiseId: promise.promiseId,
  }, week).classification
}

function bandsFor(
  state: GameState,
  proposals: readonly TalentMarketProposal[],
  kase: TalentMarketCase,
  week: number,
): Map<TalentMarketProposal, Record<DescriptorKey, number>> {
  const standings = proposals.map((p) => issuerStanding(state, p.issuerStudioId))
  const highest = Math.max(...standings)
  const lowest = Math.min(...standings)
  const wanted = preferredTerm(state, kase.talentId)
  const options = TUNING.CONTRACT_TERM_OPTIONS
  const out = new Map<TalentMarketProposal, Record<DescriptorKey, number>>()
  proposals.forEach((p, index) => {
    // D1 compensation: `at ask` / `above` / `well above`, read as the tier band.
    const compensation = p.premiumTier >= 1.15 ? 2 : p.premiumTier > 1.0 ? 1 : 0
    // D2 term against the person's public preference: match / near / mismatch.
    const steps = Math.abs(options.indexOf(p.termWeeks) - options.indexOf(wanted))
    const term = options.indexOf(p.termWeeks) < 0 ? 0 : steps === 0 ? 2 : steps === 1 ? 1 : 0
    // D6 studio Standing, relative to the other issuers.
    const mine = standings[index]!
    const standing = mine >= highest - STANDING_BAND_TOLERANCE ? 2 : mine <= lowest + STANDING_BAND_TOLERANCE ? 0 : 1
    // D7 incumbency.
    const incumbency = p.issuerStudioId === kase.subjectStudioId ? 1 : 0
    // D3 opportunity (P14B.1 (8)): a qualifying promise is attached and still
    // REASONABLY ACHIEVABLE at freeze. The class-preference filter waits for the
    // rest of the catalogue, so the band is binary in B.1.
    const opportunity = attachedClassification(state, p, week) === 'REASONABLY_ACHIEVABLE' ? 1 : 0
    // D4 trust (P14B.1 (8)): `Reliable` > `Mixed record` > `Distrusted`, read for
    // THIS person against THIS issuer — a Distrusted issuer never reaches ranking
    // at all, so the band's floor is only ever seen through the studio aggregate.
    const band = trustDescriptor(state, kase.talentId, p.issuerStudioId, week).label
    const trust = band === 'Reliable' ? 2 : band === 'Mixed record' ? 1 : 0
    out.set(p, { compensation, term, opportunity, trust, standing, incumbency })
  })
  return out
}

function pairwiseWins(a: Record<DescriptorKey, number>, b: Record<DescriptorKey, number>): number {
  return DESCRIPTOR_ORDER.filter((key) => a[key] > b[key]).length
}

function dominates(a: Record<DescriptorKey, number>, b: Record<DescriptorKey, number>): boolean {
  return DESCRIPTOR_ORDER.every((key) => a[key] >= b[key]) && DESCRIPTOR_ORDER.some((key) => a[key] > b[key])
}

/** The winner and the ordering-only reasons it won — or NO winner, carrying the
 * size of the set the §2.1.7 tie order could not separate, so a decline can say
 * "the order ran out between N" rather than blaming reservation. */
type ProposalChoice =
  | { winner: TalentMarketProposal; reasons: string[] }
  | { winner: null; tiedCount: number }

function chooseProposal(
  state: GameState,
  kase: TalentMarketCase,
  survivors: readonly TalentMarketProposal[],
  week: number,
): ProposalChoice {
  if (survivors.length === 0) return { winner: null, tiedCount: 0 }
  const bands = bandsFor(state, survivors, kase, week)
  // Dominated proposals are removed first.
  const live = survivors.filter((p) => !survivors.some((q) => q !== p && dominates(bands.get(q)!, bands.get(p)!)))
  const pool = live.length > 0 ? live : survivors
  // Copeland count: how many other survivors each proposal beats pairwise.
  const score = new Map<TalentMarketProposal, number>()
  for (const p of pool) {
    let wins = 0
    for (const q of pool) {
      if (q === p) continue
      if (pairwiseWins(bands.get(p)!, bands.get(q)!) > pairwiseWins(bands.get(q)!, bands.get(p)!)) wins++
    }
    score.set(p, wins)
  }
  const best = Math.max(...pool.map((p) => score.get(p)!))
  let tied = pool.filter((p) => score.get(p)! === best)
  if (tied.length > 1) {
    // Ties break by the person's PUBLIC priority order over descriptors …
    for (const key of priorityOrder(state, kase.talentId)) {
      const top = Math.max(...tied.map((p) => bands.get(p)![key]))
      const narrowed = tied.filter((p) => bands.get(p)![key] === top)
      if (narrowed.length < tied.length) tied = narrowed
      if (tied.length === 1) break
    }
  }
  if (tied.length > 1) {
    // … then earliest submission week …
    const earliest = Math.min(...tied.map((p) => p.submittedWeek))
    tied = tied.filter((p) => p.submittedWeek === earliest)
  }
  if (tied.length > 1) {
    // … then the incumbent if it is present. (Never array, Map or row order.)
    const incumbent = tied.filter((p) => p.issuerStudioId === kase.subjectStudioId)
    if (incumbent.length > 0) tied = incumbent
  }
  // decline-all rather than pick by array order (R8) — the tied set travels out
  // so the receipt can name how many the order could not separate.
  if (tied.length !== 1) return { winner: null, tiedCount: tied.length }
  const winner = tied[0]!
  const others = survivors.filter((p) => p !== winner)
  const reasons = others.length === 0
    ? ['theirs was the only proposal on the table']
    : DESCRIPTOR_ORDER.filter((key) => others.every((q) => bands.get(winner)![key] > bands.get(q)![key]))
        .map((key) => DESCRIPTOR_REASON[key])
  return { winner, reasons: reasons.length > 0 ? reasons : ['their proposal ranked above the others overall'] }
}

// ── §2.1.8 settlement ────────────────────────────────────────────────────────

function closeCase(
  state: GameState,
  kase: TalentMarketCase,
  outcome: NonNullable<TalentMarketCase['outcome']>,
  week: number,
  reason: string,
  receiptStudioId: string | null,
  reasons: readonly string[],
  dropped: readonly string[] = [],
): GameState {
  const cases = state.talentMarket.cases.map((c) =>
    c === kase ? { ...c, outcome, closedWeek: week, reason } : c)
  const market = appendReceipt(
    {
      ...state.talentMarket,
      cases,
      // A terminal case keeps no CURRENT proposal: the receipt is the record.
      proposals: state.talentMarket.proposals.filter((p) => p.talentId !== kase.talentId),
    },
    { kind: outcome, week, talentId: kase.talentId, studioId: receiptStudioId, reasons, dropped },
  )
  return { ...state, talentMarket: market }
}

/** The P10 commit-from-draft write set for a PLAYER winner: the contract, the
 * bonus ledger row stamped W, the free-agent filter, then `recordPlayerEmployment`
 * LAST so the P12 mirror writes the `player-contract` start. */
function commitPlayerWinner(state: GameState, proposal: TalentMarketProposal, week: number): GameState {
  const priced = proposalPriceAt(state, proposal, week)
  const contract: Contract = {
    talentId: proposal.talentId,
    annualSalary: priced.annualSalary,
    signingBonus: priced.signingBonus,
    startWeek: week,
    endWeekExclusive: week + proposal.termWeeks,
    termWeeks: proposal.termWeeks,
  }
  const entry: LedgerEntry = {
    week,
    kind: 'signingBonus',
    amount: -priced.signingBonus,
    talentId: proposal.talentId,
    note: 'market settlement signing bonus',
  }
  return recordPlayerEmployment({
    ...state,
    studio: { ...state.studio, cash: state.studio.cash - priced.signingBonus },
    contracts: [...state.contracts, contract],
    ledger: [...state.ledger, entry],
    freeAgents: state.freeAgents.filter((id) => id !== proposal.talentId),
    economyEngagedEver: true,
  })
}

/** The exported P12 signing write set for a RIVAL winner: the employment row with
 * reason `replacement` (the closed union — a lawful hire from the free pool), its
 * ordinal, the `signing` movement and the start receipt. */
function commitRivalWinner(state: GameState, proposal: TalentMarketProposal, week: number): GameState {
  const priced = proposalPriceAt(state, proposal, week)
  const source = state.hollywood!
  const businesses = source.businesses.map((b) =>
    b.studioId !== proposal.issuerStudioId ? b : {
      ...b,
      account: {
        ...b.account,
        periods: b.account.periods.map((p, i) => (i === b.account.periods.length - 1 ? { ...p, movements: { ...p.movements } } : p)),
      },
    })
  const business = businesses.find((b) => b.studioId === proposal.issuerStudioId)!
  const contractId = `${proposal.issuerStudioId}:contract:${proposal.talentId}:${week}`
  const terms: Contract = {
    talentId: proposal.talentId,
    annualSalary: priced.annualSalary,
    signingBonus: priced.signingBonus,
    startWeek: week,
    endWeekExclusive: week + proposal.termWeeks,
    termWeeks: proposal.termWeeks,
  }
  moveRivalMoney(business.account, 'signing', -priced.signingBonus, week)
  const ordinal = source.employment.length
  const receipt: IndustryReceipt = {
    eventId: `industry-event-${source.nextReceipt}`,
    week,
    studioId: proposal.issuerStudioId,
    kind: 'employment',
    talentId: proposal.talentId,
    fromStudioId: null,
    toStudioId: proposal.issuerStudioId,
    contractId,
    reason: 'replacement',
  }
  return {
    ...state,
    hollywood: {
      ...source,
      businesses,
      employment: [...source.employment, { contractId, studioId: proposal.issuerStudioId, terms, endedWeek: null, reason: 'replacement' }],
      activeEmploymentOrdinals: [...source.activeEmploymentOrdinals, ordinal],
      receipts: [...source.receipts, receipt],
      nextReceipt: source.nextReceipt + 1,
    },
  }
}

/**
 * The SIX freeze predicates of companion §2.1.7 line 104 ("Proposals that fail
 * reservation, legality or affordability at freeze are dropped with typed reasons
 * before ranking"), named so a decline can state the predicate that actually
 * dropped each proposal instead of asserting a reservation failure for every one.
 */
export type FreezeDrop =
  | 'issuerNotEntered'
  | 'subjectCommittedElsewhere'
  | 'startWeekMoved'
  | 'belowAsk'
  | 'materialTermsChanged'
  | 'bonusUnaffordable'
  | 'noSeatForRole'
  /** P14B.1 (5): the attached promise is no longer REASONABLY ACHIEVABLE at W. */
  | 'promiseNotFeasible'
  /** P14B.1 (8) / companion §2.1.7: the reservation predicate "not Distrusted". */
  | 'issuerDistrusted'

/** The studio as a person would name it; the id only if this world has no identity
 * for it (a state that could not have produced the proposal in the first place). */
function studioLabel(state: GameState, studioId: string): string {
  return state.hollywood?.identities.find((s) => s.studioId === studioId)?.name ?? studioId
}

/** CANDIDATE WORDING (the coordinator pinned the CONTRACT — one sentence per
 * dropped proposal, the issuing studio named, the predicate from this closed
 * vocabulary — not the prose). Ordering-only: no amount appears in any of them,
 * and "reservation" appears for the ask predicate ALONE. */
const DROP_SENTENCE: Record<FreezeDrop, (studio: string) => string> = {
  issuerNotEntered: (studio) => `${studio} had not entered the industry by the decision week.`,
  subjectCommittedElsewhere: (studio) => `${studio}'s offer lapsed — this person was already committed elsewhere by the decision week.`,
  startWeekMoved: (studio) => `${studio}'s offer named a start week that no longer matches this decision.`,
  belowAsk: (studio) => `${studio}'s offer fell below this person's reservation for that term.`,
  materialTermsChanged: (studio) => `${studio}'s terms changed since submission.`,
  bonusUnaffordable: (studio) => `${studio} could not fund the signing bonus.`,
  noSeatForRole: (studio) => `${studio} had no seat open for this person's role at the decision week.`,
  promiseNotFeasible: (studio) => `${studio}'s attached promise no longer had a feasible path by the decision week.`,
  issuerDistrusted: (studio) => `${studio} holds a record this person distrusts.`,
}

/**
 * The rival seat budget at freeze (companion §2.1.4 line 74: rival maintenance
 * "fills deficits against six fixed seats", and §2.1.7 line 104 drops what fails
 * legality BEFORE ranking). Held = the studio's rows for that role that survive
 * PAST W — which is exactly the rows it keeps plus the wins it committed EARLIER
 * in this same fixed-order weekly pass, because a commit at W writes a row ending
 * at W + termWeeks. The subject's OWN expiring row is closed at W by
 * `finishHollywoodWeek` before settlement runs, so an incumbent always has its own
 * seat back for its own renewal.
 */
function seatsHeldAfter(state: GameState, hollywood: HollywoodState, studioId: string, role: string, week: number): number {
  let held = 0
  for (const ordinal of hollywood.activeEmploymentOrdinals) {
    const row = hollywood.employment[ordinal]!
    if (row.studioId !== studioId || row.endedWeek !== null || row.terms.endWeekExclusive <= week) continue
    if (state.talent.find((t) => t.id === row.terms.talentId)?.role === role) held++
  }
  return held
}

/** A proposal is DROPPED at freeze when it fails P10 legality (interval algebra
 * at W), P12 (the issuer has entered; the person is not committed elsewhere),
 * reservation, or affordability. A dropped proposal never cancels a valid one. */
function survivesFreeze(state: GameState, proposal: TalentMarketProposal, week: number): FreezeDrop | null {
  const hollywood = state.hollywood!
  if (!enteredStudioIds(hollywood).includes(proposal.issuerStudioId)) return 'issuerNotEntered'
  // Reservation, P14B.1 (8): this person refuses a Distrusted issuer OUTRIGHT —
  // companion §2.1.7 lists reservation before legality and affordability, and
  // this predicate needs neither a price nor a seat to decide. It is checked
  // ahead of the rival seat budget for exactly that reason: "I will not work for
  // them" is not a fact about whether they had a chair free.
  if (trustDescriptor(state, proposal.talentId, proposal.issuerStudioId, week).label === 'Distrusted') return 'issuerDistrusted'
  if (subjectTerms(state, proposal.talentId, week) !== undefined) return 'subjectCommittedElsewhere'
  if (proposal.startWeek !== week) return 'startWeekMoved'
  // The seat budget binds a RIVAL only. The player's roster law is P10's and has no
  // RIVAL_TEAM_ROLES-shaped cap anywhere; nothing here invents one for it.
  if (proposal.issuerStudioId !== hollywood.playerStudioId) {
    const role = state.talent.find((t) => t.id === proposal.talentId)?.role
    if (role !== undefined && seatsHeldAfter(state, hollywood, proposal.issuerStudioId, role, week)
      >= RIVAL_TEAM_ROLES.filter((r) => r === role).length) return 'noSeatForRole'
  }
  // Everything below is judged on the price RE-DERIVED at W, never on the
  // submission-week quote stored on the proposal.
  const priced = proposalPriceAt(state, proposal, week)
  // Reservation (absolute): the re-derived annual must clear the person's own ask
  // for that term at W — true by construction while the premium tier is ≥ 1.00
  // (companion §2.1.7), kept explicit because it is cheap and it is the law.
  if (priced.annualSalary < priced.askAnnual) return 'belowAsk'
  // The draft REFERENCE is re-derived; a MATERIAL-term mismatch invalidates the
  // version — and the attached promise is one of those material terms, so a
  // promise that DRIFTED after attachment is caught here, as a revision, before
  // anything asks whether it is still feasible.
  const redrawn = proposalDraft(state, proposal.issuerStudioId, proposal.talentId, proposal.termWeeks, proposal.premiumTier, week,
    attachedPromiseDigest(state, proposal.promises))
  if (redrawn.digest !== proposal.digest) return 'materialTermsChanged'
  // P14B.1 (5) / companion §2.1.8, the ONE settlement-step addition: every
  // attached promise is re-classified against committed state at W, and a promise
  // no longer REASONABLY ACHIEVABLE invalidates this proposal version BEFORE the
  // chooser runs.
  if (proposal.promises.length > 0 && attachedClassification(state, proposal, week) !== 'REASONABLY_ACHIEVABLE') {
    return 'promiseNotFeasible'
  }
  return affordabilityRefusal(state, proposal.issuerStudioId, priced.signingBonus, week) === null ? null : 'bonusUnaffordable'
}

/** P14B.1 (5): the surviving winner's promise is COMMITTED — it now names the
 * employment row it rode in on, so a later reader can see which contract carried
 * it. Losing proposals' promises are left exactly as drafted: nothing accepted
 * them, and B.1 mints no outcome for an offer nobody took. */
function commitWinningPromise(state: GameState, winner: TalentMarketProposal, week: number): GameState {
  const id = winner.promises[0]
  if (id === undefined) return state
  const row = state.hollywood?.employment.find(
    (e) => e.terms.talentId === winner.talentId && e.studioId === winner.issuerStudioId && e.endedWeek === null && e.terms.startWeek === week)
  const contractId = row?.contractId ?? null
  return { ...state, promises: state.promises.map((p) => (p.promiseId === id ? { ...p, contractId } : p)) }
}

function settleCase(state: GameState, kase: TalentMarketCase, week: number): GameState {
  const submitted = state.talentMarket.proposals.filter((p) => p.talentId === kase.talentId)
  if (submitted.length === 0) {
    return closeCase(state, kase, 'expired', week, 'no proposal was submitted', null, ['no studio proposed before the decision week'])
  }
  const frozen = submitted.map((proposal) => ({ proposal, drop: survivesFreeze(state, proposal, week) }))
  const survivors = frozen.filter((f) => f.drop === null).map((f) => f.proposal)
  // The ONE drop list this case produces. It is the decline's own sentences when
  // everything was dropped, and it rides the SETTLED receipt too — a studio whose
  // proposal was dropped learns why even when someone else won. No second wording.
  const dropped = frozen.filter((f) => f.drop !== null)
    .map((f) => DROP_SENTENCE[f.drop!](studioLabel(state, f.proposal.issuerStudioId)))
  if (survivors.length === 0) {
    // Every proposal failed a freeze predicate BEFORE ranking: one typed sentence
    // per dropped proposal, naming the studio and the predicate that dropped it.
    return closeCase(state, kase, 'declined', week, 'all proposals dropped', null, dropped, dropped)
  }
  const chosen = chooseProposal(state, kase, survivors, week)
  if (chosen.winner === null) {
    // A FULL LEGAL survivor set the tie order ran out on — nothing failed
    // reservation. One ordering-only sentence, no amount. CANDIDATE wording.
    return closeCase(state, kase, 'declined', week, 'tie exhausted', null,
      [`this person could not separate ${String(chosen.tiedCount)} equally ranked proposals.`], dropped)
  }
  const committed = chosen.winner.issuerStudioId === state.hollywood!.playerStudioId
    ? commitPlayerWinner(state, chosen.winner, week)
    : commitRivalWinner(state, chosen.winner, week)
  return closeCase(commitWinningPromise(committed, chosen.winner, week), kase, 'settled', week, 'settled at the decision week',
    chosen.winner.issuerStudioId, chosen.reasons, dropped)
}

// ── the weekly market step (tick.ts, terminal and fixed-order) ───────────────

/**
 * The terminal fixed-order step of the weekly advance, appended in `tick.ts`
 * AFTER `finishHollywoodWeek(finishTechnologyWeek(finalized))` — the pipeline's
 * last call, on the ALREADY-INCREMENTED week. It could not run earlier: before
 * the advance `market.tick` is W−1 and the P12 mirror would write a
 * renewal-shaped pair the validator rejects, and before `finishHollywoodWeek`
 * the `expiry` receipt the chooser receipt references does not exist.
 *
 * Fixed order at the new week W:
 *   1. INVALIDATION  — a subject released early closes its case, settling nothing
 *   2. DISCOVERY     — a case opens at the window's first week (the O(active
 *                      roster) pass `finishHollywoodWeek` and `staff()` already make)
 *   3. RIVAL TRIGGER — each rival that decided this week evaluates the pure policy
 *   4. SETTLEMENT    — every open case whose DERIVED decision week has arrived
 */
export function advanceTalentMarketWeek(state: GameState): GameState {
  // Loud, never silent: a live state MUST carry the V28 root. Skipping the market
  // for a state that merely looks un-migrated would hide a real migration fault.
  if (state.talentMarket === undefined) {
    throw new Error('talentMarket: the Save V28 market root is missing — migrate this state to V28 before ticking it')
  }
  if (!talentMarketEngaged(state)) return state
  const week = state.market.tick
  let next = state

  // 1. invalidation
  for (const kase of next.talentMarket.cases) {
    if (kase.outcome !== null || !releasedEarly(next, kase)) continue
    next = closeCase(next, kase, 'invalidated', week, 'the subject was released early', null,
      ['the person was released early and is a free agent now'])
  }

  // 2. discovery — authoritative and public; every entered studio sees it at once.
  const hollywood = next.hollywood!
  for (const ordinal of hollywood.activeEmploymentOrdinals) {
    const row = hollywood.employment[ordinal]!
    if (row.endedWeek !== null) continue
    if (!renewalWindowOpen(row.terms, week)) continue
    if (next.talentMarket.cases.some((c) => c.contractId === row.contractId)) continue
    const kase: TalentMarketCase = {
      talentId: row.terms.talentId,
      subjectStudioId: row.studioId,
      contractId: row.contractId,
      openedWeek: week,
      outcome: null,
      closedWeek: null,
      reason: null,
    }
    next = {
      ...next,
      talentMarket: appendReceipt(
        { ...next.talentMarket, cases: [...next.talentMarket.cases, kase] },
        { kind: 'discovered', week, talentId: kase.talentId, studioId: kase.subjectStudioId, reasons: [] },
      ),
    }
  }

  // 3. the rival trigger, inside the rival's own weekly decision cadence.
  for (const kase of openCasesAt(next, week)) {
    const descriptor: MarketCaseDescriptor = {
      talentId: kase.talentId,
      subjectStudioId: kase.subjectStudioId,
      decisionWeek: decisionWeekOf(next, kase),
    }
    for (const business of next.hollywood!.businesses) {
      if (week < business.nextDecisionWeek) continue // it has not decided this week
      if (next.talentMarket.proposals.some((p) => p.talentId === kase.talentId && p.issuerStudioId === business.studioId)) continue
      if (!rivalProposalTrigger(next, next.hollywood!, business, descriptor, week)) continue
      try {
        next = submitProposal(next, {
          talentId: kase.talentId,
          issuerStudioId: business.studioId,
          termWeeks: TUNING.HOLLYWOOD_CONTRACT_WEEKS,
          premiumTier: rivalPremiumTier(business, descriptor),
        })
      } catch {
        // A refused proposal (reserve, eligibility) writes nothing. The rival simply
        // does not bid this week; nothing else in the pass is affected.
      }
    }
  }

  // 4. settlement — exactly once, at the decision week.
  for (const kase of openCasesAt(next, week)) {
    if (decisionWeekOf(next, kase) > week) continue
    next = settleCase(next, kase, week)
  }
  return next
}

function openCasesAt(state: GameState, week: number): TalentMarketCase[] {
  return state.talentMarket.cases.filter((c) => c.outcome === null && !TERMINAL.has(caseStatusAt(state, c, week)))
}

/** HYPOTHESIS (the plan records the rival's trigger policy NUMBERS as OPEN): the
 * rival's tier is derived from its EXISTING policy fields, with no persisted
 * policy change — an incumbent retains at the ask; a challenger pays above it,
 * and a cautious studio (a long reserve) pays one band more. */
function rivalPremiumTier(business: RivalBusiness, descriptor: MarketCaseDescriptor): number {
  const tiers = TUNING.MARKET_PREMIUM_TIERS
  const index = (descriptor.subjectStudioId === business.studioId ? 0 : 1) + (business.policy.reserveWeeks >= 16 ? 1 : 0)
  return tiers[Math.min(index, tiers.length - 1)]!
}

// ── the save boundary's validator (R22: no market authority without a receipt) ─

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * The V28 root validator. Enforces, in this order so the refusal names the real
 * fault: the root shape and its pinned `representation`; every proposal's
 * REQUIRED `representation` key pinned `null` (R10 / direction 8); per-studio
 * authority (no case or proposal from a studio this world has not entered); and
 * "no case without a receipt" — the discovery receipt is the authority, exactly
 * as the S8 rival-authority invariant requires for a rival's own facts.
 */
export function validateTalentMarketRoot(talentMarket: unknown, state: unknown): void {
  const fail = (message: string): never => {
    throw new Error(`validateSaveV28: ${message}`)
  }
  if (!isRecord(talentMarket)) return fail('state.talentMarket is not a plain object')
  for (const key of ['cases', 'proposals', 'receipts', 'legacyTerminations'] as const) {
    if (!Array.isArray(talentMarket[key])) return fail(`state.talentMarket.${key} is not an array`)
  }
  const cases = talentMarket.cases as unknown[]
  const proposals = talentMarket.proposals as unknown[]
  const receipts = talentMarket.receipts as unknown[]

  // R10 / direction 8 FIRST: the representation seam is the one key a later
  // system may populate, so a save that already carries a value for it is
  // refused here rather than anywhere that might read it.
  for (let i = 0; i < proposals.length; i++) {
    const row = proposals[i]
    const label = `state.talentMarket.proposals[${String(i)}]`
    if (!isRecord(row)) return fail(`${label} is not a plain object`)
    if (!Object.hasOwn(row, 'representation')) return fail(`${label}.representation is missing — the key is REQUIRED and pinned null (R10)`)
    if (row.representation !== null) return fail(`${label}.representation must be null under P14 root version 1 (R10)`)
  }

  const hollywood = isRecord(state) ? state.hollywood : null
  const identities = isRecord(hollywood) && Array.isArray(hollywood.identities) ? hollywood.identities : []
  const employment = isRecord(hollywood) && Array.isArray(hollywood.employment) ? hollywood.employment : []
  const industryReceipts = isRecord(hollywood) && Array.isArray(hollywood.receipts) ? hollywood.receipts : []
  const playerStudioId = isRecord(hollywood) ? hollywood.playerStudioId : undefined
  const entered = new Set(identities
    .filter((s): s is Record<string, unknown> => isRecord(s) && s.enteredWeek !== null)
    .map((s) => String(s.studioId)))
  const discovered = new Set(receipts
    .filter((r): r is Record<string, unknown> => isRecord(r) && r.kind === 'discovered')
    .map((r) => String(r.talentId)))

  // "No market authority without a receipt", and no authority from a studio this
  // world has not entered — the S8 rival-authority invariant, applied per studio.
  for (let i = 0; i < cases.length; i++) {
    const row = cases[i]
    const label = `state.talentMarket.cases[${String(i)}]`
    if (!isRecord(row)) return fail(`${label} is not a plain object`)
    if (!discovered.has(String(row.talentId))) {
      return fail(`${label} has no backing discovery receipt — no market authority without a receipt`)
    }
    if (!entered.has(String(row.subjectStudioId))) {
      return fail(`${label}.subjectStudioId "${String(row.subjectStudioId)}" is not an entered studio of this world`)
    }
  }
  for (let i = 0; i < proposals.length; i++) {
    const row = proposals[i] as Record<string, unknown>
    if (!entered.has(String(row.issuerStudioId))) {
      return fail(`state.talentMarket.proposals[${String(i)}].issuerStudioId "${String(row.issuerStudioId)}" is not an entered studio of this world`)
    }
  }

  // Every receipt carries its drop list: ordering-only sentences, never an amount,
  // never blank. Empty is the normal case (nothing was dropped).
  for (let i = 0; i < receipts.length; i++) {
    const row = receipts[i]
    const label = `state.talentMarket.receipts[${String(i)}]`
    if (!isRecord(row)) return fail(`${label} is not a plain object`)
    const drops = row.dropped
    if (!Array.isArray(drops)) return fail(`${label}.dropped is not an array`)
    for (const sentence of drops) {
      if (typeof sentence !== 'string' || sentence.trim() === '') return fail(`${label}.dropped carries an empty sentence`)
      if (sentence.includes('$') || /\d{3,}/.test(sentence)) return fail(`${label}.dropped carries an amount — drop reasons are ordering-only`)
    }
  }

  // R4 — every recorded legacy termination names a REAL terminated player
  // employment row of this world, at its own ended week, for a non-negative
  // integer amount, once. Nothing here can be minted live: the V28 writer
  // charges the cap law, so this list only ever arrives through the migration.
  const terminatedPlayerRows = new Map<string, number>()
  for (const row of employment) {
    if (!isRecord(row) || row.studioId !== playerStudioId || row.endedWeek === null) continue
    const ended = industryReceipts.some((r) => isRecord(r) && r.kind === 'employment'
      && r.contractId === row.contractId && r.toStudioId === null && r.reason === 'termination')
    if (ended) terminatedPlayerRows.set(String(row.contractId), Number(row.endedWeek))
  }
  const seenLegacy = new Set<string>()
  const legacyRows = talentMarket.legacyTerminations as unknown[]
  for (let i = 0; i < legacyRows.length; i++) {
    const row = legacyRows[i]
    const label = `state.talentMarket.legacyTerminations[${String(i)}]`
    if (!isRecord(row)) return fail(`${label} is not a plain object`)
    const contractId = String(row.contractId)
    if (!terminatedPlayerRows.has(contractId)) {
      return fail(`${label}.contractId "${contractId}" is not a terminated player employment row of this world`)
    }
    if (seenLegacy.has(contractId)) return fail(`${label}.contractId "${contractId}" is recorded twice`)
    seenLegacy.add(contractId)
    if (row.endedWeek !== terminatedPlayerRows.get(contractId)) {
      return fail(`${label}.endedWeek differs from the employment row it names`)
    }
    if (!Number.isInteger(row.amountPaid) || (row.amountPaid as number) < 0) {
      return fail(`${label}.amountPaid must be a non-negative integer`)
    }
  }

  if (!Object.hasOwn(talentMarket, 'representation')) return fail('state.talentMarket.representation is missing (required, pinned null)')
  if (talentMarket.representation !== null) return fail('state.talentMarket.representation must be null under P14 root version 1')
}

/**
 * R4, the MIGRATION record. Every player termination this campaign has already
 * paid for, read from the SAME two records the industry validator reads — the
 * P12 end receipt with reason `termination`, and the P10 `termination` ledger
 * row it is keyed to — and recorded with the amount actually charged. No
 * back-charge, no refund, no re-pricing: cash never moves at a migration. A
 * terminated player row with no ledger row FAILS here rather than being recorded
 * as zero, because that V27 state was already invalid.
 */
export function projectLegacyTerminations(state: Pick<GameState, 'hollywood' | 'ledger'>): LegacyTermination[] {
  const hollywood = state.hollywood
  if (hollywood === null) return []
  const recorded: LegacyTermination[] = []
  for (const row of hollywood.employment) {
    if (row.studioId !== hollywood.playerStudioId || row.endedWeek === null) continue
    const ends = hollywood.receipts.filter((r) => r.kind === 'employment' && r.contractId === row.contractId && r.toStudioId === null)
    const end = ends[0]
    if (ends.length !== 1 || end === undefined || end.kind !== 'employment' || end.reason !== 'termination') continue
    const paid = state.ledger.find((entry) => entry.kind === 'termination'
      && entry.talentId === row.terms.talentId && entry.week === row.endedWeek)
    if (paid === undefined) {
      throw new Error(`migrateToV28: player termination "${row.contractId}" has no termination ledger row — that state was already invalid`)
    }
    recorded.push({ contractId: row.contractId, endedWeek: row.endedWeek, amountPaid: -paid.amount })
  }
  return recorded
}

/**
 * Save V28's termination law: today's cap law for every charge this era wrote,
 * EXCEPT the contracts the migration recorded as legacy — those reconcile
 * against the amount their own era actually paid.
 */
export function talentMarketTerminationLaw(talentMarket: unknown): TerminationLaw {
  const rows = isRecord(talentMarket) && Array.isArray(talentMarket.legacyTerminations) ? talentMarket.legacyTerminations : []
  const paid = new Map<string, number>()
  for (const row of rows) if (isRecord(row)) paid.set(String(row.contractId), Number(row.amountPaid))
  return (contract, endedWeek, contractId) => {
    const legacy = paid.get(contractId)
    return legacy === undefined ? [terminationCost(contract, endedWeek)] : [legacy]
  }
}

/**
 * The POSITIVE projection to every version before V28. A root that actually
 * carries market authority — any case, proposal or receipt — is REFUSED rather
 * than flattened, exactly as `projectHollywoodPreV27` refuses rival research: an
 * envelope that quietly dropped a contested expiry would misreport a campaign
 * that fought one as a campaign that never did. Lossless exactly when the root
 * is empty.
 */
export function projectTalentMarketPreV28(talentMarket: unknown): void {
  if (!isRecord(talentMarket)) return
  for (const key of ['cases', 'proposals', 'receipts'] as const) {
    const rows = talentMarket[key]
    if (Array.isArray(rows) && rows.length > 0) {
      throw new Error(`frozen save projection cannot discard authoritative V28 talent-market ${key} (${String(rows.length)} held)`)
    }
  }
}
