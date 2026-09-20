# 174 — bounded shared-owner sorting: qualified implementation checkpoint

2026-09-20. **Prerequisite implemented and verified within157 §§1–3.**
This is not full B4, actual replay certification, full-suite green, performance
equivalence, Unity/native verification or Owner acceptance. Independent170 KEEP
covers both source-contract compliance and code quality. No tests were changed
after independent RED, and no validator, timeout, version or work cap changed.

## Fixed candidate and completed verification

Base `f290536336dd726a15a177c5e36f71b0fcec3cd0`; protected SOURCE-ONLY patch
`f65c466192c75e2b296a173d5990bb41ed51e24f24a70adc998f1d35f2817793`.
Exactly three production files: new boundedStableSort.ts, operations.ts and
releaseAuthority.ts. Parent read complete168 handback, helper and applied diff,
independently matched all three source hashes and both unchanged160 test hashes.
Parent read COMPLETE raw output/metadata of all checks below; all fixedSource:true
on that same candidate and all sessions CLOSED.

| Evidence | Result | UTC interval |
| --- | --- | --- |
|171 targeted|55PASS/7files, exit0;14new+41existing|02:14:52.463Z–02:15:07.171Z|
|172 root/UI typing|BOTH PASS, exit0|02:15:40.774Z–02:16:55.669Z|
|173 bridge typing|exit2; SOLE exact priorP2 TS2353|02:17:28.851Z–02:17:56.832Z|

171 completed in13.68s,17.73s cumulative test bodies. No failures, failed suites,
skips, todos or unhandled diagnostics. The formerly uncollected seven helper
cases now actually executed and passed, as did all seven new real-owner cases
and41 original owner regressions. Compare161 unchanged41 baseline,163 seven
old-owner passes and164 one missing-module failed suite/ZERO collected bodies.
This is not evidence of seven preimplementation behavioral failures.

173's complete compiler diagnostic, programmatically compared byte-for-byte with
154, remains:

```text
tests/bridge-p14b4-cast-class.test.ts(364,20): error TS2353: Object literal may only specify known properties, and 'kind' does not exist in type '{ count: number; }'.
```

It is the unchanged future live-P2 bridge-contract gap, not a new helper/owner
typing regression. Bridge typing is NOT green; do not delete/loosen that test.

## Scope and proof

The shared stable bottom-up merge sort returns fresh arrays, retains all element
identities, treats final comparator NaN as a stable tie, uses arithmetic doubling
and copies every tail exactly once per pass. Source review establishes at most
`n*ceil(log2(max(1,n)))` comparisons and `n*(ceil(log2(max(1,n)))+1)` explicit
element-reference writes. Sampled comparator counts accompany correct outputs;
slot-write proof is source-based, not falsely claimed instrumented measurement.
The length-only cost query safely handles integer0..0xffffffff without allocation
proportional to length, rejecting invalid lengths with RangeError.

All three REAL owner sites use the helper. Allocator policy callbacks remain in
input order before sorting; sticky reservations/Set state order/first-fit law
remain unchanged. Production keys are prepared once per row with original wait,
regex, Number, fallback and ordinal `||` semantics; full generic records survive.
Commitment identity, refusal and canonical lexical append law remain unchanged.
Bounds exclude comparator bodies/native allocation/host instruction time, and
semantic parity is for dense ordinary data/lawful comparators. Historical-control
and lower-owner fixture limitations remain exactly disclosed160/165/166.

## Recovery and next implementation

Publish this verified prerequisite and separately verify remote SHA. No source
writer remains. Auditor175 is reviewing PAPER162's restricted first-take owner
block; sim-core176 owns ONLY inert whole replay work composition. No mutable
source/protected test work is authorized by those assignments; max2specialists.

Parent adopted169 endpoint correction: a w→w+1 take is stamped(H,0) when H=w+1,
and cannot qualify under the half-open deadline. Real in-window testing requires
actual next4→3 wrap/Post work and H>=w+2. Positive count is still not B2 plus
eight-week slack or complete choice coverage. No restamping or invented hold tail.

Full replay137/148/157 accounting remains OPEN: preparation, repeated callbacks,
strings/own-property copies, every external-owner call, ledger/proof generation
and unchanged-kernel work must compose under the SAME200000 cap.162 is only a
paper component; its962/2436 subtotals exclude sorting/caller/kernel work. Settle
176, independent genuine tests/actual RED, then one actual replay writer with
shared due predicates/company fact signature under137. Do not add another
setup/installation campaign or declare a finite command menu choice-complete.

Continue coherentP2/restP14/P15/P16/specifiedP17/P18. Recovered T4/B2/B3/B-F2 and
all earlier checkpoints remain intact. Save29/rules3/projection46 still live;
no generated/handwritten Unity change. Unity backlog and deferred native/Owner
acceptance remain explicit. No routine permission pause.
