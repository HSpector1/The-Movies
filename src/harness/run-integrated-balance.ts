// ── D-12 integrated-engine balance rerun (step 8) ─────────────────────────────
// Confirms the four owner gates on the REAL engine, not the abstraction. Drives the actual
// core surface — beginFounding → signContract → foundStudio → applyActions(greenlight) → tick
// — over N years across seeds. Strategies are defined by SELECTION from each seed's REAL
// deterministic applicant pool (not synthetic rosters), then a greedy greenlight policy fills
// production slots whenever the solvency gate allows. Output labels are [I] (integrated), to be
// read ALONGSIDE the structural [S] harness (run-economy-balance-study.ts). Absolute cash still
// overshoots real play (disclosed limitation, box-office = gross), so read RELATIVE/structural
// results — the gates are about dominance and viability, not absolute dollars.

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
} from '../core/index.js'
import type { GameState, CreativeRole, Talent, CastSlot } from '../core/index.js'

const SEEDS = Number(process.argv[2] ?? 80)
const HORIZONS = [1, 3, 5]
const OUT = join(process.cwd(), 'out', 'economy-balance')

// ── strategy definitions (roster SELECTION from the real pool + budget policy) ─
type Rank = 'best' | 'cheapest' | 'prospect'
type Strat = {
  name: string
  counts: Record<CreativeRole, number> // target signings per role (≥ FOUNDING_MINIMUMS, capped by pool)
  rank: Rank
  negMult: number // negative = concept.baseNegativeCost × negMult
  marketing: number
  tentpole?: { reserve: number; negMult: number; marketing: number; cooldownWeeks: number }
}
const STRATS: Strat[] = [
  { name: 'bargainBasement', counts: { actor: 3, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.85, marketing: 200_000 },
  { name: 'lean', counts: { actor: 4, director: 1, writer: 1, craft: 1 }, rank: 'cheapest', negMult: 0.95, marketing: 400_000 },
  { name: 'balanced', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.1, marketing: 1_200_000 },
  { name: 'largeDepth', counts: { actor: 8, director: 3, writer: 3, craft: 2 }, rank: 'best', negMult: 1.25, marketing: 2_000_000 },
  { name: 'star', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'best', negMult: 1.4, marketing: 3_000_000 },
  { name: 'prospect', counts: { actor: 6, director: 2, writer: 2, craft: 2 }, rank: 'prospect', negMult: 1.0, marketing: 600_000 },
  {
    name: 'tentpole',
    counts: { actor: 6, director: 2, writer: 2, craft: 2 },
    rank: 'best',
    negMult: 1.0,
    marketing: 600_000,
    tentpole: { reserve: 8_000_000, negMult: 3.0, marketing: 4_000_000, cooldownWeeks: 30 },
  },
]

const ROLES: CreativeRole[] = ['actor', 'director', 'writer', 'craft']

// Rank a role's applicants for a strategy. `best` = highest OVR+fame; `cheapest` = lowest
// OVR+fame (proxy for salary); `prospect` = LOW fame but decent OVR (cheap now, upside).
function rankTalent(list: Talent[], role: CreativeRole, rank: Rank): Talent[] {
  const ovr = (t: Talent) => roleOVR(t, ROLE_TO_DISCIPLINE[role])
  const arr = [...list]
  if (rank === 'best') arr.sort((a, b) => ovr(b) + b.fame - (ovr(a) + a.fame))
  else if (rank === 'cheapest') arr.sort((a, b) => ovr(a) + a.fame - (ovr(b) + b.fame))
  else arr.sort((a, b) => ovr(b) - b.fame * 0.5 - (ovr(a) - a.fame * 0.5)) // prospect: OVR up, fame down
  return arr
}

// Found a studio for `seed` under strategy `st`: sign the selected roster from the real pool.
function foundFor(seed: string, st: Strat): GameState {
  let s = beginFounding(generateWorld(seed))
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

// Assemble ONE legal greenlight from currently-free (non-busy) roster talent, or null.
function assemble(s: GameState, st: Strat, conceptIdx: number, isTentpole: boolean): { action: Parameters<typeof applyActions>[1][number]; committed: number } | null {
  const busy = busyTalentIds(s)
  const free = (role: CreativeRole) =>
    rankTalent(
      s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!).filter((t) => t.role === role && !busy.has(t.id)),
      role,
      'best',
    )
  const w = free('writer')[0]
  const d = free('director')[0]
  const a = free('actor')
  const c = free('craft')[0]
  if (!w || !d || !c || a.length < 3) return null
  const concept = s.concepts[conceptIdx % s.concepts.length]!
  const negMult = isTentpole ? st.tentpole!.negMult : st.negMult
  const marketing = isTentpole ? st.tentpole!.marketing : st.marketing
  const negative = Math.round(concept.baseNegativeCost * negMult)
  const committed = negative + marketing
  if (!canAfford(s, committed).ok) return null
  const cast = { lead: a[0]!.id, antagonist: a[1]!.id, support: a[2]!.id } as Record<CastSlot, string>
  return {
    committed,
    action: {
      kind: 'greenlight',
      production: {
        conceptId: concept.id,
        shape: { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' },
        promise: { genre: concept.genre, intendedSegments: ['adult'], ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] } },
        writerId: w.id,
        directorId: d.id,
        cast,
        craftIds: [c.id],
        budget: { negative, marketing },
      },
    },
  }
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}
function quantile(xs: number[], q: number): number {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.max(0, Math.min(s.length - 1, Math.floor(q * s.length)))]!
}

// One integrated game: found → each week greenlight to fill free slots → tick. N years.
function runGame(seed: string, st: Strat, years: number): { finalCash: number; releases: number; everNeg: boolean; endPositive: boolean } {
  let s = foundFor(seed, st)
  const weeks = years * TUNING.TICKS_PER_YEAR
  let conceptIdx = 0
  let everNeg = false
  let lastTentpoleWeek = -10_000
  for (let wk = 0; wk < weeks; wk++) {
    // Fill every free production slot this week (bounded by MAX_CONCURRENT + free talent + cash).
    for (let guard = 0; guard < TUNING.MAX_CONCURRENT_PRODUCTIONS + 1; guard++) {
      if (s.studio.activeProductions.length >= TUNING.MAX_CONCURRENT_PRODUCTIONS) break
      const wantTentpole = st.tentpole !== undefined && s.studio.cash - st.tentpole.reserve >= 0 && wk - lastTentpoleWeek > st.tentpole.cooldownWeeks
      const g = assemble(s, st, conceptIdx, wantTentpole)
      if (!g) break
      s = applyActions(s, [g.action])
      conceptIdx += 1
      if (wantTentpole) lastTentpoleWeek = wk
    }
    s = tick(s, { develop: true })
    if (s.studio.cash < 0) everNeg = true
  }
  return { finalCash: s.studio.cash, releases: s.studio.releasedFilms.length, everNeg, endPositive: s.studio.cash > 0 }
}

// ── sweep ──────────────────────────────────────────────────────────────────────
type Row = { strategy: string; years: number; median: number; p10: number; films: number; everNegFreq: number; endPositiveFreq: number }
const rows: Row[] = []
const winsByYear: Record<number, Record<string, number>> = {}

for (const years of HORIZONS) {
  winsByYear[years] = {}
  const cashBySeed: Record<number, Record<string, number>> = {}
  for (const st of STRATS) {
    const finals: number[] = []
    const films: number[] = []
    let everNeg = 0
    let endPos = 0
    for (let i = 0; i < SEEDS; i++) {
      const r = runGame(`int-${i}`, st, years)
      finals.push(r.finalCash)
      films.push(r.releases)
      if (r.everNeg) everNeg += 1
      if (r.endPositive) endPos += 1
      cashBySeed[i] ??= {}
      cashBySeed[i]![st.name] = r.finalCash
    }
    rows.push({
      strategy: st.name,
      years,
      median: Math.round(median(finals)),
      p10: Math.round(quantile(finals, 0.1)),
      films: Math.round(median(films)),
      everNegFreq: +(everNeg / SEEDS).toFixed(3),
      endPositiveFreq: +(endPos / SEEDS).toFixed(3),
    })
  }
  for (let i = 0; i < SEEDS; i++) {
    let best = ''
    let bestCash = -Infinity
    for (const st of STRATS) {
      const c = cashBySeed[i]?.[st.name] ?? -Infinity
      if (c > bestCash) {
        bestCash = c
        best = st.name
      }
    }
    winsByYear[years]![best] = (winsByYear[years]![best] ?? 0) + 1
  }
}

// ── gate evaluation (the FOUR owner gates on integrated numbers) ───────────────
const med = (strategy: string, years: number) => rows.find((r) => r.strategy === strategy && r.years === years)!.median
const comparable = ['star', 'balanced', 'largeDepth']
const disciplined = ['bargainBasement', 'lean', 'prospect', 'balanced', 'largeDepth', 'star']
const winShare = (years: number, strategy: string) => {
  const w = winsByYear[years]!
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  return (w[strategy] ?? 0) / total
}
const perHorizon = HORIZONS.map((years) => {
  const cm = comparable.map((s) => med(s, years))
  const dm = disciplined.map((s) => med(s, years)).filter((m) => m > 0)
  const w = winsByYear[years]!
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  const winner = Object.entries(w).sort((a, b) => b[1] - a[1])[0]![0]
  const others = comparable.filter((s) => s !== 'star').map((s) => med(s, years))
  return {
    years,
    comparableSpread: +(Math.max(...cm) / Math.min(...cm)).toFixed(3),
    scaleSpread: +(Math.max(...dm) / Math.min(...dm)).toFixed(3),
    winner,
    topWinShare: +(Math.max(...Object.values(w)) / total).toFixed(3),
    starWinShare: +winShare(years, 'star').toFixed(3),
    starAdvVsNextComparable: +(med('star', years) / Math.max(...others) - 1).toFixed(3),
  }
})
// Gate 3 measures END-STATE Y3 cash (finalCash > 0) ≥ 95% + p10 > 0 (owner's wording),
// NOT transient dips (everNeg) — a dip that recovers is the intended survivable-negative design.
const smalls = ['bargainBasement', 'lean', 'prospect'].map((s) => {
  const r = rows.find((x) => x.strategy === s && x.years === 3)!
  return { strategy: s, p10: r.p10, endPositiveRate: r.endPositiveFreq, everNegRate: r.everNegFreq, films: r.films, p10Positive: r.p10 > 0 }
})
const gates = {
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
  gate3_smallStudio: { detail: smalls, pass: smalls.every((x) => x.p10Positive && x.endPositiveRate >= 0.95 && x.films > 0) },
  gate4_scaleSpread: { y3: perHorizon.find((h) => h.years === 3)!.scaleSpread, targetLe26: perHorizon.find((h) => h.years === 3)!.scaleSpread <= 2.6 },
}

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'integrated-summary.json'), JSON.stringify({ seeds: SEEDS, horizons: HORIZONS, rows, winsByYear, perHorizon, gates }, null, 2))

// ── console digest ──
const fmtM = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`
// eslint-disable-next-line no-console
console.log(`# [I] Integrated-engine balance rerun — ${SEEDS} seeds × ${HORIZONS.join('/')}yr (REAL tick+reception)`)
for (const years of HORIZONS) {
  // eslint-disable-next-line no-console
  console.log(`\n## Y${years} median final cash + films`)
  for (const st of STRATS) {
    const r = rows.find((x) => x.strategy === st.name && x.years === years)!
    // eslint-disable-next-line no-console
    console.log(`  ${st.name.padEnd(11)} ${fmtM(r.median).padStart(9)}  p10 ${fmtM(r.p10).padStart(9)}  films ${String(r.films).padStart(3)}  endPos ${(r.endPositiveFreq * 100).toFixed(0)}%  everNeg ${(r.everNegFreq * 100).toFixed(0)}%`)
  }
  const w = winsByYear[years]!
  const total = Object.values(w).reduce((a, b) => a + b, 0)
  // eslint-disable-next-line no-console
  console.log('  win: ' + Object.entries(w).sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s}=${((n / total) * 100).toFixed(0)}%`).join(' '))
}
// eslint-disable-next-line no-console
console.log(`\n## Revised gates (integrated)`)
for (const h of perHorizon) {
  // eslint-disable-next-line no-console
  console.log(`  Y${h.years}: comparableSpread ${h.comparableSpread}× · scaleSpread ${h.scaleSpread}× · winner ${h.winner} · starWin ${(h.starWinShare * 100).toFixed(0)}% · starAdvVsNext ${(h.starAdvVsNextComparable * 100).toFixed(0)}%`)
}
// eslint-disable-next-line no-console
console.log(`  G1 comparable-dominance: ${JSON.stringify(gates.gate1_comparableDominance)}`)
// eslint-disable-next-line no-console
console.log(`  G2 star-dominance: ${JSON.stringify(gates.gate2_starDominance)}`)
// eslint-disable-next-line no-console
console.log(`  G3 small-studio: pass=${gates.gate3_smallStudio.pass} ${JSON.stringify(gates.gate3_smallStudio.detail)}`)
// eslint-disable-next-line no-console
console.log(`  G4 scale-spread: ${JSON.stringify(gates.gate4_scaleSpread)}`)
// eslint-disable-next-line no-console
console.log(`\nwrote ${join(OUT, 'integrated-summary.json')}`)
