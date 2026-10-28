// ── P17 browser boundary: continuation choice, featured appearances and their outcomes ──────────
//
// A module of the one engine boundary (like sets.ts and screenplay.ts). Every value is a core read:
//   • choices: `continuationQuote` over `continuationWorldOf` (legality, live P16 rights, the locked read);
//   • the right relied on: P16 `permissionFor` / `branchAuthority` for the use the quote names, and the licence row;
//   • meters: `recognitionReported`, `fatigueAt`, `momentumAt`, `branchBand` over the persisted franchise root;
//   • guests: `cameoQuote` (fee, basis, retained charge, readiness risk, refusal) for one work week;
//   • outcomes: the persisted lineage edge, the meters read before and after the release tick, and the bookings.
// Nothing here decides legality. A refused quote is shown with the core's own reason and is never selectable; the
// greenlight re-quotes everything and refuses atomically if anything moved.

import {
  applyActions,
  branchAuthority,
  branchBand,
  continuationQuote,
  continuationWorldOf,
  currentHolder,
  economyEngaged,
  fatigueAt,
  franchisesOf,
  installmentEdgeFor,
  licencesHeldBy,
  momentumAt,
  permissionFor,
  predictProductionId,
  recognitionReported,
  resolveTitles,
  TUNING,
  type ContinuationBand,
  type ContinuationQuote,
  type ContinuationRequest,
  type FranchiseBranch,
  type FranchiseBranchKind,
  type FranchiseProperty,
  type GameState,
  type LineageEdgeType,
  type ProposedPrincipals,
} from '../../../src/core/index.ts'
// The cameo slice is not exported from src/core/index.ts yet (cameo NOTES: "add cameoQuote and the action there when a
// consumer exists"). This module is that consumer; switch these two lines to index.ts when the core owner exports them.
import { cameoQuote, nominalShootingWeeks, type CameoQuoteResult } from '../../../src/core/cameoBooking.ts'
import { featuredCapacity, type CameoBookingRequest } from '../../../src/core/cameo.ts'
import type { CameoBooking } from '../../../src/core/types.ts'
// Not exported from index.ts either: the carried-screenplay owner, whose greenlight the core refuses guests on.
import { continuedScriptOwner } from '../../../src/core/continuedScripts.ts'
import type { ActionOutcome } from './adapter.ts'

export type { CameoBookingRequest, ContinuationRequest }

// ── continuation choice ────────────────────────────────────────────────────────

export type PropertyMeters = { recognition: number; fatigue: number }
export type ContinuityRead = { branchId: string; kind: FranchiseBranchKind; momentum: number; band: ContinuationBand }
/** The grant a lawful choice exercises: the held title, or a licence and the week its term ends. */
export type RightRelied = { via: 'title' | 'licence'; licenceId: string | null; endWeekExclusive: number | null }
export type ContinuationChoice = {
  key: string
  request: ContinuationRequest
  predecessorTitle: string
  quote: ContinuationQuote
  /** The refusal reason as the player reads it (ids replaced by titles); null for a lawful choice. */
  refusal: string | null
  right: RightRelied | null
}
export type ContinuableProperty = {
  storyPropertyId: string
  title: string
  /** Why the studio sees it: it holds the title, or only a licence on another studio's title. */
  standing: 'title' | 'licence'
  /** Null until a continuation first records the property in the franchise root. */
  meters: PropertyMeters | null
  continuities: ContinuityRead[]
  choices: ContinuationChoice[]
}
export type ContinuationPanel = { unavailable: string | null; properties: ContinuableProperty[] }

const keyOf = (r: ContinuationRequest) => `${r.type}:${r.predecessorProductionId}${r.subPropertyId ? `:${r.subPropertyId}` : ''}`

function titleOfFilm(state: GameState, conceptId: string | undefined, fallback: string): string {
  return state.concepts.find((c) => c.id === conceptId)?.title ?? fallback
}

function metersOf(property: FranchiseProperty, week: number): PropertyMeters {
  return { recognition: recognitionReported(property.meter, week), fatigue: fatigueAt(property.meter, week) }
}

function continuitiesOf(property: FranchiseProperty, week: number): ContinuityRead[] {
  return property.branches.map((b) => {
    const meter = b.kind === 'spinoff' ? property.subProperties.find((s) => s.subPropertyId === b.subPropertyId)?.meter : property.meter
    if (meter === undefined) throw new Error(`continuation view: spin-off continuity ${b.branchId} has no SubProperty meter`)
    return { branchId: b.branchId, kind: b.kind, momentum: momentumAt(b, week), band: branchBand(b, meter, week) }
  })
}

function rightOf(state: GameState, studioId: string, q: Extract<ContinuationQuote, { ok: true }>): RightRelied {
  const week = state.market.tick
  const answer = q.use === 'spinoff'
    ? branchAuthority(state, { parentPropertyId: q.storyPropertyId, branch: q.subPropertyId ?? q.branchId ?? 'new continuity' }, week)
    : permissionFor(state, studioId, { right: 'R1', propertyId: q.storyPropertyId }, 'R3', { use: q.use }, week)
  if (answer.kind !== 'authority' && answer.kind !== 'permitted') {
    throw new Error(`continuation view: the core quoted ${q.type} on ${q.storyPropertyId} as lawful, but P16 answers ${answer.reason}`)
  }
  if (answer.licenceId === null) return { via: 'title', licenceId: null, endWeekExclusive: null }
  const licence = state.rights.licences.find((l) => l.id === answer.licenceId)
  if (licence === undefined) throw new Error(`continuation view: P16 answered with unknown licence ${answer.licenceId}`)
  return { via: 'licence', licenceId: licence.id, endWeekExclusive: licence.endWeekExclusive }
}

/**
 * Every property the studio holds the title to, or holds a licence on, that has released work, with each typed
 * continuation of each of its released or locked works quoted by the core for THIS package (the proposed principals
 * feed the continuity credit exactly as the greenlight will). Reboot is quoted once per property (the cited film is
 * provenance only); a spin-off is quoted per unpromoted SubProperty.
 */
export function continuationPanel(state: GameState, proposed?: ProposedPrincipals): ContinuationPanel {
  const studioId = state.hollywood?.playerStudioId
  if (studioId === undefined) {
    return { unavailable: 'Continuations read story rights in the living industry, and this studio has no living industry.', properties: [] }
  }
  const week = state.market.tick
  const world = continuationWorldOf(state)
  const root = franchisesOf(state)
  const productionId = predictProductionId(state)
  // continuation uses are R3 licences on a property (R4 licences are cross-media and never answer a continuation)
  const licensed = new Set(licencesHeldBy(state, studioId, week).flatMap((l) => (l.right === 'R3' && l.subject.right === 'R1' ? [l.subject.propertyId] : [])))
  const properties: ContinuableProperty[] = []
  for (const p of resolveTitles(state).properties) {
    const holder = currentHolder(state, { right: 'R1', propertyId: p.propertyId }, week)
    const held = holder.kind === 'holder' && holder.holderId === studioId
    if (!held && !licensed.has(p.propertyId)) continue
    const released = p.workLinks.filter((id) => world.releasedFilm(id) !== null)
    if (released.length === 0) continue
    const works = p.workLinks.filter((id) => released.includes(id) || world.isLocked(id))
    const franchise = root.properties.find((f) => f.storyPropertyId === p.propertyId)
    const newest = released.reduce((a, b) => (world.releasedFilm(b)!.result.releaseTick > world.releasedFilm(a)!.result.releaseTick ? b : a))
    const requests: ContinuationRequest[] = [
      ...works.flatMap((id) => (['directSequel', 'prequel', 'remake'] as const).map((type) => ({ type, predecessorProductionId: id }))),
      { type: 'reboot', predecessorProductionId: newest },
      ...works.flatMap((id) => (franchise?.subProperties ?? [])
        .filter((s) => s.promotedToStoryPropertyId === null)
        .map((s): ContinuationRequest => ({ type: 'spinOff', predecessorProductionId: id, subPropertyId: s.subPropertyId }))),
    ]
    const title = p.title ?? titleOfFilm(state, p.conceptId, p.propertyId)
    const choices = requests.map((request): ContinuationChoice => {
      const quote = continuationQuote(world, { studioId, productionId, request, ...(proposed ? { proposed } : {}) })
      const film = world.releasedFilm(request.predecessorProductionId)?.result
      const locked = state.studio.activeProductions.find((x) => x.id === request.predecessorProductionId)
      const predecessorTitle = titleOfFilm(state, film?.conceptId ?? locked?.conceptId, request.predecessorProductionId)
      return {
        key: keyOf(request),
        request,
        predecessorTitle,
        quote,
        // the refusal's own words, with the film and property ids it names shown by their titles
        refusal: quote.ok ? null : quote.reason.split(request.predecessorProductionId).join(predecessorTitle).split(p.propertyId).join(title),
        right: quote.ok ? rightOf(state, studioId, quote) : null,
      }
    })
    properties.push({
      storyPropertyId: p.propertyId,
      title,
      standing: held ? 'title' : 'licence',
      meters: franchise ? metersOf(franchise, week) : null,
      continuities: franchise ? continuitiesOf(franchise, week) : [],
      choices,
    })
  }
  return { unavailable: null, properties }
}

// ── featured appearances (cameo bookings) ─────────────────────────────────────

export type GuestRow = { talentId: string; name: string; quote: CameoQuoteResult }
export type GuestPanel = {
  unavailable: string | null
  capacity: number
  /** The standard schedule's shooting weeks for a picture greenlit this week (the core's own projection). */
  workWeeks: number[]
  /** The week these quotes are for: the asked week, else the first standard shooting week. */
  workWeek: number
  eligible: GuestRow[]
  refused: GuestRow[]
  scanned: number
}

// ponytail: fame order, stop at GUEST_SHOW eligible or GUEST_SCAN quotes (one quote per person per Review render);
// add search or paging if players need deeper benches.
const GUEST_SCAN = 200
const GUEST_SHOW = 6

/** Quotes for one work week, most famous first, skipping the package's own principals (the core refuses them). */
export function featuredGuestPanel(state: GameState, askedWeek: number | null, exclude: ReadonlySet<string>): GuestPanel {
  const week = state.market.tick
  const capacity = featuredCapacity(week)
  const workWeeks = nominalShootingWeeks(week)
  const workWeek = askedWeek ?? workWeeks[0] ?? week + 1
  const empty = { capacity, workWeeks, workWeek, eligible: [], refused: [], scanned: 0 }
  if (state.hollywood === null) return { ...empty, unavailable: 'Featured appearances read studio employment in the living industry, and this studio has no living industry.' }
  if (!economyEngaged(state)) return { ...empty, unavailable: 'Featured appearances need the engaged studio economy (their fee and the employment law they read), which this studio has not engaged.' }
  if (capacity === 0) return { ...empty, unavailable: `Featured appearances unlock at week ${TUNING.P17_CAMEO_UNLOCK_WEEK} (1956 Week 1); this is week ${week}.` }
  const candidates = state.talent
    .filter((t) => !exclude.has(t.id))
    .sort((a, b) => b.fame - a.fame || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .slice(0, GUEST_SCAN)
  const eligible: GuestRow[] = []
  const refused: GuestRow[] = []
  let scanned = 0
  for (const t of candidates) {
    if (eligible.length >= GUEST_SHOW) break
    scanned++
    const row = { talentId: t.id, name: t.name, quote: cameoQuote(state, { talentId: t.id, workWeek }) }
    if (row.quote.ok) eligible.push(row)
    else if (refused.length < GUEST_SHOW) refused.push(row)
  }
  return { unavailable: null, capacity, workWeeks, workWeek, eligible, refused, scanned }
}

/** True when this screenplay was carried over from an acquired studio: its greenlight refuses featured guests. */
export function carriedScreenplay(state: GameState, projectId: string): boolean {
  return continuedScriptOwner(state, projectId) !== null
}

/** The booking request a greenlight carries for an accepted quote: exactly the quoted fee and basis. */
export function bookingRequestOf(quote: Extract<CameoQuoteResult, { ok: true }>): CameoBookingRequest {
  return { talentId: quote.talentId, workWeek: quote.workWeek, fee: quote.fee, basis: quote.basis }
}

export type BookingRow = {
  bookingId: string
  productionId: string
  pictureTitle: string
  talentId: string
  name: string
  workWeek: number
  fee: number
  retained: number
  status: CameoBooking['status']
  cancelReason: CameoBooking['cancelReason']
  refund: number | null
  completedWeek: number | null
  /** The permanent career credit the release wrote (null until then, forever for unperformed work). */
  credit: { starPowerBefore: number; starPowerAfter: number } | null
}

function bookingRow(state: GameState, b: CameoBooking): BookingRow {
  const production = state.studio.activeProductions.find((p) => p.id === b.productionId)
  const film = state.studio.releasedFilms.find((f) => f.productionId === b.productionId)
  return {
    bookingId: b.bookingId,
    productionId: b.productionId,
    pictureTitle: titleOfFilm(state, production?.conceptId ?? film?.conceptId, b.productionId),
    talentId: b.talentId,
    name: state.talent.find((t) => t.id === b.talentId)?.name ?? b.talentId,
    workWeek: b.workWeek,
    fee: b.fee,
    retained: b.retained,
    status: b.status,
    cancelReason: b.cancelReason,
    refund: b.refund,
    completedWeek: b.completedWeek,
    credit: b.careerEvent ? { starPowerBefore: b.careerEvent.starPowerBefore, starPowerAfter: b.careerEvent.starPowerAfter } : null,
  }
}

/** The player's bookings on pictures still in production (the production screen's list). */
export function productionBookings(state: GameState): BookingRow[] {
  const player = state.hollywood?.playerStudioId
  const active = new Set(state.studio.activeProductions.map((p) => p.id))
  return (state.cameos?.bookings ?? []).filter((b) => b.studioId === player && active.has(b.productionId)).map((b) => bookingRow(state, b))
}

export function cancelCameoBookingAction(state: GameState, bookingId: string): ActionOutcome {
  try {
    return { ok: true, next: applyActions(state, [{ kind: 'cancelCameoBooking', bookingId }]) }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

// ── outcomes (the released film) ──────────────────────────────────────────────

/** `momentum` is null when the continuity was not recorded in that state (never an invented zero). */
export type MeterSnapshot = PropertyMeters & { momentum: number | null }
export type ReleaseOutcome = {
  lineage: {
    storyPropertyId: string
    /** The P16 property's resolved title (its founding concept's title when it has none of its own). */
    propertyTitle: string
    type: LineageEdgeType
    parentProductionId: string | null
    parentTitle: string | null
    branchId: string
    branchKind: FranchiseBranchKind
    greenlitWeek: number | null
    releasedWeek: number | null
    /** The property's Recognition peak is this film (the meter's own record), and the activeAgain milestone it minted. */
    propertyPeak: boolean
    activeAgain: boolean
    /** Read from the root before the release tick; null when the property was not yet recorded then. */
    before: MeterSnapshot | null
    after: MeterSnapshot
    /** Titles of other films this same tick released into this property: the before/after pair spans them too. */
    sharedWith: string[]
  } | null
  guests: BookingRow[]
}

function snapshot(property: FranchiseProperty, branch: FranchiseBranch | undefined, week: number): MeterSnapshot {
  return { ...metersOf(property, week), momentum: branch ? momentumAt(branch, week) : null }
}

/** What the release record says about one film: its lineage edge and meters around the release, and its bookings. */
export function releaseOutcome(preTick: GameState, postTick: GameState, productionId: string, coReleased: readonly string[] = []): ReleaseOutcome {
  const guests = (postTick.cameos?.bookings ?? []).filter((b) => b.productionId === productionId).map((b) => bookingRow(postTick, b))
  const found = installmentEdgeFor(franchisesOf(postTick), productionId)
  if (found === null) return { lineage: null, guests }
  const { property, edge } = found
  const branch = property.branches.find((b) => b.branchId === edge.branchId)
  if (branch === undefined) throw new Error(`continuation view: ${property.storyPropertyId} has no continuity ${edge.branchId}`)
  const before = franchisesOf(preTick).properties.find((p) => p.storyPropertyId === property.storyPropertyId)
  const parentFilm = edge.parentProductionId === null ? undefined : postTick.studio.releasedFilms.find((f) => f.productionId === edge.parentProductionId)
  const resolved = resolveTitles(postTick).properties.find((p) => p.propertyId === property.storyPropertyId)
  return {
    lineage: {
      storyPropertyId: property.storyPropertyId,
      propertyTitle: resolved?.title ?? titleOfFilm(postTick, resolved?.conceptId, property.storyPropertyId),
      type: edge.type,
      parentProductionId: edge.parentProductionId,
      parentTitle: edge.parentProductionId === null ? null : titleOfFilm(postTick, parentFilm?.conceptId, edge.parentProductionId),
      branchId: edge.branchId,
      branchKind: branch.kind,
      greenlitWeek: edge.greenlitWeek,
      releasedWeek: edge.releasedWeek,
      propertyPeak: property.meter.peakInstallmentId === productionId,
      activeAgain: property.milestones.some((m) => m.milestoneId === 'activeAgain' && m.productionId === productionId),
      before: before ? snapshot(before, before.branches.find((b) => b.branchId === edge.branchId), preTick.market.tick) : null,
      after: snapshot(property, branch, postTick.market.tick),
      sharedWith: coReleased
        .filter((id) => id !== productionId && property.installments.some((e) => e.childProductionId === id))
        .map((id) => titleOfFilm(postTick, postTick.studio.releasedFilms.find((f) => f.productionId === id)?.conceptId, id)),
    },
    guests,
  }
}

export const BAND_LABEL: Record<ContinuationBand, string> = {
  new: 'New',
  active: 'Active',
  activeAgain: 'Active again',
  cooling: 'Cooling',
  dormant: 'Dormant',
  revivalCandidate: 'Revival candidate',
}
export const BRANCH_KIND_LABEL: Record<FranchiseBranchKind, string> = { main: 'main continuity', reboot: 'reboot continuity', spinoff: 'spin-off continuity' }
export const USE_LABEL: Record<'sequel' | 'remake' | 'spinoff', string> = { sequel: 'the sequel right', remake: 'the remake right', spinoff: 'the spin-off right' }
export const CANCEL_REASON_LABEL: Record<NonNullable<CameoBooking['cancelReason']>, string> = {
  explicit: 'cancelled by the studio',
  missedWork: 'the picture did not shoot that week',
  productionCancelled: 'the picture was cancelled',
  employmentExit: 'their employment with the studio ended',
  rightsLoss: 'the picture was held for lost rights',
}
export const BASIS_LABEL: Record<CameoBooking['basis'], string> = { employee: 'own employee', freelance: 'freelance' }

export const CONTINUATION_TYPE_LABEL: Record<LineageEdgeType, string> = {
  origin: 'Original',
  directSequel: 'Direct sequel',
  prequel: 'Prequel',
  remake: 'Remake',
  reboot: 'Reboot',
  spinOff: 'Spin-off',
}
