# 380 — Independent scalar algebra hypothesis oracle

2026-09-20. Native test-author. Authored only this brief and the assigned
standalone script. No production/test changes, implementation inspection,
runtime/probe/typecheck, Git operation, network or delegation.

## Frozen artifact and intended execution

`380-scalar-algebra-oracle.mjs`, 134 lines.
SHA256 `8b9b49c184ce25f211056cfcc342d580c88cd55734acc498cdf82dfcd280f552`.

Parent-only execution from the repository root:

```sh
node docs/engineering/playability-launch-review/evidence/p14b4-20260919/380-scalar-algebra-oracle.mjs
```

UNEXECUTED at handback. No PASS, exit code, elapsed time or observed case-count
claim is made here. The script emits one JSON summary only after all assertions,
with exact per-group counts and total candidate comparisons. Its first mismatch
throws with N/L, exact expected result and candidate result; no skip/retry loop.

## Independent expectations and bounded sweep

Ceiling C=200001. The reference evaluates these original nested expressions with
BigInt, including exact products before saturation:

- Equality: min(C, 1 + min(C, 2L)).
- Key bill: min(C, 1 + L + min(C, N × min(C, 1 + 2L))).

The separately named hypothetical Number functions implement exactly the two
candidate formulas supplied in the task. They do not call the reference or any
production helper. Nonnegative safe integer input/output domains are asserted.

The deterministic sweep visits every L from0 throughC+1 inclusive. Each L gets
an equality comparison and N=0/1/2 plus the nonnegative exact-division threshold
minus1/at/plus1, deduplicated per L. Threshold generation uses BigInt division,
not the Number candidate. There are at most six N values per L. A separate
18-value edge set covers equality cutoff, C and adjacent values, 2C,
2^52±1, and MAX_SAFE_INTEGER with its two preceding integers; its complete
N×L cross-product and each equality edge are checked. Memory does not accumulate
the sweep or allocate giant arrays.

Eleven literal reference-sanity assertions include zero-annihilation with an
already-ceiling/large operand and independently saturated outer bases. The
key-bill candidate includes N=0 throughout. Once the outer base already saturates,
the final result cannot distinguish different internal product evaluations;
this is not overstated as internal implementation coverage.

The optional sort-combination hypothesis is deliberately not included; this is
the bounded two-scalar tranche. No benchmark, wall-clock threshold, timeout or
environment change is added.

## Limits and next action

These finite comparisons can establish agreement for the executed cases, not a
universal proof for all safe integers. In particular, they cannot establish
that later source uses these formulas, preserves prepayment/call order, performs
fewer operations, satisfies the current work bound or makes a replay fit.
There are zero production imports. The actual implementation correspondence and
prepayment inventory remain independent source-review obligations after the
parent records this oracle's real run. Files frozen at handback; runtime remains
parent-owned.
