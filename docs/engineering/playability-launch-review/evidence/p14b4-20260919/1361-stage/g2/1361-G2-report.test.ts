// 1361-G2 report: reads the runs of 1361-G2-probe.test.ts and bands each G2 row of 1355-A §5 (:181-197) and K1-K5
// (:161-169), per seed and read-out, candidate against control. It ticks nothing. Copy it to tests/ in a G2 tree and
// run it with PROBE_EXPECT=report (1361-G2-notes.md, "Run"). Nobody has run this file.
//
// The ratio bands compare raw float64 values without rounding (G1's rule, 1355-G1-notes.md item 9); the two increase
// rows compare integer counts (1361-G2-F ruling 1.3). The gate reads the cumulative scope at each read-out; window
// scopes are reported and banded but gate nothing (1361-F2 ruling 4.2). A K row that fails reads Defect, never Retune:
// "any failure is a defect, not tuning" (1355-A:197; 1361-F2 ruling 4.4). Each verdict prints its route.
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { it } from 'vitest'
import { GENRE_ORDER } from '../src/core/tuning.js'
import type { Genre } from '../src/core/types.js'
import { mean, quantile } from '../src/harness/d16/stats.js'
import type { AssessmentRow, Interval, ProbeRun, SeedRun } from './1361-G2-probe.test.js'

const STREAK_WEEKS = 52 // 1355-A:194, "a new streak ≥ 52 weeks"
const CONTROL_SAVE = 44 // e4be3e5c's LIVE_SAVE_VERSION (save.ts:6567), the save K3 migrates (1361-R:808)
const CANDIDATE_SAVE = 45 // the shared step (1360-F ruling 1; 1361-F ruling 3)
const REPORT_SHA256 = createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex')
type Band = 'Proceed' | 'Flag' | 'Retune' | 'Defect' | 'noReleases' | 'notRun'
type Loaded = { dir: string; run: ProbeRun }
type Scope = { from: number; to: number; windows: number[] }
type Leaf = { file: string; title: string; status: string; message: string }
type Verdict = { band: Band; evidence: string }

function required(name: string): string {
  const value = process.env[name]?.trim() ?? ''
  if (value === '') throw new Error(`1361-G2 report: ${name} is required (1361-G2-notes.md, "Run")`)
  return value
}
const optional = (name: string): string | null => (process.env[name]?.trim() ?? '') || null

function load(dir: string, mode: ProbeRun['mode']): Loaded {
  const errorFile = join(dir, 'error.txt')
  const failed = existsSync(errorFile) ? `; the run failed: ${readFileSync(errorFile, 'utf8').split('\n')[0]}` : ''
  if (!existsSync(join(dir, 'g2-run.json'))) throw new Error(`1361-G2 report: ${dir} holds no g2-run.json${failed}`)
  const run = JSON.parse(readFileSync(join(dir, 'g2-run.json'), 'utf8')) as ProbeRun
  if (run.probe !== '1361-G2' || run.mode !== mode || !run.complete) {
    throw new Error(`1361-G2 report: ${dir} holds no complete ${mode} run (mode ${run.mode}, complete ${run.complete})${failed}`)
  }
  return { dir, run }
}

// ── digests ──────────────────────────────────────────────────────────────────────────────────────────────────
function digestLines(path: string): Map<number, string> {
  const lines = new Map<number, string>()
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line === '') continue
    const row = JSON.parse(line) as { w: number; k: Record<string, string> }
    if (lines.has(row.w)) throw new Error(`1361-G2 report: ${path} holds week ${row.w} twice`)
    lines.set(row.w, JSON.stringify(row.k))
  }
  return lines
}
function differingKeys(a: string | undefined, b: string | undefined): string[] {
  if (a === undefined || b === undefined) return [a === undefined ? '(no line in the first file)' : '(no line in the second file)']
  const x = JSON.parse(a) as Record<string, string>
  const y = JSON.parse(b) as Record<string, string>
  return [...new Set([...Object.keys(x), ...Object.keys(y)])].filter((key) => x[key] !== y[key]).sort()
}
/** The weeks in [from, to] whose digest lines differ, the first ten with the top-level keys that differ. */
function compareLines(a: Map<number, string>, b: Map<number, string>, from: number, to: number) {
  let differing = 0
  const first: { week: number; keys: string[] }[] = []
  for (let week = from; week <= to; week++) {
    const x = a.get(week)
    const y = b.get(week)
    if (x !== undefined && x === y) continue
    differing++
    if (first.length < 10) first.push({ week, keys: differingKeys(x, y) })
  }
  return { weeks: to - from + 1, differing, first }
}

// ── one side's rows in one scope ─────────────────────────────────────────────────────────────────────────────
const clip = (list: readonly Interval[], s: Scope): Interval[] => list.flatMap(([a, b]): Interval[] => {
  const from = Math.max(a, s.from)
  const to = Math.min(b, s.to)
  return to > from ? [[from, to]] : []
})
const span = (list: readonly Interval[]): number => list.reduce((n, [a, b]) => n + b - a, 0)
const longest = (list: readonly Interval[]): number => list.reduce((m, [a, b]) => Math.max(m, b - a), 0)
const overlaps = (x: Interval, y: Interval): boolean => x[0] < y[1] && y[0] < x[1]
/** The weeks in [from, to) without an event, as maximal intervals; events ascend (the probe appends them by week). */
function gaps(events: readonly number[], from: number, to: number): Interval[] {
  const out: Interval[] = []
  let start = from
  for (const week of events) {
    if (week < from || week >= to) continue
    if (week > start) out.push([start, week])
    start = week + 1
  }
  if (to > start) out.push([start, to])
  return out
}

type RivalSide = {
  stallWeeks: number; longestStall: number; stallStreaks: Interval[]; belowReserveWeeks: number; belowZeroWeeks: number
  greenlights: number; shelvings: number; longestNoGreenlight: number; lastFilmingWeek: number | null; decide: Record<string, number>
}
function side(seed: SeedRun, s: Scope) {
  const within = (week: number): boolean => week >= s.from && week < s.to
  const rivals: Record<string, RivalSide> = {}
  for (const [id, t] of Object.entries(seed.rivals)) {
    const stall = clip(t.stall, s)
    const decide: Record<string, number> = {}
    for (const i of s.windows) for (const [key, n] of Object.entries(t.decide[i] ?? {})) decide[key] = (decide[key] ?? 0) + n
    const takes = t.firstTakes.filter(within)
    const from = Math.max(t.firstWeek, s.from)
    rivals[id] = {
      stallWeeks: span(stall), longestStall: longest(stall), stallStreaks: stall.filter(([a, b]) => b - a >= STREAK_WEEKS),
      belowReserveWeeks: span(clip(t.belowReserve, s)), belowZeroWeeks: span(clip(t.belowZero, s)),
      greenlights: t.greenlights.filter(within).length, shelvings: t.shelvings.filter(within).length,
      longestNoGreenlight: from < s.to ? longest(gaps(t.greenlights, from, s.to)) : 0,
      lastFilmingWeek: takes.length === 0 ? null : takes[takes.length - 1]!, decide,
    }
  }
  const sum = (pick: (r: RivalSide) => number): number => Object.values(rivals).reduce((n, r) => n + pick(r), 0)
  const releases = seed.releases.filter(([week]) => within(week))
  const gross: Record<string, number> = {}
  for (const [, , studioId, , g] of releases) gross[studioId] = (gross[studioId] ?? 0) + g
  const decide: Record<string, number> = {}
  for (const r of Object.values(rivals)) for (const [key, n] of Object.entries(r.decide)) decide[key] = (decide[key] ?? 0) + n
  const ms = seed.tickMs.slice(s.from - seed.startWeek, s.to - seed.startWeek)
  return {
    rivals, releases: releases.length, gross, industryGross: releases.reduce((n, r) => n + r[4], 0),
    stallWeeks: sum((r) => r.stallWeeks), belowReserveWeeks: sum((r) => r.belowReserveWeeks), belowZeroWeeks: sum((r) => r.belowZeroWeeks),
    greenlights: sum((r) => r.greenlights), shelvings: sum((r) => r.shelvings), decide,
    tickMs: ms.length === 0 ? null : { median: quantile(ms, 0.5), p95: quantile(ms, 0.95) },
  }
}

/** The candidate root's factor rows (1355-A:189-192): G1's estimators (1355-G1-notes.md items 5-6). */
function factors(rows: readonly AssessmentRow[], s: Scope) {
  const scoped = rows.filter(([week]) => week >= s.from && week < s.to)
  const f = scoped.map((row) => row[4])
  if (f.length === 0) return { releases: 0, median: null, p10: null, lowestGenre: null, atMost095: null, atMost095Releases: 0 }
  const genres = GENRE_ORDER.flatMap((genre: Genre) => {
    const g = scoped.filter((row) => row[3] === genre).map((row) => row[4])
    return g.length === 0 ? [] : [{ genre, releases: g.length, meanFactor: mean(g) }]
  })
  const lowestGenre = genres.reduce((low, g) => (g.meanFactor < low.meanFactor ? g : low))
  const atMost095Releases = f.filter((x) => x <= 0.95).length
  return { releases: f.length, median: quantile(f, 0.5), p10: quantile(f, 0.1), lowestGenre, atMost095: atMost095Releases / f.length, atMost095Releases }
}

const floors = (value: number | null, proceed: number, flag: number): Band =>
  value === null ? 'noReleases' : value >= proceed ? 'Proceed' : value >= flag ? 'Flag' : 'Retune'
/** candidate / control − 1 for printing, or null for an increase from zero. The bands compare integers (compare()). */
const increaseOf = (candidate: number, control: number): number | null => (control === 0 ? (candidate === 0 ? 0 : null) : candidate / control - 1)

// ── the §5 rows for one seed, one scope ──────────────────────────────────────────────────────────────────────
function compare(cand: SeedRun, ctrl: SeedRun, s: Scope, week: number) {
  if (cand.assessments === null) throw new Error(`1361-G2 report: the candidate run of ${cand.seed} holds no assessments`)
  const c = side(cand, s)
  const k = side(ctrl, s)
  const f = factors(cand.assessments, s)
  const cr = cand.readouts.find((r) => r.week === week)
  const kr = ctrl.readouts.find((r) => r.week === week)
  if (cr === undefined || kr === undefined) throw new Error(`1361-G2 report: ${cand.seed} has no read-out at week ${week}`)

  const grossRatio = k.industryGross === 0 ? null : c.industryGross / k.industryGross
  // Stall (1355-A:194). A new streak is a candidate stall streak of at least 52 weeks within the scope that overlaps no
  // stall streak of that length the same rival has in control over the WHOLE run, so a read-out that cuts the control's
  // streak short cannot create one (1361-G2-F ruling 1.2). "Stops for good" is read two ways: literally, the
  // candidate's last filming week over the whole run falls before a week the rival films in control; and by a year, at
  // least 52 weeks before it. The band uses the year reading; the literal list is printed (1361-F2 ruling 4.1).
  const stallIncrease = increaseOf(c.stallWeeks, k.stallWeeks)
  const controlStreaks = (studioId: string): Interval[] => (ctrl.rivals[studioId]?.stall ?? []).filter(([a, b]) => b - a >= STREAK_WEEKS)
  const newStreaks = Object.entries(c.rivals).flatMap(([studioId, r]) => r.stallStreaks
    .filter((x) => !controlStreaks(studioId).some((y) => overlaps(x, y))).map(([from, to]) => ({ studioId, from, to })))
  const lastEver = (studioId: string): number | null => {
    const takes = cand.rivals[studioId]?.firstTakes ?? []
    return takes.length === 0 ? null : takes[takes.length - 1]!
  }
  const stopsLiteral = Object.entries(k.rivals)
    .flatMap(([studioId, r]) => (r.lastFilmingWeek === null ? [] : [{ studioId, controlFilmsAt: r.lastFilmingWeek, candidateLast: lastEver(studioId) }]))
    .filter((row) => row.candidateLast === null || row.candidateLast < row.controlFilmsAt)
  const stoppedForGood = stopsLiteral.filter((row) => row.candidateLast === null || row.controlFilmsAt - row.candidateLast >= STREAK_WEEKS)
  // The increase rows compare integer counts, so +10% and +25% land on their own side of each edge (1361-G2-F ruling
  // 1.3). A zero control against a positive candidate reads Retune, since 10·c > 11·0 and 4·c > 5·0 (1361-F2 ruling 4.3).
  const stallBand: Band = 10 * c.stallWeeks > 11 * k.stallWeeks || newStreaks.length > 0 || stoppedForGood.length > 0
    ? 'Retune' : c.stallWeeks > k.stallWeeks ? 'Flag' : 'Proceed'
  const zeroIncrease = increaseOf(c.belowZeroWeeks, k.belowZeroWeeks) // 1355-A:195; printed only
  const zeroBand: Band = 4 * c.belowZeroWeeks > 5 * k.belowZeroWeeks ? 'Retune'
    : 10 * c.belowZeroWeeks > 11 * k.belowZeroWeeks ? 'Flag' : 'Proceed'
  const share = cr.rootBytes === null ? null : cr.rootBytes / cr.saveBytes // 1355-A:196
  const shareBand: Band = share === null ? 'notRun' : share <= 0.02 ? 'Proceed' : 'Retune'
  const atMostBand: Band = f.atMost095 === null ? 'noReleases' : f.atMost095 >= 0.1 ? 'Proceed' : 'Flag' // 1355-A:192

  const studios = [...new Set([...cand.studios.map((x) => x.studioId), ...Object.keys(c.gross), ...Object.keys(k.gross)])].sort()
  const rivalIds = [...new Set([...Object.keys(c.rivals), ...Object.keys(k.rivals)])].sort()
  return {
    gated: {
      medianFactor: { value: f.median, releases: f.releases, band: floors(f.median, 0.95, 0.9) },
      p10Factor: { value: f.p10, band: floors(f.p10, 0.85, 0.8) },
      lowestGenreMeanFactor: { value: f.lowestGenre?.meanFactor ?? null, genre: f.lowestGenre?.genre ?? null, releases: f.lowestGenre?.releases ?? 0,
        band: floors(f.lowestGenre?.meanFactor ?? null, 0.9, 0.85) },
      releasesWithFAtMost095: { value: f.atMost095, releases: f.atMost095Releases, band: atMostBand },
      industryGross: { candidate: c.industryGross, control: k.industryGross, ratio: grossRatio, band: floors(grossRatio, 0.95, 0.9) },
      rivalStallWeeks: { candidate: c.stallWeeks, control: k.stallWeeks, increase: stallIncrease, newStreaks, stoppedForGood, stopsLiteral, band: stallBand },
      rivalWeeksBelowZero: { candidate: c.belowZeroWeeks, control: k.belowZeroWeeks, increase: zeroIncrease, band: zeroBand },
      rootShare: { rootBytes: cr.rootBytes, saveBytes: cr.saveBytes, share, band: shareBand },
    },
    reportOnly: {
      releases: { candidate: c.releases, control: k.releases },
      grossByStudio: studios.map((studioId) => {
        const candidate = c.gross[studioId] ?? 0
        const control = k.gross[studioId] ?? 0
        return { studioId, candidate, control, ratio: control === 0 ? null : candidate / control }
      }),
      rivalWeeksBelowReserve: { candidate: c.belowReserveWeeks, control: k.belowReserveWeeks },
      player: { candidate: { cash: cr.playerCash, standing: cr.playerStanding }, control: { cash: kr.playerCash, standing: kr.playerStanding } },
      greenlights: { candidate: c.greenlights, control: k.greenlights },
      shelvings: { candidate: c.shelvings, control: k.shelvings },
      decide: { candidate: c.decide, control: k.decide }, // retries are the retry:* keys
      saveBytes: { candidate: cr.saveBytes, control: kr.saveBytes, candidateRootRows: cr.rootRows },
      tickMs: { candidate: c.tickMs, control: k.tickMs },
      rivals: rivalIds.map((studioId) => ({ studioId, candidate: c.rivals[studioId] ?? null, control: k.rivals[studioId] ?? null })),
    },
  }
}

// ── K1-K5 ────────────────────────────────────────────────────────────────────────────────────────────────────
type VitestJson = { testResults: { name: string; assertionResults: { title: string; status: string; failureMessages?: string[] }[] }[] }
function leaves(path: string, match: (title: string) => boolean): Leaf[] {
  const json = JSON.parse(readFileSync(path, 'utf8')) as VitestJson
  return json.testResults.flatMap((file) => file.assertionResults.filter((leaf) => match(leaf.title)).map((leaf) => ({
    file: file.name, title: leaf.title, status: leaf.status, message: (leaf.failureMessages ?? []).join('\n').slice(0, 600) })))
}

/** K1 and K2: the RED's pin leaves on the frozen candidate (1355-A:165-166; pins minted at 601ea709). */
function pinControl(path: string | null, tag: 'K1' | 'K2'): Verdict & { leaves: Leaf[] } {
  if (path === null) return { band: 'notRun', evidence: 'PROBE_RED_JSON was not supplied', leaves: [] }
  if (!existsSync(path)) return { band: 'notRun', evidence: `PROBE_RED_JSON ${path} is missing`, leaves: [] }
  const found = leaves(path, (title) => title.includes(`(${tag})`))
  if (found.length !== 2) return { band: 'notRun', evidence: `${path} holds ${found.length} leaves titled (${tag}); the 1355 RED has two`, leaves: found }
  const failed = found.filter((leaf) => leaf.status !== 'passed')
  return failed.length === 0
    ? { band: 'Proceed', evidence: `both (${tag}) leaves passed in ${path}`, leaves: found }
    : { band: 'Defect', evidence: `defect: ${failed.map((leaf) => `${leaf.status}: ${leaf.title}`).join('; ')}`, leaves: found }
}

/** RED_JSON must come from the frozen (c): the first line of run-1361-X.sh's run.meta beside it reads
 * "start at <tag> <short sha>, node …", and the short sha must prefix the candidate's tree head (1361-G2-F ruling 1.4). */
function redProvenance(redJson: string, treeHead: string): { tag: string; sha: string } {
  const meta = join(dirname(redJson), 'run.meta')
  const first = existsSync(meta) ? readFileSync(meta, 'utf8').split('\n')[0]! : ''
  const match = /^start at (\S+) ([0-9a-f]{7,40}),/.exec(first)
  if (match === null || !treeHead.startsWith(match[2]!)) {
    throw new Error(`1361-G2 report: ${meta} ${first === '' ? 'is missing or empty' : `starts "${first}"`}, which names no prefix of ` +
      `the candidate's tree head ${treeHead}; PROBE_RED_JSON must come from the frozen (c) (1361-G2-F ruling 1.4)`)
  }
  return { tag: match[1]!, sha: match[2]! }
}

function judgeK3(cand: Loaded, controlLines: Map<string, Map<number, string>>) {
  const seeds = cand.run.seeds.map((seed) => {
    const k3 = seed.k3
    if (k3 === null) return { seed: seed.seed, band: 'notRun' as Band, evidence: 'no K3 result', exercised: false }
    if (k3.error !== null) return { seed: seed.seed, band: 'Defect' as Band, evidence: `defect or setup: ${k3.error.split('\n')[0]}`, exercised: false, k3 }
    const lines = digestLines(join(cand.dir, `k3-digests-${seed.seed}.jsonl`))
    const control = controlLines.get(seed.seed)!
    const equalUntil = compareLines(lines, control, k3.migratedWeek, k3.pressuredWeek ?? cand.run.weeks)
    const emptyRoot = k3.rootAtMigration.version === 1 && k3.rootAtMigration.recordedFromWeek === k3.migratedWeek && k3.rootAtMigration.assessments === 0
    const exercised = k3.pressuredWeek !== null
    const after = (k3.pressuredWeek ?? 0) + 1
    const differsThere = exercised && lines.get(after) !== undefined && lines.get(after) !== control.get(after)
    const forcedEqual = exercised && k3.forcedDigests !== null && JSON.stringify(k3.forcedDigests) === control.get(after)
    const failures = [
      ...(emptyRoot ? [] : [`the migrated root is not empty at week ${k3.migratedWeek}: ${JSON.stringify(k3.rootAtMigration)}`]),
      ...(k3.savedVersion === CONTROL_SAVE && k3.liveVersion === CANDIDATE_SAVE ? []
        : [`K3 migrated Save${k3.savedVersion} to Save${k3.liveVersion}, not Save${CONTROL_SAVE} to Save${CANDIDATE_SAVE}`]),
      ...(equalUntil.differing === 0 ? [] : [`${equalUntil.differing} weeks differ from the control before any factor below 1; first ${JSON.stringify(equalUntil.first[0])}`]),
      ...(!exercised || differsThere ? [] : [`the state at week ${after} equals the control's although ${k3.pressured.length} releases took a factor below 1`]),
      ...(!exercised || forcedEqual ? [] : [`with every factor held at 1, week ${after} still differs from the control in ${differingKeys(JSON.stringify(k3.forcedDigests), control.get(after)).join(', ')}`]),
      ...(!exercised || k3.forcedSeamCalls > 0 ? [] : ['the factor-1 spy saw no factored resolveReception call (1355-F4 seam)']),
      ...(!exercised || k3.outsideCount === 0 ? [] : [`${k3.outsideCount} differing paths lie outside the pressured films' chain, first ${k3.outsidePaths.slice(0, 3).join(', ')}`]),
      ...(!exercised || k3.diffPaths > 0 ? [] : ['the pressured week differs from its factor-1 twin in no path']),
    ]
    const band: Band = failures.length > 0 ? 'Defect' : 'Proceed'
    const evidence = failures.length > 0 ? `defect: ${failures.join('; ')}`
      : exercised ? `Save${k3.savedVersion} at week ${k3.migratedWeek} equals the control through week ${k3.pressuredWeek}; week ${after} differs only in the chain of ${k3.pressured.map(([id]) => id).join(', ')}`
      : `Save${k3.savedVersion} at week ${k3.migratedWeek} equals the control to week ${cand.run.weeks}; no factor fell below 1, so "first differs there" was not exercised`
    return { seed: seed.seed, band, evidence, exercised, equalUntil, k3 }
  })
  const band: Band = seeds.some((s) => s.band === 'Defect') ? 'Defect' : seeds.some((s) => s.band === 'notRun') ? 'notRun'
    : seeds.some((s) => s.exercised) ? 'Proceed' : 'notRun'
  return { band, evidence: band === 'notRun' && seeds.every((s) => s.band === 'Proceed') ? 'no seed reached a factor below 1 after the migration' : seeds.map((s) => `${s.seed}: ${s.evidence}`).join(' | '), seeds }
}

/** K4 (1355-A:168): the edited tree's digests equal the control's every week, every factor is 1, and the era-guard
 * leaf fails in that tree on the penalty while it passes on the unedited candidate in RED_JSON (1361-G2-F ruling 2). */
type K4Input = { dir: string | null; loaded: Loaded | null; failure: string | null }
function judgeK4(k4: K4Input, controlLines: Map<string, Map<number, string>>, eraPath: string | null, redPath: string | null) {
  const eraLeaves = (path: string | null): Leaf[] | null =>
    path === null || !existsSync(path) ? null : leaves(path, (title) => title.startsWith('market-definition-era-guard'))
  const era = eraLeaves(eraPath)
  const contrast = eraLeaves(redPath)
  // An absent K4 directory has not run. A directory without a finished, matching run is a K4 failure (1361-F2 ruling 4.4).
  if (k4.failure !== null) return { band: 'Defect' as Band, evidence: `defect or setup: ${k4.failure}`, seeds: [], eraGuard: era, contrast }
  if (k4.loaded === null) {
    const evidence = k4.dir === null ? 'PROBE_K4 was not supplied' : `${k4.dir} does not exist: the K4 stage has not run`
    return { band: 'notRun' as Band, evidence, seeds: [], eraGuard: era, contrast }
  }
  const { dir, run } = k4.loaded
  const seeds = run.seeds.map((seed) => ({
    seed: seed.seed,
    digests: compareLines(digestLines(join(dir, seed.digests)), controlLines.get(seed.seed)!, seed.startWeek, run.weeks),
    factorsNotOne: (seed.assessments ?? []).filter((row) => row[4] !== 1).length,
  }))
  const one = (found: Leaf[] | null, status: string): boolean => found !== null && found.length === 1 && found[0]!.status === status
  const eraFailedAsItShould = one(era, 'failed') && era![0]!.message.includes('SHARED_MARKET_FACTOR_MAX_PENALTY')
  const failures = [
    ...seeds.filter((s) => s.digests.differing > 0).map((s) => `${s.seed}: ${s.digests.differing} of ${s.digests.weeks} weeks differ from the control, first ${JSON.stringify(s.digests.first[0])}`),
    ...seeds.filter((s) => s.factorsNotOne > 0).map((s) => `${s.seed}: ${s.factorsNotOne} factors are not 1 in the K4 tree`),
    ...(one(era, 'passed') ? ['the era-guard leaf passed with the penalty at 0'] : []),
    ...(one(contrast, 'failed') ? ['the era-guard leaf fails on the unedited candidate too (PROBE_RED_JSON), so its K4 failure shows nothing'] : []),
  ]
  const unclear = (name: string, path: string | null, found: Leaf[] | null): string => `${name} ${found === null
    ? (path === null ? 'not supplied' : `missing (${path})`) : `unclear (${found.length} leaves, ${found.map((l) => l.status).join(', ')})`}`
  const band: Band = failures.length > 0 ? 'Defect' : eraFailedAsItShould && one(contrast, 'passed') ? 'Proceed' : 'notRun'
  const evidence = failures.length > 0 ? `defect: ${failures.join('; ')}`
    : band === 'Proceed' ? `every week equals the control on ${seeds.map((s) => s.seed).join(' and ')}; the era-guard leaf failed on the penalty in the K4 tree and passed on the candidate, as it should`
    : `digests equal the control; ${[...(eraFailedAsItShould ? [] : [unclear('the K4 tree\'s era-guard result is', eraPath, era)]),
      ...(one(contrast, 'passed') ? [] : [unclear('the candidate\'s era-guard result is', redPath, contrast)])].join('; ')}`
  return { band, evidence, seeds, eraGuard: era, contrast }
}

/** K5: two candidate runs, separate processes, byte-identical (1355-A:169). */
function judgeK5(candidates: Loaded[]) {
  if (candidates.length < 2) return { band: 'notRun' as Band, evidence: 'one candidate run was supplied; K5 needs two', seeds: [] }
  const [a, b] = candidates as [Loaded, Loaded]
  const untimed = (seed: SeedRun): string => JSON.stringify({ ...seed, elapsedMs: 0, tickMs: [], k3Ms: 0, readouts: seed.readouts.map((r) => ({ ...r, saveMs: 0 })) })
  const text = (dir: string, name: string): string | null => (existsSync(join(dir, name)) ? readFileSync(join(dir, name), 'utf8') : null)
  const seeds = a.run.seeds.map((seedA, i) => {
    const seedB = b.run.seeds[i]!
    const files = [seedA.digests, `k3-digests-${seedA.seed}.jsonl`].map((name) => ({ name, equal: text(a.dir, name) === text(b.dir, name) }))
    const firstDigestDifference = files[0]!.equal ? null
      : compareLines(digestLines(join(a.dir, seedA.digests)), digestLines(join(b.dir, seedB.digests)), seedA.startWeek, a.run.weeks).first[0] ?? null
    return { seed: seedA.seed, files, runJsonEqual: untimed(seedA) === untimed(seedB), saves: seedA.readouts.map((r, j) => r.saveSha256 === seedB.readouts[j]?.saveSha256), firstDigestDifference }
  })
  const ok = seeds.every((s) => s.files.every((f) => f.equal) && s.runJsonEqual && s.saves.every(Boolean))
  return {
    band: (ok ? 'Proceed' : 'Defect') as Band,
    evidence: ok ? 'both runs wrote identical digests every week, identical read-out saves and identical rows'
      : `defect: ${seeds.filter((s) => !(s.files.every((f) => f.equal) && s.runJsonEqual && s.saves.every(Boolean))).map((s) => `${s.seed} differs (first digest difference ${JSON.stringify(s.firstDigestDifference)})`).join('; ')}`,
    seeds,
  }
}

// ── the summary table ────────────────────────────────────────────────────────────────────────────────────────
const LETTER: Record<Band, string> = { Proceed: 'P', Flag: 'F', Retune: 'R', Defect: 'D', noReleases: '-', notRun: 'n/r' }
// Each band's route (1355-A:187, :196-197, :205-206; 1361-F ruling 11; 1361-F2 rulings 3 and 4.4; 1361-G2-F ruling 2).
const ROUTE: Record<Band, string> = {
  Proceed: '(c) stays in the shared Save45 step (1361-F ruling 11)',
  Flag: '(c) stays in the shared Save45 step, and the row goes to the Wave 4 playtest brief (1355-A:187)',
  Retune: 'tuning: an amendment with its own record and review, then G1 and G2 again (1355-A:205-206), while P15A.1 takes its fallback step (1361-F2 ruling 3)',
  Defect: 'a production fix and a new G2 (1361-F2 ruling 4.4)',
  notRun: 'rerun what is missing; the gate has no verdict yet',
  noReleases: 'none: no release fell in the scope',
}
const STORAGE_ROUTE = 'a storage fix before Wave 3, not tuning (1355-A:196)'
const routeOf = (row: string, band: Band): string => (row === 'rootShare' && band === 'Retune' ? STORAGE_ROUTE : ROUTE[band])
const num = (x: number | null, digits = 3): string => (x === null ? '-' : x.toFixed(digits))
const short = (studioId: string): string => studioId.split('-').pop() ?? studioId // the r01 to r09 suffix
const rise = (x: number | null): string => (x === null ? 'up from 0' : `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`)

it('1361-G2 report', () => {
  if (required('PROBE_EXPECT') !== 'report') throw new Error('1361-G2 report: PROBE_EXPECT must be report')
  const out = required('PROBE_OUT')
  if (existsSync(out)) throw new Error(`1361-G2 report: PROBE_OUT ${out} exists; every report writes a new directory`)
  const control = load(required('PROBE_CONTROL'), 'control')
  const candidates = required('PROBE_CANDIDATE').split(',').map((dir) => load(dir.trim(), 'candidate'))
  if (candidates.length > 2) throw new Error('1361-G2 report: PROBE_CANDIDATE names one or two candidate runs')
  // One probe source, one horizon, one seed list on every run (1355-A:181: "same routes"), on the two save steps.
  const frame = (r: ProbeRun): string => JSON.stringify([r.probeSha256, r.weeks, r.readouts, r.k3Week, r.seeds.map((s) => s.seed)])
  const framing = (r: Loaded): string => `1361-G2 report: ${r.dir} differs from the control in probe sha256, weeks, read-outs, K3 week or seeds`
  for (const r of candidates) if (frame(r.run) !== frame(control.run)) throw new Error(framing(r))
  if (control.run.liveSaveVersion !== CONTROL_SAVE) throw new Error(`1361-G2 report: the control runs Save${control.run.liveSaveVersion}, not Save${CONTROL_SAVE}`)
  for (const r of candidates) if (r.run.liveSaveVersion !== CANDIDATE_SAVE) throw new Error(`1361-G2 report: ${r.dir} runs Save${r.run.liveSaveVersion}, not Save${CANDIDATE_SAVE}`)
  if (candidates.some((r) => r.run.treeHead !== candidates[0]!.run.treeHead)) throw new Error('1361-G2 report: the candidate runs name different trees')
  const cand = candidates[0]!
  const redJson = optional('PROBE_RED_JSON')
  const red = redJson === null ? null : { path: redJson, ...redProvenance(redJson, cand.run.treeHead) }
  const eraJson = optional('PROBE_ERA_GUARD_JSON')
  // The K4 run is one K row. An absent directory reads notRun. A directory without a finished run on the candidate's
  // tree, frame and save step, with only the penalty moved, reads Defect, and the other rows still report.
  const k4Dir = optional('PROBE_K4')
  const k4: K4Input = { dir: k4Dir, loaded: null, failure: null }
  if (k4Dir !== null && existsSync(k4Dir)) {
    try {
      const r = load(k4Dir, 'k4')
      if (frame(r.run) !== frame(control.run)) throw new Error(framing(r))
      if (r.run.treeHead !== cand.run.treeHead) throw new Error(`1361-G2 report: the K4 run's tree ${r.run.treeHead} is not the candidate's ${cand.run.treeHead}`)
      if (r.run.liveSaveVersion !== CANDIDATE_SAVE) throw new Error(`1361-G2 report: the K4 tree runs Save${r.run.liveSaveVersion}, not Save${CANDIDATE_SAVE}`)
      const unedited = JSON.stringify({ ...r.run.tuning, SHARED_MARKET_FACTOR_MAX_PENALTY: cand.run.tuning.SHARED_MARKET_FACTOR_MAX_PENALTY })
      if (r.run.tuning.SHARED_MARKET_FACTOR_MAX_PENALTY !== 0 || unedited !== JSON.stringify(cand.run.tuning) || r.run.law !== cand.run.law) {
        throw new Error(`1361-G2 report: the K4 tree's market tuning ${JSON.stringify(r.run.tuning)} is not the candidate's with the penalty at 0`)
      }
      k4.loaded = r
    } catch (error) {
      k4.failure = (error as Error).message
    }
  }
  const controlLines = new Map(control.run.seeds.map((seed) => [seed.seed, digestLines(join(control.dir, seed.digests))]))

  const seeds = control.run.seeds.map((ctrl, i) => {
    const seed = cand.run.seeds[i]!
    return {
      seed: ctrl.seed,
      readouts: control.run.readouts.map((week, j) => {
        const cumulative: Scope = { from: ctrl.startWeek, to: week, windows: control.run.readouts.slice(0, j + 1).map((_, n) => n) }
        const windowScope: Scope = { from: j === 0 ? ctrl.startWeek : control.run.readouts[j - 1]!, to: week, windows: [j] }
        return { week, cumulative: compare(seed, ctrl, cumulative, week), window: compare(seed, ctrl, windowScope, week) }
      }),
    }
  })
  const k = {
    K1: pinControl(redJson, 'K1'),
    K2: pinControl(redJson, 'K2'),
    K3: judgeK3(cand, controlLines),
    K4: judgeK4(k4, controlLines, eraJson, redJson),
    K5: judgeK5(candidates),
  }

  const rows = [
    ...seeds.flatMap((s) => s.readouts.flatMap((r) => Object.entries(r.cumulative.gated)
      .map(([row, value]) => ({ where: `${s.seed} week ${r.week} ${row}`, band: value.band, route: routeOf(row, value.band) })))),
    ...Object.entries(k).map(([name, value]) => ({ where: name, band: value.band, route: routeOf(name, value.band) })),
  ]
  // Worst first. A Defect makes the threshold rows untrustworthy, so it outranks Retune (1361-G2-D item 1).
  const verdict = rows.some((r) => r.band === 'Defect') ? 'Defect' : rows.some((r) => r.band === 'Retune') ? 'Retune'
    : rows.some((r) => r.band === 'notRun') ? 'incomplete' : rows.some((r) => r.band === 'Flag') ? 'Flag' : 'Proceed'
  const below = rows.filter((r) => r.band === 'Defect' || r.band === 'Retune' || r.band === 'Flag' || r.band === 'notRun')
  const reasons = below.map((r) => `${r.where}: ${r.band}; route: ${r.route}`)
  const routes = verdict === 'Proceed' ? [ROUTE.Proceed]
    : [...new Set(below.filter((r) => r.band === (verdict === 'incomplete' ? 'notRun' : verdict)).map((r) => r.route))]
  // The run files stay in scratch; the record keeps each one's size and sha256 (1361-G2-F ruling 2).
  const runDirs = [control.dir, ...candidates.map((r) => r.dir), ...(k4Dir !== null && existsSync(k4Dir) ? [k4Dir] : [])]
  const outputs = [...runDirs.flatMap((dir) => readdirSync(dir).sort().map((name) => join(dir, name))),
    ...[redJson, redJson === null ? null : join(dirname(redJson), 'run.meta'), eraJson].filter((file): file is string => file !== null && existsSync(file))]
    .map((file) => {
      const data = readFileSync(file)
      return { file, bytes: data.byteLength, sha256: createHash('sha256').update(data).digest('hex') }
    })
  const report = {
    report: '1361-G2', reportSha256: REPORT_SHA256, probeSha256: control.run.probeSha256, verdict, routes, reasons,
    inputs: {
      control: { dir: control.dir, treeHead: control.run.treeHead, save: control.run.liveSaveVersion },
      candidates: candidates.map((r) => ({ dir: r.dir, treeHead: r.run.treeHead, save: r.run.liveSaveVersion })),
      k4: k4.loaded === null ? { dir: k4Dir, failure: k4.failure } : { dir: k4.loaded.dir, treeHead: k4.loaded.run.treeHead, tuning: k4.loaded.run.tuning },
      p15Roots: { control: control.run.p15Roots, candidate: cand.run.p15Roots, k4: k4.loaded?.run.p15Roots ?? null },
      redJson: red, eraGuardJson: eraJson, weeks: control.run.weeks, readouts: control.run.readouts, k3Week: control.run.k3Week, law: cand.run.law, tuning: cand.run.tuning,
    },
    k, seeds, outputs,
  }
  mkdirSync(out, { recursive: true })
  writeFileSync(join(out, 'g2-report.json'), `${JSON.stringify(report, null, 1)}\n`)

  const md = [
    '# 1361-G2 report',
    '',
    `Overall: **${verdict}**. Route: ${routes.join('; ')}. The gate reads the cumulative rows at every read-out and K1-K5.`,
    '',
    ...(reasons.length === 0 ? [] : ['Rows below Proceed, each with its route:', '', ...reasons.map((r) => `- ${r}`), '']),
    `Control ${control.run.treeHead} (Save${control.run.liveSaveVersion}); candidate ${cand.run.treeHead} (Save${cand.run.liveSaveVersion}), ` +
      `${candidates.length} run(s); K4 ${k4.loaded === null ? (k4.failure === null ? 'not run' : 'failed (see the K4 row)')
        : `${k4.loaded.run.treeHead} with the penalty at ${String(k4.loaded.run.tuning.SHARED_MARKET_FACTOR_MAX_PENALTY)}`}; ` +
      `RED_JSON ${red === null ? 'not supplied' : `${red.path}, from ${red.tag} ${red.sha}`}. ` +
      `Probe sha256 ${control.run.probeSha256}; report sha256 ${REPORT_SHA256}. State digests leave out ${cand.run.p15Roots.join(', ')}.`,
    '',
    '## Threshold rows, cumulative to each read-out (1355-A:187-196)',
    '',
    'Each cell holds the value and its band: P Proceed, F Flag, R Retune, - no releases. "c/k" is candidate over control;',
    '"n" is the lowest genre\'s release count in the scope.',
    '',
    '| Seed | Week | Median f | p10 f | Lowest genre mean f | Share f ≤ 0.95 | Industry gross c/k | Rival stall weeks c, k | Rival weeks below 0 c, k | Root / save |',
    '|---|---:|---|---|---|---|---|---|---|---|',
    ...seeds.flatMap((s) => s.readouts.map((r) => {
      const g = r.cumulative.gated
      return `| ${s.seed} | ${r.week} | ${num(g.medianFactor.value)} ${LETTER[g.medianFactor.band]} | ${num(g.p10Factor.value)} ${LETTER[g.p10Factor.band]} | ` +
        `${num(g.lowestGenreMeanFactor.value)} ${g.lowestGenreMeanFactor.genre ?? ''} n=${g.lowestGenreMeanFactor.releases} ${LETTER[g.lowestGenreMeanFactor.band]} | ` +
        `${g.releasesWithFAtMost095.value === null ? '-' : `${(g.releasesWithFAtMost095.value * 100).toFixed(1)}%`} ${LETTER[g.releasesWithFAtMost095.band]} | ` +
        `${num(g.industryGross.ratio)} ${LETTER[g.industryGross.band]} | ${g.rivalStallWeeks.candidate}, ${g.rivalStallWeeks.control} (${rise(g.rivalStallWeeks.increase)}` +
        `${g.rivalStallWeeks.newStreaks.length > 0 ? `, ${g.rivalStallWeeks.newStreaks.length} new streaks` : ''}` +
        `${g.rivalStallWeeks.stoppedForGood.length > 0 ? `, ${g.rivalStallWeeks.stoppedForGood.length} stopped` : ''}` +
        `${g.rivalStallWeeks.stopsLiteral.length > 0 ? `, ${g.rivalStallWeeks.stopsLiteral.length} earlier last filming` : ''}) ${LETTER[g.rivalStallWeeks.band]} | ` +
        `${g.rivalWeeksBelowZero.candidate}, ${g.rivalWeeksBelowZero.control} (${rise(g.rivalWeeksBelowZero.increase)}) ${LETTER[g.rivalWeeksBelowZero.band]} | ` +
        `${g.rootShare.share === null ? '-' : `${(g.rootShare.share * 100).toFixed(2)}%`} ${LETTER[g.rootShare.band]} |`
    })),
    '',
    '## K1-K5 (1355-A:161-169, :197)',
    '',
    '| Control | Band | Route | Evidence |',
    '|---|---|---|---|',
    ...Object.entries(k).map(([name, value]) => `| ${name} | ${value.band} | ${routeOf(name, value.band)} | ${value.evidence.replace(/\|/g, '/')} |`),
    '',
    `## Report-only rows at week ${control.run.readouts[control.run.readouts.length - 1]} (cumulative)`,
    '',
    '| Seed | Row | Candidate | Control |',
    '|---|---|---|---|',
    ...seeds.flatMap((s) => {
      const r = s.readouts[s.readouts.length - 1]!.cumulative.reportOnly
      const sumKeys = (d: Record<string, number>, prefix: string): string =>
        ['viable', 'cashBlocked', 'economicRejection', 'staffingBlocked'].map((kind) => `${kind} ${d[`${prefix}:${kind}`] ?? 0}`).join(', ')
      const maxStreak = (pick: 'candidate' | 'control'): string => {
        const best = r.rivals.reduce<{ id: string; weeks: number } | null>((m, x) => {
          const w = x[pick]?.longestNoGreenlight ?? 0
          return m === null || w > m.weeks ? { id: x.studioId, weeks: w } : m
        }, null)
        return best === null ? '-' : `${best.weeks} (${best.id})`
      }
      return [
        `| ${s.seed} | releases | ${r.releases.candidate} | ${r.releases.control} |`,
        `| ${s.seed} | rival weeks below reserve | ${r.rivalWeeksBelowReserve.candidate} | ${r.rivalWeeksBelowReserve.control} |`,
        `| ${s.seed} | player cash | ${Math.round(r.player.candidate.cash)} | ${Math.round(r.player.control.cash)} |`,
        `| ${s.seed} | player Standing (awareness, prestige, confidence) | ${[r.player.candidate.standing.audienceAwareness, r.player.candidate.standing.industryPrestige, r.player.candidate.standing.commercialConfidence].map((x) => num(x, 2)).join(', ')} | ${[r.player.control.standing.audienceAwareness, r.player.control.standing.industryPrestige, r.player.control.standing.commercialConfidence].map((x) => num(x, 2)).join(', ')} |`,
        `| ${s.seed} | greenlights | ${r.greenlights.candidate} | ${r.greenlights.control} |`,
        `| ${s.seed} | shelvings | ${r.shelvings.candidate} | ${r.shelvings.control} |`,
        `| ${s.seed} | retries | ${sumKeys(r.decide.candidate, 'retry')} | ${sumKeys(r.decide.control, 'retry')} |`,
        `| ${s.seed} | decide outcomes, ready loop | ${sumKeys(r.decide.candidate, 'ready')} | ${sumKeys(r.decide.control, 'ready')} |`,
        `| ${s.seed} | longest no-greenlight streak (rival) | ${maxStreak('candidate')} | ${maxStreak('control')} |`,
        `| ${s.seed} | last filming week per rival | ${r.rivals.map((x) => `${short(x.studioId)} ${x.candidate?.lastFilmingWeek ?? '-'}`).join(', ')} | ${r.rivals.map((x) => `${short(x.studioId)} ${x.control?.lastFilmingWeek ?? '-'}`).join(', ')} |`,
        `| ${s.seed} | gross ratio per studio | ${r.grossByStudio.map((x) => `${short(x.studioId)} ${num(x.ratio)}`).join(', ')} | |`,
        `| ${s.seed} | save bytes (root rows) | ${r.saveBytes.candidate} (${r.saveBytes.candidateRootRows}) | ${r.saveBytes.control} |`,
        `| ${s.seed} | tick ms, median and p95 | ${num(r.tickMs.candidate?.median ?? null, 1)}, ${num(r.tickMs.candidate?.p95 ?? null, 1)} | ${num(r.tickMs.control?.median ?? null, 1)}, ${num(r.tickMs.control?.p95 ?? null, 1)} |`,
      ]
    }),
    '',
    'Every read-out, every window and every rival are in g2-report.json.',
    '',
    '## Run files, kept in scratch (1361-G2-F ruling 2)',
    '',
    '| File | Bytes | sha256 |',
    '|---|---:|---|',
    ...outputs.map((o) => `| ${o.file} | ${o.bytes} | ${o.sha256} |`),
    '',
  ].join('\n')
  writeFileSync(join(out, 'g2-report.md'), md)
}, 60 * 60 * 1000)
