# 765 — the Current Ops C.1 focused review, and what it changes

Packet `OPUS-C1-FOCUSED-REVIEW`, sha256
`4436ca9ede3978df9f57f074c09376e3722f3b82819fe255a13679293b3743e6`, verified against its own manifest.
Reviewed checkpoint `cb20ab16`, which is exactly the published head at the time.

**What the packet is, stated in its own words so nobody reads it as more:** read-only inspection of
the API contract, the prediction, the C.1 test file and the `enterRival` source. No local
implementation was examined and no repository test was executed by Current Ops. **These are not
reproduced defects in the writer's still-unpublished implementation**, and this record does not
present them as any.

All three items are correct. Two land on gaps in work I had already reviewed and accepted.

## 1. The anchor must keep its fraction, and TWO RED cases are blind to that

**The finding.** Section 13 asserts `row.ageAtEntry === person.age` in both the `createTalent` case
and the `enterRival` case. Under contract 762 that equality is FALSE for any fractional entrant:
`ageAtEntry` holds the exact pre-floor age while the committed `person.age` is `floor(ageAtEntry)`,
because validator condition 2 requires it.

**Independently confirmed by the parent, and it is worse than a weak assertion.**
`tests/p14c1-materialized-aging.test.ts:664` creates its person at **age 41**, an integer. So the
case cannot distinguish an exact anchor from a floored one and passes either way. The equality does
not merely fail to test the fraction: it actively pushes a writer toward flooring the anchor to make
the test green, which destroys the two things the anchor exists for — a lossless downgrade, and
birthdays spread across the year.

This is a hole in a RED I verified. I checked it for skipped cases, `.only`, and vacuous assertions,
and I did not check its expectations against the contract's own floor rule.

**Disposition.** The test author reconciles both cases against 762 and the real append path, using a
known fractional entrant with an independently established input: provenance records the post-clamp
pre-floor age, the stored age is its floor, and the birthday is verified against the ACTUAL entry
week. A lawful entrant at 29.75 reads 29 and crosses at +13 weeks, never +52. Real rival clamp rules
are preserved and `ageAtEntry` is NOT forced to an integer to satisfy the current equality.

**The second half of item 1, which is a production hazard rather than a test one.**
`src/core/hollywood.ts:224` prices with `offerForTalent(state.seed, person, 208, week)` off the LOCAL
`person`. If the floor lands later, the contract is priced off an age the world never stores. The
writer was told, without interrupting the implementation, to make the committed person value the one
every downstream consumer sees.

## 2. A manually reconstructed sequence is not tick evidence

**The finding.** Section 7's second test, labelled MEASURED, calls `materializeAges` by hand and
builds `tailState` before calling `publicPriorityOrder`. It can pass even if the real tick settles
with the OLD age and materializes afterward. Section 7's first test proves the external before/after
preference, which is real, and says nothing about in-tick consumer order.

**The author reported this limit themselves** and I recorded it; the packet is right that the label
on the test does not carry it. Worse, the test's stated conclusion — that an in-tick observable
already sees the new age for the tick that PRODUCES the crossing week — is a prediction derived from
the contract's own wording, and contract §10 puts materialization at the tick TAIL, after settlement.
**The likely truth is the opposite of what the test asserts.**

**Disposition.** Keep the component test, relabel its scope honestly. During integration
verification, exercise the ACTUAL tick across the 30 boundary with the real market consumer, so the
result distinguishes the two orderings. Reuse a lawful fixture or a bounded arrangement; never
rewrite a genuine old fixture; do not reorder unrelated tick stages or change market policy for
convenience. **If real settlement ordering cannot be exercised in this slice, name that exact gap
rather than letting the reconstruction stand in for it.**

## 3. Record 764 predicts repricing; it excuses no individual failure

**The finding.** 764 predicts economic differences and does not establish any one failure's cause.

This is a fair correction to how that record could be used. 764 says the writer adjusts nothing and
that re-pinning belongs to a test author, which is right; it does not say what makes an individual
change justified, which is the part that matters when the run produces a long list.

**The standard, adopted.** Before any expected value changes: identify the FIRST changed age, the
legitimate pricing or preference consumer it reaches, and the resulting downstream effect. Preserve
ledger conservation, already-committed contractual terms, historical receipts, exact identities and
frozen-corpus expectations. **Do not classify by filename.** An unrelated test can depend
transitively on aging, and an age-related test can still expose a real defect. Writer reports;
the test author owns justified expectation changes; goldens are never refreshed wholesale.

**A standing obligation this creates.** If a justified regression changes 764's predicted counts, the
PREDICTION is corrected transparently, in the open, **before the affected run** — never the tests, to
preserve a count. Recorded here so that obligation exists before the run rather than after it.

## Sequencing

Applied at the writer handback, per the packet. No implementation restarted, no test interrupted, no
work reset, no general audit opened. The writer received one non-disruptive note, because leaving
them to implement against the defective equality in item 1 would have cost the exact thing item 1
exists to protect. Existing specialists, separate file ownership, at most two, one production writer,
heavy checks serialized. Unity/native acceptance remains deferred.

---

## CORRECTION to §2 — "the tick tail" is NOT "after settlement", and I over-extended the finding

**What I wrote is false.** §2 above says contract §10 "puts materialization at the tick TAIL, after
settlement", and concludes "the likely truth is the opposite of what the test asserts". Neither
statement is supported by the source.

**Read at `src/core/tick.ts`, the clock advance is not the last thing the function does.** The
`finalized` object carries `market: { ...state.market, tick: currentTick + 1 }`, and after it the
function still runs, in order:

1. the scheduled rival-entry loop (`enterRival`, against `finalized.market.tick`)
2. `appendFirstTakes(finishHollywoodWeek(finishTechnologyWeek(finalized)), …)`
3. `advanceRelationshipsWeek(withTakes, …)`
4. the terminal line, `return advanceTalentMarketWeek(advancePromisesWeek(withBonds))`

**Market settlement is step 4.** So materialization placed at the clock-advance location runs BEFORE
settlement, provided the materialized people flow into those later calls, which they do because each
step takes the state forward. The in-tick market consumer in the tick that PRODUCES the crossing week
therefore does see the new age, which is what the RED's reconstruction asserted.

**I also over-extended the original finding.** It was that the manual reconstruction does not PROVE
the ordering. It was never that the expected result must be backwards. I turned a statement about
insufficient evidence into a claim about the answer, which is the same error in the opposite
direction — and it is the error that would have led a test author to reverse a correct expectation.

**What stands unchanged.** The reconstruction still proves nothing about the real tick, because it
calls `materializeAges` by hand and builds `tailState` rather than running `tick()`. The disposition
is unchanged: relabel the component test honestly, and settle the ordering with a real boundary test
against the actual tick and the actual market consumer. **No simulation stage is reordered and no
expectation is reversed on either assumption.** The writer's implementation and that test decide it.

## CORRECTION to §1 — two anchor kinds, two different protections

I told the writer that preserving the fraction is "what makes the downgrade lossless and what spreads
birthdays across the year". That conflates two protections that belong to different row kinds.

- **`legacy_age_anchor`, written by the migration:** the exact fraction protects birthday timing AND
  the permitted lossless `V32 → V33 → V32` round trip, because the original bytes are recoverable only
  from the unrounded value.
- **`authored_exact_week`, written at a new entry:** the exact fraction protects **birthday timing
  only**. A fresh V33 campaign carries these rows and contract §6's predicate admits only
  `legacy_age_anchor`, so it is already excluded from the downgrade. There is no round-trip claim to
  make about a new entrant, and stating one would be a second wrong expectation.

Both kinds must keep the fraction. The reasons are not the same reason, and §12 F3 already said so.

## The corrected test derives its anchor from the INPUT, never from the output

Carried from the same correction, because it is what stops the test and the implementation losing the
fraction together and agreeing: the expected anchor comes from the **known input after legitimate
clamps and before flooring**, not from the already-floored person the append returns. For a new
entrant at 29.75, prove the anchor reads **29.75**, the stored age reads **29**, and the birthday
falls **13 weeks after the actual entry week**. Verify separately that the pricing path consumed the
committed age.
