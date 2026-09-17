// ── R3-N7-SIM-01 — the read-only Studio Operations Events projection ─────────
//
// WHAT THIS IS. One pure, deterministic, RNG-free view over `state.studioEvents`
// — the engine's own operating ledger (`src/core/studioEvents.ts`) — so the
// client's History surface can RETRIEVE what an attention cue pointed at after
// the cue is gone. The N7 family sheet §3 states the law it serves: the cue is
// the pointer, History is the record.
//
// WHAT IT IS NOT. It is not a journal, not a second history root, not a
// consumption cursor, and not a producer: nothing here writes, stores, compacts
// or reads back into the simulation. `studioEvents` pin 3 ("witness, never
// input") and pin 5 ("no seen/consumed field, ever") both stay true because this
// module is a projection and has no state of its own.
//
// THE THREE HONESTY RULES IT ENFORCES.
//   1. NAMES, NEVER IDS, IN THE SENTENCE. Every `summary` resolves its subject
//      through an EXISTING read model — the concept title, the placed building's
//      blueprint name (or the frozen `studioHistory` name once the body is gone),
//      the set's own name, the facility's own name, `PHASE_LABEL`,
//      `queueEntryLabel`. When a name cannot be resolved the sentence says the
//      smaller true thing; it never prints a raw id and never guesses a name.
//   2. IDS, NEVER NAMES, IN THE SUBJECT. `subject.id` is the exact engine id the
//      client deep-links with. `subject` is null only where the row genuinely
//      carries no durable identity (see `queueAdmitted` and the pre-V15
//      `queueIntentExpired` below) — absence is stated, never filled in.
//   3. COVERAGE IS PUBLISHED, NOT ASSUMED. Tier W is windowed by
//      `TUNING.STUDIO_EVENT_WINDOW_WEEKS`; `coverage` carries the window, the
//      oldest week still retained and the permanent kinds so the client prints
//      the honest 26-week sentence from the wire instead of writing it by hand.
//
// ROUTES. The route triple is exactly `BridgeHistoryEventSnapshot`'s
// (`bridge/history.ts`), so History's shipped routing serves these rows without
// a second routing vocabulary. `personId` is ALWAYS null: not one of the sixteen
// kinds carries a talent id, and that absence is stated rather than invented.
import { campaignDate } from '../src/core/calendar.ts'
import { blueprintById } from '../src/core/placement.ts'
import { PHASE_LABEL } from '../src/core/studioQueueView.ts'
import { queueEntryLabel } from '../src/core/productionQueue.ts'
import { setupRecipeById } from '../src/core/productionSetup.ts'
import { setById } from '../src/core/sets.ts'
import {
  isTierDStudioEventKind,
  TIER_D_STUDIO_EVENT_KINDS,
} from '../src/core/studioEvents.ts'
import { studioHistoryChronology } from '../src/core/studioHistory.ts'
import { TUNING } from '../src/core/tuning.ts'
import { findConcept } from '../ui/src/engine/adapter.ts'
import type {
  GameState,
  ProductionQueueEntry,
  StudioEvent,
  StudioEventKind,
} from '../src/core/types.ts'

/** Where a row points. The exact engine id, never a label. */
export type BridgeOperationsEventSubject = {
  kind: 'production' | 'film' | 'building' | 'set' | 'queue' | 'resource'
  id: string
}

/**
 * The SAME route triple `BridgeHistoryEventSnapshot` publishes, so one History
 * renderer routes narrative rows and operations rows identically. A null member
 * means "no such route exists for this row", never "look somewhere else".
 */
export type BridgeOperationsEventRoute = {
  /** Exact durable P07 result route (`productionId`) when a result row exists. */
  filmId: string | null
  /** Always null for these sixteen kinds: none of them carries a talent id. */
  personId: string | null
  /** Exact world body id (`placed-<placementId>`) when a current body exists. */
  buildingId: string | null
}

export type BridgeOperationsEventSnapshot = {
  /** The log's own ordering authority. Never rewinds, never renumbers. */
  seq: number
  week: number
  /** The authoritative calendar label, exactly as history states it. */
  date: string
  kind: StudioEventKind
  /** A property of the KIND (studioEvents pin 4), not of the row. */
  tier: 'permanent' | 'windowed'
  /** Tier D -> 'major', Tier W -> 'standard', so History's four shipped chips filter both lists. */
  significance: 'major' | 'standard'
  /** The player sentence. Names resolved through existing read models; never a raw id. */
  summary: string
  /** Exact deep-link identity, or null when the row carries none. */
  subject: BridgeOperationsEventSubject | null
  route: BridgeOperationsEventRoute
}

export type BridgeOperationsEventsCoverage = {
  /** `TUNING.STUDIO_EVENT_WINDOW_WEEKS` — the Tier-W retention window. */
  windowWeeks: number
  /**
   * The oldest week whose windowed rows are still retained, or null when the log
   * holds no windowed row at all (there is then no retained span to describe,
   * and the client must not print a range that covers nothing).
   */
  oldestWindowedWeek: number | null
  /** The permanent kinds, read from the engine's own Tier-D list — never a copy. */
  permanentKinds: StudioEventKind[]
}

export type BridgeOperationsEventsProjection = {
  currentWeek: number
  coverage: BridgeOperationsEventsCoverage
  /** How many published rows are permanent and how many are windowed. */
  totals: { permanent: number; windowed: number }
  /** Every row in the log, week-descending (newest first), then seq-descending. */
  rows: BridgeOperationsEventSnapshot[]
}

const QUEUE_ENTRY_KINDS: readonly ProductionQueueEntry['kind'][] = [
  'commissionScript',
  'commissionOriginalScreenplay',
  'startCastingSession',
  'greenlightScriptProject',
]

const NO_ROUTE: BridgeOperationsEventRoute = { filmId: null, personId: null, buildingId: null }

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

/**
 * The studio's own word for a queue intent, reused rather than copied.
 * `queueEntryLabel` switches on `kind` alone, so the narrowed discriminant is
 * the whole of its input; an unrecognised kind (a widened save) keeps its own
 * bare word rather than being renamed by this projection.
 */
function queueKindLabel(entryKind: string): string {
  const kind = QUEUE_ENTRY_KINDS.find((candidate) => candidate === entryKind)
  if (kind === undefined) return entryKind
  return queueEntryLabel({ kind } as unknown as ProductionQueueEntry)
}

/**
 * The name behind a queue row's captured subject id, by the kind that captured
 * it (`queueEntrySubjectId`): a writer for an original-screenplay commission, a
 * script project or a market concept for the other three. Null when nothing in
 * the world answers to that id any more — the caller then says less, never more.
 */
function queueSubjectName(state: GameState, entryKind: string, subjectId: string): string | null {
  if (entryKind === 'commissionOriginalScreenplay') {
    return state.talent.find((talent) => talent.id === subjectId)?.name ?? null
  }
  const project = state.scriptDevelopment.projects.find((candidate) => candidate.id === subjectId)
  if (project !== undefined) return findConcept(state, project.conceptId)?.title ?? null
  return findConcept(state, subjectId)?.title ?? null
}

export function operationsEventsProjection(state: GameState): BridgeOperationsEventsProjection {
  const currentWeek = state.market.tick
  // P13B-S5-R07 / projection 38: the four setup history kinds are published here
  // beside every other operating row. Their engine payload carries production,
  // recipe, plan revision, stage, Set, route and units; rule 1 still binds the
  // SENTENCE, so each one resolves those ids to the studio's own names and keeps
  // the exact production id in `subject` for the client's deep link.
  const rows = state.studioEvents.rows

  // ── Name resolution, entirely through existing authorities ────────────────
  const resultIds = new Set(state.studio.releasedFilms.map((film) => film.productionId))
  const titleOf = (productionId: string): string | null => {
    const active = state.studio.activeProductions.find(
      (production) => production.id === productionId,
    )
    if (active !== undefined) return findConcept(state, active.conceptId)?.title ?? null
    const released = state.studio.releasedFilms.find((film) => film.productionId === productionId)
    if (released !== undefined) return findConcept(state, released.conceptId)?.title ?? null
    return null
  }
  const facilityName = (facilityId: string): string | null =>
    state.operations.facilities.find((facility) => facility.id === facilityId)?.name ?? null
  const placementOf = (placementId: string) =>
    state.placement.facilities.find((placed) => String(placed.id) === placementId)
  const buildingName = (placementId: string): string | null => {
    const placed = placementOf(placementId)
    if (placed !== undefined) return blueprintById(placed.blueprintId)?.name ?? null
    // The body is gone (demolished or moved). `studioHistory` froze the building's
    // display name at its own facility rows precisely so a later rename or removal
    // cannot take the name away; this reads that frozen fact, it never guesses one.
    for (const row of studioHistoryChronology(state.studioHistory)) {
      if (
        (row.kind === 'facilityCommitted' ||
          row.kind === 'facilityCompleted' ||
          row.kind === 'facilityDemolished' ||
          row.kind === 'facilityMoved') &&
        String(row.placementId) === placementId
      ) {
        return row.name
      }
    }
    return null
  }
  /** The body id of the CURRENT placement contributing a facility, or null. */
  const bodyOfFacility = (facilityId: string): string | null => {
    const placed = state.placement.facilities.find(
      (candidate) => candidate.facilityId === facilityId && candidate.status === 'operational',
    )
    return placed === undefined ? null : `placed-${String(placed.id)}`
  }
  /** The setup catalogue's own word for a recipe; the bare id only if it ever left the catalogue. */
  const recipeName = (recipeId: string): string => setupRecipeById(recipeId)?.name ?? recipeId
  /** " on Sound Stage 7, using the Grand Ballroom" — whichever halves can be named. */
  const placeOf = (stageFacilityId: string, setId: string): string => {
    const stage = facilityName(stageFacilityId)
    const set = setById(state.sets, setId)?.name ?? null
    const where = stage === null ? '' : ` on ${stage}`
    return set === null ? where : `${where}, using the ${set}`
  }
  const filmRoute = (productionId: string): BridgeOperationsEventRoute => ({
    filmId: resultIds.has(productionId) ? productionId : null,
    personId: null,
    buildingId: null,
  })

  const snapshots: BridgeOperationsEventSnapshot[] = rows.map((row) => {
    const { summary, subject, route } = describeRow(row)
    const tier = isTierDStudioEventKind(row.kind) ? 'permanent' : 'windowed'
    return {
      seq: row.seq,
      week: row.week,
      date: campaignDate(row.week).label,
      kind: row.kind,
      tier,
      significance: tier === 'permanent' ? 'major' : 'standard',
      summary,
      subject,
      route,
    }
  })

  function describeRow(row: StudioEvent): {
    summary: string
    subject: BridgeOperationsEventSubject | null
    route: BridgeOperationsEventRoute
  } {
    switch (row.kind) {
      case 'wrapped': {
        const title = titleOf(row.productionId)
        const stage = facilityName(row.stageFacilityId)
        const set = row.setId === null ? null : setById(state.sets, row.setId)?.name ?? null
        const where = stage === null ? '' : ` on ${stage}`
        const on = set === null ? '' : `, using the ${set}`
        return {
          summary: title === null
            ? `A picture wraps${where}${on}.`
            : `${title} wraps${where}${on}.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'premiere': {
        const title = titleOf(row.filmId)
        return {
          summary: title === null ? 'A picture premieres.' : `${title} premieres.`,
          subject: { kind: 'film', id: row.filmId },
          route: filmRoute(row.filmId),
        }
      }
      case 'releaseCommitted': {
        const title = titleOf(row.productionId)
        return {
          summary: title === null
            ? 'A picture is committed to release.'
            : `${title} is committed to release.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'constructionCompleted': {
        const name = buildingName(row.placementId)
        const placed = placementOf(row.placementId)
        return {
          summary: name === null
            ? 'A building opens on the lot.'
            : `${name} opens on the lot.`,
          subject: { kind: 'building', id: row.placementId },
          route: {
            filmId: null,
            personId: null,
            buildingId: placed === undefined ? null : `placed-${String(placed.id)}`,
          },
        }
      }
      case 'setBuilt': {
        const set = setById(state.sets, row.setId)
        const stage = set === null ? null : facilityName(set.mountedOn)
        const where = stage === null ? '' : ` on ${stage}`
        return {
          summary: set === null
            ? `A new set is standing${where}.`
            : `The ${set.name} is standing${where}.`,
          subject: { kind: 'set', id: row.setId },
          route: {
            filmId: null,
            personId: null,
            buildingId: set === null ? null : bodyOfFacility(set.mountedOn),
          },
        }
      }
      case 'setRetired': {
        const set = setById(state.sets, row.setId)
        const name = set === null ? 'A set' : `The ${set.name}`
        const refund = row.refund > 0 ? `; ${money(row.refund)} returns to the studio` : ''
        return {
          summary: `${name} is struck${refund}.`,
          subject: { kind: 'set', id: row.setId },
          route: {
            filmId: null,
            personId: null,
            buildingId: set === null ? null : bodyOfFacility(set.mountedOn),
          },
        }
      }
      case 'reservationGranted':
      case 'reservationReleased': {
        const verb = row.kind === 'reservationGranted' ? 'takes' : 'releases'
        const title = titleOf(row.ownerId)
        const holder = title ?? 'A picture'
        const separator = row.resourceKey.lastIndexOf(':')
        const facilityId = separator < 0 ? row.resourceKey : row.resourceKey.slice(0, separator)
        const slot = separator < 0 ? null : row.resourceKey.slice(separator + 1)
        const name = facilityName(facilityId)
        const where = name === null
          ? 'a studio slot'
          : slot === null ? name : `${name} slot ${slot}`
        return {
          summary: `${holder} ${verb} ${where}.`,
          subject: { kind: 'resource', id: row.resourceKey },
          route: { filmId: null, personId: null, buildingId: bodyOfFacility(facilityId) },
        }
      }
      case 'phaseEntered': {
        const title = titleOf(row.productionId)
        const phase = PHASE_LABEL[row.phase]
        return {
          summary: title === null
            ? `A picture enters ${phase}.`
            : `${title} enters ${phase}.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'sceneryArrived': {
        const title = titleOf(row.productionId)
        return {
          summary: title === null ? 'Scenery arrives on the stage.' : `Scenery arrives for ${title}.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      // ── P13B-S5-R07 — the setup subtask's own four rows ───────────────────
      case 'setupAdmitted': {
        const picture = titleOf(row.productionId) ?? 'A picture'
        return {
          summary: `${picture} begins its ${recipeName(row.recipeId)} setup${placeOf(row.stageFacilityId, row.setId)} — ` +
            `${String(row.requiredUnits)} weeks on the ${row.route} route.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'setupUnitCredited': {
        const picture = titleOf(row.productionId) ?? 'A picture'
        return {
          summary: `${picture} completes setup week ${String(row.creditedUnits)} of ${String(row.requiredUnits)}.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'setupCompleted': {
        const picture = titleOf(row.productionId) ?? 'A picture'
        return {
          summary: `${picture} finishes its ${recipeName(row.recipeId)} setup after ${String(row.creditedUnits)} weeks, and is ready to shoot.`,
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'setupRebound': {
        const picture = titleOf(row.productionId) ?? 'A picture'
        return {
          // The engine keeps the earlier work in `priorWork` and never recycles it
          // into the new credit; the sentence says exactly that and no more.
          summary: `${picture} starts its ${recipeName(row.recipeId)} setup again${placeOf(row.stageFacilityId, row.setId)}. ` +
            'The weeks already worked stay in its history.',
          subject: { kind: 'production', id: row.productionId },
          route: filmRoute(row.productionId),
        }
      }
      case 'queueAdmitted': {
        // NO SUBJECT, and it is not an omission. This row carries only the
        // intent's kind and its queue ordinal, and the ordinal is a fairness key
        // AMONG THE ROWS CURRENTLY WAITING that restarts at 0 whenever the queue
        // drains (`nextQueueOrdinal`) — so it addresses no durable identity and
        // must never be handed to a client as a deep link.
        return {
          summary: `${queueKindLabel(row.entryKind)} joins the queue.`,
          subject: null,
          route: NO_ROUTE,
        }
      }
      case 'queueIntentExpired': {
        const label = queueKindLabel(row.entryKind)
        // `subjectId` is null ONLY on rows migrated forward from a pre-V15 save,
        // which recorded no identity. The sentence then names the intent and
        // nothing else; no subject is guessed from the kind or the ordinal.
        const name = row.subjectId === null
          ? null
          : queueSubjectName(state, row.entryKind, row.subjectId)
        const subject = name === null ? label : `${label} for ${name}`
        return {
          // `reason` is already the engine's own player copy: passed through verbatim.
          summary: `${subject} leaves the queue — ${row.reason}.`,
          subject: row.subjectId === null ? null : { kind: 'queue', id: row.subjectId },
          route: NO_ROUTE,
        }
      }
      default: {
        const exhaustive: never = row
        throw new Error(`operationsEventsProjection: unknown row ${JSON.stringify(exhaustive)}`)
      }
    }
  }

  // Newest first. `seq` is unique and never renumbered by compaction, so this is
  // a total order that survives the window closing on a week.
  snapshots.sort((a, b) => (b.week - a.week) || (b.seq - a.seq))

  const windowed = snapshots.filter((snapshot) => snapshot.tier === 'windowed')
  return {
    currentWeek,
    coverage: {
      windowWeeks: TUNING.STUDIO_EVENT_WINDOW_WEEKS,
      // The retention floor the engine's own compaction uses, clamped at week 0:
      // `compactStudioEvents` keeps the current week and the WINDOW-1 weeks before it.
      oldestWindowedWeek: windowed.length === 0
        ? null
        : Math.max(0, currentWeek - (TUNING.STUDIO_EVENT_WINDOW_WEEKS - 1)),
      permanentKinds: [...TIER_D_STUDIO_EVENT_KINDS],
    },
    totals: {
      permanent: snapshots.length - windowed.length,
      windowed: windowed.length,
    },
    rows: snapshots,
  }
}
