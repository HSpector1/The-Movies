import { absorbedWeekOf } from './operatingState.js'
// ── P15B Wave 2 and Wave 3 (record 1370-ar): the condition in the live game ───────────────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1357-A §3 (the fact
// adapter), §4 (the root and its validator), §5 (the weekly step), §6 (loans) as adopted by 1357-F
// (Amendment 1: the P15 domain sequence and phase triple on every event and loan; condition events in
// ascending studioId, then rival loans in ascending studioId, within one boundary); 1352-F3 decision 4;
// 1352-A §4.3 (remedy families) for Wave 3's one legal release predicate; 1366-O O6 (a rival's loan principal
// ends R8's cost cutting, atomically with the booking: the rival policy below).
//
// The law is Wave 1's `corporateCondition.ts` and `studioLoan.ts`, always called through their module
// exports. Nothing here imports `rng.js`: the step draws nothing and runs after `rng.serialize()`.
// Every studio follows one law; no branch reads a studio flag except to find its cash and cost.
// Error messages carry no money value: a rival's figures stay private.

import { CORPORATE_CONDITION_VERSION, remedies, stepCondition,
  type Condition, type ConditionFacts, type RemedyCapability, type RemedyFamily } from './corporateCondition.js'
import { seatingProduction } from './employment.js'
import { moveRivalMoney } from './hollywood.js'
import { P15_PHASE_TABLES, p15PhaseTriple } from './p15Phases.js'
import { studioWeeklyFixedCost } from './powerRankingArchive.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import { activeScriptWriterAssignments } from './scriptDevelopment.js'
import { contractLoan, loanEligible, loanInstallmentDue, loanMaxPrincipal, STUDIO_LOAN_VERSION } from './studioLoan.js'
import { closedWeekOf } from './operatingState.js'
import { LOAN_PRINCIPAL_LEDGER_NOTE, TUNING } from './tuning.js'
import type { HollywoodState, RivalBusiness } from './hollywoodTypes.js'
import type { ConditionEvent, CorporateConditionRoot, GameState, LedgerEntry, ScriptDevelopment, StudioConditionRecord, StudioLoanRecord } from './types.js'

export const CONDITION_PHASE_ID = 'p15b.condition'

// ── the frozen law tables (1357-A §4.1 item 7) ───────────────────────────────────────────────
// A validator reconciles stored rows against these literals, never against live TUNING, so a retune
// cannot re-judge an old save. tests/p15b2-corporate-condition-save.test.ts pins them equal to TUNING
// while both versions are v1; a retune adds a version here and bumps the law's version export.
export const CONDITION_LAWS = Object.freeze({
  'corporate-condition/v1': Object.freeze({
    CORPORATE_WARN_COVER_WEEKS: 4, CORPORATE_WARN_SUSTAIN_WEEKS: 4, CORPORATE_CLEAR_WEEKS: 4,
    CORPORATE_DISTRESS_SUSTAIN_WEEKS: 8, CORPORATE_RECOVERY_STABLE_WEEKS: 13, CORPORATE_CLOSURE_DISTRESS_WEEKS: 26,
  }),
})
export const LOAN_LAWS = Object.freeze({
  'studio-loan/v1': Object.freeze({ LOAN_MAX_FIXED_COST_WEEKS: 26, LOAN_TERM_WEEKS: 52, LOAN_INTEREST_PERCENT: 12, LOAN_AMOUNT_STEP: 1000 }),
})

/** The empty root a fresh world, a migration and a historical lift write: nothing evaluated, recording
 * from `week`; the first evaluation is the boundary after it (1352-F2 ruling 1). Allocators start at 1. */
export const initialCorporateCondition = (week: number): CorporateConditionRoot =>
  ({ version: 1, recordedFromWeek: week, nextEvent: 1, nextLoan: 1, studios: [], events: [], loans: [] })

/** The root a live step reads. A state without it fails here by name, never with a default. */
export function requireCorporateCondition(state: GameState): CorporateConditionRoot {
  const root = (state as Partial<GameState>).corporateCondition
  if (root === undefined) throw new Error('corporate condition: the state has no corporateCondition root; migrate it to Save46 before ticking it')
  return root
}

export function conditionRecord(state: GameState, studioId: string): StudioConditionRecord | undefined {
  return requireCorporateCondition(state).studios.find((r) => r.studioId === studioId)
}

/** Outstanding at T means T ≤ contractedWeek + LOAN_TERM_WEEKS (1357-A §6.4). At most one per studio. An actual
 * closure stops the schedule (Wave-4 contract §2): from the closure week on, a closed studio's loan is no longer
 * outstanding and nothing is due; its stopped balance is the closure record's `loan` (r3, the P16 reader). */
export function outstandingLoan(state: GameState, studioId: string, week: number = state.market.tick): StudioLoanRecord | undefined {
  const root = requireCorporateCondition(state)
  const stop = closedWeekOf(state).get(studioId)
  if (stop !== undefined && week >= stop) return undefined
  return root.loans.find((loan) =>
    loan.studioId === studioId && week >= loan.contractedWeek && week <= loan.contractedWeek + loan.installments.length)
}

/** The installment the advance from `week` charges, 0 without one due (1357-A §3.2, §6.3). */
export function loanInstallmentDueFor(state: GameState, studioId: string, week: number = state.market.tick): number {
  const loan = outstandingLoan(state, studioId, week)
  return loan === undefined ? 0 : loanInstallmentDue({ principal: loan.principal, total: loan.total, contractedWeek: loan.contractedWeek, installments: loan.installments }, week)
}

function industryOf(state: GameState): HollywoodState {
  if (state.hollywood === null) throw new Error('corporate condition: no industry to evaluate')
  return state.hollywood
}
function businessOf(h: HollywoodState, studioId: string): RivalBusiness {
  const business = h.businesses.find((b) => b.studioId === studioId)
  if (business === undefined) throw new Error(`corporate condition: studio ${studioId} has no business`)
  return business
}

/** 1357-A §3.2: the position at the start of week W = market.tick, the week the advance produced. */
export function conditionFacts(state: GameState, studioId: string): ConditionFacts {
  const h = industryOf(state)
  const week = state.market.tick
  const cash = studioId === h.playerStudioId ? state.studio.cash : businessOf(h, studioId).account.cash
  const weeklyFixedCost = studioWeeklyFixedCost(state, studioId)
  // 1352-F Amendment 4. The message carries no four-digit figure: a rival's numbers stay private.
  if (!(weeklyFixedCost > 0)) throw new Error(`corporate condition: studio ${studioId} has no positive weekly fixed cost`)
  return { week, cash, weeklyFixedCost, loanInstallment: loanInstallmentDueFor(state, studioId, week) }
}

/** Closure due (1357-A §4): the record stands at `closed`. It settles nothing by itself (§7). */
export function closureDue(state: GameState, studioId: string): boolean {
  return conditionRecord(state, studioId)?.condition.stage === 'closed'
}

const byId = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/** The studios the step evaluates at W (1357-A §3.1), ascending studioId; the player id sorts first. */
function evaluatedStudios(state: GameState, h: HollywoodState, week: number): string[] {
  const ids: string[] = []
  if (state.economyEngagedEver && state.founding === null) ids.push(h.playerStudioId)
  for (const identity of h.identities) {
    if (identity.role === 'rival' && identity.enteredWeek !== null && identity.enteredWeek <= week) ids.push(identity.studioId)
  }
  return ids.sort(byId)
}

/**
 * The weekly step (1357-A §5), wrapping the Power Ranking record and wrapped by the closure phase and the
 * Legacy freeze. At boundary W: each evaluated studio in ascending id, a closed record skipped, is stepped
 * on its facts; a transition appends one event. Then each rival whose new stage is distress and for which
 * the loan law holds contracts the maximum at W and books `loanPrincipal` (§6.2). A world with no
 * industry, or one at or before its recordedFromWeek, returns unchanged.
 */
export function advanceCorporateConditionWeek(state: GameState): GameState {
  const h = state.hollywood
  if (h === null) return state
  const week = state.market.tick
  const root = requireCorporateCondition(state)
  // 1356-F Amendment 2, applied here as the ranking archive applies it: an industry initialized mid-week by an
  // action stamps `originWeek` at the current week, so the first boundary this step can evaluate is strictly
  // above both recordedFromWeek and originWeek.
  if (week <= Math.max(root.recordedFromWeek, h.originWeek)) return state
  const triple = p15PhaseTriple(CONDITION_PHASE_ID, Object.hasOwn(state, 'rights') ? 3 : 2)
  const studios = [...root.studios]
  const events = [...root.events]
  let nextEvent = root.nextEvent
  let sequence = state.p15Sequence.next
  const distressed: string[] = []
  for (const studioId of evaluatedStudios(state, h, week)) {
    const index = studios.findIndex((r) => r.studioId === studioId)
    const prev = index >= 0 ? studios[index]! : undefined
    if (prev?.condition.stage === 'closed' || absorbedWeekOf(state).has(studioId)) continue // 1352-F3 item 1: never evaluated again
    const facts = conditionFacts(state, studioId)
    const { next, transition } = stepCondition(prev?.condition ?? null, facts)
    const record: StudioConditionRecord = { studioId, firstEvaluatedWeek: prev?.firstEvaluatedWeek ?? week, definitionVersion: CORPORATE_CONDITION_VERSION, condition: next }
    if (index >= 0) studios[index] = record
    else studios.push(record)
    if (transition !== null) {
      const event: ConditionEvent = { eventId: `corporate-event-${nextEvent}`, studioId, week, from: transition.from, to: transition.to,
        causes: transition.causes.map((c) => ({ ...c })), definitionVersion: CORPORATE_CONDITION_VERSION, p15DomainSequence: sequence, ...triple }
      nextEvent += 1
      sequence += 1
      events.push(event)
    }
    if (studioId !== h.playerStudioId && next.stage === 'distress') distressed.push(studioId)
  }
  studios.sort((a, b) => byId(a.studioId, b.studioId))

  // §6.2 the rival policy, read every distress week: the maximum at W, booked at W.
  let hollywood = h
  const loans = [...root.loans]
  let nextLoan = root.nextLoan
  for (const studioId of distressed) {
    const weeklyFixedCost = studioWeeklyFixedCost(state, studioId)
    const hasOutstandingLoan = loans.some((loan) => loan.studioId === studioId && week >= loan.contractedWeek && week <= loan.contractedWeek + loan.installments.length)
    if (!loanEligible('distress', weeklyFixedCost, { hasOutstandingLoan, founding: false })) continue
    const principal = loanMaxPrincipal(weeklyFixedCost)
    const contracted = contractLoan(principal, weeklyFixedCost, week)
    hollywood = { ...hollywood, businesses: hollywood.businesses.map((b) => {
      if (b.studioId !== studioId) return b
      const last = b.account.periods.length - 1
      const account = { ...b.account, periods: b.account.periods.map((p, i) => (i === last ? { ...p, movements: { ...p.movements } } : p)) }
      moveRivalMoney(account, 'loanPrincipal', principal, week)
      // 1366-O O6 (1363-A2 §5 "O6 integration contract", RED L1): the committed principal ends R8's cost cutting
      // in the same returned business, one atomic transition. A refused or duplicate loan never reaches this
      // line and an installment never clears it. The next decision runs the ordinary staff()/decide() laws and
      // may lawfully re-enter cutting (no exemption, no hire or greenlight bypass).
      return { ...b, account, costCutting: { version: 1, since: null } }
    }) }
    loans.push({ loanId: `corporate-loan-${nextLoan}`, studioId, lawVersion: STUDIO_LOAN_VERSION, contractedWeek: week, weeklyFixedCostAtContract: weeklyFixedCost,
      principal, total: contracted.total, installments: [...contracted.installments], p15DomainSequence: sequence, ...triple })
    nextLoan += 1
    sequence += 1
  }
  if (studios.length === root.studios.length && events.length === root.events.length && loans.length === root.loans.length && sequence === state.p15Sequence.next
    && studios.every((r, i) => r === root.studios[i])) return state
  return {
    ...state,
    hollywood,
    corporateCondition: { ...root, nextEvent, nextLoan, studios, events, loans },
    p15Sequence: sequence === state.p15Sequence.next ? state.p15Sequence : { ...state.p15Sequence, next: sequence },
  }
}

// ── takeLoan (1357-A §6.1): the player's loan verb ─────────────────────────────────────────
export function applyTakeLoan(state: GameState, principal: number): GameState {
  if (state.founding !== null) throw new Error('A studio cannot borrow during its founding draft.')
  const h = state.hollywood
  const week = state.market.tick
  const record = h === null ? undefined : conditionRecord(state, h.playerStudioId)
  if (h === null || record === undefined || record.condition.week !== week) throw new Error('This studio has no corporate condition this week.')
  const stage = record.condition.stage
  if (stage === 'closed') throw new Error('A studio due for closure cannot borrow.')
  if (stage === 'stable' || stage === 'recovery') throw new Error('Loans are available only in warning or distress.')
  if (outstandingLoan(state, h.playerStudioId, week) !== undefined) throw new Error('This studio is still repaying its loan; one loan at a time.')
  const weeklyFixedCost = studioWeeklyFixedCost(state, h.playerStudioId)
  if (loanMaxPrincipal(weeklyFixedCost) < TUNING.LOAN_AMOUNT_STEP) throw new Error("This studio's fixed costs support no loan.")
  if (!loanEligible(stage, weeklyFixedCost, { hasOutstandingLoan: false, founding: false })) {
    throw new Error('studio loan: the eligibility table and the loan law disagree (internal)')
  }
  const contracted = contractLoan(principal, weeklyFixedCost, week) // refuses a bad principal in its own words
  const root = requireCorporateCondition(state)
  const sequence = state.p15Sequence.next
  const loan: StudioLoanRecord = { loanId: `corporate-loan-${root.nextLoan}`, studioId: h.playerStudioId, lawVersion: STUDIO_LOAN_VERSION, contractedWeek: week,
    weeklyFixedCostAtContract: weeklyFixedCost, principal, total: contracted.total, installments: [...contracted.installments], p15DomainSequence: sequence, ...p15PhaseTriple(CONDITION_PHASE_ID, Object.hasOwn(state, 'rights') ? 3 : 2) }
  const entry: LedgerEntry = { week, kind: 'loanPrincipal', amount: principal, note: LOAN_PRINCIPAL_LEDGER_NOTE }
  return {
    ...state,
    studio: { ...state.studio, cash: state.studio.cash + principal },
    ledger: [...state.ledger, entry],
    corporateCondition: { ...root, nextLoan: root.nextLoan + 1, loans: [...root.loans, loan] },
    p15Sequence: { ...state.p15Sequence, next: sequence + 1 },
  }
}

// ── Wave 3: remedy parity, the one legal release predicate (1352-A §4.3; 1357-A §3.4) ─────────
// The legality of an early release is one rule for every studio: not during a founding draft (the player's
// draft only), not for a person seated on that studio's active production, not for one on that studio's
// active writing assignment. Each studio's POLICY (the rival's reserve, cap and promise rules in
// hollywoodTick.ts; the player's own choice) decides among legal releases; the law decides legality.
// A research seat is not in the law: tests/p13a-research-employment.test.ts pins that the player's
// release of a seated Scientist pauses the project (employment.ts:340).
function hotDevelopment(business: RivalBusiness): ScriptDevelopment {
  return { mode: 'managed', projects: business.activeScriptOrdinals.map((i) => business.development.projects[i]!) }
}

/** The refusal of releasing `talentId` from `studioId` now, or null when the release is legal. The
 * sentences are the player's own (actions.ts applyReleaseTalent), so refusals read identically. */
export function releaseRefusal(state: GameState, studioId: string, talentId: string): string | null {
  const h = state.hollywood
  const player = h === null || studioId === h.playerStudioId
  if (player) {
    if (state.founding !== null) return 'the founding draft is still open; release waits until the studio is founded (R2)'
    const seated = seatingProduction(state, talentId)
    if (seated !== undefined) return `talent "${talentId}" is seated on active production "${seated.id}" until it is released (R2)`
    const writing = activeScriptWriterAssignments(state.scriptDevelopment, state.concepts).find((a) => a.talentId === talentId)
    if (writing !== undefined) return `talent "${talentId}" is ${writing.label} and must finish that screenplay task first`
    return null
  }
  const business = businessOf(h, studioId)
  const seated = business.productions.find((p) => productionCompanyTalentIds([p]).has(talentId))
  if (seated !== undefined) return `talent "${talentId}" is seated on active production "${seated.id}" until it is released (R2)`
  const writing = activeScriptWriterAssignments(hotDevelopment(business), h.concepts).find((a) => a.talentId === talentId)
  if (writing !== undefined) return `talent "${talentId}" is ${writing.label} and must finish that screenplay task first`
  return null
}

/** The contracts of `studioId` a release is legal for this week (1357-A §3.4). */
export function terminableContracts(state: GameState, studioId: string, week: number = state.market.tick): number {
  const h = state.hollywood
  if (h === null || studioId === h.playerStudioId) {
    return state.contracts.filter((c) => c.startWeek <= week && week < c.endWeekExclusive && releaseRefusal(state, studioId, c.talentId) === null).length
  }
  return h.activeEmploymentOrdinals.map((i) => h.employment[i]!)
    .filter((e) => e.studioId === studioId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive
      && releaseRefusal(state, studioId, e.terms.talentId) === null).length
}

/** 1357-A §3.4: the capability the remedy law reads, built from state for either studio. */
export function remedyCapability(state: GameState, studioId: string): RemedyCapability {
  const h = industryOf(state)
  const week = state.market.tick
  if (studioId === h.playerStudioId) {
    return {
      hasPendingRelease: state.studio.activeProductions.length > 0 || state.theatricalRuns.some((run) => run.status === 'active'),
      terminableContracts: terminableContracts(state, studioId, week),
      hasOutstandingLoan: outstandingLoan(state, studioId, week) !== undefined,
      founding: state.founding !== null,
    }
  }
  const business = businessOf(h, studioId)
  return {
    hasPendingRelease: business.productions.length > 0 || business.runs.length > 0,
    terminableContracts: terminableContracts(state, studioId, week),
    hasOutstandingLoan: outstandingLoan(state, studioId, week) !== undefined,
    founding: false,
  }
}

/** The remedy families open to `studioId` this week (1352-A §4.3), [] without a record or once closed. */
export function studioRemedies(state: GameState, studioId: string): RemedyFamily[] {
  const record = conditionRecord(state, studioId)
  if (record === undefined || record.condition.stage === 'closed') return []
  return remedies(record.condition, conditionFacts(state, studioId), remedyCapability(state, studioId))
}

// ── the validator (1357-A §4.1 items 1-7, with 1357-F Amendment 1) ─────────────────────────
const ROOT_KEYS = ['events', 'loans', 'nextEvent', 'nextLoan', 'recordedFromWeek', 'studios', 'version']
const RECORD_KEYS = ['condition', 'definitionVersion', 'firstEvaluatedWeek', 'studioId']
const CONDITION_KEYS = ['clearRun', 'distressWeeks', 'lowRun', 'negativeRun', 'since', 'stage', 'week']
const EVENT_KEYS = ['causes', 'definitionVersion', 'eventId', 'from', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion', 'phaseOrdinal', 'studioId', 'to', 'week']
const LOAN_KEYS = ['contractedWeek', 'installments', 'lawVersion', 'loanId', 'p15DomainSequence', 'phaseId', 'phaseOrderVersion', 'phaseOrdinal', 'principal', 'studioId', 'total', 'weeklyFixedCostAtContract']
const STAGES = ['stable', 'warning', 'distress', 'recovery', 'closed'] as const
type Stage = (typeof STAGES)[number]

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const sameKeys = (value: Record<string, unknown>, keys: readonly string[]): boolean => {
  const own = Object.keys(value).sort()
  return own.length === keys.length && own.every((key, i) => key === keys[i])
}
const isWeek = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) >= 0

/** The loan stop boundaries the Wave-4 closure root records: studioId → the week its installments stop. */
export type LoanStops = ReadonlyMap<string, number>

/**
 * Validates `corporateCondition` against the whole state, refusing by name. Runs after the frozen V45
 * chain has proved the rest of the state. `stops` carries each actually closed studio's closure week
 * (Wave 4): an installment is charged iff its due week is below it.
 */
export function validateCorporateConditionRoot(raw: Record<string, unknown>, label: string, stops: LoanStops = new Map(), rightsEstate = false, absorbed: ReadonlyMap<string, number> = new Map()): void {
  const fail = (message: string): never => { throw new Error(`${label}: corporateCondition ${message}`) }
  const root = raw.corporateCondition
  if (!isRecord(root)) return fail('root must be an object')
  if (!sameKeys(root, ROOT_KEYS)) fail(`root must have exactly the keys ${ROOT_KEYS.join(', ')}`)
  if (root.version !== 1) fail(`version ${String(root.version)} is unknown`)
  const state = raw as unknown as GameState
  const tick = state.market.tick
  const from = root.recordedFromWeek
  if (!isWeek(from) || from > tick) return fail('recordedFromWeek must be a whole week in [0, market.tick]')
  for (const key of ['studios', 'events', 'loans']) if (!Array.isArray(root[key])) fail(`${key} must be an array`)
  const studios = root.studios as unknown[]
  const events = root.events as unknown[]
  const loans = root.loans as unknown[]
  if (!isWeek(root.nextEvent) || root.nextEvent < 1 || !isWeek(root.nextLoan) || root.nextLoan < 1) fail('nextEvent and nextLoan must be whole numbers of at least 1')
  const h = state.hollywood
  if (h === null) {
    if (studios.length + events.length + loans.length > 0) fail('holds records in a world with no industry')
    if (root.nextEvent !== 1 || root.nextLoan !== 1) fail('allocators must be 1 in a world with no industry')
    return
  }
  if (studios.length > 10) fail('holds more than ten records')
  // The first evaluable boundary is strictly above max(recordedFromWeek, originWeek) (1356-F Amendment 2).
  const start = Math.max(from, h.originWeek)

  // Items 2-3: the evaluated set and each record's law.
  const entered = new Map(h.identities.filter((s) => s.enteredWeek !== null).map((s) => [s.studioId, s.enteredWeek as number]))
  const records = new Map<string, StudioConditionRecord>()
  let previousId = ''
  for (const [i, value] of studios.entries()) {
    if (!isRecord(value) || !sameKeys(value, RECORD_KEYS)) return fail(`record ${i} must have exactly the keys ${RECORD_KEYS.join(', ')}`)
    const record = value as unknown as StudioConditionRecord
    if (typeof record.studioId !== 'string' || record.studioId <= previousId) fail(`record ${i} is out of ascending studioId order`)
    previousId = record.studioId
    if (!Object.hasOwn(CONDITION_LAWS, record.definitionVersion)) fail(`record ${record.studioId} definitionVersion ${String(record.definitionVersion)} is unknown`)
    const law = CONDITION_LAWS[record.definitionVersion]
    const c: unknown = record.condition
    if (!isRecord(c) || !sameKeys(c, CONDITION_KEYS)) return fail(`record ${record.studioId} condition must have exactly the keys ${CONDITION_KEYS.join(', ')}`)
    const condition = c as unknown as Condition
    if (!STAGES.includes(condition.stage)) fail(`record ${record.studioId} stage is unknown`)
    for (const n of [condition.since, condition.week, condition.lowRun, condition.negativeRun, condition.clearRun, condition.distressWeeks, record.firstEvaluatedWeek]) {
      if (!isWeek(n)) fail(`record ${record.studioId} has a field that is not a whole non-negative number`)
    }
    const enteredWeek = entered.get(record.studioId)
    if (record.studioId === h.playerStudioId) {
      if (!state.economyEngagedEver || state.founding !== null) fail('player record requires an engaged economy and a closed founding draft')
      if (record.firstEvaluatedWeek < start + 1) fail('player record was evaluated before recordedFromWeek + 1')
    } else {
      if (enteredWeek === undefined) fail(`record ${record.studioId} names a studio that has not entered`)
      if (record.firstEvaluatedWeek !== Math.max(start + 1, enteredWeek!)) fail(`record ${record.studioId} firstEvaluatedWeek is not max(recordedFromWeek + 1, enteredWeek)`)
    }
    const span = condition.week - record.firstEvaluatedWeek + 1
    if (condition.week < record.firstEvaluatedWeek || condition.week > tick) fail(`record ${record.studioId} week is outside [firstEvaluatedWeek, market.tick]`)
    for (const n of [condition.lowRun, condition.negativeRun, condition.clearRun, condition.distressWeeks]) if (n > span) fail(`record ${record.studioId} has a counter above its evaluated span`)
    if (condition.lowRun < condition.negativeRun) fail(`record ${record.studioId} breaks Lemma A: lowRun below negativeRun`)
    if ((condition.lowRun > 0) === (condition.clearRun > 0)) fail(`record ${record.studioId} breaks Lemma A: exactly one of lowRun and clearRun is positive`)
    if (condition.stage === 'distress' ? condition.distressWeeks !== condition.week - condition.since + 1 : condition.distressWeeks !== 0) {
      fail(`record ${record.studioId} distressWeeks disagrees with its stage and since`)
    }
    if (condition.stage === 'closed') {
      if (condition.negativeRun === 0) fail(`record ${record.studioId} is closed without negative cash`)
    } else if (condition.week !== (absorbed.get(record.studioId) ?? tick)) fail(`record ${record.studioId} is open but its week is not market.tick`)
    if (condition.stage === 'distress' && condition.distressWeeks >= law.CORPORATE_CLOSURE_DISTRESS_WEEKS && condition.negativeRun > 0) {
      fail(`record ${record.studioId} stands in distress past the closure duration with negative cash`)
    }
    records.set(record.studioId, record)
  }
  if (tick > start) {
    for (const [studioId, enteredWeek] of entered) {
      if (studioId !== h.playerStudioId && enteredWeek <= tick && !records.has(studioId)) fail(`entered studio ${studioId} has no record`)
    }
    const overhead = state.ledger.filter((row) => row.kind === 'overhead' && row.week >= start).map((row) => row.week)
    if (overhead.length > 0) {
      const player = records.get(h.playerStudioId)
      if (player === undefined || player.firstEvaluatedWeek > Math.min(...overhead) + 1) fail('an overhead row since recordedFromWeek requires a player record evaluated at its boundary')
    }
  }

  // Item 1 and item 4: event identity, order and chains judged by the law of their own version.
  const chains = new Map<string, { stage: Stage; week: number; since: number }>()
  let largestEvent = 0
  const eventIds = new Set<string>()
  let previous: ConditionEvent | null = null
  for (const [i, value] of events.entries()) {
    if (!isRecord(value) || !sameKeys(value, EVENT_KEYS)) return fail(`event ${i} must have exactly the keys ${EVENT_KEYS.join(', ')}`)
    const event = value as unknown as ConditionEvent
    const match = /^corporate-event-([1-9]\d*)$/.exec(event.eventId)
    if (match === null) fail(`event ${i} id ${String(event.eventId)} is not corporate-event-<n>`)
    const n = Number(match![1])
    if (n >= (root.nextEvent as number)) fail(`event ${event.eventId} is at or above nextEvent`)
    if (eventIds.has(event.eventId)) fail(`holds a duplicate event ${event.eventId}`)
    eventIds.add(event.eventId)
    if (n <= largestEvent) fail(`event ${event.eventId} does not ascend in append order`)
    largestEvent = n
    if (!isWeek(event.week) || typeof event.studioId !== 'string') fail(`event ${event.eventId} has a malformed week or studio`)
    if (previous !== null && (previous.week > event.week || (previous.week === event.week && previous.studioId >= event.studioId))) {
      fail(`event ${event.eventId} is out of (week, studioId) append order`)
    }
    if (!Number.isSafeInteger(event.p15DomainSequence) || event.p15DomainSequence < 1) fail(`event ${event.eventId} has no whole p15DomainSequence`)
    if (previous !== null && event.p15DomainSequence <= previous.p15DomainSequence) fail(`event ${event.eventId} p15DomainSequence does not ascend`)
    previous = event
    if (!Object.hasOwn(CONDITION_LAWS, event.definitionVersion)) fail(`event ${event.eventId} definitionVersion ${String(event.definitionVersion)} is unknown`)
    if (!rightsEstate && event.phaseOrderVersion > 2) fail('estate phase table is not admitted in this predecessor era')
    const entry = Number.isSafeInteger(event.phaseOrderVersion) ? P15_PHASE_TABLES[event.phaseOrderVersion]?.find((row) => row.phaseId === CONDITION_PHASE_ID) : undefined
    if (event.phaseId !== CONDITION_PHASE_ID || entry === undefined || entry.phaseOrdinal !== event.phaseOrdinal) fail(`event ${event.eventId} phase triple does not match its phase-order version's table`)
    const record = records.get(event.studioId)
    if (record === undefined) fail(`event ${event.eventId} names a studio with no record`)
    if (event.week < record!.firstEvaluatedWeek || event.week > record!.condition.week) fail(`event ${event.eventId} week is outside its record's evaluated span`)
    const chain = chains.get(event.studioId) ?? { stage: 'stable' as Stage, week: record!.firstEvaluatedWeek - 1, since: record!.firstEvaluatedWeek }
    if (event.week <= chain.week) fail(`event ${event.eventId} does not strictly follow its studio's previous event`)
    if (event.from !== chain.stage) fail(`event ${event.eventId} from ${String(event.from)} breaks its studio's chain`)
    const law = CONDITION_LAWS[event.definitionVersion]
    const causes = event.causes
    if (!Array.isArray(causes) || causes.length === 0 || causes.length > 5) fail(`event ${event.eventId} must carry 1 to 5 causes`)
    const codes = causes.map((c) => c.code)
    const weeksOf = (code: string): number => causes.find((c) => c.code === code)?.weeks ?? -1
    const ok = (code: string, min: number): boolean => Number.isSafeInteger(weeksOf(code)) && weeksOf(code) >= min
    const row = `${event.from}>${event.to}`
    let lawful: boolean
    switch (row) {
      case 'stable>warning':
      case 'recovery>warning':
        lawful = (codes.join() === 'LOW_COVER' || codes.join() === 'LOW_COVER,NEGATIVE_CASH') && ok('LOW_COVER', law.CORPORATE_WARN_SUSTAIN_WEEKS) && (codes.length === 1 || ok('NEGATIVE_CASH', 1))
        break
      case 'warning>distress':
        lawful = codes.join() === 'NEGATIVE_CASH,LOW_COVER' && ok('NEGATIVE_CASH', law.CORPORATE_DISTRESS_SUSTAIN_WEEKS) && weeksOf('LOW_COVER') >= weeksOf('NEGATIVE_CASH')
        break
      case 'warning>stable':
        lawful = codes.join() === 'COVER_RESTORED' && ok('COVER_RESTORED', law.CORPORATE_CLEAR_WEEKS)
        break
      case 'recovery>stable':
        lawful = codes.join() === 'COVER_RESTORED' && ok('COVER_RESTORED', law.CORPORATE_RECOVERY_STABLE_WEEKS)
        break
      case 'distress>recovery':
        lawful = codes.join() === 'COVER_RESTORED' && ok('COVER_RESTORED', 1)
        break
      case 'distress>closed':
        lawful = codes.join() === 'DISTRESS_DURATION,NEGATIVE_CASH' && weeksOf('DISTRESS_DURATION') === event.week - chain.since + 1
          && ok('DISTRESS_DURATION', law.CORPORATE_CLOSURE_DISTRESS_WEEKS) && ok('NEGATIVE_CASH', 1)
        break
      default:
        lawful = false
    }
    if (!lawful) fail(`event ${event.eventId} ${row} is not a row of ${event.definitionVersion} with that row's causes`)
    chains.set(event.studioId, { stage: event.to as Stage, week: event.week, since: event.week })
  }
  if (root.nextEvent !== largestEvent + 1) fail(`nextEvent ${String(root.nextEvent)} must be one more than the largest event (${largestEvent})`)
  for (const [studioId, record] of records) {
    const chain = chains.get(studioId)
    const stage = chain?.stage ?? 'stable'
    const since = chain?.since ?? record.firstEvaluatedWeek
    if (record.condition.stage !== stage || record.condition.since !== since) fail(`record ${studioId} stage or since disagrees with its event chain`)
    if (stage === 'closed' && record.condition.week !== chain!.week) fail(`record ${studioId} is closed but its week is not its closure event's`)
  }

  // Items 5-6: loans under their own law, and the money each wrote.
  const periodsOf = new Map(h.businesses.map((b) => [b.studioId, b.account.periods]))
  const expectedPrincipal = new Map<string, number[]>()
  const expectedInstallment = new Map<string, number[]>()
  for (const [studioId, periods] of periodsOf) {
    expectedPrincipal.set(studioId, periods.map(() => 0))
    expectedInstallment.set(studioId, periods.map(() => 0))
  }
  const periodIndex = (periods: readonly { fromWeek: number; throughWeek: number }[], week: number): number => {
    let index = -1
    for (const [i, period] of periods.entries()) if (period.fromWeek <= week && week <= period.throughWeek) index = i
    return index
  }
  let largestLoan = 0
  const loanIds = new Set<string>()
  const lastContracted = new Map<string, number>()
  let previousLoan: StudioLoanRecord | null = null
  const playerRows = state.ledger.filter((row) => row.kind === 'loanPrincipal' || row.kind === 'loanInstallment')
  const matchedRows = new Set<number>()
  for (const [i, value] of loans.entries()) {
    if (!isRecord(value) || !sameKeys(value, LOAN_KEYS)) return fail(`loan ${i} must have exactly the keys ${LOAN_KEYS.join(', ')}`)
    const loan = value as unknown as StudioLoanRecord
    const match = /^corporate-loan-([1-9]\d*)$/.exec(loan.loanId)
    if (match === null) fail(`loan ${i} id ${String(loan.loanId)} is not corporate-loan-<n>`)
    const n = Number(match![1])
    if (n >= (root.nextLoan as number)) fail(`loan ${loan.loanId} is at or above nextLoan`)
    if (loanIds.has(loan.loanId)) fail(`holds a duplicate loan ${loan.loanId}`)
    loanIds.add(loan.loanId)
    if (n <= largestLoan) fail(`loan ${loan.loanId} does not ascend in append order`)
    largestLoan = n
    if (!Object.hasOwn(LOAN_LAWS, loan.lawVersion)) fail(`loan ${loan.loanId} lawVersion ${String(loan.lawVersion)} is unknown`)
    const law = LOAN_LAWS[loan.lawVersion]
    if (!isWeek(loan.contractedWeek) || typeof loan.studioId !== 'string') fail(`loan ${loan.loanId} has a malformed week or studio`)
    // 1357-A §4.1 item 1 with 1357-F Amendment 1: loans ascend by contractedWeek; within one boundary the rival
    // loans the condition step books come first in ascending studioId, and the player's own takeLoan, an action
    // at that week, can only follow them (r3: the review's lawful same-week pair).
    if (previousLoan !== null && (previousLoan.contractedWeek > loan.contractedWeek || (previousLoan.contractedWeek === loan.contractedWeek
      && (previousLoan.studioId === h.playerStudioId || (loan.studioId !== h.playerStudioId && previousLoan.studioId >= loan.studioId))))) {
      fail(`loan ${loan.loanId} is out of append order: by contractedWeek, the boundary's rival loans in ascending studioId, then the player's`)
    }
    if (!Number.isSafeInteger(loan.p15DomainSequence) || loan.p15DomainSequence < 1) fail(`loan ${loan.loanId} has no whole p15DomainSequence`)
    if (previousLoan !== null && loan.p15DomainSequence <= previousLoan.p15DomainSequence) fail(`loan ${loan.loanId} p15DomainSequence does not ascend`)
    previousLoan = loan
    if (!rightsEstate && loan.phaseOrderVersion > 2) fail('estate phase table is not admitted in this predecessor era')
    const entry = Number.isSafeInteger(loan.phaseOrderVersion) ? P15_PHASE_TABLES[loan.phaseOrderVersion]?.find((row) => row.phaseId === CONDITION_PHASE_ID) : undefined
    if (loan.phaseId !== CONDITION_PHASE_ID || entry === undefined || entry.phaseOrdinal !== loan.phaseOrdinal) fail(`loan ${loan.loanId} phase triple does not match its phase-order version's table`)
    const record = records.get(loan.studioId)
    if (record === undefined) fail(`loan ${loan.loanId} names a studio with no record`)
    if (loan.contractedWeek < record!.firstEvaluatedWeek || loan.contractedWeek > tick) fail(`loan ${loan.loanId} was contracted outside [firstEvaluatedWeek, market.tick]`)
    const stageAt = events.map((e) => e as ConditionEvent).filter((e) => e.studioId === loan.studioId && e.week <= loan.contractedWeek).at(-1)?.to ?? 'stable'
    if (stageAt !== 'warning' && stageAt !== 'distress') fail(`loan ${loan.loanId} was contracted in stage ${stageAt}`)
    if (!(Number.isFinite(loan.weeklyFixedCostAtContract) && loan.weeklyFixedCostAtContract >= 0)) fail(`loan ${loan.loanId} fixed cost is malformed`)
    const step = law.LOAN_AMOUNT_STEP
    const max = Math.floor((law.LOAN_MAX_FIXED_COST_WEEKS * loan.weeklyFixedCostAtContract) / step) * step
    if (!(Number.isSafeInteger(loan.principal) && loan.principal > 0 && loan.principal % step === 0 && loan.principal <= max)) fail(`loan ${loan.loanId} principal is not a lawful multiple at or below the maximum`)
    const total = loan.principal + (loan.principal * law.LOAN_INTEREST_PERCENT) / 100
    if (loan.total !== total) fail(`loan ${loan.loanId} total does not reconcile with ${loan.lawVersion}`)
    const term = law.LOAN_TERM_WEEKS
    const base = Math.floor(total / term)
    const remainder = total % term
    if (!Array.isArray(loan.installments) || loan.installments.length !== term || loan.installments.some((x, k) => x !== base + (k < remainder ? 1 : 0))) {
      fail(`loan ${loan.loanId} schedule does not reconcile with ${loan.lawVersion}`)
    }
    const previousWeek = lastContracted.get(loan.studioId)
    if (previousWeek !== undefined && loan.contractedWeek - previousWeek < term + 1) fail(`loan ${loan.loanId} overlaps its studio's earlier loan`)
    lastContracted.set(loan.studioId, loan.contractedWeek)
    // Money: due weeks charged are those below both market.tick and the studio's closure week (Wave 4).
    const stop = stops.get(loan.studioId) ?? Number.POSITIVE_INFINITY
    const lastCharged = Math.min(tick - 1, stop - 1, loan.contractedWeek + term)
    if (loan.studioId === h.playerStudioId) {
      const principalRow = playerRows.findIndex((row, k) => !matchedRows.has(k) && row.kind === 'loanPrincipal' && row.week === loan.contractedWeek && row.amount === loan.principal)
      if (principalRow < 0) fail(`loan ${loan.loanId} has no loanPrincipal ledger row at its contracted week`)
      matchedRows.add(principalRow)
      for (let due = loan.contractedWeek + 1; due <= lastCharged; due++) {
        const amount = -loan.installments[due - loan.contractedWeek - 1]!
        const k = playerRows.findIndex((row, j) => !matchedRows.has(j) && row.kind === 'loanInstallment' && row.week === due && row.amount === amount)
        if (k < 0) fail(`loan ${loan.loanId} installment due at week ${due} has no ledger row`)
        matchedRows.add(k)
      }
    } else {
      const periods = periodsOf.get(loan.studioId)
      if (periods === undefined) fail(`loan ${loan.loanId} names a studio with no business`)
      const p = periodIndex(periods!, loan.contractedWeek)
      if (p >= 0) expectedPrincipal.get(loan.studioId)![p]! += loan.principal
      for (let due = loan.contractedWeek + 1; due <= lastCharged; due++) {
        const q = periodIndex(periods!, due)
        if (q >= 0) expectedInstallment.get(loan.studioId)![q]! -= loan.installments[due - loan.contractedWeek - 1]!
      }
    }
  }
  if (root.nextLoan !== largestLoan + 1) fail(`nextLoan ${String(root.nextLoan)} must be one more than the largest loan (${largestLoan})`)
  if (matchedRows.size !== playerRows.length) fail('the player ledger holds a loan row no loan accounts for')
  for (const [studioId, periods] of periodsOf) {
    for (const [p, period] of periods.entries()) {
      const movements = period.movements as Record<string, number>
      if (movements.loanPrincipal !== expectedPrincipal.get(studioId)![p]) fail(`rival ${studioId} loanPrincipal movements do not reconcile with its loans`)
      if (movements.loanInstallment !== expectedInstallment.get(studioId)![p]) fail(`rival ${studioId} loanInstallment movements do not reconcile with its loan schedule`)
    }
  }
}

/** The downgrade refusal the V46 step and the frozen builders ask (1357-A §4.2): null when the root is empty. */
export function corporateConditionDowngradeRefusal(state: Record<string, unknown>): string | null {
  const root = state.corporateCondition
  if (!isRecord(root)) return null
  const reasons: string[] = []
  if (Array.isArray(root.studios) && root.studios.length > 0) reasons.push(`cannot downgrade or discard a corporateCondition record (${root.studios.length} evaluated)`)
  if (Array.isArray(root.events) && root.events.length > 0) reasons.push(`cannot downgrade or discard a corporateCondition event (${root.events.length} recorded)`)
  if (Array.isArray(root.loans) && root.loans.length > 0) reasons.push(`cannot downgrade or discard a studio loan (${root.loans.length} contracted)`)
  return reasons.length === 0 ? null : reasons.join('; ')
}
