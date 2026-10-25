import { TECHNOLOGY_CATALOGUE, technologyEntry } from './technologyCatalogue.js'
import type { ResearchProject } from './technologyTypes.js'
import { outstandingLoan } from './corporateConditionLive.js'
import { terminalWeekOf } from './operatingState.js'
import { makeSave } from './save.js'
import { isOperatingStudio } from './operatingState.js'
import { QUOTE_AGE_POLICY_VERSION, quoteAgeRefusal, type QuoteAgePolicyVersion } from './quoteAge.js'
// ── P16C: healthy whole-studio absorption — pure law, quote and retention preview ──
//
// Authority: P16 integration contract §5 ("The initial healthy target must be willing and
// stable-stage both at quote and at closing. It may reject the offer ... the operating player studio
// is NotForSale ... The player explicitly chooses retention with a disclosed no-action default.
// Iterate the target's authoritative contract order, keeping only lawful contracts fitting usable
// capacity and the complete transaction's affordability ... Non-retained healthy staff get the lawful
// capped exit once, charged to the target in its closing account. Retained work cannot outlive its
// lawful required participants: continue the required participants and capacity through its
// obligations, or take an explicit producer-supported cancellation/write-off ... consideration is the
// agreed non-cash asset/business price; target cash transfers at par after its actual closing exits,
// including a negative amount. Closing outlay is consideration minus that post-exit cash, plus
// separately named real charges exactly once. Guarantees are disclosed beside value, never subtracted
// ... There is no max(0, price - guarantees) shortcut ... A healthy target carrying an outstanding v1
// distress loan is refused ... Cancel target in-flight research while retaining verified work ...
// Facilities do not move to the buyer"), §7 group H; 1362-O §5.4, §5.6, §5.8, §5.9.
//
// r2 (review F2/F24/F59) USABLE CAPACITY: the SHARED OPERATIONS ALLOCATOR decides, CUMULATIVELY. The target's
// productions are seated in target order into the buyer's operations, each admission's returned operations carried into
// the next, against the buyer's present commitments (its own workflows plus the installation, script, casting and set
// occupancy the live advances hand the allocator). A production whose present phase the allocator cannot seat now
// (`QueueableCapacityRefusal`) does not fit usable capacity: `cancelRequired`, `noCapacity:<capability>`. Every later
// phase must also find usable capacity in the buyer's facilities (a facility of the capability, `noFacility`, with at
// least one slot, `noCapacity`); when those later phases compete for time with the buyer's own work, the same allocator
// queues them at run time exactly as it queues the buyer's own pictures. No headcount cap is invented. The no-action
// default keeps no person whose busy work cannot continue (`workCannotContinue`); an explicit choice may, and the
// coupled outcome is quoted either way.
//
// Quote policy (review F6/F7/F8/F13/F33): the quote needs the buyer's OWN fresh, full-scope, paid disclosure about the target
// (1362-O 5.5; contract §6) before it reveals anything; the target's consent is checked AT THE QUOTE against an ask that
// prices the post-exit cash the buyer takes at par (1362-O 5.8: no acquisition windfall); P14's person-choice refusals
// (a Distrusted issuer, a Nemesis on the roster) bind the buyer like any other employer; asset consideration is whole dollars; actual target cash transfers at par, including fractions.
// Fixed cost and reserve retain their existing rounded-up quote policy.
//
// Executable current49 milestone: clean targets only, with terminal/linked-employer/cash/title/research
// producers below. Work/run/knowledge/rival-buyer producer extensions remain required before acceptance.

import { moveRivalMoney } from './hollywood.js'
import { contractEndRefusal } from './careerLifecycle.js'
import { castingOccupiedFacilitySlots } from './castingSessions.js'
import { guaranteedComp, terminationCost, weeklySalary } from './employment.js'
import type { RivalBusiness } from './hollywoodTypes.js'
import { resourceClaims, setOccupiedFacilitySlots } from './occupancy.js'
import { addManagedProductionWorkflow } from './operations.js'
import { productionPhaseForRemainingTicks, requirementsForPhase } from './productionPhases.js'
import { QueueableCapacityRefusal } from './productionQueue.js'
import { libraryValuationV1 } from './propertyValuation.js'
import { conditionFactsFor, corporateConditionReaders, moveStudioCash, permittedBidderRefusal, spendableCash, weeklyFixedCost, type CorporateConditionReaders } from './rightsFinance.js'
import { allocateRightsId, appendTitleEvent, resolveTitles, subjectsHeldBy, type AbsorptionRecord, type DiligenceScopeItem, type RightSubject } from './rights.js'
import { validateAbsorbedRuns, validateAbsorbedRunMoney } from './absorbedRuns.js'
import { bindContinuedWork, continuedWorkRefusal, buyerOperationsForAllWork } from './continuedWork.js'
import { validateContinuedWork } from './continuedWorkValidation.js'
import { validateAbsorbedProductionStops } from './absorbedWork.js'
import { validateAbsorbedScripts } from './absorbedScripts.js'
import { scriptOccupiedFacilitySlots } from './scriptDevelopment.js'
import { personReservationRefusal } from './talentMarket.js'
import { rivalInstallationSlots } from './technologyRival.js'
import { TUNING } from './tuning.js'
import type { FacilityCapability, GameState, PhysicalPlan, Production, ProductionPhase, ScriptDevelopment, ScriptProject, StudioOperations } from './types.js'

export type RetentionChoice = { kind: 'default' } | { kind: 'explicit'; contractIds: string[] }
export type AbsorptionInput = { quotedAtWeek?: number; quoteAgePolicyVersion?: QuoteAgePolicyVersion; buyerId: string; targetId: string; consideration: number; retention: RetentionChoice; disclosureId: string | null }
export type ContractRetentionReason = 'issuerDistrusted' | 'nemesisOnRoster' | 'retirementCap' | 'unaffordable' | 'notSelected' | 'workCannotContinue' | null
export type AbsorptionContractQuote = {
  contractId: string; talentId: string; annualSalary: number; signingBonus: number; startWeek: number; endWeekExclusive: number; weeklySalary: number
  retained: boolean; reason: ContractRetentionReason
  /** The target production this person is a required participant of (first in the target's production order), or null. */
  busyOn: string | null
  /** The lawful capped exit, charged once to the target when not retained. */
  exitCost: number
  /** Remaining guaranteed salary: DISCLOSED beside value, never netted against consideration. */
  guarantee: number
}
export type ProductionDisposition = 'continues' | 'cancelRequired'
export type ProductionDispositionReason = 'missingParticipants' | 'buyerOperationsNotManaged' | 'productionIdCollision'
  | `noFacility:${FacilityCapability}` | `noCapacity:${FacilityCapability}` | null
export type AbsorptionProductionQuote = {
  productionId: string
  remainingTicks: number
  phase: ProductionPhase
  disposition: ProductionDisposition
  reason: ProductionDispositionReason
  /** The capability the capacity verdict named, when it named one. */
  blockedCapability: FacilityCapability | null
  /** Required participants employed by the target and not retained (for a reason other than this work being unhostable). */
  missingParticipants: string[]
}
export type AbsorptionScriptQuote = {
  scriptProjectId: string; status: 'drafting' | 'rewriting'; writerIds: string[]; sourceContractIds: string[]
  disposition: 'writeOff' | 'continuationRequired'; reason: 'writersNotRetained' | 'writerContinuationProducerRequired'
}
export type AbsorptionQuote = {
  kind: 'quote'
  quotedAtWeek: number; quoteAgePolicyVersion: QuoteAgePolicyVersion
  buyerId: string; targetId: string; week: number; consideration: number; disclosureId: string
  rights: RightSubject[]; rightsValue: number | null
  contracts: AbsorptionContractQuote[]
  exitCharges: number; targetCashBeforeExits: number; postExitCash: number; guarantees: number; outlay: number
  /** The target's consent ask at this retention: premium-adjusted library value plus the post-exit cash, whole dollars. */
  ask: number
  resultingWeeklyFixedCost: number; reserveAfter: number; affordable: boolean
  productions: AbsorptionProductionQuote[]
  scripts: AbsorptionScriptQuote[]
  research: { projectId: string; disposition: 'cancelRetainingVerifiedProgress'; verifiedWork: number; expenditure: number }[]
  facilities: { facilityId: string; disposition: 'remainsWithTargetHistory' }[]
  adoptions: AbsorptionRecord['adoptions']
  runs: AbsorptionRecord['runs']
  physicalPlans: AbsorptionRecord['physicalPlans']
  knowledge: AbsorptionRecord['knowledge']
}
export type AbsorptionRefusal = { kind: 'refusal'; refusal: string }

export const ABSORPTION_CLOSING_PREREQUISITES: readonly string[] = [
  'real retained-production/script/run and adoption cancellation or continuation producers',
  'real rival-buyer employment/financial producers',
  'real absorbed-employer market dispositions and public Action/Bridge/native transaction parity',
]

/** The disclosure an absorption quote needs: rights, employment and liabilities — everything the quote reveals. */
export const ABSORPTION_DISCLOSURE_SCOPE: readonly DiligenceScopeItem[] = ['rights', 'employment', 'liabilities']

export function absorptionRefusal(state: GameState, buyerId: string, targetId: string, week: number, readers: CorporateConditionReaders = corporateConditionReaders): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  if (targetId === h.playerStudioId) return 'playerNotForSale'
  if (buyerId === targetId) return 'selfDealing'
  const identity = h.identities.find((i) => i.studioId === targetId)
  if (identity === undefined || identity.enteredWeek === null || !h.businesses.some((b) => b.studioId === targetId)) return 'unknownTarget'
  if (!isOperatingStudio(state, targetId) || state.rights.estates.some((e) => e.studioId === targetId)) return 'targetTerminal'
  const buyer = permittedBidderRefusal(state, buyerId, week, readers)
  if (buyer !== null) return `buyerNotPermitted:${buyer}`
  const target = conditionFactsFor(state, targetId, week, readers)
  if (target === null) return 'targetConditionUnavailable'
  if (target.stage !== 'stable') return `targetNotStable:${target.stage}`
  if (target.hasOutstandingLoan) return 'targetOutstandingLoan'
  return null
}

/** r2 (F7): null when `disclosureId` is the buyer's own, fresh, full-scope disclosure about this target; else why not. */
export function absorptionDisclosureRefusal(state: GameState, buyerId: string, targetId: string, disclosureId: string | null | undefined, week: number): string | null {
  if (disclosureId === null || disclosureId === undefined) return 'disclosureRequired'
  const record = state.rights.diligence.find((d) => d.id === disclosureId)
  if (record === undefined || record.recipientId !== buyerId || record.target.kind !== 'studio' || record.target.studioId !== targetId) return 'disclosureNotHeld'
  if (!ABSORPTION_DISCLOSURE_SCOPE.every((item) => record.scope.includes(item))) return 'disclosureScope'
  const age = quoteAgeRefusal('disclosure', record.week, week, record.quoteAgePolicyVersion)
  if (age !== null) return age
  if (week >= record.staleFromWeek) return 'staleDisclosure'
  return null
}

/** Close must carry the dated preview; re-quoting current facts never renews an old preview. */
export function absorptionQuoteAgeRefusal(input: AbsorptionInput, week: number, requireCarried: boolean): string | null {
  if (input.quotedAtWeek === undefined && input.quoteAgePolicyVersion === undefined) return requireCarried ? 'absorptionQuoteRequired' : null
  if (input.quotedAtWeek === undefined || input.quoteAgePolicyVersion === undefined) return 'incompleteAbsorptionQuote'
  return quoteAgeRefusal('absorptionPreview', input.quotedAtWeek, week, input.quoteAgePolicyVersion)
}

/** r2 (F8/F33): the consent ask — premium-adjusted library value plus the post-exit cash that moves at par, never below zero. */
export function absorptionAsk(libraryValue: number, postExitCash: number): number {
  return Math.max(0, Math.ceil((libraryValue * (100 + TUNING.RIGHTS_WILLINGNESS_PREMIUM_PERCENT)) / 100) + postExitCash)
}

/** The provisional consent policy: a rival sells its business at or above its ask (`absorptionAsk`). */
export function rivalAbsorptionWillingness(state: GameState, targetId: string, consideration: number, postExitCash: number, week: number)
  : { willing: boolean; reason: string; value: number | null; ask: number | null } {
  const value = libraryValuationV1(state, targetId, week)
  if (value.kind !== 'available') return { willing: false, reason: `valueUnavailable:${value.reason}`, value: null, ask: null }
  const ask = absorptionAsk(value.total, postExitCash)
  return consideration >= ask ? { willing: true, reason: 'willing', value: value.total, ask } : { willing: false, reason: `notWilling:considerationBelowAsk:${ask}`, value: value.total, ask }
}

type Row = Omit<AbsorptionContractQuote, 'retained' | 'reason' | 'busyOn'>

type Verdict =
  | { kind: 'seated' }
  | { kind: 'refused'; reason: Exclude<ProductionDispositionReason, 'missingParticipants' | null>; capability: FacilityCapability | null }

/** A rival's live script development, exactly as hollywoodTick reads it for the allocator. */
function hotDevelopment(b: RivalBusiness): ScriptDevelopment {
  return { mode: 'managed', projects: b.activeScriptOrdinals.map((i) => b.development.projects[i]!) }
}

/** The buyer's operations and the slots its present commitments occupy — the inputs the live advances hand the allocator (tick.ts, hollywoodTick.ts). */
function buyerOperations(state: GameState, buyerId: string): { operations: StudioOperations; occupied: ReadonlySet<string> } {
  const h = state.hollywood!
  if (buyerId === h.playerStudioId) {
    return { operations: buyerOperationsForAllWork(state), occupied: new Set<string>([
      ...resourceClaims(state).filter((c) => c.owner === 'installation' && c.facilitySlotKey !== null).map((c) => c.facilitySlotKey!),
      ...scriptOccupiedFacilitySlots(state.scriptDevelopment),
      ...castingOccupiedFacilitySlots(state.castingSessions),
      ...setOccupiedFacilitySlots(state.sets, state.operations, state.scriptDevelopment, state.castingSessions),
    ]) }
  }
  const b = h.businesses.find((x) => x.studioId === buyerId)!
  return { operations: b.operations, occupied: new Set<string>([...scriptOccupiedFacilitySlots(hotDevelopment(b)), ...rivalInstallationSlots(state.technology, b)]) }
}

/** Every capability a production still needs, from its present phase through release-ready, in requirement order. */
function remainingCapabilities(remainingTicks: number): FacilityCapability[] {
  const out: FacilityCapability[] = []
  for (let t = remainingTicks; t >= 1; t--) for (const c of requirementsForPhase(productionPhaseForRemainingTicks(t))) if (!out.includes(c)) out.push(c)
  return out
}

/** The shared allocator's CUMULATIVE verdicts: each target production, in target order, against the buyer and every earlier admission. */
function seatTargetProductions(operations: StudioOperations, occupied: ReadonlySet<string>, productions: readonly Production[]): Map<string, Verdict> {
  const verdicts = new Map<string, Verdict>()
  let seated = operations
  for (const p of productions) {
    if (seated.mode !== 'managed') { verdicts.set(p.id, { kind: 'refused', reason: 'buyerOperationsNotManaged', capability: null }); continue }
    if (seated.workflows.some((w) => w.productionId === p.id)) { verdicts.set(p.id, { kind: 'refused', reason: 'productionIdCollision', capability: null }); continue }
    const needs = remainingCapabilities(p.remainingTicks)
    const absent = needs.find((c) => !seated.facilities.some((f) => f.capability === c))
    if (absent !== undefined) { verdicts.set(p.id, { kind: 'refused', reason: `noFacility:${absent}`, capability: absent }); continue }
    const empty = needs.find((c) => seated.facilities.filter((f) => f.capability === c).every((f) => f.capacity < 1))
    if (empty !== undefined) { verdicts.set(p.id, { kind: 'refused', reason: `noCapacity:${empty}`, capability: empty }); continue }
    try {
      seated = addManagedProductionWorkflow(seated, { id: p.id, startTick: p.startTick, remainingTicks: p.remainingTicks }, occupied)
      verdicts.set(p.id, { kind: 'seated' })
    } catch (error) {
      if (!(error instanceof QueueableCapacityRefusal)) throw error
      verdicts.set(p.id, { kind: 'refused', reason: `noCapacity:${error.capability}`, capability: error.capability })
    }
  }
  return verdicts
}

const participantsOf = (p: Production): string[] => [p.writerId, p.directorId, ...p.craftIds, ...Object.values(p.cast)]

/** Only the explicit release of EVERY required writer admits this terminal write-off slice.
 * A retained/partial/default writer choice still needs the real active drafting producer. */
function stoppedScriptContracts(state: GameState, targetId: string, script: ScriptProject,
  retention: RetentionChoice, week: number): string[] | null {
  if(retention.kind!=='explicit')return null
  const h=state.hollywood!
  const writers=[...new Set(script.writerIds)]
  if(writers.length===0)return null
  const source=writers.map(id=>h.activeEmploymentOrdinals.map(i=>h.employment[i]!).find(e=>e.studioId===targetId
    && e.terms.talentId===id && e.endedWeek===null && e.terms.startWeek<=week && week<e.terms.endWeekExclusive))
  if(source.some(e=>!e || retention.contractIds.includes(e.contractId)))return null
  return source.map(e=>e!.contractId)
}

export function quoteAbsorption(state: GameState, input: AbsorptionInput, week: number, readers: CorporateConditionReaders = corporateConditionReaders): AbsorptionQuote | AbsorptionRefusal {
  const age = absorptionQuoteAgeRefusal(input, week, false)
  if (age !== null) return { kind: 'refusal', refusal: age }
  const refusal = absorptionRefusal(state, input.buyerId, input.targetId, week, readers)
  if (refusal !== null) return { kind: 'refusal', refusal }
  if (!Number.isSafeInteger(input.consideration) || input.consideration < 0) return { kind: 'refusal', refusal: 'invalidConsideration' }
  const disclosure = absorptionDisclosureRefusal(state, input.buyerId, input.targetId, input.disclosureId, week)
  if (disclosure !== null) return { kind: 'refusal', refusal: disclosure }
  const h = state.hollywood!
  const business = h.businesses.find((b) => b.studioId === input.targetId)!
  // The target's authoritative contract order: its live employment intervals in root order.
  const rows: Row[] = h.activeEmploymentOrdinals.map((i) => h.employment[i]!)
    .filter((e) => e.studioId === input.targetId && e.endedWeek === null && e.terms.startWeek <= week && week < e.terms.endWeekExclusive)
    .map((e) => ({ contractId: e.contractId, talentId: e.terms.talentId, annualSalary: e.terms.annualSalary, signingBonus: e.terms.signingBonus,
      startWeek: e.terms.startWeek, endWeekExclusive: e.terms.endWeekExclusive, weeklySalary: weeklySalary(e.terms.annualSalary),
      exitCost: terminationCost(e.terms, week), guarantee: guaranteedComp(e.terms, week) }))
  if (input.retention.kind === 'explicit') {
    for (const id of input.retention.contractIds) if (!rows.some((r) => r.contractId === id)) return { kind: 'refusal', refusal: `unknownContract:${id}` }
  }
  // Work: who is busy on which target production, and the allocator's cumulative verdict on hosting each one.
  const busyOn = new Map<string, string>()
  for (const p of business.productions) for (const id of participantsOf(p)) if (!busyOn.has(id)) busyOn.set(id, p.id)
  const buyer = buyerOperations(state, input.buyerId)
  const verdicts = seatTargetProductions(buyer.operations, buyer.occupied, business.productions)
  const hostable = (talentId: string): boolean => { const pid = busyOn.get(talentId); return pid === undefined || verdicts.get(pid)!.kind === 'seated' }
  const buyerFixed = weeklyFixedCost(state, input.buyerId)
  const spendable = spendableCash(state, input.buyerId)
  const targetCash = business.account.cash
  const money = (retained: ReadonlySet<string>) => {
    const exitCharges = rows.filter((r) => !retained.has(r.contractId)).reduce((s, r) => s + r.exitCost, 0)
    const postExitCash = targetCash - exitCharges
    const outlay = input.consideration - postExitCash
    const kept = rows.filter((r) => retained.has(r.contractId))
    const resultingWeeklyFixedCost = Math.ceil(buyerFixed + kept.reduce((s, r) => s + r.weeklySalary, 0) + TUNING.OVERHEAD_PER_EMPLOYEE * kept.length)
    const reserveAfter = TUNING.RIGHTS_RESERVE_WEEKS * resultingWeeklyFixedCost
    return { exitCharges, postExitCash, outlay, resultingWeeklyFixedCost, reserveAfter, affordable: spendable - outlay >= reserveAfter,
      guarantees: kept.reduce((s, r) => s + r.guarantee, 0) }
  }
  // Person law first (P14: "I will not work for them" needs neither a price nor a seat), then the retirement cap.
  const personRefusal = (r: Row): ContractRetentionReason => personReservationRefusal(state, r.talentId, input.buyerId, week)
    ?? (contractEndRefusal(state, r.talentId, r.endWeekExclusive) === null ? null : 'retirementCap')
  const reasons = new Map<string, ContractRetentionReason>()
  const retained = new Set<string>()
  if (input.retention.kind === 'default') {
    // The disclosed no-action default: target order; the person consents; lawful; work that can be hosted; affordable for the COMPLETE transaction.
    for (const r of rows) {
      const person = personRefusal(r)
      if (person !== null) { reasons.set(r.contractId, person); continue }
      if (!hostable(r.talentId)) { reasons.set(r.contractId, 'workCannotContinue'); continue }
      if (money(new Set([...retained, r.contractId])).affordable) retained.add(r.contractId)
      else reasons.set(r.contractId, 'unaffordable')
    }
  } else {
    const chosen = new Set(input.retention.contractIds)
    for (const r of rows) {
      if (!chosen.has(r.contractId)) { reasons.set(r.contractId, 'notSelected'); continue }
      const person = personRefusal(r)
      if (person !== null) { reasons.set(r.contractId, person); continue }
      retained.add(r.contractId)
    }
  }
  const m = money(retained)
  // The target consents at the quote (contract §5), to a price that includes the cash it hands over at par.
  const willingness = rivalAbsorptionWillingness(state, input.targetId, input.consideration, m.postExitCash, week)
  if (!willingness.willing) return { kind: 'refusal', refusal: `targetNotWilling:${willingness.reason.replace(/^notWilling:/, '')}` }
  const contracts: AbsorptionContractQuote[] = rows.map((r) => ({ ...r, busyOn: busyOn.get(r.talentId) ?? null, retained: retained.has(r.contractId),
    reason: retained.has(r.contractId) ? null : reasons.get(r.contractId) ?? 'notSelected' }))
  const employees = new Map(rows.map((r) => [r.talentId, r.contractId]))
  const productions: AbsorptionProductionQuote[] = business.productions.map((p) => {
    const missing = [...new Set(participantsOf(p).filter((id) => {
      const contractId = employees.get(id)
      return contractId !== undefined && !retained.has(contractId) && reasons.get(contractId) !== 'workCannotContinue'
    }))]
    const verdict = verdicts.get(p.id)!
    const base = { productionId: p.id, remainingTicks: p.remainingTicks, phase: productionPhaseForRemainingTicks(p.remainingTicks), missingParticipants: missing }
    if (verdict.kind === 'refused') return { ...base, disposition: 'cancelRequired', reason: verdict.reason, blockedCapability: verdict.capability }
    if (missing.length > 0) return { ...base, disposition: 'cancelRequired', reason: 'missingParticipants', blockedCapability: null }
    return { ...base, disposition: 'continues', reason: null, blockedCapability: null }
  })
  const scripts: AbsorptionScriptQuote[]=business.development.projects.flatMap((script):AbsorptionScriptQuote[]=>{
    if(script.status!=='drafting' && script.status!=='rewriting')return []
    const sourceContractIds=stoppedScriptContracts(state,input.targetId,script,input.retention,week)
    const stopped=sourceContractIds!==null && sourceContractIds.every(id=>!retained.has(id))
    return [{scriptProjectId:script.id,status:script.status,writerIds:[...script.writerIds],sourceContractIds:sourceContractIds??[],
      disposition:stopped?'writeOff':'continuationRequired',reason:stopped?'writersNotRetained':'writerContinuationProducerRequired'}]
  })
  const rights = subjectsHeldBy(resolveTitles(state), state.rights.estates, input.targetId, week)
  const research = (state.technology.projects ?? []).filter((p) => p.studioId === input.targetId && p.status !== 'completed' && p.status !== 'cancelled')
    .map((p) => ({ projectId: p.id, disposition: 'cancelRetainingVerifiedProgress' as const, verifiedWork: p.verifiedWork, expenditure: p.expenditure }))
  const facilities = business.operations.facilities.map((f) => ({ facilityId: f.id, disposition: 'remainsWithTargetHistory' as const }))
  const runs: AbsorptionRecord['runs']=business.runs.map(r=>({productionId:r.productionId,beneficiaryFromWeek:week,startingWeekIndex:r.weekIndex,grossPaidBeforeClose:r.cumulativeGrossPaid,revenuePaidBeforeClose:r.cumulativeStudioRevenuePaid}))
  const adoptions: AbsorptionRecord['adoptions']=state.technology.adoptions.filter(a=>a.studioId===input.targetId && a.operationalWeek===null && a.cancelledWeek===null).map(a=>({adoptionId:a.id,technologyId:a.technologyId,committedWeek:a.committedWeek,equipmentAssetId:a.equipmentAssetId,equipmentCost:a.equipmentCost,installationCost:a.installationCost}))
  const physicalPlans=absorptionPlanQuote(state,input.targetId)
  const knowledge: AbsorptionRecord['knowledge']=state.technology.projects.filter(p=>p.studioId===input.targetId&&p.status==='completed')
    .map(p=>({technologyId:p.technologyId,sourceProjectId:p.id,completedWeek:p.completedWeek!,
      disposition:state.technology.access.some(a=>a.studioId===input.buyerId&&a.technologyId===p.technologyId&&a.acquiredWeek!==null)?'alreadyHeld':'granted'}))
  return { kind: 'quote', quotedAtWeek: input.quotedAtWeek ?? week, quoteAgePolicyVersion: input.quoteAgePolicyVersion ?? QUOTE_AGE_POLICY_VERSION, buyerId: input.buyerId, targetId: input.targetId, week, consideration: input.consideration, disclosureId: input.disclosureId!, rights,
    rightsValue: willingness.value, contracts, exitCharges: m.exitCharges, targetCashBeforeExits: targetCash,
    postExitCash: m.postExitCash, guarantees: m.guarantees, outlay: m.outlay, ask: willingness.ask!, resultingWeeklyFixedCost: m.resultingWeeklyFixedCost,
    reserveAfter: m.reserveAfter, affordable: m.affordable, productions, scripts, research, facilities, physicalPlans, knowledge, adoptions, runs }
}

/** Rival paid plant stays started after completion (rivalResearch.ts:283–320).
 * Read actual body/instrument receipts and retained Laboratory/tombstone; never advance or retime a plan. */
function unfinishedAbsorptionPlan(state: GameState, plan: PhysicalPlan, week = state.market.tick): boolean {
  if (plan.status === 'cancelled') return false
  if (plan.status !== 'started' || plan.commitReceipt === null) return true
  const h = state.hollywood!
  const completedWeek = plan.commitReceipt.week + plan.approvedQuote.buildWeeks
  if (completedWeek > week) return true
  if (plan.work.kind === 'installation' && 'facilityId' in plan.work.target) {
    const technology = TECHNOLOGY_CATALOGUE.find(t => t.instrumentBlueprintId === plan.work.blueprintId)
    if (!technology) return true
    const facilityId = plan.work.target.facilityId
    const body = h.businesses.find(b => b.studioId === plan.studioId)?.operations.facilities.find(f => f.id === facilityId)
    return body?.capability !== 'laboratory' || !h.receipts.some(r => r.kind === 'instrumentOperational'
      && r.studioId === plan.studioId && r.facilityId === facilityId && r.technologyId === technology.id && r.week === completedWeek)
  }
  if (plan.work.kind !== 'placement' || plan.work.blueprintId !== 'research-laboratory') return true
  const commitment = h.receipts.find(r => r.kind === 'laboratoryCommitted' && r.studioId === plan.studioId && r.planId === plan.id)
  if (commitment?.kind !== 'laboratoryCommitted') return true
  if (!h.receipts.some(r => r.kind === 'laboratoryOperational'
    && r.studioId === plan.studioId && r.facilityId === commitment.facilityId && r.week === completedWeek)) return true
  const body = h.businesses.find(b => b.studioId === plan.studioId)?.operations.facilities.find(f => f.id === commitment.facilityId)
  const disposed = h.receipts.some(r => r.kind === 'facilityDisposed' && r.studioId === plan.studioId
    && r.planId === plan.id && r.facilityId === commitment.facilityId && r.week <= week)
  return !(body?.capability === 'laboratory' || disposed)
}

function absorptionPlanQuote(state: GameState, targetId: string): AbsorptionRecord['physicalPlans'] {
  return state.physicalPlans.plans.filter(p => p.studioId === targetId && p.status !== 'cancelled').map(p => ({
    planId:p.id,disposition:p.status !== 'started' ? 'cancelledUnstarted' as const
      : unfinishedAbsorptionPlan(state,p) ? 'stoppedPaid' as const : 'retainedCompleted' as const,
    committedCost:p.commitReceipt?.cost ?? 0}))
}


/** Required producer extensions, deliberately not an acceptance residual. No partial closing occurs. */
export function absorptionProducerRefusal(state: GameState, input: AbsorptionInput): string | null {
  const h = state.hollywood
  if (!h) return 'noIndustry'
  if (input.buyerId !== h.playerStudioId && (input.retention.kind !== 'explicit' || input.retention.contractIds.length !== 0)) return 'rivalBuyerRetentionProducerRequired'
  if (input.buyerId !== h.playerStudioId && h.businesses.find(b => b.studioId === input.targetId)?.runs.length) return 'rivalBuyerRunProducerRequired'
  const b = h.businesses.find(b => b.studioId === input.targetId)
  if (!b) return 'unknownTarget'
  // Active source runs use their real linked buyer-beneficiary producer after closing.
  if (b.development.projects.some(p => (p.status === 'drafting' || p.status === 'rewriting')
    && stoppedScriptContracts(state,input.targetId,p,input.retention,state.market.tick)===null)) return 'retainedScriptProducerRequired'
  if (state.physicalPlans.plans.some(p => p.studioId === input.targetId && p.status === 'started' && unfinishedAbsorptionPlan(state,p)
    && p.commitReceipt!.week + p.approvedQuote.buildWeeks <= state.market.tick)) return 'missingActualPhysicalCompletionProducer'
  if (state.technology.adoptions.some(a => a.studioId === input.targetId && a.operationalWeek === null && a.cancelledWeek === null && state.market.tick >= a.committedWeek+technologyEntry(a.technologyId).deploymentWeeks)) return 'missingActualAdoptionCompletionProducer'
  if (state.promises.some(p => p.issuerStudioId === input.targetId && p.outcome === null)) return 'absorbedPromiseDispositionProducerRequired'
  if (state.talentMarket.cases.some(c => c.subjectStudioId === input.targetId && c.closedWeek === null)
    || state.talentMarket.proposals.some(p => p.issuerStudioId === input.targetId)) return 'absorbedMarketDispositionProducerRequired'
  return null
}

/** The real research owner records why this project ended; never reconstruct from status/seat dates. */
function cancelAbsorbedResearch(project: ResearchProject, absorptionId: string, week: number): ResearchProject {
  if (project.status !== 'active' && project.status !== 'paused' || Object.hasOwn(project,'absorptionCancellation')) {
    throw new Error('absorption: research is not an original uncancelled in-flight project')
  }
  return {...project,status:'cancelled',absorptionCancellation:{absorptionId,week,priorStatus:project.status},
    seats:project.seats.map(s => s.releasedWeek === null ? {...s,releasedWeek:week} : s)}
}

/** Current49 clean-target milestone. The caller supplies the actual boundary, never a retimed quote. */
export function closeAbsorption(state: GameState, input: AbsorptionInput, week: number): GameState {
  makeSave(state)
  if (week !== state.market.tick) throw new Error('absorption: closing must use the actual input week')
  const age = absorptionQuoteAgeRefusal(input, week, true)
  if (age !== null) throw new Error(`absorption closing refused: ${age}`)
  const unsupported = absorptionProducerRefusal(state,input)
  if (unsupported) throw new Error(`absorption: ${unsupported}`)
  const q = quoteAbsorption(state,input,week)
  if (q.kind !== 'quote') throw new Error(`absorption: ${q.refusal}`)
  if (!q.affordable) throw new Error('absorption: insufficientCashAfterReserve')
  if(q.scripts.some(script=>script.disposition!=='writeOff'))throw new Error('absorption: retainedScriptProducerRequired')
  // This real rival-owner slice has no new employer contracts, buyer workflows or future
  // run service. Never turn a quoted continuation into a convenient terminal write-off.
  if(input.buyerId!==state.hollywood!.playerStudioId){
    if(q.contracts.some(c=>c.retained))throw new Error('absorption: rivalBuyerRetentionProducerRequired')
    if(q.productions.some(p=>p.disposition==='continues'))throw new Error('absorption: rivalBuyerContinuedWorkProducerRequired')
    if(q.runs.length!==0)throw new Error('absorption: rivalBuyerRunProducerRequired')
  }

  // Never replace a lawful continuation verdict with a convenient cancellation.
  for(const row of q.productions.filter(p=>p.disposition==='continues')) {
    const production=state.hollywood!.businesses.find(b=>b.studioId===input.targetId)!.productions.find(p=>p.id===row.productionId)!
    const refusal=continuedWorkRefusal(state,input.targetId,production)
    if(refusal)throw new Error(`absorption: ${refusal}`)
  }
  const h = state.hollywood!
  if (state.corporateCondition.studios.find(r => r.studioId === input.buyerId)?.condition.week !== week
    || state.corporateCondition.studios.find(r => r.studioId === input.targetId)?.condition.week !== week) throw new Error('absorption: evaluated conditions must belong to the actual closing input')
  const allocated = allocateRightsId(state.rights,'absorption')
  const employment = h.employment.map(e => ({...e,terms:{...e.terms}}))
  const receipts = [...h.receipts]
  let nextReceipt = h.nextReceipt
  const contracts = [...state.contracts]
  const links: AbsorptionRecord['contracts'] = []
  for (const row of q.contracts) {
    const original = employment.find(e => e.contractId === row.contractId)!
    original.endedWeek = week
    let buyerContractId: string | null = null
    if (row.retained) {
      const terms = {...original.terms,startWeek:week,termWeeks:original.terms.endWeekExclusive-week}
      buyerContractId = `${input.buyerId}:contract:${row.talentId}:${week}:player-${employment.length}`
      employment.push({contractId:buyerContractId,studioId:input.buyerId,terms,endedWeek:null,reason:'absorptionContinuation'})
      contracts.push(terms)
    }
    receipts.push({kind:'employment',eventId:`industry-event-${nextReceipt++}`,week,studioId:input.targetId,
      talentId:row.talentId,fromStudioId:input.targetId,toStudioId:null,contractId:row.contractId,
      reason:row.retained?'absorptionContinuation':'absorptionExit'})
    if (buyerContractId !== null) receipts.push({kind:'employment',eventId:`industry-event-${nextReceipt++}`,week,studioId:input.buyerId,
      talentId:row.talentId,fromStudioId:input.targetId,toStudioId:input.buyerId,contractId:buyerContractId,reason:'absorptionContinuation'})
    links.push({sourceContractId:row.contractId,buyerContractId,talentId:row.talentId,exitCost:row.retained?0:row.exitCost})
  }
  const employed = new Set(contracts.filter(c => c.startWeek <= week && week < c.endWeekExclusive).map(c => c.talentId))
  const released = q.contracts.filter(c => !c.retained).map(c => c.talentId)
  const freeAgents = [...new Set([...state.freeAgents,...released])].filter(id => !employed.has(id))
  const record: AbsorptionRecord = {id:allocated.id,week,buyerId:input.buyerId,targetId:input.targetId,disclosureId:q.disclosureId,
    quotedAtWeek:q.quotedAtWeek,quoteAgePolicyVersion:q.quoteAgePolicyVersion,
    consideration:q.consideration,cashBeforeExits:q.targetCashBeforeExits,exitCharges:q.exitCharges,postExitCash:q.postExitCash,outlay:q.outlay,
    evaluatedBuyerWeek:week,evaluatedTargetWeek:week,contracts:links,
    research:q.research.map(p => ({projectId:p.projectId,verifiedWork:p.verifiedWork,expenditure:p.expenditure})),
    runs:q.runs,runReceipts:[],
    continuedProductions:q.productions.filter(p=>p.disposition==='continues').map(p=>{
      const source=h.businesses.find(b=>b.studioId===input.targetId)!
      const production=source.productions.find(row=>row.id===p.productionId)!
      const workflow=source.operations.workflows.find(w=>w.productionId===p.productionId)!
      const script=source.development.projects.find(s=>s.productionId===p.productionId && s.status==='inProduction')!
      return {productionId:p.productionId,scriptProjectId:script.id,originalProduction:structuredClone(production),originalWorkflow:structuredClone(workflow),originalReleaseCommitment:structuredClone(source.releaseAuthority.commitments.find(row=>row.productionId===p.productionId)??null),buyerPostFacilityId:null}
    }),buyerWorkflows:[],workSteps:[],workReleases:[],workCancellations:[],stoppedProductions:q.productions.filter(p=>p.disposition==='cancelRequired').map(p=>{
      const script=h.businesses.find(b=>b.studioId===input.targetId)!.development.projects.find(s=>s.productionId===p.productionId && s.status==='inProduction')
      if(!script || p.disposition!=='cancelRequired' || p.reason===null) throw new Error('absorption: cancelled production lacks authentic coupled script/verdict')
      return {productionId:p.productionId,scriptProjectId:script.id,remainingTicks:p.remainingTicks,phase:p.phase,reason:p.reason,blockedCapability:p.blockedCapability,missingParticipants:[...p.missingParticipants]}
    }),facilities:q.facilities.map(f => f.facilityId),titleEventIds:[],knowledge:q.knowledge,physicalPlans:q.physicalPlans,adoptions:q.adoptions,
    ...(q.scripts.length===0?{producerVersion:'absorption-clean/v1' as const}:{producerVersion:'absorption-scripts/v2' as const,
      stoppedScripts:q.scripts.map(script=>{
        const originalScript=h.businesses.find(b=>b.studioId===input.targetId)!.development.projects.find(p=>p.id===script.scriptProjectId)!
        const originalCosts=h.businesses.find(b=>b.studioId===input.targetId)!.projects.find(p=>p.scriptProjectId===script.scriptProjectId)!
        return {scriptProjectId:script.scriptProjectId,reason:'writersNotRetained' as const,sourceContractIds:[...script.sourceContractIds],
          originalScript:structuredClone(originalScript),originalCosts:structuredClone(originalCosts)}
      })})}
  let next: GameState = {...state,contracts,freeAgents,hollywood:{...h,employment,receipts,nextReceipt,
    activeEmploymentOrdinals:employment.flatMap((e,i) => e.endedWeek === null && e.terms.endWeekExclusive > week ? [i] : [])},
    technology:{...state.technology,adoptions:state.technology.adoptions.map(a=>record.adoptions.some(d=>d.adoptionId===a.id) ? {...a,absorptionDisposition:{absorptionId:record.id,week,kind:'stoppedPending' as const}} : a),projects:state.technology.projects.map(p => q.research.some(r => r.projectId === p.id)
      ? cancelAbsorbedResearch(p,record.id,week) : p.studioId === input.targetId
        ? {...p,seats:p.seats.map(s => s.releasedWeek === null ? {...s,releasedWeek:week} : s)} : p)},
    rights:{...allocated.root,absorptions:[...allocated.root.absorptions,record]}}
  next = {...next,physicalPlans:{...next.physicalPlans,plans:next.physicalPlans.plans.map(p => {
    const disposition=record.physicalPlans.find(d=>d.planId===p.id)
    if(!disposition)return p
    const absorptionDisposition={absorptionId:record.id,week,kind:disposition.disposition,priorStatus:p.status}
    return disposition.disposition==='cancelledUnstarted'
      ? {...p,status:'cancelled' as const,statusWeek:week,reason:'the studio was absorbed',pendingQuote:null,absorptionDisposition}
      : {...p,absorptionDisposition} // Paid started work keeps its authentic commit; no refund or fictitious cancellation.
  })}}
  // The buyer obtains KNOWLEDGE, not the source's progress, lab, prototype or inventor discount.
  const grants = record.knowledge.filter(k => k.disposition === 'granted')
  next = {...next,technology:{...next.technology,access:[
    ...next.technology.access.filter(a => !grants.some(k => a.studioId === input.buyerId && a.technologyId === k.technologyId)),
    ...grants.map(k => ({studioId:input.buyerId,technologyId:k.technologyId,route:'acquired' as const,
      chosenWeek:week,acquiredWeek:week,accessCost:0,researchProjectId:null,
      acquiredKnowledge:{absorptionId:record.id,sourceStudioId:input.targetId,sourceProjectId:k.sourceProjectId}}))]}}
  // Real capped exits debit the target once. Cash at par is signed and is not a signing bonus or a refund.
  if (record.exitCharges !== 0) {
    const bh = next.hollywood!, b = bh.businesses.find(b => b.studioId === input.targetId)!
    // moveRivalMoney owns the actual termination kind; preserve all historical period rows.
    const account = {...b.account,periods:b.account.periods.map(p => ({...p,movements:{...p.movements}}))}
    moveRivalMoney(account,'termination',-record.exitCharges,week)
    next = {...next,hollywood:{...bh,businesses:bh.businesses.map(row => row === b ? {...b,account} : row)}}
  }
  next = moveStudioCash(next,input.targetId,'acquisitionOutlay',-record.postExitCash,week,record.id)
  next = moveStudioCash(next,input.buyerId,'acquisitionOutlay',-record.outlay,week,record.id)
  next=bindContinuedWork(next,record,buyerOperations(state,input.buyerId).occupied)
  const titleEventIds: string[] = []
  for (const subject of q.rights) {
    const moved = appendTitleEvent(next,{subject,priorHolder:input.targetId,newHolder:input.buyerId,cause:'absorption',date:{kind:'campaign',week},source:{kind:'absorption',absorptionId:record.id}})
    next = moved.state; titleEventIds.push(moved.event.id)
  }
  next = {...next,rights:{...next.rights,absorptions:next.rights.absorptions.map(a => a.id === record.id ? {...a,titleEventIds} : a)}}
  makeSave(next) // one joined publication; no intermediate terminal or sale-only state escapes
  return next
}

/** Linked current49 producer proof. Frozen48 never receives this authority. */
export function validateAbsorptionRoot(state: GameState, label: string): void {
  validateAbsorbedRunMoney(state)
  const fail = (message: string): never => {throw new Error(`${label}: absorption ${message}`)}
  const h = state.hollywood
  const seen = new Set<string>()
  let priorWeek = -1, priorNumber = 0
  const exact = (value: object, keys: readonly string[]) => Object.keys(value).sort().join() === [...keys].sort().join()
  const keys = ['id','week','buyerId','targetId','disclosureId','quotedAtWeek','quoteAgePolicyVersion','consideration','cashBeforeExits','exitCharges','postExitCash','outlay','evaluatedBuyerWeek','evaluatedTargetWeek','contracts','research','facilities','titleEventIds','knowledge','physicalPlans','adoptions','stoppedProductions','continuedProductions','buyerWorkflows','workSteps','workReleases','workCancellations','runs','runReceipts','producerVersion']
  for (const a of state.rights.absorptions) {
    if (typeof a !== 'object' || a === null || !exact(a,a.producerVersion==='absorption-scripts/v2'?[...keys,'stoppedScripts']:keys)) fail('record has unknown or missing fields')
    if (a.quoteAgePolicyVersion !== 0 && a.quoteAgePolicyVersion !== 1) fail('unknown quote age policy version')
    const quoteAge = quoteAgeRefusal('absorptionPreview', a.quotedAtWeek, a.week, a.quoteAgePolicyVersion)
    if (quoteAge !== null) fail(`recorded acceptance quote age ${quoteAge}`)
    if (!h || (a.producerVersion !== 'absorption-clean/v1' && a.producerVersion !== 'absorption-scripts/v2') || !/^absorption-[1-9][0-9]*$/.test(a.id)) fail('unknown producer or id')
    const number = Number(a.id.slice('absorption-'.length))
    if (number <= priorNumber || a.week < priorWeek) fail('records do not retain producer order')
    priorNumber = number; priorWeek = a.week
    if (!Number.isSafeInteger(a.week) || a.week < state.rights.recordedFromWeek || a.week > state.market.tick) fail('invalid closing boundary')
    const buyerIdentity=h!.identities.find(i=>i.studioId===a.buyerId)
    if (!buyerIdentity || buyerIdentity.enteredWeek===null || buyerIdentity.enteredWeek>a.week
      || a.buyerId!==h!.playerStudioId && !h!.businesses.some(b=>b.studioId===a.buyerId)
      || a.targetId === a.buyerId || seen.has(a.targetId)) fail('unknown buyer or repeated terminal target')
    seen.add(a.targetId)
    const b = h!.businesses.find(b => b.studioId === a.targetId)
    const condition = state.corporateCondition.studios.find(r => r.studioId === a.targetId)
    if (!b || condition?.condition.stage !== 'stable' || condition.condition.week !== a.week
      || a.evaluatedTargetWeek !== a.week || a.evaluatedBuyerWeek !== a.week || state.studioClosure.closures.some(c => c.studioId === a.targetId)) fail('target lacks distinct stable absorbed provenance')
    if ([a.consideration,a.cashBeforeExits,a.exitCharges,a.postExitCash,a.outlay].some(n => !Number.isFinite(n))
      || !Number.isSafeInteger(a.consideration) || a.consideration < 0 || a.exitCharges < 0
      || a.postExitCash !== a.cashBeforeExits-a.exitCharges || a.outlay !== a.consideration-a.postExitCash || b!.account.cash !== 0) fail('cash-at-par conservation differs')
    const buyerRecord = state.corporateCondition.studios.find(r => r.studioId === a.buyerId)
    const buyerStage = state.corporateCondition.events.filter(e => e.studioId === a.buyerId && e.week <= a.week).at(-1)?.to ?? 'stable'
    if (!buyerRecord || buyerRecord.firstEvaluatedWeek > a.week || buyerStage !== 'stable'
      || (terminalWeekOf(state).get(a.buyerId) ?? Infinity) <= a.week
      || outstandingLoan(state,a.buyerId,a.week) !== undefined || outstandingLoan(state,a.targetId,a.week) !== undefined) fail('original stable loan-free operating parties differ')
    const d = state.rights.diligence.find(d => d.id === a.disclosureId)
    if (!d || d.recipientId !== a.buyerId || d.target.kind !== 'studio' || d.target.studioId !== a.targetId
      || !ABSORPTION_DISCLOSURE_SCOPE.every(s => d.scope.includes(s)) || d.week > a.week || d.staleFromWeek <= a.week) fail('missing genuine fresh full disclosure')
    if (![a.contracts,a.research,a.facilities,a.titleEventIds,a.knowledge,a.physicalPlans,a.adoptions,a.stoppedProductions,a.continuedProductions,a.buyerWorkflows,a.workSteps,a.workReleases,a.workCancellations,a.runs,a.runReceipts].every(Array.isArray)) fail('dispositions must be arrays')
    if(a.buyerId!==h!.playerStudioId && (a.contracts.some(c=>c.buyerContractId!==null)
      || a.continuedProductions.length!==0 || a.buyerWorkflows.length!==0 || a.workSteps.length!==0
      || a.workReleases.length!==0 || a.workCancellations.length!==0 || a.runs.length!==0 || a.runReceipts.length!==0)) {
      fail('rival buyer retained employment/work/run producer is not admitted')
    }
    const originals = h!.employment.filter(e => e.studioId === a.targetId && e.endedWeek === a.week && e.terms.endWeekExclusive > a.week
      && h!.receipts.some(r => r.kind === 'employment' && r.contractId === e.contractId && r.toStudioId === null && (r.reason === 'absorptionExit' || r.reason === 'absorptionContinuation')))
    if (a.contracts.map(c => c.sourceContractId).join() !== originals.map(c => c.contractId).join()) fail('employment dispositions differ from authoritative original order')
    let exits = 0
    for (const c of a.contracts) {
      if (!exact(c,['sourceContractId','buyerContractId','talentId','exitCost'])) fail('unknown employment disposition fields')
      const old = originals.find(e => e.contractId === c.sourceContractId)!
      if (c.talentId !== old.terms.talentId) fail('employment subject differs')
      const expected = c.buyerContractId === null ? terminationCost(old.terms,a.week) : 0
      if (c.exitCost !== expected) fail('exit differs from capped original bargain')
      exits += expected
      if (c.buyerContractId !== null) {
        const kept = h!.employment.find(e => e.contractId === c.buyerContractId)
        if (!kept || kept.studioId !== a.buyerId || kept.reason !== 'absorptionContinuation'
          || JSON.stringify(kept.terms) !== JSON.stringify({...old.terms,startWeek:a.week,termWeeks:old.terms.endWeekExclusive-a.week})) fail('retained linked bargain differs')
        if (state.ledger.some(r => r.kind === 'signingBonus' && r.week === a.week && r.talentId === c.talentId)) fail('retained signing provenance paid twice')
      }
    }
    if (exits !== a.exitCharges) fail('exit aggregate differs')
    if (state.technology.projects.some(p => p.studioId === a.targetId && p.status !== 'cancelled' && p.status !== 'completed')) fail('unsupported active adoption/research entered absorption producer')
    validateAbsorbedScripts(state,b!,a)
    validateAbsorbedProductionStops(state,b!,a)
    validateContinuedWork(state,b!,a)
    validateAbsorbedRuns(state,b!,a)
    if (state.promises.some(p => p.issuerStudioId === a.targetId && p.outcome === null)
      || state.talentMarket.cases.some(c => c.subjectStudioId === a.targetId && c.closedWeek === null)
      || state.talentMarket.proposals.some(p => p.issuerStudioId === a.targetId)) fail('unsupported open promise/market obligation entered clean producer')
    if (a.facilities.join() !== b!.operations.facilities.map(f => f.id).join()) fail('retained facility history differs')
    for (const r of a.research) {
      if (!exact(r,['projectId','verifiedWork','expenditure'])) fail('unknown research disposition fields')
      const p = state.technology.projects.find(p => p.id === r.projectId && p.studioId === a.targetId)
      if (!p || p.status !== 'cancelled' || p.absorptionCancellation?.absorptionId !== a.id || p.absorptionCancellation?.week !== a.week
        || p.verifiedWork !== r.verifiedWork || p.expenditure !== r.expenditure
        || p.seats.some(s => s.releasedWeek === null || s.releasedWeek > a.week)) fail('cancelled research lost its earned history')
    }
    const cancelled = state.technology.projects.filter(p => p.absorptionCancellation?.absorptionId === a.id)
    if (new Set(a.research.map(r => r.projectId)).size !== a.research.length
      || a.research.map(r => r.projectId).join() !== cancelled.map(p => p.id).join()
      || cancelled.some(p => p.studioId !== a.targetId || p.absorptionCancellation!.week !== a.week)) fail('research cancellation/disposition bijection or original project order differs')
    const stoppedAdoptions=state.technology.adoptions.filter(p=>p.absorptionDisposition?.absorptionId===a.id)
    if(a.adoptions.map(d=>d.adoptionId).join()!==stoppedAdoptions.map(p=>p.id).join())fail('adoption disposition/owner bijection or original order differs')
    if(state.technology.adoptions.some(p=>p.studioId===a.targetId && p.operationalWeek===null && p.cancelledWeek===null && p.absorptionDisposition?.absorptionId!==a.id))fail('pending absorbed adoption lacks disposition')
    for(const d of a.adoptions) {
      if(!exact(d,['adoptionId','technologyId','committedWeek','equipmentAssetId','equipmentCost','installationCost']))fail('unknown adoption disposition fields')
      const p=stoppedAdoptions.find(p=>p.id===d.adoptionId)
      if(!p || p.studioId!==a.targetId || p.absorptionDisposition!.week!==a.week || p.absorptionDisposition!.kind!=='stoppedPending'
        || p.operationalWeek!==null || p.cancelledWeek!==null || p.committedWeek>a.week || a.week>=p.committedWeek+technologyEntry(p.technologyId).deploymentWeeks
        || d.technologyId!==p.technologyId || d.committedWeek!==p.committedWeek || d.equipmentAssetId!==p.equipmentAssetId
        || d.equipmentCost!==p.equipmentCost || d.installationCost!==p.installationCost
        || h!.receipts.some(r=>r.kind==='technologyAdopted' && r.adoptionId===p.id))fail('stopped adoption original paid provenance differs')
    }
    const targetPlans=state.physicalPlans.plans.filter(p=>p.studioId===a.targetId)
    if(targetPlans.some(p=>p.queuedWeek>a.week||p.status!=='cancelled'&&p.absorptionDisposition?.absorptionId!==a.id))fail('absorbed identity has new or undisposed physical work')
    const plans=state.physicalPlans.plans.filter(p=>p.absorptionDisposition?.absorptionId===a.id)
    if(a.physicalPlans.map(p=>p.planId).join()!==plans.map(p=>p.id).join())fail('physical plan disposition/owner bijection or original order differs')
    for(const d of a.physicalPlans) {
      if(!exact(d,['planId','disposition','committedCost']))fail('unknown physical plan disposition')
      const p=plans.find(p=>p.id===d.planId)!, mark=p.absorptionDisposition!
      if(p.studioId!==a.targetId||mark.week!==a.week||mark.kind!==d.disposition||d.committedCost!==(p.commitReceipt?.cost??0))fail('physical disposition differs from actual paid owner')
      if(d.disposition==='retainedCompleted'&&unfinishedAbsorptionPlan(state,p,a.week))fail('completed plant has no genuine completion at absorption')
      if(d.disposition==='stoppedPaid'&&(p.status!=='started'||!p.commitReceipt||p.commitReceipt.week+p.approvedQuote.buildWeeks<=a.week
        || !unfinishedAbsorptionPlan(state,p,a.week)))fail('stopped paid work was not genuinely unfinished at absorption')
    }
    const completed = state.technology.projects.filter(p => p.studioId === a.targetId && p.status === 'completed')
    if (a.knowledge.map(k => k.sourceProjectId).join() !== completed.map(p => p.id).join()) fail('completed knowledge dispositions omit or duplicate the authentic source order')
    for (const k of a.knowledge) {
      if (!exact(k,['technologyId','sourceProjectId','completedWeek','disposition']) || !['granted','alreadyHeld'].includes(k.disposition)) fail('unknown knowledge disposition')
      const original = completed.find(p => p.id === k.sourceProjectId)!
      if (original.seats.some(s=>s.releasedWeek===null||s.releasedWeek>a.week))fail('completed source retains an occupied seat after employer absorption')
      if (k.technologyId !== original.technologyId || k.completedWeek !== original.completedWeek || k.completedWeek > a.week) fail('knowledge differs from genuine completed source research')
      const grant = state.technology.access.find(x => x.studioId === a.buyerId && x.technologyId === k.technologyId && x.acquiredWeek !== null)
      if (!grant) fail('knowledge has no buyer access')
      if (k.disposition === 'granted') {
        if (grant!.route !== 'acquired' || grant!.chosenWeek !== a.week || grant!.acquiredWeek !== a.week
          || grant!.acquiredKnowledge?.absorptionId !== a.id || grant!.acquiredKnowledge?.sourceStudioId !== a.targetId
          || grant!.acquiredKnowledge?.sourceProjectId !== k.sourceProjectId) fail('new knowledge has no exact linked buyer grant')
      } else if (grant!.acquiredWeek! > a.week || grant!.route === 'acquired' && grant!.acquiredKnowledge?.absorptionId === a.id) fail('already-held knowledge fabricated a second grant')
    }
    const events = state.rights.titleEvents.filter(e => e.source.kind === 'absorption' && e.source.absorptionId === a.id)
    if (events.map(e => e.id).join() !== a.titleEventIds.join()) fail('title event join differs')
    if (new Set(a.titleEventIds).size !== a.titleEventIds.length) fail('repeated title disposition')
    if (events.length) {
      const firstOrder = Math.min(...events.map(e => e.boundaryOrder))
      // A legacy subject is materialized immediately before its own transfer. Later subjects' genuine
      // genesis orders can therefore follow this transaction's first transfer. Keep only those authentic
      // legacy heads dated by C, while excluding every transfer at/after the first transfer boundary.
      // Future genesis cannot invent past ownership; full rights validation proves each retained source.
      const before = {...state,rights:{...state.rights,titleEvents:state.rights.titleEvents.filter(e => e.boundaryOrder < firstOrder
        || e.cause === 'genesis' && e.source.kind === 'legacy' && (e.date.kind === 'beforeCampaign' || e.date.week <= a.week))}}
      const expected = subjectsHeldBy(resolveTitles(before),before.rights.estates,a.targetId,a.week)
      const key = (s: RightSubject) => s.right === 'R1' ? `R1:${s.propertyId}` : `R2:${s.filmId}`
      if (expected.map(key).sort().join() !== events.map(e => key(e.subject)).sort().join()) fail('held title dispositions incomplete')
    } else if (subjectsHeldBy(resolveTitles(state),state.rights.estates,a.targetId,a.week).length) fail('held title disposition omitted')
    for (const e of events) if (!exact(e.source,['kind','absorptionId']) || e.priorHolder !== a.targetId || e.newHolder !== a.buyerId || e.date.kind !== 'campaign' || e.date.week !== a.week) fail('title transition differs')
  }
}
