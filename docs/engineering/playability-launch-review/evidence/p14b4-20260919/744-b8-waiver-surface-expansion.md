# 744 — P14B.8 THE WAIVER'S PLAYER SURFACE: task expansion (draft; audit before it begins)

Parent-authored at HEAD `4a268feb`, the published B.7 closeout. Follows the 720/723-C precedent:
an expansion is written, then independently audited, then the slice begins. Owner direction for this
slice arrived with the B.7 acceptance and is quoted in §2.

Every claim below marked VERIFIED was read out of the source at `4a268feb` in this session, with the
file and line recorded. Claims marked HYPOTHESIS are for the audit to rule on.

---

## 1. The player behaviour this slice adds

B.7 gave the engine a second road out of a promise the studio can no longer keep: offer the person a
substitute, and on acceptance the original settles `WAIVED` while the substitute binds to the same
employment contract in the same step. Today a player cannot reach that road. It exists only as a
TypeScript function call.

B.8 puts the road in front of the player, as one connected interaction:

> select an open promise → propose a substitute → receive an accurate quote or the specific refusal →
> confirm → see the original marked WAIVED and the replacement recorded.

Nothing about the waiver LAW moves in this slice. `waiverAccepted`'s nine refusals, the
remaining-obligation rule the Owner approved, the private disposition, the untouched public kept and
broken announcements: all of that is B.7's, already verified and published, and B.8 carries it
without amendment. What B.8 adds is a way to ask, an accurate answer, and a record the player can
read afterwards.

## 2. Completion condition

Taken from the Owner's B.8 direction and made checkable:

1. A player can propose a substitute for a named open promise through the bridge, without any
   client constructing engine state.
2. A substitute the person would refuse produces an ACCEPTED quote carrying `ok: false` and the
   engine's own refusal sentence verbatim, and the original promise and the whole game state are
   unchanged.
3. A substitute the person would accept produces an ACCEPTED quote carrying `ok: true` and one
   registered commit intent.
4. Confirming that intent settles the original `WAIVED` and binds the substitute, in one accepted
   command against one state revision.
5. After the confirmation, the player's own promise history shows the waived original, shows the
   replacement, and shows which replaced which.
6. No waiver reaches any public Industry surface. The existing public kept and broken announcements
   are untouched.
7. The interaction cannot waive twice and cannot accept an outdated offer: a replayed intent, a
   stale revision and a moved board each fail closed, without charging or settling anything.
8. A save taken after the waiver reloads with the original still `WAIVED`, the substitute still
   bound, and the link between them intact.

## 3. What already exists, verified rather than assumed

Four facts settle most of the surface before a line is written. Each was read at `4a268feb`.

**(a) A WAIVED row already reaches the player's history today, at projection 49.** VERIFIED:
`bridge/promises.ts:93-118` filters on issuer, beneficiary and `contractId !== null`, and on nothing
else. There is no outcome filter, so a settled `WAIVED` promise is already a row, carrying
`outcome`, `outcomeWeek` and `outcomeCause`. The wire already admits the value: `PROMISE_OUTCOMES`
at `bridge/schema/bridge-schema.ts:1770` has carried `'WAIVED'` since before B.7 (established at
`152ee9a4` during the B.7 audit). So completion condition 5 is two thirds satisfied by existing
code, and the audit should hold the writer to adding only the missing third.

**(b) The missing third is the LINK.** A player looking at their history sees a promise marked
waived and a second promise that appeared from nowhere. Nothing on the wire says the second replaced
the first. The fact exists in the save: `supersededByPromiseId` on the waived original, the V32
delta (`src/core/types.ts:2296-2302`). Projecting it is the whole of B.8's read-model change.

**(c) Refusal-as-an-accepted-answer is an established pattern, not an invention.** VERIFIED across
five families in `bridge/session.ts:1764-1950`: placement, Set commission, contract, market proposal
and, for promises specifically, `promiseQuoteSnapshot` at `bridge/promises.ts:125-150`. In each, an
illegal draft returns an ACCEPTED quote with `ok: false` and the engine's own sentence, and registers
no commit intent. A refusal is never a protocol rejection. B.8 follows this and invents nothing.

**(d) The three protections against waiving twice already exist, generically.** VERIFIED in
`bridge/session.ts`:

| protection | mechanism | line |
| --- | --- | --- |
| stale revision | `command.expectedStateRevision !== this.revision` → `STALE_REVISION` | 1562 |
| moved board | `pending.stateDigest !== authoritativeDigest(this.state)` → intent unresolvable | 1628 |
| replayed intent | `this.pendingQuotes.clear()` after every accepted command | 1613 |
| replayed command id | `priorResponse('command', …)` returns the first response | 1560 |

B.8 does not build these. B.8 must PROVE them for this family, which is a test obligation, not an
implementation one. The audit should reject any writer plan that adds a waiver-specific duplicate
guard on top of machinery that already fails closed.

## 4. What B.8 actually adds

Four changes, and the audit should hold the writer to exactly these.

1. **A quote family.** `quoteWaivePromise` request; `StudioPromiseWaiverQuoteSnapshot` answer,
   shaped on `StudioMarketProposalQuoteSnapshot` (`bridge-schema.ts:2062`): `intentId`, `kind`,
   `commitLabel`, `ok`, the refusal sentence, the echoed substitute terms, `consequence`.
2. **A commit arm.** A `promiseWaiver` family in `pendingQuotes` and in `quotedIntentFor`
   (`session.ts:1618-1690`), with the fail-closed revalidation arm every other family has: a
   substitute that is no longer accepted at commit refuses, settles nothing and charges nothing.
3. **One read-model field.** `supersededByPromiseId: nullable(nonEmptyText())` on
   `StudioMarketPromiseHistoryRow` (`bridge-schema.ts:2320`). One field, three carriers, which all
   reference the same row type: `StudioMarketCaseSnapshot.promiseHistory` (`:2410`),
   `StudioMarketHistory.promises` (`:2523`), `StudioPersonProfileSnapshot.promises` (`:2650`).
4. **The projection bump**, 49 → 50, with the T0 ordering in §7.

## 5. Five traps, named so the writer does not walk into them

**Trap 1: the refusal sentence must come from `waiverAccepted`, never from catching
`waivePromise`.** `waivePromise` throws `promises: this person did not accept the substitute — <reason>`
(`src/core/promises.ts:992`). A quote path that calls the verb inside a `try` and publishes the
caught message ships the engine's namespace prefix to the player, and asks a mutating verb a
read-only question. `waiverAccepted` (`:917`) returns the bare sentence and mutates nothing. That is
the quote's source. The commit path calls `waivePromise`.

**Trap 2: the bridge must not re-derive the contract window.** The Owner's B.7 amendment requires a
substitute to be checked against the real employment contract and the time remaining, and requires an
otherwise-achievable substitute that ends beyond the contract to be cleanly refused rather than
accepted and rejected later during saving. That check is already inside the engine: rule 9 evaluates
`substituteDraft(promise, substitute, interval)` against the contract interval
(`src/core/promises.ts:954-957`). A bridge that computes its own window comparison will drift from
the engine's and produce a quote that disagrees with the commit. The bridge passes the draft through
and publishes the verdict.

**Trap 3: the substitute's id does not exist at quote time.** `waivePromise` mints it as
`promise-${String(state.promises.length)}` (`src/core/promises.ts:999`), evaluated at commit against
the live promise array. Any quote field naming the substitute's future id is wrong the moment another
promise lands between the quote and the confirmation. The quote may describe the substitute's TERMS.
It must not name its id. This is a correctness trap, not a style preference.

**Trap 4: a zero-count substitute cannot reach the engine through the bridge.** VERIFIED:
`promiseDraftTerms.count` is `integer({ minimum: 1 })` (`bridge-schema.ts:1798`), so the wire refuses
count 0 before any engine rule runs. B.7's rule-7 refusal case uses count 0 and is therefore
unreachable on this surface. The Owner named exactly this case in the B.8 direction:

> Original promise: 3 appearances. Already delivered: 1. Still owed: 2. Proposed substitute: 1.
> That should fail specifically because it covers too little.

On the bridge that is not one useful case among several. It is the ONLY way rule 7's refusal can be
exercised through the player surface at all. The audit should treat it as required coverage.

**Trap 5: no fixture in the corpus can express it.** VERIFIED by decompressing all nine
`genuine-v31-pre-b7` fixtures and reading every promise: the largest remaining obligation anywhere is
1. `part-served-p1` is count 2 progress 1; every other open player-issued promise is count 1
progress 0; `kept-and-broken` holds two settled rows; the 48-promise worlds are rival-issued and out
of scope. A substitute count that is positive AND insufficient needs a remaining obligation of at
least 2, which no published fixture has. The gap is in the corpus, not in the test authoring. §7
mints the world rather than recording the case as impossible, per the Owner's instruction to preserve
disclosed untested cases without calling them impossible merely because the current fixtures lack
them.

## 6. What must not move

- **The public surfaces.** `bridge/industry.ts:148` folds only `SATISFIED` and `BROKEN` with a
  non-null `outcomeEventId`; `waivePromise` settles with `outcomeEventId: null`, so a waiver is
  excluded twice over. Both facts are B.7's, already tested in
  `tests/bridge-p14b7-promise-waiver.test.ts`. B.8 touches neither. The Owner's ruling stands:
  private terms do not make every outcome private, and the existing public kept and broken
  announcements are preserved.
- **The trust law.** `WAIVED` mints no driver and moves no label (`src/core/promises.ts:1080-1085`,
  pinned by group12 and proven by defect injection at record 743). B.8 reads trust; it does not
  touch it.
- **Save V32.** `LIVE_SAVE_VERSION` stays 32. B.8 is a wire change, not a save change. This is the
  mirror of B.7, which moved the save without moving the wire.
- **`PROMISE_RULES_VERSION`.** Stays 4. No rule changes, so the stamped law version does not move.
  (Memory rule: a plan-named rules version stamped on a partial evaluator is a plan amendment. Not
  applicable here precisely because no rule moves.)

## 7. T0: two mints, both before the projection bump

**T0a — `genuine-projection49-runtime`.** The hard ordering constraint inherited from 45/46/47/48: a
genuine OUTGOING artifact is minted while its identity is still the running one. Reproduces
`697-mint-projection48-minter.test.ts` at the current identities (projection 49, protocol 4, save
V32, rules 4, schema `sha256:60af24c5…`), with the V31→V32 comparison replacing that file's V30→V31
one. The Owner's requirement that the checkpoint carry "its actual producing commit and distinct
current/saved states" is the 48 recipe's own shape: two same-week slots with different digests.
`sha256:60af24c5…` is registered in `SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS`
(`bridge/runtime-checkpoint.ts:59`) in the same commit as the bump, never later.

**T0b — a world that owes two.** Re-runs the archived `part-served-p1` route
(`722-mint-final-v31.executed.ts.txt:224-260`) with its promise count raised from 2 to 3, under the
live V32 writer, producing a genuine bound open promise at count 3 progress 1, remaining 2. That
single world unlocks Trap 4's case and gives B.8's integration coverage a promise where a substitute
can be positive and still insufficient. HYPOTHESIS for the audit: that a count-3 draft passes
`attachPromise`'s feasibility gate on that route's 90-week window. If it does not, the mint reports
the refusal rather than tuning the world until it complies, and the case returns to the audit.

## 8. Order of work

1. T0a mint, published, provenance recorded. Projection still 49.
2. T0b mint, published, provenance recorded.
3. RED tests, independently authored against this expansion as amended by the audit.
4. Implementation.
5. Verification and publication.

Steps 3 and 4 are one specialist each, sequentially, per the standing two-specialist limit. The
parent owns every runtime invocation and every publication.

## 9. Excluded, each with its owner

| excluded | owner | why |
| --- | --- | --- |
| Unity controls for the waiver | UNITY-INTEGRATION-BACKLOG | native deferred; the B.7 entry already states the `WAIVED` runtime hazard for a C# switch handling only kept and broken |
| the `ui/` React surface | FU-1 | the `ui` suite has an open reliability finding and has not been returned; no UI-affecting acceptance claim rests on it |
| the natural waiver route | open, record-only | no fixture plays a picture forward to where a studio would genuinely need to waive; unchanged from B.7 |
| rule 3 coverage | open, record-only | every promise with a non-null `contractId` in all nine fixtures resolves to a real employment record; reaching it needs a new fixture or a forged state |
| rules 4 and 5 separation | open, record-only | an identical substitute carries a window already open at every fixture's own tick |
| the inverse link (`supersedesPromiseId` on the substitute row) | this audit | derivable by any consumer from rows it already holds; proposed NOT added. HYPOTHESIS: the audit may rule that forcing every consumer, including C#, to build a reverse index is worse than one more projected field |

## 10. Standing qualifications carried into B.8

LOGIC VERIFIED, UNITY NOT VERIFIED. No native acceptance claim, no Owner acceptance claim, no
route-fit claim. The 24 inherited full-core failures are not B.8's and are not touched. FU-2's
disposition stays open: the measured margin is recorded, the threshold was not moved, and the case
for aligning the prepared-reuse budget to the repository's own `60_000` restart convention remains a
recommendation awaiting decision.

---

## 11. Amendment log (record 745-C, and the parent's measurements)

The audit returned PROCEED WITH AMENDMENTS with ten items. The original text above is preserved
unchanged; every correction is recorded here. The parent verified each HIGH finding against the
source independently rather than adopting it on the specialist's word.

**A1 (HIGH) — §4 gains a FIFTH change: the ownership gate.** Neither `waiverAccepted`
(`src/core/promises.ts:917-959`) nor `waivePromise` (`:980`) compares the promise's
`issuerStudioId` to the player's studio; the one occurrence of that field in `waiverAccepted`
(`:951`) passes the RIVAL's id into `trustDescriptor`. `waivePromise` resolves by id alone. Promise
ids are `promise-${state.promises.length}`, sequential and enumerable. B.8 creates the first client
route to this verb, so the gate is B.8's obligation and not a pre-existing defect: the bridge
refuses a `promiseId` whose issuer is not the player's studio, at the quote AND again at the commit,
because the board can move between them. An unknown or malformed `promiseId` is rejected at
conversion with `ENGINE_REJECTED`, matching the four existing families, since an accepted `ok:false`
quote is reserved for a real engine verdict.

**A2 (HIGH) — §6's "excluded twice over" is WRONG and is withdrawn.** `settle` writes
`outcomeEventId: next.outcomeEventId ?? eventId` (`:706`), and `??` falls through on null, so
`waivePromise`'s `outcomeEventId: null` (`:1006`) stores the real receipt id. B.7's group7 test
already proved it by finding the receipt through that very field. The Industry exclusion rests on
ONE guard, the outcome enum at `bridge/industry.ts:148`; the `outcomeEventId !== null` clause beside
it is vacuous for every settled promise. The exclusion still holds. The claimed second guard never
existed. Checked and confined: the phrase appears in no published record, only in this draft.

**A3 (HIGH) — §4 item 4 was a one-line placeholder; the bump's real obligations are:** the constant
(`bridge-schema.ts:258`); the outgoing identity `sha256:60af24c5…` registered as `projection-v49` in
`SUPPORTED_PRIOR_PROTOCOL_4_SCHEMA_IDS` (`bridge/runtime-checkpoint.ts:59`) IN THE SAME COMMIT;
`bridge/schema/project-studio-bridge.schema.json` (`$id` and `x-project-studio.projectionVersion`);
`generated/unity/StudioBridgeDtos.Generated.cs`; and
`generated/unity/project-studio-bridge.contract-manifest.json`. All three generated artifacts are
asserted against the running identity by `tests/bridge-p14b5-relationships.test.ts:308-319`, which
also pins `SCHEMA_ID` to the outgoing literal at `:292` and the prior-id set exactly at `:295` and
`:342`. THIRTY test files contain `PROJECTION_VERSION).toBe(49)` or a `projection-49` URN (counted,
not estimated). `SCHEMA_ID` is a content hash over the whole schema document
(`bridge/protocol.ts:35`), so the new field and the new quote family mint a new identity even before
the constant moves, and `validateVersionedRecord` (`:88-95`) strands every checkpoint written under
an unregistered identity.

**A4 (HIGH) — a sixth change: a new `AVAILABLE_INTENT_KINDS` member.** `quotedIntentFor` copies
`kind: pending.kind` into the intent option (`bridge/session.ts:1630`), and that field is typed from
`enumeration(AVAILABLE_INTENT_KINDS)` (`bridge/schema/intent-schema.ts:60`). The list holds 25
members and none fits a waiver; reusing `marketProposalAction` would mislabel the commit. It is
pinned by an exact `toEqual` at `tests/bridge-p14b2-trust.test.ts:141-145`, so adding a member breaks
that test by design. `StudioBridgeQuoteRequest` and the `quote()` overload set widen with it.

**A5 (HIGH) — §7 T0b's hypothesis is FALSE, and the audit's own remedy is also shut.** Both settled
by measurement at record 747, not by argument. The window was never the constraint; `existingPath`
is, and the audit derived that correctly from the constants before the parent measured it. The
audit's recommended remedy, one commissioned screenplay to raise `unproducedScripts`, does not work:
`commissionScript` throws `screenplay development is not managed`, `unproducedScripts` returns 0
outright unless the mode is `managed` (`:239-245`), and that mode is set at world construction by no
action. The other lever is shut by M16 exclusivity. The audit's two predictions about FRAGILE were
both measured CORRECT: `attachPromise` admits it, and the freeze then refuses to bind it.
`genuine-v32-owes-two-p1` was minted at count 2 / progress 0 / remaining 2 instead, and the audit's
two conditions on the mint were adopted in full. The audit's objection to that substitution is
recorded and overruled in 745-C §5: the discrimination it worried about is already pinned by
group13 on `part-served-p1` and proven by injection at 743, and M16 caps count at 2 so no single
world can carry both properties.

**A6 (MODERATE) — Trap 1 is qualified.** Its last sentence, "the commit path calls `waivePromise`",
stops too soon. `caught` (`bridge/session.ts:365-371`) returns the raw `error.message`,
`executeCommand` makes it `ENGINE_REJECTED` and `reject` publishes it unchanged, so a substitute
accepted at quote time and refused at commit time ships `promises: this person did not accept the
substitute — …` to the player, the exact namespaced string Trap 1 forbids. The commit arm re-asks
`waiverAccepted` inside `quotedIntentFor` and returns curated copy, as all four other families do
(`:1656-1689`).

**A7 (MODERATE) — T0a and T0b are both DONE.** §8 begins at step 3. `genuine-projection49-runtime`
is minted, committed and published (`4cba7090`); `genuine-v32-owes-two-p1` likewise (`6d93e62c`).
Neither is byte-reproducible, so neither may be re-minted: a re-run orphans every hash its manifest
records.

**A8 (MODERATE) — the unoffered-family jargon, DECIDED rather than deferred.** Reusing the market
wire draft would let `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and `SPECIFIC_PROJECT` reach
`NOT_OFFERED_IN_B1` and publish *a directing promise is not offered in this slice* to a player.
DECISION: the waiver quote gets its OWN draft payload whose `family` enumerates only the families
this surface offers, so the jargon is unreachable by construction and no curated substitute copy is
needed. This is an interface decision inside the slice, not a product choice: it removes no
behaviour a player could previously obtain, because the engine already refuses all three. A client
naming an unoffered family gets `INVALID_COMMAND`, which is the honest answer to asking a surface
for something it does not have. The identical sentences already reachable through
`promiseQuoteSnapshot` on the market-proposal surface are PRE-EXISTING and are not B.8's to fix;
recorded, with no owner claimed.

**A9 (MODERATE) — §3(b) is imprecise and is corrected.** The join already exists on the wire as free
text: `waivePromise` writes the successor id into `outcomeCause` (`:1005`), `promiseHistoryFor`
projects it verbatim, and `bridge/trust.ts:83-86` publishes it into the attention row, where
`tests/bridge-p14b7-promise-waiver.test.ts:177` pins the exact string. B.8 must not rewrite that
copy. What is missing is the TYPED link, which is what §4 item 3 adds. The derivation rule, now
stated so no consumer parses prose: a row's substitute is the row whose `promiseId` equals this row's
`supersededByPromiseId`; a row's predecessor is the row whose `supersededByPromiseId` equals this
row's `promiseId`; never parse `outcomeCause`. Trap 3 is untouched and the tension is only apparent:
Trap 3 forbids the QUOTE predicting the id, while the RECORD states it as a fact afterwards.

**A10 (LOW) — citation drift.** §3(c): FOUR families implement refusal-as-an-accepted-answer in
`session.ts` (placement `:1782-1789`, Set `:1815-1820`, contract `:1846-1851`, market proposal
`:1912`); commission and casting reject at conversion instead, and `promiseQuoteSnapshot` is a
sub-verdict of the market-proposal family living in `bridge/promises.ts:125-148`, not a fifth family.
The `quote()` method runs to `:1967`. §4 item 2: `quotedIntentFor` is `:1625-1694`. §4 item 3:
`promiseDraftTerms.count` is `:1799`, not `:1798`; Trap 4's substance is unaffected.

**Ruled and adopted from §9's open row:** the inverse link is NOT added. The derivation is total
because `waivePromise` copies the three fields `promiseHistoryFor` filters on, and the carrier is
unpaged. Two conditions ride with it: the derivation rule above is recorded, and the RED asserts
co-presence of both rows on all three carriers, so "derivable" stays a fact rather than a hope. One
ordering note for the C# reader: `promiseHistoryFor` ends with `.reverse()`, so the SUBSTITUTE
appears BEFORE the waived original.

**Also adopted from §10:** completion condition 8 costs a test, not code, and condition 7's proof
includes `bridge/session.ts:2054`, which clears `pendingQuotes` on load, so a quote minted before a
save can never be committed after a reload. The conversion cascade's unguarded final `else` is
compile-safe and must not be "fixed" defensively.

**A11 (from the audit's second pass) — the ACCEPT path is already measured; the concern was
INFERRED and is refuted by the artifact.** The owes-two provenance records
`substituteCountAccepted: 2`, `acceptanceIsNull: true` at `measuredAtWeek: 104`, and the fixture's
own week is 104, so a test waiving at `state.market.tick` waives at the measured week. The auditor's
guessed mechanism (that the throwaway greenlight is cancelled after the freeze, dropping
`existingPath`) does not apply: the archived route cancels it to free the target for a focus
production, and this minter stops at the freeze and never cancels it. The throwaway stays active and
keeps supplying `seatedPreFirstTake = 1`, which is exactly why a count-2 substitute is accepted
rather than FRAGILE. LOAD-BEARING: an edit that cancels the throwaway would silently remove the
accept case.

**A12 (parent decision) — `StudioMarketPromiseHistoryRow` gains `progress: nonNegativeInteger()`.**
The row carries `count` but not `progress`, so a player sees "count 2, open" and cannot tell how
many pictures are still owed before drafting a substitute; the refusal sentence would be their only
oracle. Completion condition 1 requires them to PROPOSE, not to guess. The field rides the same
projection bump, on the same row, through the same single write site, so it costs nothing extra, and
it discloses only a fact about the viewing studio's own promise on a row already scoped to that
studio. The audit recommended recording the friction instead of fixing it, as scope expansion; that
caution is overruled and the reasoning is recorded at 745-C §12 for the Owner to reverse on one line.

**A13 (for the RED author) — rule ordering on the owes-two fixture.** A count-1 substitute reaches
rule 7 only if rules 1 through 6 all pass. The RED must hold family and seat class EQUAL to the
original and vary ONLY the count: a P2 substitute against a P1 original fires rule 6 (the seat-mask
strength test) first and masks rule 7 entirely.

**Scope correction to A5's disclosed gap.** The audit asked whether B.7's core suite already pins
rule 7's `- progress` term directly. It does: group13 runs both directions on
`genuine-v31-part-served-p1`, proven by injection at 743. The disclosed gap is therefore confined to
the PLAYER SURFACE, not the law, and is recorded at that narrower scope.

**A13 IS WRONG AS WRITTEN AND IS CORRECTED HERE.** A13 claimed "a P2 substitute against a P1
original fires rule 6 (the seat-mask strength test) first and masks rule 7 entirely." The direction
is inverted. Rule 6 (`src/core/promises.ts:943-946`) tests whether every slot of the SUBSTITUTE is
inside the PROMISED mask. A P1 original's mask is every slot (`promiseCastSlots` returns
`CAST_SLOTS` for a count-only predicate, `:609-614`), so a P2-lead substitute's `['lead']` IS a
subset and rule 6 PASSES. The refusal fires in the opposite case: a P1 substitute offered against a
P2-lead original, whose extra slots are not in `['lead']`.

Measured by the RED author on the owes-two fixture and confirmed by the parent reading the source: a
P2-lead count-1 substitute REACHES rule 7 and returns the Owner's own sentence; a P2-lead count-2
substitute diverts to rule 9 (`needs a picture not yet commissioned`) on the `existingPath` ceiling.

A13's ADVICE still binds, for a different reason than the one it gave. Hold family and seat class
equal and vary only the count, because the P2 route cannot express the ACCEPT half of the pair. A
reader who believed A13's stated mechanism would have concluded the P2 family is untestable against a
P1 original and dropped it, which would have cost real coverage. Recorded as a parent error found by
the test author, not as a clarification.
