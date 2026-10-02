// ── P15 roots: one list for every P15 Wave 2 RED (records 1356-C2 and 1356-F2 item 3) ──
//
// `P15_ROOTS` names the top-level GameState keys the P15 roots own: today the shared allocator
// `p15Sequence` (1355-F2 item 1) and the Power Ranking archive `powerRanking` (1356-A §5). Each later
// P15 RED adds its own root key here, in its own patch, at its landing. `stripP15` drops exactly
// these keys. A P15 native row is any object inside a P15 root that carries a numeric
// `p15DomainSequence` (1355-F2 item 2); `p15Rows` finds them without knowing a root's shape.

/** The top-level P15 root keys. Each later P15 RED adds its root key here at its landing. */
export const P15_ROOTS: readonly string[] = ['p15Sequence', 'powerRanking']

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
