# 227 — fixed-binary calculator efficiency

2026-09-20. SOURCE FROZEN for parent verification; native sim-core. Only replay
module and this handback edited. No runtime/tests/typechecks/probes, Git/network,
delegation or other source edits. Base779e65b6c3710e4fa530d9fbce2aa9a9e245a63a.
Read full223/228; preserve the actual225 two failures and226 diagnostic.

| Replay | SHA256 |
| --- | --- |
| Before227 (218) | `41f200bec1eb019e8dce080e5d105bb1cef6cb485faba162496110dbe365031f` |
| Frozen227 | `376eb23874fb9d1a142f58c29ce2f3832c7b7a021f3d2698cf6bbbc349dcfe79` |

## Executed arithmetic simplification, not a reduced owner bill

The existing eight-unit prepaid saturating `add(a,b)` is now callable directly
inside this private module. All30 genuine binary `plus` calls use it. They no
longer execute16 optional guards or `add(0,a)` followed by `add(a,b)`. Multi-term
`plus` starts with `add(a,b)` and executes only k−1 additions. Its actual optional
guards still execute and remain prepaid20; no change to their charge.

For nonnegative admitted cost operands, both sequences return exactly
`min(200001,a+b)`. If a is already saturated, `b >= 200001-a` succeeds; no overflow
addition occurs. All other additions/products keep subtraction/division-before-
overflow protection. Arguments still execute left-to-right under a paid receiver
BEFORE arithmetic; nested calculators still pay their own complete execution.
No rest array, variable argument discovery, extra owner, refund or reset added.

| Actual calculation | Before | After |
| --- | --- | --- |
| Binary helper body |20 guards/setup +8 zero-add +8 binary-add =36 |8 direct binary-add |
| Measured shallow-key sum |8 receiver +36 =44 |8 receiver +8 =16 |
| Simple chars/ID-length sum |64 receiver +36 =100 |8 receiver +8 =16 |
| Sort-run sum / longer task-text sum |64 receiver +36 =100 |16 receiver +8 =24 |
| k-term sum, k>=3 |20+8k, plus existing receiver |20+8(k−1), same receiver |
| Simple two-operand product |32 receiver +10 body =42 |8 receiver +10 body =18 |

These savings are per actual occurrence, not a presumed total/headroom figure.
Each removed helper/guard is absent from execution; remaining operations retain
their charges. Source-scoped tighter argument bounds are below.

## Complete changed-callsite inventory

All30 binary sites retain identical argument expressions/order and saturating
values. Bounds8 reserve up to4 scalar nodes at two units each. Nested paid helper
expressions are not traversed by that outer bound; they keep their own receiver
and body. Bounds16 cover the three longer cases (up to8 direct nodes).

| Owner in this module | Binary sites |
| --- | --- |
| Work methods (3) | equality; each shallow key; token escaping sum. Existing8/8/16 receivers unchanged |
| sortBill (1) | run accumulator with ceil/division/width;64→16 |
| company / writers (3) | both company ID loops and pooled-writer length loop;64→8 |
| dimensions (3) | capacity, provided-ID count, cells;64→8. Deepest operand is `row.providesFacilityIds.length` |
| restricted sweep (2) | task-text accumulation64→16; ASSOC outer addition of two independently paid products64→8 |
| allocation bill (8) | occupied count; key length; key-construction cost; raw-claim per-row cost; occupancy per-key cost; selection cost; callback sum; retention outer sum.64→8 |
| general sweep (5) | key length; key construction; retained phase-guard cost; Post capacity; final common+attempt cost.64→8 |
| command (1) | arrivalBill+paid equality/product wrapper64→16 (the body of arrivalBill remains separately charged) |
| frame (4) | external Set; committed Set; released Set; surviving-production filter bill.64→8 |

Token dispatch keeps its existing16 receiver; no source predicates/escaping
formula changed. Complex nonbinary receiver bounds are unchanged.

Exactly29 product sites tighten32→8. BOTH operands at each are numeric literals,
local scalar references or shallow property references; no arithmetic/conditional
or nested call is hidden in either argument. At most4 scalar nodes fit8. Repeated
entries below denote distinct executed source sites:

| Block | Product argument pairs |
| --- | --- |
| sortBill (5) | `(3,n)`, `(8,levels)`, `(19,runs)`, `(n,levels)` twice |
| company (3) | `(6,productions.length)`, `(4,count)`, `(2,chars)` |
| geometry (3) | `(d.structures,8)`, `(d.cells,10)`, `(2,body)` |
| order (1) | `(2,d.n)` |
| restricted sweep (4) | `(6,d.n)`, `(4,t)`, `(2,r)`, `(11,r)` |
| allocation (8) | `(4,rawOwners)`, `(3,other)`, `(2,d.d)`, `(2,keyConstruction)`, `(2,text)` twice, `(3,text)`, `(d.f,callback)` |
| general sweep (4) | `(2,d.d)`, `(4,keyConstruction)`, `(8,text)`, `(d.n,rounds)` |
| command (1) | `(8,d.d)` |

All other products retain their prior32/8 receivers. The actual times body still
pays10. Multi-term sums retain their prior64/8 receivers; only their truly
redundant zero-add disappears.

## Preserved scope / checks / next action

No218 owner-execution bound, retention condition/formula, literal construction
charge, output/ledger/event path, source-domain rule or cap was changed. In
particular raw retained-Development claims still include the current owner;
all actual owner invocations and final settled scans remain. Only computation
of unchanged numerical owner bills is cheaper. Work expenditure legitimately
changes; no remaining-budget substitution or false completeness is introduced.

Static source inspection confirms only the arithmetic changes listed above;
`rg` found no trailing whitespace. All seven protected companion/owner hashes
match218 exactly (scriptDevelopment, castingSessions, productionPeople, kernel,
operations, boundedStableSort, releaseAuthority). No tests were touched or run.
No green/usefulness/source-cost acceptance claim is made from these per-site
calculations: parent compiles and runs all25 immutable original cases, then the
separate independently frozen grandfather case as planned. Do not weaken any
assertion/cap if more genuine failures appear. Broader223 qualifications remain.
Source ownership is yielded pending diagnostics; no liveP2/B4/native acceptance.
