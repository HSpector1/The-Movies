import { makeSave } from '../../src/core/save.js'
import { rightsStripped } from './p16-era.js'
import { FOUNDING_FUNDING_SAVE_VERSION, validateSaveV47, type SaveFileV47 } from '../../src/core/save.js'
import type { GameState } from '../../src/core/types.js'
// ── P15 roots: one list for every P15 Wave 2 RED (records 1356-C2 and 1356-F2 item 3) ──
//
// `P15_ROOTS` names the top-level GameState keys the P15 roots own: today the shared allocator
// `p15Sequence` (1355-F2 item 1) and the Power Ranking archive `powerRanking` (1356-A §5). Each later
// P15 RED adds its own root key here, in its own patch, at its landing. `stripP15` drops exactly
// these keys. A P15 native row is any object inside a P15 root that carries a numeric
// `p15DomainSequence` (1355-F2 item 2); `p15Rows` finds them without knowing a root's shape.

/** The top-level P15 root keys. Each later P15 RED adds its root key here at its landing. */
export const P15_ROOTS: readonly string[] = ['p15Sequence', 'powerRanking', 'sharedMarket', 'campaignLegacy', 'corporateCondition', 'studioClosure']

/** The state without its P15 roots: exactly the keys in `P15_ROOTS` dropped, every other key kept. */
export function stripP15(state: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(state).filter(([key]) => !P15_ROOTS.includes(key)))
}

export type P15Row = { p15DomainSequence: number }

/** Every P15 native row inside the named roots, in a fixed walk order: roots as listed, arrays by
 * index, object keys sorted. */
export function p15Rows(state: object, roots: readonly string[] = P15_ROOTS): P15Row[] {
  const rows: P15Row[] = []
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }
    if (node === null || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    if (typeof record.p15DomainSequence === 'number') rows.push(record as P15Row)
    for (const key of Object.keys(record).sort()) walk(record[key])
  }
  for (const key of roots) walk((state as Record<string, unknown>)[key])
  return rows
}

// ── P15B (record 1370-ar): the predecessor envelope for the frozen downgrade chains ────────────────
// Historical-fixture tests downgrade a live save through the public chain (`convertV47ToV46(...)`,
// `convertV46ToV45(...)`, `convertV45ToV44(...)`). The production downgrade `convertFromP15BSave` refuses any
// evaluated condition record, so those tests build the predecessor envelope here instead: the P15B roots are
// dropped and the zero loan/claim money kinds removed, deliberately and visibly, and the predecessor's own
// reader (founding's Save47 over R8's Save46, every gate kept) admits the result. A state a predecessor cannot
// carry (a non-zero loan or claim movement, a loan or claim ledger row) refuses by name rather than being
// silently flattened. r2 (1370-ar): the predecessor is Save47; its number is read from save.ts, never spelled here.
export function predecessorSave(state: GameState): SaveFileV47 {
  // Test-only guarded rights projection first; actual Save48 admission preserves all P15B laws.
  if ('rights' in state) state = rightsStripped(makeSave(state)).state as GameState
  const raw = Object.fromEntries(Object.entries(state).filter(([key]) => key !== 'corporateCondition' && key !== 'studioClosure')) as Record<string, unknown>
  if ((state.ledger as { kind: string }[]).some((row) => row.kind === 'loanPrincipal' || row.kind === 'loanInstallment' || row.kind === 'claimPayment')) {
    throw new Error('predecessorSave: the ledger holds a loan or claim row no predecessor era can carry')
  }
  const hollywood = state.hollywood
  if (hollywood !== null) {
    raw.hollywood = { ...hollywood, businesses: hollywood.businesses.map((b) => ({ ...b, account: { ...b.account, periods: b.account.periods.map((p) => {
      const movements = { ...p.movements } as Record<string, number>
      for (const kind of ['loanPrincipal', 'loanInstallment', 'claimPayment']) {
        if ((movements[kind] ?? 0) !== 0) throw new Error(`predecessorSave: ${b.studioId} holds a ${kind} movement no predecessor era can carry`)
        delete movements[kind]
      }
      return { ...p, movements }
    }) } })) }
  }
  // The allocator below this step is one more than the largest sequence the four P15 roots hold: the P15B rows that left
  // with their roots took their sequences with them (the same recursive walk as validateP15Allocator).
  const sequences: number[] = []
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(walk)
    else if (node !== null && typeof node === 'object') {
      const row = node as Record<string, unknown>
      if (typeof row.p15DomainSequence === 'number') sequences.push(row.p15DomainSequence)
      Object.values(row).forEach(walk)
    }
  }
  for (const key of ['sharedMarket', 'powerRanking', 'campaignLegacy']) walk(raw[key])
  raw.p15Sequence = { version: 1, next: Math.max(0, ...sequences) + 1 }
  return validateSaveV47({ saveVersion: FOUNDING_FUNDING_SAVE_VERSION, seed: state.seed, state: raw, broadcastCache: state.broadcastItems })
}
