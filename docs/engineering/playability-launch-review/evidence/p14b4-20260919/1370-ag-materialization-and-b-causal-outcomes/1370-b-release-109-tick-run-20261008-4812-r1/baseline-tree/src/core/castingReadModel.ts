// ── Casting Sessions V1 player read boundary ────────────────────────────────
// Pure projection over GameState. The Casting Room receives only current public
// scouting summaries and persisted audition observations. Hidden execution,
// actual skills/persona, ceilings, seed, and RNG state never cross this module.

import { activeContract, busyTalentIds, freelancerMarketIds } from './employment.js'
import { nextCastingSessionNeedingReview } from './castingSessions.js'
import { hasQueuedCastingSession } from './productionQueue.js'
import { resolveShape } from './shape.js'
import {
  scriptCapacityView,
  scriptProjectsReadModel,
  type ScriptCapacityView,
  type ScriptPackageAvailabilityView,
} from './scriptReadModel.js'
import { projectFit } from './talentSummary.js'
import type {
  AuditionResult,
  CastSlot,
  CastingResults,
  CastingSession,
  CreativeRole,
  GameState,
  Genre,
  ScriptProject,
} from './types.js'

export type CastingCandidateView = {
  id: string
  name: string
  primaryRole: CreativeRole
  fit: { label: 'Fit'; score: number }
  available: boolean
  availabilityLabel: string
}

export type AuditionEvidenceView = {
  talentId: string
  name: string
  label: 'Est.'
  estimate: number
  low: number
  high: number
  fit: { label: 'Fit'; score: number }
  available: boolean
  availabilityLabel: string
  strengths: string[]
  concerns: string[]
}

export type CastingProjectActionView =
  | { kind: 'planAuditions'; projectId: string; label: string }
  | {
      kind: 'acknowledgeCastingSession'
      sessionId: string
      projectId: string
      label: string
      opensPackage: boolean
    }
  | { kind: 'openPackage'; projectId: string; label: string }

export type CastingProjectView = {
  projectId: string
  sessionId: string | null
  title: string
  genre: Genre
  writer: { id: string; name: string; primaryRole: CreativeRole }
  status: 'notStarted' | 'auditioning' | 'review' | 'complete'
  dueWeek: number | null
  weeksUntilDecision: number | null
  consequence: string
  candidates: Record<CastSlot, CastingCandidateView[]>
  results: Record<CastSlot, AuditionEvidenceView[]> | null
  packageAvailability: ScriptPackageAvailabilityView | null
  legalActions: CastingProjectActionView[]
  blockers: string[]
}

export type CastingReviewDecisionView = {
  kind: 'castingReview'
  sessionId: string
  projectId: string
  title: string
}

export type CastingSessionsReadModel = {
  mode: 'legacy' | 'managed'
  capacity: ScriptCapacityView
  activation: {
    canActivate: boolean
    label: string
    blocker: string | null
  }
  sections: {
    readyToPlan: CastingProjectView[]
    auditioning: CastingProjectView[]
    needsReview: CastingProjectView[]
    history: CastingProjectView[]
  }
  nextDecision: CastingReviewDecisionView | null
}

export const CASTING_SESSION_CONSEQUENCE =
  'One week and one shared Development & Casting slot; no casting fee and no talent hold. Payroll and studio overhead continue.'

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function requireProject(state: GameState, projectId: string): ScriptProject {
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) {
    throw new Error(`castingReadModel: unknown screenplay project "${projectId}"`)
  }
  return project
}

function requireConcept(state: GameState, conceptId: string) {
  const concept = state.concepts.find((candidate) => candidate.id === conceptId)
  if (concept === undefined) {
    throw new Error(`castingReadModel: unknown concept "${conceptId}"`)
  }
  return concept
}

function requireTalent(state: GameState, talentId: string) {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(`castingReadModel: unknown talent "${talentId}"`)
  }
  return talent
}

function currentAvailability(
  state: GameState,
  talentId: string,
  writerId: string,
): { available: boolean; label: string } {
  const talent = requireTalent(state, talentId)
  if (talent.role !== 'actor') return { available: false, label: 'Outside the primary Actor pool' }
  if (talentId === writerId) return { available: false, label: 'Locked screenplay writer' }
  if (busyTalentIds(state).has(talentId)) {
    return { available: false, label: 'Currently assigned to another production or screenplay' }
  }
  if (activeContract(state, talentId) !== undefined) {
    return { available: true, label: 'Studio-contracted and currently available' }
  }
  if (freelancerMarketIds(state).includes(talentId)) {
    return { available: true, label: 'Available in the current freelancer market' }
  }
  return { available: false, label: 'Not currently contracted or in the freelancer market' }
}

function fitScore(
  state: GameState,
  project: ScriptProject,
  talentId: string,
  slot: CastSlot,
): number {
  const talent = requireTalent(state, talentId)
  const concept = requireConcept(state, project.conceptId)
  return Math.round(
    projectFit(
      talent,
      'acting',
      concept,
      slot,
      resolveShape(project.shape),
      project.promise,
      project.shape,
    ),
  )
}

function candidateView(
  state: GameState,
  project: ScriptProject,
  talentId: string,
  slot: CastSlot,
): CastingCandidateView {
  const talent = requireTalent(state, talentId)
  const availability = currentAvailability(state, talentId, project.writerId)
  return {
    id: talent.id,
    name: talent.name,
    primaryRole: talent.role,
    fit: { label: 'Fit', score: fitScore(state, project, talent.id, slot) },
    available: availability.available,
    availabilityLabel: availability.label,
  }
}

function evidenceLanguage(result: AuditionResult): {
  strengths: string[]
  concerns: string[]
} {
  const strengths: string[] = []
  const concerns: string[] = []
  if (result.low >= 70) {
    strengths.push('The full observed camera-test range is strong for this role.')
  } else if (result.estimate >= 60) {
    strengths.push('The camera test suggests a promising role read.')
  } else if (result.estimate >= 45) {
    strengths.push('The camera test suggests a workable role read.')
  }
  if (result.high < 50) {
    concerns.push('Even the top of this observed range is fragile for the role.')
  } else if (result.low < 50) {
    concerns.push('The observed range includes a fragile role read.')
  } else if (result.high - result.low >= 10) {
    concerns.push('This remains a noisy observation, not a performance guarantee.')
  }
  return { strengths, concerns }
}

function evidenceView(
  state: GameState,
  project: ScriptProject,
  result: AuditionResult,
  slot: CastSlot,
): AuditionEvidenceView {
  const talent = requireTalent(state, result.talentId)
  const availability = currentAvailability(state, talent.id, project.writerId)
  const language = evidenceLanguage(result)
  return {
    talentId: talent.id,
    name: talent.name,
    label: 'Est.',
    estimate: result.estimate,
    low: result.low,
    high: result.high,
    fit: { label: 'Fit', score: fitScore(state, project, talent.id, slot) },
    available: availability.available,
    availabilityLabel: availability.label,
    strengths: [...language.strengths],
    concerns: [...language.concerns],
  }
}

function candidatePools(
  state: GameState,
  project: ScriptProject,
  session: CastingSession | null,
): Record<CastSlot, CastingCandidateView[]> {
  if (session !== null) {
    return {
      lead: session.slate.lead.map((id) => candidateView(state, project, id, 'lead')),
      antagonist: session.slate.antagonist.map((id) =>
        candidateView(state, project, id, 'antagonist'),
      ),
      support: session.slate.support.map((id) => candidateView(state, project, id, 'support')),
    }
  }
  const eligibleIds = state.talent
    .filter((talent) => talent.role === 'actor')
    .filter((talent) => currentAvailability(state, talent.id, project.writerId).available)
    .map((talent) => talent.id)
    .sort(compareId)
  return {
    lead: eligibleIds.map((id) => candidateView(state, project, id, 'lead')),
    antagonist: eligibleIds.map((id) => candidateView(state, project, id, 'antagonist')),
    support: eligibleIds.map((id) => candidateView(state, project, id, 'support')),
  }
}

function resultViews(
  state: GameState,
  project: ScriptProject,
  results: CastingResults | null,
): Record<CastSlot, AuditionEvidenceView[]> | null {
  if (results === null) return null
  return {
    lead: results.lead.map((result) => evidenceView(state, project, result, 'lead')),
    antagonist: results.antagonist.map((result) =>
      evidenceView(state, project, result, 'antagonist'),
    ),
    support: results.support.map((result) => evidenceView(state, project, result, 'support')),
  }
}

function packageForProject(state: GameState, projectId: string) {
  const packageView = scriptProjectsReadModel(state).packages.find(
    (candidate) => candidate.projectId === projectId,
  )
  if (packageView === undefined) {
    throw new Error(`castingReadModel: Ready project "${projectId}" has no package projection`)
  }
  return packageView
}

function ordinaryPackageAvailability(
  availability: ScriptPackageAvailabilityView,
): ScriptPackageAvailabilityView {
  const blockers = availability.blockers.filter((blocker) => blocker.kind !== 'casting-session')
  const canSubmitGreenlightIntent = blockers.every(
    (blocker) => blocker.kind === 'facility-capacity',
  )
  return {
    ...availability,
    knownGatesClear: blockers.length === 0,
    canSubmitGreenlightIntent,
    willQueueGreenlightIntent:
      canSubmitGreenlightIntent &&
      blockers.some((blocker) => blocker.kind === 'facility-capacity'),
    blockers,
  }
}

function projectView(
  state: GameState,
  project: ScriptProject,
  session: CastingSession | null,
): CastingProjectView {
  const concept = requireConcept(state, project.conceptId)
  const writer = requireTalent(state, project.writerId)
  const packageView = project.status === 'ready' ? packageForProject(state, project.id) : null
  const packageAvailability =
    packageView === null ? null : ordinaryPackageAvailability(packageView.availability)
  const candidates = candidatePools(state, project, session)
  const legalActions: CastingProjectActionView[] = []
  const blockers: string[] = []
  const status = session?.status ?? 'notStarted'

  if (session === null) {
    if (state.castingSessions.mode === 'managed') {
      const auditionsQueued = hasQueuedCastingSession(state.productionQueue, project.id)
      if (candidates.lead.length < 3) {
        blockers.push('At least three currently available primary Actors are required for a legal slate.')
      }
      if (auditionsQueued) {
        blockers.push('Auditions for this screenplay are already waiting in the Development & Casting queue.')
      } else if (candidates.lead.length >= 3) {
        if (scriptCapacityView(state).available === 0) {
          blockers.push(
            'Every shared Development & Casting slot is occupied; starting auditions now joins the queue.',
          )
        }
        legalActions.push({ kind: 'planAuditions', projectId: project.id, label: 'Plan auditions' })
      }
    }
    if (packageView?.openAction !== null && packageView !== null) {
      legalActions.push({ kind: 'openPackage', projectId: project.id, label: 'Open package' })
    }
  } else if (session.status === 'review') {
    const opensPackage = packageAvailability?.canSubmitGreenlightIntent ?? false
    legalActions.push({
      kind: 'acknowledgeCastingSession',
      sessionId: session.id,
      projectId: project.id,
      label: opensPackage ? 'Take results to Package' : 'Finish casting review',
      opensPackage,
    })
    blockers.push(
      ...(packageAvailability?.blockers.map((blocker) => blocker.headline) ?? [
        'This screenplay is not currently Ready to package.',
      ]),
    )
  } else if (session.status === 'complete') {
    if (packageAvailability?.canSubmitGreenlightIntent === true) {
      legalActions.push({ kind: 'openPackage', projectId: project.id, label: 'Open package' })
    }
    if (packageAvailability !== null) {
      blockers.push(...packageAvailability.blockers.map((blocker) => blocker.headline))
    }
  }

  return {
    projectId: project.id,
    sessionId: session?.id ?? null,
    title: concept.title,
    genre: concept.genre,
    writer: { id: writer.id, name: writer.name, primaryRole: writer.role },
    status,
    dueWeek: session?.dueWeek ?? null,
    weeksUntilDecision:
      session?.dueWeek === null || session?.dueWeek === undefined
        ? null
        : Math.max(0, session.dueWeek - state.market.tick),
    consequence:
      session?.status === 'auditioning'
        ? CASTING_SESSION_CONSEQUENCE
        : session?.status === 'review'
          ? 'Review is immediate and always legal; results remain advisory and select no winner.'
          : session?.status === 'complete'
            ? 'Historical audition evidence persists; current package legality still controls casting.'
            : CASTING_SESSION_CONSEQUENCE,
    candidates,
    results: resultViews(state, project, session?.results ?? null),
    packageAvailability,
    legalActions,
    blockers,
  }
}

function activationView(state: GameState): CastingSessionsReadModel['activation'] {
  if (state.castingSessions.mode === 'managed') {
    return { canActivate: false, label: 'Casting Sessions active', blocker: null }
  }
  if (state.operations.mode !== 'managed' || state.scriptDevelopment.mode !== 'managed') {
    return {
      canActivate: false,
      label: 'Enable Casting Sessions',
      blocker: 'Managed Studio Operations and Script Development must be active first.',
    }
  }
  if (!state.economyEngagedEver || state.founding !== null) {
    return {
      canActivate: false,
      label: 'Enable Casting Sessions',
      blocker: 'Finish founding the player studio first.',
    }
  }
  return { canActivate: true, label: 'Enable Casting Sessions', blocker: null }
}

/** Fresh, narrow, deterministic Casting Room projection. */
export function castingSessionsReadModel(state: GameState): CastingSessionsReadModel {
  const capacity = scriptCapacityView(state)
  const sections: CastingSessionsReadModel['sections'] = {
    readyToPlan: [],
    auditioning: [],
    needsReview: [],
    history: [],
  }
  const sessionsByProject = new Map(
    state.castingSessions.sessions.map((session) => [session.projectId, session]),
  )
  const readyProjects = state.scriptDevelopment.projects
    .filter((project) => project.status === 'ready')
    .slice()
    .sort((a, b) => compareId(a.id, b.id))
  for (const project of readyProjects) {
    const session = sessionsByProject.get(project.id) ?? null
    const view = projectView(state, project, session)
    if (session === null) sections.readyToPlan.push(view)
    else if (session.status === 'auditioning') sections.auditioning.push(view)
    else if (session.status === 'review') sections.needsReview.push(view)
    else sections.history.push(view)
  }

  for (const session of [...state.castingSessions.sessions].sort((a, b) => compareId(a.id, b.id))) {
    if (readyProjects.some((project) => project.id === session.projectId)) continue
    const project = requireProject(state, session.projectId)
    sections.history.push(projectView(state, project, session))
  }

  // Session-backed sections follow canonical session identity, not screenplay
  // identity. A player may audition script-0001 before script-0000, so sorting
  // those cards by project ID would make this board disagree with the one
  // authoritative studio-decision selector about which review comes first.
  const compareSessionView = (a: CastingProjectView, b: CastingProjectView): number => {
    if (a.sessionId === null || b.sessionId === null) {
      throw new Error('castingReadModel: session-backed section contains a project without a session')
    }
    return compareId(a.sessionId, b.sessionId)
  }
  sections.auditioning.sort(compareSessionView)
  sections.needsReview.sort(compareSessionView)
  sections.history.sort(compareSessionView)

  const firstReviewSession = nextCastingSessionNeedingReview(state.castingSessions)
  const firstReview =
    firstReviewSession === undefined
      ? undefined
      : sections.needsReview.find((project) => project.sessionId === firstReviewSession.id)
  if (firstReviewSession !== undefined && firstReview === undefined) {
    throw new Error(
      `castingReadModel: review session "${firstReviewSession.id}" has no review projection`,
    )
  }
  return {
    mode: state.castingSessions.mode,
    capacity,
    activation: activationView(state),
    sections,
    nextDecision:
      firstReview === undefined || firstReview.sessionId === null
        ? null
        : {
            kind: 'castingReview',
            sessionId: firstReview.sessionId,
            projectId: firstReview.projectId,
            title: firstReview.title,
          },
  }
}

export function nextCastingDecision(state: GameState): CastingReviewDecisionView | null {
  return castingSessionsReadModel(state).nextDecision
}
