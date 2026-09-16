/**
 * P13B-S1 legacy-fixture generator. Run ONCE at the pinned P13A source
 * (e2e409e80eccb6a7fd49fa16aa0f750faeb51253) so the emitted saves are genuine
 * V20 originals with the single-Scientist shape. Re-running on a later engine
 * emits that engine's current version, not V20; the recorded provenance file
 * beside the fixtures is the authority for what was minted and when.
 *
 *   npx vite-node src/harness/p13b/legacy-v20-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { exportSave, makeSave } from '../../core/save.js'
import { advanceTo, adoptExistingSoundChain, p13aResearchReady } from '../p13a/fixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p13b/', import.meta.url)
mkdirSync(out, { recursive: true })

function begin(state: GameState, budgetPerWeek: number): GameState {
  return applyActions(state, [{ kind: 'beginResearch', projectId: state.technology.projects[0]!.id, budgetPerWeek }])
}

const fixtures: Record<string, () => GameState> = {
  // Twenty funded one-Scientist weeks: verifiedWork 30, expenditure $200,000.
  'legacy-v20-research-active-280': () => advanceTo(begin(p13aResearchReady(), 10_000), 280),
  // Ten zero-ceiling weeks, paused at 270, then the 208-week contract expires at 468.
  'legacy-v20-research-paused-expired-468': () => {
    const paused = applyActions(advanceTo(begin(p13aResearchReady(), 0), 270),
      [{ kind: 'pauseResearch', projectId: p13aResearchReady().technology.projects[0]!.id }])
    return advanceTo(paused, 468)
  },
  // Completed invention at 303 with the exact P09 chain operational at 315.
  'legacy-v20-research-complete-operational-315': () => advanceTo(adoptExistingSoundChain(advanceTo(begin(p13aResearchReady(), 10_000), 303)), 315),
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  const gz = gzipSync(bytes, { level: 9 })
  writeFileSync(new URL(`${name}.json.gz`, out), gz)
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} projects=${JSON.stringify(state.technology.projects.map(p => ({ id: p.id, status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure, startedWeek: p.startedWeek, completedWeek: p.completedWeek })))}`)
}
console.log(lines.join('\n'))
