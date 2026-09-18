// ── P10-R1 — the contract quote family: renewal / early release → consequence → commit ──
//
// The accepted D-11 employment law already carries both material contract actions
// (`renewContract` — extend inside the renewal window at the engine's own offer;
// `releaseTalent` — early release at the engine's own termination cost) with their
// refusals (D-11.7 window, D-12 solvency on the signing bonus, the screenplay-task
// guard on release). What was missing was the ROUTE: no quote family carried them
// across the bridge, so the Profile could only show the contract read-only. This
// module is that route and nothing more. It composes the existing authorities
// (`activeContract`, `renewalWindowOpen`, `playerOffer[Options]` — the R1-floored
// studio-aware entry the player actions themselves price through, `terminationCost`,
// `guaranteedComp`, `canAfford`, `activeScriptWriterAssignments`) into ONE decision
// the Profile publishes (`contractActionDecisions`), ONE draft conversion the session
// quotes and commits (`contractDraftToEngine`), and ONE consequence sheet Unity renders
// verbatim (`contractQuoteSnapshot`). The client never prices, never decides
// eligibility, and never constructs an engine payload.
//
// Domain rules are preserved exactly: no new affordability rule (the D-12 gate is the
// engine's own, re-asked at commit), no changed termination behaviour, no wage or term
// change, no morale/reputation consequence. A refused preview is an ACCEPTED answer
// (`ok:false`) carrying the engine's reason in player words; only a legal preview mints
// the ONE digest-bound commit intent, and the commit re-asks the same authorities.
import {
  activeContract,
  activeScriptWriterAssignments,
  applyActions,
  canAfford,
  playerOffer,
  playerOfferOptions,
  guaranteedComp,
  renewalWindowOpen,
  terminationCost,
  weeklySalary,
  type Contract,
  type ContractOffer,
  type GameState,
  type Talent,
} from '../src/core/index.ts'
import {
  campaignDate,
  caseForTalent,
  caseOpenForTalent,
  currentProposals,
  isPremiumTier,
  marketEligibility,
  proposalDraft,
  submitProposal,
  withdrawProposal,
} from '../src/core/index.ts'
import { financialConsequence } from './finance-consequence.ts'
import { promiseQuoteSnapshot } from './promises.ts'
import type { PromiseFamily } from '../src/core/types.ts'
import { TUNING } from '../src/core/tuning.ts'
import type { ActionOutcome } from '../ui/src/engine/adapter.ts'
import type {
  BridgeContractDraftPayload,
  BridgeContractQuoteSnapshot,
  BridgeContractRefusalKind,
  BridgeMarketProposalDraftPayload,
  BridgeMarketPromiseQuoteSnapshot,
  BridgeMarketProposalQuoteSnapshot,
  BridgeMarketProposalRefusalKind,
  BridgePersonContractActionsSnapshot,
  BridgePersonRenewalTermSnapshot,
} from './schema/bridge-schema.ts'

function dollars(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

/** The casting package's term wording, verbatim (`castingPackageReadModel.ts`), so both routes speak one term. */
export function contractTermLabel(termWeeks: number): string {
  const years = termWeeks / TUNING.TICKS_PER_YEAR
  return years === 1 ? '1 year' : `${String(years)} years`
}

export type ContractRefusal = {
  code: BridgeContractRefusalKind
  reason: string
  remedy: string
}

function talentById(state: GameState, talentId: string): Talent | undefined {
  return state.talent.find((candidate) => candidate.id === talentId)
}

function scriptTaskLabel(state: GameState, talentId: string): string | null {
  const assignment = activeScriptWriterAssignments(state.scriptDevelopment, state.concepts).find(
    (candidate) => candidate.talentId === talentId,
  )
  return assignment === undefined ? null : assignment.label
}

/** One renewal term as the wire publishes it: the engine's own offer for THIS week. */
function renewalTerm(offer: ContractOffer): BridgePersonRenewalTermSnapshot {
  return {
    termWeeks: offer.termWeeks,
    termLabel: contractTermLabel(offer.termWeeks),
    annualSalary: offer.annualSalary,
    weeklySalary: weeklySalary(offer.annualSalary),
    signingBonus: offer.signingBonus,
    endWeekExclusive: offer.endWeekExclusive,
  }
}

/**
 * The renewal refusal for a contract THIS week, or null when renewal is legal. Pure
 * over the existing window law; the solvency gate is asked per TERM (the signing
 * bonus differs by term), so it belongs to the quote, not to availability.
 */
export function renewalRefusal(state: GameState, talent: Talent, contract: Contract | undefined): ContractRefusal | null {
  const week = state.market.tick
  if (contract === undefined) {
    return {
      code: 'noActiveContract',
      reason: `${talent.name} is not under contract.`,
      remedy: 'Only a contracted person can be renewed.',
    }
  }
  if (!renewalWindowOpen(contract, week)) {
    const opensWeek = contract.endWeekExclusive - TUNING.HIRING_RENEWAL_WINDOW_WEEKS
    const opensIn = opensWeek - week
    return {
      code: 'renewalWindowClosed',
      reason: opensIn > 0
        ? `${talent.name}'s renewal window is not open yet — it opens ${String(opensIn)} weeks from now (Week ${String(opensWeek)}), ${String(TUNING.HIRING_RENEWAL_WINDOW_WEEKS)} weeks before the contract ends in Week ${String(contract.endWeekExclusive)}.`
        : `${talent.name}'s contract has already ended (Week ${String(contract.endWeekExclusive)}).`,
      remedy: opensIn > 0 ? `Review the renewal again from Week ${String(opensWeek)}.` : 'Sign a new contract from the talent market instead.',
    }
  }
  // P14A.1 (companion §2.1.3 / R6): once a market case is open for this person the
  // engine refuses `renewContract` outright (`underMarketCase`, src/core/actions.ts) —
  // the incumbent renews by submitting a PROPOSAL settled at the decision week against
  // everyone else's. The row consulted here is the same predicate the engine consults,
  // so the Profile can never offer a renewal the commit would throw on.
  if (caseOpenForTalent(state, talent.id, week)) {
    const decisionWeek = caseForTalent(state, talent.id, week)?.decisionWeek ?? contract.endWeekExclusive
    return {
      code: 'underMarketCase',
      reason: `${talent.name} is under an open market case — renewing in term is closed, and the incumbent's renewal is now a proposal settled in Week ${String(decisionWeek)} against every competing proposal.`,
      remedy: 'Review and submit your proposal for the decision week instead.',
    }
  }
  return null
}

/** The early-release refusal THIS week, or null when release is legal. */
export function releaseRefusal(state: GameState, talent: Talent, contract: Contract | undefined): ContractRefusal | null {
  if (contract === undefined) {
    return {
      code: 'noActiveContract',
      reason: `${talent.name} is not under contract.`,
      remedy: 'Only a contracted person can be released early.',
    }
  }
  const task = scriptTaskLabel(state, talent.id)
  if (task !== null) {
    return {
      code: 'onScreenplayTask',
      reason: `${talent.name} is ${task} and must finish that screenplay task first.`,
      remedy: 'Release after the draft closes, or reassign the screenplay.',
    }
  }
  return null
}

/**
 * The ONE decision the Profile publishes: which material action is legal THIS week,
 * why not otherwise, and the engine's own published renewal terms. The quote family
 * below asks the same authorities, so the sheet can never disagree with the Profile.
 */
export function contractActionDecisions(state: GameState, talentId: string): BridgePersonContractActionsSnapshot {
  const talent = talentById(state, talentId)
  if (talent === undefined) {
    return { renewAvailable: false, renewReason: 'Unknown person.', renewalTerms: [], releaseAvailable: false, releaseReason: 'Unknown person.' }
  }
  const contract = activeContract(state, talentId)
  const renew = renewalRefusal(state, talent, contract)
  const release = releaseRefusal(state, talent, contract)
  return {
    renewAvailable: renew === null,
    renewReason: renew === null ? null : renew.reason,
    renewalTerms: renew === null ? playerOfferOptions(state, talentId).map(renewalTerm) : [],
    releaseAvailable: release === null,
    releaseReason: release === null ? null : release.reason,
  }
}

export type ContractDraftConversion =
  | {
      ok: true
      kind: 'renewContract' | 'releaseTalent'
      apply: (state: GameState) => ActionOutcome
      commitLabel: string
      talent: Talent
      contract: Contract | undefined
      /** The engine's offer for the chosen published term (renew only). */
      offer: ContractOffer | null
      refusal: ContractRefusal | null
    }
  | { ok: false; error: string }

function liveRefusal(state: GameState, draft: BridgeContractDraftPayload, talent: Talent): ContractRefusal | null {
  const contract = activeContract(state, talent.id)
  if (draft.verb === 'release') return releaseRefusal(state, talent, contract)
  const window = renewalRefusal(state, talent, contract)
  if (window !== null) return window
  const offer = playerOffer(state, talent.id, draft.termWeeks ?? 0)
  const affordability = canAfford(state, offer.signingBonus)
  if (!affordability.ok) {
    return {
      code: 'insufficientFunds',
      reason: `The studio cannot cover the ${dollars(offer.signingBonus)} renewal signing bonus this week (${affordability.reason}).`,
      remedy: 'Choose a shorter term, or renew once cash allows.',
    }
  }
  return null
}

/** The ONLY conversion from a contract draft to the engine. */
export function contractDraftToEngine(state: GameState, draft: BridgeContractDraftPayload): ContractDraftConversion {
  const talent = talentById(state, draft.talentId)
  if (talent === undefined) {
    return { ok: false, error: `"${draft.talentId}" is not on the studio's books.` }
  }
  if (draft.verb === 'renew') {
    if (draft.termWeeks === null || !TUNING.CONTRACT_TERM_OPTIONS.includes(draft.termWeeks)) {
      return { ok: false, error: 'Choose one of the published renewal terms before renewing.' }
    }
  }
  const contract = activeContract(state, talent.id)
  const refusal = liveRefusal(state, draft, talent)
  const offer = draft.verb === 'renew' && contract !== undefined && refusal?.code !== 'renewalWindowClosed'
    ? playerOffer(state, talent.id, draft.termWeeks ?? 0)
    : null
  const week = state.market.tick
  const cost = draft.verb === 'renew'
    ? (offer?.signingBonus ?? 0)
    : contract === undefined ? 0 : terminationCost(contract, week)
  const commitLabel = draft.verb === 'renew'
    ? `RENEW ${talent.name.toUpperCase()} — ${contractTermLabel(draft.termWeeks ?? 0).toUpperCase()} · ${dollars(cost)} BONUS NOW`
    : `RELEASE ${talent.name.toUpperCase()} — ${dollars(cost)} TERMINATION NOW`
  return {
    ok: true,
    kind: draft.verb === 'renew' ? 'renewContract' : 'releaseTalent',
    commitLabel,
    talent,
    contract,
    offer,
    refusal,
    apply: (current: GameState): ActionOutcome => {
      // Commit revalidates: the same authorities, the live state.
      const live = liveRefusal(current, draft, talent)
      if (live !== null) return { ok: false, error: `${live.reason} ${live.remedy}`.trim() }
      try {
        const action = draft.verb === 'renew'
          ? ({ kind: 'renewContract', talentId: talent.id, termWeeks: draft.termWeeks ?? 0 } as const)
          : ({ kind: 'releaseTalent', talentId: talent.id } as const)
        return { ok: true, next: applyActions(current, [action]) }
      } catch (e) {
        return { ok: false, error: (e as Error).message }
      }
    },
  }
}

/** The consequence sheet Unity renders verbatim; the id is registered for commit only when `ok`. */
export function contractQuoteSnapshot(
  state: GameState,
  draft: BridgeContractDraftPayload,
  conversion: Extract<ContractDraftConversion, { ok: true }>,
  intentId: string,
  successor: GameState | null = null,
): BridgeContractQuoteSnapshot {
  const { talent, contract, offer, refusal } = conversion
  const week = state.market.tick
  const cashBefore = Math.round(state.studio.cash)
  const ok = refusal === null
  const renew = draft.verb === 'renew'
  const guaranteed = contract === undefined ? null : Math.round(guaranteedComp(contract, week))
  const release = contract === undefined ? null : terminationCost(contract, week)
  const cost = renew ? (offer?.signingBonus ?? 0) : (release ?? 0)
  const remaining = contract === undefined ? null : Math.max(0, contract.endWeekExclusive - week)
  const consequence = !ok
    ? `${refusal.reason} ${refusal.remedy}`.trim()
    : renew && offer !== null
      ? `Pays a ${dollars(offer.signingBonus)} signing bonus now. ${talent.name} stays under contract through Week ${String(offer.endWeekExclusive)} (${contractTermLabel(offer.termWeeks)}) at ${dollars(weeklySalary(offer.annualSalary))} a week — ${dollars(offer.annualSalary)} a year. Nothing else about the person changes.`
      : `Pays ${dollars(cost)} in termination now (half of the ${dollars(guaranteed ?? 0)} still guaranteed through Week ${String(contract?.endWeekExclusive ?? week)}). ${talent.name} leaves the roster this week as a free agent. Recorded credits and career history stay on the record.`
  return {
    financial: ok && successor !== null ? financialConsequence(state, successor) : null,
    intentId,
    kind: conversion.kind,
    commitLabel: conversion.commitLabel,
    startsNow: ok,
    queues: false,
    queueNote: null,
    ok,
    verb: draft.verb,
    talentId: talent.id,
    talentName: talent.name,
    currentEndWeekExclusive: contract?.endWeekExclusive ?? null,
    currentRemainingWeeks: remaining,
    renewalOpen: contract !== undefined && renewalWindowOpen(contract, week),
    termWeeks: renew && offer !== null ? offer.termWeeks : null,
    termLabel: renew && offer !== null ? contractTermLabel(offer.termWeeks) : null,
    annualSalary: renew && offer !== null ? offer.annualSalary : null,
    weeklySalary: renew && offer !== null ? weeklySalary(offer.annualSalary) : null,
    signingBonus: renew && offer !== null ? offer.signingBonus : null,
    newEndWeekExclusive: renew && offer !== null ? offer.endWeekExclusive : null,
    terminationCost: renew ? null : release,
    guaranteedRemaining: renew ? null : guaranteed,
    cost,
    refusal: refusal === null ? null : refusal.code,
    refusalReason: refusal === null ? null : refusal.reason,
    refusalRemedy: refusal === null ? null : refusal.remedy,
    cashBefore,
    cashAfter: cashBefore - cost,
    affordable: canAfford(state, cost).ok,
    consequence,
  }
}

// ── P14A.1 — the market-proposal route (propose / revise / withdraw) ─────────
//
// The same shape as the contract family above and for the same reason: the client
// never prices, never decides eligibility and never constructs an engine payload.
// What differs is what a commit MEANS — a proposal changes no contract and moves no
// money this week; it stands until the case's decision week, when the person chooses
// among every surviving proposal (companion §2.1.3/§2.1.7). Every authority is the
// engine's own: `caseForTalent`/`caseOpenForTalent` (is there a case), `marketEligibility`
// (may this studio propose), `proposalDraft` (the price, re-derived at the read week),
// `canAfford` (the accepted D-12 gate on the bonus) and `submitProposal`/`withdrawProposal`.

/** P14B.1: the promise a propose/revise draft may carry. The proposed contract
 * interval it is checked against comes from the draft's own term and the case's
 * decision week — a client never names either. */
export type MarketPromiseDraft = {
  family: PromiseFamily
  count: number
  windowStartWeek: number
  dueWeekExclusive: number
}

export type MarketProposalDraft = {
  verb: 'propose' | 'revise' | 'withdraw'
  talentId: string
  issuerStudioId: string
  /** Required for propose/revise; ignored by withdraw. */
  termWeeks?: number | null
  premiumTier?: number | null
  /** Optional, and null when the draft carries none. B.1 PREVIEWS a promise here:
   * the verdict rides the quote, and no commit path attaches one (attachment is the
   * engine's own entry), so nothing on this route can bind a promise. */
  promise?: MarketPromiseDraft | null
}

export type MarketProposalRefusal = {
  code: BridgeMarketProposalRefusalKind
  reason: string
  remedy: string
}

export type MarketProposalConversionOk = {
  ok: true
  kind: 'marketProposalAction'
  draft: MarketProposalDraft
  talent: Talent
  commitLabel: string
  /** null for withdraw (and for a draft refused before pricing). */
  termWeeks: number | null
  premiumTier: number | null
  annualSalary: number | null
  signingBonus: number | null
  effectiveWeek: number | null
  decisionWeek: number | null
  refusal: MarketProposalRefusal | null
  /** The §4.3 verdict for the drafted promise; null when the draft carried none
   * (and on withdraw, and on a draft refused before pricing). */
  promise: BridgeMarketPromiseQuoteSnapshot | null
  apply: (state: GameState) => ActionOutcome
}

export type MarketProposalConversion = MarketProposalConversionOk | { ok: false; error: string }

/** The proposal refusal on THIS state, or null when the verb is legal. */
function liveMarketRefusal(state: GameState, draft: MarketProposalDraft, talent: Talent): MarketProposalRefusal | null {
  const week = state.market.tick
  if (!caseOpenForTalent(state, talent.id, week)) {
    return {
      code: 'noOpenCase',
      reason: `${talent.name} has no open market case.`,
      remedy: 'A proposal is only possible while a case is open — free agents are signed directly.',
    }
  }
  if (draft.verb === 'withdraw') {
    const mine = currentProposals(state, talent.id).some((p) => p.issuerStudioId === draft.issuerStudioId)
    return mine ? null : {
      code: 'noCurrentProposal',
      reason: `No current proposal for ${talent.name} to withdraw.`,
      remedy: 'Submit a proposal first.',
    }
  }
  if (!marketEligibility(state, talent.id, week).proposers.includes(draft.issuerStudioId)) {
    return {
      code: 'notEligibleProposer',
      reason: `This studio may not propose for ${talent.name} this week.`,
      remedy: 'Only an entered studio may propose, and only while the person is in an approved window.',
    }
  }
  const priced = proposalDraft(state, draft.issuerStudioId, talent.id, draft.termWeeks ?? 0, draft.premiumTier ?? 0, week)
  // The D-12 gate is the PLAYER's; a rival issuer answers to its own P12 reserve rule
  // inside `submitProposal`, which this route never second-guesses.
  if (draft.issuerStudioId === state.hollywood?.playerStudioId) {
    const affordability = canAfford(state, priced.signingBonus)
    if (!affordability.ok) {
      return {
        code: 'insufficientFunds',
        reason: `The studio cannot cover the ${dollars(priced.signingBonus)} signing bonus this proposal would owe at settlement (${affordability.reason}).`,
        remedy: 'Choose a shorter term or a lower tier, or propose once cash allows.',
      }
    }
  }
  return null
}

/**
 * ONE module-level `apply`, not a fresh closure per conversion: two conversions of the
 * same draft on the same state must be INDISTINGUISHABLE (the accepted "a quote mutates
 * nothing and asking again is deterministic" invariant is asserted by deep equality, and
 * two distinct closures are never deeply equal). The draft it commits is its own `this`.
 */
function applyMarketProposal(this: MarketProposalConversionOk, current: GameState): ActionOutcome {
  // Commit revalidates: the same authorities, the live state.
  const live = liveMarketRefusal(current, this.draft, this.talent)
  if (live !== null) return { ok: false, error: `${live.reason} ${live.remedy}`.trim() }
  try {
    const next = this.draft.verb === 'withdraw'
      ? withdrawProposal(current, this.draft.talentId, this.draft.issuerStudioId)
      : submitProposal(current, {
          talentId: this.draft.talentId,
          issuerStudioId: this.draft.issuerStudioId,
          termWeeks: this.termWeeks ?? 0,
          premiumTier: this.premiumTier ?? 0,
        })
    return { ok: true, next }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

/** The ONLY conversion from a market-proposal draft to the engine. */
export function marketProposalDraftToEngine(state: GameState, draft: MarketProposalDraft): MarketProposalConversion {
  const talent = talentById(state, draft.talentId)
  if (talent === undefined) {
    return { ok: false, error: `"${draft.talentId}" is not a person this world knows.` }
  }
  const priced = draft.verb === 'withdraw'
  if (!priced) {
    if (draft.termWeeks === null || draft.termWeeks === undefined || !TUNING.CONTRACT_TERM_OPTIONS.includes(draft.termWeeks)) {
      return { ok: false, error: 'Choose one of the published terms before proposing.' }
    }
    if (draft.premiumTier === null || draft.premiumTier === undefined || !isPremiumTier(draft.premiumTier)) {
      return { ok: false, error: 'Choose one of the published compensation tiers before proposing.' }
    }
  }
  const week = state.market.tick
  const view = caseForTalent(state, talent.id, week)
  const refusal = liveMarketRefusal(state, draft, talent)
  // Priced through the engine's own draft entry at the READ week, so what the sheet
  // shows is what settlement will re-derive from the same material terms.
  const quote = priced || refusal?.code === 'noOpenCase'
    ? null
    : proposalDraft(state, draft.issuerStudioId, talent.id, draft.termWeeks ?? 0, draft.premiumTier ?? 0, week)
  const termLabel = priced ? '' : contractTermLabel(draft.termWeeks ?? 0).toUpperCase()
  const commitLabel = draft.verb === 'withdraw'
    ? `WITHDRAW PROPOSAL — ${talent.name.toUpperCase()}`
    : `${draft.verb === 'revise' ? 'REVISE' : 'SUBMIT'} PROPOSAL — ${talent.name.toUpperCase()} · ${termLabel} · DECIDES WEEK ${String(view?.decisionWeek ?? week)}`
  return {
    ok: true,
    kind: 'marketProposalAction',
    draft,
    talent,
    commitLabel,
    termWeeks: quote?.termWeeks ?? null,
    premiumTier: quote?.premiumTier ?? null,
    annualSalary: quote?.annualSalary ?? null,
    signingBonus: quote?.signingBonus ?? null,
    effectiveWeek: quote?.startWeek ?? null,
    decisionWeek: view?.decisionWeek ?? null,
    refusal,
    // The window is read against the contract THIS draft proposes: the decision week
    // the engine itself priced, and the draft's own term. No second interval exists.
    promise: draft.promise === undefined || draft.promise === null || quote === null
      ? null
      : promiseQuoteSnapshot(state, draft.issuerStudioId, talent.id, {
          family: draft.promise.family,
          count: draft.promise.count,
          windowStartWeek: draft.promise.windowStartWeek,
          dueWeekExclusive: draft.promise.dueWeekExclusive,
          startWeek: quote.startWeek,
          termWeeks: quote.termWeeks,
        }, week),
    apply: applyMarketProposal,
  }
}

/** The market-proposal consequence sheet Unity renders verbatim. */
export function marketProposalQuoteSnapshot(
  state: GameState,
  draft: MarketProposalDraft,
  conversion: MarketProposalConversionOk,
  intentId: string,
): BridgeMarketProposalQuoteSnapshot {
  const { talent, refusal, annualSalary, signingBonus, termWeeks, decisionWeek } = conversion
  const ok = refusal === null
  const consequence = !ok
    ? `${refusal.reason} ${refusal.remedy}`.trim()
    : draft.verb === 'withdraw'
      ? `Withdraws your proposal for ${talent.name}. Nothing is charged, and you may propose again while the case is open.`
      : `Stands until Week ${String(decisionWeek ?? state.market.tick)}, when ${talent.name} chooses among every proposal on the table. If they choose yours, the contract runs ${contractTermLabel(termWeeks ?? 0)} at ${dollars(annualSalary ?? 0)} a year and the ${dollars(signingBonus ?? 0)} signing bonus is paid then — nothing is charged now. A competing studio's terms stay UNKNOWN.`
  return {
    intentId,
    kind: 'marketProposalAction',
    commitLabel: conversion.commitLabel,
    startsNow: false,
    queues: true,
    queueNote: decisionWeek === null ? null : `Settles in Week ${String(decisionWeek)}.`,
    ok,
    verb: draft.verb,
    talentId: talent.id,
    talentName: talent.name,
    decisionWeek,
    decisionWeekLabel: decisionWeek === null ? null : campaignDate(decisionWeek).label,
    termWeeks,
    termLabel: termWeeks === null ? null : contractTermLabel(termWeeks),
    premiumTier: conversion.premiumTier,
    annualSalary,
    signingBonus,
    effectiveWeek: conversion.effectiveWeek,
    refusal: refusal === null ? null : refusal.code,
    refusalReason: refusal === null ? null : refusal.reason,
    refusalRemedy: refusal === null ? null : refusal.remedy,
    affordable: signingBonus === null ? true : canAfford(state, signingBonus).ok,
    consequence,
    promise: conversion.promise,
  }
}

/** The player's own issuer identity for every market proposal this route mints. */
export function playerProposalDraft(state: GameState, payload: BridgeMarketProposalDraftPayload): MarketProposalDraft {
  return {
    verb: payload.verb,
    talentId: payload.talentId,
    issuerStudioId: state.hollywood?.playerStudioId ?? '',
    termWeeks: payload.termWeeks,
    premiumTier: payload.premiumTier,
    promise: payload.promise ?? null,
  }
}
