/**
 * P13B-S5 legacy-fixture generator. Run ONCE at the last V23 writer (the S4 closeout
 * engine: physical-plan root v1, sound-only `adoptSynchronizedSound`, adoptions without
 * component rows or equipment assets) so the emitted saves are genuine V23 originals
 * for the V23→V24 migration proofs. Re-running on a later engine emits that engine's
 * current version, not V23; the provenance file beside the fixtures is the authority
 * for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v23-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { exportSave, makeSave } from '../../core/save.js'
import { adoptExistingSoundChain, advanceTo, p13aResearchReady } from '../p13a/fixtures.js'
import { nextLaboratoryOrigin, p13bTwoLabWorld } from './fixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p13b/', import.meta.url)
mkdirSync(out, { recursive: true })

function begin(state: GameState, technologyId: string, budgetPerWeek: number): GameState {
  const project = state.technology.projects.find(p => p.technologyId === technologyId)!
  return applyActions(state, [{ kind: 'beginResearch', projectId: project.id, budgetPerWeek }])
}

const fixtures: Record<string, () => GameState> = {
  // Completed sound invention at 303, first-prototype adoption of the existing stage + Post chain, operational at 315:
  // one adoption row with equipmentCost 0, installationCost = the two P09 quotes, prototypeProjectId set, no components.
  'legacy-v23-sound-operational-315': () =>
    advanceTo(adoptExistingSoundChain(advanceTo(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 303)), 315),
  // Two Laboratories at 780: lighting researched to completion on Lab 2 (4 seats, $40k), inventor access acquired,
  // no adoption (the V23 engine cannot adopt lighting), plus one queued physical plan that waits for week 900.
  'legacy-v23-lighting-complete-plan-queued': () => {
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = begin(state, 'lighting-control-01', 40_000)
    while (state.technology.projects.find(p => p.technologyId === 'lighting-control-01')!.status !== 'completed') {
      if (state.market.tick > 900) throw new Error('lighting research did not complete before 900')
      state = advanceTo(state, state.market.tick + 1)
    }
    state = applyActions(state, [{
      kind: 'queuePhysicalPlan',
      work: { kind: 'placement', blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(state) },
      approvedMaximumDebit: 2_000_000,
      earliestStartWeek: 900,
    } as never])
    return advanceTo(state, state.market.tick + 2)
  },
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(`${name}.json.gz`, out), gzipSync(bytes, { level: 9 }))
  const tech = state.technology as unknown as { adoptions?: unknown[]; access?: unknown[] }
  const plans = (state as unknown as { physicalPlans?: { plans?: unknown[] } }).physicalPlans?.plans ?? []
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} projects=${JSON.stringify(state.technology.projects.map(p => ({ id: p.id, technologyId: p.technologyId, status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure })))} adoptions=${JSON.stringify(tech.adoptions ?? [])} access=${JSON.stringify(tech.access ?? [])} plans=${JSON.stringify(plans.map(p => { const q = p as Record<string, unknown>; return { id: q.id, status: q.status, earliestStartWeek: q.earliestStartWeek } }))}`)
}
console.log(lines.join('\n'))
