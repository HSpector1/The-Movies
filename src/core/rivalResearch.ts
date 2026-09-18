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
import { blueprintById, physicalQuoteFingerprint } from './placement.js'
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
function admitFor(state: GameState, h: HollywoodState, business: RivalBusiness, plans: StudioPhysicalPlans, week: number): StudioPhysicalPlans {
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
    moveRivalMoney(business.account, 'researchCapacity', -quote.cost, week)
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
export function admitRivalPlans(state: GameState): { state: GameState; history: readonly StudioHistoryDraft[] } {
  const source = state.hollywood
  if (!source || source.businesses.length === 0) return { state, history: [] }
  const h: HollywoodState = { ...source, receipts: [...source.receipts], businesses: source.businesses.map(workingBusiness) }
  const week = state.market.tick
  let plans = state.physicalPlans
  for (const business of h.businesses) plans = admitFor({ ...state, hollywood: h }, h, business, plans, week)
  if (plans === state.physicalPlans && h.receipts.length === source.receipts.length) return { state, history: [] }
  return { state: { ...state, hollywood: h, physicalPlans: plans }, history: [] }
}

/** The admission step the weekly industry tick runs against its own clones. */
export function admitRivalPlansInWeek(state: GameState, h: HollywoodState, business: RivalBusiness,
  plans: StudioPhysicalPlans, week: number): StudioPhysicalPlans {
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
  for (const row of interests(state, business, week)) {
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
