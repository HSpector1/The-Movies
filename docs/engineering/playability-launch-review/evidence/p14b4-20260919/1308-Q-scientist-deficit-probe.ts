// Unchanged engine: rival Scientist deficit after hiring, seed p13b-s8-bridge-probe-01 with a player lab.
import { p13aGeneratedStudio, advanceTo } from '/Users/zacheryspector/The-Movies-headless-program/src/harness/p13a/fixtures.ts'
import { commitPlacement } from '/Users/zacheryspector/The-Movies-headless-program/src/core/placement.ts'
import { tick } from '/Users/zacheryspector/The-Movies-headless-program/src/core/tick.ts'
import { rivalScientistDemand } from '/Users/zacheryspector/The-Movies-headless-program/src/core/rivalResearch.ts'
import { rivalWeeklyOperatingCost } from '/Users/zacheryspector/The-Movies-headless-program/src/core/hollywood.ts'
let s = advanceTo(commitPlacement(p13aGeneratedStudio('p13b-s8-bridge-probe-01'), { blueprintId: 'research-laboratory', origin: { gx: 0, gy: 9 } }), 260)
let last = ''
for (let w = 260; w <= 420; w++) {
  const h = s.hollywood!
  for (const b of h.businesses) {
    const sci = h.activeEmploymentOrdinals.map(i => h.employment[i]!).filter(e => e.studioId === b.studioId && s.talent.find(t => t.id === e.terms.talentId)?.role === 'scientist').length
    const d = rivalScientistDemand(s, h, b, s.talent, w)
    const reserve = rivalWeeklyOperatingCost(b, h, w) * b.policy.reserveWeeks
    const row = b.studioId.slice(-3) + ' sci ' + sci + ' deficit ' + d + ' cashOK ' + (b.account.cash > reserve)
    if (d > 0 || sci > 0) { const key = row; if (!last.includes(key)) console.log(w, row) }
  }
  last = h.businesses.map(b => b.studioId).join()
  s = tick(s)
}
