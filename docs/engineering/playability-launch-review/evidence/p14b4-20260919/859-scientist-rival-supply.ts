// Record840 bounded measurement, generated worlds only. No product policy changes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { ageAt, recomputeDue } from '../../../../../src/core/aging.ts'
import { contractEndRefusal, lifecycleStatus } from '../../../../../src/core/careerLifecycle.ts'
import { makeSave, migrateToLive, importSave } from '../../../../../src/core/save.ts'
import { researchCandidates } from '../../../../../src/core/technology.ts'
import { tick } from '../../../../../src/core/tick.ts'
import { p13aGeneratedStudio } from '../../../../../src/harness/p13a/fixtures.ts'
import type { GameState } from '../../../../../src/core/types.ts'

const seed = 'p13b-s8-save-v27-natural-01'
console.log(JSON.stringify({ scriptSha256: createHash('sha256').update(readFileSync(new URL(import.meta.url))).digest('hex'),
  seed, horizon: 832, prediction: 'Existing rival demand may supply new identities; no ninth fixed player candidate or retired revival is allowed.' }))
const canonical = (s: GameState) => JSON.stringify(makeSave(s))
const roundTrip = (s: GameState) => migrateToLive(importSave(canonical(s))).state
const scientists = (s: GameState) => s.talent.filter(p => p.role === 'scientist')
const baseline = p13aGeneratedStudio(seed)
const baselineIds = new Set(baseline.talent.map(p => p.id))
function snapshot(s: GameState) {
  const h = s.hollywood!
  const active = h.activeEmploymentOrdinals.map(i => h.employment[i]!)
  const pool = researchCandidates(s)
  const materialized = new Set(s.talent.map(p => p.id))
  const cohorts = new Set(s.careerLifecycle.cohorts.flatMap(c => [...c.personIds]))
  const people = scientists(s).map(p => ({
    id: p.id, age: p.age, status: lifecycleStatus(s, p.id),
    fixedPlayerPool: pool.some(c => c.id === p.id),
    newSinceFounding: !baselineIds.has(p.id), c4Entrant: cohorts.has(p.id),
    lifecycleTermHireable: contractEndRefusal(s, p.id, s.market.tick + 208) === null,
    employers: active.filter(e => e.terms.talentId === p.id).map(e => e.studioId),
    provenance: s.talentProvenance.rows.find(r => r.personId === p.id),
  }))
  assert(people.every(p => !p.c4Entrant), 'C.4 must remain film-only')
  assert(people.every(p => p.status !== 'retired' || p.employers.length === 0))
  return { week: s.market.tick, pool: { raw: pool.length,
    materialized: pool.filter(p => materialized.has(p.id)).length,
    latent: pool.filter(p => !materialized.has(p.id)).length,
    lifecycleTermHireable: pool.filter(p => contractEndRefusal(s, p.id, s.market.tick + 208) === null).length },
  people, projects: s.technology.projects.map(p => ({ id: p.id, studioId: p.studioId,
    status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure,
    receipts: p.weeks.length, seats: p.seats })),
  retirements: s.careerLifecycle.records.filter(r => r.profession === 'scientist') }
}

let natural = baseline
let firstSupply: GameState | undefined
const naturalRows = [snapshot(natural)]
const checkpoints = new Set([259, 260, 261, 312, 468, 520, 779, 780, 832])
while (natural.market.tick < 832) {
  const priorIds = scientists(natural).map(p => p.id).join(',')
  natural = tick(natural)
  if (!firstSupply && scientists(natural).length > 0) firstSupply = roundTrip(natural)
  if (checkpoints.has(natural.market.tick) || scientists(natural).map(p => p.id).join(',') !== priorIds) {
    roundTrip(natural)
    naturalRows.push(snapshot(natural))
  }
}
console.log(JSON.stringify({ mode: 'genuine fresh generated continuation', seed, endWeek: 832, snapshots: naturalRows }))

// Separate age-only synthetic branch at the first actual rival Scientist supply.
// No employment/research/receipt is fabricated, removed or restamped.
if (!firstSupply) {
  console.log(JSON.stringify({ mode: 'synthetic branch NOT EXERCISED', reason: 'No Scientist materialized in the bounded natural seed.' }))
} else {
  const originalBytes = canonical(firstSupply)
  const shifts = new Map(scientists(firstSupply).map(p => [p.id, 71 - p.age]))
  assert(firstSupply.careerLifecycle.records.every(r => !shifts.has(r.personId)))
  const rows = firstSupply.talentProvenance.rows.map(r => {
    const shift = shifts.get(r.personId)
    if (shift === undefined) return r
    return r.kind === 'legacy_age_anchor' ? { ...r, ageAtMigration: r.ageAtMigration + shift }
      : { ...r, ageAtEntry: r.ageAtEntry + shift }
  })
  const talent = firstSupply.talent.map(p => shifts.has(p.id)
    ? { ...p, age: ageAt(rows.find(r => r.personId === p.id)!, firstSupply!.market.tick) } : p)
  const ages = new Map(talent.map(p => [p.id, p.age]))
  let variant = roundTrip({ ...firstSupply, talent, talentProvenance: { ...firstSupply.talentProvenance,
    rows, due: recomputeDue(rows, id => ages.get(id)) } })
  assert.deepEqual(variant.hollywood!.employment, firstSupply.hollywood!.employment)
  assert.deepEqual(variant.technology, firstSupply.technology)
  const measured = [snapshot(variant)]
  const retired = new Map<string, string>()
  while (variant.market.tick < 832) {
    const before = variant
    variant = tick(variant)
    for (const [id, bytes] of retired) {
      assert.equal(JSON.stringify(variant.careerLifecycle.records.find(r => r.personId === id)), bytes)
      assert.equal(lifecycleStatus(variant, id), 'retired')
    }
    const changed = scientists(variant).map(p => `${p.id}:${lifecycleStatus(variant, p.id)}`).join(',') !==
      scientists(before).map(p => `${p.id}:${lifecycleStatus(before, p.id)}`).join(',')
    if (changed) {
      roundTrip(before); roundTrip(variant)
      measured.push(snapshot(before), snapshot(variant))
    } else if (checkpoints.has(variant.market.tick)) {
      roundTrip(variant); measured.push(snapshot(variant))
    }
    for (const r of variant.careerLifecycle.records.filter(r => r.profession === 'scientist' && r.status === 'retired')) {
      retired.set(r.personId, JSON.stringify(r))
    }
  }
  assert.equal(canonical(firstSupply), originalBytes)
  console.log(JSON.stringify({ mode: 'SYNTHETIC age71 at first genuine rival supply; real subsequent ticks',
    seed, startWeek: firstSupply.market.tick, shiftedIds: [...shifts.keys()], endWeek: 832, snapshots: measured }))
}
