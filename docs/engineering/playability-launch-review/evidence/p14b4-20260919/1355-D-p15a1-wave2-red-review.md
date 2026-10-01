<!-- 1355-D: independent RED review (contract-auditor, read-only) of 1355-C, written by the reviewer -->

# 1355-D: review of the P15A.1 Wave 2 RED (1355-C)

**Verdict: REFINE.** Four small changes. Coverage, RED reasons, save-version lookup, determinism and the reference hold.

Read at HEAD 22329b71 (`src` tree db80ca31, the base's). I ran no test, node, tsc or script. Both patches equal the scratch diffs and staged copies and pass `git apply --check` (sha256 512f9e6b…, 3fdbfd1b…; producer 303563f1…). T, A, H, P: main test, atomicity test, route helper, producer (branch `main`); R: `ref:src/core/marketIntegration.ts`.

## Required changes

**R1. No leaf tests cross-root validation (1355-F2:43-45).** All 22 refusals forge `sharedMarket` rows (T:560-620). A validator that checks `next` and distinctness against market rows alone passes them: the stale-`next` forgery (T:614-616) sets `next` to the market maximum, which that validator also refuses. The test belongs where two row-bearing P15 roots first coexist (the shared step or the second landing). Add a RED 14 leaf driven by `P15_ROOTS` (1356-F2:18-20) on a state just after a quarter tick (`rivalRouteAt(66)`): (a) it validates while a ranking record holds the largest sequence; (b) a market row given a ranking record's sequence, ascent kept, refuses by name. Until a sibling exists, list it with the 1356-F2 R3 re-pins in header and handback. R:193-196 reads `powerRanking.snapshots` by name.

**R2. Two sibling gaps (1356-F2 R3).**
- The pins assume no P15 root below the step: P:58-61 refuses when `p15Sequence` or `powerRanking` exists, P:70, :72, :80 keep every other key, and `withoutP15Roots` drops two keys (T:213-216). If the archive lands first at its own step, nobody can mint the pins; forced pins would compare ranking records whose sequences and `power-ranking-<seq>` ids (1355-F2:47-48) shift under the market batch. The shared capture fails too (P:56, :115). Declare the one-shared-step assumption for the parent, or strip every `P15_ROOTS` key and guard on `sharedMarket` alone.
- The downgrade leaf (T:730-739) uses rival week 70, which holds ranking records in a shared step. Whichever refusal fires first fails either T:70 or 1356-C's `rank-root-downgrade-recorded-quarter-refuses`. Declare it re-pinned at the merge, or require one refusal naming every non-empty root.

**R3. The two-subject leaves never show the first subject succeeded (1355-F3:11-17).** A:67-90 force 0.5 and expect `/factor/`. A writer who bounds-checks `factorById` at step 2.5 throws before any reception and passes both, leaving the partial-write point untested. Add a pass-through `vi.mock` of `reception.js` logging each `competitionFactor` that returns; assert `pressureFactor(1)` returned before the 0.5 call threw.

**R4. The phase leaf cannot see reinterpretation (1355-B2:14; T:813-840).** The live version stays 1 and no v2-declared row is checked, so a validator pinning every row to `P15_PHASE_ORDER_VERSION` passes, then refuses every v1 row after a real upgrade. Add a row declared under v2 with v2's ordinal that must validate. The leaf also needs `P15_PHASE_TABLES` extensible (T:820), a constraint on 1356-C's module; the parent should rule.

## Checklist

1. **Coverage.** §7 items 1-18, F3 Blockings 1-2 and the RED 12/14 extensions map as the handback states. Amendment 3 is the two fixture-pending RED 16 leaves. K3-K5 have no leaf or pin; 1355-A:264 has the RED mint K1-K3 pins, so name G2's rerun at the RED commit as K3's baseline. No leaf asserts `p15Sequence` creation; 1356-C owns it.
2. **RED reasons.** Each RED leaf first reaches the missing root (H:46-52), `p15Phases.ts` (T:87-98), seam or witness; reception.ts:678, :761 report `competitionFactor` 1. Controls pass: T:140 because the extra field and argument are ignored, T:223 and :232 compare a state with itself until the root exists (T:203), T:644 matches tuning.ts:1010-1016. Fixture-pending leaves throw FIXTURE PENDING (T:107-116, :670-675); minted RED 16 then fails on version until the step lands.
3. **Premises.** Against sharedMarket.ts:139-271, RED 6-8, K1 and K2 expectations are bit-exact and `pressured` (H:125-129) mirrors P > 0. A cancel removes the picture (actions.ts:596-614); holds never expire (releaseAuthority.ts:5). Route premises are unmeasured but throw. RED 16 leaf 2 asserts only `observed > 0` (T:716); its ramp premise lives in P:87-99. Assert it in the leaf and pin the capture sha after minting.
4. **Siblings.** R1, R2. Otherwise sound: allocation is `next + i` with `>=` (T:482-484); fixtures re-derive `next` by deep scan (H:75-84, :359, :370).
5. **vi.mock.** Sound and isolated: hoisted control, `beforeEach` reset, `importOriginal` pass-through, per-file isolation (vitest.workspace.ts:14-38). It requires production to call `assessBatch` through the export from outside `sharedMarket.ts`; declare that.
6. **Producer.** Mints only the six leaves' inputs into the two stated directories with `wx` (P:41, :126-150); HEAD pin and probe refuse a wrong tree (P:49-61). Mint/skip fails closed and its MANIFEST matches 1356-C r2's reader, but skip cannot add an input when another record's capture lacks RED 16's premise, and checks only the gzip sha.
7. **Determinism.** `canon` and JSON-normalized `diffPaths` (1344-X6); `toEqual` only on primitive arrays and the triple; seeded streams; `Date.now` only as P metadata; no version literal (T:57).
8. **Reference.** Minimal; by reading, the 52 non-fixture-pending leaves pass. All forty migrators carry the V44 branch.
9. **Cross-root.** R1.

## Minor
- K1's allowlist (H:422-450) first runs at GREEN; `control.all = 1` in A gives an in-process control the reference run could test it against. `studio.cash` and `studio.standing` pass even when no player release is pressured.
- R's `p15Phases.ts` differs from 1356-C's in two comment lines.
