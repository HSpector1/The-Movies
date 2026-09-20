# 321 — Local replay calculator reductions and payments

2026-09-20. Native sim-core. SOURCE FROZEN; production write ownership yielded
after this handback. Base published and independently verified remote:
`2d30b768bfd19174ef967f69f70f7ac814600142`.

Implemented adopted320 C+B/local payments and adopted325, ONLY in
`src/core/promiseCapacityOwnerReplay.ts`. This handback is the only other written
file. No tests, runtime, probes, typechecks, Git, network or delegation were run.
No dimension memo A, owner changes or numerical-fit claim.

Source SHA-256:
`1f5ea6e7a7def99e43fef0649d74744d4e49604bc4dba5f7857fbdd9cf820242`.

## 1. C: unchanged arrival owner price, no zero-use calculations

`arrivalBill` preserves its possible-workflow predicate and short-circuit order.
Each phase comparison now uses `Work.equal`. Only after shooting matches does
it read optional task status; only after blocked matches does it read optional
blocker kind. Undefined optional values retain the original false result. Each
comparison pays its own `1+both operand lengths` before execution. Existing5
row controls remain, with6 before each optional read/guard and2 for an increment.

The unchanged owner reservation is factored as:

```text
common = 18 + n*(14 + 4*E(d))
common + possible*(geometryBill + 70 + workflowCopy + taskCopy + workflowUpdate)
```

When possible=0, the final term is exactly zero under the existing saturating
arithmetic. After a paid guard the calculator returns common, without executing
`geometryBill` or `workflowUpdate` calculators. Nonzero branches retain both
complete calculations and copy prices. The real `arriveDueScenery` call and its
callback/behavior are unchanged. This removes executed calculator work, not
owner work, geometry law or a supported context.

## 2. Wrap-only Post calculator corrections

Both existing capability comparisons use `Work.equal(...,'post')`; existing
facility4/reservation3 scalar payments remain. The outer workflow loop now pays4
before reading `row.reservations` and initializing the inner walk, even if it is
empty. Counts, capacity checks, attempt bound and actual sweep are unchanged.
No prior string discovery or later owner payment substitutes for these repeated
calculator comparisons.

## 3. B: actual identity union, pre-insert prefixes and separate base proof

The complete identity-root counting walk, nullable-occurrence discovery,
width discovery and actual `persistedProductionIds(source)` call remain.
The owner walk still reserves64+40*visits. N means nonnull INSERTION OCCURRENCES,
not the final distinct Set size; duplicate roots remain fully visited and priced.

At occurrence i the empty-started actual Set contains at most i keys. Thus its
same-metric insertion reserve is now:

```text
N*(9+W) + pairs*E(W)
pairs = N*(N-1)/2
```

The old reserve was N*(9+W)+N*N*E(W), treating every insertion as if the final
collection already existed. The new bound follows the actual source prefix,
not a discount or a hashing assumption. It conservatively retains all duplicate
occurrences and their maximum width.

For N<=1 pairs is zero. Otherwise, a paid parity branch halves the even factor
BEFORE the saturating product: `(N/2)*(N-1)` or `N*((N-1)/2)`. It never saturates
N*(N-1) and then divides. Local/guard work pays12, parity/control pays16 and both
factor expressions use a prepaid `calc(16)` receiver. Subsequent sums/products
use the existing paid saturating helpers. All root discovery is already bounded
by the same counter before this arithmetic; no unchecked huge-product loop is
introduced.

ONLY after the fully prepaid actual union is returned:

1. Pay100 for exact base construction and fixed scalar/call controls, then build
   `prod-${String(source.market.tick).padStart(4,'0')}`. The genuine source week is
   a nonnegative safe integer; the existing conservative22-character number
   bound covers conversion/padding, template characters and finite controls.
2. Independently prepay `keyBill(taken.size,max(W,base.length))`, then perform the
   actual proof lookup `taken.has(base)`.
3. If absent, prepay100 PLUS that full lookup bill AGAIN, then call the unchanged
   `allocateProductionId(source.market.tick,taken)` and return ITS result.
4. If present, retain the previous full size+1 suffix-candidate reservation and
   call the unchanged allocator. The proof's expenditure is never refunded.

The proof does not return a guessed production identity and does not pay for
the allocator's own work. Historical/cancelled IDs, all persisted consumers and
the actual union/allocator observation seams remain authoritative.

## 4. 325: local active-contract calculator index

The real `activeContract`, `isContracted`, market and Hollywood owners are
untouched. Only freelancerBill's private reachability/calculation path changes.
No eligibility/index data escapes one invocation and there is no warm-cache
premise, external reference cache or source mutation.

ALL original contracts are visited in original order. The numeric prefix starts
with6 and includes every original row, whether active, expired, future or
unrelated. Active rows are decorated as `{id,visited}`, where visited is the
original ordinal+1 derived after that row's prefix append. Filtering therefore
cannot change the original prefix position.

The existing private `sorted` helper performs a paid cold bounded stable sort
by id. It charges its full decoration/key discovery/arrays, both lexical
comparisons, actual shared sort, copies and undecoration. Equal-ID stability
preserves the earliest original active row, including multiple active matches.

Each calculator query performs a paid numeric lower-bound search and one exact
equality check at the resulting position. A hit selects the earliest active
original row's visited value. A miss uses the FULL original contract count,
not active-index length or sorted position. Date tests retain exact inclusive
start/exclusive end semantics from the unchanged owner.

### Exact original owner-prefix price

```text
P[0] = 6
P[i] = P[i-1] + 10 + originalRows[i-1].talentId.length
queryPrice = P[visited] + visited*queryLength
           = 6 + visited*(10+queryLength) + originalPrefixIdCharacters[visited]
```

This is EXACTLY the previous owner reserve. A zero-row miss still costs6; an
all-inactive miss still pays every original row. Repeated research-seat queries
perform a fresh paid calculator lookup and add the entire owner query price
again. Reusing numeric prefix VALUES is not reusing payments. All terms are
nonnegative; existing saturating sums/products preserve the same capped total.

### Calculator call-tree accounting

| New/replaced calculator work | Before-execution payment |
| --- | --- |
| Initial three arrays/prefix and closure/scalar setup | Existing56 retained; prefix literal is now6 rather than0, active boolean array replaced by metadata array. |
| Each original contract/date test and prefix append |20 scalar visits/date/argument/loop steps plus APPEND=3; ID span through Work.text; prefix addition uses prepaid calc32 and the paid saturating add. |
| Active metadata row | `literalCost('id','visited')=12`, APPEND=3 and8 for the field-value expressions; paid before construction. |
| Local sorted call |4 callback/argument/result steps, then the existing fully paid private sorted helper; no sort/body/copy cost omitted. |
| Query setup |10 for call/low/high/length/first guard. |
| Every lower-bound iteration |24 for guard, numeric midpoint/Math.floor, row/key access and branch/update. New Work.less mirrors Work.equal's exact comparison payment `1+left.length+right.length` before `<`. No raw uncharged lexical comparison. |
| Final index/hit/original-prefix selection |14 scalar/guard/local/branch/assignment steps, plus Work.equal's exact operand spans when a candidate exists. |
| Owner-price accumulation | Paid calc receivers precede prefix indexing/length arguments; two saturating additions and one product each charge their own calculation. |

The metadata literal schema is the only added LITERAL entry. Work.less is a
private scalar-payment twin of Work.equal, not a new comparison law or exposed
API. No per-person owner-price suppression follows from the index.

## 5. Scope, static review and verification limits

Static source review covered the changed call sites, both zero/nonzero arrival
arms, empty/all-inactive/matching contract cases, stable duplicate precedence,
N=0/1/even/odd identity arithmetic and occupied/free base arms. Source inspection
and hashing found no trailing whitespace; no executable check was run. Hashing
emitted the host's existing harmless Perl locale warning.

Source touches are confined to: one literal schema; Work.less; arrivalBill;
wrap-only Post counters; readyProductionId pricing/proof; and freelancerBill's
contract calculator. All other freelancer bills, full actual market call,
source-now admission, complete trace/ledger construction, original owner calls,
tests, cap200000, work metric, validators, versions and wire shapes are unchanged.
No dimension reuse A or broader owner retuning was implemented.

324 showed an actual pre-market shortfall of14206 BEFORE later refusal work.
This implementation removes source-executed calculator scans/trees and tightens
only the independently adopted identity bounds. It does not establish a runtime
fit. The parent must independently review and run the fixed Ready/freelancer,
long-route/stale-target, original-started, employment/adjacent and type gates.
If a genuine budget failure remains, preserve and attribute it; no cap, owner,
test or assertion relaxation is authorized by this handback.

SOURCE FROZEN. Production write ownership is yielded for parent-only serialized
verification/publication. No whole-budget, domain-completeness or B4 acceptance
claim is made.
