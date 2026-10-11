// Only protected historical comparison operands use this real, refusal-preserving projection.
import { deepStrictEqual } from 'node:assert/strict'
import { convertV46ToV45, makeSave, validateSaveV45, validateSaveV46 } from '../../src/core/save.js'
import type { GameState, GameStateV45 } from '../../src/core/types.js'

export function historicalSave45Comparison(state: GameState): GameStateV45 {
  const before = structuredClone(state)
  try {
    const written = makeSave(state)
    const writtenBefore = structuredClone(written)
    const current = validateSaveV46(written)
    deepStrictEqual(written, writtenBefore, 'current reader mutated its input')
    const currentBefore = structuredClone(current)
    // The public converter admits the full state and refuses nonempty cutting,
    // refunds or disposal tombstones. A refusal propagates; no field is erased here.
    const previous = convertV46ToV45(current)
    deepStrictEqual(current, currentBefore, 'historical converter mutated its input')
    const previousBefore = structuredClone(previous)
    const admitted = validateSaveV45(previous)
    deepStrictEqual(previous, previousBefore, 'historical reader mutated its input')
    return admitted.state
  } finally {
    deepStrictEqual(state, before, 'historical comparison mutated the current state')
  }
}
