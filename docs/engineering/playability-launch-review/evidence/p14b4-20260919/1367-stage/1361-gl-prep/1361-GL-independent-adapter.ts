// Exact adapter block extracted from reviewed 1361-GP-probe-r2.ts.
// No production adapter import; no obsolete bridge or pre-P15 root refusal.
import { TECHNOLOGY_CATALOGUE } from '../tree/src/core/technologyCatalogue.ts'
import type { GameState, TalentCareerEvent } from '../tree/src/core/types.ts'
import type { LegacyFacts, LegacyFilmFact, LegacyCareerEventFact, LegacyStudioFact,
  LegacyDomainFact, LegacyRankingSnapshotFact, LegacyMarketAssessmentFact } from '../tree/src/core/campaignLegacy.ts'
class AdapterRefusal extends Error {}
function refuse(field: string, rule: string): never {
  throw new AdapterRefusal(`campaign legacy adapter: ${field} ${rule}`)
}

// r2: the sibling reads, as reference r4 reads them (r4 patch :371-404, :509-532), which Wave 2 production follows
// (1353-F7:59). They stay untyped, as r4's are (1361-F ruling 18), so the shapes come from the charters and the landed
// RED's forgeries (1356-A §5 :93-98; 1355-A §3.3 :90-96; tests/p15c2-campaign-legacy-integration.test.ts:204-239).
type Row = Record<string, unknown>
const rowsOf = (value: unknown): readonly Row[] => (Array.isArray(value) ? value as Row[] : [])
/** §5.1 item 6 (:171-172): a sibling root recorded from `boundaryWeek` or later arrived after it and reads as absent. */
function siblingBefore(state: GameState, key: string, boundaryWeek: number): Row | undefined {
  const root = (state as unknown as Row)[key]
  if (root === null || typeof root !== 'object') return undefined
  const from = (root as Row).recordedFromWeek
  return typeof from === 'number' && from < boundaryWeek ? root as Row : undefined
}
/** §3.2 :79-83 with 1355-F2 item 7: the root's own recordedFromWeek, and as watermark the largest p15DomainSequence in
 * the root, 0 if none. An absent root gives recordedFromWeek null and watermark 0 (:83). */
function siblingDomain(domainId: string, root: Row | undefined, rows: (root: Row) => readonly Row[]): LegacyDomainFact {
  if (root === undefined) return { domainId, highWatermark: 0, recordedFromWeek: null }
  let largest = 0
  for (const row of rows(root)) {
    const sequence = row.p15DomainSequence
    if (typeof sequence === 'number' && sequence > largest) largest = sequence
  }
  return { domainId, highWatermark: largest, recordedFromWeek: root.recordedFromWeek as number }
}

function legacyFactsFromState(state: GameState, boundaryWeek: number): LegacyFacts {
  if (state.hollywood === null) refuse('state.hollywood', 'must hold the living industry the Legacy reads (1359-A :115)')
  const h = state.hollywood
  const genreOf = new Map(state.concepts.map(concept => [concept.id, concept.genre])) // :51
  const runOf = new Map(state.theatricalRuns.map(run => [run.productionId, run])) // :53

  const films: LegacyFilmFact[] = []
  for (const film of state.studio.releasedFilms) { // :49 a player film; its root is studio.releasedFilms (:72)
    const genre = genreOf.get(film.conceptId)
    // :51 the genre comes from state.concepts, and a missing concept refuses by name
    if (genre === undefined) refuse('state.concepts', `must hold concept ${film.conceptId}, the genre of player film ${film.productionId}`)
    const run = runOf.get(film.productionId)
    // :53 settled with no run, a legacyCompleted run, or releaseTick + totalWeeks <= B; settledWeek is then releaseTick
    // for the first two, else releaseTick + totalWeeks - 1
    const settledWeek = run === undefined || run.status === 'legacyCompleted' ? film.releaseTick
      : film.releaseTick + run.totalWeeks <= boundaryWeek ? film.releaseTick + run.totalWeeks - 1 : null
    films.push({
      filmId: film.productionId, domainId: 'playerFilms', // :49
      studioId: h.playerStudioId, // the charter names no owner field; RED r5 patch :939 uses playerStudioId
      provenance: 'campaign', releaseWeek: film.releaseTick, // :50
      genre, criticScore: film.criticScore, audienceScore: null, // :51-52
      status: settledWeek === null ? 'inRun' : 'settled', settledWeek, // :53
      grossSettled: settledWeek === null ? null : film.boxOffice.total, // :54
      credits: [], // :55
    })
  }
  for (const film of h.films) { // :49 a rival film; its root is hollywood.films (:73)
    if (film.provenance === 'simulation/v1') { // live
      const settled = film.settledWeek !== null && film.settledWeek < boundaryWeek // :53
      films.push({
        filmId: film.filmId, domainId: 'industryFilms', studioId: film.studioId, // :49
        provenance: 'campaign', releaseWeek: film.result.releaseTick, // :50
        genre: film.genre, criticScore: film.result.criticScore, audienceScore: null, // :51-52
        status: settled ? 'settled' : 'inRun', settledWeek: settled ? film.settledWeek : null, // :53
        grossSettled: settled ? film.result.boxOffice.total : null, // :54
        credits: [], // :55
      })
    } else { // authored-start/v1
      films.push({
        filmId: film.filmId, domainId: 'industryFilms', studioId: film.studioId, // :49
        provenance: 'authored', releaseWeek: null, // :50
        genre: film.genre, criticScore: film.criticScore, audienceScore: film.audienceScore, // :51-52 both public scores
        status: 'settled', settledWeek: null, // :53 (the landed law refuses this null: see the F1 bridge below)
        grossSettled: film.totalGross, // :54
        credits: film.credits.map(credit => ({ talentId: credit.talentId, role: credit.role })), // :55
      })
    }
  }

  // :56 both career-event roots, tagged, copying the seven fields only
  const eventFact = (event: TalentCareerEvent, domainId: LegacyCareerEventFact['domainId']): LegacyCareerEventFact => ({
    eventId: event.eventId, filmId: event.filmId, talentId: event.talentId, domainId, role: event.role,
    releaseWeek: event.releaseWeek, genre: event.genre, audienceScore: event.audienceScore,
  })

  const studios = h.identities.filter(identity => identity.enteredWeek !== null) // :46 every entered identity
    .sort((a, b) => a.row - b.row) // :46 row order; RED r5 patch :1230 sorts by row alone
    .map((identity): LegacyStudioFact => {
      const standing = identity.studioId === h.playerStudioId ? state.studio.standing // :48 player
        : h.businesses.find(business => business.studioId === identity.studioId)?.standing // :48 rival
      if (standing === undefined) refuse('state.hollywood.businesses', `must hold entered rival ${identity.studioId} (1359-A :48)`)
      return {
        studioId: identity.studioId, row: identity.row, enteredWeek: identity.enteredWeek, // :46
        closedWeek: null, // :47 null without the corporateCondition root, which requireNoRefusedRoots keeps absent
        // :48, as the three channels RED r5 patch :1226-1232 projects
        standing: { audienceAwareness: standing.audienceAwareness, industryPrestige: standing.industryPrestige,
          commercialConfidence: standing.commercialConfidence },
      }
    })

  const ranking = siblingBefore(state, 'powerRanking', boundaryWeek) // :58, :79
  const market = siblingBefore(state, 'sharedMarket', boundaryWeek) // :60, :81
  return {
    boundaryWeek,
    baseMarketValue: state.market.baseMarketValue, // §3.1 names no source; RED r5 patch :1255 pins market.baseMarketValue
    studios,
    films,
    careerEvents: [
      ...state.careerEvents.map(event => eventFact(event, 'playerCareerEvents')),
      ...h.careerEvents.map(event => eventFact(event, 'industryCareerEvents')),
    ],
    adoptions: state.technology.adoptions.map(adoption => ({ // :57
      adoptionId: adoption.id, studioId: adoption.studioId, technologyId: adoption.technologyId,
      operationalWeek: adoption.operationalWeek, cancelledWeek: adoption.cancelledWeek,
    })),
    technologies: TECHNOLOGY_CATALOGUE.map(technology => ({ technologyId: technology.id, commercialWeek: technology.commercialWeek })), // :57
    domains: [ // §3.2 :72-81 in table order; an array watermark is the root's length (:84)
      { domainId: 'playerFilms', highWatermark: state.studio.releasedFilms.length, recordedFromWeek: 0 }, // :72
      { domainId: 'industryFilms', highWatermark: h.films.length, recordedFromWeek: h.originWeek }, // :73
      { domainId: 'playerRuns', highWatermark: state.theatricalRuns.length, recordedFromWeek: 0 }, // :74
      { domainId: 'playerCareerEvents', highWatermark: state.careerEvents.length, recordedFromWeek: 0 }, // :75
      { domainId: 'industryCareerEvents', highWatermark: h.careerEvents.length, recordedFromWeek: h.originWeek }, // :76
      { domainId: 'technologyAdoptions', highWatermark: state.technology.adoptions.length,
        recordedFromWeek: state.technology.recordingStartedWeek }, // :77
      { domainId: 'technologyCatalogue', highWatermark: TECHNOLOGY_CATALOGUE.length, recordedFromWeek: 0 }, // :78
      // :79-81 the three P15 sibling domains, in r4's order (r4 patch :372-376). The ranking watermark reads the
      // sequence on each archive record; its rows carry none (1355-F2 item 2; RED expectedDomains, test :302).
      siblingDomain('powerRanking', ranking, root => rowsOf(root.snapshots)), // :79
      // :80 the condition root stays absent (requireNoRefusedRoots), so :83 gives it recordedFromWeek null,
      // highWatermark 0 and no conditionEvents array; the law then reads it notRecorded (campaignLegacy.ts:458, :531).
      { domainId: 'corporateCondition', highWatermark: 0, recordedFromWeek: null },
      siblingDomain('marketAssessments', market, root => rowsOf(root.assessments)), // :81
    ], // :83 awards is never supplied
    // :58 each archive record's rows as {recordId, week, studioId, rank, band}; recordId is the record's own id
    // (§3.3 A1; `power-ranking-<p15DomainSequence>`, 1355-F2 item 5). One record gives one fact per studio row, so its
    // id repeats across rows: see the record-id bridge below. An absent root leaves the array undefined (:83).
    ...(ranking === undefined ? {} : {
      rankingSnapshots: rowsOf(ranking.snapshots).flatMap(record => rowsOf(record.rows).map(
        (row): LegacyRankingSnapshotFact => ({
          recordId: record.id as string, week: record.week as number, studioId: row.studioId as string,
          rank: row.rank as number | null, band: row.band as LegacyRankingSnapshotFact['band'],
        }))),
    }),
    // :60 {assessmentId: releaseId, studioId, week, assessed: true, underPressure: factor < 1}; `week` per §3.3 A2.
    // The factor is read only for that comparison; pressure, terms, digest and reasons stay unread.
    ...(market === undefined ? {} : {
      marketAssessments: rowsOf(market.assessments).map((assessment): LegacyMarketAssessmentFact => ({
        assessmentId: assessment.releaseId as string, studioId: assessment.studioId as string,
        week: assessment.week as number, assessed: true, underPressure: (assessment.factor as number) < 1,
      })),
    }),
  }
}


export { legacyFactsFromState as independentLegacyFactsFromState }
