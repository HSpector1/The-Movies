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
  | { kind: 'rejected' }
>

export function prepareLiveWritingContext(state: GameState): LiveWritingContext {
  if (!retirementWritingNeedsProfessionProof(state)) return { kind: 'legacy' }
  try {
    return { kind: 'proved', profession: validatedLiveProfessionContext(state) }
  } catch {
    // Required proof failed: never recover a context-free, single-row grant.
    return { kind: 'rejected' }
  }
}

export function liveRetirementWritingAuthority(
  state: GameState,
  context: LiveWritingContext = prepareLiveWritingContext(state),
): RetirementWritingAuthority | undefined {
  if (context.kind === 'rejected') return undefined
  return retirementWritingAuthority(state, context.kind === 'proved' ? context.profession : undefined)
}
