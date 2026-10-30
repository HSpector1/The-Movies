import type { GameState } from './types.js'
import type { ProfessionValidationContext } from './professionHistory.js'
import { validatedLiveProfessionContext } from './save.js'
import {
  retirementWritingAuthority,
  retirementWritingNeedsProfessionProof,
  type RetirementWritingAuthority,
} from './retirementWriting.js'

/** Invocation-local copied profession facts, never a persisted or week-bound
 * writing grant. Explicit legacy/rejected tokens also prevent re-proving the
 * temporary arriving-week state before retirement settlement. */
export type LiveWritingContext = Readonly<
  | { kind: 'legacy' }
  | { kind: 'proved'; profession: ProfessionValidationContext }
  | { kind: 'rejected'; reason: string }
>

export function prepareLiveWritingContext(state: GameState): LiveWritingContext {
  if (!retirementWritingNeedsProfessionProof(state)) return { kind: 'legacy' }
  try {
    return { kind: 'proved', profession: validatedLiveProfessionContext(state) }
  } catch (error) {
    // Required proof failed: never recover a context-free, single-row grant. The kind still denies authority; the
    // reason keeps the proof's own message so a refusal is visible to callers and tests (P18 FIX-3, review note 9).
    return { kind: 'rejected', reason: error instanceof Error ? error.message : String(error) }
  }
}

export function liveRetirementWritingAuthority(
  state: GameState,
  context: LiveWritingContext = prepareLiveWritingContext(state),
): RetirementWritingAuthority | undefined {
  if (context.kind === 'rejected') return undefined
  return retirementWritingAuthority(state, context.kind === 'proved' ? context.profession : undefined)
}
