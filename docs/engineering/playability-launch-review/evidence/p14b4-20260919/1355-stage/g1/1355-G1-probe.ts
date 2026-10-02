// 1355-G1: the P15A.1 Wave 2 measurement gate G1 (1355-A §5, lines 171-208; adopted by 1355-F with 1355-F2 to
// 1355-F6). Open loop and read-only, written to be run later by the parent in the heavy lane.
//
// It ticks each natural seeded route through the public tick API (`p13aGeneratedStudio(seed)`, then `tick` once a
// week, the 1357-P and 1344-P2 harness) on production without P15A.1 Wave 2. After each tick it reads the releases
// the produced state records for that week and applies the Wave 1 law `assessBatch` (`p15a1-market-v1`,
// src/core/sharedMarket.ts:139-211) to them. It computes each factor and never feeds it back (1355-A:178-180).
//
// Inputs, as 1355-A §3.1 item 3, §3.3 and §3.4 item 3 build them:
// - Week W is `state.market.tick` before the tick, the week both release paths stamp (tick.ts:197, :629;
//   hollywoodTick.ts:350, :389).
// - Player releases: `state.studio.releasedFilms` (types.ts:307), one FilmResult per film with `releaseTick` W
//   (tick.ts:629, :648). Studio `hollywood.playerStudioId`; genre from the film's concept in `state.concepts`.
// - Rival releases: `state.hollywood.films` (hollywoodTypes.ts:163) with provenance 'simulation/v1'
//   (hollywoodTypes.ts:37-45), appended at hollywoodTick.ts:392-397 with `genre: inp.concept.genre`, the lookup
//   `inputsFor` uses (hollywoodTick.ts:68-70). Authored-start films (hollywood.ts:263-267) are pre-campaign
//   history and never join a batch.
// - Exposures: the assessed releases of weeks W-25 to W-1 (1355-A:98-100), kept by the law's own reducer
//   `reduceExposures`, exactly as the Wave 1 harness feeds the law (tests/p15a1-shared-market-harness.test.ts:111-118).
// - Gross: the release's recorded `boxOffice.total`. The factor scales the opening and so the total; legs stay
//   untouched (1355-A:80-85; reception.ts:697-703, :750-751).
//
// Two checks run every week. A count check fails the run if any recorded release escapes its week (1355-A §3.4
// item 3). A due-set witness records, without stopping, any week whose recorded releases differ from the batch
// 1355-A §3.1 item 3 would freeze before the week runs (facts 8-9).
//
// Run from the scratch tree (`git archive` of the HEAD under test, node_modules linked), with this file in probe/
// beside tree/, under Node v20.20.2. All three variables are required:
//   PROBE_TREE_HEAD=<sha> PROBE_WEEKS=6240 PROBE_SEEDS=p13a-core-causal-01,seed-b \
//     ./node_modules/.bin/vite-node ../probe/1355-G1-probe.ts > 1355-G1-output.json 2> 1355-G1-progress.txt
// The one import prefix '../tree/' assumes that layout. One JSON document goes to stdout and progress lines to
// stderr. The probe writes nothing to disk, reads no fixture, save or doc, and draws no random number.
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'
import { SHARED_MARKET_DEFINITION, assessBatch, reduceExposures } from '../tree/src/core/sharedMarket.ts'
import type { MarketBatchMember, MarketExposure } from '../tree/src/core/sharedMarket.ts'
import { GENRE_ORDER, TUNING } from '../tree/src/core/tuning.ts'
import { mean, quantile } from '../tree/src/harness/d16/stats.ts'
import type { GameState, Genre } from '../tree/src/core/types.ts'

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() ?? ''
  if (value === '') throw new Error(`1355-G1: ${name} is required; the header shows the run command`)
  return value
}
const TREE_HEAD = requiredEnv('PROBE_TREE_HEAD')
if (!/^[0-9a-f]{7,40}$/.test(TREE_HEAD)) throw new Error(`1355-G1: PROBE_TREE_HEAD must be a commit sha (got ${TREE_HEAD})`)
const WEEKS = Number(requiredEnv('PROBE_WEEKS'))
if (!Number.isSafeInteger(WEEKS) || WEEKS < 1) throw new Error(`1355-G1: PROBE_WEEKS must be a positive integer (got ${process.env.PROBE_WEEKS})`)
// Every seed's route is `p13aGeneratedStudio(seed)` then `tick`, as 1357-P ran it (1357-P:106; 1357-X:26-27).
// 1355-A:173 names seed-b's route `rivalFixture` (1329-A:9-16), but that helper ticks `p13aGeneratedStudio()` on the
// default seed (tests/helpers/p14b2-fixtures.ts:249-265), so its route is p13a-core-causal-01's. seed-b here is
// `p13aGeneratedStudio('seed-b')`, the suite's seed-b (tests/p14b4-rival-seating-preference.test.ts:248-251, :459).
const SEEDS = requiredEnv('PROBE_SEEDS').split(',').map(s => s.trim()).filter(s => s !== '')
if (SEEDS.length === 0) throw new Error('1355-G1: PROBE_SEEDS names no seed')

// 1355-A:173-175: read-outs at 520, 1560, 3120, 4680 and 6240. A shorter smoke run reads out at its last week.
const READOUTS = [...new Set([520, 1560, 3120, 4680, 6240, WEEKS])].filter(week => week <= WEEKS).sort((a, b) => a - b)

// The four 1355-A §5 rows G1 can fill (1355-A:189-192); the other rows belong to G2. Proceed at or above the first
// floor, Flag at or above the second, Retune below it, on raw float64 values. The f <= 0.95 row is a share whose
// Retune cell reads "none", and no share falls below 0.
const BANDS = {
  medianFactor: [0.95, 0.9],
  p10Factor: [0.85, 0.8],
  lowestGenreMeanFactor: [0.9, 0.85],
  releasesWithFAtMost095: [0.1, 0],
} as const
function band(row: keyof typeof BANDS, value: number | null): string {
  if (value === null) return 'noReleases'
  const [proceed, flag] = BANDS[row]
  return value >= proceed ? 'Proceed' : value >= flag ? 'Flag' : 'Retune'
}

// Quantiles use the repo's one lab definition, type 7 (src/harness/d16/stats.ts:8-19). Deciles run p0 (the minimum)
// to p100 (the maximum).
const DECILES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

type Release = {
  week: number
  releaseId: string
  studioId: string
  genre: Genre
  gross: number
  factor: number
  pressure: number
  windowTerm: number
  stockTerm: number
}
const COLUMNS = ['week', 'releaseId', 'studioId', 'genre', 'gross', 'factor', 'pressure', 'windowTerm', 'stockTerm'] as const

// 1355-A §3.1 item 1: the batch runs only with an industry, which `p13aGeneratedStudio` founds at week 0.
function industry(state: GameState, seed: string) {
  if (state.hollywood === null) throw new Error(`1355-G1: ${seed} has no industry at week ${state.market.tick}`)
  return state.hollywood
}

function group(rows: readonly Release[]) {
  if (rows.length === 0) return { releases: 0 }
  const factors = rows.map(r => r.factor)
  return {
    releases: rows.length,
    firstWeek: rows[0].week,
    lastWeek: rows[rows.length - 1].week,
    meanFactor: mean(factors),
    deciles: Object.fromEntries(DECILES.map(p => [`p${p}`, quantile(factors, p / 100)])),
  }
}

function share(rows: readonly Release[], keep: (factor: number) => boolean) {
  const releases = rows.filter(r => keep(r.factor)).length
  return { releases, share: rows.length === 0 ? null : releases / rows.length }
}

// Every G1 statistic (1355-A:179-180) over the releases of weeks [from, to).
function stats(rows: readonly Release[], from: number, to: number) {
  const factors = rows.map(r => r.factor)
  const total = (pick: (r: Release) => number) => rows.reduce((sum, r) => sum + pick(r), 0)
  const genreMeans = GENRE_ORDER.flatMap(genre => {
    const f = rows.filter(r => r.genre === genre).map(r => r.factor)
    return f.length === 0 ? [] : [{ genre, releases: f.length, meanFactor: mean(f) }]
  })
  const lowest = genreMeans.length === 0 ? null : genreMeans.reduce((low, g) => (g.meanFactor < low.meanFactor ? g : low))
  const median = rows.length === 0 ? null : quantile(factors, 0.5)
  const p10 = rows.length === 0 ? null : quantile(factors, 0.1)
  const atMost095 = share(rows, f => f <= 0.95)
  const pressure = total(r => r.pressure)
  const windowTerm = total(r => r.windowTerm)
  const stockTerm = total(r => r.stockTerm)
  const gross = total(r => r.gross)
  const grossLoss = total(r => r.gross * (1 - r.factor))
  return {
    fromWeek: from,
    toWeekExclusive: to,
    releases: rows.length,
    table: {
      medianFactor: { value: median, band: band('medianFactor', median) },
      p10Factor: { value: p10, band: band('p10Factor', p10) },
      lowestGenreMeanFactor: lowest === null
        ? { value: null, genre: null, releases: 0, band: band('lowestGenreMeanFactor', null) }
        : { value: lowest.meanFactor, genre: lowest.genre, releases: lowest.releases, band: band('lowestGenreMeanFactor', lowest.meanFactor) },
      releasesWithFAtMost095: { value: atMost095.share, releases: atMost095.releases, band: band('releasesWithFAtMost095', atMost095.share) },
    },
    factorBelow1: share(rows, f => f < 1),
    factorAtMost095: atMost095,
    factorAtMost090: share(rows, f => f <= 0.9),
    factorAtMost085: share(rows, f => f <= 0.85),
    // pressure = windowTerm + stockTerm for each release (sharedMarket.ts:232-234); the shares are of the scope's sum.
    pressure: {
      total: pressure,
      window: windowTerm,
      stock: stockTerm,
      windowShare: pressure > 0 ? windowTerm / pressure : null,
      stockShare: pressure > 0 ? stockTerm / pressure : null,
    },
    // Σ gross · (1 − f) / Σ gross (1355-A:180): the share of recorded gross the factors remove before any feedback.
    gross: { total: gross, firstOrderLoss: grossLoss, firstOrderGrossChange: gross > 0 ? grossLoss / gross : null },
    all: group(rows),
    byGenre: Object.fromEntries(GENRE_ORDER.map(genre => [genre, group(rows.filter(r => r.genre === genre))])),
    byStudio: Object.fromEntries([...new Set(rows.map(r => r.studioId))].sort().map(id => [id, group(rows.filter(r => r.studioId === id))])),
  }
}

function runSeed(seed: string) {
  const started = Date.now()
  let state = p13aGeneratedStudio(seed)
  // G1 precedes recorded RED on unchanged production (1355-A:178). A tree with the Wave 2 root applies the factor
  // itself, so its route would not be open loop.
  if ('sharedMarket' in state) throw new Error('1355-G1: the tree under test carries a sharedMarket root; G1 needs production without P15A.1 Wave 2')
  const startWeek = state.market.tick
  const releases: Release[] = []
  const mismatches: { week: number; due: string[]; recorded: string[] }[] = []
  let exposures: MarketExposure[] = []
  while (state.market.tick < WEEKS) {
    const W = state.market.tick
    // 1355-A §3.1 item 3 freezes week W's batch before any verdict: the player's committed pictures (fact 9;
    // tick.ts:206-208) and every rival picture at remainingTicks 1 (fact 8; 1355-F Amendment 1). Read here from the
    // state the tick receives. Production's witness throws on a difference (1355-A §3.1 item 5); this probe records it.
    const due = [
      ...state.releaseAuthority.commitments.map(row => row.productionId),
      ...industry(state, seed).businesses.flatMap(b => b.productions.filter(p => p.remainingTicks === 1).map(p => p.id)),
    ].sort()
    state = tick(state)
    const h = industry(state, seed)
    const members: MarketBatchMember[] = []
    const gross = new Map<string, number>()
    for (const film of state.studio.releasedFilms) {
      if (film.releaseTick !== W) continue
      const genre = state.concepts.find(c => c.id === film.conceptId)?.genre
      if (genre === undefined) throw new Error(`1355-G1: ${seed} week ${W}: player release ${film.productionId} has no concept ${film.conceptId}`)
      members.push({ releaseId: film.productionId, studioId: h.playerStudioId, genre })
      gross.set(film.productionId, film.boxOffice.total)
    }
    for (const film of h.films) {
      if (film.provenance !== 'simulation/v1' || film.result.releaseTick !== W) continue
      members.push({ releaseId: film.filmId, studioId: film.studioId, genre: film.genre })
      gross.set(film.filmId, film.result.boxOffice.total)
    }
    const batch = { week: W, members }
    // The Wave 1 harness pattern: assess a week that has releases, reduce every week.
    if (members.length > 0) {
      for (const a of assessBatch(exposures, batch)) {
        const g = gross.get(a.releaseId)
        if (g === undefined) throw new Error(`1355-G1: ${seed} week ${W}: the law assessed ${a.releaseId}, which no recorded release carries`)
        releases.push({ week: W, releaseId: a.releaseId, studioId: a.studioId, genre: a.genre, gross: g,
          factor: a.factor, pressure: a.pressure, windowTerm: a.windowTerm, stockTerm: a.stockTerm })
      }
    }
    exposures = reduceExposures(exposures, batch).exposures
    // 1355-A §3.4 item 3: every simulated release has exactly one assessment. The route records none before week 0,
    // so the two counts agree after every tick unless a release escaped its week.
    const recorded = state.studio.releasedFilms.length + h.films.filter(f => f.provenance === 'simulation/v1').length
    if (recorded !== releases.length) throw new Error(`1355-G1: ${seed} week ${W}: the state records ${recorded} releases and the probe assessed ${releases.length}`)
    const recordedIds = members.map(m => m.releaseId).sort()
    if (JSON.stringify(recordedIds) !== JSON.stringify(due)) {
      if (mismatches.length === 0) console.error(`[1355-G1] ${seed}: WARNING week ${W}: recorded releases ${JSON.stringify(recordedIds)} differ from the due set ${JSON.stringify(due)}`)
      mismatches.push({ week: W, due, recorded: recordedIds })
    }
    if (state.market.tick % 520 === 0) console.error(`[1355-G1] ${seed}: week ${state.market.tick}/${WEEKS}, ${releases.length} releases, ${Math.round((Date.now() - started) / 1000)} s`)
  }
  const elapsedMs = Date.now() - started
  const industryAtEnd = industry(state, seed)
  console.error(`[1355-G1] ${seed}: done, ${releases.length} releases, ${mismatches.length} due-set mismatch weeks, ${Math.round(elapsedMs / 1000)} s`)
  return {
    summary: {
      seed,
      route: `p13aGeneratedStudio('${seed}'), then tick once per week`,
      startWeek,
      finalWeek: state.market.tick,
      elapsedMs,
      msPerTick: elapsedMs / (state.market.tick - startWeek),
      playerStudioId: industryAtEnd.playerStudioId,
      releases: releases.length,
      dueSetWitness: { weeks: state.market.tick - startWeek, mismatchWeeks: mismatches.length, firstMismatches: mismatches.slice(0, 20) },
      studios: industryAtEnd.identities.map(s => ({ studioId: s.studioId, role: s.role, enteredWeek: s.enteredWeek,
        releases: releases.filter(r => r.studioId === s.studioId).length })),
      // `cumulative` covers the route up to the read-out week; `window` covers the weeks since the previous read-out,
      // so a thin sample shows (rivals go broke on p13a seeds, 1357-X:99-106). Nothing is filtered out.
      readouts: READOUTS.map((week, i) => {
        const from = i === 0 ? startWeek : READOUTS[i - 1]
        return {
          week,
          cumulative: stats(releases.filter(r => r.week < week), startWeek, week),
          window: stats(releases.filter(r => r.week >= from && r.week < week), from, week),
        }
      }),
    },
    rows: releases.map(r => COLUMNS.map(column => r[column])),
  }
}

console.error(`[1355-G1] tree ${TREE_HEAD}, ${WEEKS} weeks, seeds ${SEEDS.join(', ')}, law ${SHARED_MARKET_DEFINITION}`)
const runs = SEEDS.map(runSeed)
console.log(JSON.stringify({
  probe: '1355-G1',
  gate: '1355-A §5 G1 (1355-A:178-180): open loop, no production change, before recorded RED',
  treeHead: TREE_HEAD,
  weeks: WEEKS,
  readouts: READOUTS,
  law: SHARED_MARKET_DEFINITION,
  tuning: Object.fromEntries(Object.entries(TUNING).filter(([key]) => key.startsWith('SHARED_MARKET_'))),
  quantile: 'type 7, linear between order statistics (src/harness/d16/stats.ts:8-19)',
  bandRule: 'Proceed if value >= the first floor, Flag if value >= the second, else Retune; noReleases for an empty scope',
  bands: BANDS,
  seeds: runs.map(run => run.summary),
  releaseColumns: COLUMNS,
  releaseRows: Object.fromEntries(runs.map(run => [run.summary.seed, run.rows])),
}, null, 2))
