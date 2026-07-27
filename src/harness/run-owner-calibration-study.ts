// ── D-12 OWNER ECONOMY CALIBRATION STUDY — integrated-engine evidence [I] ──────
// Phase-B diagnostic harness (NOT production; nothing here changes shipped tuning).
// Reproduces the owner's human playtest observation ("money stopped being a
// constraint after ~4 films") on the REAL engine and quantifies WHY, then sweeps the
// candidate calibration levers with DIAGNOSTIC-ONLY overrides.
//
// Everything drives the authoritative core surface:
//   generateWorld → beginFounding → signContract → foundStudio → greenlight → tick.
// Per-film + per-category cash flows are read from the AUTHORITATIVE LEDGER
// (cash === INITIAL_CASH + Σ ledger.amount), so payroll/overhead/production/revenue are
// never re-derived by hand. Diagnostic sensitivity toggles mutate TUNING/market IN-PROCESS
// only (restored after each cell); no file, no commit, no production change.
//
// Run:  node_modules/.bin/vite-node src/harness/run-owner-calibration-study.ts [SEEDS]
// Out:  out/d12-owner-economy-calibration/*.json  (+ console digest)

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  generateWorld,
  beginFounding,
  applyActions,
  tick,
  TUNING,
  FOUNDING_MINIMUMS,
  busyTalentIds,
  canAfford,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  MARKETING_BUDGET_LEVELS,
} from '../core/index.js'
import type { GameState, CreativeRole, Talent, CastSlot, LedgerKind, SegmentId } from '../core/index.js'

const SEEDS = Number(process.argv[2] ?? 150)
const OUT = join(process.cwd(), 'out', 'd12-owner-economy-calibration')
const INITIAL = TUNING.INITIAL_CASH

// ── stats helpers ─────────────────────────────────────────────────────────────
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const median = (xs: number[]) => quantile(xs, 0.5)
function quantile(xs: number[], q: number): number {
  if (xs.length === 0) return 0
  const s = [...xs].sort((a, b) => a - b)
  const i = Math.max(0, Math.min(s.length - 1, Math.floor(q * (s.length - 1))))
  return s[i]!
}
const rate = (flags: boolean[]) => (flags.length ? flags.filter(Boolean).length / flags.length : 0)
const r2 = (n: number) => Math.round(n * 1000) / 1000
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`

// ── owner routes (competent unless noted) ─────────────────────────────────────
type Rank = 'best' | 'cheapest' | 'star'
type Route = {
  name: string
  counts: Record<CreativeRole, number>
  rank: Rank
  negMult: number // negative = concept.baseNegativeCost × negMult
  marketing: number
  maxConcurrent: number // route policy (B uses one active film)
}
const ROUTES: Route[] = [
  // A — competent small studio, aggressive spending (generous budget, wide marketing, both slots).
  { name: 'A_competent_aggressive', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.25, marketing: 1_000_000, maxConcurrent: 2 },
  // B — competent small studio, restrained (adequate budget, standard marketing, ONE active film).
  { name: 'B_competent_restrained', counts: { actor: 5, director: 1, writer: 1, craft: 1 }, rank: 'best', negMult: 1.0, marketing: 400_000, maxConcurrent: 1 },
  // C — star-heavy (expensive/famous talent, generous budget, wide marketing).
  { name: 'C_star_heavy', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'star', negMult: 1.25, marketing: 1_000_000, maxConcurrent: 2 },
  // D — bargain-basement stress (cheapest legal roster, lowest spending) — a STRESS case, not representative.
  { name: 'D_bargain_stress', counts: { actor: 3, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.75, marketing: 100_000, maxConcurrent: 2 },
]
const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']

function rankTalent(list: Talent[], role: CreativeRole, rank: Rank): Talent[] {
  const ovr = (t: Talent) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
  const arr = [...list]
  if (rank === 'best') arr.sort((a, b) => ovr(b) + b.fame - (ovr(a) + a.fame))
  else if (rank === 'cheapest') arr.sort((a, b) => ovr(a) + a.fame - (ovr(b) + b.fame))
  else arr.sort((a, b) => ovr(b) + 2 * b.fame - (ovr(a) + 2 * a.fame)) // star: fame-weighted
  return arr
}

// Found under a route; `grossScale` diagnostically scales the per-seed market value (B10).
function foundFor(seed: string, st: Route, grossScale = 1): GameState {
  let s = beginFounding(generateWorld(seed))
  if (grossScale !== 1) s = { ...s, market: { ...s.market, baseMarketValue: s.market.baseMarketValue * grossScale } }
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const toSign: string[] = []
  for (const role of ROLES) {
    const want = Math.max(FOUNDING_MINIMUMS[role], st.counts[role])
    const ranked = rankTalent(pool.filter((t) => t.role === role), role, st.rank)
    for (const t of ranked.slice(0, want)) toSign.push(t.id)
  }
  for (const id of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

// One legal greenlight from currently-free contracted talent (best-fit), with a chosen budget.
function assemble(s: GameState, st: Route, conceptIdx: number, negMult: number, marketing: number) {
  const busy = busyTalentIds(s)
  const free = (role: CreativeRole) =>
    rankTalent(
      s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)),
      role,
      st.rank,
    )
  const w = free('writer')[0]
  const d = free('director')[0]
  const a = free('actor')
  const c = free('craft')[0]
  if (!w || !d || !c || a.length < 3) return null
  const concept = s.concepts[conceptIdx % s.concepts.length]!
  const negative = Math.round(concept.baseNegativeCost * negMult)
  const committed = negative + marketing
  if (!canAfford(s, committed).ok) return null
  const cast = { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>
  return {
    committed,
    negative,
    action: {
      kind: 'greenlight' as const,
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup' as const, midpoint: 'revelation' as const, ending: 'bittersweet' as const },
        promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
        writerId: w.id,
        directorId: d.id,
        cast,
        craftIds: [c.id],
        budget: { negative, marketing },
      },
    },
  }
}

// Sum ledger by kind (authoritative decomposition).
function ledgerByKind(s: GameState): Record<LedgerKind, number> {
  const out = {} as Record<LedgerKind, number>
  for (const e of s.ledger) out[e.kind] = (out[e.kind] ?? 0) + e.amount
  return out
}

// ── B3/B4/B5: run a route until FOUR films' theatrical runs COMPLETE ───────────
type FilmRow = { committed: number; forecastTotal: number; actualGross: number; studioRevenue: number; contribution: number }
type RouteRun = {
  finalCash: number
  cashMultiple: number
  films: FilmRow[]
  minCash: number
  everNeg: boolean
  endBelowStart: boolean
  endBelow5M: boolean
  ledger: Record<LedgerKind, number>
  weeks: number
}
function runFourFilms(seed: string, st: Route, grossScale = 1): RouteRun {
  let s = foundFor(seed, st, grossScale)
  const share = TUNING.STUDIO_RENTAL_BLENDED
  const committedById: Record<string, number> = {}
  const forecastById: Record<string, number> = {}
  let conceptIdx = 0
  let minCash = s.studio.cash
  let everNeg = false
  const TARGET = 4
  const WEEK_CAP = TARGET * (TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS) + 40
  let wk = 0
  for (; wk < WEEK_CAP; wk++) {
    // Greenlight to fill free slots (route policy), while we still have films to launch.
    const launched = Object.keys(committedById).length
    if (launched < TARGET) {
      for (let guard = 0; guard < st.maxConcurrent + 1; guard++) {
        if (s.studio.activeProductions.length >= st.maxConcurrent) break
        if (Object.keys(committedById).length >= TARGET) break
        const g = assemble(s, st, conceptIdx, st.negMult, st.marketing)
        if (!g) break
        s = applyActions(s, [g.action])
        conceptIdx += 1
        // Record the just-greenlit production's committed cost + persisted forecast.
        const p = s.studio.activeProductions[s.studio.activeProductions.length - 1]!
        committedById[p.id] = g.committed
        forecastById[p.id] = p.forecastSnapshot.expectedTotal
      }
    }
    s = tick(s, { develop: true })
    minCash = Math.min(minCash, s.studio.cash)
    if (s.studio.cash < 0) everNeg = true
    // Stop once TARGET films have launched AND all their runs are completed.
    const launchedIds = Object.keys(committedById)
    const allDone =
      launchedIds.length >= TARGET &&
      launchedIds.every((id) => {
        const run = s.theatricalRuns.find((r) => r.productionId === id)
        return run && run.status !== 'active'
      })
    if (allDone) break
  }
  const films: FilmRow[] = Object.keys(committedById).map((id) => {
    const run = s.theatricalRuns.find((r) => r.productionId === id)
    const actualGross = run ? run.weeklyGross.reduce((a, b) => a + b, 0) : 0
    const studioRevenue = run ? actualGross * run.studioShare : 0
    const committed = committedById[id]!
    return { committed, forecastTotal: forecastById[id]!, actualGross, studioRevenue, contribution: studioRevenue - committed }
  })
  void share
  return {
    finalCash: s.studio.cash,
    cashMultiple: s.studio.cash / INITIAL,
    films,
    minCash,
    everNeg,
    endBelowStart: s.studio.cash < INITIAL,
    endBelow5M: s.studio.cash < 5_000_000,
    ledger: ledgerByKind(s),
    weeks: wk,
  }
}

type RouteAgg = ReturnType<typeof aggregateRoute>
function aggregateRoute(name: string, runs: RouteRun[]) {
  const mult = runs.map((r) => r.cashMultiple)
  const allFilms = runs.flatMap((r) => r.films)
  const contributions = allFilms.map((f) => f.contribution)
  const contribPctCommit = allFilms.map((f) => (f.committed > 0 ? f.contribution / f.committed : 0))
  const filmLoss = allFilms.map((f) => f.contribution < 0)
  const atLeastOneLoss = runs.map((r) => r.films.some((f) => f.contribution < 0))
  const ledgerAvg = {} as Record<string, number>
  for (const r of runs) for (const [k, v] of Object.entries(r.ledger)) ledgerAvg[k] = (ledgerAvg[k] ?? 0) + v / runs.length
  return {
    route: name,
    seeds: runs.length,
    cashMultiple: { p10: r2(quantile(mult, 0.1)), median: r2(median(mult)), p90: r2(quantile(mult, 0.9)), mean: r2(mean(mult)) },
    finalCash: { p10: Math.round(quantile(runs.map((r) => r.finalCash), 0.1)), median: Math.round(median(runs.map((r) => r.finalCash))), p90: Math.round(quantile(runs.map((r) => r.finalCash), 0.9)) },
    contributionPerFilm: { median: Math.round(median(contributions)), mean: Math.round(mean(contributions)), p10: Math.round(quantile(contributions, 0.1)), p90: Math.round(quantile(contributions, 0.9)) },
    contributionPctOfCommitment: { median: r2(median(contribPctCommit)), mean: r2(mean(contribPctCommit)) },
    lossRatePerFilm: r2(rate(filmLoss)),
    probAtLeastOneLossInFour: r2(rate(atLeastOneLoss)),
    probEndBelowStart: r2(rate(runs.map((r) => r.endBelowStart))),
    probEndBelow5M: r2(rate(runs.map((r) => r.endBelow5M))),
    probEverNegative: r2(rate(runs.map((r) => r.everNeg))),
    maxDrawdownMedian: Math.round(median(runs.map((r) => INITIAL - r.minCash))),
    filmsCompleted: Math.round(median(runs.map((r) => r.films.length))),
    weeksToFour: Math.round(median(runs.map((r) => r.weeks))),
    ledgerAvg: Object.fromEntries(Object.entries(ledgerAvg).map(([k, v]) => [k, Math.round(v)])),
  }
}

// ── B6: awareness-conditioned marketing sweep (fixed route-A package) ──────────
// For the same competent package, vary marketing across the three player levels at two
// awareness states (fresh studio vs after 3 releases), and report median actual contribution
// + loss rate + marginal contribution per marketing dollar.
function oneFilmContribution(seed: string, st: Route, negMult: number, marketing: number, warmupFilms: number): { contribution: number; gross: number; loss: boolean } | null {
  let s = foundFor(seed, st)
  // Warm up awareness by releasing `warmupFilms` at the route's default budget.
  let conceptIdx = 0
  let launched = 0
  let guardWeeks = 0
  while (launched < warmupFilms && guardWeeks < 200) {
    if (s.studio.activeProductions.length < st.maxConcurrent) {
      const g = assemble(s, st, conceptIdx, st.negMult, st.marketing)
      if (g) { s = applyActions(s, [g.action]); conceptIdx++; launched++ }
    }
    s = tick(s, { develop: true }); guardWeeks++
    if (s.studio.releasedFilms.length >= warmupFilms) break
  }
  // Let warmups finish paying so awareness has updated.
  for (let k = 0; k < TUNING.THEATRICAL_WEEKS + 2; k++) s = tick(s, { develop: true })
  // The measured film.
  const g = assemble(s, st, conceptIdx, negMult, marketing)
  if (!g) return null
  s = applyActions(s, [g.action])
  const id = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 4; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === id)
    if (run && run.status !== 'active') break
  }
  const run = s.theatricalRuns.find((r) => r.productionId === id)
  if (!run) return null
  const gross = run.weeklyGross.reduce((a, b) => a + b, 0)
  const studioRevenue = gross * run.studioShare
  const contribution = studioRevenue - g.committed
  return { contribution, gross, loss: contribution < 0 }
}

function marketingSweep(seeds: number) {
  const st = ROUTES[0]! // competent aggressive roster
  const levels = MARKETING_BUDGET_LEVELS
  const awareness = [0, 3] // fresh vs after 3 releases
  const cells: any[] = []
  for (const warm of awareness) {
    for (const mk of levels) {
      const contribs: number[] = []
      const losses: boolean[] = []
      for (let i = 0; i < seeds; i++) {
        const r = oneFilmContribution(`mkt-${i}`, st, 1.0, mk, warm)
        if (r) { contribs.push(r.contribution); losses.push(r.loss) }
      }
      cells.push({ warmupFilms: warm, marketing: mk, medianContribution: Math.round(median(contribs)), lossRate: r2(rate(losses)), n: contribs.length })
    }
  }
  // marginal contribution per added marketing dollar, per awareness state.
  const marginal: any[] = []
  for (const warm of awareness) {
    const row = cells.filter((c) => c.warmupFilms === warm).sort((a, b) => a.marketing - b.marketing)
    for (let i = 1; i < row.length; i++) {
      const dC = row[i].medianContribution - row[i - 1].medianContribution
      const dM = row[i].marketing - row[i - 1].marketing
      marginal.push({ warmupFilms: warm, from: row[i - 1].marketing, to: row[i].marketing, marginalContributionPerDollar: r2(dC / dM) })
    }
    const best = row.slice().sort((a, b) => b.medianContribution - a.medianContribution)[0]
    marginal.push({ warmupFilms: warm, profitMaxMarketing: best.marketing })
  }
  return { cells, marginal }
}

// ── B7: production-budget sensitivity (fixed route-A package) ──────────────────
function budgetSweep(seeds: number) {
  const st = ROUTES[0]!
  const tiers = [0.75, 1.0, 1.25, 1.5, 1.75]
  const cells: any[] = []
  for (const negMult of tiers) {
    const contribs: number[] = []
    const losses: boolean[] = []
    for (let i = 0; i < seeds; i++) {
      const r = oneFilmContribution(`bud-${i}`, st, negMult, st.marketing, 0)
      if (r) { contribs.push(r.contribution); losses.push(r.loss) }
    }
    cells.push({ negMult, medianContribution: Math.round(median(contribs)), lossRate: r2(rate(losses)), n: contribs.length })
  }
  const marginal: any[] = []
  const sorted = cells.slice().sort((a, b) => a.negMult - b.negMult)
  for (let i = 1; i < sorted.length; i++) {
    // Δnegative dollars is concept-dependent; approximate marginal per tier step using median commitment scale.
    marginal.push({ from: sorted[i - 1].negMult, to: sorted[i].negMult, dContribution: sorted[i].medianContribution - sorted[i - 1].medianContribution })
  }
  const best = cells.slice().sort((a, b) => b.medianContribution - a.medianContribution)[0]
  return { cells, marginal, profitMaxNegMult: best.negMult }
}

// ── B8: payroll/overhead bite ─────────────────────────────────────────────────
function payrollStudy(seeds: number) {
  const out: any[] = []
  for (const st of ROUTES) {
    const weeklyPayroll: number[] = []
    const weeklyOverhead: number[] = []
    const filmContribs: number[] = []
    for (let i = 0; i < seeds; i++) {
      const run = runFourFilms(`pay-${i}`, st)
      // authoritative weekly figures from the ledger over the run window.
      const wk = Math.max(1, run.weeks)
      weeklyPayroll.push(-(run.ledger['payroll'] ?? 0) / wk)
      weeklyOverhead.push(-(run.ledger['overhead'] ?? 0) / wk)
      for (const f of run.films) filmContribs.push(f.contribution)
    }
    const annualPayroll = median(weeklyPayroll) * TUNING.TICKS_PER_YEAR
    const annualOverhead = median(weeklyOverhead) * TUNING.TICKS_PER_YEAR
    const annualBurn = annualPayroll + annualOverhead
    const medianFilmContribution = median(filmContribs)
    out.push({
      route: st.name,
      annualPayroll: Math.round(annualPayroll),
      annualOverhead: Math.round(annualOverhead),
      annualBurn: Math.round(annualBurn),
      medianFilmContribution: Math.round(medianFilmContribution),
      burnAsPctOfOneFilmContribution: medianFilmContribution > 0 ? r2(annualBurn / medianFilmContribution) : null,
      filmsToCoverAnnualBurn: medianFilmContribution > 0 ? r2(annualBurn / medianFilmContribution) : null,
    })
  }
  return out
}

// ── B10: sensitivity matrix (diagnostic-only overrides) ───────────────────────
// Re-run route A's four-film window under one-lever-at-a-time diagnostic overrides and
// report the four-film cash multiple + film loss rate. TUNING is mutated IN-PROCESS and
// restored; INITIAL_CASH/SALARY_* are toggled BEFORE worldgen (read at generateWorld).
function withTuning<T>(overrides: Partial<Record<string, number>>, fn: () => T): T {
  const saved: Record<string, number> = {}
  for (const k of Object.keys(overrides)) { saved[k] = (TUNING as any)[k]; (TUNING as any)[k] = overrides[k] }
  try { return fn() } finally { for (const k of Object.keys(saved)) (TUNING as any)[k] = saved[k] }
}
function sensitivityCell(label: string, seeds: number, grossScale: number, overrides: Partial<Record<string, number>>) {
  const st = ROUTES[0]!
  return withTuning(overrides, () => {
    const runs: RouteRun[] = []
    const initialForCell = (overrides['INITIAL_CASH'] ?? INITIAL)
    for (let i = 0; i < seeds; i++) runs.push(runFourFilms(`sens-${i}`, st, grossScale))
    const mult = runs.map((r) => r.finalCash / initialForCell)
    const filmLoss = runs.flatMap((r) => r.films.map((f) => f.contribution < 0))
    return {
      label,
      cashMultiple: { p10: r2(quantile(mult, 0.1)), median: r2(median(mult)), p90: r2(quantile(mult, 0.9)) },
      lossRatePerFilm: r2(rate(filmLoss)),
      probEndBelowStart: r2(rate(runs.map((r) => r.finalCash < initialForCell))),
    }
  })
}
function sensitivityMatrix(seeds: number) {
  const cells: any[] = []
  cells.push(sensitivityCell('baseline', seeds, 1, {}))
  // Gross/opening scale (per-seed market value).
  for (const g of [0.9, 0.8, 0.7, 0.6]) cells.push(sensitivityCell(`gross×${g}`, seeds, g, {}))
  // Salary inflation (regenerated world).
  for (const m of [1.25, 1.5, 2.0]) cells.push(sensitivityCell(`salary×${m}`, seeds, 1, { SALARY_BASE: TUNING.SALARY_BASE * m, SALARY_SKILL_COEF: TUNING.SALARY_SKILL_COEF * m, SALARY_FAME_COEF: TUNING.SALARY_FAME_COEF * m }))
  // Overhead.
  for (const m of [2, 3]) cells.push(sensitivityCell(`overhead×${m}`, seeds, 1, { OVERHEAD_BASE: TUNING.OVERHEAD_BASE * m, OVERHEAD_PER_EMPLOYEE: TUNING.OVERHEAD_PER_EMPLOYEE * m }))
  // Starting liquidity.
  for (const c of [15_000_000, 12_000_000]) cells.push(sensitivityCell(`startCash=${c / 1e6}M`, seeds, 1, { INITIAL_CASH: c }))
  // Studio share (secondary lever).
  for (const sh of [0.5, 0.48, 0.45]) cells.push(sensitivityCell(`share=${sh}`, seeds, 1, { STUDIO_RENTAL_BLENDED: sh }))
  // Combined candidate: gross 0.7 + share 0.48 (illustrative small package).
  cells.push(withTuning({ STUDIO_RENTAL_BLENDED: 0.48 }, () => sensitivityCell('gross×0.7 + share0.48', seeds, 0.7, {})))
  return cells
}

// ── run everything ─────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true })
// eslint-disable-next-line no-console
console.log(`# [I] D-12 owner economy calibration study — ${SEEDS} seeds (INITIAL_CASH ${fmtM(INITIAL)}, share ${TUNING.STUDIO_RENTAL_BLENDED}, K ${TUNING.FAME_REACH_HALF_SAT})`)

const routeAgg: RouteAgg[] = []
for (const st of ROUTES) {
  const runs: RouteRun[] = []
  for (let i = 0; i < SEEDS; i++) runs.push(runFourFilms(`route-${i}`, st))
  const agg = aggregateRoute(st.name, runs)
  routeAgg.push(agg)
  // eslint-disable-next-line no-console
  console.log(`\n## ${st.name}  (${agg.filmsCompleted} films, ~${agg.weeksToFour} wk)`)
  // eslint-disable-next-line no-console
  console.log(`  4-film cash multiple  p10 ${agg.cashMultiple.p10}×  median ${agg.cashMultiple.median}×  p90 ${agg.cashMultiple.p90}×   (final ${fmtM(agg.finalCash.median)})`)
  // eslint-disable-next-line no-console
  console.log(`  contribution/film median ${fmtM(agg.contributionPerFilm.median)}  (= ${(agg.contributionPctOfCommitment.median * 100).toFixed(0)}% of commitment)`)
  // eslint-disable-next-line no-console
  console.log(`  loss/film ${(agg.lossRatePerFilm * 100).toFixed(0)}%  ≥1 loss in 4 ${(agg.probAtLeastOneLossInFour * 100).toFixed(0)}%  end<start ${(agg.probEndBelowStart * 100).toFixed(0)}%  end<$5M ${(agg.probEndBelow5M * 100).toFixed(0)}%  everNeg ${(agg.probEverNegative * 100).toFixed(0)}%`)
}

const marketing = marketingSweep(Math.min(SEEDS, 80))
const budget = budgetSweep(Math.min(SEEDS, 80))
const payroll = payrollStudy(Math.min(SEEDS, 80))
const sensitivity = sensitivityMatrix(Math.min(SEEDS, 60))

// eslint-disable-next-line no-console
console.log(`\n## B6 marketing (median contribution by level × awareness)`)
for (const c of marketing.cells) console.log(`  warm ${c.warmupFilms}  mkt ${fmtM(c.marketing)}  contrib ${fmtM(c.medianContribution)}  loss ${(c.lossRate * 100).toFixed(0)}%`)
// eslint-disable-next-line no-console
console.log(`  marginal/profit-max: ${JSON.stringify(marketing.marginal)}`)
// eslint-disable-next-line no-console
console.log(`\n## B7 production budget (median contribution by tier)`)
for (const c of budget.cells) console.log(`  negMult ${c.negMult}  contrib ${fmtM(c.medianContribution)}  loss ${(c.lossRate * 100).toFixed(0)}%`)
console.log(`  profit-max negMult: ${budget.profitMaxNegMult}`)
// eslint-disable-next-line no-console
console.log(`\n## B8 payroll/overhead bite`)
for (const p of payroll) console.log(`  ${p.route}: annualBurn ${fmtM(p.annualBurn)}  vs one-film contribution ${fmtM(p.medianFilmContribution)}  → burn = ${p.burnAsPctOfOneFilmContribution}× one film`)
// eslint-disable-next-line no-console
console.log(`\n## B10 sensitivity matrix (route A four-film cash multiple)`)
for (const c of sensitivity) console.log(`  ${c.label.padEnd(22)} mult p10 ${c.cashMultiple.p10}× med ${c.cashMultiple.median}× p90 ${c.cashMultiple.p90}×  loss/film ${(c.lossRatePerFilm * 100).toFixed(0)}%  end<start ${(c.probEndBelowStart * 100).toFixed(0)}%`)

writeFileSync(join(OUT, 'owner-routes.json'), JSON.stringify({ seeds: SEEDS, initialCash: INITIAL, share: TUNING.STUDIO_RENTAL_BLENDED, routes: routeAgg }, null, 2))
writeFileSync(join(OUT, 'marketing-study.json'), JSON.stringify(marketing, null, 2))
writeFileSync(join(OUT, 'budget-study.json'), JSON.stringify(budget, null, 2))
writeFileSync(join(OUT, 'payroll-overhead.json'), JSON.stringify(payroll, null, 2))
writeFileSync(join(OUT, 'sensitivity-matrix.json'), JSON.stringify(sensitivity, null, 2))
// eslint-disable-next-line no-console
console.log(`\nwrote ${OUT}/{owner-routes,marketing-study,budget-study,payroll-overhead,sensitivity-matrix}.json`)
