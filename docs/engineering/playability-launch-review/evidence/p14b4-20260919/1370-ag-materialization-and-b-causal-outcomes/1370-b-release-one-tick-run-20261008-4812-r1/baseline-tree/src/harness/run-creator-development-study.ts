// ── D-11.C development-path study (SEPARATE from the M0A corpus) ──────────────
// Diagnostic: can a created prospect (35/40/45/50 primary OVR) develop into a strong
// professional over a career, under the EXISTING development rules? Uses the real
// developTalent over ~10 films/year. Writes ONLY to out/creator-baseline/. Deterministic.
// Does NOT retune global development. If strong prospects cannot reach 70/80/85 over a
// reasonable career, that is flagged as a FUTURE development/Acting-School calibration
// issue — NOT solved by creator inflation.
//
// Run:  node_modules/.bin/vite-node src/harness/run-creator-development-study.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  developTalent,
  generateWorld,
  resolveShape,
  roleOVR,
  SKILL_ORDER,
  stream,
  TUNING,
} from '../core/index.js'
import type { DevelopmentContext, FilmShape, Talent } from '../core/index.js'

const SEED = 'creator-dev'
const world = generateWorld(SEED)
const concept = world.concepts[0]!
const SHAPE: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'bittersweet' }
const CTX: DevelopmentContext = {
  concept,
  shape: SHAPE,
  shapeEffects: resolveShape(SHAPE),
  promise: {
    genre: concept.genre,
    intendedSegments: ['adult'],
    ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
  },
  requiredNegative: 2_000_000,
  criticScore: 62,
}

// Build a prospect from a real generated actor, overriding acting skills to hit ~targetOVR,
// ceilings by potential, and work ethic. Reuses a valid Talent shape.
const templateActor: Talent = world.talent.find((t) => t.role === 'actor')!
function makeProspect(targetOVR: number, highPotential: boolean, highWE: boolean): Talent {
  const x = Math.round((targetOVR + 46) / 1.5) // flat-skill value for a target OVR (see ovrCore)
  const headroom = highPotential ? 40 : 8
  const t: Talent = JSON.parse(JSON.stringify(templateActor)) as Talent
  t.age = 24
  t.workEthic = highWE ? 88 : 55
  for (const d of ['acting', 'writing', 'directing', 'craft'] as const) {
    for (const k of SKILL_ORDER[d]) {
      const v = d === 'acting' ? x : TUNING.BALANCED_CREATOR_SKILL_FLOOR
      t.skills[d][k] = { actual: v, perceived: v }
      t.ceilings[d][k] = Math.min(99, v + headroom)
    }
    t.devRate[d] = 1.0
    for (const g of Object.keys(t.genreExperience[d]) as (keyof (typeof t.genreExperience)[typeof d])[]) {
      t.genreExperience[d][g] = { actual: 0, perceived: 0 }
    }
    t.workHistory[d] = 0
  }
  return t
}

const FILMS_PER_YEAR = 10
const MILESTONES = [1, 3, 5, 8, 10]
const MAX_YEARS = 10

function developCareer(seed: string, prospect: Talent): Record<number, number> {
  let t = prospect
  const byYear: Record<number, number> = {}
  for (let year = 1; year <= MAX_YEARS; year++) {
    for (let f = 0; f < FILMS_PER_YEAR; f++) {
      const s = stream(seed, 'develop', `${year}:${f}:${t.id}`)
      t = developTalent(t, 'acting', CTX, s)
    }
    if (MILESTONES.includes(year)) byYear[year] = roleOVR(t, 'acting')
  }
  return byYear
}

const COMBOS = [
  { key: 'ordPot-ordWE', highPotential: false, highWE: false },
  { key: 'highPot-ordWE', highPotential: true, highWE: false },
  { key: 'ordPot-highWE', highPotential: false, highWE: true },
  { key: 'highPot-highWE', highPotential: true, highWE: true },
] as const
const STARTS = [35, 40, 45, 50]

type Cell = { startOVR: number; combo: string; startActual: number; byYear: Record<number, number>; reached70: boolean; reached80: boolean; reached85: boolean }
const cells: Cell[] = []
for (const start of STARTS) {
  for (const c of COMBOS) {
    const prospect = makeProspect(start, c.highPotential, c.highWE)
    const startActual = roleOVR(prospect, 'acting')
    // Vary the seed per (start, combo) so it is not one identical trajectory.
    const byYear = developCareer(`${SEED}:${start}:${c.key}`, prospect)
    const y10 = byYear[10] ?? startActual
    cells.push({
      startOVR: start,
      combo: c.key,
      startActual,
      byYear,
      reached70: Object.values(byYear).some((v) => v >= 70),
      reached80: Object.values(byYear).some((v) => v >= 80),
      reached85: y10 >= 85 || Object.values(byYear).some((v) => v >= 85),
    })
  }
}

const summary = {
  seed: SEED,
  filmsPerYear: FILMS_PER_YEAR,
  milestones: MILESTONES,
  note: 'Diagnostic only. Uses the existing developTalent rules; global development was NOT retuned.',
  cells,
  reachability: {
    any70: cells.some((c) => c.reached70),
    any80: cells.some((c) => c.reached80),
    any85: cells.some((c) => c.reached85),
    highPotHighWE_from45_y10: cells.find((c) => c.startOVR === 45 && c.combo === 'highPot-highWE')?.byYear[10] ?? null,
  },
}

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', '..', 'out', 'creator-baseline')
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'development-summary.json'), JSON.stringify(summary, null, 2))

// eslint-disable-next-line no-console
console.log('# D-11.C development-path study (existing rules; diagnostic)')
for (const c of cells) {
  // eslint-disable-next-line no-console
  console.log(
    `  start~${c.startOVR} (${c.combo}) actual ${c.startActual}: y1=${c.byYear[1]} y3=${c.byYear[3]} y5=${c.byYear[5]} y8=${c.byYear[8]} y10=${c.byYear[10]}  [70:${c.reached70} 80:${c.reached80} 85:${c.reached85}]`,
  )
}
// eslint-disable-next-line no-console
console.log(`reachability across cells: 70=${summary.reachability.any70} 80=${summary.reachability.any80} 85=${summary.reachability.any85}`)
