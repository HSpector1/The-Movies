// ── D-12 writer/creative-team concurrency diagnostic (owner investigation) ─────
// DIAGNOSTIC ONLY — no production code changes, no new features. Investigates WHY the
// integrated large-vs-bargainBasement cash gap is 12–27× (vs the [S] abstraction's 2.6×). Drives
// the REAL engine (found → greenlight → tick) with heavy instrumentation and controlled
// counterfactuals, to classify the cause as bug / abstraction-gap / intended-acceptable /
// intended-excessive. Reads only the public core surface.
//
// Confirmed by code audit (actions.ts M16.5, tick.ts release, employment.ts):
//   • a talent (writer/director/each actor/craft) is EXCLUSIVE to one active production
//     (greenlight rejects any id already engaged) — held from greenlight until RELEASE;
//   • a thin roster (1 writer/1 director/3 actors/1 craft) therefore staffs exactly ONE
//     concurrent film; the 2nd of MAX_CONCURRENT=2 slots needs a whole second creative team;
//   • the engine's escape hatch is FREELANCERS (greenlight legally accepts non-contracted
//     talent for any role, paying freelancerFee) — the baseline bot never uses it;
//   • concepts are reusable templates (never a scarcity) → "development input" is never the block.

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

const SEEDS = Number(process.argv[2] ?? 50)
// Y1/Y3 only: both are under the 4-year (208-week) max contract term, so no roster expires
// mid-run — isolating the concurrency question from contract-renewal (a separate mechanic).
// The integrated scale gap is already 12.7× at Y3, so Y3 fully exhibits the effect.
const HORIZONS = [1, 3]
const OUT = join(process.cwd(), 'out', 'economy-balance')
const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']

type Strat = { name: string; counts: Record<CreativeRole, number>; rank: 'best' | 'cheapest' | 'prospect'; negMult: number; marketing: number }
const STRATS: Strat[] = [
  { name: 'bargainBasement', counts: { actor: 3, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.85, marketing: 200_000 },
  { name: 'lean', counts: { actor: 4, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.95, marketing: 400_000 },
  { name: 'balanced', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.1, marketing: 1_200_000 },
  { name: 'largeDepth', counts: { actor: 8, director: 3, writer: 3, craft: 2 }, rank: 'best', negMult: 1.25, marketing: 2_000_000 },
  { name: 'star', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.4, marketing: 3_000_000 },
]

type Variant = 'baseline' | 'equalWriters' | 'fullCapacity' | 'freelancerFill'

function rankTalent(list: Talent[], role: CreativeRole, rank: Strat['rank']): Talent[] {
  const ovr = (t: Talent) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
  const arr = [...list]
  if (rank === 'best') arr.sort((a, b) => ovr(b) + b.fame - (ovr(a) + a.fame))
  else if (rank === 'cheapest') arr.sort((a, b) => ovr(a) + a.fame - (ovr(b) + b.fame))
  else arr.sort((a, b) => ovr(b) - b.fame * 0.5 - (ovr(a) - a.fame * 0.5))
  return arr
}

// Per-role signing counts for a strategy under a variant. equalWriters → 2 writers for all;
// fullCapacity → enough of EVERY role to staff 2 concurrent films (the real bottleneck is the
// whole team, not just writers); baseline/freelancerFill → the strategy's own counts.
function countsFor(st: Strat, variant: Variant): Record<CreativeRole, number> {
  if (variant === 'equalWriters') return { ...st.counts, writer: Math.max(2, st.counts.writer) }
  if (variant === 'fullCapacity') return { actor: Math.max(6, st.counts.actor), director: Math.max(2, st.counts.director), writer: Math.max(2, st.counts.writer), craft: Math.max(2, st.counts.craft) }
  return st.counts
}

function foundFor(seed: string, st: Strat, variant: Variant): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const want = countsFor(st, variant)
  const toSign: string[] = []
  for (const role of ROLES) {
    const n = Math.max(FOUNDING_MINIMUMS[role], want[role])
    for (const t of rankTalent(pool.filter((t) => t.role === role), role, st.rank).slice(0, n)) toSign.push(t.id)
  }
  for (const id of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

type Assembled = { action: Parameters<typeof applyActions>[1][number]; committed: number; freelancers: number }
type Blocked = { blocked: 'noWriter' | 'noDirector' | 'noActor' | 'noCraft' | 'unaffordable' | 'noConcept' }

// Assemble one legal greenlight. With useFreelancers, fill any role the contracted roster
// can't cover with a free NON-CONTRACTED talent (paying its freelancerFee) — the engine's
// real escape hatch for a busy creative team.
function assemble(s: GameState, st: Strat, conceptIdx: number, useFreelancers: boolean): Assembled | Blocked {
  const busy = busyTalentIds(s)
  const market = new Set(freelancerMarketIds(s)) // legally-engageable freelancers (D-11.12)
  const freeContracted = (role: CreativeRole) =>
    rankTalent(s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id) && isContracted(s, t.id)), role, 'best')
  const freeFreelancers = (role: CreativeRole, exclude: Set<string>) =>
    rankTalent(s.talent.filter((t) => t.role === role && market.has(t.id) && !busy.has(t.id) && !exclude.has(t.id)), role, 'best')

  const chosen: Record<string, string> = {}
  const used = new Set<string>()
  let freelancerFees = 0
  let freelancers = 0
  // pick n distinct talents of a role (contracted first, then freelancers if allowed).
  function pick(role: CreativeRole, n: number, blockReason: Blocked['blocked']): Blocked | null {
    const out: Talent[] = []
    for (const t of freeContracted(role)) {
      if (out.length >= n) break
      if (!used.has(t.id)) out.push(t)
    }
    if (out.length < n && useFreelancers) {
      for (const t of freeFreelancers(role, used)) {
        if (out.length >= n) break
        out.push(t)
        freelancerFees += freelancerFee(s, t)
        freelancers += 1
      }
    }
    if (out.length < n) return { blocked: blockReason }
    for (const t of out) {
      used.add(t.id)
      chosen[`${role}${out.indexOf(t)}`] = t.id
    }
    return null
  }
  const w = pick('writer', 1, 'noWriter')
  if (w) return w
  const d = pick('director', 1, 'noDirector')
  if (d) return d
  const a = pick('actor', 3, 'noActor')
  if (a) return a
  const c = pick('craft', 1, 'noCraft')
  if (c) return c

  const concept = s.concepts[conceptIdx % s.concepts.length]
  if (!concept) return { blocked: 'noConcept' }
  const negative = Math.round(concept.baseNegativeCost * st.negMult)
  const committed = negative + st.marketing + freelancerFees
  if (!canAfford(s, committed).ok) return { blocked: 'unaffordable' }

  const ids = Object.values(chosen)
  const cast = { lead: chosen['actor0']!, antagonist: chosen['actor1']!, support: chosen['actor2']! } as Record<CastSlot, string>
  void ids
  return {
    committed,
    freelancers,
    action: {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: chosen['writer0']!,
        directorId: chosen['director0']!,
        cast,
        craftIds: [chosen['craft0']!],
        budget: { negative, marketing: st.marketing },
      },
    },
  }
}

type Metrics = {
  greenlit: number
  released: number
  blocked: number
  blockNoWriter: number
  blockNoTeam: number // director/actor/craft unavailable
  blockUnaffordable: number
  weeksNoActive: number
  slotIdleWeeks: number // Σ (MAX_CONCURRENT − active) each week
  writerBlockedWeeks: number // weeks a slot was free but no free writer (contracted, baseline)
  longestIdle: number
  freelancerHires: number
  contractedWriters: number
  greenlightWeeks: number[]
  releaseWeeks: number[]
  totalProduction: number // −Σ production ledger (negative+marketing)
  totalFreelancerFee: number // −Σ freelancerFee ledger
  totalStudioRev: number // Σ studioRevenue ledger
  totalPayroll: number
  totalOverhead: number
  closingCash: number
}

function runGame(seed: string, st: Strat, years: number, variant: Variant): Metrics {
  let s = foundFor(seed, st, variant)
  const useFreelancers = variant === 'freelancerFill'
  const weeks = years * TUNING.TICKS_PER_YEAR
  const contractedWriters = s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === 'writer').length
  const m: Metrics = {
    greenlit: 0, released: 0, blocked: 0, blockNoWriter: 0, blockNoTeam: 0, blockUnaffordable: 0,
    weeksNoActive: 0, slotIdleWeeks: 0, writerBlockedWeeks: 0, longestIdle: 0, freelancerHires: 0,
    contractedWriters, greenlightWeeks: [], releaseWeeks: [],
    totalProduction: 0, totalFreelancerFee: 0, totalStudioRev: 0, totalPayroll: 0, totalOverhead: 0, closingCash: 0,
  }
  let conceptIdx = 0
  let idleRun = 0
  let ledgerLen = 0
  for (let wk = 0; wk < weeks; wk++) {
    const active0 = s.studio.activeProductions.length
    m.slotIdleWeeks += Math.max(0, TUNING.MAX_CONCURRENT_PRODUCTIONS - active0)
    // try to fill every free slot this week
    for (let guard = 0; guard < TUNING.MAX_CONCURRENT_PRODUCTIONS + 1; guard++) {
      if (s.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) break
      const r = assemble(s, st, conceptIdx, useFreelancers)
      if ('blocked' in r) {
        m.blocked += 1
        if (r.blocked === 'noWriter') { m.blockNoWriter += 1; m.writerBlockedWeeks += 1 }
        else if (r.blocked === 'unaffordable') m.blockUnaffordable += 1
        else if (r.blocked !== 'noConcept') m.blockNoTeam += 1
        break
      }
      s = applyActions(s, [r.action])
      m.greenlit += 1
      m.freelancerHires += r.freelancers
      m.greenlightWeeks.push(wk)
      conceptIdx += 1
    }
    const beforeReleases = s.studio.releasedFilms.length
    s = tick(s, { develop: true })
    if (s.studio.releasedFilms.length > beforeReleases) m.releaseWeeks.push(wk)
    // idle tracking (after tick)
    if (s.studio.activeProductions.length === 0) {
      m.weeksNoActive += 1
      idleRun += 1
      m.longestIdle = Math.max(m.longestIdle, idleRun)
    } else idleRun = 0
  }
  m.released = s.studio.releasedFilms.length
  // ledger aggregation over the whole run
  void ledgerLen
  for (const e of s.ledger) {
    if (e.kind === 'production') m.totalProduction += -e.amount
    else if (e.kind === 'freelancerFee') m.totalFreelancerFee += -e.amount
    else if (e.kind === 'studioRevenue') m.totalStudioRev += e.amount
    else if (e.kind === 'payroll') m.totalPayroll += -e.amount
    else if (e.kind === 'overhead') m.totalOverhead += -e.amount
  }
  m.closingCash = s.studio.cash
  return m
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length ? (s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2) : 0
}
function p10(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.max(0, Math.floor(0.1 * s.length))]! : 0
}
function avgGap(weeks: number[]): number {
  if (weeks.length < 2) return 0
  let g = 0
  for (let i = 1; i < weeks.length; i++) g += weeks[i]! - weeks[i - 1]!
  return +(g / (weeks.length - 1)).toFixed(1)
}

// ── aggregate a (strategy, variant, horizon) cell ─────────────────────────────
type Cell = {
  strategy: string
  variant: Variant
  years: number
  seeds: number
  medianCash: number
  p10Cash: number
  medianReleased: number
  medianGreenlit: number
  medianBlockedTeam: number
  medianBlockNoWriter: number
  medianFreelancerHires: number
  contractedWriters: number
  slotIdlePctMedian: number // slot-idle-weeks / (weeks × MAX_CONCURRENT)
  weeksNoActivePctMedian: number
  longestIdleMedian: number
  avgGreenlightGapMedian: number
  filmsPerYear: number
  grossPerFilm: number
  studioRevPerFilm: number
  contribPerFilm: number // (studioRev − production − freelancerFee) / released
  payrollPerFilm: number
}
function aggregate(st: Strat, variant: Variant, years: number): Cell {
  const runs: Metrics[] = []
  for (let i = 0; i < SEEDS; i++) runs.push(runGame(`int-${i}`, st, years, variant))
  const weeks = years * TUNING.TICKS_PER_YEAR
  const perFilm = (sel: (m: Metrics) => number) => median(runs.map((m) => (m.released > 0 ? sel(m) / m.released : 0)))
  return {
    strategy: st.name,
    variant,
    years,
    seeds: SEEDS,
    medianCash: Math.round(median(runs.map((m) => m.closingCash))),
    p10Cash: Math.round(p10(runs.map((m) => m.closingCash))),
    medianReleased: median(runs.map((m) => m.released)),
    medianGreenlit: median(runs.map((m) => m.greenlit)),
    medianBlockedTeam: median(runs.map((m) => m.blockNoTeam)),
    medianBlockNoWriter: median(runs.map((m) => m.blockNoWriter)),
    medianFreelancerHires: median(runs.map((m) => m.freelancerHires)),
    contractedWriters: runs[0]!.contractedWriters,
    slotIdlePctMedian: +(median(runs.map((m) => m.slotIdleWeeks)) / (weeks * TUNING.MAX_CONCURRENT_PRODUCTIONS)).toFixed(3),
    weeksNoActivePctMedian: +(median(runs.map((m) => m.weeksNoActive)) / weeks).toFixed(3),
    longestIdleMedian: median(runs.map((m) => m.longestIdle)),
    avgGreenlightGapMedian: median(runs.map((m) => avgGap(m.greenlightWeeks))),
    filmsPerYear: +(median(runs.map((m) => m.released)) / years).toFixed(1),
    grossPerFilm: 0, // gross not separately ledgered; studioRev/share below is the proxy
    studioRevPerFilm: Math.round(perFilm((m) => m.totalStudioRev)),
    contribPerFilm: Math.round(perFilm((m) => m.totalStudioRev - m.totalProduction - m.totalFreelancerFee)),
    payrollPerFilm: Math.round(perFilm((m) => m.totalPayroll)),
  }
}

// ── run all variants ──────────────────────────────────────────────────────────
const VARIANTS: Variant[] = ['baseline', 'equalWriters', 'fullCapacity', 'freelancerFill']
const cells: Cell[] = []
for (const variant of VARIANTS) for (const years of HORIZONS) for (const st of STRATS) cells.push(aggregate(st, variant, years))

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'writer-bottleneck-summary.json'), JSON.stringify({ seeds: SEEDS, horizons: HORIZONS, cells }, null, 2))

// ── console digest ──
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`
const get = (strategy: string, variant: Variant, years: number) => cells.find((c) => c.strategy === strategy && c.variant === variant && c.years === years)!
const scaleGap = (variant: Variant, years: number) => {
  const ms = STRATS.map((s) => get(s.name, variant, years).medianCash).filter((m) => m > 0)
  return +(Math.max(...ms) / Math.min(...ms)).toFixed(2)
}
// eslint-disable-next-line no-console
console.log(`# D-12 writer/creative-team concurrency diagnostic — ${SEEDS} seeds`)
for (const variant of VARIANTS) {
  // eslint-disable-next-line no-console
  console.log(`\n## variant: ${variant}  (Y1 scale-gap ${scaleGap(variant, 1)}×, Y3 ${scaleGap(variant, 3)}×)`)
  // eslint-disable-next-line no-console
  console.log(`  strat        writers  Y3films  filmsPerYr  slotIdle%  noActive%  longIdle  blkTeam  blkWriter  frHires  Y3cash    contrib/film  rev/film`)
  for (const st of STRATS) {
    const c = get(st.name, variant, 3)
    // eslint-disable-next-line no-console
    console.log(
      `  ${st.name.padEnd(11)} ${String(c.contractedWriters).padStart(4)}    ${String(c.medianReleased).padStart(5)}   ${String(c.filmsPerYear).padStart(6)}     ${String((c.slotIdlePctMedian * 100).toFixed(0)).padStart(5)}%     ${String((c.weeksNoActivePctMedian * 100).toFixed(0)).padStart(4)}%    ${String(c.longestIdleMedian).padStart(4)}    ${String(c.medianBlockedTeam).padStart(4)}    ${String(c.medianBlockNoWriter).padStart(5)}   ${String(c.medianFreelancerHires).padStart(5)}   ${fmtM(c.medianCash).padStart(8)}  ${fmtM(c.contribPerFilm).padStart(9)}   ${fmtM(c.studioRevPerFilm).padStart(9)}`,
    )
  }
}
// per-film economics stability across horizons (non-compounding check F)
// eslint-disable-next-line no-console
console.log(`\n## F — per-film contribution stability across horizons (baseline; budgets are fixed multiples of concept cost, NOT cash-scaled)`)
for (const st of STRATS) {
  const y = HORIZONS.map((yr) => fmtM(get(st.name, 'baseline', yr).contribPerFilm)).join('  ')
  // eslint-disable-next-line no-console
  console.log(`  ${st.name.padEnd(11)} Y1/Y3/Y5 contrib/film: ${y}`)
}
// eslint-disable-next-line no-console
console.log(`\nwrote ${join(OUT, 'writer-bottleneck-summary.json')}`)
