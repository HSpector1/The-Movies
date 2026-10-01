# 1356-C: P15A.2 Wave 2 slice 2a RED handback (archive, adapter, fixed cost, step, validation, migration)

**Status: DONE, unexecuted.** Authored by reading only; no vitest, tsc or tsx ran (one stray `node -e` read the vitest version at setup). Scratch tree `tree/` (base `45b2782` = ff05430d content; `main` 138609b tests only; branch `ref` 61f13b2 holds the reference). Authority: 1356-A §3-§5, §8-§9; 1356-F (Amendment 2, Later ruling); 1355-F2 items 1-6 with the coordinator's ownership note; 1355-F Amendments 3-4; 1351-F; annex 2a7ff0d9 C.2, D.4, D.7, G. Real HEAD moved to 0f2ee8b9 (docs only; no `src` or `tests` drift); the RED patch passes `git apply --check` there.

## Files and leaves (71: 70 RED, 1 control)
| File | Leaves |
|---|---|
| `tests/p15a2-power-ranking-archive.test.ts` | 68 (67 RED, control `rank-root-frozen-builder-headless-control`) |
| `tests/p15a2-power-ranking-archive-isolation.test.ts` | 2 RED (RED 9, 10; `vi.mock` wraps the real step, own file) |
| `tests/p15a2-power-ranking-archive-harness.test.ts` | 1 RED (RED 17; 6,240 weeks; run alone) |

## §8 coverage
| Item | Leaves |
|---|---|
| 1 | `rank-adapter-player-films`, `rank-adapter-field-mapping-rivals-and-cohort` |
| 2, 3, 4, 6, 7 | `rank-adapter-run-end-parity`, `-authored`, `-pre-origin`, `-owner-swap`, `-no-leak` |
| 5 | `rank-fixed-cost-player-after-founding-excludes-research`, `-player-zero-while-founding`, `-rival-operating-cost` |
| 8 | `rank-step-cadence`, `-cadence-no-industry`, `-cadence-founded-midgame-none-at-origin-plus-one` |
| 9, 10 | isolation file: `rank-step-final-facts`, `rank-step-only-writes-archive` |
| 11 | `rank-step-entrant` (row 5 enters at 520) |
| 12 | `rank-root-fresh`, `rank-root-migration-empty`, `rank-root-migration-genuine-below-step-capture` |
| 13 | `rank-root-downgrade-empty-strips`, `-round-trip-claims-less`, `-recorded-quarter-refuses`, `-frozen-builders-refuse` |
| 14 | 17 refusal leaves for §5 items 1-4 (keys, version, recordedFromWeek, cadence, definition, cohort) plus `rank-validate-genuine-archive-validates`; 1356-F A2: `rank-validate-cadence-boundary` (four cases) |
| 15 | 12 leaves: ten single-field tampers, `-band-another-valid-band-passes`, `-band-unknown-refuses` |
| 16, 17 | `rank-append-only`, `rank-round-trip`; harness `rank-bounded-harness` |
| §5 record; 1356-F A1 with 1355-F2 items 1-5 | `rank-archive-module-exports`, `p15-phase-table-v1`, `rank-step-record-is-law-snapshot`, `-record-shape`, `rank-record-sequence-allocation`, `-phase-triple`; 7 refusals: week-only id, duplicate sequence, sequence at `next`, stale `next`, descending sequence, phase triple, `p15Sequence` root |

**Deferred to slice 2b:** items 18-27 (Bridge view, projection step).

## Save-version approach
No future version is written. `ARCHIVE_STEP = saveModule.LIVE_SAVE_VERSION`; the leaves resolve `validateSaveV${N}`, `convertV${N-1}ToV${N}`, `convertV${N}ToV${N-1}`, `migrateToV${N-1}` and every older `migrateToVxx` by name, and assert versions as N and N-1. Today N is 43, so leaves run the Save43 functions and fail on the missing root. A later step pins `ARCHIVE_STEP` in its sweep. The reference uses 44 in scratch only.

## Reference run (parent)
```
T=/Users/zacheryspector/studio-scratch/1356-red/tree; cd $T && git checkout -q main
npx vitest run --project core tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts   # RED: 69 fail, 1 control passes
git apply /Users/zacheryspector/studio-scratch/1356-red/reference/1356-reference.patch
npx vitest run --project core tests/p15a2-power-ranking-archive.test.ts tests/p15a2-power-ranking-archive-isolation.test.ts   # expect 69 pass, 1 fail (the capture leaf)
npx vitest run --project core tests/p15a2-power-ranking-archive-harness.test.ts   # alone; long
git checkout -- src && git clean -fdq src
```

## Names the other REDs must share
`p15Sequence: {version: 1, next}`, `p15DomainSequence`, `phaseId`, `phaseOrdinal`, `phaseOrderVersion` (1355-F2). Fixed here: `src/core/p15Phases.ts` exports `P15_PHASE_TABLES` (`Record<number, readonly {phaseId, phaseOrdinal}[]>`, v1 = marketBatch, rankingRecord, condition, finale) and `P15_PHASE_ORDER_VERSION` (1); ordinal values are not pinned. Allocator refusals must match `/power ranking|p15/i`; a downgrade of a recorded quarter must say "cannot downgrade or discard a recorded Power Ranking quarter" (1356-A §5 verbatim). Sibling roots in the same step should resolve the step's functions from the live constant, as here.

## Not decided
1. Capture path `tests/fixtures/p15/genuine-below-p15-save-step/` (1344-P manifest shape); pin its sha256 in the leaf after minting.
2. `rank-step-final-facts` assumes a market signing in a quarter tick by week 221 (the 208 expiry wave); unmeasured.
3. Record shape is my reading of 1355-F2 items 2-5: ten keys, `id` plus `p15DomainSequence` plus the triple.
4. The harness run time; the reference is not swept against existing Save43 pins.
5. RED 10 uses `vi.mock` (with `importOriginal`) to remove the step; no other file in `tests/` mocks a module.
