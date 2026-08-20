import {
  canonicalScriptProjectId,
  makeSaveV14,
} from '../../../../src/core/index.ts'
import { scriptProjectsBoard } from '../../engine/adapter.ts'
import type {
  CommissionScriptPayload,
  GameState,
} from '../../engine/adapter.ts'
import type { CommissionOriginalScreenplayPayload } from '../../engine/screenplay.ts'

export type ScreenplayCommissionReceipt = {
  projectId: string
  conceptId: string
  title: string
  writerId: string
  writerName: string
  commissionedWeek: number
  dueWeek: number
  facilityId: string
  facilityName: string
  slot: number
}

const RECEIPT_KEYS = [
  'projectId',
  'conceptId',
  'title',
  'writerId',
  'writerName',
  'commissionedWeek',
  'dueWeek',
  'facilityId',
  'facilityName',
  'slot',
] as const

const BOARD_KEYS = [
  'mode',
  'capacity',
  'sections',
  'commission',
  'packages',
  'nextDecision',
  'lotAttention',
] as const

const COMMISSION_KEYS = [
  'canStart',
  // C2a-M4 (the M3 carry): the commission view publishes BOTH doors now —
  // `canStart` for adapting a market premise, `canStartOriginal` for the studio's
  // own writers. Admitted in the same commit that adds it, exactly as the note
  // below prescribes: a view field this list does not know about makes the
  // workspace reject the whole board with no visible error.
  'canStartOriginal',
  // A3: the retained client now consumes the engine's front-door answers rather
  // than treating capacity as a refusal. These fields are part of the same
  // closed projection and must be admitted by its exact-key validator.
  'canSubmitMarketIntent',
  'canSubmitOriginalIntent',
  'willQueueIntent',
  'consequence',
  'concepts',
  'writers',
  'blockers',
] as const

// C2a-M3: the board publishes WHERE a screenplay came from, so this exact-key
// mirror admits it in the same commit that adds it. Lane 14 §10.3 named this the
// silent-failure surface: a view field this list does not know about makes the
// workspace reject the whole board with no visible error.
const COMMISSION_CONCEPT_KEYS = ['id', 'title', 'genre', 'provenance'] as const
const PROVENANCE_KEYS = [
  'origin',
  'label',
  'writerId',
  'generatedTitle',
  'renamedWeek',
] as const
const PROVENANCE_ORIGINS = new Set(['original', 'pool'])
const SCREENPLAYS_KEYS = ['nextOrdinal', 'blueprints'] as const
const BLUEPRINT_KEYS = [
  'conceptId',
  'ordinal',
  'mintedWeek',
  'projectId',
  'writerId',
  'generatedTitle',
  'renamedWeek',
  'beats',
  'officeTierAtMint',
] as const
const COMMISSION_WRITER_KEYS = [
  'id',
  'name',
  'primaryRole',
  'writingEstimate',
  'available',
  'assignmentLabel',
] as const
const WRITING_ESTIMATE_KEYS = ['label', 'score'] as const
const LOT_ATTENTION_KEYS = ['kind', 'headline', 'detail'] as const
/**
 * Every attention kind the engine publishes (`scriptReadModel.ts`).
 *
 * F4 (§10): the workspace validates that the board's kind is one the engine can
 * actually say, and — below — that `capacity-constraint` agrees with a full
 * board. It no longer requires the board to be IDLE.
 */
const LOT_ATTENTION_KINDS = new Set([
  'review-required',
  'capacity-constraint',
  'active-work',
  'ready-script',
  'idle',
])
const CAPACITY_KEYS = ['capacity', 'occupied', 'available', 'facilities'] as const
const CAPACITY_FACILITY_KEYS = [
  'facilityId',
  'facilityName',
  'capacity',
  'occupied',
  'available',
  'slots',
] as const
const CAPACITY_SLOT_KEYS = ['slot', 'occupant'] as const
const CAPACITY_OCCUPANT_KEYS = [
  'owner',
  'ownerId',
  'activity',
  'title',
  'label',
] as const

const PAYLOAD_KEYS = ['conceptId', 'writerId', 'shape', 'promise'] as const
const SHAPE_KEYS = ['opening', 'midpoint', 'ending'] as const
const PROMISE_KEYS = ['genre', 'intendedSegments', 'ranges'] as const
const RANGE_KEYS = ['intimacy', 'tonalWeight', 'kineticEnergy'] as const
// C2a-M1 leaf widening (§8.1, owner ruling 00E.9): a V14 screenplay carries the bounded
// `writerIds` list beside its attributed `writerId`. It is listed here so the closed key
// check keeps REFUSING anything else, and it is asserted positively at both call sites —
// at commission the list is exactly the one commissioned writer.
const PROJECT_KEYS = [
  'id',
  'conceptId',
  'writerId',
  'writerIds',
  'shape',
  'promise',
  'status',
  'rewriteCount',
  'commissionedWeek',
  'dueWeek',
  'assessment',
  'reservation',
  'productionId',
] as const
const RESERVATION_KEYS = ['projectId', 'facilityId', 'capability', 'slot'] as const

const OPENINGS = new Set(['immediateAction', 'slowSetup', 'mysteryHook'])
const MIDPOINTS = new Set(['reversal', 'escalation', 'revelation'])
const ENDINGS = new Set(['triumph', 'bittersweet', 'tragic', 'ambiguous'])
const SEGMENTS = new Set(['youngAdult', 'family', 'adult', 'prestige'])
const GENRES = new Set(['comedy', 'drama', 'crime', 'romance', 'horror', 'adventure'])
const CREATIVE_ROLES = new Set(['writer', 'director', 'actor', 'craft'])

type UnknownRecord = Record<PropertyKey, unknown>

type StrictCapacitySlot = {
  slot: number
  occupant: UnknownRecord | null
}

type StrictCapacityFacility = {
  facilityId: string
  facilityName: string
  capacity: number
  occupied: number
  available: number
  slots: StrictCapacitySlot[]
}

type StrictCapacity = {
  capacity: number
  occupied: number
  available: number
  facilities: StrictCapacityFacility[]
}

type ExpectedOccupant = {
  owner: 'production' | 'script' | 'casting'
  ownerId: string
  activity: 'production-development' | 'drafting' | 'rewriting' | 'auditioning'
  title: string
}

type CommissionBefore = {
  title: string
  writerName: string
  facilityId: string
  facilityName: string
  slot: number
}

function isPlainRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasExactOwnKeys(value: UnknownRecord, expected: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value)
  return actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
}

function hasCanonicalArrayKeys(value: readonly unknown[]): boolean {
  const keys = Reflect.ownKeys(value)
  if (keys.length !== value.length + 1 || !keys.includes('length')) return false
  for (let index = 0; index < value.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(value, String(index))) return false
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index))
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable) return false
  }
  return true
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function closedKeys(value: UnknownRecord): string[] | null {
  const keys = Reflect.ownKeys(value)
  if (keys.some((key) => typeof key !== 'string')) return null
  for (const key of keys as string[]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key)
    if (descriptor === undefined || !('value' in descriptor) || !descriptor.enumerable) return null
  }
  return (keys as string[]).slice().sort()
}

function sameClosedValue(
  left: unknown,
  right: unknown,
  seen = new WeakMap<object, object>(),
): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) || Array.isArray(right)) {
    if (
      !Array.isArray(left) ||
      !Array.isArray(right) ||
      !hasCanonicalArrayKeys(left) ||
      !hasCanonicalArrayKeys(right) ||
      left.length !== right.length
    ) return false
    const prior = seen.get(left)
    if (prior !== undefined) return prior === right
    seen.set(left, right)
    return left.every((value, index) => sameClosedValue(value, right[index], seen))
  }
  if (!isPlainRecord(left) || !isPlainRecord(right)) return false
  const prior = seen.get(left)
  if (prior !== undefined) return prior === right
  seen.set(left, right)
  const leftKeys = closedKeys(left)
  const rightKeys = closedKeys(right)
  if (
    leftKeys === null ||
    rightKeys === null ||
    leftKeys.length !== rightKeys.length ||
    !leftKeys.every((key, index) => key === rightKeys[index])
  ) return false
  return leftKeys.every((key) => sameClosedValue(left[key], right[key], seen))
}

function sameClosedFieldsExcept(
  left: unknown,
  right: unknown,
  excluded: ReadonlySet<string>,
): boolean {
  if (!isPlainRecord(left) || !isPlainRecord(right)) return false
  const leftKeys = closedKeys(left)
  const rightKeys = closedKeys(right)
  if (leftKeys === null || rightKeys === null) return false
  const retainedLeft = leftKeys.filter((key) => !excluded.has(key))
  const retainedRight = rightKeys.filter((key) => !excluded.has(key))
  return retainedLeft.length === retainedRight.length &&
    retainedLeft.every(
      (key, index) =>
        key === retainedRight[index] && sameClosedValue(left[key], right[key]),
    )
}

// C2a-M1/M2 — "is this a canonical, undecorated live state?" is answered by projecting it
// through the LIVE save builder and comparing key-for-key. That builder is now makeSaveV14:
// V13 is a frozen historical format that cannot see the sets, queue, screenplay or history
// roots a live state carries, so asking it would report every ordinary studio as decorated.
// The assertion is unchanged — only the name of "current" moved.
function isClosedCanonicalState(state: GameState): boolean {
  const projected = makeSaveV14(state).state
  return sameClosedValue(state, projected)
}

function uniqueById(
  rows: unknown,
): Map<string, UnknownRecord> | null {
  if (!Array.isArray(rows) || !hasCanonicalArrayKeys(rows)) return null
  const byId = new Map<string, UnknownRecord>()
  for (const candidate of rows as unknown[]) {
    if (!isPlainRecord(candidate) || !isNonEmptyString(candidate.id) || byId.has(candidate.id)) {
      return null
    }
    byId.set(candidate.id, candidate)
  }
  return byId
}

function selectedNameIsUnique(
  rows: Map<string, UnknownRecord>,
  selectedId: string,
  nameField: string,
): string | null {
  const selected = rows.get(selectedId)
  const name = selected?.[nameField]
  if (!isNonEmptyString(name)) return null
  let matches = 0
  for (const row of rows.values()) {
    if (!isNonEmptyString(row[nameField])) return null
    if (row[nameField] === name) matches += 1
  }
  return matches === 1 ? name : null
}

function isPayload(value: unknown): value is CommissionScriptPayload {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, PAYLOAD_KEYS)) return false
  if (!isNonEmptyString(value.conceptId) || !isNonEmptyString(value.writerId)) return false
  if (
    !isPlainRecord(value.shape) ||
    !hasExactOwnKeys(value.shape, SHAPE_KEYS) ||
    typeof value.shape.opening !== 'string' ||
    !OPENINGS.has(value.shape.opening) ||
    typeof value.shape.midpoint !== 'string' ||
    !MIDPOINTS.has(value.shape.midpoint) ||
    typeof value.shape.ending !== 'string' ||
    !ENDINGS.has(value.shape.ending)
  ) return false
  if (!isPlainRecord(value.promise) || !hasExactOwnKeys(value.promise, PROMISE_KEYS)) return false
  if (typeof value.promise.genre !== 'string' || !GENRES.has(value.promise.genre)) return false
  const segments = value.promise.intendedSegments
  if (
    !Array.isArray(segments) ||
    !hasCanonicalArrayKeys(segments) ||
    segments.length === 0 ||
    segments.some((segment) => typeof segment !== 'string' || !SEGMENTS.has(segment)) ||
    new Set(segments).size !== segments.length
  ) return false
  if (!isPlainRecord(value.promise.ranges) || !hasExactOwnKeys(value.promise.ranges, RANGE_KEYS)) {
    return false
  }
  for (const axis of RANGE_KEYS) {
    const range = value.promise.ranges[axis]
    if (
      !Array.isArray(range) ||
      !hasCanonicalArrayKeys(range) ||
      range.length !== 2 ||
      !isFiniteNumber(range[0]) ||
      !isFiniteNumber(range[1]) ||
      range[0] > range[1]
    ) return false
  }
  return true
}

function expectedCapacityOccupants(state: GameState): Map<string, ExpectedOccupant> | null {
  const occupants = new Map<string, ExpectedOccupant>()
  const concepts = uniqueById(state.concepts)
  const projects = uniqueById(state.scriptDevelopment.projects)
  const productions = uniqueById(state.studio.activeProductions)
  const sessions = uniqueById(state.castingSessions.sessions)
  if (concepts === null || projects === null || productions === null || sessions === null) return null

  const titleForConcept = (conceptId: unknown): string | null => {
    if (!isNonEmptyString(conceptId)) return null
    const title = concepts.get(conceptId)?.title
    return isNonEmptyString(title) ? title : null
  }
  const add = (facilityId: unknown, slot: unknown, occupant: ExpectedOccupant): boolean => {
    if (!isNonEmptyString(facilityId) || !isNonNegativeSafeInteger(slot)) return false
    const key = `${facilityId}\u0000${String(slot)}`
    if (occupants.has(key)) return false
    occupants.set(key, occupant)
    return true
  }

  for (const workflow of state.operations.workflows as unknown[]) {
    if (!isPlainRecord(workflow) || !isNonEmptyString(workflow.productionId)) return null
    const production = productions.get(workflow.productionId)
    const title = titleForConcept(production?.conceptId)
    if (production === undefined || title === null || !Array.isArray(workflow.reservations)) return null
    for (const reservation of workflow.reservations as unknown[]) {
      if (!isPlainRecord(reservation) || reservation.capability !== 'development-casting') continue
      if (!add(reservation.facilityId, reservation.slot, {
        owner: 'production',
        ownerId: workflow.productionId,
        activity: 'production-development',
        title,
      })) return null
    }
  }

  for (const project of state.scriptDevelopment.projects as unknown[]) {
    if (!isPlainRecord(project) || project.reservation === null) continue
    if (
      !isPlainRecord(project.reservation) ||
      !isNonEmptyString(project.id) ||
      (project.status !== 'drafting' && project.status !== 'rewriting')
    ) return null
    const title = titleForConcept(project.conceptId)
    if (title === null || !add(project.reservation.facilityId, project.reservation.slot, {
      owner: 'script',
      ownerId: project.id,
      activity: project.status,
      title,
    })) return null
  }

  for (const session of state.castingSessions.sessions as unknown[]) {
    if (!isPlainRecord(session) || session.reservation === null) continue
    if (!isPlainRecord(session.reservation) || !isNonEmptyString(session.id)) return null
    const project = isNonEmptyString(session.projectId) ? projects.get(session.projectId) : undefined
    const title = titleForConcept(project?.conceptId)
    if (project === undefined || title === null || !add(
      session.reservation.facilityId,
      session.reservation.slot,
      {
        owner: 'casting',
        ownerId: session.id,
        activity: 'auditioning',
        title,
      },
    )) return null
  }
  return occupants
}

function strictCapacityProjection(state: GameState, value: unknown): StrictCapacity | null {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, CAPACITY_KEYS)) return null
  if (
    !isNonNegativeSafeInteger(value.capacity) ||
    !isNonNegativeSafeInteger(value.occupied) ||
    !isNonNegativeSafeInteger(value.available) ||
    !Array.isArray(value.facilities) ||
    !hasCanonicalArrayKeys(value.facilities)
  ) return null

  const stateFacilities = uniqueById(state.operations.facilities)
  const expectedOccupants = expectedCapacityOccupants(state)
  if (stateFacilities === null || expectedOccupants === null) return null
  const expectedFacilities = [...stateFacilities.values()]
    .filter((facility) => facility.capability === 'development-casting')
    .sort((left, right) => String(left.id).localeCompare(String(right.id)))
  if (value.facilities.length !== expectedFacilities.length) return null

  const facilities: StrictCapacityFacility[] = []
  const seenNames = new Set<string>()
  let totalCapacity = 0
  let totalOccupied = 0
  for (let facilityIndex = 0; facilityIndex < value.facilities.length; facilityIndex += 1) {
    const candidate = value.facilities[facilityIndex]
    const source = expectedFacilities[facilityIndex]!
    if (!isPlainRecord(candidate) || !hasExactOwnKeys(candidate, CAPACITY_FACILITY_KEYS)) return null
    if (
      !isNonEmptyString(candidate.facilityId) ||
      !isNonEmptyString(candidate.facilityName) ||
      candidate.facilityId !== source.id ||
      candidate.facilityName !== source.name ||
      !isNonNegativeSafeInteger(candidate.capacity) ||
      candidate.capacity === 0 ||
      candidate.capacity !== source.capacity ||
      !isNonNegativeSafeInteger(candidate.occupied) ||
      !isNonNegativeSafeInteger(candidate.available) ||
      !Array.isArray(candidate.slots) ||
      !hasCanonicalArrayKeys(candidate.slots) ||
      candidate.slots.length !== candidate.capacity ||
      seenNames.has(candidate.facilityName)
    ) return null
    seenNames.add(candidate.facilityName)

    const slots: StrictCapacitySlot[] = []
    let occupied = 0
    for (let slotIndex = 0; slotIndex < candidate.slots.length; slotIndex += 1) {
      const slot = candidate.slots[slotIndex]
      if (
        !isPlainRecord(slot) ||
        !hasExactOwnKeys(slot, CAPACITY_SLOT_KEYS) ||
        slot.slot !== slotIndex
      ) return null
      const expected = expectedOccupants.get(`${candidate.facilityId}\u0000${String(slotIndex)}`)
      if (expected === undefined) {
        if (slot.occupant !== null) return null
        slots.push({ slot: slotIndex, occupant: null })
        continue
      }
      if (
        !isPlainRecord(slot.occupant) ||
        !hasExactOwnKeys(slot.occupant, CAPACITY_OCCUPANT_KEYS) ||
        slot.occupant.owner !== expected.owner ||
        slot.occupant.ownerId !== expected.ownerId ||
        slot.occupant.activity !== expected.activity ||
        slot.occupant.title !== expected.title ||
        !isNonEmptyString(slot.occupant.label)
      ) return null
      occupied += 1
      slots.push({ slot: slotIndex, occupant: slot.occupant })
    }
    if (
      candidate.occupied !== occupied ||
      candidate.available !== candidate.capacity - occupied
    ) return null
    totalCapacity += candidate.capacity
    totalOccupied += occupied
    facilities.push({
      facilityId: candidate.facilityId,
      facilityName: candidate.facilityName,
      capacity: candidate.capacity,
      occupied,
      available: candidate.available,
      slots,
    })
  }
  if (
    value.capacity !== totalCapacity ||
    value.occupied !== totalOccupied ||
    value.available !== totalCapacity - totalOccupied
  ) return null
  return {
    capacity: totalCapacity,
    occupied: totalOccupied,
    available: value.available,
    facilities,
  }
}

function firstFreeSlot(capacity: StrictCapacity): {
  facilityId: string
  facilityName: string
  slot: number
} | null {
  for (const facility of capacity.facilities) {
    for (const slot of facility.slots) {
      if (slot.occupant === null) {
        return {
          facilityId: facility.facilityId,
          facilityName: facility.facilityName,
          slot: slot.slot,
        }
      }
    }
  }
  return null
}

function commissionBeforeProjection(
  state: GameState,
  payload: CommissionScriptPayload,
): CommissionBefore | null {
  const board = scriptProjectsBoard(state) as unknown
  if (
    !isPlainRecord(board) ||
    !hasExactOwnKeys(board, BOARD_KEYS) ||
    board.mode !== 'managed' ||
    !isPlainRecord(board.lotAttention) ||
    !hasExactOwnKeys(board.lotAttention, LOT_ATTENTION_KEYS) ||
    // ── F4 (charter §10), owned by M4 ──────────────────────────────────────
    //
    // This read `board.lotAttention.kind !== 'idle'`, and 'idle' means the whole
    // screenplay board has NOTHING going on: no review pending, no draft out, no
    // accepted script waiting to be packaged. So the world's commissioning
    // workspace published its receipt only for a studio doing nothing else —
    // "the commission verb demands the whole board idle", the seam §10 names.
    //
    // That was never the engine's rule. The engine commissions whenever a
    // Development & Casting slot is free, and `lotAttention`'s own comment says
    // so in as many words ("a picture in development occupies one slot, it does
    // not stop the studio commissioning the next screenplay in another"). The
    // predicate is now a function of FREE SLOTS, which is the queue's own truth
    // and the same question `availableDevelopmentCastingSlots` answers.
    //
    // The board's attention kind is still VALIDATED — it must be one the engine
    // publishes, and `capacity-constraint` must AGREE with a full board, which is
    // a check this guard did not have before. What it no longer does is refuse a
    // studio for being busy.
    !isNonEmptyString(board.lotAttention.kind) ||
    !LOT_ATTENTION_KINDS.has(board.lotAttention.kind) ||
    !isNonEmptyString(board.lotAttention.headline) ||
    !isNonEmptyString(board.lotAttention.detail) ||
    !isPlainRecord(board.commission) ||
    !hasExactOwnKeys(board.commission, COMMISSION_KEYS) ||
    board.commission.canStart !== true ||
    board.commission.canSubmitMarketIntent !== true ||
    board.commission.canSubmitOriginalIntent !== true ||
    board.commission.willQueueIntent !== false ||
    !isNonEmptyString(board.commission.consequence) ||
    !Array.isArray(board.commission.blockers) ||
    !hasCanonicalArrayKeys(board.commission.blockers) ||
    board.commission.blockers.length !== 0 ||
    !Array.isArray(board.commission.concepts) ||
    !hasCanonicalArrayKeys(board.commission.concepts) ||
    !Array.isArray(board.commission.writers) ||
    !hasCanonicalArrayKeys(board.commission.writers)
  ) return null

  const concepts = new Map<string, UnknownRecord>()
  let priorConceptId: string | null = null
  for (const concept of board.commission.concepts as unknown[]) {
    if (
      !isPlainRecord(concept) ||
      !hasExactOwnKeys(concept, COMMISSION_CONCEPT_KEYS) ||
      !isNonEmptyString(concept.id) ||
      !isNonEmptyString(concept.title) ||
      typeof concept.genre !== 'string' ||
      !GENRES.has(concept.genre) ||
      !isPlainRecord(concept.provenance) ||
      !hasExactOwnKeys(concept.provenance, PROVENANCE_KEYS) ||
      typeof concept.provenance.origin !== 'string' ||
      !PROVENANCE_ORIGINS.has(concept.provenance.origin) ||
      !isNonEmptyString(concept.provenance.label) ||
      concepts.has(concept.id) ||
      (priorConceptId !== null && concept.id <= priorConceptId)
    ) return null
    concepts.set(concept.id, concept)
    priorConceptId = concept.id
  }

  const writers = new Map<string, UnknownRecord>()
  // The commission board publishes its writers in ONE canonical order: best writing
  // estimate first, canonical id as the tie-break (the order the form's default is taken
  // from). A board arriving in any other order is not the board core published, so it is
  // rejected whole rather than repaired. This guard previously pinned the older pure
  // canonical-id order and must track the published order exactly, or a legal board is
  // read as hostile and the retained commissioning receipt is never published.
  let priorWriter: { id: string; score: number } | null = null
  for (const writer of board.commission.writers as unknown[]) {
    if (
      !isPlainRecord(writer) ||
      !hasExactOwnKeys(writer, COMMISSION_WRITER_KEYS) ||
      !isNonEmptyString(writer.id) ||
      !isNonEmptyString(writer.name) ||
      typeof writer.primaryRole !== 'string' ||
      !CREATIVE_ROLES.has(writer.primaryRole) ||
      typeof writer.available !== 'boolean' ||
      (writer.assignmentLabel !== null && !isNonEmptyString(writer.assignmentLabel)) ||
      !isPlainRecord(writer.writingEstimate) ||
      !hasExactOwnKeys(writer.writingEstimate, WRITING_ESTIMATE_KEYS) ||
      writer.writingEstimate.label !== 'Est.' ||
      !isFiniteNumber(writer.writingEstimate.score) ||
      writers.has(writer.id)
    ) return null
    const score: number = writer.writingEstimate.score
    if (
      priorWriter !== null &&
      (score > priorWriter.score ||
        (score === priorWriter.score && writer.id <= priorWriter.id))
    ) return null
    writers.set(writer.id, writer)
    priorWriter = { id: writer.id, score }
  }

  const concept = concepts.get(payload.conceptId)
  const writer = writers.get(payload.writerId)
  if (
    concept === undefined ||
    writer === undefined ||
    writer.available !== true ||
    writer.assignmentLabel !== null ||
    payload.promise.genre !== concept.genre
  ) return null

  const stateConcepts = uniqueById(state.concepts)
  const stateTalent = uniqueById(state.talent)
  const stateFacilities = uniqueById(state.operations.facilities)
  if (stateConcepts === null || stateTalent === null || stateFacilities === null) return null
  const title = selectedNameIsUnique(stateConcepts, payload.conceptId, 'title')
  const writerName = selectedNameIsUnique(stateTalent, payload.writerId, 'name')
  if (
    title === null ||
    writerName === null ||
    concept.title !== title ||
    concept.genre !== stateConcepts.get(payload.conceptId)?.genre ||
    writer.name !== writerName ||
    writer.primaryRole !== stateTalent.get(payload.writerId)?.role
  ) return null

  // F4: THE PREDICATE. A free Development & Casting slot is the whole rule — the
  // same one the engine's own front door applies — and the slot named on the
  // receipt is the one the allocator would take.
  const capacity = strictCapacityProjection(state, board.capacity)
  const firstFree = capacity === null ? null : firstFreeSlot(capacity)
  if (capacity === null || capacity.available <= 0 || firstFree === null) return null
  // AGREEMENT, not decoration: the board may only cry capacity when it has none.
  if ((board.lotAttention.kind === 'capacity-constraint') !== (capacity.available === 0)) {
    return null
  }
  const facilityName = selectedNameIsUnique(stateFacilities, firstFree.facilityId, 'name')
  const sourceFacility = stateFacilities.get(firstFree.facilityId)
  if (
    facilityName === null ||
    facilityName !== firstFree.facilityName ||
    sourceFacility?.capability !== 'development-casting'
  ) return null

  return {
    title,
    writerName,
    facilityId: firstFree.facilityId,
    facilityName,
    slot: firstFree.slot,
  }
}

function strictReceipt(value: unknown): value is ScreenplayCommissionReceipt {
  return isPlainRecord(value) &&
    hasExactOwnKeys(value, RECEIPT_KEYS) &&
    isNonEmptyString(value.projectId) &&
    isNonEmptyString(value.conceptId) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.writerId) &&
    isNonEmptyString(value.writerName) &&
    isNonNegativeSafeInteger(value.commissionedWeek) &&
    isNonNegativeSafeInteger(value.dueWeek) &&
    // C2a-M4 (the M3 carry): a pool premise still drafts in ONE week
    // unconditionally, and an ORIGINAL takes as many weeks as `00E`.9's writer
    // law gives it. The shared invariant is therefore "the draft is due after it
    // was commissioned"; the EXACT week is never taken on trust — every builder
    // and `currentScreenplayCommissionReceipt` check it against the project row
    // the engine actually wrote.
    value.dueWeek > value.commissionedWeek &&
    isNonEmptyString(value.facilityId) &&
    isNonEmptyString(value.facilityName) &&
    isNonNegativeSafeInteger(value.slot)
}

/**
 * Prove the exact immediate footprint of one accepted managed screenplay
 * commission. This selector presents Engine truth only; it performs no action.
 */
export function acceptedScreenplayCommissionReceipt(
  before: GameState,
  after: GameState,
  payload: CommissionScriptPayload,
): ScreenplayCommissionReceipt | null {
  try {
    if (
      before === after ||
      !isPayload(payload) ||
      !isClosedCanonicalState(before) ||
      !isClosedCanonicalState(after) ||
      before.seed !== after.seed ||
      !isNonNegativeSafeInteger(before.market.tick) ||
      before.market.tick !== after.market.tick ||
      before.rngState !== after.rngState ||
      before.operations.mode !== 'managed' ||
      after.operations.mode !== 'managed' ||
      before.scriptDevelopment.mode !== 'managed' ||
      after.scriptDevelopment.mode !== 'managed' ||
      // C2a-M3: a commission now also appends the screenplay's MOVIE BLUEPRINT
      // (charter §3.5 — one production path, so a market premise gets beats on
      // its first commission too). The root is admitted here and then CHECKED
      // below rather than merely excused: a receipt is a closed witness, and a
      // root that may change without being verified is a hole in it.
      !sameClosedFieldsExcept(
        before,
        after,
        new Set(['scriptDevelopment', 'originalScreenplays']),
      ) ||
      !appendedPoolBlueprint(before, after, payload) ||
      !sameClosedFieldsExcept(
        before.scriptDevelopment,
        after.scriptDevelopment,
        new Set(['projects']),
      ) ||
      !Array.isArray(before.scriptDevelopment.projects) ||
      !hasCanonicalArrayKeys(before.scriptDevelopment.projects) ||
      !Array.isArray(after.scriptDevelopment.projects) ||
      !hasCanonicalArrayKeys(after.scriptDevelopment.projects) ||
      after.scriptDevelopment.projects.length !== before.scriptDevelopment.projects.length + 1
    ) return null

    const projectedBefore = commissionBeforeProjection(before, payload)
    if (projectedBefore === null) return null

    const beforeProjects = uniqueById(before.scriptDevelopment.projects)
    const afterProjects = uniqueById(after.scriptDevelopment.projects)
    if (
      beforeProjects === null ||
      afterProjects === null ||
      beforeProjects.size + 1 !== afterProjects.size
    ) return null
    for (let index = 0; index < before.scriptDevelopment.projects.length; index += 1) {
      if (!sameClosedValue(
        before.scriptDevelopment.projects[index],
        after.scriptDevelopment.projects[index],
      )) return null
    }

    const project = after.scriptDevelopment.projects.at(-1) as unknown
    const projectId = canonicalScriptProjectId(before.scriptDevelopment.projects.length)
    if (
      !isPlainRecord(project) ||
      !hasExactOwnKeys(project, PROJECT_KEYS) ||
      project.id !== projectId ||
      beforeProjects.has(projectId) ||
      project.conceptId !== payload.conceptId ||
      project.writerId !== payload.writerId ||
      !sameClosedValue(project.writerIds, [payload.writerId]) ||
      !sameClosedValue(project.shape, payload.shape) ||
      !sameClosedValue(project.promise, payload.promise) ||
      project.status !== 'drafting' ||
      project.rewriteCount !== 0 ||
      project.commissionedWeek !== before.market.tick ||
      project.dueWeek !== before.market.tick + 1 ||
      project.assessment !== null ||
      project.productionId !== null ||
      !isPlainRecord(project.reservation) ||
      !hasExactOwnKeys(project.reservation, RESERVATION_KEYS) ||
      project.reservation.projectId !== projectId ||
      project.reservation.facilityId !== projectedBefore.facilityId ||
      project.reservation.capability !== 'development-casting' ||
      project.reservation.slot !== projectedBefore.slot
    ) return null

    return {
      projectId,
      conceptId: payload.conceptId,
      title: projectedBefore.title,
      writerId: payload.writerId,
      writerName: projectedBefore.writerName,
      commissionedWeek: before.market.tick,
      dueWeek: before.market.tick + 1,
      facilityId: projectedBefore.facilityId,
      facilityName: projectedBefore.facilityName,
      slot: projectedBefore.slot,
    }
  } catch {
    return null
  }
}

/**
 * C2a-M3 — the ONE blueprint a pool commission appends, checked exactly.
 *
 * A commission of a MARKET premise derives a blueprint with a null ordinal and
 * no generated title (the world authored that premise; this studio did not
 * write it), and it burns no mint ordinal. Anything else in this root — a
 * generated screenplay, a moved counter, a rewritten earlier row — means the
 * action was not the plain commission the receipt claims it was.
 */
function appendedPoolBlueprint(
  before: GameState,
  after: GameState,
  payload: CommissionScriptPayload,
): boolean {
  const beforeRoot = before.originalScreenplays as unknown
  const afterRoot = after.originalScreenplays as unknown
  if (
    !isPlainRecord(beforeRoot) ||
    !isPlainRecord(afterRoot) ||
    !hasExactOwnKeys(beforeRoot, SCREENPLAYS_KEYS) ||
    !hasExactOwnKeys(afterRoot, SCREENPLAYS_KEYS) ||
    beforeRoot.nextOrdinal !== afterRoot.nextOrdinal ||
    !Array.isArray(beforeRoot.blueprints) ||
    !Array.isArray(afterRoot.blueprints) ||
    !hasCanonicalArrayKeys(beforeRoot.blueprints) ||
    !hasCanonicalArrayKeys(afterRoot.blueprints) ||
    afterRoot.blueprints.length !== beforeRoot.blueprints.length + 1
  ) return false
  for (let index = 0; index < beforeRoot.blueprints.length; index += 1) {
    if (!sameClosedValue(beforeRoot.blueprints[index], afterRoot.blueprints[index])) return false
  }
  const appended = afterRoot.blueprints.at(-1) as unknown
  return (
    isPlainRecord(appended) &&
    hasExactOwnKeys(appended, BLUEPRINT_KEYS) &&
    appended.conceptId === payload.conceptId &&
    appended.ordinal === null &&
    appended.generatedTitle === null &&
    appended.renamedWeek === null &&
    appended.writerId === payload.writerId &&
    appended.mintedWeek === before.market.tick &&
    appended.projectId === canonicalScriptProjectId(before.scriptDevelopment.projects.length) &&
    Array.isArray(appended.beats) &&
    hasCanonicalArrayKeys(appended.beats) &&
    appended.beats.length > 0 &&
    isNonEmptyString(appended.officeTierAtMint)
  )
}

/** Field-exact closed comparison for App and Lot receipt ownership checks. */
export function sameScreenplayCommissionReceipt(
  left: ScreenplayCommissionReceipt | null,
  right: ScreenplayCommissionReceipt | null,
): boolean {
  try {
    if (left === null || right === null) return left === right
    return strictReceipt(left) && strictReceipt(right) && sameClosedValue(left, right)
  } catch {
    return false
  }
}

/**
 * Revalidate the durable project/reservation facts named by a transient receipt.
 * App separately proves accepted-state object identity and one-shot consumption.
 */
export function currentScreenplayCommissionReceipt(
  state: GameState,
  receipt: ScreenplayCommissionReceipt,
): ScreenplayCommissionReceipt | null {
  try {
    if (
      !strictReceipt(receipt) ||
      !isClosedCanonicalState(state) ||
      state.operations.mode !== 'managed' ||
      state.scriptDevelopment.mode !== 'managed' ||
      state.market.tick !== receipt.commissionedWeek
    ) return null

    const concepts = uniqueById(state.concepts)
    const talent = uniqueById(state.talent)
    const facilities = uniqueById(state.operations.facilities)
    const projects = uniqueById(state.scriptDevelopment.projects)
    if (concepts === null || talent === null || facilities === null || projects === null) return null
    if (
      selectedNameIsUnique(concepts, receipt.conceptId, 'title') !== receipt.title ||
      selectedNameIsUnique(talent, receipt.writerId, 'name') !== receipt.writerName ||
      selectedNameIsUnique(facilities, receipt.facilityId, 'name') !== receipt.facilityName
    ) return null

    const project = projects.get(receipt.projectId)
    if (
      project === undefined ||
      !hasExactOwnKeys(project, PROJECT_KEYS) ||
      project.conceptId !== receipt.conceptId ||
      project.writerId !== receipt.writerId ||
      !sameClosedValue(project.writerIds, [receipt.writerId]) ||
      project.status !== 'drafting' ||
      project.rewriteCount !== 0 ||
      project.commissionedWeek !== receipt.commissionedWeek ||
      project.dueWeek !== receipt.dueWeek ||
      project.assessment !== null ||
      project.productionId !== null ||
      !isPlainRecord(project.reservation) ||
      !hasExactOwnKeys(project.reservation, RESERVATION_KEYS) ||
      project.reservation.projectId !== receipt.projectId ||
      project.reservation.facilityId !== receipt.facilityId ||
      project.reservation.capability !== 'development-casting' ||
      project.reservation.slot !== receipt.slot
    ) return null

    const board = scriptProjectsBoard(state) as unknown
    if (
      !isPlainRecord(board) ||
      !hasExactOwnKeys(board, BOARD_KEYS) ||
      board.mode !== 'managed'
    ) return null
    const capacity = strictCapacityProjection(state, board.capacity)
    const facility = capacity?.facilities.find(
      (candidate) => candidate.facilityId === receipt.facilityId,
    )
    const slot = facility?.slots[receipt.slot]
    if (
      facility === undefined ||
      facility.facilityName !== receipt.facilityName ||
      slot === undefined ||
      slot.slot !== receipt.slot ||
      slot.occupant?.owner !== 'script' ||
      slot.occupant.ownerId !== receipt.projectId ||
      slot.occupant.activity !== 'drafting' ||
      slot.occupant.title !== receipt.title
    ) return null

    return { ...receipt }
  } catch {
    return null
  }
}


// ── C2a-M4 (the M3 carry) — THE ORIGINAL COMMISSION'S OWN WITNESS ────────────
//
// M3 shipped the second supply — a genre, a creative shape, and one of the
// studio's own writers — and shipped it without a witness card, because the card
// was keyed to a MARKET payload an original cannot have (17-m3-records.md §8,
// carry 7). So the world announced a bought premise and said nothing at all
// about a picture the studio wrote itself, which is the wrong way round.
//
// This is the same closed witness, proved for the original path. It is not
// weaker than the market one — it has MORE to prove, because an original mints a
// concept and burns an ordinal, and both are checked here rather than excused.

const ORIGINAL_PAYLOAD_KEYS = ['writerId', 'genre', 'shape', 'promise'] as const

function isOriginalPayload(value: unknown): value is CommissionOriginalScreenplayPayload {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, ORIGINAL_PAYLOAD_KEYS)) return false
  if (!isNonEmptyString(value.writerId)) return false
  if (typeof value.genre !== 'string' || !GENRES.has(value.genre)) return false
  // The shape and the promise are validated by the market payload's own rules —
  // they are the same two objects, and one reading of a shape is enough.
  return isPayload({
    conceptId: 'x',
    writerId: value.writerId,
    shape: value.shape,
    promise: value.promise,
  })
}

/**
 * The room the original commission will take, and the writer's name — the two
 * facts the witness needs that the successor cannot be asked for.
 *
 * F4's rule applies here exactly as it does to the market door: a FREE SLOT is
 * the whole predicate, and the slot named is the one the allocator would take.
 */
function originalCommissionBeforeProjection(
  state: GameState,
  payload: CommissionOriginalScreenplayPayload,
): { writerName: string; facilityId: string; facilityName: string; slot: number } | null {
  const board = scriptProjectsBoard(state) as unknown
  if (
    !isPlainRecord(board) ||
    !hasExactOwnKeys(board, BOARD_KEYS) ||
    board.mode !== 'managed' ||
    !isPlainRecord(board.lotAttention) ||
    !hasExactOwnKeys(board.lotAttention, LOT_ATTENTION_KEYS) ||
    !isNonEmptyString(board.lotAttention.kind) ||
    !LOT_ATTENTION_KINDS.has(board.lotAttention.kind) ||
    !isPlainRecord(board.commission) ||
    !hasExactOwnKeys(board.commission, COMMISSION_KEYS) ||
    // The ORIGINAL door's own legality, which is not `canStart`: a bought-out
    // premise market stops the market door and not this one (§3.5).
    board.commission.canStartOriginal !== true ||
    board.commission.canSubmitOriginalIntent !== true ||
    board.commission.willQueueIntent !== false ||
    !Array.isArray(board.commission.writers) ||
    !hasCanonicalArrayKeys(board.commission.writers)
  ) return null

  const writerRow = (board.commission.writers as unknown[]).find(
    (candidate) => isPlainRecord(candidate) && candidate.id === payload.writerId,
  )
  if (
    !isPlainRecord(writerRow) ||
    !hasExactOwnKeys(writerRow, COMMISSION_WRITER_KEYS) ||
    writerRow.available !== true ||
    writerRow.assignmentLabel !== null ||
    !isNonEmptyString(writerRow.name)
  ) return null

  const stateTalent = uniqueById(state.talent)
  const stateFacilities = uniqueById(state.operations.facilities)
  if (stateTalent === null || stateFacilities === null) return null
  const writerName = selectedNameIsUnique(stateTalent, payload.writerId, 'name')
  if (writerName === null || writerName !== writerRow.name) return null

  const capacity = strictCapacityProjection(state, board.capacity)
  const firstFree = capacity === null ? null : firstFreeSlot(capacity)
  if (capacity === null || capacity.available <= 0 || firstFree === null) return null
  if ((board.lotAttention.kind === 'capacity-constraint') !== (capacity.available === 0)) {
    return null
  }
  const facilityName = selectedNameIsUnique(stateFacilities, firstFree.facilityId, 'name')
  const sourceFacility = stateFacilities.get(firstFree.facilityId)
  if (
    facilityName === null ||
    facilityName !== firstFree.facilityName ||
    sourceFacility?.capability !== 'development-casting'
  ) return null

  return { writerName, facilityId: firstFree.facilityId, facilityName, slot: firstFree.slot }
}

/**
 * Prove the exact immediate footprint of one accepted ORIGINAL screenplay
 * commission. Presents Engine truth only; it performs no action.
 *
 * THREE roots move, and all three are checked: `concepts` gains exactly the
 * minted premise, `originalScreenplays` gains its blueprint AND burns exactly one
 * ordinal, and `scriptDevelopment` gains the project that holds the room. Every
 * earlier row in each is asserted untouched, and the three are required to AGREE
 * — the blueprint's concept is the appended concept, its title is that concept's
 * title, its project is the appended project. A commit that cannot prove all of
 * that raises no witness, exactly as the market path raises none.
 */
export function acceptedOriginalScreenplayCommissionReceipt(
  before: GameState,
  after: GameState,
  payload: CommissionOriginalScreenplayPayload,
): ScreenplayCommissionReceipt | null {
  try {
    if (
      before === after ||
      !isOriginalPayload(payload) ||
      !isClosedCanonicalState(before) ||
      !isClosedCanonicalState(after) ||
      before.seed !== after.seed ||
      !isNonNegativeSafeInteger(before.market.tick) ||
      before.market.tick !== after.market.tick ||
      // `00E`.9 / §3.5: the mint is DERIVED-ONLY. A commission that moved the sim
      // stream is not the action this witness claims it was.
      before.rngState !== after.rngState ||
      before.operations.mode !== 'managed' ||
      after.operations.mode !== 'managed' ||
      before.scriptDevelopment.mode !== 'managed' ||
      after.scriptDevelopment.mode !== 'managed' ||
      !sameClosedFieldsExcept(
        before,
        after,
        new Set(['scriptDevelopment', 'originalScreenplays', 'concepts']),
      ) ||
      !Array.isArray(before.concepts) ||
      !Array.isArray(after.concepts) ||
      !hasCanonicalArrayKeys(before.concepts) ||
      !hasCanonicalArrayKeys(after.concepts) ||
      after.concepts.length !== before.concepts.length + 1 ||
      !sameClosedFieldsExcept(
        before.scriptDevelopment,
        after.scriptDevelopment,
        new Set(['projects']),
      ) ||
      !Array.isArray(before.scriptDevelopment.projects) ||
      !Array.isArray(after.scriptDevelopment.projects) ||
      !hasCanonicalArrayKeys(before.scriptDevelopment.projects) ||
      !hasCanonicalArrayKeys(after.scriptDevelopment.projects) ||
      after.scriptDevelopment.projects.length !== before.scriptDevelopment.projects.length + 1
    ) return null

    for (let index = 0; index < before.concepts.length; index += 1) {
      if (!sameClosedValue(before.concepts[index], after.concepts[index])) return null
    }
    for (let index = 0; index < before.scriptDevelopment.projects.length; index += 1) {
      if (!sameClosedValue(
        before.scriptDevelopment.projects[index],
        after.scriptDevelopment.projects[index],
      )) return null
    }

    const projectedBefore = originalCommissionBeforeProjection(before, payload)
    if (projectedBefore === null) return null

    const beforeConcepts = uniqueById(before.concepts)
    const afterConcepts = uniqueById(after.concepts)
    const beforeProjects = uniqueById(before.scriptDevelopment.projects)
    const afterProjects = uniqueById(after.scriptDevelopment.projects)
    if (
      beforeConcepts === null ||
      afterConcepts === null ||
      beforeProjects === null ||
      afterProjects === null ||
      beforeConcepts.size + 1 !== afterConcepts.size ||
      beforeProjects.size + 1 !== afterProjects.size
    ) return null

    const concept = after.concepts.at(-1) as unknown
    if (
      !isPlainRecord(concept) ||
      !isNonEmptyString(concept.id) ||
      !isNonEmptyString(concept.title) ||
      beforeConcepts.has(concept.id) ||
      concept.genre !== payload.genre
    ) return null

    const projectId = canonicalScriptProjectId(before.scriptDevelopment.projects.length)
    if (!mintedOriginalBlueprint(before, after, payload, concept, projectId)) return null

    const project = after.scriptDevelopment.projects.at(-1) as unknown
    if (
      !isPlainRecord(project) ||
      !hasExactOwnKeys(project, PROJECT_KEYS) ||
      project.id !== projectId ||
      beforeProjects.has(projectId) ||
      project.conceptId !== concept.id ||
      project.writerId !== payload.writerId ||
      !sameClosedValue(project.writerIds, [payload.writerId]) ||
      !sameClosedValue(project.shape, payload.shape) ||
      !sameClosedValue(project.promise, payload.promise) ||
      project.status !== 'drafting' ||
      project.rewriteCount !== 0 ||
      project.commissionedWeek !== before.market.tick ||
      !isNonNegativeSafeInteger(project.dueWeek) ||
      // `00E`.9: an original's writing weeks come from `scriptDraftWeeks`, so the
      // due week is READ rather than predicted — but it must be in the future.
      project.dueWeek <= before.market.tick ||
      project.assessment !== null ||
      project.productionId !== null ||
      !isPlainRecord(project.reservation) ||
      !hasExactOwnKeys(project.reservation, RESERVATION_KEYS) ||
      project.reservation.projectId !== projectId ||
      project.reservation.facilityId !== projectedBefore.facilityId ||
      project.reservation.capability !== 'development-casting' ||
      project.reservation.slot !== projectedBefore.slot
    ) return null

    return {
      projectId,
      conceptId: concept.id,
      title: concept.title,
      writerId: payload.writerId,
      writerName: projectedBefore.writerName,
      commissionedWeek: before.market.tick,
      dueWeek: project.dueWeek,
      facilityId: projectedBefore.facilityId,
      facilityName: projectedBefore.facilityName,
      slot: projectedBefore.slot,
    }
  } catch {
    return null
  }
}

/**
 * The ONE blueprint an original commission mints, checked exactly — and the ONE
 * ordinal it burns.
 *
 * An original differs from a pool commission in precisely these two ways
 * (§3.5/§8.1): it carries a mint ordinal, and it carries the generated title.
 * Both are asserted, and the title is required to BE the appended concept's, so
 * the witness card can never show a name no root agrees with.
 */
function mintedOriginalBlueprint(
  before: GameState,
  after: GameState,
  payload: CommissionOriginalScreenplayPayload,
  concept: UnknownRecord,
  projectId: string,
): boolean {
  const beforeRoot = before.originalScreenplays as unknown
  const afterRoot = after.originalScreenplays as unknown
  if (
    !isPlainRecord(beforeRoot) ||
    !isPlainRecord(afterRoot) ||
    !hasExactOwnKeys(beforeRoot, SCREENPLAYS_KEYS) ||
    !hasExactOwnKeys(afterRoot, SCREENPLAYS_KEYS) ||
    !isNonNegativeSafeInteger(beforeRoot.nextOrdinal) ||
    afterRoot.nextOrdinal !== beforeRoot.nextOrdinal + 1 ||
    !Array.isArray(beforeRoot.blueprints) ||
    !Array.isArray(afterRoot.blueprints) ||
    !hasCanonicalArrayKeys(beforeRoot.blueprints) ||
    !hasCanonicalArrayKeys(afterRoot.blueprints) ||
    afterRoot.blueprints.length !== beforeRoot.blueprints.length + 1
  ) return false
  for (let index = 0; index < beforeRoot.blueprints.length; index += 1) {
    if (!sameClosedValue(beforeRoot.blueprints[index], afterRoot.blueprints[index])) return false
  }
  const appended = afterRoot.blueprints.at(-1) as unknown
  return (
    isPlainRecord(appended) &&
    hasExactOwnKeys(appended, BLUEPRINT_KEYS) &&
    appended.conceptId === concept.id &&
    appended.ordinal === beforeRoot.nextOrdinal &&
    appended.generatedTitle === concept.title &&
    appended.renamedWeek === null &&
    appended.writerId === payload.writerId &&
    appended.mintedWeek === before.market.tick &&
    appended.projectId === projectId &&
    Array.isArray(appended.beats) &&
    hasCanonicalArrayKeys(appended.beats) &&
    appended.beats.length > 0 &&
    isNonEmptyString(appended.officeTierAtMint)
  )
}
