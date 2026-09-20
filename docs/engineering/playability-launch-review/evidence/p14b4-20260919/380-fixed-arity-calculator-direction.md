# 380 — Fixed-arity calculator direction adopted

2026-09-20. Parent adopts sim-core proposal and contract-auditor qualified KEEP
for the EXACT bodies/payment inventory below. No fit/Ready/B4 claim.
Base HEAD/exact remote7e0d1b3c607c22e73a9d987e60f6a76468699b92 (381).
367 source4166ea6a00b23741bf0e9f4c945520d80d2834a53d400a1133bc23002a8aa6e1.

## Scope and invariant

ONLY Work.equality, Work.keyBill, the bounded sortBill arithmetic fold, and a
fixed module threshold constant. All caller calc payments, Work.add/times/plus/
keySpanBill implementations and primitive prices remain UNCHANGED. No new memo,
owner/domain/billing-formula changes, public export, tests/caps/validator changes.
Returned saturated owner reserve must be EXACTLY unchanged for every admitted
nonnegative integer input. Removing nested calculator execution is real work
removal, not a discount to executed owner work. No refund/reset.

## Equality — adopted exact spelling

Fixed module threshold EQUALITY_SATURATION_LENGTH=(CEILING-1)/2, hence100000.
This is fixed initialization, not uncharged input-dependent calculation.

```ts
this.pay(20)
return length >= EQUALITY_SATURATION_LENGTH ? CEILING : 1 + 2 * length
```

Old numeric result min(C,1+sat(2L)) = min(C,1+2L), C200001.
Inclusive threshold returnsC; below it product/addition bounded.
Inventory at most10 nodes: threshold reads/comparison/dispatch4; unsaturated
constant/operand reads,multiply,add,return6. Existing two-units-per-node convention
therefore20. Old internal tree38. Caller argument payment unchanged.

## Key bill — adopted exact uniform body

```ts
this.pay(64)
if (length >= CEILING) return CEILING
const base = 1 + length
const unit = 1 + 2 * length
if (count > Math.floor((CEILING - base) / unit)) return CEILING
return base + count * unit
```

Old numeric result=min(C,1+L+N*(1+2L)) under nonnegative saturation.
L>=C necessarily saturates, includingN0. Otherwise base/unit safe; floor guard
BEFORE product ensures N*unit<=C-base on false branch. Keep STRICT >, including
exact-ceiling equality and zero-count behavior. No unsafe multiplication.

Longest-path counted nodes4initialguard+4basebinding+6unitbinding+
11secondguard(including Math/floor access+call)+6return=31; prepaid64 covers.
Old nested internal tree112. No extra zero-count branch: such a staged alternative
would require a NEW full branch inventory, not an uncharged return.
Callers supply nonnegative integers, including capped derived values; no claim
for arbitrary negative/NaN/fractional private-helper inputs.

## Sort arithmetic fold — adopted source-proven construction

Keep n<2 arm, level/run loop, comparator meaning and every other price term
EXACTLY unchanged. For n>=2 replace duplicated sat(n*levels) computations and
two final terms5M+(8+comparator)M by ONE term(13+comparator)M.

After the unchanged loop:
- prepay4 for two new local bindings;
- calculate M with existing work.calc(8).times(n,levels);
- calculate saturated coefficient with existing work.calc(8).add(13,comparator);
- retain unchanged surrounding22 payment and return calculator; replace ONLY
  the final two terms with work.calc(32).times(coefficient,M).
All helpers themselves retain existing internal charges.

Nonnegative capped arithmetic preserves the equality, including already-capped
M/coefficient. Current arm has M>0; no zero-annihilation assumption is dropped.
The per-call48 saving is consistent with this exact construction (two duplicate
trees removed, paid locals/coefficient, one fewer final sum), not a target to hit
by undercharging. Any spelling change requires full actual-source recount.
keySpanBill remains46/internal and unchanged: no demonstrated safe net saving.

## Independent hypothesis oracle — actually run, narrow claim

Test-author frozen script8b9b49c184ce25f211056cfcc342d580c88cd55734acc498cdf82dfcd280f552;
brief1632e370571730d258c627d19d63bbe24eca9835f1244ced4e827ee72422c5d4.
Parent FULLread and before/after script hash verified.
380-scalar-algebra-hypothesis executed08:51:45.381–08:51:46.787Z,
session1700CLOSEDexit0/fixedSource:true on7e0d1b3, empty protected patch
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.

PASS891148 finite candidate comparisons plus11 literal BigInt-reference sanity
assertions. Equality bounded200003, keyBill bounded690803, large equality18,
large keyBill324. EveryL0..200002, N0/1/2 and independently BigInt-derived division
threshold±1;18-value large-edge grid through MAX_SAFE_INTEGER. Independent exact
BigInt nested old formulas versus separately named hypothetical Number bodies.
No production imports. Sort deliberately excluded from this oracle; source proof
above is separate. This does NOT establish later code correspondence, prepayment,
all-integer theorem, aggregate numerical fit or actual replay acceptance.

## Ownership and verification

382 sole sim production writer ONLY replay+382handback, implementing EXACT adopted
three-helper scope/payment inventory. All specialists now idle. After freeze:
parentFULLread/pins;383 independent actual-source review including correspondence
to the oracle candidates and complete sort inventory; SERIAL384rootUI/385lookup5/
386ordinary66/387Ready15/388started26/389adjacent137/390bridge/391facts2.
No source/HEAD changes during checks. New genuine cases remain immutable.

378 still needed >=16857 just to pay wrap at its boundary plus later work. Do not
claim these local savings solve that. Diagnose actual results and preserve every
failure; publish qualified checkpoints/exact remote. Continue B4/restP14/P15/P16/
specifiedP17/P18; T4/B2/B3/B-F2closeouts stand. Unity/native/Owner acceptance deferred.
