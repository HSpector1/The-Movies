/**
 * P13B-S5-R07 legacy-fixture generator. Run ONCE at the last V24 writer (the S5 closeout engine:
 * technology root v4 with component rows and equipment assets, per-technology `adoptTechnology`,
 * no production setup record) so the emitted saves are genuine V24 originals for the V24→V25
 * migration proofs. Re-running on a later engine emits that engine's current version, not V24;
 * the provenance file beside the fixtures is the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v24-fixtures.ts
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
function runToCompletion(state: GameState, technologyId: string): GameState {
  while (state.technology.projects.find(p => p.technologyId === technologyId)!.status !== 'completed') {
    if (state.market.tick > 900) throw new Error(`${technologyId} research did not complete before 900`)
    state = advanceTo(state, state.market.tick + 1)
  }
  return state
}

const fixtures: Record<string, () => GameState> = {
  // Native V24 sound adoption: first-prototype components, one held asset, operational at 315.
  'legacy-v24-sound-operational-315': () =>
    advanceTo(adoptExistingSoundChain(advanceTo(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 303)), 315),
  // Native V24 lighting adoption (adoptTechnology, no Post) operational four weeks after commit, plus one queued plan waiting for 900.
  'legacy-v24-lighting-operational-plan-queued': () => {
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = runToCompletion(begin(state, 'lighting-control-01', 40_000), 'lighting-control-01')
    const stage = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: stage } as never])
    state = applyActions(state, [{
      kind: 'queuePhysicalPlan',
      work: { kind: 'placement', blueprintId: 'research-laboratory', origin: nextLaboratoryOrigin(state) },
      approvedMaximumDebit: 2_000_000,
      earliestStartWeek: 900,
    } as never])
    return advanceTo(state, state.market.tick + 5)
  },
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(`${name}.json.gz`, out), gzipSync(bytes, { level: 9 }))
  const tech = state.technology as unknown as { version: number; adoptions: Record<string, unknown>[]; equipment: unknown[] }
  const plans = (state as unknown as { physicalPlans?: { plans?: Record<string, unknown>[] } }).physicalPlans?.plans ?? []
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} technologyVersion=${tech.version} adoptions=${JSON.stringify(tech.adoptions.map(a => ({ id: a.id, technologyId: a.technologyId, route: a.route, committedWeek: a.committedWeek, operationalWeek: a.operationalWeek, equipmentCost: a.equipmentCost, installationCost: a.installationCost, postFacilityId: a.postFacilityId, components: (a.components as unknown[]).length, equipmentAssetId: a.equipmentAssetId })))} equipment=${JSON.stringify(tech.equipment)} plans=${JSON.stringify(plans.map(p => ({ id: p.id, status: p.status, earliestStartWeek: p.earliestStartWeek })))}`)
}
console.log(lines.join('\n'))
