# 745-C — independent audit of the P14B.8 expansion, and the parent's verification of it

Auditor: `contract-auditor` specialist, Read/Glob/Grep only, no shell, no git, no test execution.
Document audited: `744-b8-waiver-surface-expansion.md` at its first draft. Source read at
`4a268feb`.

**Verdict: PROCEED WITH AMENDMENTS.** Ten required amendments: four HIGH, four MODERATE, two LOW.
Nothing requires abandoning the slice. The completion condition survives; two of its supporting
claims do not.

A process note that belongs in the record: the auditor was briefed to write this file itself and
could not, because its tool set is read-only. That was the parent's error in dispatch, not the
specialist's. Its report came back as text and the parent transcribed it here, then verified every
HIGH finding against the source independently. Each finding below carries BOTH the auditor's claim
and what the parent measured or read, because a specialist's report is evidence, not a verdict.

---

## The ten required amendments

1. **Add the ownership gate** (HIGH). A fifth item in §4: the bridge refuses a `promiseId` whose
   `issuerStudioId` is not the player's studio, at quote and again at commit.
2. **Correct §6's "excluded twice over"** (HIGH). A waived promise carries a NON-NULL
   `outcomeEventId`. One guard excludes it from the public fold, not two.
3. **Restate §4 item 4's projection obligations in full** (HIGH). The 49 → 50 bump has six named
   artifacts and about thirty test files pinning the outgoing literal. §4 named none of them.
4. **Name the new `AVAILABLE_INTENT_KINDS` member as a change** (HIGH). The commit arm cannot exist
   without it, and the list is pinned by an exact `toEqual`.
5. **Rule §7 T0b's hypothesis FALSE and restate it** (HIGH). The window is not the constraint;
   `existingPath` is.
6. **Correct Trap 1 for the commit path** (MODERATE). A thrown `waivePromise` refusal reaches the
   player verbatim through `caught` and `reject`, namespace prefix and all.
7. **Record T0a as DONE** (MODERATE), not as work to be scheduled.
8. **Disclose the unoffered-family jargon in the published refusal** (MODERATE). Three catalogue
   families the wire admits produce "not offered in this slice" as player-facing copy.
9. **Record that the raw substitute id already reaches player copy** (MODERATE). §3(b) is
   imprecise; the attention row already names `promise-N` in prose and a test pins that string.
10. **Fix five line-citation drifts** (LOW), listed in §9 below.

---

## 1. The finding the draft missed: the waiver path has no ownership gate

**The auditor's claim.** Neither `waiverAccepted` nor `waivePromise` checks that the promise belongs
to the player's studio, so a bridge client naming a rival's `promise-N` waives the rival's promise
and binds a substitute onto the rival's employment contract.

**PARENT VERIFIED, by reading the source directly.** `waiverAccepted` (`src/core/promises.ts:917-959`)
contains exactly one occurrence of `issuerStudioId`, at `:951`, and it is an ARGUMENT passed into
`trustDescriptor` — the rival's own trust record, evaluated on the rival's behalf. There is no
comparison against any player identity anywhere in the function. `waivePromise` (`:980`) resolves the
promise by id alone: `state.promises.find((p) => p.promiseId === draft.promiseId)`.

The exposure is specific and it is B.8's to close, not a pre-existing defect being discovered late.
Today no client can reach `waivePromise` at all, because there is no bridge route; B.8 creates the
route. The promise id is `promise-${state.promises.length}`, sequential and dense, so enumeration is
trivial. The quote would look lawful, because the rival's pipeline and the rival's trust both
evaluate normally. On confirm the rival's open promise settles WAIVED with a substitute bound to the
rival's contract. `trustDrivers` mints nothing for WAIVED, so the rival's trust does not move, and
the viewer-scoped read models filter the rows out, so the player never sees what they did.

Every other bridge write forces the player's identity rather than trusting the payload:
`playerProposalDraft` (`bridge/contract.ts:585-593`) sets `issuerStudioId` from
`state.hollywood?.playerStudioId`, and `bridge/session.ts:1900` states the law outright. The waiver
has no such field to force, because the issuer arrives implicitly through the promise id.

**Consequence for §4.** A fifth change: resolve the promise, refuse it when `issuerStudioId` is not
the player's, and re-check at commit because the board can move between quote and confirmation. §2's
completion condition 1 already requires the interaction to work "without any client constructing
engine state"; naming a rival's promise is exactly that.

**A second decision §4 must make.** `waiverAccepted` requires the promise object and has no sentence
for an unknown or malformed id. The four existing quote families reject a non-convertible draft with
`ENGINE_REJECTED` at conversion and reserve an accepted `ok: false` for a real engine verdict. §4
must say which of the two an unknown `promiseId` gets.

## 2. The claim in the draft that is false about the code

**The auditor's claim.** §6 said a waiver is "excluded twice over" from the public Industry fold,
because `waivePromise` settles with `outcomeEventId: null`. The second half is wrong.

**PARENT VERIFIED.** `settle` writes `outcomeEventId: next.outcomeEventId ?? eventId`
(`src/core/promises.ts:706`). `??` falls through on `null`, so a caller cannot force null.
`waivePromise` passes `outcomeEventId: null` at `:1006` and the row therefore stores the receipt id
minted at `:702`. B.7's own suite proves it: `tests/p14b7-promise-waiver.test.ts:593-604` finds the
receipt by `r.eventId === waived.outcomeEventId` and requires it to be defined.

So `bridge/industry.ts:148` excludes the waiver by ONE guard, the outcome enum test, and the
`outcomeEventId !== null` clause on the same line is vacuous for every settled promise. The
exclusion holds; the belief that a second guard backs it up is a safety margin that does not exist.

**Scope of the error, checked.** The parent grepped records 742, 743 and the Unity backlog: the
"excluded twice over" phrasing appears in none of them. The error is confined to this session's
draft 744 and is corrected before any checkpoint carries it.

## 3. The projection bump's real cost

**The auditor's claim.** §4 item 4 read, in full, "the projection bump, 49 to 50, with the T0
ordering in §7", which understates the work by an order of magnitude.

**PARENT VERIFIED.** The bump must move, at minimum:

| obligation | site |
| --- | --- |
| the constant | `bridge/schema/bridge-schema.ts:258` |
| the outgoing identity registration | `bridge/runtime-checkpoint.ts:59`, a new `['sha256:60af24c5…', 'projection-v49']` entry, in the same commit as the bump |
| the checked-in JSON contract | `bridge/schema/project-studio-bridge.schema.json` (`$id` and `x-project-studio.projectionVersion`) |
| the C# DTOs | `generated/unity/StudioBridgeDtos.Generated.cs` (schema-identity header, the history-row class, the new quote types, the new intent-kind value class) |
| the contract manifest | `generated/unity/project-studio-bridge.contract-manifest.json` |

All three generated artifacts are asserted against the running identity by
`tests/bridge-p14b5-relationships.test.ts:308-319`, which the parent read: it requires
`schemaJson.$id` to equal `urn:project-studio:bridge:protocol-4:projection-${PROJECTION_VERSION}`,
the manifest to match `{schemaId, projectionVersion}`, and the `.cs` header to contain
`// Schema identity: ${SCHEMA_ID}`.

Beyond those, the same file pins `SCHEMA_ID` to the literal `sha256:60af24c5…` at `:292` and asserts
the prior-id set exactly at `:295` and `:342`. The parent counted **30 test files** containing
`PROJECTION_VERSION).toBe(49)` or a `projection-49` URN. The auditor listed about two dozen by name
and correctly noted it could not say which actually fail, having run nothing.

**Why this matters beyond bookkeeping.** `SCHEMA_ID = schemaIdentity(BRIDGE_SCHEMA)`
(`bridge/protocol.ts:35`) is a content hash over the whole schema document, so the identity moves the
instant any `$defs` member changes, whether or not the version constant moves. The new field and the
new quote family alone mint a new identity. `validateVersionedRecord` (`bridge/protocol.ts:88-95`)
rejects any envelope whose `schemaId` differs from the running one, so an unregistered outgoing
identity strands every durable checkpoint written under it. The registration is not optional and
must ride the same commit as the bump.

## 4. The change §4 did not list at all

**The auditor's claim.** The commit arm needs a new member of `AVAILABLE_INTENT_KINDS`.

**PARENT VERIFIED.** `quotedIntentFor` copies `kind: pending.kind` straight into the intent option
(`bridge/session.ts:1630`); the option's `kind` is typed from `enumeration(AVAILABLE_INTENT_KINDS)`
(`bridge/schema/intent-schema.ts:60`); the parent counted **25 members** and none fits a waiver.
`marketProposalAction` would mislabel the commit. The list is pinned by an exact `toEqual` at
`tests/bridge-p14b2-trust.test.ts:141-145`, which the parent read in full, so adding a member breaks
that test by design.

Also unlisted and mechanical: `StudioBridgeQuoteRequest` is a closed union that a
`quoteWaivePromise` request widens, and the `quote()` overload set (`bridge/session.ts:1757-1763`)
gains a signature.

## 5. T0b: the hypothesis is FALSE, and the auditor's remedy is also shut

**The auditor's ruling.** §7 T0b's hypothesis is false. The 90-week window is not the constraint and
is not close: by paper calculation from the constants, `nMax = 11`, `promiseBuffer(11) = 3`, leaving
8 spare against X=3, and the slack test passes by 69 weeks against a required 8. The binding
constraint is `existingPath` (`src/core/promises.ts:429-431`, refused at `:440-442`). The auditor
recommended raising it with one commissioned screenplay via `unproducedScripts`, and explicitly
labelled its own ruling "a paper calculation from the constants, not a measurement".

**PARENT MEASURED, and the ruling is confirmed while the remedy is refuted.** Record 747 carries the
full measurement. The hypothesis is false exactly as the auditor derived, and the bottleneck string
is the one it named: `needs a picture not yet commissioned`. The recommended remedy does not work:

- `commissionScript` throws `script development: commission rejected — screenplay development is not
  managed` on this world. `unproducedScripts` (`src/core/promises.ts:239-245`) returns 0 outright
  unless `development.mode === 'managed'`, and the parent grepped for a route that sets that mode:
  it is set at world construction, by no action. Every fixture in this corpus is built on
  `p13aGeneratedStudio`, which is unmanaged. The lever is shut for the corpus, not merely unused.
- The other lever is shut by a product law. Two productions seating the same person refuse with
  `talent "t-act-09" is already engaged in an active production (exclusivity, M16)`, so
  `seatedPreFirstTake` for one beneficiary is capped at 1. The auditor independently reached the
  same conclusion by a different route, noting that a second running picture also zeroes the stock
  greenlight door.
- The auditor's prediction that `attachPromise` does not refuse FRAGILE is CORRECT and was measured:
  the attach succeeds and the promise is minted. Its prediction that the freeze then drops it is
  also CORRECT and was measured: `contractId` comes back null, `employmentResolves` false.

**Where the parent overrules the auditor, and why.** The auditor said the count-2 / progress-0
alternative "must not be substituted", because at progress 0 the rule reads `count - progress ==
count` and cannot distinguish "still owed" from "promised". That reasoning is sound in isolation and
wrong in context: the discrimination is ALREADY pinned, on `genuine-v31-part-served-p1` (count 2,
progress 1) by group13 of `tests/p14b7-promise-waiver.test.ts`, and both directions of it were proven
by defect injection at record 743. What the corpus lacked, and what the Owner's B.8 direction asked
for, is a world where a POSITIVE substitute count is still insufficient. Those are two different
protections and they need two different worlds.

The full space is bounded by the measurement: count is capped at 2 by M16, so `(count, progress)` can
be `(2,0)` giving remaining 2, or `(2,1)` giving remaining 1. The pair of fixtures covers both axes.
A single world covering both at once needs count 3, which is measured shut. `genuine-v32-owes-two-p1`
was minted accordingly and PROVES its case rather than claiming it: the minter measured both
directions on the live engine before writing a byte, and re-measured the refusal on the state read
back from disk.

**The auditor's two conditions on the mint were adopted.** It required the mint to assert its
components explicitly and fail loud rather than assume the total, and to confirm the promise is still
bound after the freeze. The minter does both: it asserts `REASONABLY_ACHIEVABLE` at the attach, runs
`binding()` after the freeze (which cross-checks the employment record, the studio, the talent, the
start week and the settled market receipt), and asserts the resulting count, progress, remaining,
null link and empty evidence refs.

## 6. Trap 1 is right about the quote and incomplete about the commit

**The auditor's claim.** Trap 1 correctly forbids catching `waivePromise` in the quote path, then
stops too soon: `caught` (`bridge/session.ts:365-371`) returns the raw `error.message`,
`executeCommand` turns it into `ENGINE_REJECTED` (`:1588-1591`), and `reject` (`:2093-2102`)
publishes it unchanged. So a substitute accepted at quote time and refused at commit time reaches
the player as `promises: this person did not accept the substitute — <reason>`, which is exactly the
namespaced string Trap 1 forbids, delivered on a different path.

Every other family curates that moment instead (`bridge/session.ts:1656-1689`). §4 item 2 already
asks for "the fail-closed revalidation arm every other family has"; Trap 1 must be qualified to
match, so the writer re-asks `waiverAccepted` inside `quotedIntentFor` and returns curated copy
rather than relying on the throw.

## 7. Copy that is unsafe to publish verbatim

Completion condition 2 requires the engine's refusal sentence verbatim. Two of the nine are not safe
as player copy.

**(a) Developer-slice vocabulary, reachable today.** If the substitute reuses the existing wire draft
payload, `COUNT_ONLY_PROMISE_FAMILIES` admits `DIRECTING_COUNT`, `PREFERRED_GENRE_OPPORTUNITY` and
`SPECIFIC_PROJECT`. Each is refused by `NOT_OFFERED_IN_B1` inside `promiseFeasibility`. Walking
`waiverAccepted`'s rule order for a `DIRECTING_COUNT` substitute against a P1 original, rule 9 fires
and publishes: *what remains of the contract cannot reasonably carry the substitute, a directing
promise is not offered in this slice*. "in this slice" is build vocabulary shipped to a player.
Either the wire narrows the substitute's family domain, which moves no law, or the record discloses
the copy defect and names its owner. §5 must decide, because "verbatim" is a completion condition
and this is what verbatim yields. Partly pre-existing: `promiseQuoteSnapshot` already publishes the
same three sentences on the market-proposal surface, and that one is not B.8's to fix.

**(b) A raw enum in a sentence.** Rule 1 interpolates `promise.outcome` (`:928`): "this promise
already settled WAIVED, and a terminal outcome is never rewritten". Minor, but it is an engine token
in prose.

**(c) Dead fallback, no action.** Rule 9's `?? feasibility.classification` can never fire, because
`receipt()` sets `bottleneck: null` only on the branch the guard above already excluded. No
classification token can reach a player through this path.

## 8. The inverse link: do NOT add it, with two conditions

**The auditor's ruling, which the parent adopts.** Leave `supersedesPromiseId` off the wire.

The derivation is TOTAL, not merely usually possible: `waivePromise` copies `issuerStudioId`,
`beneficiaryPersonId` and `contractId` from the original onto the substitute
(`src/core/promises.ts:1015-1026`), and `promiseHistoryFor` filters on exactly those three and
nothing else, so the substitute passes or fails the filter identically to the original, always. The
carrier is documented as unpaged, which matters: a paged carrier could split the pair and would force
the field. The C# cost is one pass over an array the DTO already holds, per person, unpaged. Against
that, a second field is a permanent two-way consistency invariant to hold and to test, for no
capability the consumer lacks. Adding it would also be the bridge deriving a promise fact of its
own, which that module's own stated law forbids.

**Condition 1.** §9 states the derivation rule in one line: a row's substitute is the row whose
`promiseId` equals this row's `supersededByPromiseId`; a row's predecessor is the row whose
`supersededByPromiseId` equals this row's `promiseId`. And never parse `outcomeCause`.

**Condition 2.** The RED asserts co-presence on all three carriers, so the derivation cannot silently
become impossible if a carrier is later paged or re-filtered. That test is what makes "derivable" a
fact rather than a hope.

**An ordering note for the C# reader.** `promiseHistoryFor` ends with `.reverse()`, newest mint
first, so the SUBSTITUTE appears BEFORE the waived original. A consumer rendering top-down meets the
replacement before the thing it replaced.

**A correction to §3(b) that follows from this.** The draft said "Nothing on the wire says the second
replaced the first." Imprecise. `waivePromise` writes the cause as prose naming the successor id
(`:1005`), `promiseHistoryFor` projects `outcomeCause` verbatim, and `bridge/trust.ts:83-86`
publishes it into the attention row. The join already exists on the wire as free text, and the raw
engine id is already player-visible. That strengthens the case for the typed field, because otherwise
a consumer is tempted to parse the sentence. It also means B.8 must not quietly rewrite that copy:
`tests/bridge-p14b7-promise-waiver.test.ts:177` pins the exact string. Note the tension with Trap 3,
and that it is only apparent: Trap 3 forbids the QUOTE naming the substitute's future id, which is a
prediction; the RECORD naming it afterwards is a fact.

## 9. Line-citation drift, and what was correct

**Correct as cited, verified by the auditor line by line:** `bridge/promises.ts:93-118`;
`bridge-schema.ts:1770`; `bridge-schema.ts:2320` and its three carriers at `:2410`, `:2523`, `:2650`;
`src/core/types.ts:2296-2302`; `session.ts:1562`, `:1628`, `:1613`, `:1560`; `promises.ts:992` and
`:917`; `promises.ts:954-957`; `promises.ts:999`; `industry.ts:148`; `promises.ts:1080-1085`;
`runtime-checkpoint.ts:59`; `bridge-schema.ts:2062`.

**Drifted:**

1. §3(c) "five families in `bridge/session.ts:1764-1950`". Four families implement
   refusal-as-an-accepted-answer in `session.ts`: placement (`:1782-1789`), Set commission
   (`:1815-1820`), contract (`:1846-1851`), market proposal (`:1912`). Commission and casting have no
   such arm; both reject at conversion. The fifth item, `promiseQuoteSnapshot`, lives in
   `bridge/promises.ts` and is a sub-verdict of the market-proposal family, not a family. The method
   runs to `:1967`, not `:1950`.
2. §3(c) `bridge/promises.ts:125-150` for `promiseQuoteSnapshot`. The function is `:125-148`.
3. §4 item 2 `session.ts:1618-1690` for `quotedIntentFor`. The function is `:1625-1694`.
4. §4 item 3 `bridge-schema.ts:1798` for `promiseDraftTerms.count`. `:1798` opens the object;
   `count: integer({ minimum: 1 })` is `:1799`. Trap 4's substance is correct.
5. §6's WAIVED-mints-no-driver citation is right, but the better citation is B.7's own group12
   comment, which makes the point about the loop guard explicitly.

## 10. Checked and clean

Stated plainly, because a clean category is a result.

- **`IntentApplication` fits the waiver.** The shape is `{option, apply}`; a waiver commit is
  `apply: (current) => caught(() => ({ok: true, next: waivePromise(current, draft)}))`. Nothing about
  the signature or the throw breaks the pattern.
- **The conversion cascade's unguarded final else is compile-safe.** A new `PendingQuote` member
  without a branch routes to `contractDraftToEngine`, which rejects the widened union at compile
  time. A type error, not a silent misroute. Worth one line in §5 so the writer does not "fix" it
  defensively.
- **Exactly one site constructs the history row**, so the new field has one write site.
- **No `ui/` consumer** of the promise history row. §9's exclusion of the React surface to FU-1 is
  honest and costs the completion condition nothing.
- **§3(d)'s four protections all reproduce at the cited lines**, and its conclusion that B.8 proves
  rather than builds them is endorsed.
- **§9's exclusions are honest**, each checked against the completion condition. The Unity exclusion
  is honest as worded (native CONTROLS), with the caveat that the bump regenerates the C# DTOs
  regardless, which amendment 3 covers.
- **Save and reload (condition 8) is already satisfied by V32** and costs a test, not code. The field
  is on the persisted row; V31 → V32 opens it null; the V32 → V31 downgrade refuses a non-null link
  rather than dropping it; `validateWaivedPromiseLinks` enforces the invariants on load; the
  checkpoint's live slots are V32 saves; and the projection is re-derived from state on every
  snapshot. One behaviour should be named as the PROOF of condition 7 rather than reimplemented:
  `bridge/session.ts:2054` clears `pendingQuotes` on load, so a quote minted before a save can never
  be committed after a reload.
- **§5 Trap 5's fixture claim holds.** The auditor could not decompress the fixtures with its tool
  set and corroborated the claim from the producing minters instead, reaching the same maximum
  remaining obligation of 1. The parent had already decompressed all nine directly.

## 11. Consequence for the slice

T1 must not start against the first draft. Four amendments change what the RED asserts: the ownership
refusal (a new refusal case with no engine sentence behind it), the commit-time curated copy, the
co-presence assertion on all three carriers that licenses leaving the inverse link off, and T0b's
world shape.

**Evidence limits, carried forward.** The auditor ran nothing: no tests, no shell, no git. Every
claim of its own is a static read or a labelled paper calculation. It could not confirm which of the
projection-49 pins actually fail under a bump, and neither can the parent until the bump runs. Its
T0b arithmetic was superseded by measurement, in the direction it predicted for the ruling and
against it for the remedy.

LOGIC VERIFIED, UNITY NOT VERIFIED. This audit is acceptance of nothing.

---

## 12. The audit's second pass, and the parent's answers

The auditor was resumed with the T0b measurement and returned a revised report: eleven amendments
instead of ten, with two revised and one added. Recorded here.

**It retracted its own remedy and downgraded its own objection, unprompted.** "My recommendation to
commission one unproduced screenplay is retracted… My remedy was arithmetic the engine does not
permit." And on the count-2 substitution: "The parent's substitution is the right call. The
objection survives only as a disclosed coverage gap." Both retractions are accepted and the record
stands as written in §5 above.

**A11 (new, MODERATE) — "the accept path has no measured world". ALREADY DISCHARGED, and the
auditor said so was INFERRED.** Its concern: completion condition 3 needs a world where a substitute
is ACCEPTED, and it believed only the refusal had been measured. It further guessed a mechanism —
that the archived route cancels the throwaway greenlight after the freeze (`722:275-277`), which
would drop `existingPath` to 1 by the waiver week and make every count-2 substitute FRAGILE.

Both halves are refuted by the artifact, which postdated the auditor's read and which it correctly
flagged as unverified:

- The accept case WAS measured, on the same world, at the same week the fixture sits at. The
  provenance records `substituteCountAccepted: 2`, `acceptanceIsNull: true`, `measuredAtWeek: 104`,
  and the fixture's own `week` is 104. A test loading the fixture and waiving at
  `state.market.tick` waives at exactly the measured week.
- The guessed mechanism does not apply, and the reason is the very thing that makes this fixture
  different from `part-served-p1`. The archived route cancels the throwaway because it needs the
  target free to be greenlit again for the focus production. **This minter stops at the freeze and
  never cancels it**, so the throwaway is still active at week 104 and still supplies
  `seatedPreFirstTake = 1`. That is why the count-2 substitute is accepted rather than FRAGILE.
  Recorded because it is load-bearing: a later edit that cancels the throwaway would silently take
  the accept case away.

**A12 (parent decision) — the history row gains `progress`.** The auditor noticed a real usability
hole and then recommended against fixing it as scope expansion: `StudioMarketPromiseHistoryRow`
carries no `progress` member, so a player sees "count 2, open" and cannot tell how many pictures are
still owed before drafting a substitute. They would learn the remainder only by being refused.

The parent overrules that caution and adds the field. Completion condition 1 requires a player to
PROPOSE a substitute; a player who cannot see the remaining obligation proposes by trial and error,
and the refusal sentence becomes a guessing oracle rather than an explanation. The field rides the
same projection bump, on the same row, with the same single write site, so it costs nothing extra;
it removes no behaviour; it discloses only a fact the viewing studio's own promise already holds
about itself, on a row already scoped to that studio. Recorded as a decision rather than a question,
and reversible on one line if the Owner disagrees.

The auditor's related observation stands and is worth keeping: on a progress-0 world the refusal
sentence and the promised count agree numerically, so this friction is invisible in the only fixture
B.8 has. That is an argument for the field, not against it.

**Adopted from the second pass, for the RED author.** Rule ordering on the owes-two fixture: a
count-1 substitute reaches rule 7 only if every earlier rule passes, so the RED must hold family and
seat class EQUAL to the original and vary only the count. A P2 substitute against a P1 original
fires rule 6 first and masks rule 7 entirely.

**Answered, one item the auditor left open.** It asked whether B.7's core suite already pins rule
7's `- progress` term directly, and said it had not checked. It does: group13 of
`tests/p14b7-promise-waiver.test.ts` runs both directions on `genuine-v31-part-served-p1` (count 2,
progress 1, remaining 1), and both were proven by defect injection at record 743. So the disclosed
gap is confined to the PLAYER SURFACE, not to the law, and it should be recorded at that narrower
scope.

**Its §9 exclusions table returned all six HONEST**, with one caveat already covered by amendment 3:
the projection bump regenerates `generated/unity/StudioBridgeDtos.Generated.cs` regardless, so B.8
does write into `generated/unity/` even though native CONTROLS stay deferred.
