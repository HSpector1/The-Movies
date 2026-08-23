// Economy Diagnosis 02 pinned authority and path boundary.

export const DIAGNOSIS_FROZEN_AUDIT_TIP =
  'e6c10c3880c8e843004bd2c57833b09b92efa899' as const
export const DIAGNOSIS_CANONICAL_MAIN =
  'c902a704eb948cc576083d0973c8c23e59937dc1' as const
export const DIAGNOSIS_EXPECTED_BRANCH =
  'codex/economy-diagnosis-02' as const
export const DIAGNOSIS_AUDIT_INSTRUMENT_COMMIT =
  '3556519881356e5d300423daaf1ae2ae99fc37ba' as const

export const DIAGNOSIS_PRODUCTION_PATHS = [
  'src/core',
  'ui/src/engine',
  'bridge',
] as const

export const DIAGNOSIS_INSTRUMENT_PATHS = [
  'src/harness/economy-diagnosis',
  'scripts/economy-diagnosis',
  'package.json',
] as const

export type EconomyDiagnosisProvenance = {
  canonicalMain: typeof DIAGNOSIS_CANONICAL_MAIN
  canonicalMainTree: string
  frozenAuditTip: typeof DIAGNOSIS_FROZEN_AUDIT_TIP
  frozenAuditIsAncestor: boolean
  instrumentCommit: string
  instrumentTree: string
  branch: string
  productionDiffPaths: string[]
  instrumentWorktreeDirty: boolean
  runtime: string
}

