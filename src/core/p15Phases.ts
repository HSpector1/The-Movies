// ── P15 domain-local phase identity and the one P15 allocator (1355-F2 items 1-3) ──
// Authority (docs/engineering/playability-launch-review/evidence/p14b4-20260919/): 1355-F2 items 1-3,
// 1355-F5 ruling 1 and 1361-F ruling 6. This is 1355 r3's form of the module.
//
// One documented table per phase-order version. A P15 native row stores the triple it
// was written under and keeps it; a later catalogue maps versions and never rewrites rows.

// P15B Wave 4 (record 1370-ar; the Wave-4 closure contract §2): version 2 inserts the actual closure phase
// `p15b.closure` between the condition step and the finale. Table 1 and every row written under it are
// unchanged. Save49 adds estate-sale phase version3; predecessor writers explicitly retain table2.
export const P15_PHASE_ORDER_VERSION = 3 as const

/** Ordinals ascend in the table's order (1355-F2 item 3). */
export const P15_PHASE_TABLES: Readonly<Record<number, readonly { readonly phaseId: string; readonly phaseOrdinal: number }[]>> = {
  1: [
    { phaseId: 'p15a1.marketBatch', phaseOrdinal: 1 },
    { phaseId: 'p15a2.rankingRecord', phaseOrdinal: 2 },
    { phaseId: 'p15b.condition', phaseOrdinal: 3 },
    { phaseId: 'p15c.finale', phaseOrdinal: 4 },
  ],
  2: [
    { phaseId: 'p15a1.marketBatch', phaseOrdinal: 1 },
    { phaseId: 'p15a2.rankingRecord', phaseOrdinal: 2 },
    { phaseId: 'p15b.condition', phaseOrdinal: 3 },
    { phaseId: 'p15b.closure', phaseOrdinal: 4 },
    { phaseId: 'p15c.finale', phaseOrdinal: 5 },
  ],
  3: [
    { phaseId: 'p15a1.marketBatch', phaseOrdinal: 1 },
    { phaseId: 'p16.estateSale', phaseOrdinal: 2 },
    { phaseId: 'p15a2.rankingRecord', phaseOrdinal: 3 },
    { phaseId: 'p15b.condition', phaseOrdinal: 4 },
    { phaseId: 'p15b.closure', phaseOrdinal: 5 },
    { phaseId: 'p15c.finale', phaseOrdinal: 6 },
  ],
}

export type P15PhaseTriple = { phaseId: string; phaseOrdinal: number; phaseOrderVersion: number }

/** The triple a new row of `phaseId` is written under (the current version). */
export function p15PhaseTriple(phaseId: string, version: number = P15_PHASE_ORDER_VERSION): P15PhaseTriple {
  const entry = P15_PHASE_TABLES[version]?.find(row => row.phaseId === phaseId)
  if (entry === undefined) throw new Error(`p15Phases: unknown phase ${phaseId}`)
  return { phaseId, phaseOrdinal: entry.phaseOrdinal, phaseOrderVersion: version }
}

// 1355-F5 ruling 1: validators read a row's entry as `P15_PHASE_TABLES[row.phaseOrderVersion]`
// through this module's exported binding. No helper here closes over the table for validation, so
// an added version reaches every validator.

/** The one persisted P15 allocator (1355-F2 item 1). Starts at 1; `next++` at append. */
export type P15Sequence = { version: 1; next: number }
export const initialP15Sequence = (): P15Sequence => ({ version: 1, next: 1 })
