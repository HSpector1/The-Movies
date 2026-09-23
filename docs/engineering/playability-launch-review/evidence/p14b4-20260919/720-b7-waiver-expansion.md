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
   two refusals at `:406-409`. The SAME draft sets `promiseId` to the ORIGINAL's id, so the
   promise being waived does not count as a competing reservation against its own replacement
   (`:289-297`, `:206-207`). Both points are in §3, which is where a writer is most likely to go
   wrong, and getting either wrong fails silently.
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
16. A REFUSED waiver leaves the original promise AND the game state UNCHANGED, and the refusal is
    published. Owner requirement: an otherwise achievable substitute whose window ends beyond the
    contract is "cleanly refused, with the original promise and game state unchanged, not accepted
    and rejected later during saving." The RED proves the refusal AND the non-mutation, because a
    `waivePromise` that refuses after already appending a receipt or touching a promise row passes
    a refusal test and still corrupts the save.
17. The substitute starts at `progress: 0` with `evidenceRefs: []`. Owner requirement under §5 (c):
    do not erase completed work, and do not count it again. **CORRECTED after W's first pass: a
    clean mint does NOT discharge the second half.** This item originally claimed the original's
    takes "do NOT become retroactively eligible", which was false. `qualifyingTakes`
    (`promises.ts:637-641`) rejects a take only when `take.week < windowStartWeek`, so a take AT
    the window's first week qualifies and the next weekly pass credits it. Measured: a substitute
    minted clean at `progress: 0` was SATISFIED one tick later by the very picture that gave the
    original its progress. See item 19, which is the law that closes it.
19. **THE LAW.** `waiverAccepted` REFUSES when `substitute.windowStartWeek <= waiverWeek`, with its
    own stated reason. This item did not exist until W measured the exploit above; the law lived
    only in the T1 suite and brief 732 while no numbered item carried it, which W reported. A
    substitute is a FORWARD obligation.

    The narrower alternative, refusing a window that already CONTAINS a qualifying take, was
    offered and NOT taken: a take scheduled to land later in the same week would still be credited
    to a window opening at `waiverWeek`, so the scan closes the instance and the comparison closes
    the class. One comparison, no scan over `firstTakes`.

    ORDERING: `identicalSubstitute` is checked BEFORE this law, so an identical substitute returns
    the identical-substitute sentence and THE LAW's sentence stays reserved for the exploit shape.
    That matters because the two overlap, and a follow-up asserts WHICH reason each refusal gives.
18. The waiver's attention row says WAIVED, not "kept" and not "broken". `bridge/trust.ts:69` is a
    two-way ternary with no third arm, so widening the gate at `:68` without touching `:69` reports
    a breach that did not happen. The RED pins the ROW TEXT, not merely the row's existence.

## 2a. Three interface interpretations the RED made, which the writer follows or gets ruled

T1 named these rather than assuming them silently, on the 654-T precedent. 720 does not pin the
interface literally, so the suite had to choose. The writer FOLLOWS them. A divergence is not
forbidden, but it needs a recorded ruling rather than a quiet rename, because the suite is the
requirement and renaming under it would make a green run meaningless.

- **I1.** `waiverAccepted` returns `string | null`, a reason or nothing, per §2 item 2.
- **I2.** The substitute draft mirrors `PromiseAttachment` in shape.
- **I3.** The save functions are `convertV31ToV32` and `convertV32ToV31`, following the
  one-version-ago naming this codebase already uses at every prior step.

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

### The SECOND trap, found by T1 authoring against the real engine

Neither the parent nor the 723-C audit caught this, and 720 said nothing about it either way. It is
not a false claim in this record; it is a silence of exactly the shape that made the first trap
dangerous.

**The original promise double-charges its own replacement unless the substitute's draft excludes
it.** `activePromiseReservations` (`promises.ts:289-297`) filters competing reservations with
`promise.promiseId !== draft.promiseId`, and `reservedByActivePromises` (`:300-303`) sums
`max(0, promise.predicate.count - promise.progress)` over whatever survives. The original is an
open bound promise for the same person over an overlapping window, so it survives that filter
unless the draft names it, and the quantity it contributes is `count - progress`: **exactly the
remaining obligation the Owner's approved rule requires the substitute to cover.** The original
books the capacity its own replacement needs.

Measured by T1 against the real engine, not reasoned: every happy-path acceptance candidate in the
requirement suite reads `FRAGILE — needs a picture not yet commissioned` instead of
`REASONABLY_ACHIEVABLE` until the exclusion is applied.

`PromiseDraft.promiseId` already exists for this, and its own doc comment (`:206-207`) states the
purpose in plain words: "Set when an ALREADY-MINTED promise is re-classified, so the service does
not count the promise against itself as an active seat reservation." It was written for
`reclassifyPromise`, where the draft and the excluded promise are the same record. The waiver uses
the SAME field for the same reason with one difference worth stating, because it is where a writer
could get it backwards: the draft is the SUBSTITUTE's, and the id to exclude is the ORIGINAL's.

That is correct rather than a convenience. The original is about to settle WAIVED in the same step,
so its reservation is about to be released; judging the substitute while still counting it
double-books capacity that is being freed.

**Both traps in this slice have the same anatomy.** A documented helper or field, written for a
neighbouring caller, whose correct use by the waiver differs in one detail that nothing enforces.
Get either wrong and the code compiles, the tests a careless author would write pass, and the
failure surfaces far away: the first as a save-validator crash, the second as an achievable
substitute refused for a reason that names the wrong bottleneck.

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

## 5. What is settled by existing law, and what the Owner decided

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

**(c) What count must the substitute carry? DECIDED BY THE OWNER, 2026-09-23.** Approved verbatim:

> Approve the remaining-obligation rule: a substitute must cover at least the original's unfulfilled
> qualifying count, without erasing completed work or counting it again toward the substitute.

So `substitute.predicate.count >= original.predicate.count - original.progress`. The approval
carries TWO constraints beyond the comparison, and the second was not in the parent's own
recommendation:

- **Do not erase completed work.** The original keeps its `progress` and `evidenceRefs` when it
  settles WAIVED, which §2 item 8 already required.
- **Do not count it again.** The substitute starts at `progress: 0` with `evidenceRefs: []`. The
  original's qualifying takes must NOT be swept into the substitute at mint, and must not become
  eligible for it retroactively. A three-picture promise served once, waived for a two-picture
  substitute, requires TWO FURTHER qualifying appearances. Six in total would be double-charging
  and one would be double-crediting; the rule is neither.

**(d) Does the public feed announce a waiver? DECIDED BY THE OWNER, 2026-09-23, as the parent
recommended.** Private confirmation without a public Industry announcement. The Owner attached two
qualifications, both adopted:

- **Preserve the existing public kept/broken announcements.** B.7 does not touch them. The Owner's
  reasoning is the correction the parent had already made to itself: private terms do not make
  every outcome private, and those public outcomes are deliberately distinguished in the bridge.
- **The issuing player must get an accurate waiver confirmation and keep accessible history,
  without the waiver being mislabelled "kept" or "broken".** That is the companion's "recorded and
  visible" (`:379`), and the sweep in §6 shows exactly where it lands: `promiseHistoryFor` already
  publishes it correctly and viewer-scoped, and `bridge/trust.ts:69` is the one place that would
  mislabel it. See §6's mislabel hazard, which is precisely this failure mode.

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

CORRECTED BY THE PARENT, after checking its own premise. The first version of this section
recommended silence on the ground that "a waiver is a private renegotiation, and promise terms are
private to their issuer throughout this codebase". The second half of that is true:
`promiseHistoryFor` (`bridge/promises.ts:100-102`) filters on `promise.issuerStudioId !==
viewerStudioId`, so a rival never sees another studio's promise terms. It does not support the
conclusion. **The fold publishes no terms. It publishes an OUTCOME, and outcomes are ALREADY
public for every studio**: `bridge/industry.ts:135-137` carries no studio filter at all, and
`:146` emits "Studio X kept its promise to Y" and "Studio X broke its promise to Y" by name, for
rivals as readily as for the player. Suppressing a waiver is therefore not a privacy decision at
all. It is a decision about whether one outcome is public when its two siblings are.

So this is the SECOND genuine product choice in the slice, not a settled matter. Both readings are
defensible and the parent proceeds on the recommendation without pretending the question is closed.

**RECOMMENDED AND ADOPTED: do NOT announce.** A break is a public failure; a waiver is an
agreement that the person accepted, so there is no breach to report. The obvious objection is real
and is stated rather than hidden: silence creates an ASYMMETRY in which a studio about to break a
promise waives instead and the public record stays clean, which is reputation laundering. What
bounds it is the waiver's own three conditions. A studio that has already broken promises reads
`Distrusted` and cannot waive at all, and a studio with nothing achievable to offer cannot either,
so the escape hatch is closed to exactly the studios that would most want it.

**Cost of the other reading, so the Owner can price it.** Announcing needs a third `outcomeKind`,
which widens a closed enum and is a projection step, 49 → 50, carrying its own hard ordering
constraint: mint `genuine-projection49-runtime` BEFORE anything touches `PROJECTION_VERSION`, as
45, 46, 47 and 48 all were. That is roughly a day of T0 and sweep work, not a line change.

Under the adopted recommendation the fold's behaviour is CORRECT and the code does not change, but
the comment at `:133-134` MUST be corrected to name the exclusion, and the RED must PIN that a
waived promise produces no public activity. Otherwise the decision survives only as an accident
that happens to read well, and the next person to touch that filter will "fix" it.

**This is where the "no projection step" claim actually rests.** The promise-history row already
admits WAIVED on the wire, so B.7 compiles with projection 49 either way. But
`bridge/schema/industry-schema.ts:147` closes `outcomeKind` to
`optional(enumeration(['promiseKept','promiseBroken']))`, and there is no legal third value. So the
OTHER choice, announcing waivers publicly, WOULD need a projection bump to widen that enum. B.7
needs no projection step because of the recommendation above, not because the question did not
exist. The first draft of this record claimed otherwise and was wrong in its reasoning while right
in its conclusion.

### The projection claim, settled by ENUMERATION rather than by one observation

The Owner required that "no projection step" be confirmed across the affected consumers and
schema, not rested on the fact that `WAIVED` already exists in one enum. Every consumer of a
promise outcome in `bridge/` and `ui/`, swept and dispositioned:

| consumer | what it does with an outcome | disposition |
| --- | --- | --- |
| `bridge/promises.ts:112` `promiseHistoryFor` | passes `promise.outcome` through with NO allowlist | PUBLISHES WAIVED ALREADY, no change. Viewer-scoped to the issuer (`:100-102`), which IS the companion's "recorded and visible" and the Owner's private confirmation |
| `bridge/promises.ts:114` | `outcomeCause` through, schema `nullable(text())` | carries the waiver's reason verbatim, no change |
| `bridge/trust.ts:64` `promiseDue` | gated on `outcome === null` | CORRECT BY CONSTRUCTION: a waived promise stops generating due reminders the moment it settles |
| `bridge/trust.ts:69` `promiseOutcome` | gated on `SATISFIED \|\| BROKEN` | DEFECT, B.7 fixes. See the mislabel hazard below |
| `bridge/industry.ts:135-145` public fold | filters to `SATISFIED \|\| BROKEN` | EXCLUDED BY DECISION (§6). Code unchanged, comment corrected, exclusion PINNED |
| `bridge/contract.ts:443-519` | its `outcome` is the command envelope `{ok, error, next}` | NOT a promise outcome. Unaffected |
| `bridge/supervisor/supervisor.ts:840` | `LifecycleOutcome` | unrelated symbol. Unaffected |
| `ui/src/**` | two prose comments in `Dashboard.tsx` using "promised outcome" as English | **NO UI CONSUMER OF A PROMISE OUTCOME EXISTS.** Nothing to change |
| schema `bridge-schema.ts:2331` | `nullable(enumeration(PROMISE_OUTCOMES))` | already admits WAIVED |
| schema `industry-schema.ts:147` | `outcomeKind` closed to `promiseKept`/`promiseBroken` | the ONLY closed enum in the set, and the only thing the excluded reading would have to widen |

**Exactly two surfaces need attention and there is no third.** The claim now rests on that
enumeration.

**THE MISLABEL HAZARD, found by the sweep and exactly what the Owner warned against.**
`bridge/trust.ts:69` does not merely omit a waiver. Its row text is
`promise.outcome === 'SATISFIED' ? 'kept' : 'broken'`, a two-way ternary with no third arm. A
writer who widens the gate at `:68` to admit WAIVED and does not touch `:69` publishes a waived
promise to the player as **"broken"**, which is worse than the silence it replaced: it reports a
breach that did not happen, against a settlement the person accepted. The gate and the ternary
must move together, and the RED pins the ROW TEXT, not merely the row's existence.

## 7. Excluded, each with its owner

- **Rival waiver policy: RECORD-ONLY**, the R3 pattern. Rivals do not waive in B.7. A rival
  waiver would need its own achievability policy and would be invisible to the player anyway,
  since another studio's promise terms are never disclosed.
- **The retirement-moot branch: P14C, and WHICH outcome it settles as is OPEN.** The first draft
  asserted it settles `VOIDED`, not `WAIVED`. The companion does not say that. Its WAIVED row
  (`:379`) lists "the person's own announced retirement or profession transition makes the promise
  moot" as an acceptance branch, and its VOIDED row (`:381`) lists the SAME cause. The companion is
  genuinely ambiguous and B.7 implements NEITHER branch, so B.7 need not resolve it. P14C must, and
  it inherits an ambiguity rather than a rule. Recorded so P14C is not surprised by it.
- **The bridge intent and any read model: the slice AFTER B.7**, on the B.5 → B.6 rhythm. B.7
  lands the engine law with no WIRE change, meaning no schema or projection move. It does edit
  `bridge/trust.ts` per §6, because that defect is one B.7 itself creates. The waiver reaches a
  player surface next.
- **Trust consequence of a waiver: SETTLED BY THE COMPANION, not deferred.** The first draft called
  this an open question for a later slice. It is not. `P14-PREPARATION-COMPANION.md:379` gives
  WAIVED a trust effect of "none; recorded and visible", and ruling S11 (`:568`) says a mutual
  waiver carries no penalty. The engine already agrees by construction: `trustDrivers`
  (`promises.ts:822`) enumerates five kinds and none is a waiver, so a waived promise contributes
  no driver and moves no label WITHOUT B.7 writing anything. What the companion additionally
  REQUIRES is the "recorded and visible" half, which is why §6's attention row is a defect B.7
  must fix rather than a nicety. Third time this record mis-sorted a settled matter; see §10.

## 8. Order of work

1. **T0. DONE**, record 722, nine fixtures at `152ee9a4`, every hash re-verified by the parent
   against the files on disk. Mint genuine outgoing **V31** fixtures before any source change, per the plan's
   standing rule. Record both identities the B.5 precedent records: the HEAD the mint ran at,
   and the last BEHAVIOURAL V31 writer, which is `caa8cdb3` (B.5-T moved
   `RELATIONSHIP_FAILURE_DELTA` 4 → 5, and that changes edge values inside a V31 save).
   `src/core/save.ts`'s own last writer is `f5310afb`; record both, as 645-A did for V30.
2. **Audit. DONE**, record 723-C, verdict REFINE, this record amended in place (§10).
3. **T1. DONE**, record 725-T, with its published IDENTITY corrected by record 727.
   `tests/p14b7-promise-waiver.test.ts` as committed is sha256 `68c76efe…`, 619 lines,
   **27 failed / 2 passed (29)**. 725-T and the first header publication named `bf5fb83a…`,
   573 lines, 26/2 (28): the suite grew by one case, for the Owner's approved
   remaining-obligation rule, between the hand-back and the commit, and the parent published a
   hash taken before a message that resumed the agent. Attribution re-verified ON THE COMMITTED
   BYTES: 108 "RED premise" guards and ZERO non-premise errors.
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

### A later correction, found by the parent checking its own premise

§6's first version recommended that the public feed stay silent about a waiver, on the ground
that promise terms are private to their issuer. The second half is true and the conclusion did not
follow from it. The fold publishes no terms; it publishes an OUTCOME, and `bridge/industry.ts:135-137`
carries NO studio filter, so "Studio X kept its promise to Y" and "Studio X broke its promise to Y"
are already public for every studio by name. Suppressing a waiver is not a privacy decision. It is a
decision about whether one outcome is public when its two siblings are.

The recommendation survives and its BASIS is replaced, the objection to it is now stated, and the
question is promoted to the second genuine product choice rather than presented as settled. This
was the parent's error twice over: first in §6 as written, then in publishing that reasoning into
the five header files before checking it. It is corrected in both places. The same audit that
caught §6's original omission did not catch this, and neither did the parent until it went to
verify a sentence it had already shipped.
