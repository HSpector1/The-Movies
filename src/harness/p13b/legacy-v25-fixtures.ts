/**
 * P13B-S6 legacy-fixture generator. Run ONCE at the last V25 writer (the S5-R07 closeout engine:
 * production setup records on workflows, per-technology adoptions with component rows and held
 * equipment assets, no cancellation receipts, no restoration installations, no refund ledger kind)
 * so the emitted saves are genuine V25 originals for the V25→V26 migration proofs. Re-running on a
 * later engine emits that engine's current version, not V25; the provenance file beside the
 * fixtures is the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v25-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { exportSave, makeSave } from '../../core/save.js'
import { adoptExistingSoundChain, advanceTo, p13aResearchReady } from '../p13a/fixtures.js'
import { p13bTwoLabWorld } from './fixtures.js'
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
  // Sound adoption committed at 303 and still MID-DEPLOYMENT at 309 (stage fit-out 12 weeks, Post 6 weeks): the S6 cancellation
  // trace world — completed Post component, in-progress stage site work, unstarted stage installation and capture.
  'legacy-v25-sound-mid-deployment-309': () =>
    advanceTo(adoptExistingSoundChain(advanceTo(begin(p13aResearchReady(), 'synchronized-sound', 10_000), 303)), 309),
  // Lighting adoption committed at 791 and MID-DEPLOYMENT at 793 (site work 2 weeks done at 793, installation unstarted).
  'legacy-v25-lighting-mid-deployment-793': () => {
    const { state: world, laboratoryFacilityIds: [, lab2], candidateIds } = p13bTwoLabWorld()
    let state = applyActions(world, candidateIds.slice(0, 4).map(scientistId =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId: lab2, scientistId, technologyId: 'lighting-control-01' as const })))
    state = runToCompletion(begin(state, 'lighting-control-01', 40_000), 'lighting-control-01')
    const stage = state.operations.facilities.find(f => f.capability === 'soundstage')!.id
    state = applyActions(state, [{ kind: 'adoptTechnology', technologyId: 'lighting-control-01', stageFacilityId: stage } as never])
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
  const tech = state.technology as unknown as { version: number; adoptions: Record<string, unknown>[]; equipment: unknown[] }
  const placements = state.placement.facilities.filter(f => f.installation !== undefined).map(f => ({ id: f.id, bp: f.blueprintId, status: f.status, placed: f.placedWeek, completes: f.completesWeek }))
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} technologyVersion=${tech.version} adoptions=${JSON.stringify(tech.adoptions.map(a => ({ id: a.id, technologyId: a.technologyId, committedWeek: a.committedWeek, operationalWeek: a.operationalWeek, equipmentAssetId: a.equipmentAssetId, components: (a.components as { kind: string; cost: number; placementId: number | null }[]).map(c => `${c.kind}:${c.cost}:${c.placementId}`) })))} installations=${JSON.stringify(placements)} workflows=${state.operations.workflows.length}`)
}
console.log(lines.join('\n'))
