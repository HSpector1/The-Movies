// ── Studio Calendar & Capacity Board V1 ────────────────────────────────────
// One deterministic, read-only projection over authoritative studio state.
// This module creates no schedule, reservation, command, or second clock.

import { renewalWindowOpen, weeklySalary } from './employment.js'
import {
  assertStudioOperationsInvariants,
  productionPhaseForRemainingTicks,
} from './operations.js'
import { nextStudioDecision } from './scriptReadModel.js'
import type { StudioDecisionView } from './scriptReadModel.js'
import { studioConstructionView } from './placement.js'
import type { StudioConstructionView } from './placement.js'
import { TUNING } from './tuning.js'
import type {
  FacilityCapability,
  GameState,
  ProductionPhase,
} from './types.js'

export type StudioCalendarDecisionView =
  | { kind: 'scriptReview'; projectId: string; title: string }
  | { kind: 'castingReview'; sessionId: string; projectId: string; title: string }
  | { kind: 'productionOperation'; productionId: string }

export type StudioCalendarOccupantView = {
  owner: 'production' | 'script' | 'casting'
  ownerId: string
  title: string
  activity: ProductionPhase | 'drafting' | 'rewriting' | 'auditioning'
}

export type StudioCalendarSlotView = {
  facilityId: string
  facilityName: string
  capability: FacilityCapability
  slot: number
  occupant: StudioCalendarOccupantView | null
}

export type StudioCalendarFacilityView = {
  facilityId: string
  facilityName: string
  capability: FacilityCapability
  capacity: number
  occupied: number
  available: number
  slots: StudioCalendarSlotView[]
}

type CommitmentBase = {
  certainty: 'committed'
  week: number
  ownerId: string
  occurrenceIndex: number
}

export type StudioCalendarCommitmentView =
  | (CommitmentBase & {
      kind: 'scriptDue'
      projectId: string
      title: string
      activity: 'drafting' | 'rewriting'
    })
  | (CommitmentBase & {
      kind: 'castingDue'
      sessionId: string
      projectId: string
      title: string
    })
  | (CommitmentBase & {
      kind: 'constructionCompletion'
      projectId: string
      facilityId: string
      title: string
    })
  | (CommitmentBase & {
      kind: 'theatricalReceipt'
      productionId: string
      title: string
      studioRevenue: number
      paymentOrdinal: number
      totalPayments: number
    })
  | (CommitmentBase & {
      kind: 'contractRenewal'
      talentId: string
      talentName: string
      weeklySalary: number
      alreadyOpen: boolean
    })
  | (CommitmentBase & {
      kind: 'contractExpiry'
      talentId: string
      talentName: string
      weeklySalary: number
    })

export type StudioCalendarProductionFacilityView = {
  facilityId: string
  facilityName: string
  capability: FacilityCapability
  slot: number
}

export type StudioCalendarProductionBlockerView = {
  kind: 'facility-capacity' | 'director-dispatch' | 'scenery-load-in' | 'take-scheduling'
  headline: string
  detail: string
  consequence: string
}

export type StudioCalendarProductionView = {
  certainty: 'conditional'
  productionId: string
  title: string
  phase: ProductionPhase | 'legacy'
  phaseLabel: string
  remainingTicks: number
  conditionalReleaseWeek: number
  facilities: StudioCalendarProductionFacilityView[]
  status: 'on-schedule' | 'decision-required' | 'held' | 'legacy-countdown'
  statusLabel: string
  blocker: StudioCalendarProductionBlockerView | null
  releaseAssumption: string
}

export type StudioCalendarContractView = {
  talentId: string
  talentName: string
  weeklySalary: number
  remainingWeeks: number
  renewalOpen: boolean
  renewalWindowWeek: number
  endWeekExclusive: number
}

export type StudioCalendarExpiryClusterView = {
  week: number
  contractCount: number
  rosterCount: number
  rosterShare: number
  weeklyPayroll: number
  talentIds: string[]
}

export type StudioCalendarSummaryView = {
  facilityCapacity: number
  occupiedSlots: number
  availableSlots: number
  committedEvents: number
  activeProductions: number
  activeContracts: number
  nextCommittedWeek: number | null
}

export type StudioCalendarView = {
  mode: 'legacy' | 'managed'
  currentWeek: number
  nextDecision: StudioCalendarDecisionView | null
  facilities: StudioCalendarFacilityView[]
  commitments: StudioCalendarCommitmentView[]
  productionOutlook: StudioCalendarProductionView[]
  staffingHorizon: {
    contracts: StudioCalendarContractView[]
    busiestExpiry: StudioCalendarExpiryClusterView | null
  }
  studioDevelopment: StudioConstructionView
  summary: StudioCalendarSummaryView
}

const PHASE_LABEL: Record<ProductionPhase, string> = {
  development: 'Development',
  preProduction: 'Pre-production',
  rehearsal: 'Rehearsal',
  shooting: 'Shooting',
  postProduction: 'Post-production',
  releaseReady: 'Release Ready',
}

const CAPABILITY_LABEL: Record<FacilityCapability, string> = {
  'development-casting': 'Development & Casting',
  soundstage: 'Soundstage',
  'set-scenery': 'Scenery Shop',
  post: 'Post Building',
}

const COMMITMENT_KIND_ORDER: Record<StudioCalendarCommitmentView['kind'], number> = {
  scriptDue: 0,
  castingDue: 1,
  constructionCompletion: 2,
  theatricalReceipt: 3,
  contractRenewal: 4,
  contractExpiry: 5,
}

const CONDITIONAL_RELEASE_ASSUMPTION =
  'Conditional on every required command being resolved before advance and every current and future facility allocation succeeding; a hold moves release later.'

const PRODUCTION_HOLD_CONSEQUENCE =
  'The production countdown will hold while payroll and studio overhead continue each week.'

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function requireConceptTitle(state: GameState, conceptId: string, owner: string): string {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  if (concept === undefined) {
    throw new Error(`studioCalendar: ${owner} references unknown concept "${conceptId}"`)
  }
  return concept.title
}

function requireTalentName(state: GameState, talentId: string, owner: string): string {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(`studioCalendar: ${owner} references unknown talent "${talentId}"`)
  }
  return talent.name
}

function facilitySlotKey(facilityId: string, slot: number): string {
  return `${facilityId}:${String(slot)}`
}

function decisionView(decision: StudioDecisionView | null): StudioCalendarDecisionView | null {
  if (decision === null) return null
  switch (decision.kind) {
    case 'scriptReview':
      return {
        kind: decision.kind,
        projectId: decision.projectId,
        title: decision.title,
      }
    case 'castingReview':
      return {
        kind: decision.kind,
        sessionId: decision.sessionId,
        projectId: decision.projectId,
        title: decision.title,
      }
    case 'productionOperation':
      return { kind: decision.kind, productionId: decision.productionId }
  }
}

function facilityViews(state: GameState): StudioCalendarFacilityView[] {
  if (state.operations.mode === 'legacy') return []
  const facilities = [...state.operations.facilities].sort((a, b) => compareId(a.id, b.id))
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]))
  const occupied = new Map<string, StudioCalendarOccupantView>()

  const claim = (
    facilityId: string,
    slot: number,
    capability: FacilityCapability,
    occupant: StudioCalendarOccupantView,
  ): void => {
    const facility = facilityById.get(facilityId)
    if (facility === undefined) {
      throw new Error(`studioCalendar: ${occupant.owner} "${occupant.ownerId}" reserves unknown facility "${facilityId}"`)
    }
    if (facility.capability !== capability) {
      throw new Error(`studioCalendar: ${occupant.owner} "${occupant.ownerId}" reservation capability disagrees with facility "${facilityId}"`)
    }
    if (!Number.isInteger(slot) || slot < 0 || slot >= facility.capacity) {
      throw new Error(`studioCalendar: ${occupant.owner} "${occupant.ownerId}" reservation is outside facility "${facilityId}"`)
    }
    const key = facilitySlotKey(facilityId, slot)
    if (occupied.has(key)) {
      throw new Error(`studioCalendar: facility slot "${key}" is occupied twice`)
    }
    occupied.set(key, occupant)
  }

  for (const workflow of state.operations.workflows) {
    const production = state.studio.activeProductions.find(
      (candidate) => candidate.id === workflow.productionId,
    )
    if (production === undefined) {
      throw new Error(`studioCalendar: workflow references unknown production "${workflow.productionId}"`)
    }
    const expectedPhase = productionPhaseForRemainingTicks(production.remainingTicks)
    if (workflow.phase !== expectedPhase) {
      throw new Error(`studioCalendar: workflow "${workflow.productionId}" phase disagrees with production countdown`)
    }
    const title = requireConceptTitle(state, production.conceptId, `production "${production.id}"`)
    for (const reservation of workflow.reservations) {
      if (reservation.productionId !== production.id || reservation.phase !== workflow.phase) {
        throw new Error(`studioCalendar: production reservation ownership disagrees with workflow "${workflow.productionId}"`)
      }
      claim(reservation.facilityId, reservation.slot, reservation.capability, {
        owner: 'production',
        ownerId: production.id,
        title,
        activity: workflow.phase,
      })
    }
  }

  for (const project of state.scriptDevelopment.projects) {
    if (project.status === 'drafting' || project.status === 'rewriting') {
      if (project.reservation === null) {
        throw new Error(`studioCalendar: active screenplay "${project.id}" has no reservation`)
      }
    } else {
      if (project.reservation !== null) {
        throw new Error(`studioCalendar: inactive screenplay "${project.id}" retains a reservation`)
      }
      continue
    }
    if (project.reservation.projectId !== project.id) {
      throw new Error(`studioCalendar: screenplay reservation owner disagrees with project "${project.id}"`)
    }
    if (project.reservation.capability !== 'development-casting') {
      throw new Error(`studioCalendar: screenplay "${project.id}" reservation is not development-casting`)
    }
    claim(project.reservation.facilityId, project.reservation.slot, project.reservation.capability, {
      owner: 'script',
      ownerId: project.id,
      title: requireConceptTitle(state, project.conceptId, `screenplay "${project.id}"`),
      activity: project.status,
    })
  }

  for (const session of state.castingSessions.sessions) {
    const active = session.status === 'auditioning'
    if (active && session.reservation === null) {
      throw new Error(`studioCalendar: auditioning session "${session.id}" has no reservation`)
    }
    if (!active && session.reservation !== null) {
      throw new Error(`studioCalendar: inactive casting session "${session.id}" retains a reservation`)
    }
    if (session.reservation === null) continue
    if (session.reservation.sessionId !== session.id) {
      throw new Error(`studioCalendar: casting reservation owner disagrees with session "${session.id}"`)
    }
    if (session.reservation.capability !== 'development-casting') {
      throw new Error(`studioCalendar: casting session "${session.id}" reservation is not development-casting`)
    }
    const project = state.scriptDevelopment.projects.find(
      (candidate) => candidate.id === session.projectId,
    )
    if (project === undefined) {
      throw new Error(`studioCalendar: casting session "${session.id}" references unknown screenplay "${session.projectId}"`)
    }
    claim(session.reservation.facilityId, session.reservation.slot, session.reservation.capability, {
      owner: 'casting',
      ownerId: session.id,
      title: requireConceptTitle(state, project.conceptId, `casting session "${session.id}"`),
      activity: 'auditioning',
    })
  }

  return facilities.map((facility): StudioCalendarFacilityView => {
    const slots: StudioCalendarSlotView[] = []
    for (let slot = 0; slot < facility.capacity; slot++) {
      slots.push({
        facilityId: facility.id,
        facilityName: facility.name,
        capability: facility.capability,
        slot,
        occupant: occupied.get(facilitySlotKey(facility.id, slot)) ?? null,
      })
    }
    const occupiedCount = slots.filter((slot) => slot.occupant !== null).length
    return {
      facilityId: facility.id,
      facilityName: facility.name,
      capability: facility.capability,
      capacity: facility.capacity,
      occupied: occupiedCount,
      available: facility.capacity - occupiedCount,
      slots,
    }
  })
}

function commitmentViews(state: GameState): StudioCalendarCommitmentView[] {
  const currentWeek = state.market.tick
  const events: StudioCalendarCommitmentView[] = []

  for (const project of state.scriptDevelopment.projects) {
    if (
      (project.status !== 'drafting' && project.status !== 'rewriting') ||
      project.dueWeek === null
    ) {
      continue
    }
    events.push({
      kind: 'scriptDue',
      certainty: 'committed',
      week: project.dueWeek,
      ownerId: project.id,
      occurrenceIndex: 0,
      projectId: project.id,
      title: requireConceptTitle(state, project.conceptId, `screenplay "${project.id}"`),
      activity: project.status,
    })
  }

  for (const session of state.castingSessions.sessions) {
    if (session.status !== 'auditioning' || session.dueWeek === null) continue
    const project = state.scriptDevelopment.projects.find(
      (candidate) => candidate.id === session.projectId,
    )
    if (project === undefined) {
      throw new Error(`studioCalendar: casting session "${session.id}" references unknown screenplay "${session.projectId}"`)
    }
    events.push({
      kind: 'castingDue',
      certainty: 'committed',
      week: session.dueWeek,
      ownerId: session.id,
      occurrenceIndex: 0,
      sessionId: session.id,
      projectId: project.id,
      title: requireConceptTitle(state, project.conceptId, `casting session "${session.id}"`),
    })
  }

  // Calendar remains the research observatory's public projection surface. The
  // configured policy preserves that behavior-neutral harness path; live saves
  // are still constrained to exact Annex V1 by their validator.
  const construction = studioConstructionView(state, { facilityPolicy: 'configured' })
  if (construction.status === 'building') {
    events.push({
      kind: 'constructionCompletion',
      certainty: 'committed',
      week: construction.dueWeek!,
      ownerId: construction.projectId!,
      occurrenceIndex: 0,
      projectId: construction.projectId!,
      facilityId: construction.facilityId!,
      title: construction.name,
    })
  }

  for (const run of state.theatricalRuns) {
    if (run.status !== 'active') continue
    const title = requireConceptTitle(state, run.conceptId, `theatrical run "${run.productionId}"`)
    for (let index = run.weekIndex; index < run.totalWeeks; index++) {
      events.push({
        kind: 'theatricalReceipt',
        certainty: 'committed',
        week: currentWeek + (index - run.weekIndex) + 1,
        ownerId: run.productionId,
        occurrenceIndex: index,
        productionId: run.productionId,
        title,
        studioRevenue: (run.weeklyGross[index] ?? 0) * run.studioShare,
        paymentOrdinal: index + 1,
        totalPayments: run.totalWeeks,
      })
    }
  }

  for (const contract of state.contracts) {
    if (!(contract.startWeek <= currentWeek && currentWeek < contract.endWeekExclusive)) continue
    const salary = weeklySalary(contract.annualSalary)
    const talentName = requireTalentName(state, contract.talentId, 'contract')
    const renewalWeek = Math.max(
      contract.startWeek,
      contract.endWeekExclusive - TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
    )
    events.push({
      kind: 'contractRenewal',
      certainty: 'committed',
      week: renewalWeek,
      ownerId: contract.talentId,
      occurrenceIndex: 0,
      talentId: contract.talentId,
      talentName,
      weeklySalary: salary,
      alreadyOpen: renewalWindowOpen(contract, currentWeek),
    })
    events.push({
      kind: 'contractExpiry',
      certainty: 'committed',
      week: contract.endWeekExclusive,
      ownerId: contract.talentId,
      occurrenceIndex: 0,
      talentId: contract.talentId,
      talentName,
      weeklySalary: salary,
    })
  }

  return events.sort((a, b) =>
    a.week - b.week ||
    COMMITMENT_KIND_ORDER[a.kind] - COMMITMENT_KIND_ORDER[b.kind] ||
    compareId(a.ownerId, b.ownerId) ||
    a.occurrenceIndex - b.occurrenceIndex,
  )
}

function productionBlocker(
  state: GameState,
  productionId: string,
): {
  status: StudioCalendarProductionView['status']
  statusLabel: string
  blocker: StudioCalendarProductionBlockerView | null
} {
  const workflow = state.operations.workflows.find(
    (candidate) => candidate.productionId === productionId,
  )
  if (workflow === undefined) {
    throw new Error(`studioCalendar: managed production "${productionId}" has no workflow`)
  }
  if (workflow.blocker?.kind === 'facility-capacity') {
    const capability = CAPABILITY_LABEL[workflow.blocker.capability]
    const target = PHASE_LABEL[workflow.blocker.targetPhase]
    return {
      status: 'held',
      statusLabel: 'Held for facility capacity',
      blocker: {
        kind: 'facility-capacity',
        headline: `${target} held for ${capability}`,
        detail: `No ${capability.toLowerCase()} slot was available when the transition to ${target} was attempted. It will retry next week.`,
        consequence: PRODUCTION_HOLD_CONSEQUENCE,
      },
    }
  }
  const task = workflow.shootingTask
  if (task?.status === 'unassigned') {
    const director = requireTalentName(state, task.directorId, `shooting task "${task.id}"`)
    return {
      status: 'decision-required',
      statusLabel: 'Director call required',
      blocker: {
        kind: 'director-dispatch',
        headline: 'Director call required',
        detail: `${director} is locked to the picture but has not been dispatched to the reserved soundstage.`,
        consequence: PRODUCTION_HOLD_CONSEQUENCE,
      },
    }
  }
  if (task?.status === 'blocked' && workflow.blocker?.kind === 'scenery-load-in') {
    return {
      status: 'decision-required',
      statusLabel: 'Scenery load-in blocking camera',
      blocker: {
        kind: 'scenery-load-in',
        headline: 'Scenery load-in blocking camera',
        detail: 'The reserved camera mark is blocked by scenery load-in.',
        consequence: PRODUCTION_HOLD_CONSEQUENCE,
      },
    }
  }
  if (task?.status === 'ready') {
    return {
      status: 'decision-required',
      statusLabel: 'Take ready to schedule',
      blocker: {
        kind: 'take-scheduling',
        headline: 'Take ready to schedule',
        detail: 'The reserved soundstage is ready, but the shooting take has not been put on the weekly schedule.',
        consequence: PRODUCTION_HOLD_CONSEQUENCE,
      },
    }
  }
  return {
    status: 'on-schedule',
    statusLabel:
      task?.status === 'scheduled'
        ? 'Take scheduled'
        : task?.status === 'completed'
          ? 'Shooting beat completed'
          : 'On schedule',
    blocker: null,
  }
}

function productionViews(state: GameState): StudioCalendarProductionView[] {
  const currentWeek = state.market.tick
  return [...state.studio.activeProductions]
    .sort((a, b) => compareId(a.id, b.id))
    .map((production): StudioCalendarProductionView => {
      const title = requireConceptTitle(state, production.conceptId, `production "${production.id}"`)
      const conditionalReleaseWeek =
        currentWeek + production.remainingTicks + (production.startTick >= currentWeek ? 1 : 0)
      if (state.operations.mode === 'legacy') {
        return {
          certainty: 'conditional',
          productionId: production.id,
          title,
          phase: 'legacy',
          phaseLabel: 'Legacy production schedule',
          remainingTicks: production.remainingTicks,
          conditionalReleaseWeek,
          facilities: [],
          status: 'legacy-countdown',
          statusLabel: 'Legacy countdown',
          blocker: null,
          releaseAssumption:
            'Conditional on the original production countdown advancing without a hold.',
        }
      }
      const workflow = state.operations.workflows.find(
        (candidate) => candidate.productionId === production.id,
      )
      if (workflow === undefined) {
        throw new Error(`studioCalendar: managed production "${production.id}" has no workflow`)
      }
      const expectedPhase = productionPhaseForRemainingTicks(production.remainingTicks)
      if (workflow.phase !== expectedPhase) {
        throw new Error(`studioCalendar: workflow "${workflow.productionId}" phase disagrees with production countdown`)
      }
      const facilities = workflow.reservations
        .map((reservation): StudioCalendarProductionFacilityView => {
          const facility = state.operations.facilities.find(
            (candidate) => candidate.id === reservation.facilityId,
          )
          if (facility === undefined) {
            throw new Error(`studioCalendar: production "${production.id}" reserves unknown facility "${reservation.facilityId}"`)
          }
          return {
            facilityId: facility.id,
            facilityName: facility.name,
            capability: facility.capability,
            slot: reservation.slot,
          }
        })
        .sort((a, b) => compareId(a.facilityId, b.facilityId) || a.slot - b.slot)
      const status = productionBlocker(state, production.id)
      return {
        certainty: 'conditional',
        productionId: production.id,
        title,
        phase: workflow.phase,
        phaseLabel: PHASE_LABEL[workflow.phase],
        remainingTicks: production.remainingTicks,
        conditionalReleaseWeek,
        facilities,
        ...status,
        releaseAssumption: CONDITIONAL_RELEASE_ASSUMPTION,
      }
    })
}

function staffingViews(state: GameState): StudioCalendarView['staffingHorizon'] {
  const currentWeek = state.market.tick
  const active = state.contracts.filter(
    (contract) => contract.startWeek <= currentWeek && currentWeek < contract.endWeekExclusive,
  )
  const contracts = active
    .map((contract): StudioCalendarContractView => ({
      talentId: contract.talentId,
      talentName: requireTalentName(state, contract.talentId, 'contract'),
      weeklySalary: weeklySalary(contract.annualSalary),
      remainingWeeks: contract.endWeekExclusive - currentWeek,
      renewalOpen: renewalWindowOpen(contract, currentWeek),
      renewalWindowWeek: Math.max(
        contract.startWeek,
        contract.endWeekExclusive - TUNING.HIRING_RENEWAL_WINDOW_WEEKS,
      ),
      endWeekExclusive: contract.endWeekExclusive,
    }))
    .sort((a, b) => compareId(a.talentId, b.talentId))

  const byWeek = new Map<number, StudioCalendarContractView[]>()
  for (const contract of contracts) {
    const group = byWeek.get(contract.endWeekExclusive) ?? []
    group.push(contract)
    byWeek.set(contract.endWeekExclusive, group)
  }
  const busiest = [...byWeek.entries()].sort(
    ([weekA, a], [weekB, b]) => b.length - a.length || weekA - weekB,
  )[0]
  const busiestExpiry =
    busiest === undefined
      ? null
      : {
          week: busiest[0],
          contractCount: busiest[1].length,
          rosterCount: contracts.length,
          rosterShare: busiest[1].length / contracts.length,
          weeklyPayroll: busiest[1].reduce((sum, contract) => sum + contract.weeklySalary, 0),
          talentIds: busiest[1].map((contract) => contract.talentId).sort(compareId),
        }
  return { contracts, busiestExpiry }
}

/**
 * The one engine-owned studio-wide planning projection. Calling this function is
 * behavior-neutral: it mutates no input, consumes no RNG, and applies no action.
 */
export function studioCalendar(state: GameState): StudioCalendarView {
  // Reuse the owning Production Operations invariant instead of recreating its
  // phase/reservation/task law in a presentation read model. Configured capacity
  // permits governed test/research facility sets while retaining every identity,
  // allocation, and command-owner correlation.
  assertStudioOperationsInvariants(state.operations, state.studio.activeProductions, {
    facilityPolicy: 'configured',
  })
  const facilities = facilityViews(state)
  const commitments = commitmentViews(state)
  const productionOutlook = productionViews(state)
  const staffingHorizon = staffingViews(state)
  const studioDevelopment = studioConstructionView(state, { facilityPolicy: 'configured' })
  const currentWeek = state.market.tick
  const facilityCapacity = facilities.reduce((sum, facility) => sum + facility.capacity, 0)
  const occupiedSlots = facilities.reduce((sum, facility) => sum + facility.occupied, 0)
  const nextCommittedWeek = commitments.find((event) => event.week > currentWeek)?.week ?? null
  return {
    mode: state.operations.mode,
    currentWeek,
    nextDecision: decisionView(nextStudioDecision(state)),
    facilities,
    commitments,
    productionOutlook,
    staffingHorizon,
    studioDevelopment,
    summary: {
      facilityCapacity,
      occupiedSlots,
      availableSlots: facilityCapacity - occupiedSlots,
      committedEvents: commitments.length,
      activeProductions: productionOutlook.length,
      activeContracts: staffingHorizon.contracts.length,
      nextCommittedWeek,
    },
  }
}
