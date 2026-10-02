// 1361-GP-r2: the P15C Wave 2 measurement probe G-P (charter 1359-A §9 :260-264, which carries 1353-A §9 :264-270).
// r1 is 1359-stage/gp/1359-GP-probe.ts in the p14b4-20260919 evidence directory (sha256 f0f0c0f6…), run as 1359-X4
// and 1353-X4. r2 reads the P15 sibling roots r1 refused (1361-F ruling 12; 1353-F7 ruling 5) and changes nothing else
// in the measurement; 1361-GP-notes.md gives the diff hunk by hunk.
// Read-only and written to be run later. It ticks each recorded seed's natural route through the public tick API
// (`p13aGeneratedStudio` then `tick`, the 1344-P2 harness) to week 6240, one pass per seed, then runs the freeze once
// on the produced state: 1359-A §3's adapter, carried inline below because Wave 2 production has not landed it, feeds
// the landed Wave 1 law (src/core/campaignLegacy.ts, at the tree's values). Nothing is written to disk: one JSON
// document goes to stdout, progress lines to stderr. No test fixture, doc or save is read or written.
//
// Per seed (1359-A :261-262): holders per archetype, the domain table, adapter refusals, freeze time, manifest bytes.
// Across seeds, per archetype: the retune check (1359-A :262-264; 1353-A :268-270).
//
// Seeds: 1359-A :260-261 and 1353-A :266-267 say "the recorded seeds" and name none. 1355-A :173 names the two
// routes, p13a-core-causal-01 and seed-b, and 1357-A :256-257 runs both through `p13aGeneratedStudio(seed)`, as here.
//
// Run from the gating tree of 1361-F ruling 12: an archive of the writer's candidate after P15A.1 (commit (c) only if
// G2 passed), plus one tree commit with the v2 values as 1353-X4 applied them (1353-X4:12-19). This file sits in
// ../probe; Node v20.20.2. PROBE_TREE_HEAD records the candidate commit and the v2 commit (1361-GP-notes.md §5):
//   PROBE_TREE_HEAD=<candidate>+<v2 commit> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b \
//     ./node_modules/.bin/vite-node ../probe/1361-GP-probe-r2.ts > ../out/gp.json 2> ../out/gp.err
// Smoke first with PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01. No official freeze exists below 6240, so the
// smoke builds an endOfRun manifest at its own week through the same adapter, law and bridges (mode 'smoke').
// The parent adjusts the one import prefix '../tree/' below to that tree.
import { createHash } from 'node:crypto'
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import {
  CAMPAIGN_LEGACY_DEFINITION, LEGACY_ARCHETYPE_IDS, LEGACY_BOUNDARY_WEEK, buildLegacyManifest, freezeLegacy,
} from '../tree/src/core/campaignLegacy.ts'
import type {
  CampaignLegacy, LegacyCareerEventFact, LegacyFacts, LegacyFilmFact, LegacyManifest, LegacyStudio, LegacyStudioFact,
  LegacyDomainFact, LegacyMarketAssessmentFact, LegacyRankingSnapshotFact, LegacyRef,
} from '../tree/src/core/campaignLegacy.ts'
import { stableStringify } from '../tree/src/core/save.ts'
import { TECHNOLOGY_CATALOGUE } from '../tree/src/core/technologyCatalogue.ts'
import { TUNING } from '../tree/src/core/tuning.ts'
import type { GameState, TalentCareerEvent } from '../tree/src/core/types.ts'

const B = LEGACY_BOUNDARY_WEEK // 6240 = 2040 · Week 1 (campaignLegacy.ts:74)
const SEEDS = (process.env.PROBE_SEEDS ?? 'p13a-core-causal-01,seed-b').split(',').map(s => s.trim()).filter(Boolean)
const WEEKS = Number(process.env.PROBE_WEEKS ?? B)
if (!Number.isSafeInteger(WEEKS) || WEEKS < 1 || WEEKS > B) {
  throw new Error(`probe: PROBE_WEEKS must be a whole week in [1, ${B}] (got ${process.env.PROBE_WEEKS})`)
}
if (SEEDS.length === 0) throw new Error('probe: PROBE_SEEDS names no seed')
const MODE = WEEKS === B ? 'g-p' : 'smoke'

// r2: the gating tree carries the P15 sibling roots p15Sequence, powerRanking and sharedMarket (slice 2a and P15A.1 at
// Save45; 1361-F rulings 3, 12). The adapter reads each present one per §3.1 :58 and :60 (below); p15Sequence feeds
// no fact (the law never sees the stamp, §5 :157) and is only reported. Two roots still refuse by name, at week 0
// before the long route and again at the freeze: campaignLegacy, because G-P gates the production that adds it
// (1359-F5:25-26), and corporateCondition, because P15B does not join Save45 (1361-F ruling 17) and this branch keeps
// it on §3.2's absent path (:83). The keys are the landed RED's P15_ROOTS and P15_SIBLINGS
// (tests/helpers/p15-roots.ts:10; tests/helpers/p15c2-legacy.ts:56).
// ponytail: no condition row map; add §3.1 :47 and :59 (r4 patch :462-468, :521-525) when a G-P tree carries P15B.
const P15_KEYS = ['campaignLegacy', 'p15Sequence', 'powerRanking', 'corporateCondition', 'sharedMarket'] as const
const REFUSED_KEYS = ['campaignLegacy', 'corporateCondition'] as const
function requireNoRefusedRoots(state: GameState, where: string): void {
  const present = REFUSED_KEYS.filter(key => key in state)
  if (present.length > 0) {
    throw new Error(`probe: ${where}: the state carries ${present.join(', ')}; G-P runs before P15C's production and `
      + 'without P15B (1361-F rulings 12, 17), so this probe must be extended first')
  }
}

// ── 1359-A §3 (:37-84): the fact adapter `legacyFactsFromState(state, boundaryWeek)`, inline ──
// :39 pure and RNG-free, one pass per root with id maps, no find per film. :40 it passes facts through and the law does
// every cut: the only week comparisons below are :53's two run-status rules and, in r2, §5.1 item 6's sibling rule
// (`siblingBefore`: a root recorded from the boundary or later reads as absent). :62-64 it never reads rival account
// or runs, directCommitment, studioRevenueReceived, loans, career-event money or skill fields, player cash, the ledger
// or any in-run payment. Where the charter is silent, the probe follows the RED r5 expected-value builders, which derive
// "from 1359-A §3.1-§3.2 (never from production)" (r5 patch :928), and the line says so. The two RED r5 helper files
// build no facts: they resolve `legacyFactsFromState` by name (tests/helpers/p15c2-legacy.ts, r5 patch :178).
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

// ── the law, as the Wave 2 step calls it (1359-A §4.2 :115-117) ──
// The step calls freezeLegacy(root, B, facts) on the root worldgen seeds at the creation tick (§5.2 :187-188), week 0
// on these routes. The stamp, the root write and p15Sequence.next belong to the step, and G-P has no root to write.
const EMPTY_ROOT: CampaignLegacy = { version: 1, recordedFromWeek: 0, official: null, endOfRun: null }
function law(facts: LegacyFacts): LegacyManifest {
  if (facts.boundaryWeek !== B) return buildLegacyManifest(facts, 'endOfRun') // smoke only: no official freeze below B
  const { official } = freezeLegacy(EMPTY_ROOT, B, facts)
  if (official === null) throw new Error('probe: freezeLegacy wrote no official manifest at week 6240 (campaignLegacy.ts:800-805)')
  return official
}

// ── the F1 bridge (1359-F2 F1, :6-16) ──
// §3.1 :53 gives an authored film a null settledWeek. The landed law refuses it (campaignLegacy.ts:351), and 1359-F2 F1
// relaxes that refusal for authored films in Wave 2 production, which G-P precedes. The law reads an authored film's
// settledWeek only in that check: an authored film is never a release (campaignLegacy.ts:408), and the manifest
// carries no settledWeek. When the landed law refuses exactly this, the probe records the refusal, runs the law on a
// copy whose authored films read settledWeek 0, and proves the stand-in inert: the copy at B - 1 must give the same
// canonical bytes, or the probe stops. The adapter's own facts stay as §3 builds them.
const F1_REFUSAL = /^campaign legacy: films\[(\d+)\] \(.*\)\.settledWeek must be a whole week once settled$/
const isF1Refusal = (message: string, facts: LegacyFacts): boolean => {
  const match = F1_REFUSAL.exec(message)
  const film = match === null ? undefined : facts.films[Number(match[1])]
  return film !== undefined && film.provenance === 'authored' && film.settledWeek === null
}
const withStandIn = (facts: LegacyFacts, week: number): LegacyFacts => ({
  ...facts,
  films: facts.films.map(film => (film.provenance === 'authored' && film.settledWeek === null ? { ...film, settledWeek: week } : film)),
})

type Attempt = { manifest: LegacyManifest; lawMs: number } | { refusal: string }
function lawAttempt(facts: LegacyFacts): Attempt {
  const started = Date.now()
  try {
    const manifest = law(facts)
    return { manifest, lawMs: Date.now() - started }
  } catch (error) {
    // The law refuses as `campaign legacy: <field> <rule>` (campaignLegacy.ts:222-224); anything else is a probe fault.
    if (error instanceof Error && error.message.startsWith('campaign legacy: ')) return { refusal: error.message }
    throw error
  }
}

// ── r2: the record-id bridge (1359-F3 :29-33; 1359-X F-2; r1 :48-49) ──
// §3.1 :58 gives every row of one ranking record that record's id, so a record with several studio rows yields several
// facts with one recordId (r4 patch :516-520; RED A7, test :584-590). The landed law keys rankingSnapshots on recordId
// alone and refuses a record's second row (campaignLegacy.ts:482, "repeats a record id"). 1359-F3 keys it on
// (recordId, studioId) in Wave 2 production (r4 patch :76-85), which G-P precedes. The law reads recordId in only two
// places: its row checks (campaignLegacy.ts:481-483) and the ranking lens's refs (:736). No archetype reads a ranking
// or market fact (:585-703), so neither this bridge nor the sibling rows can move a holder. When the landed law
// refuses exactly that rule and every (recordId, studioId) pair is distinct, the probe records the refusal, runs the
// law on a copy whose rows carry one id each, and maps every powerRanking ref back to its row's record id. A second id
// scheme, whose ids sort in a different order, must give the same canonical bytes, or the probe stops. A repeated pair
// stays a law refusal, as 1359-F3's rule would refuse it too. `lawMs` is the one law call that returned the manifest;
// the refused call, the second scheme and the mapping are excluded, as the F1 bridge excludes its own reruns.
const RECORD_ID_REFUSAL = /^campaign legacy: rankingSnapshots\[(\d+)\] repeats a record id$/
type RecordIdBridge = { landedLawRefusal: string | null; standInRows: number }
const NO_RECORD_ID_BRIDGE: RecordIdBridge = { landedLawRefusal: null, standInRows: 0 }
const pairId = (row: LegacyRankingSnapshotFact): string => JSON.stringify([row.recordId, row.studioId])
const isRecordIdRefusal = (message: string, facts: LegacyFacts): boolean => {
  const match = RECORD_ID_REFUSAL.exec(message)
  const rows = facts.rankingSnapshots
  return match !== null && rows !== undefined && rows[Number(match[1])] !== undefined
    && new Set(rows.map(pairId)).size === rows.length
}
function withRowIds(facts: LegacyFacts, idOf: (row: LegacyRankingSnapshotFact) => string) {
  const rows = facts.rankingSnapshots ?? []
  return {
    facts: { ...facts, rankingSnapshots: rows.map(row => ({ ...row, recordId: idOf(row) })) },
    recordIdOf: new Map(rows.map(row => [idOf(row), row.recordId])),
  }
}
function withRecordIds(manifest: LegacyManifest, recordIdOf: ReadonlyMap<string, string>): LegacyManifest {
  const back = (ref: LegacyRef): LegacyRef => {
    if (ref.domainId !== 'powerRanking') return ref
    const id = recordIdOf.get(ref.id)
    if (id === undefined) throw new Error(`probe: powerRanking ref ${ref.id} names no stand-in row`)
    return { ...ref, id }
  }
  return {
    ...manifest,
    studios: manifest.studios.map(studio => ({
      ...studio,
      archetypes: studio.archetypes.map(a => ({ ...a, qualifying: a.qualifying.map(back), contrary: a.contrary.map(back) })),
      lenses: studio.lenses.map(lens => ({ ...lens, refs: lens.refs.map(back) })),
    })),
  }
}
type Bridged = Attempt & { recordId: RecordIdBridge }
function attempt(facts: LegacyFacts): Bridged {
  const first = lawAttempt(facts)
  if ('manifest' in first || !isRecordIdRefusal(first.refusal, facts)) return { ...first, recordId: NO_RECORD_ID_BRIDGE }
  const recordId: RecordIdBridge = { landedLawRefusal: first.refusal, standInRows: facts.rankingSnapshots!.length }
  const one = withRowIds(facts, pairId)
  const bridged = lawAttempt(one.facts)
  if (!('manifest' in bridged)) return { ...bridged, recordId }
  const two = withRowIds(facts, row => JSON.stringify([row.studioId, row.recordId]))
  const other = lawAttempt(two.facts)
  const manifest = withRecordIds(bridged.manifest, one.recordIdOf)
  if (!('manifest' in other) || stableStringify(withRecordIds(other.manifest, two.recordIdOf)) !== stableStringify(manifest)) {
    throw new Error('probe: the record-id stand-in is not inert (two id schemes disagree); apply 1359-F3 to the tree\'s law and rerun')
  }
  return { manifest, lawMs: bridged.lawMs, recordId }
}

type F1 = { landedLawRefusal: string | null; standInFilms: number }
type LawRun = { manifest: LegacyManifest | null; lawMs: number | null; lawRefusal: string | null; f1: F1; recordId: RecordIdBridge }
function runLaw(facts: LegacyFacts, seed: string): LawRun {
  const first = attempt(facts)
  if ('manifest' in first) return { ...first, lawRefusal: null, f1: { landedLawRefusal: null, standInFilms: 0 } }
  if (!isF1Refusal(first.refusal, facts)) {
    return { manifest: null, lawMs: null, lawRefusal: first.refusal, f1: { landedLawRefusal: null, standInFilms: 0 },
      recordId: first.recordId }
  }
  const f1: F1 = { landedLawRefusal: first.refusal,
    standInFilms: facts.films.filter(film => film.provenance === 'authored' && film.settledWeek === null).length }
  console.error(`[1359-GP] ${seed}: F1 BRIDGE: the landed law refused an authored film's null settledWeek `
    + `(campaignLegacy.ts:351; 1359-F2 F1); the law runs on a copy where ${f1.standInFilms} authored films read settledWeek 0`)
  const bridged = attempt(withStandIn(facts, 0))
  if (!('manifest' in bridged)) return { manifest: null, lawMs: null, lawRefusal: bridged.refusal, f1, recordId: bridged.recordId }
  const other = attempt(withStandIn(facts, B - 1))
  if (!('manifest' in other) || stableStringify(other.manifest) !== stableStringify(bridged.manifest)) {
    throw new Error(`probe: ${seed}: the F1 stand-in is not inert (settledWeek 0 and ${B - 1} disagree); apply 1359-F2 F1 to the tree's law and rerun`)
  }
  return { ...bridged, lawRefusal: null, f1 }
}

function adapt(state: GameState): { facts: LegacyFacts | null; refusals: string[]; adapterMs: number } {
  const started = Date.now()
  try {
    const facts = legacyFactsFromState(state, WEEKS)
    return { facts, refusals: [], adapterMs: Date.now() - started }
  } catch (error) {
    if (!(error instanceof AdapterRefusal)) throw error
    // The adapter stops at its first refusal, as the Wave 2 step would (1359-A §8 B5), so the list holds at most one.
    return { facts: null, refusals: [error.message], adapterMs: Date.now() - started }
  }
}

function outcomeOf(studio: LegacyStudio, archetypeId: string): string {
  const result = studio.archetypes.find(a => a.archetypeId === archetypeId)
  if (result === undefined) throw new Error(`probe: studio ${studio.studioId} carries no ${archetypeId} result`)
  return result.outcome
}
function holdersOf(manifest: LegacyManifest) {
  return Object.fromEntries(LEGACY_ARCHETYPE_IDS.map(archetypeId => {
    const having = (outcome: string) => manifest.studios.filter(s => outcomeOf(s, archetypeId) === outcome).map(s => s.studioId)
    return [archetypeId, { held: having('held'), notHeld: having('notHeld'), notRecorded: having('notRecorded') }]
  }))
}
// The law takes no role input; `role` comes from hollywood.playerStudioId for reading only.
function studioRows(manifest: LegacyManifest, facts: LegacyFacts, playerStudioId: string) {
  return manifest.studios.map(studio => ({
    studioId: studio.studioId,
    role: studio.studioId === playerStudioId ? 'player' : 'rival',
    enteredWeek: facts.studios.find(s => s.studioId === studio.studioId)?.enteredWeek ?? null,
    catalog: studio.lenses.find(lens => lens.lensId === 'catalog')?.counts ?? null,
    held: studio.archetypes.filter(a => a.outcome === 'held').map(a => a.archetypeId),
  }))
}

function runSeed(seed: string) {
  const started = Date.now()
  let state = p13aGeneratedStudio(seed)
  requireNoRefusedRoots(state, `${seed} at week ${state.market.tick}`)
  while (state.market.tick < WEEKS) {
    state = tick(state)
    if (state.market.tick % 520 === 0) {
      console.error(`[1359-GP] ${seed}: week ${state.market.tick}/${WEEKS}, ${Math.round((Date.now() - started) / 1000)} s`)
    }
  }
  const routeMs = Date.now() - started
  // §4.1 :101-106 and §4.2 :115-118: the freeze runs last in the tick that produces B and reads that tick's final
  // state. On the gating tree the ranking record wraps tick()'s last expression and the freeze would wrap that in turn
  // (1361-F ruling 9; 1356-A §4 :76-89), and no condition step exists (1361-F ruling 17). So that state is tick()'s
  // result at B, `state` here, with the week-6240 ranking record inside (G-L's K3, :265-266).
  requireNoRefusedRoots(state, `${seed} at week ${state.market.tick}`)
  const h = state.hollywood
  // §4.2 :115 and the marker rule §4.3 :129-130: the freeze is due only with an industry that originated before B.
  if (h === null || h.originWeek >= WEEKS) {
    throw new Error(`probe: ${seed}: the freeze is not due at week ${state.market.tick} (no industry, or one that originated at or after it; 1359-A :115, :130)`)
  }
  const { facts, refusals, adapterMs } = adapt(state)
  // r2: the P15 roots at the freeze and what the adapter fed from them. p15Sequence feeds no fact; its `next` lets the
  // parent check the watermarks (1355-F2 item 4: next is one more than the largest sequence across the roots).
  const next = ((state as unknown as Row).p15Sequence as Row | undefined)?.next
  const siblings = {
    roots: P15_KEYS.filter(key => key in state),
    p15SequenceNext: typeof next === 'number' ? next : null,
    rankingRecords: facts?.rankingSnapshots === undefined ? null : new Set(facts.rankingSnapshots.map(row => row.recordId)).size,
    rankingRows: facts?.rankingSnapshots?.length ?? null,
    marketRows: facts?.marketAssessments?.length ?? null,
  }
  console.error(`[1359-GP] ${seed}: P15 roots at week ${state.market.tick}: ${siblings.roots.join(', ') || 'none'}; `
    + `p15Sequence.next ${siblings.p15SequenceNext ?? '-'}; ranking ${siblings.rankingRecords ?? '-'} records in `
    + `${siblings.rankingRows ?? '-'} rows; market ${siblings.marketRows ?? '-'} assessments`)
  const run = facts === null ? null : runLaw(facts, seed)
  if (run !== null && run.recordId.landedLawRefusal !== null) {
    console.error(`[1359-GP] ${seed}: RECORD-ID BRIDGE: the landed law refused a ranking record's second studio row `
      + `(campaignLegacy.ts:482; 1359-F3); the law runs on a copy where ${run.recordId.standInRows} ranking rows carry one `
      + 'id each, and every powerRanking ref maps back to its record id')
  }
  const manifest = run === null ? null : run.manifest
  const canonical = manifest === null ? null : stableStringify(manifest) // the bytes exportSave writes (save.ts:6581-6584)
  const bytes = canonical === null ? null : Buffer.byteLength(canonical, 'utf8')
  const lawMs = run === null ? null : run.lawMs
  console.error(`[1359-GP] ${seed}: ${MODE === 'g-p' ? 'freeze' : 'smoke endOfRun'} at week ${state.market.tick}: `
    + `adapter ${adapterMs} ms, law ${lawMs ?? '-'} ms, manifest ${bytes ?? '-'} bytes`
    + (refusals.length > 0 ? `; ADAPTER REFUSAL: ${refusals[0]}` : '')
    + (run !== null && run.lawRefusal !== null ? `; LAW REFUSAL: ${run.lawRefusal}` : ''))
  const report = {
    seed, finalWeek: state.market.tick, routeMs, msPerTick: routeMs / state.market.tick,
    playerStudioId: h.playerStudioId,
    adapterRefusals: refusals,
    lawRefusal: run === null ? null : run.lawRefusal,
    f1: run === null ? null : run.f1,
    recordIdBridge: run === null ? null : run.recordId, // r2
    // The freeze is the adapter plus the law (§4.2 :116); the refused attempts and both bridges' inertness reruns are
    // excluded.
    freeze: { adapterMs, lawMs, freezeMs: lawMs === null ? null : adapterMs + lawMs },
    siblings, // r2
    domainTable: facts === null ? null : facts.domains.map(d => ({
      ...d, status: manifest === null ? null : manifest.sources.find(s => s.domainId === d.domainId)?.status ?? null,
    })),
    holders: manifest === null ? null : holdersOf(manifest),
    studios: manifest === null || facts === null ? null : studioRows(manifest, facts, h.playerStudioId),
    manifestBytes: bytes,
    manifestSha256: canonical === null ? null : createHash('sha256').update(canonical).digest('hex'),
    manifestCanonical: canonical, // G-L's K3 compares the stamped official minus its stamp with this (1359-A :265-266)
  }
  return { seed, manifest, report }
}

// 1353-A §9 :268-270 and 1359-A §9 :262-264: an evaluated archetype held by every studio in every seed, or by none in
// any seed, returns 1353-A §5.5 to retuning; resilient survivor is exempt while P15B is absent. `retune` reads "by none
// in any seed" as no holder in every seed. `retuneSomeSeedReading` reads it as no holder in some seed.
function retuneCheck(runs: { seed: string; manifest: LegacyManifest | null }[]) {
  const done = runs.filter((r): r is { seed: string; manifest: LegacyManifest } => r.manifest !== null)
  if (done.length === 0) return null
  const p15bAbsent = done.every(r => r.manifest.sources.find(s => s.domainId === 'corporateCondition')?.status === 'notRecorded')
  const archetypes = LEGACY_ARCHETYPE_IDS.map(archetypeId => {
    const per = done.map(({ seed, manifest }) => {
      const outcomes = manifest.studios.map(s => outcomeOf(s, archetypeId))
      return { seed, held: outcomes.filter(o => o === 'held').length, studios: outcomes.length,
        recorded: outcomes.some(o => o !== 'notRecorded') }
    })
    const status = archetypeId === 'resilient-survivor' && p15bAbsent ? 'exempt'
      : per.some(p => p.recorded) ? 'evaluated' : 'notEvaluated'
    const allHoldInEverySeed = per.every(p => p.held === p.studios)
    const noHolderInEverySeed = per.every(p => p.held === 0)
    const noHolderInSomeSeed = per.some(p => p.held === 0)
    return {
      archetypeId, status, held: Object.fromEntries(per.map(p => [p.seed, `${p.held}/${p.studios}`])),
      allHoldInEverySeed, noHolderInEverySeed, noHolderInSomeSeed,
      retune: status === 'evaluated' && (allHoldInEverySeed || noHolderInEverySeed),
      retuneSomeSeedReading: status === 'evaluated' && (allHoldInEverySeed || noHolderInSomeSeed),
    }
  })
  return {
    seedsWithoutManifest: runs.filter(r => r.manifest === null).map(r => r.seed),
    archetypes,
    retune: archetypes.filter(a => a.retune).map(a => a.archetypeId),
    retuneSomeSeedReading: archetypes.filter(a => a.retuneSomeSeedReading).map(a => a.archetypeId),
  }
}

const runs = SEEDS.map(seed => runSeed(seed))
const check = retuneCheck(runs)
console.log(JSON.stringify({
  probe: '1361-GP-r2', gate: 'G-P (1359-A §9; 1353-A §9)', mode: MODE,
  treeHead: process.env.PROBE_TREE_HEAD ?? 'unrecorded', weeks: WEEKS, boundaryWeek: B,
  law: CAMPAIGN_LEGACY_DEFINITION,
  tuning: Object.fromEntries(Object.entries(TUNING).filter(([key]) => key.startsWith('LEGACY_'))),
  seeds: runs.map(r => r.report),
  retuneCheck: check,
}, null, 2))

if (check === null) console.error('[1359-GP] retune check: no seed produced a manifest')
else {
  if (check.seedsWithoutManifest.length > 0) {
    console.error(`[1359-GP] retune check INCOMPLETE: no manifest for ${check.seedsWithoutManifest.join(', ')}`)
  }
  for (const a of check.archetypes) {
    console.error(`[1359-GP] check ${a.archetypeId}: ${a.status}; held ${Object.entries(a.held).map(([seed, n]) => `${seed} ${n}`).join(', ')}; `
      + `retune ${a.retune ? 'YES' : 'no'} (some-seed reading ${a.retuneSomeSeedReading ? 'YES' : 'no'})`)
  }
}
const failed = runs.filter(r => r.manifest === null).map(r => r.seed)
if (failed.length > 0) {
  console.error(`[1359-GP] FAILED: no manifest for ${failed.join(', ')}; see adapterRefusals and lawRefusal`)
  process.exitCode = 1
}
