import { applyActions } from './src/core/actions.ts'
import { hiringMarketIds } from './src/core/employment.ts'
import { p13aGeneratedStudio } from './src/harness/p13a/fixtures.ts'
import { TUNING } from './src/core/tuning.ts'
let s = p13aGeneratedStudio('r1314-casting-01')
const m = hiringMarketIds(s, 0)
const role = (id: string) => s.talent.find(t => t.id === id)!.role
console.log('terms', JSON.stringify(TUNING.CONTRACT_TERM_OPTIONS))
const order: [string, number][] = [['t-wri-05', 208], ['t-cra-09', 208], ['t-dir-04', 208], ['t-act-24', 208], ['t-act-08', 52], ['t-act-20', 208], ['t-act-12', 60]]
for (const [id, term] of order) {
  console.log('before', id, JSON.stringify(hiringMarketIds(s).map(x => x + ':' + role(x))))
  try { s = applyActions(s, [{ kind: 'signContract', talentId: id, termWeeks: term }]); console.log(' signed', id, term) } catch (e) { console.log(' FAIL', id, term, (e as Error).message.slice(0, 160)) }
}
