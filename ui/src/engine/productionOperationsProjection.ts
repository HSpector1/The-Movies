// ── P05A W2 — the CLOSED Production composition (recon §5.3–§5.5, §6.1) ──────
//
// One bounded module derives every closed field of the P05 Production row and
// the Stage-local collection from engine truth the core already owns:
// reservations/bindings (operations), the one scenery legality classifier
// (sceneryLoadIn), queue waiter/holder/remedy facts (studioQueueView), sets,
// presence, the week theater, and the permanent event ledger. Nothing here is
// a new rule: every value is a restatement of an engine answer, keyed by exact
// IDs, and every failed join WITHHOLDS its own field without corrupting an
// unrelated row (law 17/21).
//
// The adapter (`studioLotSnapshot`) is the only caller; the browser and Unity
// render the result and never re-derive it.

import {
  sceneryLoadInDecision,
  studioQueueView,
} from '../../../src/core/index.ts'
import type {
  FacilityCapability,
  GameState,
  ProductionPhase,
  ProductionWorkflow,
  SceneryLoadInDecision,
  StudioQueueRemedy,
  StudioQueueView,
  StudioQueueWaiterView,
} from '../../../src/core/index.ts'
import type {
  BuildingId,
  LotBlockerHolder,
  LotPresenceProjection,
  LotProductionBlockerAnatomy,
  LotProductionOperationalState,
  LotProductionRemedyRoute,
  LotProductionTarget,
  LotProductionWrapReceipt,
  LotStageIdentity,
  LotStageLogisticsCue,
  LotStagePresentationState,
  LotStageProductionState,
  LotWeekTheater,
  LotWorksiteResolution,
  ProductionOperationsState,
} from '../lot/snapshot/StudioLotSnapshot.ts'

/**
 * Engine-owned display vocabulary for the two enums that reach player copy.
 * Player-facing strings NEVER interpolate a raw enum identifier — the W2
 * range review caught `postProduction`/`post` leaking into the blocker
 * anatomy's cause line exactly because these maps lived elsewhere.
 */
export const PRODUCTION_PHASE_LABEL: Record<ProductionPhase, string> = {
  development: 'Development',
  preProduction: 'Pre-production',
  rehearsal: 'Rehearsal',
  shooting: 'Shooting',
  postProduction: 'Post-production',
  releaseReady: 'Release Ready',
}

export const FACILITY_CAPABILITY_LABEL: Record<FacilityCapability, string> = {
  'development-casting': 'Development & Casting',
  soundstage: 'Soundstage',
  'set-scenery': 'Scenery Shop',
  post: 'Post Building',
}

/** Everything the closed-row extension adds to one base production row. */
export type ClosedProductionRowExtension = Required<
  Pick<
    ProductionOperationsState,
    | 'conceptId'
    | 'operationalState'
    | 'stateLabel'
    | 'stateWeeksRemaining'
    | 'nextMilestone'
    | 'worksiteResolution'
    | 'ownedWorksites'
    | 'primaryWorkTarget'
    | 'relatedTargets'
    | 'locateTargets'
    | 'stageFacilityId'
    | 'stageBuildingId'
    | 'currentSetId'
    | 'blockerAnatomy'
    | 'wrapReceipt'
  >
>

export type ClosedProductionComposition = {
  /** Keyed by exact productionId; one entry per active managed production. */
  rowExtensions: ReadonlyMap<string, ClosedProductionRowExtension>
  /** One row per soundstage this studio has, in engine facility order. */
  stageProductions: LotStageProductionState[]
}

type CompositionInput = {
  state: GameState
  stageIdentities: readonly LotStageIdentity[]
  stageBodyByFacilityId: ReadonlyMap<string, BuildingId>
  /** The adapter's own exact per-production world resolution. */
  locationBuildingIdByProductionId: ReadonlyMap<string, BuildingId>
  presence: LotPresenceProjection | undefined
  weekTheater: LotWeekTheater | undefined
}

const STATE_LABEL: Record<LotProductionOperationalState, string> = {
  'development-working': 'Development under way',
  'pre-production-working': 'Pre-production under way',
  'rehearsal-working': 'Company rehearsing',
  'director-required': 'Director call required',
  'scenery-in-transit': 'Scenery in transit',
  'scenery-arrival-pending': 'Scenery arrived — preparing camera',
  'legacy-load-in-acknowledgment': 'Legacy load-in needs acknowledgment',
  'ready-to-schedule': 'Ready to schedule the take',
  'shooting-working': 'Shooting',
  'resource-wait': 'Waiting for studio capacity',
  'wrapped-waiting-for-post': 'Wrapped — waiting for Post',
  'post-handoff': 'Post-production under way',
  'release-ready': 'Release Ready — awaiting your commitment',
  'release-committed': 'Committed to release',
  'status-unavailable': 'Production details unavailable',
}

const NEXT_MILESTONE: Record<LotProductionOperationalState, string> = {
  'development-working': 'Next: pre-production',
  'pre-production-working': 'Next: rehearsal on a soundstage',
  'rehearsal-working': 'Next: principal photography',
  'director-required': 'Next: call the Director',
  'scenery-in-transit': 'Next: scenery arrival',
  'scenery-arrival-pending': 'Next: camera ready',
  'legacy-load-in-acknowledgment': 'Next: acknowledge the legacy load-in',
  'ready-to-schedule': 'Next: schedule the shooting take',
  'shooting-working': 'Next: wrap → Post',
  'resource-wait': 'Next: the missing capacity frees',
  'wrapped-waiting-for-post': 'Next: Post begins',
  'post-handoff': 'Next: release ready',
  'release-ready': 'Next: your release decision',
  'release-committed': 'Releases on the next studio week',
  'status-unavailable': 'Production details unavailable',
}

function unreachableBlockerState(blocker: never): LotProductionOperationalState {
  void blocker
  return 'status-unavailable'
}

/**
 * The closed operational state (recon §5.4). Derived from phase + task + the
 * ONE scenery classifier + the persisted blocker; never from copy or history.
 */
export function closedOperationalState(
  workflow: ProductionWorkflow,
  scenery: SceneryLoadInDecision,
  /** P06A W2: the exact-ID commitment fact — presentation never re-derives it. */
  releaseCommitted: boolean,
): LotProductionOperationalState {
  const blocker = workflow.blocker
  if (blocker !== null) {
    switch (blocker.kind) {
      case 'facility-capacity':
        return workflow.phase === 'shooting' && blocker.targetPhase === 'postProduction'
          ? 'wrapped-waiting-for-post'
          : 'resource-wait'
      case 'set-unavailable':
        return 'resource-wait'
      case 'scenery-load-in':
        // Spoken by the ONE scenery classifier via the phase switch below —
        // never re-derived from the persisted blocker.
        break
      default:
        // Compile-time totality: a fourth ProductionBlocker arm fails to
        // typecheck here, and at runtime a blocked picture reads withheld —
        // never a working state (charter §5).
        return unreachableBlockerState(blocker)
    }
  }
  switch (workflow.phase) {
    case 'development':
      return 'development-working'
    case 'preProduction':
      return 'pre-production-working'
    case 'rehearsal':
      return 'rehearsal-working'
    case 'shooting': {
      const task = workflow.shootingTask
      if (task === null) return 'status-unavailable'
      switch (task.status) {
        case 'unassigned':
          return 'director-required'
        case 'blocked':
          switch (scenery.kind) {
            case 'in-transit':
              return 'scenery-in-transit'
            case 'arrived-pending':
              return 'scenery-arrival-pending'
            case 'manual-clear':
              return 'legacy-load-in-acknowledgment'
            default:
              return 'status-unavailable'
          }
        case 'ready':
          return 'ready-to-schedule'
        case 'scheduled':
        case 'completed':
          return 'shooting-working'
      }
      break
    }
    case 'postProduction':
      return 'post-handoff'
    case 'releaseReady':
      // P06A W2: ready and committed are DISTINCT closed states — the world,
      // the rail and the workspace all read this one derivation.
      return releaseCommitted ? 'release-committed' : 'release-ready'
  }
  return 'status-unavailable'
}

function facilityNameOf(state: GameState, facilityId: string): string {
  const facility = state.operations.facilities.find((candidate) => candidate.id === facilityId)
  return facility !== undefined && facility.name !== '' ? facility.name : facilityId
}

/**
 * The exact world body a facility works inside, or null. Mirrors the engine's
 * own two-authority order (`facilityBodyCentre`): authored structures first,
 * then placements. Contradictory truth (two bodies claiming one facility)
 * yields null — Locate withholds rather than guesses.
 */
/**
 * Exported for the W2 correction contract suite ONLY: the ambiguous-provider
 * arm below (two structures claiming one facility -> null, never a guess)
 * guards a state the engine's own placement invariant ("facility is provided
 * by both ...") rejects on every composition path — defense-in-depth,
 * provable only by direct call.
 */
export function facilityBuildingIdOf(state: GameState, facilityId: string): BuildingId | null {
  const structures = state.property?.structures
  if (Array.isArray(structures)) {
    const housing = structures.filter(
      (structure) =>
        Array.isArray(structure.providesFacilityIds) &&
        structure.providesFacilityIds.includes(facilityId),
    )
    if (housing.length > 1) return null
    if (housing.length === 1) return housing[0]!.id
  }
  const placements = Array.isArray(state.placement?.facilities)
    ? state.placement.facilities.filter((placed) => placed.facilityId === facilityId)
    : []
  if (placements.length !== 1) return null
  const placed = placements[0]!
  // The legacy Annex keeps its historical world address (C1-M1b).
  if (placed.parcelId === 'expansion') return 'expansion'
  return `placed-${String(placed.id)}`
}

function target(
  relationship: 'current-work' | 'related',
  resourceKind: 'facility' | 'set',
  resourceId: string,
  capability: string | null,
  label: string,
  buildingId: BuildingId | null,
  reason: string | null = null,
): LotProductionTarget {
  return {
    relationship,
    resourceKind,
    resourceId,
    capability,
    label,
    buildingId,
    locatable: buildingId !== null,
    reason: buildingId === null ? reason ?? 'No unambiguous world location for this resource.' : null,
  }
}

function queueWaiterFor(
  queue: StudioQueueView,
  productionId: string,
): StudioQueueWaiterView | undefined {
  return queue.waiters.find(
    (waiter) => waiter.kind === 'production' && waiter.id === productionId,
  )
}

function remedyRoutes(remedies: readonly StudioQueueRemedy[]): LotProductionRemedyRoute[] {
  const routes: LotProductionRemedyRoute[] = []
  for (const remedy of remedies) {
    switch (remedy.kind) {
      case 'build-blueprint':
        routes.push({
          kind: remedy.catalog === 'set' ? 'open-scenery-shop' : 'open-queue',
          label: remedy.label,
          setId: null,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'repair-set':
        routes.push({
          kind: 'open-set',
          label: `Repair ${remedy.setName}`,
          setId: remedy.setId,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'strike-and-mount':
        routes.push({
          kind: 'open-set',
          label: `Strike ${remedy.setName}`,
          setId: remedy.setId,
          holderId: null,
          freesInWeeks: null,
        })
        break
      case 'wait-for-holder':
        routes.push({
          kind: 'wait-for-holder',
          label: `Wait for ${remedy.title}`,
          setId: null,
          holderId: remedy.ownerId,
          freesInWeeks: remedy.freesInWeeks,
        })
        break
      case 'cancel-queued-intent':
        // Queue authority owns queued-intent cancellation; it is not an
        // active-Production remedy (recon §6.2) and is deliberately not routed.
        break
    }
  }
  return routes
}

function blockerAnatomyFor(
  workflow: ProductionWorkflow,
  base: { kind: LotProductionBlockerAnatomy['kind']; headline: string; detail: string; consequence: string },
  queue: StudioQueueView,
): LotProductionBlockerAnatomy {
  const waiter = queueWaiterFor(queue, workflow.productionId)
  const holders: LotBlockerHolder[] = (waiter?.occupiedBy ?? []).map((occupant) => ({
    resourceId: occupant.resourceId,
    ownerId: occupant.ownerId,
    title: occupant.title,
    activity: occupant.activity,
    freesInWeeks: occupant.freesInWeeks,
  }))
  const projected = holders
    .map((holder) => holder.freesInWeeks)
    .filter((weeks): weeks is number => weeks !== null)
  return {
    ...base,
    holders,
    projectedWeeks: projected.length === 0 ? null : Math.min(...projected),
    remedies:
      base.kind === 'facility-capacity' || base.kind === 'set-unavailable'
        ? remedyRoutes(waiter?.remedies ?? [])
        : [],
  }
}

/**
 * Wrap is automatic, so its ledger row is stamped by the TICK sink with the
 * pre-advance week (`market.tick - 1` once the week settles — the accepted
 * chronology law, see studioWeekTheater's window note). "Current" therefore
 * means: stamped by the advance that produced this week, or by this week.
 */
function isCurrentWeekStamp(rowWeek: number, week: number): boolean {
  return rowWeek === week || rowWeek === week - 1
}

function wrapReceiptFor(
  state: GameState,
  productionId: string,
): LotProductionWrapReceipt | null {
  let latest: LotProductionWrapReceipt | null = null
  for (const row of state.studioEvents.rows) {
    if (row.kind !== 'wrapped' || row.productionId !== productionId) continue
    if (latest === null || row.week > latest.wrappedWeek) {
      latest = {
        wrappedWeek: row.week,
        stageFacilityId: row.stageFacilityId,
        setId: row.setId,
        currentWeek: isCurrentWeekStamp(row.week, state.market.tick),
      }
    }
  }
  return latest
}

/** The live Stage tuple, proven by reservation + binding agreement (recon §4.2). */
/**
 * Exported for the W2 correction contract suite ONLY: the two withhold arms
 * below guard states the engine's own invariant sweep (asserted by
 * studioCalendar, which every composition entry path runs) already rejects
 * loudly — so they are defense-in-depth, provable only by direct call.
 */
export function liveStageOf(
  workflow: ProductionWorkflow,
): { stageFacilityId: string; currentSetId: string | null } | 'none' | 'withheld' {
  const stages = workflow.reservations.filter(
    (reservation) => reservation.capability === 'soundstage',
  )
  if (stages.length === 0) return 'none'
  if (stages.length > 1) return 'withheld'
  const stageFacilityId = stages[0]!.facilityId
  const bindings = workflow.bindings
  if (bindings.requiresSetBinding === false) {
    // Explicit grandfather: live Stage with lawfully null current Set.
    return { stageFacilityId, currentSetId: null }
  }
  if (bindings.stageFacilityId !== stageFacilityId) return 'withheld'
  return { stageFacilityId, currentSetId: bindings.setId ?? null }
}

export function composeClosedProduction(
  input: CompositionInput,
): ClosedProductionComposition {
  const { state } = input
  const queue = studioQueueView(state)
  const week = state.market.tick
  const rowExtensions = new Map<string, ClosedProductionRowExtension>()

  type HolderFact = {
    productionId: string
    title: string
    operationalState: LotProductionOperationalState
    currentSetId: string | null
    scenery: SceneryLoadInDecision
  }
  const holderByStageFacilityId = new Map<string, HolderFact | 'withheld'>()

  for (const production of state.studio.activeProductions) {
    const workflow = state.operations.workflows.find(
      (candidate) => candidate.productionId === production.id,
    )
    if (workflow === undefined) continue
    if (rowExtensions.has(production.id)) {
      throw new Error(
        `closedProduction: duplicate active productionId "${production.id}"`,
      )
    }
    const scenery = sceneryLoadInDecision(state, workflow, week)
    const operationalState = closedOperationalState(
      workflow,
      scenery,
      state.releaseAuthority.commitments.some(
        (row) => row.productionId === production.id,
      ),
    )
    const title =
      state.concepts.find((concept) => concept.id === production.conceptId)?.title ??
      production.conceptId

    // ── live Stage / Set ────────────────────────────────────────────────────
    const live = liveStageOf(workflow)
    const stageFacilityId = typeof live === 'object' ? live.stageFacilityId : null
    const stageBuildingId =
      stageFacilityId === null
        ? null
        : input.stageBodyByFacilityId.get(stageFacilityId) ?? null
    // A standing historical Set never populates the current Set; the live
    // tuple must also agree with the mounted world: the bound set, when named,
    // must actually stand on this stage.
    let currentSetId = typeof live === 'object' ? live.currentSetId : null
    if (currentSetId !== null && stageFacilityId !== null) {
      const set = state.sets.find((candidate) => candidate.id === currentSetId)
      if (set === undefined || set.mountedOn !== stageFacilityId) currentSetId = null
    }

    // ── worksites ───────────────────────────────────────────────────────────
    const owned: LotProductionTarget[] = workflow.reservations.map((reservation) =>
      target(
        'current-work',
        'facility',
        reservation.facilityId,
        reservation.capability,
        facilityNameOf(state, reservation.facilityId),
        reservation.capability === 'soundstage'
          ? input.stageBodyByFacilityId.get(reservation.facilityId) ?? null
          : facilityBuildingIdOf(state, reservation.facilityId),
      ),
    )
    const related: LotProductionTarget[] = []
    if (currentSetId !== null) {
      const set = state.sets.find((candidate) => candidate.id === currentSetId)
      if (set !== undefined) {
        related.push(
          target('related', 'set', set.id, null, set.name, stageBuildingId),
        )
      }
    }
    if (scenery.kind === 'in-transit' || scenery.kind === 'arrived-pending') {
      related.push(
        target(
          'related',
          'facility',
          scenery.loadIn.fromFacilityId,
          'set-scenery',
          facilityNameOf(state, scenery.loadIn.fromFacilityId),
          facilityBuildingIdOf(state, scenery.loadIn.fromFacilityId),
        ),
      )
    }

    const lawfullyNoSite =
      operationalState === 'wrapped-waiting-for-post' ||
      operationalState === 'release-ready'
    const phasePrimaryCapability =
      workflow.phase === 'development' || workflow.phase === 'preProduction'
        ? 'development-casting'
        : workflow.phase === 'rehearsal' || workflow.phase === 'shooting'
          ? 'soundstage'
          : workflow.phase === 'postProduction'
            ? 'post'
            : null
    let primaryWorkTarget: LotProductionTarget | null = null
    if (!lawfullyNoSite && phasePrimaryCapability !== null) {
      const primaryOwned = owned.find(
        (candidate) => candidate.capability === phasePrimaryCapability,
      )
      if (primaryOwned !== undefined) {
        // The adapter's own exact phase resolution names the world body for the
        // primary site (writers vs casting share one facility, so the facility
        // join alone cannot answer it).
        const exactBody = input.locationBuildingIdByProductionId.get(production.id) ?? null
        primaryWorkTarget = exactBody === null
          ? primaryOwned
          : { ...primaryOwned, buildingId: exactBody, locatable: true, reason: null }
      }
    }
    const worksiteResolution: LotWorksiteResolution = lawfullyNoSite
      ? 'none'
      : primaryWorkTarget !== null && primaryWorkTarget.locatable
        ? 'exact'
        : 'withheld'

    const locateSeen = new Set<string>()
    const locateTargets: LotProductionTarget[] = []
    for (const candidate of [
      ...(primaryWorkTarget === null ? [] : [primaryWorkTarget]),
      ...owned,
      ...related,
    ]) {
      if (!candidate.locatable || locateSeen.has(candidate.resourceId)) continue
      locateSeen.add(candidate.resourceId)
      locateTargets.push(candidate)
    }

    // ── blocker anatomy ─────────────────────────────────────────────────────
    let blockerAnatomy: LotProductionBlockerAnatomy | null = null
    const consequence =
      'The production countdown will hold while payroll and studio overhead continue each week.'
    if (workflow.blocker?.kind === 'facility-capacity') {
      const blocker = workflow.blocker
      blockerAnatomy = blockerAnatomyFor(
        workflow,
        {
          kind: 'facility-capacity',
          headline:
            operationalState === 'wrapped-waiting-for-post'
              ? 'Wrapped — waiting for Post capacity'
              : 'Held for studio capacity',
          detail: `No ${FACILITY_CAPABILITY_LABEL[blocker.capability]} slot was available for the transition to ${PRODUCTION_PHASE_LABEL[blocker.targetPhase]}.`,
          consequence,
        },
        queue,
      )
    } else if (workflow.blocker?.kind === 'set-unavailable') {
      blockerAnatomy = blockerAnatomyFor(
        workflow,
        {
          kind: 'set-unavailable',
          headline: 'Waiting for a standing set',
          detail: 'A stage is free, but no usable standing set is mounted on it.',
          consequence,
        },
        queue,
      )
    } else if (workflow.blocker?.kind === 'scenery-load-in') {
      const base = {
        kind: 'scenery-load-in' as const,
        consequence,
      }
      if (scenery.kind === 'in-transit') {
        const from = facilityNameOf(state, scenery.loadIn.fromFacilityId)
        const to = facilityNameOf(state, scenery.loadIn.toFacilityId)
        const remaining = scenery.loadIn.weeksRemaining
        blockerAnatomy = {
          ...base,
          headline: 'Scenery in transit',
          detail:
            `Scenery is en route from ${from} to ${to} · ` +
            `${String(remaining)} ${remaining === 1 ? 'week' : 'weeks'} remaining. ` +
            'Arrival is automatic — no action is required.',
          holders: [],
          projectedWeeks: remaining,
          remedies: [],
        }
      } else if (scenery.kind === 'arrived-pending') {
        blockerAnatomy = {
          ...base,
          headline: 'Scenery arrived — preparing camera',
          detail:
            'Scenery has arrived. The load-in settles on the next authoritative week — ' +
            'no acknowledgment is required.',
          holders: [],
          projectedWeeks: 1,
          remedies: [],
        }
      } else if (scenery.kind === 'manual-clear') {
        blockerAnatomy = {
          ...base,
          headline: 'Legacy load-in needs acknowledgment',
          detail: 'Legacy load-in · travel duration was not recorded.',
          holders: [],
          projectedWeeks: null,
          remedies: [],
        }
      } else {
        blockerAnatomy = {
          ...base,
          headline: 'Scenery load-in status unavailable',
          detail: 'The load-in provenance could not be derived exactly.',
          holders: [],
          projectedWeeks: null,
          remedies: [],
        }
      }
    } else if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'unassigned') {
      blockerAnatomy = {
        kind: 'director-dispatch',
        headline: 'Director call required',
        detail: 'The locked Director has not been dispatched to the stage.',
        consequence,
        holders: [],
        projectedWeeks: null,
        remedies: [],
      }
    } else if (workflow.phase === 'shooting' && workflow.shootingTask?.status === 'ready') {
      blockerAnatomy = {
        kind: 'take-scheduling',
        headline: 'Take ready to schedule',
        detail: 'The stage is ready, but the shooting take is not on this week’s schedule.',
        consequence,
        holders: [],
        projectedWeeks: null,
        remedies: [],
      }
    }

    const stateWeeksRemaining =
      scenery.kind === 'in-transit'
        ? scenery.loadIn.weeksRemaining
        : scenery.kind === 'arrived-pending'
          ? 1
          : blockerAnatomy?.projectedWeeks ?? null

    rowExtensions.set(production.id, {
      conceptId: production.conceptId,
      operationalState,
      stateLabel:
        operationalState === 'resource-wait' && workflow.blocker?.kind === 'set-unavailable'
          ? 'Waiting for a standing set'
          : STATE_LABEL[operationalState],
      stateWeeksRemaining,
      nextMilestone:
        operationalState === 'resource-wait' && workflow.blocker?.kind === 'set-unavailable'
          ? 'Next: a usable standing set'
          : NEXT_MILESTONE[operationalState],
      worksiteResolution,
      ownedWorksites: owned,
      primaryWorkTarget,
      relatedTargets: related,
      locateTargets,
      stageFacilityId,
      stageBuildingId,
      currentSetId,
      blockerAnatomy,
      wrapReceipt: wrapReceiptFor(state, production.id),
    })

    // ── stage holder bookkeeping (one holder per live Stage slot) ───────────
    if (stageFacilityId !== null) {
      const existing = holderByStageFacilityId.get(stageFacilityId)
      holderByStageFacilityId.set(
        stageFacilityId,
        existing === undefined
          ? { productionId: production.id, title, operationalState, currentSetId, scenery }
          : 'withheld',
      )
    }
  }

  // ── the Stage-local collection (recon §5.5) ───────────────────────────────
  const wrapRowsByStage = new Map<string, LotProductionWrapReceipt>()
  for (const row of state.studioEvents.rows) {
    if (row.kind !== 'wrapped' || !isCurrentWeekStamp(row.week, week)) continue
    wrapRowsByStage.set(row.stageFacilityId, {
      wrappedWeek: row.week,
      stageFacilityId: row.stageFacilityId,
      setId: row.setId,
      currentWeek: true,
    })
  }

  const stageProductions: LotStageProductionState[] = input.stageIdentities.map((stage) => {
    const holder = holderByStageFacilityId.get(stage.facilityId)
    const wrapReceipt = wrapRowsByStage.get(stage.facilityId) ?? null
    if (holder === 'withheld') {
      return {
        stageFacilityId: stage.facilityId,
        stageBuildingId: null,
        facilityLabel: stage.facilityName,
        holderProductionId: null,
        holderTitle: null,
        currentSetId: null,
        presentationState: 'withheld',
        holderCopy: null,
        theaterSubjectIds: [],
        presenceTalentIds: [],
        logistics: null,
        wrapReceipt: null,
        presentationHint: null,
      }
    }
    const buildingId = input.stageBodyByFacilityId.get(stage.facilityId) ?? null
    // Hostile-review F4: a subject rides a HOLDER's row only when the engine
    // names this exact holder as its picture (owner AND facility — the same
    // law the presence join already keeps), so an outgoing production's wrap
    // subject can never claim the NEW holder's stage. A row with NO holder
    // (dark/wrap) describes the place, not a picture, and keeps the
    // facility-scoped view — there is no holder to leak onto.
    const facilityScopedSubjects = (input.weekTheater?.subjects ?? []).filter(
      (subject) => subject.facilityId === stage.facilityId,
    )
    // ('withheld' already returned above — by here the holder is a fact or absent.)
    const holderProductionIdForSubjects =
      holder === undefined ? null : holder.productionId
    const theaterSubjectIds = (holderProductionIdForSubjects === null
      ? facilityScopedSubjects
      : facilityScopedSubjects.filter(
          (subject) => subject.productionId === holderProductionIdForSubjects,
        )
    ).map((subject) => subject.id)
    if (holder === undefined) {
      // Current ownership beats history: with NO current holder, a same-week
      // wrap receipt is a bounded 'wrap' cue; otherwise the stage is dark.
      return {
        stageFacilityId: stage.facilityId,
        stageBuildingId: buildingId,
        facilityLabel: stage.facilityName,
        holderProductionId: null,
        holderTitle: null,
        currentSetId: null,
        presentationState: wrapReceipt !== null ? 'wrap' : 'dark',
        holderCopy: null,
        theaterSubjectIds,
        presenceTalentIds: [],
        logistics: null,
        wrapReceipt,
        presentationHint: null,
      }
    }
    const presentationState: LotStagePresentationState =
      holder.operationalState === 'rehearsal-working'
        ? 'rehearsal'
        : holder.operationalState === 'scenery-in-transit' ||
            holder.operationalState === 'scenery-arrival-pending' ||
            holder.operationalState === 'legacy-load-in-acknowledgment'
          ? 'load-in'
          : holder.operationalState === 'shooting-working'
            ? 'shooting'
            : holder.operationalState === 'status-unavailable'
              ? 'withheld'
              : 'blocked'
    const presenceTalentIds = (input.presence?.people ?? [])
      .filter(
        (person) =>
          person.facilityId === stage.facilityId &&
          person.ownerId === holder.productionId &&
          person.engagement === 'production',
      )
      .map((person) => person.talentId)
    const logistics: LotStageLogisticsCue | null =
      holder.scenery.kind === 'in-transit' || holder.scenery.kind === 'arrived-pending'
        ? {
            kind: 'scenery-load-in',
            fromFacilityId: holder.scenery.loadIn.fromFacilityId,
            toFacilityId: holder.scenery.loadIn.toFacilityId,
            distance: holder.scenery.loadIn.distance,
            weeksTotal: holder.scenery.loadIn.weeks,
            weeksRemaining: holder.scenery.loadIn.weeksRemaining,
            arrived: holder.scenery.loadIn.arrived,
          }
        : null
    return {
      stageFacilityId: stage.facilityId,
      stageBuildingId: buildingId,
      facilityLabel: stage.facilityName,
      holderProductionId: holder.productionId,
      holderTitle: holder.title,
      currentSetId: holder.currentSetId,
      presentationState,
      holderCopy: `${holder.title} · ${
        holder.operationalState === 'status-unavailable'
          ? STATE_LABEL['status-unavailable']
          : STATE_LABEL[holder.operationalState]
      }`,
      theaterSubjectIds,
      presenceTalentIds,
      logistics,
      // A current holder outranks history: the receipt stays a receipt.
      wrapReceipt,
      presentationHint:
        holder.operationalState === 'director-required' ||
        holder.operationalState === 'ready-to-schedule'
          ? 'decision-required'
          : null,
    }
  })

  return { rowExtensions, stageProductions }
}
