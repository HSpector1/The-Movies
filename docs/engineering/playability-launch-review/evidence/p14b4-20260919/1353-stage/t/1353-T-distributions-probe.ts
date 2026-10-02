// 1353-T: the distributions probe for the 1353-A §5.5 retune of `artistic-voice` and `commercial-engine` (1359-F5
// rulings 2-3 and Next item 1). Read-only, and written to be run later by the parent.
//
// It ticks each seed's natural route (`p13aGeneratedStudio(seed)` then `tick`, the 1344-P2 harness of 1357-P and
// 1359-GP) to week 6240, one pass per seed. On the state `tick()` returns at 6240 it runs 1359-GP's inline copy of
// 1359-A §3's adapter, unchanged, and reads each campaign release the way the landed law `campaign-legacy/v1`
// (src/core/campaignLegacy.ts) reads it. One JSON document goes to stdout:
// - per release, the facts the two rules read (`releaseColumns`, `releaseRows`);
// - per studio and seed, both rules' counts at the tree's TUNING and the quantiles of critic score and of
//   gross ÷ baseMarketValue over the studio's releases (`seeds[].studios`);
// - per seed, the same quantiles over every rival release (`seeds[].allRivals`).
// Progress lines go to stderr. The probe writes nothing to disk and reads no fixture, doc, save or Owner file.
//
// The rules (1353-A :160, :162; campaignLegacy.ts:585-593, :615-625; values at tuning.ts:1042-1048):
// - artistic-voice is held when a ≥ LEGACY_MIN_FILMS and 100a ≥ LEGACY_MIN_SHARE_PERCENT × n. n counts the studio's
//   releases, and a counts those with critic ≥ LEGACY_CRITIC_ACCLAIM_MIN.
// - commercial-engine is held when h ≥ LEGACY_MIN_FILMS and 100h ≥ LEGACY_MIN_SHARE_PERCENT × s. s counts the settled
//   releases, and h counts those with 100 × gross ≥ LEGACY_HIT_REACH_PERCENT × baseMarketValue.
//
// The law check. The probe also runs the landed law on the same facts, through 1359-GP's F1 bridge, and compares its
// own counts with the manifest's for every studio (lawCheck below). It prints each mismatch on stderr and in
// `seeds[].lawCheck`, never patches one over, and exits 1 when a seed has a mismatch or no manifest.
//
// Run from the 1359-GP scratch tree (a `git archive` of 975e72a1, whose `src` equals b0809602's, with node_modules
// linked), with this file in ../probe, under Node v20.20.2. PROBE_TREE_HEAD records the tree's full HEAD:
//   PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b,p13a-wait-control-01 \
//     ./node_modules/.bin/vite-node ../probe/1353-T-distributions-probe.ts > 1353-T-output.json 2> 1353-T-progress.txt
// Smoke first with PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01. No official freeze exists below 6240, so a smoke
// builds an endOfRun manifest at its own week through the same adapter, law and F1 bridge, as 1359-GP's smoke does.
// The parent adjusts the one import prefix '../tree/' below to that tree.
import { createHash } from 'node:crypto'
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import { campaignDate } from '../tree/src/core/calendar.ts'
import {
  CAMPAIGN_LEGACY_DEFINITION, LEGACY_BOUNDARY_WEEK, buildLegacyManifest, freezeLegacy,
} from '../tree/src/core/campaignLegacy.ts'
import type {
  CampaignLegacy, LegacyCareerEventFact, LegacyFacts, LegacyFilmFact, LegacyManifest, LegacyStudioFact,
} from '../tree/src/core/campaignLegacy.ts'
import { stableStringify } from '../tree/src/core/save.ts'
import { TECHNOLOGY_CATALOGUE } from '../tree/src/core/technologyCatalogue.ts'
import { TUNING } from '../tree/src/core/tuning.ts'
import { quantile } from '../tree/src/harness/d16/stats.ts'
import type { GameState, TalentCareerEvent } from '../tree/src/core/types.ts'

const B = LEGACY_BOUNDARY_WEEK // 6240 = 2040 · Week 1 (campaignLegacy.ts:74)
const SEEDS = (process.env.PROBE_SEEDS ?? 'p13a-core-causal-01,seed-b,p13a-wait-control-01')
  .split(',').map(s => s.trim()).filter(Boolean)
const WEEKS = Number(process.env.PROBE_WEEKS ?? B)
if (!Number.isSafeInteger(WEEKS) || WEEKS < 1 || WEEKS > B) {
  throw new Error(`probe: PROBE_WEEKS must be a whole week in [1, ${B}] (got ${process.env.PROBE_WEEKS})`)
}
if (SEEDS.length === 0) throw new Error('probe: PROBE_SEEDS names no seed')
const MODE = WEEKS === B ? 'full' : 'smoke'

// ── 1359-GP-probe.ts :44-246, carried verbatim except for one progress tag ──
// Lines 61-263 below are 1359-GP's lines 44-246 (its line N is line N + 17 here): the sibling-root guard, the inline
// adapter, the law call with the F1 bridge, and adapt(). Only runLaw's F1 BRIDGE line differs, tagged [1353-T] for
// [1359-GP]. Their comments cite 1359-GP's own line numbers. Reusing them gives the law the facts 1359-GP gave it.
// G-P runs before Wave 2 production with every P15 sibling absent (1359-A :260; §10 items 2-3). The inline adapter
// implements only §3.2's absent-sibling branch (:83), so a state that carries any P15 root refuses here by name: at
// week 0, before the long route, and again at the freeze. The keys are the RED r5 helpers' P15_ROOTS and P15_SIBLINGS
// (r5 patch :16, :103).
// ponytail: absent branch only; add the §3.1 :58-60 row maps, and check the law's record-id rule (1359-F3), when a
// sibling root lands in the probe's tree.
const P15_KEYS = ['campaignLegacy', 'p15Sequence', 'powerRanking', 'corporateCondition', 'sharedMarket'] as const
function requireNoP15Roots(state: GameState, where: string): void {
  const present = P15_KEYS.filter(key => key in state)
  if (present.length > 0) {
    throw new Error(`probe: ${where}: the state carries P15 root(s) ${present.join(', ')}; this G-P adapter reads every `
      + 'sibling as absent (1359-A :83) and must be extended first')
  }
}

// ── 1359-A §3 (:37-84): the fact adapter `legacyFactsFromState(state, boundaryWeek)`, inline ──
// :39 pure and RNG-free, one pass per root with id maps, no find per film. :40 it passes facts through and the law does
// every cut: the only week comparisons below are :53's two run-status rules. :62-64 it never reads rival account or
// runs, directCommitment, studioRevenueReceived, loans, career-event money or skill fields, player cash, the ledger or
// any in-run payment. Where the charter is silent, the probe follows the RED r5 expected-value builders, which derive
// "from 1359-A §3.1-§3.2 (never from production)" (r5 patch :928), and the line says so. The two RED r5 helper files
// build no facts: they resolve `legacyFactsFromState` by name (tests/helpers/p15c2-legacy.ts, r5 patch :178).
class AdapterRefusal extends Error {}
function refuse(field: string, rule: string): never {
  throw new AdapterRefusal(`campaign legacy adapter: ${field} ${rule}`)
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
        closedWeek: null, // :47 null without the corporateCondition root, which requireNoP15Roots keeps absent
        // :48, as the three channels RED r5 patch :1226-1232 projects
        standing: { audienceAwareness: standing.audienceAwareness, industryPrestige: standing.industryPrestige,
          commercialConfidence: standing.commercialConfidence },
      }
    })

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
      // :79-81 the three P15 sibling domains. Their roots are absent, so :83 gives each recordedFromWeek null,
      // highWatermark 0 and no fact array: rankingSnapshots, conditionEvents and marketAssessments stay undefined.
      { domainId: 'powerRanking', highWatermark: 0, recordedFromWeek: null },
      { domainId: 'corporateCondition', highWatermark: 0, recordedFromWeek: null },
      { domainId: 'marketAssessments', highWatermark: 0, recordedFromWeek: null },
    ], // :83 awards is never supplied
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
function attempt(facts: LegacyFacts): Attempt {
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

type F1 = { landedLawRefusal: string | null; standInFilms: number }
type LawRun = { manifest: LegacyManifest | null; lawMs: number | null; lawRefusal: string | null; f1: F1 }
function runLaw(facts: LegacyFacts, seed: string): LawRun {
  const first = attempt(facts)
  if ('manifest' in first) return { ...first, lawRefusal: null, f1: { landedLawRefusal: null, standInFilms: 0 } }
  if (!isF1Refusal(first.refusal, facts)) {
    return { manifest: null, lawMs: null, lawRefusal: first.refusal, f1: { landedLawRefusal: null, standInFilms: 0 } }
  }
  const f1: F1 = { landedLawRefusal: first.refusal,
    standInFilms: facts.films.filter(film => film.provenance === 'authored' && film.settledWeek === null).length }
  console.error(`[1353-T] ${seed}: F1 BRIDGE: the landed law refused an authored film's null settledWeek `
    + `(campaignLegacy.ts:351; 1359-F2 F1); the law runs on a copy where ${f1.standInFilms} authored films read settledWeek 0`)
  const bridged = attempt(withStandIn(facts, 0))
  if (!('manifest' in bridged)) return { manifest: null, lawMs: null, lawRefusal: bridged.refusal, f1 }
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
// ── end of the 1359-GP block ──

// ── the releases, read the way the law reads them ──
// The law builds each studio's release list in readFacts (campaignLegacy.ts:404-417) and sorts it at :763. Each row
// mirrors one read. "Adapter :N" cites 1359-GP-probe.ts; this file carries its line N at line N + 17.
// - filmId, studioId: the law groups releases by the film's studioId (:411). Adapter :88-89, :101 (1359-A :49).
// - role: not a law input (1353-A :152-153). 'player' when studioId is hollywood.playerStudioId, as 1359-GP :259-263.
// - releaseWeek: a campaign film released before B (:408-409). Adapter :90, :102 (1359-A :50).
// - settled: status 'settled' and settledWeek < B (:416). Adapter :85-86, :92, :99, :104 (1359-A :53).
// - criticScore: r.film.criticScore (:586, :588). Adapter :91 player film.criticScore, :103 rival
//   film.result.criticScore (1359-A :52).
// - audienceScore: the score on the film's first career event, null for a film with none (:410, :415). The law
//   refuses a film whose events disagree (:396-402). Adapter :121-124, :146-149 (1359-A :56). Neither retuned rule
//   reads it; audience institution does (:596-611).
// - grossSettled: read only for a settled release (:616-617), else null. Adapter :93 player boxOffice.total, :105
//   rival result.boxOffice.total (1359-A :54).
// - reach: grossSettled ÷ baseMarketValue (:272-273; adapter :143), for the quantiles only. Every count uses the law's
//   exact products, 100 × gross against P × baseMarketValue (:618, :620; 1353-A :155-156), never this quotient.
const COLUMNS = ['filmId', 'studioId', 'role', 'releaseWeek', 'settled', 'criticScore', 'audienceScore', 'grossSettled', 'reach'] as const
type Release = {
  filmId: string; studioId: string; role: 'player' | 'rival'; releaseWeek: number; settled: boolean
  criticScore: number; audienceScore: number | null; grossSettled: number | null; reach: number | null
}
const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0) // campaignLegacy.ts:228

function readReleases(facts: LegacyFacts, playerStudioId: string): Map<string, Release[]> {
  const cut = facts.boundaryWeek
  // :377-395 fills each film's event list in facts order, so :410's events[0] is the film's first event in that order
  const firstEventOf = new Map<string, LegacyCareerEventFact>()
  for (const event of facts.careerEvents) if (!firstEventOf.has(event.filmId)) firstEventOf.set(event.filmId, event)
  const releasesOf = new Map<string, Release[]>()
  for (const film of facts.films) { // :407 every film, in facts order
    if (film.provenance !== 'campaign' || film.releaseWeek! >= cut) continue // :408
    const settled = film.status === 'settled' && film.settledWeek! < cut // :416
    const grossSettled = settled ? film.grossSettled! : null // :616-617
    const release: Release = {
      filmId: film.filmId, studioId: film.studioId, role: film.studioId === playerStudioId ? 'player' : 'rival',
      releaseWeek: film.releaseWeek!, settled, criticScore: film.criticScore,
      audienceScore: firstEventOf.get(film.filmId)?.audienceScore ?? null, // :415
      grossSettled, reach: grossSettled === null ? null : grossSettled / facts.baseMarketValue,
    }
    const list = releasesOf.get(film.studioId)
    if (list === undefined) releasesOf.set(film.studioId, [release])
    else list.push(release)
  }
  for (const list of releasesOf.values()) {
    list.sort((a, b) => a.releaseWeek - b.releaseWeek || compareText(a.filmId, b.filmId)) // :567, :763
  }
  return releasesOf
}

// The manifest's studios: entered before B, in (row, studioId) order (campaignLegacy.ts:512-514).
const manifestStudios = (facts: LegacyFacts): LegacyStudioFact[] => facts.studios
  .filter(s => s.enteredWeek !== null && s.enteredWeek < facts.boundaryWeek)
  .sort((a, b) => a.row - b.row || compareText(a.studioId, b.studioId))

// Quantiles are type 7, linear between order statistics: the lab's one definition (src/harness/d16/stats.ts:8-19),
// which 1355-G1 also uses. min and max are its q 0 and q 1. Every point is null for an empty sample.
const POINTS = [['min', 0], ['p50', 0.5], ['p75', 0.75], ['p90', 0.9], ['p95', 0.95], ['p99', 0.99], ['max', 1]] as const
const distribution = (values: number[]) => ({
  count: values.length,
  ...Object.fromEntries(POINTS.map(([key, q]) => [key, values.length === 0 ? null : quantile(values, q)])),
})

// Both rules at the tree's TUNING, by the law's own comparisons. `panned` and `flops` are each rule's contrary count
// (:588, :620), kept for the law check. Critic quantiles run over the n releases artistic voice reads, and reach
// quantiles over the s settled releases commercial engine reads.
function studioSummary(studio: LegacyStudioFact, releases: readonly Release[], baseMarketValue: number, playerStudioId: string) {
  const settled = releases.filter(r => r.settled) // :616
  const n = releases.length
  const a = releases.filter(r => r.criticScore >= TUNING.LEGACY_CRITIC_ACCLAIM_MIN).length // :586, :590
  const s = settled.length
  const h = settled.filter(r => 100 * r.grossSettled! >= TUNING.LEGACY_HIT_REACH_PERCENT * baseMarketValue).length // :618, :622
  return {
    studioId: studio.studioId, role: studio.studioId === playerStudioId ? 'player' : 'rival',
    row: studio.row, enteredWeek: studio.enteredWeek,
    artisticVoice: {
      n, a, sharePercent: n === 0 ? null : (100 * a) / n,
      held: a >= TUNING.LEGACY_MIN_FILMS && 100 * a >= TUNING.LEGACY_MIN_SHARE_PERCENT * n, // :591
      panned: releases.filter(r => r.criticScore < TUNING.LEGACY_CRITIC_PAN_BELOW).length, // :588
    },
    commercialEngine: {
      s, h, sharePercent: s === 0 ? null : (100 * h) / s,
      held: h >= TUNING.LEGACY_MIN_FILMS && 100 * h >= TUNING.LEGACY_MIN_SHARE_PERCENT * s, // :623
      flops: settled.filter(r => 100 * r.grossSettled! < TUNING.LEGACY_FLOP_REACH_PERCENT * baseMarketValue).length, // :620
    },
    critic: distribution(releases.map(r => r.criticScore)),
    reach: distribution(settled.map(r => r.reach!)),
  }
}
type StudioSummary = ReturnType<typeof studioSummary>

// Audience institution's two counts (campaignLegacy.ts:596-611), computed only to check the audience reading.
function audienceDecades(releases: readonly Release[]): { audience: number; other: number } {
  const decades = new Map<number, number[]>()
  for (const r of releases) {
    if (r.audienceScore === null) continue // :599
    const decade = Math.floor(campaignDate(r.releaseWeek).year / 10) // :600
    const scores = decades.get(decade)
    if (scores === undefined) decades.set(decade, [r.audienceScore])
    else scores.push(r.audienceScore)
  }
  let audience = 0
  let other = 0
  for (const scores of decades.values()) {
    if (scores.length < TUNING.LEGACY_DECADE_MIN_RELEASES) continue // :606
    if (2 * scores.filter(x => x >= TUNING.LEGACY_AUDIENCE_LIKED_MIN).length >= scores.length) audience++ // :607-608
    else other++ // :609
  }
  return { audience, other }
}

// The law check. Every manifest count is exact (campaignLegacy.ts:577-581), and the catalog lens counts releases and
// settled releases (:721-726). The probe's reading must reproduce them for every studio, and audience institution's
// two counts check the audience reading. A mismatch is reported, never patched over.
function lawCheck(manifest: LegacyManifest, studios: readonly StudioSummary[], releasesOf: Map<string, Release[]>) {
  const mismatches: string[] = []
  let comparisons = 0
  const compare = (what: string, probeValue: unknown, lawValue: unknown): void => {
    comparisons++
    if (probeValue !== lawValue) mismatches.push(`${what}: probe ${String(probeValue)}, law ${String(lawValue)}`)
  }
  compare('studio order', studios.map(s => s.studioId).join(' '), manifest.studios.map(s => s.studioId).join(' '))
  const read = [...releasesOf.values()].reduce((sum, list) => sum + list.length, 0)
  compare('releases read, against the manifest studios\' releases', read, studios.reduce((sum, s) => sum + s.artisticVoice.n, 0))
  for (const studio of manifest.studios) {
    const mine = studios.find(s => s.studioId === studio.studioId)
    if (mine === undefined) continue // the studio order check reports it
    const result = (archetypeId: string) => studio.archetypes.find(x => x.archetypeId === archetypeId)
    const catalog = studio.lenses.find(lens => lens.lensId === 'catalog')?.counts
    const decades = audienceDecades(releasesOf.get(studio.studioId) ?? [])
    const at = (field: string): string => `${studio.studioId} ${field}`
    compare(at('catalog releases'), mine.artisticVoice.n, catalog?.releases)
    compare(at('catalog settled'), mine.commercialEngine.s, catalog?.settled)
    compare(at('artistic-voice outcome'), mine.artisticVoice.held ? 'held' : 'notHeld', result('artistic-voice')?.outcome)
    compare(at('artistic-voice qualifyingCount'), mine.artisticVoice.a, result('artistic-voice')?.qualifyingCount)
    compare(at('artistic-voice contraryCount'), mine.artisticVoice.panned, result('artistic-voice')?.contraryCount)
    compare(at('commercial-engine outcome'), mine.commercialEngine.held ? 'held' : 'notHeld', result('commercial-engine')?.outcome)
    compare(at('commercial-engine qualifyingCount'), mine.commercialEngine.h, result('commercial-engine')?.qualifyingCount)
    compare(at('commercial-engine contraryCount'), mine.commercialEngine.flops, result('commercial-engine')?.contraryCount)
    compare(at('audience-institution qualifyingCount'), decades.audience, result('audience-institution')?.qualifyingCount)
    compare(at('audience-institution contraryCount'), decades.other, result('audience-institution')?.contraryCount)
  }
  return { studios: manifest.studios.length, releases: read, comparisons, mismatches }
}

function runSeed(seed: string) {
  const started = Date.now()
  let state = p13aGeneratedStudio(seed)
  requireNoP15Roots(state, `${seed} at week ${state.market.tick}`)
  while (state.market.tick < WEEKS) {
    state = tick(state)
    if (state.market.tick % 520 === 0) {
      console.error(`[1353-T] ${seed}: week ${state.market.tick}/${WEEKS}, ${Math.round((Date.now() - started) / 1000)} s`)
    }
  }
  const routeMs = Date.now() - started
  // As 1359-GP :281-288: the freeze reads the state tick() returns at B (1359-A §4.1-§4.2), and it is due only with
  // an industry that originated before B (1359-A :115, :130).
  requireNoP15Roots(state, `${seed} at week ${state.market.tick}`)
  const h = state.hollywood
  if (h === null || h.originWeek >= WEEKS) {
    throw new Error(`probe: ${seed}: the freeze is not due at week ${state.market.tick} (no industry, or one that originated at or after it; 1359-A :115, :130)`)
  }
  const route = { seed, finalWeek: state.market.tick, routeMs, msPerTick: routeMs / state.market.tick, playerStudioId: h.playerStudioId }
  const { facts, refusals } = adapt(state)
  if (facts === null) {
    console.error(`[1353-T] ${seed}: ADAPTER REFUSAL: ${refusals[0]}`)
    return { report: { ...route, adapterRefusals: refusals, lawRefusal: null, lawCheck: null }, rows: [], ok: false }
  }
  const run = runLaw(facts, seed)
  const releasesOf = readReleases(facts, h.playerStudioId)
  const studios = manifestStudios(facts)
    .map(studio => studioSummary(studio, releasesOf.get(studio.studioId) ?? [], facts.baseMarketValue, h.playerStudioId))
  const releases = studios.flatMap(studio => releasesOf.get(studio.studioId) ?? [])
  const rivals = releases.filter(r => r.role === 'rival')
  const check = run.manifest === null ? null : lawCheck(run.manifest, studios, releasesOf)
  const ok = check !== null && check.mismatches.length === 0
  const canonical = run.manifest === null ? null : stableStringify(run.manifest) // the bytes 1359-GP hashed (:292, :313)
  console.error(`[1353-T] ${seed}: ${MODE === 'full' ? 'freeze' : 'smoke endOfRun'} at week ${state.market.tick}: `
    + `${releases.length} releases, ${releases.filter(r => r.settled).length} settled; held: artistic-voice `
    + `${studios.filter(s => s.artisticVoice.held).length}, commercial-engine `
    + `${studios.filter(s => s.commercialEngine.held).length}, of ${studios.length} studios; law check `
    + (check === null ? `NOT RUN, LAW REFUSAL: ${run.lawRefusal}` : ok ? `pass (${check.comparisons} comparisons)`
      : `${check.mismatches.length} MISMATCHES`))
  for (const mismatch of check?.mismatches ?? []) console.error(`[1353-T] ${seed}: LAW CHECK MISMATCH: ${mismatch}`)
  return {
    report: {
      ...route, adapterRefusals: refusals, lawRefusal: run.lawRefusal, f1: run.f1,
      manifestSha256: canonical === null ? null : createHash('sha256').update(canonical).digest('hex'),
      lawCheck: check,
      baseMarketValue: facts.baseMarketValue, // :272-273; adapter :143
      allRivals: {
        critic: distribution(rivals.map(r => r.criticScore)),
        reach: distribution(rivals.filter(r => r.settled).map(r => r.reach!)),
      },
      studios,
    },
    rows: releases.map(r => COLUMNS.map(column => r[column])),
    ok,
  }
}

console.error(`[1353-T] tree ${process.env.PROBE_TREE_HEAD ?? 'unrecorded'}, ${WEEKS} weeks (${MODE}), seeds ${SEEDS.join(', ')}, law ${CAMPAIGN_LEGACY_DEFINITION}`)
const runs = SEEDS.map(seed => ({ seed, ...runSeed(seed) }))
const failed = runs.filter(r => !r.ok).map(r => r.seed)
console.log(JSON.stringify({
  probe: '1353-T', purpose: 'distributions for the 1353-A §5.5 retune of artistic-voice and commercial-engine (1359-F5)',
  mode: MODE, treeHead: process.env.PROBE_TREE_HEAD ?? 'unrecorded', weeks: WEEKS, boundaryWeek: B,
  law: CAMPAIGN_LEGACY_DEFINITION,
  tuning: Object.fromEntries(Object.entries(TUNING).filter(([key]) => key.startsWith('LEGACY_'))),
  quantile: 'type 7, linear between order statistics (src/harness/d16/stats.ts:8-19); min is q 0 and max is q 1; null for an empty sample',
  lawCheck: failed.length === 0 ? 'pass' : `FAIL: ${failed.join(', ')}`,
  seeds: runs.map(r => r.report),
  releaseColumns: COLUMNS,
  releaseRows: Object.fromEntries(runs.map(r => [r.seed, r.rows])),
}, null, 2))
if (failed.length > 0) {
  console.error(`[1353-T] FAILED: ${failed.join(', ')}; see seeds[].adapterRefusals, lawRefusal and lawCheck`)
  process.exitCode = 1
}
