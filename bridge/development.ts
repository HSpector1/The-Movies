// ── P03A: the Development projection and the commission-draft seam ───────────
//
// Package 03 (accepted 2d285e5) makes the physical Development building the
// primary owner of screenplay work. This module is the ONE place the bridge
// composes that story for the wire:
//
//   1. `developmentProjection(state)` — the read-only Development board the
//      Unity client renders: capacity, projects, the commission board with its
//      TypeScript-authored creative catalog, and the review context with the
//      qualitative assessment basis and the deterministic rewrite preview.
//   2. `draftToEngine(state, draft)` — the ONLY conversion from a player's
//      commission selections to an engine payload. Unity submits center
//      indices and enum ids; the range math, the genre binding, and every
//      legality decision stay here. C# never constructs a Core payload.
//
// Everything player-facing below is either read verbatim from the Script
// Projects read model or authored here in TypeScript. No hidden truth — actual
// strength, actual skills, raw premise values, formulas — is reachable from
// this module's outputs.

import {
  rewriteDecisionPreview,
  scriptAssessmentExplanation,
  scriptCapacityView,
  scriptProjectsReadModel,
  SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE,
  blueprintForConcept,
  screenplayProvenance,
  type EstimatedScriptAssessmentView,
  type GameState,
  type Genre,
  type Promise as FilmPromise,
  type FilmShape,
  type ScriptProjectCardView,
  type ScriptProjectsReadModel,
} from '../src/core/index.ts'
import { PROMISE_CENTERS, PROMISE_WIDTHS, rangeFrom } from '../src/core/grid.ts'
import type {
  BridgeCommissionDraftPayload,
  BridgeCommissionQuoteSnapshot,
  BridgeDevelopmentSnapshot,
} from './schema/bridge-schema.ts'
import {
  commissionScriptAction,
  developmentOfficeUplift,
  type ActionOutcome,
} from '../ui/src/engine/adapter.ts'
import {
  commissionOriginalScreenplayAction,
  deliveredScreenplaySentence,
  originalDraftEstimate,
} from '../ui/src/engine/screenplay.ts'
import { PROMISE_AXIS_INFO, SHAPE_DESCRIPTIONS, genreLabel } from '../ui/src/content.ts'

// ── Closed creative vocabulary (identical to the browser form's option sets) ──

export const DRAFT_OPENINGS = ['immediateAction', 'slowSetup', 'mysteryHook'] as const
export const DRAFT_MIDPOINTS = ['reversal', 'escalation', 'revelation'] as const
export const DRAFT_ENDINGS = ['triumph', 'bittersweet', 'tragic', 'ambiguous'] as const
export const DRAFT_SEGMENTS = ['youngAdult', 'family', 'adult', 'prestige'] as const
export const DRAFT_GENRES = ['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'] as const
export const DRAFT_AXES = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const

const ROLE_LABEL: Record<string, string> = {
  writer: 'Writer',
  director: 'Director',
  actor: 'Actor',
  craft: 'Craft',
}

function segmentLabel(segment: string): string {
  if (segment === 'youngAdult') return 'Young adult'
  return segment.charAt(0).toUpperCase() + segment.slice(1)
}

function centerLabels(axis: (typeof DRAFT_AXES)[number]): string[] {
  const info = PROMISE_AXIS_INFO[axis]
  return [
    info.low,
    `Leans ${info.low.toLowerCase()}`,
    `Leans ${info.high.toLowerCase()}`,
    info.high,
  ]
}

/** Static, TypeScript-authored creative vocabulary for the commission workspace. */
const COMMISSION_CATALOG = {
  openings: DRAFT_OPENINGS.map((id) => ({ id, title: SHAPE_DESCRIPTIONS[id].title })),
  midpoints: DRAFT_MIDPOINTS.map((id) => ({ id, title: SHAPE_DESCRIPTIONS[id].title })),
  endings: DRAFT_ENDINGS.map((id) => ({ id, title: SHAPE_DESCRIPTIONS[id].title })),
  segments: DRAFT_SEGMENTS.map((id) => ({ id, label: segmentLabel(id) })),
  genres: DRAFT_GENRES.map((id) => ({ id, label: genreLabel(id) })),
  promiseAxes: DRAFT_AXES.map((id) => ({
    id,
    title: PROMISE_AXIS_INFO[id].title,
    description: PROMISE_AXIS_INFO[id].desc,
    centerLabels: centerLabels(id),
  })),
} as const

const NO_FEE_LINE =
  'No separate screenplay acquisition fee is charged. The studio still carries payroll and overhead while the week passes.'
const QUEUE_CONSEQUENCE =
  'The request joins the Development & Casting queue. No writer, screenplay identity, cost, or room is committed until it reaches the front and is revalidated.'
const CASTING_BOUNDARY_LINE = 'Development work is complete — continue at Casting.'
const IDLE_WORLD_STATUS = 'Screenplays commissioned, written, and reviewed here'
const REVIEW_PENNANT = '★ SCREENPLAY READY\nReview the draft at Development'

function formatEstScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

// ── The projection ───────────────────────────────────────────────────────────

function assessmentSnapshot(view: EstimatedScriptAssessmentView | null) {
  if (view === null) return null
  return {
    label: view.label as string,
    score: view.score,
    band: view.band,
    strengths: [...view.strengths],
    concerns: [...view.concerns],
  }
}

function capacitySnapshot(state: GameState) {
  const capacity = scriptCapacityView(state)
  return {
    capacity: capacity.capacity,
    occupied: capacity.occupied,
    available: capacity.available,
    facilities: capacity.facilities.map((facility) => ({
      facilityId: facility.facilityId,
      facilityName: facility.facilityName,
      capacity: facility.capacity,
      occupied: facility.occupied,
      available: facility.available,
      slots: facility.slots.map((slot) => ({
        slot: slot.slot,
        occupant: slot.occupant === null
          ? null
          : {
              owner: slot.occupant.owner,
              ownerId: slot.occupant.ownerId,
              activity: slot.occupant.activity,
              title: slot.occupant.title,
              label: slot.occupant.label,
            },
      })),
    })),
  }
}

function projectSlot(
  capacity: ReturnType<typeof capacitySnapshot>,
  projectId: string,
): { facilityName: string | null; slot: number | null } {
  for (const facility of capacity.facilities) {
    for (const slot of facility.slots) {
      if (slot.occupant !== null && slot.occupant.owner === 'script' && slot.occupant.ownerId === projectId) {
        return { facilityName: facility.facilityName, slot: slot.slot }
      }
    }
  }
  return { facilityName: null, slot: null }
}

function projectSnapshot(
  card: ScriptProjectCardView,
  capacity: ReturnType<typeof capacitySnapshot>,
) {
  const seat = projectSlot(capacity, card.projectId)
  return {
    projectId: card.projectId,
    section: card.section,
    title: card.title,
    genre: card.genre,
    status: card.status,
    statusLabel: card.lifecycleLabel,
    rewriteCount: card.rewriteCount,
    dueWeek: card.dueWeek,
    weeksUntilDecision: card.weeksUntilDecision,
    writerId: card.writer.id,
    writerName: card.writer.name,
    consequence: card.consequence,
    assessment: assessmentSnapshot(card.assessment),
    facilityName: seat.facilityName,
    slot: seat.slot,
  }
}

function promiseLine(axis: (typeof DRAFT_AXES)[number], range: readonly [number, number]): string {
  const middle = (range[0] + range[1]) / 2
  let nearest = 0
  for (let index = 1; index < PROMISE_CENTERS.length; index++) {
    if (Math.abs(PROMISE_CENTERS[index] - middle) < Math.abs(PROMISE_CENTERS[nearest] - middle)) {
      nearest = index
    }
  }
  return `${PROMISE_AXIS_INFO[axis].title}: ${centerLabels(axis)[nearest]}`
}

function briefSnapshot(shape: FilmShape, promise: FilmPromise) {
  return {
    openingTitle: SHAPE_DESCRIPTIONS[shape.opening]?.title ?? shape.opening,
    midpointTitle: SHAPE_DESCRIPTIONS[shape.midpoint]?.title ?? shape.midpoint,
    endingTitle: SHAPE_DESCRIPTIONS[shape.ending]?.title ?? shape.ending,
    segmentLabels: promise.intendedSegments.map((segment) => segmentLabel(segment)),
    promiseLines: [
      promiseLine('intimacy', promise.ranges.intimacy),
      promiseLine('tonalWeight', promise.ranges.tonalWeight),
      promiseLine('kineticEnergy', promise.ranges.kineticEnergy),
    ],
  }
}

type DevelopmentBoardWire = NonNullable<BridgeDevelopmentSnapshot['board']>

function reviewSnapshot(
  state: GameState,
  board: ScriptProjectsReadModel,
): DevelopmentBoardWire['review'] {
  const decision = board.nextDecision
  if (decision === null) return null
  const card = board.sections.needsReview.find((entry) => entry.projectId === decision.projectId)
  if (card === undefined || card.assessment === null) return null
  const project = state.scriptDevelopment.projects.find((entry) => entry.id === card.projectId)
  if (project === undefined) return null
  const explanationLines = scriptAssessmentExplanation(state, card.projectId) ?? []
  // Provenance is supporting colour and may be withheld; it never gates the decision.
  let provenanceLabel: string | null = null
  let deliveryLine: string | null = null
  try {
    const blueprint = blueprintForConcept(state.originalScreenplays, project.conceptId)
    const provenance = screenplayProvenance(blueprint, card.writer.name)
    provenanceLabel = provenance.label
    if (provenance.origin === 'original') {
      deliveryLine = deliveredScreenplaySentence(card.writer.name, card.title)
    }
  } catch {
    provenanceLabel = null
    deliveryLine = null
  }
  const acceptAction = decision.legalActions.find((action) => action.kind === 'acceptScript')
  if (acceptAction === undefined) return null
  const rewriteAction = decision.legalActions.find(
    (action) => action.kind === 'requestScriptRewrite',
  )
  const preview = rewriteAction === undefined ? null : rewriteDecisionPreview(state, card.projectId)
  const reviewState = card.rewriteCount === 0 ? 'first-draft' : 'final-draft'
  return {
    projectId: card.projectId,
    title: card.title,
    genre: card.genre,
    reviewState,
    writerId: card.writer.id,
    writerName: card.writer.name,
    writerRoleLabel: ROLE_LABEL[card.writer.primaryRole] ?? card.writer.primaryRole,
    provenanceLabel,
    deliveryLine,
    assessment: assessmentSnapshot(card.assessment),
    whyThisEstimate: explanationLines.map((line) => ({
      label: line.label,
      finding: line.finding,
      tone: line.tone,
    })),
    brief: briefSnapshot(project.shape, project.promise),
    consequence: card.consequence,
    accept: {
      label: acceptAction.label,
      lines: [
        'Ready to package immediately.',
        'No time, cash, capacity, or RNG is consumed.',
        `Keeps the current Est. ${formatEstScore(card.assessment.score)} · ${card.assessment.band} assessment.`,
      ],
    },
    rewrite: {
      available: rewriteAction !== undefined,
      label: rewriteAction?.label ?? null,
      blockers: card.blockers.map((blocker) => ({ ...blocker })),
      preview: preview === null
        ? null
        : {
            currentScore: preview.currentScore,
            currentBand: preview.currentBand,
            projectedScore: preview.projectedScore,
            projectedBand: preview.projectedBand,
            delta: preview.delta,
            direction: preview.direction,
            currentLine: preview.currentLine,
            projectedLine: preview.projectedLine,
            directionLine: preview.directionLine,
            dueWeek: preview.dueWeek,
            writerName: preview.writerName,
            capacityLine: preview.capacityLine,
            operatingLine: preview.operatingLine,
            projectionNote: preview.projectionNote,
          },
    },
    finalNote: reviewState === 'final-draft'
      ? 'The final rewrite is complete. No further rewrite is available.'
      : null,
  }
}

function commissionSnapshot(state: GameState, board: ScriptProjectsReadModel) {
  const uplift = developmentOfficeUplift(state)
  return {
    canStart: board.commission.canStart,
    canStartOriginal: board.commission.canStartOriginal,
    canSubmitMarketIntent: board.commission.canSubmitMarketIntent,
    canSubmitOriginalIntent: board.commission.canSubmitOriginalIntent,
    willQueueIntent: board.commission.willQueueIntent,
    consequence: board.commission.consequence,
    concepts: board.commission.concepts.map((concept) => ({
      id: concept.id,
      title: concept.title,
      genre: concept.genre,
      provenanceLabel: concept.provenance.label,
      origin: concept.provenance.origin,
    })),
    writers: board.commission.writers.map((writer) => ({
      id: writer.id,
      name: writer.name,
      primaryRole: writer.primaryRole,
      estimateLabel: writer.writingEstimate.label as string,
      estimateScore: writer.writingEstimate.score,
      available: writer.available,
      assignmentLabel: writer.assignmentLabel,
    })),
    blockers: board.commission.blockers.map((blocker) => ({ ...blocker })),
    officeUplift: uplift === null
      ? null
      : {
          name: uplift.name,
          points: uplift.points,
          line: `${uplift.name} will add ${String(uplift.points)} points of estimated strength to this draft.`,
        },
    catalog: {
      openings: COMMISSION_CATALOG.openings.map((entry) => ({ ...entry })),
      midpoints: COMMISSION_CATALOG.midpoints.map((entry) => ({ ...entry })),
      endings: COMMISSION_CATALOG.endings.map((entry) => ({ ...entry })),
      segments: COMMISSION_CATALOG.segments.map((entry) => ({ ...entry })),
      genres: COMMISSION_CATALOG.genres.map((entry) => ({ ...entry })),
      promiseAxes: COMMISSION_CATALOG.promiseAxes.map((entry) => ({
        id: entry.id,
        title: entry.title,
        description: entry.description,
        centerLabels: [...entry.centerLabels],
      })),
    },
  }
}

function worldVoices(board: ScriptProjectsReadModel): {
  worldStatus: string
  attentionPennant: string | null
  castingBoundaryLine: string | null
} {
  const review = board.sections.needsReview[0]
  if (board.nextDecision !== null && review !== undefined) {
    return {
      worldStatus: `Decision required · ${review.title} awaits review`,
      attentionPennant: REVIEW_PENNANT,
      castingBoundaryLine: null,
    }
  }
  const active = board.sections.inDevelopment[0]
  if (active !== undefined) {
    return {
      worldStatus: `${active.lifecycleLabel} · ${active.title}`,
      attentionPennant: null,
      castingBoundaryLine: null,
    }
  }
  const ready = board.sections.readyToPackage[0]
  if (ready !== undefined) {
    return {
      worldStatus: `Ready to package · ${ready.title}`,
      attentionPennant: null,
      castingBoundaryLine: CASTING_BOUNDARY_LINE,
    }
  }
  if (board.lotAttention.kind === 'capacity-constraint') {
    return {
      worldStatus: board.lotAttention.headline,
      attentionPennant: null,
      castingBoundaryLine: null,
    }
  }
  return { worldStatus: IDLE_WORLD_STATUS, attentionPennant: null, castingBoundaryLine: null }
}

/**
 * The Development projection the bundle carries. `board` is null outside a
 * managed screenplay studio (legacy mode, or an open founding draft) — the
 * client then shows the authored world and offers nothing.
 */
export function developmentProjection(state: GameState): BridgeDevelopmentSnapshot {
  if (state.scriptDevelopment.mode !== 'managed' || state.founding !== null) {
    return { mode: state.scriptDevelopment.mode, board: null }
  }
  const board = scriptProjectsReadModel(state)
  const capacity = capacitySnapshot(state)
  const cards = [
    ...board.sections.needsReview,
    ...board.sections.inDevelopment,
    ...board.sections.readyToPackage,
    ...board.sections.productionHistory,
  ]
  const voices = worldVoices(board)
  return {
    mode: board.mode,
    board: {
      worldStatus: voices.worldStatus,
      attentionPennant: voices.attentionPennant,
      castingBoundaryLine: voices.castingBoundaryLine,
      attention: {
        kind: board.lotAttention.kind,
        headline: board.lotAttention.headline,
        detail: board.lotAttention.detail,
      },
      capacity,
      projects: cards.map((card) => projectSnapshot(card, capacity)),
      commission: commissionSnapshot(state, board),
      review: reviewSnapshot(state, board),
    },
  }
}

// ── The commission-draft seam ────────────────────────────────────────────────

export type BridgeCommissionDraft = BridgeCommissionDraftPayload

export type DraftConversion =
  | {
      ok: true
      kind: 'commissionScreenplay' | 'commissionOriginalScreenplay'
      apply: (state: GameState) => ActionOutcome
      conceptTitle: string | null
      genre: Genre
      writerName: string
    }
  | { ok: false; error: string }

function centerRange(index: number): readonly [number, number] {
  const center = PROMISE_CENTERS[index]
  if (center === undefined) {
    throw new Error('commission draft: promise center index is outside the authored grid')
  }
  // The form law: the player chooses the CENTER; the width is pinned at the
  // second authored width, exactly as the browser commission form pins it.
  return rangeFrom(center, PROMISE_WIDTHS[1])
}

/**
 * The ONLY conversion from a player's commission selections to an engine
 * payload. Refusals here are player-facing sentences; every deeper legality
 * question is answered by the engine's own front doors when the returned
 * `apply` runs.
 */
export function draftToEngine(state: GameState, draft: BridgeCommissionDraft): DraftConversion {
  const board = scriptProjectsReadModel(state)
  const segments = [...new Set(draft.intendedSegments)]
  if (segments.length === 0) {
    return { ok: false, error: 'Choose at least one intended audience for the picture.' }
  }
  for (const segment of segments) {
    if (!DRAFT_SEGMENTS.includes(segment as (typeof DRAFT_SEGMENTS)[number])) {
      return { ok: false, error: `"${segment}" is not an intended audience the studio recognizes.` }
    }
  }
  const writer = board.commission.writers.find((candidate) => candidate.id === draft.writerId)
  if (writer === undefined) {
    return { ok: false, error: 'The selected writer is not on the current commission board.' }
  }
  if (!writer.available) {
    return {
      ok: false,
      error: writer.assignmentLabel === null
        ? `${writer.name} is not available for a new screenplay.`
        : `${writer.name} is not available: ${writer.assignmentLabel}.`,
    }
  }
  const shape = {
    opening: draft.opening,
    midpoint: draft.midpoint,
    ending: draft.ending,
  } as FilmShape
  const ranges = {
    intimacy: centerRange(draft.intimacyCenter),
    tonalWeight: centerRange(draft.tonalWeightCenter),
    kineticEnergy: centerRange(draft.kineticEnergyCenter),
  } as FilmPromise['ranges']
  if (draft.source === 'market') {
    if (draft.conceptId === null) {
      return { ok: false, error: 'A market commission names the premise it adapts.' }
    }
    const concept = board.commission.concepts.find((candidate) => candidate.id === draft.conceptId)
    if (concept === undefined) {
      return { ok: false, error: 'The selected premise is no longer on the market board.' }
    }
    const payload = {
      conceptId: concept.id,
      writerId: writer.id,
      shape,
      promise: {
        genre: concept.genre,
        intendedSegments: segments,
        ranges,
      } as FilmPromise,
    }
    return {
      ok: true,
      kind: 'commissionScreenplay',
      apply: (current) => commissionScriptAction(current, payload),
      conceptTitle: concept.title,
      genre: concept.genre,
      writerName: writer.name,
    }
  }
  if (draft.genre === null) {
    return { ok: false, error: 'An original commission names its genre.' }
  }
  if (!DRAFT_GENRES.includes(draft.genre as (typeof DRAFT_GENRES)[number])) {
    return { ok: false, error: `"${draft.genre}" is not a genre this studio makes pictures in.` }
  }
  const genre = draft.genre as Genre
  const payload = {
    writerId: writer.id,
    genre,
    shape,
    promise: {
      genre,
      intendedSegments: segments,
      ranges,
    } as FilmPromise,
  }
  return {
    ok: true,
    kind: 'commissionOriginalScreenplay',
    apply: (current) => commissionOriginalScreenplayAction(current, payload),
    conceptTitle: null,
    genre,
    writerName: writer.name,
  }
}

/**
 * The TypeScript-authored consequence summary a quote answers with. Built from
 * the DISCARDED preflight successor, so every number is the engine's own.
 */
export function commissionQuoteSnapshot(
  state: GameState,
  draft: BridgeCommissionDraft,
  conversion: Extract<DraftConversion, { ok: true }>,
  successor: GameState,
  intentId: string,
): BridgeCommissionQuoteSnapshot {
  const queues = successor.productionQueue.length > state.productionQueue.length
  const started = successor.scriptDevelopment.projects.length > state.scriptDevelopment.projects.length
  const newProject = started
    ? successor.scriptDevelopment.projects[successor.scriptDevelopment.projects.length - 1]
    : undefined
  const original = conversion.kind === 'commissionOriginalScreenplay'
  const draftWeeks = newProject?.dueWeek == null
    ? null
    : newProject.dueWeek - newProject.commissionedWeek
  const estimate = original && !queues
    ? originalDraftEstimate(state, { writerId: draft.writerId, genre: conversion.genre })
    : null
  const uplift = developmentOfficeUplift(state)
  return {
    intentId,
    kind: conversion.kind,
    commitLabel: queues
      ? original ? 'Queue original screenplay commission' : 'Queue screenplay commission'
      : original ? 'Commission an original screenplay' : 'Commission screenplay',
    startsNow: started,
    queues,
    title: conversion.conceptTitle,
    writerName: conversion.writerName,
    draftWeeks,
    reviewWeek: newProject?.dueWeek ?? null,
    consequence: queues
      ? QUEUE_CONSEQUENCE
      : estimate !== null
        ? estimate.consequence
        : SCRIPT_DEVELOPMENT_WEEK_CONSEQUENCE,
    paceNote: estimate === null ? null : estimate.pace,
    richnessNote: estimate !== null && estimate.richnessWeeks > 0
      ? `Your development offices write a richer script, which adds ${String(estimate.richnessWeeks)} ${estimate.richnessWeeks === 1 ? 'week' : 'weeks'} to it.`
      : null,
    officeUpliftLine: queues || uplift === null
      ? null
      : `${uplift.name} will add ${String(uplift.points)} points of estimated strength to this draft.`,
    noFeeLine: NO_FEE_LINE,
    queueNote: queues
      ? 'No writer, screenplay identity, cost, or room is committed until it reaches the front and is revalidated.'
      : null,
  }
}
