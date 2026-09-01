// ── P04A: the Casting projection and the casting quote seam ──────────────────
//
// Package 04 (§2.2). The ONE place the bridge composes Casting for the wire:
//
//   1. `castingProjection(state)` — the read-only role-first Casting board the
//      Unity client renders: candidate pools (director/lead/antagonist/
//      support/craftLead), closed negative/marketing budget menus, screen-test
//      evidence, greenlight readiness, and queue-expiry notices.
//   2. `castingDraftToEngine(state, draft)` — the ONLY conversion from a
//      player's screen-test slate or greenlight package selection to an engine
//      payload. Unity submits exact talent/budget ids; every legality decision
//      beyond "does this ID join the live pools/menus" stays with the engine's
//      own front doors (role uniqueness, exclusivity, capacity) via the
//      deferred `apply` closure.
//   3. `castingQuoteSnapshot(...)` — the consequence summary a quote answers
//      with, built from the DISCARDED preflight successor exactly like
//      `commissionQuoteSnapshot` — nothing here is re-derived that the
//      successor (or, for a queued draft, the live read models) already states.
//
// Composes ONLY existing Core/adapter authority: `castingSessionsReadModel` +
// `castingPackageReadModel` (Lane A), `commitmentPreview`/`assignmentProjectCost`
// (economy), and the Film Package assessment boundary (`assessPackageFit` /
// `assessProfitRange` / `productionDemandView`) the greenlight-review UI
// already uses. No hidden truth — `talent.actual`, persona, temperament
// decomposition, RNG state, the run seed, hidden ceilings, burn, or runway — is
// reachable from this module's outputs (NO burn/runway/recurring delta
// anywhere on the casting quote wire — omission is law this checkpoint).

import {
  assignmentProjectCost,
  CASTING_SESSION_CONSEQUENCE,
  castingPackageReadModel,
  castingSessionsReadModel,
  commitmentPreview,
  scriptProjectsReadModel,
  type CastingPackageProjectView,
  type CastingProjectView,
  type CastingSlate,
  type GameState,
  freelancerMarketRefreshWeek,
  hiringMarketView,
  type ContractOfferView,
  type HiringCandidateView,
  type PackageCandidateView,
  type RolePoolView,
} from '../src/core/index.ts'
import {
  assessPackageFit,
  assessProfitRange,
  findConcept,
  greenlightScriptProject,
  productionDemandView,
  signContractAction,
  startCastingSessionAction,
  type ActionOutcome,
  type AssignmentFit,
  type DraftPackage,
} from '../ui/src/engine/adapter.ts'
import type {
  BridgeCastingCandidateSnapshot,
  BridgeCastingDraftPayload,
  BridgeCastingExpiryNoticeSnapshot,
  BridgeCastingProjectSnapshot,
  BridgeCastingQuoteSnapshot,
  BridgeCastingSnapshot,
} from './schema/bridge-schema.ts'

type CastingBoardWire = NonNullable<BridgeCastingSnapshot['board']>
type CastSlotPoolRole = 'lead' | 'antagonist' | 'support'
type SessionStatusWire = BridgeCastingProjectSnapshot['sessionStatus']
type AttentionWire = BridgeCastingProjectSnapshot['attention']

const ROLE_LABEL: Record<AssignmentFit['role'], string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Craft',
}

const NO_FEE_LINE = 'No casting fee is charged.'
const NO_HOLD_LINE = 'No talent hold — every candidate tested remains available elsewhere.'
const SLOT_LINE = 'Uses one shared Development & Casting slot.'
const AUDITION_QUEUE_NOTE =
  'Auditions join the Development & Casting queue. No actor is reserved or paid while the camera-test request waits.'
const GREENLIGHT_QUEUE_NOTE =
  'The greenlight joins the Development & Casting queue. No production identity, budget, or talent commitment exists until capacity reaches the package and TypeScript revalidates it.'
const RELEVANT_EXPIRY_ENTRY_KINDS = new Set(['startCastingSession', 'greenlightScriptProject'])

function compareId(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

function formatMoney(n: number): string {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? '-' : ''
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${sign}$${digits}`
}

// ── The projection ────────────────────────────────────────────────────────

function candidateSnapshot(candidate: PackageCandidateView): BridgeCastingCandidateSnapshot {
  return {
    talentId: candidate.talentId,
    name: candidate.name,
    professionLabel: candidate.professionLabel,
    contractBadge: candidate.contractBadge,
    ovr: Math.round(candidate.ovr),
    fit: Math.round(candidate.fit),
    epLow: Math.round(candidate.ep.low),
    epHigh: Math.round(candidate.ep.high),
    epExpected: Math.round(candidate.ep.expected),
    genreExperienceLabel: candidate.genreExperienceLabel,
    starPower: Math.round(candidate.starPower),
    available: candidate.available,
    availabilityLabel: candidate.availabilityLabel,
    currentWorkLabel: candidate.currentWorkLabel,
    returnWeek: candidate.returnWeek,
    projectCostAmount: candidate.projectCostAmount,
    projectCostLabel: candidate.projectCostLabel,
    signals: candidate.signals.map((signal) => ({ kind: signal.kind, text: signal.text })),
    evidence: candidate.evidence === null ? null : { ...candidate.evidence },
  }
}

function poolCandidates(
  view: CastingPackageProjectView,
  role: RolePoolView['role'],
): BridgeCastingCandidateSnapshot[] {
  return (view.pools.find((pool) => pool.role === role)?.candidates ?? []).map(candidateSnapshot)
}

function poolEvidence(view: CastingPackageProjectView, role: CastSlotPoolRole) {
  return (view.pools.find((pool) => pool.role === role)?.candidates ?? [])
    .filter((candidate) => candidate.evidence !== null)
    .map((candidate) => ({ ...candidate.evidence! }))
}

// ── The authoritative active slate ───────────────────────────────────────
//
// Identity + display name ONLY (no scores, no hidden facts). `queued` has no
// CastingSession yet — the committed slate lives on the queued
// `startCastingSession` production-queue entry's payload — so its reads are
// resolved directly against `state.talent`. `auditioning`/`review`/`complete`
// already have a real session; its slate is exactly what `sessionView.candidates`
// carries (candidatePools composes it from `session.slate` — never the general
// eligible pool — once a session exists), so it is reused rather than re-derived.

type SlateReadWire = { talentId: string; name: string }

function requireTalentName(state: GameState, talentId: string): string {
  const talent = state.talent.find((candidate) => candidate.id === talentId)
  if (talent === undefined) {
    throw new Error(`castingProjection: unknown talent "${talentId}" in the active casting slate`)
  }
  return talent.name
}

function slateReadsFromIds(state: GameState, ids: readonly string[]): SlateReadWire[] {
  return ids.map((talentId) => ({ talentId, name: requireTalentName(state, talentId) }))
}

function slateReadsFromCandidates(
  candidates: readonly { id: string; name: string }[],
): SlateReadWire[] {
  return candidates.map((candidate) => ({ talentId: candidate.id, name: candidate.name }))
}

function activeSlateFor(
  state: GameState,
  sessionStatus: SessionStatusWire,
  sessionView: CastingProjectView | undefined,
  queuedSlate: CastingSlate | undefined,
): BridgeCastingProjectSnapshot['activeSlate'] {
  if (sessionStatus === 'queued') {
    if (queuedSlate === undefined) {
      throw new Error('castingProjection: a queued screen test has no recorded slate')
    }
    return {
      lead: slateReadsFromIds(state, queuedSlate.lead),
      antagonist: slateReadsFromIds(state, queuedSlate.antagonist),
      support: slateReadsFromIds(state, queuedSlate.support),
    }
  }
  if (sessionStatus === 'auditioning' || sessionStatus === 'review' || sessionStatus === 'complete') {
    if (sessionView === undefined) {
      throw new Error('castingProjection: an active casting session has no session view')
    }
    return {
      lead: slateReadsFromCandidates(sessionView.candidates.lead),
      antagonist: slateReadsFromCandidates(sessionView.candidates.antagonist),
      support: slateReadsFromCandidates(sessionView.candidates.support),
    }
  }
  return null
}

function resultsSnapshot(view: CastingPackageProjectView): BridgeCastingProjectSnapshot['results'] {
  const lead = poolEvidence(view, 'lead')
  const antagonist = poolEvidence(view, 'antagonist')
  const support = poolEvidence(view, 'support')
  if (lead.length === 0 && antagonist.length === 0 && support.length === 0) return null
  return { lead, antagonist, support }
}

function sessionStatusFor(
  coreStatus: CastingProjectView['status'] | null,
  queued: boolean,
): SessionStatusWire {
  if (queued) return 'queued'
  return coreStatus ?? 'notStarted'
}

function attentionFor(
  sessionStatus: SessionStatusWire,
  readiness: CastingPackageProjectView['readiness'],
): AttentionWire {
  if (sessionStatus === 'review') return 'decisionRequired'
  if (sessionStatus === 'auditioning') return 'active'
  if (sessionStatus === 'queued') return 'waiting'
  if (readiness.blockers.length === 0) return 'ready'
  if (readiness.willQueue) return 'waiting'
  return 'blocked'
}

function projectSnapshot(
  state: GameState,
  view: CastingPackageProjectView,
  sessionView: CastingProjectView | undefined,
  queuedAuditionProjectIds: ReadonlySet<string>,
  queuedGreenlightProjectIds: ReadonlySet<string>,
  queuedSlate: CastingSlate | undefined,
): BridgeCastingProjectSnapshot {
  const queued = queuedAuditionProjectIds.has(view.projectId)
  const sessionStatus = sessionStatusFor(sessionView?.status ?? null, queued)
  return {
    projectId: view.projectId,
    title: view.title,
    genre: view.genre,
    writerId: view.writerId,
    writerName: view.writerName,
    sessionStatus,
    sessionId: sessionView?.sessionId ?? null,
    dueWeek: sessionView?.dueWeek ?? null,
    weeksUntilDecision: sessionView?.weeksUntilDecision ?? null,
    consequence: sessionView?.consequence ?? CASTING_SESSION_CONSEQUENCE,
    attention: attentionFor(sessionStatus, view.readiness),
    directorCandidates: poolCandidates(view, 'director'),
    leadCandidates: poolCandidates(view, 'lead'),
    antagonistCandidates: poolCandidates(view, 'antagonist'),
    supportCandidates: poolCandidates(view, 'support'),
    craftCandidates: poolCandidates(view, 'craftLead'),
    results: resultsSnapshot(view),
    activeSlate: activeSlateFor(state, sessionStatus, sessionView, queuedSlate),
    negativeOptions: view.negativeOptions.map((option) => ({ ...option })),
    marketingOptions: view.marketingOptions.map((option) => ({ ...option })),
    packageReadiness: {
      knownGatesClear: view.readiness.knownGatesClear,
      willQueue: view.readiness.willQueue,
      blockers: view.readiness.blockers.map((blocker) => ({ ...blocker })),
    },
    greenlightQueued: queuedGreenlightProjectIds.has(view.projectId),
    auditionQueued: queued,
  }
}

function expiryNotices(state: GameState): BridgeCastingExpiryNoticeSnapshot[] {
  const rows = state.studioEvents.rows.filter(
    (row): row is Extract<typeof row, { kind: 'queueIntentExpired' }> =>
      row.kind === 'queueIntentExpired' &&
      row.subjectId !== null &&
      RELEVANT_EXPIRY_ENTRY_KINDS.has(row.entryKind),
  )
  return rows
    .slice()
    .sort((a, b) => b.seq - a.seq)
    .slice(0, 8)
    .map((row) => {
      const subjectId = row.subjectId!
      const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === subjectId)
      const concept = project === undefined
        ? undefined
        : state.concepts.find((candidate) => candidate.id === project.conceptId)
      return {
        eventSeq: row.seq,
        queueOrdinal: row.ordinal,
        projectId: subjectId,
        // Fail closed to the projectId itself when the project no longer exists —
        // never guessed, never omitted.
        title: concept?.title ?? subjectId,
        reason: row.reason,
        reviewActionLabel: 'Review package',
      }
    })
}

/**
 * The role-first Casting board the Unity client renders. `board` is null
 * outside a managed screenplay studio (legacy mode, or an open founding
 * draft) — the client then shows the authored world and offers nothing,
 * exactly like `developmentProjection`.
 */
export function castingProjection(state: GameState): BridgeCastingSnapshot {
  if (state.castingSessions.mode !== 'managed' || state.founding !== null) {
    return { mode: state.castingSessions.mode, board: null }
  }
  const sessionsBoard = castingSessionsReadModel(state)
  const packageModel = castingPackageReadModel(state)
  const sessionViews = [
    ...sessionsBoard.sections.readyToPlan,
    ...sessionsBoard.sections.auditioning,
    ...sessionsBoard.sections.needsReview,
    ...sessionsBoard.sections.history,
  ]
  const queuedAuditionProjectIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'startCastingSession' ? [entry.payload.projectId] : [],
    ),
  )
  const queuedGreenlightProjectIds = new Set(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'greenlightScriptProject' ? [entry.scriptProjectId] : [],
    ),
  )
  const queuedSlateByProjectId = new Map<string, CastingSlate>(
    state.productionQueue.flatMap((entry) =>
      entry.kind === 'startCastingSession'
        ? [[entry.payload.projectId, entry.payload.slate] as const]
        : [],
    ),
  )
  const capacity = sessionsBoard.capacity
  const projects = packageModel.projects
    .slice()
    .sort((a, b) => compareId(a.projectId, b.projectId))
    .map((view) =>
      projectSnapshot(
        state,
        view,
        sessionViews.find((candidate) => candidate.projectId === view.projectId),
        queuedAuditionProjectIds,
        queuedGreenlightProjectIds,
        queuedSlateByProjectId.get(view.projectId),
      ),
    )
  const board: CastingBoardWire = {
    capacityLine:
      `${String(capacity.available)} of ${String(capacity.capacity)} Development & Casting ` +
      `${capacity.capacity === 1 ? 'slot' : 'slots'} available.`,
    projects,
    expiryNotices: expiryNotices(state),
    // P05A.3 §8/§13: the signable market + the authoritative rotation week.
    hiringCandidates: hiringMarketView(state).map(hiringCandidateSnapshot),
    freelancerMarketRefreshWeek: freelancerMarketRefreshWeek(state),
  }
  return { mode: 'managed', board }
}

// ── The casting-draft seam ────────────────────────────────────────────────

export type CastingDraftConversion =
  | {
      ok: true
      kind: 'startAuditions' | 'greenlightPicture' | 'signContract'
      apply: (state: GameState) => ActionOutcome
      commitLabel: string
      projectTitle: string
    }
  | { ok: false; error: string }

const SLOT_LABEL: Record<CastSlotPoolRole, string> = {
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

function requirePackageProject(
  state: GameState,
  projectId: string,
): CastingPackageProjectView | undefined {
  return castingPackageReadModel(state).projects.find((candidate) => candidate.projectId === projectId)
}

function screenTestConversion(
  draft: BridgeCastingDraftPayload,
  view: CastingPackageProjectView,
): CastingDraftConversion {
  const slots: readonly [CastSlotPoolRole, readonly string[] | null][] = [
    ['lead', draft.slateLead],
    ['antagonist', draft.slateAntagonist],
    ['support', draft.slateSupport],
  ]
  const slate: Partial<CastingSlate> = {}
  for (const [slot, ids] of slots) {
    if (ids === null || ids.length !== 2) {
      return { ok: false, error: `Choose exactly two ${SLOT_LABEL[slot]} candidates for the camera test.` }
    }
    const pool = poolCandidates(view, slot)
    for (const id of ids) {
      if (!pool.some((candidate) => candidate.talentId === id)) {
        return {
          ok: false,
          error: `"${id}" is not a current ${SLOT_LABEL[slot]} candidate for ${view.title}.`,
        }
      }
    }
    slate[slot] = [ids[0]!, ids[1]!]
  }
  const payload = { projectId: draft.projectId, slate: slate as CastingSlate }
  return {
    ok: true,
    kind: 'startAuditions',
    apply: (current) => startCastingSessionAction(current, payload),
    commitLabel: 'Start camera tests',
    projectTitle: view.title,
  }
}

function greenlightConversion(
  state: GameState,
  draft: BridgeCastingDraftPayload,
  view: CastingPackageProjectView,
): CastingDraftConversion {
  const readyView = scriptProjectsReadModel(state).packages.find(
    (candidate) => candidate.projectId === draft.projectId,
  )
  if (readyView === undefined) {
    return { ok: false, error: `${view.title} is not currently Ready to package.` }
  }
  const roleChoice = (
    label: string,
    poolRole: RolePoolView['role'],
    value: string | null,
  ): { ok: true; id: string } | { ok: false; error: string } => {
    if (value === null) return { ok: false, error: `Choose a ${label} before greenlighting ${view.title}.` }
    const pool = poolCandidates(view, poolRole)
    if (!pool.some((candidate) => candidate.talentId === value)) {
      return { ok: false, error: `"${value}" is not a current ${label} candidate for ${view.title}.` }
    }
    return { ok: true, id: value }
  }
  const director = roleChoice('Director', 'director', draft.directorId)
  if (!director.ok) return director
  const lead = roleChoice('Lead', 'lead', draft.castLead)
  if (!lead.ok) return lead
  const antagonist = roleChoice('Antagonist', 'antagonist', draft.castAntagonist)
  if (!antagonist.ok) return antagonist
  const support = roleChoice('Support', 'support', draft.castSupport)
  if (!support.ok) return support
  const craftLead = roleChoice('Craft Lead', 'craftLead', draft.craftLeadId)
  if (!craftLead.ok) return craftLead
  if (draft.budgetNegative === null || !view.negativeOptions.some((option) => option.amount === draft.budgetNegative)) {
    return { ok: false, error: 'Choose a published negative budget amount before greenlighting.' }
  }
  if (draft.budgetMarketing === null || !view.marketingOptions.some((option) => option.amount === draft.budgetMarketing)) {
    return { ok: false, error: 'Choose a published marketing budget amount before greenlighting.' }
  }
  const pkg: DraftPackage = {
    conceptId: readyView.concept.id,
    writerId: readyView.writer.id,
    directorId: director.id,
    craftIds: [craftLead.id],
    cast: { lead: lead.id, antagonist: antagonist.id, support: support.id },
    shape: readyView.lockedShape,
    promise: readyView.lockedPromise,
    budget: { negative: draft.budgetNegative, marketing: draft.budgetMarketing },
  }
  return {
    ok: true,
    kind: 'greenlightPicture',
    apply: (current) => greenlightScriptProject(current, draft.projectId, pkg),
    commitLabel: 'Greenlight picture',
    projectTitle: view.title,
  }
}

function hiringCandidateSnapshot(view: HiringCandidateView) {
  return {
    talentId: view.talentId,
    name: view.name,
    professionLabel: view.professionLabel,
    role: view.role,
    ovr: view.ovr,
    starPower: Math.round(view.starPower),
    genreExperienceLabel: view.genreExperienceLabel,
    kind: view.kind,
    availabilityLabel: view.availabilityLabel,
    offers: view.offers.map((offer: ContractOfferView) => ({ ...offer })),
  }
}

// ── P05A.3 §8/§10: the sign-actor conversion — existing contract authority ──

function signActorConversion(
  state: GameState,
  draft: BridgeCastingDraftPayload,
): CastingDraftConversion {
  const market = hiringMarketView(state)
  const candidate = market.find((entry) => entry.talentId === draft.signTalentId)
  if (draft.signTalentId === null || candidate === undefined) {
    return {
      ok: false,
      error: `"${draft.signTalentId ?? '<none>'}" is not currently signable — not a free agent or hiring-market candidate.`,
    }
  }
  const offer = candidate.offers.find((entry) => entry.termWeeks === draft.signTermWeeks)
  if (draft.signTermWeeks === null || offer === undefined) {
    return { ok: false, error: 'Choose a published contract term before signing.' }
  }
  return {
    ok: true,
    kind: 'signContract',
    apply: (current) => signContractAction(current, candidate.talentId, offer.termWeeks),
    commitLabel: `Sign ${candidate.name} — ${offer.termLabel}`,
    projectTitle: candidate.name,
  }
}

/**
 * The ONLY conversion from a player's screen-test slate or greenlight package
 * selection to an engine payload. Refusals here are player-facing sentences;
 * every deeper legality question (role uniqueness, exclusivity, an already-
 * cast session, capacity) is answered by the engine's own front doors when the
 * returned `apply` runs.
 */
export function castingDraftToEngine(
  state: GameState,
  draft: BridgeCastingDraftPayload,
): CastingDraftConversion {
  if (draft.kind === 'signActor') return signActorConversion(state, draft)
  const view = requirePackageProject(state, draft.projectId)
  if (view === undefined) {
    return { ok: false, error: 'This screenplay is not currently Ready to cast.' }
  }
  if (draft.kind === 'screenTest') return screenTestConversion(draft, view)
  return greenlightConversion(state, draft, view)
}

// ── The casting quote snapshot ────────────────────────────────────────────

function screenTestQuoteSnapshot(
  state: GameState,
  draft: BridgeCastingDraftPayload,
  conversion: Extract<CastingDraftConversion, { ok: true }>,
  successor: GameState,
  intentId: string,
): BridgeCastingQuoteSnapshot {
  const queues = successor.productionQueue.length > state.productionQueue.length
  const startsNow = successor.castingSessions.sessions.length > state.castingSessions.sessions.length
  const newSession = startsNow
    ? successor.castingSessions.sessions[successor.castingSessions.sessions.length - 1]
    : undefined
  const uniquePeople = new Set<string>([
    ...(draft.slateLead ?? []),
    ...(draft.slateAntagonist ?? []),
    ...(draft.slateSupport ?? []),
  ]).size
  return {
    intentId,
    kind: 'startAuditions',
    commitLabel: conversion.commitLabel,
    startsNow,
    queues,
    projectId: draft.projectId,
    title: conversion.projectTitle,
    weekLine: startsNow && newSession?.dueWeek != null
      ? `Camera tests conclude at week ${String(newSession.dueWeek)}.`
      : 'Camera tests run one week once admitted from the queue.',
    slotLine: SLOT_LINE,
    noFeeLine: NO_FEE_LINE,
    noHoldLine: NO_HOLD_LINE,
    uniquePeople,
    negative: null,
    marketing: null,
    freelancerFees: null,
    totalImmediate: null,
    cashBefore: null,
    cashAfter: null,
    affordable: null,
    strongestAssignmentLine: null,
    weakestAssignmentLine: null,
    forecastLine: null,
    setDemandLine: null,
    queueNote: queues ? AUDITION_QUEUE_NOTE : null,
    signTalentName: null,
    signTermWeeks: null,
    signWeeklySalary: null,
    signGuaranteedComp: null,
  }
}

function greenlightQuoteSnapshot(
  state: GameState,
  draft: BridgeCastingDraftPayload,
  conversion: Extract<CastingDraftConversion, { ok: true }>,
  successor: GameState,
  intentId: string,
): BridgeCastingQuoteSnapshot {
  const queues = successor.productionQueue.length > state.productionQueue.length
  const startsNow = successor.studio.activeProductions.length > state.studio.activeProductions.length
  const newProduction = startsNow
    ? successor.studio.activeProductions[successor.studio.activeProductions.length - 1]
    : undefined

  let negative: number
  let marketing: number
  let freelancerFees: number
  let cashBefore: number
  let cashAfter: number | null
  let totalImmediate: number
  if (startsNow && newProduction !== undefined) {
    negative = newProduction.budget.negative
    marketing = newProduction.budget.marketing
    cashBefore = state.studio.cash
    cashAfter = successor.studio.cash
    totalImmediate = cashBefore - cashAfter
    freelancerFees = totalImmediate - negative - marketing
  } else {
    negative = draft.budgetNegative!
    marketing = draft.budgetMarketing!
    const selectedIds = [draft.directorId!, draft.castLead!, draft.castAntagonist!, draft.castSupport!, draft.craftLeadId!]
    freelancerFees = selectedIds.reduce((sum, id) => sum + assignmentProjectCost(state, id), 0)
    totalImmediate = negative + marketing + freelancerFees
    cashBefore = state.studio.cash
    cashAfter = null
  }
  const affordable = commitmentPreview(state, totalImmediate).affordable

  const readyView = scriptProjectsReadModel(state).packages.find(
    (candidate) => candidate.projectId === draft.projectId,
  )!
  const concept = findConcept(state, readyView.concept.id)!
  const pkg: DraftPackage = {
    conceptId: readyView.concept.id,
    writerId: readyView.writer.id,
    directorId: draft.directorId!,
    craftIds: [draft.craftLeadId!],
    cast: { lead: draft.castLead!, antagonist: draft.castAntagonist!, support: draft.castSupport! },
    shape: readyView.lockedShape,
    promise: readyView.lockedPromise,
    budget: { negative, marketing },
  }
  const fit = assessPackageFit(state, pkg)
  const profit = assessProfitRange(state, pkg, draft.projectId)
  const demand = productionDemandView(state, concept, readyView.lockedShape, negative)

  return {
    intentId,
    kind: 'greenlightPicture',
    commitLabel: conversion.commitLabel,
    startsNow,
    queues,
    projectId: draft.projectId,
    title: conversion.projectTitle,
    weekLine: null,
    slotLine: null,
    noFeeLine: null,
    noHoldLine: null,
    uniquePeople: null,
    negative,
    marketing,
    freelancerFees,
    totalImmediate,
    cashBefore,
    cashAfter,
    affordable,
    strongestAssignmentLine:
      `Strongest: ${ROLE_LABEL[fit.strongest.role]} ${fit.strongest.talentName} — Fit ${String(Math.round(fit.strongest.fit))}/100.`,
    weakestAssignmentLine:
      `Weakest: ${ROLE_LABEL[fit.weakest.role]} ${fit.weakest.talentName} — Fit ${String(Math.round(fit.weakest.fit))}/100.`,
    forecastLine:
      `Forecast profit: ${formatMoney(profit.profit.low)} to ${formatMoney(profit.profit.high)} ` +
      `(expected ${formatMoney(profit.profit.expected)}).`,
    setDemandLine: demand.consequence,
    queueNote: queues ? GREENLIGHT_QUEUE_NOTE : null,
    signTalentName: null,
    signTermWeeks: null,
    signWeeklySalary: null,
    signGuaranteedComp: null,
  }
}

/**
 * The TypeScript-authored consequence summary a casting quote answers with.
 * Built from the DISCARDED preflight successor, so every startsNow/queues fact
 * and every greenlight-consequence number is the engine's own — nothing here
 * is re-derived. NO burn, NO runway, NO recurring delta anywhere on this
 * snapshot (omission is law this checkpoint).
 */
// P05A.3 §10 — the sign-contract quote: the authoritative preview of exactly
// what signing commits, from the DISCARDED preflight successor. The signing
// bonus is the immediate D-12 commitment (cashBefore − cashAfter); the weekly
// salary joins payroll, so the successor's own runway is the honest
// after-signing runway.
function signContractQuoteSnapshot(
  state: GameState,
  draft: BridgeCastingDraftPayload,
  conversion: Extract<CastingDraftConversion, { ok: true }>,
  successor: GameState,
  intentId: string,
): BridgeCastingQuoteSnapshot {
  const candidate = hiringMarketView(state).find((entry) => entry.talentId === draft.signTalentId)
  const offer = candidate?.offers.find((entry) => entry.termWeeks === draft.signTermWeeks)
  const cashBefore = state.studio.cash
  const cashAfter = successor.studio.cash
  const totalImmediate = Math.max(0, cashBefore - cashAfter)
  // The SAME D-12 read the greenlight quote publishes — never a parallel
  // restatement of solvency (preflight already refused the unaffordable case,
  // so this is the engine agreeing with itself on the wire).
  const affordable = commitmentPreview(state, totalImmediate).affordable
  return {
    intentId,
    kind: 'signContract',
    commitLabel: conversion.commitLabel,
    startsNow: true,
    queues: false,
    projectId: draft.projectId,
    title: conversion.projectTitle,
    weekLine: null,
    slotLine: null,
    noFeeLine: null,
    noHoldLine: null,
    uniquePeople: null,
    negative: null,
    marketing: null,
    freelancerFees: null,
    totalImmediate,
    cashBefore,
    cashAfter,
    affordable,
    strongestAssignmentLine: null,
    weakestAssignmentLine: null,
    forecastLine: null,
    setDemandLine: null,
    queueNote: null,
    signTalentName: candidate?.name ?? null,
    signTermWeeks: offer?.termWeeks ?? null,
    signWeeklySalary: offer?.weeklySalary ?? null,
    signGuaranteedComp: offer?.guaranteedComp ?? null,
  }
}

export function castingQuoteSnapshot(
  state: GameState,
  draft: BridgeCastingDraftPayload,
  conversion: Extract<CastingDraftConversion, { ok: true }>,
  successor: GameState,
  intentId: string,
): BridgeCastingQuoteSnapshot {
  if (conversion.kind === 'signContract')
    return signContractQuoteSnapshot(state, draft, conversion, successor, intentId)
  return conversion.kind === 'startAuditions'
    ? screenTestQuoteSnapshot(state, draft, conversion, successor, intentId)
    : greenlightQuoteSnapshot(state, draft, conversion, successor, intentId)
}
