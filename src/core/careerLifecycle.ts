// P14C.2a — THE RETIREMENT LIFECYCLE CORE. SCAFFOLD (record 777): every export
// below throws until the sole production writer implements it, so the independent
// RED fails because BEHAVIOUR is missing, never because a named export resolved to
// `undefined`. The contract is records 773 (decisions D1–D16) and 777 (surface).
//
// Pure: no React/DOM/async/IO, no time, no RNG, no module-level state. Lifecycle
// facts live in `state.careerLifecycle` and nowhere else.
import type { CareerLifecycleRoot, CreativeRole, GameState, RetirementRecord } from './types.js'

export type LifecycleStatus = 'active' | 'announced' | 'finishing_commitments' | 'retired'

/** Stamped on every record (companion §6.2: "a deterministic, versioned intent rule"). */
export const LIFECYCLE_INTENT_RULES_VERSION = 1 as const

const missing = (name: string): never => {
  throw new Error(`careerLifecycle.${name}: not implemented (P14C.2a scaffold, record 777)`)
}

/** `{start, hard}` for a profession (773 D1), `null` for a Scientist (773 D2). */
export function retirementWindow(_role: CreativeRole): { start: number; hard: number } | null {
  return missing('retirementWindow')
}

/** The empty root a fresh world, and the V33 → V34 migration, opens (773 D13). */
export function initialCareerLifecycle(_week: number): CareerLifecycleRoot {
  return missing('initialCareerLifecycle')
}

export function retirementRecordFor(_state: GameState, _personId: string): RetirementRecord | undefined {
  return missing('retirementRecordFor')
}

export function lifecycleStatus(_state: GameState, _personId: string): LifecycleStatus {
  return missing('lifecycleStatus')
}

/** `null` when a contract ending at `endWeekExclusive` may bind this person; else a
 * reason carrying `retirementAnnounced`, `finishingCommitments` or
 * `retiredFromProfession` (777 §3). */
export function contractEndRefusal(_state: GameState, _personId: string, _endWeekExclusive: number): string | null {
  return missing('contractEndRefusal')
}

/** `null` when a production seat assigned at `week` is lawful for this person (773 D9). */
export function assignmentRefusal(_state: GameState, _personId: string, _week: number): string | null {
  return missing('assignmentRefusal')
}

/** The weekly step (777 §4): settlement, then intent for `birthdays` only. */
export function advanceCareerLifecycleWeek(_state: GameState, _birthdays: readonly string[]): GameState {
  return missing('advanceCareerLifecycleWeek')
}
