# 720 — P14B.7 THE PROMISE WAIVER: task expansion (draft; audit before it begins)

## 1. The player behaviour this slice adds

Today a player who promised an actor three lead roles in two years, and then cannot deliver,
has exactly one road: the promise BREAKS at its due week, the person records it, and the
studio's trust label degrades. Nothing in the engine lets the player go back to that person and
renegotiate. Every promise is a one-way bet.

P14B.7 adds the second road. **The player may WAIVE an open promise by offering a substitute
promise the person accepts in its place.** The original settles `WAIVED` rather than `BROKEN`,
and the substitute binds to the same contract in the same step.

The person is not a pushover about it. The engine accepts a waiver only when:

- the substitute is REASONABLY ACHIEVABLE over the contract interval that REMAINS, judged by
  the same `promiseFeasibility` the original was judged by, at today's week rather than at
  signing; and
- the substitute is AT LEAST AS STRONG as the promise it replaces; and
- the person does not already read the studio as `Distrusted`. A waiver is credit. A studio
  that has broken promises to this person has no credit left to spend, and asks in vain.

A refused waiver changes nothing at all: the original stays open on its original terms and runs
to its own due week. Refusal is never a silent no-op, it is a returned reason.

## 2. Completion condition

B.7 is complete when every line below is true and evidenced. Not one of them is optional, and
none may be satisfied by narrowing the claim.

1. `waivePromise(state, {promiseId, substitute})` exists in `src/core/promises.ts`, pure, no
   RNG, and is reachable from the action dispatch.
2. `waiverAccepted(state, promise, substitute, week)` is a SEPARATE pure predicate returning a
   reason, not a boolean, so a refusal can be published without re-deriving it.
3. The original settles through the EXISTING `settle()` at `promises.ts:678` with
   `outcome: 'WAIVED'`, producing exactly ONE `promiseOutcome` market receipt. The B.1 one-kind
   ruling is not amended, and no second receipt kind is invented.
4. The substitute is minted BOUND: `contractId` set to the original's `contractId`,
   `outcome: null`, so `evaluable()` at `promises.ts:599` admits it on the next weekly pass.
   It does NOT travel through `attachPromise`, which requires a current proposal and would
   throw (`promises.ts:503-515`). No proposal is created, no market case is opened.
5. Save **V31 → V32** adds `supersededByPromiseId: string | null` to the promise record, set on
   the WAIVED original and naming its substitute. Exact-key validation; `convertV32ToV31`
   refuses a state where any promise carries a non-null value rather than dropping it;
   `convertV31ToV32` opens the field `null` on every existing record and recomputes nothing.
6. RED-first and independently owned. The test-author authors and RUNS the requirement suite
   before the writer starts, and it fails for the stated reason.
7. A full core run on FIXED source matches a prediction pre-registered before the run starts,
   and the inherited 24-failure set is unchanged in identity AND in cause.
8. `LOGIC VERIFIED · UNITY NOT VERIFIED`, with a Unity backlog entry for the save step.

## 3. What the engine already provides, verified rather than assumed

| fact | where | consequence for B.7 |
| --- | --- | --- |
| `WAIVED` is already an enumerated `PromiseOutcome` no path reaches | `src/core/types.ts:2173`; `promises.ts:706-710` says so in words | B.7 activates an enumerated terminal state; it does not widen the union |
| `WAIVED` is already on the WIRE enum | `bridge/schema/bridge-schema.ts:1770`; schema json `:9411-9421` | publishing a WAIVED outcome needs **NO projection step**. Projection stays 49 unless B.7 adds a bridge intent, which it does not |
| `settle()` is the single terminal writer | `promises.ts:678-701` | the waiver reuses it; it is not re-implemented |
| `promiseCastSlots` already expresses the class masks | `promises.ts:603-609` | the strength order needs no new table |
| `reclassifyPromise` already re-runs feasibility at an arbitrary week | `promises.ts:459-471` | "achievable over the REMAINING interval" has a working shape to copy |
| `evaluable()` requires `outcome === null && contractId !== null` | `promises.ts:599-601` | a directly-bound substitute is evaluable immediately, which is the intent |

## 4. The strength order, stated so it cannot be implemented backwards

645-A §2 fixes the order as `P1 any-cast ⊂ P2 leadOrAntagonist ⊂ P2 lead`. That is an order on
STRENGTH, and strength runs OPPOSITE to mask size:

| promise | `promiseCastSlots` returns | strength |
| --- | --- | --- |
| P1, count-only predicate | `['lead','antagonist','support']` | weakest |
| P2, `seatClass: 'leadOrAntagonist'` | `['lead','antagonist']` | middle |
| P2, `seatClass: 'lead'` | `['lead']` | strongest |

So "at least as strong" is **`substituteMask ⊆ originalMask`**, a SUBSET test. A writer who
tests superset has inverted it, and the inversion is silent: it would accept every downgrade
and refuse every upgrade. The RED suite pins both directions and the equality case.

## 5. Three narrow product choices, isolated rather than blocking

Per the standing instruction to isolate genuine new product choices and continue, each carries
a recommendation and B.7 proceeds on it. None is presented as settled.

**(a) Family-class order: mask inclusion, or an explicit table?** Recommend MASK INCLUSION.
`promiseCastSlots` already computes it, so a table would be a second authority that can drift
from the one the seating law reads. 645-A §2 recommends the same. Cost of being wrong: one
predicate, no save shape.

**(b) Is the substitute re-classified at each later freeze?** Recommend NO. It is BOUND, not
proposed, and re-classification is a proposal-time act. A bound promise that changed class under
the player after acceptance would make the waiver worthless as a settlement. 645-A §2 recommends
the same.

**(c) NEW, not in 645-A: what count must the substitute carry?** The original may be part-served
(`progress` > 0). Recommend **`substitute.predicate.count >= original.predicate.count -
original.progress`**, that is, at least the REMAINING obligation, not the original one. The
alternative (at least the original count) charges the player again for takes already delivered,
which reads as a penalty rather than a settlement. Recorded here because no prior record decides
it.

## 6. Excluded, each with its owner

- **Rival waiver policy: RECORD-ONLY**, the R3 pattern. Rivals do not waive in B.7. A rival
  waiver would need its own achievability policy and would be invisible to the player anyway,
  since another studio's promise terms are never disclosed.
- **The retirement-moot branch: P14C.** A promise made moot by the person's own retirement or
  profession transition settles `VOIDED`, not `WAIVED`, and `VOIDED` has no producer until
  P14C exists (645-A §3, and `promises.ts:706-710` records the same).
- **The bridge intent and any read model: the slice AFTER B.7**, on the B.5 → B.6 rhythm. B.7
  lands the engine law with no wire change. The waiver reaches a player surface next.
- **Trust consequence of a waiver: NOT INVENTED HERE.** `trustDrivers` (`promises.ts:822`)
  enumerates five driver kinds and `WAIVED` is not among them, so a waived promise contributes
  no driver and moves no label. Whether it SHOULD is a product question for the slice that owns
  trust text, not a gap B.7 fills by guessing.

## 7. Order of work

1. **T0.** Mint genuine outgoing **V31** fixtures before any source change, per the plan's
   standing rule. Record both identities the B.5 precedent records: the HEAD the mint ran at,
   and the last BEHAVIOURAL V31 writer, which is `caa8cdb3` (B.5-T moved
   `RELATIONSHIP_FAILURE_DELTA` 4 → 5, and that changes edge values inside a V31 save).
   `src/core/save.ts`'s own last writer is `f5310afb`; record both, as 645-A did for V30.
2. **Audit.** Read-only contract-auditor pass on this expansion before T1.
3. **T1.** Test-author writes and RUNS the requirement suite. RED for the stated reason.
4. **W.** sim-core lands `waivePromise`, `waiverAccepted`, the V32 save step and the migrations.
5. **Close.** Pre-registered prediction, then full core on fixed source, then the checkpoint.

Maximum two specialists concurrently. The parent owns runtime and publication.

## 8. Standing qualifications carried into B.7

The UI project is NOT a usable regression baseline and B.7 makes no UI-affecting claim
(record 719, FU-1). Unity remains unverified. The 24 inherited core failures remain the baseline
and B.7 neither clears nor adds to them.
