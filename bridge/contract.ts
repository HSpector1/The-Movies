// ── P10-R1 — the contract quote family: renewal / early release → consequence → commit ──
//
// The accepted D-11 employment law already carries both material contract actions
// (`renewContract` — extend inside the renewal window at the engine's own offer;
// `releaseTalent` — early release at the engine's own termination cost) with their
// refusals (D-11.7 window, D-12 solvency on the signing bonus, the screenplay-task
// guard on release). What was missing was the ROUTE: no quote family carried them
// across the bridge, so the Profile could only show the contract read-only. This
// module is that route and nothing more. It composes the existing authorities
// (`activeContract`, `renewalWindowOpen`, `contractOffer[Options]`, `terminationCost`,
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
  contractOffer,
  contractOfferOptions,
  guaranteedComp,
  renewalWindowOpen,
  terminationCost,
  weeklySalary,
  type Contract,
  type ContractOffer,
  type GameState,
  type Talent,
} from '../src/core/index.ts'
import { TUNING } from '../src/core/tuning.ts'
import type { ActionOutcome } from '../ui/src/engine/adapter.ts'
import type {
  BridgeContractDraftPayload,
  BridgeContractQuoteSnapshot,
  BridgeContractRefusalKind,
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
    renewalTerms: renew === null ? contractOfferOptions(state, talentId).map(renewalTerm) : [],
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
  const offer = contractOffer(state, talent.id, draft.termWeeks ?? 0)
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
    ? contractOffer(state, talent.id, draft.termWeeks ?? 0)
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
