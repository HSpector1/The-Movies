# 168 — Bounded shared-sort source handback

2026-09-20. Native sim-core. **SOURCE FROZEN.** Implemented the explicitly
released three-file prerequisite on published base
`f290536336dd726a15a177c5e36f71b0fcec3cd0` under 157 §§1–3, independent159 KEEP,
165 test KEEP and qualified actual RED166. Read both complete frozen installed
test files before implementation. No test bytes or contract requirements changed.

## Exact source scope and SHA256

| File | SHA256 |
| --- | --- |
| `src/core/boundedStableSort.ts` | `87861f3ceefe2b2a9163a34bd9762a991d5c8a7f1640b84fbe6d1133f33ff964` |
| `src/core/operations.ts` | `9935b09495df1d11f39bf3b1a37b244c3d7bf7d0994cd4c8ce286571b3be3411` |
| `src/core/releaseAuthority.ts` | `9ab259623d3b5f5f75f1d750168e68ccb5c14d27d96f06f4656985db8064b218` |

Only the new helper, operations import plus allocator ordering/sweep ordering,
and release-authority import plus commitment ordering changed. This handback
is the only documentation written in this implementation release. The existing
kernel/private helper, all other source, tests, fixtures, validators, generated
contracts, versions and index exports were left untouched. No 162/replay work
was bundled into this patch.

## Algorithm and source proof

`boundedStableSortCost` rejects noninteger, negative or above-native-array lengths
with RangeError. Zero (including numeric negative zero) returns literal zero
bounds. The size-only query doubles width numerically for at most32 steps and
allocates no size-proportional collection. Its products remain safe throughout
the accepted domain:

```text
L = ceil(log2(max(1,n)))
maxComparisons = n*L
maxElementWrites = n*(L+1)
```

`boundedStableSort` initially shallow-copies the input using `slice`. Empty and
singleton inputs return that fresh copy, invoking no comparator. Other inputs
use one auxiliary array and bottom-up merges with explicit left/right tails.
Every pass writes exactly n destination slots, including unpaired tails. Every
head comparison consumes one head, hence no more than n comparisons in a pass.
Exactly L passes plus the initial n copies establish the declared bounds. The
final source is returned directly, without a trailing element copy. All input
objects, repeated references and nested values retain their identities.

The final comparator result chooses the left head for negative, zero/signed-zero
or NaN; positive/positive-infinity chooses the right. This makes genuine ties
stable. Width and run offsets use arithmetic, never overflowing 32-bit shifts.
There is no native sort, recursion, cross-call cache, record cast or dependency
on the capacity kernel. Non-null index assertions are justified by the explicit
run boundaries; they do not cast a partial record into a fuller owner type.

The bounds concern comparator calls and explicit reference writes. They are
not comparator-body, native allocation, machine-instruction or wall-clock bounds.
The documented dense ordinary-array/lawful-comparator domain remains in force;
arbitrary malformed inconsistent-comparator native permutations are not promised.

## Three call-site preservation checks (static, not runtime results)

- **Allocator:** the original facility spread and policy filter run before the
  shared sort, in original input order. `compareId` is unchanged. No change to
  sticky retention, slot search, stage/Set composition, or Set state-order filter.
- **Sweep order:** each input is decorated exactly once with the original object,
  unchanged `productionWaitWeeks`, and unchanged `productionOrdinalKey`. The
  comparator retains wait precedence and the original numeric subtraction /
  `||` / lexical sequence. In particular ordinal Infinity-minus-Infinity still
  falls through; NaN normalization is applied only by the sort to the final
  comparator result. Undecoration returns each original full generic P reference.
  Regex, Number conversion, fallback values, leading zeros and ID bytes are intact.
- **Release append:** the same row is minted into the same appended input array;
  the same ascending productionId comparator now uses the shared helper. Existing
  row identities, stable duplicate-key order and canonical output are preserved
  by construction. No change to refusal/admission or commitment identity.

## Verification actually performed and remaining limits

Reviewed the complete applied patch hunks, complete new helper and all modified
function bodies, including the untouched wait/ordinal helpers. Read-only SHA256
and whitespace scans completed; no trailing whitespace found in the three files.
No tests, typechecks, runtime probes, generators, Git, network or descendants ran.
No passing implementation check is claimed by this handback.

Parent now owns serialized independent helper/new-owner/original-owner checks,
strict root/UI and bridge typing, independent source review, and qualified
publication. The actual prior RED was missing-module collection failure with
zero reached helper bodies; the new candidate must still execute those bodies.
Exactly-once key preparation and element-write bounds also require source review,
not merely passing comparison-count tests.

Whole replay work composition remains OPEN. This implementation neither restores
137's withdrawn67,904 estimate nor authorizes/certifies an owner replay producer.
Source write ownership is yielded at this handback; no further edits pending
parent verification and explicit release.
