// ── D-12 FINAL balance framework (closure; owner-specified 4 diagnostic families) ─
// Authoritative closure study. Drives the REAL engine (found → maintain roster → greedy
// greenlight w/ legal freelancer fill → tick) across seeds and horizons. Replaces the raw
// cash-spread acceptance gate (now a DISCLOSED DIAGNOSTIC ONLY) with four separate families:
//   A. Comparable capable-strategy dominance (star / balanced / largeDepth) — the real gate.
//   B. Scale-normalized comparison (smallCompetent vs large) — decompose the cash diff into
//      film-count × per-film contribution × payroll × freelancer × idle; no large residual.
//   C. Bargain-basement stress (bargainBasement) — playable, produces films, materially weaker,
//      not free money, not dominant.
//   D. Throughput diagnostic — films/yr, slot utilization, idle, team-blocked, freelancer hires.
// Terminology (owner §5): film CONTRIBUTION = Studio Revenue − direct film costs (negative +
// marketing + freelancer fees). Studio OPERATING RESULT = Contribution − payroll − overhead.
// Payroll/overhead are NEVER folded into per-film Contribution; an allocated operating-cost/film
// is shown separately, labeled managerial. Absolutes overshoot real play (box office = gross) —
// read structurally. Reads only the public core surface.

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
  isContracted,
  freelancerFee,
  freelancerMarketIds,
  roleOVR,
  ROLE_TO_DISCIPLINE,
} from '../core/index.js'
import type { GameState, CreativeRole, Talent, CastSlot } from '../core/index.js'

const SEEDS = Number(process.argv[2] ?? 60)
const HORIZONS = [1, 3, 5]
const OUT = join(process.cwd(), 'out', 'economy-balance')
const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']

type Rank = 'best' | 'cheapest' | 'competent'
type Strat = {
  name: string
  counts: Record<CreativeRole, number>
  rank: Rank
  negMult: number
  marketing: number
  useFreelancers: boolean
}
// bargainBasement = the former "minimal" (cheapest legal roster — a STRESS strategy, NOT the
// representative small studio). smallCompetent = the representative small studio: lean legal
// roster, COMPETENT (mid-tier) talent, restrained payroll, normal budgets, legal freelancer use.
const STRATS: Strat[] = [
  { name: 'bargainBasement', counts: { actor: 3, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.85, marketing: 200_000, useFreelancers: false },
  { name: 'smallCompetent', counts: { actor: 4, director: 1, writer: 1, craft: 1 }, rank: 'competent', negMult: 1.0, marketing: 600_000, useFreelancers: true },
  { name: 'lean', counts: { actor: 4, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.95, marketing: 400_000, useFreelancers: false },
  { name: 'balanced', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.1, marketing: 1_200_000, useFreelancers: false },
  { name: 'largeDepth', counts: { actor: 8, director: 3, writer: 3, craft: 2 }, rank: 'best', negMult: 1.25, marketing: 2_000_000, useFreelancers: false },
  { name: 'star', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.4, marketing: 3_000_000, useFreelancers: false },
]
const COMPARABLE = ['star', 'balanced', 'largeDepth']

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length ? (s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2) : 0
}
function p10(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.max(0, Math.floor(0.1 * s.length))]! : 0
}

function ovrOf(t: Talent, role: CreativeRole): number {
  return roleOVR(t, ROLE_TO_DISCIPLINE[role])
}
// Rank a role's talent for SELECTION. competent = closest to the pool's median OVR (mid-tier),
// deliberately excluding both elites and the cheapest bargain talent.
function rankTalent(list: Talent[], role: CreativeRole, rank: Rank): Talent[] {
  const arr = [...list]
  if (rank === 'best') return arr.sort((a, b) => ovrOf(b, role) + b.fame - (ovrOf(a, role) + a.fame))
  if (rank === 'cheapest') return arr.sort((a, b) => ovrOf(a, role) + a.fame - (ovrOf(b, role) + b.fame))
  const med = median(arr.map((t) => ovrOf(t, role)))
  return arr.sort((a, b) => Math.abs(ovrOf(a, role) - med) - Math.abs(ovrOf(b, role) - med))
}

function countsFor(st: Strat): Record<CreativeRole, number> {
  const out = {} as Record<CreativeRole, number>
  for (const role of ROLES) out[role] = Math.max(FOUNDING_MINIMUMS[role], st.counts[role])
  return out
}

function foundFor(seed: string, st: Strat): { state: GameState; rosterIds: string[] } {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const want = countsFor(st)
  const rosterIds: string[] = []
  for (const role of ROLES) for (const t of rankTalent(pool.filter((t) => t.role === role), role, st.rank).slice(0, want[role])) rosterIds.push(t.id)
  for (const id of rosterIds) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  return { state: applyActions(s, [{ kind: 'foundStudio' }]), rosterIds }
}

// Re-sign any roster member whose contract has lapsed (contracts max out at 208 weeks; a Y5 run
// is 260 weeks). Keeps the intended roster staffed across expiry without modeling a renewal UX.
function maintainRoster(s: GameState, rosterIds: string[]): GameState {
  let out = s
  for (const id of rosterIds) {
    if (!isContracted(out, id)) {
      // A re-sign is a VOLUNTARY commitment — the D-12 solvency gate blocks it while cash is
      // negative. Skip it then (the member stays lapsed until the studio recovers): a faithful
      // consequence, not a harness error.
      try {
        out = applyActions(out, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
      } catch {
        /* unaffordable re-sign — leave lapsed */
      }
    }
  }
  return out
}

type Assembled = { action: Parameters<typeof applyActions>[1][number]; freelancers: number }
type Blocked = { blocked: 'noWriter' | 'noTeam' | 'unaffordable' | 'noConcept' }

function assemble(s: GameState, st: Strat, conceptIdx: number): Assembled | Blocked {
  const busy = busyTalentIds(s)
  const market = new Set(freelancerMarketIds(s))
  const freeContracted = (role: CreativeRole) =>
    rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id) && isContracted(s, t.id)), role, 'best')
  const freeFreelancers = (role: CreativeRole, exclude: Set<string>) =>
    rankTalent(s.talent.filter((t) => t.role === role && market.has(t.id) && !busy.has(t.id) && !exclude.has(t.id)), role, 'best')
  const chosen: Record<string, string> = {}
  const used = new Set<string>()
  let fees = 0
  let freelancers = 0
  function pick(role: CreativeRole, n: number, key: string): Blocked | null {
    const out: Talent[] = []
    for (const t of freeContracted(role)) {
      if (out.length >= n) break
      if (!used.has(t.id)) out.push(t)
    }
    if (out.length < n && st.useFreelancers) {
      for (const t of freeFreelancers(role, used)) {
        if (out.length >= n) break
        out.push(t)
        fees += freelancerFee(t)
        freelancers += 1
      }
    }
    if (out.length < n) return { blocked: role === 'writer' ? 'noWriter' : 'noTeam' }
    out.forEach((t, i) => {
      used.add(t.id)
      chosen[`${key}${i}`] = t.id
    })
    return null
  }
  const w = pick('writer', 1, 'w')
  if (w) return w
  const d = pick('director', 1, 'd')
  if (d) return d
  const a = pick('actor', 3, 'a')
  if (a) return a
  const c = pick('craft', 1, 'c')
  if (c) return c
  const concept = s.concepts[conceptIdx % s.concepts.length]
  if (!concept) return { blocked: 'noConcept' }
  const negative = Math.round(concept.baseNegativeCost * st.negMult)
  if (!canAfford(s, negative + st.marketing + fees).ok) return { blocked: 'unaffordable' }
  const cast = { lead: chosen['a0']!, antagonist: chosen['a1']!, support: chosen['a2']! } as Record<CastSlot, string>
  return {
    freelancers,
    action: {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: chosen['w0']!,
        directorId: chosen['d0']!,
        cast,
        craftIds: [chosen['c0']!],
        budget: { negative, marketing: st.marketing },
      },
    },
  }
}

type Run = {
  released: number
  closingCash: number
  endPositive: boolean
  slotIdleWeeks: number
  weeksNoActive: number
  longestIdle: number
  teamBlockedWeeks: number
  freelancerHires: number
  releaseWeeks: number[]
  rosterOVR: number
  totalProduction: number
  totalFreelancerFee: number
  totalStudioRev: number
  totalPayroll: number
  totalOverhead: number
  worstFilmContribThenRecovered: boolean // did cash recover after the weakest release?
}

function runGame(seed: string, st: Strat, years: number): Run {
  const founded = foundFor(seed, st)
  let s = founded.state
  const weeks = years * TUNING.TICKS_PER_YEAR
  // roster OVR/Fit at founding (representative-quality signal for the report)
  const roster = s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!)
  const rosterOVR = roster.length ? roster.reduce((a, t) => a + ovrOf(t, t.role), 0) / roster.length : 0
  const r: Run = {
    released: 0, closingCash: 0, endPositive: false, slotIdleWeeks: 0, weeksNoActive: 0, longestIdle: 0,
    teamBlockedWeeks: 0, freelancerHires: 0, releaseWeeks: [], rosterOVR,
    totalProduction: 0, totalFreelancerFee: 0, totalStudioRev: 0, totalPayroll: 0, totalOverhead: 0, worstFilmContribThenRecovered: false,
  }
  let conceptIdx = 0
  let idleRun = 0
  for (let wk = 0; wk < weeks; wk++) {
    s = maintainRoster(s, founded.rosterIds)
    r.slotIdleWeeks += Math.max(0, TUNING.MAX_CONCURRENT_PRODUCTIONS - s.studio.activeProductions.length)
    for (let guard = 0; guard < TUNING.MAX_CONCURRENT_PRODUCTIONS + 1; guard++) {
      if (s.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) break
      const res = assemble(s, st, conceptIdx)
      if ('blocked' in res) {
        if (res.blocked === 'noWriter' || res.blocked === 'noTeam') r.teamBlockedWeeks += 1
        break
      }
      s = applyActions(s, [res.action])
      r.freelancerHires += res.freelancers
      conceptIdx += 1
    }
    const before = s.studio.releasedFilms.length
    s = tick(s, { develop: true })
    if (s.studio.releasedFilms.length > before) r.releaseWeeks.push(wk)
    if (s.studio.activeProductions.length === 0) {
      r.weeksNoActive += 1
      idleRun += 1
      r.longestIdle = Math.max(r.longestIdle, idleRun)
    } else idleRun = 0
  }
  r.released = s.studio.releasedFilms.length
  for (const e of s.ledger) {
    if (e.kind === 'production') r.totalProduction += -e.amount
    else if (e.kind === 'freelancerFee') r.totalFreelancerFee += -e.amount
    else if (e.kind === 'studioRevenue') r.totalStudioRev += e.amount
    else if (e.kind === 'payroll') r.totalPayroll += -e.amount
    else if (e.kind === 'overhead') r.totalOverhead += -e.amount
  }
  r.closingCash = s.studio.cash
  r.endPositive = s.studio.cash > 0
  return r
}

// ── aggregate ───────────────────────────────────────────────────────────────
type Cell = ReturnType<typeof aggregate>
function aggregate(st: Strat, years: number) {
  const runs: Run[] = []
  for (let i = 0; i < SEEDS; i++) runs.push(runGame(`fin-${i}`, st, years))
  const weeks = years * TUNING.TICKS_PER_YEAR
  const perFilm = (sel: (r: Run) => number) => median(runs.map((r) => (r.released > 0 ? sel(r) / r.released : 0)))
  const gaps = runs.map((r) => {
    if (r.releaseWeeks.length < 2) return 0
    let g = 0
    for (let i = 1; i < r.releaseWeeks.length; i++) g += r.releaseWeeks[i]! - r.releaseWeeks[i - 1]!
    return g / (r.releaseWeeks.length - 1)
  })
  return {
    strategy: st.name,
    years,
    medianCash: Math.round(median(runs.map((r) => r.closingCash))),
    p10Cash: Math.round(p10(runs.map((r) => r.closingCash))),
    endPositiveRate: +(runs.filter((r) => r.endPositive).length / SEEDS).toFixed(3),
    filmsReleased: median(runs.map((r) => r.released)),
    filmsPerYear: +(median(runs.map((r) => r.released)) / years).toFixed(1),
    slotUtilPct: +(1 - median(runs.map((r) => r.slotIdleWeeks)) / (weeks * TUNING.MAX_CONCURRENT_PRODUCTIONS)).toFixed(3),
    fullIdlePct: +(median(runs.map((r) => r.weeksNoActive)) / weeks).toFixed(3),
    longestIdle: median(runs.map((r) => r.longestIdle)),
    teamBlockedWeeks: median(runs.map((r) => r.teamBlockedWeeks)),
    freelancerHires: median(runs.map((r) => r.freelancerHires)),
    timeBetweenReleases: +median(gaps).toFixed(1),
    rosterOVR: +median(runs.map((r) => r.rosterOVR)).toFixed(1),
    // film CONTRIBUTION per film = (studioRev − production − freelancerFee) / films (NO payroll/overhead)
    contribPerFilm: Math.round(perFilm((r) => r.totalStudioRev - r.totalProduction - r.totalFreelancerFee)),
    studioRevPerFilm: Math.round(perFilm((r) => r.totalStudioRev)),
    // managerial (labeled): allocated operating cost per film = (payroll + overhead) / films
    allocatedOpCostPerFilm: Math.round(perFilm((r) => r.totalPayroll + r.totalOverhead)),
    payroll: Math.round(median(runs.map((r) => r.totalPayroll))),
    overhead: Math.round(median(runs.map((r) => r.totalOverhead))),
    freelancerFees: Math.round(median(runs.map((r) => r.totalFreelancerFee))),
  }
}

const cells: Cell[] = []
for (const years of HORIZONS) for (const st of STRATS) cells.push(aggregate(st, years))
const get = (name: string, years: number) => cells.find((c) => c.strategy === name && c.years === years)!

// ── Family A — comparable capable-strategy dominance (the real gate) ──────────
// (win share computed across the CAPABLE set only — the raw cash gate is retired.)
function winShareCapable(years: number) {
  const wins: Record<string, number> = {}
  for (let i = 0; i < SEEDS; i++) {
    let best = ''
    let bestCash = -Infinity
    for (const name of COMPARABLE) {
      const r = runGame(`fin-${i}`, STRATS.find((s) => s.name === name)!, years)
      if (r.closingCash > bestCash) {
        bestCash = r.closingCash
        best = name
      }
    }
    wins[best] = (wins[best] ?? 0) + 1
  }
  return wins
}
const familyA = HORIZONS.map((years) => {
  const meds = COMPARABLE.map((n) => get(n, years).medianCash)
  const wins = winShareCapable(years)
  const total = Object.values(wins).reduce((a, b) => a + b, 0)
  const winner = Object.entries(wins).sort((a, b) => b[1] - a[1])[0]![0]
  const others = COMPARABLE.filter((n) => n !== 'star').map((n) => get(n, years).medianCash)
  return {
    years,
    spread: +(Math.max(...meds) / Math.min(...meds)).toFixed(3),
    starWinShare: +((wins['star'] ?? 0) / total).toFixed(3),
    winner,
    starAdvVsNext: +(get('star', years).medianCash / Math.max(...others) - 1).toFixed(3),
  }
})
const gateA = {
  spreadLe115: familyA.every((h) => h.spread <= 1.15),
  starWinLe45: (familyA.find((h) => h.years === 3)!.starWinShare) <= 0.45,
  starWinHardLt50: (familyA.find((h) => h.years === 3)!.starWinShare) < 0.5,
  starAdvLe10: familyA.every((h) => h.starAdvVsNext <= 0.1),
  highestOVRNotAlwaysWinner: !familyA.every((h) => h.winner === 'star'),
}

// ── Family B — scale-normalized (smallCompetent vs largeDepth), Y3 ────────────
function scaleDecomp(years: number) {
  const small = get('smallCompetent', years)
  const large = get('largeDepth', years)
  // reconstruct total contribution ≈ contribPerFilm × films; operating = contribution − payroll − overhead.
  const smallContribTotal = small.contribPerFilm * small.filmsReleased
  const largeContribTotal = large.contribPerFilm * large.filmsReleased
  return {
    years,
    filmCountRatio: +(large.filmsReleased / Math.max(1, small.filmsReleased)).toFixed(2),
    contribPerFilmRatio: +(large.contribPerFilm / Math.max(1, small.contribPerFilm)).toFixed(2),
    payrollRatio: +(large.payroll / Math.max(1, small.payroll)).toFixed(2),
    cashRatio: +(large.medianCash / Math.max(1, small.medianCash)).toFixed(2),
    // residual: cashRatio explained by films × perFilmContrib?  (payroll/overhead are studio-level)
    explainedRatio: +((large.filmsReleased * large.contribPerFilm) / Math.max(1, small.filmsReleased * small.contribPerFilm)).toFixed(2),
    smallContribTotal: Math.round(smallContribTotal),
    largeContribTotal: Math.round(largeContribTotal),
  }
}
const familyB = HORIZONS.map(scaleDecomp)

// ── Family C — bargain-basement stress ────────────────────────────────────────
const familyC = HORIZONS.map((years) => {
  const b = get('bargainBasement', years)
  const cap = Math.max(...COMPARABLE.map((n) => get(n, years).medianCash))
  return {
    years,
    playable_endPositiveRate: b.endPositiveRate,
    producesFilms: b.filmsReleased > 0,
    filmsPerYear: b.filmsPerYear,
    notIdleExploit: b.fullIdlePct < 0.4, // not "earning by waiting"
    materiallyWeaker: b.medianCash < 0.5 * cap,
    notDominant: COMPARABLE.every((n) => get(n, years).medianCash > b.medianCash),
    medianCash: b.medianCash,
  }
})

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'final-balance-summary.json'), JSON.stringify({ seeds: SEEDS, horizons: HORIZONS, cells, familyA, gateA, familyB, familyC }, null, 2))

// ── console ──
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`
// eslint-disable-next-line no-console
console.log(`# D-12 FINAL balance framework — ${SEEDS} seeds × ${HORIZONS.join('/')}yr (REAL engine)`)
for (const years of HORIZONS) {
  // eslint-disable-next-line no-console
  console.log(`\n## Y${years}  strat            rOVR  films/yr  slotUtil  fullIdle  frHire  contrib/film  rev/film  [mgr opCost/film]  cash      p10       end+`)
  for (const st of STRATS) {
    const c = get(st.name, years)
    // eslint-disable-next-line no-console
    console.log(
      `   ${st.name.padEnd(15)} ${String(c.rosterOVR).padStart(4)}  ${String(c.filmsPerYear).padStart(6)}   ${String((c.slotUtilPct * 100).toFixed(0)).padStart(5)}%    ${String((c.fullIdlePct * 100).toFixed(0)).padStart(4)}%   ${String(c.freelancerHires).padStart(4)}   ${fmtM(c.contribPerFilm).padStart(9)}  ${fmtM(c.studioRevPerFilm).padStart(8)}   ${fmtM(c.allocatedOpCostPerFilm).padStart(9)}     ${fmtM(c.medianCash).padStart(8)}  ${fmtM(c.p10Cash).padStart(8)}  ${(c.endPositiveRate * 100).toFixed(0)}%`,
    )
  }
}
// eslint-disable-next-line no-console
console.log(`\n## Family A — comparable capable-strategy dominance (THE gate)`)
for (const h of familyA) console.log(`   Y${h.years}: spread ${h.spread}× · winner ${h.winner} · starWin ${(h.starWinShare * 100).toFixed(0)}% · starAdvVsNext ${(h.starAdvVsNext * 100).toFixed(0)}%`) // eslint-disable-line no-console
// eslint-disable-next-line no-console
console.log(`   GATE A: ${JSON.stringify(gateA)}`)
// eslint-disable-next-line no-console
console.log(`\n## Family B — scale-normalized (largeDepth vs smallCompetent)`)
for (const h of familyB) console.log(`   Y${h.years}: cashRatio ${h.cashRatio}× = films ${h.filmCountRatio}× × contrib/film ${h.contribPerFilmRatio}×  (explained ${h.explainedRatio}×, payroll ${h.payrollRatio}×)`) // eslint-disable-line no-console
// eslint-disable-next-line no-console
console.log(`\n## Family C — bargain-basement stress`)
for (const h of familyC) console.log(`   Y${h.years}: ${JSON.stringify(h)}`) // eslint-disable-line no-console
// eslint-disable-next-line no-console
console.log(`\nwrote ${join(OUT, 'final-balance-summary.json')}`)
