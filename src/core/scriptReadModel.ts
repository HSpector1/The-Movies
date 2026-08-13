// ── Script Projects V1 player read boundary ─────────────────────────────────
// Pure projection over GameState. This module deliberately returns fresh, narrow
// values: no Talent, FilmConcept, ScriptProject, GameState, RNG, actual skill,
// actual screenplay strength, or ceiling object crosses the boundary.

import { activeContract, busyTalentIds, freelancerMarketIds } from './employment.js'
import {
  activeScriptWriterAssignments,
  availableDevelopmentCastingSlots,
  developmentCastingOccupancy,
  facilitySlotKey,
} from './scriptDevelopment.js'
import { roleOVR } from './talentSummary.js'
import { TUNING } from './tuning.js'
import type {
  Action,
  CreativeRole,
  DevelopmentCastingOccupancy,
  FilmShape,
  GameState,
  Genre,
  Promise as FilmPromise,
  ScriptAssessment,
  ScriptProject,
  ScriptProjectStatus,
} from './types.js'

export type ScriptProjectSection =
  | 'needsReview'
  | 'inDevelopment'
  | 'readyToPackage'
  | 'productionHistory'

export type ScriptPlayerBlockerKind =
  | 'script-mode'
  | 'operations-mode'
  | 'studio-founding'
  | 'facility-capacity'
  | 'writer-contract'
  | 'writer-assignment'
  | 'production-capacity'
  | 'package-staffing'
  | 'no-concepts'
  | 'no-writers'

export type ScriptPlayerBlocker = {
  kind: ScriptPlayerBlockerKind
  headline: string
  detail: string
  remedy: string
}

export type ScriptProjectActionView =
  | { kind: 'acceptScript'; projectId: string; label: string }
  | { kind: 'requestScriptRewrite'; projectId: string; label: string }
  | { kind: 'openPackage'; projectId: string; label: string }

export type EstimatedScriptAssessmentView = {
  /** Required player-facing uncertainty marker. */
  label: 'Est.'
  /** Persisted perceived strength only. Never the actual-strength value. */
  score: number
  band: 'Fragile' | 'Workable' | 'Promising' | 'Strong'
  strengths: string[]
  concerns: string[]
}

export type ScriptWriterView = {
  id: string
  name: string
  primaryRole: CreativeRole
}

export type ScriptProjectCardView = {
  projectId: string
  section: ScriptProjectSection
  title: string
  genre: Genre
  writer: ScriptWriterView
  status: ScriptProjectStatus
  lifecycleLabel: string
  rewriteCount: 0 | 1
  dueWeek: number | null
  weeksUntilDecision: number | null
  productionId: string | null
  consequence: string
  assessment: EstimatedScriptAssessmentView | null
  legalActions: ScriptProjectActionView[]
  blockers: ScriptPlayerBlocker[]
}

export type ScriptCapacityOccupantView = {
  owner: 'production' | 'script'
  ownerId: string
  activity: DevelopmentCastingOccupancy['activity']
  title: string
  label: string
}

export type ScriptCapacitySlotView = {
  slot: number
  occupant: ScriptCapacityOccupantView | null
}

export type ScriptCapacityFacilityView = {
  facilityId: string
  facilityName: string
  capacity: number
  occupied: number
  available: number
  slots: ScriptCapacitySlotView[]
}

export type ScriptCapacityView = {
  capacity: number
  occupied: number
  available: number
  facilities: ScriptCapacityFacilityView[]
}

export type CommissionConceptView = {
  id: string
  title: string
  genre: Genre
}

export type CommissionWriterView = ScriptWriterView & {
  writingEstimate: { label: 'Est.'; score: number }
  available: boolean
  assignmentLabel: string | null
}

export type ScriptCommissionAvailabilityView = {
  canStart: boolean
  consequence: string
  concepts: CommissionConceptView[]
  writers: CommissionWriterView[]
  blockers: ScriptPlayerBlocker[]
}

export type ScriptPackageAvailabilityView = {
  knownGatesClear: boolean
  writerAvailable: boolean
  staffingAvailable: boolean
  productionSlotAvailable: boolean
  developmentCastingSlotAvailable: boolean
  blockers: ScriptPlayerBlocker[]
}

export type ReadyScriptPackageView = {
  projectId: string
  concept: CommissionConceptView
  writer: ScriptWriterView
  /** Fresh clones of the screenplay-owned package facts. */
  lockedShape: FilmShape
  lockedPromise: FilmPromise
  assessment: EstimatedScriptAssessmentView
  availability: ScriptPackageAvailabilityView
  openAction: Extract<ScriptProjectActionView, { kind: 'openPackage' }> | null
}

export type ScriptReviewDecisionView = {
  kind: 'scriptReview'
  projectId: string
  title: string
  legalActions: Array<
    Extract<ScriptProjectActionView, { kind: 'acceptScript' | 'requestScriptRewrite' }>
  >
}

export type ProductionOperationsCommand =
  | Extract<Action, { kind: 'assignShootingDirector' }>
  | Extract<Action, { kind: 'clearSceneryLoadIn' }>
  | Extract<Action, { kind: 'scheduleShootingTake' }>

export type ProductionOperationsDecisionView = {
  kind: 'productionOperation'
  productionId: string
  command: ProductionOperationsCommand
}

export type StudioDecisionView =
  | ScriptReviewDecisionView
  | ProductionOperationsDecisionView

export type ScriptLotAttentionView = {
  kind: 'review-required' | 'capacity-constraint' | 'active-work' | 'ready-script' | 'idle'
  headline: string
  detail: string
}

export type ScriptProjectsReadModel = {
  mode: 'legacy' | 'managed'
  capacity: ScriptCapacityView
  sections: {
    needsReview: ScriptProjectCardView[]
    inDevelopment: ScriptProjectCardView[]
    readyToPackage: ScriptProjectCardView[]
    productionHistory: ScriptProjectCardView[]
  }
  commission: ScriptCommissionAvailabilityView
  packages: ReadyScriptPackageView[]
  nextDecision: ScriptReviewDecisionView | null
  lotAttention: ScriptLotAttentionView
}

export const SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE =
  'One week passes while the writer and one Development & Casting slot are occupied; payroll and studio overhead continue.'

const STATUS_LABEL: Record<ScriptProjectStatus, string> = {
  drafting: 'Drafting',
  review: 'Needs review',
  rewriting: 'Rewriting',
  ready: 'Ready to package',
  inProduction: 'In production',
  produced: 'Produced',
}

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function cloneShape(shape: FilmShape): FilmShape {
  return { opening: shape.opening, midpoint: shape.midpoint, ending: shape.ending }
}

function clonePromise(promise: FilmPromise): FilmPromise {
  return {
    genre: promise.genre,
    intendedSegments: [...promise.intendedSegments],
    ranges: {
      intimacy: [promise.ranges.intimacy[0], promise.ranges.intimacy[1]],
      tonalWeight: [promise.ranges.tonalWeight[0], promise.ranges.tonalWeight[1]],
      kineticEnergy: [promise.ranges.kineticEnergy[0], promise.ranges.kineticEnergy[1]],
    },
  }
}

function requireConcept(state: GameState, conceptId: string) {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  if (concept === undefined) {
    throw new Error(`scriptReadModel: unknown concept "${conceptId}"`)
  }
  return concept
}

function requireWriter(state: GameState, writerId: string) {
  const writer = state.talent.find((candidate) => candidate.id === writerId)
  if (writer === undefined) {
    throw new Error(`scriptReadModel: unknown writer "${writerId}"`)
  }
  return writer
}

function writerView(state: GameState, writerId: string): ScriptWriterView {
  const writer = requireWriter(state, writerId)
  return { id: writer.id, name: writer.name, primaryRole: writer.role }
}

/** Derive strengths and concerns exclusively from persisted perceived strength. */
export function estimatedScriptAssessment(
  assessment: ScriptAssessment,
): EstimatedScriptAssessmentView {
  const score = assessment.perceivedStrength
  if (score >= 75) {
    return {
      label: 'Est.',
      score,
      band: 'Strong',
      strengths: ['The screenplay estimate suggests a strong creative foundation.'],
      concerns: [],
    }
  }
  if (score >= 60) {
    return {
      label: 'Est.',
      score,
      band: 'Promising',
      strengths: ['The screenplay estimate suggests a promising foundation.'],
      concerns: ['Some creative uncertainty remains before production.'],
    }
  }
  if (score >= 45) {
    return {
      label: 'Est.',
      score,
      band: 'Workable',
      strengths: ['The draft has a workable foundation to package around.'],
      concerns: ['The estimate leaves meaningful room for improvement.'],
    }
  }
  return {
    label: 'Est.',
    score,
    band: 'Fragile',
    strengths: [],
    concerns: ['The screenplay estimate is fragile; packaging it carries creative risk.'],
  }
}

function activeProductionAssignment(state: GameState, talentId: string): string | null {
  const productions = [...state.studio.activeProductions].sort((a, b) => compareId(a.id, b.id))
  const production = productions.find((candidate) =>
    candidate.writerId === talentId ||
    candidate.directorId === talentId ||
    candidate.cast.lead === talentId ||
    candidate.cast.antagonist === talentId ||
    candidate.cast.support === talentId ||
    candidate.craftIds.includes(talentId),
  )
  if (production === undefined) return null
  return `Working on ${requireConcept(state, production.conceptId).title}`
}

function writerAssignmentLabel(state: GameState, writerId: string): string | null {
  const scriptAssignment = activeScriptWriterAssignments(
    state.scriptDevelopment,
    state.concepts,
  ).find((assignment) => assignment.talentId === writerId)
  if (scriptAssignment !== undefined) return scriptAssignment.label
  return activeProductionAssignment(state, writerId)
}

function writerAvailability(state: GameState, writerId: string): {
  contracted: boolean
  available: boolean
  assignmentLabel: string | null
} {
  const contracted = activeContract(state, writerId) !== undefined
  const busy = busyTalentIds(state).has(writerId)
  const assignmentLabel = busy ? writerAssignmentLabel(state, writerId) : null
  return { contracted, available: contracted && !busy, assignmentLabel }
}

function writerBlockers(
  state: GameState,
  project: ScriptProject,
  purpose: 'rewrite' | 'package',
): ScriptPlayerBlocker[] {
  const writer = writerView(state, project.writerId)
  const availability = writerAvailability(state, project.writerId)
  const blockers: ScriptPlayerBlocker[] = []
  if (!availability.contracted) {
    blockers.push({
      kind: 'writer-contract',
      headline: `${writer.name} is out of contract`,
      detail: `${writer.name} must be currently studio-contracted to ${purpose === 'rewrite' ? 'perform the rewrite' : 'greenlight this screenplay'}.`,
      remedy: `Sign ${writer.name} to a new studio contract.`,
    })
  } else if (!availability.available) {
    const assignment = availability.assignmentLabel ?? 'Working on another assignment'
    blockers.push({
      kind: 'writer-assignment',
      headline: `${writer.name} is already assigned`,
      detail: `${assignment}. The screenplay remains ${purpose === 'rewrite' ? 'in review' : 'Ready'} until the writer is available.`,
      remedy: 'Wait for the named assignment to finish.',
    })
  }
  return blockers
}

/** Exact, slot-by-slot shared Development & Casting usage. */
export function scriptCapacityView(state: GameState): ScriptCapacityView {
  const occupancy = developmentCastingOccupancy(state.operations, state.scriptDevelopment)
  const occupancyBySlot = new Map<string, DevelopmentCastingOccupancy>()
  for (const entry of occupancy) {
    const key = facilitySlotKey(entry.facilityId, entry.slot)
    if (occupancyBySlot.has(key)) {
      throw new Error(`scriptReadModel: shared capacity slot "${key}" is occupied twice`)
    }
    occupancyBySlot.set(key, entry)
  }

  const facilities = state.operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
    .map((facility): ScriptCapacityFacilityView => {
      const slots: ScriptCapacitySlotView[] = []
      for (let slot = 0; slot < facility.capacity; slot++) {
        const entry = occupancyBySlot.get(facilitySlotKey(facility.id, slot))
        let occupant: ScriptCapacityOccupantView | null = null
        if (entry !== undefined && entry.owner === 'script') {
          const project = state.scriptDevelopment.projects.find(
            (candidate) => candidate.id === entry.ownerId,
          )
          if (project === undefined) {
            throw new Error(`scriptReadModel: occupancy references unknown script "${entry.ownerId}"`)
          }
          const title = requireConcept(state, project.conceptId).title
          const writer = requireWriter(state, project.writerId)
          occupant = {
            owner: 'script',
            ownerId: project.id,
            activity: entry.activity,
            title,
            label: `${project.status === 'drafting' ? 'Drafting' : 'Rewriting'} ${title} — ${writer.name}`,
          }
        } else if (entry !== undefined) {
          const production = state.studio.activeProductions.find(
            (candidate) => candidate.id === entry.ownerId,
          )
          if (production === undefined) {
            throw new Error(`scriptReadModel: occupancy references unknown production "${entry.ownerId}"`)
          }
          const title = requireConcept(state, production.conceptId).title
          occupant = {
            owner: 'production',
            ownerId: production.id,
            activity: entry.activity,
            title,
            label: `Production development — ${title}`,
          }
        }
        slots.push({ slot, occupant })
      }
      const occupied = slots.filter((slot) => slot.occupant !== null).length
      return {
        facilityId: facility.id,
        facilityName: facility.name,
        capacity: facility.capacity,
        occupied,
        available: facility.capacity - occupied,
        slots,
      }
    })

  const capacity = facilities.reduce((sum, facility) => sum + facility.capacity, 0)
  const occupied = facilities.reduce((sum, facility) => sum + facility.occupied, 0)
  const available = availableDevelopmentCastingSlots(
    state.operations,
    state.scriptDevelopment,
  )
  if (available !== Math.max(0, capacity - occupied)) {
    throw new Error('scriptReadModel: shared capacity totals disagree with authoritative occupancy')
  }
  return { capacity, occupied, available, facilities }
}

function commissionAvailability(
  state: GameState,
  capacity: ScriptCapacityView,
): ScriptCommissionAvailabilityView {
  const claimedConcepts = new Set(
    state.scriptDevelopment.projects.map((project) => project.conceptId),
  )
  const concepts = state.concepts
    .filter((concept) => !claimedConcepts.has(concept.id))
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
    .map((concept): CommissionConceptView => ({
      id: concept.id,
      title: concept.title,
      genre: concept.genre,
    }))

  const writers = state.talent
    .filter(
      (writer) =>
        writer.skills.writing !== undefined && activeContract(state, writer.id) !== undefined,
    )
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
    .map((writer): CommissionWriterView => {
      const availability = writerAvailability(state, writer.id)
      return {
        id: writer.id,
        name: writer.name,
        primaryRole: writer.role,
        writingEstimate: { label: 'Est.', score: roleOVR(writer, 'writing') },
        available: availability.available,
        assignmentLabel: availability.assignmentLabel,
      }
    })

  const blockers: ScriptPlayerBlocker[] = []
  if (state.scriptDevelopment.mode !== 'managed') {
    blockers.push({
      kind: 'script-mode',
      headline: 'Managed screenplay development is not active',
      detail: 'This studio still uses the legacy direct-greenlight screenplay path.',
      remedy: 'Activate Script Development at the governed post-founding boundary.',
    })
  }
  if (state.operations.mode !== 'managed') {
    blockers.push({
      kind: 'operations-mode',
      headline: 'Managed Studio Operations are not active',
      detail: 'Screenplay work requires authoritative Development & Casting facilities.',
      remedy: 'Activate Studio Operations before commissioning a screenplay.',
    })
  }
  if (state.founding !== null) {
    blockers.push({
      kind: 'studio-founding',
      headline: 'Finish founding the studio',
      detail: 'Screenplay commissions cannot begin during the founding draft.',
      remedy: 'Complete the founding roster and found the studio.',
    })
  }
  if (
    state.scriptDevelopment.mode === 'managed' &&
    state.operations.mode === 'managed' &&
    capacity.available === 0
  ) {
    blockers.push({
      kind: 'facility-capacity',
      headline: 'Development & Casting is full',
      detail: 'Every Development & Casting slot is occupied by screenplay or production work.',
      remedy: 'Wait for a named task to release a slot.',
    })
  }
  if (concepts.length === 0) {
    blockers.push({
      kind: 'no-concepts',
      headline: 'No uncommissioned concepts remain',
      detail: 'Every available concept already owns a managed screenplay project.',
      remedy: 'Continue with an existing project.',
    })
  }
  if (!writers.some((writer) => writer.available)) {
    blockers.push({
      kind: 'no-writers',
      headline: 'No contracted writer is available',
      detail: 'Every contracted writing-capable person is currently assigned, or no one is under contract.',
      remedy: 'Wait for an assignment to finish or sign a writing-capable person.',
    })
  }

  return {
    canStart: blockers.length === 0,
    consequence: SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE,
    concepts,
    writers,
    blockers,
  }
}

function packageAvailability(
  state: GameState,
  project: ScriptProject,
  capacity: ScriptCapacityView,
): ScriptPackageAvailabilityView {
  const blockers = writerBlockers(state, project, 'package')
  const busy = busyTalentIds(state)
  const freelancerMarket = new Set(freelancerMarketIds(state))
  const remainingTeamNeeds: ReadonlyArray<{
    role: Exclude<CreativeRole, 'writer'>
    label: string
    count: number
  }> = [
    { role: 'director', label: 'Director', count: 1 },
    { role: 'actor', label: 'Actors', count: 3 },
    { role: 'craft', label: 'Production/Craft Lead', count: 1 },
  ]
  const availableByRole = new Map<CreativeRole, number>()
  for (const talent of state.talent) {
    if (talent.id === project.writerId || busy.has(talent.id)) continue
    if (activeContract(state, talent.id) === undefined && !freelancerMarket.has(talent.id)) continue
    availableByRole.set(talent.role, (availableByRole.get(talent.role) ?? 0) + 1)
  }
  const staffingShortages = remainingTeamNeeds.filter(
    ({ role, count }) => (availableByRole.get(role) ?? 0) < count,
  )
  const staffingAvailable = staffingShortages.length === 0
  if (!staffingAvailable) {
    const writer = writerView(state, project.writerId)
    blockers.push({
      kind: 'package-staffing',
      headline: 'The remaining package cannot be staffed',
      detail: `After reserving ${writer.name} for the screenplay credit, the currently available studio roster and freelancer market are short: ${staffingShortages
        .map(
          ({ role, label, count }) =>
            `${label} (${String(availableByRole.get(role) ?? 0)} of ${String(count)} available)`,
        )
        .join(', ')}.`,
      remedy:
        'Sign suitable talent, wait for current assignments to finish, or wait for the freelancer market to rotate.',
    })
  }
  if (state.founding !== null) {
    blockers.push({
      kind: 'studio-founding',
      headline: 'Finish founding the studio',
      detail: 'A production cannot be greenlit during the founding draft.',
      remedy: 'Complete the founding roster and found the studio.',
    })
  }
  const productionSlotAvailable =
    state.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS
  if (!productionSlotAvailable) {
    blockers.push({
      kind: 'production-capacity',
      headline: 'The production slate is full',
      detail: `The studio already has ${String(state.studio.activeProductions.length)} of ${String(TUNING.MAX_CONCURRENT_PRODUCTIONS)} productions active.`,
      remedy: 'Wait for a production to release or cancel one before greenlight.',
    })
  }
  const developmentCastingSlotAvailable = capacity.available > 0
  if (!developmentCastingSlotAvailable) {
    blockers.push({
      kind: 'facility-capacity',
      headline: 'Development & Casting is full',
      detail: 'Greenlight needs one Development & Casting slot for the production workflow.',
      remedy: 'Wait for a named screenplay or production task to release a slot.',
    })
  }
  const writerAvailable = !blockers.some(
    (blocker) => blocker.kind === 'writer-contract' || blocker.kind === 'writer-assignment',
  )
  return {
    knownGatesClear: blockers.length === 0,
    writerAvailable,
    staffingAvailable,
    productionSlotAvailable,
    developmentCastingSlotAvailable,
    blockers,
  }
}

function sectionFor(status: ScriptProjectStatus): ScriptProjectSection {
  switch (status) {
    case 'review':
      return 'needsReview'
    case 'drafting':
    case 'rewriting':
      return 'inDevelopment'
    case 'ready':
      return 'readyToPackage'
    case 'inProduction':
    case 'produced':
      return 'productionHistory'
  }
}

function consequenceFor(project: ScriptProject): string {
  switch (project.status) {
    case 'drafting':
      return SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE
    case 'rewriting':
      return SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE
    case 'review':
      return project.rewriteCount === 0
        ? `Accepting is immediate. A final rewrite has this consequence: ${SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE}`
        : 'The final rewrite is complete. Accepting is immediate and consumes no time, cash, capacity, or RNG.'
    case 'ready':
      return 'The accepted screenplay waits without occupying its writer or a Development & Casting slot.'
    case 'inProduction':
      return 'The screenplay is locked to its named active production.'
    case 'produced':
      return 'The screenplay remains in append-only production history.'
  }
}

function projectCard(
  state: GameState,
  project: ScriptProject,
  capacity: ScriptCapacityView,
): ScriptProjectCardView {
  const concept = requireConcept(state, project.conceptId)
  const blockers: ScriptPlayerBlocker[] = []
  const legalActions: ScriptProjectActionView[] = []
  if (project.status === 'review') {
    legalActions.push({
      kind: 'acceptScript',
      projectId: project.id,
      label: project.rewriteCount === 0 ? 'Accept first draft' : 'Accept final draft',
    })
    if (project.rewriteCount === 0) {
      blockers.push(...writerBlockers(state, project, 'rewrite'))
      if (capacity.available === 0) {
        blockers.push({
          kind: 'facility-capacity',
          headline: 'No rewrite slot is available',
          detail: 'A final rewrite needs one Development & Casting slot for one week.',
          remedy: 'Accept this draft now, or wait for a named task to release a slot.',
        })
      }
      if (blockers.length === 0) {
        legalActions.push({
          kind: 'requestScriptRewrite',
          projectId: project.id,
          label: 'Request final rewrite',
        })
      }
    }
  } else if (project.status === 'ready') {
    const availability = packageAvailability(state, project, capacity)
    blockers.push(...availability.blockers)
    if (availability.staffingAvailable) {
      legalActions.push({
        kind: 'openPackage',
        projectId: project.id,
        label: 'Open locked package',
      })
    }
  }

  return {
    projectId: project.id,
    section: sectionFor(project.status),
    title: concept.title,
    genre: concept.genre,
    writer: writerView(state, project.writerId),
    status: project.status,
    lifecycleLabel: STATUS_LABEL[project.status],
    rewriteCount: project.rewriteCount,
    dueWeek: project.dueWeek,
    weeksUntilDecision:
      project.dueWeek === null ? null : Math.max(0, project.dueWeek - state.market.tick),
    productionId: project.productionId,
    consequence: consequenceFor(project),
    assessment:
      project.assessment === null ? null : estimatedScriptAssessment(project.assessment),
    legalActions,
    blockers,
  }
}

function readyPackage(
  state: GameState,
  project: ScriptProject,
  capacity: ScriptCapacityView,
): ReadyScriptPackageView {
  const concept = requireConcept(state, project.conceptId)
  if (project.assessment === null || project.status !== 'ready') {
    throw new Error(`scriptReadModel: project "${project.id}" is not a Ready assessed screenplay`)
  }
  const availability = packageAvailability(state, project, capacity)
  return {
    projectId: project.id,
    concept: { id: concept.id, title: concept.title, genre: concept.genre },
    writer: writerView(state, project.writerId),
    lockedShape: cloneShape(project.shape),
    lockedPromise: clonePromise(project.promise),
    assessment: estimatedScriptAssessment(project.assessment),
    availability,
    openAction: availability.staffingAvailable
      ? {
          kind: 'openPackage',
          projectId: project.id,
          label: 'Open locked package',
        }
      : null,
  }
}

function lotAttention(
  sections: ScriptProjectsReadModel['sections'],
  capacity: ScriptCapacityView,
): ScriptLotAttentionView {
  const review = sections.needsReview[0]
  if (review !== undefined) {
    return {
      kind: 'review-required',
      headline: 'Screenplay review required',
      detail: `${review.title} needs an Accept or Rewrite decision.`,
    }
  }
  if (capacity.capacity === 0 || capacity.available === 0) {
    return {
      kind: 'capacity-constraint',
      headline: 'Development & Casting capacity constrained',
      detail:
        capacity.capacity === 0
          ? 'No Development & Casting facility is available.'
          : `All ${String(capacity.capacity)} Development & Casting slots are occupied.`,
    }
  }
  const active = sections.inDevelopment[0]
  if (active !== undefined) {
    return {
      kind: 'active-work',
      headline: `${active.lifecycleLabel}: ${active.title}`,
      detail: active.consequence,
    }
  }
  const ready = sections.readyToPackage[0]
  if (ready !== undefined) {
    return {
      kind: 'ready-script',
      headline: 'Screenplay ready to package',
      detail: `${ready.title} is accepted and ready for package assembly.`,
    }
  }
  return {
    kind: 'idle',
    headline: 'Writers Room idle',
    detail: 'No screenplay currently needs attention.',
  }
}

/**
 * The complete, engine-owned Writers Room projection. Projects are always sorted
 * by ascending canonical ID inside each governed section, independent of input
 * array identity or order.
 */
export function scriptProjectsReadModel(state: GameState): ScriptProjectsReadModel {
  const capacity = scriptCapacityView(state)
  const projects = [...state.scriptDevelopment.projects].sort((a, b) => compareId(a.id, b.id))
  const sections: ScriptProjectsReadModel['sections'] = {
    needsReview: [],
    inDevelopment: [],
    readyToPackage: [],
    productionHistory: [],
  }
  for (const project of projects) {
    const card = projectCard(state, project, capacity)
    sections[card.section].push(card)
  }

  const firstReview = sections.needsReview[0]
  const nextDecision: ScriptReviewDecisionView | null =
    firstReview === undefined
      ? null
      : {
          kind: 'scriptReview',
          projectId: firstReview.projectId,
          title: firstReview.title,
          legalActions: firstReview.legalActions.filter(
            (
              action,
            ): action is Extract<
              ScriptProjectActionView,
              { kind: 'acceptScript' | 'requestScriptRewrite' }
            > => action.kind === 'acceptScript' || action.kind === 'requestScriptRewrite',
          ),
        }

  return {
    mode: state.scriptDevelopment.mode,
    capacity,
    sections,
    commission: commissionAvailability(state, capacity),
    packages: projects
      .filter((project) => project.status === 'ready')
      .map((project) => readyPackage(state, project, capacity)),
    nextDecision,
    lotAttention: lotAttention(sections, capacity),
  }
}

/** The first actionable screenplay review, ordered by ascending project ID. */
export function nextScriptDecision(state: GameState): ScriptReviewDecisionView | null {
  return scriptProjectsReadModel(state).nextDecision
}

function nextProductionOperationsDecision(
  state: GameState,
): ProductionOperationsDecisionView | null {
  if (state.operations.mode !== 'managed') return null

  // Active-production identity is authoritative. Sorting that collection, rather
  // than trusting workflow insertion order, gives the cross-system selector one
  // stable production ordering even when a caller supplies freshly cloned arrays.
  const productions = [...state.studio.activeProductions].sort((a, b) =>
    compareId(a.id, b.id),
  )
  for (const production of productions) {
    const workflow = state.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (
      workflow === undefined ||
      workflow.phase !== 'shooting' ||
      workflow.shootingTask === null
    ) {
      continue
    }
    const task = workflow.shootingTask
    // Require the same ownership correlations the operations invariant requires.
    // A malformed task is never advertised as actionable even if one scalar status
    // happens to resemble a command state.
    if (task.productionId !== production.id) continue

    let command: ProductionOperationsCommand | null = null
    if (
      task.status === 'unassigned' &&
      workflow.blocker === null &&
      task.directorId === production.directorId
    ) {
      command = {
        kind: 'assignShootingDirector',
        productionId: production.id,
        directorId: production.directorId,
      }
    } else if (
      task.status === 'blocked' &&
      workflow.blocker?.kind === 'scenery-load-in' &&
      workflow.blocker.taskId === task.id
    ) {
      command = { kind: 'clearSceneryLoadIn', productionId: production.id }
    } else if (task.status === 'ready' && workflow.blocker === null) {
      command = { kind: 'scheduleShootingTake', productionId: production.id }
    }
    if (command !== null) {
      return {
        kind: 'productionOperation',
        productionId: production.id,
        command,
      }
    }
  }
  return null
}

/**
 * The one deterministic managed-studio decision selector. Actionable screenplay
 * reviews always precede Production Operations calls. Within each system the
 * canonical ascending project/production id is first. Facility-capacity warnings
 * have no player command and therefore never become a decision stop.
 */
export function nextStudioDecision(state: GameState): StudioDecisionView | null {
  return nextScriptDecision(state) ?? nextProductionOperationsDecision(state)
}
