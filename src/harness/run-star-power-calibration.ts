// ── D-14 Star Power calibration harness (read-only; run via vite-node) ────────
// Run: node_modules/.bin/vite-node src/harness/run-star-power-calibration.ts
//
// Calibrates computeStarPowerDelta against the owner §6 targets. The resolver is a
// PURE function of the realized film outcome + role + current fame, so the §6 A–E
// scenarios are evaluated DIRECTLY at representative outcomes, and trajectories are
// produced by iterating the resolver (feeding the new fame back in). A final section
// drives the REAL engine lifecycle (found → cast → release) to confirm live behavior.

import { computeStarPowerDelta } from '../core/starPower.js'
import type { FilmParticipantRole } from '../core/types.js'
import { applyActions, beginFounding, generateWorld, tick, TUNING } from '../core/index.js'
import type { CastSlot, CreativeRole, GameState } from '../core/index.js'

const M = (n: number) => `$${(n / 1_000_000).toFixed(2)}M`
const D = (n: number) => (n >= 0 ? '+' : '') + n.toFixed(2)

// Representative realized outcomes for the §6 scenarios (reach $, audience 0..100, forecast ratio).
type Scenario = { key: string; total: number; aud: number; fcRatio: number; band: string }
const SCENARIOS: Scenario[] = [
  { key: 'A obscure weak', total: 2_000_000, aud: 35, fcRatio: 0.8, band: '0.0..+0.5' },
  { key: 'B modest ordinary', total: 6_000_000, aud: 52, fcRatio: 1.0, band: '+0.8..+2.0' },
  { key: 'C visible success', total: 13_000_000, aud: 66, fcRatio: 1.08, band: '+2.5..+5.0' },
  { key: 'D true breakout', total: 28_000_000, aud: 78, fcRatio: 1.2, band: '+5.0..+9.0' },
  { key: 'E established fail', total: 18_000_000, aud: 30, fcRatio: 0.75, band: '-1.0..-3.0' },
]

function delta(fame: number, role: FilmParticipantRole, s: Scenario): number {
  return computeStarPowerDelta({
    fameBefore: fame,
    role,
    realizedTotal: s.total,
    audienceScore: s.aud,
    expectedTotal: s.total / s.fcRatio,
  }).delta
}

console.log('\n══════════ D-14 STAR POWER CALIBRATION ══════════')
console.log(`BASE_GAIN ${TUNING.STAR_POWER_BASE_GAIN}  REACH_HALF ${M(TUNING.STAR_POWER_REACH_HALF)}  SAT_EXP ${TUNING.STAR_POWER_SAT_EXP}  ESTAB_LOSS ${TUNING.STAR_POWER_ESTAB_LOSS}`)

console.log('\n## §6 A–E — Lead beginning near Star Power 5–15 (fame=10)')
for (const s of SCENARIOS) {
  const startFame = s.key.startsWith('E') ? 70 : 10 // E is an ESTABLISHED star
  console.log(`  ${s.key.padEnd(20)} reach ${M(s.total)} aud ${s.aud} fc×${s.fcRatio}  →  Δ ${D(delta(startFame, 'lead', s))}  (target ${s.band}, fame ${startFame})`)
}

console.log('\n## Unknown obscure FAILURE must NOT be punished (fame 8, Lead, obscure+weak)')
console.log(`  Δ ${D(delta(8, 'lead', { key: '', total: 2_000_000, aud: 33, fcRatio: 0.7, band: '' }))}  (want ≈ 0, not materially negative)`)

console.log('\n## Role comparison under the SAME "visible success" film (fame 10)')
const roles: FilmParticipantRole[] = ['lead', 'antagonist', 'director', 'support', 'writer', 'craft']
for (const r of roles) console.log(`  ${r.padEnd(10)} Δ ${D(delta(10, r, SCENARIOS[2]!))}  (weight ${TUNING.STAR_POWER_ROLE_WEIGHTS[r]})`)

console.log('\n## Saturation — SAME "visible success" film at rising current fame (Lead)')
for (const f of [5, 20, 50, 75, 90]) console.log(`  fame ${String(f).padStart(2)}  Δ ${D(delta(f, 'lead', SCENARIOS[2]!))}`)

// Trajectory: iterate the resolver, feeding the new fame back (models repeated films).
function trajectory(startFame: number, role: FilmParticipantRole, s: Scenario, marks: number[]): string {
  let fame = startFame
  const out: string[] = []
  const target = Math.max(...marks)
  for (let i = 1; i <= target; i++) {
    fame = Math.min(100, Math.max(0, fame + delta(fame, role, s)))
    if (marks.includes(i)) out.push(`${i}:${fame.toFixed(1)}`)
  }
  return out.join('  ')
}

console.log('\n## Trajectories (iterated resolver, Lead)')
console.log(`  Fame 5, repeated MODEST films   → ${trajectory(5, 'lead', SCENARIOS[1]!, [1, 3, 5, 10])}`)
console.log(`  Fame 5, repeated SUCCESS films  → ${trajectory(5, 'lead', SCENARIOS[2]!, [1, 3, 5])}`)
console.log(`  Fame 20, repeated Lead success  → ${trajectory(20, 'lead', SCENARIOS[2]!, [1, 3, 5])}`)
console.log(`  Fame 50 through a BREAKOUT then hits → ${trajectory(50, 'lead', SCENARIOS[3]!, [1, 2, 3])}`)
console.log(`  Fame 75 after one BREAKOUT       → ${trajectory(75, 'lead', SCENARIOS[3]!, [1])}`)
console.log(`  Support vs Lead (success ×5): Lead ${trajectory(5, 'lead', SCENARIOS[2]!, [5])}  Support ${trajectory(5, 'support', SCENARIOS[2]!, [5])}`)

// Fame-farming guard: repeated MEDIOCRE Lead films should NOT snowball to superstar.
console.log('\n## Fame-farming guard — 10 repeated MEDIOCRE Lead films (reach $4M, aud 48)')
const mediocre: Scenario = { key: '', total: 4_000_000, aud: 48, fcRatio: 0.95, band: '' }
console.log(`  fame 5 → ${trajectory(5, 'lead', mediocre, [1, 3, 5, 10])}  (must stay well below superstar)`)

// Creator vs generated: the resolver reads no authored flag → identical by construction.
console.log('\n## Creator vs generated resolver equivalence (same inputs → same delta)')
console.log(`  identical: ${delta(10, 'lead', SCENARIOS[2]!) === delta(10, 'lead', SCENARIOS[2]!) ? 'YES (resolver reads no authored flag)' : 'NO'}`)

// ── Real-engine validation: found → cast an unknown Lead → release several films ──
function foundEngaged(seed: string): GameState {
  let s = beginFounding(generateWorld(seed))
  const pool = s.founding!.applicantIds.map((id) => s.talent.find((t) => t.id === id)!)
  const need: Record<CreativeRole, number> = { writer: 1, director: 1, actor: 3, craft: 1 }
  const toSign: string[] = []
  for (const role of ['actor', 'director', 'writer', 'craft'] as CreativeRole[]) {
    const avail = pool.filter((t) => t.role === role)
    for (const t of avail.slice(0, need[role])) toSign.push(t.id)
  }
  for (const id of toSign) s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: 208 }])
  return applyActions(s, [{ kind: 'foundStudio' }])
}

console.log('\n## REAL ENGINE — unknown Lead across 4 released films (fame tracked)')
try {
  let s = foundEngaged('d14-live')
  const contracted = s.contracts.map((c) => s.talent.find((t) => t.id === c.talentId)!)
  const actors = contracted.filter((t) => t.role === 'actor').sort((a, b) => a.fame - b.fame) // unknown first
  const lead = actors[0]!
  const writer = contracted.find((t) => t.role === 'writer')!
  const director = contracted.find((t) => t.role === 'director')!
  const craft = contracted.find((t) => t.role === 'craft')!
  console.log(`  Lead ${lead.name} start Star Power ${lead.fame.toFixed(1)} (${lead.authored ? 'authored' : 'generated'})`)
  const concept = s.concepts[0]!
  for (let film = 1; film <= 4; film++) {
    const before = s.talent.find((t) => t.id === lead.id)!.fame
    s = applyActions(s, [
      {
        kind: 'greenlight',
        production: {
          conceptId: concept.id,
          shape: { opening: 'slowSetup', midpoint: 'escalation', ending: 'triumph' },
          promise: {
            genre: concept.genre,
            intendedSegments: ['adult'],
            ranges: { intimacy: [-0.5, 0.5], tonalWeight: [-0.5, 0.5], kineticEnergy: [-0.5, 0.5] },
          },
          writerId: writer.id,
          directorId: director.id,
          cast: { lead: lead.id, antagonist: actors[1]!.id, support: actors[2]!.id } as Record<CastSlot, string>,
          craftIds: [craft.id],
          budget: { negative: 5_000_000, marketing: 1_000_000 },
        },
      },
    ])
    const pid = s.studio.activeProductions[s.studio.activeProductions.length - 1]!.id
    for (let k = 0; k < TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS + 6; k++) {
      s = tick(s, { develop: true })
      const run = s.theatricalRuns.find((r) => r.productionId === pid)
      if (run && run.status !== 'active') break
    }
    const after = s.talent.find((t) => t.id === lead.id)!.fame
    const ev = s.careerEvents.find((e) => e.filmId === pid && e.talentId === lead.id)
    const film2 = s.studio.releasedFilms.find((f) => f.productionId === pid)
    console.log(
      `  film ${film}: Star Power ${before.toFixed(1)} → ${after.toFixed(1)} (Δ${D(after - before)})  reach ${film2 ? M(film2.boxOffice.total) : '?'}  aud ${ev ? ev.audienceScore.toFixed(0) : '?'}  reasons [${ev ? ev.reasonCodes.join(',') : '?'}]`,
    )
  }
  console.log(`  total career events recorded: ${s.careerEvents.length}`)
} catch (e) {
  console.log(`  (real-engine section error: ${(e as Error).message})`)
}
console.log('\n═════════════════════════════════════════════════\n')
