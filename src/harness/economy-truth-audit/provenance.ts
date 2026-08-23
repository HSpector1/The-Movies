// Pinned authority for this parallel audit. The runner independently verifies the tree and
// refuses to measure when production paths differ from canonical main.

export const ECONOMY_TRUTH_CANONICAL_COMMIT =
  'c902a704eb948cc576083d0973c8c23e59937dc1' as const
export const ECONOMY_TRUTH_GOLDEN_M6_ANCESTOR =
  'ce0eaee8772d7e1975b6cfdb62466cd7b60091d3' as const

export const ECONOMY_TRUTH_PRODUCTION_PATHS = [
  'src/core',
  'ui/src/engine',
] as const

export const ECONOMY_TRUTH_INSTRUMENT_PATHS = [
  'src/harness/d16',
  'src/harness/facilities',
  'src/harness/economy-truth-audit',
  'scripts/economy-truth-audit',
  'package.json',
] as const

export type EconomyTruthProvenance = {
  canonicalCommit: typeof ECONOMY_TRUTH_CANONICAL_COMMIT
  canonicalTree: string
  goldenM6Ancestor: typeof ECONOMY_TRUTH_GOLDEN_M6_ANCESTOR
  goldenIsAncestor: boolean
  auditCommit: string
  auditTree: string
  branch: string
  productionDiffPaths: string[]
  instrumentWorktreeDirty: boolean
  runtime: string
}
