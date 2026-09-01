// §21 probe v2 — auto-plays the minimal legal production-operation decisions each
// week (exactly what an attentive player would do), then advances. Copy-only.
import { readFileSync } from 'node:fs'
import { importSaveJson, advanceWeek } from './ui/src/engine/adapter'
import { nextStudioDecision } from './src/core/scriptReadModel'
import { applyActions } from './src/core/actions'

const baseline = JSON.parse(readFileSync(
  '/Users/bruce/Project Studio Owner Profile Baselines/P06-campaign-start-20260901/bridge-runtime-v1.json', 'utf8'))
const outcome: any = importSaveJson(baseline.currentSaveJson)
if (!outcome.ok) throw new Error('import failed: ' + outcome.error)
let state: any = outcome.state

const row = (s: any) => ({
  week: s.market.tick,
  cash: Math.round(s.studio.cash),
  active: s.studio.activeProductions.map((p: any) => `${p.id}:t${p.remainingTicks}`).join(' '),
  released: s.studio.releasedFilms.length,
  runs: s.theatricalRuns.filter((r: any) => r.status === 'active').length,
})
console.log('START', JSON.stringify(row(state)))
for (let i = 0; i < 26; i++) {
  // resolve every production-operation decision the engine publishes
  for (let guard = 0; guard < 12; guard++) {
    const d: any = nextStudioDecision(state)
    if (!d) break
    if (d.kind === 'productionOperation') {
      try { state = applyActions(state, [d.command]) }
      catch (e) { console.log('  decision refused:', d.command.kind, (e as Error).message.slice(0, 110)); break }
    } else { console.log('  non-op decision stop:', d.kind); break }
  }
  const res = advanceWeek(state)
  state = res.next
  console.log(`W+${i + 1}`, JSON.stringify(row(state)))
}
const fr = state.studio.releasedFilms.map((f: any) =>
  ({ id: f.productionId, critic: Math.round(f.criticScore), opening: Math.round(f.boxOffice.opening), total: Math.round(f.boxOffice.total) }))
console.log('RELEASED FILMS', JSON.stringify(fr))
