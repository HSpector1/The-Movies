// ── D-9 Development study (development ON) — SEPARATE from the official corpus ──
// Owner ruling §1: the OFFICIAL M0A corpus runs development OFF (run-corpus.ts).
// This runner is the SEPARATE D-9 development study: it drives the SAME
// 1000-seed × 2-agent corpus but with tick(state, { develop: true }) so talent
// actual skills grow per completed film. It produces the progression/Potential/
// Work-Ethic/specialist/cross-discipline growth evidence and the full talent-corpus
// statistics required by the D-9 acceptance reporting — and it NEVER writes the
// official summary (out/m0a/*). It writes to out/d9-dev/.
//
// It uses ONLY the frozen public surface (generateWorld / applyActions / tick /
// the agents / the read-only D-9 summaries). No core internals; no unseeded entropy.
//
// Usage:  node dist/src/harness/run-dev-study.js [corpusSize]   (default 1000)
//    or:  node_modules/.bin/vite-node src/harness/run-dev-study.ts [corpusSize]

import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  applyActions,
  DISCIPLINE_ORDER,
  generateWorld,
  OracleAgent,
  RandomAgent,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  tick,
  TUNING,
  workEthicLabel,
  expectedPotentialRange,
} from '../core/index.js'
import type { Discipline, GameState, Talent } from '../core/index.js'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..', '..', '..')
const OUT_DIR = join(repoRoot, 'out', 'd9-dev')

type AgentName = 'random' | 'oracle'

function seedFor(i: number): string {
  return `m0a-${String(i).padStart(4, '0')}`
}

const primaryOf = (t: Talent): Discipline => ROLE_TO_DISCIPLINE[t.role]

// Sum of a talent's actual skills across ALL 24 skills (total skill mass).
function totalActual(t: Talent): number {
  let s = 0
  for (const d of DISCIPLINE_ORDER) for (const k of SKILL_ORDER[d]) s += t.skills[d][k]!.actual
  return s
}
// Sum within one discipline.
function disciplineActual(t: Talent, d: Discipline): number {
  let s = 0
  for (const k of SKILL_ORDER[d]) s += t.skills[d][k]!.actual
  return s
}

// A talent's true hidden ceiling-OVR on its primary discipline (roleOVR on ceilings).
function ceilingOVR(t: Talent, d: Discipline): number {
  const ceilAsSkills = { ...t.skills }
  const rec: Record<string, { actual: number; perceived: number }> = {}
  for (const k of SKILL_ORDER[d]) {
    const c = t.ceilings[d][k]!
    rec[k] = { actual: c, perceived: c }
  }
  const clone: Talent = { ...t, skills: { ...ceilAsSkills, [d]: rec } as Talent['skills'] }
  return roleOVR(clone, d)
}

// ── one dev-ON run: drive 52 ticks, capture per-completed-film primary-OVR growth ─
type RunGrowth = {
  // per talent id: primary discipline OVR at start and end, plus completed films.
  perTalent: Map<
    string,
    {
      primary: Discipline
      startOVR: number
      startTotal: number
      startPrimaryTotal: number
      films: number // completed productions this talent performed in (any discipline)
      largestOneFilmOVRJump: number
      age: number
      workEthic: number
      ceilingOVR: number
      visibleEstLow: number // start-of-run visible potential estimate (primary)
      visibleEstHigh: number
    }
  >
}

function runDevOn(seed: string, agentName: AgentName): {
  endTalent: Talent[]
  growth: RunGrowth
  completedFilms: number
} {
  const agent = agentName === 'oracle' ? OracleAgent : RandomAgent
  let state: GameState = generateWorld(seed)

  const perTalent: RunGrowth['perTalent'] = new Map()
  for (const t of state.talent) {
    const p = primaryOf(t)
    const est = expectedPotentialRange(t, p, seed)
    perTalent.set(t.id, {
      primary: p,
      startOVR: roleOVR(t, p),
      startTotal: totalActual(t),
      startPrimaryTotal: disciplineActual(t, p),
      films: 0,
      largestOneFilmOVRJump: 0,
      age: t.age,
      workEthic: t.workEthic,
      ceilingOVR: ceilingOVR(t, p),
      visibleEstLow: est.low,
      visibleEstHigh: est.high,
    })
  }

  // Track per-talent primary OVR across ticks to measure the largest one-tick jump,
  // and count films (a production releases → its performers each did one film).
  const prevOVR = new Map<string, number>()
  const byId = () => new Map(state.talent.map((t) => [t.id, t]))
  let idx = byId()
  for (const [id, t] of idx) prevOVR.set(id, roleOVR(t, primaryOf(t)))

  let recordedReleaseCount = 0
  const performersOf = (state0: GameState, productionId: string): string[] => {
    const p = state0.studio.releasedFilms.find((f) => f.productionId === productionId)
    if (!p) return []
    // We reconstruct performers from the release's production is gone; instead we
    // count films at the release moment below by diffing releasedFilms.
    return []
  }
  void performersOf

  // We must know WHO performed on each released film. Productions carry that; capture
  // the mapping productionId → performer ids at greenlight (from activeProductions).
  const performersByProd = new Map<string, string[]>()

  const TICKS = TUNING.TICKS_PER_YEAR
  for (let t = 0; t < TICKS; t++) {
    const activeBefore = new Set(state.studio.activeProductions.map((p) => p.id))
    const actions = agent.chooseActions(state)
    state = applyActions(state, actions)

    // Capture performers of any newly-active production.
    for (const p of state.studio.activeProductions) {
      if (!activeBefore.has(p.id)) {
        const ids = [p.writerId, p.directorId, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craftIds]
        performersByProd.set(p.id, ids)
      }
    }

    state = tick(state, { develop: true })

    // New releases this tick.
    const newReleases = state.studio.releasedFilms.slice(recordedReleaseCount)
    recordedReleaseCount = state.studio.releasedFilms.length
    for (const film of newReleases) {
      const ids = performersByProd.get(film.productionId) ?? []
      for (const id of ids) {
        const rec = perTalent.get(id)
        if (rec) rec.films += 1
      }
    }

    // Largest one-tick primary-OVR jump per talent.
    idx = byId()
    for (const [id, tt] of idx) {
      const p = primaryOf(tt)
      const now = roleOVR(tt, p)
      const prev = prevOVR.get(id) ?? now
      const jump = now - prev
      const rec = perTalent.get(id)
      if (rec && jump > rec.largestOneFilmOVRJump) rec.largestOneFilmOVRJump = jump
      prevOVR.set(id, now)
    }
  }

  return { endTalent: state.talent, growth: { perTalent }, completedFilms: recordedReleaseCount }
}

// ── statistics accumulation ───────────────────────────────────────────────────
type Stats = {
  runs: number
  releases: number
  // OVR distribution by discipline (all talent × all seeds, worldgen-fresh)
  ovrByDiscipline: Record<Discipline, number[]>
  // primary-OVR counts
  primary90: number
  primary95: number
  primary99: number
  primaryTotal: number
  // work ethic distribution (primary talent counts by label)
  weLabels: Record<string, number>
  weValues: number[]
  // correlations (accumulators)
  abilityWE: Corr
  potentialWE: Corr
  // secondary usable
  usableSecondary: number
  multiHyphenate: number // ≥2 disciplines with OVR ≥ 60
  specialistCount: number // primary discipline is a spiked/peaked profile
  talentCount: number
  // growth
  totalSkillGains: number[] // per completed-film exercised-skill gain samples (approx via per-talent)
  perFilmGainSamples: number[]
  largestOneFilmOVRJump: number
  // dev outcomes by WE tier
  weTierGain: Record<string, { gainSum: number; n: number }>
  ageTierGain: Record<string, { gainSum: number; n: number }>
  underachieve: number // materially below expected Potential at year end
  underachieveTotal: number
  exceedVisible: number // exceeded original visible estimate
  exceedVisibleTotal: number
  // potential tier distribution (primary)
  potentialTiers: Record<string, number>
}

type Corr = { n: number; sx: number; sy: number; sxy: number; sxx: number; syy: number }
const newCorr = (): Corr => ({ n: 0, sx: 0, sy: 0, sxy: 0, sxx: 0, syy: 0 })
function addCorr(c: Corr, x: number, y: number): void {
  c.n++
  c.sx += x
  c.sy += y
  c.sxy += x * y
  c.sxx += x * x
  c.syy += y * y
}
function corrOf(c: Corr): number {
  const num = c.n * c.sxy - c.sx * c.sy
  const den = Math.sqrt((c.n * c.sxx - c.sx * c.sx) * (c.n * c.syy - c.sy * c.sy))
  return den === 0 ? 0 : num / den
}

function newStats(): Stats {
  return {
    runs: 0,
    releases: 0,
    ovrByDiscipline: { acting: [], writing: [], directing: [], craft: [] },
    primary90: 0,
    primary95: 0,
    primary99: 0,
    primaryTotal: 0,
    weLabels: {},
    weValues: [],
    abilityWE: newCorr(),
    potentialWE: newCorr(),
    usableSecondary: 0,
    multiHyphenate: 0,
    specialistCount: 0,
    talentCount: 0,
    totalSkillGains: [],
    perFilmGainSamples: [],
    largestOneFilmOVRJump: 0,
    weTierGain: {},
    ageTierGain: {},
    underachieve: 0,
    underachieveTotal: 0,
    exceedVisible: 0,
    exceedVisibleTotal: 0,
    potentialTiers: {},
  }
}

const WE_TIER = (we: number): string =>
  we < 30 ? 'Poor(1-29)' : we < 50 ? 'Inconsistent(30-49)' : we < 70 ? 'Professional(50-69)' : we < 85 ? 'Driven(70-84)' : we < 95 ? 'Exceptional(85-94)' : 'Relentless(95-99)'
const AGE_TIER = (age: number): string =>
  age < 26 ? 'young(<26)' : age < 40 ? 'mid(26-39)' : age < 55 ? 'veteran(40-54)' : 'senior(55+)'

// A talent's primary discipline "is a specialist" if one skill exceeds the mean of
// the other five by a clear margin (a spiked/peaked profile per D-9.13).
function isSpecialist(t: Talent, d: Discipline): boolean {
  const vals = SKILL_ORDER[d].map((k) => t.skills[d][k]!.perceived)
  const max = Math.max(...vals)
  const rest = vals.filter((v) => v !== max)
  const restMean = rest.reduce((a, b) => a + b, 0) / rest.length
  return max - restMean >= 15
}

// Accumulate the worldgen-fresh corpus statistics (talent distributions) — these
// are development-independent; measured once per seed from generateWorld.
function addWorldgenStats(stats: Stats, world: GameState, seed: string): void {
  for (const t of world.talent) {
    const p = primaryOf(t)
    // OVR by discipline (all four).
    for (const d of DISCIPLINE_ORDER) stats.ovrByDiscipline[d].push(roleOVR(t, d))
    // primary-OVR thresholds.
    const pOVR = roleOVR(t, p)
    stats.primaryTotal++
    if (pOVR >= 90) stats.primary90++
    if (pOVR >= 95) stats.primary95++
    if (pOVR >= 99) stats.primary99++
    // work ethic.
    stats.weValues.push(t.workEthic)
    stats.weLabels[workEthicLabel(t.workEthic)] = (stats.weLabels[workEthicLabel(t.workEthic)] ?? 0) + 1
    // ability/WE + potential/WE correlations (primary discipline).
    addCorr(stats.abilityWE, pOVR, t.workEthic)
    addCorr(stats.potentialWE, ceilingOVR(t, p), t.workEthic)
    // usable secondary: any NON-primary discipline with OVR ≥ 60.
    let secondaryUsable = false
    let disciplinesAt60 = 0
    for (const d of DISCIPLINE_ORDER) {
      const o = roleOVR(t, d)
      if (o >= 60) disciplinesAt60++
      if (d !== p && o >= 60) secondaryUsable = true
    }
    if (secondaryUsable) stats.usableSecondary++
    if (disciplinesAt60 >= 2) stats.multiHyphenate++
    if (isSpecialist(t, p)) stats.specialistCount++
    stats.talentCount++
    // potential tier distribution (primary), deterministic per (seed, talent, disc).
    const upside = ceilingOVR(t, p) - pOVR
    const tier = upside < 3 ? 'Limited' : upside < 9 ? 'Steady' : upside < 16 ? 'Promising' : upside < 25 ? 'HighUpside' : 'ExceptionalUpside'
    stats.potentialTiers[tier] = (stats.potentialTiers[tier] ?? 0) + 1
  }
  void seed
}

function pct(a: number, b: number): string {
  return b === 0 ? '0%' : `${((100 * a) / b).toFixed(2)}%`
}
function quantiles(xs: number[]): { min: number; p25: number; median: number; p75: number; p90: number; max: number; mean: number } {
  if (xs.length === 0) return { min: 0, p25: 0, median: 0, p75: 0, p90: 0, max: 0, mean: 0 }
  const s = [...xs].sort((a, b) => a - b)
  const q = (f: number) => s[Math.min(s.length - 1, Math.floor(f * s.length))]!
  return {
    min: s[0]!,
    p25: q(0.25),
    median: q(0.5),
    p75: q(0.75),
    p90: q(0.9),
    max: s[s.length - 1]!,
    mean: s.reduce((a, b) => a + b, 0) / s.length,
  }
}
function histo(xs: number[], edges: number[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (let i = 0; i < edges.length - 1; i++) out[`${edges[i]}-${edges[i + 1]! - 1}`] = 0
  for (const x of xs) {
    for (let i = 0; i < edges.length - 1; i++) {
      if (x >= edges[i]! && x < edges[i + 1]!) {
        out[`${edges[i]}-${edges[i + 1]! - 1}`]++
        break
      }
    }
  }
  return out
}

// ── main ──────────────────────────────────────────────────────────────────────
function main(): void {
  const arg = process.argv[2]
  const corpusSize = arg === undefined ? 1000 : Number(arg)
  const t0 = Date.now()

  const stats = newStats()

  for (let i = 1; i <= corpusSize; i++) {
    const seed = seedFor(i)
    // Worldgen-fresh corpus statistics: measured once per seed (agent-independent).
    addWorldgenStats(stats, generateWorld(seed), seed)

    for (const agentName of ['random', 'oracle'] as AgentName[]) {
      const { endTalent, growth, completedFilms } = runDevOn(seed, agentName)
      stats.runs++
      stats.releases += completedFilms

      const endById = new Map(endTalent.map((t) => [t.id, t]))
      for (const [id, g] of growth.perTalent) {
        const end = endById.get(id)!
        const p = g.primary
        const endPrimaryTotal = disciplineActual(end, p)
        const endTotal = totalActual(end)
        const totalGain = endTotal - g.startTotal
        const primaryGain = endPrimaryTotal - g.startPrimaryTotal
        if (g.films > 0) {
          // per-completed-film avg skill gain (across that talent's films).
          stats.perFilmGainSamples.push(primaryGain / g.films)
          stats.totalSkillGains.push(primaryGain)
          // dev outcome by WE tier / age tier (per-film primary gain).
          const wt = WE_TIER(g.workEthic)
          stats.weTierGain[wt] = stats.weTierGain[wt] ?? { gainSum: 0, n: 0 }
          stats.weTierGain[wt].gainSum += primaryGain / g.films
          stats.weTierGain[wt].n++
          const at = AGE_TIER(g.age)
          stats.ageTierGain[at] = stats.ageTierGain[at] ?? { gainSum: 0, n: 0 }
          stats.ageTierGain[at].gainSum += primaryGain / g.films
          stats.ageTierGain[at].n++
          // underachieving expected Potential: end primary OVR materially below the
          // hidden ceiling-OVR (headroom left ≥ 8 despite ≥ 3 films) — a proxy for
          // "materially underachieving expected Potential" at year end.
          const endOVR = roleOVR(end, p)
          if (g.films >= 3) {
            stats.underachieveTotal++
            if (g.ceilingOVR - endOVR >= 8) stats.underachieve++
          }
          // exceeded original visible estimate: end primary OVR above the start-of-run
          // visible estimate band high.
          stats.exceedVisibleTotal++
          if (endOVR > g.visibleEstHigh) stats.exceedVisible++
        }
        void totalGain
        if (g.largestOneFilmOVRJump > stats.largestOneFilmOVRJump) stats.largestOneFilmOVRJump = g.largestOneFilmOVRJump
      }
    }
  }

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

  // ── assemble report ──
  const summary = {
    corpusSize,
    runs: stats.runs,
    releases: stats.releases,
    talentSampled: stats.talentCount,
    elapsedSeconds: Number(elapsed),
    ovrDistributionByDiscipline: Object.fromEntries(
      DISCIPLINE_ORDER.map((d) => [d, { ...quantiles(stats.ovrByDiscipline[d]), histogram: histo(stats.ovrByDiscipline[d], [0, 50, 60, 70, 80, 90, 95, 100]) }]),
    ),
    primaryOVR: {
      total: stats.primaryTotal,
      '90plus': stats.primary90,
      '90plusPct': pct(stats.primary90, stats.primaryTotal),
      '95plus': stats.primary95,
      '95plusPct': pct(stats.primary95, stats.primaryTotal),
      '99': stats.primary99,
      '99Pct': pct(stats.primary99, stats.primaryTotal),
    },
    workEthic: { distribution: stats.weLabels, ...quantiles(stats.weValues) },
    potentialTierDistribution: stats.potentialTiers,
    abilityWorkEthicCorrelation: Number(corrOf(stats.abilityWE).toFixed(4)),
    potentialWorkEthicCorrelation: Number(corrOf(stats.potentialWE).toFixed(4)),
    usableSecondaryPct: pct(stats.usableSecondary, stats.talentCount),
    multiHyphenatePct: pct(stats.multiHyphenate, stats.talentCount),
    specialistPct: pct(stats.specialistCount, stats.talentCount),
    growth: {
      avgSkillGainPerCompletedFilm_primaryDiscipline: Number(
        (stats.perFilmGainSamples.reduce((a, b) => a + b, 0) / Math.max(1, stats.perFilmGainSamples.length)).toFixed(3),
      ),
      perFilmGainQuantiles: quantiles(stats.perFilmGainSamples),
      largestOneFilmPrimaryOVRIncrease: stats.largestOneFilmOVRJump,
      totalPrimaryGainQuantiles: quantiles(stats.totalSkillGains),
    },
    devOutcomesByWorkEthicTier: Object.fromEntries(
      Object.entries(stats.weTierGain).map(([k, v]) => [k, { avgPerFilmPrimaryGain: Number((v.gainSum / v.n).toFixed(3)), n: v.n }]),
    ),
    devOutcomesByAgeTier: Object.fromEntries(
      Object.entries(stats.ageTierGain).map(([k, v]) => [k, { avgPerFilmPrimaryGain: Number((v.gainSum / v.n).toFixed(3)), n: v.n }]),
    ),
    materiallyUnderachievingPotentialPct: pct(stats.underachieve, stats.underachieveTotal),
    exceedingOriginalVisibleEstimatePct: pct(stats.exceedVisible, stats.exceedVisibleTotal),
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'dev-study-summary.json'), JSON.stringify(summary, null, 2))
  console.log(`D-9 dev study (development ON): ${corpusSize} seeds × 2 agents = ${stats.runs} runs, ${stats.releases} releases in ${elapsed}s`)
  console.log(`  summary: ${join(OUT_DIR, 'dev-study-summary.json')}`)
  console.log(JSON.stringify(summary, null, 2))
}

main()
