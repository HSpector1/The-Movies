<!-- 1355-D2: confirmation review (contract-auditor, read-only) of 1355-C2 r2 -->

# 1355-D2: confirmation of the P15A.1 Wave 2 RED r2 (1355-C2)

**Verdict: NOT CONFIRMED.** One fix to R4, and one handback claim to scope.

Read at HEAD cca0a8eb (`src` tree db80ca31). I ran no test, node, tsc or script. The r2 patch equals `git diff 4d09e80 main` and passes `git apply --check`. `ref2` is 1356-C reference r2 (e0ecf75) plus 1355-reference-r2.patch. T, A, Ph: main, atomicity and phases test files on `main`; P: producer r2; R: `ref2:src/core/marketIntegration.ts`.

| F4 item | Status |
|---|---|
| R1, cross-root leaf | APPLIED (T:656-679) |
| R2, pins, guard, landing statement, downgrade re-pin | APPLIED; statement overstated (fix 2) |
| R3, first subject returned | APPLIED (A:52-68, :79-87, :118, :132) |
| R4, v2-declared row | APPLIED DIFFERENTLY, not sound (fix 1) |
| Also: K3 baseline, RED 16 premise and sha pin, seams, skip note | APPLIED |

**R1 cannot pass vacuously.** With no sibling rows, `top(siblings)` is 0, the scan stops at week 160 and the premise at T:667 fails. The ranking record follows the tick's market append (ref2 tick.ts:1131, :1177), so a sibling holds the top within 13 weeks. Case (a) fails a validator that checks `next` against market rows only. Case (b) keeps ascent (distinct sequences put the edited row's predecessor below the reused value), so only a cross-root check refuses it.

**p15-roots.ts** equals 1356-C r2's `main` file except line 10, where `P15_ROOTS` adds `'sharedMarket'`.

**The downgrade leaf stays neutral.** T:88 and T:786-795 are unchanged: the leaf needs the market wording only, never the ranking wording or an order. R's single refusal naming every non-empty root is one valid choice; the classification marks the leaf `repinAtSiblingLanding`.

**R3** fails a writer who rejects 0.5 at step 2.5: no reception throws, so A:82 fails.

## Fixes

1. **Ph:29-32 supplies the logic under test.** The mock replaces `p15PhaseMatches` with its own per-version lookup. R:163 delegates each row to that helper, so a production whose `p15PhaseMatches` pins rows to the live version still passes Ph:65, because the mock's helper answers in its place. While only v1 exists, no test can tell the real helper's two readings apart. Drop the override, as F4's ruling reads ("`importOriginal` plus one added version-2 table"). Declare the seam: the market validator looks up the exported `P15_PHASE_TABLES` at each row's own `phaseOrderVersion`. Change R:163 to that lookup. A live-pinned validator then fails Ph:65 wherever the pin sits.
2. **C2:6 says the RED holds at separate save steps.** The pins do. The shared capture does not: at separate steps the directory holds a capture below the archive's step, so P refuses both to mint (P:60) and to skip (P:107), and T:726 expects `MARKET_STEP - 1`. Scope the claim to one shared step, or key RED 16's capture by step.

## Note

T:761 needs the paired picture assessed within 26 weeks; P:97 checks only the estimate. P should tick 26 weeks before writing: nobody can re-mint after the writer moves.
