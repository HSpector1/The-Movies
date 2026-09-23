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
none may be satisfied by narrowing the claim. Seven items were added or corrected by the
723-C audit; see §10.

1. `waivePromise(state, {promiseId, substitute})` exists in `src/core/promises.ts`, pure, no
   RNG, opening with `requirePromiseRoots(state)` as every other state-mutating export in the
   file does (`:713`, `:760`, `:786`), and reachable from the action dispatch.
2. `waiverAccepted(state, promise, substitute, week)` is a SEPARATE pure predicate returning a
   reason, not a boolean, so a refusal can be published without re-deriving it.
3. It REFUSES, with a stated reason, when the original is not `evaluable()`
   (`promises.ts:599-601`: `outcome === null && contractId !== null`). Both halves matter and
   for different published reasons. An ALREADY-TERMINAL promise must not be waived, because
   `settle()` would overwrite a terminal `outcome`/`outcomeWeek`/`outcomeCause`/`outcomeEventId`
   and break the "TERMINAL and emitted ONCE" law (`:705-706`); the exact-key validator cannot
   catch this, since it checks final state and not the transition. An UNBOUND promise must not
   be waived, because `:588-593` rules that a promise whose proposal lost, was dropped or was
   withdrawn is NEVER evaluated and keeps `outcome: null` for good: "B.1 mints no outcome for an
   offer nobody took."
4. The substitute's window is judged against the REAL contract, not against itself.
   `startWeek` and `termWeeks` in the `PromiseDraft` handed to `promiseFeasibility` are read
   from the employment contract named by `promise.contractId`, because they are documented as
   "the PROPOSED CONTRACT interval the window must lie inside" (`:203`) and they alone arm the
   two refusals at `:406-409`. See §4, which is where a writer is most likely to go wrong.
5. The substitute carries its OWN `feasibilityReceipt`, computed by `promiseFeasibility` at
   today's week and stored on the record. It is an exact-key mandatory field (`:1012`) and is
   validated member by member (`:1047-1061`), so a substitute minted without one does not fail
   in `waivePromise`: it fails later, as an opaque save-validator crash.
6. It REFUSES a substitute identical to the original in family, class, count and window. Such a
   substitute passes the strength test at equality and the count rule at equality, and would
   mint a real WAIVED outcome and a fresh promise record for no change in what the player owes.
7. The original settles through the EXISTING `settle()` at `promises.ts:678` with
   `outcome: 'WAIVED'`, producing exactly ONE `promiseOutcome` market receipt. The B.1 one-kind
   ruling is not amended, and no second receipt kind is invented.
8. `progress` and `evidenceRefs` on the WAIVED original are PRESERVED, not cleared. `settle()`'s
   `next` is `Partial` (`:676`) so this is a decision, not a default: the BROKEN branch
   recomputes `progress` (`:747`) while the termination and cancel branches leave it. Preserving
   is the reading §5 (c) already depends on, since the substitute's count is set against what
   the player still owes and that is only meaningful if the delivered takes stay on the record.
9. `outcomeCause` carries a stated sentence, as every other terminal branch does (`:726`,
   `:742`). The validator requires non-empty text (`:1107`).
10. The substitute is minted BOUND: `contractId` set to the original's `contractId`,
    `outcome: null`, so `evaluable()` admits it on the next weekly pass. It does NOT travel
    through `attachPromise`, which requires a current proposal and would throw
    (`promises.ts:503-515`). No proposal is created, no market case is opened.
11. Save **V31 → V32** adds `supersededByPromiseId: string | null` to the promise record, set on
    the WAIVED original and naming its substitute. The step follows the shape this codebase
    already uses twice: the field opens `null` on every existing record and recomputes nothing
    (the V25 → V26 `cancellation`/`cancelledWeek` precedent, `save.ts:8347-8361`), and the
    DOWNGRADE refuses rather than drops, through a separate `projectPromisesPreV32`-style helper
    called BEFORE envelope validation, as `projectPromisesPreV29` (`promises.ts:1142-1157`) and
    `projectRelationshipsPreV31` (`save.ts:8801-8819`) both do.
12. The two bridge surfaces that currently treat WAIVED as nonexistent are DECIDED, not left
    accidental. See §6. One is a defect B.7 creates and must fix; the other is a product choice
    B.7 must make explicit in the module that states the invariant.
13. RED-first and independently owned. The test-author authors and RUNS the requirement suite
    before the writer starts, and it fails for the stated reason.
14. A full core run on FIXED source matches a prediction pre-registered before the run starts,
    and the inherited 24-failure set is unchanged in identity AND in cause.
15. `LOGIC VERIFIED · UNITY NOT VERIFIED`, with a Unity backlog entry for the save step.

## 3. What the engine already provides, verified rather than assumed

| fact | where | consequence for B.7 |
| --- | --- | --- |
| `WAIVED` is already an enumerated `PromiseOutcome` no path reaches | `src/core/types.ts:2173`; `promises.ts:708-710` says so in words | B.7 activates an enumerated terminal state; it does not widen the union |
| `WAIVED` is already on the WIRE enum | `bridge/schema/bridge-schema.ts:1770`; schema json `:9411-9421` | the promise-history row publishes a WAIVED outcome with no wire change. This does NOT settle the projection question by itself; see §6 |
| `settle()` is the single terminal writer | `promises.ts:678-700` | the waiver reuses it; it is not re-implemented |
| `promiseCastSlots` already expresses the class masks | `promises.ts:603-608` | the strength order needs no new table, and a second table would break the single-authority rule this module enforces everywhere |
| `evaluable()` requires `outcome === null && contractId !== null` | `promises.ts:599-601` | a directly-bound substitute is evaluable immediately, which is the intent, and the same predicate gates §2 item 3 |
| `promiseFeasibility` refuses a window that overruns its contract | `promises.ts:406-409`, on `startWeek`/`termWeeks` documented at `:203` | the substitute gets those two refusals only if it is handed the REAL contract interval |

### The trap in this section, named because the first draft walked into it

The first version of this table cited `reclassifyPromise` (`promises.ts:459-471`) as "a working
shape to copy" for judging achievability over the remaining interval. **Do not copy it.** It sets
`startWeek: promise.windowStartWeek` and `termWeeks: promise.dueWeekExclusive -
promise.windowStartWeek`, using the promise's own window as the contract interval, which makes
both refusals at `:406-409` tautological:

- `draft.windowStartWeek < draft.startWeek` becomes `w < w`, which can never fire;
- `draft.dueWeekExclusive > draft.startWeek + draft.termWeeks` becomes `d > d`, the same.

That is deliberate and documented for `reclassifyPromise`, whose comment says the window IS the
interval because "a live promise no longer asks whether it fits inside a contract it already rode
in on" (`:449-451`). A live promise's window was checked at attach time. **The waiver's substitute
is a brand-new promise whose window has never been checked against anything.** Copying the pattern
would let `waiverAccepted` accept a substitute whose window overruns the real employment contract,
and the player would meet it later as an opaque save-validator crash (`:1070`) instead of the clean
published refusal §2 item 2 exists to give them.

Two further reasons not to treat that function as a model: it has NO production caller at all
(its own comment records the grep over `src/ bridge/ ui/`), and it exists today only for
`index.ts` and one RED's premises.

### Two engine facts MEASURED at T0, not read off the source

Both came from actually minting the fixtures (record 722), and both constrain what the RED may
assert. Neither was visible to a static read, which is why T0 runs before T1.

**`Distrusted` tolerates a positive driver.** `label()` (`promises.ts:879-884`) computes
`negative >= TRUST_DISTRUST_MIN_NEGATIVES && negative > positive`, not "two negatives and no
positives". The minted `genuine-v31-distrusted-issuer` carries two negative
`cancelledAfterFirstTake` drivers and ONE positive `ranToEnd`, arriving naturally because the
target's own first contract ran to term, and it still reads `Distrusted`. A RED case that assumes
driver purity would be asserting a stronger premise than the engine holds, and would break the
first time a fixture picked up an incidental positive. §1's third refusal condition is a label
test, never a driver count.

**A substitute whose remaining count is 2 or more needs a second pipeline opening.** Minting a P1
promise with `predicate.count >= 2` required a second existing-pipeline door beyond the single
stock-greenlight one. `activateScriptDevelopment` looks like the opening and is not: it changes
`greenlight`'s own admission rule, since a managed studio must target a `Ready` script project
(measured against `productionAdmission.ts`). The route that worked uses a fresh studio's TWO
soundstages. This bears directly on §2 item 4: when `waiverAccepted` re-checks achievability for a
substitute whose remaining count is 2 or more, the capacity it needs is not a doubled version of
the count-1 case, and a RED fixture built by naively doubling will not reach the state it means to.

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

One reader trap, noted so nobody re-derives the order from the wrong document. 645-A §2's own
shorthand writes the order as "P1 any-cast ⊂ P2 leadOrAntagonist ⊂ P2 lead". Its INTENT matches
this table, weakest to strongest. Read literally as set notation over the actual masks it is
backwards, since P1's mask is a SUPERSET of P2-leadOrAntagonist's. This table, not that line,
is the source. 645-A is not amended.

## 5. What is settled by existing law, and the ONE genuine product choice

The first draft of this record isolated three questions for the Owner. The 723-C audit showed two
of them are already decided, by law and by this record's own architecture. Sending a settled
matter up as an open question wastes the Owner's attention as surely as deciding a real one alone,
so both are restated here as constraints.

**(a) Family-class order: SETTLED by existing law, not a choice.** `promiseCastSlots`
(`promises.ts:603-608`) is already the sole authority for cast-slot masks in this module, read by
`qualifyingTakes`, `promisedCastMasks`, `breakPromisesOnCancel`, `targetSpecificImpossibility` and
the save validator's own `qualifyingSlots` (`:1033`). A second explicit table would be a second
authority that can drift from the one the seating law reads, which this module refuses everywhere
else (`:285`: "the arithmetic and its receipt digest consume this ONE membership rule"). Mask
inclusion is not recommended, it is required.

**(b) Re-classification of the substitute at a later freeze: SETTLED by item 10, not a choice.**
Freeze re-classification runs only over `state.talentMarket.proposals`, and item 10 creates no
proposal for the substitute. There is no code path by which a freeze could reach it. The answer
follows from the architecture this record already commits to.

**(c) What count must the substitute carry? GENUINELY OPEN. Recommendation stated, B.7 proceeds
on it.** The original may be part-served (`progress` > 0). Recommend
**`substitute.predicate.count >= original.predicate.count - original.progress`**: at least the
REMAINING obligation, not the original one. The alternative charges the player again for takes
already delivered, which reads as a penalty rather than a settlement, and it is the reason item 8
preserves `progress` rather than clearing it. No prior record decides this. If the Owner prefers
the stricter reading, it is one comparison and no save shape moves.

## 6. The two surfaces that change behaviour the moment WAIVED is reachable

Found by the 723-C audit. Both change with ZERO code edit, silently and untested, the instant a
WAIVED promise can exist. Neither may be left accidental.

**`bridge/trust.ts:68`, the attention row. A DEFECT B.7 CREATES, SO B.7 FIXES IT.** The row is
gated on `promise.outcome === 'SATISFIED' || promise.outcome === 'BROKEN'`, so a waived promise
mints no `promiseOutcome` attention row at all. The player who successfully negotiates a waiver
would get LESS feedback than the one who let the promise break, which inverts the incentive the
feature exists to create. No wire change is needed: `promiseOutcome` is an existing attention
cause and the reason is free text.

**`bridge/industry.ts:136`, the public activity fold. A PRODUCT CHOICE, AND B.7 MAKES IT
EXPLICIT.** The fold filters to `p.outcome==='SATISFIED'||p.outcome==='BROKEN'`, so a WAIVED
receipt matches nothing and is dropped at `:141`. That silently falsifies the module's own stated
invariant two lines above it (`:133-134`, "one PUBLIC activity per exact outcome receipt").

RECOMMENDATION, and B.7 proceeds on it: **do not announce a waiver in the public feed.** A waiver
is a private renegotiation between one studio and one person, and promise terms are private to
their issuer throughout this codebase (`promiseHistoryFor` publishes only promises the VIEWING
studio issued). Announcing "Studio X negotiated its way out of its promise to Y" would publish the
existence and direction of a private settlement to every rival.

Under that recommendation the fold's behaviour is CORRECT and the code does not change, but the
comment at `:133-134` MUST be corrected to name the exclusion, so the outcome is a decision on the
record rather than an accident that happens to read well.

**This is where the "no projection step" claim actually rests.** The promise-history row already
admits WAIVED on the wire, so B.7 compiles with projection 49 either way. But
`bridge/schema/industry-schema.ts:147` closes `outcomeKind` to
`optional(enumeration(['promiseKept','promiseBroken']))`, and there is no legal third value. So the
OTHER choice, announcing waivers publicly, WOULD need a projection bump to widen that enum. B.7
needs no projection step because of the recommendation above, not because the question did not
exist. The first draft of this record claimed otherwise and was wrong in its reasoning while right
in its conclusion.

## 7. Excluded, each with its owner

- **Rival waiver policy: RECORD-ONLY**, the R3 pattern. Rivals do not waive in B.7. A rival
  waiver would need its own achievability policy and would be invisible to the player anyway,
  since another studio's promise terms are never disclosed.
- **The retirement-moot branch: P14C.** A promise made moot by the person's own retirement or
  profession transition settles `VOIDED`, not `WAIVED`, and `VOIDED` has no producer until
  P14C exists (645-A §3, and `promises.ts:708-710` records the same).
- **The bridge intent and any read model: the slice AFTER B.7**, on the B.5 → B.6 rhythm. B.7
  lands the engine law with no WIRE change, meaning no schema or projection move. It does edit
  `bridge/trust.ts` per §6, because that defect is one B.7 itself creates. The waiver reaches a
  player surface next.
- **Trust consequence of a waiver: NOT INVENTED HERE, a different question from §6.** `trustDrivers` (`promises.ts:822`)
  enumerates five driver kinds and `WAIVED` is not among them, so a waived promise contributes
  no driver and moves no label. Whether it SHOULD is a product question for the slice that owns
  trust text, not a gap B.7 fills by guessing.

## 8. Order of work

1. **T0. DONE**, record 722, nine fixtures at `152ee9a4`, every hash re-verified by the parent
   against the files on disk. Mint genuine outgoing **V31** fixtures before any source change, per the plan's
   standing rule. Record both identities the B.5 precedent records: the HEAD the mint ran at,
   and the last BEHAVIOURAL V31 writer, which is `caa8cdb3` (B.5-T moved
   `RELATIONSHIP_FAILURE_DELTA` 4 → 5, and that changes edge values inside a V31 save).
   `src/core/save.ts`'s own last writer is `f5310afb`; record both, as 645-A did for V30.
2. **Audit. DONE**, record 723-C, verdict REFINE, this record amended in place (§10).
3. **T1.** Test-author writes and RUNS the requirement suite. RED for the stated reason.
4. **W.** sim-core lands `waivePromise`, `waiverAccepted`, the V32 save step and the migrations.
5. **Close.** Pre-registered prediction, then full core on fixed source, then the checkpoint.

Maximum two specialists concurrently. The parent owns runtime and publication.

## 9. Standing qualifications carried into B.7

The UI project is NOT a usable regression baseline and B.7 makes no UI-affecting claim
(record 719, FU-1). Unity remains unverified. The 24 inherited core failures remain the baseline
and B.7 neither clears nor adds to them.

## 10. Amendment log

This record was written by the parent from reading the source, then audited read-only before any
implementation, per the plan's standing rule that an expansion is audited before its slice begins.
The audit is record 723-C and its verdict was REFINE. Every finding below was re-verified by the
parent against the source before being accepted; none was taken on the auditor's word.

| finding | what it was | disposition |
| --- | --- | --- |
| the `reclassifyPromise` citation | the first draft pointed the writer at it as "a working shape to copy" for judging the substitute's achievability | ACCEPTED, and it is the sharpest finding in the set. Copying it would have made both contract-fit refusals tautological for the one promise that has never been checked against a contract. §3 now names the trap and §2 item 4 states where the interval comes from. The parent wrote the defect |
| `feasibilityReceipt` unstated | mandatory exact-key field (`:1012`, validated `:1047-1061`), never named as a required output of the substitute | ACCEPTED. §2 item 5. A writer could have satisfied every original item and met a save-validator crash |
| no `evaluable()` guard | nothing refused waiving a terminal or an unbound promise | ACCEPTED. §2 item 3, with both halves and their separate reasons |
| `progress`/`evidenceRefs` disposition | undecided, and `settle()`'s `Partial` means existing callers disagree | ACCEPTED. §2 item 8, preserve, which is what §5 (c) already depended on |
| identical-substitute refusal | unaddressed; passes every strength and count test at equality | ACCEPTED. §2 item 6 |
| `outcomeCause` and `requirePromiseRoots` | unstated conventions the record named for every other branch | ACCEPTED. §2 items 9 and 1 |
| the save step's shape | correct, but less specific than the codebase's real `projectXPreVN` convention | ACCEPTED. §2 item 11 now names the helper shape and both precedents |
| "NO PROJECTION STEP" | true for the promise-history row, but two other bridge surfaces change behaviour with no code edit once WAIVED is reachable, and one of them can only be fixed properly by widening a closed enum | ACCEPTED as the most consequential correction. New §6. The conclusion survives, the reasoning did not: B.7 needs no projection step because of a stated recommendation, not because the question did not exist. The claim was published into the five header files before the audit and is corrected there too |
| (a) and (b) were not real product choices | mask inclusion is forced by the module's single-authority rule; freeze re-classification cannot reach a substitute that has no proposal | ACCEPTED. §5 restates both as constraints. Only (c) goes to the Owner. Sending a settled matter up as an open question wastes attention as surely as deciding a real one alone |
| line ranges in the §3 table | three ranges overshot by one or two lines | ACCEPTED, trimmed |
| 645-A's own subset notation | its shorthand reads backwards as literal set notation, though its intent matches | ACCEPTED as a note in §4. 645-A is not amended; this record is the unambiguous source |

The audit could not verify the commit shas in §8, having no git access. The parent verified them.
