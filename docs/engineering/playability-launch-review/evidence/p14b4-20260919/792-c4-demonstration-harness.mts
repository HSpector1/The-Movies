// P14C.4 demonstration harness (record 782 §4 / §6.2). A MEASUREMENT, not a test: it asserts
// nothing about the product and prints one JSON document.
//
// usage (cwd = the worktree whose src/ is measured; node_modules resolvable from it):
//   node_modules/.bin/vite-node <this file> -- <seed> <weeks> <out.json>
//
// The driver is a fresh generated studio (`p13aGeneratedStudio`) with a PASSIVE player: no
// player action at all, rivals under their own policy. It ticks to `weeks` and samples every
// 26 weeks: each 52k week (a cohort week) and the mid-year week 26 weeks before it. The same file runs unchanged at the pre-C.2a source (no lifecycle root), at the C.2a
// source (records, no cohorts) and at a C.4 candidate (records + cohorts): every lifecycle read
// is feature-detected, never assumed.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const [seed, weeksArg, out] = process.argv.slice(2).filter((a) => a !== '--')
if (!seed || !weeksArg || !out) throw new Error('usage: <seed> <weeks> <out.json>')
const weeks = Number(weeksArg)
const root = process.cwd()
const load = (p: string) => import(pathToFileURL(join(root, p)).href)
const { tick } = await load('src/core/index.ts')
const { hiringMarketIds } = await load('src/core/employment.ts')
const { careerIdentity } = await load('src/core/talentSummary.ts')
const { p13aGeneratedStudio } = await load('src/harness/p13a/fixtures.ts')

const ROLES = ['actor', 'director', 'writer', 'craft'] as const
type Rec = { personId: string; profession: string; status: string; retiredWeek: number | null }
type Cohort = { week: number; requested: Record<string, number>; clipped: number; personIds: string[] }

const records = (s: any): Rec[] => s.careerLifecycle?.records ?? []
const cohorts = (s: any): Cohort[] => s.careerLifecycle?.cohorts ?? []

function sample(s: any, elapsedMs: number) {
  const retired = new Set(records(s).filter((r) => r.status === 'retired').map((r) => r.personId))
  const free = new Set<string>(s.freeAgents)
  const listing = new Set<string>(hiringMarketIds(s))
  const byId = new Map<string, any>(s.talent.map((t: any) => [t.id, t]))
  const unproven = (t: any) => t.age < 30 && careerIdentity(t).identityDisciplines.length === 0
  const roles: Record<string, Record<string, number>> = {}
  for (const role of ROLES) {
    const all = s.talent.filter((t: any) => t.role === role)
    const active = all.filter((t: any) => !retired.has(t.id))
    const listed = [...listing].map((id) => byId.get(id)).filter((t: any) => t?.role === role)
    roles[role] = {
      total: all.length,
      active: active.length,
      freeAgents: active.filter((t: any) => free.has(t.id)).length,
      under30: active.filter((t: any) => t.age < 30).length,
      unprovenUnder30: active.filter(unproven).length,
      listing: listed.length,
      listingUnprovenUnder30: listed.filter(unproven).length,
    }
  }
  return {
    week: s.market.tick,
    elapsedMs: Math.round(elapsedMs),
    talent: s.talent.length,
    active: s.talent.length - retired.size,
    scientists: s.talent.filter((t: any) => t.role === 'scientist').length,
    freeAgentsListLength: s.freeAgents.length,
    retiredIdsInFreeAgents: [...free].filter((id) => retired.has(id)).length,
    listingLength: listing.size,
    records: records(s).length,
    roles,
    rivals: s.hollywood === null ? null : {
      businesses: s.hollywood.businesses.length,
      cash: s.hollywood.businesses.map((b: any) => Math.round(b.account.cash)),
      activeEmployment: s.hollywood.activeEmploymentOrdinals.length,
      films: s.hollywood.films.length,
      suppliedPeople: s.talent.filter((t: any) => /^person-.*-supply-/.test(t.id)).length,
    },
    playerCash: Math.round(s.studio.cash),
  }
}

const started = performance.now()
let state: any = p13aGeneratedStudio(seed)
const samples = [sample(state, 0)]
while (state.market.tick < weeks) {
  state = tick(state)
  if (state.market.tick % 26 === 0) {
    samples.push(sample(state, performance.now() - started))
    if (state.market.tick % 520 === 0) console.error(`week ${state.market.tick} ${Math.round(performance.now() - started)} ms`)
  }
}

// Per campaign year k (weeks (52(k-1), 52k]): retirements by profession, from the records
// the final state carries (append-only, D12), and entrants from the cohort receipts if any.
const years = samples.slice(1).filter((row) => row.week % 52 === 0).map((row) => {
  const w = row.week
  const retirements: Record<string, number> = Object.fromEntries(ROLES.map((r) => [r, 0]))
  for (const r of records(state)) if (r.retiredWeek !== null && r.retiredWeek > w - 52 && r.retiredWeek <= w) retirements[r.profession] = (retirements[r.profession] ?? 0) + 1
  const cohort = cohorts(state).find((c) => c.week === w) ?? null
  return { week: w, retirements, entrants: cohort ? cohort.requested : null, clipped: cohort?.clipped ?? null }
})

const git = (...a: string[]) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim()
writeFileSync(out, JSON.stringify({
  kind: 'p14c4-demonstration',
  seed, weeks, root,
  head: git('rev-parse', 'HEAD'),
  srcDirty: git('status', '--porcelain', '--', 'src/') !== '',
  hasLifecycleRoot: 'careerLifecycle' in state,
  hasCohorts: Array.isArray(state.careerLifecycle?.cohorts),
  node: process.version,
  totalMs: Math.round(performance.now() - started),
  samples, years,
}, null, 1))
console.error(`done ${Math.round(performance.now() - started)} ms -> ${out}`)
