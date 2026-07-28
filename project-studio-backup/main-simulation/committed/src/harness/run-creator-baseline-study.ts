// ── D-11.C creator-baseline calibration study (percentile-calibrated) ─────────
// Owner amendment (2026-07-27): the Balanced creator is calibrated by RELATIVE STANDING
// within the Project:Studio talent population, NOT by copying sports-game raw OVR. The
// controlling targets are PERCENTILES within the working-age, signable, matching-profession
// population (the primary benchmark): pre-spec ≈ 30–50th, post-spec ≈ 40–60th; High-Upside
// 20–45th; Polished 50–65th; multi-hyphenate primary 30–50th / secondary 25–45th; top-10%
// rare/absent in Balanced, top-5% effectively absent. Validated against the ACTUAL generated
// distribution. Tunes ONLY the Balanced creator baselines — never the global roleOVR /
// generated distribution / development / D-6 / market rules. Writes out/creator-baseline/.
//
// Run:  node_modules/.bin/vite-node src/harness/run-creator-baseline-study.ts

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  BALANCED_ARCHETYPES,
  beginFounding,
  generateWorld,
  previewBalancedTalent,
  roleOVR,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  TUNING,
} from '../core/index.js'
import type { BalancedTalentInput, CreativeRole, Discipline, Talent } from '../core/index.js'

const DISCIPLINES: readonly Discipline[] = ['acting', 'writing', 'directing', 'craft']
const roleForDiscipline: Record<Discipline, CreativeRole> = {
  acting: 'actor',
  writing: 'writer',
  directing: 'director',
  craft: 'craft',
}
const WORLDS = 150 // ~4200 actors / 1800 writers / 1500 directors / 1500 craft
const BUDGET = TUNING.BALANCED_CREATOR_SPECIALIZATION_POINTS

// ── build the comparison populations ──
// Primary benchmark: working-age (all generated are 18–70), signable (fresh world = all
// non-contracted), primary-profession talent — i.e. every generated talent's PRIMARY OVR,
// grouped by discipline. Also collect the founding-applicant sub-population for context.
const popByDiscipline: Record<Discipline, number[]> = { acting: [], writing: [], directing: [], craft: [] }
const foundingByDiscipline: Record<Discipline, number[]> = { acting: [], writing: [], directing: [], craft: [] }
for (let i = 1; i <= WORLDS; i++) {
  const w = generateWorld(`pop-${i}`)
  for (const t of w.talent) popByDiscipline[ROLE_TO_DISCIPLINE[t.role]].push(roleOVR(t, ROLE_TO_DISCIPLINE[t.role]))
  const f = beginFounding(w)
  for (const id of f.founding!.applicantIds) {
    const t = w.talent.find((x) => x.id === id)!
    foundingByDiscipline[ROLE_TO_DISCIPLINE[t.role]].push(roleOVR(t, ROLE_TO_DISCIPLINE[t.role]))
  }
}
for (const d of DISCIPLINES) {
  popByDiscipline[d].sort((a, b) => a - b)
  foundingByDiscipline[d].sort((a, b) => a - b)
}

const pctile = (sorted: number[], p: number): number => {
  if (!sorted.length) return 0
  const idx = clampIdx(Math.floor((p / 100) * sorted.length), sorted.length)
  return sorted[idx]!
}
function clampIdx(i: number, len: number): number {
  return Math.max(0, Math.min(len - 1, i))
}
// Percentile of a value within a sorted population = fraction strictly below it.
const percentileOf = (sorted: number[], value: number): number => {
  if (!sorted.length) return 0
  let below = 0
  for (const v of sorted) if (v < value) below++
  return +((below / sorted.length) * 100).toFixed(1)
}
const stats = (sorted: number[]) => {
  const n = sorted.length
  const mean = n ? sorted.reduce((a, b) => a + b, 0) / n : 0
  const variance = n ? sorted.reduce((a, b) => a + (b - mean) ** 2, 0) / n : 0
  return {
    n,
    min: sorted[0] ?? 0,
    p10: pctile(sorted, 10),
    p25: pctile(sorted, 25),
    p50: pctile(sorted, 50),
    p75: pctile(sorted, 75),
    p90: pctile(sorted, 90),
    p95: pctile(sorted, 95),
    p99: pctile(sorted, 99),
    max: sorted[n - 1] ?? 0,
    mean: +mean.toFixed(1),
    sd: +Math.sqrt(variance).toFixed(1),
  }
}
// Raw-OVR band boundaries per discipline (the OVR at each percentile cut).
const bands = (sorted: number[]) => ({
  p10: pctile(sorted, 10),
  p30: pctile(sorted, 30),
  p50: pctile(sorted, 50),
  p70: pctile(sorted, 70),
  p90: pctile(sorted, 90),
  p97: pctile(sorted, 97),
  p995: pctile(sorted, 99.5),
})

// ── creator comparison ──
const SEED = 'creator-baseline'
function baseInput(presetId: string, role: CreativeRole): BalancedTalentInput {
  const preset = BALANCED_ARCHETYPES.find((p) => p.id === presetId)!
  return {
    name: `probe-${presetId}`, role, age: 30, actual: { warmth: 0, gravity: 0, physicality: 0 },
    presetId, potentialTier: preset.defaultPotentialTier, workEthic: preset.defaultWorkEthic, allocation: {},
  }
}
function concentrated(role: CreativeRole): BalancedTalentInput['allocation'] {
  const skills: Partial<Record<Discipline, number[]>> = { [ROLE_TO_DISCIPLINE[role]]: [BUDGET, 0, 0, 0, 0, 0] }
  return { skills }
}
function distributed(role: CreativeRole): BalancedTalentInput['allocation'] {
  const per = Math.floor(BUDGET / 6)
  const skills: Partial<Record<Discipline, number[]>> = {
    [ROLE_TO_DISCIPLINE[role]]: [per, per, per, per, per, BUDGET - per * 5],
  }
  return { skills }
}
const primaryOVR = (input: BalancedTalentInput) => roleOVR(previewBalancedTalent(input, SEED), ROLE_TO_DISCIPLINE[input.role])
const secondaryOVRs = (input: BalancedTalentInput): Record<string, number> => {
  const t: Talent = previewBalancedTalent(input, SEED)
  const primary = ROLE_TO_DISCIPLINE[input.role]
  const out: Record<string, number> = {}
  for (const d of DISCIPLINES) if (d !== primary) out[d] = roleOVR(t, d)
  return out
}
const highestSkill = (input: BalancedTalentInput): number => {
  const t = previewBalancedTalent(input, SEED)
  const d = ROLE_TO_DISCIPLINE[input.role]
  return Math.max(...SKILL_ORDER[d].map((k) => t.skills[d][k]!.perceived))
}

type PresetRow = {
  preset: string
  appliesTo: string
  discipline: Discipline
  preOVR: number
  prePct: number
  postConcentratedOVR: number
  postConcentratedPct: number
  postDistributedOVR: number
  postDistributedPct: number
  highestSkillConcentrated: number
  secondaryOVRs: Record<string, number>
  secondaryPcts: Record<string, number>
  salaryEstimate: number
  fame: number
}
const presetRows: PresetRow[] = []
for (const preset of BALANCED_ARCHETYPES) {
  const role = preset.appliesTo === 'any' ? 'actor' : roleForDiscipline[preset.appliesTo]
  const d = ROLE_TO_DISCIPLINE[role]
  const base = baseInput(preset.id, role)
  const conc: BalancedTalentInput = { ...base, allocation: concentrated(role) }
  const dist: BalancedTalentInput = { ...base, allocation: distributed(role) }
  const sec = secondaryOVRs(base)
  const secPct: Record<string, number> = {}
  for (const sd of Object.keys(sec)) secPct[sd] = percentileOf(popByDiscipline[sd as Discipline], sec[sd]!)
  presetRows.push({
    preset: preset.id, appliesTo: preset.appliesTo, discipline: d,
    preOVR: primaryOVR(base), prePct: percentileOf(popByDiscipline[d], primaryOVR(base)),
    postConcentratedOVR: primaryOVR(conc), postConcentratedPct: percentileOf(popByDiscipline[d], primaryOVR(conc)),
    postDistributedOVR: primaryOVR(dist), postDistributedPct: percentileOf(popByDiscipline[d], primaryOVR(dist)),
    highestSkillConcentrated: highestSkill(conc), secondaryOVRs: sec, secondaryPcts: secPct,
    salaryEstimate: previewBalancedTalent(base, SEED).salary, fame: previewBalancedTalent(base, SEED).fame,
  })
}

const focused = presetRows.filter((r) => r.appliesTo !== 'any')
const allPostPct = presetRows.flatMap((r) => [r.postConcentratedPct, r.postDistributedPct])
const summary = {
  worlds: WORLDS,
  skillFloor: TUNING.BALANCED_CREATOR_SKILL_FLOOR,
  specializationPoints: BUDGET,
  comparisonPopulation:
    'PRIMARY BENCHMARK = working-age (all 18–70), signable (fresh world → all non-contracted), primary-profession talent, grouped by discipline. Founding-applicant sub-population reported for context.',
  targets: {
    preSpecPercentile: '30–50th (focused)',
    postSpecPercentile: '40–60th (focused)',
    highUpsidePercentile: '20–45th',
    polishedPercentile: '50–65th',
    multiHyphenatePrimary: '30–50th',
    multiHyphenateSecondary: '25–45th',
    top10: 'rare/absent in Balanced',
    top5: 'effectively absent in Balanced',
  },
  populationStats: Object.fromEntries(DISCIPLINES.map((d) => [d, stats(popByDiscipline[d])])),
  foundingApplicantStats: Object.fromEntries(DISCIPLINES.map((d) => [d, stats(foundingByDiscipline[d])])),
  rawOVRBandsByDiscipline: Object.fromEntries(DISCIPLINES.map((d) => [d, bands(popByDiscipline[d])])),
  presets: presetRows,
  checks: {
    focusedPreInBand: focused.every((r) => r.prePct >= 25 && r.prePct <= 55),
    focusedPostInBand: focused.every((r) => r.postConcentratedPct <= 65 && r.postDistributedPct <= 65),
    noTop10Common: allPostPct.filter((p) => p >= 90).length / allPostPct.length < 0.05,
    noTop5: allPostPct.every((p) => p < 95),
    highUpsideLower:
      (presetRows.find((r) => r.preset === 'highUpsideProspect')?.prePct ?? 100) <= 45,
  },
}

const here = dirname(fileURLToPath(import.meta.url))
const OUT = join(here, '..', '..', 'out', 'creator-baseline')
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2))

// eslint-disable-next-line no-console
console.log(`# D-11.C creator PERCENTILE calibration (${WORLDS} worlds, floor ${summary.skillFloor}, ${BUDGET} pts)`)
for (const d of DISCIPLINES) {
  const s = summary.populationStats[d]!
  // eslint-disable-next-line no-console
  console.log(`  POP ${d} (n=${s.n}): p10=${s.p10} p25=${s.p25} p50=${s.p50} p75=${s.p75} p90=${s.p90} p95=${s.p95} p99=${s.p99} max=${s.max} mean=${s.mean}`)
}
for (const r of presetRows) {
  const sec = Object.entries(r.secondaryOVRs).map(([k, v]) => `${k[0]}${v}(${r.secondaryPcts[k]}%)`).join(' ')
  // eslint-disable-next-line no-console
  console.log(`  ${r.preset}: pre ${r.preOVR}=${r.prePct}%ile → conc ${r.postConcentratedOVR}=${r.postConcentratedPct}% / dist ${r.postDistributedOVR}=${r.postDistributedPct}% · topSkill ${r.highestSkillConcentrated} · sec ${sec} · $${Math.round(r.salaryEstimate / 1000)}k`)
}
// eslint-disable-next-line no-console
console.log(`checks: ${JSON.stringify(summary.checks)}`)
