// ── P08A W2 — the closed Standing & Studio History projection (charter P08 §12) ─
//
// Pure, deterministic, RNG-free view over EXISTING core truth: the three
// Standing channels with their accepted meanings, every recorded Standing
// receipt (the frozen before/after/deltas/source/driver facts), the sparse
// durable timeline, the film index, and the people credited on recorded films.
// Everything here is a direct read of `state.studioHistory` and the P07
// authorities it references — the bridge never re-derives a Standing formula,
// never recomputes a delta, never fabricates a row for a week before the
// recording boundary, and never turns a projected P07 total into settled truth.
//
// Deep links are EXACT IDS (P07-R limits): a film row carries the production id
// and whether a durable result exists for it (`resultAvailable`); a person row
// carries the talent id and whether a body currently stands on the lot
// (`onLot`); a released film never has a Locate target (`subjectLocation: none`).
import { findConcept, standingChannels } from '../ui/src/engine/adapter.ts'
import { HISTORY_ROUTINE_WINDOW_WEEKS, studioHistoryChronology } from '../src/core/studioHistory.ts'
import { studioPresence } from '../src/core/presence.ts'
import type {
  GameState,
  Standing,
  StudioHistoryEvent,
  StudioHistorySignificance,
} from '../src/core/types.ts'

export type BridgeStandingValues = {
  audienceAwareness: number
  industryPrestige: number
  commercialConfidence: number
}

export type BridgeStandingChannelSnapshot = {
  key: 'audienceAwareness' | 'industryPrestige' | 'commercialConfidence'
  label: string
  meaning: string
  value: number
  /** Net recorded change since the recording boundary (sum of every receipt's delta). */
  recordedChange: number
}

export type BridgeStandingReceiptSnapshot = {
  eventId: number
  week: number
  /** `settled` = one folded summary of routine weekly settling over a window. */
  sourceKind: 'releaseResult' | 'publicity' | 'awarenessDrift' | 'settled'
  sourceId: string | null
  sourceLabel: string
  significance: StudioHistorySignificance
  before: BridgeStandingValues
  after: BridgeStandingValues
  deltas: BridgeStandingValues
  reasonLines: string[]
  formulaVersion: string
  /** Exact P07 result route when the source is a released film with a durable result. */
  filmId: string | null
  /** Folded summaries only: the exact window and count they stand for. */
  weekStart: number | null
  weekEnd: number | null
  count: number | null
}

export type BridgeHistoryEventSnapshot = {
  eventId: number
  week: number
  kind: StudioHistoryEvent['kind']
  significance: StudioHistorySignificance
  headline: string
  detail: string
  subjectKind: 'studio' | 'film' | 'person' | 'facility'
  subjectId: string | null
  subjectLabel: string
  /** `current` = a body exists on the lot now; `historical` = it existed but no longer; `none` = never a lot body (films, the studio). */
  subjectLocation: 'current' | 'historical' | 'none'
  /** Exact durable-result route (P07 `StudioFilmResultSnapshot.id`) or null. */
  filmId: string | null
  /** Exact person route (P10) — a talent id when the subject is a person, else null. */
  personId: string | null
  /** Exact world body id when a current facility body exists, else null. */
  buildingId: string | null
}

export type BridgeHistoryFilmSnapshot = {
  productionId: string
  title: string
  releaseWeek: number
  /** Whether the release itself was recorded (released at or after the boundary). */
  historyRecorded: boolean
  /** Whether a durable P07 result row exists for this exact id. */
  resultAvailable: boolean
  historyEventIds: number[]
}

export type BridgeHistoryCreditSnapshot = {
  productionId: string
  title: string
  roleLabel: string
}

export type BridgeHistoryPersonSnapshot = {
  talentId: string
  name: string
  roleLabel: string
  /** Credits captured on released films (P07 `participants`) — never inferred. */
  credits: BridgeHistoryCreditSnapshot[]
  /** Films released without captured participants: the honest gap count. */
  uncapturedFilms: number
  onLot: boolean
  /** Whether the person still exists in the studio's talent records. */
  present: boolean
}

export type BridgeHistoryProjection = {
  recordingStartedWeek: number
  currentWeek: number
  /** The exact honesty sentence for pre-boundary absence, or null when recording began at week 0. */
  notRecordedNotice: string | null
  standing: {
    channels: BridgeStandingChannelSnapshot[]
    receipts: BridgeStandingReceiptSnapshot[]
    /** Weeks of routine settling detail kept in full before folding (the retention budget). */
    routineWindowWeeks: number
  }
  timeline: BridgeHistoryEventSnapshot[]
  films: BridgeHistoryFilmSnapshot[]
  people: BridgeHistoryPersonSnapshot[]
  /** P08-R4: fact-backed records need a complete comparison universe; none is claimed yet. */
  recordsAvailable: boolean
  recordsNotice: string
}

const ROLE_LABEL: Record<string, string> = {
  writer: 'Writer',
  director: 'Director',
  actor: 'Actor',
  craft: 'Crew',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
}

function values(standing: Standing): BridgeStandingValues {
  return {
    audienceAwareness: standing.audienceAwareness,
    industryPrestige: standing.industryPrestige,
    commercialConfidence: standing.commercialConfidence,
  }
}

function signed(value: number): string {
  const rounded = Math.round(value * 10) / 10
  if (rounded === 0) return '0.0'
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}`
}

function pct(value01: number): string {
  return `${Math.round(value01 * 100)}%`
}

function money(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function deltaLine(deltas: Standing): string {
  return `Awareness ${signed(deltas.audienceAwareness)} · Prestige ${signed(deltas.industryPrestige)} · Confidence ${signed(deltas.commercialConfidence)}`
}

export function historyProjection(state: GameState): BridgeHistoryProjection {
  const history = state.studioHistory
  const currentWeek = state.market.tick
  const chronology = studioHistoryChronology(history)
  const titleOf = (productionId: string, conceptId: string | null): string => {
    const film = state.studio.releasedFilms.find((f) => f.productionId === productionId)
    const concept = findConcept(state, conceptId ?? film?.conceptId ?? '')
    return concept?.title ?? productionId
  }
  const resultIds = new Set(state.studio.releasedFilms.map((f) => f.productionId))
  const presence = studioPresence(state)
  const onLot = new Set(presence.people.map((p) => p.talentId))

  // ── Standing ────────────────────────────────────────────────────────────────
  const recorded: Standing = { audienceAwareness: 0, industryPrestige: 0, commercialConfidence: 0 }
  const receipts: BridgeStandingReceiptSnapshot[] = []
  for (const row of chronology) {
    if (row.kind === 'standingChanged') {
      recorded.audienceAwareness += row.deltas.audienceAwareness
      recorded.industryPrestige += row.deltas.industryPrestige
      recorded.commercialConfidence += row.deltas.commercialConfidence
      const reasonLines: string[] = []
      let sourceLabel = ''
      let sourceId: string | null = null
      let filmId: string | null = null
      if (row.source.kind === 'releaseResult' && row.facts.kind === 'releaseResult') {
        const f = row.facts
        sourceId = row.source.productionId
        filmId = resultIds.has(sourceId) ? sourceId : null
        sourceLabel = `Release: ${titleOf(sourceId, null)}`
        reasonLines.push(
          `Reach ${pct(f.reach01)} of the market against a ${pct(f.reachNeutral)} pivot, plus ${pct(f.starAttention01)} star attention — awareness follows box-office reach and star attention.`,
          `Critic score ${f.criticScore.toFixed(1)} against the reachable benchmark of ${f.prestigeBenchmark} — prestige follows critical achievement only.`,
          `Box office returned ${Math.round(f.roi * 100)}% on committed cost with ${pct(f.budgetOverrun01)} budget overrun — confidence follows profitability and budget discipline.`,
        )
      } else if (row.source.kind === 'publicity' && row.facts.kind === 'publicity') {
        sourceId = row.source.sourceId
        sourceLabel = `Publicity: ${tierLabel(row.source.tier)} campaign`
        reasonLines.push(`A ${tierLabel(row.facts.tier)} campaign cost ${money(row.facts.cost)} and lifted awareness by ${signed(row.facts.lift)}.`)
      } else if (row.source.kind === 'awarenessDrift' && row.facts.kind === 'awarenessDrift') {
        sourceLabel = 'Weekly settling'
        reasonLines.push(
          `Awareness above the ${row.facts.anchor} anchor settles by ${Math.round(row.facts.rate * 100)}% of the excess each week (excess ${row.facts.excessBefore.toFixed(1)}).`,
        )
      }
      receipts.push({
        eventId: row.eventId,
        week: row.week,
        sourceKind: row.source.kind,
        sourceId,
        sourceLabel,
        significance: row.significance,
        before: values(row.before),
        after: values(row.after),
        deltas: values(row.deltas),
        reasonLines,
        formulaVersion: row.formulaVersion,
        filmId,
        weekStart: null,
        weekEnd: null,
        count: null,
      })
    } else if (row.kind === 'standingDriftFolded') {
      recorded.audienceAwareness += row.deltas.audienceAwareness
      recorded.industryPrestige += row.deltas.industryPrestige
      recorded.commercialConfidence += row.deltas.commercialConfidence
      receipts.push({
        eventId: row.eventId,
        week: row.week,
        sourceKind: 'settled',
        sourceId: null,
        sourceLabel: `Weekly settling, weeks ${String(row.weekStart)}–${String(row.weekEnd)}`,
        significance: row.significance,
        before: values(row.before),
        after: values(row.after),
        deltas: values(row.deltas),
        reasonLines: [`${String(row.count)} weekly settling receipts folded into one exact summary.`],
        formulaVersion: row.formulaVersion,
        filmId: null,
        weekStart: row.weekStart,
        weekEnd: row.weekEnd,
        count: row.count,
      })
    }
  }
  const channels: BridgeStandingChannelSnapshot[] = standingChannels(state).map((channel) => ({
    key: channel.key,
    label: channel.label,
    meaning: channel.meaning,
    value: channel.value,
    recordedChange: recorded[channel.key],
  }))

  // ── Timeline (main chronology: routine detail excluded) ────────────────────
  const timeline: BridgeHistoryEventSnapshot[] = []
  for (const row of chronology) {
    if (row.significance === 'routine') continue
    const base = {
      eventId: row.eventId,
      week: row.week,
      kind: row.kind,
      significance: row.significance,
      filmId: null as string | null,
      personId: null as string | null,
      buildingId: null as string | null,
    }
    switch (row.kind) {
      case 'studioFounded':
        timeline.push({
          ...base,
          headline: 'Studio founded',
          detail: `The studio opened for business in Week ${String(row.week)}.`,
          subjectKind: 'studio',
          subjectId: null,
          subjectLabel: state.talent.length > 0 ? 'The studio' : 'The studio',
          subjectLocation: 'none',
        })
        break
      case 'filmReleased': {
        const available = resultIds.has(row.productionId)
        timeline.push({
          ...base,
          headline: row.firstRelease ? `First film released: ${row.title}` : `${row.title} released`,
          detail: `Released in Week ${String(row.week)}.${available ? '' : ' Its result record is not available.'}`,
          subjectKind: 'film',
          subjectId: row.productionId,
          subjectLabel: row.title,
          subjectLocation: 'none',
          filmId: available ? row.productionId : null,
        })
        break
      }
      case 'theatricalRunCompleted': {
        const title = titleOf(row.productionId, null)
        timeline.push({
          ...base,
          headline: `${title} finished its run`,
          detail: `${String(row.totalWeeks)} weeks in theaters; the final result is settled.`,
          subjectKind: 'film',
          subjectId: row.productionId,
          subjectLabel: title,
          subjectLocation: 'none',
          filmId: resultIds.has(row.productionId) ? row.productionId : null,
        })
        break
      }
      case 'standingChanged': {
        if (row.source.kind === 'releaseResult') {
          const title = titleOf(row.source.productionId, null)
          timeline.push({
            ...base,
            headline: `Standing changed after ${title}`,
            detail: deltaLine(row.deltas),
            subjectKind: 'film',
            subjectId: row.source.productionId,
            subjectLabel: title,
            subjectLocation: 'none',
            filmId: resultIds.has(row.source.productionId) ? row.source.productionId : null,
          })
        } else if (row.source.kind === 'publicity') {
          timeline.push({
            ...base,
            headline: `${tierLabel(row.source.tier)} publicity campaign`,
            detail: deltaLine(row.deltas),
            subjectKind: 'studio',
            subjectId: null,
            subjectLabel: 'The studio',
            subjectLocation: 'none',
          })
        }
        break
      }
      case 'standingDriftFolded':
        break
      case 'facilityCommitted':
      case 'facilityCompleted':
      case 'facilityDemolished':
      case 'facilityMoved': {
        const verb =
          row.kind === 'facilityCommitted' ? 'Construction started' :
          row.kind === 'facilityCompleted' ? 'Opened' :
          row.kind === 'facilityDemolished' ? 'Demolished' : 'Moved'
        const placed = state.placement.facilities.find((f) => f.id === row.placementId)
        const current = placed !== undefined && placed.facilityId === row.facilityId
        timeline.push({
          ...base,
          headline: `${verb}: ${row.name}`,
          detail: `Week ${String(row.week)}.`,
          subjectKind: 'facility',
          subjectId: row.facilityId,
          subjectLabel: row.name,
          subjectLocation: current ? 'current' : 'historical',
          buildingId: current ? `placed-${String(row.placementId)}` : null,
        })
        break
      }
      case 'careerMilestone': {
        const title = titleOf(row.filmId, null)
        timeline.push({
          ...base,
          headline: `${row.personName}: ${title}`,
          detail: `Career milestone recorded in Week ${String(row.week)}.`,
          subjectKind: 'person',
          subjectId: row.talentId,
          subjectLabel: row.personName,
          subjectLocation: onLot.has(row.talentId) ? 'current' : 'historical',
          personId: row.talentId,
          filmId: resultIds.has(row.filmId) ? row.filmId : null,
        })
        break
      }
      default: {
        const _exhaustive: never = row
        throw new Error(`historyProjection: unknown row ${JSON.stringify(_exhaustive)}`)
      }
    }
  }

  // ── Films (every durable P07 record, whether or not its release was recorded) ─
  const eventIdsByFilm = new Map<string, number[]>()
  for (const row of chronology) {
    const id =
      row.kind === 'filmReleased' || row.kind === 'theatricalRunCompleted' ? row.productionId :
      row.kind === 'standingChanged' && row.source.kind === 'releaseResult' ? row.source.productionId :
      row.kind === 'careerMilestone' ? row.filmId : null
    if (id === null) continue
    const list = eventIdsByFilm.get(id) ?? []
    list.push(row.eventId)
    eventIdsByFilm.set(id, list)
  }
  const recordedReleases = new Set(
    chronology.filter((r) => r.kind === 'filmReleased').map((r) => (r.kind === 'filmReleased' ? r.productionId : '')),
  )
  const films: BridgeHistoryFilmSnapshot[] = [...state.studio.releasedFilms]
    .sort((a, b) => (a.releaseTick - b.releaseTick) || (a.productionId < b.productionId ? -1 : 1))
    .map((film) => ({
      productionId: film.productionId,
      title: titleOf(film.productionId, film.conceptId),
      releaseWeek: film.releaseTick,
      historyRecorded: recordedReleases.has(film.productionId),
      resultAvailable: true,
      historyEventIds: eventIdsByFilm.get(film.productionId) ?? [],
    }))

  // ── People credited on released films (captured participants only) ─────────
  const people = new Map<string, BridgeHistoryPersonSnapshot>()
  let uncaptured = 0
  for (const film of state.studio.releasedFilms) {
    const participants = film.participants
    if (participants === undefined) {
      uncaptured += 1
      continue
    }
    const title = titleOf(film.productionId, film.conceptId)
    const credit = (talentId: string, name: string, role: string): void => {
      const existing = people.get(talentId)
      const talent = state.talent.find((t) => t.id === talentId)
      const entry: BridgeHistoryPersonSnapshot = existing ?? {
        talentId,
        name: talent?.name ?? name,
        roleLabel: ROLE_LABEL[talent?.role ?? role] ?? role,
        credits: [],
        uncapturedFilms: 0,
        onLot: onLot.has(talentId),
        present: talent !== undefined,
      }
      entry.credits.push({ productionId: film.productionId, title, roleLabel: ROLE_LABEL[role] ?? role })
      people.set(talentId, entry)
    }
    credit(participants.writer.talentId, participants.writer.name, 'writer')
    credit(participants.director.talentId, participants.director.name, 'director')
    credit(participants.cast.lead.talentId, participants.cast.lead.name, 'lead')
    credit(participants.cast.antagonist.talentId, participants.cast.antagonist.name, 'antagonist')
    credit(participants.cast.support.talentId, participants.cast.support.name, 'support')
    for (const craft of participants.craft) credit(craft.talentId, craft.name, 'craft')
  }
  const peopleRows = [...people.values()]
    .map((p) => ({ ...p, uncapturedFilms: uncaptured }))
    .sort((a, b) => (a.talentId < b.talentId ? -1 : a.talentId > b.talentId ? 1 : 0))

  return {
    recordingStartedWeek: history.recordingStartedWeek,
    currentWeek,
    notRecordedNotice:
      history.recordingStartedWeek > 0
        ? `Detailed Standing/history changes were not recorded before Week ${String(history.recordingStartedWeek)}.`
        : null,
    standing: { channels, receipts, routineWindowWeeks: HISTORY_ROUTINE_WINDOW_WEEKS },
    timeline,
    films,
    people: peopleRows,
    recordsAvailable: false,
    recordsNotice: 'Records need a complete comparison universe; none is claimed yet.',
  }
}
