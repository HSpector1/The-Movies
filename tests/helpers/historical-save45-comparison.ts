// Only protected historical comparison operands use this real, refusal-preserving projection.
import { deepStrictEqual } from 'node:assert/strict'
import { convertV46ToV45, convertV47ToV46, makeSave, validateSaveV45, validateSaveV49 } from '../../src/core/save.js'
import type { GameState, GameStateV45 } from '../../src/core/types.js'
import { predecessorSave } from './p15-roots.js'

export function historicalSave45Comparison(state: GameState): GameStateV45 {
  const before = structuredClone(state)
  try {
    const written = makeSave(state)
    const writtenBefore = structuredClone(written)
    const current = validateSaveV49(written)
    deepStrictEqual(written, writtenBefore, 'current reader mutated its input')
    const currentBefore = structuredClone(current)
    // P15B (1370-ar): the live step's own converter refuses any evaluated condition record (every ticked
    // industry state holds one), so the chain starts from the predecessor envelope the test helper builds
    // (tests/helpers/p15-roots.ts): only the two P15B roots and the zero loan movements leave, and anything a
    // predecessor cannot carry refuses by name. From there the public converters admit the full state and
    // refuse a recorded recruitment fund (Save47), then nonempty cutting, refunds or disposal tombstones
    // (Save46). A refusal propagates; no other field is erased here.
    const previous = convertV46ToV45(convertV47ToV46(predecessorSave(current.state)))
    deepStrictEqual(current, currentBefore, 'historical converter mutated its input')
    const previousBefore = structuredClone(previous)
    const admitted = validateSaveV45(previous)
    deepStrictEqual(previous, previousBefore, 'historical reader mutated its input')
    return admitted.state
  } finally {
    deepStrictEqual(state, before, 'historical comparison mutated the current state')
  }
}
