// ── P13B-S8 — symmetric rival research: plant, policy and the weekly step ────
//
// WHAT THIS IS. A rival studio researches and deploys under the SAME law as the
// player — the same `technology.ts` internals, the same seat and week arithmetic,
// the same employment law — resolved through a `StudioContext` that answers
// "which Laboratory, which contract, which module, whose cash" from the rival's
// own roots instead of the player's.
//
// THE PINS:
//   1. NO INVENTED PLANT. A rival owns no placement (the lot is the player's), so
//      every Laboratory it holds traces to an ADMITTED plan row of its own and to
//      its `laboratoryCommitted` / `laboratoryOperational` receipts, and every
//      instrument module to an admitted plan and an `instrumentOperational`
//      receipt. The validator refuses any rival authority without them.
//   2. ITS OWN MONEY. Capital is booked as `researchCapacity` at admission, the
//      weekly research bill as `researchSpend` in the rival's own step. The
//      player's cash and ledger are never touched by a rival's research.
//   3. RESERVE FIRST. Capital is committed only when the rival's cash covers the
//      approved quote PLUS `reserveWeeks` of its own operating cost.
//   4. BOUNDED. At most two Laboratories per rival, four seats each.
//
// This module is pure: no RNG, no clock, no I/O. Every function returns new
// objects, except the internals the weekly tick calls with its OWN clones.

import { moveRivalMoney, rivalWeeklyOperatingCost } from './hollywood.js'
import type { RivalFinanceEra } from './hollywood.js'
import { blueprintById, facilityDemolitionRefund, physicalQuoteFingerprint } from './placement.js'
import { assignSeat, beginProject, studioContext, advanceRivalResearchWeek } from './technology.js'
import { TECHNOLOGY_CATALOGUE, technologyEntry } from './technologyCatalogue.js'
import { TUNING } from './tuning.js'
import type { StudioHistoryDraft } from './studioHistory.js'
import type { GameState, PhysicalPlan, PhysicalPlanWork, PlanQuoteSnapshot, StudioPhysicalPlans, Talent } from './types.js'
import type { HollywoodState, IndustryReceipt, RivalBusiness } from './hollywoodTypes.js'
import type { TechnologyId } from './technologyTypes.js'

export { advanceRivalResearchWeek } from './technology.js'

/**
 * The rival research policy, as DATA (CANDIDATE values, P13B-S8 OPEN: the
 * companion owes the authored numbers). One row per catalogue technology:
 * interest opens the week the technology becomes researchable at all, and the
 * seats and weekly budget are the maxima the shared law allows — four seats (one
 * Laboratory) and the usable ceiling those seats can actually spend.
 */
export type RivalResearchPolicyRow = {
  technologyId: TechnologyId
  interestFromWeek: number
  seats: number
  budgetPerWeek: number
}
export const RIVAL_RESEARCH_POLICY: readonly RivalResearchPolicyRow[] = TECHNOLOGY_CATALOGUE.map(entry => ({
  technologyId: entry.id,
  interestFromWeek: entry.researchableWeek,
  seats: TUNING.RESEARCH_LABORATORY_CAPACITY,
  budgetPerWeek: entry.usableBudgetPerScientist * TUNING.RESEARCH_LABORATORY_CAPACITY,
}))

const LABORATORY_BLUEPRINT_ID = 'research-laboratory'
const MAXIMUM_LABORATORIES = 2

/** The exact price of one rival plan's work, from the authored blueprint — a rival has no lot to quote against. */
function rivalQuote(work: PhysicalPlanWork): PlanQuoteSnapshot {
  const blueprint = blueprintById(work.blueprintId)
  if (blueprint === null) throw new Error(`Unknown rival plan blueprint: ${work.blueprintId}`)
  const snapshot = {
    cost: blueprint.capex,
    buildWeeks: blueprint.buildWeeks,
    weeklyOperatingCost: blueprint.weeklyOperatingCost,
    components: (blueprint.installationComponents ?? []).map(component => ({ label: component.label, cost: component.cost, weeks: component.weeks })),
  }
  const target = work.kind === 'placement'
    ? `${String(work.origin.gx)},${String(work.origin.gy)}`
    : 'facilityId' in work.target ? work.target.facilityId : work.target.planId
  return { fingerprint: physicalQuoteFingerprint({ kind: work.kind, blueprintId: work.blueprintId, target, ...snapshot }), ...snapshot }
}

type ReceiptDraft = IndustryReceipt extends infer R ? R extends IndustryReceipt ? Omit<R, 'eventId'> : never : never
function appendReceipt(h: HollywoodState, draft: ReceiptDraft): void {
  h.receipts = [...h.receipts, { ...draft, eventId: `industry-event-${String(h.nextReceipt++)}` } as IndustryReceipt]
}

function ownPlans(plans: StudioPhysicalPlans, studioId: string): readonly PhysicalPlan[] {
  return plans.plans.filter(plan => plan.studioId === studioId)
}

/**
 * The technologies this rival would research this week: researchable, not already
 * held, and not already being invented by somebody else.
 *
 * POLICY (P13B-S8, CANDIDATE — the companion owes the authored rule): one studio
 * at a time pursues a given technology. The refinement's own rule stands a rival
 * down once a PLAYER prototype exists; this reads the same sentence across the
 * whole industry, so a technology has ONE inventor and every other studio reaches
 * it the way it always has — by commercial purchase once it is on sale. Without
 * that, every rival invents every technology within weeks of its research week
 * and the commercial route never happens again in any campaign.
 */
function interests(state: GameState, business: RivalBusiness, week: number): readonly RivalResearchPolicyRow[] {
  return RIVAL_RESEARCH_POLICY.filter(row => {
    if (week < row.interestFromWeek) return false
    if (state.technology.access.some(a => a.studioId === business.studioId && a.technologyId === row.technologyId && a.acquiredWeek !== null)) return false
    if (state.technology.access.some(a => a.studioId !== business.studioId && a.technologyId === row.technologyId &&
      a.route === 'research' && a.acquiredWeek !== null)) return false
    return !state.technology.projects.some(p => p.studioId !== business.studioId && p.technologyId === row.technologyId && p.status !== 'cancelled')
  })
}

/**
 * How many Scientists this rival still needs to fill the seats its own policy
 * demands on Laboratories that are actually equipped for that research. `staff()`
 * hires them through the shared employment law, exactly as it hires every other
 * role (P13B-S8 audit item 8).
 */
export function rivalScientistDemand(state: GameState, h: HollywoodState, business: RivalBusiness,
  talent: readonly Talent[], week: number): number {
  if (business.costCutting.since !== null) return 0
  const context = studioContext({ ...state, hollywood: h, talent: talent as Talent[] }, business.studioId)
  const capacity = context.facilities.reduce((sum, f) => f.capability === 'laboratory' ? sum + f.capacity : sum, 0)
  if (capacity === 0) return 0
  const demanded = interests(state, business, week).reduce((sum, row) =>
    context.facilities.some(f => f.capability === 'laboratory' && context.instrumentOperational(f.id, row.technologyId)) ? sum + row.seats : sum, 0)
  const employed = h.activeEmploymentOrdinals.map(i => h.employment[i]!)
    .filter(row => row.studioId === business.studioId && talent.find(t => t.id === row.terms.talentId)?.role === 'scientist').length
  return Math.max(0, Math.min(capacity, demanded) - employed)
}

/**
 * ONE business's admission, against the tick's own clones (`h` and `business` are
 * the caller's working copies and ARE mutated, exactly as the rest of the weekly
 * industry step works). Returns the plan root it produced.
 */
function admitFor(state: GameState, h: HollywoodState, business: RivalBusiness, plans: StudioPhysicalPlans, week: number, financeEra: RivalFinanceEra = 'live'): StudioPhysicalPlans {
  let root = plans
  const reserve = rivalWeeklyOperatingCost(business, h, week) * business.policy.reserveWeeks
  const admit = (work: PhysicalPlanWork, facilityId: string | null): boolean => {
    const quote = rivalQuote(work)
    if (business.account.cash < quote.cost + reserve) return false
    // A rival numbers its OWN plans. `nextPlanId` is the PLAYER's high-water mark
    // — the counter its own queue verb mints from — and a rival's abstract plant
    // never moves it, so a campaign's player-facing plan identities are exactly
    // what they were before any rival built anything.
    const own = ownPlans(root, business.studioId)
    const id = `${business.studioId}:plan:${String(own.reduce((highest, plan) => Math.max(highest, Number(plan.id.slice(plan.id.lastIndexOf(':') + 1))), 0) + 1)}`
    const ordinal = own.reduce((highest, plan) => Math.max(highest, plan.ordinal), 0) + 1
    const plan: PhysicalPlan = {
      id, studioId: business.studioId, ordinal, queuedWeek: week, work, dependsOn: [],
      approvedMaximumDebit: quote.cost, earliestStartWeek: week, admission: 'automatic',
      approvedQuote: quote, pendingQuote: null, status: 'started', statusWeek: week, reason: null,
      startedPlacementId: null, commitReceipt: { week, fingerprint: quote.fingerprint, cost: quote.cost },
    }
    root = { ...root, plans: [...root.plans, plan] }
    moveRivalMoney(business.account, 'researchCapacity', -quote.cost, week, financeEra)
    if (facilityId !== null) appendReceipt(h, { week, studioId: business.studioId, kind: 'laboratoryCommitted', planId: id, facilityId })
    return true
  }

  const laboratories = business.operations.facilities.filter(f => f.capability === 'laboratory')
  const laboratoryPlans = ownPlans(root, business.studioId).filter(plan => plan.work.blueprintId === LABORATORY_BLUEPRINT_ID)
  // A second Laboratory only once the first one's seats are all taken — the bound
  // is two, but capital is committed for work that exists, never on speculation.
  const seated = state.technology.projects.filter(p => p.studioId === business.studioId)
    .reduce((n, p) => n + p.seats.filter(s => s.releasedWeek === null).length, 0)
  const wantsLaboratory = laboratoryPlans.length === 0 ||
    (laboratoryPlans.length < MAXIMUM_LABORATORIES && laboratories.length > 0 &&
      seated >= laboratories.reduce((sum, f) => sum + f.capacity, 0))
  if (wantsLaboratory) {
    admit({ kind: 'placement', blueprintId: LABORATORY_BLUEPRINT_ID, origin: { gx: 0, gy: 0 } },
      `${business.studioId}:laboratory:${String(laboratoryPlans.length)}`)
  }
  // Instruments, per technology of interest, on a Laboratory that stands and does
  // not already carry (or await) that module.
  for (const row of interests(state, business, week)) {
    const blueprintId = technologyEntry(row.technologyId).instrumentBlueprintId
    for (const laboratory of business.operations.facilities.filter(f => f.capability === 'laboratory')) {
      const already = ownPlans(root, business.studioId).some(plan => plan.work.blueprintId === blueprintId &&
        plan.work.kind === 'installation' && 'facilityId' in plan.work.target && plan.work.target.facilityId === laboratory.id)
      if (already) continue
      if (admit({ kind: 'installation', blueprintId, target: { facilityId: laboratory.id } }, null)) break
    }
  }
  return root
}

/** A rival business, cloned down to the account period its own admission will move. */
function workingBusiness(business: RivalBusiness): RivalBusiness {
  return {
    ...business,
    account: {
      ...business.account,
      periods: business.account.periods.map((p, i) => i === business.account.periods.length - 1 ? { ...p, movements: { ...p.movements } } : p),
    },
  }
}

/**
 * THE RIVAL ADMISSION BOUNDARY (P13B-S8 audit item 7). Called once per week inside
 * `advanceHollywoodWeek`, after `staff()` and before `decide()`; exported so the
 * decision can be driven — and proved — on its own. Pure: nothing the caller owns
 * is modified. `history` mirrors `admitPhysicalPlans`'s shape and is always empty:
 * `studioHistory` is the PLAYER's record, and a rival writes no row in it.
 */
export function admitRivalPlans(state: GameState, era: 'recovery' | 'pre-recovery' = 'recovery'): { state: GameState; history: readonly StudioHistoryDraft[] } {
  const source = state.hollywood
  if (!source || source.businesses.length === 0) return { state, history: [] }
  const h: HollywoodState = { ...source, receipts: [...source.receipts], businesses: source.businesses.map(workingBusiness) }
  const week = state.market.tick
  let plans = state.physicalPlans
  for (const business of h.businesses) {
    // Explicit pre-recovery staging is the existing V27 research admission seam.
    // It selects that money roster; no era is inferred from missing live fields.
    if (era === 'recovery' && business.costCutting.since !== null) continue
    plans = admitFor({ ...state, hollywood: h }, h, business, plans, week, era === 'pre-recovery' ? 'research-v27' : 'live')
  }
  if (plans === state.physicalPlans && h.receipts.length === source.receipts.length) return { state, history: [] }
  return { state: { ...state, hollywood: h, physicalPlans: plans }, history: [] }
}

/** The admission step the weekly industry tick runs against its own clones. */
export function admitRivalPlansInWeek(state: GameState, h: HollywoodState, business: RivalBusiness,
  plans: StudioPhysicalPlans, week: number): StudioPhysicalPlans {
  if (business.costCutting.since !== null) return plans
  return admitFor(state, h, business, plans, week)
}

/**
 * One rival's research week (P13B-S8): seat the Scientists it employs, begin what
 * is ready, advance what is active, and book the week's spend to its own account.
 * `h` and `business` are the weekly tick's clones and are mutated; the technology
 * root is returned.
 */
export function advanceRivalResearch(state: GameState, h: HollywoodState, business: RivalBusiness,
  talent: readonly Talent[], week: number): GameState['technology'] {
  let technology = state.technology
  const working = (): GameState => ({ ...state, hollywood: h, technology, talent: talent as Talent[] })
  // Existing active projects keep advancing below. Only new seats/starts stop.
  for (const row of business.costCutting.since === null ? interests(state, business, week) : []) {
    const context = studioContext(working(), business.studioId)
    const laboratories = context.facilities.filter(f => f.capability === 'laboratory' && context.instrumentOperational(f.id, row.technologyId))
    if (laboratories.length === 0) continue
    const projectId = `${business.studioId}:research:${row.technologyId}`
    // Seat every idle Scientist this studio employs, up to the policy's seats.
    for (const laboratory of laboratories) {
      const scientists = h.activeEmploymentOrdinals.map(i => h.employment[i]!)
        .filter(row2 => row2.studioId === business.studioId && talent.find(t => t.id === row2.terms.talentId)?.role === 'scientist')
      for (const employment of scientists) {
        const project = technology.projects.find(p => p.id === projectId)
        const seated = project ? project.seats.filter(s => s.releasedWeek === null).length : 0
        if (seated >= row.seats) break
        if (technology.projects.some(p => p.seats.some(s => s.releasedWeek === null && s.talentId === employment.terms.talentId))) continue
        let next: GameState
        try {
          next = assignSeat(working(), studioContext(working(), business.studioId),
            { laboratoryFacilityId: laboratory.id, scientistId: employment.terms.talentId, technologyId: row.technologyId })
        } catch { break }
        technology = next.technology
        appendReceipt(h, { week, studioId: business.studioId, kind: 'researchSeatAssigned', projectId, talentId: employment.terms.talentId })
      }
    }
    const project = technology.projects.find(p => p.id === projectId)
    if (project && project.status !== 'active' && project.status !== 'completed' && project.status !== 'cancelled') {
      try {
        technology = beginProject(working(), studioContext(working(), business.studioId), projectId, row.budgetPerWeek).technology
      } catch { /* a prerequisite is not met this week; nothing is written down */ }
    }
  }
  // The active projects' week, through the shared law, paid from this account.
  for (const project of technology.projects.filter(p => p.studioId === business.studioId && p.status === 'active')) {
    const step = advanceRivalResearchWeek(working(), business, project)
    technology = step.technology
    if (step.cost > 0) moveRivalMoney(business.account, 'researchSpend', -step.cost, week)
  }
  return technology
}

/**
 * The plans that finished this week become plant: an abstract Laboratory on the
 * rival's own operations (the S5 precedent for plant with no placement), or an
 * instrument module that exists as its receipt. Run at the END of the tick, on
 * the week that has ARRIVED — the same boundary a rival adoption's clock uses —
 * so a plan committed in week w opens at w + its own authored build weeks.
 */
export function completeRivalPlans(state: GameState): GameState {
  const source = state.hollywood
  if (!source || state.physicalPlans.plans.length === 0) return state
  const week = state.market.tick
  const h: HollywoodState = { ...source, receipts: [...source.receipts], businesses: [...source.businesses] }
  let changed = false
  for (const [index, business] of h.businesses.entries()) {
    let operations = business.operations
    for (const plan of state.physicalPlans.plans) {
      if (plan.studioId !== business.studioId || plan.status !== 'started' || plan.commitReceipt === null) continue
      if (week < plan.commitReceipt.week + plan.approvedQuote.buildWeeks) continue
      if (plan.work.blueprintId === LABORATORY_BLUEPRINT_ID) {
        const commitment = h.receipts.find(r => r.kind === 'laboratoryCommitted' && r.planId === plan.id)
        if (commitment?.kind !== 'laboratoryCommitted') throw new Error(`Rival plan ${plan.id} has no commitment receipt to name its Laboratory`)
        if (operations.facilities.some(f => f.id === commitment.facilityId)) continue
        operations = { ...operations, facilities: [...operations.facilities, {
          id: commitment.facilityId, name: 'Research Laboratory', capability: 'laboratory',
          capacity: TUNING.RESEARCH_LABORATORY_CAPACITY,
        }] }
        appendReceipt(h, { week, studioId: business.studioId, kind: 'laboratoryOperational', facilityId: commitment.facilityId })
        changed = true
        continue
      }
      const technologyId = TECHNOLOGY_CATALOGUE.find(entry => entry.instrumentBlueprintId === plan.work.blueprintId)?.id
      if (technologyId === undefined || plan.work.kind !== 'installation' || !('facilityId' in plan.work.target)) continue
      const facilityId = plan.work.target.facilityId
      if (h.receipts.some(r => r.kind === 'instrumentOperational' && r.studioId === business.studioId &&
        r.facilityId === facilityId && r.technologyId === technologyId)) continue
      appendReceipt(h, { week, studioId: business.studioId, kind: 'instrumentOperational', facilityId, technologyId })
      changed = true
    }
    if (operations !== business.operations) h.businesses[index] = { ...business, operations }
  }
  // A project that completed this week is a matter of public record too.
  for (const project of state.technology.projects) {
    if (project.completedWeek !== week || project.studioId === h.playerStudioId) continue
    if (h.receipts.some(r => r.kind === 'researchCompleted' && r.projectId === project.id)) continue
    appendReceipt(h, { week, studioId: project.studioId, kind: 'researchCompleted', projectId: project.id })
    changed = true
  }
  return changed ? { ...state, hollywood: h } : state
}

export type RivalFacilityDisposalEligibility =
  | { eligible: true; planId: string; refund: number }
  | { eligible: false; reason: string; subjectId: string }

/** 1363-A2: only an operational, paid, bare laboratory may be disposed.
 * Every retained dependency is inspected through its actual typed identity. */
export function rivalFacilityDisposalEligibility(state: GameState, studioId: string,
  facilityId: string): RivalFacilityDisposalEligibility {
  const no = (reason: string, subjectId = facilityId): RivalFacilityDisposalEligibility =>
    ({ eligible: false, reason, subjectId })
  const h = state.hollywood
  if (h?.playerStudioId === studioId) return no('not-rival', studioId)
  const business = h?.businesses.find(b => b.studioId === studioId)
  if (!h || !business) return no('unknown-studio', studioId)
  if (h.receipts.some(r => r.kind === 'facilityDisposed' && r.studioId === studioId && r.facilityId === facilityId)) {
    return no('already-disposed')
  }
  if (h.businesses.some(b => b.studioId !== studioId && b.operations.facilities.some(f => f.id === facilityId))
    || h.receipts.some(r => (r.kind === 'laboratoryCommitted' || r.kind === 'facilityDisposed')
      && r.studioId !== studioId && r.facilityId === facilityId)) return no('foreign-facility')
  if (['development', 'stage', 'scenery', 'post'].some(suffix => facilityId === `${studioId}:${suffix}`)) {
    return no('core-facility')
  }
  const facility = business.operations.facilities.find(f => f.id === facilityId)
  const commitments = h.receipts.filter((r): r is Extract<IndustryReceipt, { kind: 'laboratoryCommitted' }> =>
    r.kind === 'laboratoryCommitted' && r.studioId === studioId && r.facilityId === facilityId)
  if (!facility && commitments.length === 0) return no('unknown-facility')
  if (business.costCutting.since === null) return no('not-cutting', studioId)
  if (commitments.length !== 1) return no('body-provenance')
  const commitment = commitments[0]!
  const plans = state.physicalPlans.plans.filter(plan => plan.studioId === studioId)
  const bodies = plans.filter(plan => plan.id === commitment.planId)
  if (bodies.length !== 1) return no('body-provenance', commitment.planId)
  const body = bodies[0]!
  if (body.work.kind !== 'placement' || body.work.blueprintId !== LABORATORY_BLUEPRINT_ID) {
    return no('ineligible-blueprint', body.id)
  }
  const blueprint = blueprintById(LABORATORY_BLUEPRINT_ID)!
  const refund = facilityDemolitionRefund(blueprint)
  const quote = rivalQuote(body.work)
  if (body.status !== 'started' || body.commitReceipt === null || body.startedPlacementId !== null
    || body.commitReceipt.week !== commitment.week || body.commitReceipt.cost !== quote.cost
    || body.commitReceipt.fingerprint !== quote.fingerprint || body.approvedQuote.fingerprint !== quote.fingerprint
    || body.approvedQuote.cost !== quote.cost || body.approvedQuote.buildWeeks !== quote.buildWeeks
    || !(refund < body.commitReceipt.cost)) return no('body-provenance', body.id)
  const operational = h.receipts.filter(r => r.kind === 'laboratoryOperational'
    && r.studioId === studioId && r.facilityId === facilityId)
  if (!facility || operational.length === 0 || state.market.tick < body.commitReceipt.week + quote.buildWeeks) {
    return no('not-operational')
  }
  if (facility.capability !== 'laboratory' || operational.length !== 1
    || operational[0]!.week !== body.commitReceipt.week + quote.buildWeeks) return no('body-provenance', body.id)

  const dependency = rivalFacilityDependencyRefusal(state, business, facilityId, body)
  if (dependency) return dependency
  return { eligible: true, planId: body.id, refund }
}

/** Atomic public mutation: cloned money owner, one body removal, one tombstone. */
export function disposeRivalFacility(state: GameState, studioId: string, facilityId: string): GameState {
  const eligibility = rivalFacilityDisposalEligibility(state, studioId, facilityId)
  if (!eligibility.eligible) {
    throw new Error(`rival facility disposal: ${eligibility.reason} (${eligibility.subjectId})`)
  }
  const source = state.hollywood!
  const index = source.businesses.findIndex(b => b.studioId === studioId)
  const business = workingBusiness(source.businesses[index]!)
  business.operations = { ...business.operations,
    facilities: business.operations.facilities.filter(f => f.id !== facilityId) }
  const h: HollywoodState = { ...source, businesses: [...source.businesses], receipts: [...source.receipts] }
  h.businesses[index] = business
  moveRivalMoney(business.account, 'facilityDemolitionRefund', eligibility.refund, state.market.tick)
  appendReceipt(h, { kind: 'facilityDisposed', week: state.market.tick, studioId, facilityId,
    planId: eligibility.planId, blueprintId: LABORATORY_BLUEPRINT_ID, refund: eligibility.refund })
  return { ...state, hollywood: h }
}

/** Original commitment receipt order is policy order; every mutation rechecks. */
export function disposeEligibleRivalFacilities(state: GameState, studioId: string): GameState {
  const business = state.hollywood?.businesses.find(b => b.studioId === studioId)
  if (!business || business.costCutting.since === null) return state
  let next = state
  for (const receipt of state.hollywood?.receipts ?? []) {
    if (receipt.kind !== 'laboratoryCommitted' || receipt.studioId !== studioId) continue
    if (rivalFacilityDisposalEligibility(next, studioId, receipt.facilityId).eligible) {
      next = disposeRivalFacility(next, studioId, receipt.facilityId)
    }
  }
  return next
}

/** Retained dependencies protect a body both before removal and in its tombstone proof.
 * This does not inspect the current cutting flag or require the removed body to stand. */
function rivalFacilityDependencyRefusal(state: GameState, business: RivalBusiness, facilityId: string,
  body: PhysicalPlan): Extract<RivalFacilityDisposalEligibility, { eligible: false }> | null {
  const no = (reason: string, subjectId: string): Extract<RivalFacilityDisposalEligibility, { eligible: false }> =>
    ({ eligible: false, reason, subjectId })
  const studioId = business.studioId, h = state.hollywood!
  const plans = state.physicalPlans.plans.filter(plan => plan.studioId === studioId)
  for (const workflow of business.operations.workflows) {
    const setup = workflow.setup
    if (workflow.reservations.some(r => r.facilityId === facilityId)
      || workflow.shootingTask?.soundstageFacilityId === facilityId
      || workflow.bindings.stageFacilityId === facilityId
      || setup?.stageFacilityId === facilityId || setup?.priorWork.some(p => p.stageFacilityId === facilityId)) {
      return no('reserved-capacity', workflow.productionId)
    }
  }
  const script = business.development.projects.find(p => p.reservation?.facilityId === facilityId)
  if (script) return no('reserved-capacity', script.id)
  const research = state.technology.projects.find(p => p.studioId === studioId
    && (p.laboratoryFacilityId === facilityId || p.seats.some(seat => seat.laboratoryFacilityId === facilityId)
      || p.weeks.some(week => week.labs?.some(lab => lab.laboratoryFacilityId === facilityId))))
  if (research) return no('research-history', research.id)

  const targetsBody = (plan: PhysicalPlan): boolean => plan.work.kind === 'installation'
    && ('facilityId' in plan.work.target ? plan.work.target.facilityId === facilityId : plan.work.target.planId === body.id)
  const instrument = plans.find(plan => plan.commitReceipt !== null && targetsBody(plan))
  if (instrument) return no('instrument-commitment', instrument.id)
  const installed = h.receipts.find(r => r.kind === 'instrumentOperational'
    && r.studioId === studioId && r.facilityId === facilityId)
  if (installed) return no('operational-instrument', installed.eventId)

  // Rival targets resolve through the commitment's plan/body identity, never a
  // player placement. Retain intermediate edges, even for cancelled intents.
  const byId = new Map(plans.map(plan => [plan.id, plan]))
  const requiresBody = (plan: PhysicalPlan, seen: Set<string>): boolean => {
    if (plan.id === body.id || targetsBody(plan)) return true
    if (seen.has(plan.id)) return false
    seen.add(plan.id)
    const target = plan.work.kind === 'installation' && 'planId' in plan.work.target ? [plan.work.target.planId] : []
    return [...plan.dependsOn, ...target].some(id => {
      const dependency = byId.get(id)
      return dependency !== undefined && requiresBody(dependency, seen)
    })
  }
  const dependent = plans.find(plan => plan.id !== body.id
    && !(plan.status === 'cancelled' && plan.commitReceipt === null) && requiresBody(plan, new Set()))
  if (dependent) return no('plan-dependency', dependent.id)
  const adoption = state.technology.adoptions.find(a => a.studioId === studioId
    && (a.stageFacilityId === facilityId || a.postFacilityId === facilityId))
  if (adoption) return no('adoption-dependency', adoption.id)
  return null
}

/** New-era owner proof, called only with the explicit disposal era enabled.
 * Current cutting is deliberately irrelevant to persisted disposal history. */
export function validateRivalFacilityDisposal(state: GameState): void {
  const h = state.hollywood
  if (!h) return
  const fail: (reason: string) => never = reason => { throw new Error(`rival facility disposal invariant: ${reason}`) }
  const require = (condition: boolean, reason: string): void => { if (!condition) fail(reason) }
  const refund = facilityDemolitionRefund(blueprintById(LABORATORY_BLUEPRINT_ID)!)
  const rows = h.receipts.filter((r): r is Extract<IndustryReceipt, { kind: 'facilityDisposed' }> => r.kind === 'facilityDisposed')
  const bodies = new Set<string>(), disposedPlans = new Set<string>()
  for (const row of rows) {
    require(row.refund === refund, 'wrong-refund')
    require(row.blueprintId === LABORATORY_BLUEPRINT_ID, 'wrong-blueprint')
    require(Number.isInteger(row.week) && row.week >= 0 && row.week <= state.market.tick, 'future-disposal')
    const plan = state.physicalPlans.plans.find(p => p.id === row.planId)
    if (!plan) fail('missing-body-plan')
    const business = h.businesses.find(b => b.studioId === row.studioId)
    if (!business || plan.studioId !== row.studioId || row.studioId === h.playerStudioId) fail('wrong-owner')
    const commitment = h.receipts.filter((r): r is Extract<IndustryReceipt, { kind: 'laboratoryCommitted' }> =>
      r.kind === 'laboratoryCommitted' && r.studioId === row.studioId && r.planId === row.planId)
    require(commitment.length === 1, 'missing-commitment')
    require(commitment[0]!.facilityId === row.facilityId, 'wrong-body')
    const key = `${row.studioId}\u0000${row.facilityId}`
    require(!bodies.has(key) && !disposedPlans.has(row.planId), 'duplicate-disposal')
    bodies.add(key); disposedPlans.add(row.planId)
    require(!business.operations.facilities.some(f => f.id === row.facilityId), 'standing-and-disposed')
    require(!['development', 'stage', 'scenery', 'post'].some(suffix => row.facilityId === `${row.studioId}:${suffix}`), 'core-disposal')
    require(plan.work.kind === 'placement' && plan.work.blueprintId === LABORATORY_BLUEPRINT_ID, 'wrong-blueprint')
    const quote = rivalQuote(plan.work)
    require(plan.status === 'started' && plan.startedPlacementId === null && plan.commitReceipt !== null
      && plan.commitReceipt.week === commitment[0]!.week && plan.commitReceipt.cost === quote.cost
      && plan.commitReceipt.fingerprint === quote.fingerprint && plan.approvedQuote.fingerprint === quote.fingerprint
      && plan.approvedQuote.cost === quote.cost && plan.approvedQuote.buildWeeks === quote.buildWeeks
      && row.refund < plan.commitReceipt.cost, 'unpaid-body-plan')
    const operational = h.receipts.filter(r => r.kind === 'laboratoryOperational'
      && r.studioId === row.studioId && r.facilityId === row.facilityId)
    require(operational.length === 1, 'missing-operational')
    require(operational[0]!.week === plan.commitReceipt!.week + quote.buildWeeks
      && row.week >= operational[0]!.week, 'pre-operational-disposal')
    require(h.receipts.indexOf(commitment[0]!) < h.receipts.indexOf(operational[0]!)
      && h.receipts.indexOf(operational[0]!) < h.receipts.indexOf(row), 'disposal-order')
    require(rivalFacilityDependencyRefusal(state, business, row.facilityId, plan) === null, 'protected-disposal')
  }
  // Two-way proof precedes money so removing a tombstone names the missing body,
  // rather than disguising that authority loss as a refund-total discrepancy.
  for (const receipt of h.receipts) {
    if (receipt.kind !== 'laboratoryOperational') continue
    const owner = h.businesses.find(b => b.studioId === receipt.studioId)
    if (!owner) fail('wrong-owner')
    const standing = owner.operations.facilities.some(f => f.id === receipt.facilityId)
    const disposed = bodies.has(`${receipt.studioId}\u0000${receipt.facilityId}`)
    require(standing || disposed, 'operational-body-missing')
    require(!(standing && disposed), 'standing-and-disposed')
  }
  for (const business of h.businesses) {
    const periods = business.account.periods
    const expected = periods.map(() => 0)
    for (const row of rows) {
      if (row.studioId !== business.studioId) continue
      // Existing money authority selects the last period whose window holds W.
      let index = -1
      for (const [i, period] of periods.entries()) {
        if (period.fromWeek <= row.week && row.week <= period.throughWeek) index = i
      }
      require(index >= 0, 'refund-period-missing')
      expected[index]! += row.refund
    }
    for (const [i, period] of periods.entries()) {
      const actual = period.movements.facilityDemolitionRefund
      require(Number.isFinite(actual) && actual >= 0, 'negative-refund-movement')
      require(actual === expected[i], 'refund-movement-mismatch')
    }
  }
}


/** Raw boundary for the retained-disposal proof. This admits only the shapes that
 * proof touches; the complete save chain still proves every root and exact key.
 * It runs on ORIGINAL live authority, before historical projections strip setup.
 */
export function validateRivalFacilityDisposalAuthority(value: unknown): void {
  const record = (v: unknown): Record<string, unknown> => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new Error('rival facility disposal shape: object required')
    return v as Record<string, unknown>
  }
  const rows = (v: unknown): Record<string, unknown>[] => {
    if (!Array.isArray(v)) throw new Error('rival facility disposal shape: array required')
    return v.map(record)
  }
  const array = (v: unknown): void => {
    if (!Array.isArray(v)) throw new Error('rival facility disposal shape: array required')
  }
  const state = record(value)
  if (state.hollywood === null) return
  const h = record(state.hollywood)
  record(state.market)
  rows(h.receipts)
  for (const b of rows(h.businesses)) {
    const operations = record(b.operations)
    rows(operations.facilities)
    for (const workflow of rows(operations.workflows)) {
      rows(workflow.reservations)
      record(workflow.bindings)
      if (workflow.shootingTask !== undefined && workflow.shootingTask !== null) record(workflow.shootingTask)
      if (workflow.setup !== undefined && workflow.setup !== null) {
        const setup = record(workflow.setup)
        rows(setup.priorWork)
      }
    }
    for (const script of rows(record(b.development).projects)) {
      if (script.reservation !== undefined && script.reservation !== null) record(script.reservation)
    }
    for (const period of rows(record(b.account).periods)) record(period.movements)
  }
  for (const plan of rows(record(state.physicalPlans).plans)) {
    const work = record(plan.work)
    if (work.kind === 'placement') record(work.origin)
    if (work.kind === 'installation') record(work.target)
    array(plan.dependsOn)
    record(plan.approvedQuote)
    if (plan.commitReceipt !== null) record(plan.commitReceipt)
  }
  const technology = record(state.technology)
  rows(technology.adoptions)
  for (const project of rows(technology.projects)) {
    rows(project.seats)
    for (const week of rows(project.weeks)) {
      if (week.labs !== undefined && week.labs !== null) rows(week.labs)
    }
  }
  // The proof never mutates input. Exact roots, dates, IDs, kind enums, scalar
  // types and ordinary accounting are independently mandatory in the chain.
  validateRivalFacilityDisposal(value as GameState)
}
