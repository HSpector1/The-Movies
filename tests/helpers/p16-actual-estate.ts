// Round 8 draft: original captured48 input and ordinary current49 closure. No fabricated closure facts.
import { expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { convertV48ToV49, makeSave, stableStringify, validateSaveP15B } from '../../src/core/save.js'
import { tick } from '../../src/core/tick.js'
import { buildEstateHandoff } from '../../src/core/estate.js'
import * as estateApi from '../../src/core/estate.js'
export function actualEstatePrior() {
  const path = process.env.P16_JOIN_PREC48_PATH
  expect(path, 'original publicSave48 pre-C162 capture binding').toBeTruthy()
  const bytes = readFileSync(path!)
  expect(createHash('sha256').update(bytes).digest('hex')).toBe('cd11f369558e09f1d65d8e848374ea028f4c5f666c168b5527e48c098cfdfb19')
  const raw = JSON.parse(bytes.toString()), before = stableStringify(raw)
  const predecessor = validateSaveP15B(raw)
  expect(predecessor.saveVersion).toBe(48)
  expect(predecessor.state.market.tick).toBe(162)
  const prior = convertV48ToV49(predecessor).state
  makeSave(prior)
  expect(stableStringify(raw)).toBe(before)
  return prior
}
export function actualEstateClosure() {
  const prior = actualEstatePrior()
  const priorBytes = stableStringify(prior), state = tick(prior)
  expect(stableStringify(prior)).toBe(priorBytes)
  makeSave(state)
  const closure = state.studioClosure.closures.find(c => c.studioId === 'studio-aca408ec-r04')!
  expect(closure).toBeDefined()
  expect(closure.closureWeek).toBe(163)
  const estate = state.rights.estates.find(e => e.closureId === closure.closureId)!
  expect(estate).toBeDefined()
  expect(estate.origin).toEqual({ kind: 'closure49', closureId: closure.closureId })
  const handoff = buildEstateHandoff(state, closure)
  expect(estate.lots.map(({ status, winningBidId, transactionId, ...lot }) => lot)).toEqual(handoff.lots)
  expect(estate.claimsContext).toEqual(handoff.claimsContext)
  expect(estate.cashReconciliation).toEqual(handoff.cashReconciliation)
  return { prior, state, closure, estate, handoff }
}

/** Capture the real closure producer's handoff boundary; no reconstructed or removed estate rows.
 * The input is an actual intermediate phase, not independently a complete saved aggregate. */
export function actualEstateOpening() {
  const open = estateApi.openEstate
  let boundary: Parameters<typeof open> | undefined
  const spy = vi.spyOn(estateApi, 'openEstate').mockImplementation((...args) => {
    if (args[1].studioId === 'studio-aca408ec-r04') boundary = structuredClone(args)
    return open(...args)
  })
  let actual: ReturnType<typeof actualEstateClosure>
  try { actual = actualEstateClosure() } finally { spy.mockRestore() }
  expect(boundary, 'real current49 closure invokes the typed estate adapter').toBeDefined()
  return { ...actual, boundary: boundary! }
}
