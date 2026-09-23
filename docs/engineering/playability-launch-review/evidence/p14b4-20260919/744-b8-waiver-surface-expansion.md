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
