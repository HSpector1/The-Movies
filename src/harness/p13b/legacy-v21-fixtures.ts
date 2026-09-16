/**
 * P13B-S2 legacy-fixture generator. Run ONCE at the last V21 writer
 * (e68de38, S2-T3: two Laboratories per project, single-pool receipts, no
 * per-Lab rows) so the emitted saves are genuine V21 originals. Re-running on
 * a later engine emits that engine's current version, not V21; the recorded
 * provenance file beside the fixtures is the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v21-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { exportSave, makeSave } from '../../core/save.js'
import { advanceTo, p13aResearchEntry } from '../p13a/fixtures.js'
import { p13bStaffedProject, p13bTwoLabWorld } from './fixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p13b/', import.meta.url)
mkdirSync(out, { recursive: true })

const fixtures: Record<string, () => GameState> = {
  // One Laboratory, four seats, three funded weeks at the $40k ceiling: three single-pool receipts of 120,000 units.
  'legacy-v21-staffed-4-seats-263': () => p13bStaffedProject(p13aResearchEntry(), 3, 40_000, 4).state,
  // Same start; one seat released at 263 (history row kept), two three-seat weeks, paused at 265, one idle week.
  'legacy-v21-released-paused-266': () => {
    const { state: staffed, projectId, scientistIds } = p13bStaffedProject(p13aResearchEntry(), 3, 40_000, 4)
    let state = applyActions(staffed, [{ kind: 'releaseResearchSeat', projectId, scientistId: scientistIds[0]! }])
    state = advanceTo(state, 265)
    state = applyActions(state, [{ kind: 'pauseResearch', projectId }])
    return advanceTo(state, 266)
  },
  // Two Laboratories at 780 (S2-T3 law): sound seated 4 + 2 across both Labs at $60k, lighting 2 on Lab 2 at $20k,
  // three funded weeks under the single-pool law (output n + spend/20,000, no per-Lab rows).
  'legacy-v21-two-labs-two-briefs-783': () => {
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    const seat = (laboratoryFacilityId: string, scientistId: string, technologyId: 'synchronized-sound' | 'lighting-control-01') =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId, technologyId })
    let state = applyActions(world, [
      ...candidateIds.slice(0, 4).map(id => seat(lab1, id, 'synchronized-sound')),
      ...candidateIds.slice(4, 6).map(id => seat(lab2, id, 'synchronized-sound')),
      ...candidateIds.slice(6, 8).map(id => seat(lab2, id, 'lighting-control-01')),
    ])
    const sound = state.technology.projects.find(p => p.technologyId === 'synchronized-sound')!.id
    const lighting = state.technology.projects.find(p => p.technologyId === 'lighting-control-01')!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId: sound, budgetPerWeek: 60_000 }, { kind: 'beginResearch', projectId: lighting, budgetPerWeek: 20_000 }])
    return advanceTo(state, 783)
  },
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(`${name}.json.gz`, out), gzipSync(bytes, { level: 9 }))
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} projects=${JSON.stringify(state.technology.projects.map(p => ({ id: p.id, status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure, seats: p.seats.length, labs: [...new Set(p.seats.filter(s => s.releasedWeek === null).map(s => s.laboratoryFacilityId))].length, receipts: p.weeks.length })))}`)
}
console.log(lines.join('\n'))
