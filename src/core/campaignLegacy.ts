// ── P15C Wave 1: the pure Legacy law `campaign-legacy/v2` ─────────────────────
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/):
// Owner rulings 2, 3, 5 and 6 of 1342-O; charter 1353-A §5 as amended by 1353-F (the
// §5.3 amendments 1-4 govern); the LegacyFacts shape adopted in 1353-F2; the decade
// ordering rule of 1353-F3; and the parent's API decisions on the 1353 RED.
//
// The law is pure `(facts) => manifest`: no randomness, clock, GameState, save, Bridge or
// tick hook. P15C Wave 2 (record 1359: 1359-A §3-§5 with 1359-F) adds the live-game parts
// after the law, each under its own heading; only they read a GameState.
// Inputs are never mutated; every output is a fresh object in the order stated below.
// Public facts only: no fact type carries a studio's cash, costs or revenue, and an error
// names a field and a rule, never a value.
//
// The cut. B = facts.boundaryWeek: LEGACY_BOUNDARY_WEEK for the official Legacy, C + 1
// for an end-of-run record. A fact is inside when its week is below B; a ranking snapshot
// is inside when its window ends at or before B (snapshot week ≤ B). A released film is
// settled before B when its final payment week (settledWeek) is below B; any other
// released film is in release at the boundary: it counts in the catalog and the critic,
// audience, genre and foundry rules, never in commercial engine, and no gross of it is
// read; a settled week before the release week refuses. A studio enters the manifest when
// it entered before B, in (row, studioId) order. Market assessments are inside when their
// week is below B, and a closure counts only when dated before B (closedWeek ≥ B reads open).
//
// Completeness (1353-F2 §4). A domain reads notRecorded when its fact is absent, its
// recordedFromWeek is null or at or after B, or (for the three optional roots) its row
// array is absent; limited for a studio that entered before recordedFromWeek; otherwise
// complete. A source row is limited when any manifest studio is. A row dated before its
// own domain's recordedFromWeek refuses.
//
// Archetypes (1353-A §5.3 as amended). A campaign release of S is a campaign film owned
// by S and released before B; n counts them. Genre is its career events' genre, else the
// film's; its audience score is its career events' at-release score (they must agree),
// and a film with no events has none. Lists sort by the stated key, then release week,
// then id (`<`), and show at most 12 refs per side; counts are exact.
// - artistic-voice: a releases with critic ≥ ACCLAIM_MIN; held when a ≥ MIN_FILMS and
//   100a ≥ MIN_SHARE_PERCENT·n. Acclaimed highest first; contrary critic < PAN_BELOW,
//   lowest first.
// - audience-institution: calendar decades floor(campaignDate(week).year / 10) of scored
//   releases; eligible with ≥ DECADE_MIN_RELEASES scored, an audience decade when also
//   2·liked ≥ scored (liked: score ≥ AUDIENCE_LIKED_MIN); held with ≥ AUDIENCE_MIN_DECADES.
//   One ref per decade in decade order: an audience decade's best film, each other
//   eligible decade's worst. A release with no events limits it by its event domain.
// - commercial-engine: s releases settled before B, h of them with 100·gross ≥
//   HIT_REACH_PERCENT·baseMarketValue; held when h ≥ MIN_FILMS and 100h ≥ MIN_SHARE_PERCENT·s.
//   Hits highest gross first; contrary 100·gross < FLOP_REACH_PERCENT·baseMarketValue, lowest.
// - technology-pioneer: S's adoptions operational before B and by commercialWeek +
//   PIONEER_WEEKS (a cancelled adoption is never operational), earliest first. Contrary,
//   per technology that became commercial during S's span (enteredWeek ≤ commercialWeek,
//   before its closure, else B; 1353-F4): S's own earliest operational adoption when
//   later than commercialWeek + TECH_LATE_WEEKS, or the technology itself when S has
//   none before B.
// - talent-foundry: a person with any authored credit is nobody's discovery; otherwise
//   the owners of the campaign films credited in the person's first credited week each
//   discover them. Held with ≥ FOUNDRY_MIN_PEOPLE discoveries credited on ≥
//   FOUNDRY_MIN_CREDITS films before B, most credits first, cited by S's first career
//   event of them; contrary one-credit discoveries first credited before
//   B − FOUNDRY_SETTLE_WEEKS, earliest first.
// - genre-specialist: held when n ≥ GENRE_MIN_FILMS and one genre has 2·count > n. That
//   genre's releases, then the others, each highest critic first; no majority, no refs.
// - resilient-survivor (P15B events before B): held when a distress entry is followed in
//   a later week by recovery → stable and no closure precedes B (closure event or
//   closedWeek). Refs: each such entry and its first stable return; contrary
//   recovery → warning relapses and closures. notRecorded without the condition domain.
// - awards-dynasty: notRecorded, with no count, ref or number (rulings 2 and 5).
// Lenses follow 1353-A §5.4 with the count keys of 1353-F2 §2; a notRecorded lens
// carries no count and no ref. A ranking ref cites the archive record's own recordId.

import { campaignDate } from './calendar.js'
import { P15_PHASE_TABLES } from './p15Phases.js'
import type { FinancialStrengthBand } from './powerRanking.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import type { GameState, Genre, Standing } from './types.js'

/** The live era: 1353-T's retune with 1353-F6's hit line. A change to any LEGACY_* value bumps it (tuning.ts). */
export const CAMPAIGN_LEGACY_DEFINITION = 'campaign-legacy/v2'
/** 2040 · Week 1 under `campaign-calendar-1920-52/v1`. Derived from the calendar, never tuned. */
export const LEGACY_BOUNDARY_WEEK = (2040 - 1920) * 52
/** The mode fact written with the official manifest (1353-A §6). No simulation step reads it. */
export const LEGACY_POST_FINALE_MODE = 'ordinary-simulation/v1'
/** Law constants from the builder annex D.6/E.6 (1353-F): hard maxima, not tuning. */
export const LEGACY_BOUNDS = { domains: 16, archetypes: 8, refsPerSide: 12, lenses: 12 } as const
export const LEGACY_ARCHETYPE_IDS = [
  'artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
  'talent-foundry', 'genre-specialist', 'resilient-survivor', 'awards-dynasty',
] as const
export const LEGACY_LENS_IDS = [
  'catalog', 'people', 'technology', 'ranking', 'financialBand', 'market', 'resilience', 'awards',
] as const
/** The eleven domains of 1353-A §5.2, in that order, the same in every era. `awards` is never recorded. */
export const LEGACY_DOMAIN_IDS = [
  'playerFilms', 'industryFilms', 'playerRuns', 'playerCareerEvents', 'industryCareerEvents',
  'technologyAdoptions', 'technologyCatalogue', 'powerRanking', 'corporateCondition',
  'marketAssessments', 'awards',
] as const

export type LegacyArchetypeId = (typeof LEGACY_ARCHETYPE_IDS)[number]
export type LegacyLensId = (typeof LEGACY_LENS_IDS)[number]
export type LegacyManifestKind = 'official2040' | 'endOfRun'
/** The keys of the frozen definition table (1359-A §5.1): every era a stored manifest may name. */
export type LegacyDefinitionId = 'campaign-legacy/v1' | 'campaign-legacy/v2'
export type LegacyStatus = 'complete' | 'limited' | 'notRecorded'
export type LegacyFilmDomainId = 'playerFilms' | 'industryFilms'
export type LegacyCareerEventDomainId = 'playerCareerEvents' | 'industryCareerEvents'
export type LegacyConditionStage = 'stable' | 'warning' | 'distress' | 'recovery' | 'closed'

// ── LegacyFacts (1353-C proposal, adopted with amendments in 1353-F2) ─────────
export type LegacyStudioFact = {
  studioId: string
  row: number
  enteredWeek: number | null
  closedWeek: number | null
  standing: Standing
}
export type LegacyCredit = { talentId: string; role: string }
export type LegacyFilmFact = {
  filmId: string
  studioId: string
  domainId: LegacyFilmDomainId
  provenance: 'campaign' | 'authored'
  /** Null exactly for an authored pre-1920 film. */
  releaseWeek: number | null
  /** The concept genre: read only when the film has no career events. */
  genre: Genre
  criticScore: number
  /** Null for a campaign film, whose at-release score lives on its career events. */
  audienceScore: number | null
  status: 'settled' | 'inRun'
  settledWeek: number | null
  /** The final gross, public once settled; null while in run. */
  grossSettled: number | null
  /** Authored films only: a campaign film's credits are its career events. */
  credits: readonly LegacyCredit[]
}
export type LegacyCareerEventFact = {
  eventId: string
  filmId: string
  talentId: string
  domainId: LegacyCareerEventDomainId
  role: string
  releaseWeek: number
  genre: Genre
  audienceScore: number
}
export type LegacyAdoptionFact = {
  adoptionId: string
  studioId: string
  technologyId: string
  operationalWeek: number | null
  cancelledWeek: number | null
}
export type LegacyTechnologyFact = { technologyId: string; commercialWeek: number }
export type LegacyConditionEventFact = {
  eventId: string
  studioId: string
  week: number
  from: LegacyConditionStage
  to: LegacyConditionStage
}
/** `recordId` is the archive record's own id (1359-A §3.3 A1); a ref never derives one from the week. */
export type LegacyRankingSnapshotFact = { recordId: string; week: number; studioId: string; rank: number | null; band: FinancialStrengthBand }
export type LegacyMarketAssessmentFact = { assessmentId: string; studioId: string; week: number; assessed: boolean; underPressure: boolean }
export type LegacyDomainFact = { domainId: string; highWatermark: number; recordedFromWeek: number | null }
export type LegacyFacts = {
  boundaryWeek: number
  /** World-generation market value; commercial engine's one exact product reads it. */
  baseMarketValue: number
  studios: readonly LegacyStudioFact[]
  films: readonly LegacyFilmFact[]
  careerEvents: readonly LegacyCareerEventFact[]
  adoptions: readonly LegacyAdoptionFact[]
  technologies: readonly LegacyTechnologyFact[]
  domains: readonly LegacyDomainFact[]
  /** Absent: P15B's condition root does not exist yet (notRecorded). Empty: no rows. */
  conditionEvents?: readonly LegacyConditionEventFact[]
  /** Absent: P15A.2's quarterly archive does not exist yet (notRecorded). */
  rankingSnapshots?: readonly LegacyRankingSnapshotFact[]
  /** Absent: P15A.1's assessment root does not exist yet (notRecorded). */
  marketAssessments?: readonly LegacyMarketAssessmentFact[]
}

// ── The manifest (1353-A §5.2) ────────────────────────────────────────────────
export type LegacyRef = { domainId: string; id: string }
export type LegacySource = { domainId: string; highWatermark: number; recordedFromWeek: number | null; status: LegacyStatus }
export type ArchetypeResult = {
  archetypeId: LegacyArchetypeId
  outcome: 'held' | 'notHeld' | 'notRecorded'
  limitedBy: string[]
  qualifyingCount: number
  contraryCount: number
  qualifying: LegacyRef[]
  contrary: LegacyRef[]
}
export type LensSummary = { lensId: LegacyLensId; status: LegacyStatus; counts: Record<string, number>; refs: LegacyRef[] }
export type LegacyStudio = { studioId: string; standingAtBoundary: Standing; archetypes: ArchetypeResult[]; lenses: LensSummary[] }
export type LegacyManifest = {
  kind: LegacyManifestKind
  definition: LegacyDefinitionId
  boundaryWeek: number
  postFinaleMode: typeof LEGACY_POST_FINALE_MODE | null
  sources: LegacySource[]
  studios: LegacyStudio[]
}
export type CampaignLegacy = {
  version: 1
  recordedFromWeek: number
  official: LegacyManifest | null
  endOfRun: LegacyManifest | null
}

// ── validation ────────────────────────────────────────────────────────────────
const CAP = LEGACY_BOUNDS.refsPerSide
const STAGES: readonly string[] = ['stable', 'warning', 'distress', 'recovery', 'closed']
const BANDS: readonly FinancialStrengthBand[] = ['inTheRed', 'strained', 'stable', 'thriving']
const EVENT_DOMAIN_OF: Record<LegacyFilmDomainId, LegacyCareerEventDomainId> = {
  playerFilms: 'playerCareerEvents',
  industryFilms: 'industryCareerEvents',
}
const FILM_DOMAINS = ['playerFilms', 'industryFilms'] as const
const EVENT_DOMAINS = ['playerCareerEvents', 'industryCareerEvents'] as const
/** The three roots that may not exist yet; an absent array reads notRecorded (1353-F2). */
const OPTIONAL_ROOT = {
  corporateCondition: 'conditionEvents',
  powerRanking: 'rankingSnapshots',
  marketAssessments: 'marketAssessments',
} as const

function fail(field: string, rule: string): never {
  throw new Error(`campaign legacy: ${field} ${rule}`)
}
const isWeek = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0
const isId = (v: unknown): v is string => typeof v === 'string' && v !== ''
const isScore = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100
const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

function rows<T>(value: readonly T[] | undefined, field: string): readonly T[] {
  if (!Array.isArray(value)) fail(field, 'must be an array')
  return value
}

type Release = {
  film: LegacyFilmFact
  week: number
  genre: Genre
  audience: number | null
  /** Final payment week below B: the only state in which a gross is read. */
  settled: boolean
}
type Discovery = { talentId: string; credits: number; firstWeek: number; event: LegacyCareerEventFact }
type Facts = {
  B: number
  bmv: number
  studios: LegacyStudioFact[]
  technologies: LegacyTechnologyFact[]
  domainFacts: Map<string, LegacyDomainFact>
  releasesOf: Map<string, Release[]>
  authoredCountOf: Map<string, number>
  adoptionsOf: Map<string, LegacyAdoptionFact[]>
  conditionOf: Map<string, LegacyConditionEventFact[]> | null
  rankingOf: Map<string, LegacyRankingSnapshotFact[]> | null
  marketOf: Map<string, LegacyMarketAssessmentFact[]> | null
  discoveriesOf: Map<string, Discovery[]>
  /** studio → distinct people credited on its campaign releases before B */
  creditedOf: Map<string, Set<string>>
  optionalPresent: Record<keyof typeof OPTIONAL_ROOT, boolean>
}

function push<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const list = map.get(key)
  if (list === undefined) map.set(key, [value])
  else list.push(value)
}

function readFacts(facts: LegacyFacts): Facts {
  if (facts === null || typeof facts !== 'object') fail('facts', 'must be an object')
  const B = facts.boundaryWeek
  if (!Number.isSafeInteger(B) || B <= 0) fail('boundaryWeek', 'must be a positive whole week')
  const bmv = facts.baseMarketValue
  if (typeof bmv !== 'number' || !Number.isFinite(bmv) || bmv <= 0) fail('baseMarketValue', 'must be a finite positive amount')

  const domainFacts = new Map<string, LegacyDomainFact>()
  const domainRows = rows(facts.domains, 'domains')
  if (domainRows.length > LEGACY_BOUNDS.domains) fail('domains', `must name at most ${LEGACY_BOUNDS.domains} domains`)
  domainRows.forEach((d, i) => {
    const at = `domains[${i}]`
    if (!isId(d?.domainId)) fail(`${at}.domainId`, 'must be a non-empty string')
    if (d.domainId === 'awards') fail(at, 'must not record awards: no era of the law has an Awards source')
    if (domainFacts.has(d.domainId)) fail(at, `repeats domain ${d.domainId}`)
    if (!isWeek(d.highWatermark)) fail(`${at}.highWatermark`, 'must be a non-negative whole number')
    if (d.recordedFromWeek !== null && !isWeek(d.recordedFromWeek)) fail(`${at}.recordedFromWeek`, 'must be null or a non-negative whole week')
    domainFacts.set(d.domainId, d)
  })
  // A row belongs to its own domain, which must record it from on or before the row's week.
  const recorded = (domainId: string, week: number | null, at: string): void => {
    const start = domainFacts.get(domainId)?.recordedFromWeek ?? null
    if (start === null) fail(at, `belongs to domain ${domainId}, which records no rows`)
    if (week !== null && week < start) fail(at, `is dated before domain ${domainId}'s recordedFromWeek (law 7: no backfill)`)
  }

  const studioById = new Map<string, LegacyStudioFact>()
  rows(facts.studios, 'studios').forEach((s, i) => {
    const at = `studios[${i}]`
    if (!isId(s?.studioId)) fail(`${at}.studioId`, 'must be a non-empty string')
    if (studioById.has(s.studioId)) fail(at, `repeats studio ${s.studioId}`)
    if (!isWeek(s.row)) fail(`${at}.row`, 'must be a non-negative whole number')
    if (s.enteredWeek !== null && !isWeek(s.enteredWeek)) fail(`${at}.enteredWeek`, 'must be null or a non-negative whole week')
    if (s.closedWeek !== null && (!isWeek(s.closedWeek) || s.enteredWeek === null || s.closedWeek < s.enteredWeek)) {
      fail(`${at}.closedWeek`, 'must be null or a whole week at or after the studio entered')
    }
    const st = s.standing
    if (st === null || typeof st !== 'object' || ![st.audienceAwareness, st.industryPrestige, st.commercialConfidence].every(Number.isFinite)) {
      fail(`${at}.standing`, 'must carry three finite Standing channels')
    }
    studioById.set(s.studioId, s)
  })
  const knownStudio = (id: unknown, at: string): void => {
    if (!isId(id) || !studioById.has(id)) fail(at, 'must name a studio in facts.studios')
  }

  const technologyById = new Map<string, LegacyTechnologyFact>()
  rows(facts.technologies, 'technologies').forEach((t, i) => {
    const at = `technologies[${i}]`
    if (!isId(t?.technologyId)) fail(`${at}.technologyId`, 'must be a non-empty string')
    if (technologyById.has(t.technologyId)) fail(at, `repeats technology ${t.technologyId}`)
    if (!isWeek(t.commercialWeek)) fail(`${at}.commercialWeek`, 'must be a non-negative whole week')
    technologyById.set(t.technologyId, t)
  })

  const filmById = new Map<string, LegacyFilmFact>()
  const authoredCountOf = new Map<string, number>()
  // person → films credited before B, any authored credit, and the first campaign week's credits
  type Person = { films: Set<string>; authored: boolean; firstWeek: number; first: Map<string, LegacyCareerEventFact> }
  const people = new Map<string, Person>()
  const person = (talentId: string): Person => {
    let p = people.get(talentId)
    if (p === undefined) {
      p = { films: new Set(), authored: false, firstWeek: Infinity, first: new Map() }
      people.set(talentId, p)
    }
    return p
  }
  rows(facts.films, 'films').forEach((f, i) => {
    const at = `films[${i}]`
    if (!isId(f?.filmId)) fail(`${at}.filmId`, 'must be a non-empty string')
    const atId = `${at} (${f.filmId})`
    if (filmById.has(f.filmId)) fail(atId, 'repeats a film id')
    knownStudio(f.studioId, `${atId}.studioId`)
    if (!(FILM_DOMAINS as readonly string[]).includes(f.domainId)) fail(`${atId}.domainId`, 'must be playerFilms or industryFilms')
    if (!GENRE_ORDER.includes(f.genre)) fail(`${atId}.genre`, 'must be a catalogue genre')
    if (!isScore(f.criticScore)) fail(`${atId}.criticScore`, 'must be a score in [0, 100]')
    if (!Array.isArray(f.credits)) fail(`${atId}.credits`, 'must be an array')
    if (f.status === 'inRun') {
      if (f.settledWeek !== null || f.grossSettled !== null) {
        fail(atId, 'must carry no settledWeek or grossSettled while in run: only a settled gross is public')
      }
    } else if (f.status === 'settled') {
      if (!isWeek(f.settledWeek)) fail(`${atId}.settledWeek`, 'must be a whole week once settled')
      if (typeof f.grossSettled !== 'number' || !Number.isFinite(f.grossSettled) || f.grossSettled < 0) {
        fail(`${atId}.grossSettled`, 'must be a finite non-negative amount once settled')
      }
    } else fail(`${atId}.status`, 'must be settled or inRun')
    if (f.provenance === 'campaign') {
      if (!isWeek(f.releaseWeek)) fail(`${atId}.releaseWeek`, 'must be a whole week for a campaign film')
      if (f.status === 'settled' && f.settledWeek! < f.releaseWeek) fail(`${atId}.settledWeek`, 'must not precede its release week: a run settles only after it opens')
      if (f.audienceScore !== null) fail(`${atId}.audienceScore`, 'must be null for a campaign film: its score lives on its career events')
      if (f.credits.length > 0) fail(`${atId}.credits`, 'must be empty for a campaign film: its credits are its career events')
      recorded(f.domainId, f.releaseWeek, atId)
    } else if (f.provenance === 'authored') {
      if (f.releaseWeek !== null) fail(`${atId}.releaseWeek`, 'must be null for an authored pre-1920 film')
      if (f.audienceScore !== null && !isScore(f.audienceScore)) fail(`${atId}.audienceScore`, 'must be null or a score in [0, 100]')
      recorded(f.domainId, null, atId)
      authoredCountOf.set(f.studioId, (authoredCountOf.get(f.studioId) ?? 0) + 1)
      f.credits.forEach((c, j) => {
        if (!isId(c?.talentId) || typeof c.role !== 'string') fail(`${atId}.credits[${j}]`, 'must name a talentId and a role')
        const p = person(c.talentId)
        p.authored = true
        p.films.add(f.filmId)
      })
    } else fail(`${atId}.provenance`, 'must be campaign or authored')
    filmById.set(f.filmId, f)
  })

  const eventsOf = new Map<string, LegacyCareerEventFact[]>()
  const eventIds = new Set<string>()
  rows(facts.careerEvents, 'careerEvents').forEach((e, i) => {
    const at = `careerEvents[${i}]`
    if (!isId(e?.eventId)) fail(`${at}.eventId`, 'must be a non-empty string')
    const atId = `${at} (${e.eventId})`
    if (eventIds.has(e.eventId)) fail(atId, 'repeats an event id')
    eventIds.add(e.eventId)
    const film = isId(e.filmId) ? filmById.get(e.filmId) : undefined
    if (film === undefined || film.provenance !== 'campaign') fail(`${atId}.filmId`, 'must name a campaign film in facts.films')
    if (!isId(e.talentId)) fail(`${atId}.talentId`, 'must be a non-empty string')
    if (typeof e.role !== 'string') fail(`${atId}.role`, 'must be a string')
    if (e.domainId !== EVENT_DOMAIN_OF[film.domainId]) fail(`${atId}.domainId`, `must be ${EVENT_DOMAIN_OF[film.domainId]}, its film's event domain`)
    if (e.releaseWeek !== film.releaseWeek) fail(`${atId}.releaseWeek`, "must equal its film's release week")
    if (!GENRE_ORDER.includes(e.genre)) fail(`${atId}.genre`, 'must be a catalogue genre')
    if (!isScore(e.audienceScore)) fail(`${atId}.audienceScore`, 'must be a score in [0, 100]')
    recorded(e.domainId, e.releaseWeek, atId)
    push(eventsOf, e.filmId, e)
  })
  for (const [filmId, events] of eventsOf) {
    const [head, ...rest] = events
    if (rest.some((e) => e.audienceScore !== head!.audienceScore)) {
      fail(`careerEvents of film ${filmId}`, 'must agree on the at-release audience score')
    }
    if (rest.some((e) => e.genre !== head!.genre)) fail(`careerEvents of film ${filmId}`, 'must agree on the genre')
  }

  // Releases before B, and every campaign credit before B (credits are shared public facts).
  const releasesOf = new Map<string, Release[]>()
  const creditedOf = new Map<string, Set<string>>()
  for (const film of filmById.values()) {
    if (film.provenance !== 'campaign' || film.releaseWeek! >= B) continue
    const week = film.releaseWeek!
    const events = eventsOf.get(film.filmId) ?? []
    push(releasesOf, film.studioId, {
      film,
      week,
      genre: events[0]?.genre ?? film.genre,
      audience: events[0]?.audienceScore ?? null,
      settled: film.status === 'settled' && film.settledWeek! < B,
    })
    for (const e of events) {
      let credited = creditedOf.get(film.studioId)
      if (credited === undefined) creditedOf.set(film.studioId, (credited = new Set()))
      credited.add(e.talentId)
      const p = person(e.talentId)
      p.films.add(film.filmId)
      if (week < p.firstWeek) {
        p.firstWeek = week
        p.first = new Map()
      }
      if (week === p.firstWeek) {
        const held = p.first.get(film.studioId)
        if (held === undefined || e.eventId < held.eventId) p.first.set(film.studioId, e)
      }
    }
  }
  const discoveriesOf = new Map<string, Discovery[]>()
  for (const [talentId, p] of people) {
    if (p.authored) continue // authored films come first: never a discovery
    for (const [studioId, event] of p.first) push(discoveriesOf, studioId, { talentId, credits: p.films.size, firstWeek: p.firstWeek, event })
  }

  const adoptionsOf = new Map<string, LegacyAdoptionFact[]>()
  const adoptionIds = new Set<string>()
  rows(facts.adoptions, 'adoptions').forEach((a, i) => {
    const at = `adoptions[${i}]`
    if (!isId(a?.adoptionId)) fail(`${at}.adoptionId`, 'must be a non-empty string')
    const atId = `${at} (${a.adoptionId})`
    if (adoptionIds.has(a.adoptionId)) fail(atId, 'repeats an adoption id')
    adoptionIds.add(a.adoptionId)
    knownStudio(a.studioId, `${atId}.studioId`)
    if (!isId(a.technologyId) || !technologyById.has(a.technologyId)) fail(`${atId}.technologyId`, 'must name a technology in facts.technologies')
    if (a.operationalWeek !== null && !isWeek(a.operationalWeek)) fail(`${atId}.operationalWeek`, 'must be null or a whole week')
    if (a.cancelledWeek !== null && !isWeek(a.cancelledWeek)) fail(`${atId}.cancelledWeek`, 'must be null or a whole week')
    if (a.operationalWeek !== null && a.cancelledWeek !== null) fail(atId, 'must not be both cancelled and operational')
    recorded('technologyAdoptions', a.operationalWeek ?? a.cancelledWeek, atId)
    push(adoptionsOf, a.studioId, a)
  })

  let conditionOf: Map<string, LegacyConditionEventFact[]> | null = null
  if (facts.conditionEvents !== undefined) {
    conditionOf = new Map()
    const ids = new Set<string>()
    rows(facts.conditionEvents, 'conditionEvents').forEach((c, i) => {
      const at = `conditionEvents[${i}]`
      if (!isId(c?.eventId)) fail(`${at}.eventId`, 'must be a non-empty string')
      const atId = `${at} (${c.eventId})`
      if (ids.has(c.eventId)) fail(atId, 'repeats an event id')
      ids.add(c.eventId)
      knownStudio(c.studioId, `${atId}.studioId`)
      if (!isWeek(c.week)) fail(`${atId}.week`, 'must be a whole week')
      if (!STAGES.includes(c.from) || !STAGES.includes(c.to) || c.from === c.to) fail(atId, 'must move between two different P15B stages')
      recorded('corporateCondition', c.week, atId)
      push(conditionOf!, c.studioId, c)
    })
  }
  let rankingOf: Map<string, LegacyRankingSnapshotFact[]> | null = null
  if (facts.rankingSnapshots !== undefined) {
    rankingOf = new Map()
    const keys = new Set<string>()
    const ids = new Set<string>()
    rows(facts.rankingSnapshots, 'rankingSnapshots').forEach((r, i) => {
      const at = `rankingSnapshots[${i}]`
      if (!isId(r?.recordId)) fail(`${at}.recordId`, 'must be a non-empty string')
      if (ids.has(r.recordId)) fail(at, 'repeats a record id')
      ids.add(r.recordId)
      knownStudio(r.studioId, `${at}.studioId`)
      if (!isWeek(r.week)) fail(`${at}.week`, 'must be a whole week')
      if (r.rank !== null && !(Number.isSafeInteger(r.rank) && r.rank >= 1)) fail(`${at}.rank`, 'must be null or a whole rank from 1')
      if (!BANDS.includes(r.band)) fail(`${at}.band`, 'must be a financial-strength band')
      const key = `${r.week}:${r.studioId}`
      if (keys.has(key)) fail(at, 'repeats a studio in one quarter')
      keys.add(key)
      recorded('powerRanking', r.week, at)
      push(rankingOf!, r.studioId, r)
    })
  }
  let marketOf: Map<string, LegacyMarketAssessmentFact[]> | null = null
  if (facts.marketAssessments !== undefined) {
    marketOf = new Map()
    const ids = new Set<string>()
    rows(facts.marketAssessments, 'marketAssessments').forEach((m, i) => {
      const at = `marketAssessments[${i}]`
      if (!isId(m?.assessmentId)) fail(`${at}.assessmentId`, 'must be a non-empty string')
      if (ids.has(m.assessmentId)) fail(at, 'repeats an assessment id')
      ids.add(m.assessmentId)
      knownStudio(m.studioId, `${at}.studioId`)
      if (!isWeek(m.week)) fail(`${at}.week`, 'must be a whole week')
      if (typeof m.assessed !== 'boolean' || typeof m.underPressure !== 'boolean') fail(at, 'must carry boolean assessed and underPressure')
      recorded('marketAssessments', m.week, at)
      push(marketOf!, m.studioId, m)
    })
  }

  const studios = [...studioById.values()]
    .filter((s) => s.enteredWeek !== null && s.enteredWeek < B)
    .sort((a, b) => a.row - b.row || compareText(a.studioId, b.studioId))
  const technologies = [...technologyById.values()].sort((a, b) => a.commercialWeek - b.commercialWeek || compareText(a.technologyId, b.technologyId))
  return {
    B, bmv, studios, technologies, domainFacts, releasesOf, authoredCountOf, adoptionsOf,
    conditionOf, rankingOf, marketOf, discoveriesOf, creditedOf,
    optionalPresent: {
      corporateCondition: conditionOf !== null,
      powerRanking: rankingOf !== null,
      marketAssessments: marketOf !== null,
    },
  }
}

// ── completeness ──────────────────────────────────────────────────────────────
/** recordedFromWeek when the domain records rows below B; null when it reads notRecorded. */
function recordingStart(f: Facts, domainId: string): number | null {
  if (domainId === 'awards') return null
  if (Object.hasOwn(OPTIONAL_ROOT, domainId) && !f.optionalPresent[domainId as keyof typeof OPTIONAL_ROOT]) return null
  const start = f.domainFacts.get(domainId)?.recordedFromWeek ?? null
  return start === null || start >= f.B ? null : start
}
function statusFor(f: Facts, domainId: string, enteredWeek: number): LegacyStatus {
  const start = recordingStart(f, domainId)
  if (start === null) return 'notRecorded'
  return start > enteredWeek ? 'limited' : 'complete'
}
function sources(f: Facts): LegacySource[] {
  const extras = [...f.domainFacts.keys()].filter((id) => !(LEGACY_DOMAIN_IDS as readonly string[]).includes(id)).sort(compareText)
  const ids = [...LEGACY_DOMAIN_IDS.filter((id) => id !== 'awards'), ...extras]
  if (ids.length > LEGACY_BOUNDS.domains) fail('domains', `must leave the manifest at most ${LEGACY_BOUNDS.domains} sources`)
  return ids.map((domainId) => {
    const d = f.domainFacts.get(domainId)
    const start = recordingStart(f, domainId)
    const status: LegacyStatus = start === null ? 'notRecorded'
      : f.studios.some((s) => start > s.enteredWeek!) ? 'limited' : 'complete'
    return { domainId, highWatermark: d?.highWatermark ?? 0, recordedFromWeek: d?.recordedFromWeek ?? null, status }
  })
}
function limitedBy(f: Facts, studio: LegacyStudioFact, domains: readonly string[], extra: readonly string[] = []): string[] {
  const hit = new Set(extra)
  for (const d of domains) if (statusFor(f, d, studio.enteredWeek!) !== 'complete') hit.add(d)
  return LEGACY_DOMAIN_IDS.filter((d) => hit.has(d))
}
function lensStatus(f: Facts, studio: LegacyStudioFact, domains: readonly string[]): LegacyStatus {
  const all = domains.map((d) => statusFor(f, d, studio.enteredWeek!))
  if (all.every((s) => s === 'notRecorded')) return 'notRecorded'
  return all.every((s) => s === 'complete') ? 'complete' : 'limited'
}

// ── archetypes ────────────────────────────────────────────────────────────────
const FILM_READS = [...FILM_DOMAINS]
const FILM_AND_EVENT_READS = [...FILM_DOMAINS, ...EVENT_DOMAINS]

const byWeekThenId = (a: Release, b: Release): number => a.week - b.week || compareText(a.film.filmId, b.film.filmId)
const filmRef = (r: Release): LegacyRef => ({ domainId: r.film.domainId, id: r.film.filmId })

function archetypeResult(
  archetypeId: LegacyArchetypeId,
  outcome: ArchetypeResult['outcome'],
  limited: string[],
  qualifying: LegacyRef[],
  contrary: LegacyRef[],
): ArchetypeResult {
  return {
    archetypeId, outcome, limitedBy: limited,
    qualifyingCount: qualifying.length, contraryCount: contrary.length,
    qualifying: qualifying.slice(0, CAP), contrary: contrary.slice(0, CAP),
  }
}
const heldWhen = (held: boolean): ArchetypeResult['outcome'] => (held ? 'held' : 'notHeld')

function artisticVoice(f: Facts, s: LegacyStudioFact, releases: Release[], th: LegacyThresholds): ArchetypeResult {
  const acclaimed = releases.filter((r) => r.film.criticScore >= th.LEGACY_CRITIC_ACCLAIM_MIN)
    .sort((a, b) => b.film.criticScore - a.film.criticScore || byWeekThenId(a, b))
  const panned = releases.filter((r) => r.film.criticScore < th.LEGACY_CRITIC_PAN_BELOW)
    .sort((a, b) => a.film.criticScore - b.film.criticScore || byWeekThenId(a, b))
  const a = acclaimed.length
  const held = a >= th.LEGACY_MIN_FILMS && 100 * a >= th.LEGACY_MIN_SHARE_PERCENT * releases.length
  return archetypeResult('artistic-voice', heldWhen(held), limitedBy(f, s, FILM_READS), acclaimed.map(filmRef), panned.map(filmRef))
}

function audienceInstitution(f: Facts, s: LegacyStudioFact, releases: Release[], th: LegacyThresholds): ArchetypeResult {
  const decades = new Map<number, Release[]>()
  const unscoredDomains: string[] = []
  for (const r of releases) {
    if (r.audience === null) unscoredDomains.push(EVENT_DOMAIN_OF[r.film.domainId])
    else push(decades, Math.floor(campaignDate(r.week).year / 10), r)
  }
  const best: Release[] = []
  const worst: Release[] = []
  for (const decade of [...decades.keys()].sort((a, b) => a - b)) {
    const scored = decades.get(decade)!
    if (scored.length < th.LEGACY_DECADE_MIN_RELEASES) continue
    const liked = scored.filter((r) => r.audience! >= th.LEGACY_AUDIENCE_LIKED_MIN).length
    if (2 * liked >= scored.length) best.push([...scored].sort((a, b) => b.audience! - a.audience! || byWeekThenId(a, b))[0]!)
    else worst.push([...scored].sort((a, b) => a.audience! - b.audience! || byWeekThenId(a, b))[0]!)
  }
  const held = best.length >= th.LEGACY_AUDIENCE_MIN_DECADES
  return archetypeResult('audience-institution', heldWhen(held), limitedBy(f, s, FILM_AND_EVENT_READS, unscoredDomains), best.map(filmRef), worst.map(filmRef))
}

function commercialEngine(f: Facts, s: LegacyStudioFact, releases: Release[], th: LegacyThresholds): ArchetypeResult {
  const settled = releases.filter((r) => r.settled)
  const gross = (r: Release): number => r.film.grossSettled!
  const hits = settled.filter((r) => 100 * gross(r) >= th.LEGACY_HIT_REACH_PERCENT * f.bmv)
    .sort((a, b) => gross(b) - gross(a) || byWeekThenId(a, b))
  const flops = settled.filter((r) => 100 * gross(r) < th.LEGACY_FLOP_REACH_PERCENT * f.bmv)
    .sort((a, b) => gross(a) - gross(b) || byWeekThenId(a, b))
  const h = hits.length
  const held = h >= th.LEGACY_MIN_FILMS && 100 * h >= th.LEGACY_MIN_SHARE_PERCENT * settled.length
  return archetypeResult('commercial-engine', heldWhen(held), limitedBy(f, s, [...FILM_DOMAINS, 'playerRuns']), hits.map(filmRef), flops.map(filmRef))
}

/** S's adoptions operational before B, earliest first. A cancelled adoption is never operational. */
function operationalAdoptions(f: Facts, s: LegacyStudioFact): LegacyAdoptionFact[] {
  return (f.adoptionsOf.get(s.studioId) ?? [])
    .filter((a) => a.operationalWeek !== null && a.operationalWeek < f.B)
    .sort((a, b) => a.operationalWeek! - b.operationalWeek! || compareText(a.adoptionId, b.adoptionId))
}

function technologyPioneer(f: Facts, s: LegacyStudioFact, th: LegacyThresholds): ArchetypeResult {
  const commercialWeekOf = new Map(f.technologies.map((t) => [t.technologyId, t.commercialWeek]))
  const operational = operationalAdoptions(f, s)
  const pioneers = operational.filter((a) => a.operationalWeek! <= commercialWeekOf.get(a.technologyId)! + th.LEGACY_PIONEER_WEEKS)
  const spanEnd = Math.min(s.closedWeek ?? f.B, f.B)
  const contrary: { week: number; ref: LegacyRef }[] = []
  for (const t of f.technologies) {
    // Commercial during S's span only (1353-F4): a later entrant is not cited as late to it.
    if (t.commercialWeek < s.enteredWeek! || t.commercialWeek >= spanEnd) continue
    const own = operational.find((a) => a.technologyId === t.technologyId) // S's own earliest (amendment 4)
    if (own === undefined) contrary.push({ week: t.commercialWeek, ref: { domainId: 'technologyCatalogue', id: t.technologyId } })
    else if (own.operationalWeek! > t.commercialWeek + th.LEGACY_TECH_LATE_WEEKS) {
      contrary.push({ week: own.operationalWeek!, ref: { domainId: 'technologyAdoptions', id: own.adoptionId } })
    }
  }
  contrary.sort((a, b) => a.week - b.week || compareText(a.ref.id, b.ref.id))
  return archetypeResult(
    'technology-pioneer', heldWhen(pioneers.length > 0), limitedBy(f, s, ['technologyAdoptions', 'technologyCatalogue']),
    pioneers.map((a) => ({ domainId: 'technologyAdoptions', id: a.adoptionId })), contrary.map((c) => c.ref),
  )
}

const discoveryRef = (d: Discovery): LegacyRef => ({ domainId: d.event.domainId, id: d.event.eventId })
const byMostCredits = (a: Discovery, b: Discovery): number =>
  b.credits - a.credits || a.firstWeek - b.firstWeek || compareText(a.event.eventId, b.event.eventId)

function talentFoundry(f: Facts, s: LegacyStudioFact, discoveries: Discovery[], th: LegacyThresholds): ArchetypeResult {
  const careers = discoveries.filter((d) => d.credits >= th.LEGACY_FOUNDRY_MIN_CREDITS).sort(byMostCredits)
  const stalled = discoveries.filter((d) => d.credits === 1 && d.firstWeek < f.B - th.LEGACY_FOUNDRY_SETTLE_WEEKS)
    .sort((a, b) => a.firstWeek - b.firstWeek || compareText(a.event.eventId, b.event.eventId))
  const held = careers.length >= th.LEGACY_FOUNDRY_MIN_PEOPLE
  return archetypeResult('talent-foundry', heldWhen(held), limitedBy(f, s, FILM_AND_EVENT_READS), careers.map(discoveryRef), stalled.map(discoveryRef))
}

function genreSpecialist(f: Facts, s: LegacyStudioFact, releases: Release[], th: LegacyThresholds): ArchetypeResult {
  const n = releases.length
  const counts = new Map<Genre, number>()
  for (const r of releases) counts.set(r.genre, (counts.get(r.genre) ?? 0) + 1)
  const majority = GENRE_ORDER.find((g) => 2 * (counts.get(g) ?? 0) > n)
  const byCritic = (a: Release, b: Release): number => b.film.criticScore - a.film.criticScore || byWeekThenId(a, b)
  const inGenre = majority === undefined ? [] : releases.filter((r) => r.genre === majority).sort(byCritic)
  const others = majority === undefined ? [] : releases.filter((r) => r.genre !== majority).sort(byCritic)
  const held = n >= th.LEGACY_GENRE_MIN_FILMS && majority !== undefined
  return archetypeResult('genre-specialist', heldWhen(held), limitedBy(f, s, FILM_AND_EVENT_READS), inGenre.map(filmRef), others.map(filmRef))
}

const conditionRef = (c: LegacyConditionEventFact): LegacyRef => ({ domainId: 'corporateCondition', id: c.eventId })
function conditionEventsBefore(f: Facts, s: LegacyStudioFact): LegacyConditionEventFact[] {
  return (f.conditionOf?.get(s.studioId) ?? []).filter((c) => c.week < f.B)
    .sort((a, b) => a.week - b.week || compareText(a.eventId, b.eventId))
}

function resilientSurvivor(f: Facts, s: LegacyStudioFact): ArchetypeResult {
  const limited = limitedBy(f, s, ['corporateCondition'])
  if (statusFor(f, 'corporateCondition', s.enteredWeek!) === 'notRecorded') {
    return archetypeResult('resilient-survivor', 'notRecorded', limited, [], [])
  }
  const events = conditionEventsBefore(f, s)
  const returns = events.filter((c) => c.from === 'recovery' && c.to === 'stable')
  const cited = new Set<LegacyConditionEventFact>()
  for (const entry of events.filter((c) => c.to === 'distress')) {
    const back = returns.find((c) => c.week > entry.week)
    if (back !== undefined) cited.add(entry).add(back)
  }
  const closures = events.filter((c) => c.to === 'closed')
  const closed = closures.length > 0 || (s.closedWeek !== null && s.closedWeek < f.B)
  const qualifying = events.filter((c) => cited.has(c))
  const contrary = events.filter((c) => (c.from === 'recovery' && c.to === 'warning') || c.to === 'closed')
  return archetypeResult('resilient-survivor', heldWhen(cited.size > 0 && !closed), limited, qualifying.map(conditionRef), contrary.map(conditionRef))
}

// ── lenses ────────────────────────────────────────────────────────────────────
function lens(lensId: LegacyLensId, status: LegacyStatus, counts: () => Record<string, number>, refs: () => LegacyRef[] = () => []): LensSummary {
  if (status === 'notRecorded') return { lensId, status, counts: {}, refs: [] }
  return { lensId, status, counts: counts(), refs: refs().slice(0, CAP) }
}

function lenses(f: Facts, s: LegacyStudioFact, releases: Release[], discoveries: Discovery[]): LensSummary[] {
  const at = (domains: readonly string[]): LegacyStatus => lensStatus(f, s, domains)
  const settled = releases.filter((r) => r.settled).length
  const snapshots = (f.rankingOf?.get(s.studioId) ?? []).filter((r) => r.week <= f.B)
  const ranked = snapshots.filter((r) => r.rank !== null)
  const bestRank = ranked.length === 0 ? null : Math.min(...ranked.map((r) => r.rank!))
  const market = (f.marketOf?.get(s.studioId) ?? []).filter((m) => m.week < f.B)
  const conditions = conditionEventsBefore(f, s)
  const operational = operationalAdoptions(f, s)
  return [
    lens('catalog', at([...FILM_DOMAINS, 'playerRuns']), () => ({
      releases: releases.length,
      settled,
      inReleaseAtBoundary: releases.length - settled,
      authoredPre1920: f.authoredCountOf.get(s.studioId) ?? 0,
    })),
    lens('people', at(FILM_AND_EVENT_READS), () => ({ credited: f.creditedOf.get(s.studioId)?.size ?? 0, discoveries: discoveries.length }),
      () => [...discoveries].sort(byMostCredits).map(discoveryRef)),
    lens('technology', at(['technologyAdoptions']), () => ({ operationalAdoptions: operational.length }),
      () => operational.map((a) => ({ domainId: 'technologyAdoptions', id: a.adoptionId }))),
    lens('ranking', at(['powerRanking']), () => ({
      rankedQuarters: ranked.length,
      quartersAtFirst: ranked.filter((r) => r.rank === 1).length,
      ...(bestRank === null ? {} : { bestRank }),
    }), () => ranked.filter((r) => r.rank === bestRank).sort((a, b) => b.week - a.week)
      .map((r) => ({ domainId: 'powerRanking', id: r.recordId }))),
    lens('financialBand', at(['powerRanking']), () => ({
      inTheRed: snapshots.filter((r) => r.band === 'inTheRed').length,
      strained: snapshots.filter((r) => r.band === 'strained').length,
      stable: snapshots.filter((r) => r.band === 'stable').length,
      thriving: snapshots.filter((r) => r.band === 'thriving').length,
    })),
    lens('market', at(['marketAssessments']), () => ({
      assessed: market.filter((m) => m.assessed).length,
      underPressure: market.filter((m) => m.underPressure).length,
    })),
    lens('resilience', at(['corporateCondition']), () => ({
      warnings: conditions.filter((c) => c.to === 'warning').length,
      distressEntries: conditions.filter((c) => c.to === 'distress').length,
      returnsToStable: conditions.filter((c) => c.to === 'stable').length,
      closures: conditions.filter((c) => c.to === 'closed').length,
    }), () => conditions.map(conditionRef)),
    lens('awards', 'notRecorded', () => ({})),
  ]
}

// ── the builder and the freeze step ───────────────────────────────────────────
export function buildLegacyManifest(facts: LegacyFacts, kind: LegacyManifestKind): LegacyManifest {
  return evaluateLegacyManifest(facts, kind, CAMPAIGN_LEGACY_DEFINITION,
    { boundaryWeek: LEGACY_BOUNDARY_WEEK, postFinaleMode: LEGACY_POST_FINALE_MODE, thresholds: liveLegacyThresholds() })
}

/** The law under one era: the live definition and TUNING when a manifest is built, a frozen entry's own id,
 * boundary, mode and thresholds when the validator replays one (1359-F Amendment 1; 1353-F7 ruling 4). */
function evaluateLegacyManifest(facts: LegacyFacts, kind: LegacyManifestKind, definition: LegacyDefinitionId,
  era: Pick<LegacyDefinition, 'boundaryWeek' | 'postFinaleMode' | 'thresholds'>): LegacyManifest {
  if (kind !== 'official2040' && kind !== 'endOfRun') fail('kind', 'must be official2040 or endOfRun')
  const f = readFacts(facts)
  if (kind === 'official2040' && f.B !== era.boundaryWeek) fail('boundaryWeek', 'must be 2040 · Week 1 for the official Legacy')
  const th = era.thresholds
  const studios = f.studios.map((s): LegacyStudio => {
    const releases = [...(f.releasesOf.get(s.studioId) ?? [])].sort(byWeekThenId)
    const discoveries = f.discoveriesOf.get(s.studioId) ?? []
    return {
      studioId: s.studioId,
      standingAtBoundary: {
        audienceAwareness: s.standing.audienceAwareness,
        industryPrestige: s.standing.industryPrestige,
        commercialConfidence: s.standing.commercialConfidence,
      },
      archetypes: [
        artisticVoice(f, s, releases, th),
        audienceInstitution(f, s, releases, th),
        commercialEngine(f, s, releases, th),
        technologyPioneer(f, s, th),
        talentFoundry(f, s, discoveries, th),
        genreSpecialist(f, s, releases, th),
        resilientSurvivor(f, s),
        archetypeResult('awards-dynasty', 'notRecorded', ['awards'], [], []),
      ],
      lenses: lenses(f, s, releases, discoveries),
    }
  })
  return {
    kind,
    definition,
    boundaryWeek: f.B,
    postFinaleMode: kind === 'official2040' ? era.postFinaleMode : null,
    sources: sources(f),
    studios,
  }
}

/**
 * The tick's last step (Wave 2). Returns `root` itself unless the produced week is the
 * boundary and no official manifest exists; then a fresh root carrying it. The official
 * manifest is written once: a later week, or a second call at the boundary, changes nothing.
 */
export function freezeLegacy(root: CampaignLegacy, producedWeek: number, facts: LegacyFacts): CampaignLegacy {
  if (producedWeek !== LEGACY_BOUNDARY_WEEK) return root
  if (root.version !== 1 || root.official === undefined) fail('root', 'must be a version 1 CampaignLegacy root')
  if (root.official !== null) return root
  return { ...root, official: buildLegacyManifest(facts, 'official2040') }
}

// ═════════════════════════════════════════════════════════════════════════════
// P15C Wave 2 (record 1359): the Legacy in the live game. 1359-A §3-§5 with 1359-F, the era
// table of 1353-F6 ruling 2, and the shared Save45 step (1361-F rulings 4 to 6).
// ═════════════════════════════════════════════════════════════════════════════

// ── the frozen definition table (1359-A §5.1 era versioning; 1353-F6 ruling 2) ─
/** The fifteen thresholds every era sets, by their TUNING names (1353-A §5.5). */
export const LEGACY_THRESHOLD_NAMES = [
  'LEGACY_CRITIC_ACCLAIM_MIN', 'LEGACY_CRITIC_PAN_BELOW', 'LEGACY_AUDIENCE_LIKED_MIN', 'LEGACY_MIN_FILMS',
  'LEGACY_MIN_SHARE_PERCENT', 'LEGACY_HIT_REACH_PERCENT', 'LEGACY_FLOP_REACH_PERCENT', 'LEGACY_AUDIENCE_MIN_DECADES',
  'LEGACY_DECADE_MIN_RELEASES', 'LEGACY_PIONEER_WEEKS', 'LEGACY_TECH_LATE_WEEKS', 'LEGACY_FOUNDRY_MIN_PEOPLE',
  'LEGACY_FOUNDRY_MIN_CREDITS', 'LEGACY_FOUNDRY_SETTLE_WEEKS', 'LEGACY_GENRE_MIN_FILMS',
] as const
export type LegacyThresholdName = (typeof LEGACY_THRESHOLD_NAMES)[number]
export type LegacyThresholds = Readonly<Record<LegacyThresholdName, number>>

/** The live era's thresholds, read from TUNING each time a manifest is built. */
function liveLegacyThresholds(): LegacyThresholds {
  const live = {} as Record<LegacyThresholdName, number>
  for (const name of LEGACY_THRESHOLD_NAMES) live[name] = TUNING[name]
  return live
}

/** Everything the validator needs to judge a manifest of one definition. */
export type LegacyDefinition = {
  readonly boundaryWeek: number
  readonly postFinaleMode: typeof LEGACY_POST_FINALE_MODE
  readonly archetypeIds: readonly string[]
  readonly lensIds: readonly string[]
  /** 1353-F2 §2. `ranking` omits `bestRank` when no quarter ranked; a notRecorded lens has none. */
  readonly lensCountKeys: Readonly<Record<string, readonly string[]>>
  readonly bounds: Readonly<{ domains: number; archetypes: number; refsPerSide: number; lenses: number }>
  readonly domainIds: readonly string[]
  readonly thresholds: LegacyThresholds
  readonly evaluate: (facts: LegacyFacts, kind: LegacyManifestKind) => LegacyManifest
}

/** v1's thresholds as Wave 1 landed them. A v1 manifest replays under these forever. */
const V1_THRESHOLDS: LegacyThresholds = Object.freeze({
  LEGACY_CRITIC_ACCLAIM_MIN: 70, LEGACY_CRITIC_PAN_BELOW: 35, LEGACY_AUDIENCE_LIKED_MIN: 57, LEGACY_MIN_FILMS: 5,
  LEGACY_MIN_SHARE_PERCENT: 25, LEGACY_HIT_REACH_PERCENT: 90, LEGACY_FLOP_REACH_PERCENT: 30,
  LEGACY_AUDIENCE_MIN_DECADES: 4, LEGACY_DECADE_MIN_RELEASES: 2, LEGACY_PIONEER_WEEKS: 52,
  LEGACY_TECH_LATE_WEEKS: 260, LEGACY_FOUNDRY_MIN_PEOPLE: 3, LEGACY_FOUNDRY_MIN_CREDITS: 10,
  LEGACY_FOUNDRY_SETTLE_WEEKS: 260, LEGACY_GENRE_MIN_FILMS: 8,
})

/** v2, the live era: 1353-T's retune with 1353-F6's hit line (critic 60, hit line 49, share floor 20); the
 * other twelve as v1. A later retune adds an entry and leaves this one untouched. */
const V2_THRESHOLDS: LegacyThresholds = Object.freeze({
  LEGACY_CRITIC_ACCLAIM_MIN: 60, LEGACY_CRITIC_PAN_BELOW: 35, LEGACY_AUDIENCE_LIKED_MIN: 57, LEGACY_MIN_FILMS: 5,
  LEGACY_MIN_SHARE_PERCENT: 20, LEGACY_HIT_REACH_PERCENT: 49, LEGACY_FLOP_REACH_PERCENT: 30,
  LEGACY_AUDIENCE_MIN_DECADES: 4, LEGACY_DECADE_MIN_RELEASES: 2, LEGACY_PIONEER_WEEKS: 52,
  LEGACY_TECH_LATE_WEEKS: 260, LEGACY_FOUNDRY_MIN_PEOPLE: 3, LEGACY_FOUNDRY_MIN_CREDITS: 10,
  LEGACY_FOUNDRY_SETTLE_WEEKS: 260, LEGACY_GENRE_MIN_FILMS: 8,
})

/** What v1 and v2 share, as literals, never the live exports: 1353-T moved three thresholds and nothing else. */
const LEGACY_ERA_STRUCTURE = Object.freeze({
  boundaryWeek: 6240,
  postFinaleMode: 'ordinary-simulation/v1' as const,
  archetypeIds: Object.freeze([
    'artistic-voice', 'audience-institution', 'commercial-engine', 'technology-pioneer',
    'talent-foundry', 'genre-specialist', 'resilient-survivor', 'awards-dynasty',
  ]),
  lensIds: Object.freeze(['catalog', 'people', 'technology', 'ranking', 'financialBand', 'market', 'resilience', 'awards']),
  lensCountKeys: Object.freeze({
    catalog: Object.freeze(['releases', 'settled', 'inReleaseAtBoundary', 'authoredPre1920']),
    people: Object.freeze(['credited', 'discoveries']),
    technology: Object.freeze(['operationalAdoptions']),
    ranking: Object.freeze(['rankedQuarters', 'quartersAtFirst', 'bestRank']),
    financialBand: Object.freeze(['inTheRed', 'strained', 'stable', 'thriving']),
    market: Object.freeze(['assessed', 'underPressure']),
    resilience: Object.freeze(['warnings', 'distressEntries', 'returnsToStable', 'closures']),
    awards: Object.freeze([]),
  }),
  bounds: Object.freeze({ domains: 16, archetypes: 8, refsPerSide: 12, lenses: 12 }),
  domainIds: Object.freeze([
    'playerFilms', 'industryFilms', 'playerRuns', 'playerCareerEvents', 'industryCareerEvents',
    'technologyAdoptions', 'technologyCatalogue', 'powerRanking', 'corporateCondition',
    'marketAssessments', 'awards',
  ]),
})

/** A frozen entry. Its evaluator stamps the entry's own id, boundary and mode and applies the entry's own
 * thresholds, so a replay under one era never writes another's (1353-U finding 8; 1353-F7 ruling 4). */
function frozenDefinition(definition: LegacyDefinitionId, thresholds: LegacyThresholds): LegacyDefinition {
  const era = { ...LEGACY_ERA_STRUCTURE, thresholds }
  return Object.freeze({
    ...era,
    evaluate: (facts: LegacyFacts, kind: LegacyManifestKind) => evaluateLegacyManifest(facts, kind, definition, era),
  })
}

/** The frozen definition table: each era a stored manifest may name. The validator reads only this. */
export const LEGACY_DEFINITIONS: Readonly<Record<LegacyDefinitionId, LegacyDefinition>> = Object.freeze({
  'campaign-legacy/v1': frozenDefinition('campaign-legacy/v1', V1_THRESHOLDS),
  'campaign-legacy/v2': frozenDefinition('campaign-legacy/v2', V2_THRESHOLDS),
})

// ── the root (1359-A §5) ──────────────────────────────────────────────────────
/** The official manifest plus the P15 stamp the freeze adds; the law never sees the stamp. */
export type OfficialLegacy = LegacyManifest & {
  legacySnapshotId: string
  p15DomainSequence: number
  phaseId: string
  phaseOrdinal: number
  phaseOrderVersion: number
}
/** The persisted root, a top-level key of the Save45 step (1359-A §5 "Placement"). */
export type CampaignLegacyRoot = {
  version: 1
  recordedFromWeek: number
  official: OfficialLegacy | null
  /** Wave 5 (1359-A §6): always null in this era. */
  endOfRun: null
}
/** The empty root a fresh world, a migration and a historical lift write: recording from `week`, unfrozen. No
 * freeze runs at migration (1359-A §5.2). */
export const initialCampaignLegacy = (week: number): CampaignLegacyRoot => ({ version: 1, recordedFromWeek: week, official: null, endOfRun: null })
const STAMP_KEYS = ['legacySnapshotId', 'p15DomainSequence', 'phaseId', 'phaseOrdinal', 'phaseOrderVersion'] as const
const FINALE_PHASE = 'p15c.finale'

// ── the validator (1359-A §5.1) ───────────────────────────────────────────────
type Row = Record<string, unknown>
const isRow = (value: unknown): value is Row => value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * The root's validator. `validateSaveV45` runs it after the frozen chain and the sibling roots' validators have
 * proved the rest of the state, and the one allocator check after it (1361-F ruling 5). It judges a manifest by
 * the frozen entry its definition names, never by TUNING or the live exports, and it refuses by name.
 */
export function validateCampaignLegacy(raw: Record<string, unknown>, label: string): void {
  // An explicit type on the binding makes every call a never-returning call for narrowing.
  const refuse: (path: string, rule: string) => never = (path, rule) => {
    throw new Error(`${label}: campaignLegacy${path === '' ? '' : `.${path}`} ${rule}`)
  }
  const exactKeys = (value: Row, keys: readonly string[], path: string): void => {
    const own = Object.keys(value)
    if (own.length !== keys.length || keys.some((key) => !Object.hasOwn(value, key))) {
      refuse(path, `must carry exactly ${keys.join(', ')}`)
    }
  }
  const state = raw as unknown as GameState
  const B = LEGACY_BOUNDARY_WEEK
  const tick = state.market.tick

  // 1. Shape.
  const root = raw.campaignLegacy
  if (!isRow(root)) refuse('', 'must be an object')
  exactKeys(root, ['version', 'recordedFromWeek', 'official', 'endOfRun'], '')
  if (root.version !== 1) refuse('version', 'must be 1')
  const from = root.recordedFromWeek
  if (typeof from !== 'number' || !Number.isSafeInteger(from) || from < 0 || from > tick) {
    refuse('recordedFromWeek', 'must be a whole week in [0, market.tick]')
  }
  if (root.endOfRun !== null) refuse('endOfRun', 'must be null in this era: the end-of-run record is Wave 5 (1359-A §6)')

  // 2. The marker rule (1359-A §4.3). The freeze was due exactly when the industry and the root both record
  // from before B and the save stands at B or later. No official manifest exists unless it was due.
  const h = state.hollywood
  const due = h !== null && h.originWeek < B && from < B && tick >= B
  if (!due && root.official !== null) refuse('official', 'must be null: the 2040 freeze was not due')
  if (root.official === null || h === null) return // a manifest that was due has an industry
  const value = root.official
  if (!isRow(value)) refuse('official', 'must be an object')
  exactKeys(value, ['kind', 'definition', 'boundaryWeek', 'postFinaleMode', 'sources', 'studios', ...STAMP_KEYS], 'official')
  const official = value as unknown as OfficialLegacy

  // 3. Identity, against the frozen definition table.
  if (official.kind !== 'official2040') refuse('official.kind', 'must be official2040')
  if (typeof official.definition !== 'string' || !Object.hasOwn(LEGACY_DEFINITIONS, official.definition)) {
    refuse('official.definition', 'must name a definition of the frozen table')
  }
  const entry = LEGACY_DEFINITIONS[official.definition]
  if (official.boundaryWeek !== entry.boundaryWeek) refuse('official.boundaryWeek', `must be ${entry.boundaryWeek}, its definition's boundary`)
  if (official.postFinaleMode !== entry.postFinaleMode) refuse('official.postFinaleMode', `must be ${entry.postFinaleMode}, its definition's mode`)

  // 4. The stamp (1355-F2 items 2-5). This root's own rule: a whole sequence and the id that cites it. Distinct
  // across the P15 roots and below p15Sequence.next is the one allocator check's rule (1361-F ruling 5).
  const sequence = official.p15DomainSequence
  if (typeof sequence !== 'number' || !Number.isSafeInteger(sequence) || sequence < 1) {
    refuse('official.p15DomainSequence', 'must be a whole number of at least 1')
  }
  if (official.legacySnapshotId !== `campaign-legacy-${sequence}`) refuse('official.legacySnapshotId', 'must be campaign-legacy-<p15DomainSequence>')
  if (official.phaseId !== FINALE_PHASE) refuse('official.phaseId', `must be ${FINALE_PHASE}`)
  // 1355-F5 ruling 1 (1361-F ruling 6): the entry of the manifest's own phase-order version, read through the
  // exported table. A version with no table, or a table with no finale entry, refuses.
  const phase = Number.isSafeInteger(official.phaseOrderVersion)
    ? P15_PHASE_TABLES[official.phaseOrderVersion]?.find((candidate) => candidate.phaseId === FINALE_PHASE) : undefined
  if (phase === undefined || phase.phaseOrdinal !== official.phaseOrdinal) {
    refuse('official.phaseOrdinal', `and official.phaseOrderVersion must be the ${FINALE_PHASE} entry of their phase-order table`)
  }

  // 5. Bounds per the entry.
  const { bounds } = entry
  if (!Array.isArray(official.sources) || official.sources.length > bounds.domains) {
    refuse('official.sources', `must name at most ${bounds.domains} sources`)
  }
  const sourceIds = new Set<string>()
  official.sources.forEach((source, i) => {
    const at = `official.sources[${i}]`
    if (!isRow(source)) refuse(at, 'must be an object')
    exactKeys(source as unknown as Row, ['domainId', 'highWatermark', 'recordedFromWeek', 'status'], at)
    if (!entry.domainIds.includes(source.domainId) || source.domainId === 'awards') {
      refuse(`${at}.domainId`, 'must name a domain of its definition other than awards')
    }
    if (sourceIds.has(source.domainId)) refuse(`${at}.domainId`, 'must not repeat a domain')
    sourceIds.add(source.domainId)
  })
  if (!Array.isArray(official.studios)) refuse('official.studios', 'must be an array')
  const identities = new Map(h.identities.map((identity) => [identity.studioId, identity]))
  const studioIds = new Set<string>()
  let previous: { row: number; studioId: string } | null = null
  official.studios.forEach((studio, i) => {
    const at = `official.studios[${i}]`
    if (!isRow(studio)) refuse(at, 'must be an object')
    exactKeys(studio as unknown as Row, ['studioId', 'standingAtBoundary', 'archetypes', 'lenses'], at)
    const identity = identities.get(studio.studioId)
    if (identity === undefined || identity.enteredWeek === null || identity.enteredWeek >= entry.boundaryWeek || studioIds.has(studio.studioId)) {
      refuse(`${at}.studioId`, 'must name a distinct studio that entered before the boundary')
    }
    studioIds.add(studio.studioId)
    if (previous !== null && (identity.row < previous.row || (identity.row === previous.row && compareText(studio.studioId, previous.studioId) < 0))) {
      refuse('official.studios', 'must list the studios in row order')
    }
    previous = { row: identity.row, studioId: studio.studioId }
    // standingAtBoundary is range-checked only: Standing at B is gone after the freeze tick (1359-F Amendment 1).
    const standing = studio.standingAtBoundary as unknown
    if (!isRow(standing)) refuse(`${at}.standingAtBoundary`, 'must be an object')
    exactKeys(standing, ['audienceAwareness', 'industryPrestige', 'commercialConfidence'], `${at}.standingAtBoundary`)
    for (const channel of ['audienceAwareness', 'industryPrestige', 'commercialConfidence'] as const) {
      const level = standing[channel]
      if (typeof level !== 'number' || !Number.isFinite(level) || level < 0 || level > 100) {
        refuse(`${at}.standingAtBoundary.${channel}`, 'must be a finite value in [0, 100]')
      }
    }
    const archetypes: unknown = studio.archetypes
    if (!Array.isArray(archetypes) || archetypes.length !== entry.archetypeIds.length
      || archetypes.some((a, j) => !isRow(a) || a.archetypeId !== entry.archetypeIds[j])) {
      refuse(`${at}.archetypes`, `must list the ${entry.archetypeIds.length} archetypes of ${official.definition} in order`)
    }
    studio.archetypes.forEach((archetype, j) => {
      const aat = `${at}.archetypes[${j}]`
      exactKeys(archetype as unknown as Row, ['archetypeId', 'outcome', 'limitedBy', 'qualifyingCount', 'contraryCount', 'qualifying', 'contrary'], aat)
      if (!['held', 'notHeld', 'notRecorded'].includes(archetype.outcome)) refuse(`${aat}.outcome`, 'must be held, notHeld or notRecorded')
      for (const side of ['qualifying', 'contrary'] as const) {
        const refs: unknown = archetype[side]
        const count: unknown = archetype[side === 'qualifying' ? 'qualifyingCount' : 'contraryCount']
        if (!Array.isArray(refs) || refs.length > bounds.refsPerSide) refuse(`${aat}.${side}`, `must cite at most ${bounds.refsPerSide} refs`)
        if (!Number.isSafeInteger(count) || (count as number) < refs.length) refuse(`${aat}.${side}Count`, 'must be a whole count of at least its refs')
      }
    })
    const lensList: unknown = studio.lenses
    if (!Array.isArray(lensList) || lensList.length > bounds.lenses) refuse(`${at}.lenses`, `must list at most ${bounds.lenses} lenses`)
    const lensIds = new Set<string>()
    studio.lenses.forEach((lens, k) => {
      const lat = `${at}.lenses[${k}]`
      exactKeys(lens as unknown as Row, ['lensId', 'status', 'counts', 'refs'], lat)
      if (!entry.lensIds.includes(lens.lensId) || lensIds.has(lens.lensId)) refuse(`${lat}.lensId`, 'must name a distinct lens of its definition')
      lensIds.add(lens.lensId)
      if (!['complete', 'limited', 'notRecorded'].includes(lens.status)) refuse(`${lat}.status`, 'must be complete, limited or notRecorded')
      const counts: unknown = lens.counts
      if (!isRow(counts)) refuse(`${lat}.counts`, 'must be an object')
      const full = entry.lensCountKeys[lens.lensId] ?? []
      const expected = lens.status === 'notRecorded' ? []
        : lens.lensId === 'ranking' && counts.rankedQuarters === 0 ? full.filter((key) => key !== 'bestRank') : full
      exactKeys(counts, expected, `${lat}.counts`)
      for (const key of expected) {
        if (!Number.isSafeInteger(counts[key]) || (counts[key] as number) < 0) refuse(`${lat}.counts.${key}`, 'must be a whole count')
      }
      const refs: unknown = lens.refs
      if (!Array.isArray(refs) || refs.length > bounds.refsPerSide) refuse(`${lat}.refs`, `must cite at most ${bounds.refsPerSide} refs`)
    })
  })
}
