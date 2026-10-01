# 1355-C2: P15A.1 Wave 2 RED, revision r2 (answers 1355-D and the binding 1355-F4)

**Status: DONE, unexecuted.** I wrote r2 by reading; no vitest, tsc, node or tsx ran. Scratch tree `tree/`: branch `main` moves from e514505 (r1) to 25d0109 in four commits, tests only. New branch `ref2` (5201f8b) holds the reference on top of 1356-C's reference r2 (e0ecf75). Real HEAD 47253527 has no `src` or `tests` drift since 1063ab4f; the r2 RED patch passes `git apply --check` there, and the two reference patches apply in order on `main`, giving `ref2`'s `src` exactly.

## Landing order
This RED assumes the writer queue lands P15A.2 slice 2a (ranking archive, `p15Sequence`, `p15Phases.ts`) before P15A.1 Wave 2, so the ranking root exists at this wave's GREEN. It holds whether the roots share one save step (1355-F Amendment 4) or land at separate steps: the step functions resolve from the live constant, and every pin and comparison strips every `P15_ROOTS` key. `tests/helpers/p15-roots.ts` is shared with 1356-C: same path and contents, plus `sharedMarket` in `P15_ROOTS`. Whichever record lands second merges the list.

## Changes from 1355-D/F4
| Item | Change | Leaves or files |
|---|---|---|
| R1 | New RED 14 leaf: from `rivalRouteAt(66)`, the first state whose largest sequence a sibling row holds (via `P15_ROOTS` and `p15DomainSequence` only) validates; a market row given a sibling's sequence, ascent kept, refuses with `p15DomainSequence` and "duplicate" | `market-validator-reconciles: across P15 roots …` |
| R2, pins | The producer guards on `sharedMarket` alone; K1, K2 and M0A pins strip every `P15_ROOTS` key through `stripP15` | producer r2; K2, M0A leaves |
| R2, fixtures | `withEmptyMarketRoot`, synthetic rows and two forgeries derive `next` from `p15Rows` over every P15 root | route helper; RED 14 |
| R2, declared | Both leaves below are re-pinned at a sibling landing, or if the order changes | header; classification `repinAtSiblingLanding` |
| R3 | Pass-through `vi.mock` of `reception.js` logs release-site calls; both leaves assert `pressureFactor(1)` returned before the 0.5 call threw, as the last call | atomicity file |
| R4 | The phase leaf moves to its own file, which mocks `p15Phases.js` (`importOriginal` plus a v2 table; `p15PhaseMatches` answers from it). A row declared v2 with v2's ordinal must validate | `tests/p15a1-market-integration-phases.test.ts` |
| Also: K3 | G2's rerun at the RED commit is K3's baseline (1355-A:264) | this handback |
| Also: RED 16 | Leaf 2 asserts the ramp premise (`capturePremise`, shared with the producer) and that the paired in-flight picture's row omits the pre-migration release; both leaves pin the minted MANIFEST's sha256 (`CAPTURE_MANIFEST_SHA256`) | old-save leaves |
| Also: seams | Production must call `assessBatch` and `resolveReception` through their exports, from outside `sharedMarket.ts` and `reception.ts` | this handback; atomicity header |
| Also: skip | `skip` cannot add an input another record's capture lacks. The parent mints once, at the last writer below the step, with every reader's premises in one run | this handback; producer r2 |

## Declared, re-pinned at a sibling landing
- `MARKET_STEP`, at a later save step.
- The R1 leaf: it needs a sibling root's rows; by the landing order they exist at GREEN.
- `market-old-save: a non-empty root refuses the downgrade …` (week 70 holds ranking records), with 1356-C's `rank-root-downgrade-recorded-quarter-refuses`. The second lander fixes the refusal order for both. The r2 reference throws one refusal naming every non-empty root, which satisfies both leaves.

## Files and leaves (59: 51 RED, 8 control; 6 fixture-pending; 4 pass today)
`tests/p15a1-market-integration.test.ts` 54; `-atomicity.test.ts` 4; `-phases.test.ts` 1; helpers `p15a1-market-route.ts` and `p15-roots.ts`. The §7 coverage stands as in 1355-C, plus R1. Captures are as in 1355-C, now also pending the MANIFEST sha pin.

## Reference run (parent)
```
T=/Users/zacheryspector/studio-scratch/1355-red/tree; cd $T && git checkout -q main
npx vitest run --project core tests/p15a1-market-integration*.test.ts   # 4 pass, 55 fail
git apply /Users/zacheryspector/studio-scratch/1356-red/reference/1356-reference-r2.patch
git apply /Users/zacheryspector/studio-scratch/1355-red/reference/1355-reference-r2.patch
npx vitest run --project core tests/p15a1-market-integration*.test.ts   # expect 53 pass, 6 FIXTURE PENDING
git checkout -- src && git clean -fdq src
```
The r2 reference merges into 1356-C's Save44: one step strips and creates all three roots, and the archive's own `next` check gives way to one allocator check across every P15 root (1355-F2 item 4).

## Not decided
1. The R1 leaf scans forward from week 66, because a market batch at week 65 would hold the largest number at 66.
2. The phase mock supplies `p15PhaseMatches` as well as the table, so a validator must read either through the module export.
3. The refusal wording, reference names and the RED 18 reading stand as in 1355-C.
