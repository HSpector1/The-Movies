// §21 economic-liveness probe — READ-ONLY over a byte-copy of the Owner baseline.
// Advances the copy through the existing engine (current auto-release law) to map
// the revenue/recovery trajectory. Never touches the durable profile.
import { readFileSync } from 'node:fs'
import { importSaveJson, advanceWeek } from './ui/src/engine/adapter'

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
  lastBox: s.studio.releasedFilms.at(-1)?.boxOffice?.total ?? null,
  runs: s.theatricalRuns.filter((r: any) => r.status === 'active').length,
})
console.log('START', JSON.stringify(row(state)))
for (let i = 0; i < 18; i++) {
  const res = advanceWeek(state)
  state = res.next
  const r = row(state)
  console.log(`W+${i + 1}`, JSON.stringify(r))
  if (r.active === '' && r.runs === 0 && i > 12) break
}
const fr = state.studio.releasedFilms.map((f: any) =>
  ({ id: f.productionId, critic: Math.round(f.criticScore), opening: f.boxOffice.opening, total: f.boxOffice.total }))
console.log('RELEASED FILMS', JSON.stringify(fr))
