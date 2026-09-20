# 382 — Exact fixed-arity calculators

2026-09-20. Native sim-core. SOURCE FROZEN; sole production write ownership
yielded. Implemented EXACT adopted380 against published/exact-remote base
`7e0d1b3c607c22e73a9d987e60f6a76468699b92`.

Only `src/core/promiseCapacityOwnerReplay.ts` and this handback were written.
No runtime, tests, probes, typechecks, Git, network or delegation were run.

Source SHA-256 before:
`4166ea6a00b23741bf0e9f4c945520d80d2834a53d400a1133bc23002a8aa6e1`.
Source SHA-256 after:
`8941e0d2ecd68fd3914891f662d11a37e10bb72103d6d22ef92ced9f2f9817a8`.

## Four exact production hunks

1. Fixed module constant `EQUALITY_SATURATION_LENGTH = (CEILING - 1) / 2`.
2. Work.equality's exact20-prepaid threshold expression from380.
3. Work.keyBill's exact uniform64-prepaid two-guard body from380, with STRICT
   greater-than in the division guard and NO separate zero-count branch.
4. sortBill's two prepaid locals and final-term fold from380. The n<2 arm,
   level/run loop, surrounding22 payment and other return terms are unchanged.

All caller `calc` payments remain. Work.add/times/plus/keySpanBill and their
primitive prices are unchanged, as are all actual owners, owner-bill formulas,
dimensions367, reconciliation354, tests, validators, public versions and caps.
No extra helper, cache, public export or special fixture path was added.

## Returned-reserve proof

Write S(x)=min(200001,x) for nonnegative values. These private callers supply
admitted nonnegative integer counts/lengths, including capped derived values.
No new promise is made for negative, fractional or NaN private-helper inputs.

Equality's old S(1+S(2L)) equals S(1+2L). At L>=100000 the adopted threshold
returns200001; below it the executed multiplication/addition remain bounded.
The threshold is fixed module initialization, not input-dependent discovery.

KeyBill's old nonnegative saturated expression equals S(1+L+N*(1+2L)). When
L>=200001 the result necessarily saturates, even for N=0. Otherwise base=1+L
is at most200001 and unit=1+2L is at most400001, both exact safe integers.
The guard N>floor((200001-base)/unit) returns the ceiling before any potentially
large product. On the false branch N*unit<=200001-base, so the executed product
and final sum are safe and equal the old result. N=0 and exact-ceiling equality
remain valid without an extra branch. The bounded numerator/denominator also
keep floor's quotient far enough from an adjacent integer to avoid a changed
integer threshold through floating rounding; an exact integer quotient is
itself exactly representable at these magnitudes.

For sortBill's n>=2 arm, let M=S(n*levels) and c be the existing nonnegative
comparator price. The old two terms S(5M) and S((8+c)M), under the surrounding
saturated sum, equal S(S(13+c)*M). Nonnegative saturation permits this fold,
including a capped M or coefficient; M>0 in this arm. The rest of the sort's
owner reserve, including run/level terms and comparator meaning, is unchanged.

## Exact payment/source inventory

| Replacement | BEFORE-execution payment and source inventory |
| --- | --- |
| equality |20 before the threshold expression. At most10 nodes: threshold reads/comparison/dispatch4; unsaturated constant/operand reads, multiply, add and return6. Existing two-units-per-node convention. |
| keyBill |Uniform64 before ANY body branch. Longest path31 nodes: initial guard4, base binding4, unit binding6, second guard11 including Math/floor access and call, bounded product/sum return6. No uncharged zero-count shortcut. |
| sort local bindings |4 before both new local bindings. |
| sort M |Existing `work.calc(8).times(n, levels)`: receiver8 plus unchanged times10, before calculation. |
| sort coefficient |Existing `work.calc(8).add(13, comparator)`: receiver8 plus unchanged add8, before calculation. |
| sort final term |Existing `work.calc(32).times(coefficient, merges)`: receiver32 plus unchanged times10. |
| sort surrounding calculation |Original22 source block and `work.calc(64).plus` retained, now summing five terms instead of six. All other three product trees remain. |

Old equality's internal tree was4+8+8+10+8=38; new20 removes18 executed
calculator units per call. Old keyBill's internal tree was112, including its
nested equality; new64 removes48. Do not count that removed nested equality
again as a separate saving. Caller argument payments are additional and unchanged.

For n>=2, the old sort's post-loop22+return tree cost320. The exact replacement
costs4+18+16+22+212=272, a48-unit calculator difference. The loop, n<2 arm and
all caller/comparator payments remain additional and unchanged. keySpanBill
remains46/internal. These are paper source-expression counts, not measurements
of invocation totals, CPU time or aggregate replay savings.

The shared allowance still prepays the complete returned owner reserve before
each owner executes. No price for still-executed owner work was reduced, no
previous charge refunded and no allowance reset. Only calculator execution
changed. A work cut may consequently occur at a different genuine paid boundary.

## Verification and limits

Static inspection compared the actual helper spellings and sort construction
against full380, including the threshold, inclusive/strict guards, arithmetic
order, zero-count behavior, prepayment placement and unchanged surrounding
helpers. Hashing returned complete hashes with the existing host locale warning.
No executable verification was performed by this writer.

380 records the parent's independent finite BigInt hypothesis oracle results;
those are not a production run, actual-source accounting review or all-input
test coverage. Sort remains supported by the separate nonnegative algebra proof,
not that oracle. Parent383 review and serial384–391 checks must establish actual
source correspondence and regressions on this frozen candidate.

378 still required at least16857 additional units at its wrap-payment boundary,
plus later drain/output/kernel work. No assertion is made that these changes
cover that gap. Preserve and attribute every remaining failure. This handback
is not an inherited whole-owner accounting proof, completeness theorem or
Ready/B4/native acceptance.

SOURCE FROZEN. Production write ownership is yielded.
