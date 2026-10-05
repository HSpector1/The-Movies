// Install only in each parent's isolated arm at tests/probes/1367-boundary.probe.ts.
import { it } from 'vitest'
import { createHash } from 'node:crypto'
import { writeFileSync, lstatSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { tick } from '../../src/core/index.js'
import { makeSave } from '../../src/core/save.js'
import { p13aGeneratedStudio } from '../../src/harness/p13a/fixtures.js'

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) => {
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))
    }
    return v
  })
}
const hash = (v: unknown): string => createHash('sha256').update(canonical(v)).digest('hex')
it('observes genesis through produced week93 without changing inputs', () => {
  const arm = process.env.BOUNDARY_ARM
  if (arm !== 'control' && arm !== 'part-a') throw new Error('BOUNDARY_ARM must identify control or part-a')
  const target = process.env.BOUNDARY_OUTPUT
  if (!target || !target.startsWith('/Users/zacheryspector/studio-scratch/')) throw new Error('exclusive external output required')
  const output = resolve(target)
  if (!output.startsWith('/Users/zacheryspector/studio-scratch/')) throw new Error('output escaped scratch')
  for (let p = dirname(output); ; p = dirname(p)) {
    if (lstatSync(p).isSymbolicLink()) throw new Error(`symlink ancestor: ${p}`)
    if (p === dirname(p)) break
  }
  let state = p13aGeneratedStudio('p13a-core-causal-01')
  const rows: unknown[] = []
  const observed: unknown[] = []
  const seen = new Set<string>()
  for (let producedWeek = 0; producedWeek <= 93; producedWeek++) {
    if (state.market.tick !== producedWeek) throw new Error('unexpected produced boundary')
    const before = canonical(state)
    // Public validation is observer-only; its return is never fed into the route.
    makeSave(state)
    if (canonical(state) !== before) throw new Error('makeSave changed input')
    const receipts = state.hollywood?.receipts.filter(r => r.kind === 'screenplayShelved') ?? []
    for (const receipt of receipts) {
      if (!seen.has(receipt.eventId)) {
        seen.add(receipt.eventId)
        observed.push({ firstVisibleAtProducedWeek: producedWeek, receipt })
      }
    }
    rows.push({ producedWeek, stateSha256: hash(state), roots: Object.fromEntries(
      Object.entries(state).map(([key, value]) => [key, hash(value)])), shelvingReceiptCount: receipts.length })
    if (producedWeek < 93) {
      const next = tick(state)
      if (canonical(state) !== before) throw new Error('tick changed its input')
      state = next
    }
  }
  writeFileSync(output, JSON.stringify({ arm, seed: 'p13a-core-causal-01', horizon: 93,
    firstShelving: observed[0] ?? null, shelvingReceipts: observed, boundaries: rows,
    inputNeutral: true, everyBoundaryAdmitted: true }, null, 2) + '\n', { flag: 'wx' })
}, 300_000)
