// ── First Film Journey — semantic destination → physical lot address ──────────
//
// The ENGINE owns the journey (`firstFilmJourney(state)` in src/core): which stage the
// picture is at, the copy that describes it, and the ONE imperative next step. It names
// that step's destination SEMANTICALLY ('development', 'casting', 'stage', …) because the
// engine must never invent physical world (shift law 12) — which building the renderer
// paints a site on is the renderer's own vocabulary.
//
// This module is that mapping and nothing else. It derives no journey state, invents no
// copy, and never re-answers a question the projection already answered. When the
// projection is absent it says ABSENT; when it is present but malformed it says
// MALFORMED — the two are different facts and the host must be able to tell them apart
// (shift law 17), because "no projection yet" and "a projection I cannot trust" call for
// different honest surfaces.
//
// The type declarations below mirror the frozen `FirstFilmJourneyView` contract. The
// adapter assigns the engine's own return value into a field of this type, so any drift
// between the engine's shape and this mirror is a compile error at that seam.

import type { BuildingId, StudioLotSnapshot } from './StudioLotSnapshot.ts'

// ── The frozen projection contract ────────────────────────────────────────────

export type FirstFilmJourneyStage =
  | 'no-picture'
  | 'drafting'
  | 'script-review'
  | 'ready-to-package'
  | 'auditioning'
  | 'audition-review'
  | 'in-production'
  | 'released'

export type JourneyTargetKind =
  | 'commission'
  | 'script-review'
  | 'plan-auditions'
  | 'audition-review'
  | 'open-package'
  | 'resolve-production'
  | 'advance-week'

/** Semantic destinations. NOT building ids — see the mapping below. */
export type JourneySite = 'development' | 'casting' | 'stage' | 'post' | 'admin'

export interface FirstFilmJourneyNext {
  kind: JourneyTargetKind
  label: string
  site: JourneySite | null
}

export interface FirstFilmJourneyView {
  stage: FirstFilmJourneyStage
  pictureTitle: string | null
  ordinal: number
  headline: string
  detail: string | null
  next: FirstFilmJourneyNext | null
  waiting: { untilWeek: number | null; reason: string } | null
  blocked: { reason: string } | null
}

const JOURNEY_STAGES: readonly FirstFilmJourneyStage[] = [
  'no-picture',
  'drafting',
  'script-review',
  'ready-to-package',
  'auditioning',
  'audition-review',
  'in-production',
  'released',
]

const JOURNEY_TARGET_KINDS: readonly JourneyTargetKind[] = [
  'commission',
  'script-review',
  'plan-auditions',
  'audition-review',
  'open-package',
  'resolve-production',
  'advance-week',
]

const JOURNEY_SITES: readonly JourneySite[] = [
  'development',
  'casting',
  'stage',
  'post',
  'admin',
]

// ── Semantic site → physical building ─────────────────────────────────────────

/** The two soundstages, in the order the world lays them out. */
export const JOURNEY_STAGE_BUILDING_IDS: readonly BuildingId[] = ['stage-a', 'stage-b']

/**
 * Every fixed site's building, in the exact `BuildingId` vocabulary the world and the
 * companion navigation already share (`BUILDING_ACTION` / `BuildingState`). 'stage' is
 * absent on purpose: which soundstage a picture occupies is a fact about the current
 * production set, not a constant.
 */
export const JOURNEY_SITE_BUILDING: Readonly<Record<Exclude<JourneySite, 'stage'>, BuildingId>> = {
  development: 'writers',
  casting: 'casting',
  post: 'post',
  admin: 'admin',
}

type UnknownRecord = Record<string, unknown>

function isPlainRecord(value: unknown): value is UnknownRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function hasExactOwnKeys(value: UnknownRecord, expected: readonly string[]): boolean {
  const actual = Reflect.ownKeys(value)
  return (
    actual.length === expected.length &&
    expected.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  )
}

function isStageBuildingId(value: unknown): value is BuildingId {
  return typeof value === 'string' && JOURNEY_STAGE_BUILDING_IDS.includes(value as BuildingId)
}

/**
 * The soundstage the studio's own operations projection says a picture occupies, or null
 * when the snapshot does not determine one. Ambiguity (two pictures on two different
 * stages) is NOT determination — the caller falls back to the first stage rather than
 * guessing which picture the guidance meant.
 */
export function activeStageBuildingId(snapshot: StudioLotSnapshot): BuildingId | null {
  const operations = snapshot.productionOperations
  if (!Array.isArray(operations)) return null
  const occupied: BuildingId[] = []
  for (const operation of operations) {
    if (!isPlainRecord(operation)) continue
    const located = operation['locationBuildingId']
    if (!isStageBuildingId(located)) continue
    if (!occupied.includes(located)) occupied.push(located)
  }
  return occupied.length === 1 ? occupied[0]! : null
}

/**
 * The building the guidance's next step points at. `null` in, `null` out — a step with no
 * site (a quiet "advance the week" status line) addresses no place on the lot.
 */
export function journeyTargetBuildingId(
  site: JourneySite | null,
  snapshot: StudioLotSnapshot,
): BuildingId | null {
  if (site === null) return null
  if (site === 'stage') {
    return activeStageBuildingId(snapshot) ?? JOURNEY_STAGE_BUILDING_IDS[0]!
  }
  return JOURNEY_SITE_BUILDING[site]
}

// ── Reading the projection off the snapshot ───────────────────────────────────

const VIEW_KEYS = [
  'stage',
  'pictureTitle',
  'ordinal',
  'headline',
  'detail',
  'next',
  'waiting',
  'blocked',
] as const
const NEXT_KEYS = ['kind', 'label', 'site'] as const
const WAITING_KEYS = ['untilWeek', 'reason'] as const
const BLOCKED_KEYS = ['reason'] as const

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value)
}

function isNextStep(value: unknown): value is FirstFilmJourneyNext {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, NEXT_KEYS)) return false
  const site = value['site']
  return (
    JOURNEY_TARGET_KINDS.includes(value['kind'] as JourneyTargetKind) &&
    isNonEmptyString(value['label']) &&
    (site === null || JOURNEY_SITES.includes(site as JourneySite))
  )
}

function isWaiting(value: unknown): value is { untilWeek: number | null; reason: string } {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, WAITING_KEYS)) return false
  const untilWeek = value['untilWeek']
  return (
    (untilWeek === null || (Number.isSafeInteger(untilWeek) && (untilWeek as number) >= 0)) &&
    isNonEmptyString(value['reason'])
  )
}

function isBlocked(value: unknown): value is { reason: string } {
  return (
    isPlainRecord(value) &&
    hasExactOwnKeys(value, BLOCKED_KEYS) &&
    isNonEmptyString(value['reason'])
  )
}

/** Closed-shape guard over the frozen contract. Nothing partial is ever accepted. */
export function isFirstFilmJourneyView(value: unknown): value is FirstFilmJourneyView {
  if (!isPlainRecord(value) || !hasExactOwnKeys(value, VIEW_KEYS)) return false
  const next = value['next']
  const waiting = value['waiting']
  const blocked = value['blocked']
  return (
    JOURNEY_STAGES.includes(value['stage'] as FirstFilmJourneyStage) &&
    isNullableNonEmptyString(value['pictureTitle']) &&
    Number.isSafeInteger(value['ordinal']) &&
    (value['ordinal'] as number) >= 1 &&
    isNonEmptyString(value['headline']) &&
    isNullableNonEmptyString(value['detail']) &&
    (next === null || isNextStep(next)) &&
    (waiting === null || isWaiting(waiting)) &&
    (blocked === null || isBlocked(blocked))
  )
}

/**
 * What the snapshot says about the journey.
 *
 *   • `absent`    — no projection on this snapshot at all. The honest surface is the
 *                   studio's own production truth, unchanged.
 *   • `malformed` — a projection is present but cannot be trusted. The honest surface
 *                   claims NOTHING about the picture; it must never silently degrade to
 *                   "the studio lot is idle", which would be a fact this host cannot prove.
 *   • `view`      — engine truth, rendered verbatim.
 */
export type FirstFilmJourneyContext =
  | { kind: 'view'; view: FirstFilmJourneyView }
  | { kind: 'absent' }
  | { kind: 'malformed' }

export function firstFilmJourneyContext(snapshot: StudioLotSnapshot): FirstFilmJourneyContext {
  const raw = (snapshot as { firstFilmJourney?: unknown }).firstFilmJourney
  if (raw === undefined) return { kind: 'absent' }
  if (!isFirstFilmJourneyView(raw)) return { kind: 'malformed' }
  return { kind: 'view', view: raw }
}
