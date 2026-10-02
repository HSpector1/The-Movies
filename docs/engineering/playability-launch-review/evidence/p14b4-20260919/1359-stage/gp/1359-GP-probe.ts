// 1359-GP: the P15C Wave 2 measurement probe G-P (charter 1359-A §9 :260-264, which carries 1353-A §9 :264-270).
// Read-only and written to be run later. It ticks each recorded seed's natural route through the public tick API
// (`p13aGeneratedStudio` then `tick`, the 1344-P2 harness) to week 6240, one pass per seed, then runs the freeze once
// on the produced state: 1359-A §3's adapter, carried inline below because Wave 2 production has not landed it, feeds
// the landed Wave 1 law `campaign-legacy/v1` (src/core/campaignLegacy.ts). Nothing is written to disk: one JSON
// document goes to stdout, progress lines to stderr. No test fixture, doc or save is read or written.
//
// Per seed (1359-A :261-262): holders per archetype, the domain table, adapter refusals, freeze time, manifest bytes.
// Across seeds, per archetype: the retune check (1359-A :262-264; 1353-A :268-270).
//
// Seeds: 1359-A :260-261 and 1353-A :266-267 say "the recorded seeds" and name none. 1355-A :173 names the two
// routes, p13a-core-causal-01 and seed-b, and 1357-A :256-257 runs both through `p13aGeneratedStudio(seed)`, as here.
//
// Run from a scratch tree of e7f075ce, or a later HEAD with the same src (975e72a1 changes docs only), with no patch
// (the adapter is inline), this file in ../probe, under Node v20.20.2. PROBE_TREE_HEAD records the tree's full HEAD:
//   PROBE_TREE_HEAD=<tree HEAD> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b \
//     ./node_modules/.bin/vite-node ../probe/1359-GP-probe.ts > 1359-GP-output.json 2> 1359-GP-progress.txt
// Smoke first with PROBE_WEEKS=20 PROBE_SEEDS=p13a-core-causal-01. No official freeze exists below 6240, so the
// smoke builds an endOfRun manifest at its own week through the same adapter, law and F1 bridge (mode 'smoke').
// The parent adjusts the one import prefix '../tree/' below to that tree.
import { createHash } from 'node:crypto'
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import {
  CAMPAIGN_LEGACY_DEFINITION, LEGACY_ARCHETYPE_IDS, LEGACY_BOUNDARY_WEEK, buildLegacyManifest, freezeLegacy,
} from '../tree/src/core/campaignLegacy.ts'
import type {
  CampaignLegacy, LegacyCareerEventFact, LegacyFacts, LegacyFilmFact, LegacyManifest, LegacyStudio, LegacyStudioFact,
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
  console.error(`[1359-GP] ${seed}: F1 BRIDGE: the landed law refused an authored film's null settledWeek `
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
  requireNoP15Roots(state, `${seed} at week ${state.market.tick}`)
  while (state.market.tick < WEEKS) {
    state = tick(state)
    if (state.market.tick % 520 === 0) {
      console.error(`[1359-GP] ${seed}: week ${state.market.tick}/${WEEKS}, ${Math.round((Date.now() - started) / 1000)} s`)
    }
  }
  const routeMs = Date.now() - started
  // §4.1 :101-106 and §4.2 :115-118: the freeze runs last in the tick that produces B and reads that tick's final
  // state. HEAD has no ranking or condition step, so that state is tick()'s result at B, `state` here (G-L's K3, :265-266).
  requireNoP15Roots(state, `${seed} at week ${state.market.tick}`)
  const h = state.hollywood
  // §4.2 :115 and the marker rule §4.3 :129-130: the freeze is due only with an industry that originated before B.
  if (h === null || h.originWeek >= WEEKS) {
    throw new Error(`probe: ${seed}: the freeze is not due at week ${state.market.tick} (no industry, or one that originated at or after it; 1359-A :115, :130)`)
  }
  const { facts, refusals, adapterMs } = adapt(state)
  const run = facts === null ? null : runLaw(facts, seed)
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
    // The freeze is the adapter plus the law (§4.2 :116); the F1 first attempt and its inertness rerun are excluded.
    freeze: { adapterMs, lawMs, freezeMs: lawMs === null ? null : adapterMs + lawMs },
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
  probe: '1359-GP', gate: 'G-P (1359-A §9; 1353-A §9)', mode: MODE,
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
