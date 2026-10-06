# EBG r8 V27 whole-file overlay proposal r1

Static test-only correction for the three observed r7 focused failures. One file changes: `tests/p13b-s8-save-v27.test.ts`. Preserve the genuine V26 fixture bytes, all V27 assertions, all six B-only consumer tests, and the 197-file EBG production source map. No source edit, execution, or repository edit occurred.

The live writer expectation moves from 45 to 46. The unknown-version sentinel moves from 46 to 47, with the strict handled range from 1..45 to 1..46. The final genuine-use leaf now lifts the same genuine V26 fixture through `migrateToV27` before explicit `admitRivalPlans(..., 'pre-recovery')`; this supplies the V27 research finance roster required by the historical seam. Earlier V27 staging remains unchanged. The downgrade refusal assertion remains, so any new V46 recovery-authority mask will surface in the next recorded run instead of being suppressed.

This is a proposal only. Independent static review must verify exact three diff hunks (four semantic corrections), no weakened refusal assertion, genuine fixture bytes, no production change, and the failed r7 result pins before a fresh executable package is built.
