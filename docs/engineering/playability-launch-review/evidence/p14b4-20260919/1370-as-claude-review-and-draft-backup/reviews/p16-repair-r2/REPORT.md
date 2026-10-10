# P16 bounded type repair R2: engagement-table correction

Root explicitly authorized changing only the three newly added engagement classifications and their comment in the isolated P16 draft. `rightsConsideration`, `dueDiligenceFee` and `acquisitionOutlay` now map to `false`; all other R1 edits are byte-unchanged. There is no new V5 validator or current transaction gate, schema, amount/sign or gameplay producer change. No tests, compiler, candidate imports or Git mutation ran. Claude logs/progress and the main repository were untouched.

## Correction and exact source basis

The R1 author incorrectly inferred that entered/founded transaction premises proved `economyEngagedEver`. `rightsFinance.ts:41-56` does not directly check that flag, so those premises do not establish this classification. R1's added true values would also change the historical reconstruction's prior missing-key `undefined`/falsy behavior.

The initial follow-up hypothesis that frozen V5 validation rejects P16 ledger kinds was also incorrect. Actual `save.ts:1055-1070` calls `checkEnvelope` and selected V11–V14 authority refusals. `checkEnvelope:767-796` checks seed/state/cache shape, not ledger kinds, and the comment at 799 explicitly retains additive tolerance. Those selected refusals do not reject the three P16 kinds. Therefore unreachable-in-V5 was not established and is not claimed here. This correction records the writer's mistaken true rationale and the root/review conversation's initially mistaken unreachability premise; the independent reviewer then identified the tolerant path before any R2 edit.

Actual `convertV5ToV6` calls `validateSaveV5` first (now source line 7065), then uses `ledger.some(ledgerKindProvesEngagement)` at 7070 to reconstruct `economyEngagedEver`. With explicit false for the new keys, a tolerated old envelope containing only these new ledger kinds retains the previous falsy lookup behavior while the table remains exhaustive for the current `LedgerKind` union. These table entries are not historical engagement evidence and do not grant current transaction authority. No assertion about current P16 engagement policy is made.

## Preserved evidence and restoration

R1 remains exactly preserved under `/Users/zacheryspector/studio-scratch/1370-as-p16-type-repair-20261010-r1`; its source report/rationale is rejected historical evidence, not superseded in place. R2 preserves its exact pre-correction save under `before/src/core/save.ts`, all four exact Claude originals under `claude-original/`, and all four final files under `after/`.

`R1-TO-R2.patch` and `R2-TO-R1.patch` cover only this correction. `FINAL-FOUR-FILE-REPAIR.patch` and `FINAL-FOUR-FILE-REVERSE.patch` cover the full final four-file repair against the original Claude bytes. `CHANGED-FILES.json` pins every original/R1/final role and both patch pairs. Whole original-to-final forward/inverse source projections and unchanged other-three-file hashes were checked by Python stdlib. No target-clone process argv was observed immediately before copying the R1 save, and final source hashes were checked against retained copies.

The original Claude compiler RED remains `/Users/zacheryspector/studio-scratch/1370-ar-p16-rights-estate-implementation-20261010-r1/evidence/tsc-run1.txt`, 18,315 bytes, SHA256 `a049c1c4aa3f6aa08263eeeb11fca6a29737f0891d607432a0d324f6b5399239`. Its targeted headings and exact bytes are preserved in R1. There is no new compiler result or full-typecheck-green claim; other recorded errors remain unresolved.
