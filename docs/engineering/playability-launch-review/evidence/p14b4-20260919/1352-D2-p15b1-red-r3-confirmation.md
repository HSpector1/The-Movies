<!-- 1352-D2: confirmation (contract-auditor, read-only) of 1352-C3, saved verbatim by the parent from the agent's final text -->

# Independent review 1352-D2

**Verdict: ACCEPT**

I read the r3 patch directly (not just the C3 handback's prose) and independently re-derived every changed value.

## Confirmations

**1. Both blocking defects from 1352-D are closed, with leaves that would actually fail against the described bugs.**

- `remedies-two-routes-stage-outside-warning-distress-excludes-loan` (`tests/p15b1-corporate-condition.test.ts` lines 1076–1094) calls `remedies()` with a new `conditionAt(stage)` fixture at both `'stable'` and `'recovery'`, against otherwise fully loan-eligible facts/capability (`wfc=10,000`, no outstanding loan, not founding, pending release, `terminableContracts=5`). I independently derived: `loanEligible('stable'|'recovery', ...)` is `false` by the stage gate alone, while `REDUCE_OBLIGATIONS` (`terminableContracts=5>0`) and `RELEASE` (`hasPendingRelease=true`) are correctly not stage-gated per 1352-A §4.3 — expected result `['REDUCE_OBLIGATIONS','RELEASE']` for both stages, exactly what the leaf asserts. Traced the failure mode by hand: an implementation that calls `loanEligible` with a literal `'distress'` string instead of the passed `condition.stage` would, given these loan-eligible facts, incorrectly return `true` for both calls and produce `['LOAN','REDUCE_OBLIGATIONS','RELEASE']` — failing both the `not.toContain('LOAN')` and the exact-array assertions. Confirmed non-vacuous.
- `remedies-two-routes-founding-excludes-loan` (lines 1096–1107) reuses `distressCondition()` (genuine `stage:'distress'`) with `capability.founding:true` and otherwise-identical loan-eligible facts. I derived: `loanEligible('distress', 10_000, {hasOutstandingLoan:false, founding:true})` is `false` by the founding gate alone (1352-A §4.4), giving `['REDUCE_OBLIGATIONS','RELEASE']`. An implementation that never reads `capability.founding` would incorrectly include `LOAN`, failing this leaf. Confirmed non-vacuous.
- Cross-checked that no single-line shortcut satisfies both new leaves plus the pre-existing ones: "always exclude LOAN" passes these two but fails `remedies-two-routes-pending-release-and-staff-and-no-loan-gives-at-least-two`, `-fixed-order-skips-ineligible-middle-family`, and `-rival-shaped-capability-does-not-over-count` (all of which require `LOAN` present under their own fixtures). The seven-leaf `remedies-two-routes` block collectively rules out ignoring stage, ignoring founding, always-include, and always-exclude. Both blocking defects are closed.

**2. Chained first-evaluation values are correct.** The extended `condition-first-evaluation-negative-cash` leaf (lines 216–253) now feeds its week-1 result (`lowRun=1, negativeRun=1, clearRun=0, distressWeeks=0, stage='stable'`) through `runFrom(stepCondition, next, [{cash:-500}], 2)`. I recomputed week 2 independently: `wfc=1000` (default) → `low=true, negative=true`; `lowRun=1+1=2`, `negativeRun=1+1=2`, `clearRun=0` (low resets it), `distressWeeks=0` (`prev.stage` was `'stable'`, not `distress`); transition check `from='stable'`: `lowRun≥4`? `2≥4` false → no transition. Matches the coordinator's stated values and the patch's assertions exactly.

**3. Nothing else changed, verified by content hash, not just by count.** `tests/p15b1-studio-loan.test.ts`'s diff blob hash in the r3 patch (`index 0000000..b2109ea`) is byte-identical to its hash in the r2 patch I read in the prior round — cryptographic confirmation the file is untouched, stronger than the "249 unchanged" line-count claim alone. `tests/p15b1-corporate-condition.test.ts`'s blob hash changed as expected (`32e1660`→`210caa6`, 1135→1202 lines), consistent with exactly the three disclosed edits (two new `it()` blocks, one extended leaf) and nothing more; leaf count moved 39→41 (not 42), matching "the chaining extends an existing leaf, not a new one." The original first-evaluation assertions (lines 227–235) are byte-identical to r2's.

The parent's independent dry run (`1352-X2-red-r3-run.txt`) reproduces 52/52 fail with the identical three RED-reason categories (50 module-load, 1 ENOENT, 1 TUNING mismatch) at a separately-applied HEAD, and both new leaves plus the extended leaf appear exactly once each in the failing-test list with the correct module-load reason — consistent with everything above.

## Next action

No remaining defects from this reviewer. Wave 1 RED (r3, 52 leaves) is ready to move to implementation against `src/core/corporateCondition.ts` and `src/core/studioLoan.ts`.

Files read for this confirmation: `docs/engineering/playability-launch-review/evidence/p14b4-20260919/1352-C3-p15b1-red-remedies-coverage.md`, `1352-stage/1352-p15b1-red-r3.patch` (targeted sections: the extended first-evaluation leaf, both new `remedies-two-routes` leaves, and the loan-file diff header/hash), `1352-X2-p15b1-red-r3-dry-run.md`, `1352-X2-red-r3-run.txt`.
