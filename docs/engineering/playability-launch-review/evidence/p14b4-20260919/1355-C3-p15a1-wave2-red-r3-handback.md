# 1355-C3: P15A.1 Wave 2 RED, revision r3 (answers 1355-D2 and the binding 1355-F5)

**Status: DONE, unexecuted.** I wrote r3 by reading; no vitest, tsc, node or tsx ran. Scratch tree `tree/`: branch `main` moves from 25d0109 (r2) to 3b0b0b5 in two commits, tests only. New branch `ref3` (a37d210) is `ref2` plus one reference commit. Real HEAD 21e433c8 has no `src` or `tests` drift since 1063ab4f, and the r3 RED patch passes `git apply --check` there. 1356-C's reference r2 then `reference/1355-reference-r3.patch` apply in order on `main` and give `ref3`'s `src` exactly.

## Changes from 1355-D2/F5
| F5 item | Change | Files |
|---|---|---|
| 1, leaf | The phase mock adds one version-2 table through `importOriginal` and replaces nothing else; the `p15PhaseMatches` override is gone. A row declared under v2 with v2's ordinal must validate. The header declares the seam: validators read `P15_PHASE_TABLES[row.phaseOrderVersion]` through the module's exported binding | `tests/p15a1-market-integration-phases.test.ts` |
| 1, reference | The market validator and, in the merge, the archive validator resolve each row's entry through the exported `P15_PHASE_TABLES` at the row's own version. The reference drops `p15PhaseMatches`, the helper that closed over the module's table. Reads only, so frozen table objects work | `marketIntegration.ts`, `powerRankingArchive.ts`, `p15Phases.ts` |
| 2 | The shared capture serves one shared save step only. The main test header now says so, and the classification flags both capture leaves | main test header; r3 classification |

## The shared capture (1355-F5 item 2)
`tests/fixtures/p15/genuine-below-p15-save-step/` holds a capture below ONE shared P15 save step. The pins hold at one step or at separate steps; the capture does not. If the roots land at separate steps, each step's production mints its own capture below its own step, at its own path, and the reading leaves are re-pinned then: both RED 16 capture leaves here and 1356-C's capture leaf.

## Unchanged from r2
Landing order (P15A.2 slice 2a first), the shared `tests/helpers/p15-roots.ts` (`sharedMarket` added; the second lander merges the list), R1 to R3, the re-pin declarations, producer r2, and 59 leaves: 51 RED, 8 control, 6 fixture-pending, 4 pass today.

## Reference run (parent)
```
T=/Users/zacheryspector/studio-scratch/1355-red/tree; cd $T && git checkout -q main
npx vitest run --project core tests/p15a1-market-integration*.test.ts   # 4 pass, 55 fail
git apply /Users/zacheryspector/studio-scratch/1356-red/reference/1356-reference-r2.patch
git apply /Users/zacheryspector/studio-scratch/1355-red/reference/1355-reference-r3.patch
npx vitest run --project core tests/p15a1-market-integration*.test.ts   # expect 53 pass, 6 FIXTURE PENDING
git checkout -- src && git clean -fdq src
```

## Not taken (outside items 1-2)
1355-D2's note: the producer checks the paired picture's release only by estimate. Ticking 26 weeks before writing would prove RED 16 leaf 2's premise, which matters because nobody can re-mint after the writer moves. The parent decides.
