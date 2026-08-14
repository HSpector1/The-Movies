// Week-208 roster-wall renewal policies.
//
// ANALYSIS ONLY. This module owns no engine state and uses only public employment
// reads plus the public renewContract action. Policy memory is deterministic,
// serializable harness state; it is never written into a GameState or SaveFile.

import {
  FOUNDING_MINIMUMS,
  applyActions,
  canAfford,
  contractOffer,
  renewalWindowOpen,
} from '../../core/index.js'
import type {
  Contract,
  ContractOffer,
  CreativeRole,
  GameState,
  LedgerEntry,
} from '../../core/index.js'

export const ROSTER_CONTINUATION_POLICY_IDS = [
  'C0-no-renewal',
  'C1-current-retry-all',
  'C2-cheapest-bonus-first',
  'C3-role-coverage-first',
  'C4-last-legal-role-first',
  'C5-spread-role-first',
  'C6-mixed-term-role-first',
] as const

export type RosterContinuationPolicyId =
  (typeof ROSTER_CONTINUATION_POLICY_IDS)[number]

export const ROSTER_RENEWAL_TERMS = [52, 104, 156, 208] as const
export type RosterRenewalTerm = (typeof ROSTER_RENEWAL_TERMS)[number]

const ROLE_ORDER = ['actor', 'director', 'writer', 'craft'] as const

export type RenewalSchedule = {
  targetWeek: number
  priorityRank: number
}

export type RenewalPolicyMemory = {
  entryWeek: number
  scheduleByContractKey: Record<string, RenewalSchedule>
  mixedTermByTalentId: Record<string, RosterRenewalTerm>
}

export type RenewalCandidate = {
  contractKey: string
  talentId: string
  role: CreativeRole
  contract: Contract
  offer: ContractOffer
}

export type RoleCoverageSelection = {
  selectedTalentIds: string[]
  totalSigningBonus: number
  completeFoundingMinimums: boolean
  rolesMeetingMinimum: number
  rolesCovered: number
  headcount: number
}

export type PlannedRenewal = RenewalCandidate & {
  orderRank: number
  targetWeek: number | null
  selectedTerm: RosterRenewalTerm
  selectedForAffordableRoleSet: boolean
}

export type RenewalIntentObservation = {
  intentId: string
  contractKey: string
  talentId: string
  role: CreativeRole
  targetWeek: number | null
  actualWeek: number
  orderRank: number
  selectedTerm: RosterRenewalTerm
  offer: ContractOffer
  preActionCash: number
  affordable: boolean
  accepted: boolean
  rejectionReason: string | null
  postActionCash: number
  signingBonusLedgerIndex: number | null
  signingBonusLedgerEntry: LedgerEntry | null
  rngBefore: string
  rngAfter: string
}

export type RenewalPolicyStep = {
  state: GameState
  memory: RenewalPolicyMemory
  plans: PlannedRenewal[]
  intents: RenewalIntentObservation[]
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function assertPolicyId(policyId: RosterContinuationPolicyId): void {
  if (!(ROSTER_CONTINUATION_POLICY_IDS as readonly string[]).includes(policyId)) {
    throw new Error(`roster-wall renewal: unknown continuation policy ${String(policyId)}`)
  }
}

function assertTerm(term: number): RosterRenewalTerm {
  if (!(ROSTER_RENEWAL_TERMS as readonly number[]).includes(term)) {
    throw new Error(`roster-wall renewal: unsupported term ${String(term)}`)
  }
  return term as RosterRenewalTerm
}

export function renewalContractKey(contract: Contract): string {
  return `${contract.talentId}:${String(contract.startWeek)}:${String(contract.endWeekExclusive)}`
}

export function createRenewalPolicyMemory(entryWeek: number): RenewalPolicyMemory {
  if (!Number.isInteger(entryWeek) || entryWeek < 0) {
    throw new Error('roster-wall renewal: entryWeek must be a non-negative integer')
  }
  return {
    entryWeek,
    scheduleByContractKey: {},
    mixedTermByTalentId: {},
  }
}

function talentRole(state: GameState, talentId: string): CreativeRole {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(`roster-wall renewal: contract references unknown talent "${talentId}"`)
  }
  return talent.role
}

function candidatesForTerm(
  state: GameState,
  termForTalent: (talentId: string) => RosterRenewalTerm,
): RenewalCandidate[] {
  return state.contracts
    .filter((contract) => renewalWindowOpen(contract, state.market.tick))
    .map((contract) => {
      const term = termForTalent(contract.talentId)
      return {
        contractKey: renewalContractKey(contract),
        talentId: contract.talentId,
        role: talentRole(state, contract.talentId),
        contract,
        offer: contractOffer(state, contract.talentId, term),
      }
    })
}

type SelectionScore = {
  completeFoundingMinimums: boolean
  rolesMeetingMinimum: number
  rolesCovered: number
  headcount: number
  totalSigningBonus: number
  talentIds: string[]
}

function scoreSelection(candidates: readonly RenewalCandidate[]): SelectionScore {
  const coverage: Record<CreativeRole, number> = {
    actor: 0,
    director: 0,
    writer: 0,
    craft: 0,
  }
  let totalSigningBonus = 0
  for (const candidate of candidates) {
    coverage[candidate.role]++
    totalSigningBonus += candidate.offer.signingBonus
  }
  const rolesMeetingMinimum = ROLE_ORDER.filter(
    (role) => coverage[role] >= FOUNDING_MINIMUMS[role],
  ).length
  const talentIds = candidates.map((candidate) => candidate.talentId).sort(compareId)
  return {
    completeFoundingMinimums: rolesMeetingMinimum === ROLE_ORDER.length,
    rolesMeetingMinimum,
    rolesCovered: ROLE_ORDER.filter((role) => coverage[role] > 0).length,
    headcount: candidates.length,
    totalSigningBonus,
    talentIds,
  }
}

function compareTalentIdLists(a: readonly string[], b: readonly string[]): number {
  for (let index = 0; index < Math.min(a.length, b.length); index++) {
    const delta = compareId(a[index]!, b[index]!)
    if (delta !== 0) return delta
  }
  return a.length - b.length
}

/**
 * Return a negative value when `a` is the better lexicographic role-coverage
 * selection. Cost is minimized only after coverage and headcount, exactly as the
 * frozen research contract requires.
 */
function compareSelectionScore(a: SelectionScore, b: SelectionScore): number {
  if (a.completeFoundingMinimums !== b.completeFoundingMinimums) {
    return a.completeFoundingMinimums ? -1 : 1
  }
  if (a.rolesCovered !== b.rolesCovered) return b.rolesCovered - a.rolesCovered
  if (a.headcount !== b.headcount) return b.headcount - a.headcount
  if (a.totalSigningBonus !== b.totalSigningBonus) {
    return a.totalSigningBonus - b.totalSigningBonus
  }
  return compareTalentIdLists(a.talentIds, b.talentIds)
}

/**
 * Exact bounded subset optimizer for C3/C4/C5/C6. It reads only role, current
 * quote, and current cash. Campaign cohorts are bounded (13 at the largest
 * canonical policy), so exhaustive enumeration is clearer and safer than a
 * heuristic. The returned subset is the role-protective prefix; every remaining
 * owner is still attempted afterward and therefore remains visible as a reject.
 */
export function selectAffordableRoleCoverage(
  candidates: readonly RenewalCandidate[],
  cash: number,
): RoleCoverageSelection {
  if (candidates.length > 20) {
    throw new Error('roster-wall renewal: role optimizer is bounded to 20 owners')
  }
  const canonical = [...candidates].sort((a, b) => compareId(a.talentId, b.talentId))
  let best: { score: SelectionScore; selectedTalentIds: string[] } | null = null
  const combinations = 2 ** canonical.length
  for (let mask = 0; mask < combinations; mask++) {
    const selected: RenewalCandidate[] = []
    let total = 0
    for (let index = 0; index < canonical.length; index++) {
      if ((mask & (2 ** index)) === 0) continue
      const candidate = canonical[index]!
      total += candidate.offer.signingBonus
      if (total > cash) break
      selected.push(candidate)
    }
    if (total > cash) continue
    const score = scoreSelection(selected)
    if (best === null || compareSelectionScore(score, best.score) < 0) {
      best = { score, selectedTalentIds: score.talentIds }
    }
  }
  if (best === null) {
    // The empty set is affordable only when cash is at least zero. A negative-cash
    // state has no legal voluntary renewal; represent that same empty answer.
    best = { score: scoreSelection([]), selectedTalentIds: [] }
  }
  return {
    selectedTalentIds: best.selectedTalentIds,
    totalSigningBonus: best.score.totalSigningBonus,
    completeFoundingMinimums: best.score.completeFoundingMinimums,
    rolesMeetingMinimum: best.score.rolesMeetingMinimum,
    rolesCovered: best.score.rolesCovered,
    headcount: best.score.headcount,
  }
}

function roleFirstOrder(
  candidates: readonly RenewalCandidate[],
  cash: number,
): { ordered: RenewalCandidate[]; selected: ReadonlySet<string> } {
  const selection = selectAffordableRoleCoverage(candidates, cash)
  const selected = new Set(selection.selectedTalentIds)
  const ordered = [...candidates].sort((a, b) => {
    const aSelected = selected.has(a.talentId)
    const bSelected = selected.has(b.talentId)
    if (aSelected !== bSelected) return aSelected ? -1 : 1
    return compareId(a.talentId, b.talentId)
  })
  return { ordered, selected }
}

function cloneMemory(memory: RenewalPolicyMemory): RenewalPolicyMemory {
  return {
    entryWeek: memory.entryWeek,
    scheduleByContractKey: Object.fromEntries(
      Object.entries(memory.scheduleByContractKey)
        .sort(([a], [b]) => compareId(a, b))
        .map(([key, value]) => [key, { ...value }]),
    ),
    mixedTermByTalentId: Object.fromEntries(
      Object.entries(memory.mixedTermByTalentId).sort(([a], [b]) => compareId(a, b)),
    ) as Record<string, RosterRenewalTerm>,
  }
}

function ensureMixedTerms(
  memory: RenewalPolicyMemory,
  orderedCandidates: readonly RenewalCandidate[],
): void {
  let nextIndex = Object.keys(memory.mixedTermByTalentId).length
  for (const candidate of orderedCandidates) {
    if (memory.mixedTermByTalentId[candidate.talentId] !== undefined) continue
    memory.mixedTermByTalentId[candidate.talentId] =
      ROSTER_RENEWAL_TERMS[nextIndex % ROSTER_RENEWAL_TERMS.length]!
    nextIndex++
  }
}

function mixedTerm(memory: RenewalPolicyMemory, talentId: string): RosterRenewalTerm {
  return memory.mixedTermByTalentId[talentId] ?? 208
}

function ensureSpreadSchedule(
  memory: RenewalPolicyMemory,
  candidates: readonly RenewalCandidate[],
  cash: number,
): void {
  const unscheduled = candidates.filter(
    (candidate) => memory.scheduleByContractKey[candidate.contractKey] === undefined,
  )
  if (unscheduled.length === 0) return
  const { ordered } = roleFirstOrder(unscheduled, cash)
  for (let index = 0; index < ordered.length; index++) {
    const candidate = ordered[index]!
    const windowStart = candidate.contract.endWeekExclusive - 12
    memory.scheduleByContractKey[candidate.contractKey] = {
      targetWeek: windowStart + Math.floor((index * 12) / ordered.length),
      priorityRank: index,
    }
  }
}

function planned(
  candidate: RenewalCandidate,
  orderRank: number,
  selectedTerm: RosterRenewalTerm,
  selected: ReadonlySet<string>,
  targetWeek: number | null,
): PlannedRenewal {
  const offer =
    candidate.offer.termWeeks === selectedTerm
      ? candidate.offer
      : { ...contractOfferForCandidate(candidate, selectedTerm) }
  return {
    ...candidate,
    offer,
    orderRank,
    targetWeek,
    selectedTerm,
    selectedForAffordableRoleSet: selected.has(candidate.talentId),
  }
}

function contractOfferForCandidate(
  candidate: RenewalCandidate,
  selectedTerm: RosterRenewalTerm,
): ContractOffer {
  // `candidate` intentionally does not retain a GameState. Callers replace its
  // offer before reaching this helper, so this branch is a defensive invariant.
  if (candidate.offer.termWeeks !== selectedTerm) {
    throw new Error('roster-wall renewal: candidate offer term was not refreshed')
  }
  return candidate.offer
}

/** Plan this week's public renewal actions without mutating the engine state. */
export function planRenewals(
  state: GameState,
  policyId: RosterContinuationPolicyId,
  inputMemory: RenewalPolicyMemory,
): { plans: PlannedRenewal[]; memory: RenewalPolicyMemory } {
  assertPolicyId(policyId)
  const memory = cloneMemory(inputMemory)
  if (policyId === 'C0-no-renewal') return { plans: [], memory }

  if (policyId === 'C6-mixed-term-role-first') {
    const baseCandidates = candidatesForTerm(state, () => 208)
    // C6 changes only the legal term attached to the frozen C3 priority. If the
    // cheaper mixed-term quotes are fed back through the role optimizer, they can
    // silently select and reorder a different cohort, which is no longer the
    // contract's "C3 role priority + round-robin terms" policy.
    const { ordered: baseOrder, selected } = roleFirstOrder(
      baseCandidates,
      state.studio.cash,
    )
    ensureMixedTerms(memory, baseOrder)
    const candidates = candidatesForTerm(state, (talentId) => mixedTerm(memory, talentId))
    const candidatesByTalentId = new Map(
      candidates.map((candidate) => [candidate.talentId, candidate]),
    )
    const ordered = baseOrder.map((baseCandidate) => {
      const candidate = candidatesByTalentId.get(baseCandidate.talentId)
      if (candidate === undefined) {
        throw new Error('roster-wall renewal: mixed-term candidate set changed during planning')
      }
      return candidate
    })
    return {
      plans: ordered.map((candidate, index) =>
        planned(candidate, index, assertTerm(candidate.offer.termWeeks), selected, null),
      ),
      memory,
    }
  }

  const candidates = candidatesForTerm(state, () => 208)
  if (policyId === 'C1-current-retry-all') {
    const ordered = [...candidates].sort(
      (a, b) =>
        a.contract.endWeekExclusive - b.contract.endWeekExclusive ||
        compareId(a.talentId, b.talentId),
    )
    const selected = new Set(ordered.map((candidate) => candidate.talentId))
    return {
      plans: ordered.map((candidate, index) => planned(candidate, index, 208, selected, null)),
      memory,
    }
  }
  if (policyId === 'C2-cheapest-bonus-first') {
    const ordered = [...candidates].sort(
      (a, b) => a.offer.signingBonus - b.offer.signingBonus || compareId(a.talentId, b.talentId),
    )
    const selected = new Set(ordered.map((candidate) => candidate.talentId))
    return {
      plans: ordered.map((candidate, index) => planned(candidate, index, 208, selected, null)),
      memory,
    }
  }

  const { ordered, selected } = roleFirstOrder(candidates, state.studio.cash)
  if (policyId === 'C3-role-coverage-first') {
    return {
      plans: ordered.map((candidate, index) => planned(candidate, index, 208, selected, null)),
      memory,
    }
  }
  if (policyId === 'C4-last-legal-role-first') {
    const lastLegal = ordered.filter(
      (candidate) => state.market.tick === candidate.contract.endWeekExclusive - 1,
    )
    return {
      plans: lastLegal.map((candidate, index) => planned(candidate, index, 208, selected, null)),
      memory,
    }
  }

  ensureSpreadSchedule(memory, candidates, state.studio.cash)
  const eligible = ordered
    .filter((candidate) => {
      const schedule = memory.scheduleByContractKey[candidate.contractKey]
      if (schedule === undefined) {
        throw new Error('roster-wall renewal: spread candidate has no deterministic schedule')
      }
      return state.market.tick >= schedule.targetWeek
    })
    .sort((a, b) => {
      const aSchedule = memory.scheduleByContractKey[a.contractKey]!
      const bSchedule = memory.scheduleByContractKey[b.contractKey]!
      return (
        aSchedule.targetWeek - bSchedule.targetWeek ||
        aSchedule.priorityRank - bSchedule.priorityRank ||
        compareId(a.talentId, b.talentId)
      )
    })
  return {
    plans: eligible.map((candidate, index) =>
      planned(
        candidate,
        index,
        208,
        selected,
        memory.scheduleByContractKey[candidate.contractKey]!.targetWeek,
      ),
    ),
    memory,
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** Execute the planned public renewContract actions and capture their exact effects. */
export function applyRenewalPolicy(
  state: GameState,
  policyId: RosterContinuationPolicyId,
  inputMemory: RenewalPolicyMemory,
): RenewalPolicyStep {
  const plannedStep = planRenewals(state, policyId, inputMemory)
  let current = state
  const intents: RenewalIntentObservation[] = []
  for (const plan of plannedStep.plans) {
    const actualWeek = current.market.tick
    const preActionCash = current.studio.cash
    const rngBefore = current.rngState
    const ledgerLength = current.ledger.length
    const offer = contractOffer(current, plan.talentId, plan.selectedTerm)
    const affordable = canAfford(current, offer.signingBonus).ok
    let accepted = false
    let rejectionReason: string | null = null
    try {
      current = applyActions(current, [
        { kind: 'renewContract', talentId: plan.talentId, termWeeks: plan.selectedTerm },
      ])
      accepted = true
    } catch (error) {
      rejectionReason = errorMessage(error)
    }
    const appended = current.ledger.slice(ledgerLength)
    const signingBonusRows = appended
      .map((entry, offset) => ({ entry, index: ledgerLength + offset }))
      .filter(
        ({ entry }) =>
          entry.kind === 'signingBonus' &&
          entry.talentId === plan.talentId &&
          entry.week === actualWeek,
      )
    if (accepted && signingBonusRows.length !== 1) {
      throw new Error('roster-wall renewal: accepted renewal did not append exactly one bonus row')
    }
    if (!accepted && appended.length !== 0) {
      throw new Error('roster-wall renewal: rejected renewal mutated the ledger')
    }
    if (current.rngState !== rngBefore) {
      throw new Error('roster-wall renewal: quote/action consumed RNG')
    }
    const bonus = signingBonusRows[0]
    intents.push({
      intentId: `${policyId}:${String(actualWeek)}:${String(plan.orderRank).padStart(2, '0')}:${plan.contractKey}`,
      contractKey: plan.contractKey,
      talentId: plan.talentId,
      role: plan.role,
      targetWeek: plan.targetWeek,
      actualWeek,
      orderRank: plan.orderRank,
      selectedTerm: plan.selectedTerm,
      offer,
      preActionCash,
      affordable,
      accepted,
      rejectionReason,
      postActionCash: current.studio.cash,
      signingBonusLedgerIndex: bonus?.index ?? null,
      signingBonusLedgerEntry: bonus === undefined ? null : { ...bonus.entry },
      rngBefore,
      rngAfter: current.rngState,
    })
  }
  return { state: current, memory: plannedStep.memory, plans: plannedStep.plans, intents }
}
