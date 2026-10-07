/**
 * P13B-S7/S8 legacy-fixture generator. Run ONCE at the last V26 writer (the S6 closeout engine:
 * cancellation receipts on placements, `cancelledWeek` on adoptions, the `constructionRefund` ledger
 * kind, restoration installations; no S7 disclosure data, no S8 rival research/finance roots) so the
 * emitted saves are genuine V26 originals for the V26→V27 migration proofs. Re-running on a later
 * engine emits that engine's current version, not V26; the provenance file beside the fixtures is
 * the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v26-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { applyActions } from '../../core/actions.js'
import { exportSave, makeSave } from '../../core/save.js'
import { advanceTo } from '../p13a/fixtures.js'
import { s6LightingReady, s6SoundReady } from './s6-fixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p13b/', import.meta.url)
mkdirSync(out, { recursive: true })

function cancelledLighting(): GameState {
  const { state, adoptionId } = s6LightingReady()
  const at793 = advanceTo(state, state.market.tick + 2)
  return applyActions(at793, [{ kind: 'cancelAdoption', adoptionId } as never])
}

const fixtures: Record<string, () => GameState> = {
  // Lighting adoption committed at 791, cancelled at 793 (site work complete, installation unstarted): the
  // cancellation receipt, the refund ledger row, `cancelledWeek`, the retained unheld equipment asset and the
  // `restoration-lighting-stage` job placed and IN PROGRESS at the cancel week.
  'legacy-v26-lighting-cancelled-793': cancelledLighting,
  // The same world two weeks on: the restoration completed (the body back in service), the cancelled record
  // and its receipt retained as history.
  'legacy-v26-lighting-restored-795': () => { const s = cancelledLighting(); return advanceTo(s, s.market.tick + 2) },
  // Sound adoption committed at 303 and still MID-DEPLOYMENT at 309: every V26 leaf present in its NULL form
  // (`cancellation: null`, `cancelledWeek: null`), no refund row, no restoration.
  'legacy-v26-sound-mid-deployment-309': () => advanceTo(s6SoundReady().state, 309),
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  writeFileSync(new URL(`${name}.json.gz`, out), gzipSync(bytes, { level: 9 }))
  const tech = state.technology as unknown as { version: number; adoptions: { id: string; technologyId: string; cancelledWeek: number | null; operationalWeek: number | null; equipmentAssetId: string | null }[]; equipment: { id: string; holderAdoptionId: string | null }[] }
  const placements = state.placement.facilities.filter(f => f.installation !== undefined).map(f => ({ id: f.id, bp: f.blueprintId, status: f.status, placed: f.placedWeek, completes: f.completesWeek, cancellation: (f as unknown as { cancellation: unknown }).cancellation === null ? null : 'receipt' }))
  const refunds = state.ledger.filter(e => e.kind === 'constructionRefund').map(e => ({ week: e.week, amount: e.amount }))
  lines.push(`${name}.json.gz saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} technologyVersion=${tech.version} adoptions=${JSON.stringify(tech.adoptions.map(a => ({ id: a.id, t: a.technologyId, cancelled: a.cancelledWeek, operational: a.operationalWeek, asset: a.equipmentAssetId })))} equipment=${JSON.stringify(tech.equipment)} placements=${JSON.stringify(placements)} refunds=${JSON.stringify(refunds)}`)
}
console.log(lines.join('\n'))
