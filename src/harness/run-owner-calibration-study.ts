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
type Rank = 'best' | 'cheapest' | 'star' | 'mid'
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
  else if (rank === 'star') arr.sort((a, b) => ovr(b) + 2 * b.fame - (ovr(a) + 2 * a.fame)) // fame-weighted
  else {
    // 'mid': ordinary talent — sort by distance from the pool's median OVR (a typical, not all-star, slate).
    const sortedOvr = [...arr].map(ovr).sort((a, b) => a - b)
    const med = sortedOvr[Math.floor(sortedOvr.length / 2)] ?? 0
    arr.sort((a, b) => Math.abs(ovr(a) - med) - Math.abs(ovr(b) - med))
  }
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

// ── weak-film routes (§12): the weakest LEGAL film + a weak but commercially-positioned film ──
// The weakest legal package: cheapest talent, a commercially-compatible ordinary concept, GENEROUS
// budget (owner's Letters case), small marketing. Report the single-film Film Contribution
// distribution + loss probability. The weak-commercial variant uses a high-reach demanding shape.
function weakFilmReport(seeds: number, shapeKey: ArchKey, marketing: number, negMult: number, label: string) {
  const contribs: number[] = []
  const legsList: number[] = []
  for (let i = 0; i < seeds; i++) {
    const r = archFilmDetailed(`weak-${label}-${i}`, shapeKey, 'cheapest', marketing, negMult, 0)
    if (r) { contribs.push(r.contribution); legsList.push(r.legs) }
  }
  return {
    label,
    n: contribs.length,
    contribution: { p10: Math.round(quantile(contribs, 0.1)), median: Math.round(median(contribs)), p90: Math.round(quantile(contribs, 0.9)) },
    lossProbability: r2(rate(contribs.map((c) => c < 0))),
    legsMedian: r2(median(legsList)),
  }
}

// ── §7: rational competent bot — package-specific Marketing + Budget choices ──
// A competent player who makes RATIONAL, film-specific choices rather than mechanically maximizing
// marketing / minimizing budget. Across four films it cycles ambition (contained → ordinary →
// demanding → ordinary), picks the Production Budget tier by the film's ambition (contained→Lean,
// ordinary→Adequate, demanding→Generous), and picks Marketing by how visible the film already is
// (a big campaign only for a warmed studio's commercial film; a standard campaign otherwise; a small
// one for a fresh, low-appeal film). Reports the SELECTED tier distributions + four-film outcomes.
const RATIONAL_SHAPES: { shape: ArchKey; negMult: number }[] = [
  { shape: 'contained', negMult: 0.75 },
  { shape: 'ordinary', negMult: 1.0 },
  { shape: 'demanding', negMult: 1.25 },
  { shape: 'ordinary', negMult: 1.0 },
]
function rationalMarketing(state: GameState, rank: Rank): number {
  const warmed = state.studio.releasedFilms.length >= 2
  const aud = state.studio.standing.audienceAwareness
  if (warmed && aud >= 45 && rank === 'best') return 1_000_000 // a visible studio's commercial film
  if (aud < 12 && rank !== 'best') return 100_000 // a fresh, low-appeal film: a small campaign
  return 400_000 // standard
}
function runRationalFourFilms(seed: string, rank: Rank) {
  let s = foundFor(seed, { ...ROUTES[0]!, rank })
  const committed: Record<string, number> = {}
  const mktPicks: Record<string, number> = {}
  const negPicks: Record<string, number> = {}
  let idx = 0
  for (let wk = 0; wk < 4 * (TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS) + 40; wk++) {
    while (s.studio.activeProductions.length < 2 && Object.keys(committed).length < 4) {
      const busy = busyTalentIds(s)
      const free = (role: CreativeRole) => rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role, rank)
      const w = free('writer')[0], d = free('director')[0], a = free('actor'), c = free('craft')[0]
      if (!w || !d || !c || a.length < 3) break
      const plan = RATIONAL_SHAPES[idx % RATIONAL_SHAPES.length]!
      const concept = s.concepts[idx % s.concepts.length]!
      const negative = Math.round(concept.baseNegativeCost * plan.negMult)
      const marketing = rationalMarketing(s, rank)
      if (!canAfford(s, negative + marketing).ok) break
      s = applyActions(s, [{ kind: 'greenlight', production: {
        conceptId: concept.id, shape: ARCH_SHAPES[plan.shape],
        promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
        writerId: w.id, directorId: d.id, cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>, craftIds: [c.id],
        budget: { negative, marketing },
      } }])
      const id = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
      committed[id] = negative + marketing; mktPicks[id] = marketing; negPicks[id] = plan.negMult; idx++
    }
    s = tick(s, { develop: true })
    const ids = Object.keys(committed)
    if (ids.length >= 4 && ids.every((id) => { const r = s.theatricalRuns.find((x) => x.productionId === id); return r && r.status !== 'active' })) break
  }
  const contributions = Object.keys(committed).map((id) => {
    const run = s.theatricalRuns.find((r) => r.productionId === id)!
    return run.weeklyGross.reduce((x, y) => x + y, 0) * run.studioShare - committed[id]!
  })
  return { multiple: s.studio.cash / INITIAL, contributions, mktPicks: Object.values(mktPicks), negPicks: Object.values(negPicks), everNeg: s.studio.cash < 0 }
}
function rationalRouteReport(seeds: number, rank: Rank) {
  const runs = Array.from({ length: seeds }, (_, i) => runRationalFourFilms(`rat-${rank}-${i}`, rank))
  const mult = runs.map((r) => r.multiple)
  const films = runs.flatMap((r) => r.contributions)
  const mktCounts: Record<string, number> = {}, negCounts: Record<string, number> = {}
  for (const r of runs) { for (const m of r.mktPicks) mktCounts[m] = (mktCounts[m] ?? 0) + 1; for (const n of r.negPicks) negCounts[n] = (negCounts[n] ?? 0) + 1 }
  const breakouts = films.filter((c) => c >= 10_000_000).length
  return {
    rank,
    cashMultiple: { p10: r2(quantile(mult, 0.1)), median: r2(median(mult)), p90: r2(quantile(mult, 0.9)) },
    lossRatePerFilm: r2(rate(films.map((c) => c < 0))),
    atLeastOneLoss: r2(rate(runs.map((r) => r.contributions.some((c) => c < 0)))),
    endBelowStart: r2(rate(runs.map((r) => r.multiple < 1))),
    everNegative: r2(rate(runs.map((r) => r.everNeg))),
    breakoutRate: r2(breakouts / Math.max(films.length, 1)),
    marketingTierDist: mktCounts,
    budgetTierDist: negCounts,
  }
}

// ── Stage 3B/3C: diverse-package choice-quality gate ──────────────────────────
// Marketing/budget optima must depend on the FILM. We build a representative package set — talent
// quality {best, cheapest} × ambition {contained, ordinary, demanding} — and, per package, sweep
// Marketing (at negMult 1.0) and Production Budget (at standard marketing) to find each choice's
// profit-max tier. Reports how often maximum Marketing / a single Budget tier is optimal.
const ARCH_SHAPES = {
  contained: { opening: 'slowSetup', midpoint: 'revelation', ending: 'tragic' }, // low demand, high craft, low reach
  ordinary: { opening: 'mysteryHook', midpoint: 'reversal', ending: 'bittersweet' }, // mid demand
  demanding: { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }, // high demand + reach, low craft
} as const
type ArchKey = keyof typeof ARCH_SHAPES
const MKT_LEVELS = MARKETING_BUDGET_LEVELS
const NEG_TIERS = [0.75, 1.0, 1.25]

// One film with an explicit archetype (shape + talent rank), marketing, and negMult, on a founded
// studio warmed by `warmup` prior releases (studio awareness rises with warmup). Returns Contribution.
function archFilm(seed: string, shapeKey: ArchKey, rank: Rank, marketing: number, negMult: number, warmup = 0): number | null {
  const d = archFilmDetailed(seed, shapeKey, rank, marketing, negMult, warmup)
  return d ? d.contribution : null
}
function archFilmDetailed(seed: string, shapeKey: ArchKey, rank: Rank, marketing: number, negMult: number, warmup = 0): { contribution: number; opening: number; total: number; legs: number } | null {
  let s = foundFor(seed, { ...ROUTES[0]!, rank })
  // Warm the studio's audience awareness by releasing `warmup` films at a standard campaign.
  let wConcept = 0
  let launched = 0
  for (let wk = 0; wk < 200 && s.studio.releasedFilms.length < warmup; wk++) {
    if (launched < warmup && s.studio.activeProductions.length < 1) {
      const b0 = busyTalentIds(s)
      const pk = (role: CreativeRole) => rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !b0.has(t.id)), role, rank)
      const w0 = pk('writer')[0], d0 = pk('director')[0], a0 = pk('actor'), c0 = pk('craft')[0]
      const cc = s.concepts[wConcept % s.concepts.length]!
      if (w0 && d0 && c0 && a0.length >= 3 && canAfford(s, Math.round(cc.baseNegativeCost) + 400_000).ok) {
        s = applyActions(s, [{ kind: 'greenlight', production: {
          conceptId: cc.id, shape: ARCH_SHAPES[shapeKey],
          promise: { genre: cc.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
          writerId: w0.id, directorId: d0.id, cast: { lead: a0[0]!.id, antagonist: a0[1]!.id, support: a0[2]!.id } as Record<CastSlot, string>, craftIds: [c0.id],
          budget: { negative: Math.round(cc.baseNegativeCost), marketing: 400_000 },
        } }])
        launched++; wConcept++
      }
    }
    s = tick(s, { develop: true })
  }
  for (let k = 0; k < TUNING.THEATRICAL_WEEKS + 2; k++) s = tick(s, { develop: true }) // let awareness settle
  const busy = busyTalentIds(s)
  const pick = (role: CreativeRole) =>
    rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)), role, rank)
  const w = pick('writer')[0], d = pick('director')[0], a = pick('actor'), c = pick('craft')[0]
  if (!w || !d || !c || a.length < 3) return null
  const concept = s.concepts[0]!
  const shape = ARCH_SHAPES[shapeKey]
  const negative = Math.round(concept.baseNegativeCost * negMult)
  if (!canAfford(s, negative + marketing).ok) return null
  const action = {
    kind: 'greenlight' as const,
    production: {
      conceptId: concept.id,
      shape,
      promise: { genre: concept.genre, intendedSegments: ['adult'] as SegmentId[], ranges: { intimacy: [-0.5, 0.5] as [number, number], tonalWeight: [-0.5, 0.5] as [number, number], kineticEnergy: [-0.5, 0.5] as [number, number] } },
      writerId: w.id, directorId: d.id, cast: { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>, craftIds: [c.id],
      budget: { negative, marketing },
    },
  }
  s = applyActions(s, [action])
  const id = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
  for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 4; k++) {
    s = tick(s, { develop: true })
    const run = s.theatricalRuns.find((r) => r.productionId === id)
    if (run && run.status !== 'active') break
  }
  const run = s.theatricalRuns.find((r) => r.productionId === id)
  if (!run) return null
  const gross = run.weeklyGross.reduce((x, y) => x + y, 0)
  const opening = run.weeklyGross[0] ?? 0
  return { contribution: gross * run.studioShare - (negative + marketing), opening, total: gross, legs: opening > 0 ? gross / opening : 0 }
}
function argmax<T>(items: T[], score: (t: T) => number): T {
  return items.reduce((best, t) => (score(t) > score(best) ? t : best), items[0]!)
}
function diversePackageGate(seeds: number) {
  const ranks: Rank[] = ['best', 'mid', 'cheapest'] // a representative slate is mostly ordinary, not all-star
  const shapes = Object.keys(ARCH_SHAPES) as ArchKey[]
  const warmups = [0, 4] // fresh studio vs one that has built audience awareness
  const rows: any[] = []
  for (const warmup of warmups) {
    for (const rank of ranks) {
      for (const shapeKey of shapes) {
        const medFor = (fn: (seed: string) => number | null) => {
          const xs: number[] = []
          for (let i = 0; i < seeds; i++) { const v = fn(`arch-${i}`); if (v !== null) xs.push(v) }
          return xs.length ? median(xs) : NaN
        }
        const mktContribs = MKT_LEVELS.map((mk) => ({ mk, contrib: medFor((seed) => archFilm(seed, shapeKey, rank, mk, 1.0, warmup)) }))
        const negContribs = NEG_TIERS.map((ng) => ({ ng, contrib: medFor((seed) => archFilm(seed, shapeKey, rank, 400_000, ng, warmup)) }))
        rows.push({
          warmup, rank, shape: shapeKey,
          marketingByLevel: mktContribs.map((x) => ({ marketing: x.mk, contribution: Math.round(x.contrib) })),
          profitMaxMarketing: argmax(mktContribs, (x) => x.contrib).mk,
          budgetByTier: negContribs.map((x) => ({ negMult: x.ng, contribution: Math.round(x.contrib) })),
          profitMaxNegMult: argmax(negContribs, (x) => x.contrib).ng,
        })
      }
    }
  }
  const n = rows.length
  const maxMktShare = rows.filter((r) => r.profitMaxMarketing === Math.max(...MKT_LEVELS)).length / n
  const negCounts: Record<string, number> = {}
  for (const r of rows) negCounts[r.profitMaxNegMult] = (negCounts[r.profitMaxNegMult] ?? 0) + 1
  const topNegShare = Math.max(...Object.values(negCounts)) / n
  const distinctMktOptima = new Set(rows.map((r) => r.profitMaxMarketing)).size
  const distinctNegOptima = new Set(rows.map((r) => r.profitMaxNegMult)).size
  return { rows, maxMarketingOptimalShare: r2(maxMktShare), topBudgetTierShare: r2(topNegShare), negOptimaCounts: negCounts, distinctMktOptima, distinctNegOptima }
}

// ── Stage 3A: ECONOMY_BOX_OFFICE_SCALE selection ──────────────────────────────
// Run the competent routes (A aggressive, B restrained) + the bargain stress (D) at each candidate
// scale, on the REAL engine (toggling the tuning constant in-process). Select the HIGHEST value that
// keeps money meaningfully constrained: competent 4-film median ~1.0–1.6×, p90 ≲ 2.0–2.25×, some runs
// below start, meaningful loss rate — WITHOUT collapsing the bargain lane into non-viability.
function scaleSelection(seeds: number) {
  const candidates = [0.65, 0.67, 0.68, 0.7]
  const scaleRoutes = [ROUTES[0]!, ROUTES[1]!, ROUTES[3]!] // A, B, D
  const table: any[] = []
  for (const scale of candidates) {
    const row: any = { scale, routes: {} as Record<string, any> }
    for (const st of scaleRoutes) {
      const runs = withTuning({ ECONOMY_BOX_OFFICE_SCALE: scale }, () => {
        const rs: RouteRun[] = []
        for (let i = 0; i < seeds; i++) rs.push(runFourFilms(`scale-${i}`, st))
        return rs
      })
      const mult = runs.map((r) => r.cashMultiple)
      const filmLoss = runs.flatMap((r) => r.films.map((f) => f.contribution < 0))
      row.routes[st.name] = {
        p10: r2(quantile(mult, 0.1)),
        median: r2(median(mult)),
        p90: r2(quantile(mult, 0.9)),
        lossPerFilm: r2(rate(filmLoss)),
        endBelowStart: r2(rate(runs.map((r) => r.endBelowStart))),
        atLeastOneLoss: r2(rate(runs.map((r) => r.films.some((f) => f.contribution < 0)))),
      }
    }
    table.push(row)
  }
  return table
}

// ── run everything ─────────────────────────────────────────────────────────────
mkdirSync(OUT, { recursive: true })
// eslint-disable-next-line no-console
console.log(`# [I] D-12 owner economy calibration study — ${SEEDS} seeds (INITIAL_CASH ${fmtM(INITIAL)}, share ${TUNING.STUDIO_RENTAL_BLENDED}, K ${TUNING.FAME_REACH_HALF_SAT})`)

// Stage 3A: scale selection (runs first so the digest leads with the decision).
const scaleTable = scaleSelection(Math.min(SEEDS, 100))
// eslint-disable-next-line no-console
console.log(`\n## Stage 3A — ECONOMY_BOX_OFFICE_SCALE selection (competent A/B + bargain D, 4-film)`)
for (const row of scaleTable) {
  // eslint-disable-next-line no-console
  console.log(`  scale ${row.scale}:`)
  for (const [name, m] of Object.entries(row.routes) as [string, any][]) {
    // eslint-disable-next-line no-console
    console.log(`    ${name.padEnd(24)} mult p10 ${m.p10}× med ${m.median}× p90 ${m.p90}×  loss/film ${(m.lossPerFilm * 100).toFixed(0)}%  ≥1loss ${(m.atLeastOneLoss * 100).toFixed(0)}%  end<start ${(m.endBelowStart * 100).toFixed(0)}%`)
  }
}
writeFileSync(join(OUT, 'scale-selection.json'), JSON.stringify(scaleTable, null, 2))

// Stage 3B/3C: diverse-package choice-quality gate.
const gate = diversePackageGate(Math.min(SEEDS, 80))
// eslint-disable-next-line no-console
console.log(`\n## Stage 3B/3C — diverse-package choice quality (talent × ambition)`)
for (const row of gate.rows) {
  // eslint-disable-next-line no-console
  console.log(`  w${row.warmup} ${row.rank.padEnd(8)} ${row.shape.padEnd(10)}  mkt→ ${row.marketingByLevel.map((m: any) => `${(m.marketing / 1e6).toFixed(1)}M:${(m.contribution / 1e6).toFixed(1)}`).join(' ')}  [max@${(row.profitMaxMarketing / 1e6).toFixed(1)}M]   budget→ ${row.budgetByTier.map((b: any) => `${b.negMult}:${(b.contribution / 1e6).toFixed(1)}`).join(' ')}  [max@${row.profitMaxNegMult}]`)
}
// eslint-disable-next-line no-console
console.log(`  max-marketing optimal in ${(gate.maxMarketingOptimalShare * 100).toFixed(0)}% of packages (target ≤35%); distinct marketing optima ${gate.distinctMktOptima}`)
// eslint-disable-next-line no-console
console.log(`  top budget tier optimal in ${(gate.topBudgetTierShare * 100).toFixed(0)}% (target ≤70%); budget optima ${JSON.stringify(gate.negOptimaCounts)}; distinct ${gate.distinctNegOptima}`)
writeFileSync(join(OUT, 'choice-quality-gate.json'), JSON.stringify(gate, null, 2))

// §7: rational competent bot (best-talent + mid-talent), package-specific tier selection.
const rational = [rationalRouteReport(Math.min(SEEDS, 150), 'best'), rationalRouteReport(Math.min(SEEDS, 150), 'mid')]
// eslint-disable-next-line no-console
console.log(`\n## §7 — rational competent bot (package-specific Marketing + Budget)`)
for (const r of rational) {
  // eslint-disable-next-line no-console
  console.log(`  ${r.rank}: 4-film mult p10 ${r.cashMultiple.p10}× med ${r.cashMultiple.median}× p90 ${r.cashMultiple.p90}×  loss/film ${(r.lossRatePerFilm * 100).toFixed(0)}%  ≥1loss ${(r.atLeastOneLoss * 100).toFixed(0)}%  end<start ${(r.endBelowStart * 100).toFixed(0)}%  breakout ${(r.breakoutRate * 100).toFixed(0)}%`)
  // eslint-disable-next-line no-console
  console.log(`     marketing picks ${JSON.stringify(r.marketingTierDist)}  budget picks ${JSON.stringify(r.budgetTierDist)}`)
}
writeFileSync(join(OUT, 'rational-routes.json'), JSON.stringify(rational, null, 2))

// §12: weak-film routes — the weakest legal package + a weak commercially-positioned package.
const weakFilms = [
  weakFilmReport(Math.min(SEEDS, 120), 'ordinary', 100_000, 1.25, 'weakest-legal (cheapest, generous budget, small mkt)'),
  weakFilmReport(Math.min(SEEDS, 120), 'demanding', 400_000, 1.0, 'weak-commercial (cheapest, demanding, standard mkt)'),
]
// eslint-disable-next-line no-console
console.log(`\n## Weak-film routes (§12)`)
for (const w of weakFilms) {
  // eslint-disable-next-line no-console
  console.log(`  ${w.label}:  contribution p10 ${fmtM(w.contribution.p10)} med ${fmtM(w.contribution.median)} p90 ${fmtM(w.contribution.p90)}  LOSS ${(w.lossProbability * 100).toFixed(0)}%  legs(med) ${w.legsMedian}`)
}
writeFileSync(join(OUT, 'weak-films.json'), JSON.stringify(weakFilms, null, 2))

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
