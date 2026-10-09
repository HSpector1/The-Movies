/**
 * P14A.1 legacy-fixture generator. Run ONCE at the last V27 writer (the P13B-S8 closeout engine:
 * rival research facts — abstract rival Laboratories, the five rival receipt kinds, the four rival
 * research money kinds — no talent-market root, no P14 receipts) so the emitted saves are genuine
 * V27 originals for the V27→V28 migration proofs. Re-running on a later engine emits that engine's
 * current version, not V27; the provenance file beside the fixtures is the authority for what was minted.
 *
 *   npx vite-node src/harness/p13b/legacy-v27-fixtures.ts
 */
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { exportSave, makeSave } from '../../core/save.js'
import { renewalWindowOpen } from '../../core/employment.js'
import { advanceTo, p13aGeneratedStudio, p13aResearchReady } from '../p13a/fixtures.js'
import type { GameState } from '../../core/types.js'

const out = new URL('../../../tests/fixtures/p13b/', import.meta.url)
mkdirSync(out, { recursive: true })

/** The state at the first week ≥ `from` at which some player contract is inside its renewal window, or throws. */
function atFirstRenewalWindow(state: GameState, from: number, limit: number): GameState {
  let at = advanceTo(state, from)
  for (let week = from; week <= limit; week++) {
    at = advanceTo(at, week)
    if (at.contracts.some(c => renewalWindowOpen(c, week))) return at
  }
  throw new Error(`no player contract enters its renewal window between ${from} and ${limit}`)
}

const fixtures: Record<string, () => GameState> = {
  // A natural campaign at week 20: every rival has admitted and completed an abstract Laboratory (S8 receipts
  // laboratoryCommitted/laboratoryOperational, researchCapacity movements), no rival research project yet.
  'legacy-v27-natural-rival-labs': () => advanceTo(p13aGeneratedStudio(), 20),
  // The research-ready world (the player employs Scientists under real contracts) at the first week one of those
  // contracts is inside its 12-week renewal window: the P14A.1 subject state — an eligible expiry with entered
  // rivals present, rival research facts in the root, no market case root.
  'legacy-v27-renewal-window': () => { const base = p13aResearchReady(); return atFirstRenewalWindow(base, base.market.tick, base.market.tick + 260) },
}

const lines: string[] = []
for (const [name, build] of Object.entries(fixtures)) {
  const state = build()
  const save = makeSave(state)
  const json = exportSave(save)
  const bytes = Buffer.from(json, 'utf8')
  const file = `${name}-${state.market.tick}.json.gz`
  writeFileSync(new URL(file, out), gzipSync(bytes, { level: 9 }))
  const h = state.hollywood as unknown as { receipts: { kind: string }[]; businesses: { studioId: string; account: { periods: { movements: Record<string, number> }[] }; operations: { facilities: { capability: string }[] } }[] } | null
  const kinds: Record<string, number> = {}
  for (const r of h?.receipts ?? []) kinds[r.kind] = (kinds[r.kind] ?? 0) + 1
  const labs = (h?.businesses ?? []).map(b => b.operations.facilities.filter(f => f.capability === 'laboratory').length)
  const windows = state.contracts.filter(c => renewalWindowOpen(c, state.market.tick)).length
  lines.push(`${file} saveVersion=${save.saveVersion} week=${state.market.tick} bytes=${bytes.length} sha256(json)=${createHash('sha256').update(bytes).digest('hex')} receiptKinds=${JSON.stringify(kinds)} rivalLabs=${JSON.stringify(labs)} playerContractsInWindow=${windows}`)
}
console.log(lines.join('\n'))
