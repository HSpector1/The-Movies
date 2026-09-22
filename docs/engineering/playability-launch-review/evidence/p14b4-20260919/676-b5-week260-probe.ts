// 676-T — the §8 :645 week-260 P14B.5 relationship measurement. AUTHORING ONLY
// until the parent executes it; the parent owns serial runtime and publication.
//
// A STANDALONE vite-node script, not a test: no `vitest` import, no file written,
// no source/fixture/config touched. Run from the repository root with
//   node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/676-b5-week260-probe.ts
// (placement/import/header precedent: `178-first-take-fixture-probe.ts`).
//
// The four campaigns are the recorded standard set (654-T-ledger.md §B), minted
// IN-PROCESS from their seeds through the live engine, and disposable. NO player
// action is taken DURING the 260 ticks. The fixture bootstrap that precedes them
// is not nothing, and is named here exactly: `p13aGeneratedStudio`
// (src/harness/p13a/fixtures.ts:9-12) = `generateWorld(seed)`, then
// `economyEngagedEver: true` set on that world, then ONE `activateStudioOperations`
// action, then `initializeHollywood(..., 'fresh')`. From there each campaign is
// advanced ONE WEEK AT A TIME through the real `tick` (never `advanceTo` in one
// jump) so every intermediate week is observed.
//
// Every tier and every value is read through the module that owns the law
// (`src/core/relationships.ts`): `currentTier` / `currentCloseness` and the
// exported constants. The probe NEVER re-implements the band arithmetic.
//
// No RNG and no wall clock enters a measured quantity; elapsed milliseconds are
// reported separately as environment. Nothing is caught: a throw exits non-zero.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.js'
import {
  RELATIONSHIP_DRIFT_RETURN_WEEKS, RELATIONSHIP_RECENT_CAP, RELATIONSHIP_TIERS, RELATIONSHIP_TIER_FLOOR,
  currentCloseness, currentTier, requireRelationshipsRoot, validateRelationshipsRoot,
} from '../../../../../src/core/relationships.js'
import { makeSave } from '../../../../../src/core/save.js'
import { tick } from '../../../../../src/core/tick.js'
import type { RelationshipEdge, RelationshipTier } from '../../../../../src/core/types.js'

/** The measured horizon: RELATIONSHIP_DRIFT_RETURN_WEEKS, the week record 675 and
 * companion §8 :645 asked to be measured. It does NOT put a whole drift window
 * inside the run. A COMPLETED return needs RELATIONSHIP_DRIFT_GRACE_WEEKS +
 * RELATIONSHIP_DRIFT_RETURN_WEEKS = 312 dormant weeks. The first edge mints at
 * week 8 or 9, so the greatest dormancy reachable by week 260 is about 252, giving
 * span = min(252 - 52, 260) = 200: at most about 77% of one return, never a
 * completed one. Every drift figure this probe reports is therefore PARTIAL drift.
 * Named so a calibration run can lower it; the handed-back file measures 260. */
const WEEK_BOUND = RELATIONSHIP_DRIFT_RETURN_WEEKS
const SEEDS = ['p13a-core-causal-01', 'seed-b', 'p13b-s8-bridge-probe-01', 'p13-public-commercial-adoption'] as const
/** The top of the Strained band, derived from the owner's floors, never typed as 44. */
const STRAINED_CEILING = RELATIONSHIP_TIER_FLOOR.Acquaintances - 1
const NEGATIVE_TIERS: readonly RelationshipTier[] = ['Nemeses', 'Enemies', 'Strained']

const sha = (value: string | Uint8Array) => createHash('sha256').update(value).digest('hex')
const bytes = (value: unknown) => Buffer.byteLength(JSON.stringify(value), 'utf8')
const gzip9 = (value: unknown) => gzipSync(Buffer.from(JSON.stringify(value), 'utf8'), { level: 9 }).length
const sum = (values: readonly number[]) => values.reduce((a, b) => a + b, 0)
const histogram = () => Object.fromEntries(RELATIONSHIP_TIERS.map((t) => [t, 0])) as Record<RelationshipTier, number>
/** The STORED band with drift suppressed: the SAME owner read with the anchor AT
 * the week, so `currentCloseness` is inside the grace window and returns the
 * stored value unchanged. The difference against `currentTier(edge, week)` is
 * exactly the drift contribution. */
const storedTier = (edge: RelationshipEdge, week: number) => currentTier({ closeness: edge.closeness, lastEventWeek: week }, week)
const pair = (edge: RelationshipEdge) => ({ edgeId: edge.edgeId, a: edge.a, b: edge.b })
type Extreme = { closeness: number; week: number; edgeId: string; a: string; b: string }
type FirstRead = { week: number; edgeId: string; a: string; b: string; closeness: number; recent: RelationshipEdge['recent'] }

function measure(seed: string) {
  const started = Date.now()
  let state = p13aGeneratedStudio(seed)
  const startWeek = state.market.tick
  requireRelationshipsRoot(state) // the world must be V31 before a single week runs
  const firstRead = new Map<RelationshipTier, FirstRead>()
  const observedPerEdge = new Map<string, number>()
  const capWeeks: { week: number; edgeId: string; mintedThisWeek: number }[] = []
  const mintKeys = new Set<string>()
  const duplicateMints: { week: number; edgeId: string; kind: string; ref: string }[] = []
  let firstEdgeWeek: number | null = null
  let minEver: Extreme | null = null
  let maxEver: Extreme | null = null

  while (state.market.tick < WEEK_BOUND) {
    state = tick(state)
    const week = state.market.tick
    for (const edge of state.relationships) {
      if (firstEdgeWeek === null) firstEdgeWeek = week
      const closeness = currentCloseness(edge, week)
      const tier = currentTier(edge, week)
      const point: Extreme = { closeness, week, ...pair(edge) }
      if (minEver === null || closeness < minEver.closeness) minEver = point
      if (maxEver === null || closeness > maxEver.closeness) maxEver = point
      if (!firstRead.has(tier)) firstRead.set(tier, { week, ...pair(edge), closeness, recent: edge.recent.map((d) => ({ ...d })) })
      // Independent week-by-week mint count: drivers stamped with THIS week are
      // fresh by construction (nothing stamped W existed at an observation < W),
      // so no earlier-week double count is possible. An edge taking >= the cap
      // inside one week would fold some out before we look — flagged, not hidden.
      const minted = edge.recent.filter((d) => d.week === week)
      if (minted.length > 0) observedPerEdge.set(edge.edgeId, (observedPerEdge.get(edge.edgeId) ?? 0) + minted.length)
      if (minted.length >= RELATIONSHIP_RECENT_CAP) capWeeks.push({ week, edgeId: edge.edgeId, mintedThisWeek: minted.length })
      // The module documents idempotency by (edgeId, kind, ref) but enforces it
      // over `recent` ALONE, which is capped: a re-mint past that window raises
      // the counter AND the observed count together, so the derived/observed
      // identity below is blind to it. This unbounded key set is not.
      for (const d of minted) {
        const key = `${edge.edgeId}|${d.kind}|${d.ref}`
        if (mintKeys.has(key)) duplicateMints.push({ week, edgeId: edge.edgeId, kind: d.kind, ref: d.ref })
        else mintKeys.add(key)
      }
    }
  }

  // The measured world is PROVEN lawful, not assumed.
  requireRelationshipsRoot(state)
  validateRelationshipsRoot(state)
  const edges = state.relationships
  const ids = new Set(edges.map((e) => e.edgeId))
  const orphanObserved = [...observedPerEdge.keys()].filter((id) => !ids.has(id))

  // `repeatedCollaboration` has NO counter: it fires exactly once per shared take
  // from the second onward, so its count is `sharedProductions - 1` (0 at one take).
  const derivedOf = (e: RelationshipEdge) =>
    e.sharedProductions + Math.max(0, e.sharedProductions - 1) + e.sharedSuccesses + e.sharedFailures + e.sharedCancellations
  const perEdge = edges.map((e) => ({ ...pair(e), derived: derivedOf(e), observed: observedPerEdge.get(e.edgeId) ?? 0 }))
  const mismatches = perEdge.filter((row) => row.derived !== row.observed)
  const driversMintedDerived = sum(perEdge.map((row) => row.derived))
  const driversMintedObserved = sum(perEdge.map((row) => row.observed)) + sum(orphanObserved.map((id) => observedPerEdge.get(id)!))
  const driversRetained = sum(edges.map((e) => e.recent.length))

  const tierHistogramAt260 = histogram()
  const bandHistogramAt260Stored = histogram()
  const peakTierHistogram = histogram()
  for (const e of edges) {
    tierHistogramAt260[currentTier(e, WEEK_BOUND)]++
    bandHistogramAt260Stored[storedTier(e, WEEK_BOUND)]++
    peakTierHistogram[e.peakTier]++
  }
  const at260 = edges.map((e) => ({ closeness: currentCloseness(e, WEEK_BOUND), week: WEEK_BOUND, ...pair(e) }))
  const byCloseness = [...at260].sort((x, y) => x.closeness - y.closeness)
  const negativeEverRead = NEGATIVE_TIERS.filter((t) => firstRead.has(t))

  const save = makeSave(state)
  const emptied = { ...save, state: { ...save.state, relationships: [] } }
  const encoded = {
    note: "JSON.stringify utf8 bytes; gzip level 9 is the legacy-v*-fixtures convention. No file written.",
    relationshipsRootBytes: bytes(edges),
    saveBytes: bytes(save), saveRootEmptiedBytes: bytes(emptied), rootMarginalSaveBytes: bytes(save) - bytes(emptied),
    saveGzip9Bytes: gzip9(save), saveRootEmptiedGzip9Bytes: gzip9(emptied), rootMarginalGzip9Bytes: gzip9(save) - gzip9(emptied),
  }

  const result = {
    seed, startWeek, weekBound: WEEK_BOUND, weeksTicked: WEEK_BOUND - startWeek, finalWeek: state.market.tick,
    rootLawful: true, firstEdgeWeek,
    edges: edges.length,
    driversRetained,
    maxRetainedPerEdge: Math.max(0, ...edges.map((e) => e.recent.length)),
    edgesAtRecentCap: edges.filter((e) => e.recent.length === RELATIONSHIP_RECENT_CAP).length,
    recentCap: RELATIONSHIP_RECENT_CAP,
    counters: {
      sharedProductions: sum(edges.map((e) => e.sharedProductions)), sharedSuccesses: sum(edges.map((e) => e.sharedSuccesses)),
      sharedFailures: sum(edges.map((e) => e.sharedFailures)), sharedCancellations: sum(edges.map((e) => e.sharedCancellations)),
      maxSharedProductionsOnOneEdge: Math.max(0, ...edges.map((e) => e.sharedProductions)),
    },
    driversMintedDerived, driversMintedObserved, driversFolded: driversMintedDerived - driversRetained,
    countMismatch: mismatches.length > 0 || orphanObserved.length > 0,
    mismatchedEdges: mismatches, orphanObservedEdgeIds: orphanObserved,
    edgeWeeksAtOrOverCap: capWeeks,
    duplicateDriverMints: duplicateMints, distinctDriverMintKeys: mintKeys.size,
    tierHistogramAt260, bandHistogramAt260Stored, peakTierHistogram,
    everObservedTiers: RELATIONSHIP_TIERS.filter((t) => firstRead.has(t)),
    everObservedFirstReads: Object.fromEntries([...firstRead].map(([tier, row]) => [tier, row])),
    strained: {
      negativeTiersEverRead: negativeEverRead,
      // RULES 1 collapses the Nemeses and Enemies BANDS into a Strained READ (no
      // conflict-record kind exists in B.5), so only 'Strained' is reachable here.
      everRead: negativeEverRead.length > 0,
      firstReads: negativeEverRead.map((t) => ({ tier: t, ...firstRead.get(t)! })),
      minClosenessEverObserved: minEver, strainedCeiling: STRAINED_CEILING,
      distanceAboveStrainedCeiling: minEver === null ? null : minEver.closeness - STRAINED_CEILING,
    },
    closeness: {
      at260Min: byCloseness[0] ?? null, at260Max: byCloseness[byCloseness.length - 1] ?? null,
      everMin: minEver, everMax: maxEver,
      firstEdgeMintedWeek: firstEdgeWeek,
      firstInseparableRead: firstRead.get('Inseparable') ?? null,
      // [edge ordinal (= array index, the edgeId suffix), peakTier, peakTierWeek]
      peakTierFirstWeeks: edges.map((e, i) => [i, e.peakTier, e.peakTierWeek] as const),
    },
    encoded,
    elapsedMs: Date.now() - started,
  }

  const line = (label: string, value: unknown) => console.log(`  ${label.padEnd(24)} ${typeof value === 'string' ? value : JSON.stringify(value)}`)
  const compact = (h: Record<RelationshipTier, number>) => RELATIONSHIP_TIERS.map((t) => `${t}=${String(h[t])}`).join(' ')
  console.log(`\n── ${seed} — weeks ${String(startWeek)}..${String(WEEK_BOUND)}, one tick per week, no player action ──`)
  line('edges@260', result.edges)
  line('driversRetained', `${String(driversRetained)} (max/edge ${String(result.maxRetainedPerEdge)}, at cap ${String(result.edgesAtRecentCap)}/${String(RELATIONSHIP_RECENT_CAP)})`)
  line('counters', result.counters)
  line('driversMinted', `derived ${String(driversMintedDerived)} observed ${String(driversMintedObserved)} folded ${String(result.driversFolded)}`)
  if (result.countMismatch) console.log(`  !! COUNT-MISMATCH ${JSON.stringify({ mismatchedEdges: mismatches, orphanObservedEdgeIds: orphanObserved })}`)
  if (capWeeks.length > 0) console.log(`  !! EDGE-WEEK AT OR OVER RECENT CAP (observed count may undercount) ${JSON.stringify(capWeeks)}`)
  if (duplicateMints.length > 0) console.log(`  !! DUPLICATE-DRIVER-MINT (idempotency by edgeId/kind/ref lost past the recent window) ${JSON.stringify(duplicateMints.slice(0, 40))}`)
  line('distinctMintKeys', `${String(mintKeys.size)} (duplicates ${String(duplicateMints.length)})`)
  line('tiers@260 drifted', compact(tierHistogramAt260))
  line('tiers@260 stored', compact(bandHistogramAt260Stored))
  line('peakTier', compact(peakTierHistogram))
  line('everObservedTiers', result.everObservedTiers)
  line('firstReadWeeks', Object.fromEntries([...firstRead].map(([t, r]) => [t, r.week])))
  line('strainedEverRead', result.strained.everRead)
  line('minClosenessEver', minEver)
  line('closeness@260', { min: result.closeness.at260Min, max: result.closeness.at260Max })
  line('closenessEverMax', maxEver)
  line('firstEdgeWeek', firstEdgeWeek)
  line('encodedBytes', encoded)
  line('elapsedMs', result.elapsedMs)
  return result
}

const startedAll = Date.now()
console.log('PROBE676_SELF', JSON.stringify({
  selfScriptSha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  weekBound: WEEK_BOUND, driftReturnWeeks: RELATIONSHIP_DRIFT_RETURN_WEEKS, recentCap: RELATIONSHIP_RECENT_CAP,
  seeds: SEEDS, nodeVersion: process.version, platform: process.platform, arch: process.arch,
}))
const seeds = SEEDS.map(measure)
console.log(`\ntotalElapsedMs ${String(Date.now() - startedAll)}`)
console.log('JSON ' + JSON.stringify({
  probe: '676-b5-week260-probe.ts',
  selfScriptSha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  weekBound: WEEK_BOUND, recentCap: RELATIONSHIP_RECENT_CAP, rulesConstants: { STRAINED_CEILING },
  environment: { nodeVersion: process.version, platform: process.platform, arch: process.arch },
  seeds, totalElapsedMs: Date.now() - startedAll,
}))
