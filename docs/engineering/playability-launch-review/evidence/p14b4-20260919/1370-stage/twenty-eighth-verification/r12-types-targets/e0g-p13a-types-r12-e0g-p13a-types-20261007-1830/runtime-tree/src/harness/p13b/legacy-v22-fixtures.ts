/**
 * P13B-S3 legacy-fixture generator. Run ONCE at the last V22 writer (the S2 closeout
 * commit: cooperation receipts with per-Lab rows, technology root v3, no physical-plan
 * root) so the emitted saves are genuine V22 originals for the V22→V23 migration
 * proofs. Re-running on a later engine emits that engine's current version, not V22;
 * the provenance file beside the fixtures is the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v22-fixtures.ts
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
  // One Laboratory, four seats, three cooperation-law receipts (one derived-free row each, units over 1/160,000).
  'legacy-v22-staffed-4-seats-263': () => p13bStaffedProject(p13aResearchEntry(), 3, 40_000, 4).state,
  // Two Laboratories at 780: sound 4 + 4 at $80k for two weeks (two-row receipts, 9.75/week), lighting unstaffed.
  'legacy-v22-two-labs-cooperating-782': () => {
    const { state: world, laboratoryFacilityIds: [lab1, lab2], candidateIds } = p13bTwoLabWorld()
    const seat = (laboratoryFacilityId: string, scientistId: string) =>
      ({ kind: 'assignResearchScientist' as const, laboratoryFacilityId, scientistId, technologyId: 'synchronized-sound' as const })
    let state = applyActions(world, [
      ...candidateIds.slice(0, 4).map(id => seat(lab1, id)),
      ...candidateIds.slice(4, 8).map(id => seat(lab2, id)),
    ])
    const sound = state.technology.projects.find(p => p.technologyId === 'synchronized-sound')!.id
    state = applyActions(state, [{ kind: 'beginResearch', projectId: sound, budgetPerWeek: 80_000 }])
    return advanceTo(state, 782)
  },
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(`${name}.json.gz`, out), gzipSync(bytes, { level: 9 }))
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} projects=${JSON.stringify(state.technology.projects.map(p => ({ id: p.id, status: p.status, verifiedWork: p.verifiedWork, expenditure: p.expenditure, receipts: p.weeks.length, labsPerReceipt: p.weeks.map(w => w.labs?.length ?? null) })))}`)
}
console.log(lines.join('\n'))
