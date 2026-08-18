// ── Script Projects V1 ───────────────────────────────────────────────────────
// Authoritative, deterministic screenplay development. This module is pure: it
// consumes no RNG, reads no wall clock, performs no I/O, and mutates no input.

import { clamp } from './math.js'
import { facilitySlotKey, occupiedResourceSlots, screenplayOccupiedSlotKeys } from './occupancy.js'
import { resolveShape } from './shape.js'
import { effectiveSkill } from './talentSummary.js'
import type {
  CommissionScriptPayload,
  Contract,
  DevelopmentCastingOccupancy,
  FilmConcept,
  FilmResult,
  FilmShape,
  Production,
  Promise as FilmPromise,
  ScriptAssessment,
  ScriptDevelopment,
  ScriptProject,
  ScriptReservation,
  ScriptWriterAssignment,
  StudioOperations,
  Talent,
} from './types.js'

const ACTIVE_SCRIPT_STATUSES = new Set<ScriptProject['status']>(['drafting', 'rewriting'])
const OPENINGS = new Set<FilmShape['opening']>(['immediateAction', 'slowSetup', 'mysteryHook'])
const MIDPOINTS = new Set<FilmShape['midpoint']>(['reversal', 'escalation', 'revelation'])
const ENDINGS = new Set<FilmShape['ending']>(['triumph', 'bittersweet', 'tragic', 'ambiguous'])
const SEGMENTS = new Set(['youngAdult', 'family', 'adult', 'prestige'])

export function emptyScriptDevelopment(): ScriptDevelopment {
  return { mode: 'legacy', projects: [] }
}

export function initialManagedScriptDevelopment(): ScriptDevelopment {
  return { mode: 'managed', projects: [] }
}

export function canonicalScriptProjectId(index: number): string {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`script development: project index must be a non-negative integer, got ${String(index)}`)
  }
  return `script-${String(index).padStart(4, '0')}`
}

export function nextScriptProjectId(development: ScriptDevelopment): string {
  return canonicalScriptProjectId(development.projects.length)
}

function cloneShape(shape: FilmShape): FilmShape {
  return { opening: shape.opening, midpoint: shape.midpoint, ending: shape.ending }
}

function cloneRange(range: readonly [number, number]): [number, number] {
  return [range[0], range[1]]
}

function clonePromise(promise: FilmPromise): FilmPromise {
  return {
    genre: promise.genre,
    intendedSegments: [...promise.intendedSegments],
    ranges: {
      intimacy: cloneRange(promise.ranges.intimacy),
      tonalWeight: cloneRange(promise.ranges.tonalWeight),
      kineticEnergy: cloneRange(promise.ranges.kineticEnergy),
    },
  }
}

// The bare allocation key now belongs to `occupancy.ts`, which owns every read of
// a persisted reservation. Re-exported here because this module has been its
// public address since V9.
export { facilitySlotKey }

// The shared-capacity interface consumed by Production Operations allocation.
//
// C2a-M0: this module no longer implements it. Both this helper and the private
// `productionOccupiedFacilitySlots` copy that used to sit beside it were hand
// traversals of the persisted roots; `occupancy.ts` owns that reading now, and
// this is the V9 public address kept pointing at it.
export { screenplayOccupiedSlotKeys as scriptOccupiedFacilitySlots }

export function developmentCastingOccupancy(
  operations: StudioOperations,
  development: ScriptDevelopment,
): DevelopmentCastingOccupancy[] {
  const facilityById = new Map(operations.facilities.map((facility) => [facility.id, facility]))
  const occupancy: DevelopmentCastingOccupancy[] = []

  for (const workflow of operations.workflows) {
    for (const reservation of workflow.reservations) {
      if (reservation.capability !== 'development-casting') continue
      const facility = facilityById.get(reservation.facilityId)
      if (facility === undefined) {
        throw new Error(
          `script development: production reservation references unknown facility "${reservation.facilityId}"`,
        )
      }
      occupancy.push({
        facilityId: facility.id,
        facilityName: facility.name,
        slot: reservation.slot,
        owner: 'production',
        ownerId: workflow.productionId,
        activity: 'production-development',
      })
    }
  }

  for (const project of development.projects) {
    if (project.reservation === null) continue
    const facility = facilityById.get(project.reservation.facilityId)
    if (facility === undefined) {
      throw new Error(
        `script development: project "${project.id}" reservation references unknown facility "${project.reservation.facilityId}"`,
      )
    }
    if (project.status !== 'drafting' && project.status !== 'rewriting') {
      throw new Error(
        `script development: project "${project.id}" has a reservation while ${project.status}`,
      )
    }
    occupancy.push({
      facilityId: facility.id,
      facilityName: facility.name,
      slot: project.reservation.slot,
      owner: 'script',
      ownerId: project.id,
      activity: project.status,
    })
  }

  return occupancy.sort((a, b) => {
    if (a.facilityId !== b.facilityId) return a.facilityId < b.facilityId ? -1 : 1
    if (a.slot !== b.slot) return a.slot - b.slot
    if (a.owner !== b.owner) return a.owner === 'production' ? -1 : 1
    return a.ownerId < b.ownerId ? -1 : a.ownerId > b.ownerId ? 1 : 0
  })
}

export function availableDevelopmentCastingSlots(
  operations: StudioOperations,
  development: ScriptDevelopment,
  externallyOccupiedSlots: ReadonlySet<string>,
): number {
  const capacity = operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .reduce((sum, facility) => sum + facility.capacity, 0)
  const occupied = new Set(externallyOccupiedSlots)
  for (const entry of developmentCastingOccupancy(operations, development)) {
    occupied.add(facilitySlotKey(entry.facilityId, entry.slot))
  }
  return Math.max(0, capacity - occupied.size)
}

export function allocateScriptReservation(
  operations: StudioOperations,
  development: ScriptDevelopment,
  projectId: string,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): ScriptReservation | null {
  const occupied = new Set(externallyOccupiedSlots)
  // Productions and every OTHER screenplay, from the one union producer.
  for (const key of occupiedResourceSlots(
    { operations, scriptDevelopment: development },
    {
      owners: ['production', 'screenplay'],
      excludeOwner: 'screenplay',
      excludeOwnerId: projectId,
    },
  ).keys()) {
    occupied.add(key)
  }

  const facilities = operations.facilities
    .filter((facility) => facility.capability === 'development-casting')
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  for (const facility of facilities) {
    for (let slot = 0; slot < facility.capacity; slot++) {
      if (occupied.has(facilitySlotKey(facility.id, slot))) continue
      return {
        projectId,
        facilityId: facility.id,
        capability: 'development-casting',
        slot,
      }
    }
  }
  return null
}

function requireManaged(development: ScriptDevelopment, action: string): void {
  if (development.mode !== 'managed') {
    throw new Error(`script development: ${action} rejected — screenplay development is not managed`)
  }
}

function requireProject(
  development: ScriptDevelopment,
  projectId: string,
  action: string,
): ScriptProject {
  const project = development.projects.find((candidate) => candidate.id === projectId)
  if (project === undefined) {
    throw new Error(`script development: ${action} references unknown project "${projectId}"`)
  }
  return project
}

function replaceProject(
  development: ScriptDevelopment,
  replacement: ScriptProject,
): ScriptDevelopment {
  return {
    ...development,
    projects: development.projects.map((project) =>
      project.id === replacement.id ? replacement : project,
    ),
  }
}

export function commissionScriptProject(
  development: ScriptDevelopment,
  operations: StudioOperations,
  payload: CommissionScriptPayload,
  commissionedWeek: number,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): ScriptDevelopment {
  requireManaged(development, 'commission')
  if (operations.mode !== 'managed') {
    throw new Error(
      'script development: commission rejected — managed Studio Operations are not active',
    )
  }
  if (!Number.isInteger(commissionedWeek) || commissionedWeek < 0) {
    throw new Error('script development: commission week must be a non-negative integer')
  }
  if (development.projects.some((project) => project.conceptId === payload.conceptId)) {
    throw new Error(
      `script development: commission rejected — concept "${payload.conceptId}" already owns a screenplay project`,
    )
  }
  if (
    development.projects.some(
      (project) => ACTIVE_SCRIPT_STATUSES.has(project.status) && project.writerId === payload.writerId,
    )
  ) {
    throw new Error(
      `script development: commission rejected — writer "${payload.writerId}" already has an active screenplay task`,
    )
  }

  const id = nextScriptProjectId(development)
  const reservation = allocateScriptReservation(
    operations,
    development,
    id,
    externallyOccupiedSlots,
  )
  if (reservation === null) {
    throw new Error(
      'script development: commission rejected — no Development & Casting slot is available',
    )
  }
  const project: ScriptProject = {
    id,
    conceptId: payload.conceptId,
    writerId: payload.writerId,
    // C2a-M1 (§8.1, owner ruling `00E`.9): the bounded writers list lands with
    // the V14 schema carrying exactly the writer the project already has. M3's
    // pooling adds the rest; nothing reads it before then, and a commission that
    // named one writer says so.
    writerIds: [payload.writerId],
    shape: cloneShape(payload.shape),
    promise: clonePromise(payload.promise),
    status: 'drafting',
    rewriteCount: 0,
    commissionedWeek,
    dueWeek: commissionedWeek + 1,
    assessment: null,
    reservation,
    productionId: null,
  }
  return { ...development, projects: [...development.projects, project] }
}

/**
 * C1-M4 — the Development Office uplift.
 *
 * WHERE IT LANDS AND WHY HERE: this is the one place a screenplay's strength is
 * decided. Everything downstream — the review EST, the forecast, the greenlight,
 * the release, the autopsy — reads the STORED result of this function. Putting
 * the uplift anywhere else would mean deciding a script's quality in two places.
 *
 * FIRST DRAFT ONLY. A rewrite starts from the stored assessment, which already
 * carries the uplift, and adds its own delta from the writer's rewriting skill.
 * Applying the office again there would compound it every rewrite and make the
 * right play "rewrite forever". The office shapes what a script BECOMES when it
 * is written; improving one that already exists is the rewrite's own law.
 *
 * WHEN IT IS READ, AND WHAT DEMOLITION DOES: the uplift is read at the tick that
 * WRITES the draft, and the result is persisted on the project. So a screenplay
 * is never un-written by demolition — once an assessment exists it is permanent,
 * and demolishing the office cannot change a single existing project's EST,
 * forecast, or release. The one week that behaves differently is a script
 * commissioned but not yet drafted: its draft is written by whatever offices are
 * standing when the writer finishes, which is the honest answer to "was the work
 * done there?".
 *
 * SPEED IS UNTOUCHED. Drafting is one week with or without an office; tiers
 * change what a script can become, never how fast. That is the original law.
 */
export function assessFirstDraft(
  concept: FilmConcept,
  writer: Talent,
  shape: FilmShape,
  promise: FilmPromise,
  // Defaulted to the identity so every existing caller — and every state with no
  // Development Office — produces byte-identical output.
  estUplift = 0,
): ScriptAssessment {
  const shapeEffects = resolveShape(shape)
  const actualWriting = effectiveSkill(
    writer,
    'writing',
    concept,
    undefined,
    shapeEffects,
    promise,
    'actual',
    shape,
  )
  const perceivedWriting = effectiveSkill(
    writer,
    'writing',
    concept,
    undefined,
    shapeEffects,
    promise,
    'perceived',
    shape,
  )
  // The uplift joins the blend INSIDE the existing clamp, so a script can never
  // be pushed past 100 and an office can never make one worse. It moves both the
  // hidden truth and the visible estimate: an office that moved only the estimate
  // would change what the player is told rather than what the studio made.
  return {
    actualStrength: clamp(
      0.6 * concept.baselineStrength + 0.4 * actualWriting + estUplift,
      0,
      100,
    ),
    perceivedStrength: clamp(
      0.6 * concept.baselineStrength + 0.4 * perceivedWriting + estUplift,
      0,
      100,
    ),
  }
}

export function scriptRewriteDelta(currentStrength: number, rewritingSkill: number): number {
  const delta = clamp((rewritingSkill - 40) * (100 - currentStrength) / 240, -3, 8)
  return delta === 0 ? 0 : delta
}

export function rewriteAssessment(
  assessment: ScriptAssessment,
  writer: Talent,
): ScriptAssessment {
  const rewriting = writer.skills.writing.rewriting
  if (rewriting === undefined) {
    throw new Error(`script development: writer "${writer.id}" has no rewriting skill`)
  }
  return {
    actualStrength: clamp(
      assessment.actualStrength + scriptRewriteDelta(assessment.actualStrength, rewriting.actual),
      0,
      100,
    ),
    perceivedStrength: clamp(
      assessment.perceivedStrength +
        scriptRewriteDelta(assessment.perceivedStrength, rewriting.perceived),
      0,
      100,
    ),
  }
}

export type ScriptWorkSources = {
  concepts: readonly FilmConcept[]
  talent: readonly Talent[]
  /**
   * C1-M4: EST points the studio's operational Development Office adds to a
   * first draft. Optional and defaulted to 0 so every existing caller keeps its
   * exact behaviour; the live tick supplies the real value.
   */
  estUplift?: number
}

// Completes every due task in canonical stored order. The returned state has all
// completed reservations released; Production Operations should allocate only
// after this helper returns.
export function completeDueScriptWork(
  development: ScriptDevelopment,
  currentWeek: number,
  sources: ScriptWorkSources,
): ScriptDevelopment {
  if (development.mode === 'legacy') return development
  let changed = false
  const projects = development.projects.map((project): ScriptProject => {
    if (
      (project.status !== 'drafting' && project.status !== 'rewriting') ||
      project.dueWeek === null ||
      project.dueWeek > currentWeek
    ) {
      return project
    }
    const concept = sources.concepts.find((candidate) => candidate.id === project.conceptId)
    if (concept === undefined) {
      throw new Error(
        `script development: due project "${project.id}" references unknown concept "${project.conceptId}"`,
      )
    }
    const writer = sources.talent.find((candidate) => candidate.id === project.writerId)
    if (writer === undefined) {
      throw new Error(
        `script development: due project "${project.id}" references unknown writer "${project.writerId}"`,
      )
    }
    const assessment =
      project.status === 'drafting'
        ? assessFirstDraft(concept, writer, project.shape, project.promise, sources.estUplift ?? 0)
        : project.assessment === null
          ? (() => {
              throw new Error(
                `script development: rewriting project "${project.id}" has no prior assessment`,
              )
            })()
          : rewriteAssessment(project.assessment, writer)
    changed = true
    return {
      ...project,
      status: 'review',
      dueWeek: null,
      assessment,
      reservation: null,
    }
  })
  return changed ? { ...development, projects } : development
}

export function requestScriptRewrite(
  development: ScriptDevelopment,
  operations: StudioOperations,
  projectId: string,
  currentWeek: number,
  externallyOccupiedSlots: ReadonlySet<string> = new Set<string>(),
): ScriptDevelopment {
  requireManaged(development, 'rewrite')
  if (operations.mode !== 'managed') {
    throw new Error(
      'script development: rewrite rejected — managed Studio Operations are not active',
    )
  }
  const project = requireProject(development, projectId, 'rewrite')
  if (project.status !== 'review' || project.rewriteCount !== 0 || project.assessment === null) {
    throw new Error(
      `script development: rewrite rejected — project "${projectId}" is not at its first review`,
    )
  }
  if (!Number.isInteger(currentWeek) || currentWeek < project.commissionedWeek) {
    throw new Error('script development: rewrite week must be a valid present week')
  }
  if (
    development.projects.some(
      (candidate) =>
        candidate.id !== project.id &&
        ACTIVE_SCRIPT_STATUSES.has(candidate.status) &&
        candidate.writerId === project.writerId,
    )
  ) {
    throw new Error(
      `script development: rewrite rejected — writer "${project.writerId}" already has an active screenplay task`,
    )
  }
  const reservation = allocateScriptReservation(
    operations,
    development,
    project.id,
    externallyOccupiedSlots,
  )
  if (reservation === null) {
    throw new Error(
      'script development: rewrite rejected — no Development & Casting slot is available',
    )
  }
  return replaceProject(development, {
    ...project,
    status: 'rewriting',
    rewriteCount: 1,
    dueWeek: currentWeek + 1,
    reservation,
  })
}

export function acceptScriptProject(
  development: ScriptDevelopment,
  projectId: string,
): ScriptDevelopment {
  requireManaged(development, 'accept')
  const project = requireProject(development, projectId, 'accept')
  if (project.status !== 'review' || project.assessment === null) {
    throw new Error(
      `script development: accept rejected — project "${projectId}" does not need review`,
    )
  }
  return replaceProject(development, { ...project, status: 'ready' })
}

export function linkScriptProjectToProduction(
  development: ScriptDevelopment,
  projectId: string,
  productionId: string,
): ScriptDevelopment {
  requireManaged(development, 'greenlight')
  const project = requireProject(development, projectId, 'greenlight')
  if (project.status !== 'ready' || project.assessment === null) {
    throw new Error(
      `script development: greenlight rejected — project "${projectId}" is not Ready`,
    )
  }
  if (
    development.projects.some(
      (candidate) =>
        candidate.id !== projectId && candidate.productionId !== null && candidate.productionId === productionId,
    )
  ) {
    throw new Error(
      `script development: greenlight rejected — production "${productionId}" is already linked`,
    )
  }
  return replaceProject(development, {
    ...project,
    status: 'inProduction',
    productionId,
  })
}

export function returnScriptProjectToReady(
  development: ScriptDevelopment,
  productionId: string,
): ScriptDevelopment {
  requireManaged(development, 'cancel')
  const project = development.projects.find(
    (candidate) => candidate.productionId === productionId && candidate.status === 'inProduction',
  )
  if (project === undefined) {
    throw new Error(
      `script development: cancel references production "${productionId}" without an In Production screenplay`,
    )
  }
  return replaceProject(development, {
    ...project,
    status: 'ready',
    productionId: null,
  })
}

export function markScriptProjectProduced(
  development: ScriptDevelopment,
  productionId: string,
): ScriptDevelopment {
  requireManaged(development, 'release')
  const project = development.projects.find(
    (candidate) => candidate.productionId === productionId && candidate.status === 'inProduction',
  )
  if (project === undefined) {
    throw new Error(
      `script development: release references production "${productionId}" without an In Production screenplay`,
    )
  }
  return replaceProject(development, { ...project, status: 'produced' })
}

export function scriptProjectForProduction(
  development: ScriptDevelopment,
  productionId: string,
): ScriptProject | undefined {
  return development.projects.find((project) => project.productionId === productionId)
}

/**
 * The one player-safe strength read for a Ready screenplay forecast. Callers name
 * the project; core verifies that it is the assessed Ready authority and returns
 * only the persisted perceived value. The hidden actual assessment never crosses
 * the package-preview boundary.
 */
export function readyScriptPerceivedStrength(
  development: ScriptDevelopment,
  projectId: string,
): number {
  requireManaged(development, 'preview Ready screenplay')
  const project = requireProject(development, projectId, 'preview Ready screenplay')
  if (project.status !== 'ready' || project.assessment === null) {
    throw new Error(
      `script development: preview Ready screenplay rejected — project "${projectId}" is not an assessed Ready screenplay`,
    )
  }
  return project.assessment.perceivedStrength
}

/**
 * Internal reconstruction read for a production linked to managed screenplay
 * history. Adapter/autopsy code consumes this behind its boundary; React receives
 * only the derived forecast or post-release explanation, never this hidden pair.
 * Legacy productions have no managed assessment and preserve their old formula.
 */
export function linkedScriptStrengthOverride(
  development: ScriptDevelopment,
  productionId: string,
): { actual: number; perceived: number } | undefined {
  if (development.mode === 'legacy') return undefined
  const project = scriptProjectForProduction(development, productionId)
  if (project === undefined || project.assessment === null) {
    throw new Error(
      `script development: production "${productionId}" has no linked assessed screenplay`,
    )
  }
  return {
    actual: project.assessment.actualStrength,
    perceived: project.assessment.perceivedStrength,
  }
}

export function scriptProjectsNeedingReview(development: ScriptDevelopment): ScriptProject[] {
  return development.projects.filter((project) => project.status === 'review')
}

export function nextScriptProjectNeedingReview(
  development: ScriptDevelopment,
): ScriptProject | null {
  return scriptProjectsNeedingReview(development)[0] ?? null
}

export function activeScriptWriterAssignments(
  development: ScriptDevelopment,
  concepts: readonly FilmConcept[],
): ScriptWriterAssignment[] {
  const titleByConcept = new Map(concepts.map((concept) => [concept.id, concept.title]))
  return development.projects.flatMap((project): ScriptWriterAssignment[] => {
    if (project.status !== 'drafting' && project.status !== 'rewriting') return []
    const title = titleByConcept.get(project.conceptId)
    if (title === undefined) {
      throw new Error(
        `script development: project "${project.id}" references unknown concept "${project.conceptId}"`,
      )
    }
    const verb = project.status === 'drafting' ? 'Drafting' : 'Rewriting'
    return [{
      talentId: project.writerId,
      projectId: project.id,
      status: project.status,
      title,
      label: `${verb} ${title}`,
    }]
  })
}

export function scriptWriterAssignment(
  development: ScriptDevelopment,
  concepts: readonly FilmConcept[],
  talentId: string,
): ScriptWriterAssignment | undefined {
  return activeScriptWriterAssignments(development, concepts).find(
    (assignment) => assignment.talentId === talentId,
  )
}

export type ScriptDevelopmentInvariantContext = {
  currentWeek: number
  concepts: readonly FilmConcept[]
  talent: readonly Talent[]
  contracts: readonly Contract[]
  operations: StudioOperations
  activeProductions: readonly Production[]
  releasedFilms: readonly FilmResult[]
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`script development invariant: ${message}`)
}

function activeContractAt(
  contracts: readonly Contract[],
  talentId: string,
  currentWeek: number,
): boolean {
  return contracts.some(
    (contract) =>
      contract.talentId === talentId &&
      contract.startWeek <= currentWeek &&
      currentWeek < contract.endWeekExclusive,
  )
}

function sameShape(a: FilmShape, b: FilmShape): boolean {
  return a.opening === b.opening && a.midpoint === b.midpoint && a.ending === b.ending
}

function sameRange(a: readonly [number, number], b: readonly [number, number]): boolean {
  return a[0] === b[0] && a[1] === b[1]
}

function samePromise(a: FilmPromise, b: FilmPromise): boolean {
  return (
    a.genre === b.genre &&
    a.intendedSegments.length === b.intendedSegments.length &&
    a.intendedSegments.every((segment, index) => segment === b.intendedSegments[index]) &&
    sameRange(a.ranges.intimacy, b.ranges.intimacy) &&
    sameRange(a.ranges.tonalWeight, b.ranges.tonalWeight) &&
    sameRange(a.ranges.kineticEnergy, b.ranges.kineticEnergy)
  )
}

// One authority for the screenplay facts that package assembly must preserve.
// Exported so action validation and save invariants cannot drift into subtly
// different equality rules (for example, object key insertion order).
export function screenplayFactsMatch(
  project: ScriptProject,
  production: Pick<Production, 'conceptId' | 'writerId' | 'shape' | 'promise'>,
): boolean {
  return (
    production.conceptId === project.conceptId &&
    production.writerId === project.writerId &&
    sameShape(production.shape, project.shape) &&
    samePromise(production.promise, project.promise)
  )
}

function assertValidPromise(project: ScriptProject, concept: FilmConcept): void {
  invariant(
    OPENINGS.has(project.shape.opening) &&
      MIDPOINTS.has(project.shape.midpoint) &&
      ENDINGS.has(project.shape.ending),
    `project "${project.id}" has an invalid shape`,
  )
  invariant(
    project.promise.genre === concept.genre,
    `project "${project.id}" promise genre disagrees with its concept`,
  )
  invariant(
    project.promise.intendedSegments.length > 0,
    `project "${project.id}" promise has no intended segment`,
  )
  const seenSegments = new Set<string>()
  for (const segment of project.promise.intendedSegments) {
    invariant(SEGMENTS.has(segment), `project "${project.id}" has invalid segment "${String(segment)}"`)
    invariant(!seenSegments.has(segment), `project "${project.id}" has duplicate segment "${segment}"`)
    seenSegments.add(segment)
  }
  for (const [name, range] of Object.entries(project.promise.ranges)) {
    invariant(
      Array.isArray(range) &&
        range.length === 2 &&
        Number.isFinite(range[0]) &&
        Number.isFinite(range[1]) &&
        range[0] >= -1 &&
        range[1] <= 1 &&
        range[0] <= range[1],
      `project "${project.id}" has invalid ${name} promise range`,
    )
  }
}

function assertAssessment(project: ScriptProject): void {
  invariant(project.assessment !== null, `project "${project.id}" has no assessment`)
  invariant(
    Number.isFinite(project.assessment.actualStrength) &&
      project.assessment.actualStrength >= 0 &&
      project.assessment.actualStrength <= 100,
    `project "${project.id}" actual strength is outside [0, 100]`,
  )
  invariant(
    Number.isFinite(project.assessment.perceivedStrength) &&
      project.assessment.perceivedStrength >= 0 &&
      project.assessment.perceivedStrength <= 100,
    `project "${project.id}" perceived strength is outside [0, 100]`,
  )
}

function assertReservation(
  project: ScriptProject,
  operations: StudioOperations,
  occupied: Set<string>,
): void {
  invariant(project.reservation !== null, `active project "${project.id}" has no reservation`)
  const reservation = project.reservation
  invariant(reservation.projectId === project.id, `project "${project.id}" reservation owner disagrees`)
  invariant(
    reservation.capability === 'development-casting',
    `project "${project.id}" reservation capability is not development-casting`,
  )
  const facility = operations.facilities.find((candidate) => candidate.id === reservation.facilityId)
  invariant(facility !== undefined, `project "${project.id}" reservation facility is unknown`)
  invariant(
    facility.capability === 'development-casting',
    `project "${project.id}" reservation facility has the wrong capability`,
  )
  invariant(
    Number.isInteger(reservation.slot) && reservation.slot >= 0 && reservation.slot < facility.capacity,
    `project "${project.id}" reservation slot is outside facility capacity`,
  )
  const key = facilitySlotKey(reservation.facilityId, reservation.slot)
  invariant(!occupied.has(key), `facility slot "${key}" is overbooked across scripts/productions`)
  occupied.add(key)
}

function activeProductionTalentIds(productions: readonly Production[]): Set<string> {
  const ids = new Set<string>()
  for (const production of productions) {
    ids.add(production.writerId)
    ids.add(production.directorId)
    ids.add(production.cast.lead)
    ids.add(production.cast.antagonist)
    ids.add(production.cast.support)
    for (const craftId of production.craftIds) ids.add(craftId)
  }
  return ids
}

// Shared core/save boundary. Save validation should establish exact outer keys and
// scalar shapes first; this assertion enforces lifecycle and cross-state laws.
export function assertScriptDevelopmentInvariants(
  development: ScriptDevelopment,
  context: ScriptDevelopmentInvariantContext,
): void {
  invariant(
    Number.isInteger(context.currentWeek) && context.currentWeek >= 0,
    'current week must be a non-negative integer',
  )
  if (development.mode === 'legacy') {
    invariant(development.projects.length === 0, 'legacy mode must have no projects')
    return
  }
  invariant(development.mode === 'managed', `unknown mode ${String(development.mode)}`)
  invariant(context.operations.mode === 'managed', 'managed scripts require managed studio operations')

  const conceptById = new Map(context.concepts.map((concept) => [concept.id, concept]))
  const talentById = new Map(context.talent.map((person) => [person.id, person]))
  const activeById = new Map(
    context.activeProductions.map((production) => [production.id, production]),
  )
  const releasedById = new Map(
    context.releasedFilms.map((film) => [film.productionId, film]),
  )
  const activeProductionTalent = activeProductionTalentIds(context.activeProductions)
  const activeScriptWriters = new Set<string>()
  const conceptIds = new Set<string>()
  const productionLinks = new Set<string>()
  // Seed the shared-capacity ledger with the PRODUCTIONS' slots, from the one
  // union producer; each active project then claims against it below.
  const occupied = new Set(
    occupiedResourceSlots({ operations: context.operations }, { owners: ['production'] }).keys(),
  )

  for (let index = 0; index < development.projects.length; index++) {
    const project = development.projects[index]!
    invariant(
      project.id === canonicalScriptProjectId(index),
      `project at index ${String(index)} must be ${canonicalScriptProjectId(index)}`,
    )
    invariant(!conceptIds.has(project.conceptId), `duplicate concept link "${project.conceptId}"`)
    conceptIds.add(project.conceptId)

    const concept = conceptById.get(project.conceptId)
    invariant(concept !== undefined, `project "${project.id}" references unknown concept`)
    const writer = talentById.get(project.writerId)
    invariant(writer !== undefined, `project "${project.id}" references unknown writer`)
    invariant(
      writer.skills.writing !== undefined && writer.skills.writing.rewriting !== undefined,
      `project "${project.id}" writer has no writing profile`,
    )
    assertValidPromise(project, concept)
    invariant(
      Number.isInteger(project.commissionedWeek) &&
        project.commissionedWeek >= 0 &&
        project.commissionedWeek <= context.currentWeek,
      `project "${project.id}" has an invalid or future commission week`,
    )
    invariant(
      project.rewriteCount === 0 || project.rewriteCount === 1,
      `project "${project.id}" has invalid rewrite count`,
    )

    switch (project.status) {
      case 'drafting':
        invariant(project.rewriteCount === 0, `drafting project "${project.id}" was rewritten`)
        invariant(project.assessment === null, `drafting project "${project.id}" is already assessed`)
        invariant(project.productionId === null, `drafting project "${project.id}" has a production link`)
        invariant(
          project.dueWeek === project.commissionedWeek + 1 && project.dueWeek > context.currentWeek,
          `drafting project "${project.id}" has an invalid due week`,
        )
        assertReservation(project, context.operations, occupied)
        break
      case 'rewriting':
        invariant(project.rewriteCount === 1, `rewriting project "${project.id}" has not used its rewrite`)
        assertAssessment(project)
        invariant(project.productionId === null, `rewriting project "${project.id}" has a production link`)
        invariant(
          project.dueWeek !== null &&
            Number.isInteger(project.dueWeek) &&
            project.dueWeek === context.currentWeek + 1,
          `rewriting project "${project.id}" has an invalid due week`,
        )
        assertReservation(project, context.operations, occupied)
        break
      case 'review':
      case 'ready':
        assertAssessment(project)
        invariant(project.dueWeek === null, `${project.status} project "${project.id}" has a due week`)
        invariant(project.reservation === null, `${project.status} project "${project.id}" holds capacity`)
        invariant(project.productionId === null, `${project.status} project "${project.id}" has a production link`)
        break
      case 'inProduction': {
        assertAssessment(project)
        invariant(project.dueWeek === null, `In Production project "${project.id}" has a due week`)
        invariant(project.reservation === null, `In Production project "${project.id}" holds capacity`)
        invariant(project.productionId !== null, `In Production project "${project.id}" has no production link`)
        invariant(!productionLinks.has(project.productionId), `duplicate production link "${project.productionId}"`)
        productionLinks.add(project.productionId)
        const production = activeById.get(project.productionId)
        invariant(production !== undefined, `project "${project.id}" does not link an active production`)
        invariant(production.conceptId === project.conceptId, `project "${project.id}" concept differs from production`)
        invariant(production.writerId === project.writerId, `project "${project.id}" writer differs from production`)
        invariant(
          production.participants !== undefined &&
            production.participants.writer.talentId === project.writerId,
          `project "${project.id}" writer differs from production participant snapshot`,
        )
        invariant(sameShape(production.shape, project.shape), `project "${project.id}" shape differs from production`)
        invariant(
          samePromise(production.promise, project.promise),
          `project "${project.id}" promise differs from production`,
        )
        break
      }
      case 'produced': {
        assertAssessment(project)
        invariant(project.dueWeek === null, `Produced project "${project.id}" has a due week`)
        invariant(project.reservation === null, `Produced project "${project.id}" holds capacity`)
        invariant(project.productionId !== null, `Produced project "${project.id}" has no production link`)
        invariant(!productionLinks.has(project.productionId), `duplicate production link "${project.productionId}"`)
        productionLinks.add(project.productionId)
        const film = releasedById.get(project.productionId)
        invariant(film !== undefined, `project "${project.id}" does not link a released film`)
        invariant(film.conceptId === project.conceptId, `project "${project.id}" concept differs from released film`)
        invariant(
          film.participants !== undefined && film.participants.writer.talentId === project.writerId,
          `project "${project.id}" writer differs from released film`,
        )
        invariant(!activeById.has(project.productionId), `Produced project "${project.id}" is still active`)
        break
      }
      default:
        invariant(false, `project "${project.id}" has unknown status ${String(project.status)}`)
    }

    if (project.status === 'drafting' || project.status === 'rewriting') {
      invariant(
        activeContractAt(context.contracts, project.writerId, context.currentWeek),
        `active project "${project.id}" writer is not contracted`,
      )
      invariant(
        !activeScriptWriters.has(project.writerId),
        `writer "${project.writerId}" has more than one active script task`,
      )
      invariant(
        !activeProductionTalent.has(project.writerId),
        `writer "${project.writerId}" is also assigned to an active production`,
      )
      activeScriptWriters.add(project.writerId)
    }
  }

  for (const production of context.activeProductions) {
    const project = development.projects.find(
      (candidate) =>
        candidate.status === 'inProduction' && candidate.productionId === production.id,
    )
    invariant(project !== undefined, `active production "${production.id}" has no screenplay project`)
  }
}
