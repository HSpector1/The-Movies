// ── D-11 Studio Roster & Contract balance study (SEPARATE from the M0A corpus) ─
// The official M0A calibration corpus (tests/acceptance-corpus.test.ts, run-corpus.ts,
// out/m0a/*) is PROTECTED and employment-free. This study is a supplementary,
// deterministic sweep that FOUNDS studios and runs multi-year games under different
// roster strategies to answer D-11.21's balance questions and the "reject a system
// where…" checks. It writes ONLY to out/roster-balance/ and never touches out/m0a/*.
//
// Run:  node_modules/.bin/vite-node src/harness/run-roster-balance-study.ts [seeds]
//   or: npx tsx src/harness/run-roster-balance-study.ts [seeds]
//
// Determinism: seeded engine only; no wall-clock and no unseeded RNG. The film
// agent and roster selection are fixed deterministic functions of the seeded world.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  generateWorld,
  beginFounding,
  applyActions,
  tick,
  rosterTalent,
  busyTalentIds,
  freelancerMarketIds,
  weeklyPayroll,
  annualPayroll,
  renewalWindowOpen,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  TUNING,
} from '../core/index.js'
import type { CastSlot, CreativeRole, GameState, Talent } from '../core/index.js'

const ROLES: readonly CreativeRole[] = ['actor', 'director', 'writer', 'craft']
const YEAR = TUNING.TICKS_PER_YEAR // 52

type Strategy = 'lean' | 'balanced' | 'star' | 'fireAll'
const STRATEGIES: readonly Strategy[] = ['lean', 'balanced', 'star', 'fireAll']

// Roster targets per strategy (counts by role). fireAll founds the minimum then fires.
const ROSTER_PLAN: Record<Strategy, Record<CreativeRole, number>> = {
  lean: { actor: 3, director: 1, writer: 1, craft: 1 }, // the legal minimum (D-11.D: 1 writer)
  balanced: { actor: 7, director: 2, writer: 3, craft: 2 },
  star: { actor: 6, director: 2, writer: 2, craft: 1 },
  fireAll: { actor: 3, director: 1, writer: 1, craft: 1 }, // founds the minimum, then fires
}

const ovrOf = (t: Talent): number => roleOVR(t, ROLE_TO_DISCIPLINE[t.role])

// Found a studio for `seed` under a strategy. lean/fireAll pick the CHEAPEST talent,
// balanced picks mid-tier, star picks the most expensive (highest salary ≈ OVR+fame).
function foundWithStrategy(seed: string, strategy: Strategy): GameState {
  let s = beginFounding(generateWorld(seed))
  const founding = s.founding!
  const applicants = founding.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const plan = ROSTER_PLAN[strategy]
  const toSign: string[] = []
  for (const role of ROLES) {
    const pool = applicants.filter((t) => t.role === role).sort((a, b) => a.salary - b.salary)
    const n = Math.min(plan[role], pool.length)
    let chosen: Talent[]
    if (strategy === 'star') chosen = pool.slice(pool.length - n)
    else if (strategy === 'balanced') {
      const start = Math.max(0, Math.floor((pool.length - n) / 2))
      chosen = pool.slice(start, start + n)
    } else chosen = pool.slice(0, n) // lean / fireAll → cheapest
    for (const t of chosen) toSign.push(t.id)
  }
  for (const id of toSign) {
    const before = s
    try {
      s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 104 }])
    } catch {
      s = before // over recruitment budget → skip (still may meet minimums)
    }
  }
  s = applyActions(s, [{ kind: 'foundStudio' }])
  if (strategy === 'fireAll') {
    for (const t of rosterTalent(s)) {
      s = applyActions(s, [{ kind: 'releaseTalent', talentId: t.id }])
    }
  }
  return s
}

// Available (not-busy) roster talent of a role, strongest first.
function availableRoster(s: GameState, role: CreativeRole, busy: Set<string>): Talent[] {
  return rosterTalent(s)
    .filter((t) => t.role === role && !busy.has(t.id))
    .sort((a, b) => ovrOf(b) - ovrOf(a))
}

// Available freelancers of a role (from the current market), strongest first.
function availableFreelancers(s: GameState, role: CreativeRole, busy: Set<string>): Talent[] {
  return freelancerMarketIds(s)
    .map((id) => s.talent.find((t) => t.id === id)!)
    .filter((t) => t.role === role && !busy.has(t.id))
    .sort((a, b) => ovrOf(b) - ovrOf(a))
}

type FilmPlan = { writerId: string; directorId: string; cast: Record<CastSlot, string>; craftIds: string[]; freelancers: number }

// Try to field a legal film: roster first, freelancers only to fill a gap (D-11.11).
function planFilm(s: GameState): FilmPlan | null {
  const busy = new Set(busyTalentIds(s))
  const take = (role: CreativeRole): Talent | null => {
    const r = availableRoster(s, role, busy)
    if (r.length > 0) {
      busy.add(r[0]!.id)
      return r[0]!
    }
    const f = availableFreelancers(s, role, busy)
    if (f.length > 0) {
      busy.add(f[0]!.id)
      return f[0]!
    }
    return null
  }
  const writer = take('writer')
  const director = take('director')
  const lead = take('actor')
  const antagonist = take('actor')
  const support = take('actor')
  const craft = take('craft')
  if (!writer || !director || !lead || !antagonist || !support || !craft) return null
  const chosen = [writer, director, lead, antagonist, support, craft]
  const contracted = new Set(s.contracts.map((c) => c.talentId))
  const freelancers = chosen.filter((t) => !contracted.has(t.id)).length
  return {
    writerId: writer.id,
    directorId: director.id,
    cast: { lead: lead.id, antagonist: antagonist.id, support: support.id },
    craftIds: [craft.id],
    freelancers,
  }
}

function greenlightFilm(s: GameState, plan: FilmPlan, conceptIdx: number): GameState {
  const concept = s.concepts[conceptIdx % s.concepts.length]!
  return applyActions(s, [
    {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: {
          genre: concept.genre,
          intendedSegments: ['adult'],
          ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
        },
        writerId: plan.writerId,
        directorId: plan.directorId,
        cast: plan.cast,
        craftIds: plan.craftIds,
        budget: { negative: concept.baseNegativeCost, marketing: 400_000 },
      },
    },
  ])
}

type RunResult = {
  seed: string
  strategy: Strategy
  startWeeklyPayroll: number
  startAnnualPayroll: number
  payrollShareOfCash: number
  rosterOVRMean: number
  cashY1: number
  cashY2: number
  cashY3: number
  releases: number
  losses: number
  hits: number
  freelancerHires: number
  renewals: number
  terminations: number
  staffingFailures: number
  everInsolvent: boolean // cash < 0 at any year mark
}

function runOne(seed: string, strategy: Strategy, years: number): RunResult {
  let s = foundWithStrategy(seed, strategy)
  const startWeekly = weeklyPayroll(s)
  const startAnnual = annualPayroll(s)
  const rosterOVRMean =
    rosterTalent(s).length > 0
      ? rosterTalent(s).reduce((a, t) => a + ovrOf(t), 0) / rosterTalent(s).length
      : 0
  const terminations = s.contracts.length === 0 && strategy === 'fireAll' ? ROSTER_PLAN.fireAll.actor + ROSTER_PLAN.fireAll.director + ROSTER_PLAN.fireAll.writer + ROSTER_PLAN.fireAll.craft : 0

  let releases = 0
  let losses = 0
  let hits = 0
  let freelancerHires = 0
  let renewals = 0
  let staffingFailures = 0
  let conceptIdx = 0
  const cash: number[] = []

  for (let week = 0; week < years * YEAR; week++) {
    // Renew any contract in its window (keep the roster stable; measures renewals).
    for (const c of s.contracts) {
      if (renewalWindowOpen(c, s.market.tick)) {
        try {
          s = applyActions(s, [{ kind: 'renewContract', talentId: c.talentId, termWeeks: 104 }])
          renewals++
        } catch {
          /* already renewed this pass or unavailable */
        }
      }
    }
    // Greenlight while a slot is free and a legal film can be fielded.
    while (s.studio.activeProductions.length < TUNING.MAX_CONCURRENT_PRODUCTIONS) {
      const plan = planFilm(s)
      if (plan === null) {
        staffingFailures++
        break
      }
      freelancerHires += plan.freelancers
      const before = s
      try {
        s = greenlightFilm(s, plan, conceptIdx++)
      } catch {
        s = before
        staffingFailures++
        break
      }
    }
    const releasedBefore = s.studio.releasedFilms.length
    s = tick(s)
    const newReleases = s.studio.releasedFilms.slice(releasedBefore)
    for (const f of newReleases) {
      releases++
      // committed cost for this film from the ledger (production + freelancerFee).
      const committed = s.ledger
        .filter((e) => e.productionId === f.productionId && (e.kind === 'production' || e.kind === 'freelancerFee'))
        .reduce((a, e) => a - e.amount, 0)
      const profit = f.boxOffice.total - committed
      if (profit < 0) losses++
      if (profit > 5_000_000) hits++
    }
    if ((week + 1) % YEAR === 0) cash.push(s.studio.cash)
  }

  return {
    seed,
    strategy,
    startWeeklyPayroll: startWeekly,
    startAnnualPayroll: startAnnual,
    payrollShareOfCash: startAnnual / TUNING.INITIAL_CASH,
    rosterOVRMean,
    cashY1: cash[0] ?? s.studio.cash,
    cashY2: cash[1] ?? s.studio.cash,
    cashY3: cash[2] ?? s.studio.cash,
    releases,
    losses,
    hits,
    freelancerHires,
    renewals,
    terminations,
    staffingFailures,
    everInsolvent: (cash[0] ?? 0) < 0 || (cash[1] ?? 0) < 0 || (cash[2] ?? 0) < 0,
  }
}

// ── aggregation ──
const median = (xs: number[]): number => {
  if (xs.length === 0) return 0
  const a = [...xs].sort((p, q) => p - q)
  const m = Math.floor(a.length / 2)
  return a.length % 2 ? a[m]! : (a[m - 1]! + a[m]!) / 2
}
const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)

function summarize(results: RunResult[], strategy: Strategy) {
  const r = results.filter((x) => x.strategy === strategy)
  return {
    runs: r.length,
    startWeeklyPayroll_median: Math.round(median(r.map((x) => x.startWeeklyPayroll))),
    startAnnualPayroll_median: Math.round(median(r.map((x) => x.startAnnualPayroll))),
    payrollShareOfCash_mean: +mean(r.map((x) => x.payrollShareOfCash)).toFixed(3),
    rosterOVRMean_mean: +mean(r.map((x) => x.rosterOVRMean)).toFixed(1),
    cashY1_median: Math.round(median(r.map((x) => x.cashY1))),
    cashY2_median: Math.round(median(r.map((x) => x.cashY2))),
    cashY3_median: Math.round(median(r.map((x) => x.cashY3))),
    releases_median: median(r.map((x) => x.releases)),
    losses_mean: +mean(r.map((x) => x.losses)).toFixed(2),
    hits_mean: +mean(r.map((x) => x.hits)).toFixed(2),
    freelancerHires_mean: +mean(r.map((x) => x.freelancerHires)).toFixed(2),
    renewals_mean: +mean(r.map((x) => x.renewals)).toFixed(2),
    staffingFailures_mean: +mean(r.map((x) => x.staffingFailures)).toFixed(2),
    insolventShare: +mean(r.map((x) => (x.everInsolvent ? 1 : 0))).toFixed(3),
    y3Positive_share: +mean(r.map((x) => (x.cashY3 > 0 ? 1 : 0))).toFixed(3),
  }
}

// ── main ──
const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..')
const OUT_DIR = join(repoRoot, 'out', 'roster-balance')

const seedCount = process.argv[2] ? Number(process.argv[2]) : 60
const YEARS = 3
const results: RunResult[] = []
for (let i = 1; i <= seedCount; i++) {
  const seed = `rb-${String(i).padStart(4, '0')}`
  for (const strategy of STRATEGIES) {
    results.push(runOne(seed, strategy, YEARS))
  }
}

const perStrategy = Object.fromEntries(STRATEGIES.map((st) => [st, summarize(results, st)]))

// ── D-11.21 "reject a system where…" checks ──
const lean = perStrategy.lean!
const balanced = perStrategy.balanced!
const star = perStrategy.star!
const fireAll = perStrategy.fireAll!
const checks = {
  starHeavyBurnsMoreThanLean: star.startWeeklyPayroll_median > lean.startWeeklyPayroll_median,
  payrollMatters_starRunwayShorterThanLean: star.cashY3_median < lean.cashY3_median || star.insolventShare > lean.insolventShare,
  freelancersNotAlwaysCheaper_someRostersUseFew: balanced.freelancerHires_mean < balanced.releases_median * 6,
  contractsNotCosmetic_payrollNonZero: lean.startWeeklyPayroll_median > 0 && balanced.startWeeklyPayroll_median > 0,
  normalStartsCanMakeFilms_lowStaffingFailure: balanced.staffingFailures_mean < 5,
  oneLossNotFatal_balancedMostlySolvent: balanced.y3Positive_share > 0.5,
  firingEveryoneNotOptimal: fireAll.cashY3_median < balanced.cashY3_median && fireAll.releases_median < balanced.releases_median,
  bestStrategyNotAlwaysHighestOVR: balanced.cashY3_median >= star.cashY3_median || lean.cashY3_median >= star.cashY3_median,
}

const summary = { seedCount, years: YEARS, strategies: perStrategy, rejectChecks: checks }

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2))

// human-readable
const lines: string[] = []
lines.push(`# D-11 Roster & Contract balance study`)
lines.push(``)
lines.push(`Seeds: ${seedCount} · Years: ${YEARS} · Strategies: ${STRATEGIES.join(', ')}`)
lines.push(`(Separate from the protected M0A corpus; deterministic; writes out/roster-balance/.)`)
lines.push(``)
for (const st of STRATEGIES) {
  const x = perStrategy[st]!
  lines.push(`## ${st}`)
  lines.push(`- start weekly payroll (median): $${x.startWeeklyPayroll_median.toLocaleString()}`)
  lines.push(`- start annual payroll (median): $${x.startAnnualPayroll_median.toLocaleString()} (${(x.payrollShareOfCash_mean * 100).toFixed(1)}% of starting cash)`)
  lines.push(`- roster OVR mean: ${x.rosterOVRMean_mean}`)
  lines.push(`- cash median Y1/Y2/Y3: $${x.cashY1_median.toLocaleString()} / $${x.cashY2_median.toLocaleString()} / $${x.cashY3_median.toLocaleString()}`)
  lines.push(`- releases (median): ${x.releases_median} · losses/run: ${x.losses_mean} · hits/run: ${x.hits_mean}`)
  lines.push(`- freelancer hires/run: ${x.freelancerHires_mean} · renewals/run: ${x.renewals_mean} · staffing failures/run: ${x.staffingFailures_mean}`)
  lines.push(`- Y3 solvent share: ${(x.y3Positive_share * 100).toFixed(0)}% · ever-insolvent share: ${(x.insolventShare * 100).toFixed(0)}%`)
  lines.push(``)
}
lines.push(`## Reject-condition checks (all should be TRUE)`)
for (const [k, v] of Object.entries(checks)) lines.push(`- ${v ? 'PASS' : 'FAIL'} — ${k}`)
writeFileSync(join(OUT_DIR, 'summary.md'), lines.join('\n') + '\n')

// console
// eslint-disable-next-line no-console
console.log(lines.join('\n'))
