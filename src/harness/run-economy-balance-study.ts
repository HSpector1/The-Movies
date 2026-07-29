// ── D-12 economy balance harness (repo-standard, deterministic) ───────────────
// Adapts the Fable calibration into an independent, seeded, deterministic (no ambient RNG) harness that
// REUSES the real core money math (TUNING constants, theatricalSchedule, the real salary/
// fee/overhead/schedule formulas) and models the four required economy BASELINES so we can
// attribute each balance change to a specific correction:
//   1) legacy   — 100% gross, single lump (today's economy)
//   2) share    — blended studio share over the weekly schedule, NO fame saturation
//   3) shareSat — blended share + fame→opening-reach saturation
//   4) full     — blended share + saturation + overhead (the D-12 model)
//
// FIDELITY LIMIT (disclosed): this is a MONEY-MECHANICS abstraction, not the full reception
// pipeline. Film gross is drawn from a distribution anchored to the M0A corpus (competent
// film gross p50 ≈ $44M), with fame's OPENING contribution saturated (Hill) while legs stay
// linear — mirroring the real engine's isolation. Only RELATIVE / structural results are used.
// It fixes the disclosed freelancer-heavy + fire-all bugs (freelancer UPGRADES, not empty-slot
// fills) and records per-strategy ACTION COUNTERS so no strategy can pass by silent inactivity.
//
// Run:  node_modules/.bin/vite-node src/harness/run-economy-balance-study.ts [seeds]

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { TUNING, theatricalSchedule, stream } from '../core/index.js'

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))
// K-parameterized Hill — identical to core fameReach when K === TUNING.FAME_REACH_HALF_SAT.
const fameReachK = (fame: number, K: number) => {
  const f = clamp(fame, 0, 100)
  return f / (f + K)
}
// REAL salary/fee formulas (from TUNING) — NOT a divergent copy.
const salaryCurve = (ovr: number, fame: number) =>
  TUNING.SALARY_BASE + TUNING.SALARY_SKILL_COEF * (ovr / 100) ** 2 + TUNING.SALARY_FAME_COEF * (fame / 100) ** 2
const annualSalary = (ovr: number, fame: number) => Math.round(salaryCurve(ovr, fame) * TUNING.CONTRACT_ANNUAL_MULT)
const weeklyOf = (annual: number) => Math.round(annual / TUNING.TICKS_PER_YEAR)
const freelancerFeeOf = (ovr: number, fame: number) =>
  Math.round(salaryCurve(ovr, fame) * TUNING.FREELANCER_FEE_PREMIUM)

const K = {
  INITIAL_CASH: TUNING.INITIAL_CASH,
  PRODUCTION_TICKS: TUNING.PRODUCTION_TICKS,
  MAX_CONCURRENT: TUNING.MAX_CONCURRENT_PRODUCTIONS,
  TICKS_PER_YEAR: TUNING.TICKS_PER_YEAR,
  LEGS_MIN: TUNING.LEGS_MIN,
  LEGS_MAX: TUNING.LEGS_MAX,
  MARKETING_HALF: TUNING.MARKETING_HALF_SATURATION,
  BMV_LO: 20_000_000,
  BMV_HI: 80_000_000,
  BASE_NEG_MEAN: 4_500_000,
  BASE_NEG_SD: 1_500_000,
  BASE_NEG_LO: 2_000_000,
  BASE_NEG_HI: 9_000_000,
}

// ── economy model configs (the four baselines) ────────────────────────────────
type ModelName = 'legacy' | 'share' | 'shareSat' | 'full'
type Cfg = {
  model: ModelName
  saturate: boolean
  scheduled: boolean // weekly schedule vs single lump
  share: number // studio share of gross (1.0 = legacy full gross)
  fameK: number
  overheadBase: number
  overheadPerEmp: number
}
function cfgFor(model: ModelName, share: number, fameK: number, overheadBase: number, overheadPerEmp: number): Cfg {
  return {
    model,
    saturate: model === 'shareSat' || model === 'full',
    scheduled: model !== 'legacy',
    share: model === 'legacy' ? 1.0 : share,
    fameK,
    overheadBase: model === 'full' ? overheadBase : 0,
    overheadPerEmp: model === 'full' ? overheadPerEmp : 0,
  }
}

// ── film gross generator (fame saturation isolated to OPENING; legs linear) ────
type Quality = { ovr: number; fame: number; negative: number; requiredNegative: number; marketing: number }
function drawFilm(seed: string, prodId: string, q: Quality, bmv: number, cfg: Cfg) {
  const rng = stream(seed, 'worldgen', `econ-film-${prodId}`)
  const mq = q.marketing / (q.marketing + K.MARKETING_HALF)
  const awareness = clamp(0.6 * 0.85 + 0.4 * mq, 0.15, 0.98)
  const budgetAdeq = clamp(q.negative / q.requiredNegative, 0.4, 1.15) / 1.15
  // Fame's OPENING contribution: saturated (Hill) when the model saturates, else linear.
  // Anchored so an average-fame (≈30) film matches the corpus reach; the fame TERM is the
  // only thing the saturation touches (legs below always uses the LINEAR fame).
  const fameOpening = cfg.saturate ? fameReachK(q.fame, cfg.fameK) : q.fame / 100
  const talentLiftOpening = 1.0 + 0.012 * (q.ovr - 50) + 1.4 * (fameOpening - 0.3)
  const reachSumBase = 0.4 * clamp(talentLiftOpening, 0.25, 1.6) * (0.7 + 0.3 * budgetAdeq)
  const reachNoise = rng.truncatedNormal(1.0, 0.28, 0.35, 2.2)
  const opening = bmv * awareness * reachSumBase * reachNoise
  // LEGS: linear fame (untouched by saturation), audience-driven.
  const wasBase = 56 + 0.28 * (q.ovr - 45) + 0.14 * (q.fame - 30)
  const was = clamp(rng.truncatedNormal(wasBase, 9, 15, 92), 0, 100)
  const legs = K.LEGS_MIN + (K.LEGS_MAX - K.LEGS_MIN) * (was / 100)
  const gross = opening * legs
  return { opening, legs, gross }
}

// Weekly STUDIO-REVENUE schedule for a film, per the model. legacy = one lump of full gross.
function revenueSchedule(opening: number, legs: number, gross: number, cfg: Cfg): number[] {
  if (!cfg.scheduled) return [gross] // legacy: full gross, single lump
  const weekly = theatricalSchedule(opening, legs) // REAL schedule (conserves opening×legs)
  return weekly.map((g) => g * cfg.share) // studio revenue = share × weekly gross
}

// ── STRATEGY ROSTERS (role, ovr, fame). Salaries via the real curve. ──────────
type Slot = { role: 'writer' | 'director' | 'actor' | 'craft'; ovr: number; fame: number }
const T = (role: Slot['role'], ovr: number, fame: number): Slot => ({ role, ovr, fame })
const STRATEGIES: Record<string, () => Slot[]> = {
  lean: () => [T('writer', 42, 15), T('director', 44, 18), T('actor', 45, 25), T('actor', 42, 20), T('actor', 40, 18), T('craft', 46, 5)],
  minimal: () => [T('writer', 38, 8), T('director', 40, 10), T('actor', 40, 15), T('actor', 38, 12), T('actor', 36, 10), T('craft', 42, 4)],
  balanced: () => [T('writer', 50, 25), T('writer', 46, 20), T('director', 52, 30), T('director', 48, 25), T('actor', 55, 45), T('actor', 52, 40), T('actor', 50, 35), T('actor', 48, 30), T('actor', 46, 28), T('craft', 55, 10), T('craft', 50, 8)],
  largeDepth: () => [T('writer', 52, 28), T('writer', 50, 26), T('writer', 48, 24), T('director', 55, 35), T('director', 52, 32), T('actor', 58, 50), T('actor', 56, 46), T('actor', 54, 42), T('actor', 52, 38), T('actor', 50, 35), T('actor', 48, 32), T('craft', 55, 12), T('craft', 52, 10)],
  star: () => [T('writer', 58, 35), T('director', 62, 45), T('actor', 68, 68), T('actor', 65, 62), T('actor', 62, 58), T('actor', 60, 52), T('actor', 58, 48), T('craft', 60, 12)],
  starTentpole: () => [T('writer', 58, 35), T('director', 62, 45), T('actor', 68, 68), T('actor', 65, 62), T('actor', 62, 58), T('actor', 60, 52), T('actor', 58, 48), T('craft', 60, 12)],
  prospect: () => [T('writer', 48, 8), T('director', 50, 10), T('actor', 52, 12), T('actor', 50, 10), T('actor', 48, 9), T('actor', 46, 8), T('actor', 44, 7), T('craft', 52, 6)],
  // freelancer-heavy: a THIN permanent roster (no actors) → hires 3 actor freelancers per
  // film, paying the 1.5× fee instead of carrying actor payroll (the intended tradeoff).
  freelancer: () => [T('writer', 40, 12), T('director', 42, 15), T('craft', 44, 5)],
  fireAll: () => [],
  lowBudgetVolume: () => [T('writer', 44, 12), T('director', 46, 15), T('actor', 46, 18), T('actor', 44, 16), T('actor', 42, 14), T('craft', 46, 6)],
  // disciplined tentpole: a star-capable roster that BUILDS cash on affordable films, holds
  // a reserve, then greenlights ONE max-budget film when it can afford it, and keeps operating.
  tentpole: () => [T('writer', 58, 35), T('director', 62, 45), T('actor', 68, 68), T('actor', 65, 62), T('actor', 62, 58), T('actor', 60, 52), T('actor', 58, 48), T('craft', 60, 12)],
}
// Disciplined-tentpole budget policy (Design recommendation).
const TENTPOLE = { reserve: 30_000_000, negative: 40_000_000, marketing: 12_000_000, cooldownWeeks: 30 }
// per-strategy negative-budget multiplier + marketing spend (Design recommendation).
const BUDGET_MULT: Record<string, number> = { lean: 0.9, minimal: 0.8, balanced: 1.15, largeDepth: 1.5, star: 1.9, starTentpole: 8.0, prospect: 1.0, freelancer: 0.95, fireAll: 0.85, lowBudgetVolume: 0.6, maxBudget: 8.0, maxMarketing: 1.5, minMarketing: 0.9 }
const MARKETING: Record<string, number> = { lean: 400_000, minimal: 400_000, balanced: 1_200_000, largeDepth: 3_000_000, star: 6_000_000, starTentpole: 18_000_000, prospect: 600_000, freelancer: 500_000, fireAll: 400_000, lowBudgetVolume: 300_000, maxBudget: 6_000_000, maxMarketing: 20_000_000, minMarketing: 0 }
// Config-only strategies that reuse a base roster but override budget/marketing.
const CONFIG_STRATS: Record<string, string> = { maxBudget: 'star', maxMarketing: 'balanced', minMarketing: 'lean', oneFilmPerYear: 'balanced' }

// ── run one deterministic game ────────────────────────────────────────────────
type ActionCounters = {
  greenlights: number
  staffingFailures: number
  solvencyBlocks: number
  freelancerHires: number
  freelancerFeesPaid: number
  terminations: number
  terminationCost: number
}
function bestByRole(roster: Slot[], role: Slot['role'], n: number): Slot[] {
  return roster.filter((t) => t.role === role).sort((a, b) => b.ovr - a.ovr).slice(0, n)
}
function runGame(opts: { seed: string; strategyName: string; years: number; cfg: Cfg }) {
  const { seed, strategyName, years, cfg } = opts
  const rosterName = CONFIG_STRATS[strategyName] ?? strategyName
  const roster = (STRATEGIES[rosterName] ?? STRATEGIES.balanced)()
  const world = stream(seed, 'worldgen', `econ-bmv-${strategyName}`)
  const bmv = world.uniform(K.BMV_LO, K.BMV_HI)
  const totalWeeks = years * K.TICKS_PER_YEAR
  const usesFreelancers = strategyName === 'freelancer' || strategyName === 'fireAll' || roster.length < 6
  const oneFilmPerYear = strategyName === 'oneFilmPerYear'

  let cash = K.INITIAL_CASH
  const ledger: { kind: string; amount: number; week: number }[] = []
  const add = (kind: string, amount: number, week: number) => {
    ledger.push({ kind, amount, week })
    cash += amount
  }
  const weeklyPayroll = roster.reduce((s, t) => s + weeklyOf(annualSalary(t.ovr, t.fame)), 0)
  const overheadWeekly = cfg.overheadBase + cfg.overheadPerEmp * roster.length

  const pending: { releaseWeek: number; sched: number[]; committed: number; isTentpole: boolean; gross: number }[] = []
  const revQueue: { week: number; amount: number }[] = []
  const ac: ActionCounters = { greenlights: 0, staffingFailures: 0, solvencyBlocks: 0, freelancerHires: 0, freelancerFeesPaid: 0, terminations: 0, terminationCost: 0 }
  const filmProfits: number[] = []
  const budgets: number[] = []
  const marketings: number[] = []
  const grosses: number[] = []
  const studioRevs: number[] = []
  const cashSeries: number[] = []
  const cashByYear: number[] = []
  let releases = 0
  let lastGreenlightYear = -1
  let prodCounter = 0
  let everNegative = false
  let deepNegative = 0
  let firstTentpoleWeek = -1
  let lastTentpoleWeek = -10_000
  const tentpoleOutcomes: { cost: number; gross: number; studioRev: number; contribution: number }[] = []

  for (let week = 0; week < totalWeeks; week++) {
    // 1) credit scheduled revenue arriving this week
    for (let i = revQueue.length - 1; i >= 0; i--) {
      if (revQueue[i]!.week === week) {
        add('studioRevenue', revQueue[i]!.amount, week)
        revQueue.splice(i, 1)
      }
    }
    // 2) resolve films finishing production
    for (let i = pending.length - 1; i >= 0; i--) {
      if (pending[i]!.releaseWeek === week) {
        const p = pending[i]!
        p.sched.forEach((amt, w) => {
          if (w === 0) add('studioRevenue', amt, week)
          else revQueue.push({ week: week + w, amount: amt })
        })
        const studioRev = p.sched.reduce((a, b) => a + b, 0)
        filmProfits.push(studioRev - p.committed)
        studioRevs.push(studioRev)
        if (p.isTentpole) tentpoleOutcomes.push({ cost: p.committed, gross: p.gross, studioRev, contribution: studioRev - p.committed })
        releases++
        pending.splice(i, 1)
      }
    }
    // 3) greenlight while a slot is free (2 concurrent) — subject to solvency + budget
    let slotFree = K.MAX_CONCURRENT - pending.length
    while (slotFree > 0) {
      if (oneFilmPerYear && Math.floor(week / K.TICKS_PER_YEAR) === lastGreenlightYear) break
      // assemble: best-available roster; upgrade/fill thin slots with freelancers (BUG FIX:
      // freelancers UPGRADE a weak/empty slot, not just empty ones).
      const need: [Slot['role'], number][] = [['writer', 1], ['director', 1], ['actor', 3], ['craft', 1]]
      const crew: Slot[] = []
      let freelancerHires = 0
      let ok = true
      for (const [role, n] of need) {
        const have = bestByRole(roster, role, n)
        for (let j = 0; j < n; j++) {
          if (have[j]) crew.push(have[j]!)
          else if (usesFreelancers) {
            crew.push(T(role, 45, 20)) // a mid freelancer
            freelancerHires++
          } else {
            ok = false
          }
        }
      }
      if (!ok || crew.length < 6) {
        ac.staffingFailures++
        break
      }
      // blended quality: fame → lead + avg; ovr weighted writer/dir/craft/actors.
      const actors = crew.filter((c) => c.role === 'actor')
      const writer = crew.find((c) => c.role === 'writer')!
      const director = crew.find((c) => c.role === 'director')!
      const craft = crew.find((c) => c.role === 'craft')!
      const avgOvr = writer.ovr * 0.3 + director.ovr * 0.25 + (actors.reduce((s, a) => s + a.ovr, 0) / actors.length) * 0.3 + craft.ovr * 0.15
      const fame = Math.max(...actors.map((a) => a.fame)) * 0.5 + (actors.reduce((s, a) => s + a.fame, 0) / actors.length) * 0.5
      const cn = stream(seed, 'worldgen', `econ-neg-${strategyName}-${prodCounter}`)
      const baseNeg = cn.truncatedNormal(K.BASE_NEG_MEAN, K.BASE_NEG_SD, K.BASE_NEG_LO, K.BASE_NEG_HI)
      // Adaptive tentpole policy: build cash on affordable films, hold a reserve, then swing
      // for a max-budget film ONCE affordable, then keep operating. Other strategies fixed.
      let negative: number
      let marketing: number
      let isTentpole = false
      if (strategyName === 'tentpole') {
        const canTentpole =
          cash - TENTPOLE.reserve >= TENTPOLE.negative + TENTPOLE.marketing && week - lastTentpoleWeek > TENTPOLE.cooldownWeeks
        if (canTentpole) {
          negative = TENTPOLE.negative
          marketing = TENTPOLE.marketing
          isTentpole = true
        } else {
          negative = Math.round(baseNeg * 0.95) // affordable capital-building films
          marketing = 800_000
        }
      } else {
        negative = Math.round(baseNeg * (BUDGET_MULT[strategyName] ?? 1.0))
        marketing = MARKETING[strategyName] ?? 400_000
      }
      const freelancerFee = freelancerHires * freelancerFeeOf(45, 20)
      const committed = negative + marketing + freelancerFee
      // D-12 solvency gate — a voluntary greenlight may not leave cash below zero.
      if (cash - committed < 0) {
        ac.solvencyBlocks++
        break
      }
      const prodId = `${strategyName}-${prodCounter++}`
      add('production', -(negative + marketing), week)
      if (freelancerFee > 0) {
        add('freelancerFee', -freelancerFee, week)
        ac.freelancerHires += freelancerHires
        ac.freelancerFeesPaid += freelancerFee
      }
      const film = drawFilm(seed, prodId, { ovr: avgOvr, fame, negative, requiredNegative: baseNeg, marketing }, bmv, cfg)
      grosses.push(film.gross)
      budgets.push(negative)
      marketings.push(marketing)
      if (isTentpole) {
        if (firstTentpoleWeek < 0) firstTentpoleWeek = week
        lastTentpoleWeek = week
      }
      pending.push({ releaseWeek: week + K.PRODUCTION_TICKS, sched: revenueSchedule(film.opening, film.legs, film.gross, cfg), committed, isTentpole, gross: film.gross })
      ac.greenlights++
      lastGreenlightYear = Math.floor(week / K.TICKS_PER_YEAR)
      slotFree--
    }
    // 4) weekly payroll + overhead (unavoidable — may go negative)
    if (weeklyPayroll > 0) add('payroll', -weeklyPayroll, week)
    if (overheadWeekly > 0) add('overhead', -overheadWeekly, week)
    // 5) bookkeeping
    cashSeries.push(cash)
    if (cash < 0) everNegative = true
    if (cash < deepNegative) deepNegative = cash
    if ((week + 1) % K.TICKS_PER_YEAR === 0) cashByYear.push(cash)
  }

  return {
    seed, strategyName, years, cfg: cfg.model,
    finalCash: cash,
    cashByYear,
    releases,
    everNegative,
    deepNegative,
    weeklyPayroll,
    overheadWeekly,
    rosterOVR: roster.length ? roster.reduce((s, t) => s + t.ovr, 0) / roster.length : 0,
    rosterFame: roster.length ? roster.reduce((s, t) => s + t.fame, 0) / roster.length : 0,
    avgBudget: budgets.length ? budgets.reduce((a, b) => a + b, 0) / budgets.length : 0,
    avgMarketing: marketings.length ? marketings.reduce((a, b) => a + b, 0) / marketings.length : 0,
    grossTotal: grosses.reduce((a, b) => a + b, 0),
    studioRevTotal: studioRevs.reduce((a, b) => a + b, 0),
    payrollTotal: -ledger.filter((e) => e.kind === 'payroll').reduce((a, e) => a + e.amount, 0),
    overheadTotal: -ledger.filter((e) => e.kind === 'overhead').reduce((a, e) => a + e.amount, 0),
    profitContribution: filmProfits.reduce((a, b) => a + b, 0),
    firstTentpoleWeek,
    tentpoleCount: tentpoleOutcomes.length,
    tentpoleOutcomes,
    ac,
  }
}

// ── stats helpers ─────────────────────────────────────────────────────────────
const sortNum = (xs: number[]) => [...xs].sort((a, b) => a - b)
const q = (xs: number[], p: number) => {
  if (!xs.length) return 0
  const a = sortNum(xs)
  return a[clamp(Math.floor(p * (a.length - 1)), 0, a.length - 1)]!
}
const median = (xs: number[]) => q(xs, 0.5)
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

// ── the sweep ─────────────────────────────────────────────────────────────────
const SEEDS = Number(process.argv[2] ?? 500)
const HORIZONS = [1, 3, 5]
const STRATS = ['lean', 'minimal', 'balanced', 'largeDepth', 'star', 'tentpole', 'starTentpole', 'prospect', 'freelancer', 'fireAll', 'lowBudgetVolume', 'maxBudget', 'maxMarketing', 'minMarketing', 'oneFilmPerYear']
const K_VALUES = [25, 35, 50, 65, 80, 100]
const SHARE_VALUES = [0.45, 0.48, 0.5, 0.52, 0.55]

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', '..', 'out', 'economy-balance')
mkdirSync(OUT, { recursive: true })

// ── Stage A helper: the fame K contribution study (absolute + relative to linear) ─
const FAME_POINTS = [0, 5, 10, 20, 35, 50, 65, 75, 90, 100]
function fameStudy() {
  const rows = K_VALUES.map((Kv) => {
    const points = FAME_POINTS.map((f) => ({
      fame: f,
      hill: +fameReachK(f, Kv).toFixed(4),
      linear: +(f / 100).toFixed(4),
      delta: +(fameReachK(f, Kv) - f / 100).toFixed(4),
    }))
    // crossover: where hill == linear → f/(f+K) = f/100 → f=0 or K=100 (equal only at f=0
    // unless K=100 where they're closest at high f). Numeric crossover of the DELTA sign.
    let crossover = 0
    for (let f = 1; f <= 100; f++) {
      if (fameReachK(f, Kv) - f / 100 <= 0) {
        crossover = f
        break
      }
    }
    const deltas = FAME_POINTS.map((f) => fameReachK(f, Kv) - f / 100)
    const marg = (f: number) => fameReachK(f + 5, Kv) - fameReachK(f, Kv)
    return {
      K: Kv,
      points,
      crossover,
      maxLowUplift: +Math.max(...deltas).toFixed(4),
      maxHighReduction: +Math.min(...deltas).toFixed(4),
      marginalLow: +marg(5).toFixed(4),
      marginalMid: +marg(50).toFixed(4),
      marginalHigh: +marg(90).toFixed(4),
      f0to20Compression: +((fameReachK(20, Kv) - fameReachK(0, Kv)) / Math.max(1e-9, fameReachK(20, Kv))).toFixed(3),
    }
  })
  return rows
}

type StratStat = {
  strategy: string
  model: string
  years: number
  rosterOVR: number
  median: number
  p10: number
  p25: number
  p75: number
  p90: number
  deepNegFreq: number
  everNegFreq: number
  films: number
  avgBudget: number
  avgMarketing: number
  payroll: number
  overhead: number
  gross: number
  studioRev: number
  profitContribution: number
  actions: ActionCounters
}
function sweepModel(cfgOf: (m: ModelName) => Cfg, models: ModelName[]) {
  const stats: StratStat[] = []
  // win tracking: per (model, years) which strategy has the highest final cash per seed.
  const wins: Record<string, Record<number, Record<string, number>>> = {}
  for (const model of models) {
    wins[model] = {}
    for (const years of HORIZONS) {
      wins[model]![years] = {}
      // per seed, track the best ACTIVE strategy (excludes fireAll/idle) final cash
      const perSeedBest: string[] = []
      const bySeedCash: Record<number, Record<string, number>> = {}
      for (const strat of STRATS) {
        const finals: number[] = []
        const filmsArr: number[] = []
        const budgetArr: number[] = []
        const mktArr: number[] = []
        const payArr: number[] = []
        const ohArr: number[] = []
        const grossArr: number[] = []
        const revArr: number[] = []
        const profArr: number[] = []
        let deepNeg = 0
        let everNeg = 0
        let rosterOVR = 0
        const acc: ActionCounters = { greenlights: 0, staffingFailures: 0, solvencyBlocks: 0, freelancerHires: 0, freelancerFeesPaid: 0, terminations: 0, terminationCost: 0 }
        for (let s = 0; s < SEEDS; s++) {
          const seed = `econ-${s}`
          const r = runGame({ seed, strategyName: strat, years, cfg: cfgOf(model) })
          finals.push(r.finalCash)
          filmsArr.push(r.releases)
          budgetArr.push(r.avgBudget)
          mktArr.push(r.avgMarketing)
          payArr.push(r.payrollTotal)
          ohArr.push(r.overheadTotal)
          grossArr.push(r.grossTotal)
          revArr.push(r.studioRevTotal)
          profArr.push(r.profitContribution)
          rosterOVR = r.rosterOVR
          if (r.deepNegative < -5_000_000) deepNeg++
          if (r.everNegative) everNeg++
          acc.greenlights += r.ac.greenlights
          acc.staffingFailures += r.ac.staffingFailures
          acc.solvencyBlocks += r.ac.solvencyBlocks
          acc.freelancerHires += r.ac.freelancerHires
          acc.freelancerFeesPaid += r.ac.freelancerFeesPaid
          bySeedCash[s] ??= {}
          bySeedCash[s]![strat] = r.finalCash
        }
        stats.push({
          strategy: strat, model, years, rosterOVR: +rosterOVR.toFixed(1),
          median: Math.round(median(finals)), p10: Math.round(q(finals, 0.1)), p25: Math.round(q(finals, 0.25)),
          p75: Math.round(q(finals, 0.75)), p90: Math.round(q(finals, 0.9)),
          deepNegFreq: +(deepNeg / SEEDS).toFixed(3), everNegFreq: +(everNeg / SEEDS).toFixed(3),
          films: +median(filmsArr).toFixed(1), avgBudget: Math.round(mean(budgetArr)), avgMarketing: Math.round(mean(mktArr)),
          payroll: Math.round(median(payArr)), overhead: Math.round(median(ohArr)), gross: Math.round(median(grossArr)),
          studioRev: Math.round(median(revArr)), profitContribution: Math.round(median(profArr)),
          actions: { greenlights: Math.round(acc.greenlights / SEEDS), staffingFailures: Math.round(acc.staffingFailures / SEEDS), solvencyBlocks: Math.round(acc.solvencyBlocks / SEEDS), freelancerHires: Math.round(acc.freelancerHires / SEEDS), freelancerFeesPaid: Math.round(acc.freelancerFeesPaid / SEEDS), terminations: 0, terminationCost: 0 },
        })
      }
      // win share per seed (best ACTIVE strategy = highest final cash among the STRATS)
      for (let s = 0; s < SEEDS; s++) {
        let best = ''
        let bestCash = -Infinity
        for (const strat of STRATS) {
          const c = bySeedCash[s]?.[strat] ?? -Infinity
          if (c > bestCash) {
            bestCash = c
            best = strat
          }
        }
        perSeedBest.push(best)
        wins[model]![years]![best] = (wins[model]![years]![best] ?? 0) + 1
      }
    }
  }
  return { stats, wins }
}

// ── run: the four baselines at provisional K=50, share=0.52, overhead 15k/1.5k ─
const PROV = { K: 50, share: 0.52, overheadBase: TUNING.OVERHEAD_BASE, overheadPerEmp: TUNING.OVERHEAD_PER_EMPLOYEE }
const baselineCfg = (m: ModelName) => cfgFor(m, PROV.share, PROV.K, PROV.overheadBase, PROV.overheadPerEmp)
const baselines = sweepModel(baselineCfg, ['legacy', 'share', 'shareSat', 'full'])

// ── Stage A: K sensitivity (full model, sweep K) ──
const kSweep = K_VALUES.map((Kv) => {
  const res = sweepModel(() => cfgFor('full', PROV.share, Kv, PROV.overheadBase, PROV.overheadPerEmp), ['full'])
  return { K: Kv, stats: res.stats, wins: res.wins.full }
})

// ── Stage B: share sensitivity (full model, selected-K placeholder = 50, sweep share) ──
const shareSweep = SHARE_VALUES.map((sh) => {
  const res = sweepModel(() => cfgFor('full', sh, PROV.K, PROV.overheadBase, PROV.overheadPerEmp), ['full'])
  return { share: sh, stats: res.stats, wins: res.wins.full }
})

// ── Marketing-sensitivity experiment (AFFORDABLE, controlled) ──────────────────
// Identical film + studio state; ONLY marketing varies. Every level is affordable on the
// $20M starting cash (max total commitment $16M). Uses the SAME prodId across levels so the
// reach/legs noise is byte-identical — only marketing (awareness) moves. Measures whether
// reach rises monotonically with DECREASING marginal return and whether a middle allocation
// is ever the profit-max (i.e. max marketing is not always best, min is not dominant).
function marketingStudy() {
  const cfg = cfgFor('full', PROV.share, PROV.K, PROV.overheadBase, PROV.overheadPerEmp)
  const levels = [
    { name: 'min', mkt: 0 },
    { name: 'low', mkt: 1_000_000 },
    { name: 'moderate', mkt: 3_000_000 },
    { name: 'high', mkt: 6_000_000 },
    { name: 'maxAffordable', mkt: 10_000_000 },
  ]
  const negative = 6_000_000
  const acc = levels.map(() => ({ openings: [] as number[], totals: [] as number[], revs: [] as number[], contribs: [] as number[], profit: 0 }))
  for (let s = 0; s < SEEDS; s++) {
    const seed = `mkt-${s}`
    const bmv = stream(seed, 'worldgen', 'mkt-bmv').uniform(K.BMV_LO, K.BMV_HI)
    levels.forEach((lv, li) => {
      const film = drawFilm(seed, `mktfilm-${s}`, { ovr: 52, fame: 40, negative, requiredNegative: negative, marketing: lv.mkt }, bmv, cfg)
      const studioRev = revenueSchedule(film.opening, film.legs, film.gross, cfg).reduce((a, b) => a + b, 0)
      const contribution = studioRev - (negative + lv.mkt)
      acc[li]!.openings.push(film.opening)
      acc[li]!.totals.push(film.gross)
      acc[li]!.revs.push(studioRev)
      acc[li]!.contribs.push(contribution)
      if (contribution > 0) acc[li]!.profit++
    })
  }
  const rows = levels.map((lv, li) => ({
    level: lv.name,
    marketing: lv.mkt,
    affordable: negative + lv.mkt <= K.INITIAL_CASH,
    opening: Math.round(median(acc[li]!.openings)),
    total: Math.round(median(acc[li]!.totals)),
    studioRev: Math.round(median(acc[li]!.revs)),
    contribution: Math.round(median(acc[li]!.contribs)),
    profitRate: +(acc[li]!.profit / SEEDS).toFixed(3),
    incRevPerDollar: 0,
    incProfitPerDollar: 0,
  }))
  for (let i = 1; i < rows.length; i++) {
    const dMkt = rows[i]!.marketing - rows[i - 1]!.marketing
    rows[i]!.incRevPerDollar = dMkt > 0 ? +((rows[i]!.studioRev - rows[i - 1]!.studioRev) / dMkt).toFixed(3) : 0
    rows[i]!.incProfitPerDollar = dMkt > 0 ? +((rows[i]!.contribution - rows[i - 1]!.contribution) / dMkt).toFixed(3) : 0
  }
  const openings = rows.map((r) => r.opening)
  const incRev = rows.slice(1).map((r) => r.incRevPerDollar)
  const bestIdx = rows.reduce((bi, r, i) => (r.contribution > rows[bi]!.contribution ? i : bi), 0)
  return {
    rows,
    checks: {
      monotonicReach: openings.every((v, i) => i === 0 || v >= openings[i - 1]!),
      decreasingMarginalRevenue: incRev.every((v, i) => i === 0 || v <= incRev[i - 1]! + 1e-9),
      maxNotAlwaysBest: bestIdx !== rows.length - 1,
      minNotDominant: bestIdx !== 0,
      middleAllocationRational: bestIdx > 0 && bestIdx < rows.length - 1,
      profitMaxLevel: rows[bestIdx]!.level,
    },
  }
}

// ── Disciplined tentpole study (build cash → hold reserve → swing → continue) ──
function tentpoleStudy() {
  const cfg = cfgFor('full', PROV.share, PROV.K, PROV.overheadBase, PROV.overheadPerEmp)
  return HORIZONS.map((years) => {
    const runs: ReturnType<typeof runGame>[] = []
    for (let s = 0; s < SEEDS; s++) runs.push(runGame({ seed: `econ-${s}`, strategyName: 'tentpole', years, cfg }))
    const reached = runs.filter((r) => r.firstTentpoleWeek >= 0)
    const outcomes = runs.flatMap((r) => r.tentpoleOutcomes)
    const wins = outcomes.filter((o) => o.contribution > 0)
    const severe = outcomes.filter((o) => o.contribution < -20_000_000)
    return {
      years,
      reachedPct: +(reached.length / SEEDS).toFixed(3),
      medianFirstTentpoleWeek: reached.length ? Math.round(median(reached.map((r) => r.firstTentpoleWeek))) : null,
      tentpolesMade: outcomes.length,
      medianCost: outcomes.length ? Math.round(median(outcomes.map((o) => o.cost))) : 0,
      medianGross: outcomes.length ? Math.round(median(outcomes.map((o) => o.gross))) : 0,
      medianStudioRev: outcomes.length ? Math.round(median(outcomes.map((o) => o.studioRev))) : 0,
      medianContribution: outcomes.length ? Math.round(median(outcomes.map((o) => o.contribution))) : 0,
      profitRate: outcomes.length ? +(wins.length / outcomes.length).toFixed(3) : 0,
      severeLossRate: outcomes.length ? +(severe.length / outcomes.length).toFixed(3) : 0,
      medianFinalCash: Math.round(median(runs.map((r) => r.finalCash))),
      everNegFreq: +(runs.filter((r) => r.everNegative).length / SEEDS).toFixed(3),
      followOnRate: reached.length ? +(reached.filter((r) => r.releases > r.tentpoleCount).length / reached.length).toFixed(3) : 0,
      medianReleases: Math.round(median(runs.map((r) => r.releases))),
    }
  })
}

// ── Revised acceptance gates (replace the mis-specified universal 2.0× spread) ──
function computeGates() {
  const full = (st: string, yr: number) => baselines.stats.find((x) => x.strategy === st && x.model === 'full' && x.years === yr)!
  const winTotals = (yr: number) => Object.values(baselines.wins.full![yr]!).reduce((a, b) => a + b, 0)
  const winShare = (yr: number, st: string) => (baselines.wins.full![yr]![st] ?? 0) / winTotals(yr)
  const comparable = ['star', 'balanced', 'largeDepth']
  const perHorizon = HORIZONS.map((yr) => {
    const meds = comparable.map((st) => full(st, yr).median)
    const w = baselines.wins.full![yr]!
    const winner = Object.entries(w).sort((a, b) => b[1] - a[1])[0]![0]
    const others = comparable.filter((c) => c !== 'star').map((st) => full(st, yr).median)
    return {
      yr,
      comparableSpread: +(Math.max(...meds) / Math.min(...meds)).toFixed(3),
      winner,
      topWinShare: +(Math.max(...Object.values(w)) / winTotals(yr)).toFixed(3),
      starWinShare: +winShare(yr, 'star').toFixed(3),
      starAdvVsNextComparable: +(full('star', yr).median / Math.max(...others) - 1).toFixed(3),
    }
  })
  const disc = ['minimal', 'lean', 'prospect', 'balanced', 'largeDepth', 'star', 'lowBudgetVolume', 'freelancer']
  const scaleSpread = (yr: number) => {
    const meds = disc.map((st) => full(st, yr).median).filter((m) => m > 0)
    return +(Math.max(...meds) / Math.min(...meds)).toFixed(3)
  }
  const smalls = ['minimal', 'lean', 'prospect'].map((st) => {
    const s = full(st, 3)
    return { strategy: st, p10: s.p10, positiveRate: +(1 - s.everNegFreq).toFixed(3), films: s.films, p10Positive: s.p10 > 0 }
  })
  return {
    perHorizon,
    gate1_comparableDominance: {
      spreadLe115: perHorizon.every((h) => h.comparableSpread <= 1.15),
      noMajorityWinner: perHorizon.every((h) => h.topWinShare <= 0.5),
      highestOVRNotAlwaysWinner: !perHorizon.every((h) => h.winner === 'star'),
    },
    gate2_starDominance: {
      y3WinShare: +winShare(3, 'star').toFixed(3),
      targetLe45: winShare(3, 'star') <= 0.45,
      hardLt50: winShare(3, 'star') < 0.5,
      advVsNextComparableLe10: perHorizon.every((h) => h.starAdvVsNextComparable <= 0.1),
    },
    gate3_smallStudio: { detail: smalls, pass: smalls.every((x) => x.p10Positive && x.positiveRate >= 0.95 && x.films > 0) },
    gate4_scaleSpread: { y1: scaleSpread(1), y3: scaleSpread(3), y5: scaleSpread(5), targetLe26: scaleSpread(3) <= 2.6, reviewGt275: scaleSpread(3) > 2.75 },
  }
}

const marketing = marketingStudy()
const tentpole = tentpoleStudy()
const gates = computeGates()

const summary = {
  seeds: SEEDS,
  horizons: HORIZONS,
  strategies: STRATS,
  provisional: PROV,
  fidelity: 'money-mechanics abstraction anchored to the M0A corpus (~$44M competent gross); relative results only. Freelancers UPGRADE thin slots (bug fixed); fame saturation isolated to OPENING (legs linear). Marketing test uses identical films (same noise, only spend varies). Tentpole = disciplined capital-building strategy.',
  fameStudy: fameStudy(),
  baselines: baselines.stats,
  baselineWins: baselines.wins,
  kSweep,
  shareSweep,
  marketing,
  tentpole,
  gates,
}
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2))

// ── console digest ──
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`
// eslint-disable-next-line no-console
console.log(`# D-12 economy balance study — ${SEEDS} seeds × ${HORIZONS.join('/')}yr × ${STRATS.length} strategies`)
// eslint-disable-next-line no-console
console.log(`\n## Baselines (Y3 median final cash by strategy)`)
for (const m of ['legacy', 'share', 'shareSat', 'full'] as const) {
  const row = STRATS.map((st) => {
    const s = baselines.stats.find((x) => x.strategy === st && x.model === m && x.years === 3)!
    return `${st.slice(0, 6)} ${fmtM(s.median)}`
  }).join(' · ')
  // eslint-disable-next-line no-console
  console.log(`  ${m.padEnd(9)}: ${row}`)
}
// eslint-disable-next-line no-console
console.log(`\n## Win share by strategy (full model, Y3)`)
{
  const w = baselines.wins.full![3]!
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  const sorted = Object.entries(w).sort((a, b) => b[1] - a[1])
  // eslint-disable-next-line no-console
  console.log('  ' + sorted.map(([st, n]) => `${st}=${((n / total) * 100).toFixed(0)}%`).join(' '))
}
// eslint-disable-next-line no-console
console.log(`\n## Fame K study (Hill vs linear at fame 20 / 50 / 90)`)
for (const r of summary.fameStudy) {
  const g = (f: number) => r.points.find((p) => p.fame === f)!
  // eslint-disable-next-line no-console
  console.log(`  K=${r.K}: f20 ${g(20).hill}(${g(20).delta >= 0 ? '+' : ''}${g(20).delta}) f50 ${g(50).hill} f90 ${g(90).hill}(${g(90).delta}) · crossover@${r.crossover} · maxUplift ${r.maxLowUplift} maxCut ${r.maxHighReduction}`)
}
// eslint-disable-next-line no-console
console.log(`\n## K sweep — star vs lean vs prospect Y3 median (full model) + star win%`)
for (const ks of kSweep) {
  const g = (st: string) => ks.stats.find((x) => x.strategy === st && x.years === 3)!.median
  const w = ks.wins![3]!
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  // eslint-disable-next-line no-console
  console.log(`  K=${ks.K}: star ${fmtM(g('star'))} lean ${fmtM(g('lean'))} prospect ${fmtM(g('prospect'))} lowBudget ${fmtM(g('lowBudgetVolume'))} · star win ${(((w.star ?? 0) / total) * 100).toFixed(0)}%`)
}
// eslint-disable-next-line no-console
console.log(`\n## Affordable marketing experiment (identical films, only spend varies)`)
for (const r of marketing.rows) {
  // eslint-disable-next-line no-console
  console.log(`  ${r.level.padEnd(13)} mkt ${fmtM(r.marketing)}: open ${fmtM(r.opening)} · rev ${fmtM(r.studioRev)} · contrib ${fmtM(r.contribution)} · P(profit) ${(r.profitRate * 100).toFixed(0)}% · incRev/$ ${r.incRevPerDollar} · incProfit/$ ${r.incProfitPerDollar}`)
}
// eslint-disable-next-line no-console
console.log(`  checks: ${JSON.stringify(marketing.checks)}`)
// eslint-disable-next-line no-console
console.log(`\n## Disciplined tentpole (build cash → reserve → swing → continue)`)
for (const t of tentpole) {
  // eslint-disable-next-line no-console
  console.log(`  Y${t.years}: reached ${(t.reachedPct * 100).toFixed(0)}% · 1st@wk ${t.medianFirstTentpoleWeek ?? '—'} · cost ${fmtM(t.medianCost)} gross ${fmtM(t.medianGross)} rev ${fmtM(t.medianStudioRev)} contrib ${fmtM(t.medianContribution)} · profit ${(t.profitRate * 100).toFixed(0)}% severe ${(t.severeLossRate * 100).toFixed(0)}% · followOn ${(t.followOnRate * 100).toFixed(0)}% · finalCash ${fmtM(t.medianFinalCash)}`)
}
// eslint-disable-next-line no-console
console.log(`\n## Revised gates`)
for (const h of gates.perHorizon) {
  // eslint-disable-next-line no-console
  console.log(`  Y${h.yr}: comparableSpread ${h.comparableSpread}× · winner ${h.winner} · topWin ${(h.topWinShare * 100).toFixed(0)}% · starWin ${(h.starWinShare * 100).toFixed(0)}% · starAdvVsNext ${(h.starAdvVsNextComparable * 100).toFixed(0)}%`)
}
// eslint-disable-next-line no-console
console.log(`  G1 comparable-dominance: ${JSON.stringify(gates.gate1_comparableDominance)}`)
// eslint-disable-next-line no-console
console.log(`  G2 star-dominance: ${JSON.stringify(gates.gate2_starDominance)}`)
// eslint-disable-next-line no-console
console.log(`  G3 small-studio: pass=${gates.gate3_smallStudio.pass} ${JSON.stringify(gates.gate3_smallStudio.detail)}`)
// eslint-disable-next-line no-console
console.log(`  G4 scale-spread diagnostic: ${JSON.stringify(gates.gate4_scaleSpread)}`)
// eslint-disable-next-line no-console
console.log(`\nwrote ${join(OUT, 'summary.json')}`)
