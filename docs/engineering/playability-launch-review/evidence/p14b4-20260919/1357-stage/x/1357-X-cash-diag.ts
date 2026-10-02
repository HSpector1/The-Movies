// 1357-X diagnostic beside the 1357-P probe: per entered rival, on the same natural routes, whether cash ever returns
// above zero after its first week at or below zero. Read-only: ticks `p13aGeneratedStudio` then `tick`, writes one
// JSON document to stdout and nothing to disk.
import { tick } from '../tree/src/core/tick.ts'
import { p13aGeneratedStudio } from '../tree/src/harness/p13a/fixtures.ts'

const SEEDS = (process.env.PROBE_SEEDS ?? 'p13a-core-causal-01,seed-b,p13a-wait-control-01').split(',').map(s => s.trim()).filter(Boolean)
const WEEKS = Number(process.env.PROBE_WEEKS ?? 6240)
if (!Number.isSafeInteger(WEEKS) || WEEKS < 1) throw new Error(`diag: PROBE_WEEKS must be a positive integer (got ${process.env.PROBE_WEEKS})`)

type Row = { enteredWeek: number; firstNonPositive: number | null; positiveWeeksAfterFirstNonPositive: number;
  lastPositive: number | null; minCash: number; endCash: number; lastWeekWithStaff: number | null; staffAtEnd: number }

const report = SEEDS.map(seed => {
  let state = p13aGeneratedStudio(seed)
  const rows = new Map<string, Row>()
  while (state.market.tick < WEEKS) {
    state = tick(state)
    const W = state.market.tick
    const h = state.hollywood
    if (!h) continue
    for (const s of h.identities) {
      if (s.role !== 'rival' || s.enteredWeek === null || s.enteredWeek > W) continue
      const b = h.businesses.find(x => x.studioId === s.studioId)
      if (!b) throw new Error(`diag: entered rival ${s.studioId} has no business`)
      const cash = b.account.cash
      const staff = h.activeEmploymentOrdinals.filter(i => h.employment[i]!.studioId === s.studioId).length
      let r = rows.get(s.studioId)
      if (!r) {
        r = { enteredWeek: s.enteredWeek, firstNonPositive: null, positiveWeeksAfterFirstNonPositive: 0, lastPositive: null,
          minCash: cash, endCash: cash, lastWeekWithStaff: null, staffAtEnd: 0 }
        rows.set(s.studioId, r)
      }
      if (cash <= 0) r.firstNonPositive ??= W
      else {
        r.lastPositive = W
        if (r.firstNonPositive !== null) r.positiveWeeksAfterFirstNonPositive++
      }
      if (staff > 0) r.lastWeekWithStaff = W
      r.minCash = Math.min(r.minCash, cash)
      r.endCash = cash
      r.staffAtEnd = staff
    }
  }
  return { seed, finalWeek: state.market.tick, rivals: Object.fromEntries([...rows].sort(([x], [y]) => (x < y ? -1 : 1))) }
})
console.log(JSON.stringify({ diag: '1357-X cash path', treeHead: process.env.PROBE_TREE_HEAD ?? 'unrecorded', weeks: WEEKS, seeds: report }, null, 1))
