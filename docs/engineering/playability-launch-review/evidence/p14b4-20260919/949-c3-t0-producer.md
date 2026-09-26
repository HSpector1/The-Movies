# 949 — controlled continuation diagnosis after948

2026-09-26. **Prepared and frozen; not executed by the specialist.** This is a
read-only diagnostic producer. No production, test, fixture or failed evidence is
changed. It contains no file-writing branch and refuses `--write` before gameplay.

Producer: `949-c3-t0-producer.ts`.
Frozen SHA256: `999995103c1cf8b830f31228fb5abade714f68234bdb33481bdf5b34d7961f2a`.
Exact HEAD: `1f44aa505c0d677430451ab5fcacaf5e0ce205d6`.
Consumed source remains byte-identical to qualified
`9afae8874486fbb20dc5d373526698aacbec2114`: Save37, projection52, protocol4.

Preserved producers:

| Producer | Exact SHA256 | Recorded result |
| --- | --- | --- |
| 944 | `133507f0628cc8e4662b35dcfa1a890236f520346bde3f1acf692c85898b8156` | 945 child1, fixedExistingSource:true, zero outputs |
| 947 | `938615b2c2a74cca8f025d21f586cae6ef107f8fc87c6fcc4ae9c2200a2f5a5f` | 948 child1, fixedExistingSource:true, zero outputs |

948 observed exactly12 parsed208 differences, all promise feasibility
`inputsDigest` values. The raw pre207 state differed from its serialized state
only at three negative zeros. The parsed serialized state and actual bridge
import had no structural difference. No player film released at208. These are
recorded observations from948, not fresh execution or causal conclusions.

## Controlled experiment

The original six public authored people, funding disclosure, actions, real films,
default tick sequence, retirement premises and save validation are copied from947.
The same real pre207 snapshot is retained. The independent continuous default
tick reaches208, and the actual bridge command still imports saved207 and advances
once to208. The original exact serialized equality oracle remains in place and
fails if any byte differs; no parsed, normalized or digest-excluded comparison
replaces it.

949 adds exactly three independent208 tick forks:

| Branch | Actual starting values | Option |
| --- | --- | --- |
| Raw default | Original in-memory207, already advanced by the unchanged scenario | Default |
| Raw development | Detached copy of that same raw207 | `develop:true` |
| Imported development | Detached copy of the actual BridgeSession pre-command207 | `develop:true` |
| Zero-only development | Recursive clone of raw207 replacing only numeric negative zero with positive zero | `develop:true` |

The zero-only clone retains object insertion order, array order, undefined and
every other scalar. It refuses non-plain objects; native JSON equality, unchanged
key order and the exact differing-leaf count independently check its narrow
transformation. This branch is diagnostic only. It does not alter the original
world, imported world, original equality oracle or future fixture policy.

All resulting saves pass the same whole Save37 validation and exact canonical
export/import/export checks as the original producer. Recorded comparisons are:

1. Raw default versus raw development, isolating the current tick's option.
2. Raw development versus imported development, holding the option constant.
3. Zero-only development versus imported development, separating negative zero
   from the remaining serialization effects.
4. Raw development versus zero-only development, showing the normalization's own
   consequence rather than assuming it is harmless.
5. Imported development versus the actual bridge advance, checking the public
   command against its source tick path.
6. The original actual bridge advance versus continuous default tick.

Each comparison reports exact save-byte equality, byte counts, hashes, all
structural differing-leaf counts and at most32 bounded path/value examples.
Changed promise receipts also report actual promise, issuer and beneficiary ids,
week and both digests, with a32-row limit. Input identities include both native
JSON and canonical JSON hashes. Full source identity and producer hash are checked
again before the final diagnostic report; both retained pre207 inputs must remain
untouched. The diagnostic stops at208 and never enters the old mint/reopen209
artifact preparation path. It makes no runtime fixture/reopen qualification claim.

## Key-order evidence and precise source hypothesis

The structural comparator deliberately ignores object-key insertion order. The
new separate walk counts every pair with the same key set but a different order,
reports at most32 paths and the first16 keys per object, and counts different key
sets separately. It compares raw207 to serialized207, serialized207 to actual
bridge import, and raw207 to imported207. This makes the earlier structural
equality claim's limit explicit.

A targeted read-only inventory additionally compares the raw nested objects used
by `feasibilityInputs` (`src/core/promises.ts:309–353`) for the player and every
rival issuer, before and after the tick:

- Production casts: the input tuple retains `p.cast` directly.
- Operation workflows: the whole workflow list is included directly, including
  nested reservation, assignment and setup objects.
- Unproduced screenplay reservations: the input tuple retains `p.reservation`.
- Player production queue entries: the queue is included directly; the rival
  branch contributes an empty queue.

The report prints only changed owner groups, at most16; each includes native and
canonical fingerprints plus bounded structural/key-order evidence. It does not
copy the private feasibility formula or manufacture an expected digest. Capacity
input construction is examined in source below, without a new capacity search.

The saved receipt path is `promiseFeasibility` → `feasibilityInputs` → `receipt`.
At `promises.ts:227`, the hash is exactly
`fnv1a64(JSON.stringify(inputs))`. The hash helper (`src/core/math.ts:91–97`) folds
UTF-16 character codes into a64-bit FNV-1a bigint, masks to64 bits, and prints16
hexadecimal digits. It does not directly hash floating-point bits or preserve a
negative-zero sign. `JSON.stringify` already renders either numeric zero as `0`.
Therefore the three observed negative zeros cannot directly change that digest's
number encoding. A hypothetical indirect effect on game logic still needs the
zero-only tick control; the source observation alone does not dismiss it.

The existing save canonicalizer (`src/core/save.ts:630–666`) explicitly promises
byte-identical JSON independent of object insertion order and sorts keys
recursively. Its finite-number branch uses `String(v)`, also yielding one JSON
zero. `makeSave` (`save.ts:6506–6511`) validates then detaches through JSON;
`exportSave` performs the final stable serialization. Existing bridge projections
also explicitly describe JSON's one-zero boundary (`bridge/finance.ts:84` and
`bridge/people.ts:531`). There is no inspected promise contract granting a second
serialized zero, nor a basis to alter internal game numbers throughout the mint.

In contrast, ordinary `JSON.stringify(inputs)` preserves nested object insertion
order. The directly retained objects above can therefore serialize differently
after a canonical save/import despite identical structural values. At market
settlement, `attachedFeasibility` (`src/core/talentMarket.ts:795`) computes from
the proposal's actual interval; `settleCase` retains the pre-commit receipt and
`commitWinningPromise` stores it (`talentMarket.ts:1194–1220`). This is a concrete
route for an order-sensitive receipt to become saved history.

The separate capacity service also uses
`fnv1a64(JSON.stringify(identity))` (`src/core/promiseCapacityOwners.ts:189–191`),
excluding only `preparationWork`. Its assembler explicitly fixes `limits` key
order and reconstructs top-level/claim objects, while owner traces and fixed holds
are retained from their producer (`promiseCapacityOwners.ts:153–184`). This is
additional source context, not proof that those capacity inputs produced the12
observed receipts. No current hash rule, old receipt or old fixture is changed.

The strongest source hypothesis is nested object insertion order. The controlled
run must establish which alternatives the actual scenario eliminates. A remaining
zero-only versus imported mismatch is not an acceptable parity result and cannot
be excused by JSON's one-zero rule. No producer correction, production fix or
separate-slot mint policy is selected in949.

## Parent execution handoff

Only the parent may execute the frozen diagnostic under a new recorded attempt:

```sh
node_modules/.bin/vite-node docs/engineering/playability-launch-review/evidence/p14b4-20260919/949-c3-t0-producer.ts
```

No `--write` argument. Expected fixture outputs: zero, on success or failure.
The original mismatch should still produce a nonzero exit if reproduced; that
exit must be attributed to the preserved oracle, not treated as a failed causal
experiment or silently relabelled as a pass. No tests, gameplay probes,
typechecks, generators or this producer were run by the specialist.
