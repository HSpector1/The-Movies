// Economy Diagnosis 02 pinned authority and path boundary.

export const DIAGNOSIS_FROZEN_AUDIT_TIP =
  'e6c10c3880c8e843004bd2c57833b09b92efa899' as const
export const DIAGNOSIS_CANONICAL_MAIN =
  'c902a704eb948cc576083d0973c8c23e59937dc1' as const
export const DIAGNOSIS_EXPECTED_BRANCH =
  'codex/economy-diagnosis-02' as const
export const DIAGNOSIS_AUDIT_INSTRUMENT_COMMIT =
  '3556519881356e5d300423daaf1ae2ae99fc37ba' as const

export const DIAGNOSIS_FROZEN_MACRO_FILES = [
  {
    file: 'macro-0.json',
    sha256: 'cd9a941929bba3f1d492fdfc5a431b7409194dd2048ed840e342a466961154f4',
  },
  {
    file: 'macro-1.json',
    sha256: 'e4301c3e2e597cb0155dc6c4cd1964fc729f67e5e03645ca7a5055ca189cbe96',
  },
  {
    file: 'macro-2.json',
    sha256: '208ef0f599593ca8a750e66691c3fc685cf520478ec13605f6a331106624b851',
  },
  {
    file: 'macro-3.json',
    sha256: '3d13cc7e53201df4df0e1ac195a9b75225ff082ba8c49be3d80f084bdfbdb778',
  },
] as const

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
