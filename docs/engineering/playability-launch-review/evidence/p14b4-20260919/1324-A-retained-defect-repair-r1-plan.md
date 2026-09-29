# 1324-A: retained-defect repair R1 — clusters C6, C7 and C20

P15A.1 waits on the Owner formula decision D-1323-1 (1323-F); P16-P18 wait on P15 and upstream producers. The
authorized work that remains closes demonstrated defects: the 151 core failures retained at 1316/1321. This plan takes
the three clusters with a single recorded cause each, 57 rows, all test-side (rows and primaries in
[1321-I-failures.json](1321-I-failures.json); causes first recorded by [1302-I](1302-I-failures.json)).

| Cluster | Rows | Where | Recorded cause |
| --- | --- | --- | --- |
| C6 `v13TwinOf` carrier premise | 25 | `tests/v14-migration.contract.test.ts` via `tests/contracts/_v14Contract.ts` `v13TwinOf` | the twin builder strips later roots from a live carrier to make a genuine V13 twin, but not the roots added since it was written (`firstTakeSubjects` at V40, and any later ones), so the C2a-M1 boundary assertion is masked ("a GENUINE V13 save — one carrying no `bindings` leaf …") |
| C7 `firstTakeSubjects` guard | 23 | `tests/p14c1-materialized-aging.test.ts` (12), `tests/p14b5-t-failure-tuning.test.ts` (11) | fixtures advance a state without the Save40 `firstTakeSubjects` root, so `appendFirstTakes` refuses ("promises: migrate to Save40 before recording a first take", `src/core/promises.ts`), and four rows reach "first take subject: missing issuing owner or concept" (`src/core/firstTakeSubjects.ts`) |
| C20 migration purity | 9 | `tests/p14c3-save-v38.test.ts` (5), `tests/bridge-p14c2rm-runtime.test.ts` (2), `tests/bridge-p14c3-promise-digest-continuity.test.ts` (1), `tests/p14p3-directing-promises.test.ts` D14 (1) | a migrated genuine old input is compared with the old state plus the roots known when the test was written; the V40 `firstTakeSubjects`, V41 `termination` and V42 `sharedCompetitions` roots are missing from the expectation (1320-C unresolved items 1-3) |

Rules:

1. Tests only; no production, fixture payload or config change.
2. Each repair restores the leaf's own premise to current law, with the cause measured and cited (source line or the
   received value). Expected new roots are built from the old state by the migration's own rule, never literals
   (`withRivalTermination`/`withSharedCompetitions` precedent; `firstTakeSubjects` from `convertV39ToV40`'s rule).
3. No assertion is weakened, removed or skipped. If a leaf's stated premise cannot be reached lawfully, the author
   stops on that leaf and reports the measured facts.
4. `p14c3-save-v38.test.ts:85` compares a V38 conversion with the live migration; if its purpose cannot survive every
   later save version, the author reports it with the leaf's title and history rather than rewriting its meaning.
5. A leaf that passes after the repair must pass for its stated reason; the author names the assertion that now runs.

Deliverables: `1324-stage/1324-retained-r1.patch` (cumulative against HEAD), a classification JSON (one row per
edit: file, line, old, new, cluster, cause) and a handback; checked with a temporary index. Then the parent's scratch
dry run (type gates, the touched files, full core), independent review, application and the recorded gates.
