// ── Script Projects V1 player read boundary ─────────────────────────────────
// Pure projection over GameState. This module deliberately returns fresh, narrow
// values: no Talent, FilmConcept, ScriptProject, GameState, RNG, actual skill,
// actual screenplay strength, or ceiling object crosses the boundary.

import { activeContract, busyTalentIds, freelancerMarketIds } from './employment.js'
import {
  castingDevelopmentCastingOccupancy,
  nextCastingSessionNeedingReview,
} from './castingSessions.js'
import {
  activeScriptWriterAssignments,
  developmentCastingOccupancy,
  facilitySlotKey,
  scriptRewriteDelta,
} from './scriptDevelopment.js'
import { clamp } from './math.js'
import { developmentOfficeEstUplift } from './facilityEffects.js'
import {
  hasQueuedCastingSession,
  hasQueuedGreenlightScriptProject,
  hasQueuedPoolCommissionForConcept,
} from './productionQueue.js'
import { roleOVR } from './talentSummary.js'
import { sceneryLoadInDecision } from './sceneryLoadIn.js'
import {
  beatsForGenre,
  blueprintForConcept,
  requiredSetDemand,
  screenplayDraftConsequence,
  screenplayProvenance,
  type RequiredSetTypeView,
  type ScreenplayProvenanceView,
} from './screenplay.js'
import { CASTING_MIN_UNIQUE_CANDIDATES, TUNING } from './tuning.js'
import type {
  Action,
  CreativeRole,
  DevelopmentCastingOccupancy,
  FilmConcept,
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
  // C2a-M4 (§3.3): `'production-capacity'` — "The production slate is full" — is
  // GONE with the cap it mirrored (owner law 1). There is no slate count to be
  // full of. What can still stop a greenlight starting THIS week is a physical
  // room, and that has always been `'facility-capacity'`; the successor to the
  // deleted arm is that arm, now carrying the queue's own truth.
  | 'package-staffing'
  | 'casting-session'
  | 'greenlight-queued'
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
  | { kind: 'planAuditions'; projectId: string; label: string }
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
  owner: 'production' | 'script' | 'casting'
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
  /**
   * C2a-M3 — WHERE THIS SCREENPLAY CAME FROM (charter §3.5).
   *
   * "An Original Screenplay by Ava Hartwell" versus a premise acquired from the
   * open market. The fantasy this milestone delivers is that a writer goes to
   * work and hands the studio a new movie, and a fantasy the player cannot SEE
   * is plumbing. Every entry on the commission board is a market premise by
   * construction — an original is minted and claimed in the same action, so it
   * never appears there — and every packaged screenplay says which it is.
   */
  provenance: ScreenplayProvenanceView
}

export type CommissionWriterView = ScriptWriterView & {
  writingEstimate: { label: 'Est.'; score: number }
  available: boolean
  assignmentLabel: string | null
}

export type ScriptCommissionAvailabilityView = {
  /** Can the studio ADAPT A MARKET PREMISE right now? */
  canStart: boolean
  /**
   * Can the studio COMMISSION AN ORIGINAL right now? (C2a-M4, the M3 carry.)
   *
   * `canStart` was one answer to two questions, and after M3 the two questions
   * genuinely differ: an original needs a writer and a room, and needs NO
   * unclaimed market premise at all — it mints its own. Publishing both here
   * means the Writers Room stops having to reason about which blockers apply to
   * which door, and the `no-concepts` blocker is scoped to the door it is
   * actually about.
   */
  canStartOriginal: boolean
  /**
   * Can the market-premise intent be submitted through the authoritative front
   * door? Capacity alone does not close that door: the intent joins the shared
   * Development & Casting queue and is revalidated when it reaches the front.
   */
  canSubmitMarketIntent: boolean
  /** The same front-door fact for an original screenplay commission. */
  canSubmitOriginalIntent: boolean
  /** True when an otherwise-legal commission will wait instead of starting now. */
  willQueueIntent: boolean
  consequence: string
  concepts: CommissionConceptView[]
  writers: CommissionWriterView[]
  blockers: ScriptPlayerBlocker[]
}

export type ScriptPackageAvailabilityView = {
  knownGatesClear: boolean
  /**
   * Can this exact package be submitted to the authoritative greenlight door?
   * A facility-capacity blocker queues; every other blocker still refuses.
   */
  canSubmitGreenlightIntent: boolean
  /** True when this legal greenlight will wait for Development & Casting capacity. */
  willQueueGreenlightIntent: boolean
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
  /**
   * C2a-M3 — THE LOCATIONS THIS SCREENPLAY CALLS FOR, derived from its beats and
   * never written onto the shared-world concept (guardrail 8). The engine
   * equivalent of the original's own info bubble, which "lists which sets the
   * script requires" [CORPUS Bible §7.1, OFFICIAL manual p.13].
   *
   * ADVISORY in V1, exactly as the M2 set binding is: one bound set per
   * production stands, so an unowned location costs fit and variety rather than
   * refusing the shoot. Turning it into a hard block is a reservation change,
   * and reservations are M4's.
   */
  requiredSets: RequiredSetTypeView[]
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
  | import('./castingReadModel.js').CastingReviewDecisionView
  | ProductionOperationsDecisionView
  | ReleaseReviewDecisionView

// ── P06A (charter W1): the fourth decision tier ──────────────────────────────
// An UNCOMMITTED Release Ready picture is a genuine studio decision — the ONE
// P06A decision stop. Ascending exact production id; the projection carries no
// command because the legal actions (commit / knowingly hold) are the player's
// choice, not a resolvable operation.
export type ReleaseReviewDecisionView = {
  kind: 'releaseReview'
  productionId: string
  title: string
}

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

// P04A.2 — SEATS ONLY. `candidate.writerId` is deliberately absent: being the
// credited writer of a picture is not work and must never produce a "Working
// on …" label, because that label is what the availability blockers quote.
function activeProductionAssignment(state: GameState, talentId: string): string | null {
  const productions = [...state.studio.activeProductions].sort((a, b) => compareId(a.id, b.id))
  const production = productions.find((candidate) =>
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
  // P04A.3 (Owner ruling) — a screenplay's Writer holds a permanent CREDIT, not an
  // active production assignment. Contract state gates real writing WORK (drafting,
  // rewriting) because that work spends studio-contracted time; it does not gate
  // GREENLIGHTING a screenplay that is already finished, because a completed
  // screenplay's credit engages no writing time at all. So the writer-contract
  // blocker below is scoped to `purpose === 'rewrite'` only — a `package` greenlight
  // publishes no writer blocker of any kind.
  if (purpose === 'package') return []
  const writer = writerView(state, project.writerId)
  const availability = writerAvailability(state, project.writerId)
  const blockers: ScriptPlayerBlocker[] = []
  if (!availability.contracted) {
    blockers.push({
      kind: 'writer-contract',
      headline: `${writer.name} is out of contract`,
      detail: `${writer.name} must be currently studio-contracted to perform the rewrite.`,
      remedy: `Sign ${writer.name} to a new studio contract.`,
    })
  } else if (!availability.available) {
    // P04A.2 (Owner ruling §6/§7) — availability gates REWRITES ONLY. A rewrite
    // is real writing work, so the writer must actually be free for it. A
    // GREENLIGHT engages nobody's writing time: it locks a permanent credit on a
    // screenplay that is already finished. Publishing a writer-availability
    // blocker for `purpose: 'package'` was the projection half of the one-writer
    // deadlock — it drove `canSubmitGreenlightIntent: false`, so the Casting
    // surface refused a greenlight the engine now accepts, and the only remedy
    // it offered ("Wait for the named assignment to finish") needed time the
    // paused Casting surface would not advance. The engine's own greenlight gate
    // (`applyGreenlight`) no longer consults the credited writer's availability
    // either, so the two agree.
    //
    // P04A.3 (Owner ruling §8) — the writer-CONTRACT blocker above is now ALSO
    // scoped to `purpose: 'rewrite'` (see the early `if (purpose === 'package')
    // return []`): a completed screenplay's credit is not new labour, so contract
    // state cannot gate greenlighting it either.
    //
    // The engine moved WITH this projection, not against it:
    // `applyGreenlightScriptProject` no longer throws on an out-of-contract
    // credited writer, and `applyGreenlight`'s D-11.12 eligibility list no longer
    // contains the writer. Had only this projection changed, the board would have
    // offered a greenlight the engine refused — a rejection with no warning
    // anywhere, the same shape as the P04A.1 deadlock. The two agree.
    //
    // Real writing WORK still requires a current contract and an idle writer:
    // `requireCommissionableWriter` (commission) and `applyRequestScriptRewrite`
    // (rewrite) both still gate on it.
    const assignment = availability.assignmentLabel ?? 'Working on another assignment'
    blockers.push({
      kind: 'writer-assignment',
      headline: `${writer.name} is already assigned`,
      detail: `${assignment}. The screenplay remains in review until the writer is available.`,
      remedy: 'Wait for the named assignment to finish.',
    })
  }
  return blockers
}

/** Exact, slot-by-slot shared Development & Casting usage. */
export function scriptCapacityView(state: GameState): ScriptCapacityView {
  const occupancy = [
    ...developmentCastingOccupancy(state.operations, state.scriptDevelopment),
    ...castingDevelopmentCastingOccupancy(state.operations, state.castingSessions),
  ]
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
        } else if (entry !== undefined && entry.owner === 'production') {
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
        } else if (entry !== undefined) {
          const session = state.castingSessions.sessions.find(
            (candidate) => candidate.id === entry.ownerId,
          )
          if (session === undefined) {
            throw new Error(`scriptReadModel: occupancy references unknown casting session "${entry.ownerId}"`)
          }
          const project = state.scriptDevelopment.projects.find(
            (candidate) => candidate.id === session.projectId,
          )
          if (project === undefined) {
            throw new Error(`scriptReadModel: casting session "${session.id}" references unknown project`)
          }
          const title = requireConcept(state, project.conceptId).title
          occupant = {
            owner: 'casting',
            ownerId: session.id,
            activity: 'auditioning',
            title,
            label: `Casting session — ${title}`,
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
  const available = Math.max(0, capacity - occupied)
  if (available !== Math.max(0, capacity - occupied)) {
    throw new Error('scriptReadModel: shared capacity totals disagree with authoritative occupancy')
  }
  return { capacity, occupied, available, facilities }
}

/**
 * The concept as a board or a package card reads it — including WHO WROTE IT.
 *
 * The provenance line is resolved live from the blueprint root and the talent
 * census, never stored on the concept: a screenplay's writer is a
 * studio-relative fact and the shared-world premise must not carry one
 * (guardrail 8).
 */
function conceptView(state: GameState, concept: FilmConcept): CommissionConceptView {
  const blueprint = blueprintForConcept(state.originalScreenplays, concept.id)
  const writerName =
    blueprint === undefined
      ? undefined
      : state.talent.find((person) => person.id === blueprint.writerId)?.name
  return {
    id: concept.id,
    title: concept.title,
    genre: concept.genre,
    provenance: screenplayProvenance(blueprint, writerName),
  }
}

function commissionAvailability(
  state: GameState,
  capacity: ScriptCapacityView,
): ScriptCommissionAvailabilityView {
  const claimedConcepts = new Set(
    state.scriptDevelopment.projects.map((project) => project.conceptId),
  )
  const queuedPoolConceptIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'commissionScript' ? [entry.payload.conceptId] : [],
    ),
  )
  const concepts = state.concepts
    .filter(
      (concept) =>
        !claimedConcepts.has(concept.id) &&
        !hasQueuedPoolCommissionForConcept(state.productionQueue, concept.id),
    )
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
    .map((concept): CommissionConceptView => conceptView(state, concept))

  // Best writing estimate first. The commission form takes its default from the
  // head of this list, and a pure canonical-id order handed a fresh studio's very
  // first screenplay to whoever happened to own the lowest id — in practice an
  // actor with a fragile writing estimate, while the roster's actual writer sat
  // last. Ordering by the same player-visible `Est.` score the form already shows
  // makes the default explainable. Equal scores fall back to the canonical id, so
  // the order stays fully deterministic and independent of input array order.
  const writers = state.talent
    .filter(
      (writer) =>
        writer.skills.writing !== undefined && activeContract(state, writer.id) !== undefined,
    )
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
    .sort(
      (a, b) => b.writingEstimate.score - a.writingEstimate.score || compareId(a.id, b.id),
    )

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
      detail: 'Every Development & Casting slot is occupied, so an otherwise-legal commission joins the queue instead of starting now.',
      remedy: 'Submit the commission to queue it, wait for a named task to release a slot, or build more Development & Casting capacity.',
    })
  }
  if (concepts.length === 0) {
    // C2a-M3 — THIS BLOCKER IS NO LONGER TERMINAL, and that is the whole point of
    // the milestone. C1 seeded thirty premises per world, claimed them
    // permanently, and offered "Continue with an existing project" as the
    // remedy — which was not a remedy, because no action in the game yielded a
    // thirty-first. Now one does: the studio's own writers.
    blockers.push({
      kind: 'no-concepts',
      headline:
        queuedPoolConceptIds.size > 0
          ? 'No market premise is available to commission'
          : 'The market has no unclaimed premises left',
      detail:
        queuedPoolConceptIds.size > 0
          ? 'Every premise already owns a screenplay project or is already named by a queued commission.'
          : 'Every premise this studio could buy already owns a screenplay project.',
      remedy: 'Commission an original screenplay — put one of your writers on a new picture.',
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

  const canSubmitMarketIntent = blockers.every(
    (blocker) => blocker.kind === 'facility-capacity',
  )
  const canSubmitOriginalIntent = blockers.every(
    (blocker) => blocker.kind === 'facility-capacity' || blocker.kind === 'no-concepts',
  )
  return {
    canStart: blockers.length === 0,
    // THE MARKET-PATH SCOPE (C2a-M4, the M3 carry). `no-concepts` is a fact about
    // the premise MARKET, and an original screenplay does not shop there — so it
    // is the one blocker an original commission steps over. Every other blocker
    // on this list is about the studio, the room or the roster, and stops both
    // doors exactly as it always did.
    canStartOriginal: blockers.every((blocker) => blocker.kind === 'no-concepts'),
    canSubmitMarketIntent,
    canSubmitOriginalIntent,
    willQueueIntent:
      blockers.some((blocker) => blocker.kind === 'facility-capacity') &&
      (canSubmitMarketIntent || canSubmitOriginalIntent),
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
  const greenlightQueued = hasQueuedGreenlightScriptProject(
    state.productionQueue,
    project.id,
  )
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
      // P04A.2 — lead with the shortage, which is what the player can act on.
      // The writer is mentioned last and only to explain the count: they are
      // excluded because one person may not hold two roles on ONE picture
      // (M16.7), NOT because the credit reserves them. It does not — they are
      // free to write the next screenplay while this one shoots.
      detail: `The currently available studio roster and freelancer market are short: ${staffingShortages
        .map(
          ({ role, label, count }) =>
            `${label} (${String(availableByRole.get(role) ?? 0)} of ${String(count)} available)`,
        )
        .join(', ')}. ${writer.name} is not counted — they hold this screenplay's writing credit and so cannot also fill a role on it.`,
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
  if (greenlightQueued) {
    blockers.push({
      kind: 'greenlight-queued',
      headline: 'Greenlight already queued',
      detail: 'This exact screenplay package already has a greenlight intent waiting in the Studio Queue.',
      remedy: 'Advance the week until a Development & Casting slot frees, or cancel the intent in the Studio Queue before assembling a replacement.',
    })
  }
  // ── THE SUCCESSOR SEMANTIC (charter §3.3) ────────────────────────────────
  //
  // `productionSlotAvailable` used to answer "is the studio under the cap?" —
  // a question with no meaning now. Its successor answers the question the
  // player actually has: CAN THIS PICTURE START THIS WEEK, or will it wait? One
  // physical fact answers it — whether a Development & Casting slot is free —
  // which is the same fact `developmentCastingSlotAvailable` reports, and the two
  // are deliberately equal rather than independently derived, because a surface
  // that renders "slot available" and a surface that renders the blocker must
  // never disagree.
  const developmentCastingSlotAvailable = capacity.available > 0
  const productionSlotAvailable = developmentCastingSlotAvailable
  const queueDepth = state.productionQueue.length
  if (!developmentCastingSlotAvailable && !greenlightQueued) {
    blockers.push({
      kind: 'facility-capacity',
      headline: 'Development & Casting is full',
      detail: `Every Development & Casting slot is occupied, so a greenlight now JOINS THE QUEUE instead of starting: ${String(queueDepth)} ${queueDepth === 1 ? 'intent is' : 'intents are'} already waiting.`,
      remedy:
        'Greenlight anyway and it starts the week a slot frees — or free one sooner by finishing a screenplay or audition, or build more Development & Casting capacity.',
    })
  }
  const writerAvailable = !blockers.some(
    (blocker) => blocker.kind === 'writer-contract' || blocker.kind === 'writer-assignment',
  )
  const canSubmitGreenlightIntent = blockers.every(
    (blocker) => blocker.kind === 'facility-capacity',
  )
  return {
    knownGatesClear: blockers.length === 0,
    canSubmitGreenlightIntent,
    willQueueGreenlightIntent:
      canSubmitGreenlightIntent &&
      blockers.some((blocker) => blocker.kind === 'facility-capacity'),
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
      // C2a-M3 (`00E`.9): the draft clock varies now, so the sentence counts the
      // weeks this screenplay actually takes rather than promising one. A pool
      // commission still reads exactly the C1 sentence, because it still takes
      // exactly one week.
      return screenplayDraftConsequence(
        project.dueWeek === null
          ? TUNING.SCRIPT_DRAFT_WEEKS_POOL
          : project.dueWeek - project.commissionedWeek,
      )
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

function canPlanAuditions(
  state: GameState,
  project: ScriptProject,
): boolean {
  if (hasQueuedCastingSession(state.productionQueue, project.id)) return false
  const busy = busyTalentIds(state)
  const freelancerMarket = new Set(freelancerMarketIds(state))
  const eligiblePrimaryActors = state.talent.filter(
    (talent) =>
      talent.role === 'actor' &&
      talent.id !== project.writerId &&
      !busy.has(talent.id) &&
      (activeContract(state, talent.id) !== undefined || freelancerMarket.has(talent.id)),
  )
  return eligiblePrimaryActors.length >= CASTING_MIN_UNIQUE_CANDIDATES
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
    const greenlightQueued = hasQueuedGreenlightScriptProject(
      state.productionQueue,
      project.id,
    )
    blockers.push(...availability.blockers)
    const castingSession = state.castingSessions.sessions.find(
      (session) => session.projectId === project.id,
    )
    if (
      state.castingSessions.mode === 'managed' &&
      castingSession === undefined &&
      canPlanAuditions(state, project)
    ) {
      legalActions.push({
        kind: 'planAuditions',
        projectId: project.id,
        label: 'Plan auditions',
      })
    }
    if (
      castingSession !== undefined &&
      (castingSession.status === 'auditioning' || castingSession.status === 'review')
    ) {
      blockers.push({
        kind: 'package-staffing',
        headline: 'Casting session must be reviewed',
        detail: `${castingSession.id} is ${castingSession.status === 'auditioning' ? 'still underway' : 'waiting for review'}.`,
        remedy: 'Open the Casting Room and finish the session before assembling this package.',
      })
    }
    if (availability.staffingAvailable && !greenlightQueued) {
      if (
        castingSession === undefined ||
        castingSession.status === 'complete' ||
        state.castingSessions.mode === 'legacy'
      ) {
        legalActions.push({
          kind: 'openPackage',
          projectId: project.id,
          label: 'Open locked package',
        })
      }
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
  const baseAvailability = packageAvailability(state, project, capacity)
  const greenlightQueued = hasQueuedGreenlightScriptProject(
    state.productionQueue,
    project.id,
  )
  const castingSession = state.castingSessions.sessions.find(
    (session) => session.projectId === project.id,
  )
  const castingClear =
    state.castingSessions.mode === 'legacy' ||
    castingSession === undefined ||
    castingSession.status === 'complete'
  const availability: ScriptPackageAvailabilityView = castingClear
    ? baseAvailability
    : {
        ...baseAvailability,
        knownGatesClear: false,
        canSubmitGreenlightIntent: false,
        willQueueGreenlightIntent: false,
        blockers: [
          ...baseAvailability.blockers,
          {
            kind: 'casting-session',
            headline: 'Casting session must be reviewed',
            detail: `${castingSession!.id} is ${castingSession!.status === 'auditioning' ? 'still underway' : 'waiting for review'}.`,
            remedy: 'Open the Casting Room and finish the session before assembling this package.',
          },
        ],
      }
  return {
    projectId: project.id,
    concept: conceptView(state, concept),
    writer: writerView(state, project.writerId),
    lockedShape: cloneShape(project.shape),
    lockedPromise: clonePromise(project.promise),
    assessment: estimatedScriptAssessment(project.assessment),
    requiredSets: requiredSetDemand(
      blueprintForConcept(state.originalScreenplays, concept.id)?.beats ?? beatsForGenre(concept.genre),
      state.sets,
    ),
    availability,
    openAction: availability.staffingAvailable && castingClear && !greenlightQueued
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
  // The screenplay system genuinely has nothing needing attention — but the
  // SHARED Development & Casting facility is not necessarily empty. A greenlit
  // picture holds one of its slots through development and pre-production, and
  // announcing an idle Writers Room beside that picture is a flat contradiction
  // of the building's own state.
  //
  // `kind` deliberately stays 'idle'. It is the screenplay system's own state,
  // and every consumer gate keyed to it (commission legality, the retained
  // commissioning workspace) must keep its exact current meaning: a picture in
  // development occupies one slot, it does not stop the studio commissioning the
  // next screenplay in another. Only the engine-owned copy is corrected, to name
  // what actually occupies the building. Occupants are read from the one
  // authoritative shared-capacity union, in facility-then-slot order, so this
  // stays deterministic.
  const productionOccupant = capacity.facilities
    .flatMap((facility) => facility.slots)
    .find((slot) => slot.occupant !== null && slot.occupant.owner === 'production')?.occupant
  if (productionOccupant !== undefined && productionOccupant !== null) {
    return {
      kind: 'idle',
      headline: `${productionOccupant.title} — early production work`,
      detail: `No screenplay is in development. ${productionOccupant.title} holds a Development & Casting slot; another slot is open for a new commission.`,
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
      // P05A W1: the one scenery classifier owns whether this blocker is a
      // decision at all. Only the explicitly grandfathered click is a command.
      // A current derived trip — travelling or already due — is waiting work
      // the engine settles; withheld provenance offers nothing. Publishing
      // `clearSceneryLoadIn` for those states advertised an action the engine
      // rejects (in transit) or performs itself (due), and paused Living Time
      // behind a non-decision.
      if (sceneryLoadInDecision(state, workflow, state.market.tick).kind === 'manual-clear') {
        command = { kind: 'clearSceneryLoadIn', productionId: production.id }
      }
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
  const scriptDecision = nextScriptDecision(state)
  if (scriptDecision !== null) return scriptDecision
  const castingReview = nextCastingSessionNeedingReview(state.castingSessions)
  if (castingReview !== undefined) {
    const project = state.scriptDevelopment.projects.find(
      (candidate) => candidate.id === castingReview.projectId,
    )
    if (project === undefined) {
      throw new Error(
        `scriptReadModel: casting session "${castingReview.id}" references unknown project`,
      )
    }
    return {
      kind: 'castingReview',
      sessionId: castingReview.id,
      projectId: project.id,
      title: requireConcept(state, project.conceptId).title,
    }
  }
  const operationsDecision = nextProductionOperationsDecision(state)
  if (operationsDecision !== null) return operationsDecision
  return nextReleaseReviewDecision(state)
}

/**
 * P06A tier 4 (charter W1): the first UNCOMMITTED Release Ready picture in
 * ascending exact-id order. A committed picture is no longer a decision — it
 * resolves on the next authoritative week. Legacy and managed worlds share
 * this law (remainingTicks === 1 is the phase truth in both).
 */
export function nextReleaseReviewDecision(state: GameState): ReleaseReviewDecisionView | null {
  const committed = new Set(state.releaseAuthority.commitments.map((row) => row.productionId))
  const ready = state.studio.activeProductions
    .filter((production) => production.remainingTicks === 1 && !committed.has(production.id))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const first = ready[0]
  if (first === undefined) return null
  return {
    kind: 'releaseReview',
    productionId: first.id,
    title: requireConcept(state, first.conceptId).title,
  }
}

// ── P03A: TypeScript-authored review evidence — explanation and rewrite preview ─
//
// Package 03 (accepted 2d285e5) rules that the review surface may not paraphrase
// score bands in the renderer and may not let a client compute a rewrite outcome.
// Both extensions below are pure, RNG-free projections over persisted PERCEIVED
// values only. `actualStrength`, actual skills, raw premise values, and numeric
// factor decompositions never appear here — the qualitative findings are the
// whole disclosure, by ruling.

/** The band ladder, alone. Must stay byte-identical to estimatedScriptAssessment. */
export function estimatedBandForScore(
  score: number,
): EstimatedScriptAssessmentView['band'] {
  if (score >= 75) return 'Strong'
  if (score >= 60) return 'Promising'
  if (score >= 45) return 'Workable'
  return 'Fragile'
}

export type ScriptAssessmentExplanationView = {
  /** Short public factor label, e.g. `Premise`. */
  label: string
  /** One concise TypeScript-authored qualitative finding. */
  finding: string
  tone: 'strength' | 'concern' | 'neutral'
}

/**
 * Why the studio holds its current estimate, in the only honest vocabulary the
 * simulation supports: a qualitative premise-foundation band, whether a
 * Development Office contribution is included, and whether the final rewrite is
 * already in the number. No raw values, no formula, no per-factor arithmetic.
 */
export function scriptAssessmentExplanation(
  state: GameState,
  projectId: string,
): ScriptAssessmentExplanationView[] | null {
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === projectId,
  )
  if (project === undefined || project.assessment === null) return null
  const band = estimatedBandForScore(project.assessment.perceivedStrength)
  const lines: ScriptAssessmentExplanationView[] = []
  switch (band) {
    case 'Strong':
      lines.push({
        label: 'Premise',
        finding: 'The premise gives these pages a strong creative foundation.',
        tone: 'strength',
      })
      break
    case 'Promising':
      lines.push({
        label: 'Premise',
        finding: 'The premise gives these pages a promising creative foundation.',
        tone: 'strength',
      })
      break
    case 'Workable':
      lines.push({
        label: 'Premise',
        finding: 'The premise holds a workable foundation with room left to find.',
        tone: 'neutral',
      })
      break
    case 'Fragile':
      lines.push({
        label: 'Premise',
        finding: 'The premise foundation is thin; the pages carry creative risk.',
        tone: 'concern',
      })
      break
  }
  // The uplift is applied at the tick that WRITES a draft; review opens on that
  // same authoritative tick, so "current" is the completing office. (An office
  // finishing in the very same advance completes after step 0.5 and is honestly
  // not included — the copy names inclusion only when a contribution exists now.)
  if (developmentOfficeEstUplift(state) > 0) {
    lines.push({
      label: 'Development Office',
      finding: 'The current Development Office contribution is included in this estimate.',
      tone: 'neutral',
    })
  }
  if (project.rewriteCount === 1) {
    lines.push({
      label: 'Final rewrite',
      finding: 'The final rewrite is included in this estimate.',
      tone: 'neutral',
    })
  }
  return lines
}

/** Display form shared with the browser: whole numbers stay whole, else one decimal. */
function formatEstScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export type RewriteDecisionPreviewView = {
  currentScore: number
  currentBand: EstimatedScriptAssessmentView['band']
  projectedScore: number
  projectedBand: EstimatedScriptAssessmentView['band']
  /** Realized perceived movement after the 0..100 clamp — may differ from the raw delta. */
  delta: number
  direction: 'gain' | 'unchanged' | 'decline'
  /** `Est. 62 · Promising` */
  currentLine: string
  /** `Projected Est. 65 · Promising` */
  projectedLine: string
  /** `Projected +3` / `Projected unchanged` / `Projected -2` */
  directionLine: string
  /** The exact review week if the rewrite is authorized now. */
  dueWeek: number
  writerName: string
  capacityLine: string
  operatingLine: string
  projectionNote: string
}

/**
 * The player-safe Accept-vs-Rewrite comparison Package 03 requires. Deterministic
 * under current law: the perceived leg of the rewrite consumes no RNG and the
 * writer's perceived rewriting skill cannot move during the one rewrite week, so
 * the projection equals the realized perceived result exactly. It remains a
 * PROJECTION of the estimate — the hidden actual result may differ and is never
 * disclosed.
 *
 * Null whenever the project is not at its first review, the assessment or writer
 * is missing, or the writer has no perceived rewriting skill — the surface then
 * withholds the number rather than inventing one.
 */
export function rewriteDecisionPreview(
  state: GameState,
  projectId: string,
): RewriteDecisionPreviewView | null {
  if (state.scriptDevelopment.mode !== 'managed') return null
  const project = state.scriptDevelopment.projects.find(
    (candidate) => candidate.id === projectId,
  )
  if (project === undefined) return null
  if (project.status !== 'review' || project.rewriteCount !== 0) return null
  if (project.assessment === null) return null
  const writer = state.talent.find((candidate) => candidate.id === project.writerId)
  if (writer === undefined) return null
  const rewriting = writer.skills.writing?.rewriting
  if (rewriting === undefined || typeof rewriting.perceived !== 'number') return null
  const currentScore = project.assessment.perceivedStrength
  const projectedScore = clamp(
    currentScore + scriptRewriteDelta(currentScore, rewriting.perceived),
    0,
    100,
  )
  const delta = projectedScore - currentScore
  const direction = delta > 0 ? 'gain' : delta < 0 ? 'decline' : 'unchanged'
  const currentBand = estimatedBandForScore(currentScore)
  const projectedBand = estimatedBandForScore(projectedScore)
  return {
    currentScore,
    currentBand,
    projectedScore,
    projectedBand,
    delta,
    direction,
    currentLine: `Est. ${formatEstScore(currentScore)} · ${currentBand}`,
    projectedLine: `Projected Est. ${formatEstScore(projectedScore)} · ${projectedBand}`,
    directionLine:
      direction === 'gain'
        ? `Projected +${formatEstScore(delta)}`
        : direction === 'decline'
          ? `Projected -${formatEstScore(Math.abs(delta))}`
          : 'Projected unchanged',
    dueWeek: state.market.tick + 1,
    writerName: writer.name,
    capacityLine: 'One Development & Casting slot for one week.',
    operatingLine: SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE,
    projectionNote:
      'A projection of the perceived estimate under current studio law — not a guarantee.',
  }
}
