<!-- 1346-D2: focused re-review (contract-auditor, read-only) of 1346-C2, saved verbatim by the parent at HEAD 67f3c838 from the agent's final text -->

# Independent review 1346-D2

**Verdict: ACCEPT**

Scope read: `1346-D` (prior review), `1346-F` (parent response, including "After revision" section), `1346-C2` (revision account), `1346-stage/1346-p15a1-red-r2.patch` (full 958-line diff vs `ea65e796`, both test files read in full from the patch), `1346-stage/1346-p15a1-red-r2-classification.json` (32 rows), `1346-X2-red-run.txt` (dry run), and `1346-stage/1346-p15a1-red.patch` (r1, for the leaf-by-leaf diff). File-line numbers below are r2-patch-post-apply file lines, derived from the patch's own hunk offsets and cross-checked against `1346-C2`'s independently-cited `tsc` pins (`.test.ts(50,24)`, `-harness.test.ts(28,24)`), which matched my derivation exactly.

## Blocking defect 1 (stock term through assessBatch) — CLOSED

Four new leaves in `tests/p15a1-shared-market.test.ts`, describe block "stock term through assessBatch... (1346-D Blocking 1)":

- **`market-stock-term-through-assess-batch`** (line 412–641... it body ~412–446): exposures at ages 0/5/10 past R+4, no window-lane rival. I independently hand-computed `0.2·2^0 + 0.2·2^(-5/13) + 0.2·2^(-10/13) ≈ 0.2 + 0.15324 + 0.11738 ≈ 0.4706`, matching the leaf's own `stockWeight()` closed form (same formula, written independently of production). Asserts `windowTerm===0`, `stockTerm≈expectedStockTerm`, `pressure≈stockTerm`, `factor≈expectedFactor(stockTerm)`, `GENRE_SATURATION` present, `SAME_WEEK_RELEASES`/`WINDOW_RELEASES` absent. Matches the required fix exactly.
- **`market-stock-term-unclamped-same-studio`** (line 437–465): six same-studio stock exposures, ages 0–5. I recomputed the raw sum independently: ≈0.2+0.1896+0.1798+0.1704+0.1616+0.1532 ≈ **1.0546** — genuinely exceeds 1.0 (test also self-asserts `expectedStockTerm > 1.0`), so a hidden `min(sum,1.0)` clamp bug would fail this leaf's `toBeCloseTo(expectedStockTerm,9)` by ~0.05, well outside tolerance. Confirms unclamped behavior is actually exercised, not just asserted.
- **`market-window-releases-reason-code`** (line 467–479): one window-lane exposure (offset 1, weight 0.55), no same-week peer. Asserts `WINDOW_RELEASES` present, `SAME_WEEK_RELEASES`/`GENRE_SATURATION`/`STUDIO_CLAMPED` absent — correctly proves lane-specific code separation.
- **`market-reasons-capped-at-five`** (redesigned, line 559–602): honestly reports a premise correction (original leaf assumed one reason per source release; parent's Blocking-2 fix implies one reason per applicable code). Engineers a scenario hitting all four non-`NO_PRESSURE` codes simultaneously and asserts the exact code set, `length===4`, `NO_PRESSURE` absent. I traced the engineered inputs (same-week peer, one window exposure, two same-studio overflow exposures, one stock exposure) and the resulting pressure/code decomposition is internally consistent with the formula established by other leaves. Closes 1346-D's coverage gap on `WINDOW_RELEASES`/`GENRE_SATURATION` and retained-code assertion.

## Blocking defect 2 (nested `sourceReleaseIds` bound) — CLOSED

- **`market-large-batch-linear-storage`** (line 614–653), extended: original top-level structural checks preserved unchanged (verified byte-identical up through the ceiling check); a new loop (line 631–641) asserts `reason.sourceReleaseIds.length <= sourceLimit` for every reason at **both** 32- and 512-release sizes, reading the limit via `requireConst(market, 'MARKET_REASON_SOURCE_LIMIT')` rather than a hardcoded literal — so a production/constant mismatch would itself be caught.
- **`market-reason-source-limit-export`** (line 149–153): asserts `MARKET_REASON_SOURCE_LIMIT === 5` exactly (not a range check).
- **`market-reason-source-ids-ordering`** (line 486–524): six stock exposures in one genre, four distinct ages plus a genuine tie at the cutoff (`AAA-TIE`/`ZZZ-TIE`, both age 8). I verified the tie-break logic: both tied entries get identical `stockWeight(8)`, and `'AAA-TIE' < 'ZZZ-TIE'` lexically, so `AAA-TIE` is correctly the one the leaf expects kept. Asserts `sourceReleaseIds.length===5`, `GENRE_SATURATION.value` equals the hand-computed full sum over all six contributors (not just the five kept), and the kept set via `Set` equality (`{TOP1,TOP2,TOP3,TOP4,AAA-TIE}`), `ZZZ-TIE` absent.

**Finding (non-blocking, already disclosed and parent-accepted, not newly introduced by me):** despite the leaf's name, `market-reason-source-ids-ordering` asserts **selection membership only**, not array **order** (`new Set(...)` comparison, line 727–729). `1346-C2` itself flags this explicitly ("I did not assume [an order]... asserting an unstated order would risk a spurious RED-for-the-wrong-reason"). `1346-F`'s "After revision 1346-C2" section then *retroactively pins* an order ("largest contribution first, ties by ascending releaseId... binding on production") but explicitly notes "the C2 ordering leaf asserts set membership only" and does not request a further revision. Net effect: production now has a binding order requirement with **no RED/GREEN leaf that would catch a violation of it**. This is a real, currently-unenforced requirement, but since the parent saw and accepted this gap in the same document that created it, it is not a new defect from this revision — it is a disclosed deferred item worth carrying forward, not grounds for REFINE here.

## Check: no other leaf's expectation changed

Diffed every leaf body between `1346-stage/1346-p15a1-red.patch` (r1) and `1346-p15a1-red-r2.patch` (r2), text-by-text: `market-tuning-bounded-terms`, `market-definition-version-export`, all four `exposureWeight` leaves, all four `pressureFactor` leaves, all six `assessBatch symmetry` leaves (`one-player-one-rival`, `owner-swap`, `id-swap`, `order-reversal`, `same-week-batch`, `different-genre`), `market-studio-window-clamp`, `market-step-counter-basic`, all three `reduceExposures` leaves, both `assessment shape invariants` leaves, and `market-harness-normal-stream-bounded-active-set-and-determinism` are byte-identical between r1 and r2 (only header comments changed). The harness hostile-batch leaf's sole change is the declared `expect(steps.count).toBeGreaterThan(0)` insertion (harness file line 172), placed before the pre-existing upper-bound assertion — matches `1346-C2`'s own accounting exactly. No undisclosed drift found.

## Check: runtime evidence

`1346-X2-red-run.txt`: 32/32 fail, each individually attributed — 31 on the missing-module dynamic import (including all 5 new leaves, confirmed by name in the raw log, not collapsed into a collection error) and 1 (`market-tuning-bounded-terms`) on the same pre-existing genuine `TUNING` value mismatch as r1. No vacuous pass. Matches `1346-C2` and `1346-F`'s summary exactly.

## Not independently re-verified

No shell access in this role: the sha256 (`54704911…`) and the `git apply --check` dry-run against both `BASE` and `HEAD_NOW` claimed in `1346-C2` were not re-executed by me. The patch text itself is well-formed (correct hunk headers, line counts reconcile: 194+752=946 insertions + 12 header lines = 958, matching the claimed total), which is consistent with but not proof of a clean apply.

## Summary

Both blocking defects from `1346-D` are closed with concrete, non-vacuous, independently-recomputed evidence. No other leaf's expectations drifted. One narrow, already-disclosed-and-accepted gap remains (output order of `sourceReleaseIds` is now binding on production per `1346-F` but untested by any leaf) — worth tracking for a future tightening pass, not a blocker to this revision's acceptance.
