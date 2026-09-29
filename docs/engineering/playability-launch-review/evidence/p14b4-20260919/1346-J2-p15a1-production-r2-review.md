<!-- 1346-J2: independent delta review (contract-auditor, read-only) of 1346-E2, saved verbatim by the parent from the agent's final text -->

# Independent review 1346-J2 — P15A.1 Wave 1 production r2 (plain factor + contribution seam + one-reason-per-code test)

**Verdict: KEEP**

Delta reviewed: `1346-stage/1346-p15a1-production-v1-to-r2.diff` (169 lines, `src/core/sharedMarket.ts` only) and the full `1346-stage/1346-p15a1-production-r2.patch` (2 files, 414 insertions — confirmed `tuning.ts` hunk byte-identical to v1's), against RED r4 (`1346-stage/1346-p15a1-red-r4.patch`, 35 leaves, read in full), `1346-F3`, `1346-C4`, `1346-E2`, and `1346-X6`. Still unlanded — this is the same not-yet-applied `src/core/sharedMarket.ts` I confirmed absent from the tree in 1346-J. Line numbers below are the r2 patch's own new-file line numbers (patch tool-line − 6 for `sharedMarket.ts`; patch tool-line + 571 for `tuning.ts`, both re-derived the same way as in 1346-J and cross-checked against it).

## 1. Seam applied exactly once per release, on every path

MET WITH EVIDENCE. Read the full delta and traced every counting site:

- **Window-lane exposure fold** (`sharedMarket.ts:186-188`): `contribution = releaseContribution(exposure)` computed once, `source.weight = contribution * weight`, passed into `foldWindow(..., contribution)`.
- **Stock-lane exposure fold** (`sharedMarket.ts:190`): reuses the *same* `contribution` computed above the branch — `book.stockCounts[offset] += contribution`. Not a second, possibly-inconsistent call.
- **Same-week member fold** (`sharedMarket.ts:202-203`): `contribution = releaseContribution(asRelease(member, week))`, routed into both the reason-source weight and `foldWindow`'s 5th argument.
- **Self-exclusion** (`sharedMarket.ts:225-231`, `assessSubject`): recomputes `contribution = releaseContribution(asRelease(member, week))` and subtracts it from `ownCounts[0]` and `counts[0]` — the *same* `asRelease(member, week)` construction used at fold time, so the subtracted value is guaranteed identical to what was added, not merely equal by coincidence in v1.
- **Clamp bookkeeping** (`foldWindow`, `sharedMarket.ts:284-309`): `studio.counts[offset] += contribution`, `book.windowCounts[offset] += contribution`, `book.clampedCounts[offset] += contribution` (the `wasClamped` branch) all converted from bare `++`. The remaining `addCounts(book.clampedCounts, studio.counts, 1)` / `addCounts(clampedCounts, own.counts, -1)` calls correctly keep their `±1` **sign** argument (they transfer an already-contribution-weighted vector wholesale; that `1`/`-1` was never a per-release increment and needed no change).

I hand-traced every one of the six former `++`/`--` sites in the diff; all six now route through `contribution`. No bare literal survives. Self-exclusion exactness is by construction (both the fold-time and subtract-time `contribution` come from `releaseContribution(asRelease(member, week))` called on the *same* `member` object reference and the *same* `week` in scope), not merely because v1's `releaseContribution` ignores its argument — this is sound forward design, and the writer's own disclosed caveat (non-integer future contributions need a fresh exactness review) is honest and correctly scoped, not a current defect.

**Corroboration beyond the diff read:** the writer's own defect-injection probe (`1346-E2`, "the seam is load-bearing on every path") — return 2 instead of 1 and watch `stockTerm`, `SAME_WEEK_RELEASES`, `WINDOW_RELEASES`, `windowTerm` and `STUDIO_CLAMPED` all double or shift — is consistent with the code path I traced, and 8 of 35 leaves failing under that injection is the right order of magnitude for a change touching every weight computation. This probe is self-reported (not independently reproduced by me or by the parent), so it is corroborating, not primary, evidence.

## 2. Plain factor and the loosened bound

MET WITH EVIDENCE. `pressureFactor` (`sharedMarket.ts:109-115`) is now exactly `1 − 0.25·(1 − e^(−P/2))`, verbatim D-1323-1 text, with `nextDoubleAbove` fully removed. This is a strict improvement over v1 reviewed in 1346-J (no manufactured epsilon).

I independently hand-computed (not trusting the writer's `node -e` table alone):
- `f(20) = 1 − 0.25·(1 − e^{-10})`. `e^{-10} ≈ 4.53999·10⁻⁵`. `0.25·(1 − 4.53999e-5) = 0.2499886...`. `f(20) ≈ 0.7500113...` — matches the writer's probe (`0.7500113499824406`) to displayed precision. Margin above 0.75 is ≈1.13e-5, roughly five orders of magnitude above float64's ULP near 0.75 (≈1.11e-16) — a genuine, non-flaky margin, not a coincidental near-zero pass.
- `f(72) = 1 − 0.25·(1 − e^{-36})`. `e^{-36} ≈ 2.32·10⁻¹⁶`, so the true value exceeds 0.75 by only ≈5.8·10⁻¹⁷ — under half a ULP at that magnitude (≈5.55·10⁻¹⁷) — so correct IEEE-754 rounding legitimately lands on exactly `0.75`. This confirms the writer's characterization is sound, not a hand-wave.
- Mathematically, `f'(P) = -(maxPenalty/scale)·e^{-P/scale} < 0` for all finite `P`, so `f` is strictly decreasing analytically; only float64 rounding flattens it past `P ≈ 72`. The test's `toBeLessThanOrEqual` (non-strict) monotonicity grid is therefore the *correct* assertion shape — strict decrease would be false past the plateau, and the grid deliberately straddles `P = 50/72` to exercise both regimes.
- `f(P) ≥ 0.75` for *every* finite `P` is a mathematical certainty (the exact value is always `> 0.75`; rounding can only land on `0.75` itself or a value above it, never below, since `0.75` is exactly representable), so `toBeGreaterThanOrEqual(0.75)` at `P = 1000` is a zero-risk, permanently-true assertion, not a weakened tautology masking a real requirement.

This is a real bound at every tested point, not vacuous.

## 3. New/revised leaves are non-vacuous

MET WITH EVIDENCE.
- `market-release-contribution-seam` (r4 tests: `tests/p15a1-shared-market.test.ts:385-407`): fails pre-patch (`RED: ... does not export a function named 'releaseContribution'`, confirmed in `1346-C4`'s RED run and independently in `1346-E2`'s "on `c537b4c` [v1] the r4 suite gave 34 pass and 1 fail" — the seam leaf, reproducing `1346-X5`). Post-patch it calls a real exported function across all six catalogue genres. Non-vacuous by construction and by the writer's own injected-defect probe (§1 above).
- `market-factor-bounds-and-monotonicity` (revised): asserts real numeric inequalities with genuine margins (verified independently in §2), not tautologies.
- `market-same-week-two-studios-one-reason` (`tests/p15a1-shared-market.test.ts:765-797`): I hand-traced this against the r2 source — canonical member order `PEER-ALPHA, PEER-ZULU, SUBJ6`; both peers fold into distinct studios at `count[0]=1` each (neither exceeds the cap alone); self-exclusion removes `SUBJ6`'s own contribution, leaving `counts[0]=2`; `windowTerm = laneSum([2,0,0,0]) = 2.0`; exactly one `SAME_WEEK_RELEASES` reason is pushed with `value = 2.0` and `sourceReleaseIds = ['PEER-ALPHA','PEER-ZULU']` (both tied at weight 1.0, ascending-id tie-break — the deliberately-unsorted `zulu-then-alpha` input order proves the sort is real). My hand-trace matches the test's assertions exactly, and matches the parent's independently-run GREEN result (`1346-runs/1346-X6-red-r4-over-production-r2.txt`: 35/35, including this leaf). This would fail under the r1-era "one reason per contributing studio" model (which would emit two `SAME_WEEK_RELEASES` entries), so it genuinely discriminates the two models — closing the gap I raised as non-blocking note 2 in `1346-J`.

## 4. Nothing else changed

MET WITH EVIDENCE. Read the full 169-line delta and the full r2 patch: only `src/core/sharedMarket.ts` changes; the `tuning.ts` hunk (`tuning.ts:988-999`, same 7 keys, same provisional-tuning comment) is byte-for-byte identical to what I reviewed in `1346-J`. No other function, the reason model, the digest, or validation logic changed (confirmed both by reading the diff hunks and by cross-checking against my own `1346-J` citations of `foldWindow`, `assessBatch`, `reduceExposures`, `requireRelease`, etc. — all unchanged apart from the six contribution-routing edits and the two named changes). `1346-E2`'s `git diff --stat` claim (empty diff on `src/tests/ui/bridge/generated/scripts` between the real-repo HEADs bracketing this revision) and `1346-X6`'s independent 35/35 run corroborate no drift.

## 5. The stale TUNING comment — must change before landing

**Yes.** `src/core/tuning.ts:997`:
```
SHARED_MARKET_FACTOR_MAX_PENALTY: 0.25, // f(P) = 1 − 0.25·(1 − e^(−P/2)): bounded in (0.75, 1]
```
This is now factually inconsistent with the accepted, tested behavior: `market-factor-bounds-and-monotonicity` (`tests/p15a1-shared-market.test.ts:495-497`, r4) explicitly asserts `pressureFactor(1000) >= 0.75` — i.e., the tested and accepted range is the **closed** `[0.75, 1]` in float64, not the open `(0.75, 1]` the comment still states. The project's own convention, quoted in the task and consistent with CLAUDE.md's bounded-term rule, is that a bounded term's stated range and its asserted test range agree — leaving this uncorrected is exactly the kind of "silently filled gap... a gap nobody can find later" CLAUDE.md warns against, sitting directly beside a TUNING key whose provisional-tuning comment is the authoritative source-of-record cited by D-1323-1/1340-O for the Wave 4 KEEP/REVISE/REJECT playtest. The fix is one line, zero-risk, and the writer already drafted acceptable wording as "optional" — I am making it required. `sharedMarket.ts:109` already carries the correct, matching language ("f(0) = 1 exactly; float64 rounds it to exactly 0.75 past P ≈ 72"); the TUNING comment should say the same thing.

## Blocking defects

1. **`src/core/tuning.ts:997`** (r2 patch line numbering) — the `SHARED_MARKET_FACTOR_MAX_PENALTY` comment still reads "bounded in (0.75, 1]", contradicting the now-accepted, tested `[0.75, 1]` float64 range. **Required change:** reword to match `sharedMarket.ts:109`'s language, e.g. `// f(P) = 1 − 0.25·(1 − e^(−P/2)): bounded in (0.75, 1] exactly; float64 rounds to exactly 0.75 past P ≈ 72 (sharedMarket.ts)`. Trivial, documentation-only, does not require re-running any test or type gate.

No other blocking defects. Everything else in this delta — the seam's exactness on every path, the plain-formula correctness, the loosened bound's genuineness, and the new leaves' non-vacuousness — is MET WITH EVIDENCE by direct code trace, independent hand-computation, and the parent's own reproduced 35/35 run log.

## Non-blocking notes

- F2 (`STUDIO_CLAMPED.value`) and F3 (no index export) remain correctly deferred/unchanged per `1346-F3`; no new concerns.
- The writer's bit-level permutation-invariance claim and the re-run naive-reference cross-check (`1346-E2`) remain self-reported probes, not independently reproduced — same NOT VERIFIED status as in `1346-J`, informational only.
- The reach-scaling-seam gap I flagged in `1346-J` is now closed (`releaseContribution`, `sharedMarket.ts:79-82`), and the F5 one-reason-per-code test gap I flagged is now closed (`market-same-week-two-studios-one-reason`). Both of my prior non-blocking notes are resolved by this revision.

## Next action

Land RED r4 (`1346-stage/1346-p15a1-red-r4.patch`) and `1346-stage/1346-p15a1-production-r2.patch` as separate commits via the index, after applying the one required `tuning.ts:997` comment fix (can be folded into the production-r2 commit before landing, or as a one-line follow-up commit — either is fine, it does not require re-running vitest/tsc since it touches only a comment). Per 1340-O, live-economy integration continues to wait for the rival-shelving verification.

Relevant paths (absolute):
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-production-v1-to-r2.diff`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-production-r2.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-stage/1346-p15a1-red-r4.patch`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-F3-parent-response-to-1346-J.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-C4-p15a1-red-floor-seam-percode.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-E2-p15a1-production-revision.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-X6-production-r2-dry-run.md`
- `/Users/zacheryspector/The-Movies-headless-program/docs/engineering/playability-launch-review/evidence/p14b4-20260919/1346-runs/1346-X6-red-r4-over-production-r2.txt`
